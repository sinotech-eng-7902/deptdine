/* 相容層：信件通知、收件者、主題預覽與 EML。 */

/* ===== 信件製作、公司信箱收件者與 EML 匯出 ===== */
const MAIL_TEMPLATES_V957=Object.freeze({
  invitation:{
    label:'聚餐調查通知',
    rule:'寄給本活動所有開放填寫的人員',
    subject:'[聚餐調查] {{活動名稱}}',
    body:'各位同仁您好：\n\n為辦理「{{活動名稱}}」，並彙整同仁可參與日期及餐廳意願，敬請撥冗填寫本次聚餐調查。\n\n• 填寫期限：{{填寫期限}}\n• 問卷連結：{{問卷連結}}\n\n無論是否能夠參加，皆請於期限前完成填寫，俾利後續統計出席情形及辦理餐廳訂位等事宜。\n\n感謝您的配合。'
  },
  reminder:{
    label:'逾期未填提醒',
    rule:'只寄給本活動開放填寫且尚未送出的人員',
    subject:'[填寫提醒] {{活動名稱}} 尚未完成',
    body:'您好：\n\n系統顯示您尚未完成「{{活動名稱}}」聚餐調查。\n\n• 填寫期限：{{填寫期限}}\n• 問卷連結：{{問卷連結}}\n\n如已完成填寫，請忽略本信；謝謝您的配合。'
  },
  result:{
    label:'調查結果通知',
    rule:'寄給本活動所有開放填寫的人員',
    subject:'[調查結果] {{活動名稱}}',
    body:'各位同仁您好：\n\n「{{活動名稱}}」之調查結果已彙整完成，聚餐日期及餐廳資訊如下：\n\n• 聚餐日期：{{最終日期}}\n• 餐廳名稱：{{餐廳名稱}}\n• 餐廳地址：{{餐廳地址}}\n• 餐廳地圖：{{地圖連結}}\n\n請參與同仁預留時間，並依上述資訊前往。如出席情形臨時有所變動，敬請儘早通知承辦人員，俾利調整訂位人數及辦理後續相關事宜。\n\n感謝您的配合。'
  },
  diningReminder:{
    label:'聚餐行前提醒',
    rule:'只寄給本活動最終出席名單中的人員',
    subject:'[聚餐提醒] {{聚餐名稱}}',
    body:'各位同仁您好：\n\n提醒您「{{聚餐名稱}}」將於近期舉行，聚餐資訊如下：\n\n• 聚餐日期：{{最終日期}}\n• 餐廳名稱：{{餐廳名稱}}\n• 餐廳地址：{{餐廳地址}}\n• 餐廳地圖：{{地圖連結}}\n\n敬請預留時間並準時抵達；如臨時無法出席，請儘早通知承辦人員，俾利調整訂位人數及辦理後續相關事宜。\n\n感謝您的配合。'
  }
});
let mailTemplateKeyV957='';
const MAIL_FONT_STYLE_V959="font-family:Arial,'Microsoft JhengHei','Noto Sans TC',sans-serif;mso-ascii-font-family:Arial;mso-hansi-font-family:Arial;mso-fareast-font-family:'Microsoft JhengHei'";
const MAIL_THEMES_V965=Object.freeze({
  plain:{label:'純文字',accent:'#1b5eaa',labelColor:'#294762'},
  reference:{label:'清新通知卡',accent:'#1769c2',labelColor:'#087177',panel:'#eff9f9',border:'#c9dcdf'},
  corporate:{label:'企業藍簡報',accent:'#1f4a77',labelColor:'#1f4a77',panel:'#edf3f9',border:'#cddbe8'},
  dining:{label:'暖食邀約',accent:'#a65037',labelColor:'#94472f',panel:'#fff2e8',border:'#ead1c0'}
});
const MAIL_ASSET_FILES_V965=Object.freeze({
  calendar:'calendar.png',
  calendarCheck:'calendar-check.png',
  clipboard:'clipboard.png',
  restaurant:'restaurant.png',
  pin:'pin.png',
  map:'map.png'
});

function mailTemplateV957(type){
  return MAIL_TEMPLATES_V957[type]||MAIL_TEMPLATES_V957.invitation;
}
function ensureMailThemeControlsV965(){
  if(document.getElementById('mailThemeOptionsV965'))return;
  document.getElementById('mailThemeOptionsV964')?.remove();
  const anchor=document.getElementById('mailThemeMountV968')||document.querySelector('#mailP .mailComposeFieldsV957>.two');
  if(!anchor)return;
  const fieldset=document.createElement('fieldset');
  fieldset.id='mailThemeOptionsV965';
  fieldset.className='mailThemeFieldsetV965';
  fieldset.innerHTML=`<legend>信件主題</legend><div class="mailThemeOptionsV965">
    <label class="mailThemeOptionV965"><input type="radio" name="mailThemeV965" value="plain" checked onchange="changeMailThemeV965(this.value)"><span class="mailThemeSwatchV965 isPlainV965"></span><span><b>純文字</b><small>保留簡潔信件內容</small></span></label>
    <label class="mailThemeOptionV965"><input type="radio" name="mailThemeV965" value="reference" onchange="changeMailThemeV965(this.value)"><span class="mailThemeSwatchV965 isReferenceV965"></span><span><b>清新通知卡</b><small>依指定設計稿重製</small></span></label>
    <label class="mailThemeOptionV965"><input type="radio" name="mailThemeV965" value="corporate" onchange="changeMailThemeV965(this.value)"><span class="mailThemeSwatchV965 isCorporateV965"></span><span><b>企業藍簡報</b><small>深藍專業與霧藍資訊區</small></span></label>
    <label class="mailThemeOptionV965"><input type="radio" name="mailThemeV965" value="dining" onchange="changeMailThemeV965(this.value)"><span class="mailThemeSwatchV965 isDiningV965"></span><span><b>暖食邀約</b><small>米白與陶土橘聚餐風格</small></span></label>
  </div>`;
  if(anchor.id==='mailThemeMountV968')anchor.replaceChildren(fieldset);
  else anchor.insertAdjacentElement('afterend',fieldset);
}
function currentMailThemeV965(){
  const key=document.querySelector('input[name="mailThemeV965"]:checked')?.value||'plain';
  return Object.prototype.hasOwnProperty.call(MAIL_THEMES_V965,key)?key:'plain';
}
function changeMailThemeV965(){
  updateMailPreviewV957();
}
function diningEventNameV1023(value){
  const original=String(value||'').trim();
  let name=original;
  const duplicateSuffix=/\s*(?:[（(]\s*(?:複本|複製)(?:\s*\d+)?\s*[）)]|[-－—]\s*(?:複本|複製)(?:\s*\d+)?)\s*$/u;
  while(duplicateSuffix.test(name))name=name.replace(duplicateSuffix,'').trim();
  name=name.replace(/\s*調查\s*$/u,'').trim();
  return name||original||'目前活動';
}
function mailVariablesV957(){
  const survey=activeSurvey();
  const date=D.dates.find(item=>String(item.id)===String(D.final?.finalDateId||''));
  const restaurant=D.restaurants.find(item=>String(item.id)===String(D.final?.finalRestaurantId||''));
  return {
    活動名稱:survey?.title||'目前活動',
    聚餐名稱:diningEventNameV1023(survey?.title),
    填寫期限:survey?.deadline?formatDeadline(survey.deadline):'未設定',
    問卷網址:activeSurveyId?frontUrl():'',
    最終日期:date?.label||'尚未決定',
    餐廳名稱:restaurant?.name||'尚未決定',
    餐廳地址:restaurant?.address||'尚未設定',
    地圖網址:safeUrl(restaurant?.googleMap||restaurant?.mapUrl||'')||'尚未設定'
  };
}
function replaceMailVariablesV957(value){
  const variables=mailVariablesV957();
  return String(value||'').replace(/\{\{([^{}]+)\}\}/g,(match,key)=>
    Object.prototype.hasOwnProperty.call(variables,key.trim())?variables[key.trim()]:match
  );
}
function mailCandidatesV957(type){
  const members=targetMembers();
  if(type==='diningReminder'){
    const finalDateId=String(D.final?.finalDateId||'');
    const finalRestaurantId=String(D.final?.finalRestaurantId||'');
    if(!finalDateId||!finalRestaurantId)return [];
    const rows=typeof window.finalAttendanceRowsV783==='function'
      ?window.finalAttendanceRowsV783(finalDateId)
      :typeof window.finalAttendanceRowsV782==='function'
        ?window.finalAttendanceRowsV782(finalDateId)
        :attendeeResponsesForDate(finalDateId).map(response=>({member:memberById(response.memberId)}));
    const ids=new Set(rows.map(row=>String(row?.member?.memberId||row?.member?.id||'')).filter(Boolean));
    return members.filter(member=>ids.has(String(member.id)));
  }
  if(type!=='reminder')return members;
  const submittedIds=new Set(D.responses.map(response=>String(response.memberId||'')));
  return members.filter(member=>!submittedIds.has(String(member.id)));
}
function mailRecipientsV957(type){
  return mailCandidatesV957(type).map(member=>{
    const department=member.department||member.departmentName||'未設定部門';
    const name=member.name||'未命名人員';
    const email=memberCompanyEmailV957(member);
    return {member,email,department,name,label:`${department}-${name}`,display:email?`${department}-${name}<${email}>`:`${department}-${name}`};
  });
}
function selectedMailRecipientsV957(){
  const ids=new Set([...document.querySelectorAll('.mailRecipientCheckV957:checked')].map(input=>String(input.value)));
  return mailRecipientsV957(document.getElementById('mailTypeV957')?.value||'invitation')
    .filter(item=>item.email&&ids.has(String(item.member.id)));
}
function updateMailRecipientCountV957(){
  const selectedRecipients=selectedMailRecipientsV957();
  const selected=selectedRecipients.length;
  const badge=document.getElementById('mailRecipientCountV957');
  if(badge)badge.textContent=`${selected} 人`;
  const button=document.getElementById('downloadEmlBtnV957');
  if(button)button.disabled=selected===0;
  const summary=document.getElementById('mailRecipientSummaryV968');
  if(summary){
    const shown=selectedRecipients.slice(0,3).map(item=>`<span>${esc(item.label)}</span>`).join('');
    const rest=selected>3?`<span class="mailRecipientMoreV968">另 ${selected-3} 人</span>`:'';
    summary.innerHTML=selected?`${shown}${rest}`:'<span class="isEmptyV968">尚未選擇收件者</span>';
  }
  const status=document.getElementById('mailRecipientStatusV968');
  if(status)status.textContent=`已選擇 ${selected} 人・公司信箱完整 ${selected} 人`;
}
function toggleMailRecipientsV968(force){
  const picker=document.getElementById('mailRecipientPickerV968');
  const button=document.getElementById('mailRecipientToggleV968');
  if(!picker||!button)return;
  const open=typeof force==='boolean'?force:picker.hidden;
  picker.hidden=!open;
  button.setAttribute('aria-expanded',String(open));
  button.textContent=open?'完成選擇':'選擇收件者';
}
function renderMailRecipientListV957(type){
  const recipients=mailRecipientsV957(type);
  const missing=recipients.filter(item=>!item.email);
  const list=document.getElementById('mailRecipientListV957');
  const warning=document.getElementById('mailMissingEmailV957');
  const rule=document.getElementById('mailRecipientRuleV957');
  const missingFinalDecision=type==='diningReminder'&&!(D.final?.finalDateId&&D.final?.finalRestaurantId);
  if(rule)rule.textContent=missingFinalDecision?'請先完成最終日期及餐廳決議，再製作聚餐行前提醒。':mailTemplateV957(type).rule;
  if(warning){
    warning.innerHTML=missing.length
      ?`<div class="mailMissingWarningV957"><b>有 ${missing.length} 位收件者尚未設定公司信箱</b><small>下方以「缺少信箱」標示且無法勾選；請先到「人員管理」補齊資料。</small></div>`
      :'';
  }
  if(list){
    list.innerHTML=recipients.length
      ?recipients.map(item=>item.email
        ?`<label class="mailRecipientRowV957" title="${escAttr(item.email)}"><input class="mailRecipientCheckV957" type="checkbox" value="${escAttr(item.member.id)}" checked onchange="updateMailRecipientCountV957()"><b>${esc(item.label)}</b></label>`
        :`<label class="mailRecipientRowV957 isMissingV958" title="尚未設定公司信箱"><input type="checkbox" disabled aria-label="${escAttr(item.label)}缺少公司信箱"><b>${esc(item.label)}</b><span class="mailMissingBadgeV958">缺少信箱</span></label>`
      ).join('')
      :`<div class="mailRecipientEmptyV957">${missingFinalDecision?'尚未完成最終決議，暫時無法建立行前提醒收件者。':type==='diningReminder'?'最終出席名單中目前沒有可寄送且已設定公司信箱的人員。':type==='reminder'?'目前沒有尚未填寫且已設定公司信箱的人員。':'目前沒有可寄送且已設定公司信箱的人員。'}</div>`;
  }
  updateMailRecipientCountV957();
}
function applyMailTemplateV957(type){
  const template=mailTemplateV957(type);
  const subject=document.getElementById('mailSubjectV957');
  const body=document.getElementById('mailBodyV957');
  if(subject)subject.value=template.subject;
  if(body)body.value=template.body;
  setMailRichEditorContentV968(template.body);
  mailTemplateKeyV957=`${activeSurveyId||''}:${type}`;
  renderMailRecipientListV957(type);
  toggleMailRecipientsV968(false);
  updateMailPreviewV957();
}
function changeMailTypeV957(type){
  applyMailTemplateV957(type);
}
function restoreMailTemplateV957(){
  applyMailTemplateV957(document.getElementById('mailTypeV957')?.value||'invitation');
  toast('已還原預設信件範本');
}
function setAllMailRecipientsV957(checked){
  document.querySelectorAll('.mailRecipientCheckV957').forEach(input=>{input.checked=checked});
  updateMailRecipientCountV957();
}
let mailRichEditorReadyV968=false;
let mailSavedRangeV969=null;
function mailPlainToEditorHtmlV968(value){
  return String(value||'').replace(/\r/g,'').split('\n').map(line=>`<div${line?'':' class="mailEditorBlankV969"'}>${line?esc(line):'<br>'}</div>`).join('');
}
function setMailRichEditorContentV968(value){
  const editor=document.getElementById('mailRichEditorV968');
  const body=document.getElementById('mailBodyV957');
  if(body)body.value=String(value||'');
  if(editor)editor.innerHTML=mailPlainToEditorHtmlV968(value);
  mailSavedRangeV969=null;
}
function mailEditorTextV968(){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor)return '';
  return [...editor.childNodes].map(node=>{
    if(node.nodeType===Node.TEXT_NODE)return node.textContent||'';
    if(node.nodeType!==Node.ELEMENT_NODE)return '';
    if(!String(node.textContent||'').replace(/\u00a0/g,' ').trim())return '';
    return String(node.innerText||node.textContent||'').replace(/\r/g,'').replace(/\u00a0/g,' ').replace(/\n+$/,'');
  }).join('\n').replace(/\n+$/,'');
}
function mailSelectionInsideEditorV969(range,editor){
  if(!range||!editor)return false;
  const node=range.commonAncestorContainer;
  return node===editor||editor.contains(node.nodeType===Node.TEXT_NODE?node.parentNode:node);
}
function saveMailSelectionV969(){
  const editor=document.getElementById('mailRichEditorV968');
  const selection=window.getSelection();
  if(!editor||!selection?.rangeCount)return false;
  const range=selection.getRangeAt(0);
  if(!mailSelectionInsideEditorV969(range,editor))return false;
  mailSavedRangeV969=range.cloneRange();
  return true;
}
function restoreMailSelectionV969(placeAtEnd=true){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor)return false;
  let range=mailSavedRangeV969;
  if(!mailSelectionInsideEditorV969(range,editor)&&placeAtEnd){
    range=document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
  }
  if(!range)return false;
  const selection=window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
function refreshMailEditorBlankLinesV969(){
  document.querySelectorAll('#mailRichEditorV968>.mailEditorBlankV969').forEach(block=>{
    if(block.textContent.replace(/\u00a0/g,' ').trim())block.classList.remove('mailEditorBlankV969');
  });
}
function cleanMailEditorNodeV968(node){
  if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent||'');
  if(node.nodeType!==Node.ELEMENT_NODE)return document.createDocumentFragment();
  const tag=node.tagName.toUpperCase();
  const outputTag=tag==='FONT'?'SPAN':tag;
  const allowed=new Set(['DIV','P','H2','H3','BR','UL','OL','LI','B','STRONG','I','EM','U','SPAN','A']);
  const element=allowed.has(outputTag)?document.createElement(outputTag):document.createDocumentFragment();
  if(element.nodeType===Node.ELEMENT_NODE){
    if(tag==='A'){
      const href=safeUrl(node.getAttribute('href')||'');
      if(href){
        element.setAttribute('href',href);
        element.setAttribute('target','_blank');
        element.setAttribute('rel','noopener noreferrer');
      }
    }
    const color=node.style?.color||(tag==='FONT'?node.getAttribute('color'):'');
    const background=node.style?.backgroundColor;
    const align=node.style?.textAlign;
    const styles=[];
    if(color)styles.push(`color:${color}`);
    if(background)styles.push(`background-color:${background}`);
    if(align&&['left','center','right'].includes(align))styles.push(`text-align:${align}`);
    if(styles.length)element.setAttribute('style',styles.join(';'));
  }
  [...node.childNodes].forEach(child=>element.appendChild(cleanMailEditorNodeV968(child)));
  return element;
}
function mailEditorEntriesV968(){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor)return [];
  const nodes=[...editor.childNodes];
  if(!nodes.length)return [];
  return nodes.map(node=>{
    const cleaned=cleanMailEditorNodeV968(node);
    const shell=document.createElement('div');
    shell.appendChild(cleaned);
    const root=shell.firstElementChild;
    const tag=root?.tagName?.toLowerCase()||'div';
    const html=root?root.innerHTML:shell.innerHTML;
    const text=(root?.innerText??shell.textContent??'').replace(/\u00a0/g,' ').trimEnd();
    return {tag,text,html,outer:root?.outerHTML||html};
  });
}
function mailRichStructuredPartsV968(value){
  const entries=mailEditorEntriesV968();
  if(!entries.length||mailEditorTextV968().trim()!==String(value||'').replace(/\r/g,'').trim())return null;
  const hasRichFormatting=entries.some(entry=>
    ['h2','h3','ul','ol'].includes(entry.tag)
    ||/<(?:b|strong|i|em|u|span|a)\b|\sstyle=/i.test(String(entry.outer||''))
  );
 // 未套用格式時沿用 的純文字段落流程，避免空白行被當成額外區塊。
  if(!hasRichFormatting)return null;
  const matches=entries.map(entry=>entry.text.match(/^(?:[•・]\s*)?(填寫期限|問卷連結|聚餐日期|餐廳名稱|餐廳地址|餐廳地圖)：\s*(.*)$/));
  const indexes=matches.map((match,index)=>match?index:-1).filter(index=>index>=0);
  if(!indexes.length)return {beforeEntries:entries,rows:[],afterEntries:[]};
  const first=indexes[0],last=indexes[indexes.length-1];
  return {
    beforeEntries:entries.slice(0,first),
    rows:indexes.map(index=>({label:matches[index][1],value:matches[index][2]})),
    afterEntries:entries.slice(last+1)
  };
}
function replaceRichMailVariablesV968(html){
  const variables=mailVariablesV957();
  let result=String(html||'');
  Object.keys(variables).forEach(key=>{result=result.replaceAll(`{{${key}}}`,esc(variables[key]))});
  return result;
}
function mailRichEntryHtmlV968(entry,fontStyle,color='#222222'){
 // 空白節點只代表段落分隔；實際間距交由相鄰文字區塊處理，不再輸出空白段落。
  if(!entry.text.trim()&&!String(entry.html||'').replace(/<br\s*\/?>/gi,'').trim())return '';
  let content=replaceRichMailVariablesV968(entry.html||esc(entry.text));
  if(/^(?:各位同仁您好：|您好：)$/.test(entry.text.trim()))content=`<strong style="font-weight:700">${content}</strong>`;
  const common=`${fontStyle};margin:0 0 10px;color:${color};line-height:25px;mso-line-height-rule:exactly`;
  if(entry.tag==='h2')return `<h2 lang="ZH-TW" style="${common};font-size:18pt">${content}</h2>`;
  if(entry.tag==='h3')return `<h3 lang="ZH-TW" style="${common};font-size:15pt">${content}</h3>`;
  if(entry.tag==='ul'||entry.tag==='ol')return `<${entry.tag} lang="ZH-TW" style="${common};padding-left:25px">${content}</${entry.tag}>`;
  return `<div lang="ZH-TW" style="${common};font-size:12pt">${content||'&nbsp;'}</div>`;
}
function mailRichEntriesHtmlV968(entries,fontStyle,color){
  return (entries||[]).map(entry=>mailRichEntryHtmlV968(entry,fontStyle,color)).join('');
}
function syncMailRichEditorV968(){
  const body=document.getElementById('mailBodyV957');
  if(!body)return;
  refreshMailEditorBlankLinesV969();
  const text=mailEditorTextV968();
  if(text.length>8000){
    setMailRichEditorContentV968(text.slice(0,8000));
    toast('信件內容最多 8000 個字');
  }else body.value=text;
  updateMailPreviewV957();
}
function runMailEditorCommandV968(command,value=null){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor)return;
  editor.focus();
  restoreMailSelectionV969();
  if(command==='createLink'){
    saveMailSelectionV969();
    const url=window.prompt('請輸入連結網址（https://...）','https://');
    const safe=safeUrl(url||'');
    if(!safe)return;
    editor.focus();
    restoreMailSelectionV969();
    document.execCommand('createLink',false,safe);
  }else{
    const applied=document.execCommand(command,false,value);
    if(command==='hiliteColor'&&!applied)document.execCommand('backColor',false,value);
  }
  saveMailSelectionV969();
  syncMailRichEditorV968();
}
function formatMailBlockV968(value){
  runMailEditorCommandV968('formatBlock',value==='h2'?'H2':value==='h3'?'H3':'DIV');
}
function insertMailVariableV969(variable){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor||!String(variable||'').trim())return;
  editor.focus();
  restoreMailSelectionV969();
  const selection=window.getSelection();
  const range=selection?.rangeCount?selection.getRangeAt(0):null;
  if(range&&mailSelectionInsideEditorV969(range,editor)){
    const textNode=document.createTextNode(String(variable));
    range.deleteContents();
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }else{
    editor.appendChild(document.createTextNode(String(variable)));
  }
  saveMailSelectionV969();
  syncMailRichEditorV968();
}
function ensureMailRichEditorV968(){
  const editor=document.getElementById('mailRichEditorV968');
  if(!editor||mailRichEditorReadyV968)return;
  mailRichEditorReadyV968=true;
  editor.addEventListener('input',()=>{
    syncMailRichEditorV968();
    saveMailSelectionV969();
  });
  editor.addEventListener('mouseup',saveMailSelectionV969);
  editor.addEventListener('keyup',saveMailSelectionV969);
  document.addEventListener('selectionchange',()=>{
    const selection=window.getSelection();
    if(selection?.rangeCount&&mailSelectionInsideEditorV969(selection.getRangeAt(0),editor))saveMailSelectionV969();
  });
  editor.addEventListener('paste',event=>{
    event.preventDefault();
    document.execCommand('insertText',false,event.clipboardData?.getData('text/plain')||'');
  });
  document.querySelectorAll('[data-mail-command]').forEach(button=>{
    button.addEventListener('mousedown',event=>{
      saveMailSelectionV969();
      event.preventDefault();
    });
    button.addEventListener('click',()=>runMailEditorCommandV968(button.dataset.mailCommand));
  });
  document.querySelectorAll('.mailColorControlV968').forEach(control=>{
    control.addEventListener('mousedown',()=>saveMailSelectionV969());
  });
  document.getElementById('mailTextColorV968')?.addEventListener('input',event=>runMailEditorCommandV968('foreColor',event.target.value));
  document.getElementById('mailHighlightColorV968')?.addEventListener('input',event=>runMailEditorCommandV968('hiliteColor',event.target.value));
  document.querySelectorAll('.mailVariableButtonV969').forEach(button=>{
    button.addEventListener('mousedown',event=>{
      saveMailSelectionV969();
      event.preventDefault();
    });
    button.addEventListener('click',()=>insertMailVariableV969(button.dataset.mailVariable));
  });
  if(!editor.innerHTML.trim())setMailRichEditorContentV968(document.getElementById('mailBodyV957')?.value||'');
}
function mailBodyHtmlV957(value){
  const richParts=mailRichStructuredPartsV968(value);
  if(richParts){
    const variables=mailVariablesV957();
    const all=[...richParts.beforeEntries,...richParts.rows.map(row=>{
      let valueHtml=esc(row.value);
      if(row.label==='問卷連結'&&row.value.includes('{{問卷連結}}')){
        const url=safeUrl(variables.問卷網址||'');
        valueHtml=url?`<a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" style="color:#1b5eaa;text-decoration:underline">前往填寫問卷</a>`:'尚未設定';
      }
      if(row.label==='餐廳地圖'&&row.value.includes('{{地圖連結}}')){
        const url=safeUrl(variables.地圖網址||'');
        valueHtml=url?`<a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" style="color:#1b5eaa;text-decoration:underline">查看餐廳地圖</a>`:'尚未設定';
      }
      return {tag:'div',text:`${row.label}：${row.value}`,html:`<strong style="color:#294762">${esc(row.label)}：</strong>${valueHtml}`};
    }),...richParts.afterEntries];
    return mailRichEntriesHtmlV968(all,MAIL_FONT_STYLE_V959,'#222222');
  }
  const mapToken='__DINING_MAP_LINK_V959__';
  const surveyToken='__DINING_SURVEY_LINK_V959__';
  const prepared=String(value||'')
    .replace(/\{\{地圖連結\}\}/g,mapToken)
    .replace(/\{\{問卷連結\}\}/g,surveyToken);
  const escaped=esc(replaceMailVariablesV957(prepared));
  let linked=escaped.replace(/(https?:\/\/[^\s<]+)/g,url=>`<a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" lang="ZH-TW" style="${MAIL_FONT_STYLE_V959};color:#1b5eaa;text-decoration:underline">${url}</a>`);
  const mapUrl=safeUrl(mailVariablesV957().地圖網址||'');
  const mapLink=mapUrl
    ?`<a href="${escAttr(mapUrl)}" target="_blank" rel="noopener noreferrer" lang="ZH-TW" style="${MAIL_FONT_STYLE_V959};color:#1b5eaa;text-decoration:underline">查看餐廳地圖</a>`
    :'尚未設定';
  linked=linked.replaceAll(mapToken,mapLink);
  const surveyUrl=safeUrl(mailVariablesV957().問卷網址||'');
  const surveyLink=surveyUrl
    ?`<a href="${escAttr(surveyUrl)}" target="_blank" rel="noopener noreferrer" lang="ZH-TW" style="${MAIL_FONT_STYLE_V959};color:#1b5eaa;text-decoration:underline">前往填寫問卷</a>`
    :'尚未設定';
  linked=linked.replaceAll(surveyToken,surveyLink);
  const html=linked.split(/\n{2,}/).map(block=>`<p lang="ZH-TW" style="${MAIL_FONT_STYLE_V959}">${block.replace(/^(各位同仁您好：|您好：)/,`<strong lang="ZH-TW" style="${MAIL_FONT_STYLE_V959};font-weight:700">$1</strong>`).replace(/\n/g,'<br>')}</p>`).join('');
  return html.replace(/(<p[^>]*>|<br>)([•・]\s*)?(填寫期限|問卷連結|聚餐日期|餐廳名稱|餐廳地址|餐廳地圖)：/g,
    (match,prefix,bullet='',label)=>`${prefix}${bullet}<strong lang="ZH-TW" style="${MAIL_FONT_STYLE_V959};color:#294762">${label}：</strong>`);
}
const MAIL_DESIGN_FONT_STYLE_V965="font-family:'Microsoft JhengHei','Noto Sans TC',Arial,sans-serif;mso-ascii-font-family:Arial;mso-hansi-font-family:Arial;mso-fareast-font-family:'Microsoft JhengHei'";
function mailStructuredPartsV965(value){
  const rich=mailRichStructuredPartsV968(value);
  if(rich)return rich;
  const lines=String(value||'').replace(/\r/g,'').split('\n');
  const matches=lines.map(line=>line.match(/^(?:[•・]\s*)?(填寫期限|問卷連結|聚餐日期|餐廳名稱|餐廳地址|餐廳地圖)：\s*(.*)$/));
  const indexes=matches.map((match,index)=>match?index:-1).filter(index=>index>=0);
  if(!indexes.length)return {before:String(value||''),rows:[],after:''};
  const first=indexes[0],last=indexes[indexes.length-1];
  return {
    before:lines.slice(0,first).join('\n').replace(/\n{3,}/g,'\n\n').trim(),
    rows:indexes.map(index=>({label:matches[index][1],value:matches[index][2]})),
    after:lines.slice(last+1).join('\n').replace(/\n{3,}/g,'\n\n').trim()
  };
}
function mailAssetDefinitionV965(key,themeKey='reference'){
  const base=MAIL_ASSET_FILES_V965[key];
  if(!base)return null;
  const prefix=themeKey==='corporate'?'blue-':themeKey==='dining'?'warm-':'';
  const stem=`${prefix}${base.replace(/\.png$/,'')}`;
  return {file:`mail-${stem}.png`,cid:`mail-${stem}-v965`};
}
function mailAssetUrlV965(key,forEml=false,themeKey='reference'){
  const asset=mailAssetDefinitionV965(key,themeKey);
  if(!asset)return '';
  return forEml?`cid:${asset.cid}`:new URL(`../assets/mail/${asset.file}`,location.href).href;
}
function mailAssetKeysV965(type,themeKey='reference'){
  const content=type==='result'||type==='diningReminder'
    ?['calendar','restaurant','pin','map']
    :['calendarCheck','clipboard'];
  return [...new Set(content)];
}
function mailActionLinkV965(url,text,theme){
  const safe=safeUrl(url||'');
  if(!safe)return '尚未設定';
  return `<a href="${escAttr(safe)}" target="_blank" rel="noopener noreferrer" lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};display:inline-block;padding:5px 12px;border:1px solid ${theme.accent};border-radius:5px;background:#ffffff;color:${theme.accent};font-size:11pt;line-height:20px;mso-line-height-rule:exactly;text-decoration:none;font-weight:700;white-space:nowrap">${esc(text)}</a>`;
}
function mailInfoValueV965(row,theme){
  if(row.label==='問卷連結'&&row.value.includes('{{問卷連結}}'))return mailActionLinkV965(mailVariablesV957().問卷網址,'前往填寫問卷',theme);
  if(row.label==='餐廳地圖'&&row.value.includes('{{地圖連結}}'))return mailActionLinkV965(mailVariablesV957().地圖網址,'查看餐廳地圖',theme);
  const escaped=esc(replaceMailVariablesV957(row.value));
  return escaped.replace(/(https?:\/\/[^\s<]+)/g,url=>`<a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" style="${MAIL_DESIGN_FONT_STYLE_V965};color:${theme.accent};text-decoration:underline">${url}</a>`)||'—';
}
function mailInfoIconV965(label){
  return {'填寫期限':'calendarCheck','問卷連結':'clipboard','聚餐日期':'calendar','餐廳名稱':'restaurant','餐廳地址':'pin','餐廳地圖':'map'}[label]||'clipboard';
}
function mailParagraphsV965(value){
  if(Array.isArray(value))return mailRichEntriesHtmlV968(value,MAIL_DESIGN_FONT_STYLE_V965,'#222222');
  if(!String(value||'').trim())return '';
  const prepared=String(value||'').replace(/\{\{地圖連結\}\}/g,'').replace(/\{\{問卷連結\}\}/g,'');
  const escaped=esc(replaceMailVariablesV957(prepared));
  return escaped.split(/\n{2,}/).filter(Boolean).map(block=>`<p lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};margin:0 0 14px;color:#222222;font-size:12pt;font-weight:400;line-height:25px;mso-line-height-rule:exactly">${block.replace(/^(各位同仁您好：|您好：)/,`<strong lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};font-weight:700">$1</strong>`).replace(/\n/g,'<br>')}</p>`).join('');
}
function mailSpacerV967(height){
  const size=Math.max(0,Number(height)||0);
  return `<table class="mailSpacerV967" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt"><tr><td height="${size}" style="height:${size}px;padding:0;font-size:0;line-height:0;mso-line-height-rule:exactly">&nbsp;</td></tr></table>`;
}
function mailInfoCardV965(rows,theme,type,forEml=false,themeKey='reference'){
  if(!rows.length)return '';
  const content=rows.map((row,index)=>{
    const edge=index?`border-top:1px solid ${theme.border};`:'';
    const key=mailInfoIconV965(row.label);
    return `<tr class="mailInfoRowV965">
      <td class="mailInfoIconCellV965" width="46" valign="middle" style="width:46px;padding:6px 3px 6px 9px;${edge};font-size:0;line-height:0;mso-line-height-rule:exactly"><img src="${escAttr(mailAssetUrlV965(key,forEml,themeKey))}" width="30" height="30" alt="" style="display:block;border:0;width:30px;height:30px"></td>
      <td class="mailInfoLabelCellV965" width="108" valign="middle" style="width:108px;padding:6px 5px;${edge};line-height:20px;mso-line-height-rule:exactly"><strong lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};color:${theme.labelColor};font-size:11pt;line-height:20px;mso-line-height-rule:exactly;white-space:nowrap">${esc(row.label)}：</strong></td>
      <td class="mailInfoValueCellV965" valign="middle" style="padding:6px 11px 6px 4px;${edge};color:#20252b;font-size:11pt;line-height:20px;mso-line-height-rule:exactly;font-weight:${row.label==='填寫期限'||row.label==='聚餐日期'?'700':'400'}">${mailInfoValueV965(row,theme)}</td>
    </tr>`;
  }).join('');
  const leftRule=type==='result'||type==='diningReminder'?`border-left:4px solid ${theme.labelColor};`:'';
  const card=`<table class="mailInfoCardV966" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid ${theme.border};border-collapse:collapse;${leftRule}background:${theme.panel};table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt">${content}</table>`;
  return `${mailSpacerV967(12)}${card}${mailSpacerV967(14)}`;
}
function mailCorporateFooterV965(){
  return `${mailSpacerV967(16)}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt">
    <tr><td style="padding-top:7px;border-top:2px solid #1f4a77;color:#56748f;font-family:Arial,sans-serif;font-size:8pt;letter-spacing:.1em">DEPARTMENT DINING</td><td style="padding-top:7px;border-top:2px solid #1f4a77;text-align:right;color:#2a8b88;font-family:Arial,sans-serif;font-size:8pt">SINOTECH-ENG</td></tr>
  </table>`;
}
function mailCorporateBodyV965(value,type,forEml=false){
  const theme=MAIL_THEMES_V965.corporate;
  const parts=mailStructuredPartsV965(value);
  const before=mailParagraphsV965(parts.beforeEntries||parts.before);
  const info=mailInfoCardV965(parts.rows,theme,type,forEml,'corporate');
  const after=mailParagraphsV965(parts.afterEntries||parts.after);
  return `<table class="mailDesignCardV965" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #cad7e3;border-collapse:collapse;background:#ffffff;table-layout:fixed">
    <tr><td class="mailDesignCardBodyV965" lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};padding:18px 20px 16px;color:#202b38;line-height:25px;mso-line-height-rule:exactly">${before}${info}${after}${mailCorporateFooterV965()}</td></tr>
  </table>`;
}
function mailDiningBodyV965(value,type,forEml=false){
  const theme=MAIL_THEMES_V965.dining;
  const parts=mailStructuredPartsV965(value);
  const before=mailParagraphsV965(parts.beforeEntries||parts.before);
  const info=mailInfoCardV965(parts.rows,theme,type,forEml,'dining');
  const after=mailParagraphsV965(parts.afterEntries||parts.after);
  const footer=`${mailSpacerV967(16)}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt"><tr><td height="2" style="height:2px;padding:0;background:#a65037;font-size:0;line-height:0;mso-line-height-rule:exactly">&nbsp;</td></tr></table>`;
  return `<table class="mailDesignCardV965" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #ead1c0;border-collapse:collapse;background:#fffaf5;table-layout:fixed">
    <tr><td class="mailDesignCardBodyV965" lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};padding:18px 20px 16px;color:#332822;line-height:25px;mso-line-height-rule:exactly">${before}${info}${after}${footer}</td></tr>
  </table>`;
}
function mailThemedBodyHtmlV965(value,themeKey=currentMailThemeV965(),type=document.getElementById('mailTypeV957')?.value||'invitation',forEml=false){
  if(themeKey==='plain')return mailBodyHtmlV957(value);
  if(themeKey==='corporate')return mailCorporateBodyV965(value,type,forEml);
  if(themeKey==='dining')return mailDiningBodyV965(value,type,forEml);
  const theme=MAIL_THEMES_V965.reference;
  const parts=mailStructuredPartsV965(value);
  const before=mailParagraphsV965(parts.beforeEntries||parts.before);
  const info=mailInfoCardV965(parts.rows,theme,type,forEml,'reference');
  const after=mailParagraphsV965(parts.afterEntries||parts.after);
  return `<table class="mailDesignCardV965" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #d5e0e2;border-collapse:collapse;background:#ffffff;table-layout:fixed">
    <tr><td class="mailDesignCardBodyV965" lang="ZH-TW" style="${MAIL_DESIGN_FONT_STYLE_V965};padding:18px 20px 16px;color:#222222;line-height:25px;mso-line-height-rule:exactly">${before}${info}${after}</td></tr>
  </table>`;
}
function mailDocumentHtmlV965(body,themeKey=currentMailThemeV965(),type=document.getElementById('mailTypeV957')?.value||'invitation',forEml=false){
  const plain=themeKey==='plain';
  const font=plain?MAIL_FONT_STYLE_V959:MAIL_DESIGN_FONT_STYLE_V965;
  const style=plain
    ?'body,p,div,span,strong,a,td{font-family:Arial,"Microsoft JhengHei","Noto Sans TC",sans-serif;mso-ascii-font-family:Arial;mso-hansi-font-family:Arial;mso-fareast-font-family:"Microsoft JhengHei"}'
    :'body,p,div,span,strong,a,td{font-family:"Microsoft JhengHei","Noto Sans TC",Arial,sans-serif;mso-ascii-font-family:Arial;mso-hansi-font-family:Arial;mso-fareast-font-family:"Microsoft JhengHei"}table{mso-table-lspace:0pt;mso-table-rspace:0pt}@media only screen and (max-width:720px){body{padding:6px!important}.mailShellV966,.mailShellCellV966{width:100%!important;max-width:100%!important}.mailDesignCardBodyV965{padding:14px 12px!important}.mailInfoRowV965{display:block!important;width:100%!important;border-top:1px solid #c9dcdf}.mailInfoRowV965:first-child{border-top:0}.mailInfoIconCellV965{display:inline-block!important;width:38px!important;padding:6px 2px 1px 6px!important;border-top:0!important}.mailInfoIconCellV965 img{width:28px!important;height:28px!important}.mailInfoLabelCellV965{display:inline-block!important;width:auto!important;padding:6px 4px 1px!important;border-top:0!important}.mailInfoLabelCellV965 strong,.mailInfoValueCellV965{font-size:10.5pt!important}.mailInfoValueCellV965{display:block!important;width:auto!important;padding:1px 8px 8px 44px!important;border-top:0!important}}';
  const pageBackground=plain?'#ffffff':themeKey==='corporate'?'#edf2f6':themeKey==='dining'?'#f8f2ed':'#f4f8f9';
  const rendered=mailThemedBodyHtmlV965(body,themeKey,type,forEml);
  const content=plain
    ?`<div lang="ZH-TW" style="max-width:760px;margin:0 auto;${font}">${rendered}</div>`
    :`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse"><tr><td align="center"><table class="mailShellV966" role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width:680px;max-width:680px;border-collapse:collapse;table-layout:fixed"><tr><td class="mailShellCellV966" width="680" style="width:680px">${rendered}</td></tr></table></td></tr></table>`;
  return `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><style>${style}</style></head><body lang="ZH-TW" style="margin:0;padding:${plain?'24px':'12px'};background:${pageBackground};${font};color:#222222;font-size:${plain?'14pt':'12pt'};line-height:${plain?'1.9':'1.75'}">${content}</body></html>`;
}
function updateMailPreviewV957(){
  const preview=document.getElementById('mailPreviewV957');
  if(!preview)return;
  ensureMailThemeControlsV965();
  const subject=replaceMailVariablesV957(document.getElementById('mailSubjectV957')?.value||'');
  const body=document.getElementById('mailBodyV957')?.value||'';
  const themeKey=currentMailThemeV965();
  const type=document.getElementById('mailTypeV957')?.value||'invitation';
  preview.innerHTML=`<div class="mailPreviewSubjectV957"><span>主旨</span><b>${esc(subject||'尚未輸入主旨')}</b></div><div class="mailPreviewBodyV957" data-mail-theme="${escAttr(themeKey)}">${mailThemedBodyHtmlV965(body,themeKey,type)||'<p class="muted">尚未輸入信件內容</p>'}</div>`;
}
function renderMailPanelV957(){
  const panelElement=document.getElementById('mailP');
  if(!panelElement)return;
  ensureMailThemeControlsV965();
  ensureMailRichEditorV968();
  const typeSelect=document.getElementById('mailTypeV957');
  const controls=panelElement.querySelectorAll('input,textarea,select,button');
  if(!activeSurveyId){
    controls.forEach(control=>{control.disabled=true});
    const list=document.getElementById('mailRecipientListV957');
    if(list)list.innerHTML='<div class="mailRecipientEmptyV957">請先建立或選擇活動。</div>';
    const badge=document.getElementById('mailRecipientCountV957');
    if(badge)badge.textContent='0 人';
    return;
  }
  controls.forEach(control=>{control.disabled=false});
  const type=typeSelect?.value||'invitation';
  const key=`${activeSurveyId}:${type}`;
  if(mailTemplateKeyV957!==key)applyMailTemplateV957(type);
  else{
    renderMailRecipientListV957(type);
    updateMailPreviewV957();
  }
}
function utf8Base64V957(value){
  const bytes=new TextEncoder().encode(String(value||''));
  let binary='';
  bytes.forEach(byte=>{binary+=String.fromCharCode(byte)});
  return btoa(binary);
}
function foldBase64V957(value){
  return String(value||'').match(/.{1,76}/g)?.join('\r\n')||'';
}
function encodedHeaderV957(value){
  return `=?UTF-8?B?${utf8Base64V957(value)}?=`;
}
function mailAddressHeaderV957(item){
  return `${encodedHeaderV957(item.label)} <${item.email}>`;
}
function foldAddressHeaderV957(name,addresses){
  if(!addresses.length)return `${name}:`;
  const lines=[];
  let current=`${name}: ${addresses[0]}`;
  addresses.slice(1).forEach(address=>{
    const part=`, ${address}`;
    if(current.length+part.length>76){
      lines.push(current+',');
      current=` ${address}`;
    }else current+=part;
  });
  lines.push(current);
  return lines.join('\r\n');
}
function sanitizeMailFileNameV957(value){
  return String(value||'信件').replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim().slice(0,80)||'信件';
}
function byteArrayBase64V965(bytes){
  let binary='';
  const chunk=0x8000;
  for(let index=0;index<bytes.length;index+=chunk){
    binary+=String.fromCharCode(...bytes.subarray(index,index+chunk));
  }
  return btoa(binary);
}
async function loadMailInlineAssetsV965(keys,themeKey){
  return Promise.all(keys.map(async key=>{
    const asset=mailAssetDefinitionV965(key,themeKey);
    const response=await fetch(mailAssetUrlV965(key,false,themeKey),{cache:'no-store'});
    if(!response.ok)throw new Error(`無法載入信件圖示：${asset?.file||key}`);
    const bytes=new Uint8Array(await response.arrayBuffer());
    return {...asset,base64:foldBase64V957(byteArrayBase64V965(bytes))};
  }));
}
async function buildMailEmlV957(){
  const recipients=selectedMailRecipientsV957();
  if(!recipients.length)throw new Error('請至少選擇一位已設定公司信箱的收件者');
  const subject=replaceMailVariablesV957(document.getElementById('mailSubjectV957')?.value||'').trim();
  const body=document.getElementById('mailBodyV957')?.value||'';
  if(!subject)throw new Error('請輸入信件主旨');
  if(!body.trim())throw new Error('請輸入信件內容');
  const type=document.getElementById('mailTypeV957')?.value||'invitation';
  const themeKey=currentMailThemeV965();
  const themed=themeKey!=='plain';
  const html=mailDocumentHtmlV965(body,themeKey,type,themed);
  const headers=[
    `Date: ${new Date().toUTCString()}`,
    `Subject: ${encodedHeaderV957(subject)}`,
    foldAddressHeaderV957('To',recipients.map(mailAddressHeaderV957)),
    'X-Unsent: 1',
    'MIME-Version: 1.0'
  ];
  let eml='';
  if(themed){
    const boundary=`----=_DiningMail_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const assets=await loadMailInlineAssetsV965(mailAssetKeysV965(type,themeKey),themeKey);
    const parts=[
      ...headers,
      `Content-Type: multipart/related; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      foldBase64V957(utf8Base64V957(html)),
      ''
    ];
    assets.forEach(asset=>{
      parts.push(
        `--${boundary}`,
        `Content-Type: image/png; name="${asset.file}"`,
        'Content-Transfer-Encoding: base64',
        `Content-ID: <${asset.cid}>`,
        `Content-Disposition: inline; filename="${asset.file}"`,
        '',
        asset.base64,
        ''
      );
    });
    parts.push(`--${boundary}--`,'');
    eml=parts.join('\r\n');
  }else{
    eml=[
      ...headers,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      foldBase64V957(utf8Base64V957(html)),
      ''
    ].join('\r\n');
  }
  const dateCode=new Date().toISOString().slice(0,10).replace(/-/g,'');
  const filename=`${sanitizeMailFileNameV957(mailTemplateV957(type).label)}_${sanitizeMailFileNameV957(activeSurvey()?.title||'活動')}_${dateCode}.eml`;
  return {eml,filename,recipientCount:recipients.length};
}
async function downloadMailEmlV957(){
  let built;
  try{built=await buildMailEmlV957()}catch(error){return alert(error.message||String(error))}
  const {eml,filename,recipientCount}=built;
  const blob=new Blob([eml],{type:'message/rfc822;charset=utf-8'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  toast(`已產生 ${recipientCount} 位收件者的 EML`);
}
window.changeMailTypeV957=changeMailTypeV957;
window.diningEventNameV1023=diningEventNameV1023;
window.restoreMailTemplateV957=restoreMailTemplateV957;
window.setAllMailRecipientsV957=setAllMailRecipientsV957;
window.updateMailRecipientCountV957=updateMailRecipientCountV957;
window.toggleMailRecipientsV968=toggleMailRecipientsV968;
window.formatMailBlockV968=formatMailBlockV968;
window.updateMailPreviewV957=updateMailPreviewV957;
window.changeMailThemeV965=changeMailThemeV965;
window.mailThemedBodyHtmlV965=mailThemedBodyHtmlV965;
window.mailDocumentHtmlV965=mailDocumentHtmlV965;
window.buildMailEmlV957=buildMailEmlV957;
window.downloadMailEmlV957=downloadMailEmlV957;


