// Direct symptoms endpoint for Netlify Functions
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(symptoms)
    };

  } catch (error) {
    console.error('Symptoms endpoint error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch symptoms',
        message: error.message 
      })
    };
  }
};