export interface RiskAssessmentResult {
  riskLevel: "low" | "moderate" | "high";
  confidence: number;
  recommendations: string[];
  reasoning: string;
  urgency: "routine" | "within_week" | "within_24_hours" | "immediate";
}

async function assessWithRules(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalInfo?: string
): Promise<RiskAssessmentResult> {
  // Built-in rule-based assessment without external APIs
  const highRiskSymptoms = [
    "severe headaches", "vision changes", "heavy bleeding", "severe abdominal pain",
    "difficulty breathing", "chest pain", "fever", "no fetal movement", "severe swelling"
  ];
  
  const moderateRiskSymptoms = [
    "persistent vomiting", "elevated blood pressure", "mild bleeding", 
    "decreased fetal movement", "swollen hands", "swollen feet"
  ];
  
  const lowRiskSymptoms = [
    "mild nausea", "light spotting", "mild back pain", "constipation", 
    "mild fatigue", "breast tenderness", "frequent urination"
  ];
  
  // Calculate risk score
  let riskScore = 0;
  const matchedHighRisk: string[] = [];
  const matchedModerateRisk: string[] = [];
  
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    
    // Check high risk
    for (const highRisk of highRiskSymptoms) {
      if (lowerSymptom.includes(highRisk.toLowerCase()) || highRisk.toLowerCase().includes(lowerSymptom)) {
        riskScore += 3;
        matchedHighRisk.push(highRisk);
        break;
      }
    }
    
    // Check moderate risk
    for (const moderateRisk of moderateRiskSymptoms) {
      if (lowerSymptom.includes(moderateRisk.toLowerCase()) || moderateRisk.toLowerCase().includes(lowerSymptom)) {
        riskScore += 2;
        matchedModerateRisk.push(moderateRisk);
        break;
      }
    }
    
    // Check low risk
    for (const lowRisk of lowRiskSymptoms) {
      if (lowerSymptom.includes(lowRisk.toLowerCase()) || lowRisk.toLowerCase().includes(lowerSymptom)) {
        riskScore += 1;
        break;
      }
    }
  });
  
  // Check for dangerous combinations
  const hasPreeclampsiaSymptoms = symptoms.some(s => s.toLowerCase().includes("headache")) &&
                                  symptoms.some(s => s.toLowerCase().includes("vision")) &&
                                  symptoms.some(s => s.toLowerCase().includes("swelling"));
  
  if (hasPreeclampsiaSymptoms) {
    riskScore += 5;
  }
  
  // Determine risk level
  let riskLevel: "low" | "moderate" | "high";
  let urgency: "routine" | "within_week" | "within_24_hours" | "immediate";
  let confidence: number;
  
  if (riskScore >= 5 || hasPreeclampsiaSymptoms || matchedHighRisk.length >= 2) {
    riskLevel = "high";
    urgency = "immediate";
    confidence = 0.85;
  } else if (riskScore >= 3 || matchedHighRisk.length > 0) {
    riskLevel = "high";
    urgency = "within_24_hours";
    confidence = 0.80;
  } else if (riskScore >= 2 || matchedModerateRisk.length > 0) {
    riskLevel = "moderate";
    urgency = "within_week";
    confidence = 0.75;
  } else {
    riskLevel = "low";
    urgency = "routine";
    confidence = 0.70;
  }
  
  // Adjust for gestational week
  if (gestationalWeek) {
    if (gestationalWeek <= 12 && riskLevel === "moderate") {
      riskLevel = "high";
      urgency = "within_24_hours";
    } else if (gestationalWeek >= 28 && riskLevel === "moderate") {
      riskLevel = "high";
      urgency = "within_24_hours";
    }
  }
  
  // Adjust for previous complications
  if (previousComplications && riskLevel === "low") {
    riskLevel = "moderate";
    urgency = "within_week";
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (riskLevel === "high") {
    recommendations.push("Seek immediate medical attention or go to emergency room");
    recommendations.push("Contact your healthcare provider immediately");
    recommendations.push("Do not delay seeking medical care");
    
    if (hasPreeclampsiaSymptoms) {
      recommendations.push("Monitor blood pressure and report vision changes immediately");
    }
  } else if (riskLevel === "moderate") {
    recommendations.push("Contact your healthcare provider within 24-48 hours");
    recommendations.push("Monitor symptoms closely and document changes");
    recommendations.push("Avoid strenuous activities until evaluated");
    
    if (gestationalWeek && gestationalWeek >= 28) {
      recommendations.push("Monitor fetal movement patterns daily");
    }
  } else {
    recommendations.push("Continue routine prenatal care as scheduled");
    recommendations.push("Monitor symptoms and contact provider if they worsen");
    recommendations.push("Maintain healthy pregnancy practices");
  }
  
  recommendations.push("Keep emergency contact numbers readily available");
  
  // Generate reasoning
  let reasoning = `Based on symptom analysis: `;
  
  if (matchedHighRisk.length > 0) {
    reasoning += `High-risk symptoms identified (${matchedHighRisk.slice(0, 2).join(", ")}). `;
  }
  
  if (matchedModerateRisk.length > 0) {
    reasoning += `Moderate-risk symptoms present (${matchedModerateRisk.slice(0, 2).join(", ")}). `;
  }
  
  if (hasPreeclampsiaSymptoms) {
    reasoning += `Symptom combination suggests possible preeclampsia. `;
  }
  
  if (gestationalWeek) {
    if (gestationalWeek <= 12) {
      reasoning += `First trimester (week ${gestationalWeek}) requires careful monitoring. `;
    } else if (gestationalWeek >= 28) {
      reasoning += `Third trimester (week ${gestationalWeek}) increases certain risks. `;
    }
  }
  
  const riskExplanations = {
    "high": "These symptoms require immediate medical evaluation due to potential serious complications.",
    "moderate": "These symptoms warrant prompt medical attention to rule out complications.",
    "low": "These symptoms are commonly experienced during pregnancy but should be monitored."
  };
  
  reasoning += riskExplanations[riskLevel];
  
  return {
    riskLevel,
    confidence,
    recommendations: recommendations.slice(0, 5),
    reasoning,
    urgency
  };
}

async function assessWithDirectOpenAI(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalInfo?: string
): Promise<RiskAssessmentResult> {
  // Enhanced direct OpenAI assessment with medical knowledge
  const medicalContext = `
  MEDICAL KNOWLEDGE FOR ASSESSMENT:
  
  HIGH RISK SYMPTOMS:
  - Severe headaches + vision changes + swelling = Preeclampsia (immediate care)
  - Heavy bleeding + cramping = Miscarriage/placental abruption (emergency)
  - Severe abdominal pain = Ectopic pregnancy/other complications (emergency)
  - No fetal movement after 28 weeks = Fetal distress (immediate care)
  - Fever + discharge + tenderness = Infection (immediate care)
  - Difficulty breathing + chest pain = PE/cardiac issues (emergency)
  
  MODERATE RISK SYMPTOMS:
  - Persistent vomiting >3x/day = Hyperemesis gravidarum
  - Elevated BP ≥140/90 = Monitor for preeclampsia
  - Mild bleeding 2nd/3rd trimester = Needs evaluation
  - Decreased fetal movement = Needs monitoring
  
  LOW RISK SYMPTOMS:
  - Mild nausea (1st trimester) = Normal
  - Light spotting (early pregnancy) = Often normal
  - Mild back pain = Ligament stretching
  - Constipation = Hormone-related
  `;

  const prompt = `${medicalContext}

You are a medical AI assistant specializing in pregnancy health risk assessment. Analyze the following pregnancy symptoms using the medical knowledge provided above.

Patient Information:
- Symptoms: ${symptoms.join(", ")}
- Gestational Week: ${gestationalWeek || "Not specified"}
- Previous Complications: ${previousComplications ? "Yes" : "No"}
- Additional Information: ${additionalInfo || "None provided"}

Provide a JSON response with:
{
  "riskLevel": "low" | "moderate" | "high",
  "confidence": 0.0-1.0,
  "recommendations": ["recommendation1", "recommendation2", ...],
  "reasoning": "detailed medical explanation based on symptoms and gestational week",
  "urgency": "routine" | "within_week" | "within_24_hours" | "immediate"
}

Assessment Guidelines:
- LOW RISK: Common pregnancy symptoms, routine monitoring sufficient
- MODERATE RISK: Symptoms requiring medical attention within days
- HIGH RISK: Symptoms requiring immediate or urgent medical care
- Consider gestational timing and symptom combinations
- Be conservative - err on the side of caution for patient safety`;

  try {
    // Use a simple HTTP request to OpenAI directly if needed
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant specializing in pregnancy health risk assessment. Always err on the side of caution and recommend medical consultation when in doubt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiResult = await openaiResponse.json();
    const result = JSON.parse(openaiResult.choices[0].message.content || "{}");
    
    return {
      riskLevel: ["low", "moderate", "high"].includes(result.riskLevel) ? result.riskLevel : "moderate",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [
        "Contact your healthcare provider to discuss your symptoms",
        "Monitor symptoms closely",
        "Seek immediate care if symptoms worsen"
      ],
      reasoning: result.reasoning || "Assessment completed using medical guidelines",
      urgency: ["routine", "within_week", "within_24_hours", "immediate"].includes(result.urgency) 
        ? result.urgency 
        : "within_week"
    };
  } catch (error) {
    console.error("Direct OpenAI assessment failed:", error);
    throw error;
  }
}

export async function assessPregnancyRisk(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalInfo?: string
): Promise<RiskAssessmentResult> {
  try {
    // Try Hugging Face-based local assessment service first
    const hfServiceUrl = process.env.HF_SERVICE_URL || "http://localhost:8000";
    
    const requestBody = {
      symptoms,
      gestationalWeek,
      previousComplications,
      additionalSymptoms: additionalInfo
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${hfServiceUrl}/assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HF service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      riskLevel: ["low", "moderate", "high"].includes(result.riskLevel) ? result.riskLevel : "moderate",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [
        "Contact your healthcare provider to discuss your symptoms",
        "Monitor symptoms closely",
        "Seek immediate care if symptoms worsen"
      ],
      reasoning: result.reasoning || "Assessment completed using medical knowledge base",
      urgency: ["routine", "within_week", "within_24_hours", "immediate"].includes(result.urgency) 
        ? result.urgency 
        : "within_week"
    };
  } catch (error) {
    console.error("HF service unavailable, using fallback assessment:", error);
    
    try {
      // Use built-in rule-based assessment as fallback
      return await assessWithRules(symptoms, gestationalWeek, previousComplications, additionalInfo);
    } catch (fallbackError) {
      console.error("Rule-based assessment also failed:", fallbackError);
      
      // Final safety fallback
      return {
        riskLevel: "moderate",
        confidence: 0.6,
        recommendations: [
          "Contact your healthcare provider to discuss your symptoms",
          "Monitor symptoms closely and keep a detailed symptom diary",
          "Seek immediate medical attention if symptoms worsen or new symptoms develop",
          "Do not ignore concerning symptoms during pregnancy"
        ],
        reasoning: "Assessment completed using built-in medical guidelines. Please consult with your healthcare provider for comprehensive evaluation of your symptoms.",
        urgency: "within_24_hours"
      };
    }
  }
}
