/* Fill the styled workbook template with the measured café results. */
(function(root){
'use strict';
const encoder=new TextEncoder(),decoder=new TextDecoder();
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
function unpack(buffer){const bytes=new Uint8Array(buffer),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),files=[];let offset=0;
 while(offset+30<=bytes.length&&view.getUint32(offset,true)===0x04034b50){const flags=view.getUint16(offset+6,true),method=view.getUint16(offset+8,true),size=view.getUint32(offset+18,true),nameSize=view.getUint16(offset+26,true),extraSize=view.getUint16(offset+28,true),start=offset+30+nameSize+extraSize;if(method!==0||(flags&8)||start+size>bytes.length)throw Error('Не вдалося прочитати шаблон Excel. Онови сторінку.');files.push({name:decoder.decode(bytes.slice(offset+30,offset+30+nameSize)),data:bytes.slice(start,start+size)});offset=start+size;}
 if(!files.length)throw Error('Шаблон Excel недоступний. Спробуй ще раз.');return files;
}
function pack(files){const chunks=[],central=[];let offset=0,centralSize=0;
 for(const file of files){const name=encoder.encode(file.name),data=file.data,crc=crc32(data),local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(12,0x21,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);
 const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(14,0x21,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);c.set(name,46);chunks.push(local,data);central.push(c);offset+=local.length+data.length;centralSize+=c.length;}
 const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
 return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function fillSheet(sheet,m){
 const median=k=>m.records.map(r=>r[k]).sort((a,b)=>a-b)[1],seq=median('seq'),par=median('par');
 const source=m.source==='database'?'Замовлення гостей нашої кав’ярні':'Тестові продажі кав’ярні';
 const when=new Intl.DateTimeFormat('uk-UA',{timeZone:'Europe/Kyiv',dateStyle:'short',timeStyle:'short'}).format(new Date(m.measuredAt||Date.now()));
 const cells={A4:'Джерело: '+source,A5:m.source==='database'?m.orderCount+' замовлень · '+m.rows+' записів':m.rows+' тестових записів',C7:m.rows,F7:m.workers,C8:(m.summary?.revenue||0)/100,F8:m.summary?.qty||0,C16:seq,D16:par,E16:par?seq/par:'',F16:m.exact?'Так':'Ні',A21:'Сформовано: '+when+' · Київ'};
 m.records.forEach((r,i)=>{const row=12+i;Object.assign(cells,{['A'+row]:r.run,['B'+row]:r.order==='parallel-first'?'Спочатку кілька потоків':'Спочатку один потік',['C'+row]:r.seq,['D'+row]:r.par,['E'+row]:r.par?r.seq/r.par:'',['F'+row]:(r.exact??m.exact)?'Так':'Ні'});});
 for(const [ref,value]of Object.entries(cells)){
  const regex=new RegExp('<(x:)?c\\b([^>]*\\br="'+ref+'"[^>]*)(?:\\s*/>|>([\\s\\S]*?)</(?:x:)?c>)');let found=false;
  sheet=sheet.replace(regex,(_,prefix='',attrs,inner='')=>{found=true;attrs=attrs.replace(/\s+t="[^"]*"/g,'').replace(/\s*\/$/,'');const formula=inner.match(/<(?:x:)?f\b[^>]*>[\s\S]*?<\/(?:x:)?f>/)?.[0]||'';return '<'+prefix+'c'+attrs+(typeof value==='number'?'':' t="str"')+'>'+formula+'<'+prefix+'v>'+xml(value)+'</'+prefix+'v></'+prefix+'c>';});
  if(!found)throw Error('Шаблон Excel потребує оновлення. Онови сторінку.');
 }
 return sheet;
}
function fromTemplate(buffer,m){if(!m||m.records?.length!==3||!m.records.every(r=>Number.isFinite(r.seq)&&Number.isFinite(r.par)))throw Error('Спочатку запусти експеримент.');const files=unpack(buffer),sheet=files.find(f=>f.name==='xl/worksheets/sheet1.xml');if(!sheet)throw Error('Шаблон Excel недоступний.');sheet.data=encoder.encode(fillSheet(decoder.decode(sheet.data),m));return pack(files);}
async function build(m){const r=await fetch('assets/measurement-template.xlsx?v=system-excel-v42');if(!r.ok)throw Error('Не вдалося завантажити шаблон Excel. Спробуй ще раз.');return fromTemplate(await r.arrayBuffer(),m);}
root.CafeMeasurementExport={build,fromTemplate};
})(globalThis);
