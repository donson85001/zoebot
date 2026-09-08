from pathlib import Path

KV='307b80fe072f'

def one(s,a,b,label):
    n=s.count(a)
    if n!=1: raise SystemExit(f'{label}: expected 1 match, got {n}')
    return s.replace(a,b,1)

# formal core
p=Path('obs-overlay-core-v16.html'); s=p.read_text(encoding='utf-8')
s=one(s,"const OBS_BUILD='20260908-0800-production-love-v22',UPDATE_CHECK_MS=10000,MIN_GIFT=50,IDLE_GRACE_MS=1100,VARIANT_STATE_KEY='zoebot-marquee-next-variant-v2';","const OBS_BUILD='20260908-0942-production-kokain-v24',UPDATE_CHECK_MS=10000,MIN_GIFT=50,IDLE_GRACE_MS=1100,VARIANT_STATE_KEY='zoebot-marquee-next-variant-v2',ALT150_STATE_KEY='zoebot-marquee-150v2-next-v1';",'build')
s=one(s,'<div class="tierMedia" data-tier="150" data-variant="2"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>','<div class="tierMedia" data-tier="150" data-variant="2" data-alt="02"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="kokain"><video src="kokain.mp4?v='+KV+'" playsinline preload="none"></video></div>','media')
old="const nextVariant={50:1,100:1,150:1,200:1};try{const saved=JSON.parse(localStorage.getItem(VARIANT_STATE_KEY)||'{}');[50,100,150,200].forEach(t=>{const v=Number(saved?.[t]);if(v>=1&&v<=3)nextVariant[t]=v})}catch(_){}function saveVariantState(){try{localStorage.setItem(VARIANT_STATE_KEY,JSON.stringify(nextVariant))}catch(_){}}const tierForCount=count=>count>=200?200:count>=150?150:count>=100?100:50;function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;saveVariantState();return v}"
new="const nextVariant={50:1,100:1,150:1,200:1};try{const saved=JSON.parse(localStorage.getItem(VARIANT_STATE_KEY)||'{}');[50,100,150,200].forEach(t=>{const v=Number(saved?.[t]);if(v>=1&&v<=3)nextVariant[t]=v})}catch(_){}function saveVariantState(){try{localStorage.setItem(VARIANT_STATE_KEY,JSON.stringify(nextVariant))}catch(_){}}let next150v2='kokain';try{const a=localStorage.getItem(ALT150_STATE_KEY);if(a==='02'||a==='kokain')next150v2=a}catch(_){}function save150v2State(){try{localStorage.setItem(ALT150_STATE_KEY,next150v2)}catch(_){}}const tierForCount=count=>count>=200?200:count>=150?150:count>=100?100:50;function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;saveVariantState();return v}function assign150v2(item){if(tierForCount(item.count)!==150||item.variant!==2)return;if(item.mediaAlt==='02'||item.mediaAlt==='kokain')return;item.mediaAlt=next150v2;next150v2=next150v2==='02'?'kokain':'02';save150v2State()}"
s=one(s,old,new,'state')
old="const entries=[...document.querySelectorAll('.tierMedia')].map(media=>{const video=media.querySelector('video');video.loop=false;video.volume=1;return{media,video,tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),muted:media.dataset.muted==='1',blobPromise:null,blobUrl:null,sourceUrl:video.getAttribute('src')}}),entryMap=new Map(entries.map(e=>[`${e.tier}:${e.variant}`,e])),entryFor=(count,variant)=>entryMap.get(`${tierForCount(count)}:${variant}`)||entryMap.get(`${tierForCount(count)}:1`),criticalKeys=new Set(['50:1','200:1']),keyOf=e=>`${e.tier}:${e.variant}`;"
new="const entries=[...document.querySelectorAll('.tierMedia')].map(media=>{const video=media.querySelector('video');video.loop=false;video.volume=1;return{media,video,tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),alt:String(media.dataset.alt||''),muted:media.dataset.muted==='1',blobPromise:null,blobUrl:null,sourceUrl:video.getAttribute('src')}}),entryKey=e=>`${e.tier}:${e.variant}${e.alt?':'+e.alt:''}`,entryMap=new Map(entries.map(e=>[entryKey(e),e])),entryFor=(count,variant,alt='')=>{const tier=tierForCount(count);if(tier===150&&variant===2){const a=alt==='kokain'?'kokain':'02';return entryMap.get(`${tier}:${variant}:${a}`)||entryMap.get(`${tier}:${variant}:02`)}return entryMap.get(`${tier}:${variant}`)||entryMap.get(`${tier}:1`)},criticalKeys=new Set(['50:1','200:1']),keyOf=entryKey;"
s=one(s,old,new,'entries')
s=one(s,"variant:Number(payload?.variant)||0}}","variant:Number(payload?.variant)||0,mediaAlt:String(payload?.mediaAlt||'')}}",'normalize')
s=one(s,"function messageFor({name,count,variant})","function messageFor({name,count,variant,mediaAlt})",'message sig')
s=one(s,"if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：02搖！海豹拍肚 +${pats}！`;","if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：${mediaAlt==='kokain'?'kokain':'02搖'}！海豹拍肚 +${pats}！`;",'message')
s=one(s,"async function playOne(item){const entry=entryFor(item.count,item.variant);","async function playOne(item){const entry=entryFor(item.count,item.variant,item.mediaAlt);",'play')
s=one(s,"item.variant=chooseVariant(item);primeEntry(entryFor(item.count,item.variant));lastEnqueueAt=Date.now();","item.variant=chooseVariant(item);assign150v2(item);primeEntry(entryFor(item.count,item.variant,item.mediaAlt));lastEnqueueAt=Date.now();",'enqueue')
p.write_text(s,encoding='utf-8')

# test playback
p=Path('gift-marquee-obs-test.html'); s=p.read_text(encoding='utf-8')
s=one(s,'<div class="tierMedia" data-tier="150" data-variant="2"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>','<div class="tierMedia" data-tier="150" data-variant="2" data-alt="02"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="kokain"><video src="kokain.mp4?v='+KV+'" playsinline preload="none"></video></div>','test media')
s=one(s,"const nextVariant={50:1,100:1,150:1,200:1};","const nextVariant={50:1,100:1,150:1,200:1};let next150v2='02';",'test state')
s=one(s,"tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),muted:","tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),alt:String(media.dataset.alt||''),muted:",'test alt field')
s=one(s,"const entryMap=new Map(entries.map(e=>[`${e.tier}:${e.variant}`,e]));","const entryKey=e=>`${e.tier}:${e.variant}${e.alt?':'+e.alt:''}`;\n  const entryMap=new Map(entries.map(e=>[entryKey(e),e]));",'test entry key')
s=one(s,"const entryFor=(count,variant)=>entryMap.get(`${tierForCount(count)}:${variant}`)||entryMap.get(`${tierForCount(count)}:1`);","const entryFor=(count,variant,alt='')=>{const tier=tierForCount(count);if(tier===150&&variant===2){const a=alt==='kokain'?'kokain':'02';return entryMap.get(`${tier}:${variant}:${a}`)||entryMap.get(`${tier}:${variant}:02`)}return entryMap.get(`${tier}:${variant}`)||entryMap.get(`${tier}:1`)};",'test entryFor')
s=one(s,"const keyOf=e=>`${e.tier}:${e.variant}`;","const keyOf=entryKey;",'test key')
s=one(s,"variant:Number(p?.variant)||0}}","variant:Number(p?.variant)||0,mediaAlt:String(p?.mediaAlt||'')}}",'test normalize')
s=one(s,"function messageFor({name,count,variant})","function messageFor({name,count,variant,mediaAlt})",'test message sig')
s=one(s,"if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：02搖！海豹拍肚 +${pats}！`;","if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：${mediaAlt==='kokain'?'kokain':'02搖'}！海豹拍肚 +${pats}！`;",'test message')
s=one(s,"function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;return v}","function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;return v}function assign150v2(item){if(tierForCount(item.count)!==150||item.variant!==2)return;if(item.mediaAlt==='02'||item.mediaAlt==='kokain')return;item.mediaAlt=next150v2;next150v2=next150v2==='02'?'kokain':'02'}",'test assign')
s=one(s,"const entry=entryFor(item.count,item.variant);await switchMedia(entry);setLook(item);","const entry=entryFor(item.count,item.variant,item.mediaAlt);await switchMedia(entry);setLook(item);",'test play')
s=one(s,"item.variant=chooseVariant(item);queue.push(item);drain();","item.variant=chooseVariant(item);assign150v2(item);queue.push(item);drain();",'test enqueue')
s=one(s,"function resetVariants(){nextVariant[50]=1;nextVariant[100]=1;nextVariant[150]=1;nextVariant[200]=1;return{...nextVariant}}","function resetVariants(){nextVariant[50]=1;nextVariant[100]=1;nextVariant[150]=1;nextVariant[200]=1;next150v2='02';return{...nextVariant}}",'test reset')
p.write_text(s,encoding='utf-8')

# test controls
p=Path('gift-marquee-test.html'); s=p.read_text(encoding='utf-8')
s=one(s,'<button class="v2" data-count="150" data-variant="2" data-label="02">2 02</button>','<button class="v2" data-count="150" data-variant="2" data-label="02 / kokain">2 02 ↔ kokain</button>','button')
s=s.replace('測試版會一次預載全部 12 支影片。','測試版會預載全部 13 支影片；150-2 會在 02 / kokain 之間輪替。')
s=s.replace('正式使用時紅線以下完全看不到；目前只改測試頁，正式版尚未加入編號 2 / 3。','正式使用時紅線以下完全看不到；正式版與測試版使用相同影片配置。')
p.write_text(s,encoding='utf-8')

# wrapper bump so OBS reloads itself
p=Path('obs-overlay.html'); s=p.read_text(encoding='utf-8')
s=one(s,"const OBS_BUILD='20260908-0812-sheet-variant-force-v23';","const OBS_BUILD='20260908-0942-sheet-kokain-v24';",'wrapper build')
s=one(s,"const CORE_URL='obs-overlay-core-v16.html?v=20260908-0800-love';","const CORE_URL='obs-overlay-core-v16.html?v=20260908-0942-kokain';",'core url')
p.write_text(s,encoding='utf-8')
