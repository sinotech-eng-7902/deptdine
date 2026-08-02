/* 相容層：餐廳列表優先與專注編輯介面。 */

/* ===== 餐廳列表優先與新增／編輯專注模式 ===== */
(() => {
  let restaurantReturnScrollV977=0;

  function restaurantCountV977(){
    return Array.isArray(D?.restaurants)?D.restaurants.length:0;
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

  window.startNewRestaurantV977=startNewRestaurantV977;
  window.syncRestaurantFocusModeV977=syncRestaurantFocusModeV977;
  window.renderRestaurantEmptyStateV977=renderRestaurantEmptyStateV977;
  window.editRestaurant=editRestaurant;
  window.cancelRestaurantEdit=cancelRestaurantEdit;
  window.renderRestPanel=renderRestPanel;
  window.renderAdmin=renderAdmin;
})();
