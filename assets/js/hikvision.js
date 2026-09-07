
let D=GYM.loadData();
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function terminalName(id){return D.terminals.find(t=>t.id===id)?.name||id||'Todos'}
function clientName(id){return D.clients.find(c=>c.id===id)?.name||id||'-'}
function groupName(id){return D.accessGroups.find(g=>g.id===id)?.name||id}
function scheduleName(id){return D.schedules.find(s=>s.id===id)?.name||id}

function renderStats(){
  $('#stTerminals').textContent=D.terminals.length;
  $('#stOnline').textContent=D.terminals.filter(t=>t.online&&t.enabled).length;
  $('#stPending').textContent=D.syncQueue.filter(q=>q.status==='pending').length;
  $('#stErrors').textContent=D.syncQueue.filter(q=>q.status==='error').length + D.commandLog.filter(c=>c.status==='error' && Date.now()-new Date(c.created_at)<86400000).length;
}
function renderTerminals(){
  const el=$('#terminalRows'); el.innerHTML='';
  D.terminals.forEach(t=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${esc(t.name)}</strong><div class="muted">${esc(t.model)} · ${esc(t.serial)}</div></td>
    <td><span class="mono">${esc(t.protocol)}://${esc(t.ip)}:${esc(t.port)}</span></td>
    <td>${esc(t.door)}</td>
    <td><span class="badge ${t.online&&t.enabled?'ok':'bad'}">${t.enabled?(t.online?'ONLINE':'OFFLINE'):'DESATIVADO'}</span></td>
    <td>${new Date(t.last_sync).toLocaleString('pt-PT')}</td>
    <td><div class="toolbar"><button class="btn light" data-ping="${esc(t.id)}">Testar</button><button class="btn light" data-toggle="${esc(t.id)}">${t.enabled?'Desativar':'Ativar'}</button></div></td>`;
    el.appendChild(tr)
  })
  document.querySelectorAll('[data-ping]').forEach(b=>b.onclick=()=>pingTerminal(b.dataset.ping));
  document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>toggleTerminal(b.dataset.toggle));
}
function renderGroups(){
  const el=$('#groupRows'); el.innerHTML='';
  D.accessGroups.forEach(g=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${esc(g.name)}</strong><div class="muted">${esc(g.id)}</div></td><td>${esc(scheduleName(g.schedule_id))}</td><td>${g.doors.map(esc).join(', ')}</td><td>${D.clients.filter(c=>c.access_group===g.id).length}</td>`;
    el.appendChild(tr)
  })
}
function renderSchedules(){
  const el=$('#scheduleRows'); el.innerHTML='';
  D.schedules.forEach(s=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${esc(s.name)}</strong></td><td>${s.days.join(', ')}</td><td>${esc(s.start)} - ${esc(s.end)}</td><td>${D.accessGroups.filter(g=>g.schedule_id===s.id).length}</td>`;
    el.appendChild(tr)
  })
}
function renderCredentials(){
  const el=$('#credentialRows'); el.innerHTML='';
  D.clients.forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${esc(c.name)}</strong><div class="muted">#${esc(c.id)}</div></td><td>${esc(groupName(c.access_group))}</td><td>${esc(c.card||'-')}</td><td>${esc(c.qr||'-')}</td><td>${c.face?'<span class="badge ok">SIM</span>':'<span class="badge warn">NÃO</span>'}</td><td><button class="btn light" data-syncclient="${esc(c.id)}">Sincronizar</button></td>`;
    el.appendChild(tr)
  });
  document.querySelectorAll('[data-syncclient]').forEach(b=>b.onclick=()=>syncClient(b.dataset.syncclient));
}
function renderQueue(){
  const el=$('#queueRows'); el.innerHTML='';
  D.syncQueue.slice().reverse().forEach(q=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${new Date(q.created_at).toLocaleString('pt-PT')}</td><td>${esc(clientName(q.client_id))}</td><td>${esc(q.terminal_id?terminalName(q.terminal_id):'Todos')}</td><td>${esc(q.op)}</td><td><span class="badge ${q.status==='synced'?'ok':q.status==='error'?'bad':'warn'}">${esc(q.status.toUpperCase())}</span></td><td>${esc(q.last_error||'-')}</td>`;
    el.appendChild(tr)
  })
}
function renderLog(){
  const el=$('#logRows'); el.innerHTML='';
  D.commandLog.forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${new Date(c.created_at).toLocaleString('pt-PT')}</td><td>${esc(terminalName(c.terminal_id))}</td><td>${esc(clientName(c.client_id))}</td><td>${esc(c.operation)}</td><td><span class="badge ${c.status==='success'?'ok':c.status==='error'?'bad':'warn'}">${esc(c.status.toUpperCase())}</span></td><td>${esc(c.message||'-')}</td>`;
    el.appendChild(tr)
  })
}
function renderAll(){renderStats();renderTerminals();renderGroups();renderSchedules();renderCredentials();renderQueue();renderLog()}

function pingTerminal(id){
  const t=D.terminals.find(x=>x.id===id); if(!t)return;
  // Local simulation: disabled terminals fail; otherwise flip to online on successful test
  if(!t.enabled){
    GYM.logCommand(D,{terminal_id:id,operation:'PING',status:'error',message:'Terminal desativado'});
  } else {
    t.online=true; t.last_sync=GYM.nowIso();
    GYM.logCommand(D,{terminal_id:id,operation:'PING',status:'success',message:'Ligação simulada com sucesso'});
  }
  GYM.saveData(D); D=GYM.loadData(); renderAll();
}
function toggleTerminal(id){
  const t=D.terminals.find(x=>x.id===id); if(!t)return;
  t.enabled=!t.enabled;
  if(!t.enabled)t.online=false;
  GYM.logCommand(D,{terminal_id:id,operation:t.enabled?'ENABLE_TERMINAL':'DISABLE_TERMINAL',status:'success',message:'Estado alterado localmente'});
  GYM.saveData(D); D=GYM.loadData(); renderAll();
}
function syncClient(id){
  const c=GYM.clientById(D,id); if(!c)return;
  const grp=GYM.getGroup(D,c.access_group); const targets=D.terminals.filter(t=>t.enabled && grp?.doors.includes(t.door));
  if(!targets.length){alert('Nenhum terminal aplicável a este grupo.');return}
  targets.forEach(t=>GYM.queueSync(D,c,'upsert',t.id));
  D=GYM.loadData(); renderAll();
}
function processQueue(){
  let ok=0, err=0;
  D.syncQueue.filter(q=>q.status==='pending').forEach(q=>{
    const t=q.terminal_id?D.terminals.find(x=>x.id===q.terminal_id):null;
    q.attempts=(q.attempts||0)+1;
    if(!t || !t.enabled || !t.online){
      q.status='error'; q.last_error=!t?'Terminal inexistente':!t.enabled?'Terminal desativado':'Terminal offline';
      GYM.logCommand(D,{terminal_id:q.terminal_id,client_id:q.client_id,operation:'UPSERT_PERSON',status:'error',message:q.last_error}); err++;
    } else {
      q.status='synced'; q.synced_at=GYM.nowIso(); q.last_error=null; t.last_sync=GYM.nowIso();
      GYM.logCommand(D,{terminal_id:q.terminal_id,client_id:q.client_id,operation:'UPSERT_PERSON',status:'success',message:'Credencial sincronizada (simulação)'}); ok++;
    }
  });
  GYM.saveData(D); D=GYM.loadData(); renderAll(); alert(`${ok} sincronizado(s), ${err} erro(s).`);
}
function retryErrors(){
  D.syncQueue.filter(q=>q.status==='error').forEach(q=>{q.status='pending';q.last_error=null});
  GYM.saveData(D); D=GYM.loadData(); renderAll();
}
function openAddTerminal(){$('#terminalModal').classList.remove('hidden')}
function closeAddTerminal(){$('#terminalModal').classList.add('hidden')}
function saveTerminal(){
  const name=$('#tName').value.trim(), ip=$('#tIp').value.trim(), door=$('#tDoor').value, model=$('#tModel').value.trim()||'Hikvision';
  if(!name||!ip)return alert('Preenche nome e IP.');
  D.terminals.push({id:'hk-'+Date.now(),name,door,ip,port:Number($('#tPort').value||80),protocol:$('#tProtocol').value,model,serial:$('#tSerial').value.trim()||('SER-'+Date.now()),online:false,last_sync:GYM.nowIso(),enabled:true});
  GYM.saveData(D); D=GYM.loadData(); closeAddTerminal(); renderAll();
}
function openAddGroup(){$('#groupModal').classList.remove('hidden'); fillScheduleSelect()}
function closeAddGroup(){$('#groupModal').classList.add('hidden')}
function fillScheduleSelect(){
  $('#gSchedule').innerHTML=D.schedules.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
}
function saveGroup(){
  const name=$('#gName').value.trim(), schedule_id=$('#gSchedule').value;
  const doors=[...document.querySelectorAll('input[name="gdoor"]:checked')].map(x=>x.value);
  if(!name||!doors.length)return alert('Indica nome e pelo menos uma porta.');
  D.accessGroups.push({id:'grp-'+Date.now(),name,schedule_id,doors}); GYM.saveData(D);D=GYM.loadData();closeAddGroup();renderAll();
}
function openAddSchedule(){$('#scheduleModal').classList.remove('hidden')}
function closeAddSchedule(){$('#scheduleModal').classList.add('hidden')}
function saveSchedule(){
  const name=$('#sName').value.trim(), start=$('#sStart').value, end=$('#sEnd').value;
  const days=[...document.querySelectorAll('input[name="sday"]:checked')].map(x=>Number(x.value));
  if(!name||!start||!end||!days.length)return alert('Preenche nome, dias e horário.');
  D.schedules.push({id:'sch-'+Date.now(),name,days,start,end});GYM.saveData(D);D=GYM.loadData();closeAddSchedule();renderAll();
}

$('#processQueue').onclick=processQueue; $('#retryErrors').onclick=retryErrors;
$('#addTerminal').onclick=openAddTerminal; $('#closeTerminal').onclick=closeAddTerminal; $('#saveTerminal').onclick=saveTerminal;
$('#addGroup').onclick=openAddGroup; $('#closeGroup').onclick=closeAddGroup; $('#saveGroup').onclick=saveGroup;
$('#addSchedule').onclick=openAddSchedule; $('#closeSchedule').onclick=closeAddSchedule; $('#saveSchedule').onclick=saveSchedule;
renderAll();
