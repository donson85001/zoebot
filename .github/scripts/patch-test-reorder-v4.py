from pathlib import Path


def must_replace(s, old, new, label):
    n=s.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 match, got {n}')
    return s.replace(old, new, 1)

# Playback test page only
p=Path('gift-marquee-obs-test.html')
s=p.read_text(encoding='utf-8')

# media moves
s=must_replace(s,
'  <div class="tierMedia" data-tier="50" data-variant="3"><video src="shark-520.mp4?v=1ec76444f5b3" playsinline preload="none"></video></div>\n',
'', 'remove 50-3 shark')

s=must_replace(s,
'  <div class="tierMedia" data-tier="100" data-variant="3"><video src="baseball-520.mp4?v=833e68c70c39" playsinline preload="none"></video></div>\n',
'  <div class="tierMedia" data-tier="100" data-variant="3"><video src="baseball-520.mp4?v=833e68c70c39" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="100" data-variant="4"><video src="love.mp4?v=2522c09e7b36" playsinline preload="none"></video></div>\n', 'add 100-4 love')

s=must_replace(s,
'  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="02"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="2" data-alt="kokain"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="3"><video src="facechange-520.mp4?v=c741fa297cc7" playsinline preload="none"></video></div>\n',
'  <div class="tierMedia" data-tier="150" data-variant="2"><video src="02-520.mp4?v=35cd2feddb1a" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="3"><video src="facechange-520.mp4?v=c741fa297cc7" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="150" data-variant="4"><video src="shark-520.mp4?v=1ec76444f5b3" playsinline preload="none"></video></div>\n', 'move shark to 150-4 and keep 02')

s=must_replace(s,
'  <div class="tierMedia" data-tier="200" data-variant="3"><video src="love.mp4?v=2522c09e7b36" playsinline preload="none"></video></div>\n',
'  <div class="tierMedia" data-tier="200" data-variant="4"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>\n', 'move kokain to 200-4 remove love')

# remove old 150-2 alternation state and make normal entry lookup
s=must_replace(s,
"  const nextVariant={50:1,100:1,150:1,200:1};let next150v2='02';",
"  const nextVariant={50:1,100:1,150:1,200:1};",
'next state')
s=must_replace(s,
"  const entryFor=(count,variant,alt='')=>{const tier=tierForCount(count);if(tier===150&&variant===2){const a=alt==='kokain'?'kokain':'02';return entryMap.get(`${tier}:${variant}:${a}`)||entryMap.get(`${tier}:${variant}:02`)}return entryMap.get(`${tier}:${variant}`)||entryMap.get(`${tier}:1`)};",
"  const entryFor=(count,variant)=>entryMap.get(`${tierForCount(count)}:${variant}`)||null;",
'entryFor')

# moved texts
old_msg="""    if(variant===4&&tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：Trouble Maker - '내일은 없어 (Now)'！海豹拍肚 +${pats}！`;
    if(variant===2){
      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：名偵探柯南！海豹拍肚 +${pats}！`;
      if(tier===100)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：灌籃高手！海豹拍肚 +${pats}！`;
      if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：${mediaAlt==='kokain'?'kokain':'02搖'}！海豹拍肚 +${pats}！`;
      return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：UP！跟著一起跳起來！海豹拍肚 +${pats}！`;
    }
    if(variant===3){
      if(tier===50)return`${name} 逼肉乙去鏟 ${count}包薯條！我鏟不鏟薯條到底關你屁事啊！海豹拍肚 +${pats}！`;
      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;
      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;
      return`肉乙好想知道${name}的${count}份會給怎樣的人！從不養戀愛粉恩罵~!海豹拍肚 +${pats}！`;
    }
"""
new_msg="""    if(variant===4){
      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：Trouble Maker - '내일은 없어 (Now)'！海豹拍肚 +${pats}！`;
      if(tier===100)return`肉乙好想知道${name}的${count}份會給怎樣的人！從不養戀愛粉恩罵~!海豹拍肚 +${pats}！`;
      if(tier===150)return`${name} 逼肉乙去鏟 ${count}包薯條！我鏟不鏟薯條到底關你屁事啊！海豹拍肚 +${pats}！`;
      return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：kokain！海豹拍肚 +${pats}！`;
    }
    if(variant===2){
      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：名偵探柯南！海豹拍肚 +${pats}！`;
      if(tier===100)return`感謝 ${name} 的 ${count}份贈訂！才藝表演卡祖笛：灌籃高手！海豹拍肚 +${pats}！`;
      if(tier===150)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：02搖！海豹拍肚 +${pats}！`;
      return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：UP！跟著一起跳起來！海豹拍肚 +${pats}！`;
    }
    if(variant===3){
      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;
      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;
    }
"""
s=must_replace(s, old_msg, new_msg, 'messages')

# auto test sequence skips empty slots and includes slot 4
old_choose="  function chooseVariant(item){if(item.variant>=1&&item.variant<=4)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;return v}function assign150v2(item){if(tierForCount(item.count)!==150||item.variant!==2)return;if(item.mediaAlt==='02'||item.mediaAlt==='kokain')return;item.mediaAlt=next150v2;next150v2=next150v2==='02'?'kokain':'02'}"
new_choose="  const variantOrder={50:[1,2,4],100:[1,2,3,4],150:[1,2,3,4],200:[1,2,4]};function chooseVariant(item){if(item.variant>=1&&item.variant<=4)return item.variant;const tier=tierForCount(item.count),order=variantOrder[tier],v=nextVariant[tier],i=Math.max(0,order.indexOf(v));nextVariant[tier]=order[(i+1)%order.length];return v}"
s=must_replace(s, old_choose, new_choose, 'choose variant')

s=must_replace(s,
"    const entry=entryFor(item.count,item.variant,item.mediaAlt);await switchMedia(entry);setLook(item);",
"    const entry=entryFor(item.count,item.variant);if(!entry)return;await switchMedia(entry);setLook(item);",
'play entry')
s=must_replace(s,
"  function enqueue(payload){const item=normalize(payload);if(item.count<MIN_GIFT)return{accepted:false,reason:'below-threshold'};item.variant=chooseVariant(item);assign150v2(item);queue.push(item);drain();return{accepted:true,tier:tierForCount(item.count),variant:item.variant}}",
"  function enqueue(payload){const item=normalize(payload);if(item.count<MIN_GIFT)return{accepted:false,reason:'below-threshold'};item.variant=chooseVariant(item);if(!entryFor(item.count,item.variant))return{accepted:false,reason:'empty-slot'};queue.push(item);drain();return{accepted:true,tier:tierForCount(item.count),variant:item.variant}}",
'enqueue')
s=must_replace(s,
"  function resetVariants(){nextVariant[50]=1;nextVariant[100]=1;nextVariant[150]=1;nextVariant[200]=1;next150v2='02';return{...nextVariant}}",
"  function resetVariants(){nextVariant[50]=1;nextVariant[100]=1;nextVariant[150]=1;nextVariant[200]=1;return{...nextVariant}}",
'reset')

p.write_text(s,encoding='utf-8')

# Controller page only
p=Path('gift-marquee-test.html')
s=p.read_text(encoding='utf-8')
s=s.replace('<div class="note">每個訂閱檔位目前自動仍依 1 → 2 → 3 輪替；50 檔另外加入可手動測試的第 4 格 Now。</div>', '<div class="note">目前測試版已排成四格；標示「空」的格子沒有影片，自動測試會跳過空格。</div>')

s=must_replace(s,
'''        <button data-count="50" data-variant="1" data-label="海豹拍">1 海豹拍</button>
        <button class="v2" data-count="50" data-variant="2" data-label="Conan">2 Conan</button>
        <button class="v3" data-count="50" data-variant="3" data-label="shark">3 shark</button>
        <button data-count="50" data-variant="4" data-label="Now">4 Now</button>
        <button class="auto" data-count="50" data-label="自動下一個">自動下一個</button>''',
'''        <button data-count="50" data-variant="1" data-label="海豹拍">1 海豹拍</button>
        <button class="v2" data-count="50" data-variant="2" data-label="Conan">2 Conan</button>
        <button disabled data-label="空">3 空</button>
        <button data-count="50" data-variant="4" data-label="Now">4 Now</button>
        <button class="auto" data-count="50" data-label="自動下一個">自動下一個</button>''','50 buttons')

s=must_replace(s,
'''        <button data-count="100" data-variant="1" data-label="boy">1 boy</button>
        <button class="v2" data-count="100" data-variant="2" data-label="SLAM-DUNK">2 SLAM</button>
        <button class="v3" data-count="100" data-variant="3" data-label="baseball">3 baseball</button>
        <button class="auto" data-count="100" data-label="自動下一個">自動下一個</button>''',
'''        <button data-count="100" data-variant="1" data-label="boy">1 boy</button>
        <button class="v2" data-count="100" data-variant="2" data-label="SLAM-DUNK">2 SLAM</button>
        <button class="v3" data-count="100" data-variant="3" data-label="baseball">3 baseball</button>
        <button data-count="100" data-variant="4" data-label="戀愛粉">4 戀愛粉</button>
        <button class="auto" data-count="100" data-label="自動下一個">自動下一個</button>''','100 buttons')

s=must_replace(s,
'''        <button data-count="150" data-variant="1" data-label="0859457">1 調皮</button>
        <button class="v2" data-count="150" data-variant="2" data-label="02 / kokain">2 02 ↔ kokain</button>
        <button class="v3" data-count="150" data-variant="3" data-label="facechange">3 facechange</button>
        <button class="auto" data-count="150" data-label="自動下一個">自動下一個</button>''',
'''        <button data-count="150" data-variant="1" data-label="0859457">1 調皮</button>
        <button class="v2" data-count="150" data-variant="2" data-label="02">2 02</button>
        <button class="v3" data-count="150" data-variant="3" data-label="facechange">3 facechange</button>
        <button data-count="150" data-variant="4" data-label="shark">4 shark</button>
        <button class="auto" data-count="150" data-label="自動下一個">自動下一個</button>''','150 buttons')

s=must_replace(s,
'''        <button data-count="200" data-variant="1" data-label="lemon">1 lemon</button>
        <button class="v2" data-count="200" data-variant="2" data-label="up">2 up</button>
        <button class="v3" data-count="200" data-variant="3" data-label="戀愛粉">3 戀愛粉</button>
        <button class="auto" data-count="200" data-label="自動下一個">自動下一個</button>''',
'''        <button data-count="200" data-variant="1" data-label="lemon">1 lemon</button>
        <button class="v2" data-count="200" data-variant="2" data-label="up">2 up</button>
        <button disabled data-label="空">3 空</button>
        <button data-count="200" data-variant="4" data-label="kokain">4 kokain</button>
        <button class="auto" data-count="200" data-label="自動下一個">自動下一個</button>''','200 buttons')

s=s.replace('測試版會預載全部 14 支影片；50-4 是 0725 / Now，150-2 會在 02 / kokain 之間輪替。','測試版目前共 14 支影片；50-3、200-3 為空格，自動測試會跳過空格。')
s=s.replace('正式使用時紅線以下完全看不到；正式版與測試版使用相同影片配置。','正式使用時紅線以下完全看不到；目前這次只改測試版，正式版尚未套用這批搬位。')
s=s.replace("`已送出：${count} 訂閱 / 自動下一個（此檔位依 1 → 2 → 3 輪替）`","`已送出：${count} 訂閱 / 自動下一個（會依目前有影片的格子輪替）`")
p.write_text(s,encoding='utf-8')
