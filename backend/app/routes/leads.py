from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut, LeadConvertRequest
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("", response_model=dict)
def get_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    source: Optional[str] = Query(None),
    assigned_sales_id: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Lead)

    if current_user.role == "sales_executive":
        query = query.filter(or_(Lead.assigned_sales_id == current_user.id, Lead.assigned_sales_id.is_(None)))

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Lead.name.ilike(search_fmt),
                Lead.email.ilike(search_fmt),
                Lead.company.ilike(search_fmt),
                Lead.industry.ilike(search_fmt)
            )
        )

    if status_filter:
        query = query.filter(Lead.lead_status == status_filter)
    if source:
        query = query.filter(Lead.source == source)
    if assigned_sales_id:
        query = query.filter(Lead.assigned_sales_id == assigned_sales_id)

    total = query.count()

    sort_column = getattr(Lead, sort_by, Lead.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    offset = (page - 1) * limit
    leads = query.offset(offset).limit(limit).all()

    return {
        "items": [LeadOut.model_validate(l) for l in leads],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    sales_id = lead_in.assigned_sales_id
    if sales_id is None and current_user.role == "sales_executive":
        sales_id = current_user.id

    lead = Lead(
        name=lead_in.name,
        email=lead_in.email.lower().strip(),
        phone=lead_in.phone,
        company=lead_in.company,
        source=lead_in.source,
        industry=lead_in.industry,
        lead_status=lead_in.lead_status,
        lead_score=lead_in.lead_score,
        expected_conversion_date=lead_in.expected_conversion_date,
        assigned_sales_id=sales_id
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)

    db.commit()
    db.refresh(lead)
    return lead

@router.post("/{lead_id}/convert", response_model=dict)
def convert_lead(
    lead_id: int,
    convert_in: LeadConvertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.lead_status == "Converted":
        raise HTTPException(status_code=400, detail="Lead is already converted")

    # Check if customer already exists for this email
    existing_customer = db.query(Customer).filter(Customer.email == lead.email).first()
    if not existing_customer:
        customer = Customer(
            full_name=lead.name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            industry=convert_in.industry or lead.industry or "Financial Services",
            location=convert_in.location or "New York, USA",
            customer_type=convert_in.customer_type,
            status="Active",
            assigned_sales_id=lead.assigned_sales_id or current_user.id
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    else:
        customer = existing_customer

    lead.lead_status = "Converted"
    lead.conversion_date = datetime.utcnow()
    lead.customer_id = customer.id
    db.commit()
    db.refresh(lead)

    return {
        "message": "Lead converted successfully to Customer!",
        "lead_id": lead.id,
        "customer_id": customer.id,
        "customer_name": customer.full_name
    }

@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "sales_executive"]))
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    return None
