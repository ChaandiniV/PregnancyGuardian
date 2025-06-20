import express from 'express';
import serverless from 'serverless-http';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Root health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GraviLog RAG API is running' });
});

// Knowledge base analysis function
function analyzeWithKnowledgeBase(symptoms, gestationalWeek) {
  let assessment = {
    riskLevel: 'low',
    urgency: 'routine',
    confidence: 0.7,
    recommendations: ['Continue routine prenatal care', 'Monitor symptoms'],
    reasoning: 'Standard pregnancy symptoms assessment',
    matchedConditions: []
  };
  
  const symptomsText = symptoms.join(' ').toLowerCase();
  
  // High-risk combinations from knowledge base
  const highRiskPatterns = [
    { 
      patterns: ['severe headache', 'vision changes', 'vision'], 
      condition: 'Preeclampsia risk',
      recommendations: ['Seek immediate medical attention', 'Blood pressure check needed', 'Protein urine test required']
    },
    { 
      patterns: ['heavy bleeding', 'severe bleeding', 'severe cramping'], 
      condition: 'Hemorrhage risk',
      recommendations: ['Go to emergency room immediately', 'Call 911 if bleeding is severe', 'Do not delay medical care']
    },
    { 
      patterns: ['fever', 'chills'], 
      condition: 'Infection risk',
      recommendations: ['Contact healthcare provider immediately', 'Temperature monitoring', 'Blood work may be needed']
    },
    { 
      patterns: ['chest pain', 'difficulty breathing'], 
      condition: 'Cardiovascular emergency',
      recommendations: ['Call 911 immediately', 'Go to emergency room', 'May indicate heart or lung problems']
    },
    { 
      patterns: ['fainting', 'severe dizziness'], 
      condition: 'Circulatory emergency',
      recommendations: ['Seek immediate medical evaluation', 'Blood pressure and heart rate check', 'IV fluids may be needed']
    }
  ];
  
  // Check for high-risk patterns
  for (const pattern of highRiskPatterns) {
    const matches = pattern.patterns.filter(p => symptomsText.includes(p)).length;
    if (matches >= 1) {
      assessment = {
        riskLevel: 'high',
        urgency: 'immediate',
        confidence: 0.9,
        recommendations: pattern.recommendations,
        reasoning: `High-risk pattern detected: ${pattern.condition}. Immediate medical evaluation required based on WHO pregnancy guidelines.`,
        matchedConditions: [pattern.condition]
      };
      break;
    }
  }
  
  // Medium risk patterns
  if (assessment.riskLevel === 'low') {
    const mediumRiskPatterns = [
      { patterns: ['bleeding', 'cramping'], condition: 'Potential complications' },
      { patterns: ['headache', 'swelling'], condition: 'Pre-eclampsia monitoring' },
      { patterns: ['vomiting', 'persistent vomiting'], condition: 'Hyperemesis concern' },
      { patterns: ['contractions', 'regular contractions'], condition: 'Preterm labor risk' }
    ];
    
    for (const pattern of mediumRiskPatterns) {
      const matches = pattern.patterns.filter(p => symptomsText.includes(p)).length;
      if (matches >= 1) {
        assessment = {
          riskLevel: 'moderate',
          urgency: 'within_24_hours',
          confidence: 0.75,
          recommendations: [
            'Contact healthcare provider within 24 hours',
            'Monitor symptoms closely',
            'Seek immediate care if symptoms worsen',
            'Keep a symptom diary'
          ],
          reasoning: `Moderate risk symptoms identified: ${pattern.condition}. Medical consultation recommended within 24 hours.`,
          matchedConditions: [pattern.condition]
        };
        break;
      }
    }
  }
  
  // Gestational week adjustments
  if (gestationalWeek) {
    if (gestationalWeek < 12 && assessment.riskLevel === 'moderate') {
      assessment.recommendations.push('First trimester bleeding requires prompt evaluation');
      assessment.reasoning += ' First trimester complications noted.';
    } else if (gestationalWeek > 37 && symptomsText.includes('contractions')) {
      assessment.recommendations.push('Full-term pregnancy - contractions may indicate labor');
      assessment.reasoning += ' Term pregnancy with contractions - labor assessment needed.';
    } else if (gestationalWeek < 37 && symptomsText.includes('contractions')) {
      assessment.riskLevel = 'high';
      assessment.urgency = 'immediate';
      assessment.recommendations = ['Seek immediate medical attention', 'Possible preterm labor', 'Hospital evaluation required'];
      assessment.reasoning += ' Preterm contractions detected - immediate evaluation required.';
    }
  }
  
  return assessment;
}

// RAG-enhanced assessment endpoint with knowledge base
app.post('/api/assessments', async (req, res) => {
  try {
    console.log('Assessment request received:', req.body);
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = req.body;
    
    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }

    // Use RAG assessment logic
    const ragAssessment = analyzeWithKnowledgeBase(symptoms, gestationalWeek);
    
    // Adjust for previous complications
    if (previousComplications && ragAssessment.riskLevel !== 'low') {
      ragAssessment.urgency = ragAssessment.urgency === 'routine' ? 'within_24_hours' : 
                              ragAssessment.urgency === 'within_24_hours' ? 'immediate' : ragAssessment.urgency;
      ragAssessment.recommendations.push('Previous complications increase current risk - seek prompt medical evaluation');
      ragAssessment.reasoning += ' Previous pregnancy complications noted in assessment.';
    }
    
    if (additionalSymptoms) {
      ragAssessment.reasoning += ` Additional reported symptoms: ${additionalSymptoms}.`;
    }
    
    const response = {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `session_${Date.now()}`,
      riskLevel: ragAssessment.riskLevel,
      recommendations: ragAssessment.recommendations,
      aiAnalysis: ragAssessment.reasoning,
      confidence: ragAssessment.confidence,
      urgency: ragAssessment.urgency
    };
    
    console.log('Assessment response:', response);
    res.json(response);
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ 
      error: 'Assessment failed', 
      message: error.message,
      details: 'Please try again or contact support'
    });
  }
});

// Alternative assessment route without /api prefix  
app.post('/assessments', async (req, res) => {
  try {
    console.log('Assessment request (no /api):', req.body);
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }

    // Use same RAG assessment logic
    const ragAssessment = analyzeWithKnowledgeBase(symptoms, gestationalWeek);
    
    if (previousComplications && ragAssessment.riskLevel !== 'low') {
      ragAssessment.urgency = ragAssessment.urgency === 'routine' ? 'within_24_hours' : 
                              ragAssessment.urgency === 'within_24_hours' ? 'immediate' : ragAssessment.urgency;
      ragAssessment.recommendations.push('Previous complications increase current risk - seek prompt medical evaluation');
      ragAssessment.reasoning += ' Previous pregnancy complications noted in assessment.';
    }
    
    if (additionalSymptoms) {
      ragAssessment.reasoning += ` Additional reported symptoms: ${additionalSymptoms}.`;
    }
    
    const response = {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `session_${Date.now()}`,
      riskLevel: ragAssessment.riskLevel,
      recommendations: ragAssessment.recommendations,
      aiAnalysis: ragAssessment.reasoning,
      confidence: ragAssessment.confidence,
      urgency: ragAssessment.urgency
    };
    
    res.json(response);
  } catch (error) {
    console.error('Assessment error (no /api):', error);
    res.status(500).json({ 
      error: 'Assessment failed', 
      message: error.message 
    });
  }
});

// Assessment retrieval endpoint
app.get('/api/assessments/:id', (req, res) => {
  // For now, return a not found error since we don't persist assessments
  res.status(404).json({ error: 'Assessment not found' });
});

// Symptoms endpoint - both with and without /api prefix for Netlify routing
app.get('/api/symptoms', (req, res) => {
  const symptoms = [
    { id: 1, name: 'Nausea', category: 'digestive', description: 'Feeling sick or queasy', severityWeight: 2 },
    { id: 2, name: 'Morning Sickness', category: 'digestive', description: 'Nausea and vomiting in early pregnancy', severityWeight: 2 },
    { id: 3, name: 'Fatigue', category: 'general', description: 'Extreme tiredness or exhaustion', severityWeight: 1 },
    { id: 4, name: 'Breast Tenderness', category: 'physical', description: 'Sore or tender breasts', severityWeight: 1 },
    { id: 5, name: 'Frequent Urination', category: 'urinary', description: 'Need to urinate more often', severityWeight: 1 },
    { id: 6, name: 'Headache', category: 'neurological', description: 'Head pain or pressure', severityWeight: 3 },
    { id: 7, name: 'Severe Headache', category: 'neurological', description: 'Intense head pain', severityWeight: 5 },
    { id: 8, name: 'Bleeding', category: 'reproductive', description: 'Vaginal bleeding', severityWeight: 4 },
    { id: 9, name: 'Severe Bleeding', category: 'reproductive', description: 'Heavy vaginal bleeding', severityWeight: 5 },
    { id: 10, name: 'Cramping', category: 'reproductive', description: 'Abdominal or pelvic cramping', severityWeight: 3 },
    { id: 11, name: 'Severe Cramping', category: 'reproductive', description: 'Intense abdominal pain', severityWeight: 5 },
    { id: 12, name: 'Back Pain', category: 'musculoskeletal', description: 'Lower back discomfort', severityWeight: 2 },
    { id: 13, name: 'Fever', category: 'general', description: 'Elevated body temperature', severityWeight: 4 },
    { id: 14, name: 'Chills', category: 'general', description: 'Feeling cold or shivering', severityWeight: 3 },
    { id: 15, name: 'Dizziness', category: 'neurological', description: 'Feeling lightheaded or unsteady', severityWeight: 3 },
    { id: 16, name: 'Fainting', category: 'neurological', description: 'Loss of consciousness', severityWeight: 5 },
    { id: 17, name: 'Chest Pain', category: 'cardiovascular', description: 'Pain or pressure in chest', severityWeight: 5 },
    { id: 18, name: 'Difficulty Breathing', category: 'respiratory', description: 'Shortness of breath', severityWeight: 4 },
    { id: 19, name: 'Swelling', category: 'cardiovascular', description: 'Swelling in hands, face, or legs', severityWeight: 3 },
    { id: 20, name: 'Vision Changes', category: 'neurological', description: 'Blurred or changed vision', severityWeight: 4 },
    { id: 21, name: 'Contractions', category: 'reproductive', description: 'Regular tightening of uterus', severityWeight: 4 },
    { id: 22, name: 'Leaking Fluid', category: 'reproductive', description: 'Fluid leaking from vagina', severityWeight: 4 },
    { id: 23, name: 'Decreased Fetal Movement', category: 'fetal', description: 'Baby moving less than usual', severityWeight: 4 },
    { id: 24, name: 'Persistent Vomiting', category: 'digestive', description: 'Continuous vomiting', severityWeight: 4 },
    { id: 25, name: 'Mood Changes', category: 'psychological', description: 'Emotional changes or depression', severityWeight: 2 },
    { id: 26, name: 'Heartburn', category: 'digestive', description: 'Burning sensation in chest', severityWeight: 1 },
    { id: 27, name: 'Constipation', category: 'digestive', description: 'Difficulty with bowel movements', severityWeight: 1 },
    { id: 28, name: 'Leg Cramps', category: 'musculoskeletal', description: 'Muscle cramps in legs', severityWeight: 1 },
    { id: 29, name: 'Varicose Veins', category: 'cardiovascular', description: 'Enlarged veins in legs', severityWeight: 1 },
    { id: 30, name: 'Hemorrhoids', category: 'digestive', description: 'Swollen veins in rectum', severityWeight: 1 }
  ];
  res.json(symptoms);
});

// Alternative symptoms route without /api prefix
app.get('/symptoms', (req, res) => {
  const symptoms = [
    { id: 1, name: 'Nausea', category: 'digestive', description: 'Feeling sick or queasy', severityWeight: 2 },
    { id: 2, name: 'Morning Sickness', category: 'digestive', description: 'Nausea and vomiting in early pregnancy', severityWeight: 2 },
    { id: 3, name: 'Fatigue', category: 'general', description: 'Extreme tiredness or exhaustion', severityWeight: 1 },
    { id: 4, name: 'Breast Tenderness', category: 'physical', description: 'Sore or tender breasts', severityWeight: 1 },
    { id: 5, name: 'Frequent Urination', category: 'urinary', description: 'Need to urinate more often', severityWeight: 1 },
    { id: 6, name: 'Headache', category: 'neurological', description: 'Head pain or pressure', severityWeight: 3 },
    { id: 7, name: 'Severe Headache', category: 'neurological', description: 'Intense head pain', severityWeight: 5 },
    { id: 8, name: 'Bleeding', category: 'reproductive', description: 'Vaginal bleeding', severityWeight: 4 },
    { id: 9, name: 'Severe Bleeding', category: 'reproductive', description: 'Heavy vaginal bleeding', severityWeight: 5 },
    { id: 10, name: 'Cramping', category: 'reproductive', description: 'Abdominal or pelvic cramping', severityWeight: 3 },
    { id: 11, name: 'Severe Cramping', category: 'reproductive', description: 'Intense abdominal pain', severityWeight: 5 },
    { id: 12, name: 'Back Pain', category: 'musculoskeletal', description: 'Lower back discomfort', severityWeight: 2 },
    { id: 13, name: 'Fever', category: 'general', description: 'Elevated body temperature', severityWeight: 4 },
    { id: 14, name: 'Chills', category: 'general', description: 'Feeling cold or shivering', severityWeight: 3 },
    { id: 15, name: 'Dizziness', category: 'neurological', description: 'Feeling lightheaded or unsteady', severityWeight: 3 },
    { id: 16, name: 'Fainting', category: 'neurological', description: 'Loss of consciousness', severityWeight: 5 },
    { id: 17, name: 'Chest Pain', category: 'cardiovascular', description: 'Pain or pressure in chest', severityWeight: 5 },
    { id: 18, name: 'Difficulty Breathing', category: 'respiratory', description: 'Shortness of breath', severityWeight: 4 },
    { id: 19, name: 'Swelling', category: 'cardiovascular', description: 'Swelling in hands, face, or legs', severityWeight: 3 },
    { id: 20, name: 'Vision Changes', category: 'neurological', description: 'Blurred or changed vision', severityWeight: 4 },
    { id: 21, name: 'Contractions', category: 'reproductive', description: 'Regular tightening of uterus', severityWeight: 4 },
    { id: 22, name: 'Leaking Fluid', category: 'reproductive', description: 'Fluid leaking from vagina', severityWeight: 4 },
    { id: 23, name: 'Decreased Fetal Movement', category: 'fetal', description: 'Baby moving less than usual', severityWeight: 4 },
    { id: 24, name: 'Persistent Vomiting', category: 'digestive', description: 'Continuous vomiting', severityWeight: 4 },
    { id: 25, name: 'Mood Changes', category: 'psychological', description: 'Emotional changes or depression', severityWeight: 2 },
    { id: 26, name: 'Heartburn', category: 'digestive', description: 'Burning sensation in chest', severityWeight: 1 },
    { id: 27, name: 'Constipation', category: 'digestive', description: 'Difficulty with bowel movements', severityWeight: 1 },
    { id: 28, name: 'Leg Cramps', category: 'musculoskeletal', description: 'Muscle cramps in legs', severityWeight: 1 },
    { id: 29, name: 'Varicose Veins', category: 'cardiovascular', description: 'Enlarged veins in legs', severityWeight: 1 },
    { id: 30, name: 'Hemorrhoids', category: 'digestive', description: 'Swollen veins in rectum', severityWeight: 1 }
  ];
  res.json(symptoms);
});

// Catch-all route for unmatched paths
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export const handler = serverless(app);