(function installAdminNavigation(global) {
  'use strict';

  const panelDescriptions = Object.freeze({
    dash: '掌握目前活動的填寫進度與重要狀態。',
    surveyP: '建立、編輯及切換部門聚餐活動。',
    memP: '設定本活動的填寫資格與預算計算對象。',
    dateP: '維護本活動可供同仁選擇的聚餐日期。',
    restP: '維護候選餐廳、價格規則與相關資訊。',
    respP: '查看投票統計、日期意願與逐筆填寫內容。',
    mailP: '製作聚餐通知、未填提醒與調查結果信件。',
    costP: '依日期、餐廳與預算資格試算聚餐費用。',
    finalP: '確認最終日期、餐廳及實際出席名單。',
    reimbursementP: '整理核銷資料並產生 0807052 部門聯誼餐費申請單。',
    sysMemP: '維護全系統共用的人員主檔與登入帳號。',
    accessP: '設定活動管理者與結果檢視者的使用權限。',
    frontProtectP: '調整前台的防誤操作設定。',
    featureSettingsP: '管理全系統共用功能。',
    logP: '查詢系統操作與登入紀錄。'
  });
  const hoverCloseDelay = 200;

  function supportsHoverNavigation() {
    return Boolean(global.matchMedia?.('(hover: hover) and (pointer: fine)').matches);
  }

  function clearHoverClose(group) {
    if (!group?.__hoverCloseTimer) return;
    global.clearTimeout(group.__hoverCloseTimer);
    group.__hoverCloseTimer = 0;
  }

  function closeGroups(except) {
    document.querySelectorAll('.topNavGroup[open]').forEach(group => {
      if (group !== except) {
        clearHoverClose(group);
        group.open = false;
      }
    });
  }

  function createGroup(label, buttons) {
    const details = document.createElement('details');
    details.className = 'topNavGroup';
    const summary = document.createElement('summary');
    const labelText = document.createElement('span');
    labelText.textContent = label;
    summary.appendChild(labelText);
    const chevron = document.createElement('span');
    chevron.className = 'topNavChevron';
    chevron.setAttribute('aria-hidden', 'true');
    summary.appendChild(chevron);
    details.appendChild(summary);
    const menu = document.createElement('div');
    menu.className = 'topNavMenu';
    buttons.filter(Boolean).forEach(button => {
      menu.appendChild(button);
      button.addEventListener('click', () => {
        details.open = false;
      });
    });
    details.appendChild(menu);
    details.addEventListener('toggle', () => {
      if (details.open) closeGroups(details);
    });
    details.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || !supportsHoverNavigation()) return;
      clearHoverClose(details);
      closeGroups(details);
      details.open = true;
    });
    details.addEventListener('pointerleave', event => {
      if (event.pointerType === 'touch' || !supportsHoverNavigation()) return;
      clearHoverClose(details);
      details.__hoverCloseTimer = global.setTimeout(() => {
        details.open = false;
        details.__hoverCloseTimer = 0;
      }, hoverCloseDelay);
    });
    return details;
  }

  function transform(options) {
    const side = document.querySelector('.side');
    if (!side || side.dataset.topnav === 'true') return;
    side.dataset.topnav = 'true';
    side.classList.add('topNav');

    const brand = side.querySelector('.ab');
    const logo = brand?.querySelector('img');
    const brandText = brand?.querySelector('div');
    if (logo) {
      logo.classList.add('topBrandLogo');
      logo.alt = '環興科技股份有限公司';
    }

    const navs = [...side.querySelectorAll('.nav')];
    const byText = text => navs.find(item => item.textContent.trim() === text);
    const dashboard = byText('儀表板');
    const logoutButton = byText('登出');
    const navArea = document.createElement('nav');
    navArea.className = 'topNavLinks';
    navArea.setAttribute('aria-label', '管理功能');
    if (dashboard) navArea.appendChild(dashboard);
    navArea.appendChild(createGroup('活動設定', [
      byText('活動管理'),
      byText('人員設定'),
      byText('日期管理'),
      byText('餐廳管理')
    ]));
    navArea.appendChild(createGroup('結果與決議', [
      byText('投票結果'),
      byText('信件通知'),
      byText('費用試算'),
      byText('最終決議'),
      byText('核銷作業'),
      byText('資料匯出')
    ]));
    navArea.appendChild(createGroup('系統管理', [
      byText('人員管理'),
      byText('權限管理'),
      byText('前台防護'),
      byText('功能設定')
    ]));

    const userArea = document.createElement('div');
    userArea.className = 'topUserArea';
    const userIcon = document.createElement('span');
    userIcon.className = 'topUserIcon';
    userIcon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.6-4 3.1-6 7-6s6.4 2 7 6"></path></svg>';
    const labels = document.createElement('span');
    labels.className = 'topUserLabels';
    if (options.adminUser) labels.appendChild(options.adminUser);
    if (options.adminRole) labels.appendChild(options.adminRole);
    userArea.appendChild(userIcon);
    userArea.appendChild(labels);
    if (logoutButton) {
      logoutButton.classList.add('topLogout');
      userArea.appendChild(logoutButton);
    }

    if (brandText) brandText.remove();
    side.appendChild(navArea);
    side.appendChild(userArea);

    if (!global.__topNavDismiss) {
      global.__topNavDismiss = true;
      document.addEventListener('click', event => {
        if (!event.target.closest('.topNavGroup')) closeGroups();
        if (!event.target.closest('.adminMoreMenu')) {
          const more = document.getElementById('adminMoreMenu');
          if (more) more.open = false;
        }
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeGroups();
          const more = document.getElementById('adminMoreMenu');
          if (more) more.open = false;
        }
      });
    }

    if (!global.__adminVisibilityRefresh) {
      global.__adminVisibilityRefresh = true;
      document.addEventListener('visibilitychange', () => {
        const active = document.querySelector('.panel.active')?.id;
        const shouldRefresh = active === 'respP' || active === 'dash';
        if (!document.hidden && options.isAdmin() && shouldRefresh && Date.now() - options.lastRefreshAt() > 15000) {
          options.refreshAdminData(false);
        }
      });
    }
  }

  function description(panelId) {
    return panelDescriptions[panelId] || '管理目前活動與系統設定。';
  }

  global.DeptDineAdminNavigation = Object.freeze({
    closeGroups,
    description,
    transform
  });
})(window);


