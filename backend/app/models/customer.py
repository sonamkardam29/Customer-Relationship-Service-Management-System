from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    company = Column(String(120), nullable=True)
    industry = Column(String(80), nullable=True)
    location = Column(String(120), nullable=True)
    customer_type = Column(String(50), default="Enterprise")  # Enterprise, SMB, Retail, VIP
    status = Column(String(50), default="Active")  # Active, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_sales_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_sales = relationship("User", back_populates="customers", foreign_keys=[assigned_sales_id])

    leads = relationship("Lead", back_populates="customer", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="customer", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="customer", cascade="all, delete-orphan")
