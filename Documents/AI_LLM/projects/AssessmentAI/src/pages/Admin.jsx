import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Edit2, 
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { isAdmin } from '../config/admin'
import CreateAssessmentType from '../components/CreateAssessmentType'
import EditAssessmentType from '../components/EditAssessmentType'

const Admin = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    totalQuestions: 0,
    totalResults: 0
  })
  const [users, setUsers] = useState([])
  const [assessments, setAssessments] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Modals
  const [showCreateAssessment, setShowCreateAssessment] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!isAdmin(user)) {
      navigate('/')
      return
    }
    loadAllData()
  }, [user, navigate])

  const loadAllData = async () => {
    setLoading(true)
    setError('')
    
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadAssessments(),
        loadRecentResults()
      ])
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('Some data failed to load. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const loadStats = async () => {
    try {
      // Get counts using count queries
      const [usersRes, assessmentsRes, questionsRes, resultsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('custom_assessment_types').select('*', { count: 'exact', head: true }),
        supabase.from('custom_questions').select('*', { count: 'exact', head: true }),
        supabase.from('assessment_results').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalUsers: usersRes.count || 0,
        totalAssessments: assessmentsRes.count || 0,
        totalQuestions: questionsRes.count || 0,
        totalResults: resultsRes.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        // If RLS blocks us, at least show current user
        if (user) {
          setUsers([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Current User',
            created_at: user.created_at
          }])
        }
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadAssessments = async () => {
    try {
      // First try to get all assessments (for admin)
      let { data, error } = await supabase
        .from('custom_assessment_types')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error with join query, trying simple query:', error)
        // Fallback to simple query without join
        const simpleResult = await supabase
          .from('custom_assessment_types')
          .select('*')
          .order('created_at', { ascending: false })
        
        data = simpleResult.data
        error = simpleResult.error
      }

      if (error) {
        console.error('Error loading assessments:', error)
        setAssessments([])
      } else {
        setAssessments(data || [])
      }
    } catch (error) {
      console.error('Error loading assessments:', error)
      setAssessments([])
    }
  }

  const loadRecentResults = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading results:', error)
        setRecentResults([])
      } else {
        setRecentResults(data || [])
      }
    } catch (error) {
      console.error('Error loading results:', error)
      setRecentResults([])
    }
  }

  const toggleAssessmentVisibility = async (assessment) => {
    try {
      const newVisibility = !assessment.is_public
      
      const { error } = await supabase
        .from('custom_assessment_types')
        .update({ is_public: newVisibility })
        .eq('id', assessment.id)

      if (error) throw error

      // Update local state
      setAssessments(prev => prev.map(a => 
        a.id === assessment.id ? { ...a, is_public: newVisibility } : a
      ))

      alert(`✅ Assessment "${assessment.name}" is now ${newVisibility ? 'PUBLIC' : 'PRIVATE'}`)
    } catch (error) {
      console.error('Error updating assessment:', error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const deleteAssessment = async (assessment) => {
    if (!window.confirm(`Delete "${assessment.name}"?\n\nThis will also delete all questions and results for this assessment. This cannot be undone.`)) {
      return
    }

    try {
      // Delete questions first (due to foreign key)
      await supabase
        .from('custom_questions')
        .delete()
        .eq('custom_assessment_id', assessment.id)

      // Delete assessment
      const { error } = await supabase
        .from('custom_assessment_types')
        .delete()
        .eq('id', assessment.id)

      if (error) throw error

      // Update local state
      setAssessments(prev => prev.filter(a => a.id !== assessment.id))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalAssessments: prev.totalAssessments - 1
      }))

      alert(`✅ Assessment "${assessment.name}" deleted successfully!`)
    } catch (error) {
      console.error('Error deleting assessment:', error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleAssessmentCreated = (newAssessment) => {
    setAssessments(prev => [newAssessment, ...prev])
    setStats(prev => ({ ...prev, totalAssessments: prev.totalAssessments + 1 }))
    setShowCreateAssessment(false)
  }

  const handleAssessmentUpdated = (updated) => {
    setAssessments(prev => prev.map(a => a.id === updated.id ? updated : a))
    setEditingAssessment(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#666' }}>Loading admin dashboard...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', margin: 0 }}>
            <Shield size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', margin: '8px 0 0' }}>
            Manage users, assessments, and system settings
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#dc2626'
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '12px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'assessments', label: 'Assessments', icon: FileText },
          { id: 'activity', label: 'Activity', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: activeTab === tab.id ? '#667eea' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#667eea' },
              { label: 'Assessments', value: stats.totalAssessments, icon: FileText, color: '#f6d55c' },
              { label: 'Questions', value: stats.totalQuestions, icon: Database, color: '#4db6ac' },
              { label: 'Results', value: stats.totalResults, icon: BarChart3, color: '#ff8a65' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowCreateAssessment(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Plus size={18} />
                Create Assessment
              </button>
              <button
                onClick={() => navigate('/ai-generate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Sparkles size={18} />
                AI Generate
              </button>
              <button
                onClick={() => navigate('/questions')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Settings size={18} />
                Manage Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Registered Users ({users.length})
            </h3>
          </div>
          
          {users.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No users found or you don't have permission to view users.</p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Note: Row Level Security may restrict access to other users' profiles.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#667eea',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{u.full_name || 'No name'}</div>
                            {u.id === user?.id && (
                              <span style={{
                                fontSize: '11px',
                                background: '#dcfce7',
                                color: '#166534',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              All Assessments ({assessments.length})
            </h3>
            <button
              onClick={() => setShowCreateAssessment(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              New Assessment
            </button>
          </div>
          
          {assessments.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No assessments found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Assessment</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Owner</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Visibility</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Created</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(assessment => (
                    <tr key={assessment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: assessment.color || '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileText size={20} color="white" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{assessment.name}</div>
                            {assessment.description && (
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {assessment.description.substring(0, 50)}{assessment.description.length > 50 ? '...' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px' }}>
                          {assessment.profiles?.full_name || assessment.profiles?.email || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {assessment.profiles?.email}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: assessment.is_public ? '#dcfce7' : '#fef3c7',
                          color: assessment.is_public ? '#166534' : '#92400e'
                        }}>
                          {assessment.is_public ? '🌐 Public' : '🔒 Private'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                        {formatDate(assessment.created_at)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => setEditingAssessment(assessment)}
                            style={{
                              padding: '6px 12px',
                              background: '#e0f2fe',
                              color: '#0277bd',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleAssessmentVisibility(assessment)}
                            style={{
                              padding: '6px 12px',
                              background: assessment.is_public ? '#fef3c7' : '#dcfce7',
                              color: assessment.is_public ? '#92400e' : '#166534',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {assessment.is_public ? <EyeOff size={12} /> : <Eye size={12} />}
                            {assessment.is_public ? 'Private' : 'Public'}
                          </button>
                          <button
                            onClick={() => deleteAssessment(assessment)}
                            style={{
                              padding: '6px 12px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Recent Assessment Results ({recentResults.length})
            </h3>
          </div>
          
          {recentResults.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
              <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No assessment results found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Assessment</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map(result => {
                    const percentage = result.total_questions > 0 
                      ? Math.round((result.score / result.total_questions) * 100) 
                      : 0
                    return (
                      <tr key={result.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '500' }}>
                            {result.profiles?.full_name || result.profiles?.email || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {result.profiles?.email}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {result.assessment_type}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: percentage >= 80 ? '#dcfce7' : percentage >= 60 ? '#fef3c7' : '#fef2f2',
                            color: percentage >= 80 ? '#166534' : percentage >= 60 ? '#92400e' : '#dc2626'
                          }}>
                            {result.score}/{result.total_questions} ({percentage}%)
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                          {formatDate(result.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateAssessment && (
        <CreateAssessmentType
          onAssessmentCreated={handleAssessmentCreated}
          onClose={() => setShowCreateAssessment(false)}
        />
      )}

      {editingAssessment && (
        <EditAssessmentType
          assessment={editingAssessment}
          onAssessmentUpdated={handleAssessmentUpdated}
          onClose={() => setEditingAssessment(null)}
        />
      )}
    </div>
  )
}

export default Admin
