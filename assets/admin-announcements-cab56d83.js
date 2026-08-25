/* 相容層：登入首頁公告與最終決議同步。 */


/* ===== Current feature module: home announcement and final decision ===== */
(() => {
  const HOME_ANNOUNCEMENT_SETTING_ID='homeAnnouncements';
  const HOME_ANNOUNCEMENT_MODES=new Set(['cards','list','paused']);
  let homeAnnouncementMode='paused';
  let homeAnnouncementDraftMode='paused';
  let homeAnnouncementModeDirty=false;
  let homeAnnouncementSettingUid='';
  let homeAnnouncementSettingUnsubscribe=null;
  let homeAnnouncementSettingBusy=false;

  function normalizeHomeAnnouncementMode(value){
    const mode=String(value||'paused');
    return HOME_ANNOUNCEMENT_MODES.has(mode)?mode:'paused';
  }
  function syncHomeAnnouncementSetting(){
    const visibleMode=homeAnnouncementModeDirty?homeAnnouncementDraftMode:homeAnnouncementMode;
    const input=document.querySelector(`input[name="homeAnnouncementMode"][value="${visibleMode}"]`);
    if(input)input.checked=true;
    const status=document.getElementById('homeAnnouncementModeStatus');
    if(status){
      status.textContent=homeAnnouncementModeDirty?'尚未儲存':homeAnnouncementMode==='cards'?'卡片式':homeAnnouncementMode==='list'?'清單表格式':'暫停使用';
      status.className='badge '+(homeAnnouncementModeDirty?'amber':homeAnnouncementMode==='paused'?'gray':'green');
    }
    const saveState=document.getElementById('homeAnnouncementSaveStateV943');
    if(saveState&&!homeAnnouncementSettingBusy){
      saveState.textContent=homeAnnouncementModeDirty?'尚未儲存':'';
      saveState.className='featureSettingSaveStateV943'+(homeAnnouncementModeDirty?' isDirty':'');
    }
    const button=document.getElementById('saveHomeAnnouncementSetting');
    if(button&&!homeAnnouncementSettingBusy){
      button.textContent=homeAnnouncementModeDirty?'儲存變更':'儲存設定';
      button.classList.toggle('isDirty',homeAnnouncementModeDirty);
    }
    const pauseHint=document.getElementById('homeAnnouncementPauseHintV943');
    if(pauseHint)pauseHint.hidden=visibleMode!=='paused';
    syncFinalHomeAnnouncementState();
  }
  function ensureHomeAnnouncementSetting(){
    if(!currentUser?.uid||!db)return;
    if(homeAnnouncementSettingUid===currentUser.uid&&homeAnnouncementSettingUnsubscribe)return;
    if(homeAnnouncementSettingUnsubscribe)homeAnnouncementSettingUnsubscribe();
    homeAnnouncementSettingUid=currentUser.uid;
    homeAnnouncementSettingUnsubscribe=doc('systemSettings',HOME_ANNOUNCEMENT_SETTING_ID).onSnapshot(snapshot=>{
      homeAnnouncementMode=normalizeHomeAnnouncementMode(snapshot.exists?snapshot.data()?.mode:'paused');
      homeAnnouncementDraftMode=homeAnnouncementMode;
      homeAnnouncementModeDirty=false;
      syncHomeAnnouncementSetting();
    },error=>{
      console.warn('home announcement setting load failed',error);
      homeAnnouncementMode='paused';
      homeAnnouncementDraftMode='paused';
      homeAnnouncementModeDirty=false;
      syncHomeAnnouncementSetting();
    });
  }
  async function saveHomeAnnouncementSetting(){
    if(!isSystemAdmin)return toast('此功能僅限系統管理員');
    const selected=document.querySelector('input[name="homeAnnouncementMode"]:checked');
    const button=document.getElementById('saveHomeAnnouncementSetting');
    if(!selected||!button||homeAnnouncementSettingBusy)return;
    homeAnnouncementSettingBusy=true;
    button.disabled=true;
    button.textContent='儲存中…';
    try{
      const mode=normalizeHomeAnnouncementMode(selected.value);
      await doc('systemSettings',HOME_ANNOUNCEMENT_SETTING_ID).set({
        mode,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedByUid:currentUser?.uid||'',
        updatedByEmail:String(currentUser?.email||'').trim().toLowerCase()
      },{merge:true});
      homeAnnouncementMode=mode;
      homeAnnouncementDraftMode=mode;
      homeAnnouncementModeDirty=false;
      syncHomeAnnouncementSetting();
      const saveState=document.getElementById('homeAnnouncementSaveStateV943');
      if(saveState){
        saveState.textContent='設定已儲存';
        saveState.className='featureSettingSaveStateV943 isSaved';
        window.setTimeout(()=>{
          if(!homeAnnouncementModeDirty&&saveState.textContent==='設定已儲存')saveState.textContent='';
        },2200);
      }
      toast(mode==='paused'?'登入首頁公告已暫停':'登入首頁公告已切換為'+(mode==='cards'?'卡片式':'清單表格式'));
    }catch(error){
      console.error('save home announcement setting failed',error);
      toast(error?.code==='permission-denied'?'公告設定權限遭拒，請先部署 v9.41 Firestore 規則':'公告設定儲存失敗');
    }finally{
      homeAnnouncementSettingBusy=false;
      button.disabled=false;
      button.textContent=homeAnnouncementModeDirty?'儲存變更':'儲存設定';
    }
  }
  function inferEventDateKey(label){
    const raw=String(label||'').trim().replace(/[／]/g,'/').replace(/[－–—]/g,'-');
    let match=raw.match(/(\d{3,4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/)||
      raw.match(/(\d{3,4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    let year,month,day;
    if(match){
      year=Number(match[1]);month=Number(match[2]);day=Number(match[3]);
      if(year<1911)year+=1911;
    }else{
      match=raw.match(/(?:^|\D)(\d{1,2})\s*(?:月|\/|-)\s*(\d{1,2})\s*(?:日)?(?:\D|$)/);
      if(!match)return'';
      month=Number(match[1]);day=Number(match[2]);year=new Date().getFullYear();
      const today=new Date(),candidate=new Date(year,month-1,day);
      const halfYear=183*24*60*60*1000;
      if(candidate.getTime()<today.getTime()-halfYear)year+=1;
    }
    const parsed=new Date(year,month-1,day);
    if(parsed.getFullYear()!==year||parsed.getMonth()!==month-1||parsed.getDate()!==day)return'';
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  function buildPublicAnnouncementPayload(){
    const survey=activeSurvey(),date=D.dates.find(item=>item.id===finalDate.value),restaurant=D.restaurants.find(item=>item.id===finalRest.value);
    const eventDateKey=inferEventDateKey(date?.label||'');
    if(!eventDateKey)return null;
    const address=String(restaurant?.address||'').trim();
    const mapUrl=safeUrl(restaurant?.googleMap||restaurant?.mapUrl)||(
      address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address):''
    );
    return {
      surveyId:activeSurveyId,
      activityName:String(survey?.title||'').trim(),
      dateLabel:String(date?.label||'').trim(),
      eventDateKey,
      restaurantName:String(restaurant?.name||'').trim(),
      restaurantAddress:address,
      mapUrl,
      active:true,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
  }
  function syncFinalHomeAnnouncementState(){
    const input=document.getElementById('finalHomeAnnouncement');
    const paused=homeAnnouncementMode==='paused';
    const locked=document.getElementById('finalLock')?.value==='true';
    if(input){
      input.value=D.final?.showOnHomeAnnouncement===true?'true':'false';
      input.disabled=paused||!locked;
      input.setAttribute('aria-describedby','finalHomeAnnouncementHint');
    }
    const block=document.getElementById('finalHomeAnnouncementBlock');
    if(block){
      block.classList.toggle('isPaused',paused);
      block.classList.toggle('isDependentDisabled',!paused&&!locked);
    }
    const hint=document.getElementById('finalHomeAnnouncementHint');
    if(hint)hint.textContent=paused
      ?'首頁公告目前已暫停；原設定會保留，恢復公告功能後將依此設定顯示。'
      :!locked
        ?'需先將前台顯示狀態設為「已決定並顯示於前台」。'
        :'僅公開活動名稱、最終日期、餐廳與地圖。';
    const shortcut=document.getElementById('homeAnnouncementSettingsShortcut');
    if(shortcut)shortcut.hidden=!(paused&&isSystemAdmin);
  }
  async function saveFinalDecision(){
    if(!activeSurveyId)return alert('請先選擇活動');
    const locked=finalLock.value==='true';
    const publish=locked&&document.getElementById('finalHomeAnnouncement')?.value==='true';
    if(locked&&(!finalDate.value||!finalRest.value))return alert('要顯示於前台時，請先選擇最終日期與餐廳');
    if(publish&&(!locked||!finalDate.value||!finalRest.value))return alert('要顯示於登入首頁公告，請先完成最終日期、最終餐廳，並將前台狀態設為已決定。');
    const announcement=publish?buildPublicAnnouncementPayload():null;
    if(publish&&!announcement)return alert('最終日期文字需包含可辨識的日期，例如「2026年08月12日（三）」或「08/12（三）晚餐」，才能自動隱藏過期公告。');
    if(finalDate.value){
      const date=D.dates.find(item=>item.id===finalDate.value);
      const count=attendeeResponsesForDate(finalDate.value).length;
      const message='確認將「'+(date?.label||'所選日期')+'」設為最終日期？目前共有 '+count+' 人可出席。';
      const confirmed=typeof window.adminConfirmV908==='function'
        ?await window.adminConfirmV908(message,'確認最終決議')
        :window.confirm(message);
      if(!confirmed)return;
    }
    const before=await auditReadDocV760('finalDecision',activeSurveyId);
    const finalPayload={
      surveyId:activeSurveyId,
      finalDateId:finalDate.value,
      finalRestaurantId:finalRest.value,
      note:finalNote.value.trim(),
      locked,
      showOnHomeAnnouncement:publish,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    try{
      const batch=db.batch();
      batch.set(doc('finalDecision',activeSurveyId),finalPayload,{merge:true});
      if(announcement)batch.set(doc('publicAnnouncements',activeSurveyId),announcement,{merge:true});
      else batch.delete(doc('publicAnnouncements',activeSurveyId));
      await batch.commit();
      const after=await auditReadDocV760('finalDecision',activeSurveyId);
      await writeAuditDetailV760({
        action:before?'修改':'新增',
        targetType:'最終決議',
        targetId:activeSurveyId,
        targetLabel:activeSurvey()?.title||activeSurveyId,
        before,
        after,
        fields:['finalDateId','finalRestaurantId','locked','showOnHomeAnnouncement','note'],
        surveyId:activeSurveyId
      });
      await loadSurveyData();
      renderFront();
      renderAdmin();
      toast(publish?'最終決議已更新並發布至登入首頁':'最終決議已更新');
    }catch(error){
      console.error('save final decision and announcement failed',error);
      alert(error?.code==='permission-denied'?'儲存權限遭拒，請先部署 v9.41 Firestore 規則。':'最終決議儲存失敗，請檢查網路後再試一次。');
    }
  }

  const renderFinalPanelBase=renderFinalPanel;
  renderFinalPanel=function(){
    const result=renderFinalPanelBase();
    syncFinalHomeAnnouncementState();
    return result;
  };
  const renderAdminBase=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBase();
    syncFinalHomeAnnouncementState();
    ensureHomeAnnouncementSetting();
    return result;
  };
  document.addEventListener('change',event=>{
    if(event.target?.name==='homeAnnouncementMode'){
      homeAnnouncementDraftMode=normalizeHomeAnnouncementMode(event.target.value);
      homeAnnouncementModeDirty=homeAnnouncementDraftMode!==homeAnnouncementMode;
      syncHomeAnnouncementSetting();
      return;
    }
    if(event.target?.id==='chatEnabledV915'){
      const saved=event.target.dataset.savedChecked==='true';
      window.setFeatureSettingDirty?.('chat',event.target.checked!==saved);
      return;
    }
    if(event.target?.id==='finalLock')syncFinalHomeAnnouncementState();
  });
  saveFinal=saveFinalDecision;
  window.saveFinal=saveFinalDecision;
  window.saveHomeAnnouncementSetting=saveHomeAnnouncementSetting;
  window.renderFinalPanel=renderFinalPanel;
  window.renderAdmin=renderAdmin;
})();


