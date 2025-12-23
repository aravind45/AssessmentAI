import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Brain, Sparkles, ArrowRight, Play, Users, Globe, Code, Database, Layers, Zap, Settings, BookOpen } from 'lucide-react'
import { questionManager } from '../utils/questionManager'
import { assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
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

      // Combine assessment types with question counts
      const assessmentsWithCounts = (assessmentTypes || []).map(assessment => ({
        ...assessment,
        questionCount: questionStats?.[assessment.name] || 0
      }))

      setCustomAssessments(assessmentsWithCounts)
      
      // Set question counts for easy access
      const counts = {}
      assessmentsWithCounts.forEach(assessment => {
        counts[assessment.id] = assessment.questionCount
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

  const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'white',
      paddingTop: '80px'
    }}>
      <div className="container" style={{ 
        padding: '40px 20px'
      }}>
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#333',
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            Turn <span style={{ color: '#f6d55c' }}>Excel sheets</span> into
            <br />
            <span style={{ color: '#4db6ac' }}>assessments</span> in seconds
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#666',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            Upload your Excel files with questions and answers to create personalized assessments with detailed explanations
          </p>

          {/* Upload Area */}
          <div style={{
            background: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px auto',
            transition: 'all 0.3s ease'
          }}>
            <Upload size={48} color="#6c757d" style={{ marginBottom: '16px' }} />
            <p style={{ 
              color: '#495057', 
              fontSize: '18px',
              marginBottom: '16px'
            }}>
              Drag and drop an Excel file (.xlsx or .xls)
            </p>
            <Link 
              to="/questions"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f6d55c',
                color: '#333',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              Select Excel file
            </Link>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '14px',
              marginTop: '12px'
            }}>
              Excel files up to 10MB • .xlsx and .xls formats supported
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#4db6ac' 
              }}>
                {totalQuestions || '150+'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d' 
              }}>
                Questions Available
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#ff8a65' 
              }}>
                12
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d' 
              }}>
                Assessment Types
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#f6d55c' 
              }}>
                Excel
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d' 
              }}>
                Based
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide Section */}
        <div style={{
          marginBottom: '60px',
          background: '#f8f9fa',
          borderRadius: '16px',
          padding: '40px'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: '#333',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#666',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Create and take assessments in 4 simple steps
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '700',
                color: '#1976d2'
              }}>
                1
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333'
              }}>
                Sign Up & Login
              </h3>
              <p style={{ 
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Create your free account and log in to start creating personalized assessments
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '700',
                color: '#f57c00'
              }}>
                2
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333'
              }}>
                Create Assessment
              </h3>
              <p style={{ 
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Go to "Manage Questions" and create a new assessment with your preferred settings
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '700',
                color: '#7b1fa2'
              }}>
                3
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333'
              }}>
                Upload Excel File
              </h3>
              <p style={{ 
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Download our template, add your questions, and upload your Excel file with questions and answers
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#e8f5e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px',
                fontWeight: '700',
                color: '#2e7d32'
              }}>
                4
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333'
              }}>
                Take Assessment
              </h3>
              <p style={{ 
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Start your assessment, use AI help when needed, and get detailed results with explanations
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '40px',
            flexWrap: 'wrap'
          }}>
            {!user ? (
              <>
                <Link 
                  to="/register"
                  className="btn btn-primary"
                  style={{
                    background: '#f6d55c',
                    color: '#333',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    border: 'none'
                  }}
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/login"
                  className="btn btn-secondary"
                  style={{
                    background: 'transparent',
                    color: '#333',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    border: '2px solid #333'
                  }}
                >
                  Login
                </Link>
              </>
            ) : (
              <Link 
                to="/questions"
                className="btn btn-primary"
                style={{
                  background: '#f6d55c',
                  color: '#333',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  border: 'none'
                }}
              >
                Create Your First Assessment
              </Link>
            )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div style={{
          marginBottom: '60px'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: '#333',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Popular Assessments
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Show only custom assessments */}
            {customAssessments.map((assessment) => {
              const IconComponent = getIconComponent(assessment.icon)
              return (
                <Link 
                  key={assessment.id}
                  to={`/assessment/${assessment.id}`}
                  className="card"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                    display: 'block'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      background: assessment.color || '#f6d55c',
                      borderRadius: '8px',
                      padding: '8px'
                    }}>
                      <IconComponent size={20} color="white" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{assessment.name}</h3>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    margin: '0 0 12px 0'
                  }}>
                    {assessment.description || 'Custom assessment'}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    <span>Custom assessment</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              )
            })}

            {/* Show message if no custom assessments */}
            {customAssessments.length === 0 && (
              <div className="card" style={{
                textAlign: 'center',
                padding: '40px 20px',
                gridColumn: '1 / -1'
              }}>
                <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                <h3 style={{ color: '#666', marginBottom: '8px' }}>No Assessments Available</h3>
                <p style={{ color: '#999', marginBottom: '20px' }}>
                  {user ? 'Create your first custom assessment to get started.' : 'Please log in to view assessments.'}
                </p>
                {user && (
                  <Link 
                    to="/manage-questions" 
                    style={{
                      background: '#f6d55c',
                      color: '#333',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Create Assessment
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link 
              to="/assessments"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              View All Assessments
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Custom Assessments Section */}
        {user && customAssessments.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: '600', 
              color: '#333',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              Your Custom Assessments
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {customAssessments.slice(0, 6).map((assessment) => {
                const IconComponent = getIconComponent(assessment.icon)
                return (
                  <Link 
                    key={assessment.id}
                    to={`/assessment/${assessment.id}`}
                    className="card"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        background: assessment.color,
                        borderRadius: '8px',
                        padding: '8px'
                      }}>
                        <IconComponent size={20} color="white" />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                        {assessment.name}
                      </h3>
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '10px',
                        background: assessment.color + '20',
                        color: assessment.color,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        CUSTOM
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      margin: '0 0 12px 0'
                    }}>
                      {assessment.description || 'Custom assessment created by you'}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      <span>{assessment.questionCount || 0} questions</span>
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                )
              })}
            </div>

            {customAssessments.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link 
                  to="/assessments"
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  View All Custom Assessments
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Create Custom Assessment CTA */}
        {user && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '60px',
            border: '2px dashed #dee2e6'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '16px'
            }}>
              Create Your Own Assessment
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#666',
              marginBottom: '32px',
              maxWidth: '500px',
              margin: '0 auto 32px auto'
            }}>
              Upload your Excel files to create personalized assessments for any subject or skill
            </p>
            <Link 
              to="/questions"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f6d55c',
                color: '#333',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              <Upload size={20} />
              Create Assessment
            </Link>
          </div>
        )}

        {/* Help Section */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          marginTop: '60px'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px'
          }}>
            Need Help Getting Started?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Follow our step-by-step guide or check out the detailed user manual for comprehensive instructions.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <a 
              href="/USER_GUIDE.md"
              target="_blank"
              className="btn btn-secondary"
              style={{
                background: 'white',
                color: '#333',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid #dee2e6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📖 User Guide
            </a>
            
            <div style={{
              background: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: '2px solid #dee2e6',
              fontSize: '16px',
              color: '#666'
            }}>
              📧 Support: help@assessmentai.com
            </div>
          </div>

          {/* Quick Tips */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px'
            }}>
              💡 Quick Tips
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              textAlign: 'left'
            }}>
              <div>
                <strong>Excel Format:</strong> Use our template for best results
              </div>
              <div>
                <strong>AI Help:</strong> Click the AI Help button during assessments
              </div>
              <div>
                <strong>File Size:</strong> Keep Excel files under 10MB
              </div>
              <div>
                <strong>Questions:</strong> Use clear, concise language
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home