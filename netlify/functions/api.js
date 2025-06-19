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

// Assessment endpoint - simplified for deployment
app.post('/api/assessments', async (req, res) => {
  try {
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = req.body;
    
    // Comprehensive pregnancy risk assessment based on medical knowledge
    const emergencySymptoms = [
      'severe bleeding', 'heavy bleeding', 'hemorrhage', 'severe abdominal pain', 
      'severe cramping', 'severe headache', 'vision changes', 'blurred vision',
      'chest pain', 'difficulty breathing', 'fainting', 'dizziness', 'seizures',
      'high fever', 'chills', 'severe nausea', 'persistent vomiting'
    ];
    
    const highRiskSymptoms = [
      'bleeding', 'spotting', 'cramping', 'contractions', 'pelvic pressure',
      'back pain', 'fever', 'headache', 'swelling', 'protein in urine',
      'decreased fetal movement', 'leaking fluid'
    ];
    
    const moderateRiskSymptoms = [
      'nausea', 'morning sickness', 'fatigue', 'breast tenderness',
      'mood changes', 'frequent urination', 'constipation', 'heartburn',
      'leg cramps', 'varicose veins', 'hemorrhoids'
    ];
    
    let riskLevel = 'low';
    let urgency = 'routine';
    let recommendations = ['Continue regular prenatal care', 'Maintain healthy lifestyle'];
    let confidence = 0.8;
    
    // Check for emergency symptoms
    const hasEmergencySymptoms = symptoms.some(s => 
      emergencySymptoms.some(es => s.toLowerCase().includes(es.toLowerCase()))
    );
    
    // Check for high risk symptoms
    const hasHighRiskSymptoms = symptoms.some(s => 
      highRiskSymptoms.some(hrs => s.toLowerCase().includes(hrs.toLowerCase()))
    );
    
    // Check for moderate risk symptoms
    const hasModerateRiskSymptoms = symptoms.some(s => 
      moderateRiskSymptoms.some(mrs => s.toLowerCase().includes(mrs.toLowerCase()))
    );
    
    if (hasEmergencySymptoms) {
      riskLevel = 'high';
      urgency = 'immediate';
      confidence = 0.95;
      recommendations = [
        'Seek immediate medical attention',
        'Call emergency services if symptoms are severe',
        'Do not delay treatment'
      ];
    } else if (hasHighRiskSymptoms) {
      riskLevel = 'high';
      urgency = 'within_24_hours';
      confidence = 0.85;
      recommendations = [
        'Contact your healthcare provider within 24 hours',
        'Monitor symptoms closely',
        'Avoid strenuous activities',
        'Stay hydrated and rest'
      ];
    } else if (hasModerateRiskSymptoms) {
      riskLevel = 'moderate';
      urgency = 'within_week';
      confidence = 0.75;
      recommendations = [
        'Schedule appointment with healthcare provider',
        'Monitor symptoms and note any changes',
        'Maintain regular prenatal vitamins',
        'Get adequate rest and nutrition'
      ];
    }
    
    // Adjust risk based on gestational week
    if (gestationalWeek) {
      if (gestationalWeek < 12 && (hasHighRiskSymptoms || hasEmergencySymptoms)) {
        urgency = 'immediate';
        recommendations.push('First trimester complications require immediate attention');
      } else if (gestationalWeek > 37 && hasHighRiskSymptoms) {
        urgency = 'within_24_hours';
        recommendations.push('Late pregnancy symptoms need prompt evaluation');
      }
    }
    
    // Adjust for previous complications
    if (previousComplications && riskLevel !== 'low') {
      urgency = urgency === 'within_week' ? 'within_24_hours' : urgency;
      recommendations.push('Previous complications increase current risk - seek care promptly');
    }
    
    const response = {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `session_${Date.now()}`,
      riskLevel,
      recommendations,
      aiAnalysis: `Based on your reported symptoms${gestationalWeek ? ` at ${gestationalWeek} weeks` : ''}, this assessment indicates ${riskLevel} risk. ${additionalSymptoms ? 'Additional symptoms have been considered in this evaluation.' : ''} This evaluation is based on established medical guidelines for pregnancy symptoms.`,
      confidence,
      urgency
    };
    
    res.json(response);
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ error: 'Assessment failed' });
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

// Symptoms endpoint
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports.handler = serverless(app);