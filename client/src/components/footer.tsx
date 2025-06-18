import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                <Heart className="text-white text-sm" fill="currentColor" />
              </div>
              <span className="font-semibold text-slate-900">GraviLog</span>
            </div>
            <p className="text-sm text-slate-600">
              AI-powered pregnancy health assessment platform providing 24/7 guidance for expectant mothers.
            </p>
          </div>
          <div>
            <h6 className="font-semibold text-slate-800 mb-3">Resources</h6>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-medical-blue transition-colors">Health Library</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">Pregnancy Guide</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">Emergency Contacts</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold text-slate-800 mb-3">Support</h6>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-medical-blue transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-medical-blue transition-colors">Medical Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-8 pt-6 text-center text-sm text-slate-500">
          <p>&copy; 2025 GraviLog. All rights reserved. This platform is for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
