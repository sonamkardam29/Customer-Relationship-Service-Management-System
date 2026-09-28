from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models.activity import Activity
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.user import User
from app.schemas.user import UserOut
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityOut
from app.auth.deps import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])

def serialize_activity(a: Activity) -> dict:
    return {
        "id": a.id,
        "activity_type": a.activity_type,
        "subject": a.subject,
        "description": a.description,
        "due_date": a.due_date,
        "status": a.status,
        "customer_id": a.customer_id,
        "lead_id": a.lead_id,
        "assigned_user_id": a.assigned_user_id,
        "created_at": a.created_at,
        "assigned_user": UserOut.model_validate(a.assigned_user) if a.assigned_user else None,
        "customer_name": a.customer.full_name if a.customer else None,
        "lead_name": a.lead.name if a.lead else None
    }

@router.get("", response_model=dict)
def get_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    activity_type: Optional[str] = Query(None, alias="type"),
    customer_id: Optional[int] = Query(None),
    lead_id: Optional[int] = Query(None),
    assigned_user_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Activity)

    if current_user.role in ["sales_executive", "support_agent"]:
        query = query.filter(or_(Activity.assigned_user_id == current_user.id, Activity.assigned_user_id.is_(None)))

    if status_filter:
        query = query.filter(Activity.status == status_filter)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if customer_id:
        query = query.filter(Activity.customer_id == customer_id)
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if assigned_user_id:
        query = query.filter(Activity.assigned_user_id == assigned_user_id)

    total = query.count()
    offset = (page - 1) * limit
    activities = query.order_by(desc(Activity.due_date)).offset(offset).limit(limit).all()

    return {
        "items": [serialize_activity(a) for a in activities],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = Activity(
        activity_type=activity_in.activity_type,
        subject=activity_in.subject,
        description=activity_in.description,
        due_date=activity_in.due_date,
        status=activity_in.status,
        customer_id=activity_in.customer_id,
        lead_id=activity_in.lead_id,
        assigned_user_id=activity_in.assigned_user_id or current_user.id
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return serialize_activity(activity)

@router.put("/{activity_id}", response_model=dict)
def update_activity(
    activity_id: int,
    activity_in: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = activity_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)

    return serialize_activity(activity)
