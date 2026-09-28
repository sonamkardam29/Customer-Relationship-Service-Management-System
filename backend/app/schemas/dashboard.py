from typing import List, Dict, Any
from pydantic import BaseModel

class DashboardKpis(BaseModel):
    total_customers: int
    total_leads: int
    qualified_leads: int
    converted_leads: int
    open_tickets: int
    resolved_tickets: int
    high_priority_tickets: int
    total_activities: int

class StatusCount(BaseModel):
    name: str
    value: int

class CustomerGrowthMetric(BaseModel):
    month: str
    count: int

class DashboardSummary(BaseModel):
    kpis: DashboardKpis
    leads_by_status: List[StatusCount]
    tickets_by_priority: List[StatusCount]
    tickets_by_status: List[StatusCount]
    customer_growth: List[CustomerGrowthMetric]
    recent_activities: List[Dict[str, Any]]
