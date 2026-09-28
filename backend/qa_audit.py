from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_qa_audit():
    print("==================================================")
    print("      FINAL COMPREHENSIVE QA AUDIT SUITE          ")
    print("==================================================")

    # 1. AUTHENTICATION MODULE
    print("\n[1] Testing Authentication & Token Handling...")
    bad_login = client.post("/api/auth/login", data={"username": "bad@crmhub.com", "password": "WrongPassword"})
    assert bad_login.status_code == 401, f"Expected 401, got {bad_login.status_code}"
    print(" [OK] Invalid credentials correctly rejected (401)")

    admin_login = client.post("/api/auth/login", data={"username": "admin@crmhub.com", "password": "Admin@123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" [OK] Admin authentication token issued")

    sales_login = client.post("/api/auth/login", data={"username": "sales@crmhub.com", "password": "Sales@123"})
    assert sales_login.status_code == 200
    sales_token = sales_login.json()["access_token"]
    sales_headers = {"Authorization": f"Bearer {sales_token}"}
    print(" [OK] Sales Executive token issued")

    support_login = client.post("/api/auth/login", data={"username": "support@crmhub.com", "password": "Support@123"})
    assert support_login.status_code == 200
    support_token = support_login.json()["access_token"]
    support_headers = {"Authorization": f"Bearer {support_token}"}
    print(" [OK] Support Agent token issued")

    me = client.get("/api/auth/me", headers=admin_headers)
    assert me.status_code == 200
    assert me.json()["role"] == "admin"
    print(" [OK] GET /api/auth/me verified for active session")

    # 2. ROLE-BASED ACCESS CONTROL (RBAC)
    print("\n[2] Auditing Role-Based Access Control (RBAC)...")
    u_list = client.get("/api/users", headers=admin_headers)
    assert u_list.status_code == 200
    print(" [OK] Admin allowed access to User Roster")

    forbidden_user = client.post("/api/users", json={
        "name": "Hacker User", "email": "hacker@crmhub.com", "password": "Password123", "role": "admin"
    }, headers=support_headers)
    assert forbidden_user.status_code == 403
    print(" [OK] Support Agent denied user creation (403 Forbidden)")

    forbidden_del = client.delete("/api/customers/1", headers=support_headers)
    assert forbidden_del.status_code == 403
    print(" [OK] Support Agent denied customer deletion (403 Forbidden)")

    # 3. CUSTOMER MANAGEMENT & 360
    print("\n[3] Auditing Customer Management & Customer 360 View...")
    dup_cust = client.post("/api/customers", json={
        "full_name": "Duplicate Test",
        "email": "eleanor.vance@jpmorgan.com",
        "customer_type": "Enterprise",
        "status": "Active"
    }, headers=sales_headers)
    assert dup_cust.status_code == 400
    print(" [OK] Duplicate customer email validation enforced (400 Bad Request)")

    new_cust = client.post("/api/customers", json={
        "full_name": "QA Audit Test Bank",
        "email": "qa.testbank@finance.com",
        "phone": "+1 (555) 999-0000",
        "company": "QA Test Corp",
        "industry": "Commercial Banking",
        "location": "New York, USA",
        "customer_type": "Enterprise",
        "status": "Active"
    }, headers=sales_headers)
    assert new_cust.status_code == 201
    cust_id = new_cust.json()["id"]
    print(f" [OK] Created Customer record ID #{cust_id}")

    c360 = client.get(f"/api/customers/{cust_id}/360", headers=admin_headers)
    assert c360.status_code == 200
    assert "customer" in c360.json()
    assert "tickets" in c360.json()
    assert "activities" in c360.json()
    print(" [OK] Customer 360 profile payload verified")

    up_cust = client.put(f"/api/customers/{cust_id}", json={"company": "QA Test Corp Updated"}, headers=sales_headers)
    assert up_cust.status_code == 200
    assert up_cust.json()["company"] == "QA Test Corp Updated"
    print(" [OK] Customer update persisted")

    # 4. LEAD MANAGEMENT & CONVERSION WORKFLOW
    print("\n[4] Auditing Lead Pipeline & Conversion Workflow...")
    new_lead = client.post("/api/leads", json={
        "name": "QA Opportunity Prospect",
        "email": "qa.lead@prospect.com",
        "phone": "+1 (555) 888-1111",
        "company": "Prospect Tech Ltd",
        "source": "Website",
        "industry": "FinTech",
        "lead_status": "Qualified",
        "lead_score": 88
    }, headers=sales_headers)
    assert new_lead.status_code == 201
    lead_id = new_lead.json()["id"]
    print(f" [OK] Created Lead ID #{lead_id} at stage 'Qualified'")

    adv_lead = client.put(f"/api/leads/{lead_id}", json={"lead_status": "Proposal"}, headers=sales_headers)
    assert adv_lead.status_code == 200
    assert adv_lead.json()["lead_status"] == "Proposal"
    print(" [OK] Lead status advanced to 'Proposal'")

    conv_res = client.post(f"/api/leads/{lead_id}/convert", json={
        "customer_type": "Enterprise",
        "industry": "FinTech",
        "location": "San Francisco, USA"
    }, headers=sales_headers)
    assert conv_res.status_code == 200
    assert "customer_id" in conv_res.json()
    print(f" [OK] Lead #{lead_id} converted to Customer Account #{conv_res.json()['customer_id']}")

    re_conv = client.post(f"/api/leads/{lead_id}/convert", json={}, headers=sales_headers)
    assert re_conv.status_code == 400
    print(" [OK] Double conversion blocked (400 Bad Request)")

    # 5. ACTIVITIES
    print("\n[5] Auditing Activities & Follow-up Tracking...")
    new_act = client.post("/api/activities", json={
        "activity_type": "Call",
        "subject": "QA Follow-up Discovery Call",
        "description": "Scoping technical SLA requirements.",
        "due_date": "2026-10-01T10:00:00",
        "status": "Pending",
        "customer_id": cust_id,
        "assigned_user_id": 2
    }, headers=sales_headers)
    assert new_act.status_code == 201
    act_id = new_act.json()["id"]
    print(f" [OK] Scheduled Activity ID #{act_id}")

    toggle_act = client.put(f"/api/activities/{act_id}", json={"status": "Completed"}, headers=sales_headers)
    assert toggle_act.status_code == 200
    assert toggle_act.json()["status"] == "Completed"
    print(" [OK] Activity status toggled to 'Completed'")

    # 6. SERVICE TICKETS & COMMENTS TIMELINE
    print("\n[6] Auditing Service Ticket Case Management...")
    new_tkt = client.post("/api/tickets", json={
        "customer_id": cust_id,
        "subject": "QA Payment Gateway Latency Issue",
        "description": "API requests timing out during peak morning processing.",
        "category": "Technical",
        "priority": "Critical",
        "status": "Open"
    }, headers=support_headers)
    assert new_tkt.status_code == 201
    tkt_id = new_tkt.json()["id"]
    print(f" [OK] Opened Service Ticket ID #{tkt_id}")

    comm_res = client.post(f"/api/tickets/{tkt_id}/comments", json={
        "comment": "Support engineering is analyzing load balancer trace logs."
    }, headers=support_headers)
    assert comm_res.status_code == 201
    print(" [OK] Post comment to ticket timeline verified")

    res_tkt = client.put(f"/api/tickets/{tkt_id}", json={
        "status": "Resolved",
        "resolution_notes": "Patched connection pool timeout config in Gateway Service v1.4.3."
    }, headers=support_headers)
    assert res_tkt.status_code == 200
    assert res_tkt.json()["status"] == "Resolved"
    print(" [OK] Case status updated to 'Resolved' with resolution notes")

    # 7. DASHBOARD & ANALYTICS REPORTS
    print("\n[7] Auditing Dashboard & Analytics Reporting Engine...")
    dash = client.get("/api/dashboard", headers=admin_headers)
    assert dash.status_code == 200
    d_data = dash.json()
    assert d_data["kpis"]["total_customers"] > 0
    assert len(d_data["leads_by_status"]) > 0
    assert len(d_data["tickets_by_priority"]) > 0
    print(f" [OK] Real-time Dashboard KPIs verified (Total Customers: {d_data['kpis']['total_customers']})")

    rep = client.get("/api/reports", headers=admin_headers)
    assert rep.status_code == 200
    r_data = rep.json()
    assert "lead_conversion" in r_data
    assert "ticket_resolution" in r_data
    print(f" [OK] Executive Reports analytics calculated (Conversion Rate: {r_data['lead_conversion']['conversion_rate']}%)")

    # 8. CLEANUP AUDIT CREATED TEST DATA
    print("\n[8] Cleaning up QA test records...")
    del_c = client.delete(f"/api/customers/{cust_id}", headers=admin_headers)
    assert del_c.status_code == 204
    print(" [OK] Test customer record cleaned up")

    print("\n==================================================")
    print("  QA AUDIT SUITE COMPLETED 100% SUCCESSFULLY!     ")
    print("==================================================")

if __name__ == "__main__":
    run_qa_audit()
