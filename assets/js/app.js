
const TODAY = new Date();
const ymd = d => d.toISOString().slice(0,10);
const nowIso = () => new Date().toISOString();
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const DEFAULT = {
  gym:{id:'gym-001',name:'GYM Control Demo',capacity:120,inside:34,open:'06:00',close:'23:00'},
  plans:[
    {id:'basic',name:'Basic',price:24.9,enrollment_fee:15,commitment_months:0,access_group:'grp-main'},
    {id:'standard',name:'Standard',price:34.9,enrollment_fee:15,commitment_months:3,access_group:'grp-main'},
    {id:'premium',name:'Premium',price:44.9,enrollment_fee:0,commitment_months:6,access_group:'grp-main'},
    {id:'24h',name:'24H',price:54.9,enrollment_fee:0,commitment_months:6,access_group:'grp-24h'}
  ],
  clients:[
    {id:'1001',name:'João Silva',phone:'912000001',email:'joao@email.pt',tax_id:'245123456',birth_date:'1992-04-12',emergency_name:'Ana Silva',emergency_phone:'919111111',medical_notes:'',plan:'24h',payment:'paid',access:'allowed',valid_until:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()+1,5)),card:'CARD-1001',qr:'QR-1001',face:true,pt:'Miguel Costa',access_group:'grp-24h',joined_at:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-5,3)),status:'active',contract_id:'ctr-1001'},
    {id:'1002',name:'Maria Costa',phone:'912000002',email:'maria@email.pt',tax_id:'267123456',birth_date:'1998-10-25',emergency_name:'Paulo Costa',emergency_phone:'918222222',medical_notes:'Asma ligeira',plan:'standard',payment:'pending',access:'grace',valid_until:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),2)),card:'CARD-1002',qr:'QR-1002',face:true,pt:'Ana Martins',access_group:'grp-main',joined_at:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-2,12)),status:'active',contract_id:'ctr-1002'},
    {id:'1003',name:'Rui Lopes',phone:'912000003',email:'rui@email.pt',tax_id:'212123456',birth_date:'1986-02-10',emergency_name:'Marta Lopes',emergency_phone:'917333333',medical_notes:'',plan:'basic',payment:'overdue',access:'blocked',valid_until:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-1,25)),card:'CARD-1003',qr:'QR-1003',face:false,pt:null,access_group:'grp-main',joined_at:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-9,20)),status:'active',contract_id:'ctr-1003'}
  ],
  contracts:[
    {id:'ctr-1001',client_id:'1001',plan_id:'24h',start_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-5,3)),commitment_months:6,status:'active',accepted_at:new Date(TODAY.getFullYear(),TODAY.getMonth()-5,3,10,0).toISOString(),rules_accepted:true,waiver_accepted:true,discount_pct:0,payment_method:'sepa'},
    {id:'ctr-1002',client_id:'1002',plan_id:'standard',start_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-2,12)),commitment_months:3,status:'active',accepted_at:new Date(TODAY.getFullYear(),TODAY.getMonth()-2,12,18,0).toISOString(),rules_accepted:true,waiver_accepted:true,discount_pct:10,payment_method:'card'},
    {id:'ctr-1003',client_id:'1003',plan_id:'basic',start_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-9,20)),commitment_months:0,status:'active',accepted_at:new Date(TODAY.getFullYear(),TODAY.getMonth()-9,20,16,0).toISOString(),rules_accepted:true,waiver_accepted:true,discount_pct:0,payment_method:'cash'}
  ],
  payments:[
    {id:'pay-1',client_id:'1001',kind:'membership',reference:'GYM-'+monthKey(TODAY).replace('-','')+'-1001',amount:54.9,due_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),5)),status:'paid',method:'sepa',paid_at:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),5))},
    {id:'pay-2',client_id:'1002',kind:'membership',reference:'GYM-'+monthKey(TODAY).replace('-','')+'-1002',amount:31.41,due_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),2)),status:'pending',method:'card',paid_at:null},
    {id:'pay-3',client_id:'1003',kind:'membership',reference:'GYM-'+monthKey(TODAY).replace('-','')+'-1003',amount:24.9,due_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),1)),status:'overdue',method:'cash',paid_at:null}
  ],
  terminals:[
    {id:'hk-main',name:'Entrada Principal',door:'main',ip:'192.168.1.201',port:80,protocol:'http',model:'DS-K1T341',serial:'MAIN-DEMO-001',online:true,last_sync:nowIso(),enabled:true},
    {id:'hk-staff',name:'Porta Staff',door:'staff',ip:'192.168.1.202',port:80,protocol:'http',model:'DS-K1T341',serial:'STAFF-DEMO-001',online:true,last_sync:nowIso(),enabled:true},
    {id:'hk-24h',name:'Zona 24H',door:'24h',ip:'192.168.1.203',port:80,protocol:'http',model:'DS-K1T341',serial:'24H-DEMO-001',online:false,last_sync:new Date(Date.now()-35*60000).toISOString(),enabled:true}
  ],
  schedules:[
    {id:'sch-main',name:'Horário Ginásio',days:[1,2,3,4,5,6,0],start:'06:00',end:'23:00'},
    {id:'sch-24h',name:'24 Horas',days:[1,2,3,4,5,6,0],start:'00:00',end:'23:59'},
    {id:'sch-staff',name:'Staff',days:[1,2,3,4,5,6],start:'05:30',end:'23:30'}
  ],
  accessGroups:[
    {id:'grp-main',name:'Clientes Standard',schedule_id:'sch-main',doors:['main']},
    {id:'grp-24h',name:'Clientes 24H',schedule_id:'sch-24h',doors:['main','24h']},
    {id:'grp-staff',name:'Funcionários',schedule_id:'sch-staff',doors:['main','staff','24h']}
  ],
  accessEvents:[
    {id:1,client_id:'1001',door:'main',result:'allowed',reason:'Mensalidade em dia',ts:new Date(Date.now()-10*60000).toISOString()},
    {id:2,client_id:'1003',door:'main',result:'denied',reason:'Mensalidade em atraso',ts:new Date(Date.now()-6*60000).toISOString()}
  ],
  syncQueue:[],
  commandLog:[
    {id:'cmd-1',terminal_id:'hk-main',client_id:'1001',operation:'UPSERT_PERSON',status:'success',message:'Credencial sincronizada',created_at:new Date(Date.now()-50*60000).toISOString(),finished_at:new Date(Date.now()-49*60000).toISOString()}
  ],
  leadSources:['Facebook','Instagram','Google','Passa-palavra','Walk-in','Website','Outro'],
  salesPeople:['Sofia Mendes','Pedro Rocha','Receção'],
  leads:[
    {id:'lead-100',name:'Carla Ferreira',phone:'913100100',email:'carla@example.pt',source:'Instagram',owner:'Sofia Mendes',stage:'new',interest:'Plano Premium',value:44.9,next_action:'Ligar',next_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+1)),notes:'Quer experimentar aula de cycling.',created_at:new Date(Date.now()-2*86400000).toISOString()},
    {id:'lead-101',name:'Miguel Santos',phone:'913100101',email:'miguel@example.pt',source:'Google',owner:'Pedro Rocha',stage:'contacted',interest:'Plano 24H',value:54.9,next_action:'Enviar horários',next_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+2)),notes:'Trabalha por turnos.',created_at:new Date(Date.now()-4*86400000).toISOString()},
    {id:'lead-102',name:'Inês Almeida',phone:'913100102',email:'ines@example.pt',source:'Passa-palavra',owner:'Sofia Mendes',stage:'trial',interest:'Plano Standard',value:34.9,next_action:'Aula experimental Pilates',next_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+1)),notes:'Veio recomendada por cliente.',created_at:new Date(Date.now()-5*86400000).toISOString()},
    {id:'lead-103',name:'Bruno Vieira',phone:'913100103',email:'bruno@example.pt',source:'Website',owner:'Receção',stage:'proposal',interest:'Plano Premium',value:44.9,next_action:'Follow-up proposta',next_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+3)),notes:'Perguntou por desconto casal.',created_at:new Date(Date.now()-7*86400000).toISOString()},
    {id:'lead-104',name:'Rita Matos',phone:'913100104',email:'rita@example.pt',source:'Facebook',owner:'Pedro Rocha',stage:'won',interest:'Plano Standard',value:34.9,next_action:'-',next_date:null,notes:'Convertida esta semana.',created_at:new Date(Date.now()-12*86400000).toISOString(),converted_client_id:'1002'},
    {id:'lead-105',name:'Tiago Marques',phone:'913100105',email:'tiago@example.pt',source:'Walk-in',owner:'Receção',stage:'lost',interest:'Plano Basic',value:24.9,next_action:'-',next_date:null,notes:'Preço.',lost_reason:'Preço',created_at:new Date(Date.now()-9*86400000).toISOString()}
  ],
  crmTasks:[
    {id:'task-1',lead_id:'lead-100',title:'Ligar à Carla',due_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+1)),status:'open',owner:'Sofia Mendes'},
    {id:'task-2',lead_id:'lead-103',title:'Follow-up proposta Bruno',due_date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+3)),status:'open',owner:'Receção'}
  ],
  freezes:[
    {id:'frz-1',client_id:'1002',from:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()+1,10)),to:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()+1,20)),reason:'Viagem',status:'scheduled'}
  ],
  clientDocuments:[
    {id:'doc-1',client_id:'1001',name:'Contrato de adesão',type:'contract',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-5,3)),status:'signed'},
    {id:'doc-2',client_id:'1001',name:'Termo de responsabilidade',type:'waiver',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-5,3)),status:'signed'},
    {id:'doc-3',client_id:'1002',name:'Contrato de adesão',type:'contract',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-2,12)),status:'signed'}
  ],
  classBookings:[
    {id:'bk-1',client_id:'1001',class_name:'Cycling',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+1)),time:'18:30',status:'booked'},
    {id:'bk-2',client_id:'1002',class_name:'Pilates',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+2)),time:'19:00',status:'booked'}
  ],
  ptSessions:[
    {id:'pts-1',client_id:'1001',trainer:'Miguel Costa',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()+2)),time:'07:30',status:'scheduled'},
    {id:'pts-2',client_id:'1002',trainer:'Ana Martins',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()-2)),time:'18:00',status:'done'}
  ],
  measurements:[
    {id:'m-1',client_id:'1001',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth()-1,8)),weight:82.4,fat:18.2,muscle:36.1,waist:88},
    {id:'m-2',client_id:'1001',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),8)),weight:81.7,fat:17.5,muscle:36.5,waist:86},
    {id:'m-3',client_id:'1002',date:ymd(new Date(TODAY.getFullYear(),TODAY.getMonth(),3)),weight:64.2,fat:24.3,muscle:27.8,waist:72}
  ],
  clientNotes:[
    {id:'note-1',client_id:'1001',date:new Date(Date.now()-3*86400000).toISOString(),author:'Receção',text:'Cliente pediu informação sobre upgrade para pack PT.'}
  ]
};
function loadData(){
  let data={};
  try{data=JSON.parse(localStorage.getItem('gymcontrol_data')||'{}')}catch(e){}
  const merged=structuredClone(DEFAULT); Object.assign(merged,data);
  for(const k of ['plans','clients','contracts','payments','terminals','schedules','accessGroups','accessEvents','syncQueue','commandLog','leadSources','salesPeople','leads','crmTasks','freezes','clientDocuments','classBookings','ptSessions','measurements','clientNotes']){
    if(!Array.isArray(merged[k])) merged[k]=structuredClone(DEFAULT[k]);
  }
  if(!merged.gym) merged.gym=structuredClone(DEFAULT.gym);
  merged.plans.forEach(p=>{if(p.enrollment_fee==null)p.enrollment_fee=0;if(p.commitment_months==null)p.commitment_months=0;if(!p.access_group)p.access_group=p.id==='24h'?'grp-24h':'grp-main'});
  merged.clients.forEach(c=>{
    if(!c.access_group){const p=merged.plans.find(p=>p.id===c.plan);c.access_group=(p&&p.access_group)||'grp-main'}
    if(!c.status)c.status='active'; if(!c.joined_at)c.joined_at=ymd(new Date());
    if(c.face==null)c.face=false; if(!('medical_notes' in c))c.medical_notes='';
  });
  merged.terminals.forEach(t=>{if(t.port==null)t.port=80;if(!t.protocol)t.protocol='http';if(t.enabled==null)t.enabled=true;if(!t.serial)t.serial='DEMO-'+t.id});
  localStorage.setItem('gymcontrol_data',JSON.stringify(merged)); return merged;
}
function saveData(d){localStorage.setItem('gymcontrol_data',JSON.stringify(d))}
function getPlan(d,id){return d.plans.find(p=>p.id===id)||d.plans[0]}
function clientById(d,id){return d.clients.find(c=>c.id===String(id))}
function getGroup(d,id){return d.accessGroups.find(g=>g.id===id)}
function getSchedule(d,id){return d.schedules.find(s=>s.id===id)}
function isWithinSchedule(s){if(!s)return false;const n=new Date(),day=n.getDay(),hh=n.toTimeString().slice(0,5);return s.days.includes(day)&&hh>=s.start&&hh<=s.end}
function doorAllowed(d,c,door){
  if(c.status!=='active')return {ok:false,reason:'Cliente inativo'};
  if(c.access==='blocked'||c.payment==='overdue')return {ok:false,reason:'Mensalidade em atraso / acesso bloqueado'};
  const group=getGroup(d,c.access_group||getPlan(d,c.plan).access_group);
  if(!group)return {ok:false,reason:'Sem grupo de acesso configurado'};
  if(!group.doors.includes(door))return {ok:false,reason:'Grupo sem permissão para esta porta'};
  const sch=getSchedule(d,group.schedule_id); if(!isWithinSchedule(sch))return {ok:false,reason:'Fora do horário permitido'};
  return {ok:true,reason:c.payment==='pending'?'Dentro do período de tolerância':'Acesso autorizado'};
}
function addAccessEvent(d,c,door,result,reason){d.accessEvents.unshift({id:Date.now(),client_id:c.id,door,result,reason,ts:nowIso()});d.accessEvents=d.accessEvents.slice(0,100);if(result==='allowed')d.gym.inside=Math.min(d.gym.capacity,(d.gym.inside||0)+1);saveData(d)}
function queueSync(d,c,op='upsert',terminal_id=null){const cred={id:'q-'+Date.now()+'-'+Math.random().toString(16).slice(2),client_id:c.id,name:c.name,card:c.card||null,qr:c.qr||null,face:!!c.face,access:c.access,plan:c.plan,access_group:c.access_group,terminal_id,op,created_at:nowIso(),status:'pending',attempts:0,last_error:null};d.syncQueue.push(cred);saveData(d);return cred}
function logCommand(d,{terminal_id,client_id=null,operation,status,message}){d.commandLog.unshift({id:'cmd-'+Date.now()+'-'+Math.random().toString(16).slice(2),terminal_id,client_id,operation,status,message,created_at:nowIso(),finished_at:status==='pending'?null:nowIso()});d.commandLog=d.commandLog.slice(0,300);saveData(d)}
function nextClientId(d){const nums=d.clients.map(c=>Number(c.id)).filter(Number.isFinite);return String((nums.length?Math.max(...nums):1000)+1)}
window.GYM={loadData,saveData,getPlan,clientById,getGroup,getSchedule,doorAllowed,addAccessEvent,queueSync,logCommand,nextClientId,ymd,nowIso,monthKey};
