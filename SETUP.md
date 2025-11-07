# Setup Instructions

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Note: No AI API keys required - this demo uses simulated AI responses

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory (optional):
```bash
DATABASE_URL=sqlite:///./procurement.db
```

Note: The `.env` file is optional. The system works without it using default settings.

5. Run the backend server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Create New Requirement" to start a procurement process
3. Fill in the requirement details and submit
4. Follow the workflow steps:
   - **Step 1**: Create requirement (Manual)
   - **Step 2**: Scouting Agent will source suppliers (Agentic AI)
   - **Step 3**: Check availability scope (Decision Point)
   - **Step 4**: Outreach Agent contacts suppliers (Agentic AI)
   - **Step 5**: Automated sampling follow-ups (Agentic AI)
   - **Step 6**: Sample received - Quality Team Analysis (Manual)
   - **Step 7**: Quality Approval Decision
   - **Step 8**: Cost Analysis (GenAI)
   - **Step 9**: Savings Decision
   - **Step 10**: Negotiation Agent (if needed) (Agentic AI)
   - **Step 11**: AI-curated supplier shortlist (GenAI)
   - **Step 12**: On-boarding and SRM Analysis (GenAI)

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Notes

- The system uses SQLite for database storage (for demo purposes)
- **All AI agents use simulated responses** - no real AI/OpenAI API calls are made
- All features are simulated (email sending, phone calls, AI responses) for demo purposes
- The system gives the impression of AI-powered functionality without actual AI usage
- In production, you would integrate with actual AI services, email services, phone systems, and supplier databases

