(function installRuntimeStatus(global) {
  'use strict';

  const state = {
    installed: false,
    hideTimer: 0,
    lastKey: '',
    lastShownAt: 0
  };

  function ensureStyle() {
    if (document.getElementById('runtimeStatusStyle')) return;
    const style = document.createElement('style');
    style.id = 'runtimeStatusStyle';
    style.textContent = [
      '.runtimeStatus,.runtimeStatus *{box-sizing:border-box}',
      '.runtimeStatus{position:fixed;top:14px;left:50%;z-index:10000;display:flex;align-items:center;gap:12px;width:min(calc(100vw - 28px),680px);min-height:48px;padding:10px 12px 10px 16px;border:1px solid transparent;border-radius:12px;box-shadow:0 14px 34px rgba(15,35,55,.18);font-family:"Microsoft JhengHei",system-ui,sans-serif;font-size:14px;font-weight:800;line-height:1.55;transform:translate(-50%,-140%);opacity:0;pointer-events:none;transition:transform .2s ease,opacity .2s ease}',
      '.runtimeStatus.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}',
      '.runtimeStatus.info{border-color:#a9c8e6;background:#f2f8fd;color:#174f7d}',
      '.runtimeStatus.success{border-color:#a8d8c1;background:#f0faf5;color:#176b4c}',
      '.runtimeStatus.warning{border-color:#e8c77f;background:#fff9ea;color:#805500}',
      '.runtimeStatus.error{border-color:#e5a6a6;background:#fff4f4;color:#9b2929}',
      '.runtimeStatusMessage{min-width:0;flex:1}',
      '.runtimeStatusAction{flex:none;min-height:34px;padding:6px 11px;border:1px solid currentColor;border-radius:8px;background:rgba(255,255,255,.72);color:inherit;font:inherit;cursor:pointer}',
      '@media(max-width:520px){.runtimeStatus{top:8px;align-items:flex-start;width:calc(100vw - 16px);padding:10px 10px 10px 12px;font-size:13px}.runtimeStatusAction{min-height:32px;padding:5px 9px}}',
      '@media(prefers-reduced-motion:reduce){.runtimeStatus{transition:none}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureBanner() {
    ensureStyle();
    let banner = document.getElementById('runtimeStatus');
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'runtimeStatus';
    banner.className = 'runtimeStatus info';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = '<span class="runtimeStatusMessage"></span><button class="runtimeStatusAction" type="button" hidden>重新整理</button>';
    (document.body || document.documentElement).appendChild(banner);
    banner.querySelector('.runtimeStatusAction').addEventListener('click', () => global.location.reload());
    return banner;
  }

  function hide() {
    const banner = document.getElementById('runtimeStatus');
    if (banner) banner.classList.remove('show');
  }

  function show(message, options) {
    const settings = options || {};
    const tone = settings.tone || 'info';
    const key = tone + ':' + String(message || '');
    const now = Date.now();
    if (key === state.lastKey && now - state.lastShownAt < 3000) return;
    state.lastKey = key;
    state.lastShownAt = now;
    global.clearTimeout(state.hideTimer);
    const banner = ensureBanner();
    banner.className = 'runtimeStatus ' + tone;
    banner.querySelector('.runtimeStatusMessage').textContent = String(message || '');
    banner.querySelector('.runtimeStatusAction').hidden = settings.reload !== true;
    requestAnimationFrame(() => banner.classList.add('show'));
    if (settings.autoHideMs) state.hideTimer = global.setTimeout(hide, settings.autoHideMs);
  }

  function reportUnexpected(kind) {
    const resourceFailure = kind === 'resource';
    show(
      resourceFailure
        ? '必要服務載入失敗，請確認網路後重新整理頁面。'
        : '系統發生未預期狀況，請重新整理；若持續發生請聯絡管理者。',
      { tone: 'error', reload: true }
    );
  }

  function install() {
    if (state.installed) return;
    state.installed = true;
    global.addEventListener('offline', () => {
      show('目前處於離線狀態，尚未送出的資料不會自動儲存。', { tone: 'warning' });
    });
    global.addEventListener('online', () => {
      show('網路連線已恢復，可以繼續操作。', { tone: 'success', autoHideMs: 4000 });
    });
    global.addEventListener('error', event => {
      if (event.target && event.target !== global) {
        const tag = String(event.target.tagName || '').toLowerCase();
        if (tag === 'script' || tag === 'link') reportUnexpected('resource');
        return;
      }
      reportUnexpected('runtime');
    }, true);
    global.addEventListener('unhandledrejection', () => reportUnexpected('promise'));
    const showInitialOffline = () => {
      if (global.navigator && global.navigator.onLine === false) {
        show('目前處於離線狀態，尚未送出的資料不會自動儲存。', { tone: 'warning' });
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showInitialOffline, { once: true });
    } else {
      showInitialOffline();
    }
  }

  const api = Object.freeze({ hide, install, show });
  global.DeptDineRuntimeStatus = api;
  install();
})(window);


