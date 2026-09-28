import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SALES_EXECUTIVE = "sales_executive"
    SUPPORT_AGENT = "support_agent"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.SALES_EXECUTIVE.value)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customers = relationship("Customer", back_populates="assigned_sales", foreign_keys="Customer.assigned_sales_id")
    leads = relationship("Lead", back_populates="assigned_sales", foreign_keys="Lead.assigned_sales_id")
    activities = relationship("Activity", back_populates="assigned_user", foreign_keys="Activity.assigned_user_id")
    tickets = relationship("Ticket", back_populates="assigned_agent", foreign_keys="Ticket.assigned_agent_id")
    comments = relationship("TicketComment", back_populates="user")
