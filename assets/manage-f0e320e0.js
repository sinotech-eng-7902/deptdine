/*
 * 部門聚餐調查系統管理端正式入口
 *
 * 既有正式功能由 compatibility 目錄依固定順序載入；新功能應建立為
 * 獨立語意模組，不再追加至舊路徑或大型相容核心。
 */
(() => {
const APP_VERSION='10.39';
  const requiredInterfaces=[
    'renderAdmin',
    'renderFinalPanel',
    'saveFinal',
    'saveHomeAnnouncementSetting',
    'openHomeAnnouncementSettings'
  ];

  window.APP_VERSION=APP_VERSION;
  window.AdminApp=Object.freeze({
    version:APP_VERSION,
    compatibilityVersion:String(window.ADMIN_COMPATIBILITY_VERSION||''),
    requiredInterfaces:Object.freeze([...requiredInterfaces])
  });

  const missing=requiredInterfaces.filter(name=>typeof window[name]!=='function');
  if(!window.AdminLiveResponses||window.AdminLiveResponses.version!==APP_VERSION)missing.push('AdminLiveResponses');
  if(!window.AdminChatReadingPosition||window.AdminChatReadingPosition.version!==APP_VERSION)missing.push('AdminChatReadingPosition');
  if(!window.AdminTitleStyles||window.AdminTitleStyles.version!==APP_VERSION)missing.push('AdminTitleStyles');
  if(!window.AdminViewRole||window.AdminViewRole.version!==APP_VERSION)missing.push('AdminViewRole');
  if(!window.AdminShareCenter||window.AdminShareCenter.version!==APP_VERSION)missing.push('AdminShareCenter');
  if(!window.AdminInformationArchitecture||window.AdminInformationArchitecture.version!==APP_VERSION)missing.push('AdminInformationArchitecture');
  if(!window.AdminEditorModeState||window.AdminEditorModeState.version!==APP_VERSION)missing.push('AdminEditorModeState');
  if(!window.AdminReimbursement0807052||window.AdminReimbursement0807052.version!==APP_VERSION)missing.push('AdminReimbursement0807052');
  if(missing.length){
    document.documentElement.dataset.adminState='error';
    document.documentElement.dataset.adminVersion=APP_VERSION;
    console.error('管理端相容核心載入不完整：'+missing.join('、'));
    window.dispatchEvent(new CustomEvent('admin:compatibility-error',{detail:{missing}}));
  }else{
    document.documentElement.dataset.adminState='ready';
    document.documentElement.dataset.adminVersion=APP_VERSION;
    window.dispatchEvent(new CustomEvent('admin:ready',{detail:{version:APP_VERSION}}));
  }
})();







