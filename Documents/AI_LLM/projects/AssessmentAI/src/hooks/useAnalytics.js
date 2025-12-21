import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initGA, trackPageView, analytics } from '../utils/analytics'

// Custom hook for analytics integration
export const useAnalytics = () => {
  const location = useLocation()

  // Initialize Google Analytics on mount
  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
    if (measurementId) {
      initGA(measurementId)
    } else {
      console.warn('⚠️ Google Analytics Measurement ID not found. Add VITE_GA_MEASUREMENT_ID to your environment variables.')
    }
  }, [])

  // Track page views on route changes
  useEffect(() => {
    const path = location.pathname + location.search
    const title = document.title
    trackPageView(path, title)
  }, [location])

  return analytics
}

// Hook for tracking component mount/unmount
export const usePageTracking = (pageName) => {
  useEffect(() => {
    const startTime = Date.now()
    
    // Track page visit
    analytics.trackEvent('page_visit', {
      category: 'navigation',
      label: pageName
    })

    return () => {
      // Track time spent on page
      const timeSpent = Date.now() - startTime
      analytics.trackLoadTime(pageName, timeSpent)
    }
  }, [pageName])
}

export default useAnalytics