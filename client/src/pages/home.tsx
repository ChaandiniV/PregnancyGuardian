import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, UserCheck, Clock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import EmergencySection from "@/components/emergency-section";
import Disclaimer from "@/components/disclaimer";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleStartAssessment = () => {
    setLocation("/assessment");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-calm-green rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserCheck className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to GraviLog</h2>
            <p className="text-lg text-slate-600 mb-6">
              Our AI-powered assessment tool helps you understand pregnancy symptoms and provides 
              personalized health guidance available 24/7.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-blue">24/7</div>
                <div className="text-sm text-slate-500">Available Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-calm-green">AI-Powered</div>
                <div className="text-sm text-slate-500">Risk Assessment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-amber">Instant</div>
                <div className="text-sm text-slate-500">Recommendations</div>
              </div>
            </div>

            <Button 
              onClick={handleStartAssessment}
              className="bg-medical-blue text-white hover:bg-blue-700 transition-colors shadow-lg text-lg px-8 py-4"
              size="lg"
            >
              <ClipboardList className="mr-3 h-5 w-5" />
              Start Health Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-medical-blue h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Comprehensive Assessment</h3>
            </div>
            <p className="text-slate-600">
              Interactive questionnaire covering all major pregnancy symptoms and risk factors 
              with AI-powered analysis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="text-calm-green h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Instant Results</h3>
            </div>
            <p className="text-slate-600">
              Receive immediate risk assessment with personalized recommendations and 
              guidance on next steps.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-warning-amber h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">24/7 Availability</h3>
            </div>
            <p className="text-slate-600">
              Access health guidance anytime, anywhere. No appointment necessary for 
              initial assessment and recommendations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-alert-red h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Evidence-Based</h3>
            </div>
            <p className="text-slate-600">
              All assessments are based on current medical guidelines and evidence-based 
              practices for pregnancy care.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Section */}
      <EmergencySection />

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
