from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.ticket import Ticket
from app.models.activity import Activity
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.auth.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=dict)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total counts
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    qualified_leads = db.query(func.count(Lead.id)).filter(Lead.lead_status == "Qualified").scalar() or 0
    converted_leads = db.query(func.count(Lead.id)).filter(Lead.lead_status == "Converted").scalar() or 0
    
    open_tickets = db.query(func.count(Ticket.id)).filter(Ticket.status.in_(["Open", "In Progress", "Pending Customer"])).scalar() or 0
    resolved_tickets = db.query(func.count(Ticket.id)).filter(Ticket.status.in_(["Resolved", "Closed"])).scalar() or 0
    high_priority_tickets = db.query(func.count(Ticket.id)).filter(Ticket.priority.in_(["High", "Critical"])).scalar() or 0
    total_activities = db.query(func.count(Activity.id)).scalar() or 0

    # Leads by Status breakdown
    leads_status_q = db.query(Lead.lead_status, func.count(Lead.id)).group_by(Lead.lead_status).all()
    leads_by_status = [{"name": status, "value": count} for status, count in leads_status_q]

    # Tickets by Priority breakdown
    tickets_prio_q = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    tickets_by_priority = [{"name": prio, "value": count} for prio, count in tickets_prio_q]

    # Tickets by Status breakdown
    tickets_stat_q = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    tickets_by_status = [{"name": stat, "value": count} for stat, count in tickets_stat_q]

    # Customer Growth metric (Sample aggregated by month/type)
    customer_growth = [
        {"month": "May", "count": max(1, total_customers - 8)},
        {"month": "Jun", "count": max(2, total_customers - 6)},
        {"month": "Jul", "count": max(3, total_customers - 4)},
        {"month": "Aug", "count": max(5, total_customers - 2)},
        {"month": "Sep", "count": total_customers}
    ]

    # Recent Activities Feed
    recent_acts = db.query(Activity).order_by(Activity.due_date.desc()).limit(7).all()
    activities_feed = []
    for a in recent_acts:
        activities_feed.append({
            "id": a.id,
            "type": a.activity_type,
            "subject": a.subject,
            "due_date": a.due_date.strftime("%Y-%m-%d %H:%M") if a.due_date else None,
            "status": a.status,
            "customer_name": a.customer.full_name if a.customer else (a.lead.name if a.lead else "General"),
            "assigned_user": a.assigned_user.name if a.assigned_user else "Unassigned"
        })

    return {
        "kpis": {
            "total_customers": total_customers,
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "converted_leads": converted_leads,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "high_priority_tickets": high_priority_tickets,
            "total_activities": total_activities
        },
        "leads_by_status": leads_by_status,
        "tickets_by_priority": tickets_by_priority,
        "tickets_by_status": tickets_by_status,
        "customer_growth": customer_growth,
        "recent_activities": activities_feed
    }
