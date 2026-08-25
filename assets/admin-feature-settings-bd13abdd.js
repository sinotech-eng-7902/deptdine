/* 相容層：功能設定儲存狀態與捷徑。 */

/* ===== Current feature module: settings state and navigation ===== */
(() => {
  const savedStateTimers={};
  function setFeatureSettingDirty(type,dirty,saved=false){
    const isChat=type==='chat';
    const input=isChat?document.getElementById('chatEnabledV915'):null;
    const state=document.getElementById(isChat?'chatSettingSaveStateV943':'homeAnnouncementSaveStateV943');
    const button=document.getElementById(isChat?'saveChatSettingV915':'saveHomeAnnouncementSetting');
    if(isChat&&input&&!dirty)input.dataset.savedChecked=String(input.checked);
    if(state){
      if(saved){
        state.textContent='設定已儲存';
        state.className='featureSettingSaveStateV943 isSaved';
        window.clearTimeout(savedStateTimers[type]);
        savedStateTimers[type]=window.setTimeout(()=>{
          if(!state.classList.contains('isDirty'))state.textContent='';
          state.classList.remove('isSaved');
        },2200);
      }else if(dirty){
        state.textContent='尚未儲存';
        state.className='featureSettingSaveStateV943 isDirty';
      }else if(!state.classList.contains('isSaved')){
        state.textContent='';
        state.className='featureSettingSaveStateV943';
      }
    }
    if(button){
      button.classList.toggle('isDirty',dirty);
      if(!button.disabled)button.textContent=dirty?'儲存變更':'儲存設定';
    }
  }
  function openHomeAnnouncementSettings(){
    if(!isSystemAdmin)return toast('此功能僅限系統管理員');
    const nav=[...document.querySelectorAll('.nav')].find(item=>String(item.getAttribute('onclick')||'').includes("'featureSettingsP'"));
    panel('featureSettingsP',nav||null);
    document.getElementById('featureSettingsP')?.scrollIntoView({block:'start'});
  }
  window.setFeatureSettingDirty=setFeatureSettingDirty;
  window.openHomeAnnouncementSettings=openHomeAnnouncementSettings;
})();


