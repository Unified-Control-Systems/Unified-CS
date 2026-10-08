# Unified-CS ERP Platform

### Modular & Configurable Enterprise Resource Planning System

> Building a flexible ERP platform that adapts to different business requirements.

The ERP Platform is a **modular, multi-tenant, and configurable Enterprise Resource Planning system** designed to manage and integrate core business operations within a single platform.

Unlike traditional ERP systems built for a single business model, this platform is designed with **modularity, configurability, scalability, and tenant isolation** in mind, allowing it to be adapted for different organizations and industries without rewriting the core system.

---

## Key Features

* **Multi-Tenancy** - Support multiple organizations with secure data isolation.
* **Authentication & RBAC** - Secure authentication with role-based permissions.
* **User & Organization Management** - Manage employees, departments, branches, and organizational settings.
* **Human Resources** - Employee records, attendance, leave management, and HR workflows.
* **CRM** - Manage leads, customers, contacts, opportunities, and interactions.
* **Inventory Management** - Products, warehouses, stock levels, transfers, and stock movements.
* **Sales Management** - Quotations, sales orders, invoices, payments, and customer transactions.
* **Purchase Management** - Suppliers, purchase requests, purchase orders, and goods receipts.
* **Finance** - Income, expenses, invoices, payments, accounts, and financial summaries.
* **Reporting & Analytics** - Business insights across sales, inventory, finance, HR, and customers.
* **Notifications** - In-app and email notifications with configurable preferences.
* **Audit Logging** - Track important user and system activities.
* **Configurable Modules** - Enable and configure features based on business requirements.
* **Document Management** - Secure storage and management of business documents.
* **Approval Workflows** - Support configurable approval processes for business operations.
* **Import & Export** - Bulk CSV import/export with validation and error reporting.
* **Global Search** - Search across multiple business entities from a unified interface.

---

## How It Works

```text
                    Organization
                         │
                         ▼
                Authentication & RBAC
                         │
                         ▼
                ERP Platform Core
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
       HR               CRM          Inventory
        │                │                │
        └────────────────┼────────────────┘
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
           Sales      Purchasing   Finance
             │           │           │
             └───────────┼───────────┘
                         ▼
                Reporting & Analytics
```
---

## Architecture
### Multi-tenant Modular Monolith Architecture
```text
                         ┌─────────────────┐
                         │    Next.js Web  │
                         │    Application  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   NestJS API    │
                         │   Modular Core  │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        Business Modules      Core Modules       Background Jobs
              │                   │                   │
        ┌─────┼─────┐       ┌─────┼─────┐             ▼
        ▼     ▼     ▼       ▼     ▼     ▼          BullMQ
       HR    CRM  Inventory  Auth  RBAC  Audit
        │     │     │
        └─────┼─────┘
              ▼
        PostgreSQL
              │
        ┌─────┴─────┐
        ▼           ▼
      Redis      Object Storage
```
---

## Multi-Tenancy

```text
                    ERP Platform
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Organization A  Organization B  Organization C
          │              │              │
          ▼              ▼              ▼
       Users          Users          Users
       Data           Data           Data
       Roles          Roles          Roles

```

## Core Modules

### Identity & Access

* **Authentication** - Secure user authentication and login management.
* **Access & Refresh Tokens** - Secure token-based authentication with access and refresh tokens.
* **User Sessions** - Manage and track active user sessions.
* **Password Management** - Secure password creation, updates, and recovery.
* **Email Verification** - Verify user email addresses for account security.
* **Role-Based Access Control** - Manage permissions based on user roles.
* **Resource-Action Permissions** - Control access to specific resources and actions.

### Organization Management

* **Organizations** - Create and manage multiple organizations.
* **Branches** - Manage organization branches and their operations.
* **Departments** - Create and manage organizational departments.
* **Organization Settings** - Configure organization-level settings and preferences.
* **Business Configuration** - Configure business-specific rules and settings.
* **Module Activation** - Enable or disable modules based on business requirements.
* **User Invitations** - Invite and onboard users into organizations.

### Human Resources

* **Employees** - Manage employee records and information.
* **Departments** - Organize employees into different departments.
* **Designations** - Manage employee designations and positions.
* **Attendance** - Track and manage employee attendance.
* **Leave Management** - Manage employee leave requests and records.
* **Employee Documents** - Store and manage employee-related documents.
* **Approval Workflows** - Handle configurable HR approval processes.

### CRM

* **Leads** - Capture, manage, and track potential customers.
* **Customers** - Maintain customer profiles and business information.
* **Contacts** - Manage customer and business contacts.
* **Opportunities** - Track and manage potential sales opportunities.
* **Follow-ups** - Schedule and manage customer follow-ups.
* **Interactions** - Record and track customer interactions.
* **Customer Activity Timeline** - View a complete timeline of customer activities.

### Inventory

* **Products** - Manage products and their details.
* **Categories** - Organize products into categories.
* **Warehouses** - Manage multiple warehouses and storage locations.
* **Stock Management** - Track and manage inventory levels.
* **Stock Movements** - Track incoming, outgoing, and adjusted stock.
* **Transfers** - Transfer inventory between warehouses or locations.
* **Suppliers** - Manage supplier information and relationships.
* **Goods Receipts** - Record and manage received goods.

### Sales

* **Quotations** - Create and manage customer quotations.
* **Sales Orders** - Create and manage customer sales orders.
* **Order Items** - Manage individual items within sales orders.
* **Invoices** - Generate and manage customer invoices.
* **Payments** - Record and manage customer payments.
* **Order Lifecycle Management** - Track orders from quotation through completion.

### Purchasing

* **Purchase Requests** - Create and manage internal purchase requests.
* **Purchase Orders** - Create and manage supplier purchase orders.
* **Suppliers** - Manage supplier information and relationships.
* **Goods Receipts** - Record and manage goods received from suppliers.
* **Supplier Invoices** - Manage invoices received from suppliers.
* **Supplier Payments** - Track and manage payments made to suppliers.

### Finance

* **Chart of Accounts** - Manage financial accounts and account structures.
* **Income** - Record and manage business income.
* **Expenses** - Track and manage business expenses.
* **Transactions** - Record and manage financial transactions.
* **Invoices** - Manage financial invoices and billing records.
* **Payments** - Track incoming and outgoing payments.
* **Financial Summaries** - View summarized financial information and performance.

### Reporting

* **Sales Reports** - Analyze sales performance and transactions.
* **Purchase Reports** - Analyze purchasing activity and supplier transactions.
* **Inventory Reports** - Monitor stock levels, movements, and inventory performance.
* **Employee Reports** - Generate reports on employees and HR activities.
* **Customer Reports** - Analyze customer information and activities.
* **Revenue Reports** - Track and analyze business revenue.
* **Expense Reports** - Monitor and analyze business expenses.
* **Outstanding Payments** - Track pending and overdue payments.