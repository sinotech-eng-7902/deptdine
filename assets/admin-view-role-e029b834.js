/* 系統管理員檢視身分切換：保留原登入者，依選定角色套用實際前端權限。 */
(() => {
  const MODULE_VERSION='10.30';
  const SESSION_KEY='deptdineViewRoleV1009';
  const ROLE_LABELS={system:'系統管理員',manager:'活動管理員',viewer:'活動檢視者'};
  let actualSystemAdmin=false;
  let selectedRole='system';
  let selectedSurveyId='';
  let switching=false;
  let surveyCatalog=[];

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
    const rows=enabledAssignments(role);
    if(!rows.length)return{role:'system',surveyId:''};
    const id=rows.some(item=>String(item.surveyId||'')===String(surveyId||''))?String(surveyId):String(rows[0].surveyId||'');
    return{role,surveyId:id};
  }
  function applyRoleState(){
    isSystemAdmin=actualSystemAdmin&&selectedRole==='system';
    if(actualSystemAdmin&&selectedRole!=='system')currentAccessRole=selectedRole;
  }
  function activeRoleLabel(){return ROLE_LABELS[selectedRole]||ROLE_LABELS.system}
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
    const result=await loadAllBeforeViewRole();
    if(actualSystemAdmin)surveyCatalog=[...D.surveys];
    if(!actualSystemAdmin||selectedRole==='system')return result;
    const allowedIds=new Set(enabledAssignments(selectedRole).map(item=>String(item.surveyId||'')));
    D.surveys=D.surveys.filter(item=>allowedIds.has(String(item.id)));
    if(!D.surveys.some(item=>item.id===selectedSurveyId))selectedSurveyId=D.surveys[0]?.id||'';
    if(!D.surveys.some(item=>item.id===activeSurveyId))activeSurveyId=selectedSurveyId||D.surveys[0]?.id||null;
    if(activeSurveyId!==selectedSurveyId&&selectedSurveyId)activeSurveyId=selectedSurveyId;
    await loadSurveyData();
    currentAccessRole=selectedRole;
    if(selectedRole==='viewer')D.memberAccounts=[];
    return result;
  };
  window.loadAll=loadAll;

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
    if(!actualSystemAdmin)return;
    const dialog=ensureDialog();
    ['system','manager','viewer'].forEach(role=>{
      const count=role==='system'?1:enabledAssignments(role).length;
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
    if(!actualSystemAdmin||switching)return;
    const next=normalizeSelection(role,surveyId);
    if(role!=='system'&&next.role==='system')return alert('目前沒有可使用此身分管理或檢視的活動。');
    switching=true;
    try{
      const simulated=document.getElementById('simulateMemberSelectV807')?.value;
      if(simulated&&typeof clearSimulatedMemberV807==='function')await clearSimulatedMemberV807();
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
    const labels=document.querySelector('.topUserLabels');
    if(labels){
      labels.classList.toggle('viewRoleTriggerV1009',actualSystemAdmin);
      labels.tabIndex=actualSystemAdmin?0:-1;
      labels.setAttribute('role',actualSystemAdmin?'button':'group');
      labels.setAttribute('aria-label',actualSystemAdmin?'切換檢視身分':'目前帳號身分');
      labels.title=actualSystemAdmin?'切換檢視身分':'';
      if(actualSystemAdmin&&!labels.dataset.viewRoleBound){
        labels.dataset.viewRoleBound='true';
        labels.addEventListener('click',openViewRoleDialog);
        labels.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openViewRoleDialog()}});
      }
    }
    if(adminRole&&actualSystemAdmin)adminRole.textContent=activeRoleLabel();
    const mobilePanel=document.querySelector('#mobileAccountMenuV929 .mobileAccountPanelV929');
    if(mobilePanel){
      let button=mobilePanel.querySelector('.mobileViewRoleButtonV1009');
      if(!button){
        button=document.createElement('button');button.type='button';button.className='mobileViewRoleButtonV1009';button.textContent='切換檢視身分';
        button.addEventListener('click',()=>{const menu=document.getElementById('mobileAccountMenuV929');if(menu)menu.open=false;openViewRoleDialog()});
        mobilePanel.insertBefore(button,mobilePanel.querySelector('.mobileSimulateButtonV929'));
      }
      button.hidden=!actualSystemAdmin;
      const identity=mobilePanel.querySelector('.mobileAccountIdentityV929 small');if(identity&&actualSystemAdmin)identity.textContent=activeRoleLabel();
    }
  }

  const applyAccessUIBeforeViewRole=applyAccessUI;
  applyAccessUI=function(){const result=applyAccessUIBeforeViewRole();syncViewRoleUI();return result};
  window.applyAccessUI=applyAccessUI;
  const renderAdminBeforeViewRole=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeViewRole();syncViewRoleUI();return result};
  window.renderAdmin=renderAdmin;
  const logoutBeforeViewRole=logout;
  logout=async function(){clearSession();actualSystemAdmin=false;selectedRole='system';selectedSurveyId='';return logoutBeforeViewRole()};
  window.logout=logout;

  window.AdminViewRole=Object.freeze({version:MODULE_VERSION,open:openViewRoleDialog,switchRole:switchViewRole,isActualSystemAdmin:()=>actualSystemAdmin,currentRole:()=>selectedRole});
})();



