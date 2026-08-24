/* 相容層：手機版帳號選單。 */

/* ===== mobile header and account menu ===== */
(() => {
  function ensureMobileAccountMenuV929(){
    const userArea=document.querySelector('.topUserArea');
    if(!userArea)return;
    let menu=document.getElementById('mobileAccountMenuV929');
    if(!menu){
      menu=document.createElement('details');
      menu.id='mobileAccountMenuV929';
      menu.className='mobileAccountMenuV929';
      menu.innerHTML='<summary aria-label="帳號選單" title="帳號選單"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.6-4 3.1-6 7-6s6.4 2 7 6"></path></svg></summary><div class="mobileAccountPanelV929"><div class="mobileAccountIdentityV929"><strong></strong><small></small></div><button class="mobileSimulateButtonV929" type="button">切換模擬身分</button><button class="mobileLogoutButtonV929" type="button">登出</button></div>';
      userArea.appendChild(menu);
      menu.querySelector('.mobileLogoutButtonV929').addEventListener('click',()=>{menu.open=false;logout()});
      menu.querySelector('.mobileSimulateButtonV929').addEventListener('click',()=>{
        menu.open=false;
        document.querySelector('.topUserIcon')?.click();
      });
      menu.addEventListener('toggle',()=>{if(menu.open)adminNavigation.closeGroups()});
    }
    menu.querySelector('.mobileAccountIdentityV929 strong').textContent=document.getElementById('adminUser')?.textContent?.trim()||'目前帳號';
    menu.querySelector('.mobileAccountIdentityV929 small').textContent=document.getElementById('adminRole')?.textContent?.trim()||'';
    menu.querySelector('.mobileSimulateButtonV929').hidden=!isSystemAdmin;
  }

  const renderAdminBeforeV929=renderAdmin;
  renderAdmin=function(){
    const result=renderAdminBeforeV929();
    [0,80,220].forEach(delay=>setTimeout(ensureMobileAccountMenuV929,delay));
    return result;
  };
  window.renderAdmin=renderAdmin;

  if(!window.__mobileHeaderDismissV929){
    window.__mobileHeaderDismissV929=true;
    document.addEventListener('click',event=>{
      const menu=document.getElementById('mobileAccountMenuV929');
      if(menu?.open&&!event.target.closest('#mobileAccountMenuV929'))menu.open=false;
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        const menu=document.getElementById('mobileAccountMenuV929');
        if(menu?.open)menu.open=false;
      }
    });
  }
  window.ensureMobileAccountMenuV929=ensureMobileAccountMenuV929;
})();

