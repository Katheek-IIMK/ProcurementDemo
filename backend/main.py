"""
Main FastAPI application for Procurement Demo
Implements the fully autonomous sourcing agent workflow
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from models.database import engine, SessionLocal, Base
from models.procurement import (
    ProcurementRequirement, Supplier, Sample, CostAnalysis, SupplierShortlist,
    NegotiationIteration, RequirementStatus, SupplierStatus
)
from agents.scouting_agent import ScoutingAgent
from agents.outreach_agent import OutreachAgent
from agents.negotiation_agent import NegotiationAgent
from services.cost_analysis import CostAnalysisService
from services.shortlist_service import ShortlistService
from services.srm_service import SRMService
from services.supplier_metrics import SupplierMetricsService

# Note: All AI agents and services use simulated AI responses for demo purposes
# No real AI/OpenAI API calls are made

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Procurement Demo API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic models for request/response
class ProcurementRequirementCreate(BaseModel):
    title: str
    description: str
    category: str
    quantity: float
    unit: str
    required_certifications: List[str]
    deadline: Optional[datetime] = None


class SupplierSelection(BaseModel):
    supplier_ids: List[int]


class SampleCreate(BaseModel):
    supplier_id: int
    quantity: float
    address: str
    price_quoted: float


class QualityReview(BaseModel):
    sample_id: int
    quality_approved: bool
    quality_notes: str
    reviewed_by: str


# Initialize agents and services
scouting_agent = ScoutingAgent()
outreach_agent = OutreachAgent()
negotiation_agent = NegotiationAgent()
cost_analysis_service = CostAnalysisService()
shortlist_service = ShortlistService()
srm_service = SRMService()
supplier_metrics_service = SupplierMetricsService()


@app.get("/")
def root():
    return {"message": "Procurement Demo API - Fully Autonomous Sourcing Agent"}


@app.post("/api/requirements", response_model=dict)
def create_requirement(requirement: ProcurementRequirementCreate, db: Session = Depends(get_db)):
    """Step 1: Create procurement requirement (Manual)"""
    db_requirement = ProcurementRequirement(
        title=requirement.title,
        description=requirement.description,
        category=requirement.category,
        quantity=requirement.quantity,
        unit=requirement.unit,
        required_certifications=json.dumps(requirement.required_certifications),
        deadline=requirement.deadline,
        status=RequirementStatus.SCOUTING
    )
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    
    return {
        "id": db_requirement.id,
        "status": db_requirement.status.value,
        "message": "Requirement created, scouting agent will begin sourcing suppliers"
    }


@app.post("/api/requirements/{requirement_id}/scout")
def start_scouting(requirement_id: int, db: Session = Depends(get_db)):
    """Step 2: Scouting Agent sources suppliers"""
    requirement = db.query(ProcurementRequirement).filter(
        ProcurementRequirement.id == requirement_id
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Get suppliers from scouting agent
    certifications = json.loads(requirement.required_certifications or "[]")
    suppliers_data = scouting_agent.source_suppliers(
        requirement.description,
        certifications,
        requirement.category
    )
    
    # Check availability scope and calculate metrics for each supplier
    created_suppliers = []
    for supplier_data in suppliers_data:
        availability = scouting_agent.check_availability_scope(
            supplier_data,
            requirement.description
        )
        
        # Calculate supplier metrics
        metrics = supplier_metrics_service.calculate_supplier_metrics(supplier_data)
        
        db_supplier = Supplier(
            requirement_id=requirement_id,
            name=supplier_data["name"],
            email=supplier_data.get("email"),
            phone=supplier_data.get("phone"),
            company=supplier_data.get("company", supplier_data["name"]),
            website=supplier_data.get("website"),
            certifications=json.dumps(supplier_data.get("certifications", [])),
            availability_scope=availability,
            status=SupplierStatus.DISCOVERED if availability else SupplierStatus.REJECTED,
            experience_years=metrics["experience_years"],
            quality_rating=metrics["quality_rating"],
            delivery_reliability=metrics["delivery_reliability"],
            price_competitiveness=metrics["price_competitiveness"],
            overall_score=metrics["overall_score"]
        )
        db.add(db_supplier)
        db.flush()  # Get the ID
        created_suppliers.append(supplier_data)
    
    requirement.status = RequirementStatus.OUTREACH
    db.commit()
    
    return {
        "requirement_id": requirement_id,
        "suppliers_found": len(created_suppliers),
        "suppliers": created_suppliers,
        "status": requirement.status.value,
        "message": f"Scouting complete. {len(created_suppliers)} suppliers discovered with metrics. Please select suppliers for outreach."
    }


@app.post("/api/requirements/{requirement_id}/select-suppliers")
def select_suppliers_for_outreach(requirement_id: int, selection: SupplierSelection, db: Session = Depends(get_db)):
    """Select suppliers for outreach based on metrics"""
    requirement = db.query(ProcurementRequirement).filter(
        ProcurementRequirement.id == requirement_id
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Mark selected suppliers
    selected_suppliers = []
    for supplier_id in selection.supplier_ids:
        supplier = db.query(Supplier).filter(
            Supplier.id == supplier_id,
            Supplier.requirement_id == requirement_id
        ).first()
        
        if supplier:
            supplier.selected_for_outreach = True
            supplier.status = SupplierStatus.CONTACTED
            selected_suppliers.append(supplier_id)
    
    db.commit()
    
    # Automatically start outreach for selected suppliers
    contacted_suppliers = []
    for supplier_id in selected_suppliers:
        try:
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if supplier and supplier.selected_for_outreach:
                has_phone = bool(supplier.phone)
                contact_result = outreach_agent.handle_supplier_contact(
                    {
                        "id": supplier.id,
                        "name": supplier.name,
                        "email": supplier.email,
                        "phone": supplier.phone
                    },
                    requirement.description,
                    has_phone
                )
                
                # Realistic response simulation (not 100% positive)
                import random
                response_rate = 0.75  # 75% response rate
                responded = random.random() < response_rate
                auto_sample = None
                
                if responded:
                    supplier.status = SupplierStatus.RESPONDED
                    supplier.contact_method = contact_result["method"]
                    supplier.last_contacted = datetime.utcnow()
                    supplier.notes = contact_result.get("notes", "")
                    
                    # Automatically request sampling if supplier responded
                    followup_result = outreach_agent.manage_sampling_followups(
                        {
                            "id": supplier.id,
                            "name": supplier.name
                        },
                        requirement.description
                    )
                    supplier.status = SupplierStatus.SAMPLE_REQUESTED
                    supplier.notes = (supplier.notes or "") + f" | Sampling requested: {followup_result.get('inquiries', {})}"
                    
                    # Automatically place sample order
                    try:
                        auto_sample = auto_place_sample_order(supplier, requirement, db)
                        if auto_sample:
                            supplier.status = SupplierStatus.SAMPLE_RECEIVED
                            supplier.notes = (supplier.notes or "") + f" | Sample order placed: {auto_sample.get('quantity')} units @ ${auto_sample.get('price_quoted')}"
                    except Exception as e:
                        print(f"Error auto-placing sample order: {e}")
                        auto_sample = None
                else:
                    supplier.status = SupplierStatus.CONTACTED
                    supplier.contact_method = contact_result["method"]
                    supplier.last_contacted = datetime.utcnow()
                    supplier.notes = contact_result.get("notes", "") + " | No response yet"
                
                db.commit()
                contacted_suppliers.append({
                    "id": supplier.id,
                    "name": supplier.name,
                    "responded": responded,
                    "sample_ordered": responded and auto_sample is not None
                })
        except Exception as e:
            print(f"Error contacting supplier {supplier_id}: {e}")
            continue
    
    return {
        "requirement_id": requirement_id,
        "selected_count": len(selected_suppliers),
        "contacted_count": len(contacted_suppliers),
        "responded_count": sum(1 for s in contacted_suppliers if s.get("responded")),
        "suppliers": contacted_suppliers,
        "status": requirement.status.value
    }


def auto_place_sample_order(supplier: Supplier, requirement: ProcurementRequirement, db: Session) -> dict:
    """Automatically places sample order with realistic pricing"""
    import random
    
    # Generate realistic sample quantity (10-20% of requirement quantity)
    sample_quantity = round(requirement.quantity * random.uniform(0.10, 0.20), 2)
    
    # Generate realistic price per unit based on supplier's price competitiveness
    base_price = 100.0  # Base price per unit
    price_factor = (100 - supplier.price_competitiveness) / 100  # Lower competitiveness = higher price
    price_per_unit = base_price * (1 + price_factor * 0.3)  # 0-30% variation
    price_quoted = round(sample_quantity * price_per_unit, 2)
    
    # Create sample record
    db_sample = Sample(
        supplier_id=supplier.id,
        received_date=datetime.utcnow(),
        quantity=sample_quantity,
        address="Main Warehouse, New York, NY",  # Default address
        price_quoted=price_quoted
    )
    db.add(db_sample)
    db.commit()
    db.refresh(db_sample)
    
    return {
        "sample_id": db_sample.id,
        "quantity": sample_quantity,
        "price_quoted": price_quoted,
        "price_per_unit": round(price_per_unit, 2)
    }


@app.post("/api/suppliers/{supplier_id}/outreach")
def outreach_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Step 4: Outreach Agent contacts supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if not supplier.availability_scope:
        raise HTTPException(status_code=400, detail="Supplier does not meet availability scope")
    
    requirement = supplier.requirement
    has_phone = bool(supplier.phone)
    
    contact_result = outreach_agent.handle_supplier_contact(
        {
            "id": supplier.id,
            "name": supplier.name,
            "email": supplier.email,
            "phone": supplier.phone
        },
        requirement.description,
        has_phone
    )
    
    # Realistic response simulation
    import random
    response_rate = 0.75  # 75% response rate
    responded = random.random() < response_rate
    
    if responded:
        supplier.status = SupplierStatus.RESPONDED
    else:
        supplier.status = SupplierStatus.CONTACTED
    
    supplier.contact_method = contact_result["method"]
    supplier.last_contacted = datetime.utcnow()
    supplier.notes = contact_result.get("notes", "")
    db.commit()
    
    return {
        "supplier_id": supplier_id,
        "contact_result": contact_result,
        "responded": responded,
        "status": supplier.status.value
    }


@app.post("/api/suppliers/{supplier_id}/sampling")
def request_sampling(supplier_id: int, db: Session = Depends(get_db)):
    """Step 5: Automated sampling follow-ups"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    requirement = supplier.requirement
    followup_result = outreach_agent.manage_sampling_followups(
        {
            "id": supplier.id,
            "name": supplier.name
        },
        requirement.description
    )
    
    supplier.status = SupplierStatus.SAMPLE_REQUESTED
    db.commit()
    
    return {
        "supplier_id": supplier_id,
        "followup_result": followup_result,
        "status": supplier.status.value
    }


@app.post("/api/samples")
def create_sample(sample: SampleCreate, db: Session = Depends(get_db)):
    """Step 6: Sample received"""
    supplier = db.query(Supplier).filter(Supplier.id == sample.supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db_sample = Sample(
        supplier_id=sample.supplier_id,
        received_date=datetime.utcnow(),
        quantity=sample.quantity,
        address=sample.address,
        price_quoted=sample.price_quoted
    )
    db.add(db_sample)
    
    supplier.status = SupplierStatus.SAMPLE_RECEIVED
    supplier.requirement.status = RequirementStatus.QUALITY_REVIEW
    db.commit()
    db.refresh(db_sample)
    
    return {
        "sample_id": db_sample.id,
        "message": "Sample received, awaiting quality review",
        "status": supplier.status.value
    }


@app.post("/api/samples/{sample_id}/quality-review")
def review_quality(sample_id: int, review: QualityReview, db: Session = Depends(get_db)):
    """Step 7: Quality Team Analysis (Manual)"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    sample.quality_approved = review.quality_approved
    sample.quality_notes = review.quality_notes
    sample.quality_reviewed_by = review.reviewed_by
    sample.quality_reviewed_at = datetime.utcnow()
    
    supplier = sample.supplier
    if review.quality_approved:
        supplier.status = SupplierStatus.QUALITY_APPROVED
        supplier.requirement.status = RequirementStatus.COST_ANALYSIS
        
        # Automatically perform cost analysis
        try:
            cost_analysis_result = cost_analysis_service.analyze_cost(
                {
                    "id": supplier.id,
                    "name": supplier.name,
                    "location": "Unknown"
                },
                sample.price_quoted,
                sample.quantity,
                sample.address
            )
            
            db_analysis = CostAnalysis(
                supplier_id=supplier.id,
                proposed_cost=cost_analysis_result["base_cost"],
                transportation_cost=cost_analysis_result["transportation_cost"],
                total_cost=cost_analysis_result["total_cost"],
                current_supplier_cost=cost_analysis_result["current_supplier_cost"],
                savings=cost_analysis_result["savings"],
                savings_percentage=cost_analysis_result["savings_percentage"],
                meets_expectations=cost_analysis_result["meets_expectations"],
                analysis_notes=cost_analysis_result["analysis_notes"],
                warehouse_locations=json.dumps(cost_analysis_result["warehouse_locations"])
            )
            db.add(db_analysis)
            
            supplier.status = SupplierStatus.COST_ANALYZED
            
            # Automatically negotiate if savings don't meet expectations
            if not cost_analysis_result["meets_expectations"]:
                # Perform multiple negotiation iterations
                negotiation_iterations = perform_negotiation_iterations(
                    supplier, cost_analysis_result["total_cost"], db
                )
                
                # Get final negotiated cost from last iteration
                if negotiation_iterations:
                    final_iteration = negotiation_iterations[-1]
                    final_cost = final_iteration["negotiated_cost"]
                    
                    # Update cost analysis with negotiated cost
                    db_analysis.proposed_cost = final_cost
                    db_analysis.total_cost = final_cost
                    db_analysis.savings = db_analysis.current_supplier_cost - final_cost
                    db_analysis.savings_percentage = (db_analysis.savings / db_analysis.current_supplier_cost * 100) if db_analysis.current_supplier_cost > 0 else 0
                    db_analysis.meets_expectations = db_analysis.savings_percentage >= 5
                    db_analysis.analysis_notes = db_analysis.analysis_notes + f"\n\nNegotiation completed after {len(negotiation_iterations)} iterations."
                    
                    supplier.status = SupplierStatus.SHORTLISTED if db_analysis.meets_expectations else SupplierStatus.COST_ANALYZED
            else:
                supplier.status = SupplierStatus.SHORTLISTED
            
            # Check if we can create shortlist
            all_suppliers = db.query(Supplier).filter(
                Supplier.requirement_id == supplier.requirement_id,
                Supplier.status.in_([SupplierStatus.COST_ANALYZED, SupplierStatus.SHORTLISTED])
            ).all()
            
            if len(all_suppliers) > 0:
                # Automatically create shortlist if we have at least one analyzed supplier
                suppliers_data_for_shortlist = []
                for s in all_suppliers:
                    cost_analysis = db.query(CostAnalysis).filter(
                        CostAnalysis.supplier_id == s.id
                    ).order_by(CostAnalysis.created_at.desc()).first()
                    
                    sample_data = db.query(Sample).filter(
                        Sample.supplier_id == s.id
                    ).order_by(Sample.received_date.desc()).first()
                    
                    suppliers_data_for_shortlist.append({
                        "id": s.id,
                        "name": s.name,
                        "quality_approved": sample_data.quality_approved if sample_data else False,
                        "certifications": json.loads(s.certifications or "[]"),
                        "total_cost": cost_analysis.total_cost if cost_analysis else 0,
                        "savings": cost_analysis.savings if cost_analysis else 0,
                        "savings_percentage": cost_analysis.savings_percentage if cost_analysis else 0,
                        "response_received": s.status != SupplierStatus.DISCOVERED
                    })
                
                shortlist = shortlist_service.create_shortlist(suppliers_data_for_shortlist)
                
                # Save shortlist to database
                for item in shortlist:
                    existing = db.query(SupplierShortlist).filter(
                        SupplierShortlist.requirement_id == supplier.requirement_id,
                        SupplierShortlist.supplier_id == item["supplier_id"]
                    ).first()
                    if not existing:
                        db_shortlist = SupplierShortlist(
                            requirement_id=supplier.requirement_id,
                            supplier_id=item["supplier_id"],
                            rank=item["rank"],
                            integrated_score=item["integrated_score"],
                            cost_score=item["cost_score"],
                            quality_score=item["quality_score"],
                            recommendation=item["recommendation"]
                        )
                        db.add(db_shortlist)
                
                supplier.requirement.status = RequirementStatus.SHORTLISTED
        except Exception as e:
            print(f"Error in auto cost analysis: {e}")
            # Continue even if auto-analysis fails
    else:
        supplier.status = SupplierStatus.QUALITY_REJECTED
        supplier.requirement.status = RequirementStatus.REJECTED
    
    db.commit()
    
    return {
        "sample_id": sample_id,
        "quality_approved": review.quality_approved,
        "supplier_status": supplier.status.value,
        "requirement_status": supplier.requirement.status.value,
        "auto_analyzed": review.quality_approved,
        "message": "Quality review complete. Cost analysis performed automatically." if review.quality_approved else "Quality review complete. Sample rejected."
    }


def perform_negotiation_iterations(supplier: Supplier, initial_cost: float, db: Session) -> list:
    """Performs multiple negotiation iterations and tracks them"""
    iterations = []
    current_cost = initial_cost
    target_cost = initial_cost * 0.9  # Target 10% reduction
    max_iterations = 3
    
    for iteration_num in range(1, max_iterations + 1):
        negotiation_result = negotiation_agent.negotiate(
            {
                "id": supplier.id,
                "name": supplier.name
            },
            current_cost,
            target_cost
        )
        
        # Save iteration to database
        db_iteration = NegotiationIteration(
            supplier_id=supplier.id,
            iteration_number=iteration_num,
            proposed_cost=negotiation_result["negotiated_cost"],
            target_cost=target_cost,
            negotiation_strategy=negotiation_result["negotiation_strategy"],
            outcome=negotiation_result["outcome"],
            notes=negotiation_result["notes"]
        )
        db.add(db_iteration)
        db.commit()
        
        iterations.append({
            "iteration": iteration_num,
            "negotiated_cost": negotiation_result["negotiated_cost"],
            "outcome": negotiation_result["outcome"],
            "notes": negotiation_result["notes"],
            "strategy": negotiation_result["negotiation_strategy"]
        })
        
        current_cost = negotiation_result["negotiated_cost"]
        
        # If we've met the target or achieved success, stop
        if negotiation_result["outcome"] == "success" or current_cost <= target_cost:
            break
    
    return iterations


@app.post("/api/suppliers/{supplier_id}/cost-analysis")
def analyze_cost(supplier_id: int, db: Session = Depends(get_db)):
    """Step 8: Cost Analysis (GenAI)"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if supplier.status != SupplierStatus.QUALITY_APPROVED:
        raise HTTPException(status_code=400, detail="Supplier must be quality approved first")
    
    # Get latest sample
    sample = db.query(Sample).filter(
        Sample.supplier_id == supplier_id
    ).order_by(Sample.received_date.desc()).first()
    
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    
    # Perform cost analysis
    analysis_result = cost_analysis_service.analyze_cost(
        {
            "id": supplier.id,
            "name": supplier.name,
            "location": "Unknown"
        },
        sample.price_quoted,
        sample.quantity,
        sample.address
    )
    
    # Save cost analysis
    db_analysis = CostAnalysis(
        supplier_id=supplier_id,
        proposed_cost=analysis_result["base_cost"],
        transportation_cost=analysis_result["transportation_cost"],
        total_cost=analysis_result["total_cost"],
        current_supplier_cost=analysis_result["current_supplier_cost"],
        savings=analysis_result["savings"],
        savings_percentage=analysis_result["savings_percentage"],
        meets_expectations=analysis_result["meets_expectations"],
        analysis_notes=analysis_result["analysis_notes"],
        warehouse_locations=json.dumps(analysis_result["warehouse_locations"])
    )
    db.add(db_analysis)
    
    supplier.status = SupplierStatus.COST_ANALYZED
    
    # Check if savings meet expectations
    if analysis_result["meets_expectations"]:
        supplier.requirement.status = RequirementStatus.SHORTLISTED
    else:
        supplier.status = SupplierStatus.NEGOTIATING
        supplier.requirement.status = RequirementStatus.NEGOTIATION
    
    db.commit()
    db.refresh(db_analysis)
    
    return {
        "supplier_id": supplier_id,
        "cost_analysis": analysis_result,
        "meets_expectations": analysis_result["meets_expectations"],
        "next_step": "shortlist" if analysis_result["meets_expectations"] else "negotiation"
    }


@app.post("/api/suppliers/{supplier_id}/negotiate")
def negotiate_with_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Step 10: Negotiation Agent with iterations"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Get cost analysis
    cost_analysis = db.query(CostAnalysis).filter(
        CostAnalysis.supplier_id == supplier_id
    ).order_by(CostAnalysis.created_at.desc()).first()
    
    if not cost_analysis:
        raise HTTPException(status_code=404, detail="Cost analysis not found")
    
    # Perform negotiation iterations
    negotiation_iterations = perform_negotiation_iterations(
        supplier, cost_analysis.total_cost, db
    )
    
    # Get final negotiated cost from last iteration
    if negotiation_iterations:
        final_iteration = negotiation_iterations[-1]
        final_cost = final_iteration["negotiated_cost"]
        
        # Update cost analysis with negotiated cost
        cost_analysis.proposed_cost = final_cost
        cost_analysis.total_cost = final_cost
        cost_analysis.savings = cost_analysis.current_supplier_cost - final_cost
        cost_analysis.savings_percentage = (cost_analysis.savings / cost_analysis.current_supplier_cost * 100) if cost_analysis.current_supplier_cost > 0 else 0
        cost_analysis.meets_expectations = cost_analysis.savings_percentage >= 5
        
        supplier.status = SupplierStatus.SHORTLISTED
        supplier.requirement.status = RequirementStatus.SHORTLISTED
        db.commit()
    
    return {
        "supplier_id": supplier_id,
        "negotiation_iterations": negotiation_iterations,
        "final_cost": negotiation_iterations[-1]["negotiated_cost"] if negotiation_iterations else cost_analysis.total_cost,
        "updated_cost_analysis": {
            "total_cost": cost_analysis.total_cost,
            "savings": cost_analysis.savings,
            "savings_percentage": cost_analysis.savings_percentage,
            "meets_expectations": cost_analysis.meets_expectations
        }
    }


@app.get("/api/suppliers/{supplier_id}/negotiation-iterations")
def get_negotiation_iterations(supplier_id: int, db: Session = Depends(get_db)):
    """Get all negotiation iterations for a supplier"""
    iterations = db.query(NegotiationIteration).filter(
        NegotiationIteration.supplier_id == supplier_id
    ).order_by(NegotiationIteration.iteration_number).all()
    
    return {
        "supplier_id": supplier_id,
        "iterations": [{
            "iteration": i.iteration_number,
            "proposed_cost": i.proposed_cost,
            "target_cost": i.target_cost,
            "outcome": i.outcome,
            "notes": i.notes,
            "strategy": i.negotiation_strategy,
            "created_at": i.created_at.isoformat()
        } for i in iterations]
    }


@app.post("/api/requirements/{requirement_id}/shortlist")
def create_shortlist(requirement_id: int, db: Session = Depends(get_db)):
    """Step 11: AI-curated supplier shortlist"""
    requirement = db.query(ProcurementRequirement).filter(
        ProcurementRequirement.id == requirement_id
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Get all quality-approved suppliers with cost analysis
    suppliers = db.query(Supplier).filter(
        Supplier.requirement_id == requirement_id,
        Supplier.status.in_([SupplierStatus.COST_ANALYZED, SupplierStatus.SHORTLISTED])
    ).all()
    
    # Prepare data for shortlist service
    suppliers_data = []
    for supplier in suppliers:
        cost_analysis = db.query(CostAnalysis).filter(
            CostAnalysis.supplier_id == supplier.id
        ).order_by(CostAnalysis.created_at.desc()).first()
        
        sample = db.query(Sample).filter(
            Sample.supplier_id == supplier.id
        ).order_by(Sample.received_date.desc()).first()
        
        suppliers_data.append({
            "id": supplier.id,
            "name": supplier.name,
            "quality_approved": sample.quality_approved if sample else False,
            "certifications": json.loads(supplier.certifications or "[]"),
            "total_cost": cost_analysis.total_cost if cost_analysis else 0,
            "savings": cost_analysis.savings if cost_analysis else 0,
            "savings_percentage": cost_analysis.savings_percentage if cost_analysis else 0,
            "response_received": supplier.status != SupplierStatus.DISCOVERED
        })
    
    # Create shortlist
    shortlist = shortlist_service.create_shortlist(suppliers_data)
    
    # Save shortlist to database
    for item in shortlist:
        db_shortlist = SupplierShortlist(
            requirement_id=requirement_id,
            supplier_id=item["supplier_id"],
            rank=item["rank"],
            integrated_score=item["integrated_score"],
            cost_score=item["cost_score"],
            quality_score=item["quality_score"],
            recommendation=item["recommendation"]
        )
        db.add(db_shortlist)
    
    requirement.status = RequirementStatus.SHORTLISTED
    db.commit()
    
    return {
        "requirement_id": requirement_id,
        "shortlist": shortlist,
        "status": requirement.status.value
    }


@app.post("/api/suppliers/{supplier_id}/onboard")
def start_onboarding(supplier_id: int, db: Session = Depends(get_db)):
    """Step 12: On-boarding and SRM Analysis (GenAI)"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    requirement = supplier.requirement
    
    # Perform SRM analysis
    srm_result = srm_service.analyze_srm(
        {
            "id": supplier.id,
            "name": supplier.name,
            "email": supplier.email,
            "certifications": json.loads(supplier.certifications or "[]")
        },
        {
            "id": requirement.id,
            "title": requirement.title,
            "description": requirement.description
        }
    )
    
    supplier.status = SupplierStatus.SHORTLISTED
    requirement.status = RequirementStatus.ONBOARDING
    db.commit()
    
    return {
        "supplier_id": supplier_id,
        "srm_analysis": srm_result,
        "status": requirement.status.value,
        "message": "Onboarding process initiated"
    }


@app.get("/api/requirements/{requirement_id}")
def get_requirement(requirement_id: int, db: Session = Depends(get_db)):
    """Get requirement with all related data"""
    requirement = db.query(ProcurementRequirement).filter(
        ProcurementRequirement.id == requirement_id
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    suppliers = db.query(Supplier).filter(
        Supplier.requirement_id == requirement_id
    ).all()
    
    suppliers_data = []
    for supplier in suppliers:
        sample = db.query(Sample).filter(
            Sample.supplier_id == supplier.id
        ).order_by(Sample.received_date.desc()).first()
        
        cost_analysis = db.query(CostAnalysis).filter(
            CostAnalysis.supplier_id == supplier.id
        ).order_by(CostAnalysis.created_at.desc()).first()
        
        # Get negotiation iterations
        negotiation_iterations = db.query(NegotiationIteration).filter(
            NegotiationIteration.supplier_id == supplier.id
        ).order_by(NegotiationIteration.iteration_number).all()
        
        suppliers_data.append({
            "id": supplier.id,
            "name": supplier.name,
            "status": supplier.status.value,
            "availability_scope": supplier.availability_scope,
            "selected_for_outreach": supplier.selected_for_outreach,
            "experience_years": supplier.experience_years,
            "quality_rating": supplier.quality_rating,
            "delivery_reliability": supplier.delivery_reliability,
            "price_competitiveness": supplier.price_competitiveness,
            "overall_score": supplier.overall_score,
            "sample": {
                "id": sample.id,
                "quantity": sample.quantity,
                "price_quoted": sample.price_quoted,
                "price_per_unit": round(sample.price_quoted / sample.quantity, 2) if sample and sample.quantity > 0 else 0,
                "quality_approved": sample.quality_approved,
                "address": sample.address
            } if sample else None,
            "cost_analysis": {
                "total_cost": cost_analysis.total_cost,
                "savings": cost_analysis.savings,
                "savings_percentage": cost_analysis.savings_percentage,
                "meets_expectations": cost_analysis.meets_expectations
            } if cost_analysis else None,
            "negotiation_iterations": [{
                "iteration": ni.iteration_number,
                "proposed_cost": ni.proposed_cost,
                "target_cost": ni.target_cost,
                "outcome": ni.outcome,
                "notes": ni.notes,
                "strategy": ni.negotiation_strategy
            } for ni in negotiation_iterations] if negotiation_iterations else []
        })
    
    return {
        "id": requirement.id,
        "title": requirement.title,
        "description": requirement.description,
        "status": requirement.status.value,
        "suppliers": suppliers_data
    }


@app.get("/api/requirements")
def list_requirements(db: Session = Depends(get_db)):
    """List all requirements"""
    requirements = db.query(ProcurementRequirement).all()
    return [{
        "id": r.id,
        "title": r.title,
        "status": r.status.value,
        "created_at": r.created_at.isoformat()
    } for r in requirements]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
