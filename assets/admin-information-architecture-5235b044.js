/* v10.23 後台資訊架構：跨頁導覽、摘要與編輯層級。 */
(function installAdminInformationArchitecture(global){
  'use strict';

  const VERSION='10.23';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));

  function navButton(panelId,label){
    const button=document.createElement('button');
    button.type='button';
    button.className='adminSectionNavButtonV1013';
    button.textContent=label;
    button.addEventListener('click',()=>{
      const nav=$$('.nav').find(item=>String(item.getAttribute('onclick')||'').includes("'"+panelId+"'"));
      global.panel?.(panelId,nav||null);
    });
    return button;
  }

  function addPageLinks(panelId,links){
    const panel=document.getElementById(panelId);
    const card=$(':scope > .card',panel);
    if(!card||$('.adminRelatedNavV1013',card))return;
    const nav=document.createElement('nav');
    nav.className='adminRelatedNavV1013';
    nav.setAttribute('aria-label','相關管理功能');
    links.forEach(link=>nav.appendChild(navButton(link.id,link.label)));
    card.prepend(nav);
  }

  function addResultsNavigator(){
    const mount=document.getElementById('resultTables');
    if(!mount||$('.resultNavigatorV1013',mount)||!$('.resultAnalysisGroup',mount))return;
    const nav=document.createElement('nav');
    nav.className='resultNavigatorV1013';
    nav.setAttribute('aria-label','投票結果區段');
    [['.resultAnalysisGroup','投票分析'],['.resultManagementGroup','回覆管理']].forEach(([selector,label])=>{
      const button=document.createElement('button');
      button.type='button';
      button.textContent=label;
      button.addEventListener('click',()=>$(selector,mount)?.scrollIntoView({behavior:'smooth',block:'start'}));
      nav.appendChild(button);
    });
    mount.insertBefore(nav,mount.querySelector('.resultGroup'));
  }

  function addMailSteps(){
    const panel=document.getElementById('mailP');
    const composer=$('.mailComposerV957',panel);
    if(!composer||$('.mailStepsV1013',composer))return;
    const steps=document.createElement('ol');
    steps.className='mailStepsV1013';
    ['選擇類型','確認收件者','編輯主旨與內容','預覽並產生 EML'].forEach((label,index)=>{
      const item=document.createElement('li');
      item.innerHTML='<span>'+(index+1)+'</span><b>'+label+'</b>';
      steps.appendChild(item);
    });
    const head=$('.mailComposerHeadV957',composer);
    head?.insertAdjacentElement('afterend',steps);
  }

  function addFeatureOverview(){
    const page=$('.featureSettingsPageV943');
    const grid=$('.featureSettingsGridV943',page);
    if(!page||!grid||$('.featureOverviewV1013',page))return;
    const overview=document.createElement('div');
    overview.className='featureOverviewV1013';
    overview.innerHTML='<div><span>共用功能</span><strong>2 項</strong></div><p>各功能分開儲存；調整其中一項不會影響另一項，也不會刪除既有資料。</p>';
    grid.insertAdjacentElement('beforebegin',overview);
    $$('.featureSettingCardV943',grid).forEach((card,index)=>{
      card.dataset.settingNumber=String(index+1).padStart(2,'0');
    });
  }

  function addMemberPermissionOverview(){
    const memberTable=document.getElementById('sysMemberTable');
    const memberCard=memberTable?.closest('.card');
    if(memberCard&&!$('.memberScopeNoteV1013',memberCard)){
      const note=document.createElement('div');
      note.className='memberScopeNoteV1013';
      note.innerHTML='<b>公司人員主檔</b><span>管理所有同仁的基本資料與登入帳號；單一活動的管理或檢視權限請到「權限管理」。</span>';
      memberTable.insertAdjacentElement('beforebegin',note);
    }
    const managerTable=document.getElementById('managerTable');
    const accessCard=managerTable?.closest('.card');
    if(accessCard&&!$('.permissionLegendV1013',accessCard)){
      const legend=document.createElement('div');
      legend.className='permissionLegendV1013';
      legend.innerHTML='<div><b>活動管理者</b><span>可編輯目前活動及處理填寫結果</span></div><div><b>結果檢視者</b><span>僅可查看投票結果，不可修改活動</span></div>';
      managerTable.insertAdjacentElement('beforebegin',legend);
    }
  }

  function addEditorSections(panelId,editorSelector,definitions){
    const panel=document.getElementById(panelId);
    const editor=$(editorSelector,panel);
    if(!editor||editor.dataset.v1013==='true')return;
    editor.dataset.v1013='true';
    definitions.forEach(definition=>{
      const target=$(definition.before,editor);
      if(!target)return;
      const anchor=definition.container?target.closest(definition.container):(target.closest('.field')||target);
      const heading=document.createElement('div');
      heading.className='editorSectionTitleV1013';
      heading.innerHTML='<span>'+definition.number+'</span><div><b>'+definition.title+'</b><small>'+definition.help+'</small></div>';
      anchor.insertAdjacentElement('beforebegin',heading);
    });
  }

  function install(){
    addPageLinks('sysMemP',[{id:'accessP',label:'前往活動權限管理'}]);
    addPageLinks('accessP',[{id:'sysMemP',label:'前往公司人員管理'}]);
    addResultsNavigator();
    addMailSteps();
    addFeatureOverview();
    addMemberPermissionOverview();
    addEditorSections('surveyP','#surveyEditor',[
      {before:'.two',number:'01',title:'基本資料',help:'設定活動名稱與填寫期限。'},
      {before:'#svDesc',number:'02',title:'前台內容',help:'編輯同仁在問卷上看到的說明。'},
      {before:'#svStatus',container:'.two',number:'03',title:'開放與參與範圍',help:'決定填寫狀態、修改權限及參與部門。'}
    ]);
    addEditorSections('restP','#restaurantEditorV977',[
      {before:'.two',number:'01',title:'餐廳基本資料',help:'填寫名稱、排序、地址及相關網址。'},
      {before:'#newPrice',number:'02',title:'費用與類型',help:'設定單價、計價規則與餐廳類型。'}
    ]);
  }

  const baseRenderAdmin=global.renderAdmin;
  if(typeof baseRenderAdmin==='function'){
    global.renderAdmin=function(){
      const result=baseRenderAdmin.apply(this,arguments);
      install();
      return result;
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  global.AdminInformationArchitecture=Object.freeze({version:VERSION,install});
  if(globalThis!==global)globalThis.AdminInformationArchitecture=global.AdminInformationArchitecture;
})(window);



