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
    // Get actual question counts including custom questions
    const updateCounts = () => {
      const counts = {}
      const types = [
        'coding', 'system-design', 'frontend', 'behavioral', 'personality', 
        'ai-business-analyst', 'ai-solution-architect', 'microservices', 
        'event-driven-architecture', 'serverless-architecture', 
        'full-stack-development', 'ap-physics-10th'
      ]
      
      types.forEach(type => {
        const stats = questionManager.getQuestionStats(type)
        counts[type] = stats.total
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
            questionCount: stats.total
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
            {/* Programming Skills */}
            <Link 
              to="/assessment/coding"
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
                  background: '#f6d55c',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Play size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Programming Skills</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: '#666',
                margin: '0 0 12px 0'
              }}>
                Test your coding abilities with algorithmic problems
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: '#999'
              }}>
                <span>{questionCounts.coding || 9} questions</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Personality Assessment */}
            <Link 
              to="/assessment/personality"
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
                  background: '#ff8a65',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Users size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Personality Assessment</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: '#666',
                margin: '0 0 12px 0'
              }}>
                Discover your behavioral tendencies and work style
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: '#999'
              }}>
                <span>{questionCounts.personality || 50} questions</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* AP Physics */}
            <Link 
              to="/assessment/ap-physics-10th"
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
                  background: '#4db6ac',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Globe size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>AP Physics</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: '#666',
                margin: '0 0 12px 0'
              }}>
                Master physics concepts with comprehensive problems
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: '#999'
              }}>
                <span>{questionCounts['ap-physics-10th'] || 20} questions</span>
                <ArrowRight size={16} />
              </div>
            </Link>
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
      </div>
    </div>
  )
}

export default Home