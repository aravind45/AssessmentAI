// Inconsistency analysis for personality assessments
export const analyzeInconsistencies = (answers, questions) => {
  const inconsistencies = []
  const traitScores = {}
  
  // Group questions by trait and calculate scores
  questions.forEach(question => {
    const answer = answers[question.id]
    if (answer === undefined) return
    
    const trait = question.trait
    if (!traitScores[trait]) {
      traitScores[trait] = []
    }
    
    // For opposing traits, reverse the score
    let score = answer
    if (isOpposingTrait(trait)) {
      score = 6 - answer // Reverse 1-5 scale
    }
    
    traitScores[trait].push({
      questionId: question.id,
      statement: question.statement,
      score: score,
      originalAnswer: answer
    })
  })
  
  // Define opposing trait pairs for inconsistency detection
  const opposingPairs = [
    ['collaboration', 'independence'],
    ['dominance', 'followership'], 
    ['assertiveness', 'conflict_avoidance'],
    ['pressure_tolerance', 'pressure_sensitivity'],
    ['structure', 'flexibility']
  ]
  
  // Check for inconsistencies within same trait
  Object.entries(traitScores).forEach(([trait, scores]) => {
    if (scores.length > 1) {
      const inconsistency = checkWithinTraitInconsistency(trait, scores)
      if (inconsistency) {
        inconsistencies.push(inconsistency)
      }
    }
  })
  
  // Check for inconsistencies between opposing traits
  opposingPairs.forEach(([trait1, trait2]) => {
    if (traitScores[trait1] && traitScores[trait2]) {
      const inconsistency = checkOpposingTraitInconsistency(
        trait1, trait2, traitScores[trait1], traitScores[trait2]
      )
      if (inconsistency) {
        inconsistencies.push(inconsistency)
      }
    }
  })
  
  return {
    inconsistencies,
    traitScores,
    overallConsistencyScore: calculateOverallConsistency(inconsistencies, questions.length)
  }
}

const isOpposingTrait = (trait) => {
  const opposingTraits = ['independence', 'followership', 'conflict_avoidance', 'pressure_sensitivity', 'flexibility']
  return opposingTraits.includes(trait)
}

const checkWithinTraitInconsistency = (trait, scores) => {
  if (scores.length < 2) return null
  
  const values = scores.map(s => s.score)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  const standardDeviation = Math.sqrt(variance)
  
  // Flag as inconsistent if standard deviation > 1.5 (high variance in responses)
  if (standardDeviation > 1.5) {
    const minScore = Math.min(...values)
    const maxScore = Math.max(...values)
    const range = maxScore - minScore
    
    return {
      type: 'within-trait',
      trait: trait,
      severity: range >= 3 ? 'high' : 'medium',
      description: `Inconsistent responses for ${trait.replace('_', ' ')} trait`,
      details: `Response range: ${range} points (${minScore} to ${maxScore})`,
      questions: scores.map(s => ({
        id: s.questionId,
        statement: s.statement,
        answer: s.originalAnswer,
        score: s.score
      })),
      standardDeviation: standardDeviation.toFixed(2)
    }
  }
  
  return null
}

const checkOpposingTraitInconsistency = (trait1, trait2, scores1, scores2) => {
  const avg1 = scores1.reduce((acc, s) => acc + s.score, 0) / scores1.length
  const avg2 = scores2.reduce((acc, s) => acc + s.score, 0) / scores2.length
  
  // For opposing traits, we expect inverse correlation
  // If both averages are high (>3.5) or both low (<2.5), it's inconsistent
  const bothHigh = avg1 > 3.5 && avg2 > 3.5
  const bothLow = avg1 < 2.5 && avg2 < 2.5
  
  if (bothHigh || bothLow) {
    return {
      type: 'opposing-traits',
      trait1: trait1,
      trait2: trait2,
      severity: Math.abs(avg1 - avg2) < 1 ? 'high' : 'medium',
      description: `Contradictory responses between ${trait1.replace('_', ' ')} and ${trait2.replace('_', ' ')}`,
      details: `Both traits scored similarly (${avg1.toFixed(1)} vs ${avg2.toFixed(1)}) despite being opposites`,
      trait1Questions: scores1.map(s => ({
        id: s.questionId,
        statement: s.statement,
        answer: s.originalAnswer
      })),
      trait2Questions: scores2.map(s => ({
        id: s.questionId,
        statement: s.statement,
        answer: s.originalAnswer
      })),
      averages: { [trait1]: avg1.toFixed(1), [trait2]: avg2.toFixed(1) }
    }
  }
  
  return null
}

const calculateOverallConsistency = (inconsistencies, totalQuestions) => {
  if (inconsistencies.length === 0) return 100
  
  const severityWeights = { high: 3, medium: 2, low: 1 }
  const totalSeverity = inconsistencies.reduce((acc, inc) => 
    acc + severityWeights[inc.severity], 0
  )
  
  // Calculate consistency score (0-100)
  const maxPossibleSeverity = totalQuestions * 0.5 // Assume 50% could be inconsistent
  const consistencyScore = Math.max(0, 100 - (totalSeverity / maxPossibleSeverity) * 100)
  
  return Math.round(consistencyScore)
}

export const getConsistencyLevel = (score) => {
  if (score >= 90) return { level: 'Excellent', color: '#4caf50', description: 'Highly consistent responses' }
  if (score >= 75) return { level: 'Good', color: '#8bc34a', description: 'Generally consistent with minor variations' }
  if (score >= 60) return { level: 'Fair', color: '#ffc107', description: 'Some inconsistencies detected' }
  if (score >= 40) return { level: 'Poor', color: '#ff9800', description: 'Multiple inconsistencies found' }
  return { level: 'Very Poor', color: '#f44336', description: 'Significant inconsistencies throughout' }
}

export const generateRecommendations = (inconsistencies, consistencyScore) => {
  const recommendations = []
  
  if (consistencyScore < 60) {
    recommendations.push({
      type: 'general',
      title: 'Review Your Responses',
      description: 'Consider retaking the assessment with more careful attention to each statement.',
      priority: 'high'
    })
  }
  
  const withinTraitIssues = inconsistencies.filter(i => i.type === 'within-trait')
  if (withinTraitIssues.length > 0) {
    recommendations.push({
      type: 'within-trait',
      title: 'Clarify Your Preferences',
      description: 'You gave varying responses to similar questions. Reflect on your true preferences in these areas.',
      traits: withinTraitIssues.map(i => i.trait),
      priority: 'medium'
    })
  }
  
  const opposingTraitIssues = inconsistencies.filter(i => i.type === 'opposing-traits')
  if (opposingTraitIssues.length > 0) {
    recommendations.push({
      type: 'opposing-traits', 
      title: 'Consider Context Dependency',
      description: 'Your responses suggest you may adapt your behavior based on context, which is normal but worth noting.',
      traitPairs: opposingTraitIssues.map(i => [i.trait1, i.trait2]),
      priority: 'low'
    })
  }
  
  return recommendations
}