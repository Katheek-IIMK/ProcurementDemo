"""
Supplier Metrics Service
Calculates supplier metrics and scores for selection purposes.
"""
import random
import json


class SupplierMetricsService:
    def __init__(self):
        pass

    def calculate_supplier_metrics(self, supplier_data: dict) -> dict:
        """
        Calculates supplier metrics based on available data.
        Returns metrics including experience, quality rating, delivery reliability, etc.
        """
        # Generate realistic metrics based on supplier data
        # In a real system, this would pull from supplier databases
        
        # Experience years: 5-25 years
        experience_years = random.randint(5, 25)
        
        # Quality rating: 3.5-5.0 (out of 5)
        quality_rating = round(random.uniform(3.5, 5.0), 1)
        
        # Delivery reliability: 75-98% (on-time delivery rate)
        delivery_reliability = round(random.uniform(75, 98), 1)
        
        # Price competitiveness: 60-95 (score out of 100)
        price_competitiveness = round(random.uniform(60, 95), 1)
        
        # Calculate overall score (weighted average)
        overall_score = (
            (quality_rating / 5.0 * 100) * 0.3 +  # 30% weight
            delivery_reliability * 0.3 +           # 30% weight
            price_competitiveness * 0.25 +         # 25% weight
            min(experience_years / 25.0 * 100, 100) * 0.15  # 15% weight
        )
        
        return {
            "experience_years": experience_years,
            "quality_rating": quality_rating,
            "delivery_reliability": delivery_reliability,
            "price_competitiveness": price_competitiveness,
            "overall_score": round(overall_score, 1)
        }

    def rank_suppliers(self, suppliers: list) -> list:
        """Ranks suppliers by overall score."""
        return sorted(suppliers, key=lambda x: x.get("overall_score", 0), reverse=True)

