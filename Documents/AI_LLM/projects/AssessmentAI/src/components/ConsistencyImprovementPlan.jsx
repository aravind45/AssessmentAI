import React from 'react'
import { CheckCircle, Target, Brain, RefreshCw } from 'lucide-react'

const ConsistencyImprovementPlan = ({ consistencyScore, inconsistencies }) => {
  const getImprovementSteps = () => {
    const steps = []
    
    if (consistencyScore < 60) {
      steps.push({
        priority: 'high',
        icon: <RefreshCw size={20} />,
        title: 'Retake Assessment',
        description: 'Consider retaking the assessment when you\'re more focused and have adequate time.',
        timeframe: 'Immediate',
        tips: [
          'Choose a quiet environment without distractions',
          'Read each statement carefully before responding',
          'Take breaks if the assessment is long',
          'Don\'t rush - there\'s no time pressure for accuracy'
        ]
      })
    }

    if (inconsistencies.some(i => i.type === 'within-trait')) {
      steps.push({
        priority: 'high',
        icon: <Brain size={20} />,
        title: 'Self-Reflection Exercise',
        description: 'Reflect on your true preferences in areas where you gave contradictory answers.',
        timeframe: '15-30 minutes',
        tips: [
          'Think about specific situations for each trait',
          'Consider if your behavior changes based on context',
          'Ask trusted friends or peers for feedback on your style',
          'Journal about your preferences in different scenarios'
        ]
      })
    }

    if (inconsistencies.some(i => i.type === 'opposing-traits')) {
      steps.push({
        priority: 'medium',
        icon: <Target size={20} />,
        title: 'Context Awareness',
        description: 'Recognize that you may adapt your behavior based on situations - this is normal.',
        timeframe: 'Ongoing',
        tips: [
          'Identify when you prefer collaboration vs independence',
          'Notice how your leadership style changes with different teams',
          'Understand your communication preferences in various settings',
          'Embrace behavioral flexibility as a strength'
        ]
      })
    }

    steps.push({
      priority: 'low',
      icon: <CheckCircle size={20} />,
      title: 'Validation Strategy',
      description: 'Use multiple assessment methods to get a complete picture of your behavioral style.',
      timeframe: 'Over time',
      tips: [
        'Take assessments from different providers',
        'Ask for 360-degree feedback from peers',
        'Use behavioral observation in real situations',
        'Consider professional counseling or coaching'
      ]
    })

    return steps
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336'
      case 'medium': return '#ff9800'
      case 'low': return '#4caf50'
      default: return '#757575'
    }
  }

  const steps = getImprovementSteps()

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Target size={24} />
        Consistency Improvement Plan
      </h2>
      
      <div style={{ 
        padding: '16px',
        background: '#e3f2fd',
        borderRadius: '8px',
        marginBottom: '24px',
        borderLeft: '4px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
          Quick Summary
        </h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          {consistencyScore >= 80 ? 
            'Your responses show good consistency. Minor improvements can help achieve even better reliability.' :
            consistencyScore >= 60 ?
            'Your responses show moderate consistency. Focus on the high-priority steps below.' :
            'Your responses show significant inconsistencies. Follow the improvement plan to get more reliable results.'
          }
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {steps.map((step, index) => (
          <div key={index} style={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px',
            borderLeft: `4px solid ${getPriorityColor(step.priority)}`
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                color: getPriorityColor(step.priority),
                marginTop: '2px'
              }}>
                {step.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>
                    {step.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getPriorityColor(step.priority) + '20',
                      color: getPriorityColor(step.priority)
                    }}>
                      {step.priority.toUpperCase()}
                    </span>
                    <span style={{ 
                      fontSize: '12px',
                      color: '#757575',
                      fontStyle: 'italic'
                    }}>
                      {step.timeframe}
                    </span>
                  </div>
                </div>
                
                <p style={{ 
                  margin: '0 0 12px 0',
                  color: '#5f6368',
                  lineHeight: '1.5'
                }}>
                  {step.description}
                </p>
                
                <div>
                  <strong style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Action Steps:
                  </strong>
                  <ul style={{ 
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} style={{ marginBottom: '4px' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        background: '#f0f7ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
          💡 Pro Tips for Better Consistency
        </h3>
        <ul style={{ 
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <li>Answer based on your <strong>typical</strong> behavior, not ideal behavior</li>
          <li>Consider your behavior over the <strong>last 6 months</strong>, not just recent events</li>
          <li>If unsure between two options, pick the one that feels more <strong>natural</strong></li>
          <li>Remember: there are no "right" or "wrong" answers - be honest</li>
          <li>Consistency doesn't mean perfection - some variation is normal</li>
        </ul>
      </div>
    </div>
  )
}

export default ConsistencyImprovementPlan