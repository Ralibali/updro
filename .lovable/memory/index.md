# Memory: index.md

# Updro.se – Design System & Decisions

## Colors (HSL)
- Primary/brand-blue: 220 90% 50% (#2563EB)
- Accent/mint: 160 84% 44% (#06D6A0)
- Brand dark: 220 25% 7%
- Coral: 0 72% 51%
- Sidebar: dark (brand-dark bg, light text)

## Fonts
- Display + Body: Inter (700 for headings, tight letter-spacing)
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

## Backend: Lovable Cloud (Supabase) connected
