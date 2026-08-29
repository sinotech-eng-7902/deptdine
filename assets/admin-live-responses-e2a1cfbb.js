/*
 * 目前活動回覆即時同步
 *
 * 保留 loadSurveyData() 的單次查詢作為首次載入與斷線備援；登入後再針對
 * 目前活動建立一條 responses 即時監聽，只更新依賴回覆的畫面區塊。
 */
(() => {
  const MODULE_VERSION='10.41';
  let unsubscribe=null;
  let subscribedSurveyId='';
  let listenerGeneration=0;
  let refreshTimer=null;
  let authObserverInstalled=false;

  function stableValue(value){
    if(value===null||value===undefined)return value;
    if(typeof value?.toMillis==='function')return {__timestamp:value.toMillis()};
    if(Array.isArray(value))return value.map(stableValue);
    if(typeof value==='object')return Object.keys(value).sort().reduce((result,key)=>{result[key]=stableValue(value[key]);return result},{});
    return value;
  }

  function responseSignature(items){
    return JSON.stringify((items||[]).map(item=>stableValue(item)).sort((a,b)=>String(a.id||'').localeCompare(String(b.id||''))));
  }

  function captureResultsState(){
    return {
      missingSearch:document.getElementById('missingSearchV953')?.value||'',
      missingDepartment:document.getElementById('missingDeptFilterV953')?.value||'',
      responseSearch:document.getElementById('responseSearch')?.value||'',
      responseDepartment:document.getElementById('responseDeptFilter')?.value||'',
      responseSort:document.getElementById('responseSort')?.value||'member',
      responseAttendance:document.getElementById('responseAttendanceFilter')?.value||'',
      dateDepartment:document.getElementById('dateStatsDeptFilter')?.value||'',
      expandedResponses:[...document.querySelectorAll('.responseDetailRow:not([hidden])')].map(row=>row.dataset.detailFor).filter(Boolean),
      expandedDates:[...document.querySelectorAll('.dateDecisionItem.isRosterOpen[data-date-id]')].map(item=>item.dataset.dateId).filter(Boolean)
    };
  }

  function restoreControl(id,value){
    const control=document.getElementById(id);
    if(!control)return;
    if(control.type==='checkbox')control.checked=!!value;
    else control.value=value;
  }

  function restoreResultsState(state){
    if(!state)return;
    restoreControl('missingSearchV953',state.missingSearch);
    restoreControl('missingDeptFilterV953',state.missingDepartment);
    restoreControl('responseSearch',state.responseSearch);
    restoreControl('responseDeptFilter',state.responseDepartment);
    restoreControl('responseSort',state.responseSort);
    restoreControl('responseAttendanceFilter',state.responseAttendance);
    restoreControl('dateStatsDeptFilter',state.dateDepartment);
    if(typeof filterMissingRowsV953==='function')filterMissingRowsV953();
    if(typeof filterResponseRows==='function')filterResponseRows();
    if(typeof filterDateStatsDepartmentV711==='function')filterDateStatsDepartmentV711();

    const expandedResponses=new Set(state.expandedResponses);
    document.querySelectorAll('.responseDetailRow[data-detail-for]').forEach(detail=>{
      if(!expandedResponses.has(detail.dataset.detailFor))return;
      detail.hidden=false;
      const row=document.querySelector(`.responseRow[data-response-id="${CSS.escape(detail.dataset.detailFor)}"]`);
      const button=row?.querySelector('.responseExpandButton');
      button?.classList.add('open');
      button?.setAttribute('aria-expanded','true');
    });
    const expandedDates=new Set(state.expandedDates);
    document.querySelectorAll('.dateDecisionItem[data-date-id]').forEach(item=>{
      if(!expandedDates.has(item.dataset.dateId)||item.classList.contains('isRosterOpen'))return;
      const button=item.querySelector('.dateRosterToggleV953');
      if(button&&typeof toggleDateRosterV953==='function')toggleDateRosterV953(button);
    });
  }

  function refreshMailRecipients(){
    const list=document.getElementById('mailRecipientListV957');
    const type=document.getElementById('mailTypeV957')?.value||'invitation';
    if(!list||type!=='reminder'||typeof renderMailRecipientListV957!=='function')return;
    const existingChecks=[...list.querySelectorAll('.mailRecipientCheckV957')];
    const selectedIds=new Set(existingChecks.filter(input=>input.checked).map(input=>String(input.value)));
    const hadExistingRows=existingChecks.length>0;
    renderMailRecipientListV957(type);
    if(hadExistingRows){
      list.querySelectorAll('.mailRecipientCheckV957').forEach(input=>{input.checked=selectedIds.has(String(input.value))});
      if(typeof updateMailRecipientCountV957==='function')updateMailRecipientCountV957();
    }
  }

  function refreshResponseViews(){
    const state=captureResultsState();
    const scrollX=window.scrollX,scrollY=window.scrollY;
    if(typeof renderDashboard==='function')renderDashboard();
    if(typeof renderResults==='function')renderResults();
    restoreResultsState(state);
    if(typeof renderCostEstimatePanel==='function')renderCostEstimatePanel();
    if(typeof renderFinalAttendancePreview==='function')renderFinalAttendancePreview();
    refreshMailRecipients();
    requestAnimationFrame(()=>window.scrollTo(scrollX,scrollY));
    window.dispatchEvent(new CustomEvent('admin:responses-updated',{detail:{surveyId:subscribedSurveyId,count:D.responses.length}}));
  }

  function scheduleResponseViewRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refreshResponseViews,80);
  }

  function acceptSnapshot(surveyId,generation,snapshot){
    if(generation!==listenerGeneration||String(activeSurveyId||'')!==surveyId)return;
    const nextResponses=snapshot.docs.map(documentSnapshot=>({id:documentSnapshot.id,...documentSnapshot.data()}));
    if(responseSignature(nextResponses)===responseSignature(D.responses))return;
    D.responses=nextResponses;
    scheduleResponseViewRefresh();
  }

  function stopActiveResponseListener(){
    listenerGeneration++;
    subscribedSurveyId='';
    clearTimeout(refreshTimer);
    refreshTimer=null;
    if(unsubscribe){try{unsubscribe()}catch(error){console.warn('停止回覆即時監聽失敗',error)}}
    unsubscribe=null;
    document.documentElement.dataset.responseSync='idle';
  }

  function installAuthObserver(){
    if(authObserverInstalled||!auth?.onAuthStateChanged)return;
    authObserverInstalled=true;
    auth.onAuthStateChanged(user=>{if(!user)stopActiveResponseListener()});
  }

  function ensureActiveResponseListener(){
    installAuthObserver();
    const surveyId=String(activeSurveyId||'');
    if(!ready||!currentUser||!isAdmin||!surveyId){stopActiveResponseListener();return}
    if(unsubscribe&&subscribedSurveyId===surveyId)return;
    stopActiveResponseListener();
    subscribedSurveyId=surveyId;
    const generation=listenerGeneration;
    document.documentElement.dataset.responseSync='connecting';
    unsubscribe=col('responses').where('surveyId','==',surveyId).onSnapshot(
      snapshot=>{
        if(generation!==listenerGeneration)return;
        document.documentElement.dataset.responseSync='live';
        acceptSnapshot(surveyId,generation,snapshot);
      },
      error=>{
        if(generation!==listenerGeneration)return;
        console.warn('目前活動回覆即時同步暫時無法使用，保留手動重新整理功能。',error);
        document.documentElement.dataset.responseSync='fallback';
      }
    );
  }

  const renderAdminBeforeLiveResponses=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBeforeLiveResponses();
    setTimeout(ensureActiveResponseListener,0);
    return result;
  };
  window.renderAdmin=renderAdmin;

  const loadSurveyDataBeforeLiveResponses=loadSurveyData;
  loadSurveyData=async function(){
    const result=await loadSurveyDataBeforeLiveResponses();
    setTimeout(ensureActiveResponseListener,0);
    return result;
  };
  window.loadSurveyData=loadSurveyData;

  const logoutBeforeLiveResponses=logout;
  logout=async function(){
    stopActiveResponseListener();
    return logoutBeforeLiveResponses();
  };
  window.logout=logout;

  window.AdminLiveResponses=Object.freeze({version:MODULE_VERSION,ensure:ensureActiveResponseListener,stop:stopActiveResponseListener});
})();









