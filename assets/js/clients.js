
let D=GYM.loadData(), currentId=D.clients[0]?.id||null, currentTab='overview';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0));
function getClient(){return GYM.clientById(D,currentId)}
function initials(n){return String(n||'').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function contract(c){return D.contracts.find(x=>x.client_id===c.id)}
function payRows(c){return D.payments.filter(x=>x.client_id===c.id).sort((a,b)=>String(b.due_date).localeCompare(String(a.due_date)))}
function accessRows(c){return D.accessEvents.filter(x=>x.client_id===c.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts))}
function renderList(){
  const q=$('#clientSearch').value.trim().toLowerCase(), el=$('#clientList');el.innerHTML='';
  D.clients.filter(c=>[c.name,c.id,c.phone,c.email,c.tax_id].some(v=>String(v||'').toLowerCase().includes(q))).forEach(c=>{
    const div=document.createElement('div');div.className='client-item '+(c.id===currentId?'active':'');
    div.innerHTML=`<strong>${esc(c.name)}</strong><div class="muted">#${esc(c.id)} · ${esc(GYM.getPlan(D,c.plan).name)}</div><div style="margin-top:6px"><span class="badge ${c.status==='active'?'ok':c.status==='frozen'?'warn':'bad'}">${esc(c.status)}</span> <span class="badge ${c.payment==='paid'?'ok':c.payment==='overdue'?'bad':'warn'}">${esc(c.payment)}</span></div>`;
    div.onclick=()=>{currentId=c.id;renderAll()};el.appendChild(div)
  })
}
function setTab(t){
  currentTab=t;document.querySelectorAll('.profile-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  document.querySelectorAll('.profile-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t));
}
function renderHeader(c){
  $('#profileAvatar').textContent=initials(c.name);$('#profileName').textContent=c.name;$('#profileMeta').textContent=`#${c.id} · ${c.email||'-'} · ${c.phone||'-'}`;
  $('#profileBadges').innerHTML=`<span class="badge ${c.status==='active'?'ok':c.status==='frozen'?'warn':'bad'}">${esc(c.status)}</span> <span class="badge ${c.payment==='paid'?'ok':c.payment==='overdue'?'bad':'warn'}">${esc(c.payment)}</span> <span class="badge ${c.access==='blocked'?'bad':c.access==='grace'?'warn':'ok'}">${esc(c.access)}</span>`;
}
function renderOverview(c){
  const p=GYM.getPlan(D,c.plan), ctr=contract(c), pays=payRows(c), debt=pays.filter(x=>['pending','overdue'].includes(x.status)).reduce((a,x)=>a+Number(x.amount||0),0);
  const lastAccess=accessRows(c)[0];
  $('#overviewPanel').innerHTML=`
  <div class="grid row3">
    <div class="card"><span class="muted">Plano</span><strong style="display:block;font-size:20px">${esc(p.name)}</strong><div class="muted">${money(p.price)}/mês</div></div>
    <div class="card"><span class="muted">Dívida/Pendente</span><strong style="display:block;font-size:20px">${money(debt)}</strong><div class="muted">Validade: ${esc(c.valid_until||'-')}</div></div>
    <div class="card"><span class="muted">Último acesso</span><strong style="display:block;font-size:16px">${lastAccess?new Date(lastAccess.ts).toLocaleString('pt-PT'):'Sem registos'}</strong><div class="muted">${lastAccess?esc(lastAccess.reason):''}</div></div>
  </div>
  <div class="grid row" style="margin-top:16px">
    <div class="card"><h3>Dados pessoais</h3><div class="metric-row"><span>NIF</span><strong>${esc(c.tax_id||'-')}</strong></div><div class="metric-row"><span>Nascimento</span><strong>${esc(c.birth_date||'-')}</strong></div><div class="metric-row"><span>Emergência</span><strong>${esc(c.emergency_name||'-')} ${esc(c.emergency_phone||'')}</strong></div><div class="metric-row"><span>Notas médicas</span><strong>${esc(c.medical_notes||'-')}</strong></div></div>
    <div class="card"><h3>Contrato</h3><div class="metric-row"><span>Estado</span><strong>${esc(ctr?.status||'-')}</strong></div><div class="metric-row"><span>Início</span><strong>${esc(ctr?.start_date||'-')}</strong></div><div class="metric-row"><span>Fidelização</span><strong>${ctr?.commitment_months||0} meses</strong></div><div class="metric-row"><span>Pagamento</span><strong>${esc(ctr?.payment_method||'-')}</strong></div></div>
  </div>`;
}
function renderFinance(c){
  const rows=payRows(c);
  $('#financePanel').innerHTML=`<div class="card"><div class="section-title"><h3 style="margin:0">Histórico financeiro</h3><button class="btn primary" id="markPaid">Marcar próximo como pago</button></div><div style="overflow:auto"><table><thead><tr><th>Referência</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Estado</th><th>Método</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${esc(p.reference)}</td><td>${esc(p.kind)}</td><td>${money(p.amount)}</td><td>${esc(p.due_date)}</td><td><span class="badge ${p.status==='paid'?'ok':p.status==='overdue'?'bad':'warn'}">${esc(p.status)}</span></td><td>${esc(p.method||'-')}</td></tr>`).join('')}</tbody></table></div></div>`;
  $('#markPaid').onclick=()=>markNextPaid(c);
}
function renderAccess(c){
  const g=GYM.getGroup(D,c.access_group), rows=accessRows(c);
  $('#accessPanel').innerHTML=`<div class="grid row"><div class="card"><h3>Credenciais</h3><div class="metric-row"><span>Grupo</span><strong>${esc(g?.name||'-')}</strong></div><div class="metric-row"><span>Cartão</span><strong>${esc(c.card||'-')}</strong></div><div class="metric-row"><span>QR</span><strong>${esc(c.qr||'-')}</strong></div><div class="metric-row"><span>Face</span><strong>${c.face?'Ativa':'Não'}</strong></div><div class="toolbar" style="margin-top:12px"><button class="btn light" id="syncCred">Sincronizar</button><button class="btn ${c.access==='blocked'?'success':'danger'}" id="toggleAccess">${c.access==='blocked'?'Desbloquear':'Bloquear'}</button></div></div>
  <div class="card"><h3>Últimos acessos</h3>${rows.slice(0,8).map(x=>`<div class="timeline-item"><strong>${x.result==='allowed'?'Autorizado':'Recusado'}</strong><div class="muted">${esc(x.door)} · ${new Date(x.ts).toLocaleString('pt-PT')}</div><div class="muted">${esc(x.reason)}</div></div>`).join('')||'<div class="muted">Sem eventos.</div>'}</div></div>`;
  $('#syncCred').onclick=()=>{const targets=D.terminals.filter(t=>t.enabled&&g?.doors.includes(t.door));targets.forEach(t=>GYM.queueSync(D,c,'upsert',t.id));D=GYM.loadData();alert(`${targets.length} pedido(s) de sincronização criado(s).`)};
  $('#toggleAccess').onclick=()=>{c.access=c.access==='blocked'?'allowed':'blocked';GYM.saveData(D);D=GYM.loadData();renderAll()};
}
function renderActivities(c){
  const classes=D.classBookings.filter(x=>x.client_id===c.id), pts=D.ptSessions.filter(x=>x.client_id===c.id);
  $('#activitiesPanel').innerHTML=`<div class="grid row"><div class="card"><h3>Aulas</h3>${classes.map(x=>`<div class="timeline-item"><strong>${esc(x.class_name)}</strong><div class="muted">${esc(x.date)} · ${esc(x.time)} · ${esc(x.status)}</div></div>`).join('')||'<div class="muted">Sem aulas.</div>'}</div>
  <div class="card"><h3>PT</h3>${pts.map(x=>`<div class="timeline-item"><strong>${esc(x.trainer)}</strong><div class="muted">${esc(x.date)} · ${esc(x.time)} · ${esc(x.status)}</div></div>`).join('')||'<div class="muted">Sem sessões PT.</div>'}</div></div>`;
}
function renderMeasurements(c){
  const ms=D.measurements.filter(x=>x.client_id===c.id).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  $('#measurementsPanel').innerHTML=`<div class="card"><div class="section-title"><h3 style="margin:0">Avaliações</h3><button class="btn primary" id="addMeasurement">Nova avaliação</button></div><div style="overflow:auto"><table><thead><tr><th>Data</th><th>Peso</th><th>Gordura %</th><th>Músculo kg</th><th>Cintura cm</th></tr></thead><tbody>${ms.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.weight)}</td><td>${esc(x.fat)}</td><td>${esc(x.muscle)}</td><td>${esc(x.waist)}</td></tr>`).join('')}</tbody></table></div></div>`;
  $('#addMeasurement').onclick=()=>openMeasurement(c);
}
function renderDocuments(c){
  const docs=D.clientDocuments.filter(x=>x.client_id===c.id);
  $('#documentsPanel').innerHTML=`<div class="card"><div class="section-title"><h3 style="margin:0">Documentos</h3><button class="btn light" id="addDoc">Adicionar registo</button></div>${docs.map(d=>`<div class="doc-row"><div><strong>${esc(d.name)}</strong><div class="muted">${esc(d.type)} · ${esc(d.date)}</div></div><span class="badge ${d.status==='signed'?'ok':'warn'}">${esc(d.status)}</span></div>`).join('')||'<div class="muted">Sem documentos.</div>'}</div>`;
  $('#addDoc').onclick=()=>{const name=prompt('Nome do documento:');if(!name)return;D.clientDocuments.push({id:'doc-'+Date.now(),client_id:c.id,name,type:'other',date:GYM.ymd(new Date()),status:'registered'});GYM.saveData(D);D=GYM.loadData();renderDocuments(c)};
}
function renderNotes(c){
  const notes=D.clientNotes.filter(x=>x.client_id===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  $('#notesPanel').innerHTML=`<div class="card"><div class="section-title"><h3 style="margin:0">Notas internas</h3><button class="btn light" id="addNote">Nova nota</button></div>${notes.map(n=>`<div class="timeline-item"><strong>${esc(n.author)}</strong><div class="muted">${new Date(n.date).toLocaleString('pt-PT')}</div><div>${esc(n.text)}</div></div>`).join('')||'<div class="muted">Sem notas.</div>'}</div>`;
  $('#addNote').onclick=()=>{const t=prompt('Nota interna:');if(!t)return;D.clientNotes.push({id:'note-'+Date.now(),client_id:c.id,date:GYM.nowIso(),author:'Admin',text:t});GYM.saveData(D);D=GYM.loadData();renderNotes(c)};
}
function renderAll(){
  renderList(); const c=getClient(); if(!c)return;
  renderHeader(c);renderOverview(c);renderFinance(c);renderAccess(c);renderActivities(c);renderMeasurements(c);renderDocuments(c);renderNotes(c);setTab(currentTab);
}
function markNextPaid(c){
  const p=payRows(c).find(x=>x.status!=='paid');
  if(!p)return alert('Não existem pagamentos pendentes.');
  p.status='paid';p.paid_at=GYM.ymd(new Date());c.payment='paid';if(c.access!=='blocked')c.access='allowed';
  const n=new Date();c.valid_until=GYM.ymd(new Date(n.getFullYear(),n.getMonth()+1,n.getDate()));
  GYM.saveData(D);D=GYM.loadData();renderAll()
}
function changePlan(){
  const c=getClient(), sel=$('#planSelect'); sel.innerHTML=D.plans.map(p=>`<option value="${p.id}" ${p.id===c.plan?'selected':''}>${esc(p.name)} — ${money(p.price)}</option>`).join('');
  $('#planModal').classList.remove('hidden')
}
function savePlan(){
  const c=getClient(),p=GYM.getPlan(D,$('#planSelect').value);c.plan=p.id;c.access_group=p.access_group;
  const ctr=contract(c);if(ctr){ctr.plan_id=p.id;ctr.commitment_months=p.commitment_months||0}
  D.terminals.filter(t=>t.enabled&&GYM.getGroup(D,p.access_group)?.doors.includes(t.door)).forEach(t=>GYM.queueSync(D,c,'upsert',t.id));
  GYM.saveData(D);D=GYM.loadData();$('#planModal').classList.add('hidden');renderAll()
}
function freezeClient(){
  const c=getClient();$('#freezeFrom').value=GYM.ymd(new Date());$('#freezeTo').value='';$('#freezeReason').value='';$('#freezeModal').classList.remove('hidden')
}
function saveFreeze(){
  const c=getClient(),from=$('#freezeFrom').value,to=$('#freezeTo').value,reason=$('#freezeReason').value.trim();
  if(!from||!to)return alert('Indica início e fim.');
  D.freezes.push({id:'frz-'+Date.now(),client_id:c.id,from,to,reason,status:'active'});c.status='frozen';c.access='blocked';
  GYM.saveData(D);D=GYM.loadData();$('#freezeModal').classList.add('hidden');renderAll()
}
function cancelClient(){
  const c=getClient();if(!confirm(`Cancelar a adesão de ${c.name}?`))return;c.status='cancelled';c.access='blocked';const ctr=contract(c);if(ctr)ctr.status='cancelled';GYM.queueSync(D,c,'delete');GYM.saveData(D);D=GYM.loadData();renderAll()
}
function reactivate(){
  const c=getClient();c.status='active';if(c.payment==='paid')c.access='allowed';const ctr=contract(c);if(ctr)ctr.status='active';GYM.saveData(D);D=GYM.loadData();renderAll()
}
function openMeasurement(c){$('#measurementModal').classList.remove('hidden');$('#mDate').value=GYM.ymd(new Date());$('#mWeight').value='';$('#mFat').value='';$('#mMuscle').value='';$('#mWaist').value=''}
function saveMeasurement(){const c=getClient();D.measurements.push({id:'m-'+Date.now(),client_id:c.id,date:$('#mDate').value,weight:Number($('#mWeight').value||0),fat:Number($('#mFat').value||0),muscle:Number($('#mMuscle').value||0),waist:Number($('#mWaist').value||0)});GYM.saveData(D);D=GYM.loadData();$('#measurementModal').classList.add('hidden');renderAll()}
$('#clientSearch').addEventListener('input',renderList);document.querySelectorAll('.profile-tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('#changePlan').onclick=changePlan;$('#freezeClient').onclick=freezeClient;$('#cancelClient').onclick=cancelClient;$('#reactivateClient').onclick=reactivate;
$('#savePlan').onclick=savePlan;$('#closePlan').onclick=()=>$('#planModal').classList.add('hidden');
$('#saveFreeze').onclick=saveFreeze;$('#closeFreeze').onclick=()=>$('#freezeModal').classList.add('hidden');
$('#saveMeasurement').onclick=saveMeasurement;$('#closeMeasurement').onclick=()=>$('#measurementModal').classList.add('hidden');
renderAll();
