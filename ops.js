(()=>{
'use strict';

const by=id=>document.getElementById(id);
const endpoint=view=>'/api/operations?view='+view;
const views=['stock','media','finance','audit'];

const stamp=t=>new Date(t).toLocaleString('uk-UA',{
  timeZone:'Europe/Kyiv',
  dateStyle:'short',
  timeStyle:'short'
});

const val=(obj,key)=>Number(obj?.[key]||0);
const mediaUrl=id=>'/api/media?id='+encodeURIComponent(id);

function node(tag,text,cls){
  const el=document.createElement(tag);
  if(text!==undefined) el.textContent=text;
  if(cls) el.className=cls;
  return el;
}

function empty(box,text){
  box.replaceChildren(node('p',text));
}

function list(id,rows,describe){
  const box=by(id);
  box.replaceChildren();

  if(!rows.length){
    empty(box,'Записів поки немає.');
    return;
  }

  for(const row of rows){
    const [title,detail]=describe(row);
    const article=node('article');

    article.append(
      node('b',title),
      node('p',detail),
      node('small',stamp(row.time)+(row.actor?' · '+row.actor:''))
    );

    box.append(article);
  }
}

function tile(title,value){
  const box=node('article',undefined,'ops-tile');
  box.append(node('span',title),node('strong',value));
  return box;
}

function asset(item){
  const video=item.type.startsWith('video/');
  const el=node(video?'video':'img');

  window.CafeAuth.setMedia(el,mediaUrl(item.id));

  if(video){
    el.controls=true;
    el.preload='metadata';
    el.playsInline=true;
  }else{
    el.alt=item.title;
    el.loading='lazy';
  }

  return el;
}

async function load(view,editId){
  if(!views.includes(view)||!state.workUnlocked) return;

  try{
    const r=await api(endpoint(view));

    if(view==='stock'){
      const box=by('stockOverview');
      const select=by('stockMoveForm').elements.id;
      const previous=select.value;

      box.replaceChildren();
      select.replaceChildren();

      for(const item of r.items){
        const label=item.name+' · '+item.stock+' '+item.unit;
        const option=node('option',label);
        option.value=item.id;
        select.append(option);

        const card=tile(item.name,item.stock+' '+item.unit);

        if(item.stock<=(item.unit==='мл'?100:5)){
          card.classList.add('is-low');
          card.append(node('small','Потрібно поповнити'));
        }

        box.append(card);
      }

      if([...select.options].some(option=>option.value===previous)){
        select.value=previous;
      }

      list('stockHistory',r.moves,m=>[
        m.item+' · '+(m.delta>0?'+':'')+m.delta+' '+m.unit,
        [
          m.supplier,
          m.note,
          m.cost?money(m.cost):''
        ].filter(Boolean).join(' · ')
      ]);
    }

    if(view==='finance'){
      const sales=val(r.sales,'amount');
      const count=val(r.sales,'count');
      const income=val(r.totals,'income');
      const expense=val(r.totals,'expense');
      const donation=val(r.donation,'amount');
      const received=sales+income;

      const percent=amount=>
        (received>0?amount/received*100:0)
          .toLocaleString('uk-UA',{
            maximumFractionDigits:1
          })+' %';

      by('opsFinanceSummary').replaceChildren(
        tile('Оплачені замовлення · '+count,money(sales)),
        tile('Додаткові надходження',money(income)),
        tile('Загальні надходження',money(received)),
        tile(
          'Середній чек',
          money(count>0?Math.round(sales/count):0)
        ),
        tile('Витрати',money(expense)),
        tile('Частка витрат',percent(expense)),
        tile('Відкладено на донати',money(donation)),
        tile('Частка донатів',percent(donation)),
        tile('Різниця за записами',money(received-expense)),
        tile(
          'Вільний залишок',
          money(received-expense-donation)
        )
      );

      list('opsFinanceList',r.entries,m=>[
        (m.type==='income'?'+ ':'− ')+money(m.amount),
        m.note
      ]);
    }

    if(view==='audit'){
      list('opsAuditList',r.items,m=>[
        m.action,
        m.detail+(m.role?' · '+({
          admin:'адміністратор',
          assistant:'помічниця',
          staff:'склад',
          barista:'бариста',
          smm:'SMM',
          accountant:'бухгалтерія'
        }[m.role]||m.role):'')
      ]);
    }

    if(view==='media'){
      const box=by('opsMediaList');
      box.replaceChildren();

      if(!r.items.length){
        empty(box,'Поки немає завантажених матеріалів.');
      }

      for(const item of r.items){
        box.append(mediaCard(item,item.id===editId));
      }

      return box.querySelector('.ops-media.is-editing input');
    }
  }catch(e){
    by('opsNotice').textContent=e.message;
  }
}

function mediaCard(item,editing=false){
  const card=node(
    'article',
    undefined,
    'ops-media'+(editing?' is-editing':'')
  );

  const status=node(
    'small',
    item.published?'Опубліковано':'Чернетка',
    'media-status'
  );

  const actions=node('div',undefined,'ops-actions');

  const button=(label,fn,cls='button outline')=>{
    const b=node('button',label,cls);
    b.type='button';
    b.onclick=fn;
    return b;
  };

  const swap=(next,open)=>{
    const replacement=mediaCard(next,open);
    card.replaceWith(replacement);
    replacement.querySelector(open?'input':'button')
      ?.focus({preventScroll:true});
  };

  const preview=asset(item);

  if(editing&&preview.tagName==='IMG'){
    preview.loading='eager';
  }

  card.append(preview);

  if(editing){
    const form=node('form',undefined,'media-edit-form');
    const title=node('input');
    const caption=node('textarea');
    const titleLabel=node('label','Назва');
    const captionLabel=node('label','Підпис');

    title.value=item.title;
    title.required=true;
    title.maxLength=70;

    caption.value=item.caption;
    caption.maxLength=180;
    caption.rows=3;

    titleLabel.append(title);
    captionLabel.append(caption);

    const save=node(
      'button',
      item.published?'Зберегти зміни':'Зберегти чернетку',
      'button sage'
    );

    save.type='submit';

    actions.append(
      save,
      button('Скасувати',()=>swap(item,false))
    );

    form.append(status,titleLabel,captionLabel,actions);
    card.append(form);

    form.onsubmit=async e=>{
      e.preventDefault();

      const next={
        ...item,
        title:title.value.trim(),
        caption:caption.value.trim()
      };

      if(!next.title){
        title.value='';
        title.reportValidity();
        return;
      }

      for(const b of actions.children) b.disabled=true;

      try{
        if(await send('media',{
          id:item.id,
          action:'save',
          title:next.title,
          caption:next.caption
        },false)){
          swap(next,false);
        }
      }finally{
        for(const b of actions.children) b.disabled=false;
      }
    };
  }else{
    card.append(status,node('h3',item.title));

    if(item.caption){
      card.append(node('p',item.caption,'media-caption'));
    }

    const edit=button('Редагувати',()=>swap(item,true));

    const publish=button(
      item.published?'Приховати':'Опублікувати',
      async()=>{
        for(const b of actions.children) b.disabled=true;

        try{
          if(await send('media',{
            id:item.id,
            action:'publish',
            published:!item.published
          },false)){
            swap({...item,published:!item.published},false);
          }
        }finally{
          for(const b of actions.children) b.disabled=false;
        }
      }
    );

    const remove=button('Видалити',async()=>{
      if(!confirm('Видалити цей матеріал?')) return;

      for(const b of actions.children) b.disabled=true;

      try{
        if(await send('media',{
          id:item.id,
          action:'delete'
        },false)){
          card.remove();

          const box=by('opsMediaList');

          if(!box.children.length){
            empty(box,'Поки немає завантажених матеріалів.');
          }
        }
      }finally{
        for(const b of actions.children) b.disabled=false;
      }
    });

    actions.append(edit,publish,remove);
    card.append(actions);
  }

  return card;
}

async function send(view,body,reload=true){
  const notice=by('opsNotice');
  notice.textContent='Зберігаємо…';

  try{
    const result=await api(endpoint(view),{
      method:'POST',
      body:body instanceof FormData?body:JSON.stringify(body)
    });

    notice.textContent='Збережено ✓';

    if(reload) await load(view);

    return result||true;
  }catch(e){
    notice.textContent=e.message;
    return false;
  }
}

function bind(id,view,convert){
  by(id).onsubmit=async e=>{
    e.preventDefault();

    const form=e.currentTarget;
    const b=form.querySelector('button');
    b.disabled=true;

    try{
      const f=new FormData(form);

      if(await send(view,convert(f))){
        form.reset();
      }
    }finally{
      b.disabled=false;
    }
  };
}

bind('stockMoveForm','stock',f=>({
  id:f.get('id'),
  delta:Number(f.get('quantity'))*Number(f.get('direction')),
  supplier:f.get('supplier'),
  note:f.get('note'),
  cost:Math.round(Number(f.get('cost'))*100)
}));

bind('opsFinanceForm','finance',f=>({
  type:f.get('type'),
  amount:Math.round(Number(f.get('amount'))*100),
  note:f.get('note')
}));

by('opsMediaForm').onsubmit=async e=>{
  e.preventDefault();

  const form=e.currentTarget;
  const b=form.querySelector('button');
  b.disabled=true;

  try{
    const draft=await send('media',new FormData(form),false);

    if(draft){
      form.reset();

      const focus=await load('media',draft.id);

      if(focus&&!by('media').hidden){
        focus.focus();
      }
    }
  }finally{
    b.disabled=false;
  }
};

by('refreshOpsAudit').onclick=()=>load('audit');

async function gallery(){
  try{
    const rows=await api('/api/media');
    if(!rows.length) return;

    const box=by('opsPublicMedia');

    for(const item of rows){
      const card=node('article',undefined,'ops-media');

      card.append(
        asset(item),
        node('h3',item.title),
        node('p',item.caption)
      );

      box.append(card);
    }

    by('opsPublished').hidden=false;
  }catch{}
}

window.CafeOps={
  open(view){
    by('opsNotice').textContent='';
    load(view);
  }
};

if(document.body.dataset.page==='story') gallery();
if(state.workUnlocked) load(state.worktab);

})();
