from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models import User, UserRole, Customer, Lead, Activity, Ticket, TicketComment
from app.auth.security import get_password_hash

def seed_database():
    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users already exist
        if db.query(User).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding CRM & Service Management System database with realistic enterprise banking data...")

        # 1. Create Users
        admin_user = User(
            name="Alexander Vance (Admin)",
            email="admin@crmhub.com",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN.value,
            phone="+1 (555) 019-2831",
            is_active=True
        )

        sales_user = User(
            name="Samantha Reed (Sales Exec)",
            email="sales@crmhub.com",
            password_hash=get_password_hash("Sales@123"),
            role=UserRole.SALES_EXECUTIVE.value,
            phone="+1 (555) 014-8821",
            is_active=True
        )

        support_user = User(
            name="David Miller (Support Agent)",
            email="support@crmhub.com",
            password_hash=get_password_hash("Support@123"),
            role=UserRole.SUPPORT_AGENT.value,
            phone="+1 (555) 017-9932",
            is_active=True
        )

        db.add_all([admin_user, sales_user, support_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(sales_user)
        db.refresh(support_user)

        # 2. Create Enterprise Banking Customers (12 Customers)
        customers_data = [
            {
                "full_name": "Eleanor Vance",
                "email": "eleanor.vance@jpmorgan.com",
                "phone": "+1 (212) 555-0101",
                "company": "JPMorgan Chase & Co.",
                "industry": "Investment Banking",
                "location": "New York, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Marcus Sterling",
                "email": "m.sterling@goldmansachs.com",
                "phone": "+1 (212) 555-0102",
                "company": "Goldman Sachs Group",
                "industry": "Asset Management",
                "location": "New York, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Catherine Howard",
                "email": "choward@barclays.co.uk",
                "phone": "+44 20 7116 1000",
                "company": "Barclays Capital",
                "industry": "Retail & Commercial Banking",
                "location": "London, UK",
                "customer_type": "VIP",
                "status": "Active"
            },
            {
                "full_name": "Robert Chen",
                "email": "r.chen@morganstanley.com",
                "phone": "+1 (212) 555-0104",
                "company": "Morgan Stanley",
                "industry": "Wealth Management",
                "location": "Boston, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Sophia Martinez",
                "email": "smartinez@citigroup.com",
                "phone": "+1 (212) 555-0105",
                "company": "Citigroup Inc.",
                "industry": "Global Banking",
                "location": "Chicago, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Arthur Pendelton",
                "email": "apendelton@hsbc.com",
                "phone": "+44 20 7991 8888",
                "company": "HSBC Holdings plc",
                "industry": "Commercial Banking",
                "location": "Hong Kong / London",
                "customer_type": "VIP",
                "status": "Active"
            },
            {
                "full_name": "Victoria Hayes",
                "email": "v.hayes@wellsfargo.com",
                "phone": "+1 (415) 555-0107",
                "company": "Wells Fargo & Co.",
                "industry": "Consumer Finance",
                "location": "San Francisco, USA",
                "customer_type": "SMB",
                "status": "Active"
            },
            {
                "full_name": "Julian Thorne",
                "email": "jthorne@bankofamerica.com",
                "phone": "+1 (704) 555-0108",
                "company": "Bank of America",
                "industry": "Investment Banking",
                "location": "Charlotte, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Diana Ross",
                "email": "diana.ross@fidelity.com",
                "phone": "+1 (800) 555-0109",
                "company": "Fidelity Investments",
                "industry": "Financial Technology",
                "location": "Boston, USA",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Klaus Schmidt",
                "email": "klaus.schmidt@ubs.com",
                "phone": "+41 44 234 1111",
                "company": "UBS Group AG",
                "industry": "Private Banking",
                "location": "Zurich, Switzerland",
                "customer_type": "VIP",
                "status": "Active"
            },
            {
                "full_name": "Amara Okafor",
                "email": "a.okafor@standardchartered.com",
                "phone": "+44 20 7885 8888",
                "company": "Standard Chartered Bank",
                "industry": "Cross-Border Trade Finance",
                "location": "Singapore",
                "customer_type": "Enterprise",
                "status": "Active"
            },
            {
                "full_name": "Lucas Davenport",
                "email": "ldavenport@bnymellon.com",
                "phone": "+1 (212) 555-0112",
                "company": "BNY Mellon",
                "industry": "Asset Servicing",
                "location": "Pittsburgh, USA",
                "customer_type": "SMB",
                "status": "Inactive"
            }
        ]

        customer_objs = []
        for c in customers_data:
            cust = Customer(
                **c,
                assigned_sales_id=sales_user.id
            )
            db.add(cust)
            customer_objs.append(cust)

        db.commit()
        for cust in customer_objs:
            db.refresh(cust)

        # 3. Create Leads (16 Leads across pipeline stages)
        leads_data = [
            {
                "name": "David Harrison", "email": "dharrison@bnpbaribas.com", "company": "BNP Paribas",
                "source": "Website", "industry": "Corporate Banking", "lead_status": "New", "lead_score": 65,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=30)
            },
            {
                "name": "Gemma Wright", "email": "gwright@santander.com", "company": "Banco Santander",
                "source": "Referral", "industry": "Consumer Banking", "lead_status": "Contacted", "lead_score": 70,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=20)
            },
            {
                "name": "Oliver Twist", "email": "otwist@credit-agricole.com", "company": "Crédit Agricole",
                "source": "Event", "industry": "Agri-Finance", "lead_status": "Qualified", "lead_score": 85,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=15)
            },
            {
                "name": "Sarah Jenkins", "email": "sjenkins@societegenerale.com", "company": "Société Générale",
                "source": "Cold Call", "industry": "Capital Markets", "lead_status": "Proposal", "lead_score": 90,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=7)
            },
            {
                "name": "Liam Gallagher", "email": "lgallagher@ing.com", "company": "ING Group",
                "source": "Partner", "industry": "Digital Banking", "lead_status": "Qualified", "lead_score": 78,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=25)
            },
            {
                "name": "Evelyn Reed", "email": "ereed@mizuho.com", "company": "Mizuho Financial Group",
                "source": "Website", "industry": "Trade Settlement", "lead_status": "New", "lead_score": 55,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=45)
            },
            {
                "name": "Benjamin Franklin", "email": "bfranklin@pnc.com", "company": "PNC Financial Services",
                "source": "Event", "industry": "Regional Banking", "lead_status": "Proposal", "lead_score": 88,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=10)
            },
            {
                "name": "Charlotte Bronte", "email": "cbronte@tdbank.com", "company": "TD Bank Group",
                "source": "Referral", "industry": "Retail Mortgages", "lead_status": "Lost", "lead_score": 30,
                "expected_conversion_date": datetime.utcnow().date() - timedelta(days=5)
            },
            # Converted leads linked to existing customers
            {
                "name": "Eleanor Vance", "email": "eleanor.vance@jpmorgan.com", "company": "JPMorgan Chase & Co.",
                "source": "Referral", "industry": "Investment Banking", "lead_status": "Converted", "lead_score": 100,
                "customer_id": customer_objs[0].id, "conversion_date": datetime.utcnow() - timedelta(days=60)
            },
            {
                "name": "Marcus Sterling", "email": "m.sterling@goldmansachs.com", "company": "Goldman Sachs Group",
                "source": "Website", "industry": "Asset Management", "lead_status": "Converted", "lead_score": 100,
                "customer_id": customer_objs[1].id, "conversion_date": datetime.utcnow() - timedelta(days=45)
            },
            {
                "name": "Catherine Howard", "email": "choward@barclays.co.uk", "company": "Barclays Capital",
                "source": "Event", "industry": "Retail & Commercial Banking", "lead_status": "Converted", "lead_score": 100,
                "customer_id": customer_objs[2].id, "conversion_date": datetime.utcnow() - timedelta(days=30)
            },
            {
                "name": "Robert Chen", "email": "r.chen@morganstanley.com", "company": "Morgan Stanley",
                "source": "Partner", "industry": "Wealth Management", "lead_status": "Converted", "lead_score": 100,
                "customer_id": customer_objs[3].id, "conversion_date": datetime.utcnow() - timedelta(days=20)
            },
            {
                "name": "Sophia Martinez", "email": "smartinez@citigroup.com", "company": "Citigroup Inc.",
                "source": "Website", "industry": "Global Banking", "lead_status": "Converted", "lead_score": 100,
                "customer_id": customer_objs[4].id, "conversion_date": datetime.utcnow() - timedelta(days=15)
            },
            {
                "name": "Noah Williams", "email": "nwilliams@scotia.com", "company": "Scotiabank",
                "source": "Website", "industry": "Commercial Banking", "lead_status": "New", "lead_score": 45,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=50)
            },
            {
                "name": "Isabella Rossi", "email": "irossi@unicredit.eu", "company": "UniCredit",
                "source": "Referral", "industry": "European Trade", "lead_status": "Contacted", "lead_score": 60,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=35)
            },
            {
                "name": "Ethan Hunt", "email": "ehunt@imf.org", "company": "Global Security Banking",
                "source": "Event", "industry": "Compliance Technology", "lead_status": "Qualified", "lead_score": 82,
                "expected_conversion_date": datetime.utcnow().date() + timedelta(days=18)
            }
        ]

        lead_objs = []
        for l in leads_data:
            lead = Lead(**l, assigned_sales_id=sales_user.id)
            db.add(lead)
            lead_objs.append(lead)

        db.commit()

        # 4. Create Activities (16 Activities)
        activities_data = [
            {
                "activity_type": "Call",
                "subject": "Discovery call regarding core banking cloud migration",
                "description": "Discussed scalability requirements and Salesforce Financial Services Cloud integration timeline.",
                "due_date": datetime.utcnow() + timedelta(hours=4),
                "status": "Pending",
                "customer_id": customer_objs[0].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Meeting",
                "subject": "Q4 Strategic Enterprise Review with Morgan Stanley",
                "description": "Executive briefing on regulatory compliance reporting automation.",
                "due_date": datetime.utcnow() + timedelta(days=1),
                "status": "Pending",
                "customer_id": customer_objs[3].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Demo",
                "subject": "Product Demo: Automated KYC & AML Screening Module",
                "description": "Showcasing live integration with FastAPI endpoints and real-time sanctions screening database.",
                "due_date": datetime.utcnow() + timedelta(days=2),
                "status": "Pending",
                "customer_id": customer_objs[1].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Follow-up",
                "subject": "Follow up on SLA ticket resolution for Barclays",
                "description": "Confirming fix for core transaction gateway latency issue.",
                "due_date": datetime.utcnow() - timedelta(hours=2),
                "status": "Completed",
                "customer_id": customer_objs[2].id,
                "assigned_user_id": support_user.id
            },
            {
                "activity_type": "Email",
                "subject": "Send proposal for Citigroup API Gateway expansion",
                "description": "Transmitted commercial terms for 5,000 active user seats.",
                "due_date": datetime.utcnow() - timedelta(days=1),
                "status": "Completed",
                "customer_id": customer_objs[4].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Meeting",
                "subject": "Security & Penetration Audit Review with HSBC",
                "description": "Reviewing ISO27001 compliance logs and encryption standards.",
                "due_date": datetime.utcnow() + timedelta(days=3),
                "status": "Pending",
                "customer_id": customer_objs[5].id,
                "assigned_user_id": admin_user.id
            },
            {
                "activity_type": "Call",
                "subject": "Introductory call with BNP Paribas (Lead)",
                "description": "Assessing budget and decision timeframe for core CRM deployment.",
                "due_date": datetime.utcnow() + timedelta(days=4),
                "status": "Pending",
                "lead_id": lead_objs[0].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Email",
                "subject": "Share case studies with Crédit Agricole",
                "description": "Sent ROI whitepaper on banking workflow automation.",
                "due_date": datetime.utcnow() - timedelta(days=2),
                "status": "Completed",
                "lead_id": lead_objs[2].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Demo",
                "subject": "Custom Dashboard Walkthrough for Wells Fargo",
                "description": "Demonstrating role-based views for branch managers.",
                "due_date": datetime.utcnow() + timedelta(days=5),
                "status": "Pending",
                "customer_id": customer_objs[6].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Call",
                "subject": "Contract Renewal discussion with Fidelity",
                "description": "Negotiating multi-year contract terms and support tier upgrade.",
                "due_date": datetime.utcnow() + timedelta(days=6),
                "status": "Pending",
                "customer_id": customer_objs[8].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Follow-up",
                "subject": "Verify data migration script output for UBS",
                "description": "Sanity check on imported customer records and account ledgers.",
                "due_date": datetime.utcnow() - timedelta(hours=5),
                "status": "Completed",
                "customer_id": customer_objs[9].id,
                "assigned_user_id": admin_user.id
            },
            {
                "activity_type": "Meeting",
                "subject": "SWIFT Integration Technical Workshop",
                "description": "Aligning on ISO20022 message schema specifications.",
                "due_date": datetime.utcnow() + timedelta(days=7),
                "status": "Pending",
                "customer_id": customer_objs[10].id,
                "assigned_user_id": support_user.id
            },
            {
                "activity_type": "Call",
                "subject": "Onboarding check-in with Bank of America",
                "description": "Ensure initial user roster provisioned without errors.",
                "due_date": datetime.utcnow() - timedelta(days=3),
                "status": "Completed",
                "customer_id": customer_objs[7].id,
                "assigned_user_id": support_user.id
            },
            {
                "activity_type": "Email",
                "subject": "Send proposal agreement to Société Générale",
                "description": "Formal proposal document sent for approval.",
                "due_date": datetime.utcnow() - timedelta(hours=12),
                "status": "Completed",
                "lead_id": lead_objs[3].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Meeting",
                "subject": "ING Group Requirements Scoping Session",
                "description": "Scoping technical requirements for digital onboarding portal.",
                "due_date": datetime.utcnow() + timedelta(days=8),
                "status": "Pending",
                "lead_id": lead_objs[4].id,
                "assigned_user_id": sales_user.id
            },
            {
                "activity_type": "Call",
                "subject": "PNC Proposal Follow-up",
                "description": "Checking feedback on commercial terms.",
                "due_date": datetime.utcnow() + timedelta(days=2),
                "status": "Pending",
                "lead_id": lead_objs[6].id,
                "assigned_user_id": sales_user.id
            }
        ]

        for a in activities_data:
            act = Activity(**a)
            db.add(act)

        db.commit()

        # 5. Create Service Tickets / Cases (16 Tickets)
        tickets_data = [
            {
                "customer_id": customer_objs[0].id,
                "subject": "OAuth2 SSO Integration Token Timeout on Mobile Gateway",
                "description": "Users report session expiration errors when accessing trade approval portal via OAuth2 authorization code flow.",
                "category": "Technical",
                "priority": "Critical",
                "status": "In Progress",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Identified token refresh race condition; deploying patch v1.4.2."
            },
            {
                "customer_id": customer_objs[1].id,
                "subject": "Q3 Billing Invoice Re-allocation Request",
                "description": "Need itemized breakdown of API request bandwidth charges for wealth management department.",
                "category": "Billing",
                "priority": "Medium",
                "status": "Resolved",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Generated and sent customized cost center report to finance director."
            },
            {
                "customer_id": customer_objs[2].id,
                "subject": "Batch Payment Processing Delay during Peak Trading Hours",
                "description": "Automated ACH payment batch execution experienced 12-minute queue backup at 09:00 EST.",
                "category": "Technical",
                "priority": "High",
                "status": "Open",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[3].id,
                "subject": "Role-Based Permission Update for Regional Advisors",
                "description": "Requesting read-only access grant for 45 wealth management analysts in Boston branch.",
                "category": "Account",
                "priority": "Low",
                "status": "Closed",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Bulk updated RBAC group assignments in IAM policy settings."
            },
            {
                "customer_id": customer_objs[4].id,
                "subject": "REST API Rate Limit Throttling Alert on Webhook Service",
                "description": "Webhook notification endpoints hitting HTTP 429 status during high-volume customer onboarding events.",
                "category": "Technical",
                "priority": "High",
                "status": "In Progress",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[5].id,
                "subject": "KYC Compliance Report Export CSV Formatting Issue",
                "description": "Exported CSV contains trailing comma syntax error when parsing non-ASCII customer names.",
                "category": "General",
                "priority": "Medium",
                "status": "Resolved",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Fixed UTF-8 encoding wrapper in report export generator."
            },
            {
                "customer_id": customer_objs[6].id,
                "subject": "Request for Dedicated Sandbox Environment for Staging Tests",
                "description": "Wells Fargo QA team requires isolated database sandbox with seeded mock accounts.",
                "category": "Other",
                "priority": "Low",
                "status": "Open",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[7].id,
                "subject": "MFA Security Token Resynchronization for Executive User",
                "description": "VP of Commercial Credit locked out after upgrading hardware device authenticator.",
                "category": "Account",
                "priority": "High",
                "status": "Closed",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Verified identity via out-of-band call and reset TOTP secret."
            },
            {
                "customer_id": customer_objs[8].id,
                "subject": "Audit Trail Logging Intermittent Dropouts",
                "description": "Security team noticed missing audit entries for customer profile updates made on Sep 22.",
                "category": "Technical",
                "priority": "Critical",
                "status": "Pending Customer",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[9].id,
                "subject": "Discrepancy in Currency Conversion Matrix Calculations",
                "description": "EUR to CHF cross-rate calculation rounded at 4 decimal places instead of standard 6.",
                "category": "Technical",
                "priority": "Medium",
                "status": "Resolved",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Updated float precision model to BigNumeric in database calculation engine."
            },
            {
                "customer_id": customer_objs[10].id,
                "subject": "Wire Transfer Status Webhook Notification Failed",
                "description": "Webhook endpoint failed to dispatch notification payload for trade ID #88492.",
                "category": "Technical",
                "priority": "High",
                "status": "Open",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[0].id,
                "subject": "Annual Enterprise License True-up Clarification",
                "description": "Questions regarding active seat count limits vs API consumer application tokens.",
                "category": "Billing",
                "priority": "Low",
                "status": "Closed",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Provided licensing documentation and confirmed current usage is within tier allowance."
            },
            {
                "customer_id": customer_objs[1].id,
                "subject": "Slow Page Rendering on High-Volume Customer 360 View",
                "description": "Profile page taking > 3 seconds to load for accounts with over 200 activity logs.",
                "category": "Technical",
                "priority": "Medium",
                "status": "In Progress",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[2].id,
                "subject": "Password Policy Enforcement Update Request",
                "description": "Align password complexity rules with new UK Cyber Security Center guidelines.",
                "category": "Account",
                "priority": "Low",
                "status": "Resolved",
                "assigned_agent_id": support_user.id,
                "resolution_notes": "Updated minimum character length and special symbol requirements in Auth module config."
            },
            {
                "customer_id": customer_objs[4].id,
                "subject": "Real-Time Transaction Alert SMS Notification Failures",
                "description": "SMS gateway provider returned HTTP 502 error during carrier outage.",
                "category": "Technical",
                "priority": "Critical",
                "status": "Open",
                "assigned_agent_id": support_user.id
            },
            {
                "customer_id": customer_objs[5].id,
                "subject": "Custom Report Export Scheduling Options",
                "description": "Can weekly automated emails be configured for compliance officers?",
                "category": "General",
                "priority": "Low",
                "status": "Open",
                "assigned_agent_id": support_user.id
            }
        ]

        ticket_objs = []
        for t in tickets_data:
            ticket = Ticket(**t)
            db.add(ticket)
            ticket_objs.append(ticket)

        db.commit()
        for ticket in ticket_objs:
            db.refresh(ticket)

        # 6. Add Comments to Tickets
        comments_data = [
            (ticket_objs[0].id, support_user.id, "Investigating backend logs. It appears token refresh requests timing out under peak load."),
            (ticket_objs[0].id, admin_user.id, "Prioritize this patch. JPMorgan is our primary enterprise account."),
            (ticket_objs[1].id, support_user.id, "Invoice recalculated and sent via secure email gateway."),
            (ticket_objs[2].id, support_user.id, "Checking database query execution plan for batch queue processing."),
            (ticket_objs[4].id, support_user.id, "Configured circuit breaker pattern on API gateway to prevent thread exhaustion."),
            (ticket_objs[8].id, support_user.id, "Requested audit log dump from primary node cluster for timestamp verification.")
        ]

        for t_id, u_id, comm in comments_data:
            db.add(TicketComment(ticket_id=t_id, user_id=u_id, comment=comm))

        db.commit()

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
