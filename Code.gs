/**
 * Twitch 公開累積數字 - Google 試算表後端
 *
 * 規則：
 * 1. 續訂：把該人的 cumulativeMonths 整個加到 subscriptionMonths。
 * 2. 批次贈訂：每 5 份 +1；10 份 +2。
 * 3. SubscriptionDetail 永遠依時間由舊到新排列（最舊在上、最新在下）。
 */

const UPDATE_KEY = 'donson-twitch-2026-change-this';
const COUNTER_SHEET = 'TwitchCounter';
const LOG_SHEET = 'EventLog';
const DETAIL_SHEET = 'SubscriptionDetail';
const INITIAL_MONTHS = 1546;
const INITIAL_GIFTS = 395;

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('請從 Google 試算表內的「擴充功能 > Apps Script」執行 setup()。');

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  let sheet = ss.getSheetByName(COUNTER_SHEET);
  if (!sheet) sheet = ss.insertSheet(COUNTER_SHEET);

  sheet.getRange('A1:B3').setValues([
    ['名稱', '數值'],
    ['subscriptionMonths', INITIAL_MONTHS],
    ['giftSubCount', INITIAL_GIFTS],
  ]);
  sheet.setFrozenRows(1);

  let log = ss.getSheetByName(LOG_SHEET);
  if (!log) log = ss.insertSheet(LOG_SHEET);
  if (log.getLastRow() === 0) {
    log.appendRow(['時間', 'eventId', '類型', '月份增加', '贈禮增加', '更新後月份', '更新後贈禮']);
  }
  log.setFrozenRows(1);

  let detail = ss.getSheetByName(DETAIL_SHEET);
  if (!detail) detail = ss.insertSheet(DETAIL_SHEET);
  ensureDetailLayout_(detail);
  sortDetailOldestFirst_(detail);

  Logger.log('設定完成');
  Logger.log('UPDATE_KEY = ' + UPDATE_KEY);
  Logger.log('試算表 ID = ' + ss.getId());
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'stats').toLowerCase();
    const counters = readCounters_();

    if (action === 'months' || action === 'subscription-months') {
      return text_(String(counters.subscriptionMonths));
    }
    if (action === 'gifts' || action === 'gift-count') {
      return text_(String(counters.giftSubCount));
    }
    return json_({ ok: true, ...counters, updatedAt: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = parseBody_(e);
    if (String(body.key || '') !== UPDATE_KEY) {
      return json_({ ok: false, error: '更新金鑰錯誤' });
    }

    const action = String(body.action || '').toLowerCase();
    if (action === 'set') return setCounters_(body);
    if (action === 'increment') return incrementCounters_(body);
    return json_({ ok: false, error: '未知 action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function setCounters_(body) {
  const months = toNonNegativeInt_(body.subscriptionMonths, 'subscriptionMonths');
  const gifts = toNonNegativeInt_(body.giftSubCount, 'giftSubCount');
  writeCounters_(months, gifts);
  // 手動設定不屬於訂閱／贈訂事件，不再寫入 EventLog 的 0 / 0 紀錄。
  return json_({ ok: true, subscriptionMonths: months, giftSubCount: gifts });
}

function incrementCounters_(body) {
  const eventId = String(body.eventId || '').trim();
  if (eventId && alreadyProcessed_(eventId)) {
    const current = readCounters_();
    return json_({ ok: true, duplicate: true, ...current });
  }

  const monthsDelta = toInt_(body.subscriptionMonthsDelta || 0, 'subscriptionMonthsDelta');
  const giftDelta = toInt_(body.giftSubCountDelta || 0, 'giftSubCountDelta');
  if (monthsDelta < 0 || giftDelta < 0) throw new Error('增量不可小於 0');

  const current = readCounters_();
  const months = current.subscriptionMonths + monthsDelta;
  const gifts = current.giftSubCount + giftDelta;
  writeCounters_(months, gifts);

  if (eventId) rememberProcessed_(eventId);
  logEvent_(eventId, 'increment', monthsDelta, giftDelta, months, gifts);
  logDetail_(eventId, body.detail || {}, monthsDelta, giftDelta, months, gifts);

  return json_({ ok: true, subscriptionMonths: months, giftSubCount: gifts });
}

function readCounters_() {
  const sheet = getCounterSheet_();
  const values = sheet.getRange('B2:B3').getValues().flat();
  return {
    subscriptionMonths: Number(values[0]) || 0,
    giftSubCount: Number(values[1]) || 0,
  };
}

function writeCounters_(months, gifts) {
  const sheet = getCounterSheet_();
  sheet.getRange('B2:B3').setValues([[months], [gifts]]);
  SpreadsheetApp.flush();
}

function getCounterSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('尚未執行 setup()');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(COUNTER_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(COUNTER_SHEET);
    sheet.getRange('A1:B3').setValues([
      ['名稱', '數值'],
      ['subscriptionMonths', INITIAL_MONTHS],
      ['giftSubCount', INITIAL_GIFTS],
    ]);
  }
  return sheet;
}

function logEvent_(eventId, type, monthsDelta, giftDelta, months, gifts) {
  // 兩種增量都為 0 的紀錄沒有事件資訊價值，直接略過。
  if (Number(monthsDelta) === 0 && Number(giftDelta) === 0) return;

  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET);
    sheet.appendRow(['時間', 'eventId', '類型', '月份增加', '贈禮增加', '更新後月份', '更新後贈禮']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), eventId, type, monthsDelta, giftDelta, months, gifts]);
}

function logDetail_(eventId, detail, monthsDelta, giftDelta, months, gifts) {
  if (!detail || typeof detail !== 'object') return;

  const type = cleanCell_(detail.type);
  if (type !== 'resub' && type !== 'community_sub_gift') return;

  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(DETAIL_SHEET);
  if (!sheet) sheet = ss.insertSheet(DETAIL_SHEET);
  ensureDetailLayout_(sheet);

  const who = cleanCell_(detail.who);
  const tier = nullableInt_(detail.tier);
  const quantityOrDuration = type === 'resub'
    ? nullableInt_(detail.durationMonths)
    : nullableInt_(detail.total);
  const cumulativeMonths = type === 'resub' ? nullableInt_(detail.cumulativeMonths) : '';

  sheet.appendRow([
    new Date(),
    eventId,
    type === 'resub' ? '續訂' : '贈送訂閱',
    who,
    tier,
    quantityOrDuration,
    cumulativeMonths,
    months,
    gifts,
  ]);

  // 新資料寫入後強制維持：最舊在上、最新在下。
  sortDetailOldestFirst_(sheet);
}

function ensureDetailLayout_(sheet) {
  const headers = ['時間', 'eventId', '類型', '誰', 'Tier', '數量／一次幾個月', '累積第幾月', '增加後豬叫', '增加後海豹拍'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);

  // 整張明細表統一對齊；未來 appendRow 也會沿用欄位格式。
  const rows = Math.max(sheet.getMaxRows(), 2);
  sheet.getRange(1, 1, rows, headers.length)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setColumnWidth(1, 175);
  sheet.setColumnWidth(2, 300);
  for (let c = 3; c <= 9; c++) sheet.setColumnWidth(c, 125);
}

function sortDetailOldestFirst_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 2) return;
  sheet.getRange(2, 1, lastRow - 1, 9).sort({ column: 1, ascending: true });
}

function cleanCell_(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/^[=+\-@]/, "'$&");
}

function nullableInt_(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : '';
}

function alreadyProcessed_(eventId) {
  const raw = PropertiesService.getScriptProperties().getProperty('RECENT_EVENT_IDS') || '[]';
  let ids = [];
  try { ids = JSON.parse(raw); } catch (_) {}
  return ids.indexOf(eventId) !== -1;
}

function rememberProcessed_(eventId) {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('RECENT_EVENT_IDS') || '[]';
  let ids = [];
  try { ids = JSON.parse(raw); } catch (_) {}
  ids.push(eventId);
  if (ids.length > 300) ids = ids.slice(-300);
  props.setProperty('RECENT_EVENT_IDS', JSON.stringify(ids));
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch (_) { throw new Error('POST JSON 格式錯誤'); }
}

function toNonNegativeInt_(value, name) {
  const n = toInt_(value, name);
  if (n < 0) throw new Error(name + ' 不可小於 0');
  return n;
}

function toInt_(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(name + ' 不是有效數字');
  return Math.floor(n);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function text_(value) {
  return ContentService
    .createTextOutput(String(value))
    .setMimeType(ContentService.MimeType.TEXT);
}
