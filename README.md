# 🩸 ShurYan | شُريان — Enterprise Telehealth & Healthcare Platform

🏆 **المركز الأول على مستوى الجمهورية (1st Place Republic Winner)** — مبادرة رواد مصر الرقمية (DEPI) تحت رعاية وزارة الاتصالات وتكنولوجيا المعلومات (MCIT).

---

## 🌟 Overview & Problem Statement

**ShurYan (شُريان)** is an enterprise-grade digital healthcare management and telehealth platform built on **.NET 8** and **Clean Architecture**. The platform addresses key healthcare challenges in Egypt by connecting Patients, Doctors, Pharmacies, Laboratories, and Administrative Verifiers into a unified, secure ecosystem.

### Key Problems Solved:
1. **Finding Suitable Verified Doctors**: Advanced search by location, ratings, specialty, and pricing.
2. **Preventing Fraudulent Providers**: Strict manual verification system (Verifier Journey) reviewing syndicate cards, national IDs, and operational licenses before account activation.
3. **Manual Clinic & Schedule Management**: Digital booking system enforcing single-patient time slots to prevent double bookings.
4. **Unified Electronic Health Record (EHR)**: Secure medical history tracking chronic illnesses, allergies, past surgeries, current medications, digital prescriptions, and lab/x-ray reports.
5. **Medication Discovery & Home Delivery**: Locates the nearest 3 verified pharmacies stocking full prescriptions with price comparison and delivery or pick-up options.
6. **Streamlined Lab Testing**: Digital lab requests, online booking, home sample collection, and instant digital result delivery to patients and doctors.

---

## 🗺️ User Journeys & Core Ecosystem

### 🩺 1. Doctor Journey
- **Registration & Verification**: Profile creation with specialty, email verification, and document upload (Syndicate card, National ID, certificates).
- **Account Activation**: Document review by Verifiers within 24–48 hours to grant Verified status.
- **Consultation & EHR Access**: Inspection of patient medical history and live consultation session.
- **Digital Prescriptions & Reports**: Direct issuance of prescriptions and medical reports saved to the patient's permanent EHR.

### 💊 2. Pharmacy Journey
- **Registration & Verification**: License document submission for mandatory verification.
- **Profile & Delivery Setup**: Contact numbers, branch location, working hours, and home delivery fees.
- **Order Handling**: Instant notification of incoming prescriptions, price calculation, status updates, and home delivery or store pick-up choices.

### 🔬 3. Laboratory Journey
- **Registration & Activation**: Upload official laboratory licenses and accreditation documents.
- **Test Catalog & Pricing**: Customization of available tests, pricing, working hours, and home sampling availability.
- **Digital Result Delivery**: Real-time receipt of test requests and instant upload of digital results directly to patient and doctor profiles.

### 🛡️ 4. Verifier Journey (Compliance & Security)
- **Dashboard & Stats**: Live monitoring of pending provider registration requests.
- **Document Audit**: In-depth review of syndicate cards, IDs, and commercial licenses.
- **Approval / Rejection Engine**: Automated notifications dispatched to providers upon status updates with feedback.
- **Continuous Compliance**: Ongoing monitoring to enforce safety standards across the platform.

---

## 🤖 AI & Spatial Technology Integrations

### 💬 Google Gemini AI Chatbot (`GeminiAIService.cs`)
- **Architecture**: `ChatBot.jsx` → `useChat.js` → `ChatController.cs` → `GeminiAIService.cs` → `Google Gemini API`.
- **Role-Based System Prompts**: Custom system prompts strictly tailored for Patients (empathic guidance, specialty suggestions, strict disclaimer: ⚠️ *"لا تعطي تشخيص طبي أبداً"*) and Doctors (schedule management and patient tracking).
- **Context Preservation**: Maintains the last 10 conversation messages (`TakeLast(10)`) for conversational awareness.
- **Database Persistence**: Persistent conversation logs stored via `ChatMessage` entity using Repository & Unit of Work pattern.

### 📍 Interactive Geolocation & Haversine Distance Calculation
- **Frontend Map Engine**: Leaflet + OpenStreetMap (OSM) for smooth, open-source interactive map rendering.
- **Reverse Geocoding**: Browser `navigator.geolocation` combined with OpenStreetMap **Nominatim API** (`nominatim.openstreetmap.org/reverse`) to automatically extract Governorate, City, and Street details into form fields.
- **Backend Proximity Search**: **Haversine Formula** implemented server-side in C# (`CalculateDistance`) to securely calculate spatial distance between patient coordinates and nearby pharmacies (`R = 6371 km`).

---

## 🔒 Security & Performance Architecture

- **Clean Architecture & DDD**: 5 decoupled projects (`Shuryan.Core`, `Shuryan.Application`, `Shuryan.Infrastructure`, `Shuryan.Shared`, `Shuryan.API`).
- **Repository Pattern & Unit of Work**: Decoupled database operations ensuring high testability, maintainability, and transactional consistency.
- **JWT & Role-Based Access Control (RBAC)**: Fine-grained permissions enforced across 6 system roles (`Patient`, `Doctor`, `Pharmacy`, `Laboratory`, `Verifier`, `Admin`).
- **Real-Time SignalR Engine**: Real-time notifications for lab results, prescription status, and incoming requests without page refreshes.
- **Offset-Based Pagination & Dynamic Filtering**: Efficient pagination (page size 20), multi-field filtering (status, date range, patient name), and dynamic sorting.
- **Security Protections**: CORS policy enforcement, input validation against XSS/Injection, and secure password hashing.

---

## 📁 Repository Structure

```text
shuryan-healthcare-system/
├── backend/                  # .NET 8 Web API & Clean Architecture Solution
│   └── src/
│       ├── Shuryan.API/           # Controllers, SignalR Hubs & Middleware
│       ├── Shuryan.Application/   # Use-cases, DTOs, Services & Gemini AI Integration
│       ├── Shuryan.Core/          # Domain Entities, Enums & Interfaces
│       ├── Shuryan.Infrastructure/ # EF Core Data Access, Repositories & Migrations
│       ├── Shuryan.Shared/        # Security Helpers & Service Extensions
│       └── Shuryan.sln            # Solution File (0 Errors)
├── frontend/                 # React.js + Vite Web Application
│   ├── src/                       # UI Features, MapPicker, ChatBot & Hooks
│   ├── public/                    # Static Assets
│   └── vite.config.js
└── README.md                 # Full System Documentation
```

---

## 👨‍💻 Author & Credits

- **Backend Lead & System Architect**: Seif Elden Mohamed (سيف الدين محمد)
- **Award**: 1st Place Republic Winner — DEPI Initiative (MCIT)
