# 🩸 منظومة "شريان" التفاعلية للرعاية الصحية والتبرع بالدم (ShurYan Healthcare System)

🏆 **الحائز على المركز الأول على مستوى الجمهورية (1st Place Republic Winner)** - مبادرة رواد مصر الرقمية (DEPI) تحت رعاية وزارة الاتصالات وتكنولوجيا المعلومات (MCIT).

---

## 🌟 نبذة عن المشروع (Project Overview)

**شُريان (ShurYan)** هي منظومة سحابية متكاملة لربط بنوك الدم المركزية والمستشفيات وغرف الطوارئ بالمتبرعين في أجزاء من الثانية أثناء الحالات الحرجة، مع توفير خدمات الاستشارات الطبية والعيادات الافتراضية، وإدارة السجل الطبي الموحد للمريض.

---

## 🏗️ البنية المعمارية والتقنيات المستخدمة (Architecture & Tech Stack)

### ⚙️ خوادم الأنظمة الخلفية (Backend Engineering):
- **الإطار الأساسي**: ASP.NET Core (.NET 8 Web API)
- **المعمارية**: Clean Architecture (Core, Application, Infrastructure, API, Shared, Tests)
- **أنماط التصميم (Design Patterns)**: Repository Pattern, CQRS, Dependency Injection, Unit of Work
- **قواعد البيانات**: SQL Server & Entity Framework Core (EF Core Migrations & Indexing)
- **التأمين والحماية**: JWT Tokens Authentication, Role-based Authorization (Patient, Doctor, Lab, Pharmacy, Admin)
- **التكامل الخارجي**: WebRTC Agora Tokens (الاستشارات المرئية), Paymob (بوابة الدفع الإلكتروني), MailKit (البريد الإشعاري)

### 🎨 الواجهات الرقمية (Frontend Web App):
- **الإطار والتقنيات**: React.js, Vite, TailwindCSS
- **إدارة الحالة والطلب**: Context API, Custom Hooks, Axios Client Interceptors
- **الأيقونات والتجاوب**: Lucide React Icons, Fully Responsive RWD Layout

---

## 📂 الهيكل التنظيمي للمستودع (Monorepo Directory Structure)

```text
shuryan-healthcare-system/
├── backend/                  # خوادم الـ .NET 8 Backend & Clean Architecture Solution
│   └── src/
│       ├── Shuryan.API/           # Web API Controllers & Middleware
│       ├── Shuryan.Application/   # Application Services, DTOs & Business Logic
│       ├── Shuryan.Core/          # Domain Entities, Interfaces & Specifications
│       ├── Shuryan.Infrastructure/ # EF Core DB Context & Repositories
│       ├── Shuryan.Shared/        # Shared Utilities & Extensions
│       └── Shuryan.sln            # Visual Studio Solution File
├── frontend/                 # تطبيق الـ React + Vite Frontend Web Application
│   ├── src/                       # React Components, Pages, State & Services
│   ├── public/                    # Static Assets & Images
│   ├── package.json
│   └── vite.config.js
└── README.md                 # التوثيق الشامل والرسمي للمشروع
```

---

## 🚀 التشغيل والإعداد المحلي (Local Development Setup)

### 1. تشغيل خوادم الـ Backend:
```bash
cd backend/src
dotnet restore
dotnet build Shuryan.sln
dotnet run --project Shuryan.API/Shuryan.API.csproj
```
- سيعمل الـ API التفاعلي على البورت المحلي: `http://localhost:5117`
- يمكنك معاينة الـ APIs عبر صفحة Swagger UI على: `http://localhost:5117/swagger`

### 2. تشغيل تطبيق الـ Frontend:
```bash
cd frontend
npm install
npm run dev
```
- سيعمل تطبيق الواجهة على البورت المحلي: `http://localhost:5173`

---

## 📜 الترخيص والحقوق (License & Authors)

- **قائد الـ Backend والمعمارية البرمجية**: م. سيف الدين محمد (Seif Elden Mohamed)
- **الجهة المانحة والداعمة**: وزارة الاتصالات وتكنولوجيا المعلومات (MCIT) ومبادرة DEPI.
