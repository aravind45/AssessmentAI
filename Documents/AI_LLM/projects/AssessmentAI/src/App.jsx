import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAnalytics } from './hooks/useAnalytics'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import Results from './pages/Results'
import QuestionManager from './pages/QuestionManager'
import Assessments from './pages/Assessments'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'

// Analytics wrapper component
const AnalyticsWrapper = ({ children }) => {
  useAnalytics() // Initialize analytics and track page views
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsWrapper>
          <div className="App">
            <Header />
            <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessment/:type" element={<Assessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/questions" element={
                <ProtectedRoute>
                  <QuestionManager />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </div>
        </AnalyticsWrapper>
      </Router>
    </AuthProvider>
  )
}

export default App