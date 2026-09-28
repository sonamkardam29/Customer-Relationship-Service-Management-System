from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.customers import router as customers_router
from app.routes.leads import router as leads_router
from app.routes.activities import router as activities_router
from app.routes.tickets import router as tickets_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router

__all__ = [
    "auth_router", "users_router", "customers_router", "leads_router",
    "activities_router", "tickets_router", "dashboard_router", "reports_router"
]
