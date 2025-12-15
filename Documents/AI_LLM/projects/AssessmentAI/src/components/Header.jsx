import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brain, Settings } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Show header on all pages including homepage
  if (isHomePage) {
    return (
      <header style={{ 
        background: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '16px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
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
              <Brain size={32} color="#f6d55c" />
              AssessmentAI
            </Link>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link 
                to="/assessments"
                style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Assessments
              </Link>
              <Link 
                to="/questions"
                className="btn btn-primary"
                style={{
                  background: '#f6d55c',
                  color: '#333',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  border: 'none'
                }}
              >
                Manage Questions
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
            <Brain size={32} color="#f6d55c" />
            AssessmentAI
          </Link>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link 
              to="/assessments" 
              className="btn btn-secondary"
              style={{
                color: location.pathname === '/assessments' ? '#f6d55c' : '#5f6368'
              }}
            >
              Assessments
            </Link>
            <Link 
              to="/questions" 
              className="btn btn-secondary"
              style={{
                color: location.pathname === '/questions' ? '#f6d55c' : '#5f6368',
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