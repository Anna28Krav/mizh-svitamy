/* Persistent menu collections, managed by the café team. */
(function(){
'use strict';
let scope='current',tabsKey='',editing=false;
const core=['all','signature','coffee','nocaf','tea','dessert','savoury','seasonal'];
const accentLabels={none:'Без кольору',mint:'М’ятний',lavender:'Лавандовий',rose:'Рожевий',peach:'Персиковий',sky:'Небесний',gold:'Золотистий',pistachio:'Фісташковий',berry:'Ягідний'};
const starMark='<span class="section-star" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 1C18 11 21 14 31 16C21 18 18 21 16 31C14 21 11 18 1 16C11 14 14 11 16 1Z" fill="currentColor"/></svg></span>';
const sectionLabel=s=>esc(s.name)+(s.starred?starMark:'');
const sections=()=>state.menuSections||[];
function syncTabs(){
 if(!state.menuSections)return;
 const shown=sections().filter(s=>!s.archived&&s.menu&&state.menu.some(p=>p.active&&!p.archived&&!p.builderOnly&&p.collections?.includes(s.id)));
 const key=JSON.stringify(shown.map(s=>[s.id,s.name,!!s.starred,s.accent]));
 if(key!==tabsKey){tabsKey=key;const box=document.querySelector('.category-tabs');if(!box)return;
  box.querySelectorAll('[data-category]').forEach(b=>{if(!core.includes(b.dataset.category))b.remove();});
  const anchor=$('seasonalCategory');
  for(const s of shown){const b=document.createElement('button');b.type='button';b.dataset.category=s.id;b.textContent=s.name;b.innerHTML=sectionLabel(s);b.dataset.sectionAccent=accentLabels[s.accent]?s.accent:'none';b.onclick=()=>{state.category=s.id;state.collection='';state.menuLimit=12;renderMenu();};box.insertBefore(b,anchor);}
 }
 if(!core.includes(state.category)&&!shown.some(s=>s.id===state.category)){state.category='all';state.collection='';}
 if(state.collection&&sections().some(s=>s.id===state.collection&&s.archived))state.collection='';
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===state.category&&!state.collection);b.setAttribute('aria-pressed',String(b.dataset.category===state.category&&!state.collection));});
}
function counts(s){const rows=state.menu.filter(p=>!p.builderOnly&&p.collections?.includes(s.id));return {total:rows.length,visible:rows.filter(p=>p.active&&!p.archived).length};}
function renderList(){
 const box=$('menuSectionList');box.replaceChildren();
 $('sectionsCurrent').classList.toggle('active',scope==='current');$('sectionsArchived').classList.toggle('active',scope==='archived');
 for(const [index,s]of sections().entries()){
  if(s.archived!==(scope==='archived'))continue;
  const c=counts(s),row=document.createElement('article');row.className='menu-section-row';row.dataset.sectionAccent=accentLabels[s.accent]?s.accent:'none';
  const status=s.archived?'В архіві':[s.menu?'Вкладка меню':'',s.seasonal?'Сезонна вітрина':''].filter(Boolean).join(' · ')||'Прихований розділ';
  row.innerHTML=`<div><b class="section-label">${sectionLabel(s)}</b><small>${esc(status)}<br>${c.total} позицій · ${c.visible} доступні гостям</small></div><div class="section-row-actions"><button type="button" class="section-up" aria-label="Перемістити ${esc(s.name)} вище" ${index===0?'disabled':''}>↑</button><button type="button" class="section-down" aria-label="Перемістити ${esc(s.name)} нижче" ${index===sections().length-1?'disabled':''}>↓</button><button type="button" class="section-edit">Редагувати</button><button type="button" class="section-archive">${s.archived?'Відновити':'До архіву'}</button></div>`;
  row.querySelector('.section-edit').onclick=()=>openEditor(s);
  row.querySelector('.section-archive').onclick=()=>{openEditor(s);$('sectionArchived').checked=!s.archived;archiveControls();};
  for(const [selector,direction]of [['.section-up',-1],['.section-down',1]])row.querySelector(selector).onclick=async e=>{e.currentTarget.disabled=true;try{const r=await api('/api/admin/collections',{method:'PATCH',body:JSON.stringify({id:s.id,action:'move',direction})});state.menuSections=r.sections;sync();toast('Порядок розділів збережено');}catch(error){$('sectionsNotice').textContent=error.message;e.currentTarget.disabled=false;}};
  box.append(row);
 }
 if(!box.children.length)box.innerHTML='<p class="section-empty">Тут поки немає розділів.</p>';
}
function archiveControls(){const archive=$('sectionArchived').checked;$('sectionArchiveActions').hidden=!archive;$('sectionRestoreActions').hidden=archive;if(archive)$('sectionRestoreProducts').checked=false;else $('sectionArchiveProducts').checked=false;}
function updateCount(){$('sectionPickedCount').textContent=document.querySelectorAll('[data-section-product]:checked').length;}
function filterPicks(){const q=$('sectionProductSearch').value.toLocaleLowerCase('uk').trim();$('sectionProductPicks').querySelectorAll('label').forEach(l=>l.hidden=!!q&&!l.dataset.search.includes(q));}
function openEditor(s){
 editing=true;$('sectionId').value=s?.id||'';$('sectionEditorTitle').textContent=s?'Редагувати розділ':'Новий розділ';$('sectionName').value=s?.name||'';
 const copy=s&&state.seasonal?.copy?.[s.id];$('sectionTitle').value=copy?.title||s?.title||'';$('sectionDescription').value=copy?.description||s?.description||'';
 $('sectionStarred').checked=!!s?.starred;$('sectionAccent').value=accentLabels[s?.accent]?s.accent:'none';$('sectionUseColor').checked=$('sectionAccent').value!=='none';updateAccentPreview();
 $('sectionInMenu').checked=s?s.menu:true;$('sectionSeasonal').checked=s?s.seasonal:true;$('sectionArchived').checked=!!s?.archived;
 $('sectionArchiveProducts').checked=false;$('sectionRestoreProducts').checked=false;$('sectionEditorError').textContent='';$('sectionProductSearch').value='';archiveControls();
 const box=$('sectionProductPicks');box.replaceChildren();
 for(const p of state.menu.filter(p=>!p.builderOnly)){
  const l=document.createElement('label');l.dataset.search=(p.name+' '+p.subtitle).toLocaleLowerCase('uk');const photo=productPhoto(p);
  l.innerHTML=`<input type="checkbox" data-section-product value="${esc(p.id)}" ${s&&p.collections?.includes(s.id)?'checked':''}>${photo?`<img src="${esc(photo)}" alt="" loading="lazy">`:'<span class="section-art" aria-hidden="true">✦</span>'}<span><b>${esc(p.name)}</b><small>${p.archived?'В архіві':!p.active?'Не у продажу':'У меню'} · ${money(p.price)}</small></span>`;
  l.querySelector('input').onchange=updateCount;box.append(l);
 }
 updateCount();$('sectionEditor').showModal();$('sectionName').focus();
}
function updateAccentPreview(){
 $('sectionColorChoices').hidden=!$('sectionUseColor').checked;
 const preview=$('sectionAccentPreview');preview.dataset.sectionAccent=$('sectionUseColor').checked?$('sectionAccent').value:'none';
 preview.innerHTML=sectionLabel({name:$('sectionName').value.trim()||'Назва розділу',starred:$('sectionStarred').checked});
}
for(const [id,name]of Object.entries(accentLabels)){const o=document.createElement('option');o.value=id;o.textContent=name;$('sectionAccent').append(o);}
$('sectionName').oninput=updateAccentPreview;$('sectionStarred').onchange=updateAccentPreview;
$('sectionUseColor').onchange=()=>{if($('sectionUseColor').checked&&$('sectionAccent').value==='none')$('sectionAccent').value='mint';updateAccentPreview();};
$('sectionAccent').onchange=()=>{if($('sectionAccent').value==='none')$('sectionUseColor').checked=false;updateAccentPreview();};
function sync(){syncTabs();window.CafeAtelier?.refreshCollections();if(state.session?.isAdmin)renderList();}
$('newMenuSection').onclick=()=>openEditor(null);
$('sectionsCurrent').onclick=()=>{scope='current';renderList();};$('sectionsArchived').onclick=()=>{scope='archived';renderList();};
$('closeSectionEditor').onclick=()=>{$('sectionEditor').close();editing=false;};$('sectionEditor').addEventListener('close',()=>editing=false);
$('sectionArchived').onchange=archiveControls;$('sectionProductSearch').oninput=filterPicks;
$('sectionSelectShown').onclick=()=>{$('sectionProductPicks').querySelectorAll('label').forEach(l=>{if(!l.hidden)l.querySelector('input').checked=true;});updateCount();};
$('sectionClearPicks').onclick=()=>{document.querySelectorAll('[data-section-product]').forEach(c=>c.checked=false);updateCount();};
$('sectionEditorForm').onsubmit=async e=>{
 e.preventDefault();const button=$('saveMenuSection');button.disabled=true;$('sectionEditorError').textContent='';
 try{const id=$('sectionId').value;await api('/api/admin/collections',{method:'PATCH',body:JSON.stringify({action:id?'update':'create',id,section:{starred:$('sectionStarred').checked,accent:$('sectionUseColor').checked?$('sectionAccent').value:'none',name:$('sectionName').value,title:$('sectionTitle').value||$('sectionName').value,description:$('sectionDescription').value,menu:$('sectionInMenu').checked,seasonal:$('sectionSeasonal').checked,archived:$('sectionArchived').checked},products:[...document.querySelectorAll('[data-section-product]:checked')].map(c=>c.value),archiveProducts:$('sectionArchiveProducts').checked,restoreProducts:$('sectionRestoreProducts').checked})});
  await loadMenu();$('sectionEditor').close();editing=false;sync();window.CafeExperience?.renderSeason();toast('Розділ збережено');
 }catch(error){$('sectionEditorError').textContent=error.message;}finally{button.disabled=false;}
};
window.CafeSections={sync,syncTabs,openEditor,sectionLabel};if(state.menuSections)sync();
})();
