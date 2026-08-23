(() => {
  'use strict';

  const TWITCH_WS_URL = 'wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30';
  const API_BASE = 'https://api.twitch.tv/helix';
  const OAUTH_BASE = 'https://id.twitch.tv/oauth2/authorize';
  const REQUIRED_SCOPE = 'user:read:chat';

  const els = {
    clientId: document.querySelector('#clientId'),
    redirectUri: document.querySelector('#redirectUri'),
    loginBtn: document.querySelector('#loginBtn'),
    logoutBtn: document.querySelector('#logoutBtn'),
    saveSettingsBtn: document.querySelector('#saveSettingsBtn'),
    authInfo: document.querySelector('#authInfo'),
    channelLogin: document.querySelector('#channelLogin'),
    startBtn: document.querySelector('#startBtn'),
    stopBtn: document.querySelector('#stopBtn'),
    channelInfo: document.querySelector('#channelInfo'),
    connectionBadge: document.querySelector('#connectionBadge'),
    eventList: document.querySelector('#eventList'),
    debugLog: document.querySelector('#debugLog'),
    clearBtn: document.querySelector('#clearBtn'),
    showChat: document.querySelector('#showChat'),
    chatCount: document.querySelector('#chatCount'),
    subCount: document.querySelector('#subCount'),
    resubCount: document.querySelector('#resubCount'),
    giftCount: document.querySelector('#giftCount'),
    lastSubJson: document.querySelector('#lastSubJson'),
    copyJsonBtn: document.querySelector('#copyJsonBtn'),
    publicMonths: document.querySelector('#publicMonths'),
    publicGifts: document.querySelector('#publicGifts'),
    publicApiUrl: document.querySelector('#publicApiUrl'),
    publicWriteKey: document.querySelector('#publicWriteKey'),
    manualMonths: document.querySelector('#manualMonths'),
    manualGifts: document.querySelector('#manualGifts'),
    savePublicBtn: document.querySelector('#savePublicBtn'),
    loadPublicBtn: document.querySelector('#loadPublicBtn'),
    setPublicBtn: document.querySelector('#setPublicBtn'),
    publicInfo: document.querySelector('#publicInfo'),
    publicStatsUrl: document.querySelector('#publicStatsUrl'),
  };

  const state = {
    token: null,
    tokenScopes: [],
    viewer: null,
    target: null,
    socket: null,
    reconnectSocket: null,
    reconnecting: false,
    manuallyStopped: false,
    sessionId: null,
    seenMessageIds: new Set(),
    lastSeenAt: 0,
    watchdog: null,
    counters: { chat: 0, sub: 0, resub: 0, gift: 0 },
    lastSubscription: null,
    publicCounters: { subscriptionMonths: 1546, giftSubCount: 395 },
  };

  function defaultRedirectUri() {
    const clean = location.href.split('#')[0].split('?')[0];
    return clean.endsWith('index.html') ? clean : clean;
  }

  function loadSettings() {
    els.clientId.value = localStorage.getItem('twitchClientId') || '';
    els.redirectUri.value = localStorage.getItem('twitchRedirectUri') || defaultRedirectUri();
    els.channelLogin.value = localStorage.getItem('lastChannelLogin') || '';
    els.publicApiUrl.value = localStorage.getItem('publicApiUrl') || '';
    els.publicWriteKey.value = localStorage.getItem('publicWriteKey') || '';
    const savedMonthsRaw = localStorage.getItem('subscriptionMonths');
    const savedGiftsRaw = localStorage.getItem('giftSubCount');
    const savedMonths = savedMonthsRaw === null ? NaN : Number(savedMonthsRaw);
    const savedGifts = savedGiftsRaw === null ? NaN : Number(savedGiftsRaw);
    state.publicCounters.subscriptionMonths = Number.isFinite(savedMonths) && savedMonths >= 0 ? savedMonths : 1546;
    state.publicCounters.giftSubCount = Number.isFinite(savedGifts) && savedGifts >= 0 ? savedGifts : 395;
    refreshPublicCounters();
    refreshPublicUrl();
  }

  function saveSettings() {
    const clientId = els.clientId.value.trim();
    const redirectUri = els.redirectUri.value.trim();
    localStorage.setItem('twitchClientId', clientId);
    localStorage.setItem('twitchRedirectUri', redirectUri);
    log('設定已儲存。');
  }

  function randomState() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  function beginLogin() {
    const clientId = els.clientId.value.trim();
    const redirectUri = els.redirectUri.value.trim();
    if (!clientId || !redirectUri) {
      setStatus(els.authInfo, '請先填入 Client ID 與 Redirect URI。', 'error');
      return;
    }

    // 單一視窗模式：先保存所有設定，再直接前往 Twitch 授權。
    // Twitch 授權完成後會回到同一個 localhost 頁面，由 init() 接回 token。
    saveSettings();
    savePublicSettings();
    localStorage.setItem('lastChannelLogin', els.channelLogin.value.trim());

    const nonce = randomState();
    localStorage.setItem('oauthState', nonce);
    const url = new URL(OAUTH_BASE);
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', REQUIRED_SCOPE);
    url.searchParams.set('state', nonce);

    // 不開小窗、不開第二個監聽器，整個流程只使用目前這一頁。
    window.location.assign(url.toString());
  }

  function consumeOauthFragment(fragment, clearCurrentUrl = false) {
    if (!fragment) return false;
    const raw = String(fragment).replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const token = params.get('access_token');
    const returnedState = params.get('state');
    const expectedState = localStorage.getItem('oauthState');
    const error = params.get('error_description') || params.get('error');

    if (error) {
      setStatus(els.authInfo, `Twitch 登入失敗：${error}`, 'error');
      if (clearCurrentUrl && location.hash) history.replaceState(null, '', location.pathname + location.search);
      return false;
    }
    if (!token) return false;
    if (expectedState && returnedState !== expectedState) {
      setStatus(els.authInfo, 'OAuth state 驗證失敗，請重新登入。', 'error');
      if (clearCurrentUrl && location.hash) history.replaceState(null, '', location.pathname + location.search);
      return false;
    }

    localStorage.removeItem('oauthState');
    state.token = token;
    sessionStorage.setItem('twitchAccessToken', token);
    if (clearCurrentUrl && location.hash) history.replaceState(null, '', location.pathname + location.search);
    return true;
  }

  function parseOauthFragment() {
    return consumeOauthFragment(location.hash, true);
  }

  function restoreToken() {
    state.token = sessionStorage.getItem('twitchAccessToken');
  }

  function logout() {
    stopMonitoring();
    sessionStorage.removeItem('twitchAccessToken');
    state.token = null;
    state.viewer = null;
    state.tokenScopes = [];
    setStatus(els.authInfo, '已清除本頁的 Twitch 登入。', 'muted');
  }

  async function api(path, options = {}) {
    const clientId = els.clientId.value.trim();
    if (!state.token) throw new Error('尚未取得 Twitch Access Token');
    if (!clientId) throw new Error('缺少 Client ID');

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Client-Id': clientId,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    let body = null;
    const text = await response.text();
    if (text) {
      try { body = JSON.parse(text); } catch { body = text; }
    }
    if (!response.ok) {
      const msg = body?.message || body?.error || text || `HTTP ${response.status}`;
      throw new Error(`${response.status}: ${msg}`);
    }
    return body;
  }

  async function validateToken() {
    if (!state.token) return false;
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: { Authorization: `OAuth ${state.token}` },
      });
      if (!response.ok) throw new Error(`Token 驗證失敗 (${response.status})`);
      const data = await response.json();
      state.tokenScopes = data.scopes || [];
      if (!state.tokenScopes.includes(REQUIRED_SCOPE)) {
        throw new Error(`Token 缺少 ${REQUIRED_SCOPE} 權限，請重新登入。`);
      }
      const users = await api('/users');
      state.viewer = users.data?.[0] || null;
      if (!state.viewer) throw new Error('無法取得登入使用者資料');
      setStatus(els.authInfo, `已登入：${state.viewer.display_name} (@${state.viewer.login}) / ID ${state.viewer.id}`, 'ok');
      return true;
    } catch (err) {
      log(`Token 驗證失敗：${err.message}`);
      sessionStorage.removeItem('twitchAccessToken');
      state.token = null;
      state.viewer = null;
      setStatus(els.authInfo, `登入無效：${err.message}`, 'error');
      return false;
    }
  }

  async function resolveChannel(login) {
    const normalized = login.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//i, '').split(/[/?#]/)[0].toLowerCase();
    if (!normalized) throw new Error('請輸入 Twitch 頻道名稱');
    const result = await api(`/users?login=${encodeURIComponent(normalized)}`);
    const user = result.data?.[0];
    if (!user) throw new Error(`找不到 Twitch 頻道：${normalized}`);
    return user;
  }

  async function startMonitoring() {
    try {
      if (!state.token || !state.viewer) {
        const ok = await validateToken();
        if (!ok) throw new Error('請先登入 Twitch');
      }
      state.target = await resolveChannel(els.channelLogin.value);
      localStorage.setItem('lastChannelLogin', state.target.login);
      setStatus(els.channelInfo, `目標：${state.target.display_name} (@${state.target.login}) / ID ${state.target.id}`, 'ok');
      state.manuallyStopped = false;
      connectWebSocket(TWITCH_WS_URL, false);
    } catch (err) {
      setStatus(els.channelInfo, err.message, 'error');
      log(`開始監聽失敗：${err.message}`);
    }
  }

  function connectWebSocket(url, isReconnect) {
    if (!state.target || !state.viewer) return;
    setBadge(isReconnect ? '重新連線中' : '連線中', 'connecting');
    log(`連接 EventSub WebSocket：${url}`);
    const ws = new WebSocket(url);
    if (isReconnect) {
      state.reconnectSocket = ws;
      state.reconnecting = true;
    } else {
      if (state.socket) try { state.socket.close(); } catch {}
      state.socket = ws;
    }

    ws.addEventListener('open', () => log('WebSocket 已開啟，等待 Twitch session_welcome。'));
    ws.addEventListener('message', event => handleSocketMessage(ws, event, isReconnect));
    ws.addEventListener('error', () => log('WebSocket 發生錯誤。'));
    ws.addEventListener('close', event => handleSocketClose(ws, event, isReconnect));
  }

  async function handleSocketMessage(ws, messageEvent, isReconnect) {
    state.lastSeenAt = Date.now();
    let packet;
    try { packet = JSON.parse(messageEvent.data); }
    catch { log('收到非 JSON WebSocket 資料。'); return; }

    const meta = packet.metadata || {};
    const messageId = meta.message_id;
    if (messageId) {
      if (state.seenMessageIds.has(messageId)) return;
      state.seenMessageIds.add(messageId);
      if (state.seenMessageIds.size > 2000) {
        const first = state.seenMessageIds.values().next().value;
        state.seenMessageIds.delete(first);
      }
    }

    switch (meta.message_type) {
      case 'session_welcome': {
        const session = packet.payload.session;
        state.sessionId = session.id;
        log(`session_welcome：${session.id}`);

        if (isReconnect) {
          const old = state.socket;
          state.socket = ws;
          state.reconnectSocket = null;
          state.reconnecting = false;
          if (old && old !== ws) try { old.close(1000, 'Twitch reconnect complete'); } catch {}
          setBadge('監聽中', 'online');
          els.startBtn.disabled = true;
          els.stopBtn.disabled = false;
          startWatchdog(session.keepalive_timeout_seconds || 30);
          return;
        }

        try {
          await createEventSubSubscriptions(session.id);
          setBadge('監聽中', 'online');
          els.startBtn.disabled = true;
          els.stopBtn.disabled = false;
          startWatchdog(session.keepalive_timeout_seconds || 30);
        } catch (err) {
          log(`建立 EventSub 訂閱失敗：${err.message}`);
          setBadge('建立訂閱失敗', 'offline');
          setStatus(els.channelInfo, `目標已找到，但 EventSub 建立失敗：${err.message}`, 'error');
          try { ws.close(); } catch {}
        }
        break;
      }
      case 'session_keepalive':
        log('keepalive');
        break;
      case 'session_reconnect': {
        const reconnectUrl = packet.payload.session.reconnect_url;
        log(`Twitch 要求重新連線：${reconnectUrl}`);
        if (reconnectUrl && !state.reconnecting) connectWebSocket(reconnectUrl, true);
        break;
      }
      case 'notification':
        handleNotification(packet);
        break;
      case 'revocation':
        log(`EventSub 訂閱被撤銷：${JSON.stringify(packet.payload.subscription)}`);
        break;
      default:
        log(`未處理 WebSocket 類型：${meta.message_type}`);
    }
  }

  async function createEventSubSubscriptions(sessionId) {
    const condition = {
      broadcaster_user_id: state.target.id,
      user_id: state.viewer.id,
    };
    const types = ['channel.chat.message', 'channel.chat.notification'];
    for (const type of types) {
      const body = {
        type,
        version: '1',
        condition,
        transport: { method: 'websocket', session_id: sessionId },
      };
      await api('/eventsub/subscriptions', { method: 'POST', body: JSON.stringify(body) });
      log(`EventSub 已建立：${type}`);
    }
  }

  function handleNotification(packet) {
    const type = packet.payload.subscription?.type;
    const event = packet.payload.event || {};
    if (type === 'channel.chat.message') {
      state.counters.chat++;
      refreshCounters();
      if (els.showChat.checked) addChatEvent(event);
      return;
    }
    if (type === 'channel.chat.notification') {
      addChatNotification(event, packet.metadata?.message_id || null);
    }
  }

  function addChatEvent(event) {
    const name = event.chatter_user_name || event.chatter_user_login || '未知使用者';
    const text = event.message?.text || '';
    addEventCard('chat', '聊天室', name, text, []);
  }

  function tierToNumber(raw) {
    if (!raw) return null;
    const s = String(raw);
    if (s === '1000') return 1;
    if (s === '2000') return 2;
    if (s === '3000') return 3;
    return s;
  }

  function normalizeNotification(event) {
    const noticeType = event.notice_type || 'unknown';
    const who = event.chatter_is_anonymous
      ? '匿名'
      : (event.chatter_user_name || event.chatter_user_login || '未知使用者');
    const message = event.message?.text || '';
    const now = new Date().toISOString();

    if (noticeType === 'sub') {
      const d = event.sub || {};
      return {
        category: 'sub',
        title: '新訂閱',
        who,
        message,
        params: {
          type: 'sub',
          tier: tierToNumber(d.sub_tier),
          isPrime: Boolean(d.is_prime),
        },
        raw: event,
        capturedAt: now,
      };
    }

    if (noticeType === 'resub') {
      const d = event.resub || {};
      return {
        category: 'resub',
        title: '續訂',
        who,
        message,
        params: {
          type: 'resub',
          tier: tierToNumber(d.sub_tier),
          cumulativeMonths: d.cumulative_months ?? null,
          durationMonths: d.duration_months ?? null,
          streakMonths: d.streak_months ?? null,
          isPrime: Boolean(d.is_prime),
          isGift: Boolean(d.is_gift),
        },
        raw: event,
        capturedAt: now,
      };
    }

    if (noticeType === 'sub_gift') {
      const d = event.sub_gift || {};
      return {
        category: 'gift',
        title: '單筆贈訂',
        who,
        message,
        params: {
          type: 'sub_gift',
          tier: tierToNumber(d.sub_tier),
          durationMonths: d.duration_months ?? null,
          recipient: d.user_name || d.user_login || null,
          communityGiftId: d.community_gift_id || null,
        },
        raw: event,
        capturedAt: now,
      };
    }

    if (noticeType === 'community_sub_gift') {
      const d = event.community_sub_gift || {};
      return {
        category: 'gift',
        title: '批次贈訂',
        who,
        message,
        params: {
          type: 'community_sub_gift',
          tier: tierToNumber(d.sub_tier),
          total: d.total ?? null,
          cumulativeTotal: d.cumulative_total ?? null,
          communityGiftId: d.id || null,
        },
        raw: event,
        capturedAt: now,
      };
    }

    return {
      category: 'other',
      title: `聊天室通知：${noticeType}`,
      who,
      message,
      params: { type: noticeType },
      raw: event,
      capturedAt: now,
    };
  }

  function addChatNotification(event, eventId) {
    const item = normalizeNotification(event);
    if (item.category === 'sub') state.counters.sub++;
    if (item.category === 'resub') state.counters.resub++;
    if (item.category === 'gift') state.counters.gift++;
    refreshCounters();

    const params = Object.entries(item.params)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${v}`);
    addEventCard(item.category, item.title, item.who, item.message || '(無附加訊息)', params);

    if (['sub', 'resub', 'gift'].includes(item.category)) {
      state.lastSubscription = item;
      els.lastSubJson.textContent = JSON.stringify(item, null, 2);
    }

    // 公開累積規則：
    // 1) 續訂：把該人的 cumulativeMonths 整個加上去。
    // 2) 批次贈訂：每 5 份 +1；10 份 +2；不足 5 份不增加。
    // 單筆 sub_gift 不另外加，避免 community_sub_gift 後又收到每一份 sub_gift 而重複計算。
    if (item.params.type === 'resub') {
      const months = Number(item.params.cumulativeMonths);
      if (Number.isFinite(months) && months > 0) {
        void incrementPublicCounters(months, 0, eventId, `續訂 ${item.who} cumulativeMonths=${months}`);
      }
    } else if (item.params.type === 'community_sub_gift') {
      const total = Number(item.params.total);
      const giftDelta = Number.isFinite(total) && total > 0 ? Math.floor(total / 5) : 0;
      if (giftDelta > 0) {
        void incrementPublicCounters(0, giftDelta, eventId, `批次贈訂 ${item.who} total=${total}`);
      }
    }
  }

  function addEventCard(category, title, who, message, params) {
    const empty = els.eventList.querySelector('.empty-state');
    if (empty) empty.remove();
    const el = document.createElement('article');
    el.className = `event-item ${category}`;

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    const time = document.createElement('span');
    time.textContent = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const channel = document.createElement('span');
    channel.textContent = state.target ? `#${state.target.login}` : '';
    meta.append(time, channel);

    const titleEl = document.createElement('div');
    titleEl.className = 'event-title';
    titleEl.textContent = `${title} · ${who}`;
    const msgEl = document.createElement('div');
    msgEl.className = 'event-message';
    msgEl.textContent = message;
    el.append(meta, titleEl, msgEl);

    if (params.length) {
      const wrap = document.createElement('div');
      wrap.className = 'event-params';
      for (const p of params) {
        const chip = document.createElement('span');
        chip.className = 'param';
        chip.textContent = p;
        wrap.appendChild(chip);
      }
      el.appendChild(wrap);
    }

    els.eventList.prepend(el);
    while (els.eventList.children.length > 500) els.eventList.lastElementChild.remove();
  }

  function handleSocketClose(ws, event, isReconnect) {
    log(`WebSocket 關閉：code=${event.code} reason=${event.reason || '(無)'}`);
    if (state.manuallyStopped) return;
    if (isReconnect && state.reconnectSocket === ws) {
      state.reconnectSocket = null;
      state.reconnecting = false;
    }
    if (state.socket === ws && !state.reconnecting) {
      setBadge('已斷線', 'offline');
      els.startBtn.disabled = false;
      els.stopBtn.disabled = true;
      clearWatchdog();
      log('連線已中斷。Twitch 不會重播斷線期間遺失的事件；請按「開始監聽」重新建立訂閱。');
    }
  }

  function stopMonitoring() {
    state.manuallyStopped = true;
    clearWatchdog();
    if (state.socket) {
      try { state.socket.close(1000, 'User stopped'); } catch {}
    }
    if (state.reconnectSocket) {
      try { state.reconnectSocket.close(1000, 'User stopped'); } catch {}
    }
    state.socket = null;
    state.reconnectSocket = null;
    state.reconnecting = false;
    state.sessionId = null;
    setBadge('未監聽', 'offline');
    els.startBtn.disabled = false;
    els.stopBtn.disabled = true;
  }

  function startWatchdog(timeoutSeconds) {
    clearWatchdog();
    const threshold = Math.max(45, (timeoutSeconds + 12)) * 1000;
    state.lastSeenAt = Date.now();
    state.watchdog = setInterval(() => {
      if (!state.socket || state.socket.readyState !== WebSocket.OPEN) return;
      if (Date.now() - state.lastSeenAt > threshold && !state.reconnecting) {
        log('超過預期時間未收到 Twitch keepalive，關閉連線等待使用者重連。');
        try { state.socket.close(4000, 'Keepalive timeout'); } catch {}
      }
    }, 5000);
  }

  function clearWatchdog() {
    if (state.watchdog) clearInterval(state.watchdog);
    state.watchdog = null;
  }

  function normalizeApiUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function refreshPublicUrl() {
    const base = normalizeApiUrl(els.publicApiUrl?.value);
    if (!els.publicStatsUrl) return;
    els.publicStatsUrl.textContent = base ? `${base}?action=stats` : '尚未設定';
  }

  function refreshPublicCounters() {
    if (!els.publicMonths) return;
    els.publicMonths.textContent = state.publicCounters.subscriptionMonths;
    els.publicGifts.textContent = state.publicCounters.giftSubCount;
    els.manualMonths.value = state.publicCounters.subscriptionMonths;
    els.manualGifts.value = state.publicCounters.giftSubCount;
    localStorage.setItem('subscriptionMonths', String(state.publicCounters.subscriptionMonths));
    localStorage.setItem('giftSubCount', String(state.publicCounters.giftSubCount));
  }

  function savePublicSettings() {
    localStorage.setItem('publicApiUrl', normalizeApiUrl(els.publicApiUrl.value));
    localStorage.setItem('publicWriteKey', els.publicWriteKey.value.trim());
    refreshPublicUrl();
    setStatus(els.publicInfo, 'Google 試算表設定已儲存。', 'ok');
  }

  async function publicFetch(action, options = {}) {
    const base = normalizeApiUrl(els.publicApiUrl.value);
    if (!base) throw new Error('尚未填入 Google Apps Script Web App 網址');

    if (!options.method || String(options.method).toUpperCase() === 'GET') {
      const url = new URL(base);
      url.searchParams.set('action', action);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      if (!response.ok) throw new Error(data?.error || data?.message || text || `HTTP ${response.status}`);
      return data;
    }

    // Apps Script 跨網域 POST 使用 text/plain，避免瀏覽器先送 OPTIONS 預檢造成失敗。
    const payload = options.payload || {};
    payload.action = action;
    payload.key = els.publicWriteKey.value.trim();
    const response = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok || data?.ok === false) throw new Error(data?.error || data?.message || text || `HTTP ${response.status}`);
    return data;
  }

  async function loadPublicCounters() {
    try {
      const data = await publicFetch('stats');
      const months = Number(data.subscriptionMonths);
      const gifts = Number(data.giftSubCount);
      if (!Number.isFinite(months) || !Number.isFinite(gifts)) throw new Error('Google 試算表回傳格式不正確');
      state.publicCounters.subscriptionMonths = months;
      state.publicCounters.giftSubCount = gifts;
      refreshPublicCounters();
      setStatus(els.publicInfo, `已讀取試算表數字：月份 ${months} / 贈禮 ${gifts}`, 'ok');
    } catch (err) {
      setStatus(els.publicInfo, `讀取失敗：${err.message}`, 'error');
      log(`Google 試算表讀取失敗：${err.message}`);
    }
  }

  async function setPublicCounters() {
    try {
      const months = Math.max(0, Math.floor(Number(els.manualMonths.value)));
      const gifts = Math.max(0, Math.floor(Number(els.manualGifts.value)));
      if (!Number.isFinite(months) || !Number.isFinite(gifts)) throw new Error('數字格式錯誤');
      state.publicCounters.subscriptionMonths = months;
      state.publicCounters.giftSubCount = gifts;
      refreshPublicCounters();

      const base = normalizeApiUrl(els.publicApiUrl.value);
      if (!base) {
        setStatus(els.publicInfo, `已在本機設定：月份 ${months} / 贈禮 ${gifts}（尚未設定 Google 試算表）`, 'ok');
        return;
      }
      const key = els.publicWriteKey.value.trim();
      if (!key) throw new Error('缺少更新金鑰');
      const data = await publicFetch('set', {
        method: 'POST',
        payload: { subscriptionMonths: months, giftSubCount: gifts },
      });
      state.publicCounters.subscriptionMonths = Number(data.subscriptionMonths);
      state.publicCounters.giftSubCount = Number(data.giftSubCount);
      refreshPublicCounters();
      setStatus(els.publicInfo, `已同步到 Google 試算表：月份 ${data.subscriptionMonths} / 贈禮 ${data.giftSubCount}`, 'ok');
    } catch (err) {
      setStatus(els.publicInfo, `同步失敗：${err.message}`, 'error');
      log(`Google 試算表同步失敗：${err.message}`);
    }
  }

  async function incrementPublicCounters(monthsDelta, giftDelta, eventId, reason) {
    // 先更新本機；即使公開 API 暫時斷線，畫面也會繼續累積。
    state.publicCounters.subscriptionMonths += monthsDelta;
    state.publicCounters.giftSubCount += giftDelta;
    refreshPublicCounters();
    log(`累積數字更新：${reason} → 月份 +${monthsDelta} / 贈禮 +${giftDelta}`);

    const base = normalizeApiUrl(els.publicApiUrl.value);
    const key = els.publicWriteKey.value.trim();
    if (!base || !key) {
      setStatus(els.publicInfo, `本機已更新：月份 ${state.publicCounters.subscriptionMonths} / 贈禮 ${state.publicCounters.giftSubCount}（未連公開 API）`, 'muted');
      return;
    }

    try {
      const data = await publicFetch('increment', {
        method: 'POST',
        payload: { subscriptionMonthsDelta: monthsDelta, giftSubCountDelta: giftDelta, eventId: eventId || null },
      });
      state.publicCounters.subscriptionMonths = Number(data.subscriptionMonths);
      state.publicCounters.giftSubCount = Number(data.giftSubCount);
      refreshPublicCounters();
      setStatus(els.publicInfo, `Google 試算表已更新：月份 ${data.subscriptionMonths} / 贈禮 ${data.giftSubCount}`, 'ok');
    } catch (err) {
      // 不回滾本機，避免事件消失；使用者之後可按「同步目前數字到網路」校正。
      setStatus(els.publicInfo, `Google 試算表同步失敗，但本機已保留新數字：${err.message}`, 'error');
      log(`Google 試算表增量同步失敗：${err.message}`);
    }
  }

  function setBadge(text, mode) {
    els.connectionBadge.textContent = text;
    els.connectionBadge.className = `badge ${mode}`;
  }

  function setStatus(el, text, mode) {
    el.textContent = text;
    el.className = `status-card ${mode}`;
  }

  function refreshCounters() {
    els.chatCount.textContent = state.counters.chat;
    els.subCount.textContent = state.counters.sub;
    els.resubCount.textContent = state.counters.resub;
    els.giftCount.textContent = state.counters.gift;
  }

  function log(message) {
    const row = `[${new Date().toLocaleTimeString('zh-TW', { hour12: false })}] ${message}`;
    els.debugLog.textContent = `${row}\n${els.debugLog.textContent}`.slice(0, 30000);
  }

  els.saveSettingsBtn.addEventListener('click', saveSettings);
  els.loginBtn.addEventListener('click', beginLogin);
  els.logoutBtn.addEventListener('click', logout);
  els.startBtn.addEventListener('click', startMonitoring);
  els.stopBtn.addEventListener('click', stopMonitoring);
  els.clearBtn.addEventListener('click', () => {
    els.eventList.innerHTML = '<div class="empty-state">等待事件...</div>';
    state.counters = { chat: 0, sub: 0, resub: 0, gift: 0 };
    refreshCounters();
  });
  els.savePublicBtn.addEventListener('click', savePublicSettings);
  els.loadPublicBtn.addEventListener('click', loadPublicCounters);
  els.setPublicBtn.addEventListener('click', setPublicCounters);
  els.publicApiUrl.addEventListener('input', refreshPublicUrl);

  els.copyJsonBtn.addEventListener('click', async () => {
    if (!state.lastSubscription) return;
    await navigator.clipboard.writeText(JSON.stringify(state.lastSubscription, null, 2));
    els.copyJsonBtn.textContent = '已複製';
    setTimeout(() => { els.copyJsonBtn.textContent = '複製 JSON'; }, 900);
  });

  window.addEventListener('beforeunload', () => {
    state.manuallyStopped = true;
    try { state.socket?.close(); } catch {}
    try { state.reconnectSocket?.close(); } catch {}
  });

  async function init() {
    loadSettings();

    // Twitch OAuth 回到同一頁時，網址 hash 會帶 access_token。
    // 直接在這個畫面接回登入，不建立任何第二視窗。
    const returnedFromTwitch = Boolean(location.hash && /(?:^|[&#])access_token=/.test(location.hash));
    if (returnedFromTwitch) {
      const ok = parseOauthFragment();
      if (ok) {
        await validateToken();
      }
    } else {
      restoreToken();
      if (state.token) await validateToken();
    }

    if (normalizeApiUrl(els.publicApiUrl.value)) await loadPublicCounters();
    log('頁面已載入。');
  }


  init();
})();

// Clean UI modal controls (kept outside the main app logic on purpose).
(() => {
  const modal = document.querySelector('#settingsModal');
  const openBtn = document.querySelector('#settingsBtn');
  const closeBtn = document.querySelector('#closeSettingsBtn');
  if (!modal || !openBtn || !closeBtn) return;
  const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();
