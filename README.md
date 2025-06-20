# GraviLog - AI-Powered Pregnancy Risk Assessment

A proactive RAG-based chatbot for pregnancy health assessment using comprehensive medical knowledge base and conversational AI.

## Features

### ✅ Complete RAG Implementation
- **Knowledge Base**: WHO pregnancy guidelines with evidence-based protocols
- **Proactive Questioning**: AI asks 5 sequential health questions before assessment
- **Risk Assessment**: Low/Medium/High risk levels with urgency indicators
- **Medical Reasoning**: Evidence-based analysis with condition matching

### ✅ Proactive Chatbot Flow
1. AI greets user and explains assessment process
2. Asks 5 targeted questions:
   - Bleeding or discharge symptoms
   - Headaches, vision changes, swelling
   - Baby movement patterns
   - Fever or infection signs
   - Pelvic pain or pressure
3. Analyzes responses using medical knowledge base
4. Provides structured risk assessment with recommendations

### ✅ RAG Architecture
- **Knowledge Retrieval**: Pattern matching against medical conditions
- **Symptom Analysis**: Multi-factor risk scoring system
- **Gestational Context**: Week-specific risk adjustments
- **Fallback Safety**: Rule-based assessment for reliability

## Deployment Options

### Netlify (Recommended for Production)
```bash
# 1. Build the project
npm run build

# 2. Deploy to Netlify
# - Connect GitHub repository to Netlify
# - Set build command: npm run build
# - Set publish directory: dist/public
# - Deploy automatically on push
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5000
```

## RAG System Architecture

### Knowledge Base Structure
- **High-Risk Combinations**: Preeclampsia, placental abruption, infections
- **Medium-Risk Patterns**: Hyperemesis, preterm labor, hypertension
- **Gestational Risks**: Trimester-specific complications
- **Emergency Criteria**: Immediate care indicators

### Assessment Pipeline
1. **Input Processing**: Parse user responses to medical symptoms
2. **Knowledge Retrieval**: Match symptoms against condition patterns
3. **Risk Calculation**: Score based on severity and combinations
4. **Contextual Adjustment**: Apply gestational week and history factors
5. **Recommendation Generation**: Evidence-based care instructions

## Medical Accuracy
- Based on WHO pregnancy care guidelines
- Evidence-based risk assessment protocols
- Professional medical condition recognition
- Emergency criteria from obstetric standards

## Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **RAG**: Knowledge base retrieval with pattern matching
- **UI**: Conversational chat interface with proactive questioning

## Testing the Chatbot

1. Open the application
2. Click the chat button to start assessment
3. AI will automatically begin with greeting and first question
4. Answer all 5 questions to receive risk assessment
5. Review color-coded results with medical recommendations

## Security & Privacy
- No personal data storage
- Serverless function processing
- Medical disclaimer included
- Emergency contact information provided

## Deployment Status
✅ RAG implementation complete
✅ Knowledge base integrated
✅ Proactive questioning implemented  
✅ Netlify-ready configuration
✅ Medical accuracy validated

Ready for production deployment with full RAG functionality.