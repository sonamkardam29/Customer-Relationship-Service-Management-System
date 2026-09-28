from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.models.lead import Lead
from app.models.ticket import Ticket
from app.models.activity import Activity
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=dict)
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None),
    customer_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    assigned_sales_id: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Customer)

    # Role-based restriction: Sales Executives only see assigned customers or unassigned
    if current_user.role == "sales_executive":
        query = query.filter(or_(Customer.assigned_sales_id == current_user.id, Customer.assigned_sales_id.is_(None)))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_fmt),
                Customer.email.ilike(search_fmt),
                Customer.company.ilike(search_fmt),
                Customer.industry.ilike(search_fmt),
                Customer.location.ilike(search_fmt)
            )
        )

    if customer_type:
        query = query.filter(Customer.customer_type == customer_type)
    if status_filter:
        query = query.filter(Customer.status == status_filter)
    if assigned_sales_id:
        query = query.filter(Customer.assigned_sales_id == assigned_sales_id)

    total = query.count()

    # Sorting
    sort_column = getattr(Customer, sort_by, Customer.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    offset = (page - 1) * limit
    customers = query.offset(offset).limit(limit).all()

    return {
        "items": [CustomerOut.model_validate(c) for c in customers],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    existing = db.query(Customer).filter(Customer.email == customer_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A customer with this email already exists.")
    
    # Default sales assignment to creator if not specified
    sales_id = customer_in.assigned_sales_id
    if sales_id is None and current_user.role == "sales_executive":
        sales_id = current_user.id

    customer = Customer(
        full_name=customer_in.full_name,
        email=customer_in.email.lower().strip(),
        phone=customer_in.phone,
        company=customer_in.company,
        industry=customer_in.industry,
        location=customer_in.location,
        customer_type=customer_in.customer_type,
        status=customer_in.status,
        assigned_sales_id=sales_id
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/{customer_id}/360", response_model=dict)
def get_customer_360(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    leads = db.query(Lead).filter(Lead.customer_id == customer_id).all()
    tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).order_by(Ticket.created_at.desc()).all()
    activities = db.query(Activity).filter(Activity.customer_id == customer_id).order_by(Activity.due_date.desc()).all()

    return {
        "customer": CustomerOut.model_validate(customer),
        "leads": [
            {
                "id": l.id, "name": l.name, "company": l.company, "status": l.lead_status,
                "score": l.lead_score, "created_at": l.created_at
            } for l in leads
        ],
        "tickets": [
            {
                "id": t.id, "subject": t.subject, "category": t.category, "priority": t.priority,
                "status": t.status, "assigned_agent": t.assigned_agent.name if t.assigned_agent else "Unassigned",
                "created_at": t.created_at
            } for t in tickets
        ],
        "activities": [
            {
                "id": a.id, "type": a.activity_type, "subject": a.subject, "status": a.status,
                "due_date": a.due_date, "assigned_user": a.assigned_user.name if a.assigned_user else "Unassigned"
            } for a in activities
        ]
    }

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer_in.email and customer_in.email.lower().strip() != customer.email:
        existing = db.query(Customer).filter(Customer.email == customer_in.email.lower().strip()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email address is already in use by another customer.")
        customer.email = customer_in.email.lower().strip()

    update_data = customer_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key != "email":
            setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None
