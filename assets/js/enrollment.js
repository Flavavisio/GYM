
let D=GYM.loadData(), step=1, draft={};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function renderPlans(){
  $('#plan').innerHTML=D.plans.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — €${Number(p.price).toFixed(2)}/mês</option>`).join('');
  updatePrice();
}
function updatePrice(){
  const p=GYM.getPlan(D,$('#plan').value), disc=Number($('#discount').value||0);
  const monthly=p.price*(1-disc/100);
  $('#priceSummary').innerHTML=`<div class="metric-row"><span>Mensalidade</span><strong>€${monthly.toFixed(2)}</strong></div><div class="metric-row"><span>Inscrição</span><strong>€${Number(p.enrollment_fee||0).toFixed(2)}</strong></div><div class="metric-row"><span>Fidelização</span><strong>${p.commitment_months||0} meses</strong></div>`;
}
function showStep(n){
  step=n;
  document.querySelectorAll('.form-section').forEach(x=>x.classList.remove('active'));
  document.querySelector(`.form-section[data-step="${n}"]`).classList.add('active');
  document.querySelectorAll('.wizard-step').forEach((x,i)=>{x.classList.toggle('active',i===n-1);x.classList.toggle('done',i<n-1)});
  $('#prev').style.visibility=n===1?'hidden':'visible'; $('#next').textContent=n===5?'Criar inscrição':'Seguinte';
  if(n===5)buildSummary();
}
function collect(){
  draft={
    name:$('#name').value.trim(), email:$('#email').value.trim(), phone:$('#phone').value.trim(), tax_id:$('#tax').value.trim(),
    birth_date:$('#birth').value, emergency_name:$('#emergencyName').value.trim(), emergency_phone:$('#emergencyPhone').value.trim(), medical_notes:$('#medical').value.trim(),
    plan:$('#plan').value, discount_pct:Number($('#discount').value||0), payment_method:$('#paymentMethod').value, billing_day:Number($('#billingDay').value||1),
    card:$('#card').value.trim(), qr:$('#qr').value.trim(), face:$('#face').checked,
    rules_accepted:$('#rules').checked, waiver_accepted:$('#waiver').checked
  };
}
function validateStep(){
  collect();
  if(step===1 && (!draft.name||!draft.email||!draft.phone))return 'Nome, email e telefone são obrigatórios.';
  if(step===2 && !draft.plan)return 'Seleciona um plano.';
  if(step===4 && (!draft.rules_accepted||!draft.waiver_accepted))return 'É necessário aceitar as regras e o termo de responsabilidade.';
  return null;
}
function buildSummary(){
  collect(); const p=GYM.getPlan(D,draft.plan); const monthly=p.price*(1-draft.discount_pct/100);
  $('#finalSummary').innerHTML=`
    <div class="metric-row"><span>Cliente</span><strong>${esc(draft.name)}</strong></div>
    <div class="metric-row"><span>Plano</span><strong>${esc(p.name)}</strong></div>
    <div class="metric-row"><span>Mensalidade</span><strong>€${monthly.toFixed(2)}</strong></div>
    <div class="metric-row"><span>Inscrição</span><strong>€${Number(p.enrollment_fee||0).toFixed(2)}</strong></div>
    <div class="metric-row"><span>Método</span><strong>${esc(draft.payment_method)}</strong></div>
    <div class="metric-row"><span>Credenciais</span><strong>${[draft.card&&'Cartão',draft.qr&&'QR',draft.face&&'Face'].filter(Boolean).join(' · ')||'Nenhuma'}</strong></div>`;
}
function createEnrollment(){
  collect(); const p=GYM.getPlan(D,draft.plan), id=GYM.nextClientId(D), now=new Date();
  const monthly=Number((p.price*(1-draft.discount_pct/100)).toFixed(2));
  const contractId='ctr-'+id, payId='pay-'+Date.now(), ref='GYM-'+GYM.monthKey(now).replace('-','')+'-'+id;
  const client={id,name:draft.name,email:draft.email,phone:draft.phone,tax_id:draft.tax_id,birth_date:draft.birth_date,emergency_name:draft.emergency_name,emergency_phone:draft.emergency_phone,medical_notes:draft.medical_notes,plan:p.id,payment:'pending',access:'grace',valid_until:GYM.ymd(new Date(now.getFullYear(),now.getMonth(),draft.billing_day+5)),card:draft.card||null,qr:draft.qr||('QR-'+id),face:draft.face,pt:null,access_group:p.access_group,joined_at:GYM.ymd(now),status:'active',contract_id:contractId};
  D.clients.push(client);
  D.contracts.push({id:contractId,client_id:id,plan_id:p.id,start_date:GYM.ymd(now),commitment_months:p.commitment_months||0,status:'active',accepted_at:GYM.nowIso(),rules_accepted:true,waiver_accepted:true,discount_pct:draft.discount_pct,payment_method:draft.payment_method,billing_day:draft.billing_day});
  if(Number(p.enrollment_fee||0)>0)D.payments.push({id:'fee-'+Date.now(),client_id:id,kind:'enrollment',reference:'INS-'+id,amount:Number(p.enrollment_fee),due_date:GYM.ymd(now),status:'pending',method:draft.payment_method,paid_at:null});
  D.payments.push({id:payId,client_id:id,kind:'membership',reference:ref,amount:monthly,due_date:GYM.ymd(new Date(now.getFullYear(),now.getMonth(),draft.billing_day)),status:'pending',method:draft.payment_method,paid_at:null});
  D.terminals.filter(t=>t.enabled && GYM.getGroup(D,p.access_group)?.doors.includes(t.door)).forEach(t=>GYM.queueSync(D,client,'upsert',t.id));
  try{
  const pre=JSON.parse(localStorage.getItem('gymcontrol_prefill_lead')||'null');
  if(pre?.lead_id){
    const lead=D.leads?.find(l=>l.id===pre.lead_id);
    if(lead){lead.stage='won';lead.converted_client_id=id;lead.next_action='-';lead.next_date=null}
    localStorage.removeItem('gymcontrol_prefill_lead');
  }
}catch(e){}
  GYM.saveData(D);
  $('#created').classList.remove('hidden');
  $('#created').innerHTML=`<div class="big-status allow">INSCRIÇÃO CRIADA — Cliente #${id}</div><p class="muted">Contrato, primeiro pagamento e sincronização de acessos foram gerados.</p><div class="toolbar"><a class="btn primary" href="reception.html">Abrir Receção</a><a class="btn light" href="reports.html">Ver Relatórios</a></div>`;
  document.querySelector('.wizard-card').classList.add('hidden');
}
$('#plan').addEventListener('change',updatePrice); $('#discount').addEventListener('input',updatePrice);
$('#next').onclick=()=>{const e=validateStep();if(e)return alert(e);if(step<5)showStep(step+1);else createEnrollment()};
$('#prev').onclick=()=>{if(step>1)showStep(step-1)};

renderPlans();
try{
  const pre=JSON.parse(localStorage.getItem('gymcontrol_prefill_lead')||'null');
  if(pre){
    $('#name').value=pre.name||'';$('#email').value=pre.email||'';$('#phone').value=pre.phone||'';
    if(pre.interest){
      const p=D.plans.find(x=>pre.interest.toLowerCase().includes(x.name.toLowerCase()));
      if(p)$('#plan').value=p.id;
    }
    updatePrice();
  }
}catch(e){}
showStep(1);

