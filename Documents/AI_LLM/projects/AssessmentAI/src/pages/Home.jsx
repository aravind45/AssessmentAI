import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Users, 
  Globe, 
  Code, 
  Database, 
  Layers, 
  Zap, 
  Settings, 
  BookOpen,
  Target,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  MessageSquare,
  Star
} from 'lucide-react'
import { assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'
import GenerateQuestions from '../components/GenerateQuestions'

const Home = () => {
  const [customAssessments, setCustomAssessments] = useState([])
  const [questionCounts, setQuestionCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const navigate = useNavigate()

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
    if (!user) return

    try {
      setLoading(true)
      const { data: assessmentTypes, error: assessmentError } = await assessmentTypesService.getUserAssessmentTypes(user.id)
      
      if (assessmentError) {
        console.error('Error loading custom assessments:', assessmentError)
        setCustomAssessments([])
        return
      }

      const { questionsService } = await import('../services/database')
      const { data: questionStats, error: statsError } = await questionsService.getQuestionStats(user.id)
      
      const assessmentsWithCounts = (assessmentTypes || []).map(assessment => ({
        ...assessment,
        questionCount: questionStats?.[assessment.name] || 0
      }))

      setCustomAssessments(assessmentsWithCounts)
      
      const counts = {}
      assessmentsWithCounts.forEach(assessment => {
        counts[assessment.id] = assessment.questionCount
      })
      setQuestionCounts(counts)
      
    } catch (error) {
      console.error('Error loading custom assessments:', error)
      setCustomAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionsGenerated = (assessment, questions) => {
    loadCustomAssessments()
  }

  // Use cases for students and job seekers
  const useCases = [
    {
      icon: GraduationCap,
      title: 'Exam Preparation',
      description: 'Generate practice tests for any subject - from calculus to history',
      color: '#4db6ac',
      audience: 'Students'
    },
    {
      icon: Briefcase,
      title: 'Interview Prep',
      description: 'Practice technical interviews, behavioral questions, and more',
      color: '#8b5cf6',
      audience: 'Job Seekers'
    },
    {
      icon: Code,
      title: 'Technical Skills',
      description: 'Test your knowledge in programming, databases, and system design',
      color: '#f6d55c',
      audience: 'Developers'
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Prepare for professional certifications with custom question banks',
      color: '#ff8a65',
      audience: 'Professionals'
    }
  ]

  // Features/benefits
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Enter any topic and get instant, high-quality questions with answers'
    },
    {
      icon: Target,
      title: 'Targeted Practice',
      description: 'Focus on specific areas where you need the most improvement'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Generate 20 questions in seconds instead of hours of manual work'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your scores and see your improvement over time'
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'white',
      paddingTop: '80px'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <Sparkles size={16} />
              Now with AI-Powered Question Generation
            </div>

            <h1 style={{ 
              fontSize: '52px', 
              fontWeight: '700', 
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              Ace Your Next
              <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #f6d55c, #4db6ac)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Exam or Interview
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '20px', 
              opacity: 0.9,
              marginBottom: '40px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 40px auto'
            }}>
              Create personalized practice assessments in seconds. 
              Generate questions with AI or upload your own study materials.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {user ? (
                <>
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    style={{
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Sparkles size={22} />
                    Generate with AI
                  </button>
                  <Link
                    to="/questions"
                    style={{
                      background: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '12px',
                      padding: '14px 32px',
                      fontSize: '18px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Upload size={22} />
                    Upload Questions
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    style={{
                      background: 'white',
                      color: '#667eea',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontSize: '18px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/login"
                    style={{
                      background: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '12px',
                      padding: '14px 32px',
                      fontSize: '18px',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        {/* Two Ways Section */}
        <div style={{
          marginTop: '-60px',
          marginBottom: '80px',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* AI Generate Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '2px solid #8b5cf6',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                RECOMMENDED
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Sparkles size={28} color="white" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                AI Question Generator
              </h3>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
                Enter any topic and let AI create professional questions with answers and explanations instantly.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['Any topic you can think of', 'Questions in seconds', 'Explanations included'].map((item, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    <CheckCircle size={16} color="#8b5cf6" />
                    {item}
                  </li>
                ))}
              </ul>
              {user ? (
                <button
                  onClick={() => setShowAIGenerator(true)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={18} />
                  Generate Questions
                </button>
              ) : (
                <Link
                  to="/register"
                  style={{
                    display: 'flex',
                    width: '100%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Sign Up to Try
                </Link>
              )}
            </div>

            {/* Excel Upload Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f6d55c, #f0c929)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Upload size={28} color="white" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                Upload Your Questions
              </h3>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
                Have your own questions? Upload an Excel file and we'll turn it into an interactive assessment.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {['Use your own materials', 'Bulk import supported', 'Excel & CSV formats'].map((item, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    <CheckCircle size={16} color="#f6d55c" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/questions"
                style={{
                  display: 'flex',
                  width: '100%',
                  background: '#f6d55c',
                  color: '#333',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Upload size={18} />
                Upload Excel File
              </Link>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '16px'
            }}>
              Built for Your Success
            </h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              Whether you're preparing for exams or landing your dream job, we've got you covered
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {useCases.map((useCase, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${useCase.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <useCase.icon size={24} color={useCase.color} />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: useCase.color,
                    background: `${useCase.color}15`,
                    padding: '4px 10px',
                    borderRadius: '12px'
                  }}>
                    {useCase.audience}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  {useCase.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '24px',
          padding: '60px 40px',
          marginBottom: '80px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '16px'
            }}>
              Why Choose AssessmentAI?
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Powerful features to accelerate your learning
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <feature.icon size={28} color="#667eea" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '16px'
            }}>
              Get Started in Minutes
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Three simple steps to your personalized assessment
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              {
                step: 1,
                title: 'Choose Your Method',
                description: 'Generate questions with AI by entering a topic, or upload your own Excel file',
                icon: Sparkles
              },
              {
                step: 2,
                title: 'Customize & Review',
                description: 'Adjust difficulty levels, review questions, and make any edits you need',
                icon: Settings
              },
              {
                step: 3,
                title: 'Practice & Improve',
                description: 'Take the assessment, get instant feedback with AI hints, and track your progress',
                icon: TrendingUp
              }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 auto 20px'
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <item.icon size={28} color="#667eea" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* User's Custom Assessments */}
        {user && customAssessments.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#333', margin: 0 }}>
                Your Assessments
              </h2>
              <Link
                to="/assessments"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {customAssessments.slice(0, 4).map((assessment) => {
                const IconComponent = getIconComponent(assessment.icon)
                return (
                  <Link 
                    key={assessment.id}
                    to={`/assessment/${assessment.id}`}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        background: assessment.color || '#667eea',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={20} color="white" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#333' }}>
                          {assessment.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                          {assessment.questionCount || 0} questions
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '13px', color: '#667eea', fontWeight: '500' }}>
                        Start Assessment
                      </span>
                      <ArrowRight size={16} color="#667eea" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          color: 'white',
          marginBottom: '60px'
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Ready to Start Practicing?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of students and professionals who are acing their exams and interviews
          </p>
          {user ? (
            <button
              onClick={() => setShowAIGenerator(true)}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Sparkles size={22} />
              Create Your First Assessment
            </button>
          ) : (
            <Link
              to="/register"
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Get Started Free
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <GenerateQuestions
          onClose={() => setShowAIGenerator(false)}
          onQuestionsGenerated={handleQuestionsGenerated}
        />
      )}
    </div>
  )
}

export default Home
