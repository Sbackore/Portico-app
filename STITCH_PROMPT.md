# PROMPT PARA STITCH — PÓRTICO FINTECH APP

---

## INSTRUCTION TO STITCH

Design a complete, premium mobile UI for **Pórtico**, a Colombian fintech app. Generate high-fidelity, pixel-perfect mockups for all 7 screens listed below. Each screen must feel like it belongs to a world-class fintech product (reference: N26, Revolut, Nubank). All UI in **Spanish (Colombia)**.

---

## PRODUCT BRIEF

**App name:** Pórtico  
**Tagline:** Tu puerta a las finanzas inteligentes  
**Purpose:** AI-powered personal finance app that monitors bank transactions in real time, protects accounts with biometric identity verification and MFA, and sends smart security alerts.  
**Target user:** Colombian professional, 28–42 years old, tech-savvy, values security and clarity.  
**Tone:** Trustworthy, modern, calm. Never alarming unless there's a real security threat.

---

## DESIGN SYSTEM

### Primary Color — Purple
```
Brand Purple:       #6C47FF   ← primary CTA, active nav, accent
Brand Purple Light: #EDE9FF   ← chip backgrounds, soft tags
Brand Purple Dark:  #4A2FB8   ← pressed states
Purple Gradient:    linear-gradient(135deg, #6C47FF 0%, #9B7AFF 100%)
```

### Semantic Colors
```
Success:    #00C48C   ← verified, confirmed, approved
Warning:    #FF8E3C   ← medium risk, pending action
Danger:     #FF3B3B   ← critical, blocked, error
Info/Timer: #F59E0B   ← countdown timers, informational
```

### Background & Surface
```
App Background:   #F4F5FA   ← main page background (soft blue-gray, NOT pure gray)
Card Surface:     #FFFFFF   ← all cards and modals
Header Surface:   #FFFFFF   ← top navigation bar
Overlay:          rgba(10,8,30,0.6) ← modal backdrop
```

### Text
```
Primary:     #0D0B26   ← headings, large numbers
Secondary:   #6B7280   ← subtitles, timestamps, captions
Placeholder: #B0B7C3   ← form placeholders
Link/Action: #6C47FF   ← text links, secondary actions
```

### Borders & Dividers
```
Default border:  #E4E6EF
Focus border:    #6C47FF
Error border:    #FF3B3B
Success border:  #00C48C
```

### Typography — Inter (Google Fonts)
```
Display:   32px / Bold 700    ← balance amounts, hero numbers
H1:        24px / SemiBold 600
H2:        20px / SemiBold 600
H3:        16px / SemiBold 600
Body:      14px / Regular 400
Caption:   12px / Regular 400
Micro:     10px / Medium 500   ← timestamps, badges
```

### Spacing & Shape
```
Base unit: 4px
Card border-radius: 20px
Button border-radius: 999px (pill)
Input border-radius: 14px
Small chip border-radius: 999px
Card padding: 20px
Screen horizontal padding: 20px
Gap between cards: 12px
```

### Elevation / Shadows
```
Card:       0 2px 16px rgba(108,71,255,0.08)
Active card:0 8px 32px rgba(108,71,255,0.18)
Modal:      0 24px 64px rgba(0,0,0,0.18)
```

### Icons
Use outline-style icons (Lucide or similar). Size 20–24px. Always pair color icons with a matching tinted circular background badge.

---

## FORMAT REQUIREMENTS

- **Viewport:** iPhone 14 Pro — 393×852px
- **Show phone frame:** Yes — modern iPhone 14 Pro frame with Dynamic Island, white/silver color
- **Status bar:** 9:41 AM, full battery, strong signal
- **Bottom home indicator bar:** Yes (iOS style, thin dark line)
- **Background canvas:** Soft #F4F5FA (NOT white, NOT dark)
- **All text in Spanish (Colombia)**
- **Currency:** `$4.850.000` (dot as thousands separator, no decimals, prefix $)
- **Present each screen clearly labeled**

---

## SCREEN 1 — HOME DASHBOARD

**Label:** 🏠 Inicio

### Layout (top to bottom):
1. **Top bar** (white, no shadow by default)
   - Left: "Buenos días, Cristian 👋" — H2 SemiBold, #0D0B26
   - Right: Avatar circle (gradient border: purple-to-violet, 40px, user photo placeholder)
   - Notification bell icon with red dot badge "3" to the right of avatar

2. **Balance card** (full width, 20px horizontal margin, border-radius 24px)
   - Background: `linear-gradient(135deg, #6C47FF 0%, #9B7AFF 100%)`
   - "Saldo disponible" — 11px, white 70% opacity, letter-spacing 1px, uppercase
   - "$4.850.000" — 34px Bold, white, with 👁 eye icon to the right (to hide amount)
   - Subline: "🟢 Cuenta verificada" — small green chip on white background (14px, success color)
   - Bottom row: "Disponible hoy:" + smaller amount in white 80% opacity
   - Card elevation shadow with purple tint

3. **Quick actions grid** (2 columns × 2 rows, 12px gap, full width cards)
   Each card: white card, 20px radius, 16px padding, subtle shadow
   - 🏛 **Vincular Banco** — icon on purple-light circle + label + "→" chevron
   - 🪪 **Verificar Identidad** — icon on purple-light circle + "Verificado ✓" green micro-tag
   - 🛡️ **Seguridad** — icon on success-light circle + "Score: 85/100" green micro-caption
   - 🔔 **Alertas** — icon on warning-light circle + "3 nuevas" orange badge

4. **"Actividad reciente"** section
   - Section header: "Actividad reciente" H3 + "Ver todo →" link in purple (right)
   - List of 3 transaction rows (no cards, just list items + dividers):
     Row 1: 🟠 dot | "Mercado Libre" | "Bogotá · Hace 2 min" | "−$5.200.000" right | below: red chip "ALERTA"
     Row 2: No dot | "Netflix" | "Suscripción · Ayer" | "−$45.000" right | below: green chip "✓ Verificado"
     Row 3: 🟢 dot | "Nómina Empresa" | "Hace 3 días" | "+$4.200.000" right (green amount)

5. **Bottom navigation bar** (white, border-top 1px #E4E6EF, 80px tall)
   - 4 tabs: 🏠 Inicio (active, purple) · ↔ Transacciones · 🔔 Alertas · 👤 Perfil
   - Active tab: icon + label in #6C47FF, small purple dot indicator below icon
   - Active tab background: soft purple pill behind icon

---

## SCREEN 2 — KYC IDENTITY VERIFICATION (2 STATES)

Present as TWO phones side by side on the same canvas.

**LEFT PHONE — Consent state:**
- Header: back arrow ← | "Verificación de Identidad" centered H2 | empty right
- Top illustration: large circle with animated face-scan lines (purple gradient circle, 96px, white face-scan icon inside, subtle pulsing ring effect implied)
- Title: "Confirma que eres tú" H1 centered
- Subtitle: "Necesitamos verificar tu identidad para proteger tu cuenta." — Body gray
- **Policy card** (white card, 20px radius, 16px padding):
  - "Política de privacidad v2.1.0" — H3
  - Divider
  - Checkbox row (checked, purple): "Acepto los términos y condiciones de uso de datos biométricos"
  - "Leer política completa →" link in purple
- **CTA Button**: Full-width pill button, purple gradient, "Comenzar verificación" — white Bold
- **Stepper** (bottom, 3 steps with connecting line):
  - ✅ Consentimiento (green filled dot) — solid connected line — 🟣 Verificación facial (purple active dot, pulsing ring) — dashed line — ○ Resultado (gray empty dot)
  - Labels below each step in Caption size

**RIGHT PHONE — Rejection state:**
- Header: "Verificación de Identidad" centered
- Large circle illustration: salmon/pink background (#FFE8E8), red X icon centered (32px)
- Title: "Verificación no exitosa" H1 centered
- Subtitle: "No pudimos confirmar tu identidad." Body gray
- **Attempt tracker card** (warning-light background #FFF4E6, 20px radius):
  - Icon: ⚠️ warning circle orange
  - "Intento 1 de 3" — 16px SemiBold orange (#FF8E3C)
  - Subtitle: "Tienes 2 intentos más disponibles."
- **Retry button**: full-width pill, orange gradient (#FF8E3C → #FF6B00), "Intentar de nuevo" white Bold
- **Secondary action**: "Contactar soporte" — text link, gray, centered below button
- **Stepper**: ✅ Consentimiento — solid line — ❌ Verificación facial (red X dot) — dashed — ○ Resultado

---

## SCREEN 3 — OTP / MFA VERIFICATION (3 STATES)

Present as THREE phones side by side.

**LEFT PHONE — Code entry:**
- Header: back ← | "Verificación de seguridad" centered
- Logo: small "P" in purple circle + "Pórtico" text, centered, 16px SemiBold
- H1: "Ingresa tu código" centered, 26px Bold
- Subtitle: "Lo enviamos al número +52 55 *** 3124" — Caption gray
- **Alert level pill** (orange, centered): 🔒 "Nivel de alerta: ALTO" — small white text
- **6 OTP input boxes**: rounded squares, 52×60px, 8px gap, Border: 2px #E4E6EF. First 3 filled (purple border, dark text "4", "9", "2"), last 3 empty. Focused box has purple glow shadow.
- **Timer row**: ⏱ amber icon + "04:32 restantes" amber bold + "Reenviar código" gray muted link (right)
- **Primary button**: full-width purple pill "Verificar" — white Bold
- Bottom card (soft purple background #EDE9FF, 16px radius): 🛡 "Esta transacción requiere verificación adicional por tu seguridad."

**CENTER PHONE — Success:**
- Header: "Verificación de seguridad"
- Centered large illustration: soft green circle (96px) + large ✓ checkmark inside (white, 40px stroke), subtle glow ring in green
- H1: "¡Todo en orden!" — 28px Bold #0D0B26
- Subtitle: "Tu identidad fue verificada exitosamente." — gray
- Empty space
- **Button**: full-width pill, success green gradient (#00C48C → #00A07A), "Continuar" white Bold
- Small caption: "Acceso seguro confirmado · 10:09" — gray centered

**RIGHT PHONE — Wrong code:**
- Header: "Verificación de seguridad"
- 6 OTP boxes — ALL red border (#FF3B3B), boxes slightly shaking (indicate animation with slight tilt)
- **Error banner** (light red #FFF0F0, red left border 4px, 14px radius): ⚠ "Código incorrecto · Quedan 2 intentos" — red text
- Attempt dots: 3 dots — 1 pink filled (used), 2 white outlined (remaining)
- "Intentar de nuevo" — gray centered link
- **Disabled Verificar button** (grayed out)

---

## SCREEN 4 — TRANSACTION ALERTS

**Label:** 🏦 Alertas de transacciones

### Layout:
1. **Header** (white bar):
   - H2: "Transacciones" left
   - Small chip right: 🟢 "Open Banking ✓" (success-light background, success text)

2. **Tab bar** (below header, white background, border-bottom):
   - "Todas" (active — purple underline, purple text) · "Pendientes" (gray) · "Resueltas" (gray)
   - Active tab has 4px purple bottom border

3. **Transaction alert cards** (3 cards, 12px gap):

   **Card 1 — HIGH RISK (🔴)**
   - Left accent bar: 4px, full-height, #FF3B3B (red)
   - White card, 20px radius, 20px padding
   - Top row: "Movimiento inusual detectado" — H3 Bold | right: "Hace 2 min" Caption gray
   - Second row: "Transferencia Internacional" — Caption gray
   - Amount: "$5.200.000" — 22px Bold #FF3B3B (red, alarming)
   - Description text: "Este movimiento supera tu patrón habitual. ¿Lo realizaste tú?" — Body gray
   - **Action row** (3 pills, small, 10px gap):
     - "✓ Sí, fui yo" — success-light bg, success text, pill border success
     - "⚑ Reportar" — warning-light bg, warning text
     - "🔒 Bloquear" — danger bg solid, white text Bold

   **Card 2 — MEDIUM RISK (🟠)**
   - Left accent bar: 4px, #FF8E3C (orange)
   - Top row: "$850.000 · Mercado Libre · Bogotá" — H3
   - "Compra en ubicación diferente a la habitual" — Body gray
   - **Action row** (2 pills):
     - "✓ Confirmar" — orange bg solid, white Bold
     - "⚑ Reportar" — orange outline, orange text

   **Card 3 — VERIFIED (🟢)**
   - Left accent bar: 4px, #00C48C (green)
   - "✓ Netflix · $45.000 · Pago verificado" — H3 with green checkmark icon at start
   - No action buttons needed
   - Light green background tint on card (#F0FDF9)

---

## SCREEN 5 — NOTIFICATIONS CENTER

**Label:** 🔔 Alertas y notificaciones

### Layout:
1. **Header** (white, no border):
   - H2: "Alertas" left
   - Badge: "3 nuevas" – purple filled pill, white Bold text
   - "Configurar" — purple text link right

2. **Notification preferences card** (white card, 20px radius):
   - Title: "Cómo quieres que te avisemos" H3
   - 4 toggle rows (dividers between each):
     - "📲 Notificaciones push" — right: green iOS-style toggle (ON)
     - "💬 WhatsApp" — right: green toggle (ON)
     - "✉️ Email" — right: green toggle (ON)
     - "📨 SMS" — right: gray toggle (OFF)
   - Bottom: "✓ Preferencias guardadas" — small, success green, centered, with subtle fade-in implied

3. **Notification feed** (3 notification cards, 12px gap):

   **Card 1 — IMMEDIATE (Urgent)**
   - Left: 4px red accent bar
   - Background: very subtle red tint (#FFF5F5)
   - Top row: 🔴 "Alerta urgente" red label · "$5.200.000" Bold · "Ahora mismo" Caption
   - Description: "Transferencia inusual detectada en tu cuenta." — Body
   - **Action buttons row**: "CONFIRMAR" (green outline) · "REPORTAR" (orange outline) · "BLOQUEAR" (red filled)

   **Card 2 — HIGH**
   - Left: 4px orange accent bar
   - "$850.000 · Mercado Libre · Hace 5 min"
   - "CONFIRMAR" (orange outline) · "BLOQUEAR" (red outline)

   **Card 3 — INFORMATIVE**
   - Left: 4px gray accent bar
   - "✓ Netflix $45.000 · Hace 1 hora" — gray, no action needed, checkmark icon

4. **Bottom navigation** (same as home, "Alertas" tab active)

---

## SCREEN 6 — SECURITY / RASP

**Label:** 🛡️ Seguridad de tu cuenta

### Layout:
1. **Header**: back ← | "Seguridad" H2 centered | right: ⚙️ settings icon

2. **Security score card** (white card, 24px radius, large padding):
   - **Circular gauge** (180px diameter):
     - Track: #E4E6EF (light gray arc, 270° sweep)
     - Progress: gradient arc green (#00C48C) toward orange (#FF8E3C) — filled to 60%
     - Center: "60" — 40px Bold #0D0B26 + "/100" — 16px gray
     - Below center: "Nivel de protección" Caption gray
   - Below gauge: two status chips in a row, centered:
     - 🟢 "Protección activa" — success-light bg, success text, shield icon
     - 🟢 "Dispositivo analizado" — success-light bg, mobile icon
   - Bottom of card: "Tu cuenta tiene protección media. Completa la verificación para mejorar tu score." — Caption gray, centered

3. **"Eventos recientes"** section:
   - Section H3 title
   - 3 event rows (white card container, divided internally):
     Row 1: 🔴 dot | Bold "Intento sospechoso" | "· Sesión cerrada · Hace 1h" Caption | right: ›
     Row 2: 🟠 dot | Bold "Actividad inusual" | "· Score reducido −20pts · Hace 3h" | right: ›
     Row 3: 🟡 dot | "Emulador detectado" | "· Monitoreado · Hace 5h" | right: ›

4. **Critical block banner** (full width, 16px radius, important):
   - Background: #FFF0F0 (light red)
   - Red border: 1.5px solid #FFCDD2
   - Top: 🔒 lock icon (red, 24px) + "Tu cuenta está temporalmente bloqueada" H3 red
   - Countdown: "01:45:22" — 28px Bold #FF3B3B, monospace font
   - "Tiempo hasta desbloqueo automático" — Caption gray
   - CTA: "Hablar con soporte" — full-width red pill button (#FF3B3B)

---

## SCREEN 7 — ERROR STATES (4 states in one canvas)

Present a 2×2 grid of 4 phones on a single canvas.

**All 4 phones share:**
- Header: "Pórtico" centered, medium bold — no back button
- Bottom: home indicator bar (iOS)
- Background: #F4F5FA

**TOP LEFT — Server Error (HTTP 500)**
- Illustration: large circle with soft red/salmon background (#FFE8E8), ⚠️ triangle icon red, 40px
- H2: "Algo salió mal"
- Body: "No pudimos completar tu solicitud." gray centered
- Note: Do NOT say "Error 500". Never.
- Buttons:
  - Primary pill purple: "Reintentar"
  - Secondary text link gray: "Contactar soporte"

**TOP RIGHT — No Connection**
- Illustration: large circle soft gray background, cloud with X illustration gray, 40px
- H2: "Sin conexión"
- Body: "Revisa tu conexión a internet e inténtalo de nuevo." gray centered
- Primary pill purple outline only: "Reintentar"

**BOTTOM LEFT — Account Blocked (RASP Critical)**
- Illustration: large circle, soft red background, 🔒 padlock icon red, 40px
- H2: "Cuenta bloqueada"
- Body: "Cerramos tu sesión por seguridad." gray centered
- Countdown: "01:45:22" — 24px Bold red, monospace
- Caption gray: "Tiempo hasta desbloqueo automático"
- Primary pill red solid: "Hablar con soporte"

**BOTTOM RIGHT — Too Many OTP Attempts**
- Illustration: circle with amber/gold background (#FFF4E0), ⊗ circle-X icon amber, 40px
- H2: "Demasiados intentos"
- Body: "Has superado el límite de intentos." gray centered
- "Bloqueado 30 minutos" — amber Caption
- Large countdown: "29:45" — 36px Bold amber, monospace
- Caption gray: "Podrás intentarlo de nuevo en:"
- Bottom: disabled grayed pill "Verificar más tarde"

---

## GLOBAL POLISH RULES (apply to all screens)

1. **No flat colors on CTAs** — all primary buttons use gradient backgrounds (purple gradient or semantic color gradient)
2. **Every icon has a tinted badge background** — icon on a soft-color circle (12px padding), never floating alone
3. **Amounts in danger context are red**, in success context are green, in neutral context are #0D0B26 dark
4. **No generic placeholder text** — all content is realistic and in Spanish: real merchant names, real Colombian amounts, realistic timestamps
5. **Consistency:** every card has 20px padding, 20px radius, white background, purple-tinted shadow
6. **Micro-details matter:** status bar time is 9:41, battery full, signal bars full or near-full
7. **Bottom nav is always visible** on main screens, always absent on auth/flow screens
8. **The purple is #6C47FF** (slightly more electric/vibrant than the current #7B5EA7) — this upgrade gives the app a fresher, more modern feel
9. **No harsh borders** — use 1px #E4E6EF for necessary dividers only
10. **White space is your friend** — screens should feel airy, not cramped

---

## WHAT TO IMPROVE VS CURRENT MOCKUPS

The existing mockups (reference) are functional but need these specific upgrades:
- **Balance card** → upgrade from flat purple to purple gradient with depth
- **Quick actions** → make icons larger with colored circle backgrounds, reduce to just label + icon (remove chevrons from grid)
- **Transaction cards** → add richer hierarchy: merchant logo placeholder (colored circle initials), bigger amounts with color coding, more spaced action buttons
- **Security gauge** → make it larger and more visually impactful, add percentage ring fill animation suggestion
- **Notification cards** → improve contrast of action buttons (currently too flat/outlined, use filled buttons for urgency INMEDIATA)
- **Error screens** → make illustrations larger (96px circles), add more breathing room, make countdown number the visual hero
- **Typography** → bump up the main amounts/numbers — they should feel BOLD and prominent like a real banking app
- **Overall** → more shadow depth on cards, slightly warmer purple (#6C47FF vs current #7B5EA7), more vibrant and premium feel

---

## DELIVERABLE

Generate all 7 screens as individual high-fidelity mockups. Each screen should be 393×852px inside an iPhone 14 Pro frame. Screens 2 and 3 may be presented as multi-state compositions (2 or 3 phones side by side). Screen 7 should be presented as a 2×2 grid composition.

Maintain 100% design consistency across all screens: same font, same purple, same card style, same spacing, same icon style.
