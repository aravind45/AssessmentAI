// Question management utilities for handling uploaded questions
import { questionBank as defaultQuestions } from '../data/questions'

class QuestionManager {
  constructor() {
    this.customQuestions = this.loadCustomQuestions()
  }

  // Load custom questions from localStorage
  loadCustomQuestions() {
    try {
      const stored = localStorage.getItem('customQuestions')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading custom questions:', error)
      return {}
    }
  }

  // Save custom questions to localStorage
  saveCustomQuestions() {
    try {
      localStorage.setItem('customQuestions', JSON.stringify(this.customQuestions))
    } catch (error) {
      console.error('Error saving custom questions:', error)
    }
  }

  // Add uploaded questions to a specific assessment type
  addQuestions(assessmentType, questions) {
    if (!this.customQuestions[assessmentType]) {
      this.customQuestions[assessmentType] = []
    }

    // Ensure unique IDs by finding the highest existing ID
    const existingQuestions = this.getQuestions(assessmentType)
    const maxId = existingQuestions.reduce((max, q) => Math.max(max, q.id || 0), 0)

    // Assign new IDs to uploaded questions
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: maxId + index + 1,
      isCustom: true // Mark as custom question
    }))

    this.customQuestions[assessmentType].push(...questionsWithIds)
    this.saveCustomQuestions()

    return questionsWithIds
  }

  // Get all questions for an assessment type (default + custom)
  getQuestions(assessmentType) {
    const defaultQs = defaultQuestions[assessmentType] || []
    const customQs = this.customQuestions[assessmentType] || []
    return [...defaultQs, ...customQs]
  }

  // Get only custom questions for an assessment type
  getCustomQuestions(assessmentType) {
    return this.customQuestions[assessmentType] || []
  }

  // Remove custom questions
  removeCustomQuestions(assessmentType, questionIds) {
    if (this.customQuestions[assessmentType]) {
      this.customQuestions[assessmentType] = this.customQuestions[assessmentType]
        .filter(q => !questionIds.includes(q.id))
      this.saveCustomQuestions()
    }
  }

  // Clear all custom questions for an assessment type
  clearCustomQuestions(assessmentType) {
    if (this.customQuestions[assessmentType]) {
      delete this.customQuestions[assessmentType]
      this.saveCustomQuestions()
    }
  }

  // Get question statistics
  getQuestionStats(assessmentType) {
    const defaultCount = (defaultQuestions[assessmentType] || []).length
    const customCount = (this.customQuestions[assessmentType] || []).length
    
    return {
      default: defaultCount,
      custom: customCount,
      total: defaultCount + customCount
    }
  }

  // Export custom questions to Excel format
  exportCustomQuestions(assessmentType) {
    const questions = this.getCustomQuestions(assessmentType)
    
    if (questions.length === 0) {
      throw new Error('No custom questions to export')
    }

    // Transform questions back to Excel format
    return questions.map(q => {
      if (q.type === 'likert') {
        return {
          id: q.id,
          statement: q.statement,
          type: q.type,
          category: q.category,
          trait: q.trait
        }
      } else if (q.type === 'text') {
        return {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          description: q.description,
          type: q.type,
          sampleAnswer: q.sampleAnswer,
          criteria1: q.evaluationCriteria?.[0] || '',
          criteria2: q.evaluationCriteria?.[1] || '',
          criteria3: q.evaluationCriteria?.[2] || '',
          criteria4: q.evaluationCriteria?.[3] || ''
        }
      } else {
        return {
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          description: q.description,
          example: q.example,
          type: q.type,
          option1: q.options?.[0] || '',
          option2: q.options?.[1] || '',
          option3: q.options?.[2] || '',
          option4: q.options?.[3] || '',
          correctAnswer: (q.correctAnswer || 0) + 1, // Convert back to 1-based
          explanation: q.explanation
        }
      }
    })
  }

  // Validate question format
  validateQuestion(question, assessmentType) {
    const errors = []

    if (assessmentType === 'personality') {
      if (!question.statement) errors.push('Statement is required')
      if (!question.category) errors.push('Category is required')
      if (!question.trait) errors.push('Trait is required')
    } else if (assessmentType === 'behavioral') {
      if (!question.title) errors.push('Title is required')
      if (!question.description) errors.push('Description is required')
    } else {
      if (!question.title) errors.push('Title is required')
      if (!question.description) errors.push('Description is required')
      if (!question.options || question.options.length < 2) {
        errors.push('At least 2 options are required')
      }
      if (question.correctAnswer === undefined || question.correctAnswer < 0) {
        errors.push('Valid correct answer is required')
      }
    }

    return errors
  }
}

// Create singleton instance
export const questionManager = new QuestionManager()

// Hook for React components
export const useQuestionManager = () => {
  return questionManager
}