
let D=GYM.loadData();
const $=s=>document.querySelector(s);
function money(v){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0))}
function client(id){return D.clients.find(c=>c.id===id)}
function render(){
  const active=D.clients.filter(c=>c.status==='active');
  const paid=D.payments.filter(p=>p.status==='paid');
  const pending=D.payments.filter(p=>p.status==='pending');
  const overdue=D.payments.filter(p=>p.status==='overdue');
  const revenue=paid.reduce((a,p)=>a+Number(p.amount||0),0);
  const receivable=[...pending,...overdue].reduce((a,p)=>a+Number(p.amount||0),0);
  const newThisMonth=D.clients.filter(c=>c.joined_at?.startsWith(GYM.monthKey(new Date()))).length;
  $('#kActive').textContent=active.length; $('#kRevenue').textContent=money(revenue); $('#kReceivable').textContent=money(receivable);
  $('#kOverdue').textContent=overdue.length; $('#kNew').textContent=newThisMonth; $('#kInside').textContent=D.gym.inside||0;

  const planCounts={}; D.plans.forEach(p=>planCounts[p.id]=0); active.forEach(c=>planCounts[c.plan]=(planCounts[c.plan]||0)+1);
  const max=Math.max(1,...Object.values(planCounts));
  $('#planBars').innerHTML=D.plans.map(p=>`<div class="bar-col"><div class="bar" style="height:${Math.round((planCounts[p.id]/max)*140)+6}px"></div><div class="bar-label">${p.name}<br><strong>${planCounts[p.id]}</strong></div></div>`).join('');

  const access24=D.accessEvents.filter(e=>Date.now()-new Date(e.ts)<86400000);
  const denied=access24.filter(e=>e.result==='denied').length;
  $('#accessStats').innerHTML=`
    <div class="metric-row"><span>Entradas últimas 24h</span><strong>${access24.filter(e=>e.result==='allowed').length}</strong></div>
    <div class="metric-row"><span>Recusados últimas 24h</span><strong>${denied}</strong></div>
    <div class="metric-row"><span>Taxa de recusa</span><strong>${access24.length?Math.round(denied/access24.length*100):0}%</strong></div>
    <div class="metric-row"><span>Terminais online</span><strong>${D.terminals.filter(t=>t.online&&t.enabled).length}/${D.terminals.length}</strong></div>`;

  $('#financeRows').innerHTML=D.payments.slice().sort((a,b)=>String(b.due_date).localeCompare(String(a.due_date))).slice(0,12).map(p=>`<tr><td>${p.reference}</td><td>${client(p.client_id)?.name||p.client_id}</td><td>${p.kind}</td><td>${money(p.amount)}</td><td>${p.due_date}</td><td><span class="badge ${p.status==='paid'?'ok':p.status==='overdue'?'bad':'warn'}">${p.status}</span></td></tr>`).join('');
}
render();
