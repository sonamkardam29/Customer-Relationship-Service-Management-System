from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserOut

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "Website"
    industry: Optional[str] = None
    lead_status: str = "New"
    lead_score: int = 50
    expected_conversion_date: Optional[date] = None
    assigned_sales_id: Optional[int] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    industry: Optional[str] = None
    lead_status: Optional[str] = None
    lead_score: Optional[int] = None
    expected_conversion_date: Optional[date] = None
    assigned_sales_id: Optional[int] = None

class LeadConvertRequest(BaseModel):
    customer_type: str = "Enterprise"
    industry: Optional[str] = None
    location: Optional[str] = None

class LeadOut(LeadBase):
    id: int
    created_at: datetime
    updated_at: datetime
    conversion_date: Optional[datetime] = None
    customer_id: Optional[int] = None
    assigned_sales: Optional[UserOut] = None

    class Config:
        from_attributes = True
