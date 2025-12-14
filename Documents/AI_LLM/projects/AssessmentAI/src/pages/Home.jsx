import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Code, Database, Globe, Users, Brain, Layers, Zap } from 'lucide-react'
import { questionManager } from '../utils/questionManager'

const Home = () => {
  const [questionCounts, setQuestionCounts] = useState({})

  useEffect(() => {
    // Get actual question counts including custom questions
    const updateCounts = () => {
      const counts = {}
      const types = [
        'coding', 'system-design', 'frontend', 'behavioral', 'personality', 
        'ai-business-analyst', 'ai-solution-architect', 'microservices', 
        'event-driven-architecture', 'serverless-architecture', 
        'full-stack-development', 'ap-physics-10th'
      ]
      
      types.forEach(type => {
        const stats = questionManager.getQuestionStats(type)
        counts[type] = stats.total
      })
      
      setQuestionCounts(counts)
    }

    updateCounts()

    // Listen for storage changes to update counts when questions are added
    const handleStorageChange = () => {
      updateCounts()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for focus events to update when returning from question manager
    window.addEventListener('focus', updateCounts)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', updateCounts)
    }
  }, [])

  const assessmentTypes = [
    {
      id: 'coding',
      title: 'Programming Skills',
      description: 'Test your coding abilities with algorithmic problems',
      icon: <Code size={48} />,
      color: '#4285f4',
      baseDuration: 3, // minutes per question
      baseQuestions: 9
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Learn to design scalable systems and architecture',
      icon: <Database size={48} />,
      color: '#34a853',
      baseDuration: 5,
      baseQuestions: 3
    },
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Master HTML, CSS, JavaScript, and React concepts',
      icon: <Globe size={48} />,
      color: '#fbbc04',
      baseDuration: 3,
      baseQuestions: 3
    },
    {
      id: 'behavioral',
      title: 'Behavioral Assessment',
      description: 'Leadership, teamwork, and problem-solving scenarios',
      icon: <Users size={48} />,
      color: '#ea4335',
      baseDuration: 5,
      baseQuestions: 2
    },
    {
      id: 'personality',
      title: 'Personality Assessment',
      description: 'Work style preferences and behavioral tendencies',
      icon: <Users size={48} />,
      color: '#9c27b0',
      baseDuration: 0.5,
      baseQuestions: 50
    },
    {
      id: 'ai-business-analyst',
      title: 'AI Business Analysis',
      description: 'AI training, data quality, and business analysis skills',
      icon: <Brain size={48} />,
      color: '#673ab7',
      baseDuration: 5,
      baseQuestions: 1
    },
    {
      id: 'ai-solution-architect',
      title: 'AI Solution Architecture',
      description: 'Advanced AI platform architecture and design patterns',
      icon: <Layers size={48} />,
      color: '#3f51b5',
      baseDuration: 5,
      baseQuestions: 1
    },
    {
      id: 'microservices',
      title: 'Microservices Architecture',
      description: 'Service decomposition, communication, and distributed systems',
      icon: <Layers size={48} />,
      color: '#00bcd4',
      baseDuration: 4,
      baseQuestions: 10
    },
    {
      id: 'event-driven-architecture',
      title: 'Event-Driven Architecture',
      description: 'Event sourcing, CQRS, sagas, and event streaming',
      icon: <Database size={48} />,
      color: '#ff5722',
      baseDuration: 4,
      baseQuestions: 10
    },
    {
      id: 'serverless-architecture',
      title: 'Serverless Architecture',
      description: 'Functions, event triggers, and serverless patterns',
      icon: <Globe size={48} />,
      color: '#795548',
      baseDuration: 3,
      baseQuestions: 10
    },
    {
      id: 'full-stack-development',
      title: 'Full-Stack Development',
      description: 'End-to-end application development and architecture',
      icon: <Code size={48} />,
      color: '#607d8b',
      baseDuration: 3,
      baseQuestions: 10
    },
    {
      id: 'ap-physics-10th',
      title: 'AP Physics (10th Grade)',
      description: 'Mechanics, electricity, magnetism, waves, and thermodynamics',
      icon: <Zap size={48} />,
      color: '#e91e63',
      baseDuration: 2,
      baseQuestions: 20
    }
  ].map(assessment => {
    const actualQuestions = questionCounts[assessment.id] || assessment.baseQuestions
    const duration = Math.ceil(actualQuestions * assessment.baseDuration)
    
    return {
      ...assessment,
      questions: actualQuestions,
      duration: `${duration} minute${duration !== 1 ? 's' : ''}`
    }
  })

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '400', 
          color: '#202124',
          marginBottom: '16px'
        }}>
          Master Your Skills with Assessments
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#5f6368',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Practice with comprehensive assessments and improve your knowledge 
          across various subjects and skills.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {assessmentTypes.map((assessment) => (
          <div key={assessment.id} className="card">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <div style={{ color: assessment.color, marginRight: '16px' }}>
                {assessment.icon}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '500' }}>
                {assessment.title}
              </h3>
            </div>
            
            <p style={{ 
              color: '#5f6368', 
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              {assessment.description}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#5f6368'
            }}>
              <span>⏱️ {assessment.duration}</span>
              <span>📝 {assessment.questions} questions</span>
            </div>
            
            <Link 
              to={`/assessment/${assessment.id}`}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Start Assessment
            </Link>
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#202124' }}>
          How It Works
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginTop: '32px'
        }}>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#4285f4'
            }}>
              1️⃣
            </div>
            <h3>Choose Assessment</h3>
            <p style={{ color: '#5f6368' }}>
              Select the type of assessment that matches your learning goals
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#34a853'
            }}>
              2️⃣
            </div>
            <h3>Complete Questions</h3>
            <p style={{ color: '#5f6368' }}>
              Work through realistic problems within the time limit
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              color: '#fbbc04'
            }}>
              3️⃣
            </div>
            <h3>Get Feedback</h3>
            <p style={{ color: '#5f6368' }}>
              Receive detailed results and improvement suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home