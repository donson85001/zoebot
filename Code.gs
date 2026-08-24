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
  sheet.getRange('A1:B3').setValues([['名稱','數值'],['subscriptionMonths',INITIAL_MONTHS],['giftSubCount',INITIAL_GIFTS]]);
  sheet.setFrozenRows(1);
  let log = ss.getSheetByName(LOG_SHEET);
  if (!log) log = ss.insertSheet(LOG_SHEET);
  if (log.getLastRow() === 0) log.appendRow(['時間','eventId','類型','月份增加','贈禮增加','更新後月份','更新後贈禮']);
  log.setFrozenRows(1);
  let detail = ss.getSheetByName(DETAIL_SHEET);
  if (!detail) detail = ss.insertSheet(DETAIL_SHEET);
  ensureDetailLayout_(detail);
  sortDetailOldestFirst_(detail);
}
function doGet(e){try{const action=String((e&&e.parameter&&e.parameter.action)||'stats').toLowerCase(),c=readCounters_();if(action==='months'||action==='subscription-months')return text_(String(c.subscriptionMonths));if(action==='gifts'||action==='gift-count')return text_(String(c.giftSubCount));return json_({ok:true,...c,updatedAt:new Date().toISOString()});}catch(err){return json_({ok:false,error:String(err&&err.message?err.message:err)});}}
function doPost(e){const lock=LockService.getScriptLock();lock.waitLock(10000);try{const body=parseBody_(e);if(String(body.key||'')!==UPDATE_KEY)return json_({ok:false,error:'更新金鑰錯誤'});const action=String(body.action||'').toLowerCase();if(action==='set')return setCounters_(body);if(action==='increment')return incrementCounters_(body);return json_({ok:false,error:'未知 action'});}catch(err){return json_({ok:false,error:String(err&&err.message?err.message:err)});}finally{lock.releaseLock();}}
function setCounters_(body){const months=toNonNegativeInt_(body.subscriptionMonths,'subscriptionMonths'),gifts=toNonNegativeInt_(body.giftSubCount,'giftSubCount');writeCounters_(months,gifts);return json_({ok:true,subscriptionMonths:months,giftSubCount:gifts});}
function incrementCounters_(body){const eventId=String(body.eventId||'').trim();if(eventId&&alreadyProcessed_(eventId)){const current=readCounters_();return json_({ok:true,duplicate:true,...current});}const monthsDelta=toInt_(body.subscriptionMonthsDelta||0,'subscriptionMonthsDelta'),giftDelta=toInt_(body.giftSubCountDelta||0,'giftSubCountDelta');if(monthsDelta<0||giftDelta<0)throw new Error('增量不可小於 0');const current=readCounters_(),months=current.subscriptionMonths+monthsDelta,gifts=current.giftSubCount+giftDelta;writeCounters_(months,gifts);if(eventId)rememberProcessed_(eventId);logEvent_(eventId,'increment',monthsDelta,giftDelta,months,gifts);logDetail_(eventId,body.detail||{},monthsDelta,giftDelta,months,gifts);return json_({ok:true,subscriptionMonths:months,giftSubCount:gifts});}
function readCounters_(){const v=getCounterSheet_().getRange('B2:B3').getValues().flat();return{subscriptionMonths:Number(v[0])||0,giftSubCount:Number(v[1])||0};}
function writeCounters_(months,gifts){getCounterSheet_().getRange('B2:B3').setValues([[months],[gifts]]);SpreadsheetApp.flush();}
function getCounterSheet_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw new Error('尚未執行 setup()');const ss=SpreadsheetApp.openById(id);let s=ss.getSheetByName(COUNTER_SHEET);if(!s){s=ss.insertSheet(COUNTER_SHEET);s.getRange('A1:B3').setValues([['名稱','數值'],['subscriptionMonths',INITIAL_MONTHS],['giftSubCount',INITIAL_GIFTS]]);}return s;}
function logEvent_(eventId,type,monthsDelta,giftDelta,months,gifts){if(Number(monthsDelta)===0&&Number(giftDelta)===0)return;const ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));let s=ss.getSheetByName(LOG_SHEET);if(!s){s=ss.insertSheet(LOG_SHEET);s.appendRow(['時間','eventId','類型','月份增加','贈禮增加','更新後月份','更新後贈禮']);s.setFrozenRows(1);}s.appendRow([new Date(),eventId,type,monthsDelta,giftDelta,months,gifts]);}
function logDetail_(eventId,detail,monthsDelta,giftDelta,months,gifts){if(!detail||typeof detail!=='object')return;const type=cleanCell_(detail.type);if(type!=='resub'&&type!=='community_sub_gift')return;const ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));let s=ss.getSheetByName(DETAIL_SHEET);if(!s)s=ss.insertSheet(DETAIL_SHEET);ensureDetailLayout_(s);const who=cleanCell_(detail.who),tier=nullableInt_(detail.tier),quantity=type==='resub'?nullableInt_(detail.durationMonths):nullableInt_(detail.total),cumulative=type==='resub'?nullableInt_(detail.cumulativeMonths):'';s.appendRow([new Date(),type==='resub'?'續訂':'贈送訂閱',who,tier,quantity,cumulative,months,gifts,eventId]);sortDetailOldestFirst_(s);}
function ensureDetailLayout_(s){const headers=['時間','類型','誰','Tier','數量／一次幾個月','累積第幾月','增加後豬叫','增加後海豹拍','eventId'];s.getRange(1,1,1,9).setValues([headers]);s.setFrozenRows(1);const rows=Math.max(s.getMaxRows(),2);s.getRange(1,1,rows,9).setHorizontalAlignment('center').setVerticalAlignment('middle');s.getRange(1,1,1,9).setFontWeight('bold');s.setColumnWidth(1,175);for(let c=2;c<=8;c++)s.setColumnWidth(c,125);s.setColumnWidth(9,300);}
function sortDetailOldestFirst_(s){const last=s.getLastRow();if(last<=2)return;s.getRange(2,1,last-1,9).sort({column:1,ascending:true});}
function cleanCell_(v){if(v===null||v===undefined)return'';return String(v).replace(/^[=+\-@]/,"'$&");}
function nullableInt_(v){if(v===null||v===undefined||v==='')return'';const n=Number(v);return Number.isFinite(n)?Math.floor(n):'';}
function alreadyProcessed_(id){const raw=PropertiesService.getScriptProperties().getProperty('RECENT_EVENT_IDS')||'[]';let ids=[];try{ids=JSON.parse(raw);}catch(_){}return ids.indexOf(id)!==-1;}
function rememberProcessed_(id){const p=PropertiesService.getScriptProperties(),raw=p.getProperty('RECENT_EVENT_IDS')||'[]';let ids=[];try{ids=JSON.parse(raw);}catch(_){}ids.push(id);if(ids.length>300)ids=ids.slice(-300);p.setProperty('RECENT_EVENT_IDS',JSON.stringify(ids));}
function parseBody_(e){const raw=e&&e.postData&&e.postData.contents?e.postData.contents:'';if(!raw)return{};try{return JSON.parse(raw);}catch(_){throw new Error('POST JSON 格式錯誤');}}
function toNonNegativeInt_(v,n){const x=toInt_(v,n);if(x<0)throw new Error(n+' 不可小於 0');return x;}
function toInt_(v,n){const x=Number(v);if(!Number.isFinite(x))throw new Error(n+' 不是有效數字');return Math.floor(x);}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function text_(v){return ContentService.createTextOutput(String(v)).setMimeType(ContentService.MimeType.TEXT);}
