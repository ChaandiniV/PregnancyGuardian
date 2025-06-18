import { Button } from "@/components/ui/button";
import { Heart, Phone } from "lucide-react";

export default function Header() {
  const handleEmergencyCall = () => {
    // In a real implementation, this would trigger emergency contact
    window.open("tel:911", "_self");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center">
              <Heart className="text-white text-lg" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">GraviLog</h1>
              <p className="text-xs text-slate-500">AI Pregnancy Health Assessment</p>
            </div>
          </div>
          <Button 
            onClick={handleEmergencyCall}
            className="bg-alert-red text-white hover:bg-red-700 transition-colors"
          >
            <Phone className="mr-2 h-4 w-4" />
            Emergency
          </Button>
        </div>
      </div>
    </header>
  );
}
