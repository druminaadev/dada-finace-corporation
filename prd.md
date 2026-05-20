# Dada Finance Corporation — Loan Management System

**Product Requirements Document**
Version 1.0 · May 2026

| Property | Detail |
|---|---|
| Document Title | Dada Finance Corporation – Loan Management System PRD |
| Version | 1.0 |
| Date | May 2026 |
| Platform | Web Application (Browser-based) |
| Production URL | https://loanmanage.hiredeveloper.today |
| Status | Active / Production |
| Primary Audience | Product Managers, Developers, QA, Auditors, Business Stakeholders |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Navigation Structure & Main Menu](#2-navigation-structure--main-menu)
3. [Master Data Management](#3-master-data-management)
4. [Employee Management](#4-employee-management)
5. [Customer Management](#5-customer-management)
6. [Loan Management](#6-loan-management)
7. [Document Generation & Downloads](#7-document-generation--downloads)
8. [File Upload & Document Management](#8-file-upload--document-management)
9. [Camera & Photo Capture Feature](#9-camera--photo-capture-feature)
10. [Loan Lifecycle & Status Workflow](#10-loan-lifecycle--status-workflow)
11. [User Roles & Access Control](#11-user-roles--access-control)
12. [Technical Information](#12-technical-information)
13. [Complete Feature Summary](#13-complete-feature-summary)
14. [Glossary](#14-glossary)

---

## 1. Introduction

Dada Finance Corporation has built its Loan Management System (LMS) to serve as the single operational backbone for its lending business. Rather than juggling paper files, disconnected spreadsheets, or fragmented tools, every step of the lending cycle — from the moment a new customer walks in, all the way through loan approval, fund disbursement, and final document generation — is handled within one cohesive, web-based platform.

This Product Requirements Document (PRD) captures every feature, workflow, and technical characteristic of the system as it exists in production. It is intended to be useful to product managers who need to understand scope, developers who need to build or extend the platform, QA engineers running test scenarios, auditors reviewing compliance readiness, and business stakeholders wanting clarity on system capabilities.

The system is accessible through any modern web browser and requires no local installation, making it straightforward to deploy across multiple branch locations. Employees in the field can onboard customers, capture photographs, upload documents, and submit loan applications from a single interface.

### 1.1 System Overview

| Property | Detail |
|---|---|
| System Name | Dada Finance Corporation Loan Management System |
| Type | Web Application (Browser-based) |
| Copyright | Copyright © 2025 Dada Finance Corporation |
| Production URL | https://loanmanage.hiredeveloper.today |
| Primary Users | Admin, Employees, Loan Officers, Approvers |
| Core Purpose | End-to-end loan lifecycle management |

### 1.2 Key Objectives

The Dada Finance LMS was conceived to solve a straightforward but important set of operational challenges. Below are the core goals that shaped its design:

- Fully digitise the loan application and approval process, eliminating paper-based workflows.
- Maintain accurate, audit-ready records for every customer, nominee, and guarantor.
- Track each loan's status in real time — from initial registration through approval and final disbursement.
- Automatically generate all legally required documents for every loan, saving significant manual effort.
- Provide a centralised, searchable repository for all loan-related files and data.
- Support operations across multiple branches, areas, cities, and states within a single platform instance.

---

## 2. Navigation Structure & Main Menu

The system presents a persistent left-side navigation panel that remains accessible from every screen. This sidebar is organised hierarchically, grouping related functionality under clearly labelled top-level modules. Every page also shows a contextual breadcrumb at the top — for example, `Dashboard / Loan Registration` — so users always know exactly where they are within the system.

| Module | Sub-items | Description |
|---|---|---|
| Dashboard | — | Main overview and summary page providing at-a-glance operational status. |
| Master | State, City, Area, Branch, Loan Type, Bank | Foundational reference data that drives dropdowns and validations throughout the system. |
| Employee | Add Employee, Employee List | Full staff management: onboard new employees and maintain an active directory. |
| Customer | Add Customer, Customer List | Comprehensive customer registration, KYC capture, and ongoing profile management. |
| Loan | Add Loan, Loan List, Approved Loan List, Disbursed Loan List, Loan Approval | The complete loan lifecycle from registration through approval to disbursement. |

---

## 3. Master Data Management

Before employees can register customers or create loans, the platform needs to know the geography it operates in, the banks it works with, and the loan products it offers. The Master module is where administrators configure all of this foundational reference data. Once set up, these values populate dropdowns and selection fields across every other module, ensuring data consistency and reducing manual entry errors.

### 3.1 Geographic Configuration

Geographic data is structured as a four-level hierarchy: **State → City → Area → Branch**. Each level feeds into customer address capture and branch assignment throughout the system.

| Entity | Purpose | Usage |
|---|---|---|
| State | Define all operating states | Appears in customer address dropdowns throughout the system. |
| City | Define cities within each state | Linked to state; used in customer and loan registration forms. |
| Area | Define areas within each city | Used to classify customers by geographic segment. |
| Branch | Define company branch locations | Assigned to both customers and employees for operational routing. |

### 3.2 Financial Configuration

In addition to geography, two financial reference entities must be configured before loans can be created. Loan Types define the repayment structures the company offers, while the Bank list provides a standardised set of recognised banks used across all bank detail forms.

| Entity | Purpose | Usage |
|---|---|---|
| Loan Type | Define loan product categories (e.g., Flat Rate) | Selected by the loan officer during loan registration. |
| Bank | Define recognised banks | Used in bank detail forms for customers, nominees, and guarantors. |

---

## 4. Employee Management

Every loan in the system is handled by a specific employee — whether that is the loan officer who registered it or the branch representative who onboarded the customer. The Employee module manages this staff directory, making employees available as selectable options throughout the platform wherever staff assignment is required.

### 4.1 Add Employee

New employees are registered through a dedicated form that captures everything needed to identify and route work to the right person. The following information is collected:

- **Employee Name** — full legal name of the staff member.
- **Employee ID / Code** — a unique internal identifier.
- **Branch Assignment** — links the employee to a specific operating location.
- **Contact Information** — primary phone and email details.
- **Role / Designation** — the employee's position or function within the organisation.

### 4.2 Employee List

The Employee List provides a searchable, tabular view of all registered staff. Administrators can filter, sort, edit, or remove employee records from this screen. More importantly, this list powers the **Select Employee** dropdown that appears on both the Customer Registration and Loan Registration forms, ensuring every customer record and loan file is linked to an accountable individual.

---

## 5. Customer Management

The Customer module is the most detailed section of the platform, and rightly so — customers are the heart of the lending business. It is designed to capture a complete picture of every applicant: their personal details, financial information, identity documents, and the details of any nominees or guarantors they bring to the table. These records form the foundation upon which all subsequent loan operations are built.

### 5.1 Customer Registration Form

Customer registration is accessed via **Customer > Add Customer**. The form is comprehensive by design, reflecting the level of due diligence required in the lending sector. It is divided into two major sections: Personal Information and Bank Details.

#### 5.1.1 Personal Information

The personal information section collects all core identity and contact data for the loan applicant. An Application Number is automatically generated by the system upon form submission.

| Field | Input Type | Notes |
|---|---|---|
| Application No | Auto-generated | System-assigned unique ID (e.g., 1447). |
| Customer Name | Text | Full name of the applicant. |
| Father's Name | Text | Applicant's father's name. |
| Mother's Name | Text | Applicant's mother's name. |
| Date of Birth | Date Picker | Format: dd/mm/yyyy. |
| Age | Number | Calculated or entered manually. |
| Gender | Dropdown | Male / Female / Other. |
| Marital Status | Dropdown | Married / Unmarried / etc. |
| Blood Group | Text | Optional medical reference field. |
| Occupation | Text | Current occupation of the customer. |
| Registration Date | Date Picker | Date the record is created. |
| Mobile Number | Text | Primary contact number. |
| Alternative Mobile Number | Text | Secondary contact number. |
| Email ID | Text | Customer's email address. |
| Aadhar No | Text | 12-digit Aadhaar number. |
| PAN No | Text | 10-character PAN card number. |
| Job Address | Text | Workplace or business address. |
| State | Dropdown | Select from master state list. |
| City | Dropdown | Filtered dynamically by selected state. |
| Area | Dropdown | Filtered dynamically by selected city. |
| Address | Text Area | Full residential address. |
| Select Branch | Dropdown | Assigns the customer to an operating branch. |
| Select Employee | Dropdown | Assigns a handling employee to this customer. |
| Click Profile Photo | Camera / Upload | Capture via webcam or upload a photo file. |

#### 5.1.2 Bank Details

Bank account information for the primary customer is captured within the same registration form, supporting future disbursements and repayment tracking.

| Field | Input Type | Notes |
|---|---|---|
| Bank Account Number | Text | The customer's bank account number. |
| Account Holder Name | Text | Name exactly as it appears on the bank account. |
| Bank Name | Text | Name of the customer's bank. |
| Bank Branch | Text | Branch where the account is held. |
| IFSC Code | Text | 11-character IFSC code for electronic transfers. |
| Select Document | File Upload | Upload bank passbook or cancelled cheque for verification. |

### 5.2 Customer Details — Extended Profile

Once the initial registration is saved, the Customer Details screen unlocks three additional collapsible sub-sections that capture information about the customer's nominee and guarantors. These sections can be updated independently without affecting the rest of the profile, which is particularly helpful when information arrives in stages.

#### 5.2.1 Nominee Details

The nominee is the person designated to receive benefits in the event of the customer's death. The platform captures their identity, contact, banking, and photographic information to a standard comparable to the primary applicant.

| Field | Input Type | Notes |
|---|---|---|
| Identity Proof | Dropdown | e.g., Aadhar Card, PAN Card. |
| Identity No | Text | ID document number. |
| Name | Text | Full name of the nominee. |
| Select Relation | Dropdown | Relationship to customer (e.g., Spouse, Child). |
| Date of Birth | Date Picker | Nominee date of birth. |
| Age | Number | Nominee's age. |
| Mobile Number | Text | Nominee's contact number. |
| Address | Text Area | Nominee's residential address. |
| Update Profile Photo | Camera / Upload | Capture or upload nominee photograph. |
| Bank Account Number | Text | Nominee's bank account number. |
| Account Holder Name | Text | Name on nominee's bank account. |
| Bank Name | Text | Nominee's bank. |
| Bank Branch | Text | Nominee's bank branch. |
| IFSC Code | Text | Nominee's bank IFSC code. |
| Select Document | File Upload | Upload nominee bank document for KYC. |

#### 5.2.2 & 5.2.3 Guarantor 1 and Guarantor 2 Details

The system supports up to two guarantors per customer. A guarantor is a third party who agrees to repay the loan if the primary borrower defaults. Both Guarantor 1 and Guarantor 2 sections are structurally identical, each containing a full set of personal, relationship, banking, and documentary fields.

| Field | Input Type | Notes |
|---|---|---|
| Identity Proof | Dropdown | e.g., Aadhar Card. |
| Identity No | Text | Guarantor's ID document number. |
| Name | Text | Guarantor's full name. |
| Select Relation | Dropdown | Relationship to borrower. |
| Date of Birth | Date Picker | Guarantor's date of birth. |
| Age | Number | Guarantor's age. |
| Mobile Number | Text | Guarantor's contact number. |
| Address | Text Area | Guarantor's residential address. |
| Update Profile Photo | Camera / Upload | Capture or upload guarantor photograph. |
| Bank Account Number | Text | Guarantor's bank account number. |
| Account Holder Name | Text | Name on guarantor's bank account. |
| Bank Branch | Text | Guarantor's bank branch. |
| Bank Name | Text | Guarantor's bank. |
| IFSC Code | Text | Guarantor's 11-character IFSC code. |
| Select Document | File Upload | Upload guarantor bank proof for KYC compliance. |

> Each guarantor section has its own independent **Update** button, so information for Guarantor 1 and Guarantor 2 can be saved separately without affecting one another.

### 5.3 Customer List

The Customer List screen is a searchable, sortable table showing all registered customers at a glance. Each row summarises key information for one customer and provides action buttons for editing the full profile, viewing detailed records, or deleting the entry when required.

---

## 6. Loan Management

The Loan module is where the platform's operational value is most visible. It manages every stage of a loan's life — from the initial registration, through the formal approval process, to the confirmation of fund disbursement. Each loan is tracked individually with a unique Loan ID, and its current status is visible at all times to authorised users.

### 6.1 Loan Registration (Add Loan)

New loans are created via **Loan > Add Loan**. The registration form is comprehensive, capturing not just the financial terms but also the security offered by the borrower and the details of whoever physically receives the disbursed funds.

#### 6.1.1 Loan Core Information

The core information section establishes the fundamental parameters of the loan: who is borrowing, how much, for how long, and at what cost.

| Field | Input Type | Notes |
|---|---|---|
| Loan ID | Auto-generated | Unique loan identifier assigned by the system (e.g., 160). |
| Select Customer | Dropdown | Links the loan to an existing registered customer. |
| Select Employee | Dropdown | Assigns the responsible loan officer. |
| Loan Date | Date Picker | Date of loan initiation (dd/mm/yyyy). |
| EMI Start Date | Date Picker | Date from which EMI collection begins. |
| Loan Type | Dropdown | e.g., Flat Rate — selected from master configuration. |
| Loan Amount (₹) | Number | Principal amount of the loan (e.g., ₹1,00,000). |
| No of Installments | Number | Total number of EMI payments (e.g., 12). |
| Interest (%) | Number | Annual or flat interest rate (e.g., 12%). |
| Interest (₹) | Auto-calculated | Computed interest amount based on principal and rate. |
| File Charges (₹) | Number | Processing or file fee charged for the loan. |
| Extra / Other Charges (₹) | Number | Any miscellaneous charges applicable to the loan. |
| Interval Days | Dropdown | EMI payment frequency (e.g., 7 Days / Monthly). |
| Remarks | Text Area | Free-text notes or observations by the loan officer. |

#### 6.1.2 Security Deposit

Every loan requires collateral. The system currently supports two types of security: a **vehicle** or **gold**. The loan officer selects the relevant type and a context-specific set of fields appears accordingly.

**Option A — Vehicle**

| Field | Input Type | Notes |
|---|---|---|
| Select Item | Dropdown | Set to "Vehicle". |
| Model Name | Text | Vehicle model name. |
| Registration Number | Text | Vehicle registration plate number. |
| Chassis Number | Text | Vehicle chassis identification number. |
| Number of Keys | Text | Number of vehicle keys held by the company. |
| RC Book Received | Radio (Yes / No) | Whether the Registration Certificate Book has been received. |
| Upload Files | File Upload | Vehicle documents and photographs. |

**Option B — Gold**

| Field | Input Type | Notes |
|---|---|---|
| Select Item | Dropdown | Set to "Gold". |
| Item Name | Text | Description of the gold item. |
| Weight | Number | Weight of the gold in grams. |
| No of Pieces | Number | Number of individual gold pieces. |
| Upload Files | File Upload | Gold item photographs and valuation certificate. |

#### 6.1.3 Receiver Customer Details

In some cases, the person who physically receives the disbursed loan amount may differ from the registered borrower. This section captures the receiver's identity and contact details to maintain a clear, auditable record of exactly who received the funds.

| Field | Input Type | Notes |
|---|---|---|
| Mobile Number | Text | Receiver's contact number. |
| Upload Files | File Upload | Receiver verification document. |

### 6.2 Loan List

The Loan List is the command centre for all loan records. It presents every loan in a unified table with real-time search filtering and action controls. The status badge on each row immediately communicates where a loan stands in its lifecycle.

| Column / Control | Type | Description |
|---|---|---|
| Loan ID | Display | Unique identifier for the loan. |
| Customer Name | Display | Name of the borrower linked to this loan. |
| Employee Name | Display | The loan officer assigned to this loan. |
| Loan Amount (₹) | Display | Principal loan amount. |
| Status | Badge | Disbursed (green), Pending, or Approved — colour-coded for quick identification. |
| Download | Dropdown Button | Opens a document download menu with 12 document options. |
| Edit | Icon Button | Opens the loan form for editing. |
| Approve | Icon Button | Submits the loan for formal approval. |
| Delete | Icon Button | Removes the loan record from the system. |
| Search | Text Input | Filters the loan table in real time as the user types. |

### 6.3 Loan Approval Workflow

The system enforces a clear, three-stage workflow for every loan. This structure ensures that no funds are released without formal authorisation, and that a complete, traceable status trail exists for every loan file.

| List / View | Description | Access Path |
|---|---|---|
| Loan List | All loans regardless of their current status. | Loan > Loan List |
| Approved Loan List | Loans that have been formally reviewed and sanctioned. | Loan > Approved Loan List |
| Disbursed Loan List | Loans where funds have been physically released. | Loan > Disbursed Loan List |
| Loan Approval | Pending loans awaiting an authorised approver's action. | Loan > Loan Approval |

---

## 7. Document Generation & Downloads

One of the most operationally significant features of the system is its ability to automatically generate a complete set of legally compliant documents for every loan. Rather than drafting these documents manually — a time-consuming and error-prone process — loan officers simply click the **Download** button on any loan record and choose from twelve ready-to-export document types.

Each document draws its content directly from the loan and customer records already in the system, ensuring accuracy and consistency across all outputs.

| # | Document Name | Description & Purpose |
|---|---|---|
| 1 | Download Receiver Details | Generates a summary document of the entity or person who received the disbursed loan funds, including their mobile number and verification documents. |
| 2 | Download Nominee Details | Produces a complete profile of the nominated beneficiary, covering identity proof, relationship, contact details, bank information, and photograph. |
| 3 | Download Guarantor 1 Details | Generates a detailed profile of the first guarantor — identity, bank details, address, and photo — for KYC compliance and legal reference. |
| 4 | Download Guarantor 2 Details | Generates the detailed profile of the second guarantor. Structurally identical to the Guarantor 1 report. |
| 5 | Download Contract | Produces the formal loan contract between the finance company and the borrower, including all agreed terms and conditions. |
| 6 | Loan Sanction Letter | Generates an official letter confirming the sanctioned loan amount, applicable interest rate, repayment tenure, and EMI schedule. |
| 7 | Download Promissory Note | Creates the legally binding promissory note signed by the borrower, committing to repay the loan as per agreed terms. |
| 8 | Download Cash Voucher | Generates a voucher confirming the cash disbursement of loan funds to the borrower or designated receiver. |
| 9 | Download Voucher | A general-purpose voucher document used for internal accounting and reconciliation. |
| 10 | Download Mortgage Details | Produces a document describing the mortgaged or pledged asset — vehicle or gold — held as security for the loan. |
| 11 | Gold Receipt | Generates a formal receipt for gold items received as collateral, including item name, weight, and number of pieces. |
| 12 | Declaration Form | Produces a declaration to be signed by the borrower, confirming the accuracy of all information submitted with the application. |

---

## 8. File Upload & Document Management

Supporting a paperless, audit-ready lending operation requires more than capturing text data — it requires a place to store and associate the physical documents that underpin every lending decision. The Dada Finance LMS integrates file upload capability across all major sections of the platform, making digital KYC and document retention a seamless part of every workflow.

File uploads are implemented using the browser's native file chooser, which supports the selection of multiple files in a single operation where relevant.

| Section | Upload Purpose | Notes |
|---|---|---|
| Customer Registration | Bank proof (passbook or cancelled cheque) | Linked directly to the primary customer's bank account record. |
| Nominee Details | Nominee bank proof and ID document | Supports identity and banking KYC for the nominee. |
| Guarantor 1 Details | Guarantor bank proof and ID document | KYC document storage for the first guarantor. |
| Guarantor 2 Details | Guarantor bank proof and ID document | KYC document storage for the second guarantor. |
| Security Deposit — Vehicle | Vehicle documents and photographs | RC Book, insurance papers, and vehicle images. |
| Security Deposit — Gold | Gold valuation certificate and photos | Valuation certificate and item images for collateral record. |
| Receiver Customer Details | Receiver verification document | Confirms the identity of the person receiving the disbursed loan amount. |

---

## 9. Camera & Photo Capture Feature

Field officers often need to capture photographs at the point of customer interaction — not later, not from email attachments, but in the moment. The Dada Finance LMS addresses this directly with a built-in webcam-based photo capture feature that works entirely within the browser, without requiring any external apps or plugins.

When **Start Camera** is clicked in any supported section, the system activates the device's webcam and displays a live preview in a thumbnail area within the form. The captured photograph is automatically saved and associated with the corresponding profile record.

Photo capture is available in the following sections:

| Section | Field Label |
|---|---|
| Customer Registration | Click Profile Photo → Start Camera |
| Nominee Details | Update Profile Photo → Start Camera |
| Guarantor 1 Details | Update Profile Photo → Start Camera |
| Guarantor 2 Details | Update Profile Photo → Start Camera |

---

## 10. Loan Lifecycle & Status Workflow

Every loan in the system progresses through a well-defined sequence of stages. This workflow is enforced by the platform — a loan cannot skip stages — and it ensures that approvals always precede disbursements, with a complete, time-stamped history existing for every lending decision. Each stage is reflected as a status badge on the loan record.

| # | Stage | Description | Visible In | Status Badge |
|---|---|---|---|---|
| 1 | Registered | Loan form submitted by the responsible employee. Awaiting formal review. | Loan List, Loan Approval | `Pending` |
| 2 | Approved | Authorised approver has reviewed and sanctioned the loan. | Loan List, Approved Loan List | `Approved` |
| 3 | Disbursed | Funds have been physically released to the borrower or designated receiver. | Loan List, Disbursed Loan List | `Disbursed` 🟢 |

---

## 11. User Roles & Access Control

The system is built around role-based access, meaning each type of user sees and can do only what is appropriate for their function. This protects sensitive customer and financial data, ensures workflow integrity, and provides a clear line of accountability for every action taken within the platform.

| Role | Permissions | Notes |
|---|---|---|
| Administrator | Full access: master data, employee management, customer records, loan operations, approvals, and system configuration. | Manages configuration, user roles, and all system settings. |
| Employee / Loan Officer | Add and manage customers, register loans, view assigned records. | Appears in the Select Employee dropdown on Customer and Loan forms. |
| Approver | Review and formally approve loans in the Loan Approval screen. | Required step before any loan can move to Disbursed status. |
| Viewer | Read-only access to reports, lists, and loan records. | Typically used for audit and compliance review purposes. |

---

## 12. Technical Information

The Dada Finance LMS is a modern, browser-based web application that requires no local installation or device-specific configuration. Any device with a supported browser and internet connection can access the full system.

### 12.1 Platform Details

| Property | Detail |
|---|---|
| Application Type | Web-based — accessible via any modern browser without installation. |
| Production URL | https://loanmanage.hiredeveloper.today |
| Interface Style | Responsive web application with persistent sidebar navigation and breadcrumb orientation. |
| Date / Time Display | System datetime shown in footer (e.g., Date: 12-6-2025, Time: 5:58:08 AM). |
| Copyright Notice | Copyright © 2025 Dada Finance Corporation. All rights reserved. |

### 12.2 Technology Stack

The system is built and delivered as a fully web-based application. Based on the observed production interface, the following technology characteristics apply:

- **Frontend** — Responsive browser-based UI with a persistent sidebar layout, real-time filtering, and dynamic dropdowns. No page reloads required for core interactions.
- **Date Handling** — All date fields use the browser-native date picker with dd/mm/yyyy display format.
- **File Handling** — Native browser file chooser (`<input type="file">`) supporting bulk file selection.
- **Camera Integration** — Browser-native `getUserMedia` API for webcam-based photo capture, with live preview rendered within the form.
- **Auto-calculations** — Interest amounts computed client-side or server-side from principal, rate, and installment count inputs.
- **Auto-ID Generation** — Application Numbers and Loan IDs are server-generated upon form submission.
- **Document Generation** — 12 document types generated server-side per loan record, available for immediate download.

### 12.3 Data Entry Standards

The system enforces consistent data entry standards across all forms to ensure data quality and regulatory compliance:

- Date fields use `dd/mm/yyyy` format with a browser-native date picker.
- Currency fields display and accept amounts in Indian Rupees (₹).
- Aadhar numbers follow the standard **12-digit** format.
- PAN numbers follow the **10-character** alphanumeric format.
- IFSC codes follow the standard **11-character** format used for NEFT/RTGS transfers.
- All forms include a **Submit** or **Update** button; sections can be saved independently where applicable.

### 12.4 Real-Time & Dynamic Features

Several features of the platform operate dynamically without requiring page reloads, improving the speed and responsiveness of day-to-day operations:

- In-list search bars on the Loan List and Customer List screens filter records in real time as the user types.
- City and Area dropdowns are dynamically populated based on upstream selections (State → City → Area) from master data.
- Status badges are colour-coded — **green for Disbursed** — for immediate visual recognition of loan status.
- Application Numbers and Loan IDs are automatically generated by the system upon form submission.
- Interest amounts are auto-calculated from the entered principal, interest rate, and number of installments.

---

## 13. Complete Feature Summary

The following table provides a consolidated reference of all major features in the Dada Finance Corporation Loan Management System. This summary is useful for stakeholder reviews, sprint planning, and QA test coverage mapping.

| # | Feature | Module |
|---|---|---|
| 1 | Master Data Management — State, City, Area, Branch, Loan Type, Bank configuration. | Master |
| 2 | Employee Registration and Directory Management. | Employee |
| 3 | Comprehensive Customer Registration with full KYC fields. | Customer |
| 4 | Nominee Profile Capture — Identity, Bank Details, and Photograph. | Customer > Details |
| 5 | Dual Guarantor Profiles — Guarantor 1 and Guarantor 2 with full KYC. | Customer > Details |
| 6 | Loan Registration with Flat Rate interest calculation. | Loan |
| 7 | Vehicle Security Deposit Capture — Model, RC Book, Chassis Number, Keys. | Loan > Security |
| 8 | Gold Security Deposit Capture — Weight, Number of Pieces, Item Description. | Loan > Security |
| 9 | Receiver Customer Details — Captures identity of the fund disbursement recipient. | Loan |
| 10 | Three-Stage Loan Approval Workflow — Pending → Approved → Disbursed. | Loan |
| 11 | Approved Loan List and Disbursed Loan List as separate filtered views. | Loan |
| 12 | 12 Auto-Generated Downloadable Legal and Financial Documents per loan. | Loan List |
| 13 | Integrated Webcam-Based Photo Capture for Customer, Nominee, and Guarantors. | Customer |
| 14 | File Upload for Bank Proofs, Security Documents, and Verification Records. | Customer / Loan |
| 15 | Real-Time Search Filtering across all data list views. | All Lists |
| 16 | Multi-Branch Operational Support across locations. | Master / Customer |
| 17 | Geographic Hierarchy — State > City > Area — for customer classification. | Master / Customer |
| 18 | System Date-Time Display and Audit Trail in Footer. | System-wide |
| 19 | Edit and Delete Controls on All List Views. | All Lists |
| 20 | Interest Auto-Calculation from Principal, Rate, and Installment Count. | Loan Registration |

---

## 14. Glossary

The following terms are used throughout this document and within the Dada Finance LMS interface. They reflect standard Indian financial and regulatory terminology.

| Term | Definition |
|---|---|
| Aadhar | The 12-digit unique identity number issued by UIDAI to every Indian resident. |
| PAN | Permanent Account Number — a 10-character tax identification code issued by the Income Tax Department. |
| IFSC | Indian Financial System Code — an 11-character code that uniquely identifies a bank branch for NEFT and RTGS transfers. |
| EMI | Equated Monthly Instalment — the fixed periodic payment amount due from the borrower for loan repayment. |
| Flat Rate | A loan pricing structure where interest is calculated on the original principal throughout the entire repayment tenure. |
| Guarantor | A third party who formally agrees to repay the loan if the primary borrower defaults on their obligations. |
| Nominee | The person designated to receive benefits or assets in the event of the borrower's death. |
| Disbursement | The act of releasing the sanctioned loan funds to the borrower or their designated receiver. |
| RC Book | Registration Certificate Book — the official vehicle ownership document issued by the Regional Transport Office in India. |
| Chassis Number | A unique serial number that permanently identifies the frame of a specific vehicle. |
| Security Deposit | An asset — such as a vehicle or gold — pledged by the borrower as collateral to secure a loan. |
| Sanction Letter | An official letter issued to the borrower confirming loan approval, including the sanctioned amount and repayment terms. |
| Promissory Note | A legally binding written document in which the borrower promises to repay a specified loan amount by a defined date. |
| Mortgage Details | Documentation describing the property or assets that have been pledged as security for the loan. |
| Declaration Form | A document signed by the borrower confirming that all information submitted with the loan application is accurate and truthful. |
| KYC | Know Your Customer — the regulatory process of verifying the identity, address, and financial standing of a customer before lending. |

---

*End of Document*

*Copyright © 2025 Dada Finance Corporation. All rights reserved.*


create more domo data 10 to 15 peaopler for all the features and functionaltyimprove enire page ui design dropdown menu