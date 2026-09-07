
(function(){
  window.GYM_SESSION = {
    get(){
      try{return JSON.parse(localStorage.getItem('gymcontrol_session')||'null')}catch(e){return null}
    },
    logout(){
      localStorage.removeItem('gymcontrol_session');
      window.location.href='index.html';
    }
  };
})();
