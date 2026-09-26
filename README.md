# 🩸 ShurYan | شُريان — Enterprise Healthcare & Telehealth System

🏆 **المركز الأول على مستوى الجمهورية (1st Place Republic Winner)** — مبادرة رواد مصر الرقمية (DEPI) تحت رعاية وزارة الاتصالات وتكنولوجيا المعلومات (MCIT).

---

## 🌟 Overview

**ShurYan (شُريان)** is an enterprise-grade telehealth, multi-role healthcare management, and emergency response platform. Built on **.NET 8** and **Clean Architecture**, the backend coordinates real-time video consultations, emergency SOS dispatching with medical-legal clinical snapshots, multi-provider credential verification, AI-driven clinical lab interpretations, and automated background job processing.

---

## 🏗️ System Architecture & Engineering Highlights

ShurYan is strictly decoupled using **Clean Architecture** and **Domain-Driven Design (DDD)** principles across 5 modular projects:

### 1. Real-Time Telemedicine & Agora RTC
- **Dual-Party Session State Machine**: State orchestrated across `Waiting → Active → Ended / Abandoned` with audit timestamps (`DoctorJoinedAt`, `PatientJoinedAt`).
- **Dynamic Media Token Issuance**: Generates time-bound, secure Agora RTC credentials upon state transitions.
- **SignalR Dual-Sync**: Real-time channel `/hubs/video-notify` instantly signals clients when both parties enter the room, synchronizing WebRTC media pipelines.

### 2. Emergency SOS Pipeline & Immutable Clinical Snapshot
- **Low-Latency Geolocation Dispatch**: Patients trigger SOS alerts with live GPS coordinates (`Latitude`, `Longitude`).
- **Immutable Clinical Snapshotting**: At the exact moment of distress, serializes a frozen JSON snapshot of the patient's vitals, allergies, chronic conditions, and current medications into the database (`EmergencyEvent.MedicalRecordSnapshot`). This prevents retroactive tampering and guarantees legal/medical auditability.
- **Instant SignalR Broadcasting**: Sub-second push alert to assigned physicians with high-priority audio-visual payload and patient coordinates.

### 3. Defense-in-Depth Security & Identity
- **Multi-Role RBAC**: Role-Based Access Control customized across 6 system roles: `Patient`, `Doctor`, `Pharmacy`, `Laboratory`, `Verifier`, and `Admin`.
- **Dual-Token Pipeline**: Short-lived JWT Bearer tokens combined with stateful Refresh Token rotation with cryptographic IP tracking and proactive revocation.
- **Anti-Brute-Force OTP Engine**: High-entropy 6-digit OTP generated via `System.Security.Cryptography.RandomNumberGenerator`. Includes automatic lockout after 5 consecutive failed attempts.
- **Partitioned Rate Limiting (.NET 8)**: Fine-grained throttling powered by `System.Threading.RateLimiting`: Global: 200 req/min, Auth: 10 req/min, Payment: 5 req/min, Webhook: 30 req/min.

### 4. Resilient AI / ML Microservice Integration
- **Automated Lab Summarization**: Integrates an external Python ML microservice hosted on Hugging Face to parse raw numerical and qualitative lab test results into an accurate, patient-friendly Arabic clinical summary.

### 5. Background Job Orchestration (Hangfire)
- **Persistent Distributed Jobs**: Hangfire integration with SQL Server storage executing every 30 minutes (`IPaymentExpiryJob`) to clean up stale pending transactions and restore appointment slots.

---

## 📁 Repository Structure

```text
shuryan-healthcare-system/
├── backend/                  # .NET 8 Web API & Clean Architecture Solution
│   └── src/
│       ├── Shuryan.API/           # 33+ Controllers, SignalR Hubs & Rate Limiters
│       ├── Shuryan.Application/   # Use-cases, DTOs, Services & Validators
│       ├── Shuryan.Core/          # 40+ Domain Entities, Enums & Interfaces
│       ├── Shuryan.Infrastructure/ # EF Core Data Access, Repositories & Migrations
│       ├── Shuryan.Shared/        # Security Helpers & Service Extensions
│       └── Shuryan.sln            # Solution File (0 Errors)
├── frontend/                 # React.js + Vite + TailwindCSS Web Application
│   ├── src/                       # UI Features, Components & Stores
│   ├── public/                    # Static Assets
│   └── vite.config.js
└── README.md                 # Full System Documentation
```

---

## 👨‍💻 Author & Credits

- **Backend Lead & System Architect**: Seif Elden Mohamed (سيف الدين محمد)
- **Award**: 1st Place Republic Winner — DEPI Initiative (MCIT)
