import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Brain, Sparkles, ArrowRight, Play, Users, Globe } from 'lucide-react'
import { questionManager } from '../utils/questionManager'

const Home = () => {
  const [questionCounts, setQuestionCounts] = useState({})

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

    // Listen for storage changes to update counts when questions are added
    const handleStorageChange = () => {
      updateCounts()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for focus events to update when returning from question manager
    window.addEventListener('focus', updateCounts)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', updateCounts)
    }
  }, [])

  const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        filter: 'blur(30px)'
      }} />

      <div className="container" style={{ 
        padding: '60px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hero Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '80px',
          minHeight: '70vh'
        }}>
          {/* Left Content */}
          <div>
            <h1 style={{ 
              fontSize: '56px', 
              fontWeight: '700', 
              color: 'white',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              Turn <span style={{ color: '#ff6b6b' }}>knowledge</span> into
              <br />
              <span style={{ color: '#4ecdc4' }}>assessments</span> in seconds
            </h1>
            
            <p style={{ 
              fontSize: '20px', 
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Advanced AI analyzes your material and creates personalized assessments with detailed explanations
            </p>

            {/* Upload Area */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '32px',
              transition: 'all 0.3s ease'
            }}>
              <Upload size={48} color="white" style={{ marginBottom: '16px' }} />
              <p style={{ 
                color: 'white', 
                fontSize: '18px',
                marginBottom: '16px'
              }}>
                Drag and drop a PDF, presentation, or Word file
              </p>
              <Link 
                to="/questions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                Select file
              </Link>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '14px',
                marginTop: '12px'
              }}>
                PDF up to 50MB • Presentations and Word up to 20MB
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#4ecdc4' 
                }}>
                  {totalQuestions || '150+'}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.7)' 
                }}>
                  Questions Available
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#ff6b6b' 
                }}>
                  12
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.7)' 
                }}>
                  Assessment Types
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#45b7d1' 
                }}>
                  AI
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.7)' 
                }}>
                  Powered
                </div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div style={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Main illustration container */}
            <div style={{
              width: '400px',
              height: '400px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Person silhouette */}
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={60} color="white" />
              </div>

              {/* Floating elements */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 107, 107, 0.9)',
                borderRadius: '12px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Quiz Generated!
              </div>

              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(78, 205, 196, 0.9)',
                borderRadius: '12px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                AI Analysis
              </div>

              {/* Document icons */}
              <div style={{
                position: 'absolute',
                top: '50px',
                left: '-20px',
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <FileText size={24} color="#667eea" />
              </div>

              <div style={{
                position: 'absolute',
                bottom: '80px',
                right: '-20px',
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <Sparkles size={24} color="#ff6b6b" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '60px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: 'white',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Quick Start Options
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Programming Skills */}
            <Link 
              to="/assessment/coding"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                textDecoration: 'none',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #4285f4, #34a853)',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Play size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Programming Skills</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 12px 0'
              }}>
                Test your coding abilities with algorithmic problems
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span>{questionCounts.coding || 9} questions</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Personality Assessment */}
            <Link 
              to="/assessment/personality"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                textDecoration: 'none',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #9c27b0, #e91e63)',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Users size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Personality Assessment</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 12px 0'
              }}>
                Discover your behavioral tendencies and work style
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span>{questionCounts.personality || 50} questions</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* AP Physics */}
            <Link 
              to="/assessment/ap-physics-10th"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                textDecoration: 'none',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ff5722, #ff9800)',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  <Globe size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>AP Physics</h3>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 12px 0'
              }}>
                Master physics concepts with comprehensive problems
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              View All Assessments
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home