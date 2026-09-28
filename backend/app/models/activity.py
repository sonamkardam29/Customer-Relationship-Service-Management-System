from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50), nullable=False)  # Call, Email, Meeting, Follow-up, Demo
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="Pending")  # Pending, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer", back_populates="activities")

    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    lead = relationship("Lead", back_populates="activities")

    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_user = relationship("User", back_populates="activities", foreign_keys=[assigned_user_id])
