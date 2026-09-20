# LampungDevTech Platform

<div align="center">
  <img src="apps/web/public/lampungdevtech-logo.svg" alt="LampungDevTech Logo" width="80" height="80" />
  <h3>Developer Community Platform & Digital Business Ecosystem of Lampung</h3>
  <p>A collaborative hub for tech talent, local business empowerment, and next-generation digital learning solutions.</p>

  <p>
    <a href="https://github.com/lampungdevtech/lampungdevtech-platform/actions"><img src="https://img.shields.io/badge/CI-Passing-success?style=flat-square" alt="CI Status" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2024.x-brightgreen?style=flat-square" alt="Node.js Version" /></a>
    <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-%3E%3D%2011.x-orange?style=flat-square" alt="pnpm Version" /></a>
    <a href="https://nx.dev/"><img src="https://img.shields.io/badge/monorepo-Nx-blue?style=flat-square" alt="Nx Monorepo" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
  </p>
</div>

---

## 🎯 Project Motivation & Problem Statement

LampungDevTech was conceived not merely as a community directory, but as an integrated ecosystem built to solve four tangible challenges in Lampung Province:

### 1. Fragmentation in the Tech Talent & Community Ecosystem
- **Problem**: Tech community activities (meetups, workshops, certifications) are often scattered and poorly archived, hindering developers and students in Lampung from networking and advancing their digital skills.
- **Solution**: An integrated **MongoDB-powered Event Management system** featuring automated capacity controls, atomic waiting-list queues, and QR code-based check-in attendance.

### 2. Operational Sustainability for Early-Stage Cafe & F&B Entrepreneurs
- **Problem**:
  - **Mismanagement of Initial Capital (CapEx vs. OpEx)**: Most novice cafe owners fail to track upfront capital investments (rent, espresso machines, bar fit-outs), blinding them to their true Break-Even Point (BEP) and net profit margins.
  - **Raw Material Leakage & BOM Inaccuracy**: The absence of precise Bill of Materials (BOM) tracking leads to unchecked waste and theft of milk, syrups, and coffee beans, eroding margins.
  - **Offline Vulnerability**: Pure-cloud POS systems fail when internet connections drop during peak hours, causing long queues and lost revenue.
  - **Multi-Branch Blind Spots**: Expanding to a second or third branch makes centralized staff oversight, cash shift reconciliation, and real-time menu management difficult.
- **Solution**: LampungDevTech delivers an **Offline-First Multi-Branch Cafe POS Ecosystem**:
  - A desktop-optimized Business Owner Portal for tracking CapEx, calculating BEP, managing multiple branches, configuring recipes (BOM), and auditing staff performance.
  - A **React Native Expo Offline-First** tablet/mobile POS app running local SQLite and ULID generators that operates seamlessly without internet, complete with Bluetooth thermal printer (ESC/POS) integration and automated Kitchen Display System (KDS) alerts.

### 3. Financial Independence for Creators & Social Media Sellers (Partner Online Storefronts)
- **Problem**:
  - **Predatory Marketplace Commissions (10% - 20%)**: Online sellers and local creators who generate their own traffic via social media (Instagram bio, TikTok, WhatsApp) see their margins decimated by conventional e-commerce platform fees.
  - **Price Wars & Customer Disconnection**: Marketplaces place products alongside cutthroat competitors and conceal buyer WhatsApp contacts, crippling repeat orders and relationship building.
  - **Digital Product Delivery Barriers**: Traditional marketplaces require physical shipment waybills (resi), making it cumbersome to sell Canva templates, e-books, fonts, source code, or design presets.
- **Solution**: LampungDevTech introduces the **Partner Online Storefront Ecosystem (Social Commerce)**:
  - **0% Marketplace Take Rate**: 100% of sales revenue goes directly to the partner seller.
  - **Sub-Second Instant Storefronts**: Mobile-first link-in-bio storefronts (`lampungdev.tech/store/:slug`) built with Next.js 15 Server Components, primed for Meta Ads and TikTok Ads conversion.
  - **Automated Digital Product Fulfillment**: Instant delivery of Canva template duplication links, Google Drive/Notion access, or downloadable PDF files immediately upon payment confirmation without requiring shipping waybills.
  - **Dual Checkout Modes**: Rapid checkout via formatted WhatsApp direct messaging or automated QRIS dynamic payments.
  - **Instant Partner Onboarding**: A 2-minute registration form embedded directly on the `/toko-online` landing page with real-time slug availability checks.

### 4. Scalable Class Operations & AI-Assisted Visibility for EdTech & Learning Centers (Bimbel / STEM)
- **Problem**:
  - **Manual & Overbooked Class Enrollments**: Learning centers struggle with batch capacity limits, chaotic manual WhatsApp booking, and double-booking race conditions during peak enrollment cycles.
  - **Disconnected Parent Visibility**: Parents lack real-time insight into their child's attendance, completed homework quests, and conceptual mastery, relying on irregular paper report cards.
  - **Teacher Administrative Burnout**: Educators spend excessive hours compiling repetitive evaluation narratives and tracking attendance instead of focusing on mentorship and interactive instruction.
- **Solution**: LampungDevTech provides an **EdTech Class Operations, Self-Serve Enrollment & AI Progress Summarizer**:
  - **Gated Member Onboarding Funnel**: Seamless onboarding form to unlock workspaces tailored to Parents, Students, Teachers, and Admins.
  - **Distributed Concurrency Slot Locking**: Two-phase reservation architecture combining Redis SetNX distributed caching with PostgreSQL atomic conditional updates (`UPDATE ... WHERE booked_seats < max_seats`), guaranteeing zero double-booking under high load.
  - **AI Progress Summarizer Service**: An LLM-powered engine (Google Gemini API with structured deterministic fallback) converting raw teacher observations and homework metrics into warm, child-friendly weekly evaluations for parents.
  - **Multi-Role Collaborative Portals**: Interactive STEM curriculum catalog with live seat meters, Parent progress portal with Google Meet links, Teacher attendance & grading desk, and Admin batch capacity controls.

---

## 🔄 End-to-End Business & User Workflows

### 1. Cafe POS & Business Operations Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Partner (Owner)
    actor Admin as Super Admin
    actor Cashier as Staff / Cashier
    actor Kitchen as Barista / Kitchen
    participant Web as Web Platform
    participant Backend as Go Hexagonal Backend
    participant Rabbit as RabbitMQ Broker
    participant Mobile as Mobile POS (Tablet)
    participant Printer as Bluetooth Printer

    %% 1. Onboarding
    Note over User,Web: 1. Business Partner Onboarding
    User->>Web: Sign in via Google OAuth (Default Role: MEMBER)
    User->>Web: Visit /pos & Complete Partner Application
    Web->>Backend: Persist Application (Status: PENDING_APPROVAL)

    %% 2. Approval
    Note over Admin,Web: 2. Super Admin Verification
    Admin->>Web: Sign in via Google OAuth (Role: SUPER_ADMIN)
    Admin->>Web: Review & Approve Application at /admin/mitra
    Web->>Backend: Elevate Role -> MITRA_POS

    %% 3. Setup Owner
    Note over User,Web: 3. Business Portal Setup by Owner
    User->>Web: Access Owner Business Portal (Desktop Only)
    User->>Web: Input Initial Capital (CapEx & Cash Float)
    User->>Web: Create Multiple Branches & Assign Primary Branch
    User->>Web: Add Employees & Generate Unique 6-Digit PINs

    %% 4. Cashier Operations
    Note over Cashier,Mobile: 4. Cashier Shift Operations on Tablet/Mobile
    Cashier->>Mobile: Launch POS App -> Enter Staff Email + PIN
    Mobile->>Backend: Verify Staff PIN
    Mobile->>Cashier: Prompt: "Input Opening Cash Float"
    Cashier->>Mobile: Enter Float Amount -> Enter POS Register
    Cashier->>Mobile: Process Customer Orders (100% Offline via SQLite)

    %% 5. Kitchen & Receipt
    Note over Cashier,Kitchen: 5. Transactions & Kitchen Alerts
    Mobile->>Printer: Print Customer Receipt (Bluetooth ESC/POS)
    Mobile->>Backend: Sync Order (or Queue if Offline)
    Backend->>Rabbit: Publish 'order.created' event
    Rabbit->>Kitchen: Alert Kitchen Display System (KDS) & Auto-Print Order Slip

    %% 6. Shift Close & Reports
    Note over Cashier,User: 6. Shift Closing & Owner Analytics
    Cashier->>Mobile: Close Shift (Count & Input Final Cash)
    Mobile->>Backend: Calculate Cash Variance
    User->>Web: Monitor Real-Time Revenue, Z-Reports, & Staff Efficiency
```

### 2. Online Storefront & Digital Product Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Member as Member / Partner Seller
    actor Buyer as Shopper (from Bio / Ads)
    participant Web as Web Platform (Next.js 15 SSR)
    participant DB as MongoDB Native (stores, products, orders)
    participant WA as WhatsApp Seller / QRIS Gateway

    %% 1. Onboarding
    Note over Member,Web: 1. Instant Storefront Onboarding
    Member->>Web: Visit /toko-online & Complete 2-Min Form
    Web->>DB: Validate Slug Real-Time & Create Store (Status: ACTIVE)
    Web-->>Member: Storefront Live at /store/:slug

    %% 2. Setup Digital Products
    Note over Member,Web: 2. Publish Digital Product Catalog
    Member->>Web: Access /dashboard/mitra-store -> Add Digital Product
    Member->>Web: Input Name, Price, Promo Price, & Canva/PDF Access Link
    Web->>DB: Persist Product to store_products Collection

    %% 3. Customer Purchasing
    Note over Buyer,Web: 3. Shopper Visits Storefront from Bio / Ad Link
    Buyer->>Web: Open lampungdev.tech/store/:slug (Loads in < 1s)
    Buyer->>Web: Select Product -> Complete Single-Step Checkout

    alt Option A: WhatsApp Direct Checkout (Social Media Favorite)
        Buyer->>Web: Click "Order via WhatsApp"
        Web->>DB: Persist Order (Channel: WHATSAPP_DIRECT)
        Web-->>Buyer: Redirect to Seller WhatsApp with Formatted Order Summary
    else Option B: Automated QRIS Payment
        Buyer->>Web: Click "Pay Automatically (QRIS)"
        Web-->>Buyer: Display Dynamic QRIS Barcode
        Buyer->>WA: Complete Payment via Banking App / E-Wallet
        Buyer->>Web: Confirm Payment
        Web->>DB: Update Order Status -> PAID
        Web-->>Buyer: Unlock Canva Template Link / Direct PDF Download Instantly!
    end
```

### 3. EdTech Class Operations & Self-Serve Enrollment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent / Student
    actor Teacher as Teacher / Mentor
    actor Admin as Bimbel Admin / Ops
    participant Web as Web Platform (/edutech)
    participant API as Universal API Gateway
    participant Backend as Go EdTech Service
    participant Redis as Redis Distributed Cache
    participant DB as PostgreSQL (pos_db)
    participant LLM as Google Gemini API

    %% 1. Gated Onboarding
    Note over Parent,Web: 1. Gated Member Onboarding Funnel
    Parent->>Web: Visit /edutech -> Fill Onboarding Form (Role: PARENT)
    Web->>API: POST /api/edutech/register
    API-->>Web: Member Authenticated & Workspaces Unlocked

    %% 2. Program Exploration & Slot Locking
    Note over Parent,Backend: 2. Self-Serve Booking & Concurrency Slot Locking
    Parent->>Web: Browse Catalog (Koding, Matematika, Sains & STEM)
    Parent->>Web: Select Class Batch (e.g. EDC-01, Max 10 Seats) -> Click "Daftar Sekarang"
    Web->>Backend: POST /api/v1/edutech/enroll (ClassID, StudentName, Phone)
    Backend->>Redis: SetNX lock:class:{id} (TTL 10s)
    Backend->>DB: UPDATE edutech_classes SET booked_seats = booked_seats + 1 WHERE id = $1 AND booked_seats < max_seats RETURNING id, booked_seats;
    alt Seats Available (booked < max)
        DB-->>Backend: Row Updated (booked_seats = 8, max_seats = 10)
        Backend->>DB: INSERT INTO edutech_enrollments (Status: CONFIRMED)
        Backend->>Redis: Del lock:class:{id}
        Backend-->>Web: 201 Created (Enrollment Confirmed & Invoice Issued)
        Web-->>Parent: Display Instant Booking Success & Google Meet Link
    else Class Full (booked == max)
        DB-->>Backend: 0 Rows Affected
        Backend->>Redis: Del lock:class:{id}
        Backend-->>Web: 409 Conflict (ErrClassFull)
        Web-->>Parent: Prompt: "Batch Penuh, Silakan Pilih Jadwal Lain"
    end

    %% 3. Teacher Class Operations
    Note over Teacher,LLM: 3. Class Attendance & AI Weekly Progress Synthesis
    Teacher->>Web: Switch to Teacher Desk (/edutech?tab=teacher)
    Teacher->>Web: Mark Attendance (Present / Excused / Absent)
    Teacher->>Web: Review & Grade Homework Quests
    Teacher->>Web: Enter Teacher Notes -> Click "Buat Evaluasi AI"
    Web->>Backend: POST /api/v1/edutech/ai/summarize
    Backend->>LLM: Generate Content (gemini-1.5-flash System Prompt)
    LLM-->>Backend: JSON (Summary, Concepts Mastered, Recommendations)
    Backend->>DB: INSERT INTO edutech_weekly_summaries
    Backend-->>Web: 200 OK (AI Narrative Card Displayed)

    %% 4. Parent Visibility & Admin Operations
    Note over Parent,Admin: 4. Progress Visibility & Capacity Operations
    Parent->>Web: Switch to Parent Portal -> View Live Meet Link & AI Report Card
    Admin->>Web: Switch to Admin Ops -> Monitor Real-Time Occupancy & Toggle Batches
```

---

## 🌟 Key Features

### 1. Community Platform & Event Management
- **Bilingual Support (i18n)**: Fully localized routes `/id` (Default) and `/en`, cookie-persisted language preferences, and interactive Language Switcher component.
- **MongoDB-Powered Event Engine**: Event catalog, full-text search, category filtering, atomic ticket capacity decrement (`$inc`), automated waitlists, and QR code check-in attendance.

### 2. Cafe POS Business Solutions (POS Partners)
- **Interactive BEP & ROI Calculator**: Break-even time simulations based on rental overhead, espresso machinery, BOM costs, and daily sales targets.
- **Multi-Branch Operations**: Multi-store management, table layout configuration, and branch-specific menu pricing.
- **Bill of Materials (BOM) & Automated Cost of Goods Sold (COGS)**: Recipe-to-inventory mapping to prevent ingredient leakage and calculate gross margins per menu item.
- **Staff Access & PIN Authentication**: Employee onboarding with unique 6-digit PIN generators for fast shared-device login without Google OAuth.
- **Staff Performance Analytics**: Tracking transaction volumes, cashier revenue contribution, fulfillment speed, and shift cash discrepancy history.

### 3. Mobile POS (React Native Expo)
- **Offline-First Resilience**: Uninterrupted operations without internet connectivity using **SQLite (`expo-sqlite`)** and **ULID** generators.
- **Background Sync Queue**: Automated transaction ingestion upon reconnecting with idempotent API protection.
- **Bluetooth ESC/POS Thermal Printing**: Instant printing of customer receipts and kitchen tickets.

### 4. Partner Online Storefronts & Social Commerce
- **0% Platform Take Rate**: Partner sellers retain 100% of their sales revenue with zero platform commission deductions.
- **Sub-Second Mobile Storefronts (Link in Bio)**: Responsive storefronts (`/store/[storeSlug]`) rendered via Next.js 15 Server Components, optimized for high conversion from Meta Ads, TikTok Ads, and Instagram bios.
- **Automated Digital Product Fulfillment**: Instant access delivery for Canva template links, Google Drive/Notion folders, or PDF downloads immediately upon payment confirmation without physical waybills.
- **Dual Checkout Options**:
  - *WhatsApp Direct Mode*: Pre-fills seller WhatsApp chats with structured order summaries (buyer details, product, total).
  - *Automated QRIS Mode*: Seamless QR payment with real-time verification and instant digital asset unlocking.
- **Instant Embedded Onboarding**: A 2-minute registration form embedded on the `/toko-online` landing page with real-time slug availability checks.
- **Unified Seller Dashboard**: A dedicated portal at `/dashboard/mitra-store` for tracking revenue, managing digital catalogs, and processing incoming orders.

### 5. EdTech Class Operations, Self-Serve Enrollment & AI Progress Summarizer
- **Gated Member Onboarding Funnel**:
  - Mandatory registration gate ensuring all prospective parents, teachers, and admins create an identity profile before accessing platform workspaces.
  - Multi-role persona selection (`Parent / Student`, `Teacher / Mentor`, `Admin / Operations`) with persistent LocalStorage state and 1-click profile switching.
- **Distributed Concurrency Slot Locking (Zero Double-Booking)**:
  - **Fast-Lock Distributed Cache**: Redis SetNX locking (`lock:class:{classId}`, 10s TTL) acquired immediately upon checkout initiation.
  - **Transactional Atomic Conditional Update (PostgreSQL)**:
    ```sql
    UPDATE edutech_classes 
    SET booked_seats = booked_seats + 1 
    WHERE id = $1 AND booked_seats < max_seats 
    RETURNING id, booked_seats, max_seats;
    ```
    Guarantees strict capacity enforcement by returning `0 rows` and raising `ErrClassFull` (HTTP 409 Conflict) when a batch is full.
- **AI Progress Summarizer Service**:
  - Integrated with **Google Gemini API** (`gemini-1.5-flash`) to transform raw teacher notes and homework scores into warm, encouraging, child-friendly weekly evaluations.
  - Deterministic structured fallback synthesizer ensuring resilient zero-downtime operation even during offline development or external API rate limits.
- **Multi-Role Workspaces**:
  - **Curriculum Catalog & Booking Modal**: Visual capacity progress meters (`booked / max`), schedule badges, price display, and 1-click self-serve registration.
  - **Parent Visibility Portal**: Enrolled children schedules, direct Google Meet video session launcher, completed homework quest logs with mentor feedback, and the latest AI Weekly Progress Report Card.
  - **Teacher Desk Workflow**: Live class attendance checklist (Hadir / Izin / Alpa), curriculum topic checkboxes, homework submission grading, and 1-click AI evaluation generator.
  - **Admin & Operations Dashboard**: Platform-wide capacity occupancy metrics (% filled), active vs. full batch indicators, class status controls (ACTIVE / FULL / CLOSED), and enrollment invoice reconciliation.
- **Complete Bilingual Experience**: Seamless localization across `/id/edutech` and `/en/edutech` including navigation, hero banners, role badges, curriculum tracks, and dynamic AI reports.

---

## 🏗️ System Architecture & Technology Stack

```
                               ┌─────────────────────────────────────────────────────┐
                               │             Client & Application Layer              │
                               └─────────────────────────────────────────────────────┘
                                  │                     │                           │
                     ┌────────────┴──────────┐   ┌──────┴──────┐         ┌──────────┴──────────┐
                     │ Next.js 15 Web & POS  │   │ Mobile POS  │         │ EdTech Portal & KDS │
                     │   Owner Dashboard     │   │ (Expo/SQLite│         │ (Multi-Role Web UI) │
                     └───────────────────────┘   └─────────────┘         └─────────────────────┘
                                  │                     │                           │
                               ┌─────────────────────────────────────────────────────┐
                               │        API Gateway (Traefik / Nginx / Next.js)      │
                               └─────────────────────────────────────────────────────┘
                                  │                                                 │
                               ┌─────────────────────────────────────────┐   ┌──────┴──────────────┐
                               │   GoFiber Hexagonal Microservices       │   │ Google Gemini API   │
                               │   (REST fasthttp & gRPC Protobuf)       │   │ (AI Summarizer LLM) │
                               ├─────────────┬─────────────┬─────────────┤   └─────────────────────┘
                               │ auth-svc    │ order-svc   │ catalog-svc │              ▲
                               ├─────────────┼─────────────┼─────────────┤              │
                               │ inv-svc     │ finance-svc │ edutech-svc │──────────────┘
                               └─────────────┴─────────────┴─────────────┘
                                  │           │             │           │
            ┌─────────────────────┴───┐ ┌─────┴──────────┐ ┌┴───────────┴─────────┐
            │ PostgreSQL (Transactional│ │ MongoDB (Event │ │ Redis (Locks & Cache)│
            │  Ledger, Branches, Shift│ │  & Menu Catalog│ │ RabbitMQ (Outbox Bus) │
            │  & EdTech Classes/Quota)│ │                 │ │                      │
            └─────────────────────────┘ └────────────────┘ └──────────────────────┘
```

| Layer | Technology | Role / Description |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 15 (App Router), React 19, TypeScript | Public platform, partner portals, storefronts, owner dashboard, and EdTech workspace. |
| **Design & UI** | Tailwind CSS, Radix UI Primitives, Lucide Icons | Responsive layouts, dark/light modes, and internal package `@lampung-devtech/shared-ui`. |
| **Mobile POS** | React Native Expo, SQLite (`expo-sqlite`), ULID | Offline-first tablet/mobile POS cashier application with Bluetooth ESC/POS printing. |
| **Backend Services** | Go 1.23+, GoFiber (`fasthttp`), gRPC Protobuf | High-throughput microservices using Hexagonal (Clean) Architecture. |
| **AI Summarizer** | Google Gemini API (`gemini-1.5-flash`) | LLM synthesizer converting teacher notes into child-friendly weekly parent evaluations. |
| **Database** | PostgreSQL 16 & MongoDB 7.0 | PostgreSQL for ACID financial ledger & EdTech class batches; MongoDB for catalogs & events. |
| **Cache & Distributed Locks**| Redis 7 | Distributed locking for orders and atomic class seat booking (`lock:class:{id}`). |
| **Messaging** | RabbitMQ 3.13 (Topic Exchange) | Asynchronous event bus (*order.created*, *stock.low_alert*, *shift.closed*). |
| **Infrastructure** | Docker Compose & Kubernetes (K3s / Managed K8s) | Docker Compose for local dev; K8s with HPA autoscalers for peak traffic. |

---

## 📁 Repository Structure (Nx Monorepo)

```
lampungdevtech-platform/
├── apps/
│   ├── web/                                # Next.js 15 Web Platform & Multi-Vertical Portals
│   │   ├── app/
│   │   │   ├── [locale]/                   # Bilingual routes (/id, /en)
│   │   │   │   ├── events/                 # Event listings & detail pages
│   │   │   │   ├── pos/                    # POS landing page & partner registration
│   │   │   │   │   ├── register/           # POS partner registration form
│   │   │   │   │   └── dashboard/          # Cafe Owner Business Portal (BEP, CapEx, Staff)
│   │   │   │   ├── toko-online/            # Landing page & embedded partner registration
│   │   │   │   ├── store/[storeSlug]/       # Partner storefront & digital checkout
│   │   │   │   │   ├── [productSlug]/      # Product detail & single-step checkout
│   │   │   │   │   └── order/[orderId]/    # Order status & digital fulfillment
│   │   │   │   ├── dashboard/mitra-store/  # Partner seller dashboard (products & orders)
│   │   │   │   ├── admin/mitra/            # Super Admin partner approval portal
│   │   │   │   └── edutech/                # EdTech Class Operations & Enrollment Platform
│   │   │   └── api/                        # Universal API route handlers
│   │   │       ├── events/                 # Event registration & check-in APIs
│   │   │       ├── pos/                    # POS partner application APIs
│   │   │       ├── store/                  # Online store, slug validator, & checkout APIs
│   │   │       └── edutech/[...slug]/      # EdTech universal proxy (programs, classes, enroll, AI)
│   │   ├── components/                     # UI components & Design System
│   │   │   ├── edutech/                    # EdTech domain components & state stores
│   │   │   │   ├── types.ts                # TypeScript contracts for EdTech domain
│   │   │   │   ├── use-edutech-store.ts    # Reactive state store with LocalStorage persistence
│   │   │   │   ├── edutech-member-registration.tsx # Gated onboarding form component
│   │   │   │   ├── edutech-program-catalog.tsx    # Curriculum catalog & booking modal
│   │   │   │   ├── edutech-parent-portal.tsx      # Parent schedule, Meet links & AI report card
│   │   │   │   ├── edutech-teacher-workflow.tsx   # Teacher attendance, grading & AI generator
│   │   │   │   ├── edutech-admin-ops.tsx          # Capacity occupancy meters & status toggles
│   │   │   │   └── edutech-portal-client.tsx      # Main multi-role tab navigation container
│   │   │   ├── store/                      # Storefront onboarding & digital checkout
│   │   │   └── ...
│   │   ├── services/                       # Database service layer (MongoDB & PostgreSQL)
│   │   ├── types/                          # Shared TypeScript contracts
│   │   ├── i18n/                           # next-intl routing configuration
│   │   └── locales/                        # Bilingual dictionaries (id & en)
│   └── web-e2e/                            # End-to-End testing (Cypress)
├── backend/                                # Go Hexagonal Microservice Layer
│   ├── cmd/server/main.go                  # Server initialization & route mounting
│   └── internal/
│       ├── core/
│       │   ├── domain/edutech.go           # EdTech pure domain models & DTOs
│       │   ├── ports/edutech_ports.go      # Ports for repositories, services & AI
│       │   └── services/
│       │       ├── edutech_service.go      # Business use cases with Redis slot locking
│       │       ├── edutech_service_test.go # Concurrency race-condition unit tests
│       │       └── ai_summarizer_service.go# Gemini API & fallback evaluation engine
│       ├── infrastructures/repositories/
│       │   └── postgres_edutech_repo.go    # PostgreSQL adapter with atomic conditional SQL
│       └── interfaces/http/
│           ├── edutech_handler.go          # GoFiber REST handler for /api/v1/edutech/*
│           └── router.go                   # HTTP router configuration
├── packages/
│   └── shared-ui/                          # Shared UI component library (@lampung-devtech/shared-ui)
├── infra/postgres/                         # Relational Database Schemas & Seeds
│   ├── init.sql                            # DDL for 5 EdTech tables & performance indexes
│   └── seed.sql                            # Seed data for curriculum, batches, quests & AI logs
├── docs/                                   # Modular technical architecture specifications
│   ├── 01-event-management-mongodb.md      # Event Management (MongoDB) Specifications
│   ├── 02-pos-business-web-platform.md     # Owner Portal & POS Landing Specifications
│   ├── 03-pos-backend-hexagonal-microservices.md # GoFiber Hexagonal Backend Architecture
│   ├── 04-pos-mobile-offline-first.md      # SQLite, ULID, & ESC/POS Mobile POS Specifications
│   ├── 05-pos-devops-infrastructure-cicd.md# Kubernetes (K8s) & Docker Deployment Guide
│   ├── 06-mitra-store-digital-products.md  # Partner Storefronts & Digital Products Guide
│   ├── 07-single-vps-deployment-guide.md   # Single VPS Deployment & Production Setup
│   ├── ip-edutech-class-ops.md             # EdTech Architecture & Implementation Plan
│   ├── wk-edutech-class-ops.md             # EdTech Walkthrough & Verification Notes
│   └── pr-edutech-class-ops.md             # Pull Request Title & Description (English)
├── pnpm-workspace.yaml                     # pnpm workspace configuration
├── nx.json                                 # Nx task runner configuration
└── package.json                            # Monorepo root dependencies
```

---

## 🚀 Getting Started with Local Development

### Prerequisites
Ensure your development workstation has the following installed:
- **Node.js**: Version **>= 24.x LTS** (strictly matching the CI runner).
- **pnpm**: Version **>= 11.x** (monorepo package manager).
- **Docker & Docker Compose**: (Optional, for running PostgreSQL, MongoDB, Redis, and RabbitMQ locally).
- **Git**: Latest version.

### 1. Clone the Repository
```bash
git clone https://github.com/lampungdevtech/lampungdevtech-platform.git
cd lampungdevtech-platform
```

### 2. Install Workspace Dependencies
Use `pnpm` to install all workspace dependencies:
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy the template configuration files from `.env.example` to `.env` and `apps/web/.env.local`:
```bash
cp .env.example .env
cp .env.example apps/web/.env.local
```
> [!NOTE]
> The [`.env.example`](.env.example) file is fully documented in English and covers configurations for Web Platform, MongoDB, PostgreSQL, Redis, RabbitMQ, JWT Secrets, Google OAuth credentials, and Gemini API keys (`GEMINI_API_KEY`).

### 4. Run the Web Development Server (Nx Dev)
Start the Next.js 15 web application using Nx:
```bash
# Start the web app
pnpm exec nx dev web

# Or using shortcut script
pnpm start:web
```
Open your browser and navigate to the following endpoints:
- **Home & Community**: `http://localhost:3000/` (Auto-redirects to `/id` or `/en`)
- **Event Management**: `http://localhost:3000/id/events`
- **Ticket Check-In Scanner**: `http://localhost:3000/id/events/check-in`
- **POS Business & Education**: `http://localhost:3000/id/pos`
- **Cafe POS Partner Registration**: `http://localhost:3000/id/pos/register`
- **Super Admin Partner Approval Portal**: `http://localhost:3000/id/admin/mitra`
- **Owner Business Portal (BEP & CapEx)**: `http://localhost:3000/id/pos/dashboard`
- **Cashier Terminal (Web Tablet Emulator)**: `http://localhost:3000/id/pos/terminal`
- **Kitchen Display System (KDS Kitchen & Bar)**: `http://localhost:3000/id/pos/kds`
- **Partner Storefront Landing Page & Registration**: `http://localhost:3000/id/toko-online`
- **Partner Seller Dashboard**: `http://localhost:3000/id/dashboard/mitra-store`
- **Partner Demo Storefront (Link-in-Bio)**: `http://localhost:3000/id/store/lampung-digital`
- **Digital Product & Fast Checkout Demo**: `http://localhost:3000/id/store/lampung-digital/bundle-canva-umkm-lampung`
- **EdTech Platform (Indonesian)**: `http://localhost:3000/id/edutech`
- **EdTech Platform (English)**: `http://localhost:3000/en/edutech`

### 5. Launch Local Infrastructure (Docker Compose)
To spin up PostgreSQL 16, MongoDB 7.0, Redis 7, and RabbitMQ 3.13 locally:
```bash
docker compose up -d
```
Service dashboards and connection ports:
- **RabbitMQ Management**: `http://localhost:15672` (User: `guest`, Pass: `guest`)
- **MongoDB Native**: `localhost:27017`
- **PostgreSQL**: `localhost:5432` (Database: `pos_db`)
- **Redis**: `localhost:6379`

### 6. Run the GoFiber Hexagonal Backend Service
Ensure Go 1.23+ or Docker is installed, then launch the service:
```bash
cd backend
go run cmd/server/main.go
# Or with Docker:
docker build -t pos-backend .
docker run -p 8080:8080 pos-backend
```
The service will be active on port `8080` (`http://localhost:8080/healthz`).
EdTech REST endpoints are mounted under `http://localhost:8080/api/v1/edutech/*`:
- `GET /api/v1/edutech/programs` — Retrieve active curriculum tracks
- `GET /api/v1/edutech/classes` — Retrieve batches with real-time seat availability
- `POST /api/v1/edutech/enroll` — Reserve a seat with distributed concurrency slot lock
- `POST /api/v1/edutech/ai/summarize` — Generate weekly AI progress narrative via Gemini API

### 7. Run the Mobile POS (React Native Expo)
To test the tablet and mobile cashier application on an Android, iOS simulator, or browser:
```bash
cd apps/mobile-pos
pnpm start
# Press 'w' for web preview, or 'a' for Android emulator
```

### 8. Testing, Linting & Production Build
Use unified commands from Nx:
```bash
# Validate TypeScript types across workspace
npx tsc --project apps/web/tsconfig.json --noEmit

# Run linter
pnpm exec nx lint web

# Run unit tests
pnpm exec nx test web

# Build production bundle
pnpm exec nx build web
```

---

## 📚 Technical Architecture Documentation (`/docs`)

Comprehensive architecture specifications and step-by-step implementation guides are maintained locally in the `/docs` directory (ignored by git to keep the core repository lightweight):
- `docs/01-event-management-mongodb.md` — Event Management, MongoDB Native, & Atomic Quota Specifications
- `docs/02-pos-business-web-platform.md` — Owner Portal, BEP Calculator, & Multi-Branch Specifications
- `docs/03-pos-backend-hexagonal-microservices.md` — GoFiber Hexagonal Microservices & RabbitMQ Event Bus
- `docs/04-pos-mobile-offline-first.md` — Offline SQLite Sync Engine, ULID, & Bluetooth ESC/POS
- `docs/05-pos-devops-infrastructure-cicd.md` — Kubernetes (K8s), Docker Compose, & Observability Specifications
- `docs/06-mitra-store-digital-products.md` — Partner Storefronts, Digital Products, & WhatsApp Checkout
- `docs/07-single-vps-deployment-guide.md` — Single VPS Deployment Guide & Production Hardening
- `docs/ip-edutech-class-ops.md` — EdTech Class Operations & Self-Serve Enrollment Implementation Plan
- `docs/wk-edutech-class-ops.md` — Comprehensive EdTech Walkthrough & Verification Guide
- `docs/pr-edutech-class-ops.md` — English Pull Request Title & Description
- `docs/walkthrough-event.md` — Community Events Implementation Walkthrough

---

## 🤝 Contribution Guidelines & Git Conventions

We warmly welcome community contributions! Please follow our workflow to keep development clean and consistent:

### Branching Model
- `main`: Production-ready release branch.
- `staging`: Integration branch before merging to `main`.
- `feat/<feature-name>`: Feature branch (branched from `staging`).
- `fix/<bug-name>`: Bugfix branch.

### Commit Message Standards (Conventional Commits)
Use Commitizen / Conventional Commits format:
```bash
feat(edutech): implement class operations, slot locking, and AI summarizer
feat(store): implement partner storefront and digital product delivery
fix(events): resolve atomic capacity decrement issue
docs(readme): add edutech vertical and update architecture documentation
test(backend): add concurrency test for class seat slot locking
```

---

## 💬 Community & Discussion
- **Telegram Group**: [t.me/lampungdevtech](https://t.me/lampungdevtech)
- **GitHub Discussions**: [github.com/lampungdevtech/lampungdevtech-platform/discussions](https://github.com/lampungdevtech/lampungdevtech-platform/discussions)
- **Official Website**: [lampungdev.tech](https://lampungdev.tech)

---

## 📄 License
This repository is licensed under the open-source [MIT License](LICENSE).
