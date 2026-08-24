/* 相容層：活動、人員、權限與管理流程最終接管。 */

// ===== finalizer：活動列表分類與操作欄優化 =====
(function(){
  let surveyListScopeV798='owned';

  function makeBtnV798(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }
  function currentEmailV798(){
    return normalizeEmail(currentUser?.email||'');
  }
  function surveyCreatorEmailV798(s){
    return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'');
  }
  function isSurveyCreatorV798(s){
    const email=currentEmailV798();
    return !!s && (
      (!!email && surveyCreatorEmailV798(s)===email) ||
      (!!currentUser?.uid && String(s?.createdByUid||'')===String(currentUser.uid))
    );
  }
  function assignmentForSurveyV798(id){
    return (surveyAssignments||[]).find(a=>a.surveyId===id&&a.enabled!==false)||null;
  }
  function canManageSurveyV798(s){
    return isSystemAdmin || isSurveyCreatorV798(s) || assignmentForSurveyV798(s?.id)?.role==='manager';
  }
  function canDeleteSurveyV798(s){
    return isSystemAdmin || isSurveyCreatorV798(s);
  }
  function creatorLabelV798(s){
    return String(s?.createdByName||s?.creatorName||s?.ownerName||'').trim() || (surveyCreatorEmailV798(s)||'未記錄');
  }
  function ensureScopeV798(){
    const allowed=isSystemAdmin?['owned','joined','all']:['owned','joined'];
    if(!allowed.includes(surveyListScopeV798))surveyListScopeV798=isSystemAdmin?'all':'owned';
    if(!isSystemAdmin&&surveyListScopeV798==='owned'&&!D.surveys.some(isSurveyCreatorV798))surveyListScopeV798='joined';
  }
  function visibleSurveysV798(){
    ensureScopeV798();
    const email=currentEmailV798();
    if(isSystemAdmin&&surveyListScopeV798==='all')return D.surveys;
    if(surveyListScopeV798==='owned')return D.surveys.filter(isSurveyCreatorV798);
    return D.surveys.filter(s=>assignmentForSurveyV798(s.id)&&surveyCreatorEmailV798(s)!==email);
  }
  function roleTextV798(s){
    if(isSystemAdmin)return isSurveyCreatorV798(s)?'系統管理員／發起人':'系統管理員';
    if(isSurveyCreatorV798(s))return '發起人';
    return assignmentForSurveyV798(s.id)?.role==='manager'?'活動管理者':'結果檢視者';
  }
  function tabsHtmlV798(){
    ensureScopeV798();
    const counts={
      owned:D.surveys.filter(isSurveyCreatorV798).length,
      joined:D.surveys.filter(s=>assignmentForSurveyV798(s.id)&&!isSurveyCreatorV798(s)).length,
      all:D.surveys.length
    };
    const tabs=[['owned','我發起的活動',counts.owned],['joined','我參與的活動',counts.joined]];
    if(isSystemAdmin)tabs.push(['all','系統內所有活動',counts.all]);
    return `<div class="surveyScopeTabsV793 surveyScopeTabsV798">${tabs.map(([key,label,count])=>`<button type="button" class="${surveyListScopeV798===key?'active':''}" onclick="setSurveyScopeV798('${key}')">${label}<span>${count}</span></button>`).join('')}</div>`;
  }
  function dateRangeHtmlV798(s){
    const state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
    const start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
    const end=s.deadline?formatDeadline(s.deadline):'未設定';
    return {
      state,
      html:`<small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}`
    };
  }
  function rowsHtmlV798(){
    const rows=visibleSurveysV798();
    if(isSystemAdmin&&surveyListScopeV798==='all'){
      return table(['活動','狀態','建立者','開放／截止時間','操作'],rows.map(s=>{
        const current=s.id===activeSurveyId;
        const range=dateRangeHtmlV798(s);
        return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(creatorLabelV798(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
      }));
    }
    return table(['活動','狀態','我的角色','建立者','開放／截止時間','操作'],rows.map(s=>{
      const current=s.id===activeSurveyId;
      const range=dateRangeHtmlV798(s);
      return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(roleTextV798(s))}</td><td>${esc(creatorLabelV798(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
    }));
  }
  function applyActionsV798(){
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>x.id===row.dataset.surveyId);
      const ops=row.querySelector('.operationCell');
      if(!s||!ops)return;
      const archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
      const current=s.id===activeSurveyId;
      const group=document.createElement('div');
      group.className='surveyActionGroupV798';
      group.appendChild(makeBtnV798(archived&&!canManageSurveyV798(s)?'查看':'編輯','btn',()=>archived&&!canManageSurveyV798(s)?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
      if(canManageSurveyV798(s))group.appendChild(makeBtnV798('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(canManageSurveyV798(s))group.appendChild(makeBtnV798(archived?'恢復':'結案',archived?'btn green':'btn',()=>window.archiveSurveyV775(s.id,!archived)));
      if(canDeleteSurveyV798(s))group.appendChild(makeBtnV798('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV798('設目前','btn green currentActionV787',()=>setActiveSurvey(s.id)));
      ops.innerHTML='';
      ops.appendChild(group);
    });
  }
  function renderSurveyListV798(){
    const tableBox=document.getElementById('surveyTable');
    if(!tableBox)return;
    tableBox.innerHTML=tabsHtmlV798()+rowsHtmlV798();
    applyActionsV798();
    if(typeof applyCreatorBackfillButtonsV795==='function')applyCreatorBackfillButtonsV795();
  }

  const renderSurveyPanelBeforeV798=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV798();
    renderSurveyListV798();
  };

  const renderAdminBeforeV798=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV798();
    renderSurveyListV798();
  };

  const panelBeforeV798=panel;
  panel=function(id,b){
    const result=panelBeforeV798(id,b);
    if(id==='surveyP')renderSurveyListV798();
    return result;
  };

  function setSurveyScopeV798(scope){
    surveyListScopeV798=scope;
    renderSurveyListV798();
  }

  window.renderSurveyListV798=renderSurveyListV798;
  window.setSurveyScopeV798=setSurveyScopeV798;
  window.panel=panel;
})();

// ===== finalizer：活動發起人可刪除自己發起的活動 =====
(function(){
  function currentEmailV800(){return normalizeEmail(currentUser?.email||'')}
  function surveyCreatorEmailV800(s){return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'')}
  function isSurveyCreatorV800(s){
    const email=currentEmailV800();
    return !!s && ((!!email&&surveyCreatorEmailV800(s)===email)||(!!currentUser?.uid&&String(s?.createdByUid||'')===String(currentUser.uid)));
  }
  function canDeleteSurveyV800(s){
    return isSystemAdmin || isSurveyCreatorV800(s);
  }
  const showDeleteSurveyModalBeforeV800=window.showDeleteSurveyModalV776||showDeleteSurveyModalV776;
  window.showDeleteSurveyModalV776=function(id){
    const s=D.surveys.find(x=>x.id===id);
    if(!s)return alert('找不到活動資料，請重新整理後再試一次');
    if(!canDeleteSurveyV800(s))return alert('只有系統管理員或活動發起人可以刪除這個活動');
    const originalIsSystemAdmin=isSystemAdmin;
    try{
      if(!isSystemAdmin&&isSurveyCreatorV800(s))isSystemAdmin=true;
      return showDeleteSurveyModalBeforeV800(id);
    }finally{
      isSystemAdmin=originalIsSystemAdmin;
    }
  };
  showDeleteSurveyModalV776=window.showDeleteSurveyModalV776;

  const renderSurveyListBeforeV800=window.renderSurveyListV798;
  if(typeof renderSurveyListBeforeV800==='function'){
    window.renderSurveyListV798=function(){
      renderSurveyListBeforeV800();
      document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
        const s=D.surveys.find(x=>x.id===row.dataset.surveyId);
        if(!s||canDeleteSurveyV800(s))return;
        row.querySelectorAll('.surveyActionGroupV798 .btn').forEach(btn=>{
          if(btn.textContent.trim()==='刪除')btn.remove();
        });
      });
    };
    renderSurveyListV798=window.renderSurveyListV798;
  }
  window.canDeleteSurveyV800=canDeleteSurveyV800;
})();

// ===== finalizer：活動分類整併、部門必填、權限管理收斂 =====
(function(){
  let surveyListScopeV801='owned';

  function isArchivedV801(s){
    return typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s?.status==='archived'||s?.archived===true);
  }
  function currentEmailV801(){return normalizeEmail(currentUser?.email||'')}
  function surveyCreatorEmailV801(s){return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'')}
  function isSurveyCreatorV801(s){
    const email=currentEmailV801();
    return !!s && ((!!email&&surveyCreatorEmailV801(s)===email)||(!!currentUser?.uid&&String(s?.createdByUid||'')===String(currentUser.uid)));
  }
  function assignmentForSurveyV801(id){
    return (surveyAssignments||[]).find(a=>a.surveyId===id&&a.enabled!==false)||null;
  }
  function canSeeSurveyV801(s){
    return isSystemAdmin || isSurveyCreatorV801(s) || !!assignmentForSurveyV801(s?.id);
  }
  function canManageSurveyV801(s){
    return isSystemAdmin || isSurveyCreatorV801(s) || assignmentForSurveyV801(s?.id)?.role==='manager';
  }
  function canDeleteSurveyV801(s){
    return isSystemAdmin || isSurveyCreatorV801(s);
  }
  function creatorLabelV801(s){
    return String(s?.createdByName||s?.creatorName||s?.ownerName||'').trim() || (surveyCreatorEmailV801(s)||'未記錄');
  }
  function ensureScopeV801(){
    const allowed=isSystemAdmin?['owned','joined','archived','all']:['owned','joined','archived'];
    if(!allowed.includes(surveyListScopeV801))surveyListScopeV801='owned';
    if(!isSystemAdmin&&surveyListScopeV801==='owned'&&!D.surveys.some(s=>isSurveyCreatorV801(s)&&!isArchivedV801(s)))surveyListScopeV801='joined';
  }
  function visibleSurveysV801(){
    ensureScopeV801();
    const email=currentEmailV801();
    if(surveyListScopeV801==='archived')return D.surveys.filter(s=>isArchivedV801(s)&&canSeeSurveyV801(s));
    if(isSystemAdmin&&surveyListScopeV801==='all')return D.surveys;
    if(surveyListScopeV801==='owned')return D.surveys.filter(s=>isSurveyCreatorV801(s)&&!isArchivedV801(s));
    return D.surveys.filter(s=>assignmentForSurveyV801(s.id)&&surveyCreatorEmailV801(s)!==email&&!isArchivedV801(s));
  }
  function roleTextV801(s){
    if(isSystemAdmin)return isSurveyCreatorV801(s)?'系統管理員／發起人':'系統管理員';
    if(isSurveyCreatorV801(s))return '發起人';
    return assignmentForSurveyV801(s.id)?.role==='manager'?'活動管理者':'結果檢視者';
  }
  function tabsHtmlV801(){
    ensureScopeV801();
    const email=currentEmailV801();
    const counts={
      owned:D.surveys.filter(s=>isSurveyCreatorV801(s)&&!isArchivedV801(s)).length,
      joined:D.surveys.filter(s=>assignmentForSurveyV801(s.id)&&surveyCreatorEmailV801(s)!==email&&!isArchivedV801(s)).length,
      archived:D.surveys.filter(s=>isArchivedV801(s)&&canSeeSurveyV801(s)).length,
      all:D.surveys.length
    };
    const tabs=[['owned','我發起的活動',counts.owned],['joined','我參與的活動',counts.joined],['archived','已結案的活動',counts.archived]];
    if(isSystemAdmin)tabs.push(['all','系統內所有活動',counts.all]);
    return `<div class="surveyScopeTabsV793 surveyScopeTabsV801">${tabs.map(([key,label,count])=>`<button type="button" class="${surveyListScopeV801===key?'active':''}" onclick="setSurveyScopeV801('${key}')">${label}<span>${count}</span></button>`).join('')}</div>`;
  }
  function dateRangeHtmlV801(s){
    const state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
    const start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
    const end=s.deadline?formatDeadline(s.deadline):'未設定';
    return {state,html:`<small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}`};
  }
  function makeBtnV801(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }
  function rowsHtmlV801(){
    const rows=visibleSurveysV801();
    if(isSystemAdmin&&surveyListScopeV801==='all'){
      return table(['活動','狀態','建立者','開放／截止時間','操作'],rows.map(s=>{
        const current=s.id===activeSurveyId,range=dateRangeHtmlV801(s);
        return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(creatorLabelV801(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
      }));
    }
    return table(['活動','狀態','我的角色','建立者','開放／截止時間','操作'],rows.map(s=>{
      const current=s.id===activeSurveyId,range=dateRangeHtmlV801(s);
      return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(roleTextV801(s))}</td><td>${esc(creatorLabelV801(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
    }));
  }
  function applyActionsV801(){
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>x.id===row.dataset.surveyId);
      const ops=row.querySelector('.operationCell');
      if(!s||!ops)return;
      const archived=isArchivedV801(s),current=s.id===activeSurveyId,group=document.createElement('div');
      group.className='surveyActionGroupV798 surveyActionGroupV801';
      group.appendChild(makeBtnV801(archived&&!canManageSurveyV801(s)?'查看':'編輯','btn',()=>archived&&!canManageSurveyV801(s)?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
      if(canManageSurveyV801(s))group.appendChild(makeBtnV801('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(canManageSurveyV801(s))group.appendChild(makeBtnV801(archived?'恢復':'結案',archived?'btn green':'btn',()=>window.archiveSurveyV775(s.id,!archived)));
      if(canDeleteSurveyV801(s))group.appendChild(makeBtnV801('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV801('設目前','btn green currentActionV787',()=>setActiveSurvey(s.id)));
      ops.innerHTML='';
      ops.appendChild(group);
    });
  }
  function renderSurveyListV801(){
    document.getElementById('surveyArchiveTabsV775')?.remove();
    document.getElementById('surveyArchiveEmptyV775')?.remove();
    const tableBox=document.getElementById('surveyTable');
    if(!tableBox)return;
    tableBox.innerHTML=tabsHtmlV801()+rowsHtmlV801();
    applyActionsV801();
  }
  function selectedTargetDepartmentsV801(){
    return [...document.querySelectorAll('.targetDept:checked')].map(x=>x.value).filter(Boolean);
  }
  function requireTargetDepartmentV801(){
    if(!['new','edit'].includes(surveyFormMode))return true;
    if(selectedTargetDepartmentsV801().length>0)return true;
    alert('請至少選擇一個參與部門');
    const first=document.querySelector('.targetDept');
    if(first)first.focus();
    return false;
  }

  const renderSurveyPanelBeforeV801=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV801();
    renderSurveyListV801();
  };
  const renderAdminBeforeV801=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV801();
    renderSurveyListV801();
  };
  const panelBeforeV801=panel;
  panel=function(id,b){
    const result=panelBeforeV801(id,b);
    if(id==='surveyP')renderSurveyListV801();
    return result;
  };
  const saveSurveyBeforeV801=saveSurvey;
  saveSurvey=async function(){
    if(!requireTargetDepartmentV801())return;
    return saveSurveyBeforeV801();
  };

  saveSurveyManager=async function(){
    if(!canManage())return alert('此帳號沒有活動權限管理權限');
    if(!activeSurveyId)return alert('請先選擇活動');
    const email=normalizeEmail(managerEmail.value||'');
    if(!/^\S+@\S+\.\S+$/.test(email))return alert('請選擇分享成員');
    const selectedMember=findMemberByGoogleEmail(email);
    if(!selectedMember)return alert('請從分享成員清單選擇人員');
    const role=managerRole.value==='viewer'?'viewer':'manager';
    const targetId=managerDocId(activeSurveyId,email);
    const data={
      surveyId:activeSurveyId,email,role,enabled:true,
      memberId:selectedMember.id||'',
      displayName:memberDisplayName(selectedMember),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    const btn=document.querySelector('#accessP .accessForm .btn.primary');
    if(btn){btn.disabled=true;btn.textContent='儲存中...'}
    try{
      await doc('surveyManagers',targetId).set(data,{merge:true});
      try{
        const after=typeof auditReadDocV760==='function'?await auditReadDocV760('surveyManagers',targetId):data;
        if(typeof writeAuditDetailV760==='function'){
          await writeAuditDetailV760({action:'指派',targetType:'活動權限',targetId,targetLabel:email,before:null,after:after||data,fields:['email','role','enabled','memberId','displayName'],surveyId:activeSurveyId,summary:'指派 '+email+' 為 '+(role==='viewer'?'結果檢視者':'活動管理者')});
        }
      }catch(auditError){
        console.warn('活動權限稽核紀錄寫入失敗',auditError);
      }
      managerEmail.value='';
      await loadSurveyData();
      renderAdmin();
      toast('活動權限已更新');
    }catch(e){
      console.error('save survey manager failed',e);
      alert('活動權限儲存失敗，請確認 Firestore 規則已部署後再試一次。');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='新增／更新權限'}
    }
  };

  removeSurveyManager=async function(id){
    if(!canManage())return alert('此帳號沒有活動權限管理權限');
    if(!confirm('確定移除此活動權限？'))return;
    const target=D.managers.find(m=>m.id===id);
    if(!target||target.surveyId!==activeSurveyId)return alert('只能移除目前活動的權限');
    try{
      await doc('surveyManagers',id).delete();
      await loadSurveyData();
      renderAdmin();
      toast('活動權限已移除');
    }catch(e){
      console.error('remove survey manager failed',e);
      alert('移除活動權限失敗，請確認 Firestore 規則已部署後再試一次。');
    }
  };

  function setSurveyScopeV801(scope){
    surveyListScopeV801=scope;
    renderSurveyListV801();
  }
  window.renderSurveyListV801=renderSurveyListV801;
  window.setSurveyScopeV801=setSurveyScopeV801;
  window.panel=panel;
  window.saveSurvey=saveSurvey;
  window.saveSurveyManager=saveSurveyManager;
  window.removeSurveyManager=removeSurveyManager;
})();

// ===== finalizer：權限分享錯誤診斷 =====
(function(){
  const saveSurveyManagerBeforeV802=saveSurveyManager;
  saveSurveyManager=async function(){
    try{
      return await saveSurveyManagerBeforeV802();
    }catch(e){
      console.error('save survey manager failed unexpectedly',{
        error:e,
        activeSurveyId,
        currentUserEmail:currentUser?.email||'',
        targetEmail:managerEmail?.value||'',
        role:managerRole?.value||'',
        currentAccessRole,
        isSystemAdmin
      });
      alert('活動權限儲存失敗。請確認 Firebase 規則已部署，且目前帳號是該活動發起人或活動管理者。');
    }
  };
  window.saveSurveyManager=saveSurveyManager;
})();

// ===== finalizer：人員管理 Google 帳號可登入後台 =====
(function(){
  function loginEmailV803(email){
    return normalizeEmail(email||currentUser?.email||'');
  }
  async function findBackendMemberByEmailV803(email){
    const normalized=loginEmailV803(email);
    if(!normalized)return null;
    try{
      const accounts=await col('memberAccounts').where('email','==',normalized).limit(1).get();
      if(accounts.empty)return null;
      const accountDoc=accounts.docs[0];
      const account={id:accountDoc.id,...accountDoc.data()};
      const memberId=account.memberId||account.id;
      if(!memberId)return {account,member:null};
      const memberSnap=await doc('members',memberId).get();
      if(!memberSnap.exists)return null;
      const member={id:memberSnap.id,...memberSnap.data()};
      if(member.active===false)return {account,member,disabled:true};
      return {account,member};
    }catch(e){
      console.warn('backend member account check skipped',e);
      return null;
    }
  }
  async function ensureMemberAccountsLoadedV803(){
    if(!isAdmin||isSystemAdmin)return;
    if(Array.isArray(D.memberAccounts)&&D.memberAccounts.length)return;
    try{
      D.memberAccounts=await safeGetCollection('memberAccounts');
    }catch(e){
      console.warn('memberAccounts preload skipped',e);
    }
  }

  const resolveAccessBeforeV803=resolveAccess;
  resolveAccess=async function(email,uid){
    await resolveAccessBeforeV803(email,uid);
    if(isSystemAdmin)return;
    const backendMember=await findBackendMemberByEmailV803(email);
    if(backendMember?.disabled){
      isAdmin=false;
      currentAccessRole='';
      surveyAssignments=[];
      D.memberAccounts=[];
      return;
    }
    if(isAdmin)return;
    if(!backendMember)return;
    isAdmin=true;
    currentAccessRole='member';
    surveyAssignments=[];
    D.memberAccounts=[backendMember.account];
  };

  const loadAllBeforeV803=loadAll;
  loadAll=async function(){
    await loadAllBeforeV803();
    await ensureMemberAccountsLoadedV803();
  };

  const applyAccessUIBeforeV803=applyAccessUI;
  applyAccessUI=function(){
    applyAccessUIBeforeV803();
    if(!isSystemAdmin&&currentAccessRole==='member'&&adminRole)adminRole.textContent='後台帳號';
  };

})();

// ===== finalizer：無活動空狀態與前台卡片對齊 =====
(function(){
  function hasActiveSurveyV804(){
    return !!(activeSurveyId&&activeSurvey());
  }
  function surveyDependentNavsV804(){
    return [...document.querySelectorAll('.nav[onclick*="respP"],.nav[onclick*="exportExcel"]')];
  }
  function setDashboardEmptyV804(){
    if(sFilled)sFilled.textContent='0';
    if(sTotal)sTotal.textContent='0';
    if(sRate)sRate.textContent='0%';
    if(sNo)sNo.textContent='0';
    if(bar)bar.style.width='0%';
    const stats=document.querySelector('#dash .stats');
    if(stats)stats.style.display='none';
    if(activeSurveyInfo){
      activeSurveyInfo.innerHTML='<b>目前尚無可檢視活動</b><br>請到「活動管理」建立自己的活動。';
    }
    document.querySelectorAll('#dash button[onclick*="respP"]').forEach(btn=>btn.hidden=true);
  }
  function restoreDashboardStatsV804(){
    const stats=document.querySelector('#dash .stats');
    if(stats)stats.style.display='';
    document.querySelectorAll('#dash button[onclick*="respP"]').forEach(btn=>btn.hidden=!hasActiveSurveyV804());
  }

  const renderDashboardBeforeV804=renderDashboard;
  renderDashboard=function(){
    if(!hasActiveSurveyV804()){
      setDashboardEmptyV804();
      return;
    }
    restoreDashboardStatsV804();
    renderDashboardBeforeV804();
  };

  const applyAccessUIBeforeV804=applyAccessUI;
  applyAccessUI=function(){
    applyAccessUIBeforeV804();
    const hasSurvey=hasActiveSurveyV804();
    surveyDependentNavsV804().forEach(nav=>{
      if(!hasSurvey)nav.hidden=true;
      else if(nav.dataset.access==='all')nav.hidden=false;
    });
    document.querySelectorAll('#dash button[onclick*="respP"]').forEach(btn=>btn.hidden=!hasSurvey);
  };

  const panelBeforeV804=panel;
  panel=function(id,b){
    if(id==='respP'&&!hasActiveSurveyV804())return alert('目前尚無可檢視活動，請先到活動管理建立活動。');
    return panelBeforeV804(id,b);
  };

  const exportExcelBeforeV804=exportExcel;
  exportExcel=function(){
    if(!hasActiveSurveyV804())return alert('目前尚無可匯出的活動資料，請先建立或選擇活動。');
    return exportExcelBeforeV804();
  };

  window.panel=panel;
  window.exportExcel=exportExcel;
})();

// ===== finalizer：被分享的活動命名、後台說明更新、admin 模擬身分 =====
(function(){
  let surveyListScopeV807='owned';
  let simulateMemberIdV807='';
  let allSurveyManagersV807=[];

  function isSimulatingV807(){return !!(isSystemAdmin&&simulateMemberIdV807)}
  function simMemberV807(){return D.members.find(m=>String(m.id)===String(simulateMemberIdV807))||null}
  function effectiveEmailV807(){
    const member=simMemberV807();
    return normalizeEmail(member?memberGoogleEmail(member):(currentUser?.email||''));
  }
  function effectiveUidV807(){return isSimulatingV807()?'':String(currentUser?.uid||'')}
  function isArchivedV807(s){return typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s?.status==='archived'||s?.archived===true)}
  function surveyCreatorEmailV807(s){return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'')}
  function isCreatorV807(s){
    const email=effectiveEmailV807(),uid=effectiveUidV807();
    return !!s&&((!!email&&surveyCreatorEmailV807(s)===email)||(!isSimulatingV807()&&!!uid&&String(s?.createdByUid||'')===uid));
  }
  function assignmentForSurveyV807(id){
    const email=effectiveEmailV807();
    const source=isSimulatingV807()?allSurveyManagersV807:(surveyAssignments||[]);
    return (source||[]).find(a=>a.surveyId===id&&a.enabled!==false&&(!isSimulatingV807()||normalizeEmail(a.email)===email))||null;
  }
  function canSeeSurveyV807(s){
    if(!s)return false;
    if(isSystemAdmin&&!isSimulatingV807())return true;
    return isCreatorV807(s)||!!assignmentForSurveyV807(s.id);
  }
  function canManageSurveyV807(s){
    if(!s)return false;
    if(isSystemAdmin&&!isSimulatingV807())return true;
    return isCreatorV807(s)||assignmentForSurveyV807(s.id)?.role==='manager';
  }
  function canDeleteSurveyV807(s){
    if(!s)return false;
    if(isSystemAdmin&&!isSimulatingV807())return true;
    return isCreatorV807(s);
  }
  function creatorLabelV807(s){
    return String(s?.createdByName||s?.creatorName||s?.ownerName||'').trim()||(surveyCreatorEmailV807(s)||'未記錄');
  }
  function roleTextV807(s){
    if(isSystemAdmin&&!isSimulatingV807())return isCreatorV807(s)?'系統管理員／發起人':'系統管理員';
    if(isCreatorV807(s))return '發起人';
    return assignmentForSurveyV807(s.id)?.role==='manager'?'活動管理者':'結果檢視者';
  }
  function visibleSurveysForScopeV807(){
    ensureScopeV807();
    const email=effectiveEmailV807();
    if(surveyListScopeV807==='archived')return D.surveys.filter(s=>isArchivedV807(s)&&canSeeSurveyV807(s));
    if(isSystemAdmin&&!isSimulatingV807()&&surveyListScopeV807==='all')return D.surveys;
    if(surveyListScopeV807==='owned')return D.surveys.filter(s=>isCreatorV807(s)&&!isArchivedV807(s));
    return D.surveys.filter(s=>assignmentForSurveyV807(s.id)&&surveyCreatorEmailV807(s)!==email&&!isArchivedV807(s));
  }
  function ensureScopeV807(){
    const allowed=(isSystemAdmin&&!isSimulatingV807())?['owned','shared','archived','all']:['owned','shared','archived'];
    if(!allowed.includes(surveyListScopeV807))surveyListScopeV807='owned';
    if(isSimulatingV807()&&!visibleCountV807('owned')&&visibleCountV807('shared'))surveyListScopeV807='shared';
  }
  function visibleCountV807(scope){
    const old=surveyListScopeV807;
    surveyListScopeV807=scope;
    let count=0;
    const email=effectiveEmailV807();
    if(scope==='archived')count=D.surveys.filter(s=>isArchivedV807(s)&&canSeeSurveyV807(s)).length;
    else if(scope==='all')count=D.surveys.length;
    else if(scope==='owned')count=D.surveys.filter(s=>isCreatorV807(s)&&!isArchivedV807(s)).length;
    else count=D.surveys.filter(s=>assignmentForSurveyV807(s.id)&&surveyCreatorEmailV807(s)!==email&&!isArchivedV807(s)).length;
    surveyListScopeV807=old;
    return count;
  }
  function dateRangeHtmlV807(s){
    const state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
    const start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
    const end=s.deadline?formatDeadline(s.deadline):'未設定';
    return {state,html:`<small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}`};
  }
  function makeBtnV807(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';btn.className=cls||'btn';btn.textContent=text;btn.addEventListener('click',handler);
    return btn;
  }
  function tabsHtmlV807(){
    ensureScopeV807();
    const tabs=[
      ['owned','我發起的活動',visibleCountV807('owned')],
      ['shared','被分享的活動',visibleCountV807('shared')],
      ['archived','已結案的活動',visibleCountV807('archived')]
    ];
    if(isSystemAdmin&&!isSimulatingV807())tabs.push(['all','系統內所有活動',visibleCountV807('all')]);
    return `<div class="surveyScopeTabsV793 surveyScopeTabsV807">${tabs.map(([key,label,count])=>`<button type="button" class="${surveyListScopeV807===key?'active':''}" onclick="setSurveyScopeV807('${key}')">${label}<span>${count}</span></button>`).join('')}</div>`;
  }
  function rowsHtmlV807(){
    const rows=visibleSurveysForScopeV807();
    if(isSystemAdmin&&!isSimulatingV807()&&surveyListScopeV807==='all'){
      return table(['活動','狀態','建立者','開放／截止時間','操作'],rows.map(s=>{
        const current=s.id===activeSurveyId,range=dateRangeHtmlV807(s);
        return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(creatorLabelV807(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
      }));
    }
    return table(['活動','狀態','我的角色','建立者','開放／截止時間','操作'],rows.map(s=>{
      const current=s.id===activeSurveyId,range=dateRangeHtmlV807(s);
      return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(roleTextV807(s))}</td><td>${esc(creatorLabelV807(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV798"></td></tr>`;
    }));
  }
  function applyActionsV807(){
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>x.id===row.dataset.surveyId),ops=row.querySelector('.operationCell');
      if(!s||!ops)return;
      const archived=isArchivedV807(s),current=s.id===activeSurveyId,group=document.createElement('div');
      group.className='surveyActionGroupV798 surveyActionGroupV801 surveyActionGroupV807';
      group.appendChild(makeBtnV807(isSimulatingV807()||archived&&!canManageSurveyV807(s)?'查看':'編輯','btn',()=>isSimulatingV807()||archived&&!canManageSurveyV807(s)?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
      if(!isSimulatingV807()&&canManageSurveyV807(s))group.appendChild(makeBtnV807('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(!isSimulatingV807()&&canManageSurveyV807(s))group.appendChild(makeBtnV807(archived?'恢復':'結案',archived?'btn green':'btn',()=>window.archiveSurveyV775(s.id,!archived)));
      if(!isSimulatingV807()&&canDeleteSurveyV807(s))group.appendChild(makeBtnV807('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV807('設目前','btn green currentActionV787',()=>setActiveSurvey(s.id)));
      ops.innerHTML='';ops.appendChild(group);
    });
  }
  function renderSurveyListV807(){
    document.getElementById('surveyArchiveTabsV775')?.remove();
    document.getElementById('surveyArchiveEmptyV775')?.remove();
    const tableBox=document.getElementById('surveyTable');
    if(!tableBox)return;
    tableBox.innerHTML=tabsHtmlV807()+rowsHtmlV807();
    applyActionsV807();
  }

  async function ensureAllManagersV807(){
    if(!isSystemAdmin)return;
    try{allSurveyManagersV807=await safeGetCollection('surveyManagers')}catch(e){console.warn('simulate managers preload failed',e);allSurveyManagersV807=[]}
  }
  function ensureSimulationToolbarV807(){
    if(!isSystemAdmin||document.getElementById('simulateToolbarV807'))return;
    const userArea=document.querySelector('.topUserArea');
    const userIcon=document.querySelector('.topUserIcon');
    if(!userArea||!userIcon)return;
    const box=document.createElement('div');
    box.id='simulateToolbarV807';
    box.className='simulateToolbarV807 systemOnly';
    box.innerHTML='<div class="simulatePanelTitleV808">模擬身分</div><label for="simulateMemberSelectV807">選擇檢視身份</label><select id="simulateMemberSelectV807"><option value="">以 admin 身分檢視</option></select><button class="btn" type="button" onclick="clearSimulatedMemberV807()" hidden>結束模擬</button>';
    userArea.insertAdjacentElement('beforeend',box);
    userIcon.classList.add('simulateTriggerV808');
    userIcon.setAttribute('role','button');
    userIcon.setAttribute('tabindex','0');
    userIcon.setAttribute('title','模擬身分');
    userIcon.addEventListener('click',event=>{event.stopPropagation();box.classList.toggle('show')});
    userIcon.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();box.classList.toggle('show')}
    });
    box.addEventListener('click',event=>event.stopPropagation());
    document.addEventListener('click',event=>{if(!event.target.closest('.topUserArea'))box.classList.remove('show')});
    document.getElementById('simulateMemberSelectV807').addEventListener('change',event=>{setSimulatedMemberV807(event.target.value);box.classList.remove('show')});
  }
  function refreshSimulationToolbarV807(){
    ensureSimulationToolbarV807();
    const box=document.getElementById('simulateToolbarV807'),select=document.getElementById('simulateMemberSelectV807');
    if(!box||!select)return;
    box.hidden=!isSystemAdmin;
    const options=D.members.filter(m=>m.active!==false&&memberGoogleEmail(m)).map(m=>`<option value="${escAttr(m.id)}">${esc(memberDisplayName(m)||m.name||m.id)}</option>`).join('');
    select.innerHTML='<option value="">以 admin 身分檢視</option>'+options;
    select.value=D.members.some(m=>String(m.id)===String(simulateMemberIdV807))?simulateMemberIdV807:'';
    box.querySelector('button').hidden=!select.value;
    document.querySelector('.topUserIcon')?.classList.toggle('isSimulatingV808',!!select.value);
  }
  function ensureSimulationBannerV807(){
    let banner=document.getElementById('simulateBannerV807');
    if(!banner){
      banner=document.createElement('div');
      banner.id='simulateBannerV807';
      banner.className='simulateBannerV807';
      const main=document.querySelector('.main');
      main?.insertAdjacentElement('afterbegin',banner);
    }
    const member=simMemberV807();
    banner.hidden=!member;
    if(member)banner.innerHTML='<b>目前以 '+esc(memberDisplayName(member)||member.name||member.id)+' 身分檢視</b><span>模擬模式僅供檢視，新增、刪除、儲存與匯出已停用。</span><button class="btn" type="button" onclick="clearSimulatedMemberV807()">結束模擬</button>';
  }
  async function chooseVisibleSurveyForSimulationV807(){
    if(!isSimulatingV807())return;
    const visible=D.surveys.filter(s=>canSeeSurveyV807(s));
    if(!visible.some(s=>s.id===activeSurveyId)){
      activeSurveyId=(visible.find(s=>!isArchivedV807(s))||visible[0])?.id||null;
      await loadSurveyData();
    }
  }
  async function resetSurveyForSimulationV809(){
    if(isSimulatingV807()){
      const visible=D.surveys.filter(s=>canSeeSurveyV807(s));
      const owned=visible.find(s=>isCreatorV807(s)&&!isArchivedV807(s));
      const shared=visible.find(s=>assignmentForSurveyV807(s.id)&&!isArchivedV807(s));
      const archived=visible.find(s=>isArchivedV807(s));
      activeSurveyId=(owned||shared||archived||visible[0])?.id||null;
      surveyListScopeV807=owned?'owned':shared?'shared':archived?'archived':'owned';
      await loadSurveyData();
      return;
    }
    chooseActiveSurvey();
    await loadSurveyData();
  }
  function restoreAdminVisibilityAfterSimulationV1005(){
    document.querySelectorAll('.nav[data-access="system"],.systemOnly:not(#simulateToolbarV807)').forEach(x=>x.hidden=false);
    document.querySelectorAll('#surveyP .manageIntro>button,#surveyEditor button,#accessP button,#memP button,#dateP button,#restP button,#costP button,#finalP button,#respP button[onclick*="delete"],.nav[onclick*="exportExcel"]').forEach(btn=>btn.hidden=false);
  }
  async function setSimulatedMemberV807(id){
    const wasSimulating=isSimulatingV807();
    simulateMemberIdV807=id||'';
    const select=document.getElementById('simulateMemberSelectV807');
    if(!simulateMemberIdV807&&select)select.value='';
    if(wasSimulating&&!simulateMemberIdV807)restoreAdminVisibilityAfterSimulationV1005();
    await ensureAllManagersV807();
    await resetSurveyForSimulationV809();
    renderAdmin();
    renderSurveyListV807();
    applyAccessUI();
    toast(simulateMemberIdV807?'已切換模擬身分':'已回到 admin 身分');
  }
  async function clearSimulatedMemberV807(){await setSimulatedMemberV807('')}

  const currentUserDisplayTextBeforeV807=currentUserDisplayText;
  currentUserDisplayText=function(){
    const member=simMemberV807();
    return member?memberDisplayName(member):currentUserDisplayTextBeforeV807();
  };

  const loadAllBeforeV807=loadAll;
  loadAll=async function(){
    await loadAllBeforeV807();
    await ensureAllManagersV807();
    await chooseVisibleSurveyForSimulationV807();
  };

  const canManageBeforeV807=canManage;
  canManage=function(){
    if(isSimulatingV807())return canManageSurveyV807(activeSurvey());
    return canManageBeforeV807();
  };

  const applyAccessUIBeforeV807=applyAccessUI;
  applyAccessUI=function(){
    if(!isSimulatingV807())restoreAdminVisibilityAfterSimulationV1005();
    applyAccessUIBeforeV807();
    refreshSimulationToolbarV807();
    ensureSimulationBannerV807();
    if(isSimulatingV807()){
      if(adminRole)adminRole.textContent=roleTextV807(activeSurvey()||{})+'（模擬）';
      document.querySelectorAll('.nav[data-access="system"],.systemOnly:not(#simulateToolbarV807)').forEach(x=>x.hidden=true);
      const manage=canManageSurveyV807(activeSurvey());
      document.querySelectorAll('.nav[data-access="manager"]').forEach(x=>x.hidden=!manage);
      document.querySelectorAll('#surveyP .manageIntro>button,#surveyEditor button,#accessP button,#memP button,#dateP button,#restP button,#costP button,#finalP button,#respP button[onclick*="delete"],.nav[onclick*="exportExcel"]').forEach(btn=>btn.hidden=true);
    }
  };

  const renderSurveySelectBeforeV807=renderSurveySelect;
  renderSurveySelect=function(){
    if(!isSimulatingV807())return renderSurveySelectBeforeV807();
    const visible=D.surveys.filter(s=>canSeeSurveyV807(s)&&!isArchivedV807(s));
    const current=D.surveys.find(s=>s.id===activeSurveyId);
    const list=current&&canSeeSurveyV807(current)&&!visible.some(s=>s.id===current.id)?[current,...visible]:visible;
    activeSurveySelect.innerHTML='<option value="">請選擇活動</option>'+list.map(s=>`<option value="${escAttr(s.id)}" ${s.id===activeSurveyId?'selected':''}>${esc(s.title||s.id)}${isArchivedV807(s)?'（已結案）':''}</option>`).join('');
  };

  const setActiveSurveyBeforeV807=setActiveSurvey;
  setActiveSurvey=async function(id){
    if(isSimulatingV807()&&id&&!D.surveys.some(s=>s.id===id&&canSeeSurveyV807(s)))return alert('此模擬身分沒有該活動權限');
    return setActiveSurveyBeforeV807(id);
  };

  const renderAdminBeforeV807=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV807();
    renderSurveyListV807();
    refreshSimulationToolbarV807();
    ensureSimulationBannerV807();
    applyAccessUI();
  };

  const renderSurveyPanelBeforeV807=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV807();
    renderSurveyListV807();
  };

  const panelBeforeV809=panel;
  panel=function(id,b){
    const result=panelBeforeV809(id,b);
    if(id==='surveyP')renderSurveyListV807();
    if(isSimulatingV807())applyAccessUI();
    return result;
  };
  window.panel=panel;

  const writeBlockedV807=()=>alert('目前為模擬身分檢視模式，不能新增、刪除、儲存或匯出資料。請結束模擬後再操作。');
  const blockWhenSimV807=fn=>function(...args){if(isSimulatingV807())return writeBlockedV807();return fn.apply(this,args)};
  [
    'startNewSurvey','saveSurvey','duplicateSurveyPrompt','showDuplicateSurveyModalV719','archiveSurveyV775','showDeleteSurveyModalV776',
    'saveSurveyManager','removeSurveyManager','saveDateV731Direct','saveDateV760Direct','saveRestaurant','saveBudgetSetting',
    'saveFinal','saveMember','toggleMember','toggleMemberFill','toggleMemberBudget','saveResponseEdit','deleteResponse','delDoc',
    'importMembers','exportExcel'
  ].forEach(name=>{
    if(typeof window[name]==='function')window[name]=blockWhenSimV807(window[name]);
    try{if(typeof eval(name)==='function')eval(name+'=window["'+name+'"]')}catch(e){}
  });

  function setSurveyScopeV807(scope){surveyListScopeV807=scope;renderSurveyListV807()}
  window.setSurveyScopeV807=setSurveyScopeV807;
  window.setSimulatedMemberV807=setSimulatedMemberV807;
  window.clearSimulatedMemberV807=clearSimulatedMemberV807;
  window.renderSurveyListV807=renderSurveyListV807;
})();

// ===== finalizer：活動列表單一來源 =====
(function(){
  let surveyListScopeV900='owned';
  let allSurveyManagersV900=[];

  function simulatedMemberIdV900(){
    return document.getElementById('simulateMemberSelectV807')?.value||'';
  }
  function isSimulatingV900(){
    return !!(isSystemAdmin&&simulatedMemberIdV900());
  }
  function simMemberV900(){
    const id=simulatedMemberIdV900();
    return id?D.members.find(m=>String(m.id)===String(id))||null:null;
  }
  function effectiveEmailV900(){
    const member=simMemberV900();
    return normalizeEmail(member?memberGoogleEmail(member):(currentUser?.email||''));
  }
  function effectiveUidV900(){
    return isSimulatingV900()?'':String(currentUser?.uid||'');
  }
  function isArchivedV900(s){
    return typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s?.status==='archived'||s?.archived===true);
  }
  function surveyCreatorEmailV900(s){
    return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'');
  }
  function isCreatorV900(s){
    const email=effectiveEmailV900(),uid=effectiveUidV900();
    return !!s&&((!!email&&surveyCreatorEmailV900(s)===email)||(!!uid&&String(s?.createdByUid||'')===uid));
  }
  function managerRowsV900(){
    return isSimulatingV900()?allSurveyManagersV900:(surveyAssignments||[]);
  }
  function assignmentForSurveyV900(id){
    const email=effectiveEmailV900();
    return managerRowsV900().find(a=>
      a&&
      a.enabled!==false&&
      String(a.surveyId||'')===String(id||'')&&
      (!email||normalizeEmail(a.email)===email)
    )||null;
  }
  function canSeeSurveyV900(s){
    return !!s&&(isSystemAdmin&&!isSimulatingV900()||isCreatorV900(s)||!!assignmentForSurveyV900(s.id));
  }
  function canManageSurveyV900(s){
    if(!s)return false;
    if(isSimulatingV900())return false;
    if(isSystemAdmin)return true;
    if(isCreatorV900(s))return true;
    return assignmentForSurveyV900(s.id)?.role==='manager';
  }
  function canDeleteSurveyV900(s){
    if(!s||isSimulatingV900())return false;
    return isSystemAdmin||isCreatorV900(s);
  }
  function creatorLabelV900(s){
    return String(s?.createdByName||s?.creatorName||s?.ownerName||'').trim()||(surveyCreatorEmailV900(s)||'未記錄');
  }
  function roleTextV900(s){
    if(isSystemAdmin&&!isSimulatingV900()){
      if(isCreatorV900(s))return '發起人／系統管理員';
      const assignment=assignmentForSurveyV900(s?.id);
      if(assignment?.role==='manager')return '活動管理者／系統管理員';
      if(assignment?.role==='viewer')return '結果檢視者／系統管理員';
      return '系統管理員';
    }
    if(isCreatorV900(s))return '發起人';
    return assignmentForSurveyV900(s?.id)?.role==='manager'?'活動管理者':'結果檢視者';
  }
  function allowedScopesV900(){
    const scopes=['owned','shared','archived'];
    if(isSystemAdmin&&!isSimulatingV900())scopes.push('all');
    return scopes;
  }
  function surveysForScopeV900(scope){
    const email=effectiveEmailV900();
    if(scope==='all')return (isSystemAdmin&&!isSimulatingV900())?D.surveys.slice():[];
    if(scope==='archived')return D.surveys.filter(s=>isArchivedV900(s)&&canSeeSurveyV900(s));
    if(scope==='owned')return D.surveys.filter(s=>isCreatorV900(s)&&!isArchivedV900(s));
    return D.surveys.filter(s=>
      !isArchivedV900(s)&&
      assignmentForSurveyV900(s.id)&&
      surveyCreatorEmailV900(s)!==email
    );
  }
  function countV900(scope){
    return surveysForScopeV900(scope).length;
  }
  function ensureScopeV900(){
    const allowed=allowedScopesV900();
    if(!allowed.includes(surveyListScopeV900))surveyListScopeV900='owned';
  }
  function visibleSurveysV900(){
    ensureScopeV900();
    return surveysForScopeV900(surveyListScopeV900);
  }
  function tabsHtmlV900(){
    ensureScopeV900();
    const tabs=[
      ['owned','我發起的活動',countV900('owned')],
      ['shared','被分享的活動',countV900('shared')],
      ['archived','已結案的活動',countV900('archived')]
    ];
    if(isSystemAdmin&&!isSimulatingV900())tabs.push(['all','系統內所有活動',countV900('all')]);
    return `<div class="surveyScopeTabsV793 surveyScopeTabsV900">${tabs.map(([key,label,count])=>`<button type="button" class="${surveyListScopeV900===key?'active':''}" onclick="setSurveyScopeV900('${key}')">${label}<span>${count}</span></button>`).join('')}</div>`;
  }
  function dateRangeHtmlV900(s){
    const state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
    const start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
    const end=s.deadline?formatDeadline(s.deadline):'未設定';
    return {state,html:`<small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}`};
  }
  function makeBtnV900(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }
  async function viewSurveyV900(id){
    const s=D.surveys.find(x=>x.id===id);
    if(!s)return alert('找不到活動資料，請重新整理後再試一次');
    if(isArchivedV900(s)&&typeof viewArchivedSurveyV781==='function')return viewArchivedSurveyV781(id);
    await setActiveSurvey(id);
    const resultNav=document.querySelector('.nav[onclick*="respP"]');
    if(resultNav)panel('respP',resultNav);
  }
  function rowsHtmlV900(){
    const rows=visibleSurveysV900();
    if(isSystemAdmin&&!isSimulatingV900()&&surveyListScopeV900==='all'){
      return table(['活動','狀態','建立者','開放／截止時間','操作'],rows.map(s=>{
        const current=s.id===activeSurveyId,range=dateRangeHtmlV900(s);
        return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(creatorLabelV900(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV900"></td></tr>`;
      }));
    }
    return table(['活動','狀態','我的角色','建立者','開放／截止時間','操作'],rows.map(s=>{
      const current=s.id===activeSurveyId,range=dateRangeHtmlV900(s);
      return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${range.state.state==='open'?'green':range.state.state==='upcoming'?'blue':'gray'}">${esc(range.state.label.replace('問卷',''))}</span></td><td>${esc(roleTextV900(s))}</td><td>${esc(creatorLabelV900(s))}</td><td>${range.html}</td><td class="operationCell surveyActionCellV900"></td></tr>`;
    }));
  }
  function applyActionsV900(){
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>String(x.id)===String(row.dataset.surveyId));
      const ops=row.querySelector('.operationCell');
      if(!s||!ops)return;
      const archived=isArchivedV900(s),current=s.id===activeSurveyId,canManageRow=canManageSurveyV900(s);
      const group=document.createElement('div');
      group.className='surveyActionGroupV900';
      group.appendChild(makeBtnV900(canManageRow&&!isSimulatingV900()?'編輯':'查看','btn',()=>canManageRow&&!isSimulatingV900()?editSurvey(s.id):viewSurveyV900(s.id)));
      if(canManageRow)group.appendChild(makeBtnV900('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(canManageRow)group.appendChild(makeBtnV900(archived?'恢復':'結案',archived?'btn surveyRestoreActionV1021':'btn surveyArchiveActionV1021',()=>window.archiveSurveyV775(s.id,!archived)));
      if(canDeleteSurveyV900(s))group.appendChild(makeBtnV900('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV900('設目前','btn surveyCurrentActionV1021 currentActionV787',()=>setActiveSurvey(s.id)));
      ops.innerHTML='';
      ops.appendChild(group);
    });
  }
  function renderSurveyListV900(){
    document.getElementById('surveyArchiveTabsV775')?.remove();
    document.getElementById('surveyArchiveEmptyV775')?.remove();
    const box=document.getElementById('surveyTable');
    if(!box)return;
    box.classList.toggle('surveyTableSystemV1021',isSystemAdmin&&!isSimulatingV900()&&surveyListScopeV900==='all');
    box.innerHTML=tabsHtmlV900()+rowsHtmlV900();
    applyActionsV900();
  }
  async function ensureAllManagersV900(){
    if(!isSystemAdmin)return;
    try{allSurveyManagersV900=await safeGetCollection('surveyManagers')}
    catch(e){console.warn('v9 survey managers preload failed',e);allSurveyManagersV900=[]}
  }

  const loadAllBeforeV900=loadAll;
  loadAll=async function(){
    await loadAllBeforeV900();
    await ensureAllManagersV900();
  };

  const renderAdminBeforeV900=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV900();
    renderSurveyListV900();
  };

  const renderSurveyPanelBeforeV900=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV900();
    renderSurveyListV900();
  };

  const panelBeforeV900=panel;
  panel=function(id,b){
    const result=panelBeforeV900(id,b);
    if(id==='surveyP')renderSurveyListV900();
    return result;
  };
  window.panel=panel;

  function setSurveyScopeV900(scope){
    surveyListScopeV900=scope;
    renderSurveyListV900();
  }
  window.setSurveyScopeV900=setSurveyScopeV900;
  window.renderSurveyListV900=renderSurveyListV900;
})();

// ===== finalizer：餐廳價格設定區塊視覺整理 =====
(function(){

  function polishRestaurantPricingV903(){
    const box=document.querySelector('.restaurantPricingBox');
    const mode=document.getElementById('restaurantPricingMode');
    const priceField=newPrice?.closest('.field');
    if(!box||!mode||!priceField)return;

    box.classList.add('restaurantPricingBoxV903');

    if(!box.querySelector('.restaurantPricingHeaderV903')){
      box.insertAdjacentHTML('afterbegin','<div class="restaurantPricingHeaderV903"><div><h4>價格設定</h4><p>依餐廳報價方式填寫，系統會在費用試算與最終決議中自動計算總額。</p></div></div>');
    }

    const modeField=mode.closest('.field');
    let core=box.querySelector('.restaurantPricingCoreV903');
    if(!core){
      core=document.createElement('div');
      core.className='restaurantPricingCoreV903';
      box.querySelector('.restaurantPricingHeaderV903')?.insertAdjacentElement('afterend',core);
    }
    if(modeField&&!core.contains(modeField))core.appendChild(modeField);
    if(!core.contains(priceField))core.appendChild(priceField);
    priceField.classList.add('restaurantPriceFieldV903');
    modeField?.classList.add('restaurantModeFieldV903');

    const tableFields=document.getElementById('restaurantTableFields');
    if(tableFields){
      tableFields.classList.add('restaurantTableFieldsV903');
      if(tableFields.previousElementSibling!==core)core.insertAdjacentElement('afterend',tableFields);
    }

    const serviceField=document.getElementById('restaurantServiceRate')?.closest('.field');
    const fixedField=document.getElementById('restaurantFixedFee')?.closest('.field');
    if(serviceField&&fixedField){
      let extras=box.querySelector('.restaurantPricingExtrasV903');
      if(!extras){
        extras=document.createElement('div');
        extras.className='restaurantPricingExtrasV903';
        const anchor=tableFields||core;
        anchor.insertAdjacentElement('afterend',extras);
      }
      if(!extras.contains(serviceField))extras.appendChild(serviceField);
      if(!extras.contains(fixedField))extras.appendChild(fixedField);
    }
  }

  const installRestaurantPricingBeforeV903=window.installRestaurantPricingV712||installRestaurantPricingV712;
  if(typeof installRestaurantPricingBeforeV903==='function'){
    installRestaurantPricingV712=function(){
      installRestaurantPricingBeforeV903();
      polishRestaurantPricingV903();
    };
    window.installRestaurantPricingV712=installRestaurantPricingV712;
  }

  const toggleRestaurantPricingBeforeV903=window.toggleRestaurantPricingV712||toggleRestaurantPricingV712;
  if(typeof toggleRestaurantPricingBeforeV903==='function'){
    toggleRestaurantPricingV712=function(){
      toggleRestaurantPricingBeforeV903();
      polishRestaurantPricingV903();
    };
    window.toggleRestaurantPricingV712=toggleRestaurantPricingV712;
  }

  const renderRestPanelBeforeV903=renderRestPanel;
  renderRestPanel=function(){
    renderRestPanelBeforeV903();
    polishRestaurantPricingV903();
  };

  const renderAdminBeforeV903=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV903();
    polishRestaurantPricingV903();
  };

  document.addEventListener('DOMContentLoaded',polishRestaurantPricingV903);
  window.polishRestaurantPricingV903=polishRestaurantPricingV903;
})();


// ===== 操作防護、發起人管理與未填名單分頁匯出 =====
(function(){
  const dirtyPanelsV908=new Set();
  let dialogResolveV908=null,dialogOpenerV908=null,dialogBusyV908=false;

  function ensureDialogV908(){
    let mask=document.getElementById('adminDialogMaskV908');
    if(mask)return mask;
    mask=document.createElement('div');
    mask.id='adminDialogMaskV908';
    mask.className='adminDialogMaskV908';
    mask.hidden=true;
    mask.innerHTML='<section class="adminDialogV908" role="dialog" aria-modal="true" aria-labelledby="adminDialogTitleV908"><header><div><h2 id="adminDialogTitleV908"></h2><p id="adminDialogLeadV908"></p></div><button id="adminDialogCloseV908" class="adminDialogCloseV908" type="button" aria-label="關閉">×</button></header><div id="adminDialogBodyV908" class="adminDialogBodyV908"></div><div id="adminDialogErrorV908" class="adminDialogErrorV908" role="status" aria-live="polite"></div><footer><button id="adminDialogCancelV908" class="btn" type="button">取消</button><button id="adminDialogConfirmV908" class="btn primary" type="button">確定</button></footer></section>';
    document.body.appendChild(mask);
    mask.addEventListener('click',event=>{if(event.target===mask&&mask.dataset.backdrop==='true')closeDialogV908(false)});
    mask.querySelector('#adminDialogCloseV908').addEventListener('click',()=>closeDialogV908(false));
    mask.querySelector('#adminDialogCancelV908').addEventListener('click',()=>closeDialogV908(false));
    mask.querySelector('#adminDialogConfirmV908').addEventListener('click',()=>closeDialogV908(true));
    return mask;
  }
  function openDialogV908(options={}){
    const mask=ensureDialogV908();
    if(!mask.hidden&&dialogResolveV908){dialogResolveV908({ok:false,value:''});dialogResolveV908=null}
    dialogOpenerV908=document.activeElement;
    dialogBusyV908=false;
    mask.dataset.escape=options.escape===false?'false':'true';
    mask.dataset.backdrop=options.backdrop===true?'true':'false';
    mask.dataset.required=options.requiredSelector||'';
    mask.querySelector('#adminDialogTitleV908').textContent=options.title||'確認操作';
    const lead=mask.querySelector('#adminDialogLeadV908');
    lead.textContent=options.message||'';lead.hidden=!options.message;
    mask.querySelector('#adminDialogBodyV908').innerHTML=options.bodyHtml||'';
    mask.querySelector('#adminDialogErrorV908').textContent='';
    const cancel=mask.querySelector('#adminDialogCancelV908'),close=mask.querySelector('#adminDialogCloseV908'),confirm=mask.querySelector('#adminDialogConfirmV908');
    cancel.hidden=options.cancel===false;close.hidden=options.escape===false;
    cancel.textContent=options.cancelText||'取消';confirm.textContent=options.confirmText||'確定';
    confirm.className='btn '+(options.danger?'red':'primary');
    mask.hidden=false;document.body.classList.add('adminModalOpenV908');
    setTimeout(()=>{const focus=mask.querySelector(options.focusSelector||'select,input,textarea,button:not([hidden])');if(focus)focus.focus()},40);
    return new Promise(resolve=>{dialogResolveV908=resolve});
  }
  function closeDialogV908(ok){
    const mask=ensureDialogV908();
    if(dialogBusyV908)return;
    let value='';
    if(ok&&mask.dataset.required){
      const input=mask.querySelector(mask.dataset.required);value=String(input?.value||'').trim();
      if(!value){mask.querySelector('#adminDialogErrorV908').textContent='請先完成必填欄位。';input?.focus();return}
    }
    const resolver=dialogResolveV908;dialogResolveV908=null;mask.hidden=true;document.body.classList.remove('adminModalOpenV908');
    if(resolver)resolver({ok,value});
    if(dialogOpenerV908&&document.contains(dialogOpenerV908))setTimeout(()=>dialogOpenerV908.focus(),30);
  }
  function confirmV908(message,title='確認操作',danger=false){return openDialogV908({title,message,confirmText:danger?'確認刪除':'確定',danger}) .then(result=>result.ok)}
  window.adminConfirmV908=confirmV908;
  const nativeAlertV908=window.alert.bind(window);
  window.alert=function(message){
    try{return openDialogV908({title:'系統提示',message:String(message||''),cancel:false,confirmText:'知道了',backdrop:true})}
    catch(e){return nativeAlertV908(message)}
  };
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const mask=document.getElementById('adminDialogMaskV908');
    if(mask&&!mask.hidden){event.preventDefault();event.stopImmediatePropagation();if(mask.dataset.escape!=='false')closeDialogV908(false)}
  },true);

  async function runWithConfirmedNativeV908(action){
    const nativeConfirm=window.confirm;window.confirm=()=>true;
    try{return await action()}finally{window.confirm=nativeConfirm}
  }
  function wrapConfirmedActionV908(name,options){
    let original=window[name];try{if(typeof eval(name)==='function')original=eval(name)}catch(e){}
    if(typeof original!=='function')return;
    const wrapped=async function(...args){
      if(options.when&&!options.when(...args))return original.apply(this,args);
      const message=options.message(...args),ok=await confirmV908(message,options.title||'確認操作',!!options.danger);if(!ok)return;
      return runWithConfirmedNativeV908(()=>original.apply(this,args));
    };
    window[name]=wrapped;try{eval(name+'=window["'+name+'"]')}catch(e){}
  }
  wrapConfirmedActionV908('toggleMember',{when:(id,active)=>!active,title:'停用人員',message:id=>{const member=D.members.find(m=>m.id===id);return '確定停用 '+(member?.name||'這位人員')+'？停用後不會出現在前台名單，但歷史資料會保留。'}});
  wrapConfirmedActionV908('removeSurveyManager',{title:'移除活動權限',danger:true,message:()=> '確定移除此成員的活動權限？'});
  wrapConfirmedActionV908('deleteResponse',{title:'刪除填寫資料',danger:true,message:id=>{const response=D.responses.find(r=>r.id===id);return '確定刪除 '+(response?.departmentName||'')+' '+(response?.memberName||'此同仁')+' 的整筆問卷？刪除後會恢復為未填，且此操作無法復原。'}});
  wrapConfirmedActionV908('archiveSurveyV775',{title:'變更活動狀態',message:(id,archive)=>{const survey=D.surveys.find(s=>s.id===id);return '確定要將「'+(survey?.title||'此活動')+'」'+(archive?'標記為結案':'恢復為進行中')+'？'}});
  wrapConfirmedActionV908('saveFinal',{when:()=>!!finalDate?.value,title:'確認最終決議',message:()=>{const date=D.dates.find(d=>d.id===finalDate.value),count=attendeeResponsesForDate(finalDate.value).length;return '確認將「'+(date?.label||'所選日期')+'」設為最終日期？目前共有 '+count+' 人可出席。'}});
  wrapConfirmedActionV908('delDoc',{title:'確認刪除',danger:true,message:collection=>collection==='surveyDates'?'確定刪除這筆日期？此操作無法復原。':collection==='restaurants'?'確定刪除這筆餐廳資料？此操作無法復原。':collection==='members'?'確定刪除這筆人員資料？建議優先使用停用以保留歷史資料。':'確定刪除這筆資料？此操作無法復原。'});
  wrapConfirmedActionV908('removeFinalAttendanceAdjustmentV783',{title:'刪除最終出席調整',danger:true,message:()=> '確定刪除這筆最終出席調整？'});
  wrapConfirmedActionV908('removeFinalAttendanceAdjustmentV782',{title:'刪除最終出席調整',danger:true,message:()=> '確定刪除這筆最終出席調整？'});

  const dirtySelectorsV908={
    surveyP:'#surveyEditor input,#surveyEditor select,#surveyEditor textarea',
    dateP:'#newDate,#newDateSort',
    restP:'#newRest,#newRestSort,#newAddr,#newMap,#newPrice,#newCuisine,#restaurantPricingMode,#restaurantServiceRate,#restaurantFixedFee,#restaurantTableSeats,#restaurantMinTables',
    sysMemP:'#memberEditor input,#memberEditor select,#memberEditor textarea',
    finalP:'#finalDate,#finalRest,#finalNote,#finalLock,#finalHomeAnnouncement'
  };
  function markDirtyV908(panelId){
    if(!dirtySelectorsV908[panelId])return;
    dirtyPanelsV908.add(panelId);
    document.getElementById(panelId)?.classList.add('hasUnsavedV908');
    if(panelId==='surveyP'){surveyFormDirty=true;updateSurveyDirtyState?.()}
  }
  function clearDirtyV908(panelId){
    dirtyPanelsV908.delete(panelId);document.getElementById(panelId)?.classList.remove('hasUnsavedV908');
    if(panelId==='surveyP'){surveyFormDirty=false;updateSurveyDirtyState?.()}
  }
  function activePanelIdV908(){return document.querySelector('.panel.active')?.id||''}
  function panelDirtyV908(panelId){return dirtyPanelsV908.has(panelId)||(panelId==='surveyP'&&surveyFormDirty)}
  function anyDirtyV908(){return [...dirtyPanelsV908].some(panelDirtyV908)||surveyFormDirty}
  document.addEventListener('input',event=>{
    const panel=event.target.closest?.('.panel');if(!panel||!dirtySelectorsV908[panel.id])return;
    if(event.target.matches(dirtySelectorsV908[panel.id]))markDirtyV908(panel.id);
  },true);
  document.addEventListener('change',event=>{
    const panel=event.target.closest?.('.panel');if(!panel||!dirtySelectorsV908[panel.id])return;
    if(event.target.matches(dirtySelectorsV908[panel.id]))markDirtyV908(panel.id);
  },true);
  window.addEventListener('beforeunload',event=>{if(anyDirtyV908()){event.preventDefault();event.returnValue=''}});
  async function discardPanelV908(panelId){
    if(!panelDirtyV908(panelId))return true;
    const ok=await confirmV908('目前內容尚未儲存，確定要放棄變更嗎？','尚未儲存的變更');
    if(ok)clearDirtyV908(panelId);
    return ok;
  }

  const panelBeforeV908=panel;
  panel=function(id,b){
    const current=activePanelIdV908();
    if(current&&current!==id&&panelDirtyV908(current)){
      discardPanelV908(current).then(ok=>{if(ok){panelBeforeV908(id,b);setTimeout(decorateCreatorButtonsV908,0)}});
      return;
    }
    const result=panelBeforeV908(id,b);setTimeout(decorateCreatorButtonsV908,0);return result;
  };
  window.panel=panel;

  const setActiveSurveyBeforeV908=setActiveSurvey;
  setActiveSurvey=async function(id){
    const current=activePanelIdV908();
    if(current&&panelDirtyV908(current)&&!(current==='surveyP'&&String(editingSurveyId||'')===String(id||''))){
      const ok=await discardPanelV908(current);
      if(!ok){if(activeSurveySelect)activeSurveySelect.value=activeSurveyId||'';return}
    }
    return setActiveSurveyBeforeV908(id);
  };
  window.setActiveSurvey=setActiveSurvey;

  const startNewSurveyBeforeV908=startNewSurvey;
  startNewSurvey=function(){
    const current=activePanelIdV908();
    if(panelDirtyV908(current))return discardPanelV908(current).then(ok=>{if(ok){surveyFormDirty=false;startNewSurveyBeforeV908()}});
    return startNewSurveyBeforeV908();
  };
  window.startNewSurvey=startNewSurvey;
  const editSurveyBeforeV908=editSurvey;
  editSurvey=function(id){
    if(surveyFormMode==='edit'&&String(editingSurveyId)===String(id))return;
    const current=activePanelIdV908();
    if(panelDirtyV908(current))return discardPanelV908(current).then(ok=>{if(ok){surveyFormDirty=false;editSurveyBeforeV908(id)}});
    return editSurveyBeforeV908(id);
  };
  window.editSurvey=editSurvey;
  const cancelSurveyEditBeforeV908=cancelSurveyEdit;
  cancelSurveyEdit=function(){
    if(panelDirtyV908('surveyP'))return discardPanelV908('surveyP').then(ok=>{if(ok){surveyFormDirty=false;cancelSurveyEditBeforeV908()}});
    return cancelSurveyEditBeforeV908();
  };
  window.cancelSurveyEdit=cancelSurveyEdit;

  function wrapSaveV908(name,panelId,success){
    let original=window[name];
    try{if(typeof eval(name)==='function')original=eval(name)}catch(e){}
    if(typeof original!=='function')return;
    const wrapped=async function(...args){const result=await original.apply(this,args);if(success())clearDirtyV908(panelId);return result};
    window[name]=wrapped;try{eval(name+'=window["'+name+'"]')}catch(e){}
  }
  wrapSaveV908('saveSurvey','surveyP',()=>surveyFormMode==='view');
  wrapSaveV908('saveDateV760Direct','dateP',()=>!editingDateId&&!String(newDate?.value||'').trim());
  if(typeof window.saveDateV760Direct==='function'){window.saveDate=window.saveDateV731Direct=window.saveDateV760Direct}
  wrapSaveV908('saveRestaurant','restP',()=>!editingRestaurantId&&!String(newRest?.value||'').trim());
  wrapSaveV908('saveMember','sysMemP',()=>memberFormMode==='view');
  wrapSaveV908('saveFinal','finalP',()=>!!D.final);

  function creatorEmailV908(s){return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'')}
  function creatorNameV908(s){return String(s?.createdByName||s?.creatorName||s?.ownerName||creatorEmailV908(s)||'未記錄').trim()}
  function creatorOptionsV908(current){
    return D.members.filter(m=>m.active!==false&&memberGoogleEmail(m)).map(m=>{const email=memberGoogleEmail(m),label=[m.department||m.departmentName||'',m.name||''].filter(Boolean).join(' ');return '<option value="'+escAttr(email)+'" '+(email===current?'selected':'')+'>'+esc(label||email)+'</option>'}).join('');
  }
  async function changeCreatorV908(surveyId){
    if(!isSystemAdmin||typeof isSimulatingV900==='function'&&isSimulatingV900())return alert('只有系統管理員可以變更活動發起人');
    const survey=D.surveys.find(s=>String(s.id)===String(surveyId));if(!survey)return alert('找不到活動資料');
    const result=await openDialogV908({title:'變更活動發起人',message:'活動：'+(survey.title||survey.id),bodyHtml:'<label class="adminDialogFieldV908"><span>新發起人</span><select id="creatorSelectV908"><option value="">請選擇成員</option>'+creatorOptionsV908(creatorEmailV908(survey))+'</select><small>原發起人會保留活動管理者權限；新發起人不會重複出現在分享名單。</small></label>',requiredSelector:'#creatorSelectV908',focusSelector:'#creatorSelectV908',confirmText:'儲存'});
    if(!result.ok)return;
    const email=result.value,member=D.members.find(m=>memberGoogleEmail(m)===email);if(!member)return alert('找不到所選成員的人員資料');
    const oldEmail=creatorEmailV908(survey),displayName=[member.department||member.departmentName||'',member.name||''].filter(Boolean).join(' ')||member.name||email;
    dialogBusyV908=true;
    try{
      const update={createdByUid:firebase.firestore.FieldValue.delete(),createdByEmail:email,createdByName:displayName,createdByRole:'manager',updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedByEmail:normalizeEmail(currentUser?.email||''),updatedByName:currentUserDisplayText?.()||currentUser?.displayName||currentUser?.email||''};
      await doc('surveys',surveyId).set(update,{merge:true});
      const newManagerId=managerDocId(surveyId,email),newManager=await doc('surveyManagers',newManagerId).get();if(newManager.exists)await doc('surveyManagers',newManagerId).delete();
      if(oldEmail&&oldEmail!==email){const oldManagerId=managerDocId(surveyId,oldEmail);await doc('surveyManagers',oldManagerId).set({surveyId,email:oldEmail,role:'manager',enabled:true,source:'formerCreator',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
      if(typeof writeAuditV711==='function')await writeAuditV711('變更發起人','活動',surveyId,'活動發起人由「'+creatorNameV908(survey)+'」變更為「'+displayName+'」',surveyId);
      await loadAll();if(String(activeSurveyId)===String(surveyId))await loadSurveyData();renderAdmin();toast('活動發起人已更新');
    }catch(e){console.error('change creator v9.08 failed',e);alert('活動發起人更新失敗，請確認 Firestore 規則已部署')}
    finally{dialogBusyV908=false;decorateCreatorButtonsV908()}
  }
  function decorateCreatorButtonsV908(){
    if(!isSystemAdmin||document.getElementById('simulateMemberSelectV807')?.value)return;
    const tableBox=document.getElementById('surveyTable'),table=tableBox?.querySelector('table');if(!table)return;
    const headers=[...table.querySelectorAll('thead th')],creatorIndex=headers.findIndex(th=>th.textContent.trim()==='建立者');if(creatorIndex<0)return;
    table.querySelectorAll('tbody tr[data-survey-id]').forEach(row=>{
      const survey=D.surveys.find(s=>String(s.id)===String(row.dataset.surveyId)),cell=row.children[creatorIndex];if(!survey||!cell||cell.querySelector('.creatorButtonV908'))return;
      const button=document.createElement('button');button.type='button';button.className='creatorButtonV908';button.textContent=creatorNameV908(survey);button.title='變更活動發起人';button.addEventListener('click',()=>changeCreatorV908(survey.id));cell.textContent='';cell.appendChild(button);
    });
  }
  const renderAdminBeforeV908=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeV908();setTimeout(decorateCreatorButtonsV908,0);return result};
  window.renderAdmin=renderAdmin;

  function safeSheetNameV908(name,used){
    let base=String(name||'未分類').replace(/[\\/?*\[\]:]/g,'_').slice(0,27)||'未分類',candidate='未填-'+base,index=2;
    candidate=candidate.slice(0,31);while(used.has(candidate)){candidate=('未填-'+base.slice(0,23)+'-'+index++).slice(0,31)}used.add(candidate);return candidate;
  }
  const exportExcelBeforeV908=exportExcel;
  exportExcel=function(){
    if(!window.XLSX)return exportExcelBeforeV908();
    const originalWrite=XLSX.writeFile;
    XLSX.writeFile=function(workbook,filename){
      const used=new Set(workbook.SheetNames||[]),missing=missingMembers(),groups=new Map();
      missing.forEach(member=>{const dep=member.department||member.departmentName||'未分類';if(!groups.has(dep))groups.set(dep,[]);groups.get(dep).push({'部門':dep,'姓名':member.name||'','員編':member.employeeNo||member.empNo||''})});
      groups.forEach((rows,department)=>{const name=safeSheetNameV908(department,used);XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet(rows),name)});
      return originalWrite.call(XLSX,workbook,filename);
    };
    try{return exportExcelBeforeV908()}finally{XLSX.writeFile=originalWrite}
  };
  window.exportExcel=exportExcel;
  window.changeCreatorV908=changeCreatorV908;
})();

// ===== 發起人入口重繪補強與權限防重複 =====
(function(){
  let creatorTableObserverV910=null,observedSurveyTableV910=null;

  function surveyCreatorEmailV910(survey){
    return normalizeEmail(survey?.createdByEmail||survey?.creatorEmail||survey?.ownerEmail||'');
  }
  function surveyCreatorNameV910(survey){
    const email=surveyCreatorEmailV910(survey),member=D.members.find(m=>memberGoogleEmail(m)===email);
    return String(member?memberDisplayName(member):(survey?.createdByName||survey?.creatorName||survey?.ownerName||email||'未記錄')).trim();
  }
  function activeCreatorV910(){
    const survey=activeSurvey();
    return {survey,email:surveyCreatorEmailV910(survey),name:surveyCreatorNameV910(survey)};
  }
  function creatorNoticeTextV910(){
    const creator=activeCreatorV910();
    return creator.name+' 為本案活動發起人，無需重複設定為活動管理者。';
  }

  function decorateCreatorButtonsV910(){
    if(!isSystemAdmin||document.getElementById('simulateMemberSelectV807')?.value)return;
    const table=document.getElementById('surveyTable')?.querySelector('table');
    if(!table)return;
    const headers=[...table.querySelectorAll('thead th')],creatorIndex=headers.findIndex(th=>th.textContent.trim()==='建立者');
    if(creatorIndex<0)return;
    table.querySelectorAll('tbody tr[data-survey-id]').forEach(row=>{
      const survey=D.surveys.find(s=>String(s.id)===String(row.dataset.surveyId)),cell=row.children[creatorIndex];
      if(!survey||!cell)return;
      let button=cell.querySelector('.creatorButtonV908');
      if(!button){
        button=document.createElement('button');button.type='button';button.className='creatorButtonV908';
        const name=document.createElement('span');name.className='creatorNameV910';name.textContent=surveyCreatorNameV910(survey);
        button.appendChild(name);button.addEventListener('click',()=>window.changeCreatorV908?.(survey.id));
        cell.textContent='';cell.appendChild(button);
      }
      button.title='點擊變更活動發起人';button.setAttribute('aria-label','變更活動發起人：'+surveyCreatorNameV910(survey));
    });
  }
  function scheduleCreatorDecorationV910(){
    Promise.resolve().then(decorateCreatorButtonsV910);
    [0,60,180].forEach(delay=>setTimeout(decorateCreatorButtonsV910,delay));
  }
  function observeSurveyTableV910(){
    const box=document.getElementById('surveyTable');if(!box||box===observedSurveyTableV910)return;
    creatorTableObserverV910?.disconnect();observedSurveyTableV910=box;
    creatorTableObserverV910=new MutationObserver(()=>scheduleCreatorDecorationV910());
    creatorTableObserverV910.observe(box,{childList:true,subtree:true});
  }

  function ensureCreatorPermissionNoticeV910(){
    const form=document.querySelector('#accessP .accessForm'),memberField=managerEmail?.closest('div');
    if(!form||!memberField)return null;
    let notice=document.getElementById('creatorPermissionNoticeV910');
    if(!notice){notice=document.createElement('small');notice.id='creatorPermissionNoticeV910';notice.className='creatorPermissionNoticeV910';notice.hidden=true;memberField.appendChild(notice)}
    return notice;
  }
  function permissionSaveButtonV910(){
    return document.querySelector('#accessP .accessForm button[onclick*="saveSurveyManager"]');
  }
  function selectedIsCreatorV910(){
    const selected=normalizeEmail(managerEmail?.value||''),creator=activeCreatorV910().email;
    return !!selected&&!!creator&&selected===creator;
  }
  function syncCreatorPermissionGuardV910(){
    const notice=ensureCreatorPermissionNoticeV910(),button=permissionSaveButtonV910(),blocked=selectedIsCreatorV910();
    if(notice){notice.textContent=blocked?creatorNoticeTextV910():'';notice.hidden=!blocked}
    if(button){button.disabled=blocked;button.setAttribute('aria-disabled',blocked?'true':'false');button.title=blocked?creatorNoticeTextV910():''}
  }

  const renderMemberGoogleOptionsBeforeV910=renderMemberGoogleOptions;
  renderMemberGoogleOptions=function(){const result=renderMemberGoogleOptionsBeforeV910();syncCreatorPermissionGuardV910();return result};
  window.renderMemberGoogleOptions=renderMemberGoogleOptions;

  const renderManagerPanelBeforeV910=renderManagerPanel;
  renderManagerPanel=function(){
    const creatorEmail=activeCreatorV910().email,originalManagers=D.managers;
    if(creatorEmail)D.managers=(originalManagers||[]).filter(manager=>normalizeEmail(manager.email)!==creatorEmail);
    try{return renderManagerPanelBeforeV910()}finally{D.managers=originalManagers;syncCreatorPermissionGuardV910()}
  };
  window.renderManagerPanel=renderManagerPanel;

  const saveSurveyManagerBeforeV910=saveSurveyManager;
  saveSurveyManager=async function(){
    if(selectedIsCreatorV910()){syncCreatorPermissionGuardV910();return alert(creatorNoticeTextV910())}
    return saveSurveyManagerBeforeV910.apply(this,arguments);
  };
  window.saveSurveyManager=saveSurveyManager;

  const removeSurveyManagerBeforeV910=removeSurveyManager;
  removeSurveyManager=async function(id){
    const target=D.managers.find(manager=>String(manager.id)===String(id));
    if(target&&normalizeEmail(target.email)===activeCreatorV910().email)return alert(creatorNoticeTextV910());
    return removeSurveyManagerBeforeV910.apply(this,arguments);
  };
  window.removeSurveyManager=removeSurveyManager;

  const renderAdminBeforeV910=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeV910();observeSurveyTableV910();scheduleCreatorDecorationV910();syncCreatorPermissionGuardV910();return result};
  window.renderAdmin=renderAdmin;

  const renderSurveyPanelBeforeV910=renderSurveyPanel;
  renderSurveyPanel=function(){const result=renderSurveyPanelBeforeV910();observeSurveyTableV910();scheduleCreatorDecorationV910();return result};
  window.renderSurveyPanel=renderSurveyPanel;

  managerEmail?.addEventListener('change',syncCreatorPermissionGuardV910);
  document.addEventListener('DOMContentLoaded',()=>{observeSurveyTableV910();scheduleCreatorDecorationV910();syncCreatorPermissionGuardV910()});
  window.decorateCreatorButtonsV910=decorateCreatorButtonsV910;
  window.syncCreatorPermissionGuardV910=syncCreatorPermissionGuardV910;
})();

// ===== 活動權限啟停與建立者欄簡化 =====
(function(){

  function managerIsCreatorV911(manager){
    const survey=activeSurvey(),creatorEmail=normalizeEmail(survey?.createdByEmail||survey?.creatorEmail||survey?.ownerEmail||'');
    return !!creatorEmail&&normalizeEmail(manager?.email||'')===creatorEmail;
  }
  async function confirmManagerToggleV911(manager,nextEnabled){
    const name=String(manager?.displayName||managerPersonLabel(manager?.email||'')||manager?.email||'此成員').replace(/<[^>]*>/g,'');
    const message='確定要'+(nextEnabled?'啟用':'停用')+' '+name+' 的活動權限？'+(nextEnabled?'啟用後可依原角色進入本活動。':'停用後將無法進入本活動，但權限紀錄仍會保留。');
    if(typeof window.adminConfirmV908==='function')return window.adminConfirmV908(message,nextEnabled?'啟用活動權限':'停用活動權限');
    return window.confirm(message);
  }
  async function toggleSurveyManagerV911(id,nextEnabled){
    if(!canManage())return alert('此帳號沒有活動權限管理權限');
    const manager=D.managers.find(item=>String(item.id)===String(id));
    if(!manager||String(manager.surveyId)!==String(activeSurveyId))return alert('只能調整目前活動的權限');
    if(managerIsCreatorV911(manager))return alert((manager.displayName||managerPersonLabel(manager.email))+' 為本案活動發起人，無需另行調整活動管理權限。');
    if(!isSystemAdmin&&!nextEnabled&&normalizeEmail(manager.email)===normalizeEmail(currentUser?.email||''))return alert('不可停用自己的活動管理權限，請洽系統管理員或活動發起人處理。');
    const confirmed=await confirmManagerToggleV911(manager,!!nextEnabled);if(!confirmed)return;
    try{
      const before=typeof auditReadDocV760==='function'?await auditReadDocV760('surveyManagers',id):manager;
      await doc('surveyManagers',id).set({enabled:!!nextEnabled,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedByEmail:normalizeEmail(currentUser?.email||'')},{merge:true});
      try{
        const after=typeof auditReadDocV760==='function'?await auditReadDocV760('surveyManagers',id):{...manager,enabled:!!nextEnabled};
        if(typeof writeAuditDetailV760==='function')await writeAuditDetailV760({action:nextEnabled?'啟用':'停用',targetType:'活動權限',targetId:id,targetLabel:manager.email||'',before,after,fields:['enabled'],surveyId:activeSurveyId,summary:(nextEnabled?'啟用 ':'停用 ')+(manager.displayName||manager.email||'活動成員')+' 的活動權限'});
      }catch(auditError){console.warn('活動權限啟停稽核紀錄寫入失敗',auditError)}
      await loadSurveyData();renderAdmin();toast(nextEnabled?'活動權限已啟用':'活動權限已停用');
    }catch(error){console.error('toggle survey manager v9.11 failed',error);alert('活動權限更新失敗，請確認 Firestore 規則已部署後再試一次。')}
  }

  renderManagerPanel=function(){
    if(!managerTable)return;
    renderMemberGoogleOptions();
    const managers=(D.managers||[]).filter(manager=>!managerIsCreatorV911(manager));
    managerTable.innerHTML=table(['部門','姓名','員工編號','權限','狀態','操作'],managers.map(manager=>{
      const enabled=manager.enabled!==false,id=escAttr(manager.id);
      const member=findMemberByGoogleEmail(manager.email);
      const department=String(member?.department||member?.departmentName||'').trim()||'未紀錄';
      const name=String(member?.name||manager?.displayName||'').replace(/<[^>]*>/g,'').trim()||'未紀錄';
      const employeeNo=String(member?.employeeNo||member?.empNo||'').trim()||'未紀錄';
    return `<tr><td>${esc(department)}</td><td><b>${esc(name)}</b></td><td>${esc(employeeNo)}</td><td>${manager.role==='viewer'?'結果檢視者':'活動管理者'}</td><td><span class="badge ${enabled?'green':'gray'}">${enabled?'啟用':'停用'}</span></td><td class="operationCell"><div class="managerActionsV911"><button class="btn ${enabled?'stateActionV972':'green'}" type="button" onclick="toggleSurveyManagerV911('${id}',${enabled?'false':'true'})">${enabled?'停用':'啟用'}</button><button class="btn red" type="button" onclick="removeSurveyManager('${id}')">移除</button></div></td></tr>`;
    }));
    managerTable.querySelector('table')?.classList.add('managerPermissionTableV933');
    window.syncCreatorPermissionGuardV910?.();
  };
  window.renderManagerPanel=renderManagerPanel;
  window.toggleSurveyManagerV911=toggleSurveyManagerV911;
})();
