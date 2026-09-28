import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { Subscription, filter } from "rxjs";
import routeData from "../assets/hrm-routes.json";
import navigationData from "../assets/hrm-navigation.json";
import { HrmPaginationComponent } from "./hrm-pagination.component";

type Column = { key: keyof HrmRow; label: string };
type HrmRow = {
  id: string;
  name: string;
  code: string;
  role: string;
  department: string;
  branch: string;
  type: string;
  date: string;
  endDate: string;
  fromIso: string;
  toIso: string;
  days: string;
  validation: string;
  variance: string;
  payslips: string;
  locks: string;
  processed: string;
  status: string;
  manager: string;
  value: string;
  secondary: string;
  owner: string;
  stage: string;
};
type RouteInfo = {
  path: string;
  title: string;
  group: string;
  section: string;
  kind: string;
  aliasTo: string | null;
};
type NavGroup = { title: string; entries: { path: string; label: string }[] };
type FormField = {
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  wide?: boolean;
};
type Metric = {
  label: string;
  value: string;
  note: string;
  icon: string;
  tone: string;
  positive?: boolean;
};

const departments = [
  "People & Culture",
  "Finance",
  "Commerce",
  "Customer Success",
  "Technology",
  "Operations",
  "Marketing",
  "Learning",
];
const branches = ["Dhaka HQ", "Gulshan Office", "Chattogram Branch", "Remote"];
const names = [
  "Aisha Rahman",
  "Tanvir Hossain",
  "Nusrat Jahan",
  "Arif Mahmud",
  "Samira Chowdhury",
  "Imran Kabir",
  "Farzana Islam",
  "Rafi Ahmed",
  "Sadia Karim",
  "Zubair Hasan",
  "Maliha Akter",
  "Nabil Chowdhury",
  "Tasnim Haque",
  "Rashedul Alam",
  "Mehjabin Sultana",
  "Sajid Rahman",
  "Rumana Akter",
  "Ashikur Rahman",
  "Sharmeen Nahar",
  "Fahim Uddin",
  "Anika Sarker",
  "Mahmudul Hasan",
  "Sohana Islam",
  "Shakib Hossain",
  "Tania Afrin",
  "Muntasir Rahman",
  "Nafisa Tabassum",
  "Khaled Mahmud",
  "Sanjida Haque",
  "Rezaul Karim",
  "Labiba Noor",
  "Sabbir Ahmed",
  "Mira Chowdhury",
  "Tahmid Hasan",
  "Jannatul Ferdous",
  "Aminul Islam",
];
const statuses = [
  "Active",
  "Pending review",
  "In progress",
  "Approved",
  "Needs attention",
  "Completed",
  "Scheduled",
  "Draft",
];
const defaultStatusOptions = [
  "All statuses",
  "Active",
  "Pending review",
  "In progress",
  "Approved",
  "Needs attention",
  "Completed",
  "Scheduled",
  "Draft",
];
const payrollRunStatuses = [
  "Draft",
  "Processing",
  "Failed",
  "Processed",
  "Approved",
  "Paid",
  "Cancelled",
];
const aliases: Record<string, string> = {
  "/app/hrm": "/app/hrm/home",
  "/app/hrm/recruitment": "/app/hrm/recruitment/overview",
  "/app/hrm/onboarding": "/app/hrm/onboarding/home",
  "/app/hrm/separation": "/app/hrm/separation/home",
  "/app/hrm/attendance": "/app/hrm/attendance/dashboard",
  "/app/hrm/leave": "/app/hrm/leave/requests",
  "/app/hrm/payroll": "/app/hrm/payroll/runs",
  "/app/hrm/performance/cycles": "/app/hrm/performance/cycles/overview",
};

@Component({
  selector: "hrm-workspace",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HrmPaginationComponent],
  templateUrl: "./hrm-workspace.component.html",
  styleUrls: [
    "./hrm-workspace.component.css",
    "./hrm-calendar.styles.css",
    "./hrm-typography.css",
  ],
})
export class HrmWorkspaceComponent implements OnInit, OnDestroy {
  readonly routeCatalog = (routeData as { routes: RouteInfo[] }).routes;
  readonly navGroups = (navigationData as NavGroup[]).filter(
    (group) => group.entries.length > 0,
  );
  readonly commonStatusOptions = defaultStatusOptions;
  readonly pageSizes = [10, 20, 50];
  readonly currentYear = 2026;
  route: RouteInfo | null = null;
  currentPath = "/app/hrm/home";
  mockState = "populated";
  rows: HrmRow[] = [];
  columns: Column[] = [];
  search = "";
  statusFilter = "All statuses";
  departmentFilter = "All departments";
  branchFilter = "All branches";
  yearFilter = "All years";
  calendarFrom = "2026-08-31";
  calendarTo = "2026-09-29";
  leaveTypeFilter = "All types";
  page = 1;
  pageSize = 10;
  mobileMenuOpen = false;
  reviewMenuOpen = false;
  drawerRow: HrmRow | null = null;
  toast = "";
  submitted = false;
  formValues: Record<string, string> = {};
  private toastTimer?: ReturnType<typeof setTimeout>;
  private routerSubscription?: Subscription;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    document.body.classList.add("hrm-preview-active");
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => this.syncRoute());
    this.syncRoute();
  }

  ngOnDestroy(): void {
    document.body.classList.remove("hrm-preview-active");
    this.routerSubscription?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private syncRoute(): void {
    const parsed = this.router.parseUrl(this.router.url);
    let path =
      parsed.root.children["primary"]?.segments
        .map((segment) => segment.path)
        .join("/") || "";
    path = path.startsWith("/") ? path : `/${path}`;
    path = path.replace(/\/$/, "") || "/app/hrm/home";
    if (aliases[path]) {
      void this.router.navigateByUrl(aliases[path], { replaceUrl: true });
      path = aliases[path];
    }
    this.currentPath = path;
    this.mockState = String(parsed.queryParams["mockState"] ?? "populated");
    this.route = this.findRoute(path);
    this.mobileMenuOpen = false;
    this.reviewMenuOpen = false;
    this.drawerRow = null;
    this.submitted = false;
    this.formValues = {};
    this.search = "";
    this.statusFilter = this.isPayrollRuns ? "All Statuses" : "All statuses";
    this.departmentFilter = "All departments";
    this.branchFilter = "All branches";
    this.yearFilter = "All years";
    this.page = 1;
    this.rows = this.makeRows(path);
    this.columns = this.makeColumns(path);
    this.pageSize = 10;
  }

  private findRoute(path: string): RouteInfo | null {
    const segments = path.split("/").filter(Boolean);
    return (
      this.routeCatalog.find((candidate) => {
        const pattern = candidate.path.split("/").filter(Boolean);
        return (
          pattern.length === segments.length &&
          pattern.every(
            (segment, index) =>
              segment.startsWith(":") || segment === segments[index],
          )
        );
      }) ?? null
    );
  }

  get title(): string {
    if (this.currentPath === "/app/hrm/home") return "HR Management";
    const screenTitles: Record<string, string> = {
      "/app/hrm/recruitment/overview": "Recruitment Dashboard",
      "/app/hrm/attendance/dashboard": "Attendance Dashboard",
      "/app/hrm/attendance/policy": "Attendance Policy",
      "/app/hrm/payroll/dashboard": "Payroll Dashboard",
      "/app/hrm/payroll/compliance/settings": "Compliance Settings",
    };
    if (screenTitles[this.currentPath]) return screenTitles[this.currentPath];
    const route = this.route;
    if (!route) return "HR Management";
    const tail = this.currentPath.split("/").at(-1) ?? "";
    if (tail === "new") return `Create ${this.titleFromPreviousSegment()}`;
    if (tail === "edit") return `Edit ${this.titleFromPreviousSegment(2)}`;
    if (route.kind === "detail")
      return `${this.titleFromPreviousSegment()} details`;
    return route.title;
  }

  get eyebrow(): string {
    return this.route?.group ?? "People & Organization";
  }
  get statusOptions(): string[] {
    return this.isPayrollRuns
      ? ["All Statuses", ...payrollRunStatuses]
      : this.commonStatusOptions;
  }
  get isPayrollRuns(): boolean {
    return this.currentPath === "/app/hrm/payroll/runs";
  }
  get branches(): string[] {
    return ["All branches", ...branches];
  }
  get leaveTypeOptions(): string[] {
    return [
      "All types",
      "Annual Leave",
      "Medical Leave",
      "Personal Leave",
      "Parental Leave",
    ];
  }
  get isLeaveCalendar(): boolean {
    return this.currentPath === "/app/hrm/leave/calendar";
  }
  get years(): string[] {
    return ["All years", "2026", "2025", "2024"];
  }
  readonly payrollSteps = [
    { label: "Create", note: "Set pay period", number: "01" },
    { label: "Validate", note: "Review exceptions", number: "02" },
    { label: "Process", note: "Calculate payroll", number: "03" },
    { label: "Approve", note: "Confirm totals", number: "04" },
    { label: "Disburse", note: "Prepare payments", number: "05" },
  ];
  get viewKind(): string {
    const lower = this.currentPath.toLowerCase();
    if (lower === "/app/hrm/home") return "home";
    if (/user-guide|business-flow-guide/.test(lower)) return "guide";
    if (
      /enterprise-controls|career-site|\/attendance\/policy$|\/compliance\/settings$/.test(
        lower,
      )
    )
      return "settings";
    if (/new$|\/edit$|\/bulk$|manual-entry$|auto-mark-absence$/.test(lower))
      return "form";
    if (this.route?.kind === "detail") return "detail";
    if (this.route?.kind === "overview") return "overview";
    if (this.route?.kind === "report") return "report";
    return "list";
  }
  get description(): string {
    const section = this.route?.section ?? "home";
    const descriptions: Record<string, string> = {
      home: "A connected view of your people, hiring pipeline, time, and organizational priorities.",
      employees:
        "Manage employee records, employment details, and workforce status in one directory.",
      departments:
        "Maintain the organization structure and understand how teams are staffed.",
      designations:
        "Keep job titles, levels, and reporting roles aligned across the organization.",
      recruitment:
        "Track hiring requests, vacancies, candidates, interviews, and offers from one place.",
      onboarding:
        "Coordinate new-hire tasks, templates, and orientation from offer acceptance through day one.",
      attendance:
        "Review daily attendance and manage shifts, corrections, breaks, and policy settings.",
      leave:
        "Manage employee leave requests, balances, approvals, and accrual activity.",
      payroll:
        "Coordinate payroll runs, compensation records, compliance, and settlements.",
      performance:
        "Run review cycles, evaluate competencies, and support fair calibration.",
      benefits:
        "Manage benefit plans, employee elections, and policy information.",
      separation:
        "Coordinate employee exits, clearance, final settlement, and alumni records.",
      services: "Resolve employee requests and coordinate HR support work.",
      workforce:
        "Plan headcount, staffing targets, and future capacity across teams.",
      announcements:
        "Share organization updates and keep a record of published communications.",
      analytics:
        "Review workforce trends and operational outcomes across HR functions.",
      "activity-logs":
        "Review important HR changes, approvals, and administrative activity.",
    };
    if (/reports/.test(this.currentPath))
      return "Explore workforce outcomes and operational trends with filters and clear summaries.";
    if (this.currentPath === "/app/hrm/payroll/runs")
      return "Create, process, approve, and manage monthly payroll cycles for your organization.";
    if (/approval|reviews/.test(this.currentPath))
      return "Review assigned work, see the supporting details, and record a clear decision.";
    if (/calendar/.test(this.currentPath))
      return "See key dates and plan coverage across teams.";
    return (
      descriptions[section] ??
      "Manage this HR workflow with a clear view of status, ownership, and next steps."
    );
  }

  get filteredRows(): HrmRow[] {
    const query = this.search.toLowerCase().trim();
    return this.rows.filter((row) => {
      const matchesText =
        !query || Object.values(row).join(" ").toLowerCase().includes(query);
      const matchesStatus =
        this.statusFilter === "All statuses" ||
        this.statusFilter === "All Statuses" ||
        row.status === this.statusFilter;
      const matchesDepartment =
        this.departmentFilter === "All departments" ||
        row.department === this.departmentFilter;
      const matchesBranch =
        this.branchFilter === "All branches" ||
        row.branch === this.branchFilter;
      const matchesYear =
        this.yearFilter === "All years" || row.date.includes(this.yearFilter);
      const matchesLeaveType =
        !this.isLeaveCalendar ||
        this.leaveTypeFilter === "All types" ||
        row.role === this.leaveTypeFilter;
      const matchesDateRange =
        !this.isLeaveCalendar ||
        (row.fromIso <= this.calendarTo && row.toIso >= this.calendarFrom);
      return (
        matchesText &&
        matchesStatus &&
        matchesDepartment &&
        matchesBranch &&
        matchesYear &&
        matchesLeaveType &&
        matchesDateRange
      );
    });
  }
  get visibleRows(): HrmRow[] {
    return this.filteredRows.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize,
    );
  }
  get departments(): string[] {
    return ["All departments", ...departments];
  }
  get sectionName(): string {
    return this.route?.section ?? "home";
  }
  get isList(): boolean {
    return this.viewKind === "list" || this.viewKind === "report";
  }
  get isDashboard(): boolean {
    return this.viewKind === "home" || this.viewKind === "overview";
  }
  get formFields(): FormField[] {
    return this.fieldsForPath(this.currentPath);
  }
  get formSections(): {
    title: string;
    description: string;
    fields: FormField[];
  }[] {
    const first = Math.ceil(this.formFields.length / 2);
    return [
      {
        title: "Record information",
        description: "Enter the details HR needs to process this item.",
        fields: this.formFields.slice(0, first),
      },
      {
        title: "Additional details",
        description: "Add supporting information for the next reviewer.",
        fields: this.formFields.slice(first),
      },
    ].filter((section) => section.fields.length > 0);
  }
  get actionLabel(): string {
    if (/approve|approval/.test(this.currentPath)) return "Record review";
    if (/bulk/.test(this.currentPath)) return "Continue";
    return "Save changes";
  }
  get primaryActionPath(): string | null {
    return (
      this.routeCatalog.find(
        (route) => route.path === `${this.currentPath}/new`,
      )?.path ?? null
    );
  }
  get primaryActionLabel(): string {
    return this.primaryActionPath
      ? `Create ${this.titleFromPath(this.primaryActionPath.split("/").at(-2) ?? "")}`
      : "";
  }
  get currentPageLink(): string {
    return this.currentPath;
  }
  get metrics(): Metric[] {
    return [
      {
        label: "Active employees",
        value: "1,284",
        note: "+4.8% vs last month",
        icon: "◎",
        tone: "teal",
        positive: true,
      },
      {
        label: "Open positions",
        value: "18",
        note: "Across 7 departments",
        icon: "↗",
        tone: "blue",
      },
      {
        label: "On leave today",
        value: "24",
        note: "1.9% of workforce",
        icon: "◷",
        tone: "amber",
      },
      {
        label: "Pending approvals",
        value: "12",
        note: "Needs your review",
        icon: "✓",
        tone: "violet",
      },
    ];
  }
  get quickLinks(): {
    title: string;
    note: string;
    icon: string;
    tone: string;
    path: string;
  }[] {
    return [
      {
        title: "Add an employee",
        note: "Create a new team member profile",
        icon: "+",
        tone: "teal",
        path: "/app/hrm/employees/new",
      },
      {
        title: "Review leave",
        note: "2 requests waiting for approval",
        icon: "◷",
        tone: "amber",
        path: "/app/hrm/leave/requests",
      },
      {
        title: "Open requisitions",
        note: "3 hiring requests to review",
        icon: "↗",
        tone: "blue",
        path: "/app/hrm/recruitment/requisitions",
      },
    ];
  }
  readonly moduleGroups = [
    {
      title: "People & organization",
      description: "Employee records, teams, roles, and announcements.",
      path: "/app/hrm/employees",
      workspaces: "5 workspaces",
      tone: "teal",
      icon: "◎",
    },
    {
      title: "Recruitment",
      description: "Requisitions, vacancies, candidates, and interviews.",
      path: "/app/hrm/recruitment/overview",
      workspaces: "8 workspaces",
      tone: "blue",
      icon: "↗",
    },
    {
      title: "Time & leave",
      description: "Attendance, shifts, leave requests, and schedules.",
      path: "/app/hrm/attendance/dashboard",
      workspaces: "14 workspaces",
      tone: "amber",
      icon: "◷",
    },
    {
      title: "Payroll & compensation",
      description: "Payroll runs, compensation, finance, and compliance.",
      path: "/app/hrm/payroll/dashboard",
      workspaces: "18 workspaces",
      tone: "violet",
      icon: "৳",
    },
    {
      title: "Performance & benefits",
      description: "Review cycles, ratings, benefits, and enrollment.",
      path: "/app/hrm/performance/cycles/overview",
      workspaces: "9 workspaces",
      tone: "teal",
      icon: "✦",
    },
    {
      title: "Employee operations",
      description: "Onboarding, separation, services, and workforce plans.",
      path: "/app/hrm/onboarding/home",
      workspaces: "11 workspaces",
      tone: "blue",
      icon: "▦",
    },
  ];
  get pipeline(): { label: string; value: string; percent: number }[] {
    return [
      { label: "Applied", value: "186", percent: 100 },
      { label: "Screening", value: "94", percent: 67 },
      { label: "Interview", value: "42", percent: 44 },
      { label: "Offer", value: "18", percent: 27 },
      { label: "Hired", value: "11", percent: 18 },
    ];
  }
  get teams(): {
    name: string;
    people: number;
    percent: number;
    initials: string;
    tone: string;
  }[] {
    return departments.slice(0, 5).map((name, index) => ({
      name,
      people: [248, 196, 174, 151, 128][index],
      percent: [100, 79, 70, 61, 52][index],
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2),
      tone: ["teal", "blue", "violet", "amber", "rose"][index],
    }));
  }
  get overviewTiles(): { label: string; value: string; note: string }[] {
    if (this.currentPath.includes("attendance"))
      return [
        { label: "Present today", value: "1,146", note: "89.3% of employees" },
        { label: "Late arrivals", value: "32", note: "2.5% of employees" },
        { label: "On leave", value: "24", note: "Across 8 departments" },
        { label: "Unmarked", value: "82", note: "Check-in by 10:00 AM" },
      ];
    if (this.currentPath.includes("recruitment"))
      return [
        { label: "Open vacancies", value: "18", note: "+3 this month" },
        { label: "Applications", value: "186", note: "Across active roles" },
        { label: "Interviews", value: "42", note: "Scheduled this month" },
        { label: "Offers pending", value: "7", note: "2 awaiting approval" },
      ];
    return [
      { label: "Active employees", value: "1,284", note: "+4.8% this month" },
      { label: "New this month", value: "26", note: "Across 6 departments" },
      { label: "Upcoming reviews", value: "48", note: "Due in next 30 days" },
      { label: "Open requests", value: "12", note: "4 need attention" },
    ];
  }
  get relatedNav(): { path: string; label: string }[] {
    const sectionRoutes = this.navGroups
      .flatMap((group) => group.entries)
      .filter((entry) =>
        entry.path.startsWith(`/app/hrm/${this.sectionName}/`),
      );
    return (
      sectionRoutes.length
        ? sectionRoutes
        : this.navGroups.flatMap((group) => group.entries)
    ).slice(0, 5);
  }
  get reportBars(): { day: string; height: number }[] {
    return [
      { day: "Mon", height: 48 },
      { day: "Tue", height: 66 },
      { day: "Wed", height: 58 },
      { day: "Thu", height: 81 },
      { day: "Fri", height: 72 },
      { day: "Sat", height: 45 },
      { day: "Sun", height: 61 },
    ];
  }
  get detailItems(): { label: string; value: string }[] {
    const row = this.rows[0];
    return row
      ? [
          { label: "Reference", value: row.code },
          { label: "Department", value: row.department },
          { label: "Location", value: row.branch },
          { label: "Employment type", value: row.type },
          { label: "Manager", value: row.manager },
          { label: "Effective date", value: row.date },
          { label: "Status", value: row.status },
          { label: "Compensation", value: row.value },
        ]
      : [];
  }
  get timeline(): { title: string; detail: string; when: string }[] {
    return [
      {
        title: "Record created",
        detail: "Sample record added to the HR workspace.",
        when: "18 Sep 2026 · 10:42 AM",
      },
      {
        title: "Details reviewed",
        detail: "People Operations confirmed the current information.",
        when: "16 Sep 2026 · 3:15 PM",
      },
      {
        title: "Status updated",
        detail: "Workflow moved to its current stage.",
        when: "12 Sep 2026 · 9:08 AM",
      },
    ];
  }
  get guideSections(): {
    title: string;
    description: string;
    number: string;
    steps: string[];
  }[] {
    return [
      {
        title: "Request and prepare",
        description:
          "Start with clear ownership and complete employee context.",
        number: "01",
        steps: [
          "Confirm the request scope and effective date.",
          "Check required employee and department details.",
          "Attach supporting notes for the next reviewer.",
        ],
      },
      {
        title: "Review and approve",
        description:
          "Make decisions visible and route exceptions to the right owner.",
        number: "02",
        steps: [
          "Review the submitted information.",
          "Record a decision with a short explanation.",
          "Notify the employee and relevant stakeholders.",
        ],
      },
      {
        title: "Complete and audit",
        description: "Close the workflow with a traceable outcome.",
        number: "03",
        steps: [
          "Confirm downstream tasks are complete.",
          "Update the employee record where needed.",
          "Retain the activity history for future reference.",
        ],
      },
    ];
  }
  settings = [
    {
      title: "Manager approval",
      description: "Route employee requests to the line manager first.",
      icon: "✓",
      enabled: true,
    },
    {
      title: "HR review for exceptions",
      description: "Require HR review when a request falls outside policy.",
      icon: "◈",
      enabled: true,
    },
    {
      title: "Employee status updates",
      description: "Send a progress update when workflow status changes.",
      icon: "↗",
      enabled: true,
    },
    {
      title: "Reminder notifications",
      description: "Remind owners about work approaching its due date.",
      icon: "◷",
      enabled: false,
    },
  ];

  isActive(entryPath: string): boolean {
    if (entryPath === this.currentPath) return true;
    const normalized = this.currentPath.replace(/\/[^/]+$/, "");
    return entryPath === normalized && this.currentPath !== "/app/hrm/home";
  }
  onSearch(value: string): void {
    this.search = value;
    this.page = 1;
  }
  onStatus(value: string): void {
    this.statusFilter = value;
    this.page = 1;
  }
  onDepartment(value: string): void {
    this.departmentFilter = value;
    this.page = 1;
  }
  onBranch(value: string): void {
    this.branchFilter = value;
    this.page = 1;
  }
  onYear(value: string): void {
    this.yearFilter = value;
    this.page = 1;
  }
  loadCalendar(): void {
    this.page = 1;
    this.showToast("Leave schedule updated for the selected period.");
  }
  onPage(value: number): void {
    this.page = value;
  }
  onPageSize(value: number): void {
    this.pageSize = value;
    this.page = 1;
  }
  openRecord(row: HrmRow): void {
    const detail = this.routeCatalog.find(
      (route) =>
        route.kind === "detail" &&
        route.path.split("/").length ===
          this.currentPath.split("/").length + 1 &&
        route.path.startsWith(this.currentPath),
    );
    if (detail) {
      const target = detail.path.replace(/:\w+$/, row.code);
      void this.router.navigateByUrl(target);
      return;
    }
    this.drawerRow = row;
  }
  navigateTo(path: string | null): void {
    if (path) void this.router.navigateByUrl(path);
  }
  closeDrawer(): void {
    this.drawerRow = null;
  }
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  toggleReviewMenu(): void {
    this.reviewMenuOpen = !this.reviewMenuOpen;
  }
  reviewStateLink(state: string): string {
    return state === "populated"
      ? this.currentPath
      : `${this.currentPath}?mockState=${state}`;
  }
  saveMock(): void {
    this.submitted = true;
    const required = this.formFields.filter((field) => field.required);
    const emptyRequired = required.some(
      (field) => !(this.formValues[field.label] ?? "").trim(),
    );
    if (emptyRequired) {
      this.showToast("Complete the required fields to continue.");
      return;
    }
    this.showToast("Your sample changes were saved.");
  }
  mockAction(action: string, row?: HrmRow): void {
    if (row && /approve/i.test(action)) row.status = "Approved";
    else if (row && /reject/i.test(action)) row.status = "Needs attention";
    this.showToast(`${action} completed in the design preview.`);
  }
  showToast(message: string): void {
    this.toast = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ""), 3000);
  }
  rowValue(row: HrmRow, key: keyof HrmRow): string {
    return row[key];
  }
  statusClass(value: string | undefined): string {
    return `status-pill status-${(value ?? "draft").toLowerCase().replace(/\s+/g, "-")}`;
  }
  detailTitle(): string {
    return this.title;
  }
  amountLabel(row: HrmRow): string {
    return row.value.startsWith("৳") ? row.value : `৳ ${row.value}`;
  }
  stateText(): { title: string; message: string } {
    const states: Record<string, { title: string; message: string }> = {
      empty: {
        title: "No records found",
        message:
          "Try another filter or add the first record to this workspace.",
      },
      loading: {
        title: "Loading HR workspace",
        message: "Refreshing the latest sample data…",
      },
      error: {
        title: "Unable to load this view",
        message:
          "The sample view could not be prepared. Return to the populated state to continue.",
      },
      validation: {
        title: "Review required information",
        message:
          "Required fields are highlighted so the request can be completed.",
      },
      success: {
        title: "Changes saved",
        message: "The sample action completed successfully.",
      },
      forbidden: {
        title: "Access restricted",
        message:
          "This preview demonstrates a role without access to this HR workspace.",
      },
    };
    return states[this.mockState] ?? { title: "", message: "" };
  }
  get showEmptyState(): boolean {
    return (
      this.mockState === "empty" ||
      (this.isList && this.filteredRows.length === 0)
    );
  }

  private titleFromPreviousSegment(offset = 1): string {
    const segments = this.currentPath.split("/").filter(Boolean);
    return this.titleFromPath(
      segments[Math.max(0, segments.length - offset - 1)] ?? "record",
    );
  }
  private titleFromPath(value: string): string {
    const labels: Record<string, string> = {
      "activity-logs": "Activity",
      "approval-workflows": "Approval Workflow",
      "auto-mark-absence": "Absence Rule",
      "shift-assignments": "Shift Assignment",
      "business-flow-guide": "Business Flow Guide",
      "career-site": "Career Site",
      "comp-off": "Comp-Off Credit",
      employee: "Employee",
      "payment-batches": "Payment Batch",
      team: "Team",
    };
    return (
      labels[value] ??
      value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .replace(/s$/, "")
    );
  }
  private makeRows(path: string): HrmRow[] {
    const section = path.split("/")[3] ?? "home";
    const sub = path.split("/")[4] ?? "";
    return Array.from({ length: 36 }, (_, index) => {
      const person = names[index % names.length];
      const department = departments[index % departments.length];
      const date =
        section === "leave"
          ? new Date(Date.UTC(2026, 8, 5 + index * 2))
          : new Date(Date.UTC(2026, 0, 5 + index * 6));
      const status =
        section === "payroll" && sub === "runs"
          ? payrollRunStatuses[index % payrollRunStatuses.length]
          : statuses[index % statuses.length];
      const codePrefix: Record<string, string> = {
        employees: "EMP",
        recruitment: sub.startsWith("requisition")
          ? "REQ"
          : sub.startsWith("vacanc")
            ? "JOB"
            : "CAN",
        onboarding: "ONB",
        attendance: "ATT",
        leave: "LEV",
        payroll: "PAY",
        performance: "REV",
        benefits: "BEN",
        separation: "SEP",
        services: "HRS",
        departments: "DEP",
        designations: "DES",
        workforce: "WFP",
        announcements: "ANN",
        lifecycle: "LFC",
        "activity-logs": "AUD",
      };
      const prefix = codePrefix[section] ?? "HR";
      const role = [
        "People Partner",
        "Senior Analyst",
        "Operations Lead",
        "Product Designer",
        "Finance Officer",
        "Software Engineer",
      ][index % 6];
      const value = (78500 + index * 1325).toLocaleString("en-US");
      const labels: Record<string, string[]> = {
        recruitment: [
          "Senior Product Designer",
          "Payroll Specialist",
          "People Operations Lead",
          "Frontend Engineer",
          "Branch Manager",
        ],
        onboarding: [
          "Employee documents",
          "Equipment setup",
          "Policy acknowledgements",
          "Team introduction",
          "First-week plan",
        ],
        leave: [
          "Annual Leave",
          "Medical Leave",
          "Personal Leave",
          "Parental Leave",
        ],
        payroll: ["September 2026", "August 2026", "July 2026", "June 2026"],
        benefits: [
          "Health coverage",
          "Wellness allowance",
          "Retirement plan",
          "Family support",
        ],
        attendance: [
          "General shift",
          "Morning shift",
          "Evening shift",
          "Flexible hours",
        ],
      };
      return {
        id: String(index + 1),
        code: `${prefix}-${String(101 + index).padStart(4, "0")}`,
        name: person,
        role: (labels[section] ?? [role])[
          index % (labels[section]?.length ?? 1)
        ],
        department,
        branch: branches[index % branches.length],
        type:
          section === "leave"
            ? ["Full day", "Half day", "Full day", "Full day"][index % 4]
            : ["Full-time", "Full-time", "Contract", "Part-time"][index % 4],
        date:
          section === "payroll" && sub === "runs"
            ? ["September 2026", "August 2026", "July 2026", "June 2026"][
                index % 4
              ]
            : date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }),
        endDate: new Date(date.getTime() + 3 * 86400000).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
        ),
        fromIso: date.toISOString().slice(0, 10),
        toIso: new Date(date.getTime() + 3 * 86400000)
          .toISOString()
          .slice(0, 10),
        days: String((index % 4) + 1),
        validation: ["Passed", "2 warnings", "Passed", "1 issue"][index % 4],
        variance: index % 5 === 0 ? "+0.8%" : "—",
        payslips: `${790 + index} / ${820 + index}`,
        locks: index % 3 === 0 ? "Locked" : "Open",
        processed: ["24 Sep 2026", "22 Aug 2026", "24 Jul 2026", "—"][
          index % 4
        ],
        status,
        manager: names[(index + 7) % names.length],
        value: `৳ ${value}`,
        secondary: `${department} · ${branches[index % branches.length]}`,
        owner: names[(index + 11) % names.length],
        stage:
          section === "payroll" && sub === "runs"
            ? String(820 + index)
            : ["New", "Screening", "Interview", "Offer", "Hired"][index % 5],
      };
    });
  }
  private makeColumns(path: string): Column[] {
    const section = path.split("/")[3] ?? "home";
    const sub = path.split("/")[4] ?? "";
    const c = (key: keyof HrmRow, label: string): Column => ({ key, label });
    const employee = [
      c("name", "Employee"),
      c("code", "Employee ID"),
      c("branch", "Branch"),
      c("department", "Department"),
      c("role", "Designation"),
      c("type", "Type"),
      c("date", "Joining date"),
      c("status", "Status"),
    ];
    const staffTask = [
      c("code", "Reference"),
      c("name", "Employee"),
      c("department", "Department"),
      c("role", "Request"),
      c("date", "Submitted"),
      c("owner", "Assigned to"),
      c("status", "Status"),
    ];
    const recruitment =
      sub === "requisitions"
        ? [
            c("code", "Request"),
            c("role", "Position"),
            c("department", "Department"),
            c("owner", "Hiring manager"),
            c("date", "Requested"),
            c("status", "Status"),
          ]
        : sub === "vacancies"
          ? [
              c("code", "Vacancy"),
              c("role", "Position"),
              c("department", "Department"),
              c("branch", "Location"),
              c("date", "Posted"),
              c("stage", "Applications"),
              c("status", "Status"),
            ]
          : sub === "interviews"
            ? [
                c("name", "Candidate"),
                c("role", "Position"),
                c("owner", "Interviewer"),
                c("date", "Interview date"),
                c("stage", "Round"),
                c("status", "Status"),
              ]
            : sub === "offers"
              ? [
                  c("name", "Candidate"),
                  c("role", "Position"),
                  c("value", "Offer amount"),
                  c("date", "Sent"),
                  c("stage", "Response"),
                  c("status", "Status"),
                ]
              : sub === "communications"
                ? [
                    c("code", "Message"),
                    c("name", "Candidate"),
                    c("role", "Template"),
                    c("owner", "Sent by"),
                    c("date", "Date"),
                    c("status", "Status"),
                  ]
                : [
                    c("name", "Candidate"),
                    c("role", "Position"),
                    c("department", "Department"),
                    c("date", "Applied"),
                    c("stage", "Pipeline stage"),
                    c("owner", "Recruiter"),
                    c("status", "Status"),
                  ];
    const leave =
      sub === "allocations"
        ? [
            c("name", "Employee"),
            c("department", "Department"),
            c("role", "Leave type"),
            c("value", "Allocated"),
            c("stage", "Used"),
            c("status", "Available"),
          ]
        : sub === "ledger"
          ? [
              c("code", "Entry"),
              c("name", "Employee"),
              c("role", "Leave type"),
              c("date", "Posting date"),
              c("value", "Change"),
              c("status", "Balance"),
            ]
          : sub === "types"
            ? [
                c("name", "Leave type"),
                c("code", "Code"),
                c("value", "Annual days"),
                c("stage", "Carry-over"),
                c("status", "Status"),
              ]
            : sub === "approval-workflows"
              ? [
                  c("name", "Workflow"),
                  c("department", "Applies to"),
                  c("stage", "Approval steps"),
                  c("owner", "Updated by"),
                  c("status", "Status"),
                ]
              : [
                  c("name", "Employee"),
                  c("branch", "Branch"),
                  c("role", "Leave type"),
                  c("date", "From"),
                  c("endDate", "To"),
                  c("days", "Days"),
                  c("type", "Type"),
                  c("status", "Status"),
                ];
    const attendance =
      sub === "shifts"
        ? [
            c("name", "Shift"),
            c("code", "Shift code"),
            c("date", "Start"),
            c("role", "Working hours"),
            c("stage", "Break"),
            c("status", "Status"),
          ]
        : sub === "holidays"
          ? [
              c("name", "Holiday"),
              c("date", "Date"),
              c("branch", "Location"),
              c("type", "Holiday type"),
              c("status", "Status"),
            ]
          : sub === "shift-assignments"
            ? [
                c("name", "Employee"),
                c("department", "Department"),
                c("role", "Shift"),
                c("date", "Effective from"),
                c("owner", "Assigned by"),
                c("status", "Status"),
              ]
            : sub === "breaks"
              ? [
                  c("name", "Employee"),
                  c("date", "Date"),
                  c("role", "Break window"),
                  c("value", "Duration"),
                  c("branch", "Branch"),
                  c("status", "Status"),
                ]
              : [
                  c("name", "Employee"),
                  c("code", "Employee ID"),
                  c("department", "Department"),
                  c("date", "Date"),
                  c("role", "Check-in"),
                  c("value", "Hours"),
                  c("status", "Status"),
                ];
    const payroll =
      sub === "runs" || sub === ""
        ? [
            c("date", "Period"),
            c("branch", "Branch"),
            c("department", "Department"),
            c("stage", "Employees"),
            c("value", "Total net"),
            c("status", "Status"),
            c("validation", "Validation"),
            c("variance", "Variance"),
            c("payslips", "Payslips"),
            c("locks", "Locks"),
            c("processed", "Processed"),
          ]
        : sub === "salaries"
          ? [
              c("name", "Employee"),
              c("code", "Employee ID"),
              c("department", "Department"),
              c("value", "Monthly gross"),
              c("date", "Effective from"),
              c("status", "Status"),
            ]
          : sub === "structures"
            ? [
                c("name", "Structure"),
                c("code", "Code"),
                c("type", "Pay frequency"),
                c("stage", "Components"),
                c("owner", "Updated by"),
                c("status", "Status"),
              ]
            : sub === "components"
              ? [
                  c("name", "Component"),
                  c("code", "Code"),
                  c("type", "Calculation"),
                  c("value", "Amount / rate"),
                  c("stage", "Tax treatment"),
                  c("status", "Status"),
                ]
              : sub === "settlements"
                ? [
                    c("name", "Employee"),
                    c("code", "Settlement"),
                    c("date", "Last working day"),
                    c("value", "Net settlement"),
                    c("owner", "HR partner"),
                    c("status", "Status"),
                  ]
                : [
                    c("code", "Reference"),
                    c("name", "Employee"),
                    c("role", "Payroll item"),
                    c("date", "Pay period"),
                    c("value", "Amount"),
                    c("owner", "Owner"),
                    c("status", "Status"),
                  ];
    const map: Record<string, Column[]> = {
      employees: employee,
      departments: [
        c("name", "Department"),
        c("code", "Department code"),
        c("owner", "Department head"),
        c("stage", "Team size"),
        c("branch", "Primary location"),
        c("status", "Status"),
      ],
      designations: [
        c("role", "Designation"),
        c("code", "Job code"),
        c("department", "Department"),
        c("stage", "Grade"),
        c("value", "Open positions"),
        c("status", "Status"),
      ],
      recruitment,
      onboarding: [
        c("code", sub === "templates" ? "Template" : "Process"),
        c("name", sub === "templates" ? "Onboarding template" : "New hire"),
        c("department", "Department"),
        c("role", "Checklist"),
        c("owner", "Coordinator"),
        c("date", "Start date"),
        c("status", "Status"),
      ],
      attendance,
      leave,
      payroll,
      benefits: [
        c(
          "name",
          sub === "plans" ? "Plan" : sub === "policies" ? "Policy" : "Employee",
        ),
        c("code", "Reference"),
        c("department", "Department"),
        c("role", "Coverage"),
        c("date", "Effective date"),
        c("value", "Contribution"),
        c("status", "Status"),
      ],
      performance: [
        c("name", "Employee"),
        c("department", "Department"),
        c("role", "Review cycle"),
        c("owner", "Reviewer"),
        c("value", "Rating"),
        c("date", "Due date"),
        c("status", "Status"),
      ],
      separation: [
        c("name", "Employee"),
        c("code", "Case"),
        c("department", "Department"),
        c("date", "Last working day"),
        c("owner", "HR partner"),
        c("stage", "Clearance"),
        c("status", "Status"),
      ],
      services: staffTask,
      workforce: [
        c("name", "Plan"),
        c("department", "Department"),
        c("stage", "Current headcount"),
        c("value", "Target"),
        c("owner", "Plan owner"),
        c("date", "Review date"),
        c("status", "Status"),
      ],
      announcements: [
        c("name", "Announcement"),
        c("type", "Category"),
        c("owner", "Published by"),
        c("date", "Published"),
        c("stage", "Audience"),
        c("status", "Status"),
      ],
      "activity-logs": [
        c("date", "Date & time"),
        c("name", "Activity"),
        c("department", "Module"),
        c("owner", "Performed by"),
        c("code", "Reference"),
        c("status", "Outcome"),
      ],
    };
    if (section === "recruitment") return recruitment;
    if (section === "attendance") return attendance;
    if (section === "leave") return leave;
    if (section === "payroll") return payroll;
    if (section === "onboarding") return map["onboarding"];
    if (section === "benefits") return map["benefits"];
    if (section === "performance") return map["performance"];
    if (section === "separation") return map["separation"];
    return map[section] ?? staffTask;
  }
  private fieldsForPath(path: string): FormField[] {
    const section = path.split("/")[3] ?? "employees";
    const sub = path.split("/")[4] ?? "";
    const text = (label: string, required = true): FormField => ({
      label,
      type: "text",
      required,
    });
    const select = (
      label: string,
      options: string[],
      required = true,
    ): FormField => ({ label, type: "select", required, options });
    const date = (label: string, required = true): FormField => ({
      label,
      type: "date",
      required,
    });
    const area = (label: string): FormField => ({
      label,
      type: "textarea",
      wide: true,
    });
    const fields: Record<string, FormField[]> = {
      employees: [
        text("Full name"),
        { label: "Work email", type: "email", required: true },
        text("Employee code"),
        select("Department", departments),
        text("Designation"),
        select("Branch", branches),
        select("Employment type", [
          "Full-time",
          "Part-time",
          "Contract",
          "Intern",
        ]),
        date("Joining date"),
        text("Reporting manager", false),
        text("Phone number", false),
      ],
      departments: [
        text("Department name"),
        text("Department code"),
        text("Department head"),
        select("Branch", branches),
        text("Cost center", false),
        area("Department purpose"),
      ],
      designations: [
        text("Designation title"),
        text("Job code"),
        select("Department", departments),
        select("Career level", [
          "Associate",
          "Specialist",
          "Lead",
          "Manager",
          "Director",
        ]),
        text("Reports to", false),
        area("Role summary"),
      ],
      recruitment:
        sub === "requisitions"
          ? [
              text("Position title"),
              select("Department", departments),
              text("Hiring manager"),
              { label: "Number of openings", type: "number", required: true },
              select("Priority", ["Standard", "High", "Critical"]),
              date("Target start date"),
              area("Business justification"),
            ]
          : sub === "vacancies"
            ? [
                text("Vacancy title"),
                text("Requisition reference"),
                select("Department", departments),
                select("Employment type", [
                  "Full-time",
                  "Part-time",
                  "Contract",
                  "Intern",
                ]),
                text("Work location"),
                { label: "Number of openings", type: "number", required: true },
                area("Job description"),
              ]
            : [
                text("Candidate name"),
                { label: "Email address", type: "email", required: true },
                text("Phone number", false),
                text("Position applied for"),
                select("Pipeline stage", [
                  "New",
                  "Screening",
                  "Interview",
                  "Offer",
                  "Hired",
                ]),
                text("Recruiter"),
                area("Notes"),
              ],
      attendance:
        sub === "shifts"
          ? [
              text("Shift name"),
              text("Shift code"),
              { label: "Start time", type: "time", required: true },
              { label: "End time", type: "time", required: true },
              { label: "Break duration (minutes)", type: "number" },
              select("Applies to", ["All employees", ...departments]),
              area("Shift notes"),
            ]
          : [
              text("Employee"),
              date("Attendance date"),
              { label: "Check-in time", type: "time" },
              { label: "Check-out time", type: "time" },
              select("Reason", [
                "Correction",
                "Manual entry",
                "Absence review",
                "Other",
              ]),
              area("Comment"),
            ],
      leave:
        sub === "types"
          ? [
              text("Leave type"),
              text("Type code"),
              {
                label: "Annual allocation (days)",
                type: "number",
                required: true,
              },
              select("Accrual schedule", ["Monthly", "Annual", "Manual"]),
              { label: "Carry-over limit", type: "number" },
              area("Policy description"),
            ]
          : [
              text("Employee"),
              select("Leave type", [
                "Annual Leave",
                "Medical Leave",
                "Personal Leave",
                "Parental Leave",
              ]),
              date("From date"),
              date("To date"),
              select("Approval route", [
                "Line manager",
                "Manager and HR",
                "HR review",
              ]),
              area("Reason / supporting notes"),
            ],
      payroll:
        sub === "components"
          ? [
              text("Component name"),
              text("Component code"),
              select("Calculation type", [
                "Fixed amount",
                "Percentage",
                "Formula",
              ]),
              { label: "Amount or rate", type: "number", required: true },
              select("Tax treatment", [
                "Taxable",
                "Non-taxable",
                "Depends on policy",
              ]),
              area("Component description"),
            ]
          : sub === "structures"
            ? [
                text("Structure name"),
                text("Structure code"),
                select("Pay frequency", ["Monthly", "Bi-weekly", "Weekly"]),
                select("Currency", ["BDT"]),
                area("Included components"),
              ]
            : [
                text("Employee"),
                select("Payroll period", [
                  "September 2026",
                  "August 2026",
                  "July 2026",
                ]),
                select("Pay group", [
                  "Monthly staff",
                  "Hourly staff",
                  "Contractors",
                ]),
                date("Payment date"),
                text("Approval owner"),
                area("Payroll notes"),
              ],
      onboarding: [
        text("Employee / new hire"),
        text("Role"),
        select("Department", departments),
        date("Start date"),
        text("Onboarding coordinator"),
        select("Template", [
          "Corporate onboarding",
          "Manager onboarding",
          "Remote employee",
        ]),
        area("Notes"),
      ],
      benefits: [
        text("Plan name"),
        select("Benefit type", [
          "Health",
          "Retirement",
          "Wellness",
          "Family support",
        ]),
        date("Effective date"),
        text("Provider"),
        { label: "Employer contribution", type: "number" },
        area("Coverage details"),
      ],
      performance: [
        text("Review cycle name"),
        date("Start date"),
        date("Due date"),
        select("Review type", ["Annual", "Mid-year", "Probation"]),
        select("Participants", ["All employees", ...departments]),
        area("Guidance for reviewers"),
      ],
      separation: [
        text("Employee"),
        select("Separation type", [
          "Resignation",
          "Retirement",
          "End of contract",
          "Other",
        ]),
        date("Notice date"),
        date("Last working day"),
        text("HR partner"),
        area("Exit notes"),
      ],
      services: [
        text("Request title"),
        select("Service category", [
          "Employment letter",
          "Payroll support",
          "Benefits support",
          "Personal data update",
        ]),
        text("Requested for"),
        select("Priority", ["Normal", "High"]),
        area("Request details"),
      ],
      default: [
        text("Name"),
        text("Reference code"),
        select("Department", departments),
        date("Effective date"),
        select("Status", ["Draft", "Active", "Inactive"]),
        area("Notes"),
      ],
    };
    return fields[section] ?? fields["default"];
  }
}
