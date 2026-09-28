from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    email = Column(String(120), nullable=False)
    phone = Column(String(30), nullable=True)
    company = Column(String(120), nullable=True)
    source = Column(String(80), default="Website")  # Website, Referral, Event, Partner, Cold Call
    industry = Column(String(80), nullable=True)
    lead_status = Column(String(50), default="New")  # New, Contacted, Qualified, Proposal, Converted, Lost
    lead_score = Column(Integer, default=50)
    expected_conversion_date = Column(Date, nullable=True)
    conversion_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_sales_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_sales = relationship("User", back_populates="leads", foreign_keys=[assigned_sales_id])

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer", back_populates="leads")

    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
