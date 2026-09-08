/* v10.50 近期聚餐安排：全員共用近期項目，歷程依辦理狀態分流。 */
(()=>{
  'use strict';
  const VERSION='10.50';
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
