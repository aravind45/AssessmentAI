import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Save,
  Play,
  BookOpen,
  Brain
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { groqAiService } from '../services/groqAiService'
import { assessmentTypesService, questionsService } from '../services/database'

const GenerateQuestions = ({ onClose, onQuestionsGenerated }) => {
  const { user } = useAuth()
  
  // Form state
  const [topic, setTopic] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Mixed')
  const [assessmentName, setAssessmentName] = useState('')
  const [assessmentDescription, setAssessmentDescription] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1) // 1: Form, 2: Preview, 3: Complete
  
  // Generated questions state
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [selectedQuestions, setSelectedQuestions] = useState([])
  
  // Saving state
  const [saving, setSaving] = useState(false)
  const [createdAssessment, setCreatedAssessment] = useState(null)

  // Auto-generate assessment name from topic
  useEffect(() => {
    if (topic && !assessmentName) {
      setAssessmentName(topic.trim())
    }
  }, [topic])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await groqAiService.generateQuestions(
        topic.trim(),
        numberOfQuestions,
        difficulty
      )

      if (result.success) {
        setGeneratedQuestions(result.questions)
        setSelectedQuestions(result.questions.map(q => q.id)) // Select all by default
        setStep(2)
        setSuccess(`Successfully generated ${result.generated} questions!`)
      } else {
        setError(result.error || 'Failed to generate questions')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const toggleAllQuestions = () => {
    if (selectedQuestions.length === generatedQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(generatedQuestions.map(q => q.id))
    }
  }

  const removeQuestion = (questionId) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
    setSelectedQuestions(prev => prev.filter(id => id !== questionId))
  }

  const handleSaveQuestions = async () => {
    if (!user) {
      setError('Please log in to save questions')
      return
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question to save')
      return
    }

    if (!assessmentName.trim()) {
      setError('Please provide an assessment name')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Step 1: Create or find the assessment type
      const { data: assessmentType, error: assessmentError } = await assessmentTypesService.findOrCreateAssessmentType(
        user.id,
        {
          name: assessmentName.trim(),
          description: assessmentDescription.trim() || `AI-generated assessment about ${topic}`,
          icon: 'Brain',
          color: '#8b5cf6', // Purple for AI-generated
          isPublic: false
        }
      )

      if (assessmentError) {
        throw new Error(assessmentError.message || 'Failed to create assessment')
      }

      setCreatedAssessment(assessmentType)

      // Step 2: Prepare selected questions
      const questionsToSave = generatedQuestions
        .filter(q => selectedQuestions.includes(q.id))
        .map((q, index) => ({
          ...q,
          id: Date.now() + index // Ensure unique IDs
        }))

      // Step 3: Save questions to database
      const { error: questionsError } = await questionsService.addQuestions(
        user.id,
        assessmentType.name,
        questionsToSave,
        assessmentType.id
      )

      if (questionsError) {
        throw new Error(questionsError.message || 'Failed to save questions')
      }

      setStep(3)
      setSuccess(`Successfully saved ${questionsToSave.length} questions to "${assessmentType.name}"!`)
      
      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(assessmentType, questionsToSave)
      }

    } catch (err) {
      setError(err.message || 'Failed to save questions')
    } finally {
      setSaving(false)
    }
  }

  const handleStartAssessment = () => {
    if (createdAssessment) {
      window.location.href = `/assessment/${createdAssessment.id}`
    }
  }

  const handleGenerateMore = () => {
    setStep(1)
    setGeneratedQuestions([])
    setSelectedQuestions([])
    setSuccess('')
    setTopic('')
    setAssessmentName('')
    setAssessmentDescription('')
  }

  // Render Step 1: Generation Form
  const renderForm = () => (
    <>
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Topic *
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Machine Learning Basics, React Hooks, Python Data Structures"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Be specific for better questions (e.g., "React useEffect Hook" instead of just "React")
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            Number of Questions
          </label>
          <select
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              background: 'white'
            }}
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              background: 'white'
            }}
          >
            <option value="Mixed">Mixed (Recommended)</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Assessment Name
        </label>
        <input
          type="text"
          value={assessmentName}
          onChange={(e) => setAssessmentName(e.target.value)}
          placeholder="Name for the assessment (auto-filled from topic)"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Description (Optional)
        </label>
        <textarea
          value={assessmentDescription}
          onChange={(e) => setAssessmentDescription(e.target.value)}
          placeholder="Brief description of what this assessment covers..."
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        style={{
          width: '100%',
          background: loading ? '#ccc' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate Questions with AI
          </>
        )}
      </button>
    </>
  )

  // Render Step 2: Preview & Edit
  const renderPreview = () => (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
            Generated Questions ({generatedQuestions.length})
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
            {selectedQuestions.length} selected
          </p>
        </div>
        <button
          onClick={toggleAllQuestions}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          {selectedQuestions.length === generatedQuestions.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {generatedQuestions.map((question, index) => (
          <div
            key={question.id}
            style={{
              borderBottom: index < generatedQuestions.length - 1 ? '1px solid #e5e7eb' : 'none',
              background: selectedQuestions.includes(question.id) ? '#f0f9ff' : 'white'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer'
              }}
              onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
            >
              <input
                type="checkbox"
                checked={selectedQuestions.includes(question.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  toggleQuestionSelection(question.id)
                }}
                style={{ marginTop: '4px' }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: question.difficulty === 'Easy' ? '#dcfce7' :
                               question.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                    color: question.difficulty === 'Easy' ? '#166534' :
                           question.difficulty === 'Medium' ? '#92400e' : '#dc2626'
                  }}>
                    {question.difficulty}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {question.title}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#666',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {question.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeQuestion(question.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
                {expandedQuestion === question.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Expanded view */}
            {expandedQuestion === question.id && (
              <div style={{
                padding: '0 16px 16px 44px',
                background: '#f9fafb'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '13px', color: '#333' }}>Options:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        style={{
                          padding: '8px 12px',
                          marginBottom: '4px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          background: optIndex === question.correctAnswer ? '#dcfce7' : 'white',
                          border: optIndex === question.correctAnswer ? '1px solid #22c55e' : '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                        {optIndex === question.correctAnswer && (
                          <Check size={14} color="#22c55e" style={{ marginLeft: 'auto' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <strong style={{ fontSize: '13px', color: '#333' }}>Explanation:</strong>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setStep(1)}
          style={{
            flex: 1,
            background: 'white',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          ← Back to Edit
        </button>
        <button
          onClick={handleSaveQuestions}
          disabled={saving || selectedQuestions.length === 0}
          style={{
            flex: 2,
            background: saving ? '#ccc' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {saving ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save {selectedQuestions.length} Questions
            </>
          )}
        </button>
      </div>
    </>
  )

  // Render Step 3: Success
  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <Check size={40} color="white" />
      </div>

      <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>
        Questions Saved Successfully!
      </h3>
      
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        {selectedQuestions.length} questions have been added to "{createdAssessment?.name}"
      </p>

      <div style={{
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Brain size={24} color="#8b5cf6" />
          <div>
            <div style={{ fontWeight: '500', color: '#333' }}>{createdAssessment?.name}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {selectedQuestions.length} questions • AI Generated
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleGenerateMore}
          style={{
            flex: 1,
            background: 'white',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={18} />
          Generate More
        </button>
        <button
          onClick={handleStartAssessment}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Play size={18} />
          Take Assessment
        </button>
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: '12px',
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Close
      </button>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#333',
                margin: 0
              }}>
                AI Question Generator
              </h2>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                {step === 1 ? 'Enter a topic to generate questions' :
                 step === 2 ? 'Review and save questions' :
                 'Questions saved successfully'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step >= s ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#e5e7eb',
                color: step >= s ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  background: step > s ? '#8b5cf6' : '#e5e7eb'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && step !== 3 && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#166534',
            fontSize: '14px'
          }}>
            <Check size={18} />
            {success}
          </div>
        )}

        {/* Content based on step */}
        {step === 1 && renderForm()}
        {step === 2 && renderPreview()}
        {step === 3 && renderSuccess()}
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default GenerateQuestions
