# Memory: index.md

# Updro.se – Design System & Decisions

## Colors (HSL) – Dark Theme
- Background: 225 20% 7% (near-black blue)
- Primary/accent: 28 100% 55% (warm orange)
- Card: 225 18% 10%
- Muted: 225 14% 13%
- Brand amber: 42 100% 50%
- Brand mint: 160 84% 44% (secondary accent)
- Destructive/coral: 0 72% 51%

## Fonts
- Display: Space Grotesk (700, tight tracking -0.035em)
- Body: Inter (400/500/600)
- Mono: JetBrains Mono
- Logo: "upd" in foreground + "ro" in primary, Zap icon before

## Architecture
- Types in src/types/index.ts
- Constants in src/lib/constants.ts
- Home sections in src/components/home/
- Navbar: src/components/Navbar.tsx
- Footer: src/components/Footer.tsx
- Dashboard sidebar uses Outlet pattern — SupplierLayout.tsx & BuyerLayout.tsx
- Pages inside dashboard must NOT wrap themselves in DashboardLayout
- Layouts wrap Outlet in Suspense for SPA-like navigation

## Rules
- **Numbers < 12 MUST be written as Swedish words** — use `numWord()` from `src/lib/numberWords.ts`
- Always use semantic design tokens, never hardcoded colors in components
- Dashboard sidebar is dark-themed (--sidebar-* tokens)
- Dark theme is default (no .dark class needed)

## Backend: Lovable Cloud (Supabase) connected
