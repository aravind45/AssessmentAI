import React from 'react'
import { AlertCircle, Lightbulb, Target, CheckSquare } from 'lucide-react'

const SpecificInconsistencyGuide = ({ inconsistency }) => {
  const getTraitSpecificGuidance = (trait1, trait2) => {
    const traitPairs = {
      'pressure_tolerance-pressure_sensitivity': {
        title: 'Working Under Pressure',
        explanation: 'You indicated both high pressure tolerance AND high pressure sensitivity, which are contradictory.',
        realWorldScenarios: [
          {
            scenario: 'Multiple urgent deadlines approaching',
            questions: [
              'Do you feel energized or stressed?',
              'Do you work faster or make more mistakes?',
              'Do you seek help or handle it alone?'
            ]
          },
          {
            scenario: 'Last-minute changes to important project',
            questions: [
              'How do you typically react?',
              'Does your quality of work improve or decline?',
              'Do you communicate proactively about the pressure?'
            ]
          }
        ],
        clarificationSteps: [
          'Think about your PHYSICAL response to pressure (heart rate, stress levels)',
          'Consider your PERFORMANCE under pressure (better/worse work quality)',
          'Reflect on your EMOTIONAL response (excited vs anxious)',
          'Distinguish between SHORT-TERM pressure (hours) vs LONG-TERM pressure (weeks)'
        ],
        commonMisunderstandings: [
          'Confusing "can handle pressure" with "enjoys pressure"',
          'Mixing up deadline pressure with interpersonal pressure',
          'Not distinguishing between chosen vs imposed pressure'
        ]
      },
      'collaboration-independence': {
        title: 'Working Style Preferences',
        explanation: 'You indicated preferences for both teamwork and independent work.',
        realWorldScenarios: [
          {
            scenario: 'Starting a new complex project',
            questions: [
              'Do you prefer to brainstorm alone first or with others?',
              'When do you involve teammates vs work solo?',
              'How do you handle creative vs analytical tasks?'
            ]
          }
        ],
        clarificationSteps: [
          'Consider TASK TYPE - some tasks you prefer alone, others with team',
          'Think about PROJECT PHASES - planning vs execution preferences',
          'Reflect on TEAM SIZE preferences - small groups vs large teams',
          'Consider your ENERGY levels - when do you collaborate best?'
        ],
        commonMisunderstandings: [
          'Thinking you must choose one or the other exclusively',
          'Confusing "can work independently" with "prefers to work alone"',
          'Not considering task complexity in your preferences'
        ]
      },
      'dominance-followership': {
        title: 'Leadership Style',
        explanation: 'You indicated both leadership tendencies and preference for following.',
        realWorldScenarios: [
          {
            scenario: 'Team meeting with unclear direction',
            questions: [
              'Do you step up to guide or wait for someone else?',
              'How comfortable are you making decisions for others?',
              'Do you prefer to influence or be directed?'
            ]
          }
        ],
        clarificationSteps: [
          'Consider EXPERTISE AREAS - where you lead vs follow',
          'Think about TEAM DYNAMICS - when you naturally take charge',
          'Reflect on RESPONSIBILITY comfort - decision-making preferences',
          'Consider SITUATIONAL factors - formal vs informal leadership'
        ],
        commonMisunderstandings: [
          'Confusing "can lead when needed" with "prefers to lead"',
          'Not distinguishing between different types of leadership',
          'Mixing up confidence with dominance'
        ]
      }
    }

    const key = `${trait1}-${trait2}`
    const reverseKey = `${trait2}-${trait1}`
    
    return traitPairs[key] || traitPairs[reverseKey] || {
      title: `${trait1.replace('_', ' ')} vs ${trait2.replace('_', ' ')}`,
      explanation: 'You gave similar responses to opposing traits.',
      realWorldScenarios: [],
      clarificationSteps: [
        'Reflect on specific work situations for each trait',
        'Consider if your behavior varies by context',
        'Think about your natural tendencies vs learned behaviors'
      ],
      commonMisunderstandings: [
        'Not considering situational differences',
        'Confusing ability with preference'
      ]
    }
  }

  if (inconsistency.type !== 'opposing-traits') {
    return null
  }

  const guidance = getTraitSpecificGuidance(inconsistency.trait1, inconsistency.trait2)

  return (
    <div style={{ 
      border: '1px solid #ff9800',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      background: '#fff3e0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        <AlertCircle size={24} color="#ff9800" />
        <h3 style={{ margin: 0, color: '#e65100' }}>
          Specific Guidance: {guidance.title}
        </h3>
      </div>

      <div style={{ 
        padding: '12px',
        background: '#ffecb3',
        borderRadius: '8px',
        marginBottom: '16px',
        borderLeft: '3px solid #ff9800'
      }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
          <strong>The Issue:</strong> {guidance.explanation}
        </p>
      </div>

      {/* Real-world scenarios */}
      {guidance.realWorldScenarios.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px',
            color: '#e65100'
          }}>
            <Target size={18} />
            Reflect on These Scenarios
          </h4>
          
          {guidance.realWorldScenarios.map((scenario, index) => (
            <div key={index} style={{ 
              marginBottom: '16px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #ffcc80'
            }}>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontWeight: '500',
                color: '#bf360c'
              }}>
                📋 {scenario.scenario}
              </p>
              <ul style={{ 
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px'
              }}>
                {scenario.questions.map((question, qIndex) => (
                  <li key={qIndex} style={{ marginBottom: '4px' }}>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Clarification steps */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '12px',
          color: '#e65100'
        }}>
          <CheckSquare size={18} />
          Clarification Steps
        </h4>
        
        <ol style={{ 
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {guidance.clarificationSteps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Common misunderstandings */}
      <div>
        <h4 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '12px',
          color: '#e65100'
        }}>
          <Lightbulb size={18} />
          Common Misunderstandings
        </h4>
        
        <ul style={{ 
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {guidance.commonMisunderstandings.map((misunderstanding, index) => (
            <li key={index} style={{ marginBottom: '6px' }}>
              {misunderstanding}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: '#e8f5e8',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '14px',
          color: '#2e7d32'
        }}>
          💡 <strong>Next Step:</strong> After reflecting on these points, consider retaking just the questions related to {inconsistency.trait1.replace('_', ' ')} and {inconsistency.trait2.replace('_', ' ')} to see if your responses become more consistent.
        </p>
      </div>
    </div>
  )
}

export default SpecificInconsistencyGuide