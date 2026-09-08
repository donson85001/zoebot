from pathlib import Path

obs_path=Path('gift-marquee-obs-test.html')
ctl_path=Path('gift-marquee-test.html')
obs=obs_path.read_text(encoding='utf-8')
ctl=ctl_path.read_text(encoding='utf-8')

old_media='''  <div class="tierMedia" data-tier="50" data-variant="2"><video src="Conan-520.mp4?v=32ffb0869107" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="4"><video src="0725.mp4?v=d56744c846f1" playsinline preload="none"></video></div>'''
new_media='''  <div class="tierMedia" data-tier="50" data-variant="2"><video src="Conan-520.mp4?v=32ffb0869107" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="3"><video src="sir.mp4?v=15117f1e278b" playsinline preload="none"></video></div>\n  <div class="tierMedia" data-tier="50" data-variant="4"><video src="0725.mp4?v=d56744c846f1" playsinline preload="none"></video></div>'''
assert old_media in obs, '50 media block not found'
obs=obs.replace(old_media,new_media,1)

old_v3='''    if(variant===3){\n      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;\n      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;\n    }'''
new_v3='''    if(variant===3){\n      if(tier===50)return`感謝 ${name} 的 ${count}份贈訂！發瘋喇！完全惡意剪輯！海豹拍肚 +${pats}！`;\n      if(tier===100)return`${name}同學被肉乙甩棒 ${count}次！發瘋啦！嚴厲斥責！海豹拍肚 +${pats}！`;\n      if(tier===150)return`${name} 聽不懂肉乙講話 ${count}次！MD欠扁484啊！海豹拍肚 +${pats}！`;\n    }'''
assert old_v3 in obs, 'variant 3 message block not found'
obs=obs.replace(old_v3,new_v3,1)

old_order="const variantOrder={50:[1,2,4],100:[1,2,3,4],150:[1,2,3,4],200:[1,2,4]};"
new_order="const variantOrder={50:[1,2,3,4],100:[1,2,3,4],150:[1,2,3,4],200:[1,2,4]};"
assert old_order in obs, 'variant order not found'
obs=obs.replace(old_order,new_order,1)

old_btn='<button disabled data-label="空">3 空</button>'
new_btn='<button class="v3" data-count="50" data-variant="3" data-label="sir">3 sir</button>'
assert old_btn in ctl, 'empty 50-3 button not found'
ctl=ctl.replace(old_btn,new_btn,1)

old_preview='測試版目前共 14 支影片；50-3、200-3 為空格，自動測試會跳過空格。'
new_preview='測試版目前共 15 支影片；200-3 為空格，自動測試會跳過空格。'
assert old_preview in ctl, 'preview text not found'
ctl=ctl.replace(old_preview,new_preview,1)

obs_path.write_text(obs,encoding='utf-8')
ctl_path.write_text(ctl,encoding='utf-8')
