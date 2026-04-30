# Design System Strategy: Editorial Fluidity

## 1. Overview & Creative North Star: "The Digital Sanctuary"
To design for a premium Colombian fintech is to balance the warmth of local culture with the precision of global finance. This design system departs from the rigid, "boxed-in" layout of traditional banking apps. Instead, we follow the Creative North Star of **"The Digital Sanctuary."**

Our goal is to create an environment that feels expansive, quiet, and sophisticated. We break the "template" look by utilizing **intentional asymmetry**—offsetting headings, using generous white space to let the brand purple breathe, and employing a "High-End Editorial" layout style. By treating the screen like a premium magazine spread rather than a software interface, we establish immediate trust through visual authority.

---

## 2. Color & Atmosphere
Color is our primary structural tool. In this system, we move away from lines and embrace tonal shifts.

### The Palette
- **Primary (`#5323E6`):** Our core signature. Use `primary_container` (`#6C47FF`) for high-action surfaces.
- **Surface Hierarchy:** Utilize the `surface_container` tiers to create depth.
    - `surface_container_lowest` (#FFFFFF): For high-focus cards.
    - `surface_container_low` (#F2F3F8): For the main app background.
    - `surface_container_highest` (#E1E2E7): For recessed elements like search bars or inactive tabs.

### The "No-Line" Rule
Explicitly prohibit 1px solid borders for sectioning. We do not use "fences" to separate content. Boundaries must be defined solely through background color shifts or the **Layering Principle**. 

### The Glass & Gradient Rule
To achieve a "Signature" feel, use **Glassmorphism** for floating navigation bars or modal headers. Use `surface` colors at 80% opacity with a `24px` backdrop blur. 
*   **Signature Textures:** For Hero CTAs, use a linear gradient from `primary` (#5323E6) to `primary_container` (#6C47FF) at a 135° angle. This adds a "soul" and dimension that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
We use **Inter** not as a system font, but as a brand asset. The hierarchy is designed to be high-contrast to guide the eye effortlessly.

*   **Display (3.5rem - 2.25rem):** Reserved for "Moment" screens—onboarding, wealth milestones, or balance reveals. Always `-0.02em` letter spacing.
*   **Headlines (2rem - 1.5rem):** Use `headline-lg` for screen titles. Push these to the left with asymmetrical padding to create an editorial feel.
*   **Body (1rem - 0.875rem):** `body-lg` is the workhorse. Ensure a line height of `1.6` for maximum readability and "calm."
*   **Labels (0.75rem):** Use `600` weight (Semi-bold) for labels to ensure they act as clear anchors for the data they represent.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often messy. This system uses **Ambient Shadows** and **Tonal Stacking** to create a feeling of physical presence.

*   **The Layering Principle:** Place a `surface_container_lowest` (#FFFFFF) card on a `surface_container_low` (#F2F3F8) background. This creates a "soft lift" that feels architectural rather than digital.
*   **The Purple Tint Shadow:** When a floating effect is required (e.g., a main action card), use: `0px 12px 32px rgba(108, 71, 255, 0.08)`. The purple tint ensures the shadow feels like an extension of the brand's light, not "dirt" on the screen.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., high-contrast mode), use `outline_variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Functional Elegance

### Buttons
- **Primary (Pill, 999px):** Use the `primary` to `primary_container` gradient. Internal horizontal padding: `32px`.
- **Secondary:** Transparent background with a `Ghost Border`.
- **States:** On press, reduce scale to `0.98` to provide tactile, haptic-like feedback.

### Input Fields
- **Radius:** `14px`.
- **Styling:** Use `surface_container_high` for the background. No border. On focus, transition the background to `surface_container_lowest` and add the "Ghost Border" in `primary`.

### Cards & Lists
- **The "No Divider" Rule:** Forbid 1px dividers between list items. Use `24px` vertical spacing to separate transactions. 
- **Card Radius:** Always `20px` (`DEFAULT`). This specific curvature feels modern and approachable.

### Wealth-Specific Components
- **The Balance Blur:** A toggleable state for privacy. Use a `12px` blur on the `display-md` balance text.
- **Micro-Charts:** Use `Success` (#00C48C) with a subtle glow (0 0 8px) for growth indicators to imply "energy."

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical margins (e.g., 24px left, 32px right) for headlines to create a signature look.
- **Do** use `primary_fixed` (#E6DEFF) for subtle highlights in "Success" states to tie them back to the brand.
- **Do** prioritize "Breathing Room." If a layout feels crowded, increase the `surface_container` padding before reducing font size.

### Don’t
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#191C1F).
- **Don't** use standard 4px or 8px corners. Stick to the `20px` (Cards) and `14px` (Inputs) scale to maintain the brand’s "soft premium" identity.
- **Don't** use "Alert Red" for anything other than critical errors. Use `Warning` (#FF8E3C) for non-blocking notifications to maintain a "Calm" tone.