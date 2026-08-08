/* 相容層：即時聊天室與貼圖。 */
/* ===== realtime chat ===== */
(function(){
  const CHAT_SETTING_ID_V915='chat';
  const STICKERS_V915=[
    {id:'thumbsUp',symbol:'👍',label:'讚'},
    {id:'thanks',symbol:'🙏',label:'謝謝',image:'../assets/chat-stickers/thanks.png'},
    {id:'ok',symbol:'👌',label:'沒問題'},
    {id:'smile',symbol:'😊',label:'微笑'},
    {id:'celebrate',symbol:'🎉',label:'恭喜',image:'../assets/chat-stickers/celebrate.png'},
    {id:'heart',symbol:'❤️',label:'愛心'},
    {id:'clap',symbol:'👏',label:'鼓掌'},
    {id:'working',symbol:'💪',label:'加油'},
    {id:'received',symbol:'🙋',label:'收到',image:'../assets/chat-stickers/received.png'},
    {id:'thinking',symbol:'🤔',label:'思考中',image:'../assets/chat-stickers/thinking.png'},
    {id:'please',symbol:'🙇',label:'麻煩了'},
    {id:'sorry',symbol:'😣',label:'抱歉',image:'../assets/chat-stickers/sorry.png'},
    {id:'surprised',symbol:'😮',label:'驚訝'},
    {id:'speechless',symbol:'😶',label:'傻眼',image:'../assets/chat-stickers/speechless.png'},
    {id:'angry',symbol:'😠',label:'生氣',image:'../assets/chat-stickers/angry.png'},
    {id:'tired',symbol:'😵',label:'累了'},
    {id:'urgent',symbol:'🔥',label:'緊急處理',image:'../assets/chat-stickers/urgent.png'},
    {id:'meeting',symbol:'🗓️',label:'開會中',image:'../assets/chat-stickers/meeting.png'},
    {id:'phone',symbol:'📞',label:'電話中'},
    {id:'processing',symbol:'⌛',label:'處理中',image:'../assets/chat-stickers/processing.png'},
    {id:'done',symbol:'✅',label:'已完成',image:'../assets/chat-stickers/done.png'},
    {id:'check',symbol:'🔍',label:'請確認',image:'../assets/chat-stickers/check.png'},
    {id:'lunch',symbol:'🍱',label:'午休中',image:'../assets/chat-stickers/lunch.png'},
    {id:'offwork',symbol:'🏁',label:'下班了',image:'../assets/chat-stickers/offwork.png'},
    {id:'laugh',symbol:'😄',label:'笑翻了',image:'../assets/chat-stickers/laugh.png'},
    {id:'hilarious',symbol:'😂',label:'太好笑了',image:'../assets/chat-stickers/hilarious.png'},
    {id:'capyReceived',symbol:'👍',label:'水豚收到',category:'capybara',image:'../assets/chat-stickers/capybara/capy-received.png'},
    {id:'capyThanks',symbol:'🙏',label:'水豚謝謝',category:'capybara',image:'../assets/chat-stickers/capybara/capy-thanks.png'},
    {id:'capyCelebrate',symbol:'🎉',label:'水豚慶祝',category:'capybara',image:'../assets/chat-stickers/capybara/capy-celebrate.png'},
    {id:'capyCheck',symbol:'🔍',label:'水豚確認',category:'capybara',image:'../assets/chat-stickers/capybara/capy-check.png'},
    {id:'capyProcessing',symbol:'📄',label:'水豚處理中',category:'capybara',image:'../assets/chat-stickers/capybara/capy-processing.png'},
    {id:'capyThinking',symbol:'🤔',label:'水豚思考中',category:'capybara',image:'../assets/chat-stickers/capybara/capy-thinking.png'},
    {id:'capyUrgent',symbol:'💨',label:'水豚趕件中',category:'capybara',image:'../assets/chat-stickers/capybara/capy-urgent.png'},
    {id:'capyDone',symbol:'✅',label:'水豚完成',category:'capybara',image:'../assets/chat-stickers/capybara/capy-done.png'},
    {id:'capyLaugh',symbol:'😂',label:'水豚笑翻了',category:'capybara',image:'../assets/chat-stickers/capybara/capy-laugh.png'},
    {id:'capySpeechless',symbol:'😶',label:'水豚傻眼',category:'capybara',image:'../assets/chat-stickers/capybara/capy-speechless.png'},
    {id:'capySorry',symbol:'🥺',label:'水豚抱歉',category:'capybara',image:'../assets/chat-stickers/capybara/capy-sorry.png'},
    {id:'capyAngry',symbol:'😠',label:'水豚生氣',category:'capybara',image:'../assets/chat-stickers/capybara/capy-angry.png'},
    {id:'capyCoffee',symbol:'☕',label:'水豚喝咖啡',category:'capybara',image:'../assets/chat-stickers/capybara/capy-coffee.png'},
    {id:'capyLunch',symbol:'🍱',label:'水豚吃飯',category:'capybara',image:'../assets/chat-stickers/capybara/capy-lunch.png'},
    {id:'capyTired',symbol:'😴',label:'水豚累了',category:'capybara',image:'../assets/chat-stickers/capybara/capy-tired.png'},
    {id:'capyRest',symbol:'🍊',label:'水豚休息',category:'capybara',image:'../assets/chat-stickers/capybara/capy-rest.png'}
  ].map(item=>({...item,category:item.category||(item.image?'workplace':'classic')}));
  const STICKER_CATEGORIES_V921=[
    {id:'capybara',label:'Q版水豚'},
    {id:'workplace',label:'AI職場'},
    {id:'classic',label:'經典符號'}
  ];
  const EMOJIS_V919=['😀','😄','😊','😂','😢','😉','😍','🤔','😮','😶','😅','😣','😠','😭','👍','👎','👌','🙏','👏','🙌','💪','🙋','✅','❌','⚠️','❓','❗','💡','📌','📞','🎉','❤️'];
  let settingV915={enabled:false};
  let initializedEmailV915='';
  let roomsV915=[];
  let ownReadStatesV915=new Map();
  let activeReadStatesV915=new Map();
  let activeRoomIdV915='';
  let activeMessagesV915=[];
  let roomUnsubscribeV915=null;
  let ownReadUnsubscribeV915=null;
  let messageUnsubscribeV915=null;
  let activeReadUnsubscribeV915=null;
  let reactionUnsubscribeV924=null;
  let settingUnsubscribeV915=null;
  let settingSaveBusyV915=false;
  let sendingV915=false;
  let recallingMessageIdV919='';
  let roomViewV919='active';
  let expressionTabV919='emoji';
  let stickerCategoryV921='capybara';
  let activeReactionsV924=new Map();
  let replyTargetV924=null;
  let selectedMessageIdV924='';
  let chatSearchQueryV924='';
  let unreadCountAtOpenV924=0;
  let unreadBoundaryMessageIdV924='';
  let lastReadAnchorMessageIdV1003='';
  let lastReadAtOpenV1003=null;
  let initialReadingPositionResolvedV1003=false;
  let positionUnreadOnNextRenderV924=false;
  let forceScrollToBottomV924=false;
  let chatViewportBoundV924=false;
  let visibleMessageLimitV925=50;
  let pendingNewMessageCountV925=0;
  let previousMessageIdsV925=new Set();
  let searchMatchIndexV925=0;
  const CHAT_MESSAGE_PAGE_SIZE_V931=50;
  let olderMessagesV931=[];
  let oldestMessageDocV931=null;
  let hasOlderMessagesV931=true;
  let loadingOlderMessagesV931=false;
  const messageRenderGuardV1004=window.AdminChatReadingPosition?.createRenderGuard?.();

  function emailV915(value=currentUser?.email){return normalizeEmail(value)}
  function timeMsV915(value){
    if(!value)return 0;
    if(typeof value.toMillis==='function')return value.toMillis();
    if(Number.isFinite(value.seconds))return value.seconds*1000;
    const parsed=new Date(value).getTime();return Number.isFinite(parsed)?parsed:0;
  }
  function dateTimeV915(value){
    const ms=timeMsV915(value);if(!ms)return '';
    return new Intl.DateTimeFormat('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(ms));
  }
  function chatDraftKeyV925(roomId=activeRoomIdV915){return `deptdineChatDraftV925__${emailV915()||'guest'}__${roomId||'none'}`}
  function saveChatDraftV925(){const input=document.getElementById('chatInputV915');if(!input||!activeRoomIdV915)return;try{const value=input.value||'';if(value)localStorage.setItem(chatDraftKeyV925(),value);else localStorage.removeItem(chatDraftKeyV925())}catch(e){}}
  function loadChatDraftV925(){const input=document.getElementById('chatInputV915');if(!input)return;try{input.value=localStorage.getItem(chatDraftKeyV925())||''}catch(e){input.value=''}autoSizeChatInputV924(input)}
  function clearChatDraftV925(){try{localStorage.removeItem(chatDraftKeyV925())}catch(e){}}
  function dateKeyV925(value){const ms=timeMsV915(value);if(!ms)return '';const date=new Date(ms);return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`}
  function dateDividerV925(value){const ms=timeMsV915(value);if(!ms)return '';const date=new Date(ms),today=new Date(),yesterday=new Date();yesterday.setDate(today.getDate()-1);if(dateKeyV925(date)===dateKeyV925(today))return '今天';if(dateKeyV925(date)===dateKeyV925(yesterday))return '昨天';return new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(date)}
  function linkifyMessageV925(value){
    const text=String(value||''),pattern=/https?:\/\/[^\s<]+/gi;let html='',last=0,match;
    while((match=pattern.exec(text))){html+=esc(text.slice(last,match.index));let url=match[0],tail='';while(/[),.!?，。！？）]$/.test(url)){tail=url.slice(-1)+tail;url=url.slice(0,-1)}let label=url;try{const parsed=new URL(url),isMap=/google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);label=isMap?'開啟地圖':url.length>52?`${parsed.hostname} 連結`:url}catch(e){}html+=`<a class="chatMessageLinkV925" href="${escAttr(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>${esc(tail)}`;last=match.index+match[0].length}
    return html+esc(text.slice(last));
  }
  function encodePartV915(value){
    try{return btoa(String(value||'')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){return encodeURIComponent(value).replace(/%/g,'_')}
  }
  function directRoomIdV915(emails){return 'direct__'+emails.slice().sort().map(encodePartV915).join('__')}
  function roomMembersV915(room){
    const emails=Array.isArray(room?.memberEmails)?room.memberEmails:[];
    const labels=Array.isArray(room?.memberLabels)?room.memberLabels:[];
    return emails.map((email,index)=>({email:emailV915(email),label:String(labels[index]||email)}));
  }
  function roomTitleV915(room){
    if(room?.type==='group')return String(room.name||'多人聊天室');
    const other=roomMembersV915(room).find(x=>x.email!==emailV915());
    return other?.label||'一對一聊天室';
  }
  function memberOptionsV915(){
    const seen=new Set();
    return (D.members||[]).filter(member=>member.active!==false).map(member=>({
      email:memberGoogleEmail(member),
      label:memberDisplayName(member)
    })).filter(item=>item.email&&item.email!==emailV915()&&item.label&&!seen.has(item.email)&&seen.add(item.email)).sort((a,b)=>a.label.localeCompare(b.label,'zh-Hant'));
  }
  function currentLabelV915(){return currentUserDisplayText?.()||currentUser?.displayName||emailV915()||'後台使用者'}
  function memberLabelByEmailV915(email){
    const member=findMemberByGoogleEmail(email);return memberDisplayName(member)||String(email||'');
  }
  function stopConversationListenersV915(){
    messageRenderGuardV1004?.next();
    if(messageUnsubscribeV915)messageUnsubscribeV915();
    if(activeReadUnsubscribeV915)activeReadUnsubscribeV915();
    if(reactionUnsubscribeV924)reactionUnsubscribeV924();
    messageUnsubscribeV915=null;activeReadUnsubscribeV915=null;reactionUnsubscribeV924=null;
    activeMessagesV915=[];activeReadStatesV915.clear();activeReactionsV924.clear();
    replyTargetV924=null;selectedMessageIdV924='';chatSearchQueryV924='';
    unreadCountAtOpenV924=0;unreadBoundaryMessageIdV924='';lastReadAnchorMessageIdV1003='';lastReadAtOpenV1003=null;initialReadingPositionResolvedV1003=false;positionUnreadOnNextRenderV924=false;
    previousMessageIdsV925=new Set();pendingNewMessageCountV925=0;visibleMessageLimitV925=50;
    olderMessagesV931=[];oldestMessageDocV931=null;hasOlderMessagesV931=true;loadingOlderMessagesV931=false;
  }
  function stopChatListenersV915(){
    if(roomUnsubscribeV915)roomUnsubscribeV915();
    if(ownReadUnsubscribeV915)ownReadUnsubscribeV915();
    roomUnsubscribeV915=null;ownReadUnsubscribeV915=null;
    stopConversationListenersV915();roomsV915=[];ownReadStatesV915.clear();activeRoomIdV915='';
  }
  function unreadForRoomV915(room){
    if(emailV915(room.lastSenderEmail)===emailV915())return 0;
    const state=ownReadStatesV915.get(room.id);
    const count=Number(room.messageCount||0),read=Number(state?.lastReadMessageCount||0);
    if(count)return Math.max(0,count-read);
    return timeMsV915(room.lastMessageAt)>timeMsV915(state?.lastReadAt)?1:0;
  }
  function updateChatBadgeV915(){
    const total=roomsV915.reduce((sum,room)=>sum+(roomMutedV924(room)?0:unreadForRoomV915(room)),0);
    const badge=document.getElementById('chatBadgeV915');if(!badge)return;
    badge.hidden=!total;badge.textContent=total>99?'99+':String(total);
    document.getElementById('chatButtonV915')?.setAttribute('aria-label',total?`聊天室，${total} 則未讀訊息`:'聊天室');
  }
  function setChatVisibleV915(){
    const button=document.getElementById('chatButtonV915');
    if(button)button.hidden=!settingV915.enabled;
    if(!settingV915.enabled)closeChatV915();
    syncFeatureSettingV915();
  }
  function syncFeatureSettingV915(preserveInput=false){
    const input=document.getElementById('chatEnabledV915'),text=document.getElementById('chatEnabledTextV915');
    if(input&&!settingSaveBusyV915&&!preserveInput)input.checked=!!settingV915.enabled;
    if(text)text.textContent=(input?.checked??settingV915.enabled)?'啟用':'停用';
    if(!preserveInput&&typeof window.setFeatureSettingDirty==='function')window.setFeatureSettingDirty('chat',false);
  }
  function createChatDomV915(){
    const userArea=document.querySelector('.topUserArea');
    if(userArea&&!document.getElementById('chatButtonV915')){
      const button=document.createElement('button');
      button.id='chatButtonV915';button.className='chatButtonV915';button.type='button';button.title='聊天室';button.setAttribute('aria-label','聊天室');button.setAttribute('aria-expanded','false');
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8 8 0 0 1-8.5 8 8.7 8.7 0 0 1-3.7-.8L4 20l1.3-4.1A8 8 0 1 1 21 11.5Z"></path><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"></path></svg><span id="chatBadgeV915" class="chatBadgeV915" hidden>0</span>';
      button.onclick=toggleChatV915;
      const notification=document.getElementById('notificationBellV913');
      const userIcon=userArea.querySelector('.topUserIcon');
      userArea.insertBefore(button,notification||userIcon||userArea.querySelector('.topLogout'));
    }
    if(!document.getElementById('chatDrawerV915')){
      const drawer=document.createElement('aside');drawer.id='chatDrawerV915';drawer.className='chatDrawerV915';drawer.hidden=true;drawer.setAttribute('aria-label','即時聊天室');
      drawer.innerHTML='<header class="chatHeaderV915"><button id="chatTitleButtonV925" class="chatHeaderTitleV924" type="button" title="聊天室"><h2 id="chatHeadingV915">聊天室</h2><p id="chatSubheadingV915">與同仁即時聯繫</p></button><div class="chatHeaderActionsV915"><button id="chatBackV915" class="chatIconButtonV915" type="button" title="返回對話列表" aria-label="返回對話列表" hidden>‹</button><button id="chatSearchButtonV924" class="chatIconButtonV915" type="button" title="搜尋訊息" aria-label="搜尋訊息" hidden>⌕</button><button id="chatMuteV924" class="chatLegacyHeaderActionV925" type="button" hidden>靜音</button><button id="chatMembersV922" class="chatLegacyHeaderActionV925" type="button" hidden>成員</button><button id="chatArchiveV919" class="chatLegacyHeaderActionV925" type="button" hidden>封存</button><button id="chatMoreV924" class="chatIconButtonV915" type="button" title="更多聊天室操作" aria-label="更多聊天室操作" aria-expanded="false" hidden>⋯</button><button class="chatIconButtonV915" type="button" title="關閉聊天室" aria-label="關閉聊天室" onclick="closeChatV915()">×</button><div id="chatMoreMenuV924" class="chatMoreMenuV924" hidden><button type="button" data-chat-more-action="search">搜尋訊息</button><button type="button" data-chat-more-action="mute">靜音通知</button><button type="button" data-chat-more-action="members">群組成員</button><button type="button" data-chat-more-action="archive">封存聊天室</button></div></div></header><div id="chatRoomViewV915" class="chatRoomViewV915"><div class="chatRoomToolbarV915"><div class="chatRoomTabsV919" role="tablist" aria-label="聊天室分類"><button type="button" data-room-view="active" aria-selected="true">對話</button><button type="button" data-room-view="archived" aria-selected="false">已封存</button></div><button class="btn blue" type="button" onclick="openNewChatV915()">新增對話</button></div><div id="chatRoomListV915" class="chatRoomListV915"></div></div><div id="chatConversationV915" class="chatConversationV915" hidden><button id="chatPinnedV924" class="chatPinnedV924" type="button" hidden><span>置頂訊息</span><b id="chatPinnedTextV924"></b></button><div id="chatSearchBarV924" class="chatSearchBarV924" hidden><input id="chatMessageSearchV924" type="search" placeholder="搜尋訊息或成員" aria-label="搜尋聊天室訊息"><span id="chatSearchCountV925">0 / 0</span><button id="chatSearchPrevV925" type="button" aria-label="上一個搜尋結果">↑</button><button id="chatSearchNextV925" type="button" aria-label="下一個搜尋結果">↓</button><button class="chatIconButtonV915" type="button" aria-label="關閉搜尋">×</button></div><div id="chatMessageListV915" class="chatMessageListV915"></div><button id="chatJumpLatestV924" class="chatJumpLatestV924" type="button" hidden>跳到最新訊息</button><div id="chatMentionPanelV924" class="chatMentionPanelV924" hidden></div><div id="chatStickerPanelV915" class="chatStickerPanelV915" hidden></div><div id="chatReplyPreviewV924" class="chatReplyPreviewV924" hidden><span><small>回覆</small><b id="chatReplyTextV924"></b></span><button class="chatIconButtonV915" type="button" aria-label="取消回覆">×</button></div><form id="chatComposerV915" class="chatComposerV915"><button id="chatStickerButtonV915" class="chatIconButtonV915" type="button" title="表情符號與貼圖" aria-label="開啟表情符號與貼圖">☺</button><button id="chatMentionButtonV924" class="chatIconButtonV915" type="button" title="提及成員" aria-label="提及成員" hidden>@</button><textarea id="chatInputV915" rows="1" maxlength="1000" placeholder="輸入訊息" aria-label="輸入訊息"></textarea><button id="chatSendV915" class="btn blue" type="submit">傳送</button></form></div>';
      document.body.appendChild(drawer);
      drawer.querySelector('#chatBackV915').onclick=showRoomListV915;
      drawer.querySelector('#chatMembersV922').onclick=openChatMembersV922;
      drawer.querySelector('#chatArchiveV919').onclick=toggleCurrentRoomArchiveV919;
      drawer.querySelector('#chatSearchButtonV924').onclick=toggleChatSearchV924;
      drawer.querySelector('#chatMuteV924').onclick=toggleCurrentRoomMuteV924;
      drawer.querySelector('#chatMoreV924').onclick=toggleChatMoreMenuV924;
      drawer.querySelector('#chatTitleButtonV925').onclick=()=>{
        const room=activeGroupRoomV922();
        if(room&&emailV915()===roomOwnerEmailV922(room))openChatMembersV922();
      };
      drawer.querySelectorAll('[data-chat-more-action]').forEach(button=>button.onclick=()=>runChatMoreActionV924(button.dataset.chatMoreAction));
      drawer.querySelector('#chatStickerButtonV915').onclick=()=>{const panel=document.getElementById('chatStickerPanelV915');panel.hidden=!panel.hidden};
      drawer.querySelector('#chatMentionButtonV924').onclick=toggleMentionPanelV924;
      drawer.querySelector('#chatReplyPreviewV924 button').onclick=clearReplyTargetV924;
      drawer.querySelector('#chatSearchBarV924 button').onclick=closeChatSearchV924;
      drawer.querySelector('#chatMessageSearchV924').addEventListener('input',event=>{chatSearchQueryV924=String(event.target.value||'').trim().toLowerCase();searchMatchIndexV925=0;renderMessagesV915();focusSearchMatchV925(0)});
      drawer.querySelector('#chatSearchPrevV925').onclick=()=>focusSearchMatchV925(-1);
      drawer.querySelector('#chatSearchNextV925').onclick=()=>focusSearchMatchV925(1);
      drawer.querySelector('#chatPinnedV924').onclick=jumpToPinnedMessageV924;
      drawer.querySelector('#chatJumpLatestV924').onclick=scrollChatToLatestV924;
      drawer.querySelector('#chatMessageListV915').addEventListener('scroll',syncJumpLatestV924,{passive:true});
      drawer.querySelector('#chatComposerV915').addEventListener('submit',event=>{event.preventDefault();sendChatMessageV915('text')});
      drawer.querySelector('#chatInputV915').addEventListener('input',event=>{autoSizeChatInputV924(event.target);saveChatDraftV925();if(event.target.value.endsWith('@'))showMentionPanelV924()});
      drawer.querySelector('#chatInputV915').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMessageV915('text')}});
      drawer.addEventListener('click',event=>{if(!event.target.closest('.chatMessageV915')&&selectedMessageIdV924){selectedMessageIdV924='';renderMessagesV915()}if(!event.target.closest('#chatMoreV924')&&!event.target.closest('#chatMoreMenuV924'))closeChatMoreMenuV924()});
      drawer.querySelectorAll('[data-room-view]').forEach(button=>button.onclick=()=>setRoomViewV919(button.dataset.roomView));
      renderStickerPanelV915();
      bindChatViewportV924();
    }
    if(!document.getElementById('newChatMaskV915')){
      const mask=document.createElement('div');mask.id='newChatMaskV915';mask.className='chatModalMaskV915';mask.hidden=true;
      mask.innerHTML='<section class="chatModalV915" role="dialog" aria-modal="true" aria-labelledby="newChatTitleV915"><header><div><h2 id="newChatTitleV915">新增對話</h2><p>成員清單只顯示部門與姓名。</p></div><button class="chatIconButtonV915" type="button" aria-label="關閉" onclick="closeNewChatV915()">×</button></header><div class="chatModalBodyV915"><label class="chatSearchV915"><span>搜尋成員</span><input id="chatMemberSearchV915" type="search" placeholder="搜尋部門或姓名"></label><div id="chatMemberListV915" class="chatMemberListV915"></div><label id="chatGroupNameFieldV915" class="chatGroupNameFieldV915" hidden><span>群組名稱</span><input id="chatGroupNameV915" maxlength="40" placeholder="請輸入群組名稱"></label><p id="chatCreateErrorV915" class="chatErrorV915"></p></div><footer><button class="btn" type="button" onclick="closeNewChatV915()">取消</button><button id="createChatRoomV915" class="btn blue" type="button" onclick="createChatRoomV915()">建立對話</button></footer></section>';
      document.body.appendChild(mask);
      mask.querySelector('#chatMemberSearchV915').addEventListener('input',renderMemberPickerV915);
      mask.addEventListener('click',event=>{if(event.target===mask)closeNewChatV915()});
    }
    if(!document.getElementById('chatMembersMaskV922')){
      const mask=document.createElement('div');mask.id='chatMembersMaskV922';mask.className='chatModalMaskV915';mask.hidden=true;
      mask.innerHTML='<section class="chatModalV915 chatMembersDialogV922" role="dialog" aria-modal="true" aria-labelledby="chatMembersTitleV922"><header><div><h2 id="chatMembersTitleV922">群組成員</h2><p id="chatMembersSummaryV922"></p></div><button class="chatIconButtonV915" type="button" aria-label="關閉" onclick="closeChatMembersV922()">×</button></header><div class="chatModalBodyV915"><div id="chatMembersViewV922"><div id="chatRenameRoomV925" class="chatRenameRoomV925" hidden><label><span>群組名稱</span><input id="chatRoomNameV925" maxlength="40"></label><button class="btn" type="button" onclick="saveChatRoomNameV925()">儲存名稱</button></div><div id="chatCurrentMembersV922" class="chatCurrentMembersV922"></div><div class="chatMemberPanelActionsV922"><button class="btn blue" type="button" onclick="showAddChatMembersV922()">加入成員</button><button id="leaveChatRoomV922" class="btn red" type="button" onclick="leaveChatRoomV922()">離開群組</button></div></div><div id="chatAddMembersViewV922" hidden><label class="chatSearchV915"><span>搜尋可加入成員</span><input id="chatAddMemberSearchV922" type="search" placeholder="搜尋部門或姓名"></label><div id="chatAddMemberListV922" class="chatMemberListV915"></div><p id="chatMemberErrorV922" class="chatErrorV915"></p></div></div><footer><button id="chatMembersBackV922" class="btn" type="button" onclick="hideAddChatMembersV922()" hidden>返回成員名單</button><button class="btn" type="button" onclick="closeChatMembersV922()">關閉</button><button id="chatAddMembersSaveV922" class="btn blue" type="button" onclick="addChatMembersV922()" hidden>加入群組</button></footer></section>';
      document.body.appendChild(mask);
      mask.querySelector('#chatAddMemberSearchV922').addEventListener('input',renderAddChatMembersV922);
      mask.addEventListener('click',event=>{if(event.target===mask)closeChatMembersV922()});
    }
    if(!document.getElementById('chatReadMaskV924')){
      const mask=document.createElement('div');mask.id='chatReadMaskV924';mask.className='chatModalMaskV915';mask.hidden=true;
      mask.innerHTML='<section class="chatModalV915 chatReadDialogV924" role="dialog" aria-modal="true" aria-labelledby="chatReadTitleV924"><header><div><h2 id="chatReadTitleV924">訊息閱讀狀態</h2><p id="chatReadSummaryV924"></p></div><button class="chatIconButtonV915" type="button" aria-label="關閉" onclick="closeChatReadDetailsV924()">×</button></header><div id="chatReadBodyV924" class="chatModalBodyV915 chatReadBodyV924"></div><footer><button class="btn" type="button" onclick="closeChatReadDetailsV924()">關閉</button></footer></section>';
      document.body.appendChild(mask);
      mask.addEventListener('click',event=>{if(event.target===mask)closeChatReadDetailsV924()});
    }
    setChatVisibleV915();
  }
  function renderStickerPanelV915(){
    const panel=document.getElementById('chatStickerPanelV915');if(!panel)return;
    const recent=recentExpressionsV919();
    const recentEntries=recent.map(item=>({
      item,
      display:item.kind==='sticker'?STICKERS_V915.find(sticker=>sticker.id===item.value):{symbol:item.value,label:item.value}
    })).filter(entry=>entry.display);
    const recentHtml=recentEntries.map((entry,index)=>`<button class="${entry.item.kind==='sticker'&&entry.display.image?'stickerImageButtonV920':''}" type="button" data-recent-index="${index}" title="${escAttr(entry.display.label)}">${entry.item.kind==='sticker'?stickerPickerVisualV920(entry.display):entry.display.symbol}</button>`).join('');
    const categoryButtons=STICKER_CATEGORIES_V921.map(category=>`<button type="button" data-sticker-category="${category.id}" aria-selected="${stickerCategoryV921===category.id}">${esc(category.label)}</button>`).join('');
    const categoryStickers=STICKERS_V915.filter(item=>item.category===stickerCategoryV921);
    panel.innerHTML=`<div class="chatExpressionTabsV919" role="tablist"><button type="button" data-expression-tab="emoji" aria-selected="${expressionTabV919==='emoji'}">表情</button><button type="button" data-expression-tab="sticker" aria-selected="${expressionTabV919==='sticker'}">貼圖</button></div>${recentHtml?`<div class="chatExpressionGroupV919"><b>最近使用</b><div class="chatExpressionGridV919 chatRecentGridV921">${recentHtml}</div></div>`:''}<div class="chatExpressionPaneV919" data-expression-pane="emoji" ${expressionTabV919==='emoji'?'':'hidden'}><div class="chatExpressionGridV919">${EMOJIS_V919.map(item=>`<button type="button" data-emoji="${escAttr(item)}" aria-label="插入 ${escAttr(item)}">${item}</button>`).join('')}</div></div><div class="chatExpressionPaneV919" data-expression-pane="sticker" ${expressionTabV919==='sticker'?'':'hidden'}><div class="chatStickerCategoriesV921" role="tablist" aria-label="貼圖分類">${categoryButtons}</div><div class="chatExpressionGridV919">${categoryStickers.map(item=>`<button class="${item.image?'stickerImageButtonV920':''}" type="button" data-sticker="${item.id}" title="${escAttr(item.label)}" aria-label="傳送${escAttr(item.label)}貼圖">${stickerPickerVisualV920(item)}</button>`).join('')}</div></div>`;
    panel.querySelectorAll('[data-expression-tab]').forEach(button=>button.onclick=()=>{expressionTabV919=button.dataset.expressionTab;renderStickerPanelV915()});
    panel.querySelectorAll('[data-sticker-category]').forEach(button=>button.onclick=()=>{stickerCategoryV921=button.dataset.stickerCategory;renderStickerPanelV915()});
    panel.querySelectorAll('[data-emoji]').forEach(button=>button.onclick=()=>insertEmojiV919(button.dataset.emoji));
    panel.querySelectorAll('[data-sticker]').forEach(button=>button.onclick=()=>{rememberExpressionV919('sticker',button.dataset.sticker);sendChatMessageV915('sticker',button.dataset.sticker)});
    panel.querySelectorAll('[data-recent-index]').forEach(button=>button.onclick=()=>{const item=recentEntries[Number(button.dataset.recentIndex)]?.item;if(item?.kind==='sticker')sendChatMessageV915('sticker',item.value);else if(item)insertEmojiV919(item.value)});
  }
  function stickerPickerVisualV920(sticker){return sticker?.image?`<img src="${escAttr(sticker.image)}" alt="" loading="lazy">`:esc(sticker?.symbol||'🙂')}
  function recentKeyV919(){return 'deptdineChatRecentV919__'+(emailV915()||'guest')}
  function recentExpressionsV919(){try{const value=JSON.parse(localStorage.getItem(recentKeyV919())||'[]');return Array.isArray(value)?value.slice(0,8):[]}catch(e){return []}}
  function rememberExpressionV919(kind,value){
    const next=[{kind,value},...recentExpressionsV919().filter(item=>item.kind!==kind||item.value!==value)].slice(0,8);
    try{localStorage.setItem(recentKeyV919(),JSON.stringify(next))}catch(e){}
  }
  function insertEmojiV919(value){
    const input=document.getElementById('chatInputV915');if(!input)return;
    const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
    input.setRangeText(value,start,end,'end');rememberExpressionV919('emoji',value);input.focus();renderStickerPanelV915();
  }
  function renderMemberPickerV915(){
    const list=document.getElementById('chatMemberListV915');if(!list)return;
    const query=String(document.getElementById('chatMemberSearchV915')?.value||'').trim().toLowerCase();
    const items=memberOptionsV915().filter(item=>!query||item.label.toLowerCase().includes(query));
    list.innerHTML=items.length?items.map(item=>`<label class="chatMemberOptionV915"><input type="checkbox" value="${escAttr(item.email)}"><span><b>${esc(item.label)}</b></span></label>`).join(''):'<div class="chatEmptyV915"><b>查無可選成員</b><span>請確認人員管理已設定 Google 帳號。</span></div>';
    list.querySelectorAll('input').forEach(input=>input.addEventListener('change',updateGroupNameVisibilityV915));
    updateGroupNameVisibilityV915();
  }
  function selectedMemberEmailsV915(){return [...document.querySelectorAll('#chatMemberListV915 input:checked')].map(input=>emailV915(input.value))}
  function updateGroupNameVisibilityV915(){
    const group=selectedMemberEmailsV915().length>1,field=document.getElementById('chatGroupNameFieldV915');if(field)field.hidden=!group;
  }
  function bindChatViewportV924(){
    if(chatViewportBoundV924)return;chatViewportBoundV924=true;
    const sync=()=>{
      const drawer=document.getElementById('chatDrawerV915'),viewport=window.visualViewport;if(!drawer)return;
      if(viewport&&window.matchMedia('(max-width:680px)').matches){drawer.style.setProperty('--chatViewportHeightV924',Math.round(viewport.height)+'px');drawer.style.setProperty('--chatViewportTopV924',Math.round(viewport.offsetTop)+'px')}
      else{drawer.style.removeProperty('--chatViewportHeightV924');drawer.style.removeProperty('--chatViewportTopV924')}
    };
    window.visualViewport?.addEventListener('resize',sync);window.visualViewport?.addEventListener('scroll',sync);window.addEventListener('resize',sync);sync();
  }
  function autoSizeChatInputV924(input){if(!input)return;input.style.height='auto';input.style.height=Math.min(110,input.scrollHeight)+'px'}
  function roomStateIdV924(roomId=activeRoomIdV915){return roomId+'__'+encodePartV915(emailV915())}
  function roomMutedV924(room){return ownReadStatesV915.get(room?.id)?.muted===true}
  async function toggleCurrentRoomMuteV924(){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915);if(!room)return;
    const next=!roomMutedV924(room);
    try{await doc('chatReadStates',roomStateIdV924(room.id)).set({roomId:room.id,email:emailV915(),muted:next,mutedAt:next?firebase.firestore.FieldValue.serverTimestamp():null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});toast(next?'已將聊天室設為靜音':'已開啟聊天室通知')}
    catch(e){console.error('chat mute failed',e);toast('聊天室通知設定失敗')}
  }
  function syncChatHeaderControlsV924(){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915),active=!!room;
    const search=document.getElementById('chatSearchButtonV924'),mute=document.getElementById('chatMuteV924'),more=document.getElementById('chatMoreV924');
    if(search)search.hidden=!active;if(mute){mute.hidden=!active;mute.textContent=roomMutedV924(room)?'取消靜音':'靜音';mute.title=mute.textContent+'通知'}
    if(more)more.hidden=!active;
    const menu=document.getElementById('chatMoreMenuV924');if(menu&&!menu.hidden){const muteItem=menu.querySelector('[data-chat-more-action="mute"]'),memberItem=menu.querySelector('[data-chat-more-action="members"]'),archiveItem=menu.querySelector('[data-chat-more-action="archive"]');if(muteItem)muteItem.textContent=roomMutedV924(room)?'取消靜音':'靜音通知';if(memberItem)memberItem.hidden=room?.type!=='group';if(archiveItem)archiveItem.textContent=roomArchivedV919(room)?'取消封存':'封存聊天室'}
  }
  function toggleChatMoreMenuV924(){const menu=document.getElementById('chatMoreMenuV924'),button=document.getElementById('chatMoreV924');if(!menu||!button)return;menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));syncChatHeaderControlsV924()}
  function closeChatMoreMenuV924(){const menu=document.getElementById('chatMoreMenuV924'),button=document.getElementById('chatMoreV924');if(menu)menu.hidden=true;if(button)button.setAttribute('aria-expanded','false')}
  function runChatMoreActionV924(action){closeChatMoreMenuV924();if(action==='search')toggleChatSearchV924();else if(action==='mute')toggleCurrentRoomMuteV924();else if(action==='members')openChatMembersV922();else if(action==='archive')toggleCurrentRoomArchiveV919()}
  function toggleChatSearchV924(){const bar=document.getElementById('chatSearchBarV924'),input=document.getElementById('chatMessageSearchV924');if(!bar||!input)return;bar.hidden=!bar.hidden;if(!bar.hidden)input.focus();else closeChatSearchV924()}
  function closeChatSearchV924(){const bar=document.getElementById('chatSearchBarV924'),input=document.getElementById('chatMessageSearchV924');chatSearchQueryV924='';if(input)input.value='';if(bar)bar.hidden=true;renderMessagesV915()}
  function focusSearchMatchV925(step=0){
    const matches=[...document.querySelectorAll('#chatMessageListV915 [data-message-id]')];
    if(!matches.length){searchMatchIndexV925=0;syncSearchCountV925(0);return}
    searchMatchIndexV925=(searchMatchIndexV925+step+matches.length)%matches.length;
    matches.forEach((item,index)=>item.classList.toggle('chatSearchCurrentV925',index===searchMatchIndexV925));
    matches[searchMatchIndexV925]?.scrollIntoView({block:'center',behavior:'smooth'});syncSearchCountV925(matches.length);
  }
  function syncSearchCountV925(total){const count=document.getElementById('chatSearchCountV925');if(count)count.textContent=total?`${searchMatchIndexV925+1} / ${total}`:'0 / 0'}
  async function loadOlderMessagesV925(){
    const list=document.getElementById('chatMessageListV915');
    if(!list||!activeRoomIdV915||!oldestMessageDocV931||!hasOlderMessagesV931||loadingOlderMessagesV931)return;
    loadingOlderMessagesV931=true;renderMessagesV915();const oldHeight=list.scrollHeight;
    try{
      const snapshot=await col('chatMessages').where('roomId','==',activeRoomIdV915).orderBy('createdAt','desc').startAfter(oldestMessageDocV931).limit(CHAT_MESSAGE_PAGE_SIZE_V931).get();
      const next=snapshot.docs.map(item=>({id:item.id,...item.data()}));
      oldestMessageDocV931=snapshot.docs[snapshot.docs.length-1]||oldestMessageDocV931;
      hasOlderMessagesV931=snapshot.size===CHAT_MESSAGE_PAGE_SIZE_V931;
      const merged=new Map([...olderMessagesV931,...next].map(item=>[item.id,item]));olderMessagesV931=[...merged.values()];
      const activeMap=new Map([...olderMessagesV931,...activeMessagesV915].map(item=>[item.id,item]));activeMessagesV915=[...activeMap.values()].sort((a,b)=>timeMsV915(a.createdAt)-timeMsV915(b.createdAt));
      visibleMessageLimitV925=activeMessagesV915.length;
    }catch(e){console.error('load older chat messages failed',e);toast('較早訊息載入失敗，請稍後再試')}
    finally{loadingOlderMessagesV931=false;renderMessagesV915();requestAnimationFrame(()=>{list.scrollTop=Math.max(0,list.scrollHeight-oldHeight)})}
  }
  function formatMessagePreviewV924(message){
    if(!message)return '';
    if(message.recalled===true)return '此訊息已收回';
    if(message.type==='sticker'){const sticker=STICKERS_V915.find(item=>item.id===message.stickerId);return sticker?.label||'貼圖'}
    return String(message.text||'').replace(/\s+/g,' ').trim().slice(0,80);
  }
  function setReplyTargetV924(messageId){const message=activeMessagesV915.find(item=>item.id===messageId);if(!message||message.type==='system'||message.recalled===true)return;replyTargetV924=message;const preview=document.getElementById('chatReplyPreviewV924'),text=document.getElementById('chatReplyTextV924');if(text)text.textContent=(message.senderName||memberLabelByEmailV915(message.senderEmail))+'：'+formatMessagePreviewV924(message);if(preview)preview.hidden=false;document.getElementById('chatInputV915')?.focus()}
  function clearReplyTargetV924(){replyTargetV924=null;const preview=document.getElementById('chatReplyPreviewV924');if(preview)preview.hidden=true}
  function showMentionPanelV924(){
    const room=activeGroupRoomV922(),panel=document.getElementById('chatMentionPanelV924');if(!room||!panel)return;
    const members=roomMembersV915(room).filter(member=>member.email!==emailV915());
    panel.innerHTML='<div class="chatMentionTitleV924">提及成員</div>'+members.map(member=>`<button type="button" data-mention-email="${escAttr(member.email)}" data-mention-label="${escAttr(member.label)}">@${esc(member.label)}</button>`).join('');
    panel.querySelectorAll('[data-mention-email]').forEach(button=>button.onclick=()=>insertMentionV924(button.dataset.mentionLabel));panel.hidden=false;
  }
  function toggleMentionPanelV924(){const panel=document.getElementById('chatMentionPanelV924');if(!panel)return;if(panel.hidden)showMentionPanelV924();else panel.hidden=true}
  function insertMentionV924(label){const input=document.getElementById('chatInputV915');if(!input)return;const mention='@'+String(label||'').trim()+' ';const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;if(input.value.slice(Math.max(0,start-1),start)==='@')input.setRangeText(mention.slice(1),start,end,'end');else input.setRangeText(mention,start,end,'end');document.getElementById('chatMentionPanelV924').hidden=true;input.focus();autoSizeChatInputV924(input)}
  function mentionedEmailsV924(text,room){return roomMembersV915(room).filter(member=>String(text||'').includes('@'+member.label)).map(member=>member.email)}
  function reactionDocIdV924(messageId){return messageId+'__'+encodePartV915(emailV915())}
  function reactionsForMessageV924(messageId){return activeReactionsV924.get(messageId)||[]}
  function reactionSummaryV924(messageId){
    const grouped=new Map();reactionsForMessageV924(messageId).forEach(item=>{const list=grouped.get(item.emoji)||[];list.push(item);grouped.set(item.emoji,list)});
    return [...grouped].map(([emoji,items])=>`<button type="button" class="chatReactionChipV924${items.some(item=>item.email===emailV915())?' own':''}" data-react-message="${escAttr(messageId)}" data-react-emoji="${escAttr(emoji)}" title="${escAttr(items.map(item=>memberLabelByEmailV915(item.email)).join('、'))}">${emoji}<span>${items.length}</span></button>`).join('');
  }
  async function toggleChatReactionV924(messageId,emoji){
    const message=activeMessagesV915.find(item=>item.id===messageId);if(!message||message.recalled===true)return;
    const id=reactionDocIdV924(messageId),existing=reactionsForMessageV924(messageId).find(item=>item.email===emailV915());
    try{if(existing?.emoji===emoji)await doc('chatReactions',id).delete();else await doc('chatReactions',id).set({roomId:activeRoomIdV915,messageId,email:emailV915(),emoji,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}
    catch(e){console.error('chat reaction failed',e);toast('訊息表情更新失敗')}
  }
  async function togglePinnedMessageV924(messageId){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915),message=activeMessagesV915.find(item=>item.id===messageId);if(!room||!message||message.recalled===true)return;
    const unpin=room.pinnedMessageId===messageId,now=firebase.firestore.FieldValue.serverTimestamp();
    try{await doc('chatRooms',room.id).set({pinnedMessageId:unpin?'':messageId,pinnedMessageText:unpin?'':formatMessagePreviewV924(message),pinnedByEmail:unpin?'':emailV915(),pinnedByName:unpin?'':currentLabelV915(),pinnedAt:now},{merge:true});toast(unpin?'已取消置頂訊息':'訊息已置頂')}
    catch(e){console.error('pin chat message failed',e);toast(e?.code==='permission-denied'?'置頂權限遭拒，請部署最新版 Firestore 規則':'置頂訊息失敗')}
  }
  function syncPinnedBannerV924(){const room=roomsV915.find(item=>item.id===activeRoomIdV915),button=document.getElementById('chatPinnedV924'),text=document.getElementById('chatPinnedTextV924');if(!button||!text)return;button.hidden=!room?.pinnedMessageId;text.textContent=room?.pinnedMessageText||''}
  function jumpToPinnedMessageV924(){const room=roomsV915.find(item=>item.id===activeRoomIdV915);if(!room?.pinnedMessageId)return;const target=document.querySelector(`[data-message-id="${CSS.escape(room.pinnedMessageId)}"]`);if(!target)return toast('置頂訊息目前不在搜尋結果中');target.scrollIntoView({block:'center',behavior:'smooth'});target.classList.add('chatMessageFocusV924');setTimeout(()=>target.classList.remove('chatMessageFocusV924'),1800)}
  function readersForMessageV924(message){return [...activeReadStatesV915.values()].filter(state=>emailV915(state.email)!==emailV915(message.senderEmail)&&timeMsV915(state.lastReadAt)>=timeMsV915(message.createdAt))}
  function openChatReadDetailsV924(messageId){
    const message=activeMessagesV915.find(item=>item.id===messageId),mask=document.getElementById('chatReadMaskV924'),body=document.getElementById('chatReadBodyV924'),summary=document.getElementById('chatReadSummaryV924');if(!message||!mask||!body)return;
    const readers=readersForMessageV924(message);if(summary)summary.textContent=readers.length?`${readers.length} 位成員已讀`:'目前尚無其他成員已讀';
    body.innerHTML=readers.length?readers.map(state=>`<div class="chatReadPersonV924"><span>${esc(memberLabelByEmailV915(state.email))}</span><time>${esc(dateTimeV915(state.lastReadAt))}</time></div>`).join(''):'<div class="chatEmptyV915"><b>尚未讀取</b><span>成員閱讀後會顯示於此。</span></div>';mask.hidden=false;document.body.classList.add('modalOpen');
  }
  function closeChatReadDetailsV924(){const mask=document.getElementById('chatReadMaskV924');if(mask)mask.hidden=true;document.body.classList.remove('modalOpen')}
  function scrollChatToLatestV924(){const list=document.getElementById('chatMessageListV915');if(!list)return;visibleMessageLimitV925=50;pendingNewMessageCountV925=0;renderMessagesV915();requestAnimationFrame(()=>list.scrollTo({top:list.scrollHeight,behavior:'smooth'}));document.getElementById('chatJumpLatestV924').hidden=true}
  function syncJumpLatestV924(){const list=document.getElementById('chatMessageListV915'),button=document.getElementById('chatJumpLatestV924');if(!list||!button)return;const near=list.scrollHeight-list.scrollTop-list.clientHeight<110;if(near)pendingNewMessageCountV925=0;button.textContent=pendingNewMessageCountV925?`${pendingNewMessageCountV925} 則新訊息`:'跳到最新訊息';button.hidden=near}
  function roomArchivedV919(room){
    const state=ownReadStatesV915.get(room.id);if(state?.archived!==true)return false;
    const archivedAt=timeMsV915(state.archivedAt);return !timeMsV915(room.lastMessageAt)||timeMsV915(room.lastMessageAt)<=archivedAt;
  }
  function setRoomViewV919(view){
    roomViewV919=view==='archived'?'archived':'active';
    document.querySelectorAll('[data-room-view]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.roomView===roomViewV919)));
    renderRoomListV915();
  }
  function renderRoomListV915(){
    const list=document.getElementById('chatRoomListV915');if(!list)return;
    const ordered=roomsV915.filter(room=>roomViewV919==='archived'?roomArchivedV919(room):!roomArchivedV919(room)).sort((a,b)=>timeMsV915(b.lastMessageAt||b.updatedAt)-timeMsV915(a.lastMessageAt||a.updatedAt));
    list.innerHTML=ordered.length?ordered.map(room=>{
      const unread=unreadForRoomV915(room),last=room.lastMessageType==='recalled'?'訊息已收回':room.lastMessageType==='sticker'?'傳送了一張貼圖':(room.lastMessageText||'尚無訊息');
      return `<div class="chatRoomRowV919"><button class="chatRoomItemV915${unread?' unread':''}" type="button" data-room-id="${escAttr(room.id)}"><span class="chatAvatarV915">${esc(roomTitleV915(room).slice(0,1))}</span><span class="chatRoomTextV915"><strong>${esc(roomTitleV915(room))}${roomMutedV924(room)?'<span class="chatMutedMarkV924" title="已靜音">靜音</span>':''}</strong><small>${esc(last)}</small></span><span class="chatRoomMetaV915"><time>${esc(dateTimeV915(room.lastMessageAt||room.updatedAt))}</time>${unread?`<b>${unread>99?'99+':unread}</b>`:''}</span></button><button class="chatRoomArchiveV919" type="button" data-archive-room="${escAttr(room.id)}">${roomViewV919==='archived'?'取消封存':'封存'}</button></div>`;
    }).join(''):`<div class="chatEmptyV915"><b>${roomViewV919==='archived'?'沒有已封存的對話':'尚無對話'}</b><span>${roomViewV919==='archived'?'封存的聊天室會集中顯示在這裡。':'建立一對一或多人聊天室，開始與同仁聯繫。'}</span>${roomViewV919==='archived'?'':'<button class="btn blue" type="button" onclick="openNewChatV915()">新增對話</button>'}</div>`;
    list.querySelectorAll('[data-room-id]').forEach(button=>button.onclick=()=>openRoomV915(button.dataset.roomId));
    list.querySelectorAll('[data-archive-room]').forEach(button=>button.onclick=()=>setRoomArchivedV919(button.dataset.archiveRoom,roomViewV919!=='archived'));
    updateChatBadgeV915();
  }
  function readReceiptV915(message,index){
    if(emailV915(message.senderEmail)!==emailV915())return '';
    const readers=readersForMessageV924(message);
    const room=roomsV915.find(item=>item.id===activeRoomIdV915);
    if(room?.type==='direct')return readers.length?'已讀':'已送出';
    return readers.length?`已讀 ${readers.length} 人`:'已送出';
  }
  function systemMessageTextV922(message){
    const actor=String(message.senderName||memberLabelByEmailV915(message.senderEmail)||'群組成員');
    const targets=Array.isArray(message.systemTargetLabels)?message.systemTargetLabels.filter(Boolean).join('、'):'';
    if(message.systemAction==='member_added')return `${actor} 已將 ${targets||'新成員'} 加入群組`;
    if(message.systemAction==='member_removed')return `${actor} 已將 ${targets||'一位成員'} 移出群組`;
    if(message.systemAction==='member_left')return `${actor} 已離開群組`;
    return String(message.text||'群組成員已更新');
  }
  function activeGroupRoomV922(){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915);
    return room?.type==='group'?room:null;
  }
  function roomOwnerEmailV922(room){return emailV915(room?.createdByEmail)}
  function confirmChatActionV922(message,title){
    return typeof window.adminConfirmV908==='function'?window.adminConfirmV908(message,title):Promise.resolve(window.confirm(message));
  }
  function renderCurrentChatMembersV922(){
    const room=activeGroupRoomV922(),list=document.getElementById('chatCurrentMembersV922'),summary=document.getElementById('chatMembersSummaryV922');if(!room||!list)return;
    const owner=roomOwnerEmailV922(room),current=emailV915(),members=roomMembersV915(room);
    if(summary)summary.textContent=`${roomTitleV915(room)}・${members.length} 位成員`;
    list.innerHTML=members.map(member=>{
      const isOwner=member.email===owner,isCurrent=member.email===current;
      return `<div class="chatCurrentMemberV922"><span class="chatMemberAvatarV922">${esc(member.label.slice(0,1))}</span><span><b>${esc(member.label)}</b><small>${isOwner?'群組建立者':isCurrent?'你':'群組成員'}</small></span>${!isOwner&&!isCurrent?`<button class="btn red" type="button" data-remove-chat-member="${escAttr(member.email)}">移除</button>`:''}</div>`;
    }).join('');
    list.querySelectorAll('[data-remove-chat-member]').forEach(button=>button.onclick=()=>removeChatMemberV922(button.dataset.removeChatMember));
    const leave=document.getElementById('leaveChatRoomV922');if(leave){leave.disabled=current===owner;leave.title=current===owner?'群組建立者不可直接離開群組':''}
    const rename=document.getElementById('chatRenameRoomV925'),nameInput=document.getElementById('chatRoomNameV925');if(rename)rename.hidden=current!==owner;if(nameInput)nameInput.value=room.name||'';
  }
  async function saveChatRoomNameV925(){
    const room=activeGroupRoomV922(),input=document.getElementById('chatRoomNameV925');if(!room||!input||emailV915()!==roomOwnerEmailV922(room))return;
    const name=String(input.value||'').trim();if(!name)return toast('請輸入群組名稱');if(name===room.name)return toast('群組名稱沒有變更');
    try{await doc('chatRooms',room.id).set({name,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});room.name=name;document.getElementById('chatHeadingV915').textContent=name;document.getElementById('chatTitleButtonV925').title=name;renderCurrentChatMembersV922();renderRoomListV915();toast('群組名稱已更新')}
    catch(e){console.error('rename chat room failed',e);toast(e?.code==='permission-denied'?'只有群組建立者可以修改名稱':'群組名稱更新失敗')}
  }
  function renderAddChatMembersV922(){
    const room=activeGroupRoomV922(),list=document.getElementById('chatAddMemberListV922');if(!room||!list)return;
    const existing=new Set(roomMembersV915(room).map(member=>member.email));
    const query=String(document.getElementById('chatAddMemberSearchV922')?.value||'').trim().toLowerCase();
    const options=memberOptionsV915().filter(item=>!existing.has(item.email)&&(!query||item.label.toLowerCase().includes(query)));
    list.innerHTML=options.length?options.map(item=>`<label class="chatMemberOptionV915"><input type="checkbox" value="${escAttr(item.email)}"><span><b>${esc(item.label)}</b></span></label>`).join(''):'<div class="chatEmptyV915"><b>沒有可加入的成員</b><span>目前名單中的同仁都已在群組內，或搜尋不到符合的人員。</span></div>';
  }
  function openChatMembersV922(){
    const room=activeGroupRoomV922(),mask=document.getElementById('chatMembersMaskV922');if(!room||!mask)return;
    renderCurrentChatMembersV922();hideAddChatMembersV922();mask.hidden=false;document.body.classList.add('modalOpen');
  }
  function closeChatMembersV922(){const mask=document.getElementById('chatMembersMaskV922');if(mask)mask.hidden=true;document.body.classList.remove('modalOpen')}
  function showAddChatMembersV922(){
    document.getElementById('chatMembersViewV922').hidden=true;document.getElementById('chatAddMembersViewV922').hidden=false;document.getElementById('chatMembersBackV922').hidden=false;document.getElementById('chatAddMembersSaveV922').hidden=false;document.getElementById('chatMemberErrorV922').textContent='';document.getElementById('chatAddMemberSearchV922').value='';renderAddChatMembersV922();document.getElementById('chatAddMemberSearchV922').focus();
  }
  function hideAddChatMembersV922(){
    const view=document.getElementById('chatMembersViewV922');if(!view)return;view.hidden=false;document.getElementById('chatAddMembersViewV922').hidden=true;document.getElementById('chatMembersBackV922').hidden=true;document.getElementById('chatAddMembersSaveV922').hidden=true;
  }
  async function updateChatMembersV922(nextEmails,action,targetEmails,targetLabels){
    const room=activeGroupRoomV922();if(!room)return false;
    const emails=[...new Set(nextEmails.map(emailV915).filter(Boolean))].sort();
    if(emails.length<2||emails.length>30)return false;
    const labels=emails.map(memberLabelByEmailV915),messageRef=col('chatMessages').doc(),batch=db.batch(),now=firebase.firestore.FieldValue.serverTimestamp();
    const actionText=action==='member_added'?`${currentLabelV915()} 加入了 ${targetLabels.join('、')}`:action==='member_removed'?`${currentLabelV915()} 移除了 ${targetLabels.join('、')}`:`${currentLabelV915()} 已離開群組`;
    batch.set(messageRef,{roomId:room.id,senderEmail:emailV915(),senderUid:currentUser?.uid||'',senderName:currentLabelV915(),type:'system',text:'',stickerId:'',systemAction:action,systemTargetEmails:targetEmails.map(emailV915),systemTargetLabels:targetLabels,recalled:false,createdAt:now});
    batch.set(doc('chatRooms',room.id),{memberEmails:emails,memberLabels:labels,lastMessageId:messageRef.id,lastMessageAt:now,lastMessageText:actionText,lastMessageType:'system',lastSenderEmail:emailV915(),messageCount:firebase.firestore.FieldValue.increment(1),updatedAt:now},{merge:true});
    await batch.commit();
    room.memberEmails=emails;room.memberLabels=labels;room.lastMessageId=messageRef.id;room.lastMessageText=actionText;room.lastMessageType='system';room.lastSenderEmail=emailV915();room.messageCount=Number(room.messageCount||0)+1;
    return true;
  }
  async function addChatMembersV922(){
    const room=activeGroupRoomV922(),error=document.getElementById('chatMemberErrorV922'),button=document.getElementById('chatAddMembersSaveV922');if(!room||!error||!button)return;
    const selected=[...document.querySelectorAll('#chatAddMemberListV922 input:checked')].map(input=>emailV915(input.value));
    if(!selected.length){error.textContent='請至少選擇一位成員。';return}
    const existing=roomMembersV915(room).map(member=>member.email),next=[...new Set([...existing,...selected])];
    if(next.length>30){error.textContent='每個聊天室最多 30 位成員。';return}
    button.disabled=true;error.textContent='';
    try{await updateChatMembersV922(next,'member_added',selected,selected.map(memberLabelByEmailV915));hideAddChatMembersV922();renderCurrentChatMembersV922();toast('成員已加入群組')}
    catch(e){console.error('add chat members failed',e);error.textContent=e?.code==='permission-denied'?'加入成員權限遭拒，請確認已部署最新版 Firestore 規則。':'加入成員失敗，請稍後再試。'}
    finally{button.disabled=false}
  }
  async function removeChatMemberV922(targetEmail){
    const room=activeGroupRoomV922(),target=emailV915(targetEmail);if(!room||!target)return;
    if(target===roomOwnerEmailV922(room))return toast('群組建立者不可被移除');
    const label=memberLabelByEmailV915(target),confirmed=await confirmChatActionV922(`確定要將「${label}」移出這個群組嗎？`,'移除群組成員');if(!confirmed)return;
    try{await updateChatMembersV922(roomMembersV915(room).map(member=>member.email).filter(email=>email!==target),'member_removed',[target],[label]);renderCurrentChatMembersV922();toast(`${label} 已移出群組`)}
    catch(e){console.error('remove chat member failed',e);toast(e?.code==='permission-denied'?'移除權限遭拒，請確認已部署最新版 Firestore 規則':'移除成員失敗')}
  }
  async function leaveChatRoomV922(){
    const room=activeGroupRoomV922(),current=emailV915();if(!room||!current)return;
    if(current===roomOwnerEmailV922(room))return toast('群組建立者不可直接離開群組');
    const confirmed=await confirmChatActionV922('確定要離開這個群組嗎？離開後將無法查看聊天室與歷史訊息。','離開群組');if(!confirmed)return;
    try{await updateChatMembersV922(roomMembersV915(room).map(member=>member.email).filter(email=>email!==current),'member_left',[current],[currentLabelV915()]);closeChatMembersV922();showRoomListV915();toast('已離開群組')}
    catch(e){console.error('leave chat room failed',e);toast(e?.code==='permission-denied'?'離開群組權限遭拒，請確認已部署最新版 Firestore 規則':'離開群組失敗')}
  }
  function renderMessagesV915(){
    const list=document.getElementById('chatMessageListV915');if(!list)return;
    const renderTokenV1004=messageRenderGuardV1004?.next();
    const wasNearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<110,previousTop=list.scrollTop;
    const query=chatSearchQueryV924;
    const filtered=query?activeMessagesV915.filter(message=>{
      const haystack=[message.text,message.senderName,memberLabelByEmailV915(message.senderEmail),message.type==='system'?systemMessageTextV922(message):'',message.replyToText,dateTimeV915(message.createdAt)].join(' ').toLowerCase();return haystack.includes(query);
    }):activeMessagesV915;
    const messages=query?filtered:filtered.slice(-visibleMessageLimitV925),hasOlder=!query&&(filtered.length>messages.length||hasOlderMessagesV931);
    let previousDate='';
    list.innerHTML=(hasOlder?`<button class="chatLoadOlderV925" type="button" onclick="loadOlderMessagesV925()"${loadingOlderMessagesV931?' disabled':''}>${loadingOlderMessagesV931?'載入中…':'載入較早訊息'}</button>`:'')+(messages.length?messages.map((message,index)=>{
      const own=emailV915(message.senderEmail)===emailV915(),sticker=STICKERS_V915.find(item=>item.id===message.stickerId);
      const currentDate=dateKeyV925(message.createdAt),dateDivider=currentDate!==previousDate?`<div class="chatDateDividerV925"><span>${esc(dateDividerV925(message.createdAt))}</span></div>`:'';previousDate=currentDate;
      const recalled=message.recalled===true;
      const stickerBody=sticker?.image?`<img class="chatStickerImageV920" src="${escAttr(sticker.image)}" alt="${escAttr(sticker.label||'貼圖')}" loading="lazy">`:`<span class="chatStickerMessageV915" role="img" aria-label="${escAttr(sticker?.label||'貼圖')}">${sticker?.symbol||'🙂'}</span>`;
      const unreadDivider=!query&&message.id===unreadBoundaryMessageIdV924?'<div class="chatUnreadDividerV924"><span>以下為未讀訊息</span></div>':'';
      if(message.type==='system')return dateDivider+unreadDivider+`<div class="chatSystemMessageV922" data-message-id="${escAttr(message.id)}"><span>${esc(systemMessageTextV922(message))}</span><small>${esc(dateTimeV915(message.createdAt))}</small></div>`;
      const reply=message.replyToId?`<button type="button" class="chatReplyQuoteV924" data-jump-reply="${escAttr(message.replyToId)}"><small>${esc(message.replyToSenderName||'回覆訊息')}</small><span>${esc(message.replyToText||'')}</span></button>`:'';
      const body=recalled?'<span class="chatBubbleV915 recalled">此訊息已收回</span>':message.type==='sticker'?stickerBody:`<span class="chatBubbleV915">${linkifyMessageV925(message.text||'')}</span>`;
      const recall=own&&!recalled&&Date.now()-timeMsV915(message.createdAt)<=10*60*1000?`<button class="chatRecallV919" type="button" data-recall-message="${escAttr(message.id)}"${recallingMessageIdV919===message.id?' disabled':''}>${recallingMessageIdV919===message.id?'收回中':'收回'}</button>`:'';
      const mentioned=Array.isArray(message.mentionEmails)&&message.mentionEmails.map(emailV915).includes(emailV915());
      const pinLabel=roomsV915.find(item=>item.id===activeRoomIdV915)?.pinnedMessageId===message.id?'取消置頂':'置頂';
      const actions=!recalled?`<div class="chatMessageActionsV924"><button type="button" data-reply-message="${escAttr(message.id)}">回覆</button>${['👍','😂','❤️','✅'].map(emoji=>`<button type="button" data-react-message="${escAttr(message.id)}" data-react-emoji="${escAttr(emoji)}" aria-label="以 ${escAttr(emoji)} 回應">${emoji}</button>`).join('')}<button type="button" data-pin-message="${escAttr(message.id)}">${pinLabel}</button></div>`:'';
      const receipt=own&&!recalled?`<button class="chatReadReceiptV924" type="button" data-read-message="${escAttr(message.id)}">${esc(readReceiptV915(message,index))}</button>`:'';
      return dateDivider+unreadDivider+`<div class="chatMessageV915${own?' own':''}${mentioned?' mentioned':''}${selectedMessageIdV924===message.id?' actionsOpen':''}" data-message-id="${escAttr(message.id)}">${!own?`<b>${esc(message.senderName||memberLabelByEmailV915(message.senderEmail))}</b>`:''}${reply}<div role="button" tabindex="0" class="chatMessageBodyV924" data-select-message="${escAttr(message.id)}">${body}</div><div class="chatReactionRowV924">${reactionSummaryV924(message.id)}</div>${actions}<div class="chatMessageMetaV919"><small>${esc(dateTimeV915(message.createdAt))}</small>${receipt}${recall}</div></div>`;
    }).join(''):`<div class="chatEmptyV915"><b>${query?'找不到訊息':'尚無訊息'}</b><span>${query?'請換一個關鍵字搜尋。':'從這裡開始第一則訊息。'}</span></div>`);
    list.querySelectorAll('[data-recall-message]').forEach(button=>button.onclick=()=>recallChatMessageV919(button.dataset.recallMessage));
    list.querySelectorAll('[data-select-message]').forEach(button=>{button.onclick=event=>{if(event.target.closest('a'))return;selectedMessageIdV924=selectedMessageIdV924===button.dataset.selectMessage?'':button.dataset.selectMessage;renderMessagesV915()};button.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();button.click()}}});
    list.querySelectorAll('[data-reply-message]').forEach(button=>button.onclick=()=>setReplyTargetV924(button.dataset.replyMessage));
    list.querySelectorAll('[data-react-message]').forEach(button=>button.onclick=event=>{event.stopPropagation();toggleChatReactionV924(button.dataset.reactMessage,button.dataset.reactEmoji)});
    list.querySelectorAll('[data-pin-message]').forEach(button=>button.onclick=()=>togglePinnedMessageV924(button.dataset.pinMessage));
    list.querySelectorAll('[data-read-message]').forEach(button=>button.onclick=()=>openChatReadDetailsV924(button.dataset.readMessage));
    list.querySelectorAll('[data-jump-reply]').forEach(button=>button.onclick=()=>{const target=list.querySelector(`[data-message-id="${CSS.escape(button.dataset.jumpReply)}"]`);if(!target)return toast('原訊息目前不在搜尋結果中');target.scrollIntoView({block:'center',behavior:'smooth'});target.classList.add('chatMessageFocusV924');setTimeout(()=>target.classList.remove('chatMessageFocusV924'),1800)});
    syncSearchCountV925(query?messages.length:0);
    requestAnimationFrame(()=>{if(messageRenderGuardV1004&&!messageRenderGuardV1004.isCurrent(renderTokenV1004))return;if(positionUnreadOnNextRenderV924&&window.AdminChatReadingPosition){window.AdminChatReadingPosition.positionMessageList(list,{mode:'unread',boundaryMessageId:unreadBoundaryMessageIdV924,anchorMessageId:lastReadAnchorMessageIdV1003});positionUnreadOnNextRenderV924=false}else if(forceScrollToBottomV924||wasNearBottom){list.scrollTop=list.scrollHeight;forceScrollToBottomV924=false;pendingNewMessageCountV925=0}else list.scrollTop=previousTop;if(query)focusSearchMatchV925(0);syncJumpLatestV924()});
  }
  function showRoomListV915(){
    activeRoomIdV915='';stopConversationListenersV915();
    document.getElementById('chatRoomViewV915').hidden=false;document.getElementById('chatConversationV915').hidden=true;document.getElementById('chatBackV915').hidden=true;
    document.getElementById('chatArchiveV919').hidden=true;
    document.getElementById('chatMembersV922').hidden=true;
    document.getElementById('chatSearchButtonV924').hidden=true;document.getElementById('chatMuteV924').hidden=true;document.getElementById('chatMoreV924').hidden=true;
    document.getElementById('chatPinnedV924').hidden=true;document.getElementById('chatMentionButtonV924').hidden=true;document.getElementById('chatMentionPanelV924').hidden=true;document.getElementById('chatStickerPanelV915').hidden=true;clearReplyTargetV924();closeChatSearchV924();closeChatMoreMenuV924();
    document.getElementById('chatHeadingV915').textContent='聊天室';document.getElementById('chatSubheadingV915').textContent='與同仁即時聯繫';renderRoomListV915();
    const titleButton=document.getElementById('chatTitleButtonV925');
    titleButton.disabled=false;titleButton.classList.remove('canRenameV927');titleButton.title='聊天室';
  }
  async function setRoomArchivedV919(roomId,archived){
    const room=roomsV915.find(item=>item.id===roomId),email=emailV915();if(!room||!email)return;
    const id=roomId+'__'+encodePartV915(email);
    try{
      await doc('chatReadStates',id).set({roomId,email,archived:!!archived,archivedAt:archived?firebase.firestore.FieldValue.serverTimestamp():null,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      toast(archived?'聊天室已封存':'聊天室已取消封存');
      if(activeRoomIdV915===roomId)showRoomListV915();
    }catch(e){console.error('chat archive failed',e);toast('聊天室封存狀態更新失敗')}
  }
  function toggleCurrentRoomArchiveV919(){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915);if(room)setRoomArchivedV919(room.id,!roomArchivedV919(room));
  }
  async function markRoomReadV915(){
    const room=roomsV915.find(item=>item.id===activeRoomIdV915),email=emailV915();if(!room||!email)return;
    const id=activeRoomIdV915+'__'+encodePartV915(email);
    try{await doc('chatReadStates',id).set({roomId:activeRoomIdV915,email,lastReadAt:firebase.firestore.FieldValue.serverTimestamp(),lastReadMessageCount:Number(room.messageCount||activeMessagesV915.length||0),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('chat read state failed',e)}
  }
  function subscribeRoomV915(roomId){
    const list=document.getElementById('chatMessageListV915');
    const liveLimit=Math.min(200,Math.max(CHAT_MESSAGE_PAGE_SIZE_V931,unreadCountAtOpenV924||0));
    const acceptMessages=(snapshot,paged=true)=>{
      const list=document.getElementById('chatMessageListV915'),wasNearBottom=!list||list.scrollHeight-list.scrollTop-list.clientHeight<110;
      const next=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>timeMsV915(a.createdAt)-timeMsV915(b.createdAt));
      if(previousMessageIdsV925.size&&!wasNearBottom){pendingNewMessageCountV925+=next.filter(item=>!previousMessageIdsV925.has(item.id)).length}
      if(paged&&!olderMessagesV931.length){oldestMessageDocV931=snapshot.docs[snapshot.docs.length-1]||oldestMessageDocV931;hasOlderMessagesV931=snapshot.size===liveLimit}
      else{oldestMessageDocV931=null;hasOlderMessagesV931=false}
      const merged=new Map([...olderMessagesV931,...next].map(item=>[item.id,item]));activeMessagesV915=[...merged.values()].sort((a,b)=>timeMsV915(a.createdAt)-timeMsV915(b.createdAt));
      visibleMessageLimitV925=activeMessagesV915.length;previousMessageIdsV925=new Set(activeMessagesV915.map(item=>item.id));
      if(!initialReadingPositionResolvedV1003){
        const position=window.AdminChatReadingPosition?.resolveInitialPosition({messages:activeMessagesV915,lastReadAt:lastReadAtOpenV1003,currentEmail:emailV915()})||{mode:'latest',boundaryMessageId:'',anchorMessageId:''};
        unreadBoundaryMessageIdV924=position.boundaryMessageId||'';lastReadAnchorMessageIdV1003=position.anchorMessageId||'';
        positionUnreadOnNextRenderV924=position.mode==='unread';forceScrollToBottomV924=position.mode!=='unread';initialReadingPositionResolvedV1003=true;
      }
      renderMessagesV915();markRoomReadV915();
    };
    const fallback=()=>{messageUnsubscribeV915=col('chatMessages').where('roomId','==',roomId).onSnapshot(snapshot=>acceptMessages(snapshot,false),error=>{console.error('chat messages fallback failed',error);toast('聊天室訊息載入失敗')})};
    messageUnsubscribeV915=col('chatMessages').where('roomId','==',roomId).orderBy('createdAt','desc').limit(liveLimit).onSnapshot(snapshot=>acceptMessages(snapshot,true),error=>{
      console.warn('paged chat query unavailable; using compatible fallback',error);
      if(error?.code==='failed-precondition'){fallback();return}
      console.error('chat messages failed',error);toast('聊天室訊息載入失敗');
    });
    activeReadUnsubscribeV915=col('chatReadStates').where('roomId','==',roomId).onSnapshot(snapshot=>{
      activeReadStatesV915=new Map(snapshot.docs.map(item=>[emailV915(item.data().email),{id:item.id,...item.data()}]));renderMessagesV915();
    },error=>console.warn('chat receipt load failed',error));
    reactionUnsubscribeV924=col('chatReactions').where('roomId','==',roomId).onSnapshot(snapshot=>{
      activeReactionsV924=new Map();snapshot.docs.forEach(item=>{const value={id:item.id,...item.data()},list=activeReactionsV924.get(value.messageId)||[];list.push(value);activeReactionsV924.set(value.messageId,list)});renderMessagesV915();
    },error=>console.warn('chat reaction load failed',error));
  }
  async function openRoomV915(roomId){
    const room=roomsV915.find(item=>item.id===roomId);if(!room)return;
    const readStateId=roomId+'__'+encodePartV915(emailV915());
    let readStateAtOpen=ownReadStatesV915.get(roomId)||null;
    if(!readStateAtOpen){try{const snapshot=await doc('chatReadStates',readStateId).get();if(snapshot.exists)readStateAtOpen={id:snapshot.id,...snapshot.data()}}catch(e){console.warn('chat initial read state failed',e)}}
    stopConversationListenersV915();
    activeRoomIdV915=roomId;unreadCountAtOpenV924=unreadForRoomV915(room);unreadBoundaryMessageIdV924='';lastReadAnchorMessageIdV1003='';lastReadAtOpenV1003=readStateAtOpen?.lastReadAt||null;initialReadingPositionResolvedV1003=false;positionUnreadOnNextRenderV924=false;forceScrollToBottomV924=false;replyTargetV924=null;selectedMessageIdV924='';chatSearchQueryV924='';visibleMessageLimitV925=50;pendingNewMessageCountV925=0;previousMessageIdsV925=new Set();searchMatchIndexV925=0;olderMessagesV931=[];oldestMessageDocV931=null;hasOlderMessagesV931=true;loadingOlderMessagesV931=false;
    document.getElementById('chatRoomViewV915').hidden=true;document.getElementById('chatConversationV915').hidden=false;document.getElementById('chatBackV915').hidden=false;
    document.getElementById('chatHeadingV915').textContent=roomTitleV915(room);
    const titleButton=document.getElementById('chatTitleButtonV925'),canRename=room.type==='group'&&emailV915()===roomOwnerEmailV922(room);
    titleButton.disabled=false;titleButton.classList.toggle('canRenameV927',canRename);titleButton.title=canRename?`${roomTitleV915(room)}（點擊管理聊天室名稱）`:roomTitleV915(room);
    document.getElementById('chatSubheadingV915').textContent=room.type==='group'?`${roomMembersV915(room).length} 位成員`:'一對一聊天室';
    const memberButton=document.getElementById('chatMembersV922');memberButton.hidden=room.type!=='group';
    const archiveButton=document.getElementById('chatArchiveV919');archiveButton.hidden=false;archiveButton.textContent=roomArchivedV919(room)?'取消封存':'封存';archiveButton.title=archiveButton.textContent+'聊天室';
    const mentionButton=document.getElementById('chatMentionButtonV924');mentionButton.hidden=room.type!=='group';
    document.getElementById('chatMentionPanelV924').hidden=true;document.getElementById('chatStickerPanelV915').hidden=true;clearReplyTargetV924();closeChatSearchV924();closeChatMoreMenuV924();syncPinnedBannerV924();syncChatHeaderControlsV924();
    loadChatDraftV925();subscribeRoomV915(roomId);await markRoomReadV915();document.getElementById('chatInputV915')?.focus();
  }
  async function recallChatMessageV919(messageId){
    const message=activeMessagesV915.find(item=>item.id===messageId),room=roomsV915.find(item=>item.id===activeRoomIdV915);
    if(recallingMessageIdV919||!message||!room||emailV915(message.senderEmail)!==emailV915()||message.recalled===true)return;
    if(Date.now()-timeMsV915(message.createdAt)>10*60*1000)return toast('訊息送出超過 10 分鐘，無法收回');
    const prompt='確定收回這則訊息？收回後聊天室仍會保留「此訊息已收回」的紀錄。';
    const confirmed=typeof window.adminConfirmV908==='function'?await window.adminConfirmV908(prompt,'收回訊息'):window.confirm(prompt);if(!confirmed)return;
    recallingMessageIdV919=messageId;renderMessagesV915();
    try{
      const batch=db.batch(),now=firebase.firestore.FieldValue.serverTimestamp();
      batch.set(doc('chatMessages',messageId),{text:'',stickerId:'',recalled:true,recalledAt:now,updatedAt:now},{merge:true});
      if(room.lastMessageId===messageId)batch.set(doc('chatRooms',room.id),{lastMessageText:'訊息已收回',lastMessageType:'recalled',updatedAt:now},{merge:true});
      await batch.commit();toast('訊息已收回');
    }catch(e){console.error('recall chat message failed',e);toast(e?.code==='permission-denied'?'無法收回，請確認已部署最新版 Firestore 規則':'訊息收回失敗')}
    finally{recallingMessageIdV919='';renderMessagesV915()}
  }
  async function sendChatMessageV915(type,stickerId=''){
    if(sendingV915||!settingV915.enabled||!activeRoomIdV915)return;
    const input=document.getElementById('chatInputV915'),text=String(input?.value||'').trim();
    if(type==='text'&&!text)return;
    const sticker=STICKERS_V915.find(item=>item.id===stickerId);if(type==='sticker'&&!sticker)return;
    const room=roomsV915.find(item=>item.id===activeRoomIdV915);if(!room)return;
    sendingV915=true;document.getElementById('chatSendV915').disabled=true;
    try{
      const messageRef=col('chatMessages').doc(),batch=db.batch(),now=firebase.firestore.FieldValue.serverTimestamp();
      const mentions=type==='text'?mentionedEmailsV924(text,room):[];
      batch.set(messageRef,{roomId:activeRoomIdV915,senderEmail:emailV915(),senderUid:currentUser?.uid||'',senderName:currentLabelV915(),type:type==='sticker'?'sticker':'text',text:type==='text'?text:'',stickerId:type==='sticker'?stickerId:'',replyToId:replyTargetV924?.id||'',replyToText:replyTargetV924?formatMessagePreviewV924(replyTargetV924):'',replyToSenderName:replyTargetV924?(replyTargetV924.senderName||memberLabelByEmailV915(replyTargetV924.senderEmail)):'',mentionEmails:mentions,recalled:false,createdAt:now});
      batch.set(doc('chatRooms',activeRoomIdV915),{lastMessageId:messageRef.id,lastMessageAt:now,lastMessageText:type==='text'?text:'',lastMessageType:type==='sticker'?'sticker':'text',lastSenderEmail:emailV915(),messageCount:firebase.firestore.FieldValue.increment(1),updatedAt:now},{merge:true});
      await batch.commit();if(input){input.value='';autoSizeChatInputV924(input)}clearChatDraftV925();document.getElementById('chatStickerPanelV915').hidden=true;document.getElementById('chatMentionPanelV924').hidden=true;clearReplyTargetV924();forceScrollToBottomV924=true;await markRoomReadV915();
    }catch(e){console.error('send chat failed',e);toast(settingV915.enabled?'訊息傳送失敗，請稍後再試':'聊天室目前已停用')}
    finally{sendingV915=false;document.getElementById('chatSendV915').disabled=false;input?.focus()}
  }
  function subscribeChatListsV915(){
    const email=emailV915();if(!email||!settingV915.enabled)return;
    if(roomUnsubscribeV915)roomUnsubscribeV915();if(ownReadUnsubscribeV915)ownReadUnsubscribeV915();
    roomUnsubscribeV915=col('chatRooms').where('memberEmails','array-contains',email).onSnapshot(snapshot=>{
      roomsV915=snapshot.docs.map(item=>({id:item.id,...item.data()}));renderRoomListV915();
      if(activeRoomIdV915&&!roomsV915.some(room=>room.id===activeRoomIdV915)){closeChatMembersV922();showRoomListV915()}
      else if(activeRoomIdV915){const room=roomsV915.find(item=>item.id===activeRoomIdV915);document.getElementById('chatHeadingV915').textContent=roomTitleV915(room);document.getElementById('chatSubheadingV915').textContent=room?.type==='group'?`${roomMembersV915(room).length} 位成員`:'一對一聊天室';syncPinnedBannerV924();syncChatHeaderControlsV924();renderMessagesV915();if(!document.getElementById('chatMembersMaskV922')?.hidden)renderCurrentChatMembersV922()}
    },error=>{console.error('chat room list failed',error);toast('聊天室清單載入失敗')});
    ownReadUnsubscribeV915=col('chatReadStates').where('email','==',email).onSnapshot(snapshot=>{
      ownReadStatesV915=new Map(snapshot.docs.map(item=>[item.data().roomId,{id:item.id,...item.data()}]));renderRoomListV915();syncChatHeaderControlsV924();
    },error=>console.warn('chat unread state failed',error));
  }
  function applySettingV915(data){
    const wasEnabled=settingV915.enabled;settingV915={enabled:data?.enabled===true};setChatVisibleV915();
    if(settingV915.enabled&&!wasEnabled)subscribeChatListsV915();
    if(!settingV915.enabled&&wasEnabled)stopChatListenersV915();
  }
  function subscribeChatSettingV915(){
    if(settingUnsubscribeV915)settingUnsubscribeV915();
    settingUnsubscribeV915=doc('systemSettings',CHAT_SETTING_ID_V915).onSnapshot(snapshot=>applySettingV915(snapshot.exists?snapshot.data():{enabled:false}),error=>{console.warn('chat setting load failed',error);applySettingV915({enabled:false})});
  }
  async function initializeChatV915(){
    if(!isAdmin||!currentUser?.uid)return;
    createChatDomV915();const email=emailV915();
    if(initializedEmailV915===email)return;
    stopChatListenersV915();initializedEmailV915=email;subscribeChatSettingV915();
  }
  function toggleChatV915(){
    if(!settingV915.enabled)return toast('聊天室目前已停用');
    createChatDomV915();const drawer=document.getElementById('chatDrawerV915');if(!drawer)return;
    if(!drawer.hidden){closeChatV915();return}
    drawer.hidden=false;document.body.classList.add('chatOpenV915');document.getElementById('chatButtonV915')?.setAttribute('aria-expanded','true');
    if(activeRoomIdV915)openRoomV915(activeRoomIdV915);else showRoomListV915();
  }
  function closeChatV915(){
    const drawer=document.getElementById('chatDrawerV915');if(drawer)drawer.hidden=true;document.body.classList.remove('chatOpenV915');document.getElementById('chatButtonV915')?.setAttribute('aria-expanded','false');
    document.getElementById('chatInputV915')?.blur();closeChatMoreMenuV924();
  }
  function openNewChatV915(){
    const mask=document.getElementById('newChatMaskV915');if(!mask)return;
    document.getElementById('chatMemberSearchV915').value='';document.getElementById('chatGroupNameV915').value='';document.getElementById('chatCreateErrorV915').textContent='';renderMemberPickerV915();mask.hidden=false;document.body.classList.add('modalOpen');document.getElementById('chatMemberSearchV915').focus();
  }
  function closeNewChatV915(){const mask=document.getElementById('newChatMaskV915');if(mask)mask.hidden=true;document.body.classList.remove('modalOpen')}
  async function createChatRoomV915(){
    const selected=selectedMemberEmailsV915(),error=document.getElementById('chatCreateErrorV915'),button=document.getElementById('createChatRoomV915');
    if(!selected.length){error.textContent='請至少選擇一位成員。';return}
    if(selected.length>29){error.textContent='每個聊天室最多 30 位成員。';return}
    const group=selected.length>1,name=String(document.getElementById('chatGroupNameV915')?.value||'').trim();
    if(group&&!name){error.textContent='多人聊天室請輸入群組名稱。';return}
    const emails=[emailV915(),...selected].sort(),labels=emails.map(memberLabelByEmailV915),roomId=group?col('chatRooms').doc().id:directRoomIdV915(emails);
    button.disabled=true;error.textContent='';
    try{
      const ref=doc('chatRooms',roomId);
      let room=roomsV915.find(item=>item.id===roomId)||null;
      if(!room){
        const payload={type:group?'group':'direct',name:group?name:'',memberEmails:emails,memberLabels:labels,createdByEmail:emailV915(),createdByUid:currentUser?.uid||'',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),messageCount:0,lastMessageText:'',lastMessageType:'text',lastSenderEmail:''};
        try{
          await ref.set(payload);
        }catch(writeError){
          if(group)throw writeError;
          try{
            const existing=await ref.get();
            if(existing.exists)room={id:existing.id,...existing.data()};
          }catch(readError){console.warn('existing direct chat lookup failed',readError)}
          if(!room)throw writeError;
        }
      }
      closeNewChatV915();
      if(!roomsV915.some(item=>item.id===roomId)){
        if(room)roomsV915.push(room);
        else{const snap=await ref.get();if(snap.exists)roomsV915.push({id:snap.id,...snap.data()})}
      }
      await openRoomV915(roomId);
    }catch(e){
      console.error('create chat room failed',e);
      error.textContent=!settingV915.enabled?'聊天室目前已停用。':e?.code==='permission-denied'?'建立對話權限遭拒，請確認已部署最新版 Firestore 規則。':'建立對話失敗，請稍後再試。';
    }
    finally{button.disabled=false}
  }
  async function saveChatSettingV915(){
    if(!isSystemAdmin)return toast('此功能僅限系統管理員');
    const input=document.getElementById('chatEnabledV915'),button=document.getElementById('saveChatSettingV915');if(!input||settingSaveBusyV915)return;
    settingSaveBusyV915=true;button.disabled=true;button.textContent='儲存中…';
    try{await doc('systemSettings',CHAT_SETTING_ID_V915).set({enabled:!!input.checked,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedByUid:currentUser?.uid||'',updatedByEmail:emailV915(),updatedByName:currentLabelV915()},{merge:true});if(typeof window.setFeatureSettingDirty==='function')window.setFeatureSettingDirty('chat',false,true);toast(input.checked?'聊天室已啟用':'聊天室已停用')}
    catch(e){console.error('save chat setting failed',e);toast('聊天室設定儲存失敗')}
    finally{settingSaveBusyV915=false;button.disabled=false;button.textContent='儲存設定';syncFeatureSettingV915()}
  }

  window.toggleChatV915=toggleChatV915;
  window.closeChatV915=closeChatV915;
  window.openNewChatV915=openNewChatV915;
  window.closeNewChatV915=closeNewChatV915;
  window.createChatRoomV915=createChatRoomV915;
  window.openChatMembersV922=openChatMembersV922;
  window.closeChatMembersV922=closeChatMembersV922;
  window.showAddChatMembersV922=showAddChatMembersV922;
  window.hideAddChatMembersV922=hideAddChatMembersV922;
  window.addChatMembersV922=addChatMembersV922;
  window.removeChatMemberV922=removeChatMemberV922;
  window.saveChatRoomNameV925=saveChatRoomNameV925;
  window.loadOlderMessagesV925=loadOlderMessagesV925;
  window.leaveChatRoomV922=leaveChatRoomV922;
  window.closeChatReadDetailsV924=closeChatReadDetailsV924;
  window.saveChatSettingV915=saveChatSettingV915;
  window.__chatV915={get rooms(){return roomsV915},get setting(){return settingV915},openRoom:openRoomV915};
  document.addEventListener('change',event=>{if(event.target?.id==='chatEnabledV915')syncFeatureSettingV915(true)});
  document.addEventListener('click',event=>{if(!event.target.closest('#chatMoreV924')&&!event.target.closest('#chatMoreMenuV924'))closeChatMoreMenuV924()});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!document.getElementById('chatReadMaskV924')?.hidden){closeChatReadDetailsV924();return}
    if(!document.getElementById('chatMoreMenuV924')?.hidden){closeChatMoreMenuV924();return}
    if(!document.getElementById('chatStickerPanelV915')?.hidden){document.getElementById('chatStickerPanelV915').hidden=true;return}
    if(!document.getElementById('chatMentionPanelV924')?.hidden){document.getElementById('chatMentionPanelV924').hidden=true;return}
    if(!document.getElementById('chatSearchBarV924')?.hidden){closeChatSearchV924();return}
    if(!document.getElementById('chatMembersMaskV922')?.hidden){closeChatMembersV922();return}
    if(!document.getElementById('newChatMaskV915')?.hidden){closeNewChatV915();return}
    if(selectedMessageIdV924){selectedMessageIdV924='';renderMessagesV915();return}
    if(!document.getElementById('chatDrawerV915')?.hidden)closeChatV915();
  });
  const renderAdminBeforeV915=renderAdmin;
  renderAdmin=function(){const result=renderAdminBeforeV915();setTimeout(initializeChatV915,0);return result};window.renderAdmin=renderAdmin;
  const panelBeforeV915=panel;
  panel=function(id,b){if(id==='featureSettingsP'&&!isSystemAdmin){toast('此功能僅限系統管理員');return}return panelBeforeV915(id,b)};window.panel=panel;
  const logoutBeforeV915=logout;
  logout=async function(){stopChatListenersV915();if(settingUnsubscribeV915)settingUnsubscribeV915();settingUnsubscribeV915=null;initializedEmailV915='';return logoutBeforeV915()};window.logout=logout;
})();
