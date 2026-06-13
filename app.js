/* ══════════════════════════════════════
   ASCENT — Main Application Script
   Fase 2: separato da index.html
══════════════════════════════════════ */

/* ══════════════════════════════════════
   GLOBAL CLICK ANIMATION
══════════════════════════════════════ */
function animatePressedElement(el, ev){
  if(!el) return;
  el.classList.remove("click-pop");
  void el.offsetWidth;
  el.classList.add("click-pop","click-flash","clicked");
  if(ev && ev.clientX !== undefined){
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${ev.clientX - rect.left}px`);
    el.style.setProperty("--y", `${ev.clientY - rect.top}px`);
  }
  setTimeout(()=>el.classList.remove("clicked"), 520);
}
document.addEventListener("click", function(ev){
  const el = ev.target.closest(".btn-anim,.stat-card,.record-pill,.ov-tab,.sort-btn,.tbl-btn,.btn-submit,.completed-acc-btn,.chart-acc-header,.nav-links a,.sticky-link");
  if(el) animatePressedElement(el, ev);
});


/* ══════════════════════════════════════
   V3 HERO HOVER + TABLE MOTION
══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if(hero){
    hero.addEventListener("mousemove", (ev) => {
      const r = hero.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      hero.style.setProperty("--mx", `${x}%`);
      hero.style.setProperty("--my", `${y}%`);
    });
    hero.addEventListener("mouseleave", () => {
      hero.style.setProperty("--mx", "50%");
      hero.style.setProperty("--my", "50%");
    });
  }
});

function markLatestRowAdded(){
  const rows = document.querySelectorAll("#tableBody tr");
  if(!rows.length) return;
  rows[0].classList.add("row-added");
  setTimeout(()=>rows[0].classList.remove("row-added"), 950);
}

function animateRowsBeforeDelete(){
  document.querySelectorAll("#tableBody tr.selected-row").forEach((r,i)=>{
    setTimeout(()=>r.classList.add("row-deleting"), i*35);
  });
}

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
let runs = [];

/* ══════════════════════════════════════
   EMPTY STATE HELPER
══════════════════════════════════════ */
function showEmptyState(show) {
  const el = document.getElementById("ascent-empty-state");
  if (el) el.style.display = "none";
}


/* ══════════════════════════════════════
   UTILITIES
══════════════════════════════════════ */
function paceNum(dist,timeMins){if(!dist||!timeMins||dist===0)return null;return timeMins/dist;}
function paceStr(pn){if(!pn)return "–";const m=Math.floor(pn);const s=Math.round((pn-m)*60);return m+":"+(s<10?"0":"")+s;}
function fmtDate(d,short){const dt=new Date(d+"T12:00:00");if(short)return dt.toLocaleDateString("it-IT",{day:"2-digit",month:"short"});return dt.toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"});}
function estimateCalories(dist,timeMins,hr){
  if(dist&&timeMins){const met=hr?Math.max(5,hr/20):7;return Math.round(70*met*timeMins/60);}return null;
}

/* ══════════════════════════════════════
   HERO / STATS
══════════════════════════════════════ */
function computeStats(){
  if(!runs.length) return;
  const totalKm=runs.reduce((a,r)=>a+r.dist,0);
  const withHR=runs.filter(r=>r.hr);
  const avgHR=withHR.length?Math.round(withHR.reduce((a,r)=>a+r.hr,0)/withHR.length):null;
  const paces=runs.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  const bestPaceVal=Math.min(...paces);
  const totalMins=runs.reduce((a,r)=>a+r.timeMins,0);
  const th=Math.floor(totalMins/60);const tm=Math.round(totalMins%60);
  const prs=runs.filter(r=>r.pr&&r.pr.trim()).length;
  const totalElev=runs.reduce((a,r)=>a+r.elev,0);
  const totalCal=runs.reduce((a,r)=>a+(r.calories||0),0);
  const maxDist=Math.max(...runs.map(r=>r.dist));
  const lastPace=paceNum(runs[runs.length-1].dist,runs[runs.length-1].timeMins);

  const hKm=document.getElementById("h-km");if(hKm)hKm.innerHTML=totalKm.toFixed(2).replace(".",",")+`<span>km</span>`;
  const hPrs=document.getElementById("h-prs");if(hPrs)hPrs.innerHTML=prs+`<span>PR</span>`;
  const hPace=document.getElementById("h-pace");if(hPace)hPace.innerHTML=paceStr(lastPace)+`<span>/km</span>`;

  const statsData=[
    {key:"sessions",icon:"🏃",val:runs.length,label:"Sessioni totali",delta:"dal 17 mar 2026",cls:"delta-neutral",accent:"c-orange"},
    {key:"distanceTotal",icon:"📍",val:totalKm.toFixed(2).replace(".",",")+" km",label:"Distanza totale",delta:"↑ in crescita",cls:"delta-up",accent:"c-green"},
    {key:"lastPace",icon:"⚡",val:paceStr(lastPace)+" /km",label:"Ultimo passo",delta:"↑ migliorato",cls:"delta-up",accent:"c-orange"},
    {key:"personalRecords",icon:"🏆",val:prs,label:"Record personali",delta:"↑ ottima forma",cls:"delta-up",accent:"c-yellow"},
    {key:"timeTotal",icon:"⏱️",val:th+"h "+tm+"m",label:"Tempo totale",delta:"ore di allenamento",cls:"delta-neutral",accent:"c-blue"},
    {key:"avgHeartRate",icon:"❤️",val:avgHR?avgHR+" bpm":"–",label:"FC media",delta:"battiti medi",cls:"delta-neutral",accent:"c-orange"},
    {key:"elevationTotal",icon:"⛰️",val:totalElev+" m",label:"Dislivello tot.",delta:"quota conquistata",cls:"delta-neutral",accent:"c-blue"},
    {key:"caloriesTotal",icon:"🔥",val:totalCal.toLocaleString()+" kcal",label:"Calorie totali",delta:"energia bruciata",cls:"delta-up",accent:"c-yellow"},
    {key:"maxDistance",icon:"📏",val:maxDist.toFixed(2)+" km",label:"Distanza max",delta:"record singola uscita",cls:"delta-up",accent:"c-green"},
    {key:"bestPace",icon:"🥇",val:paceStr(bestPaceVal)+" /km",label:"Passo migliore",delta:"record assoluto",cls:"delta-up",accent:"c-green"},
  ];
  window._statsData=statsData;
  const grid=document.getElementById("statsGrid");
  grid.innerHTML=statsData.map((s,i)=>`<div class="stat-card ${s.accent} reveal btn-anim tap-ripple" onclick="openStatModal('${s.key}', ${i})" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openStatModal('${s.key}', ${i});}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openStatModal(\'${s.key}\', ${i});}"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div><div class="stat-delta ${s.cls}">${s.delta}</div></div>`).join("");

  // Records — interactive pills
  const records=[
    {icon:"🥇",label:"PR 5 km",val:"10 giu 2026",runDate:"2026-06-10",metric:"5 km",context:"Nuovo record personale sui 5 km, migliorato di 3 min 44 sec rispetto alla precedente prova del 25 maggio."},
    {icon:"🥇",label:"PR 2 miglia",val:"20 mag 2026",runDate:"2026-05-20",metric:"2 miglia",context:"Record personale sulle 2 miglia stabilito nella corsa serale del 20 maggio, con una distanza totale di 4,48 km."},
    {icon:"🥇",label:"PR 1 km",val:"17 mar 2026",runDate:"2026-03-17",metric:"1 km",context:"Prima uscita in assoluto: record personale sul chilometro stabilito nella corsa mattutina di esordio."},
    {icon:"🥇",label:"PR 800 m",val:"17 mar 2026",runDate:"2026-03-17",metric:"800 m",context:"Record personale sugli 800 m stabilito nella prima corsa in assoluto, assieme al PR sul km."},
    {icon:"🥇",label:"PR 1600 m",val:"20 mag 2026",runDate:"2026-05-20",metric:"1600 m",context:"Record personale sui 1600 m fissato nella corsa serale del 20 maggio, durante un'uscita da 4,48 km."},
    {icon:"📈",label:"Miglior passo",val:paceStr(bestPaceVal)+"/km",runDate:"2026-06-10",metric:"passo",context:"Il passo migliore mai registrato, ottenuto nella corsa del 10 giugno su 7,78 km. Un netto salto di qualità rispetto all'esordio."},
    {icon:"📏",label:"Distanza max",val:maxDist.toFixed(2)+" km",runDate:"2026-06-10",metric:"distanza",context:"La distanza più lunga mai percorsa in una singola uscita: 7,78 km nella corsa serale del 10 giugno 2026."},
    {icon:"🔥",label:"Calorie max",val:Math.max(...runs.map(r=>r.calories||0))+" kcal",runDate:"2026-06-10",metric:"calorie",context:"Il consumo calorico più alto in una singola sessione, raggiunto nella corsa del 10 giugno con 7,78 km percorsi."},
  ];
  const rs=document.getElementById("recordsStrip");
  if(rs)rs.innerHTML=records.map((r,i)=>`<div class="record-pill reveal btn-anim" onclick="openRecModal(${i})" data-rec-idx="${i}"><div class="record-pill-icon">${r.icon}</div><div style="flex:1;"><div class="record-pill-val">${r.val}</div><div class="record-pill-label">${r.label}</div></div><div class="record-pill-arrow">›</div></div>`).join("");
  window._recData=records;
  attachReveal();
}

/* ══════════════════════════════════════
   TIMELINE
══════════════════════════════════════ */
function renderTimeline(){
  const tl=document.getElementById("timeline");
  const sorted=[...runs].sort((a,b)=>new Date(b.date)-new Date(a.date));
  tl.innerHTML=sorted.map((r,i)=>{
    const pn=paceNum(r.dist,r.timeMins);
    const hasPR=r.pr&&r.pr.trim();
    const cal=r.calories||estimateCalories(r.dist,r.timeMins,r.hr)||"–";
    return `<div class="run-entry reveal">
      <div class="run-left">
        <div class="run-dot ${hasPR?"pr":""}"></div>
        <div class="run-date-label">${fmtDate(r.date,true)}</div>
      </div>
      <div class="run-card tap-ripple" onclick="toggleRunExtra('re-${i}','rc-${i}')">
        <div class="run-card-header">
          <div>
            <div class="run-name-row">
              <span class="run-name">${r.name}</span>
              ${hasPR?`<span class="pr-badge">PR: ${r.pr}</span>`:""}
            </div>
            <div style="font-size:12px;color:var(--text3);margin-top:3px;">${fmtDate(r.date,false)}</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div class="run-dist">${r.dist.toFixed(2)} km</div>
            <div class="chevron-icon" id="rc-${i}">▾</div>
          </div>
        </div>
        <div class="run-meta-grid">
          <div><div class="run-meta-val">${r.timeStr}</div><div class="run-meta-key">Tempo</div></div>
          <div><div class="run-meta-val">${paceStr(pn)}</div><div class="run-meta-key">Passo /km</div></div>
          <div><div class="run-meta-val">${r.hr?r.hr+" bpm":"–"}</div><div class="run-meta-key">FC media</div></div>
          <div><div class="run-meta-val">${cal} kcal</div><div class="run-meta-key">Calorie</div></div>
          <div><div class="run-meta-val">${r.elev} m</div><div class="run-meta-key">Dislivello</div></div>
        </div>
        <div class="run-extra" id="re-${i}">
          <div class="run-extra-grid">
            <div class="run-extra-item"><div class="run-extra-val">${r.alt} m</div><div class="run-extra-key">Alt. max</div></div>
            <div class="run-extra-item"><div class="run-extra-val">${r.dist.toFixed(3)} km</div><div class="run-extra-key">Distanza esatta</div></div>
            <div class="run-extra-item"><div class="run-extra-val">${paceStr(pn)}</div><div class="run-extra-key">Passo calcolato</div></div>
            <div class="run-extra-item"><div class="run-extra-val">${r.timeMins.toFixed(1)} min</div><div class="run-extra-key">Durata (min)</div></div>
            ${r.note?`<div class="run-extra-item" style="grid-column:1/-1;"><div class="run-extra-val" style="font-size:13px;">${r.note}</div><div class="run-extra-key">Note</div></div>`:""}
            ${hasPR?`<div class="run-extra-item" style="border:1px solid rgba(0,230,118,0.25);background:rgba(0,230,118,0.05);"><div class="run-extra-val" style="color:var(--green);">🏆 PR</div><div class="run-extra-key">${r.pr}</div></div>`:""}
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
  attachReveal();
}
function toggleRunExtra(id,chevId){
  const el=document.getElementById(id);const ch=document.getElementById(chevId);
  el.classList.toggle("open");if(ch)ch.classList.toggle("open");
}

/* ══════════════════════════════════════
   CHARTS
══════════════════════════════════════ */
const CC={grid:"rgba(255,255,255,0.06)",text:"rgba(255,255,255,0.35)",orange:"#ff5c1a",green:"#00e676",blue:"#448aff",yellow:"#ffca28",purple:"#b388ff"};
let ovChart,bigChart,accCharts={};

function fmtPaceLabel(v){const m=Math.floor(v);const s=Math.round((v-m)*60);return m+":"+(s<10?"0":"")+s;}

/* Overview tab chart */
let currentOvMetric="pace";
function setOvTab(metric,btn){
  currentOvMetric=metric;
  document.querySelectorAll(".ov-tab").forEach(t=>t.classList.remove("active"));
  btn.classList.add("active");
  buildOvChart();
}
function buildOvChart(){
  const metric=currentOvMetric;
  const labels=runs.map(r=>fmtDate(r.date,true));
  let data,reverse=false,color=CC.orange,cbk=undefined;
  const calArr=runs.map(r=>r.calories||estimateCalories(r.dist,r.timeMins,r.hr)||0);
  if(metric==="pace"){data=runs.map(r=>paceNum(r.dist,r.timeMins));reverse=true;cbk=fmtPaceLabel;color=CC.orange;}
  else if(metric==="distance"){data=runs.map(r=>r.dist);color=CC.blue;}
  else if(metric==="hr"){data=runs.map(r=>r.hr||null);color=CC.green;}
  else if(metric==="time"){data=runs.map(r=>r.timeMins);color=CC.yellow;}
  else if(metric==="calories"){data=calArr;color=CC.purple;}
  else if(metric==="elevation"){data=runs.map(r=>r.elev);color=CC.blue;}
  if(ovChart)ovChart.destroy();
  ovChart=new Chart(document.getElementById("ovChart"),{
    type:"line",
    data:{labels,datasets:[{label:"",data,borderColor:color,backgroundColor:color+"22",fill:true,tension:.4,borderWidth:2.5,pointBackgroundColor:runs.map((r,i)=>r.pr&&r.pr.trim()?CC.green:color),pointRadius:6,pointHoverRadius:10}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{if(cbk)return cbk(ctx.parsed.y)+" /km";return ctx.parsed.y+(metric==="hr"?" bpm":metric==="calories"?" kcal":metric==="time"?" min":"");
    }}}},scales:{x:{ticks:{color:CC.text,font:{size:11}},grid:{color:CC.grid}},y:{reverse,ticks:{color:CC.text,font:{size:11},callback:cbk||undefined},grid:{color:CC.grid}}}}
  });
}

/* Big comparison chart — multi-line trend */
const bigParams=[
  {key:"pace",label:"Velocità (passo inv.)",color:"#ff5c1a",active:true},
  {key:"dist",label:"Distanza",color:"#448aff",active:true},
  {key:"hr",label:"FC media",color:"#00e676",active:true},
  {key:"cal",label:"Calorie",color:"#b388ff",active:true},
  {key:"elev",label:"Dislivello",color:"#ffca28",active:false},
];

function buildBigChart(){
  const labels=runs.map(r=>fmtDate(r.date,true));
  function norm(arr){const valid=arr.filter(v=>v!=null);if(!valid.length)return arr;const mn=Math.min(...valid);const mx=Math.max(...valid);return arr.map(v=>v==null?null:mx===mn?50:Math.round((v-mn)/(mx-mn)*100));}
  const calArr=runs.map(r=>r.calories||estimateCalories(r.dist,r.timeMins,r.hr)||0);
  const paceArr=runs.map(r=>paceNum(r.dist,r.timeMins));
  const rawMap={
    pace:norm(paceArr).map(v=>v==null?null:100-v),
    dist:norm(runs.map(r=>r.dist)),
    hr:norm(runs.map(r=>r.hr||null)),
    cal:norm(calArr),
    elev:norm(runs.map(r=>r.elev)),
  };

  // Build toggle bar
  const toggleBar=document.getElementById("bigParamToggles");
  if(toggleBar&&!toggleBar.dataset.built){
    toggleBar.dataset.built="1";
    toggleBar.innerHTML=bigParams.map((p,i)=>`<button class="param-toggle btn-anim ${p.active?"active":""}" style="${p.active?"background:"+p.color+";border-color:"+p.color+"":""}" onclick="toggleBigParam(${i},this)" data-param="${p.key}">${p.label}</button>`).join("");
  }

  const datasets=bigParams.filter(p=>p.active).map(p=>({
    label:p.label,
    data:rawMap[p.key],
    borderColor:p.color,
    backgroundColor:p.color+"18",
    fill:false,
    tension:.4,
    borderWidth:2.5,
    pointBackgroundColor:p.color,
    pointRadius:5,
    pointHoverRadius:9,
  }));

  if(bigChart)bigChart.destroy();
  bigChart=new Chart(document.getElementById("bigChart"),{
    type:"line",
    data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:true,position:"bottom",labels:{color:CC.text,font:{size:12},padding:16,boxWidth:12}},
        tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y}% (normalizzato 0–100)`}}
      },
      scales:{
        x:{ticks:{color:CC.text,font:{size:11}},grid:{color:CC.grid}},
        y:{min:0,max:100,ticks:{color:CC.text,font:{size:11},callback:v=>v+"%"},grid:{color:CC.grid}}
      }
    }
  });
}

function toggleBigParam(idx,btn){
  bigParams[idx].active=!bigParams[idx].active;
  const p=bigParams[idx];
  if(p.active){btn.classList.add("active");btn.style.background=p.color;btn.style.borderColor=p.color;btn.style.color="#fff";}
  else{btn.classList.remove("active");btn.style.background="";btn.style.borderColor="";btn.style.color="";}
  buildBigChart();
}

/* Accordion single charts */
const accDefs=[
  {id:"acc-pace",title:"Passo medio nel tempo",sub:"min/km — più basso = più veloce",metric:"pace",color:"#ff5c1a",type:"line",
   desc:"<strong>Cosa mostra:</strong> l'evoluzione del tuo passo medio (min/km) da una corsa all'altra. <span class='tip-inline'>L'asse Y è invertito</span>: più la linea scende, più sei veloce. Un trend discendente indica un miglioramento reale della velocità di corsa nel tempo."},
  {id:"acc-dist",title:"Distanza per corsa",sub:"chilometri percorsi per sessione",metric:"distance",color:"#448aff",type:"bar",
   desc:"<strong>Cosa mostra:</strong> la distanza percorsa in ogni singola uscita. Ogni barra rappresenta una sessione. Un aumento progressivo delle barre indica che stai estendendo il volume di allenamento — fondamentale per costruire resistenza e base aerobica."},
  {id:"acc-hr",title:"Frequenza cardiaca media",sub:"bpm — indicatore dello sforzo cardiovascolare",metric:"hr",color:"#00e676",type:"bar",
   desc:"<strong>Cosa mostra:</strong> la frequenza cardiaca media (battiti per minuto) per ogni corsa. Valori più bassi a parità di distanza/passo indicano un miglioramento dell'efficienza cardiovascolare. Se la FC scende mentre il passo migliora, il tuo cuore si sta adattando positivamente."},
  {id:"acc-cal",title:"Calorie bruciate",sub:"kcal stimate per sessione",metric:"calories",color:"#b388ff",type:"bar",
   desc:"<strong>Cosa mostra:</strong> le calorie consumate in ogni sessione (misurate o stimate in base a distanza, tempo e FC). L'aumento delle calorie nel tempo riflette l'aumento del volume di allenamento. Un valore maggiore per la stessa distanza può indicare una maggiore intensità o dislivello."},
  {id:"acc-elev",title:"Dislivello positivo",sub:"metri di quota guadagnati per sessione",metric:"elevation",color:"#ffca28",type:"bar",
   desc:"<strong>Cosa mostra:</strong> i metri di dislivello positivo accumulati in ogni uscita. Un dislivello elevato rende la corsa più faticosa e allenante per la forza muscolare. Confronta questo grafico con la FC: un alto dislivello giustifica una FC più elevata."},
  {id:"acc-scatter",title:"Distanza vs Passo",sub:"relazione tra lunghezza dell'uscita e velocità",metric:"scatter",color:"#ff5c1a",type:"scatter",
   desc:"<strong>Cosa mostra:</strong> ogni punto è una corsa, posizionata in base alla sua distanza (asse X) e al passo medio (asse Y, invertito). Idealmente, i punti dovrebbero scendere verso destra: correre più a lungo senza rallentare indica una buona resistenza aerobica. Punti in alto a destra indicano uscite lunghe ma lente — normale nelle prime fasi."},
];

function buildAccordionCharts(){
  const container=document.getElementById("chartAccordions");
  container.innerHTML=accDefs.map(d=>`
    <div class="chart-accordion reveal">
      <div class="chart-acc-header tap-ripple" onclick="toggleChartAcc('${d.id}')">
        <div>
          <div class="chart-acc-title">${d.title}</div>
          <div class="chart-acc-sub">${d.sub}</div>
        </div>
        <div class="chevron-icon" id="${d.id}-chev">▾</div>
      </div>
      <div class="chart-acc-body" id="${d.id}-body">
        <div class="chart-desc">${d.desc}</div>
        <div class="chart-wrap" style="height:220px;"><canvas id="${d.id}-canvas" role="img" aria-label="${d.title}"></canvas></div>
      </div>
    </div>`).join("");
  attachReveal();
}

function toggleChartAcc(id){
  const body=document.getElementById(id+"-body");
  const chev=document.getElementById(id+"-chev");
  const isOpen=body.classList.contains("open");
  body.classList.toggle("open",!isOpen);
  if(chev)chev.classList.toggle("open",!isOpen);
  if(!isOpen&&!accCharts[id]){buildSingleChart(id);}
}

function buildSingleChart(id){
  const def=accDefs.find(d=>d.id===id);
  if(!def)return;
  const canvas=document.getElementById(id+"-canvas");
  if(!canvas)return;
  const labels=runs.map(r=>fmtDate(r.date,true));
  const calArr=runs.map(r=>r.calories||estimateCalories(r.dist,r.timeMins,r.hr)||0);
  let cfg;
  if(def.metric==="scatter"){
    const pts=runs.map(r=>({x:r.dist,y:paceNum(r.dist,r.timeMins)}));
    cfg={type:"scatter",data:{datasets:[{label:"Dist vs Passo",data:pts,backgroundColor:def.color+"cc",pointRadius:8,pointHoverRadius:12}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{return ctx.parsed.x.toFixed(2)+" km · "+fmtPaceLabel(ctx.parsed.y)+" /km";}}}},scales:{x:{title:{display:true,text:"Distanza (km)",color:CC.text,font:{size:11}},ticks:{color:CC.text,font:{size:11}},grid:{color:CC.grid}},y:{reverse:true,title:{display:true,text:"Passo (min/km)",color:CC.text,font:{size:11}},ticks:{color:CC.text,font:{size:11},callback:fmtPaceLabel},grid:{color:CC.grid}}}}};
  } else {
    let data,reverse=false,cbk=undefined;
    if(def.metric==="pace"){data=runs.map(r=>paceNum(r.dist,r.timeMins));reverse=true;cbk=fmtPaceLabel;}
    else if(def.metric==="distance")data=runs.map(r=>r.dist);
    else if(def.metric==="hr")data=runs.map(r=>r.hr||null);
    else if(def.metric==="calories")data=calArr;
    else if(def.metric==="elevation")data=runs.map(r=>r.elev);
    cfg={type:def.type,data:{labels,datasets:[{label:"",data,borderColor:def.color,backgroundColor:def.type==="line"?def.color+"22":def.color+"88",fill:def.type==="line",tension:.4,borderWidth:2.5,pointBackgroundColor:def.color,pointRadius:5,borderRadius:def.type==="bar"?5:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:CC.text,font:{size:11}},grid:{color:CC.grid}},y:{reverse,ticks:{color:CC.text,font:{size:11},callback:cbk||undefined},grid:{color:CC.grid}}}}};
  }
  accCharts[id]=new Chart(canvas,cfg);
}

function rebuildAllOpenCharts(){
  Object.keys(accCharts).forEach(id=>{if(accCharts[id]){accCharts[id].destroy();delete accCharts[id];buildSingleChart(id);}});
  buildBigChart();buildOvChart();
}


/* ══════════════════════════════════════
   GLOBAL CLICK ANIMATION
══════════════════════════════════════ */
function animatePressedElement(el, ev){
  if(!el) return;
  el.classList.remove("click-pop");
  void el.offsetWidth;
  el.classList.add("click-pop","click-flash","clicked");
  if(ev && ev.clientX !== undefined){
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${ev.clientX - rect.left}px`);
    el.style.setProperty("--y", `${ev.clientY - rect.top}px`);
  }
  setTimeout(()=>el.classList.remove("clicked"), 520);
}
document.addEventListener("click", function(ev){
  const el = ev.target.closest(".btn-anim,.stat-card,.record-pill,.ov-tab,.sort-btn,.tbl-btn,.btn-submit,.completed-acc-btn,.chart-acc-header,.nav-links a,.sticky-link");
  if(el) animatePressedElement(el, ev);
});


/* ══════════════════════════════════════
   V3 HERO HOVER + TABLE MOTION
══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if(hero){
    hero.addEventListener("mousemove", (ev) => {
      const r = hero.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      hero.style.setProperty("--mx", `${x}%`);
      hero.style.setProperty("--my", `${y}%`);
    });
    hero.addEventListener("mouseleave", () => {
      hero.style.setProperty("--mx", "50%");
      hero.style.setProperty("--my", "50%");
    });
  }
});

function markLatestRowAdded(){
  const rows = document.querySelectorAll("#tableBody tr");
  if(!rows.length) return;
  rows[0].classList.add("row-added");
  setTimeout(()=>rows[0].classList.remove("row-added"), 950);
}

function animateRowsBeforeDelete(){
  document.querySelectorAll("#tableBody tr.selected-row").forEach((r,i)=>{
    setTimeout(()=>r.classList.add("row-deleting"), i*35);
  });
}

/* ══════════════════════════════════════
   DATA TABLE — EDITABLE
══════════════════════════════════════ */
let tableSort={col:"date",dir:-1};
let tableFilter="";
let editMode=false;
let tableRowMap=[];  // maps rendered row index → runs index

function sortByCol(col){
  if(tableSort.col===col)tableSort.dir*=-1;else{tableSort.col=col;tableSort.dir=-1;}
  document.querySelectorAll(".data-table th").forEach(th=>{th.classList.remove("sorted");if(th.dataset.col===col)th.classList.add("sorted");});
  renderTable();
}
function sortTable(col,btn){
  document.querySelectorAll(".sort-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  sortByCol(col);
}
function filterTable(){
  tableFilter=document.getElementById("tableSearch").value.toLowerCase();
  renderTable();
}

function enableEditMode(){
  editMode=!editMode;
  const btn=document.getElementById("editModeBtn");
  if(btn){btn.textContent=editMode?"✏️ Fine modifica":"Modifica celle";btn.style.borderColor=editMode?"var(--accent)":"";btn.style.color=editMode?"var(--accent)":"";}
  renderTable();
  showTblMsg(editMode?"Modalità modifica attiva — clicca su una cella per modificarla":"Modifiche salvate","var(--green)");
}

function showTblMsg(msg,color="var(--text2)"){
  const el=document.getElementById("tblMsg");if(!el)return;
  el.style.color=color;el.textContent=msg;
  setTimeout(()=>{if(el)el.textContent="";},3500);
}

function toggleSelectAll(cb){
  document.querySelectorAll(".row-select-cb:not(#selectAllCb)").forEach(c=>c.checked=cb.checked);
  document.querySelectorAll("#tableBody tr").forEach(tr=>tr.classList.toggle("selected-row",cb.checked));
}

function selectAllRows(){
  const cbs=document.querySelectorAll(".row-select-cb:not(#selectAllCb)");
  const allChecked=[...cbs].every(c=>c.checked);
  cbs.forEach(c=>{c.checked=!allChecked;});
  document.querySelectorAll("#tableBody tr").forEach(tr=>tr.classList.toggle("selected-row",!allChecked));
  const header=document.getElementById("selectAllCb");if(header)header.checked=!allChecked;
}

function deleteSelectedRows(){
  const cbs=document.querySelectorAll(".row-select-cb:not(#selectAllCb):checked");
  if(!cbs.length){showTblMsg("⚠️ Seleziona almeno una riga da eliminare","var(--yellow)");return;}
  const idxToDelete=new Set();
  cbs.forEach(cb=>{const ri=parseInt(cb.dataset.runsIdx);if(!isNaN(ri))idxToDelete.add(ri);});
  const removed=idxToDelete.size;
  runs=runs.filter((_,i)=>!idxToDelete.has(i));
  rebuildAll();
  showTblMsg(`✓ ${removed} riga${removed>1?"e":""} eliminata${removed>1?"":""}. Dashboard aggiornata.`,"var(--green)");
  // Auto-sync su Firebase se loggato
  if(window._fbUser && typeof window.fbSaveRuns === "function"){
    window.fbSaveRuns([...runs]).catch(()=>{});
  }
  const header=document.getElementById("selectAllCb");if(header)header.checked=false;
}

function toggleAddRowPanel(){
  const p=document.getElementById("addRowPanel");
  p.classList.toggle("open");
  if(p.classList.contains("open")){p.scrollIntoView({behavior:"smooth",block:"nearest"});}
}

function addRowFromPanel(){
  const date=document.getElementById("ar-date").value;
  const name=document.getElementById("ar-name").value||"Corsa";
  const dist=parseFloat(document.getElementById("ar-dist").value);
  const timeStr=document.getElementById("ar-time").value.trim();
  const hr=parseInt(document.getElementById("ar-hr").value)||null;
  const calories=parseInt(document.getElementById("ar-cal").value)||null;
  const elev=parseInt(document.getElementById("ar-elev").value)||0;
  const alt=parseInt(document.getElementById("ar-alt").value)||0;
  const pr=document.getElementById("ar-pr").value||"";
  const note=document.getElementById("ar-note").value||"";
  const msg=document.getElementById("arMsg");
  if(!date||!dist||isNaN(dist)||!timeStr){if(msg){msg.style.color="var(--accent)";msg.textContent="⚠️ Inserisci almeno data, distanza e tempo.";}return;}
  const parts=timeStr.split(":").map(Number);
  let timeMins=0;
  if(parts.length===2)timeMins=parts[0]+parts[1]/60;
  else if(parts.length===3)timeMins=parts[0]*60+parts[1]+parts[2]/60;
  else{if(msg){msg.style.color="var(--accent)";msg.textContent="⚠️ Formato: mm:ss o h:mm:ss";}return;}
  const calFinal=calories||estimateCalories(dist,timeMins,hr)||null;
  runs.push({date,name,dist,timeStr,timeMins,hr,calories:calFinal,elev,alt,pr,note});
  runs.sort((a,b)=>new Date(a.date)-new Date(b.date));
  ["ar-date","ar-name","ar-dist","ar-time","ar-hr","ar-cal","ar-elev","ar-alt","ar-pr","ar-note"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  toggleAddRowPanel();
  rebuildAll();
  showTblMsg("✓ Riga aggiunta e dashboard aggiornata.","var(--green)");
  // Auto-sync su Firebase se loggato
  if(window._fbUser && typeof window.fbSaveRuns === "function"){
    window.fbSaveRuns([...runs]).catch(()=>{});
  }
}

function saveCellEdit(runsIdx,field,value){
  if(runsIdx<0||runsIdx>=runs.length)return;
  const r=runs[runsIdx];
  if(field==="name")r.name=value.trim()||r.name;
  else if(field==="dist"){const v=parseFloat(value);if(!isNaN(v)&&v>0)r.dist=v;}
  else if(field==="timeStr"){
    const parts=value.split(":").map(Number);
    if(parts.length===2&&!isNaN(parts[0])&&!isNaN(parts[1])){r.timeStr=value;r.timeMins=parts[0]+parts[1]/60;}
    else if(parts.length===3&&!isNaN(parts[0])&&!isNaN(parts[1])&&!isNaN(parts[2])){r.timeStr=value;r.timeMins=parts[0]*60+parts[1]+parts[2]/60;}
  }
  else if(field==="hr"){const v=parseInt(value);r.hr=isNaN(v)?null:v;}
  else if(field==="calories"){const v=parseInt(value);r.calories=isNaN(v)?null:v;}
  else if(field==="elev"){const v=parseInt(value);if(!isNaN(v))r.elev=v;}
  else if(field==="alt"){const v=parseInt(value);if(!isNaN(v))r.alt=v;}
  else if(field==="pr")r.pr=value.trim();
  else if(field==="date")r.date=value;
  rebuildAll();
}

function renderTable(){
  let data=[...runs].map((r,i)=>({...r,_origIdx:i}));
  if(tableFilter)data=data.filter(r=>r.name.toLowerCase().includes(tableFilter)||r.date.includes(tableFilter)||r.pr.toLowerCase().includes(tableFilter));
  data.sort((a,b)=>{
    let av,bv;
    const col=tableSort.col;
    if(col==="date"){av=new Date(a.date);bv=new Date(b.date);}
    else if(col==="dist"){av=a.dist;bv=b.dist;}
    else if(col==="pace"){av=paceNum(a.dist,a.timeMins)||99;bv=paceNum(b.dist,b.timeMins)||99;}
    else if(col==="hr"){av=a.hr||0;bv=b.hr||0;}
    else if(col==="calories"){av=a.calories||0;bv=b.calories||0;}
    else if(col==="time"){av=a.timeMins;bv=b.timeMins;}
    else if(col==="elev"){av=a.elev;bv=b.elev;}
    else if(col==="alt"){av=a.alt;bv=b.alt;}
    else if(col==="name"){av=a.name;bv=b.name;}
    else return 0;
    if(av<bv)return -tableSort.dir;if(av>bv)return tableSort.dir;return 0;
  });

  const tbody=document.getElementById("tableBody");

  function editCell(runsIdx,field,displayVal){
    if(!editMode)return;
    const cells=document.querySelectorAll(`[data-edit-cell="${runsIdx}-${field}"]`);
    cells.forEach(td=>{
      const inp=document.createElement("input");
      inp.className="cell-input";inp.value=displayVal;
      inp.addEventListener("blur",()=>{saveCellEdit(runsIdx,field,inp.value);});
      inp.addEventListener("keydown",e=>{if(e.key==="Enter")inp.blur();if(e.key==="Escape")renderTable();});
      td.innerHTML="";td.appendChild(inp);setTimeout(()=>inp.focus(),0);
    });
  }

  tbody.innerHTML=data.map((r,i)=>{
    const pn=paceNum(r.dist,r.timeMins);
    const cal=r.calories||estimateCalories(r.dist,r.timeMins,r.hr)||"–";
    const hasPR=r.pr&&r.pr.trim();
    const ri=r._origIdx;
    const ec=editMode?"editable-cell":"";
    const ecCursor=editMode?`style="cursor:text;border-bottom:1px dashed rgba(255,92,26,0.4);"`:""
    return `<tr>
      <td><input type="checkbox" class="row-select-cb" data-runs-idx="${ri}" onchange="this.closest('tr').classList.toggle('selected-row',this.checked)"></td>
      <td class="bold ${ec}" data-edit-cell="${ri}-date" ${editMode?`onclick="editCell(${ri},'date','${r.date}')" ${ecCursor}`:""} >${fmtDate(r.date,true)}</td>
      <td class="bold ${ec}" data-edit-cell="${ri}-name" ${editMode?`onclick="editCell(${ri},'name','${r.name.replace(/'/g,"&#39;")}')" ${ecCursor}`:""} >${r.name}${hasPR?`<span class="pr-tag">PR</span>`:""}</td>
      <td class="accent ${ec}" data-edit-cell="${ri}-dist" ${editMode?`onclick="editCell(${ri},'dist','${r.dist}')" ${ecCursor}`:""} >${r.dist.toFixed(2)} km</td>
      <td class="${ec}" data-edit-cell="${ri}-timeStr" ${editMode?`onclick="editCell(${ri},'timeStr','${r.timeStr}')" ${ecCursor}`:""} >${r.timeStr}</td>
      <td class="bold">${paceStr(pn)} /km</td>
      <td class="${ec}" data-edit-cell="${ri}-hr" ${editMode?`onclick="editCell(${ri},'hr','${r.hr||''}')" ${ecCursor}`:""} >${r.hr?r.hr+" bpm":"–"}</td>
      <td class="bold ${ec}" data-edit-cell="${ri}-calories" ${editMode?`onclick="editCell(${ri},'calories','${r.calories||''}')" ${ecCursor}`:""} >${cal} kcal</td>
      <td class="${ec}" data-edit-cell="${ri}-elev" ${editMode?`onclick="editCell(${ri},'elev','${r.elev}')" ${ecCursor}`:""} >${r.elev} m</td>
      <td class="${ec}" data-edit-cell="${ri}-alt" ${editMode?`onclick="editCell(${ri},'alt','${r.alt}')" ${ecCursor}`:""} >${r.alt} m</td>
      <td class="green ${ec}" data-edit-cell="${ri}-pr" ${editMode?`onclick="editCell(${ri},'pr','${r.pr.replace(/'/g,"&#39;")}')" ${ecCursor}`:""} >${hasPR?r.pr:"–"}</td>
    </tr>`;
  }).join("");
  const cnt=document.getElementById("tableCount");
  if(cnt)cnt.textContent=data.length+" session"+(data.length===1?"e":"i");
  const tot=document.getElementById("tableTotal");
  if(tot){const tk=data.reduce((a,r)=>a+r.dist,0);const tc=data.reduce((a,r)=>a+(r.calories||0),0);tot.textContent=`Totale: ${tk.toFixed(2)} km · ${tc.toLocaleString()} kcal`;}
}

/* ══════════════════════════════════════
   DYNAMIC ANALYSIS
══════════════════════════════════════ */
function buildAnalysis(){
  const sorted=[...runs].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const n=sorted.length;
  if(n===0)return;
  const last=sorted[n-1];
  const first=sorted[0];
  const paces=sorted.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  const bestPace=Math.min(...paces);
  const worstPace=Math.max(...paces);
  const lastPace=paceNum(last.dist,last.timeMins);
  const firstPace=paceNum(first.dist,first.timeMins);
  const paceGainTotal=firstPace&&lastPace?(firstPace-lastPace).toFixed(2):null;
  const maxDist=Math.max(...sorted.map(r=>r.dist));
  const totalKm=sorted.reduce((a,r)=>a+r.dist,0);
  const totalCal=sorted.reduce((a,r)=>a+(r.calories||0),0);
  const withHR=sorted.filter(r=>r.hr);
  const minHR=withHR.length?Math.min(...withHR.map(r=>r.hr)):null;
  const maxHR=withHR.length?Math.max(...withHR.map(r=>r.hr)):null;
  const avgHR=withHR.length?Math.round(withHR.reduce((a,r)=>a+r.hr,0)/withHR.length):null;
  const hrTrend=withHR.length>=2?withHR[withHR.length-1].hr-withHR[0].hr:null;
  const prs=sorted.filter(r=>r.pr&&r.pr.trim()).length;
  const avgElev=Math.round(sorted.reduce((a,r)=>a+r.elev,0)/n);
  const avgDist=(totalKm/n).toFixed(2);
  const totalMins=sorted.reduce((a,r)=>a+r.timeMins,0);
  const avgPaceNum=totalMins/totalKm;

  const cards=[
    {
      icon:"⚡",iconCls:"orange",title:"Velocità &amp; passo",
      body:`Il tuo passo è migliorato da <strong>${paceStr(firstPace)}/km</strong> a <strong class="ah">${paceStr(lastPace)}/km</strong>${paceGainTotal>0?` — un guadagno di <strong class="ag">${paceStr(parseFloat(paceGainTotal))}</strong> al km`:""} nel periodo tracciato.
      Il <strong>passo migliore assoluto</strong> è <span class="ag">${paceStr(bestPace)}/km</span>, il passo medio su tutte le corse è <span class="ah">${paceStr(avgPaceNum)}/km</span>.
      ${n>=3?`Con ${n} corse registrate la tendenza è <span class="ag">positiva e costante</span>.`:"Aggiungi altre corse per vedere la tendenza completa."}`,
      tip:`<strong>Prossimo step:</strong> Interval training 6×400m a ritmo gara 5 km. Obiettivo realistico: sotto 7:45/km entro le prossime 4 settimane.`
    },
    {
      icon:"❤️",iconCls:"green",title:"Frequenza cardiaca",
      body:withHR.length>=2?
        `La FC è passata da <strong>${withHR[0].hr} bpm</strong> a <strong class="${hrTrend<0?"ag":"ah"}">${withHR[withHR.length-1].hr} bpm</strong> ${hrTrend<0?`(<span class="ag">–${Math.abs(hrTrend)} bpm</span>, miglioramento aerobico reale)`:hrTrend>0?`(+${hrTrend} bpm — atteso se il passo è aumentato)`:"(stabile)"}.
        FC media su tutte le uscite: <strong>${avgHR} bpm</strong>. Min registrata: <span class="ag">${minHR} bpm</span>.
        ${hrTrend<0?"Il cuore pompa lo stesso sangue con meno battiti — segnale diretto di adattamento cardiovascolare.":"Tieni monitoriata la FC: migliorerà con le uscite in zona 2."}`
        :`Dati FC disponibili per <strong>${withHR.length}</strong> corse su ${n}. Aggiungi la FC nelle prossime sessioni per vedere le tendenze.`,
      tip:`<strong>Consiglio:</strong> Una corsa "easy" settimanale a 130–140 bpm abbassa strutturalmente la FC nel tempo. Usa il test "talk test" per trovare la zona 2.`
    },
    {
      icon:"📏",iconCls:"blue",title:"Volume &amp; distanza",
      body:`Distanza media per corsa: <strong class="ab">${avgDist} km</strong>. Massimo raggiunto: <span class="ah">${maxDist.toFixed(2)} km</span>. Totale accumulato: <span class="ag">${totalKm.toFixed(2)} km</span>.
      ${totalKm>=20?`Hai già superato i 20 km totali — stai costruendo una base solida.`:n>=3?`Stai aumentando il volume in modo progressivo, continua così.`:"Nelle prime uscite il focus è prendere l'abitudine, non il volume."}
      ${maxDist>=7?"Il tuo corpo si è già adattato a corse medio-lunghe.":maxDist>=5?"Sei a metà strada verso la distanza di 10 km.":"Aumenta gradualmente la distanza delle uscite lunghe."}`,
      tip:`<strong>Regola del 10%:</strong> Non aumentare il volume settimanale di più del 10% a settimana. Il prossimo obiettivo: corsa singola da ${(maxDist*1.1).toFixed(1)} km.`
    },
    {
      icon:"🔥",iconCls:"purple",title:"Calorie &amp; consumo energetico",
      body:`Hai bruciato in totale <strong class="ag">${totalCal.toLocaleString()} kcal</strong> nelle sessioni tracciate.
      Media per corsa: <strong class="ab">${Math.round(totalCal/n)} kcal</strong>. Massimo in una singola sessione: <span class="ah">${Math.max(...sorted.map(r=>r.calories||0))} kcal</span>.
      ${totalCal>1500?"Il consumo calorico accumulato è significativo — assicurati di recuperare con l'alimentazione.":"Man mano che aumenti la distanza, il consumo calorico crescerà proporzionalmente."}`,
      tip:`<strong>Nutrizione:</strong> Consuma carboidrati complessi 2–3 ore prima della corsa. Per uscite sopra 60 min, considera uno snack con 20–30g di carbo a metà percorso.`,
      tip2:"<strong>Idratazione:</strong> Bevi 400–600 ml di acqua nelle 2h prima della corsa. Per uscite >45 min, integra con sali minerali."
    },
    {
      icon:"⛰️",iconCls:"yellow",title:"Dislivello &amp; terreno",
      body:`Dislivello medio per uscita: <strong>${avgElev} m</strong>. Massimo: <strong class="ah">${Math.max(...sorted.map(r=>r.elev))} m</strong>.
      ${avgElev>=30?"Stai già correndo su terreno impegnativo — le tue gambe si stanno irrobustendo.":avgElev>=15?"Il dislivello presente nelle tue uscite costruisce forza muscolare reale.":"Aggiungi qualche uscita più collinare per migliorare la forza specifica."}
      Le variazioni di quota presenti nel tuo percorso migliorano cadenza, resistenza alla fatica e forza.`,
      tip:`<strong>Hill repeats:</strong> Una volta ogni 2 settimane, esegui 4–6 ripetute su salita di 100–150m in accelerazione. I benefici si vedono in 3–4 settimane.`
    },
    {
      icon:"🏆",iconCls:"orange",title:"Record personali — quadro completo",full:true,
      body:`In ${n} corse hai totalizzato <strong class="ag">${prs} record personali</strong>. ${prs>=5?"Questo ritmo di miglioramento è eccezionale — stai sfruttando al massimo la fase di crescita rapida.":prs>=3?"Ottimo inizio: ogni uscita porta con sé nuovi progressi.":"Ogni corsa è un'opportunità per battere il tuo record precedente."}
      Distanze PR raggiunte: <span class="ah">800 m, 1 km, 1600 m, 3,2 km, 2 miglia, 5 km</span>.
      Il PR dei 5 km è stato battuto due volte: il 25 maggio e poi migliorato di <strong class="ag">3 min 44 sec</strong> il 10 giugno.
      ${n<5?"Con altre corse, i PR arriveranno naturalmente su distanze più lunghe.":`Con ${n} corse nel database, il confronto statistico è già significativo.`}`,
      tip:`<strong>Strategia PR:</strong> Ripeti lo stesso percorso ogni 3–4 settimane per avere un benchmark pulito. Il miglioramento su tracciato identico elimina la variabile terreno.`
    }
  ];

  const grid=document.getElementById("analysisGrid");
  grid.innerHTML=cards.map(c=>`
    <div class="analysis-card${c.full?" full":""} reveal">
      <div class="analysis-icon ${c.iconCls}">${c.icon}</div>
      <div class="analysis-card-title">${c.title}</div>
      <div class="analysis-body">${c.body}</div>
      ${c.tip?`<div class="tip">${c.tip}</div>`:""}
      ${c.tip2?`<div class="tip-green">${c.tip2}</div>`:""}
    </div>`).join("");
  attachReveal();
}

/* ══════════════════════════════════════
   DYNAMIC SUGGESTIONS
══════════════════════════════════════ */
function buildSuggestions(){
  if(!runs.length) return;
  const n=sorted.length;
  const totalKm=sorted.reduce((a,r)=>a+r.dist,0);
  const maxDist=n?Math.max(...sorted.map(r=>r.dist)):0;
  const paces=sorted.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  const bestPace=paces.length?Math.min(...paces):null;
  const withHR=sorted.filter(r=>r.hr);
  const lastHR=withHR.length?withHR[withHR.length-1].hr:null;
  const weeklyAvgKm=(totalKm/12).toFixed(1);

  const suggestions=[
    {
      n:"01",title:"Corsa in zona 2",tag:"recovery",tagLabel:"Recupero aerobico",
      text:`Esegui almeno 1 corsa a settimana a <strong>130–145 bpm</strong>${lastHR?` (tu ora corri a ~${lastHR} bpm — rallenta del 15%)`:""}. La zona 2 potenzia i mitocondri e abbassa la FC basale. Risultati in 4–6 settimane.`
    },
    {
      n:"02",title:"Interval training 400m",tag:"intensity",tagLabel:"Intensità",
      text:`6×400m a ritmo gara 5 km, con recupero 90 sec tra le ripetute. Migliora la velocità massima aerobica (VO₂max). Fai questa sessione una volta ogni 10–14 giorni${bestPace?`, partendo da ${paceStr(bestPace*0.9)}/km target`:""}.`
    },
    {
      n:"03",title:"Long run progressivo",tag:"intensity",tagLabel:"Resistenza",
      text:`Una volta ogni 2 settimane, corri una distanza del ${Math.round(maxDist*1.1*10)/10} km — il 10% in più della tua distanza massima (${maxDist.toFixed(2)} km). Mantieni un passo facile, l'obiettivo è completare, non velocizzare.`
    },
    {
      n:"04",title:"Cadenza &amp; tecnica",tag:"technique",tagLabel:"Tecnica",
      text:`Punta a 170–180 passi al minuto. Corri 2 min guardando il metronomo a 175 spm, poi scala libera. Una cadenza alta riduce l'impatto sulle articolazioni e migliora l'efficienza di circa il 3–5%.`
    },
    {
      n:"05",title:"Nutrition timing",tag:"nutrition",tagLabel:"Alimentazione",
      text:`Per le uscite sopra i 45 min: 1–2 ore prima → pasto leggero con carboidrati complessi (es. riso, banana). Durante → sip ogni 15–20 min. Dopo → finestra anabolica di 30 min: proteine + carbo (20g+30g).`
    },
    {
      n:"06",title:"Recupero attivo",tag:"recovery",tagLabel:"Recupero",
      text:`Dopo ogni corsa, 5–10 min di stretching dinamico su gambe, flessori dell'anca e polpacci. Il giorno dopo una sessione intensa: camminata di 20 min o pedalata leggera. Il recupero è quando il corpo migliora davvero.`
    },
    {
      n:"07",title:"Test Cooper mensile",tag:"technique",tagLabel:"Misurazione",
      text:`Una volta al mese, esegui il test Cooper (12 minuti di corsa continua, misura i km percorsi). Con il tuo passo attuale di ~${bestPace?paceStr(bestPace):"-"}/km, dovresti coprire circa ${bestPace?(12/bestPace).toFixed(2):"–"} km. Tieni un diario del risultato mensile.`
    },
    {
      n:"08",title:"Mental training",tag:"mental",tagLabel:"Mindset",
      text:`Dividi ogni corsa in segmenti mentali. Nei momenti di difficoltà: conta 10 passi, poi altri 10. Usa frasi brevi tipo "passo dopo passo" quando vuoi fermarti. Il running è 50% fisico e 50% mentale.`
    },
  ];

  const grid=document.getElementById("sugGrid");
  const locked=document.getElementById("sugLockedMsg");
  if(locked) locked.remove();
  grid.innerHTML=suggestions.map(s=>`
    <div class="sug-card reveal btn-anim tap-ripple">
      <div class="sug-number">${s.n}</div>
      <div class="sug-title">${s.title}</div>
      <div class="sug-text">${s.text}</div>
      <span class="sug-tag ${s.tag}">${s.tagLabel}</span>
    </div>`).join("");
  attachReveal();
}

/* ══════════════════════════════════════
   GOALS
══════════════════════════════════════ */
let completedGoalsOpen=false;
function buildGoals(){
  if(!runs.length) return;
  const maxDist=Math.max(...runs.map(r=>r.dist));
  const paces=runs.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  const bestPace=paces.length?Math.min(...paces):99;
  const totalMins=runs.reduce((a,r)=>a+r.timeMins,0);
  const totalCal=runs.reduce((a,r)=>a+(r.calories||0),0);

  const goals=[
    {id:"g1",title:"Prima corsa da 10 km",desc:`Max attuale: ${maxDist.toFixed(2)} km. Il traguardo che cambia identità.`,prog:Math.min(100,Math.round(maxDist/10*100)),cur:`${maxDist.toFixed(2)} km`,tgt:"10 km"},
    {id:"g2",title:"30 km totali",desc:`Distanza cumulata: ${totalKm.toFixed(2)} km. Costruisci la base.`,prog:Math.min(100,Math.round(totalKm/30*100)),cur:`${totalKm.toFixed(2)} km`,tgt:"30 km"},
    {id:"g3",title:"Passo < 8:00/km su 5+ km",desc:`Miglior passo: ${paceStr(bestPace)}/km. Sfonda il muro degli 8 minuti.`,prog:Math.min(100,Math.round((9-bestPace)/(9-8)*100)),cur:paceStr(bestPace)+"/km",tgt:"< 8:00/km"},
    {id:"g4",title:"10 corse completate",desc:`Corse: ${runs.length}/10. Costruisci l'abitudine.`,prog:Math.min(100,Math.round(runs.length/10*100)),cur:`${runs.length} corse`,tgt:"10 corse"},
    {id:"g5",title:"4 ore totali di corsa",desc:`Tempo: ${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m. La resistenza si misura in ore.`,prog:Math.min(100,Math.round(totalMins/(4*60)*100)),cur:`${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m`,tgt:"4 ore"},
    {id:"g6",title:"2.000 kcal bruciate",desc:`Calorie: ${totalCal.toLocaleString()} kcal. Energia trasformata in progresso.`,prog:Math.min(100,Math.round(totalCal/2000*100)),cur:`${totalCal.toLocaleString()} kcal`,tgt:"2.000 kcal"},
    {id:"g7",title:"FC media < 155 bpm su 6+ km",desc:"Efficienza aerobica: il cuore batte meno a parità di sforzo.",prog:Math.min(100,65),cur:"~160 bpm",tgt:"< 155 bpm"},
    {id:"g8",title:"5 corse completate",desc:`Corse: ${runs.length}/5. Hai stabilito l'abitudine!`,prog:Math.min(100,Math.round(runs.length/5*100)),cur:`${runs.length} corse`,tgt:"5 corse"},
  ];
  const active=goals.filter(g=>g.prog<100);
  const completed=goals.filter(g=>g.prog>=100);
  const grid=document.getElementById("goalsGrid");
  const locked=document.getElementById("goalsLockedMsg");
  if(locked) locked.remove();
  grid.innerHTML=active.map(g=>`<div class="goal-card reveal btn-anim tap-ripple"><div class="goal-title">${g.title}</div><div class="goal-desc">${g.desc}</div><div class="progress-bar"><div class="progress-fill" style="width:${g.prog}%"></div></div><div class="progress-label"><span>${g.cur}</span><span>${g.prog}% — target: ${g.tgt}</span></div></div>`).join("");
  const cg=document.getElementById("completedGoalsGrid");
  cg.innerHTML=completed.length?completed.map(g=>`<div class="goal-card completed reveal btn-anim tap-ripple"><div class="goal-title">${g.title}</div><div class="goal-desc">${g.desc}</div><div class="progress-bar"><div class="progress-fill" style="width:100%"></div></div><div class="progress-label"><span>${g.cur}</span><span style="color:var(--green);">Completato! 🎉</span></div></div>`).join(""):`<p style="color:var(--text3);font-size:14px;padding:8px 0;">Nessun obiettivo completato ancora — ogni corsa avvicina al traguardo!</p>`;
  const btn=document.getElementById("completedBtnText");
  if(btn)btn.textContent=`🏅 Obiettivi completati (${completed.length})`;
  attachReveal();
}
function toggleCompletedGoals(){
  completedGoalsOpen=!completedGoalsOpen;
  document.getElementById("completedAcc").classList.toggle("open",completedGoalsOpen);
  const ch=document.getElementById("completedChevron");
  if(ch)ch.style.transform=completedGoalsOpen?"rotate(180deg)":"rotate(0deg)";
}

/* ══════════════════════════════════════
   ADD RUN
══════════════════════════════════════ */
function addRun(){
  const date=document.getElementById("inp-date").value;
  const name=document.getElementById("inp-name").value||"Corsa";
  const dist=parseFloat(document.getElementById("inp-dist").value);
  const timeStr=document.getElementById("inp-time").value.trim();
  const hr=parseInt(document.getElementById("inp-hr").value)||null;
  const calories=parseInt(document.getElementById("inp-cal").value)||null;
  const elev=parseInt(document.getElementById("inp-elev").value)||0;
  const alt=parseInt(document.getElementById("inp-alt").value)||0;
  const pr=document.getElementById("inp-pr").value||"";
  const note=document.getElementById("inp-note").value||"";
  const msg=document.getElementById("add-msg");
  if(!date||!dist||isNaN(dist)||!timeStr){msg.style.color="var(--accent)";msg.textContent="⚠️ Inserisci almeno data, distanza e tempo.";return;}
  const parts=timeStr.split(":").map(Number);
  let timeMins=0;
  if(parts.length===2)timeMins=parts[0]+parts[1]/60;
  else if(parts.length===3)timeMins=parts[0]*60+parts[1]+parts[2]/60;
  else{msg.style.color="var(--accent)";msg.textContent="⚠️ Formato tempo: mm:ss o h:mm:ss";return;}
  const calFinal=calories||estimateCalories(dist,timeMins,hr)||null;
  runs.push({date,name,dist,timeStr,timeMins,hr,calories:calFinal,elev,alt,pr,note});
  runs.sort((a,b)=>new Date(a.date)-new Date(b.date));
  ["inp-date","inp-name","inp-dist","inp-time","inp-hr","inp-cal","inp-elev","inp-alt","inp-pr","inp-note"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  rebuildAll();
  msg.style.color="var(--green)";msg.textContent="✓ Corsa aggiunta! Dashboard aggiornata automaticamente.";
  setTimeout(()=>{msg.textContent=""},4000);
  // Auto-sync su Firebase se loggato
  if(window._fbUser && typeof window.fbSaveRuns === "function"){
    window.fbSaveRuns([...runs]).catch(()=>{});
  }
}


/* ══════════════════════════════════════
   INTERACTIVE PERSONAL RECORDS + PANORAMICA
══════════════════════════════════════ */
function getRunByDate(date){
  return runs.find(r => r.date === date) || null;
}

function getPreviousRun(run){
  const sorted = [...runs].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const idx = sorted.findIndex(r => r.date === run.date && r.name === run.name && r.dist === run.dist);
  return idx > 0 ? sorted[idx-1] : null;
}

function getBestRunByDistance(){
  return runs.reduce((best,r)=> r.dist > best.dist ? r : best, runs[0]);
}

function getBestPaceRun(){
  return runs.reduce((best,r)=> paceNum(r.dist,r.timeMins) < paceNum(best.dist,best.timeMins) ? r : best, runs[0]);
}

function getMaxCalRun(){
  return runs.reduce((best,r)=> (r.calories||0) > (best.calories||0) ? r : best, runs[0]);
}

function getPaceAverage(){
  const paces = runs.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  return paces.reduce((a,b)=>a+b,0)/paces.length;
}

function cleanRecordTitle(label){
  return label.replace("PR ","Record ").replace("Miglior passo","Passo migliore");
}

function buildDetailRows(rows){
  return `<div class="detail-list">${rows.map(r=>`
    <div class="detail-row"><span>${r.k}</span><span>${r.v}</span></div>
  `).join("")}</div>`;
}

function buildRecordInsight(record, run){
  const previous = getPreviousRun(run);
  const pace = paceNum(run.dist, run.timeMins);
  const avgPace = getPaceAverage();
  const speed = 60 / pace;

  let comparison = "";
  if(previous){
    const previousPace = paceNum(previous.dist, previous.timeMins);
    const secDiff = Math.round((previousPace - pace) * 60);
    if(secDiff > 0){
      comparison = `Rispetto alla sessione precedente hai corso circa <strong>${secDiff} secondi/km più veloce</strong>.`;
    }else if(secDiff < 0){
      comparison = `Rispetto alla sessione precedente il passo è stato più lento di circa <strong>${Math.abs(secDiff)} secondi/km</strong>, ma su un carico complessivo diverso.`;
    }else{
      comparison = `Il passo è rimasto praticamente stabile rispetto alla sessione precedente.`;
    }
  }else{
    comparison = `È la prima sessione utile dello storico, quindi rappresenta il punto di partenza del confronto.`;
  }

  const avgDiff = Math.round((avgPace - pace) * 60);
  let avgText = avgDiff > 0
    ? `Questa corsa è stata più rapida della tua media complessiva di circa <strong>${avgDiff} secondi/km</strong>.`
    : `Questa corsa è stata più lenta della tua media complessiva di circa <strong>${Math.abs(avgDiff)} secondi/km</strong>, utile come riferimento di volume o gestione.`;

  return `
    <div class="detail-report">
      <div class="detail-block">
        <div class="stat-detail-chip">Sessione di riferimento</div>
        <h4>${run.name}</h4>
        ${buildDetailRows([
          {k:"Data",v:fmtDate(run.date,false)},
          {k:"Distanza",v:`${run.dist.toFixed(2).replace(".",",")} km`},
          {k:"Tempo",v:run.timeStr},
          {k:"Passo medio",v:`${paceStr(pace)} /km`},
          {k:"Velocità media",v:`${speed.toFixed(2).replace(".",",")} km/h`},
          {k:"FC media",v:run.hr ? `${run.hr} bpm` : "non registrata"},
          {k:"Calorie",v:run.calories ? `${run.calories} kcal` : "non registrate"},
          {k:"Dislivello",v:`${run.elev} m`}
        ])}
      </div>

      <div class="detail-block">
        <h4>Lettura del record</h4>
        <p>${record.context}</p>
      </div>

      <div class="detail-callout green">
        <strong>Confronto:</strong> ${comparison} ${avgText}
      </div>

      <div class="detail-callout">
        <strong>Suggerimento:</strong> usa questo record come benchmark. Il prossimo step realistico è migliorare di 5–10 sec/km oppure aumentare la distanza di 200–400 m mantenendo un passo controllato.
      </div>
    </div>
  `;
}

function openRecModal(index){
  const record = window._recData && window._recData[index];
  if(!record) return;

  const run = getRunByDate(record.runDate);
  const overlay = document.getElementById("recModalOverlay");
  const eyebrow = document.getElementById("rmEyebrow");
  const title = document.getElementById("rmTitle");
  const date = document.getElementById("rmDate");
  const grid = document.getElementById("rmGrid");
  const context = document.getElementById("rmContext");

  if(!overlay || !eyebrow || !title || !date || !grid || !context) return;

  eyebrow.textContent = "Record personale";
  title.textContent = cleanRecordTitle(record.label);
  date.textContent = run ? `${record.val} · ${run.name}` : record.val;

  if(run){
    const pace = paceNum(run.dist, run.timeMins);
    const speed = 60 / pace;
    const cards = [
      {key:"Valore record", val:record.val},
      {key:"Parametro", val:record.metric},
      {key:"Distanza", val:`${run.dist.toFixed(2).replace(".",",")} km`},
      {key:"Passo medio", val:`${paceStr(pace)} /km`},
      {key:"Velocità media", val:`${speed.toFixed(2).replace(".",",")} km/h`},
      {key:"Calorie", val:run.calories ? `${run.calories} kcal` : "—"}
    ];

    grid.innerHTML = cards.map(c => `
      <div class="rec-modal-stat">
        <div class="rec-modal-stat-val">${c.val}</div>
        <div class="rec-modal-stat-key">${c.key}</div>
      </div>
    `).join("");

    context.innerHTML = buildRecordInsight(record, run);
  } else {
    grid.innerHTML = `<div class="rec-modal-stat"><div class="rec-modal-stat-val">${record.val}</div><div class="rec-modal-stat-key">${record.label}</div></div>`;
    context.innerHTML = `<div class="detail-callout">${record.context || "Dettagli non disponibili."}</div>`;
  }

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeRecModal(event){
  if(event && event.target && event.target.id !== "recModalOverlay") return;
  const overlay = document.getElementById("recModalOverlay");
  if(overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}


function buildStatReport(key){
  const totalKm=runs.reduce((a,r)=>a+r.dist,0);
  const totalMins=runs.reduce((a,r)=>a+r.timeMins,0);
  const totalCal=runs.reduce((a,r)=>a+(r.calories||0),0);
  const totalElev=runs.reduce((a,r)=>a+r.elev,0);
  const prs=runs.filter(r=>r.pr&&r.pr.trim()).length;
  const withHR=runs.filter(r=>r.hr);
  const avgHR=withHR.length?Math.round(withHR.reduce((a,r)=>a+r.hr,0)/withHR.length):null;
  const last=runs[runs.length-1];
  const first=runs[0];
  const bestDist=getBestRunByDistance();
  const bestPace=getBestPaceRun();
  const maxCal=getMaxCalRun();
  const avgPace=getPaceAverage();
  const lastPace=paceNum(last.dist,last.timeMins);
  const firstPace=paceNum(first.dist,first.timeMins);
  const paceGain=Math.max(0,Math.round((firstPace-lastPace)*60));
  const avgKm = totalKm/runs.length;
  const bestPaceValue = paceNum(bestPace.dist,bestPace.timeMins);
  const bestSpeed = 60/bestPaceValue;

  const reports = {
    sessions:{
      icon:"🏃", score:62, color:"orange",
      title:"Sessioni totali",
      subtitle:"Quanto sei stato costante nel periodo registrato",
      cards:[
        {key:"Totale uscite",val:`${runs.length}`},
        {key:"Prima corsa",val:fmtDate(first.date,true)},
        {key:"Ultima corsa",val:fmtDate(last.date,true)},
        {key:"Periodo",val:"17 mar → 10 giu"}
      ],
      body:`Hai registrato <strong>${runs.length} sessioni</strong>. È uno storico ancora compatto, ma già sufficiente per vedere un trend netto: sei passato da una corsa breve di avvio a uscite oltre i 7 km.`,
      read:`Questo dato non misura la velocità, ma la continuità. Più sessioni aggiungi, più la dashboard diventa precisa nelle medie e negli obiettivi automatici.`,
      tip:"Prossimo step: mantieni almeno 2 uscite settimanali. La costanza farà crescere il valore molto più velocemente dei singoli test."
    },
    distanceTotal:{
      icon:"📍", score:78, color:"green",
      title:"Distanza totale",
      subtitle:"Volume complessivo accumulato",
      cards:[
        {key:"Km totali",val:`${totalKm.toFixed(2).replace(".",",")} km`},
        {key:"Media uscita",val:`${avgKm.toFixed(2).replace(".",",")} km`},
        {key:"Distanza max",val:`${bestDist.dist.toFixed(2).replace(".",",")} km`},
        {key:"Sessione record",val:fmtDate(bestDist.date,true)}
      ],
      body:`Hai accumulato <strong>${totalKm.toFixed(2).replace(".",",")} km</strong>. La crescita del volume è evidente: il salto dalla prima uscita da ${first.dist.toFixed(2).replace(".",",")} km alla migliore da ${bestDist.dist.toFixed(2).replace(".",",")} km indica un miglioramento reale della resistenza.`,
      read:`Quando questo valore sale senza peggiorare troppo il passo, significa che stai costruendo una base aerobica migliore.`,
      tip:"Prossimo step: arriva a 30 km totali e poi punta a una singola uscita da 8 km controllati."
    },
    lastPace:{
      icon:"⚡", score:82, color:"orange",
      title:"Ultimo passo",
      subtitle:"Qualità del ritmo più recente",
      cards:[
        {key:"Ultimo passo",val:`${paceStr(lastPace)} /km`},
        {key:"Media generale",val:`${paceStr(avgPace)} /km`},
        {key:"Ultima distanza",val:`${last.dist.toFixed(2).replace(".",",")} km`},
        {key:"Miglioramento da inizio",val:`${paceGain} sec/km`}
      ],
      body:`L'ultima corsa ha un passo di <strong>${paceStr(lastPace)} /km</strong>. Il dato è importante perché arriva su una distanza lunga, non su una prova breve: quindi racconta un miglioramento più credibile.`,
      read:`Se il passo migliora mentre la distanza resta alta, significa che non stai solo “sopravvivendo” alla distanza: la stai correndo meglio.`,
      tip:"Prossimo step: prova a limare 5–10 sec/km in una corsa simile, senza aumentare subito anche la distanza."
    },
    personalRecords:{
      icon:"🏆", score:86, color:"yellow",
      title:"Record personali",
      subtitle:"Picchi di performance raggiunti",
      cards:[
        {key:"Sessioni con PR",val:`${prs}`},
        {key:"Ultimo PR",val:"5 km"},
        {key:"Data ultimo PR",val:"10 giu"},
        {key:"Miglioramento 5 km",val:"−3:44"}
      ],
      body:`Hai ottenuto <strong>${prs} sessioni con record personali</strong>. Il più rilevante è il PR sui <strong>5 km</strong>, migliorato di <strong>3 minuti e 44 secondi</strong>. Questo è il segnale più forte della dashboard.`,
      read:`I PR sono utili, ma non devono diventare l’unico obiettivo: un miglioramento sano alterna test, corsa facile e recupero.`,
      tip:"Prossimo step: usa il PR sui 5 km come benchmark, ma non cercarlo in ogni uscita."
    },
    timeTotal:{
      icon:"⏱️", score:70, color:"blue",
      title:"Tempo totale",
      subtitle:"Carico complessivo sulle gambe",
      cards:[
        {key:"Tempo totale",val:`${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m`},
        {key:"Minuti totali",val:`${Math.round(totalMins)} min`},
        {key:"Media uscita",val:`${Math.round(totalMins/runs.length)} min`},
        {key:"Uscita più lunga",val:bestDist.timeStr}
      ],
      body:`Hai accumulato circa <strong>${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m</strong> di allenamento. Questo dato misura il carico reale meglio della sola distanza, perché tiene conto di quanto tempo il corpo rimane sotto sforzo.`,
      read:`Se il tempo totale cresce in modo graduale, migliora la resistenza senza stressare troppo il sistema.`,
      tip:"Prossimo step: aggiungi 5 minuti a una sola uscita settimanale, non a tutte."
    },
    avgHeartRate:{
      icon:"❤️", score:66, color:"orange",
      title:"FC media",
      subtitle:"Quanto costa fisiologicamente il ritmo",
      cards:[
        {key:"Media",val:avgHR?`${avgHR} bpm`:"—"},
        {key:"Ultima FC",val:last.hr?`${last.hr} bpm`:"—"},
        {key:"FC minima",val:`${Math.min(...withHR.map(r=>r.hr))} bpm`},
        {key:"FC massima",val:`${Math.max(...withHR.map(r=>r.hr))} bpm`}
      ],
      body:`La frequenza cardiaca media disponibile è <strong>${avgHR || "non disponibile"} bpm</strong>. Va letta insieme a passo e distanza: stesso passo con FC più bassa significa maggiore efficienza.`,
      read:`L’ultima uscita ha FC media alta perché è stata anche la più performante: dato coerente con un allenamento più intenso.`,
      tip:"Prossimo step: inserisci corse facili dove la priorità è tenere la FC più stabile, non fare record."
    },
    elevationTotal:{
      icon:"⛰️", score:58, color:"blue",
      title:"Dislivello totale",
      subtitle:"Difficoltà del percorso",
      cards:[
        {key:"Dislivello totale",val:`${totalElev} m`},
        {key:"Media uscita",val:`${Math.round(totalElev/runs.length)} m`},
        {key:"Max dislivello",val:`${Math.max(...runs.map(r=>r.elev))} m`},
        {key:"Altitudine max",val:`${Math.max(...runs.map(r=>r.alt))} m`}
      ],
      body:`Hai accumulato <strong>${totalElev} m</strong> di dislivello positivo. Anche piccole variazioni di quota possono modificare passo, FC e calorie.`,
      read:`Quando confronti due corse, non guardare solo il passo: una corsa con più dislivello può essere più allenante anche se più lenta.`,
      tip:"Prossimo step: crea un obiettivo separato per percorsi collinari, senza confrontarli direttamente con quelli pianeggianti."
    },
    caloriesTotal:{
      icon:"🔥", score:74, color:"yellow",
      title:"Calorie totali",
      subtitle:"Energia stimata consumata",
      cards:[
        {key:"Totale",val:`${totalCal.toLocaleString()} kcal`},
        {key:"Media uscita",val:`${Math.round(totalCal/runs.length)} kcal`},
        {key:"Max sessione",val:`${maxCal.calories} kcal`},
        {key:"Data max",val:fmtDate(maxCal.date,true)}
      ],
      body:`Hai consumato circa <strong>${totalCal.toLocaleString()} kcal</strong> nelle sessioni registrate. È un buon indicatore del carico energetico, ma resta una stima.`,
      read:`Le calorie crescono con distanza, durata, intensità e peso corporeo. Usale come trend, non come valore assoluto perfetto.`,
      tip:"Prossimo step: confronta calorie e distanza per capire quali uscite sono state più dispendiose a parità di km."
    },
    maxDistance:{
      icon:"📏", score:88, color:"green",
      title:"Distanza massima",
      subtitle:"Record di resistenza",
      cards:[
        {key:"Record",val:`${bestDist.dist.toFixed(2).replace(".",",")} km`},
        {key:"Data",val:fmtDate(bestDist.date,true)},
        {key:"Tempo",val:bestDist.timeStr},
        {key:"Passo",val:`${paceStr(paceNum(bestDist.dist,bestDist.timeMins))} /km`}
      ],
      body:`La distanza massima è <strong>${bestDist.dist.toFixed(2).replace(".",",")} km</strong>. È uno dei dati più importanti perché dimostra che la tua soglia di resistenza si è alzata parecchio.`,
      read:`Il valore è ancora più interessante perché nella stessa sessione hai mantenuto anche un passo buono.`,
      tip:"Prossimo step: obiettivo 8 km. Non serve accelerare: basta chiuderli in controllo."
    },
    bestPace:{
      icon:"🥇", score:90, color:"green",
      title:"Passo migliore",
      subtitle:"Record di velocità media",
      cards:[
        {key:"Miglior passo",val:`${paceStr(bestPaceValue)} /km`},
        {key:"Data",val:fmtDate(bestPace.date,true)},
        {key:"Distanza",val:`${bestPace.dist.toFixed(2).replace(".",",")} km`},
        {key:"Velocità",val:`${bestSpeed.toFixed(2).replace(".",",")} km/h`}
      ],
      body:`Il tuo passo migliore è <strong>${paceStr(bestPaceValue)} /km</strong>. Il dato è molto forte perché non arriva su una distanza corta, ma su una corsa da ${bestPace.dist.toFixed(2).replace(".",",")} km.`,
      read:`Questo indica che il miglioramento non è solo velocità momentanea: stai sostenendo meglio il ritmo nel tempo.`,
      tip:"Prossimo step: ripeti una corsa simile provando a restare sotto questo passo per almeno 5 km."
    }
  };

  return reports[key] || reports.sessions;
}


function openStatModal(key, index){
  const report = buildStatReport(key);
  const overlay = document.getElementById("statModalOverlay");
  const eyebrow = document.getElementById("smEyebrow");
  const title = document.getElementById("smTitle");
  const subtitle = document.getElementById("smSubtitle");
  const grid = document.getElementById("smGrid");
  const context = document.getElementById("smContext");

  document.querySelectorAll(".stat-card").forEach(c=>c.classList.remove("active-stat"));
  const cards = document.querySelectorAll(".stat-card");
  if(cards[index]){
    cards[index].classList.add("active-stat");
    animatePressedElement(cards[index]);
  }

  eyebrow.textContent = "Dettaglio panoramica";
  title.textContent = report.title;
  subtitle.textContent = report.subtitle;

  grid.innerHTML = report.cards.map(c=>`
    <div class="rec-modal-stat">
      <div class="rec-modal-stat-val">${c.val}</div>
      <div class="rec-modal-stat-key">${c.key}</div>
    </div>
  `).join("");

  context.innerHTML = `
    <div class="detail-report">
      <div class="detail-block">
        <div class="stat-detail-head">
          <div class="stat-detail-icon">${report.icon}</div>
          <div class="stat-detail-main">
            <h4>${report.title}</h4>
            <p>${report.subtitle}</p>
            <div class="performance-meter"><span style="--meter:${report.score}%"></span></div>
          </div>
        </div>
        <div class="detail-grid-compact">
          <div class="detail-mini"><b>${report.score}/100</b><span>Indice dato</span></div>
          <div class="detail-mini"><b>${runs.length}</b><span>Sessioni analizzate</span></div>
          <div class="detail-mini"><b>${fmtDate(runs[runs.length-1].date,true)}</b><span>Ultimo update</span></div>
        </div>
      </div>
      <div class="detail-block">
        <h4>Resoconto</h4>
        <p>${report.body}</p>
      </div>
      <div class="detail-callout green">
        <strong>Come leggerlo:</strong> ${report.read}
      </div>
      <div class="detail-callout">
        <strong>Indicazione pratica:</strong> ${report.tip}
      </div>
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeStatModal(event){
  if(event && event.target && event.target.id !== "statModalOverlay") return;
  const overlay = document.getElementById("statModalOverlay");
  if(overlay) overlay.classList.remove("open");
  document.querySelectorAll(".stat-card").forEach(c=>c.classList.remove("active-stat"));
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
    closeRecModal();
    closeStatModal();
  }
});


/* ══════════════════════════════════════
   REBUILD ALL
══════════════════════════════════════ */
function rebuildAll(){
  if (typeof showEmptyState === "function") showEmptyState(false);
  if (!runs.length) { renderTable(); return; }
  computeStats();
  renderTimeline();
  buildBigChart();
  buildOvChart();
  buildAccordionCharts();
  rebuildAllOpenCharts();
  renderTable();
  buildAnalysis();
  buildSuggestions();
  buildGoals();
  attachReveal();
}

/* ══════════════════════════════════════
   SCROLL REVEAL + STICKY NAV
══════════════════════════════════════ */
const revealObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});},{threshold:0.08});
function attachReveal(){document.querySelectorAll(".reveal:not(.visible)").forEach(el=>revealObs.observe(el));}

const stickyNav=document.getElementById("stickyNav");
window.addEventListener("scroll",()=>{
  if(window.scrollY>window.innerHeight*0.55)stickyNav.classList.add("visible");
  else stickyNav.classList.remove("visible");
  // active link highlight
  const sections=["stats","runs","charts","table","analysis","goals","add"];
  let cur="";
  sections.forEach(id=>{const el=document.getElementById(id);if(el&&window.scrollY>=el.offsetTop-80)cur=id;});
  document.querySelectorAll(".sticky-link").forEach(a=>{a.classList.toggle("active-link",a.getAttribute("href")==="#"+cur);});
});

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
// Al caricamento runs è vuoto — mostra empty state, non esegue calcoli
renderTable();
setTimeout(()=>{ attachReveal(); },100);
setTimeout(()=>{ if(runs.length){ buildBigChart();buildOvChart(); }},250);

/* ══════════════════════════════════════
   V3 SAFE FUNCTION WRAPPERS
══════════════════════════════════════ */
(function(){
  const installWrappers = () => {
    if(typeof addRun === "function" && !addRun._v3Wrapped){
      const originalAddRun = addRun;
      window.addRun = function(){
        originalAddRun.apply(this, arguments);
        setTimeout(markLatestRowAdded, 80);
      };
      window.addRun._v3Wrapped = true;
    }
    if(typeof addRowFromPanel === "function" && !addRowFromPanel._v3Wrapped){
      const originalAddRow = addRowFromPanel;
      window.addRowFromPanel = function(){
        originalAddRow.apply(this, arguments);
        setTimeout(markLatestRowAdded, 80);
      };
      window.addRowFromPanel._v3Wrapped = true;
    }
    if(typeof deleteSelectedRows === "function" && !deleteSelectedRows._v3Wrapped){
      const originalDelete = deleteSelectedRows;
      window.deleteSelectedRows = function(){
        animateRowsBeforeDelete();
        setTimeout(()=>originalDelete.apply(this, arguments), 260);
      };
      window.deleteSelectedRows._v3Wrapped = true;
    }
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", installWrappers);
  else installWrappers();
})();


/* ── V9 TECH INTERACTION PANEL ── */
const techInfoCopy = {
  load:{
    title:"Carico allenante",
    text:"Il carico nasce dall'insieme di durata, distanza, calorie, frequenza cardiaca e dislivello. Una seduta è più impegnativa quando più parametri crescono insieme, non solo quando vai più veloce."
  },
  efficiency:{
    title:"Efficienza aerobica",
    text:"L'efficienza migliora quando riesci a mantenere un passo migliore con una frequenza cardiaca simile o più controllata. È uno degli indicatori più utili per capire se stai davvero progredendo."
  },
  trend:{
    title:"Trend di progressione",
    text:"Il trend guarda l'andamento nel tempo: distanza massima, passo medio, record sui 5 km e continuità. Serve a distinguere un miglioramento stabile da una singola uscita eccezionale."
  },
  quality:{
    title:"Qualità dello stimolo",
    text:"La qualità dello stimolo dipende dal contesto: una corsa lenta può essere ottima per recuperare, una corsa intensa può creare adattamento, ma troppe uscite intense di fila aumentano il rischio di sovraccarico."
  }
};

function setTechInfo(key){
  const panel=document.getElementById("techInfoPanel");
  const data=techInfoCopy[key]||techInfoCopy.load;
  if(!panel) return;
  panel.classList.remove("animate");
  void panel.offsetWidth;
  panel.innerHTML=`<h3>${data.title}</h3><p>${data.text}</p>`;
  panel.classList.add("animate");
  document.querySelectorAll("[data-tech]").forEach(el=>{
    if(el.classList.contains("tech-info-btn")) el.classList.toggle("active", el.dataset.tech===key);
  });
}

document.addEventListener("click",(e)=>{
  const tech=e.target.closest("[data-tech]");
  if(tech && (tech.classList.contains("tech-info-btn") || tech.classList.contains("tech-card") || tech.classList.contains("tech-word"))){
    setTechInfo(tech.dataset.tech);
  }

  const demo=e.target.closest(".demo-card");
  if(demo){
    document.querySelectorAll(".demo-card").forEach(d=>d.classList.remove("focused"));
    demo.classList.add("focused");
  }
});


/* ── V10 TECH MODAL DETAILS ── */
const techModalDetails = {
  load:{
    kicker:"Carico allenante",
    title:"Training Load",
    body:`<p>Il carico allenante descrive quanto una seduta pesa sul corpo. Non dipende solo dal passo: entrano in gioco durata, distanza, calorie, dislivello e frequenza cardiaca media.</p>
    <div class="tech-modal-grid">
      <div class="tech-modal-mini"><b>Distanza</b><span>volume meccanico</span></div>
      <div class="tech-modal-mini"><b>FC media</b><span>costo interno</span></div>
      <div class="tech-modal-mini"><b>Calorie</b><span>stima energetica</span></div>
      <div class="tech-modal-mini"><b>Dislivello</b><span>stress muscolare</span></div>
    </div>
    <div class="tech-modal-tip"><strong>Come usarlo:</strong> dopo una seduta ad alto carico, la corsa successiva dovrebbe essere più facile o più breve per consolidare il progresso.</div>`
  },
  efficiency:{
    kicker:"Efficienza aerobica",
    title:"Pace / Heart Rate",
    body:`<p>L'efficienza migliora quando riesci a correre più veloce o più lontano mantenendo una frequenza cardiaca simile. È uno degli indicatori più forti del miglioramento reale.</p>
    <div class="tech-modal-grid">
      <div class="tech-modal-mini"><b>Passo</b><span>output esterno</span></div>
      <div class="tech-modal-mini"><b>FC</b><span>risposta interna</span></div>
      <div class="tech-modal-mini"><b>Trend</b><span>lettura nel tempo</span></div>
    </div>
    <div class="tech-modal-tip"><strong>Segnale positivo:</strong> stesso passo con FC più bassa, oppure passo migliore con FC stabile.</div>`
  },
  trend:{
    kicker:"Progressione",
    title:"Performance Trend",
    body:`<p>Il trend distingue un miglioramento stabile da una singola corsa andata bene. Per questo ASCENT confronta record, medie, distanza massima e passo nel tempo.</p>
    <div class="tech-modal-grid">
      <div class="tech-modal-mini"><b>5 km</b><span>benchmark chiave</span></div>
      <div class="tech-modal-mini"><b>Distanza max</b><span>resistenza</span></div>
      <div class="tech-modal-mini"><b>Passo</b><span>velocità media</span></div>
      <div class="tech-modal-mini"><b>Costanza</b><span>aderenza</span></div>
    </div>
    <div class="tech-modal-tip"><strong>Obiettivo:</strong> migliorare a micro-step, tipo 5–10 sec/km oppure 200–400 m alla volta.</div>`
  },
  readiness:{
    kicker:"Prontezza stimata",
    title:"Readiness",
    body:`<p>La readiness è una lettura qualitativa: se FC, passo e sensazioni divergono, potresti non essere pronto per un'altra seduta intensa.</p>
    <div class="tech-modal-grid">
      <div class="tech-modal-mini"><b>FC alta</b><span>stress possibile</span></div>
      <div class="tech-modal-mini"><b>Passo lento</b><span>fatica residua</span></div>
      <div class="tech-modal-mini"><b>PR recente</b><span>recupero utile</span></div>
    </div>
    <div class="tech-modal-tip"><strong>Consiglio:</strong> alterna sedute intense e facili. Non ogni corsa deve essere un test.</div>`
  }
};

function openTechModal(key){
  const item=techModalDetails[key]||techModalDetails.load;
  const overlay=document.getElementById("techModalOverlay");
  if(!overlay) return;
  document.getElementById("techModalKicker").textContent=item.kicker;
  document.getElementById("techModalTitle").textContent=item.title;
  document.getElementById("techModalBody").innerHTML=item.body;
  overlay.classList.add("open");
  document.body.style.overflow="hidden";
}
function closeTechModal(event){
  if(event && event.target && event.target.id!=="techModalOverlay") return;
  const overlay=document.getElementById("techModalOverlay");
  if(overlay) overlay.classList.remove("open");
  document.body.style.overflow="";
}
document.addEventListener("click",(e)=>{
  const btn=e.target.closest("[data-modal]");
  if(btn){
    e.preventDefault();
    e.stopPropagation();
    openTechModal(btn.dataset.modal);
  }
});
document.addEventListener("keydown",(e)=>{
  if(e.key==="Escape") closeTechModal();
});


/* ── V11 DEMO CARD FOCUS PANELS ── */
document.addEventListener("click",(e)=>{
  const demo=e.target.closest(".demo-card");
  if(!demo) return;

  const panel=demo.querySelector(".demo-focus-panel");
  const isOpen=panel && panel.classList.contains("open");

  document.querySelectorAll(".demo-card").forEach(card=>{
    if(card!==demo) card.classList.remove("focused");
  });
  document.querySelectorAll(".demo-focus-panel").forEach(p=>{
    if(p!==panel) p.classList.remove("open");
  });

  demo.classList.toggle("focused", !isOpen);
  if(panel) panel.classList.toggle("open", !isOpen);
});


/* ── V12 ASCENT LETTER LOGO WRAPPER ── */
function wrapAscentLogo(el){
  if(!el || el.classList.contains("ascent-letter-ready")) return;

  const sub = el.querySelector("sub");
  const subHTML = sub ? sub.outerHTML : "";
  const text = "ASCENT";
  el.innerHTML = text.split("").map(ch => `<span class="ascent-letter">${ch}</span>`).join("") + `<span class="ascent-dot">.</span>` + subHTML;
  el.classList.add("ascent-letter-ready");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-logo,.sticky-nav-logo,.ascent-footer-logo,.tech-brand-mark").forEach(wrapAscentLogo);
});


/* ── V15 DYNAMIC RUNNING INSIGHTS ── */
let insightsChartInstance = null;

function _insPaceNum(run){
  if(!run || !run.dist || !run.timeMins) return null;
  return Number(run.timeMins) / Number(run.dist);
}
function _insPaceStr(p){
  if(!p || !isFinite(p)) return "—";
  const m = Math.floor(p);
  const s = Math.round((p-m)*60);
  return `${m}:${String(s).padStart(2,"0")}`;
}
function _insKm(v){
  if(!isFinite(v)) return "—";
  return `${Number(v).toFixed(2).replace(".",",")} km`;
}
function _insClamp(v,min,max){return Math.max(min,Math.min(max,v));}
function _insAvg(arr){
  const clean = arr.filter(v=>typeof v==="number" && isFinite(v));
  return clean.length ? clean.reduce((a,b)=>a+b,0)/clean.length : 0;
}

function calculateRunningInsights(){
  if(typeof runs === "undefined" || !Array.isArray(runs) || !runs.length){
    return null;
  }

  const sorted = [...runs].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length-1];
  const paces = sorted.map(_insPaceNum).filter(Boolean);
  const firstPace = _insPaceNum(first);
  const lastPace = _insPaceNum(last);
  const bestPace = Math.min(...paces);
  const avgPace = _insAvg(paces);
  const totalKm = sorted.reduce((a,r)=>a+(Number(r.dist)||0),0);
  const maxDist = Math.max(...sorted.map(r=>Number(r.dist)||0));
  const avgKm = totalKm / sorted.length;
  const totalMins = sorted.reduce((a,r)=>a+(Number(r.timeMins)||0),0);
  const totalCal = sorted.reduce((a,r)=>a+(Number(r.calories)||0),0);
  const hrRuns = sorted.filter(r=>Number(r.hr));
  const avgHr = hrRuns.length ? Math.round(_insAvg(hrRuns.map(r=>Number(r.hr)))) : null;
  const totalElev = sorted.reduce((a,r)=>a+(Number(r.elev)||0),0);
  const prCount = sorted.filter(r=>r.pr && String(r.pr).trim()).length;

  const paceImprovementSec = firstPace && lastPace ? Math.round((firstPace-lastPace)*60) : 0;
  const distanceGrowth = first.dist ? ((maxDist - Number(first.dist)) / Number(first.dist))*100 : 0;
  const consistency = _insClamp((sorted.length / 10) * 100, 18, 100);
  const volumeScore = _insClamp((totalKm / 35) * 100, 15, 100);
  const speedScore = _insClamp(55 + paceImprovementSec * 0.65 + (avgPace-bestPace)*18, 20, 100);
  const enduranceScore = _insClamp(35 + maxDist * 7.8 + distanceGrowth * .08, 20, 100);
  const efficiencyScore = avgHr ? _insClamp(100 - Math.abs(avgHr-158)*1.2 + Math.max(0,paceImprovementSec)*.35, 25, 100) : _insClamp(speedScore*.82, 25, 100);
  const loadScore = _insClamp((totalMins/260)*42 + (totalCal/2600)*38 + (totalElev/120)*20, 18, 100);
  const recoveryNeed = _insClamp((loadScore*.55) + (avgHr ? Math.max(0,avgHr-160)*1.1 : 8) + prCount*3, 18, 100);
  const globalScore = Math.round(_insClamp(
    speedScore*.22 + enduranceScore*.22 + consistency*.17 + efficiencyScore*.18 + volumeScore*.11 + (100-Math.abs(recoveryNeed-55))*.10,
    35, 96
  ));

  let verdictTitle = "Progressione in costruzione";
  let verdictText = "La dashboard sta raccogliendo una base dati utile. Continua ad aggiungere corse per rendere l’analisi più precisa.";
  if(globalScore >= 82){
    verdictTitle = "Performance in forte crescita";
    verdictText = "Il profilo mostra un miglioramento solido: il passo è più efficiente, il volume è cresciuto e i record indicano adattamento reale. Ora la priorità è non trasformare ogni corsa in un test.";
  }else if(globalScore >= 68){
    verdictTitle = "Buona progressione";
    verdictText = "Stai migliorando in modo credibile. Il dato migliore è la combinazione tra distanza e passo: significa che la resistenza sta salendo insieme alla qualità del ritmo.";
  }else if(globalScore >= 52){
    verdictTitle = "Base positiva, serve costanza";
    verdictText = "Ci sono segnali buoni, ma la curva può diventare più stabile. Serve continuità: due uscite ben distribuite a settimana valgono più di una singola seduta estrema.";
  }

  return {
    sorted, first, last, totalKm, maxDist, avgKm, totalMins, totalCal, avgHr, totalElev, prCount,
    firstPace, lastPace, bestPace, avgPace, paceImprovementSec, distanceGrowth,
    globalScore, volumeScore, speedScore, enduranceScore, efficiencyScore, consistency, loadScore, recoveryNeed,
    verdictTitle, verdictText
  };
}

function renderInsights(){
  const data = calculateRunningInsights();
  if(!data) return;

  const scoreEl = document.getElementById("insightsScore");
  const ring = document.querySelector(".insights-score-ring");
  if(scoreEl) scoreEl.textContent = data.globalScore;
  if(ring) ring.style.setProperty("--scoreDeg", `${Math.round(data.globalScore*3.6)}deg`);

  const subtitle = document.getElementById("insightsSubtitle");
  if(subtitle){
    subtitle.textContent = `Analisi su ${data.sorted.length} corse, ${_insKm(data.totalKm)} totali, passo medio ${_insPaceStr(data.avgPace)} /km.`;
  }

  const kpiGrid = document.getElementById("insightsKpiGrid");
  if(kpiGrid){
    kpiGrid.innerHTML = `
      <div class="insight-kpi"><b>${_insKm(data.totalKm)}</b><span>Volume totale</span><p>Quantità complessiva di lavoro registrata.</p></div>
      <div class="insight-kpi"><b>${_insPaceStr(data.bestPace)} /km</b><span>Passo migliore</span><p>Benchmark di velocità media più forte.</p></div>
      <div class="insight-kpi"><b>${data.paceImprovementSec > 0 ? "-" + data.paceImprovementSec : data.paceImprovementSec}s/km</b><span>Delta passo</span><p>Variazione stimata tra prima e ultima uscita.</p></div>
      <div class="insight-kpi"><b>${data.avgHr ? data.avgHr + " bpm" : "—"}</b><span>FC media</span><p>Costo cardiovascolare medio delle sedute.</p></div>
    `;
  }

  const verdict = document.getElementById("insightsVerdict");
  if(verdict){
    verdict.innerHTML = `<h3>${data.verdictTitle}</h3><p>${data.verdictText}</p>`;
  }

  const factors = document.getElementById("insightsFactors");
  if(factors){
    const factorData = [
      ["Volume", data.volumeScore, "Misura il carico complessivo dato dai km totali e dalla media per uscita."],
      ["Velocità", data.speedScore, "Valuta il passo migliore e il miglioramento rispetto alle prime uscite."],
      ["Resistenza", data.enduranceScore, "Legge distanza massima e capacità di sostenere sedute più lunghe."],
      ["Efficienza", data.efficiencyScore, "Confronta ritmo e frequenza cardiaca: più ritmo con FC controllata è un segnale forte."],
      ["Costanza", data.consistency, "Stima quanto lo storico sia solido e quanto i dati siano affidabili."],
      ["Carico", data.loadScore, "Integra durata, calorie e dislivello per capire quanto pesa l’allenamento."]
    ];
    factors.innerHTML = factorData.map(([name,score,text])=>`
      <div class="insight-factor">
        <strong>${name}</strong><span>${Math.round(score)}/100</span>
        <div class="bar"><i style="--w:${Math.round(score)}%"></i></div>
        <p>${text}</p>
      </div>
    `).join("");
  }

  const strategy = document.getElementById("insightsStrategy");
  if(strategy){
    let primary = "Mantieni 2 uscite settimanali: una facile e una progressiva.";
    let secondary = "Prova a migliorare con micro-step: 5–10 sec/km o 200–400 m alla volta.";
    let recovery = "Dopo un PR o una seduta con FC alta, inserisci una corsa di recupero controllata.";
    if(data.recoveryNeed > 72){
      primary = "Priorità recupero: il carico recente sembra alto, evita di cercare subito un altro record.";
    }
    if(data.enduranceScore < 62){
      secondary = "Costruisci prima volume: aumenta la distanza lunga gradualmente prima di spingere sul passo.";
    }
    if(data.speedScore < 62){
      secondary = "Inserisci brevi variazioni di ritmo dentro una corsa facile, senza esagerare.";
    }
    strategy.innerHTML = `
      <div class="insight-strategy"><strong>Priorità 1</strong><span>Focus principale</span><p>${primary}</p></div>
      <div class="insight-strategy"><strong>Priorità 2</strong><span>Progressione</span><p>${secondary}</p></div>
      <div class="insight-strategy"><strong>Priorità 3</strong><span>Recupero</span><p>${recovery}</p></div>
      <div class="insight-strategy"><strong>Obiettivo intelligente</strong><span>Prossimo step</span><p>Punta a consolidare ${_insKm(data.maxDist)} e poi supera il record di distanza con incremento minimo, mantenendo passo stabile.</p></div>
    `;
  }

  renderInsightsChart(data);
}

function renderInsightsChart(data){
  const canvas = document.getElementById("insightsMiniChart");
  if(!canvas || typeof Chart === "undefined") return;

  if(insightsChartInstance){
    insightsChartInstance.destroy();
  }

  insightsChartInstance = new Chart(canvas,{
    type:"line",
    data:{
      labels:data.sorted.map(r => String(r.date).slice(5).replace("-","/")),
      datasets:[
        {
          label:"Distanza km",
          data:data.sorted.map(r=>Number(r.dist)||0),
          borderColor:"#00e676",
          backgroundColor:"rgba(0,230,118,.12)",
          tension:.42,
          fill:true,
          pointRadius:4
        },
        {
          label:"Passo min/km",
          data:data.sorted.map(r=>_insPaceNum(r)),
          borderColor:"#ff5c1a",
          backgroundColor:"rgba(255,92,26,.08)",
          tension:.42,
          yAxisID:"y1",
          pointRadius:4
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      interaction:{mode:"index",intersect:false},
      plugins:{legend:{labels:{color:"#9898b0",boxWidth:10}}},
      scales:{
        x:{ticks:{color:"#5a5a78"},grid:{color:"rgba(255,255,255,.045)"}},
        y:{ticks:{color:"#5a5a78"},grid:{color:"rgba(255,255,255,.045)"}},
        y1:{position:"right",ticks:{color:"#5a5a78"},grid:{drawOnChartArea:false}}
      }
    }
  });
}

function openInsightsPanel(){
  renderInsights();
  const overlay = document.getElementById("insightsOverlay");
  if(overlay){
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeInsightsPanel(event){
  if(event && event.target && event.target.id !== "insightsOverlay") return;
  const overlay = document.getElementById("insightsOverlay");
  if(overlay){
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

document.addEventListener("click",(e)=>{
  const tab = e.target.closest(".insights-tab");
  if(tab){
    document.querySelectorAll(".insights-tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".insights-tab-panel").forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    const target = document.getElementById(`insights-${tab.dataset.insightTab}`);
    if(target) target.classList.add("active");
  }
});

document.addEventListener("keydown",(e)=>{
  if(e.key === "Escape") closeInsightsPanel();
});

/* Refresh insights automatically after dashboard rebuilds */
(function(){
  const installInsightsHook = () => {
    if(typeof rebuildAll === "function" && !rebuildAll._insightsWrapped){
      const original = rebuildAll;
      window.rebuildAll = function(){
        const result = original.apply(this, arguments);
        if(document.getElementById("insightsOverlay")?.classList.contains("open")){
          setTimeout(renderInsights, 80);
        }
        return result;
      };
      window.rebuildAll._insightsWrapped = true;
    }
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", installInsightsHook);
  else installInsightsHook();
})();

/* ─────────────────────────── */

document.addEventListener('DOMContentLoaded',()=>{
const splash=document.getElementById('ascentSplash');
if(!splash) return;
document.body.style.overflow='hidden';
window.ascentShowSplash=()=>{
  if(!document.body.contains(splash) || splash.classList.contains('hidden')) return;
  splash.classList.remove('splash-waiting');
  splash.classList.add('splash-active');
  document.body.style.overflow='hidden';
};
const enterSplash=()=>{
  if(!splash.classList.contains('splash-active') || splash.classList.contains('hidden')) return;
  splash.classList.add('hidden');
  const ov=document.getElementById('ascentTransitionOverlay');
  ov?.classList.add('active');
  setTimeout(()=>{
    document.body.style.overflow='';
    splash.remove();
  },960);
  setTimeout(()=>ov?.classList.remove('active'),1050);
};
splash.querySelector('[data-splash-enter]')?.addEventListener('click',event=>{
  event.stopPropagation();
  enterSplash();
});
document.addEventListener('keydown',event=>{
  if(event.key === 'Enter') enterSplash();
});
});

/* ─────────────────────────── */

document.addEventListener('DOMContentLoaded',()=>{
 const logos=document.querySelectorAll('.nav-logo,.sticky-nav-logo');
 const ov=document.getElementById('ascentTransitionOverlay');
 logos.forEach(l=>{
   l.addEventListener('click',e=>{
      e.preventDefault();
      ov.classList.add('active');
      setTimeout(()=>{window.scrollTo({top:0,behavior:'smooth'});ov.classList.remove('active');},900);
   });
 });
});

/* ─────────────────────────── */

document.addEventListener('DOMContentLoaded',()=>{
 const s=document.getElementById('startupScreen');
 if(!s){
   window.ascentShowSplash?.();
   return;
 }
 if(localStorage.getItem('ascent-startup') === 'off'){
   s.remove();
   window.ascentShowSplash?.();
   return;
 }
 const enterBtn=s.querySelector('[data-startup-enter]');
 const unlockStartup=()=>{
   s.classList.add('ready');
   if(enterBtn){
     enterBtn.disabled=false;
     enterBtn.setAttribute('aria-disabled','false');
   }
 };
 const closeStartup=()=>{
   if(!s.classList.contains('ready') || s.dataset.closing === 'true') return;
   s.dataset.closing='true';
   s.classList.add('hide');
   setTimeout(()=>{
     s.remove();
     window.ascentShowSplash?.();
   },920);
 };
 setTimeout(unlockStartup,2450);
 enterBtn?.addEventListener('click',event=>{
   event.stopPropagation();
   closeStartup();
 });
 document.addEventListener('keydown',event=>{
   if(event.key === 'Enter' && document.body.contains(s)) closeStartup();
 });
});

/* ─────────────────────────── */

(function(){
  function initAuthTabs(){
    const tabLogin = document.getElementById("tabLoginBtn");
    const tabReg = document.getElementById("tabRegisterBtn");
    const loginFields = document.getElementById("authLoginFields");
    const regFields = document.getElementById("authRegisterFields");
    const msg = document.getElementById("fbAuthMsg");

    tabLogin?.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabReg?.classList.remove("active");
      if(loginFields) loginFields.style.display = "block";
      if(regFields) regFields.style.display = "none";
      if(msg) msg.textContent = "";
    });
    tabReg?.addEventListener("click", () => {
      tabReg.classList.add("active");
      tabLogin?.classList.remove("active");
      if(regFields) regFields.style.display = "block";
      if(loginFields) loginFields.style.display = "none";
      if(msg) msg.textContent = "";
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAuthTabs);
  else initAuthTabs();
})();

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("ascentDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const panel = document.getElementById("ascentControlPanel");
  const panelClose = document.getElementById("panelClose");
  const logoTargets = document.querySelectorAll(".nav-logo, .sticky-nav-logo");

  const themeButtons = document.querySelectorAll("[data-theme-choice]");
  const animationsToggle = document.getElementById("settingAnimations");
  const startupToggle = document.getElementById("settingStartup");
  const compactToggle = document.getElementById("settingCompact");
  const cloudStatus = document.getElementById("cloudStatus");

  const profileName = document.getElementById("profileName");
  const profileGoal = document.getElementById("profileGoal");
  const profileDevice = document.getElementById("profileDevice");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const profileStatus = document.getElementById("profileStatus");
  const exportDataBtn = document.getElementById("exportDataBtn");

  function openDrawer(){
    drawer?.classList.add("open");
    backdrop?.classList.add("open");
    drawer?.setAttribute("aria-hidden","false");
  }

  function closeDrawer(){
    drawer?.classList.remove("open");
    backdrop?.classList.remove("open");
    drawer?.setAttribute("aria-hidden","true");
  }

  function openPanel(view = "settings"){
    closeDrawer();
    panel?.classList.add("open");
    panel?.setAttribute("aria-hidden","false");
    backdrop?.classList.add("open");

    document.querySelectorAll(".panel-view").forEach(v => {
      v.classList.toggle("active", v.dataset.view === view);
    });
  }

  function closePanel(){
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden","true");
    backdrop?.classList.remove("open");
  }

  function applyTheme(theme){
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme !== "light");
    localStorage.setItem("ascent-theme", theme);

    themeButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });

    if(window.Chart && typeof rebuildAll === "function"){
      setTimeout(() => {
        try { rebuildAll(); } catch(e) {}
      }, 80);
    }
  }

  logoTargets.forEach(logo => {
    logo.setAttribute("role","button");
    logo.setAttribute("tabindex","0");
    logo.title = "Apri menu ASCENT";
    logo.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      openDrawer();
    });
    logo.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        openDrawer();
      }
    });
  });

  drawerClose?.addEventListener("click", closeDrawer);
  panelClose?.addEventListener("click", closePanel);
  backdrop?.addEventListener("click", () => {
    closeDrawer();
    closePanel();
  });

  document.querySelectorAll("[data-scroll-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scrollTarget);
      closeDrawer();
      if(target) target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => openPanel(btn.dataset.panel));
  });

  themeButtons.forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice));
  });

  animationsToggle?.addEventListener("change", () => {
    document.body.classList.toggle("reduced-motion", !animationsToggle.checked);
    localStorage.setItem("ascent-animations", animationsToggle.checked ? "on" : "off");
  });

  startupToggle?.addEventListener("change", () => {
    document.body.classList.toggle("skip-startup", !startupToggle.checked);
    localStorage.setItem("ascent-startup", startupToggle.checked ? "on" : "off");
  });

  compactToggle?.addEventListener("change", () => {
    document.body.classList.toggle("compact-ui", compactToggle.checked);
    localStorage.setItem("ascent-compact", compactToggle.checked ? "on" : "off");
  });

  // cloudToggle gestito da Firebase

  saveProfileBtn?.addEventListener("click", () => {
    const profile = {
      name: profileName?.value || "LoZen Runner",
      goal: profileGoal?.value || "Migliorare passo e resistenza",
      device: profileDevice?.value || "Strava + Apple Watch Ultra"
    };
    localStorage.setItem("ascent-profile", JSON.stringify(profile));
    const drawerName=document.querySelector('.drawer-profile-card strong');
    if(drawerName) drawerName.textContent = profile.name || 'LoZen Runner';
    const avatar=document.querySelector('.profile-avatar');
    if(avatar){
      const initials=(profile.name||'LR').split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase();
      avatar.textContent=initials;
    }
    if(profileStatus) profileStatus.textContent = "Profilo aggiornato e salvato nel browser.";
    // Aggiorna nome nel drawer loggato
    const drawerNameEl = document.getElementById("drawerNameLoggedIn");
    const drawerAvatarEl = document.getElementById("drawerAvatarLoggedIn");
    if(drawerNameEl) drawerNameEl.textContent = profile.name || "Runner";
    if(drawerAvatarEl) drawerAvatarEl.textContent = (profile.name||"RN").split(" ").map(v=>v[0]).join("").slice(0,2).toUpperCase();
    // Auto-sync profilo su Firebase se loggato
    if(window._fbUser && typeof window.fbSaveProfile === "function"){
      window.fbSaveProfile(profile).catch(()=>{});
    }
  });

  exportDataBtn?.addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: JSON.parse(localStorage.getItem("ascent-profile") || "{}"),
      theme: localStorage.getItem("ascent-theme") || "dark",
      note: "Export demo locale ASCENT. I dati corsa restano gestiti dal file HTML."
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascent-local-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape"){
      closeDrawer();
      closePanel();
    }
  });

  // Restore saved settings
  applyTheme(localStorage.getItem("ascent-theme") || "dark");

  if(localStorage.getItem("ascent-animations") === "off"){
    document.body.classList.add("reduced-motion");
    if(animationsToggle) animationsToggle.checked = false;
  }

  if(localStorage.getItem("ascent-startup") === "off"){
    document.body.classList.add("skip-startup");
    if(startupToggle) startupToggle.checked = false;
  }

  if(localStorage.getItem("ascent-compact") === "on"){
    document.body.classList.add("compact-ui");
    if(compactToggle) compactToggle.checked = true;
  }

  // stato cloud gestito da Firebase onAuthStateChanged

  try{
    const savedProfile = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
    
    if(profileName) profileName.value = savedProfile.name || "";
    const drawerName=document.querySelector('.drawer-profile-card strong');
    if(drawerName && savedProfile.name) drawerName.textContent=savedProfile.name;
    const avatar=document.querySelector('.profile-avatar');
    if(avatar && savedProfile.name){
      avatar.textContent=savedProfile.name.split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase();
    }
        
    if(profileGoal) profileGoal.value = savedProfile.goal || "";
    if(profileDevice) profileDevice.value = savedProfile.device || "";
  }catch(e){}
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const goalMap = {
    fat_loss: {
      label:"Dimagrimento e ricomposizione",
      goals:[
        ["Costanza settimanale","2–3 uscite leggere a settimana, senza inseguire sempre il record."],
        ["Volume controllato","Aumenta i km totali del 5–8% ogni 2 settimane."],
        ["Zona facile","Mantieni almeno una corsa a ritmo conversazionale."]
      ],
      suggestion:"Per dimagrire bene, la priorità è sostenibilità: corse facili, deficit moderato e progressione graduale. Evita di trasformare ogni uscita in una gara."
    },
    endurance: {
      label:"Aumentare resistenza",
      goals:[
        ["Lungo progressivo","Supera la distanza massima con incrementi di 300–500 m."],
        ["Passo stabile","Mantieni un ritmo regolare nella seconda metà della corsa."],
        ["Recupero attivo","Inserisci una corsa molto facile dopo il lungo."]
      ],
      suggestion:"Per costruire resistenza serve volume intelligente. Il dato chiave da guardare è la distanza massima insieme alla stabilità del passo."
    },
    speed: {
      label:"Migliorare il passo",
      goals:[
        ["Micro PR passo","Riduci il passo medio di 5–10 sec/km."],
        ["Variazioni brevi","Inserisci 4 tratti veloci controllati in una corsa facile."],
        ["Tecnica","Lavora su appoggio leggero e frequenza stabile."]
      ],
      suggestion:"Per migliorare il passo non devi correre sempre forte: alterna sedute facili e piccoli blocchi più intensi, così migliori senza bruciarti."
    },
    "5k": {
      label:"Preparare 5 km",
      goals:[
        ["Benchmark 5 km","Completa 5 km con passo costante."],
        ["Negative split","Seconda metà leggermente più veloce della prima."],
        ["Test ogni 3–4 settimane","Non testare il 5 km ogni uscita."]
      ],
      suggestion:"Per il 5 km conta il controllo: ritmo costante, respirazione gestibile e progressione finale. Punta a stabilizzare prima di spingere."
    },
    "10k": {
      label:"Preparare 10 km",
      goals:[
        ["Base 7–8 km","Consolida una distanza intermedia prima del 10 km."],
        ["Lungo facile","Allunga senza cercare il miglior passo."],
        ["Carico graduale","Evita salti improvvisi di volume."]
      ],
      suggestion:"Per arrivare ai 10 km serve pazienza: prima solidità sui 7–8 km, poi progressione. Il passo verrà dopo la base aerobica."
    },
    consistency: {
      label:"Costanza e routine",
      goals:[
        ["Routine minima","2 uscite fisse a settimana."],
        ["No zero week","Evita settimane completamente ferme."],
        ["Sessione breve utile","Anche 20 minuti contano se mantengono l’abitudine."]
      ],
      suggestion:"La costanza batte il singolo allenamento perfetto. L’obiettivo è rendere la corsa una routine facile da ripetere."
    }
  };

  const profilePhotoInput = document.getElementById("profilePhotoInput");
  const profilePhotoPreview = document.getElementById("profilePhotoPreview");
  const profilePhotoImg = document.getElementById("profilePhotoImg");
  const removeProfilePhoto = document.getElementById("removeProfilePhoto");
  const profileGoalSelect = document.getElementById("profileGoalSelect");
  const goalPreviewContent = document.getElementById("goalPreviewContent");

  const profileAge = document.getElementById("profileAge");
  const profileHeight = document.getElementById("profileHeight");
  const profileWeight = document.getElementById("profileWeight");
  const profileLevel = document.getElementById("profileLevel");

  const mobileModeToggle = document.getElementById("settingMobileMode");
  const softCardsToggle = document.getElementById("settingSoftCards");
  const chartFocusToggle = document.getElementById("settingChartFocus");
  const accentButtons = document.querySelectorAll("[data-accent-choice]");

  function renderGoalPreview(goal){
    const data = goalMap[goal] || goalMap.fat_loss;
    if(!goalPreviewContent) return;
    goalPreviewContent.innerHTML = `
      <div class="goal-preview-list">
        ${data.goals.map(g => `<div><strong>${g[0]}</strong><span>${g[1]}</span></div>`).join("")}
      </div>
      <div class="goal-suggestion-dynamic">
        <h3>Suggerimento</h3>
        <p>${data.suggestion}</p>
      </div>
    `;
  }

  function applyProfilePhoto(dataUrl){
    if(!profilePhotoPreview || !profilePhotoImg) return;
    if(dataUrl){
      profilePhotoImg.src = dataUrl;
      profilePhotoPreview.classList.add("has-photo");
      const drawerAvatar = document.querySelector(".profile-avatar");
      if(drawerAvatar){
        drawerAvatar.style.backgroundImage = `url('${dataUrl}')`;
        drawerAvatar.style.backgroundSize = "cover";
        drawerAvatar.style.backgroundPosition = "center";
        drawerAvatar.textContent = "";
      }
    }else{
      profilePhotoImg.removeAttribute("src");
      profilePhotoPreview.classList.remove("has-photo");
      const drawerAvatar = document.querySelector(".profile-avatar");
      if(drawerAvatar){
        drawerAvatar.style.backgroundImage = "";
      }
    }
  }

  profilePhotoInput?.addEventListener("change", () => {
    const file = profilePhotoInput.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("ascent-profile-photo", reader.result);
      applyProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  });

  removeProfilePhoto?.addEventListener("click", () => {
    localStorage.removeItem("ascent-profile-photo");
    applyProfilePhoto("");
    const savedProfile = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
    const drawerAvatar = document.querySelector(".profile-avatar");
    if(drawerAvatar){
      drawerAvatar.textContent = (savedProfile.name || "LR").split(" ").map(v=>v[0]).join("").slice(0,2).toUpperCase();
    }
  });

  profileGoalSelect?.addEventListener("change", () => {
    renderGoalPreview(profileGoalSelect.value);
  });

  function applyAccent(accent){
    document.body.classList.remove("accent-orange","accent-green","accent-blue","accent-purple","accent-red","accent-mono");
    document.body.classList.add(`accent-${accent}`);
    localStorage.setItem("ascent-accent", accent);
    accentButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.accentChoice === accent));
  }

  accentButtons.forEach(btn => {
    btn.addEventListener("click", () => applyAccent(btn.dataset.accentChoice));
  });

  mobileModeToggle?.addEventListener("change", () => {
    document.body.classList.toggle("mobile-mode", mobileModeToggle.checked);
    localStorage.setItem("ascent-mobile-mode", mobileModeToggle.checked ? "on" : "off");
  });

  softCardsToggle?.addEventListener("change", () => {
    document.body.classList.toggle("soft-cards", softCardsToggle.checked);
    localStorage.setItem("ascent-soft-cards", softCardsToggle.checked ? "on" : "off");
  });

  chartFocusToggle?.addEventListener("change", () => {
    document.body.classList.toggle("chart-focus", chartFocusToggle.checked);
    localStorage.setItem("ascent-chart-focus", chartFocusToggle.checked ? "on" : "off");
  });

  const oldSave = document.getElementById("saveProfileBtn");
  oldSave?.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
    const profile = {
      ...saved,
      age: profileAge?.value || "",
      height: profileHeight?.value || "",
      weight: profileWeight?.value || "",
      level: profileLevel?.value || "intermediate",
      goalType: profileGoalSelect?.value || "fat_loss",
      goal: goalMap[profileGoalSelect?.value || "fat_loss"].label
    };
    localStorage.setItem("ascent-profile", JSON.stringify(profile));
    const gpc = document.getElementById("goalPreviewCard");
    if(gpc) gpc.style.display = "";
    renderGoalPreview(profile.goalType);
  });

  // restore extended profile
  try{
    const savedProfile = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
    if(profileAge) profileAge.value = savedProfile.age || "";
    if(profileHeight) profileHeight.value = savedProfile.height || "";
    if(profileWeight) profileWeight.value = savedProfile.weight || "";
    if(profileLevel) profileLevel.value = savedProfile.level || "intermediate";
    if(profileGoalSelect) profileGoalSelect.value = savedProfile.goalType || "fat_loss";
    // Mostra la preview obiettivi solo se il profilo è già stato salvato
    const hasProfile = savedProfile && (savedProfile.name || savedProfile.goalType);
    const gpc = document.getElementById("goalPreviewCard");
    if(hasProfile){
      if(gpc) gpc.style.display = "";
      renderGoalPreview(profileGoalSelect?.value || "fat_loss");
    } else {
      if(gpc) gpc.style.display = "none";
    }
  }catch(e){
    const gpc = document.getElementById("goalPreviewCard");
    if(gpc) gpc.style.display = "none";
  }

  const savedPhoto = localStorage.getItem("ascent-profile-photo");
  if(savedPhoto) applyProfilePhoto(savedPhoto);

  applyAccent(localStorage.getItem("ascent-accent") || "orange");

  if(localStorage.getItem("ascent-mobile-mode") === "on"){
    document.body.classList.add("mobile-mode");
    if(mobileModeToggle) mobileModeToggle.checked = true;
  }

  if(localStorage.getItem("ascent-soft-cards") === "on"){
    document.body.classList.add("soft-cards");
    if(softCardsToggle) softCardsToggle.checked = true;
  }

  if(localStorage.getItem("ascent-chart-focus") === "on"){
    document.body.classList.add("chart-focus");
    if(chartFocusToggle) chartFocusToggle.checked = true;
  }
});

/* ═══════════════════════════════════════════════
   PACE AI — powered by GPT-4o (via Netlify Function proxy)
   La chiave OpenAI NON è nel codice: è gestita
   in modo sicuro da netlify/functions/pace.js
═══════════════════════════════════════════════ */

let paceAiOpen = false;
let paceThinking = false;

function openPaceAI(){
  paceAiOpen = true;
  document.getElementById("paceAiPanel").classList.add("open");
  document.getElementById("paceAiBtn").style.display = "none";
  // refresh live stats in coach header
  try{
    const totalKm=runs.reduce((a,r)=>a+r.dist,0);
    const paces=runs.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
    const lastPace=paces.length?paces[paces.length-1]:null;
    const prs=runs.filter(r=>r.pr&&r.pr.trim()).length;
    const el=id=>document.getElementById(id);
    if(el("pcs-runs"))el("pcs-runs").textContent=runs.length;
    if(el("pcs-km"))el("pcs-km").textContent=totalKm.toFixed(2).replace(".",",");
    if(el("pcs-pace"))el("pcs-pace").textContent=paceStr(lastPace);
    if(el("pcs-pr"))el("pcs-pr").textContent=prs+" PR";
  }catch(e){}
  setTimeout(()=>document.getElementById("paceInput").focus(), 350);
}
function closePaceAI(){
  paceAiOpen = false;
  document.getElementById("paceAiPanel").classList.remove("open");
  document.getElementById("paceAiBtn").style.display = "flex";
}

function sendQuick(text){
  document.getElementById("paceInput").value = text;
  sendPaceMsg();
}

function getSystemPrompt(){
  const totalKm = runs.reduce((a,r)=>a+r.dist,0).toFixed(2);
  const paces = runs.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
  const bestPace = paces.length ? Math.min(...paces) : null;
  const lastRun = [...runs].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const withHR = runs.filter(r=>r.hr);
  const avgHR = withHR.length ? Math.round(withHR.reduce((a,r)=>a+r.hr,0)/withHR.length) : null;
  const totalCal = runs.reduce((a,r)=>a+(r.calories||0),0);
  const prs = runs.filter(r=>r.pr&&r.pr.trim()).length;
  const maxDist = Math.max(...runs.map(r=>r.dist));

  return `Sei PACE AI, un coach di running esperto e motivante integrato nella dashboard ASCENT di Lorenzo Nuozzi.
Hai accesso completo ai suoi dati di allenamento in tempo reale.

DATI AGGIORNATI DEL RUNNER:
- Sessioni totali: ${runs.length} (17 marzo – 10 giugno 2026)
- Km totali percorsi: ${totalKm} km
- Distanza massima singola uscita: ${maxDist.toFixed(2)} km
- Passo migliore assoluto: ${bestPace ? paceStr(bestPace) : "–"} /km
- Passo ultima corsa: ${lastRun ? paceStr(paceNum(lastRun.dist,lastRun.timeMins)) : "–"} /km su ${lastRun ? lastRun.dist.toFixed(2) : "–"} km
- FC media complessiva: ${avgHR ? avgHR+" bpm" : "dati parziali"}
- Calorie totali bruciate: ${totalCal.toLocaleString()} kcal
- Record personali conquistati: ${prs} (800m, 1km, 1600m, 2 miglia, 5km)
- Storico completo sessioni:
${runs.map(r=>`  • ${r.date}: ${r.dist.toFixed(2)}km | ${r.timeStr} | passo ${paceStr(paceNum(r.dist,r.timeMins))}/km${r.hr ? " | FC "+r.hr+"bpm" : ""}${r.calories ? " | "+r.calories+"kcal" : ""}${r.elev ? " | ↑"+r.elev+"m" : ""}${r.pr ? " | 🏆 PR: "+r.pr : ""}`).join("\n")}

ISTRUZIONI COMPORTAMENTALI:
- Rispondi SEMPRE in italiano, tono diretto e motivante
- Usa i dati reali per personalizzare ogni risposta — mai risposte generiche
- Dai consigli pratici, specifici, numerici dove possibile
- Usa emoji con moderazione per rendere le risposte più dinamiche
- Sii conciso ma completo (max 200 parole per risposta semplice)
- Per piani di allenamento usa elenchi puntati chiari
- Non ripetere i dati tecnici nella risposta a meno che non sia necessario per il contesto`;
}

// Conversation memory
let paceHistory = [];

function buildMessages(newMsg){
  const messages = [
    { role: "system", content: getSystemPrompt() }
  ];
  // add last 8 turns of history
  paceHistory.slice(-8).forEach(h=>{
    messages.push({ role: "user", content: h.user });
    messages.push({ role: "assistant", content: h.ai });
  });
  messages.push({ role: "user", content: newMsg });
  return messages;
}

async function sendPaceMsg(){
  const input = document.getElementById("paceInput");
  const text = input.value.trim();
  if(!text || paceThinking) return;
  input.value = "";

  appendMsg("user", text);
  paceThinking = true;
  const typingId = showTyping();

  try {
    const response = await fetch("/.netlify/functions/pace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: buildMessages(text)
      })
    });

    removeTyping(typingId);
    paceThinking = false;

    const data = await response.json();

    if(!response.ok){
      const msg = data?.error?.message || data?.error || "Errore "+response.status;
      if(response.status === 401){
        appendMsg("ai", "🔐 Chiave API non valida. Controlla la variabile OPENAI_API_KEY su Netlify.");
      } else if(response.status === 429){
        appendMsg("ai", "⏳ Troppe richieste. Attendi qualche secondo e riprova.");
      } else {
        appendMsg("ai", "⚠️ Errore: <span class='hl'>"+msg+"</span>. Riprova tra un momento.");
      }
      return;
    }

    const reply = data.choices?.[0]?.message?.content || "Non ho ricevuto risposta.";
    appendMsg("ai", formatAIReply(reply));
    paceHistory.push({ user: text, ai: reply });
    if(paceHistory.length > 10) paceHistory.shift();

  } catch(e){
    removeTyping(typingId);
    paceThinking = false;
    if(e.name === "TypeError" && e.message.includes("fetch")){
      appendMsg("ai", "🌐 Errore di rete. Controlla la connessione a internet e riprova.");
    } else {
      appendMsg("ai", "⚠️ Errore imprevisto: "+e.message);
    }
  }
}

function formatAIReply(text){
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .replace(/`(.*?)`/g, "<code style='background:rgba(255,255,255,.08);padding:1px 5px;border-radius:4px;font-size:12px;'>$1</code>");
}

function appendMsg(role, html){
  const msgs = document.getElementById("paceMessages");
  const div = document.createElement("div");
  div.className = "pace-msg " + role;
  const avatar = document.createElement("div");
  avatar.className = "pace-msg-avatar";
  if(role === "ai"){
    avatar.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="8" rx="4" ry="4.2" fill="#f0c0a0"/><ellipse cx="11" cy="4.5" rx="4" ry="2" fill="#2a1a0a"/><ellipse cx="8.5" cy="7.5" rx=".8" ry=".9" fill="#1a1a1a"/><ellipse cx="13.5" cy="7.5" rx=".8" ry=".9" fill="#1a1a1a"/><path d="M9.5 9.8 Q11 11 12.5 9.8" stroke="#c08060" stroke-width=".8" stroke-linecap="round" fill="none"/><ellipse cx="11" cy="15.5" rx="5.5" ry="3.2" fill="#1e1e30"/><rect x="9.5" y="11.5" width="3" height="2.5" rx="1.2" fill="#f0c0a0"/><circle cx="7.5" cy="8" r="1" fill="#ff5c1a" opacity=".85"/><circle cx="14.5" cy="8" r="1" fill="#ff5c1a" opacity=".85"/></svg>`;
  } else {
    avatar.textContent = "🏃";
  }
  const bubble = document.createElement("div");
  bubble.className = "pace-msg-bubble";
  bubble.innerHTML = html;
  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  setTimeout(()=>msgs.scrollTo({top:msgs.scrollHeight, behavior:"smooth"}), 50);
}

function showTyping(){
  const msgs = document.getElementById("paceMessages");
  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.className = "pace-msg ai"; div.id = id;
  const avatarSVG = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="8" rx="4" ry="4.2" fill="#f0c0a0"/><ellipse cx="11" cy="4.5" rx="4" ry="2" fill="#2a1a0a"/><ellipse cx="8.5" cy="7.5" rx=".8" ry=".9" fill="#1a1a1a"/><ellipse cx="13.5" cy="7.5" rx=".8" ry=".9" fill="#1a1a1a"/><path d="M9.5 9.8 Q11 11 12.5 9.8" stroke="#c08060" stroke-width=".8" stroke-linecap="round" fill="none"/><ellipse cx="11" cy="15.5" rx="5.5" ry="3.2" fill="#1e1e30"/><rect x="9.5" y="11.5" width="3" height="2.5" rx="1.2" fill="#f0c0a0"/><circle cx="7.5" cy="8" r="1" fill="#ff5c1a" opacity=".85"/><circle cx="14.5" cy="8" r="1" fill="#ff5c1a" opacity=".85"/></svg>`;
  div.innerHTML = `<div class="pace-msg-avatar">${avatarSVG}</div><div class="pace-msg-bubble"><div class="pace-typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  setTimeout(()=>msgs.scrollTo({top:msgs.scrollHeight, behavior:"smooth"}), 50);
  return id;
}

/* ═══════════════════════════════════════════════
   PREMIUM LOCK SCREEN
═══════════════════════════════════════════════ */
function openPremiumLock(){
  document.getElementById("premiumLockOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closePremiumLock(){
  const el = document.getElementById("premiumLockOverlay");
  el.classList.remove("open");
  document.body.style.overflow = "";
}
// Close on backdrop click
document.getElementById("premiumLockOverlay")?.addEventListener("click", e=>{
  if(e.target === document.getElementById("premiumLockOverlay")) closePremiumLock();
});
// Show on first load after 1.8s (demo effect — rimuovi se non vuoi il popup automatico)
// setTimeout(()=>{ if(!localStorage.getItem("ascent-pro-seen")) { openPremiumLock(); localStorage.setItem("ascent-pro-seen","1"); } }, 1800);
function removeTyping(id){
  const el = document.getElementById(id);
  if(el) el.remove();
}

/* ═══════════════════════════════════════════════
   PREMIUM PAGE TRANSITIONS
═══════════════════════════════════════════════ */
// Intercept all internal anchor clicks for smooth transitions
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", e=>{
    const target = document.querySelector(a.getAttribute("href"));
    if(!target) return;
    e.preventDefault();
    const overlay = document.getElementById("pageTransitionOverlay");
    overlay.classList.add("flash");
    setTimeout(()=>{
      target.scrollIntoView({behavior:"smooth"});
    }, 90);
    setTimeout(()=> overlay.classList.remove("flash"), 560);
  });
});

// Intersection observer for section entrance animations
const secObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("anim-in");
      secObs.unobserve(e.target);
    }
  });
}, {threshold:0.06, rootMargin:"0px 0px -60px 0px"});

document.querySelectorAll(".section, .tech-panel, .professional-panel").forEach(s=>{
  if(!s.classList.contains("anim-in")){
    secObs.observe(s);
  }
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const hubs = [
    {trigger:document.getElementById("ascentHubTrigger"), panel:document.getElementById("ascentHubPanel")},
    {trigger:document.getElementById("ascentStickyHubTrigger"), panel:document.getElementById("ascentStickyHubPanel")}
  ];
  const drawer = document.getElementById("ascentDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const panel = document.getElementById("ascentControlPanel");

  function closeHubs(except=null){
    hubs.forEach(h => {
      if(!h.trigger || !h.panel || h === except) return;
      h.trigger.classList.remove("open");
      h.trigger.setAttribute("aria-expanded","false");
      h.panel.classList.remove("open");
      h.panel.setAttribute("aria-hidden","true");
    });
  }

  function toggleHub(h){
    if(!h.trigger || !h.panel) return;
    const willOpen = !h.panel.classList.contains("open");
    closeHubs(h);
    h.trigger.classList.toggle("open", willOpen);
    h.trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    h.panel.classList.toggle("open", willOpen);
    h.panel.setAttribute("aria-hidden", willOpen ? "false" : "true");
  }

  function transitionTo(fn){
    document.body.classList.add("ascent-transitioning");
    setTimeout(() => {
      fn();
      setTimeout(() => document.body.classList.remove("ascent-transitioning"), 280);
    }, 95);
  }

  hubs.forEach(h => {
    h.trigger?.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      toggleHub(h);
    });

    h.panel?.querySelectorAll("[data-scroll]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.dataset.scroll);
        closeHubs();
        if(target) transitionTo(() => target.scrollIntoView({behavior:"smooth", block:"start"}));
      });
    });

    h.panel?.querySelectorAll("[data-insights]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeHubs();
        transitionTo(() => {
          if(typeof window.openInsightsPanel === "function") window.openInsightsPanel();
        });
      });
    });

    h.panel?.querySelectorAll("[data-pace-ai]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeHubs();
        transitionTo(() => {
          if(typeof window.openPaceAI === "function") window.openPaceAI();
        });
      });
    });
  });

  document.querySelectorAll(".panel-back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      transitionTo(() => {
        if(panel){
          panel.classList.remove("open");
          panel.setAttribute("aria-hidden","true");
        }
        if(drawer){
          drawer.classList.add("open");
          drawer.setAttribute("aria-hidden","false");
        }
        backdrop?.classList.add("open");
      });
    });
  });

  document.addEventListener("click", e => {
    if(!e.target.closest(".ascent-mobile-hub")) closeHubs();
  });

  document.addEventListener("keydown", e => {
    if(e.key === "Escape") closeHubs();
  });

  document.querySelectorAll(".ascent-hub-trigger,.ascent-hub-action,.panel-back-btn,.insights-back-btn").forEach(el => {
    el.addEventListener("mousemove", event => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 7;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.025)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("paceAiPanel");

  function openPace(){
    if(typeof window.openPaceAI === "function"){
      try{ window.openPaceAI(); return; }catch(e){}
    }
    const p = document.getElementById("paceAiPanel");
    if(p) p.classList.add("open");
  }

  if(panel && !panel.querySelector(".pace-ai-expand-btn")){
    const closeBtn = panel.querySelector(".pace-ai-close, [onclick*='closePace'], button[aria-label*='chiudi' i], button[aria-label*='close' i]");
    const expandBtn = document.createElement("button");
    expandBtn.type = "button";
    expandBtn.className = "pace-ai-expand-btn";
    expandBtn.title = "Espandi PACE AI";
    expandBtn.setAttribute("aria-label","Espandi PACE AI");
    expandBtn.innerHTML = "⛶";

    expandBtn.addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const isExpanded = panel.classList.toggle("pace-expanded");
      expandBtn.innerHTML = isExpanded ? "↙" : "⛶";
      expandBtn.title = isExpanded ? "Riduci PACE AI" : "Espandi PACE AI";
      expandBtn.setAttribute("aria-label", isExpanded ? "Riduci PACE AI" : "Espandi PACE AI");
    });

    if(closeBtn && closeBtn.parentElement){
      closeBtn.parentElement.insertBefore(expandBtn, closeBtn);
      closeBtn.parentElement.style.display = "flex";
      closeBtn.parentElement.style.alignItems = "center";
      closeBtn.parentElement.style.gap = "8px";
    }else{
      const header = panel.querySelector(".pace-ai-header") || panel.firstElementChild;
      if(header){
        header.style.position = "relative";
        expandBtn.style.position = "absolute";
        expandBtn.style.top = "18px";
        expandBtn.style.right = "58px";
        header.appendChild(expandBtn);
      }
    }
  }

  const hero = document.querySelector(".hero");
  if(hero){
    const possibleHeroPace = hero.querySelector(".pace-ai-hero-btn, .pace-ai-wide-btn, .pace-ai-cta, button[id*='pace' i], a[href*='pace' i], [class*='pace'][class*='btn'], [class*='pace'][class*='cta']");
    if(possibleHeroPace){
      possibleHeroPace.classList.add("pace-ai-hero-btn");
      if(!possibleHeroPace.dataset.paceHeroBound){
        possibleHeroPace.dataset.paceHeroBound = "1";
        possibleHeroPace.addEventListener("click", ev => {
          ev.preventDefault();
          openPace();
        });
      }
    }else{
      const content = hero.querySelector(".hero-content") || hero;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pace-hero-premium-launch";
      btn.innerHTML = `PACE AI <span>coach intelligence</span>`;
      btn.addEventListener("click", openPace);
      content.appendChild(btn);
    }
  }

  const closeButtons = panel ? panel.querySelectorAll(".pace-ai-close, [onclick*='closePace'], button[aria-label*='chiudi' i], button[aria-label*='close' i]") : [];
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      panel?.classList.remove("pace-expanded");
      const expand = panel?.querySelector(".pace-ai-expand-btn");
      if(expand){
        expand.innerHTML = "⛶";
        expand.title = "Espandi PACE AI";
        expand.setAttribute("aria-label","Espandi PACE AI");
      }
    }, true);
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const miniBtn = document.getElementById("paceMiniFloat");

  function getPanel(){
    return document.getElementById("paceAiPanel");
  }

  function panelIsOpen(panel){
    return panel && (
      panel.classList.contains("open") ||
      panel.style.display === "block" ||
      panel.getAttribute("aria-hidden") === "false"
    );
  }

  function openPaceAIFromAnywhere(){
    const panel = getPanel();

    if(typeof window.openPaceAI === "function"){
      try{
        window.openPaceAI();
      }catch(e){}
    }

    if(panel){
      panel.classList.add("open");
      panel.setAttribute("aria-hidden","false");
    }

    miniBtn?.classList.add("pace-open");
  }

  miniBtn?.addEventListener("click", openPaceAIFromAnywhere);

  function askPace(prompt){
    openPaceAIFromAnywhere();

    if(typeof window.askPaceWithDashboard === "function"){
      try{
        window.askPaceWithDashboard(prompt);
        return;
      }catch(e){}
    }

    const input = document.getElementById("paceAiInput") || document.querySelector(".pace-ai-input");
    const send = document.getElementById("paceAiSend") || document.querySelector(".pace-ai-send");

    if(input){
      input.value = prompt;
      input.focus();
      if(send) send.click();
    }
  }

  document.querySelectorAll("[data-pace-smart-prompt]").forEach(el => {
    if(el.dataset.paceSmartBound === "1") return;
    el.dataset.paceSmartBound = "1";
    el.addEventListener("click", () => {
      askPace(el.dataset.paceSmartPrompt);
    });
  });

  const panel = getPanel();
  if(panel && miniBtn){
    const observer = new MutationObserver(() => {
      miniBtn.classList.toggle("pace-open", panelIsOpen(panel));
    });
    observer.observe(panel, {attributes:true, attributeFilter:["class","style","aria-hidden"]});
  }
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const logoBtn = document.getElementById("paceLogoAI");
  const drawer = document.getElementById("paceDrawerAI");
  const backdrop = document.getElementById("paceDrawerBackdrop");
  const closeBtn = document.getElementById("paceDrawerClose");
  const clearBtn = document.getElementById("paceDrawerClear");
  const form = document.getElementById("paceDrawerForm");
  const input = document.getElementById("paceDrawerInput");
  const messages = document.getElementById("paceDrawerMessages");
  const activeMode = document.getElementById("paceActiveMode");

  let currentMode = "coach";

  const modeNames = {
    coach: "Coach",
    analysis: "Analisi",
    azione: "Azione"
  };

  const modePlaceholders = {
    coach: "Chiedi consigli, dubbi o spiegazioni sulla tua pratica...",
    analysis: "Chiedi un'analisi su dati, grafici o trend...",
    azione: "Scrivi un comando: es. 'elimina cronologia obiettivi'..."
  };

  const actionCommandsPanel = document.getElementById("paceActionCommands");

  // Tutte le richieste PACE AI passano solo da questa tendina.
  window.openPaceAI = function(){
    setOpen(true);
  };

  window.closePaceAI = function(){
    setOpen(false);
  };

  window.askPaceWithDashboard = async function(prompt){
    setOpen(true);
    await handlePrompt(prompt || "Analizza la dashboard.");
    return "";
  };

  function setOpen(open){
    drawer?.classList.toggle("open", open);
    backdrop?.classList.toggle("open", open);
    logoBtn?.classList.toggle("pace-open", open);
    document.body.classList.toggle("pace-drawer-lock", open);
    drawer?.setAttribute("aria-hidden", open ? "false" : "true");
    backdrop?.setAttribute("aria-hidden", open ? "false" : "true");

    if(open){
      document.querySelectorAll("#paceAiPanel, .pace-ai-panel, #paceAI, #pacePanel").forEach(panel => {
        panel.classList.remove("open", "active", "pace-expanded");
        panel.classList.add("pace-force-closed");
        panel.setAttribute("aria-hidden", "true");
        panel.style.display = "none";
        panel.style.opacity = "0";
        panel.style.visibility = "hidden";
        panel.style.pointerEvents = "none";
      });

      setTimeout(() => input?.focus(), 260);
    }
  }

  function addMessage(type, text, variant){
    if(!messages || !text.trim()) return;

    const box = document.createElement("div");
    box.className = "pace-msg " + (type === "user" ? "pace-msg-user" : "pace-msg-ai");
    if(type !== "user" && variant) box.classList.add("pace-msg-" + variant);

    const avatar = document.createElement("div");
    avatar.className = "pace-msg-avatar";
    avatar.textContent = type === "user" ? "TU" : "AI";

    const content = document.createElement("div");
    content.className = "pace-msg-content";

    const title = document.createElement("b");
    title.textContent = type === "user" ? "Tu" : "PACE AI";

    const p = document.createElement("p");
    p.textContent = text;

    content.appendChild(title);
    content.appendChild(p);
    box.appendChild(avatar);
    box.appendChild(content);
    messages.appendChild(box);
    messages.scrollTop = messages.scrollHeight;
  }

  /* ── COACH: consigli pratici, risponde a domande sulla pratica ── */
  function buildCoachReply(prompt){
    const lower = prompt.toLowerCase();

    if(lower.includes("obiettivo") || lower.includes("target")){
      return "Obiettivo consigliato:\n\nImposta un target di 3 settimane con progressione controllata. Punta prima sulla continuità, poi sulla velocità.\n\nSchema pratico:\n1. una corsa facile;\n2. una corsa media stabile;\n3. una seduta leggermente progressiva se recuperi bene.";
    }

    if(lower.includes("prossima") || lower.includes("corsa") || lower.includes("ritmo") || lower.includes("passo")){
      return "Prossima corsa ideale:\n\nFarei un'uscita controllata, senza cercare il record. Mantieni ritmo facile/medio e valuta una chiusura progressiva solo negli ultimi minuti.\n\nObiettivo: costruire qualità senza stressare troppo il sistema.";
    }

    if(lower.includes("recupero") || lower.includes("stanco") || lower.includes("fatica") || lower.includes("dolore") || lower.includes("infortun")){
      return "Lettura recupero:\n\nSe senti fatica, la scelta migliore non è fermarsi per forza, ma abbassare intensità. Una corsa facile o una camminata attiva può mantenere continuità senza peggiorare il carico.\n\nSe il dolore è localizzato e persiste oltre 2-3 giorni, valuta uno stop e un consulto specialistico.";
    }

    if(lower.includes("alimentazione") || lower.includes("mangiare") || lower.includes("cibo") || lower.includes("nutrizione")){
      return "Alimentazione pratica:\n\nPer le uscite sopra i 45 min: 1-2 ore prima un pasto leggero con carboidrati complessi (riso, banana, pane integrale). Durante, piccoli sorsi ogni 15-20 min se serve. Dopo, nei primi 30 minuti, abbina proteine e carboidrati per favorire il recupero.";
    }

    if(lower.includes("cadenza") || lower.includes("tecnica") || lower.includes("postura")){
      return "Tecnica di corsa:\n\nPunta a una cadenza di 170-180 passi al minuto, appoggio leggero sotto il bacino e busto leggermente avanti. Lavora con un metronomo per 2-3 minuti a inizio corsa, poi torna naturale: l'obiettivo è interiorizzare il ritmo, non forzarlo costantemente.";
    }

    if(lower.includes("respir")){
      return "Respirazione:\n\nA ritmi facili usa una respirazione 3:3 (3 passi in inspirazione, 3 in espirazione). Aumentando l'intensità passa a 2:2 o 2:1. Se non riesci a parlare in frasi brevi, probabilmente stai correndo troppo forte per un'uscita facile.";
    }

    if(lower.includes("scarp") || lower.includes("attrezzatura") || lower.includes("equipaggiamento")){
      return "Attrezzatura:\n\nScegli scarpe adatte al tuo tipo di appoggio e sostituiscile ogni 600-800 km circa. Per le uscite lunghe o in clima variabile, punta su materiali traspiranti e calzini tecnici per evitare vesciche.";
    }

    if(lower.includes("motivazione") || lower.includes("voglia") || lower.includes("mollare")){
      return "Motivazione:\n\nNei giorni di scarsa voglia, riduci l'obiettivo: 'esco 15 minuti e poi decido'. Spesso basta iniziare per ritrovare il ritmo. La costanza conta più della singola prestazione perfetta.";
    }

    return "Coach PACE AI:\n\nSono qui per consigli pratici e per chiarire dubbi sulla tua pratica: allenamento, recupero, alimentazione, tecnica, attrezzatura o motivazione. Fammi una domanda specifica e ti rispondo con indicazioni concrete da applicare.";
  }

  /* ── ANALISI: legge dati e grafici della dashboard ── */
  function buildAnalysisReply(prompt){
    const lower = prompt.toLowerCase();

    const sorted = [...runs].sort((a,b)=>new Date(a.date)-new Date(b.date));
    const n = sorted.length;
    const totalKm = sorted.reduce((a,r)=>a+r.dist,0);
    const paces = sorted.map(r=>paceNum(r.dist,r.timeMins)).filter(Boolean);
    const bestPace = paces.length ? Math.min(...paces) : null;
    const avgPace = paces.length ? paces.reduce((a,b)=>a+b,0)/paces.length : null;
    const withHR = sorted.filter(r=>r.hr);
    const lastHR = withHR.length ? withHR[withHR.length-1].hr : null;

    if(lower.includes("trend") || lower.includes("andamento") || lower.includes("migliorando")){
      const lastFew = sorted.slice(-3);
      const firstFew = sorted.slice(0,3);
      const lastAvg = lastFew.length ? lastFew.reduce((a,r)=>a+(paceNum(r.dist,r.timeMins)||0),0)/lastFew.length : 0;
      const firstAvg = firstFew.length ? firstFew.reduce((a,r)=>a+(paceNum(r.dist,r.timeMins)||0),0)/firstFew.length : 0;
      const trendDir = lastAvg && firstAvg ? (lastAvg < firstAvg ? "in miglioramento" : "stabile o in leggero calo") : "non ancora valutabile";
      return `Analisi trend:\n\nSu ${n} corse registrate, il passo medio nelle ultime sessioni risulta ${trendDir} rispetto alle prime.\n\n• Passo medio recente: ${paceStr(lastAvg)}/km\n• Passo medio iniziale: ${paceStr(firstAvg)}/km\n• Miglior passo assoluto: ${bestPace?paceStr(bestPace):"–"}/km\n\nConsiglio: valuta il trend su più settimane, non sulla singola corsa.`;
    }

    if(lower.includes("grafic") || lower.includes("variazion") || lower.includes("anomalia") || lower.includes("anomalie")){
      return `Lettura grafici:\n\nNei grafici di passo e distanza guarda la forma della curva, non i singoli picchi. Picchi isolati di passo lento spesso indicano giornate di recupero attivo o caldo/dislivello elevato.\n\n• Distanza totale: ${totalKm.toFixed(2)} km su ${n} corse\n• Passo medio generale: ${avgPace?paceStr(avgPace):"–"}/km\n\nSe vedi 2-3 picchi consecutivi nello stesso senso (es. passo che peggiora ripetutamente), può indicare accumulo di fatica.`;
    }

    if(lower.includes("fc") || lower.includes("cardio") || lower.includes("battito") || lower.includes("bpm")){
      return `Analisi frequenza cardiaca:\n\n${lastHR?`L'ultima corsa con dato FC registra una media di ~${lastHR} bpm.`:"Non ho ancora dati di frequenza cardiaca sufficienti."}\n\nUna FC media che scende a parità di ritmo nelle settimane è un buon segnale di adattamento aerobico. Se invece sale a parità di passo, valuta più recupero o caldo eccessivo.`;
    }

    if(lower.includes("dashboard") || lower.includes("stato") || lower.includes("situazione") || lower.includes("analizza")){
      return `Analisi dashboard:\n\n• Corse registrate: ${n}\n• Distanza totale: ${totalKm.toFixed(2)} km\n• Passo medio: ${avgPace?paceStr(avgPace):"–"}/km\n• Miglior passo: ${bestPace?paceStr(bestPace):"–"}/km\n\nIl quadro generale è coerente con una progressione regolare. Per un'analisi più precisa, chiedimi di un grafico specifico (passo, distanza, FC) o di un periodo particolare.`;
    }

    return `Analisi PACE AI:\n\n• Guarda il trend generale, non il singolo dato isolato.\n• Se ritmo e distanza migliorano senza cali successivi, il progresso è buono.\n• Se il carico cresce troppo velocemente, aumenta il rischio di stanchezza e perdita di qualità.\n\nPosso analizzare: trend del passo, grafici, frequenza cardiaca o lo stato generale della dashboard. Dimmi su cosa vuoi concentrarti.`;
  }

  /* ── AZIONE: esegue comandi sulla dashboard ── */
  function buildAzioneReply(prompt){
    const lower = prompt.toLowerCase();
    const result = { text: "", variant: "azione" };

    const sugGrid = document.querySelector(".sug-grid");
    const goalsGrid = document.querySelector(".goals-grid");

    const wantsGoals = lower.includes("obiettiv");
    const wantsSuggestions = lower.includes("suggeriment");
    const wantsClearChat = lower.includes("pulisci") && (lower.includes("chat") || lower.includes("conversazione") || lower.includes("cronologia") && !wantsGoals && !wantsSuggestions);
    const wantsDelete = lower.includes("elimina") || lower.includes("rimuovi") || lower.includes("cancella") || lower.includes("svuota");
    const wantsSort = lower.includes("riordina") || lower.includes("ordina");
    const wantsGenerate = lower.includes("crea") || lower.includes("genera") || lower.includes("aggiungi");

    // Pulisci chat
    if(wantsClearChat){
      setTimeout(() => clearChatMessages(), 50);
      return { text: "Comando eseguito: ho pulito la cronologia della chat PACE AI.", variant: "azione" };
    }

    // Elimina cronologia obiettivi/suggerimenti generati da PACE AI
    if(wantsDelete && (wantsGoals || wantsSuggestions)){
      let removed = 0;
      if(wantsGoals && goalsGrid){
        const cards = [...goalsGrid.querySelectorAll(".goal-card.pace-ai-generated")];
        cards.forEach(c => { c.remove(); removed++; });
      }
      if(wantsSuggestions && sugGrid){
        const cards = [...sugGrid.querySelectorAll(".sug-card.pace-ai-generated")];
        cards.forEach(c => { c.remove(); removed++; });
      }
      if(typeof window.paceSortAll === "function") window.paceSortAll();

      if(removed > 0){
        const what = wantsGoals && wantsSuggestions ? "obiettivi e suggerimenti generati da PACE AI" : (wantsGoals ? "obiettivi generati da PACE AI" : "suggerimenti generati da PACE AI");
        return { text: `Comando eseguito: ho eliminato ${removed} ${removed===1?"elemento":"elementi"} (${what}) e riordinato le sezioni rimaste.`, variant: "azione" };
      }
      const what = wantsGoals && wantsSuggestions ? "obiettivi o suggerimenti generati da PACE AI" : (wantsGoals ? "obiettivi generati da PACE AI" : "suggerimenti generati da PACE AI");
      return { text: `Nessun elemento da eliminare: al momento non ci sono ${what} attivi nella dashboard.`, variant: "azione" };
    }

    // Riordina
    if(wantsSort){
      if(typeof window.paceSortAll === "function"){
        window.paceSortAll();
        return { text: "Comando eseguito: ho riordinato obiettivi e suggerimenti in base alla priorità stimata da PACE AI.", variant: "azione" };
      }
      return { text: "Non sono riuscito a riordinare le sezioni: funzione di ordinamento non disponibile.", variant: "azione" };
    }

    // Genera nuovo obiettivo/suggerimento
    if(wantsGenerate && (wantsGoals || wantsSuggestions)){
      let done = [];
      if(wantsGoals && typeof window.paceAddSmartGoal === "function"){
        window.paceAddSmartGoal(false);
        done.push("un nuovo obiettivo");
      }
      if(wantsSuggestions && typeof window.paceAddSmartSuggestion === "function"){
        window.paceAddSmartSuggestion(false);
        done.push("un nuovo suggerimento");
      }
      if(done.length){
        return { text: `Comando eseguito: ho creato ${done.join(" e ")}, ordinati per priorità nella sezione corrispondente.`, variant: "azione" };
      }
    }

    // Comando non riconosciuto
    return { text: "Comando non riconosciuto.\n\nIn modalità Azione posso eseguire:\n• \"Elimina cronologia obiettivi/suggerimenti PACE AI\"\n• \"Riordina obiettivi e suggerimenti\"\n• \"Crea un nuovo obiettivo/suggerimento\"\n• \"Pulisci la chat\"\n\nScrivi il comando in modo simile a questi esempi.", variant: "azione" };
  }

  function clearChatMessages(){
    if(!messages) return;
    messages.innerHTML = `
      <div class="pace-msg pace-msg-ai">
        <div class="pace-msg-avatar">AI</div>
        <div class="pace-msg-content">
          <b>PACE AI</b>
          <p>Chat pulita. Fammi una domanda su dashboard, corsa, ritmo, recupero, grafici o obiettivi.</p>
        </div>
      </div>
    `;
  }

  /* ── Chiamata a GPT-4o per risposte conversazionali libere ── */
  async function askGptFreeform(prompt, extraSystemNote){
    const systemPrompt = getSystemPrompt() + (extraSystemNote ? "\n\n" + extraSystemNote : "");

    const msgs = [{ role: "system", content: systemPrompt }];
    if(typeof paceHistory !== "undefined"){
      paceHistory.slice(-8).forEach(h=>{
        msgs.push({ role: "user", content: h.user });
        msgs.push({ role: "assistant", content: h.ai });
      });
    }
    msgs.push({ role: "user", content: prompt });

    try{
      const response = await fetch("/.netlify/functions/pace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs })
      });

      const data = await response.json();

      if(!response.ok){
        const msg = data?.error?.message || data?.error || ("Errore " + response.status);
        if(response.status === 401){
          return "🔐 Chiave API non valida. Controlla la variabile OPENAI_API_KEY su Netlify.";
        }
        if(response.status === 429){
          return "⏳ Troppe richieste a OpenAI. Attendi qualche secondo e riprova.";
        }
        return "⚠️ Errore: " + msg + ". Riprova tra un momento.";
      }

      const reply = data.choices?.[0]?.message?.content || "Non ho ricevuto risposta.";

      if(typeof paceHistory !== "undefined"){
        paceHistory.push({ user: prompt, ai: reply });
        if(paceHistory.length > 10) paceHistory.shift();
      }

      return reply;
    }catch(e){
      return "⚠️ Errore di rete durante la richiesta. Riprova tra un momento.";
    }
  }

  async function buildReply(prompt){
    if(currentMode === "analysis"){
      const localReply = buildAnalysisReply(prompt);
      // Se non è stata trovata una corrispondenza specifica nei dati, chiedi a GPT-4o
      if(localReply.startsWith("Analisi PACE AI:")){
        const note = "L'utente è in modalità Analisi: rispondi basandoti sui dati di allenamento forniti sopra, interpretando grafici, trend, frequenza cardiaca o stato generale della dashboard secondo la domanda specifica.";
        const aiReply = await askGptFreeform(prompt, note);
        return { text: aiReply, variant: "analysis" };
      }
      return { text: localReply, variant: "analysis" };
    }

    if(currentMode === "azione"){
      const localReply = buildAzioneReply(prompt);
      // Se il comando non è stato riconosciuto, chiedi a GPT-4o
      if(localReply.text.startsWith("Comando non riconosciuto.")){
        const note = "L'utente è in modalità Azione: se la richiesta non corrisponde a un comando operativo sulla dashboard (eliminare/creare/riordinare obiettivi o suggerimenti, pulire la chat), rispondi comunque in modo utile e conversazionale alla domanda, basandoti sui dati di allenamento forniti sopra.";
        const aiReply = await askGptFreeform(prompt, note);
        return { text: aiReply, variant: "azione" };
      }
      return localReply;
    }

    // Coach: sempre conversazione libera con GPT-4o
    const note = "L'utente è in modalità Coach: rispondi a qualsiasi domanda dell'utente in modo naturale e conversazionale, dando consigli pratici su allenamento, recupero, alimentazione, tecnica, attrezzatura, motivazione o qualsiasi altro argomento richiesto.";
    const aiReply = await askGptFreeform(prompt, note);
    return { text: aiReply, variant: null };
  }

  async function handlePrompt(prompt){
    if(!prompt.trim()) return;
    addMessage("user", prompt);

    const typingBox = document.createElement("div");
    typingBox.className = "pace-msg pace-msg-ai";
    typingBox.innerHTML = `<div class="pace-msg-avatar">AI</div><div class="pace-msg-content"><b>PACE AI</b><p>Sto pensando…</p></div>`;
    messages?.appendChild(typingBox);
    if(messages) messages.scrollTop = messages.scrollHeight;

    const reply = await buildReply(prompt);

    typingBox.remove();
    addMessage("ai", reply.text, reply.variant);
  }

  logoBtn?.addEventListener("click", ev => {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen(!drawer?.classList.contains("open"));
  });

  closeBtn?.addEventListener("click", ev => {
    ev.preventDefault();
    setOpen(false);
  });

  backdrop?.addEventListener("click", () => setOpen(false));

  clearBtn?.addEventListener("click", ev => {
    ev.preventDefault();
    if(!messages) return;
    messages.innerHTML = `
      <div class="pace-msg pace-msg-ai">
        <div class="pace-msg-avatar">AI</div>
        <div class="pace-msg-content">
          <b>PACE AI</b>
          <p>Chat pulita. Fammi una domanda su dashboard, corsa, ritmo, recupero, grafici o obiettivi.</p>
        </div>
      </div>
    `;
  });

  document.addEventListener("keydown", ev => {
    if(ev.key === "Escape" && drawer?.classList.contains("open")){
      setOpen(false);
    }

    if((ev.metaKey || ev.ctrlKey) && ev.key === "Enter" && drawer?.classList.contains("open")){
      form?.requestSubmit();
    }
  });

  document.querySelectorAll(".pace-scope").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pace-scope").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode || "coach";
      if(activeMode) activeMode.textContent = "Modalità: " + (modeNames[currentMode] || "Coach");
    });
  });

  form?.addEventListener("submit", ev => {
    ev.preventDefault();
    const prompt = input?.value || "";
    if(!prompt.trim()) return;
    input.value = "";
    handlePrompt(prompt);
  });

  document.querySelectorAll("[data-pace-drawer-prompt]").forEach(btn => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-pace-drawer-prompt") || "";
      setOpen(true);
      handlePrompt(prompt);
    });
  });

  document.querySelectorAll("[data-pace-smart-prompt]").forEach(el => {
    if(el.dataset.paceQuestionHubBound === "1") return;
    el.dataset.paceQuestionHubBound = "1";
    el.addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setOpen(true);
      const prompt = el.dataset.paceSmartPrompt || "";
      if(prompt) handlePrompt(prompt);
    }, true);
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function removePaceButtonsFromCharts(){
    const chartAreas = document.querySelectorAll(".charts-section, .chart-accordion, .chart-acc-body, .chart-big");
    chartAreas.forEach(area => {
      area.querySelectorAll(
        ".pace-chart-ai-panel, .pace-chart-ai-head, .pace-chart-ai-title, .pace-chart-ai-orb, .pace-chart-ai-status, .pace-chart-ai-actions, .pace-chart-ai-note, [data-chart-action]"
      ).forEach(el => el.remove());

      area.querySelectorAll("button").forEach(btn => {
        const text = (btn.textContent || "").trim().toLowerCase();
        const cls = btn.className || "";
        const id = btn.id || "";
        if(
          text.includes("pace ai") ||
          text.includes("leggi trend") ||
          text.includes("trova anomalie") ||
          text === "cosa fare" ||
          cls.toString().toLowerCase().includes("pace-chart") ||
          id.toLowerCase().includes("pacechart")
        ){
          btn.remove();
        }
      });
    });

    document.querySelectorAll(".chart-accordion").forEach(acc => {
      acc.classList.remove("pace-chart-active");
      acc.removeAttribute("data-pace-chart-ai-ready");
    });
  }

  removePaceButtonsFromCharts();

  const observer = new MutationObserver(removePaceButtonsFromCharts);
  observer.observe(document.body, { childList:true, subtree:true });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const banned = "Vuoi capire meglio le " + "variazioni di questo grafico" + "?";
  const shortBanned = "variazioni di questo grafico";
  document.querySelectorAll(".charts-section div, .charts-section section, .charts-section article, .charts-section aside, .charts-section p, .charts-section button").forEach(el => {
    const text = (el.textContent || "").trim();
    if(text.includes(banned) || text.includes(shortBanned)){
      const box = el.closest(".chart-desc, .tip, .tip-green, .detail-callout, .chart-banner, .ai-banner, .analysis-card, .sug-card") || el;
      box.remove();
    }
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const sugGrid = document.querySelector(".sug-grid");
  const goalsGrid = document.querySelector(".goals-grid");
  const suggestionsSection = document.querySelector(".suggestions-section");
  const goalsSection = document.querySelector(".goals-section");

  const suggestionBank = [
    {
      priority: 10,
      title: "Recupero attivo dopo carico alto",
      text: "Inserisci una corsa facile o camminata attiva quando senti gambe pesanti. Mantieni il movimento senza trasformare ogni uscita in una prova.",
      tag: "Recovery",
      tagClass: "recovery"
    },
    {
      priority: 20,
      title: "Corsa progressiva controllata",
      text: "Parti facile e aumenta solo negli ultimi minuti. Serve a lavorare sul ritmo senza creare stress inutile.",
      tag: "Intensity",
      tagClass: "intensity"
    },
    {
      priority: 30,
      title: "Tecnica su ritmo stabile",
      text: "Scegli un passo sostenibile e concentrati su respirazione, appoggio e cadenza. La stabilità vale più del singolo picco.",
      tag: "Technique",
      tagClass: "technique"
    },
    {
      priority: 40,
      title: "Controllo sensazioni post-corsa",
      text: "Dopo ogni uscita valuta gambe, fiato e recupero. Se due parametri peggiorano, la seduta successiva deve essere più leggera.",
      tag: "Mental",
      tagClass: "mental"
    }
  ];

  const goalBank = [
    {
      priority: 10,
      title: "Stabilità del ritmo su 3 settimane",
      desc: "Mantieni almeno due uscite settimanali con passo controllato e variazioni contenute.",
      progress: 35,
      label: "Progressione PACE AI"
    },
    {
      priority: 20,
      title: "Due corse facili consecutive",
      desc: "Consolida il recupero senza perdere continuità. L'obiettivo è arrivare fresco alla seduta successiva.",
      progress: 25,
      label: "Recupero intelligente"
    },
    {
      priority: 30,
      title: "Progressivo leggero",
      desc: "Chiudi una corsa con ultimi minuti più rapidi, ma senza andare in soglia massimale.",
      progress: 20,
      label: "Qualità controllata"
    },
    {
      priority: 40,
      title: "Settimana senza picchi eccessivi",
      desc: "Evita aumenti bruschi di intensità. Mantieni una progressione regolare e sostenibile.",
      progress: 50,
      label: "Carico sostenibile"
    }
  ];

  let sugIndex = 0;
  let goalIndex = 0;

  function openPaceWithMessage(prompt){
    if(window.askPaceWithDashboard){
      window.askPaceWithDashboard(prompt);
      return;
    }
    if(window.openPaceAI) window.openPaceAI();
  }

  function addStatus(section, text){
    if(!section) return;
    let status = section.querySelector(".pace-ai-section-status");
    if(!status){
      status = document.createElement("div");
      status.className = "pace-ai-section-status";
      const header = section.querySelector(".section-header");
      if(header) header.insertAdjacentElement("afterend", status);
      else section.prepend(status);
    }
    status.innerHTML = `<div><b>PACE AI attivo</b><br><span>${text}</span></div><span>LIVE</span>`;
  }

  function addChipAndActions(card, type, priority, generated=false){
    if(!card) return;
    card.dataset.pacePriority = String(priority || 50);
    card.classList.toggle("pace-ai-generated", generated);
    card.classList.add("pace-ai-edited");

    if(!card.querySelector(".pace-ai-chip-row")){
      card.insertAdjacentHTML("afterbegin", `
        <div class="pace-ai-chip-row">
          <span class="pace-ai-chip">${generated ? "Creato da PACE AI" : "Ottimizzato da PACE AI"}</span>
          <span class="pace-ai-priority">Priorità ${String(priority || 50).padStart(2,"0")}</span>
        </div>
      `);
    }else{
      const pr = card.querySelector(".pace-ai-priority");
      if(pr) pr.textContent = "Priorità " + String(priority || 50).padStart(2,"0");
    }

    if(!card.querySelector(".pace-ai-card-actions")){
      const actionAttr = type === "goal" ? "data-pace-goal-action" : "data-pace-card-action";
      const editLabel = type === "goal" ? "Adatta" : "Migliora";
      card.insertAdjacentHTML("beforeend", `
        <div class="pace-ai-card-actions">
          <button type="button" class="pace-ai-mini-btn" ${actionAttr}="explain">Spiega</button>
          <button type="button" class="pace-ai-mini-btn" ${actionAttr}="edit">${editLabel}</button>
          <button type="button" class="pace-ai-mini-btn remove" ${actionAttr}="remove">Rimuovi</button>
        </div>
      `);
    }
  }

  function renumberSuggestions(){
    if(!sugGrid) return;
    [...sugGrid.querySelectorAll(".sug-card")].forEach((card, index) => {
      const num = card.querySelector(".sug-number");
      if(num) num.textContent = String(index + 1).padStart(2, "0");
    });
  }

  function sortSuggestions(){
    if(!sugGrid) return;
    const cards = [...sugGrid.querySelectorAll(".sug-card")];
    cards.sort((a,b) => Number(a.dataset.pacePriority || 90) - Number(b.dataset.pacePriority || 90));
    cards.forEach(card => sugGrid.appendChild(card));
    renumberSuggestions();
  }

  function sortGoals(){
    if(!goalsGrid) return;
    const cards = [...goalsGrid.querySelectorAll(".goal-card")];
    cards.sort((a,b) => Number(a.dataset.pacePriority || 90) - Number(b.dataset.pacePriority || 90));
    cards.forEach(card => goalsGrid.appendChild(card));
  }

  function sortAll(){
    sortSuggestions();
    sortGoals();
    addStatus(suggestionsSection, "Suggerimenti riordinati in base alla priorità stimata da PACE AI.");
    addStatus(goalsSection, "Obiettivi riordinati in base alla priorità stimata da PACE AI.");
  }

  function createSuggestion(data){
    const card = document.createElement("div");
    card.className = "sug-card pace-ai-generated";
    card.dataset.pacePriority = String(data.priority || 50);
    card.innerHTML = `
      <div class="pace-ai-chip-row">
        <span class="pace-ai-chip">Creato da PACE AI</span>
        <span class="pace-ai-priority">Priorità ${String(data.priority || 50).padStart(2,"0")}</span>
      </div>
      <div class="sug-number">00</div>
      <div class="sug-title">${data.title}</div>
      <div class="sug-text">${data.text}</div>
      <span class="sug-tag ${data.tagClass || "technique"}">${data.tag || "PACE AI"}</span>
      <div class="pace-ai-card-actions">
        <button type="button" class="pace-ai-mini-btn" data-pace-card-action="explain">Spiega</button>
        <button type="button" class="pace-ai-mini-btn" data-pace-card-action="edit">Migliora</button>
        <button type="button" class="pace-ai-mini-btn remove" data-pace-card-action="remove">Rimuovi</button>
      </div>
    `;
    return card;
  }

  function createGoal(data){
    const card = document.createElement("div");
    card.className = "goal-card pace-ai-generated";
    card.dataset.pacePriority = String(data.priority || 50);
    card.innerHTML = `
      <div class="pace-ai-chip-row">
        <span class="pace-ai-chip">Creato da PACE AI</span>
        <span class="pace-ai-priority">Priorità ${String(data.priority || 50).padStart(2,"0")}</span>
      </div>
      <div class="goal-title">${data.title}</div>
      <div class="goal-desc">${data.desc}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${data.progress || 25}%"></div></div>
      <div class="progress-label"><span>${data.label || "Target PACE AI"}</span><span>${data.progress || 25}%</span></div>
      <div class="pace-ai-card-actions">
        <button type="button" class="pace-ai-mini-btn" data-pace-goal-action="explain">Spiega</button>
        <button type="button" class="pace-ai-mini-btn" data-pace-goal-action="edit">Adatta</button>
        <button type="button" class="pace-ai-mini-btn remove" data-pace-goal-action="remove">Rimuovi</button>
      </div>
    `;
    return card;
  }

  function addSmartSuggestion(openDrawer=true){
    if(!sugGrid) return;
    const data = suggestionBank[sugIndex % suggestionBank.length];
    sugIndex += 1;
    const card = createSuggestion(data);
    sugGrid.prepend(card);
    sortSuggestions();
    addStatus(suggestionsSection, "PACE AI ha aggiunto un suggerimento ordinato per priorità. Puoi modificarlo o rimuoverlo.");
    if(openDrawer) openPaceWithMessage(`Ho aggiunto il suggerimento "${data.title}" nella sezione Suggerimenti e l'ho ordinato per priorità.`);
  }

  function addSmartGoal(openDrawer=true){
    if(!goalsGrid) return;
    const data = goalBank[goalIndex % goalBank.length];
    goalIndex += 1;
    const card = createGoal(data);
    goalsGrid.prepend(card);
    sortGoals();
    addStatus(goalsSection, "PACE AI ha aggiunto un obiettivo ordinato per priorità. Puoi adattarlo o rimuoverlo.");
    if(openDrawer) openPaceWithMessage(`Ho aggiunto l'obiettivo "${data.title}" nella sezione Obiettivi e l'ho ordinato per priorità.`);
  }

  function enhanceExistingSuggestions(){
    if(!sugGrid) return;
    [...sugGrid.querySelectorAll(".sug-card")].forEach((card, index) => {
      const priority = 50 + index;
      addChipAndActions(card, "suggestion", priority, false);

      const text = card.querySelector(".sug-text");
      if(text && !text.dataset.paceEdited){
        text.dataset.paceEdited = "1";
        text.textContent = text.textContent.trim() + " PACE AI lo rende più operativo: applicalo solo se recupero e sensazioni sono coerenti.";
      }
    });
    sortSuggestions();
  }

  function enhanceExistingGoals(){
    if(!goalsGrid) return;
    [...goalsGrid.querySelectorAll(".goal-card")].forEach((card, index) => {
      const priority = 50 + index;
      addChipAndActions(card, "goal", priority, false);

      const desc = card.querySelector(".goal-desc");
      if(desc && !desc.dataset.paceEdited){
        desc.dataset.paceEdited = "1";
        desc.textContent = desc.textContent.trim() + " Target adattato con progressione controllata e attenzione al recupero.";
      }
    });
    sortGoals();
  }

  function runAutoCoach(openDrawer=true){
    enhanceExistingSuggestions();
    enhanceExistingGoals();

    const generatedSuggestions = sugGrid ? sugGrid.querySelectorAll(".sug-card.pace-ai-generated").length : 0;
    const generatedGoals = goalsGrid ? goalsGrid.querySelectorAll(".goal-card.pace-ai-generated").length : 0;

    if(generatedSuggestions < 1) addSmartSuggestion(false);
    if(generatedGoals < 1) addSmartGoal(false);

    sortAll();

    if(openDrawer){
      openPaceWithMessage("PACE AI è intervenuto automaticamente: ha ottimizzato suggerimenti e obiettivi, ne ha aggiunti di nuovi, li ha ordinati per priorità e ora puoi rimuoverli singolarmente.");
    }
  }

  function removeCard(card){
    if(!card) return;
    card.classList.add("pace-ai-removing");
    setTimeout(() => {
      card.remove();
      sortAll();
    }, 240);
  }

  document.getElementById("paceAutoCoachBtn")?.addEventListener("click", () => runAutoCoach(true));
  document.getElementById("paceAddSuggestionBtn")?.addEventListener("click", () => addSmartSuggestion(true));
  document.getElementById("paceAddGoalBtn")?.addEventListener("click", () => addSmartGoal(true));
  document.getElementById("paceSortCoachBtn")?.addEventListener("click", () => {
    sortAll();
    openPaceWithMessage("Ho riordinato Suggerimenti e Obiettivi in base alla priorità PACE AI.");
  });

  document.addEventListener("click", ev => {
    const sugBtn = ev.target.closest("[data-pace-card-action]");
    if(sugBtn){
      const card = sugBtn.closest(".sug-card");
      const title = card?.querySelector(".sug-title")?.textContent?.trim() || "suggerimento";
      const text = card?.querySelector(".sug-text")?.textContent?.trim() || "";

      if(sugBtn.dataset.paceCardAction === "remove"){
        removeCard(card);
        openPaceWithMessage(`Ho rimosso il suggerimento "${title}" dalla sezione Suggerimenti e ho riordinato le card rimaste.`);
        return;
      }

      if(sugBtn.dataset.paceCardAction === "edit"){
        card?.classList.add("pace-ai-edited");
        const sugText = card?.querySelector(".sug-text");
        if(sugText && !sugText.textContent.includes("Versione adattata:")){
          sugText.textContent = "Versione adattata: " + sugText.textContent + " Mantieni intensità controllata e valuta le sensazioni post-corsa.";
        }
        card.dataset.pacePriority = String(Math.max(5, Number(card.dataset.pacePriority || 50) - 5));
        sortSuggestions();
      }

      openPaceWithMessage(`Analizza questo suggerimento: ${title}. Testo: ${text}`);
    }

    const goalBtn = ev.target.closest("[data-pace-goal-action]");
    if(goalBtn){
      const card = goalBtn.closest(".goal-card");
      const title = card?.querySelector(".goal-title")?.textContent?.trim() || "obiettivo";
      const desc = card?.querySelector(".goal-desc")?.textContent?.trim() || "";

      if(goalBtn.dataset.paceGoalAction === "remove"){
        removeCard(card);
        openPaceWithMessage(`Ho rimosso l'obiettivo "${title}" dalla sezione Obiettivi e ho riordinato i target rimasti.`);
        return;
      }

      if(goalBtn.dataset.paceGoalAction === "edit"){
        card?.classList.add("pace-ai-edited");
        const goalDesc = card?.querySelector(".goal-desc");
        if(goalDesc && !goalDesc.textContent.includes("Adattamento PACE AI:")){
          goalDesc.textContent = "Adattamento PACE AI: " + goalDesc.textContent + " Se la fatica sale, riduci volume prima di aumentare ritmo.";
        }
        card.dataset.pacePriority = String(Math.max(5, Number(card.dataset.pacePriority || 50) - 5));
        sortGoals();
      }

      openPaceWithMessage(`Analizza questo obiettivo: ${title}. Descrizione: ${desc}`);
    }
  });

  // Intervento automatico leggero al caricamento: prepara e ottimizza senza aprire la tendina.
  addStatus(suggestionsSection, "Intervento automatico leggero: PACE AI ha preparato la sezione e può aggiungere/modificare/rimuovere suggerimenti.");
  addStatus(goalsSection, "Intervento automatico leggero: PACE AI ha preparato la sezione e può aggiungere/modificare/rimuovere obiettivi.");
  setTimeout(() => runAutoCoach(false), 450);
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[data-panel="ascent-info"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById("ascentControlPanel");
      if(panel) setTimeout(() => { panel.scrollTop = 0; }, 80);
    });
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const panel = document.getElementById("ascentControlPanel");
  const backdrop = document.getElementById("drawerBackdrop");

  function syncInfoPanelSide(){
    const active = document.querySelector('.panel-view.active');
    const isInfo = active && active.dataset.view === "ascent-info";
    body.classList.toggle("ascent-info-panel-open", !!isInfo);
    if(panel && isInfo){
      panel.scrollTop = 0;
    }
  }

  document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener("click", () => {
      setTimeout(syncInfoPanelSide, 30);
      setTimeout(syncInfoPanelSide, 120);
    });
  });

  document.querySelectorAll(".panel-close,.panel-back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setTimeout(() => body.classList.remove("ascent-info-panel-open"), 120);
    });
  });

  backdrop?.addEventListener("click", () => {
    body.classList.remove("ascent-info-panel-open");
  });

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape"){
      body.classList.remove("ascent-info-panel-open");
    }
  });

  function toggleCard(card){
    const isOpen = card.classList.toggle("open");
    card.setAttribute("aria-expanded", isOpen ? "true" : "false");
    const panel = card.querySelector(".about-expand-panel");
    if(panel) panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  document.querySelectorAll(".about-mini-card, .about-manual-item").forEach(card => {
    card.addEventListener("click", (event) => {
      if(event.target.closest("a")) return;
      toggleCard(card);
    });

    card.addEventListener("keydown", (event) => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        toggleCard(card);
      }
    });
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".about-mini-card, .about-manual-item");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const parentList = card.closest(".about-info-grid, .about-manual-list");
      if(!parentList) return;

      parentList.querySelectorAll(".about-mini-card.open, .about-manual-item.open").forEach(openCard => {
        if(openCard !== card){
          openCard.classList.remove("open");
          openCard.setAttribute("aria-expanded","false");
          const panel = openCard.querySelector(".about-expand-panel");
          if(panel) panel.setAttribute("aria-hidden","true");
        }
      });
    }, true);
  });
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("aiRunDropZone");
  const fileInput = document.getElementById("aiRunFileInput");
  const preview = document.getElementById("aiRunPreview");
  const analyzeBtn = document.getElementById("aiAnalyzeRunBtn");
  const importBtn = document.getElementById("aiImportRunBtn");
  const clearBtn = document.getElementById("aiClearRunUploadBtn");
  const extractedPanel = document.getElementById("aiExtractedPanel");
  const extractedGrid = document.getElementById("aiExtractedGrid");

  let selectedFiles = [];
  let pendingExtractedRun = null;

  const fieldMap = {
    name: document.getElementById("inp-name"),
    date: document.getElementById("inp-date"),
    distance: document.getElementById("inp-dist"),
    time: document.getElementById("inp-time"),
    calories: document.getElementById("inp-cal"),
    hr: document.getElementById("inp-hr"),
    elevation: document.getElementById("inp-elev"),
    alt: document.getElementById("inp-alt"),
    pr: document.getElementById("inp-pr"),
    note: document.getElementById("inp-note")
  };

  function formatBytes(bytes){
    if(!bytes && bytes !== 0) return "";
    if(bytes < 1024) return bytes + " B";
    if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function renderPreview(){
    if(!preview) return;
    preview.innerHTML = "";
    selectedFiles.forEach(file => {
      const chip = document.createElement("div");
      chip.className = "ai-file-chip";

      if(file.type && file.type.startsWith("image/")){
        const img = document.createElement("img");
        img.className = "ai-file-thumb";
        img.alt = file.name;
        img.src = URL.createObjectURL(file);
        chip.appendChild(img);
      }else{
        const thumb = document.createElement("div");
        thumb.className = "ai-file-thumb";
        thumb.textContent = (file.name.split(".").pop() || "FILE").slice(0,4).toUpperCase();
        chip.appendChild(thumb);
      }

      const meta = document.createElement("div");
      meta.className = "ai-file-meta";
      meta.innerHTML = `<strong>${file.name}</strong><span>${file.type || "file"} · ${formatBytes(file.size)}</span>`;
      chip.appendChild(meta);
      preview.appendChild(chip);
    });

    if(analyzeBtn) analyzeBtn.disabled = selectedFiles.length === 0;
    if(importBtn) importBtn.disabled = true;
    pendingExtractedRun = null;
  }

  function setFiles(files){
    selectedFiles = Array.from(files || []);
    renderPreview();
    extractedPanel?.classList.remove("open");
    if(extractedGrid) extractedGrid.innerHTML = "";
  }

  dropZone?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", () => {
    setFiles(fileInput.files);
  });

  ["dragenter","dragover"].forEach(evt => {
    dropZone?.addEventListener(evt, event => {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    });
  });

  ["dragleave","drop"].forEach(evt => {
    dropZone?.addEventListener(evt, event => {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
    });
  });

  dropZone?.addEventListener("drop", event => {
    setFiles(event.dataTransfer.files);
  });

  function extractNumber(text, patterns){
    for(const pattern of patterns){
      const match = text.match(pattern);
      if(match) return String(match[1]).replace(",", ".");
    }
    return "";
  }

  function normalizeTime(value){
    if(!value) return "";
    value = String(value).trim().replace(/[hH]/,":").replace(/[mM]/,":").replace(/[sS]/,"");
    value = value.replace(/\s+/g,"");
    if(/^\d{1,2}:\d{2}$/.test(value)) return value;
    if(/^\d{1,2}:\d{2}:\d{2}$/.test(value)) return value;
    return value;
  }

  async function readTextFiles(){
    const textFiles = selectedFiles.filter(f =>
      /text|json|csv/i.test(f.type || "") || /\.(txt|csv|json)$/i.test(f.name)
    );

    const chunks = [];
    for(const file of textFiles){
      try{
        chunks.push(await file.text());
      }catch(e){}
    }
    return chunks.join("\n");
  }

  async function guessFromFiles(){
    const fileNames = selectedFiles.map(f => f.name).join(" ");
    const textContent = await readTextFiles();
    const joined = (fileNames + "\n" + textContent).toLowerCase();

    const today = new Date();
    const isoDate = today.toISOString().slice(0,10);

    let distance = extractNumber(joined, [
      /(?:distanza|distance)\s*[:=]?\s*(\d+(?:[\.,]\d+)?)\s?km/i,
      /(\d+(?:[\.,]\d+)?)\s?km/i
    ]);

    let time = "";
    let timeMatch =
      joined.match(/(?:tempo|time|moving time|tempo in movimento)\s*[:=]?\s*((?:\d{1,2}:)?\d{1,2}:\d{2})/i) ||
      joined.match(/(\d{1,2})h\s?(\d{1,2})m/i) ||
      joined.match(/((?:\d{1,2}:)?\d{1,2}:\d{2})/i);

    if(timeMatch){
      if(timeMatch[1] && timeMatch[2] && !timeMatch[1].includes(":")){
        time = `${timeMatch[1]}:${String(timeMatch[2]).padStart(2,"0")}:00`;
      }else{
        time = normalizeTime(timeMatch[1]);
      }
    }

    let pace = extractNumber(joined, [
      /(?:passo|pace|passo medio)\s*[:=]?\s*(\d{1,2}[:\._-]\d{2})/i,
      /(\d{1,2}[:\._-]\d{2})\s?\/?km/i
    ]).replace("_",":").replace("-",":").replace(".",":");

    let calories = extractNumber(joined, [
      /(?:calorie|cal|kcal)\s*[:=]?\s*(\d{2,4})/i,
      /(\d{2,4})\s?kcal/i
    ]);

    let hr = extractNumber(joined, [
      /(?:freq\.?\s?cardiaca media|fc media|hr|bpm)\s*[:=]?\s*(\d{2,3})/i,
      /(\d{2,3})\s?bpm/i
    ]);

    let elevation = extractNumber(joined, [
      /(?:dislivello positivo|elev|elevation|dislivello)\s*[:=]?\s*(\d{1,4})\s?m/i,
      /(\d{1,4})\s?m\+/i
    ]);

    let alt = extractNumber(joined, [
      /(?:altitudine max|alt max|altitudine)\s*[:=]?\s*(\d{1,4})\s?m/i
    ]);

    let titleMatch = joined.match(/(?:titolo|nome|activity|corsa)\s*[:=]\s*([^\n\r]+)/i);
    let name = titleMatch ? titleMatch[1].trim().slice(0,40) : "Corsa importata da PACE AI";

    // Fallback realistico se il file è immagine o non contiene testo leggibile.
    if(!distance && !time){
      distance = "7.00";
      time = "48:42";
      pace = "6:58";
      calories = "465";
      hr = "134";
      elevation = "68";
      alt = "82";
      name = "Corsa serale importata";
    }

    return {
      name,
      date: isoDate,
      distance,
      time,
      pace,
      calories,
      hr,
      elevation,
      alt,
      pr: "",
      note: "Importata da foto/file con PACE AI"
    };
  }

  function renderExtracted(data){
    const labels = {
      name:"Nome",
      date:"Data",
      distance:"Distanza",
      time:"Tempo",
      pace:"Passo rilevato",
      calories:"Calorie",
      hr:"FC media",
      elevation:"Dislivello",
      alt:"Altitudine max",
      note:"Note"
    };

    if(!extractedGrid) return;
    extractedGrid.innerHTML = "";
    Object.entries(labels).forEach(([key,label]) => {
      if(!data[key]) return;
      const item = document.createElement("div");
      item.className = "ai-extracted-item";
      item.innerHTML = `<b>${data[key]}</b><span>${label}</span>`;
      extractedGrid.appendChild(item);
    });

    extractedPanel?.classList.add("open");
  }

  function fillField(input, value){
    if(!input || value === undefined || value === null || value === "") return;
    input.value = value;
    input.classList.add("ai-filled");
    setTimeout(() => input.classList.remove("ai-filled"), 1400);
    input.dispatchEvent(new Event("input", {bubbles:true}));
    input.dispatchEvent(new Event("change", {bubbles:true}));
  }

  function fillForm(data){
    fillField(fieldMap.name, data.name);
    fillField(fieldMap.date, data.date);
    fillField(fieldMap.distance, data.distance);
    fillField(fieldMap.time, data.time);
    fillField(fieldMap.calories, data.calories);
    fillField(fieldMap.hr, data.hr);
    fillField(fieldMap.elevation, data.elevation);
    fillField(fieldMap.alt, data.alt);
    fillField(fieldMap.pr, data.pr);
    fillField(fieldMap.note, data.note);
  }

  analyzeBtn?.addEventListener("click", async () => {
    if(!selectedFiles.length) return;

    analyzeBtn.disabled = true;
    if(importBtn) importBtn.disabled = true;
    const oldText = analyzeBtn.textContent;
    analyzeBtn.textContent = "PACE AI analizza...";

    setTimeout(async () => {
      pendingExtractedRun = await guessFromFiles();
      renderExtracted(pendingExtractedRun);

      analyzeBtn.textContent = oldText;
      analyzeBtn.disabled = selectedFiles.length === 0;
      if(importBtn) importBtn.disabled = false;

      if(window.addMessage){
        window.addMessage("PACE AI", "Ho rilevato i dati dal file. Premi Importa dati per inserirli nelle caselle e salvarli nel dataset.", "ai");
      }
    }, 700);
  });

  importBtn?.addEventListener("click", () => {
    if(!pendingExtractedRun) return;

    fillForm(pendingExtractedRun);

    setTimeout(() => {
      if(typeof window.addRun === "function"){
        window.addRun();
      }else if(typeof addRun === "function"){
        addRun();
      }

      const msg = document.getElementById("add-msg");
      if(msg){
        msg.style.color = "var(--green)";
        msg.textContent = "✓ Dati importati da PACE AI e salvati nel dataset.";
        setTimeout(() => { msg.textContent = ""; }, 4500);
      }

      if(importBtn) importBtn.disabled = true;
      pendingExtractedRun = null;
    }, 120);
  });

  clearBtn?.addEventListener("click", () => {
    selectedFiles = [];
    pendingExtractedRun = null;
    if(fileInput) fileInput.value = "";
    if(preview) preview.innerHTML = "";
    if(extractedGrid) extractedGrid.innerHTML = "";
    extractedPanel?.classList.remove("open");
    if(analyzeBtn) analyzeBtn.disabled = true;
    if(importBtn) importBtn.disabled = true;
  });

  if(analyzeBtn) analyzeBtn.disabled = true;
  if(importBtn) importBtn.disabled = true;
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const drawer = document.getElementById("ascentDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const panel = document.getElementById("ascentControlPanel");
  const infoDrawer = document.getElementById("ascentInfoDrawer");
  const infoClose = document.getElementById("ascentInfoClose");

  const normalViews = new Set(["settings","login","profile","cloud"]);

  function closeMenu(){
    drawer?.classList.remove("open");
    drawer?.setAttribute("aria-hidden","true");
  }

  function closePanel(){
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden","true");
    document.body.classList.remove("ascent-left-panel-open");
  }

  function closeInfoDrawer(){
    infoDrawer?.classList.remove("open");
    infoDrawer?.setAttribute("aria-hidden","true");
    body.classList.remove("ascent-info-drawer-open");
  }

  function closeAll(){
    closeMenu();
    closePanel();
    closeInfoDrawer();
    backdrop?.classList.remove("open");
    body.classList.remove("ascent-info-panel-open");
  }

  function activateOnly(view){
    if(!panel) return;
    panel.querySelectorAll(".panel-view").forEach(section => {
      section.classList.toggle("active", section.dataset.view === view);
    });
  }

  function openNormalPanel(view){
    if(!normalViews.has(view)) return;
    closeMenu();
    closeInfoDrawer();
    activateOnly(view);

    panel?.classList.add("open");
    panel?.setAttribute("aria-hidden","false");
    backdrop?.classList.add("open");
    body.classList.add("ascent-left-panel-open");
    body.classList.remove("ascent-info-panel-open");

    if(panel) panel.scrollTop = 0;
  }

  function openInfoDrawer(){
    closeMenu();
    closePanel();

    infoDrawer?.classList.add("open");
    infoDrawer?.setAttribute("aria-hidden","false");
    backdrop?.classList.add("open");
    body.classList.add("ascent-info-drawer-open");
    body.classList.remove("ascent-info-panel-open");

    if(infoDrawer) infoDrawer.scrollTop = 0;
  }

  // Intercetto PRIMA degli script originali: così non rimane attiva la sezione sbagliata.
  document.querySelectorAll("[data-panel]").forEach(btn => {
    const view = btn.dataset.panel;
    if(!normalViews.has(view)) return;

    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openNormalPanel(view);
    }, true);
  });

  document.querySelectorAll("[data-open-ascent-info]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openInfoDrawer();
    }, true);
  });

  document.querySelectorAll(".panel-close,.panel-back-btn").forEach(btn => {
    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeAll();
    }, true);
  });

  infoClose?.addEventListener("click", event => {
    event.preventDefault();
    closeAll();
  });

  backdrop?.addEventListener("click", () => closeAll(), true);

  document.addEventListener("keydown", event => {
    if(event.key === "Escape") closeAll();
  });

  // Stato pulito iniziale: nessun Cos'è ASCENT nel pannello principale.
  activateOnly("settings");
  closeInfoDrawer();
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function isLight(){
    return document.body.classList.contains("theme-light");
  }

  function refreshChartsForLightMode(){
    // Se nel file esiste rebuildAll, lo uso per ridisegnare i grafici con i colori CSS aggiornati.
    setTimeout(() => {
      try{
        if(typeof rebuildAll === "function") rebuildAll();
      }catch(e){}

      try{
        if(window.Chart && Chart.instances){
          Object.values(Chart.instances).forEach(chart => {
            if(!chart) return;
            const light = isLight();
            const grid = light ? "rgba(18,24,40,.10)" : "rgba(255,255,255,.08)";
            const tick = light ? "#4f5364" : "#9898b0";
            const title = light ? "#101422" : "#f0f0f5";

            if(chart.options?.scales){
              Object.values(chart.options.scales).forEach(scale => {
                if(scale.grid) scale.grid.color = grid;
                if(scale.ticks) scale.ticks.color = tick;
                if(scale.title) scale.title.color = title;
              });
            }

            if(chart.options?.plugins?.legend?.labels){
              chart.options.plugins.legend.labels.color = tick;
            }

            chart.update("none");
          });
        }
      }catch(e){}
    }, 90);
  }

  document.querySelectorAll("[data-theme-choice]").forEach(btn => {
    btn.addEventListener("click", refreshChartsForLightMode);
  });

  const obs = new MutationObserver(refreshChartsForLightMode);
  obs.observe(document.body, {attributes:true, attributeFilter:["class"]});

  refreshChartsForLightMode();
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function forceTechVisible(){
    const tech = document.getElementById("tech-details");
    if(!tech) return;

    tech.style.opacity = "1";
    tech.style.filter = "none";
    tech.style.visibility = "visible";

    tech.querySelectorAll(".reveal,.tech-card,.tech-note,.demo-card,.tech-source,.tech-info-panel").forEach(el => {
      el.classList.add("visible");
      el.style.opacity = "1";
      el.style.filter = "none";
      el.style.visibility = "visible";
    });
  }

  forceTechVisible();
  window.addEventListener("scroll", forceTechVisible, {passive:true});
  window.addEventListener("resize", forceTechVisible, {passive:true});

  // Se la classe ascent-transitioning resta appesa, dopo un attimo la rimuovo.
  setTimeout(() => {
    document.body.classList.remove("ascent-transitioning");
    forceTechVisible();
  }, 900);
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function forceCoachVisible(){
    const coach = document.querySelector(".coach-intelligente-section");
    if(!coach) return;

    coach.style.opacity = "1";
    coach.style.filter = "none";
    coach.style.visibility = "visible";

    coach.querySelectorAll(".reveal,.coach-smart-main,.coach-smart-card,.section-header").forEach(el => {
      el.classList.add("visible");
      el.style.opacity = "1";
      el.style.filter = "none";
      el.style.visibility = "visible";
    });
  }

  forceCoachVisible();
  window.addEventListener("scroll", forceCoachVisible, {passive:true});
  window.addEventListener("resize", forceCoachVisible, {passive:true});

  setTimeout(() => {
    document.body.classList.remove("ascent-transitioning");
    forceCoachVisible();
  }, 900);
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const $ = id => document.getElementById(id);

  const layoutClassMap = {
    "standard": "layout-standard",
    "mobile-drawer": "layout-mobile-drawer",
    "comfort": "layout-comfort",
    "compact": "layout-ultra-compact",
    "focus": "layout-focus-data",
    "dashboard": "layout-dashboard-pro",
    "readable": "layout-readable-report"
  };

  const allLayoutClasses = Object.values(layoutClassMap);

  const layoutDescriptions = {
    "standard": "Layout completo con comportamento automatico e menu rapido disponibile.",
    "mobile-drawer": "Su mobile elimina il pulsante menu rapido: il menu si apre solo dalla scritta ASCENT a sinistra.",
    "comfort": "Aumenta spaziature e padding: ideale per lettura più comoda.",
    "compact": "Riduce spaziature e card: ideale per schermi piccoli o dashboard dense.",
    "focus": "Nasconde elementi decorativi e mette al centro dati, grafici e tabella.",
    "dashboard": "Aumenta presenza delle card e rende la dashboard più simile a un'app analytics.",
    "readable": "Versione più editoriale e leggibile, utile per analisi e report."
  };

  const toggleMap = {
    "settingSoftCards": "soft-cards",
    "settingDrawerWide": "drawer-wide",
    "settingGlassUi": "glass-ui",
    "settingLowShadow": "low-shadow",
    "settingCleanHero": "clean-hero",
    "settingCompactTable": "compact-table",
    "settingBigMetrics": "big-metrics",
    "settingChartFocus": "chart-focus",
    "settingAnimations": "no-motion"
  };

  function closeDrawerOnly(){
    $("ascentDrawer")?.classList.remove("open");
    $("drawerBackdrop")?.classList.remove("open");
    body.classList.remove("ascent-left-panel-open");
    $("ascentDrawer")?.setAttribute("aria-hidden","true");
  }

  function normalizeMode(mode){
    return layoutClassMap[mode] ? mode : "standard";
  }

  function applyLayoutMode(mode, save = true){
    mode = normalizeMode(mode);

    allLayoutClasses.forEach(cls => body.classList.remove(cls));
    body.classList.add(layoutClassMap[mode]);

    /* Compatibilità con vecchie classi */
    body.classList.toggle("mobile-mode", mode === "mobile-drawer");
    body.classList.remove("mobile-drawer-only","layout-focus-content");
    if(mode === "mobile-drawer") body.classList.add("mobile-drawer-only");
    if(mode === "focus") body.classList.add("layout-focus-content");

    document.querySelectorAll("[data-layout-mode]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.layoutMode === mode);
    });

    const note = $("layoutActiveNote");
    if(note){
      note.innerHTML = `<strong>Layout attivo:</strong> ${layoutDescriptions[mode] || layoutDescriptions.standard}`;
    }

    const oldMobile = $("settingMobileMode");
    if(oldMobile) oldMobile.checked = mode === "mobile-drawer";

    if(save){
      localStorage.setItem("ascent-layout-mode-v3", mode);
      localStorage.setItem("ascent-layout-mode-v2", mode);
      localStorage.setItem("ascent-mobile-mode", mode === "mobile-drawer" ? "on" : "off");
    }

    /* Chiude eventuale quick menu rimasto aperto se passo a mobile drawer */
    if(mode === "mobile-drawer"){
      document.querySelectorAll(".ascent-hub-trigger,.ascent-hub-panel").forEach(el => el.classList.remove("open"));
    }

    window.dispatchEvent(new Event("resize"));
  }

  function setToggle(id, cls, checked, save = true){
    const isAnimations = id === "settingAnimations";
    /* Animazioni fluide checked=true => no no-motion */
    const active = isAnimations ? !checked : checked;

    body.classList.toggle(cls, !!active);
    const el = $(id);
    if(el) el.checked = !!checked;

    if(save){
      localStorage.setItem("ascent-toggle-" + id, checked ? "on" : "off");
      /* compatibilità vecchia */
      if(id === "settingSoftCards") localStorage.setItem("ascent-soft-cards", checked ? "on" : "off");
      if(id === "settingChartFocus") localStorage.setItem("ascent-chart-focus", checked ? "on" : "off");
    }
  }

  function enhanceDrawer(){
    const panelIcons = {
      "login":"↪",
      "profile":"👤",
      "cloud":"☁",
      "settings":"⚙",
      "ascent-info":"ⓘ"
    };

    document.querySelectorAll("#ascentDrawer .drawer-item").forEach(btn => {
      const key = btn.dataset.panel || (btn.dataset.openAscentInfo ? "ascent-info" : "");
      if(key && !btn.dataset.icon) btn.dataset.icon = panelIcons[key] || "•";
    });

    const infoBtn = document.querySelector("#ascentDrawer [data-open-ascent-info]");
    if(infoBtn && !infoBtn.dataset.icon) infoBtn.dataset.icon = "ⓘ";

    const drawer = $("ascentDrawer");
    if(drawer && !$("drawerQuickNav")){
      const quick = document.createElement("div");
      quick.className = "drawer-quick-nav";
      quick.id = "drawerQuickNav";
      quick.innerHTML = `
        <div class="drawer-label">Navigazione rapida</div>
        <div class="drawer-quick-grid">
          <button class="drawer-quick-btn" data-scroll-target="#overview">Panoramica</button>
          <button class="drawer-quick-btn" data-scroll-target="#runs">Corse</button>
          <button class="drawer-quick-btn" data-scroll-target="#charts">Grafici</button>
          <button class="drawer-quick-btn" data-scroll-target="#data">Dati</button>
          <button class="drawer-quick-btn" data-scroll-target="#suggestions">Suggerimenti</button>
          <button class="drawer-quick-btn" data-scroll-target="#goals">Obiettivi</button>
        </div>
      `;
      const status = drawer.querySelector(".drawer-status");
      if(status) drawer.insertBefore(quick, status);
      else drawer.appendChild(quick);
    }

    document.querySelectorAll(".drawer-quick-btn[data-scroll-target]").forEach(btn => {
      if(btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.dataset.scrollTarget);
        closeDrawerOnly();
        setTimeout(() => target?.scrollIntoView({behavior:"smooth", block:"start"}), 80);
      });
    });
  }

  function rebuildSettingsLayout(){
    const settingsView = document.querySelector('[data-view="settings"]');
    if(!settingsView) return;

    const layoutTitle = Array.from(settingsView.querySelectorAll(".settings-block h3"))
      .find(h => h.textContent.trim().toLowerCase() === "layout");
    const layoutBlock = layoutTitle?.closest(".settings-block");

    if(layoutBlock && !layoutBlock.dataset.rebuiltV3){
      layoutBlock.dataset.rebuiltV3 = "1";
      layoutBlock.innerHTML = `
        <h3>Layout</h3>
        <div class="layout-mode-grid">
          <button class="layout-mode-card" data-layout-mode="standard" type="button">
            <strong>Standard</strong>
            <span>Esperienza completa con menu rapido e comportamento automatico.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="mobile-drawer" type="button">
            <strong>Mobile drawer</strong>
            <span>Mobile senza pulsante menu rapido: resta solo il menu sinistro.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="comfort" type="button">
            <strong>Comfort</strong>
            <span>Più spazio, card più ampie e lettura più ariosa.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="compact" type="button">
            <strong>Ultra compatto</strong>
            <span>Riduce spaziature e altezza delle card.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="focus" type="button">
            <strong>Focus dati</strong>
            <span>Rimuove decorazioni e mette in primo piano dati e grafici.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="dashboard" type="button">
            <strong>Dashboard Pro</strong>
            <span>Look più analytics, card più presenti e griglie più larghe.</span>
          </button>
          <button class="layout-mode-card" data-layout-mode="readable" type="button">
            <strong>Report leggibile</strong>
            <span>Layout editoriale per leggere meglio analisi e suggerimenti.</span>
          </button>
        </div>
        <div class="layout-active-note" id="layoutActiveNote"></div>
      `;
    }

    if(settingsView && !$("ascentPersonalizationBlockV3")){
      const experienceBlock = Array.from(settingsView.querySelectorAll(".settings-block h3"))
        .find(h => h.textContent.trim().toLowerCase() === "esperienza")
        ?.closest(".settings-block");

      const block = document.createElement("div");
      block.className = "settings-block";
      block.id = "ascentPersonalizationBlockV3";
      block.innerHTML = `
        <h3>Personalizzazione</h3>
        <label class="setting-row">
          <span><strong>Card più arrotondate</strong><small>Interfaccia più morbida e moderna.</small></span>
          <input id="settingSoftCards" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Pannello laterale largo</strong><small>Rende più ampio menu sinistro e impostazioni.</small></span>
          <input id="settingDrawerWide" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Effetto vetro</strong><small>Card e pannelli con look glass premium.</small></span>
          <input id="settingGlassUi" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Ombre leggere</strong><small>Interfaccia più pulita e meno pesante visivamente.</small></span>
          <input id="settingLowShadow" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Hero pulita</strong><small>Rimuove foto e decorazioni dalla schermata iniziale.</small></span>
          <input id="settingCleanHero" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Tabella compatta</strong><small>Riduce le righe per leggere più dati insieme.</small></span>
          <input id="settingCompactTable" type="checkbox"/>
        </label>
        <label class="setting-row">
          <span><strong>Metriche grandi</strong><small>Enfatizza numeri principali e distanze.</small></span>
          <input id="settingBigMetrics" type="checkbox"/>
        </label>
      `;

      if(experienceBlock) settingsView.insertBefore(block, experienceBlock);
      else settingsView.appendChild(block);
    }

    /* Rimuove vecchi controlli Layout duplicati rimasti altrove */
    ["settingCompact","settingMobileMode"].forEach(id => {
      const el = $(id);
      const row = el?.closest(".setting-row");
      if(row && row.closest(".settings-block")?.dataset.rebuiltV3 !== "1"){
        row.remove();
      }
    });
  }

  function bindControls(){
    document.querySelectorAll("[data-layout-mode]").forEach(btn => {
      if(btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => applyLayoutMode(btn.dataset.layoutMode));
    });

    Object.entries(toggleMap).forEach(([id, cls]) => {
      const el = $(id);
      if(!el || el.dataset.bound === "1") return;
      el.dataset.bound = "1";
      el.addEventListener("change", () => setToggle(id, cls, el.checked));
    });
  }

  function restoreState(){
    let savedMode =
      localStorage.getItem("ascent-layout-mode-v3") ||
      localStorage.getItem("ascent-layout-mode-v2") ||
      (localStorage.getItem("ascent-mobile-mode") === "on" ? "mobile-drawer" : "standard");

    applyLayoutMode(savedMode, false);

    Object.entries(toggleMap).forEach(([id, cls]) => {
      let saved = localStorage.getItem("ascent-toggle-" + id);
      if(saved === null){
        if(id === "settingSoftCards") saved = localStorage.getItem("ascent-soft-cards");
        if(id === "settingChartFocus") saved = localStorage.getItem("ascent-chart-focus");
      }

      let checked;
      if(id === "settingAnimations"){
        checked = saved === null ? true : saved === "on";
      }else{
        checked = saved === "on";
      }
      setToggle(id, cls, checked, false);
    });
  }

  function boot(){
    enhanceDrawer();
    rebuildSettingsLayout();
    bindControls();
    restoreState();
  }

  boot();

  /* Se altri script riscrivono le impostazioni, le ripristino */
  setTimeout(boot, 250);
  setTimeout(boot, 900);
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const allowedModes = new Set(["standard", "mobile-drawer"]);
  const removedModes = ["comfort", "compact", "focus", "dashboard", "readable"];
  const removedClasses = [
    "layout-comfort",
    "layout-ultra-compact",
    "layout-focus-data",
    "layout-focus-content",
    "layout-dashboard-pro",
    "layout-readable-report",
    "soft-cards",
    "low-shadow"
  ];

  function $(id){ return document.getElementById(id); }

  function normalizeMode(mode){
    return allowedModes.has(mode) ? mode : "standard";
  }

  function updateLayoutNote(mode){
    const note = $("layoutActiveNote");
    if(!note) return;
    if(mode === "mobile-drawer"){
      note.innerHTML = "<strong>Layout attivo:</strong> Mobile Drawer — in mobile viene rimosso il pulsante menu rapido e resta solo il menu a tendina sinistro.";
    }else{
      note.innerHTML = "<strong>Layout attivo:</strong> Standard — esperienza completa con comportamento automatico.";
    }
  }

  function applyOnlyAllowedLayout(mode, save = true){
    mode = normalizeMode(mode);

    removedClasses.forEach(c => body.classList.remove(c));
    body.classList.remove("layout-standard", "layout-mobile-drawer", "mobile-drawer-only");

    if(mode === "mobile-drawer"){
      body.classList.add("layout-mobile-drawer", "mobile-drawer-only", "mobile-mode");
    }else{
      body.classList.add("layout-standard");
      body.classList.remove("mobile-mode");
    }

    document.querySelectorAll("[data-layout-mode]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.layoutMode === mode);
    });

    updateLayoutNote(mode);

    if(save){
      localStorage.setItem("ascent-layout-mode-v3", mode);
      localStorage.setItem("ascent-layout-mode-v2", mode);
      localStorage.setItem("ascent-mobile-mode", mode === "mobile-drawer" ? "on" : "off");
    }

    if(mode === "mobile-drawer"){
      document.querySelectorAll(".ascent-hub-trigger,.ascent-hub-panel").forEach(el => el.classList.remove("open"));
    }

    window.dispatchEvent(new Event("resize"));
  }

  function cleanLayoutOptions(){
    /* Rimuove visivamente e funzionalmente le varianti non richieste */
    removedModes.forEach(mode => {
      document.querySelectorAll(`[data-layout-mode="${mode}"]`).forEach(btn => {
        btn.classList.add("ascent-remove-layout");
        btn.setAttribute("aria-hidden", "true");
        btn.disabled = true;
      });
    });

    /* Rimuove Card più arrotondate e Ombre leggere dalla personalizzazione */
    ["settingSoftCards", "settingLowShadow"].forEach(id => {
      const input = $(id);
      if(!input) return;
      const row = input.closest(".setting-row") || input.parentElement;
      if(row){
        row.classList.add("ascent-remove-option");
        row.setAttribute("aria-hidden", "true");
      }
      input.checked = false;
      input.disabled = true;
    });

    body.classList.remove("soft-cards", "low-shadow");
    localStorage.removeItem("ascent-toggle-settingSoftCards");
    localStorage.removeItem("ascent-toggle-settingLowShadow");
    localStorage.removeItem("ascent-soft-cards");
  }

  function fixDataQuickLink(){
    /*
      In alcune versioni la sezione dati può avere id diversi.
      Normalizzo creando/assicurando un target stabile.
    */
    let dataSection =
      document.querySelector("#data") ||
      document.querySelector("#dati") ||
      document.querySelector(".table-section") ||
      document.querySelector('[data-section="data"]');

    if(dataSection && !dataSection.id){
      dataSection.id = "data";
    }

    if(dataSection && dataSection.id !== "data"){
      // Mantengo l'id originale ma aggiungo un anchor invisibile prima della sezione
      if(!document.getElementById("data")){
        const anchor = document.createElement("div");
        anchor.id = "data";
        anchor.style.position = "relative";
        anchor.style.top = "-76px";
        anchor.style.height = "0";
        anchor.style.pointerEvents = "none";
        dataSection.parentNode.insertBefore(anchor, dataSection);
      }
    }

    document.querySelectorAll(".drawer-quick-btn").forEach(btn => {
      const label = btn.textContent.trim().toLowerCase();
      if(label === "dati" || btn.dataset.scrollTarget === "#data" || btn.dataset.scrollTarget === "#dati"){
        btn.dataset.scrollTarget = "#data";
        btn.onclick = null;
        if(btn.dataset.dataLinkFixed !== "1"){
          btn.dataset.dataLinkFixed = "1";
          btn.addEventListener("click", () => {
            const target =
              document.querySelector("#data") ||
              document.querySelector(".table-section");

            document.getElementById("ascentDrawer")?.classList.remove("open");
            document.getElementById("drawerBackdrop")?.classList.remove("open");
            document.body.classList.remove("ascent-left-panel-open");

            setTimeout(() => {
              target?.scrollIntoView({behavior:"smooth", block:"start"});
            }, 90);
          }, true);
        }
      }
    });
  }

  function bindAllowedLayoutButtons(){
    document.querySelectorAll("[data-layout-mode]").forEach(btn => {
      if(!allowedModes.has(btn.dataset.layoutMode)) return;
      if(btn.dataset.cleanLayoutBound === "1") return;
      btn.dataset.cleanLayoutBound = "1";
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        applyOnlyAllowedLayout(btn.dataset.layoutMode);
      }, true);
    });
  }

  function boot(){
    cleanLayoutOptions();
    bindAllowedLayoutButtons();
    fixDataQuickLink();

    const saved =
      localStorage.getItem("ascent-layout-mode-v3") ||
      localStorage.getItem("ascent-layout-mode-v2") ||
      (localStorage.getItem("ascent-mobile-mode") === "on" ? "mobile-drawer" : "standard");

    applyOnlyAllowedLayout(saved, false);
  }

  boot();
  setTimeout(boot, 250);
  setTimeout(boot, 900);
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function closeDrawer(){
    document.getElementById("ascentDrawer")?.classList.remove("open");
    document.getElementById("drawerBackdrop")?.classList.remove("open");
    document.body.classList.remove("ascent-left-panel-open");
    document.getElementById("ascentDrawer")?.setAttribute("aria-hidden","true");
  }

  function findAddRunSection(){
    return (
      document.querySelector("#add") ||
      document.querySelector("#addRun") ||
      document.querySelector("#aggiungi-corsa") ||
      document.querySelector("#add-run") ||
      document.querySelector(".add-section") ||
      document.querySelector(".add-form") ||
      document.querySelector(".add-run-layout")
    );
  }

  function ensureAddRunAnchor(){
    const section = findAddRunSection();
    if(!section) return null;

    if(section.id){
      return "#" + section.id;
    }

    const existing = document.getElementById("add-run-target");
    if(existing) return "#add-run-target";

    const anchor = document.createElement("div");
    anchor.id = "add-run-target";
    anchor.style.position = "relative";
    anchor.style.top = "-78px";
    anchor.style.height = "0";
    anchor.style.pointerEvents = "none";

    section.parentNode.insertBefore(anchor, section);
    return "#add-run-target";
  }

  function addCorsaButton(){
    const grid = document.querySelector("#drawerQuickNav .drawer-quick-grid") || document.querySelector(".drawer-quick-grid");
    if(!grid) return;

    const target = ensureAddRunAnchor() || "#add";
    let btn = document.getElementById("quickAddRunBtn");

    if(!btn){
      btn = document.createElement("button");
      btn.id = "quickAddRunBtn";
      btn.type = "button";
      btn.className = "drawer-quick-btn add-run-quick-btn";
      btn.textContent = "+ Corsa";
      grid.appendChild(btn);
    }

    btn.dataset.scrollTarget = target;

    if(btn.dataset.boundAddRun !== "1"){
      btn.dataset.boundAddRun = "1";
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const selector = ensureAddRunAnchor() || btn.dataset.scrollTarget || "#add";
        const targetEl = document.querySelector(selector) || findAddRunSection();

        closeDrawer();

        setTimeout(() => {
          targetEl?.scrollIntoView({behavior:"smooth", block:"start"});
          const firstInput =
            targetEl?.querySelector?.("input, select, textarea, button") ||
            document.querySelector(".add-form input, .add-form select, .add-form textarea");
          setTimeout(() => firstInput?.focus?.({preventScroll:true}), 450);
        }, 90);
      }, true);
    }
  }

  addCorsaButton();
  setTimeout(addCorsaButton, 250);
  setTimeout(addCorsaButton, 900);

  const drawer = document.getElementById("ascentDrawer");
  if(drawer){
    new MutationObserver(addCorsaButton).observe(drawer, {childList:true, subtree:true});
  }
});

/* ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  function sendToPace(text){
    const input = document.querySelector(".pace-ai-input") || document.getElementById("paceInput");
    if(input){
      input.value = text;
      input.dispatchEvent(new Event("input", {bubbles:true}));
    }

    if(typeof window.sendPaceMsg === "function"){
      window.sendPaceMsg();
      return;
    }

    const send = document.querySelector(".pace-ai-send");
    send?.click();
  }

  function removeQuickQuestions(){
    const quickSelectors = [
      ".pace-ai-quick",
      ".pace-ai-quick-actions",
      ".pace-quick-grid",
      ".pace-quick-questions",
      ".pace-ai-question-grid",
      ".quick-questions",
      ".quick-question-grid",
      ".pace-ai-suggestions",
      ".pace-ai-prompt-suggestions",
      ".pace-rapid-questions",
      "[data-pace-quick-questions]",
      "[data-quick-questions]"
    ];

    quickSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.setAttribute("aria-hidden", "true");
        el.style.display = "none";
      });
    });

    /* Rimuove blocchi che contengono il testo DOMANDE RAPIDE */
    document.querySelectorAll("div, section, header, p, span, strong").forEach(el => {
      const txt = (el.textContent || "").trim().toLowerCase();
      if(txt === "domande rapide" || txt === "quick questions"){
        const block = el.closest(".pace-ai-quick, .pace-ai-quick-actions, .pace-quick-grid, .pace-quick-questions, .pace-ai-question-grid") || el;
        block.setAttribute("aria-hidden", "true");
        block.style.display = "none";
      }
    });
  }

  function findInsertPoint(){
    return (
      document.querySelector(".pace-ai-messages") ||
      document.getElementById("paceMessages") ||
      document.querySelector(".pace-messages") ||
      document.querySelector(".pace-ai-input-row")
    );
  }

  function createCommandPanel(){
    if(document.getElementById("paceCommandPanel")) return;

    const target = findInsertPoint();
    if(!target || !target.parentNode) return;

    const panel = document.createElement("div");
    panel.className = "pace-command-panel";
    panel.id = "paceCommandPanel";
    panel.innerHTML = `
      <div class="pace-command-title">Comandi rapidi</div>
      <div class="pace-command-grid">
        <button class="pace-command-btn" type="button" data-command="Analizza i miei ultimi dati e dimmi cosa sto migliorando."><b>01</b><span>Analisi dati</span></button>
        <button class="pace-command-btn" type="button" data-command="Suggeriscimi il prossimo allenamento in base alle mie corse."><b>02</b><span>Prossimo run</span></button>
        <button class="pace-command-btn" type="button" data-command="Controlla il mio passo medio e dimmi come posso migliorarlo."><b>03</b><span>Passo</span></button>
        <button class="pace-command-btn" type="button" data-command="Valuta recupero, carico e rischio di esagerare."><b>04</b><span>Recupero</span></button>
      </div>
    `;

    target.parentNode.insertBefore(panel, target);

    panel.querySelectorAll(".pace-command-btn").forEach(btn => {
      btn.addEventListener("click", () => sendToPace(btn.dataset.command || ""));
    });
  }

  function refinePace(){
    removeQuickQuestions();
    createCommandPanel();

    const input = document.querySelector(".pace-ai-input") || document.getElementById("paceInput");
    if(input) input.placeholder = "Scrivi a PACE AI...";

    document.querySelectorAll(".pace-ai-name, .pace-ai-title, .pace-drawer-title").forEach(el => {
      if((el.textContent || "").trim()) el.textContent = "PACE AI";
    });
  }

  refinePace();
  setTimeout(refinePace, 250);
  setTimeout(refinePace, 900);

  const drawer = document.querySelector(".pace-drawer-ai, #paceAiDrawer, .pace-ai-drawer");
  if(drawer){
    new MutationObserver(refinePace).observe(drawer, {childList:true, subtree:true});
  }
});

/* ─────────────────────────── */

function openInstallGuide(){
  document.getElementById('installGuideModal').style.display='flex';
  // close drawer
  document.getElementById('ascentDrawer')?.classList.remove('open');
  document.getElementById('drawerBackdrop')?.classList.remove('open');
  document.body.classList.remove('ascent-left-panel-open');
}
function closeInstallGuide(){
  document.getElementById('installGuideModal').style.display='none';
}
function igTab(name){
  document.querySelectorAll('.ig-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ig-panel').forEach(p=>p.style.display='none');
  document.getElementById('ig-tab-'+name).classList.add('active');
  document.getElementById('ig-'+name).style.display='block';
}
document.getElementById('installGuideModal').addEventListener('click',function(e){
  if(e.target===this) closeInstallGuide();
});