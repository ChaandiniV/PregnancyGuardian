const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
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

// RAG-enhanced assessment endpoint with knowledge base
app.post('/api/assessments', async (req, res) => {
  try {
    console.log('Assessment request received:', req.body);
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = req.body;
    
    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }
    
    // Enhanced knowledge base for RAG-like retrieval
    const knowledgeBase = {
      highRiskCombinations: [
        {
          patterns: ['severe headache', 'vision changes', 'swelling'],
          condition: 'Preeclampsia',
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.95,
          recommendations: [
            'Seek immediate medical attention - go to emergency room',
            'This combination suggests preeclampsia, which requires urgent care',
            'Do not delay - call 911 if symptoms are severe',
            'Monitor blood pressure if possible'
          ]
        },
        {
          patterns: ['heavy bleeding', 'severe cramping'],
          condition: 'Possible miscarriage or placental abruption',
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.9,
          recommendations: [
            'Call emergency services immediately',
            'Go to nearest emergency room',
            'Do not drive yourself - call for help',
            'Note amount and color of bleeding for medical team'
          ]
        },
        {
          patterns: ['fever', 'chills', 'foul discharge'],
          condition: 'Possible intrauterine infection',
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.85,
          recommendations: [
            'Seek immediate medical care',
            'Infection during pregnancy requires urgent treatment',
            'Contact OB/GYN or go to emergency room',
            'Note temperature and discharge characteristics'
          ]
        },
        {
          patterns: ['no fetal movement', 'decreased movement'],
          condition: 'Fetal distress concern',
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.8,
          recommendations: [
            'Contact healthcare provider immediately',
            'Go to labor and delivery unit for monitoring',
            'Try drinking cold water and lying on left side',
            'Do not wait - decreased movement requires evaluation'
          ]
        }
      ],
      mediumRiskPatterns: [
        {
          patterns: ['persistent vomiting', 'dehydration'],
          condition: 'Hyperemesis gravidarum',
          recommendations: [
            'Contact healthcare provider within 24 hours',
            'Monitor hydration status',
            'Try small, frequent meals',
            'Consider anti-nausea medications with doctor approval'
          ]
        },
        {
          patterns: ['regular contractions', 'pelvic pressure'],
          condition: 'Possible preterm labor',
          recommendations: [
            'Time contractions and contact provider if regular',
            'Lie down and drink water',
            'If before 37 weeks, seek immediate evaluation',
            'Monitor for other labor signs'
          ]
        },
        {
          patterns: ['headache', 'high blood pressure'],
          condition: 'Hypertension monitoring needed',
          recommendations: [
            'Monitor blood pressure regularly',
            'Contact provider if persistently elevated',
            'Reduce sodium intake',
            'Watch for vision changes or severe headaches'
          ]
        }
      ],
      gestationalRisks: {
        firstTrimester: {
          highRisk: ['bleeding', 'severe cramping', 'shoulder pain'],
          concerns: 'Early pregnancy complications including ectopic pregnancy'
        },
        secondTrimester: {
          moderate: ['decreased movement', 'leaking fluid'],
          concerns: 'Cervical insufficiency and gestational diabetes screening'
        },
        thirdTrimester: {
          highRisk: ['severe swelling', 'persistent headache', 'vision changes'],
          concerns: 'Preeclampsia and preterm labor monitoring'
        }
      }
    };
    
    // RAG-like knowledge retrieval and analysis
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
      
      // Check high-risk combinations first
      for (const combo of knowledgeBase.highRiskCombinations) {
        const matchCount = combo.patterns.filter(pattern => 
          symptomsText.includes(pattern.toLowerCase())
        ).length;
        
        if (matchCount >= 2 || (matchCount >= 1 && combo.patterns.length === 1)) {
          assessment = {
            riskLevel: combo.riskLevel,
            urgency: combo.urgency,
            confidence: combo.confidence,
            recommendations: combo.recommendations,
            reasoning: `Knowledge base match: ${combo.condition}. Pattern analysis indicates high-risk symptom combination requiring immediate attention.`,
            matchedConditions: [combo.condition]
          };
          break; // Return immediately for high-risk matches
        }
      }
      
      // If not high risk, check medium risk patterns
      if (assessment.riskLevel === 'low') {
        for (const pattern of knowledgeBase.mediumRiskPatterns) {
          const hasPattern = pattern.patterns.some(p => 
            symptomsText.includes(p.toLowerCase())
          );
          
          if (hasPattern) {
            assessment = {
              riskLevel: 'moderate',
              urgency: 'within_24_hours',
              confidence: 0.75,
              recommendations: pattern.recommendations,
              reasoning: `Knowledge base assessment: ${pattern.condition}. Symptoms require medical evaluation and monitoring.`,
              matchedConditions: [pattern.condition]
            };
          }
        }
      }
      
      // Gestational week-specific adjustments
      if (gestationalWeek && assessment.riskLevel !== 'low') {
        const risks = knowledgeBase.gestationalRisks;
        let gestationalContext = '';
        
        if (gestationalWeek <= 12) {
          if (risks.firstTrimester.highRisk.some(risk => symptomsText.includes(risk))) {
            assessment.urgency = 'immediate';
            gestationalContext = risks.firstTrimester.concerns;
          }
        } else if (gestationalWeek <= 27) {
          gestationalContext = risks.secondTrimester.concerns;
        } else {
          if (risks.thirdTrimester.highRisk.some(risk => symptomsText.includes(risk))) {
            assessment.riskLevel = 'high';
            assessment.urgency = 'immediate';
          }
          gestationalContext = risks.thirdTrimester.concerns;
        }
        
        if (gestationalContext) {
          assessment.reasoning += ` Gestational week ${gestationalWeek}: ${gestationalContext}.`;
        }
      }
      
      return assessment;
    }
    
    // Perform RAG-enhanced assessment
    const ragAssessment = analyzeWithKnowledgeBase(symptoms, gestationalWeek);
    
    // Apply previous complications factor
    if (previousComplications && ragAssessment.riskLevel !== 'low') {
      ragAssessment.urgency = ragAssessment.urgency === 'routine' ? 'within_24_hours' : 
                              ragAssessment.urgency === 'within_24_hours' ? 'immediate' : ragAssessment.urgency;
      ragAssessment.recommendations.push('Previous complications increase current risk - seek prompt medical evaluation');
      ragAssessment.reasoning += ' Previous pregnancy complications noted in assessment.';
    }
    
    // Include additional symptoms in reasoning
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

  // Nested function needs to be accessible
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
    
    // High-risk combinations check (simplified for inline function)
    const highRiskPatterns = [
      { patterns: ['severe headache', 'vision changes'], condition: 'Preeclampsia risk' },
      { patterns: ['heavy bleeding', 'severe cramping'], condition: 'Hemorrhage risk' },
      { patterns: ['fever', 'chills'], condition: 'Infection risk' }
    ];
    
    for (const pattern of highRiskPatterns) {
      const matches = pattern.patterns.filter(p => symptomsText.includes(p)).length;
      if (matches >= 2) {
        assessment = {
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.9,
          recommendations: [
            'Seek immediate medical attention',
            'Go to emergency room or call 911',
            'Do not delay medical care'
          ],
          reasoning: `High-risk pattern detected: ${pattern.condition}. Immediate medical evaluation required.`,
          matchedConditions: [pattern.condition]
        };
        break;
      }
    }
    
    // Medium risk check
    if (assessment.riskLevel === 'low') {
      const mediumRiskTerms = ['vomiting', 'headache', 'bleeding', 'contractions', 'swelling'];
      const mediumMatches = mediumRiskTerms.filter(term => symptomsText.includes(term)).length;
      
      if (mediumMatches >= 1) {
        assessment = {
          riskLevel: 'moderate',
          urgency: 'within_24_hours',
          confidence: 0.75,
          recommendations: [
            'Contact healthcare provider within 24 hours',
            'Monitor symptoms closely',
            'Seek care if symptoms worsen'
          ],
          reasoning: `Moderate risk symptoms identified. Medical consultation recommended within 24 hours.`,
          matchedConditions: ['General pregnancy concerns']
        };
      }
    }
    
    return assessment;
  }
});

// Get assessment by ID endpoint
app.get('/api/assessments/:id', (req, res) => {
  const assessmentId = parseInt(req.params.id);
  
  if (isNaN(assessmentId)) {
    return res.status(400).json({ error: 'Invalid assessment ID' });
  }
  
  // In a real app, you'd fetch from database
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports.handler = serverless(app);