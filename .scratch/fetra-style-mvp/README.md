# Fetra-style MVP — ticket map

Parent spec: `docs/specs/fetra-style-mvp.md`  
ADR: `docs/adr/0031-fetra-style-mvp-pivot.md`

## Tickets (dependency order)

| # | Title | Blocked by | Status |
|---|--------|------------|--------|
| 01 | Thin Brand + manual Product (no Brand Kit gate) | — | ready-for-agent |
| 02 | Product page scrape | 01 | ready-for-agent |
| 03 | Make a Post Job (Formats + AI image + Export) | 01 | ready-for-agent |
| 04 | Make a Video Job (Formats + platform + Export) | 01, 03 | ready-for-agent |
| 05 | Primary app = Fetra create path (hide legacy Generation) | 03, 04 | ready-for-agent |

## Frontier

Start with **01**. After 01: **02** and **03** can proceed (prefer 03 before 04). **05** last.

## GitHub

Not mirrored yet — `gh` auth required. After `gh auth login`, republish these as issues with label `ready-for-agent` and native blocked-by links.
