import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Code, Database, Globe, Users, Brain, Layers, Zap, ArrowLeft, FileText, Settings, BookOpen } from 'lucide-react'
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
    // Get question counts for custom assessments only
    const updateCounts = () => {
      const counts = {}
      customAssessments.forEach(assessment => {
        const stats = questionManager.getQuestionStats(assessment.id)
        counts[assessment.id] = stats.total
      })
      setQuestionCounts(counts)
    }

    updateCounts()
    loadCustomAssessments()

    // Listen for storage changes to update counts when questions are added
    const handleStorageChange = () => {
      updateCounts()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for focus events to update when returning from question manager
    window.addEventListener('focus', () => {
      updateCounts()
      loadCustomAssessments()
    })

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', updateCounts)
    }
  }, [user])

  const loadCustomAssessments = async () => {
    if (!user) {
      setCustomAssessments([])
      return
    }

    try {
      setLoading(true)
      const { data, error } = await assessmentTypesService.getUserAssessmentTypes(user.id)
      
      if (error) {
        console.error('Error loading custom assessments:', error)
      } else {
        // Get question counts for custom assessments
        const assessmentsWithCounts = (data || []).map(assessment => {
          const stats = questionManager.getQuestionStats(assessment.id)
          return {
            ...assessment,
            questionCount: stats.total,
            duration: `${Math.max(5, Math.ceil(stats.total * 3))} minutes` // 3 minutes per question, minimum 5 minutes
          }
        })
        setCustomAssessments(assessmentsWithCounts)
      }
    } catch (error) {
      console.error('Error loading custom assessments:', error)
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
            gap: '8px',
            color: '#5f6368',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '400', 
          color: '#202124',
          marginBottom: '16px'
        }}>
          All Assessments
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#5f6368',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Choose from our comprehensive collection of assessments to test and improve your skills.
        </p>
      </div>

      {/* Default Assessments */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#333',
          marginBottom: '24px'
        }}>
          Built-in Assessments
        </h2>
        
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
                color: '#5f6368', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {assessment.description}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '24px',
                fontSize: '14px',
                color: '#5f6368'
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

      {/* Custom Assessments */}
      {user && (
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
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading your custom assessments...</p>
            </div>
          ) : customAssessments.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {customAssessments.map((assessment) => {
                const IconComponent = getIconComponent(assessment.icon)
                return (
                  <div key={assessment.id} className="card" style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      fontSize: '10px',
                      background: assessment.color + '20',
                      color: assessment.color,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      CUSTOM
                    </span>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ 
                        background: assessment.color,
                        borderRadius: '8px',
                        padding: '8px',
                        marginRight: '16px'
                      }}>
                        <IconComponent size={24} color="white" />
                      </div>
                      <h3 style={{ fontSize: '24px', fontWeight: '500' }}>
                        {assessment.name}
                      </h3>
                    </div>
                    
                    <p style={{ 
                      color: '#5f6368', 
                      marginBottom: '20px',
                      lineHeight: '1.5'
                    }}>
                      {assessment.description || 'Custom assessment created by you'}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '24px',
                      fontSize: '14px',
                      color: '#5f6368'
                    }}>
                      <span>⏱️ {assessment.duration}</span>
                      <span>📝 {assessment.questionCount} questions</span>
                    </div>
                    
                    <Link 
                      to={`/assessment/${assessment.id}`}
                      className="btn btn-primary"
                      style={{ 
                        width: '100%',
                        background: assessment.color,
                        borderColor: assessment.color
                      }}
                    >
                      Start Assessment
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#5f6368', marginBottom: '16px' }}>
                No Custom Assessments Yet
              </h3>
              <p style={{ color: '#5f6368', marginBottom: '24px' }}>
                Create your own assessments by uploading Excel files with your questions.
              </p>
              <Link 
                to="/questions"
                className="btn btn-primary"
                style={{
                  background: '#f6d55c',
                  color: '#333'
                }}
              >
                Create Your First Assessment
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#202124' }}>
          How It Works
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginTop: '32px'
        }}>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#4285f4'
            }}>
              1️⃣
            </div>
            <h3>Choose Assessment</h3>
            <p style={{ color: '#5f6368' }}>
              Select the type of assessment that matches your learning goals
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#34a853'
            }}>
              2️⃣
            </div>
            <h3>Complete Questions</h3>
            <p style={{ color: '#5f6368' }}>
              Work through realistic problems within the time limit
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#fbbc04'
            }}>
              3️⃣
            </div>
            <h3>Get Feedback</h3>
            <p style={{ color: '#5f6368' }}>
              Receive detailed results and improvement suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assessments