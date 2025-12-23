import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const AssessmentWorking = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState({})
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    const testDatabase = async () => {
      if (!user) {
        setDebugInfo({ error: 'No user logged in' })
        setLoading(false)
        return
      }

      try {
        console.log('Testing database with user:', user.id)
        console.log('Assessment type:', type)

        // Step 1: Get all questions for user
        const { data: allQuestions, error: questionsError } = await supabase
          .from('custom_questions')
          .select('*')
          .eq('user_id', user.id)

        console.log('All questions:', allQuestions)
        console.log('Questions error:', questionsError)

        // Step 2: Get assessment type
        const { data: assessmentType, error: typeError } = await supabase
          .from('custom_assessment_types')
          .select('*')
          .eq('user_id', user.id)
          .eq('id', type)
          .single()

        console.log('Assessment type:', assessmentType)
        console.log('Type error:', typeError)

        // Step 3: Filter questions
        let filteredQuestions = []
        if (allQuestions && assessmentType) {
          filteredQuestions = allQuestions.filter(q => 
            q.assessment_type === assessmentType.name
          )
          console.log('Filtered questions:', filteredQuestions)
        }

        // Step 4: Transform questions
        const transformedQuestions = filteredQuestions.map(q => q.question_data)
        console.log('Transformed questions:', transformedQuestions)

        setDebugInfo({
          userId: user.id,
          assessmentId: type,
          allQuestionsCount: allQuestions?.length || 0,
          assessmentType: assessmentType,
          filteredQuestionsCount: filteredQuestions.length,
          transformedQuestionsCount: transformedQuestions.length,
          questionsError,
          typeError
        })

        setQuestions(transformedQuestions)

      } catch (error) {
        console.error('Database test error:', error)
        setDebugInfo({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    testDatabase()
  }, [user, type])

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Assessment Debug Page</h1>
      
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        Back to Home
      </button>

      <h2>Debug Information:</h2>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <h2>Questions Found: {questions.length}</h2>
      {questions.length > 0 ? (
        <div>
          <h3>First Question Preview:</h3>
          <pre style={{ background: '#e8f5e8', padding: '15px', borderRadius: '5px' }}>
            {JSON.stringify(questions[0], null, 2)}
          </pre>
          
          <h3>All Questions:</h3>
          {questions.map((q, index) => (
            <div key={index} style={{ 
              border: '1px solid #ccc', 
              margin: '10px 0', 
              padding: '10px',
              borderRadius: '5px'
            }}>
              <strong>Question {index + 1}:</strong>
              <br />
              {q.title || q.statement || q.description || 'No title'}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'red' }}>No questions found!</p>
      )}
    </div>
  )
}

export default AssessmentWorking