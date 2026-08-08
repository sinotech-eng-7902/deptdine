/* 相容層：稽核、費用與日期管理流程。 */
// 相容清理：移除 summary-only Audit wrapper。
// 主要 CRUD 稽核改由後段 writeAuditDetailV760 / 最終接管 統一處理，
// 避免同一次異動同時產生舊格式與新格式紀錄。

/* 多元餐廳計價：餐廳管理只維護價格規則，出席人數與總額集中於費用試算。 */
function pricingModeV712(rest){return ['perPerson','perTable','fixed'].includes(rest?.pricingMode)?rest.pricingMode:'perPerson'}
function pricingModeLabelV712(mode){return({perPerson:'每人計價',perTable:'每桌計價',fixed:'固定總價'})[mode]||'每人計價'}
function numericV712(value,fallback=0){let n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback}
function restaurantCostV712(rest,attendanceCount){
  if(!rest)return{mode:'perPerson',subtotal:null,serviceFee:0,fixedFee:0,total:null,tables:0,effectivePerPerson:null};
  let mode=pricingModeV712(rest),count=Math.max(0,Number(attendanceCount)||0),price=moneyValue(rest.price),tableSeats=Math.max(1,Math.floor(numericV712(rest.tableSeats,10))),minTables=Math.max(0,Math.floor(numericV712(rest.minTables,0))),tables=0,subtotal=null;
  if(price!==null){
    if(mode==='perPerson')subtotal=price*count;
    else if(mode==='perTable'){tables=count?Math.max(minTables,Math.ceil(count/tableSeats)):0;subtotal=price*tables}
    else subtotal=price;
  }
  let serviceRate=Math.min(100,numericV712(rest.serviceRate,0)),serviceFee=subtotal===null?0:Math.round(subtotal*serviceRate/100),fixedFee=numericV712(rest.fixedFee,0),total=subtotal===null?null:subtotal+serviceFee+fixedFee;
  return{mode,price,tableSeats,minTables,tables,subtotal,serviceRate,serviceFee,fixedFee,total,effectivePerPerson:total!==null&&count?total/count:null};
}
function pricingSummaryV712(rest){
  let mode=pricingModeV712(rest),price=moneyValue(rest?.price),base=price===null?'尚未設定價格':mode==='perPerson'?moneyText(price)+' 元／人':mode==='perTable'?moneyText(price)+' 元／桌（'+Math.max(1,Math.floor(numericV712(rest?.tableSeats,10)))+' 人／桌）':moneyText(price)+' 元／場';
  let extras=[];if(numericV712(rest?.serviceRate,0))extras.push('服務費 '+numericV712(rest.serviceRate,0)+'%');if(numericV712(rest?.fixedFee,0))extras.push('固定費 '+moneyText(rest.fixedFee)+' 元');return base+(extras.length?'；'+extras.join('、'):'');
}
function installRestaurantPricingV712(){
  let priceField=newPrice?.closest('.field');if(!priceField||document.getElementById('restaurantPricingMode'))return;
  priceField.insertAdjacentHTML('beforebegin',`<div class="restaurantPricingBox"><div class="field"><label for="restaurantPricingMode">計價方式</label><select id="restaurantPricingMode" onchange="toggleRestaurantPricingV712()"><option value="perPerson">每人計價</option><option value="perTable">每桌計價</option><option value="fixed">固定總價</option></select></div><div id="restaurantTableFields" class="two" hidden><div class="field"><label for="restaurantTableSeats">每桌人數</label><input id="restaurantTableSeats" type="number" min="1" step="1" value="10" placeholder="例如：10"></div><div class="field"><label for="restaurantMinTables">最低桌數（選填）</label><input id="restaurantMinTables" type="number" min="0" step="1" placeholder="例如：2"></div></div><div class="two"><div class="field"><label for="restaurantServiceRate">服務費率（%）</label><input id="restaurantServiceRate" type="number" min="0" max="100" step="0.1" placeholder="例如：10"></div><div class="field"><label for="restaurantFixedFee">其他固定費用（選填）</label><input id="restaurantFixedFee" type="number" min="0" step="1" placeholder="例如：包廂費 2000"></div></div></div>`);
  priceField.querySelector('label').id='restaurantPriceLabel';priceField.querySelector('label').textContent='每人單價';newPrice.placeholder='例如：1188';if(restVarianceHint)restVarianceHint.hidden=true;toggleRestaurantPricingV712();
}
function toggleRestaurantPricingV712(){let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',table=document.getElementById('restaurantTableFields'),label=document.getElementById('restaurantPriceLabel');if(table)table.hidden=mode!=='perTable';if(label)label.textContent=mode==='perPerson'?'每人單價':mode==='perTable'?'每桌價格':'固定總價';if(newPrice)newPrice.placeholder=mode==='perPerson'?'例如：1188':mode==='perTable'?'例如：12000':'例如：50000'}
document.addEventListener('DOMContentLoaded',installRestaurantPricingV712);

renderRestPanel=function(){
  restTable.innerHTML=table(['餐廳','地址','Google Map','類型','計價方式','價格設定','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td>${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':''}</td><td>${esc(r.description||r.cuisine||'')}</td><td><span class="badge blue">${esc(pricingModeLabelV712(pricingModeV712(r)))}</span></td><td>${esc(pricingSummaryV712(r))}</td><td class="alignCenter">${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant('${r.id}')">編輯</button> <button class="btn red" onclick="delDoc('restaurants','${r.id}')">刪除</button></td></tr>`));
};
editRestaurant=function(id){let r=D.restaurants.find(x=>x.id===id);if(!r)return alert('找不到這筆餐廳資料');installRestaurantPricingV712();editingRestaurantId=id;newRest.value=r.name||'';newAddr.value=r.address||'';newMap.value=r.googleMap||r.mapUrl||'';newPrice.value=moneyValue(r.price)??'';newCuisine.value=r.description||r.cuisine||'';newRestSort.value=r.sort??'';document.getElementById('restaurantPricingMode').value=pricingModeV712(r);document.getElementById('restaurantTableSeats').value=Math.max(1,Math.floor(numericV712(r.tableSeats,10)));document.getElementById('restaurantMinTables').value=numericV712(r.minTables,0)||'';document.getElementById('restaurantServiceRate').value=numericV712(r.serviceRate,0)||'';document.getElementById('restaurantFixedFee').value=numericV712(r.fixedFee,0)||'';toggleRestaurantPricingV712();restFormHeading.textContent='編輯餐廳：'+(r.name||'');restModeBadge.textContent='編輯模式';restModeBadge.className='modeBadge edit';restSaveBtn.textContent='儲存變更';restCancelBtn.hidden=false;newRest.focus()};
cancelRestaurantEdit=function(render=true){editingRestaurantId=null;newRest.value='';newAddr.value='';newMap.value='';newPrice.value='';newCuisine.value='';newRestSort.value='';let mode=document.getElementById('restaurantPricingMode');if(mode)mode.value='perPerson';['restaurantMinTables','restaurantServiceRate','restaurantFixedFee'].forEach(id=>{let x=document.getElementById(id);if(x)x.value=''});let seats=document.getElementById('restaurantTableSeats');if(seats)seats.value='10';toggleRestaurantPricingV712();restFormHeading.textContent='新增餐廳';restModeBadge.textContent='新增模式';restModeBadge.className='modeBadge new';restSaveBtn.textContent='新增餐廳';restCancelBtn.hidden=true;if(render)renderRestPanel()};
saveRestaurant=async function(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');let name=newRest.value.trim();if(!name){newRest.focus();return alert('請輸入餐廳名稱')}
  let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',price=moneyValue(newPrice.value),tableSeats=Math.floor(numericV712(document.getElementById('restaurantTableSeats')?.value,10)),minTables=Math.floor(numericV712(document.getElementById('restaurantMinTables')?.value,0)),serviceRate=numericV712(document.getElementById('restaurantServiceRate')?.value,0),fixedFee=numericV712(document.getElementById('restaurantFixedFee')?.value,0);
  if(newPrice.value.trim()!==''&&price===null)return alert('價格請輸入有效數字');if(mode==='perTable'&&tableSeats<1)return alert('每桌人數至少為 1 人');if(serviceRate>100)return alert('服務費率不可超過 100%');
  let id=editingRestaurantId,isEdit=!!id,before=id?JSON.stringify(D.restaurants.find(x=>x.id===id)||{}):'',data={surveyId:activeSurveyId,name,address:newAddr.value.trim(),googleMap:newMap.value.trim(),description:newCuisine.value.trim(),pricingMode:mode,price,tableSeats:mode==='perTable'?tableSeats:null,minTables:mode==='perTable'?minTables:0,serviceRate,fixedFee,sort:Number(newRestSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};restSaveBtn.disabled=true;restSaveBtn.textContent='儲存中…';
  try{let ref;if(isEdit){ref=doc('restaurants',id);await ref.set(data,{merge:true})}else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();ref=await col('restaurants').add(data);id=ref.id}cancelRestaurantEdit(false);await loadSurveyData();renderFront();renderAdmin();let after=D.restaurants.find(x=>x.id===id);if(after&&(!isEdit||before!==JSON.stringify(after)))await writeAuditV711(isEdit?'修改':'新增','餐廳',id,(isEdit?'修改餐廳「':'新增餐廳「')+name+'」');toast(isEdit?'餐廳變更已儲存':'餐廳已新增')}catch(e){console.error('save restaurant failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}
};
function costEstimateSectionV712(dateId,restaurantId,contextTitle='費用試算'){
  let date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===restaurantId);if(!dateId&&!restaurantId)return'<div class="finalEmpty">請選擇日期與餐廳後，系統會依該日期可出席人數進行試算。</div>';if(!dateId)return'<div class="finalEmpty">請先選擇試算日期。</div>';if(!restaurantId)return'<div class="finalEmpty">請先選擇試算餐廳。</div>';if(!date||!rest)return'<div class="finalEmpty">找不到日期或餐廳資料，請重新選擇。</div>';
  let attending=attendeeResponsesForDate(dateId),budgetAttending=budgetEligibleAttendeesForDate(dateId),budget=activityBudgetPerPerson(),cost=restaurantCostV712(rest,attending.length),budgetTotal=budget===null?null:budget*budgetAttending.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total,nonBudgetCount=attending.length-budgetAttending.length,tableDetail=cost.mode==='perTable'?`<div><span>預估桌數</span><strong>${cost.tables} 桌（${cost.tableSeats} 人／桌${cost.minTables?'，最低 '+cost.minTables+' 桌':''}）</strong></div>`:'';
  return `<section class="finalGroup finalCostBox costEstimateBox"><div class="finalGroupHead"><h4>${esc(contextTitle)}</h4><span class="countBadge">${attending.length} 人可出席</span></div><div class="costEstimateTitle"><b>${esc(date.label||'')}</b><span>×</span><b>${esc(rest.name||'')}</b></div><div class="finalCostGrid"><div><span>計價方式</span><strong>${esc(pricingModeLabelV712(cost.mode))}</strong></div><div><span>價格設定</span><strong>${esc(pricingSummaryV712(rest))}</strong></div><div><span>可出席人數</span><strong>${attending.length} 人</strong></div><div><span>預算人數</span><strong>${budgetAttending.length} 人${nonBudgetCount>0?'（'+nonBudgetCount+' 人不納入預算）':''}</strong></div>${tableDetail}<div><span>未加服務費小計</span><strong>${cost.subtotal===null?'—':esc(moneyText(cost.subtotal))+' 元'}</strong></div><div><span>服務費</span><strong>${esc(moneyText(cost.serviceFee))} 元</strong></div><div><span>其他固定費用</span><strong>${esc(moneyText(cost.fixedFee))} 元</strong></div><div><span>平均每人餐費</span><strong>${cost.effectivePerPerson===null?'—':esc(moneyText(Math.round(cost.effectivePerPerson)))+' 元'}</strong></div><div><span>預算總額</span><strong>${budgetTotal===null?'—':esc(moneyText(budgetTotal))+' 元'}</strong></div><div><span>餐費總額</span><strong>${cost.total===null?'—':esc(moneyText(cost.total))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">預算總額以「納入預算」人數計算；餐費依所選餐廳的計價方式與實際可出席人數計算。</p></section>`;
}
buildCostEstimateHtml=costEstimateSectionV712;
renderCostEstimate=function(){let box=document.getElementById('costEstimatePreview'),dateSelect=document.getElementById('costDate'),restSelect=document.getElementById('costRest');if(!box||!dateSelect||!restSelect)return;let dateId=dateSelect.value,restId=restSelect.value,matrix='';if(D.dates.length&&D.restaurants.length)matrix=`<section class="finalGroup costMatrix"><div class="finalGroupHead"><h4>快速比較</h4><span class="muted">顯示各日期 × 餐廳的總額差異</span></div>${table(['日期','可出席人數','預算人數',...D.restaurants.map(r=>esc(r.name))],D.dates.map(d=>{let count=attendeeResponsesForDate(d.id).length,budgetCount=budgetEligibleAttendeesForDate(d.id).length;return `<tr><td class="costDateCell"><b>${esc(d.label)}</b></td><td class="alignCenter">${count}</td><td class="alignCenter">${budgetCount}</td>${D.restaurants.map(r=>{let budget=activityBudgetPerPerson(),cost=restaurantCostV712(r,count),value=budget===null||cost.total===null?null:(budget*budgetCount)-cost.total,tone=value===null?'empty':value<0?'over':'ok',status=value===null?'尚未設定':value<0?'超支':'剩餘',amount=value===null?'—':esc(moneyText(Math.abs(value)))+' 元';return `<td class="costValueCell"><button class="costPickBtn ${tone}" onclick="pickCostEstimate('${escAttr(d.id)}','${escAttr(r.id)}')"><span class="costStatusBadge ${tone}">${status}</span><strong class="costMatrixAmount ${tone}">${amount}</strong></button></td>`}).join('')}</tr>`}))}</section>`;box.innerHTML=costEstimateSectionV712(dateId,restId,'試算結果')+matrix};
const renderFinalAttendancePreviewV712Base=renderFinalAttendancePreview;renderFinalAttendancePreview=function(){renderFinalAttendancePreviewV712Base();let box=document.getElementById('finalAttendancePreview'),dateId=finalDate.value,restId=finalRest.value,old=box?.querySelector('.finalCostBox');if(!box||!dateId||!old)return;let holder=document.createElement('div');holder.innerHTML=restId?costEstimateSectionV712(dateId,restId,'餐費試算'):'<section class="finalGroup finalCostBox"><div class="finalEmpty">選擇最終餐廳後，會依當天可出席人數及餐廳計價方式自動試算。</div></section>';old.replaceWith(holder.firstElementChild)};
const exportExcelV712Base=exportExcel;exportExcel=function(){
  if(!window.XLSX)return exportExcelV712Base();let originalWrite=XLSX.writeFile;
  XLSX.writeFile=function(workbook,filename){
    let rest=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId),count=attendeeResponsesForDate(D.final?.finalDateId||'').length,cost=restaurantCostV712(rest,count),budget=activityBudgetPerPerson(),budgetCount=budgetEligibleAttendeesForDate(D.final?.finalDateId||'').length,budgetTotal=budget===null?null:budget*budgetCount;
    let finalSheet=workbook.Sheets['最終出席名單'];if(finalSheet){let rows=XLSX.utils.sheet_to_json(finalSheet,{header:1,defval:''});rows.forEach(row=>{if(row[0]==='單價'){row[0]='計價方式';row[1]=rest?pricingModeLabelV712(pricingModeV712(rest)):''}else if(row[0]==='每人價差'){row[0]='價格設定';row[1]=rest?pricingSummaryV712(rest):''}else if(row[0]==='餐費總額')row[1]=cost.total===null?'':moneyText(cost.total);else if(row[0]==='總額差異')row[1]=budgetTotal===null||cost.total===null?'—':budgetStatusText(budgetTotal-cost.total)});workbook.Sheets['最終出席名單']=XLSX.utils.aoa_to_sheet(rows);workbook.Sheets['最終出席名單']['!merges']=[XLSX.utils.decode_range('A1:E1')];workbook.Sheets['最終出席名單']['!cols']=[{wch:18},{wch:36},{wch:14},{wch:14},{wch:34}]}
    let restaurantSheet=workbook.Sheets['餐廳統計'];if(restaurantSheet){let rows=XLSX.utils.sheet_to_json(restaurantSheet,{defval:''});rows.forEach((row,index)=>{let r=D.restaurants[index];row['計價方式']=r?pricingModeLabelV712(pricingModeV712(r)):'';row['價格設定']=r?pricingSummaryV712(r):'';delete row['單價'];delete row['每人差異']});workbook.Sheets['餐廳統計']=XLSX.utils.json_to_sheet(rows)}
    return originalWrite.call(XLSX,workbook,filename);
  };try{return exportExcelV712Base()}finally{XLSX.writeFile=originalWrite}
};

// ===== 以 穩定版為基底，重新套用 11 項後台體驗補強 =====
function memberLabelV719(user=currentUser){
  let email=String(user?.email||'').toLowerCase();
  let account=D.memberAccounts?.find(a=>String(a.email||'').toLowerCase()===email);
  let member=account?D.members.find(m=>m.id===account.memberId):D.members.find(m=>String(m.googleEmail||m.email||'').toLowerCase()===email);
  if(member)return [member.department||member.departmentName,member.name||member.employeeName].filter(Boolean).join(' ');
  return user?.displayName||user?.email||'';
}
function securitySettingsV719(s=activeSurvey()){let x=D.frontProtection||s?.securitySettings||{};return{disableRightClick:!!x.disableRightClick,disableViewSource:!!x.disableViewSource,disableDevTools:!!x.disableDevTools}}
let securityKeyHandlerV719=null,securityContextHandlerV719=null;
function applyFrontSecurityV719(settings){
  document.removeEventListener('contextmenu',securityContextHandlerV719,true);
  document.removeEventListener('keydown',securityKeyHandlerV719,true);
  securityContextHandlerV719=e=>{if(settings.disableRightClick){e.preventDefault();toast('此頁已停用右鍵選單')}};
  securityKeyHandlerV719=e=>{let k=String(e.key||'').toLowerCase(),blockSource=settings.disableViewSource&&e.ctrlKey&&k==='u',blockDev=settings.disableDevTools&&(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k)));if(blockSource||blockDev){e.preventDefault();e.stopPropagation();toast('此快捷鍵已停用')}};
  document.addEventListener('contextmenu',securityContextHandlerV719,true);
  document.addEventListener('keydown',securityKeyHandlerV719,true);
}
function ensureSecuritySettingsV719(){
  if(!isSystemAdmin)return;
  let box=document.getElementById('frontProtectionSettingsBox');
  if(!box||document.getElementById('securitySettingsBox'))return;
  box.insertAdjacentHTML('beforeend',`<div id="securitySettingsBox" class="securitySettingsBox">
    <label class="checkLine"><input id="secRightClick" type="checkbox"> 停用右鍵</label>
    <label class="checkLine"><input id="secViewSource" type="checkbox"> 停用 Ctrl + U 檢視原始碼</label>
    <label class="checkLine"><input id="secDevTools" type="checkbox"> 停用 F12 / Ctrl + Shift + I</label>
    <button class="btn primary" onclick="saveSecuritySettingsV719()">儲存前台防護</button>
  </div>`);
  syncSecuritySettingsV719();
}
function syncSecuritySettingsV719(){let s=securitySettingsV719(),a=document.getElementById('secRightClick'),b=document.getElementById('secViewSource'),c=document.getElementById('secDevTools');if(a)a.checked=s.disableRightClick;if(b)b.checked=s.disableViewSource;if(c)c.checked=s.disableDevTools}
async function saveSecuritySettingsV719(){
  if(!isSystemAdmin)return alert('此功能僅限系統管理員');
  let frontProtection={disableRightClick:!!document.getElementById('secRightClick')?.checked,disableViewSource:!!document.getElementById('secViewSource')?.checked,disableDevTools:!!document.getElementById('secDevTools')?.checked,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  await doc('systemSettings','frontProtection').set(frontProtection,{merge:true});
  await loadAll();renderAdmin();renderFront();toast('前台防護已更新');
}

const applyRouteV719=applyRoute;applyRoute=function(){normalizeLegacyManageRoute();let wantsAdmin=location.hash.startsWith('#manage');document.body.classList.toggle('adminLoginOnly',wantsAdmin&&!isAdmin);applyRouteV719();if(wantsAdmin&&!isAdmin){front.style.display='none';admin.style.display='none';loginMask.style.display='flex'}};
const statusLabelV719=statusLabel;statusLabel=function(status){return status==='archived'?'已結案':statusLabelV719(status)};
async function archiveSurveyV719(id,archive=true){
  let s=D.surveys.find(x=>x.id===id);if(!s)return;
  if(!confirm(archive?'確定將「'+(s.title||id)+'」標記為結案？結案後仍可恢復進行中。':'確定將「'+(s.title||id)+'」恢復為進行中？'))return;
  await doc('surveys',id).set({status:archive?'archived':'open',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  if(typeof writeAuditV711==='function')await writeAuditV711(archive?'結案':'恢復','活動',id,(archive?'結案':'恢復進行中')+'「'+(s.title||id)+'」',id);
  await loadAll();renderAdmin();renderFront();toast(archive?'活動已結案':'活動已恢復進行中');
}
function applyArchiveButtonsV719(){
  if(!isSystemAdmin)return;
  document.querySelectorAll('#surveyTable tbody tr').forEach((row,index)=>{
    let s=D.surveys[index],ops=row.querySelector('.operationCell');if(!s||!ops||ops.querySelector('.archiveSurveyBtn'))return;
    let btn=document.createElement('button');btn.type='button';btn.className='btn archiveSurveyBtn';btn.textContent=s.status==='archived'?'恢復進行中':'結案';btn.onclick=()=>archiveSurveyV719(s.id,s.status!=='archived');ops.insertBefore(btn,ops.firstChild);
    let badge=row.cells[1]?.querySelector('.badge');if(badge&&s.status==='archived'){badge.textContent='已結案';badge.className='badge gray'}
  });
}

function ensureDuplicateSurveyModalV719(){
  if(document.getElementById('duplicateSurveyModal'))return;
  document.body.insertAdjacentHTML('beforeend',`<div id="duplicateSurveyModal" class="modalMask" style="display:none">
    <div class="modal duplicateSurveyDialog"><div class="modalHeader"><h3>複製活動</h3><button class="modalClose" onclick="closeDuplicateSurveyModalV719()">×</button></div>
    <p class="muted">建立一份新活動，再選擇要沿用哪些設定；填答資料與最終決議不會被複製。</p>
    <input id="dupSourceId" type="hidden"><div class="field"><label for="dupSurveyTitle">新活動名稱</label><input id="dupSurveyTitle" placeholder="例如：115年第四次部門聚餐調查"></div>
      <div class="copyOptions"><label><input id="dupCopyDescription" type="checkbox" checked> 說明文字與前台提示</label><label><input id="dupCopyDepartments" type="checkbox" checked> 參與部門</label><label><input id="dupCopyTheme" type="checkbox" checked> 前台主題</label><label><input id="dupCopyDates" type="checkbox" checked> 日期清單</label><label><input id="dupCopyRestaurants" type="checkbox" checked> 餐廳與費用設定</label><label><input id="dupCopyBudget" type="checkbox" checked> 人員預算／填寫資格</label><label><input id="dupCopyAccess" type="checkbox"> 權限指派</label></div>
    <div class="modalActions"><button class="btn" onclick="closeDuplicateSurveyModalV719()">取消</button><button class="btn primary" onclick="confirmDuplicateSurveyV719()">建立複本</button></div></div>
  </div>`);
}
function duplicateSurveyPrompt(sourceId){ensureDuplicateSurveyModalV719();let s=D.surveys.find(x=>x.id===sourceId);document.getElementById('dupSourceId').value=sourceId;document.getElementById('dupSurveyTitle').value=(s?.title||'活動')+'（複本）';document.getElementById('duplicateSurveyModal').style.display='flex'}
function closeDuplicateSurveyModalV719(){let m=document.getElementById('duplicateSurveyModal');if(m)m.style.display='none'}
async function confirmDuplicateSurveyV719(){
  let sourceId=document.getElementById('dupSourceId')?.value,title=document.getElementById('dupSurveyTitle')?.value.trim();
  if(!title)return alert('請輸入新活動名稱');
  await duplicateSurveyV719(sourceId,title,{description:document.getElementById('dupCopyDescription')?.checked,departments:document.getElementById('dupCopyDepartments')?.checked,theme:document.getElementById('dupCopyTheme')?.checked,dates:document.getElementById('dupCopyDates')?.checked,restaurants:document.getElementById('dupCopyRestaurants')?.checked,budget:document.getElementById('dupCopyBudget')?.checked,access:document.getElementById('dupCopyAccess')?.checked});
  closeDuplicateSurveyModalV719();
}
async function duplicateSurveyV719(sourceId,newTitle,opts){
  if(!isSystemAdmin)return alert('只有系統管理員可以複製活動');
  let source=D.surveys.find(s=>s.id===sourceId);if(!source)return alert('找不到來源活動');
  let newId='survey_'+Date.now(),data={title:newTitle,deadline:'',status:'draft',allowEdit:source.allowEdit!==false,isAnonymous:false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  if(opts.description)Object.assign(data,{description:source.description||'',descriptionHtml:source.descriptionHtml||'',descriptionStyle:source.descriptionStyle||{},frontInstructions:source.frontInstructions||''});
  data.targetDepartments=opts.departments?[...(source.targetDepartments||[])]:[];
  if(opts.theme)Object.assign(data,{theme:source.theme||'classic'});
  await doc('surveys',newId).set(data,{merge:true});
  let jobs=[],sourceDates=await col('surveyDates').where('surveyId','==',sourceId).get(),sourceRestaurants=await col('restaurants').where('surveyId','==',sourceId).get(),sourceBudget=await col('budgetEligibility').where('surveyId','==',sourceId).get(),sourceManagers=await col('surveyManagers').where('surveyId','==',sourceId).get();
  if(opts.dates)jobs.push(...sourceDates.docs.map(d=>{let x=d.data();return col('surveyDates').add({surveyId:newId,label:x.label,sort:x.sort||0,active:x.active!==false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
  if(opts.restaurants)jobs.push(...sourceRestaurants.docs.map(d=>{let x=d.data();return col('restaurants').add({...x,surveyId:newId,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
  if(opts.budget)jobs.push(...sourceBudget.docs.map(d=>{let x=d.data();return doc('budgetEligibility',newId+'__'+x.memberId).set({...x,surveyId:newId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
  if(opts.access)jobs.push(...sourceManagers.docs.map(d=>{let x=d.data();return doc('surveyManagers',newId+'__'+x.email).set({surveyId:newId,email:x.email,role:x.role||'viewer',enabled:x.enabled!==false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
  await Promise.all(jobs);activeSurveyId=newId;await loadAll();await loadSurveyData();history.replaceState(null,'',adminHash());renderFront();renderAdmin();if(typeof writeAuditV711==='function')await writeAuditV711('複製','活動',newId,'由「'+(source.title||sourceId)+'」複製建立「'+newTitle+'」',newId);toast('活動複本已建立');
}

function installRestaurantNoteV719(){let cuisine=newCuisine?.closest('.field');if(!cuisine||document.getElementById('newRestOpsNote'))return;cuisine.insertAdjacentHTML('afterend','<div class="field restaurantOpsNoteField"><label for="newRestOpsNote">內部作業備註（不顯示於前台）</label><textarea id="newRestOpsNote" rows="3" placeholder="例如：已詢問包廂、訂位聯絡人、最低消費、菜單確認進度"></textarea></div>')}
const editRestaurantV719=editRestaurant;editRestaurant=function(id){editRestaurantV719(id);installRestaurantNoteV719();let r=D.restaurants.find(x=>x.id===id),n=document.getElementById('newRestOpsNote');if(n)n.value=r?.internalNote||r?.opsNote||''};
const cancelRestaurantEditV719=cancelRestaurantEdit;cancelRestaurantEdit=function(render=true){cancelRestaurantEditV719(render);let n=document.getElementById('newRestOpsNote');if(n)n.value=''};
const saveRestaurantV719=saveRestaurant;saveRestaurant=async function(){let note=document.getElementById('newRestOpsNote')?.value.trim()||'',id=editingRestaurantId,name=newRest.value.trim();await saveRestaurantV719();let target=id||D.restaurants.find(r=>r.name===name)?.id;if(target){await doc('restaurants',target).set({internalNote:note,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadSurveyData();renderAdmin()}};

const renderSystemMemberPanelV719=renderSystemMemberPanel;renderSystemMemberPanel=function(){let current=document.getElementById('sysMemberDeptFilter')?.value||'',all=D.members;if(current)D.members=all.filter(m=>(m.department||m.departmentName||'')===current);renderSystemMemberPanelV719();D.members=all;let box=document.getElementById('sysMemberTable')||document.getElementById('sysMembersBox');if(box&&!document.getElementById('sysMemberDeptFilter')){let departments=[...new Set(all.map(m=>m.department||m.departmentName).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'zh-Hant'));box.insertAdjacentHTML('beforebegin','<div class="inlineFilterBar"><label for="sysMemberDeptFilter">部門篩選</label><select id="sysMemberDeptFilter" onchange="renderSystemMemberPanel()"><option value="">全部部門</option>'+departments.map(d=>'<option value="'+escAttr(d)+'">'+esc(d)+'</option>').join('')+'</select></div>');document.getElementById('sysMemberDeptFilter').value=current}};

const renderFrontV719=renderFront;renderFront=function(){renderFrontV719();applyFrontSecurityV719(securitySettingsV719(activeSurvey()));document.body.classList.add('frontReady');let p=document.getElementById('previewAdminUser');if(p)p.textContent=memberLabelV719()};
const renderAdminV719=renderAdmin;renderAdmin=function(){renderAdminV719();if(adminUser)adminUser.textContent=memberLabelV719();ensureSecuritySettingsV719();syncSecuritySettingsV719();applyArchiveButtonsV719();installRestaurantNoteV719()};

// ===== 顯示細節、紀錄分頁與主題選單補強 =====
function memberLabelV721ByEmail(email,fallback=''){
  email=normalizeEmail(email);
  let account=D.memberAccounts?.find(a=>normalizeEmail(a.email)===email);
  let member=account?D.members.find(m=>m.id===account.memberId):D.members.find(m=>normalizeEmail(m.googleEmail||m.email)===email);
  let label=memberDisplayName(member);
  return label||String(fallback||email||'').trim();
}
function applySurveyTablePolishV721(){
  document.querySelectorAll('#surveyTable tbody tr').forEach(row=>{
    if(row.cells[2])row.cells[2].classList.add('surveyTimeCell');
    let ops=row.querySelector('.operationCell');
    if(!ops)return;
    ops.classList.add('surveyOperationCell');
    let setCurrent=[...ops.querySelectorAll('button')].find(btn=>btn.textContent.trim()==='設為目前');
    if(setCurrent)ops.appendChild(setCurrent);
  });
}
function placeSystemMemberFilterV721(){
  let filter=document.getElementById('sysMemberDeptFilter')?.closest('.inlineFilterBar');
  let tableBox=document.getElementById('sysMemberTable')||document.getElementById('sysMembersBox');
  if(!filter||!tableBox)return;
  filter.classList.add('sysMemberFilterBar');
  let tableEl=tableBox.querySelector('.table');
  if(tableEl){
    if(filter.parentElement!==tableBox||filter.nextElementSibling!==tableEl)tableBox.insertBefore(filter,tableEl);
  }else if(filter.parentElement!==tableBox){
    tableBox.appendChild(filter);
  }
}
function applyAccessPanelPolishV721(){
  let box=document.getElementById('securitySettingsBox');
  if(!box)return;
  box.classList.add('securitySettingsBoxV721');
  box.querySelectorAll('.checkLine').forEach(line=>line.classList.add('securityOptionV721'));
}
// 相容清理：不再於此處覆蓋 renderLogsV711 / writeAuditV711。
// 實際顯示與寫入由檔案後段的詳細差異版統一接管。
writeLoginV711=async function(result,reason=''){
  if(!currentUser||!db)return;
  try{await col('surveyLoginLogs').add({uid:currentUser.uid,email:String(currentUser.email||'').toLowerCase(),displayName:currentUserDisplayText(),result,reason,role:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}
  catch(e){console.warn('登入紀錄寫入失敗',e)}
};
const renderSurveyPanelV721=renderSurveyPanel;
renderSurveyPanel=function(){renderSurveyPanelV721();applySurveyTablePolishV721()};
const renderSystemMemberPanelV721=renderSystemMemberPanel;
renderSystemMemberPanel=function(){renderSystemMemberPanelV721();placeSystemMemberFilterV721()};
const renderAdminV721=renderAdmin;
renderAdmin=function(){
  renderAdminV721();
  if(adminUser)adminUser.textContent=currentUserDisplayText()||memberLabelV719();
  applySurveyTablePolishV721();
  placeSystemMemberFilterV721();
  applyAccessPanelPolishV721();
};
const renderFrontV721=renderFront;
renderFront=function(){
  renderFrontV721();
  let p=document.getElementById('previewAdminUser');
  if(p)p.textContent=currentUserDisplayText()||memberLabelV719();
};

// ===== 店家資訊、日期輸入、服務費與預算位置優化 =====
function restaurantInfoUrlV724(r){return safeUrl(r?.infoUrl||'')}
function installRestaurantInfoUrlV724(){
  let mapField=newMap?.closest('.field');
  if(!mapField||document.getElementById('newInfoUrl'))return;
  mapField.insertAdjacentHTML('afterend','<div class="field"><label for="newInfoUrl">店家資訊網址</label><input id="newInfoUrl" placeholder="貼上官網、菜單、Facebook 或訂位頁連結"></div>');
}
function installDatePickerV724(){
  if(!newDate||document.getElementById('newDatePickerV724'))return;
  let field=newDate.closest('div')||newDate.closest('.field');
  let row=field?.parentElement;
  if(!field||!row)return;
  field.classList.add('dateGeneratedFieldV736','dateSourceFieldV755');
  row.classList.add('dateEntryRowV736');
  let pickerBox=document.createElement('div');
  pickerBox.className='dateAutoBox';
  pickerBox.innerHTML='<label for="newDatePickerV724">日期選擇器</label><input id="newDatePickerV724" type="date">';
  let suffixBox=document.createElement('div');
  suffixBox.className='dateAutoBox';
  suffixBox.innerHTML='<label for="newDateSuffixV724">補充文字（選填）</label><input id="newDateSuffixV724" placeholder="例如：晚上、午餐">';
  let hint=document.createElement('small');
  hint.className='muted dateAutoHintV736';
  hint.textContent='系統會自動產生 06/28(日)；若需加註「晚上、午餐」等文字，請填寫補充文字。';
  row.insertBefore(pickerBox,field);
  row.insertBefore(suffixBox,field);
  row.appendChild(hint);
  newDate.placeholder='例如：06/28(日) 晚上，也可自行覆寫';
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  picker.addEventListener('change',syncDateLabelV724);
  suffix.addEventListener('input',syncDateLabelV724);
}

// ===== 必要欄位引導文字一致化 =====
function installFieldGuidanceV976(){
  const placeholders={
    newMem:'例如：蔡雨鑫',
    newEmp:'例如：7902',
    newDateSort:'例如：1',
    newRest:'例如：彩膳樂亭',
    newRestSort:'例如：1',
    newAddr:'例如：台北市松山區健康路156號1樓',
    newMap:'貼上 Google 地圖分享連結',
    finalNote:'例如：已完成訂位，請準時出席；如有異動請通知承辦人。'
  };
  Object.entries(placeholders).forEach(([id,text])=>{
    const input=document.getElementById(id);
    if(input)input.placeholder=text;
  });
  ['newDateSort','newRestSort'].forEach(id=>{
    const input=document.getElementById(id);
    if(!input||input.parentElement?.querySelector('.fieldHintV976'))return;
    const hint=document.createElement('small');
    hint.className='muted fieldHintV976';
    hint.textContent='數字越小，顯示順序越前面。';
    input.insertAdjacentElement('afterend',hint);
  });
}
document.addEventListener('DOMContentLoaded',installFieldGuidanceV976);
function weekdayLabelV724(dateText){
  let d=new Date(dateText+'T00:00:00');
  return Number.isNaN(d.getTime())?'':'日一二三四五六'[d.getDay()];
}
function syncDateLabelV724(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value)return;
  let [,m,d]=picker.value.match(/^(\d{4})-(\d{2})-(\d{2})$/)||[];
  let w=weekdayLabelV724(picker.value);
  if(!m||!d||!w)return;
  newDate.value=String(m).padStart(2,'0')+'/'+String(d).padStart(2,'0')+'（'+w+'）'+(suffix?.value.trim()?(' '+suffix.value.trim()):'');
}
function fillDatePickerFromLabelV724(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let m=String(label||'').match(/^(\d{1,2})\/(\d{1,2})（[日一二三四五六]）\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+String(m[1]).padStart(2,'0')+'-'+String(m[2]).padStart(2,'0');
    suffix.value=m[3]||'';
  }
}
function installSurveyBudgetBoxV724(){
  if(!surveyEditor||document.getElementById('surveyBudgetBoxV724'))return;
  let deptField=targetDeptBox?.closest('.field');
  if(!deptField)return;
  deptField.insertAdjacentHTML('beforebegin','<div id="surveyBudgetBoxV724" class="surveyBudgetFieldV779"><div class="field"><label for="budgetPerPersonMirrorV724">每人預算（選填）</label><div class="budgetInputWrapV779"><input id="budgetPerPersonMirrorV724" type="number" min="0" step="1" placeholder="例如：1200"><span>元 / 人</span></div><small class="muted">此金額會用於費用試算與預算比較；若不需要控管預算，可留空。</small></div></div>');
  let mirror=document.getElementById('budgetPerPersonMirrorV724');
  mirror.addEventListener('input',()=>{if(budgetPerPerson)budgetPerPerson.value=mirror.value});
}
function syncBudgetMirrorV724(){
  let mirror=document.getElementById('budgetPerPersonMirrorV724');
  if(mirror)mirror.value=activityBudgetPerPerson()??'';
}
function serviceFeePerPersonV724(rest){
  let price=moneyValue(rest?.price),rate=Math.min(100,numericV712(rest?.serviceRate,0));
  return price===null?0:Math.round(price*rate/100);
}
restaurantCostV712=function(rest,attendanceCount){
  if(!rest)return{mode:'perPerson',price:null,tableSeats:10,minTables:0,tables:0,subtotal:null,serviceRate:0,serviceFee:0,serviceFeePerPerson:0,fixedFee:0,total:null,effectivePerPerson:null};
  let mode=pricingModeV712(rest),price=moneyValue(rest.price),count=Math.max(0,Number(attendanceCount||0)),tableSeats=Math.max(1,Math.floor(numericV712(rest.tableSeats,10))),minTables=Math.max(0,Math.floor(numericV712(rest.minTables,0))),tables=mode==='perTable'?Math.max(minTables,Math.ceil(count/tableSeats)):0,subtotal=null,serviceRate=Math.min(100,numericV712(rest.serviceRate,0)),serviceFeePerPerson=0,serviceFee=0;
  if(price!==null){
    if(mode==='perTable')subtotal=price*tables;
    else if(mode==='fixed')subtotal=price;
    else subtotal=price*count;
  }
  if(subtotal!==null){
    if(mode==='perPerson'){serviceFeePerPerson=serviceFeePerPersonV724(rest);serviceFee=serviceFeePerPerson*count}
    else serviceFee=Math.round(subtotal*serviceRate/100);
  }
  let fixedFee=numericV712(rest.fixedFee,0),total=subtotal===null?null:subtotal+serviceFee+fixedFee;
  return{mode,price,tableSeats,minTables,tables,subtotal,serviceRate,serviceFee,serviceFeePerPerson,fixedFee,total,effectivePerPerson:total!==null&&count?total/count:null};
};
const costEstimateSectionV724Base=costEstimateSectionV712;
costEstimateSectionV712=function(dateId,restaurantId,contextTitle='費用試算'){
  let html=costEstimateSectionV724Base(dateId,restaurantId,contextTitle),rest=D.restaurants.find(r=>r.id===restaurantId),date=D.dates.find(d=>d.id===dateId);
  if(!rest||!date||pricingModeV712(rest)!=='perPerson'||!numericV712(rest.serviceRate,0))return html;
  let cost=restaurantCostV712(rest,attendeeResponsesForDate(dateId).length);
  return html.replace('<div><span>服務費</span><strong>'+esc(moneyText(cost.serviceFee))+' 元</strong></div>','<div><span>每人服務費</span><strong>'+esc(moneyText(cost.serviceFeePerPerson))+' 元／人</strong></div><div><span>服務費小計</span><strong>'+esc(moneyText(cost.serviceFee))+' 元</strong></div>');
};
buildCostEstimateHtml=costEstimateSectionV712;
renderRestPanel=function(){
  installRestaurantInfoUrlV724();
  restTable.innerHTML=table(['餐廳','地址','Google Map','店家資訊','類型','計價方式','價格設定','內部作業備註','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td class="alignCenter">${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':'—'}</td><td class="alignCenter">${restaurantInfoUrlV724(r)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(restaurantInfoUrlV724(r))+'">開啟</a>':'—'}</td><td>${esc(r.description||r.cuisine||'')}</td><td class="alignCenter"><span class="badge blue">${esc(pricingModeLabelV712(pricingModeV712(r)))}</span></td><td>${esc(pricingSummaryV712(r))}</td><td class="restaurantOpsCell">${esc(r.internalNote||r.opsNote||'—')}</td><td class="alignCenter">${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant('${r.id}')">編輯</button> <button class="btn red" onclick="delDoc('restaurants','${r.id}')">刪除</button></td></tr>`));
};
const editRestaurantV724Base=editRestaurant;
editRestaurant=function(id){
  editRestaurantV724Base(id);installRestaurantInfoUrlV724();
  let r=D.restaurants.find(x=>x.id===id),input=document.getElementById('newInfoUrl');
  if(input)input.value=r?.infoUrl||'';
};
const cancelRestaurantEditV724Base=cancelRestaurantEdit;
cancelRestaurantEdit=function(render=true){cancelRestaurantEditV724Base(render);let input=document.getElementById('newInfoUrl');if(input)input.value=''};
const saveRestaurantV724Base=saveRestaurant;
saveRestaurant=async function(){
  let infoUrl=document.getElementById('newInfoUrl')?.value.trim()||'',id=editingRestaurantId,name=newRest.value.trim();
  if(infoUrl&&!safeUrl(infoUrl))return alert('店家資訊網址格式不正確，請輸入 http 或 https 網址');
  await saveRestaurantV724Base();
  let target=id||D.restaurants.find(r=>r.name===name)?.id;
  if(target){await doc('restaurants',target).set({infoUrl,storeInfoUrl:firebase.firestore.FieldValue.delete(),websiteUrl:firebase.firestore.FieldValue.delete(),officialUrl:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadSurveyData();renderAdmin();renderFront()}
};
const renderDatePanelV724Base=renderDatePanel;
renderDatePanel=function(){installDatePickerV724();renderDatePanelV724Base()};
// 相容清理：日期編輯 / 取消編輯不再於 階段包裝，改由最後接管層統一處理。
const enhanceDateStatsV724Base=enhanceDateStatsV711;
enhanceDateStatsV711=function(){enhanceDateStatsV724Base();document.querySelectorAll('.dateAttendanceGroups details').forEach(d=>d.removeAttribute('open'))};
const renderAdminV724Base=renderAdmin;
renderAdmin=function(){renderAdminV724Base();installRestaurantInfoUrlV724();installDatePickerV724();installSurveyBudgetBoxV724();syncBudgetMirrorV724()};

// ===== 日期管理精簡、預算欄位定位與主題預覽修正 =====
function hideMemberBudgetBoxV725(){
  let box=budgetPerPerson?.closest('.budgetSettingBox');
  if(box)box.hidden=true;
}
function installDatePickerV725(){
  installDatePickerV724();
  if(!newDate)return;
  let field=newDate.closest('div')||newDate.closest('.field');
  let originalLabel=field?[...field.children].find(x=>x.tagName==='LABEL'&&x.getAttribute('for')!=='newDatePickerV724'&&x.getAttribute('for')!=='newDateSuffixV724'):null;
  originalLabel?.classList.add('generatedDateLabelV725');
  newDate.classList.add('generatedDateInputV725');
  newDate.readOnly=true;
  newDate.tabIndex=-1;
  newDate.setAttribute('aria-label','系統自動產生日期文字');
}
function fillSurveyForm(survey){
  const s=survey||{};
  if(svTitle)svTitle.value=s.title||'';
  if(typeof setRichDescription==='function')setRichDescription(s);else if(svDesc)svDesc.value=s.description||'';
  if(svInstructions)svInstructions.value=s.frontInstructions||'';
  const deadlineParts=typeof splitDeadline==='function'?splitDeadline(s.deadline):{date:'',time:'23:59'};
  if(svDeadline)svDeadline.value=deadlineParts.date||'';
  if(svDeadlineTime)svDeadlineTime.value=deadlineParts.time||'23:59';
  if(svStatus)svStatus.value=s.status||'open';
  if(svAllowEdit)svAllowEdit.value=String(s.allowEdit!==false);
  if(typeof ensureThemeControl==='function')ensureThemeControl();
  if(typeof setThemeEditorValueV760==='function')setThemeEditorValueV760(typeof surveyThemeValueV760==='function'?surveyThemeValueV760(s):(s.theme||'classic'));
  else if(typeof themeSelect==='function'&&themeSelect())themeSelect().value=typeof normalizeTheme==='function'?normalizeTheme(s.theme||'classic'):(s.theme||'classic');
  document.querySelectorAll('.targetDept').forEach(cb=>{cb.checked=Array.isArray(s.targetDepartments)&&s.targetDepartments.includes(cb.value)});
  if(typeof syncOpenScheduleV711==='function'&&document.getElementById('svOpenMode'))syncOpenScheduleV711();
  if(typeof updateSurveyDirtyState==='function'){surveyFormDirty=false;updateSurveyDirtyState();}
}
// 相容清理：日期儲存不再於 階段包裝，改由最後接管層統一處理。
const renderDatePanelV725Base=renderDatePanel;
renderDatePanel=function(){installDatePickerV725();renderDatePanelV725Base()};
// 相容清理：日期編輯回填不再於 階段包裝，改由最後接管層統一處理。
function normalizeRestaurantLinkAreaV725(){
  document.querySelectorAll('.restLinks').forEach(box=>{if(!box.textContent.trim())box.remove()});
}
const renderFrontV725Base=renderFront;
renderFront=function(){renderFrontV725Base();normalizeRestaurantLinkAreaV725()};
function renderThemePreviewV725(){
  let preview=document.getElementById('themePreview'),select=document.getElementById('svTheme');
  if(!preview||!select)return;
  syncThemeOptions(select.value);
  let theme=normalizeTheme(select.value);
  preview.dataset.theme=theme;
  preview.innerHTML='<div class="themePreviewBar"><span>'+FRONT_THEMES[theme]+'</span><span class="themePreviewDeadline">截止時間</span></div><div class="themePreviewBody"><span>前台頁面背景</span><span class="themePreviewStatus">問卷開放中</span></div>';
}
const ensureThemeControlV725Base=ensureThemeControl;
ensureThemeControl=function(){ensureThemeControlV725Base();let select=document.getElementById('svTheme');if(select&&!select.dataset.v725){select.dataset.v725='true';select.addEventListener('change',renderThemePreviewV725)}renderThemePreviewV725()};
const fillSurveyFormV725Base=fillSurveyForm;
fillSurveyForm=function(s){fillSurveyFormV725Base(s);syncThemeOptions(s?.theme||'classic');renderThemePreviewV725();syncBudgetMirrorV724()};
const renderAdminV725Base=renderAdmin;
renderAdmin=function(){renderAdminV725Base();hideMemberBudgetBoxV725();installDatePickerV725();renderThemePreviewV725();syncBudgetMirrorV724()};

// ===== 預算欄位、店家資訊與日期格式修正 =====
function pad2V726(value){return String(value).padStart(2,'0')}
function weekdayFromDateValueV726(value){
  let parts=String(value||'').split('-').map(Number);
  if(parts.length!==3||parts.some(n=>!Number.isFinite(n)))return '';
  let d=new Date(parts[0],parts[1]-1,parts[2]);
  return Number.isNaN(d.getTime())?'':'日一二三四五六'[d.getDay()];
}
syncDateLabelV724=function(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value||!newDate)return;
  let parts=picker.value.split('-');
  if(parts.length!==3)return;
  let w=weekdayFromDateValueV726(picker.value);
  if(!w)return;
  newDate.value=pad2V726(parts[1])+'/'+pad2V726(parts[2])+'（'+w+'）'+(suffix?.value.trim()?(' '+suffix.value.trim()):'');
};
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let text=String(label||'').trim();
  let m=text.match(/^(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+pad2V726(m[1])+'-'+pad2V726(m[2]);
    suffix.value=m[3]||'';
  }
};

// ===== safeUrl 空值與日期選擇器事件修正 =====
function rebindDatePickerEventsV727(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||picker.dataset.v727==='true')return;
  let pickerValue=picker.value,suffixValue=suffix?.value||'';
  let nextPicker=picker.cloneNode(true);
  nextPicker.value=pickerValue;
  nextPicker.dataset.v727='true';
  picker.replaceWith(nextPicker);
  let nextSuffix=suffix;
  if(suffix){
    nextSuffix=suffix.cloneNode(true);
    nextSuffix.value=suffixValue;
    nextSuffix.dataset.v727='true';
    suffix.replaceWith(nextSuffix);
  }
  let update=()=>syncDateLabelV724();
  nextPicker.addEventListener('change',update);
  nextPicker.addEventListener('input',update);
  nextSuffix?.addEventListener('input',update);
}
const installDatePickerV727Base=installDatePickerV725;
installDatePickerV725=function(){installDatePickerV727Base();rebindDatePickerEventsV727()};
const renderDatePanelV727Base=renderDatePanel;
renderDatePanel=function(){renderDatePanelV727Base();rebindDatePickerEventsV727()};
// 相容清理：移除 對 editDate / saveDate 的鏈式包裝。

// ===== 日期儲存強制以 date picker 為準，並改用半形括弧 =====
function formatDateLabelV728(value,suffix=''){
  let parts=String(value||'').split('-');
  if(parts.length!==3)return '';
  let y=Number(parts[0]),m=Number(parts[1]),d=Number(parts[2]);
  if(!Number.isFinite(y)||!Number.isFinite(m)||!Number.isFinite(d))return '';
  let date=new Date(y,m-1,d);
  if(Number.isNaN(date.getTime())||date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return '';
  let w='日一二三四五六'[date.getDay()];
  return pad2V726(m)+'/'+pad2V726(d)+'('+w+')'+(String(suffix||'').trim()?(' '+String(suffix).trim()):'');
}
function syncDateLabelV728(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value||!newDate)return '';
  let label=formatDateLabelV728(picker.value,suffix?.value||'');
  if(label)newDate.value=label;
  return label;
}
syncDateLabelV724=syncDateLabelV728;
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let text=String(label||'').trim();
  let m=text.match(/^(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+pad2V726(m[1])+'-'+pad2V726(m[2]);
    suffix.value=m[3]||'';
    syncDateLabelV728();
  }
};
// 相容清理：保留 格式化 helper，但移除 saveDate 鏈式包裝。

// ===== 統一日期格式正規化，支援 - / 全半形括弧與舊資料 =====
function normalizeDatePartsV729(value){
  let raw=String(value||'').trim();
  if(!raw)return null;
  raw=raw.replace(/[年月]/g,'/').replace(/[日號]/g,'').replace(/[．.]/g,'/').replace(/-/g,'/').replace(/\s+/g,' ');
  let matches=[...raw.matchAll(/\d{1,4}/g)].map(x=>x[0]);
  if(matches.length>=3){
    let first=Number(matches[0]),second=Number(matches[1]),third=Number(matches[2]);
    if(matches[0].length===4||first>31)return {year:first,month:second,day:third};
    return {year:new Date().getFullYear(),month:first,day:second};
  }
  if(matches.length>=2)return {year:new Date().getFullYear(),month:Number(matches[0]),day:Number(matches[1])};
  return null;
}
function normalizeDateLabelV729(value,suffix=''){
  let parts=normalizeDatePartsV729(value);
  if(!parts)return '';
  let {year,month,day}=parts;
  if(!Number.isFinite(year)||!Number.isFinite(month)||!Number.isFinite(day))return '';
  let date=new Date(year,month-1,day);
  if(Number.isNaN(date.getTime())||date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day)return '';
  let w='日一二三四五六'[date.getDay()];
  return pad2V726(month)+'/'+pad2V726(day)+'('+w+')'+(String(suffix||'').trim()?(' '+String(suffix).trim()):'');
}
function syncDateLabelV729(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  let source=picker?.value||newDate?.value||'';
  let label=normalizeDateLabelV729(source,suffix?.value||'');
  if(label&&newDate)newDate.value=label;
  return label;
}
syncDateLabelV724=syncDateLabelV729;
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let parts=normalizeDatePartsV729(label);
  if(parts){
    picker.value=parts.year+'-'+pad2V726(parts.month)+'-'+pad2V726(parts.day);
    let normalizedNoSuffix=normalizeDateLabelV729(label,'');
    let raw=String(label||'').trim();
    suffix.value=raw.replace(normalizedNoSuffix,'').replace(normalizedNoSuffix.replace('(','（').replace(')','）'),'').trim();
    syncDateLabelV729();
  }
};
// 相容清理：保留 正規化 helper，但移除 saveDate 鏈式包裝。

// 相容清理：曾直接重寫 saveDate，但仍會寫 summary-only log；
// 目前改由最後接管層直接儲存並寫 before / after / changes。

// ===== 舊日期儲存入口保留相容名稱，但實際一律導向 直接儲存流程 =====
function bindDateSaveButtonV731(){
  if(typeof bindDateSaveButtonV765==='function')return bindDateSaveButtonV765();
  if(!dateSaveBtn)return;
  dateSaveBtn.onclick=event=>{
    event?.preventDefault?.();
    return saveDateV760Direct();
  };
  dateSaveBtn.setAttribute('data-date-save-version','v7.75-direct-v731');
}
async function saveDateV731Direct(){
  return saveDateV760Direct();
}
window.saveDateV731Direct=saveDateV731Direct;
const renderDatePanelV731Base=renderDatePanel;
renderDatePanel=function(){renderDatePanelV731Base();bindDateSaveButtonV731()};
const renderAdminV731Base=renderAdmin;
renderAdmin=function(){renderAdminV731Base();bindDateSaveButtonV731()};

// ===== AuditLog 與主要 CRUD 詳細差異紀錄 =====

function clonePlainV760(value){
  if(value===undefined)return undefined;
  if(value===null)return null;
  if(value?.toDate)return value.toDate().toISOString();
  if(value?.seconds!==undefined&&value?.nanoseconds!==undefined)return new Date(value.seconds*1000).toISOString();
  if(Array.isArray(value))return value.map(clonePlainV760);
  if(typeof value==='object'){
    if(value.constructor&&value.constructor.name&&value.constructor.name!=='Object')return String(value);
    let out={};
    Object.keys(value).sort().forEach(k=>{
      if(typeof value[k]==='function')return;
      let v=clonePlainV760(value[k]);
      if(v!==undefined)out[k]=v;
    });
    return out;
  }
  return value;
}
function auditSanitizeV760(value){
  let cleaned=clonePlainV760(value||{});
  if(cleaned&&typeof cleaned==='object'){
    delete cleaned.createdAt;delete cleaned.updatedAt;delete cleaned.openAtTimestamp;delete cleaned.deadlineAtTimestamp;
  }
  return cleaned||{};
}
async function auditReadDocV760(collection,id){
  if(!id)return null;
  try{let snap=await doc(collection,id).get();return snap.exists?{id:snap.id,...snap.data()}:null}catch(e){console.warn('[AUDIT] read failed',collection,id,e);return null}
}
let auditMuteDepthV760=0;
async function runAuditMutedV760(fn){
  auditMuteDepthV760++;
  try{return await fn()}finally{auditMuteDepthV760=Math.max(0,auditMuteDepthV760-1)}
}
const auditFieldLabelsV760={
  title:'活動名稱',description:'說明文字',descriptionHtml:'說明格式',frontInstructions:'填寫說明',deadline:'截止時間',openMode:'開放方式',openAt:'指定開放時間',status:'活動狀態',allowEdit:'允許修改',theme:'前台主題',targetDepartments:'參與部門',budgetPerPerson:'每人預算',
  label:'日期',sort:'排序',active:'狀態',rawDateSource:'日期來源',
  name:'名稱',address:'地址',googleMap:'Google 地圖',mapUrl:'Google 地圖',infoUrl:'店家資訊網址',descriptionRest:'類型',description:'類型',pricingMode:'計價方式',price:'價格',tableSeats:'每桌人數',minTables:'最低桌數',serviceRate:'服務費率',fixedFee:'固定費用',internalNote:'內部作業備註',
  department:'部門',departmentName:'部門',employeeNo:'員工編號',empNo:'員工編號',googleEmail:'Google 帳號',email:'Google 帳號',canFill:'填寫資格',budgetEligible:'預算資格',
  role:'權限',enabled:'狀態',finalDateId:'最終日期',finalRestaurantId:'最終餐廳',locked:'前台顯示',showOnHomeAnnouncement:'登入首頁公告',note:'備註'
};
function auditValueV760(key,value){
  if(value===undefined)return '未設定';
  if(value===null||value==='')return '空白';
  if(Array.isArray(value))return value.length?value.join('、'):'空白';
  if(key==='theme')return FRONT_THEMES[value]||value;
  if(key==='pricingMode')return typeof pricingModeLabelV712==='function'?pricingModeLabelV712(value):value;
  if(['price','fixedFee','budgetPerPerson'].includes(key)){let n=moneyValue(value);return n===null?'空白':moneyText(n)+' 元'}
  if(key==='serviceRate')return Number(value||0)+'%';
  if(key==='allowEdit'||key==='active'||key==='enabled'||key==='locked'||key==='canFill'||key==='budgetEligible')return value?'是':'否';
  if(key==='finalDateId')return D.dates.find(x=>x.id===value)?.label||value||'空白';
  if(key==='finalRestaurantId')return D.restaurants.find(x=>x.id===value)?.name||value||'空白';
  return String(value);
}
function auditChangesV760(before,after,fields){
  let b=auditSanitizeV760(before),a=auditSanitizeV760(after),keys=fields&&fields.length?fields:[...new Set([...Object.keys(b||{}),...Object.keys(a||{})])];
  return keys.filter(k=>JSON.stringify(clonePlainV760(b?.[k]))!==JSON.stringify(clonePlainV760(a?.[k]))).map(k=>({field:k,label:auditFieldLabelsV760[k]||k,before:auditValueV760(k,b?.[k]),after:auditValueV760(k,a?.[k])}));
}
function auditSummaryV760(action,targetType,targetLabel,changes){
  let name=targetLabel||targetType||'資料';
  if(action==='新增')return '新增'+targetType+'「'+name+'」';
  if(action==='刪除')return '刪除'+targetType+'「'+name+'」';
  if(changes?.length)return '修改'+targetType+'「'+name+'」：'+changes.slice(0,4).map(x=>x.label).join('、')+(changes.length>4?' 等':'');
  return action+targetType+'「'+name+'」';
}
async function writeAuditDetailV760({action,targetType,targetId,targetLabel,before,after,fields,surveyId,summary}){
  if(!currentUser||!db)return;
  let cleanBefore=auditSanitizeV760(before),cleanAfter=auditSanitizeV760(after),changes=auditChangesV760(cleanBefore,cleanAfter,fields);
  let payload={
    surveyId:surveyId||activeSurveyId||cleanAfter.surveyId||cleanBefore.surveyId||'',
    action,targetType,targetId:targetId||cleanAfter.id||cleanBefore.id||'',
    summary:summary||auditSummaryV760(action,targetType,targetLabel||cleanAfter.title||cleanAfter.name||cleanAfter.label||cleanBefore.title||cleanBefore.name||cleanBefore.label||targetId,changes),
    before:cleanBefore,after:cleanAfter,changes,
    beforeSummary:changes.map(x=>x.label+'：'+x.before).join('；'),
    afterSummary:changes.map(x=>x.label+'：'+x.after).join('；'),
    detailVersion:'v7.85',
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
writeAuditV711=async function(action,targetType,targetId,summary,surveyId=activeSurveyId){
  if(!currentUser||!db)return;
  if(auditMuteDepthV760>0)return;
  try{
    await col('surveyAuditLogs').add({
      surveyId:surveyId||'',action,targetType,targetId:targetId||'',summary:summary||'',
      before:{},after:{summary:summary||'',action:action||'',targetType:targetType||'',targetId:targetId||'',surveyId:surveyId||''},changes:[{field:'summary',label:'摘要',before:'',after:summary||''}],beforeSummary:'',afterSummary:summary||'',detailVersion:'v7.85-compat',
      actorUid:currentUser.uid,actorEmail:String(currentUser.email||'').toLowerCase(),actorName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),actorRole:actorRoleV711?.()||'',
      userName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),userEmail:String(currentUser.email||'').toLowerCase(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){console.warn('操作紀錄寫入失敗',e)}
};
window.writeAuditV711=writeAuditV711;
function auditDiffHtmlV760(log){
  let hasDetail=Object.prototype.hasOwnProperty.call(log,'before')&&Object.prototype.hasOwnProperty.call(log,'after')&&Object.prototype.hasOwnProperty.call(log,'changes');
  if(!hasDetail)return '<span class="auditLegacyHintV741">此筆是舊格式紀錄，資料庫內沒有修改前/修改後欄位。</span>';
  let changes=Array.isArray(log.changes)?log.changes:[];
  if(!changes.length)return '<span class="muted">本次沒有可比對的欄位差異，或此筆為新增／刪除基本紀錄。</span>';
  return '<details class="auditDiffV741"><summary>查看修改前／修改後（'+changes.length+' 項）</summary><table class="auditDiffTableV738"><thead><tr><th>欄位</th><th>修改前</th><th>修改後</th></tr></thead><tbody>'+changes.map(c=>'<tr><td>'+esc(c.label||c.field||'')+'</td><td>'+esc(c.before||'')+'</td><td>'+esc(c.after||'')+'</td></tr>').join('')+'</tbody></table></details>';
}
renderLogsV711=function(){
  let box=document.getElementById('logTable');if(!box)return;
  let type=document.getElementById('logTypeFilter')?.value||'audit';
  if(type==='login'&&!isSystemAdmin){document.getElementById('logTypeFilter').value='audit';type='audit'}
  let rows=filteredLogsV711();
  if(type==='login'){
    box.innerHTML=table(['時間','帳號／姓名','結果','身分','說明'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.displayName||'')+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>'));
    return;
  }
  box.innerHTML=table(['時間','操作者','活動','功能／動作','內容'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.actorName||x.userName||'')+'</b><br><small>'+esc(x.actorEmail||x.userEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'<br>'+auditDiffHtmlV760(x)+'</td></tr>'));
};

function setThemeEditorValueV760(theme){
  ensureThemeControl?.();
  let category=themeCategorySelect?.(),select=themeSelect?.();
  if(!category||!select)return;
  let normalized=normalizeTheme(theme||'classic'),categoryKey=categoryOfTheme(normalized);
  category.value=categoryKey;
  select.innerHTML=themeOptionsForCategory(categoryKey);
  select.value=normalized;
  if(select.value!==normalized)select.value=(THEME_CATEGORIES[categoryKey]||THEME_CATEGORIES.basic).themes[0]||'classic';
  renderThemePreview?.();
}
function surveyThemeValueV760(survey){
  return normalizeTheme(survey?.theme||survey?.frontTheme||survey?.themeStyle||survey?.frontThemeStyle||'classic');
}
const renderSurveyPanelBaseV760=renderSurveyPanel;
renderSurveyPanel=function(){
  renderSurveyPanelBaseV760();
  if(surveyFormMode==='edit'&&editingSurveyId){
    let survey=D.surveys.find(x=>x.id===editingSurveyId);
    setThemeEditorValueV760(surveyThemeValueV760(survey));
  }else if(surveyFormMode==='new'){
    setThemeEditorValueV760('classic');
  }
  normalizeSurveyActionCellsV760();
};
const editSurveyBaseV760=editSurvey;
editSurvey=function(id){
  editSurveyBaseV760(id);
  let apply=()=>{let survey=D.surveys.find(x=>x.id===id);setThemeEditorValueV760(surveyThemeValueV760(survey))};
  apply();setTimeout(apply,0);setTimeout(apply,120);
};
function normalizeSurveyActionCellsV760(){
  document.querySelectorAll('#surveyTable .operationCell').forEach(cell=>{
    let buttons=[...cell.querySelectorAll('button')];
    if(!buttons.length)return;
    buttons.forEach(btn=>{if(btn.textContent.trim().startsWith('刪除'))btn.textContent='刪除'});
    let group=cell.querySelector('.actionButtonGroupV750');
    if(!group){group=document.createElement('div');group.className='actionButtonGroupV750';buttons[0].before(group);}
    buttons.forEach(btn=>group.appendChild(btn));
  });
}

function pad2V760(n){return String(n).padStart(2,'0')}
function formatDateLabelV760(dateValue,suffix=''){
  let parts=String(dateValue||'').split('-').map(Number);
  if(parts.length!==3||parts.some(x=>!Number.isFinite(x)))return '';
  let d=new Date(parts[0],parts[1]-1,parts[2]);
  if(Number.isNaN(d.getTime())||d.getFullYear()!==parts[0]||d.getMonth()!==parts[1]-1||d.getDate()!==parts[2])return '';
  return pad2V760(parts[1])+'/'+pad2V760(parts[2])+'('+'日一二三四五六'[d.getDay()]+')'+(String(suffix||'').trim()?' '+String(suffix).trim():'');
}
function ensureDateEditorLayoutV760(){
  if(!dateP||!newDate||!newDateSort||!dateSaveBtn)return;
  let card=dateP.querySelector('.card');
  if(!card)return;
  const previousPickerValue=document.getElementById('newDatePickerV724')?.value||'';
  const previousSuffixValue=document.getElementById('newDateSuffixV724')?.value||'';
  let oldPicker=document.getElementById('newDatePickerV724');if(oldPicker)oldPicker.closest('.dateAutoBox')?.remove();
  let oldSuffix=document.getElementById('newDateSuffixV724');if(oldSuffix)oldSuffix.closest('.dateAutoBox')?.remove();
  let row=card.querySelector('.dateEntryRowV736[data-v760="true"]');
  if(!row){
    row=document.createElement('div');
    row.className='dateEntryRowV736';
    row.dataset.v760='true';
    let tableNode=dateTable||card.lastElementChild;
    card.insertBefore(row,tableNode);
  }
  let sourceField=newDate.closest('div');if(sourceField){sourceField.classList.add('dateGeneratedFieldV736');card.insertBefore(sourceField,row)}
  let pickerBox=document.createElement('div');pickerBox.className='dateAutoBox';pickerBox.innerHTML='<label for="newDatePickerV724">日期選擇器</label><input id="newDatePickerV724" type="date">';
  let suffixBox=document.createElement('div');suffixBox.className='dateAutoBox';suffixBox.innerHTML='<label for="newDateSuffixV724">補充文字（選填）</label><input id="newDateSuffixV724" placeholder="例如：晚上、午餐">';
  let sortField=newDateSort.closest('div');let actionBox=dateSaveBtn.closest('div');
  if(sortField)sortField.classList.add('dateSortFieldV978');
  row.appendChild(pickerBox);row.appendChild(suffixBox);
  if(sortField)row.appendChild(sortField);
  if(actionBox){actionBox.classList.add('compactActions');row.appendChild(actionBox)}
  let hint=card.querySelector('.dateAutoHintV736');
  if(!hint){hint=document.createElement('small');hint.className='muted dateAutoHintV736'}
  row.insertAdjacentElement('afterend',hint);
  hint.textContent='系統會自動產生 06/28(日)；若需加註「晚上、午餐」等文字，請填寫補充文字。';
  let restoredPicker=document.getElementById('newDatePickerV724'),restoredSuffix=document.getElementById('newDateSuffixV724');
  if(restoredPicker&&previousPickerValue&&!restoredPicker.value)restoredPicker.value=previousPickerValue;
  if(restoredSuffix&&previousSuffixValue&&!restoredSuffix.value)restoredSuffix.value=previousSuffixValue;
  let sync=()=>{let label=formatDateLabelV760(document.getElementById('newDatePickerV724')?.value||'',document.getElementById('newDateSuffixV724')?.value||'');if(label)newDate.value=label};
  document.getElementById('newDatePickerV724')?.addEventListener('input',sync);
  document.getElementById('newDatePickerV724')?.addEventListener('change',sync);
  document.getElementById('newDateSuffixV724')?.addEventListener('input',sync);
  newDate.readOnly=true;newDate.tabIndex=-1;
}
function bindDateSaveButtonV760(){
  if(!dateSaveBtn)return;
  dateSaveBtn.onclick=event=>{event?.preventDefault?.();return saveDateV760Direct()};
  dateSaveBtn.setAttribute('data-date-save-version','v7.75-direct-v760');
}
async function saveDateV760Direct(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  const keepPickerValue=document.getElementById('newDatePickerV724')?.value||'';
  const keepSuffixValue=document.getElementById('newDateSuffixV724')?.value||'';
  ensureDateEditorLayoutV760();
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(picker&&keepPickerValue&&!picker.value)picker.value=keepPickerValue;
  if(suffix&&keepSuffixValue&&!suffix.value)suffix.value=keepSuffixValue;
  let label=formatDateLabelV760(picker?.value||'',suffix?.value||'')||normalizeDateLabelV729?.(newDate?.value||'',suffix?.value||'')||'';
  if(!label){picker?.focus();return alert('請先選擇日期')}
  let isEdit=!!editingDateId,targetId=editingDateId,before=isEdit?await auditReadDocV760('surveyDates',targetId):null;
  let data={surveyId:activeSurveyId,label,rawDateSource:picker?.value||'',sort:Number(newDateSort?.value||0),active:true,dateSaveVersion:'v7.85',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  dateSaveBtn.disabled=true;dateSaveBtn.textContent='儲存中…';
  try{
    if(isEdit)await doc('surveyDates',targetId).set(data,{merge:true});
    else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('surveyDates').add(data);targetId=ref.id}
    let after=await auditReadDocV760('surveyDates',targetId);
    await writeAuditDetailV760({action:isEdit?'修改':'新增',targetType:'日期',targetId,targetLabel:after?.label||label,before,after,fields:['label','rawDateSource','sort','active'],surveyId:activeSurveyId});
    cancelDateEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'日期變更已儲存':'日期已新增');
  }catch(e){console.error('save date v7.75 failed',e);alert('日期儲存失敗，請檢查網路後再試一次')}
  finally{dateSaveBtn.disabled=false;dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期';bindDateSaveButtonV760()}
}
// 相容清理：的日期入口不再直接指定到全域函式；
// 僅保留 helper 與 renderDatePanel，由最後接管層設定實際 save/edit/cancel。
renderDatePanel=function(){
  if(dateTable)dateTable.innerHTML=table(['日期','排序','操作'],D.dates.map(d=>`<tr><td>${esc(d.label)}</td><td>${d.sort??''}</td><td class="operationCell"><button class="btn" onclick="editDate('${d.id}')">編輯</button> <button class="btn red" onclick="delDoc('surveyDates','${d.id}')">刪除</button></td></tr>`));
  ensureDateEditorLayoutV760();
  bindDateSaveButtonV760();
};
installDatePickerV724=function(){};
installDatePickerV725=function(){};
rebindDatePickerEventsV727=function(){};

async function saveSurvey(){
  if(surveyFormMode==='view')return;
  let title=svTitle.value.trim();if(!title){svTitle.focus();return alert('請輸入活動標題')}
  let mode=document.getElementById('svOpenMode')?.value||'immediate',openDate=document.getElementById('svOpenDate')?.value||'',openTime=document.getElementById('svOpenTime')?.value||'08:00';
  let openAt=mode==='scheduled'&&openDate?openDate+'T'+openTime:'',deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';
  if(mode==='scheduled'&&!openDate)return alert('請設定問卷開放日期');
  if(openAt&&deadlineValue&&new Date(openAt)>=new Date(deadlineValue))return alert('開放時間必須早於截止時間');
  let isNew=surveyFormMode==='new',id=isNew?('survey_'+Date.now()):editingSurveyId,before=isNew?null:await auditReadDocV760('surveys',id);
  let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value),descriptionData=getRichDescriptionData();
  let currentSurvey=isNew?null:D.surveys.find(x=>x.id===id);
  let budgetInput=document.getElementById('budgetPerPersonMirrorV724')||budgetPerPerson,budgetRaw=(budgetInput?.value||'').trim(),budgetValue=budgetRaw===''?null:moneyValue(budgetRaw);
  if(budgetRaw!==''&&budgetValue===null)return alert('每人預算請輸入 0 以上數字');
  let data={title,...descriptionData,frontInstructions:svInstructions.value.trim(),deadline:deadlineValue,openMode:mode,openAt,status:svStatus.value,allowEdit:svAllowEdit.value==='true',theme:normalizeTheme(themeSelect()?.value||surveyThemeValueV760(currentSurvey)),isAnonymous:false,targetDepartments:target,budgetPerPerson:budgetValue,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  data.openAtTimestamp=openAt?firebase.firestore.Timestamp.fromDate(new Date(openAt)):firebase.firestore.FieldValue.delete();
  data.deadlineAtTimestamp=deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete();
  if(isNew)data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
  surveySaveBtn.disabled=true;surveySaveBtn.textContent='儲存中…';
  try{
    await doc('surveys',id).set(data,{merge:true});
    let after=await auditReadDocV760('surveys',id);
    await writeAuditDetailV760({action:isNew?'新增':'修改',targetType:'活動',targetId:id,targetLabel:after?.title||title,before,after,fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments','budgetPerPerson'],surveyId:id});
    surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;await loadAll();renderFront();renderAdmin();toast(isNew?'活動已建立，可從列表設為目前活動':'活動變更已儲存');
  }catch(e){console.error('save survey failed',e);alert('活動儲存失敗，請檢查網路後再試一次')}
  finally{surveySaveBtn.disabled=false;surveySaveBtn.textContent=surveyFormMode==='edit'?'儲存變更':'建立活動'}
}

async function saveRestaurant(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  installRestaurantInfoUrlV724?.();installRestaurantNoteV719?.();installRestaurantPricingV712?.();
  let name=newRest.value.trim();if(!name){newRest.focus();return alert('請輸入餐廳名稱')}
  let infoUrl=document.getElementById('newInfoUrl')?.value.trim()||'';if(infoUrl&&!safeUrl(infoUrl))return alert('店家資訊網址格式不正確，請輸入 http 或 https 網址');
  let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',price=moneyValue(newPrice.value),tableSeats=Math.floor(numericV712(document.getElementById('restaurantTableSeats')?.value,10)),minTables=Math.floor(numericV712(document.getElementById('restaurantMinTables')?.value,0)),serviceRate=numericV712(document.getElementById('restaurantServiceRate')?.value,0),fixedFee=numericV712(document.getElementById('restaurantFixedFee')?.value,0);
  if(newPrice.value.trim()!==''&&price===null)return alert('價格請輸入有效數字');if(mode==='perTable'&&tableSeats<1)return alert('每桌人數至少為 1 人');if(serviceRate>100)return alert('服務費率不可超過 100%');
  let isEdit=!!editingRestaurantId,targetId=editingRestaurantId,before=isEdit?await auditReadDocV760('restaurants',targetId):null;
  let data={surveyId:activeSurveyId,name,address:newAddr.value.trim(),googleMap:newMap.value.trim(),infoUrl,description:newCuisine.value.trim(),descriptionRest:newCuisine.value.trim(),pricingMode:mode,price,tableSeats:mode==='perTable'?tableSeats:null,minTables:mode==='perTable'?minTables:0,serviceRate,fixedFee,internalNote:document.getElementById('newRestOpsNote')?.value.trim()||'',sort:Number(newRestSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  restSaveBtn.disabled=true;restSaveBtn.textContent='儲存中…';
  try{
    if(isEdit){
      await doc('restaurants',targetId).set(data,{merge:true});
      await doc('restaurants',targetId).set({storeInfoUrl:firebase.firestore.FieldValue.delete(),websiteUrl:firebase.firestore.FieldValue.delete(),officialUrl:firebase.firestore.FieldValue.delete()},{merge:true});
    }
    else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('restaurants').add(data);targetId=ref.id}
    let after=await auditReadDocV760('restaurants',targetId);
    await writeAuditDetailV760({action:isEdit?'修改':'新增',targetType:'餐廳',targetId,targetLabel:after?.name||name,before,after,fields:['name','address','googleMap','infoUrl','description','descriptionRest','pricingMode','price','tableSeats','minTables','serviceRate','fixedFee','internalNote','sort','active'],surveyId:activeSurveyId});
    cancelRestaurantEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'餐廳變更已儲存':'餐廳已新增');
  }catch(e){console.error('save restaurant failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}
  finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}
}

async function saveBudgetSetting(){
  if(!activeSurveyId)return alert('請先選擇活動');
  let before=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null,value=budgetPerPerson?.value===''?null:Number(budgetPerPerson?.value||0);
  if(value!==null&&(!Number.isFinite(value)||value<0))return alert('每人預算請輸入 0 以上數字');
  await doc('surveys',activeSurveyId).set({budgetPerPerson:value,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  await loadAll();let after=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null;
  await writeAuditDetailV760({action:'修改',targetType:'預算',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['budgetPerPerson'],surveyId:activeSurveyId});
  renderAdmin();toast('每人預算已更新');
}
async function saveFinal(){
  if(!activeSurveyId)return alert('請先選擇活動');
  if(finalLock.value==='true'&&(!finalDate.value||!finalRest.value))return alert('要顯示於前台時，請先選擇最終日期與餐廳');
  let before=await auditReadDocV760('finalDecision',activeSurveyId);
  let data={surveyId:activeSurveyId,finalDateId:finalDate.value,finalRestaurantId:finalRest.value,note:finalNote.value.trim(),locked:finalLock.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  await doc('finalDecision',activeSurveyId).set(data,{merge:true});
  let after=await auditReadDocV760('finalDecision',activeSurveyId);
  await writeAuditDetailV760({action:before?'修改':'新增',targetType:'最終決議',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['finalDateId','finalRestaurantId','locked','note'],surveyId:activeSurveyId});
  await loadSurveyData();renderFront();renderAdmin();toast('最終決議與出席名單已更新');
}
async function delDoc(collection,id){
  let typeMap={surveyDates:'日期',restaurants:'餐廳',members:'人員',surveys:'活動'};
  if(collection==='surveyDates'&&D.final?.finalDateId===id)return alert('此日期已被選為最終日期，請先到「最終決議」更換或清除最終日期後再刪除。');
  if(collection==='restaurants'&&D.final?.finalRestaurantId===id)return alert('此餐廳已被選為最終餐廳，請先到「最終決議」更換或清除後再刪除。');
  let before=await auditReadDocV760(collection,id);
  if(!confirm('確定刪除'+(typeMap[collection]?'這筆'+typeMap[collection]:'這筆資料')+'？此操作無法復原。'))return;
  await doc(collection,id).delete();
  if(collection==='members'){let account=await doc('memberAccounts',id).get();if(account.exists)await doc('memberAccounts',id).delete();let settings=await col('budgetEligibility').where('memberId','==',id).get();await Promise.all(settings.docs.map(item=>item.ref.delete()))}
  await writeAuditDetailV760({action:'刪除',targetType:typeMap[collection]||collection,targetId:id,targetLabel:before?.label||before?.name||before?.title||id,before,after:null,fields:Object.keys(before||{}),surveyId:collection==='surveys'?id:activeSurveyId});
  if(collection==='surveys'&&editingSurveyId===id){surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false}
  if(collection==='members'&&editingMemberId===id){memberFormMode='view';editingMemberId=null}
  await loadAll();renderFront();renderAdmin();toast('已刪除');
}

async function auditReadMemberV760(id){
  let member=await auditReadDocV760('members',id);
  if(!member)return null;
  let account=await auditReadDocV760('memberAccounts',id);
  return {...member,googleEmail:account?.email||member.googleEmail||'',companyEmail:account?.companyEmail||member.companyEmail||''};
}
async function auditReadBudgetSettingV760(memberId){
  if(!activeSurveyId||!memberId)return null;
  return await auditReadDocV760('budgetEligibility',activeSurveyId+'__'+memberId);
}
function responseAuditFieldsV760(){
  return ['departmentName','memberName','employeeNo','cannotAttend','dateIds','restaurantRanks','note','adminEditedBy'];
}
const saveMemberBaseV760=saveMember;
saveMember=async function(){
  if(memberFormMode==='view')return;
  let wasNew=memberFormMode==='new',targetId=editingMemberId,name=newMem?.value?.trim?.()||'',beforeIds=new Set(D.members.map(m=>m.id));
  let before=targetId?await auditReadMemberV760(targetId):null;
  await runAuditMutedV760(()=>saveMemberBaseV760());
  await loadAll();
  let afterMember=targetId?D.members.find(m=>m.id===targetId):D.members.find(m=>!beforeIds.has(m.id))||D.members.find(m=>m.name===name);
  if(afterMember){
    let after=await auditReadMemberV760(afterMember.id);
    await writeAuditDetailV760({action:wasNew?'新增':'修改',targetType:'人員',targetId:afterMember.id,targetLabel:memberDisplayName(afterMember)||name,before,after,fields:['department','departmentName','name','employeeNo','empNo','googleEmail','companyEmail','active'],surveyId:''});
  }
};
const toggleMemberBaseV760=toggleMember;
toggleMember=async function(id,active){
  let before=await auditReadMemberV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberBaseV760(id,active));
  let after=await auditReadMemberV760(id);
  if(before||after)await writeAuditDetailV760({action:active?'啟用':'停用',targetType:'人員',targetId:id,targetLabel:memberDisplayName(after||m)||id,before,after,fields:['active'],surveyId:''});
};
const toggleMemberFillBaseV760=toggleMemberFill;
toggleMemberFill=async function(id,canFill,btn){
  let before=await auditReadBudgetSettingV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberFillBaseV760(id,canFill,btn));
  let after=await auditReadBudgetSettingV760(id);
  await writeAuditDetailV760({action:'修改',targetType:'填寫資格',targetId:activeSurveyId+'__'+id,targetLabel:memberDisplayName(m)||id,before,after,fields:['canFill','budgetEligible'],surveyId:activeSurveyId});
};
const toggleMemberBudgetBaseV760=toggleMemberBudget;
toggleMemberBudget=async function(id,eligible,btn){
  let before=await auditReadBudgetSettingV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberBudgetBaseV760(id,eligible,btn));
  let after=await auditReadBudgetSettingV760(id);
  await writeAuditDetailV760({action:'修改',targetType:'預算資格',targetId:activeSurveyId+'__'+id,targetLabel:memberDisplayName(m)||id,before,after,fields:['budgetEligible'],surveyId:activeSurveyId});
};
const saveSurveyManagerBaseV760=saveSurveyManager;
saveSurveyManager=async function(){
  let email=normalizeEmail(managerEmail?.value||''),targetId=activeSurveyId&&email?managerDocId(activeSurveyId,email):'',role=managerRole?.value||'manager';
  let before=targetId?await auditReadDocV760('surveyManagers',targetId):null;
  await runAuditMutedV760(()=>saveSurveyManagerBaseV760());
  let after=targetId?await auditReadDocV760('surveyManagers',targetId):null;
  if(targetId)await writeAuditDetailV760({action:before?'修改':'指派',targetType:'活動權限',targetId,targetLabel:email,before,after,fields:['email','role','enabled','memberId','displayName'],surveyId:activeSurveyId,summary:(before?'更新':'指派')+' '+email+' 為 '+(role==='viewer'?'結果檢視者':'活動管理者')});
};
const removeSurveyManagerBaseV760=removeSurveyManager;
removeSurveyManager=async function(id){
  let before=await auditReadDocV760('surveyManagers',id);
  await runAuditMutedV760(()=>removeSurveyManagerBaseV760(id));
  if(before)await writeAuditDetailV760({action:'移除',targetType:'活動權限',targetId:id,targetLabel:before.email||id,before,after:null,fields:['email','role','enabled','memberId','displayName'],surveyId:before.surveyId||activeSurveyId});
};
const saveResponseEditBaseV760=saveResponseEdit;
saveResponseEdit=async function(){
  let id=editingResponseId,before=id?await auditReadDocV760('responses',id):null,label=(before?.departmentName||'')+' '+(before?.memberName||'');
  await runAuditMutedV760(()=>saveResponseEditBaseV760());
  let after=id?await auditReadDocV760('responses',id):null;
  if(id&&after)await writeAuditDetailV760({action:'修改',targetType:'問卷',targetId:id,targetLabel:label.trim()||id,before,after,fields:responseAuditFieldsV760(),surveyId:activeSurveyId});
};
const deleteResponseBaseV760=deleteResponse;
deleteResponse=async function(id){
  let before=await auditReadDocV760('responses',id),label=(before?.departmentName||'')+' '+(before?.memberName||'');
  await runAuditMutedV760(()=>deleteResponseBaseV760(id));
  let after=await auditReadDocV760('responses',id);
  if(before&&!after)await writeAuditDetailV760({action:'刪除',targetType:'問卷',targetId:id,targetLabel:label.trim()||id,before,after:null,fields:responseAuditFieldsV760(),surveyId:before.surveyId||activeSurveyId});
};
const importMembersBaseV760=importMembers;
importMembers=async function(file){
  return importMembersBaseV760(file);
};

const renderAdminBaseV760=renderAdmin;
renderAdmin=function(){renderAdminBaseV760();ensureDateEditorLayoutV760();bindDateSaveButtonV760();normalizeSurveyActionCellsV760();if(surveyFormMode==='edit'&&editingSurveyId){let s=D.surveys.find(x=>x.id===editingSurveyId);setThemeEditorValueV760(surveyThemeValueV760(s))}};

// ===== 主要 CRUD 最後接管層，避免 function hoisting 與舊版 wrapper 搶走實際執行流程 =====
// 原因：前面歷史版本有多段 `async function saveSurvey(){...}` 與 `saveSurvey=...` 混用。
// function 宣告會被瀏覽器提升，導致看似寫在最後的新版流程不一定真的最後生效。
// 本段刻意使用明確 assignment，並放在檔案最末端，確保主要 CRUD 實際走新版 Audit Log。
(function installV764FinalTakeover(){
  if(typeof writeAuditDetailV760==='function'){
    const writeAuditDetailBaseV764=writeAuditDetailV760;
    writeAuditDetailV760=async function(payload){
      await writeAuditDetailBaseV764(payload);
    };
  }

  writeAuditV711=async function(action,targetType,targetId,summary,surveyId=activeSurveyId){
    if(!currentUser||!db)return;
    if(typeof auditMuteDepthV760!=='undefined'&&auditMuteDepthV760>0)return;
    try{
      await col('surveyAuditLogs').add({
        surveyId:surveyId||activeSurveyId||'',
        action,targetType,targetId:targetId||'',summary:summary||'',
        before:{},
        after:{summary:summary||'',action:action||'',targetType:targetType||'',targetId:targetId||'',surveyId:surveyId||activeSurveyId||''},
        changes:[{field:'summary',label:'摘要',before:'',after:summary||''}],
        beforeSummary:'',
        afterSummary:summary||'',
        detailVersion:'v7.85-compat',
        actorUid:currentUser.uid,
        actorEmail:String(currentUser.email||'').toLowerCase(),
        actorName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
        actorRole:actorRoleV711?.()||(isSystemAdmin?'系統管理員':currentAccessRole||''),
        userName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
        userEmail:String(currentUser.email||'').toLowerCase(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
    }catch(e){console.warn('操作紀錄寫入失敗',e)}
  };
  window.writeAuditV711=writeAuditV711;

 // 相容清理：此層只保留主要 CRUD 接管；日期 save/edit/cancel 由最後日期接管層統一設定。

  renderDatePanel=function(){
    if(dateTable)dateTable.innerHTML=table(['日期','排序','操作'],D.dates.map(d=>`<tr><td>${esc(d.label)}</td><td>${d.sort??''}</td><td class="operationCell"><button class="btn" onclick="editDate('${d.id}')">編輯</button> <button class="btn red" onclick="delDoc('surveyDates','${d.id}')">刪除</button></td></tr>`));
    ensureDateEditorLayoutV760();
    bindDateSaveButtonV760();
  };

  saveSurvey=async function(){
    if(surveyFormMode==='view')return;
    let title=svTitle.value.trim();
    if(!title){svTitle.focus();return alert('請輸入活動標題')}
    let mode=document.getElementById('svOpenMode')?.value||'immediate';
    let openDate=document.getElementById('svOpenDate')?.value||'';
    let openTime=document.getElementById('svOpenTime')?.value||'08:00';
    let openAt=mode==='scheduled'&&openDate?openDate+'T'+openTime:'';
    let deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';
    if(mode==='scheduled'&&!openDate)return alert('請設定問卷開放日期');
    if(openAt&&deadlineValue&&new Date(openAt)>=new Date(deadlineValue))return alert('開放時間必須早於截止時間');
    let isNew=surveyFormMode==='new';
    let id=isNew?('survey_'+Date.now()):editingSurveyId;
    let before=isNew?null:await auditReadDocV760('surveys',id);
    let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value);
    let descriptionData=getRichDescriptionData();
    let budgetInputV784=document.getElementById('budgetPerPersonMirrorV724')||budgetPerPerson;
    let budgetRawV784=(budgetInputV784?.value||'').trim();
    let budgetValueV784=budgetRawV784===''?null:moneyValue(budgetRawV784);
    if(budgetRawV784!==''&&budgetValueV784===null)return alert('每人預算請輸入 0 以上數字');
    let currentSurvey=isNew?null:D.surveys.find(x=>x.id===id);
    let data={
      title,...descriptionData,
      frontInstructions:svInstructions.value.trim(),
      deadline:deadlineValue,openMode:mode,openAt,
      status:svStatus.value,allowEdit:svAllowEdit.value==='true',
      theme:normalizeTheme(themeSelect()?.value||surveyThemeValueV760(currentSurvey)),
      isAnonymous:false,targetDepartments:target,
      budgetPerPerson:budgetValueV784,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    data.openAtTimestamp=openAt?firebase.firestore.Timestamp.fromDate(new Date(openAt)):firebase.firestore.FieldValue.delete();
    data.deadlineAtTimestamp=deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete();
    if(isNew)data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
    surveySaveBtn.disabled=true;
    surveySaveBtn.textContent='儲存中…';
    try{
      await doc('surveys',id).set(data,{merge:true});
      let after=await auditReadDocV760('surveys',id);
      await writeAuditDetailV760({action:isNew?'新增':'修改',targetType:'活動',targetId:id,targetLabel:after?.title||title,before,after,fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments','budgetPerPerson'],surveyId:id});
      surveyFormMode='view';
      editingSurveyId=null;
      surveyFormDirty=false;
      await loadAll();
      renderFront();
      renderAdmin();
      toast(isNew?'活動已建立，可從列表設為目前活動':'活動變更已儲存');
  }catch(e){console.error('save survey v7.75 failed',e);alert('活動儲存失敗，請檢查網路後再試一次')}
    finally{surveySaveBtn.disabled=false;surveySaveBtn.textContent=surveyFormMode==='edit'?'儲存變更':'建立活動'}
  };

  saveRestaurant=async function(){
    if(!activeSurveyId)return alert('請先建立或選擇活動');
    installRestaurantInfoUrlV724?.();
    installRestaurantNoteV719?.();
    installRestaurantPricingV712?.();
    let name=newRest.value.trim();
    if(!name){newRest.focus();return alert('請輸入餐廳名稱')}
    let infoUrl=document.getElementById('newInfoUrl')?.value.trim()||'';
    if(infoUrl&&!safeUrl(infoUrl))return alert('店家資訊網址格式不正確，請輸入 http 或 https 網址');
    let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson';
    let price=moneyValue(newPrice.value);
    let tableSeats=Math.floor(numericV712(document.getElementById('restaurantTableSeats')?.value,10));
    let minTables=Math.floor(numericV712(document.getElementById('restaurantMinTables')?.value,0));
    let serviceRate=numericV712(document.getElementById('restaurantServiceRate')?.value,0);
    let fixedFee=numericV712(document.getElementById('restaurantFixedFee')?.value,0);
    if(newPrice.value.trim()!==''&&price===null)return alert('價格請輸入有效數字');
    if(mode==='perTable'&&tableSeats<1)return alert('每桌人數至少為 1 人');
    if(serviceRate>100)return alert('服務費率不可超過 100%');
    let isEdit=!!editingRestaurantId,targetId=editingRestaurantId;
    let before=isEdit?await auditReadDocV760('restaurants',targetId):null;
    let data={
      surveyId:activeSurveyId,name,
      address:newAddr.value.trim(),
      googleMap:newMap.value.trim(),
      infoUrl,
      description:newCuisine.value.trim(),
      descriptionRest:newCuisine.value.trim(),
      pricingMode:mode,price,
      tableSeats:mode==='perTable'?tableSeats:null,
      minTables:mode==='perTable'?minTables:0,
      serviceRate,fixedFee,
      internalNote:document.getElementById('newRestOpsNote')?.value.trim()||'',
      sort:Number(newRestSort.value||0),
      active:true,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    restSaveBtn.disabled=true;
    restSaveBtn.textContent='儲存中…';
    try{
      if(isEdit){
        await doc('restaurants',targetId).set(data,{merge:true});
        await doc('restaurants',targetId).set({
          storeInfoUrl:firebase.firestore.FieldValue.delete(),
          websiteUrl:firebase.firestore.FieldValue.delete(),
          officialUrl:firebase.firestore.FieldValue.delete()
        },{merge:true});
      }
      else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('restaurants').add(data);targetId=ref.id}
      let after=await auditReadDocV760('restaurants',targetId);
      await writeAuditDetailV760({action:isEdit?'修改':'新增',targetType:'餐廳',targetId,targetLabel:after?.name||name,before,after,fields:['name','address','googleMap','infoUrl','description','descriptionRest','pricingMode','price','tableSeats','minTables','serviceRate','fixedFee','internalNote','sort','active'],surveyId:activeSurveyId});
      cancelRestaurantEdit(false);
      await loadSurveyData();
      renderFront();
      renderAdmin();
      toast(isEdit?'餐廳變更已儲存':'餐廳已新增');
  }catch(e){console.error('save restaurant v7.75 failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}
    finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}
  };

  saveBudgetSetting=async function(){
    if(!activeSurveyId)return alert('請先選擇活動');
    let before=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null;
    let value=budgetPerPerson?.value===''?null:Number(budgetPerPerson?.value||0);
    if(value!==null&&(!Number.isFinite(value)||value<0))return alert('每人預算請輸入 0 以上數字');
    await doc('surveys',activeSurveyId).set({budgetPerPerson:value,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await loadAll();
    let after=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null;
    await writeAuditDetailV760({action:'修改',targetType:'預算',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['budgetPerPerson'],surveyId:activeSurveyId});
    renderAdmin();
    toast('每人預算已更新');
  };

  saveFinal=async function(){
    if(!activeSurveyId)return alert('請先選擇活動');
    if(finalLock.value==='true'&&(!finalDate.value||!finalRest.value))return alert('要顯示於前台時，請先選擇最終日期與餐廳');
    let before=await auditReadDocV760('finalDecision',activeSurveyId);
    let data={surveyId:activeSurveyId,finalDateId:finalDate.value,finalRestaurantId:finalRest.value,note:finalNote.value.trim(),locked:finalLock.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    await doc('finalDecision',activeSurveyId).set(data,{merge:true});
    let after=await auditReadDocV760('finalDecision',activeSurveyId);
    await writeAuditDetailV760({action:before?'修改':'新增',targetType:'最終決議',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['finalDateId','finalRestaurantId','locked','note'],surveyId:activeSurveyId});
    await loadSurveyData();
    renderFront();
    renderAdmin();
    toast('最終決議與出席名單已更新');
  };

  delDoc=async function(collection,id){
    let typeMap={surveyDates:'日期',restaurants:'餐廳',members:'人員',surveys:'活動'};
    if(collection==='surveyDates'&&D.final?.finalDateId===id)return alert('此日期已被選為最終日期，請先到「最終決議」更換或清除最終日期後再刪除。');
    if(collection==='restaurants'&&D.final?.finalRestaurantId===id)return alert('此餐廳已被選為最終餐廳，請先到「最終決議」更換或清除後再刪除。');
    let before=await auditReadDocV760(collection,id);
    if(!confirm('確定刪除'+(typeMap[collection]?'這筆'+typeMap[collection]:'這筆資料')+'？此操作無法復原。'))return;
    await doc(collection,id).delete();
    if(collection==='members'){
      let account=await doc('memberAccounts',id).get();
      if(account.exists)await doc('memberAccounts',id).delete();
      let settings=await col('budgetEligibility').where('memberId','==',id).get();
      await Promise.all(settings.docs.map(item=>item.ref.delete()));
    }
    await writeAuditDetailV760({action:'刪除',targetType:typeMap[collection]||collection,targetId:id,targetLabel:before?.label||before?.name||before?.title||id,before,after:null,fields:Object.keys(before||{}),surveyId:collection==='surveys'?id:activeSurveyId});
    if(collection==='surveys'&&editingSurveyId===id){surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false}
    if(collection==='members'&&editingMemberId===id){memberFormMode='view';editingMemberId=null}
    await loadAll();
    renderFront();
    renderAdmin();
    toast('已刪除');
  };

  const renderAdminBeforeV764=renderAdmin;
  renderAdmin=function(){
    renderAdminBeforeV764();
    ensureDateEditorLayoutV760();
    bindDateSaveButtonV760();
    normalizeSurveyActionCellsV760();
    if(surveyFormMode==='edit'&&editingSurveyId){
      let s=D.surveys.find(x=>x.id===editingSurveyId);
      setThemeEditorValueV760(surveyThemeValueV760(s));
    }
  };

  bindDateSaveButtonV760();
})();
