import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface RiskAssessmentResult {
  riskLevel: "low" | "moderate" | "high";
  confidence: number;
  recommendations: string[];
  reasoning: string;
  urgency: "routine" | "within_week" | "within_24_hours" | "immediate";
}

export async function assessPregnancyRisk(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalInfo?: string
): Promise<RiskAssessmentResult> {
  try {
    const prompt = `You are a medical AI assistant specializing in pregnancy health risk assessment. Analyze the following pregnancy symptoms and provide a comprehensive risk assessment.

Patient Information:
- Symptoms: ${symptoms.join(", ")}
- Gestational Week: ${gestationalWeek || "Not specified"}
- Previous Complications: ${previousComplications ? "Yes" : "No"}
- Additional Information: ${additionalInfo || "None provided"}

Please provide a JSON response with the following structure:
{
  "riskLevel": "low" | "moderate" | "high",
  "confidence": 0.0-1.0,
  "recommendations": ["recommendation1", "recommendation2", ...],
  "reasoning": "detailed explanation of the assessment",
  "urgency": "routine" | "within_week" | "within_24_hours" | "immediate"
}

Assessment Guidelines:
- LOW RISK: Common pregnancy symptoms, routine monitoring sufficient
- MODERATE RISK: Symptoms that warrant medical attention within days
- HIGH RISK: Symptoms requiring immediate or urgent medical care
- Consider gestational week and symptom combinations
- Provide specific, actionable recommendations
- Be conservative in risk assessment to ensure patient safety`;

    const response = await openai.chat.completions.create({
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
      temperature: 0.3, // Lower temperature for more consistent medical assessments
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and sanitize the response
    return {
      riskLevel: ["low", "moderate", "high"].includes(result.riskLevel) ? result.riskLevel : "moderate",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [
        "Contact your healthcare provider to discuss your symptoms",
        "Monitor symptoms closely",
        "Seek immediate care if symptoms worsen"
      ],
      reasoning: result.reasoning || "Unable to generate detailed reasoning",
      urgency: ["routine", "within_week", "within_24_hours", "immediate"].includes(result.urgency) 
        ? result.urgency 
        : "within_week"
    };
  } catch (error) {
    console.error("Failed to assess pregnancy risk:", error);
    
    // Fallback response for safety
    return {
      riskLevel: "moderate",
      confidence: 0.5,
      recommendations: [
        "Contact your healthcare provider to discuss your symptoms",
        "Monitor symptoms closely and keep a symptom diary",
        "Seek immediate medical attention if symptoms worsen or new symptoms develop"
      ],
      reasoning: "Unable to complete AI assessment. Please consult with your healthcare provider for proper evaluation.",
      urgency: "within_24_hours"
    };
  }
}
