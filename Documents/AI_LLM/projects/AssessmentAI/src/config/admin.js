// Admin Configuration
// Add your admin user IDs here
export const ADMIN_USERS = [
  // Replace with actual admin user IDs from Supabase auth.users table
  // Example: 'uuid-of-admin-user-1',
  // Example: 'uuid-of-admin-user-2',
]

// Check if a user is an admin
export const isAdmin = (userId) => {
  return ADMIN_USERS.includes(userId)
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  VIEW_USERS: 'view_users',
  MANAGE_ASSESSMENTS: 'manage_assessments',
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_SETTINGS: 'system_settings'
}

// Check if admin has specific permission (for future use)
export const hasPermission = (userId, permission) => {
  // For now, all admins have all permissions
  return isAdmin(userId)
}