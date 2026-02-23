# FlyDea UI Modernization Design

## Overview

Redesign FlyDea's frontend to a premium modern SaaS interface with Material Design 3 inspiration. Hybrid dark/light theme with dark sidebar+topbar framing a warm light content area.

**Approach:** Incremental component swap. Layout first, then pages one by one. Always deployable.

---

## 1. Design Tokens

### Colors — Dark Surfaces (sidebar + topbar)

| Token | Value | Usage |
|---|---|---|
| `--surface-dark` | `#0F1923` | Sidebar/topbar bg |
| `--surface-dark-hover` | `#162230` | Hover on dark surfaces |
| `--surface-dark-active` | `#1C2D3F` | Active/selected on dark |
| `--on-dark` | `#E8E4DF` | Text on dark surfaces |
| `--on-dark-muted` | `#8A9BAD` | Secondary text on dark |

### Colors — Light Surfaces (content area)

| Token | Value | Usage |
|---|---|---|
| `--surface` | `#F7F2E9` | Main content bg (cloud) |
| `--surface-elevated` | `#FFFFFF` | Cards, panels |
| `--on-surface` | `#0B1220` | Primary text (ink) |
| `--on-surface-muted` | `#52606D` | Secondary text (slate) |
| `--outline` | `#E7E1D6` | Borders (haze) |
| `--primary` | `#135B66` | Primary actions (ocean) |
| `--primary-container` | `#E6F2F3` | Primary tinted bgs |
| `--accent` | `#2D9C97` | Active/accent (teal) |
| `--warm` | `#F2B77A` | Warm highlight (sun) |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Inputs, badges, small buttons |
| `--radius-md` | `12px` | Cards, panels, dropdowns |
| `--radius-lg` | `16px` | Modals, large cards |
| `--radius-full` | `9999px` | Avatars, pill buttons |

### Elevation (MD3-inspired)

| Level | Shadow | Usage |
|---|---|---|
| 0 | none | Flat |
| 1 | `0 1px 3px rgba(0,0,0,0.08)` | Cards at rest |
| 2 | `0 4px 12px rgba(0,0,0,0.10)` | Hovered cards, dropdowns |
| 3 | `0 8px 24px rgba(0,0,0,0.12)` | Modals, floating panels |

### Motion

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `150ms` | Button feedback, toggles |
| `--duration-normal` | `200ms` | Panel transitions |
| `--duration-slow` | `300ms` | Drawer open/close |
| `--easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | MD3 standard easing |

All defined as CSS custom properties in globals.css, consumed by Tailwind theme.extend.

---

## 2. Layout Architecture

### Key Change: AppShell → Next.js Layout

Move shell from per-page import to `app/app/layout.tsx`. Sidebar and topbar persist across route changes.

```
app/app/layout.tsx  ← AuthGuard + sidebar + topbar + main
  dashboard/page.tsx  ← content only
  maps/page.tsx       ← content only (full-bleed)
  ctm/*/page.tsx      ← content only
  pgv/*/page.tsx      ← content only
```

### Sidebar

- **Expanded:** 256px, `surface-dark` bg
- **Collapsed:** 64px icon rail with tooltips
- **Mobile:** Sheet drawer overlay
- **Persist state:** localStorage

**Grouped navigation:**
1. Dashboard
2. Mapas & Drones
3. Section: CADASTRO (CTM) — Parcelas, Logradouros, Mobiliario
4. Section: VALORACAO (PGV) — Zonas, Faces, Fatores, Relatorio
5. Alertas, Processos, Ativos
6. User profile card at bottom

**Active state:** `pathname.startsWith(item.href)` with 3px accent left-border indicator.

### Topbar

- 56px height, `surface-dark` bg
- Left: sidebar collapse toggle (desktop) / hamburger (mobile)
- Center: global search bar (command-palette style)
- Right: notification bell (count badge), user avatar dropdown
- Dynamic tenant name and user info from auth context

### Content Area

- Data pages: `max-w-7xl` container, `px-8 py-6`, light `surface` bg
- Map page: full-bleed, no padding, no max-width
- Page headers: breadcrumb + title + action buttons

### Map Page Layout

- Map fills 100% remaining space
- Right detail panel: 360px, slides in with `translateX` (no layout shift)
- Filter chips: overlay on map top-left
- Right panel tabs: Layers | Details | Filters

---

## 3. Component Plan

### New Components (layout refactor)

- `Sheet` — mobile sidebar drawer (Radix)
- `Tooltip` — collapsed sidebar tooltips
- `DropdownMenu` — user/notification menus
- `Skeleton` — loading states for all data pages
- `Toast` — sonner (action feedback)
- `Command` — global search palette

### Updated Components

- `Button` — add destructive variant, icon size, loading spinner
- `Badge` — add destructive + outline variants
- `Card` — standardize to radius-md (12px), add CardFooter
- `DataTable` — integrate TanStack Table (sorting + pagination)

### Loading States

Every data page: skeleton layout matching content shape instead of blank screen.

### Toast Notifications

sonner, bottom-right position. Used for save/delete/error feedback.

---

## 4. Animations

| Element | Animation | Duration | Technique |
|---|---|---|---|
| Sidebar collapse | width 256→64px | 200ms | CSS transition |
| Right panel slide | translateX(100%→0) | 250ms | CSS transform |
| Card hover | translateY(-2px) + shadow 1→2 | 150ms | CSS transform |
| Button press | scale(0.97) | 100ms | CSS transform |
| Page enter | opacity 0→1, translateY(8→0) | 200ms | CSS animation |
| Skeleton pulse | opacity oscillation | 1.5s loop | CSS animation |
| Toast enter | slide from right | 200ms | sonner built-in |
| Mobile sidebar | translateX(-100%→0) | 300ms | Sheet component |

All pure CSS/Tailwind. No framer-motion.

---

## 5. Drone GIF Integration

- Dashboard hero: positioned absolutely top-right, opacity-20, blur-[1px], behind KPI cards
- Maps empty state: centered drone illustration with "Adicione camadas para visualizar dados"
- Asset: free animated drone GIF in `public/images/drone.gif`, replaceable

---

## 6. Implementation Order

### Phase 1: Foundation (layout refactor)
1. Design tokens in globals.css + tailwind.config.ts
2. New sidebar component (dark, grouped, collapsible, mobile sheet)
3. New topbar component (dark, search bar, user dropdown)
4. Move AppShell into app/app/layout.tsx
5. Update all pages to remove AppShell wrapper
6. Add Skeleton, Toast (sonner) infrastructure

### Phase 2: Data pages
7. DataTable upgrade (TanStack Table, sorting, pagination)
8. Skeleton loading states for all CRUD pages
9. Better empty states

### Phase 3: Map experience
10. Map page layout (full-bleed, sliding right panel)
11. Filter chips overlay
12. Panel transitions

### Phase 4: Polish
13. Drone GIF integration
14. Global search command palette
15. Page enter animations
16. Card hover effects

---

## 7. Performance Constraints

- No heavy animation libraries
- CSS transitions only (transform + opacity)
- No unnecessary re-renders from sidebar/topbar (layout persistence)
- SSR-compatible (all client components marked "use client")
- Minimal bundle impact from new dependencies (sonner ~3KB, cmdk ~5KB)

---

## 8. Files to Modify

### Phase 1 (layout refactor):
- `src/styles/globals.css` — design tokens
- `tailwind.config.ts` — token integration
- `src/components/layout/sidebar.tsx` — full rewrite
- `src/components/layout/topbar.tsx` — full rewrite
- `src/components/layout/app-shell.tsx` — remove (move to layout)
- `src/app/app/layout.tsx` — add shell here
- `src/components/ui/sheet.tsx` — new (mobile sidebar)
- `src/components/ui/tooltip.tsx` — new
- `src/components/ui/dropdown-menu.tsx` — new
- `src/components/ui/skeleton.tsx` — new
- All `src/app/app/*/page.tsx` — remove AppShell wrapper
