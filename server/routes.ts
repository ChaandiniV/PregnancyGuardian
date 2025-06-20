import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessmentRequestSchema } from "@shared/schema";
import { spawn } from "child_process";
import { promisify } from "util";
import fetch from "node-fetch";
import { nanoid } from "nanoid";

// HF RAG assessment function
async function assessWithHFRAG(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalSymptoms?: string
) {
  try {
    // Try to connect to HF RAG service first
    const hfRagUrl = process.env.HF_RAG_URL || "http://localhost:8001";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${hfRagUrl}/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms,
        gestationalWeek,
        previousComplications,
        additionalSymptoms
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json() as {
        riskLevel: string;
        confidence: number;
        recommendations: string[];
        reasoning: string;
        urgency: string;
      };
      return {
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        recommendations: result.recommendations,
        reasoning: result.reasoning,
        urgency: result.urgency
      };
    }
  } catch (error) {
    console.log("HF RAG service not available, using fallback assessment");
  }

  // Fallback to rule-based assessment
  return assessWithRules(symptoms, gestationalWeek, previousComplications, additionalSymptoms);
}

// Rule-based fallback assessment
function assessWithRules(
  symptoms: string[],
  gestationalWeek?: number,
  previousComplications?: boolean,
  additionalSymptoms?: string
) {
  let riskScore = 0;
  const recommendations: string[] = [];
  
  // High risk patterns
  const highRiskPatterns = [
    ['heavy', 'bleeding'], ['severe', 'pain'], ['no', 'movement'],
    ['vision', 'changes'], ['severe', 'headache'], ['high', 'fever']
  ];
  
  // Medium risk patterns  
  const mediumRiskPatterns = [
    ['persistent', 'vomiting'], ['light', 'bleeding'], ['headache'],
    ['decreased', 'movement'], ['spotting']
  ];

  const symptomsText = symptoms.join(' ').toLowerCase();
  
  // Check for high risk patterns
  for (const pattern of highRiskPatterns) {
    if (pattern.every(word => symptomsText.includes(word))) {
      riskScore += 3;
    }
  }
  
  // Check for medium risk patterns
  for (const pattern of mediumRiskPatterns) {
    if (pattern.every(word => symptomsText.includes(word))) {
      riskScore += 2;
    }
  }

  // Adjust for gestational week and complications
  if (gestationalWeek && gestationalWeek < 12 && symptomsText.includes('bleeding')) {
    riskScore += 2;
  }
  if (previousComplications) {
    riskScore += 1;
  }

  // Determine risk level
  let riskLevel: string;
  let urgency: string;
  let confidence: number;

  if (riskScore >= 6) {
    riskLevel = "high";
    urgency = "immediate";
    confidence = 0.85;
    recommendations.push("Seek immediate medical attention - go to emergency room");
    recommendations.push("Do not delay medical care");
  } else if (riskScore >= 3) {
    riskLevel = "moderate";
    urgency = "within_24_hours";
    confidence = 0.75;
    recommendations.push("Contact your healthcare provider within 24 hours");
    recommendations.push("Monitor symptoms closely");
  } else {
    riskLevel = "low";
    urgency = "routine";
    confidence = 0.65;
    recommendations.push("Continue routine prenatal care");
    recommendations.push("Monitor symptoms and contact provider if they worsen");
  }

  return {
    riskLevel,
    confidence,
    recommendations,
    reasoning: `Assessment based on symptom analysis. Risk score: ${riskScore}. ${gestationalWeek ? `Gestational week ${gestationalWeek} considered.` : ''} ${previousComplications ? 'Previous complications noted.' : ''}`,
    urgency
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all available symptoms
  app.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms = await storage.getAllSymptoms();
      res.json(symptoms);
    } catch (error) {
      console.error("Failed to fetch symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  // Submit assessment and get AI-powered risk analysis
  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = assessmentRequestSchema.parse(req.body);
      
      // Generate unique session ID
      const sessionId = nanoid();
      
      // Get AI risk assessment using HF RAG service
      const riskAssessment = await assessWithHFRAG(
        validatedData.symptoms,
        validatedData.gestationalWeek,
        validatedData.previousComplications,
        validatedData.additionalSymptoms
      );

      // Store assessment in database
      const assessment = await storage.createAssessment({
        sessionId,
        symptoms: validatedData.symptoms,
        additionalInfo: validatedData.gestationalWeek || validatedData.previousComplications || validatedData.additionalSymptoms ? {
          gestationalWeek: validatedData.gestationalWeek,
          previousComplications: validatedData.previousComplications,
          additionalSymptoms: validatedData.additionalSymptoms,
          confidence: riskAssessment.confidence,
          urgency: riskAssessment.urgency
        } : null,
        riskLevel: riskAssessment.riskLevel,
        recommendations: riskAssessment.recommendations,
        aiAnalysis: riskAssessment.reasoning
      });

      res.json({
        assessmentId: assessment.id,
        sessionId: assessment.sessionId,
        riskLevel: assessment.riskLevel,
        recommendations: assessment.recommendations,
        aiAnalysis: assessment.aiAnalysis,
        confidence: riskAssessment.confidence,
        urgency: riskAssessment.urgency
      });
    } catch (error) {
      console.error("Failed to create assessment:", error);
      res.status(500).json({ 
        message: "Failed to process assessment. Please try again or contact support." 
      });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assessment ID" });
      }

      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      res.json({
        assessmentId: assessment.id,
        sessionId: assessment.sessionId,
        riskLevel: assessment.riskLevel,
        recommendations: assessment.recommendations,
        aiAnalysis: assessment.aiAnalysis,
        symptoms: assessment.symptoms,
        additionalInfo: assessment.additionalInfo,
        createdAt: assessment.createdAt
      });
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
