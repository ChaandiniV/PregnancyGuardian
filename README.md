# GraviLog: Pregnancy Risk Assessment Assistant

## Overview

GraviLog is a web-based AI assistant designed to help expectant mothers assess pregnancy-related health risks. It offers two modes of interaction — a structured form and a proactive conversational assistant — both of which analyze symptom data against a medical knowledge base using a Retrieval-Augmented Generation (RAG) pipeline powered by LlamaIndex and a Hugging Face language model.

This project was built as part of a task to redefine pregnancy care through accessible, intelligent, and proactive health risk analysis.

---

## Features

- **Form-Based Assessment**: A structured flow where users can manually input symptoms and receive immediate risk feedback.
- **Proactive Chatbot (Dr. AI)**: A conversational interface that asks five sequential health-related questions before providing a risk assessment.
- **Risk Levels**: Low, Medium, or High — clearly presented with recommendations.
- **RAG Integration**: Utilizes LlamaIndex and a Hugging Face model (Zephyr) to retrieve and reason over a curated medical knowledge base.
- **Deployed Interface**: Hosted on Replit and accessible via a public URL.
- **No External API Dependence**: All AI inference runs locally or via Hugging Face models, with fallback to rule-based logic if needed.

---

## Technical Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Python, FastAPI
- **RAG System**: LlamaIndex + Hugging Face Zephyr model
- **Hosting**: Replit (client and server running together)
- **Knowledge Base**: Custom dataset built from WHO guidelines and clinical literature

---

## System Architecture

1. **User Input (Form or Chatbot)** → 
2. **Symptom Collection** → 
3. **Request Sent to `/api/assessments`** → 
4. **Backend Pipeline**:
   - Query RAG engine (LlamaIndex + HF model)
   - Retrieve relevant medical facts
   - Classify risk as Low / Medium / High
   - Return risk level, urgency, and recommendation
5. **Result Rendered** with clear explanation and visual indicator

---

## Example Interaction (Chatbot)

**Dr. AI Asks:**
- Are you currently experiencing any unusual bleeding or discharge?
- Do you have any persistent headaches, blurry vision, or swelling?
- How has your baby's movement been today compared to yesterday?
- Have you had a fever or noticed any foul-smelling discharge?
- Are you feeling any pressure or pain in your pelvis or lower back?

**User Responds** → Backend processes the answers → Returns:
- **Risk Level**: High
- **Urgency**: Immediate medical attention recommended
- **Suggestion**: Visit your OB or nearest emergency room

---

## Usage Instructions

### Local Setup

1. Clone the repository:
git clone https://github.com/ChaandiniV/PregnancyGuardian.git
cd PregnancyGuardian


2. Start the Python backend:
cd server
python hf_server.py



3. In a second terminal, start the frontend:
cd client
npm install
npm run dev

(OR)

Press the Run Button in Replit


4. Access the frontend at `http://localhost:5000` or the Replit URL.

---

## Deployment

The application is deployed and publicly accessible at:

[**Live URL**:] https://036cf12a-334c-477c-a8ed-3d89209e2f1d-00-tnfcfeuwq4pn.pike.replit.dev/]

---

## Deliverables

- Publicly accessible chatbot URL
- GitHub repository with:
- All code (frontend, backend, RAG engine)
- README documentation
- Setup instructions

---

## Notes


- The chatbot interaction was added to meet the “proactive questioning” requirement using a clean chat UX alongside the form.
- Both interaction modes use the same risk classification logic for consistency.

---

## License

This project is developed and is intended for educational and demonstrative purposes only.
