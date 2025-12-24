import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  Brain, 
  ArrowRight, 
  BookOpen,
  Zap,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GenerateQuestions from '../components/GenerateQuestions'

const AIGenerate = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showGenerator, setShowGenerator] = useState(false)
  const [recentAssessments, setRecentAssessments] = useState([])

  const handleQuestionsGenerated = (assessment, questions) => {
    setRecentAssessments(prev => [{
      ...assessment,
      questionCount: questions.length,
      createdAt: new Date().toISOString()
    }, ...prev].slice(0, 5))
  }

  if (!user) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '80px auto',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Sparkles size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '16px' }}>
          AI Question Generator
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          Please log in to generate questions with AI
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Log In to Continue
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
        borderRadius: '24px',
        padding: '48px',
        color: 'white',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '20%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sparkles size={32} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: '20px'
            }}>
              Powered by AI
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Generate Assessment Questions<br />
            in Seconds
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px'
          }}>
            Enter any topic and let AI create professional multiple-choice questions 
            complete with correct answers and explanations.
          </p>

          <button
            onClick={() => setShowGenerator(true)}
            style={{
              background: 'white',
              color: '#6366f1',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <Sparkles size={24} />
            Start Generating Questions
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {[
          {
            icon: Brain,
            title: 'AI-Powered',
            description: 'Uses advanced LLM to generate high-quality, relevant questions'
          },
          {
            icon: Target,
            title: 'Customizable Difficulty',
            description: 'Choose from Easy, Medium, Hard, or a mix of all levels'
          },
          {
            icon: Clock,
            title: 'Instant Generation',
            description: 'Get 5-20 questions generated in just seconds'
          },
          {
            icon: CheckCircle,
            title: 'Ready to Use',
            description: 'Questions saved directly to your assessments'
          }
        ].map((feature, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <feature.icon size={24} color="#8b5cf6" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px'
        }}>
          {[
            { step: 1, title: 'Enter Topic', desc: 'Type any subject you want questions about' },
            { step: 2, title: 'Configure', desc: 'Choose number of questions and difficulty' },
            { step: 3, title: 'Generate', desc: 'AI creates questions with answers & explanations' },
            { step: 4, title: 'Review & Save', desc: 'Edit if needed, then save to your assessments' }
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                margin: '0 auto 16px'
              }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Created */}
      {recentAssessments.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
            Recently Created
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAssessments.map((assessment, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Brain size={20} color="#8b5cf6" />
                  <div>
                    <div style={{ fontWeight: '500', color: '#333' }}>{assessment.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {assessment.questionCount} questions
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/assessment/${assessment.id}`)}
                  style={{
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Take Assessment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start CTA */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <button
          onClick={() => setShowGenerator(true)}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Sparkles size={24} />
          Generate Questions Now
        </button>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <GenerateQuestions
          onClose={() => setShowGenerator(false)}
          onQuestionsGenerated={handleQuestionsGenerated}
        />
      )}
    </div>
  )
}

export default AIGenerate
