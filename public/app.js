(function(){var f=document.getElementById('enq');if(!f)return;var m=f.querySelector('.msg');f.addEventListener('submit',function(e){e.preventDefault();if(!f.checkValidity()){f.reportValidity();return}m.textContent='Sending...';var b={};['name','email','phone','service','message'].forEach(function(k){b[k]=f.elements[k].value});
fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){return{r:r,j:j}})}).then(function(x){if(x.r.ok&&x.j.ok===true){f.reset();m.textContent='Thank you. We have your enquiry and will reply soon.'}else m.textContent=x.j.fieldErrors?Object.values(x.j.fieldErrors).join(' '):'We could not send your enquiry. Please call or WhatsApp us.'}).catch(function(){m.textContent='We could not send your enquiry. Please call or WhatsApp us.'})})})();
(function(){var s=document.querySelector('.stage svg');if(!s)return;var cn=document.querySelector('.stage .cn'),cl=document.querySelector('.stage .cl'),T=[];
function hi(a){T.forEach(clearTimeout);s.classList.add('act');s.querySelectorAll('.part').forEach(function(p){p.classList.toggle('on',p.dataset.p===a.dataset.p)});cn.innerHTML='<b>'+a.dataset.n+'</b>';cl.textContent=a.dataset.l}
document.querySelectorAll('.sl a').forEach(function(a){a.addEventListener('mouseenter',function(){hi(a)});a.addEventListener('focus',function(){hi(a)})});
var st=[[0,'Excavating the site'],[.9,'Pouring the footing'],[1.3,'Raising the columns'],[2.6,'Casting the slabs'],[3.4,'Floors and paving'],[4.2,'Ceilings and interiors'],[4.8,'Painting'],[5.7,'Handed over. Hover a service.']];
function play(){T.forEach(clearTimeout);T=[];s.classList.remove('go','act');s.querySelectorAll('.part.on').forEach(function(p){p.classList.remove('on')});void s.getBoundingClientRect();s.classList.add('go');
st.forEach(function(x,i){T.push(setTimeout(function(){cn.innerHTML='<b>'+x[1]+'</b>';cl.textContent=i<st.length-1?'Stage '+(i+1)+' of '+(st.length-1):''},x[0]*1000))})}
window.playBuild=play;var r=document.querySelector('.rp');if(r)r.addEventListener('click',play);play()})();
(function(){var gd=document.getElementById('gdata');if(!gd)return;var D=JSON.parse(gd.textContent);
function L(u){return window.PV?(u==='/'?'#home':'#'+u.split('/').join('')):u}
function ph(d,n,t){return '<div class="ph2" style="--h:'+((d.h+n*23)%360)+'">'+(t?'':'<span>Project photo '+(n+1)+'<br><small>Replace with a real image</small></span>')+'</div>'}
function pic(d,n,t){return d.s[n]?'<img src="'+d.s[n]+'" alt="'+d.t+' photo '+(n+1)+'" loading="lazy">':ph(d,n,t)}
function slider(host,d){var N=d.s.length||d.n,i=0,k,h='<div class="sv" tabindex="0" role="group" aria-roledescription="carousel" aria-label="'+d.t+' photos">';
for(k=0;k<N;k++)h+='<div class="gs'+(k?'':' on')+'">'+pic(d,k)+'</div>';
h+='<span class="ct"></span><button type="button" class="bp" aria-label="Previous photo">&#8249;</button><button type="button" class="bn" aria-label="Next photo">&#8250;</button><div class="dots">';
for(k=0;k<N;k++)h+='<i></i>';h+='</div></div><div class="th">';
for(k=0;k<N;k++)h+='<button type="button" aria-label="Show photo '+(k+1)+'">'+pic(d,k,1)+'</button>';
host.innerHTML=h+'</div>';
var gs=host.querySelectorAll('.gs'),dt=host.querySelectorAll('.dots i'),tb=host.querySelectorAll('.th button'),ct=host.querySelector('.ct'),th=host.querySelector('.th'),sv=host.querySelector('.sv');
function show(n){i=(n+N)%N;for(var k=0;k<N;k++){var o=k===i;gs[k].classList.toggle('on',o);dt[k].classList.toggle('on',o);tb[k].classList.toggle('on',o)}ct.textContent=(i+1)+' / '+N;th.scrollLeft=tb[i].offsetLeft-th.clientWidth/2+tb[i].clientWidth/2}
host.querySelector('.bp').onclick=function(){show(i-1)};host.querySelector('.bn').onclick=function(){show(i+1)};
tb.forEach(function(b,k){b.onclick=function(){show(k)}});
var x0=null;sv.addEventListener('pointerdown',function(e){x0=e.clientX});sv.addEventListener('pointerup',function(e){if(x0!==null&&Math.abs(e.clientX-x0)>40)show(i+(e.clientX<x0?1:-1));x0=null});
host.go=function(n){show(i+n)};show(0);return host}
var w=document.getElementById('work');if(w&&D.work)slider(w,D.work);
var gm=document.getElementById('gm'),pn=gm.querySelector('.gm-panel'),last=null,cur=null,busy=0;
function open(k,from){var d=D[k];if(!d||busy)return;last=from||document.activeElement;gm.querySelector('#gm-t').textContent=d.t;cur=slider(gm.querySelector('.gm-s'),d);
gm.querySelector('.gm-i').innerHTML='<p class="gm-l">'+d.d+'</p><ul class="tick">'+d.i.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><div class="row"><a class="btn" href="'+L('/contact/')+'">Enquire about this service</a><a class="btn o" href="'+L(d.u)+'">Full service page</a></div>';
gm.hidden=false;void gm.offsetWidth;gm.classList.add('open');document.documentElement.style.overflow='hidden';setTimeout(function(){pn.focus()},150)}
function close(){if(!gm.classList.contains('open'))return;gm.classList.remove('open');busy=1;setTimeout(function(){gm.hidden=true;busy=0;document.documentElement.style.overflow='';if(last&&last.focus)last.focus()},900)}
gm.addEventListener('click',function(e){if(e.target===gm||e.target.classList.contains('gm-bg')||e.target.closest('.gm-x')||e.target.closest('.gm-i a'))close()});
document.addEventListener('click',function(e){var a=e.target.closest('[data-g]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();open(a.dataset.g,a)});
document.addEventListener('keydown',function(e){if(!gm.classList.contains('open'))return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')cur.go(1);else if(e.key==='ArrowLeft')cur.go(-1);else if(e.key==='Tab'){var f=pn.querySelectorAll('a[href],button,[tabindex="0"]'),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}})})();