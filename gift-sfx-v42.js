(()=>{
const sources={50:'gift-sfx-50-v2.ogg?v=20260910-1',100:'gift-sfx-100-v2.ogg?v=20260910-1',150:'gift-sfx-150-v2.ogg?v=20260910-1',200:'gift-sfx-200-v2.ogg?v=20260910-1'};
const players={};
Object.entries(sources).forEach(([tier,src])=>{const a=new Audio();a.src=src;a.preload='auto';a.volume=.64;a.muted=false;a.load();players[tier]=a});
window.playGiftIntroSfx=async tier=>{const a=players[tier];if(!a)return false;try{a.pause();a.muted=false;a.volume=.64;a.currentTime=0;if(a.readyState<2)a.load();await a.play();return true}catch(e){console.warn('gift-sfx-retry',tier,e?.name||e);try{await new Promise(r=>{const done=()=>{a.removeEventListener('canplay',done);r()};a.addEventListener('canplay',done,{once:true});a.load();setTimeout(done,800)});a.muted=false;a.volume=.64;a.currentTime=0;await a.play();return true}catch(e2){console.error('gift-sfx-failed',tier,e2);return false}}};
window.unlockGiftAudio=()=>Promise.allSettled(Object.values(players).map(a=>{a.pause();a.muted=false;a.volume=.001;a.currentTime=0;const p=a.play();return Promise.resolve(p).then(()=>new Promise(r=>setTimeout(r,45))).then(()=>{a.pause();a.currentTime=0;a.volume=.64})}));
window.addEventListener('pageshow',()=>Object.values(players).forEach(a=>{a.preload='auto';a.load()}));
})();
