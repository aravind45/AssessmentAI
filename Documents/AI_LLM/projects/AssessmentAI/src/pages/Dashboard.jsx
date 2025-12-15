import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Clock, Target, Calendar, ArrowRight, Trophy, BookOpen, User } from 'lucide-react'
import { resultsService, assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const [recentResults, setRecentResults] = useState([])
  const [stats, setStats] = useState(null)
  const [customAssessmentTypes, setCustomAssessmentTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load recent results (last 5)
      const { data: results, error: resultsError } = await resultsService.getUserResults(user.id)
      if (resultsError) throw resultsError
      
      // Load user stats
      const { data: userStats, error: statsError } = await resultsService.getUserStats(user.id)
      if (statsError) throw statsError
      
      // Load custom assessment types for name mapping
      const { data: customTypes, error: customError } = await assessmentTypesService.getUserAssessmentTypes(user.id)
      if (customError) throw customError

      setRecentResults(results?.slice(0, 5) || [])
      setStats(userStats)
      setCustomAssessmentTypes(customTypes || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAssessmentName = (assessmentType) => {
    // Check if it's a custom assessment
    const customType = customAssessmentTypes.find(ct => ct.id === assessmentType)
    if (customType) {
      return customType.name
    }

    // Default assessment names
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4caf50'
    if (percentage >= 60) return '#ff9800'
    return '#f44336'
  }

  const getScoreGrade = (percentage) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Loading dashboard...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Error loading dashboard</h2>
        <p style={{ color: '#f44336' }}>{error}</p>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#333',
          marginBottom: '8px'
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Track your assessment progress and performance
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              background: '#e3f2fd',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <BookOpen size={24} color="#1976d2" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#1976d2' }}>
              {stats.totalAssessments}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Total Assessments
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              background: '#e8f5e8',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Target size={24} color="#388e3c" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#388e3c' }}>
              {stats.averageScore}%
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Average Score
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              background: '#fff3e0',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trophy size={24} color="#f57c00" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#f57c00' }}>
              {Object.keys(stats.assessmentTypes || {}).length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Assessment Types
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ 
              background: '#fce4ec',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <TrendingUp size={24} color="#c2185b" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#c2185b' }}>
              {stats.recentResults?.length > 1 ? 
                (stats.recentResults[0]?.score / stats.recentResults[0]?.total_questions * 100 > 
                 stats.recentResults[1]?.score / stats.recentResults[1]?.total_questions * 100 ? '+' : '-') : '~'}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Recent Trend
            </div>
          </div>
        </div>
      )}

      {/* Recent Assessments */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <BarChart3 size={24} />
            Recent Assessments
          </h2>
          <Link 
            to="/assessments"
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Take Assessment
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentResults.length > 0 ? (
          <div style={{ overflow: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '12px 8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Assessment
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '12px 8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Score
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '12px 8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Grade
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '12px 8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Time
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '12px 8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((result, index) => {
                  const percentage = Math.round((result.score / result.total_questions) * 100)
                  const scoreColor = getScoreColor(percentage)
                  const grade = getScoreGrade(percentage)
                  
                  return (
                    <tr 
                      key={result.id}
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 8px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#333' }}>
                            {getAssessmentName(result.assessment_type)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {result.total_questions} questions
                          </div>
                        </div>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 8px'
                      }}>
                        <div style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: scoreColor
                          }}>
                            {result.score}/{result.total_questions}
                          </span>
                          <span style={{ 
                            fontSize: '14px', 
                            color: '#666'
                          }}>
                            ({percentage}%)
                          </span>
                        </div>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 8px'
                      }}>
                        <span style={{ 
                          background: scoreColor + '20',
                          color: scoreColor,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {grade}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 8px',
                        color: '#666'
                      }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <Clock size={14} />
                          {formatTime(result.time_taken)}
                        </div>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 8px',
                        color: '#666'
                      }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <Calendar size={14} />
                          {formatDate(result.created_at)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '8px' }}>No assessments taken yet</h3>
            <p style={{ marginBottom: '24px' }}>
              Start taking assessments to see your progress here
            </p>
            <Link 
              to="/assessments"
              className="btn btn-primary"
              style={{
                background: '#f6d55c',
                color: '#333'
              }}
            >
              Take Your First Assessment
            </Link>
          </div>
        )}
      </div>

      {/* Assessment Types Performance */}
      {stats && Object.keys(stats.assessmentTypes || {}).length > 0 && (
        <div className="card">
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Target size={24} />
            Performance by Assessment Type
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(stats.assessmentTypes).map(([type, typeStats]) => (
              <div 
                key={type}
                style={{ 
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    margin: 0,
                    color: '#333'
                  }}>
                    {getAssessmentName(type)}
                  </h4>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: getScoreColor(typeStats.averageScore)
                  }}>
                    {typeStats.averageScore}%
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {typeStats.count} attempt{typeStats.count !== 1 ? 's' : ''}
                </div>
                <div style={{ 
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: getScoreColor(typeStats.averageScore),
                    height: '100%',
                    width: `${typeStats.averageScore}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard