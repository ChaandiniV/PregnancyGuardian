import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from pydantic import BaseModel
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskAssessmentResult(BaseModel):
    riskLevel: str  # "low", "moderate", "high"
    confidence: float  # 0.0 to 1.0
    recommendations: List[str]
    reasoning: str
    urgency: str  # "routine", "within_week", "within_24_hours", "immediate"

class PregnancyRAGService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        # Initialize LlamaIndex settings
        Settings.llm = OpenAI(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            api_key=self.openai_api_key,
            temperature=0.1  # Lower temperature for more consistent medical assessments
        )
        Settings.embed_model = OpenAIEmbedding(
            model="text-embedding-3-small",
            api_key=self.openai_api_key
        )
        
        self.index = None
        self.query_engine = None
        self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self):
        """Initialize the RAG knowledge base from documents"""
        try:
            # Load documents from knowledge base directory
            knowledge_base_path = "server/knowledge_base"
            if not os.path.exists(knowledge_base_path):
                raise FileNotFoundError(f"Knowledge base directory not found: {knowledge_base_path}")
            
            documents = SimpleDirectoryReader(knowledge_base_path).load_data()
            logger.info(f"Loaded {len(documents)} documents from knowledge base")
            
            # Parse documents into nodes
            parser = SimpleNodeParser.from_defaults(chunk_size=512, chunk_overlap=50)
            nodes = parser.get_nodes_from_documents(documents)
            
            # Create vector store index
            self.index = VectorStoreIndex(nodes)
            
            # Create query engine with retrieval and post-processing
            retriever = VectorIndexRetriever(
                index=self.index,
                similarity_top_k=5  # Retrieve top 5 most relevant chunks
            )
            
            self.query_engine = RetrieverQueryEngine(
                retriever=retriever
            )
            
            logger.info("RAG knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {str(e)}")
            raise
    
    def assess_pregnancy_risk(
        self,
        symptoms: List[str],
        gestational_week: Optional[int] = None,
        previous_complications: Optional[bool] = None,
        additional_info: Optional[str] = None
    ) -> RiskAssessmentResult:
        """
        Assess pregnancy risk using RAG-enhanced LLM analysis
        """
        try:
            # Construct comprehensive query for RAG retrieval
            symptom_list = ", ".join(symptoms)
            gestational_info = f"at {gestational_week} weeks gestation" if gestational_week else "at unknown gestational age"
            complications_info = "with previous pregnancy complications" if previous_complications else "without known previous complications"
            additional_context = f"Additional context: {additional_info}" if additional_info else ""
            
            # Create RAG query
            rag_query = f"""
            Patient presenting with symptoms: {symptom_list} {gestational_info} {complications_info}.
            {additional_context}
            
            Please provide information about:
            1. Risk assessment for these symptoms during pregnancy
            2. Potential conditions or complications
            3. Recommended actions and urgency level
            4. Warning signs to monitor
            """
            
            # Retrieve relevant medical information
            if self.query_engine:
                rag_response = self.query_engine.query(rag_query)
                retrieved_context = str(rag_response)
            else:
                retrieved_context = "Knowledge base not available"
            
            # Create detailed assessment prompt
            assessment_prompt = f"""
            You are a medical AI assistant specializing in pregnancy health risk assessment. 
            Based on the retrieved medical knowledge and patient symptoms, provide a comprehensive risk assessment.

            PATIENT INFORMATION:
            - Symptoms: {symptom_list}
            - Gestational Week: {gestational_week if gestational_week else "Not specified"}
            - Previous Complications: {"Yes" if previous_complications else "No"}
            - Additional Information: {additional_info if additional_info else "None provided"}

            RETRIEVED MEDICAL KNOWLEDGE:
            {retrieved_context}

            ASSESSMENT GUIDELINES:
            - LOW RISK: Common pregnancy symptoms, routine monitoring sufficient
            - MODERATE RISK: Symptoms that warrant medical attention within days
            - HIGH RISK: Symptoms requiring immediate or urgent medical care
            - Consider gestational week and symptom combinations
            - Provide specific, actionable recommendations
            - Be conservative in risk assessment to ensure patient safety

            Please provide a JSON response with the following structure:
            {{
                "riskLevel": "low" | "moderate" | "high",
                "confidence": 0.0-1.0,
                "recommendations": ["recommendation1", "recommendation2", ...],
                "reasoning": "detailed explanation of the assessment based on retrieved knowledge",
                "urgency": "routine" | "within_week" | "within_24_hours" | "immediate"
            }}
            """
            
            # Get LLM assessment
            llm_response = Settings.llm.complete(assessment_prompt)
            response_text = str(llm_response)
            
            # Parse JSON response
            try:
                # Extract JSON from response if it contains other text
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_text = response_text[start_idx:end_idx]
                    result_dict = json.loads(json_text)
                else:
                    raise ValueError("No JSON found in response")
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to parse JSON response: {e}")
                # Fallback parsing
                result_dict = self._parse_fallback_response(response_text)
            
            # Validate and create result
            result = self._validate_assessment_result(result_dict)
            
            logger.info(f"Risk assessment completed: {result.riskLevel} risk level")
            return result
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {str(e)}")
            # Return safe fallback assessment
            return self._create_fallback_assessment(symptoms)
    
    def _parse_fallback_response(self, response_text: str) -> Dict[str, Any]:
        """Parse response when JSON parsing fails"""
        # Simple heuristic parsing
        risk_level = "moderate"  # Default to moderate for safety
        confidence = 0.5
        urgency = "within_24_hours"
        
        response_lower = response_text.lower()
        
        # Determine risk level from text
        if any(word in response_lower for word in ["low risk", "routine", "normal"]):
            risk_level = "low"
            urgency = "routine"
        elif any(word in response_lower for word in ["high risk", "emergency", "immediate"]):
            risk_level = "high"
            urgency = "immediate"
        
        # Extract recommendations (simple approach)
        recommendations = [
            "Contact your healthcare provider to discuss your symptoms",
            "Monitor symptoms closely and keep a symptom diary",
            "Seek immediate medical attention if symptoms worsen"
        ]
        
        return {
            "riskLevel": risk_level,
            "confidence": confidence,
            "recommendations": recommendations,
            "reasoning": response_text,
            "urgency": urgency
        }
    
    def _validate_assessment_result(self, result_dict: Dict[str, Any]) -> RiskAssessmentResult:
        """Validate and sanitize assessment result"""
        # Validate risk level
        risk_level = result_dict.get("riskLevel", "moderate")
        if risk_level not in ["low", "moderate", "high"]:
            risk_level = "moderate"
        
        # Validate confidence
        confidence = result_dict.get("confidence", 0.5)
        confidence = max(0.0, min(1.0, float(confidence)))
        
        # Validate urgency
        urgency = result_dict.get("urgency", "within_week")
        if urgency not in ["routine", "within_week", "within_24_hours", "immediate"]:
            urgency = "within_week"
        
        # Validate recommendations
        recommendations = result_dict.get("recommendations", [])
        if not isinstance(recommendations, list) or len(recommendations) == 0:
            recommendations = [
                "Contact your healthcare provider to discuss your symptoms",
                "Monitor symptoms closely",
                "Seek immediate care if symptoms worsen"
            ]
        
        # Get reasoning
        reasoning = result_dict.get("reasoning", "Assessment completed using medical knowledge base")
        
        return RiskAssessmentResult(
            riskLevel=risk_level,
            confidence=confidence,
            recommendations=recommendations,
            reasoning=reasoning,
            urgency=urgency
        )
    
    def _create_fallback_assessment(self, symptoms: List[str]) -> RiskAssessmentResult:
        """Create safe fallback assessment when all else fails"""
        return RiskAssessmentResult(
            riskLevel="moderate",
            confidence=0.5,
            recommendations=[
                "Contact your healthcare provider to discuss your symptoms",
                "Monitor symptoms closely and keep a detailed symptom diary",
                "Seek immediate medical attention if symptoms worsen or new symptoms develop",
                "Do not ignore concerning symptoms during pregnancy"
            ],
            reasoning="Unable to complete full AI assessment due to technical issues. Please consult with your healthcare provider for proper evaluation of your symptoms.",
            urgency="within_24_hours"
        )

# Global instance
_rag_service_instance = None

def get_rag_service() -> PregnancyRAGService:
    """Get singleton RAG service instance"""
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = PregnancyRAGService()
    return _rag_service_instance

# FastAPI integration functions
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
        rag_service = get_rag_service()
        result = rag_service.assess_pregnancy_risk(
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
            "confidence": 0.5,
            "recommendations": [
                "Contact your healthcare provider to discuss your symptoms",
                "Monitor symptoms closely and keep a symptom diary",
                "Seek immediate medical attention if symptoms worsen"
            ],
            "reasoning": "Unable to complete AI assessment. Please consult with your healthcare provider for proper evaluation.",
            "urgency": "within_24_hours"
        }

if __name__ == "__main__":
    # Test the RAG service
    try:
        service = PregnancyRAGService()
        test_result = service.assess_pregnancy_risk(
            symptoms=["severe headaches", "vision changes", "swelling"],
            gestational_week=32,
            previous_complications=False
        )
        print(f"Test assessment: {test_result}")
        
    except Exception as e:
        print(f"Test failed: {e}")