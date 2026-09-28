from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.ticket import Ticket
from app.models.activity import Activity
from app.models.user import User
from app.auth.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=dict)
def get_reports_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    assigned_user_id: Optional[int] = Query(None)
):
    # 1. Lead Conversion Analytics
    lead_query = db.query(Lead)
    if assigned_user_id:
        lead_query = lead_query.filter(Lead.assigned_sales_id == assigned_user_id)
    
    total_leads = lead_query.count()
    converted_leads = lead_query.filter(Lead.lead_status == "Converted").count()
    conversion_rate = round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0.0

    leads_by_source_q = db.query(Lead.source, func.count(Lead.id)).group_by(Lead.source).all()
    leads_by_source = [{"source": src or "Unknown", "count": count} for src, count in leads_by_source_q]

    # 2. Customer Acquisition by Industry & Type
    cust_query = db.query(Customer)
    if assigned_user_id:
        cust_query = cust_query.filter(Customer.assigned_sales_id == assigned_user_id)

    by_industry_q = db.query(Customer.industry, func.count(Customer.id)).group_by(Customer.industry).all()
    by_industry = [{"industry": ind or "General", "count": count} for ind, count in by_industry_q]

    by_type_q = db.query(Customer.customer_type, func.count(Customer.id)).group_by(Customer.customer_type).all()
    by_type = [{"type": t or "Standard", "count": count} for t, count in by_type_q]

    # 3. Ticket Resolution Performance
    tkt_query = db.query(Ticket)
    if assigned_user_id:
        tkt_query = tkt_query.filter(Ticket.assigned_agent_id == assigned_user_id)

    total_tickets = tkt_query.count()
    resolved_tickets = tkt_query.filter(Ticket.status.in_(["Resolved", "Closed"])).count()
    resolution_rate = round((resolved_tickets / total_tickets * 100), 1) if total_tickets > 0 else 0.0

    tickets_by_cat_q = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    tickets_by_category = [{"category": cat, "count": count} for cat, count in tickets_by_cat_q]

    tickets_by_prio_q = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    tickets_by_priority = [{"priority": prio, "count": count} for prio, count in tickets_by_prio_q]

    # 4. Sales & Support Activity Summary
    act_query = db.query(Activity)
    if assigned_user_id:
        act_query = act_query.filter(Activity.assigned_user_id == assigned_user_id)

    activities_by_type_q = db.query(Activity.activity_type, func.count(Activity.id)).group_by(Activity.activity_type).all()
    activities_by_type = [{"type": typ, "count": count} for typ, count in activities_by_type_q]

    activities_by_status_q = db.query(Activity.status, func.count(Activity.id)).group_by(Activity.status).all()
    activities_by_status = [{"status": stat, "count": count} for stat, count in activities_by_status_q]

    return {
        "lead_conversion": {
            "total_leads": total_leads,
            "converted_leads": converted_leads,
            "conversion_rate": conversion_rate,
            "by_source": leads_by_source
        },
        "customer_acquisition": {
            "by_industry": by_industry,
            "by_type": by_type
        },
        "ticket_resolution": {
            "total_tickets": total_tickets,
            "resolved_tickets": resolved_tickets,
            "resolution_rate": resolution_rate,
            "by_category": tickets_by_category,
            "by_priority": tickets_by_priority
        },
        "sales_activity": {
            "by_type": activities_by_type,
            "by_status": activities_by_status
        }
    }
