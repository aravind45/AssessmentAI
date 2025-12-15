import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import Results from './pages/Results'
import QuestionManager from './pages/QuestionManager'
import Assessments from './pages/Assessments'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessment/:type" element={<Assessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/questions" element={
                <ProtectedRoute>
                  <QuestionManager />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App