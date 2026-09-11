# MultiDiagPortal

A full-stack web platform for managing a fleet of vehicles and their ECUs (Electronic Control Units) — tracking brands, families, device types, firmware updates, and calibrations — with secure role-based access for admins, managers, and team members.

## Features

### Authentication & Users
- **JWT Authentication** — Access & refresh tokens, secure login/logout
- **Email Verification** — Account activation via verification link
- **Role-based Access** — Admin, Manager, User, Team Leader roles
- **Profile Management** — Edit profile, avatar upload, password strength check
- **Password Recovery** — Self-service password reset flow

### ECU & Vehicle Management
- **Vehicle Catalog** — Browse vehicles with pagination, filter by brand
- **Brands & Families** — Manage vehicle brands (Marques) and families (Familles)
- **ECU Catalog** — Track ECUs (Ecus), device types (TypeDev), and device states (EtatDev)
- **Firmware Updates** — Manage ECU updates (Maj) per vehicle/device
- **Calibration Verification** — Cartography (Carto) verification workflow

### Collaboration & Tracking
- **Group Workspace** — Shared team workspace
- **Planning** — Team scheduling and planning tools
- **Activity History** — Full audit trail of user/system actions
- **Admin User Management** — Create, update, and manage user accounts

### Internationalization
- **FR / EN** language support across the interface

## Setup

### 1. Prerequisites
- Java 21 JDK
- Node.js 18+ & npm
- Angular CLI 18+
- PostgreSQL running locally (two databases: primary for users/auth, secondary for vehicles/ECUs)
- Maven 3.8+

### 2. Configuration

Copy the example config file and fill in your own credentials — **never commit `application.properties`**:

```bash
cp backend/src/main/resources/application.example.properties backend/src/main/resources/application.properties
```

Set at minimum your database credentials for both datasources — `spring.datasource.primary.*` (users/auth DB) and `spring.datasource.secondary.*` (vehicles/ECUs DB) — a fresh `application.security.jwt.secret-key`, and your mail credentials in `application.properties`.

For the frontend, check `frontend/src/environment.ts` and update `apiUrl` if your backend doesn't run on the default port.

### 3. Build & Run

**Backend**
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8084
```

**Frontend**
```bash
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

## Project Structure

```
.
├── backend/                          Spring Boot API (Java 21)
│   └── src/main/java/com/auth/SpringJwt/
│       ├── BaseMain/                 Auth, users, history, verification
│       │   ├── Controller/
│       │   ├── Service/
│       │   ├── Security/             JWT filter & security config
│       │   ├── Model/ · Repository/ · DTO/
│       │   └── filter/
│       ├── BaseEcu/                  Vehicles, ECUs, brands, updates
│       │   ├── Controller/
│       │   └── Service/
│       └── Config/                   DB config, data seeding
│
└── frontend/                         Angular 18 SPA
    └── src/app/
        ├── pages/                    Login, home, profile, users, planning...
        ├── components/               Nav, modals, dialogs, shared UI
        ├── users.service.ts          Auth & user API calls
        ├── users.guard.ts            Route guards (auth/admin)
        └── models/                   TypeScript interfaces
```

## Tech Stack

**Backend**
- Java 21 · Spring Boot 3 (Web, Security, Data JPA, Validation, Mail)
- PostgreSQL (dual datasource) · JJWT · Lombok

**Frontend**
- Angular 18 · TypeScript · Bootstrap 5

## Architecture

- **Dual-domain backend** — `BaseMain` (auth/users/history) and `BaseEcu` (vehicles/ECUs) as separate packages, each with its own controllers, services, and models
- **Dual-datasource JPA** — Two independent PostgreSQL databases, split by domain: the **primary DB** holds users, auth, and history; the **secondary DB** holds the ECU domain (vehicles, brands, families, device types, updates)
- **Stateless JWT auth** — Access + refresh token pair, validated per-request via a custom security filter
- **Route guards** — Frontend routes protected by auth and admin guards mirroring backend roles