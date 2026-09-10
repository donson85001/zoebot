(()=>{
const sources={50:'gift-sfx-50-v2.ogg?v=20260910-1',100:'gift-sfx-100-v2.ogg?v=20260910-1',150:'gift-sfx-150-v2.ogg?v=20260910-1',200:'gift-sfx-200-v2.ogg?v=20260910-1'};
const pools={};
Object.entries(sources).forEach(([tier,src])=>{const a=new Audio(src);a.preload='auto';a.volume=.64;a.load();pools[tier]=a});
window.playGiftIntroSfx=tier=>{const base=pools[tier];if(!base)return;const a=base.paused&&base.currentTime===0?base:base.cloneNode(true);a.volume=.64;try{a.currentTime=0}catch(_){}const result=a.play();if(result?.catch)result.catch(()=>{})};
})();
