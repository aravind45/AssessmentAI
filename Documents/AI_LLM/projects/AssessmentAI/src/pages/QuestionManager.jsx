import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Download, BarChart3 } from 'lucide-react'
import QuestionUpload from '../components/QuestionUpload'
import { questionManager } from '../utils/questionManager'
import * as XLSX from 'xlsx'

const QuestionManagerPage = () => {
  const navigate = useNavigate()
  const [selectedAssessment, setSelectedAssessment] = useState('coding')
  const [questionStats, setQuestionStats] = useState({})
  const [customQuestions, setCustomQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState(new Set())

  const assessmentTypes = [
    { id: 'coding', name: 'Coding Assessment' },
    { id: 'system-design', name: 'System Design' },
    { id: 'frontend', name: 'Frontend Development' },
    { id: 'behavioral', name: 'Behavioral Interview' },
    { id: 'personality', name: 'Personality Assessment' },
    { id: 'ai-business-analyst', name: 'AI Business Analyst' },
    { id: 'ai-solution-architect', name: 'AI Solution Architect' },
    { id: 'microservices', name: 'Microservices Architecture' },
    { id: 'event-driven-architecture', name: 'Event-Driven Architecture' },
    { id: 'serverless-architecture', name: 'Serverless Architecture' },
    { id: 'full-stack-development', name: 'Full-Stack Development' },
    { id: 'ap-physics-10th', name: 'AP Physics (10th Grade)' }
  ]

  useEffect(() => {
    updateStats()
    loadCustomQuestions()
  }, [selectedAssessment])

  const updateStats = () => {
    const stats = {}
    assessmentTypes.forEach(type => {
      stats[type.id] = questionManager.getQuestionStats(type.id)
    })
    setQuestionStats(stats)
  }

  const loadCustomQuestions = () => {
    const questions = questionManager.getCustomQuestions(selectedAssessment)
    setCustomQuestions(questions)
    setSelectedQuestions(new Set()) // Clear selection when switching assessments
  }

  const handleQuestionsUploaded = (questions, assessmentType) => {
    questionManager.addQuestions(assessmentType, questions)
    updateStats()
    if (assessmentType === selectedAssessment) {
      loadCustomQuestions()
    }
  }

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      questionManager.removeCustomQuestions(selectedAssessment, [questionId])
      updateStats()
      loadCustomQuestions()
    }
  }

  const handleDeleteSelected = () => {
    if (selectedQuestions.size === 0) return
    
    const confirmMessage = `Delete ${selectedQuestions.size} selected questions?\n\nThis action cannot be undone.`
    
    if (window.confirm(confirmMessage)) {
      questionManager.removeCustomQuestions(selectedAssessment, Array.from(selectedQuestions))
      updateStats()
      loadCustomQuestions()
    }
  }

  const handleQuestionSelect = (questionId, isSelected) => {
    const newSelected = new Set(selectedQuestions)
    if (isSelected) {
      newSelected.add(questionId)
    } else {
      newSelected.delete(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedQuestions(new Set(customQuestions.map(q => q.id)))
    } else {
      setSelectedQuestions(new Set())
    }
  }

  const handleClearAllQuestions = () => {
    const assessmentName = assessmentTypes.find(t => t.id === selectedAssessment)?.name
    const questionCount = customQuestions.length
    
    const confirmMessage = `⚠️ DELETE ALL CUSTOM QUESTIONS?\n\n` +
      `Assessment: ${assessmentName}\n` +
      `Questions to delete: ${questionCount}\n\n` +
      `This action cannot be undone!\n\n` +
      `💡 Tip: Click "Export" first to save your questions to Excel.\n\n` +
      `Are you sure you want to proceed?`
    
    if (window.confirm(confirmMessage)) {
      questionManager.clearCustomQuestions(selectedAssessment)
      updateStats()
      loadCustomQuestions()
      
      // Show success message
      alert(`✅ Successfully deleted ${questionCount} custom questions from ${assessmentName}`)
    }
  }

  const handleExportQuestions = () => {
    try {
      const questions = questionManager.exportCustomQuestions(selectedAssessment)
      
      const ws = XLSX.utils.json_to_sheet(questions)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Custom Questions')
      
      XLSX.writeFile(wb, `${selectedAssessment}-custom-questions.xlsx`)
    } catch (error) {
      alert(error.message)
    }
  }

  const renderQuestionPreview = (question) => {
    if (question.type === 'likert') {
      return (
        <div>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            "{question.statement}"
          </div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>
            Category: {question.category} | Trait: {question.trait}
          </div>
        </div>
      )
    } else if (question.type === 'text') {
      return (
        <div>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            {question.title}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            {question.description}
          </div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>
            Difficulty: {question.difficulty}
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            {question.title}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            {question.description}
          </div>
          <div style={{ fontSize: '12px', color: '#5f6368' }}>
            Difficulty: {question.difficulty} | Options: {question.options?.length || 0} | 
            Correct: {question.options?.[question.correctAnswer] || 'N/A'}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <h1 style={{ margin: 0 }}>Question Manager</h1>
      </div>

      {/* Assessment Type Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Select Assessment Type</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {assessmentTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedAssessment(type.id)}
              className={`btn ${selectedAssessment === type.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                textAlign: 'left',
                padding: '12px 16px'
              }}
            >
              <div style={{ fontWeight: '500' }}>{type.name}</div>
              {questionStats[type.id] && (
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {questionStats[type.id].total} questions 
                  ({questionStats[type.id].custom} custom)
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} />
          Question Statistics for {assessmentTypes.find(t => t.id === selectedAssessment)?.name}
        </h2>
        
        {questionStats[selectedAssessment] && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f0f7ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1565c0' }}>
                {questionStats[selectedAssessment].default}
              </div>
              <div style={{ fontSize: '14px', color: '#5f6368' }}>Default Questions</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: '#e8f5e8', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#137333' }}>
                {questionStats[selectedAssessment].custom}
              </div>
              <div style={{ fontSize: '14px', color: '#5f6368' }}>Custom Questions</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#856404' }}>
                {questionStats[selectedAssessment].total}
              </div>
              <div style={{ fontSize: '14px', color: '#5f6368' }}>Total Questions</div>
            </div>
          </div>
        )}
      </div>

      {/* Excel Format Guide */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Excel Format Guide</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#5f6368', marginBottom: '16px' }}>
            Your Excel file must follow the exact column format below for <strong>{assessmentTypes.find(t => t.id === selectedAssessment)?.name}</strong>:
          </p>
          
          {selectedAssessment === 'personality' && (
            <div>
              <h3 style={{ color: '#673ab7', marginBottom: '12px' }}>Personality Assessment Format</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>id</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>statement</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>type</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>category</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>trait</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>1</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>I enjoy working in teams more than working alone</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>likert</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>teamwork</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>collaboration</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>2</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>I prefer to lead projects rather than follow directions</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>likert</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>leadership</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>dominance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>Column Descriptions:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li><strong>id:</strong> Unique number for each question (1, 2, 3, etc.)</li>
                  <li><strong>statement:</strong> The personality statement to be rated (e.g., "I enjoy working in teams")</li>
                  <li><strong>type:</strong> Always use "likert" for personality questions</li>
                  <li><strong>category:</strong> Main category like "teamwork", "leadership", "communication", "stress", "planning"</li>
                  <li><strong>trait:</strong> Specific trait like "collaboration", "dominance", "assertiveness", "pressure_tolerance", "structure"</li>
                </ul>
              </div>
            </div>
          )}

          {selectedAssessment === 'behavioral' && (
            <div>
              <h3 style={{ color: '#ea4335', marginBottom: '12px' }}>Behavioral Interview Format</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>id</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>title</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>difficulty</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>description</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>type</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>sampleAnswer</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>criteria1</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>criteria2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>1</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Handling Conflict</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Medium</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Tell me about a time you had to resolve a conflict with a colleague</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>text</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Use STAR method: Situation, Task, Action, Result</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Shows empathy and listening</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Demonstrates problem-solving</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>Column Descriptions:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li><strong>id:</strong> Unique number for each question</li>
                  <li><strong>title:</strong> Short title for the question</li>
                  <li><strong>difficulty:</strong> Easy, Medium, or Hard</li>
                  <li><strong>description:</strong> The actual behavioral question</li>
                  <li><strong>type:</strong> Always use "text" for behavioral questions</li>
                  <li><strong>sampleAnswer:</strong> Guidance on how to structure a good answer</li>
                  <li><strong>criteria1-4:</strong> Evaluation criteria (you can use up to 4 criteria columns)</li>
                </ul>
              </div>
            </div>
          )}

          {!['personality', 'behavioral'].includes(selectedAssessment) && (
            <div>
              <h3 style={{ color: '#4285f4', marginBottom: '12px' }}>Multiple Choice Format</h3>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>id</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>title</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>difficulty</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>description</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>example</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>type</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>option1</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>option2</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>option3</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>option4</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>correctAnswer</th>
                      <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>1</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Two Sum Problem</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Easy</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Find two numbers that add up to target</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Input: [2,7,11,15], target=9</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>multiple-choice</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Nested loops O(n²)</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Hash map O(n)</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Sort + two pointers</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Binary search</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>2</td>
                      <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Hash map provides O(n) solution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>Column Descriptions:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li><strong>id:</strong> Unique number for each question</li>
                  <li><strong>title:</strong> Question title or name</li>
                  <li><strong>difficulty:</strong> Easy, Medium, or Hard</li>
                  <li><strong>description:</strong> The main question description</li>
                  <li><strong>example:</strong> Optional example or sample input/output</li>
                  <li><strong>type:</strong> Always use "multiple-choice" for technical questions</li>
                  <li><strong>option1-4:</strong> The four answer choices</li>
                  <li><strong>correctAnswer:</strong> Number (1-4) indicating which option is correct</li>
                  <li><strong>explanation:</strong> Why the correct answer is right</li>
                </ul>
              </div>
            </div>
          )}

          <div style={{ 
            padding: '16px',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <h4 style={{ color: '#856404', marginBottom: '8px' }}>📋 Important Notes:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6', color: '#856404' }}>
              <li>Column names must match exactly (case-sensitive)</li>
              <li>Don't leave required columns empty</li>
              <li>Use the "Download Template" button to get the correct format</li>
              <li>Save your file as .xlsx or .xls format</li>
              <li>For correctAnswer, use numbers 1-4 (not 0-3)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Component */}
      <QuestionUpload 
        onQuestionsUploaded={handleQuestionsUploaded}
        assessmentType={selectedAssessment}
      />

      {/* Custom Questions List */}
      {customQuestions.length > 0 && (
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ margin: 0 }}>
              Custom Questions ({customQuestions.length})
            </h2>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExportQuestions}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} />
                Export
              </button>
              
              {selectedQuestions.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffc107'
                  }}
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedQuestions.size})
                </button>
              )}
              
              <button
                onClick={handleClearAllQuestions}
                className="btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  backgroundColor: '#fce8e6',
                  color: '#d93025',
                  border: '1px solid #ea4335'
                }}
              >
                <Trash2 size={16} />
                Clear All ({customQuestions.length})
              </button>
            </div>
          </div>

          {/* Bulk Actions Info */}
          <div style={{ 
            padding: '12px',
            background: '#e3f2fd',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #2196f3'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
              🧹 Cleanup Options:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1565c0' }}>
              <li><strong>Individual Delete:</strong> Click trash icon next to any question</li>
              <li><strong>Clear All:</strong> Remove all {customQuestions.length} custom questions at once</li>
              <li><strong>Export First:</strong> Save questions to Excel before deleting</li>
              <li><strong>Re-upload Clean:</strong> Export, clean in Excel, then re-upload</li>
            </ul>
          </div>

          {/* Select All Checkbox */}
          <div style={{ 
            padding: '12px',
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '12px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={selectedQuestions.size === customQuestions.length && customQuestions.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Select All ({customQuestions.length} questions)
            </label>
          </div>

          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {customQuestions.map((question, index) => (
              <div key={question.id} style={{ 
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '12px',
                background: selectedQuestions.has(question.id) ? '#f0f7ff' : 'white',
                borderColor: selectedQuestions.has(question.id) ? '#2196f3' : '#e0e0e0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(question.id)}
                      onChange={(e) => handleQuestionSelect(question.id, e.target.checked)}
                      style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#5f6368',
                        marginBottom: '8px'
                      }}>
                        Question #{question.id} • {question.type}
                      </div>
                      {renderQuestionPreview(question)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="btn"
                    style={{ 
                      padding: '8px',
                      backgroundColor: '#fce8e6',
                      color: '#d93025',
                      border: '1px solid #ea4335',
                      marginLeft: '16px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customQuestions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#5f6368', marginBottom: '8px' }}>
            No Custom Questions Yet
          </h3>
          <p style={{ color: '#5f6368', margin: 0 }}>
            Upload an Excel file with your questions to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default QuestionManagerPage