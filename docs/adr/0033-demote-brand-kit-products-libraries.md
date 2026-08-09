# Demote Brand Kit / Products library surfaces

Primary Brand setup is **Business DNA** (`/studio/business-dna`, with inline Brand Confirm as manual fallback). Primary Product setup is **inline scrape/create** on Make a Post / Make a Video. Standalone Brands (`/studio/brands`, `/brand-kits`) and Products (`/products`) library pages are demoted: kept in the repo for expand-contract and deep links, but removed from Brand Studio sidebar and primary header nav. Backend Brand and Product persistence used by Post Jobs / Video Jobs is unchanged.

Chosen over deleting library pages or DB entities so job APIs keep Brand id + Product id without forcing users through library management UX.

**Status**: accepted (extends ADR-0031 / ADR-0032 create loop)
