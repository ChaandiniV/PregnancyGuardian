export interface AssessmentResponse {
  assessmentId: number;
  sessionId: string;
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
  aiAnalysis: string;
  confidence: number;
  urgency: "routine" | "within_week" | "within_24_hours" | "immediate";
}

export interface Symptom {
  id: number;
  name: string;
  description: string;
  category: string;
  severityWeight: number;
}

export interface AssessmentFormData {
  symptoms: string[];
  gestationalWeek?: number;
  previousComplications?: boolean;
  additionalSymptoms?: string;
}
