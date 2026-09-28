const $=s=>document.querySelector(s);
const root=$("#app");
let catalog={apps:[],routes:[]}, navigation={}, pageSchema={}, extraTemplates={}, activeAction="", activeOverlayHTML="", activeOverlayClass="", query="", pageQuery="", drawer="", menuOpen=false, notice="";
let brand="corporate-blue",navMode="light",reviewOpen=false;
const mockStates=["populated","empty","loading","error","validation","success","forbidden"];
const stateOf=()=>{const params=new URLSearchParams((location.hash.split("?")[1]||""));const state=params.get("mockState")||"populated";return mockStates.includes(state)?state:"populated"};
const stateHref=state=>{const [path,search=""]=location.hash.slice(1).split("?");const params=new URLSearchParams(search);state==="populated"?params.delete("mockState"):params.set("mockState",state);return "#"+(path||"/app/dashboard")+(params.size?"?"+params:"")};
const symbols={"Education":"▤","Finance & Commerce":"◈","People & Work":"♙","Communication & Content":"◫","Garments":"▥","Platform Administration":"✦","Self Service":"◇"};
const groupOrder=["Education","Finance & Commerce","People & Work","Communication & Content","Garments","Platform Administration","Self Service"];
const fullSites={"hrm":"https://stravix-hrm.arisha-1983.chatgpt.site","student-self-service":"https://stravix-student-portal.arisha-1983.chatgpt.site"};
const nameMap={"hrm":"HR","crm":"CRM","lms":"LMS","rfq":"RFQ","po":"PO","sku":"SKU","kpi":"KPI","id":"ID","me":"My","api":"API","gl":"GL"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const title=s=>String(s||"").replace(/[:]/g,"").split(/[-_/]/).filter(Boolean).map(x=>nameMap[x.toLowerCase()]||x[0].toUpperCase()+x.slice(1)).join(" ");
const pathOf=()=>{const p=decodeURI(location.hash.slice(1)||"/app/dashboard").split("?")[0];return p==="/app/school-management"?"/app/school-management/home":p};
const appForPath=p=>catalog.apps.find(a=>p===a.url||p.startsWith(a.url.replace(/\/(home|dashboard|methods|users|profile)$/,"")+"/"))||catalog.apps.find(a=>catalog.routes.some(r=>r.code===a.code&&r.path===p)||(navigation[a.code]||[]).some(g=>g.entries.some(e=>e.path===p)))||null;
const routesFor=app=>catalog.routes.filter(r=>r.code===app.code).filter((r,i,all)=>all.findIndex(x=>x.path===r.path)===i);
const labelFor=(r,app)=>{let seg=r.path.replace(app.url.replace(/\/(home|dashboard|methods|users|profile)$/,""),"").split("/").filter(Boolean);return seg.length?title(seg.at(-1)):app.name};
const routeLink=p=>"#"+p;
function applyTheme(){document.documentElement.dataset.mode="light";document.documentElement.dataset.brand="corporate-blue";document.documentElement.dataset.nav="light"}
applyTheme();
function getPage(){let p=pathOf();if(p==="/app/dashboard"||p==="/")return {p,app:null,route:null};let app=appForPath(p);return {p,app,route:app?routesFor(app).find(r=>r.path===p):null}}
function sidebar(current,p){
  if(!current)return "";
  const configured=navigation[current.code]||[];
  const groups=configured;
  const sections=groups.map((group,index)=>{
    let entries=group.entries.filter(e=>e.path&&e.label);
    let active=entries.some(e=>e.path===p);
    const links=entries.map(e=>`<a class="rail-link ${e.path===p?"active":""}" href="${routeLink(e.path)}" title="${esc(e.path)}"><span class="rail-app-name">${esc(e.label)}</span></a>`).join("");
    if(!group.title)return `<div class="rail-group-links rail-standalone">${links}</div>`;
    if(group.collapsible===false)return `<div class="rail-group rail-static"><div class="rail-group-title">${esc(group.title)}</div><div class="rail-group-links">${links}</div></div>`;
    return `<details class="rail-group" ${active||index===0?"open":""}><summary>${esc(group.title)}</summary><div class="rail-group-links">${links}</div></details>`;
  }).join("");
  return `<aside class="rail app-rail" aria-label="${esc(current.name)} navigation">
    <a href="#/app/dashboard" class="brand"><span class="brand-mark">S</span><span><strong>stravix</strong><span>SUITE · WORKSPACE</span></span></a>
    <div class="rail-app-header"><a href="#/app/dashboard" class="back-link">← &nbsp; All applications</a><span class="rail-app-icon">${esc(current.name.split(/\s|&/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase())}</span><strong>${esc(current.name)}</strong><small>${esc(current.category)}</small></div>
    <nav class="rail-section" aria-label="${esc(current.name)} pages">${sections}</nav>
    <div class="rail-bottom"><small>Stravix Suite · design workspace</small></div>
  </aside>`;
}
function topbar(app,route){
  let label=app?app.name:"Applications",r=route&&route.path!==app?.url?labelFor(route,app):null;
  return `<header class="topbar">
    <div class="crumbs"><button class="top-btn mobile-menu" data-action="menu" aria-label="Open navigation">☰</button><a class="topbrand" href="#/app/dashboard"><span class="topbrand-mark">S</span><span>stravix <b>suite</b></span></a>${app?`<span>›</span><strong>${esc(label)}</strong>`:""}${r?`<span>›</span><strong>${esc(r)}</strong>`:""}</div>
    <div class="top-actions"><span class="tenant-label"><span class="tenant-indicator"></span>Stravix Demo Group</span><button class="top-btn review-trigger" data-action="review-toggle" aria-expanded="${reviewOpen}" aria-label="Open design review controls">Review states</button><span class="avatar" title="Workspace user">SS</span></div>
  </header>`;
}
function dashboard(){
  let q=query.toLowerCase().trim(),matching=catalog.apps.filter(a=>(a.name+" "+a.category+" "+a.code).toLowerCase().includes(q));
  return `<main class="main dashboard-main"><div class="dashboard-hero"><div class="dashboard-hero-copy"><span class="hero-kicker">STRAVIX SUITE / WORKSPACE</span><h1>Good morning, Mizan<span class="hero-period">.</span></h1><p>Your applications, organized for the work ahead.</p><div class="hero-meta"><span>Friday, 25 September 2026</span><span>${catalog.apps.length} connected workspaces</span></div></div><div class="hero-graphic" aria-hidden="true"><span class="hero-orbit orbit-one"></span><span class="hero-orbit orbit-two"></span><span class="hero-monogram">S</span></div></div><div class="dashboard-head"><div><span class="eyebrow">Workspace directory</span><h2 class="page-title">Applications <span class="app-total">${catalog.apps.length}</span></h2><p class="subtle">Explore your operational tools and services.</p></div><label class="search-box"><span aria-hidden="true">⌕</span><input id="app-search" aria-label="Find an application" placeholder="Search applications…" value="${esc(query)}"></label></div>${matching.length?groupOrder.map(g=>{let apps=matching.filter(a=>a.category===g);if(!apps.length)return "";return `<section class="category"><div class="category-head"><h2>${esc(g)}</h2><span>${apps.length} ${apps.length===1?"app":"apps"}</span></div><div class="app-grid">${apps.map(a=>`<a class="app-card" href="${routeLink(a.url)}"><div class="app-card-top"><span class="app-icon">${esc(a.name.split(/\s|&/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase())}</span><span class="app-arrow" aria-hidden="true">↗</span></div><h3>${esc(a.name)}</h3><p>${esc(a.category)}</p></a>`).join("")}</div></section>`}).join(""):`<div class="empty">No applications match “${esc(query)}”.</div>`}</main>`;
}
function reviewPanel(){const state=stateOf();return `<aside class="review-panel ${reviewOpen?"is-open":""}" aria-label="Design review controls" ${reviewOpen?"":"hidden"}><div class="review-panel-head"><div><span class="eyebrow">Design review</span><h2>Preview states</h2></div><button class="top-btn" data-action="review-toggle" aria-label="Close design review controls">✕</button></div><p>Switch between sample conditions. Copy the URL to share this exact screen.</p><div class="review-state-list">${mockStates.map(s=>`<a href="${stateHref(s)}" class="review-state ${state===s?"active":""}" ${state===s?'aria-current="true"':""}>${esc(title(s))}</a>`).join("")}</div><div class="review-panel-actions"><button class="btn" data-action="copy-review-url">Copy preview link</button></div></aside>`}
function reviewStateMarkup(state){if(state==="populated")return "";const content={empty:["No records yet","Records added to this workspace will appear here."],loading:["Loading workspace","Fetching the latest sample view…"],error:["Unable to load this view","The sample service is temporarily unavailable. Try again."],validation:["Review required fields","Some information needs attention before this action can continue."],success:["Changes saved","The sample action completed successfully."],forbidden:["Access restricted","Your sample role does not have permission to view this content."]}[state];return `<section class="review-state-surface review-${state}" role="status"><span class="review-state-glyph" aria-hidden="true">${state==="success"?"✓":state==="error"?"!":state==="loading"?"◌":"◇"}</span><div><span class="eyebrow">${esc(title(state))} state</span><h2>${esc(content[0])}</h2><p>${esc(content[1])}</p></div>${state==="error"?'<a class="btn primary" href="'+stateHref("populated")+'">Retry preview</a>':""}</section>`}
function routeGroups(routes,app){let map=new Map;for(let r of routes){let prefix=r.path.replace(app.url.replace(/\/(home|dashboard|methods|users|profile)$/,""),"").split("/").filter(Boolean)[0]||"Overview";let k=title(prefix);if(!map.has(k))map.set(k,[]);map.get(k).push(r)}return [...map]}
function workspace(app,route,p){
  let routes=routesFor(app),current=route||routes.find(r=>r.path===app.url)||routes[0];
  let navEntry=(navigation[app.code]||[]).flatMap(g=>g.entries).find(e=>e.path===p);
  let heading=navEntry?.label||((current&&current.path!==app.url)?labelFor(current,app):app.name);
  let type=/dashboard|home|overview/i.test(p)?"overview":/new|create|edit|settings|configuration/i.test(p)?"form":/guide|manual|docs/i.test(p)?"guide":/analytics|reports|insights/i.test(p)?"insights":"listing";
  let visible=routes.filter(r=>(r.path+" "+labelFor(r,app)).toLowerCase().includes(pageQuery.toLowerCase().trim()));
  let allPages=p.endsWith("/all-pages");
  const hasOwnHeader=Boolean(pageSchema[p]||extraTemplates[p]||p==="/app/tenant-admin/branding"||/^\/app\/catalog\/(?:home|product-types|categories|brands|pricing-rules|tax-classes|tax-rules|tax-hs-code-mappings|promotions|coupons)(?:\/|$)/.test(p)||/^\/app\/ecommerce\/orders\/ORD-\d+$/.test(p)||/^\/app\/(?:catalog|ecommerce)\/products\/(?:new(?:\/|$)|[A-Z]+-\d+(?:\/|$))/.test(p)||/^\/app\/inventory\/(?:home|workspace(?:\/|$)|products\/[A-Z]+-\d+$|stock-card$)/.test(p)||/^\/app\/procurement\/(?:home|suppliers(?:\/|$))/.test(p)||/^\/app\/payment-management(?:\/(?:overview|transactions|methods?|reconciliation(?:\/.*)?|refund-approvals|links|settlements|disputes|ledger))?$/.test(p)||/^\/app\/finance\/(?:home|accounts(?:\/.*)?|periods(?:\/.*)?|period-close|journals(?:\/recurring)?)$/.test(p));
  const state=stateOf();
  return `<main class="main app-main">${hasOwnHeader?"":`<div class="workspace-heading"><div><span class="eyebrow">${esc(app.category)} / ${esc(app.name)}</span><h1 class="page-title">${esc(heading)}</h1></div></div>`}<section class="work-area">${reviewStateMarkup(state)}<div class="${state==="populated"?"":"review-original-content"}">${pageContent(app,current,p,type,visible,allPages)}</div></section></main>`;
}
function pageContent(app,route,p,type,visible,allPages){
  if(p==="/app/catalog")return renderCatalogProducts();
  if(p.startsWith("/app/catalog/")&&!/^\/app\/catalog\/products(?:\/|$)/.test(p))return renderCatalogManagement(p);
  if(p==="/app/finance/home")return renderFinanceHome();
  if(p==="/app/finance/accounts")return renderFinanceAccounts();
  if(/^\/app\/finance\/accounts\/(?:new|[A-Z]+-\d+(?:\/edit)?)$/.test(p))return renderFinanceAccountRecord(p);
  if(p==="/app/finance/periods")return renderFinancePeriods();
  if(/^\/app\/finance\/periods\/FY-\d+$/.test(p))return renderFinancePeriodDetail(p.split('/').at(-1));
  if(p==="/app/finance/period-close")return renderFinancePeriodClose();
  if(p==="/app/finance/journals")return renderFinanceJournals();
  if(p==="/app/finance/journals/recurring")return renderFinanceRecurringJournals();
  if(p==="/app/tenant-admin/branding")return renderBrandingPage();
  if(p==="/app/ecommerce/home")return renderCommerceHome();
  if(/^\/app\/inventory\/(?:home|workspace(?:\/(?:overview|balances|online-stock|ledger))?)$/.test(p))return renderInventoryWorkspace(p);
  if(/^\/app\/inventory\/products\/[A-Z]+-\d+$/.test(p))return renderInventoryProductDetail(p.split('/').at(-1));
  if(p==="/app/inventory/stock-card")return renderInventoryStockCard();
  if(p==="/app/procurement/home")return renderProcurementHome();
  if(p==="/app/procurement/suppliers")return renderProcurementSuppliers();
  if(/^\/app\/procurement\/suppliers\/(?:new|SUP-\d+(?:\/edit)?)$/.test(p))return renderProcurementSupplierRecord(p);
  if(p==="/app/payment-management/overview"||p==="/app/payment-management")return renderPaymentOverview();
  if(p==="/app/payment-management/transactions")return renderPaymentTransactions(p);
  if(p==="/app/payment-management/method"||p==="/app/payment-management/methods")return renderPaymentMethods();
  if(/^\/app\/payment-management\/reconciliation(?:\/(?:review|history|runs\/RUN-\d+))?$/.test(p))return renderPaymentReconciliation(p);
  if(p==="/app/payment-management/refund-approvals")return renderPaymentRefundApprovals();
  if(p==="/app/payment-management/links")return renderPaymentLinks();
  if(p==="/app/payment-management/settlements")return renderPaymentSettlements();
  if(p==="/app/payment-management/disputes")return renderPaymentDisputes();
  if(p==="/app/payment-management/ledger")return renderPaymentLedger();
  if(p==="/app/catalog/products"||p==="/app/ecommerce/products")return renderCatalogProducts();
  if(/^\/app\/(?:catalog|ecommerce)\/products\/(?:new(?:\/(?:overview|catalog|commerce|inventory|logistics|content|internal))?|[A-Z]+-\d+\/edit(?:\/(?:overview|catalog|commerce|variants|inventory|logistics|content|internal|suppliers))?)$/.test(p))return renderCatalogProductForm(p);
  if(/^\/app\/(?:catalog|ecommerce)\/products\/[A-Z]+-\d+$/.test(p))return renderCatalogProductDetail(p.split("/").at(-1));
  if(p==="/app/ecommerce/orders/queue")return renderCommerceOrderQueue();
  if(/^\/app\/ecommerce\/orders\/ORD-\d+$/.test(p))return enhanceCommerceOrderDetail(renderCommerceOrderDetail(p.split("/").at(-1)),p.split("/").at(-1));
  if(window.renderCommerceInventoryPage&&(/^\/app\/ecommerce(?:\/(?:shipping-rates|fulfillment|gift-cards|product-types|categories|brands|suppliers(?:\/.*)?|orders(?:\/(?:search|all-sales|manual-sell))?|pos\/(?:registers|register-setup|sales)|inventory(?:\/.*)?|customers(?:\/.*)?|payments|coupons|reports|settings(?:\/.*)?|activity-logs))?$/.test(p)||/^\/app\/inventory\/(?:transfers(?:\/.*)?|alerts|reservations|adjustments(?:\/.*)?|adjustment-approvals|cycle-counts|replenishment|reports|locations|branches(?:\/.*)?|branch-product-policies|facilities(?:\/.*)?|warehouses(?:\/.*)?|bins(?:\/.*)?|batches|serials)$/.test(p))){const operationsPage=window.renderCommerceInventoryPage(p);if(operationsPage)return operationsPage;}
  if(extraTemplates[p])return renderSourceMarkup(extraTemplates[p],p);
  if(pageSchema[p])return renderOriginalTemplate(app,p,pageSchema[p]);
  if(app.code==="hrm")return `<section class="panel source-unavailable"><h2>Stravix HR</h2><p>Open the existing HR design for this page.</p><a class="btn primary" href="${fullSites.hrm}" target="_blank" rel="noopener">Open HR design ↗</a></section>`;
  return `<section class="panel source-unavailable"><h2>${esc(route?labelFor(route,app):app.name)}</h2><p>This source page is not yet represented in the design preview.</p></section>`;
}
function drawerMarkup(){if(drawer==="original"){const currentPath=pathOf(),schoolPage=/^\/app\/(?:school-management|teacher|student|guardian)(?:\/|$)/.test(currentPath),commercePos=currentPath==="/app/ecommerce/pos";return `<div class="drawer-backdrop" data-action="close"></div><section class="drawer source-original-drawer ${esc(activeOverlayClass)}" role="dialog" aria-modal="true" aria-label="${esc(activeAction)}"><div class="drawer-header"><h2>${esc(activeAction)}</h2><button class="btn small" data-action="close" aria-label="Close">✕</button></div><div class="drawer-body source-template ${schoolPage?"school-source":""} ${commercePos?"pos-source":""}">${activeOverlayHTML}</div></section>`}if(drawer==="crop")return renderDesignDrawer(drawer,activeAction,pageSchema[pathOf()]);return ""}
function render(preserveFocus=false){
  let focused=preserveFocus?document.activeElement?.id:null,position=preserveFocus?document.activeElement?.selectionStart:null,{p,app,route}=getPage();
  let markup=`<div class="shell ${app?"has-rail":"no-rail"} ${menuOpen?"menu-open":""}">${sidebar(app,p)}<div class="content-shell">${topbar(app,route)}${app?workspace(app,route,p):dashboard()}</div></div>${reviewPanel()}${drawerMarkup()}${notice?`<div class="toast" role="status">${esc(notice)}</div>`:""}`;
  if(p==="/app/ecommerce/pos"){
    markup=markup.replace('data-field-key="customerPhone">','data-field-key="customerPhone" value="+1 (415) 555-0148">').replace('type="email">','type="email" value="maya.bennett@example.com">');
  }
  root.innerHTML=markup;
  if($("#nav-appearance"))$("#nav-appearance").value=navMode;
  if(focused&&$("#"+focused)){let el=$("#"+focused);el.focus();if(position!=null)el.setSelectionRange(position,position)}
}
function flash(msg){notice=msg;render();setTimeout(()=>{notice="";render()},3300)}
root.addEventListener("input",e=>{if(e.target.id==="app-search"){query=e.target.value;render(true)}if(e.target.id==="page-search"){pageQuery=e.target.value;render(true)}if(e.target.id==="custom-primary")$(".branding-layout")?.style.setProperty("--preview-primary",e.target.value);if(e.target.id==="custom-accent")$(".branding-layout")?.style.setProperty("--preview-accent",e.target.value)});
root.addEventListener("change",e=>{if(e.target.id==="nav-appearance"){navMode=e.target.value;render()}if(e.target.id==="pos-payment-status"){setPosPreviewState({paymentStatus:e.target.value});render(true)}});
root.addEventListener("click",e=>{
  const posAction=e.target.closest("[data-pos-action]");
  if(posAction?.dataset.posAction==="complete-demo"){
    activeAction="Sale complete";
    activeOverlayClass="pos-sample-receipt";
    activeOverlayHTML='<div class="pos-receipt-preview"><span class="pos-receipt-status">Sample transaction</span><h3>Sale complete</h3><p>POS-2048 · Downtown Store · Register 01</p><div><span>Customer</span><strong>Maya Bennett</strong></div><div><span>Items</span><strong>4 units across 3 lines</strong></div><div><span>Payment</span><strong>Cash</strong></div><div class="pos-receipt-total"><span>Total paid</span><strong>125.40</strong></div><small>Amount received 130.00 · Change 4.60</small><button type="button" data-action="close">Close preview</button></div>';
    drawer="original";render();return;
  }
  const tab=e.target.closest('[data-source-tab]');
  if(tab){selectedSourceTabs.set(pathOf(),tab.dataset.sourceTab);render();return}
  const source=e.target.closest(".source-template [data-source-click]");
  if(source&&!source.closest("a[href]")){
    const expression=source.dataset.sourceClick||"";
    if(pathOf()==="/app/ecommerce/pos"){
      if(/useWalkIn\(\)/.test(expression)){setPosPreviewState({customerMode:"new"});render();return}
      if(/useExistingCustomer\(\)/.test(expression)){setPosPreviewState({customerMode:"existing"});render();return}
      const method=/paymentMethod\s*=\s*['"](cash|card|mixed)['"]/i.exec(expression);
      if(method){setPosPreviewState({paymentMethod:method[1].toLowerCase()});render();return}
    }
    if(drawer==="original"&&/close|cancel|save|submit|confirm/i.test(expression)){drawer="";render();return}
    if(/open|edit|create|add|new|show|manage|invite|approve|reject|delete|remove/i.test(expression)){
      const overlays=sourceOverlays.get(pathOf())||[];
      const label=source.textContent.trim().toLowerCase();
      const match=overlays.find(x=>x.title.toLowerCase().includes(label)||label.includes(x.title.toLowerCase()))||overlays[0];
      if(match){activeAction=match.title;activeOverlayHTML=match.html;activeOverlayClass=match.className||"";drawer="original";render();return}
    }
  }
  const el=e.target.closest("[data-action]");if(!el)return;
  const action=el.dataset.action;
  if(action==="menu"){menuOpen=!menuOpen;render()}
  else if(action==="review-toggle"){reviewOpen=!reviewOpen;render()}
  else if(action==="copy-review-url"){navigator.clipboard.writeText(location.href).then(()=>flash("Preview link copied"),()=>flash("Unable to copy link"))}
  else if(action==="close"){drawer="";render()}
  else if(action==="choose-brand"){brand=el.dataset.brand;render()}
  else if(action==="save-branding")flash("Branding preview saved on this device");
  else if(action==="reload-branding"){brand="corporate-blue";navMode="light";render()}
  else if(action==="logo-crop"){drawer="crop";render()}
  else if(action==="save"){drawer="";flash("Preview updated for this session")}
});
window.addEventListener("hashchange",()=>{pageQuery="";menuOpen=false;render();scrollTo(0,0)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&drawer){drawer="";render()}});
Promise.all([fetch("catalog.json").then(r=>r.json()),fetch("navigation.json").then(r=>r.json()),fetch("navigation-extra.json").then(r=>r.json()),fetch("page-schema.json").then(r=>r.json()),fetch("page-schema-extra.json").then(r=>r.json()),fetch("source-templates-more.json").then(r=>r.json()),fetch("source-templates-missing.json").then(r=>r.json()),fetch("source-components.json").then(r=>r.json()),fetch("source-components-extra.json").then(r=>r.json()),fetch("source-components-inline.json").then(r=>r.json()),fetch("source-payroll-modal.json").then(r=>r.json()),fetch("source-outlets.json").then(r=>r.json()),fetch("source-translations.json").then(r=>r.json()),fetch("source-table-columns.json").then(r=>r.json()),fetch("source-tabs.json").then(r=>r.json()),fetch("source-store-settings-tabs.json").then(r=>r.json())]).then(([data,nav,extraNav,schema,extra,more,missing,components,componentsExtra,componentsInline,payrollModal,outlets,translations,tableColumns,tabs,storeTabs])=>{catalog=data;navigation={...nav,...extraNav};pageSchema={...schema,...extra};extraTemplates={...more,...missing};sourceComponents={...components,...componentsExtra,...componentsInline,...payrollModal};sourceOutlets=outlets;sourceTranslations=translations;sourceTableColumns=tableColumns;sourceTabs=tabs;sourceStoreSettingsTabs=storeTabs;catalog.apps.find(a=>a.code==="tenant-management").url="/admin/organizations";catalog.apps.find(a=>a.code==="garments-buyer-portal").url="/app/garments/buyer-portal/dashboard";for(const app of catalog.apps)for(const group of navigation[app.code]||[])for(const entry of group.entries)if(!catalog.routes.some(r=>r.code===app.code&&r.path===entry.path))catalog.routes.push({code:app.code,path:entry.path});render()}).catch(error=>{console.error(error);root.innerHTML='<div class="empty">The workspace could not load its application catalog.</div>'});
