[ ] Build mobile reservations ops dashboard
  - [x] Set up new standalone mobile dashboard page
  - [x] Implement metrics aggregation (daily/monthly/range) per venue
  - [x] Surface individual table reservations list
  - [x] Polish mobile-first styling and interaction
  - [x] Add venue/product breakdown options (covers vs consumos vs paquetes)
  - [ ] Support city/global aggregate views respecting access
  - [ ] Polish mobile-first styling and interaction

## Relevant Files
- `tasks/prd-reservations-mobile-ops-dashboard.md`: PRD describing goals, requirements, and constraints for the mobile ops dashboard.
- `app/mobile-dashboard/page.tsx`: Mobile-first dashboard with auth gate, filters, metrics, trend view, mesa detail list, and refined mobile styling.
- `lib/mobileDashboard.ts`: Aggregation helpers, product breakdown mock data, and metrics pipeline for the mobile dashboard.

