import React from 'react'
import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'

const Header = () => {
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
            <Brain size={32} color="#4285f4" />
            Job Assessment Platform
          </Link>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
            <Link to="/questions" className="btn btn-secondary">
              Manage Questions
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header