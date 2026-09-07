
let D=GYM.loadData(), selected=null;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function renderKPIs(){
  $('#inside').textContent=D.gym.inside||0; $('#capacity').textContent=D.gym.capacity;
  $('#denied').textContent=D.accessEvents.filter(e=>e.result==='denied' && Date.now()-new Date(e.ts)<86400000).length;
  $('#queue').textContent=D.syncQueue.filter(x=>x.status==='pending').length;
  const pct=Math.min(100,Math.round((D.gym.inside/D.gym.capacity)*100));
  $('#capbar').style.width=pct+'%'; $('#cappct').textContent=pct+'%';
}
function search(){
  const q=$('#search').value.trim().toLowerCase(), box=$('#results'); box.innerHTML='';
  if(!q)return;
  D.clients.filter(c=>[c.id,c.name,c.phone,c.card,c.qr].some(v=>String(v||'').toLowerCase().includes(q))).slice(0,8).forEach(c=>{
    const b=document.createElement('button'); b.className='btn light'; b.style='display:block;width:100%;text-align:left;margin:6px 0';
    b.innerHTML=`<strong>${esc(c.name)}</strong><br><span class="muted">#${esc(c.id)} · ${esc(c.plan)} · ${esc(c.payment)}</span>`;
    b.onclick=()=>selectClient(c.id); box.appendChild(b);
  });
}
function selectClient(id){
  selected=GYM.clientById(D,id); if(!selected)return;
  const p=GYM.getPlan(D,selected.plan); $('#person').classList.remove('hidden');
  $('#avatar').textContent=selected.name.split(' ').map(x=>x[0]).slice(0,2).join('');
  $('#pname').textContent=selected.name; $('#pid').textContent='#'+selected.id; $('#pplan').textContent=p.name;
  $('#ppay').textContent=selected.payment; $('#pvalid').textContent=selected.valid_until||'-'; $('#ppt').textContent=selected.pt||'Sem PT';
  $('#pcred').textContent=[selected.card&&'Cartão',selected.qr&&'QR',selected.face&&'Face'].filter(Boolean).join(' · ')||'Sem credencial';
  const state=selected.access==='blocked'?'Bloqueado':selected.access==='grace'?'Tolerância':'Permitido';
  $('#paccess').innerHTML=`<span class="badge ${selected.access==='blocked'?'bad':selected.access==='grace'?'warn':'ok'}">${state}</span>`;
}
function tryAccess(door){
  if(!selected)return alert('Seleciona primeiro um cliente.');
  const r=GYM.doorAllowed(D,selected,door); GYM.addAccessEvent(D,selected,door,r.ok?'allowed':'denied',r.reason);
  D=GYM.loadData(); renderKPIs(); renderEvents(); const s=$('#laststatus');
  s.className='big-status '+(r.ok?'allow':'deny'); s.textContent=(r.ok?'ACESSO AUTORIZADO — ':'ACESSO RECUSADO — ')+r.reason;
}
function manualPay(){
  if(!selected)return; selected.payment='paid'; selected.access='allowed';
  const n=new Date(); selected.valid_until=GYM.ymd(new Date(n.getFullYear(),n.getMonth()+1,n.getDate()));
  GYM.queueSync(D,selected,'upsert'); GYM.saveData(D); D=GYM.loadData(); selectClient(selected.id); renderKPIs();
  alert('Pagamento marcado como pago e sincronização Hikvision colocada na fila.');
}
function toggleAccess(){
  if(!selected)return; selected.access=selected.access==='blocked'?'allowed':'blocked';
  GYM.queueSync(D,selected,'upsert'); GYM.saveData(D); D=GYM.loadData(); selectClient(selected.id); renderKPIs();
}
function renderEvents(){
  const el=$('#events'); el.innerHTML='';
  D.accessEvents.slice(0,12).forEach(e=>{
    const c=GYM.clientById(D,e.client_id), div=document.createElement('div'); div.className='event';
    div.innerHTML=`<div><strong>${esc(c?.name||e.client_id)}</strong><div class="muted">${esc(e.door)} · ${new Date(e.ts).toLocaleString('pt-PT')}</div><div class="muted">${esc(e.reason)}</div></div><span class="badge ${e.result==='allowed'?'ok':'bad'}">${e.result==='allowed'?'ENTROU':'RECUSADO'}</span>`;
    el.appendChild(div);
  });
}
function renderTerminals(){
  const el=$('#terminals'); el.innerHTML='';
  D.terminals.forEach(t=>{const div=document.createElement('div'); div.className='event';
    div.innerHTML=`<div><strong>${esc(t.name)}</strong><div class="muted">${esc(t.model)} · ${esc(t.ip)}</div><div class="muted">Última sync: ${new Date(t.last_sync).toLocaleString('pt-PT')}</div></div><span class="badge ${t.online?'ok':'bad'}">${t.online?'ONLINE':'OFFLINE'}</span>`; el.appendChild(div)});
}
function syncNow(){
  let count=0; const now=new Date().toISOString();
  D.syncQueue.forEach(x=>{if(x.status==='pending'){x.status='synced';x.synced_at=now;count++}});
  D.terminals.forEach(t=>{if(t.online)t.last_sync=now}); GYM.saveData(D); D=GYM.loadData();
  renderKPIs(); renderTerminals(); alert(`${count} registo(s) simulados como sincronizados com os terminais online.`);
}
function exitOne(){D.gym.inside=Math.max(0,(D.gym.inside||0)-1);GYM.saveData(D);renderKPIs()}
$('#search').addEventListener('input',search); $('#paybtn').onclick=manualPay; $('#togglebtn').onclick=toggleAccess;
$('#mainbtn').onclick=()=>tryAccess('main'); $('#h24btn').onclick=()=>tryAccess('24h'); $('#syncbtn').onclick=syncNow; $('#exitbtn').onclick=exitOne;
renderKPIs();renderEvents();renderTerminals();
