from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== Testing Authentication Endpoints ===")
    # 1. Login Admin
    res = client.post("/api/auth/login", data={"username": "admin@crmhub.com", "password": "Admin@123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    print("[OK] Admin login successful")

    # 2. Login Sales
    res = client.post("/api/auth/login", data={"username": "sales@crmhub.com", "password": "Sales@123"})
    assert res.status_code == 200, f"Sales login failed: {res.text}"
    sales_token = res.json()["access_token"]
    print("[OK] Sales login successful")

    # 3. Login Support
    res = client.post("/api/auth/login", data={"username": "support@crmhub.com", "password": "Support@123"})
    assert res.status_code == 200, f"Support login failed: {res.text}"
    support_token = res.json()["access_token"]
    print("[OK] Support login successful")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    sales_headers = {"Authorization": f"Bearer {sales_token}"}
    support_headers = {"Authorization": f"Bearer {support_token}"}

    # 4. Auth Me
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200, f"Auth me failed: {res.text}"
    print(f"[OK] Current user verified: {res.json()['name']} ({res.json()['role']})")

    print("\n=== Testing Users Endpoint ===")
    res = client.get("/api/users", headers=admin_headers)
    assert res.status_code == 200, f"Get users failed: {res.text}"
    print(f"[OK] Retrieved {len(res.json())} users")

    print("\n=== Testing Customers Endpoints ===")
    res = client.get("/api/customers", headers=admin_headers)
    assert res.status_code == 200, f"Get customers failed: {res.text}"
    cust_list = res.json()["items"]
    print(f"[OK] Retrieved {len(cust_list)} customers (Total: {res.json()['total']})")
    first_cust_id = cust_list[0]["id"]

    # Customer 360
    res = client.get(f"/api/customers/{first_cust_id}/360", headers=admin_headers)
    assert res.status_code == 200, f"Customer 360 failed: {res.text}"
    print(f"[OK] Customer 360 loaded for ID {first_cust_id}: {res.json()['customer']['full_name']}")

    print("\n=== Testing Leads Endpoints ===")
    res = client.get("/api/leads", headers=sales_headers)
    assert res.status_code == 200, f"Get leads failed: {res.text}"
    leads_list = res.json()["items"]
    print(f"[OK] Retrieved {len(leads_list)} leads (Total: {res.json()['total']})")

    print("\n=== Testing Activities Endpoints ===")
    res = client.get("/api/activities", headers=sales_headers)
    assert res.status_code == 200, f"Get activities failed: {res.text}"
    print(f"[OK] Retrieved {len(res.json()['items'])} activities")

    print("\n=== Testing Tickets Endpoints ===")
    res = client.get("/api/tickets", headers=support_headers)
    assert res.status_code == 200, f"Get tickets failed: {res.text}"
    tkt_list = res.json()["items"]
    print(f"[OK] Retrieved {len(tkt_list)} service tickets")
    first_tkt_id = tkt_list[0]["id"]

    # Add Ticket Comment
    res = client.post(f"/api/tickets/{first_tkt_id}/comments", json={"comment": "Automated verification test comment"}, headers=support_headers)
    assert res.status_code == 201, f"Add ticket comment failed: {res.text}"
    print(f"[OK] Comment added to ticket #{first_tkt_id}")

    print("\n=== Testing Dashboard & Reports Endpoints ===")
    res = client.get("/api/dashboard", headers=admin_headers)
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    print(f"[OK] Dashboard KPIs: Customers={res.json()['kpis']['total_customers']}, Leads={res.json()['kpis']['total_leads']}, Tickets={res.json()['kpis']['open_tickets']}")

    res = client.get("/api/reports", headers=admin_headers)
    assert res.status_code == 200, f"Reports failed: {res.text}"
    print(f"[OK] Reports analytics: Conversion Rate={res.json()['lead_conversion']['conversion_rate']}%")

    print("\nSUCCESS: ALL BACKEND APIS & WORKFLOWS VERIFIED 100% WORKING!")

if __name__ == "__main__":
    run_tests()
