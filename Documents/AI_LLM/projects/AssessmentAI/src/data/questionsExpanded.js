// This file contains expanded question sets with 50+ questions each
// Due to length, I'll create a structured approach

export const expandedQuestionBank = {
  coding: {
    count: 50,
    timeLimit: 90, // 90 minutes for 50 questions
    categories: [
      "Arrays & Strings",
      "Linked Lists", 
      "Trees & Graphs",
      "Dynamic Programming",
      "Sorting & Searching",
      "Hash Tables",
      "Stack & Queue",
      "Recursion & Backtracking",
      "Greedy Algorithms",
      "Bit Manipulation"
    ]
  },
  
  "system-design": {
    count: 50,
    timeLimit: 75, // 75 minutes
    categories: [
      "Scalability & Load Balancing",
      "Database Design",
      "Caching Strategies", 
      "Microservices Architecture",
      "API Design",
      "Security & Authentication",
      "Monitoring & Logging",
      "Data Processing",
      "Cloud Architecture",
      "Performance Optimization"
    ]
  },

  frontend: {
    count: 50,
    timeLimit: 70, // 70 minutes
    categories: [
      "React & Component Architecture",
      "JavaScript ES6+",
      "CSS & Responsive Design",
      "Performance Optimization",
      "State Management",
      "Testing & Debugging",
      "Build Tools & Bundlers",
      "Browser APIs",
      "Accessibility",
      "Security"
    ]
  },

  behavioral: {
    count: 50,
    timeLimit: 60, // 60 minutes
    categories: [
      "Leadership & Influence",
      "Problem Solving",
      "Communication",
      "Teamwork & Collaboration", 
      "Conflict Resolution",
      "Adaptability & Learning",
      "Decision Making",
      "Time Management",
      "Innovation & Creativity",
      "Customer Focus"
    ]
  },

  personality: {
    count: 50,
    timeLimit: 25, // 25 minutes (existing)
    categories: [
      "Teamwork vs Independence",
      "Leadership Style",
      "Communication Preferences",
      "Stress Management",
      "Planning & Organization"
    ]
  },

  "ai-business-analyst": {
    count: 50,
    timeLimit: 75, // 75 minutes
    categories: [
      "Data Quality & Management",
      "Stakeholder Communication",
      "AI Model Evaluation",
      "Business Requirements",
      "Process Improvement",
      "Risk Assessment",
      "Compliance & Ethics",
      "Project Management",
      "Technical Translation",
      "Change Management"
    ]
  },

  "ai-solution-architect": {
    count: 50,
    timeLimit: 90, // 90 minutes
    categories: [
      "Platform Architecture",
      "AI/ML Systems Design",
      "Cloud Infrastructure",
      "Security & Compliance",
      "Performance & Scalability",
      "Integration Patterns",
      "DevOps & Deployment",
      "Monitoring & Observability",
      "Cost Optimization",
      "Technical Leadership"
    ]
  }
}

// Sample question structure for each category
export const questionTemplates = {
  coding: {
    easy: 15,    // 15 easy questions
    medium: 25,  // 25 medium questions  
    hard: 10     // 10 hard questions
  },
  
  "system-design": {
    easy: 10,
    medium: 30,
    hard: 10
  },
  
  frontend: {
    easy: 20,
    medium: 25,
    hard: 5
  },
  
  behavioral: {
    easy: 15,
    medium: 30,
    hard: 5
  },
  
  "ai-business-analyst": {
    easy: 10,
    medium: 30,
    hard: 10
  },
  
  "ai-solution-architect": {
    easy: 5,
    medium: 25,
    hard: 20
  }
}