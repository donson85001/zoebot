(() => {
  'use strict';

  const ACTIVE_KEY = 'zoebot_monitor_active';
  const OFFLINE_TEXT = ['已斷線', '建立訂閱失敗'];

  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const badge = document.getElementById('connectionBadge');
  const channel = document.getElementById('channelLogin');

  if (!startBtn || !stopBtn || !badge || !channel) return;

  startBtn.addEventListener('click', () => {
    sessionStorage.setItem(ACTIVE_KEY, '1');
  });

  stopBtn.addEventListener('click', () => {
    sessionStorage.removeItem(ACTIVE_KEY);
  }, true);

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(ACTIVE_KEY);
  }, true);

  let lastRetryAt = 0;
  setInterval(() => {
    if (sessionStorage.getItem(ACTIVE_KEY) !== '1') return;
    if (!sessionStorage.getItem('twitchAccessToken')) return;
    if (!channel.value.trim()) return;
    if (startBtn.disabled) return;

    const text = badge.textContent.trim();
    if (!OFFLINE_TEXT.some(x => text.includes(x))) return;
    if (Date.now() - lastRetryAt < 5000) return;

    lastRetryAt = Date.now();
    console.warn('[auto-recover] Twitch 監聽中斷，自動重新開始');
    startBtn.click();
  }, 3000);
})();
