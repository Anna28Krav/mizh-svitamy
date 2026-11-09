(function(root){
'use strict';
const features=[
 {id:'blue-hour',name:'Чорничний сутінок',image:'assets/coffee-hero.webp',alt:'Чорничний айс-лате та бузкова керамічна чашка на темному столі',note:'Еспресо, чорниця і ніжність молока.',kind:'Кава дня'},
 {id:'lavender-latte',name:'Лавандовий туман',image:'assets/lavender-day.webp',alt:'Лавандовий лате з молочним малюнком у бузковій керамічній чашці',note:'Тепло еспресо. Спокій лаванди.',kind:'Кава дня'},
 {id:'strawberry-matcha',name:'Полунична матча',image:'assets/matcha-day.webp',alt:'Полунична матча з молоком і льодом у прозорій склянці',note:'Матча, полуниця і ковток свіжості.',kind:'Смак дня'},
{"id": "moon-cappuccino", "name": "Місячний капучино", "image": "assets/menu/moon-cappuccino-cohesive.webp", "alt": "Місячний капучино", "note": "Місячний капучино", "kind": "Смак дня"},
{"id": "tropical-matcha", "name": "Тропічна орбіта", "image": "assets/menu/tropical-matcha-cohesive.webp", "alt": "Тропічна орбіта", "note": "Тропічна орбіта", "kind": "Смак дня"},
{"id": "green-morning", "name": "Зелений ранок", "image": "assets/menu/green-morning-cohesive.webp", "alt": "Зелений ранок", "note": "Зелений ранок", "kind": "Смак дня"},
{"id": "mint-comet", "name": "М’ятна комета", "image": "assets/menu/mint-comet-cohesive.webp", "alt": "М’ятна комета", "note": "М’ятна комета", "kind": "Смак дня"},
{"id": "halloween-eye", "name": "Погляд із потойбіччя", "image": "assets/menu/halloween-eye-cohesive.webp", "alt": "Погляд із потойбіччя", "note": "Погляд із потойбіччя", "kind": "Смак дня"},
{"id": "halloween-pumpkin-latte", "name": "Лате гарбузової відьми", "image": "assets/menu/halloween-pumpkin-latte-cohesive.webp", "alt": "Лате гарбузової відьми", "note": "Лате гарбузової відьми", "kind": "Смак дня"},
{"id": "halloween-cherry-cocoa", "name": "Павутинка вишневої ночі", "image": "assets/menu/halloween-cherry-cocoa-cohesive.webp", "alt": "Павутинка вишневої ночі", "note": "Павутинка вишневої ночі", "kind": "Смак дня"}
];
const messages=['Ти рухаєшся у своєму напрямку. Не поспішай — твій темп теж правильний.','Сьогодні можна спробувати щось нове. Навіть якщо це лише інший сироп.','У тебе вийде. А поки — видихни й дозволь собі маленьку паузу.','Твоя цікавість може відкрити цілий світ. Іди за нею.','Твій відпочинок не потребує виправдань. Дозволь собі трохи спокою.','Нехай сьогодні знайдеться одна маленька причина усміхнутися.','Не обов’язково знати весь маршрут, щоб зробити наступний крок.','Твоя магія — у тому, як ти бачиш звичайні речі.','Залиш трохи місця для несподівано приємного.','Сьогодні обери щось для себе. Без пояснень і відчуття провини.','Маленькі зміни теж змінюють світ. Почни зі своєї чашки.','Тепло, яке ти даруєш іншим, потрібне й тобі.'];
const shapes=['star','flower','heart','scallop','cloud','sun','ticket','hexagon'];
const stickerShapes={star:'Зірка',flower:'Квітка',heart:'Серце',scallop:'Хвиляста',cloud:'Хмаринка',sun:'Сонечко',ticket:'Квиточок',hexagon:'Шестикутник'};
const stickerColors={mint:'М’ятний',lavender:'Лавандовий',rose:'Рожевий',peach:'Персиковий',sky:'Небесний',vanilla:'Ванільний',pistachio:'Фісташковий',berry:'Ягідний'};
function stickerLook(date=new Date(),v={}){const day=dayIndex(typeof date==='string'?date:dateKey(date)),colors=Object.keys(stickerColors),rotate=(list,offset=0)=>list[((day+offset)%list.length+list.length)%list.length];return {shape:shapes.includes(v.stickerShape)?v.stickerShape:rotate(shapes),color:colors.includes(v.stickerColor)?v.stickerColor:rotate(colors,2)};}

function dateKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
function dayIndex(key){const parts=key.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!parts)throw Error('Invalid day');const time=Date.UTC(+parts[1],+parts[2]-1,+parts[3]);if(new Date(time).toISOString().slice(0,10)!==key)throw Error('Invalid day');return Math.floor(time/86400000);}
let ids=null,wishes=null,today=null,stickerSettings={};
function configure(v){ids=v?.ids||null;wishes=v?.wishes||null;today=v?.today||null;stickerSettings=v||{};}
function drinkAvailable(p){return p.active&&p.stock>0&&!p.archived&&!p.builderOnly&&p.base!=='dessert'&&!['dessert','savoury'].includes(p.category);}
function featureFor(p){return features.find(f=>f.id===p.id)||{id:p.id,name:p.name,image:p.photo||'assets/coffee-hero.webp',alt:p.name,note:p.subtitle,kind:'Смак дня'};}
function hashVisitor(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
let browserVisitor='',visitor='',wishCache=new Map();
try{browserVisitor=root.localStorage?.getItem('mizh-visitor-v1')||'';if(!browserVisitor&&root.localStorage){browserVisitor=root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36);root.localStorage.setItem('mizh-visitor-v1',browserVisitor);}visitor=browserVisitor;}catch{browserVisitor='session-'+Math.random().toString(36).slice(2);visitor=browserVisitor;}
function setVisitor(account){visitor=account?'account:'+account:browserVisitor;}
function personalWish(key,pool,manual){
 const cacheKey='mizh-personal-wish:'+key+':'+hashVisitor(visitor||'');
 if(visitor){if(wishCache.has(cacheKey))return wishCache.get(cacheKey);try{const saved=root.localStorage?.getItem(cacheKey);if(saved&&saved.length<=220){wishCache.set(cacheKey,saved);return saved;}}catch{}}
 const candidates=pool.map(i=>messages[i]);if(manual?.customWish&&!candidates.includes(manual.customWish))candidates.push(manual.customWish);else if(messages[manual?.wish]&&!candidates.includes(messages[manual.wish]))candidates.push(messages[manual.wish]);
 const index=((dayIndex(key)+(visitor?hashVisitor(visitor):0))%candidates.length+candidates.length)%candidates.length;
 const message=visitor?candidates[index]:manual?.customWish||messages[pool.includes(manual?.wish)?manual.wish:pool[dayIndex(key)%pool.length]];
 if(visitor){wishCache.set(cacheKey,message);try{root.localStorage?.setItem(cacheKey,message);const cutoff=dayIndex(key)-7;for(let i=root.localStorage.length-1;i>=0;i--){const k=root.localStorage.key(i),m=k?.match(/^mizh-personal-wish:(\d{4}-\d{2}-\d{2}):/);if(m&&dayIndex(m[1])<cutoff)root.localStorage.removeItem(k);}}catch{}}
 return message;
}
function pick(date=new Date(),catalog){
 const key=typeof date==='string'?date:dateKey(date),day=dayIndex(key),index=n=>((day%n)+n)%n,manual=today?.date===key?today:null;
 const available=Array.isArray(catalog)?catalog.filter(drinkAvailable):null;
 const selected=available?(ids||features.map(f=>f.id)).map(id=>available.find(p=>p.id===id)).filter(Boolean):[];
 const pool=selected.length?selected.map(featureFor):features;
 const chosen=available?.find(p=>p.id===manual?.drink);
 const featured=chosen?featureFor(chosen):!available?features.find(f=>f.id===manual?.drink):null;
 const list=(wishes||[]).filter(i=>Number.isInteger(i)&&messages[i]),wishPool=list.length?list:messages.map((_,i)=>i);
 return {key,day,feature:featured||pool[index(pool.length)],...stickerLook(key,stickerSettings),message:personalWish(key,wishPool,manual)};
}
root.CoffeeDaily={configure,pick,dateKey,dayIndex,features,messages,shapes,drinkAvailable,stickerLook,stickerShapes,stickerColors,setVisitor};if(typeof module!=='undefined')module.exports=root.CoffeeDaily;
})(globalThis);
