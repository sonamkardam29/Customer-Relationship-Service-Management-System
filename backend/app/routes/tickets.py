from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.ticket import Ticket, TicketComment
from app.models.customer import Customer
from app.models.user import User
from app.schemas.user import UserOut
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut, TicketCommentCreate, TicketCommentOut
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/tickets", tags=["Tickets"])

def serialize_comment(c: TicketComment) -> dict:
    return {
        "id": c.id,
        "comment": c.comment,
        "created_at": c.created_at,
        "user_id": c.user_id,
        "user": UserOut.model_validate(c.user) if c.user else None
    }

def serialize_ticket(t: Ticket) -> dict:
    return {
        "id": t.id,
        "customer_id": t.customer_id,
        "subject": t.subject,
        "description": t.description,
        "category": t.category,
        "priority": t.priority,
        "status": t.status,
        "resolution_notes": t.resolution_notes,
        "assigned_agent_id": t.assigned_agent_id,
        "created_at": t.created_at,
        "updated_at": t.updated_at,
        "assigned_agent": UserOut.model_validate(t.assigned_agent) if t.assigned_agent else None,
        "customer_name": t.customer.full_name if t.customer else None,
        "customer_company": t.customer.company if t.customer else None,
        "comments": [serialize_comment(c) for c in (t.comments or [])]
    }

@router.get("", response_model=dict)
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    assigned_agent_id: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Ticket)

    # Role restriction: Support Agents see assigned tickets or unassigned
    if current_user.role == "support_agent":
        query = query.filter(or_(Ticket.assigned_agent_id == current_user.id, Ticket.assigned_agent_id.is_(None)))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.subject.ilike(search_fmt),
                Ticket.description.ilike(search_fmt),
                Ticket.resolution_notes.ilike(search_fmt)
            )
        )

    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if assigned_agent_id:
        query = query.filter(Ticket.assigned_agent_id == assigned_agent_id)

    total = query.count()

    sort_column = getattr(Ticket, sort_by, Ticket.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    offset = (page - 1) * limit
    tickets = query.offset(offset).limit(limit).all()

    return {
        "items": [serialize_ticket(t) for t in tickets],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == ticket_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    agent_id = ticket_in.assigned_agent_id
    if agent_id is None and current_user.role == "support_agent":
        agent_id = current_user.id

    ticket = Ticket(
        customer_id=ticket_in.customer_id,
        subject=ticket_in.subject,
        description=ticket_in.description,
        category=ticket_in.category,
        priority=ticket_in.priority,
        status=ticket_in.status,
        resolution_notes=ticket_in.resolution_notes,
        assigned_agent_id=agent_id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return serialize_ticket(ticket)

@router.get("/{ticket_id}", response_model=dict)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return serialize_ticket(ticket)

@router.put("/{ticket_id}", response_model=dict)
def update_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "support_agent"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = ticket_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)

    return serialize_ticket(ticket)

@router.post("/{ticket_id}/comments", response_model=TicketCommentOut, status_code=status.HTTP_201_CREATED)
def add_ticket_comment(
    ticket_id: int,
    comment_in: TicketCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        comment=comment_in.comment
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
