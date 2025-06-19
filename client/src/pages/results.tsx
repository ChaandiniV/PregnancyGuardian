import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RotateCcw, UserCheck, TriangleAlert, AlertTriangle, CheckCircle } from "lucide-react";
import type { AssessmentResponse } from "@/lib/types";
import EmergencySection from "@/components/emergency-section";
import Disclaimer from "@/components/disclaimer";
import { useToast } from "@/hooks/use-toast";

interface ResultsProps {
  params: {
    id: string;
  };
}

export default function Results({ params }: ResultsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assessmentId = parseInt(params.id);

  // Try to get assessment from sessionStorage first
  const getStoredAssessment = (): AssessmentResponse | null => {
    try {
      const stored = sessionStorage.getItem('assessmentResult');
      if (stored) {
        const data = JSON.parse(stored);
        // Verify it matches the current assessment ID
        if (data.assessmentId === assessmentId) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error parsing stored assessment:', error);
    }
    return null;
  };

  const storedAssessment = getStoredAssessment();
  
  const { data: assessment, isLoading, error } = useQuery<AssessmentResponse>({
    queryKey: [`/api/assessments/${assessmentId}`],
    enabled: !isNaN(assessmentId) && !storedAssessment,
    initialData: storedAssessment || undefined,
  });

  const handleRetakeAssessment = () => {
    setLocation("/assessment");
  };



  if (isNaN(assessmentId)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Invalid Assessment</h2>
            <p className="text-slate-600 mb-4">The assessment ID is not valid.</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <TriangleAlert className="h-12 w-12 text-alert-red mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Assessment Not Found</h2>
            <p className="text-slate-600 mb-4">
              We couldn't find the assessment you're looking for. It may have been removed or the link is incorrect.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setLocation("/")} variant="outline">
                Return Home
              </Button>
              <Button onClick={handleRetakeAssessment} className="bg-medical-blue hover:bg-blue-700">
                Take New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRiskLevelConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return {
          color: "bg-gradient-to-r from-green-500 to-green-600",
          icon: CheckCircle,
          title: "Low Risk",
          description: "Symptoms are within normal range",
          indicator: "🟢"
        };
      case "moderate":
        return {
          color: "bg-gradient-to-r from-yellow-500 to-orange-500",
          icon: AlertTriangle,
          title: "Moderate Risk",
          description: "Some symptoms require medical attention",
          indicator: "🟡"
        };
      case "high":
        return {
          color: "bg-gradient-to-r from-red-500 to-red-600",
          icon: TriangleAlert,
          title: "High Risk",
          description: "Immediate medical attention recommended",
          indicator: "🔴"
        };
      default:
        return {
          color: "bg-gradient-to-r from-slate-400 to-slate-500",
          icon: AlertTriangle,
          title: "Unknown Risk",
          description: "Unable to determine risk level",
          indicator: "⚪"
        };
    }
  };

  const riskConfig = getRiskLevelConfig(assessment.riskLevel);
  const RiskIcon = riskConfig.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete</h2>
            <p className="text-slate-600">Based on your responses, here's your personalized health assessment</p>
          </div>

          {/* Risk Level Display */}
          <div className="max-w-md mx-auto mb-8">
            <div className={`${riskConfig.color} rounded-2xl p-6 text-white text-center`}>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{riskConfig.indicator}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{riskConfig.title}</h3>
              <p className="text-white/90">{riskConfig.description}</p>
              <div className="mt-4 text-sm text-white/75">
                Confidence: {Math.round(assessment.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-slate-800 mb-3">AI Analysis</h4>
            <p className="text-slate-700 leading-relaxed">{assessment.aiAnalysis}</p>
          </div>

          {/* Urgency Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant={assessment.urgency === "immediate" ? "destructive" : 
                          assessment.urgency === "within_24_hours" ? "default" : "secondary"}>
              Urgency: {assessment.urgency?.replace('_', ' ').toUpperCase() || "WITHIN WEEK"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button onClick={handleRetakeAssessment} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.recommendations.map((recommendation, index) => {
              const getBgColor = (index: number) => {
                const colors = ["bg-blue-50", "bg-green-50", "bg-amber-50", "bg-purple-50"];
                return colors[index % colors.length];
              };

              const getIconColor = (index: number) => {
                const colors = ["text-medical-blue", "text-calm-green", "text-warning-amber", "text-purple-600"];
                return colors[index % colors.length];
              };

              return (
                <div key={index} className={`flex items-start space-x-4 p-4 ${getBgColor(index)} rounded-xl`}>
                  <div className={`w-8 h-8 ${getIconColor(index).replace('text-', 'bg-').replace('medical-blue', '[hsl(207,90%,54%)]').replace('calm-green', '[hsl(157,96%,20%)]').replace('warning-amber', '[hsl(38,92%,50%)]')} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <UserCheck className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-slate-800 leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Section */}
      <EmergencySection />

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
