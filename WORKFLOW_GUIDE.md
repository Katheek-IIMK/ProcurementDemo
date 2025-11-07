# Complete Workflow Guide

## Visual Workflow Steps

Follow these steps in order to complete the procurement workflow:

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Create Procurement Requirement (MANUAL)            │
│ - Click "Create New Requirement"                            │
│ - Fill in title, description, category, quantity, etc.     │
│ - Submit the form                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Scouting Agent (AGENTIC AI - Simulated)            │
│ - Click "Start Scouting" button                             │
│ - System discovers 3-5 suppliers automatically             │
│ - Suppliers are checked for availability scope              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Availability Scope Decision                        │
│ - System automatically checks each supplier                 │
│ - Suppliers with ✓ Available proceed                       │
│ - Suppliers with ✗ Not Available are rejected              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Outreach Agent (AGENTIC AI - Simulated)            │
│ - Click "Contact Supplier" for each available supplier      │
│ - System simulates email/phone/social media outreach        │
│ - Suppliers respond (simulated)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Automated Sampling Follow-ups (AGENTIC AI)        │
│ - Click "Request Sample" for responded suppliers            │
│ - System sends automated follow-ups                         │
│ - Requests quantity, address, and price information         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Sample Received (MANUAL)                           │
│ - Click "Record Sample Received" button                     │
│ - Fill in: Quantity, Delivery Address, Price Quoted        │
│ - Submit the form                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Quality Team Analysis (MANUAL)                     │
│ - Click "Review Quality" button                              │
│ - Select: Approved or Rejected                              │
│ - Enter quality notes and reviewer name                     │
│ - Submit the review                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Cost Analysis (GENAI - Simulated)                  │
│ - Click "Analyze Cost" button for approved suppliers       │
│ - System calculates total cost, savings, transportation    │
│ - Compares with current suppliers                           │
│ - Determines if savings meet expectations                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌────────┴────────┐
                    │                 │
        ┌───────────▼──────┐  ┌──────▼──────────┐
        │ Savings Meets     │  │ Savings Doesn't │
        │ Expectations?     │  │ Meet Expectations│
        │ YES               │  │ NO              │
        └───────────┬───────┘  └──────┬──────────┘
                    │                 │
                    │                 ↓
                    │    ┌────────────────────────────┐
                    │    │ STEP 10: Negotiation      │
                    │    │ Agent (AGENTIC AI)        │
                    │    │ - Click "Negotiate"        │
                    │    │ - System negotiates price  │
                    │    │ - New cost calculated      │
                    │    └────────────────────────────┘
                    │                 │
                    └────────┬────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 11: AI-Curated Supplier Shortlist (GENAI - Simulated) │
│ - Click "Create Shortlist" button                           │
│ - System ranks suppliers by integrated score                │
│ - Combines cost & quality analysis                          │
│ - Generates recommendations for CPO                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 12: On-boarding and SRM Analysis (GENAI - Simulated)  │
│ - For shortlisted suppliers, initiate onboarding           │
│ - System generates SRM analysis reports                   │
│ - Creates onboarding plan and risk assessment               │
└─────────────────────────────────────────────────────────────┘
```

## Quick Reference: Button Actions

| Supplier Status | Available Actions |
|----------------|-------------------|
| `contacted` | "Contact Supplier" |
| `responded` | "Request Sample" |
| `sample_requested` | "Record Sample Received" |
| `sample_received` | "Review Quality" |
| `quality_approved` | "Analyze Cost" |
| `cost_analyzed` (if savings don't meet) | "Negotiate" |
| `cost_analyzed` (if savings meet) | Ready for shortlist |

## Status Badge Colors

- **Draft/Scouting**: Light blue
- **Outreach**: Yellow
- **Sampling**: Light cyan
- **Quality Review**: Light red
- **Cost Analysis**: Light green
- **Negotiation**: Yellow
- **Shortlisted**: Light cyan
- **Onboarding**: Light green
- **Completed**: Light green
- **Rejected**: Light red

## Tips for Demo

1. **Create Multiple Requirements**: Test different categories to see different supplier suggestions
2. **Try Different Scenarios**: 
   - Approve some samples, reject others
   - See how negotiation works when savings don't meet expectations
3. **Review AI Reports**: Check the detailed analysis notes generated by the simulated AI
4. **Check API Docs**: Visit `http://localhost:8000/docs` to see all available endpoints

## Common Issues

**Q: Suppliers not showing after scouting?**
- Make sure you clicked "Start Scouting" and waited for it to complete
- Refresh the page if needed

**Q: Can't see "Record Sample Received" button?**
- Make sure you clicked "Request Sample" first
- The supplier status should be "sample_requested"

**Q: Quality review button not showing?**
- Make sure you recorded a sample first
- The supplier status should be "sample_received"

**Q: Cost analysis not working?**
- Make sure the sample was quality approved
- Check that the sample has a price quoted


