/* v10.31 日期新增／編輯模式狀態同步。 */
(function(global){
  'use strict';
  const VERSION='10.31';

  function currentDateLabel(){
    if(!editingDateId)return '';
    const item=Array.isArray(D?.dates)?D.dates.find(date=>date.id===editingDateId):null;
    return String(item?.label||newDate?.value||'').trim();
  }

  function syncDateEditorMode(){
    const editing=Boolean(editingDateId);
    if(dateFormHeading)dateFormHeading.textContent=editing?'編輯日期：'+(currentDateLabel()||'目前日期'):'新增日期';
    if(dateModeBadge){
      dateModeBadge.textContent=editing?'編輯模式':'新增模式';
      dateModeBadge.className='modeBadge '+(editing?'edit':'new');
    }
    if(dateSaveBtn&&!dateSaveBtn.disabled)dateSaveBtn.textContent=editing?'儲存變更':'新增日期';
    if(dateCancelBtn){
      dateCancelBtn.textContent='取消編輯';
      dateCancelBtn.hidden=!editing;
      dateCancelBtn.setAttribute('aria-hidden',editing?'false':'true');
    }
    return editing;
  }

  const editDateBase=global.editDate;
  if(typeof editDateBase==='function'){
    global.editDate=function(){
      const result=editDateBase.apply(this,arguments);
      syncDateEditorMode();
      return result;
    };
  }

  const cancelDateEditBase=global.cancelDateEdit;
  if(typeof cancelDateEditBase==='function'){
    global.cancelDateEdit=function(){
      const result=cancelDateEditBase.apply(this,arguments);
      syncDateEditorMode();
      return result;
    };
  }

  const renderDatePanelBase=global.renderDatePanel;
  if(typeof renderDatePanelBase==='function'){
    global.renderDatePanel=function(){
      const result=renderDatePanelBase.apply(this,arguments);
      syncDateEditorMode();
      return result;
    };
  }

  const renderAdminBase=global.renderAdmin;
  if(typeof renderAdminBase==='function'){
    global.renderAdmin=function(){
      const result=renderAdminBase.apply(this,arguments);
      syncDateEditorMode();
      return result;
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncDateEditorMode,{once:true});
  else syncDateEditorMode();

  global.AdminEditorModeState=Object.freeze({version:VERSION,syncDateEditorMode});
  if(globalThis!==global)globalThis.AdminEditorModeState=global.AdminEditorModeState;
})(window);


