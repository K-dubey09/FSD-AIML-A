# Roadmap — Flipkart-like features (prioritized)

This roadmap lists features to evolve this demo bookstore into a larger marketplace-style app. Items are ordered by priority and feasibility.

Implemented (this session)
- User persistence and registration/login (JSON-backed users) — basic registration endpoint and login using bcrypt + JWT.
- Basic automated tests (Vitest) and `npm run test` entry; example test for storage util.
- Linting / formatting configuration entries (ESLint + Prettier) and `npm run lint` / `npm run format` scripts.
- Product categories + category filter UI.
- Placeholder product images under `public/images/` and data category fields.
- Dockerfile, docker-compose and GitHub Actions build workflow.

Top priority (next)
1. Persist everything to a real database (Postgres / SQLite) and migrate data: products, users, orders.
2. Implement user profiles, address book, and order history with statuses.
3. Add product search with filters, pagination, and sorting (scalable to large catalogs).
4. Add product images & uploads backed by a storage service (S3 or local + CDN) with thumbnails.
5. Integrate a payments sandbox (Stripe) and mock checkout flow (addresses, payment, confirmation).

Medium priority
- Inventory and variant management (stock, SKUs, sizes/colors).
- Ratings & reviews, Q&A per product.
- Admin dashboards for sales, inventory, and user metrics.
- Email notifications and transactional emails.

Lower priority / Platform
- Scale out services (API gateway, caching, search index like Elastic/Meili), observability, and CI/CD for production.
- Mobile apps and PWA support.

Suggested immediate next steps I can implement now (pick 2):
- Migrate persistence to SQLite or Postgres (requires native modules or Docker-managed DB). (DB migration)
- Add registration flows, email verification mock, and profile editing. (Auth & UX)
- Expand tests to cover API endpoints (integration tests) and add CI test steps. (Testing)
- Add pagination and server-side filtering for products. (Search & scale)

If you want, I will begin the DB migration and full data persistence next (requires choosing Postgres vs SQLite). If you prefer SQLite but want to avoid native build issues on Windows, I can set up SQLite in Docker for local dev or use a file-based JSON DB temporarily. Tell me which DB and I’ll proceed.
