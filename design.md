# PC Europa — Marketing Design System

> Reference for all UI components, layout patterns, typography, and design tokens used in `app/(marketing)/` and `components/marketing/`.

---

## Table of Contents

1. [Typography](#typography)
2. [Color Tokens](#color-tokens)
3. [Layout](#layout)
4. [Component Library](#component-library)
5. [UI Primitives](#ui-primitives)
6. [Design Patterns](#design-patterns)
7. [Page Shell](#page-shell)

---

## Typography

### Font Families

| Variable | Font | Used for |
|---|---|---|
| `--font-jakarta` | Plus Jakarta Sans | All headings, store names, section titles |
| `--font-geist-sans` | Geist | Body text, UI labels, status text, search |
| `--font-geist-mono` | Geist Mono | Code / monospace |
| `--font-montserrat` | Montserrat | Footer only |

Apply Jakarta on a container with `font-[family-name:var(--font-jakarta)]`.

---

### Heading Scale

All headings use **Plus Jakarta Sans Bold**.

| Class | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| `.text-h1` | 72px | 700 | 80px | −4px |
| `.text-h2` | 48px | 700 | 60px | −2.5px |
| `.text-h3` | 32px | 700 | 40px | −1.5px |
| `.text-h4` | 24px | 700 | 32px | −1px |
| `.text-h5` | 20px | 700 | 24px | −0.5px |
| `.text-h6` | 18px | 700 | 24px | 0 |

**Responsive heading pattern used in components:**

```
text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-2px] lg:tracking-[-2.5px] font-bold
```

---

### Body Text Scale

All body text uses **Geist**.

| Class | Size | Weight | Line height |
|---|---|---|---|
| `.text-body-bold-lg` | 16px | 600 | 24px |
| `.text-body-bold-md` | 14px | 600 | 20px |
| `.text-body-bold-sm` | 12px | 600 | 16px |
| `.text-body-lg` | 16px | 400 | 24px |
| `.text-body-md` | 14px | 400 | 20px |
| `.text-body-sm` | 12px | 400 | 16px |
| `.text-caption` | 16px | 400 | 24px | 2px tracking, UPPERCASE |

**Secondary body color:** `text-[#575757]`

---

### Typography Components (`components/marketing/ui/typography.tsx`)

| Component | Tailwind |
|---|---|
| `<DisplayHeading>` | `text-[28px] md:text-[36px] lg:text-[48px] leading-[1.2] tracking-[-1px] font-semibold` |
| `<SectionHeading>` | `text-[22px] md:text-[28px] lg:text-[32px] font-bold tracking-[-0.5px]` |
| `<SubHeading>` | `text-[16px] md:text-[18px] font-medium leading-[22px] md:leading-[24px]` |
| `<BodyText>` | `text-[16px] md:text-[17px] font-normal leading-[26px] md:leading-[28px] text-muted-foreground` |
| `<SmallText>` | `text-[13px] md:text-[14px] font-normal` |

---

## Color Tokens

### Neutrals

| Token | Value | Usage |
|---|---|---|
| Dark | `#181818` | Nav top bar, footer background |
| Body text secondary | `#575757` | Descriptions, placeholders, status text |
| Page background | `#f7f7f5` | All marketing page backgrounds |
| Surface light | `#f5f5f5` | Contact cards, icon backgrounds |
| Input background | `#f2f2f2` | Legacy — replaced by `bg-white` in current filters |
| Border light | `#ebebeb` | Logo wrappers, card borders |
| Border subtle | `#f0f0ee` | Transport cards, list items |
| Black | `#000000` | Active filter pills, primary buttons, card text |
| White | `#ffffff` | Card backgrounds, inactive pills, search inputs |

### Accent / Category Colors

| Category | Background | Text |
|---|---|---|
| Drabužiai | `#b4e5ff` | `#0a3a52` |
| Grožis | `#fce4f5` | `#5c1a4a` |
| Maistas / Restoranai | `#e6ffd1` | `#1a4a0a` |
| Technologijos | `#e0e0ff` | `#1a1a6e` |
| Paslaugos | `#ffe8dc` | `#5c2a0a` |
| Sportas | `#fdf567` | `#3a3200` |
| Namai | `#f0ede6` | `#3a3220` |
| Kita | `#e8e8e8` | `#444444` |

### Status & Accent

| Purpose | Value |
|---|---|
| Open status dot | `#22c55e` |
| Closed status dot | `rgb(248 113 113)` (red-400) |
| Featured yellow | `#fdf567` |
| Instagram button | `#fdf567` |
| Facebook button | `#b4e5ff` |
| TikTok button | `#e6ffd1` |
| Contact section bg | `#fef3f9` |
| Dark image overlay | `rgba(0,0,0,0.36)` |
| Lighter overlay | `rgba(0,0,0,0.25)` |

---

## Layout

### Breakpoints (Tailwind defaults)

| Prefix | Min width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

### Content Width

| Context | Max width | Horizontal padding |
|---|---|---|
| Most sections | `max-w-screen-xl` | `px-4 lg:px-[60px]` |
| Older sections | `max-w-[1300px]` | `px-4 lg:px-0` |
| Hero / logos | `max-w-[1332px]` | `px-4` |

> Prefer `max-w-screen-xl mx-auto px-4 lg:px-[60px]` for all new sections.

### Section Vertical Spacing

| Screen | Padding |
|---|---|
| Mobile | `py-8` |
| Tablet | `md:py-10` |
| Desktop | `lg:py-14` |

### Grid Columns

| Use case | Columns |
|---|---|
| Store / restaurant cards | `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4` |
| News / promo cards | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| Category images | `grid-cols-2 lg:grid-cols-4` |
| Partner logos | `grid-cols-5 grid-rows-2` (desktop) |
| Opening hours | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |

---

## Component Library

### Nav

**File:** `components/marketing/nav.tsx`  
**Props:** none

Two-part sticky nav:
1. **Dark bar** (`bg-[#181818]`) — logo left, CTA buttons right (Darbo laikas + Informacija lankytojams). Mobile: hamburger toggle.
2. **White bar** (`bg-white`, hidden on mobile) — navigation links.

**Nav links** (from `NAV_LINKS` array):

| Label | href |
|---|---|
| Akcijos / Naujienos | `/akcijos` |
| Parduotuvės / Paslaugos | `/parduotuves` |
| Restoranai / Kavinės | `/restoranai` |
| Dialogai / Food court | `/dialogai` |
| Sportas / Sveikatingumas | `/sportas` |
| Laisvalaikis / Pramogos | `/laisvalaikis` |

**Assets:** All from Supabase `marketing-assets` bucket (permanent URLs, not Figma).

---

### Banner Card

Reused at the top of every inner page (parduotuves, restoranai, dialogai, sportas…). Not a separate component — inline in each page.

```tsx
<div className="w-full max-w-screen-xl mx-auto pt-6 lg:pt-8">
  <div className="bg-white rounded-[32px] lg:rounded-[40px] pl-10 pr-4 py-4
                  flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden">
    {/* Left: heading + description */}
    <div className="flex flex-col gap-4 shrink-0 lg:w-[542px] py-6 lg:py-[60px]">
      <h1 className="font-bold text-[36px] md:text-[44px] lg:text-[48px]
                     leading-[1.1] tracking-[-2px] lg:tracking-[-2.5px] text-black">
        Page Title
      </h1>
      <p className="text-[#575757] text-[15px] lg:text-[16px] leading-[24px] max-w-[480px]">
        Description text.
      </p>
    </div>
    {/* Right: 3 photos (hidden on mobile) */}
    <div className="hidden md:flex items-center gap-4 shrink-0">
      {BANNER_IMAGES.map((src, i) => (
        <div key={i} className="h-[240px] lg:h-[301px] w-[160px] lg:w-[219px]
                                rounded-[20px] lg:rounded-[24px] overflow-hidden">
          {src ? <img src={src} alt="" className="size-full object-cover" />
               : <div className="size-full bg-[#e8e8e5]" />}
        </div>
      ))}
    </div>
  </div>
</div>
```

> Banner images expire after 7 days if sourced from Figma MCP. Always migrate to Supabase Storage.

---

### Hero

**File:** `components/marketing/hero.tsx`  
**Props:** none — slides hardcoded internally

Full-width image carousel with auto-rotation (3s interval), prev/next buttons, dot indicators.

| Element | Tailwind |
|---|---|
| Container | `max-w-[1332px] mx-auto px-4 pt-4 lg:pt-6` |
| Slide | `h-[240px] md:h-[340px] lg:h-[460px] rounded-[20px] md:rounded-[32px] lg:rounded-[40px]` |
| Active dot | `w-6 lg:w-8 h-2 rounded-full bg-[#fdf567]` |
| Inactive dot | `w-2 h-2 rounded-full bg-white/50` |
| Nav buttons | `bg-black rounded-full p-4 hover:opacity-70` |

---

### StoresDirectory

**File:** `components/marketing/stores-directory.tsx`  
**Props:** `{ stores: Store[] }`

```typescript
type Store = {
  id: string
  name: string
  category: string
  logoUrl: string | null
  coverUrl: string | null
}
```

Client component. Includes category filter pills, search input, 4-column card grid. Filters stores by category and search query.

**StoreCard structure:**
1. Top row: green status dot + "Atidaryta" + store name (left) | logo (right)
2. Cover image (204px) with `bg-black/36` overlay + white arrow button bottom-right

---

### RestaurantsDirectory

**File:** `components/marketing/restaurants-directory.tsx`  
**Props:** `{ restaurants: Restaurant[] }`

Same shape as StoresDirectory. Category tabs derived dynamically from data. Used on `/restoranai`.

---

### DialogaiFoodCourtDirectory

**File:** `components/marketing/dialogai-food-court-directory.tsx`  
**Props:** `{ places: Place[] }`

Search-only (no category tabs per Figma design). Same card pattern. Used on `/dialogai`.

---

### CategoriesSection

**File:** `components/marketing/categories-section.tsx`  
**Props:** none

4-column image grid with category labels and yellow arrow buttons. White card container on page background.

| Element | Tailwind |
|---|---|
| Outer | `w-full max-w-screen-xl` |
| Card | `bg-white rounded-[24px] lg:rounded-[32px] p-5 md:p-8 lg:p-[40px]` |
| Image card | `rounded-[16px] lg:rounded-[24px] h-[160px] md:h-[220px] lg:h-[280px]` |
| Arrow button | `bg-[#fdf567] rounded-full p-2.5 md:p-3 lg:p-4` |

---

### QuickLinks

**File:** `components/marketing/quick-links.tsx`  
**Props:** none

Row of 3 pill-shaped link cards: Parkavimas, Planas, Kontaktai.

| Link | Background |
|---|---|
| Parkavimas | `#e6ffd1` |
| Planas | `#fdf567` |
| Kontaktai | `#fef3f9` |

---

### ActivitiesSection

**File:** `components/marketing/activities-section.tsx`  
**Props:** none

3-card promotional row on homepage. Leisure (pink tint), Sports (black), Pets (peach).

---

### NewsSection

**File:** `components/marketing/news-section.tsx`  
**Props:** none

4-column news card grid. Mobile: horizontal scroll. Cards: image with hover zoom + title + date + arrow button.

| Element | Tailwind |
|---|---|
| Image | `h-[236px] rounded-[40px] group-hover:scale-105` |
| Arrow button | `size-[56px] bg-black rounded-full` |

---

### PartnerLogos

**File:** `components/marketing/partner-logos.tsx`  
**Props:** none (async — fetches from Supabase `tenants_public`)

Desktop: 5-column 2-row mosaic grid. Mobile: horizontal scroll. Renders tenant logos from DB.

---

### DialogaiSection

**File:** `components/marketing/dialogai-section.tsx`  
**Props:** none

Full-width white section. 3 portrait photos (left) + heading + description + "Dialogai" button (right). Used as a promotional block on `/restoranai` and `/dialogai`.

---

### PlanasSection

**File:** `components/marketing/planas-section.tsx`  
**Props:** `{ stores: { id: string; name: string; logoUrl: string | null }[] }`

Shopping center floor plan. Left sidebar: search + scrollable store list with logo + status dot. Right: map image with floor switcher overlay (Pirmas / Antras / Trečias aukštas).

Appears on: `/parduotuves`, `/restoranai`, `/dialogai`, `/darbo-laikas`.

| Element | Tailwind |
|---|---|
| Sidebar | `w-full lg:w-[424px] lg:h-[692px] flex flex-col gap-8` |
| Store list | `flex-1 overflow-y-auto scrollbar-none flex flex-col gap-1` |
| Store row | `bg-white px-4 py-2 rounded-[24px]` |
| Map | `flex-1 h-[692px] rounded-[24px] overflow-hidden` |
| Active floor btn | `bg-black text-white rounded-full px-7 py-3` |
| Inactive floor btn | `bg-white text-black rounded-full px-7 py-3` |

---

### OpeningHoursSection

**File:** `components/marketing/opening-hours-section.tsx`  
**Props:** `{ stores: StoreHoursCardProps[] }`

Search + 4-column grid of StoreHoursCard. Used on `/darbo-laikas`.

---

### StoreHoursCard

**File:** `components/marketing/store-hours-card.tsx`

```typescript
type StoreHoursCardProps = {
  name: string
  logoUrl: string | null
  logoAlt: string
  coverUrl: string | null
  isOpen: boolean
  weekdayHours: { days: string; hours: string }
  weekendHours: { days: string; hours: string }
  href: string
}
```

Card: status dot (green/red) + name + logo + cover image with hours text overlay + arrow button.

---

### VisitorInfoBanner

**File:** `components/marketing/visitor-info-banner.tsx`  
**Props:** none

Full-width photo banner with dark overlay. Heading + social icon buttons + contact cards. Used on `/darbo-laikas`.

---

### HowToGetHereSection

**File:** `components/marketing/how-to-get-here-section.tsx`  
**Props:** none

"Kaip atvykti?" section. Map image + "Žiūrėti maršrutą" button + 4 transport info cards (car, parking, bike, wheelchair). Used on `/darbo-laikas`.

---

### AkcijosGrid

**File:** `components/marketing/akcijos-grid.tsx`  
**Props:** `{ items: PromoItem[] }`

```typescript
type PromoItem = { id: string; image: string; title: string; date: string; href: string }
```

4 filter pills + search + 4-column promo card grid with "Rodyti daugiau" pagination (8 items/page). Used on `/akcijos`.

---

### PromoCard

**File:** `components/marketing/promo-card.tsx`  
**Props:** `{ item: PromoItem }`

Image (hover zoom) + title + date + black circle arrow button. Same pattern as NewsSection cards.

---

### SocialSection

**File:** `components/marketing/social-section.tsx`  
**Props:** none

Instagram / Facebook / TikTok follow buttons with colored pill backgrounds.

---

### Footer

**File:** `components/marketing/footer.tsx`  
**Props:** none

Dark (`#181818`) rounded-top footer. Font: Montserrat. Links grouped by column.

---

## UI Primitives

### PillButton (`components/marketing/ui/pill-button.tsx`)

```typescript
type PillButtonProps = {
  children: ReactNode
  variant?: 'black' | 'yellow' | 'blue' | 'green' | 'peach' | 'white-outline'
  href?: string
  size?: 'sm' | 'md'
  onClick?: () => void
  className?: string
}
```

| Variant | Style |
|---|---|
| `black` | `bg-black text-white` |
| `yellow` | `bg-[#fdf567] text-black` |
| `blue` | `bg-[#b4e5ff] text-black` |
| `green` | `bg-[#e6ffd1] text-black` |
| `peach` | `bg-[#ffe8dc] text-black` |
| `white-outline` | `border-2 border-white text-white bg-transparent` |

Base: `rounded-full font-medium transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]`

Sizes: `sm` → `px-3 py-[5px]` · `md` → `px-5 py-[15px]`

---

### ArrowIcon (`components/marketing/ui/arrow-icon.tsx`)

```tsx
<ArrowIcon className="size-5" />
```

22×22 SVG, stroke-based right arrow. Accepts optional `className`.

---

## Design Patterns

### Card

```
bg-white rounded-[32px] lg:rounded-[40px] p-4
hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]
transition-[transform,box-shadow] duration-200 cursor-pointer
```

Inner cover image: `rounded-3xl h-[204px] overflow-hidden` + `bg-black/36` overlay + white arrow button `absolute bottom-3 right-3`.

### Filter Pills

```tsx
// Active
className="rounded-full px-7 py-3 text-[14px] bg-black text-white"
// Inactive
className="rounded-full px-7 py-3 text-[14px] bg-white text-black border border-white"
```

Layout: `flex items-start justify-between gap-4` — pills (`flex-wrap flex-1`) on left, search (`w-[337px]`) on right.

### Search Input

```tsx
<div className="relative w-full sm:w-[280px] lg:w-[337px]">
  <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-[#575757] pointer-events-none" />
  <input
    placeholder="Paieška"
    className="w-full bg-white rounded-full pl-[52px] pr-5 py-[10px]
               text-[16px] text-[#575757] placeholder:text-[#575757]
               outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
  />
</div>
```

### Image Overlay

```tsx
<div className="relative rounded-3xl overflow-hidden">
  <img src={src} alt="" className="size-full object-cover" />
  <div className="absolute inset-0 bg-black/36 rounded-3xl pointer-events-none" />
  {/* Arrow button */}
  <div className="absolute bottom-3 right-3 size-11 rounded-full bg-white flex items-center justify-center">
    <ArrowRight size={18} className="text-black" />
  </div>
</div>
```

### Status Indicator

```tsx
<div className="flex items-center gap-2">
  <span className="size-2 rounded-full bg-[#22c55e] shrink-0" />
  <span className="text-[#575757] text-[14px] leading-[24px]">Atidaryta</span>
</div>
```

---

## Page Shell

Every marketing page uses this shell:

```tsx
export default async function SomePage() {
  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Banner card */}
      <div className="w-full max-w-screen-xl mx-auto pt-6 lg:pt-8">
        {/* ... white card with heading + 3 photos ... */}
      </div>

      {/* Main content section */}
      <div className="w-full flex flex-col items-center">
        {/* <SomeDirectory /> */}
      </div>

      {/* Floor plan — on directory pages */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={planasStores} />
      </div>

      <Footer />
    </main>
  )
}
```

**Pages and their route:**

| Page | Route | Key sections |
|---|---|---|
| Homepage | `/` | Hero, QuickLinks, CategoriesSection, ActivitiesSection, PartnerLogos, NewsSection, SocialSection |
| Parduotuvės | `/parduotuves` | Banner, StoresDirectory, PlanasSection |
| Restoranai | `/restoranai` | Banner, RestaurantsDirectory, DialogaiSection, PlanasSection |
| Dialogai | `/dialogai` | Banner, DialogaiFoodCourtDirectory, DialogaiSection, PlanasSection |
| Sportas | `/sportas` | Banner, StoresDirectory (filtered), PlanasSection |
| Akcijos | `/akcijos` | Banner, AkcijosGrid |
| Darbo laikas | `/darbo-laikas` | Header, VisitorInfoBanner, OpeningHoursSection, HowToGetHereSection, PlanasSection |
