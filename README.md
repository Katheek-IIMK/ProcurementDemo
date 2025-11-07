# Procurement Demo - Fully Autonomous Sourcing Agent

This is a multi-agent AI system designed to automate the entire procurement lifecycle, from supplier discovery to negotiation and cost analysis. The goal is to reduce onboarding time and enable strategic, data-driven sourcing at scale.

## Workflow Overview

The system implements the following workflow:

1. **Procurement Requirement** (Manual) - User states the procurement need
2. **Scouting Agent** (Agentic AI) - Sources qualified suppliers via customized emails
3. **Availability Scope Decision** - Checks if suppliers meet availability requirements
4. **Outreach Agent** (Agentic AI) - Handles supplier contact (email/call/social media)
5. **Automated Sampling Follow-ups** (Agentic AI) - Manages quantity, address, and price inquiries
6. **Sample Received - Quality Team Analysis** (Manual) - Quality team reviews samples
7. **Quality Approval Decision** - Determines if samples meet quality standards
8. **Cost Analysis** (GenAI) - Analyzes costs based on warehouse locations and current suppliers
9. **Savings Decision** - Checks if savings meet expectations
10. **Negotiation Agent** (Agentic AI) - Negotiates based on current market scenario (if needed)
11. **AI-Curated Supplier Shortlist** (GenAI) - Creates integrated cost & quality analysis for CPO
12. **On-boarding and SRM Analysis** (GenAI) - Begins once PO is approved

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Python with FastAPI
- **AI/ML**: Simulated AI responses (no real AI APIs used - demo purposes only)
- **Database**: SQLite (for demo purposes)

## Important Note

**This is a DEMO system that simulates AI behavior without using real AI services.** All AI agents (Scouting, Outreach, Negotiation) and GenAI services (Cost Analysis, Shortlisting, SRM) use mock responses that give the impression of AI-powered functionality. No OpenAI or other AI API calls are made. This allows the demo to run without API keys or costs while still demonstrating the workflow and user experience.

## Setup Instructions

1. Install dependencies:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

2. Set up environment variables (optional):
```bash
# Create .env file in backend directory (optional)
DATABASE_URL=sqlite:///./procurement.db
```

Note: No AI API keys are required. The system uses simulated AI responses.

3. Run the application:
```bash
# Backend
cd backend
python main.py

# Frontend (in another terminal)
cd frontend
npm start
```

## Project Structure

```
Procurement/
├── backend/
│   ├── main.py
│   ├── agents/
│   ├── models/
│   ├── services/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

