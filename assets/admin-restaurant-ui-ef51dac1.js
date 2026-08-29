/* 相容層：餐廳列表優先與專注編輯介面。 */

/* ===== 餐廳列表優先與新增／編輯專注模式 ===== */
(() => {
  let restaurantReturnScrollV977=0;
  let restaurantHistoryReturnFocusV1030=null;
  let restaurantHistoryCacheV1030=null;

  function restaurantCountV977(){
    return Array.isArray(D?.restaurants)?D.restaurants.length:0;
  }

  function historyTimeMsV1030(value){
    if(value&&typeof value.toMillis==='function')return value.toMillis();
    if(value&&Number.isFinite(Number(value.seconds)))return Number(value.seconds)*1000;
    const parsed=Date.parse(String(value||''));
    return Number.isFinite(parsed)?parsed:0;
  }

  function historyScoreV1030(value){
    const score=Number(value);
    return Number.isFinite(score)?score:null;
  }

  function buildRestaurantHistorySnapshotFromDataV1030({survey,finalDecision,restaurants,dates,responses}){
    const candidates=Array.isArray(restaurants)?restaurants.filter(item=>item&&item.id):[];
    const finalRestaurantId=String(finalDecision?.finalRestaurantId||'');
    const finalDateId=String(finalDecision?.finalDateId||'');
    if(!finalRestaurantId||!finalDateId||!candidates.length)return null;
    const rankCount=Math.min(candidates.length,3);
    const validResponses=(Array.isArray(responses)?responses:[]).filter(response=>!response?.cannotAttend);
    const rows=candidates.map(restaurant=>{
      let weightedScore=0;
      validResponses.forEach(response=>{
        const ranks=Array.isArray(response?.restaurantRanks)?response.restaurantRanks:[];
        for(let index=0;index<rankCount;index++)if(String(ranks[index]||'')===String(restaurant.id))weightedScore+=rankCount-index;
      });
      return{restaurantId:String(restaurant.id),restaurantName:String(restaurant.name||'未命名餐廳'),weightedScore};
    }).sort((a,b)=>b.weightedScore-a.weightedScore||a.restaurantName.localeCompare(b.restaurantName,'zh-Hant'));
    rows.forEach((row,index)=>{row.rank=index+1});
    const finalRestaurant=candidates.find(item=>String(item.id)===finalRestaurantId);
    const finalDate=(Array.isArray(dates)?dates:[]).find(item=>String(item.id)===finalDateId);
    return{
      version:1,
      surveyId:String(survey?.id||finalDecision?.surveyId||''),
      activityName:String(survey?.title||'未命名活動'),
      finalDateId,
      finalDateLabel:String(finalDate?.label||''),
      finalRestaurantId,
      finalRestaurantName:String(finalRestaurant?.name||'餐廳資料已移除'),
      responseCount:validResponses.length,
      rankCount,
      candidates:rows
    };
  }

  function buildRestaurantHistorySnapshotV1030(){
    return buildRestaurantHistorySnapshotFromDataV1030({
      survey:activeSurvey?.(),
      finalDecision:{surveyId:activeSurveyId,finalDateId:finalDate?.value||'',finalRestaurantId:finalRest?.value||''},
      restaurants:D?.restaurants||[],
      dates:D?.dates||[],
      responses:D?.responses||[]
    });
  }

  function installRestaurantHistoryModalV1030(){
    let mask=document.getElementById('restaurantHistoryMaskV1030');
    if(mask)return mask;
    mask=document.createElement('div');
    mask.id='restaurantHistoryMaskV1030';
    mask.className='modalMask restaurantHistoryMaskV1030';
    mask.hidden=true;
    mask.innerHTML=`<section class="restaurantHistoryDialogV1030" role="dialog" aria-modal="true" aria-labelledby="restaurantHistoryTitleV1030"><header class="restaurantHistoryHeadV1030"><div><h2 id="restaurantHistoryTitleV1030">餐廳歷程</h2><p>查看歷次已完成決議的餐廳排名與加權分數，不包含個人投票資料。</p></div><button class="restaurantHistoryCloseV1030" type="button" aria-label="關閉餐廳歷程">×</button></header><div id="restaurantHistoryBodyV1030" class="restaurantHistoryBodyV1030"><div class="restaurantHistoryLoadingV1030">正在整理餐廳歷程…</div></div><footer class="restaurantHistoryFootV1030"><button class="btn" type="button">關閉</button></footer></section>`;
    document.body.appendChild(mask);
    mask.querySelector('.restaurantHistoryCloseV1030')?.addEventListener('click',closeRestaurantHistoryV1030);
    mask.querySelector('.restaurantHistoryFootV1030 .btn')?.addEventListener('click',closeRestaurantHistoryV1030);
    mask.addEventListener('click',event=>{if(event.target===mask)closeRestaurantHistoryV1030()});
    return mask;
  }

  function installRestaurantHistoryButtonV1030(listHeader){
    if(!listHeader)return;
    const description=listHeader.querySelector('.muted');
    if(description)description.textContent='管理目前活動的候選餐廳，並參考歷次決議與排名。';
    let actions=listHeader.querySelector('.restaurantListActionsV1030');
    if(!actions){
      actions=document.createElement('div');
      actions.className='restaurantListActionsV1030';
      const addButton=listHeader.querySelector('#startNewRestaurantV977');
      if(addButton)actions.appendChild(addButton);
      listHeader.appendChild(actions);
    }
    let historyButton=actions.querySelector('#showRestaurantHistoryV1030');
    if(!historyButton){
      historyButton=document.createElement('button');
      historyButton.id='showRestaurantHistoryV1030';
      historyButton.className='btn';
      historyButton.type='button';
      historyButton.textContent='查看歷程';
      historyButton.addEventListener('click',showRestaurantHistoryV1030);
      actions.insertBefore(historyButton,actions.firstChild);
    }
  }

  async function loadRestaurantHistoryV1030(force=false){
    if(restaurantHistoryCacheV1030&&!force)return restaurantHistoryCacheV1030;
    const [surveys,restaurants,dates,finalDecisions,announcements]=await Promise.all([
      safeGetCollection('surveys'),safeGetCollection('restaurants'),safeGetCollection('surveyDates'),safeGetCollection('finalDecision'),safeGetCollection('publicAnnouncements')
    ]);
    const surveyMap=new Map(surveys.map(item=>[String(item.id),item]));
    const announcementMap=new Map(announcements.map(item=>[String(item.id||item.surveyId),item]));
    const raw={surveys,restaurants,dates,finalDecisions,announcements};
    const records=finalDecisions.filter(item=>item?.finalDateId&&item?.finalRestaurantId).map(finalDecision=>{
      const surveyId=String(finalDecision.id||finalDecision.surveyId||'');
      const survey=surveyMap.get(surveyId)||{id:surveyId,title:''};
      const activityRestaurants=restaurants.filter(item=>String(item.surveyId||'')===surveyId);
      const activityDates=dates.filter(item=>String(item.surveyId||'')===surveyId);
      const announcement=announcementMap.get(surveyId)||{};
      let snapshot=finalDecision.restaurantHistorySnapshot||null;
      if(!snapshot&&surveyId===String(activeSurveyId||'')&&D?.final?.finalDateId&&D?.final?.finalRestaurantId){
        snapshot=buildRestaurantHistorySnapshotFromDataV1030({survey,finalDecision,restaurants:D.restaurants||activityRestaurants,dates:D.dates||activityDates,responses:D.responses||[]});
      }
      const finalRestaurant=activityRestaurants.find(item=>String(item.id)===String(finalDecision.finalRestaurantId));
      const finalDate=activityDates.find(item=>String(item.id)===String(finalDecision.finalDateId));
      let candidates=Array.isArray(snapshot?.candidates)&&snapshot.candidates.length?snapshot.candidates.map(item=>({
        restaurantId:String(item.restaurantId||''),restaurantName:String(item.restaurantName||'未命名餐廳'),rank:Number(item.rank)||null,weightedScore:historyScoreV1030(item.weightedScore)
      })):activityRestaurants.map(item=>({restaurantId:String(item.id),restaurantName:String(item.name||'未命名餐廳'),rank:null,weightedScore:null}));
      const finalRestaurantId=String(finalDecision.finalRestaurantId||snapshot?.finalRestaurantId||'');
      if(!candidates.some(item=>item.restaurantId===finalRestaurantId))candidates.unshift({restaurantId:finalRestaurantId,restaurantName:String(snapshot?.finalRestaurantName||finalRestaurant?.name||announcement.restaurantName||'餐廳資料已移除'),rank:null,weightedScore:null});
      return{
        surveyId,
        activityName:String(snapshot?.activityName||survey.title||announcement.activityName||'未命名活動'),
        finalDateLabel:String(snapshot?.finalDateLabel||finalDate?.label||announcement.dateLabel||''),
        finalRestaurantId,
        finalRestaurantName:String(snapshot?.finalRestaurantName||finalRestaurant?.name||announcement.restaurantName||'餐廳資料已移除'),
        responseCount:Number.isFinite(Number(snapshot?.responseCount))?Number(snapshot.responseCount):null,
        candidates,
        hasSavedScores:Boolean(finalDecision.restaurantHistorySnapshot&&candidates.some(item=>item.weightedScore!==null)),
        sortTime:historyTimeMsV1030(announcement.eventDateKey||finalDecision.restaurantHistoryCapturedAt||finalDecision.updatedAt||survey.updatedAt||survey.createdAt),
        finalDecision
      };
    }).sort((a,b)=>b.sortTime-a.sortTime||b.activityName.localeCompare(a.activityName,'zh-Hant'));
    restaurantHistoryCacheV1030={records,raw};
    return restaurantHistoryCacheV1030;
  }

  function restaurantHistoryGapV1030(score,selectedScore,isSelected){
    if(isSelected)return'—';
    if(score===null||selectedScore===null)return'當時未保存';
    const difference=score-selectedScore;
    if(difference===0)return'同分';
    return(difference>0?'高 ':'低 ')+Math.abs(difference)+' 分';
  }

  function restaurantHistoryNameKeyV1031(value){
    return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('zh-Hant');
  }

  function restaurantHistoryOverviewV1031(records){
    const decisions=new Map(),candidates=new Map();
    records.forEach(record=>{
      const decisionKey=restaurantHistoryNameKeyV1031(record.finalRestaurantName);
      if(decisionKey){
        const current=decisions.get(decisionKey)||{name:record.finalRestaurantName,count:0};
        current.count++;decisions.set(decisionKey,current);
      }
      const activityCandidates=new Set();
      record.candidates.forEach(candidate=>{
        const key=restaurantHistoryNameKeyV1031(candidate.restaurantName);
        if(!key||activityCandidates.has(key))return;
        activityCandidates.add(key);
        const current=candidates.get(key)||{name:candidate.restaurantName,count:0};
        current.count++;candidates.set(key,current);
      });
    });
    const byName=(a,b)=>a.name.localeCompare(b.name,'zh-Hant');
    return{
      decisions:[...decisions.values()].sort(byName),
      candidates:[...candidates.values()].sort(byName),
      waiting:[...candidates.entries()].filter(([key])=>!decisions.has(key)).map(([,value])=>value).sort(byName),
      decisionKeys:new Set(decisions.keys())
    };
  }

  function restaurantHistoryOverviewListV1031(items,type){
    if(!items.length)return'<p class="restaurantHistoryOverviewEmptyV1031">目前沒有資料</p>';
    const badge=type==='decision'?'決議':'參與票選';
    return`<ul>${items.map(item=>`<li><span>${esc(item.name)}</span><b>${badge} ${esc(item.count)} 次</b></li>`).join('')}</ul>`;
  }

  function restaurantHistoryCardV1031(record,decisionKeys){
    const selected=record.candidates.find(item=>item.restaurantId===record.finalRestaurantId)||null;
    const selectedScore=historyScoreV1030(selected?.weightedScore);
    const rows=[...record.candidates].sort((a,b)=>(a.rank??999)-(b.rank??999)||((b.weightedScore??-1)-(a.weightedScore??-1))||a.restaurantName.localeCompare(b.restaurantName,'zh-Hant')).map(item=>{
      const isSelected=item.restaurantId===record.finalRestaurantId;
      const score=historyScoreV1030(item.weightedScore);
      const waiting=!decisionKeys.has(restaurantHistoryNameKeyV1031(item.restaurantName));
      return`<tr><td class="alignCenter">${item.rank??'—'}</td><td><b>${esc(item.restaurantName)}</b>${waiting&&!isSelected?'<span class="restaurantHistoryWaitingV1030">待嘗試</span>':''}</td><td class="alignCenter">${score===null?'當時未保存':esc(score)}</td><td class="alignCenter">${esc(restaurantHistoryGapV1030(score,selectedScore,isSelected))}</td><td class="alignCenter"><span class="restaurantHistoryStatusV1030 ${isSelected?'isSelected':'isCandidate'}">${isSelected?'最終決議':'未獲選'}</span></td></tr>`;
    }).join('');
    return`<article class="restaurantHistoryCardV1030"><header><div><h3>${esc(record.activityName)}</h3><p>${record.finalDateLabel?'最終日期：'+esc(record.finalDateLabel):'最終日期未保存'}${record.responseCount===null?'':'｜有效票數：'+esc(record.responseCount)}</p></div><div class="restaurantHistoryDecisionV1030"><span>決議餐廳</span><b>${esc(record.finalRestaurantName)}</b></div></header><div class="restaurantHistoryTableV1030"><table><thead><tr><th>排名</th><th>餐廳</th><th>加權分數</th><th>與決議餐廳差距</th><th>結果</th></tr></thead><tbody>${rows}</tbody></table></div></article>`;
  }

  function renderRestaurantHistoryV1030(data){
    const body=document.getElementById('restaurantHistoryBodyV1030');
    if(!body)return;
    const records=data?.records||[];
    if(!records.length){body.innerHTML='<div class="restaurantHistoryEmptyV1030">目前尚無已完成最終決議的餐廳歷程。</div>';return}
    const overview=restaurantHistoryOverviewV1031(records);
    const missingCount=records.filter(record=>!record.hasSavedScores).length;
    const backfill=isSystemAdmin&&missingCount?`<div class="restaurantHistoryBackfillV1030"><div><b>${missingCount} 場舊活動尚未保存加權分數</b><span>系統管理員可讀取舊回覆並建立不含姓名的歷程快照。</span></div><button class="btn" type="button" onclick="backfillRestaurantHistoryV1030()">補齊舊資料</button></div>`:missingCount?`<div class="restaurantHistoryLegacyNoteV1030">部分舊活動在餐廳歷程功能上線前未保存加權分數，會標示為「當時未保存」。</div>`:'';
    const options=records.map(record=>`<option value="${esc(record.surveyId)}">${esc(record.activityName)}${record.finalDateLabel?'｜'+esc(record.finalDateLabel):''}</option>`).join('');
    body.innerHTML=`<div class="restaurantHistorySummaryV1030"><div><span>已儲存決議活動</span><b>${records.length}</b></div><div><span>曾進決議餐廳</span><b>${overview.decisions.length}</b></div><div><span>曾參與餐廳</span><b>${overview.candidates.length}</b></div><div><span>待嘗試餐廳</span><b>${overview.waiting.length}</b></div></div><section class="restaurantHistoryOverviewV1031" aria-label="餐廳總覽"><div><header><h3>曾進決議餐廳</h3><span>${overview.decisions.length} 間</span></header>${restaurantHistoryOverviewListV1031(overview.decisions,'decision')}</div><div><header><h3>待嘗試餐廳</h3><span>${overview.waiting.length} 間</span></header>${restaurantHistoryOverviewListV1031(overview.waiting,'waiting')}</div></section>${backfill}<section class="restaurantHistoryActivityV1031"><label for="restaurantHistoryActivitySelectV1031">查看活動</label><select id="restaurantHistoryActivitySelectV1031">${options}</select><p>一次顯示一場活動的餐廳排名、加權分數與分數差距。</p></section><div id="restaurantHistorySelectedV1031" class="restaurantHistoryListV1030"></div>`;
    const selector=document.getElementById('restaurantHistoryActivitySelectV1031');
    const selectedHost=document.getElementById('restaurantHistorySelectedV1031');
    const renderSelected=()=>{
      const record=records.find(item=>item.surveyId===selector?.value)||records[0];
      if(selectedHost)selectedHost.innerHTML=record?restaurantHistoryCardV1031(record,overview.decisionKeys):'';
    };
    selector?.addEventListener('change',renderSelected);
    renderSelected();
  }

  async function showRestaurantHistoryV1030(){
    const mask=installRestaurantHistoryModalV1030();
    restaurantHistoryReturnFocusV1030=document.activeElement;
    mask.hidden=false;mask.style.display='flex';document.body.classList.add('modalOpen');
    const body=document.getElementById('restaurantHistoryBodyV1030');
    if(body)body.innerHTML='<div class="restaurantHistoryLoadingV1030">正在整理餐廳歷程…</div>';
    mask.querySelector('.restaurantHistoryCloseV1030')?.focus();
    try{renderRestaurantHistoryV1030(await loadRestaurantHistoryV1030(true))}
    catch(error){console.error('load restaurant history failed',error);if(body)body.innerHTML='<div class="restaurantHistoryEmptyV1030">餐廳歷程載入失敗，請稍後再試。</div>'}
  }

  function closeRestaurantHistoryV1030(){
    const mask=document.getElementById('restaurantHistoryMaskV1030');
    if(mask){mask.hidden=true;mask.style.display='none'}
    document.body.classList.remove('modalOpen');
    if(restaurantHistoryReturnFocusV1030&&document.contains(restaurantHistoryReturnFocusV1030))restaurantHistoryReturnFocusV1030.focus();
    restaurantHistoryReturnFocusV1030=null;
  }

  async function backfillRestaurantHistoryV1030(){
    if(!isSystemAdmin)return alert('只有系統管理員可以補齊舊資料');
    const data=await loadRestaurantHistoryV1030();
    const missing=data.records.filter(record=>!record.hasSavedScores);
    if(!missing.length)return toast('舊活動分數皆已補齊');
    const message='將讀取 '+missing.length+' 場舊活動的投票，僅保存餐廳排名與加權分數，不保存姓名或個人選擇。是否繼續？';
    const confirmed=typeof window.adminConfirmV908==='function'?await window.adminConfirmV908(message,'補齊餐廳歷程'):window.confirm(message);
    if(!confirmed)return;
    const button=document.querySelector('.restaurantHistoryBackfillV1030 .btn');if(button){button.disabled=true;button.textContent='補齊中…'}
    try{
      const surveyMap=new Map(data.raw.surveys.map(item=>[String(item.id),item]));
      let batch=db.batch(),batchCount=0,completed=0;
      for(const record of missing){
        const surveyId=record.surveyId;
        const responseSnapshot=await col('responses').where('surveyId','==',surveyId).get();
        const responses=responseSnapshot.docs.map(item=>({id:item.id,...item.data()}));
        const snapshot=buildRestaurantHistorySnapshotFromDataV1030({
          survey:surveyMap.get(surveyId)||{id:surveyId,title:record.activityName},
          finalDecision:record.finalDecision,
          restaurants:data.raw.restaurants.filter(item=>String(item.surveyId||'')===surveyId),
          dates:data.raw.dates.filter(item=>String(item.surveyId||'')===surveyId),
          responses
        });
        if(!snapshot)continue;
        batch.set(doc('finalDecision',surveyId),{restaurantHistorySnapshot:snapshot,restaurantHistoryCapturedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        batchCount++;completed++;
        if(batchCount===400){await batch.commit();batch=db.batch();batchCount=0}
      }
      if(batchCount)await batch.commit();
      restaurantHistoryCacheV1030=null;
      renderRestaurantHistoryV1030(await loadRestaurantHistoryV1030(true));
      toast('已補齊 '+completed+' 場餐廳歷程');
    }catch(error){console.error('backfill restaurant history failed',error);alert('舊資料補齊失敗，請檢查權限或網路後再試一次')}
    finally{if(button){button.disabled=false;button.textContent='補齊舊資料'}}
  }

  function installRestaurantFocusUIV977(){
    const panelElement=document.getElementById('restP');
    const card=panelElement?.querySelector(':scope > .card');
    const tableElement=document.getElementById('restTable');
    if(!card||!tableElement)return null;

    let editor=document.getElementById('restaurantEditorV977');
    if(!editor){
      editor=document.createElement('div');
      editor.id='restaurantEditorV977';
      editor.className='restaurantEditorV977';
      const movable=[...card.children].filter(element=>element!==tableElement&&!element.classList.contains('restaurantListHeaderV977'));
      movable.forEach(element=>editor.appendChild(element));
      card.insertBefore(editor,tableElement);
    }

    let listHeader=card.querySelector(':scope > .restaurantListHeaderV977');
    if(!listHeader){
      listHeader=document.createElement('div');
      listHeader.className='restaurantListHeaderV977';
      listHeader.innerHTML='<div><h3>餐廳列表</h3><p class="muted">管理目前活動的候選餐廳。</p></div><button id="startNewRestaurantV977" class="btn primary" type="button">新增餐廳</button>';
      card.insertBefore(listHeader,editor);
      listHeader.querySelector('#startNewRestaurantV977')?.addEventListener('click',startNewRestaurantV977);
    }
    installRestaurantHistoryButtonV1030(listHeader);

    const description=editor.querySelector('.editorHead .muted');
    if(description)description.textContent='填寫餐廳資訊後儲存；取消可返回餐廳列表。';
    return {card,editor,listHeader,tableElement};
  }

  function renderRestaurantEmptyStateV977(){
    const tableElement=document.getElementById('restTable');
    if(!tableElement||restaurantCountV977()>0)return;
    tableElement.innerHTML='<div class="restaurantEmptyV977" role="status">尚無餐廳資料</div>';
  }

  function syncRestaurantFocusModeV977(mode){
    const ui=installRestaurantFocusUIV977();
    if(!ui)return;
    const nextMode=mode||ui.card.dataset.restaurantViewModeV977||'list';
    const wasFocused=ui.card.classList.contains('restaurantFocusModeV977');
    const isFocused=nextMode==='new'||nextMode==='edit';
    if(isFocused&&!wasFocused)restaurantReturnScrollV977=Math.max(0,window.scrollY||0);
    ui.card.classList.toggle('restaurantFocusModeV977',isFocused);
    ui.card.classList.toggle('restaurantListModeV977',!isFocused);
    ui.card.dataset.restaurantViewModeV977=nextMode;
    ui.editor.hidden=!isFocused;
    ui.listHeader.hidden=isFocused;
    ui.tableElement.hidden=isFocused;
    if(!isFocused){
      renderRestaurantEmptyStateV977();
      if(wasFocused){
        const returnScroll=restaurantReturnScrollV977;
        window.requestAnimationFrame(()=>window.scrollTo({top:returnScroll,behavior:'auto'}));
      }
    }
  }

  const cancelRestaurantEditBaseV977=cancelRestaurantEdit;
  function startNewRestaurantV977(){
    cancelRestaurantEditBaseV977(false);
    if(restFormHeading)restFormHeading.textContent='新增餐廳';
    if(restModeBadge){restModeBadge.textContent='新增模式';restModeBadge.className='modeBadge new'}
    if(restSaveBtn)restSaveBtn.textContent='新增餐廳';
    if(restCancelBtn){restCancelBtn.hidden=false;restCancelBtn.textContent='取消'}
    syncRestaurantFocusModeV977('new');
    window.requestAnimationFrame(()=>newRest?.focus());
  }

  const editRestaurantBaseV977=editRestaurant;
  editRestaurant=function(id){
    editRestaurantBaseV977(id);
    if(!editingRestaurantId)return;
    if(restCancelBtn){restCancelBtn.hidden=false;restCancelBtn.textContent='取消'}
    syncRestaurantFocusModeV977('edit');
  };

  cancelRestaurantEdit=function(render=true){
    const result=cancelRestaurantEditBaseV977(render);
    if(restCancelBtn)restCancelBtn.textContent='取消';
    syncRestaurantFocusModeV977('list');
    return result;
  };

  const renderRestPanelBaseV977=renderRestPanel;
  renderRestPanel=function(){
    const result=renderRestPanelBaseV977();
    installRestaurantFocusUIV977();
    renderRestaurantEmptyStateV977();
    syncRestaurantFocusModeV977(document.querySelector('#restP > .card')?.dataset.restaurantViewModeV977||'list');
    return result;
  };

  const renderAdminBaseV977=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBaseV977();
    installRestaurantFocusUIV977();
    renderRestaurantEmptyStateV977();
    syncRestaurantFocusModeV977(document.querySelector('#restP > .card')?.dataset.restaurantViewModeV977||'list');
    return result;
  };

  function initializeRestaurantFocusV977(){
    installRestaurantFocusUIV977();
    syncRestaurantFocusModeV977('list');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeRestaurantFocusV977,{once:true});
  else initializeRestaurantFocusV977();

  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('restaurantHistoryMaskV1030')?.hidden){event.preventDefault();closeRestaurantHistoryV1030()}});

  window.startNewRestaurantV977=startNewRestaurantV977;
  window.syncRestaurantFocusModeV977=syncRestaurantFocusModeV977;
  window.renderRestaurantEmptyStateV977=renderRestaurantEmptyStateV977;
  window.editRestaurant=editRestaurant;
  window.cancelRestaurantEdit=cancelRestaurantEdit;
  window.renderRestPanel=renderRestPanel;
  window.renderAdmin=renderAdmin;
  window.showRestaurantHistoryV1030=showRestaurantHistoryV1030;
  window.closeRestaurantHistoryV1030=closeRestaurantHistoryV1030;
  window.backfillRestaurantHistoryV1030=backfillRestaurantHistoryV1030;
  window.RestaurantHistoryV1030=Object.freeze({buildSnapshot:buildRestaurantHistorySnapshotV1030,buildSnapshotFromData:buildRestaurantHistorySnapshotFromDataV1030,show:showRestaurantHistoryV1030,close:closeRestaurantHistoryV1030,backfill:backfillRestaurantHistoryV1030});
})();


