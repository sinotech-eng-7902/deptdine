/* v10.44 管理端共用回到頁首按鈕與功能頁切換回頂。 */
(() => {
  const MODULE_VERSION='10.44';
  const SHOW_AFTER=640;
  let button=null;
  let framePending=false;
  let panelFramePending=false;
  let activePanelId='';
  let panelObserver=null;

  function scrollRoot(){
    return document.scrollingElement||document.documentElement;
  }

  function shouldShow(){
    const root=scrollRoot();
    const scrollTop=Math.max(window.scrollY||0,root?.scrollTop||0);
    const pageIsLong=(root?.scrollHeight||0)>window.innerHeight+120;
    return pageIsLong&&scrollTop>=SHOW_AFTER;
  }

  function sync(){
    if(!button)return false;
    const visible=shouldShow();
    button.classList.toggle('isVisible',visible);
    button.setAttribute('aria-hidden',String(!visible));
    button.tabIndex=visible?0:-1;
    return visible;
  }

  function requestSync(){
    if(framePending)return;
    framePending=true;
    requestAnimationFrame(()=>{
      framePending=false;
      sync();
    });
  }

  function scrollToTop(){
    const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
    window.scrollTo({top:0,left:0,behavior:reduceMotion?'auto':'smooth'});
  }

  function currentActivePanelId(){
    return document.querySelector('.admin .panel.active')?.id||document.querySelector('.panel.active')?.id||'';
  }

  function syncActivePanel(){
    panelFramePending=false;
    const nextPanelId=currentActivePanelId();
    if(!nextPanelId||nextPanelId===activePanelId)return false;
    const previousPanelId=activePanelId;
    activePanelId=nextPanelId;
    if(!previousPanelId)return false;
    window.scrollTo({top:0,left:0,behavior:'auto'});
    requestSync();
    return true;
  }

  function requestPanelSync(){
    if(panelFramePending)return;
    panelFramePending=true;
    requestAnimationFrame(syncActivePanel);
  }

  function observePanelChanges(){
    activePanelId=currentActivePanelId();
    panelObserver?.disconnect();
    panelObserver=new MutationObserver(records=>{
      const changed=records.some(record=>record.target instanceof Element&&record.target.classList.contains('panel'));
      if(changed)requestPanelSync();
    });
    panelObserver.observe(document.getElementById('admin')||document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  }

  function ensureButton(){
    if(button?.isConnected)return button;
    button=document.createElement('button');
    button.type='button';
    button.className='adminBackToTopV1043';
    button.title='回到頁首';
    button.setAttribute('aria-label','回到頁首');
    button.setAttribute('aria-hidden','true');
    button.tabIndex=-1;
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 14.5 12 9l5.5 5.5"/></svg>';
    button.addEventListener('click',scrollToTop);
    document.body.appendChild(button);
    return button;
  }

  function init(){
    ensureButton();
    observePanelChanges();
    sync();
    window.addEventListener('scroll',requestSync,{passive:true});
    window.addEventListener('resize',requestSync,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.AdminBackToTop=Object.freeze({
    version:MODULE_VERSION,
    showAfter:SHOW_AFTER,
    sync,
    syncActivePanel,
    scrollToTop
  });
})();
