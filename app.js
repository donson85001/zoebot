(() => {
  'use strict';

  const WS_URL = 'wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30';
  const API = 'https://api.twitch.tv/helix';
  const OAUTH = 'https://id.twitch.tv/oauth2/authorize';
  const SCOPES = ['user:read:chat', 'user:write:chat'];
  const CLIENT_ID = '75se22u3rxqy926g81rxkzq6wb4fvt';
  const REDIRECT_URI = 'https://donson85001.github.io/zoebot/index.html';
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzLet29KonFvVjhxrzf7oM-g-FyfhVkyzYjbRLQtrHeX7zh4KLNXsIbfRdqGnYZuWzzZg/exec';

  const $ = (s) => document.querySelector(s);
  const el = {
    clientId: $('#clientId'), redirectUri: $('#redirectUri'), loginBtn: $('#loginBtn'), logoutBtn: $('#logoutBtn'),
    saveSettingsBtn: $('#saveSettingsBtn'), authInfo: $('#authInfo'), channelLogin: $('#channelLogin'), startBtn: $('#startBtn'),
    stopBtn: $('#stopBtn'), channelInfo: $('#channelInfo'), badge: $('#connectionBadge'), eventList: $('#eventList'), debug: $('#debugLog'),
    clearBtn: $('#clearBtn'), showChat: $('#showChat'), chatCount: $('#chatCount'), subCount: $('#subCount'), resubCount: $('#resubCount'),
    giftCount: $('#giftCount'), lastSubJson: $('#lastSubJson'), copyJsonBtn: $('#copyJsonBtn'), months: $('#publicMonths'), gifts: $('#publicGifts'),
    apiUrl: $('#publicApiUrl'), key: $('#publicWriteKey'), manualMonths: $('#manualMonths'), manualGifts: $('#manualGifts'),
    savePublicBtn: $('#savePublicBtn'), loadPublicBtn: $('#loadPublicBtn'), setPublicBtn: $('#setPublicBtn'), publicInfo: $('#publicInfo'),
    publicStatsUrl: $('#publicStatsUrl')
  };

  const state = {
    token: null, viewer: null, target: null, socket: null, stopped: false, seen: new Set(),
    counts: { chat: 0, sub: 0, resub: 0, gift: 0 }, last: null,
    public: { subscriptionMonths: 1546, giftSubCount: 395 }
  };

  const redirect = () => location.hostname.endsWith('github.io') ? REDIRECT_URI : location.href.split('#')[0].split('?')[0];
  const log = (text) => { if (el.debug) el.debug.textContent = `[${new Date().toLocaleTimeString('zh-TW', {hour12:false})}] ${text}\n${el.debug.textContent}`.slice(0, 30000); };
  const status = (node, text, mode = 'muted') => { node.textContent = text; node.className = `plain-status ${mode}`; };
  const badge = (text, mode) => { el.badge.textContent = text; el.badge.className = `badge ${mode}`; };

  function load() {
    el.clientId.value = CLIENT_ID;
    el.redirectUri.value = redirect();
    el.channelLogin.value = localStorage.getItem('lastChannelLogin') || '';
    el.apiUrl.value = GAS_URL;
    el.key.value = localStorage.getItem('publicWriteKey') || '';
    el.publicStatsUrl.textContent = `${GAS_URL}?action=stats`;
  }

  function save() {
    localStorage.setItem('twitchClientId', CLIENT_ID);
    localStorage.setItem('twitchRedirectUri', redirect());
    localStorage.setItem('lastChannelLogin', el.channelLogin.value.trim());
    localStorage.setItem('publicApiUrl', GAS_URL);
    localStorage.setItem('publicWriteKey', el.key.value.trim());
  }

  function nonce() {
    const a = new Uint8Array(24); crypto.getRandomValues(a);
    return [...a].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function login() {
    save();
    const n = nonce();
    localStorage.setItem('oauthState', n);
    const u = new URL(OAUTH);
    u.searchParams.set('response_type', 'token');
    u.searchParams.set('client_id', CLIENT_ID);
    u.searchParams.set('redirect_uri', redirect());
    u.searchParams.set('scope', SCOPES.join(' '));
    u.searchParams.set('state', n);
    location.assign(u.toString());
  }

  function consumeOauth() {
    if (!location.hash) return false;
    const p = new URLSearchParams(location.hash.slice(1));
    const token = p.get('access_token');
    if (!token) return false;
    const expected = localStorage.getItem('oauthState');
    if (expected && p.get('state') !== expected) {
      status(el.authInfo, 'OAuth 驗證失敗，請重新登入', 'error');
      return false;
    }
    localStorage.removeItem('oauthState');
    state.token = token;
    sessionStorage.setItem('twitchAccessToken', token);
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  }

  async function helix(path, options = {}) {
    if (!state.token) throw new Error('尚未登入 Twitch');
    const r = await fetch(API + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${state.token}`,
        'Client-Id': CLIENT_ID,
        ...(options.body ? {'Content-Type':'application/json'} : {}),
        ...(options.headers || {})
      }
    });
    const text = await r.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) throw new Error(`${r.status}: ${data?.message || text || 'Twitch API error'}`);
    return data;
  }

  async function validate() {
    if (!state.token) return false;
    try {
      const r = await fetch('https://id.twitch.tv/oauth2/validate', { headers: { Authorization: `OAuth ${state.token}` } });
      if (!r.ok) throw new Error(`Token 驗證失敗 (${r.status})`);
      const v = await r.json();
      for (const scope of SCOPES) {
        if (!(v.scopes || []).includes(scope)) throw new Error(`缺少 ${scope}，請重新登入 Twitch`);
      }
      const u = await helix('/users');
      state.viewer = u.data?.[0];
      if (!state.viewer) throw new Error('無法取得 Twitch 使用者');
      status(el.authInfo, `已登入：${state.viewer.display_name} (@${state.viewer.login})`, 'ok');
      return true;
    } catch (err) {
      sessionStorage.removeItem('twitchAccessToken');
      state.token = null; state.viewer = null;
      status(el.authInfo, `登入無效：${err.message}`, 'error');
      return false;
    }
  }

  async function resolveChannel(loginName) {
    const n = loginName.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//i,'').split(/[/?#]/)[0].toLowerCase();
    if (!n) throw new Error('請輸入 Twitch 頻道名稱');
    const d = await helix(`/users?login=${encodeURIComponent(n)}`);
    if (!d.data?.[0]) throw new Error(`找不到頻道：${n}`);
    return d.data[0];
  }

  async function start() {
    try {
      if (!state.viewer && !(await validate())) throw new Error('請先重新登入 Twitch');
      state.target = await resolveChannel(el.channelLogin.value);
      localStorage.setItem('lastChannelLogin', state.target.login);
      status(el.channelInfo, `目標：${state.target.display_name} (@${state.target.login})`, 'ok');
      state.stopped = false;
      connect(WS_URL);
    } catch (err) {
      status(el.channelInfo, err.message, 'error');
      log(err.message);
    }
  }

  function connect(url) {
    badge('連線中', 'connecting');
    if (state.socket) try { state.socket.close(); } catch {}
    const ws = new WebSocket(url); state.socket = ws;
    ws.onmessage = ev => handleSocket(ev);
    ws.onerror = () => log('WebSocket 發生錯誤');
    ws.onclose = () => { if (!state.stopped) { badge('已斷線','offline'); el.startBtn.disabled=false; el.stopBtn.disabled=true; } };
  }

  async function handleSocket(ev) {
    let p; try { p = JSON.parse(ev.data); } catch { return; }
    const m = p.metadata || {}, id = m.message_id;
    if (id) {
      if (state.seen.has(id)) return;
      state.seen.add(id);
      if (state.seen.size > 2000) state.seen.delete(state.seen.values().next().value);
    }
    if (m.message_type === 'session_welcome') {
      try {
        await subscribe(p.payload.session.id);
        badge('監聽中','online'); el.startBtn.disabled=true; el.stopBtn.disabled=false;
      } catch (err) {
        badge('建立訂閱失敗','offline'); status(el.channelInfo, `建立 EventSub 失敗：${err.message}`, 'error'); log(err.message);
        try { state.socket.close(); } catch {}
      }
    } else if (m.message_type === 'session_reconnect') {
      const u = p.payload.session.reconnect_url; if (u) connect(u);
    } else if (m.message_type === 'notification') {
      notification(p);
    }
  }

  async function subscribe(sessionId) {
    const condition = { broadcaster_user_id: state.target.id, user_id: state.viewer.id };
    for (const type of ['channel.chat.message','channel.chat.notification']) {
      await helix('/eventsub/subscriptions', { method:'POST', body:JSON.stringify({type,version:'1',condition,transport:{method:'websocket',session_id:sessionId}}) });
      log(`EventSub 已建立：${type}`);
    }
  }

  const tier = x => x === '1000' ? 1 : x === '2000' ? 2 : x === '3000' ? 3 : (x || null);

  function card(cat,title,who,msg,params=[]) {
    el.eventList.querySelector('.empty-state')?.remove();
    const a=document.createElement('article'); a.className=`event-item ${cat}`;
    const meta=document.createElement('div'); meta.className='event-meta'; meta.textContent=`${new Date().toLocaleTimeString('zh-TW',{hour12:false})}  #${state.target?.login||''}`;
    const t=document.createElement('div'); t.className='event-title'; t.textContent=`${title} · ${who}`;
    const x=document.createElement('div'); x.className='event-message'; x.textContent=msg||'';
    a.append(meta,t,x);
    if(params.length){const w=document.createElement('div');w.className='event-params';params.forEach(v=>{const s=document.createElement('span');s.className='param';s.textContent=v;w.append(s)});a.append(w)}
    el.eventList.prepend(a); while(el.eventList.children.length>300) el.eventList.lastElementChild.remove();
  }

  function notification(p) {
    const type=p.payload.subscription?.type, ev=p.payload.event||{};
    if(type==='channel.chat.message'){
      state.counts.chat++; counts();
      const chatText=(ev.message?.text||'').replace(/\s+/g,'').trim();
      if(chatText==='!餘興節目累積') {
        sendEntertainmentReply(ev).catch(err=>log(`餘興節目指令回覆失敗：${err.message}`));
      }
      if(el.showChat.checked) card('chat','聊天室',ev.chatter_user_name||ev.chatter_user_login||'未知',ev.message?.text||'');
      return;
    }
    const n=ev.notice_type, who=ev.chatter_is_anonymous?'匿名':(ev.chatter_user_name||ev.chatter_user_login||'未知');
    if(n==='sub'){
      const d=ev.sub||{}; state.counts.sub++; counts();
      const item={type:'sub',tier:tier(d.sub_tier),isPrime:!!d.is_prime}; last(item);
      card('sub','新訂閱',who,ev.message?.text||'',Object.entries(item).map(([k,v])=>`${k}=${v}`));
    } else if(n==='resub'){
      const d=ev.resub||{}, months=Number(d.cumulative_months); state.counts.resub++; counts();
      const item={type:'resub',tier:tier(d.sub_tier),cumulativeMonths:d.cumulative_months??null,durationMonths:d.duration_months??null,streakMonths:d.streak_months??null}; last(item);
      card('resub','續訂',who,ev.message?.text||'',Object.entries(item).map(([k,v])=>`${k}=${v}`));
      if(Number.isFinite(months)&&months>0) {
        increment(months,0,p.metadata?.message_id,{
          type:'resub',
          who,
          tier:tier(d.sub_tier),
          durationMonths:d.duration_months??null,
          cumulativeMonths:d.cumulative_months??null
        });
      }
    } else if(n==='community_sub_gift'){
      const d=ev.community_sub_gift||{}, total=Number(d.total), plus=Number.isFinite(total)?Math.floor(total/5):0; state.counts.gift++; counts();
      const item={type:'community_sub_gift',tier:tier(d.sub_tier),total:d.total??null,cumulativeTotal:d.cumulative_total??null}; last(item);
      card('gift','批次贈訂',who,ev.message?.text||'',Object.entries(item).map(([k,v])=>`${k}=${v}`));
      if(plus>0) {
        increment(0,plus,p.metadata?.message_id,{
          type:'community_sub_gift',
          who,
          tier:tier(d.sub_tier),
          total:d.total??null
        });
      }
    } else if(n==='sub_gift'){
      state.counts.gift++; counts(); const d=ev.sub_gift||{};
      const item={type:'sub_gift',tier:tier(d.sub_tier),durationMonths:d.duration_months??null}; last(item);
      card('gift','單筆贈訂',who,ev.message?.text||'',Object.entries(item).map(([k,v])=>`${k}=${v}`));
    }
  }

  function last(item){ state.last=item; el.lastSubJson.textContent=JSON.stringify(item,null,2); }
  function counts(){ el.chatCount.textContent=state.counts.chat; el.subCount.textContent=state.counts.sub; el.resubCount.textContent=state.counts.resub; el.giftCount.textContent=state.counts.gift; }
  function stop(){ state.stopped=true; try{state.socket?.close(1000,'User stopped')}catch{} state.socket=null; badge('未監聽','offline'); el.startBtn.disabled=false; el.stopBtn.disabled=true; }
  function refresh(){ el.months.textContent=state.public.subscriptionMonths; el.gifts.textContent=state.public.giftSubCount; el.manualMonths.value=state.public.subscriptionMonths; el.manualGifts.value=state.public.giftSubCount; }

  async function getStats(){
    try{
      const r=await fetch(`${GAS_URL}?action=stats&_=${Date.now()}`,{cache:'no-store'}),d=await r.json();
      const m=Number(d.subscriptionMonths),g=Number(d.giftSubCount); if(!Number.isFinite(m)||!Number.isFinite(g))throw Error('回傳格式不正確');
      state.public.subscriptionMonths=m; state.public.giftSubCount=g; refresh();
      el.publicInfo.textContent=`已讀取：月份 ${m} / 贈禮 ${g}`; el.publicInfo.className='settings-status ok';
    }catch(err){ el.publicInfo.textContent=`讀取失敗：${err.message}`; el.publicInfo.className='settings-status error'; }
  }

  async function gasPost(action,payload){
    const key=el.key.value.trim(); if(!key)throw Error('缺少更新金鑰');
    const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,action,key}),cache:'no-store'});
    const d=await r.json(); if(!r.ok||d.ok===false)throw Error(d.error||d.message||`HTTP ${r.status}`); return d;
  }

  async function sendChatMessage(message){
    if(!state.target || !state.viewer) throw new Error('尚未選擇頻道或登入 Twitch');
    const d=await helix('/chat/messages',{method:'POST',body:JSON.stringify({broadcaster_id:state.target.id,sender_id:state.viewer.id,message})});
    const result=d?.data?.[0];
    if(result?.is_sent===false) throw new Error(result.drop_reason?.message||'Twitch 沒有送出訊息');
    log(`聊天室已發送：${message}`);
  }

  async function sendEntertainmentReply(ev){
    const m=Number(state.public.subscriptionMonths),g=Number(state.public.giftSubCount);
    if(!Number.isFinite(m)||!Number.isFinite(g)) throw new Error('目前累積數字無效');
    const who=ev.chatter_user_login||ev.chatter_user_name||'觀眾';
    await sendChatMessage(`@${who} 目前累積豬叫聲${m}次，累積海豹拍${g}次。`);
  }

  async function sendCounterChat(){
    const message=`累積豬叫聲:${state.public.subscriptionMonths}次，累積海豹拍肚:${state.public.giftSubCount}次。`;
    await sendChatMessage(message);
  }

  async function increment(monthDelta,giftDelta,eventId,detail=null){
    state.public.subscriptionMonths+=monthDelta; state.public.giftSubCount+=giftDelta; refresh();
    try{
      const d=await gasPost('increment',{
        subscriptionMonthsDelta:monthDelta,
        giftSubCountDelta:giftDelta,
        eventId:eventId||null,
        detail
      });
      state.public.subscriptionMonths=Number(d.subscriptionMonths); state.public.giftSubCount=Number(d.giftSubCount); refresh();
      try{ await sendCounterChat(); }catch(chatErr){ log(`聊天室發送失敗：${chatErr.message}`); }
    }catch(err){ log(`試算表同步失敗：${err.message}`); }
  }

  async function setStats(){
    try{
      const m=Math.max(0,Math.floor(Number(el.manualMonths.value))),g=Math.max(0,Math.floor(Number(el.manualGifts.value)));
      const d=await gasPost('set',{subscriptionMonths:m,giftSubCount:g});
      state.public.subscriptionMonths=Number(d.subscriptionMonths); state.public.giftSubCount=Number(d.giftSubCount); refresh();
      el.publicInfo.textContent='同步成功'; el.publicInfo.className='settings-status ok';
    }catch(err){ el.publicInfo.textContent=`同步失敗：${err.message}`; el.publicInfo.className='settings-status error'; }
  }

  el.loginBtn.onclick=login;
  el.logoutBtn.onclick=()=>{stop();sessionStorage.removeItem('twitchAccessToken');state.token=null;state.viewer=null;status(el.authInfo,'已清除 Twitch 登入','muted')};
  el.startBtn.onclick=start; el.stopBtn.onclick=stop;
  el.clearBtn.onclick=()=>{el.eventList.innerHTML='<div class="empty-state">等待事件...</div>';state.counts={chat:0,sub:0,resub:0,gift:0};counts()};
  el.saveSettingsBtn.onclick=save;
  el.savePublicBtn.onclick=()=>{save();el.publicInfo.textContent='設定已儲存';el.publicInfo.className='settings-status ok'};
  el.loadPublicBtn.onclick=getStats; el.setPublicBtn.onclick=setStats;
  el.copyJsonBtn.onclick=async()=>{if(state.last)await navigator.clipboard.writeText(JSON.stringify(state.last,null,2))};

  const modal=$('#settingsModal'), open=$('#settingsBtn'), close=$('#closeSettingsBtn');
  open.onclick=()=>modal.hidden=false; close.onclick=()=>modal.hidden=true; modal.onclick=x=>{if(x.target===modal)modal.hidden=true};

  (async()=>{
    load();
    state.token=sessionStorage.getItem('twitchAccessToken');
    if(location.hash.includes('access_token=')) consumeOauth();
    if(state.token) await validate();
    await getStats();
    log('GitHub Pages 版已載入（含聊天室自動回報）');
  })();
})();