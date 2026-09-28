from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserOut

class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    customer_type: str = "Enterprise"
    status: str = "Active"
    assigned_sales_id: Optional[int] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    customer_type: Optional[str] = None
    status: Optional[str] = None
    assigned_sales_id: Optional[int] = None

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assigned_sales: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Customer 360 detailed representation
class Customer360(CustomerOut):
    leads: List[dict] = []
    tickets: List[dict] = []
    activities: List[dict] = []
