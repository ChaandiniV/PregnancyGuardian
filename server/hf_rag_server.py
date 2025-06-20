#!/usr/bin/env python3
"""
Hugging Face-based RAG server for pregnancy risk assessment
Uses knowledge base retrieval without requiring expensive API keys
"""
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from hf_rag_service import assess_pregnancy_risk_api

# Create FastAPI app
app = FastAPI(
    title="GraviLog HF RAG Service",
    description="Pregnancy risk assessment using Hugging Face and knowledge base retrieval",
    version="1.0.0"
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
    return {"status": "healthy", "service": "GraviLog HF RAG Service"}

@app.post("/assess", response_model=AssessmentResponse)
async def assess_risk(request: AssessmentRequest):
    """
    Assess pregnancy risk using HF RAG-enhanced analysis
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

# Add CORS middleware for frontend integration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    port = int(os.getenv("HF_RAG_PORT", 8001))
    uvicorn.run(
        "hf_rag_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )