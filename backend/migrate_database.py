"""
Database Migration Script
Adds new columns to existing database tables for supplier metrics and negotiation iterations.
"""
import sqlite3
import os
from pathlib import Path

# Find the database file
db_path = Path(__file__).parent / "procurement.db"

if not db_path.exists():
    print("Database file not found. It will be created automatically on first run.")
    exit(0)

print(f"Migrating database: {db_path}")

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(suppliers)")
    columns = [row[1] for row in cursor.fetchall()]
    
    # Add missing columns to suppliers table
    if 'experience_years' not in columns:
        print("Adding experience_years column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN experience_years INTEGER DEFAULT 0")
    
    if 'quality_rating' not in columns:
        print("Adding quality_rating column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN quality_rating REAL DEFAULT 0.0")
    
    if 'delivery_reliability' not in columns:
        print("Adding delivery_reliability column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN delivery_reliability REAL DEFAULT 0.0")
    
    if 'price_competitiveness' not in columns:
        print("Adding price_competitiveness column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN price_competitiveness REAL DEFAULT 0.0")
    
    if 'overall_score' not in columns:
        print("Adding overall_score column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN overall_score REAL DEFAULT 0.0")
    
    if 'selected_for_outreach' not in columns:
        print("Adding selected_for_outreach column...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN selected_for_outreach BOOLEAN DEFAULT 0")
    
    # Check if negotiation_iterations table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='negotiation_iterations'")
    if not cursor.fetchone():
        print("Creating negotiation_iterations table...")
        cursor.execute("""
            CREATE TABLE negotiation_iterations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplier_id INTEGER NOT NULL,
                iteration_number INTEGER NOT NULL,
                proposed_cost REAL,
                target_cost REAL,
                negotiation_strategy TEXT,
                outcome VARCHAR,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
            )
        """)
    
    conn.commit()
    print("✓ Database migration completed successfully!")
    
except sqlite3.Error as e:
    print(f"Error during migration: {e}")
    conn.rollback()
    raise
finally:
    conn.close()



