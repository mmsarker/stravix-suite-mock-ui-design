const commerceQuickAccess = [
  ["Products", "Catalog, inventory & variants", "/app/catalog/products", "▣"],
  ["Categories", "Hierarchy & display order", "/app/catalog/categories", "▤"],
  ["Product Types", "Dropdown values for product setup", "/app/catalog/product-types", "◧"],
  ["Suppliers", "Vendor records and sourcing links", "/app/procurement/suppliers", "♧"],
  ["Orders", "Status updates, refunds & tracking", "/app/ecommerce/orders/queue", "▥"],
  ["POS", "In-store checkout for branch sales", "/app/ecommerce/pos", "◈"],
  ["Branches", "Branches, facilities, and inventory availability", "/app/inventory/branches", "⌘"],
  ["Inventory", "Balances, reservations and movement ledger", "/app/inventory/workspace", "▦"],
  ["Customers", "Profiles, block & unblock", "/app/ecommerce/customers", "♙"],
  ["Payments", "Transaction history & records", "/app/ecommerce/payments", "◇"],
  ["Coupons", "Discount codes & promotions", "/app/catalog/pricing-rules", "✧"],
  ["Reports", "Sales analytics & low stock alerts", "/app/ecommerce/reports", "▥"],
  ["Store Settings", "Currency, tax, shipping & branding", "/app/ecommerce/settings", "⚙"],
  ["Activity Logs", "Admin action audit trail", "/app/ecommerce/activity-logs", "◷"]
];

function renderCommerceHome(){
  const metrics=[
    ["Today Sales","৳ 1,284.60","+12.8% from yesterday"],
    ["Today Orders","18","4 awaiting review"],
    ["Pending Orders","4","Needs your attention"],
    ["Paid Unfulfilled","3","Ready for dispatch"],
    ["Finance Failed","1","Payment review needed"],
    ["Open POS Sessions","2","Downtown · North Branch"]
  ];
  const chart=[42,58,48,73,64,86,100];
  const days=["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
  return `<div class="commerce-home-mock">
    <header class="commerce-home-hero"><div class="commerce-home-hero-main"><span class="eyebrow">COMMERCE MANAGEMENT WORKSPACE</span><h1>Stravix Group BD</h1><p>Manage products, suppliers, locations, POS orders, customers, reports and store settings from one place.</p><div class="commerce-home-hero-tags"><span><small>ORGANIZATION</small>Stravix Group BD</span><span><small>LOW STOCK</small><strong>3 items need review</strong></span></div></div><div class="commerce-home-hero-side"><span class="commerce-home-side-label">Today at a glance</span><strong>৳ 1,284.60</strong><span>18 orders across 2 locations</span><a href="#/app/ecommerce/reports">View sales report <span aria-hidden="true">↗</span></a></div></header>
    <div class="commerce-home-metrics" aria-label="Commerce dashboard metrics">${metrics.map(([label,value,context],i)=>`<article class="commerce-home-metric ${i===0?"featured":""}"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(context)}</small></article>`).join("")}</div>
    <div class="commerce-home-focus-grid"><section class="commerce-home-card commerce-home-queue"><div class="commerce-home-card-head"><div><span class="eyebrow">Priorities</span><h2>Action Queue</h2></div><span class="commerce-home-count">3 active</span></div><div class="commerce-home-queue-items"><a href="#/app/ecommerce/orders/queue"><span class="commerce-home-queue-icon">▥</span><span><strong>4 pending orders</strong><small>Review and confirm customer orders</small></span><b>↗</b></a><a href="#/app/ecommerce/orders/all-sales"><span class="commerce-home-queue-icon">↗</span><span><strong>3 paid, unfulfilled sales</strong><small>Prepare orders for dispatch</small></span><b>↗</b></a><a href="#/app/ecommerce/payments"><span class="commerce-home-queue-icon attention">!</span><span><strong>1 failed payment</strong><small>Check the latest transaction</small></span><b>↗</b></a></div></section>
    <section class="commerce-home-card commerce-home-sales"><div class="commerce-home-card-head"><div><span class="eyebrow">Performance</span><h2>Sales Snapshot</h2></div><span class="commerce-home-period">Last 7 days</span></div><div class="commerce-home-sales-total"><strong>৳ 8,746.40</strong><span>126 orders</span></div><div class="commerce-home-chart" role="img" aria-label="Seven-day sales trend: Saturday 42 percent, Sunday 58, Monday 48, Tuesday 73, Wednesday 64, Thursday 86, Friday 100">${chart.map((height,i)=>`<div class="commerce-home-bar"><span style="height:${height}%"></span><small>${days[i]}</small></div>`).join("")}</div></section></div>
    <section class="commerce-home-card commerce-home-stock"><div class="commerce-home-card-head"><div><span class="eyebrow">Stock health</span><h2>Low Stock Preview</h2></div><a href="#/app/inventory/workspace">3 total <span aria-hidden="true">↗</span></a></div><div class="commerce-home-stock-grid"><div><span class="stock-initial">LW</span><span><strong>Linen Weekend Set</strong><small>APP-2074 · North Branch</small></span><b>5 left</b></div><div><span class="stock-initial">OS</span><span><strong>Office Starter Bundle</strong><small>BND-3011 · Downtown Store</small></span><b>4 left</b></div><div><span class="stock-initial">CD</span><span><strong>Classic Denim Jacket</strong><small>APP-1280 · Downtown Store</small></span><b>7 left</b></div></div></section>
    <section class="commerce-home-access"><div class="commerce-home-card-head"><div><span class="eyebrow">Navigation</span><h2>Quick Access</h2><p>Jump into any module</p></div></div><div class="commerce-home-access-grid">${commerceQuickAccess.map(([name,description,path,symbol])=>`<a href="#${path}"><span class="quick-symbol" aria-hidden="true">${symbol}</span><span><strong>${esc(name)}</strong><small>${esc(description)}</small></span><b aria-hidden="true">↗</b></a>`).join("")}</div></section>
  </div>`;
}
