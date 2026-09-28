import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from "rxjs";
import { MockPaginationComponent } from "./shared/mock-pagination.component";

interface MockRow {
  code: string;
  title: string;
  values: string[];
  status: string;
  href?: string;
}

interface MockField {
  label: string;
  placeholder?: string;
  type?: string;
  choices?: string[];
  required?: boolean;
  wide?: boolean;
}

interface PageModel {
  app: "Procurement" | "Finance & Accounting";
  title: string;
  description: string;
  key: string;
  kind: "list" | "form" | "detail" | "guide";
  entity: string;
  columns: string[];
  stats: [string, string, string][];
  fields: MockField[];
  tabs?: string[];
  note?: string;
  id?: string;
}

const suppliers = [
  "Northstar Office Systems",
  "Vertex Technology BD",
  "Harborline Logistics",
  "Meridian Paper & Print",
  "Summit Workplace Co.",
  "Bluewave Networks",
  "Cedar Grove Services",
  "Pioneer Industrial Supply",
];
const people = [
  "Nadia Rahman",
  "Farhan Chowdhury",
  "Samira Islam",
  "Imran Hossain",
  "Tania Kabir",
  "Arif Mahmud",
  "Lamia Sultana",
  "Rafi Ahmed",
];
const departments = [
  "IT Operations",
  "Finance",
  "People & Culture",
  "Retail Operations",
  "Learning Services",
  "Facilities",
];
const statuses = [
  "Approved",
  "Pending review",
  "Draft",
  "In progress",
  "Matched",
  "Due soon",
  "Active",
  "Awaiting receipt",
];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MockPaginationComponent],
  templateUrl: "./mock-page.component.html",
})
export class MockPageComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  page!: PageModel;
  rows: MockRow[] = [];
  search = "";
  statusFilter = "";
  pageSize = 10;
  currentPage = 1;
  activeTab = "";
  toast = "";
  formSubmitted = false;
  createOpen = false;
  reviewOpen = false;
  routePath = "";
  readonly pageSizes = [10, 20, 50];
  readonly today = "25 Sep 2026";
  readonly supplierNames = suppliers;
  readonly employeeNames = people;
  readonly departmentNames = departments;

  constructor() {
    this.syncPage();
    const subscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => this.syncPage());
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  get filteredRows(): MockRow[] {
    const query = this.search.trim().toLowerCase();
    return this.rows.filter(
      (row) =>
        (!query ||
          `${row.code} ${row.title} ${row.values.join(" ")}`
            .toLowerCase()
            .includes(query)) &&
        (!this.statusFilter || row.status === this.statusFilter),
    );
  }

  get visibleRows(): MockRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get statusOptions(): string[] {
    return [...new Set(this.rows.map((row) => row.status))].sort();
  }

  get reviewState(): string {
    return (
      new URLSearchParams(this.router.url.split("?")[1] ?? "").get(
        "mockState",
      ) ?? "populated"
    );
  }

  get stateOnly(): boolean {
    return ["empty", "loading", "error", "forbidden"].includes(
      this.reviewState,
    );
  }

  get stateCopy(): [string, string] {
    const states: Record<string, [string, string]> = {
      empty: [
        "No records match this view",
        "Adjust the filters or clear them to return to the sample records.",
      ],
      loading: [
        "Loading this workspace",
        "The mock is showing a loading state for design review.",
      ],
      error: [
        "This view could not be loaded",
        "The sample service is unavailable in this preview state.",
      ],
      validation: [
        "Required information needs attention",
        "Complete the required fields before saving this sample record.",
      ],
      success: [
        "Sample action completed",
        "The preview action finished locally in this browser.",
      ],
      forbidden: [
        "This view is restricted",
        "The selected sample role does not have access to this screen.",
      ],
    };
    return states[this.reviewState] ?? ["", ""];
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get firstVisible(): number {
    return this.filteredRows.length
      ? (this.currentPage - 1) * this.pageSize + 1
      : 0;
  }

  get lastVisible(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
  }

  setPage(delta: number): void {
    this.currentPage = Math.max(
      1,
      Math.min(this.pageCount, this.currentPage + delta),
    );
  }

  setSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  setSearch(value: string): void {
    this.search = value;
    this.currentPage = 1;
  }

  setStatus(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
  }

  recordHref(row: MockRow): string | null {
    if (row.href) return row.href;
    if (
      this.page.app === "Procurement" &&
      ["requisition", "rfq", "purchase-order", "contract"].includes(
        this.page.entity,
      )
    ) {
      return `${this.routePath}/${row.code}`;
    }
    if (
      this.page.app === "Finance & Accounting" &&
      this.page.entity === "budget"
    ) {
      return `${this.routePath}/${row.code}`;
    }
    return null;
  }

  showCreate(): void {
    this.createOpen = true;
    this.formSubmitted = false;
  }

  createPrimary(): void {
    const paths: Record<string, string> = {
      requisition: "/app/procurement/requisitions/new",
      workflow: "/app/procurement/approval-workflows/new",
      rfq: "/app/procurement/rfqs/new",
      "purchase-order": "/app/procurement/purchase-orders/new",
      contract: "/app/procurement/contracts/new/basic",
    };
    const path = paths[this.page.entity];
    if (path) {
      void this.router.navigateByUrl(path);
      return;
    }
    this.showCreate();
  }

  closeCreate(): void {
    this.createOpen = false;
  }

  save(form: NgForm): void {
    this.formSubmitted = true;
    if (form.invalid) {
      this.notify("Complete the required fields to continue.");
      return;
    }
    if (this.page.key === "contracts") {
      this.notify("Contract step saved in this browser preview.");
      if (this.routePath.endsWith("/approval")) {
        void this.router.navigateByUrl("/app/procurement/contracts");
      } else {
        void this.router.navigateByUrl(this.nextContractStep);
      }
      return;
    }
    this.createOpen = false;
    this.notify("Saved in this browser preview. No live records were changed.");
    form.resetForm();
  }

  act(message: string): void {
    this.notify(message);
  }

  notify(message: string): void {
    this.toast = message;
    window.setTimeout(() => {
      if (this.toast === message) this.toast = "";
    }, 3000);
  }

  setReviewState(state: string): void {
    const query =
      state === "populated" ? "" : `?mockState=${encodeURIComponent(state)}`;
    this.reviewOpen = false;
    void this.router.navigateByUrl(`${this.routePath}${query}`);
  }

  get nextContractStep(): string {
    const steps = [
      "basic",
      "supplier",
      "dates",
      "commercial",
      "scope",
      "legal",
      "approval",
    ];
    const current = this.routePath.split("/").at(-1) || "basic";
    const index = steps.indexOf(current);
    return `/app/procurement/contracts/new/${steps[Math.min(index + 1, steps.length - 1)]}`;
  }

  get previousContractStep(): string {
    const steps = [
      "basic",
      "supplier",
      "dates",
      "commercial",
      "scope",
      "legal",
      "approval",
    ];
    const current = this.routePath.split("/").at(-1) || "basic";
    const index = steps.indexOf(current);
    return `/app/procurement/contracts/new/${steps[Math.max(index - 1, 0)]}`;
  }

  private syncPage(): void {
    let path = this.router.url.split(/[?#]/)[0].replace(/\/$/, "");
    if (path === "/app/finance") path = "/app/finance/home";
    if (path === "/app/finance/education-billing") {
      const requested =
        new URLSearchParams(this.router.url.split("?")[1] ?? "")
          .get("section")
          ?.trim()
          .toLowerCase() ?? "overview";
      const aliases: Record<string, string> = {
        "fee-catalog": "catalog",
        "fee-heads": "catalog",
        feeheads: "catalog",
        feeplans: "fee-plans",
        pricing: "fee-plans",
        "pricing-rules": "fee-plans",
        accounts: "audit",
        "billing-accounts": "audit",
        "late-fee-rules": "late-fees",
        "fine-rules": "late-fees",
        "discount-types": "discounts",
        "audit-reports": "audit",
        operations: "audit",
      };
      const section = aliases[requested] ?? requested;
      path = `/app/finance/education-billing/${["overview", "catalog", "fee-plans", "late-fees", "discounts", "audit"].includes(section) ? section : "overview"}`;
    }
    this.routePath = path;
    this.page = this.describePage(this.routePath);
    this.rows = this.makeRows(this.page);
    this.activeTab = this.page.tabs?.[0] ?? "";
    this.search = "";
    this.statusFilter = "";
    this.currentPage = 1;
    this.createOpen = false;
    this.formSubmitted = false;
    this.reviewOpen = false;
  }

  private describePage(path: string): PageModel {
    const procurement = path.startsWith("/app/procurement/");
    const app = procurement ? "Procurement" : "Finance & Accounting";
    const segment = path.split("/").slice(procurement ? 3 : 3);
    const section = segment[0] ?? "";
    const id = segment[1];
    const editing = segment.at(-1) === "edit";
    const create = segment[1] === "new" || editing;
    const leaf = segment.at(-1) ?? section;
    const base = (model: Partial<PageModel>): PageModel => ({
      app,
      title: "",
      description: "",
      key: section,
      kind: "list",
      entity: section,
      columns: [],
      stats: [],
      fields: [],
      ...model,
    });

    if (procurement) {
      if (section === "requisitions") {
        const form = create;
        return base({
          title: form
            ? editing
              ? "Edit requisition"
              : "New requisition"
            : id
              ? `Requisition ${id}`
              : "Requisitions",
          description: form
            ? "Capture the business need, delivery timing, budget, and item lines."
            : "Track internal purchase requests from submission through approval.",
          key: "requisitions",
          entity: "requisition",
          kind: form ? "form" : id ? "detail" : "list",
          id,
          columns: [
            "Requester",
            "Department",
            "Needed by",
            "Approvals",
            "Total",
          ],
          stats: [
            ["Awaiting approval", "8", "3 require action today"],
            ["Approved this month", "24", "Across 6 departments"],
            ["Requested value", "৳ 1.84M", "Current review period"],
          ],
          fields: this.requisitionFields(),
        });
      }
      if (section === "approval-workflows")
        return base({
          title: editing
            ? "Edit approval workflow"
            : create
              ? "New approval workflow"
              : "Approval workflows",
          description:
            "Set clear approval paths by request type, value, and organizational scope.",
          kind: create ? "form" : "list",
          entity: "workflow",
          columns: ["Applies to", "Approval steps", "Owner", "Updated"],
          stats: [
            ["Active workflows", "6", "2 procurement categories"],
            ["Requests in queue", "8", "Oldest waiting 1 day"],
            ["Median approval time", "1.4 days", "Down 0.3 days"],
          ],
          fields: this.workflowFields(),
        });
      if (section === "rfqs")
        return base({
          title: editing
            ? "Edit request for quotation"
            : create
              ? "New request for quotation"
              : id
                ? `RFQ ${id}`
                : "Requests for quotation",
          description:
            "Invite qualified suppliers to quote against a defined scope and due date.",
          kind: create ? "form" : id ? "detail" : "list",
          entity: "rfq",
          id,
          columns: ["Type", "Suppliers", "Due date", "Responses"],
          stats: [
            ["Open RFQs", "5", "2 closing this week"],
            ["Invited suppliers", "32", "Across active requests"],
            ["Responses received", "19", "59% response rate"],
          ],
          fields: this.rfqFields(),
        });
      if (section === "purchase-orders")
        return base({
          title: editing
            ? "Edit purchase order"
            : create
              ? "New purchase order"
              : id
                ? `Purchase order ${id}`
                : "Purchase orders",
          description:
            "Issue approved orders to suppliers and track delivery, receipts, and billed value.",
          kind: create ? "form" : id ? "detail" : "list",
          entity: "purchase-order",
          id,
          columns: [
            "Supplier",
            "Version",
            "Order date",
            "Expected delivery",
            "Total",
          ],
          stats: [
            ["Awaiting supplier", "4", "Sent and pending confirmation"],
            ["In delivery", "9", "3 due this week"],
            ["Open order value", "৳ 2.46M", "Before tax"],
          ],
          fields: this.purchaseOrderFields(),
        });
      if (section === "goods-receipts")
        return base({
          title: "Goods receipts",
          description:
            "Record deliveries against purchase orders and flag quantity or quality differences.",
          entity: "receipt",
          columns: [
            "Purchase order",
            "Supplier",
            "Received on",
            "Items",
            "Received by",
          ],
          stats: [
            ["Expected this week", "7", "Across 4 suppliers"],
            ["Received this month", "28", "96% on time"],
            ["Exceptions open", "3", "2 need inspection"],
          ],
          fields: [],
        });
      if (section === "purchase-returns")
        return base({
          title: "Purchase returns",
          description:
            "Track goods returned to suppliers, reason codes, and expected credits.",
          entity: "return",
          columns: [
            "Supplier",
            "Purchase order",
            "Return reason",
            "Quantity",
            "Requested on",
          ],
          stats: [
            ["Awaiting supplier", "3", "Credit notes pending"],
            ["Returned this month", "12", "৳ 84,600 value"],
            ["Resolution time", "2.1 days", "Average this month"],
          ],
          fields: [],
        });
      if (section === "contracts") {
        const wizard = segment[1] === "new" || segment[0] === "new";
        const detail = !wizard && !!id;
        const step = wizard ? leaf : "";
        return base({
          title: wizard
            ? `New contract · ${this.stepTitle(step)}`
            : detail
              ? `Contract ${id}`
              : "Supplier contracts",
          description: wizard
            ? "Create a governed supplier agreement with commercial and approval details."
            : "Manage supplier agreements, renewal dates, commitments, and document history.",
          key: "contracts",
          entity: "contract",
          kind: wizard ? "form" : detail ? "detail" : "list",
          id,
          columns: [
            "Supplier",
            "Contract owner",
            "Start date",
            "Renewal date",
            "Value",
            "Status",
          ],
          stats: [
            ["Active agreements", "18", "৳ 8.4M committed"],
            ["Renewals in 90 days", "3", "Review windows open"],
            ["Pending approval", "2", "Legal review complete"],
          ],
          fields: this.contractFields(step),
          note: wizard ? "Wizard step" : undefined,
        });
      }
      if (section === "bills")
        return base({
          title: "Supplier bills",
          description:
            "Capture supplier invoices and resolve purchase order and receipt matching exceptions.",
          entity: "bill",
          columns: [
            "Supplier",
            "Purchase order",
            "Due date",
            "Match status",
            "Discrepancy",
            "Amount",
          ],
          stats: [
            ["Awaiting match", "6", "3 need review"],
            ["Ready for approval", "9", "৳ 640,250 total"],
            ["Due in 7 days", "4", "৳ 182,400 payable"],
          ],
          fields: this.payableFields(),
        });
      if (section === "reports")
        return base({
          title: "Procurement reports",
          description:
            "Review purchasing activity, supplier performance, spend, and exception trends.",
          kind: "guide",
          entity: "report",
          columns: [],
          stats: [
            ["Purchase order value", "৳ 4.82M", "Year to date"],
            ["On-time delivery", "94.2%", "Across active suppliers"],
            ["Open exceptions", "11", "3 fewer than last month"],
          ],
          fields: [],
        });
      if (section === "docs")
        return base({
          title:
            leaf === "business"
              ? "Business process guide"
              : leaf === "technical"
                ? "Technical reference"
                : "Procurement user guide",
          description:
            "Procurement workspace guidance for the Stravix Group BD sample organization.",
          kind: "guide",
          entity: "guide",
          columns: [],
          stats: [],
          fields: [],
        });
    }

    if (section === "user-guide" || section === "system-detail")
      return base({
        title:
          section === "user-guide"
            ? "Finance user guide"
            : "Finance system detail",
        description:
          section === "user-guide"
            ? "A practical guide to daily finance and accounting workflows."
            : "Accounting configuration, posting controls, and period structure for this workspace.",
        kind: "guide",
        entity: "guide",
        columns: [],
        stats: [],
        fields: [],
      });
    if (section === "receivables")
      return base({
        title: "Receivables",
        description:
          "Manage customer invoices, incoming receipts, allocations, and overdue balances.",
        entity: "invoice",
        tabs: ["Invoices", "Receipts", "Aging"],
        columns: [
          "Customer",
          "Invoice date",
          "Due date",
          "Total",
          "Open balance",
        ],
        stats: [
          ["Open balance", "৳ 183,420", "Across 24 invoices"],
          ["Past due", "৳ 28,450", "3 customer accounts"],
          ["Receipts this month", "৳ 412,800", "31 payments posted"],
        ],
        fields: this.invoiceFields(),
      });
    if (section === "payables")
      return base({
        title: "Payables",
        description:
          "Review supplier bills, due dates, approval readiness, and planned payments.",
        entity: "payable",
        tabs: ["Supplier bills", "Payment batches", "Aging"],
        columns: [
          "Supplier",
          "Invoice date",
          "Due date",
          "Bill total",
          "Open balance",
        ],
        stats: [
          ["Open balance", "৳ 92,840", "Across 18 supplier bills"],
          ["Due this week", "৳ 31,500", "5 suppliers"],
          ["Past due", "৳ 13,200", "2 bills"],
        ],
        fields: this.payableFields(),
      });
    if (section === "banking")
      return base({
        title: "Banking",
        description:
          "Manage cash and bank accounts, statement activity, and ledger links.",
        entity: "bank-account",
        tabs: ["Accounts", "Cash registers"],
        columns: [
          "Bank / provider",
          "Account number",
          "Currency",
          "GL account",
          "Balance",
        ],
        stats: [
          ["Total available", "৳ 291,130.95", "Across 2 active accounts"],
          ["Statement imports", "4", "1 needs matching"],
          ["Last reconciliation", "24 Sep", "City Bank operating"],
        ],
        fields: this.bankFields(),
      });
    if (section === "reconciliation")
      return base({
        title: "Bank reconciliation",
        description:
          "Match imported statement lines to posted cash activity and resolve differences.",
        entity: "statement",
        tabs: ["Open statements", "Completed runs"],
        columns: [
          "Bank account",
          "Period",
          "Ending balance",
          "Matched",
          "Unmatched",
        ],
        stats: [
          ["Statements to review", "2", "40 lines unmatched"],
          ["Matched this month", "96.8%", "Across 4 statements"],
          ["Unreconciled value", "৳ 24,700", "Needs investigation"],
        ],
        fields: this.reconciliationFields(),
      });
    if (section === "reports")
      return base({
        title: "Finance reports",
        description:
          "Explore financial position, performance, cash movement, and aging.",
        kind: "guide",
        entity: "report",
        columns: [],
        stats: [
          ["Reports available", "12", "Core financial statements"],
          ["Last refreshed", "9:42 AM", "25 Sep 2026"],
          ["Period status", "Open", "September 2026"],
        ],
        fields: [],
      });
    if (section === "integrations") {
      if (id === "health")
        return base({
          title: "Integration health",
          description:
            "Monitor dead-letter queues, failed postings, integrity anomalies, and recent finance activity.",
          key: "integrations",
          entity: "integration-health",
          kind: "guide",
          columns: [],
          stats: [
            [
              "Connected modules",
              "5",
              "Commerce, Procurement, HRM, Payments, School",
            ],
            ["Successful today", "42", "Across 5 integrations"],
            ["Needs attention", "2", "Resolve before period close"],
          ],
          fields: [],
        });
      return base({
        title: "Finance integrations",
        description:
          "Map operational events to accounts and monitor posting health.",
        key: "integrations",
        entity: "integration",
        tabs: ["Mappings", "Health"],
        columns: [
          "Source module",
          "Debit account",
          "Credit account",
          "Last posted",
        ],
        stats: [
          ["Active mappings", "14", "Across 5 modules"],
          ["Needs attention", "2", "Review before next close"],
          ["Last successful sync", "9:38 AM", "Commerce · 18 records"],
        ],
        fields: this.integrationFields(),
      });
    }
    if (section === "settings") {
      if (id === "tax-codes")
        return base({
          title: "Tax codes",
          description:
            "Maintain tax codes and connect sales and purchase tax to the chart of accounts.",
          key: "settings",
          entity: "tax-code",
          columns: ["Code", "Rate", "Sales account", "Purchase account"],
          stats: [
            ["Active codes", "8", "VAT and withholding"],
            ["Standard VAT", "15%", "Domestic taxable sales"],
            ["Updated", "18 Sep", "By Finance Controller"],
          ],
          fields: this.taxCodeFields(),
        });
      if (id === "exchange-rates")
        return base({
          title: "Exchange rates",
          description:
            "Maintain dated currency rates for foreign currency transactions and reporting.",
          key: "settings",
          entity: "exchange-rate",
          columns: ["Currency pair", "Rate date", "Rate", "Source"],
          stats: [
            ["Currency pairs", "4", "BDT base currency"],
            ["Latest update", "25 Sep", "09:10 AM"],
            ["Rate source", "Manual", "Finance controlled"],
          ],
          fields: this.exchangeRateFields(),
        });
      return base({
        title: "Accounting settings",
        description:
          "Configure the base currency and default accounting controls for this company.",
        key: "settings",
        entity: "accounting-settings",
        kind: "form",
        columns: [],
        stats: [
          ["Base currency", "BDT · ৳", "Company default"],
          ["Fiscal year", "January – December", "FY 2026"],
          ["Posting control", "Period controlled", "Closed periods are locked"],
        ],
        fields: this.accountingSettingsFields(),
      });
    }
    if (section === "education-billing") {
      const view = id === "accounts" ? "audit" : id || "overview";
      const financeBillingPages: Record<string, Partial<PageModel>> = {
        overview: {
          title: "Education billing overview",
          kind: "guide",
          entity: "education-billing-overview",
          stats: [
            ["Open student balances", "৳ 684,250", "Across 142 learners"],
            ["Collections this month", "৳ 1.24M", "September 2026"],
            ["Fee plans in use", "12", "For 4 academic programmes"],
          ],
        },
        catalog: {
          title: "Fee heads",
          entity: "fee-catalog",
          columns: ["Code", "Revenue account", "Applicability", "Status"],
          stats: [
            ["Active fee heads", "24", "Shared education catalog"],
            ["Used by plans", "18", "Across School and Training"],
            ["Updated", "21 Sep", "Finance controlled"],
          ],
        },
        "fee-plans": {
          title: "Fee plans",
          entity: "fee-plan",
          columns: ["Programme", "Fee items", "Total plan", "Academic year"],
          stats: [
            ["Published plans", "12", "4 academic programmes"],
            ["Awaiting approval", "2", "Ready for review"],
            ["Current session", "2026–27", "New academic year"],
          ],
        },
        "late-fees": {
          title: "Late fees",
          entity: "late-fee",
          columns: ["Learner", "Programme", "Overdue since", "Amount"],
          stats: [
            ["Overdue balances", "৳ 84,600", "37 learner accounts"],
            ["Fee rules", "3", "By payment schedule"],
            ["Waivers pending", "5", "Review requested"],
          ],
        },
        discounts: {
          title: "Discount types",
          entity: "fee-discount",
          columns: ["Kind", "Contra account", "Approval required", "Status"],
          stats: [
            ["Active discount types", "8", "Merit, sibling, need based"],
            ["Credits pending", "6", "Awaiting finance review"],
            ["Applied this term", "42", "Across education accounts"],
          ],
        },
        audit: {
          title: "Audit & reports",
          kind: "guide",
          entity: "billing-audit",
          columns: [],
          stats: [
            ["Open exceptions", "4", "Settlement and refund review"],
            ["Manual refunds", "3", "Awaiting second approver"],
            ["Unapplied receipts", "৳ 18,600", "Held for allocation or refund"],
          ],
        },
      };
      const selected =
        financeBillingPages[view] ?? financeBillingPages["overview"];
      return base({
        description:
          "Coordinate student fees, collections, discounts, and finance posting for Stravix Learning Centre.",
        key: "education-billing",
        fields:
          view === "fee-plans"
            ? this.feePlanFields()
            : view === "catalog"
              ? this.feeCatalogFields()
              : view === "late-fees"
                ? this.lateFeeFields()
                : view === "discounts"
                  ? this.feeDiscountFields()
                  : [],
        ...selected,
      });
    }
    if (section === "vds")
      return base({
        title: "VAT deduction at source (VDS)",
        description:
          "Maintain rate schedules and record source tax withholding against supplier payments.",
        entity: "vds-record",
        tabs: ["Withholdings", "Rate schedule"],
        columns: [
          "Supplier",
          "Bill reference",
          "Payment date",
          "Withheld",
          "Certificate",
        ],
        stats: [
          ["Withheld this month", "৳ 42,850", "Across 17 supplier payments"],
          ["Certificates pending", "4", "Prepare for supplier issue"],
          ["Active rate categories", "6", "Updated 12 Sep"],
        ],
        fields: this.vdsFields(),
      });
    if (section === "cost-centers")
      return base({
        title: "Cost centers",
        description:
          "Organize operational spending by accountable department and location.",
        entity: "cost-center",
        columns: ["Manager", "Branch", "Budget", "Actual spend"],
        stats: [
          ["Active cost centers", "12", "Across 3 companies"],
          ["Budget assigned", "৳ 6.24M", "FY 2026"],
          ["Over budget", "1", "Facilities · 103%"],
        ],
        fields: this.costCenterFields(),
      });
    if (section === "partners")
      return base({
        title: "Business partners",
        description:
          "Shared customer and supplier records used across invoices, bills, and payments.",
        entity: "partner",
        columns: ["Type", "Receivable", "Payable", "Payment terms"],
        stats: [
          ["Active partners", "46", "29 customers · 17 suppliers"],
          ["Receivables", "৳ 183,420", "24 open invoices"],
          ["Payables", "৳ 92,840", "18 open bills"],
        ],
        fields: this.partnerFields(),
      });
    if (section === "fixed-assets")
      return base({
        title: "Fixed assets",
        description:
          "Maintain acquisition, depreciation, disposal, and net book value records.",
        entity: "asset",
        columns: ["Category", "Acquired", "Cost", "Net book value"],
        stats: [
          ["Active assets", "84", "Across 4 classes"],
          ["Gross cost", "৳ 8.16M", "As of 25 Sep"],
          ["Depreciation this month", "৳ 62,400", "September run pending"],
        ],
        fields: this.assetFields(),
      });
    if (section === "budgets")
      return base({
        title: editing ? "Edit budget" : id ? `Budget ${id}` : "Budgets",
        description:
          "Plan account and cost center allocations, then monitor commitments and actuals.",
        kind: editing ? "form" : id ? "detail" : "list",
        entity: "budget",
        id,
        columns: ["Fiscal year", "Allocated", "Committed", "Available"],
        stats: [
          ["Approved budget", "৳ 6.24M", "FY 2026 operating"],
          ["Committed", "৳ 4.01M", "64% allocated"],
          ["Unallocated", "৳ 2.23M", "Across 12 cost centers"],
        ],
        fields: this.budgetFields(),
      });
    return base({
      title: "Finance workspace",
      description: "Financial operations and accounting records.",
      entity: section,
      columns: [],
      stats: [],
      fields: [],
    });
  }

  private makeRows(page: PageModel): MockRow[] {
    const data: Record<
      string,
      { prefix: string; titles: string[]; values: (number: number) => string[] }
    > = {
      requisition: {
        prefix: "REQ-26-",
        titles: [
          "Laptop refresh for support team",
          "Branch network equipment",
          "Training room furniture",
          "Payroll system licenses",
        ],
        values: (i) => [
          people[i % people.length],
          departments[i % departments.length],
          `${String(1 + ((i * 3) % 28)).padStart(2, "0")} Oct 2026`,
          `${1 + (i % 3)} of 3 approved`,
          this.money(18400 + i * 6830),
        ],
      },
      workflow: {
        prefix: "WF-",
        titles: [
          "Standard purchase under ৳ 50,000",
          "Capital request review",
          "IT and software procurement",
          "Facilities service purchase",
        ],
        values: (i) => [
          ["Requisitions", "RFQs", "Purchase orders"][i % 3],
          `${2 + (i % 3)} approval stages`,
          people[i % people.length],
          `${20 + i} Sep 2026`,
        ],
      },
      rfq: {
        prefix: "RFQ-26-",
        titles: [
          "Laptop fleet renewal",
          "Branch connectivity upgrade",
          "Office supplies · Q4",
          "Annual maintenance services",
        ],
        values: (i) =>
          [
            ["Goods", "Services"][i % 2],
            `${3 + (i % 5)} suppliers`,
            `${2 + (i % 18)} Oct 2026`,
            `${2 + (i % 5)} responses`,
          ].slice(0, 4),
      },
      "purchase-order": {
        prefix: "PO-26-",
        titles: [
          "Laptop fleet renewal",
          "North branch network upgrade",
          "Q4 office supplies",
          "Facilities maintenance",
        ],
        values: (i) => [
          suppliers[i % suppliers.length],
          `v${1 + (i % 3)}`,
          `${12 + (i % 13)} Sep 2026`,
          `${5 + (i % 22)} Oct 2026`,
          this.money(38200 + i * 11640),
        ],
      },
      receipt: {
        prefix: "GRN-26-",
        titles: [
          "IT equipment delivery",
          "Office supplies replenishment",
          "Network access points",
          "Meeting room furniture",
        ],
        values: (i) => [
          `PO-26-${String(208 - i).padStart(3, "0")}`,
          suppliers[i % suppliers.length],
          `${18 + (i % 8)} Sep 2026`,
          `${4 + (i % 14)} lines`,
          people[i % people.length],
        ],
      },
      return: {
        prefix: "RET-26-",
        titles: [
          "Damaged monitors",
          "Incorrect paper stock",
          "Unmatched network switches",
          "Warranty replacement",
        ],
        values: (i) => [
          suppliers[i % suppliers.length],
          `PO-26-${String(192 - i).padStart(3, "0")}`,
          ["Damaged in transit", "Wrong specification", "Excess delivery"][
            i % 3
          ],
          `${1 + (i % 8)} units`,
          `${15 + (i % 10)} Sep 2026`,
        ],
      },
      contract: {
        prefix: "CON-26-",
        titles: [
          "Managed connectivity services",
          "Workplace equipment framework",
          "Cloud software subscription",
          "Office supplies agreement",
        ],
        values: (i) => [
          suppliers[i % suppliers.length],
          people[i % people.length],
          "01 Jan 2026",
          `${1 + (i % 12)} Dec 2026`,
          this.money(120000 + i * 75000),
        ],
      },
      bill: {
        prefix: "BILL-26-",
        titles: [
          "INV-NS-2026-884",
          "VERT-INV-3041",
          "HB-2026-1902",
          "MP-INV-776",
        ],
        values: (i) => [
          suppliers[i % suppliers.length],
          `PO-26-${String(193 - i).padStart(3, "0")}`,
          `${4 + (i % 24)} Oct 2026`,
          ["Matched", "Quantity variance", "Receipt missing"][i % 3],
          i % 3 === 1 ? this.money(2400 + i * 125) : "—",
          this.money(18600 + i * 7640),
        ],
      },
      invoice: {
        prefix: "INV-26-",
        titles: [
          "Monthly platform services",
          "Training programme · cohort 08",
          "Retail equipment order",
          "Consulting services · September",
        ],
        values: (i) => [
          `${1 + (i % 25)} Sep 2026`,
          `${15 + (i % 16)} Oct 2026`,
          this.money(18500 + i * 8450),
          this.money(6200 + i * 3250),
          `${statuses[(i + 2) % statuses.length]}`,
        ],
      },
      payable: {
        prefix: "AP-26-",
        titles: [
          "Office supplies · September",
          "Network maintenance renewal",
          "Recruitment services",
          "Branch utility equipment",
        ],
        values: (i) => [
          suppliers[i % suppliers.length],
          `${1 + (i % 25)} Sep 2026`,
          `${20 + (i % 11)} Oct 2026`,
          this.money(11800 + i * 4370),
          this.money(5200 + i * 1850),
        ],
      },
      "bank-account": {
        prefix: "BANK-",
        titles: [
          "City Bank operating account",
          "bKash settlement wallet",
          "UCB payroll account",
          "Eastern Bank reserve",
        ],
        values: (i) => [
          ["City Bank", "bKash", "UCB", "Eastern Bank"][i % 4],
          `•••• ${String(2084 + i * 119).slice(-4)}`,
          "BDT",
          ["1110 · Cash at bank", "1120 · Settlement wallet"][i % 2],
          this.money(248350 + i * 12450),
        ],
      },
      statement: {
        prefix: "REC-26-",
        titles: [
          "City Bank · September statement",
          "bKash · Week 38 settlement",
          "City Bank · August statement",
          "UCB payroll · September",
        ],
        values: (i) => [
          [
            "City Bank operating",
            "bKash settlement",
            "City Bank operating",
            "UCB payroll",
          ][i % 4],
          `${1 + (i % 4)}–${24 + (i % 6)} Sep 2026`,
          this.money(248350 + i * 7280),
          `${36 + i} matched`,
          `${i % 5} unmatched`,
        ],
      },
      "cost-center": {
        prefix: "CC-",
        titles: [
          "IT Operations",
          "Finance & Accounting",
          "People & Culture",
          "Retail Operations",
        ],
        values: (i) => [
          people[i % people.length],
          ["Dhaka HQ", "Gulshan Branch", "Chattogram Branch"][i % 3],
          this.money(420000 + i * 58600),
          this.money(285000 + i * 42300),
        ],
      },
      partner: {
        prefix: "BP-00",
        titles: [
          "Aster Retail Group",
          "Northstar Office Systems",
          "Vertex Technology BD",
          "Meridian Learning Centre",
        ],
        values: (i) => [
          ["Customer", "Supplier", "Supplier", "Customer"][i % 4],
          this.money(i % 4 === 1 ? 0 : 18200 + i * 8700),
          this.money(i % 4 === 1 || i % 4 === 2 ? 12400 + i * 4300 : 0),
          `${15 + (i % 3) * 15} days`,
        ],
      },
      asset: {
        prefix: "FA-26-",
        titles: [
          "Dell Latitude 7440 · Finance",
          "Meeting room display · HQ",
          "Branch network switch",
          "Toyota Hiace · Operations",
        ],
        values: (i) => [
          ["Computers", "Office equipment", "Network equipment", "Vehicles"][
            i % 4
          ],
          `${12 + (i % 12)} Mar 2026`,
          this.money(84500 + i * 42250),
          this.money(71200 + i * 31800),
        ],
      },
      budget: {
        prefix: "BDG-26-",
        titles: [
          "FY2026 Operating Budget",
          "IT Capital Plan 2026",
          "People Development 2026",
          "Branch Operations 2026",
        ],
        values: (i) => [
          "2026",
          this.money(650000 + i * 285000),
          this.money(420000 + i * 164000),
          this.money(230000 + i * 121000),
        ],
      },
      integration: {
        prefix: "MAP-",
        titles: [
          "Commerce sales posting",
          "Procurement bill approval",
          "HRM payroll settlement",
          "Payment gateway settlement",
        ],
        values: (i) => [
          ["Commerce", "Procurement", "HR Management", "Payment Management"][
            i % 4
          ],
          [
            "4100 · Product sales",
            "5300 · Facilities & utilities",
            "5100 · Salaries",
            "1110 · City Bank operating",
          ][i % 4],
          [
            "1200 · Trade receivables",
            "2100 · Trade payables",
            "2200 · Payroll payable",
            "4100 · Product sales",
          ][i % 4],
          `${20 + i} Sep · ${9 + (i % 9)}:${i % 2 ? "38" : "12"} AM`,
        ],
      },
      "tax-code": {
        prefix: "TAX-",
        titles: [
          "Standard VAT",
          "Reduced VAT",
          "Zero-rated export",
          "Withholding · services",
        ],
        values: (i) => [
          `${["VAT-STD", "VAT-RED", "VAT-ZRO", "WHT-SVC"][i % 4]}`,
          ["15%", "5%", "0%", "10%"][i % 4],
          [
            "2150 · VAT payable",
            "2150 · VAT payable",
            "4105 · Export sales",
            "2160 · Tax withheld",
          ][i % 4],
          [
            "1150 · Input VAT",
            "1150 · Input VAT",
            "1150 · Input VAT",
            "1160 · WHT receivable",
          ][i % 4],
        ],
      },
      "exchange-rate": {
        prefix: "FX-26-",
        titles: ["USD / BDT", "EUR / BDT", "GBP / BDT", "INR / BDT"],
        values: (i) => [
          `${["USD/BDT", "EUR/BDT", "GBP/BDT", "INR/BDT"][i % 4]}`,
          `${1 + (i % 24)} Sep 2026`,
          ["121.85", "135.60", "162.44", "1.42"][i % 4],
          i % 2 ? "Treasury update" : "Bangladesh Bank",
        ],
      },
      "integration-health": {
        prefix: "SYNC-",
        titles: [
          "Commerce sales posting",
          "Procurement bill approvals",
          "HRM payroll settlement",
          "Payment gateway settlement",
        ],
        values: (i) => [
          `${9 + (i % 3)}:${String(12 + i).padStart(2, "0")} AM today`,
          `${18 + i * 3} records`,
          i % 7 === 0 ? "2 warnings" : "None",
          [
            "Integration service",
            "Accounts payable",
            "Payroll control",
            "Treasury",
          ][i % 4],
        ],
      },
      "accounting-settings": {
        prefix: "CFG-",
        titles: [
          "Base currency",
          "Fiscal year start",
          "Default posting status",
          "Closed-period control",
        ],
        values: (i) => [
          ["BDT · ৳", "1 January", "Draft for approval", "Prevent posting"][
            i % 4
          ],
          ["Company", "Company", "Journals", "Period close"][i % 4],
        ],
      },
      "fee-catalog": {
        prefix: "FEE-",
        titles: [
          "Tuition · Primary",
          "Laboratory and materials",
          "Transport · Zone A",
          "Technology services",
        ],
        values: (i) => [
          `${["FEE-TUI-01", "FEE-ACA-04", "FEE-TRN-02", "FEE-SVC-08"][i % 4]}`,
          [
            "4110 · Tuition revenue",
            "4120 · Academic fees",
            "4130 · Transport revenue",
            "4140 · Service fees",
          ][i % 4],
          [
            "School · Primary",
            "School · Secondary",
            "Training · Diploma",
            "Shared education",
          ][i % 4],
          "Active",
        ],
      },
      "fee-plan": {
        prefix: "PLAN-",
        titles: [
          "Primary · Standard plan",
          "Secondary · Science track",
          "Senior · Commerce track",
          "Diploma · Evening",
        ],
        values: (i) => [
          ["Primary", "Secondary", "Senior", "Diploma"][i % 4],
          `${5 + (i % 4)} fee items`,
          this.money(24500 + i * 3750),
          "2026–27",
        ],
      },
      "late-fee": {
        prefix: "LATE-",
        titles: [
          "Monthly installment · 5% after 10 days",
          "Term fee · flat BDT 500",
          "Training plan · daily cap",
          "Default company · 2% monthly",
        ],
        values: (i) => [
          ["Percentage", "Fixed amount", "Daily rate", "Percentage"][i % 4],
          `${1 + (i % 12)} Sep 2026`,
          [
            "Primary · Standard plan",
            "Secondary · Science track",
            "Diploma · Evening",
            "Tenant default",
          ][i % 4],
          ["5% after 10 days", "৳ 500 once", "৳ 50 per day", "2% per month"][
            i % 4
          ],
        ],
      },
      "fee-discount": {
        prefix: "DISC-",
        titles: [
          "Merit scholarship",
          "Sibling reduction",
          "Staff child benefit",
          "Need-based assistance",
        ],
        values: (i) => [
          ["Merit", "Sibling", "Staff benefit", "Need based"][i % 4],
          [
            "4900 · Scholarships",
            "4910 · Fee discounts",
            "4920 · Staff benefit",
            "4900 · Scholarships",
          ][i % 4],
          i % 2 ? "No" : "Yes",
          "Active",
        ],
      },
      "billing-audit": {
        prefix: "AUD-BILL-",
        titles: [
          "Settlement mismatch · PAY-26-184",
          "Manual refund · INV-26-092",
          "Discount credit · ACC-0042",
          "Receipt allocation · RCPT-26-119",
        ],
        values: (i) => [
          ["Nabila Rahman", "Farhan Hossain", "Maliha Sultana", "Tariq Ahmed"][
            i % 4
          ],
          [
            "Reconciliation exception",
            "Refund approval",
            "Education credit",
            "Unapplied receipt",
          ][i % 4],
          `${18 + (i % 7)} Sep 2026`,
        ],
      },
      "vds-record": {
        prefix: "VDS-26-",
        titles: [
          "Vertex Technology BD · service bill",
          "Northstar Office Systems · supply",
          "Harborline Logistics · freight",
          "Cedar Grove Services · consulting",
        ],
        values: (i) => [
          suppliers[(i + 1) % suppliers.length],
          `BILL-26-${String(243 - i).padStart(3, "0")}`,
          `${12 + (i % 13)} Sep 2026`,
          this.money(820 + i * 415),
          i % 3 === 0 ? "Pending" : "Prepared",
        ],
      },
    };
    const source = data[page.entity];
    if (!source) return [];
    return Array.from({ length: 28 }, (_, index) => {
      const id = `${source.prefix}${String(243 - index).padStart(3, "0")}`;
      const title = source.titles[index % source.titles.length];
      const statusSets: Record<string, string[]> = {
        requisition: ["Draft", "Submitted", "Approved", "Rejected"],
        workflow: ["Active", "Active", "Draft", "Inactive"],
        rfq: ["Open", "Open", "Evaluation", "Awarded", "Closed"],
        "purchase-order": [
          "Issued",
          "Confirmed",
          "Partially received",
          "Closed",
          "Draft",
        ],
        receipt: ["Accepted", "Accepted", "Pending inspection", "Exception"],
        return: ["Requested", "Approved", "Credit pending", "Closed"],
        contract: ["Active", "Active", "In review", "Renewal due", "Expired"],
        bill: [
          "Matched",
          "Matched",
          "Discrepancy",
          "Pending review",
          "Approved",
        ],
        invoice: ["Issued", "Partial", "Paid", "Overdue", "Draft"],
        payable: ["Approved", "Due soon", "Paid", "Approval pending", "Draft"],
        "bank-account": ["Active", "Active", "Inactive"],
        "cost-center": ["Active", "Active", "Review needed"],
        partner: ["Active", "Active", "On hold"],
        asset: ["Active", "Active", "In maintenance", "Disposed"],
        budget: ["Approved", "Approved", "At risk", "Draft"],
        "tax-code": ["Active", "Active", "Active", "Review needed"],
        "exchange-rate": ["Current", "Current", "Current", "Superseded"],
        "integration-health": [
          "Healthy",
          "Healthy",
          "Healthy",
          "Needs attention",
        ],
        "accounting-settings": [
          "Configured",
          "Configured",
          "Configured",
          "Controlled",
        ],
        "fee-catalog": ["Active", "Active", "Active", "Draft"],
        "fee-plan": ["Published", "Published", "In review", "Draft"],
        "late-fee": ["Overdue", "Overdue", "Waiver pending"],
        "fee-discount": ["Approved", "Approved", "Pending review"],
        "billing-audit": ["Updated", "Created", "Approved"],
        "vds-record": ["Prepared", "Pending certificate", "Filed"],
      };
      const status =
        page.entity === "statement"
          ? index % 4 === 0
            ? "Needs review"
            : index % 3 === 0
              ? "Completed"
              : "In progress"
          : page.entity === "integration"
            ? index % 9 === 0
              ? "Needs attention"
              : "Active"
            : (statusSets[page.entity] ?? statuses)[
                index % (statusSets[page.entity] ?? statuses).length
              ];
      const values = source.values(index);
      const href = [
        "requisition",
        "rfq",
        "purchase-order",
        "contract",
        "budget",
      ].includes(page.entity)
        ? `${this.routePath}/${id}`
        : undefined;
      return { code: id, title, values, status, href };
    });
  }

  private money(value: number): string {
    return `৳ ${value.toLocaleString("en-BD")}`;
  }

  private stepTitle(step: string): string {
    return (
      (
        {
          basic: "Basic details",
          supplier: "Supplier",
          dates: "Dates",
          commercial: "Commercial",
          scope: "Scope",
          legal: "Legal review",
          approval: "Approval",
        } as Record<string, string>
      )[step] ?? "Basic details"
    );
  }

  private requisitionFields(): MockField[] {
    return [
      {
        label: "Requisition title",
        placeholder: "Laptop refresh for support team",
        required: true,
        wide: true,
      },
      { label: "Department", placeholder: "IT Operations", required: true },
      { label: "Requested by", placeholder: "Nadia Rahman", required: true },
      { label: "Needed by", type: "date", required: true },
      { label: "Budget limit", type: "number", placeholder: "0.00" },
      {
        label: "Business justification",
        type: "textarea",
        placeholder: "Explain the need and expected outcome.",
        wide: true,
      },
      {
        label: "Internal notes",
        type: "textarea",
        placeholder: "Optional comments for approvers.",
        wide: true,
      },
      {
        label: "Item description",
        placeholder: "Dell Latitude laptop",
        required: true,
      },
      { label: "Quantity", type: "number", placeholder: "1", required: true },
      {
        label: "Estimated unit cost",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
      { label: "Unit of measure", placeholder: "EA" },
    ];
  }
  private workflowFields(): MockField[] {
    return [
      {
        label: "Workflow name",
        placeholder: "Standard purchase · under ৳ 50,000",
        required: true,
        wide: true,
      },
      {
        label: "Request type",
        choices: ["Requisitions", "RFQs", "Purchase orders"],
        required: true,
      },
      {
        label: "Applies when",
        choices: ["Any amount", "Over ৳ 50,000", "Over ৳ 250,000"],
      },
      {
        label: "Department scope",
        choices: ["All departments", ...departments],
      },
      {
        label: "First approver",
        placeholder: "Department manager",
        required: true,
      },
      { label: "Second approver", placeholder: "Finance controller" },
      { label: "Final approver", placeholder: "Procurement director" },
      { label: "Escalate after (days)", type: "number", placeholder: "2" },
    ];
  }
  private rfqFields(): MockField[] {
    return [
      {
        label: "RFQ title",
        placeholder: "Laptop fleet renewal",
        required: true,
        wide: true,
      },
      {
        label: "Request type",
        choices: ["Goods", "Services", "Works"],
        required: true,
      },
      { label: "Issue date", type: "date", required: true },
      { label: "Quotation due date", type: "date", required: true },
      { label: "Currency", choices: ["BDT · ৳", "USD · $"], required: true },
      { label: "Related requisition", placeholder: "REQ-26-034" },
      {
        label: "Invite suppliers",
        placeholder: "Search supplier directory",
        wide: true,
      },
      {
        label: "Scope and instructions",
        type: "textarea",
        placeholder:
          "Describe specifications, delivery, and response requirements.",
        required: true,
        wide: true,
      },
    ];
  }
  private purchaseOrderFields(): MockField[] {
    return [
      { label: "Supplier", choices: suppliers, required: true, wide: true },
      { label: "Purchase order date", type: "date", required: true },
      { label: "Expected delivery", type: "date" },
      { label: "Currency", choices: ["BDT · ৳", "USD · $"], required: true },
      {
        label: "Payment terms",
        choices: ["Due on receipt", "Net 15", "Net 30", "Net 45"],
      },
      { label: "Related requisition", placeholder: "REQ-26-034" },
      {
        label: "Ship to",
        choices: ["Dhaka HQ", "Gulshan Branch", "Chattogram Branch"],
        wide: true,
      },
      {
        label: "Supplier notes",
        type: "textarea",
        placeholder: "Delivery and invoice instructions.",
        wide: true,
      },
    ];
  }
  private contractFields(step: string): MockField[] {
    const steps: Record<string, MockField[]> = {
      basic: [
        {
          label: "Contract title",
          placeholder: "Managed connectivity services",
          required: true,
          wide: true,
        },
        {
          label: "Contract type",
          choices: [
            "Supply agreement",
            "Service agreement",
            "Framework agreement",
          ],
          required: true,
        },
        {
          label: "Contract owner",
          placeholder: "Farhan Chowdhury",
          required: true,
        },
        { label: "Business unit", choices: departments },
        {
          label: "Description",
          type: "textarea",
          placeholder: "Purpose and expected outcomes.",
          wide: true,
        },
      ],
      supplier: [
        { label: "Supplier", choices: suppliers, required: true, wide: true },
        { label: "Supplier contact", placeholder: "Primary contract contact" },
        { label: "Supplier reference", placeholder: "Vendor contract number" },
      ],
      dates: [
        { label: "Effective date", type: "date", required: true },
        { label: "End date", type: "date", required: true },
        { label: "Renewal notice (days)", type: "number", placeholder: "60" },
        { label: "Auto renew", choices: ["No", "Yes"] },
      ],
      commercial: [
        { label: "Currency", choices: ["BDT · ৳", "USD · $"], required: true },
        {
          label: "Contract value",
          type: "number",
          placeholder: "0.00",
          required: true,
        },
        { label: "Payment terms", choices: ["Monthly", "Quarterly", "Net 30"] },
        {
          label: "Tax treatment",
          choices: ["Standard VAT", "Zero rated", "Exempt"],
        },
      ],
      scope: [
        {
          label: "Products or services",
          type: "textarea",
          placeholder: "Describe the contracted scope and service levels.",
          required: true,
          wide: true,
        },
        {
          label: "Delivery locations",
          placeholder: "Dhaka HQ, branch locations",
        },
      ],
      legal: [
        { label: "Legal reviewer", placeholder: "Legal team owner" },
        {
          label: "Review status",
          choices: ["Not started", "In review", "Cleared"],
        },
        {
          label: "Key obligations",
          type: "textarea",
          placeholder: "Record notice, liability, and compliance terms.",
          wide: true,
        },
      ],
      approval: [
        {
          label: "Approval workflow",
          choices: ["Standard contract approval", "High value agreement"],
          required: true,
        },
        { label: "Approval due date", type: "date" },
        {
          label: "Submission note",
          type: "textarea",
          placeholder: "Context for approvers.",
          wide: true,
        },
      ],
    };
    return steps[step] ?? steps["basic"];
  }
  private invoiceFields(): MockField[] {
    return [
      {
        label: "Customer",
        placeholder: "Search business partners",
        required: true,
      },
      { label: "Invoice date", type: "date", required: true },
      { label: "Due date", type: "date", required: true },
      { label: "Currency", choices: ["BDT · ৳", "USD · $"] },
      {
        label: "Invoice description or reference",
        placeholder: "Service period or order reference",
        wide: true,
      },
    ];
  }
  private payableFields(): MockField[] {
    return [
      { label: "Supplier", choices: suppliers, required: true },
      {
        label: "Supplier invoice number",
        placeholder: "Supplier invoice reference",
        required: true,
      },
      { label: "Invoice date", type: "date", required: true },
      { label: "Due date", type: "date", required: true },
      { label: "Purchase order", placeholder: "PO-26-208" },
      {
        label: "Approval notes",
        type: "textarea",
        placeholder: "Optional exception notes",
        wide: true,
      },
    ];
  }
  private bankFields(): MockField[] {
    return [
      { label: "Account code", placeholder: "MAIN-BDT", required: true },
      {
        label: "Account name",
        placeholder: "Main operating account",
        required: true,
      },
      { label: "Bank or provider", placeholder: "City Bank" },
      { label: "Branch", placeholder: "Gulshan branch" },
      { label: "Account number", placeholder: "•••• 2084" },
      { label: "Currency", choices: ["BDT", "USD"] },
      { label: "Opening balance", type: "number", placeholder: "0.00" },
      {
        label: "GL account",
        choices: [
          "1110 · City Bank operating account",
          "1120 · bKash settlement wallet",
        ],
      },
    ];
  }
  private reconciliationFields(): MockField[] {
    return [
      {
        label: "Bank account",
        choices: ["City Bank operating account", "bKash settlement wallet"],
        required: true,
      },
      { label: "Statement from", type: "date", required: true },
      { label: "Statement to", type: "date", required: true },
      {
        label: "Statement ending balance",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
      { label: "Statement reference", placeholder: "September 2026 statement" },
      {
        label: "Notes",
        type: "textarea",
        placeholder: "Optional reconciliation context.",
        wide: true,
      },
    ];
  }
  private integrationFields(): MockField[] {
    return [
      {
        label: "Source module",
        choices: [
          "Commerce",
          "Procurement",
          "HR Management",
          "Payment Management",
        ],
        required: true,
      },
      {
        label: "Source event",
        placeholder: "Invoice approved",
        required: true,
      },
      {
        label: "Debit account",
        placeholder: "Chart account code",
        required: true,
      },
      {
        label: "Credit account",
        placeholder: "Chart account code",
        required: true,
      },
      { label: "Effective date", type: "date" },
      {
        label: "Posting description",
        placeholder: "Generated journal memo",
        wide: true,
      },
    ];
  }
  private costCenterFields(): MockField[] {
    return [
      { label: "Cost center code", placeholder: "CC-IT-01", required: true },
      {
        label: "Cost center name",
        placeholder: "IT Operations",
        required: true,
      },
      { label: "Manager", placeholder: "Nadia Rahman" },
      {
        label: "Branch",
        choices: ["Dhaka HQ", "Gulshan Branch", "Chattogram Branch"],
      },
      { label: "Parent cost center", placeholder: "Optional parent" },
      {
        label: "Description",
        type: "textarea",
        placeholder: "Purpose and ownership.",
        wide: true,
      },
    ];
  }
  private partnerFields(): MockField[] {
    return [
      { label: "Partner code", placeholder: "SUP-1005", required: true },
      {
        label: "Display name",
        placeholder: "Registered business name",
        required: true,
      },
      {
        label: "Partner type",
        choices: ["Customer", "Supplier", "Both"],
        required: true,
      },
      { label: "Currency", choices: ["BDT", "USD"] },
      { label: "Payment terms (days)", type: "number", placeholder: "30" },
      { label: "Email", type: "email", placeholder: "accounts@example.com" },
      { label: "Tax treatment", placeholder: "Standard" },
      { label: "Legal name", placeholder: "Registered legal name" },
    ];
  }
  private assetFields(): MockField[] {
    return [
      { label: "Asset code", placeholder: "FA-0001", required: true },
      {
        label: "Asset name",
        placeholder: "Office laptop Dell Latitude",
        required: true,
      },
      {
        label: "Category",
        choices: [
          "Computers",
          "Office equipment",
          "Network equipment",
          "Vehicles",
        ],
      },
      { label: "Acquisition date", type: "date", required: true },
      {
        label: "Acquisition cost",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
      { label: "Salvage value", type: "number", placeholder: "0.00" },
      { label: "Useful life (years)", type: "number", placeholder: "5" },
      {
        label: "Description",
        type: "textarea",
        placeholder: "Asset details and location.",
        wide: true,
      },
    ];
  }
  private budgetFields(): MockField[] {
    return [
      { label: "Budget code", placeholder: "BDG-2026-01", required: true },
      {
        label: "Budget name",
        placeholder: "FY2026 Operating Budget",
        required: true,
      },
      { label: "Fiscal year", choices: ["2026", "2027"], required: true },
      { label: "Owner", placeholder: "Finance & Accounting" },
      {
        label: "Description",
        type: "textarea",
        placeholder: "Budget scope and assumptions.",
        wide: true,
      },
    ];
  }
  private accountingSettingsFields(): MockField[] {
    return [
      {
        label: "Base currency",
        choices: ["BDT · ৳", "USD · $"],
        required: true,
      },
      {
        label: "Fiscal year start",
        choices: ["1 January", "1 July"],
        required: true,
      },
      {
        label: "Default journal status",
        choices: ["Draft for approval", "Post on save"],
        required: true,
      },
      {
        label: "Closed period control",
        choices: ["Prevent posting", "Allow controller override"],
        required: true,
      },
      {
        label: "Default cost center",
        choices: ["IT Operations", "Finance & Accounting", "Retail Operations"],
      },
    ];
  }
  private taxCodeFields(): MockField[] {
    return [
      { label: "Tax code", placeholder: "VAT-STD", required: true },
      { label: "Tax name", placeholder: "Standard VAT", required: true },
      { label: "Rate (%)", type: "number", placeholder: "15", required: true },
      {
        label: "Sales tax account",
        choices: ["2150 · VAT payable", "2160 · Tax withheld"],
      },
      {
        label: "Purchase tax account",
        choices: ["1150 · Input VAT", "1160 · WHT receivable"],
      },
      {
        label: "Tax treatment",
        choices: ["Standard rated", "Reduced rate", "Zero rated", "Exempt"],
      },
    ];
  }
  private exchangeRateFields(): MockField[] {
    return [
      { label: "Rate date", type: "date", required: true },
      { label: "From currency", placeholder: "USD", required: true },
      { label: "To currency", placeholder: "BDT", required: true },
      {
        label: "Exchange rate",
        type: "number",
        placeholder: "121.85",
        required: true,
      },
      {
        label: "Rate source",
        choices: ["Bangladesh Bank", "Treasury update", "Manual"],
      },
    ];
  }
  private feePlanFields(): MockField[] {
    return [
      {
        label: "Fee plan name",
        placeholder: "Primary · Standard plan",
        required: true,
      },
      {
        label: "Programme",
        choices: ["Primary", "Secondary", "Senior", "Diploma"],
        required: true,
      },
      {
        label: "Academic year",
        choices: ["2026–27", "2027–28"],
        required: true,
      },
      { label: "Effective from", type: "date", required: true },
      {
        label: "Payment schedule",
        choices: ["Monthly", "Per term", "Annual"],
        required: true,
      },
      {
        label: "Notes",
        type: "textarea",
        placeholder: "Plan assumptions and approvals.",
        wide: true,
      },
    ];
  }
  private feeCatalogFields(): MockField[] {
    return [
      { label: "Fee head code", placeholder: "FEE-TUI-01", required: true },
      {
        label: "Fee head name",
        placeholder: "Tuition · Primary",
        required: true,
      },
      {
        label: "Revenue account",
        choices: [
          "4110 · Tuition revenue",
          "4120 · Academic fees",
          "4130 · Transport revenue",
        ],
        required: true,
      },
      {
        label: "Applicability",
        choices: [
          "School · Primary",
          "School · Secondary",
          "Training · Diploma",
          "Shared education",
        ],
        required: true,
      },
      {
        label: "Description",
        type: "textarea",
        placeholder: "Finance-owned education fee definition.",
        wide: true,
      },
    ];
  }
  private lateFeeFields(): MockField[] {
    return [
      {
        label: "Policy name",
        placeholder: "Monthly installment · 5% after 10 days",
        required: true,
      },
      {
        label: "Rule type",
        choices: ["Percentage", "Fixed amount", "Daily rate"],
        required: true,
      },
      {
        label: "Published fee plan",
        choices: [
          "Primary · Standard plan",
          "Secondary · Science track",
          "Diploma · Evening",
        ],
      },
      {
        label: "Grace period (days)",
        type: "number",
        placeholder: "10",
        required: true,
      },
      {
        label: "Late fee rate",
        type: "number",
        placeholder: "5",
        required: true,
      },
      { label: "Maximum charge (BDT)", type: "number", placeholder: "1500" },
      {
        label: "Revenue account",
        choices: ["4180 · Late fee revenue", "4190 · Other education revenue"],
      },
    ];
  }
  private feeDiscountFields(): MockField[] {
    return [
      {
        label: "Discount type name",
        placeholder: "Merit scholarship",
        required: true,
      },
      {
        label: "Kind",
        choices: ["Merit", "Sibling", "Staff benefit", "Need based"],
        required: true,
      },
      {
        label: "Contra account",
        choices: [
          "4900 · Scholarships",
          "4910 · Fee discounts",
          "4920 · Staff benefit",
        ],
        required: true,
      },
      { label: "Approval required", choices: ["Yes", "No"], required: true },
      {
        label: "Description",
        type: "textarea",
        placeholder: "Eligibility and approval policy.",
        wide: true,
      },
    ];
  }
  private vdsFields(): MockField[] {
    return [
      { label: "Supplier", choices: suppliers, required: true },
      { label: "Supplier bill", placeholder: "BILL-26-208", required: true },
      { label: "Payment date", type: "date", required: true },
      {
        label: "Rate category",
        choices: [
          "Contractor services",
          "Consulting",
          "Transport",
          "Office supplies",
        ],
        required: true,
      },
      {
        label: "Payment amount",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
      {
        label: "VDS amount",
        type: "number",
        placeholder: "0.00",
        required: true,
      },
    ];
  }
}
