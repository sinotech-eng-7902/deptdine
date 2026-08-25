/* 相容層：未填名單、日期名單與回覆管理。 */
/* ===== 回覆管理一致化與日期名單精簡 ===== */
function filterMissingRowsV953(){
  const search=(document.getElementById('missingSearchV953')?.value||'').trim().toLowerCase();
  const department=document.getElementById('missingDeptFilterV953')?.value||'';
  const rows=[...document.querySelectorAll('.missingRowV953')];
  let visible=0;
  rows.forEach(row=>{
    const show=(!search||(row.dataset.search||'').includes(search))&&(!department||row.dataset.department===department);
    row.hidden=!show;
    if(show)visible++;
  });
  const counter=document.getElementById('missingVisibleCountV953');
  if(counter)counter.textContent=String(visible);
  const empty=document.getElementById('missingEmptyRowV953');
  if(empty)empty.hidden=visible>0;
}

function exportFilteredMissingV953(){
  if(!requireXlsx('未填名單 Excel 匯出'))return;
  const rows=[...document.querySelectorAll('.missingRowV953')].filter(row=>!row.hidden).map(row=>({
    '部門':row.dataset.department||'',
    '姓名':row.dataset.name||'',
    '員編':row.dataset.employee||''
  }));
  if(!rows.length)return alert('目前篩選條件下沒有可匯出的未填人員');
  const workbook=XLSX.utils.book_new();
  const worksheet=XLSX.utils.json_to_sheet(rows,{header:['部門','姓名','員編']});
  worksheet['!cols']=[{wch:18},{wch:16},{wch:14}];
  XLSX.utils.book_append_sheet(workbook,worksheet,'未填名單');
  XLSX.writeFile(workbook,(activeSurvey()?.title||'活動調查')+'_未填名單.xlsx');
}

function dateStatsDepartmentV953(){
  return document.getElementById('dateStatsDeptFilter')?.value||'';
}

function datePersonDepartmentV953(item){
  return String(item?.departmentName||item?.department||'');
}

function filteredDateRosterV953(dateId){
  const department=dateStatsDepartmentV953();
  const applyDepartment=items=>department?items.filter(item=>datePersonDepartmentV953(item)===department):items;
  return{
    attending:applyDepartment(attendeeResponsesForDate(dateId)),
    unavailable:applyDepartment(unavailableResponsesForDate(dateId)),
    missing:applyDepartment(missingMembers())
  };
}

function dateRosterGroupV953(label,items,kind){
  return`<details class="dateRosterGroupV953"><summary><span>${esc(label)}</span><b>${items.length} 人</b></summary><div class="datePeopleChips">${peopleChipsV711(items,kind)}</div></details>`;
}

function renderDateRosterPanelV953(item,dateId){
  const panel=item?.querySelector('.dateRosterPanelV953');
  if(!panel)return;
  const roster=filteredDateRosterV953(dateId);
  panel.innerHTML=[
    dateRosterGroupV953('可出席',roster.attending,'available'),
    dateRosterGroupV953('已填但無法出席',roster.unavailable,'unavailable'),
    dateRosterGroupV953('尚未填答',roster.missing,'missing')
  ].join('');
}

function closeDateRosterV953(item){
  if(!item)return;
  item.classList.remove('isRosterOpen');
  const button=item.querySelector('.dateRosterToggleV953');
  const panel=item.querySelector('.dateRosterPanelV953');
  if(button){
    button.setAttribute('aria-expanded','false');
    button.querySelector('.dateRosterToggleTextV953').textContent='查看名單';
  }
  if(panel)panel.hidden=true;
}

function toggleDateRosterV953(button){
  const item=button?.closest('.dateDecisionItem');
  if(!item)return;
  const shouldOpen=button.getAttribute('aria-expanded')!=='true';
  document.querySelectorAll('.dateDecisionItem.isRosterOpen').forEach(closeDateRosterV953);
  if(!shouldOpen)return;
  renderDateRosterPanelV953(item,item.dataset.dateId||'');
  item.classList.add('isRosterOpen');
  button.setAttribute('aria-expanded','true');
  button.querySelector('.dateRosterToggleTextV953').textContent='收合名單';
  const panel=item.querySelector('.dateRosterPanelV953');
  if(panel)panel.hidden=false;
}

function refreshDateStatsV953(){
  const items=[...document.querySelectorAll('.dateDecisionItem[data-date-id]')];
  const counts=items.map(item=>filteredDateRosterV953(item.dataset.dateId||'').attending.length);
  const maximum=Math.max(1,...counts);
  items.forEach((item,index)=>{
    const count=counts[index];
    const countNode=item.querySelector('.dateVoteCountV953');
    const bar=item.querySelector('.dateVoteBarV953');
    if(countNode)countNode.textContent=count+' 人';
    if(bar)bar.style.width=Math.round(count/maximum*100)+'%';
    if(item.classList.contains('isRosterOpen'))renderDateRosterPanelV953(item,item.dataset.dateId||'');
  });
}

function filterDateStatsDepartmentV711(){
  refreshDateStatsV953();
}

enhanceDateStatsV711=function(){
  const heading=[...document.querySelectorAll('#resultTables h3')].find(node=>node.textContent.includes('日期統計與可出席名單'));
  const section=heading?.closest('.resultSection');
  const list=section?.querySelector('.dateDecisionList');
  if(!section||!list||list.dataset.v953==='true')return;
  list.dataset.v953='true';
  const departments=[...new Set(targetMembers().map(item=>item.department||item.departmentName||'').filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'zh-Hant'));
  const filter=document.createElement('select');
  filter.id='dateStatsDeptFilter';
  filter.className='dateStatsDeptFilter';
  filter.setAttribute('aria-label','日期統計部門篩選');
  filter.innerHTML='<option value="">全部部門</option>'+departments.map(value=>'<option value="'+escAttr(value)+'">'+esc(value)+'</option>').join('');
  filter.onchange=filterDateStatsDepartmentV711;
  const slot=section.querySelector('.dateFilterSlot');
  if(slot)slot.replaceChildren(filter);
  else heading.insertAdjacentElement('afterend',filter);
  [...list.querySelectorAll('.dateDecisionItem')].forEach((item,index)=>{
    item.dataset.dateId=item.dataset.dateId||D.dates[index]?.id||'';
    item.querySelectorAll(':scope > details,.dateAttendanceGroups,.dateRosterToggleV953,.dateRosterPanelV953').forEach(node=>node.remove());
    item.insertAdjacentHTML('beforeend','<button class="dateRosterToggleV953" type="button" aria-expanded="false" onclick="toggleDateRosterV953(this)"><span class="dateRosterToggleTextV953">查看名單</span><span class="dateRosterChevronV953" aria-hidden="true">⌄</span></button><div class="dateRosterPanelV953" hidden></div>');
  });
  refreshDateStatsV953();
};

window.filterMissingRowsV953=filterMissingRowsV953;
window.exportFilteredMissingV953=exportFilteredMissingV953;
window.toggleDateRosterV953=toggleDateRosterV953;


