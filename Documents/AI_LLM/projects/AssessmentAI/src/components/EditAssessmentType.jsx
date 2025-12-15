import React, { useState } from 'react'
import { X, FileText, Brain, Code, Users, Globe, Layers, Zap, Database, Settings, BookOpen } from 'lucide-react'
import { assessmentTypesService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'

const EditAssessmentType = ({ assessment, onAssessmentUpdated, onClose }) => {
  const [name, setName] = useState(assessment.name)
  const [description, setDescription] = useState(assessment.description || '')
  const [selectedIcon, setSelectedIcon] = useState(assessment.icon || 'FileText')
  const [selectedColor, setSelectedColor] = useState(assessment.color || '#f6d55c')
  const [isPublic, setIsPublic] = useState(assessment.is_public || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  const availableIcons = [
    { name: 'FileText', component: FileText, label: 'Document' },
    { name: 'Brain', component: Brain, label: 'Brain/AI' },
    { name: 'Code', component: Code, label: 'Code' },
    { name: 'Users', component: Users, label: 'People' },
    { name: 'Globe', component: Globe, label: 'Web' },
    { name: 'Layers', component: Layers, label: 'Layers' },
    { name: 'Zap', component: Zap, label: 'Energy' },
    { name: 'Database', component: Database, label: 'Database' },
    { name: 'Settings', component: Settings, label: 'Settings' },
    { name: 'BookOpen', component: BookOpen, label: 'Book' }
  ]

  const availableColors = [
    '#f6d55c', '#ff8a65', '#4db6ac', '#ffb74d', '#81c784',
    '#64b5f6', '#ba68c8', '#f06292', '#ff7043', '#90a4ae'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Assessment name is required')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await assessmentTypesService.updateAssessmentType(user.id, assessment.id, {
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        is_public: isPublic
      })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('You already have an assessment with this name')
        } else {
          setError(error.message)
        }
      } else {
        onAssessmentUpdated(data)
        onClose()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
        maxWidth: '500px',
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
            margin: 0
          }}>
            Edit Assessment
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
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Assessment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Advanced Mathematics, Marketing Fundamentals"
              required
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

          {/* Description Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this assessment covers..."
              rows={3}
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

          {/* Icon Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Choose Icon
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {availableIcons.map((icon) => {
                const IconComponent = icon.component
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    style={{
                      padding: '12px',
                      border: selectedIcon === icon.name ? `2px solid ${selectedColor}` : '1px solid #ddd',
                      borderRadius: '8px',
                      background: selectedIcon === icon.name ? `${selectedColor}20` : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <IconComponent size={20} color={selectedIcon === icon.name ? selectedColor : '#666'} />
                    <span style={{
                      fontSize: '10px',
                      color: selectedIcon === icon.name ? selectedColor : '#666'
                    }}>
                      {icon.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Choose Color
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: color,
                    border: selectedColor === color ? '3px solid #333' : '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Public Option */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px', color: '#333' }}>
                Make this assessment public (others can see and use it)
              </span>
            </label>
          </div>

          {/* Preview */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Preview:</h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              {React.createElement(availableIcons.find(i => i.name === selectedIcon)?.component || FileText, {
                size: 24,
                color: selectedColor
              })}
              <div>
                <div style={{ fontWeight: '500', color: '#333' }}>
                  {name || 'Assessment Name'}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {description || 'Assessment description will appear here'}
                </div>
                <div style={{ fontSize: '12px', color: isPublic ? '#4caf50' : '#ff9800', marginTop: '4px' }}>
                  {isPublic ? '🌐 Public' : '🔒 Private'}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#ccc' : selectedColor,
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating...' : 'Update Assessment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditAssessmentType