// ========= Firebase Web App 設定：已串接 seal-management-68465 =========

// ========================================================
let app,auth,db,ready=false,currentUser=null,isAdmin=false,isSystemAdmin=false,currentAccessRole='',surveyAssignments=[],activeSurveyId=null,isSubmitting=false,surveyFormMode='view',editingSurveyId=null,surveyFormDirty=false,memberFormMode='view',editingMemberId=null,editingDateId=null,editingRestaurantId=null,editingResponseId=null;
let D={departments:[],members:[],memberAccounts:[],surveys:[],dates:[],restaurants:[],responses:[],final:null,managers:[],budgetEligibility:[]};
// === DOM references: do not rely on browser auto-created global variables for element IDs ===
function el(id){ return document.getElementById(id); }
const activeSurveyInfo = el('activeSurveyInfo');
const activeSurveySelect = el('activeSurveySelect');
const admin = el('admin');
const adminPreviewBar = el('adminPreviewBar');
const adminTitle = el('adminTitle');
const adminUser = el('adminUser');
const adminRole = el('adminRole');
const previewAdminUser = el('previewAdminUser');
const bar = el('bar');
const cannot = el('cannot');
const attendYes = el('attendYes');
const closed = el('closed');
const dash = el('dash');
const dateBox = el('dateBox');
const attendanceDateSection = el('attendanceDateSection');
const dateP = el('dateP');
const dateTable = el('dateTable');
const dateFormHeading = el('dateFormHeading');
const dateModeBadge = el('dateModeBadge');
const dateSaveBtn = el('dateSaveBtn');
const dateCancelBtn = el('dateCancelBtn');
const deadline = el('deadline');
const dept = el('dept');
const done = el('done');
const finalDate = el('finalDate');
const finalFront = el('finalFront');
const finalLock = el('finalLock');
const finalNote = el('finalNote');
const finalP = el('finalP');
const finalRest = el('finalRest');
const formGrid = el('formGrid');
const front = el('front');
const frontContent = el('frontContent');
const frontLoading = el('frontLoading');
const frontStatus = el('frontStatus');
const loginMask = el('loginMask');
const loginMsg = el('loginMsg');
const loginBtn = el('loginBtn');
const memDept = el('memDept');
const memP = el('memP');
const memTable = el('memTable');
const memStatus = el('memStatus');
const memBudgetEligible = el('memBudgetEligible');
const budgetPerPerson = el('budgetPerPerson');
const budgetSaveBtn = el('budgetSaveBtn');
const member = el('member');
const memberEditor = el('memberEditor');
const memberFormHeading = el('memberFormHeading');
const memberModeBadge = el('memberModeBadge');
const memberSaveBtn = el('memberSaveBtn');
const memberImportInput = el('memberImportInput');
const memberImportResult = el('memberImportResult');
const managerEmail = el('managerEmail');
const managerRole = el('managerRole');
const managerTable = el('managerTable');
const newAddr = el('newAddr');
const newCuisine = el('newCuisine');
const newDate = el('newDate');
const newDateSort = el('newDateSort');
const newEmp = el('newEmp');
const memGoogle = el('memGoogle');
const newMap = el('newMap');
const newBudget = el('newBudget');
const newPrice = el('newPrice');
const restVarianceHint = el('restVarianceHint');
const newMem = el('newMem');
const newRest = el('newRest');
const newRestSort = el('newRestSort');
const note = el('note');
const rankGrid = el('rankGrid');
const rankSection = el('rankSection');
const respP = el('respP');
const restInfo = el('restInfo');
const restP = el('restP');
const restTable = el('restTable');
const restFormHeading = el('restFormHeading');
const restModeBadge = el('restModeBadge');
const restSaveBtn = el('restSaveBtn');
const restCancelBtn = el('restCancelBtn');
const resultTables = el('resultTables');
const responseEditMask = el('responseEditMask');
const responseEditIdentity = el('responseEditIdentity');
const responseEditCannot = el('responseEditCannot');
const responseEditDates = el('responseEditDates');
const responseEditRanks = el('responseEditRanks');
const responseEditNote = el('responseEditNote');
const responseEditStatus = el('responseEditStatus');
const responseEditSaveBtn = el('responseEditSaveBtn');
const sFilled = el('sFilled');
const sNo = el('sNo');
const sRate = el('sRate');
const sTotal = el('sTotal');
const secretLogo = el('secretLogo');
const setup = el('setup');
const surveyDesc = el('surveyDesc');
const surveyP = el('surveyP');
const surveyTable = el('surveyTable');
const surveyTitle = el('surveyTitle');
const svAllowEdit = el('svAllowEdit');
const svDeadline = el('svDeadline');
const svDeadlineTime = el('svDeadlineTime');
const svDesc = el('svDesc');
const svInstructions = el('svInstructions');
const svStatus = el('svStatus');
const svTitle = el('svTitle');
const targetDeptBox = el('targetDeptBox');
const surveyEditor = el('surveyEditor');
const surveyFormHeading = el('surveyFormHeading');
const surveyEditorContext = el('surveyEditorContext');
const surveyModeBadge = el('surveyModeBadge');
const surveySaveBtn = el('surveySaveBtn');
const surveyUnsaved = el('surveyUnsaved');
const submitBtn = el('submitBtn');
const submitStatus = el('submitStatus');
const editPolicyNotice = el('editPolicyNotice');
const frontInstructionsSection = el('frontInstructionsSection');
function hasConfig(){return firebaseConfig.apiKey && firebaseConfig.projectId}
function applyBranding(){
  document.querySelector('.brand>.logo+div')?.remove();
  document.querySelectorAll('.brand img,.modalHead>img,.side .ab>img').forEach(img=>{img.src='../assets/company-logo.png';img.alt='環興科技股份有限公司｜SINOTECH ENGINEERING SERVICES, LTD.';img.classList.add('companyIdentity')});
  secretLogo.classList.add('companyIdentity');
  document.documentElement.classList.add('brandReady');
}
const FRONT_THEMES={classic:'經典深藍',lake:'湖水綠',warm:'暖橘米白',aqua:'清新藍綠',purple:'柔和紫灰',ivory:'米白簡約',rose:'玫瑰柔粉',slate:'霧灰專業',forest:'森林晨光',sea:'海鹽藍',milk:'奶茶午後',sakura:'櫻花淡粉',citrus:'柑橘派對',night:'星空深藍',lavender:'薰衣草花園',lakePro:'湖水綠 Pro',sinotechRed:'環興紅企業版',appleWhite:'極簡白 Apple版',patternWave:'水光波紋',botanicalMist:'葉影晨霧',sakuraBloom:'櫻花花影',cloudBlue:'藍天雲朵',goldNavy:'黑金流線',creamWaves:'奶油金紋',coralBubble:'珊瑚泡泡',mintGarden:'薄荷花園',auroraPurple:'極光紫霧',paperDoodle:'手繪便條'};
const THEME_CATEGORIES={basic:{label:'基礎色系',themes:['classic','lake','warm','aqua','purple','ivory','rose','slate']},soft:{label:'柔和清新',themes:['forest','sea','milk','sakura','citrus','lavender','lakePro','appleWhite']},brand:{label:'企業質感',themes:['sinotechRed','night']},pattern:{label:'圖案質感',themes:['patternWave','botanicalMist','sakuraBloom','cloudBlue','goldNavy','creamWaves','coralBubble','mintGarden','auroraPurple','paperDoodle']}};
function normalizeTheme(value){return FRONT_THEMES[value]?value:'classic'}
function applyFrontTheme(value){document.body.dataset.frontTheme=normalizeTheme(value)}
function themeSelect(){return el('svTheme')}
function themeCategorySelect(){return el('svThemeCategory')}
function categoryOfTheme(theme){theme=normalizeTheme(theme);return Object.entries(THEME_CATEGORIES).find(([,data])=>data.themes.includes(theme))?.[0]||'basic'}
function themeOptionsForCategory(category){return (THEME_CATEGORIES[category]||THEME_CATEGORIES.basic).themes.map(value=>'<option value="'+value+'">'+FRONT_THEMES[value]+'</option>').join('')}
function syncThemeOptions(keepTheme){
  let category=themeCategorySelect(),select=themeSelect();if(!category||!select)return;
  let theme=normalizeTheme(keepTheme||select.value),targetCategory=categoryOfTheme(theme);
  if(category.value!==targetCategory)category.value=targetCategory;
  select.innerHTML=themeOptionsForCategory(category.value);
  select.value=(THEME_CATEGORIES[category.value]||THEME_CATEGORIES.basic).themes.includes(theme)?theme:(THEME_CATEGORIES[category.value]||THEME_CATEGORIES.basic).themes[0];
}
function ensureThemeControl(){
  if(themeSelect()||!svAllowEdit)return;
  let field=document.createElement('div');
  field.className='field';
  field.innerHTML='<label>前台主題樣式</label><div class="themeControlGrid"><div><small>主題類別</small><select id="svThemeCategory">'+Object.entries(THEME_CATEGORIES).map(([value,data])=>'<option value="'+value+'">'+data.label+'</option>').join('')+'</select></div><div><small>主題樣式</small><select id="svTheme"></select></div></div><div id="themePreview" class="themePreview" aria-live="polite"></div>';
  let row=svAllowEdit.closest('.two');
  if(row)row.insertAdjacentElement('afterend',field);else svAllowEdit.closest('.field')?.insertAdjacentElement('afterend',field);
  syncThemeOptions('classic');
  themeCategorySelect()?.addEventListener('change',()=>{syncThemeOptions((THEME_CATEGORIES[themeCategorySelect().value]||THEME_CATEGORIES.basic).themes[0]);renderThemePreview();markSurveyDirty()});
  themeSelect()?.addEventListener('change',()=>{renderThemePreview();markSurveyDirty()});
  renderThemePreview();
}
function renderThemePreview(){
  let select=themeSelect(),preview=el('themePreview');if(!select||!preview)return;
  syncThemeOptions(select.value);
  let theme=normalizeTheme(select.value);preview.dataset.theme=theme;
  preview.innerHTML='<div class="themePreviewBar"><span>'+FRONT_THEMES[theme]+'</span><span class="themePreviewDeadline">截止時間</span></div><div class="themePreviewBody"><span>前台頁面背景</span><span class="themePreviewStatus">問卷開放中</span></div>';
}
const DESCRIPTION_FONT_SIZES=[14,16,18,20];
function normalizeDescriptionFontSize(value){let size=Number(value);return DESCRIPTION_FONT_SIZES.includes(size)?size:16}
function normalizeDescriptionAlign(value){return value==='center'?'center':'left'}
function richEditor(){return el('svDescEditor')}
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
function plainDescriptionHtml(value){return esc(String(value||'')).replace(/\r?\n/g,'<br>')}
function ensureRichDescriptionEditor(){
  if(richEditor()||!svDesc)return;
  let field=svDesc.closest('.field');field?.classList.add('richDescriptionField');
  let controls=document.createElement('div');controls.className='richDescriptionControls';
  controls.innerHTML='<div class="richToolbar" role="toolbar" aria-label="說明文字格式"><button type="button" class="richToolButton" data-command="bold" title="粗體">B</button><span class="richToolDivider"></span><button type="button" class="richToolButton" data-command="insertUnorderedList">• 清單</button><button type="button" class="richToolButton" data-command="insertOrderedList">1. 清單</button><span class="richToolDivider"></span><button type="button" class="richToolButton" data-command="createLink">加入連結</button><button type="button" class="richToolButton" data-command="removeFormat">清除格式</button></div><div id="svDescEditor" class="richEditor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="輸入活動說明，可選取文字後套用格式"></div><div class="richSettings"><div class="field"><label for="svDescFontSize">文字大小</label><select id="svDescFontSize"><option value="14">小（14px）</option><option value="16" selected>標準（16px）</option><option value="18">大（18px）</option><option value="20">特大（20px）</option></select></div><div class="field"><label for="svDescAlign">對齊方式</label><select id="svDescAlign"><option value="left">靠左</option><option value="center">置中</option></select></div></div><div class="richHelp">可使用粗體、項目符號、編號及安全連結；不開放任意顏色與字型。</div>';
  svDesc.insertAdjacentElement('beforebegin',controls);
  richEditor().addEventListener('input',()=>syncRichDescription(true));
  ['svDescFontSize','svDescAlign'].forEach(id=>el(id)?.addEventListener('change',markSurveyDirty));
  controls.querySelectorAll('.richToolButton').forEach(button=>{
    button.addEventListener('mousedown',event=>event.preventDefault());
    button.addEventListener('click',()=>runRichCommand(button.dataset.command));
  });
}
function runRichCommand(command){
  let editor=richEditor();if(!editor)return;
  let selection=window.getSelection();
  if(!selection?.rangeCount||!editor.contains(selection.anchorNode)){editor.focus();return alert('請先選取說明文字，再套用格式')}
  document.execCommand('styleWithCSS',false,false);
  if(command==='createLink'){
    if(!selection.toString().trim())return alert('請先選取要加入連結的文字');
    let input=prompt('請輸入網址、Email 或電話連結');if(input===null)return;
    let href=safeRichHref(input);if(!href)return alert('連結格式不正確');
    document.execCommand('createLink',false,href);
  }else if(command==='removeFormat'){
    document.execCommand('removeFormat',false,null);document.execCommand('unlink',false,null);
  }else document.execCommand(command,false,null);
  syncRichDescription(true);editor.focus();
}
function syncRichDescription(markDirty=false){
  let editor=richEditor();if(!editor)return;
  svDesc.value=editor.innerText.replace(/\u00a0/g,' ').trim();
  if(markDirty)markSurveyDirty();
}
function setRichDescription(survey){
  ensureRichDescriptionEditor();let editor=richEditor();if(!editor)return;
  editor.innerHTML=survey?.descriptionHtml?sanitizeRichHtml(survey.descriptionHtml):plainDescriptionHtml(survey?.description||'');
  el('svDescFontSize').value=String(normalizeDescriptionFontSize(survey?.descriptionFontSize));
  el('svDescAlign').value=normalizeDescriptionAlign(survey?.descriptionAlign);
  syncRichDescription(false);
}
function getRichDescriptionData(){
  let editor=richEditor();if(!editor)return{description:svDesc.value.trim(),descriptionHtml:'',descriptionFontSize:16,descriptionAlign:'left'};
  let html=sanitizeRichHtml(editor.innerHTML),plain=editor.innerText.replace(/\u00a0/g,' ').trim();
  return{description:plain,descriptionHtml:html,descriptionFontSize:normalizeDescriptionFontSize(el('svDescFontSize')?.value),descriptionAlign:normalizeDescriptionAlign(el('svDescAlign')?.value)};
}
function renderSurveyDescription(survey){
  let html=survey?.descriptionHtml?sanitizeRichHtml(survey.descriptionHtml):'';
  surveyDesc.classList.toggle('richDescription',!!html);
  if(html)surveyDesc.innerHTML=html;else surveyDesc.textContent=survey?.description||'';
  surveyDesc.style.fontSize=normalizeDescriptionFontSize(survey?.descriptionFontSize)+'px';
  surveyDesc.style.textAlign=normalizeDescriptionAlign(survey?.descriptionAlign);
}
function col(n){return db.collection(n)}function doc(n,id){return db.collection(n).doc(id)}
function orderByName(a,b){return String(a.name||'').localeCompare(String(b.name||''),'zh-Hant')}
function sid(s){return String(s||'').trim().toLowerCase().replace(/[.#$\[\]/]/g,'_')}
async function init(){
  applyBranding();
  ensureThemeControl();
  ensureRichDescriptionEditor();
  if(!hasConfig()){if(setup) setup.style.display='block'; if(frontLoading) frontLoading.innerHTML='請先設定 FirebaseConfig'; return}
  app=firebase.initializeApp(firebaseConfig);auth=firebase.auth();db=firebase.firestore();ready=true;
  bindSecretLogo();
  bindNavigation();
  auth.onAuthStateChanged(async u=>{
    currentUser=u;isAdmin=false;isSystemAdmin=false;currentAccessRole='';surveyAssignments=[];
    if(u){
      setLoginState(true,'正在確認管理員權限…');
      try{await withTimeout(resolveAccess(u.email,u.uid),12000,'管理權限確認逾時')}catch(e){console.error('access check failed',e);setLoginState(false,'無法確認管理權限，請檢查網路後重新登入。','重新登入');try{await auth.signOut()}catch(signOutError){console.error('sign out failed',signOutError)}return}
      if(!isAdmin){setLoginState(false,'此 Google 帳號沒有任何活動的後台權限，請聯絡系統管理員。','改用其他 Google 帳號');try{await auth.signOut()}catch(e){console.error('sign out failed',e)}return}
      setLoginState(true,'正在載入後台資料…');
      try{await withTimeout(loadAll(),20000,'後台資料載入逾時');refreshCurrentUserDisplay()}catch(e){console.error('admin data reload failed',e);isAdmin=false;setLoginState(false,'登入成功，但後台資料載入失敗，請檢查網路後重新登入。','重新登入');try{await auth.signOut()}catch(signOutError){console.error('sign out failed',signOutError)}return}
      refreshCurrentUserDisplay();closeLogin(false);
    }
    applyRoute();
  });
  try{
    await loadAll();
    renderFront();
    applyRoute();
  }catch(e){
    console.error('front init failed', e);
    if(frontStatus) frontStatus.textContent='讀取異常';
    if(frontLoading) frontLoading.style.display='none';
    if(frontContent) frontContent.style.display='block';
    if(surveyTitle) surveyTitle.textContent='問卷讀取失敗';
    if(surveyDesc) surveyDesc.textContent='請通知管理者檢查 Firestore 規則或資料欄位。';
    if(deadline) deadline.textContent='錯誤：'+((e&&e.message)?e.message:e);
    if(formGrid) formGrid.style.display='none';
  }
}
async function safeGetCollection(name){
  try{
    const snap=await col(name).get();
    return snap.docs.map(x=>({id:x.id,...x.data()}));
  }catch(e){
    console.warn('讀取 '+name+' 失敗', e);
    return [];
  }
}
async function safeGetQuery(q,name){
  try{
    const snap=await q.get();
    return snap.docs.map(x=>({id:x.id,...x.data()}));
  }catch(e){
    console.warn('讀取 '+name+' 失敗', e);
    return [];
  }
}
async function loadAll(){
  const surs=await safeGetCollection('surveys');
  D.surveys=(isAdmin&&!isSystemAdmin?surs.filter(s=>surveyAssignments.some(a=>a.surveyId===s.id&&a.enabled!==false)):surs).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  const requested=requestedSurveyId();if(requested&&D.surveys.some(s=>s.id===requested))activeSurveyId=requested;
  chooseActiveSurvey();

  const deps=await safeGetCollection('departments');
  const mems=await safeGetCollection('members');
  D.memberAccounts=isSystemAdmin?await safeGetCollection('memberAccounts'):[];
  D.departments=deps.sort((a,b)=>(a.sortOrder??a.order??999)-(b.sortOrder??b.order??999)||String(a.name||a.departmentName||a.department||'').localeCompare(String(b.name||b.departmentName||b.department||''),'zh-Hant'));
  let departmentOrder=new Map(D.departments.map((d,i)=>[String(d.name||d.departmentName||d.department||''),i]));
  D.members=mems.sort((a,b)=>{let ad=String(a.department||a.departmentName||''),bd=String(b.department||b.departmentName||''),departmentDiff=(departmentOrder.get(ad)??9999)-(departmentOrder.get(bd)??9999);if(departmentDiff)return departmentDiff;let ae=String(a.employeeNo||a.empNo||'').trim(),be=String(b.employeeNo||b.empNo||'').trim();if(!ae&&be)return 1;if(ae&&!be)return-1;return ae.localeCompare(be,'zh-Hant',{numeric:true,sensitivity:'base'})||String(a.name||'').localeCompare(String(b.name||''),'zh-Hant')});
  await loadSurveyData();
}
function chooseActiveSurvey(){
  let open=D.surveys.find(x=>x.status==='open')||D.surveys[0];
  if(!D.surveys.some(x=>x.id===activeSurveyId)) activeSurveyId=open?.id||null;
}
async function loadSurveyData(){
  if(!activeSurveyId){D.dates=[];D.restaurants=[];D.responses=[];D.final=null;D.budgetEligibility=[];return}
  const [dates,rests,resps,budgetEligibility]=await Promise.all([
    safeGetQuery(col('surveyDates').where('surveyId','==',activeSurveyId),'surveyDates'),
    safeGetQuery(col('restaurants').where('surveyId','==',activeSurveyId),'restaurants'),
    safeGetQuery(col('responses').where('surveyId','==',activeSurveyId),'responses'),
    safeGetQuery(col('budgetEligibility').where('surveyId','==',activeSurveyId),'budgetEligibility')
  ]);
  D.dates=dates.filter(x=>x.active!==false).sort((a,b)=>(a.sort??999)-(b.sort??999)||String(a.label).localeCompare(String(b.label),'zh-Hant'));
  D.restaurants=rests.filter(x=>x.active!==false).sort((a,b)=>(a.sort??999)-(b.sort??999)||String(a.name).localeCompare(String(b.name),'zh-Hant'));
  D.responses=resps;
  D.budgetEligibility=budgetEligibility;
  try{
    const fin=await doc('finalDecision',activeSurveyId).get();
    D.final=fin.exists?fin.data():null;
  }catch(e){
    console.warn('讀取 finalDecision 失敗', e);
    D.final=null;
  }
  D.managers=isSystemAdmin?await safeGetQuery(col('surveyManagers').where('surveyId','==',activeSurveyId),'surveyManagers'):[];
  currentAccessRole=isSystemAdmin?'system':(surveyAssignments.find(a=>a.surveyId===activeSurveyId&&a.enabled!==false)?.role||'');
}
function activeSurvey(){return D.surveys.find(x=>x.id===activeSurveyId)||null}

function activityBudgetPerPerson(){return moneyValue(activeSurvey()?.budgetPerPerson)}
async function saveBudgetSetting(){
  if(!canManage())return alert('此帳號沒有編輯權限');
  if(!activeSurveyId)return alert('請先選擇活動');
  let v=moneyValue(budgetPerPerson?.value);
  if(budgetPerPerson?.value.trim()!==''&&v===null)return alert('每人預算請輸入數字');
  if(budgetSaveBtn){budgetSaveBtn.disabled=true;budgetSaveBtn.textContent='儲存中…'}
  try{await doc('surveys',activeSurveyId).set({budgetPerPerson:v,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadAll();renderFront();renderAdmin();toast('每人預算已更新')}
  catch(e){console.error('save budget failed',e);alert('預算儲存失敗，請檢查網路後再試一次')}
  finally{if(budgetSaveBtn){budgetSaveBtn.disabled=false;budgetSaveBtn.textContent='儲存預算'}}
}

function targetDepartments(){let s=activeSurvey();return Array.isArray(s?.targetDepartments)?s.targetDepartments:[]}
function scopedMembers(){let t=targetDepartments();return D.members.filter(m=>m.active!==false&&(!t.length || t.includes(m.department||m.departmentName)))}
function targetMembers(){return scopedMembers().filter(memberCanFill)}
function renderFront(){
  if(frontLoading) frontLoading.style.display='none'; if(frontContent) frontContent.style.display='block';
  let s=activeSurvey();
  applyFrontTheme(s?.theme||'classic');
  if(!s){frontStatus.textContent='尚無活動';surveyTitle.textContent='目前尚未開放調查';surveyDesc.textContent='請洽管理者建立活動。';deadline.textContent='尚無截止日期';formGrid.style.display='none';return}
  surveyTitle.textContent=s.title||'未命名調查';renderSurveyDescription(s);deadline.textContent=s.deadline?'請於 '+formatDeadline(s.deadline)+' 前完成票選':'尚未設定截止日期';
  let isClosed=s.status!=='open' || isDeadlinePassed(s.deadline);
  frontStatus.textContent=isClosed?'問卷已關閉':'問卷開放中';closed.style.display=isClosed?'block':'none';formGrid.style.display=isClosed?'none':'grid';
  let frontInstructions=String(s.frontInstructions||'').trim();if(frontInstructionsSection)frontInstructionsSection.hidden=!frontInstructions;if(editPolicyNotice)editPolicyNotice.textContent=frontInstructions;
  renderFinalFront();renderFrontOptions();resetVoteForm();
}
function renderFinalFront(){let f=D.final;if(f&&f.locked){let d=D.dates.find(x=>x.id===f.finalDateId),r=D.restaurants.find(x=>x.id===f.finalRestaurantId);finalFront.style.display='block';finalFront.innerHTML='<b>本次活動已決定</b><br>日期：'+esc(d?.label||'')+'<br>餐廳：'+esc(r?.name||'')+(f.note?'<br>說明：'+esc(f.note):'')}else finalFront.style.display='none'}
function renderFrontOptions(){
  let t=targetDepartments().map(x=>String(x||'').trim()).filter(Boolean);
  let depNamesFromMaster=D.departments.map(d=>String(d.name||d.departmentName||d.department||'').trim()).filter(Boolean);
  let depNamesFromMembers=targetMembers().map(m=>String(m.department||m.departmentName||'').trim()).filter(Boolean);
  let depNames=[];
  if(t.length){
    depNames=depNamesFromMembers.length?depNamesFromMembers:t.filter(name=>!depNames.length || true);
  }else if(depNamesFromMaster.length){
    depNames=depNamesFromMaster;
  }else{
    depNames=depNamesFromMembers;
  }
  // 去除重複並依 departments.sortOrder 排序；找不到主檔時保留原順序。
  let orderMap={};D.departments.forEach(d=>{let n=String(d.name||d.departmentName||d.department||'').trim();if(n)orderMap[n]=d.sortOrder??d.order??999});
  depNames=[...new Set(depNames)].sort((a,b)=>(orderMap[a]??999)-(orderMap[b]??999)||String(a).localeCompare(String(b),'zh-Hant'));
  dept.innerHTML='<option value="">請選擇部門</option>'+depNames.map(n=>`<option value="${escAttr(n)}">${esc(n)}</option>`).join('');
  dateBox.innerHTML=D.dates.length?`<div class="dateAvailabilityInfo">請勾選所有可以出席的日期。未勾選的日期將視為無法出席；若最終選定該日期，您將不列入出席名單。</div><div class="dateAvailabilityGrid">${D.dates.map(x=>`<label class="dateAvailabilityChoice"><input type="checkbox" class="dateOpt" value="${escAttr(x.id)}"><span>${esc(x.label)}</span></label>`).join('')}</div>`:'<div class="muted">尚未設定日期選項</div>';
  let ro='<option value="">請選擇餐廳</option>'+D.restaurants.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
  rankGrid.innerHTML=Array.from({length:rankLimit()},(_,i)=>`<div class="rankField"><span><i class="rankNo">${i+1}</i>${rankLabel(i)}選擇${i===0?'<span class="required">*</span>':' <small>（選填）</small>'}</span><select class="rankSelect" aria-label="${rankLabel(i)}選擇">${ro}</select></div>`).join('')||'<div class="muted">尚未設定餐廳選項</div>';
  updateFormAvailability();
  restInfo.innerHTML=D.restaurants.map(x=>{let map=safeUrl(x.googleMap||x.mapUrl),info=safeUrl(x.infoUrl||''),typeText=x.description||x.cuisine||'',links=(map||info)?'<p class="restLinks">'+(map?'<a class="mapLink" target="_blank" rel="noopener noreferrer" href="'+escAttr(map)+'">查看地圖 ↗</a>':'')+(info?'<a class="mapLink" target="_blank" rel="noopener noreferrer" href="'+escAttr(info)+'">店家資訊 ↗</a>':'')+'</p>':'';return `<div class="restCard"><b>${esc(x.name)}</b>${typeText?'<p>類型：'+esc(typeText)+'</p>':''}${x.address?'<p>地址：'+esc(x.address)+'</p>':''}${links}</div>`}).join('')||'<div class="muted">尚未設定餐廳</div>';
}
dept.onchange=()=>{let v=dept.value;let ms=targetMembers().filter(m=>(m.department||m.departmentName)===v);member.disabled=!v;member.innerHTML='<option value="">'+(v?'請選擇姓名':'請先選擇部門')+'</option>'+ms.map(m=>`<option value="${m.id}">${esc(((m.employeeNo||m.empNo||'')+' '+m.name).trim())}</option>`).join('')};
attendYes.onchange=()=>{if(attendYes.checked)updateFormAvailability()};
cannot.onchange=()=>{if(cannot.checked)document.querySelectorAll('.dateOpt').forEach(x=>x.checked=false);updateFormAvailability(true)};
document.addEventListener('change',e=>{if(!e.target.classList)return;if(e.target.classList.contains('dateOpt')&&e.target.checked){attendYes.checked=true;cannot.checked=false;updateFormAvailability()}if(e.target.classList.contains('rankSelect'))syncRestaurantChoices()});
document.addEventListener('input',e=>{if(surveyEditor&&surveyEditor.contains(e.target))markSurveyDirty()});
document.addEventListener('change',e=>{if(surveyEditor&&surveyEditor.contains(e.target))markSurveyDirty()});
function rankLimit(){return Math.min(D.restaurants.length,3)}
function rankLabel(i){return ['第一','第二','第三'][i]||('第'+(i+1))}
function updateRankAvailability(clear=false){let selects=[...document.querySelectorAll('.rankSelect')],formDisabled=!attendYes.checked;if(clear)selects.forEach(x=>x.value='');selects.forEach((select,index)=>{let sequenceDisabled=formDisabled||(index>0&&!selects[index-1].value);if(sequenceDisabled&&index>0)select.value='';select.disabled=sequenceDisabled});let chosen=selects.map(x=>x.value).filter(Boolean);selects.forEach(select=>[...select.options].forEach(option=>{option.disabled=!!option.value&&option.value!==select.value&&chosen.includes(option.value)}));if(rankSection){rankSection.classList.toggle('rankSectionDisabled',formDisabled);rankSection.setAttribute('aria-disabled',String(formDisabled))}}
function syncRestaurantChoices(){updateRankAvailability(false)}
function updateFormAvailability(clear=false){let attending=!!attendYes.checked,no=!!cannot.checked,disabled=!attending;document.querySelectorAll('.dateOpt').forEach(x=>{if(disabled&&clear)x.checked=false;x.disabled=disabled});attendanceDateSection?.classList.toggle('attendanceHidden',no);attendanceDateSection?.classList.toggle('attendancePending',!attending&&!no);rankSection?.classList.toggle('attendanceHidden',no);rankSection?.classList.toggle('attendancePending',!attending&&!no);updateRankAvailability(clear)}
function resetVoteForm(){dept.value='';member.innerHTML='<option value="">請先選擇部門</option>';member.disabled=true;attendYes.checked=false;cannot.checked=false;document.querySelectorAll('.dateOpt').forEach(x=>x.checked=false);document.querySelectorAll('.rankSelect').forEach(x=>x.value='');updateFormAvailability();note.value='';submitStatus.textContent='';submitStatus.classList.remove('error')}
async function submitVote(){
  if(isSubmitting)return;
  let s=activeSurvey();if(!s)return alert('目前沒有可填寫活動');
  if(s.status!=='open'||isDeadlinePassed(s.deadline))return alert('問卷未開放或已截止，請重新整理頁面');
  let depName=dept.value,memId=member.value;if(!depName||!memId)return alert('請選擇部門與姓名');
  let mem=D.members.find(x=>x.id===memId);if(!mem||(mem.department||mem.departmentName)!==depName)return alert('人員資料與部門不相符，請重新選擇');
  if(!memberCanFill(mem))return alert('您不在本次活動開放填寫名單內，請洽活動管理者確認。');
  if(!attendYes.checked&&!cannot.checked)return alert('請先選擇可以參加或不克參加');
  let no=cannot.checked,dateIds=[...document.querySelectorAll('.dateOpt:checked')].map(x=>x.value);
  if(!no&&!dateIds.length)return alert('請至少勾選一個可以出席的日期，或選擇不克參加');
  let ranks=[...document.querySelectorAll('.rankSelect')].map(x=>x.value);let picked=ranks.filter(Boolean);if(!no&&D.restaurants.length&&!ranks[0])return alert('請至少選擇一間餐廳，第一選擇為必填');if(ranks.some((value,index)=>value&&ranks.slice(0,index).some(previous=>!previous)))return alert('請依序填寫餐廳選擇，不要跳過前一個選擇');if(new Set(picked).size!==picked.length)return alert('餐廳選擇不可重複');
  let responseRef=doc('responses',activeSurveyId+'_'+memId);
  if(s.allowEdit===false){try{let existing=await responseRef.get();if(existing.exists)return alert('此姓名已完成填寫，本活動不允許再次修改');}catch(e){console.error('response check failed',e);return alert('無法確認既有填寫紀錄，請檢查網路後再試一次');}}
  let payload={surveyId:activeSurveyId,departmentName:depName,memberId:memId,memberName:mem.name||'',employeeNo:mem.employeeNo||mem.empNo||'',preferredDateId:'',alternateDateId:'',dateIds:no?[]:dateIds,cannotAttend:no,restaurantRanks:ranks,note:note.value.trim(),submittedAt:firebase.firestore.FieldValue.serverTimestamp(),submittedAtText:new Date().toLocaleString('zh-TW')};
  if(!confirm('確認送出 '+payload.departmentName+' '+payload.memberName+' 的問卷？'))return;
  try{isSubmitting=true;submitBtn.disabled=true;submitBtn.textContent='送出中…';submitStatus.textContent='正在儲存，請勿關閉頁面。';await responseRef.set(payload,{merge:true});formGrid.style.display='none';done.style.display='block';done.innerHTML='<div class="check">✓</div><h2>投票成功</h2><p><b>'+esc(payload.departmentName)+' '+esc(payload.memberName)+'</b></p><p class="muted">送出時間：'+esc(payload.submittedAtText)+'</p><button class="btn primary" onclick="location.reload()">返回問卷</button>';}catch(e){console.error('submit failed',e);submitStatus.textContent='送出失敗，請檢查網路後再試一次。';submitStatus.classList.add('error');toast('送出失敗');}finally{isSubmitting=false;submitBtn.disabled=false;submitBtn.textContent='確認並送出';}
}
function requestedSurveyId(){let m=location.hash.match(/^#admin\/([^/?#]+)/);return m?decodeURIComponent(m[1]):''}
function adminHash(){return activeSurveyId?'#admin/'+encodeURIComponent(activeSurveyId):'#admin'}
function navigateTo(view,replace=false){let hash=view==='admin'?adminHash():'#front';if(location.hash!==hash)history[replace?'replaceState':'pushState'](null,'',hash);applyRoute()}
function bindNavigation(){if(location.hash!=='#front'&&!location.hash.startsWith('#admin'))history.replaceState(null,'','#front');window.addEventListener('popstate',applyRoute);window.addEventListener('hashchange',applyRoute)}
function applyRoute(){
  const wantsAdmin=location.hash.startsWith('#admin');
  if(wantsAdmin&&isAdmin){loginMask.style.display='none';front.style.display='none';admin.style.display='block';adminPreviewBar.style.display='none';applyAccessUI();renderAdmin();return}
  admin.style.display='none';front.style.display='block';adminPreviewBar.style.display=!wantsAdmin&&isAdmin?'flex':'none';renderFront();
  if(wantsAdmin&&!isAdmin)openLogin(false);else loginMask.style.display='none';
}
function openLogin(updateUrl=true){if(updateUrl)setLoginState(false);if(updateUrl&&!location.hash.startsWith('#admin'))history.pushState(null,'','#admin');loginMask.style.display='flex'}
let secretClicks=0, secretTimer=null, logoHoldTimer=null;
function secretAdminTap(){
  secretClicks++;
  clearTimeout(secretTimer);
  const left = 5 - secretClicks;
  if(secretClicks>=2 && left>0) toast('再點 '+left+' 次開啟管理登入');
  secretTimer=setTimeout(()=>{secretClicks=0},3000);
  if(secretClicks>=5){
    secretClicks=0;
    clearTimeout(secretTimer);
    toast('管理模式啟動');
    openLogin();
  }
}
function bindSecretLogo(){
  const logo=document.getElementById('secretLogo');
  if(!logo) return;
  logo.title='';
  // 手機版備用：長按 Logo 約 1.2 秒也可開啟管理登入
  logo.addEventListener('touchstart',()=>{logoHoldTimer=setTimeout(()=>{toast('管理模式啟動');openLogin()},1200)},{passive:true});
  logo.addEventListener('touchend',()=>{clearTimeout(logoHoldTimer)},{passive:true});
  logo.addEventListener('touchcancel',()=>{clearTimeout(logoHoldTimer)},{passive:true});
  // 電腦版備用：Ctrl + Shift + A
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&String(e.key).toLowerCase()==='a'){toast('管理模式啟動');openLogin()}});
  // 網址加 #admin 可直接進入後台路由；未登入時會顯示登入視窗。
}
function closeLogin(goFront=true){loginMask.style.display='none';if(goFront)setLoginState(false);if(goFront&&!isAdmin)location.href='../'}
function setLoginState(busy=false,message='',buttonText='使用 Google 登入'){
  if(loginBtn){loginBtn.disabled=busy;loginBtn.textContent=busy?'登入處理中…':buttonText}
  if(loginMsg)loginMsg.textContent=message;
}
function withTimeout(promise,ms,message){
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message||'操作逾時')),ms)})]).finally(()=>clearTimeout(timer));
}
async function loginGoogle(){
  if(!ready||!auth){setLoginState(false,'登入服務尚未準備完成，請重新整理頁面後再試。','重新登入');return}
  setLoginState(true,'正在開啟 Google 登入…');
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  try{
    await withTimeout(auth.signInWithPopup(provider),60000,'Google 登入等待時間過久');
    if(loginBtn.disabled&&loginMsg.textContent==='正在開啟 Google 登入…')setLoginState(true,'正在確認管理員權限…');
  }catch(e){
    const code=e&&e.code||'';
    const cancelled=code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request';
    setLoginState(false,cancelled?'已取消 Google 登入，您可以重新嘗試。':((e&&e.message)||'登入失敗，請稍後再試。'),'重新登入');
  }
}
async function checkAdmin(email,uid){
  if(uid){let direct=await doc('users',uid).get();if(direct.exists){let u=direct.data();return u.enabled!==false&&String(u.role||'').toLowerCase()==='admin'}}
  let q=await col('users').where('email','==',email).limit(1).get();if(q.empty)return false;let u=q.docs[0].data(),ok=u.enabled!==false&&String(u.role||'').toLowerCase()==='admin';if(ok&&uid){try{await doc('users',uid).set({email:String(email||'').toLowerCase(),role:'admin',enabled:true},{merge:true})}catch(e){console.warn('管理員 UID 文件自動建立失敗',e)}}return ok;
}
async function resolveAccess(email,uid){isSystemAdmin=await checkAdmin(email,uid);if(isSystemAdmin){isAdmin=true;currentAccessRole='system';return}let q=await col('surveyManagers').where('email','==',String(email||'').trim().toLowerCase()).where('enabled','==',true).get();surveyAssignments=q.docs.map(x=>({id:x.id,...x.data()}));isAdmin=surveyAssignments.length>0;let requested=requestedSurveyId();currentAccessRole=(requested?surveyAssignments.find(x=>x.surveyId===requested&&x.enabled!==false)?.role:surveyAssignments[0]?.role)||''}
async function enterAdmin(u){
  currentUser=u;isAdmin=true;refreshCurrentUserDisplay();closeLogin(false);await loadAll();navigateTo('admin');
}
async function logout(){await auth.signOut();currentUser=null;isAdmin=false;isSystemAdmin=false;surveyAssignments=[];location.href='../'}
function frontUrl(preview=false){let base=location.href.split('/admin/')[0]+'/';return activeSurveyId?base+'?survey='+encodeURIComponent(activeSurveyId)+(preview?'&preview=admin':''):base}
function showFront(){if(!activeSurveyId)return alert('請先選擇活動');location.href=frontUrl(true)}
function returnToAdmin(){if(isAdmin)navigateTo('admin');else openLogin()}
function canManage(){return isSystemAdmin||currentAccessRole==='manager'}
function applyAccessUI(){adminRole.textContent=isSystemAdmin?'系統管理員':currentAccessRole==='manager'?'活動管理者':'結果檢視者';activeSurveySelect.disabled=D.surveys.length<=1;document.querySelectorAll('.nav[data-access]').forEach(n=>{let a=n.dataset.access;n.hidden=(a==='system'&&!isSystemAdmin)||(a==='manager'&&!canManage())});document.querySelectorAll('.systemOnly').forEach(x=>x.hidden=!isSystemAdmin);let addSurvey=document.querySelector('.manageIntro>button');if(addSurvey)addSurvey.hidden=!isSystemAdmin;if(!isSystemAdmin)document.querySelectorAll('#surveyTable button').forEach(b=>{let text=b.textContent.trim();if(!['編輯','設為目前'].includes(text))b.hidden=true});if(!canManage())document.querySelectorAll('#dash button[onclick*="surveyP"]').forEach(b=>b.hidden=true)}

function normalizeEmail(email){return String(email||'').trim().toLowerCase()}
function memberGoogleEmail(m){let account=D.memberAccounts.find(a=>a.memberId===m?.id||a.id===m?.id);return normalizeEmail(account?.email||m?.googleEmail||m?.googleAccount||m?.email||m?.gmail||'')}
function memberDisplayName(m){let dep=String(m?.department||m?.departmentName||'').trim(),name=String(m?.name||'').trim();return (dep&&name)?(dep+' '+name):(name||dep||'')}
function findMemberByGoogleEmail(email){let target=normalizeEmail(email);if(!target)return null;return D.members.find(m=>memberGoogleEmail(m)===target)||null}
function currentUserDisplayText(){let email=normalizeEmail(currentUser?.email),m=findMemberByGoogleEmail(email),assignment=surveyAssignments.find(a=>normalizeEmail(a.email)===email);return memberDisplayName(m)||String(assignment?.displayName||'').trim()||email||''}
function refreshCurrentUserDisplay(){let display=currentUserDisplayText();if(adminUser)adminUser.textContent=display;if(previewAdminUser)previewAdminUser.textContent=display}
function renderMemberGoogleOptions(){let list=document.getElementById('memberGoogleOptions');if(!list)return;list.innerHTML=D.members.filter(m=>memberGoogleEmail(m)).map(m=>`<option value="${escAttr(memberGoogleEmail(m))}" label="${escAttr(memberDisplayName(m))}"></option>`).join('')}
function managerPersonLabel(email){let m=findMemberByGoogleEmail(email);let display=memberDisplayName(m);return display?`<b>${esc(display)}</b><br><small class="muted">${esc(normalizeEmail(email))}</small>`:`<b>${esc(normalizeEmail(email))}</b>`}
function panel(id,b){if(['accessP','sysMemP'].includes(id)&&!isSystemAdmin)return alert('此功能僅限系統管理員');if(['surveyP','memP','dateP','restP','costP','finalP'].includes(id)&&!canManage())return alert('此帳號只有檢視權限');let p=document.getElementById(id);if(!p)return;document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));p.classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));if(b){b.classList.add('active');adminTitle.textContent=b.textContent}renderAdmin()}
function table(headers,rows){return '<div class="table"><table><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+(rows.join('')||'<tr><td colspan="'+headers.length+'" class="muted">尚無資料</td></tr>')+'</tbody></table></div>'}
function renderAdmin(){refreshCurrentUserDisplay();renderMemberGoogleOptions();applyAccessUI();renderSurveySelect();renderDashboard();renderSurveyPanel();renderMemberPanel();renderSystemMemberPanel();renderDatePanel();renderRestPanel();renderResults();renderCostEstimatePanel();renderFinalPanel();renderManagerPanel();applyAccessUI()}
function renderSurveySelect(){activeSurveySelect.innerHTML='<option value="">請選擇活動</option>'+D.surveys.map(s=>`<option value="${s.id}" ${s.id===activeSurveyId?'selected':''}>${esc(s.title||s.id)}</option>`).join('')}
async function setActiveSurvey(id){if(!isSystemAdmin&&!D.surveys.some(s=>s.id===id))return alert('此帳號沒有該活動權限');if(!confirmLeaveSurveyForm())return;surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;cancelDateEdit(false);cancelRestaurantEdit(false);activeSurveyId=id||null;await loadSurveyData();if(!canManage()){let activePanel=document.querySelector('.panel.active')?.id;if(['surveyP','memP','dateP','restP','costP','finalP'].includes(activePanel))panel('dash',document.querySelector('.nav[onclick*=dash]'))}history.replaceState(null,'',adminHash());renderFront();renderAdmin();toast('已切換目前活動')}
function renderDashboard(){let s=activeSurvey();let ms=targetMembers(),allowed=new Set(ms.map(m=>m.id)),visibleResponses=D.responses.filter(r=>allowed.has(r.memberId));let filled=visibleResponses.length,total=ms.length,rate=total?Math.round(filled/total*100):0;sFilled.textContent=filled;sTotal.textContent=total;sRate.textContent=rate+'%';bar.style.width=Math.min(rate,100)+'%';sNo.textContent=visibleResponses.filter(x=>x.cannotAttend).length;activeSurveyInfo.innerHTML=s?`<b>${esc(s.title)}</b><br>狀態：${esc(statusLabel(s.status))}<br>截止時間：${esc(s.deadline?formatDeadline(s.deadline):'未設定')}<br>參與部門：${esc((s.targetDepartments||[]).join('、')||'全部')}`:'尚未建立活動'}
function renderSurveyPanel(){
  const editing=surveyFormMode==='edit'?D.surveys.find(x=>x.id===editingSurveyId):null;
  const formKey=surveyFormMode+':'+(editingSurveyId||'new');
  surveyEditor.style.display=surveyFormMode==='view'?'none':'block';
  if(surveyFormMode!=='view'){
    const isEdit=surveyFormMode==='edit';
    surveyFormHeading.textContent=isEdit?'編輯活動：'+(editing?.title||'未命名活動'):'新增活動';
    surveyEditorContext.textContent=isEdit?'正在修改既有活動；不會變更「目前使用中」的活動。':'將建立一筆新活動；建立後可再另外設為目前活動。';
    surveyModeBadge.textContent=isEdit?'編輯模式':'新增模式';surveyModeBadge.className='modeBadge '+(isEdit?'edit':'new');
    surveySaveBtn.textContent=isEdit?'儲存變更':'建立活動';
    if(!surveyFormDirty||surveyEditor.dataset.formKey!==formKey){
      targetDeptBox.innerHTML=D.departments.map(d=>`<label class="checkline" style="display:inline-flex;margin:4px 6px 4px 0"><input type="checkbox" class="targetDept" value="${escAttr(d.name)}"><span>${esc(d.name)}</span></label>`).join('')||'<span class="muted">尚未建立部門資料</span>';
      svTitle.value=editing?.title||'';setRichDescription(editing);svInstructions.value=editing?.frontInstructions||'';let deadlineParts=splitDeadline(editing?.deadline);svDeadline.value=deadlineParts.date;svDeadlineTime.value=deadlineParts.time;svStatus.value=editing?.status||'open';svAllowEdit.value=String(editing?.allowEdit!==false);if(themeSelect())themeSelect().value=normalizeTheme(editing?.theme||'classic');renderThemePreview();
      document.querySelectorAll('.targetDept').forEach(x=>x.checked=(editing?.targetDepartments||[]).includes(x.value));
      surveyEditor.dataset.formKey=formKey;surveyFormDirty=false;updateSurveyDirtyState();
    }
  }
  surveyTable.innerHTML=table(['活動','狀態','截止時間','參與部門','操作'],D.surveys.map(s=>{let current=s.id===activeSurveyId;return `<tr><td><b>${esc(s.title||s.id)}</b><span class="surveySubLine">${current?'<span class="currentMark">目前使用中</span>':'<span class="muted">'+esc(s.id)+'</span>'}</span></td><td><span class="badge ${s.status==='open'?'green':'gray'}">${esc(statusLabel(s.status))}</span></td><td>${esc(s.deadline?formatDeadline(s.deadline):'未設定')}</td><td>${esc((s.targetDepartments||[]).join('、')||'全部')}</td><td class="operationCell"><button class="btn" onclick="editSurvey('${s.id}')">編輯</button> ${current?'':`<button class="btn green" onclick="setActiveSurvey('${s.id}')">設為目前</button>`} ${isSystemAdmin?`<button class="btn" onclick="duplicateSurveyPrompt('${s.id}')">複製活動</button> <button class="btn red" onclick="delDoc('surveys','${s.id}')">刪除</button>`:''}</td></tr>`}))
}
function updateSurveyDirtyState(){surveyUnsaved.classList.toggle('show',surveyFormDirty)}
function markSurveyDirty(){if(surveyFormMode!=='view'){surveyFormDirty=true;updateSurveyDirtyState()}}
function confirmLeaveSurveyForm(){return !surveyFormDirty||confirm('活動內容尚未儲存，確定要放棄變更嗎？')}
function startNewSurvey(){if(!isSystemAdmin)return alert('只有系統管理員可以建立活動');if(!confirmLeaveSurveyForm())return;surveyFormMode='new';editingSurveyId=null;surveyFormDirty=false;surveyEditor.dataset.formKey='';renderSurveyPanel();surveyEditor.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>svTitle.focus(),250)}
function editSurvey(id){if(surveyFormMode==='edit'&&editingSurveyId===id)return;if(!confirmLeaveSurveyForm())return;surveyFormMode='edit';editingSurveyId=id;surveyFormDirty=false;surveyEditor.dataset.formKey='';renderSurveyPanel();surveyEditor.scrollIntoView({behavior:'smooth',block:'start'})}
function cancelSurveyEdit(){if(!confirmLeaveSurveyForm())return;surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;updateSurveyDirtyState();renderSurveyPanel()}
async function saveSurvey(){if(surveyFormMode==='view')return;let title=svTitle.value.trim();if(!title){svTitle.focus();return alert('請輸入活動標題')}let isNew=surveyFormMode==='new';let id=isNew?('survey_'+Date.now()):editingSurveyId;if(!id)return alert('找不到要編輯的活動，請回到列表重新選擇');let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value),descriptionData=getRichDescriptionData();let deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';let data={title,...descriptionData,frontInstructions:svInstructions.value.trim(),deadline:deadlineValue,status:svStatus.value,allowEdit:svAllowEdit.value==='true',theme:normalizeTheme(themeSelect()?.value||'classic'),isAnonymous:false,targetDepartments:target,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(isNew)data.createdAt=firebase.firestore.FieldValue.serverTimestamp();surveySaveBtn.disabled=true;surveySaveBtn.textContent='儲存中…';try{await doc('surveys',id).set(data,{merge:true});surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;await loadAll();renderFront();renderAdmin();toast(isNew?'活動已建立，可從列表設為目前活動':'活動變更已儲存')}catch(e){console.error('save survey failed',e);alert('活動儲存失敗，請檢查網路後再試一次')}finally{surveySaveBtn.disabled=false;surveySaveBtn.textContent=surveyFormMode==='edit'?'儲存變更':'建立活動'}}
async function duplicateSurveyPrompt(sourceId){
  if(!isSystemAdmin)return alert('只有系統管理員可以複製活動');
  let source=D.surveys.find(x=>x.id===sourceId);if(!source)return alert('找不到來源活動');
  let title=prompt('請輸入新活動名稱',((source.title||'未命名活動')+' - 複製'));
  if(title===null)return;title=title.trim();if(!title)return alert('請輸入新活動名稱');
  let copyAccess=confirm('是否一併複製本活動的權限設定？\n\n確定：複製活動管理者／結果檢視者\n取消：只複製活動內容，不複製權限');
  if(!confirm('確定建立「'+title+'」？\n\n會複製活動設定、日期、餐廳、費用與人員資格；不會複製填答結果、最終決議與操作紀錄。'))return;
  await duplicateSurvey(sourceId,title,copyAccess);
}
function cloneForNewSurvey(data,newSurveyId){
  let copy={...data};
  delete copy.id;delete copy.createdAt;delete copy.updatedAt;
  copy.surveyId=newSurveyId;
  copy.updatedAt=firebase.firestore.FieldValue.serverTimestamp();
  return copy;
}
async function duplicateSurvey(sourceId,newTitle,copyAccess=false){
  let source=D.surveys.find(x=>x.id===sourceId);if(!source)return;
  let newId='survey_'+Date.now();
  let surveyCopy={...source,title:newTitle,status:'draft',updatedAt:firebase.firestore.FieldValue.serverTimestamp(),createdAt:firebase.firestore.FieldValue.serverTimestamp()};
  delete surveyCopy.id;
  let [dates,rests,budgets,managers]=await Promise.all([
    safeGetQuery(col('surveyDates').where('surveyId','==',sourceId),'surveyDates'),
    safeGetQuery(col('restaurants').where('surveyId','==',sourceId),'restaurants'),
    safeGetQuery(col('budgetEligibility').where('surveyId','==',sourceId),'budgetEligibility'),
    copyAccess?safeGetQuery(col('surveyManagers').where('surveyId','==',sourceId),'surveyManagers'):Promise.resolve([])
  ]);
  try{
    await doc('surveys',newId).set(surveyCopy);
    let tasks=[];
    dates.forEach(x=>tasks.push(doc('surveyDates',newId+'__'+x.id).set(cloneForNewSurvey(x,newId))));
    rests.forEach(x=>tasks.push(doc('restaurants',newId+'__'+x.id).set(cloneForNewSurvey(x,newId))));
    budgets.forEach(x=>tasks.push(doc('budgetEligibility',newId+'__'+x.memberId).set(cloneForNewSurvey(x,newId))));
    managers.filter(x=>x.enabled!==false&&x.email).forEach(x=>{let data={...x,surveyId:newId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};delete data.id;tasks.push(doc('surveyManagers',managerDocId(newId,x.email)).set(data,{merge:true}))});
    await Promise.all(tasks);
    activeSurveyId=newId;surveyFormMode='edit';editingSurveyId=newId;surveyFormDirty=false;
    await loadAll();await loadSurveyData();history.replaceState(null,'',adminHash());renderFront();renderAdmin();
    if(typeof writeAuditV711==='function')await writeAuditV711('建立','活動',newId,'由「'+(source.title||sourceId)+'」複製建立「'+newTitle+'」',newId);
    toast('活動副本已建立，請確認開放與截止時間');
  }catch(e){
    console.error('duplicate survey failed',e);
    alert('複製活動失敗，請檢查網路或 Firestore 規則後再試一次');
  }
}
function renderMemberPanel(){
  if(budgetPerPerson)budgetPerPerson.value=activityBudgetPerPerson()??'';
  let scoped=scopedMembers(),fillCount=scoped.filter(memberCanFill).length,eligibleCount=scoped.filter(m=>memberCanFill(m)&&memberBudgetEligible(m)).length,notEligibleCount=scoped.filter(m=>memberCanFill(m)&&!memberBudgetEligible(m)).length,closedCount=scoped.filter(m=>!memberCanFill(m)).length;
  let summary=`<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>活動名單</span><strong>${scoped.length}</strong></div><div class="finalAttendanceKpi"><span>開放填寫</span><strong>${fillCount}</strong></div><div class="finalAttendanceKpi"><span>納入預算</span><strong>${eligibleCount}</strong></div><div class="finalAttendanceKpi"><span>關閉填寫</span><strong>${closedCount}</strong></div></div>`;
  let note=`<div class="hintBox"><b>說明：</b>「填寫資格」控制此活動前台是否顯示此人；「預算資格」只在開放填寫時才可納入預算計算。關閉填寫後，系統會自動不列入預算。</div>`;
  memTable.innerHTML=summary+note+table(['部門','姓名','員工編號','填寫資格','預算資格','主檔狀態'],scoped.map(m=>{let active=m.active!==false,canFill=memberCanFill(m),budgetOk=memberBudgetEligible(m);let fillToggle=`<button type="button" class="statusToggle ${canFill?'on':'off'}" aria-pressed="${canFill?'true':'false'}" onclick="toggleMemberFill('${m.id}',${canFill?'false':'true'},this)"><span class="statusPill">${canFill?'✓ 已開放':'✕ 已關閉'}</span><span class="switchKnob" aria-hidden="true"></span></button>`;let budgetToggle=`<button type="button" class="statusToggle budget ${canFill&&budgetOk?'on':'off'}" aria-pressed="${canFill&&budgetOk?'true':'false'}" onclick="toggleMemberBudget('${m.id}',${budgetOk?'false':'true'},this)" ${!canFill?'disabled title="未開放填寫時不列入預算計算"':''}><span class="statusPill">${canFill&&budgetOk?'$ 納入預算':'不納入預算'}</span><span class="switchKnob" aria-hidden="true"></span></button>`;return `<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td><td>${fillToggle}</td><td>${budgetToggle}</td><td><span class="badge ${active?'green':'gray'}">${active?'啟用':'停用'}</span></td></tr>`}));
}
function renderSystemMemberPanel(){
  let sysBox=document.getElementById('sysMemberTable');
  if(!sysBox)return;
  let currentDept=memDept?.value||'';
  if(memDept){memDept.innerHTML='<option value="">請選擇部門</option>'+D.departments.map(d=>{let n=d.name||d.departmentName||d.department||'';return `<option value="${escAttr(n)}">${esc(n)}</option>`}).join('');if(currentDept&&[...memDept.options].some(x=>x.value===currentDept))memDept.value=currentDept;}
  if(memberEditor)memberEditor.style.display=(isSystemAdmin&&memberFormMode!=='view')?'block':'none';
  let total=D.members.length,activeCount=D.members.filter(m=>m.active!==false).length,inactiveCount=total-activeCount;
  let summary=`<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>主檔人數</span><strong>${total}</strong></div><div class="finalAttendanceKpi"><span>啟用</span><strong>${activeCount}</strong></div><div class="finalAttendanceKpi"><span>停用</span><strong>${inactiveCount}</strong></div><div class="finalAttendanceKpi"><span>部門數</span><strong>${new Set(D.members.map(m=>m.department||m.departmentName||'')).size}</strong></div></div>`;
  sysBox.innerHTML=summary+table(['部門','姓名','員工編號','Google 帳號','狀態','操作'],D.members.map(m=>{let active=m.active!==false;return `<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td><td>${memberGoogleEmail(m)?esc(memberGoogleEmail(m)):'<span class="muted">未設定</span>'}</td><td><span class="badge ${active?'green':'gray'}">${active?'啟用':'停用'}</span></td><td class="operationCell"><button class="btn" onclick="editMember('${m.id}')">修改</button> <button class="btn ${active?'amber':'green'}" onclick="toggleMember('${m.id}',${active?'false':'true'})">${active?'停用':'啟用'}</button> <button class="btn red" onclick="delDoc('members','${m.id}')">刪除</button></td></tr>`}));
}
function fillMemberForm(m){memDept.value=m?.department||m?.departmentName||'';newMem.value=m?.name||'';newEmp.value=m?.employeeNo||m?.empNo||'';if(memGoogle)memGoogle.value=memberGoogleEmail(m);memStatus.value=String(m?.active!==false)}
function startNewMember(){memberFormMode='new';editingMemberId=null;memberFormHeading.textContent='新增人員';memberModeBadge.textContent='新增模式';memberModeBadge.className='modeBadge new';memberSaveBtn.textContent='新增人員';fillMemberForm(null);memberEditor.style.display='block';newMem.focus()}
function editMember(id){let m=D.members.find(x=>x.id===id);if(!m)return alert('找不到這筆人員資料');memberFormMode='edit';editingMemberId=id;memberFormHeading.textContent='修改人員：'+(m.name||'');memberModeBadge.textContent='編輯模式';memberModeBadge.className='modeBadge edit';memberSaveBtn.textContent='儲存變更';fillMemberForm(m);memberEditor.style.display='block';memberEditor.scrollIntoView({behavior:'smooth',block:'start'})}
function cancelMemberEdit(){memberFormMode='view';editingMemberId=null;memberEditor.style.display='none'}
async function saveMember(){
  if(memberFormMode==='view')return;
  let department=memDept.value,name=newMem.value.trim(),employeeNo=newEmp.value.trim(),googleEmail=normalizeEmail(memGoogle?.value||'');
  if(!department||!name||!employeeNo)return alert('請完整填寫部門、姓名與員工編號');
  if(googleEmail&&!/^\S+@\S+\.\S+$/.test(googleEmail))return alert('請輸入有效的 Google 帳號');
  let duplicateGoogle=D.members.find(m=>memberGoogleEmail(m)===googleEmail&&m.id!==editingMemberId);if(googleEmail&&duplicateGoogle)return alert('此 Google 帳號已由 '+(duplicateGoogle.name||'其他人員')+' 使用');
  let duplicate=D.members.find(m=>String(m.employeeNo||m.empNo||'').trim()===employeeNo&&m.id!==editingMemberId);if(duplicate)return alert('員工編號 '+employeeNo+' 已由 '+(duplicate.name||'其他人員')+' 使用');
  let data={department,name,employeeNo,active:memStatus.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  memberSaveBtn.disabled=true;memberSaveBtn.textContent='儲存中…';
  try{let memberId=editingMemberId;if(memberFormMode==='new'){data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('members').add(data);memberId=ref.id}else{await doc('members',memberId).set(data,{merge:true});await doc('members',memberId).set({googleEmail:firebase.firestore.FieldValue.delete(),googleAccount:firebase.firestore.FieldValue.delete(),gmail:firebase.firestore.FieldValue.delete()},{merge:true})}if(googleEmail)await doc('memberAccounts',memberId).set({memberId,email:googleEmail,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});else{let account=await doc('memberAccounts',memberId).get();if(account.exists)await doc('memberAccounts',memberId).delete()}let wasNew=memberFormMode==='new';memberFormMode='view';editingMemberId=null;await loadAll();renderFront();renderAdmin();toast(wasNew?'人員已新增':'人員資料已更新')}catch(e){console.error('save member failed',e);alert('人員資料儲存失敗，請檢查網路或 Firestore 規則後再試一次')}finally{memberSaveBtn.disabled=false;if(memberFormMode!=='view')memberSaveBtn.textContent=memberFormMode==='new'?'新增人員':'儲存變更'}
}
async function toggleMemberBudget(id,budgetEligible,btn){if(!canManage())return alert('此帳號沒有編輯權限');if(!activeSurveyId)return alert('請先選擇活動');let m=D.members.find(x=>x.id===id);if(!m)return;if(!memberCanFill(m)&&budgetEligible)return alert('此人員尚未開放填寫，不能納入預算');if(btn)btn.disabled=true;try{await doc('budgetEligibility',activeSurveyId+'__'+id).set({surveyId:activeSurveyId,memberId:id,budgetEligible,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadAll();renderFront();renderAdmin();toast((m.name||'人員')+'已更新本活動預算資格')}catch(e){console.error('toggleMemberBudget failed',e);alert('預算資格更新失敗，請確認 Firestore 規則已開放 budgetEligibility 寫入權限。')}finally{if(btn)btn.disabled=false}}
async function toggleMemberFill(id,canFill,btn){if(!canManage())return alert('此帳號沒有編輯權限');if(!activeSurveyId)return alert('請先選擇活動');let m=D.members.find(x=>x.id===id);if(!m)return;if(btn)btn.disabled=true;let data={surveyId:activeSurveyId,memberId:id,canFill,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(canFill===false)data.budgetEligible=false;try{await doc('budgetEligibility',activeSurveyId+'__'+id).set(data,{merge:true});await loadAll();renderFront();renderAdmin();toast((m.name||'人員')+(canFill?'已開放填寫':'已關閉填寫'))}catch(e){console.error('toggleMemberFill failed',e);alert('填寫資格更新失敗，請確認 Firestore 規則已開放 budgetEligibility 寫入權限。')}finally{if(btn)btn.disabled=false}}
async function toggleMember(id,active){let m=D.members.find(x=>x.id===id);if(!m)return;if(!active&&!confirm('確定停用 '+(m.name||'這位人員')+'？停用後不會出現在前台名單，但歷史資料會保留。'))return;await doc('members',id).set({active,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadAll();renderFront();renderAdmin();toast(active?'人員已啟用':'人員已停用')}
function chooseMemberImport(){memberImportInput.click()}

function isXlsxReady(){
  return typeof XLSX !== 'undefined' && XLSX && XLSX.utils && typeof XLSX.writeFile === 'function';
}
function requireXlsx(actionText='匯出 Excel'){
  if(isXlsxReady()) return true;
  const msg='Excel 功能尚未載入完成，請重新整理頁面後再試；若仍失敗，請確認網路可連到 cdnjs.cloudflare.com。';
  try{toast(msg)}catch(e){alert(msg)}
  console.error(actionText+' 失敗：XLSX 函式庫未載入。');
  return false;
}

function memberWorkbook(rows,sheetName='人員名單'){let wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows,{header:['部門','姓名','員工編號','Google帳號','狀態']});ws['!cols']=[{wch:16},{wch:14},{wch:14},{wch:28},{wch:10}];XLSX.utils.book_append_sheet(wb,ws,sheetName);return wb}
function downloadMemberTemplate(){if(!requireXlsx('下載標準範本'))return;XLSX.writeFile(memberWorkbook([{'部門':'行政部','姓名':'王小明','員工編號':'7901','Google帳號':'example@gmail.com','狀態':'啟用'}],'匯入範本'),'人員匯入標準範本.xlsx')}
function exportMembers(){if(!requireXlsx('匯出人員名單'))return;let rows=D.members.map(m=>({'部門':m.department||m.departmentName||'','姓名':m.name||'','員工編號':m.employeeNo||m.empNo||'','Google帳號':memberGoogleEmail(m),'狀態':m.active===false?'停用':'啟用'}));XLSX.writeFile(memberWorkbook(rows),'人員名單.xlsx')}
function memberCell(row,names){let keys=Object.keys(row);for(let name of names){let key=keys.find(k=>String(k).replace(/^\uFEFF/,'').trim()===name);if(key!==undefined)return row[key]}return''}
async function importMembers(file){if(!requireXlsx('匯入人員 Excel'))return;
  if(!file)return;
  memberImportResult.className='memberImportResult';memberImportResult.textContent='正在讀取 '+file.name+'…';
  try{
    let workbook=XLSX.read(await file.arrayBuffer(),{type:'array'}),sheet=workbook.Sheets[workbook.SheetNames[0]],rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});
    if(!rows.length)throw new Error('檔案內沒有可匯入的資料');
    let validDepartments=new Set(D.departments.map(d=>String(d.name||d.departmentName||d.department||'').trim()).filter(Boolean));
    let existingByNo=new Map(D.members.map(m=>[String(m.employeeNo||m.empNo||'').trim(),m]).filter(x=>x[0])),seen=new Set(),errors=[],items=[];
    let seenEmails=new Set();rows.forEach((row,index)=>{let line=index+2,department=String(memberCell(row,['部門'])).trim(),name=String(memberCell(row,['姓名'])).trim(),employeeNo=String(memberCell(row,['員工編號','員編'])).trim(),googleEmail=normalizeEmail(memberCell(row,['Google帳號','Google 帳號','Google Email','Email','電子郵件'])),status=String(memberCell(row,['狀態'])).trim();if(!department||!name||!employeeNo){errors.push(`第 ${line} 列：部門、姓名與員工編號為必填`);return}if(!validDepartments.has(department)){errors.push(`第 ${line} 列：找不到部門「${department}」`);return}if(seen.has(employeeNo)){errors.push(`第 ${line} 列：員工編號 ${employeeNo} 在檔案中重複`);return}seen.add(employeeNo);let active=!['停用','否','false','0','no'].includes(status.toLowerCase());if(googleEmail&&!/^\S+@\S+\.\S+$/.test(googleEmail)){errors.push(`第 ${line} 列：Google 帳號格式不正確`);return}if(googleEmail&&seenEmails.has(googleEmail)){errors.push(`第 ${line} 列：Google 帳號 ${googleEmail} 在檔案中重複`);return}if(googleEmail)seenEmails.add(googleEmail);let existing=existingByNo.get(employeeNo)||null,owner=D.members.find(m=>memberGoogleEmail(m)===googleEmail&&m.id!==existing?.id);if(googleEmail&&owner){errors.push(`第 ${line} 列：Google 帳號已由 ${owner.name||'其他人員'} 使用`);return}items.push({existing,googleEmail,data:{department,name,employeeNo,active,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}})});
    let addCount=items.filter(x=>!x.existing).length,updateCount=items.length-addCount,summary=`可匯入 ${items.length} 筆（新增 ${addCount}、更新 ${updateCount}）`+(errors.length?`\n另有 ${errors.length} 筆錯誤將略過：\n${errors.slice(0,8).join('\n')}${errors.length>8?'\n…':''}`:'');
    memberImportResult.textContent=summary;if(!items.length){memberImportResult.className='memberImportResult error';return alert(summary)}if(!confirm(summary+'\n\n確定寫入人員名單嗎？')){memberImportResult.textContent='已取消匯入';return}
    for(let item of items){let memberId;if(item.existing){memberId=item.existing.id;await doc('members',memberId).set(item.data,{merge:true});await doc('members',memberId).set({googleEmail:firebase.firestore.FieldValue.delete(),googleAccount:firebase.firestore.FieldValue.delete(),gmail:firebase.firestore.FieldValue.delete()},{merge:true})}else{item.data.createdAt=firebase.firestore.FieldValue.serverTimestamp();memberId=(await col('members').add(item.data)).id}if(item.googleEmail)await doc('memberAccounts',memberId).set({memberId,email:item.googleEmail,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});else{let account=await doc('memberAccounts',memberId).get();if(account.exists)await doc('memberAccounts',memberId).delete()}}
    memberFormMode='view';editingMemberId=null;await loadAll();renderFront();renderAdmin();memberImportResult.className='memberImportResult success';memberImportResult.textContent=`匯入完成：新增 ${addCount} 筆、更新 ${updateCount} 筆${errors.length?'，略過 '+errors.length+' 筆錯誤':''}`;toast('人員名單匯入完成');
  }catch(e){console.error('member import failed',e);memberImportResult.className='memberImportResult error';memberImportResult.textContent='匯入失敗：'+(e.message||e)}
}
function renderDatePanel(){dateTable.innerHTML=table(['日期','排序','操作'],D.dates.map(d=>`<tr><td>${esc(d.label)}</td><td>${d.sort??''}</td><td class="operationCell"><button class="btn" onclick="editDate('${d.id}')">編輯</button> <button class="btn red" onclick="delDoc('surveyDates','${d.id}')">刪除</button></td></tr>`))}
function editDate(id){let d=D.dates.find(x=>x.id===id);if(!d)return alert('找不到這筆日期資料');editingDateId=id;newDate.value=d.label||'';newDateSort.value=d.sort??'';dateFormHeading.textContent='編輯日期：'+(d.label||'');dateModeBadge.textContent='編輯模式';dateModeBadge.className='modeBadge edit';dateSaveBtn.textContent='儲存變更';dateCancelBtn.hidden=false;newDate.focus()}
function cancelDateEdit(render=true){editingDateId=null;newDate.value='';newDateSort.value='';dateFormHeading.textContent='新增日期';dateModeBadge.textContent='新增模式';dateModeBadge.className='modeBadge new';dateSaveBtn.textContent='新增日期';dateCancelBtn.hidden=true;if(render)renderDatePanel()}
async function saveDate(){if(!activeSurveyId)return alert('請先建立或選擇活動');let label=newDate.value.trim();if(!label){newDate.focus();return alert('請輸入日期顯示文字')}let isEdit=!!editingDateId,data={surveyId:activeSurveyId,label,sort:Number(newDateSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};dateSaveBtn.disabled=true;dateSaveBtn.textContent='儲存中…';try{if(isEdit)await doc('surveyDates',editingDateId).set(data,{merge:true});else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();await col('surveyDates').add(data)}cancelDateEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'日期變更已儲存':'日期已新增')}catch(e){console.error('save date failed',e);alert('日期儲存失敗，請檢查網路後再試一次')}finally{dateSaveBtn.disabled=false;dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期'}}

function moneyValue(value){
  if(value===null||value===undefined||value==='')return null;
  let n=Number(value);
  return Number.isFinite(n)?n:null;
}
function moneyText(value){
  let n=moneyValue(value);
  return n===null?'':new Intl.NumberFormat('zh-TW').format(n);
}
function restaurantDiff(r){
  let b=activityBudgetPerPerson(),p=moneyValue(r?.price);
  return b===null||p===null?null:b-p;
}
function restaurantDiffText(r){let d=restaurantDiff(r);return d===null?'—':(d>0?'＋':'')+new Intl.NumberFormat('zh-TW').format(d)}
function restaurantDiffBadge(r){
  let d=restaurantDiff(r);if(d===null)return '<span class="muted">—</span>';
  let cls=d<0?'over':d===0?'zero':'ok',label=d<0?'超預算':d===0?'剛好':'預算內';
  return `<span class="priceDiffBadge ${cls}">${label} ${esc(restaurantDiffText(r))}</span>`;
}
function updateRestaurantVarianceHint(){
  if(!restVarianceHint)return;
  let p=moneyValue(newPrice?.value),b=activityBudgetPerPerson();
  if(p===null||b===null){restVarianceHint.textContent='餐廳只需填單價；價差會在費用試算依每人預算自動計算。';return}
  let d=b-p;restVarianceHint.textContent=`依目前每人預算 ${moneyText(b)} 元，價差為 ${d>0?'＋':''}${moneyText(d)} 元。`;
}
[newPrice].forEach(input=>input?.addEventListener('input',updateRestaurantVarianceHint));
function renderRestPanel(){restTable.innerHTML=table(['餐廳','地址','Google Map','類型','單價','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td>${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':''}</td><td>${esc(r.description||r.cuisine||'')}</td><td class="alignCenter">${esc(moneyText(r.price)||'—')}</td><td>${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant(\'${r.id}\')">編輯</button> <button class="btn red" onclick="delDoc(\'restaurants\',\'${r.id}\')">刪除</button></td></tr>`))}
function editRestaurant(id){let r=D.restaurants.find(x=>x.id===id);if(!r)return alert('找不到這筆餐廳資料');editingRestaurantId=id;newRest.value=r.name||'';newAddr.value=r.address||'';newMap.value=r.googleMap||r.mapUrl||'';if(newBudget)newBudget.value='';newPrice.value=moneyValue(r.price)??'';newCuisine.value=r.description||r.cuisine||'';newRestSort.value=r.sort??'';updateRestaurantVarianceHint();restFormHeading.textContent='編輯餐廳：'+(r.name||'');restModeBadge.textContent='編輯模式';restModeBadge.className='modeBadge edit';restSaveBtn.textContent='儲存變更';restCancelBtn.hidden=false;newRest.focus()}
function cancelRestaurantEdit(render=true){editingRestaurantId=null;newRest.value='';newAddr.value='';newMap.value='';if(newBudget)newBudget.value='';newPrice.value='';newCuisine.value='';newRestSort.value='';updateRestaurantVarianceHint();restFormHeading.textContent='新增餐廳';restModeBadge.textContent='新增模式';restModeBadge.className='modeBadge new';restSaveBtn.textContent='新增餐廳';restCancelBtn.hidden=true;if(render)renderRestPanel()}
async function saveRestaurant(){if(!activeSurveyId)return alert('請先建立或選擇活動');let name=newRest.value.trim();if(!name){newRest.focus();return alert('請輸入餐廳名稱')}let price=moneyValue(newPrice.value);if(newPrice.value.trim()!==''&&price===null)return alert('單價請輸入數字');let isEdit=!!editingRestaurantId,data={surveyId:activeSurveyId,name,address:newAddr.value.trim(),googleMap:newMap.value.trim(),description:newCuisine.value.trim(),price,sort:Number(newRestSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};restSaveBtn.disabled=true;restSaveBtn.textContent='儲存中…';try{if(isEdit)await doc('restaurants',editingRestaurantId).set(data,{merge:true});else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();await col('restaurants').add(data)}cancelRestaurantEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'餐廳變更已儲存':'餐廳已新增')}catch(e){console.error('save restaurant failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}}
function managerDocId(surveyId,email){return surveyId+'__'+String(email||'').trim().toLowerCase()}
function renderManagerPanel(){if(!managerTable)return;renderMemberGoogleOptions();managerTable.innerHTML=table(['使用者','權限','狀態','操作'],D.managers.map(m=>`<tr><td>${managerPersonLabel(m.email)}</td><td>${m.role==='viewer'?'結果檢視者':'活動管理者'}</td><td><span class="badge ${m.enabled!==false?'green':'gray'}">${m.enabled!==false?'啟用':'停用'}</span></td><td><button class="btn red" onclick="removeSurveyManager('${escAttr(m.id)}')">移除</button></td></tr>`))}
async function saveSurveyManager(){if(!isSystemAdmin)return alert('只有系統管理員可以指派權限');if(!activeSurveyId)return alert('請先選擇活動');let email=managerEmail.value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))return alert('請輸入有效的 Google 帳號');let selectedMember=findMemberByGoogleEmail(email);let data={surveyId:activeSurveyId,email,role:managerRole.value==='viewer'?'viewer':'manager',enabled:true,memberId:selectedMember?.id||'',displayName:selectedMember?memberDisplayName(selectedMember):'',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};await doc('surveyManagers',managerDocId(activeSurveyId,email)).set(data,{merge:true});managerEmail.value='';await loadSurveyData();renderAdmin();toast('活動權限已更新')}
async function removeSurveyManager(id){if(!isSystemAdmin)return;if(!confirm('確定移除此活動權限？'))return;await doc('surveyManagers',id).delete();await loadSurveyData();renderAdmin();toast('活動權限已移除')}
function copyAdminLink(){if(!activeSurveyId)return alert('請先選擇活動');let url=location.href.split('#')[0]+adminHash();if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('活動後台網址已複製')).catch(()=>prompt('請複製活動後台網址',url))}else prompt('請複製活動後台網址',url)}
function copyFrontLink(){if(!activeSurveyId)return alert('請先選擇活動');let url=frontUrl(false);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('活動前台網址已複製')).catch(()=>prompt('請複製活動前台網址',url))}else prompt('請複製活動前台網址',url)}
function preferredDateOf(r){return r.preferredDateId||r.primaryDateId||(Array.isArray(r.dateIds)?r.dateIds[0]:'')||''}
function alternateDateOf(r){return r.alternateDateId||r.secondaryDateId||(Array.isArray(r.dateIds)?r.dateIds[1]:'')||''}
function responseDateIds(r){return [...new Set([preferredDateOf(r),alternateDateOf(r),...(Array.isArray(r.dateIds)?r.dateIds:[])].filter(Boolean))]}

function memberSettingOverride(m){return m?D.budgetEligibility.find(x=>x.memberId===m.id):null}
function baseMemberCanFill(m){return !m || m.canFill!==false}
function memberCanFill(m){if(!m)return true;let override=memberSettingOverride(m);return override&&override.canFill!==undefined?override.canFill!==false:baseMemberCanFill(m)}
function baseMemberBudgetEligible(m){return true}
function memberBudgetEligible(m){if(!m)return true;if(!memberCanFill(m))return false;let override=memberSettingOverride(m);return override&&override.budgetEligible!==undefined?override.budgetEligible!==false:true}
function memberById(id){return D.members.find(m=>m.id===id)||null}
function responseBudgetEligible(r){return memberBudgetEligible(memberById(r?.memberId))}
function budgetEligibleAttendeesForDate(dateId){return attendeeResponsesForDate(dateId).filter(responseBudgetEligible)}
function attendeeResponsesForDate(dateId){if(!dateId)return[];let allowed=new Set(targetMembers().map(m=>m.id)),order=new Map(D.members.map((m,i)=>[m.id,i]));return D.responses.filter(r=>allowed.has(r.memberId)&&!r.cannotAttend&&responseDateIds(r).includes(dateId)).sort((a,b)=>(order.get(a.memberId)??99999)-(order.get(b.memberId)??99999)||String(a.employeeNo||'').localeCompare(String(b.employeeNo||''),'zh-Hant',{numeric:true}))}
function unavailableResponsesForDate(dateId){if(!dateId)return[];let allowed=new Set(targetMembers().map(m=>m.id)),attending=new Set(attendeeResponsesForDate(dateId).map(r=>r.memberId));return D.responses.filter(r=>allowed.has(r.memberId)&&!attending.has(r.memberId)).sort((a,b)=>String(a.departmentName||'').localeCompare(String(b.departmentName||''),'zh-Hant')||String(a.employeeNo||'').localeCompare(String(b.employeeNo||''),'zh-Hant',{numeric:true}))}
function missingMembers(){return targetMembers().filter(m=>!D.responses.some(r=>r.memberId===m.id))}
function chooseFinalDate(dateId){if(!canManage())return alert('此帳號只有檢視權限');panel('finalP',document.querySelector('[onclick*="finalP"]'));finalDate.value=dateId;renderFinalAttendancePreview();toast('已帶入最終日期，確認餐廳後請記得儲存')}
function responseTimeValue(r){if(r?.submittedAt?.toMillis)return r.submittedAt.toMillis();if(Number.isFinite(r?.submittedAt?.seconds))return r.submittedAt.seconds*1000;let parsed=Date.parse(r?.submittedAtText||'');return Number.isFinite(parsed)?parsed:0}
function toggleResponseDetail(id,button){let detail=[...document.querySelectorAll('.responseDetailRow')].find(row=>row.dataset.detailFor===id);if(!detail)return;let willOpen=detail.hidden;detail.hidden=!willOpen;button?.setAttribute('aria-expanded',String(willOpen));button?.classList.toggle('open',willOpen)}
function renderResults(){
  let ms=targetMembers(),allowed=new Set(ms.map(m=>m.id)),visibleResponses=D.responses.filter(r=>allowed.has(r.memberId));
  let missing=ms.filter(m=>!visibleResponses.some(r=>r.memberId===m.id));
  let filled=visibleResponses.length,total=ms.length,rate=total?Math.round(filled/total*100):0,noCount=visibleResponses.filter(x=>x.cannotAttend).length;
  let dateStats=D.dates.map(d=>({id:d.id,label:d.label,count:attendeeResponsesForDate(d.id).length,people:attendeeResponsesForDate(d.id)}));
  let maxDate=Math.max(1,...dateStats.map(x=>x.count));
  let bestDate=[...dateStats].sort((a,b)=>b.count-a.count)[0]||null;
  let rankCount=rankLimit();
  let restStats=D.restaurants.map(r=>{let score=0,counts=Array(rankCount).fill(0);visibleResponses.forEach(x=>{if(x.cannotAttend)return;let rr=x.restaurantRanks||[];for(let i=0;i<rankCount;i++){if(rr[i]===r.id){score+=rankCount-i;counts[i]++}}});return{id:r.id,name:r.name,score,counts}}).sort((x,y)=>y.score-x.score||String(x.name).localeCompare(String(y.name),'zh-Hant'));
  let bestRest=restStats[0]||null;
  let deptNames=[...new Set(ms.map(m=>m.department||m.departmentName||'').filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'zh-Hant'));
  let memberOrder=new Map(D.members.map((m,i)=>[m.id,i]));
  let responseRows=visibleResponses.map(r=>{
    let search=((r.departmentName||'')+' '+(r.memberName||'')+' '+(r.employeeNo||'')).toLowerCase();
    let rankIds=(r.restaurantRanks||[]).slice(0,rankCount).filter(Boolean),rankNames=rankIds.map(id=>D.restaurants.find(x=>x.id===id)?.name||id);
    let restaurantSummary=r.cannotAttend?'<span class="muted nowrap">不列入排名</span>':rankNames.length?`<span class="rankTag rankSummary"><b>1</b>${esc(rankNames[0])}</span>${rankNames.length>1?`<span class="rankMore">+${rankNames.length-1}</span>`:''}`:'<span class="muted">未填</span>';
    let fullRanks=rankNames.map((name,i)=>`<span class="rankTag"><b>${i+1}</b>${esc(name)}</span>`).join('');
    let note=String(r.note||'').trim(),hasDetail=rankNames.length>1||!!note;
    let availableDates=responseDateIds(r).map(id=>D.dates.find(d=>d.id===id)?.label||id).join('、');
    let actions=canManage()?`<div class="responseActionButtons"><button class="btn" onclick="editResponse('${escAttr(r.id)}')">編輯</button><button class="btn red" onclick="deleteResponse('${escAttr(r.id)}')">刪除</button></div>`:'<span class="muted nowrap">僅供檢視</span>';
    let toggle=hasDetail?`<button class="responseExpandButton" type="button" aria-label="展開問卷詳細內容" aria-expanded="false" onclick="toggleResponseDetail('${escAttr(r.id)}',this)"><span></span></button>`:'';
    let main=`<tr class="responseRow" data-response-id="${escAttr(r.id)}" data-search="${escAttr(search)}" data-department="${escAttr(r.departmentName||'')}" data-cannot="${r.cannotAttend?'true':'false'}" data-member-order="${memberOrder.get(r.memberId)??999999}" data-submitted="${responseTimeValue(r)}"><td class="responseExpandCell">${toggle}</td><td class="responseTextCell">${esc(r.departmentName)}</td><td class="responseTextCell"><b>${esc(r.memberName)}</b></td><td class="responseCenterCell">${esc(r.employeeNo||'')}</td><td class="responseCenterCell"><span class="yesNoBadge ${r.cannotAttend?'yes':'no'}">${r.cannotAttend?'不克參加':'可參加'}</span></td><td class="responseTextCell responseDates">${esc(availableDates||'—')}</td><td class="responseTextCell"><div class="rankTags rankSummaryTags">${restaurantSummary}</div></td><td class="responseCenterCell"><span class="responseTime">${esc(r.submittedAtText||fmtTs(r.submittedAt))}</span></td><td class="responseCenterCell">${actions}</td></tr>`;
    if(!hasDetail)return main;
    let detail=`<tr class="responseDetailRow" data-detail-for="${escAttr(r.id)}" hidden><td></td><td colspan="8"><div class="responseDetailPanel">${rankNames.length>1?`<div><span class="responseDetailLabel">完整餐廳選擇順序</span><div class="rankTags">${fullRanks}</div></div>`:''}${note?`<div><span class="responseDetailLabel">備註</span><p>${esc(note)}</p></div>`:''}</div></td></tr>`;
    return main+detail;
  });
  resultTables.innerHTML=
    `<div class="resultSummary">
      <div class="resultKpi"><span>填寫進度</span><strong>${filled} / ${total}</strong><small>已填／應填人數</small></div>
      <div class="resultKpi"><span>完成率</span><strong>${rate}%</strong><small>${missing.length?('尚有 '+missing.length+' 人未填'):'已全部完成'}</small></div>
      <div class="resultKpi"><span>不克參加</span><strong>${noCount}</strong><small>目前回覆人數</small></div>
      <div class="resultKpi text"><span>最多人可參加</span><strong>${esc(bestDate?.label||'尚無資料')}</strong><small>${bestDate?bestDate.count+' 人':''}</small></div>
      <div class="resultKpi text"><span>餐廳第一名</span><strong>${esc(bestRest?.name||'尚無資料')}</strong><small>${bestRest?bestRest.score+' 分':''}</small></div>
    </div>
    <section class="resultBlock">
      <div class="resultBlockHead"><h3>未填名單</h3><span class="countBadge ${missing.length?'warn':''}">${missing.length} 人</span></div>
      ${table(['部門','姓名','員編'],missing.map(m=>`<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td></tr>`))}
    </section>
    <div class="resultGrid">
      <section class="resultSection"><h3>日期統計與可出席名單</h3><div class="dateDecisionList">${dateStats.map(x=>`<div class="dateDecisionItem"><div class="dateDecisionMain"><span><b>${esc(x.label)}</b></span><div class="statTrack"><i style="width:${Math.round(x.count/maxDate*100)}%"></i></div><strong>${x.count}</strong>${canManage()?`<button class="btn" onclick="chooseFinalDate('${escAttr(x.id)}')">設為最終日期</button>`:''}</div><details><summary>查看當天可出席的 ${x.count} 人</summary><div class="datePeopleChips">${x.people.map(r=>`<span class="datePersonChip">${esc(r.departmentName||'')}・${esc(r.memberName||'')}</span>`).join('')||'<span class="muted">目前無人選擇此日期</span>'}</div></details></div>`).join('')||'<div class="muted">尚無日期資料</div>'}</div></section>
      <section class="resultSection"><h3>餐廳排名</h3><div class="restaurantRanking">${restStats.map((x,i)=>`<div class="rankResult"><span class="rankIndex">${i+1}</span><div><h4>${esc(x.name)}</h4><p>${x.counts.map((count,rankIndex)=>`${rankLabel(rankIndex)}選擇 ${count}`).join('・')||'尚無選擇資料'}</p></div><div class="rankScore"><strong>${x.score}</strong><small>加權分數</small></div></div>`).join('')||'<div class="muted">尚無餐廳資料</div>'}</div></section>
    </div>
    <details class="resultDetails" open>
      <summary><span class="resultDetailsTitle"><span>填寫明細</span><span class="countBadge"><b id="responseVisibleCount">${visibleResponses.length}</b> / ${visibleResponses.length} 筆</span></span></summary>
      <div class="resultDetailsBody">
        <div class="resultTools">
          <input id="responseSearch" type="search" placeholder="搜尋姓名、部門或員編" oninput="filterResponseRows()">
          <select id="responseDeptFilter" onchange="filterResponseRows()"><option value="">全部部門</option>${deptNames.map(n=>`<option value="${escAttr(n)}">${esc(n)}</option>`).join('')}</select>
          <select id="responseSort" aria-label="填寫明細排序" onchange="filterResponseRows()"><option value="member">部門／員編排序</option><option value="latest">最新送出優先</option><option value="earliest">最早送出優先</option></select>
          <label><input id="responseCannotOnly" type="checkbox" onchange="filterResponseRows()">只看不克參加</label>
          <button class="btn green" onclick="exportExcel()">Excel 匯出</button>
        </div>
        <div class="table responseTable"><table><thead><tr><th class="responseExpandHead"></th><th class="alignLeft">部門</th><th class="alignLeft">姓名</th><th class="alignCenter">員編</th><th class="alignCenter">出席狀態</th><th class="alignLeft">可參加日期</th><th class="alignLeft">餐廳摘要</th><th class="alignCenter">送出時間</th><th class="alignCenter">操作</th></tr></thead><tbody>${responseRows.join('')||'<tr><td colspan="9" class="muted">尚無資料</td></tr>'}</tbody></table></div>
      </div>
    </details>`;
  filterResponseRows();
}
function filterResponseRows(){
  let q=(document.getElementById('responseSearch')?.value||'').trim().toLowerCase();
  let dep=document.getElementById('responseDeptFilter')?.value||'';
  let onlyCannot=!!document.getElementById('responseCannotOnly')?.checked;
  let sortMode=document.getElementById('responseSort')?.value||'member',rows=[...document.querySelectorAll('.responseRow')];rows.sort((a,b)=>{let memberDiff=Number(a.dataset.memberOrder)-Number(b.dataset.memberOrder);if(sortMode==='latest')return Number(b.dataset.submitted)-Number(a.dataset.submitted)||memberDiff;if(sortMode==='earliest')return Number(a.dataset.submitted)-Number(b.dataset.submitted)||memberDiff;return memberDiff});if(rows[0]?.parentElement){let body=rows[0].parentElement,details=new Map([...document.querySelectorAll('.responseDetailRow')].map(row=>[row.dataset.detailFor,row]));rows.forEach(row=>{body.appendChild(row);let detail=details.get(row.dataset.responseId);if(detail)body.appendChild(detail)})}
  let visible=0;
  document.querySelectorAll('.responseRow').forEach(row=>{let show=(!q||(row.dataset.search||'').includes(q))&&(!dep||row.dataset.department===dep)&&(!onlyCannot||row.dataset.cannot==='true');row.hidden=!show;let detail=[...document.querySelectorAll('.responseDetailRow')].find(item=>item.dataset.detailFor===row.dataset.responseId);if(!show&&detail){detail.hidden=true;row.querySelector('.responseExpandButton')?.classList.remove('open');row.querySelector('.responseExpandButton')?.setAttribute('aria-expanded','false')}if(show)visible++});
  let counter=document.getElementById('responseVisibleCount');if(counter)counter.textContent=visible;
}
function editResponse(id){
  if(!canManage())return alert('此帳號只有檢視權限，無法修改問卷');
  let r=D.responses.find(x=>x.id===id);if(!r)return alert('找不到這筆填寫資料，請重新整理後再試一次');
  editingResponseId=id;
  responseEditIdentity.textContent=(r.departmentName||'')+'｜'+(r.memberName||'')+(r.employeeNo?'｜員編 '+r.employeeNo:'');
  let selectedDates=new Set(responseDateIds(r));
  responseEditDates.innerHTML=D.dates.map(d=>`<label class="dateAvailabilityChoice"><input type="checkbox" class="responseEditDateOpt" value="${escAttr(d.id)}" ${selectedDates.has(d.id)?'checked':''}><span>${esc(d.label)}</span></label>`).join('')||'<span class="muted">尚未設定日期</span>';
  let restOptions='<option value="">不指定</option>'+D.restaurants.map(x=>`<option value="${escAttr(x.id)}">${esc(x.name)}</option>`).join('');
  responseEditRanks.innerHTML=Array.from({length:rankLimit()},(_,i)=>`<label class="responseEditRank"><span>${rankLabel(i)}選擇${i===0?'<span class="required">*</span>':'（選填）'}</span><select class="responseEditRankSelect" onchange="syncResponseEditorRestaurants()">${restOptions}</select></label>`).join('')||'<span class="muted">尚未設定餐廳</span>';
  [...responseEditRanks.querySelectorAll('.responseEditRankSelect')].forEach((select,i)=>select.value=(r.restaurantRanks||[])[i]||'');
  responseEditCannot.checked=!!r.cannotAttend;responseEditNote.value=r.note||'';responseEditStatus.textContent='';responseEditStatus.classList.remove('error');
  updateResponseEditorAvailability();syncResponseEditorRestaurants();responseEditMask.style.display='flex';
}
function closeResponseEditor(){editingResponseId=null;responseEditMask.style.display='none';responseEditStatus.textContent='';responseEditStatus.classList.remove('error')}
function updateResponseEditorAvailability(){
  let disabled=!!responseEditCannot.checked;
  responseEditDates.querySelectorAll('.responseEditDateOpt').forEach(input=>{if(disabled)input.checked=false;input.disabled=disabled});
  if(disabled)responseEditRanks.querySelectorAll('.responseEditRankSelect').forEach(select=>select.value='');
  syncResponseEditorRestaurants();
}
function syncResponseEditorRestaurants(){let selects=[...responseEditRanks.querySelectorAll('.responseEditRankSelect')],formDisabled=!!responseEditCannot.checked;selects.forEach((select,index)=>{let sequenceDisabled=formDisabled||(index>0&&!selects[index-1].value);if(sequenceDisabled&&index>0)select.value='';select.disabled=sequenceDisabled});let chosen=selects.map(x=>x.value).filter(Boolean);selects.forEach(select=>[...select.options].forEach(option=>{option.disabled=!!option.value&&option.value!==select.value&&chosen.includes(option.value)}))}
async function saveResponseEdit(){
  if(!canManage())return alert('此帳號只有檢視權限');
  let r=D.responses.find(x=>x.id===editingResponseId);if(!r)return alert('找不到要修改的填寫資料');
  let no=responseEditCannot.checked,dateIds=[...responseEditDates.querySelectorAll('.responseEditDateOpt:checked')].map(x=>x.value);
  if(!no&&!dateIds.length)return alert('請至少勾選一個可以出席的日期，或勾選不克參加');
  let ranks=[...responseEditRanks.querySelectorAll('.responseEditRankSelect')].map(x=>x.value),picked=ranks.filter(Boolean);
  if(!no&&D.restaurants.length&&!ranks[0])return alert('請至少選擇一間餐廳，第一選擇為必填');
  if(ranks.some((value,index)=>value&&ranks.slice(0,index).some(previous=>!previous)))return alert('請依序填寫餐廳選擇，不要跳過前一個選擇');
  if(new Set(picked).size!==picked.length)return alert('餐廳選擇不可重複');
  let data={preferredDateId:'',alternateDateId:'',dateIds:no?[]:dateIds,cannotAttend:no,restaurantRanks:no?[]:ranks,note:responseEditNote.value.trim(),adminEditedAt:firebase.firestore.FieldValue.serverTimestamp(),adminEditedBy:currentUser?.email||''};
  responseEditSaveBtn.disabled=true;responseEditSaveBtn.textContent='儲存中…';responseEditStatus.textContent='正在更新問卷內容…';
  try{await doc('responses',r.id).set(data,{merge:true});closeResponseEditor();await loadSurveyData();renderAdmin();toast('同仁問卷已更新，統計結果已重新計算')}catch(e){console.error('response edit failed',e);responseEditStatus.textContent='儲存失敗，請確認 Firestore 規則已更新後再試一次。';responseEditStatus.classList.add('error')}finally{responseEditSaveBtn.disabled=false;responseEditSaveBtn.textContent='儲存修改'}
}
async function deleteResponse(id){
  if(!canManage())return alert('此帳號只有檢視權限，無法刪除問卷');
  let r=D.responses.find(x=>x.id===id);if(!r)return alert('找不到這筆填寫資料，請重新整理後再試一次');
  let surveyName=activeSurvey()?.title||activeSurveyId||'目前活動',identity=(r.departmentName||'')+' '+(r.memberName||'')+(r.employeeNo?'（員編 '+r.employeeNo+'）':'');
  if(!confirm(`準備刪除以下整筆問卷：\n\n活動：${surveyName}\n填寫人：${identity}\n\n刪除後此人會恢復為未填，可自行重新填寫。`))return;
  if(!confirm(`再次確認：確定永久刪除「${r.memberName||'此同仁'}」的整筆問卷嗎？\n此操作無法復原。`))return;
  try{await doc('responses',id).delete();await loadSurveyData();renderAdmin();toast('問卷已刪除，該同仁現在可以重新填寫')}catch(e){console.error('response delete failed',e);alert('刪除失敗，請確認 Firestore 規則已更新後再試一次')}
}
responseEditMask?.addEventListener('click',e=>{if(e.target===responseEditMask)closeResponseEditor()});

function buildCostEstimateHtml(dateId,restaurantId,contextTitle='費用試算'){
  let date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===restaurantId);
  if(!dateId&&!restaurantId)return '<div class="finalEmpty">請選擇日期與餐廳後，系統會依該日期可出席人數進行試算。</div>';
  if(!dateId)return '<div class="finalEmpty">請先選擇試算日期。</div>';
  if(!restaurantId)return '<div class="finalEmpty">請先選擇試算餐廳。</div>';
  if(!date||!rest)return '<div class="finalEmpty">找不到日期或餐廳資料，請重新選擇。</div>';
  let attending=attendeeResponsesForDate(dateId),budgetAttending=budgetEligibleAttendeesForDate(dateId),budget=activityBudgetPerPerson(),price=moneyValue(rest.price),diff=restaurantDiff(rest),budgetTotal=budget===null?null:budget*budgetAttending.length,priceTotal=price===null?null:price*attending.length,totalDiff=budgetTotal===null||priceTotal===null?null:budgetTotal-priceTotal,nonBudgetCount=attending.length-budgetAttending.length;
  return `<section class="finalGroup finalCostBox costEstimateBox"><div class="finalGroupHead"><h4>${esc(contextTitle)}</h4><span class="countBadge">${attending.length} 人可出席</span></div><div class="costEstimateTitle"><b>${esc(date.label||'')}</b><span>×</span><b>${esc(rest.name||'')}</b></div><div class="finalCostGrid"><div><span>可出席人數</span><strong>${attending.length} 人</strong></div><div><span>預算人數</span><strong>${budgetAttending.length} 人${nonBudgetCount>0?'（'+nonBudgetCount+' 人不納入預算）':''}</strong></div><div><span>每人預算</span><strong>${budget===null?'—':esc(moneyText(budget))+' 元'}</strong></div><div><span>餐廳單價</span><strong>${price===null?'—':esc(moneyText(price))+' 元'}</strong></div><div><span>每人差異</span><strong class="${diff<0?'costOver':'costOk'}">${diff===null?'—':esc(unitBudgetStatusText(diff))}</strong></div><div><span>預算總額</span><strong>${budgetTotal===null?'—':esc(moneyText(budgetTotal))+' 元'}</strong></div><div><span>餐費總額</span><strong>${priceTotal===null?'—':esc(moneyText(priceTotal))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">預算總額以「納入預算」人數計算；餐費總額以實際可出席人數計算。</p></section>`;
}
function renderCostEstimatePanel(){let dateSelect=document.getElementById('costDate'),restSelect=document.getElementById('costRest');if(!dateSelect||!restSelect)return;let currentDate=dateSelect.value,currentRest=restSelect.value;dateSelect.innerHTML='<option value="">請選擇日期</option>'+D.dates.map(d=>`<option value="${escAttr(d.id)}">${esc(d.label)}（${attendeeResponsesForDate(d.id).length} 人）</option>`).join('');restSelect.innerHTML='<option value="">請選擇餐廳</option>'+D.restaurants.map(r=>`<option value="${escAttr(r.id)}">${esc(r.name)}</option>`).join('');dateSelect.value=D.dates.some(d=>d.id===currentDate)?currentDate:'';restSelect.value=D.restaurants.some(r=>r.id===currentRest)?currentRest:'';renderCostEstimate()}
function renderCostEstimate(){let box=document.getElementById('costEstimatePreview'),dateSelect=document.getElementById('costDate'),restSelect=document.getElementById('costRest');if(!box||!dateSelect||!restSelect)return;let dateId=dateSelect.value,restId=restSelect.value;let matrix='';if(D.dates.length&&D.restaurants.length){matrix=`<section class="finalGroup costMatrix"><div class="finalGroupHead"><h4>快速比較</h4><span class="muted">顯示各日期 × 餐廳的總額差異</span></div>${table(['日期','可出席人數','預算人數',...D.restaurants.map(r=>esc(r.name))],D.dates.map(d=>{let count=attendeeResponsesForDate(d.id).length,budgetCount=budgetEligibleAttendeesForDate(d.id).length;return `<tr><td><b>${esc(d.label)}</b></td><td class="alignCenter">${count}</td><td class="alignCenter">${budgetCount}</td>${D.restaurants.map(r=>{let budget=activityBudgetPerPerson(),price=moneyValue(r.price),value=budget===null||price===null?null:(budget*budgetCount)-(price*count),cls=value<0?'costOver':'costOk';return `<td class="alignCenter"><button class="costPickBtn ${value<0?'over':'ok'}" onclick="pickCostEstimate('${escAttr(d.id)}','${escAttr(r.id)}')"><span class="${cls}">${value===null?'—':esc(budgetStatusText(value))}</span></button></td>`}).join('')}</tr>`}))}</section>`}
  box.innerHTML=buildCostEstimateHtml(dateId,restId,'試算結果')+matrix;
}
function pickCostEstimate(dateId,restaurantId){let dateSelect=document.getElementById('costDate'),restSelect=document.getElementById('costRest');if(dateSelect)dateSelect.value=dateId;if(restSelect)restSelect.value=restaurantId;renderCostEstimate()}

function renderFinalPanel(){finalDate.innerHTML='<option value="">請選擇</option>'+D.dates.map(d=>`<option value="${d.id}">${esc(d.label)}</option>`).join('');finalRest.innerHTML='<option value="">請選擇</option>'+D.restaurants.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');let f=D.final||{};finalDate.value=f.finalDateId||'';finalRest.value=f.finalRestaurantId||'';finalNote.value=f.note||'';finalLock.value=String(!!f.locked);renderFinalAttendancePreview()}

function budgetStatusText(value){
  if(value===null||Number.isNaN(Number(value)))return '—';
  let n=Number(value),abs=moneyText(Math.abs(n));
  if(n<0)return '超出預算 '+abs+' 元';
  if(n>0)return '剩餘預算 '+abs+' 元';
  return '剛好符合預算 0 元';
}
function unitBudgetStatusText(value){
  if(value===null||Number.isNaN(Number(value)))return '—';
  let n=Number(value),abs=moneyText(Math.abs(n));
  if(n<0)return '每人超出 '+abs+' 元';
  if(n>0)return '每人剩餘 '+abs+' 元';
  return '每人剛好 0 元';
}

function renderFinalAttendancePreview(){let box=document.getElementById('finalAttendancePreview');if(!box)return;let dateId=finalDate.value;if(!dateId){box.innerHTML='<div class="finalEmpty">請先選擇最終日期，系統將自動整理當天出席名單。</div>';return}let date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===finalRest.value),attending=attendeeResponsesForDate(dateId),budgetAttending=budgetEligibleAttendeesForDate(dateId),unavailable=unavailableResponsesForDate(dateId),missing=missingMembers(),budget=activityBudgetPerPerson(),price=moneyValue(rest?.price),diff=restaurantDiff(rest),budgetTotal=budget===null?null:budget*budgetAttending.length,priceTotal=price===null?null:price*attending.length,totalDiff=budgetTotal===null||priceTotal===null?null:budgetTotal-priceTotal,nonBudgetCount=attending.length-budgetAttending.length,financeHtml=rest?`<section class="finalGroup finalCostBox"><div class="finalGroupHead"><h4>餐費試算</h4><span class="countBadge">${attending.length} 人</span></div><div class="finalCostGrid"><div><span>最終餐廳</span><strong>${esc(rest.name||'')}</strong></div><div><span>可出席人數</span><strong>${attending.length} 人</strong></div><div><span>預算人數</span><strong>${budgetAttending.length} 人${nonBudgetCount>0?'（'+nonBudgetCount+' 人不納入預算）':''}</strong></div><div><span>每人預算</span><strong>${budget===null?'—':esc(moneyText(budget))+' 元'}</strong></div><div><span>單價</span><strong>${price===null?'—':esc(moneyText(price))+' 元'}</strong></div><div><span>每人價差</span><strong class="${diff<0?'costOver':'costOk'}">${diff===null?'—':esc(unitBudgetStatusText(diff))}</strong></div><div><span>預算總額</span><strong>${budgetTotal===null?'—':esc(moneyText(budgetTotal))+' 元'}</strong></div><div><span>餐費總額</span><strong>${priceTotal===null?'—':esc(moneyText(priceTotal))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">預算總額以「納入預算」人數計算；餐費總額以實際可出席人數計算。</p></section>`:'<section class="finalGroup finalCostBox"><div class="finalEmpty">選擇最終餐廳後，會依當天可出席人數自動試算預算、單價與小計。</div></section>';box.innerHTML=`${financeHtml}<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>${esc(date?.label||'最終日期')}可出席</span><strong>${attending.length}</strong></div><div class="finalAttendanceKpi"><span>納入預算人數</span><strong>${budgetAttending.length}</strong></div><div class="finalAttendanceKpi"><span>已填但當天無法出席</span><strong>${unavailable.length}</strong></div><div class="finalAttendanceKpi"><span>尚未填寫</span><strong>${missing.length}</strong></div></div><section class="finalGroup"><div class="finalGroupHead"><h4>當天可出席名單</h4><span class="countBadge">${attending.length} 人</span></div>${table(['部門','姓名','員編','預算資格','填寫備註'],attending.map(r=>`<tr><td>${esc(r.departmentName||'')}</td><td><b>${esc(r.memberName||'')}</b></td><td>${esc(r.employeeNo||'')}</td><td><span class="badge ${responseBudgetEligible(r)?'green':'gray'}">${responseBudgetEligible(r)?'納入預算':'不納入預算'}</span></td><td>${esc(r.note||'—')}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>已填但當天無法出席</h4><span class="countBadge warn">${unavailable.length} 人</span></div>${table(['部門','姓名','員編','原因'],unavailable.map(r=>`<tr><td>${esc(r.departmentName||'')}</td><td><b>${esc(r.memberName||'')}</b></td><td>${esc(r.employeeNo||'')}</td><td>${r.cannotAttend?'不克參加':'未選擇此日期'}</td></tr>`))}</section><section class="finalGroup"><div class="finalGroupHead"><h4>尚未填寫</h4><span class="countBadge ${missing.length?'warn':''}">${missing.length} 人</span></div>${table(['部門','姓名','員編'],missing.map(m=>`<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name||'')}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td></tr>`))}</section>`}
async function saveFinal(){if(!activeSurveyId)return alert('請先選擇活動');if(finalLock.value==='true'&&(!finalDate.value||!finalRest.value))return alert('要顯示於前台時，請先選擇最終日期與餐廳');if(finalDate.value){let date=D.dates.find(d=>d.id===finalDate.value),count=attendeeResponsesForDate(finalDate.value).length;if(!confirm(`確認將「${date?.label||'所選日期'}」設為最終日期？\n目前共有 ${count} 人可出席。`))return}await doc('finalDecision',activeSurveyId).set({surveyId:activeSurveyId,finalDateId:finalDate.value,finalRestaurantId:finalRest.value,note:finalNote.value.trim(),locked:finalLock.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadSurveyData();renderFront();renderAdmin();toast('最終決議與出席名單已更新')}
async function delDoc(collection,id){if(collection==='surveyDates'&&D.final?.finalDateId===id)return alert('此日期已被選為最終日期，請先到「最終決議」更換或清除最終日期後再刪除。');if(collection==='restaurants'&&D.final?.finalRestaurantId===id)return alert('此餐廳已被選為最終餐廳，請先到「最終決議」更換或清除後再刪除。');let itemName=collection==='surveys'?'這個活動':'這筆資料';if(!confirm('確定刪除'+itemName+'？此操作無法復原。'))return;await doc(collection,id).delete();if(collection==='members'){let account=await doc('memberAccounts',id).get();if(account.exists)await doc('memberAccounts',id).delete();let settings=await col('budgetEligibility').where('memberId','==',id).get();await Promise.all(settings.docs.map(item=>item.ref.delete()))}if(collection==='surveys'&&editingSurveyId===id){surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false}if(collection==='members'&&editingMemberId===id){memberFormMode='view';editingMemberId=null}await loadAll();renderFront();renderAdmin();toast('已刪除')}

function compareResponseForExcelV750(a,b){
  const safe=v=>String(v??'').trim();
  const deptA=safe(a.departmentName||a.department), deptB=safe(b.departmentName||b.department);
  if(deptA.localeCompare(deptB,'zh-Hant')!==0)return deptA.localeCompare(deptB,'zh-Hant');
  const nameA=safe(a.memberName||a.name), nameB=safe(b.memberName||b.name);
  if(nameA.localeCompare(nameB,'zh-Hant')!==0)return nameA.localeCompare(nameB,'zh-Hant');
  const empA=safe(a.employeeNo||a.empNo), empB=safe(b.employeeNo||b.empNo);
  if(empA.localeCompare(empB,'zh-Hant',{numeric:true})!==0)return empA.localeCompare(empB,'zh-Hant',{numeric:true});
  const timeA=a.submittedAt?.toMillis?.()||new Date(a.submittedAtText||0).getTime()||0;
  const timeB=b.submittedAt?.toMillis?.()||new Date(b.submittedAtText||0).getTime()||0;
  return timeA-timeB;
}

function exportExcel(){
  if(!requireXlsx('Excel 匯出'))return;
  let wb=XLSX.utils.book_new(),rankCount=rankLimit();
  let finalDateId=D.final?.finalDateId||'',finalDateData=D.dates.find(d=>d.id===finalDateId),finalRestData=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId),attending=attendeeResponsesForDate(finalDateId),budgetAttending=budgetEligibleAttendeesForDate(finalDateId),unavailable=unavailableResponsesForDate(finalDateId),finalMissing=missingMembers(),finalBudget=activityBudgetPerPerson(),finalPrice=moneyValue(finalRestData?.price),finalBudgetTotal=finalBudget===null?'':finalBudget*budgetAttending.length,finalPriceTotal=finalPrice===null?'':finalPrice*attending.length,finalDiffTotal=(finalBudget===null||finalPrice===null)?null:finalBudgetTotal-finalPriceTotal,finalRows=[['最終決議與出席名單'],['活動',activeSurvey()?.title||''],['最終日期',finalDateData?.label||'尚未設定'],['最終餐廳',finalRestData?.name||'尚未設定'],['預計出席人數',attending.length],['預算人數',budgetAttending.length],['不納入預算人數',attending.length-budgetAttending.length],['每人預算',moneyText(finalBudget)],['單價',moneyText(finalRestData?.price)],['每人價差',unitBudgetStatusText(restaurantDiff(finalRestData))],['預算總額',moneyText(finalBudgetTotal)],['餐費總額',moneyText(finalPriceTotal)],['總額差異',budgetStatusText(finalDiffTotal)],['決議說明',D.final?.note||''],[],['當天可出席名單'],['部門','姓名','員編','預算資格','填寫備註'],...attending.map(r=>[r.departmentName||'',r.memberName||'',r.employeeNo||'',responseBudgetEligible(r)?'納入預算':'不納入預算',r.note||'']),[],['已填但當天無法出席'],['部門','姓名','員編','原因'],...unavailable.map(r=>[r.departmentName||'',r.memberName||'',r.employeeNo||'',r.cannotAttend?'不克參加':'未選擇此日期']),[],['尚未填寫'],['部門','姓名','員編'],...finalMissing.map(m=>[m.department||m.departmentName||'',m.name||'',m.employeeNo||m.empNo||''])],finalSheet=XLSX.utils.aoa_to_sheet(finalRows);finalSheet['!merges']=[XLSX.utils.decode_range('A1:E1')];finalSheet['!cols']=[{wch:18},{wch:18},{wch:14},{wch:14},{wch:34}];XLSX.utils.book_append_sheet(wb,finalSheet,'最終出席名單');
  let exportAllowed=new Set(targetMembers().map(m=>m.id));
  let exportResponses=D.responses.filter(r=>exportAllowed.has(r.memberId)).slice().sort(compareResponseForExcelV750);
  let detail=exportResponses.map(r=>{let row={'部門':r.departmentName,'姓名':r.memberName,'員編':r.employeeNo||'','預算資格':responseBudgetEligible(r)?'納入預算':'不納入預算','可參加日期':responseDateIds(r).map(id=>D.dates.find(d=>d.id===id)?.label||id).join('、'),'不克參加':r.cannotAttend?'是':'否'};for(let i=0;i<rankCount;i++)row[rankLabel(i)+'選擇']=r.cannotAttend?'':(D.restaurants.find(x=>x.id===(r.restaurantRanks||[])[i])?.name||'');row['備註']=r.note||'';row['送出時間']=r.submittedAtText||fmtTs(r.submittedAt);return row});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(detail),'明細表');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(D.dates.map(d=>{let attending=attendeeResponsesForDate(d.id),unavailable=unavailableResponsesForDate(d.id),missing=missingMembers();return{'日期':d.label,'可參加人數':attending.length,'無法出席人數':unavailable.length,'尚未填答人數':missing.length,'預算人數':budgetEligibleAttendeesForDate(d.id).length,'不納入預算人數':attending.length-budgetEligibleAttendeesForDate(d.id).length,'可參加人員':attending.map(r=>r.memberName).join('、'),'已填但無法出席人員':unavailable.map(r=>r.memberName).join('、'),'尚未填答人員':missing.map(m=>m.name).join('、')}})),'日期統計');
  let restaurantRows=D.restaurants.map(r=>{let row={'餐廳':r.name},score=0,counts=Array(rankCount).fill(0);exportResponses.forEach(x=>{if(x.cannotAttend)return;let rr=x.restaurantRanks||[];for(let i=0;i<rankCount;i++){if(rr[i]===r.id){score+=rankCount-i;counts[i]++}}});row['加權分數']=score;for(let i=0;i<rankCount;i++)row[rankLabel(i)+'選擇']=counts[i];row['每人預算']=moneyText(activityBudgetPerPerson());row['單價']=moneyText(r.price);row['每人差異']=restaurantDiffText(r);row['地址']=r.address||'';row['Google Map']=r.googleMap||r.mapUrl||'';row['類型']=r.description||r.cuisine||'';return row});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(restaurantRows),'餐廳統計');
  let missing=targetMembers().filter(m=>!D.responses.some(r=>r.memberId===m.id)).map(m=>({'部門':m.department||m.departmentName||'','姓名':m.name,'員編':m.employeeNo||m.empNo||''}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(missing),'未填名單');XLSX.writeFile(wb,(activeSurvey()?.title||'活動調查')+'_結果.xlsx')
}
function fmtTs(ts){try{return ts&&ts.toDate?ts.toDate().toLocaleString('zh-TW'):''}catch(e){return''}}
function splitDeadline(value){let m=String(value||'').match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);return m?{date:m[1],time:m[2]||'23:59'}:{date:'',time:'23:59'}}
function deadlineDate(value){let p=splitDeadline(value);if(!p.date)return null;let seconds=String(value||'').includes('T')?'00':'59';let d=new Date(p.date+'T'+p.time+':'+seconds);return Number.isNaN(d.getTime())?null:d}
function isDeadlinePassed(value){let d=deadlineDate(value);return d?d<new Date():false}
function formatDeadline(value){let p=splitDeadline(value);return p.date?formatDate(p.date)+' '+p.time:''}
function formatDate(s){let m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[1]}/${m[2]}/${m[3]}`:String(s||'')}
function statusLabel(status){return({open:'開放中',closed:'已關閉',draft:'草稿'})[status]||status||'未設定'}
function safeUrl(value){let raw=String(value||'').trim();if(!raw||!/^https?:\/\//i.test(raw))return'';try{let u=new URL(raw);return /^https?:$/.test(u.protocol)?u.href:''}catch(e){return''}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escAttr(s){return esc(s)}
function toast(m){
  const el=document.getElementById('toast');
  if(!el){ console.log(m); return; }
  el.textContent=m;
  el.style.display='block';
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>{el.style.display='none'},2400);
}
let adminRefreshPromise=null,lastAdminRefreshAt=0;
function closeTopNavGroups(except=null){document.querySelectorAll('.topNavGroup[open]').forEach(group=>{if(group!==except)group.open=false})}
function makeTopNavGroup(label,buttons){let details=document.createElement('details');details.className='topNavGroup';let summary=document.createElement('summary');let labelText=document.createElement('span');labelText.textContent=label;summary.appendChild(labelText);let chevron=document.createElement('span');chevron.className='topNavChevron';chevron.setAttribute('aria-hidden','true');summary.appendChild(chevron);details.appendChild(summary);let menu=document.createElement('div');menu.className='topNavMenu';buttons.filter(Boolean).forEach(button=>{menu.appendChild(button);button.addEventListener('click',()=>{details.open=false})});details.appendChild(menu);details.addEventListener('toggle',()=>{if(details.open)closeTopNavGroups(details)});return details}
function transformAdminNavigation(){
  let side=document.querySelector('.side');if(!side||side.dataset.topnav==='true')return;side.dataset.topnav='true';side.classList.add('topNav');
  let brand=side.querySelector('.ab'),logo=brand?.querySelector('img'),brandText=brand?.querySelector('div');if(logo){logo.classList.add('topBrandLogo');logo.alt='環興科技股份有限公司'}
  let navs=[...side.querySelectorAll('.nav')],byText=text=>navs.find(n=>n.textContent.trim()===text),dashboard=byText('儀表板'),logoutButton=byText('登出');
  let navArea=document.createElement('nav');navArea.className='topNavLinks';if(dashboard)navArea.appendChild(dashboard);navArea.appendChild(makeTopNavGroup('活動作業',[byText('活動管理'),byText('日期管理'),byText('餐廳管理'),byText('人員設定'),byText('費用試算'),byText('投票結果'),byText('最終決議'),byText('Excel 匯出')]));navArea.appendChild(makeTopNavGroup('系統管理',[byText('人員管理'),byText('權限管理')]));
  let userArea=document.createElement('div');userArea.className='topUserArea';let userIcon=document.createElement('span');userIcon.className='topUserIcon';userIcon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.6-4 3.1-6 7-6s6.4 2 7 6"></path></svg>';let labels=document.createElement('span');labels.className='topUserLabels';labels.appendChild(adminUser);labels.appendChild(adminRole);userArea.appendChild(userIcon);userArea.appendChild(labels);if(logoutButton){logoutButton.classList.add('topLogout');userArea.appendChild(logoutButton)}
  if(brandText)brandText.remove();
  side.appendChild(navArea);side.appendChild(userArea);
  if(!window.__topNavDismiss){window.__topNavDismiss=true;document.addEventListener('click',event=>{if(!event.target.closest('.topNavGroup'))closeTopNavGroups();if(!event.target.closest('.adminMoreMenu')){let more=document.getElementById('adminMoreMenu');if(more)more.open=false}});document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeTopNavGroups();let more=document.getElementById('adminMoreMenu');if(more)more.open=false}})}
  if(!window.__adminVisibilityRefresh){window.__adminVisibilityRefresh=true;document.addEventListener('visibilitychange',()=>{let active=document.querySelector('.panel.active')?.id;if(!document.hidden&&isAdmin&&(active==='respP'||active==='dash')&&Date.now()-lastAdminRefreshAt>15000)refreshAdminData(false)})}
}
async function refreshAdminData(showMessage=true){if(!isAdmin||!ready)return;if(adminRefreshPromise)return adminRefreshPromise;let button=document.getElementById('refreshAdminBtn');if(button){button.disabled=true;button.classList.add('isLoading')}adminRefreshPromise=(async()=>{try{await loadAll();renderFront();renderAdmin();lastAdminRefreshAt=Date.now();if(showMessage)toast('資料已更新')}catch(e){console.error('refresh failed',e);if(showMessage)alert('資料更新失敗，請檢查網路後再試一次')}finally{if(button){button.disabled=false;button.classList.remove('isLoading')}adminRefreshPromise=null}})();return adminRefreshPromise}
function enhanceAdminHeader(){
  transformAdminNavigation();
  document.querySelectorAll('.topNavGroup').forEach(group=>{group.hidden=![...group.querySelectorAll('.nav')].some(item=>!item.hidden)});
  let head=document.querySelector('.main>.head'),title=document.getElementById('adminTitle');if(!head||!title)return;
  head.classList.add('adminPageHead','compactAdminToolbar');let oldTitleGroup=head.querySelector('.headTitleGroup');if(oldTitleGroup){head.insertBefore(title,oldTitleGroup);oldTitleGroup.remove()}
  let actions=head.querySelector('.btns,.headActions');if(actions){actions.className='headActions';let buttons=[...actions.querySelectorAll('button')],frontButton=buttons.find(b=>b.getAttribute('onclick')?.includes('showFront')),copyButton=buttons.find(b=>b.getAttribute('onclick')?.includes('copyAdminLink'));if(frontButton){frontButton.classList.add('frontViewButton');actions.appendChild(frontButton)}if(!document.getElementById('refreshAdminBtn')){let refresh=document.createElement('button');refresh.id='refreshAdminBtn';refresh.className='btn iconOnlyButton';refresh.type='button';refresh.title='重新整理資料';refresh.setAttribute('aria-label','重新整理資料');refresh.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"></path><path d="M19 11a7.5 7.5 0 1 0 .2 3"></path></svg>';refresh.onclick=()=>refreshAdminData(true);actions.appendChild(refresh)}if(copyButton){copyButton.id='copyAdminLinkBtn';copyButton.hidden=!isSystemAdmin;let more=document.getElementById('adminMoreMenu');if(!more){more=document.createElement('details');more.id='adminMoreMenu';more.className='adminMoreMenu';let summary=document.createElement('summary');summary.textContent='•••';summary.title='更多操作';summary.setAttribute('aria-label','更多操作');let menu=document.createElement('div');menu.className='adminMoreMenuPanel';menu.appendChild(copyButton);copyButton.textContent='複製本活動後台網址';copyButton.addEventListener('click',()=>{more.open=false});let frontCopy=document.createElement('button');frontCopy.id='copyFrontLinkBtn';frontCopy.className='btn';frontCopy.type='button';frontCopy.textContent='複製本活動前台網址';frontCopy.onclick=()=>{copyFrontLink();more.open=false};menu.appendChild(frontCopy);more.appendChild(summary);more.appendChild(menu);actions.appendChild(more)}else{let menu=document.querySelector('.adminMoreMenuPanel');menu?.appendChild(copyButton);if(menu&&!document.getElementById('copyFrontLinkBtn')){let frontCopy=document.createElement('button');frontCopy.id='copyFrontLinkBtn';frontCopy.className='btn';frontCopy.type='button';frontCopy.textContent='複製本活動前台網址';frontCopy.onclick=()=>{copyFrontLink();more.open=false};menu.appendChild(frontCopy)}}more.hidden=false}}
  document.querySelectorAll('#lastUpdatedText,#headActiveSurvey').forEach(el=>el.remove());
}
const applyAccessUI_v641=applyAccessUI;applyAccessUI=function(){applyAccessUI_v641();enhanceAdminHeader()};
const renderSurveySelect_v641=renderSurveySelect;renderSurveySelect=function(){renderSurveySelect_v641();enhanceAdminHeader()};
const panelRefresh_v642=panel;panel=function(id,b){panelRefresh_v642(id,b);if(id==='respP'&&isAdmin)refreshAdminData(false)};
window.onload=init;

// ===== v7.11：排程開放、日期三分類與稽核紀錄 =====
function installV711AdminUI(){
  const firstTwo=document.querySelector('#surveyEditor .two');
  if(firstTwo&&!document.getElementById('svOpenMode')){
    const box=document.createElement('div');box.className='scheduleSetting';
    box.innerHTML='<div class="field"><label for="svOpenMode">開放方式</label><select id="svOpenMode" onchange="toggleOpenScheduleV711()"><option value="immediate">立即開放</option><option value="scheduled">指定時間開放</option></select></div><div id="svOpenAtFields" class="deadlineFields"><div class="field"><label for="svOpenDate">開放日期</label><input id="svOpenDate" type="date"></div><div class="field"><label for="svOpenTime">開放時間</label><input id="svOpenTime" type="time" value="08:00"></div></div><p class="muted scheduleHint">活動狀態為「啟用」時，系統才會依此時間開放；可隨時改為暫停填寫。</p>';
    firstTwo.insertAdjacentElement('afterend',box);
    if(svStatus){svStatus.closest('.field')?.querySelector('label')?.replaceChildren(document.createTextNode('填答控制'));svStatus.options[0].textContent='啟用（依開放方式）';svStatus.options[1].textContent='暫停填寫';svStatus.options[2].textContent='草稿（尚未開放）'}
  }
  const side=document.querySelector('.side');
  if(side&&!document.getElementById('logNavButton')){const button=document.createElement('button');button.id='logNavButton';button.className='nav';button.dataset.access='system';button.textContent='操作紀錄';button.onclick=()=>panel('logP',button);const excel=[...side.querySelectorAll('.nav')].find(x=>x.textContent.trim()==='Excel 匯出');side.insertBefore(button,excel||null)}
  const main=document.querySelector('.main');
  if(main&&!document.getElementById('logP')){const section=document.createElement('section');section.id='logP';section.className='panel';section.innerHTML='<div class="card"><div class="logHeader"><div><h3>操作與登入紀錄</h3><p class="muted">本頁僅限系統管理員查看；活動管理者的操作仍會納入稽核紀錄。</p></div><div class="btns"><button class="btn" onclick="loadLogsV711(true)">重新整理</button><button class="btn green" onclick="exportLogsV711()">Excel 匯出</button></div></div><div class="logFilters"><select id="logTypeFilter" onchange="renderLogsV711()"><option value="audit">操作紀錄</option><option value="login">登入紀錄</option></select><input id="logSearch" type="search" placeholder="搜尋帳號、姓名、功能或內容" oninput="renderLogsV711()"><input id="logDateFilter" type="date" onchange="renderLogsV711()"></div><div id="logTable"><div class="muted">開啟本頁後載入紀錄。</div></div></div>';main.appendChild(section)}
}
document.addEventListener('DOMContentLoaded',installV711AdminUI);

function splitDateTimeV711(value,defaultTime='08:00'){let m=String(value||'').match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);return m?{date:m[1],time:m[2]||defaultTime}:{date:'',time:defaultTime}}
function toggleOpenScheduleV711(){let scheduled=document.getElementById('svOpenMode')?.value==='scheduled',fields=document.getElementById('svOpenAtFields');if(fields)fields.hidden=!scheduled}
function syncOpenScheduleV711(){let survey=(surveyFormMode==='edit'?D.surveys.find(x=>x.id===editingSurveyId):null)||{};let mode=survey.openMode==='scheduled'?'scheduled':'immediate',part=splitDateTimeV711(survey.openAt);document.getElementById('svOpenMode').value=mode;document.getElementById('svOpenDate').value=part.date;document.getElementById('svOpenTime').value=part.time;toggleOpenScheduleV711()}
const renderSurveyPanelV711=renderSurveyPanel;renderSurveyPanel=function(){renderSurveyPanelV711();if(document.getElementById('svOpenMode'))syncOpenScheduleV711();let header=document.querySelector('#surveyTable thead th:nth-child(3)');if(header)header.textContent='開放／截止時間';document.querySelectorAll('#surveyTable tbody tr').forEach((row,index)=>{let survey=D.surveys[index],badge=row.cells[1]?.querySelector('.badge'),timeCell=row.cells[2];if(!survey)return;let state=surveyAvailabilityV711(survey);if(badge){badge.textContent=state.label.replace('問卷','');badge.className='badge '+(state.state==='open'?'green':state.state==='upcoming'?'blue':'gray')}if(timeCell){let start=survey.openMode==='scheduled'&&survey.openAt?formatDeadline(survey.openAt):'立即開放',end=survey.deadline?formatDeadline(survey.deadline):'未設定';timeCell.innerHTML='<small class="muted">開放</small> '+esc(start)+'<br><small class="muted">截止</small> '+esc(end)}})};
const getRichDescriptionDataV711=getRichDescriptionData;getRichDescriptionData=function(){let data=getRichDescriptionDataV711(),mode=document.getElementById('svOpenMode')?.value==='scheduled'?'scheduled':'immediate',date=document.getElementById('svOpenDate')?.value||'',time=document.getElementById('svOpenTime')?.value||'08:00',deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'',openValue=mode==='scheduled'&&date?date+'T'+time:'';return{...data,openMode:mode,openAt:openValue,openAtTimestamp:openValue?firebase.firestore.Timestamp.fromDate(new Date(openValue)):firebase.firestore.FieldValue.delete(),deadlineAtTimestamp:deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete()}};
const saveSurveyV711=saveSurvey;saveSurvey=async function(){let mode=document.getElementById('svOpenMode')?.value,date=document.getElementById('svOpenDate')?.value,time=document.getElementById('svOpenTime')?.value||'08:00',openAt=mode==='scheduled'&&date?new Date(date+'T'+time):null,end=svDeadline.value?new Date(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):null;if(mode==='scheduled'&&!date)return alert('請設定問卷開放日期');if(openAt&&end&&openAt>=end)return alert('開放時間必須早於截止時間');let wasMode=surveyFormMode,targetId=editingSurveyId,title=svTitle.value.trim(),beforeCount=D.surveys.length,before=targetId?JSON.stringify(D.surveys.find(x=>x.id===targetId)||{}):'';await saveSurveyV711();let after=targetId?D.surveys.find(x=>x.id===targetId):D.surveys.find(x=>x.title===title);if(after&&(D.surveys.length>beforeCount||before!==JSON.stringify(after)))await writeAuditV711(wasMode==='new'?'建立':'修改','活動',after.id,wasMode==='new'?'建立活動「'+title+'」':'更新活動「'+title+'」的設定',after.id)};

function openDateV711(s){if(s?.openMode!=='scheduled'||!s.openAt)return null;let d=new Date(s.openAt);return Number.isNaN(d.getTime())?null:d}
function surveyAvailabilityV711(s){let now=new Date(),end=deadlineDate(s?.deadline),start=openDateV711(s);if(end&&end<now)return{state:'closed',label:'問卷已截止',message:'本活動已截止填寫',time:'截止時間：'+formatDeadline(s.deadline)};if(s?.status==='draft')return{state:'upcoming',label:'問卷尚未開放',message:'問卷尚未開放',time:start?'開放時間：'+formatDeadline(s.openAt):''};if(s?.status!=='open')return{state:'paused',label:'問卷暫停填寫',message:'本活動目前暫停填寫',time:start?'原訂開放時間：'+formatDeadline(s.openAt):''};if(start&&start>now)return{state:'upcoming',label:'問卷尚未開放',message:'問卷尚未開放',time:'開放時間：'+formatDeadline(s.openAt)};return{state:'open',label:'問卷開放中',message:'',time:''}}
let availabilityTimerV711=null;function scheduleAvailabilityRefreshV711(s){clearTimeout(availabilityTimerV711);let now=Date.now(),times=[openDateV711(s)?.getTime(),deadlineDate(s?.deadline)?.getTime()].filter(x=>Number.isFinite(x)&&x>now),next=times.length?Math.min(...times):0;if(next)availabilityTimerV711=setTimeout(()=>renderFront(),Math.min(next-now+1000,2147483000))}
const renderFrontV711=renderFront;renderFront=function(){renderFrontV711();let s=activeSurvey();if(!s)return;scheduleAvailabilityRefreshV711(s);let availability=surveyAvailabilityV711(s);if(availability.state==='open')return;frontStatus.textContent=availability.label;formGrid.style.display='none';closed.style.display='block';closed.innerHTML='<b>'+esc(availability.message)+'</b>'+(availability.time?'<br>'+esc(availability.time):'')+(availability.state==='upcoming'?'<br>請於開放後再進行填寫。':'')};
const submitVoteV711=submitVote;submitVote=async function(){let state=surveyAvailabilityV711(activeSurvey());if(state.state!=='open')return alert(state.message+(state.time?'\n'+state.time:''));return submitVoteV711()};

function peopleChipsV711(items,kind){return items.map(x=>{let dep=x.departmentName||x.department||'',name=x.memberName||x.name||'',reason=kind==='unavailable'?(x.cannotAttend?'（不克參加）':'（未選擇此日期）'):'';return '<span class="datePersonChip" data-log-dept="'+escAttr(dep)+'">'+esc(dep)+'・'+esc(name)+esc(reason)+'</span>'}).join('')||'<span class="muted">目前沒有資料</span>'}
function enhanceDateStatsV711(){let heading=[...document.querySelectorAll('#resultTables h3')].find(x=>x.textContent.includes('日期統計與可出席名單'));let section=heading?.closest('.resultSection');if(!section)return;let list=section.querySelector('.dateDecisionList');if(!list||list.dataset.v711==='true')return;list.dataset.v711='true';let departments=[...new Set(targetMembers().map(x=>x.department||x.departmentName).filter(Boolean))];let filter=document.createElement('select');filter.id='dateStatsDeptFilter';filter.className='dateStatsDeptFilter';filter.innerHTML='<option value="">全部部門</option>'+departments.map(x=>'<option value="'+escAttr(x)+'">'+esc(x)+'</option>').join('');filter.onchange=filterDateStatsDepartmentV711;heading.insertAdjacentElement('afterend',filter);[...list.querySelectorAll('.dateDecisionItem')].forEach((item,index)=>{item.querySelector('details')?.remove();let date=D.dates[index],attending=attendeeResponsesForDate(date?.id),unavailable=unavailableResponsesForDate(date?.id),missing=missingMembers();let groups=document.createElement('div');groups.className='dateAttendanceGroups';groups.innerHTML='<details open><summary>可出席 '+attending.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(attending,'available')+'</div></details><details><summary>已填但無法出席 '+unavailable.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(unavailable,'unavailable')+'</div></details><details><summary>尚未填答 '+missing.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(missing,'missing')+'</div></details>';item.appendChild(groups)})}
function filterDateStatsDepartmentV711(){let value=document.getElementById('dateStatsDeptFilter')?.value||'';document.querySelectorAll('.dateAttendanceGroups .datePersonChip').forEach(x=>x.hidden=!!value&&x.dataset.logDept!==value)}
const renderResultsV711=renderResults;renderResults=function(){renderResultsV711();enhanceDateStatsV711()};

let auditLogsV711=[],loginLogsV711=[];
function actorRoleV711(){return isSystemAdmin?'系統管理員':currentAccessRole==='manager'?'活動管理者':'結果檢視者'}
async function writeAuditV711(action,targetType,targetId,summary,surveyId=activeSurveyId){if(!currentUser||!db)return;try{await col('surveyAuditLogs').add({surveyId:surveyId||'',action,targetType,targetId:targetId||'',summary:summary||'',actorUid:currentUser.uid,actorEmail:String(currentUser.email||'').toLowerCase(),actorName:currentUser.displayName||'',actorRole:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.warn('操作紀錄寫入失敗',e)}}
async function writeLoginV711(result,reason=''){if(!currentUser||!db)return;try{await col('surveyLoginLogs').add({uid:currentUser.uid,email:String(currentUser.email||'').toLowerCase(),displayName:currentUser.displayName||'',result,reason,role:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.warn('登入紀錄寫入失敗',e)}}
const resolveAccessV711=resolveAccess;resolveAccess=async function(email,uid){await resolveAccessV711(email,uid);let key='surveyLoginLogged:'+uid;if(!sessionStorage.getItem(key)){await writeLoginV711(isAdmin?'success':'denied',isAdmin?'':'沒有後台權限');sessionStorage.setItem(key,'1')}};
const logoutV711=logout;logout=async function(){await writeLoginV711('logout','使用者登出');return logoutV711()};
async function loadLogsV711(showMessage=false){if(!isSystemAdmin)return;try{auditLogsV711=await safeGetCollection('surveyAuditLogs');loginLogsV711=await safeGetCollection('surveyLoginLogs');renderLogsV711();if(showMessage)toast('紀錄已更新')}catch(e){console.error('load logs failed',e);alert('紀錄載入失敗，請確認 Firestore 規則已更新')}}
function logTimeV711(x){let d=x?.createdAt?.toDate?x.createdAt.toDate():null;return d&&!Number.isNaN(d.getTime())?d:null}
function filteredLogsV711(){let type=document.getElementById('logTypeFilter')?.value||'audit',q=(document.getElementById('logSearch')?.value||'').trim().toLowerCase(),date=document.getElementById('logDateFilter')?.value||'',rows=type==='login'?loginLogsV711:auditLogsV711;return rows.filter(x=>{let d=logTimeV711(x),day=d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';return(!date||day===date)&&(!q||JSON.stringify(x).toLowerCase().includes(q))}).sort((a,b)=>(logTimeV711(b)?.getTime()||0)-(logTimeV711(a)?.getTime()||0))}
function renderLogsV711(){let box=document.getElementById('logTable');if(!box)return;let type=document.getElementById('logTypeFilter')?.value||'audit';if(type==='login'&&!isSystemAdmin){document.getElementById('logTypeFilter').value='audit';type='audit'}let rows=filteredLogsV711();box.innerHTML=type==='login'?table(['時間','帳號／姓名','結果','身分','說明'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.displayName||'')+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>')):table(['時間','操作者','活動','功能／動作','內容'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.actorName||'')+'</b><br><small>'+esc(x.actorEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'</td></tr>'))}
function exportLogsV711(){let rows=filteredLogsV711();if(!rows.length)return alert('目前沒有可匯出的紀錄');let type=document.getElementById('logTypeFilter')?.value||'audit',data=type==='login'?rows.map(x=>({'時間':fmtTs(x.createdAt),'帳號':x.email||'','姓名':x.displayName||'','結果':x.result||'','身分':x.role||'','說明':x.reason||''})):rows.map(x=>({'時間':fmtTs(x.createdAt),'操作者':x.actorName||'','帳號':x.actorEmail||'','身分':x.actorRole||'','活動':D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'','功能':x.targetType||'','動作':x.action||'','內容':x.summary||''}));let wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),type==='login'?'登入紀錄':'操作紀錄');XLSX.writeFile(wb,(type==='login'?'登入紀錄':'操作紀錄')+'.xlsx')}

const panelV711=panel;panel=function(id,b){if(id==='logP'&&!isSystemAdmin)return alert('此功能僅限系統管理員');panelV711(id,b);if(id==='logP')loadLogsV711(false)};
const enhanceAdminHeaderV711=enhanceAdminHeader;enhanceAdminHeader=function(){enhanceAdminHeaderV711();let button=document.getElementById('logNavButton');let group=[...document.querySelectorAll('.topNavGroup')].find(x=>x.querySelector('summary')?.textContent.includes('系統管理'));if(button&&group&&!group.contains(button)){group.querySelector('.topNavMenu')?.appendChild(button);button.addEventListener('click',()=>{group.open=false})}};
const saveDateV711=saveDate;saveDate=async function(){let id=editingDateId,label=newDate.value.trim(),beforeCount=D.dates.length,before=id?D.dates.find(x=>x.id===id):null;await saveDateV711();let after=id?D.dates.find(x=>x.id===id):D.dates.find(x=>x.label===label);if(after&&(D.dates.length>beforeCount||before?.label!==after.label||before?.sort!==after.sort))await writeAuditV711(id?'修改':'新增','日期',after.id,id?'修改日期「'+label+'」':'新增日期「'+label+'」')};
const saveRestaurantV711=saveRestaurant;saveRestaurant=async function(){let id=editingRestaurantId,name=newRest.value.trim(),beforeCount=D.restaurants.length,before=id?D.restaurants.find(x=>x.id===id):null;await saveRestaurantV711();let after=id?D.restaurants.find(x=>x.id===id):D.restaurants.find(x=>x.name===name);if(after&&(D.restaurants.length>beforeCount||JSON.stringify(before)!==JSON.stringify(after)))await writeAuditV711(id?'修改':'新增','餐廳',after.id,id?'修改餐廳「'+name+'」':'新增餐廳「'+name+'」')};
const saveBudgetSettingV711=saveBudgetSetting;saveBudgetSetting=async function(){let value=budgetPerPerson?.value||'',before=activityBudgetPerPerson();await saveBudgetSettingV711();let after=activityBudgetPerPerson();if(before!==after)await writeAuditV711('修改','預算',activeSurveyId,'每人預算調整為 '+(value||'未設定'))};
const saveResponseEditV711=saveResponseEdit;saveResponseEdit=async function(){let id=editingResponseId,r=D.responses.find(x=>x.id===id),before=r?JSON.stringify({dates:responseDateIds(r),ranks:r.restaurantRanks,note:r.note,cannot:r.cannotAttend}):'';await saveResponseEditV711();let after=D.responses.find(x=>x.id===id),afterValue=after?JSON.stringify({dates:responseDateIds(after),ranks:after.restaurantRanks,note:after.note,cannot:after.cannotAttend}):'';if(id&&after&&before!==afterValue)await writeAuditV711('修改','問卷',id,'修改 '+(r?.departmentName||'')+' '+(r?.memberName||'')+' 的填答內容')};
const deleteResponseV711=deleteResponse;deleteResponse=async function(id){let r=D.responses.find(x=>x.id===id);await deleteResponseV711(id);if(r&&!D.responses.some(x=>x.id===id))await writeAuditV711('刪除','問卷',id,'刪除 '+(r.departmentName||'')+' '+(r.memberName||'')+' 的填答資料')};
const saveFinalV711=saveFinal;saveFinal=async function(){let dateId=finalDate.value,restId=finalRest.value,before=JSON.stringify(D.final||{});await saveFinalV711();if(before!==JSON.stringify(D.final||{}))await writeAuditV711('修改','最終決議',activeSurveyId,'最終日期：'+(D.dates.find(x=>x.id===dateId)?.label||'未設定')+'；最終餐廳：'+(D.restaurants.find(x=>x.id===restId)?.name||'未設定'))};
const saveSurveyManagerV711=saveSurveyManager;saveSurveyManager=async function(){let email=managerEmail.value.trim().toLowerCase(),role=managerRole.value;await saveSurveyManagerV711();if(email)await writeAuditV711('指派','活動權限',email,'指派 '+email+' 為 '+(role==='viewer'?'結果檢視者':'活動管理者'))};
const removeSurveyManagerV711=removeSurveyManager;removeSurveyManager=async function(id){let m=D.managers.find(x=>x.id===id);await removeSurveyManagerV711(id);if(m&&!D.managers.some(x=>x.id===id))await writeAuditV711('移除','活動權限',id,'移除 '+(m.email||'')+' 的活動權限')};
const delDocV711=delDoc;delDoc=async function(collection,id){let before=collection==='surveyDates'?D.dates.find(x=>x.id===id):collection==='restaurants'?D.restaurants.find(x=>x.id===id):collection==='members'?D.members.find(x=>x.id===id):collection==='surveys'?D.surveys.find(x=>x.id===id):null;await delDocV711(collection,id);let remains=collection==='surveyDates'?D.dates.some(x=>x.id===id):collection==='restaurants'?D.restaurants.some(x=>x.id===id):collection==='members'?D.members.some(x=>x.id===id):collection==='surveys'?D.surveys.some(x=>x.id===id):true;if(before&&!remains)await writeAuditV711('刪除',({surveyDates:'日期',restaurants:'餐廳',members:'人員',surveys:'活動'})[collection]||collection,id,'刪除「'+(before.label||before.name||before.title||id)+'」',collection==='surveys'?id:activeSurveyId)};
const saveMemberV711=saveMember;saveMember=async function(){let id=editingMemberId,name=newMem.value.trim(),beforeCount=D.members.length,before=id?JSON.stringify(D.members.find(x=>x.id===id)||{}):'';await saveMemberV711();let after=id?D.members.find(x=>x.id===id):D.members.find(x=>x.name===name);if(after&&(D.members.length>beforeCount||before!==JSON.stringify(after)))await writeAuditV711(id?'修改':'新增','人員',after.id,(id?'修改':'新增')+'人員「'+name+'」','')};
const toggleMemberV711=toggleMember;toggleMember=async function(id,active){let m=D.members.find(x=>x.id===id),before=m?.active!==false;await toggleMemberV711(id,active);let after=D.members.find(x=>x.id===id);if(after&&before!==(after.active!==false))await writeAuditV711(active?'啟用':'停用','人員',id,(active?'啟用':'停用')+'人員「'+(m?.name||id)+'」','')};
const toggleMemberFillV711=toggleMemberFill;toggleMemberFill=async function(id,canFill,btn){let m=D.members.find(x=>x.id===id),before=memberCanFill(m);await toggleMemberFillV711(id,canFill,btn);if(before!==memberCanFill(m))await writeAuditV711('修改','填寫資格',id,(m?.name||id)+(canFill?'開放填寫':'關閉填寫'))};
const toggleMemberBudgetV711=toggleMemberBudget;toggleMemberBudget=async function(id,eligible,btn){let m=D.members.find(x=>x.id===id),before=memberBudgetEligible(m);await toggleMemberBudgetV711(id,eligible,btn);let refreshed=D.members.find(x=>x.id===id);if(before!==memberBudgetEligible(refreshed))await writeAuditV711('修改','預算資格',id,(m?.name||id)+(eligible?'納入預算':'排除預算'))};
const importMembersV711=importMembers;importMembers=async function(file){let before=D.members.length;await importMembersV711(file);if(D.members.length!==before)await writeAuditV711('匯入','人員','',`匯入人員主檔，筆數 ${before} → ${D.members.length}`,'')};

/* v7.12 多元餐廳計價：餐廳管理只維護價格規則，出席人數與總額集中於費用試算。 */
function pricingModeV712(rest){return ['perPerson','perTable','fixed'].includes(rest?.pricingMode)?rest.pricingMode:'perPerson'}
function pricingModeLabelV712(mode){return({perPerson:'每人計價',perTable:'每桌計價',fixed:'固定總價'})[mode]||'每人計價'}
function numericV712(value,fallback=0){let n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback}
function restaurantCostV712(rest,attendanceCount){
  if(!rest)return{mode:'perPerson',subtotal:null,serviceFee:0,fixedFee:0,total:null,tables:0,effectivePerPerson:null};
  let mode=pricingModeV712(rest),count=Math.max(0,Number(attendanceCount)||0),price=moneyValue(rest.price),tableSeats=Math.max(1,Math.floor(numericV712(rest.tableSeats,10))),minTables=Math.max(0,Math.floor(numericV712(rest.minTables,0))),tables=0,subtotal=null;
  if(price!==null){
    if(mode==='perPerson')subtotal=price*count;
    else if(mode==='perTable'){tables=count?Math.max(minTables,Math.ceil(count/tableSeats)):0;subtotal=price*tables}
    else subtotal=price;
  }
  let serviceRate=Math.min(100,numericV712(rest.serviceRate,0)),serviceFee=subtotal===null?0:Math.round(subtotal*serviceRate/100),fixedFee=numericV712(rest.fixedFee,0),total=subtotal===null?null:subtotal+serviceFee+fixedFee;
  return{mode,price,tableSeats,minTables,tables,subtotal,serviceRate,serviceFee,fixedFee,total,effectivePerPerson:total!==null&&count?total/count:null};
}
function pricingSummaryV712(rest){
  let mode=pricingModeV712(rest),price=moneyValue(rest?.price),base=price===null?'尚未設定價格':mode==='perPerson'?moneyText(price)+' 元／人':mode==='perTable'?moneyText(price)+' 元／桌（'+Math.max(1,Math.floor(numericV712(rest?.tableSeats,10)))+' 人／桌）':moneyText(price)+' 元／場';
  let extras=[];if(numericV712(rest?.serviceRate,0))extras.push('服務費 '+numericV712(rest.serviceRate,0)+'%');if(numericV712(rest?.fixedFee,0))extras.push('固定費 '+moneyText(rest.fixedFee)+' 元');return base+(extras.length?'；'+extras.join('、'):'');
}
function installRestaurantPricingV712(){
  let priceField=newPrice?.closest('.field');if(!priceField||document.getElementById('restaurantPricingMode'))return;
  priceField.insertAdjacentHTML('beforebegin',`<div class="restaurantPricingBox"><div class="field"><label for="restaurantPricingMode">計價方式</label><select id="restaurantPricingMode" onchange="toggleRestaurantPricingV712()"><option value="perPerson">每人計價</option><option value="perTable">每桌計價</option><option value="fixed">固定總價</option></select></div><div id="restaurantTableFields" class="two" hidden><div class="field"><label for="restaurantTableSeats">每桌人數</label><input id="restaurantTableSeats" type="number" min="1" step="1" value="10" placeholder="例如：10"></div><div class="field"><label for="restaurantMinTables">最低桌數（選填）</label><input id="restaurantMinTables" type="number" min="0" step="1" placeholder="例如：2"></div></div><div class="two"><div class="field"><label for="restaurantServiceRate">服務費率（%）</label><input id="restaurantServiceRate" type="number" min="0" max="100" step="0.1" placeholder="例如：10"></div><div class="field"><label for="restaurantFixedFee">其他固定費用（選填）</label><input id="restaurantFixedFee" type="number" min="0" step="1" placeholder="例如：包廂費 2000"></div></div></div>`);
  priceField.querySelector('label').id='restaurantPriceLabel';priceField.querySelector('label').textContent='每人單價';newPrice.placeholder='例如：1188';if(restVarianceHint)restVarianceHint.hidden=true;toggleRestaurantPricingV712();
}
function toggleRestaurantPricingV712(){let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',table=document.getElementById('restaurantTableFields'),label=document.getElementById('restaurantPriceLabel');if(table)table.hidden=mode!=='perTable';if(label)label.textContent=mode==='perPerson'?'每人單價':mode==='perTable'?'每桌價格':'固定總價';if(newPrice)newPrice.placeholder=mode==='perPerson'?'例如：1188':mode==='perTable'?'例如：12000':'例如：50000'}
document.addEventListener('DOMContentLoaded',installRestaurantPricingV712);

renderRestPanel=function(){
  restTable.innerHTML=table(['餐廳','地址','Google Map','類型','計價方式','價格設定','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td>${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':''}</td><td>${esc(r.description||r.cuisine||'')}</td><td><span class="badge blue">${esc(pricingModeLabelV712(pricingModeV712(r)))}</span></td><td>${esc(pricingSummaryV712(r))}</td><td class="alignCenter">${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant('${r.id}')">編輯</button> <button class="btn red" onclick="delDoc('restaurants','${r.id}')">刪除</button></td></tr>`));
};
editRestaurant=function(id){let r=D.restaurants.find(x=>x.id===id);if(!r)return alert('找不到這筆餐廳資料');installRestaurantPricingV712();editingRestaurantId=id;newRest.value=r.name||'';newAddr.value=r.address||'';newMap.value=r.googleMap||r.mapUrl||'';newPrice.value=moneyValue(r.price)??'';newCuisine.value=r.description||r.cuisine||'';newRestSort.value=r.sort??'';document.getElementById('restaurantPricingMode').value=pricingModeV712(r);document.getElementById('restaurantTableSeats').value=Math.max(1,Math.floor(numericV712(r.tableSeats,10)));document.getElementById('restaurantMinTables').value=numericV712(r.minTables,0)||'';document.getElementById('restaurantServiceRate').value=numericV712(r.serviceRate,0)||'';document.getElementById('restaurantFixedFee').value=numericV712(r.fixedFee,0)||'';toggleRestaurantPricingV712();restFormHeading.textContent='編輯餐廳：'+(r.name||'');restModeBadge.textContent='編輯模式';restModeBadge.className='modeBadge edit';restSaveBtn.textContent='儲存變更';restCancelBtn.hidden=false;newRest.focus()};
cancelRestaurantEdit=function(render=true){editingRestaurantId=null;newRest.value='';newAddr.value='';newMap.value='';newPrice.value='';newCuisine.value='';newRestSort.value='';let mode=document.getElementById('restaurantPricingMode');if(mode)mode.value='perPerson';['restaurantMinTables','restaurantServiceRate','restaurantFixedFee'].forEach(id=>{let x=document.getElementById(id);if(x)x.value=''});let seats=document.getElementById('restaurantTableSeats');if(seats)seats.value='10';toggleRestaurantPricingV712();restFormHeading.textContent='新增餐廳';restModeBadge.textContent='新增模式';restModeBadge.className='modeBadge new';restSaveBtn.textContent='新增餐廳';restCancelBtn.hidden=true;if(render)renderRestPanel()};
saveRestaurant=async function(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');let name=newRest.value.trim();if(!name){newRest.focus();return alert('請輸入餐廳名稱')}
  let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',price=moneyValue(newPrice.value),tableSeats=Math.floor(numericV712(document.getElementById('restaurantTableSeats')?.value,10)),minTables=Math.floor(numericV712(document.getElementById('restaurantMinTables')?.value,0)),serviceRate=numericV712(document.getElementById('restaurantServiceRate')?.value,0),fixedFee=numericV712(document.getElementById('restaurantFixedFee')?.value,0);
  if(newPrice.value.trim()!==''&&price===null)return alert('價格請輸入有效數字');if(mode==='perTable'&&tableSeats<1)return alert('每桌人數至少為 1 人');if(serviceRate>100)return alert('服務費率不可超過 100%');
  let id=editingRestaurantId,isEdit=!!id,before=id?JSON.stringify(D.restaurants.find(x=>x.id===id)||{}):'',data={surveyId:activeSurveyId,name,address:newAddr.value.trim(),googleMap:newMap.value.trim(),description:newCuisine.value.trim(),pricingMode:mode,price,tableSeats:mode==='perTable'?tableSeats:null,minTables:mode==='perTable'?minTables:0,serviceRate,fixedFee,sort:Number(newRestSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};restSaveBtn.disabled=true;restSaveBtn.textContent='儲存中…';
  try{let ref;if(isEdit){ref=doc('restaurants',id);await ref.set(data,{merge:true})}else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();ref=await col('restaurants').add(data);id=ref.id}cancelRestaurantEdit(false);await loadSurveyData();renderFront();renderAdmin();let after=D.restaurants.find(x=>x.id===id);if(after&&(!isEdit||before!==JSON.stringify(after)))await writeAuditV711(isEdit?'修改':'新增','餐廳',id,(isEdit?'修改餐廳「':'新增餐廳「')+name+'」');toast(isEdit?'餐廳變更已儲存':'餐廳已新增')}catch(e){console.error('save restaurant failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}
};
function costEstimateSectionV712(dateId,restaurantId,contextTitle='費用試算'){
  let date=D.dates.find(d=>d.id===dateId),rest=D.restaurants.find(r=>r.id===restaurantId);if(!dateId&&!restaurantId)return'<div class="finalEmpty">請選擇日期與餐廳後，系統會依該日期可出席人數進行試算。</div>';if(!dateId)return'<div class="finalEmpty">請先選擇試算日期。</div>';if(!restaurantId)return'<div class="finalEmpty">請先選擇試算餐廳。</div>';if(!date||!rest)return'<div class="finalEmpty">找不到日期或餐廳資料，請重新選擇。</div>';
  let attending=attendeeResponsesForDate(dateId),budgetAttending=budgetEligibleAttendeesForDate(dateId),budget=activityBudgetPerPerson(),cost=restaurantCostV712(rest,attending.length),budgetTotal=budget===null?null:budget*budgetAttending.length,totalDiff=budgetTotal===null||cost.total===null?null:budgetTotal-cost.total,nonBudgetCount=attending.length-budgetAttending.length,tableDetail=cost.mode==='perTable'?`<div><span>預估桌數</span><strong>${cost.tables} 桌（${cost.tableSeats} 人／桌${cost.minTables?'，最低 '+cost.minTables+' 桌':''}）</strong></div>`:'';
  return `<section class="finalGroup finalCostBox costEstimateBox"><div class="finalGroupHead"><h4>${esc(contextTitle)}</h4><span class="countBadge">${attending.length} 人可出席</span></div><div class="costEstimateTitle"><b>${esc(date.label||'')}</b><span>×</span><b>${esc(rest.name||'')}</b></div><div class="finalCostGrid"><div><span>計價方式</span><strong>${esc(pricingModeLabelV712(cost.mode))}</strong></div><div><span>價格設定</span><strong>${esc(pricingSummaryV712(rest))}</strong></div><div><span>可出席人數</span><strong>${attending.length} 人</strong></div><div><span>預算人數</span><strong>${budgetAttending.length} 人${nonBudgetCount>0?'（'+nonBudgetCount+' 人不納入預算）':''}</strong></div>${tableDetail}<div><span>未加服務費小計</span><strong>${cost.subtotal===null?'—':esc(moneyText(cost.subtotal))+' 元'}</strong></div><div><span>服務費</span><strong>${esc(moneyText(cost.serviceFee))} 元</strong></div><div><span>其他固定費用</span><strong>${esc(moneyText(cost.fixedFee))} 元</strong></div><div><span>平均每人餐費</span><strong>${cost.effectivePerPerson===null?'—':esc(moneyText(Math.round(cost.effectivePerPerson)))+' 元'}</strong></div><div><span>預算總額</span><strong>${budgetTotal===null?'—':esc(moneyText(budgetTotal))+' 元'}</strong></div><div><span>餐費總額</span><strong>${cost.total===null?'—':esc(moneyText(cost.total))+' 元'}</strong></div><div class="finalTotalDiff ${totalDiff<0?'isOver':'isOk'}"><span>總額差異</span><strong class="${totalDiff<0?'costOver':'costOk'}">${totalDiff===null?'—':esc(budgetStatusText(totalDiff))}</strong></div></div><p class="muted">預算總額以「納入預算」人數計算；餐費依所選餐廳的計價方式與實際可出席人數計算。</p></section>`;
}
buildCostEstimateHtml=costEstimateSectionV712;
renderCostEstimate=function(){let box=document.getElementById('costEstimatePreview'),dateSelect=document.getElementById('costDate'),restSelect=document.getElementById('costRest');if(!box||!dateSelect||!restSelect)return;let dateId=dateSelect.value,restId=restSelect.value,matrix='';if(D.dates.length&&D.restaurants.length)matrix=`<section class="finalGroup costMatrix"><div class="finalGroupHead"><h4>快速比較</h4><span class="muted">顯示各日期 × 餐廳的總額差異</span></div>${table(['日期','可出席人數','預算人數',...D.restaurants.map(r=>esc(r.name))],D.dates.map(d=>{let count=attendeeResponsesForDate(d.id).length,budgetCount=budgetEligibleAttendeesForDate(d.id).length;return `<tr><td><b>${esc(d.label)}</b></td><td class="alignCenter">${count}</td><td class="alignCenter">${budgetCount}</td>${D.restaurants.map(r=>{let budget=activityBudgetPerPerson(),cost=restaurantCostV712(r,count),value=budget===null||cost.total===null?null:(budget*budgetCount)-cost.total,cls=value<0?'costOver':'costOk';return `<td class="alignCenter"><button class="costPickBtn ${value<0?'over':'ok'}" onclick="pickCostEstimate('${escAttr(d.id)}','${escAttr(r.id)}')"><span class="${cls}">${value===null?'—':esc(budgetStatusText(value))}</span></button></td>`}).join('')}</tr>`}))}</section>`;box.innerHTML=costEstimateSectionV712(dateId,restId,'試算結果')+matrix};
const renderFinalAttendancePreviewV712Base=renderFinalAttendancePreview;renderFinalAttendancePreview=function(){renderFinalAttendancePreviewV712Base();let box=document.getElementById('finalAttendancePreview'),dateId=finalDate.value,restId=finalRest.value,old=box?.querySelector('.finalCostBox');if(!box||!dateId||!old)return;let holder=document.createElement('div');holder.innerHTML=restId?costEstimateSectionV712(dateId,restId,'餐費試算'):'<section class="finalGroup finalCostBox"><div class="finalEmpty">選擇最終餐廳後，會依當天可出席人數及餐廳計價方式自動試算。</div></section>';old.replaceWith(holder.firstElementChild)};
const exportExcelV712Base=exportExcel;exportExcel=function(){
  if(!window.XLSX)return exportExcelV712Base();let originalWrite=XLSX.writeFile;
  XLSX.writeFile=function(workbook,filename){
    let rest=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId),count=attendeeResponsesForDate(D.final?.finalDateId||'').length,cost=restaurantCostV712(rest,count),budget=activityBudgetPerPerson(),budgetCount=budgetEligibleAttendeesForDate(D.final?.finalDateId||'').length,budgetTotal=budget===null?null:budget*budgetCount;
    let finalSheet=workbook.Sheets['最終出席名單'];if(finalSheet){let rows=XLSX.utils.sheet_to_json(finalSheet,{header:1,defval:''});rows.forEach(row=>{if(row[0]==='單價'){row[0]='計價方式';row[1]=rest?pricingModeLabelV712(pricingModeV712(rest)):''}else if(row[0]==='每人價差'){row[0]='價格設定';row[1]=rest?pricingSummaryV712(rest):''}else if(row[0]==='餐費總額')row[1]=cost.total===null?'':moneyText(cost.total);else if(row[0]==='總額差異')row[1]=budgetTotal===null||cost.total===null?'—':budgetStatusText(budgetTotal-cost.total)});workbook.Sheets['最終出席名單']=XLSX.utils.aoa_to_sheet(rows);workbook.Sheets['最終出席名單']['!merges']=[XLSX.utils.decode_range('A1:E1')];workbook.Sheets['最終出席名單']['!cols']=[{wch:18},{wch:36},{wch:14},{wch:14},{wch:34}]}
    let restaurantSheet=workbook.Sheets['餐廳統計'];if(restaurantSheet){let rows=XLSX.utils.sheet_to_json(restaurantSheet,{defval:''});rows.forEach((row,index)=>{let r=D.restaurants[index];row['計價方式']=r?pricingModeLabelV712(pricingModeV712(r)):'';row['價格設定']=r?pricingSummaryV712(r):'';delete row['單價'];delete row['每人差異']});workbook.Sheets['餐廳統計']=XLSX.utils.json_to_sheet(rows)}
    return originalWrite.call(XLSX,workbook,filename);
  };try{return exportExcelV712Base()}finally{XLSX.writeFile=originalWrite}
};

// ===== v7.19：以 v7.17 穩定版為基底，重新套用 11 項後台體驗補強 =====
function memberLabelV719(user=currentUser){
  let email=String(user?.email||'').toLowerCase();
  let account=D.memberAccounts?.find(a=>String(a.email||'').toLowerCase()===email);
  let member=account?D.members.find(m=>m.id===account.memberId):D.members.find(m=>String(m.googleEmail||m.email||'').toLowerCase()===email);
  if(member)return [member.department||member.departmentName,member.name||member.employeeName].filter(Boolean).join(' ');
  return user?.displayName||user?.email||'';
}
function securitySettingsV719(s=activeSurvey()){let x=s?.securitySettings||{};return{disableRightClick:!!x.disableRightClick,disableViewSource:!!x.disableViewSource,disableDevTools:!!x.disableDevTools}}
let securityKeyHandlerV719=null,securityContextHandlerV719=null;
function applyFrontSecurityV719(settings){
  document.removeEventListener('contextmenu',securityContextHandlerV719,true);
  document.removeEventListener('keydown',securityKeyHandlerV719,true);
  securityContextHandlerV719=e=>{if(settings.disableRightClick){e.preventDefault();toast('此頁已停用右鍵選單')}};
  securityKeyHandlerV719=e=>{let k=String(e.key||'').toLowerCase(),blockSource=settings.disableViewSource&&e.ctrlKey&&k==='u',blockDev=settings.disableDevTools&&(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k)));if(blockSource||blockDev){e.preventDefault();e.stopPropagation();toast('此快捷鍵已停用')}};
  document.addEventListener('contextmenu',securityContextHandlerV719,true);
  document.addEventListener('keydown',securityKeyHandlerV719,true);
}
function ensureSecuritySettingsV719(){
  if(!isSystemAdmin)return;
  let access=document.getElementById('accessP')?.querySelector('.card');
  if(!access||document.getElementById('securitySettingsBox'))return;
  access.insertAdjacentHTML('beforeend',`<div id="securitySettingsBox" class="securitySettingsBox">
    <div><h3>前台操作限制</h3><p class="muted">由系統管理員設定目前活動的前台保護。這能降低一般使用者查看程式碼的便利性；真正權限仍以 Firestore 規則為準。</p></div>
    <label class="checkLine"><input id="secRightClick" type="checkbox"> 停用右鍵</label>
    <label class="checkLine"><input id="secViewSource" type="checkbox"> 停用 Ctrl + U 檢視原始碼</label>
    <label class="checkLine"><input id="secDevTools" type="checkbox"> 停用 F12 / Ctrl + Shift + I</label>
    <button class="btn primary" onclick="saveSecuritySettingsV719()">儲存前台限制</button>
  </div>`);
  syncSecuritySettingsV719();
}
function syncSecuritySettingsV719(){let s=securitySettingsV719(),a=document.getElementById('secRightClick'),b=document.getElementById('secViewSource'),c=document.getElementById('secDevTools');if(a)a.checked=s.disableRightClick;if(b)b.checked=s.disableViewSource;if(c)c.checked=s.disableDevTools}
async function saveSecuritySettingsV719(){
  if(!isSystemAdmin||!activeSurveyId)return alert('請先選擇活動');
  let securitySettings={disableRightClick:!!document.getElementById('secRightClick')?.checked,disableViewSource:!!document.getElementById('secViewSource')?.checked,disableDevTools:!!document.getElementById('secDevTools')?.checked};
  await doc('surveys',activeSurveyId).set({securitySettings,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  await loadAll();renderAdmin();renderFront();toast('前台操作限制已更新');
}

const applyRouteV719=applyRoute;applyRoute=function(){let wantsAdmin=location.hash.startsWith('#admin');document.body.classList.toggle('adminLoginOnly',wantsAdmin&&!isAdmin);applyRouteV719();if(wantsAdmin&&!isAdmin){front.style.display='none';admin.style.display='none';loginMask.style.display='flex'}};
const statusLabelV719=statusLabel;statusLabel=function(status){return status==='archived'?'已結案':statusLabelV719(status)};
async function archiveSurveyV719(id,archive=true){
  let s=D.surveys.find(x=>x.id===id);if(!s)return;
  if(!confirm(archive?'確定將「'+(s.title||id)+'」標記為結案？結案後仍可恢復進行中。':'確定將「'+(s.title||id)+'」恢復為進行中？'))return;
  await doc('surveys',id).set({status:archive?'archived':'open',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  if(typeof writeAuditV711==='function')await writeAuditV711(archive?'結案':'恢復','活動',id,(archive?'結案':'恢復進行中')+'「'+(s.title||id)+'」',id);
  await loadAll();renderAdmin();renderFront();toast(archive?'活動已結案':'活動已恢復進行中');
}
function applyArchiveButtonsV719(){
  if(!isSystemAdmin)return;
  document.querySelectorAll('#surveyTable tbody tr').forEach((row,index)=>{
    let s=D.surveys[index],ops=row.querySelector('.operationCell');if(!s||!ops||ops.querySelector('.archiveSurveyBtn'))return;
    let btn=document.createElement('button');btn.type='button';btn.className='btn archiveSurveyBtn';btn.textContent=s.status==='archived'?'恢復進行中':'結案';btn.onclick=()=>archiveSurveyV719(s.id,s.status!=='archived');ops.insertBefore(btn,ops.firstChild);
    let badge=row.cells[1]?.querySelector('.badge');if(badge&&s.status==='archived'){badge.textContent='已結案';badge.className='badge gray'}
  });
}

function ensureDuplicateSurveyModalV719(){
  if(document.getElementById('duplicateSurveyModal'))return;
  document.body.insertAdjacentHTML('beforeend',`<div id="duplicateSurveyModal" class="modalMask" style="display:none">
    <div class="modal duplicateSurveyDialog"><div class="modalHeader"><h3>複製活動</h3><button class="modalClose" onclick="closeDuplicateSurveyModalV719()">×</button></div>
    <p class="muted">建立一份新活動，再選擇要沿用哪些設定；填答資料與最終決議不會被複製。</p>
    <input id="dupSourceId" type="hidden"><div class="field"><label for="dupSurveyTitle">新活動名稱</label><input id="dupSurveyTitle" placeholder="例如：115年第四次部門聚餐調查"></div>
    <div class="copyOptions"><label><input id="dupCopyDescription" type="checkbox" checked> 說明文字與前台提示</label><label><input id="dupCopyDepartments" type="checkbox" checked> 參與部門</label><label><input id="dupCopyTheme" type="checkbox" checked> 前台主題與操作限制</label><label><input id="dupCopyDates" type="checkbox" checked> 日期清單</label><label><input id="dupCopyRestaurants" type="checkbox" checked> 餐廳與費用設定</label><label><input id="dupCopyBudget" type="checkbox" checked> 人員預算／填寫資格</label><label><input id="dupCopyAccess" type="checkbox"> 權限指派</label></div>
    <div class="modalActions"><button class="btn" onclick="closeDuplicateSurveyModalV719()">取消</button><button class="btn primary" onclick="confirmDuplicateSurveyV719()">建立複本</button></div></div>
  </div>`);
}
function duplicateSurveyPrompt(sourceId){ensureDuplicateSurveyModalV719();let s=D.surveys.find(x=>x.id===sourceId);document.getElementById('dupSourceId').value=sourceId;document.getElementById('dupSurveyTitle').value=(s?.title||'活動')+'（複本）';document.getElementById('duplicateSurveyModal').style.display='flex'}
function closeDuplicateSurveyModalV719(){let m=document.getElementById('duplicateSurveyModal');if(m)m.style.display='none'}
async function confirmDuplicateSurveyV719(){
  let sourceId=document.getElementById('dupSourceId')?.value,title=document.getElementById('dupSurveyTitle')?.value.trim();
  if(!title)return alert('請輸入新活動名稱');
  await duplicateSurveyV719(sourceId,title,{description:document.getElementById('dupCopyDescription')?.checked,departments:document.getElementById('dupCopyDepartments')?.checked,theme:document.getElementById('dupCopyTheme')?.checked,dates:document.getElementById('dupCopyDates')?.checked,restaurants:document.getElementById('dupCopyRestaurants')?.checked,budget:document.getElementById('dupCopyBudget')?.checked,access:document.getElementById('dupCopyAccess')?.checked});
  closeDuplicateSurveyModalV719();
}
async function duplicateSurveyV719(sourceId,newTitle,opts){
  if(!isSystemAdmin)return alert('只有系統管理員可以複製活動');
  let source=D.surveys.find(s=>s.id===sourceId);if(!source)return alert('找不到來源活動');
  let newId='survey_'+Date.now(),data={title:newTitle,deadline:'',status:'draft',allowEdit:source.allowEdit!==false,isAnonymous:false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  if(opts.description)Object.assign(data,{description:source.description||'',descriptionHtml:source.descriptionHtml||'',descriptionStyle:source.descriptionStyle||{},frontInstructions:source.frontInstructions||''});
  data.targetDepartments=opts.departments?[...(source.targetDepartments||[])]:[];
  if(opts.theme)Object.assign(data,{theme:source.theme||'classic',securitySettings:source.securitySettings||{}});
  await doc('surveys',newId).set(data,{merge:true});
  let jobs=[],sourceDates=await col('surveyDates').where('surveyId','==',sourceId).get(),sourceRestaurants=await col('restaurants').where('surveyId','==',sourceId).get(),sourceBudget=await col('budgetEligibility').where('surveyId','==',sourceId).get(),sourceManagers=await col('surveyManagers').where('surveyId','==',sourceId).get();
  if(opts.dates)jobs.push(...sourceDates.docs.map(d=>{let x=d.data();return col('surveyDates').add({surveyId:newId,label:x.label,sort:x.sort||0,active:x.active!==false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
  if(opts.restaurants)jobs.push(...sourceRestaurants.docs.map(d=>{let x=d.data();return col('restaurants').add({...x,surveyId:newId,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}));
  if(opts.budget)jobs.push(...sourceBudget.docs.map(d=>{let x=d.data();return doc('budgetEligibility',newId+'__'+x.memberId).set({...x,surveyId:newId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
  if(opts.access)jobs.push(...sourceManagers.docs.map(d=>{let x=d.data();return doc('surveyManagers',newId+'__'+x.email).set({surveyId:newId,email:x.email,role:x.role||'viewer',enabled:x.enabled!==false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}));
  await Promise.all(jobs);activeSurveyId=newId;await loadAll();await loadSurveyData();history.replaceState(null,'',adminHash());renderFront();renderAdmin();if(typeof writeAuditV711==='function')await writeAuditV711('複製','活動',newId,'由「'+(source.title||sourceId)+'」複製建立「'+newTitle+'」',newId);toast('活動複本已建立');
}

function installRestaurantNoteV719(){let cuisine=newCuisine?.closest('.field');if(!cuisine||document.getElementById('newRestOpsNote'))return;cuisine.insertAdjacentHTML('afterend','<div class="field restaurantOpsNoteField"><label for="newRestOpsNote">內部作業備註（不顯示於前台）</label><textarea id="newRestOpsNote" rows="3" placeholder="例如：已詢問包廂、訂位聯絡人、最低消費、菜單確認進度"></textarea></div>')}
const renderRestPanelV719=renderRestPanel;renderRestPanel=function(){installRestaurantNoteV719();restTable.innerHTML=table(['餐廳','地址','Google Map','類型','計價方式','價格設定','內部作業備註','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td class="alignCenter">${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':'—'}</td><td>${esc(r.description||r.cuisine||'')}</td><td class="alignCenter"><span class="badge blue">${esc(pricingModeLabelV712(pricingModeV712(r)))}</span></td><td>${esc(pricingSummaryV712(r))}</td><td class="restaurantOpsCell">${esc(r.internalNote||r.opsNote||'—')}</td><td class="alignCenter">${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant('${r.id}')">編輯</button> <button class="btn red" onclick="delDoc('restaurants','${r.id}')">刪除</button></td></tr>`))};
const editRestaurantV719=editRestaurant;editRestaurant=function(id){editRestaurantV719(id);installRestaurantNoteV719();let r=D.restaurants.find(x=>x.id===id),n=document.getElementById('newRestOpsNote');if(n)n.value=r?.internalNote||r?.opsNote||''};
const cancelRestaurantEditV719=cancelRestaurantEdit;cancelRestaurantEdit=function(render=true){cancelRestaurantEditV719(render);let n=document.getElementById('newRestOpsNote');if(n)n.value=''};
const saveRestaurantV719=saveRestaurant;saveRestaurant=async function(){let note=document.getElementById('newRestOpsNote')?.value.trim()||'',id=editingRestaurantId,name=newRest.value.trim();await saveRestaurantV719();let target=id||D.restaurants.find(r=>r.name===name)?.id;if(target){await doc('restaurants',target).set({internalNote:note,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadSurveyData();renderAdmin()}};

const renderSystemMemberPanelV719=renderSystemMemberPanel;renderSystemMemberPanel=function(){let current=document.getElementById('sysMemberDeptFilter')?.value||'',all=D.members;if(current)D.members=all.filter(m=>(m.department||m.departmentName||'')===current);renderSystemMemberPanelV719();D.members=all;let box=document.getElementById('sysMemberTable')||document.getElementById('sysMembersBox');if(box&&!document.getElementById('sysMemberDeptFilter')){let departments=[...new Set(all.map(m=>m.department||m.departmentName).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'zh-Hant'));box.insertAdjacentHTML('beforebegin','<div class="inlineFilterBar"><label for="sysMemberDeptFilter">部門篩選</label><select id="sysMemberDeptFilter" onchange="renderSystemMemberPanel()"><option value="">全部部門</option>'+departments.map(d=>'<option value="'+escAttr(d)+'">'+esc(d)+'</option>').join('')+'</select></div>');document.getElementById('sysMemberDeptFilter').value=current}};

const renderFrontV719=renderFront;renderFront=function(){renderFrontV719();applyFrontSecurityV719(securitySettingsV719(activeSurvey()));document.body.classList.add('frontReady');let p=document.getElementById('previewAdminUser');if(p)p.textContent=memberLabelV719()};
const renderAdminV719=renderAdmin;renderAdmin=function(){renderAdminV719();if(adminUser)adminUser.textContent=memberLabelV719();ensureSecuritySettingsV719();syncSecuritySettingsV719();applyArchiveButtonsV719();installRestaurantNoteV719()};

// ===== v7.21：顯示細節、紀錄分頁與主題選單補強 =====
function memberLabelV721ByEmail(email,fallback=''){
  email=normalizeEmail(email);
  let account=D.memberAccounts?.find(a=>normalizeEmail(a.email)===email);
  let member=account?D.members.find(m=>m.id===account.memberId):D.members.find(m=>normalizeEmail(m.googleEmail||m.email)===email);
  let label=memberDisplayName(member);
  return label||String(fallback||email||'').trim();
}
function applySurveyTablePolishV721(){
  document.querySelectorAll('#surveyTable tbody tr').forEach(row=>{
    if(row.cells[2])row.cells[2].classList.add('surveyTimeCell');
    let ops=row.querySelector('.operationCell');
    if(!ops)return;
    ops.classList.add('surveyOperationCell');
    let setCurrent=[...ops.querySelectorAll('button')].find(btn=>btn.textContent.trim()==='設為目前');
    if(setCurrent)ops.appendChild(setCurrent);
  });
}
function placeSystemMemberFilterV721(){
  let filter=document.getElementById('sysMemberDeptFilter')?.closest('.inlineFilterBar');
  let tableBox=document.getElementById('sysMemberTable')||document.getElementById('sysMembersBox');
  if(!filter||!tableBox)return;
  filter.classList.add('sysMemberFilterBar');
  let tableEl=tableBox.querySelector('.table');
  if(tableEl){
    if(filter.parentElement!==tableBox||filter.nextElementSibling!==tableEl)tableBox.insertBefore(filter,tableEl);
  }else if(filter.parentElement!==tableBox){
    tableBox.appendChild(filter);
  }
}
function applyAccessPanelPolishV721(){
  let box=document.getElementById('securitySettingsBox');
  if(!box)return;
  box.classList.add('securitySettingsBoxV721');
  box.querySelectorAll('.checkLine').forEach(line=>line.classList.add('securityOptionV721'));
}
let logPageV721=1;
const LOG_PAGE_SIZE_V721=12;
function renderLogsV721(){
  let box=document.getElementById('logTable');
  if(!box)return;
  let type=document.getElementById('logTypeFilter')?.value||'audit';
  if(type==='login'&&!isSystemAdmin){
    document.getElementById('logTypeFilter').value='audit';
    type='audit';
  }
  let rows=filteredLogsV711();
  let pages=Math.max(1,Math.ceil(rows.length/LOG_PAGE_SIZE_V721));
  logPageV721=Math.min(Math.max(1,logPageV721),pages);
  let start=(logPageV721-1)*LOG_PAGE_SIZE_V721;
  let pageRows=rows.slice(start,start+LOG_PAGE_SIZE_V721);
  let html=type==='login'
    ?table(['時間','帳號／姓名','結果','身分','說明'],pageRows.map(x=>{
      let name=memberLabelV721ByEmail(x.email,x.displayName);
      return '<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(name)+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>';
    }))
    :table(['時間','操作者','活動','功能／動作','內容'],pageRows.map(x=>{
      let name=memberLabelV721ByEmail(x.actorEmail,x.actorName);
      return '<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(name)+'</b><br><small>'+esc(x.actorEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'</td></tr>';
    }));
  box.innerHTML=html+'<div class="logPager"><span>共 '+rows.length+' 筆，第 '+logPageV721+' / '+pages+' 頁</span><div><button class="btn logPrevPage" '+(logPageV721<=1?'disabled':'')+'>上一頁</button><button class="btn logNextPage" '+(logPageV721>=pages?'disabled':'')+'>下一頁</button></div></div>';
  box.querySelector('.logPrevPage')?.addEventListener('click',()=>{if(logPageV721>1){logPageV721--;renderLogsV711()}});
  box.querySelector('.logNextPage')?.addEventListener('click',()=>{if(logPageV721<pages){logPageV721++;renderLogsV711()}});
}
renderLogsV711=renderLogsV721;
const writeAuditV711Base=writeAuditV711;
writeAuditV711=async function(action,targetType,targetId,summary,surveyId=activeSurveyId){
  if(!currentUser||!db)return;
  try{await col('surveyAuditLogs').add({surveyId:surveyId||'',action,targetType,targetId:targetId||'',summary:summary||'',actorUid:currentUser.uid,actorEmail:String(currentUser.email||'').toLowerCase(),actorName:currentUserDisplayText(),actorRole:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}
  catch(e){console.warn('操作紀錄寫入失敗',e)}
};
writeLoginV711=async function(result,reason=''){
  if(!currentUser||!db)return;
  try{await col('surveyLoginLogs').add({uid:currentUser.uid,email:String(currentUser.email||'').toLowerCase(),displayName:currentUserDisplayText(),result,reason,role:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}
  catch(e){console.warn('登入紀錄寫入失敗',e)}
};
const renderSurveyPanelV721=renderSurveyPanel;
renderSurveyPanel=function(){renderSurveyPanelV721();applySurveyTablePolishV721()};
const renderSystemMemberPanelV721=renderSystemMemberPanel;
renderSystemMemberPanel=function(){renderSystemMemberPanelV721();placeSystemMemberFilterV721()};
const renderAdminV721=renderAdmin;
renderAdmin=function(){
  renderAdminV721();
  if(adminUser)adminUser.textContent=currentUserDisplayText()||memberLabelV719();
  applySurveyTablePolishV721();
  placeSystemMemberFilterV721();
  applyAccessPanelPolishV721();
};
const renderFrontV721=renderFront;
renderFront=function(){
  renderFrontV721();
  let p=document.getElementById('previewAdminUser');
  if(p)p.textContent=currentUserDisplayText()||memberLabelV719();
};

// ===== v7.24：店家資訊、日期輸入、服務費與預算位置優化 =====
function restaurantInfoUrlV724(r){return safeUrl(r?.infoUrl||'')}
function installRestaurantInfoUrlV724(){
  let mapField=newMap?.closest('.field');
  if(!mapField||document.getElementById('newInfoUrl'))return;
  mapField.insertAdjacentHTML('afterend','<div class="field"><label for="newInfoUrl">店家資訊網址</label><input id="newInfoUrl" placeholder="例如：官網、菜單、FB、訂位頁"></div>');
}
function installDatePickerV724(){
  if(!newDate||document.getElementById('newDatePickerV724'))return;
  let field=newDate.closest('div')||newDate.closest('.field');
  let row=field?.parentElement;
  if(!field||!row)return;
  field.classList.add('dateGeneratedFieldV736','dateSourceFieldV755');
  row.classList.add('dateEntryRowV736');
  let pickerBox=document.createElement('div');
  pickerBox.className='dateAutoBox';
  pickerBox.innerHTML='<label for="newDatePickerV724">日期選擇器</label><input id="newDatePickerV724" type="date">';
  let suffixBox=document.createElement('div');
  suffixBox.className='dateAutoBox';
  suffixBox.innerHTML='<label for="newDateSuffixV724">補充文字（選填）</label><input id="newDateSuffixV724" placeholder="例如：晚上、午餐">';
  let hint=document.createElement('small');
  hint.className='muted dateAutoHintV736';
  hint.textContent='系統會自動產生 06/28(日)；若需加註「晚上、午餐」等文字，請填寫補充文字。';
  row.insertBefore(pickerBox,field);
  row.insertBefore(suffixBox,field);
  row.appendChild(hint);
  newDate.placeholder='例如：06/28(日) 晚上，也可自行覆寫';
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  picker.addEventListener('change',syncDateLabelV724);
  suffix.addEventListener('input',syncDateLabelV724);
}
function weekdayLabelV724(dateText){
  let d=new Date(dateText+'T00:00:00');
  return Number.isNaN(d.getTime())?'':'日一二三四五六'[d.getDay()];
}
function syncDateLabelV724(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value)return;
  let [,m,d]=picker.value.match(/^(\d{4})-(\d{2})-(\d{2})$/)||[];
  let w=weekdayLabelV724(picker.value);
  if(!m||!d||!w)return;
  newDate.value=String(m).padStart(2,'0')+'/'+String(d).padStart(2,'0')+'（'+w+'）'+(suffix?.value.trim()?(' '+suffix.value.trim()):'');
}
function fillDatePickerFromLabelV724(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let m=String(label||'').match(/^(\d{1,2})\/(\d{1,2})（[日一二三四五六]）\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+String(m[1]).padStart(2,'0')+'-'+String(m[2]).padStart(2,'0');
    suffix.value=m[3]||'';
  }
}
function installSurveyBudgetBoxV724(){
  if(!surveyEditor||document.getElementById('surveyBudgetBoxV724'))return;
  let deptField=targetDeptBox?.closest('.field');
  if(!deptField)return;
  deptField.insertAdjacentHTML('beforebegin','<div id="surveyBudgetBoxV724" class="budgetSettingBox surveyBudgetBox"><div><label for="budgetPerPersonMirrorV724">每人預算</label><input id="budgetPerPersonMirrorV724" type="number" min="0" step="1" placeholder="例如：1200"></div><button class="btn primary" type="button" onclick="saveBudgetFromSurveyV724()">儲存預算</button><small class="muted">此設定屬於活動層級；人員設定只控制是否納入預算。</small></div>');
  let mirror=document.getElementById('budgetPerPersonMirrorV724');
  mirror.addEventListener('input',()=>{if(budgetPerPerson)budgetPerPerson.value=mirror.value});
}
function syncBudgetMirrorV724(){
  let mirror=document.getElementById('budgetPerPersonMirrorV724');
  if(mirror)mirror.value=activityBudgetPerPerson()??'';
}
async function saveBudgetFromSurveyV724(){
  let mirror=document.getElementById('budgetPerPersonMirrorV724');
  if(budgetPerPerson&&mirror)budgetPerPerson.value=mirror.value;
  await saveBudgetSetting();
}
function serviceFeePerPersonV724(rest){
  let price=moneyValue(rest?.price),rate=Math.min(100,numericV712(rest?.serviceRate,0));
  return price===null?0:Math.round(price*rate/100);
}
restaurantCostV712=function(rest,attendanceCount){
  if(!rest)return{mode:'perPerson',price:null,tableSeats:10,minTables:0,tables:0,subtotal:null,serviceRate:0,serviceFee:0,serviceFeePerPerson:0,fixedFee:0,total:null,effectivePerPerson:null};
  let mode=pricingModeV712(rest),price=moneyValue(rest.price),count=Math.max(0,Number(attendanceCount||0)),tableSeats=Math.max(1,Math.floor(numericV712(rest.tableSeats,10))),minTables=Math.max(0,Math.floor(numericV712(rest.minTables,0))),tables=mode==='perTable'?Math.max(minTables,Math.ceil(count/tableSeats)):0,subtotal=null,serviceRate=Math.min(100,numericV712(rest.serviceRate,0)),serviceFeePerPerson=0,serviceFee=0;
  if(price!==null){
    if(mode==='perTable')subtotal=price*tables;
    else if(mode==='fixed')subtotal=price;
    else subtotal=price*count;
  }
  if(subtotal!==null){
    if(mode==='perPerson'){serviceFeePerPerson=serviceFeePerPersonV724(rest);serviceFee=serviceFeePerPerson*count}
    else serviceFee=Math.round(subtotal*serviceRate/100);
  }
  let fixedFee=numericV712(rest.fixedFee,0),total=subtotal===null?null:subtotal+serviceFee+fixedFee;
  return{mode,price,tableSeats,minTables,tables,subtotal,serviceRate,serviceFee,serviceFeePerPerson,fixedFee,total,effectivePerPerson:total!==null&&count?total/count:null};
};
const costEstimateSectionV724Base=costEstimateSectionV712;
costEstimateSectionV712=function(dateId,restaurantId,contextTitle='費用試算'){
  let html=costEstimateSectionV724Base(dateId,restaurantId,contextTitle),rest=D.restaurants.find(r=>r.id===restaurantId),date=D.dates.find(d=>d.id===dateId);
  if(!rest||!date||pricingModeV712(rest)!=='perPerson'||!numericV712(rest.serviceRate,0))return html;
  let cost=restaurantCostV712(rest,attendeeResponsesForDate(dateId).length);
  return html.replace('<div><span>服務費</span><strong>'+esc(moneyText(cost.serviceFee))+' 元</strong></div>','<div><span>每人服務費</span><strong>'+esc(moneyText(cost.serviceFeePerPerson))+' 元／人</strong></div><div><span>服務費小計</span><strong>'+esc(moneyText(cost.serviceFee))+' 元</strong></div>');
};
buildCostEstimateHtml=costEstimateSectionV712;
const renderRestPanelV724Base=renderRestPanel;
renderRestPanel=function(){
  installRestaurantInfoUrlV724();
  restTable.innerHTML=table(['餐廳','地址','Google Map','店家資訊','類型','計價方式','價格設定','內部作業備註','排序','操作'],D.restaurants.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.address||'')}</td><td class="alignCenter">${safeUrl(r.googleMap||r.mapUrl)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(safeUrl(r.googleMap||r.mapUrl))+'">開啟</a>':'—'}</td><td class="alignCenter">${restaurantInfoUrlV724(r)?'<a target="_blank" rel="noopener noreferrer" href="'+escAttr(restaurantInfoUrlV724(r))+'">開啟</a>':'—'}</td><td>${esc(r.description||r.cuisine||'')}</td><td class="alignCenter"><span class="badge blue">${esc(pricingModeLabelV712(pricingModeV712(r)))}</span></td><td>${esc(pricingSummaryV712(r))}</td><td class="restaurantOpsCell">${esc(r.internalNote||r.opsNote||'—')}</td><td class="alignCenter">${r.sort??''}</td><td class="operationCell"><button class="btn" onclick="editRestaurant('${r.id}')">編輯</button> <button class="btn red" onclick="delDoc('restaurants','${r.id}')">刪除</button></td></tr>`));
};
const editRestaurantV724Base=editRestaurant;
editRestaurant=function(id){
  editRestaurantV724Base(id);installRestaurantInfoUrlV724();
  let r=D.restaurants.find(x=>x.id===id),input=document.getElementById('newInfoUrl');
  if(input)input.value=r?.infoUrl||'';
};
const cancelRestaurantEditV724Base=cancelRestaurantEdit;
cancelRestaurantEdit=function(render=true){cancelRestaurantEditV724Base(render);let input=document.getElementById('newInfoUrl');if(input)input.value=''};
const saveRestaurantV724Base=saveRestaurant;
saveRestaurant=async function(){
  let infoUrl=document.getElementById('newInfoUrl')?.value.trim()||'',id=editingRestaurantId,name=newRest.value.trim();
  if(infoUrl&&!safeUrl(infoUrl))return alert('店家資訊網址格式不正確，請輸入 http 或 https 網址');
  await saveRestaurantV724Base();
  let target=id||D.restaurants.find(r=>r.name===name)?.id;
  if(target){await doc('restaurants',target).set({infoUrl,storeInfoUrl:firebase.firestore.FieldValue.delete(),websiteUrl:firebase.firestore.FieldValue.delete(),officialUrl:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadSurveyData();renderAdmin();renderFront()}
};
const renderDatePanelV724Base=renderDatePanel;
renderDatePanel=function(){installDatePickerV724();renderDatePanelV724Base()};
const editDateV724Base=editDate;
editDate=function(id){installDatePickerV724();editDateV724Base(id);fillDatePickerFromLabelV724(newDate.value)};
const cancelDateEditV724Base=cancelDateEdit;
cancelDateEdit=function(render=true){cancelDateEditV724Base(render);let p=document.getElementById('newDatePickerV724'),s=document.getElementById('newDateSuffixV724');if(p)p.value='';if(s)s.value=''};
const enhanceDateStatsV724Base=enhanceDateStatsV711;
enhanceDateStatsV711=function(){enhanceDateStatsV724Base();document.querySelectorAll('.dateAttendanceGroups details').forEach(d=>d.removeAttribute('open'))};
const renderAdminV724Base=renderAdmin;
renderAdmin=function(){renderAdminV724Base();installRestaurantInfoUrlV724();installDatePickerV724();installSurveyBudgetBoxV724();syncBudgetMirrorV724()};


function fillSurveyForm(survey){
  const s=survey||{};
  if(svTitle)svTitle.value=s.title||'';
  if(typeof setRichDescription==='function')setRichDescription(s);else if(svDesc)svDesc.value=s.description||'';
  if(svInstructions)svInstructions.value=s.frontInstructions||'';
  const deadlineParts=typeof splitDeadline==='function'?splitDeadline(s.deadline):{date:'',time:'23:59'};
  if(svDeadline)svDeadline.value=deadlineParts.date||'';
  if(svDeadlineTime)svDeadlineTime.value=deadlineParts.time||'23:59';
  if(svStatus)svStatus.value=s.status||'open';
  if(svAllowEdit)svAllowEdit.value=String(s.allowEdit!==false);
  if(typeof ensureThemeControl==='function')ensureThemeControl();
  if(typeof setThemeEditorValueV760==='function')setThemeEditorValueV760(typeof surveyThemeValueV760==='function'?surveyThemeValueV760(s):(s.theme||'classic'));
  else if(typeof themeSelect==='function'&&themeSelect())themeSelect().value=typeof normalizeTheme==='function'?normalizeTheme(s.theme||'classic'):(s.theme||'classic');
  document.querySelectorAll('.targetDept').forEach(cb=>{cb.checked=Array.isArray(s.targetDepartments)&&s.targetDepartments.includes(cb.value)});
  if(typeof syncOpenScheduleV711==='function'&&document.getElementById('svOpenMode'))syncOpenScheduleV711();
  if(typeof updateSurveyDirtyState==='function'){surveyFormDirty=false;updateSurveyDirtyState();}
}

// ===== v7.25：日期管理精簡、預算欄位定位與主題預覽修正 =====
function hideMemberBudgetBoxV725(){
  let box=budgetPerPerson?.closest('.budgetSettingBox');
  if(box)box.hidden=true;
}
function installDatePickerV725(){
  installDatePickerV724();
  if(!newDate)return;
  let field=newDate.closest('div')||newDate.closest('.field');
  let originalLabel=field?[...field.children].find(x=>x.tagName==='LABEL'&&x.getAttribute('for')!=='newDatePickerV724'&&x.getAttribute('for')!=='newDateSuffixV724'):null;
  originalLabel?.classList.add('generatedDateLabelV725');
  newDate.classList.add('generatedDateInputV725');
  newDate.readOnly=true;
  newDate.tabIndex=-1;
  newDate.setAttribute('aria-label','系統自動產生日期文字');
}
function requireDatePickerV725(){
  let picker=document.getElementById('newDatePickerV724');
  if(picker?.value)syncDateLabelV724();
  if(!newDate.value.trim()){picker?.focus();return false}
  return true;
}
const saveDateV725Base=saveDate;
saveDate=async function(){if(!requireDatePickerV725())return alert('請先選擇日期');return saveDateV725Base()};
const renderDatePanelV725Base=renderDatePanel;
renderDatePanel=function(){installDatePickerV725();renderDatePanelV725Base()};
const editDateV725Base=editDate;
editDate=function(id){installDatePickerV725();editDateV725Base(id);let d=D.dates.find(x=>x.id===id);fillDatePickerFromLabelV724(d?.label||'')};
function normalizeRestaurantLinkAreaV725(){
  document.querySelectorAll('.restLinks').forEach(box=>{if(!box.textContent.trim())box.remove()});
}
const renderFrontV725Base=renderFront;
renderFront=function(){renderFrontV725Base();normalizeRestaurantLinkAreaV725()};
function renderThemePreviewV725(){
  let preview=document.getElementById('themePreview'),select=document.getElementById('svTheme');
  if(!preview||!select)return;
  syncThemeOptions(select.value);
  let theme=normalizeTheme(select.value);
  preview.dataset.theme=theme;
  preview.innerHTML='<div class="themePreviewBar"><span>'+FRONT_THEMES[theme]+'</span><span class="themePreviewDeadline">截止時間</span></div><div class="themePreviewBody"><span>前台頁面背景</span><span class="themePreviewStatus">問卷開放中</span></div>';
}
const ensureThemeControlV725Base=ensureThemeControl;
ensureThemeControl=function(){ensureThemeControlV725Base();let select=document.getElementById('svTheme');if(select&&!select.dataset.v725){select.dataset.v725='true';select.addEventListener('change',renderThemePreviewV725)}renderThemePreviewV725()};
const fillSurveyFormV725Base=fillSurveyForm;
fillSurveyForm=function(s){fillSurveyFormV725Base(s);syncThemeOptions(s?.theme||'classic');renderThemePreviewV725();syncBudgetMirrorV724()};
const renderAdminV725Base=renderAdmin;
renderAdmin=function(){renderAdminV725Base();hideMemberBudgetBoxV725();installDatePickerV725();renderThemePreviewV725();syncBudgetMirrorV724()};

// ===== v7.26：預算欄位、店家資訊與日期格式修正 =====
function pad2V726(value){return String(value).padStart(2,'0')}
function weekdayFromDateValueV726(value){
  let parts=String(value||'').split('-').map(Number);
  if(parts.length!==3||parts.some(n=>!Number.isFinite(n)))return '';
  let d=new Date(parts[0],parts[1]-1,parts[2]);
  return Number.isNaN(d.getTime())?'':'日一二三四五六'[d.getDay()];
}
syncDateLabelV724=function(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value||!newDate)return;
  let parts=picker.value.split('-');
  if(parts.length!==3)return;
  let w=weekdayFromDateValueV726(picker.value);
  if(!w)return;
  newDate.value=pad2V726(parts[1])+'/'+pad2V726(parts[2])+'（'+w+'）'+(suffix?.value.trim()?(' '+suffix.value.trim()):'');
};
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let text=String(label||'').trim();
  let m=text.match(/^(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+pad2V726(m[1])+'-'+pad2V726(m[2]);
    suffix.value=m[3]||'';
  }
};

// ===== v7.27：safeUrl 空值與日期選擇器事件修正 =====
function rebindDatePickerEventsV727(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||picker.dataset.v727==='true')return;
  let pickerValue=picker.value,suffixValue=suffix?.value||'';
  let nextPicker=picker.cloneNode(true);
  nextPicker.value=pickerValue;
  nextPicker.dataset.v727='true';
  picker.replaceWith(nextPicker);
  let nextSuffix=suffix;
  if(suffix){
    nextSuffix=suffix.cloneNode(true);
    nextSuffix.value=suffixValue;
    nextSuffix.dataset.v727='true';
    suffix.replaceWith(nextSuffix);
  }
  let update=()=>syncDateLabelV724();
  nextPicker.addEventListener('change',update);
  nextPicker.addEventListener('input',update);
  nextSuffix?.addEventListener('input',update);
}
const installDatePickerV727Base=installDatePickerV725;
installDatePickerV725=function(){installDatePickerV727Base();rebindDatePickerEventsV727()};
const renderDatePanelV727Base=renderDatePanel;
renderDatePanel=function(){renderDatePanelV727Base();rebindDatePickerEventsV727()};
const editDateV727Base=editDate;
editDate=function(id){editDateV727Base(id);rebindDatePickerEventsV727();syncDateLabelV724()};
const saveDateV727Base=saveDate;
saveDate=async function(){syncDateLabelV724();return saveDateV727Base()};

// ===== v7.28：日期儲存強制以 date picker 為準，並改用半形括弧 =====
function formatDateLabelV728(value,suffix=''){
  let parts=String(value||'').split('-');
  if(parts.length!==3)return '';
  let y=Number(parts[0]),m=Number(parts[1]),d=Number(parts[2]);
  if(!Number.isFinite(y)||!Number.isFinite(m)||!Number.isFinite(d))return '';
  let date=new Date(y,m-1,d);
  if(Number.isNaN(date.getTime())||date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return '';
  let w='日一二三四五六'[date.getDay()];
  return pad2V726(m)+'/'+pad2V726(d)+'('+w+')'+(String(suffix||'').trim()?(' '+String(suffix).trim()):'');
}
function syncDateLabelV728(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker?.value||!newDate)return '';
  let label=formatDateLabelV728(picker.value,suffix?.value||'');
  if(label)newDate.value=label;
  return label;
}
syncDateLabelV724=syncDateLabelV728;
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let text=String(label||'').trim();
  let m=text.match(/^(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
  if(m){
    let y=new Date().getFullYear();
    picker.value=y+'-'+pad2V726(m[1])+'-'+pad2V726(m[2]);
    suffix.value=m[3]||'';
    syncDateLabelV728();
  }
};
const saveDateV728Base=saveDate;
saveDate=async function(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  let label=picker?.value?formatDateLabelV728(picker.value,suffix?.value||''):'';
  if(!label)return alert('請先選擇日期');
  newDate.value=label;
  return saveDateV728Base();
};

// ===== v7.29：統一日期格式正規化，支援 - / 全半形括弧與舊資料 =====
function normalizeDatePartsV729(value){
  let raw=String(value||'').trim();
  if(!raw)return null;
  raw=raw.replace(/[年月]/g,'/').replace(/[日號]/g,'').replace(/[．.]/g,'/').replace(/-/g,'/').replace(/\s+/g,' ');
  let matches=[...raw.matchAll(/\d{1,4}/g)].map(x=>x[0]);
  if(matches.length>=3){
    let first=Number(matches[0]),second=Number(matches[1]),third=Number(matches[2]);
    if(matches[0].length===4||first>31)return {year:first,month:second,day:third};
    return {year:new Date().getFullYear(),month:first,day:second};
  }
  if(matches.length>=2)return {year:new Date().getFullYear(),month:Number(matches[0]),day:Number(matches[1])};
  return null;
}
function normalizeDateLabelV729(value,suffix=''){
  let parts=normalizeDatePartsV729(value);
  if(!parts)return '';
  let {year,month,day}=parts;
  if(!Number.isFinite(year)||!Number.isFinite(month)||!Number.isFinite(day))return '';
  let date=new Date(year,month-1,day);
  if(Number.isNaN(date.getTime())||date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day)return '';
  let w='日一二三四五六'[date.getDay()];
  return pad2V726(month)+'/'+pad2V726(day)+'('+w+')'+(String(suffix||'').trim()?(' '+String(suffix).trim()):'');
}
function syncDateLabelV729(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  let source=picker?.value||newDate?.value||'';
  let label=normalizeDateLabelV729(source,suffix?.value||'');
  if(label&&newDate)newDate.value=label;
  return label;
}
syncDateLabelV724=syncDateLabelV729;
fillDatePickerFromLabelV724=function(label){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(!picker||!suffix)return;
  picker.value='';suffix.value='';
  let parts=normalizeDatePartsV729(label);
  if(parts){
    picker.value=parts.year+'-'+pad2V726(parts.month)+'-'+pad2V726(parts.day);
    let normalizedNoSuffix=normalizeDateLabelV729(label,'');
    let raw=String(label||'').trim();
    suffix.value=raw.replace(normalizedNoSuffix,'').replace(normalizedNoSuffix.replace('(','（').replace(')','）'),'').trim();
    syncDateLabelV729();
  }
};
const saveDateV729Base=saveDate;
saveDate=async function(){
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  let label=normalizeDateLabelV729(picker?.value||newDate?.value||'',suffix?.value||'');
  if(!label)return alert('請先選擇日期');
  newDate.value=label;
  return saveDateV729Base();
};

// ===== v7.30：完全重寫日期儲存，不再呼叫舊版 saveDate 鏈 =====
function datePickerValueV730(){
  let picker=document.getElementById('newDatePickerV724')||document.querySelector('#dateP input[type="date"]')||document.querySelector('input[type="date"]');
  return String(picker?.value||'').trim();
}
function normalizedDateLabelForSaveV730(){
  let pickerValue=datePickerValueV730();
  let suffix=document.getElementById('newDateSuffixV724')?.value||'';
  let candidates=[pickerValue,newDate?.value||''].filter(Boolean);
  for(let value of candidates){
    let label=normalizeDateLabelV729(value,suffix);
    if(label)return {label,source:value};
  }
  return {label:'',source:pickerValue||newDate?.value||''};
}
saveDate=async function(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  let {label,source}=normalizedDateLabelForSaveV730();
  if(!label){
    let picker=document.getElementById('newDatePickerV724')||document.querySelector('#dateP input[type="date"]');
    picker?.focus();
    return alert('請先選擇日期');
  }
  if(newDate)newDate.value=label;
  let isEdit=!!editingDateId;
  let targetId=editingDateId;
  let before=isEdit?D.dates.find(x=>x.id===targetId):null;
  let data={
    surveyId:activeSurveyId,
    label,
    rawDateSource:source,
    sort:Number(newDateSort?.value||0),
    active:true,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  dateSaveBtn.disabled=true;
  dateSaveBtn.textContent='儲存中…';
  try{
    if(isEdit){
      await doc('surveyDates',targetId).set(data,{merge:true});
    }else{
      data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
      let ref=await col('surveyDates').add(data);
      targetId=ref.id;
    }
    cancelDateEdit(false);
    await loadSurveyData();
    renderFront();
    renderAdmin();
    if(typeof writeAuditV711==='function'){
      await writeAuditV711(isEdit?'修改':'新增','日期',targetId,(isEdit?'修改日期「':'新增日期「')+label+'」');
    }
    toast(isEdit?'日期變更已儲存':'日期已新增');
  }catch(e){
    console.error('save date failed',e);
    alert('日期儲存失敗，請檢查網路後再試一次');
  }finally{
    dateSaveBtn.disabled=false;
    dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期';
  }
};

// ===== v7.31：日期儲存按鈕直連新版函式，避開舊 saveDate 名稱 =====
function bindDateSaveButtonV731(){
  if(!dateSaveBtn)return;
  dateSaveBtn.onclick=event=>{
    event?.preventDefault?.();
    return saveDateV731Direct();
  };
  dateSaveBtn.setAttribute('data-date-save-version','v7.31');
}
async function saveDateV731Direct(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  let picker=document.getElementById('newDatePickerV724')||document.querySelector('#dateP input[type="date"]')||document.querySelector('input[type="date"]');
  let suffix=document.getElementById('newDateSuffixV724')?.value||'';
  let source=String(picker?.value||newDate?.value||'').trim();
  let label=normalizeDateLabelV729(source,suffix);
  if(!label){
    picker?.focus();
    return alert('請先選擇日期');
  }
  if(newDate)newDate.value=label;
  let isEdit=!!editingDateId;
  let targetId=editingDateId;
  let data={
    surveyId:activeSurveyId,
    label,
    rawDateSource:source,
    dateSaveVersion:'v7.31',
    sort:Number(newDateSort?.value||0),
    active:true,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  dateSaveBtn.disabled=true;
  dateSaveBtn.textContent='儲存中…';
  try{
    if(isEdit){
      await doc('surveyDates',targetId).set(data,{merge:true});
    }else{
      data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
      let ref=await col('surveyDates').add(data);
      targetId=ref.id;
    }
    cancelDateEdit(false);
    await loadSurveyData();
    renderFront();
    renderAdmin();
    if(typeof writeAuditV711==='function'){
      await writeAuditV711(isEdit?'修改':'新增','日期',targetId,(isEdit?'修改日期「':'新增日期「')+label+'」');
    }
    toast(isEdit?'日期變更已儲存':'日期已新增');
  }catch(e){
    console.error('save date v7.31 failed',e);
    alert('日期儲存失敗，請檢查網路後再試一次');
  }finally{
    dateSaveBtn.disabled=false;
    dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期';
    bindDateSaveButtonV731();
  }
}
window.saveDateV731Direct=saveDateV731Direct;
const renderDatePanelV731Base=renderDatePanel;
renderDatePanel=function(){renderDatePanelV731Base();bindDateSaveButtonV731()};
const renderAdminV731Base=renderAdmin;
renderAdmin=function(){renderAdminV731Base();bindDateSaveButtonV731()};

// ===== v7.60：程式整理穩定版（單一接管層） =====
const APP_VERSION_V760='v7.60';

function clonePlainV760(value){
  if(value===undefined)return undefined;
  if(value===null)return null;
  if(value?.toDate)return value.toDate().toISOString();
  if(value?.seconds!==undefined&&value?.nanoseconds!==undefined)return new Date(value.seconds*1000).toISOString();
  if(Array.isArray(value))return value.map(clonePlainV760);
  if(typeof value==='object'){
    if(value.constructor&&value.constructor.name&&value.constructor.name!=='Object')return String(value);
    let out={};
    Object.keys(value).sort().forEach(k=>{
      if(typeof value[k]==='function')return;
      let v=clonePlainV760(value[k]);
      if(v!==undefined)out[k]=v;
    });
    return out;
  }
  return value;
}
function auditSanitizeV760(value){
  let cleaned=clonePlainV760(value||{});
  if(cleaned&&typeof cleaned==='object'){
    delete cleaned.createdAt;delete cleaned.updatedAt;delete cleaned.openAtTimestamp;delete cleaned.deadlineAtTimestamp;
  }
  return cleaned||{};
}
async function auditReadDocV760(collection,id){
  if(!id)return null;
  try{let snap=await doc(collection,id).get();return snap.exists?{id:snap.id,...snap.data()}:null}catch(e){console.warn('[AUDIT] read failed',collection,id,e);return null}
}
let auditMuteDepthV760=0;
async function runAuditMutedV760(fn){
  auditMuteDepthV760++;
  try{return await fn()}finally{auditMuteDepthV760=Math.max(0,auditMuteDepthV760-1)}
}
const auditFieldLabelsV760={
  title:'活動名稱',description:'說明文字',descriptionHtml:'說明格式',frontInstructions:'填寫說明',deadline:'截止時間',openMode:'開放方式',openAt:'指定開放時間',status:'活動狀態',allowEdit:'允許修改',theme:'前台主題',targetDepartments:'參與部門',budgetPerPerson:'每人預算',
  label:'日期',sort:'排序',active:'狀態',rawDateSource:'日期來源',
  name:'名稱',address:'地址',googleMap:'Google 地圖',mapUrl:'Google 地圖',infoUrl:'店家資訊網址',descriptionRest:'類型',description:'類型',pricingMode:'計價方式',price:'價格',tableSeats:'每桌人數',minTables:'最低桌數',serviceRate:'服務費率',fixedFee:'固定費用',internalNote:'內部作業備註',
  department:'部門',departmentName:'部門',employeeNo:'員工編號',empNo:'員工編號',googleEmail:'Google 帳號',email:'Google 帳號',canFill:'填寫資格',budgetEligible:'預算資格',
  role:'權限',enabled:'狀態',finalDateId:'最終日期',finalRestaurantId:'最終餐廳',locked:'前台顯示',note:'備註'
};
function auditValueV760(key,value){
  if(value===undefined)return '未設定';
  if(value===null||value==='')return '空白';
  if(Array.isArray(value))return value.length?value.join('、'):'空白';
  if(key==='theme')return FRONT_THEMES[value]||value;
  if(key==='pricingMode')return typeof pricingModeLabelV712==='function'?pricingModeLabelV712(value):value;
  if(['price','fixedFee','budgetPerPerson'].includes(key)){let n=moneyValue(value);return n===null?'空白':moneyText(n)+' 元'}
  if(key==='serviceRate')return Number(value||0)+'%';
  if(key==='allowEdit'||key==='active'||key==='enabled'||key==='locked'||key==='canFill'||key==='budgetEligible')return value?'是':'否';
  if(key==='finalDateId')return D.dates.find(x=>x.id===value)?.label||value||'空白';
  if(key==='finalRestaurantId')return D.restaurants.find(x=>x.id===value)?.name||value||'空白';
  return String(value);
}
function auditChangesV760(before,after,fields){
  let b=auditSanitizeV760(before),a=auditSanitizeV760(after),keys=fields&&fields.length?fields:[...new Set([...Object.keys(b||{}),...Object.keys(a||{})])];
  return keys.filter(k=>JSON.stringify(clonePlainV760(b?.[k]))!==JSON.stringify(clonePlainV760(a?.[k]))).map(k=>({field:k,label:auditFieldLabelsV760[k]||k,before:auditValueV760(k,b?.[k]),after:auditValueV760(k,a?.[k])}));
}
function auditSummaryV760(action,targetType,targetLabel,changes){
  let name=targetLabel||targetType||'資料';
  if(action==='新增')return '新增'+targetType+'「'+name+'」';
  if(action==='刪除')return '刪除'+targetType+'「'+name+'」';
  if(changes?.length)return '修改'+targetType+'「'+name+'」：'+changes.slice(0,4).map(x=>x.label).join('、')+(changes.length>4?' 等':'');
  return action+targetType+'「'+name+'」';
}
async function writeAuditDetailV760({action,targetType,targetId,targetLabel,before,after,fields,surveyId,summary}){
  if(!currentUser||!db)return;
  let cleanBefore=auditSanitizeV760(before),cleanAfter=auditSanitizeV760(after),changes=auditChangesV760(cleanBefore,cleanAfter,fields);
  let payload={
    surveyId:surveyId||activeSurveyId||cleanAfter.surveyId||cleanBefore.surveyId||'',
    action,targetType,targetId:targetId||cleanAfter.id||cleanBefore.id||'',
    summary:summary||auditSummaryV760(action,targetType,targetLabel||cleanAfter.title||cleanAfter.name||cleanAfter.label||cleanBefore.title||cleanBefore.name||cleanBefore.label||targetId,changes),
    before:cleanBefore,after:cleanAfter,changes,
    beforeSummary:changes.map(x=>x.label+'：'+x.before).join('；'),
    afterSummary:changes.map(x=>x.label+'：'+x.after).join('；'),
    detailVersion:'v7.60',
    actorUid:currentUser.uid,
    actorEmail:String(currentUser.email||'').toLowerCase(),
    actorName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
    actorRole:actorRoleV711?.()||(isSystemAdmin?'系統管理員':currentAccessRole||''),
    userName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),
    userEmail:String(currentUser.email||'').toLowerCase(),
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  console.log('[AUDIT] before',payload.before);
  console.log('[AUDIT] after',payload.after);
  console.log('[AUDIT] changes',payload.changes);
  await col('surveyAuditLogs').add(payload);
}
writeAuditV711=async function(action,targetType,targetId,summary,surveyId=activeSurveyId){
  if(!currentUser||!db)return;
  if(auditMuteDepthV760>0)return;
  try{
    await col('surveyAuditLogs').add({
      surveyId:surveyId||'',action,targetType,targetId:targetId||'',summary:summary||'',
      before:{},after:{},changes:[],beforeSummary:'',afterSummary:'',detailVersion:'v7.60-basic',
      actorUid:currentUser.uid,actorEmail:String(currentUser.email||'').toLowerCase(),actorName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),actorRole:actorRoleV711?.()||'',
      userName:currentUserDisplayText?.()||currentUser.displayName||String(currentUser.email||'').toLowerCase(),userEmail:String(currentUser.email||'').toLowerCase(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){console.warn('操作紀錄寫入失敗',e)}
};
window.writeAuditV711=writeAuditV711;
function auditDiffHtmlV760(log){
  let hasDetail=Object.prototype.hasOwnProperty.call(log,'before')&&Object.prototype.hasOwnProperty.call(log,'after')&&Object.prototype.hasOwnProperty.call(log,'changes');
  if(!hasDetail)return '<span class="auditLegacyHintV741">此筆是舊格式紀錄，資料庫內沒有修改前/修改後欄位。</span>';
  let changes=Array.isArray(log.changes)?log.changes:[];
  if(!changes.length)return '<span class="muted">本次沒有可比對的欄位差異，或此筆為新增／刪除基本紀錄。</span>';
  return '<details class="auditDiffV741"><summary>查看修改前／修改後（'+changes.length+' 項）</summary><table class="auditDiffTableV738"><thead><tr><th>欄位</th><th>修改前</th><th>修改後</th></tr></thead><tbody>'+changes.map(c=>'<tr><td>'+esc(c.label||c.field||'')+'</td><td>'+esc(c.before||'')+'</td><td>'+esc(c.after||'')+'</td></tr>').join('')+'</tbody></table></details>';
}
renderLogsV711=function(){
  let box=document.getElementById('logTable');if(!box)return;
  let type=document.getElementById('logTypeFilter')?.value||'audit';
  if(type==='login'&&!isSystemAdmin){document.getElementById('logTypeFilter').value='audit';type='audit'}
  let rows=filteredLogsV711();
  if(type==='login'){
    box.innerHTML=table(['時間','帳號／姓名','結果','身分','說明'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.displayName||'')+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>'));
    return;
  }
  box.innerHTML=table(['時間','操作者','活動','功能／動作','內容'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.actorName||x.userName||'')+'</b><br><small>'+esc(x.actorEmail||x.userEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'<br>'+auditDiffHtmlV760(x)+'</td></tr>'));
};

function setThemeEditorValueV760(theme){
  ensureThemeControl?.();
  let category=themeCategorySelect?.(),select=themeSelect?.();
  if(!category||!select)return;
  let normalized=normalizeTheme(theme||'classic'),categoryKey=categoryOfTheme(normalized);
  category.value=categoryKey;
  select.innerHTML=themeOptionsForCategory(categoryKey);
  select.value=normalized;
  if(select.value!==normalized)select.value=(THEME_CATEGORIES[categoryKey]||THEME_CATEGORIES.basic).themes[0]||'classic';
  renderThemePreview?.();
}
function surveyThemeValueV760(survey){
  return normalizeTheme(survey?.theme||survey?.frontTheme||survey?.themeStyle||survey?.frontThemeStyle||'classic');
}
const renderSurveyPanelBaseV760=renderSurveyPanel;
renderSurveyPanel=function(){
  renderSurveyPanelBaseV760();
  if(surveyFormMode==='edit'&&editingSurveyId){
    let survey=D.surveys.find(x=>x.id===editingSurveyId);
    setThemeEditorValueV760(surveyThemeValueV760(survey));
  }else if(surveyFormMode==='new'){
    setThemeEditorValueV760('classic');
  }
  normalizeSurveyActionCellsV760();
};
const editSurveyBaseV760=editSurvey;
editSurvey=function(id){
  editSurveyBaseV760(id);
  let apply=()=>{let survey=D.surveys.find(x=>x.id===id);setThemeEditorValueV760(surveyThemeValueV760(survey))};
  apply();setTimeout(apply,0);setTimeout(apply,120);
};
function normalizeSurveyActionCellsV760(){
  document.querySelectorAll('#surveyTable .operationCell').forEach(cell=>{
    let buttons=[...cell.querySelectorAll('button')];
    if(!buttons.length)return;
    buttons.forEach(btn=>{if(btn.textContent.trim().startsWith('刪除'))btn.textContent='刪除'});
    let group=cell.querySelector('.actionButtonGroupV750');
    if(!group){group=document.createElement('div');group.className='actionButtonGroupV750';buttons[0].before(group);}
    buttons.forEach(btn=>group.appendChild(btn));
  });
}

function pad2V760(n){return String(n).padStart(2,'0')}
function formatDateLabelV760(dateValue,suffix=''){
  let parts=String(dateValue||'').split('-').map(Number);
  if(parts.length!==3||parts.some(x=>!Number.isFinite(x)))return '';
  let d=new Date(parts[0],parts[1]-1,parts[2]);
  if(Number.isNaN(d.getTime())||d.getFullYear()!==parts[0]||d.getMonth()!==parts[1]-1||d.getDate()!==parts[2])return '';
  return pad2V760(parts[1])+'/'+pad2V760(parts[2])+'('+'日一二三四五六'[d.getDay()]+')'+(String(suffix||'').trim()?' '+String(suffix).trim():'');
}
function parseDateLabelV760(label,rawSource){
  let out={date:'',suffix:''};
  let raw=String(rawSource||'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))out.date=raw;
  let text=String(label||'').trim();
  let m=text.match(/^(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})\s*[（(][日一二三四五六][）)]\s*(.*)$/);
  if(m){
    if(!out.date)out.date=new Date().getFullYear()+'-'+pad2V760(m[1])+'-'+pad2V760(m[2]);
    out.suffix=m[3]||'';
  }
  return out;
}
function ensureDateEditorLayoutV760(){
  if(!dateP||!newDate||!newDateSort||!dateSaveBtn)return;
  let card=dateP.querySelector('.card');
  if(!card)return;
  const previousPickerValue=document.getElementById('newDatePickerV724')?.value||'';
  const previousSuffixValue=document.getElementById('newDateSuffixV724')?.value||'';
  let oldPicker=document.getElementById('newDatePickerV724');if(oldPicker)oldPicker.closest('.dateAutoBox')?.remove();
  let oldSuffix=document.getElementById('newDateSuffixV724');if(oldSuffix)oldSuffix.closest('.dateAutoBox')?.remove();
  let row=card.querySelector('.dateEntryRowV736[data-v760="true"]');
  if(!row){
    row=document.createElement('div');
    row.className='dateEntryRowV736';
    row.dataset.v760='true';
    let tableNode=dateTable||card.lastElementChild;
    card.insertBefore(row,tableNode);
  }
  let sourceField=newDate.closest('div');if(sourceField){sourceField.classList.add('dateGeneratedFieldV736');row.appendChild(sourceField)}
  let pickerBox=document.createElement('div');pickerBox.className='dateAutoBox';pickerBox.innerHTML='<label for="newDatePickerV724">日期選擇器</label><input id="newDatePickerV724" type="date">';
  let suffixBox=document.createElement('div');suffixBox.className='dateAutoBox';suffixBox.innerHTML='<label for="newDateSuffixV724">補充文字（選填）</label><input id="newDateSuffixV724" placeholder="例如：晚上、午餐">';
  let sortField=newDateSort.closest('div');let actionBox=dateSaveBtn.closest('div');
  row.insertBefore(pickerBox,sourceField||null);row.insertBefore(suffixBox,sourceField||null);
  if(sortField)row.appendChild(sortField);
  if(actionBox){actionBox.classList.add('compactActions');row.appendChild(actionBox)}
  let hint=card.querySelector('.dateAutoHintV736');
  if(!hint){hint=document.createElement('small');hint.className='muted dateAutoHintV736'}
  row.appendChild(hint);
  hint.textContent='系統會自動產生 06/28(日)；若需加註「晚上、午餐」等文字，請填寫補充文字。';
  let restoredPicker=document.getElementById('newDatePickerV724'),restoredSuffix=document.getElementById('newDateSuffixV724');
  if(restoredPicker&&previousPickerValue&&!restoredPicker.value)restoredPicker.value=previousPickerValue;
  if(restoredSuffix&&previousSuffixValue&&!restoredSuffix.value)restoredSuffix.value=previousSuffixValue;
  let sync=()=>{let label=formatDateLabelV760(document.getElementById('newDatePickerV724')?.value||'',document.getElementById('newDateSuffixV724')?.value||'');if(label)newDate.value=label};
  document.getElementById('newDatePickerV724')?.addEventListener('input',sync);
  document.getElementById('newDatePickerV724')?.addEventListener('change',sync);
  document.getElementById('newDateSuffixV724')?.addEventListener('input',sync);
  newDate.readOnly=true;newDate.tabIndex=-1;
  bindDateSaveButtonV760();
}
function fillDateEditorV760(d){
  ensureDateEditorLayoutV760();
  let parsed=parseDateLabelV760(d?.label,d?.rawDateSource);
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(picker)picker.value=parsed.date||'';
  if(suffix)suffix.value=parsed.suffix||'';
  if(newDate)newDate.value=d?.label||'';
  if(newDateSort)newDateSort.value=d?.sort??'';
}
function bindDateSaveButtonV760(){
  if(!dateSaveBtn)return;
  dateSaveBtn.onclick=event=>{event?.preventDefault?.();return saveDateV760Direct()};
  dateSaveBtn.setAttribute('data-date-save-version','v7.60');
}
async function saveDateV760Direct(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  const keepPickerValue=document.getElementById('newDatePickerV724')?.value||'';
  const keepSuffixValue=document.getElementById('newDateSuffixV724')?.value||'';
  ensureDateEditorLayoutV760();
  let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(picker&&keepPickerValue&&!picker.value)picker.value=keepPickerValue;
  if(suffix&&keepSuffixValue&&!suffix.value)suffix.value=keepSuffixValue;
  let label=formatDateLabelV760(picker?.value||'',suffix?.value||'')||normalizeDateLabelV729?.(newDate?.value||'',suffix?.value||'')||'';
  if(!label){picker?.focus();return alert('請先選擇日期')}
  let isEdit=!!editingDateId,targetId=editingDateId,before=isEdit?await auditReadDocV760('surveyDates',targetId):null;
  let data={surveyId:activeSurveyId,label,rawDateSource:picker?.value||'',sort:Number(newDateSort?.value||0),active:true,dateSaveVersion:'v7.60',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  dateSaveBtn.disabled=true;dateSaveBtn.textContent='儲存中…';
  try{
    if(isEdit)await doc('surveyDates',targetId).set(data,{merge:true});
    else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('surveyDates').add(data);targetId=ref.id}
    let after=await auditReadDocV760('surveyDates',targetId);
    await writeAuditDetailV760({action:isEdit?'修改':'新增',targetType:'日期',targetId,targetLabel:after?.label||label,before,after,fields:['label','rawDateSource','sort','active'],surveyId:activeSurveyId});
    cancelDateEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'日期變更已儲存':'日期已新增');
  }catch(e){console.error('save date v7.60 failed',e);alert('日期儲存失敗，請檢查網路後再試一次')}
  finally{dateSaveBtn.disabled=false;dateSaveBtn.textContent=editingDateId?'儲存變更':'新增日期';bindDateSaveButtonV760()}
}
saveDate=saveDateV760Direct;saveDateV731Direct=saveDateV760Direct;window.saveDateV731Direct=saveDateV760Direct;
const editDateBaseV760=editDate;
editDate=function(id){
  let d=D.dates.find(x=>x.id===id);if(!d)return alert('找不到這筆日期資料');
  editingDateId=id;ensureDateEditorLayoutV760();fillDateEditorV760(d);
  dateFormHeading.textContent='編輯日期：'+(d.label||'');dateModeBadge.textContent='編輯模式';dateModeBadge.className='modeBadge edit';dateSaveBtn.textContent='儲存變更';dateCancelBtn.hidden=false;
};
const cancelDateEditBaseV760=cancelDateEdit;
cancelDateEdit=function(render=true){
  editingDateId=null;ensureDateEditorLayoutV760();let picker=document.getElementById('newDatePickerV724'),suffix=document.getElementById('newDateSuffixV724');
  if(picker)picker.value='';if(suffix)suffix.value='';if(newDate)newDate.value='';if(newDateSort)newDateSort.value='';
  dateFormHeading.textContent='新增日期';dateModeBadge.textContent='新增模式';dateModeBadge.className='modeBadge new';dateSaveBtn.textContent='新增日期';dateCancelBtn.hidden=true;if(render)renderDatePanel();
};
const renderDatePanelBaseV760=renderDatePanel;
renderDatePanel=function(){
  if(dateTable)dateTable.innerHTML=table(['日期','排序','操作'],D.dates.map(d=>`<tr><td>${esc(d.label)}</td><td>${d.sort??''}</td><td class="operationCell"><button class="btn" onclick="editDate('${d.id}')">編輯</button> <button class="btn red" onclick="delDoc('surveyDates','${d.id}')">刪除</button></td></tr>`));
  ensureDateEditorLayoutV760();
  bindDateSaveButtonV760();
};
installDatePickerV724=function(){};
installDatePickerV725=function(){};
rebindDatePickerEventsV727=function(){};

async function saveSurvey(){
  if(surveyFormMode==='view')return;
  let title=svTitle.value.trim();if(!title){svTitle.focus();return alert('請輸入活動標題')}
  let mode=document.getElementById('svOpenMode')?.value||'immediate',openDate=document.getElementById('svOpenDate')?.value||'',openTime=document.getElementById('svOpenTime')?.value||'08:00';
  let openAt=mode==='scheduled'&&openDate?openDate+'T'+openTime:'',deadlineValue=svDeadline.value?(svDeadline.value+'T'+(svDeadlineTime.value||'23:59')):'';
  if(mode==='scheduled'&&!openDate)return alert('請設定問卷開放日期');
  if(openAt&&deadlineValue&&new Date(openAt)>=new Date(deadlineValue))return alert('開放時間必須早於截止時間');
  let isNew=surveyFormMode==='new',id=isNew?('survey_'+Date.now()):editingSurveyId,before=isNew?null:await auditReadDocV760('surveys',id);
  let target=[...document.querySelectorAll('.targetDept:checked')].map(x=>x.value),descriptionData=getRichDescriptionData();
  let currentSurvey=isNew?null:D.surveys.find(x=>x.id===id);
  let data={title,...descriptionData,frontInstructions:svInstructions.value.trim(),deadline:deadlineValue,openMode:mode,openAt,status:svStatus.value,allowEdit:svAllowEdit.value==='true',theme:normalizeTheme(themeSelect()?.value||surveyThemeValueV760(currentSurvey)),isAnonymous:false,targetDepartments:target,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  data.openAtTimestamp=openAt?firebase.firestore.Timestamp.fromDate(new Date(openAt)):firebase.firestore.FieldValue.delete();
  data.deadlineAtTimestamp=deadlineValue?firebase.firestore.Timestamp.fromDate(new Date(deadlineValue)):firebase.firestore.FieldValue.delete();
  if(isNew)data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
  surveySaveBtn.disabled=true;surveySaveBtn.textContent='儲存中…';
  try{
    await doc('surveys',id).set(data,{merge:true});
    let after=await auditReadDocV760('surveys',id);
    await writeAuditDetailV760({action:isNew?'新增':'修改',targetType:'活動',targetId:id,targetLabel:after?.title||title,before,after,fields:['title','description','descriptionHtml','frontInstructions','deadline','openMode','openAt','status','allowEdit','theme','targetDepartments'],surveyId:id});
    surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;await loadAll();renderFront();renderAdmin();toast(isNew?'活動已建立，可從列表設為目前活動':'活動變更已儲存');
  }catch(e){console.error('save survey failed',e);alert('活動儲存失敗，請檢查網路後再試一次')}
  finally{surveySaveBtn.disabled=false;surveySaveBtn.textContent=surveyFormMode==='edit'?'儲存變更':'建立活動'}
}

async function saveRestaurant(){
  if(!activeSurveyId)return alert('請先建立或選擇活動');
  installRestaurantInfoUrlV724?.();installRestaurantNoteV719?.();installRestaurantPricingV712?.();
  let name=newRest.value.trim();if(!name){newRest.focus();return alert('請輸入餐廳名稱')}
  let infoUrl=document.getElementById('newInfoUrl')?.value.trim()||'';if(infoUrl&&!safeUrl(infoUrl))return alert('店家資訊網址格式不正確，請輸入 http 或 https 網址');
  let mode=document.getElementById('restaurantPricingMode')?.value||'perPerson',price=moneyValue(newPrice.value),tableSeats=Math.floor(numericV712(document.getElementById('restaurantTableSeats')?.value,10)),minTables=Math.floor(numericV712(document.getElementById('restaurantMinTables')?.value,0)),serviceRate=numericV712(document.getElementById('restaurantServiceRate')?.value,0),fixedFee=numericV712(document.getElementById('restaurantFixedFee')?.value,0);
  if(newPrice.value.trim()!==''&&price===null)return alert('價格請輸入有效數字');if(mode==='perTable'&&tableSeats<1)return alert('每桌人數至少為 1 人');if(serviceRate>100)return alert('服務費率不可超過 100%');
  let isEdit=!!editingRestaurantId,targetId=editingRestaurantId,before=isEdit?await auditReadDocV760('restaurants',targetId):null;
  let data={surveyId:activeSurveyId,name,address:newAddr.value.trim(),googleMap:newMap.value.trim(),infoUrl,storeInfoUrl:firebase.firestore.FieldValue.delete(),websiteUrl:firebase.firestore.FieldValue.delete(),officialUrl:firebase.firestore.FieldValue.delete(),description:newCuisine.value.trim(),descriptionRest:newCuisine.value.trim(),pricingMode:mode,price,tableSeats:mode==='perTable'?tableSeats:null,minTables:mode==='perTable'?minTables:0,serviceRate,fixedFee,internalNote:document.getElementById('newRestOpsNote')?.value.trim()||'',sort:Number(newRestSort.value||0),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  restSaveBtn.disabled=true;restSaveBtn.textContent='儲存中…';
  try{
    if(isEdit)await doc('restaurants',targetId).set(data,{merge:true});
    else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('restaurants').add(data);targetId=ref.id}
    let after=await auditReadDocV760('restaurants',targetId);
    await writeAuditDetailV760({action:isEdit?'修改':'新增',targetType:'餐廳',targetId,targetLabel:after?.name||name,before,after,fields:['name','address','googleMap','infoUrl','description','descriptionRest','pricingMode','price','tableSeats','minTables','serviceRate','fixedFee','internalNote','sort','active'],surveyId:activeSurveyId});
    cancelRestaurantEdit(false);await loadSurveyData();renderFront();renderAdmin();toast(isEdit?'餐廳變更已儲存':'餐廳已新增');
  }catch(e){console.error('save restaurant failed',e);alert('餐廳儲存失敗，請檢查網路後再試一次')}
  finally{restSaveBtn.disabled=false;restSaveBtn.textContent=editingRestaurantId?'儲存變更':'新增餐廳'}
}

async function saveBudgetSetting(){
  if(!activeSurveyId)return alert('請先選擇活動');
  let before=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null,value=budgetPerPerson?.value===''?null:Number(budgetPerPerson?.value||0);
  if(value!==null&&(!Number.isFinite(value)||value<0))return alert('每人預算請輸入 0 以上數字');
  await doc('surveys',activeSurveyId).set({budgetPerPerson:value,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  await loadAll();let after=activeSurvey()?{id:activeSurveyId,budgetPerPerson:activityBudgetPerPerson()}:null;
  await writeAuditDetailV760({action:'修改',targetType:'預算',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['budgetPerPerson'],surveyId:activeSurveyId});
  renderAdmin();toast('每人預算已更新');
}
async function saveFinal(){
  if(!activeSurveyId)return alert('請先選擇活動');
  if(finalLock.value==='true'&&(!finalDate.value||!finalRest.value))return alert('要顯示於前台時，請先選擇最終日期與餐廳');
  let before=await auditReadDocV760('finalDecision',activeSurveyId);
  let data={surveyId:activeSurveyId,finalDateId:finalDate.value,finalRestaurantId:finalRest.value,note:finalNote.value.trim(),locked:finalLock.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  await doc('finalDecision',activeSurveyId).set(data,{merge:true});
  let after=await auditReadDocV760('finalDecision',activeSurveyId);
  await writeAuditDetailV760({action:before?'修改':'新增',targetType:'最終決議',targetId:activeSurveyId,targetLabel:activeSurvey()?.title||activeSurveyId,before,after,fields:['finalDateId','finalRestaurantId','locked','note'],surveyId:activeSurveyId});
  await loadSurveyData();renderFront();renderAdmin();toast('最終決議與出席名單已更新');
}
async function delDoc(collection,id){
  let typeMap={surveyDates:'日期',restaurants:'餐廳',members:'人員',surveys:'活動'};
  if(collection==='surveyDates'&&D.final?.finalDateId===id)return alert('此日期已被選為最終日期，請先到「最終決議」更換或清除最終日期後再刪除。');
  if(collection==='restaurants'&&D.final?.finalRestaurantId===id)return alert('此餐廳已被選為最終餐廳，請先到「最終決議」更換或清除後再刪除。');
  let before=await auditReadDocV760(collection,id);
  if(!confirm('確定刪除'+(typeMap[collection]?'這筆'+typeMap[collection]:'這筆資料')+'？此操作無法復原。'))return;
  await doc(collection,id).delete();
  if(collection==='members'){let account=await doc('memberAccounts',id).get();if(account.exists)await doc('memberAccounts',id).delete();let settings=await col('budgetEligibility').where('memberId','==',id).get();await Promise.all(settings.docs.map(item=>item.ref.delete()))}
  await writeAuditDetailV760({action:'刪除',targetType:typeMap[collection]||collection,targetId:id,targetLabel:before?.label||before?.name||before?.title||id,before,after:null,fields:Object.keys(before||{}),surveyId:collection==='surveys'?id:activeSurveyId});
  if(collection==='surveys'&&editingSurveyId===id){surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false}
  if(collection==='members'&&editingMemberId===id){memberFormMode='view';editingMemberId=null}
  await loadAll();renderFront();renderAdmin();toast('已刪除');
}

async function auditReadMemberV760(id){
  let member=await auditReadDocV760('members',id);
  if(!member)return null;
  let account=await auditReadDocV760('memberAccounts',id);
  return {...member,googleEmail:account?.email||member.googleEmail||''};
}
async function auditReadBudgetSettingV760(memberId){
  if(!activeSurveyId||!memberId)return null;
  return await auditReadDocV760('budgetEligibility',activeSurveyId+'__'+memberId);
}
function responseAuditFieldsV760(){
  return ['departmentName','memberName','employeeNo','cannotAttend','dateIds','restaurantRanks','note','adminEditedBy'];
}
const saveMemberBaseV760=saveMember;
saveMember=async function(){
  if(memberFormMode==='view')return;
  let wasNew=memberFormMode==='new',targetId=editingMemberId,name=newMem?.value?.trim?.()||'',beforeIds=new Set(D.members.map(m=>m.id));
  let before=targetId?await auditReadMemberV760(targetId):null;
  await runAuditMutedV760(()=>saveMemberBaseV760());
  await loadAll();
  let afterMember=targetId?D.members.find(m=>m.id===targetId):D.members.find(m=>!beforeIds.has(m.id))||D.members.find(m=>m.name===name);
  if(afterMember){
    let after=await auditReadMemberV760(afterMember.id);
    await writeAuditDetailV760({action:wasNew?'新增':'修改',targetType:'人員',targetId:afterMember.id,targetLabel:memberDisplayName(afterMember)||name,before,after,fields:['department','departmentName','name','employeeNo','empNo','googleEmail','active'],surveyId:''});
  }
};
const toggleMemberBaseV760=toggleMember;
toggleMember=async function(id,active){
  let before=await auditReadMemberV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberBaseV760(id,active));
  let after=await auditReadMemberV760(id);
  if(before||after)await writeAuditDetailV760({action:active?'啟用':'停用',targetType:'人員',targetId:id,targetLabel:memberDisplayName(after||m)||id,before,after,fields:['active'],surveyId:''});
};
const toggleMemberFillBaseV760=toggleMemberFill;
toggleMemberFill=async function(id,canFill,btn){
  let before=await auditReadBudgetSettingV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberFillBaseV760(id,canFill,btn));
  let after=await auditReadBudgetSettingV760(id);
  await writeAuditDetailV760({action:'修改',targetType:'填寫資格',targetId:activeSurveyId+'__'+id,targetLabel:memberDisplayName(m)||id,before,after,fields:['canFill','budgetEligible'],surveyId:activeSurveyId});
};
const toggleMemberBudgetBaseV760=toggleMemberBudget;
toggleMemberBudget=async function(id,eligible,btn){
  let before=await auditReadBudgetSettingV760(id),m=D.members.find(x=>x.id===id);
  await runAuditMutedV760(()=>toggleMemberBudgetBaseV760(id,eligible,btn));
  let after=await auditReadBudgetSettingV760(id);
  await writeAuditDetailV760({action:'修改',targetType:'預算資格',targetId:activeSurveyId+'__'+id,targetLabel:memberDisplayName(m)||id,before,after,fields:['budgetEligible'],surveyId:activeSurveyId});
};
const saveSurveyManagerBaseV760=saveSurveyManager;
saveSurveyManager=async function(){
  let email=normalizeEmail(managerEmail?.value||''),targetId=activeSurveyId&&email?managerDocId(activeSurveyId,email):'',role=managerRole?.value||'manager';
  let before=targetId?await auditReadDocV760('surveyManagers',targetId):null;
  await runAuditMutedV760(()=>saveSurveyManagerBaseV760());
  let after=targetId?await auditReadDocV760('surveyManagers',targetId):null;
  if(targetId)await writeAuditDetailV760({action:before?'修改':'指派',targetType:'活動權限',targetId,targetLabel:email,before,after,fields:['email','role','enabled','memberId','displayName'],surveyId:activeSurveyId,summary:(before?'更新':'指派')+' '+email+' 為 '+(role==='viewer'?'結果檢視者':'活動管理者')});
};
const removeSurveyManagerBaseV760=removeSurveyManager;
removeSurveyManager=async function(id){
  let before=await auditReadDocV760('surveyManagers',id);
  await runAuditMutedV760(()=>removeSurveyManagerBaseV760(id));
  if(before)await writeAuditDetailV760({action:'移除',targetType:'活動權限',targetId:id,targetLabel:before.email||id,before,after:null,fields:['email','role','enabled','memberId','displayName'],surveyId:before.surveyId||activeSurveyId});
};
const saveResponseEditBaseV760=saveResponseEdit;
saveResponseEdit=async function(){
  let id=editingResponseId,before=id?await auditReadDocV760('responses',id):null,label=(before?.departmentName||'')+' '+(before?.memberName||'');
  await runAuditMutedV760(()=>saveResponseEditBaseV760());
  let after=id?await auditReadDocV760('responses',id):null;
  if(id&&after)await writeAuditDetailV760({action:'修改',targetType:'問卷',targetId:id,targetLabel:label.trim()||id,before,after,fields:responseAuditFieldsV760(),surveyId:activeSurveyId});
};
const deleteResponseBaseV760=deleteResponse;
deleteResponse=async function(id){
  let before=await auditReadDocV760('responses',id),label=(before?.departmentName||'')+' '+(before?.memberName||'');
  await runAuditMutedV760(()=>deleteResponseBaseV760(id));
  let after=await auditReadDocV760('responses',id);
  if(before&&!after)await writeAuditDetailV760({action:'刪除',targetType:'問卷',targetId:id,targetLabel:label.trim()||id,before,after:null,fields:responseAuditFieldsV760(),surveyId:before.surveyId||activeSurveyId});
};
const importMembersBaseV760=importMembers;
importMembers=async function(file){
  let before={count:D.members.length};
  await runAuditMutedV760(()=>importMembersBaseV760(file));
  await loadAll();
  let after={count:D.members.length};
  await writeAuditDetailV760({action:'匯入',targetType:'人員',targetId:'members',targetLabel:'人員主檔',before,after,fields:['count'],surveyId:'',summary:`匯入人員主檔，筆數 ${before.count} → ${after.count}`});
};

const renderAdminBaseV760=renderAdmin;
renderAdmin=function(){renderAdminBaseV760();ensureDateEditorLayoutV760();bindDateSaveButtonV760();normalizeSurveyActionCellsV760();if(surveyFormMode==='edit'&&editingSurveyId){let s=D.surveys.find(x=>x.id===editingSurveyId);setThemeEditorValueV760(surveyThemeValueV760(s))}};
