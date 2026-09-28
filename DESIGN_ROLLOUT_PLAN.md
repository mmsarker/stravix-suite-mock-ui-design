# Stravix Suite UX mock rollout

## Objective

Turn the existing Stravix Suite Workspace Site into a polished, realistic UX reference for every screen of its 27 catalog apps. The IIS application is the primary source for page content, workflows, and layout. The Site is a synthetic design mock; implementation must not modify the IIS application or the local Angular workspace.

## Decisions

- Preserve the existing Sites project, deployment audience, and `#/app/...` routes.
- Keep a complete editable Site checkout at `E:\projects\StravixLabs\Design`, including HTML, CSS, JavaScript, data, scripts, plan, coverage ledger, hosting manifest, and Git history. Use it as the local design source and publish the same revisions to the existing Sites project.
- Inventory and reconcile the current candidate routes with the live application and Angular route source. Include dynamic screens, drawers, dialogs, and applicable loading, empty, error, validation, success, and permission states.
- Preserve each screen's substantive headings, sections, fields, actions, and table columns. Restructure only where it improves usability.
- Use one coherent fictional organization and deterministic data shared across related modules. Simulate representative interactions entirely in the browser; never call the live backend.
- Use one fixed light visual system derived from the polished POS mock: deep navy navigation and feature surfaces, crisp white work surfaces, restrained teal accents, strong typography, and useful information density. Do not build theme variants or a dark design for any mock page. Preserve the Branding page's source content because it is part of the application, but its controls must not change the mock's fixed visual system.
- Build shared, reusable table pagination and page-size controls in the same visual system so they can be applied consistently across app pages.
- For every list page, provide enough coherent sample records to span multiple pages at the default page size and show the shared pagination and page-size control. Keep totals and visible ranges consistent with active filters.
- Provide a collapsible reviewer panel and shareable URL state selection.
- Implement new mock increments as standalone Angular applications in this same Sites checkout, using the Angular routing, templates, reusable components, and local-only interactions familiar to the product team. Angular is the mock implementation technology; keep the existing fixed POS/Payment visual design and preserve all current Site routes/content. Do not migrate the production app or change the IIS site.

## Rollout sequence

1. Foundation: route and content inventory, shared design tokens and components, dashboard and navigation, realistic fixtures, reviewer controls, and integration of the existing POS design.
2. Commerce group: Commerce, Catalog, Inventory, Procurement, Payment, Finance.
3. People and work: HRM Management (138 routes; completed in the HRM increment), then Employee Self-Service (29 HRM `/me/*` routes plus the separately cataloged ESS app), CRM, Task, and Workflow.
4. Education: School, Training Institute Management, Student Self-Service, Teacher Self-Service.
5. Administration: Tenant Management, Tenant Admin, Company Administration, User Management.
6. Services: Document, Email, Event, Notification, Reporting, Storage.
7. Garments: Garments Merchandising and Garments Buyer Portal.

Each app is complete only after all 27 apps have passed the source-parity gate recorded in `coverage-ledger.json`: expanded IIS navigation and contextual links, Angular route/component review, working mock destinations, and desktop/narrow browser review. Reconcile routes outside navigation too, including parameterized screens and interaction surfaces. Publish each completed increment to the existing Site.

## Next planned rollout: requested business apps

The IIS app directory was opened in Chrome at `http://app.stravixsuite.com/app/dashboard` and confirms the requested app tiles. The initial requested scope contained 334 candidate entries; Finance source-router reconciliation uncovered 17 additional route entries (including its education-billing child routes, integration subroutes, settings, VDS, root and budget detail aliases), bringing the 11-app scope to 351 entries. Fifteen entries were already complete (five Procurement and ten Finance). Route entries include aliases and parameterized routes, so the unique-screen count will be reconciled during source review.

### Increment 1 — Procurement and Finance

**Scope:** 76 route entries total: Procurement (37, 5 previously complete) and Finance & Accounting (39, 10 previously complete); 61 remained to design at the start of this increment. All 76 now have designed destinations.

- Finish Procurement requisitions, approval workflows, RFQs, purchase orders, goods receipts, returns, contracts and contract wizard, bills, reports, and user/business/technical guides. Reuse the existing supplier directory and supplier records.
- Finish Finance receivables, payables, banking, reconciliation, reports, integrations, cost centers, partners, fixed assets, budgets, and guides/system detail. Reuse the completed account, fiscal period, journal, and period-close pages.
- Link procurement documents and supplier balances to the same fictional suppliers, purchase orders, bills, and BDT financial records used by Finance.
- Include all Finance route-source destinations: integration mappings and health; accounting settings, tax codes, exchange rates, VDS; education-billing overview, catalog, plans, late-fee rules, discounts, and audit work queues; budget detail/edit; and root/redirect aliases.
- Review approvals, all seven contract wizard steps, receiving/return workflows, reconciliation, and finance drill-downs as route-specific screens or states; map aliases to destinations.

### Increment 2 — Education

**Scope:** 228 current ledger entries: School Management (134) and Training Institute Management (94). Source route and navigation inventories are recorded; complete mock and browser parity review before marking either app complete.

- School Management coverage includes student and teacher records, guardian views, admissions, attendance, exams/results, shifts/classrooms/timetables, subjects, fees and fee setup, quizzes, assignments, communications, school settings, and guides.
- Training Institute Management coverage includes learning and analytics dashboards, course authoring/content/question banks, course runs and live sessions, assignments/assessments, instructor workspaces and profiles, trainee progress, attendance, admissions, payments, certificates, moderation, notifications, and settings.
- Preserve distinct roles and workflows across administrators, instructors, learners, guardians, students, and teachers. Treat aliases and cross-role routes according to their source destination rather than cloning unrelated pages.
- Use coherent fictional academic sessions, courses, cohorts, learners, instructors, attendance, results, and fee/payment records.
- Progress: Classes & Sections, student registration/edit, Student application create, applications list, and application detail have route-specific source review, designed mock content, data, and browser review; their six route entries are complete in the ledger. Student registration/edit includes student profile, family and emergency contacts, academic assignment, address, parent-contact validation, and local save flows. Applications uses fictional campus-scoped data, list/card views, pagination, detail records, lifecycle actions, document verification/signing, payment status, activity history, and admit-card preview. IIS record access was denied for the current account, so inaccessible detail content was checked against the Angular route/component/template. School Identity and Academic Sessions were subsequently rechecked against the live IIS UI, corrected for content and interaction fidelity, and recorded as in progress pending narrow-layout review. Keep School Management open until all source routes and navigation links pass the parity audit.

### Increment 3 — Administration

**Scope:** 46 candidate entries: User Management (26), Tenant Admin (18), Company Administration (2).

- User Management includes users, invitations, roles, role groups, groups, scoped and effective permissions, access reviews, delegation, portal access requests, profile, and organization scope.
- Tenant Admin includes tenant dashboard, company/branch access, profile and branding, defaults, modules, organization structure, companies/branches, notifications, integrations, import/export, master data, security, system settings, audit logs, and the source-linked document-management settings route.
- Company Administration includes company profile and branch management; verify whether these share records or workflows with Tenant Admin and User Management.
- Use consistent fictional tenant/company/branch identities and clearly distinguish tenant-level, company-level, and user-level permissions. Keep role and access actions mock-only.

### Increment 4 — Operational services

**Scope:** 33 candidate entries: Event Management (13), Document Management (7), Email Management (8), Notification Management (5).

- Event Management includes event list/create/detail/edit, participant management, event types, templates, speakers, and venues.
- Document Management includes workspace, recent, favorites, trash, audit logs, and settings.
- Email Management includes overview, history, analytics, events, settings, templates, and template create/edit.
- Notification Management includes overview, history, delivery history, personal notifications, and settings.
- Connect the fictional records across modules where the source workflow supports it: event notifications, document attachments, email templates and delivery history, and notification status. Keep destructive or send-like actions simulated locally.

### Shared execution and review steps for each increment

1. For every app, reconcile the app tile, every expanded IIS navigation group and contextual/cross-app link, route ledger, Angular route declaration, and rendered component/template. Note authentication-gated or unavailable IIS screens and use source templates to complete the inventory; do not infer their content from route names alone.
2. Group aliases and parameterized routes by their actual destination and reusable screen family. Preserve distinct workflow steps and role-specific experiences.
3. Design and implement route-aware standalone Angular mock screens in the Design checkout. Retain the fixed light POS/Payment/Commerce style and established typography; reuse shared shell, forms, filters, tables, badges, dialogs/drawers, feedback, and pagination with page-size selection.
4. Add deterministic, linked fictional data and enough records to browse multiple pages. All controls must give local mock feedback and must not call production APIs.
5. Sweep every source route and navigation link in browser; review source-content fidelity, components, key interactions, and desktop/narrow layouts. Mark the app and its ledger entries complete only after all sourceParityAudit fields pass; record exceptions and unavailable source states.
6. Update this plan, `HANDOFF.md`, and `coverage-ledger.json`; build the standalone Angular mock, publish to the existing owner-private Site, and verify the deployed increment and deep links.

**Scope boundary:** these increments extend the existing mock Site only. Do not modify the production Angular workspace or IIS-hosted app. Where IIS requires login, inspect it in the user's authenticated Chrome session; otherwise consult the matching Angular routes and templates and record that comparison limitation.

## Required parity audit for all 27 apps

The per-app checklist in `coverage-ledger.json` is the completion gate for every rollout increment, including apps outside the initial shortlist. For each app, reconcile all IIS navigation groups and contextual, role-specific, quick-access, and cross-app links against Angular routes and the components/templates that render them. Cover linked detail/create/edit routes, aliases, reports, tabs, dialogs, drawers, and workflow steps. Make each confirmed source destination reachable at its source URL in the mock. Review the actual page content and interactions in the browser at desktop and narrow widths. Record access-gated source pages and compare their Angular implementation. An unresolved link, missing destination, or generic fallback keeps the app pending.

## Acceptance criteria

- Every confirmed route has a deliberate screen; aliases and redirects are identified rather than counted as unique screens.
- There are no generic source-unavailable placeholders on confirmed routes.
- Main screens preserve source content and purpose, with consistent sample data and working mock navigation and key controls.
- Applicable states can be reached through shareable URLs. The single POS-derived style remains usable at desktop, tablet, and mobile sizes.
- A coverage ledger links each route to its source reference, mock screen, state variants, and review status.
- The local Design checkout and published Site match for each completed increment.

## Current evidence and status

At the start of this rollout, the Site catalog contained 27 apps and 875 candidate routes. The IIS dashboard shows 23 app tiles; Tenant Management, Student Self-Service, Teacher Self-Service, and Employee Self-Service are additional catalog apps. The current static renderer contains partial source previews and a bespoke POS design. This is an incremental rollout; do not claim completion from catalog coverage alone.

The first published increment established the fixed POS-inspired workspace style, redesigned the application directory and Commerce overview, and added a reviewer state panel. The ledger now contains 882 candidate routes after adding Finance account, fiscal-year detail, and recurring journal routes found in the Angular router, plus the Catalog root alias and HS code mapping route; broader source-route reconciliation is ongoing. Catalog now includes product types, category and brand management, pricing rules and promotions, tax classes and rules, and HS code mappings with forms, details, sample data, filters, and shared pagination. Catalog product lists also include enough sample products to inspect several pages. Commerce Order Queue and a linked sample detail page have populated designs and simulated filters, payment, fulfillment, and refund actions. Catalog product detail and the source-matched create/edit tab workspace retain their existing design. Inventory now has its source-matched four-tab workspace, populated balances and movement data, product detail tabs, and facility stock card; its home route is recorded as an alias to the workspace. Procurement Overview and the supplier directory, profile, and create/edit record use the same design system and supplier data linked to Catalog. Payment Management now has its overview, transaction history with shared-style pagination and page-size selection, company accounts, reconciliation review/history/run detail, refund approvals, payment links, settlements, disputes, and ledger, all with coherent sample records and mock actions. Finance now has a dashboard; chart of accounts list, detail, create, and edit; fiscal calendar list and detail; period close center; journal list; and recurring journal templates, using the source sections and linked sample data.

HRM Management now has route-aware Angular mock screens for all 138 management route entries. It follows the same navy, pale blue-gray, white, and teal POS/Payment visual system and uses the established Payment Management and Commerce typography hierarchy across navigation, page headings, forms, filters, tables, and pagination. A follow-up comparison confirmed 11px/12px navigation headings and links, 12px HRM form/search/filter controls to match Commerce, and the existing compact table hierarchy. At 390px, the employee list scrolls inside the table panel without page overflow; the top bar has been compacted for the narrow layout. HRM home, people, recruitment, onboarding, separation, attendance, leave, payroll, performance, benefits, analytics, employee services, workforce planning, announcements, controls, guides, and activity pages are covered. Lists use linked fictional HR data with multiple pages and shared page-size controls; forms and actions use browser-local mock outcomes. The route sweep passed for all 138 management entries, including alias and dynamic routes; representative IIS comparisons covered HRM home, employees, recruitment, attendance, leave, and payroll. The HRM `/app/hrm/me/*` routes and separately cataloged Employee Self-Service app remain for the later self-service phase.

The Commerce app's 62 route entries and Inventory app's 41 route entries are now source-reconciled and browser-reviewed. The Commerce increment adds all-sales and assisted manual order, customer profiles, five payment views, register operations, shipping rates, fulfillment, gift cards, settings, reporting, and activity history, while reusing the completed Catalog and Procurement screens for aliases. The Inventory increment adds transfer detail and line-item creation, alerts, reservations, adjustments and approvals, counts, replenishment, branch and facility directories, policies, storage locations, batches, and serialized stock workflows. New lists use the shared pagination and page-size control with 24 or more linked sample rows; actions and forms remain preview-only. Remaining Finance and Procurement routes are the next work in the Commerce group.

Procurement and Finance now have route-aware standalone Angular screens for all 76 source-reconciled route entries. Procurement adds requisitions, approval workflows, RFQs, purchase orders, receiving, returns, supplier contracts with seven steps, supplier bills, reports, and three guides. Finance adds receivables, payables, bank accounts and reconciliation, reports, mappings, cost centers, partners, assets, budgets, guides, system detail, integration health, accounting settings, tax codes, exchange rates, VDS, and the education billing workspace. Finance route-source reconciliation added 17 entries that had been absent from the original ledger, including child pages, aliases, and dynamic budget detail/edit. List pages use 28 linked records and shared pagination; forms, reviewer states, and actions remain local-only. The local Angular build and browser route sweep passed; sample IIS review covered requisitions and bank reconciliation, with the remaining page structures cross-checked against Angular route and template sources.
