import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link 
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
              marginBottom: '24px'
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#333',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f6d55c'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f6d55c'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link 
              to="/forgot-password"
              style={{
                color: '#f6d55c',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#ccc' : '#f6d55c',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link 
              to="/register"
              style={{
                color: '#f6d55c',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login