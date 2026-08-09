# 02 — Product page scrape

**What to build:** A User can paste a product page URL, get name/description/images scraped, and save them as a Product (Shopify-like pages as the happy path). If scrape fails, they still use the manual Product path from ticket 01.

**Blocked by:** 01 — Thin Brand + manual Product (no Brand Kit gate)

**Status:** ready-for-agent

- [ ] Authenticated scrape accepts a product URL and returns structured name, description, and image URLs (or a clear failure)
- [ ] User can confirm and save scrape results as a Product (source URL retained)
- [ ] Manual fallback remains available when scrape fails or URL is absent
- [ ] Scrape port is tested with fixture HTML (no live storefront calls in unit tests)
