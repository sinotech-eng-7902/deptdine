/* 聊天室閱讀位置：保留未讀分界，但開啟對話時直接定位最新訊息。 */
(function(global){
  'use strict';

  const MODULE_VERSION='10.06';

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

  global.AdminChatReadingPosition=Object.freeze({version:MODULE_VERSION,timeMs,resolveInitialPosition,createRenderGuard,positionMessageList});
})(window);


