import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

// 1) nhãn điều hướng có span để thu gọn được, kèm title
rep('navlabel', `'<nav id="nav">'+NAV.map(function(n){return '<a href="'+n[1]+'" data-r="'+n[0]+'">'+ic(n[3])+n[2]+`, `'<nav id="nav">'+NAV.map(function(n){return '<a href="'+n[1]+'" data-r="'+n[0]+'" title="'+n[2]+'">'+ic(n[3])+'<span class="nl">'+n[2]+'</span>'+`);

// 2) tuỳ chỉnh giao diện
rep('look', `function applyTheme(){`, String.raw`// ---------- tuỳ chỉnh giao diện (dùng chung mọi môn, lưu trên trình duyệt) ----------
var LOOK_ACCENTS=[['indigo','Chàm','#2f4bd1','#8499ff'],['teal','Ngọc','#0f8a6c','#4fd1a5'],['violet','Tím','#6d3fd1','#a78bfa'],['rose','Hồng','#c2255c','#f783ac'],['amber','Cam','#c2410c','#ffa94d'],['ocean','Biển','#0b7285','#66d9e8'],['slate','Than','#334155','#cbd5e1']];
function lookGet(){var d={accent:'indigo',size:'md',density:'comfy',radius:'round',dim:55,glass:88};try{return Object.assign(d,JSON.parse(localStorage.getItem('ui_look'))||{});}catch(e){return d;}}
function lookSet(v){try{localStorage.setItem('ui_look',JSON.stringify(v));}catch(e){}applyLook();}
function lookBg(){try{return localStorage.getItem('ui_bg')||'';}catch(e){return '';}}
function applyLook(){
  var L=lookGet(),acc=LOOK_ACCENTS.filter(function(x){return x[0]===L.accent;})[0]||LOOK_ACCENTS[0],bg=lookBg(),st=document.getElementById('look-css');
  if(!st){st=document.createElement('style');st.id='look-css';document.head.appendChild(st);}
  var css=':root{--primary:'+acc[2]+';--primary-2:color-mix(in srgb,'+acc[2]+' 82%,#fff);--primary-soft:color-mix(in srgb,'+acc[2]+' 11%,var(--panel))}'+
    ':root[data-theme=dark]{--primary:'+acc[3]+';--primary-2:color-mix(in srgb,'+acc[3]+' 80%,#fff);--primary-ink:#0b1020;--primary-soft:color-mix(in srgb,'+acc[3]+' 16%,var(--panel))}'+
    'html{font-size:'+({sm:'15px',md:'16px',lg:'17.5px'}[L.size]||'16px')+'}';
  if(L.radius==='sharp')css+=':root{--r:8px}.card,.opt,.btn,.seg,.keybox,.sec,.stat{border-radius:8px!important}';
  if(L.density==='compact')css+='.card{padding:14px 16px}.opt{padding:10px 14px}#content{padding-top:16px}.prose{line-height:1.65}';
  if(bg){
    css+='body{background:transparent}body:before{content:"";position:fixed;inset:0;z-index:-2;background:url('+JSON.stringify(bg)+') center/cover no-repeat}'+
      'body:after{content:"";position:fixed;inset:0;z-index:-1;background:var(--bg);opacity:'+(L.dim/100)+'}'+
      '.card,.stat,.sec,.keycard,.opt,.dprofile,#top,#nav,#bottom,.dock,.pl-card,.player-pill,.award{background:color-mix(in srgb,var(--panel) '+L.glass+'%,transparent)!important;backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)}';
  }
  st.textContent=css;
}
function readBgFile(f){
  return new Promise(function(res,rej){
    if(!f||!/^image\//.test(f.type))return rej(new Error('Hãy chọn một file ảnh (JPG, PNG, WebP).'));
    if(f.size>20*1024*1024)return rej(new Error('Ảnh quá lớn (tối đa 20 MB).'));
    var r=new FileReader();r.onerror=function(){rej(new Error('Không đọc được file ảnh.'));};
    r.onload=function(){var im=new Image();im.onerror=function(){rej(new Error('File ảnh không hợp lệ.'));};
      im.onload=function(){var k=Math.min(1,1920/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);var q=.82,u=c.toDataURL('image/jpeg',q);while(u.length>2600000&&q>.4){q-=.12;u=c.toDataURL('image/jpeg',q);}res(u);};
      im.src=r.result;};
    r.readAsDataURL(f);
  });
}
function lookPanel(m){
  var L=lookGet(),bg=lookBg(),box=$('#lookbox',m);if(!box)return;
  box.innerHTML='<div class="look-row"><span>Màu chủ đạo</span><div class="look-acc">'+LOOK_ACCENTS.map(function(x){return '<button type="button" class="la'+(L.accent===x[0]?' on':'')+'" data-la="'+x[0]+'" title="'+x[1]+'" style="--c:'+x[2]+'"></button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Cỡ chữ</span><div class="seg">'+[['sm','Nhỏ'],['md','Vừa'],['lg','Lớn']].map(function(x){return '<button type="button" data-ls="'+x[0]+'" class="'+(L.size===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Mật độ</span><div class="seg">'+[['comfy','Thoáng'],['compact','Gọn']].map(function(x){return '<button type="button" data-ld="'+x[0]+'" class="'+(L.density===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Góc bo</span><div class="seg">'+[['round','Mềm'],['sharp','Vuông']].map(function(x){return '<button type="button" data-lr="'+x[0]+'" class="'+(L.radius===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-bg"><div class="look-thumb"'+(bg?' style="background-image:url('+bg+')"':'')+'>'+(bg?'':'<span>Chưa có ảnh nền</span>')+'</div><div style="flex:1;min-width:0">'+
      '<div class="row" style="gap:6px"><label class="btn sm primary">Tải ảnh nền<input type="file" id="lbgf" accept="image/*" hidden></label>'+(bg?'<button type="button" class="btn sm" id="lbgx">Bỏ ảnh nền</button>':'')+'</div>'+
      '<p class="small muted" style="margin:6px 0 0">Ảnh được thu nhỏ và chỉ lưu trên trình duyệt này.</p>'+
      (bg?'<label class="look-range">Độ mờ phủ lên ảnh <b>'+L.dim+'%</b><input type="range" min="0" max="90" step="5" value="'+L.dim+'" id="ldim"></label><label class="look-range">Độ đặc của thẻ <b>'+L.glass+'%</b><input type="range" min="40" max="100" step="4" value="'+L.glass+'" id="lgl"></label>':'')+
    '</div></div><div class="row" style="justify-content:flex-end;margin-top:10px"><button type="button" class="btn sm ghost" id="lreset">Khôi phục mặc định</button></div>';
  function set(k,v){var x=lookGet();x[k]=v;lookSet(x);lookPanel(m);}
  $$('[data-la]',box).forEach(function(b){b.onclick=function(){set('accent',b.dataset.la);};});
  $$('[data-ls]',box).forEach(function(b){b.onclick=function(){set('size',b.dataset.ls);};});
  $$('[data-ld]',box).forEach(function(b){b.onclick=function(){set('density',b.dataset.ld);};});
  $$('[data-lr]',box).forEach(function(b){b.onclick=function(){set('radius',b.dataset.lr);};});
  var dm=$('#ldim',box);if(dm)dm.oninput=function(){var x=lookGet();x.dim=+dm.value;lookSet(x);dm.previousElementSibling.textContent=dm.value+'%';};
  var gl=$('#lgl',box);if(gl)gl.oninput=function(){var x=lookGet();x.glass=+gl.value;lookSet(x);gl.previousElementSibling.textContent=gl.value+'%';};
  $('#lbgf',box).onchange=function(){var f=this.files[0];readBgFile(f).then(function(u){try{localStorage.setItem('ui_bg',u);}catch(e){toast('Không lưu được ảnh: bộ nhớ trình duyệt đã đầy.');return;}applyLook();lookPanel(m);toast('Đã đặt ảnh nền');},function(e){toast(e.message);});};
  var bx=$('#lbgx',box);if(bx)bx.onclick=function(){try{localStorage.removeItem('ui_bg');}catch(e){}applyLook();lookPanel(m);};
  $('#lreset',box).onclick=function(){try{localStorage.removeItem('ui_look');localStorage.removeItem('ui_bg');}catch(e){}applyLook();lookPanel(m);};
}
function applyTheme(){`);

// 3) bảng cài đặt: thêm mục Giao diện, sửa chữ sao lưu khi dùng web
rep('setmodal', `'<label class="small muted" style="display:block;margin-bottom:4px">Giao diện</label><div class="seg" id="th">'`, `'<label class="small muted" style="display:block;margin-bottom:4px">Chế độ sáng/tối</label><div class="seg" id="th">'`);
rep('setmodal2', `'<h3>Sao lưu tiến độ</h3><p class="small muted" style="margin-top:0">Tiến độ lưu trong trình duyệt của máy này. Muốn chuyển máy: xuất file ở đây, nhập ở máy kia.</p>`, `'<h3>Tuỳ chỉnh giao diện</h3><div id="lookbox"></div><h3>Sao lưu tiến độ</h3><p class="small muted" style="margin-top:0">'+(window.AI_SERVER?'Tiến độ tự đồng bộ theo tài khoản. Bạn vẫn có thể xuất file để lưu riêng.':'Tiến độ lưu trong trình duyệt của máy này. Muốn chuyển máy: xuất file ở đây, nhập ở máy kia.')+'</p>`);
rep('setinit', `  var m=$('#modal');
  $('#sd',m).onchange=`, `  var m=$('#modal');lookPanel(m);
  $('#sd',m).onchange=`);
rep('boot', `load();shell();applyTheme();`, `load();shell();applyTheme();applyLook();`);
fs.writeFileSync(W + 'app.js', a);

fs.appendFileSync(W + 'style.css', String.raw`
/* ===== Khung ứng dụng v7: thanh bên trái trên máy tính ===== */
@media(min-width:1000px){
  #top .in{max-width:none;padding:10px 20px}
  #top .in>.brand{margin-right:auto}
  #nav{position:fixed;top:61px;left:0;bottom:0;width:224px;flex-direction:column;gap:2px;padding:16px 12px;border-right:1px solid var(--line);background:var(--panel);overflow-y:auto;overflow-x:hidden;z-index:20;flex:none}
  #nav a{padding:10px 12px;font-size:.95em;gap:10px}
  #nav a svg{width:18px;height:18px}
  #nav a .badge{margin-left:auto}
  #content{--cw:900px;max-width:var(--cw);margin-right:0;margin-left:calc(224px + (100% - 224px - min(var(--cw), 100% - 224px)) / 2)}
  #content:has(.lesson),#content:has(.duel-layout){--cw:1120px}
  body.dock-open #content{margin-right:0}
}
@media(min-width:761px) and (max-width:999px){#nav a .nl{display:none}#nav a{padding:8px 10px}#nav{overflow:visible}}
#nav a.on svg{color:var(--primary)}
/* bảng tuỳ chỉnh giao diện */
#modal .box:has(#lookbox){max-width:560px}
.look-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 0;flex-wrap:wrap}.look-row>span{font-size:.9rem;color:var(--muted)}
.look-acc{display:flex;gap:8px;flex-wrap:wrap}.la{width:28px;height:28px;border-radius:50%;background:var(--c);border:3px solid var(--panel);box-shadow:0 0 0 1px var(--line);cursor:pointer}.la.on{box-shadow:0 0 0 2px var(--text)}
.look-bg{display:flex;gap:14px;align-items:flex-start;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.look-thumb{width:120px;height:80px;border-radius:10px;border:1px dashed var(--line);background:var(--panel2) center/cover;display:grid;place-items:center;flex:none}.look-thumb span{font-size:.75rem;color:var(--muted);text-align:center;padding:4px}
.look-range{display:block;font-size:.85rem;color:var(--muted);margin-top:10px}.look-range input{width:100%;accent-color:var(--primary)}
/* nền màu theo màu chủ đạo */
.hero{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 62%,#0b1020) 0%,var(--primary) 100%)!important}
.duel-hero{background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 55%,#0b1020) 0%,var(--primary) 70%,color-mix(in srgb,var(--primary) 70%,#fff) 100%)}
.hero .btn{color:color-mix(in srgb,var(--primary) 75%,#000)}.hero .btn.ghost{color:#fff}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
