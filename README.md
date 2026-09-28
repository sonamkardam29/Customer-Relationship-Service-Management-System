# Customer Relationship & Service Management System (Apex Banking CRM Hub)

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20MySQL-blue)](#tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-REST%20%7C%20Clean%20Layered-emerald)](#architecture)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt%20RBAC-purple)](#user-roles--authorization)

An enterprise-grade, full-stack **Customer Relationship & Service Management System** tailored for banking and financial institutions. Designed as a software engineer portfolio project for enterprise CRM & financial software roles (Salesforce / Financial Services Cloud ecosystem).

---

## 📌 Project Overview

**Apex Banking CRM Hub** unifies customer data, sales opportunity pipelines, client interaction activity logs, and customer support case management into a single, high-performance platform.

### Core Business Value:
- **Customer 360 View**: Consolidated single-pane view of customer accounts, linked sales leads, active service tickets, and communication history.
- **Lead Pipeline Workflow**: Standardized sales progression (`New` → `Contacted` → `Qualified` → `Proposal` → `Converted`) with automated customer account creation upon conversion.
- **Support Case Management**: Multi-tier ticket tracking (`Technical`, `Billing`, `Account`, `General`) with SLA priorities, root cause resolution notes, and chronological comment timelines.
- **Executive Analytics**: Real-time SQL aggregation dashboards featuring interactive Recharts visuals for conversion rates, ticket SLAs, and portfolio growth.
- **Role-Based Access Control (RBAC)**: Fine-grained security for **Admin**, **Sales Executive**, and **Support Agent** roles.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React 19 + Vite + Tailwind CSS              │
│       (React Router v6, Axios, Recharts, Lucide Icons)   │
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                      │
│        (Pydantic v2 Validation, PyJWT Auth, CORS)       │
└────────────────────────────┬────────────────────────────┘
                             │ SQLAlchemy ORM
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Relational Database                     │
│    (Primary: MySQL / Fallback: SQLite Zero-Config)      │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **React.js** (v19) with **Vite**
- **Tailwind CSS** (v4) with `@tailwindcss/vite`
- **React Router** (v7 / v6)
- **Axios** (JWT interceptors & error handlers)
- **Recharts** (Interactive data charts)
- **Lucide React** (Enterprise icons)

### Backend
- **Python 3.13** & **FastAPI**
- **Pydantic v2** & **Pydantic Settings**
- **SQLAlchemy v2** ORM
- **PyMySQL** (MySQL Database Connector)
- **PyJWT** & **Bcrypt** (Secure password hashing & token handling)

### Database Design
- **MySQL 8.0+** (Configurable via `DATABASE_URL`)
- **SQLite** (Automated fallback driver for immediate zero-dependency local runs)

---

## 🔐 User Roles & Permissions Matrix

| Feature / Module | Admin | Sales Executive | Support Agent |
| :--- | :---: | :---: | :---: |
| **System User Provisioning (`/users`)** | ✅ Full CRUD | ❌ Denied | ❌ Denied |
| **View Customer Portfolio (`/customers`)** | ✅ All Accounts | ✅ Assigned / Unassigned | ✅ Read-only |
| **Customer 360 Profile (`/customers/:id`)** | ✅ Full Access | ✅ Edit & Log Activity | ✅ Add Ticket / Notes |
| **Lead Opportunity Pipeline (`/leads`)** | ✅ Full Access | ✅ Manage Leads & Convert | ❌ Denied |
| **Lead Conversion Workflow** | ✅ Convert | ✅ Convert to Customer | ❌ Denied |
| **Service Tickets (`/tickets`)** | ✅ Full Access | ✅ View / Create | ✅ Resolve & Comment |
| **Activity Follow-ups (`/activities`)** | ✅ Full Access | ✅ Create & Complete | ✅ Create & Complete |
| **Analytics & Reports (`/reports`)** | ✅ All Reports | ✅ Sales Reports | ✅ Support Reports |

---

## 📊 Database Schema & Relationships

The database is normalized into 6 core tables with explicit foreign key constraints:

```
                  ┌──────────────┐
                  │    users     │
                  └──────┬───────┘
                         │ 1:N
        ┌────────────────┼────────────────┐
        │ 1:N            │ 1:N            │ 1:N
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  customers   │  │    leads     │  │  activities  │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │ 1:N             │ 1:N (Optional)
       ├─────────────────┘
       │ 1:N
       ▼
┌──────────────┐
│   tickets    │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│ticket_comments│
└──────────────┘
```

---

## 🌐 REST API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Authenticate user & issue JWT Bearer token
- `GET /api/auth/me` - Fetch current authenticated user session

### User Administration (Admin Only)
- `GET /api/users` - List all system users
- `POST /api/users` - Provision new team member
- `PUT /api/users/{id}` - Update user role / permissions
- `DELETE /api/users/{id}` - Revoke user account

### Customer Accounts & 360 View
- `GET /api/customers` - List customers (Supports `search`, `customer_type`, `status`, pagination)
- `POST /api/customers` - Create customer profile
- `GET /api/customers/{id}` - Fetch single customer
- `GET /api/customers/{id}/360` - Retrieve complete Customer 360 (Leads, Tickets, Activities)
- `PUT /api/customers/{id}` - Edit customer information
- `DELETE /api/customers/{id}` - Delete customer record

### Lead Pipeline Management
- `GET /api/leads` - List sales opportunities (Filter by `status`, `source`, `search`)
- `POST /api/leads` - Create new sales lead
- `GET /api/leads/{id}` - Fetch lead details
- `PUT /api/leads/{id}` - Update lead or advance pipeline stage
- `POST /api/leads/{id}/convert` - **Business Workflow**: Convert lead to active Customer
- `DELETE /api/leads/{id}` - Delete lead

### Activity & Follow-up Tracking
- `GET /api/activities` - List activities (Filter by `status`, `type`, `customer_id`)
- `POST /api/activities` - Schedule follow-up / call / demo
- `PUT /api/activities/{id}` - Update activity or toggle `Completed` status

### Service Ticket / Case Management
- `GET /api/tickets` - List service tickets (Filter by `status`, `priority`, `category`)
- `POST /api/tickets` - Open new service ticket
- `GET /api/tickets/{id}` - Fetch ticket timeline & details
- `PUT /api/tickets/{id}` - Update status, priority, or resolution notes
- `POST /api/tickets/{id}/comments` - Append comment to ticket timeline

### Executive Analytics & Reports
- `GET /api/dashboard` - Fetch KPI counters, chart series data, and recent activities feed
- `GET /api/reports` - Aggregated analytical reports filterable by assigned employee

---

## 🚀 Quick Setup & Local Execution Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI application server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*Note: Database tables and seed data will automatically initialize upon server startup.*

- **Swagger API Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite React development server
npm run dev
```

- **Application URL**: `http://localhost:5173`

---

## 🔑 Pre-seeded Demo Login Credentials

The database automatically seeds 3 realistic enterprise accounts for instant evaluation:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crmhub.com` | `Admin@123` | User roster control, system configuration, all analytics |
| **Sales Executive** | `sales@crmhub.com` | `Sales@123` | Lead pipeline management, customer creation, follow-ups |
| **Support Agent** | `support@crmhub.com` | `Support@123` | Ticket case resolution, comments timeline, SLAs |

*(Quick-login preset buttons are provided on the Login screen for 1-click access).*

---

## 💡 Future Enhancements
- [ ] Email notification triggers via AWS SES / SendGrid for ticket updates.
- [ ] WebSockets / Server-Sent Events (SSE) for live chat support notifications.
- [ ] Document attachment support for customer contracts (.pdf, .docx).
- [ ] Export reports to Excel (.xlsx) and PDF formats.

---

### 📜 License
Developed for software engineering interview demonstration purposes. Open source MIT license.
