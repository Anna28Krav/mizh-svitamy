(function(root){
'use strict';
let frame=0,windowOpen=false,autoPaperView=false;
function setWindow(open,automatic=false){windowOpen=!!open;autoPaperView=automatic&&windowOpen;const holder=document.getElementById('liveDrink');if(holder)holder.dataset.windowOpen=String(windowOpen);}
const isWindowOpen=()=>windowOpen;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const milkId=r=>r.milk.startsWith('milk-')?r.milk:'milk-'+r.milk;
// Read the actual recipe components: pearls are already included in its price and stock usage.
function pearlIngredients(p,ingredients){
 return Object.entries(p.stockComponents||{}).filter(([id,amount])=>(id==='black-tapioca'||id.startsWith('boba-'))&&Number(amount)>0).map(([id,amount])=>{
  const item=ingredients.find(i=>i.id===id),fallback=id==='black-tapioca'?'#53373a':'#ecb663';
  return {id,amount:Number(amount),name:item?.name||(id==='black-tapioca'?'Чорна тапіока':'Джус-боли'),color:/^#[a-f0-9]{6}$/i.test(item?.color||'')?item.color:fallback,tapioca:id==='black-tapioca'};
 });
}
function createPlan(p,r,ingredients,effect='',focusId){
 p=CoffeeRecipe.effectiveProduct(p,r);
 const get=id=>ingredients.find(i=>i.id===id),milk=r.milk==='none'?null:get(milkId(r));
 const baseColor=({matcha:'#647d45',cocoa:'#765047',tea:'#a7774f',lemonade:'#e1c291'})[p.base]||'#634231';
 const baseName=({matcha:'Матча',cocoa:'Какао',tea:'Чай',lemonade:'Вода'})[p.base]||'Еспресо';
 const syrups=r.syrups.map((s,i)=>({key:'syrup-'+i,id:s.id,type:'syrup',name:get(s.id)?.name||s.id,color:get(s.id)?.color||'#b18b64',volume:s.dose}));
 const baseVolume=({matcha:35,cocoa:25,tea:80,lemonade:0})[p.base]??50;
 const iceVolume=CoffeeRecipe.hasIce(r)?Math.round(Number(r.size)*.28):0;
 const filler=Math.max(milk?20:0,Number(r.size)-iceVolume-syrups.reduce((sum,s)=>sum+s.volume,0)-baseVolume);
 const layers=[...syrups,{key:'milk',id:milk?.id||'water',type:'milk',name:milk?.name||'Вода',color:milk?.color||'#c3dce3',volume:filler},{key:'base',id:p.base||'espresso',type:'base',name:baseName,color:baseColor,volume:baseVolume}].filter(l=>l.volume>0);
 const pearls=pearlIngredients(p,ingredients);
 const tasks=[];let cursor=0;
 const add=(type,name,duration,layer)=>{tasks.push({type,name,duration,start:cursor,layer});cursor+=duration;};
 if(effect==='all'){
  if(pearls.length)add('pearls','Додаємо: '+pearls.map(p=>p.name).join(' + '),1300);
  if(CoffeeRecipe.hasIce(r))add('ice','Додаємо лід',850);
  for(const layer of layers.filter(l=>l.type==='syrup'))add('syrup','Наливаємо: '+layer.name+' · '+layer.volume+' мл',1750,layer);
  for(const layer of layers.filter(l=>l.type!=='syrup'))add(layer.type,'Наливаємо: '+layer.name,1900,layer);
  if(r.extras.length)add('extras','Додаємо обрані акценти',650);
 }else if(effect==='syrup'){
  const layer=syrups.find(l=>l.id===focusId)||syrups[syrups.length-1];
  if(layer)add('syrup','Наливаємо: '+layer.name+' · '+layer.volume+' мл',1750,layer);
 }else if(effect==='milk'){
  const layer=layers.find(l=>l.key==='milk');if(layer)add('milk','Наливаємо: '+layer.name,1900,layer);
 }else if(effect==='ice'&&CoffeeRecipe.hasIce(r))add('ice','Додаємо лід',850);
 if(effect==='mix'||effect==='all'&&r.mixed)add('mix','М’яко поєднуємо смаки',2200);
 return {layers,tasks,pearls,duration:cursor,milk,baseColor,baseName,iced:CoffeeRecipe.hasIce(r),full:effect==='all'};
}
// Keep the original vessels and coffee-machine nozzle; move only the two pourers.
function pourPose(type,t){
 t=clamp(t);const opacity=ease(t/.12)*(1-ease((t-.88)/.12)),flow=t>=.27&&t<=.76;
 if(type==='base')return {x:0,y:0,angle:0,lip:{x:232,y:86},opacity,flow};
 const tilt=ease((t-.04)/.21)*(1-ease((t-.79)/.18)),syrup=type==='syrup';
 const angle=syrup?-10-105*tilt:60*tilt,x=(syrup?347:150)+(1-ease(t/.2))*(syrup?25:-25),y=syrup?110:50;
 const local=syrup?{x:0,y:-45}:{x:46,y:-25},rad=angle*Math.PI/180;
 return {x,y,angle,lip:{x:x+local.x*Math.cos(rad)-local.y*Math.sin(rad),y:y+local.x*Math.sin(rad)+local.y*Math.cos(rad)},flow,opacity};
}
function gradientStops(syrups,get){
 const colors=syrups.slice().reverse().map(s=>get(s.id)?.color||'#c3a777');if(!colors.length)colors.push('#c3a777');if(colors.length===1)colors.push(colors[0]);
 return colors.map((color,i)=>'<stop offset="'+i/(colors.length-1)+'" stop-color="'+color+'"/>').join('');
}
function blend(a,b,t){const parse=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const x=parse(a),y=parse(b);return '#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('');}
function draw(p,r,ingredients,effect='',focusId){
 cancelAnimationFrame(frame);frame=0;const holder=document.getElementById('liveDrink');if(!holder)return;
 const plan=createPlan(p,r,ingredients,effect,focusId),get=id=>ingredients.find(i=>i.id===id);
 p=CoffeeRecipe.effectiveProduct(p,r);
 const syrups=r.syrups||[],syrupColor=get(syrups[0]?.id)?.color||'#c3a777',syrup2=get(syrups[syrups.length-1]?.id)?.color||syrupColor;
 const milk=r.milk==='none'?null:get(r.milk.startsWith('milk-')?r.milk:'milk-'+r.milk),milkColor=milk?.color||'#d1e2e0';
 const cold=r.temp==='iced',iced=CoffeeRecipe.hasIce(r),hasSyrup=syrups.length>0,cream=r.extras.includes('cream'),cinnamon=r.extras.includes('cinnamon'),choco=r.extras.includes('chocolate');
 const syrupHeight=hasSyrup?Math.min(240,Math.max(22,syrups.reduce((s,x)=>s+x.dose,0)/Number(r.size)*300)):0;
 const bottom=505,syrupTop=bottom-syrupHeight,milkTop=iced?263:236,coffeeTop=188,baseColor=p.base==='matcha'?'#647d45':p.base==='cocoa'?'#765047':p.base==='tea'?'#a7774f':p.base==='lemonade'?'#e1c291':'#634231';
 const label=p.base==='matcha'?'Матча':p.base==='cocoa'?'Какао':p.base==='tea'?'Чай':p.base==='lemonade'?'Вода':'Еспресо';
 const ice=iced?[[200,287,-12],[286,323,18],[219,405,12],[294,447,-14],[276,239,-9]].map(([x,y,angle],i)=>`<g data-ice="${i}" class="ice-cube cube-${i}" style="--fall-delay:${i*.12}s;--land-y:${y}px"><g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-26" y="-25" width="52" height="50" rx="8" fill="url(#ice-shine)" stroke="#ffffff9a" stroke-width="1.5"/><path d="M-19 16V-15Q-19-19-13-19H16M-10 13 15-12" stroke="#ffffff65" fill="none" stroke-width="2"/></g></g>`).join(''):'';
 const pearlCount=plan.pearls.length?Math.max(18,Math.min(36,Math.round(plan.pearls.reduce((n,p)=>n+p.amount,0)*.75))):0;
 const pearlDefs=plan.pearls.map((b,i)=>`<radialGradient id="pearl-shine-${i}" cx=".3" cy=".24" r=".8"><stop stop-color="${blend(b.color,'#fff9ed',b.tapioca?.24:.57)}"/><stop offset=".42" stop-color="${b.color}"/><stop offset="1" stop-color="${blend(b.color,'#241926',b.tapioca?.48:.22)}"/></radialGradient>`).join('');
 const pearlArt=pearlCount?`<g class="boba-pearls">${Array.from({length:pearlCount},(_,i)=>{const b=plan.pearls[i%plan.pearls.length],row=Math.floor(i/9),col=i%9,x=185+col*18.5+(row%2?7:0),y=500-row*17+(col%3-1)*2;return `<g data-pearl="${i}" data-pearl-x="${x}" data-pearl-y="${y}" data-pearl-ingredient="${safe(b.id)}"><ellipse cx="${x}" cy="${y+6}" rx="8" ry="3" fill="#251a28" opacity=".2"/><circle cx="${x}" cy="${y}" r="${b.tapioca?8.5:9}" fill="url(#pearl-shine-${i%plan.pearls.length})" fill-opacity="${b.tapioca?1:.9}" stroke="${blend(b.color,'#2d2030',.28)}" stroke-width=".7"/><ellipse cx="${x-2.5}" cy="${y-3}" rx="2.6" ry="1.6" fill="#fff8ea" opacity="${b.tapioca?.3:.7}"/></g>`;}).join('')}</g>`:'';
 const cup=CoffeeRecipe.normalizeCup(r.cup),mug=cup.mode==='mug'||cup.mode==='own'&&!cold,shell=cup.mode!=='glass';
 const cupPath=mug?'M138 154Q260 181 382 154L379 440Q377 524 260 526Q143 524 141 440Z':'M138 154Q260 181 382 154L353 505Q260 553 167 505Z';
 const clipPath=mug?'M143 159Q260 184 377 159L374 437Q371 518 260 520Q149 518 146 437Z':'M143 159Q260 184 377 159L349 503Q260 546 171 503Z';
 const sprinkles=(cinnamon||choco)?Array.from({length:30},(_,i)=>`<${choco&&i%2?'rect':'circle'} ${choco&&i%2?`x="${177+(i*29)%160}" y="${(cream?129:182)+(i*13)%(cream?34:16)}" width="4.5" height="3.2" rx="1"`:`cx="${177+(i*29)%160}" cy="${(cream?129:182)+(i*13)%(cream?34:16)}" r="${choco?2.5:1.5}"`} fill="${choco&&(!cinnamon||i%2)?'#4d302b':'#aa7549'}"/>`).join(''):'';
 const ink=cup.color==='#35303f'?'#f5eadd':'#57415c',eyeIris=CoffeeRecipe.eyeColors.find(c=>c.id===r.eyeColor)?.color||CoffeeRecipe.eyeColors[0].color;
 const eyeArtwork=r.extras.includes('jelly-eye')?`<g class="jelly-eye"><ellipse cx="282" cy="144" rx="24" ry="7" fill="#5a384b" opacity=".22"/><circle cx="281" cy="119" r="26" fill="url(#eye-sclera)" stroke="#ddd3bf" stroke-width="1.3"/><path d="m260 109 6 4-1 5m36 8-6-4 1-5M269 139l3-6-4-3" stroke="#bc7e8b" stroke-opacity=".38" stroke-width="1.1" fill="none"/><circle cx="281" cy="117" r="14" fill="${eyeIris}" stroke="${blend(eyeIris,'#332636',.35)}" stroke-width="1.8"/><circle cx="281" cy="117" r="10" fill="none" stroke="#f8efc9" stroke-opacity=".35" stroke-width="1.2"/><circle cx="281" cy="117" r="6" fill="#2a222d"/><ellipse cx="286" cy="111" rx="4" ry="3" fill="#fff" opacity=".92"/><ellipse cx="272" cy="103" rx="7" ry="3" fill="#fff" opacity=".65"/></g>`:'';
 const cupDecor=cup.mode==='own'?'':cup.mode==='paper'?`<g class="takeaway-brand" color="${ink}"><g transform="translate(260 264) scale(.57)">${CoffeeRecipe.cupEmblem('orbit')}</g><text x="260" y="331" text-anchor="middle" fill="${ink}" font-size="43" font-family="CosmicSignature,Georgia">Між</text><text x="260" y="372" text-anchor="middle" fill="${ink}" font-size="42" font-family="CosmicSignature,Georgia">світами</text><path d="M218 392Q260 402 302 392" stroke="${ink}" stroke-opacity=".4" fill="none" stroke-width="1"/><text x="260" y="435" text-anchor="middle" fill="${ink}" font-size="${cup.text.length>18?9:12}" font-family="CosmicText,Arial" ${cup.text.length>18?'textLength="176" lengthAdjust="spacingAndGlyphs"':''}>${safe(cup.text)}</text></g>`:`<g class="vessel-emblem" color="${ink}" transform="translate(260 373) scale(1.05)">${CoffeeRecipe.cupEmblem(cup.pattern)}</g>`;
 const takeawayStraw=cup.mode==='paper'&&cup.straw?'<g class="takeaway-straw"><path d="M317 36 291 400" stroke="#e8d8be" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M317 36 291 400" stroke="#b78f9d" stroke-width="10" stroke-dasharray="7 14" fill="none"/><ellipse cx="317" cy="36" rx="5" ry="2" fill="#9a7d79"/></g>':'';
 const takeawayLid=cup.mode==='paper'&&cup.lid?(cream?'<g class="takeaway-lid dome-lid"><path d="M140 149Q148 61 260 61Q372 61 380 149L377 164H143Z" fill="#e8f4f7" fill-opacity=".12" stroke="#f1e7eb" stroke-opacity=".75" stroke-width="2"/><ellipse cx="260" cy="155" rx="124" ry="25" fill="#f1ebdf" fill-opacity=".19" stroke="#f1e7eb" stroke-width="2.5"/><path d="M174 126Q187 83 229 79" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none"/></g>':'<g class="takeaway-lid flat-lid"><path d="M142 143 150 129Q260 103 370 129L378 143 386 150 382 164Q260 191 138 164L134 150Z" fill="#e5ded2" stroke="#a796a6" stroke-width="1.4"/><ellipse cx="260" cy="139" rx="112" ry="21" fill="#eee7db" stroke="#fff3" stroke-width="2"/><path d="M178 141Q188 128 205 132L216 140Q200 148 178 141Z" fill="#695568"/><path d="M148 158Q260 184 373 158" stroke="#c0acbb" fill="none" stroke-width="2"/></g>'):'';
 const toppingY=cream?139:mug?157:188;
 const colorful=r.extras.includes('rainbow-sprinkles')?'<g class="rainbow-sprinkles">'+Array.from({length:23},(_,i)=>`<rect x="${174+(i*31)%165}" y="${toppingY-9+(i*7)%21}" width="5" height="2.4" rx="1.2" fill="${['#bd83a8','#cfb372','#9ab896','#a4b9d2','#c89679'][i%5]}" transform="rotate(${(i*37)%120-60} ${174+(i*31)%165} ${toppingY-9+(i*7)%21})"/>`).join('')+'</g>':'';
 const cane=r.extras.includes('cane-sugar')?'<g class="cane-grains">'+Array.from({length:15},(_,i)=>`<rect x="${183+(i*23)%145}" y="${toppingY-3+(i*7)%15}" width="2" height="2" rx=".4" fill="${i%2?'#b28b52':'#dcc395'}" transform="rotate(25 ${183+(i*23)%145} ${toppingY-3+(i*7)%15})"/>`).join('')+'</g>':'';
 const marshmallow=r.extras.includes('marshmallow')?'<g class="marshmallow-layer">'+[[-17,0],[7,-9],[31,4]].map(([x,y],i)=>`<g transform="translate(${211+x} ${toppingY+y-6}) rotate(${[-13,8,-6][i]})"><rect x="-11" y="-10" width="22" height="20" rx="6" fill="${i%2?'#f1d9e2':'#f7ebdf'}" stroke="#d6bdcb" stroke-width=".8"/><path d="M-6-4Q0-7 6-4" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="2"/></g>`).join('')+'</g>':'';
 const toppings=`${cream?'<g class="cream-layer"><ellipse cx="260" cy="165" rx="109" ry="24" fill="#e7d3b8"/><path d="M153 166C164 143 174 148 185 140C197 124 216 129 224 114C235 103 242 98 245 86C267 110 271 108 288 116C300 125 300 134 319 136C344 138 356 150 368 166Z" fill="#f5e9d5"/><path d="M170 157Q223 138 259 151Q302 136 345 157M194 137Q239 121 285 133M221 117Q244 113 264 119" stroke="#cdb497" stroke-width="3.2" fill="none"/></g>':''}<g class="sprinkles">${sprinkles}</g>${cane}${colorful}${marshmallow}${CoffeeRecipe.hasFoam(p,r)&&r.surface&&r.surface!=='none'?`<g class="surface-art" color="${cream?'#8d6044':'#f6e5c9'}" fill="currentColor" stroke="none" transform="translate(260 ${cream?145:mug?157:188}) scale(1 .38)">${CoffeeRecipe.surfaceDesigns.find(d=>d.id===r.surface)?.art||''}</g>`:''}${eyeArtwork}`;
 let mixVolume=0;const mixedColor=plan.layers.reduce((color,layer)=>{mixVolume+=layer.volume;return blend(color,layer.color,layer.volume/mixVolume);},baseColor),strongestSyrup=syrups.reduce((best,x)=>!best||x.dose>best.dose?x:best,null),mixedTop=blend(blend(mixedColor,milkColor,.5),'#f0dcc7',.1),mixedBottom=blend(mixedColor,get(strongestSyrup?.id)?.color||baseColor,.48);

 const scale=r.size==='450'?1.06:r.size==='250'?.95:1,scaleY=scale*(mug?.74:1);
 if(shell&&plan.tasks.length)setWindow(true,cup.mode==='paper'&&effect!=='mix');
 holder.dataset.windowOpen=String(windowOpen);holder.dataset.shell=String(shell);holder.dataset.vessel=mug?'mug':'glass';
 holder.dataset.hasSyrup=String(hasSyrup);holder.className='recipe-stage restored-scene';
 holder.innerHTML=`<svg class="drink-scene ${mug?'mug-scene':''}" viewBox="0 0 520 620" role="img" aria-label="${safe(p.name)}: ${safe(milk?.name||'без молока')}, ${cold?(iced?'прохолодний, з льодом':'прохолодний, без льоду'):'гарячий'}, сиропи ${safe(syrups.map(x=>get(x.id)?.name).join(', ')||'не обрані')}${plan.pearls.length?', '+safe(plan.pearls.map(b=>b.name).join(', ')):''}"><defs>${pearlDefs}<clipPath id="cup-clip"><path d="${clipPath}"/></clipPath><clipPath id="shell-left"><rect x="100" y="150" width="160" height="400"/></clipPath><clipPath id="shell-right"><rect x="260" y="150" width="160" height="400"/></clipPath><radialGradient id="eye-sclera" cx=".35" cy=".28" r=".75"><stop stop-color="#fffef3"/><stop offset=".65" stop-color="#f2eedc"/><stop offset="1" stop-color="#c9c8b9"/></radialGradient><linearGradient id="mixed-gradient" x2=".18" y2="1"><stop stop-color="${mixedTop}"/><stop offset=".46" stop-color="${mixedColor}"/><stop offset="1" stop-color="${mixedBottom}"/></linearGradient><linearGradient id="ceramic-glaze" x2="1" y2=".1"><stop stop-color="${blend(cup.color,'#ffffff',.18)}"/><stop offset=".42" stop-color="${cup.color}"/><stop offset="1" stop-color="${blend(cup.color,'#211923',.3)}"/></linearGradient><linearGradient id="glass-shine"><stop stop-color="#f3e8e0" stop-opacity=".32"/><stop offset=".18" stop-color="#b7bccd" stop-opacity=".04"/><stop offset=".7" stop-color="#ffffff" stop-opacity=".03"/><stop offset="1" stop-color="#e9d9f2" stop-opacity=".3"/></linearGradient><linearGradient id="milk-liquid" x2="1" y2=".15"><stop stop-color="${milkColor}"/><stop offset=".5" stop-color="${milkColor}" stop-opacity=".9"/><stop offset="1" stop-color="#a1a0a9"/></linearGradient><linearGradient id="syrup-liquid" x2=".5" y2="1">${gradientStops(syrups,get)}</linearGradient><linearGradient id="coffee-liquid" x2="0" y2="1"><stop stop-color="${baseColor}"/><stop offset="1" stop-color="${milkColor}"/></linearGradient><linearGradient id="ice-shine" x2="1" y2="1"><stop stop-color="#efffff" stop-opacity=".65"/><stop offset=".45" stop-color="#b2dbed" stop-opacity=".1"/><stop offset="1" stop-color="#efffff" stop-opacity=".55"/></linearGradient><linearGradient id="pitcher-shine"><stop stop-color="#e0d8e2"/><stop offset=".4" stop-color="#908a9b"/><stop offset=".8" stop-color="#e5dfea"/><stop offset="1" stop-color="#777180"/></linearGradient><filter id="ground-blur"><feGaussianBlur stdDeviation="10"/></filter></defs><ellipse cx="263" cy="543" rx="123" ry="18" fill="#130b1b" opacity=".35" filter="url(#ground-blur)"/><ellipse cx="260" cy="526" rx="119" ry="17" fill="#a794ad" opacity=".12"/><g class="glass-vessel" style="transform-origin:260px 355px;transform:scale(${scale},${scaleY})">${mug?`<path class="mug-handle" d="M378 242C466 209 466 389 379 391" fill="none" stroke="${cup.color}" stroke-width="22"/><path d="M381 246C449 226 449 375 381 379" fill="none" stroke="#ffffff30" stroke-width="5"/>`:""}<path d="${cupPath}" fill="url(#glass-shine)" stroke="#e5d9ef80" stroke-width="2"/><g clip-path="url(#cup-clip)"><g class="layer milk-layer"><rect x="140" y="${milkTop}" width="240" height="${bottom-milkTop}" fill="url(#milk-liquid)"/><ellipse cx="260" cy="${milkTop}" rx="111" ry="20" fill="${milkColor}" opacity=".92"/></g><g class="layer syrup-layer"><rect x="140" y="${syrupTop}" width="240" height="${syrupHeight+30}" fill="url(#syrup-liquid)" opacity="${hasSyrup?.95:0}"/><ellipse cx="260" cy="${syrupTop}" rx="93" ry="15" fill="${syrup2}" opacity="${hasSyrup?.7:0}"/></g><g class="layer coffee-layer"><rect x="140" y="${coffeeTop}" width="240" height="${milkTop-coffeeTop+8}" fill="url(#coffee-liquid)"/><ellipse cx="260" cy="${coffeeTop}" rx="116" ry="20" fill="${baseColor}"/><ellipse cx="260" cy="${coffeeTop-1}" rx="110" ry="17" stroke="#e2b17a66" stroke-width="3" fill="none"/></g><g class="mixed-liquid" opacity="0"><rect x="140" y="188" width="240" height="355" fill="url(#mixed-gradient)"/><ellipse cx="260" cy="188" rx="116" ry="20" fill="${mixedTop}"/><g class="mix-ribbons" opacity="0"><path d="M161 286Q292 228 359 306T166 393T359 462" stroke="${milkColor}" opacity=".3" stroke-width="13" fill="none"/></g></g><g class="ice-group">${ice}</g>${pearlArt}<path d="M162 183 183 483Q198 505 208 505L191 190Z" fill="#fff" opacity=".17"/><path d="M352 187 331 481" fill="none" stroke="#ffffff55" stroke-width="3"/><path d="M367 176 342 485" fill="none" stroke="#e9cfee30" stroke-width="7"/></g>${takeawayStraw}${shell?`<g class="cup-shell-left" clip-path="url(#shell-left)"><path d="${cupPath}" fill="url(#ceramic-glaze)" stroke="#f0ddeb66" stroke-width="2"/></g><g class="cup-shell-right" clip-path="url(#shell-right)"><path d="${cupPath}" fill="url(#ceramic-glaze)" stroke="#f0ddeb66" stroke-width="2"/></g>`:''}${mug?`<ellipse class="mug-surface" cx="260" cy="157" rx="113" ry="19" fill="${r.mixed?mixedTop:baseColor}"/><ellipse cx="260" cy="157" rx="107" ry="15" stroke="#efd5a978" fill="none" stroke-width="2.5"/>`:""}<ellipse cx="260" cy="155" rx="122" ry="28" fill="#d7d0e30a" stroke="#ede5f1aa" stroke-width="2"/><ellipse cx="260" cy="155" rx="115" ry="22" fill="none" stroke="#b4a5c060"/><path d="M170 505Q260 538 350 505" stroke="#efedf16b" stroke-width="5" fill="none"/>${cup.mode==='own'&&!mug?`<path class="personal-cup-handle" d="M363 270Q447 250 416 365Q402 405 363 388" fill="none" stroke="${cup.color}" stroke-width="17"/>`:''}<g class="personal-cup-design">${cupDecor}</g>${toppings}${takeawayLid}</g><g class="pearl-scoop" opacity="0"><path d="M-88-18Q-98-20-96-27Q-94-31-86-28L-17-5" fill="none" stroke="#c6b8ce" stroke-width="8" stroke-linecap="round"/><path d="M-28-8Q0-29 29-8Q28 13 1 15Q-24 12-28-8Z" fill="#9c8ba6" stroke="#e3d5e9" stroke-width="2"/><path d="M-18-7Q0-15 18-7" fill="none" stroke="#ffffff66" stroke-width="2"/></g><g class="mix-spoon" opacity="0"><path d="M0-180 0 75" fill="none" stroke="#d4c5d9" stroke-width="8"/><ellipse cy="85" rx="15" ry="28" fill="#9d8baf" stroke="#e7dce9" stroke-width="2"/><path d="M-8 74Q-11 95 0 106" fill="none" stroke="#ffffff66" stroke-width="2"/></g><g class="moving-bottle" data-tool="syrup" opacity="0"><rect x="-22" y="-20" width="44" height="87" rx="11" data-bottle-fill="" fill="${syrupColor}" stroke="#e6d8e370"/><rect x="-11" y="-45" width="22" height="29" rx="3" fill="#ab8e76"/><ellipse cy="-45" rx="11" ry="3" fill="#5b4150" stroke="#d6c3cf"/><rect x="-21" y="6" width="42" height="29" fill="#e4d6bf"/><text data-bottle-label="" x="0" y="24" text-anchor="middle" fill="#65434e" font-size="6" font-family="Arial">СИРОП</text></g><g class="moving-pitcher" data-tool="pitcher" opacity="0"><path d="M-30-30h59l6 63q-30 18-64 0Z" fill="url(#pitcher-shine)" stroke="#ddd7e6"/><path d="M-30-20q-36-5-22 29q6 9 23 8" fill="none" stroke="#bbb2c6" stroke-width="8"/><path d="m29-30 17 5-15 15Z" fill="#e9e4eb"/><ellipse cy="-31" rx="29" ry="7" fill="${milkColor}"/></g><g class="restored-coffee-spout" data-tool="coffee" opacity="0"><path d="M260 29v34q0 10-10 10h-16" stroke="#b1a1b8" stroke-width="13" fill="none"/><path d="M232 69v17" stroke="#8b7b95" stroke-width="10"/></g><path class="moving-stream" data-stream="syrup" opacity="0" d="M365 65Q354 91 324 121L290 458" stroke="${syrupColor}" stroke-width="7" stroke-linecap="round" fill="none"/><path class="moving-stream" data-stream="milk" opacity="0" d="M120 69Q146 81 177 143L233 340" stroke="${milkColor}" stroke-width="15" stroke-linecap="round" fill="none"/><path class="moving-stream" data-stream="base" opacity="0" d="M232 84 243 211" stroke="${baseColor}" stroke-width="7" stroke-linecap="round" fill="none"/>${!cold?'<g class="scene-steam"><path d="M225 145q-15-25 0-45t0-45M265 140q15-28 0-45t0-45M301 146q-14-25 0-43" fill="none" stroke="#e9dfef66" stroke-width="3"/></g>':''}</svg>`;
 document.getElementById('ingredientMilk').textContent=milk?.name||'без молока';
 const taste=document.getElementById('ingredientTaste'),tasteSummary=[...syrups.map(s=>get(s.id)?.name||s.id),...plan.pearls.map(b=>b.name)].join(' + ')||'чистий смак основи';taste.textContent=tasteSummary;
 const q=selector=>holder.querySelector(selector),tools={syrup:q('[data-tool="syrup"]'),milk:q('[data-tool="pitcher"]'),base:q('[data-tool="coffee"]')};
 const streams={syrup:q('[data-stream="syrup"]'),milk:q('[data-stream="milk"]'),base:q('[data-stream="base"]')};
 const layers={syrup:q('.syrup-layer'),milk:q('.milk-layer'),base:q('.coffee-layer')},cubes=[...holder.querySelectorAll('[data-ice]')],pearls=[...holder.querySelectorAll('[data-pearl]')],steps=[...document.querySelectorAll('.mix-step')],status=document.getElementById('mixStatus');
 const worldY=y=>355+(y-355)*scaleY;
 const syrupTasks=plan.tasks.filter(t=>t.type==='syrup'),syrupAmount=syrups.reduce((sum,s)=>sum+s.dose,0)||1;
 const progress=(t,elapsed)=>ease(((elapsed-t.start)/t.duration-.27)/.49);
 let previousTask=null,finished=false;
 function paint(elapsed,staticFrame=false){
  const task=staticFrame?null:plan.tasks.find(t=>elapsed>=t.start&&elapsed<t.start+t.duration),t=task?clamp((elapsed-task.start)/task.duration):1;
  const fill={syrup:1,milk:1,base:1};
  if(!staticFrame){
   for(const type of ['milk','base']){const part=plan.tasks.find(p=>p.type===type);if(part)fill[type]=progress(part,elapsed);}
   if(syrupTasks.length)fill.syrup=plan.full?syrupTasks.reduce((sum,part)=>sum+part.layer.volume*progress(part,elapsed),0)/syrupAmount:progress(syrupTasks[0],elapsed);
  }
  for(const type of ['syrup','milk','base']){layers[type].style.transform='scaleY('+fill[type]+')';layers[type].setAttribute('opacity',fill[type]>.001?1:0);tools[type].setAttribute('opacity',0);streams[type].setAttribute('opacity',0);}
  // Preserve the original blended syrup gradient, including every selected flavor.
  const visibleSyrups=plan.full&&!staticFrame?syrups.filter(s=>syrupTasks.some(part=>part.layer.id===s.id&&elapsed>part.start+part.duration*.27)):syrups;
  q('#syrup-liquid').innerHTML=gradientStops(visibleSyrups,get);
  q('.syrup-layer ellipse').setAttribute('fill',get(visibleSyrups[visibleSyrups.length-1]?.id)?.color||syrup2);
  if(task?.layer){
   const pose=pourPose(task.type,t),tool=tools[task.type],stream=streams[task.type];
   if(task.type!=='base')tool.setAttribute('transform',`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`);
   tool.setAttribute('opacity',pose.opacity);
   if(task.type==='syrup'){q('[data-bottle-fill]').setAttribute('fill',task.layer.color);q('[data-bottle-label]').textContent=task.layer.name.length>12?task.layer.name.slice(0,11)+'…':task.layer.name;}
   if(pose.flow){
    const y=task.type==='syrup'?520+(syrupTop-520)*fill.syrup:task.type==='milk'?520+(milkTop-520)*fill.milk:520+(coffeeTop-520)*fill.base;
    const endX=task.type==='base'?243:pose.lip.x+2,endY=worldY(y)+5;
    stream.setAttribute('d',`M${pose.lip.x} ${pose.lip.y}Q${pose.lip.x} ${pose.lip.y+35} ${endX} ${endY}`);stream.setAttribute('stroke',task.layer.color);stream.setAttribute('opacity',Math.min(1,(t-.27)/.04,(.76-t)/.04));
   }
  }
  const iceTask=plan.tasks.find(t=>t.type==='ice');cubes.forEach((cube,i)=>{const f=staticFrame||!iceTask?1:ease((elapsed-iceTask.start-i*75)/430);cube.setAttribute('transform',`translate(0 ${-350*(1-f)})`);cube.setAttribute('opacity',f>0?1:0);});
  const extraTask=plan.tasks.find(t=>t.type==='extras'),extraFill=staticFrame||!plan.full?1:extraTask?ease((elapsed-extraTask.start)/extraTask.duration):elapsed>=plan.duration?1:0;
  for(const selector of ['.cream-layer','.sprinkles','.jelly-eye','.surface-art','.cane-grains','.rainbow-sprinkles','.marshmallow-layer']){const node=q(selector);if(node)node.setAttribute('opacity',extraFill);}
  const accessoryOpacity=staticFrame||!plan.tasks.length||elapsed>=plan.duration?1:0;for(const selector of ['.takeaway-lid','.takeaway-straw']){const node=q(selector);if(node)node.setAttribute('opacity',accessoryOpacity);}
  const mixTask=plan.tasks.find(t=>t.type==='mix'),mixT=mixTask&&!staticFrame?clamp((elapsed-mixTask.start)/mixTask.duration):r.mixed?1:0,mixFill=mixTask?ease(mixT):r.mixed?1:0;
  q('.mixed-liquid').setAttribute('opacity',mixFill);const mugSurface=q('.mug-surface');if(mugSurface){mugSurface.setAttribute('fill',blend(baseColor,mixedTop,mixFill));mugSurface.setAttribute('opacity',fill.base*fill.milk);}q('.mix-ribbons').setAttribute('opacity',mixTask?Math.sin(Math.PI*mixT)*.8:0);
  const spoon=q('.mix-spoon');spoon.setAttribute('opacity',mixTask&&!staticFrame?Math.min(1,mixT*7,(1-mixT)*7):0);spoon.setAttribute('transform',`translate(${260+Math.sin(mixT*Math.PI*7)*33} ${worldY(300)+Math.cos(mixT*Math.PI*7)*6}) rotate(${Math.sin(mixT*Math.PI*7)*14})`);
  const pearlTask=plan.tasks.find(t=>t.type==='pearls');
  pearls.forEach((pearl,i)=>{
   const x=Number(pearl.getAttribute('data-pearl-x')),y=Number(pearl.getAttribute('data-pearl-y'));
   const f=staticFrame||!pearlTask?1:clamp((elapsed-pearlTask.start-i*17)/680),fall=f*f;
   const swirl=mixTask&&!staticFrame&&mixT>0&&mixT<1?Math.sin(Math.PI*mixT):0;
   const dx=(260+(i*17)%37-18-x)*(1-fall)+Math.sin(mixT*Math.PI*6+i)*18*swirl;
   const dy=(120-y)*(1-fall)-Math.abs(Math.sin(mixT*Math.PI*4+i*.4))*105*swirl;
   pearl.setAttribute('transform',`translate(${dx} ${dy})`);pearl.setAttribute('opacity',f>0?1:0);
  });
  const scoop=q('.pearl-scoop'),scoopT=pearlTask?clamp((elapsed-pearlTask.start)/pearlTask.duration):1;
  scoop.setAttribute('opacity',pearlTask&&!staticFrame?ease(scoopT/.12)*(1-ease((scoopT-.72)/.28)):0);
  scoop.setAttribute('transform',`translate(260 ${worldY(112)}) rotate(${8+ease(scoopT/.35)*37})`);
  if(task!==previousTask){previousTask=task;if(task){status.textContent=task.name;if(task.type==='syrup')taste.textContent=task.layer.name;if(task.type==='pearls')taste.textContent=plan.pearls.map(b=>b.name).join(' + ');const step=({pearls:0,ice:0,syrup:1,milk:2,base:3,extras:3})[task.type];steps.forEach((el,i)=>el.classList.toggle('active',i<=step));}}
  if(!task&&(staticFrame||elapsed>=plan.duration)&&!finished){finished=true;if(autoPaperView){setWindow(false);root.CafeAtelier?.sync();}taste.textContent=tasteSummary;status.textContent=mixTask?'М’який градієнт готовий ✦':plan.tasks.length?'Твій рецепт готовий ✦':'Твоя чашка змінюється разом із рецептом';steps.forEach(el=>el.classList.toggle('active',!!plan.tasks.length));}
 }
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!plan.tasks.length){paint(plan.duration,true);return;}
 let start;function tick(now){if(start===undefined)start=now;const elapsed=now-start;paint(elapsed);frame=elapsed<plan.duration?requestAnimationFrame(tick):0;}
 frame=requestAnimationFrame(tick);
}
root.CafeBuilder={draw,createPlan,pourPose,setWindow,isWindowOpen,blend,pearlIngredients};
})(globalThis);
