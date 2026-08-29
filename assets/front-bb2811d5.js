
window.APP_VERSION='10.43';

let db=null,auth=null,activeSurveyId=null,isSubmitting=false,frontLinkInvalid=false,previewAuthUser=null,previewIdentityLoaded=false,previewUserDoc=null;
const D={departments:[],members:[],memberAccounts:[],surveys:[],dates:[],restaurants:[],budgetEligibility:[],final:null,frontProtection:null,homeAnnouncementMode:'paused',homeAnnouncements:[]};
const byId=id=>document.getElementById(id);
const ui={status:byId('frontStatus'),myResponseBtn:byId('myResponseBtn'),setup:byId('setup'),loading:byId('frontLoading'),content:byId('frontContent'),title:byId('surveyTitle'),desc:byId('surveyDesc'),deadline:byId('deadline'),final:byId('finalFront'),closed:byId('closed'),done:byId('done'),form:byId('formGrid'),dept:byId('dept'),member:byId('member'),attend:byId('attendYes'),cannot:byId('cannot'),dateSection:byId('attendanceDateSection'),dateBox:byId('dateBox'),rankSection:byId('rankSection'),rankGrid:byId('rankGrid'),note:byId('note'),submit:byId('submitBtn'),clear:byId('clearBtn'),submitStatus:byId('submitStatus'),policySection:byId('frontInstructionsSection'),policy:byId('editPolicyNotice'),restInfo:byId('restInfo'),toast:byId('toast'),logo:byId('secretLogo'),previewBar:byId('frontAdminPreviewBar'),previewUser:byId('frontPreviewUser'),backAdmin:byId('frontBackAdminBtn'),previewLogout:byId('frontLogoutBtn'),homeLogin:byId('homeLogin'),homeLoginButton:byId('homeLoginButton'),homeLoginMessage:byId('homeLoginMessage'),homeAnnouncementPanel:byId('homeAnnouncementPanel'),homeAnnouncementContent:byId('homeAnnouncementContent')};
const FRONT_THEME_VALUES=['classic','lake','warm','aqua','purple','ivory','rose','slate','forest','sea','milk','sakura','citrus','night','lavender','lakePro','sinotechRed','appleWhite','patternWave','botanicalMist','sakuraBloom','cloudBlue','goldNavy','creamWaves','coralBubble','mintGarden','auroraPurple','paperDoodle'];
const FRONT_THEMES=new Set(FRONT_THEME_VALUES);
function applyFrontTheme(value){document.body.dataset.frontTheme=FRONT_THEMES.has(value)?value:'classic'}

function hasConfig(){return typeof firebaseConfig==='object'&&firebaseConfig.apiKey&&firebaseConfig.projectId}
function col(name){return db.collection(name)}
function doc(name,id){return db.collection(name).doc(id)}
async function safeCollection(name){try{let snap=await col(name).get();return snap.docs.map(x=>({id:x.id,...x.data()}))}catch(e){console.warn('讀取 '+name+' 失敗',e);return[]}}
async function safeQuery(query,name){try{let snap=await query.get();return snap.docs.map(x=>({id:x.id,...x.data()}))}catch(e){console.warn('讀取 '+name+' 失敗',e);return[]}}

async function init(){
  document.body.classList.add('frontOnly');
  bindEvents();bindAdminShortcut();
  if(isHomeEntry())renderHomeLogin();
  if(!hasConfig()){if(isHomeEntry())setHomeLoginMessage('登入服務尚未完成設定，請通知系統管理員。');else ui.setup.style.display='block';ui.loading.hidden=true;return}
  try{let app=firebase.initializeApp(firebaseConfig,'deptdine');db=app.firestore();auth=typeof app.auth==='function'?app.auth():null;bindPreviewAdmin();await loadData();renderFront()}catch(e){console.error('front init failed',e);if(isHomeEntry()){setHomeLoginMessage('登入服務暫時無法使用，請稍後再試。');return}ui.loading.hidden=true;ui.content.hidden=false;ui.title.textContent='問卷讀取失敗';ui.desc.textContent='請通知管理者檢查資料庫設定或權限。';ui.deadline.textContent='錯誤：'+(e?.message||e);ui.form.hidden=true;ui.status.textContent='讀取異常'}
}

function requestedSurveyCode(){return String(new URLSearchParams(location.search).get('survey')||'').trim()}
function isHomeEntry(){return !requestedSurveyCode()}
function setHomeLoginMessage(message=''){if(ui.homeLoginMessage)ui.homeLoginMessage.textContent=String(message||'')}
function renderHomeLogin(){
  document.body.classList.add('homeEntry');
  document.querySelector('.wrap')?.setAttribute('hidden','');
  if(ui.homeLogin)ui.homeLogin.hidden=false;
  renderHomeAnnouncements();
}
function leaveHomeLogin(){
  document.body.classList.remove('homeEntry');
  document.querySelector('.wrap')?.removeAttribute('hidden');
  if(ui.homeLogin)ui.homeLogin.hidden=true;
}
async function loginManage(){
  if(!auth){setHomeLoginMessage('登入服務尚未完成初始化，請重新整理頁面後再試一次。');return}
  let button=ui.homeLoginButton;
  if(button){button.disabled=true;button.classList.add('isLoading')}
  setHomeLoginMessage('');
  try{
    await ensureFrontUserV806();
    location.href='manage/#manage';
  }catch(e){
    if(e?.code==='auth/popup-closed-by-user')setHomeLoginMessage('已取消登入。');
    else setHomeLoginMessage(e?.message||'登入失敗，請稍後再試。');
  }finally{
    if(button){button.disabled=false;button.classList.remove('isLoading')}
  }
}

async function loadData(){
  if(isHomeEntry()){
    await loadHomeAnnouncements();
    return;
  }
  let [surveys,departments,members]=await Promise.all([safeCollection('surveys'),safeCollection('departments'),safeCollection('members')]);
  try{
    let frontProtectionSnap=await doc('systemSettings','frontProtection').get();
    D.frontProtection=frontProtectionSnap.exists?frontProtectionSnap.data():null;
  }catch(e){
    console.warn('讀取前台防護設定失敗',e);
    D.frontProtection=null;
  }
  D.surveys=surveys.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  let requested=String(new URLSearchParams(location.search).get('survey')||'').trim();
  activeSurveyId=(requested&&D.surveys.some(x=>x.id===requested))?requested:null;
  frontLinkInvalid=!activeSurveyId;
  D.departments=departments.sort((a,b)=>(a.sortOrder??a.order??999)-(b.sortOrder??b.order??999)||String(departmentName(a)).localeCompare(String(departmentName(b)),'zh-Hant'));
  let order=new Map(D.departments.map((d,i)=>[departmentName(d),i]));
  D.members=members.sort((a,b)=>(order.get(memberDepartment(a))??9999)-(order.get(memberDepartment(b))??9999)||String(employeeNo(a)).localeCompare(String(employeeNo(b)),'zh-Hant',{numeric:true})||String(a.name||'').localeCompare(String(b.name||''),'zh-Hant'));
  if(!activeSurveyId)return;
  let [dates,restaurants,budgetEligibility]=await Promise.all([safeQuery(col('surveyDates').where('surveyId','==',activeSurveyId),'surveyDates'),safeQuery(col('restaurants').where('surveyId','==',activeSurveyId),'restaurants'),safeQuery(col('budgetEligibility').where('surveyId','==',activeSurveyId),'budgetEligibility')]);
  D.dates=dates.filter(x=>x.active!==false).sort((a,b)=>(a.sort??999)-(b.sort??999)||String(a.label||'').localeCompare(String(b.label||''),'zh-Hant'));
  D.restaurants=restaurants.filter(x=>x.active!==false).sort((a,b)=>(a.sort??999)-(b.sort??999)||String(a.name||'').localeCompare(String(b.name||''),'zh-Hant'));
  D.budgetEligibility=budgetEligibility;
  try{let finalSnap=await doc('finalDecision',activeSurveyId).get();D.final=finalSnap.exists?finalSnap.data():null}catch(e){D.final=null}
}

function localDateKeyV941(date=new Date()){
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
async function loadHomeAnnouncements(){
  D.homeAnnouncementMode='paused';
  D.homeAnnouncements=[];
  try{
    const settingSnap=await doc('systemSettings','homeAnnouncements').get();
    const requestedMode=settingSnap.exists?String(settingSnap.data()?.mode||'paused'):'paused';
    D.homeAnnouncementMode=['cards','list'].includes(requestedMode)?requestedMode:'paused';
    if(D.homeAnnouncementMode==='paused')return;
    const [announcements,surveys]=await Promise.all([safeCollection('publicAnnouncements'),safeCollection('surveys')]);
    const visibleSurveys=new Map(surveys
      .filter(survey=>survey.archived!==true&&!['archived','cancelled','canceled'].includes(String(survey.status||'').toLowerCase()))
      .map(survey=>[survey.id,survey]));
    const today=localDateKeyV941();
    D.homeAnnouncements=announcements
      .filter(item=>item.active===true&&visibleSurveys.has(item.surveyId)&&String(item.eventDateKey||'')>=today)
      .map(item=>({...item,activityName:visibleSurveys.get(item.surveyId)?.title||item.activityName||''}))
      .sort((a,b)=>String(a.eventDateKey||'').localeCompare(String(b.eventDateKey||''))||(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0))
      .slice(0,3);
  }catch(e){
    console.warn('讀取登入首頁公告失敗',e);
    D.homeAnnouncementMode='paused';
    D.homeAnnouncements=[];
  }
}
function homeAnnouncementMapLinkV941(item,label='查看地圖'){
  const map=safeUrl(item?.mapUrl||'');
  if(!map)return '<span class="homeAnnouncementMapDisabled" aria-label="未提供地圖">—</span>';
  const address=String(item?.restaurantAddress||'').trim();
  return `<a class="homeAnnouncementMap" href="${escAttr(map)}" target="_blank" rel="noopener noreferrer" title="${escAttr(address||'開啟 Google 地圖')}" aria-label="${escAttr('開啟地圖'+(address?'：'+address:''))}"><span class="homeAnnouncementMapPin" aria-hidden="true"></span>${label?`<b>${esc(label)}</b>`:''}</a>`;
}
function homeAnnouncementCardV941(item){
  const address=String(item?.restaurantAddress||'').trim();
  return `<article class="homeAnnouncementCard">
    <time datetime="${escAttr(item.eventDateKey||'')}">${esc(item.dateLabel||'日期待確認')}</time>
    <h3 title="${escAttr(item.activityName||'')}">${esc(item.activityName||'未命名活動')}</h3>
    <div class="homeAnnouncementRestaurant"><span aria-hidden="true">●</span><b title="${escAttr(item.restaurantName||'')}">${esc(item.restaurantName||'餐廳待確認')}</b></div>
    ${address?`<p title="${escAttr(address)}">${esc(address)}</p>`:''}
    ${homeAnnouncementMapLinkV941(item,'查看地圖')}
  </article>`;
}
function renderHomeAnnouncements(){
  if(!ui.homeLogin||!ui.homeAnnouncementPanel||!ui.homeAnnouncementContent)return;
  const visual=ui.homeLogin.querySelector('.homeLoginVisual');
  const announcements=D.homeAnnouncements||[];
  const show=['cards','list'].includes(D.homeAnnouncementMode)&&announcements.length>0;
  ui.homeLogin.classList.toggle('hasAnnouncements',show);
  ui.homeLogin.classList.toggle('hasSingleAnnouncement',show&&announcements.length===1);
  ui.homeAnnouncementPanel.hidden=!show;
  if(visual)visual.hidden=show;
  if(!show){ui.homeAnnouncementContent.innerHTML='';return}
  if(D.homeAnnouncementMode==='cards'){
    ui.homeAnnouncementContent.innerHTML=`<div class="homeAnnouncementCards" data-count="${announcements.length}">${announcements.map(homeAnnouncementCardV941).join('')}</div>`;
    return;
  }
  ui.homeAnnouncementContent.innerHTML=`<div class="homeAnnouncementTable" data-count="${announcements.length}" role="table" aria-label="近期聚餐公告">
    <div class="homeAnnouncementTableHead" role="row"><span role="columnheader">日期</span><span role="columnheader">活動名稱</span><span role="columnheader">餐廳名稱</span><span role="columnheader">地圖</span></div>
    ${announcements.map(item=>`<div class="homeAnnouncementTableRow" role="row">
      <time role="cell" datetime="${escAttr(item.eventDateKey||'')}" title="${escAttr(item.dateLabel||'')}">${esc(item.dateLabel||'日期待確認')}</time>
      <b role="cell" title="${escAttr(item.activityName||'')}">${esc(item.activityName||'未命名活動')}</b>
      <span role="cell" title="${escAttr(item.restaurantName||'')}">${esc(item.restaurantName||'餐廳待確認')}</span>
      <span role="cell">${homeAnnouncementMapLinkV941(item,'地圖')}</span>
    </div>`).join('')}
  </div>`;
}


function activeSurvey(){return D.surveys.find(x=>x.id===activeSurveyId)||null}
function departmentName(d){return String(d?.name||d?.departmentName||d?.department||'').trim()}
function memberDepartment(m){return String(m?.department||m?.departmentName||'').trim()}
function employeeNo(m){return String(m?.employeeNo||m?.empNo||'').trim()}
function parseDateTimeV784(value){
  if(!value)return null;
  if(value?.toDate)return value.toDate();
  if(Number.isFinite(value?.seconds))return new Date(value.seconds*1000);
  if(value instanceof Date)return Number.isNaN(value.getTime())?null:value;
  let raw=String(value||'').trim();
  if(!raw)return null;
  let normalized=raw.replace('上午','AM').replace('下午','PM');
  let parsed=new Date(normalized);
  return Number.isNaN(parsed.getTime())?null:parsed;
}
function formatDateTimeV784(value){
  let d=parseDateTimeV784(value)||new Date();
  let y=d.getFullYear();
  let m=String(d.getMonth()+1).padStart(2,'0');
  let day=String(d.getDate()).padStart(2,'0');
  let period=d.getHours()<12?'上午':'下午';
  let hh=d.getHours()%12||12;
  let mm=String(d.getMinutes()).padStart(2,'0');
  let ss=String(d.getSeconds()).padStart(2,'0');
  return `${y}/${m}/${day} ${period} ${String(hh).padStart(2,'0')}:${mm}:${ss}`;
}
const DESCRIPTION_FONT_SIZES=[14,16,18,20];
function normalizeDescriptionFontSize(value){let size=Number(value);return DESCRIPTION_FONT_SIZES.includes(size)?size:16}
function normalizeDescriptionAlign(value){return value==='center'?'center':'left'}
function safeRichHref(value){
  let raw=String(value||'').trim();if(!raw)return'';
  if(!/^(https?:|mailto:|tel:)/i.test(raw))raw='https://'+raw;
  try{let url=new URL(raw,location.href);return ['http:','https:','mailto:','tel:'].includes(url.protocol)?url.href:''}catch(e){return''}
}
function sanitizeRichHtml(value){
  let template=document.createElement('template');template.innerHTML=String(value||'');
  let allowed=new Set(['B','STRONG','UL','OL','LI','A','BR','DIV','P']);
  [...template.content.querySelectorAll('*')].forEach(node=>{
    if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH'].includes(node.tagName)){node.remove();return}
    if(!allowed.has(node.tagName)){node.replaceWith(...node.childNodes);return}
    let originalHref=node.tagName==='A'?(node.getAttribute('href')||''):'';
    [...node.attributes].forEach(attr=>node.removeAttribute(attr.name));
    if(node.tagName==='A'){
      let href=safeRichHref(originalHref);
      if(href){node.setAttribute('href',href);node.setAttribute('target','_blank');node.setAttribute('rel','noopener noreferrer')}
    }
  });
  return template.innerHTML;
}
function renderSurveyDescription(survey){
  let html=survey?.descriptionHtml?sanitizeRichHtml(survey.descriptionHtml):'';
  ui.desc.classList.toggle('richDescription',!!html);
  if(html)ui.desc.innerHTML=html;else ui.desc.textContent=survey?.description||'';
  ui.desc.style.fontSize=normalizeDescriptionFontSize(survey?.descriptionFontSize)+'px';
  ui.desc.style.textAlign=normalizeDescriptionAlign(survey?.descriptionAlign);
}
function targetDepartments(){let value=activeSurvey()?.targetDepartments;return Array.isArray(value)?value.map(x=>String(x||'').trim()).filter(Boolean):[]}
function memberCanFill(m){let setting=D.budgetEligibility.find(x=>x.memberId===m?.id);return !setting||setting.canFill!==false}
function memberBelongsToActiveSurveyV1023(m){
  let survey=activeSurvey();
  if(Array.isArray(survey?.memberRosterIds))return new Set(survey.memberRosterIds.map(x=>String(x||''))).has(String(m?.id||''));
  let targets=targetDepartments();
  return m?.active!==false&&(!targets.length||targets.includes(memberDepartment(m)));
}
function targetMembers(){return D.members.filter(m=>memberBelongsToActiveSurveyV1023(m)&&memberCanFill(m))}

function renderFront(){
  if(isHomeEntry()){renderHomeLogin();return}
  leaveHomeLogin();
  let survey=activeSurvey();
  applyFrontTheme(survey?.theme||'classic');
  if(frontLinkInvalid){renderInvalidLink();return}
  ui.deadline.hidden=false;
  if(ui.myResponseBtn)ui.myResponseBtn.hidden=!survey;
  if(!survey){ui.loading.hidden=true;ui.content.hidden=false;document.body.classList.add('frontReady');ui.status.textContent='尚無活動';ui.title.textContent='目前尚未開放調查';ui.desc.textContent='請洽管理者建立活動。';renderDeadlineNoticeV775(ui.deadline,null);ui.form.hidden=true;return}
  ui.title.textContent=survey.title||'未命名調查';renderSurveyDescription(survey);renderDeadlineNoticeV775(ui.deadline,survey);
  let closed=survey.status!=='open'||isDeadlinePassed(survey.deadline);ui.status.textContent=closed?'問卷已關閉':'問卷開放中';ui.closed.hidden=!closed;ui.form.hidden=closed;
  let frontInstructions=String(survey.frontInstructions||'').trim();ui.policySection.hidden=!frontInstructions;ui.policy.textContent=frontInstructions;
  renderFinal();renderOptions();resetForm();
  ui.loading.hidden=true;ui.content.hidden=false;document.body.classList.add('frontReady');applySecurityLocksV719(D.frontProtection||survey.securitySettings||{});
}

function renderDeadlineNoticeV775(target,survey){
  if(!target)return;
  let text=survey?.deadline?('請於 '+formatDeadline(survey.deadline)+' 前完成填寫'):'尚未設定截止日期';
  target.innerHTML='<span class="deadlineIconV775" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7.25 2.5a.75.75 0 0 1 .75.75V4h8v-.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 21 6.75v4.1a6.5 6.5 0 1 1-8.15 9.65h-7.1A2.75 2.75 0 0 1 3 17.75v-11A2.75 2.75 0 0 1 5.75 4h.75v-.75a.75.75 0 0 1 .75-.75ZM4.5 9h15V6.75c0-.69-.56-1.25-1.25-1.25H5.75c-.69 0-1.25.56-1.25 1.25V9Zm0 1.5v7.25c0 .69.56 1.25 1.25 1.25h6.45a6.5 6.5 0 0 1 7.3-9.15V10.5h-15ZM18 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm.75 2.25v3.44l2.03 1.17a.75.75 0 1 1-.75 1.3l-2.4-1.39a.75.75 0 0 1-.38-.65v-3.87a.75.75 0 0 1 1.5 0Z"/></svg></span><span class="deadlineTextV775">'+esc(text)+'</span>';
}

function renderFinal(){let final=D.final;if(!final?.locked){ui.final.hidden=true;return}let date=D.dates.find(x=>x.id===final.finalDateId),restaurant=D.restaurants.find(x=>x.id===final.finalRestaurantId);ui.final.hidden=false;ui.final.innerHTML='<b>本次活動已決定</b><br>日期：'+esc(date?.label||'')+'<br>餐廳：'+esc(restaurant?.name||'')+(final.note?'<br>說明：'+esc(final.note):'')}

function renderOptions(){
  let targets=targetDepartments(),master=D.departments.map(departmentName).filter(Boolean),fromMembers=targetMembers().map(memberDepartment).filter(Boolean),names=targets.length?targets:(master.length?master:fromMembers),order=new Map(D.departments.map((d,i)=>[departmentName(d),i]));
  names=[...new Set(names)].sort((a,b)=>(order.get(a)??999)-(order.get(b)??999)||a.localeCompare(b,'zh-Hant'));
  ui.dept.innerHTML='<option value="">請選擇部門</option>'+names.map(name=>`<option value="${escAttr(name)}">${esc(name)}</option>`).join('');
  ui.dateBox.innerHTML=D.dates.length?`<div class="dateInfo">請勾選所有可出席的日期。未勾選的日期將視為無法出席；若最終聚餐日期為您未勾選的日期，您將不列入出席名單。</div><div class="dateGrid">${D.dates.map(x=>`<label class="dateChoice"><input class="dateOpt" type="checkbox" value="${escAttr(x.id)}"><span>${esc(x.label)}</span></label>`).join('')}</div>`:'<div class="notice">尚未設定日期選項</div>';
  let restaurantOptions='<option value="">請選擇餐廳</option>'+D.restaurants.map(x=>`<option value="${escAttr(x.id)}">${esc(x.name)}</option>`).join('');
  ui.rankGrid.innerHTML=Array.from({length:rankLimit()},(_,i)=>`<div class="rankField"><span><i class="rankNo">${i+1}</i>${rankLabel(i)}選擇${i===0?'<span class="required">*</span>':'<small>（選填）</small>'}</span><select class="rankSelect" aria-label="${rankLabel(i)}選擇">${restaurantOptions}</select></div>`).join('')||'<div class="notice">尚未設定餐廳選項</div>';
  ui.restInfo.innerHTML=D.restaurants.map(x=>{let map=safeUrl(x.googleMap||x.mapUrl),info=safeUrl(x.infoUrl||''),typeText=x.description||x.cuisine||'',links=(map||info)?'<p class="restLinks">'+(map?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(map)+'">查看地圖 ↗</a>':'')+(info?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(info)+'">店家資訊 ↗</a>':'')+'</p>':'';return `<article class="restCard"><b>${esc(x.name)}</b>${typeText?'<p>類型：'+esc(typeText)+'</p>':''}${x.address?'<p>地址：'+esc(x.address)+'</p>':''}${links}</article>`}).join('')||'<div class="notice">尚未設定餐廳</div>';
}

function bindEvents(){
  ui.dept.addEventListener('change',renderMembers);ui.attend.addEventListener('change',updateAvailability);ui.cannot.addEventListener('change',()=>updateAvailability(true));
  document.addEventListener('change',event=>{if(event.target.classList?.contains('rankSelect'))syncRestaurantChoices()});
  ui.submit.addEventListener('click',submitVote);ui.clear.addEventListener('click',resetForm);
  ui.myResponseBtn?.addEventListener('click',showMyResponse);
}
function renderInvalidLink(){if(isHomeEntry()){renderHomeLogin();return}leaveHomeLogin();ui.loading.hidden=true;ui.content.hidden=false;document.body.classList.add('frontReady');ui.status.textContent='連結不正確';if(ui.myResponseBtn)ui.myResponseBtn.hidden=true;ui.title.textContent='問卷連結不正確';ui.desc.textContent='這個網址的活動代碼無效。請使用活動管理者提供的完整問卷連結，再重新開啟。';ui.deadline.textContent='';ui.deadline.hidden=true;ui.final.hidden=true;ui.closed.hidden=true;ui.form.hidden=true;ui.done.hidden=true;ui.policySection.hidden=true;ui.restInfo.innerHTML='<section class="invalidLinkCard"><div class="invalidIcon">!</div><h2>問卷連結不正確</h2><p>請確認網址是否包含正確的活動參數，或向活動管理者重新索取問卷連結。</p></section>'}
function memberOptionLabel(m){return ((employeeNo(m)?employeeNo(m)+' ':'')+(m?.name||'')).trim()}
function renderMembers(){let value=ui.dept.value,members=targetMembers().filter(x=>memberDepartment(x)===value);ui.member.disabled=!value;ui.member.innerHTML='<option value="">'+(value?'請選擇姓名':'請先選擇部門')+'</option>'+members.map(x=>`<option value="${escAttr(x.id)}">${esc(memberOptionLabel(x))}</option>`).join('')}
function rankLimit(){return Math.min(D.restaurants.length,3)}
function rankLabel(i){return['第一','第二','第三'][i]||('第'+(i+1))}
function updateAvailability(clear=false){let attending=ui.attend.checked,cannot=ui.cannot.checked,disabled=!attending;if(clear||cannot){document.querySelectorAll('.dateOpt').forEach(x=>x.checked=false);document.querySelectorAll('.rankSelect').forEach(x=>x.value='')}document.querySelectorAll('.dateOpt').forEach(x=>x.disabled=disabled);ui.dateSection.classList.toggle('hiddenByAttendance',cannot);ui.rankSection.classList.toggle('hiddenByAttendance',cannot);ui.dateSection.classList.toggle('pending',!attending&&!cannot);ui.rankSection.classList.toggle('pending',!attending&&!cannot);syncRestaurantChoices()}
function syncRestaurantChoices(){let selects=[...document.querySelectorAll('.rankSelect')],formDisabled=!ui.attend.checked;selects.forEach((select,index)=>{let disabled=formDisabled||(index>0&&!selects[index-1].value);if(disabled&&index>0)select.value='';select.disabled=disabled});let chosen=selects.map(x=>x.value).filter(Boolean);selects.forEach(select=>[...select.options].forEach(option=>option.disabled=!!option.value&&option.value!==select.value&&chosen.includes(option.value)))}
function resetForm(){ui.dept.value='';ui.member.innerHTML='<option value="">請先選擇部門</option>';ui.member.disabled=true;ui.attend.checked=false;ui.cannot.checked=false;document.querySelectorAll('.dateOpt').forEach(x=>x.checked=false);document.querySelectorAll('.rankSelect').forEach(x=>x.value='');ui.note.value='';ui.submitStatus.textContent='';ui.submitStatus.classList.remove('error');updateAvailability()}

async function submitVote(){
  if(isSubmitting)return;let survey=activeSurvey();if(!survey)return alert('目前沒有可填寫活動');if(survey.status!=='open'||isDeadlinePassed(survey.deadline))return alert('問卷未開放或已截止，請重新整理頁面');
  let department=ui.dept.value,memberId=ui.member.value;if(!department||!memberId)return alert('請選擇部門與姓名');let person=D.members.find(x=>x.id===memberId);if(!person||memberDepartment(person)!==department)return alert('人員資料與部門不相符，請重新選擇');
  if(!memberCanFill(person))return alert('您不在本次活動開放填寫名單內，請洽活動管理者確認。');
  if(!ui.attend.checked&&!ui.cannot.checked)return alert('請先選擇可以參加或不克參加');let cannot=ui.cannot.checked,dateIds=[...document.querySelectorAll('.dateOpt:checked')].map(x=>x.value);if(!cannot&&!dateIds.length)return alert('請至少勾選一個可以出席的日期，或選擇不克參加');
  let ranks=[...document.querySelectorAll('.rankSelect')].map(x=>x.value),picked=ranks.filter(Boolean);if(!cannot&&D.restaurants.length&&!ranks[0])return alert('請至少選擇一間餐廳，第一選擇為必填');if(ranks.some((value,index)=>value&&ranks.slice(0,index).some(previous=>!previous)))return alert('請依序填寫餐廳選擇，不要跳過前一個選擇');if(new Set(picked).size!==picked.length)return alert('餐廳選擇不可重複');
  let responseRef=doc('responses',activeSurveyId+'_'+memberId);if(survey.allowEdit===false){try{let existing=await responseRef.get();if(existing.exists)return alert('此姓名已完成填寫，本活動不允許再次修改')}catch(e){console.warn('skip public duplicate check',e)}}
  let payload={surveyId:activeSurveyId,departmentName:department,memberId,memberName:person.name||'',employeeNo:employeeNo(person),preferredDateId:'',alternateDateId:'',dateIds:cannot?[]:dateIds,cannotAttend:cannot,restaurantRanks:cannot?[]:ranks,note:ui.note.value.trim(),submittedAt:firebase.firestore.FieldValue.serverTimestamp(),submittedAtText:formatDateTimeV784(new Date())};
  if(!confirm('確認送出 '+payload.departmentName+' '+payload.memberName+' 的問卷？'))return;
  try{isSubmitting=true;ui.submit.disabled=true;ui.submit.textContent='送出中…';ui.submitStatus.textContent='正在儲存，請勿關閉頁面。';await responseRef.set(payload,{merge:true});ui.form.hidden=true;ui.done.hidden=false;ui.done.innerHTML='<div class="check">✓</div><h2>填寫成功</h2><p><b>'+esc(payload.departmentName)+' '+esc(payload.memberName)+'</b></p><p>送出時間：'+esc(payload.submittedAtText)+'</p><button class="btn primary" type="button" onclick="location.reload()">返回問卷</button>'}catch(e){console.error('submit failed',e);ui.submitStatus.textContent=(survey.allowEdit===false&&/permission|權限|insufficient/i.test(String(e?.message||e)))?'此姓名已完成填寫，本活動不允許再次修改。':'送出失敗，請檢查網路後再試一次。';ui.submitStatus.classList.add('error');toast('送出失敗')}finally{isSubmitting=false;ui.submit.disabled=false;ui.submit.textContent='確認並送出'}
}

function normalizeEmailV806(value){return String(value||'').trim().toLowerCase()}
function memberGoogleEmailV806(m){
  let account=D.memberAccounts.find(a=>String(a.memberId||a.id||'')===String(m?.id||''));
  return normalizeEmailV806(account?.email||m?.googleEmail||m?.googleAccount||m?.email||m?.gmail||'');
}
function currentMemberByEmailV806(email){
  let normalized=normalizeEmailV806(email);
  if(!normalized)return null;
  let account=D.memberAccounts.find(a=>normalizeEmailV806(a.email)===normalized);
  if(account){
    let memberId=account.memberId||account.id;
    let member=D.members.find(m=>String(m.id)===String(memberId));
    if(member&&memberBelongsToActiveSurveyV1023(member))return member;
  }
  return D.members.find(m=>memberBelongsToActiveSurveyV1023(m)&&memberGoogleEmailV806(m)===normalized)||null;
}
async function ensureFrontUserV806(){
  if(!auth)throw new Error('此瀏覽器目前無法使用 Google 登入');
  if(auth.currentUser)return auth.currentUser;
  let provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  try{
    let result=await auth.signInWithPopup(provider);
    return result.user;
  }catch(e){
    if(String(e?.code||'').includes('popup'))toast('登入視窗被瀏覽器阻擋，請允許彈出視窗後再試一次。');
    throw e;
  }
}
async function switchFrontUserV807(){
  try{if(auth?.currentUser)await auth.signOut()}catch(e){console.warn('front sign out failed',e)}
  let provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  let result=await auth.signInWithPopup(provider);
  return result.user;
}
function responseDateLabelsV806(response){
  let ids=Array.isArray(response?.dateIds)?response.dateIds:[response?.preferredDateId,response?.alternateDateId].filter(Boolean);
  return ids.map(id=>D.dates.find(d=>d.id===id)?.label||id).filter(Boolean);
}
function responseRestaurantRowsV806(response){
  let ranks=Array.isArray(response?.restaurantRanks)?response.restaurantRanks:[];
  return ranks.map((id,index)=>{
    if(!id)return '';
    let rest=D.restaurants.find(r=>r.id===id);
    return '<li><span>'+esc(rankLabel(index))+'選擇</span><b>'+esc(rest?.name||id)+'</b></li>';
  }).filter(Boolean).join('');
}
function ensureMyResponseDialogV806(){
  let mask=byId('myResponseModalV806');
  if(mask)return mask;
  mask=document.createElement('div');
  mask.id='myResponseModalV806';
  mask.className='myResponseMaskV806';
  mask.innerHTML='<div class="myResponseDialogV806" role="dialog" aria-modal="true" aria-labelledby="myResponseTitleV806"><button class="myResponseCloseV806" type="button" aria-label="關閉">×</button><div class="myResponseHeadV806"><h2 id="myResponseTitleV806">我的填寫結果</h2><p id="myResponseSubV806"></p></div><div id="myResponseBodyV806" class="myResponseBodyV806"></div><div class="myResponseActionsV806"><button class="btn myResponseSwitchV807" type="button">切換 Google 帳號</button><button class="btn primary myResponseCloseBtnV807" type="button">關閉</button></div></div>';
  document.body.appendChild(mask);
  mask.addEventListener('click',event=>{if(event.target===mask)closeMyResponseDialogV806()});
  mask.querySelector('.myResponseCloseV806').addEventListener('click',closeMyResponseDialogV806);
  mask.querySelector('.myResponseCloseBtnV807').addEventListener('click',closeMyResponseDialogV806);
  mask.querySelector('.myResponseSwitchV807').addEventListener('click',()=>showMyResponse(true));
  return mask;
}
function closeMyResponseDialogV806(){
  let mask=byId('myResponseModalV806');
  if(mask)mask.classList.remove('show');
}
function renderMyResponseDialogV806(member,response,user){
  let mask=ensureMyResponseDialogV806(),body=byId('myResponseBodyV806'),sub=byId('myResponseSubV806');
  sub.textContent=[memberDepartment(member),member.name||member.employeeName||'',employeeNo(member)?'員編 '+employeeNo(member):''].filter(Boolean).join('｜')+'｜'+(user.email||'');
  if(!response){
    body.innerHTML='<div class="myResponseEmptyV806"><b>尚未找到填答內容</b><p>目前查不到您在本活動的填寫紀錄。若您已填寫，請確認登入的 Google 帳號是否與人員管理內登錄的帳號相同。</p></div>';
  }else{
    let cannot=!!response.cannotAttend,dates=responseDateLabelsV806(response),restaurants=responseRestaurantRowsV806(response);
    body.innerHTML='<dl class="myResponseListV806">'+
      '<div><dt>活動</dt><dd>'+esc(activeSurvey()?.title||activeSurveyId||'')+'</dd></div>'+
      '<div><dt>填寫人</dt><dd>'+esc((response.departmentName||memberDepartment(member))+' '+(response.memberName||member.name||''))+'</dd></div>'+
      '<div><dt>參加狀態</dt><dd><span class="myResponseBadgeV806 '+(cannot?'warn':'ok')+'">'+(cannot?'不克參加':'可以參加')+'</span></dd></div>'+
      '<div><dt>可參加日期</dt><dd>'+(cannot?'—':(dates.length?dates.map(esc).join('、'):'未填寫'))+'</dd></div>'+
      '<div><dt>餐廳選擇</dt><dd>'+(cannot?'—':(restaurants?'<ol class="myResponseRanksV806">'+restaurants+'</ol>':'未填寫'))+'</dd></div>'+
      '<div><dt>備註</dt><dd>'+esc(response.note||'—')+'</dd></div>'+
      '<div><dt>送出時間</dt><dd>'+esc(response.submittedAtText||formatDateTimeV784(response.submittedAt)||'—')+'</dd></div>'+
      '</dl>';
  }
  mask.classList.add('show');
}
function renderMyResponseAccountErrorV807(user){
  let mask=ensureMyResponseDialogV806(),body=byId('myResponseBodyV806'),sub=byId('myResponseSubV806');
  sub.textContent=user?.email?'目前登入：'+user.email:'尚未登入 Google 帳號';
  body.innerHTML='<div class="myResponseEmptyV806"><b>找不到此 Google 帳號對應的人員資料</b><p>請確認使用的是人員管理內登錄的 Google 帳號；若登入錯帳號，請按下方「切換 Google 帳號」重新選擇。</p></div>';
  mask.classList.add('show');
}
async function showMyResponse(forceSwitch=false){
  if(frontLinkInvalid||!activeSurveyId)return alert('請使用完整的問卷連結查看填寫結果。');
  beginPersonalResultModeV948();
  try{
    ui.myResponseBtn.disabled=true;
    ui.myResponseBtn.textContent='讀取中...';
    if(!D.memberAccounts.length)D.memberAccounts=await safeCollection('memberAccounts');
    let user=forceSwitch?await switchFrontUserV807():await ensureFrontUserV806();
    if(!D.memberAccounts.length)D.memberAccounts=await safeCollection('memberAccounts');
    let member=currentMemberByEmailV806(user.email);
    if(!member){renderMyResponseAccountErrorV807(user);return}
    let responseSnap=await doc('responses',activeSurveyId+'_'+member.id).get();
    renderMyResponseDialogV806(member,responseSnap.exists?{id:responseSnap.id,...responseSnap.data()}:null,user);
  }catch(e){
    console.error('show my response failed',e);
    alert('無法讀取您的填寫結果，請確認已使用人員管理內登錄的 Google 帳號登入，或稍後再試。');
  }finally{
    ui.myResponseBtn.disabled=false;
    ui.myResponseBtn.textContent='查看我的填寫結果';
  }
}

function bindAdminShortcut(){let clicks=0,timer=null,hold=null;ui.logo.addEventListener('click',()=>{clicks++;clearTimeout(timer);timer=setTimeout(()=>clicks=0,1800);if(clicks>=5)location.href='manage/#manage'});ui.logo.addEventListener('pointerdown',()=>{hold=setTimeout(()=>location.href='manage/#manage',1200)});['pointerup','pointercancel','pointerleave'].forEach(name=>ui.logo.addEventListener(name,()=>clearTimeout(hold)))}
function userDocLabelV723(userDoc){return [userDoc?.department||userDoc?.departmentName,userDoc?.name||userDoc?.employeeName||userDoc?.displayName].filter(Boolean).join(' ')}
async function loadPreviewIdentityV723(user){
  if(!user||previewIdentityLoaded)return;
  previewIdentityLoaded=true;
  D.memberAccounts=await safeCollection('memberAccounts');
  try{
    let direct=await doc('users',user.uid).get();
    if(direct.exists)previewUserDoc=direct.data();
    else{
      let q=await col('users').where('email','==',String(user.email||'').toLowerCase()).limit(1).get();
      if(!q.empty)previewUserDoc=q.docs[0].data();
    }
  }catch(e){console.warn('讀取預覽登入者資料失敗',e)}
}
function previewUserLabelV719(user){let email=String(user?.email||'').toLowerCase(),account=D.memberAccounts?.find(a=>String(a.email||'').toLowerCase()===email),member=account?D.members.find(m=>m.id===account.memberId):D.members.find(m=>String(m.googleEmail||m.email||'').toLowerCase()===email);return (member?[member.department||member.departmentName,member.name||member.employeeName].filter(Boolean).join(' '):'')||userDocLabelV723(previewUserDoc)||(user?.displayName||user?.email||'')}
function updatePreviewAdminLabelV723(){if(ui.previewUser&&previewAuthUser)ui.previewUser.textContent=previewUserLabelV719(previewAuthUser)}
const ADMIN_PREVIEW_SESSION_KEY_V923='deptdineAdminPreviewV923';
function clearAdminPreviewSessionV923(){try{sessionStorage.removeItem(ADMIN_PREVIEW_SESSION_KEY_V923)}catch(e){}}
function beginPersonalResultModeV948(){
  clearAdminPreviewSessionV923();
  previewAuthUser=null;
  previewIdentityLoaded=false;
  previewUserDoc=null;
  if(ui.previewBar)ui.previewBar.hidden=true;
  document.documentElement.dataset.frontSessionMode='personal-result';
}
function hasAdminPreviewSessionV923(){
  try{
    let state=JSON.parse(sessionStorage.getItem(ADMIN_PREVIEW_SESSION_KEY_V923)||'null'),requested=String(new URLSearchParams(location.search).get('survey')||'');
    if(!state||!requested||String(state.surveyId||'')!==requested||Number(state.expiresAt||0)<=Date.now()){clearAdminPreviewSessionV923();return false}
    return true;
  }catch(e){clearAdminPreviewSessionV923();return false}
}
function bindPreviewAdmin(){
  if(!hasAdminPreviewSessionV923()||!auth||!ui.previewBar)return;
  auth.onAuthStateChanged(async user=>{
    if(!hasAdminPreviewSessionV923()){
      previewAuthUser=null;
      ui.previewBar.hidden=true;
      return;
    }
    previewAuthUser=user;
    ui.previewBar.hidden=!user;
    if(user){
      document.documentElement.dataset.frontSessionMode='admin-preview';
      ui.previewUser.textContent=previewUserLabelV719(user);
      await loadPreviewIdentityV723(user);
      updatePreviewAdminLabelV723();
    }
  });
  ui.backAdmin?.addEventListener('click',()=>{clearAdminPreviewSessionV923();location.href='manage/'+(activeSurveyId?'#manage/'+encodeURIComponent(activeSurveyId):'#manage')});
  ui.previewLogout?.addEventListener('click',async()=>{try{clearAdminPreviewSessionV923();await auth.signOut()}finally{ui.previewBar.hidden=true;toast('已登出')}})
}
let securityKeyHandlerV719=null,securityContextHandlerV719=null;
function applySecurityLocksV719(settings){settings=settings||{};document.removeEventListener('contextmenu',securityContextHandlerV719,true);document.removeEventListener('keydown',securityKeyHandlerV719,true);securityContextHandlerV719=e=>{if(settings.disableRightClick){e.preventDefault();toast('此頁已停用右鍵選單')}};securityKeyHandlerV719=e=>{let k=String(e.key||'').toLowerCase(),blockSource=settings.disableViewSource&&e.ctrlKey&&k==='u',blockDev=settings.disableDevTools&&(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k)));if(blockSource||blockDev){e.preventDefault();e.stopPropagation();toast('此快捷鍵已停用')}};document.addEventListener('contextmenu',securityContextHandlerV719,true);document.addEventListener('keydown',securityKeyHandlerV719,true)}
function splitDeadline(value){let match=String(value||'').match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);return match?{date:match[1],time:match[2]||'23:59'}:{date:'',time:'23:59'}}
function deadlineDate(value){let part=splitDeadline(value);if(!part.date)return null;let date=new Date(part.date+'T'+part.time+':00');return Number.isNaN(date.getTime())?null:date}
function isDeadlinePassed(value){let date=deadlineDate(value);return date?date<new Date():false}
function formatDeadline(value){let part=splitDeadline(value);return part.date?part.date.replaceAll('-','/')+' '+part.time:''}
function safeUrl(value){let raw=String(value||'').trim();if(!raw||!/^https?:\/\//i.test(raw))return'';try{let url=new URL(raw);return /^https?:$/.test(url.protocol)?url.href:''}catch(e){return''}}
function esc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function escAttr(value){return esc(value)}
function toast(message){ui.toast.textContent=message;ui.toast.style.display='block';clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>ui.toast.style.display='none',2400)}
// ===== 前台排程開放狀態 =====
function openDateV711(s){if(s?.openMode!=='scheduled'||!s.openAt)return null;let d=new Date(s.openAt);return Number.isNaN(d.getTime())?null:d}
function surveyAvailabilityV711(s){let now=new Date(),end=deadlineDate(s?.deadline),start=openDateV711(s);if(s?.status==='archived'||s?.archived===true)return{state:'closed',label:'問卷已截止',message:'本活動已截止填寫',time:s?.deadline?'截止時間：'+formatDeadline(s.deadline):'感謝您的參與。'};if(end&&end<now)return{state:'closed',label:'問卷已截止',message:'本活動已截止填寫',time:'截止時間：'+formatDeadline(s.deadline)};if(s?.status==='draft')return{state:'upcoming',label:'問卷尚未開放',message:'問卷尚未開放',time:start?'開放時間：'+formatDeadline(s.openAt):''};if(s?.status!=='open')return{state:'paused',label:'問卷暫停填寫',message:'本活動目前暫停填寫',time:start?'原訂開放時間：'+formatDeadline(s.openAt):''};if(start&&start>now)return{state:'upcoming',label:'問卷尚未開放',message:'問卷尚未開放',time:'開放時間：'+formatDeadline(s.openAt)};return{state:'open',label:'問卷開放中',message:'',time:''}}
let availabilityTimerV711=null;function scheduleAvailabilityRefreshV711(s){clearTimeout(availabilityTimerV711);let now=Date.now(),times=[openDateV711(s)?.getTime(),deadlineDate(s?.deadline)?.getTime()].filter(x=>Number.isFinite(x)&&x>now),next=times.length?Math.min(...times):0;if(next)availabilityTimerV711=setTimeout(()=>renderFront(),Math.min(next-now+1000,2147483000))}
const renderFrontV711=renderFront;renderFront=function(){renderFrontV711();let s=activeSurvey();if(!s)return;scheduleAvailabilityRefreshV711(s);let state=surveyAvailabilityV711(s);if(state.state==='open')return;ui.status.textContent=state.label;ui.form.hidden=true;ui.closed.hidden=false;ui.closed.innerHTML='<b>'+esc(state.message)+'</b>'+(state.time?'<br>'+esc(state.time):'')+(state.state==='upcoming'?'<br>請於開放後再進行填寫。':'')};
const submitVoteV711=submitVote;submitVote=async function(){let state=surveyAvailabilityV711(activeSurvey());if(state.state!=='open')return alert(state.message+(state.time?'\n'+state.time:''));return submitVoteV711()};
const renderFrontV723=renderFront;renderFront=function(){renderFrontV723();updatePreviewAdminLabelV723()};
ui.homeLoginButton?.addEventListener('click',loginManage);
window.addEventListener('DOMContentLoaded',init);










