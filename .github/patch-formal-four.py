from pathlib import Path

core_path=Path('obs-overlay-core-v16.html')
wrap_path=Path('obs-overlay.html')
core=core_path.read_text(encoding='utf-8')
wrap=wrap_path.read_text(encoding='utf-8')

old_media='''  <div class="tierMedia" data-tier="50" data-variant="1"><video src="seal.mp4?v=fa7babdabdcd" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="2"><video src="Conan-520.mp4?v=32ffb0869107" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="3"><video src="shark-520.mp4?v=1ec76444f5b3" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="1"><video src="boy.mp4?v=2b043d08d737" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="2"><video src="SLAM-DUNK-520.mp4?v=9b1ab08a5c23" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="3"><video src="baseball-520.mp4?v=833e68c70c39" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="1"><video src="0859457.mp4?v=1d53ab12fe18" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="02"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="kokain"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="3"><video src="facechange-520.mp4?v=c741fa297cc7" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="1"><video src="lemon.mp4?v=fb61ff496cff" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="2"><video src="up-520.mp4?v=a6da404f2f61" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="3"><video src="love.mp4?v=2522c09e7b36" playsinline preload="none"></video></div>'''
new_media='''  <div class="tierMedia" data-tier="50" data-variant="1"><video src="seal.mp4?v=fa7babdabdcd" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="2"><video src="Conan-520.mp4?v=32ffb0869107" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="3"><video src="sir.mp4?v=15117f1e278b" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="4"><video src="0725.mp4?v=d56744c846f1" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="1"><video src="boy.mp4?v=2b043d08d737" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="2"><video src="SLAM-DUNK-520.mp4?v=9b1ab08a5c23" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="3"><video src="baseball-520.mp4?v=833e68c70c39" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="4"><video src="love.mp4?v=2522c09e7b36" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="1"><video src="0859457.mp4?v=1d53ab12fe18" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2"><video src="02-520.mp4?v=93fcd7ca1b74" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="3"><video src="facechange-520.mp4?v=c741fa297cc7" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="4"><video src="shark-520.mp4?v=97371d9062d6" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="1"><video src="lemon.mp4?v=3fde48d7f5a7" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="2"><video src="up-520.mp4?v=a6da404f2f61" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="3"><video src="ni.mp4?v=c6b4e1d69667" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="4"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>'''
assert old_media in core, 'formal media block not found'
core=core.replace(old_media,new_media,1)

old_state="const OBS_BUILD='20260908-0942-production-kokain-v24',UPDATE_CHECK_MS=10000,MIN_GIFT=50,IDLE_GRACE_MS=1100,VARIANT_STATE_KEY='zoebot-marquee-next-variant-v2',ALT150_STATE_KEY='zoebot-marquee-150v2-next-v1';"
new_state="const OBS_BUILD='20260909-0415-production-four-v25',UPDATE_CHECK_MS=10000,MIN_GIFT=50,IDLE_GRACE_MS=1100,VARIANT_STATE_KEY='zoebot-marquee-next-variant-v2';"
assert old_state in core
core=core.replace(old_state,new_state,1)

old_variant="const nextVariant={50:1,100:1,150:1,200:1};try{const saved=JSON.parse(localStorage.getItem(VARIANT_STATE_KEY)||'{}');[50,100,150,200].forEach(t=>{const v=Number(saved?.[t]);if(v>=1&&v<=3)nextVariant[t]=v})}catch(_){}function saveVariantState(){try{localStorage.setItem(VARIANT_STATE_KEY,JSON.stringify(nextVariant))}catch(_){}}let next150v2='kokain';try{const a=localStorage.getItem(ALT150_STATE_KEY);if(a==='02'||a==='kokain')next150v2=a}catch(_){}function save150v2State(){try{localStorage.setItem(ALT150_STATE_KEY,next150v2)}catch(_){}}const tierForCount=count=>count>=200?200:count>=150?150:count>=100?100:50;function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;saveVariantState();return v}function assign150v2(item){if(tierForCount(item.count)!==150||item.variant!==2)return;if(item.mediaAlt==='02'||item.mediaAlt==='kokain')return;item.mediaAlt=next150v2;next150v2=next150v2==='02'?'kokain':'02';save150v2State()}"
new_variant="const nextVariant={50:1,100:1,150:1,200:1};try{const saved=JSON.parse(localStorage.getItem(VARIANT_STATE_KEY)||'{}');[50,100,150,200].forEach(t=>{const v=Number(saved?.[t]);if(v>=1&&v<=4)nextVariant[t]=v})}catch(_){}function saveVariantState(){try{localStorage.setItem(VARIANT_STATE_KEY,JSON.stringify(nextVariant))}catch(_){}}const tierForCount=count=>count>=200?200:count>=150?150:count>=100?100:50;function chooseVariant(item){if(item.variant>=1&&item.variant<=4)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=4?1:v+1;saveVariantState();return v}"
assert old_variant in core, 'variant state block not found'
core=core.replace(old_variant,new_variant,1)

old_entries="const entries=[...document.querySelectorAll('.tierMedia')].map(media=>{const video=media.querySelector('video');video.loop=false;video.volume=1;return{media,video,tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),alt:String(media.dataset.alt||''),muted:media.dataset.muted==='1',blobPromise:null,blobUrl:null,sourceUrl:video.getAttribute('src')}}),entryKey=e=>`${e.tier}:${e.variant}${e.alt?':'+e.alt:''}`,entryMap=new Map(entries.map(e=>[entryKey(e),e])),entryFor=(count,variant,alt='')=>{const tier=tierForCount(count);if(tier===150&&variant===2){const a=alt==='kokain'?'kokain':'02';return entryMap.get(`${tier}:${variant}:${a}`)||entryMap.get(`${tier}:${variant}:02`)}return entryMap.get(`${tier}:${variant}`)||entryMap.get(`${tier}:1`)},criticalKeys=new Set(['50:1','200:1']),keyOf=entryKey;"
new_entries="const entries=[...document.querySelectorAll('.tierMedia')].map(media=>{const video=media.querySelector('video');video.loop=false;video.volume=1;return{media,video,tier:Number(media.dataset.tier),variant:Number(media.dataset.variant),alt:'',muted:media.dataset.muted==='1',blobPromise:null,blobUrl:null,sourceUrl:video.getAttribute('src')}}),entryKey=e=>`${e.tier}:${e.variant}`,entryMap=new Map(entries.map(e=>[entryKey(e),e])),entryFor=(count,variant)=>{const tier=tierForCount(count);return entryMap.get(`${tier}:${variant}`)||entryMap.get(`${tier}:1`)},criticalKeys=new Set(['50:1','200:1']),keyOf=entryKey;"
assert old_entries in core, 'entries block not found'
core=core.replace(old_entries,new_entries,1)

old_pre="const celEntry=entryMap.get('200:1'),waterEntry=entryMap.get('50:1');if(celEntry)ensureCriticalBlob(celEntry);if(waterEntry)setTimeout(()=>ensureCriticalBlob(waterEntry),250);setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===1&&!criticalKeys.has(keyOf(e)))),700);setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===2)),1400);setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===3)),2400);"
new_pre=old_pre+"setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===4)),3200);"
assert old_pre in core
core=core.replace(old_pre,new_pre,1)

start=core.index('function messageFor(')
end=core.index('function setLook(',start)
new_message="""function messageFor({name,count,variant}){const pats=Math.floor(count/5),tier=tierForCount(count);if(variant===4){if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：Trouble Maker - '내일은 없어 (Now)'！海豹拍肚 +${pats}！`;if(tier===100)return`肉乙好想知道${name}的${count}份會給怎樣的人！從不養戀愛粉恩罵~!海豹拍肚 +${pats}！`;if(tier===150)return`${name} 逼肉乙去鏟 ${count}包薯條！我鏟不鏟薯條到底關你屁事啊！海豹拍肚 +${pats}！`;return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：kokain！海豹拍肚 +${pats}！`}if(variant===2){if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：名偵探柯南！海豹拍肚 +${pats}！`;if(tier===100)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：灌籃高手！海豹拍肚 +${pats}！`;if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：02搖！海豹拍肚 +${pats}！`;return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：UP！跟著一起跳起來！海豹拍肚 +${pats}！`}if(variant===3){if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！發瘋喇！完全惡意剪輯！海豹拍肚 +${pats}！`;if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;return`感謝 ${name} 的 ${count}份贈訂！才藝表演唱歌：關於cmonBruh的歌！海豹拍肚 +${pats}！`}if(count>=200)return`肉乙把 ${name} 丟地板了 ${count}次！我就把你布置好的東西全部弄掉！海豹拍肚 +${pats}！`;if(count>=150)return`肉乙從不畏懼 ${name} 的 ${count}訂閱！狗叫什麼啊破皮的屁孩！海豹拍肚 +${pats}！`;if(count>=100)return`肉乙跟 ${name} 一起泡泡浴了 ${count}次！果然只有男人最懂男人！海豹拍肚 +${pats}！`;return`感謝 ${name} 的 ${count}份贈訂！才藝表演：海豹拍！海豹拍肚 +${pats}！`}"""
core=core[:start]+new_message+core[end:]
core=core.replace('assign150v2(item);','').replace('assign150v2(item)','')
assert 'assign150v2' not in core
assert 'ALT150_STATE_KEY' not in core

# wrapper: support 4 variants and force a new build/cache key
wrap=wrap.replace("const OBS_BUILD='20260908-0942-sheet-kokain-v24';","const OBS_BUILD='20260909-0415-sheet-four-v25';",1)
wrap=wrap.replace("const CORE_URL='obs-overlay-core-v16.html?v=20260908-0942-kokain';","const CORE_URL='obs-overlay-core-v16.html?v=20260909-0415-four';",1)
wrap=wrap.replace('const previousVariant=n=>n===1?3:n-1;','const previousVariant=n=>n===1?4:n-1;',1)
wrap=wrap.replace('next>=1&&next<=3','next>=1&&next<=4')
wrap=wrap.replace('n>=1&&n<=3','n>=1&&n<=4')
wrap=wrap.replace('current[t]>=1&&current[t]<=3','current[t]>=1&&current[t]<=4')

# safety assertions
for tier in (50,100,150,200):
    for v in (1,2,3,4):
        assert f'data-tier="{tier}" data-variant="{v}"' in core, (tier,v)
assert 'ni.mp4?v=c6b4e1d69667' in core
assert 'sir.mp4?v=15117f1e278b' in core
assert '0725.mp4?v=d56744c846f1' in core
assert 'love.mp4?v=2522c09e7b36' in core
assert 'kokain.mp4?v=307b80fe072f' in core
assert '關於cmonBruh的歌' in core
assert "Trouble Maker - '내일은 없어 (Now)'" in core
assert 'v>=1&&v<=4' in core and 'v>=4?1:v+1' in core
assert 'next>=1&&next<=4' in wrap and 'n===1?4:n-1' in wrap

core_path.write_text(core,encoding='utf-8')
wrap_path.write_text(wrap,encoding='utf-8')
