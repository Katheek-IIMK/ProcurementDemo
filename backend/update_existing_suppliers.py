"""
Update existing suppliers with default metric values
"""
import sqlite3
from pathlib import Path
from services.supplier_metrics import SupplierMetricsService

db_path = Path(__file__).parent / "procurement.db"
metrics_service = SupplierMetricsService()

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    # Get all suppliers without metrics
    cursor.execute("""
        SELECT id, name, email, phone, company, website, certifications 
        FROM suppliers 
        WHERE experience_years = 0 AND overall_score = 0.0
    """)
    suppliers = cursor.fetchall()
    
    if suppliers:
        print(f"Updating {len(suppliers)} existing suppliers with metrics...")
        
        for supplier_id, name, email, phone, company, website, certifications in suppliers:
            supplier_data = {
                "name": name,
                "email": email,
                "phone": phone,
                "company": company,
                "website": website
            }
            
            # Calculate metrics
            metrics = metrics_service.calculate_supplier_metrics(supplier_data)
            
            # Update supplier
            cursor.execute("""
                UPDATE suppliers 
                SET experience_years = ?,
                    quality_rating = ?,
                    delivery_reliability = ?,
                    price_competitiveness = ?,
                    overall_score = ?
                WHERE id = ?
            """, (
                metrics["experience_years"],
                metrics["quality_rating"],
                metrics["delivery_reliability"],
                metrics["price_competitiveness"],
                metrics["overall_score"],
                supplier_id
            ))
        
        conn.commit()
        print(f"✓ Updated {len(suppliers)} suppliers with metrics!")
    else:
        print("No suppliers need updating.")
        
except sqlite3.Error as e:
    print(f"Error updating suppliers: {e}")
    conn.rollback()
    raise
finally:
    conn.close()



