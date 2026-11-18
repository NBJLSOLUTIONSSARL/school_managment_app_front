# EduTrack School Management System — Design Enhancement Plan

## Subject Matter
A **school management platform** for K-12 institutions serving administrators, teachers, students, and parents. The UI follows the **Frappe/ERPNext Desk** pattern — data-dense, keyboard-first, compact typography (11px–14px). Users are educators and school staff who need efficient daily workflows, not marketing fluff.

**Primary job**: Replace paper-based admin chaos with a single, fast, trustworthy digital workspace.

---

## Current State Analysis

### What Works
- Consistent blue palette (#2563eb primary, #eff6ff accents)
- shadcn/ui component foundation with Tailwind v4
- Compact ERPNext-style density (text-2xs → text-base)
- Keyboard-first focus rings, RTL support, reduced motion
- Role-based dashboards with real data
- Code-split lazy routes (28 routes, 182kB main chunk)

### What Feels Generic
1. **Inter** as sole typeface — reads as every other SaaS dashboard
2. **Blue monotony** — same hue for primary, hover, active, ring, accent
3. **Uniform card radius** (1rem everywhere) — no hierarchy signaling
4. **Flat shadows** — all `shadow-xs`/`-2xs`, no depth layering
5. **Generic spacing** — Tailwind defaults, no rhythm
6. **No distinctive motion** — only fade/slide defaults
7. **Placeholder-like copy** — "Admin Dashboard", "Vue d'ensemble..."

---

## Design Plan

### 1. Color — Purposeful Blue System + Semantic Accents

**Core Palette (6 named tokens)**

| Token | Hex | Role |
|-------|-----|------|
| `ink` | #0B1220 | Primary text, near-black with blue undertone |
| `ink-muted` | #4A5568 | Secondary text, labels |
| `paper` | #FAFBFC | Page background — warmer than pure white |
| `surface` | #FFFFFF | Card/panel background |
| `border-subtle` | #E4E9EF | Hairline divides |
| `border-strong` | #CBD5E0 | Interactive boundaries |

**Blue Accent System (4 tokens, not 10)**

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-core` | #1E40AF | Primary actions, active nav, focus rings |
| `blue-hover` | #1D4ED8 | Hover states on primary |
| `blue-wash` | #EFF6FF | Background washes, selected rows |
| `blue-muted` | #60A5FA | Disabled, subtle indicators |

**Semantic Accents (3 tokens, distinct hues)**

| Token | Hex | Usage |
|-------|-----|-------|
| `emerald` | #059669 | Success, paid, confirmed, positive trends |
| `amber` | #D97706 | Warnings, pending, attention needed |
| `rose` | #DC2626 | Errors, destructive, overdue, critical |

> **Why**: Current system has 10+ blue variants that blur together. A tighter core + distinct semantic hues creates instant visual parsing. `ink` replaces `#0f172a` — warmer, less harsh on long sessions.

---

### 2. Typography — Distinctive Pairing

**Display: `Plus Jakarta Sans`** (variable, 200–800)
- Page titles, section headers, metric numbers
- Geometric but human, reads "education" not "tech"

**UI & Body: `DM Sans`** (variable, 400–700)
- All body text, tables, forms, navigation
- Compact x-height, excellent at 11px–13px

**Monospace: `JetBrains Mono`** (variable)
- IDs, codes, monetary amounts, timestamps

**Type Scale (clamped, fluid)**

| Role | Size/Line | Weight | Font |
|------|-----------|--------|------|
| Page Title | clamp(1.5rem, 2vw, 1.875rem) / 1.2 | 700 | Plus Jakarta Sans |
| Section Header | clamp(0.875rem, 1.2vw, 1rem) / 1.3 | 600 | Plus Jakarta Sans |
| Card Title | 0.875rem / 1.3 | 600 | DM Sans |
| Body / Table Cell | 0.8125rem (13px) / 1.5 | 400 | DM Sans |
| Label / Badge | 0.6875rem (11px) / 1.4 | 500 | DM Sans |
| Mono / Code | 0.75rem (12px) / 1.5 | 400 | JetBrains Mono |

> **Why**: Inter everywhere is the #1 tell of AI-generated UI. Plus Jakarta Sans + DM Sans is a deliberate pair — one for moments that need personality, one for density. Variable fonts = single font file, full weight range.

---

### 3. Layout — Rhythm & Hierarchy

**Spacing Scale (base 4px, named tokens)**

```css
--space-1: 4px;   /* inline gaps, icon-text */
--space-2: 8px;   /* component internal */
--space-3: 12px;  /* card padding (sm) */
--space-4: 16px;  /* card padding (md), section gap */
--space-5: 24px;  /* card padding (lg), major section gap */
--space-6: 32px;  /* page section separation */
--space-7: 48px;  /* hero/landing only */
```

**Border Radius Hierarchy**

| Level | Radius | Usage |
|-------|--------|-------|
| `radius-tight` | 4px | Badges, pills, inputs, buttons (xs/sm) |
| `radius-card` | 8px | Cards, dropdowns, modals, tables |
| `radius-panel` | 12px | Major panels, sidebar sections |
| `radius-full` | 9999px | Avatars, circular progress |

> **Why**: Current `rounded-xl` (12px) everywhere = no hierarchy. Tight radii on dense elements, generous on containers.

**Shadow Depth System**

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-hair` | 0 1px 2px rgba(11,18,32,.04) | Cards at rest |
| `shadow-soft` | 0 2px 8px -2px rgba(11,18,32,.06) | Hover cards, dropdowns |
| `shadow-elevated` | 0 8px 24px -4px rgba(11,18,32,.08) | Modals, drawers, toasts |
| `shadow-focus` | 0 0 0 3px #1E40AF33 | Focus rings (replaces outline) |

---

### 4. Component Refinements

#### Buttons
- **Primary**: `blue-core` bg, white text, `shadow-hair` → `blue-hover` + `shadow-soft` on hover
- **Secondary**: `surface` bg, `blue-core` text, `border-subtle` → `blue-wash` bg on hover
- **Ghost**: transparent → `blue-wash` bg, `blue-core` text
- **Danger**: `rose` bg → darker rose on hover
- **Height**: 32px (xs), 36px (sm), 40px (md), 44px (lg) — tighter than current
- **Radius**: `radius-tight` (4px) — sharper, more "desk tool" feel

#### Cards
- Border: `border-subtle` (1px)
- Radius: `radius-card` (8px)
- Padding: `space-3` (12px) sm / `space-4` (16px) md
- Shadow: `shadow-hair` at rest, `shadow-soft` on hover (interactive cards only)
- Header divider: `border-subtle` hairline

#### Inputs
- Height: 36px (sm), 40px (md)
- Radius: `radius-tight` (4px)
- Border: `border-subtle` → `blue-core` on focus (3px ring)
- Label: 11px, 500 weight, `ink-muted`
- Placeholder: `ink-muted` at 40% opacity

#### Tables
- Header: 11px, 600 weight, `ink-muted`, `paper` bg
- Row hover: `blue-wash` at 50% opacity
- Selected row: `blue-wash` full + `border-s-2 border-blue-core`
- Cell padding: 10px 12px (tighter)
- Border: `border-subtle` horizontal only

#### Sidebar
- Width: 256px (16rem) — slightly narrower
- Group headers: 10px, uppercase, tracking-wide, `ink-muted`
- Active item: `blue-wash` bg, `blue-core` text, `border-s-2 border-blue-core`
- Hover item: `blue-wash` at 50%
- Icon: 16px, `ink-muted` → `blue-core` on active

#### Top Bar
- Height: 56px (3.5rem)
- Search: 280px max, `radius-tight`, `shadow-hair`
- Avatar: 32px, `radius-full`

---

### 5. Motion — Single Orchestrated Moment

**Principles**
- One page-load sequence per route (staggered card entrance, 120ms stagger, 200ms duration)
- Micro-interactions on user action only (button press, dropdown open, row select)
- Respect `prefers-reduced-motion` — disable all non-essential

**Tokens**
```css
--motion-fast: 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
--motion-base: 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
--motion-slow: 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
--stagger: 80ms;
```

**Entrance (per route)**
```
Card 1: 0ms    → fade + translateY(8px) → 200ms
Card 2: 80ms   → fade + translateY(8px) → 200ms
Card 3: 160ms  → fade + translateY(8px) → 200ms
...
```

---

### 6. Copy — Conversational, Specific

| Current | Enhanced |
|---------|----------|
| "Admin Dashboard" | "Tableau de bord — Établissement" |
| "Vue d'ensemble..." | "350 élèves · 28 enseignants · 12 classes · 94% assiduité" |
| "Revenus Scolaires" | "Recettes du mois" |
| "Effectif Élèves" | "Élèves inscrits" |
| "Dernières Activités" | "Inscriptions récentes" |
| "Transactions & Frais Récents" | "Derniers règlements" |

> **Why**: Numbers + units beat vague labels. "350 élèves" is instantly scannable; "Effectif Élèves" requires reading.

---

### 7. Empty & Error States — Direction, Not Mood

**Empty State Pattern**
```
[Illustration: 64px, blue-muted]
Title: "Aucun élève inscrit" (14px, 600, ink)
Body: "Commencez par ajouter votre premier élève ou importez une liste." (13px, ink-muted)
Action: [Button: "Ajouter un élève" → /students/new]
```

**Error State Pattern**
```
[AlertCircle: 16px, rose]
Title: "Impossible de charger les données" (13px, 600, ink)
Body: "Le service est temporairement indisponible. Réessayez dans quelques instants." (12px, ink-muted)
Action: [Button outline: "Réessayer"]
```

---

## Implementation Priority

| Phase | Scope | Files | Effort |
|-------|-------|-------|--------|
| **1. Tokens** | CSS custom properties, Tailwind theme extension | `src/styles/index.css`, `tailwind.config.ts` | 1h |
| **2. Fonts** | Add Plus Jakarta Sans, DM Sans, JetBrains Mono | `index.html`, `index.css` | 30m |
| **3. Core Components** | Button, Card, Input, Badge, Table, Avatar | `src/components/ui/*.jsx` | 2h |
| **4. Layout** | PrivateLayout sidebar, top bar, page container | `PrivateLayout.jsx` | 1.5h |
| **5. Dashboards** | AdminDashboard + role variants (stats cards, tables) | `src/features/dashboard/components/*.jsx` | 2h |
| **6. Pages** | Login, Settings, Profile, key list/detail pages | `src/routes/*.jsx` | 2h |
| **7. Motion** | Entrance animations, micro-interactions | CSS + component wrappers | 1h |
| **8. Polish** | Empty states, loading skeletons, copy audit | Cross-cutting | 1.5h |

**Total: ~11.5 hours**

---

## Validation Checklist

- [ ] All 754 backend tests pass
- [ ] All 614 frontend tests pass
- [ ] Oxlint: 0 errors, 0 warnings
- [ ] Build: `npm run build` succeeds, chunk sizes < 200kB main
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95
- [ ] Visual regression: No broken layouts at 320px, 768px, 1440px
- [ ] Reduced motion: All animations disabled via media query
- [ ] RTL: Arabic labels render correctly
- [ ] Focus order: Tab navigation logical on all pages