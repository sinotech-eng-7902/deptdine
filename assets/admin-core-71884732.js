/* 相容層：管理端基礎狀態、資料載入、基本 CRUD 與導覽。 */
// ========= 歷史相容核心：保留既有 Firebase 與管理功能 =========
window.ADMIN_MODULE_SCHEMA='admin-modules-v1';
window.ADMIN_COMPATIBILITY_VERSION=window.ADMIN_MODULE_SCHEMA;

// ========================================================
let app,auth,db,ready=false,currentUser=null,isAdmin=false,isSystemAdmin=false,currentAccessRole='',surveyAssignments=[],activeSurveyId=null,isSubmitting=false,surveyFormMode='view',editingSurveyId=null,surveyFormDirty=false,memberFormMode='view',editingMemberId=null,editingDateId=null,editingRestaurantId=null,editingResponseId=null;
let D={departments:[],members:[],memberAccounts:[],surveys:[],dates:[],restaurants:[],responses:[],final:null,managers:[],budgetEligibility:[],frontProtection:null};
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
const memCompanyEmailV957 = el('memCompanyEmailV957');
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
const FRONT_THEME_OPTIONS=[['classic','經典深藍'],['lake','湖水綠'],['warm','暖橘米白'],['aqua','清新藍綠'],['purple','柔和紫灰'],['ivory','米白簡約'],['rose','玫瑰柔粉'],['slate','霧灰專業'],['forest','森林晨光'],['sea','海鹽藍'],['milk','奶茶午後'],['sakura','櫻花淡粉'],['citrus','柑橘派對'],['night','星空深藍'],['lavender','薰衣草花園'],['lakePro','湖水綠 Pro'],['sinotechRed','環興紅企業版'],['appleWhite','極簡白 Apple版'],['corporateMinimal','企業簡約'],['patternWave','水光波紋'],['botanicalMist','葉影晨霧'],['sakuraBloom','櫻花花影'],['cloudBlue','藍天雲朵'],['goldNavy','黑金流線'],['creamWaves','奶油金紋'],['coralBubble','珊瑚泡泡'],['mintGarden','薄荷花園'],['auroraPurple','極光紫霧'],['paperDoodle','手繪便條']];
const FRONT_THEMES=Object.fromEntries(FRONT_THEME_OPTIONS);
const FRONT_THEME_VALUES=FRONT_THEME_OPTIONS.map(([value])=>value);
const THEME_CATEGORIES={basic:{label:'基礎色系',themes:['classic','lake','warm','aqua','purple','ivory','rose','slate']},soft:{label:'柔和清新',themes:['forest','sea','milk','sakura','citrus','lavender','lakePro','appleWhite']},brand:{label:'企業質感',themes:['corporateMinimal','sinotechRed','night']},pattern:{label:'圖案質感',themes:['patternWave','botanicalMist','sakuraBloom','cloudBlue','goldNavy','creamWaves','coralBubble','mintGarden','auroraPurple','paperDoodle']}};
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
async function init(){
  applyBranding();
  ensureThemeControl();
  ensureRichDescriptionEditor();
  if(!hasConfig()){if(setup) setup.style.display='block'; if(frontLoading) frontLoading.innerHTML='請先設定 FirebaseConfig'; return}
  app=firebase.initializeApp(firebaseConfig,'deptdine');auth=app.auth();db=app.firestore();ready=true;
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
  D.memberAccounts=(isSystemAdmin||surveyAssignments.some(a=>a.role==='manager'&&a.enabled!==false))?await safeGetCollection('memberAccounts'):[];
  try{
    const frontProtectionDoc=await doc('systemSettings','frontProtection').get();
    D.frontProtection=frontProtectionDoc.exists?frontProtectionDoc.data():null;
  }catch(e){
    console.warn('讀取前台防護設定失敗', e);
    D.frontProtection=null;
  }
  D.departments=deps.sort((a,b)=>(a.sortOrder??a.order??999)-(b.sortOrder??b.order??999)||String(a.name||a.departmentName||a.department||'').localeCompare(String(b.name||b.departmentName||b.department||''),'zh-Hant'));
  let departmentOrder=new Map(D.departments.map((d,i)=>[String(d.name||d.departmentName||d.department||''),i]));
  D.members=mems.sort((a,b)=>{let ad=String(a.department||a.departmentName||''),bd=String(b.department||b.departmentName||''),departmentDiff=(departmentOrder.get(ad)??9999)-(departmentOrder.get(bd)??9999);if(departmentDiff)return departmentDiff;let ae=String(a.employeeNo||a.empNo||'').trim(),be=String(b.employeeNo||b.empNo||'').trim();if(!ae&&be)return 1;if(ae&&!be)return-1;return ae.localeCompare(be,'zh-Hant',{numeric:true,sensitivity:'base'})||String(a.name||'').localeCompare(String(b.name||''),'zh-Hant')});
  await loadSurveyData();
}
function chooseActiveSurvey(){
  let open=D.surveys.find(x=>x.status==='open'&&x.archived!==true)||D.surveys.find(x=>x.status!=='archived'&&x.archived!==true)||D.surveys[0];
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
  D.managers=(isSystemAdmin||surveyAssignments.some(a=>a.surveyId===activeSurveyId&&a.role==='manager'&&a.enabled!==false))?await safeGetQuery(col('surveyManagers').where('surveyId','==',activeSurveyId),'surveyManagers'):[];
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
function memberDepartmentV1023(m){return String(m?.department||m?.departmentName||'').trim()}
function rosterIdsForMembersV1023(members,departments){
  let targets=new Set((Array.isArray(departments)?departments:[]).map(x=>String(x||'').trim()).filter(Boolean));
  return (Array.isArray(members)?members:[]).filter(m=>m?.active!==false&&(!targets.size||targets.has(memberDepartmentV1023(m)))).map(m=>String(m.id||'')).filter(Boolean);
}
function membersForSurveyRosterV1023(members,survey){
  let rows=Array.isArray(members)?members:[];
  if(Array.isArray(survey?.memberRosterIds)){
    let ids=new Set(survey.memberRosterIds.map(x=>String(x||'')).filter(Boolean));
    return rows.filter(m=>ids.has(String(m?.id||'')));
  }
  let targets=new Set((Array.isArray(survey?.targetDepartments)?survey.targetDepartments:[]).map(x=>String(x||'').trim()).filter(Boolean));
  return rows.filter(m=>m?.active!==false&&(!targets.size||targets.has(memberDepartmentV1023(m))));
}
function scopedMembers(){return membersForSurveyRosterV1023(D.members,activeSurvey())}
function targetMembers(){return scopedMembers().filter(memberCanFill)}
function renderFront(){
  if(frontLoading) frontLoading.style.display='none'; if(frontContent) frontContent.style.display='block';
  let s=activeSurvey();
  applyFrontTheme(s?.theme||'classic');
  if(!s){frontStatus.textContent='尚無活動';surveyTitle.textContent='目前尚未開放調查';surveyDesc.textContent='請洽管理者建立活動。';deadline.textContent='尚無截止日期';formGrid.style.display='none';return}
  surveyTitle.textContent=s.title||'未命名調查';renderSurveyDescription(s);deadline.textContent=s.deadline?'請於 '+formatDeadline(s.deadline)+' 前完成填寫':'尚未設定截止日期';
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
  dateBox.innerHTML=D.dates.length?`<div class="dateAvailabilityInfo">請勾選所有可出席的日期。未勾選的日期將視為無法出席；若最終聚餐日期為您未勾選的日期，您將不列入出席名單。</div><div class="dateAvailabilityGrid">${D.dates.map(x=>`<label class="dateAvailabilityChoice"><input type="checkbox" class="dateOpt" value="${escAttr(x.id)}"><span>${esc(x.label)}</span></label>`).join('')}</div>`:'<div class="muted">尚未設定日期選項</div>';
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
  let payload={surveyId:activeSurveyId,departmentName:depName,memberId:memId,memberName:mem.name||'',employeeNo:mem.employeeNo||mem.empNo||'',preferredDateId:'',alternateDateId:'',dateIds:no?[]:dateIds,cannotAttend:no,restaurantRanks:ranks,note:note.value.trim(),submittedAt:firebase.firestore.FieldValue.serverTimestamp(),submittedAtText:formatDateTimeV784(new Date())};
  if(!await window.adminConfirmV908('確認送出 '+payload.departmentName+' '+payload.memberName+' 的問卷？','確認送出'))return;
  try{isSubmitting=true;submitBtn.disabled=true;submitBtn.textContent='送出中…';submitStatus.textContent='正在儲存，請勿關閉頁面。';await responseRef.set(payload,{merge:true});formGrid.style.display='none';done.style.display='block';done.innerHTML='<div class="check">✓</div><h2>填寫成功</h2><p><b>'+esc(payload.departmentName)+' '+esc(payload.memberName)+'</b></p><p class="muted">送出時間：'+esc(payload.submittedAtText)+'</p><button class="btn primary" onclick="location.reload()">返回問卷</button>';}catch(e){console.error('submit failed',e);submitStatus.textContent='送出失敗，請檢查網路後再試一次。';submitStatus.classList.add('error');toast('送出失敗');}finally{isSubmitting=false;submitBtn.disabled=false;submitBtn.textContent='確認並送出';}
}
function normalizeLegacyManageRoute(){let hash=location.hash;if(hash==='#admin'||hash.startsWith('#admin/')){history.replaceState(null,'','#manage'+hash.slice(6));return true}return false}
function requestedSurveyId(){let m=location.hash.match(/^#manage\/([^/?#]+)/);return m?decodeURIComponent(m[1]):''}
function adminHash(){return activeSurveyId?'#manage/'+encodeURIComponent(activeSurveyId):'#manage'}
function navigateTo(view,replace=false){let hash=view==='admin'?adminHash():'#front';if(location.hash!==hash)history[replace?'replaceState':'pushState'](null,'',hash);applyRoute()}
function bindNavigation(){normalizeLegacyManageRoute();if(location.hash!=='#front'&&!location.hash.startsWith('#manage'))history.replaceState(null,'','#front');window.addEventListener('popstate',applyRoute);window.addEventListener('hashchange',()=>{normalizeLegacyManageRoute();applyRoute()})}
function applyRoute(){
  normalizeLegacyManageRoute();
  const wantsAdmin=location.hash.startsWith('#manage');
  if(wantsAdmin&&isAdmin){loginMask.style.display='none';front.style.display='none';admin.style.display='block';adminPreviewBar.style.display='none';applyAccessUI();renderAdmin();return}
  admin.style.display='none';front.style.display='block';adminPreviewBar.style.display=!wantsAdmin&&isAdmin?'flex':'none';renderFront();
  if(wantsAdmin&&!isAdmin)openLogin(false);else loginMask.style.display='none';
}
function openLogin(updateUrl=true){if(updateUrl)setLoginState(false);if(updateUrl&&!location.hash.startsWith('#manage'))history.pushState(null,'','#manage');loginMask.style.display='flex'}
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
// 網址加 #manage 可直接進入管理路由；舊 #admin 會自動轉址。
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
async function resolveAccess(email,uid){
  isSystemAdmin=await checkAdmin(email,uid);
  let q=await col('surveyManagers').where('email','==',String(email||'').trim().toLowerCase()).where('enabled','==',true).get();
  surveyAssignments=q.docs.map(x=>({id:x.id,...x.data()}));
  isAdmin=isSystemAdmin||surveyAssignments.length>0;
  let requested=requestedSurveyId();
  currentAccessRole=isSystemAdmin?'system':((requested?surveyAssignments.find(x=>x.surveyId===requested&&x.enabled!==false)?.role:surveyAssignments[0]?.role)||'');
}
const ADMIN_PREVIEW_SESSION_KEY_V923='deptdineAdminPreviewV923';
function clearAdminPreviewSessionV923(){try{sessionStorage.removeItem(ADMIN_PREVIEW_SESSION_KEY_V923)}catch(e){}}
function markAdminPreviewSessionV923(){
  try{sessionStorage.setItem(ADMIN_PREVIEW_SESSION_KEY_V923,JSON.stringify({surveyId:String(activeSurveyId||''),expiresAt:Date.now()+8*60*60*1000}))}catch(e){console.warn('無法建立前台預覽狀態',e)}
}
async function logout(){clearAdminPreviewSessionV923();await auth.signOut();currentUser=null;isAdmin=false;isSystemAdmin=false;surveyAssignments=[];location.href='../'}
function frontUrl(){let base=new URL('../',location.href);base.hash='';base.search='';return activeSurveyId?base.href+'?survey='+encodeURIComponent(activeSurveyId):base.href}
function showFront(){if(!activeSurveyId)return alert('請先選擇活動');markAdminPreviewSessionV923();location.href=frontUrl()}
function returnToAdmin(){if(isAdmin)navigateTo('admin');else openLogin()}
function canManage(){return isSystemAdmin||currentAccessRole==='manager'}
function applyAccessUI(){adminRole.textContent=isSystemAdmin?'系統管理員':currentAccessRole==='manager'?'活動管理者':'結果檢視者';activeSurveySelect.disabled=D.surveys.length<=1;document.querySelectorAll('.nav[data-access]').forEach(n=>{let a=n.dataset.access;n.hidden=(a==='system'&&!isSystemAdmin)||(a==='manager'&&!canManage())});document.querySelectorAll('.systemOnly').forEach(x=>x.hidden=!isSystemAdmin);let addSurvey=document.querySelector('.surveyListHeaderV956>button');if(addSurvey)addSurvey.hidden=!isSystemAdmin;if(!isSystemAdmin)document.querySelectorAll('#surveyTable button').forEach(b=>{let text=b.textContent.trim();if(!['編輯','設為目前'].includes(text))b.hidden=true});if(!canManage())document.querySelectorAll('#dash button[onclick*="surveyP"]').forEach(b=>b.hidden=true)}

function normalizeEmail(email){return String(email||'').trim().toLowerCase()}
function memberGoogleEmail(m){let account=D.memberAccounts.find(a=>a.memberId===m?.id||a.id===m?.id);return normalizeEmail(account?.email||m?.googleEmail||m?.googleAccount||m?.email||m?.gmail||'')}
function memberCompanyEmailV957(m){let account=D.memberAccounts.find(a=>a.memberId===m?.id||a.id===m?.id);return normalizeEmail(account?.companyEmail||m?.companyEmail||m?.workEmail||m?.corporateEmail||'')}
function memberDisplayName(m){let dep=String(m?.department||m?.departmentName||'').trim(),name=String(m?.name||'').trim();return (dep&&name)?(dep+' '+name):(name||dep||'')}
function findMemberByGoogleEmail(email){let target=normalizeEmail(email);if(!target)return null;return D.members.find(m=>memberGoogleEmail(m)===target)||null}
function currentUserDisplayText(){let email=normalizeEmail(currentUser?.email),m=findMemberByGoogleEmail(email),assignment=surveyAssignments.find(a=>normalizeEmail(a.email)===email);return memberDisplayName(m)||String(assignment?.displayName||'').trim()||email||''}
function refreshCurrentUserDisplay(){let display=currentUserDisplayText();if(adminUser)adminUser.textContent=display;if(previewAdminUser)previewAdminUser.textContent=display}
function renderMemberGoogleOptions(){let select=document.getElementById('managerEmail'),list=document.getElementById('memberGoogleOptions'),options=D.members.filter(m=>memberGoogleEmail(m)).map(m=>({email:memberGoogleEmail(m),label:memberDisplayName(m)||m.name||m.id}));if(select&&select.tagName==='SELECT'){let current=select.value;select.innerHTML='<option value="">請選擇成員</option>'+options.map(x=>`<option value="${escAttr(x.email)}">${esc(x.label)}</option>`).join('');select.value=options.some(x=>x.email===current)?current:''}if(list)list.innerHTML=options.map(x=>`<option value="${escAttr(x.label)}"></option>`).join('')}
function managerPersonLabel(email){let m=findMemberByGoogleEmail(email);let display=memberDisplayName(m);return display?`<b>${esc(display)}</b>`:`<b class="muted">未對應人員</b>`}
function panel(id,b){if(['sysMemP','frontProtectP'].includes(id)&&!isSystemAdmin)return alert('此功能僅限系統管理員');if(id==='accessP'&&!canManage())return alert('此帳號沒有活動權限管理權限');if(['surveyP','memP','dateP','restP','costP','mailP','finalP','reimbursementP'].includes(id)&&!canManage())return alert('此帳號只有檢視權限');let p=document.getElementById(id);if(!p)return;document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));p.classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));if(b){b.classList.add('active');adminTitle.textContent=b.textContent}renderAdmin()}
function table(headers,rows){return '<div class="table"><table><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+(rows.join('')||'<tr><td colspan="'+headers.length+'" class="muted">尚無資料</td></tr>')+'</tbody></table></div>'}
function renderAdmin(){refreshCurrentUserDisplay();renderMemberGoogleOptions();applyAccessUI();renderSurveySelect();renderDashboard();renderSurveyPanel();renderMemberPanel();renderSystemMemberPanel();renderDatePanel();renderRestPanel();renderResults();renderCostEstimatePanel();renderFinalPanel();renderManagerPanel();renderMailPanelV957();applyAccessUI()}
function renderSurveySelect(){
  let current=D.surveys.find(s=>s.id===activeSurveyId)||null;
  let visible=D.surveys.filter(s=>!(typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true)));
  if(current&&!visible.some(s=>s.id===current.id))visible=[current,...visible];
  activeSurveySelect.innerHTML='<option value="">請選擇活動</option>'+visible.map(s=>{
    let archived=typeof isArchivedSurveyV775==='function'?isArchivedSurveyV775(s):(s.status==='archived'||s.archived===true);
    let label=(s.title||s.id)+(archived?'（已結案）':'');
    return `<option value="${s.id}" ${s.id===activeSurveyId?'selected':''}>${esc(label)}</option>`;
  }).join('')
}
async function setActiveSurvey(id){if(!isSystemAdmin&&!D.surveys.some(s=>s.id===id))return alert('此帳號沒有該活動權限');if(!confirmLeaveSurveyForm())return;surveyFormMode='view';editingSurveyId=null;surveyFormDirty=false;cancelDateEdit(false);cancelRestaurantEdit(false);activeSurveyId=id||null;await loadSurveyData();if(!canManage()){let activePanel=document.querySelector('.panel.active')?.id;if(['surveyP','memP','dateP','restP','costP','mailP','finalP'].includes(activePanel))panel('dash',document.querySelector('.nav[onclick*=dash]'))}history.replaceState(null,'',adminHash());renderFront();renderAdmin();toast('已切換目前活動')}
async function viewArchivedSurveyV781(id){
  let survey=D.surveys.find(s=>s.id===id);
  if(!survey)return alert('找不到活動資料，請重新整理後再試一次');
  if(!confirmLeaveSurveyForm())return;
  surveyFormMode='view';
  editingSurveyId=null;
  surveyFormDirty=false;
  cancelDateEdit(false);
  cancelRestaurantEdit(false);
  activeSurveyId=id;
  await loadSurveyData();
  history.replaceState(null,'',adminHash());
  renderFront();
  renderAdmin();
  surveyFormMode='edit';
  editingSurveyId=id;
  surveyFormDirty=false;
  if(surveyEditor)surveyEditor.dataset.formKey='';
  renderSurveyPanel();
  if(surveyEditor)surveyEditor.scrollIntoView({behavior:'smooth',block:'start'});
  toast('已切換至已結案活動');
}
window.viewArchivedSurveyV781=viewArchivedSurveyV781;
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
  let scoped=scopedMembers(),fillCount=scoped.filter(memberCanFill).length,eligibleCount=scoped.filter(m=>memberCanFill(m)&&memberBudgetEligible(m)).length,closedCount=scoped.filter(m=>!memberCanFill(m)).length,inactiveMasterCount=scoped.filter(m=>m.active===false).length;
  let summary=`<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>活動名單</span><strong>${scoped.length}</strong></div><div class="finalAttendanceKpi"><span>開放填寫</span><strong>${fillCount}</strong></div><div class="finalAttendanceKpi"><span>納入預算</span><strong>${eligibleCount}</strong></div><div class="finalAttendanceKpi"><span>主檔已停用</span><strong>${inactiveMasterCount}</strong></div></div>`;
  let note=`<div class="hintBox"><b>說明：</b>活動名單以建立當下的人員為準。之後在人員主檔停用同仁，不會影響既有活動；可再用「填寫資格」及「預算資格」獨立控制本活動。</div>`;
  memTable.innerHTML=summary+note+table(['部門','姓名','員工編號','主檔狀態','填寫資格','預算資格'],scoped.map(m=>{let canFill=memberCanFill(m),budgetOk=memberBudgetEligible(m),masterActive=m.active!==false;let fillToggle=`<button type="button" class="statusToggle ${canFill?'on':'off'}" aria-pressed="${canFill?'true':'false'}" onclick="toggleMemberFill('${m.id}',${canFill?'false':'true'},this)"><span class="statusPill">${canFill?'✓ 已開放':'✕ 已關閉'}</span><span class="switchKnob" aria-hidden="true"></span></button>`;let budgetToggle=`<button type="button" class="statusToggle budget ${canFill&&budgetOk?'on':'off'}" aria-pressed="${canFill&&budgetOk?'true':'false'}" onclick="toggleMemberBudget('${m.id}',${budgetOk?'false':'true'},this)" ${!canFill?'disabled title="未開放填寫時不列入預算計算"':''}><span class="statusPill">${canFill&&budgetOk?'$ 納入預算':'不納入預算'}</span><span class="switchKnob" aria-hidden="true"></span></button>`;return `<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td><td><span class="badge ${masterActive?'green':'gray'}">${masterActive?'啟用':'主檔已停用'}</span></td><td>${fillToggle}</td><td>${budgetToggle}</td></tr>`}));
}
function renderSystemMemberPanel(){
  let sysBox=document.getElementById('sysMemberTable');
  if(!sysBox)return;
  let currentDept=memDept?.value||'';
  if(memDept){memDept.innerHTML='<option value="">請選擇部門</option>'+D.departments.map(d=>{let n=d.name||d.departmentName||d.department||'';return `<option value="${escAttr(n)}">${esc(n)}</option>`}).join('');if(currentDept&&[...memDept.options].some(x=>x.value===currentDept))memDept.value=currentDept;}
  if(memberEditor)memberEditor.style.display=(isSystemAdmin&&memberFormMode!=='view')?'block':'none';
  let total=D.members.length,activeCount=D.members.filter(m=>m.active!==false).length,inactiveCount=total-activeCount;
  let summary=`<div class="finalAttendanceSummary"><div class="finalAttendanceKpi"><span>主檔人數</span><strong>${total}</strong></div><div class="finalAttendanceKpi"><span>啟用</span><strong>${activeCount}</strong></div><div class="finalAttendanceKpi"><span>停用</span><strong>${inactiveCount}</strong></div><div class="finalAttendanceKpi"><span>部門數</span><strong>${new Set(D.members.map(m=>m.department||m.departmentName||'')).size}</strong></div></div>`;
  sysBox.innerHTML=summary+table(['部門','姓名','員工編號','Google 帳號','公司信箱','狀態','操作'],D.members.map(m=>{let active=m.active!==false;return `<tr><td>${esc(m.department||m.departmentName||'')}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.employeeNo||m.empNo||'')}</td><td>${memberGoogleEmail(m)?esc(memberGoogleEmail(m)):'<span class="muted">未設定</span>'}</td><td>${memberCompanyEmailV957(m)?esc(memberCompanyEmailV957(m)):'<span class="muted">未設定</span>'}</td><td><span class="badge ${active?'green':'gray'}">${active?'啟用':'停用'}</span></td><td class="operationCell"><button class="btn" onclick="editMember('${m.id}')">修改</button> <button class="btn ${active?'stateActionV972':'green'}" onclick="toggleMember('${m.id}',${active?'false':'true'})">${active?'停用':'啟用'}</button> <button class="btn red" onclick="delDoc('members','${m.id}')">刪除</button></td></tr>`}));
}
function fillMemberForm(m){memDept.value=m?.department||m?.departmentName||'';newMem.value=m?.name||'';newEmp.value=m?.employeeNo||m?.empNo||'';if(memGoogle)memGoogle.value=memberGoogleEmail(m);if(memCompanyEmailV957)memCompanyEmailV957.value=memberCompanyEmailV957(m);memStatus.value=String(m?.active!==false)}
function startNewMember(){memberFormMode='new';editingMemberId=null;memberFormHeading.textContent='新增人員';memberModeBadge.textContent='新增模式';memberModeBadge.className='modeBadge new';memberSaveBtn.textContent='新增人員';fillMemberForm(null);memberEditor.style.display='block';newMem.focus()}
function editMember(id){let m=D.members.find(x=>x.id===id);if(!m)return alert('找不到這筆人員資料');memberFormMode='edit';editingMemberId=id;memberFormHeading.textContent='修改人員：'+(m.name||'');memberModeBadge.textContent='編輯模式';memberModeBadge.className='modeBadge edit';memberSaveBtn.textContent='儲存變更';fillMemberForm(m);memberEditor.style.display='block';memberEditor.scrollIntoView({behavior:'smooth',block:'start'})}
function cancelMemberEdit(){memberFormMode='view';editingMemberId=null;memberEditor.style.display='none'}
async function saveMember(){
  if(memberFormMode==='view')return;
  let department=memDept.value,name=newMem.value.trim(),employeeNo=newEmp.value.trim(),googleEmail=normalizeEmail(memGoogle?.value||''),companyEmail=normalizeEmail(memCompanyEmailV957?.value||'');
  if(!department||!name||!employeeNo)return alert('請完整填寫部門、姓名與員工編號');
  if(googleEmail&&!/^\S+@\S+\.\S+$/.test(googleEmail))return alert('請輸入有效的 Google 帳號');
  if(companyEmail&&!/^\S+@\S+\.\S+$/.test(companyEmail))return alert('請輸入有效的公司信箱');
  let duplicateGoogle=D.members.find(m=>memberGoogleEmail(m)===googleEmail&&m.id!==editingMemberId);if(googleEmail&&duplicateGoogle)return alert('此 Google 帳號已由 '+(duplicateGoogle.name||'其他人員')+' 使用');
  let duplicateCompanyEmail=D.members.find(m=>memberCompanyEmailV957(m)===companyEmail&&m.id!==editingMemberId);if(companyEmail&&duplicateCompanyEmail)return alert('此公司信箱已由 '+(duplicateCompanyEmail.name||'其他人員')+' 使用');
  let duplicate=D.members.find(m=>String(m.employeeNo||m.empNo||'').trim()===employeeNo&&m.id!==editingMemberId);if(duplicate)return alert('員工編號 '+employeeNo+' 已由 '+(duplicate.name||'其他人員')+' 使用');
  let data={department,name,employeeNo,active:memStatus.value==='true',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  memberSaveBtn.disabled=true;memberSaveBtn.textContent='儲存中…';
  try{let memberId=editingMemberId,existingMember=D.members.find(x=>x.id===editingMemberId);if(memberFormMode==='edit'&&existingMember?.active!==false&&data.active===false)await snapshotLegacySurveyRostersV1023();if(memberFormMode==='new'){data.createdAt=firebase.firestore.FieldValue.serverTimestamp();let ref=await col('members').add(data);memberId=ref.id}else{await doc('members',memberId).set(data,{merge:true})}await doc('members',memberId).set({googleEmail:firebase.firestore.FieldValue.delete(),googleAccount:firebase.firestore.FieldValue.delete(),gmail:firebase.firestore.FieldValue.delete(),companyEmail:firebase.firestore.FieldValue.delete(),workEmail:firebase.firestore.FieldValue.delete(),corporateEmail:firebase.firestore.FieldValue.delete()},{merge:true});if(googleEmail||companyEmail)await doc('memberAccounts',memberId).set({memberId,email:googleEmail||firebase.firestore.FieldValue.delete(),companyEmail:companyEmail||firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});else{let account=await doc('memberAccounts',memberId).get();if(account.exists)await doc('memberAccounts',memberId).delete()}let wasNew=memberFormMode==='new';memberFormMode='view';editingMemberId=null;await loadAll();renderFront();renderAdmin();toast(wasNew?'人員已新增':'人員資料已更新')}catch(e){console.error('save member failed',e);alert('人員資料儲存失敗，請檢查網路或 Firestore 規則後再試一次')}finally{memberSaveBtn.disabled=false;if(memberFormMode!=='view')memberSaveBtn.textContent=memberFormMode==='new'?'新增人員':'儲存變更'}
}
async function toggleMemberBudget(id,budgetEligible,btn){if(!canManage())return alert('此帳號沒有編輯權限');if(!activeSurveyId)return alert('請先選擇活動');let m=D.members.find(x=>x.id===id);if(!m)return;if(!memberCanFill(m)&&budgetEligible)return alert('此人員尚未開放填寫，不能納入預算');if(btn)btn.disabled=true;try{await doc('budgetEligibility',activeSurveyId+'__'+id).set({surveyId:activeSurveyId,memberId:id,budgetEligible,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});await loadAll();renderFront();renderAdmin();toast((m.name||'人員')+'已更新本活動預算資格')}catch(e){console.error('toggleMemberBudget failed',e);alert('預算資格更新失敗，請確認 Firestore 規則已開放 budgetEligibility 寫入權限。')}finally{if(btn)btn.disabled=false}}
async function toggleMemberFill(id,canFill,btn){if(!canManage())return alert('此帳號沒有編輯權限');if(!activeSurveyId)return alert('請先選擇活動');let m=D.members.find(x=>x.id===id);if(!m)return;if(btn)btn.disabled=true;let data={surveyId:activeSurveyId,memberId:id,canFill,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(canFill===false)data.budgetEligible=false;try{await doc('budgetEligibility',activeSurveyId+'__'+id).set(data,{merge:true});await loadAll();renderFront();renderAdmin();toast((m.name||'人員')+(canFill?'已開放填寫':'已關閉填寫'))}catch(e){console.error('toggleMemberFill failed',e);alert('填寫資格更新失敗，請確認 Firestore 規則已開放 budgetEligibility 寫入權限。')}finally{if(btn)btn.disabled=false}}
async function snapshotLegacySurveyRostersV1023(){
  let legacy=D.surveys.filter(s=>!Array.isArray(s.memberRosterIds));
  if(!legacy.length)return 0;
  await Promise.all(legacy.map(s=>doc('surveys',s.id).set({memberRosterIds:rosterIdsForMembersV1023(D.members,s.targetDepartments),memberRosterVersion:'v1',memberRosterCapturedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})));
  legacy.forEach(s=>{s.memberRosterIds=rosterIdsForMembersV1023(D.members,s.targetDepartments);s.memberRosterVersion='v1'});
  return legacy.length;
}
async function toggleMember(id,active){
  let m=D.members.find(x=>x.id===id);if(!m)return;
  if(!active&&!confirm('確定停用 '+(m.name||'這位人員')+'？\n\n既有活動仍會保留此人；之後新建的活動不會再納入。'))return;
  try{
    if(!active)await snapshotLegacySurveyRostersV1023();
    await doc('members',id).set({active,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await loadAll();renderFront();renderAdmin();toast(active?'人員已啟用':'人員已停用；既有活動名單已保留');
  }catch(e){console.error('toggle member failed',e);alert(!active?'停用失敗：既有活動名單未能安全保存，請檢查網路後再試一次。':'人員啟用失敗，請檢查網路後再試一次。')}
}
let memberImportModeV912='partial',pendingMemberImportV912=null;
function chooseMemberImport(){
  pendingMemberImportV912=null;
  document.querySelectorAll('input[name="memberImportMode"]').forEach(input=>{input.checked=input.value==='partial'});
  el('memberImportModeMask').style.display='flex';
}
function closeMemberImportMode(){el('memberImportModeMask').style.display='none'}
function continueMemberImport(){
  let selected=document.querySelector('input[name="memberImportMode"]:checked');
  memberImportModeV912=selected?.value==='full'?'full':'partial';
  closeMemberImportMode();
  memberImportInput.click();
}
function closeMemberImportReview(){
  el('memberImportReviewMask').style.display='none';
  pendingMemberImportV912=null;
}
function setMissingMemberSelectionV912(checked){
  document.querySelectorAll('.missingMemberImportCheckV912').forEach(input=>{input.checked=checked});
  updateMemberImportConfirmLabelV912();
}
function selectedMissingMemberIdsV912(){return [...document.querySelectorAll('.missingMemberImportCheckV912:checked')].map(input=>input.value)}
function updateMemberImportConfirmLabelV912(){
  let count=selectedMissingMemberIdsV912().length,button=el('confirmMemberImportBtn');
  if(button)button.textContent=count?`匯入並停用 ${count} 人`:'匯入名單';
}
function memberEmployeeNoV912(member){return String(member?.employeeNo||member?.empNo||'').trim()}
function memberDepartmentV912(member){return String(member?.department||member?.departmentName||member?.departmentId||'').trim()}
function buildMemberImportReviewV912(rows,mode){
  let googleHeaders=['Google帳號','Google 帳號','Google Email','Email','電子郵件'];
  let companyHeaders=['公司信箱','公司 Email','公司Email','Company Email','工作信箱'];
  let hasGoogleColumn=Object.keys(rows[0]||{}).some(key=>googleHeaders.includes(String(key).replace(/^\uFEFF/,'').trim()));
  let hasCompanyEmailColumn=Object.keys(rows[0]||{}).some(key=>companyHeaders.includes(String(key).replace(/^\uFEFF/,'').trim()));
  let validDepartments=new Set(D.departments.map(d=>String(d.name||d.departmentName||d.department||'').trim()).filter(Boolean));
  let existingByNo=new Map(D.members.map(member=>[memberEmployeeNoV912(member),member]).filter(entry=>entry[0]));
  let seen=new Set(),uploadedEmployeeNos=new Set(),seenEmails=new Set(),seenCompanyEmails=new Set(),errors=[],items=[];
  rows.forEach((row,index)=>{
    let line=index+2,department=String(memberCell(row,['部門'])).trim(),name=String(memberCell(row,['姓名'])).trim(),employeeNo=String(memberCell(row,['員工編號','員編'])).trim(),googleEmail=normalizeEmail(memberCell(row,googleHeaders)),companyEmail=normalizeEmail(memberCell(row,companyHeaders)),status=String(memberCell(row,['狀態'])).trim();
    if(employeeNo)uploadedEmployeeNos.add(employeeNo);
    if(!department||!name||!employeeNo){errors.push(`第 ${line} 列：部門、姓名與員工編號為必填`);return}
    if(!validDepartments.has(department)){errors.push(`第 ${line} 列：找不到部門「${department}」`);return}
    if(seen.has(employeeNo)){errors.push(`第 ${line} 列：員工編號 ${employeeNo} 在檔案中重複`);return}
    seen.add(employeeNo);
    if(googleEmail&&!/^\S+@\S+\.\S+$/.test(googleEmail)){errors.push(`第 ${line} 列：Google 帳號格式不正確`);return}
    if(googleEmail&&seenEmails.has(googleEmail)){errors.push(`第 ${line} 列：Google 帳號 ${googleEmail} 在檔案中重複`);return}
    if(googleEmail)seenEmails.add(googleEmail);
    if(companyEmail&&!/^\S+@\S+\.\S+$/.test(companyEmail)){errors.push(`第 ${line} 列：公司信箱格式不正確`);return}
    if(companyEmail&&seenCompanyEmails.has(companyEmail)){errors.push(`第 ${line} 列：公司信箱 ${companyEmail} 在檔案中重複`);return}
    if(companyEmail)seenCompanyEmails.add(companyEmail);
    let existing=existingByNo.get(employeeNo)||null,owner=D.members.find(member=>memberGoogleEmail(member)===googleEmail&&member.id!==existing?.id);
    if(googleEmail&&owner){errors.push(`第 ${line} 列：Google 帳號已由 ${owner.name||'其他人員'} 使用`);return}
    let companyOwner=D.members.find(member=>memberCompanyEmailV957(member)===companyEmail&&member.id!==existing?.id);
    if(companyEmail&&companyOwner){errors.push(`第 ${line} 列：公司信箱已由 ${companyOwner.name||'其他人員'} 使用`);return}
    let active=!['停用','否','false','0','no'].includes(status.toLowerCase());
    let data={department,name,employeeNo,active};
    items.push({existing,googleEmail,hasGoogleColumn,companyEmail,hasCompanyEmailColumn,data});
  });
  let addCount=items.filter(item=>!item.existing).length,updateCount=items.length-addCount;
  let missing=mode==='full'?D.members.filter(member=>member.active!==false&&!uploadedEmployeeNos.has(memberEmployeeNoV912(member))):[];
  return {mode,items,errors,missing,addCount,updateCount,hasGoogleColumn,hasCompanyEmailColumn};
}
function renderMemberImportReviewV912(review){
  el('memberImportReviewCaption').textContent=`${review.fileName}・${review.mode==='full'?'完整名單核對':'部分名單更新'}`;
  let summary=`<div class="memberImportSummaryV912"><span>可匯入 <b>${review.items.length}</b> 筆</span><span>新增 <b>${review.addCount}</b> 筆</span><span>更新 <b>${review.updateCount}</b> 筆</span><span>錯誤 <b>${review.errors.length}</b> 筆</span></div>`;
  let errorsHtml=review.errors.length?`<details class="memberImportErrorsV912"><summary>${review.errors.length} 筆資料有誤，將略過</summary><ul>${review.errors.map(error=>`<li>${esc(error)}</li>`).join('')}</ul></details>`:'';
  let missingHtml='';
  if(review.mode==='full'){
    missingHtml=review.missing.length?`<section class="memberImportMissingV912"><div class="memberImportMissingHeadV912"><div><h3>本次名單未出現的啟用人員</h3><p>可能為離職、調職或名單遺漏。系統不會自動停用，請確認後自行勾選。</p></div><div class="btns"><button class="btn" type="button" onclick="setMissingMemberSelectionV912(true)">全選</button><button class="btn" type="button" onclick="setMissingMemberSelectionV912(false)">取消全選</button></div></div><div class="memberImportMissingTableV912"><table><thead><tr><th>停用</th><th>部門</th><th>姓名</th><th>員工編號</th><th>Google 帳號</th></tr></thead><tbody>${review.missing.map(member=>`<tr><td><input class="missingMemberImportCheckV912" type="checkbox" value="${esc(member.id)}" onchange="updateMemberImportConfirmLabelV912()" aria-label="停用 ${esc(member.name||'此人員')}"></td><td>${esc(memberDepartmentV912(member))}</td><td><b>${esc(member.name||'')}</b></td><td>${esc(memberEmployeeNoV912(member))}</td><td>${esc(memberGoogleEmail(member)||'未設定')}</td></tr>`).join('')}</tbody></table></div></section>`:`<div class="memberImportNoMissingV912">完整名單核對完成，沒有發現本次缺少的啟用人員。</div>`;
  }
  el('memberImportReviewBody').innerHTML=summary+errorsHtml+missingHtml;
  el('memberImportReviewMask').style.display='flex';
  updateMemberImportConfirmLabelV912();
}

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

function memberWorkbook(rows,sheetName='人員名單'){let wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows,{header:['部門','姓名','員工編號','Google帳號','公司信箱','狀態']});ws['!cols']=[{wch:16},{wch:14},{wch:14},{wch:28},{wch:34},{wch:10}];XLSX.utils.book_append_sheet(wb,ws,sheetName);return wb}
function downloadMemberTemplate(){if(!requireXlsx('下載標準範本'))return;XLSX.writeFile(memberWorkbook([{'部門':'行政部','姓名':'王小明','員工編號':'7901','Google帳號':'example@gmail.com','公司信箱':'xiaoming@mail.sinotech-eng.com','狀態':'啟用'}],'匯入範本'),'人員匯入標準範本.xlsx')}
function exportMembers(){if(!requireXlsx('匯出人員名單'))return;let rows=D.members.map(m=>({'部門':m.department||m.departmentName||'','姓名':m.name||'','員工編號':m.employeeNo||m.empNo||'','Google帳號':memberGoogleEmail(m),'公司信箱':memberCompanyEmailV957(m),'狀態':m.active===false?'停用':'啟用'}));XLSX.writeFile(memberWorkbook(rows),'人員名單.xlsx')}
function memberCell(row,names){let keys=Object.keys(row);for(let name of names){let key=keys.find(k=>String(k).replace(/^\uFEFF/,'').trim()===name);if(key!==undefined)return row[key]}return''}
async function importMembers(file){if(!requireXlsx('匯入人員 Excel'))return;
  if(!file)return;
  memberImportResult.className='memberImportResult';memberImportResult.textContent='正在讀取 '+file.name+'…';
  try{
    let workbook=XLSX.read(await file.arrayBuffer(),{type:'array'}),sheet=workbook.Sheets[workbook.SheetNames[0]],rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});
    if(!rows.length)throw new Error('檔案內沒有可匯入的資料');
    let review=buildMemberImportReviewV912(rows,memberImportModeV912);
    if(!review.items.length){let summary=`沒有可匯入的資料${review.errors.length?'，共 '+review.errors.length+' 筆錯誤':''}`;memberImportResult.className='memberImportResult error';memberImportResult.textContent=summary;return alert(summary)}
    pendingMemberImportV912={...review,fileName:file.name};
    memberImportResult.textContent=`已讀取 ${review.items.length} 筆，請在差異核對視窗確認。`;
    renderMemberImportReviewV912(pendingMemberImportV912);
  }catch(e){console.error('member import failed',e);memberImportResult.className='memberImportResult error';memberImportResult.textContent='匯入失敗：'+(e.message||e)}
}
async function confirmMemberImport(){
  let review=pendingMemberImportV912;if(!review)return;
  let disableIds=review.mode==='full'?selectedMissingMemberIdsV912():[],button=el('confirmMemberImportBtn');
  let auditBeforeV912={count:D.members.length,active:D.members.filter(member=>member.active!==false).length};
  button.disabled=true;button.textContent='處理中…';
  try{
    if(disableIds.length)await snapshotLegacySurveyRostersV1023();
    for(let item of review.items){
      let memberId,data={...item.data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
      if(item.existing){memberId=item.existing.id;await doc('members',memberId).set(data,{merge:true})}
      else{data.createdAt=firebase.firestore.FieldValue.serverTimestamp();memberId=(await col('members').add(data)).id}
      if(item.hasGoogleColumn||item.hasCompanyEmailColumn){
        await doc('members',memberId).set({googleEmail:firebase.firestore.FieldValue.delete(),googleAccount:firebase.firestore.FieldValue.delete(),gmail:firebase.firestore.FieldValue.delete(),companyEmail:firebase.firestore.FieldValue.delete(),workEmail:firebase.firestore.FieldValue.delete(),corporateEmail:firebase.firestore.FieldValue.delete()},{merge:true});
        let accountSnapshot=await doc('memberAccounts',memberId).get(),accountData=accountSnapshot.exists?accountSnapshot.data():{};
        let nextGoogle=item.hasGoogleColumn?item.googleEmail:normalizeEmail(accountData.email||''),nextCompany=item.hasCompanyEmailColumn?item.companyEmail:normalizeEmail(accountData.companyEmail||'');
        if(nextGoogle||nextCompany)await doc('memberAccounts',memberId).set({memberId,email:nextGoogle||firebase.firestore.FieldValue.delete(),companyEmail:nextCompany||firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        else if(accountSnapshot.exists)await doc('memberAccounts',memberId).delete();
      }
    }
    for(let memberId of disableIds){
      let member=D.members.find(item=>item.id===memberId);if(!member||member.active===false)continue;
      await doc('members',memberId).set({active:false,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),deactivatedAt:firebase.firestore.FieldValue.serverTimestamp(),deactivatedByEmail:normalizeEmail(currentUser?.email||''),deactivationReason:'full-roster-import-missing'},{merge:true});
    }
    let {addCount,updateCount,errors}=review;
    closeMemberImportReview();memberFormMode='view';editingMemberId=null;
    await loadAll();renderFront();renderAdmin();
    memberImportResult.className='memberImportResult success';memberImportResult.textContent=`匯入完成：新增 ${addCount} 筆、更新 ${updateCount} 筆${disableIds.length?'、停用 '+disableIds.length+' 人':''}${errors.length?'，略過 '+errors.length+' 筆錯誤':''}`;
    if(typeof writeAuditDetailV760==='function')await writeAuditDetailV760({action:'匯入',targetType:'人員',targetId:'members',targetLabel:'人員主檔',before:auditBeforeV912,after:{count:D.members.length,active:D.members.filter(member=>member.active!==false).length},fields:['count','active'],surveyId:'',summary:`匯入人員主檔：新增 ${addCount}、更新 ${updateCount}${disableIds.length?'、停用 '+disableIds.length:''}`});
    toast(disableIds.length?'人員名單已匯入並完成停用核對':'人員名單匯入完成');
  }catch(e){console.error('member import write failed',e);memberImportResult.className='memberImportResult error';memberImportResult.textContent='寫入失敗：'+(e.message||e)}
  finally{button.disabled=false;updateMemberImportConfirmLabelV912()}
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
function renderManagerPanel(){if(!managerTable)return;renderMemberGoogleOptions();managerTable.innerHTML=table(['分享成員','權限','狀態','操作'],D.managers.map(m=>`<tr><td>${managerPersonLabel(m.email)}</td><td>${m.role==='viewer'?'結果檢視者':'活動管理者'}</td><td><span class="badge ${m.enabled!==false?'green':'gray'}">${m.enabled!==false?'啟用':'停用'}</span></td><td><button class="btn red" onclick="removeSurveyManager('${escAttr(m.id)}')">移除</button></td></tr>`))}
async function saveSurveyManager(){if(!canManage())return alert('此帳號沒有活動權限管理權限');if(!activeSurveyId)return alert('請先選擇活動');let email=managerEmail.value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))return alert('請選擇分享成員');let selectedMember=findMemberByGoogleEmail(email);if(!selectedMember)return alert('請從分享成員清單選擇人員');let data={surveyId:activeSurveyId,email,role:managerRole.value==='viewer'?'viewer':'manager',enabled:true,memberId:selectedMember.id||'',displayName:memberDisplayName(selectedMember),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};await doc('surveyManagers',managerDocId(activeSurveyId,email)).set(data,{merge:true});managerEmail.value='';await loadSurveyData();renderAdmin();toast('活動權限已更新')}
async function removeSurveyManager(id){if(!canManage())return;if(!confirm('確定移除此活動權限？'))return;let target=D.managers.find(m=>m.id===id);if(!target||target.surveyId!==activeSurveyId)return alert('只能移除目前活動的權限');await doc('surveyManagers',id).delete();await loadSurveyData();renderAdmin();toast('活動權限已移除')}
function copyAdminLink(){if(!activeSurveyId)return alert('請先選擇活動');let url=location.href.split('#')[0]+adminHash();if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('活動後台網址已複製')).catch(()=>prompt('請複製活動後台網址',url))}else prompt('請複製活動後台網址',url)}
function copyFrontLink(){if(!activeSurveyId)return alert('請先選擇活動');let url=frontUrl(false);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('活動前台網址已複製')).catch(()=>prompt('請複製活動前台網址',url))}else prompt('請複製活動前台網址',url)}
function preferredDateOf(r){return r.preferredDateId||r.primaryDateId||(Array.isArray(r.dateIds)?r.dateIds[0]:'')||''}
function alternateDateOf(r){return r.alternateDateId||r.secondaryDateId||(Array.isArray(r.dateIds)?r.dateIds[1]:'')||''}
function responseDateIds(r){return [...new Set([preferredDateOf(r),alternateDateOf(r),...(Array.isArray(r.dateIds)?r.dateIds:[])].filter(Boolean))]}

function memberSettingOverride(m){return m?D.budgetEligibility.find(x=>x.memberId===m.id):null}
function baseMemberCanFill(m){return !m || m.canFill!==false}
function memberCanFill(m){if(!m)return true;let override=memberSettingOverride(m);return override&&override.canFill!==undefined?override.canFill!==false:baseMemberCanFill(m)}
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
    let notificationFocused=String(window.__notificationFocusV922?.surveyId||'')===String(activeSurveyId||'')&&String(window.__notificationFocusV922?.responseId||'')===String(r.id||'');
    let search=((r.departmentName||'')+' '+(r.memberName||'')+' '+(r.employeeNo||'')).toLowerCase();
    let rankIds=(r.restaurantRanks||[]).slice(0,rankCount).filter(Boolean),rankNames=rankIds.map(id=>D.restaurants.find(x=>x.id===id)?.name||id);
    let fullRanks=rankNames.map((name,i)=>`<span class="rankTag"><b>${i+1}</b>${esc(name)}</span>`).join('');
    let restaurantSummary=r.cannotAttend?'<span class="muted nowrap">不列入排名</span>':fullRanks||'<span class="muted">未填</span>';
    let note=String(r.note||'').trim(),lateAssisted=!!r.assistedAfterDeadline,hasDetail=!!note||lateAssisted;
    let availableDateLabels=responseDateIds(r).map(id=>D.dates.find(d=>d.id===id)?.label||id);
    let availableDates=availableDateLabels.length?`<div class="responseDateList">${availableDateLabels.map(label=>`<span>${esc(label)}</span>`).join('')}</div>`:'<span class="muted">—</span>';
    let actions=canManage()?`<div class="responseActionButtons"><button class="btn" onclick="editResponse('${escAttr(r.id)}')">編輯</button><button class="btn red" onclick="deleteResponse('${escAttr(r.id)}')">刪除</button></div>`:'<span class="muted nowrap">僅供檢視</span>';
    let toggle=hasDetail?`<button class="responseExpandButton${notificationFocused?' open':''}" type="button" aria-label="展開問卷詳細內容" aria-expanded="${notificationFocused?'true':'false'}" onclick="toggleResponseDetail('${escAttr(r.id)}',this)"><span></span></button>`:'';
    let main=`<tr class="responseRow${notificationFocused?' notificationFocusV913':''}" data-response-id="${escAttr(r.id)}" data-search="${escAttr(search)}" data-department="${escAttr(r.departmentName||'')}" data-cannot="${r.cannotAttend?'true':'false'}" data-member-order="${memberOrder.get(r.memberId)??999999}" data-submitted="${responseTimeValue(r)}"><td class="responseTextCell responseDepartmentCellV960"><div class="responseDepartmentInnerV961">${toggle}<span>${esc(r.departmentName)}</span></div></td><td class="responseTextCell"><b>${esc(r.memberName)}</b></td><td class="responseCenterCell">${esc(r.employeeNo||'')}</td><td class="responseCenterCell"><span class="yesNoBadge ${r.cannotAttend?'yes':'no'}">${r.cannotAttend?'不克參加':'可參加'}</span></td><td class="responseTextCell responseDates">${availableDates}</td><td class="responseTextCell"><div class="rankTags rankSummaryTags">${restaurantSummary}</div></td><td class="responseCenterCell"><span class="responseTime">${esc(formatDateTimeV784(r.submittedAt||r.submittedAtText))}</span></td><td class="responseCenterCell">${actions}</td></tr>`;
    if(!hasDetail)return main;
    let detailParts=[];
    if(note)detailParts.push(`<div><span class="responseDetailLabel">備註</span><p>${esc(note)}</p></div>`);
    if(lateAssisted){
      let operator=String(r.submittedByAdminName||r.submittedByAdminEmail||'管理員').trim();
      let operatedAt=formatDateTimeV784(r.submittedByAdminAt||r.submittedAt||r.submittedAtText);
      detailParts.push(`<div class="responseLateAssistV935"><span class="responseLateAssistBadgeV935">截止後由管理員協助填寫</span><p class="responseLateAssistMetaV935">${esc(operator)}${operatedAt?'・'+esc(operatedAt):''}</p></div>`);
    }
    let detail=`<tr class="responseDetailRow" data-detail-for="${escAttr(r.id)}"${notificationFocused?'':' hidden'}><td colspan="8"><div class="responseDetailPanel">${detailParts.join('')}</div></td></tr>`;
    return main+detail;
  });
  let missingHeaders=canManage()?['部門','姓名','員編','操作']:['部門','姓名','員編'];
  let missingRows=missing.map(m=>{
    let department=m.department||m.departmentName||'',employeeNo=m.employeeNo||m.empNo||'',search=(department+' '+(m.name||'')+' '+employeeNo).toLowerCase();
    return`<tr class="missingRowV953" data-search="${escAttr(search)}" data-department="${escAttr(department)}" data-name="${escAttr(m.name||'')}" data-employee="${escAttr(employeeNo)}"><td>${esc(department)}</td><td><b>${esc(m.name)}</b></td><td>${esc(employeeNo)}</td>${canManage()?`<td><button class="btn proxyFillBtnV777 proxyFillBtnV779" type="button" onclick="startProxyResponseV777('${escAttr(m.id)}')">協助填寫</button></td>`:''}</tr>`
  });
  resultTables.innerHTML=
    `<div class="resultSummary">
      <div class="resultKpi"><span>填寫進度</span><strong>${filled} / ${total}</strong><small>已填／應填人數</small></div>
      <div class="resultKpi"><span>完成率</span><strong>${rate}%</strong><small>${missing.length?('尚有 '+missing.length+' 人未填'):'已全部完成'}</small></div>
      <div class="resultKpi"><span>不克參加</span><strong>${noCount}</strong><small>目前回覆人數</small></div>
      <div class="resultKpi text"><span>最多人可參加</span><strong>${esc(bestDate?.label||'尚無資料')}</strong><small>${bestDate?bestDate.count+' 人':''}</small></div>
      <div class="resultKpi text"><span>餐廳第一名</span><strong>${esc(bestRest?.name||'尚無資料')}</strong><small>${bestRest?bestRest.score+' 分':''}</small></div>
    </div>
    <section class="resultGroup resultAnalysisGroup">
      <header class="resultGroupHead">
        <div><h3>投票分析</h3><p>比較可出席日期與餐廳票選結果，作為最終決議參考。</p></div>
      </header>
      <div class="resultGrid">
        <section class="resultSection"><div class="resultSectionHead resultDateSectionHead"><h3>日期統計與可出席名單</h3><div class="dateFilterSlot"></div></div><div class="dateDecisionList">${dateStats.map(x=>{let isCurrent=String(D.final?.finalDateId||'')===String(x.id);let action=canManage()?(isCurrent?'<span class="currentDecisionBadge">目前決議</span>':`<button class="btn finalDatePickButton" onclick="chooseFinalDate('${escAttr(x.id)}')">設為最終日期</button>`):'';return`<div class="dateDecisionItem${isCurrent?' isCurrentDecision':''}" data-date-id="${escAttr(x.id)}"><div class="dateDecisionMain"><span><b>${esc(x.label)}</b></span><div class="statTrack"><i class="dateVoteBarV953" style="width:${Math.round(x.count/maxDate*100)}%"></i></div><strong class="dateVoteCountV953">${x.count} 人</strong>${action}</div><details><summary>查看當天可出席的 ${x.count} 人</summary><div class="datePeopleChips">${x.people.map(r=>`<span class="datePersonChip">${esc(r.departmentName||'')}・${esc(r.memberName||'')}</span>`).join('')||'<span class="muted">目前無人選擇此日期</span>'}</div></details></div>`}).join('')||'<div class="muted">尚無日期資料</div>'}</div></section>
        <section class="resultSection"><div class="resultSectionHead"><h3>餐廳排名</h3></div><div class="restaurantRanking">${restStats.map((x,i)=>`<div class="rankResult"><span class="rankIndex">${i+1}</span><div class="rankResultMain"><h4>${esc(x.name)}</h4><div class="rankChoiceMetrics">${x.counts.map((count,rankIndex)=>`<span><small>${rankLabel(rankIndex)}選擇</small><b>${count}</b></span>`).join('')||'<span class="muted">尚無選擇資料</span>'}</div></div><div class="rankScore"><strong>${x.score}</strong><span class="rankScoreLabel">加權分數<button class="scoreHelp" type="button" aria-label="加權分數說明：依第一、第二、第三選擇加權計算" data-tooltip="依第一、第二、第三選擇加權計算">?</button></span></div></div>`).join('')||'<div class="muted">尚無餐廳資料</div>'}</div></section>
      </div>
    </section>
    <section class="resultGroup resultManagementGroup">
      <header class="resultGroupHead">
        <div><h3>回覆管理</h3><p>查看尚未填寫的人員，並搜尋、篩選或維護已送出的回覆。</p></div>
      </header>
      <div class="resultManagementStackV953">
      <section class="resultSection resultMissingSection resultDataSectionV953">
        <div class="responseResultsHead dataSectionHeadV953">
          <div><h3>未填名單</h3><p>尚未完成填寫的人員</p></div>
          <span class="countBadge ${missing.length?'warn':''}"><b id="missingVisibleCountV953">${missing.length}</b> / ${missing.length} 人</span>
        </div>
        <div class="resultDetailsBody">
          <div class="resultTools missingToolsV953">
            <input id="missingSearchV953" type="search" placeholder="搜尋姓名、部門或員編" oninput="filterMissingRowsV953()">
            <select id="missingDeptFilterV953" onchange="filterMissingRowsV953()"><option value="">全部部門</option>${deptNames.map(n=>`<option value="${escAttr(n)}">${esc(n)}</option>`).join('')}</select>
            <button class="btn green" type="button" onclick="exportFilteredMissingV953()">Excel 匯出</button>
          </div>
          <div class="table missingTableV953"><table><thead><tr>${missingHeaders.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${missingRows.join('')}<tr id="missingEmptyRowV953"${missingRows.length?' hidden':''}><td colspan="${missingHeaders.length}" class="muted">目前沒有符合條件的未填人員</td></tr></tbody></table></div>
        </div>
      </section>
      <section class="resultSection responseResultsSection resultDataSectionV953">
        <div class="responseResultsHead">
          <div><h3>填寫明細</h3><p>已送出的回覆資料</p></div>
          <span class="countBadge"><b id="responseVisibleCount">${visibleResponses.length}</b> / ${visibleResponses.length} 筆</span>
        </div>
        <div class="resultDetailsBody">
          <div class="resultTools">
            <input id="responseSearch" type="search" placeholder="搜尋姓名、部門或員編" oninput="filterResponseRows()">
            <select id="responseDeptFilter" onchange="filterResponseRows()"><option value="">全部部門</option>${deptNames.map(n=>`<option value="${escAttr(n)}">${esc(n)}</option>`).join('')}</select>
            <select id="responseSort" aria-label="填寫明細排序" onchange="filterResponseRows()"><option value="member">部門／員編排序</option><option value="latest">最新送出優先</option><option value="earliest">最早送出優先</option></select>
            <label><input id="responseCannotOnly" type="checkbox" onchange="filterResponseRows()">只看不克參加</label>
            <button class="btn green" onclick="exportExcel()">Excel 匯出</button>
          </div>
          <div class="table responseTable"><table><thead><tr><th class="alignLeft">部門</th><th class="alignLeft">姓名</th><th class="alignCenter">員編</th><th class="alignCenter">出席狀態</th><th class="alignLeft">可參加日期</th><th class="alignLeft">餐廳摘要</th><th class="alignCenter">送出時間</th><th class="alignCenter">操作</th></tr></thead><tbody>${responseRows.join('')||'<tr><td colspan="8" class="muted">尚無資料</td></tr>'}</tbody></table></div>
        </div>
      </section>
      </div>
    </section>`;
  filterMissingRowsV953();
  filterResponseRows();
}
function filterResponseRows(){
  let q=(document.getElementById('responseSearch')?.value||'').trim().toLowerCase();
  let dep=document.getElementById('responseDeptFilter')?.value||'';
  let onlyCannot=!!document.getElementById('responseCannotOnly')?.checked;
  let sortMode=document.getElementById('responseSort')?.value||'member',rows=[...document.querySelectorAll('.responseRow')];rows.sort((a,b)=>{let memberDiff=Number(a.dataset.memberOrder)-Number(b.dataset.memberOrder);if(sortMode==='latest')return Number(b.dataset.submitted)-Number(a.dataset.submitted)||memberDiff;if(sortMode==='earliest')return Number(a.dataset.submitted)-Number(b.dataset.submitted)||memberDiff;return memberDiff});if(rows[0]?.parentElement){let body=rows[0].parentElement,details=new Map([...document.querySelectorAll('.responseDetailRow')].map(row=>[row.dataset.detailFor,row]));rows.forEach(row=>{body.appendChild(row);let detail=details.get(row.dataset.responseId);if(detail)body.appendChild(detail)})}
  let visible=0;
  document.querySelectorAll('.responseRow').forEach(row=>{let show=(!q||(row.dataset.search||'').includes(q))&&(!dep||row.dataset.department===dep)&&(!onlyCannot||row.dataset.cannot==='true'),focused=String(window.__notificationFocusV922?.responseId||'')===String(row.dataset.responseId||'')&&String(window.__notificationFocusV922?.surveyId||'')===String(activeSurveyId||'');row.hidden=!show;let detail=[...document.querySelectorAll('.responseDetailRow')].find(item=>item.dataset.detailFor===row.dataset.responseId),button=row.querySelector('.responseExpandButton');if(!show&&detail)detail.hidden=true;if(show&&focused&&detail){detail.hidden=false;button?.classList.add('open');button?.setAttribute('aria-expanded','true')}else if(!show&&!focused){button?.classList.remove('open');button?.setAttribute('aria-expanded','false')}if(show)visible++});
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
  let isProxySeed=!!(window.proxyResponseSeedV777&&window.proxyResponseSeedV777.id===editingResponseId);
  let data={surveyId:r.surveyId||activeSurveyId,memberId:r.memberId||'',departmentName:r.departmentName||'',memberName:r.memberName||'',employeeNo:r.employeeNo||'',preferredDateId:'',alternateDateId:'',dateIds:no?[]:dateIds,cannotAttend:no,restaurantRanks:no?[]:ranks,note:responseEditNote.value.trim(),adminEditedAt:firebase.firestore.FieldValue.serverTimestamp(),adminEditedBy:currentUser?.email||''};
  if(!r.submittedAt)data.submittedAt=firebase.firestore.FieldValue.serverTimestamp();
  if(!r.submittedAtText)data.submittedAtText=formatDateTimeV784(new Date());
  if(isProxySeed){data.submittedByAdmin=true;data.submissionMethod='assisted';data.assistedAfterDeadline=!!window.proxyResponseSeedV777?.assistedAfterDeadline;data.submittedByAdminAt=firebase.firestore.FieldValue.serverTimestamp();data.submittedByAdminEmail=currentUser?.email||'';data.submittedByAdminName=currentUserDisplayText?.()||currentUser?.displayName||currentUser?.email||''}
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
  const cmp=(x,y,opts)=>safe(x).localeCompare(safe(y),'zh-Hant',opts);
  let dep=cmp(a.departmentName||a.department,b.departmentName||b.department);
  if(dep!==0)return dep;
  let emp=cmp(a.employeeNo||a.empNo,b.employeeNo||b.empNo,{numeric:true,sensitivity:'base'});
  if(emp!==0)return emp;
  let name=cmp(a.memberName||a.name,b.memberName||b.name);
  if(name!==0)return name;
  let timeA=a.submittedAt?.toMillis?.()||new Date(a.submittedAtText||0).getTime()||0;
  let timeB=b.submittedAt?.toMillis?.()||new Date(b.submittedAtText||0).getTime()||0;
  return timeA-timeB;
}
function exportExcel(){
  if(!requireXlsx('Excel 匯出'))return;
  let wb=XLSX.utils.book_new(),rankCount=rankLimit();
  let finalDateId=D.final?.finalDateId||'',finalDateData=D.dates.find(d=>d.id===finalDateId),finalRestData=D.restaurants.find(r=>r.id===D.final?.finalRestaurantId),attending=attendeeResponsesForDate(finalDateId),budgetAttending=budgetEligibleAttendeesForDate(finalDateId),unavailable=unavailableResponsesForDate(finalDateId),finalMissing=missingMembers(),finalBudget=activityBudgetPerPerson(),finalPrice=moneyValue(finalRestData?.price),finalBudgetTotal=finalBudget===null?'':finalBudget*budgetAttending.length,finalPriceTotal=finalPrice===null?'':finalPrice*attending.length,finalDiffTotal=(finalBudget===null||finalPrice===null)?null:finalBudgetTotal-finalPriceTotal,finalRows=[['最終決議與出席名單'],['活動',activeSurvey()?.title||''],['最終日期',finalDateData?.label||'尚未設定'],['最終餐廳',finalRestData?.name||'尚未設定'],['預計出席人數',attending.length],['預算人數',budgetAttending.length],['不納入預算人數',attending.length-budgetAttending.length],['每人預算',moneyText(finalBudget)],['單價',moneyText(finalRestData?.price)],['每人價差',unitBudgetStatusText(restaurantDiff(finalRestData))],['預算總額',moneyText(finalBudgetTotal)],['餐費總額',moneyText(finalPriceTotal)],['總額差異',budgetStatusText(finalDiffTotal)],['決議說明',D.final?.note||''],[],['當天可出席名單'],['部門','姓名','員編','預算資格','填寫備註'],...attending.map(r=>[r.departmentName||'',r.memberName||'',r.employeeNo||'',responseBudgetEligible(r)?'納入預算':'不納入預算',r.note||'']),[],['已填但當天無法出席'],['部門','姓名','員編','原因'],...unavailable.map(r=>[r.departmentName||'',r.memberName||'',r.employeeNo||'',r.cannotAttend?'不克參加':'未選擇此日期']),[],['尚未填寫'],['部門','姓名','員編'],...finalMissing.map(m=>[m.department||m.departmentName||'',m.name||'',m.employeeNo||m.empNo||''])],finalSheet=XLSX.utils.aoa_to_sheet(finalRows);finalSheet['!merges']=[XLSX.utils.decode_range('A1:E1')];finalSheet['!cols']=[{wch:18},{wch:18},{wch:14},{wch:14},{wch:34}];XLSX.utils.book_append_sheet(wb,finalSheet,'最終出席名單');
  let exportAllowed=new Set(targetMembers().map(m=>m.id));
  let exportResponses=D.responses.filter(r=>exportAllowed.has(r.memberId)).slice().sort(compareResponseForExcelV750);
  let detail=exportResponses.map(r=>{let row={'部門':r.departmentName,'姓名':r.memberName,'員編':r.employeeNo||'','預算資格':responseBudgetEligible(r)?'納入預算':'不納入預算','可參加日期':responseDateIds(r).map(id=>D.dates.find(d=>d.id===id)?.label||id).join('、'),'不克參加':r.cannotAttend?'是':'否'};for(let i=0;i<rankCount;i++)row[rankLabel(i)+'選擇']=r.cannotAttend?'':(D.restaurants.find(x=>x.id===(r.restaurantRanks||[])[i])?.name||'');row['備註']=r.note||'';row['送出時間']=formatDateTimeV784(r.submittedAt||r.submittedAtText);return row});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(detail),'明細表');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(D.dates.map(d=>{let attending=attendeeResponsesForDate(d.id),unavailable=unavailableResponsesForDate(d.id),missing=missingMembers();return{'日期':d.label,'可參加人數':attending.length,'無法出席人數':unavailable.length,'尚未填答人數':missing.length,'預算人數':budgetEligibleAttendeesForDate(d.id).length,'不納入預算人數':attending.length-budgetEligibleAttendeesForDate(d.id).length,'可參加人員':attending.map(r=>r.memberName).join('、'),'已填但無法出席人員':unavailable.map(r=>r.memberName).join('、'),'尚未填答人員':missing.map(m=>m.name).join('、')}})),'日期統計');
  let restaurantRows=D.restaurants.map(r=>{let row={'餐廳':r.name},score=0,counts=Array(rankCount).fill(0);exportResponses.forEach(x=>{if(x.cannotAttend)return;let rr=x.restaurantRanks||[];for(let i=0;i<rankCount;i++){if(rr[i]===r.id){score+=rankCount-i;counts[i]++}}});row['加權分數']=score;for(let i=0;i<rankCount;i++)row[rankLabel(i)+'選擇']=counts[i];row['每人預算']=moneyText(activityBudgetPerPerson());row['單價']=moneyText(r.price);row['每人差異']=restaurantDiffText(r);row['地址']=r.address||'';row['Google Map']=r.googleMap||r.mapUrl||'';row['類型']=r.description||r.cuisine||'';return row});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(restaurantRows),'餐廳統計');
  let missing=targetMembers().filter(m=>!D.responses.some(r=>r.memberId===m.id)).map(m=>({'部門':m.department||m.departmentName||'','姓名':m.name,'員編':m.employeeNo||m.empNo||''}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(missing),'未填名單');XLSX.writeFile(wb,(activeSurvey()?.title||'活動調查')+'_結果.xlsx')
}
function fmtTs(ts){try{return formatDateTimeV784(ts)}catch(e){return''}}
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
async function refreshAdminData(showMessage=true){if(!isAdmin||!ready)return;if(adminRefreshPromise)return adminRefreshPromise;let button=document.getElementById('refreshAdminBtn');if(button){button.disabled=true;button.classList.add('isLoading')}adminRefreshPromise=(async()=>{try{await loadAll();renderFront();renderAdmin();lastAdminRefreshAt=Date.now();if(showMessage)toast('資料已更新')}catch(e){console.error('refresh failed',e);if(showMessage)alert('資料更新失敗，請檢查網路後再試一次')}finally{if(button){button.disabled=false;button.classList.remove('isLoading')}adminRefreshPromise=null}})();return adminRefreshPromise}
const adminNavigation=window.DeptDineAdminNavigation;
if(!adminNavigation)throw new Error('管理導覽模組載入失敗');
function enhanceAdminHeader(){
  adminNavigation.transform({
    adminUser:document.getElementById('adminUser'),
    adminRole:document.getElementById('adminRole'),
    isAdmin:()=>isAdmin,
    lastRefreshAt:()=>lastAdminRefreshAt,
    refreshAdminData
  });
  document.querySelectorAll('.topNavGroup').forEach(group=>{group.hidden=![...group.querySelectorAll('.nav')].some(item=>!item.hidden)});
  let head=document.querySelector('.main>.head'),title=document.getElementById('adminTitle');if(!head||!title)return;
  head.classList.add('adminPageHead','compactAdminToolbar');let headingBlock=head.querySelector('.adminHeadingBlock');if(!headingBlock){headingBlock=document.createElement('div');headingBlock.className='adminHeadingBlock';head.insertBefore(headingBlock,title);headingBlock.appendChild(title);let description=document.createElement('p');description.id='adminPageDescription';description.className='adminPageDescription';headingBlock.appendChild(description)}let description=document.getElementById('adminPageDescription');if(description)description.textContent=adminNavigation.description(document.querySelector('.panel.active')?.id);
  let actions=head.querySelector('.btns,.headActions');if(actions){actions.className='headActions';let buttons=[...actions.querySelectorAll('button')],frontButton=buttons.find(b=>b.getAttribute('onclick')?.includes('showFront')),copyButton=buttons.find(b=>b.getAttribute('onclick')?.includes('copyAdminLink'));if(frontButton){frontButton.textContent='預覽問卷';frontButton.classList.add('frontViewButton');actions.appendChild(frontButton)}if(!document.getElementById('refreshAdminBtn')){let refresh=document.createElement('button');refresh.id='refreshAdminBtn';refresh.className='btn iconOnlyButton';refresh.type='button';refresh.title='重新整理資料';refresh.setAttribute('aria-label','重新整理資料');refresh.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"></path><path d="M19 11a7.5 7.5 0 1 0 .2 3"></path></svg>';refresh.onclick=()=>refreshAdminData(true);actions.appendChild(refresh)}if(copyButton){copyButton.id='copyAdminLinkBtn';copyButton.hidden=!isSystemAdmin;let more=document.getElementById('adminMoreMenu');if(!more){more=document.createElement('details');more.id='adminMoreMenu';more.className='adminMoreMenu';let summary=document.createElement('summary');summary.textContent='•••';summary.title='更多操作';summary.setAttribute('aria-label','更多操作');let menu=document.createElement('div');menu.className='adminMoreMenuPanel';menu.appendChild(copyButton);copyButton.textContent='複製活動管理網址';copyButton.addEventListener('click',()=>{more.open=false});let frontCopy=document.createElement('button');frontCopy.id='copyFrontLinkBtn';frontCopy.className='btn';frontCopy.type='button';frontCopy.textContent='複製活動問卷網址';frontCopy.onclick=()=>{copyFrontLink();more.open=false};menu.appendChild(frontCopy);more.appendChild(summary);more.appendChild(menu);actions.appendChild(more)}else{let menu=document.querySelector('.adminMoreMenuPanel');menu?.appendChild(copyButton);if(menu&&!document.getElementById('copyFrontLinkBtn')){let frontCopy=document.createElement('button');frontCopy.id='copyFrontLinkBtn';frontCopy.className='btn';frontCopy.type='button';frontCopy.textContent='複製活動問卷網址';frontCopy.onclick=()=>{copyFrontLink();more.open=false};menu.appendChild(frontCopy)}}more.hidden=false}}
  window.AdminShareCenter?.installMenu();
  document.querySelectorAll('#lastUpdatedText,#headActiveSurvey').forEach(el=>el.remove());
}
const applyAccessUI_v641=applyAccessUI;applyAccessUI=function(){applyAccessUI_v641();enhanceAdminHeader()};
const renderSurveySelect_v641=renderSurveySelect;renderSurveySelect=function(){renderSurveySelect_v641();enhanceAdminHeader()};
const panelRefresh_v642=panel;panel=function(id,b){panelRefresh_v642(id,b);if(id==='respP'&&isAdmin)refreshAdminData(false)};
window.onload=init;

// ===== 排程開放、日期三分類與稽核紀錄 =====
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
  if(main&&!document.getElementById('logP')){const section=document.createElement('section');section.id='logP';section.className='panel';section.innerHTML='<div class="card"><div class="logHeader"><div><h3>操作與登入紀錄</h3><p class="muted">為節省 Firestore 讀取量，每次載入最新 100 筆；活動管理者的操作仍會納入稽核紀錄。</p></div><div class="btns"><button class="btn" onclick="reloadLogsV931(true)">重新整理</button><button class="btn green" onclick="exportLogsV711()">Excel 匯出目前結果</button></div></div><div class="logFilters"><select id="logTypeFilter" onchange="changeLogTypeV931()"><option value="audit">操作紀錄</option><option value="login">登入紀錄</option></select><input id="logSearch" type="search" placeholder="搜尋目前已載入的帳號、姓名、功能或內容" oninput="renderLogsV711()"><input id="logDateFilter" type="date" onchange="reloadLogsV931(false)"></div><div id="logTable"><div class="muted">開啟本頁後載入紀錄。</div></div></div>';main.appendChild(section)}
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
function enhanceDateStatsV711(){let heading=[...document.querySelectorAll('#resultTables h3')].find(x=>x.textContent.includes('日期統計與可出席名單'));let section=heading?.closest('.resultSection');if(!section)return;let list=section.querySelector('.dateDecisionList');if(!list||list.dataset.v711==='true')return;list.dataset.v711='true';let departments=[...new Set(targetMembers().map(x=>x.department||x.departmentName).filter(Boolean))];let filter=document.createElement('select');filter.id='dateStatsDeptFilter';filter.className='dateStatsDeptFilter';filter.setAttribute('aria-label','日期統計部門篩選');filter.innerHTML='<option value="">全部部門</option>'+departments.map(x=>'<option value="'+escAttr(x)+'">'+esc(x)+'</option>').join('');filter.onchange=filterDateStatsDepartmentV711;let slot=section.querySelector('.dateFilterSlot');if(slot)slot.appendChild(filter);else heading.insertAdjacentElement('afterend',filter);[...list.querySelectorAll('.dateDecisionItem')].forEach((item,index)=>{item.querySelector('details')?.remove();let date=D.dates[index],attending=attendeeResponsesForDate(date?.id),unavailable=unavailableResponsesForDate(date?.id),missing=missingMembers();let groups=document.createElement('div');groups.className='dateAttendanceGroups';groups.innerHTML='<details open><summary>可出席 '+attending.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(attending,'available')+'</div></details><details><summary>已填但無法出席 '+unavailable.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(unavailable,'unavailable')+'</div></details><details><summary>尚未填答 '+missing.length+' 人</summary><div class="datePeopleChips">'+peopleChipsV711(missing,'missing')+'</div></details>';item.appendChild(groups)})}
function filterDateStatsDepartmentV711(){let value=document.getElementById('dateStatsDeptFilter')?.value||'';document.querySelectorAll('.dateAttendanceGroups .datePersonChip').forEach(x=>x.hidden=!!value&&x.dataset.logDept!==value)}
const renderResultsV711=renderResults;renderResults=function(){renderResultsV711();enhanceDateStatsV711()};

let auditLogsV711=[],loginLogsV711=[];
const LOG_PAGE_SIZE_V931=100;
const logPagingV931={
  audit:{lastDoc:null,hasMore:true,loading:false,queryKey:''},
  login:{lastDoc:null,hasMore:true,loading:false,queryKey:''}
};
function actorRoleV711(){return isSystemAdmin?'系統管理員':currentAccessRole==='manager'?'活動管理者':'結果檢視者'}
async function writeAuditV711(action,targetType,targetId,summary,surveyId=activeSurveyId){if(!currentUser||!db)return;try{await col('surveyAuditLogs').add({surveyId:surveyId||'',action,targetType,targetId:targetId||'',summary:summary||'',actorUid:currentUser.uid,actorEmail:String(currentUser.email||'').toLowerCase(),actorName:currentUser.displayName||'',actorRole:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.warn('操作紀錄寫入失敗',e)}}
async function writeLoginV711(result,reason=''){if(!currentUser||!db)return;try{await col('surveyLoginLogs').add({uid:currentUser.uid,email:String(currentUser.email||'').toLowerCase(),displayName:currentUser.displayName||'',result,reason,role:actorRoleV711(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.warn('登入紀錄寫入失敗',e)}}
const resolveAccessV711=resolveAccess;resolveAccess=async function(email,uid){await resolveAccessV711(email,uid);let key='surveyLoginLogged:'+uid;if(!sessionStorage.getItem(key)){await writeLoginV711(isAdmin?'success':'denied',isAdmin?'':'沒有後台權限');sessionStorage.setItem(key,'1')}};
const logoutV711=logout;logout=async function(){await writeLoginV711('logout','使用者登出');return logoutV711()};
function selectedLogTypeV931(){return document.getElementById('logTypeFilter')?.value==='login'?'login':'audit'}
function selectedLogRowsV931(type=selectedLogTypeV931()){return type==='login'?loginLogsV711:auditLogsV711}
function setSelectedLogRowsV931(type,rows){if(type==='login')loginLogsV711=rows;else auditLogsV711=rows}
function logDateRangeV931(){
  const value=document.getElementById('logDateFilter')?.value||'';
  if(!value)return null;
  const start=new Date(`${value}T00:00:00`),end=new Date(`${value}T00:00:00`);end.setDate(end.getDate()+1);
  return Number.isNaN(start.getTime())?null:{value,start,end};
}
function buildLogQueryV931(type,state){
  const collectionName=type==='login'?'surveyLoginLogs':'surveyAuditLogs',range=logDateRangeV931();
  let query=col(collectionName);
  if(range)query=query.where('createdAt','>=',firebase.firestore.Timestamp.fromDate(range.start)).where('createdAt','<',firebase.firestore.Timestamp.fromDate(range.end));
  query=query.orderBy('createdAt','desc');
  if(state.lastDoc)query=query.startAfter(state.lastDoc);
  return query.limit(LOG_PAGE_SIZE_V931);
}
async function loadLogsV711(showMessage=false,{reset=false}={}){
  if(!isSystemAdmin)return;
  const type=selectedLogTypeV931(),state=logPagingV931[type],range=logDateRangeV931(),queryKey=range?.value||'all';
  if(state.loading)return;
  if(state.queryKey!==queryKey)reset=true;
  if(reset){state.lastDoc=null;state.hasMore=true;state.queryKey=queryKey;setSelectedLogRowsV931(type,[])}
  if(!state.hasMore){if(showMessage)toast('已載入全部紀錄');return renderLogsV711()}
  if(selectedLogRowsV931(type).length&&!reset&&!showMessage)return renderLogsV711();
  state.loading=true;renderLogsV711();
  try{
    const snapshot=await buildLogQueryV931(type,state).get(),next=snapshot.docs.map(item=>({id:item.id,...item.data()}));
    setSelectedLogRowsV931(type,[...selectedLogRowsV931(type),...next]);
    state.lastDoc=snapshot.docs[snapshot.docs.length-1]||state.lastDoc;
    state.hasMore=snapshot.size===LOG_PAGE_SIZE_V931;
    if(showMessage)toast(reset?'紀錄已更新':`已載入 ${next.length} 筆紀錄`);
  }catch(e){console.error('load logs failed',e);toast('紀錄載入失敗，請確認網路與 Firestore 規則')}
  finally{state.loading=false;renderLogsV711()}
}
function reloadLogsV931(showMessage=true){return loadLogsV711(showMessage,{reset:true})}
function changeLogTypeV931(){const type=selectedLogTypeV931(),state=logPagingV931[type],key=logDateRangeV931()?.value||'all';if(state.queryKey!==key||!selectedLogRowsV931(type).length)return loadLogsV711(false,{reset:true});renderLogsV711()}
function loadMoreLogsV931(){return loadLogsV711(true)}
function logTimeV711(x){let d=x?.createdAt?.toDate?x.createdAt.toDate():null;return d&&!Number.isNaN(d.getTime())?d:null}
function filteredLogsV711(){let type=document.getElementById('logTypeFilter')?.value||'audit',q=(document.getElementById('logSearch')?.value||'').trim().toLowerCase(),date=document.getElementById('logDateFilter')?.value||'',rows=type==='login'?loginLogsV711:auditLogsV711;return rows.filter(x=>{let d=logTimeV711(x),day=d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';return(!date||day===date)&&(!q||JSON.stringify(x).toLowerCase().includes(q))}).sort((a,b)=>(logTimeV711(b)?.getTime()||0)-(logTimeV711(a)?.getTime()||0))}
function renderLogsV711(){
  let box=document.getElementById('logTable');if(!box)return;
  let type=selectedLogTypeV931();if(type==='login'&&!isSystemAdmin){document.getElementById('logTypeFilter').value='audit';type='audit'}
  const state=logPagingV931[type],rows=filteredLogsV711();
  const content=type==='login'?table(['時間','帳號／姓名','結果','身分','說明'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.displayName||'')+'</b><br><small>'+esc(x.email||'')+'</small></td><td>'+esc(x.result||'')+'</td><td>'+esc(x.role||'')+'</td><td>'+esc(x.reason||'—')+'</td></tr>')):table(['時間','操作者','活動','功能／動作','內容'],rows.map(x=>'<tr><td>'+esc(fmtTs(x.createdAt))+'</td><td><b>'+esc(x.actorName||'')+'</b><br><small>'+esc(x.actorEmail||'')+'</small></td><td>'+esc(D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'系統層級')+'</td><td>'+esc(x.targetType||'')+'／'+esc(x.action||'')+'</td><td>'+esc(x.summary||'—')+'</td></tr>'));
  const loaded=selectedLogRowsV931(type).length;
  const footer=`<div class="logPagingV931"><span>已載入 ${loaded} 筆；搜尋與匯出以目前載入內容為準。</span>${state.loading?'<button class="btn" type="button" disabled>載入中…</button>':state.hasMore?'<button class="btn" type="button" onclick="loadMoreLogsV931()">載入更多 100 筆</button>':'<b>已載入全部紀錄</b>'}</div>`;
  box.innerHTML=content+footer;
}
function exportLogsV711(){let rows=filteredLogsV711();if(!rows.length)return alert('目前沒有可匯出的紀錄');let type=document.getElementById('logTypeFilter')?.value||'audit',data=type==='login'?rows.map(x=>({'時間':fmtTs(x.createdAt),'帳號':x.email||'','姓名':x.displayName||'','結果':x.result||'','身分':x.role||'','說明':x.reason||''})):rows.map(x=>({'時間':fmtTs(x.createdAt),'操作者':x.actorName||'','帳號':x.actorEmail||'','身分':x.actorRole||'','活動':D.surveys.find(s=>s.id===x.surveyId)?.title||x.surveyId||'','功能':x.targetType||'','動作':x.action||'','內容':x.summary||''}));let wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),type==='login'?'登入紀錄':'操作紀錄');XLSX.writeFile(wb,(type==='login'?'登入紀錄':'操作紀錄')+'.xlsx')}

const panelV711=panel;panel=function(id,b){if(id==='logP'&&!isSystemAdmin)return alert('此功能僅限系統管理員');panelV711(id,b);if(id==='logP')loadLogsV711(false)};
window.reloadLogsV931=reloadLogsV931;window.changeLogTypeV931=changeLogTypeV931;window.loadMoreLogsV931=loadMoreLogsV931;
const enhanceAdminHeaderV711=enhanceAdminHeader;enhanceAdminHeader=function(){enhanceAdminHeaderV711();let button=document.getElementById('logNavButton');let group=[...document.querySelectorAll('.topNavGroup')].find(x=>x.querySelector('summary')?.textContent.includes('系統管理'));if(button&&group&&!group.contains(button)){group.querySelector('.topNavMenu')?.appendChild(button);button.addEventListener('click',()=>{group.open=false})}};


