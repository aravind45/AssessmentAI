import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MigrateAssessments = () => {
  const [migrationLog, setMigrationLog] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useAuth()

  const addLog = (message, type = 'info') => {
    setMigrationLog(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const migrateData = async () => {
    if (!user) {
      addLog('Please log in first!', 'error')
      return
    }

    setIsRunning(true)
    setMigrationLog([])
    addLog('Starting migration...', 'info')

    try {
      // Step 1: Get localStorage data
      const customAssessmentTypes = JSON.parse(localStorage.getItem('customAssessmentTypes') || '[]')
      addLog(`Found ${customAssessmentTypes.length} assessment types in localStorage`, 'info')

      if (customAssessmentTypes.length === 0) {
        addLog('No assessment types found in localStorage', 'warning')
        setIsRunning(false)
        return
      }

      // Step 2: Migrate assessment types
      for (const type of customAssessmentTypes) {
        addLog(`Migrating assessment type: ${type.name}`, 'info')
        
        const { error: typeError } = await supabase
          .from('custom_assessment_types')
          .upsert({
            id: type.id,
            user_id: user.id,
            name: type.name,
            description: type.description || '',
            icon: type.icon || 'FileText',
            color: type.color || '#f6d55c',
            is_public: type.isPublic || false
          })

        if (typeError) {
          addLog(`Error creating ${type.name}: ${typeError.message}`, 'error')
        } else {
          addLog(`✅ Created assessment type: ${type.name}`, 'success')
        }
      }

      // Step 3: Migrate questions
      for (const type of customAssessmentTypes) {
        const questions = JSON.parse(localStorage.getItem(`customQuestions_${type.id}`) || '[]')
        
        if (questions.length > 0) {
          addLog(`Migrating ${questions.length} questions for ${type.name}`, 'info')
          
          const questionsToInsert = questions.map(question => ({
            user_id: user.id,
            assessment_type: type.name,
            custom_assessment_id: type.id,
            question_data: question
          }))

          const { error: questionsError } = await supabase
            .from('custom_questions')
            .insert(questionsToInsert)

          if (questionsError) {
            addLog(`Error inserting questions for ${type.name}: ${questionsError.message}`, 'error')
          } else {
            addLog(`✅ Inserted ${questions.length} questions for ${type.name}`, 'success')
          }
        } else {
          addLog(`No questions found for ${type.name}`, 'warning')
        }
      }

      // Step 4: Verify migration
      addLog('Verifying migration...', 'info')
      
      const { data: dbTypes } = await supabase
        .from('custom_assessment_types')
        .select('*')
        .eq('user_id', user.id)

      const { data: dbQuestions } = await supabase
        .from('custom_questions')
        .select('*')
        .eq('user_id', user.id)

      addLog(`Database now has ${dbTypes?.length || 0} assessment types and ${dbQuestions?.length || 0} questions`, 'success')

      if (dbTypes) {
        for (const type of dbTypes) {
          const questionCount = dbQuestions?.filter(q => q.assessment_type === type.name).length || 0
          addLog(`${type.name}: ${questionCount} questions`, 'info')
        }
      }

      addLog('🎉 Migration completed successfully!', 'success')
      addLog('You can now try accessing your assessments again.', 'info')

    } catch (error) {
      addLog(`Migration failed: ${error.message}`, 'error')
      console.error('Migration error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear localStorage? This will remove all local data.')) {
      localStorage.removeItem('customAssessmentTypes')
      
      // Clear all question data
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('customQuestions_')) {
          localStorage.removeItem(key)
        }
      })
      
      addLog('localStorage cleared', 'info')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Migrate Assessments from localStorage to Database</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={migrateData}
          disabled={isRunning || !user}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? '🔄 Migrating...' : '🚀 Start Migration'}
        </button>
        
        <button 
          onClick={clearLocalStorage}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear localStorage
        </button>
      </div>

      {!user && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Please log in to run the migration.
        </div>
      )}

      {migrationLog.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3>Migration Log:</h3>
          {migrationLog.map((log, index) => (
            <div 
              key={index}
              style={{
                padding: '4px 0',
                color: log.type === 'error' ? '#d32f2f' : 
                       log.type === 'success' ? '#2e7d32' : 
                       log.type === 'warning' ? '#f57c00' : '#333',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            >
              <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MigrateAssessments