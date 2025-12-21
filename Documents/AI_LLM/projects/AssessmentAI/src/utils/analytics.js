// Google Analytics 4 (GA4) Integration
// This file handles all analytics tracking for the AssessmentAI platform

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (typeof window === 'undefined' || !measurementId) return

  // Load Google Analytics script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script1)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  })

  console.log('📊 Google Analytics initialized:', measurementId)
}

// Track page views
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  })

  console.log('📊 Page view tracked:', path, title)
}

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, {
    event_category: parameters.category || 'engagement',
    event_label: parameters.label,
    value: parameters.value,
    ...parameters
  })

  console.log('📊 Event tracked:', eventName, parameters)
}

// Assessment-specific tracking events
export const analytics = {
  // User registration and authentication
  trackUserRegistration: () => {
    trackEvent('sign_up', {
      method: 'email',
      category: 'authentication'
    })
  },

  trackUserLogin: () => {
    trackEvent('login', {
      method: 'email',
      category: 'authentication'
    })
  },

  trackUserLogout: () => {
    trackEvent('logout', {
      category: 'authentication'
    })
  },

  // Assessment creation and management
  trackAssessmentCreated: (assessmentName, questionCount) => {
    trackEvent('assessment_created', {
      category: 'assessment_management',
      label: assessmentName,
      value: questionCount,
      custom_parameters: {
        question_count: questionCount
      }
    })
  },

  trackQuestionsUploaded: (assessmentId, questionCount, fileSize) => {
    trackEvent('questions_uploaded', {
      category: 'content_creation',
      label: assessmentId,
      value: questionCount,
      custom_parameters: {
        question_count: questionCount,
        file_size_mb: Math.round(fileSize / (1024 * 1024) * 100) / 100
      }
    })
  },

  // Assessment taking
  trackAssessmentStarted: (assessmentId, assessmentName) => {
    trackEvent('assessment_started', {
      category: 'assessment_taking',
      label: assessmentName,
      custom_parameters: {
        assessment_id: assessmentId
      }
    })
  },

  trackAssessmentCompleted: (assessmentId, assessmentName, score, timeSpent, questionCount) => {
    trackEvent('assessment_completed', {
      category: 'assessment_taking',
      label: assessmentName,
      value: score,
      custom_parameters: {
        assessment_id: assessmentId,
        score_percentage: score,
        time_spent_seconds: timeSpent,
        question_count: questionCount
      }
    })
  },

  trackAssessmentAbandoned: (assessmentId, assessmentName, questionsAnswered, totalQuestions) => {
    trackEvent('assessment_abandoned', {
      category: 'assessment_taking',
      label: assessmentName,
      custom_parameters: {
        assessment_id: assessmentId,
        questions_answered: questionsAnswered,
        total_questions: totalQuestions,
        completion_rate: Math.round((questionsAnswered / totalQuestions) * 100)
      }
    })
  },

  // AI Help usage
  trackAIHintRequested: (assessmentId, questionNumber, questionType) => {
    trackEvent('ai_hint_requested', {
      category: 'ai_assistance',
      label: assessmentId,
      custom_parameters: {
        question_number: questionNumber,
        question_type: questionType
      }
    })
  },

  trackAIExplanationRequested: (assessmentId, questionNumber, questionType) => {
    trackEvent('ai_explanation_requested', {
      category: 'ai_assistance',
      label: assessmentId,
      custom_parameters: {
        question_number: questionNumber,
        question_type: questionType
      }
    })
  },

  // User engagement
  trackDashboardVisit: () => {
    trackEvent('dashboard_visit', {
      category: 'navigation'
    })
  },

  trackAssessmentsPageVisit: () => {
    trackEvent('assessments_page_visit', {
      category: 'navigation'
    })
  },

  trackQuestionManagerVisit: () => {
    trackEvent('question_manager_visit', {
      category: 'navigation'
    })
  },

  // File operations
  trackExcelTemplateDownload: () => {
    trackEvent('excel_template_download', {
      category: 'file_operations'
    })
  },

  trackResultsExport: (format) => {
    trackEvent('results_export', {
      category: 'file_operations',
      label: format
    })
  },

  // Errors and issues
  trackError: (errorType, errorMessage, page) => {
    trackEvent('error_occurred', {
      category: 'errors',
      label: errorType,
      custom_parameters: {
        error_message: errorMessage,
        page: page
      }
    })
  },

  // Performance metrics
  trackLoadTime: (page, loadTime) => {
    trackEvent('page_load_time', {
      category: 'performance',
      label: page,
      value: loadTime,
      custom_parameters: {
        load_time_ms: loadTime
      }
    })
  }
}

// Enhanced ecommerce tracking (for future premium features)
export const ecommerce = {
  trackPurchase: (transactionId, value, currency = 'USD', items = []) => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  },

  trackSubscription: (subscriptionType, value, currency = 'USD') => {
    trackEvent('subscribe', {
      category: 'ecommerce',
      label: subscriptionType,
      value: value,
      custom_parameters: {
        subscription_type: subscriptionType,
        currency: currency
      }
    })
  }
}

export default analytics