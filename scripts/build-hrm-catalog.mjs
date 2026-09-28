import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ledger = JSON.parse(
  readFileSync(path.join(root, "coverage-ledger.json"), "utf8"),
);
const navigation = JSON.parse(
  readFileSync(path.join(root, "dist", "navigation.json"), "utf8"),
);
const isEmployeeSelfServiceRoute = (route) =>
  route.path === "/app/hrm/me" || route.path.startsWith("/app/hrm/me/");
const managementRoutes = ledger.routes.filter(
  (route) => route.app === "hrm" && !isEmployeeSelfServiceRoute(route),
);
const selfServiceRoutes = ledger.routes.filter(
  (route) => route.app === "hrm" && isEmployeeSelfServiceRoute(route),
);

if (managementRoutes.length !== 138 || selfServiceRoutes.length !== 29) {
  throw new Error(
    `Unexpected HRM route inventory: ${managementRoutes.length} management, ${selfServiceRoutes.length} self-service.`,
  );
}

const navGroups = (navigation.hrm ?? []).map((group) => ({
  title: group.title || "Workspace",
  entries: group.entries
    .filter(
      (entry) =>
        entry.path.startsWith("/app/hrm/") &&
        !entry.path.startsWith("/app/hrm/me/"),
    )
    .map((entry) => ({ path: entry.path, label: entry.label })),
}));

const aliases = {
  "/app/hrm": "/app/hrm/home",
  "/app/hrm/recruitment": "/app/hrm/recruitment/overview",
  "/app/hrm/onboarding": "/app/hrm/onboarding/home",
  "/app/hrm/separation": "/app/hrm/separation/home",
  "/app/hrm/attendance": "/app/hrm/attendance/dashboard",
  "/app/hrm/leave": "/app/hrm/leave/requests",
  "/app/hrm/payroll": "/app/hrm/payroll/runs",
  "/app/hrm/performance/cycles": "/app/hrm/performance/cycles/overview",
};

const groupTitles = {
  "activity-logs": "Audit & Compliance",
  analytics: "Analytics",
  announcements: "People & Organization",
  attendance: "Time & Attendance",
  benefits: "Benefits & Rewards",
  "business-flow-guide": "Guides",
  departments: "People & Organization",
  designations: "People & Organization",
  employees: "People & Organization",
  "enterprise-controls": "Administration",
  home: "Overview",
  leave: "Leave Management",
  lifecycle: "Employee Operations",
  onboarding: "Onboarding",
  payroll: "Payroll & Compensation",
  performance: "Performance & Appraisal",
  recruitment: "Recruitment",
  separation: "Separation & Alumni",
  services: "Employee Services",
  "user-guide": "Guides",
  workforce: "Workforce Planning",
};
const titleFromPath = (routePath) =>
  routePath
    .split("/")
    .filter(Boolean)
    .at(-1)
    .replace(/^:\w+$/, "Record")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const menuLabels = new Map(
  navGroups.flatMap((group) =>
    group.entries.map((entry) => [entry.path, entry.label]),
  ),
);
const routes = managementRoutes.map((route) => {
  const segments = route.path.split("/").filter(Boolean);
  const section = segments[2] || "home";
  const last = segments.at(-1);
  const kind =
    /^(new|edit|bulk|manual-entry|auto-mark-absence)$/.test(last) ||
    route.path.endsWith("/edit")
      ? "form"
      : route.path.includes("/:") && !route.path.endsWith("/:id/edit")
        ? "detail"
        : /dashboard|overview|home|executive$/.test(route.path) ||
            route.path === "/app/hrm/workforce"
          ? "overview"
          : /reports|analytics/.test(route.path)
            ? "report"
            : "list";
  const exactAlias = aliases[route.path] ?? null;
  return {
    path: route.path,
    title: menuLabels.get(route.path) ?? titleFromPath(route.path),
    group: groupTitles[section] ?? "HR Management",
    section,
    kind: exactAlias ? "alias" : kind,
    aliasTo: exactAlias,
    source: route.source,
  };
});

const assetRoot = path.join(root, "hrm-mock", "src", "assets");
mkdirSync(assetRoot, { recursive: true });
writeFileSync(
  path.join(assetRoot, "hrm-routes.json"),
  JSON.stringify({ routes }, null, 2) + "\n",
);
writeFileSync(
  path.join(assetRoot, "hrm-navigation.json"),
  JSON.stringify(navGroups, null, 2) + "\n",
);
console.log(
  `Prepared ${routes.length} HRM management routes and ${navGroups.length} navigation groups.`,
);
