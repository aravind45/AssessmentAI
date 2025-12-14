import React, { useState } from 'react'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const QuestionUpload = ({ onQuestionsUploaded, assessmentType }) => {
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadedQuestions, setUploadedQuestions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Template structure for different question types
  const getTemplate = (type) => {
    const templates = {
      'multiple-choice': {
        id: 1,
        title: 'Sample Question Title',
        difficulty: 'Medium',
        description: 'Question description here',
        example: 'Example: Input/Output (optional)',
        type: 'multiple-choice',
        option1: 'First option',
        option2: 'Second option', 
        option3: 'Third option',
        option4: 'Fourth option',
        correctAnswer: 2,
        explanation: 'Explanation of correct answer'
      },
      'text': {
        id: 1,
        title: 'Behavioral Question Title',
        difficulty: 'Medium',
        description: 'Behavioral question description',
        type: 'text',
        sampleAnswer: 'Sample answer guidance',
        criteria1: 'First evaluation criteria',
        criteria2: 'Second evaluation criteria',
        criteria3: 'Third evaluation criteria',
        criteria4: 'Fourth evaluation criteria'
      },
      'likert': {
        id: 1,
        statement: 'I enjoy working in teams more than working alone',
        type: 'likert',
        category: 'teamwork',
        trait: 'collaboration'
      }
    }
    
    return templates[type] || templates['multiple-choice']
  }

  const downloadTemplate = () => {
    const questionType = assessmentType === 'personality' ? 'likert' : 
                        assessmentType === 'behavioral' ? 'text' : 'multiple-choice'
    
    const template = getTemplate(questionType)
    const templateData = [template]
    
    // Add 4 more sample rows
    for (let i = 2; i <= 5; i++) {
      const row = { ...template, id: i }
      if (questionType === 'multiple-choice') {
        row.title = `Sample Question ${i}`
        row.description = `Description for question ${i}`
      } else if (questionType === 'text') {
        row.title = `Behavioral Question ${i}`
        row.description = `Behavioral question description ${i}`
      } else if (questionType === 'likert') {
        row.statement = `Sample statement ${i} for personality assessment`
      }
      templateData.push(row)
    }

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    
    // Auto-size columns
    const colWidths = Object.keys(template).map(key => ({
      wch: Math.max(key.length, 20)
    }))
    ws['!cols'] = colWidths
    
    XLSX.writeFile(wb, `${assessmentType}-questions-template.xlsx`)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsProcessing(true)
    setUploadStatus(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error('No data found in the Excel file')
      }

      // Validate and transform questions based on assessment type
      const transformedQuestions = transformQuestions(jsonData, assessmentType)
      
      if (transformedQuestions.length === 0) {
        throw new Error('No valid questions found in the file')
      }

      setUploadedQuestions(transformedQuestions)
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${transformedQuestions.length} questions!`
      })

      // Call parent callback with new questions
      onQuestionsUploaded(transformedQuestions, assessmentType)

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${error.message}`
      })
    } finally {
      setIsProcessing(false)
      event.target.value = '' // Reset file input
    }
  }

  const transformQuestions = (data, type) => {
    return data.map((row, index) => {
      try {
        if (type === 'personality') {
          return {
            id: row.id || index + 1,
            statement: row.statement || '',
            type: 'likert',
            category: row.category || 'general',
            trait: row.trait || 'general'
          }
        } else if (type === 'behavioral') {
          return {
            id: row.id || index + 1,
            title: row.title || '',
            difficulty: row.difficulty || 'Medium',
            description: row.description || '',
            type: 'text',
            sampleAnswer: row.sampleAnswer || '',
            evaluationCriteria: [
              row.criteria1,
              row.criteria2,
              row.criteria3,
              row.criteria4
            ].filter(Boolean)
          }
        } else {
          // Multiple choice questions
          return {
            id: row.id || index + 1,
            title: row.title || '',
            difficulty: row.difficulty || 'Medium',
            description: row.description || '',
            example: row.example || '',
            type: 'multiple-choice',
            options: [
              row.option1,
              row.option2,
              row.option3,
              row.option4
            ].filter(Boolean),
            correctAnswer: parseInt(row.correctAnswer) - 1 || 0, // Convert to 0-based index
            explanation: row.explanation || ''
          }
        }
      } catch (error) {
        console.warn(`Error processing row ${index + 1}:`, error)
        return null
      }
    }).filter(Boolean) // Remove null entries
  }

  const getInstructions = () => {
    if (assessmentType === 'personality') {
      return (
        <div>
          <h4>Personality Assessment Format:</h4>
          <ul>
            <li><strong>statement:</strong> The statement to rate (e.g., "I enjoy working in teams")</li>
            <li><strong>category:</strong> Category like "teamwork", "leadership", "communication"</li>
            <li><strong>trait:</strong> Specific trait like "collaboration", "dominance", "assertiveness"</li>
          </ul>
        </div>
      )
    } else if (assessmentType === 'behavioral') {
      return (
        <div>
          <h4>Behavioral Assessment Format:</h4>
          <ul>
            <li><strong>title:</strong> Question title</li>
            <li><strong>description:</strong> The behavioral question</li>
            <li><strong>sampleAnswer:</strong> Guidance for good answers</li>
            <li><strong>criteria1-4:</strong> Evaluation criteria</li>
          </ul>
        </div>
      )
    } else {
      return (
        <div>
          <h4>Multiple Choice Format:</h4>
          <ul>
            <li><strong>title:</strong> Question title</li>
            <li><strong>description:</strong> Question description</li>
            <li><strong>option1-4:</strong> Answer options</li>
            <li><strong>correctAnswer:</strong> Number (1-4) of correct option</li>
            <li><strong>explanation:</strong> Why the answer is correct</li>
          </ul>
        </div>
      )
    }
  }

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FileSpreadsheet size={24} />
        Upload Custom Questions
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '16px', color: '#5f6368' }}>
          Upload your own questions for the <strong>{assessmentType}</strong> assessment using an Excel file.
        </p>
        
        <div style={{ 
          padding: '12px',
          background: '#e3f2fd',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
            💡 <strong>Tip:</strong> Download the template first to see the exact Excel format required. 
            Check the "Excel Format Guide" section above for detailed column descriptions.
          </p>
        </div>
        
        {getInstructions()}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={downloadTemplate}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={20} />
          Download Template
        </button>

        <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Upload size={20} />
          {isProcessing ? 'Processing...' : 'Upload Questions'}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {uploadStatus && (
        <div style={{ 
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: uploadStatus.type === 'success' ? '#e8f5e8' : '#fce8e6',
          color: uploadStatus.type === 'success' ? '#137333' : '#d93025',
          border: `1px solid ${uploadStatus.type === 'success' ? '#34a853' : '#ea4335'}`
        }}>
          {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {uploadStatus.message}
        </div>
      )}

      {uploadedQuestions.length > 0 && (
        <div style={{ 
          padding: '16px',
          background: '#f0f7ff',
          borderRadius: '8px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
            Preview of Uploaded Questions:
          </h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {uploadedQuestions.slice(0, 3).map((q, index) => (
              <div key={index} style={{ 
                marginBottom: '8px',
                padding: '8px',
                background: 'white',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <strong>Q{q.id}:</strong> {q.title || q.statement || q.description}
              </div>
            ))}
            {uploadedQuestions.length > 3 && (
              <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#5f6368' }}>
                ... and {uploadedQuestions.length - 3} more questions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionUpload