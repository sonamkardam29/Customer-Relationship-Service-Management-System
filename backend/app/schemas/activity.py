from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserOut

class ActivityBase(BaseModel):
    activity_type: str  # Call, Email, Meeting, Follow-up, Demo
    subject: str
    description: Optional[str] = None
    due_date: datetime
    status: str = "Pending"  # Pending, Completed, Cancelled
    customer_id: Optional[int] = None
    lead_id: Optional[int] = None
    assigned_user_id: int

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    assigned_user_id: Optional[int] = None

class ActivityOut(ActivityBase):
    id: int
    created_at: datetime
    assigned_user: Optional[UserOut] = None
    customer_name: Optional[str] = None
    lead_name: Optional[str] = None

    class Config:
        from_attributes = True
