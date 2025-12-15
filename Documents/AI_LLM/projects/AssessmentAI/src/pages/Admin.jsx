import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, BarChart3, Settings, Shield, Database, AlertTriangle, CheckCircle, Eye, EyeOff, Trash2 } from 'lucide-react'
import { resultsService, assessmentTypesService, questionsService } from '../services/database'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { isAdmin } from '../config/admin'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [publicAssessments, setPublicAssessments] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAssessments, setSelectedAssessments] = useState(new Set())

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    if (!user || !isAdmin(user.id)) {
      navigate('/')
      return
    }

    loadAdminData()
  }, [user, navigate])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Load system stats
      await loadSystemStats()
      
      // Load users
      await loadUsers()
      
      // Load public assessments
      await loadPublicAssessments()
      
      // Load recent activity
      await loadRecentActivity()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total assessments taken
      const { count: assessmentCount } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true })

      // Get total custom assessment types
      const { count: customAssessmentCount } = await supabase
        .from('custom_assessment_types')
        .select('*', { count: 'exact', head: true })

      // Get total custom questions
      const { count: customQuestionCount } = await supabase
        .from('custom_questions')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: userCount || 0,
        totalAssessments: assessmentCount || 0,
        customAssessmentTypes: customAssessmentCount || 0,
        customQuestions: customQuestionCount || 0
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadPublicAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_assessment_types')
        .select(`
          *,
          profiles!custom_assessment_types_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPublicAssessments(data || [])
    } catch (error) {
      console.error('Error loading assessments:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          profiles!assessment_results_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setRecentActivity(data || [])
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const toggleAssessmentVisibility = async (assessmentId, currentVisibility) => {
    try {
      const { error } = await supabase
        .from('custom_assessment_types')
        .update({ is_public: !currentVisibility })
        .eq('id', assessmentId)

      if (error) throw error
      
      // Reload assessments
      await loadPublicAssessments()
      
      const action = !currentVisibility ? 'made public' : 'made private'
      alert(`✅ Assessment ${action} successfully!`)
    } catch (error) {
      alert(`❌ Error updating assessment: ${error.message}`)
    }
  }

  const deleteAssessment = async (assessmentId, assessmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${assessmentName}"? This will also delete all associated questions and results.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('custom_assessment_types')
        .delete()
        .eq('id', assessmentId)

      if (error) throw error
      
      // Reload assessments
      await loadPublicAssessments()
      
      alert(`✅ Assessment "${assessmentName}" deleted successfully!`)
    } catch (error) {
      alert(`❌ Error deleting assessment: ${error.message}`)
    }
  }

  const handleBulkMakePublic = async () => {
    if (selectedAssessments.size === 0) return
    
    if (!window.confirm(`Make ${selectedAssessments.size} selected assessments public?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('custom_assessment_types')
        .update({ is_public: true })
        .in('id', Array.from(selectedAssessments))

      if (error) throw error
      
      await loadPublicAssessments()
      setSelectedAssessments(new Set())
      
      alert(`✅ ${selectedAssessments.size} assessments made public successfully!`)
    } catch (error) {
      alert(`❌ Error updating assessments: ${error.message}`)
    }
  }

  const handleBulkMakePrivate = async () => {
    if (selectedAssessments.size === 0) return
    
    if (!window.confirm(`Make ${selectedAssessments.size} selected assessments private?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('custom_assessment_types')
        .update({ is_public: false })
        .in('id', Array.from(selectedAssessments))

      if (error) throw error
      
      await loadPublicAssessments()
      setSelectedAssessments(new Set())
      
      alert(`✅ ${selectedAssessments.size} assessments made private successfully!`)
    } catch (error) {
      alert(`❌ Error updating assessments: ${error.message}`)
    }
  }

  const handleSelectAssessment = (assessmentId, isSelected) => {
    const newSelected = new Set(selectedAssessments)
    if (isSelected) {
      newSelected.add(assessmentId)
    } else {
      newSelected.delete(assessmentId)
    }
    setSelectedAssessments(newSelected)
  }

  const handleSelectAllAssessments = (isSelected) => {
    if (isSelected) {
      setSelectedAssessments(new Set(publicAssessments.map(a => a.id)))
    } else {
      setSelectedAssessments(new Set())
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || !isAdmin(user.id)) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Shield size={64} color="#f44336" style={{ marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Loading admin panel...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertTriangle size={64} color="#f44336" style={{ marginBottom: '16px' }} />
        <h2>Error loading admin data</h2>
        <p style={{ color: '#f44336' }}>{error}</p>
        <button onClick={loadAdminData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#333',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield size={32} color="#f6d55c" />
          Admin Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          System overview and management tools
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '16px',
        marginBottom: '32px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'assessments', label: 'All Assessments', icon: FileText },
          { id: 'activity', label: 'Recent Activity', icon: Database }
        ].map(tab => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #f6d55c' : '2px solid transparent',
                color: activeTab === tab.id ? '#f6d55c' : '#666',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              <IconComponent size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <Users size={32} color="#4285f4" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#4285f4' }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Total Users
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <BarChart3 size={32} color="#34a853" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#34a853' }}>
                {stats.totalAssessments}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Assessments Taken
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <FileText size={32} color="#fbbc04" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#fbbc04' }}>
                {stats.customAssessmentTypes}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Custom Assessment Types
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <Database size={32} color="#ea4335" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#ea4335' }}>
                {stats.customQuestions}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Custom Questions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Recent Users</h2>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Email</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      {user.full_name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: 0 }}>All Custom Assessments</h2>
            
            {selectedAssessments.size > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleBulkMakePublic}
                  style={{
                    background: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#137333',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={14} />
                  Make Public ({selectedAssessments.size})
                </button>
                <button
                  onClick={handleBulkMakePrivate}
                  style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#856404',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <EyeOff size={14} />
                  Make Private ({selectedAssessments.size})
                </button>
              </div>
            )}
          </div>
          
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedAssessments.size === publicAssessments.length && publicAssessments.length > 0}
                      onChange={(e) => handleSelectAllAssessments(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Assessment</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Creator</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Created</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publicAssessments.map(assessment => (
                  <tr key={assessment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedAssessments.has(assessment.id)}
                        onChange={(e) => handleSelectAssessment(assessment.id, e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{assessment.name}</div>
                        {assessment.description && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {assessment.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div>{assessment.profiles?.full_name || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {assessment.profiles?.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: assessment.is_public ? '#e8f5e8' : '#fff3cd',
                        color: assessment.is_public ? '#137333' : '#856404'
                      }}>
                        {assessment.is_public ? '🌐 PUBLIC' : '🔒 PRIVATE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {formatDate(assessment.created_at)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => toggleAssessmentVisibility(assessment.id, assessment.is_public)}
                          style={{
                            background: assessment.is_public ? '#fff3cd' : '#e8f5e8',
                            border: `1px solid ${assessment.is_public ? '#ffc107' : '#4caf50'}`,
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: assessment.is_public ? '#856404' : '#137333'
                          }}
                          title={assessment.is_public ? 'Make Private' : 'Make Public'}
                        >
                          {assessment.is_public ? (
                            <>
                              <EyeOff size={14} />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              Make Public
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteAssessment(assessment.id, assessment.name)}
                          style={{
                            background: '#fce8e6',
                            border: '1px solid #f44336',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: '#f44336',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Delete Assessment"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Recent Assessment Activity</h2>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Assessment</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Score</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(activity => (
                  <tr key={activity.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div>{activity.profiles?.full_name || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {activity.profiles?.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {activity.assessment_type.replace('-', ' ')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        color: (activity.score / activity.total_questions) >= 0.8 ? '#4caf50' : 
                               (activity.score / activity.total_questions) >= 0.6 ? '#ff9800' : '#f44336'
                      }}>
                        {activity.score}/{activity.total_questions} ({Math.round((activity.score / activity.total_questions) * 100)}%)
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {formatDate(activity.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin