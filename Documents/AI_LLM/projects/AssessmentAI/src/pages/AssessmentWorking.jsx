import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AssessmentWorking = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isStarted, setIsStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [assessmentName, setAssessmentName] = useState('')

  useEffect(() => {
    loadAssessmentData()
  }, [type, user])

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && isStarted) {
      handleSubmit()
    }
  }, [timeLeft, isStarted])

  const loadAssessmentData = async () => {
    try {
      console.log('Loading assessment:', type)
      
      // Check if it's a UUID (custom assessment)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(type)
      
      if (isUUID && user) {
        // Load custom assessment from database
        const { assessmentTypesService } = await import('../services/database')
        const { data: customTypes } = await assessmentTypesService.getUserAssessmentTypes(user.id)
        const assessment = customTypes?.find(a => a.id === type)
        
        if (assessment) {
          setAssessmentName(assessment.name)
          
          // First try localStorage (where your questions actually are)
          try {
            const stored = localStorage.getItem('customQuestions')
            const customQuestions = stored ? JSON.parse(stored) : {}
            const questionsForAssessment = customQuestions[type] || []
            
            if (questionsForAssessment.length > 0) {
              console.log('Found questions in localStorage:', questionsForAssessment.length)
              setQuestions(questionsForAssessment)
              setLoading(false)
              return
            }
          } catch (error) {
            console.error('Error loading from localStorage:', error)
          }
          
          // If no localStorage questions, try database
          const { supabase } = await import('../lib/supabase')
          const { data: questionsData } = await supabase
            .from('custom_questions')
            .select('*')
            .eq('assessment_type_id', type)
            .order('created_at')
          
          if (questionsData && questionsData.length > 0) {
            console.log('Found questions in database:', questionsData.length)
            const formattedQuestions = questionsData.map((q, index) => ({
              id: q.id,
              title: `Question ${index + 1}`,
              description: q.question_text,
              type: 'multiple-choice',
              options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
              correctAnswer: q.correct_answer,
              difficulty: 'Medium'
            }))
            setQuestions(formattedQuestions)
          } else {
            console.log('No questions found in localStorage or database')
            setQuestions([])
          }
        }
      } else {
        // Built-in assessment - create sample questions
        setAssessmentName(type.replace('-', ' ').toUpperCase())
        setQuestions([
          {
            id: 1,
            title: 'Sample Question 1',
            description: 'This is a sample question for ' + type,
            type: 'multiple-choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            difficulty: 'Easy'
          },
          {
            id: 2,
            title: 'Sample Question 2',
            description: 'This is another sample question for ' + type,
            type: 'multiple-choice',
            options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
            difficulty: 'Medium'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const startAssessment = () => {
    setIsStarted(true)
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
    const results = {
      type,
      answers,
      questions,
      timeSpent: 1800 - timeLeft,
      totalTime: 1800
    }
    
    localStorage.setItem('assessmentResults', JSON.stringify(results))
    navigate('/results')
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Loading assessment...</h2>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>No Questions Found</h2>
        <p>This assessment has no questions available.</p>
        <p>Assessment ID: {type}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '24px' }}>
            {assessmentName} Assessment
          </h1>
          
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>
              You are about to start the {assessmentName} assessment.
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
                <strong>Time Limit:</strong> 30 minutes
              </div>
            </div>
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
          <h2 style={{ margin: 0 }}>{assessmentName} Assessment</h2>
          <p style={{ margin: 0, color: '#5f6368' }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        
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

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#4caf50',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question */}
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0 }}>{question.title}</h3>
            <span style={{ 
              padding: '4px 12px',
              background: '#e8f5e8',
              color: '#155724',
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
        </div>

        {/* Answer Section */}
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
    </div>
  )
}

export default AssessmentWorking