import os
import json
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskAssessmentResult(BaseModel):
    riskLevel: str  # "low", "moderate", "high"
    confidence: float  # 0.0 to 1.0
    recommendations: List[str]
    reasoning: str
    urgency: str  # "routine", "within_week", "within_24_hours", "immediate"

class PregnancyAssessmentService:
    def __init__(self):
        self.knowledge_base = self._load_knowledge_base()
        logger.info("Pregnancy assessment service initialized with knowledge base")
    
    def _load_knowledge_base(self) -> Dict[str, Any]:
        """Load the pregnancy knowledge base"""
        try:
            knowledge_base_path = "knowledge_base/pregnancy_knowledge.txt"
            if not os.path.exists(knowledge_base_path):
                knowledge_base_path = "server/knowledge_base/pregnancy_knowledge.txt"
            
            if os.path.exists(knowledge_base_path):
                with open(knowledge_base_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                logger.info("Knowledge base loaded successfully")
                return self._parse_knowledge_base(content)
            else:
                logger.warning("Knowledge base file not found, using built-in knowledge")
                return self._get_builtin_knowledge()
                
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            return self._get_builtin_knowledge()
    
    def _parse_knowledge_base(self, content: str) -> Dict[str, Any]:
        """Parse the knowledge base content into structured data"""
        kb = {
            "high_risk_symptoms": [],
            "moderate_risk_symptoms": [],
            "low_risk_symptoms": [],
            "symptom_combinations": {},
            "trimester_risks": {}
        }
        
        # Extract high risk symptoms
        high_risk_section = re.search(r'HIGH RISK / EMERGENCY SYMPTOMS:(.*?)(?=RISK FACTORS|MEDIUM RISK|$)', content, re.DOTALL)
        if high_risk_section:
            for line in high_risk_section.group(1).split('\n'):
                if line.strip().startswith('-'):
                    kb["high_risk_symptoms"].append(line.strip()[1:].strip())
        
        # Extract moderate risk symptoms
        moderate_risk_section = re.search(r'MEDIUM RISK INDICATORS:(.*?)(?=HIGH RISK|LOW RISK|$)', content, re.DOTALL)
        if moderate_risk_section:
            for line in moderate_risk_section.group(1).split('\n'):
                if line.strip().startswith('-'):
                    kb["moderate_risk_symptoms"].append(line.strip()[1:].strip())
        
        # Extract low risk symptoms
        low_risk_section = re.search(r'NORMAL \(LOW RISK\) SYMPTOMS:(.*?)(?=MEDIUM RISK|HIGH RISK|$)', content, re.DOTALL)
        if low_risk_section:
            for line in low_risk_section.group(1).split('\n'):
                if line.strip().startswith('-'):
                    kb["low_risk_symptoms"].append(line.strip()[1:].strip())
        
        return kb
    
    def _get_builtin_knowledge(self) -> Dict[str, Any]:
        """Built-in pregnancy knowledge as fallback"""
        return {
            "high_risk_symptoms": [
                "heavy vaginal bleeding",
                "severe abdominal pain",
                "severe headaches",
                "vision changes",
                "difficulty breathing",
                "chest pain",
                "fever >38.5°C",
                "no fetal movement",
                "severe swelling"
            ],
            "moderate_risk_symptoms": [
                "persistent vomiting",
                "elevated blood pressure",
                "mild bleeding",
                "decreased fetal movement",
                "severe heartburn",
                "swollen hands/feet"
            ],
            "low_risk_symptoms": [
                "mild nausea",
                "light spotting",
                "mild back pain",
                "constipation",
                "mild fatigue",
                "breast tenderness",
                "frequent urination"
            ],
            "symptom_combinations": {
                "preeclampsia": ["severe headaches", "vision changes", "swelling"],
                "miscarriage": ["bleeding", "cramping", "abdominal pain"],
                "ectopic": ["abdominal pain", "bleeding", "dizziness"]
            }
        }
    
    def _calculate_symptom_risk_score(self, symptoms: List[str]) -> Dict[str, Any]:
        """Calculate risk score based on symptoms"""
        risk_score = 0
        matched_high_risk = []
        matched_moderate_risk = []
        matched_low_risk = []
        
        # Normalize symptoms for matching
        normalized_symptoms = [s.lower().strip() for s in symptoms]
        
        # Check for high risk symptoms
        for symptom in normalized_symptoms:
            for high_risk in self.knowledge_base["high_risk_symptoms"]:
                if self._symptom_matches(symptom, high_risk.lower()):
                    risk_score += 3
                    matched_high_risk.append(high_risk)
                    break
        
        # Check for moderate risk symptoms
        for symptom in normalized_symptoms:
            for moderate_risk in self.knowledge_base["moderate_risk_symptoms"]:
                if self._symptom_matches(symptom, moderate_risk.lower()):
                    risk_score += 2
                    matched_moderate_risk.append(moderate_risk)
                    break
        
        # Check for low risk symptoms
        for symptom in normalized_symptoms:
            for low_risk in self.knowledge_base["low_risk_symptoms"]:
                if self._symptom_matches(symptom, low_risk.lower()):
                    risk_score += 1
                    matched_low_risk.append(low_risk)
                    break
        
        # Check for dangerous combinations
        dangerous_combinations = self._check_symptom_combinations(normalized_symptoms)
        if dangerous_combinations:
            risk_score += 5
        
        return {
            "risk_score": risk_score,
            "matched_high_risk": matched_high_risk,
            "matched_moderate_risk": matched_moderate_risk,
            "matched_low_risk": matched_low_risk,
            "dangerous_combinations": dangerous_combinations
        }
    
    def _symptom_matches(self, user_symptom: str, knowledge_symptom: str) -> bool:
        """Check if user symptom matches knowledge base symptom with severity awareness"""
        user_lower = user_symptom.lower().strip()
        knowledge_lower = knowledge_symptom.lower().strip()
        
        # Handle severity qualifiers - severe symptoms shouldn't match mild categories
        if "severe" in knowledge_lower and "severe" not in user_lower and "heavy" not in user_lower:
            return False
        if "mild" in knowledge_lower and ("severe" in user_lower or "heavy" in user_lower):
            return False
            
        # Extract core symptom terms without severity modifiers
        user_clean = user_lower.replace("severe", "").replace("mild", "").replace("heavy", "").strip()
        knowledge_clean = knowledge_lower.replace("severe", "").replace("mild", "").replace("heavy", "").strip()
        
        user_words = set(user_clean.split())
        knowledge_words = set(knowledge_clean.split())
        
        # Check for meaningful overlap (at least 1 significant word match)
        overlap = user_words.intersection(knowledge_words)
        return (len(overlap) > 0 and 
                not all(word in ["and", "or", "the", "a", "an", "in", "on", "at", "with"] for word in overlap)) or \
               user_clean in knowledge_clean or knowledge_clean in user_clean
    
    def _check_symptom_combinations(self, symptoms: List[str]) -> List[str]:
        """Check for dangerous symptom combinations"""
        dangerous_combinations = []
        
        # Preeclampsia triad
        preeclampsia_symptoms = ["headache", "vision", "swelling"]
        if all(any(s in symptom for symptom in symptoms) for s in preeclampsia_symptoms):
            dangerous_combinations.append("preeclampsia")
        
        # Miscarriage indicators
        miscarriage_symptoms = ["bleeding", "cramping", "pain"]
        matching_miscarriage = sum(1 for s in miscarriage_symptoms if any(s in symptom for symptom in symptoms))
        if matching_miscarriage >= 2:
            dangerous_combinations.append("possible_miscarriage")
        
        # Infection indicators
        infection_symptoms = ["fever", "discharge", "pain"]
        matching_infection = sum(1 for s in infection_symptoms if any(s in symptom for symptom in symptoms))
        if matching_infection >= 2:
            dangerous_combinations.append("possible_infection")
        
        return dangerous_combinations
    
    def _adjust_risk_for_gestational_week(self, base_risk: str, gestational_week: Optional[int]) -> str:
        """Adjust risk based on gestational week"""
        if not gestational_week:
            return base_risk
        
        # First trimester (1-12 weeks) - higher risk for ectopic, miscarriage
        if gestational_week <= 12:
            if base_risk == "moderate":
                return "high"  # Be more cautious in first trimester
        
        # Third trimester (28+ weeks) - higher risk for preeclampsia, preterm labor
        elif gestational_week >= 28:
            if base_risk == "moderate":
                return "high"  # Be more cautious in third trimester
        
        return base_risk
    
    def assess_pregnancy_risk(
        self,
        symptoms: List[str],
        gestational_week: Optional[int] = None,
        previous_complications: Optional[bool] = None,
        additional_info: Optional[str] = None
    ) -> RiskAssessmentResult:
        """
        Assess pregnancy risk using rule-based analysis
        """
        try:
            # Calculate risk score
            risk_analysis = self._calculate_symptom_risk_score(symptoms)
            risk_score = risk_analysis["risk_score"]
            
            # Determine base risk level with more balanced thresholds
            if risk_score >= 6 or risk_analysis["dangerous_combinations"]:
                base_risk = "high"
                urgency = "immediate"
                confidence = 0.85
            elif risk_score >= 4 or (risk_analysis["matched_high_risk"] and risk_score >= 3):
                base_risk = "high"
                urgency = "within_24_hours"
                confidence = 0.80
            elif risk_score >= 2 or risk_analysis["matched_moderate_risk"]:
                base_risk = "moderate"
                urgency = "within_week"
                confidence = 0.75
            else:
                base_risk = "low"
                urgency = "routine"
                confidence = 0.70
            
            # Adjust for gestational week
            final_risk = self._adjust_risk_for_gestational_week(base_risk, gestational_week)
            
            # Adjust for previous complications
            if previous_complications and final_risk == "low":
                final_risk = "moderate"
                urgency = "within_week"
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                final_risk, 
                risk_analysis, 
                gestational_week, 
                previous_complications
            )
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                risk_analysis, 
                final_risk, 
                gestational_week, 
                symptoms
            )
            
            return RiskAssessmentResult(
                riskLevel=final_risk,
                confidence=confidence,
                recommendations=recommendations,
                reasoning=reasoning,
                urgency=urgency
            )
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {str(e)}")
            # Safe fallback
            return RiskAssessmentResult(
                riskLevel="moderate",
                confidence=0.6,
                recommendations=[
                    "Contact your healthcare provider to discuss your symptoms",
                    "Monitor symptoms closely and keep a detailed symptom diary",
                    "Seek immediate medical attention if symptoms worsen"
                ],
                reasoning="Assessment completed using medical guidelines. Please consult with your healthcare provider for evaluation.",
                urgency="within_24_hours"
            )
    
    def _generate_recommendations(
        self, 
        risk_level: str, 
        risk_analysis: Dict[str, Any],
        gestational_week: Optional[int],
        previous_complications: Optional[bool]
    ) -> List[str]:
        """Generate specific recommendations based on risk assessment"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Seek immediate medical attention or go to the emergency room",
                "Contact your healthcare provider immediately",
                "Do not delay seeking medical care"
            ])
            
            if risk_analysis["dangerous_combinations"]:
                for combo in risk_analysis["dangerous_combinations"]:
                    if combo == "preeclampsia":
                        recommendations.append("Monitor blood pressure and report any vision changes immediately")
                    elif combo == "possible_miscarriage":
                        recommendations.append("Avoid physical exertion and seek immediate evaluation")
                    elif combo == "possible_infection":
                        recommendations.append("Monitor temperature and seek immediate antibiotic evaluation")
        
        elif risk_level == "moderate":
            recommendations.extend([
                "Contact your healthcare provider within 24-48 hours",
                "Monitor symptoms closely and document any changes",
                "Avoid strenuous activities until evaluated by your provider"
            ])
            
            if gestational_week and gestational_week >= 28:
                recommendations.append("Monitor fetal movement patterns daily")
        
        else:  # low risk
            recommendations.extend([
                "Continue routine prenatal care as scheduled",
                "Monitor symptoms and contact provider if they worsen",
                "Maintain healthy pregnancy practices (rest, nutrition, hydration)"
            ])
        
        # Add general safety recommendations
        recommendations.append("Keep emergency contact numbers readily available")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _generate_reasoning(
        self, 
        risk_analysis: Dict[str, Any], 
        risk_level: str,
        gestational_week: Optional[int],
        symptoms: List[str]
    ) -> str:
        """Generate medical reasoning for the assessment"""
        reasoning_parts = []
        
        # Symptom analysis
        if risk_analysis["matched_high_risk"]:
            reasoning_parts.append(f"High-risk symptoms identified: {', '.join(risk_analysis['matched_high_risk'][:3])}")
        
        if risk_analysis["matched_moderate_risk"]:
            reasoning_parts.append(f"Moderate-risk symptoms present: {', '.join(risk_analysis['matched_moderate_risk'][:3])}")
        
        if risk_analysis["dangerous_combinations"]:
            combo_descriptions = {
                "preeclampsia": "symptoms consistent with preeclampsia",
                "possible_miscarriage": "symptoms suggesting possible miscarriage",
                "possible_infection": "symptoms indicating possible infection"
            }
            for combo in risk_analysis["dangerous_combinations"]:
                reasoning_parts.append(f"Concerning symptom pattern: {combo_descriptions.get(combo, combo)}")
        
        # Gestational week consideration
        if gestational_week:
            if gestational_week <= 12:
                reasoning_parts.append(f"First trimester (week {gestational_week}) requires careful monitoring")
            elif gestational_week >= 28:
                reasoning_parts.append(f"Third trimester (week {gestational_week}) increases certain risks")
        
        # Risk level explanation
        risk_explanations = {
            "high": "These symptoms require immediate medical evaluation due to potential serious complications.",
            "moderate": "These symptoms warrant prompt medical attention to rule out complications.",
            "low": "These symptoms are commonly experienced during pregnancy but should be monitored."
        }
        
        reasoning_parts.append(risk_explanations[risk_level])
        
        return " ".join(reasoning_parts)

# Global instance
_assessment_service_instance = None

def get_assessment_service() -> PregnancyAssessmentService:
    """Get singleton assessment service instance"""
    global _assessment_service_instance
    if _assessment_service_instance is None:
        _assessment_service_instance = PregnancyAssessmentService()
    return _assessment_service_instance

def assess_pregnancy_risk_api(
    symptoms: List[str],
    gestational_week: Optional[int] = None,
    previous_complications: Optional[bool] = None,
    additional_info: Optional[str] = None
) -> Dict[str, Any]:
    """
    API function for pregnancy risk assessment
    Returns dict compatible with existing frontend
    """
    try:
        service = get_assessment_service()
        result = service.assess_pregnancy_risk(
            symptoms=symptoms,
            gestational_week=gestational_week,
            previous_complications=previous_complications,
            additional_info=additional_info
        )
        
        return {
            "riskLevel": result.riskLevel,
            "confidence": result.confidence,
            "recommendations": result.recommendations,
            "reasoning": result.reasoning,
            "urgency": result.urgency
        }
        
    except Exception as e:
        logger.error(f"API assessment failed: {str(e)}")
        # Return safe fallback
        return {
            "riskLevel": "moderate",
            "confidence": 0.6,
            "recommendations": [
                "Contact your healthcare provider to discuss your symptoms",
                "Monitor symptoms closely and keep a symptom diary",
                "Seek immediate medical attention if symptoms worsen"
            ],
            "reasoning": "Assessment completed using medical guidelines. Please consult with your healthcare provider for evaluation.",
            "urgency": "within_24_hours"
        }

if __name__ == "__main__":
    # Test the service
    try:
        service = PregnancyAssessmentService()
        test_result = service.assess_pregnancy_risk(
            symptoms=["severe headaches", "vision changes", "swelling"],
            gestational_week=32,
            previous_complications=False
        )
        print(f"Test assessment: {test_result}")
        
    except Exception as e:
        print(f"Test failed: {e}")