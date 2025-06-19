import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export default function EmergencySection() {
  const handleEmergencyCall = () => {
    window.open("tel:911", "_self");
  };

  const handleProviderCall = () => {
    alert(
      "Contact your healthcare provider. In a real implementation, this would dial your provider's number.",
    );
  };

  return (
    <div className="bg-red-600 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl p-8 text-white shadow-lg">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Phone className="text-xl" />
        </div>
        <div>
          <h4 className="text-xl font-bold">Emergency Situations</h4>
          <p className="text-white/90">
            If you experience severe symptoms, don't wait
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <h6 className="font-semibold mb-2">Call 911 if you have:</h6>
          <ul className="text-sm space-y-1 text-white/90">
            <li>• Severe chest pain</li>
            <li>• Difficulty breathing</li>
            <li>• Heavy bleeding</li>
            <li>• Severe abdominal pain</li>
          </ul>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <h6 className="font-semibold mb-2">Your Healthcare Provider:</h6>
          <p className="text-sm text-white/90 mb-2">
            Dr. Sarah Johnson
            <br />
            (555) 123-4567
          </p>
          <p className="text-xs text-white/75">
            Available 24/7 for emergencies
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleEmergencyCall}
          className="bg-white text-red-700 hover:bg-slate-100 transition-colors font-bold text-lg flex-1"
        >
          <Phone className="mr-3 h-5 w-5" />
          Call Emergency Services
        </Button>
        <Button
          onClick={handleProviderCall}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/5 backdrop-blur-sm transition-colors flex-1 "
        >
          <Phone className="mr-2 h-4 w-4" />
          Call Provider
        </Button>
      </div>
    </div>
  );
}
