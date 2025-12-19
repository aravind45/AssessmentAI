import React, { useState, useEffect } from 'react'
import { HelpCircle, Lightbulb, MessageSquare, Loader, X, Minimize2, Maximize2 } from 'lucide-react'
import { groqAiService } from '../services/groqAiService'

const AIHintPanel = ({ question, isVisible, onToggle }) => {
  const [hint, setHint] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('hint')
  const [isMinimized, setIsMinimized] = useState(false)

  // Clear hints when question changes
  useEffect(() => {
    setHint('')
    setExplanation('')
    setActiveTab('hint') // Reset to hint tab for new question
  }, [question])

  // Generate AI-powered hints
  const generateHint = async () => {
    setLoading(true)
    try {
      console.log('🎯 Generating hint with Groq AI...')
      const generatedHint = await groqAiService.generateHint(question)
      setHint(generatedHint)
    } catch (error) {
      console.error('Hint generation failed:', error)
      setHint('Sorry, unable to generate hint at the moment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateExplanation = async () => {
    setLoading(true)
    try {
      console.log('📚 Generating explanation with Groq AI...')
      const generatedExplanation = await groqAiService.generateExplanation(question)
      setExplanation(generatedExplanation)
    } catch (error) {
      console.error('Explanation generation failed:', error)
      setExplanation('Sorry, unable to generate explanation at the moment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      right: isMinimized ? '-320px' : '0',
      top: '0',
      width: '400px',
      height: '100vh',
      background: 'white',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 1000,
      transition: 'right 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} color="#f6d55c" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>AI Assistant</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <button
              onClick={() => setActiveTab('hint')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'hint' ? '#f6d55c' : 'transparent',
                color: activeTab === 'hint' ? '#333' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              💡 Get Hint
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'explanation' ? '#f6d55c' : 'transparent',
                color: activeTab === 'explanation' ? '#333' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📚 Explanation
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflow: 'auto'
          }}>
            {activeTab === 'hint' && (
              <div>
                {!hint ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <HelpCircle size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                    <h4 style={{ color: '#666', marginBottom: '8px' }}>Need a hint?</h4>
                    <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
                      Get AI-powered hints to help you understand this question better.
                    </p>
                    <button
                      onClick={generateHint}
                      disabled={loading}
                      style={{
                        background: '#f6d55c',
                        color: '#333',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Lightbulb size={16} />
                          Get Hint
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                      whiteSpace: 'pre-line',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {hint}
                    </div>
                    <button
                      onClick={generateHint}
                      disabled={loading}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        border: '1px solid #2196f3',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {loading ? <Loader size={14} /> : <Lightbulb size={14} />}
                      Get Another Hint
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'explanation' && (
              <div>
                {!explanation ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <MessageSquare size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                    <h4 style={{ color: '#666', marginBottom: '8px' }}>Get Detailed Explanation</h4>
                    <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
                      Understand the concepts, reasoning, and why other options are incorrect.
                    </p>
                    <button
                      onClick={generateExplanation}
                      disabled={loading}
                      style={{
                        background: '#f6d55c',
                        color: '#333',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <MessageSquare size={16} />
                          Get Explanation
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                      whiteSpace: 'pre-line',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {explanation}
                    </div>
                    <button
                      onClick={generateExplanation}
                      disabled={loading}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        border: '1px solid #2196f3',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {loading ? <Loader size={14} /> : <MessageSquare size={14} />}
                      Regenerate Explanation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            💡 AI-powered learning assistance
          </div>
        </>
      )}

      {/* Minimized tab */}
      {isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#f6d55c',
            padding: '12px 8px',
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
          }}
        >
          AI Help
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AIHintPanel