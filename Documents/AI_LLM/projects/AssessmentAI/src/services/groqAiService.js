// AI Service using Groq API
// Groq provides fast inference with Llama models

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key-here'
const GROQ_MODEL = 'llama-3.3-70b-versatile' // Latest versatile Llama model

export const groqAiService = {
  async callGroqAPI(prompt, maxTokens = 200) {
    try {
      console.log('🤖 Calling Groq API with prompt:', prompt.substring(0, 100) + '...')
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Groq API request failed:', response.status, response.statusText, errorText)
        return null
      }

      const data = await response.json()
      console.log('✅ Groq API response:', data)
      
      // Extract the generated text from Groq response
      const result = data.choices?.[0]?.message?.content || ''
      console.log('📝 Extracted result:', result)
      
      return result.trim()
      
    } catch (error) {
      console.error('❌ Groq API error:', error)
      return null
    }
  },

  async generateHint(question) {
    try {
      console.log('=== GROQ AI HINT GENERATION ===')
      console.log('Question object:', question)
      
      // Extract question details
      const questionText = (
        question.text || 
        question.question || 
        question.description || 
        question.title || 
        'No question text available'
      )
      
      const options = question.options ? 
        question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text || opt.label || opt}`).join('\n') : ''
      
      const prompt = `You are an expert programming and technical tutor. A student is taking an assessment and needs a helpful hint for this question. Provide a strategic hint that guides their thinking without revealing the direct answer.

Question: ${questionText}
${options ? `\nOptions:\n${options}` : ''}

Please provide a helpful hint that:
1. Explains the key concept or principle being tested
2. Suggests the right approach or methodology
3. Gives guidance on what to consider
4. Helps them think through the problem systematically
5. Does NOT reveal the direct answer

Format your response as a clear, educational hint that helps them learn.

Hint:`

      console.log('🚀 Sending prompt to Groq...')
      const result = await this.callGroqAPI(prompt, 250)
      
      if (result && result.length > 10) {
        console.log('✅ Got Groq result, formatting...')
        return this.formatHint(result)
      } else {
        console.log('❌ Groq failed, using fallback')
        return this.getFallbackHint(question)
      }
      
    } catch (error) {
      console.error('❌ Groq hint generation failed:', error)
      return this.getFallbackHint(question)
    }
  },

  async generateExplanation(question) {
    try {
      console.log('=== GROQ AI EXPLANATION GENERATION ===')
      
      // Extract question details
      const questionText = (
        question.text || 
        question.question || 
        question.description || 
        question.title || 
        'No question text available'
      )
      
      const options = question.options ? 
        question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text || opt.label || opt}`).join('\n') : ''
      
      const prompt = `You are an expert programming and technical instructor. Provide a comprehensive explanation for this assessment question that helps the student understand the concepts deeply.

Question: ${questionText}
${options ? `\nOptions:\n${options}` : ''}

Please provide a detailed explanation that includes:
1. The key concepts and principles involved
2. Step-by-step reasoning approach
3. Why each option is correct or incorrect (if multiple choice)
4. Time/space complexity analysis (if applicable)
5. Best practices and common pitfalls
6. Real-world applications or examples

Make it educational and thorough, helping the student learn the underlying concepts.

Explanation:`

      console.log('🚀 Sending explanation prompt to Groq...')
      const result = await this.callGroqAPI(prompt, 400)
      
      if (result && result.length > 20) {
        console.log('✅ Got Groq explanation, formatting...')
        return this.formatExplanation(result)
      } else {
        console.log('❌ Groq failed, using fallback')
        return this.getFallbackExplanation(question)
      }
      
    } catch (error) {
      console.error('❌ Groq explanation generation failed:', error)
      return this.getFallbackExplanation(question)
    }
  },

  formatHint(hint) {
    return `💡 **AI-Generated Hint:**

${hint}

**Remember:** This hint is designed to guide your thinking. Use it to understand the approach and work through the problem yourself.`
  },

  formatExplanation(explanation) {
    return `📚 **AI-Generated Explanation:**

${explanation}

**Note:** This explanation is generated to help you understand the concepts. Always verify with additional resources and consider multiple perspectives.`
  },

  getFallbackHint(question) {
    return `💡 **Hint:**

Think about the key concepts being tested in this question. Consider:
- What is the main topic or principle involved?
- What approach or methodology would be most appropriate?
- Are there any trade-offs or considerations to keep in mind?
- What would be the most efficient or correct solution?

Take your time to analyze each option carefully.`
  },

  getFallbackExplanation(question) {
    return `📚 **Explanation:**

This question tests your understanding of important technical concepts. 

**To approach this type of question:**
1. **Identify the core concept** being tested
2. **Apply relevant principles** and best practices
3. **Consider the context** and requirements
4. **Evaluate each option** systematically
5. **Choose the most appropriate solution**

**Learning Tips:**
- Review the fundamental concepts related to this topic
- Practice similar problems to reinforce understanding
- Consider real-world applications and use cases
- Think about trade-offs and implications of different approaches`
  }
}

export default groqAiService