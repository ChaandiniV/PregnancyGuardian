from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from huggingface_service import assess_pregnancy_risk_api

app = FastAPI(
    title="GraviLog Hugging Face Assessment Service",
    description="Local rule-based pregnancy risk assessment service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentRequest(BaseModel):
    symptoms: List[str]
    gestationalWeek: Optional[int] = None
    previousComplications: Optional[bool] = None
    additionalSymptoms: Optional[str] = None

class AssessmentResponse(BaseModel):
    riskLevel: str
    confidence: float
    recommendations: List[str]
    reasoning: str
    urgency: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "GraviLog HF Assessment Service"}

@app.post("/assess", response_model=AssessmentResponse)
async def assess_risk(request: AssessmentRequest):
    """
    Assess pregnancy risk using rule-based analysis
    """
    try:
        result = assess_pregnancy_risk_api(
            symptoms=request.symptoms,
            gestational_week=request.gestationalWeek,
            previous_complications=request.previousComplications,
            additional_info=request.additionalSymptoms
        )
        
        return AssessmentResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Risk assessment failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.getenv("HF_PORT", 8000))
    uvicorn.run(
        "hf_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )