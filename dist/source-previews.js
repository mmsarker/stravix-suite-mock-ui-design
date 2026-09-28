const sourceTemplateBatches = new Map();
const sourceOverlays = new Map();
let sourceComponents = {};
let sourceOutlets = {};
let sourceTranslations = {};
let sourceTableColumns = {};
let sourceTabs = {};
let sourceStoreSettingsTabs = {};
const selectedSourceTabs = new Map();
const posPreviewState = {customerMode:"new",paymentStatus:"paid",paymentMethod:"cash"};
const posIconPaths = {
  "receipt":'<path d="M5 3h14v18l-3.5-2-3.5 2-3.5-2L5 21V3Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  "file-text":'<path d="M6 2h8l5 5v15H6zM14 2v5h5M9 12h7M9 16h7"/>',
  "hourglass":'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  "check-circle":'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  "list":'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-linecap="round" stroke-width="3"/>',
  "package":'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M8 4.2l9 5"/>',
  "shopping-cart":'<path d="M3 3h2l2.2 11h11.6l2-8H6"/><circle cx="9" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',
  "user":'<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4.4 3.5-7 8-7s7.3 2.6 8 7"/>',
  "wallet":'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h18M16 13h5"/><circle cx="16" cy="13" r=".6" fill="currentColor" stroke="none"/>'
};
function posIconMarkup(name){
  return '<span class="source-icon" data-icon="'+esc(name)+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(posIconPaths[name]||posIconPaths["list"])+'</svg></span>';
}
function selectedSourceTab(path) { return selectedSourceTabs.get(path) || (path.includes('/learning/certificates')?'certificates':sourceTabs[path]?.[0]?.[0]); }
function setPosPreviewState(values) { Object.assign(posPreviewState, values); }

function expandSourceComponents(source, depth = 0) {
  if (depth > 5) return source;
  const expand = (whole, tag, attrs, projected = "") => {
    const template = sourceComponents[tag];
    if (!template) return whole;
    const literals = Object.fromEntries([...attrs.matchAll(/(?:^|\s)([\w-]+)=["']([^"']*)["']/g)].map(([,key,value]) => [key,value]));
    let content = template.replace(/<ng-content\s*><\/ng-content>|<ng-content\s*\/>/g, projected);
    for (const [key,value] of Object.entries(literals)) content = content.replace(new RegExp("{{\\s*" + key + "\\s*}}", "g"), value);
    const className = /(?:^|\s)class=["']([^"']+)["']/.exec(attrs)?.[1] || "";
    return '<div class="source-component ' + esc(tag + ' ' + className) + '">' + expandSourceComponents(content,depth+1) + '</div>';
  };
  let expanded = source.replace(/<((?:app|dm|commerce|learning)-[\w-]+)\b([^>]*?)\s*\/>/gi, (whole,tag,attrs) => expand(whole,tag,attrs));
  expanded = expanded.replace(/<((?:app|dm|commerce|learning)-[\w-]+)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (whole,tag,attrs,projected) => expand(whole,tag,attrs,projected));
  return expanded;
}

function loadSourceTemplate(path) {
  const index = Object.keys(pageSchema).indexOf(path);
  if (index < 0) return null;
  const batch = Math.floor(index / 50);
  if (!sourceTemplateBatches.has(batch)) {
    sourceTemplateBatches.set(batch, fetch("source-templates-" + batch + ".json")
      .then(response => {
        if (!response.ok) throw new Error("Template unavailable");
        return response.json();
      })
      .then(data => { sourceTemplateBatches.set(batch, {data}); render(); return data; })
      .catch(() => { sourceTemplateBatches.set(batch, {data:{}}); render(); return {}; }));
  }
  return sourceTemplateBatches.get(batch);
}

function readControl(source, index) {
  const match = /^@(else\s+if|if|for|empty|else|switch|case|default|defer|placeholder|loading|error)\b/.exec(source.slice(index));
  if (!match) return null;
  const kind = match[1], start = index, cursorStart = index + match[0].length;
  let cursor = cursorStart, expression = "";
  while (/\s/.test(source[cursor] || "")) cursor++;
  if (source[cursor] === "(") {
    let depth = 1, quote = "", escaped = false, from = ++cursor;
    while (cursor < source.length && depth) {
      const char = source[cursor++];
      if (quote) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) quote = "";
      } else if (char === "'" || char === '"' || char === "`") quote = char;
      else if (char === "(") depth++;
      else if (char === ")") depth--;
    }
    expression = source.slice(from, cursor - 1);
    while (/\s/.test(source[cursor] || "")) cursor++;
  }
  if (source[cursor] !== "{") return null;
  return {kind, expression, end:cursor + 1, start};
}

function includeCondition(expression, path, includeOverlays = false) {
  const value = expression.toLowerCase();
  if (path === '/app/ecommerce/pos') {
    if (/^products\.length|^productresults\.length|^customerresults\.length|^filteredheldsales\.length|^items\.length|^heldsales\.length\s*>/.test(value)) return false;
    if (/^searchactive\b/.test(value)) return false;
    if (/^customerMode\s*===\s*['"]existing['"]/.test(expression)) return posPreviewState.customerMode === 'existing';
    if (/^paymentStatus\s*!==\s*['"]cod['"]/.test(expression)) return posPreviewState.paymentStatus !== 'cod';
    if (/^paymentStatus\s*===\s*['"]paid['"]\s*&&\s*paymentMethod\s*===\s*['"]cash['"]/.test(expression)) return posPreviewState.paymentStatus === 'paid' && posPreviewState.paymentMethod === 'cash';
  }
  if (path === '/app/school-management/home' && /readiness|setupreasonmessage/.test(value)) return false;
  const tabMatch = /\bactivetab(?:\(\))?\s*===?\s*['"]([^'"]+)['"]/.exec(value);
  if (tabMatch && sourceTabs[path]) return tabMatch[1] === selectedSourceTab(path)?.toLowerCase();
  if (includeOverlays && /cropopen|modalopen|dialogopen|draweropen|isopen\b/.test(value)) return true;
  if (/\bfalse\b|!\s*(summary|dashboard|data|result|employee\s*\(|initialized\s*\(|(?:[\w.]+\.)?selectedcompanyid\s*\()|!\s*scope\.hasusablescope\s*\(|!hidetabs|cropopen|modalopen|dialogopen|draweropen|isopen\b/.test(value)) return false;
  const positive = value.replace(/!\s*[\w.]*?(loading|error)\s*(?:\(\))?/g, "");
  if (/loading\b|error\b/.test(positive)) return false;
  if (/!\s*[\w.()]+\.length|\.length\s*===?\s*0/.test(value)) return /certificates\(\)\.length\s*===?\s*0|!announcements\.length/.test(value);
  const view = /(?:view|layout)\(\)\s*===?\s*['"]([^'"]+)['"]/.exec(expression);
  if (view) return view[1] === "list" || view[1] === "table";
  const tab = /activetab\(\)\s*===?\s*['"]([^'"]+)['"]/.exec(expression);
  if (tab) {
    const selected = path.includes("bulk-upload") ? "bulk" : path.includes("policy-holidays") ? "policy" : path.includes("notifications") ? "notifications" : path.includes("reports") ? "reports" : "marking";
    return tab[1] === selected;
  }
  const mode = /mode\(\)\s*===?\s*['"]([^'"]+)['"]/.exec(expression);
  if (mode) {
    const last = path.split("/").pop();
    return mode[1] === last || (mode[1] === "dashboard" && last === "buyer-portal");
  }
  return true;
}

function posStaticValue(expression) {
  const value = expression.trim().replace(/\s+/g," ").toLowerCase();
  if (value.includes("locationmessage")) return "No active branches are available for the selected company.";
  if (value.includes("selectedlocationname")) return "Register not ready";
  if (value.includes("locationloading ? 'checking'")) return "Attention";
  if (value.includes("holdbuttonlabel")) return "Hold";
  if (value.includes("creating ?")) return "Complete Sale";
  if (value.includes("customermode === 'new'")) return posPreviewState.customerMode === "new" ? "Walk-in customer" : "Existing account";
  if (value.includes("paymentstatus | uppercase")) return posPreviewState.paymentStatus.toUpperCase();
  if (value.includes("heldsalesloading ?")) return "0 waiting";
  if (value.includes("selectedfacility ?")) return "No facility selected";
  if (/productresults\.length|items\.length|totalquantity/.test(value)) return "0";
  if (/subtotal|discount|tax|totalamount|dueamount|changedue/.test(value)) return "0.00";
  if (/\.length/.test(value)) return "0";
  return "";
}

function posCondition(expression) {
  const value=expression.trim().toLowerCase();
  if (/^livedisconnected\s*\|\|\s*\(!registerready\s*&&\s*!locationloading\)/.test(value)) return true;
  if (/^livedisconnected\b/.test(value)) return false;
  if (/^customermode\s*===\s*['"]existing['"]/.test(value)) return posPreviewState.customerMode === "existing";
  if (/^customermode\s*===\s*['"]new['"]/.test(value)) return posPreviewState.customerMode === "new";
  if (/^paymentstatus\s*!==\s*['"]cod['"]/.test(value)) return posPreviewState.paymentStatus !== "cod";
  if (/^paymentstatus\s*===\s*['"]paid['"]\s*&&\s*paymentmethod\s*===\s*['"]cash['"]/.test(value)) return posPreviewState.paymentStatus === "paid" && posPreviewState.paymentMethod === "cash";
  if (/^paymentmethod\s*===\s*['"](cash|card|mixed)['"]/.test(value)) return posPreviewState.paymentMethod === value.match(/['"](cash|card|mixed)['"]/)[1];
  if (/^!selectedfacilityid\b/.test(value)) return true;
  if (/\bselectedfacilityid\b/.test(value)) return false;
  if (/^!hasfielderror\(/.test(value)) return true;
  if (/hasfielderror\(/.test(value)) return false;
  if (/^!registersessionloading\b/.test(value)) return true;
  if (/registersessionloading\b|registersession\s+as\s+session/.test(value)) return false;
  if (/registerready/.test(value)) return false;
  if (/locationloading/.test(value)) return false;
  if (/availableRegisters\.length\s*===?\s*0/i.test(expression)) return true;
  if (/quote|receipt|activeheldsale|validationbanner|error|closepreview|heldsalependingdelete|customerresults|selectedcustomer|heldcustomerid|filteredheldsales|productresults|items\.length|heldsales\.length/.test(value)) return false;
  return true;
}

function resolvePosUnavailableState(root) {
  const templates=new Map();
  root.querySelectorAll("ng-template").forEach(template=>{
    const reference=[...template.attributes].find(attribute=>attribute.name.startsWith("#"))?.name.slice(1).toLowerCase();
    if(reference)templates.set(reference,template);
  });
  const visit=node=>{
    if(node.nodeType!==1)return;
    const element=node;
    if(element.tagName==="NG-TEMPLATE"){element.remove();return;}
    if(element.hasAttribute("*ngfor")){element.remove();return;}
    const ifAttribute=[...element.attributes].find(attribute=>attribute.name.toLowerCase()==="*ngif");
    if(ifAttribute){
      const expression=ifAttribute.value;
      const alternate=/;\s*else\s+([\w-]+)/i.exec(expression)?.[1]?.toLowerCase();
      if(posCondition(expression))element.removeAttribute(ifAttribute.name);
      else{
        const alternateTemplate=alternate&&templates.get(alternate);
        if(alternateTemplate)for(const child of [...alternateTemplate.childNodes].map(child=>child.cloneNode(true))){element.before(child);visit(child);}
        element.remove();return;
      }
    }
    for(const child of [...element.childNodes])visit(child);
    if(element.tagName==="NG-CONTAINER")element.replaceWith(...element.childNodes);
  };
  for(const child of [...root.childNodes])visit(child);
  for(const element of root.querySelectorAll("*")){
    const model=element.getAttribute("[(ngmodel)]")||"";
    const lowered=model.toLowerCase();
    if(lowered==="newcustomer.fullname")element.setAttribute("value","Maya Bennett");
    if(lowered==="newcustomer.phone")element.setAttribute("value","+1 (415) 555-0148");
    if(lowered==="newcustomer.email")element.setAttribute("value","maya.bennett@example.com");
    if(lowered==="discountamount")element.setAttribute("value","0");
    if(lowered==="amountreceived")element.setAttribute("value","130.00");
    if(lowered==="paymentstatus"){
      element.id="pos-payment-status";
      for(const option of element.querySelectorAll("option")){
        if(option.value===posPreviewState.paymentStatus)option.setAttribute("selected","");
        else option.removeAttribute("selected");
      }
    }
    for(const attribute of [...element.attributes]){
      const classBinding=/^\[class\.([\w-]+)\]$/i.exec(attribute.name);
      if(classBinding&&posCondition(attribute.value))element.classList.add(classBinding[1]);
      if(attribute.name.toLowerCase()==="[disabled]")element.setAttribute("disabled","");
    }
  }
}

function unwrapAngularTemplate(source, path, includeOverlays = false) {
  let result = "", index = 0, stack = [], closed = null;
  const active = () => stack.every(item => item.include);
  while (index < source.length) {
    if (source.startsWith("{{", index)) {
      const end = source.indexOf("}}", index + 2);
      if (end < 0) break;
      if (active()) result += path === '/app/ecommerce/pos' ? posStaticValue(source.slice(index + 2, end)) : "—";
      index = end + 2;
      continue;
    }
    if (source[index] === "<") {
      let cursor = index + 1, quote = "";
      while (cursor < source.length) {
        const char = source[cursor++];
        if (quote) { if (char === quote) quote = ""; }
        else if (char === "'" || char === '"') quote = char;
        else if (char === ">") break;
      }
      if (active()) result += source.slice(index, cursor);
      index = cursor;
      continue;
    }
    if (source[index] === "@") {
      const token = readControl(source, index);
      if (token) {
        const parent = active();
        let include = true;
        if (token.kind === "if" || token.kind === "else if") include = includeCondition(token.expression, path, includeOverlays) && (token.kind !== "else if" || !closed?.branchMatched);
        if (token.kind === "for" && path === '/app/ecommerce/pos' && /\b(products|items|branches|facilities|customers|sales|variants)\b/i.test(token.expression)) include = false;
        if (token.kind === "else" || token.kind === "empty") include = closed ? !closed.branchMatched : false;
        if (token.kind === "case" || token.kind === "default") {
          const currentSwitch = [...stack].reverse().find(item => item.kind === "switch");
          include = Boolean(currentSwitch && !currentSwitch.chosen && token.kind === "case");
          if (include) currentSwitch.chosen = true;
        }
        if (["empty","placeholder","loading","error"].includes(token.kind)) include = false;
        stack.push({kind:token.kind, include:parent && include, branchMatched:(closed?.branchMatched && /^(else|else if)$/.test(token.kind)) || parent && include});
        closed = null; index = token.end; continue;
      }
    }
    if (source[index] === "}" && stack.length) {
      const item = stack.pop();
      closed = {include:item.include,branchMatched:item.branchMatched};
      index++; continue;
    }
    if (active()) result += source[index];
    if (!/\s/.test(source[index])) closed = null;
    index++;
  }
  return result;
}

function convertUiElements(markup,path) {
  const tabs = () => '<div class="source-tabs">' + (sourceTabs[path]||[]).map(([id,label]) => '<button type="button" data-source-tab="'+esc(id)+'" class="'+(selectedSourceTab(path)===id?'active':'')+'">'+esc(label)+'</button>').join('')+'</div>';
  const table = attrs => {
    const binding = /\[columns\]="([^"]+)"/.exec(attrs)?.[1]?.replace(/\(\)$/,'') || 'columns';
    const labels = sourceTableColumns[path]?.[binding] || pageSchema[path]?.columns || [];
    const empty = /(?:emptyMessage|emptyText)="([^"]+)"/.exec(attrs)?.[1] || 'No records to display.';
    return '<div class="source-data-table"><table><thead><tr>' + (labels.length?labels.map(label=>'<th>'+esc(label)+'</th>').join(''):'<th>Records</th>') + '</tr></thead><tbody><tr><td colspan="' + Math.max(1,labels.length) + '" class="source-table-empty">' + esc(empty) + '</td></tr></tbody></table></div>';
  };
  let html = markup
    .replace(/<ui-page-header\b((?:"[^"]*"|'[^']*'|[^"'<>])*)>([\s\S]*?)<\/ui-page-header\s*>/gi, (_,attrs,body) => {
      const attr = name => new RegExp('(?:^|\\s)' + name + '="([^"]*)"').exec(attrs)?.[1] || "";
      const titleExpression=/\[title\]="([^"]+)"/.exec(attrs)?.[1]||'';
      const expressionTitles=[...titleExpression.matchAll(/'([^']+)'/g)].map(x=>x[1]);
      const fallback=pageSchema[path]?.headings?.[0]||pageSchema[path]?.title||expressionTitles.at(-1)||'';
      if (/<h[12]\b/i.test(body)) return '<header class="source-page-header">'+body+'</header>';
      return '<header class="source-page-header"><div><span class="eyebrow">'+esc(attr('kicker'))+'</span><h2>'+esc(attr('title')||fallback)+'</h2><p>'+esc(attr('description'))+'</p></div>'+body+'</header>';
    })
    .replace(/<ui-loading-state\b((?:"[^"]*"|'[^']*'|[^"'<>])*)\/>/gi,'')
    .replace(/<ui-toolbar\b([^>]*?)\/>/gi,(_,attrs)=>'<div class="source-toolbar">'+(/title="([^"]+)"/.exec(attrs)?.[1]?'<h3>'+esc(/title="([^"]+)"/.exec(attrs)[1])+'</h3>':'')+'</div>')
    .replace(/<ui-toolbar\b([^>]*)>/gi,(_,attrs)=>'<div class="source-toolbar">'+(/title="([^"]+)"/.exec(attrs)?.[1]?'<h3>'+esc(/title="([^"]+)"/.exec(attrs)[1])+'</h3>':''))
    .replace(/<\/ui-toolbar>/gi,'</div>')
    .replace(/<ui-(?:autocomplete)\b([^>]*?)\/>/gi,(_,attrs)=>'<input type="text" '+attrs+'>')
    .replace(/<ui-(?:action-menu|entity-action-button|back-button)\b([^>]*?)\/>/gi,(_,attrs)=>'<button type="button" class="source-action-button">'+esc(/(?:label|ariaLabel)="([^"]+)"/.exec(attrs)?.[1]||'Actions')+'</button>')
    .replace(/<ui-stat-card\b([^>]*?)\/>/gi,(_,attrs)=>'<article class="source-stat-card"><span>'+esc(/label="([^"]+)"/.exec(attrs)?.[1]||'')+'</span><strong>'+esc(/value="([^"]+)"/.exec(attrs)?.[1]||'—')+'</strong></article>')
    .replace(/<ui-avatar\b([^>]*?)\/>/gi,(_,attrs)=>'<span class="source-avatar">'+esc(/(?:initials|name)="([^"]+)"/.exec(attrs)?.[1]||'—')+'</span>')
    .replace(/<ui-(?:action-bar|inline-actions)\b([^>]*)>/gi,'<div class="source-inline-actions">')
    .replace(/<\/ui-(?:action-bar|inline-actions)>/gi,'</div>')
    .replace(/<ui-tabs\b[^>]*\/>/gi,tabs)
    .replace(/<ui-tabs\b[^>]*><\/ui-tabs>/gi,tabs)
    .replace(/<ui-data-table\b((?:"[^"]*"|'[^']*'|[^"'<>])*)\/>/gi, (_,attrs) => table(attrs))
    .replace(/<ui-data-table\b((?:"[^"]*"|'[^']*'|[^"'<>])*)>([\s\S]*?)<\/ui-data-table\s*>/gi, (_,attrs,body) => /<table\b/i.test(body) ? '<div class="source-data-table">'+body+'</div>' : table(attrs))
    .replace(/<ui-file-upload\b([^>]*?)(?:\/>|><\/ui-file-upload>)/gi, (_, attrs) => {
      const attr = name => new RegExp('(?:^|\\s)' + name + '="([^"]*)"').exec(attrs)?.[1] || "";
      return '<div class="source-upload"><strong>' + esc(attr('label')) + '</strong><p>' + esc(attr('hint')) + '</p><button type="button" ' + (path.includes('school-identity')?'data-source-click="openCrop()" ':'') + 'class="btn source-file-button">' + esc(attr('chooseLabel') || 'Choose file') + '</button></div>';
    })
    .replace(/<ui-status-pill\b([^>]*?)\/>/gi, (_,attrs) => '<span class="source-status-pill">' + esc(/label="([^"]+)"/.exec(attrs)?.[1] || '—') + '</span>')
    .replace(/<ui-(?:date-picker|date-time-picker|time-picker)\b([^>]*?)\/>/gi, (_,attrs) => '<input type="date" ' + attrs + '>')
    .replace(/<ui-(?:switch|radio-group)\b([^>]*?)\/>/gi, (_,attrs) => '<input type="checkbox" ' + attrs + '>')
    .replace(/<ui-(?:paginator)\b[^>]*\/>/gi, '<div class="source-pager"><button type="button">Previous</button><span>Page 1</span><button type="button">Next</button></div>')
    .replace(/<ui-page-header\b([^>]*?)\/>/gi, (_, attrs) => {
      const attr = name => new RegExp('(?:^|\\s)' + name + '="([^"]*)"').exec(attrs)?.[1] || "";
      const fallback=pageSchema[path]?.headings?.[0]||pageSchema[path]?.title||'';
      return '<header class="source-page-header"><span class="eyebrow">' + esc(attr("kicker")) + '</span><h2>' + esc(attr("title")||fallback) + '</h2><p>' + esc(attr("description")) + '</p></header>';
    })
    .replace(/<ui-page-header\b([^>]*)>/gi, (_, attrs) => {
      const attr = name => new RegExp('(?:^|\\s)' + name + '="([^"]*)"').exec(attrs)?.[1] || "";
      return '<header class="source-page-header"><div><span class="eyebrow">' + esc(attr("kicker")) + '</span><h2>' + esc(attr("title")) + '</h2><p>' + esc(attr("description")) + '</p></div>';
    })
    .replace(/<\/ui-page-header\s*>/gi, '</header>')
    .replace(/<ui-create-button\b([^>]*?)\/>/gi, (_, attrs) => '<a class="btn primary" href="#' + esc(/routerLink="([^"]+)"/.exec(attrs)?.[1] || "") + '">' + esc(/label="([^"]+)"/.exec(attrs)?.[1] || "Create") + '</a>')
    .replace(/<ui-empty-state\b([^>]*?)\/>/gi, (_, attrs) => '<div class="source-empty-state"><strong>' + esc(/title="([^"]+)"/.exec(attrs)?.[1] || "") + '</strong><p>' + esc(/description="([^"]+)"/.exec(attrs)?.[1] || "") + '</p></div>')
    .replace(/<ui-empty-state\b([^>]*)>/gi, (_, attrs) => '<div class="source-empty-state"><strong>' + esc(/title="([^"]+)"/.exec(attrs)?.[1] || "") + '</strong><p>' + esc(/description="([^"]+)"/.exec(attrs)?.[1] || "") + '</p>')
    .replace(/<\/ui-empty-state\s*>/gi, '</div>')
    .replace(/<ui-segmented-control\b([\s\S]*?)\/>/gi, (_, attrs) => {
      const labels = [...attrs.matchAll(/label:\s*'([^']+)'/g)].map(x => x[1]);
      return '<div class="source-segmented">' + labels.map((label,i) => '<span class="' + (i===0?'selected':'') + '">' + esc(label) + '</span>').join('') + '</div>';
    })
    .replace(/<ui-icon\b([^>]*?)\/>/gi, (_,attrs) => {
      const name=/name=["']([^"']+)["']/.exec(attrs)?.[1] || "dot";
      return path==="/app/ecommerce/pos" ? posIconMarkup(name) : '<span class="source-icon" data-icon="' + esc(name) + '" aria-hidden="true"></span>';
    })
    .replace(/<ui-(search-box|checkbox|badge)\b((?:"[^"]*"|'[^']*'|[^"'<>])*)\/>/gi, (_, kind, attrs) => kind === "search-box" ? '<input type="search" ' + attrs + '>' : kind === "checkbox" ? '<input type="checkbox" ' + attrs + '>' : '<span class="badge">' + esc(/label="([^"]+)"/.exec(attrs)?.[1]||'—') + '</span>')
    .replace(/<ui-(input|number-input)\b([^>]*?)\/>/gi, (_, kind, attrs) => '<input ' + (kind === "number-input" ? 'type="number" ' : "") + attrs + '>')
    .replace(/<ui-form-field\b([^>]*)>/gi, (_, attrs) => '<label class="source-form-field"><span>' + esc(/label="([^"]+)"/.exec(attrs)?.[1] || "") + '</span>')
    .replace(/<\/ui-form-field\s*>/gi, '</label>')
    .replace(/<ui-alert\b([^>]*)>/gi, (_, attrs) => '<div class="source-alert"><strong>' + esc(/title="([^"]+)"/.exec(attrs)?.[1] || "") + '</strong>')
    .replace(/<\/ui-alert\s*>/gi, '</div>')
    .replace(/<ui-section-card\b([^>]*?)\/>/gi, (_, attrs) => '<section class="source-section-card panel"><h2>' + esc(/title="([^"]+)"/.exec(attrs)?.[1] || "") + '</h2></section>')
    .replace(/<ui-button-link\b/gi, '<a')
    .replace(/<\/ui-button-link\s*>/gi, '</a>')
    .replace(/<ui-section-card\b([^>]*)>/gi, (_, attrs) => {const heading=/title="([^"]+)"/.exec(attrs)?.[1]||"";return '<section class="source-section-card panel">'+(heading?'<h2>'+esc(heading)+'</h2>':'')})
    .replace(/<\/ui-section-card\s*>/gi, '</section>')
    .replace(/<ui-(button|select|textarea|table-shell|page|status-pill)\b/gi, (_, kind) => '<' + ({button:"button",select:"select",textarea:"textarea","table-shell":"div",page:"div","status-pill":"span"}[kind]))
    .replace(/<\/ui-(button|select|textarea|table-shell|page|status-pill)\s*>/gi, (_, kind) => '</' + ({button:"button",select:"select",textarea:"textarea","table-shell":"div",page:"div","status-pill":"span"}[kind]))
    .replace(/<ui-(input|number-input)\b([^>]*?)><\/ui-\1>/gi, (_, kind, attrs) => '<input ' + (kind === "number-input" ? 'type="number" ' : "") + attrs + '>')
    .replace(/routerLink="([^"]+)"/g, (_, route) => 'href="#' + esc(route) + '"')
    .replace(/<script\b[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<(ui-[\w-]+)\b([^>]*?)\/>/gi, (_,tag,attrs) => '<'+tag+attrs+'></'+tag+'>');
  html = html.replace(/<ui-badge\b((?:"[^"]*"|'[^']*'|[^"'<>])*)>([\s\S]*?)<\/ui-badge\s*>/gi,(_,attrs,body)=>'<span class="badge">'+(body.trim()||esc(/label="([^"]+)"/.exec(attrs)?.[1]||'—'))+'</span>');
  html = html.replace(/<ui-loading-state\b((?:"[^"]*"|'[^']*'|[^"'<>])*)>[\s\S]*?<\/ui-loading-state\s*>/gi,'');
  const holder = document.createElement("template");
  holder.innerHTML = html;
  holder.content.querySelectorAll("script,iframe,object,embed").forEach(el => el.remove());
  if(path==='/app/ecommerce/pos')resolvePosUnavailableState(holder.content);
  holder.content.querySelectorAll("*").forEach(el => {
    for (const attr of [...el.attributes]) {
      if (attr.name === "(click)") el.setAttribute("data-source-click", attr.value);
      if (/^on/i.test(attr.name) || /^(\[|\(|\*|#)/.test(attr.name) || /^(src|href)$/i.test(attr.name) && /^javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    }
    if (el.tagName === "A" && !el.hasAttribute("href")) el.removeAttribute("role");
    if (el.tagName === "BUTTON") el.setAttribute("type", "button");
  });
  return holder.innerHTML;
}

function isOverlayRoot(element) {
  const classes = [...element.classList];
  return classes.some(x => /^(?:[\w-]*-)?(?:drawer|modal|dialog|backdrop)(?:-panel|-form)?$/.test(x)) || /-(?:drawer|modal|modal-shell|dialog)$/.test(element.tagName.toLowerCase()) || element.getAttribute("role") === "dialog";
}

function splitSourceOverlays(html) {
  const holder=document.createElement("template");holder.innerHTML=html;
  const overlays=[];
  for(const element of [...holder.content.querySelectorAll("*")]){
    if(!isOverlayRoot(element)||element.closest("[data-source-overlay-root]"))continue;
    if(/backdrop$/.test(element.className||"")){element.remove();continue}
    element.setAttribute("data-source-overlay-root","");
    overlays.push({html:element.innerHTML,className:element.className||"",title:element.querySelector("h1,h2,h3,[class*=title]")?.textContent?.trim()||"Details"});
    element.remove();
  }
  return {html:holder.innerHTML,overlays};
}

function renderOriginalTemplate(app, path, schema) {
  const index = Math.floor(Object.keys(pageSchema).indexOf(path) / 50);
  const batch = sourceTemplateBatches.get(index);
  if (!batch || !batch.data) {
    if (!batch) loadSourceTemplate(path);
    return '<div class="source-loading">Loading page layout…</div>';
  }
  let source = batch.data[path];
  if (!source) return '<section class="panel source-unavailable"><h2>' + esc(schema.title || app.name) + '</h2><p>Page template unavailable in this preview.</p></section>';
  if (source.includes('<app-attendance-workspace')) {
    const shared = sourceTemplateBatches.get('attendance');
    if (!shared) {
      sourceTemplateBatches.set('attendance', fetch('attendance-workspace.json').then(r => r.json()).then(data => {sourceTemplateBatches.set('attendance',{data});render();return data}));
      return '<div class="source-loading">Loading page layout…</div>';
    }
    if (!shared.data) return '<div class="source-loading">Loading page layout…</div>';
    source = shared.data.template;
  }
  return renderSourceMarkup(source,path);
}

function restorePosMockActions(markup) {
  const holder=document.createElement("template");
  holder.innerHTML=markup;
  const actions=new Map([
    ["clear",[".register-actions",true,""]],
    ["complete sale",[".register-actions",true,""]],
    ["existing",[".mode-switch",false,"useExistingCustomer()"]],
    ["card",[".segmented",false,"paymentMethod = 'card'"]],
    ["mixed",[".segmented",false,"paymentMethod = 'mixed'"]],
    ["cardmixed",[".segmented",false,"paymentMethod = 'card'"]]
  ]);
  const walker=document.createTreeWalker(holder.content,NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while(walker.nextNode())textNodes.push(walker.currentNode);
  for(const textNode of textNodes){
    const label=textNode.textContent.trim().toLowerCase();
    const config=actions.get(label);
    const parent=textNode.parentElement;
    if(!config||!parent||parent.closest("button,a"))continue;
    const [containerSelector,disabled,click]=config;
    const container=parent.closest(containerSelector);
    if(!container)continue;
    if(label==="cardmixed"){
      const fragment=document.createDocumentFragment();
      for(const [method,click] of [["Card","paymentMethod = 'card'"],["Mixed","paymentMethod = 'mixed'"]]){
        const choice=document.createElement("button");
        choice.type="button";
        choice.textContent=method;
        if(posPreviewState.paymentMethod===method.toLowerCase())choice.classList.add("active");
        choice.setAttribute("data-source-click",click);
        fragment.append(choice);
      }
      textNode.replaceWith(fragment);
      continue;
    }
    const button=document.createElement("button");
    button.type="button";
    button.textContent=textNode.textContent.trim();
    if(label==="existing"&&posPreviewState.customerMode==="existing"||label==="card"&&posPreviewState.paymentMethod==="card"||label==="mixed"&&posPreviewState.paymentMethod==="mixed")button.classList.add("active");
    if(disabled)button.disabled=true;
    if(click)button.setAttribute("data-source-click",click);
    const icon=textNode.previousElementSibling;
    if(icon?.classList.contains("source-icon"))button.append(icon);
    textNode.replaceWith(button);
  }
  return holder.innerHTML;
}

function organizePosWorkspace(markup) {
  const holder=document.createElement("template");
  holder.innerHTML=markup;
  const shell=holder.content.querySelector(".pos-shell");
  const context=shell?.querySelector(":scope > .pos-context-bar");
  const register=shell?.querySelector(":scope > .register-bar");
  if(!shell||!context||!register)return markup;
  const title=register.querySelector(".register-title");
  const actions=register.querySelector(".register-actions");
  const contextHeading=context.querySelector(".context-heading");
  const scopeControls=context.querySelector(".scope-controls");
  const hero=document.createElement("section");
  hero.className="pos-hero";
  hero.setAttribute("aria-label","POS register and selling context");
  const heroHeader=document.createElement("div");
  heroHeader.className="pos-hero-header";
  const heroContext=document.createElement("div");
  heroContext.className="pos-hero-context";
  const heroActions=document.createElement("div");
  heroActions.className="pos-hero-actions";
  if(title)heroHeader.append(title);
  if(actions)heroActions.append(...actions.childNodes);
  heroHeader.append(heroActions);
  if(contextHeading)heroContext.append(contextHeading);
  if(scopeControls)heroContext.append(scopeControls);
  hero.append(heroHeader,heroContext);
  context.before(hero);
  context.remove();
  register.remove();
  return holder.innerHTML;
}

function populatePosSample(markup) {
  const holder=document.createElement("template");
  holder.innerHTML=markup;
  const page=holder.content.querySelector(".pos-shell");
  if(!page)return markup;
  page.classList.add("pos-sample");
  const title=page.querySelector(".register-title p");
  if(title)title.textContent="Downtown Store · Register 01";
  const badge=page.querySelector(".register-state-badge");
  if(badge){badge.textContent="Ready for sale";badge.classList.add("ready");}
  const complete=[...page.querySelectorAll(".pos-hero-actions button")].find(button=>button.textContent.includes("Complete Sale"));
  if(complete){complete.removeAttribute("disabled");complete.setAttribute("variant","primary");complete.setAttribute("data-pos-action","complete-demo");}
  page.querySelector(".register-status")?.remove();
  const context=page.querySelector(".context-heading");
  if(context){
    const sample=document.createElement("span");
    sample.className="pos-sample-tag";
    sample.textContent="Sample transaction";
    context.append(sample);
  }
  const branch=page.querySelector('select[data-field-key="branchId"]');
  const facility=page.querySelector('select[data-field-key="facilityId"]');
  if(branch){branch.removeAttribute("disabled");const option=new Option("DT-01 · Downtown Branch","downtown");option.setAttribute("selected","");branch.add(option);}
  if(facility){facility.removeAttribute("disabled");const option=new Option("STORE-01 · Downtown Store","store");option.setAttribute("selected","");facility.add(option);}
  const session=page.querySelector(".register-session-panel");
  if(session)session.innerHTML=`<div class="register-session-status sample-session-status"><div class="session-heading"><span class="session-state">Open register</span><strong>Downtown · Register 01</strong><small>Amina Rahman / 9:15 AM</small></div><div class="session-metrics"><div><span>Opening</span><strong>250.00</strong></div><div><span>Expected</span><strong>1,284.60</strong></div><div><span>Cash sales</span><strong>1,034.60</strong></div><div><span>Cash in</span><strong>0.00</strong></div><div><span>Cash out</span><strong>0.00</strong></div></div></div><div class="register-session-group drawer-actions-group"><span class="group-label">Drawer actions</span><div class="button-pair"><button type="button" disabled>Cash In</button><button type="button" disabled>Cash Out</button><button type="button" disabled>Close Drawer</button></div><a class="register-link action-link" href="#/app/ecommerce/pos/registers">View all drawers</a></div>`;
  const productRail=page.querySelector(".product-rail");
  if(productRail){
    const subtitle=productRail.querySelector(".rail-head p");
    if(subtitle)subtitle.textContent="STORE-01 · Downtown Store";
    const count=productRail.querySelector(".count-pill");
    if(count)count.textContent="4 results";
    productRail.querySelector(".scan-box input")?.removeAttribute("disabled");
    const empty=productRail.querySelector(".rail-message,.source-empty-state,.picker-empty");
    const productList=document.createElement("div");
    productList.className="pos-product-list";
    productList.innerHTML=`<div class="pos-product-list-head"><span>Popular products</span><span>Price</span></div><div class="pos-product"><span class="pos-product-art art-shirt" aria-hidden="true">LS</span><span class="pos-product-info"><strong>Everyday Linen Shirt</strong><small>APP-1042 · 28 in stock</small></span><strong class="pos-product-price">42.00</strong></div><div class="pos-product"><span class="pos-product-art art-tote" aria-hidden="true">CT</span><span class="pos-product-info"><strong>Canvas Tote</strong><small>ACC-2180 · 16 in stock</small></span><strong class="pos-product-price">24.00</strong></div><div class="pos-product"><span class="pos-product-art art-tee" aria-hidden="true">RT</span><span class="pos-product-info"><strong>Ribbed Cotton Tee</strong><small>APP-1168 · 32 in stock</small></span><strong class="pos-product-price">28.00</strong></div><div class="pos-product"><span class="pos-product-art art-gift" aria-hidden="true">GW</span><span class="pos-product-info"><strong>Gift Wrap</strong><small>SRV-0012 · Available</small></span><strong class="pos-product-price">6.00</strong></div>`;
    if(empty)empty.replaceWith(productList);else productRail.append(productList);
  }
  const held=page.querySelector(".held-sales-card");
  if(held){
    const count=held.querySelector(".rail-head p");
    if(count)count.textContent="1 waiting";
    const empty=held.querySelector(".rail-message,.source-empty-state");
    const row=document.createElement("div");
    row.className="pos-held-sample";
    row.innerHTML='<span class="pos-held-avatar">JR</span><span><strong>Jordan Reed</strong><small>HOLD-1048 · 2 items · 68.00</small></span><span class="pos-held-arrow" aria-hidden="true">↗</span>';
    if(empty)empty.replaceWith(row);else held.append(row);
  }
  const cart=page.querySelector(".cart-panel");
  if(cart){
    const subtitle=cart.querySelector(".cart-head p");
    if(subtitle)subtitle.textContent="4 units across 3 lines";
    const total=cart.querySelector(".cart-total strong");
    if(total)total.textContent="125.40";
    const totalDetails=cart.querySelectorAll(".cart-total small");
    if(totalDetails[0])totalDetails[0].textContent="Due 0.00";
    if(totalDetails[1])totalDetails[1].textContent="Change 4.60";
    const kpis=cart.querySelectorAll(".cart-kpis strong");
    ["3","4","0.00"].forEach((value,index)=>{if(kpis[index])kpis[index].textContent=value;});
    const empty=cart.querySelector(".cart-validation");
    const lines=document.createElement("div");
    lines.className="pos-sale-lines";
    lines.innerHTML=`<div class="pos-sale-lines-head"><span>Item</span><span>Qty</span><span>Unit price</span><span>Amount</span></div><div class="pos-sale-line"><span class="pos-line-item"><span class="pos-line-art art-shirt">LS</span><span><strong>Everyday Linen Shirt</strong><small>APP-1042 · Sand / M</small></span></span><span class="pos-qty">2</span><span>42.00</span><strong>84.00</strong></div><div class="pos-sale-line"><span class="pos-line-item"><span class="pos-line-art art-tote">CT</span><span><strong>Canvas Tote</strong><small>ACC-2180 · Natural</small></span></span><span class="pos-qty">1</span><span>24.00</span><strong>24.00</strong></div><div class="pos-sale-line"><span class="pos-line-item"><span class="pos-line-art art-gift">GW</span><span><strong>Gift Wrap</strong><small>SRV-0012 · Kraft</small></span></span><span class="pos-qty">1</span><span>6.00</span><strong>6.00</strong></div>`;
    if(empty)empty.replaceWith(lines);else cart.append(lines);
  }
  const customer=page.querySelector(".tender-card");
  if(customer){
    const name=customer.querySelector('input[data-field-key="customerName"]');
    const phone=customer.querySelector('input[data-field-key="customerPhone"]');
    const email=customer.querySelector('input[type="email"]');
    if(name)name.setAttribute("value","Maya Bennett");
    if(phone)phone.setAttribute("value","+1 (415) 555-0148");
    if(email)email.setAttribute("value","maya.bennett@example.com");
  }
  const tender=page.querySelectorAll(".tender-card")[1];
  if(tender){
    const amount=[...tender.querySelectorAll("label.field")].find(label=>label.textContent.includes("Amount received"))?.querySelector("input");
    if(amount)amount.setAttribute("value","130.00");
    const values={"Subtotal":"114.00","Item discount":"-0.00","Coupon discount":"-0.00","Manual discount":"-0.00","Tax":"11.40","Total":"125.40","Due":"0.00","Change":"4.60"};
    for(const row of tender.querySelectorAll(".totals > div")){
      const label=row.firstElementChild?.textContent?.trim();
      if(label in values&&row.lastElementChild)row.lastElementChild.textContent=values[label];
    }
  }
  return holder.innerHTML;
}

function renderSourceMarkup(source,path) {
  const outlet = path==='/app/ecommerce/settings' ? sourceStoreSettingsTabs[selectedSourceTab(path)] : sourceOutlets[path];
  source = source.replace(/<router-outlet\s*><\/router-outlet>|<router-outlet\s*\/>/gi,outlet||"");
  source = expandSourceComponents(source);
  source = source.replace(/{{\s*'([^']+)'\s*\|\s*translate\s*}}/g, (_,key) => esc(sourceTranslations[key] || key.split('.').at(-1).replace(/_/g,' ')));
  if(path==='/app/ecommerce/pos'){
    const main=splitSourceOverlays(convertUiElements(unwrapAngularTemplate(source,path),path));
    sourceOverlays.set(path,[]);
    return '<div class="source-template pos-source">'+populatePosSample(organizePosWorkspace(restorePosMockActions(main.html)))+'</div>';
  }
  const main=splitSourceOverlays(convertUiElements(unwrapAngularTemplate(source,path),path));
  const withOverlays=splitSourceOverlays(convertUiElements(unwrapAngularTemplate(source,path,true),path));
  sourceOverlays.set(path,withOverlays.overlays.length?withOverlays.overlays:main.overlays);
  const schoolPage=/^\/app\/(?:school-management|teacher|student|guardian)(?:\/|$)/.test(path);
  const commercePos=path==='/app/ecommerce/pos';
  return '<div class="source-template '+(schoolPage?'school-source ':'')+(commercePos?'pos-source':'')+'">' + main.html + '</div>';
}
