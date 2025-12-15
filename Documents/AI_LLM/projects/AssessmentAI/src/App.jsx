import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import Results from './pages/Results'
import QuestionManager from './pages/QuestionManager'
import Assessments from './pages/Assessments'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/assessment/:type" element={<Assessment />} />
            <Route path="/results" element={<Results />} />
            <Route path="/questions" element={<QuestionManager />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App