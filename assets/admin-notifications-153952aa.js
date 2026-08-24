/* 相容層：填寫通知與通知定位。 */

/* ===== fill notification history ===== */
(() => {
  const WINDOW_DAYS_V913=30;
  const SYSTEM_NOTIFICATION_LIMIT_V931=200;
  let rowsV913=[];
  let lastViewedMsV913=0;
  let stateLoadedForUidV913='';
  let subscriptionSignatureV913='';
  let responseUnsubscribersV913=[];
  let responseSnapshotsV913=new Map();
  let refreshTimerV913=null;
  let focusedNotificationResponseV913=null;

  function currentUidV913(){return String(currentUser?.uid||'')}
  function currentEmailV913(){return normalizeEmail(currentUser?.email||'')}
  function surveyCreatorEmailV913(s){return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'')}
  function isNotificationRecipientV913(s){
    if(!s)return false;
    if(isSystemAdmin)return true;
    const email=currentEmailV913();
    if((email&&surveyCreatorEmailV913(s)===email)||(currentUser?.uid&&String(s.createdByUid||'')===String(currentUser.uid)))return true;
    return surveyAssignments.some(a=>String(a.surveyId)===String(s.id)&&a.enabled!==false&&a.role==='manager'&&normalizeEmail(a.email||'')===email);
  }
  function notificationSurveysV913(){return (D.surveys||[]).filter(isNotificationRecipientV913)}
  function notificationTimeV913(r){return typeof responseTimeValue==='function'?responseTimeValue(r):(r?.submittedAt?.toMillis?.()||Date.parse(r?.submittedAtText||'')||0)}
  function notificationRowsV913(){
    const allowed=new Map(notificationSurveysV913().map(s=>[String(s.id),s]));
    const cutoff=Date.now()-WINDOW_DAYS_V913*86400000;
    const unique=new Map();
    responseSnapshotsV913.forEach(items=>(items||[]).forEach(r=>{if(r?.id)unique.set(String(r.id),r)}));
    return [...unique.values()].filter(r=>allowed.has(String(r.surveyId))&&notificationTimeV913(r)>=cutoff).map(r=>({response:r,survey:allowed.get(String(r.surveyId)),time:notificationTimeV913(r)})).sort((a,b)=>b.time-a.time);
  }
  function updateNotificationBadgeV913(){
    const badge=document.getElementById('notificationBadgeV913');if(!badge)return;
    const unread=rowsV913.filter(x=>x.time>lastViewedMsV913).length;
    badge.textContent=unread>99?'99+':String(unread);badge.hidden=!unread;
    document.getElementById('notificationBellV913')?.setAttribute('aria-label',unread?`通知紀錄，${unread} 筆未讀`:'通知紀錄，沒有未讀');
  }
  function renderNotificationListV913(readBoundary=lastViewedMsV913){
    const list=document.getElementById('notificationListV913');if(!list)return;
    if(!rowsV913.length){list.innerHTML='<div class="notificationEmptyV913"><b>目前沒有通知</b><span>最近 30 天尚無新的問卷填寫紀錄。</span></div>';return}
    list.innerHTML=rowsV913.map(item=>{
      const r=item.response,s=item.survey,unread=item.time>readBoundary;
      const actor=[r.departmentName,r.memberName].filter(Boolean).join(' ')||'同仁';
      return `<button class="notificationItemV913${unread?' unread':''}" type="button" onclick="openNotificationResponseV913('${escAttr(r.surveyId)}','${escAttr(r.id)}')"><strong>${esc(s.title||'未命名活動')}</strong><span>${esc(actor)}送出了問卷</span><time>${esc(formatDateTimeV784(r.submittedAt||r.submittedAtText)||'時間未紀錄')}</time></button>`;
    }).join('');
  }
  async function loadNotificationStateV913(){
    const uid=currentUidV913();if(!uid||stateLoadedForUidV913===uid)return;
    stateLoadedForUidV913=uid;lastViewedMsV913=0;
    try{const snap=await doc('adminNotificationStates',uid).get();if(snap.exists){const value=snap.data()?.lastViewedAt;lastViewedMsV913=value?.toMillis?.()||Number(value||0)||0}}
    catch(e){console.warn('notification read state unavailable',e)}
  }
  function clearNotificationSubscriptionsV913(){responseUnsubscribersV913.splice(0).forEach(fn=>{try{fn()}catch(e){}});responseSnapshotsV913.clear();subscriptionSignatureV913=''}
  function acceptNotificationSnapshotV913(key,snapshot){responseSnapshotsV913.set(key,snapshot.docs.map(d=>({id:d.id,...d.data()})));rowsV913=notificationRowsV913();renderNotificationListV913();updateNotificationBadgeV913()}
  function subscribeNotificationsV913(){
    if(!currentUidV913()||!isAdmin)return;
    const surveys=notificationSurveysV913();
    const signature=(isSystemAdmin?'system:30days:200':'member:')+surveys.map(s=>s.id).sort().join('|');
    if(signature===subscriptionSignatureV913)return;
    clearNotificationSubscriptionsV913();subscriptionSignatureV913=signature;
    let warned=false;
    const listen=(key,query)=>{const unsub=query.onSnapshot(snap=>acceptNotificationSnapshotV913(key,snap),e=>{console.warn('notification listener unavailable',key,e);if(!warned){warned=true;toast('部分通知暫時無法載入，請確認 Firestore 規則已部署')}});responseUnsubscribersV913.push(unsub)};
    if(isSystemAdmin){
      const cutoff=new Date(Date.now()-WINDOW_DAYS_V913*86400000);
      listen('system-recent',col('responses').where('submittedAt','>=',firebase.firestore.Timestamp.fromDate(cutoff)).orderBy('submittedAt','desc').limit(SYSTEM_NOTIFICATION_LIMIT_V931));
    }else{
 // 活動管理者仍依授權活動個別監聽，確保 Firestore 規則不會因跨活動查詢而拒絕。
      surveys.forEach(s=>listen(String(s.id),col('responses').where('surveyId','==',s.id)));
    }
    if(!surveys.length){rowsV913=[];renderNotificationListV913();updateNotificationBadgeV913()}
  }
  function ensureNotificationCenterV913(){
    const userArea=document.querySelector('.topUserArea');if(!userArea||document.getElementById('notificationBellV913'))return;
    const bell=document.createElement('button');bell.id='notificationBellV913';bell.className='notificationBellV913';bell.type='button';bell.setAttribute('aria-expanded','false');bell.setAttribute('aria-controls','notificationPanelV913');bell.setAttribute('aria-label','通知紀錄，沒有未讀');bell.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg><span id="notificationBadgeV913" class="notificationBadgeV913" hidden>0</span>';bell.onclick=event=>{event.stopPropagation();toggleNotificationCenterV913()};
    const icon=userArea.querySelector('.topUserIcon');userArea.insertBefore(bell,icon||userArea.firstChild);
    const chatButton=document.getElementById('chatButtonV915');
    if(chatButton)userArea.insertBefore(chatButton,bell);
    const panelElement=document.createElement('aside');panelElement.id='notificationPanelV913';panelElement.className='notificationPanelV913';panelElement.hidden=true;panelElement.setAttribute('aria-label','通知紀錄');panelElement.innerHTML='<div class="notificationHeadV913"><div><h2>通知紀錄</h2><p>最近 30 天的問卷送出紀錄</p></div><button class="notificationCloseV913" type="button" onclick="closeNotificationCenterV913()" aria-label="關閉">×</button></div><div id="notificationListV913" class="notificationListV913"></div>';
    document.body.appendChild(panelElement);renderNotificationListV913();updateNotificationBadgeV913();
  }
  function notificationResponseElementsV913(responseId){
    const selector=typeof CSS!=='undefined'&&CSS.escape?CSS.escape(String(responseId)):String(responseId).replace(/["\\]/g,'\\$&');
    return {
      row:document.querySelector(`.responseRow[data-response-id="${selector}"]`),
      detail:document.querySelector(`.responseDetailRow[data-detail-for="${selector}"]`)
    };
  }
  function clearNotificationResponseFocusV913(){
    const current=focusedNotificationResponseV913;
    focusedNotificationResponseV913=null;
    window.__notificationFocusV922=null;
    document.querySelectorAll('.responseRow.notificationFocusV913').forEach(row=>row.classList.remove('notificationFocusV913','notificationFocusEnterV914'));
    if(!current)return;
    const {row,detail}=notificationResponseElementsV913(current.responseId);
    if(detail)detail.hidden=true;
    row?.querySelector('.responseExpandButton')?.setAttribute('aria-expanded','false');
    row?.querySelector('.responseExpandButton')?.classList.remove('open');
  }
  function applyNotificationResponseFocusV913({scroll=false,animate=false}={}){
    const current=focusedNotificationResponseV913;
    if(!current||String(activeSurveyId||'')!==String(current.surveyId||''))return false;
    const {row,detail}=notificationResponseElementsV913(current.responseId);
    if(!row)return false;
    document.querySelectorAll('.responseRow.notificationFocusV913').forEach(item=>{if(item!==row)item.classList.remove('notificationFocusV913','notificationFocusEnterV914')});
    row.hidden=false;
    row.classList.add('notificationFocusV913');
    if(detail)detail.hidden=false;
    row.querySelector('.responseExpandButton')?.setAttribute('aria-expanded','true');
    row.querySelector('.responseExpandButton')?.classList.add('open');
    if(animate){row.classList.remove('notificationFocusEnterV914');void row.offsetWidth;row.classList.add('notificationFocusEnterV914')}
    if(scroll)row.scrollIntoView({behavior:'smooth',block:'center'});
    return true;
  }
  async function markNotificationsReadV913(){
    const uid=currentUidV913();if(!uid)return;
    lastViewedMsV913=Date.now();updateNotificationBadgeV913();
    try{await doc('adminNotificationStates',uid).set({lastViewedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
    catch(e){console.warn('notification read state save failed',e);toast('通知已開啟，但閱讀狀態暫時無法同步')}
  }
  window.toggleNotificationCenterV913=function(){
    ensureNotificationCenterV913();const panelElement=document.getElementById('notificationPanelV913'),bell=document.getElementById('notificationBellV913');if(!panelElement)return;
    if(!panelElement.hidden){closeNotificationCenterV913();return}
    const readBoundary=lastViewedMsV913;renderNotificationListV913(readBoundary);panelElement.hidden=false;bell?.setAttribute('aria-expanded','true');markNotificationsReadV913();
  };
  window.closeNotificationCenterV913=function(){const panelElement=document.getElementById('notificationPanelV913');if(panelElement)panelElement.hidden=true;document.getElementById('notificationBellV913')?.setAttribute('aria-expanded','false')};
  window.openNotificationResponseV913=async function(surveyId,responseId){
    closeNotificationCenterV913();
    if(String(activeSurveyId||'')!==String(surveyId||''))await setActiveSurvey(surveyId);
    if(String(activeSurveyId||'')!==String(surveyId||'')){toast('已保留目前未儲存內容，尚未切換活動');return}
    clearNotificationResponseFocusV913();
    focusedNotificationResponseV913={surveyId:String(surveyId||''),responseId:String(responseId||'')};
    window.__notificationFocusV922={...focusedNotificationResponseV913};
    const nav=[...document.querySelectorAll('.nav')].find(x=>x.textContent.trim()==='投票結果');panel('respP',nav);
    setTimeout(()=>{
      if(!applyNotificationResponseFocusV913({scroll:true,animate:true})){focusedNotificationResponseV913=null;window.__notificationFocusV922=null;toast('這筆填寫資料目前無法顯示，可能已被刪除')}
    },150);
  };
  async function initializeNotificationsV913(){if(!currentUidV913()||!isAdmin)return;ensureNotificationCenterV913();await loadNotificationStateV913();subscribeNotificationsV913();updateNotificationBadgeV913()}
  document.addEventListener('click',event=>{
    if(!event.target.closest('#notificationPanelV913,#notificationBellV913'))closeNotificationCenterV913();
    const row=event.target.closest('.responseRow');
    if(row&&focusedNotificationResponseV913&&String(row.dataset.responseId)!==String(focusedNotificationResponseV913.responseId))clearNotificationResponseFocusV913();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('notificationPanelV913')?.hidden)closeNotificationCenterV913()});
  const renderAdminBeforeV913=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeV913();clearTimeout(refreshTimerV913);refreshTimerV913=setTimeout(()=>{initializeNotificationsV913();applyNotificationResponseFocusV913()},0);return result};
  window.renderAdmin=renderAdmin;
  const panelBeforeV914=panel;
  panel=function(id,b){if(id!=='respP')clearNotificationResponseFocusV913();return panelBeforeV914(id,b)};
  window.panel=panel;
  const setActiveSurveyBeforeV914=setActiveSurvey;
  setActiveSurvey=async function(id){
    const previousFocus=focusedNotificationResponseV913?{...focusedNotificationResponseV913}:null;
    const previousSurveyId=String(activeSurveyId||'');
    if(id&&String(id)!==previousSurveyId)clearNotificationResponseFocusV913();
    const result=await setActiveSurveyBeforeV914(id);
    if(previousFocus&&String(activeSurveyId||'')===previousSurveyId&&String(id||'')!==previousSurveyId){focusedNotificationResponseV913=previousFocus;window.__notificationFocusV922={...previousFocus};setTimeout(()=>applyNotificationResponseFocusV913(),0)}
    return result;
  };
  window.setActiveSurvey=setActiveSurvey;
  const logoutBeforeV913=logout;
  logout=async function(){clearNotificationSubscriptionsV913();stateLoadedForUidV913='';rowsV913=[];return logoutBeforeV913()};
  window.logout=logout;
})();

/* ===== notification focus, chat members and header grouping ===== */
(() => {
  function arrangeRealtimeToolsV922(){
    const userArea=document.querySelector('.topUserArea');if(!userArea)return;
    let group=userArea.querySelector('.topRealtimeToolsV922');
    if(!group){group=document.createElement('div');group.className='topRealtimeToolsV922';const icon=userArea.querySelector('.topUserIcon');userArea.insertBefore(group,icon||userArea.firstChild)}
    const chat=document.getElementById('chatButtonV915'),notification=document.getElementById('notificationBellV913');
    if(chat)group.appendChild(chat);
    if(notification)group.appendChild(notification);
  }
  const renderAdminBeforeV922=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeV922();[0,60,180].forEach(delay=>setTimeout(arrangeRealtimeToolsV922,delay));return result};
  window.renderAdmin=renderAdmin;
  window.arrangeRealtimeToolsV922=arrangeRealtimeToolsV922;
})();

