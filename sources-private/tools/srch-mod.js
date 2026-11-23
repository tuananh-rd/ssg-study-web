// ===== Tra cứu nhanh (Google + Wikipedia ngay trong web) =====
var SR={el:null,open:false,q:'',lang:'en',seq:0};
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
  if(SR.el)return SR.el;var e=document.createElement('aside');e.id='srch';e.setAttribute('aria-label','Tra cứu nhanh');
  e.innerHTML='<div class="sr-head"><b>'+ic('search')+' Tra cứu nhanh</b><button type="button" class="iconbtn sm" id="srX" aria-label="Đóng">'+ic('close')+'</button></div>'+
    '<form id="srF" class="sr-form"><input id="srQ" type="search" placeholder="Gõ từ khoá hoặc bôi đen chữ rồi bấm Tra cứu…" autocomplete="off" aria-label="Từ khoá"><button class="btn primary" type="submit">Tìm</button></form>'+
    '<div class="sr-go"><button type="button" class="btn sm sr-g" data-k="g"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.400 13.900a6 6 0 0 1 0-3.800V7.500H3.100a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.800 1.500l2.800-2.800A10 10 0 0 0 3.100 7.500l3.300 2.600C7.200 7.800 9.400 6 12 6z"/></svg> Mở Google</button><button type="button" class="btn sm" data-k="i">Ảnh</button><button type="button" class="btn sm" data-k="t">Google Dịch</button><button type="button" class="btn sm" data-k="y">YouTube</button></div>'+
    '<div class="sr-tabs qlang"><button type="button" data-l="en" class="on">Wikipedia EN</button><button type="button" data-l="vi">Wikipedia VI</button></div>'+
    '<div class="sr-body" id="srB"><p class="muted small">Kết quả Wikipedia hiện ngay tại đây. Google không cho nhúng vào trang khác nên nút <b>Mở Google</b> mở một cửa sổ nhỏ bên cạnh, bạn vẫn ở lại bài đang làm.</p></div>';
  document.body.appendChild(e);SR.el=e;
  e.querySelector('#srX').onclick=function(){srToggle(false);};
  e.querySelector('#srF').onsubmit=function(ev){ev.preventDefault();srRun(e.querySelector('#srQ').value);};
  [].forEach.call(e.querySelectorAll('.sr-go [data-k]'),function(b){b.onclick=function(){var q=e.querySelector('#srQ').value||SR.q;if(!q.trim()){e.querySelector('#srQ').focus();return;}srGoogle(q,b.dataset.k);};});
  [].forEach.call(e.querySelectorAll('.sr-tabs [data-l]'),function(b){b.onclick=function(){SR.lang=b.dataset.l;[].forEach.call(e.querySelectorAll('.sr-tabs [data-l]'),function(x){x.classList.toggle('on',x===b);});if(SR.q)srRun(SR.q);};});
  return e;
}
function srToggle(on){
  var e=srEl();SR.open=on===undefined?!SR.open:!!on;e.classList.toggle('open',SR.open);
  if(SR.open)setTimeout(function(){var i=e.querySelector('#srQ');if(i){i.focus();i.select();}},60);
}
function srOpen(q){
  srToggle(true);var e=srEl();q=(q||'').replace(/\s+/g,' ').trim().slice(0,200);
  if(q){e.querySelector('#srQ').value=q;srRun(q);}
}
function srPlain(s){var d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||'';}
function srRun(q){
  q=(q||'').trim();if(!q)return;SR.q=q;var my=++SR.seq,b=srEl().querySelector('#srB'),host=SR.lang+'.wikipedia.org';
  b.innerHTML='<p class="muted small">Đang tìm “'+esc(q)+'”…</p>';
  fetch('https://'+host+'/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=6&format=json&origin=*').then(function(r){return r.json();}).then(function(j){
    if(my!==SR.seq)return;var rs=(j.query&&j.query.search)||[];
    if(!rs.length){b.innerHTML='<p class="muted small">Wikipedia không có kết quả cho “'+esc(q)+'”. Thử nút <b>Mở Google</b> ở trên.</p>';return;}
    b.innerHTML=rs.map(function(x,i){return '<div class="sr-item"><a href="https://'+host+'/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_'))+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+'</a><div class="small">'+esc(srPlain(x.snippet))+'…</div>'+(i===0?'<div class="sr-sum small muted" id="srSum"></div>':'')+'</div>';}).join('');
    fetch('https://'+host+'/api/rest_v1/page/summary/'+encodeURIComponent(rs[0].title.replace(/ /g,'_'))).then(function(r){return r.json();}).then(function(s){
      if(my!==SR.seq||!s||!s.extract)return;var el=document.getElementById('srSum');if(el)el.innerHTML='<b>Tóm tắt:</b> '+esc(s.extract.slice(0,600))+(s.extract.length>600?'…':'');}).catch(function(){});
  }).catch(function(){if(my===SR.seq)b.innerHTML='<p class="muted small">Không tải được Wikipedia (kiểm tra mạng). Bạn vẫn có thể bấm <b>Mở Google</b>.</p>';});
}
setTimeout(function(){try{var f=document.createElement('button');f.type='button';f.className='srch-fab';f.setAttribute('aria-label','Tra cứu nhanh');f.innerHTML=ic('search')+'<span>Tra cứu</span>';f.onclick=function(){srToggle();};document.body.appendChild(f);}catch(e){console.error(e);}},0);
