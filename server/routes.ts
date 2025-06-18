import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessmentRequestSchema } from "@shared/schema";
import { assessPregnancyRisk } from "./services/openai";
import { nanoid } from "nanoid";

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
      
      // Get AI risk assessment
      const riskAssessment = await assessPregnancyRisk(
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
