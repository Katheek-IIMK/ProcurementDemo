"""
Scouting Agent - Agentic AI (Simulated)
Sources qualified suppliers by sending them customized emails outlining the need and required certifications.
Note: This is a demo version that simulates AI behavior without using real AI services.
"""
import json
import random
from typing import List, Dict


class ScoutingAgent:
    def __init__(self):
        # Simulated AI model - no actual AI used
        self.model = "gpt-4-simulated"

    def source_suppliers(self, requirement_description: str, required_certifications: list, category: str) -> list:
        """
        Sources qualified suppliers based on the procurement requirement.
        Simulates AI-powered supplier discovery.
        """
        # No delay for demo - instant discovery
        
        # Generate realistic supplier suggestions based on category
        suppliers = self._generate_suppliers_for_category(category, required_certifications)
        
        return suppliers

    def generate_outreach_email(self, supplier_name: str, requirement_description: str, 
                                required_certifications: list) -> str:
        """Generates a customized outreach email for a supplier (simulated AI)."""
        # Simulate AI email generation
        certs_text = ", ".join(required_certifications) if required_certifications else "industry standards"
        
        email = f"""Dear {supplier_name},

We are reaching out regarding a procurement opportunity that may align with your capabilities.

Requirement: {requirement_description}

Required Certifications: {certs_text}

We are conducting a comprehensive sourcing initiative and believe your organization may be an excellent fit for this opportunity. We would appreciate the opportunity to discuss this further and learn more about your company's qualifications and capabilities.

Our procurement team has identified your organization through our AI-powered supplier discovery system, which analyzes supplier databases, certifications, and industry expertise to find the best matches for our requirements.

Please respond if you are interested in participating in this procurement process. We look forward to the possibility of establishing a mutually beneficial partnership.

Best regards,
Procurement Team
AI-Powered Sourcing System"""
        
        return email

    def check_availability_scope(self, supplier: dict, requirement_description: str) -> bool:
        """
        Checks if supplier meets availability scope requirements.
        Simulates AI-powered availability analysis.
        """
        # For demo: Always return True so suppliers can proceed
        return True

    def _generate_suppliers_for_category(self, category: str, certifications: list) -> list:
        """Generates mock suppliers based on category."""
        # Predefined supplier templates for different categories
        supplier_templates = {
            "office supplies": [
                {
                    "name": "Global Office Solutions Inc.",
                    "email": "contact@globaloffice.com",
                    "phone": "+1-555-0101",
                    "website": "https://globaloffice.com",
                    "certifications": ["ISO 9001", "ISO 14001", "FSC Certified"],
                    "qualification_notes": "Leading supplier in office supplies with 20+ years of experience and sustainable sourcing practices"
                },
                {
                    "name": "Premium Office Supplies Co.",
                    "email": "sales@premiumoffice.com",
                    "phone": "+1-555-0102",
                    "website": "https://premiumoffice.com",
                    "certifications": ["ISO 9001", "OHSAS 18001"],
                    "qualification_notes": "Specialized in high-quality office materials with excellent track record and competitive pricing"
                },
                {
                    "name": "Reliable Business Supplies",
                    "email": "info@reliablesupplies.com",
                    "phone": None,
                    "website": "https://reliablesupplies.com",
                    "certifications": ["ISO 9001"],
                    "qualification_notes": "Established supplier with competitive pricing and fast delivery"
                },
                {
                    "name": "Eco-Friendly Office Solutions",
                    "email": "contact@ecofriendly.com",
                    "phone": "+1-555-0104",
                    "website": "https://ecofriendly.com",
                    "certifications": ["ISO 9001", "ISO 14001", "Green Business Certified"],
                    "qualification_notes": "Sustainable office supplies with strong environmental credentials"
                },
                {
                    "name": "Corporate Supply Partners",
                    "email": "procurement@corpsupply.com",
                    "phone": "+1-555-0105",
                    "website": "https://corpsupply.com",
                    "certifications": ["ISO 9001", "ISO 27001"],
                    "qualification_notes": "Enterprise-focused supplier with comprehensive service offerings"
                }
            ],
            "raw materials": [
                {
                    "name": "Industrial Materials Corp.",
                    "email": "sales@indmaterials.com",
                    "phone": "+1-555-0201",
                    "website": "https://indmaterials.com",
                    "certifications": ["ISO 9001", "ISO 14001", "AS9100"],
                    "qualification_notes": "Leading supplier of industrial raw materials with global distribution network"
                },
                {
                    "name": "Premium Materials Solutions",
                    "email": "info@premiummaterials.com",
                    "phone": "+1-555-0202",
                    "website": "https://premiummaterials.com",
                    "certifications": ["ISO 9001", "OHSAS 18001"],
                    "qualification_notes": "High-quality raw materials with strict quality control processes"
                },
                {
                    "name": "Global Sourcing Partners",
                    "email": "contact@globalsourcing.com",
                    "phone": "+1-555-0203",
                    "website": "https://globalsourcing.com",
                    "certifications": ["ISO 9001"],
                    "qualification_notes": "International supplier with competitive pricing and reliable delivery"
                }
            ],
            "services": [
                {
                    "name": "Professional Services Group",
                    "email": "contact@proservices.com",
                    "phone": "+1-555-0301",
                    "website": "https://proservices.com",
                    "certifications": ["ISO 9001", "ISO 27001"],
                    "qualification_notes": "Leading provider of professional services with proven track record"
                },
                {
                    "name": "Expert Services Solutions",
                    "email": "sales@expertservices.com",
                    "phone": "+1-555-0302",
                    "website": "https://expertservices.com",
                    "certifications": ["ISO 9001"],
                    "qualification_notes": "Specialized service provider with industry expertise"
                }
            ]
        }
        
        # Select appropriate template or use default
        category_lower = category.lower()
        if "office" in category_lower or "supplies" in category_lower:
            template_key = "office supplies"
        elif "material" in category_lower or "raw" in category_lower:
            template_key = "raw materials"
        elif "service" in category_lower:
            template_key = "services"
        else:
            template_key = "office supplies"  # Default
        
        suppliers = supplier_templates.get(template_key, supplier_templates["office supplies"])
        
        # Randomly select 3-5 suppliers
        num_suppliers = random.randint(3, min(5, len(suppliers)))
        selected = random.sample(suppliers, num_suppliers)
        
        # Ensure certifications match requirements
        for supplier in selected:
            if certifications:
                # Add required certifications if not present
                supplier_certs = supplier.get("certifications", [])
                for cert in certifications:
                    if cert not in supplier_certs:
                        supplier_certs.append(cert)
                supplier["certifications"] = supplier_certs
        
        return selected
