/* 相容層：活動列表與專注編輯介面。 */

/* ===== 活動列表標題與說明統一 ===== */
(() => {
  function normalizeSurveyListHeaderV957(){
    const header=document.querySelector('#surveyP .surveyListHeaderV956');
    if(!header)return;
    const titleGroup=header.firstElementChild;
    let description=null;
    if(titleGroup){
      titleGroup.classList.remove('surveyListHead','surveyListHeadV777');
      const title=titleGroup.querySelector('h3');
      description=titleGroup.querySelector('p');
      if(title)title.textContent='活動列表';
      if(description){
        description.className='muted surveyListDescriptionV957';
        description.textContent='管理我發起、被分享及已結案的活動；「目前使用中」代表前台連結正在使用的活動。';
      }
    }
    document.querySelectorAll('#surveyP .surveyListDescV777,#surveyP .surveyListInfoTipV776').forEach(element=>element.remove());
    document.querySelectorAll('#surveyP p').forEach(element=>{
      if(element!==description&&element.textContent.includes('「目前使用中」代表前台連結正在使用的活動'))element.remove();
    });
  }
  const renderSurveyPanelBaseV957=renderSurveyPanel;
  renderSurveyPanel=function(){
    const result=renderSurveyPanelBaseV957();
    normalizeSurveyListHeaderV957();
    return result;
  };
  const renderAdminBaseV957=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBaseV957();
    normalizeSurveyListHeaderV957();
    return result;
  };
  window.renderSurveyPanel=renderSurveyPanel;
  window.renderAdmin=renderAdmin;
  window.normalizeSurveyListHeaderV957=normalizeSurveyListHeaderV957;
})();

/* ===== 活動新增與編輯專注模式 ===== */
(() => {
  function syncSurveyFocusModeV973(){
    const editor=document.getElementById('surveyEditor');
    const card=editor?.closest('.card');
    if(!editor||!card)return;
    const editing=surveyFormMode==='new'||surveyFormMode==='edit';
    const wasEditing=card.classList.contains('surveyFocusModeV973');
    if(editing&&!wasEditing)card.dataset.surveyReturnScrollV973=String(Math.max(0,window.scrollY||0));
    card.classList.toggle('surveyFocusModeV973',editing);
    card.dataset.surveyViewMode=editing?'editing':'list';
    if(!editing&&wasEditing){
      const returnScroll=Number(card.dataset.surveyReturnScrollV973||0);
      delete card.dataset.surveyReturnScrollV973;
      window.requestAnimationFrame(()=>window.scrollTo({top:returnScroll,behavior:'auto'}));
    }
  }
  const renderSurveyPanelBaseV973=renderSurveyPanel;
  renderSurveyPanel=function(){
    const result=renderSurveyPanelBaseV973();
    syncSurveyFocusModeV973();
    return result;
  };
  const renderAdminBaseV973=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBaseV973();
    syncSurveyFocusModeV973();
    return result;
  };
  window.renderSurveyPanel=renderSurveyPanel;
  window.renderAdmin=renderAdmin;
  window.syncSurveyFocusModeV973=syncSurveyFocusModeV973;
})();
