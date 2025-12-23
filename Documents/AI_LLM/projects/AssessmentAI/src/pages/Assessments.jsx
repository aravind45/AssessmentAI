import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Settings, BookOpen, Brain, Code, Users, Globe, Layers, Zap, Database } from 'lucide-react'
import { questionManager } from '../utils/questionManager'
import { assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'

const Assessments = () => {
  const [questionCounts, setQuestionCounts] = useState({})
  const [customAssessments, setCustomAssessments] = useState([])
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const icons = {
      FileText, Brain, Code, Users, Globe, Layers, Zap, Database, Settings, BookOpen
    }
    return icons[iconName] || FileText
  }

  useEffect(() => {
    if (user) {
      loadCustomAssessments()
    } else {
      setCustomAssessments([])
      setQuestionCounts({})
    }
  }, [user])

  const loadCustomAssessments = async () => {
    if (!user) {
      setCustomAssessments([])
      setQuestionCounts({})
      return
    }

    try {
      setLoading(true)
      
      // Load custom assessment types
      const { data: assessmentTypes, error: assessmentError } = await assessmentTypesService.getUserAssessmentTypes(user.id)
      
      if (assessmentError) {
        console.error('Error loading custom assessments:', assessmentError)
        setCustomAssessments([])
        return
      }

      // Load question counts from database
      const { questionsService } = await import('../services/database')
      const { data: questionStats, error: statsError } = await questionsService.getQuestionStats(user.id)
      
      if (statsError) {
        console.error('Error loading question stats:', statsError)
      }

      setCustomAssessments(assessmentTypes || [])
      
      // Set question counts
      const counts = {}
      ;(assessmentTypes || []).forEach(assessment => {
        counts[assessment.id] = questionStats?.[assessment.name] || 0
      })
      setQuestionCounts(counts)
      
    } catch (error) {
      console.error('Error loading custom assessments:', error)
      setCustomAssessments([])
      setQuestionCounts({})
    } finally {
      setLoading(false)
    }
  }

  // Convert custom assessments to the format expected by the UI
  const assessmentTypes = customAssessments.map(assessment => {
    const IconComponent = getIconComponent(assessment.icon)
    return {
      id: assessment.id,
      title: assessment.name,
      description: assessment.description || 'Custom assessment',
      icon: <IconComponent size={48} />,
      color: assessment.color || '#f6d55c',
      baseDuration: 3, // Default duration
      baseQuestions: 10 // Default question count
    }
  }).map(assessment => {
    const actualQuestions = questionCounts[assessment.id] || assessment.baseQuestions
    const duration = Math.ceil(actualQuestions * assessment.baseDuration)
    
    return {
      ...assessment,
      questions: actualQuestions,
      duration: `${duration} minute${duration !== 1 ? 's' : ''}`
    }
  })

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <Link 
          to="/"
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#5f6368',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '32px', fontWeight: '600', margin: 0 }}>
          All Assessments
        </h1>
      </div>

      {/* Custom Assessments */}
      {user && assessmentTypes.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: '#333',
              margin: 0
            }}>
              Your Custom Assessments
            </h2>
            <Link 
              to="/questions"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f6d55c',
                color: '#333'
              }}
            >
              Create New Assessment
            </Link>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {assessmentTypes.map((assessment) => (
              <div key={assessment.id} className="card">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ color: assessment.color, marginRight: '16px' }}>
                    {assessment.icon}
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '500' }}>
                    {assessment.title}
                  </h3>
                </div>
                
                <p style={{ 
                  fontSize: '16px', 
                  color: '#5f6368',
                  marginBottom: '16px'
                }}>
                  {assessment.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#5f6368',
                  marginBottom: '20px'
                }}>
                  <span>⏱️ {assessment.duration}</span>
                  <span>📝 {assessment.questions} questions</span>
                </div>
                
                <Link 
                  to={`/assessment/${assessment.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Start Assessment
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assessments State */}
      {user && assessmentTypes.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '48px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px'
          }}>
            No Custom Assessments Yet
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '24px'
          }}>
            Create your first custom assessment to get started!
          </p>
          <Link 
            to="/questions"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f6d55c',
              color: '#333'
            }}
          >
            Create New Assessment
          </Link>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading your assessments...</p>
        </div>
      )}

      {/* Not Logged In State */}
      {!user && (
        <div style={{ 
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px'
          }}>
            Please Log In
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '24px'
          }}>
            Log in to create and access your custom assessments.
          </p>
          <Link 
            to="/login"
            className="btn btn-primary"
            style={{
              background: '#f6d55c',
              color: '#333'
            }}
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  )
}

export default Assessments