/* v10.12 activity share center: local QR generation and link actions. */
(function(){
  'use strict';

  const MODULE_VERSION='10.41';
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

    // v10.41：更多選單原本只有「分享活動」，改為可直接辨識的圖示入口。
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






