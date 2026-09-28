# Stravix Suite UX Mock Handoff

**Status date:** 2026-09-25
**Cloud Site:** [Stravix Suite Workspace](https://stravix-suite-workspace.arisha-1983.chatgpt.site)
**Local editable source:** `E:\projects\StravixLabs\stravix-suite-mock-ui-design`
**Source reference:** IIS hosted application at `http://app.stravixsuite.com/`

## Goal and design decisions

Build a polished, realistic UX reference for all 27 Stravix Suite apps in the existing Sites project. Preserve the substance of each source page, use one fixed light POS-derived visual system, and use consistent fictional sample data. Browser interactions are mock-only; the Site does not call the live backend. IIS and Angular application files are content references and have not been changed for this work.

The checkout contains the editable HTML, CSS, JavaScript, catalog/data, scripts, rollout plan, coverage ledger, hosting configuration, and Git history. `coverage-ledger.json` is the authoritative route-level status record; this handoff is a readable snapshot and should be refreshed as rollout work progresses.

The standalone Angular mock source is in `suite-mock/`. It supplies the route-aware Procurement and Finance increment and shared pagination component. `scripts/build-suite-mock.mjs` integrates its production bundle into the existing Site's `dist/` output. The production Angular workspace and IIS application remain unchanged.

## Rollout snapshot

The ledger currently tracks **931 candidate route entries across 27 apps**. Of those, **377 are complete, 222 are in progress, and 332 have not started**. The per-app `sourceParityAudit` in `coverage-ledger.json` tracks IIS navigation inventory, Angular route and component review, mock destination/link coverage, and desktop/narrow browser review. Six apps are fully recorded as complete. HRM management is complete within its phase, but HRM remains pending app-wide parity because 29 employee self-service routes are deferred. Education source navigation and route inventories are reconciled; all 228 Education entries render in the mock. Six School Management route entries have completed route-specific review, while the remaining 222 Education entries remain in progress. Overall, 19 apps are not yet parity-complete. Aliases and redirect routes may share a screen; route-entry counts are not unique-screen counts.

| App                           | Complete | In progress | Candidate routes |
| ----------------------------- | -------: | ----------: | ---------------: |
| Tenant Management             |        0 |           0 |               29 |
| Tenant Admin                  |        0 |           0 |               18 |
| Payment Management            |       14 |           0 |               14 |
| School Management             |        6 |         128 |              134 |
| Commerce                      |       62 |           0 |               62 |
| Garments Buyer Portal         |        0 |           0 |                7 |
| Student Self-Service          |        0 |           0 |                6 |
| Teacher Self-Service          |        0 |           0 |               14 |
| Employee Self-Service         |        0 |           0 |               47 |
| Email Management              |        0 |           0 |                8 |
| Reporting Management          |        0 |           0 |                6 |
| Notification Management       |        0 |           0 |                5 |
| Workflow Management           |        0 |           0 |                5 |
| Storage Management            |        0 |           0 |                2 |
| Task Management               |        0 |           0 |               22 |
| Event Management              |        0 |           0 |               13 |
| Document Management           |        0 |           0 |                7 |
| Company Administration        |        0 |           0 |                2 |
| CRM                           |        0 |           0 |               25 |
| Finance                       |       39 |           0 |               39 |
| Training Institute Management |        0 |          94 |               94 |
| User Management               |        0 |           0 |               26 |
| Catalog                       |       40 |           0 |               40 |
| Procurement                   |       37 |           0 |               37 |
| Inventory                     |       41 |           0 |               41 |
| HRM                           |      138 |           0 |              167 |
| Garments Merchandising        |        0 |           0 |               61 |

## Source-parity gate across all apps

The ledger includes a `sourceParityAudit` record for each of the 27 catalog apps. Review all four areas before closing an app: expanded IIS navigation (including contextual, quick-access, role-specific, and cross-app links); Angular route declarations and rendered page components/templates; mock destinations for every source link and route (including aliases, dialogs, drawers, tabs, reports, and multi-step flows); and browser review at desktop and narrow widths. Add uncovered routes to the ledger. A route that merely resolves to a generic screen is not parity. Do not mark an app complete until every audit field passes and the page-level route ledger is complete. Apps with unavailable IIS pages must have their Angular sources reviewed and that access limitation recorded.

## Education increment in progress

School Management and Training Institute Management have expanded IIS navigation and Angular route inventories in the ledger (134 and 94 entries). The standalone Angular Education surface is underway in `suite-mock/src/app/education-page.component.*`, with grouped navigation, route-aware screens, fictional records, and shared pagination. All 228 mock routes rendered in the route sweep and no authored mock link literals were unmatched against the ledger. IIS comparisons cover the School home, student directory, Classes & Sections, Student applications, and Training dashboard. The student directory matches source search, class/section/status filters, five columns, export/import/registration actions, row detail/edit links, and empty state, using fictional paginated records. Student detail and edit routes have source-reviewed, student-contextual views covering source tabs (overview, academic history, attendance, exams/results, access/audit), profile, guardian/admission information, edit fields, and prefilled student values. Classes & Sections matches academic-year/campus context, 11 class levels and 21 sections at the current campus, selectable levels, source table columns and capacity states, and create/edit/delete/copy workflows. Student application create matches the source student/placement, guardian, photo and supporting-document fields. Applications list and detail now form one reviewed flow: 32 fictional applications, campus/search filters, list/card views, document checks, lifecycle actions, pagination, and detail records with student/guardian/enrollment/payment facts, policy snapshot, document verification/signing, activity history, payment status, and admit-card preview. Browser checks covered list pagination and narrow layout; detail edit validation/save, verify/reject/approve, enrollment ID, payment/receipt, document verify/sign, activity details, delete-to-list, loading/error/forbidden/not-found states, desktop layout, and 390px without horizontal overflow. IIS showed the admissions workspace but denied the current account access to application records; the Angular route/component/template sources were reviewed for the inaccessible content. Other Education route content and responsive reviews remain in progress. The instructor workspace is role-gated in the current IIS session; use its Angular route definitions and templates as the source reference.

## Completed pages

“Complete” means the page has a designed mock, representative content/sample data, and browser visual review recorded in the ledger. It does not mean the full set of possible interaction and error states has been audited.

### Commerce — 62 of 62 route entries

- `/app/ecommerce/home`
- `/app/ecommerce/products`
- `/app/ecommerce/products/new` and `/app/ecommerce/products/new/{overview,catalog,commerce,inventory,logistics,content,internal}`
- `/app/ecommerce/products/:id/edit` and `/app/ecommerce/products/:id/edit/{overview,catalog,commerce,variants,inventory,logistics,content,internal,suppliers}`
- `/app/ecommerce/products/:id`
- `/app/ecommerce/orders/queue`
- `/app/ecommerce/pos`
- `/app/ecommerce/orders/:id`
- `/app/ecommerce` (redirect/alias to home)
- `/app/ecommerce/product-types`, `/categories`, and `/brands` (Catalog screens)
- `/app/ecommerce/suppliers` and `/suppliers/{new,:id,:id/edit}` (Procurement screens)
- `/app/ecommerce/orders` and `/orders/search` (redirect/aliases to Order Queue)
- `/app/ecommerce/orders/all-sales` and `/orders/manual-sell`
- `/app/ecommerce/pos/{registers,register-setup,sales}`
- `/app/ecommerce/inventory` and `{overview,balances,online-stock,ledger,transfers,alerts}` (Inventory screens)
- `/app/ecommerce/customers` and `/customers/:id`
- `/app/ecommerce/payments`
- `/app/ecommerce/coupons` (redirect/alias to Catalog pricing rules)
- `/app/ecommerce/reports`
- `/app/ecommerce/settings` and `{general,fulfillment,storefront,content,customers,enterprise}`
- `/app/ecommerce/activity-logs`
- `/app/ecommerce/shipping-rates`
- `/app/ecommerce/fulfillment`
- `/app/ecommerce/gift-cards`

### Catalog — 40 of 40 route entries

- `/app/catalog/products`
- `/app/catalog/products/new` and `/app/catalog/products/new/{overview,catalog,commerce,inventory,logistics,content,internal}`
- `/app/catalog/products/:id/edit` and `/app/catalog/products/:id/edit/{overview,catalog,commerce,variants,inventory,logistics,content,internal,suppliers}`
- `/app/catalog/products/:id`
- `/app/catalog/product-types`
- `/app/catalog/categories` — list and card views, parent filter, category details and create drawer.
- `/app/catalog/brands` — brand list and mock create drawer.
- `/app/catalog/pricing-rules` — type/channel filters, pagination, rule detail and create/edit forms.
- `/app/catalog/promotions` — campaign tabs, filters, sample campaigns and pagination.
- `/app/catalog/tax-classes` — list, pagination, detail and create/edit forms.
- `/app/catalog/tax-rules` — class, type, country, region and channel filters, pagination, detail and create/edit forms.
- `/app/catalog/tax-hs-code-mappings` — mapping list, pagination, detail and create/edit forms; linked under Tax and VAT.
- `/app/catalog/coupons` (alias to pricing rules) and `/app/catalog` (alias to Products).

### Inventory — 41 of 41 route entries

- `/app/inventory/home` (alias to workspace experience)
- `/app/inventory/workspace` and `/app/inventory/workspace/{overview,balances,online-stock,ledger}`
- `/app/inventory/stock-card`
- `/app/inventory/products/:productId`
- `/app/inventory/transfers`, `/transfers/new`, `/transfers/:id`
- `/app/inventory/alerts`, `/reservations`, `/adjustments`, `/adjustment-approvals`, `/adjustments/queue`, `/cycle-counts`, `/replenishment`, and `/reports`
- `/app/inventory/locations` (redirect/alias to branches)
- `/app/inventory/branches`, `/branches/create`, `/branches/:id`, `/branches/:id/edit`, and `/branches/:id/team`
- `/app/inventory/branch-product-policies`
- `/app/inventory/facilities`, `/facilities/create`, `/facilities/:id`, and `/facilities/:id/edit`
- `/app/inventory/warehouses` and its create, settings, edit, and detail aliases (redirect to Facilities)
- `/app/inventory/bins`, `/bins/create`, `/bins/:id`, and `/bins/:id/edit`
- `/app/inventory/batches` and `/app/inventory/serials`

### Procurement — 37 of 37 route entries

- `/app/procurement/home`
- `/app/procurement/suppliers`
- `/app/procurement/suppliers/new`
- `/app/procurement/suppliers/:id`
- `/app/procurement/suppliers/:id/edit`
- `/app/procurement/requisitions`, `/requisitions/new`, `/requisitions/:id`, and `/requisitions/:id/edit`
- `/app/procurement/approval-workflows` and its create/edit routes
- `/app/procurement/rfqs` and its create/detail/edit routes
- `/app/procurement/purchase-orders` and its create/detail/edit routes
- `/app/procurement/goods-receipts` and `/purchase-returns`
- `/app/procurement/contracts` and `contracts/:id`; the seven-step contract wizard at `/contracts/new/{basic,supplier,dates,commercial,scope,legal,approval}`
- `/app/procurement/bills`, `/reports`, and `/docs/{user-guide,business,technical}`

### Payment Management — 14 of 14 route entries

- `/app/payment-management` (redirect/alias to overview)
- `/app/payment-management/overview`
- `/app/payment-management/method` (redirect/alias to methods)
- `/app/payment-management/methods`
- `/app/payment-management/transactions`
- `/app/payment-management/reconciliation`
- `/app/payment-management/reconciliation/review`
- `/app/payment-management/reconciliation/history`
- `/app/payment-management/reconciliation/runs/:runId`
- `/app/payment-management/refund-approvals`
- `/app/payment-management/links`
- `/app/payment-management/settlements`
- `/app/payment-management/disputes`
- `/app/payment-management/ledger`

### Finance — 39 of 39 route entries

- `/app/finance/home`
- `/app/finance/accounts`
- `/app/finance/accounts/new`
- `/app/finance/accounts/:id`
- `/app/finance/accounts/:id/edit`
- `/app/finance/periods`
- `/app/finance/periods/:id`
- `/app/finance/period-close`
- `/app/finance/journals` — journal list and mock journal workflows.
- `/app/finance/journals/recurring` — recurring journal templates and mock actions.
- `/app/finance/receivables`, `/payables`, `/banking`, `/reconciliation`, and `/reports`
- `/app/finance/integrations` (source redirect to mappings), `/integrations/mappings`, and `/integrations/health`
- `/app/finance/cost-centers`, `/partners`, `/fixed-assets`, `/budgets`, and dynamic budget detail/edit routes
- `/app/finance/settings/{accounting,tax-codes,exchange-rates}` and `/vds`
- `/app/finance/education-billing` and `/education-billing/{overview,catalog,fee-plans,accounts,late-fees,discounts,audit}`; aliases resolve to the correct workspace destination.
- `/app/finance` (home alias), `/user-guide`, and `/system-detail`

### HRM Management — 138 of 138 route entries

- HRM home, enterprise controls, user guide, and business flow guide.
- Recruitment overview, requisitions, vacancies, applications, candidates, interviews, offers, communications, reports, and career site, including create, edit, approval, and detail routes.
- Onboarding home, templates, processes, and orientations; separation home, cases, and alumni.
- Announcements, employee directory and records, departments, designations, workforce planning, employee services, lifecycle, executive analytics, and activity logs.
- Attendance dashboard, records, manual entries, reports, absence marking, corrections, shift assignments, breaks, shifts, holidays, and policy.
- Leave requests, calendar, allocations, ledger, types, reports, approval workflows, comp-off, and encashments.
- Payroll dashboard, runs, run preview/entries, salaries, reviews, enterprise payroll, compliance, recoveries, finance/payment batches, settlements, structures, and components.
- Performance cycle overview, reviews, ratings, competencies, calibration, and PIP; benefits plans, enrollments, and policies.
- Route sweep rendered all 138 management entries, including aliases and representative IDs. Lists use fictional records; list views provide pagination and page-size selection. The `/app/hrm/me/*` 29-route Employee Self-Service subset remains deferred.

### School Management — 6 of 134 route entries individually reviewed

- `/app/school-management/classes` — source-aligned class levels, section assignments, academic-year/campus context, local create/edit/delete/copy workflows, and reviewed states.
- `/app/school-management/students/new` and `/app/school-management/students/:id/edit` — source-aligned student, father/mother, local guardian, emergency contact, academic assignment, and address fields; parent-contact validation; edit restrictions; and local create/update outcomes with fictional student data.
- `/app/school-management/admissions/applications/create` — source-aligned student, guardian, placement, photo, and supporting-document form with validation and local create outcome.
- `/app/school-management/admissions/applications` — campus-scoped list with search, list/card views, document and lifecycle actions, 32 fictional records, and pagination with page-size selection.
- `/app/school-management/admissions/applications/:id` — application summary, student/guardian and placement facts, lifecycle actions, document verification/signature, payment-status update, activity history, and admit-card preview. The list and detail form a source-reviewed flow with local-only interactions.

The current source-parity follow-up rechecked `/app/school-management/settings/school-identity` and `/app/school-management/settings/academic-sessions` directly in IIS. School Identity keeps its profile form and setup-health sections and does not add a table; the mock includes the source's completeness, recommendations, logo status, history access state, and record metadata, with browser-local validation/save feedback. Academic Sessions retains the source's six ordered columns, list/card control, page-size selector, and right drawer, with 26 fictional records for multi-page review. Both routes remain **in progress** until narrow-layout review is recorded. The cross-app skill now explicitly allows structural improvements while requiring the source page context and substantive content to remain intact.

## Published revision

HRM typography consistency review was first published on 2026-09-25 in Site commit `2246bd040a00278fe9ebec56eb5ed870375c5327`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_f8c2f13b2acc8191bab1ff44c9857d91`, deployment `appgdep_6ab66d7be8808191b9c13910f185238d`. The follow-up aligns HRM search, filter, and form controls with Commerce at 12px and removes mobile top-bar overflow. It was published in Site commit `911d92e8df84cde67995d3d6887e661ec4a7ceff`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_4fe61753309c8191b6590304389c637a`, deployment `appgdep_6ab673d18cb08191be7a0d2cecaaac85`. The Site remains owner-private.

The Procurement and Finance increment is built locally from `suite-mock/` with `npm run build`, then integrated by running `node scripts/build-suite-mock.mjs` from the Design checkout. It uses the same fixed light POS/Payment visual system. Source matching and route notes are tracked in `coverage-ledger.json`.

The Education mock progress was published on 2026-09-25 in Site commit `2134ffafa61116a53527f4001b2eb3a0800134e3`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_a7adb93f423c8191a75da48d4ed404f8`, deployment `appgdep_6ab69cdfb6e081918fed86ed5cb10a6b`. This private increment includes the route-aware School and Training mock surface, source-aligned School home and student directory, Training metric destinations, fictional paginated student rows, and documented in-progress parity review. The deployment succeeded; this does not mark either Education app complete.

The student detail/edit follow-up was published on 2026-09-25 in Site commit `9679fb8f9467798f25e2294e9a6fa3c223c73cd2`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_5f91f1d5abdc81919f2a00a1f104f51d`, deployment `appgdep_6ab6a1268064819195bb0c25e33060ba`. This increment adds source-shaped student profile tabs, fictional attendance, exam, audit and transfer-certificate data, plus student-contextual edit form defaults. The deployment succeeded; route-level Education parity remains in progress.

Classes & Sections was published on 2026-09-25 in Site commit `9859d10508baebdc6a06a3a0578083ecd129d6e0`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_940fd4bda88c8191b77f8a0c6b72c8f1`, deployment `appgdep_6ab6a77a0f908191b85c7970f9af1a29`. This route now has source-shaped academic context, class-level selection, section assignments, local create/edit/delete/copy interactions, validation, and reviewed responsive/status states. The route is complete; the School Management app remains in progress.

Student registration and edit were published on 2026-09-25 in Site commit `1fc0c68588b7e8444d68e20d689d3411c9c37756`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_501d8b528ca48191b7657b0480b141b4`, deployment `appgdep_6ab6bb6c49fc81918a8ccc3fe568fe32`. The form follows the authenticated IIS route/template with student, family, emergency-contact, placement, and address sections, local-only create/update outcomes, validation, and responsive review. The load-order correction also removes the legacy preview startup console error. Deployment succeeded; the School Management app remains in progress.

Student applications and create-form support were published privately on 2026-09-25 in source commit `abbdb31ae176758a38c2bc9473d636d3edf47481`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_4b8c054824c881918d12dee8b0b53ef3`, deployment `appgdep_6ab6ad5e4a2c8191a41ee0f649513138`. The create route was complete after source comparison and browser checks for required-field and document-type validation, successful local submission, and return to the multi-page application list. The list has 32 fictional records across three campuses with search, list/card views, document verification, workflow actions, and page-size control.

The application detail follow-up was published privately on 2026-09-25 in source commit `2f1f25c380c20ab5a7e8e67252c7bc4c3fcbd4ab`, version `appgprj_6ab47c45bf0c81919793be1cfe20fa78~appgver_d23f37f41fb48191b7b52ccd1473b15b`, deployment `appgdep_6ab6b3ef1cec8191b8e0680fc43e52bd`. The list and detail are now both marked complete after source review and browser verification. Current IIS credentials deny access to admission records; inaccessible record details were implemented from the Angular source template. The mock deployment succeeded and remains owner-private.

## Next work

1. Continue source-parity review for School Management and Training Institute Management (228 candidate entries); all routes render and navigation inventories are recorded. School home, student directory/detail/edit and registration, Classes & Sections, Student application create/list/detail, and Training dashboard have been reviewed. Continue route-specific content, workflow, and responsive checks before marking remaining pages complete.
2. Design User Management, Tenant Admin, and Company Administration (46 candidate entries).
3. Design Event, Document, Email, and Notification Management (33 candidate entries).
4. Continue with Employee Self-Service as a separate follow-on to HRM Management, then resume the remaining app groups in the rollout plan.
5. Apply shared pagination and multi-page sample data to every remaining list page.
6. For each increment, record source/content review, design review, data review, and relevant UI states in `coverage-ledger.json`; browser-review it before marking routes complete and publishing.
7. Apply and close the source-parity audit for all 27 apps. Reconcile every IIS navigation group, contextual and cross-app link, Angular route/component, and mock destination; update route totals when new destinations are found. The requested 11-app scope currently accounts for 351 candidate route entries, including 76 Procurement and Finance routes now designed.

## Verification notes

Catalog lists, forms, details, pagination, filters, category card view, and mock-save behavior were reviewed in the local browser. The Commerce and Inventory route sweep rendered all 71 routes now tracked for the Commerce and Inventory app families; the manual order form, Shipping Rates rule form, Fulfillment allocation and shipment views, Gift Cards issue form, payment tabs and payout drawer, Inventory transfer detail and form, reservation drawer, list pagination, page-size control, and mobile-width overflow were reviewed. HRM's Angular production build succeeded; all 138 management route entries rendered in the browser, aliases resolved, and employee/payslip list pagination, page-size selection, form validation, and payroll/calendar layouts were checked. HRM typography was rechecked against Payment Management and Commerce on the home dashboard, employee list, and employee form. Navigation group headings and links match Commerce at 11px and 12px. HRM form, search, and filter controls now match Commerce at 12px; employee list table headers remain 10px, row text 12px, names 13px, and actions 12px. At 390px, the employee table scrolls within its panel and the page has no horizontal overflow; the top bar retains compact actions and the user avatar. The first Procurement and Finance Angular build succeeded and the browser sweep rendered all 76 route entries, including seven contract steps and the added Finance settings, education-billing, integration, VDS, and budget destinations. Requisition required-field validation, modal save feedback, reviewer empty state, 28-row pagination/page-size control, and 390px no-overflow layout were checked. IIS source review in Chrome sampled requisitions and bank reconciliation; remaining screens were compared against Angular route and template sources. School admissions browser checks confirmed document-type validation for an attached PDF, successful create of fictional application `ADM-2026-1073`, return to the list with the increased count, and page 2 pagination.
