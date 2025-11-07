"""
Outreach Agent - Agentic AI (Simulated)
Handles supplier contact scenarios including email, phone calls, and social media engagement.
Note: This is a demo version that simulates AI behavior without using real AI services.
"""
from datetime import datetime
import json
import random
import time


class OutreachAgent:
    def __init__(self):
        # Simulated AI model - no actual AI used
        self.model = "gpt-4-simulated"

    def handle_supplier_contact(self, supplier: dict, requirement_description: str, 
                                has_phone: bool = False) -> dict:
        """
        Handles supplier contact based on available contact methods.
        Simulates AI-powered contact management.
        """
        # No delay for demo - instant response
        
        if has_phone and supplier.get("phone"):
            return self._make_phone_call(supplier, requirement_description)
        elif supplier.get("email"):
            return self._send_email(supplier, requirement_description)
        else:
            return self._social_media_engagement(supplier, requirement_description)

    def _send_email(self, supplier: dict, requirement_description: str) -> dict:
        """Sends email to supplier and simulates response (simulated AI)."""
        email_content = self._generate_email_content(supplier, requirement_description)
        
        # Simulate email sending and response (70% response rate)
        response_status = self._simulate_email_response(supplier)
        
        return {
            "method": "email",
            "contacted_at": datetime.utcnow().isoformat(),
            "email_content": email_content,
            "response_received": response_status["received"],
            "response_notes": response_status.get("notes", "")
        }

    def _make_phone_call(self, supplier: dict, requirement_description: str) -> dict:
        """Simulates making a phone call to supplier (simulated AI)."""
        call_script = self._generate_call_script(supplier, requirement_description)
        call_outcome = self._simulate_call_outcome(supplier)
        
        return {
            "method": "phone",
            "contacted_at": datetime.utcnow().isoformat(),
            "call_script": call_script,
            "call_outcome": call_outcome["outcome"],
            "notes": call_outcome.get("notes", "")
        }

    def _social_media_engagement(self, supplier: dict, requirement_description: str) -> dict:
        """Engages supplier via social media and automated reminders (simulated AI)."""
        engagement_strategy = self._generate_engagement_strategy(supplier, requirement_description)
        
        return {
            "method": "social_media",
            "contacted_at": datetime.utcnow().isoformat(),
            "engagement_strategy": engagement_strategy,
            "automated_reminders_scheduled": True
        }

    def _generate_email_content(self, supplier: dict, requirement_description: str) -> str:
        """Generates email content for supplier outreach (simulated AI)."""
        return f"""Dear {supplier.get('name', 'Supplier')},

I hope this message finds you well. We are following up regarding the procurement opportunity we discussed.

Requirement: {requirement_description}

Our AI-powered procurement system has identified your organization as a potential partner for this requirement. We would like to move forward with the next steps in our evaluation process.

Please let us know your availability to discuss this opportunity further. We are particularly interested in:
- Your capacity to fulfill this requirement
- Pricing and delivery timelines
- Quality assurance processes

We look forward to your response and the possibility of establishing a successful partnership.

Best regards,
Procurement Team
AI-Powered Sourcing System"""

    def _generate_call_script(self, supplier: dict, requirement_description: str) -> str:
        """Generates a call script for phone outreach (simulated AI)."""
        return f"""Call Script for {supplier.get('name', 'Supplier')}:

1. Greeting: "Hello, this is [Name] from our Procurement Team. Is this a good time to talk?"

2. Introduction: "We're reaching out regarding a procurement opportunity that aligns with your capabilities."

3. Purpose: "We have a requirement for: {requirement_description}"

4. Key Points:
   - Discuss supplier's interest and availability
   - Understand their capacity and capabilities
   - Inquire about pricing and delivery timelines
   - Discuss quality standards and certifications

5. Closing: "Thank you for your time. We'll follow up with an email containing more details."

[AI-Generated Call Script - Optimized for engagement and information gathering]"""

    def _generate_engagement_strategy(self, supplier: dict, requirement_description: str) -> str:
        """Generates social media engagement strategy (simulated AI)."""
        return f"""Social Media Engagement Strategy for {supplier.get('name', 'Supplier')}:

Platforms: LinkedIn, Twitter, Industry Forums
Approach: 
- Professional connection request with personalized message
- Share relevant industry content and procurement insights
- Engage with supplier's posts and updates
- Direct messaging about procurement opportunity

Automated Reminder Schedule:
- Day 1: Initial contact
- Day 3: Follow-up reminder
- Day 7: Second follow-up with additional information
- Day 14: Final reminder with deadline

Content Focus: Highlight the procurement opportunity and mutual benefits of partnership.

[AI-Generated Engagement Strategy - Optimized for multi-channel outreach]"""

    def _simulate_email_response(self, supplier: dict) -> dict:
        """Simulates email response from supplier."""
        # For demo: Always return positive response immediately
        responses = [
            "Supplier responded positively and is interested in the opportunity",
            "Supplier responded with questions about requirements and pricing",
            "Supplier expressed interest and requested more information",
            "Supplier responded and is available for further discussion"
        ]
        return {
            "received": True,
            "notes": random.choice(responses)
        }

    def _simulate_call_outcome(self, supplier: dict) -> dict:
        """Simulates phone call outcome."""
        # For demo: Always return positive response
        outcomes = [
            ("answered_interested", "Supplier answered and expressed strong interest in the opportunity"),
            ("answered_interested", "Supplier answered, interested and ready to proceed"),
        ]
        outcome, notes = random.choice(outcomes)
        
        return {
            "outcome": outcome,
            "notes": notes
        }

    def manage_sampling_followups(self, supplier: dict, requirement_description: str) -> dict:
        """
        Manages automated sampling follow-ups for quantity, address, and price inquiries.
        Simulates AI-powered follow-up management.
        """
        # No delay for demo - instant processing
        
        followup_content = self._generate_followup_content(supplier, requirement_description)
        
        return {
            "followup_sent": True,
            "followup_content": followup_content,
            "inquiries": {
                "quantity": "Requested detailed quantity information and delivery schedule",
                "address": "Requested delivery address details and logistics requirements",
                "price": "Requested comprehensive pricing information including volume discounts"
            },
            "sent_at": datetime.utcnow().isoformat()
        }

    def _generate_followup_content(self, supplier: dict, requirement_description: str) -> str:
        """Generates follow-up content for sampling inquiries (simulated AI)."""
        return f"""Dear {supplier.get('name', 'Supplier')},

Thank you for your interest in our procurement opportunity. To proceed with our evaluation, we need the following information:

1. Sample Quantity Details:
   - Please confirm the quantity you can provide for sample evaluation
   - Expected delivery timeline for samples

2. Delivery Address Information:
   - Please provide your preferred delivery address format
   - Any special handling or logistics requirements

3. Pricing Information:
   - Sample pricing
   - Projected pricing for full order quantities
   - Volume discount structure if applicable

Requirement: {requirement_description}

Our AI system will analyze your responses to determine the best fit for our procurement needs. We appreciate your prompt response.

Best regards,
Procurement Team
AI-Powered Sourcing System"""
