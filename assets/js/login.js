
const $=s=>document.querySelector(s);
const DEMO_USERS = {
  superadmin:{email:'superadmin@gymcontrol.local',password:'demo',target:'super-admin.html',label:'Super Admin'},
  admin:{email:'admin@gymcontrol.local',password:'demo',target:'admin.html',label:'Admin do Ginásio'},
  reception:{email:'rececao@gymcontrol.local',password:'demo',target:'reception.html',label:'Receção'},
  client:{email:'cliente@gymcontrol.local',password:'demo',target:'client-portal.html',label:'Cliente'}
};

function saveSession(role){
  const u=DEMO_USERS[role];
  localStorage.setItem('gymcontrol_session',JSON.stringify({
    role,
    email:u.email,
    label:u.label,
    logged_at:new Date().toISOString(),
    demo:true
  }));
}
function go(role){
  const u=DEMO_USERS[role];
  if(!u)return;
  saveSession(role);
  window.location.href=u.target;
}
document.querySelectorAll('[data-demo-role]').forEach(btn=>{
  btn.onclick=()=>go(btn.dataset.demoRole);
});

$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const email=$('#email').value.trim().toLowerCase();
  const password=$('#password').value;
  const role=Object.keys(DEMO_USERS).find(k=>DEMO_USERS[k].email===email && DEMO_USERS[k].password===password);
  if(!role){
    $('#loginError').classList.remove('hidden');
    return;
  }
  $('#loginError').classList.add('hidden');
  go(role);
});

// Handy prefill
$('#email').value='admin@gymcontrol.local';
$('#password').value='demo';
