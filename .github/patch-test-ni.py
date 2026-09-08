from pathlib import Path

obs=Path('gift-marquee-obs-test.html')
s=obs.read_text(encoding='utf-8')
old='''  <div class="tierMedia" data-tier="200" data-variant="1"><video src="lemon.mp4?v=fb61ff496cff" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="2"><video src="up-520.mp4?v=a6da404f2f61" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="4"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>'''
new='''  <div class="tierMedia" data-tier="200" data-variant="1"><video src="lemon.mp4?v=fb61ff496cff" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="2"><video src="up-520.mp4?v=a6da404f2f61" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="3"><video src="ni.mp4?v=c6b4e1d69667" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="200" data-variant="4"><video src="kokain.mp4?v=307b80fe072f" playsinline preload="none"></video></div>'''
assert old in s
s=s.replace(old,new,1)
old='''    if(variant===3){\n      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！發瘋喇！完全惡意剪輯！海豹拍肚 +${pats}！`;\n      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;\n      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;\n    }'''
new='''    if(variant===3){\n      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！發瘋喇！完全惡意剪輯！海豹拍肚 +${pats}！`;\n      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;\n      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;\n      if(tier===200)return`感謝 ${name} 的 ${count}份贈訂！才藝表演唱歌：關於cmonBruh的歌！海豹拍肚 +${pats}！`;\n    }'''
assert old in s
s=s.replace(old,new,1)
old='const variantOrder={50:[1,2,3,4],100:[1,2,3,4],150:[1,2,3,4],200:[1,2,4]};'
new='const variantOrder={50:[1,2,3,4],100:[1,2,3,4],150:[1,2,3,4],200:[1,2,3,4]};'
assert old in s
s=s.replace(old,new,1)
obs.write_text(s,encoding='utf-8')

ctrl=Path('gift-marquee-test.html')
s=ctrl.read_text(encoding='utf-8')
old='.tier{margin-top:13px;padding:12px;border:1px solid #3a4050;border-radius:12px;background:#191d26}.tier-title{font-weight:900;margin-bottom:8px}.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.buttons.five{grid-template-columns:repeat(5,1fr)}'
new='.tier{margin-top:13px;padding:12px;border:1px solid #3a4050;border-radius:12px;background:#191d26}.tier-title{font-weight:900;margin-bottom:8px}.buttons{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.buttons.five{grid-template-columns:repeat(5,minmax(0,1fr))}'
assert old in s
s=s.replace(old,new,1)
old='button{min-height:42px;border:0;border-radius:9px;background:#ef629a;color:#fff;font-weight:800;cursor:pointer;padding:6px 7px;line-height:1.2}'
new='button{height:48px;min-height:48px;border:0;border-radius:9px;background:#ef629a;color:#fff;font-weight:800;cursor:pointer;padding:5px 6px;line-height:1.1;overflow:hidden}'
assert old in s
s=s.replace(old,new,1)
s=s.replace('目前測試版已排成四格；標示「空」的格子沒有影片，自動測試會跳過空格。','目前測試版四個檔位皆為 1→2→3→4；所有按鈕已統一尺寸。',1)
old='''        <button disabled data-label="空">3 空</button>\n        <button data-count="200" data-variant="4" data-label="kokain">4 kokain</button>'''
new='''        <button class="v3" data-count="200" data-variant="3" data-label="cmonBruh">3 cmonBruh</button>\n        <button data-count="200" data-variant="4" data-label="kokain">4 kokain</button>'''
assert old in s
s=s.replace(old,new,1)
s=s.replace('測試版目前共 15 支影片；200-3 為空格，自動測試會跳過空格。','測試版目前共 16 支影片；四個檔位皆完整 1→2→3→4。',1)
ctrl.write_text(s,encoding='utf-8')
