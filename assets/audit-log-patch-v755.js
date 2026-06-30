(function(){
  'use strict';
  const VERSION='v7.47';
  const PAGE_SIZE=12;
  const AUDIT_COLLECTION='surveyAuditLogs';
  const LOGIN_COLLECTION='surveyLoginLogs';
  const WATCHED_COLLECTIONS=new Set(['surveys','surveyDates','restaurants','members','responses','finalDecision','surveyManagers']);
  const TYPE_MAP={surveys:'活動',surveyDates:'日期',restaurants:'餐廳',members:'人員',responses:'問卷',finalDecision:'最終決議',surveyManagers:'活動權限'};
  const FIELD_LABELS={
    title:'活動標題',description:'說明文字',descriptionHtml:'說明文字',frontInstructions:'前台填寫說明',
    deadline:'截止時間',openAt:'開放時間',status:'狀態',allowEdit:'允許修改',theme:'前台主題',
    targetDepartments:'參與部門',budgetPerPerson:'每人預算',label:'日期',sort:'排序',active:'狀態',
    name:'名稱',address:'地址',googleMap:'Google Map',mapUrl:'Google Map',infoUrl:'店家資訊網址',
    descriptionRest:'類型',pricingMode:'計價方式',price:'價格',tableSeats:'每桌人數',minTables:'最低桌數',
    serviceRate:'服務費率',fixedFee:'固定費用',internalNote:'內部作業備註',
    department:'部門',departmentName:'部門',employeeNo:'員工編號',empNo:'員工編號',googleEmail:'Google 帳號',
    email:'Google 帳號',role:'權限',enabled:'啟用狀態',cannotAttend:'參加狀態',dateIds:'可參加日期',
    selectedDateIds:'可參加日期',restaurantRanks:'餐廳選擇順序',note:'備註',finalDateId:'最終日期',
    finalRestaurantId:'最終餐廳',locked:'鎖定'
  };
  let auditRows=[],loginRows=[],logPage=1,patchInstalled=false,writingAudit=false;
  const wrappedDbs=new WeakSet();
  const wrappedDocs=new WeakSet();
  const wrappedCollections=new WeakSet();

  function $(id){return document.getElementById(id)}
  function esc(value){return String(value??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
  function tsToDate(v){try{return v&&typeof v.toDate==='function'?v.toDate():v instanceof Date?v:null}catch(e){return null}}
  function fmtTs(v){let d=tsToDate(v);return d&&!Number.isNaN(d.getTime())?`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${d.getHours()<12?'上午':'下午'}${String((d.getHours()+11)%12+1).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`:'—'}
  function dayKey(v){let d=tsToDate(v);return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:''}
  function clean(value){
    if(value===undefined)return null;
    if(value===null||['string','number','boolean'].includes(typeof value))return value;
    if(Array.isArray(value))return value.map(clean);
    if(value&&typeof value.toDate==='function')return fmtTs(value);
    if(typeof value==='object'){
      let out={};
      Object.keys(value).forEach(k=>{if(!['createdAt','updatedAt','submittedAt'].includes(k))out[k]=clean(value[k])});
      return out;
    }
    return String(value);
  }
  function valueText(v){
    v=clean(v);
    if(v===undefined||v===null||v==='')return '—';
    if(Array.isArray(v))return v.length?v.map(valueText).join('、'):'—';
    if(typeof v==='boolean')return v?'是':'否';
    if(typeof v==='object')return JSON.stringify(v);
    return String(v);
  }
  function isSame(a,b){return JSON.stringify(clean(a))===JSON.stringify(clean(b))}
  function diff(before,after){
    before=before||{};after=after||{};
    let keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>!['createdAt','updatedAt','submittedAt','dateSaveVersion','rawDateSource'].includes(k));
    return keys.map(k=>isSame(before[k],after[k])?null:{key:k,field:FIELD_LABELS[k]||k,before:valueText(before[k]),after:valueText(after[k])}).filter(Boolean);
  }
  function pathParts(ref){
    let path=ref&&ref.path?ref.path:'';
    let parts=String(path).split('/').filter(Boolean);
    return {collection:parts[0]||'',id:parts[1]||'',path};
  }
  function activeSurveyId(){
    return $('activeSurveySelect')?.value||String(location.hash.match(/survey_[A-Za-z0-9_-]+/)?.[0]||'');
  }
  function targetLabel(collection,id,before,after){
    let d=after||before||{};
    return d.title||d.label||d.name||d.employeeName||d.memberName||d.email||d.googleEmail||id;
  }
  function surveyIdFor(collection,id,before,after){
    let d=after||before||{};
    if(collection==='surveys')return id;
    if(collection==='finalDecision')return id;
    return d.surveyId||activeSurveyId();
  }
  function actorInfo(){
    let email=$('adminUser')?.textContent||'';
    let role=$('adminRole')?.textContent||'';
    return {actorEmail:email.includes('@')?email:'',actorName:email,actorRole:role||'系統管理員',userEmail:email.includes('@')?email:'',userName:email};
  }
  async function writeAuditDoc(payload){
    if(writingAudit||!window.firebase?.firestore)return;
    writingAudit=true;
    try{
      await firebase.firestore().collection(AUDIT_COLLECTION).add({
        ...payload,
        auditPatchVersion:VERSION,
        detailVersion:VERSION,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
    }catch(e){console.warn('[audit patch] write failed',e)}
    finally{writingAudit=false}
  }
  async function auditFirestoreChange(ref,action,before,after){
    if((window.auditSuppressV738||0)>0)return;
    let {collection,id,path}=pathParts(ref);
    if(!WATCHED_COLLECTIONS.has(collection))return;
    let changes=diff(before,after);
    if(action==='修改'&&!changes.length)return;
    let type=TYPE_MAP[collection]||collection;
    let label=targetLabel(collection,id,before,after);
    let summary=action==='新增'?`新增「${label}」`:action==='刪除'?`刪除「${label}」`:changes.slice(0,3).map(c=>`${c.field} ${c.before} → ${c.after}`).join('；')+(changes.length>3?`；+${changes.length-3} 項`:'');
    await writeAuditDoc({
      surveyId:surveyIdFor(collection,id,before,after),
      action,targetType:type,targetId:id,targetLabel:label,
      summary,
      changes:clean(changes),
      before:clean(before||{}),
      after:clean(after||{}),
      beforeSummary:clean(before||{}),
      afterSummary:clean(after||{}),
      sourcePath:path,
      ...actorInfo()
    });
  }
  function shouldWatchRef(ref){
    return WATCHED_COLLECTIONS.has(pathParts(ref).collection);
  }
  async function safeDocData(ref){
    try{
      let snap=await ref.get();
      return snap&&snap.exists?snap.data():null;
    }catch(e){return null}
  }
  function wrapDocRef(ref){
    if(!ref||wrappedDocs.has(ref))return ref;
    if(!shouldWatchRef(ref))return ref;
    wrappedDocs.add(ref);
    let originalSet=typeof ref.set==='function'?ref.set.bind(ref):null;
    let originalUpdate=typeof ref.update==='function'?ref.update.bind(ref):null;
    let originalDelete=typeof ref.delete==='function'?ref.delete.bind(ref):null;
    if(originalSet){
      ref.set=async function(data,options){
        let before=await safeDocData(ref);
        let result=await originalSet.apply(null,arguments);
        let after=await safeDocData(ref);
        await auditFirestoreChange(ref,before?'修改':'新增',before,after||data||{});
        return result;
      };
    }
    if(originalUpdate){
      ref.update=async function(){
        let before=await safeDocData(ref);
        let result=await originalUpdate.apply(null,arguments);
        let after=await safeDocData(ref);
        await auditFirestoreChange(ref,before?'修改':'新增',before,after||{});
        return result;
      };
    }
    if(originalDelete){
      ref.delete=async function(){
        let before=await safeDocData(ref);
        let result=await originalDelete.apply(null,arguments);
        if(before)await auditFirestoreChange(ref,'刪除',before,null);
        return result;
      };
    }
    return ref;
  }
  function wrapCollectionRef(colRef){
    if(!colRef||wrappedCollections.has(colRef))return colRef;
    wrappedCollections.add(colRef);
    let originalDoc=typeof colRef.doc==='function'?colRef.doc.bind(colRef):null;
    let originalAdd=typeof colRef.add==='function'?colRef.add.bind(colRef):null;
    if(originalDoc){
      colRef.doc=function(){
        return wrapDocRef(originalDoc.apply(null,arguments));
      };
    }
    if(originalAdd){
      colRef.add=async function(data){
        let result=await originalAdd.apply(null,arguments);
        let after=await safeDocData(result);
        await auditFirestoreChange(result,'新增',null,after||data||{});
        return wrapDocRef(result);
      };
    }
    return colRef;
  }
  function wrapDbInstance(db){
    if(!db||wrappedDbs.has(db))return db;
    wrappedDbs.add(db);
    let originalCollection=typeof db.collection==='function'?db.collection.bind(db):null;
    let originalDoc=typeof db.doc==='function'?db.doc.bind(db):null;
    if(originalCollection){
      db.collection=function(){
        return wrapCollectionRef(originalCollection.apply(null,arguments));
      };
    }
    if(originalDoc){
      db.doc=function(){
        return wrapDocRef(originalDoc.apply(null,arguments));
      };
    }
    return db;
  }
  function installPrototypeFallback(){
    let proto=window.firebase.firestore.DocumentReference&&window.firebase.firestore.DocumentReference.prototype;
    let collectionProto=window.firebase.firestore.CollectionReference&&window.firebase.firestore.CollectionReference.prototype;
    if(proto&&!proto.__auditPatchV743){
      proto.__auditPatchV743=true;
      const originalSet=proto.set;
      const originalUpdate=proto.update;
      const originalDelete=proto.delete;
      proto.set=async function(data,options){
        let before=shouldWatchRef(this)?await safeDocData(this):null;
        let result=await originalSet.apply(this,arguments);
        if(shouldWatchRef(this)){
          let after=await safeDocData(this);
          await auditFirestoreChange(this,before?'修改':'新增',before,after||data||{});
        }
        return result;
      };
      proto.update=async function(){
        let before=shouldWatchRef(this)?await safeDocData(this):null;
        let result=await originalUpdate.apply(this,arguments);
        if(shouldWatchRef(this)){
          let after=await safeDocData(this);
          await auditFirestoreChange(this,before?'修改':'新增',before,after||{});
        }
        return result;
      };
      proto.delete=async function(){
        let before=shouldWatchRef(this)?await safeDocData(this):null;
        let result=await originalDelete.apply(this,arguments);
        if(shouldWatchRef(this)&&before)await auditFirestoreChange(this,'刪除',before,null);
        return result;
      };
    }
    if(collectionProto&&!collectionProto.__auditPatchV743){
      collectionProto.__auditPatchV743=true;
      const originalAdd=collectionProto.add;
      if(originalAdd){
        collectionProto.add=async function(data){
          let result=await originalAdd.apply(this,arguments);
          let after=await safeDocData(result);
          await auditFirestoreChange(result,'新增',null,after||data||{});
          return result;
        };
      }
    }
  }
  function installFirestoreAudit(){
    if(!window.firebase?.firestore)return;
    let dbWrapped=false;
    try{wrapDbInstance(firebase.firestore());patchInstalled=true;dbWrapped=true}catch(e){console.warn('[audit patch] db wrap failed',e)}
    if(!dbWrapped){
      try{installPrototypeFallback();patchInstalled=true}catch(e){console.warn('[audit patch] prototype wrap failed',e)}
    }
  }
  function renderDiff(log){
    let changes=Array.isArray(log.changes)?log.changes:[];
    if(changes.length){
      let rows=changes.map(c=>`<tr><td>${esc(c.field||c.key||'')}</td><td>${esc(c.before||'—')}</td><td>${esc(c.after||'—')}</td></tr>`).join('');
      return `<details class="auditDiffV738 auditDiffV741" open><summary>${esc(log.summary||`共 ${changes.length} 項異動`)}</summary><table><thead><tr><th>欄位</th><th>修改前</th><th>修改後</th></tr></thead><tbody>${rows}</tbody></table></details>`;
    }
    let before=log.before||log.beforeSummary||{},after=log.after||log.afterSummary||{};
    let keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>!['createdAt','updatedAt','submittedAt'].includes(k));
    if(keys.length){
      let rows=keys.map(k=>`<tr><td>${esc(FIELD_LABELS[k]||k)}</td><td>${esc(valueText(before[k]))}</td><td>${esc(valueText(after[k]))}</td></tr>`).join('');
      return `<details class="auditDiffV738 auditDiffV741" open><summary>${esc(log.summary||'異動明細')}</summary><table><thead><tr><th>欄位</th><th>修改前</th><th>修改後</th></tr></thead><tbody>${rows}</tbody></table></details>`;
    }
    if(log.detailVersion)return `<div>${esc(log.summary||'—')}</div><small class="muted">此紀錄已使用新版格式，但此操作沒有可比對欄位。</small>`;
    return `<div>${esc(log.summary||'—')}</div><small class="auditLegacyHintV741">此筆是舊格式紀錄，資料庫內沒有修改前/修改後欄位。</small>`;
  }
  function table(headers,rows){
    return `<div class="tableWrap"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${headers.length}" class="muted">目前沒有資料</td></tr>`}</tbody></table></div>`;
  }
  function filters(rows){
    let q=($('logSearch')?.value||'').trim().toLowerCase();
    let date=$('logDateFilter')?.value||'';
    return rows.filter(x=>(!date||dayKey(x.createdAt)===date)&&(!q||JSON.stringify(x).toLowerCase().includes(q))).sort((a,b)=>(tsToDate(b.createdAt)?.getTime()||0)-(tsToDate(a.createdAt)?.getTime()||0));
  }
  function renderLogs(){
    let box=$('logTable');if(!box)return;
    let type=$('logTypeFilter')?.value||'audit';
    let rows=filters(type==='login'?loginRows:auditRows);
    let pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
    logPage=Math.min(Math.max(1,logPage),pages);
    let pageRows=rows.slice((logPage-1)*PAGE_SIZE,logPage*PAGE_SIZE);
    let html=type==='login'
      ?table(['時間','帳號／姓名','結果','身分','說明'],pageRows.map(x=>`<tr><td>${esc(fmtTs(x.createdAt))}</td><td><b>${esc(x.displayName||x.email||'')}</b><br><small>${esc(x.email||'')}</small></td><td>${esc(x.result||'')}</td><td>${esc(x.role||'')}</td><td>${esc(x.reason||'—')}</td></tr>`))
      :table(['時間','操作者','活動','功能／動作','異動內容'],pageRows.map(x=>`<tr><td>${esc(fmtTs(x.createdAt))}</td><td><b>${esc(x.actorName||x.actorEmail||'')}</b><br><small>${esc(x.actorEmail||'')}</small></td><td>${esc(x.surveyTitle||x.surveyId||'系統層級')}</td><td>${esc(x.targetType||'')}／${esc(x.action||'')}${x.detailVersion?`<br><small>${esc(x.detailVersion)}</small>`:''}</td><td>${renderDiff(x)}</td></tr>`));
    box.innerHTML=html+`<div class="logPager"><span>共 ${rows.length} 筆，第 ${logPage} / ${pages} 頁</span><div><button class="btn logPrevPage" ${logPage<=1?'disabled':''}>上一頁</button><button class="btn logNextPage" ${logPage>=pages?'disabled':''}>下一頁</button></div></div><small class="muted">操作紀錄顯示器：${VERSION}</small>`;
    box.querySelector('.logPrevPage')?.addEventListener('click',()=>{if(logPage>1){logPage--;renderLogs()}});
    box.querySelector('.logNextPage')?.addEventListener('click',()=>{if(logPage<pages){logPage++;renderLogs()}});
  }
  async function loadLogs(showMessage){
    let box=$('logTable');if(box)box.innerHTML='<div class="muted">正在載入操作紀錄…</div>';
    try{
      let db=firebase.firestore();
      let [auditSnap,loginSnap,surveySnap]=await Promise.all([
        db.collection(AUDIT_COLLECTION).get(),
        db.collection(LOGIN_COLLECTION).get().catch(()=>({docs:[]})),
        db.collection('surveys').get().catch(()=>({docs:[]}))
      ]);
      let surveys={};
      surveySnap.docs.forEach(d=>{let x=d.data();surveys[d.id]=x.title||d.id});
      auditRows=auditSnap.docs.map(d=>({id:d.id,...d.data(),surveyTitle:surveys[d.data().surveyId]||''}));
      loginRows=loginSnap.docs.map(d=>({id:d.id,...d.data()}));
      renderLogs();
      if(showMessage&&window.toast)window.toast('紀錄已更新');
    }catch(e){
      console.error('[audit patch] load failed',e);
      if(box)box.innerHTML='<div class="notice">操作紀錄載入失敗，請確認 Firestore 規則。</div>';
    }
  }
  function installLogRenderer(){
    window.renderLogsV711=renderLogs;
    window.loadLogsV711=loadLogs;
    ['logTypeFilter','logSearch','logDateFilter'].forEach(id=>{
      let el=$(id);if(!el||el.dataset.auditPatchV743)return;
      el.dataset.auditPatchV743='1';
      el.addEventListener(id==='logSearch'?'input':'change',()=>{logPage=1;renderLogs()});
    });
    if(location.hash.includes('logP')||$('logP')?.classList.contains('active'))loadLogs(false);
  }
  function installLegacyAuditSuppressor(){
    if(typeof window.writeAuditV711!=='function'||window.writeAuditV711.__auditPatchV743)return;
    const original=window.writeAuditV711;
    const legacyTargets=new Set(['活動','日期','餐廳','人員','問卷','最終決議','活動權限','預算','填寫資格','預算資格']);
    const legacyActions=new Set(['建立','新增','修改','刪除','指派','移除','啟用','停用']);
    window.writeAuditV711=async function(action,targetType,targetId,summary,surveyId,detail){
      let hasDetail=detail&&typeof detail==='object'&&(
        Array.isArray(detail.changes)||detail.beforeSummary||detail.afterSummary
      );
      if(!hasDetail&&legacyTargets.has(String(targetType||''))&&legacyActions.has(String(action||''))){
        console.info('[audit patch] skip legacy summary-only audit:',action,targetType,summary);
        return;
      }
      return original.apply(this,arguments);
    };
    window.writeAuditV711.__auditPatchV743=true;
  }
  function boot(){
    let badge=$('staticVersionBadge');
    if(badge)badge.remove();
    installFirestoreAudit();
    installLegacyAuditSuppressor();
    installLogRenderer();
  }
  window.auditLogPatchV743={boot,loadLogs,renderLogs};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);
  setTimeout(boot,1500);
  setTimeout(boot,3000);
})();

