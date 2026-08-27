/* 0807052 部門聯誼餐費申請單：由最終決議自動產生 Word。 */
(function installReimbursement0807052(){
  const VERSION='10.27';
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
      // v10.27：核銷單位第一列真正貼齊左側；核銷期別固定在同一欄單列顯示。
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



