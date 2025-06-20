// Direct assessment endpoint for Netlify Functions
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { symptoms, gestationalWeek, previousComplications, additionalSymptoms } = body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Symptoms array is required' })
      };
    }

    // Perform RAG assessment
    const assessment = analyzeWithKnowledgeBase(symptoms, gestationalWeek);
    
    // Adjust for previous complications
    if (previousComplications && assessment.riskLevel !== 'low') {
      assessment.urgency = assessment.urgency === 'routine' ? 'within_24_hours' : 
                          assessment.urgency === 'within_24_hours' ? 'immediate' : assessment.urgency;
      assessment.recommendations.push('Previous complications increase current risk - seek prompt medical evaluation');
      assessment.reasoning += ' Previous pregnancy complications noted in assessment.';
    }
    
    if (additionalSymptoms) {
      assessment.reasoning += ` Additional reported symptoms: ${additionalSymptoms}.`;
    }

    // Create response
    const response = {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `session_${Date.now()}`,
      riskLevel: assessment.riskLevel,
      recommendations: assessment.recommendations,
      aiAnalysis: assessment.reasoning,
      confidence: assessment.confidence,
      urgency: assessment.urgency
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Assessment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Assessment failed',
        message: error.message 
      })
    };
  }
};

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
  
  // High-risk combinations from WHO pregnancy guidelines
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