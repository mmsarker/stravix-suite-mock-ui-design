import { Component } from "@angular/core";
import { Routes, UrlMatcher } from "@angular/router";
import { MockPageComponent } from "./mock-page.component";
import { EducationPageComponent } from "./education-page.component";

const legacyRoutes = new Set([
  "/app/procurement/home",
  "/app/procurement/suppliers",
  "/app/procurement/suppliers/new",
  "/app/finance/home",
  "/app/finance/accounts",
  "/app/finance/accounts/new",
  "/app/finance/accounts/:id",
  "/app/finance/accounts/:id/edit",
  "/app/finance/periods",
  "/app/finance/periods/:id",
  "/app/finance/period-close",
  "/app/finance/journals",
  "/app/finance/journals/recurring",
]);

const procurementMatcher: UrlMatcher = (segments) => {
  if (segments[0]?.path !== "app" || segments[1]?.path !== "procurement")
    return null;
  const path = `/app/procurement/${segments
    .slice(2)
    .map((segment) => segment.path)
    .join("/")}`.replace(/\/$/, "");
  if (
    legacyRoutes.has(path) ||
    /^\/app\/procurement\/suppliers(?:\/|$)/.test(path)
  )
    return null;
  return { consumed: segments };
};

const financeMatcher: UrlMatcher = (segments) => {
  if (segments[0]?.path !== "app" || segments[1]?.path !== "finance")
    return null;
  const path = `/app/finance/${segments
    .slice(2)
    .map((segment) => segment.path)
    .join("/")}`.replace(/\/$/, "");
  if (legacyRoutes.has(path)) return null;
  if (
    path !== "/app/finance" &&
    !/^\/app\/finance\/(?:user-guide|system-detail|receivables|education-billing|payables|banking|reconciliation|reports|integrations|settings|cost-centers|vds|partners|fixed-assets|budgets)(?:\/|$)/.test(
      path,
    )
  )
    return null;
  return { consumed: segments };
};

const educationMatcher: UrlMatcher = (segments) => {
  if (segments[0]?.path !== "app") return null;
  if (segments[1]?.path === "admissions" && segments[2]?.path === "apply")
    return { consumed: segments };
  if (
    !["school-management", "guardian", "training-institute"].includes(
      segments[1]?.path ?? "",
    )
  )
    return null;
  return { consumed: segments };
};

@Component({ standalone: true, template: "", styles: [":host{display:none}"] })
class LegacyPassThroughComponent {}

export const routes: Routes = [
  { path: "app/finance", redirectTo: "app/finance/home", pathMatch: "full" },
  { matcher: procurementMatcher, component: MockPageComponent },
  { matcher: financeMatcher, component: MockPageComponent },
  { matcher: educationMatcher, component: EducationPageComponent },
  { path: "**", component: LegacyPassThroughComponent },
];
