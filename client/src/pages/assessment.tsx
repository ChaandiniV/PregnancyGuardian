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

  // Fetch available symptoms
  const { data: symptoms = [], isLoading: symptomsLoading } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

  // Submit assessment mutation
  const assessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json() as Promise<AssessmentResponse>;
    },
    onSuccess: (data) => {
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
                          {symptoms.map((symptom) => (
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
