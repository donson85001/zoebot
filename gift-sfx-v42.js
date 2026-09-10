(()=>{
let ac=null;
const A=()=>{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume().catch(()=>{});return ac};
function tone(c,t,f,d,v=.12,type='sine',f2=f){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.03)}
function noise(c,t,d,v=.08,low=12000,high=80){const n=Math.ceil(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='bandpass';f.frequency.setValueAtTime(low,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,high),t+d);f.Q.value=.55;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f).connect(g).connect(c.destination);s.start(t);s.stop(t+d+.03)}
function boom(c,t,v=.16){tone(c,t,105,.48,v,'sine',35);noise(c,t,.34,v*.75,380,70)}
function chime(c,t,root=880,v=.07){[1,1.25,1.5,2].forEach((m,i)=>tone(c,t+i*.045,root*m,.62-i*.05,v/(1+i*.13),'sine',root*m*.82))}
function coin(c,t,i=0){tone(c,t,1350+i*95,.10,.038,'triangle',2050+i*120)}
window.playGiftIntroSfx=function(tier){
 const c=A(),t=c.currentTime+.045;
 if(tier===50){boom(c,t+.52,.075);noise(c,t+.98,.17,.055,4500,900);chime(c,t+1.08,930,.055);for(let i=0;i<7;i++)tone(c,t+1.18+i*.065,1500+i*105,.12,.025,'triangle',2300+i*90)}
 else if(tier===100){boom(c,t+.72,.15);tone(c,t+1.05,210,.10,.07,'square',155);tone(c,t+1.34,240,.10,.07,'square',175);tone(c,t+1.63,285,.13,.075,'square',190);boom(c,t+1.82,.13);chime(c,t+1.92,620,.055);for(let i=0;i<18;i++)coin(c,t+2.0+i*.065,i%6)}
 else if(tier===150){noise(c,t+.30,.52,.06,1100,110);tone(c,t+.62,62,1.30,.11,'sawtooth',42);noise(c,t+.65,1.45,.105,900,100);boom(c,t+.70,.13);tone(c,t+1.38,78,2.35,.10,'sawtooth',155);noise(c,t+1.45,2.25,.095,550,6000);tone(c,t+2.55,340,1.35,.045,'sine',1350)}
 else if(tier===200){noise(c,t,.95,.035,700,180);tone(c,t+.52,82,.90,.10,'sine',61);tone(c,t+.56,123,.82,.05,'sine',92);for(let k=0;k<3;k++){const ft=t+2.35+k*.55;tone(c,ft,330+k*35,.33,.035,'sine',900+k*130);boom(c,ft+.32,.12);noise(c,ft+.32,.65,.07,5200,280);chime(c,ft+.36,740+k*90,.032)}noise(c,t+4.60,.70,.028,550,160)}
};
})();
