import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { questionManager } from '../utils/questionManager'
import { assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'
import { analytics } from '../utils/analytics'
import { usePageTracking } from '../hooks/useAnalytics'
import AIHintPanel from '../components/AIHintPanel'

const Assessment = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [assessmentInfo, setAssessmentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [assessmentStartTime, setAssessmentStartTime] = useState(null)

  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  
  // Load questions based on assessment type
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true)
        console.log('🔄 Loading questions for assessment type:', type)
        
        if (!user) {
          console.log('👤 No user logged in')
          setQuestions([])
          setLoading(false)
          return
        }

        // Check if this is a UUID (custom assessment)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(type)
        console.log('🔍 Is UUID?', isUUID)
        
        if (isUUID) {
          // Load custom assessment info first
          console.log('🔍 Loading custom assessment types for user:', user.id)
          const { data: customTypes, error: typesError } = await assessmentTypesService.getUserAssessmentTypes(user.id)
          console.log('📋 Custom types response:', { customTypes, typesError })
          
          const customType = customTypes?.find(ct => ct.id === type)
          console.log('📋 Found custom assessment type:', customType)
          
          if (customType) {
            // Load questions from database using assessment name
            console.log('🔍 Loading questions for assessment name:', customType.name)
            const { questionsService } = await import('../services/database')
            const { data, error } = await questionsService.getUserQuestions(user.id, customType.name)
            
            console.log('📊 Database response:', { data, error, assessmentName: customType.name })
            
            if (error) {
              console.error('❌ Error loading custom questions:', error)
              setQuestions([])
            } else {
              console.log('📊 Raw database data:', data)
              // Transform database records to question format
              const questions = (data || []).map(record => {
                console.log('🔄 Transforming record:', record)
                return record.question_data
              })
              console.log('✅ Transformed questions:', questions)
              setQuestions(questions)
            }
          } else {
            console.error('❌ Custom assessment type not found:', type)
            console.log('Available types:', customTypes?.map(t => ({ id: t.id, name: t.name })))
            setQuestions([])
          }
        } else {
          // For built-in assessments (if any remain)
          console.log('📚 Loading built-in questions')
          const builtInQuestions = questionManager.getQuestions(type) || []
          setQuestions(builtInQuestions)
        }
      } catch (error) {
        console.error('❌ Error loading questions:', error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    
    loadQuestions()
  }, [type, user])
  
  // Track page visit
  usePageTracking(`Assessment - ${type}`)
  
  // Calculate dynamic time limit based on actual question count
  const getTimeLimit = (assessmentType, questionCount) => {
    const timePerQuestion = {
      coding: 3, // 3 minutes per coding question
      'system-design': 5, // 5 minutes per system design question
      frontend: 3, // 3 minutes per frontend question
      behavioral: 5, // 5 minutes per behavioral question
      personality: 0.5, // 30 seconds per personality question
      'ai-business-analyst': 5, // 5 minutes per AI business analyst question
      'ai-solution-architect': 5, // 5 minutes per AI solution architect question
      microservices: 4, // 4 minutes per microservices question
      'event-driven-architecture': 4, // 4 minutes per event-driven question
      'serverless-architecture': 3, // 3 minutes per serverless question
      'full-stack-development': 3, // 3 minutes per full-stack question
      'ap-physics-10th': 2 // 2 minutes per physics question
    }
    
    const minutesPerQuestion = timePerQuestion[assessmentType] || 3
    const totalMinutes = Math.max(5, Math.ceil(questionCount * minutesPerQuestion)) // Minimum 5 minutes
    return totalMinutes * 60 // Convert to seconds
  }

  const timeLimit = getTimeLimit(type, questions.length)

  useEffect(() => {
    loadAssessmentInfo()
  }, [type, user])

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && isStarted) {
      handleSubmit()
    }
  }, [timeLeft, isStarted])

  const loadAssessmentInfo = async () => {
    setLoading(true)
    
    // Check if this is a custom assessment type
    if (user) {
      try {
        const { data: customTypes } = await assessmentTypesService.getUserAssessmentTypes(user.id)
        const customType = customTypes?.find(ct => ct.id === type)
        
        if (customType) {
          setAssessmentInfo({
            name: customType.name,
            description: customType.description,
            isCustom: true
          })
        } else {
          // Default assessment type
          setAssessmentInfo({
            name: getDefaultAssessmentName(type),
            isCustom: false
          })
        }
      } catch (error) {
        console.error('Error loading assessment info:', error)
        setAssessmentInfo({
          name: getDefaultAssessmentName(type),
          isCustom: false
        })
      }
    } else {
      setAssessmentInfo({
        name: getDefaultAssessmentName(type),
        isCustom: false
      })
    }
    
    setLoading(false)
  }

  const getDefaultAssessmentName = (assessmentType) => {
    const names = {
      'coding': 'Programming Skills',
      'system-design': 'System Design',
      'frontend': 'Frontend Development',
      'behavioral': 'Behavioral Assessment',
      'personality': 'Personality Assessment',
      'ai-business-analyst': 'AI Business Analysis',
      'ai-solution-architect': 'AI Solution Architecture',
      'microservices': 'Microservices Architecture',
      'event-driven-architecture': 'Event-Driven Architecture',
      'serverless-architecture': 'Serverless Architecture',
      'full-stack-development': 'Full-Stack Development',
      'ap-physics-10th': 'AP Physics (10th Grade)'
    }
    return names[assessmentType] || assessmentType.replace('-', ' ')
  }

  const startAssessment = () => {
    const startTime = Date.now()
    setAssessmentStartTime(startTime)
    setIsStarted(true)
    setTimeLeft(timeLimit)
    
    // Track assessment start
    analytics.trackAssessmentStarted(type, assessmentInfo?.name || type)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = () => {
    const timeSpent = timeLimit - timeLeft
    const answeredQuestions = Object.keys(answers).length
    const totalQuestions = questions.length
    
    // Calculate score (simplified - you might want to implement proper scoring)
    const score = Math.round((answeredQuestions / totalQuestions) * 100)
    
    // Track assessment completion
    analytics.trackAssessmentCompleted(
      type, 
      assessmentInfo?.name || type, 
      score, 
      timeSpent, 
      totalQuestions
    )
    
    const results = {
      type,
      answers,
      questions,
      timeSpent: timeSpent,
      totalTime: timeLimit
    }
    
    localStorage.setItem('assessmentResults', JSON.stringify(results))
    navigate('/results')
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Loading assessment...</h2>
        <p>Please wait while we load your questions...</p>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Assessment not found</h2>
        <p>This assessment has no questions available.</p>
        <div style={{ 
          background: '#fff3cd', 
          padding: '16px', 
          borderRadius: '8px', 
          margin: '20px 0',
          textAlign: 'left'
        }}>
          <h4>Debug Information:</h4>
          <p><strong>Assessment ID:</strong> {type}</p>
          <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Assessment Info:</strong> {assessmentInfo ? JSON.stringify(assessmentInfo) : 'Not loaded'}</p>
          <p><strong>Questions Count:</strong> {questions.length}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Check browser console for detailed logs. If questions were uploaded but not showing, 
            there might be a mismatch between the assessment name used for saving vs loading.
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
        <button 
          onClick={() => navigate('/question-manager')} 
          className="btn btn-secondary"
          style={{ marginLeft: '12px' }}
        >
          Question Manager
        </button>
        <button 
          onClick={async () => {
            try {
              console.log('🧪 Direct database test...')
              const { questionsService } = await import('../services/database')
              
              // Test 1: Get all questions for user
              const { data: allQuestions, error: allError } = await questionsService.getUserQuestions(user.id)
              console.log('📊 All user questions:', { allQuestions, allError })
              
              // Test 2: Get assessment types
              const { data: assessmentTypes, error: typesError } = await assessmentTypesService.getUserAssessmentTypes(user.id)
              console.log('📋 Assessment types:', { assessmentTypes, typesError })
              
              // Test 3: Try to find the specific assessment
              const customType = assessmentTypes?.find(ct => ct.id === type)
              console.log('🎯 Target assessment:', customType)
              
              if (customType) {
                // Test 4: Get questions for this specific assessment
                const { data: specificQuestions, error: specificError } = await questionsService.getUserQuestions(user.id, customType.name)
                console.log('🎯 Questions for this assessment:', { specificQuestions, specificError, searchName: customType.name })
              }
              
              alert('Check console for detailed database test results')
            } catch (error) {
              console.error('❌ Database test failed:', error)
              alert(`Database test failed: ${error.message}`)
            }
          }}
          className="btn"
          style={{ 
            marginLeft: '12px',
            background: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffc107'
          }}
        >
          🧪 Test Database
        </button>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '24px' }}>
            {assessmentInfo?.name || type.replace('-', ' ')} Assessment
          </h1>
          {assessmentInfo?.description && (
            <p style={{ fontSize: '16px', color: '#5f6368', marginBottom: '16px' }}>
              {assessmentInfo.description}
            </p>
          )}
          
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>
              You are about to start the {assessmentInfo?.name || type.replace('-', ' ')} assessment.
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <strong>Questions:</strong> {questions.length}
              </div>
              <div>
                <strong>Time Limit:</strong> {Math.floor(timeLimit / 60)} minutes
              </div>
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '12px' }}>Instructions:</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Read each question carefully</li>
              <li>You can navigate between questions</li>
              <li>Your progress is automatically saved</li>
              <li>Submit before time runs out</li>
              <li>You cannot pause once started</li>
            </ul>
          </div>

          <button onClick={startAssessment} className="btn btn-primary" style={{ fontSize: '18px' }}>
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="container" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>
            {assessmentInfo?.name || type.replace('-', ' ')} Assessment
          </h2>
          <p style={{ margin: 0, color: '#5f6368' }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: showAIPanel ? '#f6d55c' : '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}
          >
            <HelpCircle size={16} />
            AI Help
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} />
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              color: timeLeft < 300 ? '#ea4335' : '#5f6368'
            }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom: '24px' }}>
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          {question.type === 'likert' ? (
            // Personality Assessment Question
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>
                  Statement {currentQuestion + 1}
                </h3>
              </div>
              
              <div style={{ 
                padding: '24px',
                background: '#f8f9fa',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '18px',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '500',
                  color: '#202124'
                }}>
                  "{question.statement}"
                </p>
              </div>
            </div>
          ) : (
            // Technical Assessment Question
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: 0 }}>{question.title}</h3>
                <span style={{ 
                  padding: '4px 12px',
                  background: question.difficulty === 'Easy' ? '#e8f5e8' : 
                             question.difficulty === 'Medium' ? '#fff3cd' : '#f8d7da',
                  color: question.difficulty === 'Easy' ? '#155724' : 
                         question.difficulty === 'Medium' ? '#856404' : '#721c24',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {question.difficulty}
                </span>
              </div>
              
              <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>
                {question.description}
              </p>
              
              {question.example && (
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  whiteSpace: 'pre-line'
                }}>
                  {question.example}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Answer Section */}
        <div>
          {question.type === 'multiple-choice' ? (
            <div>
              <h4 style={{ marginBottom: '16px' }}>Select the best answer:</h4>
              {question.options.map((option, index) => (
                <label 
                  key={index}
                  style={{ 
                    display: 'block',
                    padding: '12px',
                    margin: '8px 0',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: answers[question.id] === index ? '#e3f2fd' : 'white',
                    borderColor: answers[question.id] === index ? '#2196f3' : '#e0e0e0'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswer(question.id, index)}
                    style={{ marginRight: '12px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : question.type === 'likert' ? (
            <div>
              <h4 style={{ marginBottom: '16px' }}>How much do you agree with this statement?</h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px'
              }}>
                {[
                  { value: 5, label: 'Strongly Agree', color: '#4caf50' },
                  { value: 4, label: 'Agree', color: '#8bc34a' },
                  { value: 3, label: 'Neutral', color: '#ffc107' },
                  { value: 2, label: 'Disagree', color: '#ff9800' },
                  { value: 1, label: 'Strongly Disagree', color: '#f44336' }
                ].map((option) => (
                  <label 
                    key={option.value}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      margin: '4px 0',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: answers[question.id] === option.value ? option.color + '20' : 'white',
                      borderColor: answers[question.id] === option.value ? option.color : '#e0e0e0'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleAnswer(question.id, option.value)}
                      style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                    />
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: option.color,
                      marginRight: '16px'
                    }} />
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: answers[question.id] === option.value ? '600' : '400'
                    }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 style={{ marginBottom: '16px' }}>Your Answer:</h4>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              {question.sampleAnswer && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f0f7ff',
                  borderRadius: '8px',
                  border: '1px solid #b3d9ff'
                }}>
                  <h5 style={{ marginBottom: '8px', color: '#1565c0' }}>
                    💡 Tips for a strong answer:
                  </h5>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    {question.sampleAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '24px'
      }}>
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            opacity: currentQuestion === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          {currentQuestion === questions.length - 1 ? (
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* AI Hint Panel */}
      <AIHintPanel 
        question={question}
        isVisible={showAIPanel}
        onToggle={() => setShowAIPanel(!showAIPanel)}
      />
    </div>
  )
}

export default Assessment