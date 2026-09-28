import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (name) =>
  JSON.parse(readFileSync(resolve(root, "dist", name), "utf8"));
const catalog = read("catalog.json");
const schema = {
  ...read("page-schema.json"),
  ...read("page-schema-extra.json"),
};
const extraTemplates = {
  ...read("source-templates-more.json"),
  ...read("source-templates-missing.json"),
};
const groups = {
  ecommerce: "Commerce group",
  catalog: "Commerce group",
  inventory: "Commerce group",
  procurement: "Commerce group",
  "payment-management": "Commerce group",
  finance: "Commerce group",
  hrm: "People and work",
  crm: "People and work",
  "task-management": "People and work",
  "workflow-management": "People and work",
  "employee-self-service": "People and work",
  "school-management": "Education",
  "training-institute-management": "Education",
  "student-self-service": "Education",
  "teacher-self-service": "Education",
  "tenant-management": "Administration",
  "tenant-admin": "Administration",
  "company-admin": "Administration",
  "user-management": "Administration",
  "document-management": "Services",
  "email-management": "Services",
  "event-management": "Services",
  "notification-management": "Services",
  "reporting-management": "Services",
  "storage-management": "Services",
  "garments-merchandising": "Garments",
  "garments-buyer-portal": "Garments",
};
const seen = new Set();
const designed = (path) =>
  [
    "/app/ecommerce/pos",
    "/app/ecommerce/home",
    "/app/ecommerce/orders/queue",
    "/app/ecommerce/orders/:id",
    "/app/catalog",
    "/app/catalog/home",
    "/app/catalog/products",
    "/app/ecommerce/products",
    "/app/catalog/products/:id",
    "/app/ecommerce/products/:id",
    "/app/catalog/product-types",
    "/app/catalog/categories",
    "/app/catalog/brands",
    "/app/catalog/pricing-rules",
    "/app/catalog/pricing-rules/new",
    "/app/catalog/pricing-rules/:id",
    "/app/catalog/pricing-rules/:id/edit",
    "/app/catalog/coupons",
    "/app/catalog/promotions",
    "/app/catalog/tax-classes",
    "/app/catalog/tax-classes/new",
    "/app/catalog/tax-classes/:id",
    "/app/catalog/tax-classes/:id/edit",
    "/app/catalog/tax-rules",
    "/app/catalog/tax-rules/new",
    "/app/catalog/tax-rules/:id",
    "/app/catalog/tax-rules/:id/edit",
    "/app/catalog/tax-hs-code-mappings",
    "/app/inventory/home",
    "/app/inventory/workspace",
    "/app/inventory/workspace/overview",
    "/app/inventory/workspace/balances",
    "/app/inventory/workspace/online-stock",
    "/app/inventory/workspace/ledger",
    "/app/inventory/products/:productId",
    "/app/inventory/stock-card",
    "/app/procurement/home",
    "/app/procurement/suppliers",
    "/app/procurement/suppliers/new",
    "/app/procurement/suppliers/:id",
    "/app/procurement/suppliers/:id/edit",
    "/app/payment-management",
    "/app/payment-management/overview",
    "/app/payment-management/transactions",
    "/app/payment-management/method",
    "/app/payment-management/methods",
    "/app/payment-management/reconciliation",
    "/app/payment-management/reconciliation/review",
    "/app/payment-management/reconciliation/history",
    "/app/payment-management/reconciliation/runs/:runId",
    "/app/payment-management/refund-approvals",
    "/app/payment-management/links",
    "/app/payment-management/settlements",
    "/app/payment-management/disputes",
    "/app/payment-management/ledger",
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
  ].includes(path) ||
  /^\/app\/(?:catalog|ecommerce)\/products\/(?:new|:id\/edit)(?:\/|$)/.test(
    path,
  );
const routes = catalog.routes
  .filter((route) => {
    const key = `${route.code}:${route.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .map((route) => ({
    app: route.code,
    group: groups[route.code],
    path: route.path,
    source: route.source || null,
    existingPreview: designed(route.path)
      ? "designed"
      : extraTemplates[route.path]
        ? "source-template"
        : schema[route.path]
          ? "source-schema"
          : "unclassified",
    implementationStatus: designed(route.path) ? "complete" : "not-started",
    contentAudited: designed(route.path),
    designReviewed: designed(route.path),
    dataReviewed: designed(route.path),
    statesReviewed: [],
    notes:
      route.path === "/app/catalog"
        ? "Alias to the Products workspace."
        : route.path === "/app/catalog/home"
          ? "Legacy Home route renders the Products workspace."
          : route.path === "/app/inventory/home"
            ? "Source route redirects to Inventory workspace."
            : route.path === "/app/inventory/workspace"
              ? "Source route opens the Overview tab."
              : route.path === "/app/payment-management"
                ? "Source route redirects to Payment overview."
                : route.path === "/app/payment-management/method"
                  ? "Source route redirects to Payment methods."
                  : route.path === "/app/catalog/tax-hs-code-mappings"
                    ? "Angular source includes this route; added under Tax and VAT in the mock navigation."
                    : "",
  }));
writeFileSync(
  resolve(root, "coverage-ledger.json"),
  JSON.stringify(
    {
      purpose:
        "Route-by-route design rollout ledger; catalog routes are candidates until reconciled with IIS and source.",
      appCount: catalog.apps.length,
      routeCount: routes.length,
      routes,
    },
    null,
    2,
  ) + "\n",
);
