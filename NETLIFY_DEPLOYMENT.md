# Netlify Deployment Guide - RAG System

## Complete RAG Implementation Ready for Deployment

### What's Included:
✅ **RAG Knowledge Base**: WHO pregnancy guidelines with pattern matching
✅ **Proactive Questioning**: 5 sequential health assessment questions
✅ **LlamaIndex-style Retrieval**: Knowledge base pattern matching and reasoning
✅ **Risk Assessment**: Evidence-based medical analysis with urgency levels
✅ **Serverless Functions**: Netlify-optimized backend with embedded knowledge

## Deployment Steps

### 1. Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Connect your GitHub repository
- Import this project

### 2. Build Configuration
```
Build command: npm run build
Publish directory: dist/public
Node version: 20
```

### 3. Deploy Settings
The `netlify.toml` file contains all necessary configuration:
- API routes → Netlify functions
- SPA routing → Index.html fallback
- CORS headers for API access

### 4. Test RAG Functionality
After deployment:
1. Open the deployed URL
2. Click chat button to start proactive assessment
3. AI will ask 5 health questions automatically
4. Complete assessment to see RAG-powered risk analysis

## RAG System Features

### Knowledge Base Coverage:
- **High-Risk Conditions**: Preeclampsia, placental abruption, infections
- **Emergency Patterns**: Multiple symptom combinations for immediate care
- **Gestational Context**: Week-specific risk adjustments
- **Evidence-Based**: WHO guidelines and medical protocols

### Proactive Questions:
1. "Are you currently experiencing any unusual bleeding or discharge?"
2. "Do you have any persistent headaches, blurry vision, or swelling?"
3. "How has your baby's movement been today compared to yesterday?"
4. "Have you had a fever or noticed any foul-smelling discharge?"
5. "Are you feeling any pressure or pain in your pelvis or lower back?"

### Assessment Output:
- Risk Level: Low/Moderate/High with color coding
- Urgency: Routine/24hrs/Immediate care timeline
- Recommendations: Specific medical guidance
- Reasoning: Evidence-based analysis explanation

## No API Keys Required
The system uses embedded knowledge base and rule-based assessment, eliminating:
- OpenAI API costs
- Hugging Face rate limits
- External service dependencies

## Production Ready
- Serverless architecture scales automatically
- Medical disclaimers included
- Emergency contact information provided
- HIPAA-conscious design (no data storage)

Deploy now for a fully functional RAG-powered pregnancy assessment chatbot.