(()=>{
const stamp='20260910-1';
const images=['gift-motion-50.webp','gift-motion-50-closed.webp','gift-motion-100.webp','gift-motion-100-closed.webp','gift-rocket-body-v4.webp','gift-yacht-body-v3.webp'];
const audio=['gift-sfx-50-v2.ogg','gift-sfx-100-v2.ogg','gift-sfx-150-v2.ogg','gift-sfx-200-v2.ogg'];
const imageWarm=Promise.all(images.map(async src=>{try{const r=await fetch(src+'?v='+stamp,{cache:'force-cache'}),b=await r.blob(),bm=await createImageBitmap(b);return bm}catch(_){return null}}));
const audioWarm=Promise.all(audio.map(src=>new Promise(resolve=>{const a=new Audio();let done=false;const finish=()=>{if(done)return;done=true;try{a.pause();a.currentTime=0}catch(_){}resolve()};a.preload='auto';a.muted=true;a.src=src+'?v='+stamp;a.addEventListener('canplaythrough',async()=>{try{await a.play()}catch(_){}setTimeout(finish,40)},{once:true});a.addEventListener('error',finish,{once:true});a.load();setTimeout(finish,5000)})));
imageWarm.then(bitmaps=>{try{const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(630,420):document.createElement('canvas');canvas.width=630;canvas.height=420;const c=canvas.getContext('2d',{alpha:true});for(let frame=0;frame<5;frame++){c.clearRect(0,0,630,420);const g=c.createRadialGradient(315,210,8,315,210,330);g.addColorStop(0,'rgba(255,205,90,.35)');g.addColorStop(1,'rgba(20,60,180,0)');c.fillStyle=g;c.fillRect(0,0,630,420);for(let i=0;i<180;i++){c.beginPath();c.arc((i*47+frame*31)%630,(i*83+frame*19)%420,1+(i%6),0,Math.PI*2);c.fill()}for(const bm of bitmaps)if(bm)c.drawImage(bm,0,0,Math.min(420,bm.width),Math.min(260,bm.height))}c.clearRect(0,0,630,420);bitmaps.forEach(b=>b&&b.close&&b.close())}catch(_){}}); 
window.__zoeFormalPreload=Promise.allSettled([imageWarm,audioWarm]);
})();
