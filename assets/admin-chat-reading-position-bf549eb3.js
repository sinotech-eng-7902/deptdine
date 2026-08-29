/* 聊天室閱讀位置：保留未讀分界，並在開啟對話後等待內容高度穩定再解除貼底。 */
(function(global){
  'use strict';

  const MODULE_VERSION='10.38';

  function normalizeEmail(value){return String(value||'').trim().toLowerCase()}
  function timeMs(value){
    if(!value)return 0;
    if(typeof value.toMillis==='function')return value.toMillis();
    if(Number.isFinite(value.seconds))return value.seconds*1000+Math.floor(Number(value.nanoseconds||0)/1000000);
    const parsed=new Date(value).getTime();return Number.isFinite(parsed)?parsed:0;
  }
  function resolveInitialPosition({messages=[],lastReadAt=null,currentEmail=''}){
    const sorted=[...messages].sort((a,b)=>timeMs(a.createdAt)-timeMs(b.createdAt));
    const lastReadMs=timeMs(lastReadAt);
    if(!sorted.length||!lastReadMs)return Object.freeze({mode:'latest',boundaryMessageId:'',anchorMessageId:'',unreadCount:0});
    const current=normalizeEmail(currentEmail);
    const firstUnreadIndex=sorted.findIndex(message=>timeMs(message.createdAt)>lastReadMs&&normalizeEmail(message.senderEmail)!==current);
    if(firstUnreadIndex<0)return Object.freeze({mode:'latest',boundaryMessageId:'',anchorMessageId:'',unreadCount:0});
    const boundary=sorted[firstUnreadIndex];
    const anchor=[...sorted.slice(0,firstUnreadIndex)].reverse().find(message=>timeMs(message.createdAt)<=lastReadMs)||null;
    const unreadCount=sorted.slice(firstUnreadIndex).filter(message=>timeMs(message.createdAt)>lastReadMs&&normalizeEmail(message.senderEmail)!==current).length;
    return Object.freeze({mode:'latest',boundaryMessageId:String(boundary.id||''),anchorMessageId:String(anchor?.id||''),unreadCount});
  }
  function createRenderGuard(){
    let generation=0;
    return Object.freeze({
      next(){generation+=1;return generation},
      isCurrent(token){return token===generation}
    });
  }
  function positionMessageList(list,position){
    if(!list)return 'missing-list';
    if(position?.mode!=='unread'){
      list.scrollTop=list.scrollHeight;
      return 'latest';
    }
    const escapeValue=value=>global.CSS?.escape?global.CSS.escape(value):String(value).replace(/["\\]/g,'\\$&');
    const anchor=position.anchorMessageId?list.querySelector(`[data-message-id="${escapeValue(position.anchorMessageId)}"]`):null;
    const divider=list.querySelector('.chatUnreadDividerV924');
    const target=anchor||divider;
    if(!target){list.scrollTop=list.scrollHeight;return 'latest-fallback'}
    const listRect=list.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
    const desired=list.scrollTop+(targetRect.top-listRect.top)-12;
    const maximum=Math.max(0,list.scrollHeight-list.clientHeight);
    list.scrollTop=Math.max(0,Math.min(maximum,desired));
    return anchor?'last-read':'first-unread';
  }

  function createStableBottomController({
    getList,
    quietMs=900,
    maxMs=5000,
    intervalMs=80,
    now=()=>Date.now(),
    schedule=(callback,delay)=>global.setTimeout(callback,delay),
    cancelSchedule=handle=>global.clearTimeout(handle),
    onActiveChange=()=>{}
  }={}){
    let active=false,timer=null,startedAt=0,lastActivityAt=0,lastHeightChangeAt=0,lastHeight=-1,generation=0;
    const observedMedia=new WeakSet();
    const list=()=>typeof getList==='function'?getList():null;
    const setActive=value=>{if(active===value)return;active=value;onActiveChange(active)};
    const clearTimer=()=>{if(timer!==null){cancelSchedule(timer);timer=null}};
    const stop=()=>{generation+=1;clearTimer();setActive(false)};
    const apply=()=>{
      const target=list();if(!target)return false;
      const height=Number(target.scrollHeight||0);
      if(height!==lastHeight){lastHeight=height;lastHeightChangeAt=now()}
      target.scrollTop=height;
      return true;
    };
    const bindMedia=()=>{
      const target=list();if(!target?.querySelectorAll)return;
      [...target.querySelectorAll('img')].forEach(image=>{
        if(observedMedia.has(image))return;observedMedia.add(image);
        if(!image.complete){image.addEventListener('load',touch,{once:true});image.addEventListener('error',touch,{once:true})}
      });
    };
    const hasPendingMedia=()=>{
      const target=list();return !!target?.querySelectorAll&&[...target.querySelectorAll('img')].some(image=>!image.complete);
    };
    const queue=()=>{
      if(!active||timer!==null)return;
      const token=generation;
      timer=schedule(()=>{timer=null;if(!active||token!==generation)return;apply();bindMedia();const current=now();
        const reachedMaximum=current-startedAt>=maxMs;
        const heightStable=current-lastHeightChangeAt>=quietMs;
        const activityQuiet=current-lastActivityAt>=quietMs;
        if(reachedMaximum||(!hasPendingMedia()&&heightStable&&activityQuiet)){stop();return}
        queue();
      },intervalMs);
    };
    function touch(){if(!active)return;lastActivityAt=now();apply();bindMedia();queue()}
    const start=()=>{stop();generation+=1;startedAt=lastActivityAt=lastHeightChangeAt=now();lastHeight=-1;setActive(true);apply();bindMedia();queue()};
    return Object.freeze({start,touch,cancel:stop,destroy:stop,isActive:()=>active,apply});
  }

  global.AdminChatReadingPosition=Object.freeze({version:MODULE_VERSION,timeMs,resolveInitialPosition,createRenderGuard,positionMessageList,createStableBottomController});
})(window);





