import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  Plus, 
  FileText, 
  Brain, 
  Code, 
  Users, 
  Globe, 
  Layers, 
  Zap, 
  Database, 
  Settings, 
  BookOpen, 
  Edit2,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Play,
  MoreVertical,
  FolderPlus
} from 'lucide-react'
import CreateAssessmentType from '../components/CreateAssessmentType'
import EditAssessmentType from '../components/EditAssessmentType'
import GenerateQuestions from '../components/GenerateQuestions'
import { assessmentTypesService, questionsService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'
import * as XLSX from 'xlsx'

const QuestionManagerPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [customAssessmentTypes, setCustomAssessmentTypes] = useState([])
  const [questionStats, setQuestionStats] = useState({})
  const [customQuestions, setCustomQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState(new Set())
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showCreateAssessment, setShowCreateAssessment] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  
  // UI state
  const [showExcelGuide, setShowExcelGuide] = useState(false)
  const [uploadDragOver, setUploadDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // { type: 'success' | 'error', message: '' }

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const icons = { FileText, Brain, Code, Users, Globe, Layers, Zap, Database, Settings, BookOpen }
    return icons[iconName] || FileText
  }

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadCustomAssessmentTypes()
    }
  }, [user])

  // Load questions when assessment is selected
  useEffect(() => {
    if (selectedAssessment) {
      loadCustomQuestions()
    } else {
      setCustomQuestions([])
    }
  }, [selectedAssessment])

  const loadCustomAssessmentTypes = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await assessmentTypesService.getUserAssessmentTypes(user.id)
      
      if (!error && data) {
        setCustomAssessmentTypes(data)
        
        // Load question stats
        const { data: stats } = await questionsService.getQuestionStats(user.id)
        setQuestionStats(stats || {})
      }
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomQuestions = async () => {
    if (!user || !selectedAssessment) return

    try {
      const { data, error } = await questionsService.getUserQuestions(user.id, selectedAssessment.name)
      
      if (!error && data) {
        const questions = data.map(record => ({
          ...record.question_data,
          dbId: record.id,
          isCustom: true
        }))
        setCustomQuestions(questions)
      }
    } catch (error) {
      console.error('Error loading questions:', error)
      setCustomQuestions([])
    }
    setSelectedQuestions(new Set())
  }

  const handleAssessmentCreated = (assessment) => {
    setCustomAssessmentTypes(prev => [assessment, ...prev])
    setSelectedAssessment(assessment)
    setShowCreateAssessment(false)
  }

  const handleAssessmentUpdated = (updated) => {
    setCustomAssessmentTypes(prev => prev.map(a => a.id === updated.id ? updated : a))
    if (selectedAssessment?.id === updated.id) {
      setSelectedAssessment(updated)
    }
    setEditingAssessment(null)
  }

  const handleDeleteAssessment = async (assessment) => {
    if (!window.confirm(`Delete "${assessment.name}" and all its questions? This cannot be undone.`)) return

    try {
      await assessmentTypesService.deleteAssessmentType(user.id, assessment.id)
      setCustomAssessmentTypes(prev => prev.filter(a => a.id !== assessment.id))
      if (selectedAssessment?.id === assessment.id) {
        setSelectedAssessment(null)
      }
    } catch (error) {
      alert('Failed to delete assessment')
    }
  }

  const handleQuestionsGenerated = async (assessment, questions) => {
    await loadCustomAssessmentTypes()
    setSelectedAssessment(assessment)
    await loadCustomQuestions()
    setShowAIGenerator(false)
  }

  // Excel Upload Handling
  const handleFileDrop = (e) => {
    e.preventDefault()
    setUploadDragOver(false)
    const file = e.dataTransfer?.files[0]
    if (file) processExcelFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) processExcelFile(file)
  }

  const processExcelFile = async (file) => {
    if (!selectedAssessment) {
      setUploadStatus({ type: 'error', message: 'Please select an assessment first' })
      return
    }

    try {
      setUploadStatus({ type: 'loading', message: 'Processing file...' })
      
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        setUploadStatus({ type: 'error', message: 'No data found in file' })
        return
      }

      // Transform to question format
      const questions = jsonData.map((row, index) => ({
        id: Date.now() + index,
        title: row.title || row.question || `Question ${index + 1}`,
        difficulty: row.difficulty || 'Medium',
        description: row.description || row.question || row.title || '',
        example: row.example || '',
        type: row.type || 'multiple-choice',
        options: [
          row.option1 || row.optionA || row['Option A'] || '',
          row.option2 || row.optionB || row['Option B'] || '',
          row.option3 || row.optionC || row['Option C'] || '',
          row.option4 || row.optionD || row['Option D'] || ''
        ].filter(opt => opt),
        correctAnswer: parseInt(row.correctAnswer || row.correct || row.answer || 1) - 1,
        explanation: row.explanation || '',
        isCustom: true
      }))

      // Validate
      const validQuestions = questions.filter(q => 
        q.title && q.options.length >= 2 && q.correctAnswer >= 0
      )

      if (validQuestions.length === 0) {
        setUploadStatus({ type: 'error', message: 'No valid questions found. Check the format.' })
        return
      }

      // Save to database
      const { error } = await questionsService.addQuestions(
        user.id,
        selectedAssessment.name,
        validQuestions,
        selectedAssessment.id
      )

      if (error) throw error

      setUploadStatus({ 
        type: 'success', 
        message: `Successfully uploaded ${validQuestions.length} questions!` 
      })
      
      // Refresh data
      await loadCustomAssessmentTypes()
      await loadCustomQuestions()
      
      setTimeout(() => setUploadStatus(null), 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ type: 'error', message: 'Failed to process file. Check the format.' })
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        title: 'Sample Question Title',
        difficulty: 'Medium',
        description: 'What is the full question text?',
        example: 'Optional example or context',
        type: 'multiple-choice',
        option1: 'First option',
        option2: 'Second option (correct)',
        option3: 'Third option',
        option4: 'Fourth option',
        correctAnswer: 2,
        explanation: 'Explanation of why option 2 is correct'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    XLSX.writeFile(wb, 'question_template.xlsx')
  }

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm('Delete this question?')) return

    try {
      await questionsService.deleteQuestions(user.id, [question.dbId])
      await loadCustomQuestions()
      await loadCustomAssessmentTypes()
    } catch (error) {
      alert('Failed to delete question')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedQuestions.size === 0) return
    if (!window.confirm(`Delete ${selectedQuestions.size} selected questions?`)) return

    try {
      const dbIds = customQuestions
        .filter(q => selectedQuestions.has(q.id))
        .map(q => q.dbId)
        .filter(Boolean)

      await questionsService.deleteQuestions(user.id, dbIds)
      await loadCustomQuestions()
      await loadCustomAssessmentTypes()
    } catch (error) {
      alert('Failed to delete questions')
    }
  }

  const handleExportQuestions = () => {
    if (customQuestions.length === 0) return

    const exportData = customQuestions.map(q => ({
      title: q.title,
      difficulty: q.difficulty,
      description: q.description,
      example: q.example || '',
      type: q.type,
      option1: q.options?.[0] || '',
      option2: q.options?.[1] || '',
      option3: q.options?.[2] || '',
      option4: q.options?.[3] || '',
      correctAnswer: (q.correctAnswer || 0) + 1,
      explanation: q.explanation || ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    XLSX.writeFile(wb, `${selectedAssessment?.name || 'questions'}_export.xlsx`)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
          Question Manager
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Create assessments and add questions using AI or Excel upload
        </p>
      </div>

      {/* Assessments Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>
            Your Assessments
          </h2>
          <button
            onClick={() => setShowCreateAssessment(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            New Assessment
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading assessments...
          </div>
        ) : customAssessmentTypes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #e5e7eb'
          }}>
            <FolderPlus size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
              No assessments yet
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Create your first assessment to start adding questions
            </p>
            <button
              onClick={() => setShowCreateAssessment(true)}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Assessment
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {customAssessmentTypes.map(assessment => {
              const IconComponent = getIconComponent(assessment.icon)
              const isSelected = selectedAssessment?.id === assessment.id
              const questionCount = questionStats[assessment.name] || 0

              return (
                <div
                  key={assessment.id}
                  onClick={() => setSelectedAssessment(assessment)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${assessment.color || '#667eea'}` : '1px solid #e5e7eb',
                    background: isSelected ? `${assessment.color || '#667eea'}10` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: assessment.color || '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                        {assessment.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {questionCount} questions
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingAssessment(assessment) }}
                      style={{
                        flex: 1,
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        color: '#666'
                      }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment) }}
                      style={{
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px'
                    }}>
                      <CheckCircle size={18} color={assessment.color || '#667eea'} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Questions Section - Shows when assessment is selected */}
      {selectedAssessment && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: '0 0 4px 0' }}>
              Add Questions to "{selectedAssessment.name}"
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Choose how you want to add questions
            </p>
          </div>

          {/* Two Options Side by Side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* AI Generate Option */}
            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #8b5cf6',
              background: '#faf5ff',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                RECOMMENDED
              </div>
              
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Sparkles size={24} color="white" />
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Generate with AI
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Enter a topic and let AI create questions instantly with answers and explanations
              </p>
              
              <button
                onClick={() => setShowAIGenerator(true)}
                style={{
                  width: '100%',
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
                <Sparkles size={18} />
                Generate Questions
              </button>
            </div>

            {/* Excel Upload Option */}
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: uploadDragOver ? '2px solid #f6d55c' : '2px dashed #e5e7eb',
                background: uploadDragOver ? '#fffbeb' : '#fafafa',
                transition: 'all 0.2s'
              }}
              onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true) }}
              onDragLeave={() => setUploadDragOver(false)}
              onDrop={handleFileDrop}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f6d55c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Upload size={24} color="white" />
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Upload Excel File
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Import questions from your own Excel or CSV file
              </p>

              {uploadStatus && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  background: uploadStatus.type === 'success' ? '#dcfce7' : 
                             uploadStatus.type === 'error' ? '#fef2f2' : '#f3f4f6',
                  color: uploadStatus.type === 'success' ? '#166534' : 
                         uploadStatus.type === 'error' ? '#dc2626' : '#666'
                }}>
                  {uploadStatus.type === 'success' ? <CheckCircle size={16} /> : 
                   uploadStatus.type === 'error' ? <AlertCircle size={16} /> : null}
                  {uploadStatus.message}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{
                  flex: 1,
                  background: '#f6d55c',
                  color: '#333',
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
                }}>
                  <Upload size={18} />
                  Select File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={downloadTemplate}
                  style={{
                    background: 'white',
                    color: '#666',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={16} />
                  Template
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Excel Format Guide */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setShowExcelGuide(!showExcelGuide)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#f9fafb',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}
            >
              <span>📋 Excel Format Guide</span>
              {showExcelGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showExcelGuide && (
              <div style={{ padding: '16px', fontSize: '13px', color: '#555' }}>
                <p style={{ marginBottom: '12px' }}>
                  Your Excel file should have these columns:
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {['title', 'description', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'explanation'].map(col => (
                    <code key={col} style={{
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {col}
                    </code>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  <strong>Note:</strong> correctAnswer should be 1-4 (not 0-3). Download the template for a working example.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions List - Shows when assessment is selected */}
      {selectedAssessment && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>
                Questions ({customQuestions.length})
              </h2>
              {selectedQuestions.size > 0 && (
                <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                  {selectedQuestions.size} selected
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {customQuestions.length > 0 && (
                <>
                  <button
                    onClick={handleExportQuestions}
                    style={{
                      background: 'white',
                      color: '#666',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={14} />
                    Export
                  </button>
                  {selectedQuestions.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Selected
                    </button>
                  )}
                </>
              )}
              
              {customQuestions.length > 0 && (
                <button
                  onClick={() => navigate(`/assessment/${selectedAssessment.id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Play size={14} />
                  Take Assessment
                </button>
              )}
            </div>
          </div>

          {customQuestions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <FileText size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>
                No questions yet
              </h3>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Generate questions with AI or upload an Excel file to get started
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.size === customQuestions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuestions(new Set(customQuestions.map(q => q.id)))
                      } else {
                        setSelectedQuestions(new Set())
                      }
                    }}
                  />
                  Select All
                </label>
              </div>

              {/* Questions */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {customQuestions.map((question, index) => (
                  <div
                    key={question.id || index}
                    style={{
                      padding: '16px',
                      border: selectedQuestions.has(question.id) ? '2px solid #667eea' : '1px solid #e5e7eb',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      background: selectedQuestions.has(question.id) ? '#f0f4ff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedQuestions)
                          if (e.target.checked) {
                            newSet.add(question.id)
                          } else {
                            newSet.delete(question.id)
                          }
                          setSelectedQuestions(newSet)
                        }}
                        style={{ marginTop: '4px' }}
                      />
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#888' }}>#{index + 1}</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: question.difficulty === 'Easy' ? '#dcfce7' :
                                       question.difficulty === 'Hard' ? '#fef2f2' : '#fef3c7',
                            color: question.difficulty === 'Easy' ? '#166534' :
                                   question.difficulty === 'Hard' ? '#dc2626' : '#92400e'
                          }}>
                            {question.difficulty || 'Medium'}
                          </span>
                          {question.isAIGenerated && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '500',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#f3e8ff',
                              color: '#7c3aed'
                            }}>
                              AI Generated
                            </span>
                          )}
                        </div>
                        
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0 0 4px' }}>
                          {question.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                          {question.description?.substring(0, 150)}{question.description?.length > 150 ? '...' : ''}
                        </p>
                        
                        {question.options && (
                          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {question.options.map((opt, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  background: i === question.correctAnswer ? '#dcfce7' : '#f3f4f6',
                                  color: i === question.correctAnswer ? '#166534' : '#666',
                                  border: i === question.correctAnswer ? '1px solid #22c55e' : '1px solid #e5e7eb'
                                }}
                              >
                                {String.fromCharCode(65 + i)}. {opt?.substring(0, 30)}{opt?.length > 30 ? '...' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        style={{
                          background: '#fef2f2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State - No assessment selected */}
      {!selectedAssessment && customAssessmentTypes.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Brain size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
            Select an Assessment
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Click on an assessment above to add or manage questions
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreateAssessment && (
        <CreateAssessmentType
          onAssessmentCreated={handleAssessmentCreated}
          onClose={() => setShowCreateAssessment(false)}
        />
      )}

      {editingAssessment && (
        <EditAssessmentType
          assessment={editingAssessment}
          onAssessmentUpdated={handleAssessmentUpdated}
          onClose={() => setEditingAssessment(null)}
        />
      )}

      {showAIGenerator && (
        <GenerateQuestions
          onClose={() => setShowAIGenerator(false)}
          onQuestionsGenerated={handleQuestionsGenerated}
        />
      )}
    </div>
  )
}

export default QuestionManagerPage
