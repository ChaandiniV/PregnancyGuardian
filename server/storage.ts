import { assessments, symptoms, type Assessment, type InsertAssessment, type Symptom, type InsertSymptom } from "@shared/schema";

export interface IStorage {
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined>;
  
  // Symptom methods
  getAllSymptoms(): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptomsByCategory(category: string): Promise<Symptom[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<number, Assessment>;
  private symptoms: Map<number, Symptom>;
  private currentAssessmentId: number;
  private currentSymptomId: number;

  constructor() {
    this.assessments = new Map();
    this.symptoms = new Map();
    this.currentAssessmentId = 1;
    this.currentSymptomId = 1;
    
    // Initialize with common pregnancy symptoms
    this.initializeSymptoms();
  }

  private async initializeSymptoms() {
    const commonSymptoms: InsertSymptom[] = [
      {
        name: "Severe headaches",
        description: "Persistent or worsening headaches",
        category: "neurological",
        severityWeight: 3
      },
      {
        name: "Vision changes", 
        description: "Blurred vision, spots, or flashes",
        category: "neurological",
        severityWeight: 4
      },
      {
        name: "Swelling in hands/face",
        description: "Sudden or severe swelling",
        category: "circulatory",
        severityWeight: 3
      },
      {
        name: "Abdominal pain",
        description: "Upper abdominal or stomach pain", 
        category: "gastrointestinal",
        severityWeight: 4
      },
      {
        name: "Decreased fetal movement",
        description: "Noticeable reduction in baby's movements",
        category: "fetal",
        severityWeight: 5
      },
      {
        name: "Nausea and vomiting",
        description: "Persistent nausea or vomiting",
        category: "gastrointestinal", 
        severityWeight: 2
      },
      {
        name: "Vaginal bleeding",
        description: "Any amount of vaginal bleeding",
        category: "reproductive",
        severityWeight: 5
      },
      {
        name: "Severe back pain",
        description: "Intense lower back pain",
        category: "musculoskeletal",
        severityWeight: 2
      },
      {
        name: "Difficulty breathing",
        description: "Shortness of breath or breathing difficulties",
        category: "respiratory",
        severityWeight: 4
      },
      {
        name: "Chest pain",
        description: "Pain or pressure in chest",
        category: "cardiovascular",
        severityWeight: 5
      }
    ];

    for (const symptom of commonSymptoms) {
      await this.createSymptom(symptom);
    }
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      createdAt: new Date(),
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined> {
    return Array.from(this.assessments.values()).find(
      (assessment) => assessment.sessionId === sessionId
    );
  }

  async getAllSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = this.currentSymptomId++;
    const symptom: Symptom = {
      ...insertSymptom,
      id,
    };
    this.symptoms.set(id, symptom);
    return symptom;
  }

  async getSymptomsByCategory(category: string): Promise<Symptom[]> {
    return Array.from(this.symptoms.values()).filter(
      (symptom) => symptom.category === category
    );
  }
}

export const storage = new MemStorage();
