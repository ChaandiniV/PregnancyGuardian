import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  symptoms: jsonb("symptoms").notNull().$type<string[]>(),
  additionalInfo: jsonb("additional_info").$type<Record<string, any> | null>(),
  riskLevel: text("risk_level").notNull(), // 'low', 'moderate', 'high'
  recommendations: jsonb("recommendations").notNull().$type<string[]>(),
  aiAnalysis: text("ai_analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  severityWeight: integer("severity_weight").notNull().default(1),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
}).extend({
  symptoms: z.array(z.string()),
  recommendations: z.array(z.string()),
  additionalInfo: z.record(z.any()).optional().nullable(),
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

// Frontend-only types for the assessment flow
export const assessmentRequestSchema = z.object({
  symptoms: z.array(z.string()),
  gestationalWeek: z.number().min(1).max(42).optional(),
  previousComplications: z.boolean().optional(),
  additionalSymptoms: z.string().optional(),
});

export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export const riskLevels = {
  low: "low",
  moderate: "moderate", 
  high: "high"
} as const;

export type RiskLevel = keyof typeof riskLevels;
