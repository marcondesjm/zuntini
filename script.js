const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#menu');
const setMenu=open=>{toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu de navegação':'Abrir menu de navegação');nav.classList.toggle('open',open)};
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!e.target.closest('#menu, .menu-toggle'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){setMenu(false);toggle.focus()}});
matchMedia('(min-width: 701px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
const backToTop=document.querySelector('.back-to-top'),mobileViewport=matchMedia('(max-width: 700px)');
const updateBackToTop=()=>{backToTop.hidden=!mobileViewport.matches||window.scrollY<window.innerHeight};
addEventListener('scroll',updateBackToTop,{passive:true});addEventListener('resize',updateBackToTop,{passive:true});updateBackToTop();
backToTop.addEventListener('click',()=>{document.querySelector('#conteudo').focus({preventScroll:true});window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
let scale=1;const tools=document.querySelector('.access-tools');
tools.addEventListener('click',e=>{const action=e.target.closest('[data-text-size]')?.dataset.textSize;if(!action)return;scale=action==='reset'?1:Math.max(.9,Math.min(1.3,Math.round((scale+(action==='increase'?.1:-.1))*10)/10));document.documentElement.style.setProperty('--text-scale',scale)});
const contrast=document.querySelector('#contrast-toggle');contrast.addEventListener('click',()=>{const active=document.documentElement.classList.toggle('high-contrast');contrast.setAttribute('aria-pressed',String(active));contrast.setAttribute('aria-label',active?'Desativar alto contraste':'Ativar alto contraste')});
const form=document.querySelector('#contact-form'), preview=document.querySelector('#message-preview');
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);preview.textContent=`Nome: ${d.get('nome')}\nE-mail: ${d.get('email')}\nAssunto: ${d.get('assunto')}\n\nMensagem:\n${d.get('mensagem')}`;document.querySelector('#result').hidden=false});
document.querySelector('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preview.textContent);document.querySelector('#copy-status').textContent='Mensagem copiada.'}catch{document.querySelector('#copy-status').textContent='Selecione o texto acima para copiar.'}});

// Movimento discreto e acessível, sem bibliotecas externas.
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 let cleanup=()=>{};
 function setup(){
  cleanup();cleanup=()=>{};
  if(reduce.matches || !('IntersectionObserver' in window))return;
  const controller=new AbortController(),signal=controller.signal,hero=document.querySelector('.hero');
  const progress=document.createElement('div');progress.className='motion-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);hero.classList.add('has-motion');
  const heading=hero.querySelector('h1'),original=[...heading.childNodes],lines=[[]];
  original.forEach(n=>{if(n.nodeName==='BR')lines.push([]);else lines.at(-1).push(n.cloneNode(true))});
  const fragment=document.createDocumentFragment();
  lines.forEach((nodes,i)=>{const line=document.createElement('span'),inner=document.createElement('span');line.className='motion-line';inner.style.setProperty('--line-delay',`${i*100}ms`);nodes.forEach(n=>inner.append(n));line.append(inner);fragment.append(line)});
  heading.replaceChildren(fragment);heading.classList.add('motion-heading');
  const selectors=['.hero-body .overline','.hero-body h1','.hero-body>p:not(.overline)','.hero-actions','.hero-values>div','.about-top>div','.about-panels>div','.practice-heading','.accordions details','.approach h2','.steps article','.perspectives h2','.insights article','.contact-grid>div','.contact-grid form'];
  const targets=[...new Set(document.querySelectorAll(selectors.join(',')))];
  const mobile=matchMedia('(max-width: 700px)').matches;
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:mobile?0:.06,rootMargin:mobile?'0px 0px 40px 0px':'0px 0px -15px 0px'});
  targets.forEach(el=>{if(el.matches('.steps article,.insights article,.hero-values>div')){const index=[...el.parentElement.children].indexOf(el);el.style.setProperty('--delay',`${mobile?(index%2)*70:index*90}ms`)}el.classList.add('reveal');observer.observe(el)});
  const show=el=>{if(!el)return;targets.filter(t=>t===el||el.contains(t)||t.contains(el)).forEach(t=>{t.classList.add('is-visible');observer.unobserve(t)})};
  document.addEventListener('focusin',e=>show(e.target),{signal});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)show(document.getElementById(a.hash.slice(1)))},{signal});
  if(location.hash)show(document.getElementById(location.hash.slice(1)));
  let scrollFrame=0,pointerFrame=0;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function update(){scrollFrame=0;let height=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--progress',height>0?clamp(scrollY/height,0,1):0);if(fine.matches)hero.style.setProperty('--hero-scale',1.02+clamp(scrollY/hero.offsetHeight,0,1)*.045)}
  function queue(){if(!scrollFrame)scrollFrame=requestAnimationFrame(update)}
  addEventListener('scroll',queue,{passive:true,signal});addEventListener('resize',queue,{passive:true,signal});update();
  const resets=[];
  if(fine.matches){
   const cursor=document.createElement('div');cursor.className='motion-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<span></span>';document.body.append(cursor);
   let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,hx=0,hy=0,px=0,py=0;
   function tick(){cx+=(x-cx)*.22;cy+=(y-cy)*.22;px+=(hx-px)*.07;py+=(hy-py)*.07;cursor.style.transform=`translate3d(${cx}px,${cy}px,0)`;hero.style.setProperty('--hero-x',`${px}px`);hero.style.setProperty('--hero-y',`${py}px`);if(Math.abs(cx-x)+Math.abs(cy-y)+Math.abs(px-hx)+Math.abs(py-hy)>.08)pointerFrame=requestAnimationFrame(tick);else pointerFrame=0}
   const wake=()=>{if(!pointerFrame)pointerFrame=requestAnimationFrame(tick)};
   document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;x=e.clientX;y=e.clientY;cursor.style.opacity=e.target.closest('input,textarea,select')?'0':'1';cursor.classList.toggle('is-link',!!e.target.closest('a,button,summary'));wake()},{passive:true,signal});
   document.documentElement.addEventListener('pointerleave',()=>{cursor.style.opacity='0';hx=hy=0;wake()},{signal});
   addEventListener('blur',()=>{cursor.style.opacity='0'},{signal});
   hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hx=(e.clientX/r.width-.5)*-12;hy=((e.clientY-r.top)/r.height-.5)*-10;wake()},{passive:true,signal});
   hero.addEventListener('pointerleave',()=>{hx=hy=0;wake()},{signal});
   document.querySelectorAll('.hero-actions .button,.nav-button').forEach(el=>{const reset=()=>{el.style.removeProperty('--mx');el.style.removeProperty('--my')};el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${clamp((e.clientX-r.left-r.width/2)*.07,-8,8)}px`);el.style.setProperty('--my',`${clamp((e.clientY-r.top-r.height/2)*.12,-5,5)}px`)},{passive:true,signal});el.addEventListener('pointerleave',reset,{signal});el.addEventListener('blur',reset,{signal});resets.push(reset)});
   resets.push(()=>cursor.remove());
  }
  cleanup=()=>{controller.abort();observer.disconnect();cancelAnimationFrame(scrollFrame);cancelAnimationFrame(pointerFrame);targets.forEach(el=>{el.classList.remove('reveal','is-visible');el.style.removeProperty('--delay')});resets.forEach(f=>f());heading.replaceChildren(...original);heading.classList.remove('motion-heading');hero.classList.remove('has-motion');['--hero-x','--hero-y','--hero-scale'].forEach(k=>hero.style.removeProperty(k));progress.remove()};
 }
 setup();reduce.addEventListener('change',setup);fine.addEventListener('change',setup);
})();
