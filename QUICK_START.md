# Quick Start Guide - Procurement Demo

## Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The backend API is now running at `http://localhost:8000`

## Step 2: Frontend Setup

1. Open a NEW terminal window (keep backend running)

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Start the frontend development server:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## Step 3: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You should see the Procurement Demo dashboard

## Step 4: Run Through the Workflow

### Step 1: Create Procurement Requirement (Manual)
1. Click "Create New Requirement" button
2. Fill in the form:
   - Title: e.g., "Office Supplies Procurement"
   - Description: e.g., "Need office supplies including paper, pens, and folders"
   - Category: e.g., "Office Supplies"
   - Quantity: e.g., 1000
   - Unit: e.g., "units"
   - Required Certifications: Add certifications like "ISO 9001"
3. Click "Create Requirement"

### Step 2: Scouting Agent (Agentic AI)
1. On the requirement detail page, click "Start Scouting"
2. The system will simulate AI-powered supplier discovery
3. Wait a moment - suppliers will be discovered and added

### Step 3: Check Availability Scope
- The system automatically checks if suppliers meet availability requirements
- Suppliers with availability scope = YES will proceed

### Step 4: Outreach Agent (Agentic AI)
1. For each supplier with availability scope, click "Contact Supplier"
2. The system simulates AI-powered outreach (email/phone/social media)
3. Suppliers will show as "responded" if they reply

### Step 5: Automated Sampling Follow-ups (Agentic AI)
1. For suppliers that responded, click "Request Sample"
2. The system simulates automated follow-ups for quantity, address, and price

### Step 6: Sample Received - Quality Review (Manual)
1. You'll need to manually create a sample entry (this can be done via API or UI)
2. For now, you can use the API directly or we can add a UI for this

### Step 7: Quality Approval Decision (Manual)
1. Review the sample quality
2. Approve or reject the sample
3. This updates the supplier status

### Step 8: Cost Analysis (GenAI)
1. For quality-approved suppliers, click "Analyze Cost"
2. The system simulates AI-powered cost analysis
3. Results show total cost, savings, and whether expectations are met

### Step 9: Savings Decision
- If savings meet expectations → proceed to shortlist
- If not → proceed to negotiation

### Step 10: Negotiation Agent (Agentic AI) - If Needed
1. If savings don't meet expectations, click "Negotiate"
2. The system simulates AI-powered negotiation
3. New negotiated cost will be calculated

### Step 11: Create AI-Curated Shortlist (GenAI)
1. Once you have cost-analyzed suppliers, click "Create Shortlist"
2. The system simulates AI-powered supplier ranking
3. Suppliers are ranked by integrated cost & quality scores

### Step 12: On-boarding and SRM Analysis (GenAI)
1. For shortlisted suppliers, you can initiate onboarding
2. The system generates SRM analysis reports

## Troubleshooting

### Backend won't start
- Make sure port 8000 is not in use
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version: `python --version` (should be 3.8+)

### Frontend won't start
- Make sure port 3000 is not in use
- Check that Node.js is installed: `node --version` (should be 16+)
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Can't connect to backend
- Make sure backend is running on port 8000
- Check the proxy configuration in `frontend/vite.config.ts`
- Verify backend is accessible at `http://localhost:8000`

### Database issues
- The database file (`procurement.db`) will be created automatically
- If you want to reset, delete `procurement.db` and restart the backend

## API Testing

You can also test the API directly:

1. Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)
2. Or visit `http://localhost:8000/redoc` for ReDoc documentation

## Next Steps

- Explore the workflow by creating multiple requirements
- Test different scenarios (quality approval/rejection, negotiation, etc.)
- Review the generated AI reports and analyses
- Customize the mock data in agent files for your specific demo needs


