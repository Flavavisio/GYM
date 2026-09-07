
let D=GYM.loadData();
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const STAGES=[
  ['new','Novo Lead'],['contacted','Contactado'],['trial','Visita / Trial'],
  ['proposal','Proposta'],['won','Ganho'],['lost','Perdido']
];
function stageName(id){return STAGES.find(x=>x[0]===id)?.[1]||id}
function renderKPIs(){
  const total=D.leads.length, won=D.leads.filter(l=>l.stage==='won').length, open=D.leads.filter(l=>!['won','lost'].includes(l.stage)).length;
  const pipeline=D.leads.filter(l=>!['won','lost'].includes(l.stage)).reduce((a,l)=>a+Number(l.value||0),0);
  const conv=total?Math.round(won/total*100):0;
  $('#kTotal').textContent=total; $('#kOpen').textContent=open; $('#kWon').textContent=won; $('#kConv').textContent=conv+'%'; $('#kPipe').textContent='€'+pipeline.toFixed(2);
  const due=D.crmTasks.filter(t=>t.status==='open' && t.due_date && t.due_date<=GYM.ymd(new Date())).length;
  $('#kTasks').textContent=due;
}
function renderKanban(){
  const el=$('#kanban'); el.innerHTML='';
  STAGES.forEach(([id,label])=>{
    const leads=D.leads.filter(l=>l.stage===id);
    const col=document.createElement('div'); col.className='kanban-col';
    col.innerHTML=`<h3>${label}<span class="kanban-count">${leads.length}</span></h3><div data-col="${id}"></div>`;
    el.appendChild(col);
    const body=col.querySelector('[data-col]');
    leads.forEach(l=>{
      const card=document.createElement('div'); card.className='lead-card';
      card.innerHTML=`<strong>${esc(l.name)}</strong><div class="lead-meta">${esc(l.interest||'-')} · ${esc(l.source||'-')}</div>
      <div class="lead-meta">Responsável: ${esc(l.owner||'-')}</div>
      ${l.next_date?`<div class="lead-meta">Próximo: ${esc(l.next_action||'-')} · ${esc(l.next_date)}</div>`:''}
      <div class="toolbar" style="margin-top:10px"><button class="btn light" data-edit="${esc(l.id)}">Abrir</button>${id!=='won'&&id!=='lost'?`<button class="btn light" data-next="${esc(l.id)}">Avançar</button>`:''}</div>`;
      body.appendChild(card)
    })
  });
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openLead(b.dataset.edit));
  document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>advanceLead(b.dataset.next));
}
function renderTasks(){
  $('#taskRows').innerHTML=D.crmTasks.slice().sort((a,b)=>String(a.due_date).localeCompare(String(b.due_date))).map(t=>{
    const l=D.leads.find(x=>x.id===t.lead_id);
    return `<tr><td>${esc(t.due_date||'-')}</td><td>${esc(t.title)}</td><td>${esc(l?.name||'-')}</td><td>${esc(t.owner||'-')}</td><td><span class="badge ${t.status==='done'?'ok':'warn'}">${esc(t.status)}</span></td><td>${t.status==='open'?`<button class="btn light" data-donetask="${esc(t.id)}">Concluir</button>`:''}</td></tr>`
  }).join('');
  document.querySelectorAll('[data-donetask]').forEach(b=>b.onclick=()=>{const t=D.crmTasks.find(x=>x.id===b.dataset.donetask);if(t)t.status='done';GYM.saveData(D);D=GYM.loadData();renderAll()})
}
function renderSources(){
  const counts={};D.leadSources.forEach(s=>counts[s]=0);D.leads.forEach(l=>counts[l.source]=(counts[l.source]||0)+1);
  $('#sourceStats').innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<div class="metric-row"><span>${esc(s)}</span><strong>${n}</strong></div>`).join('');
}
function renderOwners(){
  const rows={}; D.salesPeople.forEach(o=>rows[o]={total:0,won:0});
  D.leads.forEach(l=>{rows[l.owner]??={total:0,won:0};rows[l.owner].total++;if(l.stage==='won')rows[l.owner].won++});
  $('#ownerStats').innerHTML=Object.entries(rows).map(([o,v])=>`<div class="metric-row"><span>${esc(o)}</span><strong>${v.won}/${v.total} ganhos</strong></div>`).join('');
}
function fillSelects(){
  $('#leadSource').innerHTML=D.leadSources.map(x=>`<option>${esc(x)}</option>`).join('');
  $('#leadOwner').innerHTML=D.salesPeople.map(x=>`<option>${esc(x)}</option>`).join('');
  $('#leadStage').innerHTML=STAGES.map(([id,n])=>`<option value="${id}">${esc(n)}</option>`).join('');
  $('#taskOwner').innerHTML=D.salesPeople.map(x=>`<option>${esc(x)}</option>`).join('');
  $('#taskLead').innerHTML=D.leads.filter(l=>!['won','lost'].includes(l.stage)).map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('');
}
function openNew(){fillSelects();$('#leadModal').classList.remove('hidden');$('#leadId').value='';$('#leadName').value='';$('#leadPhone').value='';$('#leadEmail').value='';$('#leadInterest').value='';$('#leadValue').value='';$('#leadAction').value='';$('#leadDate').value='';$('#leadNotes').value='';$('#leadStage').value='new'}
function openLead(id){fillSelects();const l=D.leads.find(x=>x.id===id);if(!l)return;$('#leadModal').classList.remove('hidden');$('#leadId').value=l.id;$('#leadName').value=l.name;$('#leadPhone').value=l.phone||'';$('#leadEmail').value=l.email||'';$('#leadSource').value=l.source||D.leadSources[0];$('#leadOwner').value=l.owner||D.salesPeople[0];$('#leadStage').value=l.stage;$('#leadInterest').value=l.interest||'';$('#leadValue').value=l.value||'';$('#leadAction').value=l.next_action||'';$('#leadDate').value=l.next_date||'';$('#leadNotes').value=l.notes||''}
function closeLead(){$('#leadModal').classList.add('hidden')}
function saveLead(){
  const id=$('#leadId').value||('lead-'+Date.now()), name=$('#leadName').value.trim();
  if(!name)return alert('Indica o nome.');
  let l=D.leads.find(x=>x.id===id);
  if(!l){l={id,created_at:GYM.nowIso()};D.leads.push(l)}
  Object.assign(l,{name,phone:$('#leadPhone').value.trim(),email:$('#leadEmail').value.trim(),source:$('#leadSource').value,owner:$('#leadOwner').value,stage:$('#leadStage').value,interest:$('#leadInterest').value.trim(),value:Number($('#leadValue').value||0),next_action:$('#leadAction').value.trim(),next_date:$('#leadDate').value||null,notes:$('#leadNotes').value.trim()});
  GYM.saveData(D);D=GYM.loadData();closeLead();renderAll()
}
function advanceLead(id){
  const l=D.leads.find(x=>x.id===id); if(!l)return;
  const order=['new','contacted','trial','proposal','won']; const i=order.indexOf(l.stage);
  if(i>=0&&i<order.length-1)l.stage=order[i+1];
  if(l.stage==='won') l.next_action='Converter em inscrição';
  GYM.saveData(D);D=GYM.loadData();renderAll()
}
function convertWon(){
  const id=$('#leadId').value,l=D.leads.find(x=>x.id===id);
  if(!l)return alert('Guarda primeiro o lead.');
  l.stage='won';GYM.saveData(D);
  localStorage.setItem('gymcontrol_prefill_lead',JSON.stringify({name:l.name,email:l.email,phone:l.phone,lead_id:l.id,interest:l.interest}));
  window.location.href='enrollment.html';
}
function openTask(){fillSelects();$('#taskModal').classList.remove('hidden')}
function closeTask(){$('#taskModal').classList.add('hidden')}
function saveTask(){
  const title=$('#taskTitle').value.trim(),lead_id=$('#taskLead').value,due_date=$('#taskDate').value,owner=$('#taskOwner').value;
  if(!title||!lead_id||!due_date)return alert('Preenche tarefa, lead e data.');
  D.crmTasks.push({id:'task-'+Date.now(),lead_id,title,due_date,status:'open',owner});GYM.saveData(D);D=GYM.loadData();closeTask();renderAll()
}
function renderAll(){renderKPIs();renderKanban();renderTasks();renderSources();renderOwners();fillSelects()}
$('#newLead').onclick=openNew;$('#closeLead').onclick=closeLead;$('#saveLead').onclick=saveLead;$('#convertLead').onclick=convertWon;
$('#newTask').onclick=openTask;$('#closeTask').onclick=closeTask;$('#saveTask').onclick=saveTask;
renderAll();
