/* The guest's own recipe and the café's current seasonal edit. */
(function(){
'use strict';
let last=null,restoring=false,history=[],adminLoaded=false;
let labels={halloween:'Хелловін',autumn:'Осінь',winter:'Зима',spring:'Весна',ukrainian:'Українські смаки',summer:'Літо',special:'Особливі пропозиції',christmas:'Різдво',potions:'Зілля',boba:'Бабл-ті',bowls:'Боули',sandwiches:'Сендвічі й круасани',pasta:'Паста',syrnyky:'Сирники',breakfast:'Сніданки',kids:'Дитяче меню',lactosefree:'Без лактози'};
const clone=value=>JSON.parse(JSON.stringify(value));
const snapshot=()=>({base:state.base,recipe:clone(state.recipe)});
const ingredientsKey=s=>JSON.stringify([s.base,s.recipe.base,s.recipe.size,s.recipe.milk,s.recipe.temp,s.recipe.ice,s.recipe.syrups,s.recipe.extras,s.recipe.sugar]);
function beforeUpdate(){if(!CoffeeRecipe.hasFoam(currentProduct(),state.recipe)){state.recipe.surface='none';state.recipe.surfaceByBarista=false;}if(state.recipe.temp==='hot')state.recipe.ice=false;const next=snapshot();if(last&&!restoring&&ingredientsKey(last)!==ingredientsKey(next))state.recipe.mixed=false;if(last&&!restoring&&JSON.stringify(last)!==JSON.stringify(snapshot())){history.push(clone(last));if(history.length>40)history.shift();}}
function afterUpdate(){if(!CoffeeRecipe.hasFoam(currentProduct(),state.recipe)){state.recipe.surface='none';state.recipe.surfaceByBarista=false;}last=snapshot();sync();}
function sync(){const p=currentProduct();if(!p)return;const r=state.recipe,own=p.id==='my-drink';$('personalBaseField').hidden=!own;$('personalBase').value=r.base||p.base;$('baseDrink').classList.toggle('is-personal',own);$('iceControl').hidden=r.temp!=='iced';$('iceEnabled').checked=CoffeeRecipe.hasIce(r);$('icePriceHint').textContent='У ціні напою';const foam=CoffeeRecipe.hasFoam(p,r);document.querySelectorAll('[data-surface]').forEach(b=>{const chosen=!r.surfaceByBarista&&b.dataset.surface===(r.surface||'none');b.classList.toggle('active',chosen);b.setAttribute('aria-pressed',chosen);b.disabled=!foam&&b.dataset.surface!=='none';});$('baristaChoice').disabled=!foam;$('baristaChoice').classList.toggle('active',!!r.surfaceByBarista);$('baristaChoice').setAttribute('aria-pressed',!!r.surfaceByBarista);$('surfaceHint').textContent=foam&&r.surfaceByBarista?'Бариста обере узор. У прев’ю — один із можливих варіантів.':foam?(r.extras.includes('cream')?'Візерунок какао на вершковій шапочці.':'Маленький узор на молочній пінці. Бариста побачить твій вибір.'):'Для узору обери гарячий напій із молоком або додай вершкову шапочку.';$('undoRecipe').disabled=!history.length;$('mixDrink').disabled=!!r.mixed;$('mixDrink').textContent=r.mixed?'Уже перемішано ✓':'Перемішати ↻';const mode=r.cup?.mode;$('peekCup').hidden=mode==='glass';$('peekCup').setAttribute('aria-pressed',CafeBuilder.isWindowOpen());$('peekCup').textContent=CafeBuilder.isWindowOpen()?'Закрити віконце ↶':'Зазирнути в чашку ✦';}
function afterMenu(){refreshCollections();if(!last)last=snapshot();sync();if(state.session?.isAdmin)fillSeasonForm();}
let seasonDraft={},editingTheme='';
function showTheme(id){editingTheme=id;$('seasonCopyTheme').value=id;const item=seasonDraft[id];$('seasonTitleInput').value=item?.title||labels[id]||'';$('seasonDescriptionInput').value=item?.description||'';}
function saveThemeDraft(){if(editingTheme)seasonDraft[editingTheme]={title:$('seasonTitleInput').value,description:$('seasonDescriptionInput').value};}
function fillSeasonForm(force=false){if(adminLoaded&&!force)return;adminLoaded=true;const config=state.seasonal;if(!config)return;seasonDraft={...config.copy,[config.featured]:config.copy?.[config.featured]||{title:config.title,description:config.description}};$('seasonEnabled').checked=config.enabled;document.querySelectorAll('[data-season-enabled]').forEach(c=>c.checked=config.collections.includes(c.value));$('seasonFeatured').value=config.featured;showTheme(config.featured);}
$('seasonFeatured').onchange=()=>{saveThemeDraft();showTheme($('seasonFeatured').value);};
$('seasonCopyTheme').onchange=()=>{saveThemeDraft();showTheme($('seasonCopyTheme').value);};
function editCollections(p){document.querySelectorAll('[data-product-collection]').forEach(c=>c.checked=!!p?.collections?.includes(c.value));}
function readCollections(){return [...document.querySelectorAll('[data-product-collection]:checked')].map(c=>c.value);}
for(const [value,name] of [['dessert','Десерти'],['savoury','Несолодкі страви']]){const option=document.createElement('option');option.value=value;option.textContent=name;$('manageThemeFilter').append(option);}
let sectionsKey='';
function refreshCollections(){
 const sections=state.menuSections;if(!sections)return;
 const key=JSON.stringify(sections);if(key===sectionsKey)return;sectionsKey=key;
 labels=Object.fromEntries(sections.map(s=>[s.id,s.name]));
 const filter=$('manageThemeFilter').value;
 $('manageThemeFilter').replaceChildren();for(const [value,name]of [['all','Усі позиції'],['dessert','Десерти'],['savoury','Несолодкі страви']]){const o=document.createElement('option');o.value=value;o.textContent=name;$('manageThemeFilter').append(o);}
 buildCollections(sections);$('manageThemeFilter').value=filter||'all';adminLoaded=false;
}
function buildCollections(sections){
 for(const id of ['seasonAdminCollections','seasonFeatured','seasonCopyTheme','editCollections'])$(id).replaceChildren();
 for(const [id,name]of Object.entries(labels)){
  const section=sections?.find(s=>s.id===id);
  const filterOption=document.createElement('option');filterOption.value=id;filterOption.textContent=name;$('manageThemeFilter').append(filterOption);
  if(!section||(!section.archived&&section.seasonal)){
   const l=document.createElement('label');l.innerHTML='<input type="checkbox" data-season-enabled value="'+escCollection(id)+'"> '+escCollection(name);$('seasonAdminCollections').append(l);
   for(const target of ['seasonFeatured','seasonCopyTheme']){const o=document.createElement('option');o.value=id;o.textContent=name;$(target).append(o);}
  }
  const pl=document.createElement('label');pl.innerHTML='<input type="checkbox" data-product-collection value="'+escCollection(id)+'"> '+escCollection(name)+(section?.archived?' · архів':'');$('editCollections').append(pl);
 }
}
function escCollection(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Initial options also work before the first configuration request returns.
if(state.menuSections)refreshCollections();else{
for(const [id,name]of Object.entries(labels)){const filterOption=document.createElement('option');filterOption.value=id;filterOption.textContent=name;$('manageThemeFilter').append(filterOption);const l=document.createElement('label');l.innerHTML='<input type="checkbox" data-season-enabled value="'+id+'"> '+name;$('seasonAdminCollections').append(l);const option=document.createElement('option');option.value=id;option.textContent=name;$('seasonFeatured').append(option);const copyOption=document.createElement('option');copyOption.value=id;copyOption.textContent=name;$('seasonCopyTheme').append(copyOption);const pl=document.createElement('label');pl.innerHTML='<input type="checkbox" data-product-collection value="'+id+'"> '+name;$('editCollections').append(pl);}
}
for(const base of CoffeeRecipe.personalBases){const option=document.createElement('option');option.value=base.id;option.textContent=base.name;$('personalBase').append(option);}
$('personalBase').onchange=e=>{state.recipe.base=e.target.value;state.recipe.milk=['black','tea','lemonade'].includes(e.target.value)?'none':'classic';updateRecipe('all');};
$('iceEnabled').onchange=e=>{state.recipe.ice=e.target.checked;updateRecipe(e.target.checked?'ice':'');};
for(const d of [...CoffeeRecipe.surfaceDesigns,{id:'none',name:'Без узору',art:'<circle r="34" fill="none" stroke="currentColor" stroke-width="4"/><path d="m-24 24 48-48" fill="none" stroke="currentColor" stroke-width="4"/>'}]){const b=document.createElement('button');b.type='button';b.dataset.surface=d.id;b.innerHTML='<svg viewBox="-50 -50 100 100" aria-hidden="true">'+d.art+'</svg><span>'+d.name+'</span>';b.onclick=()=>{state.recipe.surface=d.id;state.recipe.surfaceByBarista=false;updateRecipe();};$('surfaceOptions').append(b);}
$('baristaChoice').onclick=()=>{if(!CoffeeRecipe.hasFoam(currentProduct(),state.recipe))return;state.recipe.surface=CoffeeRecipe.surfaceDesigns[Math.floor(Math.random()*CoffeeRecipe.surfaceDesigns.length)].id;state.recipe.surfaceByBarista=true;updateRecipe();};
$('mixDrink').onclick=()=>{state.recipe.mixed=true;updateRecipe('mix');};
$('undoRecipe').onclick=()=>{const previous=history.pop();if(!previous)return;restoring=true;state.base=previous.base;state.recipe=clone(previous.recipe);try{updateRecipe();}finally{restoring=false;}toast('Останню зміну скасовано');};
$('peekCup').onclick=()=>{CafeBuilder.setWindow(!CafeBuilder.isWindowOpen());sync();};
document.querySelectorAll('[data-menu-scope]').forEach(b=>b.onclick=()=>{state.menuScope=b.dataset.menuScope;document.querySelectorAll('[data-menu-scope]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});renderManage();});
$('manageThemeFilter').onchange=e=>{state.manageTheme=e.target.value;renderManage();};
$('seasonForm').onsubmit=async e=>{e.preventDefault();$('seasonError').textContent='';const button=$('saveSeason');button.disabled=true;try{saveThemeDraft();const body={copy:seasonDraft,enabled:$('seasonEnabled').checked,collections:[...document.querySelectorAll('[data-season-enabled]:checked')].map(c=>c.value),featured:$('seasonFeatured').value,title:$('seasonTitleInput').value,description:$('seasonDescriptionInput').value};state.seasonal=await api('/api/admin/season',{method:'PATCH',body:JSON.stringify(body)});window.CafeExperience.renderSeason();renderMenu();toast('Поточну вітрину збережено');fillSeasonForm(true);}catch(error){$('seasonError').textContent=error.message;}finally{button.disabled=false;}};
window.CafeAtelier={beforeUpdate,afterUpdate,afterMenu,editCollections,readCollections,sync,refreshCollections};
if(state.menu.length)afterMenu();
})();
