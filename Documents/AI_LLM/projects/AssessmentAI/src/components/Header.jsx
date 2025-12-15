import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brain, Settings } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Don't show header on homepage - it has its own navigation
  if (isHomePage) {
    return (
      <header style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '20px 0'
      }}>
        <div className="container">
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Link 
              to="/" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600'
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                padding: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <Brain size={24} color="white" />
              </div>
              AssessmentAI
            </Link>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '8px 12px',
                fontSize: '14px'
              }}>
                <option value="en">English</option>
              </select>
              <Link 
                to="/assessments"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Sign In
              </Link>
              <Link 
                to="/questions"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header style={{ 
      background: 'white', 
      borderBottom: '1px solid #dadce0',
      padding: '16px 0'
    }}>
      <div className="container">
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              textDecoration: 'none',
              color: '#333',
              fontSize: '24px',
              fontWeight: '600'
            }}
          >
            <Brain size={32} color="#667eea" />
            AssessmentAI
          </Link>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link 
              to="/assessments" 
              className="btn btn-secondary"
              style={{
                color: location.pathname === '/assessments' ? '#667eea' : '#5f6368'
              }}
            >
              Assessments
            </Link>
            <Link 
              to="/questions" 
              className="btn btn-secondary"
              style={{
                color: location.pathname === '/questions' ? '#667eea' : '#5f6368',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={16} />
              Manage Questions
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header