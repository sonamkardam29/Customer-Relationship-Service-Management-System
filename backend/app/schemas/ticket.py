from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.user import UserOut

class TicketCommentBase(BaseModel):
    comment: str

class TicketCommentCreate(TicketCommentBase):
    pass

class TicketCommentOut(TicketCommentBase):
    id: int
    created_at: datetime
    user_id: int
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    customer_id: int
    subject: str
    description: str
    category: str = "Technical"  # Technical, Billing, Account, General, Other
    priority: str = "Medium"      # Low, Medium, High, Critical
    status: str = "Open"          # Open, In Progress, Pending Customer, Resolved, Closed
    assigned_agent_id: Optional[int] = None
    resolution_notes: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    resolution_notes: Optional[str] = None

class TicketOut(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assigned_agent: Optional[UserOut] = None
    customer_name: Optional[str] = None
    customer_company: Optional[str] = None
    comments: List[TicketCommentOut] = []

    class Config:
        from_attributes = True
