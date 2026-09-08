from pathlib import Path

SHA='d56744c846f1'

def one(s,a,b,label):
    n=s.count(a)
    if n!=1:
        raise SystemExit(f'{label}: expected 1 match, got {n}')
    return s.replace(a,b,1)

# Test playback page only
p=Path('gift-marquee-obs-test.html')
s=p.read_text(encoding='utf-8')
s=one(s,
'''  <div class="tierMedia" data-tier="50" data-variant="3"><video src="shark-520.mp4?v=1ec76444f5b3" playsinline preload="none"></video></div>''',
'''  <div class="tierMedia" data-tier="50" data-variant="3"><video src="shark-520.mp4?v=1ec76444f5b3" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="4"><video src="0725.mp4?v='''+SHA+'''" playsinline preload="none"></video></div>''',
'50-4 media')
s=one(s,
'''  setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===3)),2400);''',
'''  setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===3)),2400);\n  setTimeout(()=>preloadEntries(entries.filter(e=>e.variant===4)),3200);''',
'variant4 preload')
s=one(s,
'''    if(variant===2){''',
'''    if(variant===4&&tier===50)return`感謝 ${name} 的 ${count}份贈訂！才藝表演跳舞：Trouble Maker - '내일은 없어 (Now)'！海豹拍肚 +${pats}！`;\n    if(variant===2){''',
'variant4 text')
s=one(s,
'''  function chooseVariant(item){if(item.variant>=1&&item.variant<=3)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;return v}function assign150v2(item){''',
'''  function chooseVariant(item){if(item.variant>=1&&item.variant<=4)return item.variant;const tier=tierForCount(item.count),v=nextVariant[tier];nextVariant[tier]=v>=3?1:v+1;return v}function assign150v2(item){''',
'allow explicit variant4')
p.write_text(s,encoding='utf-8')

# Test controller only
p=Path('gift-marquee-test.html')
s=p.read_text(encoding='utf-8')
s=one(s,
'''.tier{margin-top:13px;padding:12px;border:1px solid #3a4050;border-radius:12px;background:#191d26}.tier-title{font-weight:900;margin-bottom:8px}.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}''',
'''.tier{margin-top:13px;padding:12px;border:1px solid #3a4050;border-radius:12px;background:#191d26}.tier-title{font-weight:900;margin-bottom:8px}.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.buttons.five{grid-template-columns:repeat(5,1fr)}''',
'five button css')
s=s.replace('<h1>跑馬燈 1 / 2 / 3 測試</h1>','<h1>跑馬燈測試</h1>')
s=one(s,
'''    <div class="note">每個訂閱檔位都有自己獨立的 1 → 2 → 3 順序。按「自動下一個」就是模擬真正贈訂；同一檔位第一次播 1、第二次播 2、第三次播 3、第四次回 1。編號 2 / 3 使用新 520 影片並保留音訊。</div>''',
'''    <div class="note">每個訂閱檔位目前自動仍依 1 → 2 → 3 輪替；50 檔另外加入可手動測試的第 4 格 Now。</div>''',
'note')
s=one(s,
'''      <div class="buttons">\n        <button data-count="50" data-variant="1" data-label="海豹拍">1 海豹拍</button>\n        <button class="v2" data-count="50" data-variant="2" data-label="Conan">2 Conan</button>\n        <button class="v3" data-count="50" data-variant="3" data-label="shark">3 shark</button>\n        <button class="auto" data-count="50" data-label="自動下一個">自動下一個</button>''',
'''      <div class="buttons five">\n        <button data-count="50" data-variant="1" data-label="海豹拍">1 海豹拍</button>\n        <button class="v2" data-count="50" data-variant="2" data-label="Conan">2 Conan</button>\n        <button class="v3" data-count="50" data-variant="3" data-label="shark">3 shark</button>\n        <button data-count="50" data-variant="4" data-label="Now">4 Now</button>\n        <button class="auto" data-count="50" data-label="自動下一個">自動下一個</button>''',
'50 controls')
s=s.replace('測試版會預載全部 13 支影片；150-2 會在 02 / kokain 之間輪替。','測試版會預載全部 14 支影片；50-4 是 0725 / Now，150-2 會在 02 / kokain 之間輪替。')
p.write_text(s,encoding='utf-8')
