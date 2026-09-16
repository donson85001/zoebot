import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const formal = readFileSync('obs-overlay-core-v16.html', 'utf8');
const test = readFileSync('gift-marquee-obs-test.html', 'utf8');
const shell = readFileSync('obs-overlay.html', 'utf8');
const testShell = readFileSync('gift-marquee-test.html', 'utf8');
const backend = readFileSync('Code.gs', 'utf8');
const expected = {
  50: ['seal.mp4?v=fa7babdabdcd','Conan-520.mp4?v=32ffb0869107','sir.mp4?v=c973d0301c79','0725.mp4?v=72fb7c5cc455','comb_1.mp4?v=879c5cec3f25'],
  100: ['boy.mp4?v=68d97cff615a','SLAM-DUNK-520.mp4?v=9b1ab08a5c23','baseball-520.mp4?v=833e68c70c39','love.mp4?v=2522c09e7b36','tc.mp4?v=6e914fd80eda'],
  150: ['0859457.mp4?v=1d53ab12fe18','02-520.mp4?v=93fcd7ca1b74','facechange-520.mp4?v=c741fa297cc7','shark-520.mp4?v=21b272496d21','pi2.mp4?v=6a975fbf7c9c'],
  200: ['lemon.mp4?v=3fde48d7f5a7','up-520.mp4?v=a6da404f2f61','ni.mp4?v=1f75b50a467e','kokain.mp4?v=307b80fe072f','hongkong_1.mp4?v=086a16d9500c']
};
function media(html){const out={50:[],100:[],150:[],200:[]};for(const m of html.matchAll(/data-tier="(50|100|150|200)" data-variant="([1-5])"><video src="([^"]+)"/g))out[m[1]][Number(m[2])-1]=m[3];return out}
function ok(value,message){if(!value)throw new Error(message)}
ok(JSON.stringify(media(formal))===JSON.stringify(expected),'正式版 20 支影片或原版本參數被改動');
ok(JSON.stringify(media(test))===JSON.stringify(expected),'測試版 20 支影片或原版本參數被改動');
for(const list of Object.values(expected))for(const url of list){const file=url.split('?')[0];ok(existsSync(file),`缺少影片 ${file}`);execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height','-of','csv=p=0',file]);}
for(const html of [formal,test,shell,testShell])for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
new Function(backend);
ok(!formal.includes('checkForPageUpdate'),'播放核心不應自行重整');
ok(shell.includes('isPlaying?.()')&&shell.includes('remoteBuildHits<2'),'正式外層缺少待機及連續版本確認');
ok(formal.includes('setNextVariants'),'正式核心缺少免重載順序同步');
ok(formal.includes('MAX_BLOB_CACHE=8'),'正式核心缺少 Blob 快取上限');
ok(formal.includes('refreshMediaVersions')&&formal.includes('MEDIA_VERSION_POLL_MS'),'正式核心缺少自動影片版本刷新');
ok(test.includes('refreshMediaVersions')&&test.includes('MEDIA_VERSION_POLL_MS'),'測試核心缺少自動影片版本刷新');
ok(!backend.includes("const UPDATE_KEY = '"),'公開原始碼仍含固定更新金鑰');
ok(backend.includes("getProperty(UPDATE_KEY_PROPERTY)"),'後端沒有從 Script Properties 讀取金鑰');
ok(backend.includes('acknowledgeAnimationState_'),'後端缺少正式程式已讀確認');
console.log('OK: 20 支影片、腳本語法、免重載同步、更新防護、快取限制與自動影片刷新全部通過');
