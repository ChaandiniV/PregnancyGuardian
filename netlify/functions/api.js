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
app.post('/api/assess', async (req, res) => {
  try {
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = req.body;
    
    // Simple rule-based assessment for deployment
    const highRiskSymptoms = ['severe bleeding', 'severe pain', 'fainting', 'chest pain'];
    const moderateRiskSymptoms = ['bleeding', 'cramping', 'nausea', 'headache'];
    
    let riskLevel = 'low';
    let urgency = 'routine';
    let recommendations = ['Schedule regular prenatal checkups', 'Maintain a healthy diet'];
    
    if (symptoms.some(s => highRiskSymptoms.some(hrs => s.toLowerCase().includes(hrs)))) {
      riskLevel = 'high';
      urgency = 'immediate';
      recommendations = ['Seek immediate medical attention', 'Contact emergency services if severe'];
    } else if (symptoms.some(s => moderateRiskSymptoms.some(mrs => s.toLowerCase().includes(mrs)))) {
      riskLevel = 'moderate';
      urgency = 'within_week';
      recommendations = ['Schedule appointment with healthcare provider', 'Monitor symptoms closely'];
    }
    
    const response = {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `session_${Date.now()}`,
      riskLevel,
      recommendations,
      aiAnalysis: `Assessment based on reported symptoms. Risk level: ${riskLevel}`,
      confidence: 0.85,
      urgency
    };
    
    res.json(response);
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ error: 'Assessment failed' });
  }
});

// Symptoms endpoint
app.get('/api/symptoms', (req, res) => {
  const symptoms = [
    { id: 1, name: 'Nausea', category: 'digestive', description: 'Feeling of sickness' },
    { id: 2, name: 'Headache', category: 'neurological', description: 'Head pain' },
    { id: 3, name: 'Fatigue', category: 'general', description: 'Extreme tiredness' },
    { id: 4, name: 'Bleeding', category: 'reproductive', description: 'Vaginal bleeding' },
    { id: 5, name: 'Cramping', category: 'reproductive', description: 'Abdominal cramping' }
  ];
  res.json(symptoms);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports.handler = serverless(app);