/* v10.08 independent front-title styles and cover upload. */
(() => {
  const VERSION='10.08';
  const STYLE_OPTIONS={
    theme:{label:'主題原樣',description:'維持目前主題既有的標題區外觀。'},
    minimal:{label:'精簡標題',description:'白底、細色線，適合正式行政調查。'},
    gradient:{label:'漸層標題',description:'加強主題色層次，適合一般聚餐活動。'},
    image:{label:'圖片封面',description:'使用活動圖片與深色遮罩呈現。'}
  };
  let pendingCoverFile=null;
  let removeCoverRequested=false;
  let localCoverUrl='';

  function normalizeStyle(value){return STYLE_OPTIONS[value]?value:'theme'}
  function currentSurvey(){return typeof D!=='undefined'&&Array.isArray(D.surveys)?D.surveys.find(item=>item.id===editingSurveyId):null}
  function controls(){return document.getElementById('titleStyleControlV1008')}
  function selectedStyle(){return normalizeStyle(document.querySelector('input[name="titleStyleV1008"]:checked')?.value||'theme')}
  function safeImageUrl(value){
    const raw=String(value||'').trim();
    if(!raw)return'';
    try{const parsed=new URL(raw,location.href);return ['https:','http:','blob:'].includes(parsed.protocol)?parsed.href:''}catch(e){return''}
  }
  function clearLocalCoverUrl(){if(localCoverUrl){URL.revokeObjectURL(localCoverUrl);localCoverUrl=''}}
  function setCoverPreview(url,name){
    const preview=document.getElementById('titleCoverPreviewV1008');
    const nameBox=document.getElementById('titleCoverNameV1008');
    const safe=safeImageUrl(url);
    if(preview){preview.hidden=!safe;preview.style.backgroundImage=safe?`linear-gradient(90deg,rgba(9,28,54,.7),rgba(9,28,54,.28)),url("${safe.replaceAll('"','%22')}")`:''}
    if(nameBox)nameBox.textContent=name||((safe&&!safe.startsWith('blob:'))?'目前已上傳圖片':'尚未選擇圖片');
  }
  function syncCoverPanel(){
    const panel=document.getElementById('titleCoverPanelV1008');
    if(panel)panel.hidden=selectedStyle()!=='image';
  }
  function styleCardHtml(value,data){
    return `<label class="titleStyleChoiceV1008"><input type="radio" name="titleStyleV1008" value="${value}"><span><i class="titleStyleSampleV1008 ${value}" aria-hidden="true"><b></b><em></em></i><strong>${data.label}</strong><small>${data.description}</small></span></label>`;
  }
  function ensureControls(){
    if(controls())return controls();
    const themePreview=document.getElementById('themePreview');
    if(!themePreview)return null;
    const section=document.createElement('section');
    section.id='titleStyleControlV1008';
    section.className='titleStyleControlV1008';
    section.innerHTML=`<div class="titleStyleHeadingV1008"><div><h4>標題區樣式</h4><p>可與上方任何主題自由搭配；主要操作按鈕仍維持系統固定色。</p></div></div><div class="titleStyleChoicesV1008">${Object.entries(STYLE_OPTIONS).map(([value,data])=>styleCardHtml(value,data)).join('')}</div><div id="titleCoverPanelV1008" class="titleCoverPanelV1008" hidden><div id="titleCoverPreviewV1008" class="titleCoverPreviewV1008" hidden><span>活動標題</span><small>圖片封面預覽</small></div><div class="titleCoverActionsV1008"><input id="titleCoverFileV1008" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="chooseTitleCoverV1008" class="btn" type="button">選擇圖片</button><button id="removeTitleCoverV1008" class="btn red" type="button">移除圖片</button><span id="titleCoverNameV1008" class="muted">尚未選擇圖片</span></div><p class="muted">支援 JPG、PNG、WebP；圖片會儲存至 Firebase Storage，前台自動加入深色遮罩以維持文字清楚。</p></div>`;
    themePreview.closest('.field')?.insertAdjacentElement('afterend',section);
    section.querySelectorAll('input[name="titleStyleV1008"]').forEach(input=>input.addEventListener('change',()=>{syncCoverPanel();renderCombinedPreview();if(typeof markSurveyDirty==='function')markSurveyDirty()}));
    const fileInput=document.getElementById('titleCoverFileV1008');
    document.getElementById('chooseTitleCoverV1008')?.addEventListener('click',()=>fileInput?.click());
    fileInput?.addEventListener('change',()=>{
      const file=fileInput.files?.[0];
      if(!file)return;
      if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){fileInput.value='';return alert('請選擇 JPG、PNG 或 WebP 圖片')}
      pendingCoverFile=file;removeCoverRequested=false;clearLocalCoverUrl();localCoverUrl=URL.createObjectURL(file);setCoverPreview(localCoverUrl,file.name);if(typeof markSurveyDirty==='function')markSurveyDirty();
    });
    document.getElementById('removeTitleCoverV1008')?.addEventListener('click',()=>{pendingCoverFile=null;removeCoverRequested=true;clearLocalCoverUrl();if(fileInput)fileInput.value='';setCoverPreview('','尚未選擇圖片');if(typeof markSurveyDirty==='function')markSurveyDirty()});
    return section;
  }
  function renderCombinedPreview(){
    const preview=document.getElementById('themePreview');
    if(preview)preview.dataset.titleStyle=selectedStyle();
  }
  function applyAdminFrontTitleStyle(survey){
    const hero=document.querySelector('#front .hero');if(!hero)return;
    let style=normalizeStyle(survey?.titleStyle||'theme'),image=safeImageUrl(survey?.titleImageUrl);
    if(style==='image'&&!image)style='gradient';
    hero.dataset.titleStyle=style;
    if(style==='image'&&image){hero.style.setProperty('--title-cover-image',`url("${image.replaceAll('"','%22')}")`);hero.classList.add('hasTitleCoverV1008')}
    else{hero.style.removeProperty('--title-cover-image');hero.classList.remove('hasTitleCoverV1008')}
  }
  function syncFromSurvey(survey){
    ensureControls();
    const style=normalizeStyle(survey?.titleStyle||'theme');
    const input=document.querySelector(`input[name="titleStyleV1008"][value="${style}"]`);
    if(input)input.checked=true;
    pendingCoverFile=null;removeCoverRequested=false;clearLocalCoverUrl();
    const fileInput=document.getElementById('titleCoverFileV1008');if(fileInput)fileInput.value='';
    setCoverPreview(safeImageUrl(survey?.titleImageUrl),survey?.titleImageUrl?'目前已上傳圖片':'尚未選擇圖片');
    syncCoverPanel();renderCombinedPreview();
  }
  function findSavedSurvey(beforeIds,wasMode,targetId,title){
    if(wasMode==='edit'&&targetId)return D.surveys.find(item=>item.id===targetId)||null;
    const created=D.surveys.filter(item=>!beforeIds.has(item.id));
    return created[0]||[...D.surveys].reverse().find(item=>item.title===title)||null;
  }
  function sanitizedFileName(name){return String(name||'cover').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-90)||'cover'}
  async function uploadCover(surveyId,file){
    if(!firebase.storage)throw new Error('Firebase Storage 尚未載入');
    const path=`deptdine/${surveyId}/covers/${Date.now()}_${sanitizedFileName(file.name)}`;
    const reference=firebase.storage().ref(path);
    await reference.put(file,{contentType:file.type});
    return{url:await reference.getDownloadURL(),path};
  }
  async function deleteCover(path){if(!path||!firebase.storage)return;try{await firebase.storage().ref(path).delete()}catch(e){if(e?.code!=='storage/object-not-found')console.warn('移除舊封面圖片失敗',e)}}

  function install(){
    ensureControls();
    if(typeof renderFront==='function'){
      const base=renderFront;
      renderFront=function(){const value=base.apply(this,arguments);applyAdminFrontTitleStyle(typeof activeSurvey==='function'?activeSurvey():null);return value};
      window.renderFront=renderFront;
    }
    if(typeof renderThemePreview==='function'){
      const base=renderThemePreview;
      renderThemePreview=function(){const value=base.apply(this,arguments);ensureControls();renderCombinedPreview();return value};
      window.renderThemePreview=renderThemePreview;
    }
    if(typeof fillSurveyForm==='function'){
      const base=fillSurveyForm;
      fillSurveyForm=function(survey){const value=base.apply(this,arguments);syncFromSurvey(survey);return value};
      window.fillSurveyForm=fillSurveyForm;
    }
    if(typeof startNewSurvey==='function'){
      const base=startNewSurvey;
      startNewSurvey=function(){const value=base.apply(this,arguments);syncFromSurvey(null);return value};
      window.startNewSurvey=startNewSurvey;
    }
    if(typeof saveSurvey==='function'){
      const base=saveSurvey;
      saveSurvey=async function(){
        ensureControls();
        const wasMode=surveyFormMode,targetId=editingSurveyId,title=svTitle?.value?.trim()||'',beforeIds=new Set((D.surveys||[]).map(item=>item.id));
        const oldSurvey=currentSurvey(),oldPath=oldSurvey?.titleImagePath||'',style=selectedStyle(),file=pendingCoverFile,remove=removeCoverRequested;
        await base.apply(this,arguments);
        if(surveyFormMode!=='view')return;
        const saved=findSavedSurvey(beforeIds,wasMode,targetId,title);if(!saved)return;
        let imageUrl=remove?'':(saved.titleImageUrl||''),imagePath=remove?'':(saved.titleImagePath||'');
        try{
          if(file){const uploaded=await uploadCover(saved.id,file);imageUrl=uploaded.url;imagePath=uploaded.path}
          const data={titleStyle:style,titleImageUrl:imageUrl||firebase.firestore.FieldValue.delete(),titleImagePath:imagePath||firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
          await doc('surveys',saved.id).set(data,{merge:true});
          if((file||remove)&&oldPath&&oldPath!==imagePath)await deleteCover(oldPath);
          Object.assign(saved,{titleStyle:style,titleImageUrl:imageUrl,titleImagePath:imagePath});
          pendingCoverFile=null;removeCoverRequested=false;clearLocalCoverUrl();
          if(typeof renderFront==='function')renderFront();if(typeof renderAdmin==='function')renderAdmin();
          if(file&&typeof toast==='function')toast('活動設定與封面圖片已儲存');
        }catch(error){console.error('save title style failed',error);alert('活動內容已儲存，但標題區或封面圖片儲存失敗，請確認 Storage 規則後再試一次')}
      };
      window.saveSurvey=saveSurvey;
    }
    syncFromSurvey(currentSurvey());
  }

  window.AdminTitleStyles=Object.freeze({version:VERSION,normalizeStyle,options:STYLE_OPTIONS});
  window.addEventListener('admin:ready',()=>ensureControls());
  install();
})();
