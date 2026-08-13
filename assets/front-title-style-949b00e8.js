/* v10.12 front title-style renderer. */
(() => {
  const VERSION='10.17';
  const VALID_STYLES=new Set(['theme','minimal','gradient','image']);
  function normalizeStyle(value){return VALID_STYLES.has(value)?value:'theme'}
  function safeImageUrl(value){try{const url=new URL(String(value||''),location.href);return /^https?:$/.test(url.protocol)?url.href:''}catch(e){return''}}
  function applyTitleStyle(survey){
    const hero=document.querySelector('.hero');if(!hero)return;
    let style=normalizeStyle(survey?.titleStyle||'theme'),image=safeImageUrl(survey?.titleImageUrl);
    if(style==='image'&&!image)style='gradient';
    hero.dataset.titleStyle=style;
    document.body.dataset.titleStyle=style;
    if(style==='image'&&image){hero.style.setProperty('--title-cover-image',`url("${image.replaceAll('"','%22')}")`);hero.classList.add('hasTitleCoverV1008')}
    else{hero.style.removeProperty('--title-cover-image');hero.classList.remove('hasTitleCoverV1008')}
  }
  if(typeof renderFront==='function'){
    const base=renderFront;
    renderFront=function(){const value=base.apply(this,arguments);applyTitleStyle(typeof activeSurvey==='function'?activeSurvey():null);return value};
    window.renderFront=renderFront;
  }
  window.FrontTitleStyles=Object.freeze({version:VERSION,normalizeStyle,applyTitleStyle});
})();

