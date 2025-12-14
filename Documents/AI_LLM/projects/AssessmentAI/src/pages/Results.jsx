import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Award, BarChart3, Home, AlertTriangle, TrendingUp } from 'lucide-react'
import { analyzeInconsistencies, getConsistencyLevel, generateRecommendations } from '../utils/inconsistencyAnalysis'
import ConsistencyImprovementPlan from '../components/ConsistencyImprovementPlan'
import SpecificInconsistencyGuide from '../components/SpecificInconsistencyGuide'

const Results = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState([])
  const [inconsistencyAnalysis, setInconsistencyAnalysis] = useState(null)

  useEffect(() => {
    const savedResults = localStorage.getItem('assessmentResults')
    if (!savedResults) {
      navigate('/')
      return
    }

    const data = JSON.parse(savedResults)
    setResults(data)
    calculateScore(data)
  }, [navigate])

  const calculateScore = (data) => {
    if (data.type === 'personality') {
      // For personality assessments, analyze inconsistencies
      const analysis = analyzeInconsistencies(data.answers, data.questions)
      setInconsistencyAnalysis(analysis)
      setScore(analysis.overallConsistencyScore)
      generatePersonalityFeedback(data, analysis)
    } else if (data.type === 'behavioral') {
      // For behavioral questions, we'll simulate scoring based on answer length and keywords
      const behavioralScore = calculateBehavioralScore(data)
      setScore(behavioralScore)
      generateBehavioralFeedback(data, behavioralScore)
    } else {
      // For technical questions with correct answers
      let correct = 0
      const questionFeedback = []

      data.questions.forEach(question => {
        const userAnswer = data.answers[question.id]
        const isCorrect = userAnswer === question.correctAnswer

        if (isCorrect) correct++

        questionFeedback.push({
          question: question.title,
          correct: isCorrect,
          userAnswer: question.options ? question.options[userAnswer] : userAnswer,
          correctAnswer: question.options ? question.options[question.correctAnswer] : 'See explanation',
          explanation: question.explanation
        })
      })

      const percentage = Math.round((correct / data.questions.length) * 100)
      setScore(percentage)
      setFeedback(questionFeedback)
    }
  }

  const calculateBehavioralScore = (data) => {
    let totalScore = 0
    const feedbackItems = []

    data.questions.forEach(question => {
      const answer = data.answers[question.id] || ''
      let questionScore = 0

      // Basic scoring based on answer length and structure
      if (answer.length > 100) questionScore += 25
      if (answer.length > 300) questionScore += 25
      
      // Look for STAR method keywords
      const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'outcome']
      const hasStructure = starKeywords.some(keyword => 
        answer.toLowerCase().includes(keyword)
      )
      if (hasStructure) questionScore += 25

      // Look for specific examples and metrics
      const hasSpecifics = /\d+|%|increase|decrease|improve|reduce/.test(answer)
      if (hasSpecifics) questionScore += 25

      totalScore += questionScore
      
      feedbackItems.push({
        question: question.title,
        score: questionScore,
        answer: answer,
        criteria: question.evaluationCriteria,
        feedback: generateQuestionFeedback(questionScore, answer)
      })
    })

    setFeedback(feedbackItems)
    return Math.round(totalScore / data.questions.length)
  }

  const generateQuestionFeedback = (score, answer) => {
    if (score >= 75) {
      return "Excellent response with good structure and specific examples."
    } else if (score >= 50) {
      return "Good response, but could benefit from more specific examples or better structure."
    } else if (score >= 25) {
      return "Basic response provided. Consider using the STAR method and adding more details."
    } else {
      return "Response needs significant improvement. Focus on providing specific examples and clear structure."
    }
  }

  const generateBehavioralFeedback = (data, avgScore) => {
    // This is already handled in calculateBehavioralScore
  }

  const generatePersonalityFeedback = (data, analysis) => {
    const traitSummary = {}
    
    // Calculate average scores for each trait
    Object.entries(analysis.traitScores).forEach(([trait, scores]) => {
      const average = scores.reduce((acc, s) => acc + s.score, 0) / scores.length
      traitSummary[trait] = {
        average: average.toFixed(1),
        count: scores.length,
        questions: scores
      }
    })
    
    setFeedback({
      traitSummary,
      inconsistencies: analysis.inconsistencies,
      recommendations: generateRecommendations(analysis.inconsistencies, analysis.overallConsistencyScore)
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#34a853'
    if (score >= 60) return '#fbbc04'
    return '#ea4335'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (!results) {
    return <div>Loading...</div>
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Award size={64} color={getScoreColor(score)} style={{ marginBottom: '16px' }} />
          <h1 style={{ marginBottom: '8px' }}>Assessment Complete!</h1>
          <p style={{ color: '#5f6368', fontSize: '18px', textTransform: 'capitalize' }}>
            {results.type.replace('-', ' ')} Assessment Results
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '600',
              color: getScoreColor(score),
              marginBottom: '8px'
            }}>
              {score}%
            </div>
            <div style={{ color: '#5f6368' }}>
              {results.type === 'personality' ? 'Consistency Score' : 'Overall Score'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              color: getScoreColor(score)
            }}>
              {results.type === 'personality' && inconsistencyAnalysis ? 
                getConsistencyLevel(score).level : 
                getScoreLabel(score)
              }
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {Object.keys(results.answers).length}
            </div>
            <div style={{ color: '#5f6368' }}>Questions Answered</div>
            <div style={{ fontSize: '14px' }}>
              out of {results.questions.length}
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {formatTime(results.timeSpent)}
            </div>
            <div style={{ color: '#5f6368' }}>Time Spent</div>
            <div style={{ fontSize: '14px' }}>
              of {formatTime(results.totalTime)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <Home size={20} style={{ marginRight: '8px' }} />
            Back to Home
          </button>
          <button 
            onClick={() => navigate(`/assessment/${results.type}`)} 
            className="btn btn-secondary"
          >
            Retake Assessment
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} />
          Detailed Results
        </h2>

        {results.type === 'personality' ? (
          // Personality Results with Inconsistency Analysis
          <div>
            {/* Consistency Overview */}
            {inconsistencyAnalysis && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <TrendingUp size={20} />
                  <h3 style={{ margin: 0 }}>Response Consistency Analysis</h3>
                </div>
                
                <div style={{ 
                  padding: '20px',
                  background: getConsistencyLevel(score).color + '20',
                  borderRadius: '8px',
                  border: `1px solid ${getConsistencyLevel(score).color}40`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>
                      Consistency Level: {getConsistencyLevel(score).level}
                    </span>
                    <span style={{ 
                      color: getConsistencyLevel(score).color,
                      fontWeight: '600'
                    }}>
                      {score}%
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#5f6368' }}>
                    {getConsistencyLevel(score).description}
                  </p>
                </div>
              </div>
            )}

            {/* Inconsistencies Report */}
            {inconsistencyAnalysis && inconsistencyAnalysis.inconsistencies.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <AlertTriangle size={20} color="#ff9800" />
                  <h3 style={{ margin: 0 }}>Inconsistency Report</h3>
                </div>
                
                {inconsistencyAnalysis.inconsistencies.map((inconsistency, index) => (
                  <div key={index}>
                    {/* Specific guidance for opposing traits */}
                    {inconsistency.type === 'opposing-traits' && (
                      <SpecificInconsistencyGuide inconsistency={inconsistency} />
                    )}
                    
                    {/* Standard inconsistency display */}
                    <div style={{ 
                      marginBottom: '20px',
                      padding: '16px',
                      border: `1px solid ${inconsistency.severity === 'high' ? '#f44336' : '#ff9800'}40`,
                      borderRadius: '8px',
                      background: `${inconsistency.severity === 'high' ? '#f44336' : '#ff9800'}10`
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <h4 style={{ margin: 0, flex: 1 }}>{inconsistency.description}</h4>
                        <span style={{ 
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: inconsistency.severity === 'high' ? '#f44336' : '#ff9800',
                          color: 'white'
                        }}>
                          {inconsistency.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: '#5f6368',
                        fontSize: '14px'
                      }}>
                        {inconsistency.details}
                      </p>
                      
                      {inconsistency.type === 'within-trait' && (
                        <div>
                          <strong style={{ fontSize: '14px' }}>Related Questions:</strong>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                            {inconsistency.questions.map((q, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>
                                "{q.statement}" - You answered: <strong>{
                                  ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][q.answer - 1]
                                }</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {inconsistency.type === 'opposing-traits' && (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                            <div>
                              <strong>{inconsistency.trait1.replace('_', ' ')} questions:</strong>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                                {inconsistency.trait1Questions.map((q, idx) => (
                                  <li key={idx} style={{ marginBottom: '2px' }}>
                                    {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][q.answer - 1]}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>{inconsistency.trait2.replace('_', ' ')} questions:</strong>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                                {inconsistency.trait2Questions.map((q, idx) => (
                                  <li key={idx} style={{ marginBottom: '2px' }}>
                                    {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][q.answer - 1]}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trait Summary */}
            {feedback.traitSummary && (
              <div>
                <h3 style={{ marginBottom: '16px' }}>Trait Summary</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {Object.entries(feedback.traitSummary).map(([trait, data]) => (
                    <div key={trait} style={{ 
                      padding: '16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      background: 'white'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0',
                        textTransform: 'capitalize'
                      }}>
                        {trait.replace('_', ' ')}
                      </h4>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '600',
                        color: data.average >= 4 ? '#4caf50' : 
                               data.average >= 3 ? '#ffc107' : '#f44336',
                        marginBottom: '4px'
                      }}>
                        {data.average}/5.0
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        Based on {data.count} question{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : results.type === 'behavioral' ? (
          // Behavioral Results
          <div>
            {feedback.map((item, index) => (
              <div key={index} style={{ 
                marginBottom: '32px',
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ margin: 0, flex: 1 }}>{item.question}</h3>
                  <div style={{ 
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: getScoreColor(item.score) + '20',
                    color: getScoreColor(item.score)
                  }}>
                    {item.score}/100
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Your Answer:</h4>
                  <div style={{ 
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}>
                    {item.answer || 'No answer provided'}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Feedback:</h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#5f6368',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {item.feedback}
                  </p>
                </div>

                <div>
                  <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Evaluation Criteria:</h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {item.criteria.map((criterion, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Technical Results
          <div>
            {feedback.map((item, index) => (
              <div key={index} style={{ 
                marginBottom: '24px',
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {item.correct ? (
                    <CheckCircle size={24} color="#34a853" />
                  ) : (
                    <XCircle size={24} color="#ea4335" />
                  )}
                  <h3 style={{ margin: 0, flex: 1 }}>{item.question}</h3>
                  <span style={{ 
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: item.correct ? '#e8f5e8' : '#fce8e6',
                    color: item.correct ? '#137333' : '#d93025'
                  }}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong>Your Answer:</strong>
                  <div style={{ 
                    marginTop: '4px',
                    padding: '8px 12px',
                    background: item.correct ? '#e8f5e8' : '#fce8e6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {item.userAnswer || 'No answer selected'}
                  </div>
                </div>

                {!item.correct && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Correct Answer:</strong>
                    <div style={{ 
                      marginTop: '4px',
                      padding: '8px 12px',
                      background: '#e8f5e8',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      {item.correctAnswer}
                    </div>
                  </div>
                )}

                <div>
                  <strong>Explanation:</strong>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#5f6368',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {item.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Recommendations</h2>
        
        {results.type === 'personality' && feedback.recommendations ? (
          // Personality-specific recommendations
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {feedback.recommendations.map((rec, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                background: rec.priority === 'high' ? '#f8d7da' : 
                           rec.priority === 'medium' ? '#fff3cd' : '#e3f2fd',
                borderRadius: '8px'
              }}>
                <h3 style={{ 
                  color: rec.priority === 'high' ? '#721c24' : 
                         rec.priority === 'medium' ? '#856404' : '#1565c0',
                  marginBottom: '8px'
                }}>
                  {rec.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  {rec.description}
                </p>
                {rec.traits && (
                  <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                    Affected traits: {rec.traits.map(t => t.replace('_', ' ')).join(', ')}
                  </div>
                )}
              </div>
            ))}
            
            <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#1565c0', marginBottom: '8px' }}>Understanding Your Results 📊</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                <li>Inconsistencies are normal and may reflect context-dependent behavior</li>
                <li>Consider retaking if you feel results don't reflect your true preferences</li>
                <li>Use results as a starting point for self-reflection</li>
                <li>Discuss findings with mentors or advisors</li>
              </ul>
            </div>
          </div>
        ) : (
          // Standard recommendations for other assessment types
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {score >= 80 ? (
              <div style={{ padding: '16px', background: '#e8f5e8', borderRadius: '8px' }}>
                <h3 style={{ color: '#137333', marginBottom: '8px' }}>Excellent Work! 🎉</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  You have a strong understanding of this subject. Consider practicing more advanced topics 
                  or exploring related areas to further strengthen your skills.
                </p>
              </div>
            ) : score >= 60 ? (
              <div style={{ padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
                <h3 style={{ color: '#856404', marginBottom: '8px' }}>Good Progress! 📈</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  You have a solid foundation. Focus on the areas where you missed questions 
                  and practice similar problems to improve your confidence.
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#f8d7da', borderRadius: '8px' }}>
                <h3 style={{ color: '#721c24', marginBottom: '8px' }}>Keep Practicing! 💪</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  There's room for improvement. Review the explanations carefully and practice 
                  more questions in this area. Consider additional study resources.
                </p>
              </div>
            )}

            <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#1565c0', marginBottom: '8px' }}>Next Steps 🚀</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                <li>Review incorrect answers and explanations</li>
                <li>Practice similar questions daily</li>
                <li>Try other assessment types</li>
                <li>Join study groups or online communities</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Consistency Improvement Plan - Only for personality assessments */}
      {results.type === 'personality' && inconsistencyAnalysis && (
        <ConsistencyImprovementPlan 
          consistencyScore={score}
          inconsistencies={inconsistencyAnalysis.inconsistencies}
        />
      )}
    </div>
  )
}

export default Results