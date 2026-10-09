/* admin-view-role-49761920.js */
/* 系統管理員檢視身分切換：保留原登入者，依選定角色套用實際前端權限。 */
(() => {
  const MODULE_VERSION='10.56';
  const SESSION_KEY='deptdineViewRoleV1009';
  const ROLE_LABELS={system:'系統管理員',manager:'活動管理員',viewer:'活動檢視者'};
  let actualSystemAdmin=false;
  let selectedRole='system';
  let selectedSurveyId='';
  let switching=false;
  let surveyCatalog=[];
  let surveyCatalogReady=false;

  function enabledAssignments(role=''){
    return surveyAssignments.filter(item=>item.enabled!==false&&(!role||item.role===role));
  }
  function roleSurveys(role){
    const ids=new Set(enabledAssignments(role).map(item=>String(item.surveyId||'')));
    return surveyCatalog.filter(item=>ids.has(String(item.id)));
  }
  function readSession(){
    try{
      const value=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');
      return value&&['system','manager','viewer'].includes(value.role)?value:null;
    }catch(e){return null}
  }
  function writeSession(){
    try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({role:selectedRole,surveyId:selectedSurveyId}))}catch(e){}
  }
  function clearSession(){try{sessionStorage.removeItem(SESSION_KEY)}catch(e){}}
  function normalizeSelection(role,surveyId=''){
    if(!actualSystemAdmin||role==='system')return{role:'system',surveyId:''};
    const ids=surveyCatalogReady
      ?roleSurveys(role).map(item=>String(item.id||''))
      :[...new Set(enabledAssignments(role).map(item=>String(item.surveyId||'')).filter(Boolean))];
    if(!ids.length)return{role:'system',surveyId:''};
    const id=ids.includes(String(surveyId||''))?String(surveyId):ids[0];
    return{role,surveyId:id};
  }
  function applyRoleState(){
    isSystemAdmin=actualSystemAdmin&&selectedRole==='system';
    if(actualSystemAdmin&&selectedRole!=='system')currentAccessRole=selectedRole;
  }
  function activeRoleLabel(){return ROLE_LABELS[selectedRole]||ROLE_LABELS.system}
  function simulatedMemberActive(){return !!document.getElementById('simulateMemberSelectV807')?.value}
  function canOpenViewRole(){return actualSystemAdmin&&!simulatedMemberActive()}
  const resolveAccessBeforeViewRole=resolveAccess;
  resolveAccess=async function(email,uid){
    await resolveAccessBeforeViewRole(email,uid);
    actualSystemAdmin=!!isSystemAdmin;
    if(!actualSystemAdmin){selectedRole=isSystemAdmin?'system':(currentAccessRole||'viewer');selectedSurveyId=activeSurveyId||'';return}
    const saved=readSession();
    const next=normalizeSelection(saved?.role||'system',saved?.surveyId||'');
    selectedRole=next.role;selectedSurveyId=next.surveyId;
    applyRoleState();
  };
  window.resolveAccess=resolveAccess;

  const loadAllBeforeViewRole=loadAll;
  loadAll=async function(){
    const preferredId=actualSystemAdmin&&selectedRole!=='system'?String(activeSurveyId||selectedSurveyId||''):'';
    const result=await loadAllBeforeViewRole();
    if(actualSystemAdmin){surveyCatalog=[...D.surveys];surveyCatalogReady=true}
    if(!actualSystemAdmin||selectedRole==='system')return result;
    const allowedIds=new Set(enabledAssignments(selectedRole).map(item=>String(item.surveyId||'')));
    D.surveys=D.surveys.filter(item=>allowedIds.has(String(item.id)));
    // Older loaders may prefer the previous URL. Keep an explicitly chosen or newly created activity.
    if(preferredId&&D.surveys.some(item=>String(item.id)===preferredId))activeSurveyId=preferredId;
    if(!D.surveys.some(item=>item.id===selectedSurveyId))selectedSurveyId=D.surveys[0]?.id||'';
    if(!D.surveys.some(item=>item.id===activeSurveyId))activeSurveyId=selectedSurveyId||D.surveys[0]?.id||null;
    if(activeSurveyId)selectedSurveyId=String(activeSurveyId);
    writeSession();
    await loadSurveyData();
    currentAccessRole=selectedRole;
    if(selectedRole==='viewer')D.memberAccounts=[];
    return result;
  };
  window.loadAll=loadAll;

  const setActiveSurveyBeforeViewRole=setActiveSurvey;
  setActiveSurvey=async function(id){
    const result=await setActiveSurveyBeforeViewRole(id);
    const currentId=String(activeSurveyId||'');
    const requestedId=String(id||'');
    const allowed=enabledAssignments(selectedRole).some(item=>String(item.surveyId||'')===currentId);
    if(actualSystemAdmin&&selectedRole!=='system'&&currentId&&currentId===requestedId&&allowed){
      selectedSurveyId=currentId;
      writeSession();
    }
    return result;
  };
  window.setActiveSurvey=setActiveSurvey;

  function ensureAllowedPanel(){
    const current=document.querySelector('.panel.active');
    const managerOnly=['surveyP','memP','dateP','restP','costP','mailP','finalP'];
    const systemOnly=['sysMemP','frontProtectP','featureSettingsP','logP'];
    if(!current)return;
    if((selectedRole==='viewer'&&managerOnly.includes(current.id))||(selectedRole!=='system'&&systemOnly.includes(current.id))){
      document.querySelectorAll('.panel').forEach(item=>item.classList.remove('active'));
      document.getElementById('dash')?.classList.add('active');
      document.querySelectorAll('.nav').forEach(item=>item.classList.remove('active'));
      const dashboard=[...document.querySelectorAll('.nav')].find(item=>item.textContent.trim()==='儀表板');
      dashboard?.classList.add('active');
      if(adminTitle)adminTitle.textContent='儀表板';
    }
  }

  function ensureDialog(){
    let dialog=document.getElementById('viewRoleDialogV1009');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='viewRoleDialogV1009';
    dialog.className='viewRoleDialogV1009';
    dialog.innerHTML=`<form method="dialog" class="viewRoleDialogCardV1009">
      <div class="viewRoleDialogHeadV1009"><div><h2>切換檢視身分</h2><p>以不同角色實際操作系統，權限與可查看活動會同步調整。</p></div><button class="viewRoleCloseV1009" value="cancel" aria-label="關閉">×</button></div>
      <div class="viewRoleOptionsV1009" role="radiogroup" aria-label="檢視身分">
        <label class="viewRoleOptionV1009" data-role="system"><input type="radio" name="viewRoleV1009" value="system"><span><b>系統管理員</b><small>使用完整系統管理權限</small></span></label>
        <label class="viewRoleOptionV1009" data-role="manager"><input type="radio" name="viewRoleV1009" value="manager"><span><b>活動管理員</b><small>管理被分享的活動與填寫結果</small></span><em></em></label>
        <label class="viewRoleOptionV1009" data-role="viewer"><input type="radio" name="viewRoleV1009" value="viewer"><span><b>活動檢視者</b><small>僅查看被分享的活動與結果</small></span><em></em></label>
      </div>
      <label class="viewRoleSurveyFieldV1009" for="viewRoleSurveyV1009"><span>進入活動</span><select id="viewRoleSurveyV1009"></select></label>
      <div class="viewRoleDialogActionsV1009"><button class="btn" value="cancel">取消</button><button id="applyViewRoleV1009" class="btn primary" type="button">套用身分</button></div>
    </form>`;
    document.body.appendChild(dialog);
    const syncSurvey=()=>renderDialogSurveyOptions(dialog.querySelector('input[name="viewRoleV1009"]:checked')?.value||'system');
    dialog.querySelectorAll('input[name="viewRoleV1009"]').forEach(input=>input.addEventListener('change',syncSurvey));
    dialog.querySelector('#applyViewRoleV1009').addEventListener('click',async()=>{
      const role=dialog.querySelector('input[name="viewRoleV1009"]:checked')?.value||'system';
      const surveyId=dialog.querySelector('#viewRoleSurveyV1009').value||'';
      await switchViewRole(role,surveyId);
      if(dialog.open)dialog.close();
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
    return dialog;
  }
  function renderDialogSurveyOptions(role){
    const dialog=ensureDialog(),field=dialog.querySelector('.viewRoleSurveyFieldV1009'),select=dialog.querySelector('#viewRoleSurveyV1009');
    if(role==='system'){field.hidden=true;select.innerHTML='';return}
    const surveys=roleSurveys(role);
    field.hidden=false;
    select.innerHTML=surveys.map(item=>`<option value="${escAttr(item.id)}">${esc(item.title||item.id)}</option>`).join('');
    const preferred=role===selectedRole?selectedSurveyId:'';
    if(surveys.some(item=>item.id===preferred))select.value=preferred;
  }
  function openViewRoleDialog(){
    if(!canOpenViewRole())return;
    const dialog=ensureDialog();
    ['system','manager','viewer'].forEach(role=>{
      const count=role==='system'?1:roleSurveys(role).length;
      const option=dialog.querySelector(`[data-role="${role}"]`),input=option.querySelector('input'),counter=option.querySelector('em');
      input.disabled=!count;
      option.classList.toggle('isDisabled',!count);
      if(counter)counter.textContent=count?`${count} 個活動`:'尚未被分享';
    });
    const checked=dialog.querySelector(`input[value="${selectedRole}"]`)||dialog.querySelector('input[value="system"]');
    checked.checked=true;
    renderDialogSurveyOptions(checked.value);
    dialog.showModal();
    setTimeout(()=>checked.focus(),0);
  }

  async function switchViewRole(role,surveyId=''){
    if(!canOpenViewRole()||switching)return;
    const next=normalizeSelection(role,surveyId);
    if(role!=='system'&&next.role==='system')return alert('目前沒有可使用此身分管理或檢視的活動。');
    switching=true;
    try{
      selectedRole=next.role;selectedSurveyId=next.surveyId;
      applyRoleState();writeSession();
      if(selectedRole!=='system')activeSurveyId=selectedSurveyId;
      await loadAll();
      ensureAllowedPanel();
      history.replaceState(null,'',adminHash());
      renderFront();renderAdmin();
      toast(`已切換為${activeRoleLabel()}`);
    }catch(e){
      console.error('switch view role failed',e);
      alert('身分切換失敗，請稍後再試一次。');
    }finally{switching=false}
  }

  function syncViewRoleUI(){
    document.getElementById('viewRoleBannerV1009')?.remove();
    const canSwitch=canOpenViewRole();
    const labels=document.querySelector('.topUserLabels');
    if(labels){
      labels.classList.toggle('viewRoleTriggerV1009',canSwitch);
      labels.tabIndex=canSwitch?0:-1;
      labels.setAttribute('role',canSwitch?'button':'group');
      labels.setAttribute('aria-label',canSwitch?'切換檢視身分':'目前帳號身分');
      labels.title=canSwitch?'切換檢視身分':'';
      if(canSwitch&&!labels.dataset.viewRoleBound){
        labels.dataset.viewRoleBound='true';
        labels.addEventListener('click',openViewRoleDialog);
        labels.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openViewRoleDialog()}});
      }
    }
    if(adminRole&&actualSystemAdmin&&!simulatedMemberActive())adminRole.textContent=activeRoleLabel();
    const mobilePanel=document.querySelector('#mobileAccountMenuV929 .mobileAccountPanelV929');
    if(mobilePanel){
      let button=mobilePanel.querySelector('.mobileViewRoleButtonV1009');
      if(!button){
        button=document.createElement('button');button.type='button';button.className='mobileViewRoleButtonV1009';button.textContent='切換檢視身分';
        button.addEventListener('click',()=>{const menu=document.getElementById('mobileAccountMenuV929');if(menu)menu.open=false;openViewRoleDialog()});
        mobilePanel.insertBefore(button,mobilePanel.querySelector('.mobileSimulateButtonV929'));
      }
      button.hidden=!canSwitch;
      const identity=mobilePanel.querySelector('.mobileAccountIdentityV929 small');if(identity&&actualSystemAdmin&&!simulatedMemberActive())identity.textContent=activeRoleLabel();
    }
  }

  const applyAccessUIBeforeViewRole=applyAccessUI;
  applyAccessUI=function(){const result=applyAccessUIBeforeViewRole();syncViewRoleUI();return result};
  window.applyAccessUI=applyAccessUI;
  const renderAdminBeforeViewRole=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeViewRole();syncViewRoleUI();return result};
  window.renderAdmin=renderAdmin;
  const logoutBeforeViewRole=logout;
  logout=async function(){clearSession();actualSystemAdmin=false;selectedRole='system';selectedSurveyId='';surveyCatalog=[];surveyCatalogReady=false;return logoutBeforeViewRole()};
  window.logout=logout;

  window.AdminViewRole=Object.freeze({version:MODULE_VERSION,open:openViewRoleDialog,switchRole:switchViewRole,isActualSystemAdmin:()=>actualSystemAdmin,canOpen:canOpenViewRole,currentRole:()=>selectedRole});
})();











;
/* admin-title-style-74a50da3.js */
/* v10.09 independent front-title styles and cover upload. */
(() => {
  const VERSION='10.56';
  const STYLE_OPTIONS={
    theme:{label:'主題原樣',description:'維持目前主題既有的標題區外觀。'},
    minimal:{label:'精簡標題',description:'白底、細色線，適合正式行政調查。'},
    gradient:{label:'漸層標題',description:'加強主題色層次，適合一般聚餐活動。'},
    image:{label:'圖片封面',description:'使用活動圖片與深色遮罩呈現。'}
  };
  let pendingCoverFile=null;
  let removeCoverRequested=false;
  let localCoverUrl='';
  let editorSessionKey=null;

  function normalizeStyle(value){return STYLE_OPTIONS[value]?value:'theme'}
  function currentSurvey(){return typeof D!=='undefined'&&Array.isArray(D.surveys)?D.surveys.find(item=>item.id===editingSurveyId):null}
  function controls(){return document.getElementById('titleStyleControlV1008')}
  function selectedStyle(){return normalizeStyle(document.querySelector('input[name="titleStyleV1008"]:checked')?.value||'theme')}
  function safeImageUrl(value){
    const raw=String(value||'').trim();
    if(!raw)return'';
    try{const parsed=new URL(raw,location.href);return ['https:','http:','blob:'].includes(parsed.protocol)?parsed.href:''}catch(e){return''}
  }
  function clearLocalCoverUrl(){if(localCoverUrl){URL.revokeObjectURL(localCoverUrl);localCoverUrl=''}}
  function setCoverPreview(url,name){
    const preview=document.getElementById('titleCoverPreviewV1008');
    const nameBox=document.getElementById('titleCoverNameV1008');
    const safe=safeImageUrl(url);
    if(preview){preview.hidden=!safe;preview.style.backgroundImage=safe?`linear-gradient(90deg,rgba(9,28,54,.7),rgba(9,28,54,.28)),url("${safe.replaceAll('"','%22')}")`:''}
    if(nameBox)nameBox.textContent=name||((safe&&!safe.startsWith('blob:'))?'目前已上傳圖片':'尚未選擇圖片');
  }
  function syncCoverPanel(){
    const panel=document.getElementById('titleCoverPanelV1008');
    if(panel)panel.hidden=selectedStyle()!=='image';
  }
  function styleCardHtml(value,data){
    return `<label class="titleStyleChoiceV1008"><input type="radio" name="titleStyleV1008" value="${value}"><span><i class="titleStyleSampleV1008 ${value}" aria-hidden="true"><b></b><em></em></i><strong>${data.label}</strong><small>${data.description}</small></span></label>`;
  }
  function ensureControls(){
    if(controls())return controls();
    const themePreview=document.getElementById('themePreview');
    if(!themePreview)return null;
    const section=document.createElement('section');
    section.id='titleStyleControlV1008';
    section.className='titleStyleControlV1008';
    section.innerHTML=`<div class="titleStyleHeadingV1008"><div><h4>標題區樣式</h4><p>可與上方任何主題自由搭配；主要操作按鈕仍維持系統固定色。</p></div></div><div class="titleStyleChoicesV1008">${Object.entries(STYLE_OPTIONS).map(([value,data])=>styleCardHtml(value,data)).join('')}</div><div id="titleCoverPanelV1008" class="titleCoverPanelV1008" hidden><div id="titleCoverPreviewV1008" class="titleCoverPreviewV1008" hidden><span>活動標題</span><small>圖片封面預覽</small></div><div class="titleCoverActionsV1008"><input id="titleCoverFileV1008" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="chooseTitleCoverV1008" class="btn" type="button">選擇圖片</button><button id="removeTitleCoverV1008" class="btn red" type="button">移除圖片</button><span id="titleCoverNameV1008" class="muted">尚未選擇圖片</span></div><p class="muted">支援 JPG、PNG、WebP；圖片會儲存至 Firebase Storage，前台自動加入深色遮罩以維持文字清楚。</p></div>`;
    themePreview.closest('.field')?.insertAdjacentElement('afterend',section);
    section.querySelectorAll('input[name="titleStyleV1008"]').forEach(input=>input.addEventListener('change',()=>{syncCoverPanel();renderCombinedPreview();if(typeof markSurveyDirty==='function')markSurveyDirty()}));
    const fileInput=document.getElementById('titleCoverFileV1008');
    document.getElementById('chooseTitleCoverV1008')?.addEventListener('click',()=>fileInput?.click());
    fileInput?.addEventListener('change',()=>{
      const file=fileInput.files?.[0];
      if(!file)return;
      if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){fileInput.value='';return alert('請選擇 JPG、PNG 或 WebP 圖片')}
      pendingCoverFile=file;removeCoverRequested=false;clearLocalCoverUrl();localCoverUrl=URL.createObjectURL(file);setCoverPreview(localCoverUrl,file.name);if(typeof markSurveyDirty==='function')markSurveyDirty();
    });
    document.getElementById('removeTitleCoverV1008')?.addEventListener('click',()=>{pendingCoverFile=null;removeCoverRequested=true;clearLocalCoverUrl();if(fileInput)fileInput.value='';setCoverPreview('','尚未選擇圖片');if(typeof markSurveyDirty==='function')markSurveyDirty()});
    return section;
  }
  function renderCombinedPreview(){
    const preview=document.getElementById('themePreview');
    if(preview)preview.dataset.titleStyle=selectedStyle();
  }
  function applyAdminFrontTitleStyle(survey){
    const hero=document.querySelector('#front .hero');if(!hero)return;
    let style=normalizeStyle(survey?.titleStyle||'theme'),image=safeImageUrl(survey?.titleImageUrl);
    if(style==='image'&&!image)style='gradient';
    hero.dataset.titleStyle=style;
    if(style==='image'&&image){hero.style.setProperty('--title-cover-image',`url("${image.replaceAll('"','%22')}")`);hero.classList.add('hasTitleCoverV1008')}
    else{hero.style.removeProperty('--title-cover-image');hero.classList.remove('hasTitleCoverV1008')}
  }
  function syncFromSurvey(survey){
    ensureControls();
    const style=normalizeStyle(survey?.titleStyle||'theme');
    const input=document.querySelector(`input[name="titleStyleV1008"][value="${style}"]`);
    if(input)input.checked=true;
    pendingCoverFile=null;removeCoverRequested=false;clearLocalCoverUrl();
    const fileInput=document.getElementById('titleCoverFileV1008');if(fileInput)fileInput.value='';
    setCoverPreview(safeImageUrl(survey?.titleImageUrl),survey?.titleImageUrl?'目前已上傳圖片':'尚未選擇圖片');
    syncCoverPanel();renderCombinedPreview();
  }
  function syncEditorContext(force=false){
    if(savingTitle)return;
    const mode=typeof surveyFormMode==='string'?surveyFormMode:'view';
    const key=mode+':'+(mode==='edit'?String(editingSurveyId||''):'new');
    if(force||editorSessionKey!==key){
      editorSessionKey=key;
      syncFromSurvey(mode==='edit'?currentSurvey():null);
    }else{
      ensureControls();syncCoverPanel();renderCombinedPreview();
    }
  }
  function findSavedSurvey(beforeIds,wasMode,targetId,title){
    if(wasMode==='edit'&&targetId)return D.surveys.find(item=>item.id===targetId)||null;
    const created=D.surveys.filter(item=>!beforeIds.has(item.id));
    return created[0]||[...D.surveys].reverse().find(item=>item.title===title)||null;
  }
  function sanitizedFileName(name){return String(name||'cover').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-90)||'cover'}
  let savingTitle=false,uploadedCover=null;
  async function uploadCover(surveyId,file){
    if(!firebase.storage)throw new Error('Firebase Storage 尚未載入');
    if(!uploadedCover||uploadedCover.surveyId!==surveyId||uploadedCover.file!==file)uploadedCover={surveyId,file,path:`deptdine/${surveyId}/covers/${Date.now()}_${sanitizedFileName(file.name)}`,putComplete:false};
    const path=uploadedCover.path;
    const reference=firebase.storage().ref(path);
    if(!uploadedCover.putComplete){await reference.put(file,{contentType:file.type});uploadedCover.putComplete=true}
    if(!uploadedCover.url)uploadedCover.url=await reference.getDownloadURL();
    return{url:uploadedCover.url,path};
  }
  async function deleteCover(path){if(!path||!firebase.storage)return;try{await firebase.storage().ref(path).delete()}catch(e){if(e?.code!=='storage/object-not-found')console.warn('移除舊封面圖片失敗',e)}}

  function install(){
    ensureControls();
    if(typeof renderFront==='function'){
      const base=renderFront;
      renderFront=function(){const value=base.apply(this,arguments);applyAdminFrontTitleStyle(typeof activeSurvey==='function'?activeSurvey():null);return value};
      window.renderFront=renderFront;
    }
    if(typeof renderThemePreview==='function'){
      const base=renderThemePreview;
      renderThemePreview=function(){const value=base.apply(this,arguments);ensureControls();renderCombinedPreview();return value};
      window.renderThemePreview=renderThemePreview;
    }
    if(typeof renderSurveyPanel==='function'){
      const base=renderSurveyPanel;
      renderSurveyPanel=function(){
        const expectedKey=surveyFormMode+':'+(editingSurveyId||'new');
        const initialized=typeof surveyEditor!=='undefined'&&surveyEditor?.dataset.formKey===expectedKey;
        const value=base.apply(this,arguments);
        syncEditorContext(surveyFormMode!=='view'&&!initialized);
        return value;
      };
      window.renderSurveyPanel=renderSurveyPanel;
    }
    if(typeof saveSurvey==='function'){
      const base=saveSurvey;
      saveSurvey=async function(){
        if(savingTitle||surveyFormMode==='view')return;
        ensureControls();
        const wasMode=surveyFormMode,targetId=editingSurveyId,title=svTitle?.value?.trim()||'',beforeIds=new Set((D.surveys||[]).map(item=>item.id));
        const oldSurvey=currentSurvey(),oldPath=oldSurvey?.titleImagePath||'',style=selectedStyle(),file=pendingCoverFile,remove=removeCoverRequested;
        const fields=[...surveyEditor.querySelectorAll('input:not([type="file"]),select,textarea')].map(element=>({element,value:element.value,checked:element.checked}));
        savingTitle=true;
        let saved=null;
        try{
          await base.apply(this,arguments);
          if(surveyFormMode!=='view')return;
          saved=findSavedSurvey(beforeIds,wasMode,targetId,title);if(!saved)return;
          surveySaveBtn.disabled=true;surveySaveBtn.textContent='完成標題與封面儲存中…';
          let imageUrl=remove?'':(saved.titleImageUrl||''),imagePath=remove?'':(saved.titleImagePath||'');
          if(file){const uploaded=await uploadCover(saved.id,file);imageUrl=uploaded.url;imagePath=uploaded.path}
          const data={titleStyle:style,titleImageUrl:imageUrl||firebase.firestore.FieldValue.delete(),titleImagePath:imagePath||firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
          await doc('surveys',saved.id).set(data,{merge:true});
          if((file||remove)&&oldPath&&oldPath!==imagePath)await deleteCover(oldPath);
          Object.assign(saved,{titleStyle:style,titleImageUrl:imageUrl,titleImagePath:imagePath});
          pendingCoverFile=null;removeCoverRequested=false;uploadedCover=null;clearLocalCoverUrl();
          savingTitle=false;
          if(typeof renderFront==='function')renderFront();if(typeof renderAdmin==='function')renderAdmin();
          if(file&&typeof toast==='function')toast('活動設定與封面圖片已儲存');
        }catch(error){
          console.error('save title style failed',error);
          if(saved){
            surveyFormMode='edit';editingSurveyId=saved.id;surveyFormDirty=true;
            surveyEditor.dataset.formKey='edit:'+saved.id;editorSessionKey='edit:'+saved.id;
            fields.forEach(({element,value,checked})=>{element.value=value;if(element.type==='checkbox'||element.type==='radio')element.checked=checked});
            pendingCoverFile=file;removeCoverRequested=remove;
            if(file&&!localCoverUrl)localCoverUrl=URL.createObjectURL(file);
            savingTitle=false;renderSurveyPanel();
            if(file)setCoverPreview(localCoverUrl,file.name);
            syncCoverPanel();renderCombinedPreview();
            alert('活動基本資料已儲存，但標題或封面尚未完成。已保留您的設定與圖片，請檢查網路／Storage 規則後，直接按「儲存變更」重試；不會重複建立活動。');
          }else alert('活動儲存未完成，已保留表單內容，請檢查網路後重試。');
        }finally{
          savingTitle=false;surveySaveBtn.disabled=false;
          surveySaveBtn.textContent=surveyFormMode==='edit'?'儲存變更':'建立活動';
          syncEditorContext();
        }
      };
      window.saveSurvey=saveSurvey;
    }
    syncEditorContext();
  }

  window.AdminTitleStyles=Object.freeze({version:VERSION,normalizeStyle,options:STYLE_OPTIONS});
  window.addEventListener('admin:ready',()=>ensureControls());
  install();
})();











;
/* admin-member-roster-v1023-7c7c666e.js */
(function(){
  function checkedDepartments(){return [...document.querySelectorAll('.targetDept:checked')].map(x=>x.value)}
  async function writeRoster(survey,departments,force){
    if(!survey?.id||(!force&&Array.isArray(survey.memberRosterIds)))return;
    let ids=rosterIdsForMembersV1023(D.members,departments);
    await doc('surveys',survey.id).set({memberRosterIds:ids,memberRosterVersion:'v1',memberRosterCapturedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    survey.memberRosterIds=ids;survey.memberRosterVersion='v1';
  }
  function findCreatedSurvey(beforeIds){return D.surveys.find(s=>!beforeIds.has(s.id))||D.surveys.find(s=>s.id===activeSurveyId)}

  if(typeof saveSurvey==='function'){
    const saveSurveyBeforeV1023=saveSurvey;
    saveSurvey=async function(){
      const wasNew=surveyFormMode==='new',beforeIds=new Set(D.surveys.map(s=>s.id)),departments=checkedDepartments();
      const result=await saveSurveyBeforeV1023.apply(this,arguments);
      const created=wasNew?findCreatedSurvey(beforeIds):null;
      if(created&&!beforeIds.has(created.id)){
        try{await writeRoster(created,departments);await loadAll();renderFront();renderAdmin()}
        catch(e){console.error('save activity member roster failed',e);alert('活動已建立，但建立當下的人員名單尚未保存；請檢查網路後重新開啟活動再試。')}
      }
      return result;
    };
    window.saveSurvey=saveSurvey;
  }

  if(typeof duplicateSurveyV719==='function'){
    const duplicateSurveyBeforeV1023=duplicateSurveyV719;
    duplicateSurveyV719=async function(){
      const beforeIds=new Set(D.surveys.map(s=>s.id));
      const result=await duplicateSurveyBeforeV1023.apply(this,arguments);
      const created=findCreatedSurvey(beforeIds);
      if(created&&!beforeIds.has(created.id)){
        try{await writeRoster(created,created.targetDepartments,true);await loadAll();renderFront();renderAdmin()}
        catch(e){console.error('save copied activity member roster failed',e);alert('活動複本已建立，但人員名單尚未保存；請檢查網路後再試。')}
      }
      return result;
    };
    window.duplicateSurveyV719=duplicateSurveyV719;
  }
})();

;
/* admin-live-responses-ec7a653f.js */
/*
 * 目前活動回覆即時同步
 *
 * 保留 loadSurveyData() 的單次查詢作為首次載入與斷線備援；登入後再針對
 * 目前活動建立一條 responses 即時監聽，只更新依賴回覆的畫面區塊。
 */
(() => {
  const MODULE_VERSION='10.56';
  let unsubscribe=null;
  let subscribedSurveyId='';
  let listenerGeneration=0;
  let refreshTimer=null;
  let authObserverInstalled=false;

  function stableValue(value){
    if(value===null||value===undefined)return value;
    if(typeof value?.toMillis==='function')return {__timestamp:value.toMillis()};
    if(Array.isArray(value))return value.map(stableValue);
    if(typeof value==='object')return Object.keys(value).sort().reduce((result,key)=>{result[key]=stableValue(value[key]);return result},{});
    return value;
  }

  function responseSignature(items){
    return JSON.stringify((items||[]).map(item=>stableValue(item)).sort((a,b)=>String(a.id||'').localeCompare(String(b.id||''))));
  }

  function captureResultsState(){
    return {
      missingSearch:document.getElementById('missingSearchV953')?.value||'',
      missingDepartment:document.getElementById('missingDeptFilterV953')?.value||'',
      responseSearch:document.getElementById('responseSearch')?.value||'',
      responseDepartment:document.getElementById('responseDeptFilter')?.value||'',
      responseSort:document.getElementById('responseSort')?.value||'member',
      responseAttendance:document.getElementById('responseAttendanceFilter')?.value||'',
      dateDepartment:document.getElementById('dateStatsDeptFilter')?.value||'',
      expandedResponses:[...document.querySelectorAll('.responseDetailRow:not([hidden])')].map(row=>row.dataset.detailFor).filter(Boolean),
      expandedDates:[...document.querySelectorAll('.dateDecisionItem.isRosterOpen[data-date-id]')].map(item=>item.dataset.dateId).filter(Boolean)
    };
  }

  function restoreControl(id,value){
    const control=document.getElementById(id);
    if(!control)return;
    if(control.type==='checkbox')control.checked=!!value;
    else control.value=value;
  }

  function restoreResultsState(state){
    if(!state)return;
    restoreControl('missingSearchV953',state.missingSearch);
    restoreControl('missingDeptFilterV953',state.missingDepartment);
    restoreControl('responseSearch',state.responseSearch);
    restoreControl('responseDeptFilter',state.responseDepartment);
    restoreControl('responseSort',state.responseSort);
    restoreControl('responseAttendanceFilter',state.responseAttendance);
    restoreControl('dateStatsDeptFilter',state.dateDepartment);
    if(typeof filterMissingRowsV953==='function')filterMissingRowsV953();
    if(typeof filterResponseRows==='function')filterResponseRows();
    if(typeof filterDateStatsDepartmentV711==='function')filterDateStatsDepartmentV711();

    const expandedResponses=new Set(state.expandedResponses);
    document.querySelectorAll('.responseDetailRow[data-detail-for]').forEach(detail=>{
      if(!expandedResponses.has(detail.dataset.detailFor))return;
      detail.hidden=false;
      const row=document.querySelector(`.responseRow[data-response-id="${CSS.escape(detail.dataset.detailFor)}"]`);
      const button=row?.querySelector('.responseExpandButton');
      button?.classList.add('open');
      button?.setAttribute('aria-expanded','true');
    });
    const expandedDates=new Set(state.expandedDates);
    document.querySelectorAll('.dateDecisionItem[data-date-id]').forEach(item=>{
      if(!expandedDates.has(item.dataset.dateId)||item.classList.contains('isRosterOpen'))return;
      const button=item.querySelector('.dateRosterToggleV953');
      if(button&&typeof toggleDateRosterV953==='function')toggleDateRosterV953(button);
    });
  }

  function refreshMailRecipients(){
    const list=document.getElementById('mailRecipientListV957');
    const type=document.getElementById('mailTypeV957')?.value||'invitation';
    if(!list||type!=='reminder'||typeof renderMailRecipientListV957!=='function')return;
    const existingChecks=[...list.querySelectorAll('.mailRecipientCheckV957')];
    const selectedIds=new Set(existingChecks.filter(input=>input.checked).map(input=>String(input.value)));
    const hadExistingRows=existingChecks.length>0;
    renderMailRecipientListV957(type);
    if(hadExistingRows){
      list.querySelectorAll('.mailRecipientCheckV957').forEach(input=>{input.checked=selectedIds.has(String(input.value))});
      if(typeof updateMailRecipientCountV957==='function')updateMailRecipientCountV957();
    }
  }

  function refreshResponseViews(){
    const state=captureResultsState();
    const scrollX=window.scrollX,scrollY=window.scrollY;
    if(typeof renderDashboard==='function')renderDashboard();
    if(typeof renderResults==='function')renderResults();
    restoreResultsState(state);
    if(typeof renderCostEstimatePanel==='function')renderCostEstimatePanel();
    if(typeof renderFinalAttendancePreview==='function')renderFinalAttendancePreview();
    refreshMailRecipients();
    requestAnimationFrame(()=>window.scrollTo(scrollX,scrollY));
    window.dispatchEvent(new CustomEvent('admin:responses-updated',{detail:{surveyId:subscribedSurveyId,count:D.responses.length}}));
  }

  function scheduleResponseViewRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refreshResponseViews,80);
  }

  function acceptSnapshot(surveyId,generation,snapshot){
    if(generation!==listenerGeneration||String(activeSurveyId||'')!==surveyId)return;
    const nextResponses=snapshot.docs.map(documentSnapshot=>({id:documentSnapshot.id,...documentSnapshot.data()}));
    if(responseSignature(nextResponses)===responseSignature(D.responses))return;
    D.responses=nextResponses;
    scheduleResponseViewRefresh();
  }

  function stopActiveResponseListener(){
    listenerGeneration++;
    subscribedSurveyId='';
    clearTimeout(refreshTimer);
    refreshTimer=null;
    if(unsubscribe){try{unsubscribe()}catch(error){console.warn('停止回覆即時監聽失敗',error)}}
    unsubscribe=null;
    document.documentElement.dataset.responseSync='idle';
  }

  function installAuthObserver(){
    if(authObserverInstalled||!auth?.onAuthStateChanged)return;
    authObserverInstalled=true;
    auth.onAuthStateChanged(user=>{if(!user)stopActiveResponseListener()});
  }

  function ensureActiveResponseListener(){
    installAuthObserver();
    const surveyId=String(activeSurveyId||'');
    if(!ready||!currentUser||!isAdmin||!surveyId){stopActiveResponseListener();return}
    if(unsubscribe&&subscribedSurveyId===surveyId)return;
    stopActiveResponseListener();
    subscribedSurveyId=surveyId;
    const generation=listenerGeneration;
    document.documentElement.dataset.responseSync='connecting';
    unsubscribe=col('responses').where('surveyId','==',surveyId).onSnapshot(
      snapshot=>{
        if(generation!==listenerGeneration)return;
        document.documentElement.dataset.responseSync='live';
        acceptSnapshot(surveyId,generation,snapshot);
      },
      error=>{
        if(generation!==listenerGeneration)return;
        console.warn('目前活動回覆即時同步暫時無法使用，保留手動重新整理功能。',error);
        document.documentElement.dataset.responseSync='fallback';
      }
    );
  }

  const renderAdminBeforeLiveResponses=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBeforeLiveResponses();
    setTimeout(ensureActiveResponseListener,0);
    return result;
  };
  window.renderAdmin=renderAdmin;

  const loadSurveyDataBeforeLiveResponses=loadSurveyData;
  loadSurveyData=async function(){
    const result=await loadSurveyDataBeforeLiveResponses.apply(this,arguments);
    setTimeout(ensureActiveResponseListener,0);
    return result;
  };
  window.loadSurveyData=loadSurveyData;

  const logoutBeforeLiveResponses=logout;
  logout=async function(){
    stopActiveResponseListener();
    return logoutBeforeLiveResponses();
  };
  window.logout=logout;

  window.AdminLiveResponses=Object.freeze({version:MODULE_VERSION,ensure:ensureActiveResponseListener,stop:stopActiveResponseListener});
})();













