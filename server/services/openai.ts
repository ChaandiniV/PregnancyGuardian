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
    // Call the RAG service for enhanced assessment
    const ragServiceUrl = process.env.RAG_SERVICE_URL || "http://localhost:8000";
    
    const requestBody = {
      symptoms,
      gestationalWeek,
      previousComplications,
      additionalSymptoms: additionalInfo
    };

    const response = await fetch(`${ragServiceUrl}/assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`RAG service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Validate and sanitize the response
    return {
      riskLevel: ["low", "moderate", "high"].includes(result.riskLevel) ? result.riskLevel : "moderate",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
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
      reasoning: "Unable to complete RAG-enhanced assessment. Please consult with your healthcare provider for proper evaluation.",
      urgency: "within_24_hours"
    };
  }
}
