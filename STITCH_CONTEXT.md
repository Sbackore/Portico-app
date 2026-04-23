# PÓRTICO — DESIGN CONTEXT FOR STITCH AI
> **Purpose of this document:** Full product + technical context to enable a design AI agent (Google Stitch) to generate, improve, and iterate on the Pórtico mobile frontend with complete understanding of the product, its backend, business logic, and existing visual direction.

---

## 1. PRODUCT OVERVIEW

**Product name:** Pórtico  
**Category:** B2C Fintech mobile app (Colombia)  
**Tagline:** *Tu puerta a las finanzas inteligentes*  
**Target user:** Colombian adults 25–45 who want a secure, intelligent personal finance companion  
**Competitive references:** Nequi, Nu Bank Colombia, Daviplata — clean, friendly, trustworthy  

### Core Value Proposition
Pórtico connects to the user's existing banks via Open Banking, monitors their transactions in real time using AI risk scoring, and protects their account through multi-layer security (biometric KYC, MFA/OTP, and runtime application self-protection). All powered by **Antigravity's suite of fintech APIs**.

---

## 2. TECH STACK

### Frontend (to be designed/built)
| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS v4** |
| UI Library | None yet — to be defined by Stitch |
| Font current | Geist Sans / Geist Mono (default Next.js) |
| Font target | **Inter** (preferred by design) |
| State management | TBD (Zustand or React Context recommended) |
| Real-time data | **Cloud Firestore** listeners (Firebase SDK) |
| HTTP client | fetch / axios → `BASE_URL = https://portico-backend-910308527640.us-central1.run.app` |

### Backend (already built & deployed)
| Layer | Technology |
|---|---|
| Framework | **NestJS** |
| Deployment | **Google Cloud Run** (us-central1) |
| Database | **Cloud Firestore** (Native mode, us-south1, DB: `portico-native`) |
| Auth | Antigravity APIs (API keys in Cloud Run env vars) |
| Global error filter | Normalizes all errors to `{ statusCode, error, message, path, timestamp }` |

**Backend URL:** `https://portico-backend-910308527640.us-central1.run.app`

---

## 3. BACKEND SERVICES — THE 5 MODULES

### 3.1 🪪 KYC — Verificación de Identidad
**What it does:** Registers biometric consent and processes identity verification results from Antigravity IDV.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/kyc/consentimiento` | Registers biometric consent → Firestore `consentimiento_biometrico` |
| POST | `/api/kyc/webhook` | Receives IDV result (APROBADO/RECHAZADO/REVISION) → `proceso_kyc` |

**Key HTTP responses:**
- `201` → Consent saved. Navigate to biometric capture.
- `400` → Missing fields. Show inline validation errors.
- `500` → Firestore error. Show blocking modal with Retry button.
- Webhook result states: `APROBADO` ✅ / `RECHAZADO` ⚠️ / `REVISION` ⏳

**UX note:** The frontend must listen to Firestore `proceso_kyc` in **real time** to show KYC result without polling.

---

### 3.2 🏦 Open Banking — Conexión y Alertas
**What it does:** Links user's bank account via Antigravity Recurrent Link and processes incoming transactions with a risk score formula.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/banking/link` | Creates Recurrent Link → saves `linkId` to Firestore `cuentas_bancarias` |
| POST | `/api/banking/webhook` | Ingests transaction + calculates risk score → `transacciones_raw` + `alertas_transacciones` |

**Risk Score Formula:** `score = α(Amount) + β(Location) + γ(Velocity) + δ(Device)`

**Score visual mapping:**
| Score | Color | User message | Actions available |
|---|---|---|---|
| > 80 | 🔴 Red | "Movimiento inusual detectado" | "Sí fui yo" · "Reportar" · "Bloquear" |
| 60–80 | 🟠 Orange | "Compra en ubicación diferente" | "Confirmar" · "Reportar" |
| < 60 | ✅ Green | "Pago verificado" | — (no action needed) |

**Key HTTP responses:**
- `201` → Link created. Show confetti animation + "¡Tu cuenta fue vinculada!".
- `400` → Missing userId/authCode. Return to form.
- `502` → Antigravity API unreachable. Show: "No pudimos conectar con tu banco."
- `500` → Firestore error. Retry modal.

---

### 3.3 🔐 OTP — Autenticación MFA
**What it does:** Triggers multi-factor authentication based on risk level and validates the code entered by the user.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/otp/trigger` | Requests OTP/Biometrics based on `nivelRiesgo` → returns `otpId` |
| POST | `/api/otp/verificar` | Validates OTP code → returns `{ valido: true/false }` |

**Risk level → authentication type:**
| `nivelRiesgo` | Auth method shown |
|---|---|
| `CRITICO` | Full biometric screen (Face ID / Fingerprint) |
| `ALTO` | 6-digit OTP input with 5-minute countdown |
| `MEDIO` | 4-digit PIN input |

**⚠️ CRITICAL FRONTEND LOGIC:**
The `/otp/verificar` endpoint **always returns HTTP 200**, regardless of whether the code is correct or not. The frontend MUST read `response.data.valido`:
- `valido: true` → Navigate to protected screen, show success checkmark
- `valido: false` → Stay on OTP screen, show shake animation on inputs, decrement attempt counter
- `valido: false` + attempts = 0 → Show "Cuenta bloqueada temporalmente por 30 minutos" screen

---

### 3.4 🔔 Notificaciones Push
**What it does:** Sends actionable security alerts across multiple channels and manages user notification preferences.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/notificaciones/enviar` | Sends alert → `{ enviado: true/false, canalesUsados: [] }` |
| PUT | `/api/notificaciones/config/:userId` | Updates channel preferences → `{ actualizado: true }` |

**Urgency levels → visual treatment:**
| `nivelUrgencia` | Visual | Actions |
|---|---|---|
| `INMEDIATA` | Full-width red card + forced modal if app in background | CONFIRMAR · REPORTAR · BLOQUEAR |
| `ALTA` | Orange card with left border accent | CONFIRMAR · REPORTAR |
| `INFORMATIVA` | Gray card, no action required | — |

**Channels managed by toggles:** Push notifications · WhatsApp · SMS · Email  
**`enviado: false`** (permissions off) → Log internally, do NOT show error to user.

---

### 3.5 🛡️ RASP — Runtime Application Self-Protection
**What it does:** The Antigravity Shield SDK detects device/runtime threats and POSTs them to this webhook. The backend degrades the account security score and can revoke sessions.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rasp/webhook` | Processes threat alert → degrades score, blocks sessions if CRÍTICA |

**Severity → frontend action:**
| `severidad` | Action taken | What user sees |
|---|---|---|
| `CRITICA` | Sessions revoked | Blocking modal: "Tu cuenta está temporalmente bloqueada" + countdown |
| `ALTA` | Score −20pts | Persistent orange banner + "Ver detalles" |
| `MEDIA` | Score −10pts | Alert in notification center, no redirect |
| `BAJA` | Score −5pts | Silent log in security events |

**Security score gauge:** `nivelSeguridadCuenta` (0–100) from `seguridad_dispositivo` collection — must be displayed as a circular gauge in real time.

---

## 4. FIRESTORE COLLECTIONS (Real-time data sources)

| Collection | Owning module | Key fields |
|---|---|---|
| `consentimiento_biometrico` | KYC | userId, version, proposito, dispositivo, timestamp |
| `proceso_kyc` | KYC | userId, estadoProcesoBiometrico, intentos, updatedAt |
| `transacciones_raw` | Banking | userId, idTransaccion, monto, comercio, score, fechaHora |
| `alertas_transacciones` | Banking | userId, score, titulo, acciones[], colorIndicador |
| `config_monitoreo` | Banking | userId, umbralAlerta, autoBloqueo |
| `cuentas_bancarias` | Banking | userId, linkId, banco, estado |
| `autenticacion` | OTP · RASP | userId, intentosFallidos, bloqueadoHasta |
| `verificaciones_otp` | OTP | otpId, userId, codigo, expiraEn, valido |
| `notificaciones_config` | Notificaciones | userId, push, whatsapp, sms, email, pausarTodas |
| `notificaciones_enviadas` | Notificaciones | userId, alertaId, urgencia, canalesUsados, leida |
| `alertas_rasp` | RASP | userId, tipoAmenaza, severidad, detectadoEn, procesado |
| `seguridad_dispositivo` | RASP | userId, nivelSeguridadCuenta, estadoRecuperacionCuenta, bloqueoTemporalHasta |

---

## 5. DESIGN SYSTEM

### 5.1 Color Palette — Light Mode (PRIMARY)
> The app supports both light and dark mode. Light mode is the primary target.

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F5F6FA` | Main background |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-purple` | `#6B4FA0` | Primary accent (CTA buttons, links, active states) |
| `--color-purple-dark` | `#4A2F7A` | Pressed states |
| `--color-purple-light` | `#EDE9F6` | Chip backgrounds, info banners |
| `--color-text-primary` | `#1A1D2E` | Headings |
| `--color-text-secondary` | `#6B7280` | Subtitles, captions |
| `--color-success` | `#2ECC71` | Verified, approved, confirmed |
| `--color-warning` | `#FF8C00` | Medium risk, pending |
| `--color-danger` | `#E53935` | Critical, blocked, error |
| `--color-info` | `#F59E0B` | Informational, countdown timers |
| `--color-border` | `#E8EAF0` | Card borders, dividers |

### 5.2 Color Palette — Dark Mode
| Token | Hex |
|---|---|
| `--color-bg` | `#0A0B1E` |
| `--color-surface` | `#0F1022` |
| `--color-purple` | `#7B5EA7` |
| `--color-border` | `#1E2040` |
| `--color-text-primary` | `#FFFFFF` |
| `--color-text-secondary` | `#6B7280` |

### 5.3 Typography
- **Primary font:** Inter (Google Fonts via `next/font/google`)
- **Fallback:** SF Pro Display (iOS), Roboto (Android)
- **Weights used:** 400 (body) · 600 (labels, links) · 700 (headings, CTAs)

### 5.4 Component Patterns
- **Border radius:** Cards `16–20px` · Buttons `999px` (pill) or `12px` · Inputs `12px`
- **Shadows:** `0 4px 24px rgba(107,79,160,0.12)` for cards
- **Transitions:** `200ms ease` for all hover/active states
- **Icons:** Lucide React (production target)
- **Mobile-first viewport:** 390×844px (iPhone 14)
- **Currency format:** `$4.850.000` (dot as thousands separator, Colombian pesos)

---

## 6. SCREEN MAP — 9 SCREENS TO BUILD

### Screen 1: Home / Dashboard  `/`
**Mockup:** ✅ Available (light + dark)  
**Components:**
- Greeting header + avatar
- Balance card with show/hide toggle (eye icon)
- "Cuenta verificada ✓" KYC badge (purple chip)
- 2×2 quick-action grid (Vincular Banco · Verificar Identidad · Seguridad · Alertas)
- Recent activity list with risk color dots (🔴🟠✅)
- Bottom navigation bar (4 tabs)

---

### Screen 2: KYC Consent  `/kyc/consentimiento`
**Mockup:** ✅ Available (light + dark, 2 states)  
**States:** Normal (consent) + Error (rejection with attempt counter)  
**API:** `POST /api/kyc/consentimiento`  
**Components:**
- Animated face-scan icon in purple circle
- Policy card with checkbox
- 3-step progress bar: Consentimiento → Verificación facial → Resultado
- Primary CTA pill button
- Error: red X icon, "Verificación no exitosa", "Intento 1 de 3" counter, retry button

---

### Screen 3: KYC Status  `/kyc/estado`
**Mockup:** ❌ None — needs to be created  
**States:** Loading · APROBADO · RECHAZADO (< 3) · RECHAZADO (≥ 3, blocked)  
**Data:** Firestore real-time listener on `proceso_kyc.estadoProcesoBiometrico`

---

### Screen 4: Banking Link  `/banking/vincular`
**Mockup:** ❌ None — needs to be created  
**States:** Bank selection · Connecting (loader) · Success (confetti) · Error (502/500)  
**API:** `POST /api/banking/link`

---

### Screen 5: Transaction Alerts  `/banking/transacciones`
**Mockup:** ✅ Available (light + dark, all 3 risk levels)  
**Data:** Firestore real-time on `alertas_transacciones` by `userId`  
**Components:**
- Tab bar: Todas · Pendientes · Resueltas
- Risk-coded alert cards with colored left border
- Inline action buttons per card (Sí fui yo · Reportar · Bloquear)
- "Open Banking conectado ✓" chip at bottom

---

### Screen 6: OTP / MFA  `/auth/otp`
**Mockup:** ✅ Available (light + dark, 3 states)  
**States:** Active input · Success (valido:true) · Error (valido:false) · Locked (0 attempts)  
**API:** `POST /api/otp/trigger` + `POST /api/otp/verificar`  
**Components:**
- 6-box OTP input (auto-advance on digit entry)
- Amber countdown timer (MM:SS)
- Disabled "Reenviar código" link (activates after timer)
- Risk level badge
- Success: green checkmark + "¡Todo en orden!"
- Error: red borders + shake CSS animation + attempts counter
- Locked: "Demasiados intentos" + countdown to unlock

---

### Screen 7: Notifications  `/notificaciones`
**Mockup:** ✅ Available (light + dark)  
**Data:** Firestore real-time on `notificaciones_enviadas` by `userId`  
**API:** `PUT /api/notificaciones/config/:userId`  
**Components:**
- Header with unread badge count
- Config section with channel toggles (Push/WhatsApp/SMS/Email + Master toggle)
- "✓ Preferencias guardadas" subtle success text (no HTTP code)
- Notification cards with urgency-based styling

---

### Screen 8: Security / RASP  `/seguridad`
**Mockup:** ✅ Available (light + dark)  
**Data:** Firestore real-time on `alertas_rasp` + `seguridad_dispositivo`  
**Components:**
- Circular gauge (0–100, green→orange→red gradient)
- "Protección activa" + "Dispositivo analizado" status chips
- Event list with colored left-border rows
- Blocking state: red banner + HH:MM:SS countdown
- "Hablar con soporte" CTA

---

### Screen 9: Error States (Global Reusable Component)
**Mockup:** ✅ Available (light + dark, 4 states)  
**Component variants:**
- `type="server"` → ⚠️ "Algo salió mal" + Reintentar + Contactar soporte
- `type="offline"` → ☁️ "Sin conexión. Revisa tu internet."
- `type="blocked"` → 🔒 "Tu cuenta está protegida · countdown"
- `type="rateLimit"` → ⊗ "Demasiados intentos · Bloqueado N min · countdown"

---

## 7. NAVIGATION STRUCTURE

```
Root Layout (src/app/layout.tsx)
├── Bottom Navigation (persistent — Home, Transacciones, Alertas, Perfil)
│   ├── Home (/)
│   ├── Transacciones (/banking/transacciones)
│   ├── Alertas (/notificaciones)
│   └── Perfil (/perfil)
│
├── Auth Flow (no bottom nav, full-screen)
│   └── /auth/otp
│
├── KYC Flow (modal stack)
│   ├── /kyc/consentimiento
│   └── /kyc/estado
│
├── Banking Flow
│   └── /banking/vincular
│
└── Security
    └── /seguridad
```

---

## 8. GLOBAL HTTP ERROR HANDLING

All backend errors follow this normalized structure:
```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "El campo 'uid' es obligatorio.",
  "path": "/api/kyc/consentimiento",
  "timestamp": "2026-04-15T00:00:00.000Z"
}
```

**Frontend translation rules (NEVER expose HTTP codes to users):**
| statusCode | UX Pattern |
|---|---|
| `400` | Inline form errors, red borders on inputs, toast with `message` field |
| `500` | Full-screen ErrorScreen or blocking modal with "Reintentar" button |
| `502` | Toast: "No pudimos conectar con el servicio. Inténtalo en unos minutos." |
| `200` with `valido: false` | Business logic state — show contextual feedback, NOT a generic error |

---

## 9. CURRENT FRONTEND STATE (What exists vs. what's needed)

### Existing:
- ✅ Next.js 16 project at `Portico/frontend/` (App Router, TypeScript, Tailwind v4)
- ✅ `src/app/` directory structure
- ✅ `layout.tsx` — has Geist font, needs to switch to Inter
- ✅ `globals.css` — has Tailwind import only, needs full design token system
- ✅ `frontend/mockups/` — 18 PNG mockup files + HTML gallery viewer

### Missing (blank slate for Stitch to fill):
- ❌ `page.tsx` = default Next.js boilerplate (replace entirely)
- ❌ No `components/` folder exists
- ❌ No routes beyond root
- ❌ No Firebase SDK integration
- ❌ No API client
- ❌ No state management

---

## 10. SPECIFIC TASK FOR STITCH

> Given all the context above, the primary deliverable expected is:

1. **`src/app/globals.css`** — Replace with full Pórtico design token system (CSS custom properties + Tailwind v4 theme config)
2. **`src/app/layout.tsx`** — Switch font to Inter, set up correct metadata (title: "Pórtico", lang: "es")
3. **`src/app/page.tsx`** — Full Home Dashboard screen implementation
4. **`src/app/components/BottomNav.tsx`** — Persistent 4-tab navigation
5. **`src/app/components/ErrorScreen.tsx`** — Reusable error screen with 4 variants
6. **`src/app/banking/transacciones/page.tsx`** — Transaction alerts with risk-coded cards
7. **`src/app/auth/otp/page.tsx`** — OTP screen with all 3 states + shake animation
8. **`src/app/seguridad/page.tsx`** — Security screen with circular gauge

**Design direction:** Follow the light mode mockups as primary reference. Purple (#6B4FA0) as brand color. White cards on light gray background. Pill buttons. Inter font. All copy in Spanish (Colombia).

---

## 11. FILE STRUCTURE REFERENCE

```
Portico/
├── backend/                          ← NestJS (deployed to Cloud Run)
│   └── src/
│       ├── kyc/                      ← POST /api/kyc/*
│       ├── banking/                  ← POST /api/banking/*
│       ├── otp/                      ← POST /api/otp/*
│       ├── notificaciones/           ← POST/PUT /api/notificaciones/*
│       ├── rasp/                     ← POST /api/rasp/*
│       └── shared/firestore/         ← Global Firestore service
│
└── frontend/                         ← Next.js 16 — BLANK SLATE
    ├── mockups/                      ← Visual references
    │   ├── index.html                ← Mockup gallery viewer
    │   ├── portico_light_*.png       ← Light mode mockups (primary)
    │   └── portico_*_v2_*.png        ← Dark mode mockups (secondary)
    └── src/
        └── app/
            ├── layout.tsx            ← Needs: Inter font + "Pórtico" metadata
            ├── page.tsx              ← Needs: Full Home Dashboard replacement
            └── globals.css           ← Needs: Full design token system
```
