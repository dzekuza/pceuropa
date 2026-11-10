---
tags: [meta, status]
updated: 2026-11-10
---

# Current status — pceuropa

> [!info] How to use this note
> The **live snapshot** of the project. Read it first when a session starts; rewrite
> it (don't append) whenever the state changes. History belongs in [[session-log]]
> and [[changelog]], not here.

**Last updated:** 2026-11-10

## Current focus

Small storefront fixes: parking rules PDF card, custom-page view link pointing at the public domain.

## Done recently

- 2026-11-10: parking rules PDF card on /parkavimas; custom-page links use https://pceuropa.lt; nuomininkai subdomain now redirects all storefront paths to pceuropa.lt (uncommitted)

## In progress

- Above changes are uncommitted and unverified in a browser

## Next up

- Commit + deploy, check /parkavimas on prod
- Set `turbopack.root` so local dev works
- Free disk on the VPS (95% full, 1.4 GB left)

## Blockers & open questions

- Local dev server broken: stray `~/package-lock.json` makes Next pick the wrong workspace root

## Environment

- **Run:** `pnpm dev` (port 3003)
- **Deploy:** push branch → GH Actions → GHCR → VPS 176.223.138.9; https://pceuropa.lt
- **Known issues:** _link to [[known-issues]] if one exists_
