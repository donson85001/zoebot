/* Zoebot full-screen gift cinematics v52 — deterministic canvas animation. */
function drawPremiumFireworks(ctx,p,noise,range,out,glow,rgba){
  const shows=[
    {s:.31,x:105,y:92,r:104,c:'255,188,65',kind:0},
    {s:.40,x:315,y:52,r:132,c:'255,232,150',kind:1},
    {s:.51,x:520,y:96,r:108,c:'103,201,255',kind:0},
    {s:.61,x:202,y:122,r:82,c:'255,112,185',kind:2},
    {s:.69,x:430,y:132,r:76,c:'255,202,82',kind:2}
  ];
  ctx.save();ctx.globalCompositeOperation='lighter';
  shows.forEach((f,k)=>{
    const t=range(f.s,f.s+.34);if(t<=0||t>=1)return;
    if(t<.23){const u=t/.23,ry=330-(330-f.y)*out(u),bend=Math.sin(u*Math.PI)*(k%2?-13:13);ctx.strokeStyle=rgba('255,215,125',.95-u*.28);ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(f.x,334);ctx.bezierCurveTo(f.x+bend*.2,260,f.x+bend,ry+52,f.x,ry);ctx.stroke();for(let d=0;d<6;d++){const yy=ry+8+d*7,aa=(1-d/6)*(.7-u*.25);ctx.fillStyle=rgba('255,236,180',aa);ctx.beginPath();ctx.arc(f.x+bend*(1-d/7)*.25,yy,1.2+d*.12,0,Math.PI*2);ctx.fill()}glow(f.x,ry,21,'255,247,218',.72)}
    else{
      const u=(t-.23)/.77,grow=out(Math.min(1,u*1.65)),alpha=Math.pow(1-u,1.12),fall=u*u*(f.kind===1?62:42),count=f.kind===1?74:58;
      glow(f.x,f.y,44+f.r*grow,f.c,.16*alpha);glow(f.x,f.y,20+35*grow,'255,250,225',.20*alpha);
      for(let z=0;z<count;z++){const jitter=(noise(z+k*91,1130)-.5)*.085,an=z*Math.PI*2/count+jitter+k*.19,variance=.68+.38*noise(z+k*57,1200),rr=f.r*grow*variance,gravity=fall*(.65+.55*noise(z,1260)),curl=(noise(z,1320)-.5)*u*u*34,ex=f.x+Math.cos(an)*rr+curl,ey=f.y+Math.sin(an)*rr+gravity,trail=.40+.18*noise(z,1370),ix=f.x+Math.cos(an)*rr*trail+curl*.25,iy=f.y+Math.sin(an)*rr*trail+gravity*.22;ctx.strokeStyle=rgba(f.c,alpha*(.56+.38*noise(z,1420)));ctx.lineWidth=.8+2.4*(1-u)*noise(z,1480);ctx.beginPath();ctx.moveTo(ix,iy);ctx.bezierCurveTo(f.x+Math.cos(an)*rr*.66,f.y+Math.sin(an)*rr*.60+gravity*.42,f.x+Math.cos(an)*rr*.86+curl*.7,f.y+Math.sin(an)*rr*.82+gravity*.72,ex,ey);ctx.stroke();for(let d=0;d<3;d++){const q=1-d*.095,dx=f.x+Math.cos(an)*rr*q+curl*q,dy=f.y+Math.sin(an)*rr*q+gravity*q*q;ctx.fillStyle=rgba(d?f.c:'255,250,220',alpha*(.82-d*.18));ctx.beginPath();ctx.arc(dx,dy,1.0+1.5*(1-u)-d*.18,0,Math.PI*2);ctx.fill()}if(u>.38&&z%5===0){for(let q=0;q<4;q++){const sa=an+q*Math.PI*.5+noise(q+z,1530)*.5,sr=(u-.38)*(14+22*noise(q+z,1580));ctx.fillStyle=rgba('255,244,205',alpha*.54);ctx.beginPath();ctx.arc(ex+Math.cos(sa)*sr,ey+Math.sin(sa)*sr,1.1,0,Math.PI*2);ctx.fill()}}}
      if(f.kind===1&&u>.24){for(let z=0;z<34;z++){const an=z*Math.PI*2/34+.12,rr=f.r*grow*(.48+.12*noise(z,1640)),drop=fall*1.42,ex=f.x+Math.cos(an)*rr,ey=f.y+Math.sin(an)*rr+drop;ctx.strokeStyle=rgba('255,199,70',alpha*.62);ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(f.x+Math.cos(an)*rr*.45,f.y+Math.sin(an)*rr*.42+drop*.15);ctx.quadraticCurveTo(ex,ey-drop*.22,ex,ey);ctx.stroke()}}
    }
  });
  ctx.restore();
}
function drawIntroFrameV52(tier,p,env){
  const {ctx,introImages,introClosedImages,introNoise}=env,W=630,H=420,img=introImages[tier],closed=introClosedImages[tier];
  const clamp=v=>Math.max(0,Math.min(1,v)),range=(a,b)=>clamp((p-a)/(b-a)),smooth=t=>{t=clamp(t);return t*t*(3-2*t)},out=t=>1-Math.pow(1-clamp(t),3),back=t=>{t=clamp(t);const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},fade=1;
  const rgba=(c,a)=>`rgba(${c},${clamp(a)})`,noise=(i,o=0)=>introNoise(i+o),draw=(im,x,y,s=1,a=1,r=0)=>{if(!im?.naturalWidth)return;ctx.save();ctx.globalAlpha=clamp(a);ctx.translate(x,y);ctx.rotate(r);ctx.scale(s,s);ctx.drawImage(im,-im.naturalWidth/2,-im.naturalHeight/2);ctx.restore()};
  const glow=(x,y,r,c,a)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(.28,rgba(c,a*.42));g.addColorStop(1,rgba(c,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
  const vignette=(a=.54)=>{const g=ctx.createRadialGradient(W/2,H/2,90,W/2,H/2,410);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)};
  const streaks=(amount,c,alpha,speed=1)=>{ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<amount;i++){const a=noise(i,900),b=noise(i,940),p0=(p*speed+a)%1,x=b*W,y=(a*H+p0*160)%H,l=16+60*b;ctx.strokeStyle=rgba(c,(1-p0)*alpha);ctx.lineWidth=.6+2*b;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(b-.5)*12,y+l);ctx.stroke()}ctx.restore()};
  ctx.clearRect(0,0,W,H);ctx.save();ctx.globalAlpha=fade;

  if(tier===50){
    const land=out(range(0,.20)),shake=range(.20,.31),open=smooth(range(.34,.52)),celebrate=range(.47,.88),x=W/2+Math.sin(p*154)*9*(1-shake)*Math.sin(shake*Math.PI),y=-150+365*land+Math.sin(land*Math.PI)*12,s=.80;
    let bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'rgba(24,5,34,.91)');bg.addColorStop(.50,'rgba(113,16,72,.86)');bg.addColorStop(1,'rgba(35,4,52,.94)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<9;i++){const xx=45+i*72,beam=ctx.createLinearGradient(xx,0,xx+90,H);beam.addColorStop(0,rgba(i%2?'255,82,184':'255,210,110',.12));beam.addColorStop(1,'rgba(255,80,180,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(xx-18,0);ctx.lineTo(xx+22,0);ctx.lineTo(xx+120,H);ctx.lineTo(xx-95,H);ctx.fill()}
    glow(W/2,215,270,'255,70,176',.32*land);if(shake<1&&p>.20){ctx.strokeStyle=rgba('255,210,235',.72*(1-shake));ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(W/2,329,62+shake*260,12+shake*42,0,0,Math.PI*2);ctx.stroke()}
    if(open<.03)draw(closed,x,y,s,1);else{draw(img,W/2,y,s,open);if(closed?.naturalWidth){ctx.save();ctx.globalAlpha=1-open;ctx.translate(W/2,y-40-open*116);ctx.rotate(-open*.62);ctx.scale(s,Math.max(.08,1-open*.75));ctx.drawImage(closed,0,0,closed.naturalWidth,closed.naturalHeight*.45,-closed.naturalWidth/2,-closed.naturalHeight*.45,closed.naturalWidth,closed.naturalHeight*.45);ctx.restore()}}
    if(open>0){glow(W/2,y-8,300,'255,230,118',.78*Math.sin(open*Math.PI));ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<110;i++){const a=noise(i,10),b=noise(i,80),delay=a*.30,t=clamp((celebrate-delay)/(1-delay)),ang=a*Math.PI*2,dist=28+t*(95+300*b),px=W/2+Math.cos(ang)*dist,py=y-15+Math.sin(ang)*dist*.52-t*(65+100*b);ctx.fillStyle=rgba(i%4?'255,206,85':'255,89,197',(1-t)*(.45+.55*b));ctx.save();ctx.translate(px,py);ctx.rotate(ang+t*5);if(i%5===0)ctx.fillRect(-1,-8,2,16);else{ctx.beginPath();ctx.arc(0,0,1.5+4*b,0,Math.PI*2);ctx.fill()}ctx.restore()}ctx.restore()}
    streaks(32,'255,122,210',.22,1.3);vignette(.42);
  }else if(tier===100){
    const rise=back(range(0,.24)),unlock=smooth(range(.25,.39)),open=smooth(range(.40,.60)),rain=range(.52,.91),y=525-300*rise,s=.84;
    let bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'rgba(12,7,25,.96)');bg.addColorStop(.55,'rgba(75,32,12,.91)');bg.addColorStop(1,'rgba(18,8,3,.97)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<7;i++){const bx=20+i*102,g=ctx.createLinearGradient(bx,0,bx+70,H);g.addColorStop(0,rgba('255,186,55',.04+.08*rise));g.addColorStop(.55,rgba('255,158,25',.15*rise));g.addColorStop(1,'rgba(255,140,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx,0);ctx.lineTo(bx+24,0);ctx.lineTo(bx+155,H);ctx.lineTo(bx-90,H);ctx.fill()}
    glow(W/2,247,330,'255,142,22',.38*rise);ctx.strokeStyle=rgba('255,190,65',.28+.45*(1-unlock));ctx.lineWidth=3+5*(1-unlock);ctx.beginPath();ctx.ellipse(W/2,344,95+unlock*190,20+unlock*38,0,0,Math.PI*2);ctx.stroke();
    if(open<.02)draw(closed,W/2+Math.sin(unlock*80)*7*(1-unlock),y,s);else{draw(img,W/2,y,s,open);if(closed?.naturalWidth){ctx.save();ctx.globalAlpha=1-open;ctx.translate(W/2,y-42-open*102);ctx.rotate(-open*.50);ctx.scale(s,Math.max(.1,1-open*.72));ctx.drawImage(closed,0,0,closed.naturalWidth,closed.naturalHeight*.47,-closed.naturalWidth/2,-closed.naturalHeight*.47,closed.naturalWidth,closed.naturalHeight*.47);ctx.restore()}}
    if(unlock>0)for(let k=0;k<4;k++){const z=range(.25+k*.035,.43+k*.035);if(z<1)glow(W/2,y+2,90+z*230,'255,184,55',.40*Math.sin(z*Math.PI))}
    if(open>0){glow(W/2,y-20,340,'255,201,78',.82*Math.sin(open*Math.PI));ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<135;i++){const a=noise(i,170),b=noise(i,250),delay=a*.25,t=clamp((rain-delay)/(1-delay)),px=W/2+(a-.5)*(90+t*590),arc=t*(110+210*b),py=y-35-arc+t*t*(170+250*b);ctx.fillStyle=rgba(i%6?'255,174,28':'255,250,190',(1-t)*(.5+.5*b));ctx.save();ctx.translate(px,py);ctx.rotate(t*10+a*6);ctx.fillRect(-2-b*3,-1,4+b*6,2);ctx.restore()}ctx.restore()}
    streaks(26,'255,190,55',.20,1.1);vignette(.48);
  }else if(tier===150){
    const reveal=smooth(range(0,.16)),ignite=smooth(range(.17,.34)),lift=smooth(range(.38,.62)),boost=smooth(range(.61,.96)),y=236-lift*55-boost*510*boost,s=.98;
    let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'rgba(2,5,18,.98)');sky.addColorStop(.58,'rgba(16,20,42,.96)');sky.addColorStop(1,'rgba(20,12,25,.98)');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){const a=noise(i,320),b=noise(i,390);ctx.fillStyle=rgba('215,235,255',(.12+.48*b)*reveal);ctx.fillRect(a*W,b*235,1+b*1.4,1+b*1.4)}
    for(let i=0;i<5;i++){const bx=78+i*122,g=ctx.createLinearGradient(bx,0,bx,H);g.addColorStop(0,'rgba(255,245,205,0)');g.addColorStop(.62,rgba(i%2?'255,180,72':'130,190,255',.15*reveal));g.addColorStop(1,'rgba(255,215,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx-12,0);ctx.lineTo(bx+12,0);ctx.lineTo(bx+74,H);ctx.lineTo(bx-74,H);ctx.fill()}
    ctx.strokeStyle=rgba('90,125,165',.75*reveal);ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(W/2,350,165,37,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=rgba('255,185,68',.68*reveal);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(W/2,350,112,24,0,0,Math.PI*2);ctx.stroke();
    if(ignite>0){const nozzle=y+157*s,len=52+ignite*118+boost*155,f=.92+.08*Math.sin(p*205);ctx.save();ctx.globalCompositeOperation='lighter';glow(W/2,nozzle+38,125,'255,99,22',.42*ignite);for(let n=-1;n<=1;n++){const nx=W/2+n*34*s,wide=12+10*ignite,g=ctx.createLinearGradient(nx,nozzle,nx,nozzle+len*f);g.addColorStop(0,'rgba(255,255,255,.99)');g.addColorStop(.18,'rgba(255,246,178,.98)');g.addColorStop(.48,'rgba(255,116,22,.88)');g.addColorStop(1,'rgba(255,46,5,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(nx-8,nozzle);ctx.bezierCurveTo(nx-wide,nozzle+len*.30,nx-wide*.65,nozzle+len*.68,nx+Math.sin(p*241+n)*8,nozzle+len*f);ctx.bezierCurveTo(nx+wide*.65,nozzle+len*.68,nx+wide,nozzle+len*.30,nx+8,nozzle);ctx.closePath();ctx.fill()}ctx.restore();for(let i=0;i<95;i++){const a=noise(i,470),b=noise(i,540),life=(p*2.3+a)%1,spread=60+life*(180+220*b),px=W/2+(a-.5)*spread,py=Math.min(435,nozzle+len*.58+life*(65+135*b)),r=5+25*b+life*13;ctx.fillStyle=rgba(`${180+Math.floor(45*b)},${184+Math.floor(40*b)},${190+Math.floor(38*b)}`,(1-life)*.30*ignite);ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill()}}
    draw(img,W/2,y,s,1);if(ignite>.1){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<42;i++){const a=noise(i,630),life=(p*3+a)%1,px=W/2+(a-.5)*(45+life*190),py=y+150+life*(70+80*a);ctx.fillStyle=rgba(a>.55?'255,214,92':'255,105,25',(1-life)*.74*ignite);ctx.beginPath();ctx.arc(px,py,1+3*a,0,Math.PI*2);ctx.fill()}ctx.restore()}vignette(.48);
  }else{
    const enter=smooth(range(0,.27)),hold=range(.28,.78),exit=smooth(range(.82,1)),x=-380+695*enter+760*exit,y=252+Math.sin(p*18)*3,s=.72,stern=x-285*s,bow=x+322*s,wy=y+119*s;
    let night=ctx.createLinearGradient(0,0,0,H);night.addColorStop(0,'rgba(1,4,18,.98)');night.addColorStop(.58,'rgba(12,24,62,.96)');night.addColorStop(1,'rgba(1,26,55,.98)');ctx.fillStyle=night;ctx.fillRect(0,0,W,H);
    for(let i=0;i<28;i++){const xx=i*25,hh=18+noise(i,700)*77;ctx.fillStyle=rgba('3,10,29',.98);ctx.fillRect(xx,276-hh,19,hh);for(let q=0;q<3;q++){const on=noise(i*5+q,760)>.38;ctx.fillStyle=rgba(on?(q%2?'255,202,92':'98,196,255'):'20,31,52',on?.48:.18);ctx.fillRect(xx+4+q*5,284-hh,2,4)}}
    const sea=ctx.createLinearGradient(0,270,0,H);sea.addColorStop(0,'rgba(12,75,120,.18)');sea.addColorStop(1,'rgba(0,14,42,.96)');ctx.fillStyle=sea;ctx.fillRect(0,270,W,150);for(let j=0;j<9;j++){ctx.strokeStyle=rgba(j%2?'75,165,230':'200,240,255',.10+j*.018);ctx.lineWidth=1+j*.42;ctx.beginPath();for(let xx=-10;xx<=W+10;xx+=7){const yy=288+j*15+Math.sin(xx*.031+p*27+j)*4+Math.sin(xx*.072-p*34)*2;xx<0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy)}ctx.stroke()}
    if(enter>0){ctx.save();ctx.globalCompositeOperation='lighter';const wake=ctx.createLinearGradient(stern-360,wy,stern+20,wy);wake.addColorStop(0,'rgba(170,230,255,0)');wake.addColorStop(1,rgba('240,255,255',.86*enter));ctx.strokeStyle=wake;ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(stern-350,wy+14);ctx.bezierCurveTo(stern-220,wy-14,stern-90,wy+21,stern+14,wy);ctx.stroke();for(let i=0;i<70;i++){const a=noise(i,820),life=(p*2.5+a)%1;ctx.fillStyle=rgba('225,250,255',(1-life)*.62*enter);ctx.beginPath();ctx.arc(stern-life*(90+310*a),wy+life*(12+55*a)+Math.sin(i+p*55)*5,2+7*(1-life),0,Math.PI*2);ctx.fill()}ctx.restore()}
    if(hold>0&&p<.84)for(let k=0;k<3;k++){const bx=-120+(((p-.30)*1.35+k*.43)%1)*900,g=ctx.createLinearGradient(bx-80,0,bx+120,0);g.addColorStop(0,'rgba(255,230,155,0)');g.addColorStop(.5,'rgba(255,238,180,.18)');g.addColorStop(1,'rgba(255,230,155,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx-35,0);ctx.lineTo(bx+75,0);ctx.lineTo(bx+190,H);ctx.lineTo(bx-170,H);ctx.fill()}
    draw(img,x,y,s,1);if(hold>0)for(let i=0;i<10;i++)glow(x-190*s+i*43*s,y-2+Math.sin(i)*15,17,i%2?'255,191,76':'78,178,255',.15+.17*Math.sin(p*38+i));
    drawPremiumFireworks(ctx,p,noise,range,out,glow,rgba);vignette(.38);
  }
  ctx.restore();
}
