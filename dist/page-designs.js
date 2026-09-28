const paletteOptions=[
  {key:"corporate-blue",name:"Harbor Blue",primary:"#1e3a5f",accent:"#0ea5e9"},
  {key:"executive-emerald",name:"Emerald & Gold",primary:"#065f46",accent:"#b45309"},
  {key:"royal-indigo",name:"Royal Indigo",primary:"#3730a3",accent:"#7c3aed"},
  {key:"modern-teal",name:"Teal & Cobalt",primary:"#115e59",accent:"#2563eb"},
  {key:"graphite-slate",name:"Graphite & Cobalt",primary:"#1f2937",accent:"#2563eb"}
];
function renderBrandingPage(){
  const selected=paletteOptions.find(x=>x.key===brand)||paletteOptions[0];
  const presets=paletteOptions.map(o=>'<button class="palette-card '+(brand===o.key?'selected':'')+'" data-action="choose-brand" data-brand="'+o.key+'" aria-pressed="'+(brand===o.key)+'">'+
    '<span class="palette-preview"><i style="background:'+o.primary+'"></i><i style="background:'+o.accent+'"></i></span><strong>'+o.name+'</strong><small>'+o.primary+' · '+o.accent+'</small></button>').join('');
  return '<header class="source-page-header branding-page-header"><div><span class="eyebrow">Tenant Admin</span><h2>Branding Settings</h2><p>Control tenant identity used by portals, shell surfaces, documents, and public experiences.</p></div><button class="btn" data-action="reload-branding">Reload</button></header><div class="branding-layout" style="--preview-primary:'+selected.primary+';--preview-accent:'+selected.accent+'"><div class="branding-column">'+
    '<section class="panel brand-panel"><div class="section-heading"><span class="section-number">01</span><div><h2>Identity</h2><p>Name, tagline, and visual assets shown across the tenant.</p></div></div>'+
    '<div class="form-two"><label class="field">Display name<input value="Stravix Suite"></label><label class="field">Tagline<input value="One platform. Every operation."></label></div>'+
    '<div class="asset-row"><div class="asset-mark">S</div><div><strong>Organization logo</strong><p>PNG, JPG, or WEBP. Crop and position the logo before upload.</p></div><button class="btn small" data-action="logo-crop">Choose logo</button></div>'+
    '<div class="asset-row"><div class="asset-mark favicon-mark">S</div><div><strong>Favicon</strong><p>Square PNG, JPG, WEBP, or ICO.</p></div><button class="btn small" data-action="logo-crop">Upload favicon</button></div></section>'+
    '<section class="panel brand-panel"><div class="section-heading"><span class="section-number">02</span><div><h2>Theme</h2><p>Tenant colors and navigation appearance.</p></div></div>'+
    '<div class="field-label">Palette preset</div><div class="palette-grid">'+presets+'</div>'+
    '<div class="section-heading colors-heading"><div><h3>Theme colors</h3><p>Customize the selected preset or return to its defaults.</p></div><button class="btn small" data-action="choose-brand" data-brand="'+brand+'">Reset colors</button></div>'+
    '<div class="form-two"><label class="field">Primary color<input id="custom-primary" type="color" value="'+selected.primary+'"></label><label class="field">Accent color<input id="custom-accent" type="color" value="'+selected.accent+'"></label></div>'+
    '<label class="field">Navigation appearance<select id="nav-appearance"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label></section>'+
    '<div class="branding-actions"><span class="subtle">Design preview</span><button class="btn primary" data-action="save-branding">Save Branding</button></div></div>'+
    '<aside class="panel brand-preview"><span class="eyebrow">Live preview</span><div class="brand-preview-card"><span class="asset-mark">S</span><div><strong>Stravix Suite</strong><small>One platform. Every operation.</small></div></div>'+
    '<div class="mini-shell"><div class="mini-top"></div><div class="mini-side"><span></span><span></span><span></span></div><div class="mini-content"><strong></strong><span></span><span></span><div></div></div></div>'+
    '<div class="preview-swatches"><span style="background:var(--preview-primary)"></span><span style="background:var(--preview-accent)"></span><span style="background:var(--accent-pale)"></span></div></aside></div>';
}
function renderDesignDrawer(kind,action,schema){
  if(kind==="crop")return '<div class="drawer-backdrop" data-action="close"></div><section class="design-modal" role="dialog" aria-modal="true" aria-label="Resize and position logo"><div class="drawer-header"><div><span class="eyebrow">Brand asset</span><h2>Resize & position logo</h2></div><button class="btn small" data-action="close" aria-label="Close">✕</button></div><div class="drawer-body"><p class="subtle">Position the logo and adjust its size.</p><div class="crop-preview"><span>S</span></div><label class="field">Zoom<input type="range" min="50" max="150" value="100"></label></div><div class="drawer-footer"><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-action="save">Apply crop</button></div></section>';
  const destructive=/delete|cancel|close|reject|remove/i.test(action);
  const fields=(schema?.fields||[]).filter(x=>!/search|filter|e\.g\./i.test(x)).slice(0,8);
  const form=destructive?'<p class="subtle">Review this action before confirming it in the live application.</p><label class="field">Remarks<textarea rows="4" placeholder="Add a reason or note"></textarea></label>':
    (fields.length?fields:["Name","Description","Status"]).map(x=>'<label class="field">'+esc(x.replace(/\s*\*$/,''))+'<input placeholder="'+esc(x.replace(/\s*\*$/,''))+'"></label>').join('');
  return '<div class="drawer-backdrop" data-action="close"></div><section class="drawer" role="dialog" aria-modal="true" aria-label="'+esc(action)+'"><div class="drawer-header"><div><span class="eyebrow">Workspace action</span><h2>'+esc(action)+'</h2></div><button class="btn small" data-action="close" aria-label="Close">✕</button></div><div class="drawer-body">'+form+'</div><div class="drawer-footer"><button class="btn" data-action="close">Cancel</button><button class="btn '+(destructive?'danger':'primary')+'" data-action="save">'+(destructive?'Confirm '+esc(action):'Save preview')+'</button></div></section>';
}
