/* 相容層：活動入口、權限、封存、刪除與代填。 */
// ===== 統一活動管理入口與新增活動成功判斷 =====
(function(){
  function emailV797(value){
    return normalizeEmail(value||'');
  }
  function currentEmailV797(){
    return emailV797(currentUser?.email||'');
  }
  function currentScopeV797(){
    const active=document.querySelector('.surveyScopeTabsV793 button.active');
    const text=active?.textContent||'';
    if(text.includes('系統內所有'))return 'all';
    if(text.includes('我參與'))return 'joined';
    return 'owned';
  }
  function forceSurveyScopeTabsV797(scope){
    if(!document.getElementById('surveyP')?.classList.contains('active'))return;
    const tableBox=document.getElementById('surveyTable');
    if(!tableBox||tableBox.querySelector('.surveyScopeTabsV793'))return;
    if(typeof window.setSurveyScopeV793==='function'){
      window.setSurveyScopeV793(scope||currentScopeV797());
    }else if(typeof renderSurveyPanel==='function'){
      renderSurveyPanel();
    }
  }
  function ensureCreatorAssignmentV797(surveyId,creatorEmail,creatorName){
    if(!surveyId||isSystemAdmin)return;
    if(!surveyAssignments.some(a=>a.surveyId===surveyId&&a.enabled!==false)){
      surveyAssignments.push({
        id:'creator__'+surveyId,
        surveyId,
        email:creatorEmail,
        role:'manager',
        enabled:true,
        displayName:creatorName||creatorEmail,
        source:'creator_virtual'
      });
    }
    currentAccessRole='manager';
  }
  async function writeCreatorManagerV797(id,email,name){
    if(!email)return false;
    try{
      await doc('surveyManagers',managerDocId(id,email)).set({
        surveyId:id,
        email,
        role:'manager',
        enabled:true,
        memberId:findMemberByGoogleEmail(email)?.id||'',
        displayName:name||email,
        source:'creator',
        createdByEmail:email,
        createdByName:name||email,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      return true;
    }catch(e){
      console.warn('creator manager write skipped after survey created',e);
      return false;
    }
  }
  async function writeCreateSurveyAuditV797(id,title){
    try{
      if(typeof auditReadDocV760!=='function'||typeof writeAuditDetailV760!=='function')return;
      let after=await auditReadDocV760('surveys',id);
      await writeAuditDetailV760({
        action:'新增',
        targetType:'活動',
        targetId:id,
        targetLabel:after?.title||title,
        before:null,
        after,
        fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments','budgetPerPerson','createdByEmail','createdByName'],
        surveyId:id
      });
    }catch(e){
      console.warn('create survey audit skipped after survey created',e);
    }
  }
  async function reloadAfterCreateV797(id){
    try{
      await loadAll();
      activeSurveyId=id;
      await loadSurveyData();
    }catch(e){
      console.warn('reload after survey create failed',e);
      activeSurveyId=id;
    }
  }

  const panelBeforeV797=panel;
  panel=function(id,b){
    const result=panelBeforeV797(id,b);
    if(id==='surveyP')setTimeout(()=>forceSurveyScopeTabsV797(currentScopeV797()),0);
    return result;
  };
  window.panel=panel;

  const startNewSurveyBeforeV797=startNewSurvey;
  startNewSurvey=function(){
    const result=startNewSurveyBeforeV797();
    setTimeout(()=>forceSurveyScopeTabsV797('owned'),0);
    return result;
  };
  window.startNewSurvey=startNewSurvey;

  const editSurveyBeforeV797=editSurvey;
  editSurvey=function(id){
    const result=editSurveyBeforeV797(id);
    setTimeout(()=>forceSurveyScopeTabsV797(currentScopeV797()),0);
    return result;
  };
  window.editSurvey=editSurvey;

  const saveSurveyBeforeV797=saveSurvey;
  saveSurvey=async function(){
    if(surveyFormMode!=='new')return saveSurveyBeforeV797();
    if(!isAdmin)return alert('此帳號沒有新增活動權限');
    let title=svTitle.value.trim();
    if(!title){svTitle.focus();return alert('請輸入活動標題')}
    let mode=document.getElementById('svOpenMode')?.value||'immediate';
    let openDate=document.getElementById('svOpenDate')?.value||'';
    let openTime=document.getElementById('svOpenTime')?.value||'08:00';
    let openAt=mode==='scheduled'&&openDate?openDate+'T'+openTime:'';
    let deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';
    if(mode==='scheduled'&&!openDate)return alert('請設定問卷開放日期');
    if(openAt&&deadlineValue&&new Date(openAt)>=new Date(deadlineValue))return alert('開放時間必須早於截止時間');
    let budgetInput=document.getElementById('budgetPerPersonMirrorV724')||budgetPerPerson;
    let budgetRaw=(budgetInput?.value||'').trim();
    let budgetValue=budgetRaw===''?null:moneyValue(budgetRaw);
    if(budgetRaw!==''&&budgetValue===null)return alert('每人預算請輸入 0 以上數字');
    let id='survey_'+Date.now();
    let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value);
    let descriptionData=getRichDescriptionData();
    let creatorEmail=currentEmailV797();
    let creatorName=currentUserDisplayText?.()||currentUser?.displayName||creatorEmail;
    let data={
      title,
      ...descriptionData,
      frontInstructions:svInstructions.value.trim(),
      deadline:deadlineValue,
      openMode:mode,
      openAt,
      status:svStatus.value,
      allowEdit:svAllowEdit.value==='true',
      theme:normalizeTheme(themeSelect()?.value||'classic'),
      isAnonymous:false,
      targetDepartments:target,
      budgetPerPerson:budgetValue,
      createdByUid:currentUser?.uid||'',
      createdByEmail:creatorEmail,
      createdByName:creatorName,
      createdByRole:isSystemAdmin?'system':'manager',
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    data.openAtTimestamp=openAt?firebase.firestore.Timestamp.fromDate(new Date(openAt)):firebase.firestore.FieldValue.delete();
    data.deadlineAtTimestamp=deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete();
    surveySaveBtn.disabled=true;
    surveySaveBtn.textContent='儲存中…';
    try{
      await doc('surveys',id).set(data,{merge:true});
    }catch(e){
      console.error('create survey failed before document created',e);
      alert('活動儲存失敗，請檢查網路後再試一次');
      surveySaveBtn.disabled=false;
      surveySaveBtn.textContent='建立活動';
      return;
    }

    activeSurveyId=id;
    ensureCreatorAssignmentV797(id,creatorEmail,creatorName);
    await writeCreatorManagerV797(id,creatorEmail,creatorName);
    await writeCreateSurveyAuditV797(id,title);
    surveyFormMode='view';
    editingSurveyId=null;
    surveyFormDirty=false;
    await reloadAfterCreateV797(id);
    history.replaceState(null,'',adminHash());
    renderFront();
    renderAdmin();
    if(typeof window.setSurveyScopeV793==='function')window.setSurveyScopeV793('owned');
    toast('活動已建立，並已指派你為活動管理者');
    surveySaveBtn.disabled=false;
    surveySaveBtn.textContent='建立活動';
  };
  window.saveSurvey=saveSurvey;

})();

// ===== 活動發起人權限與非 Admin 分組穩定 =====
(function(){
  function emailV796(value){
    return normalizeEmail(value||'');
  }
  function currentEmailV796(){
    return emailV796(currentUser?.email||'');
  }
  function surveyCreatorEmailV796(s){
    return emailV796(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'');
  }
  function isSurveyCreatorV796(s){
    const email=currentEmailV796();
    return !!s && (
      (!!email && surveyCreatorEmailV796(s)===email) ||
      (!!currentUser?.uid && String(s?.createdByUid||'')===String(currentUser.uid))
    );
  }
  function ensureCreatorAssignmentsV796(){
    if(isSystemAdmin||!currentUser)return;
    const email=currentEmailV796();
    const known=new Set((surveyAssignments||[]).filter(a=>a.enabled!==false).map(a=>a.surveyId));
    D.surveys.forEach(s=>{
      if(!isSurveyCreatorV796(s)||known.has(s.id))return;
      surveyAssignments.push({
        id:'creator__'+s.id,
        surveyId:s.id,
        email,
        role:'manager',
        enabled:true,
        displayName:currentUserDisplayText?.()||email,
        source:'creator_virtual'
      });
      known.add(s.id);
    });
  }
  function userCanSeeSurveyV796(s){
    return isSystemAdmin ||
      isSurveyCreatorV796(s) ||
      (surveyAssignments||[]).some(a=>a.surveyId===s?.id&&a.enabled!==false);
  }
  function sortSurveysV796(rows){
    return rows.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  }

  const resolveAccessBeforeV796=resolveAccess;
  resolveAccess=async function(email,uid){
    await resolveAccessBeforeV796(email,uid);
    if(isSystemAdmin||isAdmin)return;
    const all=await safeGetCollection('surveys');
    const loginEmail=emailV796(email);
    const ownsAny=all.some(s=>
      (!!loginEmail && surveyCreatorEmailV796(s)===loginEmail) ||
      (!!uid && String(s?.createdByUid||'')===String(uid))
    );
    if(ownsAny){
      isAdmin=true;
      currentAccessRole='manager';
      surveyAssignments=all.filter(s=>
        (!!loginEmail && surveyCreatorEmailV796(s)===loginEmail) ||
        (!!uid && String(s?.createdByUid||'')===String(uid))
      ).map(s=>({
        id:'creator__'+s.id,
        surveyId:s.id,
        email:loginEmail,
        role:'manager',
        enabled:true,
        displayName:loginEmail,
        source:'creator_virtual'
      }));
    }
  };

  const loadAllBeforeV796=loadAll;
  loadAll=async function(){
    await loadAllBeforeV796();
    if(isAdmin&&!isSystemAdmin){
      const all=await safeGetCollection('surveys');
      D.surveys=sortSurveysV796(all.filter(userCanSeeSurveyV796));
      ensureCreatorAssignmentsV796();
      const requested=requestedSurveyId();
      if(requested&&D.surveys.some(s=>s.id===requested))activeSurveyId=requested;
      else if(!D.surveys.some(s=>s.id===activeSurveyId))chooseActiveSurvey();
      await loadSurveyData();
    }else{
      ensureCreatorAssignmentsV796();
    }
  };

  const loadSurveyDataBeforeV796=loadSurveyData;
  loadSurveyData=async function(){
    await loadSurveyDataBeforeV796();
    ensureCreatorAssignmentsV796();
    const s=activeSurvey();
    if(!isSystemAdmin&&isSurveyCreatorV796(s))currentAccessRole='manager';
  };

  const canManageBeforeV796=canManage;
  canManage=function(){
    return canManageBeforeV796()||(!isSystemAdmin&&isSurveyCreatorV796(activeSurvey()));
  };

})();

// ===== 最終出席調整版面優化 =====
(function installFinalAttendanceAdjustmentLayoutV783(){
  const ADJUST_REASON_BY_ACTION_V787={remove:['臨時無法參加','其他'],add:['後續確認可參加','其他']};
  let finalAdjustOpenV783=false;

  function adjustmentListV783(){
    return Array.isArray(D.final?.attendanceAdjustments)?D.final.attendanceAdjustments:[];
  }
  function memberBriefV783(m){
    return {
      memberId:m?.id||m?.memberId||'',
      department:m?.department||m?.departmentName||'',
      name:m?.name||m?.employeeName||m?.memberName||'',
      employeeNo:m?.employeeNo||m?.empNo||''
    };
  }
  function responseBriefMemberV783(r){
    return {
      memberId:r?.memberId||'',
      department:r?.departmentName||'',
      name:r?.memberName||'',
      employeeNo:r?.employeeNo||''
    };
  }
  function memberSortV783(a,b){
    const depA=a.department||a.departmentName||'',depB=b.department||b.departmentName||'';
    const noA=a.employeeNo||a.empNo||'',noB=b.employeeNo||b.empNo||'';
    return String(depA).localeCompare(String(depB),'zh-Hant')||
      String(noA).localeCompare(String(noB),'zh-Hant',{numeric:true,sensitivity:'base'})||
      String(a.name||a.memberName||'').localeCompare(String(b.name||b.memberName||''),'zh-Hant');
  }
  function latestAdjustmentMapV783(){
    const map=new Map();
    adjustmentListV783().forEach(item=>{
      if(!item?.memberId)return;
      const prev=map.get(item.memberId);
      if(!prev||Number(item.createdAtMillis||0)>=Number(prev.createdAtMillis||0))map.set(item.memberId,item);
    });
    return map;
  }
  function finalAttendanceRowsV783(dateId){
    if(!dateId)return [];
    const rows=new Map();
    attendeeResponsesForDate(dateId).forEach(r=>{
      rows.set(r.memberId,{member:responseBriefMemberV783(r),response:r,source:'問卷填寫',adjustment:null});
    });
    const membersById=new Map(targetMembers().map(m=>[m.id,m]));
    latestAdjustmentMapV783().forEach(adj=>{
      const m=membersById.get(adj.memberId)||memberById(adj.memberId)||null;
      if(adj.action==='remove'){
        rows.delete(adj.memberId);
      }else if(adj.action==='add'&&m){
        rows.set(adj.memberId,{member:memberBriefV783(m),response:D.responses.find(r=>r.memberId===adj.memberId)||null,source:'管理者調整',adjustment:adj});
      }
    });
    return [...rows.values()].sort((a,b)=>memberSortV783(a.member,b.member));
  }
  function finalBudgetRowsV783(dateId){
    return finalAttendanceRowsV783(dateId).filter(row=>memberBudgetEligible(memberById(row.member.memberId)));
  }
  function removedAdjustmentRowsV783(dateId){
    const base=new Map(attendeeResponsesForDate(dateId).map(r=>[r.memberId,r]));
    return adjustmentListV783()
      .filter(x=>x.action==='remove'&&base.has(x.memberId))
      .map(x=>({adjustment:x,response:base.get(x.memberId),member:responseBriefMemberV783(base.get(x.memberId))}))
      .sort((a,b)=>memberSortV783(a.member,b.member));
  }
  function unavailableRowsV783(dateId){
    const fromResponses=unavailableResponsesForDate(dateId).map(r=>({
      member:responseBriefMemberV783(r),
      reason:r.cannotAttend?'不克參加':'未選擇最終日期',
      source:'問卷填寫',
      note:r.note||''
    }));
    const fromAdjustments=removedAdjustmentRowsV783(dateId).map(row=>({
      member:row.member,
      reason:row.adjustment.reason||'臨時無法參加',
      source:'管理者調整',
      note:row.adjustment.note||''
    }));
    return [...fromResponses,...fromAdjustments].sort((a,b)=>memberSortV783(a.member,b.member));
  }
  function adjustmentBadgeV783(action){
    return action==='add'
      ?'<span class="badge green">加入出席</span>'
      :'<span class="badge red">移除出席</span>';
  }
  function adjustReasonOptionsV787(action,selected=''){
    const reasons=ADJUST_REASON_BY_ACTION_V787[action]||ADJUST_REASON_BY_ACTION_V787.remove;
    const value=reasons.includes(selected)?selected:reasons[0];
    return reasons.map(x=>`<option value="${escAttr(x)}" ${x===value?'selected':''}>${esc(x)}</option>`).join('');
  }
  window.syncFinalAdjustReasonV787=function(){
    const action=document.getElementById('finalAdjustActionV783')?.value||'remove';
    const reason=document.getElementById('finalAdjustReasonV783');
    if(!reason)return;
    const current=reason.value;
    reason.innerHTML=adjustReasonOptionsV787(action,current);
  };
  function renderAdjustmentEditorV783(){
    const options=targetMembers().slice().sort(memberSortV783).map(m=>{
      const label=[m.department||m.departmentName||'',m.employeeNo||m.empNo||'',m.name||''].filter(Boolean).join(' ');
      return `<option value="${escAttr(m.id)}">${esc(label)}</option>`;
    }).join('');
    const reasonOptions=adjustReasonOptionsV787('remove');
    const rows=adjustmentListV783().slice().sort((a,b)=>Number(b.createdAtMillis||0)-Number(a.createdAtMillis||0)).map(item=>{
      const m=memberById(item.memberId)||item.member||{};
      const dep=item.member?.department||m.department||m.departmentName||'';
      const name=item.member?.name||m.name||'';
      const emp=item.member?.employeeNo||m.employeeNo||m.empNo||'';
      return `<tr><td>${esc(dep)}</td><td><b>${esc(name)}</b></td><td>${esc(emp)}</td><td>${adjustmentBadgeV783(item.action)}</td><td>${esc(item.reason||'')}</td><td>${esc(item.note||'—')}</td><td>${esc(item.actorName||item.actorEmail||'')}</td><td>${esc(item.createdAtText||'')}</td><td class="operationCell">${canManage()?`<button class="btn red" onclick="removeFinalAttendanceAdjustmentV783('${escAttr(item.id)}')">刪除</button>`:'—'}</td></tr>`;
    });
    return `<div class="finalAdjustEditorV783">
      ${canManage()?`<div class="finalAdjustFormV783">
        <div class="field"><label>人員</label><select id="finalAdjustMemberV783"><option value="">請選擇人員</option>${options}</select></div>
        <div class="field"><label>調整方式</label><select id="finalAdjustActionV783" onchange="syncFinalAdjustReasonV787()"><option value="remove">移除出席</option><option value="add">加入出席</option></select></div>
        <div class="field"><label>原因</label><select id="finalAdjustReasonV783">${reasonOptions}</select></div>
        <div class="field"><label>備註（選填）</label><input id="finalAdjustNoteV783" maxlength="50" placeholder="選其他時可補充說明"></div>
        <div class="field finalAdjustButtonFieldV783"><label aria-hidden="true">&nbsp;</label><button class="btn primary" type="button" onclick="addFinalAttendanceAdjustmentV783()">新增調整</button></div>
      </div>`:''}
      ${table(['部門','姓名','員編','調整','原因','備註','調整人','時間','操作'],rows)}
    </div>`;
  }
  function renderAdjustmentControlV783(){
    const count=adjustmentListV783().length;
    return `<section class="finalGroup finalAdjustmentBoxV783">
      <div class="finalAdjustControlV783">
        <div>
          <div class="finalAdjustControlTitleV783">最終出席名單調整 <span class="countBadge">${count} 筆</span></div>
          <p class="muted">可於決議後加入或移除人員，不會修改同仁原始問卷內容。</p>
        </div>
        <button class="btn ${finalAdjustOpenV783?'':'primary'}" type="button" onclick="toggleFinalAttendanceAdjustmentV783()">${finalAdjustOpenV783?'收合調整':'調整最終出席名單'}</button>
      </div>
      ${finalAdjustOpenV783?renderAdjustmentEditorV783():''}
    </section>`;
  }
  function renderFinalAttendancePreviewV783(){
    const box=document.getElementById('finalAttendancePreview');if(!box)return;
    const dateId=finalDate.value;
    if(!dateId){
      box.innerHTML=renderAdjustmentControlV783()+'<div class="finalEmpty">請先選擇最終日期，系統將自動整理當天出席名單。</div>';
      return;
    }
    const date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===finalRest.value);
    const attendingRows=finalAttendanceRowsV783(dateId),budgetRows=finalBudgetRowsV783(dateId);
    const originalAttending=attendeeResponsesForDate(dateId),removedRows=removedAdjustmentRowsV783(dateId);
    const unavailable=unavailableRowsV783(dateId),missing=missingMembers();
    const addedCount=attendingRows.filter(x=>x.source==='管理者調整').length,removedCount=removedRows.length;
    const budget=activityBudgetPerPerson(),cost=typeof restaurantCostV712==='function'?restaurantCostV712(rest,attendingRows.length):{total:moneyValue(rest?.price)===null?null:moneyValue(rest?.price)*attendingRows.length,serviceFee:null};
    const budgetTotal=budget===null?null:budget*budgetRows.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total;
    const financeHtml=rest?`<section class="finalGroup finalCostBox"><div class="finalGroupHead"><h4>餐費試算</h4><span class="countBadge">${attendingRows.length} 人</span></div><div class="finalCostGrid"><div><span>最終餐廳</span><strong>${esc(rest.name||'')}</strong></div><div><span>問卷可出席</span><strong>${originalAttending.length} 人</strong></div><div><span>手動加入</span><strong>${addedCount} 人</strong></div><div><span>手動移除</span><strong>${removedCount} 人</strong></div><div><span>最終出席</span><strong>${attendingRows.length} 人</strong></div><div><span>預算人數</span><strong>${budgetRows.length} 人</strong></div><div><span>每人預算</span><strong>${budget===null?'—':esc(moneyText(budget))+' 元'}</strong></div><div><span>餐費總額</span><strong>${cost.total===null?'—':esc(moneyText(cost.total))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">最終出席人數已納入手動加入／移除調整；原始問卷結果不會被改動。</p></section>`:'<section class="finalGroup finalCostBox"><div class="finalEmpty">選擇最終餐廳後，會依最終出席人數自動試算預算與小計。</div></section>';
    box.innerHTML=`${renderAdjustmentControlV783()}${financeHtml}<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>${esc(date?.label||'最終日期')}問卷可出席</span><strong>${originalAttending.length}</strong></div><div class="finalAttendanceKpi"><span>手動加入</span><strong>${addedCount}</strong></div><div class="finalAttendanceKpi"><span>手動移除</span><strong>${removedCount}</strong></div><div class="finalAttendanceKpi"><span>最終出席人數</span><strong>${attendingRows.length}</strong></div></div><section class="finalGroup finalRosterTableV786"><div class="finalGroupHead"><h4>最終出席名單</h4><span class="countBadge">${attendingRows.length} 人</span></div>${table(['部門','姓名','員編','來源','預算資格','備註'],attendingRows.map(row=>`<tr><td>${esc(row.member.department||'')}</td><td><b>${esc(row.member.name||'')}</b></td><td>${esc(row.member.employeeNo||'')}</td><td>${esc(row.source)}</td><td><span class="badge ${memberBudgetEligible(memberById(row.member.memberId))?'green':'gray'}">${memberBudgetEligible(memberById(row.member.memberId))?'納入預算':'不納入預算'}</span></td><td>${esc(row.adjustment?.note||row.response?.note||'—')}</td></tr>`))}</section><section class="finalGroup finalRosterTableV786"><div class="finalGroupHead"><h4>無法出席名單</h4><span class="countBadge warn">${unavailable.length} 人</span></div>${table(['部門','姓名','員編','來源','原因','備註'],unavailable.map(row=>`<tr><td>${esc(row.member.department||'')}</td><td><b>${esc(row.member.name||'')}</b></td><td>${esc(row.member.employeeNo||'')}</td><td>${esc(row.source||'')}</td><td><span class="badge amber">${esc(row.reason||'')}</span></td><td>${esc(row.note||'—')}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>尚未填寫</h4><span class="countBadge ${missing.length?'warn':''}">${missing.length} 人</span></div>${table(['部門','姓名','員編'],missing.map(m=>`<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name||'')}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td></tr>`))}</section>`;
  }
  window.toggleFinalAttendanceAdjustmentV783=function(){
    finalAdjustOpenV783=!finalAdjustOpenV783;
    renderFinalAttendancePreviewV783();
  };
  window.openFinalAttendanceAdjustmentV935=function(){
    panel('finalP',document.querySelector('[onclick*="finalP"]'));
    finalAdjustOpenV783=true;
    renderFinalAttendancePreviewV783();
    requestAnimationFrame(()=>document.querySelector('.finalAdjustmentBoxV783')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  window.addFinalAttendanceAdjustmentV783=async function(){
    if(!canManage())return alert('此帳號只有檢視權限');
    if(!activeSurveyId)return alert('請先選擇活動');
    const memberId=document.getElementById('finalAdjustMemberV783')?.value||'';
    const action=document.getElementById('finalAdjustActionV783')?.value||'remove';
    const reason=document.getElementById('finalAdjustReasonV783')?.value||'';
    const note=(document.getElementById('finalAdjustNoteV783')?.value||'').trim();
    const m=targetMembers().find(x=>x.id===memberId)||memberById(memberId);
    if(!m)return alert('請選擇要調整的人員');
    if(!(ADJUST_REASON_BY_ACTION_V787[action]||[]).includes(reason))return alert('請選擇符合調整方式的原因');
    if(reason==='其他'&&!note)return alert('原因選擇「其他」時，請補充備註');
    const before=await auditReadDocV760('finalDecision',activeSurveyId);
    const now=new Date();
    const next=[...adjustmentListV783(),{
      id:'adj_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      memberId,member:memberBriefV783(m),action,reason,note,
      actorEmail:String(currentUser?.email||'').toLowerCase(),
      actorName:currentUserDisplayText?.()||currentUser?.displayName||currentUser?.email||'',
      createdAtMillis:now.getTime(),
      createdAtText:formatDateTimeV784(now)
    }];
    await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,attendanceAdjustments:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const after=await auditReadDocV760('finalDecision',activeSurveyId);
    await writeAuditDetailV760({action:'修改',targetType:'最終出席調整',targetId:activeSurveyId,targetLabel:memberDisplayName(m)||memberId,before,after,fields:['attendanceAdjustments'],surveyId:activeSurveyId,summary:(action==='add'?'加入出席':'移除出席')+'「'+(memberDisplayName(m)||memberId)+'」'});
    await loadSurveyData();renderFront();renderAdmin();toast('最終出席調整已新增');
  };
  window.removeFinalAttendanceAdjustmentV783=async function(id){
    if(!canManage())return alert('此帳號只有檢視權限');
    const item=adjustmentListV783().find(x=>x.id===id);
    if(!item)return alert('找不到這筆調整紀錄');
    if(!confirm('確定刪除這筆最終出席調整？'))return;
    const before=await auditReadDocV760('finalDecision',activeSurveyId);
    const next=adjustmentListV783().filter(x=>x.id!==id);
    await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,attendanceAdjustments:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const after=await auditReadDocV760('finalDecision',activeSurveyId);
    await writeAuditDetailV760({action:'刪除',targetType:'最終出席調整',targetId:activeSurveyId,targetLabel:item.member?.name||item.memberId,before,after,fields:['attendanceAdjustments'],surveyId:activeSurveyId});
    await loadSurveyData();renderFront();renderAdmin();toast('最終出席調整已刪除');
  };

  const renderFinalPanelBaseV783=renderFinalPanel;
  renderFinalPanel=function(){
    renderFinalPanelBaseV783();
    renderFinalAttendancePreviewV783();
  };
  renderFinalAttendancePreview=renderFinalAttendancePreviewV783;

  const exportExcelBaseV783=exportExcel;
  exportExcel=function(){
    if(!window.XLSX)return exportExcelBaseV783();
    const originalWrite=XLSX.writeFile;
    XLSX.writeFile=function(workbook,filename){
      const finalDateId=D.final?.finalDateId||'',date=D.dates.find(d=>d.id===finalDateId),rest=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId);
      const rows=finalAttendanceRowsV783(finalDateId),budgetRows=finalBudgetRowsV783(finalDateId),removedRows=removedAdjustmentRowsV783(finalDateId),unavailable=unavailableRowsV783(finalDateId),cost=typeof restaurantCostV712==='function'?restaurantCostV712(rest,rows.length):{total:moneyValue(rest?.price)===null?null:moneyValue(rest?.price)*rows.length};
      const budget=activityBudgetPerPerson(),budgetTotal=budget===null?null:budget*budgetRows.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total;
      const finalRows=[['最終決議與出席名單'],['活動',activeSurvey()?.title||''],['最終日期',date?.label||'尚未設定'],['最終餐廳',rest?.name||'尚未設定'],['問卷可出席人數',attendeeResponsesForDate(finalDateId).length],['手動加入人數',rows.filter(x=>x.source==='管理者調整').length],['手動移除人數',removedRows.length],['最終出席人數',rows.length],['預算人數',budgetRows.length],['每人預算',moneyText(budget)],['餐費總額',moneyText(cost.total)],['總額差異',budgetStatusText(totalDiff)],['決議說明',D.final?.note||''],[],['最終出席名單'],['部門','姓名','員編','來源','預算資格','備註'],...rows.map(row=>[row.member.department||'',row.member.name||'',row.member.employeeNo||'',row.source,memberBudgetEligible(memberById(row.member.memberId))?'納入預算':'不納入預算',row.adjustment?.note||row.response?.note||'']),[],['無法出席名單'],['部門','姓名','員編','來源','原因','備註'],...unavailable.map(row=>[row.member.department||'',row.member.name||'',row.member.employeeNo||'',row.source||'',row.reason||'',row.note||''])];
      const sheet=XLSX.utils.aoa_to_sheet(finalRows);sheet['!merges']=[XLSX.utils.decode_range('A1:F1')];sheet['!cols']=[{wch:18},{wch:18},{wch:14},{wch:18},{wch:14},{wch:34}];workbook.Sheets['最終出席名單']=sheet;
      return originalWrite.call(XLSX,workbook,filename);
    };
    try{return exportExcelBaseV783()}finally{XLSX.writeFile=originalWrite}
  };

  function installFinalAdjustmentStylesV783(){
    if(document.getElementById('finalAdjustmentStylesV783'))return;
    const style=document.createElement('style');
    style.id='finalAdjustmentStylesV783';
    style.textContent='.finalAdjustmentBoxV783{border:1px solid var(--line,#dbe4ef);background:#fff;border-radius:16px;padding:18px;margin:16px 0}.finalAdjustControlV783{display:flex;align-items:center;justify-content:space-between;gap:16px}.finalAdjustControlTitleV783{font-weight:800;color:#08264a;font-size:18px;display:flex;align-items:center;gap:10px}.finalAdjustControlV783 .muted{margin:6px 0 0}.finalAdjustEditorV783{margin-top:16px;padding-top:14px;border-top:1px solid var(--line,#dbe4ef)}.finalAdjustFormV783{display:grid;grid-template-columns:minmax(220px,1.2fr) 160px 170px minmax(180px,1fr) auto;gap:12px;align-items:end;margin:0 0 14px}.finalAdjustFormV783 .field{min-width:0}.finalAdjustButtonFieldV783 .btn{height:52px;white-space:nowrap;padding-left:22px;padding-right:22px}.finalAdjustmentBoxV783 .table{margin-top:10px}@media(max-width:1100px){.finalAdjustFormV783{grid-template-columns:1fr 1fr}.finalAdjustButtonFieldV783{grid-column:1 / -1}.finalAdjustButtonFieldV783 .btn{width:100%}}@media(max-width:700px){.finalAdjustControlV783{align-items:stretch;flex-direction:column}.finalAdjustFormV783{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }
  installFinalAdjustmentStylesV783();
  window.finalAttendanceRowsV783=finalAttendanceRowsV783;
  window.renderFinalAttendancePreviewV783=renderFinalAttendancePreviewV783;
})();

// ===== 日期編輯與 Audit Log 正式入口 =====
// 目的：
// 1) 日期 label 只有 07/03(五) 或含補充文字時，仍可穩定回填 input[type=date]。
// 2) 日期儲存一定使用日期選擇器產生 label。
// 3) Audit Log 一定寫入 before / after / changes，畫面也一定渲染修改前／修改後。
(function installV765DateAuditHardFix(){
  const AUDIT_DETAIL_VERSION='v7.85';

  function dateYearFromSurveyV765(){
    let s=activeSurvey?.()||D.surveys?.find?.(x=>x.id===activeSurveyId)||null;
    let candidates=[s?.deadline,s?.openAt,s?.createdAt?.toDate?.()?.toISOString?.()];
    for(let item of candidates){
      let text=String(item||'');
      let m=text.match(/(\d{4})/);
      if(m)return m[1];
    }
    return String(new Date().getFullYear());
  }

  function normalizeDateInputValueV765(value){
    let text=String(value||'').trim();
    let m=text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if(!m)return '';
    return m[1]+'-'+pad2V760(m[2])+'-'+pad2V760(m[3]);
  }

  function parseDateLabelV765(label,rawSource){
    let raw=normalizeDateInputValueV765(rawSource);
    let text=String(label||'').trim();
    let suffix='';
    let m=text.match(/^(?:(\d{4})[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
    if(m){
      let year=m[1]||dateYearFromSurveyV765();
      raw=raw||year+'-'+pad2V760(m[2])+'-'+pad2V760(m[3]);
      suffix=String(m[4]||'').trim();
    }
    return {date:raw,suffix};
  }

  function fillDateEditorV765(d){
    ensureDateEditorLayoutV760();
    let parsed=parseDateLabelV765(d?.label,d?.rawDateSource);
    let picker=document.getElementById('newDatePickerV724');
    let suffix=document.getElementById('newDateSuffixV724');
    if(picker)picker.value=parsed.date||'';
    if(suffix)suffix.value=parsed.suffix||'';
    if(newDate)newDate.value=d?.label||'';
    if(newDateSort)newDateSort.value=d?.sort??'';
    return parsed;
  }

  function cleanForAuditV765(value){
    if(typeof auditSanitizeV760==='function')return auditSanitizeV760(value);
    return value||{};
  }

  function changesForAuditV765(before,after,fields){
    let cleanBefore=cleanForAuditV765(before);
    let cleanAfter=cleanForAuditV765(after);
    let changes=typeof auditChangesV760==='function'
      ? auditChangesV760(cleanBefore,cleanAfter,fields)
      : [];
    if((!changes||!changes.length)&&JSON.stringify(cleanBefore)!==JSON.stringify(cleanAfter)){
      let keys=[...new Set([...Object.keys(cleanBefore||{}),...Object.keys(cleanAfter||{})])].filter(k=>!['createdAt','updatedAt'].includes(k));
      changes=keys.filter(k=>JSON.stringify(cleanBefore?.[k]??'')!==JSON.stringify(cleanAfter?.[k]??'')).map(k=>({
        field:k,
        label:(typeof auditFieldLabelsV760==='object'&&auditFieldLabelsV760[k])||k,
        before:String(cleanBefore?.[k]??''),
        after:String(cleanAfter?.[k]??'')
      }));
    }
    return {cleanBefore,cleanAfter,changes};
  }

  async function writeAuditDetailV765({action,targetType,targetId,targetLabel,before,after,fields,surveyId,summary}){
    if(!currentUser||!db)return;
    if(typeof auditMuteDepthV760!=='undefined'&&auditMuteDepthV760>0)return;
    let {cleanBefore,cleanAfter,changes}=changesForAuditV765(before,after,fields);
    let label=targetLabel||cleanAfter?.title||cleanAfter?.name||cleanAfter?.label||cleanBefore?.title||cleanBefore?.name||cleanBefore?.label||targetId||'';
    let payload={
      surveyId:surveyId||activeSurveyId||cleanAfter?.surveyId||cleanBefore?.surveyId||'',
      action,
      targetType,
      targetId:targetId||cleanAfter?.id||cleanBefore?.id||'',
      summary:summary||(typeof auditSummaryV760==='function'?auditSummaryV760(action,targetType,label,changes):(action+targetType+'「'+label+'」')),
      before:cleanBefore||{},
      after:cleanAfter||{},
      changes:changes||[],
      beforeSummary:(changes||[]).map(x=>(x.label||x.field||'')+'：'+(x.before??'')).join('；'),
      afterSummary:(changes||[]).map(x=>(x.label||x.field||'')+'：'+(x.after??'')).join('；'),
      detailVersion:AUDIT_DETAIL_VERSION,
      actorUid:currentUser.uid,
      actorEmail:String(currentUser.email||'').toLowerCase(),
      actorName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
      actorRole:actorRoleV711?.()||(isSystemAdmin?'系統管理員':currentAccessRole||''),
      userName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
      userEmail:String(currentUser.email||'').toLowerCase(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    await col('surveyAuditLogs').add(payload);
  }

  window.writeAuditDetailV760=writeAuditDetailV765;
  writeAuditDetailV760=writeAuditDetailV765;

  writeAuditV711=async function(action,targetType,targetId,summary,surveyId=activeSurveyId){
    await writeAuditDetailV765({
      action,targetType,targetId,summary,
      before:{},
      after:{summary:summary||'',action:action||'',targetType:targetType||'',targetId:targetId||'',surveyId:surveyId||activeSurveyId||''},
      fields:['summary','action','targetType','targetId','surveyId'],
      surveyId:surveyId||activeSurveyId
    });
  };
  window.writeAuditV711=writeAuditV711;

  editDate=function(id){
    let d=D.dates.find(x=>x.id===id);
    if(!d)return alert('找不到這筆日期資料');
    editingDateId=id;
    fillDateEditorV765(d);
    dateFormHeading.textContent='編輯日期：'+(d.label||'');
    dateModeBadge.textContent='編輯模式';
    dateModeBadge.className='modeBadge edit';
    dateSaveBtn.textContent='儲存變更';
    dateCancelBtn.hidden=false;
    document.getElementById('newDatePickerV724')?.focus();
  };
  window.editDate=editDate;

  cancelDateEdit=function(render=true){
    editingDateId=null;
    ensureDateEditorLayoutV760();
    let picker=document.getElementById('newDatePickerV724');
    let suffix=document.getElementById('newDateSuffixV724');
    if(picker)picker.value='';
    if(suffix)suffix.value='';
    if(newDate)newDate.value='';
    if(newDateSort)newDateSort.value='';
    dateFormHeading.textContent='新增日期';
    dateModeBadge.textContent='新增模式';
    dateModeBadge.className='modeBadge new';
    dateSaveBtn.textContent='新增日期';
    dateCancelBtn.hidden=true;
    if(render)renderDatePanel();
  };
  window.cancelDateEdit=cancelDateEdit;

  saveDateV760Direct=async function(){
    if(!activeSurveyId)return alert('請先選擇活動');
    ensureDateEditorLayoutV760();
    let picker=document.getElementById('newDatePickerV724');
    let suffix=document.getElementById('newDateSuffixV724');
    let source=normalizeDateInputValueV765(picker?.value||'');
    if(!source)return alert('請先選擇日期');
    let label=formatDateLabelV760(source,suffix?.value||'');
    let isEdit=!!editingDateId;
    let targetId=editingDateId;
    let before=isEdit?await auditReadDocV760('surveyDates',targetId):null;
    let data={
      surveyId:activeSurveyId,
      label,
      rawDateSource:source,
      sort:Number(newDateSort?.value||0),
      active:true,
      dateSaveVersion:AUDIT_DETAIL_VERSION,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    dateSaveBtn.disabled=true;
    dateSaveBtn.textContent='儲存中…';
    try{
      if(isEdit)await doc('surveyDates',targetId).set(data,{merge:true});
      else{
        data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
        let ref=await col('surveyDates').add(data);
        targetId=ref.id;
      }
      let after=await auditReadDocV760('surveyDates',targetId);
      await writeAuditDetailV765({
        action:isEdit?'修改':'新增',
        targetType:'日期',
        targetId,
        targetLabel:after?.label||label,
        before,
        after,
        fields:['label','rawDateSource','sort','active'],
        surveyId:activeSurveyId
      });
      cancelDateEdit(false);
      await loadSurveyData();
      renderFront();
      renderAdmin();
      toast(isEdit?'日期變更已儲存':'日期已新增');
    }catch(e){
      console.error('save date v7.75 failed',e);
      alert('日期儲存失敗，請檢查網路後再試一次');
    }finally{
      dateSaveBtn.disabled=false;
      dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期';
      bindDateSaveButtonV765();
    }
  };
  saveDate=saveDateV760Direct;
  saveDateV731Direct=saveDateV760Direct;
  window.saveDate=saveDateV760Direct;
  window.saveDateV731Direct=saveDateV760Direct;
  window.saveDateV760Direct=saveDateV760Direct;

  function bindDateSaveButtonV765(){
    if(!dateSaveBtn)return;
    dateSaveBtn.onclick=event=>{event?.preventDefault?.();return saveDateV760Direct()};
    dateSaveBtn.setAttribute('data-date-save-version',AUDIT_DETAIL_VERSION);
  }
  bindDateSaveButtonV731=bindDateSaveButtonV765;
  bindDateSaveButtonV760=bindDateSaveButtonV765;
  window.bindDateSaveButtonV731=bindDateSaveButtonV765;
  window.bindDateSaveButtonV760=bindDateSaveButtonV765;

  function auditDiffHtmlV765(log){
    let hasBefore=Object.prototype.hasOwnProperty.call(log,'before');
    let hasAfter=Object.prototype.hasOwnProperty.call(log,'after');
    let hasChanges=Object.prototype.hasOwnProperty.call(log,'changes');
    if(!hasBefore&&!hasAfter&&!hasChanges)return '<span class="auditLegacyHintV741">此筆是舊格式紀錄，資料庫內沒有修改前/修改後欄位。</span>';
    let changes=Array.isArray(log.changes)?log.changes:[];
    if(!changes.length){
      let computed=changesForAuditV765(log.before||{},log.after||{},null);
      changes=computed.changes||[];
    }
    if(!changes.length)return '<span class="muted">本次沒有可比對的欄位差異。</span>';
    return '<details class="auditDiffV741" open><summary>修改前／修改後（'+changes.length+' 項）</summary><table class="auditDiffTableV738"><thead><tr><th>欄位</th><th>修改前</th><th>修改後</th></tr></thead><tbody>'+changes.map(c=>'<tr><td>'+esc(c.label||c.field||'')+'</td><td>'+esc(c.before??'')+'</td><td>'+esc(c.after??'')+'</td></tr>').join('')+'</tbody></table></details>';
  }

  renderLogsV711=function(){
    let box=document.getElementById('logTable');
    if(!box)return;
    let type=document.getElementById('logTypeFilter')?.value||'audit';
    if(type==='login'&&!isSystemAdmin){
      document.getElementById('logTypeFilter').value='audit';
      type='audit';
    }
    let rows=filteredLogsV711();
    let pageSize=typeof LOG_PAGE_SIZE_V721==='number'?LOG_PAGE_SIZE_V721:12;
    let pages=Math.max(1,Math.ceil(rows.length/pageSize));
    if(typeof logPageV721==='undefined')window.logPageV721=1;
    logPageV721=Math.min(Math.max(1,logPageV721||1),pages);
    let pageRows=rows.slice((logPageV721-1)*pageSize,logPageV721*pageSize);
    let html=type==='login'
      ?table(['時間','帳號／姓名','結果','身分','說明'],pageRows.map(x=>{
        let name=typeof memberLabelV721ByEmail==='function'?memberLabelV721ByEmail(x.email,x.displayName):(x.displayName||'');
        return '<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(name)+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>';
      }))
      :table(['時間','操作者','活動','功能／動作','內容'],pageRows.map(x=>{
        let name=typeof memberLabelV721ByEmail==='function'?memberLabelV721ByEmail(x.actorEmail||x.userEmail,x.actorName||x.userName):(x.actorName||x.userName||'');
        return '<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(name)+'</b><br><small>'+esc(x.actorEmail||x.userEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'<br>'+auditDiffHtmlV765(x)+'</td></tr>';
      }));
    box.innerHTML=html+'<div class="logPager"><span>共 '+rows.length+' 筆，第 '+logPageV721+' / '+pages+' 頁</span><div><button class="btn logPrevPage" '+(logPageV721<=1?'disabled':'')+'>上一頁</button><button class="btn logNextPage" '+(logPageV721>=pages?'disabled':'')+'>下一頁</button></div></div>';
    box.querySelector('.logPrevPage')?.addEventListener('click',()=>{if(logPageV721>1){logPageV721--;renderLogsV711()}});
    box.querySelector('.logNextPage')?.addEventListener('click',()=>{if(logPageV721<pages){logPageV721++;renderLogsV711()}});
  };
  window.renderLogsV711=renderLogsV711;

  const renderAdminBeforeV765=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV765();
    ensureDateEditorLayoutV760();
    bindDateSaveButtonV765();
  };

  bindDateSaveButtonV765();
})();

// ===== 複製視窗整理、活動封存歷史查詢、前台截止提示優化 =====
(function(){
  let surveyArchiveViewV775='active';

  function renderDeadlineNoticeV775(target,survey){
    if(!target)return;
    let text=survey?.deadline?('請於 '+formatDeadline(survey.deadline)+' 前完成填寫'):'尚未設定截止日期';
    target.innerHTML='<span class="deadlineIconV775" aria-hidden="true">⏱</span><span class="deadlineTextV775">'+esc(text)+'</span>';
  }

  const renderFrontBeforeV775=renderFront;
  renderFront=function(){
    renderFrontBeforeV775();
    renderDeadlineNoticeV775(deadline,activeSurvey());
  };

  const statusLabelBeforeV775=statusLabel;
  statusLabel=function(status){
    return status==='archived'?'已結案':statusLabelBeforeV775(status);
  };

  function isArchivedSurveyV775(s){
    return s?.status==='archived'||s?.archived===true;
  }

  function visibleByArchiveViewV775(s){
    if(surveyArchiveViewV775==='all')return true;
    if(surveyArchiveViewV775==='archived')return isArchivedSurveyV775(s);
    return !isArchivedSurveyV775(s);
  }

  async function archiveSurveyV775(id,archive=true){
    let s=D.surveys.find(x=>x.id===id);
    if(!s)return alert('找不到活動資料，請重新整理後再試一次');
    let verb=archive?'結案':'恢復進行中';
    if(!confirm('確定要將「'+(s.title||id)+'」'+verb+'？'))return;
    let before=typeof auditReadDocV760==='function'?await auditReadDocV760('surveys',id):clonePlainV760?.(s);
    let payload={
      status:archive?'archived':'open',
      archived:archive,
      archivedAt:archive?firebase.firestore.FieldValue.serverTimestamp():firebase.firestore.FieldValue.delete(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    await doc('surveys',id).set(payload,{merge:true});
    let after=typeof auditReadDocV760==='function'?await auditReadDocV760('surveys',id):{...before,...payload,status:payload.status,archived:archive};
    if(typeof writeAuditDetailV760==='function'){
      await writeAuditDetailV760({action:verb,targetType:'活動',targetId:id,targetLabel:after?.title||before?.title||id,before,after,fields:['status','archived'],surveyId:id});
    }else if(typeof writeAuditV711==='function'){
      await writeAuditV711(verb,'活動',id,verb+'「'+(s.title||id)+'」',id);
    }
    if(archive&&surveyArchiveViewV775==='active')surveyArchiveViewV775='archived';
    await loadAll();renderAdmin();renderFront();toast(archive?'活動已移至已結案活動':'活動已恢復進行中');
  }

  archiveSurveyV719=archiveSurveyV775;
  window.archiveSurveyV719=archiveSurveyV775;
  window.archiveSurveyV775=archiveSurveyV775;

  function installSurveyArchiveTabsV775(){
    let table=document.getElementById('surveyTable');
    if(!table||document.getElementById('surveyArchiveTabsV775'))return;
    let tabs=document.createElement('div');
    tabs.id='surveyArchiveTabsV775';
    tabs.className='surveyArchiveTabsV775';
    tabs.innerHTML='<button type="button" data-archive-view="active">進行中活動</button><button type="button" data-archive-view="archived">已結案活動</button><button type="button" data-archive-view="all">全部活動</button>';
    table.parentNode.insertBefore(tabs,table);
    tabs.addEventListener('click',event=>{
      let btn=event.target.closest('[data-archive-view]');
      if(!btn)return;
      surveyArchiveViewV775=btn.getAttribute('data-archive-view')||'active';
      applySurveyArchiveViewV775();
    });
  }

  function applySurveyArchiveViewV775(){
    let table=document.getElementById('surveyTable');
    if(!table)return;
    document.querySelectorAll('#surveyArchiveTabsV775 [data-archive-view]').forEach(btn=>{
      btn.classList.toggle('active',btn.getAttribute('data-archive-view')===surveyArchiveViewV775);
    });
    let visibleCount=0;
    table.querySelectorAll('tbody tr').forEach((row,index)=>{
      let s=D.surveys[index];
      let show=!!s&&visibleByArchiveViewV775(s);
      row.hidden=!show;
      if(show)visibleCount++;
      polishSurveyArchiveRowV775(row,s);
    });
    let empty=document.getElementById('surveyArchiveEmptyV775');
    if(!empty){
      empty=document.createElement('div');
      empty.id='surveyArchiveEmptyV775';
      empty.className='surveyArchiveEmptyV775';
      table.parentNode.insertBefore(empty,table.nextSibling);
    }
    empty.textContent=surveyArchiveViewV775==='archived'?'目前沒有已結案活動':'目前沒有符合條件的活動';
    empty.hidden=visibleCount>0;
  }

  function polishSurveyArchiveRowV775(row,s){
    if(!row||!s)return;
    let archived=isArchivedSurveyV775(s),current=s.id===activeSurveyId;
    let badge=row.cells?.[1]?.querySelector('.badge');
    if(badge&&archived){badge.textContent='已結案';badge.className='badge gray archivedBadgeV775'}
    let ops=row.querySelector('.operationCell,.surveyOperationCell');
    if(!ops)return;
    ops.querySelectorAll('button').forEach(btn=>{
      let text=(btn.textContent||'').trim();
      if(text.includes('刪除'))btn.textContent='刪除';
      if(archived&&text.includes('設為目前'))btn.hidden=true;
      if(text==='編輯'&&archived)btn.textContent='查看';
    });
    let archiveBtn=ops.querySelector('.archiveSurveyBtn');
    if(archiveBtn){
      archiveBtn.textContent=archived?'恢復進行中':'結案';
      archiveBtn.classList.toggle('green',archived);
      archiveBtn.onclick=()=>archiveSurveyV775(s.id,!archived);
    }
    if(current&&archived){
      let currentBtn=[...ops.querySelectorAll('button')].find(btn=>(btn.textContent||'').includes('設為目前'));
      if(currentBtn)currentBtn.hidden=true;
    }
  }

  function enhanceDuplicateModalV775(){
    let options=document.querySelector('.copyOptions');
    if(!options)return;
    options.classList.add('copyOptionsV775');
    options.querySelectorAll('label').forEach(label=>{
      label.classList.add('copyOptionV775');
      let input=label.querySelector('input');
      if(input&&!input.nextElementSibling){
        let text=label.textContent.trim();
        label.textContent='';
        label.append(input);
        let span=document.createElement('span');
        span.textContent=text;
        label.append(span);
      }
    });
  }

  const duplicatePromptBeforeV775=typeof showDuplicateSurveyModalV719==='function'?showDuplicateSurveyModalV719:duplicateSurveyPrompt;
  showDuplicateSurveyModalV719=function(id){
    duplicatePromptBeforeV775(id);
    enhanceDuplicateModalV775();
  };
  duplicateSurveyPrompt=showDuplicateSurveyModalV719;
  window.duplicateSurveyPrompt=showDuplicateSurveyModalV719;

  const renderSurveyPanelBeforeV775=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV775();
    installSurveyArchiveTabsV775();
    applySurveyArchiveViewV775();
  };

  const renderAdminBeforeV775=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV775();
    applySurveyArchiveViewV775();
  };

})();

// ===== 活動列表操作整理、狀態說明、關聯資料安全刪除 =====
(function(){
  let surveyMoreBoundV776=false;

  function canArchiveSurveyV776(){
    return !!(isSystemAdmin||currentAccessRole==='manager'||currentAccessRole==='system');
  }

  function surveyDeleteCollectionsV776(){
    return [
      {name:'surveyDates',label:'日期清單'},
      {name:'restaurants',label:'餐廳資料'},
      {name:'responses',label:'填寫回覆'},
      {name:'budgetEligibility',label:'填寫／預算資格'},
      {name:'surveyManagers',label:'活動權限指派'}
    ];
  }

  function bindSurveyMoreCloseV776(){
    if(surveyMoreBoundV776)return;
    surveyMoreBoundV776=true;
    document.addEventListener('click',event=>{
      if(event.target.closest('.surveyMoreV776'))return;
      document.querySelectorAll('.surveyMoreMenuV776.show').forEach(menu=>menu.classList.remove('show'));
    });
  }

  function setButtonV776(text,cls,handler){
    let btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }

  function renderSurveyActionCellV776(row,s){
    if(!row||!s)return;
    let ops=row.querySelector('.operationCell,.surveyOperationCell');
    if(!ops)return;
    bindSurveyMoreCloseV776();
    let archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
    let current=s.id===activeSurveyId;
    ops.className=(ops.className||'')+' surveyActionCellV776';
    ops.innerHTML='';

    ops.appendChild(setButtonV776(archived?'查看':'編輯','btn',()=>archived?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
    if(!current&&!archived){
      ops.appendChild(setButtonV776('設為目前','btn green',()=>setActiveSurvey(s.id)));
    }

    let menuItems=[];
    if(isSystemAdmin){
      menuItems.push({text:'複製活動',className:'',action:()=>duplicateSurveyPrompt(s.id)});
    }
    if(canArchiveSurveyV776()){
      menuItems.push({text:archived?'恢復進行中':'結案',className:archived?'greenTextV776':'',action:()=>window.archiveSurveyV775(s.id,!archived)});
    }
    if(isSystemAdmin){
      menuItems.push({text:'永久刪除',className:'dangerTextV776',action:()=>showDeleteSurveyModalV776(s.id)});
    }
    if(!menuItems.length)return;

    let wrap=document.createElement('div');
    wrap.className='surveyMoreV776';
    let more=setButtonV776('更多','btn surveyMoreBtnV776',event=>{
      event.stopPropagation();
      document.querySelectorAll('.surveyMoreMenuV776.show').forEach(menu=>{if(menu!==menuEl)menu.classList.remove('show')});
      menuEl.classList.toggle('show');
    });
    let menuEl=document.createElement('div');
    menuEl.className='surveyMoreMenuV776';
    menuItems.forEach(item=>{
      let itemBtn=setButtonV776(item.text,'surveyMoreItemV776 '+(item.className||''),event=>{
        event.stopPropagation();
        menuEl.classList.remove('show');
        item.action();
      });
      menuEl.appendChild(itemBtn);
    });
    wrap.append(more,menuEl);
    ops.appendChild(wrap);
  }

  function installSurveyListInfoV776(){
    let table=document.getElementById('surveyTable');
    if(!table)return;
    let card=table.closest('.card')||table.parentElement;
    if(!card)return;
    let head=card.querySelector('.surveyListHead');
    if(head){
      head.querySelectorAll('span,small,p,div').forEach(el=>{
        if((el.textContent||'').trim()==='「目前使用中」與編輯狀態分開管理')el.remove();
      });
    }
    let title=head?.querySelector('h3')||[...card.querySelectorAll('h2,h3')].find(el=>(el.textContent||'').includes('活動列表'));
    if(title&&!title.querySelector('.surveyListInfoBtnV776')){
      title.classList.add('surveyListTitleV776');
      let btn=document.createElement('button');
      btn.type='button';
      btn.className='surveyListInfoBtnV776';
      btn.textContent='i';
      btn.title='狀態說明';
      let tip=document.createElement('span');
      tip.className='surveyListInfoTipV776';
      tip.textContent='「目前使用中」代表前台連結正在使用的活動；開放中、已截止、已結案是活動狀態，可分開管理。';
      btn.addEventListener('click',event=>{
        event.stopPropagation();
        tip.classList.toggle('show');
      });
      title.append(btn,tip);
    }
  }

  function polishSurveyArchiveTabsV776(){
    let tabs=document.getElementById('surveyArchiveTabsV775');
    if(!tabs)return;
    let labels={active:'進行中',archived:'已結案',all:'全部'};
    tabs.querySelectorAll('[data-archive-view]').forEach(btn=>{
      let key=btn.getAttribute('data-archive-view');
      if(labels[key])btn.textContent=labels[key];
    });
  }

  function polishSurveyRowsV776(){
    let table=document.getElementById('surveyTable');
    if(!table)return;
    table.querySelectorAll('tbody tr').forEach((row,index)=>{
      let s=D.surveys[index];
      if(!s)return;
      renderSurveyActionCellV776(row,s);
    });
  }

  async function collectSurveyDeleteRefsV776(surveyId){
    let refs=[],counts={};
    for(let item of surveyDeleteCollectionsV776()){
      counts[item.name]=0;
      try{
        let snap=await col(item.name).where('surveyId','==',surveyId).get();
        snap.docs.forEach(d=>{refs.push(d.ref);counts[item.name]++});
        if(item.name==='surveyManagers'){
          let seen=new Set(snap.docs.map(d=>d.id));
          let all=await col('surveyManagers').get();
          all.docs.forEach(d=>{
            if(!seen.has(d.id)&&String(d.id).startsWith(surveyId+'__')){
              refs.push(d.ref);
              counts[item.name]++;
            }
          });
        }
      }catch(e){
        console.warn('[v7.76] collect delete refs failed',item.name,e);
      }
    }
    try{
      let fin=await doc('finalDecision',surveyId).get();
      if(fin.exists){refs.push(fin.ref);counts.finalDecision=1}else counts.finalDecision=0;
    }catch(e){
      console.warn('[v7.76] finalDecision check failed',e);
      counts.finalDecision=0;
    }
    refs.push(doc('surveys',surveyId));
    counts.surveys=1;
    return {refs,counts};
  }

  async function commitDeleteRefsV776(refs){
    let list=[...refs];
    while(list.length){
      let batch=db.batch();
      list.splice(0,430).forEach(ref=>batch.delete(ref));
      await batch.commit();
    }
  }

  function showDeleteSurveyModalV776(id){
    if(!isSystemAdmin)return alert('只有系統管理員可以永久刪除活動');
    let s=D.surveys.find(x=>x.id===id);
    if(!s)return alert('找不到活動資料，請重新整理後再試一次');
    document.querySelectorAll('.deleteSurveyModalV776').forEach(el=>el.remove());
    let overlay=document.createElement('div');
    overlay.className='deleteSurveyModalV776';
    overlay.innerHTML=`<div class="deleteSurveyDialogV776" role="dialog" aria-modal="true" aria-label="永久刪除活動">
      <button type="button" class="deleteSurveyCloseV776" aria-label="關閉">×</button>
      <h3>永久刪除活動</h3>
      <p class="muted">這會刪除「${esc(s.title||id)}」及本活動的填寫資料。此操作無法復原。</p>
      <div class="deleteSurveyScopeV776">
        <b>會一起刪除</b>
        <ul>
          <li>活動基本資料、日期清單、餐廳資料</li>
          <li>同仁填寫回覆、最終決議</li>
          <li>本活動的填寫／預算資格與權限指派</li>
        </ul>
        <b>會保留</b>
        <ul>
          <li>人員主檔、部門主檔</li>
          <li>操作紀錄與登入紀錄</li>
        </ul>
      </div>
      <label class="field deleteConfirmFieldV776">請輸入 DELETE 確認刪除
        <input class="deleteConfirmInputV776" autocomplete="off" placeholder="DELETE">
      </label>
      <div class="btns deleteSurveyActionsV776">
        <button type="button" class="btn deleteCancelV776">取消</button>
        <button type="button" class="btn red deleteConfirmBtnV776" disabled>永久刪除</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    let input=overlay.querySelector('.deleteConfirmInputV776');
    let confirmBtn=overlay.querySelector('.deleteConfirmBtnV776');
    let close=()=>overlay.remove();
    overlay.querySelector('.deleteSurveyCloseV776').onclick=close;
    overlay.querySelector('.deleteCancelV776').onclick=close;
    input.addEventListener('input',()=>{confirmBtn.disabled=input.value.trim()!=='DELETE'});
    confirmBtn.onclick=async()=>{
      if(input.value.trim()!=='DELETE')return;
      confirmBtn.disabled=true;
      confirmBtn.textContent='刪除中…';
      try{
        await deleteSurveyWithRelationsV776(id);
        close();
      }catch(e){
        console.error('[v7.76] delete survey failed',e);
        alert('刪除失敗，請確認 Firestore 規則與網路狀態後再試一次。');
        confirmBtn.disabled=false;
        confirmBtn.textContent='永久刪除';
      }
    };
    setTimeout(()=>input.focus(),50);
  }

  async function deleteSurveyWithRelationsV776(id){
    let before=typeof auditReadDocV760==='function'?await auditReadDocV760('surveys',id):(D.surveys.find(x=>x.id===id)||null);
    let {refs,counts}=await collectSurveyDeleteRefsV776(id);
    if(typeof writeAuditDetailV760==='function'){
      await writeAuditDetailV760({
        action:'永久刪除',
        targetType:'活動',
        targetId:id,
        targetLabel:before?.title||id,
        before:{...(before||{}),deleteCounts:counts},
        after:{deleted:true,deleteCounts:counts},
        fields:['title','status','archived','deleteCounts','deleted'],
        surveyId:id,
        summary:'永久刪除活動「'+(before?.title||id)+'」及關聯資料'
      });
    }else if(typeof writeAuditV711==='function'){
      await writeAuditV711('永久刪除','活動',id,'永久刪除活動「'+(before?.title||id)+'」及關聯資料',id);
    }
    await commitDeleteRefsV776(refs);
    if(activeSurveyId===id)activeSurveyId=null;
    if(editingSurveyId===id){surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false}
    await loadAll();
    renderFront();
    renderAdmin();
    toast('活動與關聯資料已刪除');
  }

  const renderSurveyPanelBeforeV776=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV776();
    installSurveyListInfoV776();
    polishSurveyArchiveTabsV776();
    polishSurveyRowsV776();
  };

  const renderAdminBeforeV776=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV776();
    installSurveyListInfoV776();
    polishSurveyArchiveTabsV776();
    polishSurveyRowsV776();
  };

  window.showDeleteSurveyModalV776=showDeleteSurveyModalV776;
  window.deleteSurveyWithRelationsV776=deleteSurveyWithRelationsV776;
})();

// ===== 活動列表標題整理、登入紀錄收斂、未填名單代填 =====
(function(){
  let manualLoginAttemptV777=false;
  let manualLogoutAttemptV777=false;
  const rawWriteLoginV777=typeof writeLoginV711==='function'?writeLoginV711:null;
  const baseResolveAccessV777=typeof resolveAccessV711==='function'?resolveAccessV711:resolveAccess;

  function formatLocalDateTimeV777(date){
    let d=date instanceof Date?date:new Date();
    if(Number.isNaN(d.getTime()))d=new Date();
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${d.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})}`;
  }
  window.formatLocalDateTimeV777=formatLocalDateTimeV777;

  async function writeLoginManualV777(result,reason=''){
    if(typeof rawWriteLoginV777!=='function')return;
    await rawWriteLoginV777(result,reason);
  }

  writeLoginV711=async function(result,reason=''){
    let isLogin=result==='success'||result==='denied';
    let isLogout=result==='logout';
    if((isLogin&&manualLoginAttemptV777)||(isLogout&&manualLogoutAttemptV777)){
      return writeLoginManualV777(result,reason);
    }
  };

  resolveAccess=async function(email,uid){
    await baseResolveAccessV777(email,uid);
    if(manualLoginAttemptV777){
      await writeLoginManualV777(isAdmin?'success':'denied',isAdmin?'使用 Google 登入':'沒有後台權限');
      manualLoginAttemptV777=false;
    }
  };

  const loginGoogleBeforeV777=loginGoogle;
  loginGoogle=async function(){
    manualLoginAttemptV777=true;
    let beforeUid=currentUser?.uid||'';
    try{return await loginGoogleBeforeV777()}
    finally{
      setTimeout(()=>{
        if(manualLoginAttemptV777&&(!currentUser||currentUser.uid===beforeUid))manualLoginAttemptV777=false;
      },120000);
    }
  };

  const logoutBeforeV777=logout;
  logout=async function(){
    manualLogoutAttemptV777=true;
    try{return await logoutBeforeV777()}
    finally{manualLogoutAttemptV777=false}
  };

  function setButtonV777(text,cls,handler){
    let btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }

  function renderSurveyActionCellV777(row,s){
    if(!row||!s)return;
    let ops=row.querySelector('.operationCell,.surveyOperationCell');
    if(!ops)return;
    let archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
    let current=s.id===activeSurveyId;
    ops.classList.add('surveyActionCellV776','surveyActionCellV777');
    ops.innerHTML='';

    ops.appendChild(setButtonV777(archived?'查看':'編輯','btn',()=>archived?viewArchivedSurveyV781(s.id):editSurvey(s.id)));

    let menuItems=[];
    if(isSystemAdmin)menuItems.push({text:'複製活動',className:'',action:()=>duplicateSurveyPrompt(s.id)});
    if(isSystemAdmin||currentAccessRole==='manager'||currentAccessRole==='system'){
      menuItems.push({text:archived?'恢復進行中':'結案',className:archived?'greenTextV776':'',action:()=>window.archiveSurveyV775(s.id,!archived)});
    }
    if(isSystemAdmin)menuItems.push({text:'永久刪除',className:'dangerTextV776',action:()=>showDeleteSurveyModalV776(s.id)});

    if(menuItems.length){
      let wrap=document.createElement('div');
      wrap.className='surveyMoreV776 surveyMoreV777';
      let menuEl=document.createElement('div');
      menuEl.className='surveyMoreMenuV776';
      let more=setButtonV777('更多','btn surveyMoreBtnV776',event=>{
        event.stopPropagation();
        document.querySelectorAll('.surveyMoreMenuV776.show').forEach(menu=>{if(menu!==menuEl)menu.classList.remove('show')});
        menuEl.classList.toggle('show');
      });
      menuItems.forEach(item=>{
        let itemBtn=setButtonV777(item.text,'surveyMoreItemV776 '+(item.className||''),event=>{
          event.stopPropagation();
          menuEl.classList.remove('show');
          item.action();
        });
        menuEl.appendChild(itemBtn);
      });
      wrap.append(more,menuEl);
      ops.appendChild(wrap);
    }

    if(!current&&!archived){
      ops.appendChild(setButtonV777('設為目前','btn green currentSurveyBtnV777',()=>setActiveSurvey(s.id)));
    }
  }

  function polishSurveyRowsV777(){
    let table=document.getElementById('surveyTable');
    if(!table)return;
    table.querySelectorAll('tbody tr').forEach((row,index)=>{
      let s=D.surveys[index];
      if(s)renderSurveyActionCellV777(row,s);
    });
  }

  function installSurveyListHeaderV777(){
    let table=document.getElementById('surveyTable');
    if(!table)return;
    let card=table.closest('.card')||table.parentElement;
    if(!card)return;
    let head=card.querySelector('.surveyListHead')||card.querySelector('.cardHead')||card.querySelector('h3')?.parentElement;
    let title=[...card.querySelectorAll('h2,h3')].find(el=>(el.textContent||'').includes('活動列表'));
    if(!head&&title){
      head=document.createElement('div');
      head.className='surveyListHead';
      title.parentNode.insertBefore(head,title);
      head.appendChild(title);
    }
    if(!head)return;
    head.classList.add('surveyListHeadV777');
    head.querySelectorAll('.surveyListInfoBtnV776,.surveyListInfoTipV776').forEach(el=>el.remove());
    if(title){
      title.classList.remove('surveyListTitleV776');
      title.textContent='活動列表';
    }
    let tabs=document.getElementById('surveyArchiveTabsV775');
    if(tabs){
      tabs.classList.add('surveyArchiveTabsInHeadV777');
      head.appendChild(tabs);
    }
    let desc=card.querySelector('.surveyListDescV777');
    if(!desc){
      desc=document.createElement('p');
      desc.className='muted surveyListDescV777';
      head.insertAdjacentElement('afterend',desc);
    }
    desc.textContent='「目前使用中」代表前台連結正在使用的活動；開放、截止、結案為活動狀態，兩者可分開管理。';
  }

  function memberDraftResponseV777(memberId){
    let m=memberById(memberId);
    if(!m)return null;
    return {
      id:activeSurveyId+'_'+m.id,
      surveyId:activeSurveyId,
      memberId:m.id,
      departmentName:m.department||m.departmentName||'',
      memberName:m.name||m.memberName||'',
      employeeNo:m.employeeNo||m.empNo||'',
      cannotAttend:false,
      dateIds:[],
      restaurantRanks:[],
      note:'',
      submittedByAdmin:true
    };
  }

  function finalDecisionCompletedV935(){return !!(D.final?.finalDateId&&D.final?.finalRestaurantId)}

  window.startProxyResponseV777=async function(memberId){
    if(!canManage())return alert('此帳號只有檢視權限，無法代填問卷');
    if(!activeSurveyId)return alert('請先選擇活動');
    let existing=D.responses.find(r=>r.memberId===memberId);
    if(existing)return editResponse(existing.id);
    if(finalDecisionCompletedV935()){
      const goFinal=window.adminConfirmV908
        ? await window.adminConfirmV908('本活動已完成最終日期與餐廳決議，後續名單請改由「最終決議」頁面的「最終出席名單調整」辦理。\n\n是否前往該功能？','已完成最終決議')
        : confirm('本活動已完成最終決議，是否前往「最終出席名單調整」？');
      if(goFinal)window.openFinalAttendanceAdjustmentV935?.();
      return;
    }
    let draft=memberDraftResponseV777(memberId);
    if(!draft)return alert('找不到此人員資料，請重新整理後再試一次');
    if(isDeadlinePassed(activeSurvey()?.deadline)){
      let proceed=window.adminConfirmV908?await window.adminConfirmV908('目前問卷已截止調查，繼續協助填寫將影響統計結果。\n\n是否仍要替此同仁填寫問卷？','問卷已截止'):confirm('目前問卷已截止調查，是否仍要繼續協助填寫？');
      if(!proceed)return;
      draft.assistedAfterDeadline=true;
    }
    window.proxyResponseSeedV777=draft;
    D.responses.push(draft);
    editResponse(draft.id);
    if(responseEditStatus)responseEditStatus.textContent=draft.assistedAfterDeadline?'目前為截止後管理者代填模式，儲存後會列入本活動統計。':'目前為管理者代填模式，儲存後會列入本活動統計。';
  };

  const closeResponseEditorBeforeV777=closeResponseEditor;
  closeResponseEditor=function(){
    let closingId=editingResponseId;
    closeResponseEditorBeforeV777();
    if(window.proxyResponseSeedV777&&window.proxyResponseSeedV777.id===closingId){
      D.responses=D.responses.filter(r=>r.id!==closingId);
      window.proxyResponseSeedV777=null;
    }
  };

  const saveResponseEditBeforeV777=saveResponseEdit;
  saveResponseEdit=async function(){
    let proxyId=window.proxyResponseSeedV777?.id||'';
    try{return await saveResponseEditBeforeV777()}
    finally{
      if(proxyId)window.proxyResponseSeedV777=null;
    }
  };

  const renderSurveyPanelBeforeV777=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV777();
    installSurveyListHeaderV777();
    polishSurveyRowsV777();
  };

  const renderAdminBeforeV777=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV777();
    installSurveyListHeaderV777();
    polishSurveyRowsV777();
  };

})();
