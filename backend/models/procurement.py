from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class RequirementStatus(str, enum.Enum):
    DRAFT = "draft"
    SCOUTING = "scouting"
    OUTREACH = "outreach"
    SAMPLING = "sampling"
    QUALITY_REVIEW = "quality_review"
    COST_ANALYSIS = "cost_analysis"
    NEGOTIATION = "negotiation"
    SHORTLISTED = "shortlisted"
    ONBOARDING = "onboarding"
    COMPLETED = "completed"
    REJECTED = "rejected"


class SupplierStatus(str, enum.Enum):
    DISCOVERED = "discovered"
    CONTACTED = "contacted"
    RESPONDED = "responded"
    SAMPLE_REQUESTED = "sample_requested"
    SAMPLE_RECEIVED = "sample_received"
    QUALITY_APPROVED = "quality_approved"
    QUALITY_REJECTED = "quality_rejected"
    COST_ANALYZED = "cost_analyzed"
    NEGOTIATING = "negotiating"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"


class ProcurementRequirement(Base):
    __tablename__ = "procurement_requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    required_certifications = Column(Text)  # JSON string of certifications
    deadline = Column(DateTime)
    status = Column(SQLEnum(RequirementStatus), default=RequirementStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    suppliers = relationship("Supplier", back_populates="requirement")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("procurement_requirements.id"))
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    company = Column(String)
    website = Column(String)
    certifications = Column(Text)  # JSON string
    availability_scope = Column(Boolean, default=None)  # None = not checked, True = available, False = not available
    status = Column(SQLEnum(SupplierStatus), default=SupplierStatus.DISCOVERED)
    contact_method = Column(String)  # "email", "phone", "social_media"
    last_contacted = Column(DateTime)
    notes = Column(Text)
    # Supplier metrics for selection
    experience_years = Column(Integer, default=0)
    quality_rating = Column(Float, default=0.0)  # 0-5 scale
    delivery_reliability = Column(Float, default=0.0)  # 0-100 percentage
    price_competitiveness = Column(Float, default=0.0)  # 0-100 score
    overall_score = Column(Float, default=0.0)  # Calculated score
    selected_for_outreach = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requirement = relationship("ProcurementRequirement", back_populates="suppliers")
    samples = relationship("Sample", back_populates="supplier")
    cost_analyses = relationship("CostAnalysis", back_populates="supplier")


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    received_date = Column(DateTime)
    quantity = Column(Float)
    address = Column(String)
    price_quoted = Column(Float)
    quality_approved = Column(Boolean, default=None)  # None = pending, True = approved, False = rejected
    quality_notes = Column(Text)
    quality_reviewed_by = Column(String)
    quality_reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="samples")


class CostAnalysis(Base):
    __tablename__ = "cost_analyses"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    current_supplier_cost = Column(Float)
    proposed_cost = Column(Float)
    warehouse_locations = Column(Text)  # JSON string
    transportation_cost = Column(Float)
    total_cost = Column(Float)
    savings = Column(Float)
    savings_percentage = Column(Float)
    meets_expectations = Column(Boolean, default=None)  # None = not evaluated, True = meets, False = doesn't meet
    analysis_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="cost_analyses")


class SupplierShortlist(Base):
    __tablename__ = "supplier_shortlists"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("procurement_requirements.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    rank = Column(Integer)
    integrated_score = Column(Float)  # Combined cost & quality score
    cost_score = Column(Float)
    quality_score = Column(Float)
    recommendation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    requirement = relationship("ProcurementRequirement")
    supplier = relationship("Supplier")


class NegotiationIteration(Base):
    __tablename__ = "negotiation_iterations"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    iteration_number = Column(Integer, nullable=False)
    proposed_cost = Column(Float)
    target_cost = Column(Float)
    negotiation_strategy = Column(Text)
    outcome = Column(String)  # "success", "partial_success", "rejected"
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier")

