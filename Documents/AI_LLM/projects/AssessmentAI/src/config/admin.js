// Admin Configuration
// Add admin user emails here (easier than managing UUIDs)
export const ADMIN_EMAILS = [
  'aravind45@gmail.com'
]

// Legacy: Admin user IDs (for backward compatibility)
export const ADMIN_USERS = [
  // Add user IDs here if needed
]

// Check if a user is an admin (by email or user ID)
export const isAdmin = (user) => {
  if (!user) return false
  
  // Check by email (primary method)
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    return true
  }
  
  // Check by user ID (fallback)
  if (user.id && ADMIN_USERS.includes(user.id)) {
    return true
  }
  
  return false
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  VIEW_USERS: 'view_users',
  MANAGE_ASSESSMENTS: 'manage_assessments',
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_SETTINGS: 'system_settings'
}

// Check if admin has specific permission (for future use)
export const hasPermission = (user, permission) => {
  // For now, all admins have all permissions
  return isAdmin(user)
}