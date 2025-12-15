import { supabase } from '../lib/supabase'

// Profile Services
export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single()
    
    return { data, error }
  }
}

// Custom Assessment Types Services
export const assessmentTypesService = {
  async getUserAssessmentTypes(userId) {
    const { data, error } = await supabase
      .from('custom_assessment_types')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getPublicAssessmentTypes() {
    const { data, error } = await supabase
      .from('custom_assessment_types')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async createAssessmentType(userId, assessmentData) {
    const { data, error } = await supabase
      .from('custom_assessment_types')
      .insert([{
        user_id: userId,
        name: assessmentData.name,
        description: assessmentData.description,
        icon: assessmentData.icon || 'FileText',
        color: assessmentData.color || '#f6d55c',
        is_public: assessmentData.isPublic || false
      }])
      .select()
      .single()
    
    return { data, error }
  },

  async updateAssessmentType(userId, assessmentId, updates) {
    const { data, error } = await supabase
      .from('custom_assessment_types')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', assessmentId)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteAssessmentType(userId, assessmentId) {
    const { data, error } = await supabase
      .from('custom_assessment_types')
      .delete()
      .eq('user_id', userId)
      .eq('id', assessmentId)
    
    return { data, error }
  }
}

// Custom Questions Services
export const questionsService = {
  async getUserQuestions(userId, assessmentType = null) {
    let query = supabase
      .from('custom_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  async addQuestions(userId, assessmentType, questions, customAssessmentId = null) {
    const questionsToInsert = questions.map(question => ({
      user_id: userId,
      assessment_type: assessmentType,
      custom_assessment_id: customAssessmentId,
      question_data: question
    }))

    const { data, error } = await supabase
      .from('custom_questions')
      .insert(questionsToInsert)
      .select()
    
    return { data, error }
  },

  async deleteQuestions(userId, questionIds) {
    const { data, error } = await supabase
      .from('custom_questions')
      .delete()
      .eq('user_id', userId)
      .in('id', questionIds)
    
    return { data, error }
  },

  async clearUserQuestions(userId, assessmentType) {
    const { data, error } = await supabase
      .from('custom_questions')
      .delete()
      .eq('user_id', userId)
      .eq('assessment_type', assessmentType)
    
    return { data, error }
  },

  async getQuestionStats(userId) {
    const { data, error } = await supabase
      .from('custom_questions')
      .select('assessment_type, question_data')
      .eq('user_id', userId)
    
    if (error) return { data: null, error }

    // Group by assessment type and count
    const stats = {}
    data.forEach(item => {
      if (!stats[item.assessment_type]) {
        stats[item.assessment_type] = 0
      }
      stats[item.assessment_type]++
    })

    return { data: stats, error: null }
  }
}

// Assessment Results Services
export const resultsService = {
  async saveResult(userId, assessmentData) {
    const { data, error } = await supabase
      .from('assessment_results')
      .insert([{
        user_id: userId,
        assessment_type: assessmentData.assessmentType,
        score: assessmentData.score,
        total_questions: assessmentData.totalQuestions,
        time_taken: assessmentData.timeTaken,
        answers: assessmentData.answers,
        results_data: assessmentData.resultsData
      }])
      .select()
      .single()
    
    return { data, error }
  },

  async getUserResults(userId, assessmentType = null) {
    let query = supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  async getResultById(userId, resultId) {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .eq('id', resultId)
      .single()
    
    return { data, error }
  },

  async deleteResult(userId, resultId) {
    const { data, error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', userId)
      .eq('id', resultId)
    
    return { data, error }
  },

  async getUserStats(userId) {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('assessment_type, score, total_questions, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }

    // Calculate stats
    const stats = {
      totalAssessments: data.length,
      averageScore: 0,
      assessmentTypes: {},
      recentResults: data.slice(0, 5)
    }

    if (data.length > 0) {
      const totalScore = data.reduce((sum, result) => sum + (result.score / result.total_questions * 100), 0)
      stats.averageScore = Math.round(totalScore / data.length)

      // Group by assessment type
      data.forEach(result => {
        const type = result.assessment_type
        if (!stats.assessmentTypes[type]) {
          stats.assessmentTypes[type] = {
            count: 0,
            averageScore: 0,
            scores: []
          }
        }
        stats.assessmentTypes[type].count++
        stats.assessmentTypes[type].scores.push(result.score / result.total_questions * 100)
      })

      // Calculate average scores per type
      Object.keys(stats.assessmentTypes).forEach(type => {
        const typeStats = stats.assessmentTypes[type]
        typeStats.averageScore = Math.round(
          typeStats.scores.reduce((sum, score) => sum + score, 0) / typeStats.scores.length
        )
      })
    }

    return { data: stats, error: null }
  }
}