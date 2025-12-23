import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const Assessment = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [type, user])

  const loadQuestions = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Get questions directly by custom_assessment_id
      const { data, error } = await supabase
        .from('custom_questions')
        .select('question_data')
        .eq('user_id', user.id)
        .eq('custom_assessment_id', type)

      if (error) {
        console.error('Error:', error)
        setQuestions([])
      } else {
        const questionList = (data || []).map(item => item.question_data)
        setQuestions(questionList)
      }
    } catch (error) {
      console.error('Error:', error)
      setQuestions([])
    }
    
    setLoading(false)
  }

  const startAssessment = () => {
    setIsStarted(true)
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = () => {
    const results = {
      type,
      answers,
      questions,
      timeSpent: 1800 - timeLeft
    }
    localStorage.setItem('assessmentResults', JSON.stringify(results))
    navigate('/results')
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Questions Found</h2>
        <p>Assessment ID: {type}</p>
        <p>User: {user?.email}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Assessment Ready</h1>
        <p>Questions: {questions.length}</p>
        <p>Time: 30 minutes</p>
        <button onClick={startAssessment} className="btn btn-primary">
          Start Assessment
        </button>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          background: '#e0e0e0', 
          height: '8px', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: '#4CAF50', 
            height: '100%', 
            width: `${progress}%`,
            transition: 'width 0.3s'
          }} />
        </div>
        <p style={{ textAlign: 'center', margin: '10px 0' }}>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>{question.title || question.statement}</h3>
        {question.description && <p>{question.description}</p>}
        
        {/* Multiple Choice */}
        {question.options && (
          <div style={{ margin: '20px 0' }}>
            {question.options.map((option, index) => (
              <label key={index} style={{ 
                display: 'block', 
                margin: '10px 0',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={() => handleAnswer(question.id, index)}
                  style={{ marginRight: '10px' }}
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {/* Text Answer */}
        {question.type === 'text' && (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your answer..."
            style={{ 
              width: '100%', 
              height: '100px', 
              margin: '20px 0',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        )}

        {/* Likert Scale */}
        {question.type === 'likert' && (
          <div style={{ margin: '20px 0' }}>
            {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map((option, index) => (
              <label key={index} style={{ 
                display: 'block', 
                margin: '10px 0',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={() => handleAnswer(question.id, index)}
                  style={{ marginRight: '10px' }}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        
        {currentQuestion === questions.length - 1 ? (
          <button onClick={submitAssessment} className="btn btn-primary">
            Submit Assessment
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn btn-primary">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Assessment