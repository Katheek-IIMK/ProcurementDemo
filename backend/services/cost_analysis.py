"""
Cost Analysis Service - GenAI (Simulated)
Performs cost analysis based on warehouse locations and current suppliers data.
Note: This is a demo version that simulates AI behavior without using real AI services.
"""
import json
import random
import time
from typing import Dict, List


class CostAnalysisService:
    def __init__(self):
        # Simulated AI model - no actual AI used
        self.model = "gpt-4-simulated"
        # Pre-fed data as mentioned in workflow
        self.warehouse_locations = [
            {"id": 1, "name": "Main Warehouse", "location": "New York, NY", "cost_factor": 1.0},
            {"id": 2, "name": "West Coast Hub", "location": "Los Angeles, CA", "cost_factor": 1.15},
            {"id": 3, "name": "Central Distribution", "location": "Chicago, IL", "cost_factor": 1.08},
        ]
        self.current_suppliers = [
            {"name": "Current Supplier A", "base_cost": 1000, "transportation_cost": 150},
            {"name": "Current Supplier B", "base_cost": 950, "transportation_cost": 180},
        ]

    def analyze_cost(self, supplier: dict, proposed_price: float, quantity: float,
                    delivery_address: str = None) -> dict:
        """
        Analyzes cost including transportation, compares with current suppliers,
        and calculates savings. Simulates AI-powered cost analysis.
        """
        # No delay for demo - instant analysis
        
        # Calculate transportation cost based on delivery address
        transportation_cost = self._calculate_transportation_cost(
            supplier.get("location", "Unknown"), 
            delivery_address or "Main Warehouse"
        )
        
        total_cost = (proposed_price * quantity) + transportation_cost
        
        # Compare with current suppliers
        comparison = self._compare_with_current_suppliers(total_cost, quantity)
        
        savings = comparison["best_current_cost"] - total_cost
        savings_percentage = (savings / comparison["best_current_cost"] * 100) if comparison["best_current_cost"] > 0 else 0
        
        # Use simulated AI to determine if savings meet expectations
        meets_expectations = self._evaluate_savings_expectations(
            savings, savings_percentage, supplier, comparison
        )
        
        analysis_notes = self._generate_analysis_notes(
            supplier, total_cost, savings, savings_percentage, comparison
        )

        return {
            "supplier_id": supplier.get("id"),
            "supplier_name": supplier.get("name"),
            "proposed_price": proposed_price,
            "quantity": quantity,
            "base_cost": proposed_price * quantity,
            "transportation_cost": transportation_cost,
            "total_cost": total_cost,
            "current_supplier_cost": comparison["best_current_cost"],
            "savings": savings,
            "savings_percentage": round(savings_percentage, 2),
            "meets_expectations": meets_expectations["meets"],
            "expectation_reasoning": meets_expectations["reasoning"],
            "warehouse_locations": self.warehouse_locations,
            "analysis_notes": analysis_notes,
            "comparison": comparison
        }

    def _calculate_transportation_cost(self, supplier_location: str, 
                                      delivery_address: str) -> float:
        """Calculates transportation cost based on locations (simulated AI)."""
        # Simulate AI-based logistics cost estimation
        # Base cost varies by distance and location
        base_costs = {
            "New York": 150,
            "Los Angeles": 200,
            "Chicago": 175,
            "Unknown": 200
        }
        
        # Find matching location
        base_cost = 200  # Default
        for location, cost in base_costs.items():
            if location.lower() in delivery_address.lower() or location.lower() in supplier_location.lower():
                base_cost = cost
                break
        
        # Add some variation
        variation = random.uniform(0.8, 1.2)
        return round(base_cost * variation, 2)

    def _compare_with_current_suppliers(self, total_cost: float, quantity: float) -> dict:
        """Compares proposed cost with current suppliers."""
        best_cost = min(
            (s["base_cost"] + s["transportation_cost"]) * quantity 
            for s in self.current_suppliers
        )
        
        return {
            "best_current_cost": best_cost,
            "current_suppliers": self.current_suppliers,
            "proposed_cost": total_cost
        }

    def _evaluate_savings_expectations(self, savings: float, savings_percentage: float,
                                     supplier: dict, comparison: dict) -> dict:
        """Uses simulated AI to evaluate if savings meet expectations."""
        # Simulate AI evaluation logic
        # Typically 5-15% savings is considered good
        if savings_percentage >= 10:
            meets = True
            reasoning = f"Excellent savings of {savings_percentage:.2f}% significantly exceeds procurement expectations. Strong value proposition."
        elif savings_percentage >= 5:
            meets = True
            reasoning = f"Good savings of {savings_percentage:.2f}% meets procurement expectations. Acceptable value proposition."
        elif savings_percentage >= 0:
            meets = False
            reasoning = f"Minimal savings of {savings_percentage:.2f}% does not meet procurement expectations. Consider negotiation or alternative suppliers."
        else:
            meets = False
            reasoning = f"Negative savings indicates higher cost than current suppliers. Does not meet procurement expectations."
        
        return {
            "meets": meets,
            "reasoning": reasoning
        }

    def _generate_analysis_notes(self, supplier: dict, total_cost: float,
                                savings: float, savings_percentage: float,
                                comparison: dict) -> str:
        """Generates detailed analysis notes (simulated AI)."""
        notes = f"""Cost Analysis Report - {supplier.get('name', 'Supplier')}

EXECUTIVE SUMMARY:
Total Cost: ${total_cost:,.2f}
Current Best Supplier Cost: ${comparison['best_current_cost']:,.2f}
Potential Savings: ${savings:,.2f} ({savings_percentage:.2f}%)

DETAILED BREAKDOWN:
1. Base Product Cost: ${total_cost - (total_cost * 0.15):,.2f}
2. Transportation & Logistics: ${total_cost * 0.15:,.2f}
3. Total Cost of Ownership: ${total_cost:,.2f}

COMPARATIVE ANALYSIS:
- Comparison with {len(self.current_suppliers)} current suppliers
- Best current option: ${comparison['best_current_cost']:,.2f}
- Proposed option: ${total_cost:,.2f}
- Net savings opportunity: ${savings:,.2f}

WAREHOUSE CONSIDERATIONS:
- Analyzed across {len(self.warehouse_locations)} warehouse locations
- Transportation costs optimized for delivery network
- Cost factors applied based on location efficiency

RECOMMENDATION:
{'✓ RECOMMENDED' if savings_percentage >= 5 else '✗ NOT RECOMMENDED'} - {'Meets' if savings_percentage >= 5 else 'Does not meet'} procurement cost expectations.

[AI-Generated Cost Analysis - Comprehensive evaluation using advanced cost modeling algorithms]"""
        
        return notes
