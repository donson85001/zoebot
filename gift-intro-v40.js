function drawIntroFrameV40(tier,p,env){
const {ctx,introImages,introClosedImages,introNoise}=env,w=630,h=420,img=introImages[tier],closed=introClosedImages[tier],cl=v=>Math.max(0,Math.min(1,v)),eo=t=>1-Math.pow(1-cl(t),3),sm=t=>{t=cl(t);return t*t*(3-2*t)},rgba=(s,a)=>'rgba('+s+','+a+')';
const glow=(x,y,r,col,a)=>{let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
const draw=(im,x,y,s=1,a=1,r=0)=>{if(!im?.naturalWidth)return;ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(r);ctx.scale(s,s);ctx.drawImage(im,-im.naturalWidth/2,-im.naturalHeight/2);ctx.restore()};
ctx.clearRect(0,0,w,h);ctx.save();
if(tier===50){
 const enter=eo(p/.24),hit=cl((p-.22)/.11),op=sm((p-.43)/.22),fade=1-sm((p-.91)/.09),y=-120+340*enter+Math.sin(hit*Math.PI*5)*(1-hit)*15;
 glow(w/2,220,260,'255,75,185',.20*enter*fade);
 if(p>.22){ctx.strokeStyle=rgba('255,190,230',(.68-hit*.5)*fade);ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(w/2,330,55+hit*210,14+hit*36,0,0,Math.PI*2);ctx.stroke()}
 if(op<.04)draw(closed,w/2+Math.sin(p*145)*6*(1-op),y,.78,fade);
 else{draw(img,w/2,y,.80,op*fade);if(closed?.naturalWidth){ctx.save();ctx.globalAlpha=(1-op)*fade;ctx.translate(w/2,y-22-op*110);ctx.rotate(-op*.48);ctx.scale(.78,Math.max(.12,1-op*.72));ctx.drawImage(closed,0,0,closed.naturalWidth,closed.naturalHeight*.47,-closed.naturalWidth/2,-closed.naturalHeight*.47,closed.naturalWidth,closed.naturalHeight*.47);ctx.restore()}}
 if(op>0){glow(w/2,y,230,'255,235,125',.7*Math.sin(op*Math.PI)*fade);for(let i=0;i<58;i++){let a=introNoise(i+11),b=introNoise(i+91),t=cl((op-a*.34)*1.55),an=a*Math.PI*2,d=35+t*(90+235*b),x=w/2+Math.cos(an)*d,yy=y+10+Math.sin(an)*d*.55-t*65;ctx.fillStyle=rgba(b>.5?'255,225,90':'255,110,220',(1-t)*.85*fade);ctx.beginPath();ctx.arc(x,yy,2+5*(1-t),0,Math.PI*2);ctx.fill()}}
}else if(tier===100){
 const enter=eo(p/.22),charge=cl((p-.24)/.29),op=sm((p-.52)/.20),fade=1-sm((p-.93)/.07),y=520-295*enter;
 glow(w/2,250,350,'160,82,8',.32*enter*fade);
 if(p>.20){let hit=cl((p-.20)/.13);ctx.strokeStyle=rgba('255,185,50',(.8-hit*.64)*fade);ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(w/2,340,60+hit*250,16+hit*38,0,0,Math.PI*2);ctx.stroke()}
 for(let k=0;k<3;k++){let z=cl((charge-k*.25)/.20);if(z>0&&z<1)glow(w/2,y,145+z*140,'255,150,25',.34*Math.sin(z*Math.PI)*fade)}
 if(op<.04)draw(closed,w/2+Math.sin(charge*45)*5*(1-op),y,.80,fade);
 else{draw(img,w/2,y,.82,op*fade);if(closed?.naturalWidth){ctx.save();ctx.globalAlpha=(1-op)*fade;ctx.translate(w/2,y-35-op*92);ctx.rotate(-op*.40);ctx.scale(.80,Math.max(.14,1-op*.66));ctx.drawImage(closed,0,0,closed.naturalWidth,closed.naturalHeight*.47,-closed.naturalWidth/2,-closed.naturalHeight*.47,closed.naturalWidth,closed.naturalHeight*.47);ctx.restore()}}
 if(op>0){glow(w/2,y,285,'255,190,55',.68*Math.sin(op*Math.PI)*fade);for(let i=0;i<78;i++){let a=introNoise(i+150),b=introNoise(i+250),t=cl((op-a*.38)*1.5),x=w/2+(a-.5)*(80+t*500),yy=y+30-t*(85+195*b)+t*t*160,r=2+6*b;ctx.fillStyle=rgba(b>.72?'255,245,190':'255,175,32',(1-t)*.85*fade);ctx.beginPath();ctx.ellipse(x,yy,r,r*.55,Math.PI*t,0,Math.PI*2);ctx.fill()}}
}else if(tier===150){
 const ign=cl((p-.15)/.18),lift=cl((p-.34)/.22),boost=cl((p-.56)/.44),fade=1-sm((p-.96)/.04),y=230-lift*35-boost*545*boost,s=.88+.05*lift;
 let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,rgba('7,10,32',.78));sky.addColorStop(1,rgba('42,20,78',.62));ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 for(let i=0;i<5;i++){let x=65+i*128+Math.sin(i)*22;ctx.fillStyle=rgba('255,245,200',.16+.13*Math.sin(p*18+i));ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+42,335);ctx.lineTo(x-42,335);ctx.fill()}
 ctx.strokeStyle=rgba('110,145,200',.72);ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(w/2,345,150,35,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=rgba('255,190,70',.62);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(w/2,345,110,24,0,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<38;i++){let a=introNoise(i+310),b=introNoise(i+390),life=(p*1.3+a)%1;if(p>.05&&p<.48){ctx.fillStyle=rgba('210,225,238',(1-life)*.27);ctx.beginPath();ctx.arc(w/2+(a-.5)*(120+life*330),330+Math.sin(i+p*35)*12-life*24,8+24*b,0,Math.PI*2);ctx.fill()}}
 if(ign>0){let ny=y+145*s,len=38+125*ign+95*boost;ctx.save();ctx.globalCompositeOperation='lighter';for(let n=-1;n<=1;n++){let nx=w/2+n*32*s,g=ctx.createLinearGradient(nx,ny,nx,ny+len);g.addColorStop(0,'rgba(255,255,255,.99)');g.addColorStop(.22,'rgba(135,220,255,.96)');g.addColorStop(.55,'rgba(255,155,35,.84)');g.addColorStop(1,'rgba(255,48,5,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(nx-10,ny);ctx.bezierCurveTo(nx-18,ny+len*.34,nx-9,ny+len*.7,nx+Math.sin(p*175+n)*11,ny+len);ctx.bezierCurveTo(nx+9,ny+len*.7,nx+18,ny+len*.34,nx+10,ny);ctx.fill()}ctx.restore();for(let i=0;i<54;i++){let a=introNoise(i+510),b=introNoise(i+610),life=(p*2+a)%1,x=w/2+(a-.5)*(90+life*420),yy=Math.min(390,y+155+life*(75+125*b));ctx.fillStyle=rgba('218,223,232',(1-life)*.35*ign);ctx.beginPath();ctx.arc(x,yy,5+23*b,0,Math.PI*2);ctx.fill()}}
 draw(img,w/2,y,s,fade);
}else{
 const enter=sm(p/.30),hold=cl((p-.30)/.46),exit=sm((p-.82)/.18),fade=1-sm((p-.97)/.03);
 let night=ctx.createLinearGradient(0,0,0,h);night.addColorStop(0,rgba('3,8,32',.82));night.addColorStop(.64,rgba('20,35,88',.64));night.addColorStop(1,rgba('4,30,68',.82));ctx.fillStyle=night;ctx.fillRect(0,0,w,h);
 for(let i=0;i<22;i++){let x=i*31+introNoise(i)*18,hh=18+introNoise(i+40)*58;ctx.fillStyle=rgba('7,16,44',.9);ctx.fillRect(x,275-hh,24,hh);ctx.fillStyle=rgba(i%3?'255,195,82':'115,205,255',.25+.30*Math.sin(p*22+i));ctx.fillRect(x+5,282-hh,3,5)}
 for(let j=0;j<7;j++){ctx.strokeStyle=rgba(j%2?'78,175,255':'205,245,255',.18+j*.018);ctx.lineWidth=2+j*.55;ctx.beginPath();for(let xx=-10;xx<w+10;xx+=8){let yy=292+j*19+Math.sin(xx*.028+p*24+j*1.7)*5+Math.sin(xx*.063-p*30)*2;xx<0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy)}ctx.stroke()}
 let x=-280+595*enter+exit*690,y=250+Math.sin(p*17)*3,s=.25+.52*enter-.04*exit,stern=x-290*s,bow=x+320*s,wy=y+120*s;
 if(p>.04){ctx.save();ctx.globalCompositeOperation='lighter';let tr=ctx.createLinearGradient(stern-360,wy,stern+20,wy);tr.addColorStop(0,'rgba(110,205,255,0)');tr.addColorStop(1,rgba('235,255,255',.78*enter));ctx.strokeStyle=tr;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(stern-330,wy+15);ctx.bezierCurveTo(stern-220,wy-10,stern-75,wy+18,stern+15,wy);ctx.stroke();for(let i=0;i<46;i++){let a=introNoise(i+720),life=(p*2.2+a)%1;ctx.fillStyle=rgba('225,252,255',(1-life)*.58*enter);ctx.beginPath();ctx.arc(stern-life*(80+270*a),wy+life*(15+48*a)+Math.sin(i+p*48)*5,2+6*(1-life),0,Math.PI*2);ctx.fill()}for(let i=0;i<30;i++){let a=introNoise(i+810),life=(p*3.2+a)%1;ctx.fillStyle=rgba('240,255,255',(1-life)*.82*enter);ctx.beginPath();ctx.arc(bow+(a-.5)*45+life*40,wy-life*(25+68*a),2+7*(1-life),0,Math.PI*2);ctx.fill()}ctx.restore()}
 if(p>.34&&p<.83){for(let k=0;k<2;k++){let bx=-130+(((p-.34)*1.8+k*.47)%1)*950,g=ctx.createLinearGradient(bx-90,0,bx+120,0);g.addColorStop(0,'rgba(255,230,160,0)');g.addColorStop(.5,'rgba(255,240,190,.15)');g.addColorStop(1,'rgba(255,230,160,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx-45,0);ctx.lineTo(bx+80,0);ctx.lineTo(bx+190,h);ctx.lineTo(bx-170,h);ctx.fill()}}
 for(let i=0;i<15;i++){let rx=x-205*s+i*28*s,rh=12+42*(.5+.5*Math.sin(i*2+p*32));ctx.strokeStyle=rgba(i%3?'70,180,255':'255,190,75',(.07+.15*hold)*fade);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(rx,wy+12);ctx.lineTo(rx+Math.sin(p*28+i)*6,wy+12+rh);ctx.stroke()}
 draw(img,x,y,s,fade);
 if(hold>0)for(let i=0;i<9;i++)glow(x-175*s+i*45*s,y-5+Math.sin(i)*18,18,i%2?'255,190,75':'90,185,255',(.14+.18*Math.sin(p*34+i))*fade);
 if(p>.42&&p<.90)for(let k=0;k<3;k++){let st=.42+k*.10,t=(p-st)/.30;if(t<=0||t>=1)continue;let cx=120+k*195,cy=72+(k%2)*35;if(t<.30){let r=t/.30,ry=320-(320-cy)*eo(r);ctx.strokeStyle=rgba('255,205,100',.85-r*.25);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,ry+35);ctx.lineTo(cx,ry);ctx.stroke()}else{let b=(t-.30)/.70,rr=eo(b)*65,fa=1-b,col=k===1?'255,205,90':'105,210,255';ctx.save();ctx.globalCompositeOperation='lighter';for(let z=0;z<24;z++){let an=z*Math.PI/12+k*.27,fall=b*b*34;ctx.strokeStyle=rgba(col,fa*.85);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+Math.cos(an)*rr*.45,cy+Math.sin(an)*rr*.45+fall);ctx.lineTo(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr+fall);ctx.stroke()}ctx.restore();glow(cx,cy,120,col,.16*fa)}}
}
ctx.restore();
}
