# AI Integration Setup Guide

## 🤖 Free AI API Options

Your assessment platform now supports AI-powered hints and explanations. Here are the best free options:

### Option 1: Hugging Face (Recommended - Completely Free)

1. **Sign up** at [huggingface.co](https://huggingface.co/join)
2. **Get API key** at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Update the API key** in `src/services/aiService.js`:
   ```javascript
   const HUGGING_FACE_API_KEY = 'hf_your_actual_api_key_here'
   ```

**Benefits:**
- ✅ Completely free
- ✅ No credit card required
- ✅ Good for educational use
- ✅ Multiple model options

### Option 2: Cohere (Free Tier)

1. **Sign up** at [cohere.ai](https://cohere.ai/)
2. **Get API key** from dashboard
3. **Update aiService.js** to use Cohere endpoint

**Benefits:**
- ✅ 100 free API calls per month
- ✅ High-quality responses
- ✅ Good documentation

### Option 3: Together AI (Free Credits)

1. **Sign up** at [together.ai](https://together.ai/)
2. **Get $25 free credits**
3. **Access to multiple open-source models**

### Option 4: Use Built-in Simple AI (No API Required)

If you don't want to set up any API, the system will automatically fall back to a pattern-based AI that works offline.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Hugging Face API Key
```bash
# 1. Go to https://huggingface.co/join
# 2. Sign up with email
# 3. Go to https://huggingface.co/settings/tokens
# 4. Create new token with "Read" permission
# 5. Copy the token (starts with "hf_")
```

### Step 2: Update Configuration
```javascript
// In src/services/aiService.js, replace:
const HUGGING_FACE_API_KEY = 'hf_your_api_key_here'

// With your actual key:
const HUGGING_FACE_API_KEY = 'hf_abcdefghijklmnopqrstuvwxyz1234567890'
```

### Step 3: Test the Integration
1. Start your app: `npm run dev`
2. Take any assessment
3. Click "AI Help" button
4. Try generating hints and explanations

## 🔧 Advanced Configuration

### Using Different Models

You can experiment with different Hugging Face models:

```javascript
// In aiService.js, change the model URL:
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'

// Try these alternatives:
// 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill'
// 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large'
// 'https://api-inference.huggingface.co/models/google/flan-t5-base'
```

### Custom Prompts

Modify the prompts in `aiService.js` to get better responses for your specific domain:

```javascript
const prompt = `You are an educational AI assistant helping students learn.

Question: ${question.text}

Provide a helpful hint that guides thinking without giving the direct answer.
Focus on methodology and key concepts.

Hint:`
```

## 🎯 Features Enabled

With AI integration, your users get:

- **Smart Hints** - Context-aware guidance without spoiling answers
- **Detailed Explanations** - Step-by-step breakdowns of concepts
- **Learning Support** - Educational content that promotes understanding
- **Fallback System** - Works even when AI APIs are unavailable

## 🔒 Privacy & Security

- **No sensitive data** is sent to AI services
- **Only question text** is processed
- **User answers** are never shared with AI
- **Fallback system** ensures functionality without external APIs

## 💡 Tips for Best Results

1. **Clear Questions** - Well-written questions get better AI responses
2. **Structured Content** - Questions with clear options work best
3. **Domain-Specific** - Customize prompts for your subject area
4. **Test Regularly** - AI responses can vary, so test different scenarios

## 🆘 Troubleshooting

**AI not working?**
- Check API key is correct
- Verify internet connection
- Check browser console for errors
- System will fall back to pattern-based hints

**Poor quality responses?**
- Try different Hugging Face models
- Adjust prompts in aiService.js
- Consider upgrading to paid AI service

**Rate limits?**
- Hugging Face has generous free limits
- Consider caching responses
- Implement request throttling if needed

Your AI-powered assessment platform is ready! 🚀