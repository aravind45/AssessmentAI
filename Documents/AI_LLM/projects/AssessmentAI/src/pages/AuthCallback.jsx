import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (type === 'signup' && accessToken) {
          // Email confirmation successful
          setLoading(false)
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: 'Email confirmed successfully! You can now use all features.' 
              }
            })
          }, 2000)
        } else if (type === 'recovery' && accessToken) {
          // Password reset - redirect to reset password page
          navigate('/reset-password')
        } else if (accessToken) {
          // General auth success
          navigate('/')
        } else {
          // No valid tokens found
          setError('Invalid or expired confirmation link')
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('An error occurred during authentication')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f6d55c',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px auto'
          }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '16px'
          }}>
            Confirming Your Email
          </h2>
          <p style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Please wait while we verify your email address...
          </p>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#fee',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <span style={{ fontSize: '24px', color: '#c33' }}>✕</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '16px'
          }}>
            Confirmation Failed
          </h2>
          <p style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5',
            marginBottom: '24px'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#f6d55c',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#efe',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <span style={{ fontSize: '24px', color: '#363' }}>✓</span>
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '16px'
        }}>
          Email Confirmed!
        </h2>
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Your email has been successfully confirmed. Redirecting you to the homepage...
        </p>
      </div>
    </div>
  )
}

export default AuthCallback