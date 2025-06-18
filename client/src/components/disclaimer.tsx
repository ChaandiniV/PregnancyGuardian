import { Info } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="bg-slate-100 rounded-2xl p-6 mt-8">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Info className="text-white text-sm" />
        </div>
        <div className="text-sm text-slate-600">
          <h6 className="font-semibold text-slate-800 mb-2">Medical Disclaimer</h6>
          <p className="mb-2">
            GraviLog is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any 
            questions you may have regarding a medical condition.
          </p>
          <p className="text-xs text-slate-500">
            This assessment tool is designed to provide general guidance only and should not be 
            used for emergency situations.
          </p>
        </div>
      </div>
    </div>
  );
}
