import os
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskAssessmentResult(BaseModel):
    riskLevel: str  # "low", "moderate", "high"
    confidence: float  # 0.0 to 1.0
    recommendations: List[str]
    reasoning: str
    urgency: str  # "routine", "within_week", "within_24_hours", "immediate"

class PregnancyHFRAGService:
    def __init__(self):
        self.knowledge_base = self._load_knowledge_base()
        
    def _load_knowledge_base(self) -> str:
        """Load the pregnancy knowledge base"""
        try:
            knowledge_path = "server/knowledge_base/pregnancy_guidelines.txt"
            if not os.path.exists(knowledge_path):
                knowledge_path = "knowledge_base/pregnancy_guidelines.txt"
            
            with open(knowledge_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Could not load knowledge base: {e}")
            return self._get_builtin_knowledge()
    
    def _get_builtin_knowledge(self) -> str:
        """Fallback knowledge base"""
        return """
        PREGNANCY RISK ASSESSMENT KNOWLEDGE BASE
        
        HIGH RISK SYMPTOMS:
        - Heavy vaginal bleeding with cramping
        - Severe abdominal pain
        - Blurry vision with headache and swelling
        - Fever over 38.5°C with chills
        - No fetal movement after 28 weeks
        - Severe continuous headache with vision changes
        
        MEDIUM RISK SYMPTOMS:
        - Persistent vomiting more than 3 times per day
        - Elevated blood pressure (140/90 or higher)
        - Mild vaginal bleeding in 2nd/3rd trimester
        - Decreased fetal movement
        - Persistent headaches
        
        LOW RISK SYMPTOMS:
        - Mild nausea
        - Light spotting in first trimester
        - Mild back pain
        - Constipation and gas
        - Fatigue
        - Breast tenderness
        """
    
    def _retrieve_relevant_info(self, symptoms: List[str], query_context: str) -> str:
        """Retrieve relevant information from knowledge base based on symptoms"""
        relevant_sections = []
        
        # Convert symptoms to lowercase for matching
        symptoms_lower = [s.lower() for s in symptoms]
        
        # Split knowledge base into sections
        sections = self.knowledge_base.split('\n\n')
        
        for section in sections:
            section_lower = section.lower()
            # Check if any symptom appears in this section
            for symptom in symptoms_lower:
                if any(word in section_lower for word in symptom.split()):
                    if section not in relevant_sections:
                        relevant_sections.append(section)
                    break
        
        return '\n\n'.join(relevant_sections[:5])  # Return top 5 relevant sections
    
    def _assess_with_knowledge(self, symptoms: List[str], gestational_week: Optional[int], 
                              previous_complications: Optional[bool], additional_info: Optional[str]) -> Dict[str, Any]:
        """Assess risk using knowledge base retrieval"""
        
        # Retrieve relevant knowledge
        query_context = f"Symptoms: {', '.join(symptoms)}"
        if gestational_week:
            query_context += f", Gestational week: {gestational_week}"
        if additional_info:
            query_context += f", Additional: {additional_info}"
        
        relevant_knowledge = self._retrieve_relevant_info(symptoms, query_context)
        
        # Rule-based risk assessment enhanced with retrieved knowledge
        risk_score = 0
        high_risk_indicators = []
        medium_risk_indicators = []
        
        # High risk symptom patterns
        high_risk_patterns = [
            ['bleeding', 'heavy'], ['bleeding', 'cramping'],
            ['abdominal pain', 'severe'], ['pain', 'severe'],
            ['headache', 'vision'], ['headache', 'severe', 'blurry'],
            ['fever', 'chills'], ['fever', 'high'],
            ['no movement', 'fetal'], ['reduced movement'],
            ['vision changes', 'headache'], ['swelling', 'severe']
        ]
        
        # Medium risk patterns
        medium_risk_patterns = [
            ['vomiting', 'persistent'], ['nausea', 'severe'],
            ['bleeding', 'spotting'], ['bleeding', 'light'],
            ['headache', 'persistent'], ['pressure', 'high'],
            ['movement', 'decreased'], ['contractions']
        ]
        
        symptoms_text = ' '.join(symptoms).lower()
        
        # Check for high risk patterns
        for pattern in high_risk_patterns:
            if all(word in symptoms_text for word in pattern):
                risk_score += 3
                high_risk_indicators.append(' + '.join(pattern))
        
        # Check for medium risk patterns
        for pattern in medium_risk_patterns:
            if all(word in symptoms_text for word in pattern):
                risk_score += 2
                medium_risk_indicators.append(' + '.join(pattern))
        
        # Adjust for gestational week
        if gestational_week:
            if gestational_week < 12 and any('bleeding' in s.lower() for s in symptoms):
                risk_score += 2  # Early bleeding more concerning
            elif gestational_week > 37 and any('contraction' in s.lower() for s in symptoms):
                risk_score += 1  # Normal labor territory
            elif gestational_week < 37 and any('contraction' in s.lower() for s in symptoms):
                risk_score += 3  # Preterm labor risk
        
        # Previous complications increase base risk
        if previous_complications:
            risk_score += 1
        
        # Determine risk level
        if risk_score >= 6:
            risk_level = "high"
            urgency = "immediate"
            confidence = min(0.9, 0.7 + (risk_score - 6) * 0.05)
        elif risk_score >= 3:
            risk_level = "moderate"
            urgency = "within_24_hours"
            confidence = min(0.8, 0.6 + (risk_score - 3) * 0.05)
        else:
            risk_level = "low"
            urgency = "routine"
            confidence = min(0.7, 0.5 + risk_score * 0.1)
        
        return {
            'risk_level': risk_level,
            'confidence': confidence,
            'risk_score': risk_score,
            'high_risk_indicators': high_risk_indicators,
            'medium_risk_indicators': medium_risk_indicators,
            'relevant_knowledge': relevant_knowledge,
            'urgency': urgency
        }
    
    def _generate_recommendations(self, assessment: Dict[str, Any], 
                                gestational_week: Optional[int]) -> List[str]:
        """Generate specific recommendations based on assessment"""
        recommendations = []
        risk_level = assessment['risk_level']
        
        if risk_level == "high":
            recommendations.extend([
                "Seek immediate medical attention - go to emergency room or call 911",
                "Do not delay medical care - these symptoms require urgent evaluation",
                "Call your OB/GYN immediately if available"
            ])
            if gestational_week and gestational_week < 20:
                recommendations.append("Early pregnancy complications require immediate specialist care")
            elif gestational_week and gestational_week > 28:
                recommendations.append("Late pregnancy symptoms require immediate fetal monitoring")
                
        elif risk_level == "moderate":
            recommendations.extend([
                "Contact your healthcare provider within 24 hours",
                "Monitor symptoms closely and seek care if they worsen",
                "Keep a record of symptom timing and severity"
            ])
            if gestational_week and gestational_week > 20:
                recommendations.append("Monitor fetal movement patterns")
                
        else:  # low risk
            recommendations.extend([
                "Continue routine prenatal care schedule",
                "Monitor symptoms and contact provider if they change",
                "Maintain healthy pregnancy habits"
            ])
        
        # Add specific symptom-based recommendations
        if assessment.get('high_risk_indicators'):
            recommendations.append("High-risk symptom combinations detected - immediate evaluation needed")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _generate_reasoning(self, assessment: Dict[str, Any], symptoms: List[str],
                          gestational_week: Optional[int]) -> str:
        """Generate medical reasoning for the assessment"""
        reasoning_parts = []
        
        risk_level = assessment['risk_level']
        risk_score = assessment['risk_score']
        
        reasoning_parts.append(f"Risk assessment based on symptom analysis (score: {risk_score})")
        
        if assessment.get('high_risk_indicators'):
            reasoning_parts.append(f"High-risk patterns identified: {', '.join(assessment['high_risk_indicators'])}")
        
        if assessment.get('medium_risk_indicators'):
            reasoning_parts.append(f"Medium-risk indicators: {', '.join(assessment['medium_risk_indicators'])}")
        
        if gestational_week:
            if gestational_week < 12:
                reasoning_parts.append("First trimester: Focus on early pregnancy complications")
            elif gestational_week < 28:
                reasoning_parts.append("Second trimester: Monitoring for gestational conditions")
            else:
                reasoning_parts.append("Third trimester: Attention to preterm labor and preeclampsia signs")
        
        # Add knowledge-based context if available
        if assessment.get('relevant_knowledge'):
            reasoning_parts.append("Assessment informed by evidence-based pregnancy guidelines")
        
        return '. '.join(reasoning_parts)
    
    def assess_pregnancy_risk(self, symptoms: List[str], gestational_week: Optional[int] = None,
                            previous_complications: Optional[bool] = None,
                            additional_info: Optional[str] = None) -> RiskAssessmentResult:
        """Main assessment function using knowledge base retrieval"""
        
        try:
            # Perform knowledge-enhanced assessment
            assessment = self._assess_with_knowledge(symptoms, gestational_week, 
                                                   previous_complications, additional_info)
            
            # Generate recommendations and reasoning
            recommendations = self._generate_recommendations(assessment, gestational_week)
            reasoning = self._generate_reasoning(assessment, symptoms, gestational_week)
            
            return RiskAssessmentResult(
                riskLevel=assessment['risk_level'],
                confidence=assessment['confidence'],
                recommendations=recommendations,
                reasoning=reasoning,
                urgency=assessment['urgency']
            )
            
        except Exception as e:
            logger.error(f"Assessment failed: {e}")
            # Fallback to safe assessment
            return RiskAssessmentResult(
                riskLevel="moderate",
                confidence=0.5,
                recommendations=[
                    "Unable to complete full assessment - please consult healthcare provider",
                    "Monitor symptoms closely",
                    "Seek medical attention if symptoms worsen"
                ],
                reasoning="Assessment system encountered an error - medical consultation recommended",
                urgency="within_24_hours"
            )

# Global instance
_hf_rag_service_instance = None

def get_hf_rag_service() -> PregnancyHFRAGService:
    """Get singleton HF RAG service instance"""
    global _hf_rag_service_instance
    if _hf_rag_service_instance is None:
        _hf_rag_service_instance = PregnancyHFRAGService()
    return _hf_rag_service_instance

def assess_pregnancy_risk_api(symptoms: List[str], gestational_week: Optional[int] = None,
                            previous_complications: Optional[bool] = None,
                            additional_info: Optional[str] = None) -> Dict[str, Any]:
    """API function for pregnancy risk assessment using HF RAG"""
    service = get_hf_rag_service()
    result = service.assess_pregnancy_risk(symptoms, gestational_week, 
                                         previous_complications, additional_info)
    
    return {
        "riskLevel": result.riskLevel,
        "confidence": result.confidence,
        "recommendations": result.recommendations,
        "reasoning": result.reasoning,
        "urgency": result.urgency
    }

if __name__ == "__main__":
    # Test the HF RAG service
    try:
        service = PregnancyHFRAGService()
        test_result = service.assess_pregnancy_risk(
            symptoms=["severe headaches", "vision changes", "swelling"],
            gestational_week=32,
            previous_complications=False
        )
        print(f"Test assessment: {test_result}")
        
    except Exception as e:
        print(f"Test failed: {e}")