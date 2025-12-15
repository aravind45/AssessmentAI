// Database-backed question management utilities
import { questionBank as defaultQuestions } from '../data/questions'
import { questionsService } from '../services/database'

class DatabaseQuestionManager {
  constructor() {
    this.customQuestions = {}
    this.user = null
  }

  setUser(user) {
    this.user = user
    if (user) {
      this.loadCustomQuestions()
    } else {
      this.customQuestions = {}
    }
  }

  // Load custom questions from database
  async loadCustomQuestions() {
    if (!this.user) return

    try {
      const { data, error } = await questionsService.getUserQuestions(this.user.id)
      
      if (error) {
        console.error('Error loading custom questions:', error)
        return
      }

      // Group questions by assessment type
      this.customQuestions = {}
      data.forEach(item => {
        if (!this.customQuestions[item.assessment_type]) {
          this.customQuestions[item.assessment_type] = []
        }
        this.customQuestions[item.assessment_type].push({
          ...item.question_data,
          dbId: item.id, // Store database ID for deletion
          isCustom: true
        })
      })
    } catch (error) {
      console.error('Error loading custom questions:', error)
    }
  }

  // Add uploaded questions to database
  async addQuestions(assessmentType, questions) {
    if (!this.user) {
      throw new Error('User must be logged in to save questions')
    }

    try {
      // Ensure unique IDs by finding the highest existing ID
      const existingQuestions = this.getQuestions(assessmentType)
      const maxId = existingQuestions.reduce((max, q) => Math.max(max, q.id || 0), 0)

      // Assign new IDs to uploaded questions
      const questionsWithIds = questions.map((q, index) => ({
        ...q,
        id: maxId + index + 1,
        isCustom: true
      }))

      const { data, error } = await questionsService.addQuestions(
        this.user.id, 
        assessmentType, 
        questionsWithIds
      )

      if (error) {
        throw new Error(error.message)
      }

      // Update local cache
      if (!this.customQuestions[assessmentType]) {
        this.customQuestions[assessmentType] = []
      }

      // Add database IDs to questions
      questionsWithIds.forEach((question, index) => {
        question.dbId = data[index].id
      })

      this.customQuestions[assessmentType].push(...questionsWithIds)

      return questionsWithIds
    } catch (error) {
      console.error('Error adding questions:', error)
      throw error
    }
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

  // Remove custom questions from database
  async removeCustomQuestions(assessmentType, questionIds) {
    if (!this.user) {
      throw new Error('User must be logged in to delete questions')
    }

    try {
      // Get database IDs for the questions to delete
      const questionsToDelete = this.customQuestions[assessmentType]?.filter(q => 
        questionIds.includes(q.id)
      ) || []

      const dbIds = questionsToDelete.map(q => q.dbId).filter(Boolean)

      if (dbIds.length > 0) {
        const { error } = await questionsService.deleteQuestions(this.user.id, dbIds)
        
        if (error) {
          throw new Error(error.message)
        }
      }

      // Update local cache
      if (this.customQuestions[assessmentType]) {
        this.customQuestions[assessmentType] = this.customQuestions[assessmentType]
          .filter(q => !questionIds.includes(q.id))
      }
    } catch (error) {
      console.error('Error removing questions:', error)
      throw error
    }
  }

  // Clear all custom questions for an assessment type
  async clearCustomQuestions(assessmentType) {
    if (!this.user) {
      throw new Error('User must be logged in to clear questions')
    }

    try {
      const { error } = await questionsService.clearUserQuestions(this.user.id, assessmentType)
      
      if (error) {
        throw new Error(error.message)
      }

      // Update local cache
      if (this.customQuestions[assessmentType]) {
        delete this.customQuestions[assessmentType]
      }
    } catch (error) {
      console.error('Error clearing questions:', error)
      throw error
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
export const databaseQuestionManager = new DatabaseQuestionManager()

// Hook for React components
export const useDatabaseQuestionManager = () => {
  return databaseQuestionManager
}