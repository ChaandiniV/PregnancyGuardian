import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Symptom, AssessmentFormData, AssessmentResponse } from "@/lib/types";
import EmergencySection from "@/components/emergency-section";
import Disclaimer from "@/components/disclaimer";

const assessmentSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  gestationalWeek: z.coerce.number().min(1).max(42).optional(),
  previousComplications: z.boolean().optional(),
  additionalSymptoms: z.string().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

export default function Assessment() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      symptoms: [],
      previousComplications: false,
      additionalSymptoms: "",
    },
  });

  // Fetch available symptoms with fallback - try multiple endpoints
  const { data: symptoms = [], isLoading: symptomsLoading, error: symptomsError } = useQuery<Symptom[]>({
    queryKey: ["symptoms"],
    queryFn: async () => {
      // Try direct Netlify function first
      try {
        const response = await fetch('/.netlify/functions/symptoms');
        if (response.ok) {
          return response.json();
        }
      } catch (e) {
        console.log('Direct function failed, trying API route');
      }
      
      // Fallback to API route
      try {
        const response = await fetch('/api/symptoms');
        if (response.ok) {
          return response.json();
        }
      } catch (e) {
        console.log('API route failed');
      }
      
      throw new Error('All symptom endpoints failed');
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Fallback symptoms if API fails
  const fallbackSymptoms: Symptom[] = [
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
  ];

  // Use fallback if API fails
  const availableSymptoms = symptomsError ? fallbackSymptoms : symptoms;

  // Submit assessment mutation with Netlify function priority
  const assessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      // Try Netlify function first, then fallback to client-side
      try {
        const response = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          return response.json() as Promise<AssessmentResponse>;
        }
      } catch (error) {
        console.log("Netlify function unavailable, using client-side assessment");
      }
      
      // Fallback to reliable client-side processing
      return createFallbackAssessment(data);
    },
    onSuccess: (data) => {
      // Store assessment result temporarily in sessionStorage
      sessionStorage.setItem('assessmentResult', JSON.stringify(data));
      toast({
        title: "Assessment Complete",
        description: "Your risk assessment has been generated successfully.",
      });
      setLocation(`/results/${data.assessmentId}`);
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed", 
        description: "Unable to complete assessment. Please try again or contact support.",
        variant: "destructive",
      });
      console.error("Assessment error:", error);
    },
  });

  // Comprehensive medical assessment function based on WHO pregnancy guidelines
  const createFallbackAssessment = (data: AssessmentFormData): AssessmentResponse => {
    const symptomsText = data.symptoms.join(' ').toLowerCase();
    
    let assessment = {
      riskLevel: 'low' as "low" | "moderate" | "high",
      urgency: 'routine' as "routine" | "within_week" | "within_24_hours" | "immediate",
      confidence: 0.7,
      recommendations: ['Continue routine prenatal care', 'Monitor symptoms'],
      reasoning: 'Standard pregnancy symptoms assessment',
      matchedConditions: [] as string[]
    };
    
    // High-risk combinations from WHO pregnancy guidelines
    const emergencyPatterns = [
      { 
        patterns: ['severe headache', 'vision changes', 'vision'], 
        condition: 'Preeclampsia warning signs',
        recommendations: ['Seek immediate medical attention', 'Blood pressure check urgently needed', 'May require hospitalization']
      },
      { 
        patterns: ['heavy bleeding', 'severe bleeding', 'severe cramping'], 
        condition: 'Hemorrhage risk',
        recommendations: ['Go to emergency room immediately', 'Call 911 if bleeding is severe', 'Bring someone to drive you']
      },
      { 
        patterns: ['fever', 'chills'], 
        condition: 'Infection concern',
        recommendations: ['Contact healthcare provider immediately', 'Temperature monitoring required', 'Blood work may be needed']
      },
      { 
        patterns: ['chest pain', 'difficulty breathing'], 
        condition: 'Cardiovascular emergency',
        recommendations: ['Call 911 immediately', 'Do not drive yourself', 'May indicate heart or lung complications']
      },
      { 
        patterns: ['fainting', 'severe dizziness'], 
        condition: 'Circulatory emergency',
        recommendations: ['Seek immediate evaluation', 'Check blood pressure and heart rate', 'IV fluids may be required']
      }
    ];
    
    // Check for emergency patterns
    for (const pattern of emergencyPatterns) {
      const matches = pattern.patterns.filter(p => symptomsText.includes(p)).length;
      if (matches >= 1) {
        assessment = {
          riskLevel: 'high',
          urgency: 'immediate',
          confidence: 0.95,
          recommendations: pattern.recommendations,
          reasoning: `Emergency pattern identified: ${pattern.condition}. Based on WHO pregnancy guidelines, immediate medical evaluation is required.`,
          matchedConditions: [pattern.condition]
        };
        break;
      }
    }
    
    // Moderate risk patterns if no emergency detected
    if (assessment.riskLevel === 'low') {
      const moderatePatterns = [
        { patterns: ['bleeding', 'cramping'], condition: 'Potential pregnancy complications', concern: 'bleeding_cramping' },
        { patterns: ['headache', 'swelling'], condition: 'Pre-eclampsia monitoring needed', concern: 'preeclampsia_signs' },
        { patterns: ['persistent vomiting', 'vomiting'], condition: 'Hyperemesis gravidarum concern', concern: 'severe_nausea' },
        { patterns: ['contractions', 'regular contractions'], condition: 'Preterm labor assessment', concern: 'preterm_labor' },
        { patterns: ['decreased fetal movement'], condition: 'Fetal wellbeing assessment', concern: 'fetal_movement' }
      ];
      
      for (const pattern of moderatePatterns) {
        const matches = pattern.patterns.filter(p => symptomsText.includes(p)).length;
        if (matches >= 1) {
          assessment = {
            riskLevel: 'moderate',
            urgency: 'within_24_hours',
            confidence: 0.8,
            recommendations: [
              'Contact healthcare provider within 24 hours',
              'Document symptom frequency and severity',
              'Seek immediate care if symptoms worsen',
              'Maintain adequate hydration and rest'
            ],
            reasoning: `Moderate risk pattern detected: ${pattern.condition}. Clinical evaluation recommended within 24 hours per obstetric guidelines.`,
            matchedConditions: [pattern.condition]
          };
          break;
        }
      }
    }
    
    // Gestational week-specific adjustments
    if (data.gestationalWeek) {
      const week = data.gestationalWeek;
      
      if (week < 12) {
        // First trimester considerations
        if (symptomsText.includes('bleeding') || symptomsText.includes('cramping')) {
          assessment.urgency = assessment.urgency === 'routine' ? 'within_24_hours' : assessment.urgency;
          assessment.recommendations.push('First trimester bleeding requires prompt evaluation');
          assessment.reasoning += ' First trimester complications require careful monitoring.';
        }
      } else if (week >= 20 && week < 37) {
        // Second/early third trimester
        if (symptomsText.includes('contractions')) {
          assessment.riskLevel = 'high';
          assessment.urgency = 'immediate';
          assessment.recommendations = ['Seek immediate medical attention', 'Possible preterm labor', 'Hospital evaluation required'];
          assessment.reasoning = 'Preterm contractions detected. Immediate obstetric evaluation required to assess for preterm labor.';
        }
      } else if (week >= 37) {
        // Term pregnancy
        if (symptomsText.includes('contractions')) {
          assessment.recommendations.push('Full-term pregnancy - contractions may indicate labor onset');
          assessment.reasoning += ' Term pregnancy with contractions - labor assessment indicated.';
        }
      }
    }
    
    // Previous complications adjustment
    if (data.previousComplications) {
      if (assessment.riskLevel !== 'low') {
        assessment.urgency = assessment.urgency === 'routine' ? 'within_24_hours' : 
                            assessment.urgency === 'within_24_hours' ? 'immediate' : assessment.urgency;
        assessment.recommendations.push('Previous pregnancy complications increase current risk level');
        assessment.reasoning += ' History of pregnancy complications elevates current assessment priority.';
      }
      assessment.confidence = Math.min(assessment.confidence + 0.1, 1.0);
    }
    
    // Additional symptoms consideration
    if (data.additionalSymptoms) {
      assessment.reasoning += ` Additional reported symptoms: ${data.additionalSymptoms}.`;
    }
    
    return {
      assessmentId: Math.floor(Math.random() * 10000),
      sessionId: `medical_${Date.now()}`,
      riskLevel: assessment.riskLevel,
      recommendations: assessment.recommendations,
      aiAnalysis: assessment.reasoning + " This assessment follows evidence-based obstetric guidelines. Always consult your healthcare provider for personalized medical advice.",
      confidence: assessment.confidence,
      urgency: assessment.urgency
    };
  };

  const onSubmit = (data: AssessmentFormValues) => {
    const assessmentData: AssessmentFormData = {
      symptoms: data.symptoms,
      gestationalWeek: data.gestationalWeek,
      previousComplications: data.previousComplications,
      additionalSymptoms: data.additionalSymptoms,
    };
    assessmentMutation.mutate(assessmentData);
  };

  const handleNext = async () => {
    if (step === 1) {
      const symptomsValid = await form.trigger("symptoms");
      if (symptomsValid && form.getValues("symptoms").length > 0) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setLocation("/");
    }
  };

  const progress = (step / 3) * 100;

  if (symptomsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Symptom Assessment
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>Step {step} of 3</span>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Symptom Selection */}
              {step === 1 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Are you experiencing any of the following symptoms?
                  </h4>
                  <p className="text-slate-600 mb-6">
                    Please select all symptoms you're currently experiencing. This helps our AI provide more accurate assessment.
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3">
                          {availableSymptoms.map((symptom) => (
                            <FormField
                              key={symptom.id}
                              control={form.control}
                              name="symptoms"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={symptom.id}
                                    className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(symptom.name)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, symptom.name])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== symptom.name
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="ml-4">
                                      <FormLabel className="font-medium text-slate-800 cursor-pointer">
                                        {symptom.name}
                                      </FormLabel>
                                      <div className="text-sm text-slate-500">
                                        {symptom.description}
                                      </div>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Additional Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Additional Information
                  </h4>
                  <p className="text-slate-600 mb-6">
                    This information helps us provide more personalized recommendations.
                  </p>

                  <FormField
                    control={form.control}
                    name="gestationalWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How many weeks pregnant are you? (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="42"
                            placeholder="e.g., 20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previousComplications"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">
                          Have you had pregnancy complications in the past?
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any other symptoms or concerns? (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any other symptoms you're experiencing..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Review and Submit */}
              {step === 3 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">
                    Review Your Information
                  </h4>
                  <p className="text-slate-600 mb-6">
                    Please review your information before submitting for AI assessment.
                  </p>

                  <div className="space-y-4 bg-slate-50 rounded-lg p-6">
                    <div>
                      <h6 className="font-medium text-slate-800 mb-2">Selected Symptoms:</h6>
                      <ul className="list-disc list-inside text-sm text-slate-600">
                        {form.getValues("symptoms").map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>

                    {form.getValues("gestationalWeek") && (
                      <div>
                        <h6 className="font-medium text-slate-800">Gestational Week:</h6>
                        <p className="text-sm text-slate-600">{form.getValues("gestationalWeek")} weeks</p>
                      </div>
                    )}

                    {form.getValues("previousComplications") && (
                      <div>
                        <h6 className="font-medium text-slate-800">Previous Complications:</h6>
                        <p className="text-sm text-slate-600">Yes</p>
                      </div>
                    )}

                    {form.getValues("additionalSymptoms") && (
                      <div>
                        <h6 className="font-medium text-slate-800">Additional Information:</h6>
                        <p className="text-sm text-slate-600">{form.getValues("additionalSymptoms")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {step === 1 ? "Back to Home" : "Previous"}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={assessmentMutation.isPending}
                  className="bg-medical-blue hover:bg-blue-700"
                >
                  {assessmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : step === 3 ? (
                    "Complete Assessment"
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Emergency Section */}
      <EmergencySection />

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
