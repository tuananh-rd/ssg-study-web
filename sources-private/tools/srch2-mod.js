// ===== Tra cứu nhanh (giao diện kiểu Google, dữ liệu Wikipedia/Wikimedia ngay trong web) =====
var SR={el:null,open:false,q:'',lang:'en',tab:'all',seq:0};
function srGoogle(q,kind){
  q=(q||'').trim();if(!q)return;
  var urls={g:'https://www.google.com/search?q=',t:'https://translate.google.com/?sl=en&tl=vi&op=translate&text=',y:'https://www.youtube.com/results?search_query=',i:'https://www.google.com/search?tbm=isch&q='};
  var u=urls[kind||'g']+encodeURIComponent(q);
  FC.keepUntil=Date.now()+2500;
  var sw=(window.screen&&screen.availWidth)||1200,sh=(window.screen&&screen.availHeight)||800,w=Math.min(560,Math.round(sw*.42)),f='popup=yes,width='+w+',height='+(sh-90)+',left='+(sw-w-10)+',top=30,noopener,noreferrer';
  var win=null;try{win=window.open(u,'tracuu_'+(kind||'g'),f);}catch(e){}
  if(!win)window.open(u,'_blank','noopener');
}
function srEl(){
  if(SR.el)return SR.el;var e=document.createElement('div');e.id='srch';e.setAttribute('role','dialog');e.setAttribute('aria-label','Tra cứu nhanh');
  var wm='Tra cứu'.split('').map(function(c,i){return '<i style="color:'+['#4285f4','#ea4335','#fbbc05','#4285f4','#34a853','#ea4335','#4285f4'][i%7]+'">'+(c===' '?'&nbsp;':c)+'</i>';}).join('');
  e.innerHTML='<div class="sr-win"><div class="sr-top"><div class="sr-logo">'+wm+'</div>'+
    '<form id="srF" class="sr-bar"><span class="sr-bi">'+ic('search')+'</span><input id="srQ" type="search" placeholder="Tìm trên Wikipedia hoặc gõ từ khoá…" autocomplete="off" aria-label="Từ khoá"><button type="button" class="sr-clr" id="srC" aria-label="Xoá" hidden>'+ic('close')+'</button><button class="sr-go" type="submit" aria-label="Tìm">'+ic('search')+'</button></form>'+
    '<button type="button" class="iconbtn" id="srX" aria-label="Đóng">'+ic('close')+'</button></div>'+
    '<div class="sr-nav"><div class="sr-tabs" role="tablist"><button type="button" data-t="all" class="on">Tất cả</button><button type="button" data-t="img">Hình ảnh</button></div>'+
    '<div class="sr-ext"><span class="sr-lg qlang"><button type="button" data-l="en" class="on">EN</button><button type="button" data-l="vi">VI</button></span><button type="button" class="sr-link" data-k="g">Mở Google ↗</button><button type="button" class="sr-link" data-k="t">Dịch ↗</button><button type="button" class="sr-link" data-k="y">YouTube ↗</button></div></div>'+
    '<div class="sr-body" id="srB"></div></div>';
  document.body.appendChild(e);SR.el=e;var q=e.querySelector('#srQ');
  srHome();
  e.querySelector('#srX').onclick=function(){srToggle(false);};
  e.addEventListener('mousedown',function(ev){if(ev.target===e)srToggle(false);});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&SR.open){ev.stopPropagation();srToggle(false);}},true);
  e.querySelector('#srF').onsubmit=function(ev){ev.preventDefault();srRun(q.value);};
  q.oninput=function(){e.querySelector('#srC').hidden=!q.value;};
  e.querySelector('#srC').onclick=function(){q.value='';this.hidden=true;q.focus();};
  [].forEach.call(e.querySelectorAll('.sr-link'),function(b){b.onclick=function(){var t=q.value||SR.q;if(!t.trim()){q.focus();return;}srGoogle(t,b.dataset.k);};});
  [].forEach.call(e.querySelectorAll('.sr-tabs [data-t]'),function(b){b.onclick=function(){SR.tab=b.dataset.t;srMark();if(SR.q)srRun(SR.q);};});
  [].forEach.call(e.querySelectorAll('.sr-lg [data-l]'),function(b){b.onclick=function(){SR.lang=b.dataset.l;srMark();if(SR.q)srRun(SR.q);};});
  return e;
}
function srMark(){var e=SR.el;[].forEach.call(e.querySelectorAll('.sr-tabs [data-t]'),function(b){b.classList.toggle('on',b.dataset.t===SR.tab);});[].forEach.call(e.querySelectorAll('.sr-lg [data-l]'),function(b){b.classList.toggle('on',b.dataset.l===SR.lang);});}
function srHome(){var b=SR.el.querySelector('#srB');b.innerHTML='<div class="sr-home"><p>Gõ thuật ngữ cần tra, hoặc bôi đen chữ trong bài rồi bấm <b>Tra cứu</b>.</p><div class="sr-sug">'+['Harris corner detector','eigenvalue','logistic regression','random forest','convolution','gradient descent'].map(function(s){return '<button type="button" class="sr-chip" data-s="'+esc(s)+'">'+esc(s)+'</button>';}).join('')+'</div><p class="small muted">Giao diện kiểu Google, kết quả lấy từ Wikipedia và Wikimedia Commons. Google thật không cho nhúng vào trang khác nên nút <b>Mở Google</b> sẽ mở cửa sổ nhỏ bên cạnh.</p></div>';
  [].forEach.call(b.querySelectorAll('[data-s]'),function(x){x.onclick=function(){SR.el.querySelector('#srQ').value=x.dataset.s;srRun(x.dataset.s);};});}
function srToggle(on){
  var e=srEl();SR.open=on===undefined?!SR.open:!!on;e.classList.toggle('open',SR.open);document.body.classList.toggle('sr-open',SR.open);
  if(SR.open)setTimeout(function(){var i=e.querySelector('#srQ');if(i){i.focus();i.select();}},60);
}
function srOpen(q){
  srToggle(true);var e=srEl();q=(q||'').replace(/\s+/g,' ').trim().slice(0,200);
  if(q){e.querySelector('#srQ').value=q;e.querySelector('#srC').hidden=false;srRun(q);}
}
function srPlain(s){var d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||'';}
function srHost(){return SR.lang+'.wikipedia.org';}
function srImgs(q,my,cb){
  fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch='+encodeURIComponent(q)+'&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=400&format=json&origin=*').then(function(r){return r.json();}).then(function(j){
    if(my!==SR.seq)return;var ps=j.query?Object.keys(j.query.pages).map(function(k){return j.query.pages[k];}):[];
    ps=ps.filter(function(p){var i=p.imageinfo&&p.imageinfo[0];return i&&i.thumburl&&/^image\/(jpeg|png|webp)/.test(i.mime||'');}).sort(function(a,b){return (a.index||0)-(b.index||0);});
    cb(ps.map(function(p){return {t:p.title.replace(/^File:/,'').replace(/\.[a-z]+$/i,''),u:p.imageinfo[0].thumburl,l:p.imageinfo[0].descriptionurl,w:p.imageinfo[0].thumbwidth,h:p.imageinfo[0].thumbheight};}));
  }).catch(function(){cb([]);});
}
function srRun(q){
  q=(q||'').trim();if(!q)return;SR.q=q;var my=++SR.seq,b=srEl().querySelector('#srB'),host=srHost();
  b.innerHTML='<div class="sr-load"><i></i><i></i><i></i></div>';
  if(SR.tab==='img'){
    srImgs(q,my,function(im){
      if(my!==SR.seq)return;
      b.innerHTML=im.length?'<div class="sr-grid">'+im.map(function(x){return '<a class="sr-im" href="'+esc(x.l)+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.t)+'"><img loading="lazy" src="'+esc(x.u)+'" alt="'+esc(x.t)+'"><span>'+esc(x.t.slice(0,60))+'</span></a>';}).join('')+'</div><p class="small muted">Ảnh từ Wikimedia Commons (nguồn mở). Bấm vào ảnh để xem nguồn và giấy phép.</p>':'<p class="muted">Không tìm thấy hình ảnh cho “'+esc(q)+'”. Thử nút <b>Mở Google</b> ở trên.</p>';
    });return;
  }
  fetch('https://'+host+'/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=10&srinfo=suggestion&format=json&origin=*').then(function(r){return r.json();}).then(function(j){
    if(my!==SR.seq)return;var rs=(j.query&&j.query.search)||[],sug=j.query&&j.query.searchinfo&&j.query.searchinfo.suggestion;
    if(!rs.length){b.innerHTML='<p class="muted">Không có kết quả nào khớp với “'+esc(q)+'”.'+(sug?' Có phải ý bạn là <a href="#" data-s="'+esc(sug)+'">'+esc(sug)+'</a>?':'')+'</p><p class="small muted">Thử đổi EN/VI hoặc bấm <b>Mở Google</b> ở trên.</p>';var a=b.querySelector('[data-s]');if(a)a.onclick=function(ev){ev.preventDefault();srEl().querySelector('#srQ').value=sug;srRun(sug);};return;}
    var res=rs.map(function(x){var url='https://'+host+'/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_'));return '<div class="sr-res"><div class="sr-site"><span class="sr-fav">W</span><span><b>Wikipedia</b><span class="sr-crumb">'+esc(host+' › wiki › '+x.title.replace(/ /g,'_'))+'</span></span></div><a class="sr-t" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+'</a><div class="sr-s">'+esc(srPlain(x.snippet))+'…</div></div>';}).join('');
    b.innerHTML=(sug?'<div class="sr-dym">Có phải ý bạn là: <a href="#" data-s="'+esc(sug)+'"><i>'+esc(sug)+'</i></a></div>':'')+'<div class="sr-imgs" id="srIm"></div><div class="sr-cols"><div class="sr-list">'+res+'</div><aside class="sr-kp" id="srKp"></aside></div>';
    var dm=b.querySelector('.sr-dym a');if(dm)dm.onclick=function(ev){ev.preventDefault();srEl().querySelector('#srQ').value=sug;srRun(sug);};
    srImgs(q,my,function(im){var el=document.getElementById('srIm');if(!el||my!==SR.seq||!im.length)return;
      el.innerHTML='<div class="sr-strip">'+im.slice(0,8).map(function(x){return '<a href="'+esc(x.l)+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.t)+'"><img loading="lazy" src="'+esc(x.u)+'" alt="'+esc(x.t)+'"></a>';}).join('')+'</div><button type="button" class="sr-more" id="srMore">Xem thêm hình ảnh →</button>';
      var m=document.getElementById('srMore');if(m)m.onclick=function(){SR.tab='img';srMark();srRun(q);};});
    fetch('https://'+host+'/api/rest_v1/page/summary/'+encodeURIComponent(rs[0].title.replace(/ /g,'_'))).then(function(r){return r.json();}).then(function(s){
      var el=document.getElementById('srKp');if(my!==SR.seq||!el||!s||!s.extract)return;
      el.innerHTML=(s.thumbnail?'<img class="sr-kimg" src="'+esc(s.thumbnail.source)+'" alt="'+esc(s.title)+'">':'')+'<div class="sr-kb"><h3>'+esc(s.title)+'</h3>'+(s.description?'<div class="sr-kd">'+esc(s.description)+'</div>':'')+'<p>'+esc(s.extract.slice(0,520))+(s.extract.length>520?'…':'')+'</p>'+(s.content_urls?'<a href="'+esc(s.content_urls.desktop.page)+'" target="_blank" rel="noopener noreferrer">Wikipedia ↗</a>':'')+'</div>'+
        (rs.length>1?'<div class="sr-rel"><b>Tìm kiếm liên quan</b>'+rs.slice(1,6).map(function(x){return '<button type="button" data-s="'+esc(x.title)+'">'+esc(x.title)+'</button>';}).join('')+'</div>':'');
      [].forEach.call(el.querySelectorAll('[data-s]'),function(x){x.onclick=function(){srEl().querySelector('#srQ').value=x.dataset.s;srRun(x.dataset.s);};});
    }).catch(function(){});
  }).catch(function(){if(my===SR.seq)b.innerHTML='<p class="muted">Không tải được kết quả (kiểm tra mạng). Bạn vẫn có thể bấm <b>Mở Google</b> ở trên.</p>';});
}
setTimeout(function(){try{var f=document.createElement('button');f.type='button';f.className='srch-fab';f.setAttribute('aria-label','Tra cứu nhanh');f.innerHTML=ic('search')+'<span>Tra cứu</span>';f.onclick=function(){srToggle();};document.body.appendChild(f);}catch(e){console.error(e);}},0);
