/* admin-share-center-b291addd.js */
/* v10.12 activity share center: local QR generation and link actions. */
(function(){
  'use strict';

  const MODULE_VERSION='10.54';
  let returnFocus=null;

  function currentSurvey(){
    if(typeof activeSurvey==='function')return activeSurvey();
    return null;
  }

  function questionnaireUrl(){
    return typeof frontUrl==='function'?frontUrl():'';
  }

  function managementUrl(){
    if(typeof adminHash==='function')return location.href.split('#')[0]+adminHash();
    return location.href;
  }

  function availability(survey){
    if(typeof surveyAvailabilityV711==='function')return surveyAvailabilityV711(survey);
    const labels={open:'問卷開放中',closed:'問卷已關閉',draft:'問卷尚未開放'};
    return{label:labels[survey?.status]||'狀態未設定',state:survey?.status||'draft'};
  }

  function deadlineText(survey){
    if(!survey?.deadline)return'未設定截止時間';
    return typeof formatDeadline==='function'?formatDeadline(survey.deadline):String(survey.deadline);
  }

  function ensureDialog(){
    let mask=document.getElementById('shareActivityMaskV1011');
    if(mask)return mask;
    mask=document.createElement('div');
    mask.id='shareActivityMaskV1011';
    mask.className='modalMask shareActivityMaskV1011';
    mask.hidden=true;
    mask.innerHTML=`<section class="shareActivityDialogV1011" role="dialog" aria-modal="true" aria-labelledby="shareActivityTitleV1011">
      <header class="shareActivityHeaderV1011">
        <div><h2 id="shareActivityTitleV1011">分享活動</h2><p>分享問卷網址、QR Code 或製作邀請信件。</p></div>
        <button class="shareActivityCloseV1011" type="button" aria-label="關閉分享活動視窗">×</button>
      </header>
      <div class="shareActivityBodyV1011">
        <section class="shareActivityMainV1011">
          <div class="shareActivityIdentityV1011">
            <span id="shareActivityStateV1011" class="shareActivityStateV1011"></span>
            <h3 id="shareActivityNameV1011"></h3>
            <p id="shareActivityDeadlineV1011"></p>
          </div>
          <label class="shareActivityUrlFieldV1011" for="shareActivityUrlV1011"><span>活動問卷網址</span>
            <div><input id="shareActivityUrlV1011" type="text" readonly><button id="shareActivityCopyV1011" class="btn" type="button">複製網址</button></div>
          </label>
          <div class="shareActivityActionsV1011">
            <button id="shareActivityPreviewV1011" class="btn" type="button">預覽問卷</button>
            <button id="shareActivityMailV1011" class="btn primary" type="button">製作邀請信件</button>
          </div>
          <details id="shareManagementLinkV1011" class="shareManagementLinkV1011">
            <summary>管理專用網址</summary>
            <p>僅供具管理權限的人員使用，請勿張貼於公開公告。</p>
            <div><input id="shareManagementUrlV1011" type="text" readonly><button id="shareManagementCopyV1011" class="btn" type="button">複製管理網址</button></div>
          </details>
        </section>
        <aside class="shareQrPanelV1011">
          <div id="shareQrCodeV1011" class="shareQrCodeV1011" aria-label="活動問卷 QR Code"></div>
          <strong>掃描填寫聚餐問卷</strong>
          <span>QR Code 內容與活動問卷網址相同</span>
          <button id="shareQrDownloadV1011" class="btn" type="button">下載 QR Code</button>
          <p id="shareQrErrorV1011" class="shareQrErrorV1011" role="status"></p>
        </aside>
      </div>
    </section>`;
    document.body.appendChild(mask);
    mask.addEventListener('click',event=>{if(event.target===mask)close()});
    mask.querySelector('.shareActivityCloseV1011').addEventListener('click',close);
    mask.querySelector('#shareActivityCopyV1011').addEventListener('click',()=>copyValue('shareActivityUrlV1011','活動問卷網址已複製'));
    mask.querySelector('#shareManagementCopyV1011').addEventListener('click',()=>copyValue('shareManagementUrlV1011','活動管理網址已複製'));
    mask.querySelector('#shareActivityPreviewV1011').addEventListener('click',()=>{close();if(typeof showFront==='function')showFront()});
    mask.querySelector('#shareActivityMailV1011').addEventListener('click',openInvitationMail);
    mask.querySelector('#shareQrDownloadV1011').addEventListener('click',downloadQrImage);
    return mask;
  }

  async function copyValue(id,successMessage){
    const value=document.getElementById(id)?.value||'';
    if(!value)return;
    try{
      await navigator.clipboard.writeText(value);
      if(typeof toast==='function')toast(successMessage);
    }catch(error){
      const field=document.getElementById(id);
      field?.focus();field?.select();
      window.prompt('請複製下列網址',value);
    }
  }

  function openInvitationMail(){
    close();
    const nav=document.querySelector('.nav[onclick*="mailP"],.topNavMenuItem[onclick*="mailP"]');
    if(nav){nav.click();return}
    if(typeof panel==='function')panel('mailP');
  }

  function renderQr(url){
    const host=document.getElementById('shareQrCodeV1011');
    const error=document.getElementById('shareQrErrorV1011');
    host.replaceChildren();error.textContent='';
    if(typeof QRCode!=='function'){
      error.textContent='QR Code 元件載入失敗，請重新整理後再試。';
      return;
    }
    try{
      new QRCode(host,{text:url,width:240,height:240,colorDark:'#123f6b',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
      const generated=[...host.querySelectorAll('canvas,img')];
      const primary=host.querySelector('canvas')||host.querySelector('img')||null;
      generated.forEach(node=>{
        node.hidden=node!==primary;
        if(node!==primary)node.setAttribute('aria-hidden','true');
      });
      if(primary){
        primary.hidden=false;
        primary.removeAttribute('aria-hidden');
      }
    }catch(problem){
      console.error('QR Code generation failed',problem);
      error.textContent='QR Code 暫時無法產生，仍可複製問卷網址分享。';
    }
  }

  function wrapCanvasText(context,text,maxWidth){
    const characters=[...String(text||'')],lines=[];
    let line='';
    for(const character of characters){
      const candidate=line+character;
      if(line&&context.measureText(candidate).width>maxWidth){lines.push(line);line=character}else line=candidate;
    }
    if(line)lines.push(line);
    return lines.slice(0,2);
  }

  function downloadQrImage(){
    const survey=currentSurvey();
    const source=document.querySelector('#shareQrCodeV1011 canvas:not([hidden]),#shareQrCodeV1011 img:not([hidden])');
    if(!survey||!source)return;
    const canvas=document.createElement('canvas');
    canvas.width=720;canvas.height=860;
    const context=canvas.getContext('2d');
    context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle='#123f6b';context.font='700 34px "Microsoft JhengHei",sans-serif';context.textAlign='center';
    const titleLines=wrapCanvasText(context,survey.title||'部門聚餐調查',620);
    titleLines.forEach((line,index)=>context.fillText(line,360,65+index*46));
    const qrTop=titleLines.length>1?145:110;
    context.drawImage(source,75,qrTop,570,570);
    context.fillStyle='#123f6b';context.font='700 27px "Microsoft JhengHei",sans-serif';
    context.fillText('掃描填寫聚餐問卷',360,qrTop+625);
    context.fillStyle='#667085';context.font='22px "Microsoft JhengHei",sans-serif';
    context.fillText('填寫期限：'+deadlineText(survey),360,qrTop+670);
    context.strokeStyle='#d8e3ed';context.lineWidth=2;context.strokeRect(18,18,684,824);
    const safeName=String(survey.title||'部門聚餐問卷').replace(/[\\/:*?"<>|]/g,'_').slice(0,45);
    const link=document.createElement('a');link.download=safeName+'_QR_Code.png';link.href=canvas.toDataURL('image/png');link.hidden=true;document.body.appendChild(link);link.click();link.remove();
    if(typeof toast==='function')toast('QR Code 已下載');
  }

  function open(){
    const survey=currentSurvey();
    if(!survey||!survey.id){if(typeof alert==='function')alert('請先選擇活動');return}
    const url=questionnaireUrl();
    if(!url){if(typeof alert==='function')alert('目前無法取得活動問卷網址');return}
    const mask=ensureDialog(),state=availability(survey);
    returnFocus=document.activeElement;
    mask.querySelector('#shareActivityNameV1011').textContent=survey.title||'未命名活動';
    mask.querySelector('#shareActivityDeadlineV1011').textContent='填寫期限：'+deadlineText(survey);
    const stateElement=mask.querySelector('#shareActivityStateV1011');
    stateElement.textContent=state.label||'狀態未設定';stateElement.dataset.state=state.state||'';
    mask.querySelector('#shareActivityUrlV1011').value=url;
    mask.querySelector('#shareManagementUrlV1011').value=managementUrl();
    mask.querySelector('#shareManagementLinkV1011').hidden=!(typeof isSystemAdmin!=='undefined'&&isSystemAdmin);
    renderQr(url);
    mask.hidden=false;mask.style.display='flex';document.body.classList.add('modalOpen');
    setTimeout(()=>mask.querySelector('#shareActivityCopyV1011')?.focus(),40);
  }

  function close(){
    const mask=document.getElementById('shareActivityMaskV1011');
    if(mask){mask.hidden=true;mask.style.display='none'}
    document.body.classList.remove('modalOpen');
    if(returnFocus&&document.contains(returnFocus))returnFocus.focus();
    returnFocus=null;
  }

  function installToolbar(){
    const actions=document.querySelector('.compactAdminToolbar .headActions');
    if(!actions)return;

    // v10.54：更多選單原本只有「分享活動」，改為可直接辨識的圖示入口。
    document.getElementById('adminMoreMenu')?.remove();
    document.getElementById('copyAdminLinkBtn')?.remove();
    document.getElementById('copyFrontLinkBtn')?.remove();

    let button=document.getElementById('shareActivityToolbarBtnV1027');
    if(!button){
      button=document.createElement('button');
      button.id='shareActivityToolbarBtnV1027';
      button.className='btn iconOnlyButton shareActivityToolbarButtonV1027';
      button.type='button';
      button.title='分享活動';
      button.setAttribute('aria-label','分享活動');
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.7 6.8-4.1"></path><path d="m8.6 13.3 6.8 4.1"></path></svg>';
      button.addEventListener('click',open);
    }

    const frontButton=actions.querySelector('.frontViewButton');
    if(frontButton)actions.insertBefore(button,frontButton);
    else actions.appendChild(button);
  }

  function installMenu(){installToolbar()}

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!document.getElementById('shareActivityMaskV1011')?.hidden){event.preventDefault();close()}
  });

  window.openActivityShareCenterV1011=open;
  window.closeActivityShareCenterV1011=close;
  window.AdminShareCenter=Object.freeze({version:MODULE_VERSION,open,close,installMenu,installToolbar});
})();











;
/* admin-information-architecture-7727a109.js */
/* v10.54 後台資訊架構：跨頁導覽、摘要與編輯層級。 */
(function installAdminInformationArchitecture(global){
  'use strict';

  const VERSION='10.54';
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











;
/* admin-editor-mode-state-de6cd3e5.js */
/* v10.54 日期新增／編輯模式狀態同步。 */
(function(global){
  'use strict';
  const VERSION='10.54';

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









