/* 登入紀錄在最終權限與資料確認後寫入，首頁登入及恢復登入狀態共用此流程。 */
(()=>{
  'use strict';
  const VERSION='10.52';
  const WRITE_TIMEOUT=4000;
  let entry=null;

  function clearLegacyMarker(uid){
    if(!uid)return;
    try{sessionStorage.removeItem('surveyLoginLogged:'+uid)}catch(error){console.warn('清除舊登入紀錄標記失敗',error)}
  }
  function begin(user){
    if(!user){clearLegacyMarker(entry?.user.uid);entry=null;return}
    clearLegacyMarker(user.uid);
    if(entry?.user.uid===user.uid)return;
    entry={user:{uid:user.uid,email:String(user.email||'').trim().toLowerCase(),displayName:user.displayName||''},events:new Map()};
  }
  function role(){
    if(isSystemAdmin||window.AdminViewRole?.isActualSystemAdmin())return '系統管理員';
    if(!isAdmin)return '未取得後台權限';
    return currentAccessRole==='manager'?'活動管理者':currentAccessRole==='member'?'後台帳號':'結果檢視者';
  }
  async function boundedWrite(event){
    let timer;
    try{
      await Promise.race([event.ref.set(event.data),new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(Object.assign(new Error('登入紀錄寫入等待逾時'),{code:'deadline-exceeded'})),WRITE_TIMEOUT);
      })]);
      return true;
    }finally{clearTimeout(timer)}
  }
  async function commit(event){
    for(let attempt=0;attempt<3;attempt++){
      try{await boundedWrite(event);event.saved=true;return true}
      catch(error){
        const code=String(error?.code||'').replace(/^firestore\//,'');
        if(attempt===2||!['unavailable','deadline-exceeded','aborted','internal','unknown'].includes(code)){
          console.warn('登入紀錄寫入失敗',error);return false;
        }
      }
    }
    return false;
  }
  async function record(result,reason=''){
    if(!entry||!db||!currentUser||currentUser.uid!==entry.user.uid)return false;
    let event=entry.events.get(result);
    if(!event){
      const user=entry.user;
      let displayName=user.displayName;
      if(typeof findMemberByGoogleEmail==='function'&&typeof memberDisplayName==='function'){
        try{displayName=memberDisplayName(findMemberByGoogleEmail(user.email))||displayName}catch{}
      }
      event={saved:false,pending:null,ref:col('surveyLoginLogs').doc(),data:{
        ...user,displayName,result,reason,role:role(),createdAt:firebase.firestore.FieldValue.serverTimestamp()
      }};
      entry.events.set(result,event);
    }
    if(event.saved)return true;
    if(!event.pending)event.pending=commit(event).finally(()=>{event.pending=null});
    return event.pending;
  }
  const logoutBeforeAudit=logout;
  logout=async function(){
    if(currentUser)begin(currentUser);
    try{await record('logout','使用者登出')}
    finally{clearLegacyMarker(entry?.user.uid);begin(null)}
    return logoutBeforeAudit();
  };
  window.logout=logout;
  window.addEventListener('online',()=>{
    if(entry)for(const event of entry.events.values())if(!event.saved)void record(event.data.result,event.data.reason);
  });
  window.AdminLoginAudit=Object.freeze({version:VERSION,begin,record});
})();
