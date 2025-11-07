"""
Negotiation Agent - Agentic AI (Simulated)
Handles negotiations based on current market scenario when savings don't meet expectations.
Note: This is a demo version that simulates AI behavior without using real AI services.
"""
from datetime import datetime
import json
import random
import time


class NegotiationAgent:
    def __init__(self):
        # Simulated AI model - no actual AI used
        self.model = "gpt-4-simulated"

    def negotiate(self, supplier: dict, current_cost: float, target_cost: float, 
                 market_scenario: dict = None) -> dict:
        """
        Conducts negotiation with supplier to improve pricing.
        Simulates AI-powered negotiation strategy.
        """
        # No delay for demo - instant negotiation
        
        if market_scenario is None:
            market_scenario = self._get_market_scenario()

        negotiation_strategy = self._develop_strategy(
            supplier, current_cost, target_cost, market_scenario
        )
        
        negotiation_outcome = self._simulate_negotiation(
            supplier, current_cost, target_cost, negotiation_strategy
        )

        return {
            "supplier_id": supplier.get("id"),
            "supplier_name": supplier.get("name"),
            "original_cost": current_cost,
            "target_cost": target_cost,
            "negotiated_cost": negotiation_outcome["new_cost"],
            "negotiation_strategy": negotiation_strategy,
            "outcome": negotiation_outcome["outcome"],
            "notes": negotiation_outcome["notes"],
            "negotiated_at": datetime.utcnow().isoformat()
        }

    def _develop_strategy(self, supplier: dict, current_cost: float, 
                         target_cost: float, market_scenario: dict) -> str:
        """Develops negotiation strategy based on market conditions (simulated AI)."""
        savings_needed = ((current_cost - target_cost) / current_cost) * 100
        
        strategy_templates = [
            f"""Negotiation Strategy for {supplier.get('name', 'Supplier')}:

Market Analysis:
- Current market trend: {market_scenario.get('market_trend', 'stable')}
- Supply availability: {market_scenario.get('supply_availability', 'good')}
- Competitive landscape: {market_scenario.get('competitor_pricing', 'competitive')}

Strategy Approach:
1. Volume Commitment: Propose long-term partnership with volume guarantees
2. Payment Terms: Offer favorable payment terms in exchange for better pricing
3. Market Benchmarking: Reference competitive pricing in the market
4. Partnership Value: Emphasize strategic partnership benefits beyond pricing

Target: Achieve {savings_needed:.1f}% cost reduction to meet procurement expectations.

[AI-Generated Negotiation Strategy - Based on market analysis and supplier profile]""",
            
            f"""Strategic Negotiation Plan:

Key Leverage Points:
- Market conditions favor buyer (supply availability: {market_scenario.get('supply_availability', 'good')})
- Opportunity for long-term contract with guaranteed volumes
- Potential for expanded business relationship

Negotiation Tactics:
1. Open with partnership value proposition
2. Present market data and competitive benchmarks
3. Propose win-win scenarios (volume discounts, extended contracts)
4. Emphasize quality and service alignment

Expected Outcome: {savings_needed:.1f}% reduction through strategic negotiation.

[AI-Powered Negotiation Framework - Optimized for mutual value creation]"""
        ]
        
        return random.choice(strategy_templates)

    def _simulate_negotiation(self, supplier: dict, current_cost: float, 
                             target_cost: float, strategy: str) -> dict:
        """Simulates negotiation outcome."""
        # Simulate negotiation - typically results in 5-15% improvement
        cost_reduction_percentage = random.uniform(0.05, 0.15)
        new_cost = current_cost * (1 - cost_reduction_percentage)
        
        # Check if target is met
        meets_target = new_cost <= target_cost
        
        if meets_target:
            outcome = "success"
            notes = f"Successfully negotiated to ${new_cost:,.2f}, meeting target cost. Supplier agreed to volume-based pricing structure."
        else:
            outcome = "partial_success"
            notes = f"Negotiated to ${new_cost:,.2f}, improved by {cost_reduction_percentage*100:.1f}% but did not fully meet target. Further negotiation may be possible."
        
        return {
            "new_cost": round(new_cost, 2),
            "outcome": outcome,
            "notes": notes,
            "cost_reduction_percentage": round(cost_reduction_percentage * 100, 2)
        }

    def _get_market_scenario(self) -> dict:
        """Gets current market scenario data (simulated)."""
        scenarios = [
            {
                "market_trend": "stable",
                "supply_availability": "good",
                "competitor_pricing": "competitive",
                "demand_level": "moderate",
                "economic_indicators": "favorable"
            },
            {
                "market_trend": "declining",
                "supply_availability": "excellent",
                "competitor_pricing": "aggressive",
                "demand_level": "low",
                "economic_indicators": "favorable"
            },
            {
                "market_trend": "stable",
                "supply_availability": "moderate",
                "competitor_pricing": "moderate",
                "demand_level": "moderate",
                "economic_indicators": "stable"
            }
        ]
        
        return random.choice(scenarios)
