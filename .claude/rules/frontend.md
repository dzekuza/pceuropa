---
paths:
  - "**/*.tsx"
  - "**/*.css"
  - "**/components/**"
  - "app/(dashboard)/**"
  - "app/(marketing)/**"
---

# Frontend

## Component Usage (enforced)

- **Always check `components/ui/` first.** Never build a primitive (Button, Card, Badge, Dialog, Input, Sheet, etc.) from scratch when a shadcn component exists.
- shadcn/ui is the only component library. Do not introduce Mantine, Chakra, or other UI frameworks.
- Tailwind CSS only — no `style={{}}` inline styles, no hardcoded hex/pixel values outside Tailwind classes.
- Use design tokens from `tailwind.config.ts`. Never hardcode colors or spacing as arbitrary values (`text-[#abc]`, `mt-[20px]`) when a token exists.

## Layout Rules

- CSS Grid for 2D layouts, Flexbox for 1D. Use `gap`, not margin hacks.
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Mobile-first. Touch targets: minimum 44×44px.
- Extract components when a JSX block exceeds ~5 utility classes or repeats — no raw div dumps.

## Dashboard vs Marketing

- Dashboard (`app/(dashboard)/`): shadcn Nova preset. Do not apply marketing fonts or custom Figma styles here.
- Marketing (`app/(marketing)/`): Figma design, custom fonts (Jakarta, Montserrat). Do not pull in shadcn dashboard patterns here.

## Strings

All Lithuanian UI text in `lib/strings.ts`. Never embed Lithuanian literals directly in JSX.

## Accessibility

- All interactive elements keyboard-accessible.
- Images: meaningful `alt`. Decorative: `alt=""`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Never `outline: none` without a visible replacement.
