"""
Shortlist Service - GenAI (Simulated)
Creates AI-curated supplier shortlist with integrated cost & quality analysis for CPO.
Note: This is a demo version that simulates AI behavior without using real AI services.
"""
import json
import random
import time
from typing import List, Dict


class ShortlistService:
    def __init__(self):
        # Simulated AI model - no actual AI used
        self.model = "gpt-4-simulated"

    def create_shortlist(self, suppliers_data: List[Dict]) -> List[Dict]:
        """
        Creates AI-curated supplier shortlist with integrated cost & quality analysis.
        Simulates AI-powered supplier ranking and evaluation.
        """
        # No delay for demo - instant processing
        
        shortlist = []
        
        for supplier in suppliers_data:
            cost_score = self._calculate_cost_score(supplier)
            quality_score = self._calculate_quality_score(supplier)
            integrated_score = (cost_score * 0.6) + (quality_score * 0.4)  # Weighted
            
            recommendation = self._generate_recommendation(supplier, integrated_score)
            
            shortlist.append({
                "rank": 0,  # Will be set after sorting
                "supplier_id": supplier.get("id"),
                "supplier_name": supplier.get("name"),
                "integrated_score": round(integrated_score, 2),
                "cost_score": round(cost_score, 2),
                "quality_score": round(quality_score, 2),
                "recommendation": recommendation
            })
        
        # Sort by integrated score (descending)
        shortlist.sort(key=lambda x: x["integrated_score"], reverse=True)
        
        # Update ranks
        for idx, item in enumerate(shortlist):
            item["rank"] = idx + 1
        
        return shortlist

    def _calculate_cost_score(self, supplier: Dict) -> float:
        """Calculates cost score (0-100, higher is better) - simulated AI scoring."""
        savings_percentage = supplier.get("savings_percentage", 0)
        
        # AI-powered scoring algorithm simulation
        # 0% savings = 50 points (neutral)
        # 20%+ savings = 100 points (excellent)
        if savings_percentage <= 0:
            return 50.0
        elif savings_percentage >= 20:
            return 100.0
        else:
            # Linear interpolation between 50 and 100
            return 50 + (savings_percentage / 20 * 50)

    def _calculate_quality_score(self, supplier: Dict) -> float:
        """Calculates quality score (0-100) - simulated AI scoring."""
        score = 0
        
        # Quality approval is most important (70 points)
        if supplier.get("quality_approved", False):
            score += 70
        else:
            score += 20  # Partial credit if not yet approved
        
        # Certifications add value (20 points)
        certifications = supplier.get("certifications", [])
        if certifications:
            score += min(len(certifications) * 5, 20)  # Up to 20 points for certifications
        
        # Response engagement (10 points)
        if supplier.get("response_received", False):
            score += 10
        
        return min(score, 100.0)

    def _generate_recommendation(self, supplier: Dict, score: float) -> str:
        """Generates recommendation text (simulated AI)."""
        supplier_name = supplier.get("name", "Supplier")
        savings = supplier.get("savings_percentage", 0)
        quality_approved = supplier.get("quality_approved", False)
        
        if score >= 85:
            return f"HIGHLY RECOMMENDED: {supplier_name} demonstrates exceptional value with {savings:.1f}% cost savings and {'approved' if quality_approved else 'pending'} quality standards. Strong candidate for strategic partnership."
        elif score >= 70:
            return f"RECOMMENDED: {supplier_name} offers strong value proposition with {savings:.1f}% savings and {'quality approved' if quality_approved else 'quality under review'}. Good fit for procurement needs."
        elif score >= 55:
            return f"CONDITIONALLY RECOMMENDED: {supplier_name} presents acceptable value with {savings:.1f}% savings. {'Quality approved' if quality_approved else 'Quality review pending'}. Consider if alternatives are limited."
        elif score >= 40:
            return f"NOT RECOMMENDED: {supplier_name} shows limited value with {savings:.1f}% savings. {'Quality approved' if quality_approved else 'Quality concerns'}. Explore alternatives first."
        else:
            return f"NOT RECOMMENDED: {supplier_name} does not meet procurement standards. Low cost savings ({savings:.1f}%) and {'quality approved' if quality_approved else 'quality issues'}. Seek alternative suppliers."
