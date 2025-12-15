// Environment configuration for different deployment stages

const getBaseUrl = () => {
  // Production URL (replace with your actual Vercel URL)
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('your-domain.com')) {
    return window.location.origin
  }
  
  // Development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000'
  }
  
  // Fallback to current origin
  return window.location.origin
}

export const config = {
  baseUrl: getBaseUrl(),
  supabase: {
    url: 'https://chktzonseacamniddifq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoa3R6b25zZWFjYW1uaWRkaWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTM0OTgsImV4cCI6MjA4MTM4OTQ5OH0.ls993dsdw6Trf_pHVxNyuYceXki7o4hD_TkLF3FQGv4'
  },
  redirectUrls: {
    emailConfirmation: `${getBaseUrl()}/auth/callback`,
    passwordReset: `${getBaseUrl()}/reset-password`
  }
}

export default config