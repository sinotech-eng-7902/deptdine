/* 相容層：最終出席調整、預算與活動分類。 */

// ===== 最終出席名單調整（不修改原始問卷結果） =====
(function installFinalAttendanceAdjustmentV782(){
  const ADJUST_REASONS_V782=['臨時無法參加','後續確認可參加','其他'];

  function adjustmentListV782(){
    return Array.isArray(D.final?.attendanceAdjustments)?D.final.attendanceAdjustments:[];
  }
  function memberBriefV782(m){
    return {
      memberId:m?.id||'',
      department:m?.department||m?.departmentName||'',
      name:m?.name||m?.employeeName||'',
      employeeNo:m?.employeeNo||m?.empNo||''
    };
  }
  function responseBriefMemberV782(r){
    return {
      memberId:r?.memberId||'',
      department:r?.departmentName||'',
      name:r?.memberName||'',
      employeeNo:r?.employeeNo||''
    };
  }
  function memberSortV782(a,b){
    const depA=a.department||a.departmentName||a.departmentName||'',depB=b.department||b.departmentName||'';
    const noA=a.employeeNo||a.empNo||'',noB=b.employeeNo||b.empNo||'';
    return String(depA).localeCompare(String(depB),'zh-Hant')||
      String(noA).localeCompare(String(noB),'zh-Hant',{numeric:true,sensitivity:'base'})||
      String(a.name||a.memberName||'').localeCompare(String(b.name||b.memberName||''),'zh-Hant');
  }
  function latestAdjustmentMapV782(){
    const map=new Map();
    adjustmentListV782().forEach(item=>{
      if(!item?.memberId)return;
      const prev=map.get(item.memberId);
      if(!prev||Number(item.createdAtMillis||0)>=Number(prev.createdAtMillis||0))map.set(item.memberId,item);
    });
    return map;
  }
  function finalAttendanceRowsV782(dateId){
    if(!dateId)return [];
    const rows=new Map();
    attendeeResponsesForDate(dateId).forEach(r=>{
      rows.set(r.memberId,{member:responseBriefMemberV782(r),response:r,source:'問卷填寫',adjustment:null});
    });
    const membersById=new Map(targetMembers().map(m=>[m.id,m]));
    latestAdjustmentMapV782().forEach(adj=>{
      const m=membersById.get(adj.memberId)||memberById(adj.memberId)||null;
      if(adj.action==='remove'){
        rows.delete(adj.memberId);
      }else if(adj.action==='add'&&m){
        rows.set(adj.memberId,{member:memberBriefV782(m),response:D.responses.find(r=>r.memberId===adj.memberId)||null,source:'手動加入',adjustment:adj});
      }
    });
    return [...rows.values()].sort((a,b)=>memberSortV782(a.member,b.member));
  }
  function finalBudgetRowsV782(dateId){
    return finalAttendanceRowsV782(dateId).filter(row=>memberBudgetEligible(memberById(row.member.memberId)));
  }
  function finalRemovedRowsV782(dateId){
    const base=new Map(attendeeResponsesForDate(dateId).map(r=>[r.memberId,r]));
    return adjustmentListV782()
      .filter(x=>x.action==='remove'&&base.has(x.memberId))
      .map(x=>({adjustment:x,response:base.get(x.memberId),member:responseBriefMemberV782(base.get(x.memberId))}))
      .sort((a,b)=>memberSortV782(a.member,b.member));
  }
  function adjustmentBadgeV782(action){
    return action==='add'
      ?'<span class="badge green">加入出席</span>'
      :'<span class="badge red">移除出席</span>';
  }
  function renderAdjustmentEditorV782(){
    const options=targetMembers().slice().sort(memberSortV782).map(m=>{
      const label=[m.department||m.departmentName||'',m.employeeNo||m.empNo||'',m.name||''].filter(Boolean).join(' ');
      return `<option value="${escAttr(m.id)}">${esc(label)}</option>`;
    }).join('');
    const reasonOptions=ADJUST_REASONS_V782.map(x=>`<option value="${escAttr(x)}">${esc(x)}</option>`).join('');
    const rows=adjustmentListV782().slice().sort((a,b)=>Number(b.createdAtMillis||0)-Number(a.createdAtMillis||0)).map(item=>{
      const m=memberById(item.memberId)||item.member||{};
      const dep=item.member?.department||m.department||m.departmentName||'';
      const name=item.member?.name||m.name||'';
      const emp=item.member?.employeeNo||m.employeeNo||m.empNo||'';
      return `<tr><td>${esc(dep)}</td><td><b>${esc(name)}</b></td><td>${esc(emp)}</td><td>${adjustmentBadgeV782(item.action)}</td><td>${esc(item.reason||'')}</td><td>${esc(item.note||'—')}</td><td>${esc(item.actorName||item.actorEmail||'')}</td><td>${esc(item.createdAtText||'')}</td><td class="operationCell">${canManage()?`<button class="btn red" onclick="removeFinalAttendanceAdjustmentV782('${escAttr(item.id)}')">刪除</button>`:'—'}</td></tr>`;
    });
    return `<section class="finalGroup finalAdjustmentBoxV782">
      <div class="finalGroupHead"><h4>最終出席名單調整</h4><span class="countBadge">${adjustmentListV782().length} 筆</span></div>
      <p class="muted">此處只調整最終出席名單，不會修改同仁原始問卷內容。</p>
      ${canManage()?`<div class="finalAdjustFormV782">
        <div class="field"><label>人員</label><select id="finalAdjustMemberV782"><option value="">請選擇人員</option>${options}</select></div>
        <div class="field"><label>調整方式</label><select id="finalAdjustActionV782"><option value="remove">移除出席</option><option value="add">加入出席</option></select></div>
        <div class="field"><label>原因</label><select id="finalAdjustReasonV782">${reasonOptions}</select></div>
        <div class="field"><label>備註（選填）</label><input id="finalAdjustNoteV782" maxlength="50" placeholder="選其他時可補充說明"></div>
        <button class="btn primary" type="button" onclick="addFinalAttendanceAdjustmentV782()">新增調整</button>
      </div>`:''}
      ${table(['部門','姓名','員編','調整','原因','備註','調整人','時間','操作'],rows)}
    </section>`;
  }
  function renderFinalAttendancePreviewV782(){
    let box=document.getElementById('finalAttendancePreview');if(!box)return;
    let dateId=finalDate.value;
    if(!dateId){box.innerHTML='<div class="finalEmpty">請先選擇最終日期，系統將自動整理當天出席名單。</div>'+renderAdjustmentEditorV782();return}
    let date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===finalRest.value);
    let attendingRows=finalAttendanceRowsV782(dateId),budgetRows=finalBudgetRowsV782(dateId);
    let originalAttending=attendeeResponsesForDate(dateId),removedRows=finalRemovedRowsV782(dateId);
    let unavailable=unavailableResponsesForDate(dateId),missing=missingMembers();
    let addedCount=attendingRows.filter(x=>x.source==='手動加入').length,removedCount=removedRows.length;
    let budget=activityBudgetPerPerson(),cost=typeof restaurantCostV712==='function'?restaurantCostV712(rest,attendingRows.length):{total:moneyValue(rest?.price)===null?null:moneyValue(rest?.price)*attendingRows.length,serviceFee:null};
    let budgetTotal=budget===null?null:budget*budgetRows.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total;
    let financeHtml=rest?`<section class="finalGroup finalCostBox"><div class="finalGroupHead"><h4>餐費試算</h4><span class="countBadge">${attendingRows.length} 人</span></div><div class="finalCostGrid"><div><span>最終餐廳</span><strong>${esc(rest.name||'')}</strong></div><div><span>問卷可出席</span><strong>${originalAttending.length} 人</strong></div><div><span>手動加入</span><strong>${addedCount} 人</strong></div><div><span>手動移除</span><strong>${removedCount} 人</strong></div><div><span>最終出席</span><strong>${attendingRows.length} 人</strong></div><div><span>預算人數</span><strong>${budgetRows.length} 人</strong></div><div><span>每人預算</span><strong>${budget===null?'—':esc(moneyText(budget))+' 元'}</strong></div><div><span>餐費總額</span><strong>${cost.total===null?'—':esc(moneyText(cost.total))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">最終出席人數已納入手動加入／移除調整；原始問卷結果不會被改動。</p></section>`:'<section class="finalGroup finalCostBox"><div class="finalEmpty">選擇最終餐廳後，會依最終出席人數自動試算預算與小計。</div></section>';
    box.innerHTML=`${financeHtml}<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>${esc(date?.label||'最終日期')}問卷可出席</span><strong>${originalAttending.length}</strong></div><div class="finalAttendanceKpi"><span>手動加入</span><strong>${addedCount}</strong></div><div class="finalAttendanceKpi"><span>手動移除</span><strong>${removedCount}</strong></div><div class="finalAttendanceKpi"><span>最終出席人數</span><strong>${attendingRows.length}</strong></div></div><section class="finalGroup"><div class="finalGroupHead"><h4>最終出席名單</h4><span class="countBadge">${attendingRows.length} 人</span></div>${table(['部門','姓名','員編','來源','預算資格','備註'],attendingRows.map(row=>`<tr><td>${esc(row.member.department||'')}</td><td><b>${esc(row.member.name||'')}</b></td><td>${esc(row.member.employeeNo||'')}</td><td>${esc(row.source)}</td><td><span class="badge ${memberBudgetEligible(memberById(row.member.memberId))?'green':'gray'}">${memberBudgetEligible(memberById(row.member.memberId))?'納入預算':'不納入預算'}</span></td><td>${esc(row.adjustment?.note||row.response?.note||'—')}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>手動移除名單</h4><span class="countBadge warn">${removedRows.length} 人</span></div>${table(['部門','姓名','員編','原因','備註'],removedRows.map(row=>`<tr><td>${esc(row.member.department||'')}</td><td><b>${esc(row.member.name||'')}</b></td><td>${esc(row.member.employeeNo||'')}</td><td>${esc(row.adjustment.reason||'')}</td><td>${esc(row.adjustment.note||'—')}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>已填但當天無法出席</h4><span class="countBadge warn">${unavailable.length} 人</span></div>${table(['部門','姓名','員編','原因'],unavailable.map(r=>`<tr><td>${esc(r.departmentName||'')}</td><td><b>${esc(r.memberName||'')}</b></td><td>${esc(r.employeeNo||'')}</td><td>${r.cannotAttend?'不克參加':'未選擇此日期'}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>尚未填寫</h4><span class="countBadge ${missing.length?'warn':''}">${missing.length} 人</span></div>${table(['部門','姓名','員編'],missing.map(m=>`<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name||'')}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td></tr>`))}</section>${renderAdjustmentEditorV782()}`;
  }
  async function addFinalAttendanceAdjustmentV782(){
    if(!canManage())return alert('此帳號只有檢視權限');
    if(!activeSurveyId)return alert('請先選擇活動');
    const memberId=document.getElementById('finalAdjustMemberV782')?.value||'';
    const action=document.getElementById('finalAdjustActionV782')?.value||'remove';
    const reason=document.getElementById('finalAdjustReasonV782')?.value||'';
    const note=(document.getElementById('finalAdjustNoteV782')?.value||'').trim();
    const m=targetMembers().find(x=>x.id===memberId)||memberById(memberId);
    if(!m)return alert('請選擇要調整的人員');
    if(!ADJUST_REASONS_V782.includes(reason))return alert('請選擇調整原因');
    if(reason==='其他'&&!note)return alert('原因選擇「其他」時，請補充備註');
    const before=await auditReadDocV760('finalDecision',activeSurveyId);
    const now=new Date();
    const next=[...adjustmentListV782(),{
      id:'adj_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      memberId,member:memberBriefV782(m),action,reason,note,
      actorEmail:String(currentUser?.email||'').toLowerCase(),
      actorName:currentUserDisplayText?.()||currentUser?.displayName||currentUser?.email||'',
      createdAtMillis:now.getTime(),
      createdAtText:formatDateTimeV784(now)
    }];
    await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,attendanceAdjustments:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const after=await auditReadDocV760('finalDecision',activeSurveyId);
    await writeAuditDetailV760({action:'修改',targetType:'最終出席調整',targetId:activeSurveyId,targetLabel:memberDisplayName(m)||memberId,before,after,fields:['attendanceAdjustments'],surveyId:activeSurveyId,summary:(action==='add'?'加入出席':'移除出席')+'「'+(memberDisplayName(m)||memberId)+'」'});
    await loadSurveyData();renderFront();renderAdmin();toast('最終出席調整已新增');
  }
  async function removeFinalAttendanceAdjustmentV782(id){
    if(!canManage())return alert('此帳號只有檢視權限');
    const item=adjustmentListV782().find(x=>x.id===id);
    if(!item)return alert('找不到這筆調整紀錄');
    if(!confirm('確定刪除這筆最終出席調整？'))return;
    const before=await auditReadDocV760('finalDecision',activeSurveyId);
    const next=adjustmentListV782().filter(x=>x.id!==id);
    await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,attendanceAdjustments:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const after=await auditReadDocV760('finalDecision',activeSurveyId);
    await writeAuditDetailV760({action:'刪除',targetType:'最終出席調整',targetId:activeSurveyId,targetLabel:item.member?.name||item.memberId,before,after,fields:['attendanceAdjustments'],surveyId:activeSurveyId});
    await loadSurveyData();renderFront();renderAdmin();toast('最終出席調整已刪除');
  }
  const renderFinalPanelBaseV782=renderFinalPanel;
  renderFinalPanel=function(){
    renderFinalPanelBaseV782();
    renderFinalAttendancePreviewV782();
  };
  renderFinalAttendancePreview=renderFinalAttendancePreviewV782;

  const exportExcelBaseV782=exportExcel;
  exportExcel=function(){
    if(!window.XLSX)return exportExcelBaseV782();
    const originalWrite=XLSX.writeFile;
    XLSX.writeFile=function(workbook,filename){
      const finalDateId=D.final?.finalDateId||'',date=D.dates.find(d=>d.id===finalDateId),rest=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId);
      const rows=finalAttendanceRowsV782(finalDateId),budgetRows=finalBudgetRowsV782(finalDateId),removedRows=finalRemovedRowsV782(finalDateId),cost=typeof restaurantCostV712==='function'?restaurantCostV712(rest,rows.length):{total:moneyValue(rest?.price)===null?null:moneyValue(rest?.price)*rows.length};
      const budget=activityBudgetPerPerson(),budgetTotal=budget===null?null:budget*budgetRows.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total;
      const finalRows=[['最終決議與出席名單'],['活動',activeSurvey()?.title||''],['最終日期',date?.label||'尚未設定'],['最終餐廳',rest?.name||'尚未設定'],['問卷可出席人數',attendeeResponsesForDate(finalDateId).length],['手動加入人數',rows.filter(x=>x.source==='手動加入').length],['手動移除人數',removedRows.length],['最終出席人數',rows.length],['預算人數',budgetRows.length],['每人預算',moneyText(budget)],['餐費總額',moneyText(cost.total)],['總額差異',budgetStatusText(totalDiff)],['決議說明',D.final?.note||''],[],['最終出席名單'],['部門','姓名','員編','來源','預算資格','備註'],...rows.map(row=>[row.member.department||'',row.member.name||'',row.member.employeeNo||'',row.source,memberBudgetEligible(memberById(row.member.memberId))?'納入預算':'不納入預算',row.adjustment?.note||row.response?.note||'']),[],['手動移除名單'],['部門','姓名','員編','原因','備註'],...removedRows.map(row=>[row.member.department||'',row.member.name||'',row.member.employeeNo||'',row.adjustment.reason||'',row.adjustment.note||''])];
      const sheet=XLSX.utils.aoa_to_sheet(finalRows);sheet['!merges']=[XLSX.utils.decode_range('A1:F1')];sheet['!cols']=[{wch:18},{wch:18},{wch:14},{wch:14},{wch:14},{wch:34}];workbook.Sheets['最終出席名單']=sheet;
      return originalWrite.call(XLSX,workbook,filename);
    };
    try{return exportExcelBaseV782()}finally{XLSX.writeFile=originalWrite}
  };

  function installFinalAdjustmentStylesV782(){
    if(document.getElementById('finalAdjustmentStylesV782'))return;
    const style=document.createElement('style');
    style.id='finalAdjustmentStylesV782';
    style.textContent='.finalAdjustFormV782{display:grid;grid-template-columns:minmax(220px,1.2fr) 150px 160px minmax(180px,1fr) auto;gap:12px;align-items:end;margin:14px 0}.finalAdjustmentBoxV782 .table{margin-top:10px}@media(max-width:900px){.finalAdjustFormV782{grid-template-columns:1fr}.finalAdjustFormV782 .btn{width:100%}}';
    document.head.appendChild(style);
  }
  document.addEventListener('DOMContentLoaded',installFinalAdjustmentStylesV782);
  installFinalAdjustmentStylesV782();
  window.addFinalAttendanceAdjustmentV782=addFinalAttendanceAdjustmentV782;
  window.removeFinalAttendanceAdjustmentV782=removeFinalAttendanceAdjustmentV782;
  window.finalAttendanceRowsV782=finalAttendanceRowsV782;
})();

// ===== 確保最終出席調整版面入口最後生效 =====
(function ensureFinalAttendanceAdjustmentLayoutV783(){
  if(typeof window.renderFinalAttendancePreviewV783!=='function')return;
  const renderFinalPanelBeforeV783Final=renderFinalPanel;
  renderFinalPanel=function(){
    renderFinalPanelBeforeV783Final();
    window.renderFinalAttendancePreviewV783();
  };
  renderFinalAttendancePreview=window.renderFinalAttendancePreviewV783;
})();

// ===== 預算儲存、時間格式與列表操作優化 =====
function parseDateTimeV784(value){
  if(!value)return null;
  if(value?.toDate)return value.toDate();
  if(value instanceof Date)return value;
  if(Number.isFinite(value))return new Date(value);
  if(Number.isFinite(value?.seconds))return new Date(value.seconds*1000);
  const raw=String(value||'').trim();
  if(!raw)return null;
  let d=new Date(raw);
  if(!Number.isNaN(d.getTime()))return d;
  let m=raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(上午|下午)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if(m){
    let h=Number(m[5]);
    if(m[4]==='下午'&&h<12)h+=12;
    if(m[4]==='上午'&&h===12)h=0;
    d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),h,Number(m[6]),Number(m[7]||0));
    return Number.isNaN(d.getTime())?null:d;
  }
  return null;
}
function formatDateTimeV784(value){
  const d=parseDateTimeV784(value);
  if(!d)return value?String(value):'';
  const y=d.getFullYear(),mo=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  const ampm=d.getHours()<12?'上午':'下午';
  const h=String(d.getHours()%12||12).padStart(2,'0');
  const mi=String(d.getMinutes()).padStart(2,'0');
  const s=String(d.getSeconds()).padStart(2,'0');
  return `${y}/${mo}/${day} ${ampm} ${h}:${mi}:${s}`;
}
(function installV784Enhancements(){

  function makeBtnV784(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }
  function enhanceSurveyActionRowsV784(){
    const tableEl=document.getElementById('surveyTable');
    if(!tableEl)return;
    tableEl.querySelectorAll('tbody tr').forEach((row,index)=>{
      const s=D.surveys[index];
      if(!s)return;
      const ops=row.querySelector('.operationCell,.surveyOperationCell');
      if(!ops)return;
      const archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
      const current=s.id===activeSurveyId;
      ops.classList.remove('surveyOperationCell','surveyActionCellV776','surveyActionCellV777','surveyActionCellV784');
      ops.classList.add('surveyActionCellV784');
      ops.innerHTML='';
      const group=document.createElement('div');
      group.className='actionButtonGroupV750 surveyActionGroupV790';
      group.appendChild(makeBtnV784(archived?'查看':'編輯','btn',()=>archived?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
      if(isSystemAdmin)group.appendChild(makeBtnV784('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(isSystemAdmin||currentAccessRole==='manager'||currentAccessRole==='system')group.appendChild(makeBtnV784(archived?'恢復進行中':'結案',archived?'btn green':'btn',()=>window.archiveSurveyV775(s.id,!archived)));
      if(isSystemAdmin)group.appendChild(makeBtnV784('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV784('設為目前','btn green currentSurveyBtnV777 currentActionV787',()=>setActiveSurvey(s.id)));
      ops.appendChild(group);
    });
  }

  const renderSurveyPanelBeforeV784=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV784();
    enhanceSurveyActionRowsV784();
  };
  const renderAdminBeforeV784=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV784();
    enhanceSurveyActionRowsV784();
  };

  const renderResultsBeforeV784=renderResults;
  renderResults=function(){
    renderResultsBeforeV784();
    document.querySelectorAll('.responseRow').forEach(row=>{
      const id=row.dataset.responseId;
      const r=D.responses.find(x=>x.id===id);
      const cell=row.querySelector('.responseTime');
      if(r&&cell)cell.textContent=formatDateTimeV784(r.submittedAt||r.submittedAtText);
    });
  };

  const saveSurveyBeforeV784=saveSurvey;
  saveSurvey=async function(){
    const input=document.getElementById('budgetPerPersonMirrorV724')||budgetPerPerson;
    if(input&&budgetPerPerson)budgetPerPerson.value=input.value;
    return saveSurveyBeforeV784();
  };

  const addFinalAdjustmentBeforeV784=window.addFinalAttendanceAdjustmentV783||window.addFinalAttendanceAdjustmentV782;
  if(addFinalAdjustmentBeforeV784){
    window.addFinalAttendanceAdjustmentV783=async function(){
      const result=await addFinalAdjustmentBeforeV784();
      if(activeSurveyId&&Array.isArray(D.final?.attendanceAdjustments)){
        const latest=D.final.attendanceAdjustments[D.final.attendanceAdjustments.length-1];
        if(latest?.createdAtText)latest.createdAtText=formatDateTimeV784(latest.createdAtMillis||latest.createdAtText);
      }
      return result;
    };
  }

})();

// ===== 活動發起者、活動分類與建立者刪除權 =====
(function(){
  let surveyListScopeV793='owned';

  function makeBtnV793(text,cls,handler){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=cls||'btn';
    btn.textContent=text;
    btn.addEventListener('click',handler);
    return btn;
  }
  function currentEmailV793(){
    return normalizeEmail(currentUser?.email||'');
  }
  function surveyCreatorEmailV793(s){
    return normalizeEmail(s?.createdByEmail||s?.creatorEmail||s?.ownerEmail||'');
  }
  function isSurveyCreatorV793(s){
    return !!currentEmailV793() && surveyCreatorEmailV793(s)===currentEmailV793();
  }
  function assignmentForSurveyV793(id){
    return surveyAssignments.find(a=>a.surveyId===id&&a.enabled!==false)||null;
  }
  function canManageSurveyV793(s){
    return isSystemAdmin || assignmentForSurveyV793(s?.id)?.role==='manager';
  }
  function canDeleteSurveyV793(s){
    return isSystemAdmin || isSurveyCreatorV793(s);
  }
  function creatorLabelV793(s){
    return String(s?.createdByName||s?.creatorName||s?.ownerName||'').trim() || (surveyCreatorEmailV793(s)?surveyCreatorEmailV793(s):'未記錄');
  }
  function participantLabelsV793(s){
    let rows=(D.allSurveyManagersV793||D.managers||[]).filter(m=>m.surveyId===s?.id&&m.enabled!==false&&m.role==='manager');
    return rows.map(m=>memberDisplayName(findMemberByGoogleEmail(m.email))||m.displayName||'未對應人員').filter(Boolean).join('、')||'—';
  }
  function visibleSurveysV793(){
    let current=currentEmailV793();
    if(surveyListScopeV793==='all'&&isSystemAdmin)return D.surveys;
    if(surveyListScopeV793==='owned')return D.surveys.filter(isSurveyCreatorV793);
    return D.surveys.filter(s=>assignmentForSurveyV793(s.id)&&surveyCreatorEmailV793(s)!==current);
  }
  function ensureSurveyScopeV793(){
    if(isSystemAdmin){
      if(!['owned','joined','all'].includes(surveyListScopeV793))surveyListScopeV793='all';
      return;
    }
    if(!D.surveys.some(isSurveyCreatorV793)&&surveyListScopeV793==='owned')surveyListScopeV793='joined';
    if(!['owned','joined'].includes(surveyListScopeV793))surveyListScopeV793='owned';
  }
  function setSurveyScopeV793(scope){
    surveyListScopeV793=scope;
    renderSurveyPanel();
  }
  function roleTextForSurveyV793(s){
    if(isSystemAdmin)return isSurveyCreatorV793(s)?'系統管理員／發起人':'系統管理員';
    let a=assignmentForSurveyV793(s.id);
    if(isSurveyCreatorV793(s))return '發起人';
    return a?.role==='manager'?'活動管理者':'結果檢視者';
  }
  function buildScopeTabsV793(){
    ensureSurveyScopeV793();
    const counts={
      owned:D.surveys.filter(isSurveyCreatorV793).length,
      joined:D.surveys.filter(s=>assignmentForSurveyV793(s.id)&&!isSurveyCreatorV793(s)).length,
      all:D.surveys.length
    };
    let tabs=[['owned','我發起的活動',counts.owned],['joined','我參與的活動',counts.joined]];
    if(isSystemAdmin)tabs.push(['all','系統內所有活動',counts.all]);
    return `<div class="surveyScopeTabsV793">${tabs.map(([key,label,count])=>`<button type="button" class="${surveyListScopeV793===key?'active':''}" onclick="setSurveyScopeV793('${key}')">${label}<span>${count}</span></button>`).join('')}</div>`;
  }
  function renderSurveyRowsV793(){
    let rows=visibleSurveysV793();
    if(surveyListScopeV793==='all'&&isSystemAdmin){
      return table(['活動','狀態','建立者','活動管理者','開放／截止時間','操作'],rows.map(s=>{
        let current=s.id===activeSurveyId;
        let state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
        let start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
        let end=s.deadline?formatDeadline(s.deadline):'未設定';
        return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${state.state==='open'?'green':state.state==='upcoming'?'blue':'gray'}">${esc(state.label.replace('問卷',''))}</span></td><td>${esc(creatorLabelV793(s))}</td><td>${esc(participantLabelsV793(s))}</td><td><small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}</td><td class="operationCell"></td></tr>`;
      }));
    }
    return table(['活動','狀態','我的角色','建立者','開放／截止時間','操作'],rows.map(s=>{
      let current=s.id===activeSurveyId;
      let state=typeof surveyAvailabilityV711==='function'?surveyAvailabilityV711(s):{label:statusLabel(s.status),state:s.status==='open'?'open':'closed'};
      let start=s.openMode==='scheduled'&&s.openAt?formatDeadline(s.openAt):'立即開放';
      let end=s.deadline?formatDeadline(s.deadline):'未設定';
      return `<tr data-survey-id="${escAttr(s.id)}"><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${state.state==='open'?'green':state.state==='upcoming'?'blue':'gray'}">${esc(state.label.replace('問卷',''))}</span></td><td>${esc(roleTextForSurveyV793(s))}</td><td>${esc(creatorLabelV793(s))}</td><td><small class="muted">開放</small> ${esc(start)}<br><small class="muted">截止</small> ${esc(end)}</td><td class="operationCell"></td></tr>`;
    }));
  }
  function applySurveyActionsV793(){
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>x.id===row.dataset.surveyId);
      const ops=row.querySelector('.operationCell');
      if(!s||!ops)return;
      const archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
      const current=s.id===activeSurveyId;
      const group=document.createElement('div');
      group.className='actionButtonGroupV750 surveyActionGroupV790';
      group.appendChild(makeBtnV793(archived&&!canManageSurveyV793(s)?'查看':'編輯','btn',()=>archived&&!canManageSurveyV793(s)?viewArchivedSurveyV781(s.id):editSurvey(s.id)));
      if(canManageSurveyV793(s))group.appendChild(makeBtnV793('複製','btn',()=>duplicateSurveyPrompt(s.id)));
      if(canManageSurveyV793(s))group.appendChild(makeBtnV793(archived?'恢復進行中':'結案',archived?'btn green':'btn',()=>window.archiveSurveyV775(s.id,!archived)));
      if(canDeleteSurveyV793(s))group.appendChild(makeBtnV793('刪除','btn red',()=>showDeleteSurveyModalV776(s.id)));
      if(!current&&!archived)group.appendChild(makeBtnV793('設為目前','btn green currentSurveyBtnV777 currentActionV787',()=>setActiveSurvey(s.id)));
      ops.innerHTML='';
      ops.classList.remove('surveyOperationCell','surveyActionCellV776','surveyActionCellV777');
      ops.classList.add('surveyActionCellV784');
      ops.appendChild(group);
    });
  }

  const renderSurveyPanelBeforeV793=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV793();
    const tableBox=document.getElementById('surveyTable');
    if(!tableBox)return;
    ensureSurveyScopeV793();
    tableBox.innerHTML=buildScopeTabsV793()+renderSurveyRowsV793();
    applySurveyActionsV793();
  };

  const applyAccessUIBeforeV793=applyAccessUI;
  applyAccessUI=function(){
    applyAccessUIBeforeV793();
    let addSurvey=document.querySelector('.manageIntro>button');
    if(addSurvey)addSurvey.hidden=!isAdmin;
    document.querySelectorAll('.nav[onclick*="surveyP"]').forEach(n=>{n.hidden=!isAdmin});
    document.querySelectorAll('#dash button[onclick*="surveyP"]').forEach(b=>{b.hidden=!isAdmin});
  };

  const loadAllBeforeV793=loadAll;
  loadAll=async function(){
    await loadAllBeforeV793();
    D.allSurveyManagersV793=isSystemAdmin?await safeGetCollection('surveyManagers'):[];
  };

  const saveSurveyBeforeV793=saveSurvey;
  saveSurvey=async function(){
    if(surveyFormMode!=='new')return saveSurveyBeforeV793();
    if(!isAdmin)return alert('此帳號沒有新增活動權限');
    let title=svTitle.value.trim();if(!title){svTitle.focus();return alert('請輸入活動標題')}
    let mode=document.getElementById('svOpenMode')?.value||'immediate',openDate=document.getElementById('svOpenDate')?.value||'',openTime=document.getElementById('svOpenTime')?.value||'08:00';
    let openAt=mode==='scheduled'&&openDate?openDate+'T'+openTime:'',deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';
    if(mode==='scheduled'&&!openDate)return alert('請設定問卷開放日期');
    if(openAt&&deadlineValue&&new Date(openAt)>=new Date(deadlineValue))return alert('開放時間必須早於截止時間');
    let id='survey_'+Date.now();
    let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value),descriptionData=getRichDescriptionData();
    let budgetInput=document.getElementById('budgetPerPersonMirrorV724')||budgetPerPerson,budgetRaw=(budgetInput?.value||'').trim(),budgetValue=budgetRaw===''?null:moneyValue(budgetRaw);
    if(budgetRaw!==''&&budgetValue===null)return alert('每人預算請輸入 0 以上數字');
    let creatorEmail=currentEmailV793(),creatorName=currentUserDisplayText?.()||currentUser?.displayName||creatorEmail;
    let data={title,...descriptionData,frontInstructions:svInstructions.value.trim(),deadline:deadlineValue,openMode:mode,openAt,status:svStatus.value,allowEdit:svAllowEdit.value==='true',theme:normalizeTheme(themeSelect()?.value||'classic'),isAnonymous:false,targetDepartments:target,budgetPerPerson:budgetValue,createdByUid:currentUser?.uid||'',createdByEmail:creatorEmail,createdByName:creatorName,createdByRole:isSystemAdmin?'system':'manager',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    data.openAtTimestamp=openAt?firebase.firestore.Timestamp.fromDate(new Date(openAt)):firebase.firestore.FieldValue.delete();
    data.deadlineAtTimestamp=deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete();
    surveySaveBtn.disabled=true;surveySaveBtn.textContent='儲存中…';
    try{
      await doc('surveys',id).set(data,{merge:true});
      if(creatorEmail){
        await doc('surveyManagers',managerDocId(id,creatorEmail)).set({surveyId:id,email:creatorEmail,role:'manager',enabled:true,memberId:findMemberByGoogleEmail(creatorEmail)?.id||'',displayName:creatorName,source:'creator',createdByEmail:creatorEmail,createdByName:creatorName,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      }
      let after=await auditReadDocV760('surveys',id);
      await writeAuditDetailV760({action:'新增',targetType:'活動',targetId:id,targetLabel:after?.title||title,before:null,after,fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments','budgetPerPerson','createdByEmail','createdByName'],surveyId:id});
      activeSurveyId=id;
      surveyListScopeV793='owned';
      surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;
      await loadAll();await loadSurveyData();history.replaceState(null,'',adminHash());renderFront();renderAdmin();toast('活動已建立，並已指派你為活動管理者');
    }catch(e){console.error('save survey failed',e);alert('活動儲存失敗，請檢查網路後再試一次')}
    finally{surveySaveBtn.disabled=false;surveySaveBtn.textContent='建立活動'}
  };

  const delDocBeforeV793=delDoc;
  delDoc=async function(collection,id){
    if(collection==='surveys'){
      let s=D.surveys.find(x=>x.id===id)||await auditReadDocV760('surveys',id);
      if(!s)return alert('找不到這個活動');
      if(!canDeleteSurveyV793(s))return alert('只有系統管理員或活動發起人可以刪除這個活動');
    }
    return delDocBeforeV793(collection,id);
  };

  const showDeleteSurveyModalBeforeV793=window.showDeleteSurveyModalV776;
  if(showDeleteSurveyModalBeforeV793){
    window.showDeleteSurveyModalV776=function(id){
      let s=D.surveys.find(x=>x.id===id);
      if(s&&!canDeleteSurveyV793(s))return alert('只有系統管理員或活動發起人可以刪除這個活動');
      return showDeleteSurveyModalBeforeV793(id);
    };
    showDeleteSurveyModalV776=window.showDeleteSurveyModalV776;
  }

  duplicateSurveyV719=async function(sourceId,newTitle,opts={}){
    let source=D.surveys.find(s=>s.id===sourceId);if(!source)return alert('找不到來源活動');
    if(!canManageSurveyV793(source))return alert('此帳號沒有複製此活動的權限');
    let newId='survey_'+Date.now(),creatorEmail=currentEmailV793(),creatorName=currentUserDisplayText?.()||currentUser?.displayName||creatorEmail;
    let data={title:newTitle,deadline:'',status:'draft',allowEdit:source.allowEdit!==false,isAnonymous:false,createdByUid:currentUser?.uid||'',createdByEmail:creatorEmail,createdByName:creatorName,createdByRole:isSystemAdmin?'system':'manager',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    if(opts.description)Object.assign(data,{description:source.description||'',descriptionHtml:source.descriptionHtml||'',descriptionStyle:source.descriptionStyle||{},frontInstructions:source.frontInstructions||''});
    data.targetDepartments=opts.departments?[...(source.targetDepartments||[])]:[];
    if(opts.theme)Object.assign(data,{theme:source.theme||'classic'});
    await doc('surveys',newId).set(data,{merge:true});
    let jobs=[],sourceDates=await col('surveyDates').where('surveyId','==',sourceId).get(),sourceRestaurants=await col('restaurants').where('surveyId','==',sourceId).get(),sourceBudget=await col('budgetEligibility').where('surveyId','==',sourceId).get();
    if(opts.dates)jobs.push(...sourceDates.docs.map(d=>{let x=d.data();return col('surveyDates').add({surveyId:newId,label:x.label,sort:x.sort||0,active:x.active!==false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
    if(opts.restaurants)jobs.push(...sourceRestaurants.docs.map(d=>{let x=d.data();return col('restaurants').add({...x,surveyId:newId,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
    if(opts.budget)jobs.push(...sourceBudget.docs.map(d=>{let x=d.data();return doc('budgetEligibility',newId+'__'+x.memberId).set({...x,surveyId:newId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
    if(isSystemAdmin&&opts.access){
      let sourceManagers=await col('surveyManagers').where('surveyId','==',sourceId).get();
      jobs.push(...sourceManagers.docs.map(d=>{let x=d.data();return doc('surveyManagers',newId+'__'+x.email).set({surveyId:newId,email:x.email,role:x.role||'viewer',enabled:x.enabled!==false,memberId:x.memberId||'',displayName:x.displayName||'',source:x.source||'copied',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
    }
    if(creatorEmail){
      jobs.push(doc('surveyManagers',managerDocId(newId,creatorEmail)).set({surveyId:newId,email:creatorEmail,role:'manager',enabled:true,memberId:findMemberByGoogleEmail(creatorEmail)?.id||'',displayName:creatorName,source:'creator',createdByEmail:creatorEmail,createdByName:creatorName,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}));
    }
    await Promise.all(jobs);
    activeSurveyId=newId;surveyListScopeV793='owned';
    await loadAll();await loadSurveyData();history.replaceState(null,'',adminHash());renderFront();renderAdmin();
    if(typeof writeAuditV711==='function')await writeAuditV711('複製','活動',newId,'由「'+(source.title||sourceId)+'」複製建立「'+newTitle+'」',newId);
    toast('活動複本已建立，並已指派你為活動管理者');
  };

  window.setSurveyScopeV793=setSurveyScopeV793;
  window.canDeleteSurveyV793=canDeleteSurveyV793;
})();

// ===== 活動管理頁與新增活動開放給所有後台帳號 =====
(function(){
  const panelBeforeV794=panel;
  panel=function(id,b){
    if(id==='surveyP'){
      if(!isAdmin)return alert('此帳號沒有後台權限');
      let p=document.getElementById(id);if(!p)return;
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      p.classList.add('active');
      document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
      if(b){b.classList.add('active');adminTitle.textContent=b.textContent}
      renderAdmin();
      return;
    }
    return panelBeforeV794(id,b);
  };

  startNewSurvey=function(){
    if(!isAdmin)return alert('此帳號沒有新增活動權限');
    if(!confirmLeaveSurveyForm())return;
    surveyFormMode='new';
    editingSurveyId=null;
    surveyFormDirty=false;
    surveyEditor.dataset.formKey='';
    renderSurveyPanel();
    surveyEditor.style.display='block';
    surveyEditor.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>svTitle.focus(),250);
  };
  window.startNewSurvey=startNewSurvey;
})();

// ===== 歷史活動發起人補登與活動下拉空值防呆 =====
(function(){
  function memberOptionsV795(){
    return D.members.filter(m=>memberGoogleEmail(m)).map(m=>({
      id:m.id,
      email:memberGoogleEmail(m),
      label:memberDisplayName(m)||m.name||m.id
    }));
  }
  function creatorMissingV795(s){
    return !normalizeEmail(s?.createdByEmail||'') && !String(s?.createdByName||'').trim();
  }
  function creatorCellV795(s){
    if(!creatorMissingV795(s))return esc(String(s?.createdByName||s?.creatorName||s?.ownerName||s?.createdByEmail||'').trim());
    if(!isSystemAdmin)return '未記錄';
    return `<span class="muted">未記錄</span><br><button type="button" class="btn backfillCreatorBtnV795" onclick="openCreatorBackfillV795('${escAttr(s.id)}')">補登</button>`;
  }
  function ensureCreatorBackfillModalV795(){
    if(document.getElementById('creatorBackfillModalV795'))return;
    const modal=document.createElement('div');
    modal.id='creatorBackfillModalV795';
    modal.className='modalMask creatorBackfillModalV795';
    modal.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="補登活動發起人">
      <h3>補登活動發起人</h3>
      <p id="creatorBackfillSurveyTitleV795" class="muted"></p>
      <div class="field">
        <label for="creatorBackfillMemberV795">發起人</label>
        <select id="creatorBackfillMemberV795"></select>
        <small class="muted">補登後，此人會成為該活動的發起人與活動管理員。</small>
      </div>
      <div class="btns">
        <button type="button" class="btn" onclick="closeCreatorBackfillV795()">取消</button>
        <button type="button" class="btn primary" onclick="saveCreatorBackfillV795()">儲存</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',event=>{if(event.target===modal)closeCreatorBackfillV795()});
  }
  function openCreatorBackfillV795(id){
    if(!isSystemAdmin)return alert('此功能僅限系統管理員');
    const s=D.surveys.find(x=>x.id===id);
    if(!s)return alert('找不到這個活動');
    ensureCreatorBackfillModalV795();
    const select=document.getElementById('creatorBackfillMemberV795');
    const options=memberOptionsV795();
    select.innerHTML='<option value="">請選擇發起人</option>'+options.map(x=>`<option value="${escAttr(x.email)}">${esc(x.label)}</option>`).join('');
    document.getElementById('creatorBackfillSurveyTitleV795').textContent='活動：'+(s.title||s.id);
    document.getElementById('creatorBackfillModalV795').dataset.surveyId=id;
    document.getElementById('creatorBackfillModalV795').style.display='flex';
  }
  function closeCreatorBackfillV795(){
    const modal=document.getElementById('creatorBackfillModalV795');
    if(modal)modal.style.display='none';
  }
  async function saveCreatorBackfillV795(){
    if(!isSystemAdmin)return alert('此功能僅限系統管理員');
    const modal=document.getElementById('creatorBackfillModalV795');
    const surveyId=modal?.dataset.surveyId||'';
    const email=normalizeEmail(document.getElementById('creatorBackfillMemberV795')?.value||'');
    if(!surveyId)return alert('找不到要補登的活動');
    if(!email)return alert('請選擇發起人');
    const member=findMemberByGoogleEmail(email);
    if(!member)return alert('請從發起人清單選擇人員');
    const displayName=memberDisplayName(member);
    const backfillByEmail=normalizeEmail(currentUser?.email||'');
    const backfillByName=currentUserDisplayText?.()||currentUser?.displayName||backfillByEmail;
    try{
      await doc('surveys',surveyId).set({
        createdByUid:member.uid||member.authUid||member.googleUid||'',
        createdByEmail:email,
        createdByName:displayName,
        createdByRole:'manual',
        createdByBackfilledAt:firebase.firestore.FieldValue.serverTimestamp(),
        createdByBackfilledByEmail:backfillByEmail,
        createdByBackfilledByName:backfillByName,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      await doc('surveyManagers',managerDocId(surveyId,email)).set({
        surveyId,
        email,
        role:'manager',
        enabled:true,
        memberId:member.id||'',
        displayName,
        source:'creator_backfill',
        createdByEmail:backfillByEmail,
        createdByName:backfillByName,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      await loadAll();await loadSurveyData();renderAdmin();
      closeCreatorBackfillV795();
      toast('活動發起人已補登');
    }catch(e){
      console.error('creator backfill failed',e);
      alert('補登失敗，請確認 Firestore 規則已更新後再試一次');
    }
  }

  const setActiveSurveyBeforeV795=setActiveSurvey;
  setActiveSurvey=async function(id){
    if(!id){
      if(activeSurveySelect)activeSurveySelect.value=activeSurveyId||'';
      return;
    }
    return setActiveSurveyBeforeV795(id);
  };
  window.setActiveSurvey=setActiveSurvey;

  function applyCreatorBackfillButtonsV795(){
    if(!isSystemAdmin)return;
    const activeScope=document.querySelector('.surveyScopeTabsV793 button.active')?.textContent||'';
    if(!activeScope.includes('系統內所有活動'))return;
    document.querySelectorAll('#surveyTable tbody tr[data-survey-id]').forEach(row=>{
      const s=D.surveys.find(x=>x.id===row.dataset.surveyId);
      if(!s||!creatorMissingV795(s))return;
      const creatorCell=row.cells?.[2];
      if(!creatorCell||creatorCell.querySelector('.backfillCreatorBtnV795'))return;
      creatorCell.innerHTML=creatorCellV795(s);
    });
  }
  const renderSurveyPanelBeforeV795=renderSurveyPanel;
  renderSurveyPanel=function(){
    renderSurveyPanelBeforeV795();
    applyCreatorBackfillButtonsV795();
  };
  const renderAdminBeforeV795=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV795();
    applyCreatorBackfillButtonsV795();
  };

  window.openCreatorBackfillV795=openCreatorBackfillV795;
  window.closeCreatorBackfillV795=closeCreatorBackfillV795;
  window.saveCreatorBackfillV795=saveCreatorBackfillV795;
})();

// ===== finalizer：最後接手活動管理入口與新增流程 =====
(function(){
  function emailV797Final(value){return normalizeEmail(value||'')}
  function currentEmailV797Final(){return emailV797Final(currentUser?.email||'')}
  function currentScopeV797Final(){
    const text=document.querySelector('.surveyScopeTabsV793 button.active')?.textContent||'';
    if(text.includes('系統內所有'))return 'all';
    if(text.includes('我參與'))return 'joined';
    return 'owned';
  }
  function forceScopeTabsV797Final(scope){
    if(!document.getElementById('surveyP')?.classList.contains('active'))return;
    const box=document.getElementById('surveyTable');
    if(!box||box.querySelector('.surveyScopeTabsV793'))return;
    if(typeof window.setSurveyScopeV793==='function')window.setSurveyScopeV793(scope||currentScopeV797Final());
  }
  function ensureCreatorAssignmentV797Final(surveyId,email,name){
    if(!surveyId||isSystemAdmin)return;
    if(!surveyAssignments.some(a=>a.surveyId===surveyId&&a.enabled!==false)){
      surveyAssignments.push({id:'creator__'+surveyId,surveyId,email,role:'manager',enabled:true,displayName:name||email,source:'creator_virtual'});
    }
    currentAccessRole='manager';
  }
  async function writeCreatorManagerV797Final(id,email,name){
    if(!email)return;
    try{
      await doc('surveyManagers',managerDocId(id,email)).set({
        surveyId:id,email,role:'manager',enabled:true,
        memberId:findMemberByGoogleEmail(email)?.id||'',
        displayName:name||email,source:'creator',
        createdByEmail:email,createdByName:name||email,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }catch(e){console.warn('creator manager write skipped after survey created',e)}
  }
  async function writeCreateAuditV797Final(id,title){
    try{
      if(typeof auditReadDocV760!=='function'||typeof writeAuditDetailV760!=='function')return;
      let after=await auditReadDocV760('surveys',id);
      await writeAuditDetailV760({
        action:'新增',targetType:'活動',targetId:id,targetLabel:after?.title||title,
        before:null,after,
        fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments','budgetPerPerson','createdByEmail','createdByName'],
        surveyId:id
      });
    }catch(e){console.warn('create survey audit skipped after survey created',e)}
  }
  async function reloadAfterCreateV797Final(id){
    try{
      await loadAll();
      activeSurveyId=id;
      await loadSurveyData();
    }catch(e){
      console.warn('reload after survey create failed',e);
      activeSurveyId=id;
    }
  }

  const panelBeforeV797Final=panel;
  panel=function(id,b){
    const result=panelBeforeV797Final(id,b);
    if(id==='surveyP')setTimeout(()=>forceScopeTabsV797Final(currentScopeV797Final()),0);
    return result;
  };
  window.panel=panel;

  const startNewSurveyBeforeV797Final=startNewSurvey;
  startNewSurvey=function(){
    const result=startNewSurveyBeforeV797Final();
    setTimeout(()=>forceScopeTabsV797Final('owned'),0);
    return result;
  };
  window.startNewSurvey=startNewSurvey;

  const editSurveyBeforeV797Final=editSurvey;
  editSurvey=function(id){
    const result=editSurveyBeforeV797Final(id);
    setTimeout(()=>forceScopeTabsV797Final(currentScopeV797Final()),0);
    return result;
  };
  window.editSurvey=editSurvey;

  const saveSurveyBeforeV797Final=saveSurvey;
  saveSurvey=async function(){
    if(surveyFormMode!=='new')return saveSurveyBeforeV797Final();
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
    let creatorEmail=currentEmailV797Final();
    let creatorName=currentUserDisplayText?.()||currentUser?.displayName||creatorEmail;
    let data={
      title,...descriptionData,
      frontInstructions:svInstructions.value.trim(),
      deadline:deadlineValue,openMode:mode,openAt,
      status:svStatus.value,
      allowEdit:svAllowEdit.value==='true',
      theme:normalizeTheme(themeSelect()?.value||'classic'),
      isAnonymous:false,targetDepartments:target,budgetPerPerson:budgetValue,
      createdByUid:currentUser?.uid||'',createdByEmail:creatorEmail,createdByName:creatorName,
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
    ensureCreatorAssignmentV797Final(id,creatorEmail,creatorName);
    await writeCreatorManagerV797Final(id,creatorEmail,creatorName);
    await writeCreateAuditV797Final(id,title);
    surveyFormMode='view';
    editingSurveyId=null;
    surveyFormDirty=false;
    await reloadAfterCreateV797Final(id);
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

