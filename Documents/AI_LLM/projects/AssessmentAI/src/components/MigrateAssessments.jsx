import React, { useState } from 'react'
import { Database, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { assessmentTypesService, questionsService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'

const MigrateAssessments = ({ onClose, onMigrationComplete }) => {
  const [migrating, setMigrating] = useState(false)
  const [migrationResults, setMigrationResults] = useState(null)
  const [error, setError] = useState('')

  const { user } = useAuth()

  // Get localStorage assessments
  const getLocalStorageAssessments = () => {
    try {
      const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '{}')
      const assessments = []

      Object.keys(customQuestions).forEach(assessmentType => {
        const questions = customQuestions[assessmentType]
        if (questions && questions.length > 0) {
          assessments.push({
            type: assessmentType,
            name: formatAssessmentName(assessmentType),
            questionCount: questions.length,
            questions: questions
          })
        }
      })

      return assessments
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return []
    }
  }

  const formatAssessmentName = (type) => {
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
    return names[type] || type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getAssessmentIcon = (type) => {
    const icons = {
      'coding': 'Code',
      'system-design': 'Database',
      'frontend': 'Globe',
      'behavioral': 'Users',
      'personality': 'Brain',
      'ai-business-analyst': 'Brain',
      'ai-solution-architect': 'Layers',
      'microservices': 'Layers',
      'event-driven-architecture': 'Zap',
      'serverless-architecture': 'Globe',
      'full-stack-development': 'Code',
      'ap-physics-10th': 'BookOpen'
    }
    return icons[type] || 'FileText'
  }

  const getAssessmentColor = (type) => {
    const colors = {
      'coding': '#4285f4',
      'system-design': '#34a853',
      'frontend': '#fbbc04',
      'behavioral': '#ea4335',
      'personality': '#9c27b0',
      'ai-business-analyst': '#673ab7',
      'ai-solution-architect': '#3f51b5',
      'microservices': '#00bcd4',
      'event-driven-architecture': '#ff5722',
      'serverless-architecture': '#795548',
      'full-stack-development': '#607d8b',
      'ap-physics-10th': '#e91e63'
    }
    return colors[type] || '#f6d55c'
  }

  const migrateAssessments = async () => {
    if (!user) {
      setError('User must be logged in to migrate assessments')
      return
    }

    setMigrating(true)
    setError('')
    
    try {
      const localAssessments = getLocalStorageAssessments()
      
      if (localAssessments.length === 0) {
        setError('No assessments found in localStorage to migrate')
        setMigrating(false)
        return
      }

      const results = {
        total: localAssessments.length,
        successful: 0,
        failed: 0,
        details: []
      }

      for (const assessment of localAssessments) {
        try {
          // Use upsert to handle duplicates at database level
          const { data: assessmentType, error: assessmentError } = await assessmentTypesService.upsertAssessmentType(user.id, {
            name: assessment.name,
            description: `Migrated from localStorage - ${assessment.questionCount} questions`,
            icon: getAssessmentIcon(assessment.type),
            color: getAssessmentColor(assessment.type),
            isPublic: false // Start as private, admin can make public later
          })

          if (assessmentError) {
            throw assessmentError
          }

          // Check if questions are already there
          const { data: existingQuestions } = await questionsService.getUserQuestions(user.id, assessmentType.id)
          
          if (existingQuestions && existingQuestions.length > 0) {
            results.successful++
            results.details.push({
              name: assessment.name,
              status: 'success',
              questionCount: assessment.questionCount,
              note: 'Assessment already exists with questions'
            })
            continue
          }

          // Add questions to database
          const { error: questionsError } = await questionsService.addQuestions(
            user.id,
            assessmentType.id, // Use the assessment type ID as assessment_type
            assessment.questions,
            assessmentType.id // Use as custom_assessment_id
          )

          if (questionsError) {
            throw questionsError
          }

          results.successful++
          results.details.push({
            name: assessment.name,
            status: 'success',
            questionCount: assessment.questionCount,
            note: 'Questions migrated successfully'
          })

        } catch (error) {
          results.failed++
          results.details.push({
            name: assessment.name,
            status: 'error',
            error: error.message
          })
        }
      }

      setMigrationResults(results)

      if (results.successful > 0) {
        // Clear localStorage after successful migration
        localStorage.removeItem('customQuestions')
        onMigrationComplete()
      }

    } catch (error) {
      setError(`Migration failed: ${error.message}`)
    } finally {
      setMigrating(false)
    }
  }

  const localAssessments = getLocalStorageAssessments()

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
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Database size={24} color="#f6d55c" />
            Migrate Assessments to Database
          </h2>
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

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#c33',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Debug: Show existing assessments */}
        <div style={{
          background: '#f0f7ff',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Debug: Current Database State</h4>
          <button
            onClick={async () => {
              try {
                const { data: existingTypes } = await assessmentTypesService.getUserAssessmentTypes(user.id)
                console.log('Existing assessment types:', existingTypes)
                alert(`Found ${existingTypes?.length || 0} existing assessment types. Check console for details.`)
              } catch (error) {
                console.error('Error fetching assessments:', error)
                alert(`Error: ${error.message}`)
              }
            }}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Check Existing Assessments
          </button>
          
          <button
            onClick={async () => {
              if (confirm('This will delete ALL your custom assessment types and questions. Are you sure?')) {
                try {
                  const { data: existingTypes } = await assessmentTypesService.getUserAssessmentTypes(user.id)
                  
                  for (const type of existingTypes || []) {
                    await assessmentTypesService.deleteAssessmentType(user.id, type.id)
                  }
                  
                  alert('All assessments cleared. You can now try migration again.')
                } catch (error) {
                  alert(`Error clearing assessments: ${error.message}`)
                }
              }
            }}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Clear All Database Assessments
          </button>
        </div>

        {/* Migration Results */}
        {migrationResults && (
          <div style={{
            background: '#f0f7ff',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Migration Results</h3>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#4caf50', fontWeight: '600' }}>
                ✅ {migrationResults.successful} successful
              </span>
              {migrationResults.failed > 0 && (
                <span style={{ color: '#f44336', fontWeight: '600', marginLeft: '16px' }}>
                  ❌ {migrationResults.failed} failed
                </span>
              )}
            </div>
            
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {migrationResults.details.map((detail, index) => (
                <div key={index} style={{
                  padding: '8px',
                  background: detail.status === 'success' ? '#e8f5e8' : '#fce8e6',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '500' }}>
                    {detail.status === 'success' ? '✅' : '❌'} {detail.name}
                  </div>
                  {detail.status === 'success' && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {detail.questionCount} questions migrated
                      {detail.note && <div style={{ fontStyle: 'italic' }}>({detail.note})</div>}
                    </div>
                  )}
                  {detail.status === 'error' && (
                    <div style={{ fontSize: '12px', color: '#f44336' }}>
                      Error: {detail.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment List */}
        {!migrationResults && (
          <div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Found {localAssessments.length} assessments in localStorage that can be migrated to the database.
              This will allow you to manage them through the admin panel.
            </p>

            {localAssessments.length > 0 ? (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Assessments to Migrate:</h4>
                {localAssessments.map((assessment, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < localAssessments.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{assessment.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {assessment.questionCount} questions
                      </div>
                    </div>
                    <div style={{
                      background: getAssessmentColor(assessment.type) + '20',
                      color: getAssessmentColor(assessment.type),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {assessment.type}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666'
              }}>
                <Database size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3>No Assessments to Migrate</h3>
                <p>All assessments are already in the database or no custom assessments found.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              
              {localAssessments.length > 0 && (
                <button
                  onClick={migrateAssessments}
                  disabled={migrating}
                  style={{
                    background: migrating ? '#ccc' : '#f6d55c',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: migrating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {migrating ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #666',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Migrate to Database
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Actions */}
        {migrationResults && migrationResults.successful > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              style={{
                background: '#f6d55c',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={16} />
              Done
            </button>
          </div>
        )}
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

export default MigrateAssessments