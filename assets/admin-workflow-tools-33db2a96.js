/* admin-reimbursement-0807052-c9e9f943.js */
/* 0807052 部門聯誼餐費申請單：由最終決議自動產生 Word。 */
(function installReimbursement0807052(){
  const VERSION='10.55';
  const TEMPLATE_URL='../assets/0807052-template.docx';
  const MAX_ATTENDEES=50;
  let reimbursementAttendees0807052=[];
  let reimbursementProcessReturnFocus0807052=null;

  function escHtml0807052(v){
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function currentMember0807052(){
    try{
      const email=String(currentUser?.email||'').trim().toLowerCase();
      if(!email)return null;
      if(typeof findMemberByGoogleEmail==='function')return findMemberByGoogleEmail(email);
      return (D.members||[]).find(m=>String(m.googleEmail||m.email||'').trim().toLowerCase()===email)||null;
    }catch(_){return null}
  }
  function finalDateData0807052(){return (D.dates||[]).find(d=>d.id===D.final?.finalDateId)||null}
  function finalRestaurant0807052(){return (D.restaurants||[]).find(r=>r.id===D.final?.finalRestaurantId)||null}
  function finalRows0807052(){
    const dateId=D.final?.finalDateId||'';
    if(!dateId)return [];
    if(typeof window.finalAttendanceRowsV782==='function'){
      return window.finalAttendanceRowsV782(dateId).map(row=>({
        memberId:row.member?.memberId||'',
        department:row.member?.department||row.member?.departmentName||'',
        employeeNo:row.member?.employeeNo||row.member?.empNo||'',
        name:row.member?.name||row.member?.memberName||'',
        source:row.source||'',
        budgetEligible:typeof memberBudgetEligible==='function'?memberBudgetEligible(typeof memberById==='function'?memberById(row.member?.memberId):row.member):true
      }));
    }
    if(typeof attendeeResponsesForDate==='function'){
      return attendeeResponsesForDate(dateId).map(r=>({memberId:r.memberId||'',department:r.departmentName||'',employeeNo:r.employeeNo||'',name:r.memberName||'',source:'問卷填寫',budgetEligible:typeof responseBudgetEligible==='function'?responseBudgetEligible(r):true}));
    }
    return [];
  }
  function budgetDefault0807052(){
    const rows=finalRows0807052();
    const perPerson=typeof activityBudgetPerPerson==='function'?activityBudgetPerPerson():null;
    const budgetCount=rows.filter(row=>row.budgetEligible!==false).length;
    const total=D.final?.finalDateId&&perPerson!==null&&perPerson!==undefined?perPerson*budgetCount:null;
    return {perPerson,budgetCount,total};
  }
  function moneyText0807052(value){
    const amount=Number(value);
    return Number.isFinite(amount)?new Intl.NumberFormat('zh-TW',{maximumFractionDigits:2}).format(amount):'';
  }
  function rocYearFromSurvey0807052(){
    const title=String((typeof activeSurvey==='function'?activeSurvey()?.title:'')||'');
    const m=title.match(/(?:^|\D)(1\d{2})(?:年|\D)/);
    if(m){const roc=Number(m[1]);if(roc>=100&&roc<=199)return roc}
    return new Date().getFullYear()-1911;
  }
  function inferDate0807052(){
    const label=String(finalDateData0807052()?.label||'');
    let y,m,d;
    let hit=label.match(/(20\d{2})\s*[\/.-年]\s*(\d{1,2})\s*[\/.-月]\s*(\d{1,2})/);
    if(hit){y=Number(hit[1]);m=Number(hit[2]);d=Number(hit[3])}
    if(!y){
      hit=label.match(/(1\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})/);
      if(hit){y=Number(hit[1])+1911;m=Number(hit[2]);d=Number(hit[3])}
    }
    if(!y){
      hit=label.match(/(?:^|\D)(\d{1,2})\s*[\/月.-]\s*(\d{1,2})(?:\s*日|\D|$)/);
      if(hit){y=rocYearFromSurvey0807052()+1911;m=Number(hit[1]);d=Number(hit[2])}
    }
    if(y&&m&&d){
      const dt=new Date(y,m-1,d);
      if(dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d)return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    return '';
  }
  function initialCounts0807052(rows){
    const env=rows.filter(r=>String(r.department||'').includes('環工部')).length;
    return {hq:Math.max(0,rows.length-env),field:0,env,total:rows.length};
  }
  function participatingDepartments0807052(){
    const survey=typeof activeSurvey==='function'?activeSurvey():null;
    const configured=Array.isArray(survey?.targetDepartments)?survey.targetDepartments.map(v=>String(v||'').trim()).filter(Boolean):[];
    const inferred=typeof targetMembers==='function'?[...new Set(targetMembers().map(m=>String(m.department||m.departmentName||'').trim()).filter(Boolean))]:[];
    return (configured.length?configured:inferred).join('、');
  }
  function reimbursementData0807052(){return D.final?.reimbursement0807052||D.final?.reimbursement||{}}
  function normalizeAttendee0807052(row){
    return {department:String(row?.department||row?.departmentName||''),employeeNo:String(row?.employeeNo||row?.empNo||''),name:String(row?.name||row?.memberName||''),source:String(row?.source||'核銷名單')};
  }
  function attendeeKey0807052(row){return `${String(row?.employeeNo||'').trim()}|${String(row?.name||'').trim()}`}
  function val0807052(id){return document.getElementById(id)?.value?.trim?.()||''}
  function num0807052(id){const n=Number(val0807052(id)||0);return Number.isFinite(n)&&n>=0?Math.floor(n):0}
  function selectedPayerMember0807052(){
    const emp=val0807052('r080PayerEmp');
    return (D.members||[]).find(m=>String(m.employeeNo||m.empNo||'')===emp)||null;
  }
  function syncPayer0807052(){
    const m=selectedPayerMember0807052();
    if(m){const el=document.getElementById('r080PayerName');if(el)el.value=m.name||''}
  }
  function syncTotal0807052(){
    const total=num0807052('r080HqCount')+num0807052('r080FieldCount')+num0807052('r080EnvCount');
    const finalCount=reimbursementAttendees0807052.length,matched=total===finalCount;
    const totalInput=document.getElementById('r080TotalCount');
    if(totalInput)totalInput.value=total;
    const el=document.getElementById('r080CountWarning');
    if(el){
      el.hidden=matched;
      el.innerHTML=matched?'':`<span class="reimbursementCountState0807052 isMismatch">人數不一致，請確認分類人數 ${total} 人與申請單出席名單 ${finalCount} 人。</span>`;
    }
  }
  function buildPayerOptions0807052(selectedEmp){
    const members=(D.members||[]).filter(m=>m.active!==false).slice().sort((a,b)=>String(a.department||'').localeCompare(String(b.department||''),'zh-Hant')||String(a.employeeNo||'').localeCompare(String(b.employeeNo||''),'zh-Hant',{numeric:true}));
    return '<option value="">請選擇代墊付款人</option>'+members.map(m=>{const emp=String(m.employeeNo||m.empNo||'');return `<option value="${escHtml0807052(emp)}" ${emp===selectedEmp?'selected':''}>${escHtml0807052((m.department||'')+'｜'+(m.name||'')+'｜'+emp)}</option>`}).join('');
  }
  function buildAttendeeOptions0807052(){
    const selected=new Set(reimbursementAttendees0807052.map(attendeeKey0807052));
    const members=(D.members||[]).filter(m=>m.active!==false&&!selected.has(attendeeKey0807052(m))).slice().sort((a,b)=>String(a.department||a.departmentName||'').localeCompare(String(b.department||b.departmentName||''),'zh-Hant')||String(a.employeeNo||a.empNo||'').localeCompare(String(b.employeeNo||b.empNo||''),'zh-Hant',{numeric:true}));
    return '<option value="">請選擇要加入的人員</option>'+members.map(m=>{const emp=String(m.employeeNo||m.empNo||'');return `<option value="${escHtml0807052(emp)}">${escHtml0807052((m.department||m.departmentName||'')+'｜'+(m.name||'')+'｜'+emp)}</option>`}).join('');
  }
  function renderAttendees0807052(){
    const box=document.getElementById('r080AttendeeManager');if(!box)return;
    const rows=reimbursementAttendees0807052;
    box.innerHTML=`<div class="reimbursementAttendeeToolbar0807052"><div><h5>申請單出席名單 <span>${rows.length} 人</span></h5><p>只影響本次 0807052 Word，不會修改問卷、統計或最終決議。</p></div><button class="btn" type="button" onclick="resetReimbursementAttendees0807052()">重設為最終名單</button></div><div class="reimbursementAttendeeAdd0807052"><label><span class="reimbursementFieldLabel0807052">新增人員</span><select id="r080AttendeeAdd">${buildAttendeeOptions0807052()}</select></label><button class="btn" type="button" onclick="addReimbursementAttendee0807052()">加入名單</button></div><div class="reimbursementAttendeeTableWrap0807052"><table class="reimbursementAttendeeTable0807052"><thead><tr><th>部門</th><th>姓名</th><th>員編</th><th>操作</th></tr></thead><tbody>${rows.length?rows.map((row,index)=>`<tr><td>${escHtml0807052(row.department||'—')}</td><td><b>${escHtml0807052(row.name||'—')}</b></td><td>${escHtml0807052(row.employeeNo||'—')}</td><td><button class="btn red" type="button" onclick="removeReimbursementAttendee0807052(${index})">移除</button></td></tr>`).join(''):'<tr><td colspan="4" class="reimbursementAttendeeEmpty0807052">目前沒有申請單出席人員，請由上方加入。</td></tr>'}</tbody></table></div>`;
    const download=document.getElementById('r080DownloadBtn');if(download)download.disabled=!D.final?.finalDateId||!D.final?.finalRestaurantId||rows.length===0||rows.length>MAX_ATTENDEES;
  }
  function addReimbursementAttendee0807052(){
    const emp=val0807052('r080AttendeeAdd');if(!emp)return;
    const member=(D.members||[]).find(m=>String(m.employeeNo||m.empNo||'')===emp);if(!member)return;
    const row=normalizeAttendee0807052(member);if(!reimbursementAttendees0807052.some(item=>attendeeKey0807052(item)===attendeeKey0807052(row)))reimbursementAttendees0807052.push(row);
    renderAttendees0807052();syncTotal0807052();
  }
  function removeReimbursementAttendee0807052(index){
    reimbursementAttendees0807052.splice(Number(index),1);renderAttendees0807052();syncTotal0807052();
  }
  function resetReimbursementAttendees0807052(){
    reimbursementAttendees0807052=finalRows0807052().map(normalizeAttendee0807052);renderAttendees0807052();syncTotal0807052();
  }
  function ensureSection0807052(){
    const mount=document.getElementById('reimbursementContent0807052');
    if(!mount)return null;
    let box=document.getElementById('reimbursement0807052');
    if(box)return box;
    box=document.createElement('section');
    box.id='reimbursement0807052';
    box.className='reimbursement0807052';
    mount.appendChild(box);
    return box;
  }
  function renderDecisionSummary0807052(){
    const mount=document.getElementById('reimbursementDecisionSummary0807052');if(!mount)return;
    const date=finalDateData0807052(),rest=finalRestaurant0807052(),rows=finalRows0807052();
    const complete=Boolean(D.final?.finalDateId&&D.final?.finalRestaurantId);
    mount.innerHTML=complete?`<section class="reimbursementDecision0807052"><div><span>最終日期</span><b>${escHtml0807052(date?.label||'—')}</b></div><div><span>最終餐廳</span><b>${escHtml0807052(rest?.name||'—')}</b></div><div><span>最終出席</span><b>${rows.length} 人</b></div><span class="badge green">決議資料已就緒</span></section>`:`<section class="reimbursementEmpty0807052"><div><b>尚未完成最終決議</b><p>請先選定並儲存最終日期與最終餐廳，再回到核銷作業產生申請單。</p></div><button class="btn primary" type="button" onclick="panel('finalP',document.querySelector('[onclick*=finalP]'))">前往最終決議</button></section>`;
  }
  function renderReimbursement0807052(){
    renderDecisionSummary0807052();
    const box=ensureSection0807052();if(!box)return;
    if(typeof canManage==='function'&&!canManage()){box.hidden=true;return}
    box.hidden=false;
    const rows=finalRows0807052(),saved=reimbursementData0807052(),me=currentMember0807052(),counts=initialCounts0807052(rows),budget=budgetDefault0807052();
    reimbursementAttendees0807052=(Array.isArray(saved.attendees0807052)?saved.attendees0807052:rows).map(normalizeAttendee0807052);
    const dateValue=saved.diningDate||inferDate0807052();
    const rest=finalRestaurant0807052();
    const applicantEmp=saved.applicantEmployeeNo||me?.employeeNo||me?.empNo||'';
    const defaultPhone=applicantEmp?`0${String(applicantEmp).replace(/^0+/, '')}`:'';
    const applicantName=saved.applicantName||me?.name||currentUser?.displayName||'';
    const unitDept=participatingDepartments0807052()||saved.unitDepartment||me?.department||me?.departmentName||'';
    const payerEmp=saved.payerEmployeeNo||'';
    const payerName=saved.payerName||'';
    const savedAmountExists=Object.prototype.hasOwnProperty.call(saved,'amount');
    const amountValue=savedAmountExists?saved.amount:(budget.total??'');
    const amountHint=budget.perPerson===null||budget.perPerson===undefined
      ?'尚未設定每人預算，請先至活動設定確認每人預算。'
      :!D.final?.finalDateId
        ?'完成最終日期與出席名單後，系統會自動計算預設核銷金額。'
        :`系統預設：每人預算 ${moneyText0807052(budget.perPerson)} 元 × 預算人數 ${budget.budgetCount} 人 ＝ ${moneyText0807052(budget.total)} 元；可依實際核銷情形調整。`;
    box.innerHTML=`
      <div class="reimbursementHead0807052">
        <div><span class="reimbursementEyebrow0807052">REIMBURSEMENT</span><h3>部門聯誼餐費申請單</h3><p>系統已帶入最終決議資料，請依序確認承辦、人數與付款資訊。</p></div>
        <span class="reimbursementBadge0807052">08.07.052｜版次 1.1</span>
      </div>
      <section class="reimbursementSection0807052">
        <div class="reimbursementSectionHead0807052"><span>1</span><div><h4>承辦資料</h4><p>確認申請單上的承辦人與核銷單位。</p></div></div>
        <div class="reimbursementGrid0807052 reimbursementGridBasic0807052">
          <label><span class="reimbursementFieldLabel0807052">承辦人員編 <span class="required">*</span></span><input id="r080ApplicantEmp" value="${escHtml0807052(applicantEmp)}" placeholder="例如：7902"></label>
          <label><span class="reimbursementFieldLabel0807052">承辦人姓名 <span class="required">*</span></span><input id="r080ApplicantName" value="${escHtml0807052(applicantName)}" placeholder="請輸入姓名"></label>
          <label><span class="reimbursementFieldLabel0807052">分機／電話</span><input id="r080Phone" value="${escHtml0807052(saved.phone||defaultPhone)}" placeholder="例如：07902"></label>
          <label><span class="reimbursementFieldLabel0807052">核銷部門 <span class="required">*</span></span><input id="r080UnitDept" value="${escHtml0807052(unitDept)}" placeholder="例如：行政部"></label>
        </div>
      </section>
      <section class="reimbursementSection0807052">
        <div class="reimbursementSectionHead0807052"><span>2</span><div><h4>聚餐與人數</h4><p>日期、地點及出席名單取自最終決議，可於產製前再次核對。</p></div></div>
        <div class="reimbursementGrid0807052 reimbursementGridDining0807052">
          <label><span class="reimbursementFieldLabel0807052">聚餐日期 <span class="required">*</span></span><input id="r080DiningDate" type="date" value="${escHtml0807052(dateValue)}"></label>
          <label class="reimbursementPlace0807052"><span class="reimbursementFieldLabel0807052">聚餐地點 <span class="required">*</span></span><input id="r080Place" value="${escHtml0807052(saved.place||rest?.name||'')}" placeholder="請輸入餐廳或聚餐地點"></label>
        </div>
        <div class="reimbursementGrid0807052 reimbursementGridCounts0807052">
          <label><span class="reimbursementFieldLabel0807052">總公司人數</span><input id="r080HqCount" type="number" min="0" value="${saved.headquartersCount??counts.hq}"></label>
          <label><span class="reimbursementFieldLabel0807052">駐外人員</span><input id="r080FieldCount" type="number" min="0" value="${saved.fieldCount??counts.field}"></label>
          <label><span class="reimbursementFieldLabel0807052">環工部人數</span><input id="r080EnvCount" type="number" min="0" value="${saved.environmentCount??counts.env}"></label>
          <label><span class="reimbursementFieldLabel0807052">合計人數</span><input id="r080TotalCount" class="reimbursementTotalCount0807052" type="number" value="0" readonly tabindex="-1"></label>
        </div>
        <div id="r080CountWarning" class="reimbursementCountWarning0807052" aria-live="polite" hidden></div>
      </section>
      <section class="reimbursementSection0807052">
        <div class="reimbursementSectionHead0807052"><span>3</span><div><h4>付款與核銷</h4><p>填寫實際核銷金額與代墊付款人，資料將直接套入 Word。</p></div></div>
        <div class="reimbursementGrid0807052 reimbursementGridPayment0807052">
          <label><span class="reimbursementFieldLabel0807052">實際核銷金額 <span class="required">*</span></span><div class="reimbursementAmount0807052"><span>NT$</span><input id="r080Amount" type="number" min="0" step="1" value="${escHtml0807052(amountValue)}" placeholder="例如：24000"></div><small class="reimbursementAmountHint0807052">${escHtml0807052(amountHint)}</small></label>
          <label><span class="reimbursementFieldLabel0807052">代墊付款人</span><select id="r080PayerEmp" onchange="syncPayer0807052()">${buildPayerOptions0807052(payerEmp)}</select></label>
          <label><span class="reimbursementFieldLabel0807052">代墊付款人姓名</span><input id="r080PayerName" value="${escHtml0807052(payerName)}" placeholder="選擇付款人後自動帶入"></label>
          <label><span class="reimbursementFieldLabel0807052">申請日期</span><input id="r080ApplicationDate" type="date" value="${escHtml0807052(saved.applicationDate||new Date().toLocaleDateString('sv-SE'))}"></label>
        </div>
      </section>
      <section class="reimbursementSection0807052 reimbursementConfirm0807052">
        <div class="reimbursementSectionHead0807052"><span>4</span><div><h4>產製確認</h4><p>確認名單與分類人數後，即可產生正式申請單。</p></div></div>
        <div id="r080AttendeeManager" class="reimbursementAttendeeManager0807052"></div>
      </section>
      ${reimbursementAttendees0807052.length>MAX_ATTENDEES?`<div class="reimbursementWarning0807052">申請單名單目前 ${reimbursementAttendees0807052.length} 人，0807052 範本最多可帶入 ${MAX_ATTENDEES} 人，請先調整名單。</div>`:''}
      <div class="reimbursementActions0807052">
        <div><span class="reimbursementActionLabel0807052">0807052 部門聯誼餐費申請單</span><span id="r080Status" class="reimbursementStatus0807052" role="status" aria-live="polite">資料尚未儲存</span></div>
        <div class="reimbursementActionButtons0807052"><button class="btn reimbursementResetButton0807052" type="button" onclick="resetReimbursement0807052()">重設核銷資料</button><button class="btn" type="button" onclick="saveReimbursement0807052()">儲存核銷資料</button><button id="r080DownloadBtn" class="btn primary" type="button" onclick="download0807052()" ${(!D.final?.finalDateId||!D.final?.finalRestaurantId||!reimbursementAttendees0807052.length||reimbursementAttendees0807052.length>MAX_ATTENDEES)?'disabled':''}>產生 0807052 Word</button></div>
      </div>`;
    ['r080HqCount','r080FieldCount','r080EnvCount'].forEach(id=>document.getElementById(id)?.addEventListener('input',syncTotal0807052));
    if(payerEmp)syncPayer0807052();
    renderAttendees0807052();
    syncTotal0807052();
  }
  function collect0807052(){
    return {
      applicantEmployeeNo:val0807052('r080ApplicantEmp'), applicantName:val0807052('r080ApplicantName'), phone:val0807052('r080Phone'),
      unitDepartment:val0807052('r080UnitDept'), diningDate:val0807052('r080DiningDate'), place:val0807052('r080Place'),
      headquartersCount:num0807052('r080HqCount'), fieldCount:num0807052('r080FieldCount'), environmentCount:num0807052('r080EnvCount'),
      amount:val0807052('r080Amount'), payerEmployeeNo:val0807052('r080PayerEmp'), payerName:val0807052('r080PayerName'), applicationDate:val0807052('r080ApplicationDate'),
      attendees0807052:reimbursementAttendees0807052.map(normalizeAttendee0807052)
    };
  }
  function setStatus0807052(message,type=''){
    const el=document.getElementById('r080Status');if(!el)return;
    el.textContent=message||'';el.dataset.type=type;
  }
  function validate0807052(data,forDownload=false){
    const missing=[];
    if(!data.applicantEmployeeNo)missing.push('承辦人員編');
    if(!data.applicantName)missing.push('承辦人姓名');
    if(!data.unitDepartment)missing.push('核銷部門');
    if(!data.diningDate)missing.push('聚餐日期');
    if(!data.place)missing.push('聚餐地點');
    if(forDownload&&!data.amount)missing.push('實際核銷金額');
    return missing;
  }
  async function saveReimbursement0807052(silent=false){
    if(typeof canManage==='function'&&!canManage()){if(!silent)alert('此帳號只有檢視權限');return false}
    if(!activeSurveyId){if(!silent)alert('請先選擇活動');return false}
    const data=collect0807052();
    const missing=validate0807052(data,false);
    if(missing.length){if(!silent)alert(`請先填寫：${missing.join('、')}`);return false}
    try{
      setStatus0807052('正在儲存…');
      await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,reimbursement0807052:data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      if(D.final)D.final.reimbursement0807052=data;
      setStatus0807052('核銷資料已儲存','success');
      if(!silent)toast('0807052 核銷資料已儲存');
      return true;
    }catch(e){console.error('save 0807052 reimbursement failed',e);setStatus0807052('儲存失敗，請稍後再試','error');if(!silent)alert('核銷資料儲存失敗，請檢查網路或 Firestore 規則');return false}
  }
  async function resetReimbursement0807052(){
    if(typeof canManage==='function'&&!canManage())return alert('此帳號只有檢視權限');
    if(!activeSurveyId)return alert('請先選擇活動');
    if(!confirm('確定要重設核銷資料嗎？\n\n已儲存的核銷填寫內容將被清除，並恢復為系統初始值；最終決議、問卷與出席資料不受影響。'))return;
    try{
      setStatus0807052('正在重設…');
      const remove=firebase.firestore.FieldValue.delete();
      await doc('finalDecision',activeSurveyId).set({reimbursement0807052:remove,reimbursement:remove,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      if(D.final){delete D.final.reimbursement0807052;delete D.final.reimbursement}
      renderReimbursement0807052();
      setStatus0807052('核銷資料已恢復為系統初始值','success');
      toast('核銷資料已重設');
    }catch(e){
      console.error('reset 0807052 reimbursement failed',e);
      setStatus0807052('重設失敗，請稍後再試','error');
      alert('核銷資料重設失敗，請檢查網路後再試一次');
    }
  }
  function showReimbursementProcess0807052(){
    const mask=document.getElementById('reimbursementProcessMask0807052');if(!mask)return;
    reimbursementProcessReturnFocus0807052=document.activeElement;
    mask.hidden=false;mask.style.display='flex';document.body.classList.add('modalOpen');
    requestAnimationFrame(()=>mask.querySelector('.reimbursementProcessClose0807052')?.focus());
  }
  function closeReimbursementProcess0807052(){
    const mask=document.getElementById('reimbursementProcessMask0807052');if(!mask)return;
    mask.hidden=true;mask.style.display='none';document.body.classList.remove('modalOpen');
    if(reimbursementProcessReturnFocus0807052?.focus)reimbursementProcessReturnFocus0807052.focus();
  }
  function xmlEscape0807052(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function partsFromDate0807052(s){
    const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return {roc:'',month:'',day:''};
    return {roc:String(Number(m[1])-1911),month:String(Number(m[2])),day:String(Number(m[3]))};
  }
  function periodText0807052(month){
    const m=Number(month);return `${m>=1&&m<=4?'■':'□'} 年初(1~4月)  ${m>=5&&m<=8?'■':'□'} 年中(5~8月)  ${m>=9&&m<=12?'■':'□'} 年末(9~12月)`;
  }
  function replaceAll0807052(xml,token,value){return xml.split(token).join(xmlEscape0807052(value))}
  async function download0807052(){
    if(typeof JSZip==='undefined')return alert('Word 產生元件尚未載入，請重新整理頁面後再試一次');
    if(!D.final?.finalDateId||!D.final?.finalRestaurantId)return alert('請先儲存最終日期與最終餐廳');
    const data=collect0807052(),rows=data.attendees0807052||[],classified=data.headquartersCount+data.fieldCount+data.environmentCount;
    if(!rows.length)return alert('申請單出席名單為 0 人，請先加入人員');
    if(rows.length>MAX_ATTENDEES)return alert(`0807052 範本目前最多可帶入 ${MAX_ATTENDEES} 人，本次申請單共有 ${rows.length} 人。`);
    const missing=validate0807052(data,true);if(missing.length)return alert(`請先填寫：${missing.join('、')}`);
    if(classified!==rows.length&&!confirm(`分類人數合計 ${classified} 人，但最終出席名單為 ${rows.length} 人。仍要產生嗎？`))return;
    if(!await saveReimbursement0807052(true))return alert('核銷資料尚未成功儲存，已取消產生 Word。');
    setStatus0807052('正在產生 Word…');
    const dining=partsFromDate0807052(data.diningDate),application=partsFromDate0807052(data.applicationDate);
    const replacements={
      '@@APPLICANT_EMP@@':data.applicantEmployeeNo,'@@APPLICANT_NAME@@':data.applicantName,'@@PHONE@@':data.phone,'@@UNIT_BOX@@':data.unitDepartment?'■':'□','@@UNIT_DEPT@@':data.unitDepartment,
      '@@ROC_YEAR@@':dining.roc,'@@MONTH@@':dining.month,'@@DAY@@':dining.day,'@@PLACE@@':data.place,
      '@@HQ_COUNT@@':data.headquartersCount,'@@FIELD_COUNT@@':data.fieldCount,'@@ENV_COUNT@@':data.environmentCount,'@@TOTAL_COUNT@@':rows.length,
      '@@PERIOD_TEXT@@':periodText0807052(dining.month),'@@AMOUNT@@':Number(data.amount||0).toLocaleString('zh-TW'),'@@PAYER_EMP@@':data.payerEmployeeNo,'@@PAYER_NAME@@':data.payerName,
      '@@APP_ROC_YEAR@@':application.roc,'@@APP_MONTH@@':application.month,'@@APP_DAY@@':application.day
    };
    for(let i=1;i<=MAX_ATTENDEES;i++){
      const r=rows[i-1]||{};
      replacements[`@@P${String(i).padStart(2,'0')}_DEPT@@`]=r.department||'';
      replacements[`@@P${String(i).padStart(2,'0')}_EMP@@`]=r.employeeNo||'';
      replacements[`@@P${String(i).padStart(2,'0')}_NAME@@`]=r.name||'';
      replacements[`@@P${String(i).padStart(2,'0')}_NOTE@@`]='';
    }
    try{
      const response=await fetch(TEMPLATE_URL,{cache:'no-store'});if(!response.ok)throw new Error('template HTTP '+response.status);
      const zip=await JSZip.loadAsync(await response.arrayBuffer());
      const entry=zip.file('word/document.xml');if(!entry)throw new Error('document.xml not found');
      let xml=await entry.async('string');
      Object.entries(replacements).forEach(([token,value])=>{xml=replaceAll0807052(xml,token,value)});
      // v10.55：核銷單位第一列真正貼齊左側；核銷期別固定在同一欄單列顯示。
      {
        const marker=' 部門(必填)';
        const i=xml.indexOf(marker);
        if(i>=0){
          const ps=Math.max(xml.lastIndexOf('<w:p ',i),xml.lastIndexOf('<w:p>',i));
          const pe=xml.indexOf('</w:p>',i)+6;
          if(ps>=0&&pe>ps){
            let p=xml.slice(ps,pe)
              .replace(/<w:pStyle w:val=\"a8\"\/>/,'')
              .replace(/<w:jc w:val=\"[^\"]+\"\/>/,'<w:jc w:val=\"left\"/>');
            if(/<w:ind\b[^>]*\/>/.test(p)) p=p.replace(/<w:ind\b[^>]*\/>/,'<w:ind w:left=\"0\" w:right=\"0\" w:firstLine=\"0\" w:hanging=\"0\"/>');
            else p=p.replace('</w:pPr>','<w:ind w:left=\"0\" w:right=\"0\" w:firstLine=\"0\" w:hanging=\"0\"/></w:pPr>');
            xml=xml.slice(0,ps)+p+xml.slice(pe);
          }
        }
      }
      {
        const marker='年初(1~4月)';
        const i=xml.indexOf(marker);
        if(i>=0){
          const cs=xml.lastIndexOf('<w:tc>',i), ce=xml.indexOf('</w:tc>',i)+7;
          if(cs>=0&&ce>cs){
            let cell=xml.slice(cs,ce);
            if(!/<w:noWrap\/>/.test(cell.slice(0,cell.indexOf('</w:tcPr>')))) cell=cell.replace('</w:tcPr>','<w:noWrap/><w:tcFitText/></w:tcPr>');
            const rs=cell.lastIndexOf('<w:r ',cell.indexOf(marker));
            const re=cell.indexOf('</w:r>',cell.indexOf(marker))+6;
            if(rs>=0&&re>rs){
              let r=cell.slice(rs,re);
              if(/<w:rPr>/.test(r)){
                r=r.replace(/<w:sz w:val=\"[^\"]+\"\/>/g,'').replace(/<w:szCs w:val=\"[^\"]+\"\/>/g,'');
                r=r.replace('</w:rPr>','<w:sz w:val=\"24\"/><w:szCs w:val=\"24\"/><w:spacing w:val=\"-2\"/></w:rPr>');
              }
              cell=cell.slice(0,rs)+r+cell.slice(re);
            }
            xml=xml.slice(0,cs)+cell+xml.slice(ce);
          }
        }
      }
      zip.file('word/document.xml',xml);
      // 0807052 全份文件強制使用「標楷體」，避免 Word 依原範本局部字型顯示新細明體等字型。
      const wordXmlNames=Object.keys(zip.files).filter(name=>/^word\/.*\.xml$/i.test(name));
      for(const name of wordXmlNames){
        let part=await zip.file(name).async('string');
        part=part.replace(/<w:rFonts\b[^>]*\/>/g, tag=>{
          let t=tag.replace(/\s+w:(?:asciiTheme|hAnsiTheme|eastAsiaTheme|cstheme)="[^"]*"/g,'');
          for(const attr of ['ascii','hAnsi','eastAsia','cs']){
            const re=new RegExp(`w:${attr}="[^"]*"`,'g');
            if(re.test(t)) t=t.replace(re,`w:${attr}="標楷體"`);
            else t=t.replace('/>',` w:${attr}="標楷體"/>`);
          }
          return t;
        });
        zip.file(name,part);
      }
      const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      const a=document.createElement('a'),surveyTitle=String((typeof activeSurvey==='function'?activeSurvey()?.title:'')||'部門聚餐').replace(/[\\/:*?"<>|]/g,'_');
      a.href=URL.createObjectURL(blob);a.download=`0807052_${surveyTitle}_${data.diningDate.replaceAll('-','')}.docx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
      setStatus0807052('0807052 Word 已產生','success');toast('0807052 Word 已產生');
    }catch(e){console.error('generate 0807052 failed',e);setStatus0807052('Word 產生失敗，請稍後再試','error');alert('0807052 Word 產生失敗，請確認範本檔案已一併部署。')}
  }

  const renderAdminBefore0807052=window.renderAdmin;
  if(typeof renderAdminBefore0807052==='function')window.renderAdmin=function(){const r=renderAdminBefore0807052.apply(this,arguments);renderReimbursement0807052();return r};
  window.renderReimbursement0807052=renderReimbursement0807052;
  window.saveReimbursement0807052=saveReimbursement0807052;
  window.resetReimbursement0807052=resetReimbursement0807052;
  window.download0807052=download0807052;
  window.showReimbursementProcess0807052=showReimbursementProcess0807052;
  window.closeReimbursementProcess0807052=closeReimbursementProcess0807052;
  window.syncPayer0807052=syncPayer0807052;
  window.addReimbursementAttendee0807052=addReimbursementAttendee0807052;
  window.removeReimbursementAttendee0807052=removeReimbursementAttendee0807052;
  window.resetReimbursementAttendees0807052=resetReimbursementAttendees0807052;
  window.AdminReimbursement0807052=Object.freeze({
    version:VERSION,
    render:renderReimbursement0807052,
    budgetDefault:budgetDefault0807052,
    save:saveReimbursement0807052,
    reset:resetReimbursement0807052,
    download:download0807052
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('reimbursementProcessMask0807052')?.style.display==='flex')closeReimbursementProcess0807052()});
  setTimeout(renderReimbursement0807052,300);
})();











;
/* admin-back-to-top-38cffb7f.js */
/* v10.55 管理端共用回到頁首按鈕與功能頁切換回頂。 */
(() => {
  const MODULE_VERSION='10.55';
  const SHOW_AFTER=640;
  let button=null;
  let framePending=false;
  let panelFramePending=false;
  let activePanelId='';
  let panelObserver=null;

  function scrollRoot(){
    return document.scrollingElement||document.documentElement;
  }

  function shouldShow(){
    const root=scrollRoot();
    const scrollTop=Math.max(window.scrollY||0,root?.scrollTop||0);
    const pageIsLong=(root?.scrollHeight||0)>window.innerHeight+120;
    return pageIsLong&&scrollTop>=SHOW_AFTER;
  }

  function sync(){
    if(!button)return false;
    const visible=shouldShow();
    button.classList.toggle('isVisible',visible);
    button.setAttribute('aria-hidden',String(!visible));
    button.tabIndex=visible?0:-1;
    return visible;
  }

  function requestSync(){
    if(framePending)return;
    framePending=true;
    requestAnimationFrame(()=>{
      framePending=false;
      sync();
    });
  }

  function scrollToTop(){
    const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
    window.scrollTo({top:0,left:0,behavior:reduceMotion?'auto':'smooth'});
  }

  function currentActivePanelId(){
    return document.querySelector('.admin .panel.active')?.id||document.querySelector('.panel.active')?.id||'';
  }

  function syncActivePanel(){
    panelFramePending=false;
    const nextPanelId=currentActivePanelId();
    if(!nextPanelId||nextPanelId===activePanelId)return false;
    const previousPanelId=activePanelId;
    activePanelId=nextPanelId;
    if(!previousPanelId)return false;
    window.scrollTo({top:0,left:0,behavior:'auto'});
    requestSync();
    return true;
  }

  function requestPanelSync(){
    if(panelFramePending)return;
    panelFramePending=true;
    requestAnimationFrame(syncActivePanel);
  }

  function observePanelChanges(){
    activePanelId=currentActivePanelId();
    panelObserver?.disconnect();
    panelObserver=new MutationObserver(records=>{
      const changed=records.some(record=>record.target instanceof Element&&record.target.classList.contains('panel'));
      if(changed)requestPanelSync();
    });
    panelObserver.observe(document.getElementById('admin')||document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  }

  function ensureButton(){
    if(button?.isConnected)return button;
    button=document.createElement('button');
    button.type='button';
    button.className='adminBackToTopV1043';
    button.title='回到頁首';
    button.setAttribute('aria-label','回到頁首');
    button.setAttribute('aria-hidden','true');
    button.tabIndex=-1;
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 14.5 12 9l5.5 5.5"/></svg>';
    button.addEventListener('click',scrollToTop);
    document.body.appendChild(button);
    return button;
  }

  function init(){
    ensureButton();
    observePanelChanges();
    sync();
    window.addEventListener('scroll',requestSync,{passive:true});
    window.addEventListener('resize',requestSync,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.AdminBackToTop=Object.freeze({
    version:MODULE_VERSION,
    showAfter:SHOW_AFTER,
    sync,
    syncActivePanel,
    scrollToTop
  });
})();




;
/* admin-dining-assignments-c0f30a58.js */
/* v10.55 近期聚餐安排：全員共用近期項目，歷程依辦理狀態分流。 */
(()=>{
  'use strict';
  const VERSION='10.55';
  let editingId='';
  let historyFilter='upcoming';

  function html(value){return typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function attr(value){return typeof escAttr==='function'?escAttr(String(value??'')):html(value)}
  function email(value){return String(value||'').trim().toLowerCase()}
  function chineseNumber(value){
    const n=Number(value),digits=['零','一','二','三','四','五','六','七','八','九'];
    if(n<=0||!Number.isInteger(n))return String(value||'');
    if(n<10)return digits[n];if(n===10)return'十';if(n<20)return'十'+digits[n%10];if(n===20)return'二十';
    return String(n);
  }
  function title(item){return`${Number(item.year)||''}年第${chineseNumber(item.occurrence)}次部門聚餐`}
  function period(item){return`${Number(item.startMonth)||''}至${Number(item.endMonth)||''}月`}
  function currentYearMonth(){const now=globalThis.__diningAssignmentNowV1049?new Date(globalThis.__diningAssignmentNowV1049):new Date();return{year:now.getFullYear()-1911,month:now.getMonth()+1}}
  function timeIndex(year,month){return Number(year)*12+Number(month)-1}
  function status(item){
    const now=currentYearMonth(),current=timeIndex(now.year,now.month),start=timeIndex(item.year,item.startMonth),end=timeIndex(item.year,item.endMonth);
    return current<start?'尚未辦理':current>end?'已辦理':'本期辦理';
  }
  function normalizedItems(){
    return (Array.isArray(D?.diningAssignments)?D.diningAssignments:[]).map((item,index)=>({
      id:String(item?.id||`legacy_${index}`),year:Number(item?.year)||0,occurrence:Number(item?.occurrence)||0,
      startMonth:Number(item?.startMonth)||0,endMonth:Number(item?.endMonth)||0,
      responsibleIds:Array.isArray(item?.responsibleIds)?item.responsibleIds.map(String):[],
      responsibleNames:Array.isArray(item?.responsibleNames)?item.responsibleNames.map(String):[],
      responsibleEmails:Array.isArray(item?.responsibleEmails)?item.responsibleEmails.map(email):[]
    })).filter(item=>item.year&&item.occurrence&&item.startMonth&&item.endMonth)
      .sort((a,b)=>b.year-a.year||b.occurrence-a.occurrence);
  }
  function simulatedMemberId(){return String(document.getElementById('simulateMemberSelectV807')?.value||'')}
  function simulatedMember(){const id=simulatedMemberId();return id?(D?.members||[]).find(item=>String(item.id)===id)||null:null}
  function isSimulatingMember(){return !!simulatedMember()}
  function canManageAssignments(){return !!isSystemAdmin&&!isSimulatingMember()}
  function focusItem(items){
    const current=items.find(item=>status(item)==='本期辦理');if(current)return current;
    const upcoming=items.filter(item=>status(item)==='尚未辦理').sort((a,b)=>timeIndex(a.year,a.startMonth)-timeIndex(b.year,b.startMonth)||a.occurrence-b.occurrence);
    if(upcoming.length)return upcoming[0];
    return [...items].sort((a,b)=>timeIndex(b.year,b.endMonth)-timeIndex(a.year,a.endMonth)||b.occurrence-a.occurrence)[0]||null;
  }
  function historyItems(value=historyFilter){
    const items=normalizedItems();
    if(value==='past')return items.filter(item=>status(item)==='已辦理').sort((a,b)=>timeIndex(b.year,b.endMonth)-timeIndex(a.year,a.endMonth)||b.occurrence-a.occurrence);
    return items.filter(item=>status(item)!=='已辦理').sort((a,b)=>{
      const currentDifference=(status(a)==='本期辦理'?0:1)-(status(b)==='本期辦理'?0:1);
      return currentDifference||timeIndex(a.year,a.startMonth)-timeIndex(b.year,b.startMonth)||a.occurrence-b.occurrence;
    });
  }
  function itemMarkup(item){
    return `<article class="diningAssignmentItemV1046"><h4>${html(title(item))}</h4><div class="diningAssignmentMetaRowV1048">狀態：${html(status(item))}</div><div class="diningAssignmentMetaRowV1048">辦理期間：${html(item.year)}年${html(period(item))}</div><div class="diningAssignmentMetaRowV1048">負責人：${html(item.responsibleNames.join('、')||'尚未設定')}</div></article>`;
  }
  function render(){
    const box=document.getElementById('diningAssignmentListV1046');if(!box)return;
    const items=normalizedItems(),focused=focusItem(items);
    const manage=document.getElementById('manageDiningAssignmentsV1046');if(manage)manage.hidden=!canManageAssignments();
    if(!focused){box.innerHTML='<div class="diningAssignmentEmptyV1046">目前尚未建立聚餐安排。</div>';return}
    box.innerHTML=itemMarkup(focused);
  }
  function ensureAllDialog(){
    let mask=document.getElementById('diningAssignmentAllMaskV1048');if(mask)return mask;
    mask=document.createElement('div');mask.id='diningAssignmentAllMaskV1048';mask.className='modalMask';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.setAttribute('aria-labelledby','diningAssignmentAllTitleV1048');
    mask.innerHTML='<div class="modal diningAssignmentDialogV1046 diningAssignmentAllDialogV1048"><div class="diningAssignmentDialogHeadV1046"><div><h2 id="diningAssignmentAllTitleV1048">聚餐負責人安排</h2><p>查看近期安排與歷次已辦理紀錄。</p></div><button class="diningAssignmentCloseV1046" type="button" aria-label="關閉" onclick="closeDiningAssignmentAllV1048()">×</button></div><div class="diningAssignmentDialogBodyV1046"><div class="diningAssignmentHistoryTabsV1050" role="tablist" aria-label="聚餐安排狀態"><button id="diningAssignmentUpcomingTabV1050" type="button" role="tab" onclick="setDiningAssignmentHistoryFilterV1050(\'upcoming\')">近期安排</button><button id="diningAssignmentPastTabV1050" type="button" role="tab" onclick="setDiningAssignmentHistoryFilterV1050(\'past\')">已辦理</button></div><div id="diningAssignmentAllListV1048" class="diningAssignmentHistoryListV1050"></div></div></div>';
    mask.addEventListener('click',event=>{if(event.target===mask)closeAllDialog()});document.body.appendChild(mask);return mask;
  }
  function historyMarkup(item){
    const currentStatus=status(item),statusClass=currentStatus==='本期辦理'?' current':currentStatus==='尚未辦理'?' upcoming':' past';
    return `<article class="diningAssignmentHistoryRowV1050"><div class="diningAssignmentHistoryIdentityV1050"><h4>${html(title(item))}</h4><span class="diningAssignmentHistoryStatusV1050${statusClass}">${html(currentStatus)}</span></div><div class="diningAssignmentHistoryFieldV1050"><b>辦理期間</b><span>${html(item.year)}年${html(period(item))}</span></div><div class="diningAssignmentHistoryFieldV1050"><b>負責人</b><span>${html(item.responsibleNames.join('、')||'尚未設定')}</span></div></article>`;
  }
  function renderHistory(){
    const box=document.getElementById('diningAssignmentAllListV1048');if(!box)return;
    const items=historyItems();
    const upcoming=document.getElementById('diningAssignmentUpcomingTabV1050'),past=document.getElementById('diningAssignmentPastTabV1050');
    if(upcoming){const active=historyFilter==='upcoming';upcoming.classList.toggle('active',active);upcoming.setAttribute('aria-selected',String(active))}
    if(past){const active=historyFilter==='past';past.classList.toggle('active',active);past.setAttribute('aria-selected',String(active))}
    box.innerHTML=items.length?items.map(historyMarkup).join(''):`<div class="diningAssignmentEmptyV1046">${historyFilter==='past'?'目前沒有已辦理紀錄。':'目前沒有本期或尚未辦理的安排。'}</div>`;
  }
  function setHistoryFilter(value){historyFilter=value==='past'?'past':'upcoming';renderHistory()}
  function openAllDialog(){
    const mask=ensureAllDialog();historyFilter='upcoming';renderHistory();
    mask.style.display='flex';document.body.style.overflow='hidden';mask.querySelector('.diningAssignmentCloseV1046')?.focus();
  }
  function closeAllDialog(){const mask=document.getElementById('diningAssignmentAllMaskV1048');if(mask)mask.style.display='none';document.body.style.overflow=''}
  function setFilter(value){if(value==='all')return openAllDialog();render()}

  function ensureDialog(){
    let mask=document.getElementById('diningAssignmentMaskV1046');if(mask)return mask;
    mask=document.createElement('div');mask.id='diningAssignmentMaskV1046';mask.className='modalMask';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.setAttribute('aria-labelledby','diningAssignmentDialogTitleV1046');
    mask.innerHTML=`<div class="modal diningAssignmentDialogV1046"><div class="diningAssignmentDialogHeadV1046"><div><h2 id="diningAssignmentDialogTitleV1046">管理聚餐負責人安排</h2><p>設定年度、次別、辦理期間與負責人。</p></div><button class="diningAssignmentCloseV1046" type="button" aria-label="關閉" onclick="closeDiningAssignmentManagerV1046()">×</button></div><div class="diningAssignmentDialogBodyV1046"><div class="diningAssignmentManagerBarV1046"><h3>全部安排</h3><button class="btn primary" type="button" onclick="startDiningAssignmentV1046()">新增安排</button></div><div id="diningAssignmentEditorV1046" class="diningAssignmentEditorV1046" hidden><div class="diningAssignmentEditorGridV1046"><div><label for="diningAssignmentYearV1046">年度</label><input id="diningAssignmentYearV1046" type="number" min="100" max="999" placeholder="例如：115"></div><div><label for="diningAssignmentOccurrenceV1046">次別</label><input id="diningAssignmentOccurrenceV1046" type="number" min="1" max="20" placeholder="例如：2"></div><div><label for="diningAssignmentStartMonthV1046">開始月份</label><select id="diningAssignmentStartMonthV1046">${Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}月</option>`).join('')}</select></div><div><label for="diningAssignmentEndMonthV1046">結束月份</label><select id="diningAssignmentEndMonthV1046">${Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}月</option>`).join('')}</select></div></div><div class="field"><label>負責人（可複選）</label><div id="diningAssignmentPeoplePickerV1046" class="diningAssignmentPeoplePickerV1046"></div></div><div class="diningAssignmentEditorActionsV1046"><button class="btn" type="button" onclick="cancelDiningAssignmentEditV1046()">取消</button><button id="saveDiningAssignmentV1046" class="btn primary" type="button" onclick="saveDiningAssignmentV1046()">儲存安排</button></div></div><div id="diningAssignmentAdminListV1046" class="diningAssignmentAdminListV1046"></div></div></div>`;
    mask.addEventListener('click',event=>{if(event.target===mask)closeManager()});
    document.body.appendChild(mask);return mask;
  }
  function renderPicker(selected=[]){
    const box=document.getElementById('diningAssignmentPeoplePickerV1046');if(!box)return;
    const ids=new Set(selected.map(String));
    box.innerHTML=(D?.members||[]).map(member=>`<label class="diningAssignmentPersonChoiceV1046"><input type="checkbox" value="${attr(member.id)}" ${ids.has(String(member.id))?'checked':''}><span>${html(member.name||'未命名')}${member.active===false?'<small>已停用</small>':''}</span></label>`).join('')||'<div class="muted">目前沒有人員資料，請先到人員管理建立名單。</div>';
  }
  function renderAdminList(){
    const box=document.getElementById('diningAssignmentAdminListV1046');if(!box)return;
    const items=normalizedItems();
    box.innerHTML=items.map(item=>`<div class="diningAssignmentAdminRowV1046"><div><b>${html(title(item))}</b><small>辦理期間：${html(period(item))}</small></div><div>${html(item.responsibleNames.join('、')||'尚未設定負責人')}</div><div class="diningAssignmentAdminActionsV1046"><button class="btn" type="button" onclick="editDiningAssignmentV1046('${attr(item.id)}')">編輯</button><button class="btn red" type="button" onclick="deleteDiningAssignmentV1046('${attr(item.id)}')">刪除</button></div></div>`).join('')||'<div class="diningAssignmentEmptyV1046">目前尚未建立安排。</div>';
  }
  function managementBlocked(){return alert(isSimulatingMember()?'請先結束模擬身分，再管理聚餐負責人安排':'只有系統管理員可以管理聚餐負責人安排')}
  function openManager(){if(!canManageAssignments())return managementBlocked();const mask=ensureDialog();editingId='';document.getElementById('diningAssignmentEditorV1046').hidden=true;renderAdminList();mask.style.display='flex';document.body.style.overflow='hidden'}
  function closeManager(){const mask=document.getElementById('diningAssignmentMaskV1046');if(mask)mask.style.display='none';document.body.style.overflow='';editingId=''}
  function startEdit(item=null){
    if(!canManageAssignments())return managementBlocked();ensureDialog();editingId=item?.id||'';
    const editor=document.getElementById('diningAssignmentEditorV1046');editor.hidden=false;
    const currentYear=new Date().getFullYear()-1911;
    document.getElementById('diningAssignmentYearV1046').value=item?.year||currentYear;
    document.getElementById('diningAssignmentOccurrenceV1046').value=item?.occurrence||1;
    document.getElementById('diningAssignmentStartMonthV1046').value=item?.startMonth||1;
    document.getElementById('diningAssignmentEndMonthV1046').value=item?.endMonth||4;
    renderPicker(item?.responsibleIds||[]);editor.scrollIntoView({block:'nearest'});
  }
  function editItem(id){const item=normalizedItems().find(entry=>entry.id===String(id));if(item)startEdit(item)}
  function cancelEdit(){editingId='';const editor=document.getElementById('diningAssignmentEditorV1046');if(editor)editor.hidden=true}
  function selectedPeople(){
    const ids=[...document.querySelectorAll('#diningAssignmentPeoplePickerV1046 input:checked')].map(input=>String(input.value));
    return ids.map(id=>D.members.find(member=>String(member.id)===id)).filter(Boolean);
  }
  async function persist(items,message,before=null,after=null){
    await doc('systemSettings','diningAssignments').set({items,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedByEmail:email(currentUser?.email),updatedByName:currentUser?.displayName||''},{merge:true});
    D.diningAssignments=items;
    if(typeof writeAuditDetailV760==='function')try{await writeAuditDetailV760({action:message==='聚餐負責人安排已刪除'?'刪除':before?'修改':'新增',targetType:'聚餐負責人安排',targetId:after?.id||before?.id||'',targetLabel:title(after||before||{}),before,after,fields:['year','occurrence','startMonth','endMonth','responsibleNames'],surveyId:''})}catch(error){console.warn('write dining assignment audit failed',error)}
    render();renderAdminList();toast(message);
  }
  async function save(){
    if(!canManageAssignments())return managementBlocked();
    const year=Number(document.getElementById('diningAssignmentYearV1046').value),occurrence=Number(document.getElementById('diningAssignmentOccurrenceV1046').value),startMonth=Number(document.getElementById('diningAssignmentStartMonthV1046').value),endMonth=Number(document.getElementById('diningAssignmentEndMonthV1046').value),people=selectedPeople();
    if(!Number.isInteger(year)||year<100||year>999)return alert('年度請輸入三位數民國年，例如 115');
    if(!Number.isInteger(occurrence)||occurrence<1||occurrence>20)return alert('次別請輸入 1 至 20');
    if(startMonth<1||endMonth>12||startMonth>endMonth)return alert('辦理期間的開始月份不可晚於結束月份');
    if(!people.length)return alert('請至少選擇一位負責人');
    const items=normalizedItems(),before=items.find(item=>item.id===editingId)||null;
    if(items.some(item=>item.id!==editingId&&item.year===year&&item.occurrence===occurrence))return alert(`${year}年第${chineseNumber(occurrence)}次已經建立安排`);
    const next={id:editingId||(globalThis.crypto?.randomUUID?.()||`assignment_${Date.now()}`),year,occurrence,startMonth,endMonth,responsibleIds:people.map(person=>String(person.id)),responsibleNames:people.map(person=>String(person.name||'未命名')),responsibleEmails:people.map(person=>typeof memberGoogleEmail==='function'?memberGoogleEmail(person):email(person.googleEmail||person.email)).filter(Boolean)};
    const merged=items.filter(item=>item.id!==editingId).concat(next).sort((a,b)=>b.year-a.year||b.occurrence-a.occurrence),button=document.getElementById('saveDiningAssignmentV1046');button.disabled=true;
    try{await persist(merged,before?'聚餐負責人安排已更新':'聚餐負責人安排已新增',before,next);cancelEdit()}
    catch(error){console.error('save dining assignment failed',error);alert('聚餐負責人安排儲存失敗，請確認已部署最新版 Firestore 規則')}
    finally{button.disabled=false}
  }
  async function remove(id){
    if(!canManageAssignments())return managementBlocked();const items=normalizedItems(),before=items.find(item=>item.id===String(id));if(!before)return;
    if(!confirm(`確定刪除「${title(before)}」的負責人安排？`))return;
    try{await persist(items.filter(item=>item.id!==before.id),'聚餐負責人安排已刪除',before,null)}catch(error){console.error('delete dining assignment failed',error);alert('刪除失敗，請確認網路與 Firestore 規則')}
  }

  window.renderDiningAssignmentsV1046=render;
  window.setDiningAssignmentFilterV1046=setFilter;
  window.setDiningAssignmentHistoryFilterV1050=setHistoryFilter;
  window.closeDiningAssignmentAllV1048=closeAllDialog;
  window.openDiningAssignmentManagerV1046=openManager;
  window.closeDiningAssignmentManagerV1046=closeManager;
  window.startDiningAssignmentV1046=()=>startEdit();
  window.editDiningAssignmentV1046=editItem;
  window.cancelDiningAssignmentEditV1046=cancelEdit;
  window.saveDiningAssignmentV1046=save;
  window.deleteDiningAssignmentV1046=remove;
  window.AdminDiningAssignments=Object.freeze({version:VERSION,render,setFilter,open:openManager,close:closeManager});
})();


;
/* admin-login-audit-d2421c03.js */
/* 登入紀錄在最終權限與資料確認後寫入，首頁登入及恢復登入狀態共用此流程。 */
(()=>{
  'use strict';
  const VERSION='10.55';
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

;
/* manage-0c7e0033.js */
/*
 * 部門聚餐調查系統管理端正式入口
 *
 * 既有正式功能由 compatibility 目錄依固定順序載入；新功能應建立為
 * 獨立語意模組，不再追加至舊路徑或大型相容核心。
 */
(() => {
const APP_VERSION='10.55';
  const requiredInterfaces=[
    'renderAdmin',
    'renderFinalPanel',
    'saveFinal',
    'saveHomeAnnouncementSetting',
    'openHomeAnnouncementSettings'
  ];

  window.APP_VERSION=APP_VERSION;
  window.AdminApp=Object.freeze({
    version:APP_VERSION,
    compatibilityVersion:String(window.ADMIN_COMPATIBILITY_VERSION||''),
    requiredInterfaces:Object.freeze([...requiredInterfaces])
  });

  const missing=requiredInterfaces.filter(name=>typeof window[name]!=='function');
  if(!window.AdminLiveResponses||window.AdminLiveResponses.version!==APP_VERSION)missing.push('AdminLiveResponses');
  if(!window.AdminChatReadingPosition||window.AdminChatReadingPosition.version!==APP_VERSION)missing.push('AdminChatReadingPosition');
  if(!window.AdminTitleStyles||window.AdminTitleStyles.version!==APP_VERSION)missing.push('AdminTitleStyles');
  if(!window.AdminViewRole||window.AdminViewRole.version!==APP_VERSION)missing.push('AdminViewRole');
  if(!window.AdminShareCenter||window.AdminShareCenter.version!==APP_VERSION)missing.push('AdminShareCenter');
  if(!window.AdminInformationArchitecture||window.AdminInformationArchitecture.version!==APP_VERSION)missing.push('AdminInformationArchitecture');
  if(!window.AdminEditorModeState||window.AdminEditorModeState.version!==APP_VERSION)missing.push('AdminEditorModeState');
  if(!window.AdminReimbursement0807052||window.AdminReimbursement0807052.version!==APP_VERSION)missing.push('AdminReimbursement0807052');
  if(!window.AdminBackToTop||window.AdminBackToTop.version!==APP_VERSION)missing.push('AdminBackToTop');
  if(!window.AdminDiningAssignments||window.AdminDiningAssignments.version!==APP_VERSION)missing.push('AdminDiningAssignments');
  if(!window.AdminLoginAudit||window.AdminLoginAudit.version!==APP_VERSION)missing.push('AdminLoginAudit');
  if(missing.length){
    document.documentElement.dataset.adminState='error';
    document.documentElement.dataset.adminVersion=APP_VERSION;
    console.error('管理端相容核心載入不完整：'+missing.join('、'));
    window.dispatchEvent(new CustomEvent('admin:compatibility-error',{detail:{missing}}));
  }else{
    document.documentElement.dataset.adminState='ready';
    document.documentElement.dataset.adminVersion=APP_VERSION;
    window.dispatchEvent(new CustomEvent('admin:ready',{detail:{version:APP_VERSION}}));
  }
})();













