document.getElementById('yr').textContent=new Date().getFullYear();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* scroll-driven page animation */
const bar=document.getElementById('bar'),mqs=[...document.querySelectorAll('.mq div')],tl=document.querySelector('.tl');
function onScroll(){
  const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  bar.style.transform='scaleX('+(max>0?y/max:0)+')';
  if(reduce)return;
  mqs.forEach(m=>{const d=+m.parentElement.dataset.dir;m.style.transform='translateX('+(d<0?-y*.35:y*.35-m.offsetWidth/2)+'px)'});
  const b=tl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.7-b.top)/b.height));
  tl.style.setProperty('--p',p);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv,.t').forEach(el=>io.observe(el));

/* small 3D hearts: appear while scrolling and while moving the mouse */
if(window.THREE&&!reduce){
  const cv=document.getElementById('hearts');
  const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(0,1,1,0,-1000,1000);
  sc.add(new THREE.AmbientLight(0xffffff,.8));
  const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(200,400,600);sc.add(dl);
  let W,H;
  function size(){W=innerWidth;H=innerHeight;r.setPixelRatio(Math.min(devicePixelRatio,2));r.setSize(W,H,false);cam.right=W;cam.top=H;cam.updateProjectionMatrix()}
  addEventListener('resize',size);size();
  const sh=new THREE.Shape();
  sh.moveTo(0,-1.3);sh.bezierCurveTo(-.2,-1,-1.7,-.3,-1.5,.6);sh.bezierCurveTo(-1.3,1.5,-.2,1.6,0,.8);
  sh.bezierCurveTo(.2,1.6,1.3,1.5,1.5,.6);sh.bezierCurveTo(1.7,-.3,.2,-1,0,-1.3);
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.6,bevelEnabled:true,bevelSize:.2,bevelThickness:.25,bevelSegments:4,curveSegments:16});geo.center();
  const cols=[0xff4d7d,0xff8fab,0xffb3c6,0xe11d48,0xffd1dc];
  const pool=[];
  for(let i=0;i<80;i++){
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:cols[i%cols.length],roughness:.35,transparent:true}));
    m.visible=false;sc.add(m);pool.push({m,life:0,max:1,vx:0,vy:0,ph:0,sp:0,s:0,on:false});
  }
  let ix=0;
  function spawn(x,y,vy,vx){
    const h=pool[ix++%pool.length];
    h.on=true;h.life=0;h.max=2.2+Math.random()*1.6;h.vx=vx+(Math.random()-.5)*30;h.vy=vy;h.ph=Math.random()*6.28;h.sp=1+Math.random()*2;
    h.s=5+Math.random()*5;h.m.scale.setScalar(h.s);h.m.position.set(x,y,0);h.m.visible=true;
  }
  let last=scrollY,acc=0,lt=0;
  addEventListener('scroll',()=>{
    onScroll();
    acc+=Math.abs(scrollY-last);last=scrollY;
    while(acc>45){acc-=45;spawn(Math.random()*W,-10,90+Math.random()*130,0)}
  },{passive:true});
  addEventListener('pointermove',e=>{
    const n=performance.now();if(n-lt<70)return;lt=n;
    spawn(e.clientX,H-e.clientY,35+Math.random()*50,0);
  });
  const clock=new THREE.Clock();
  (function loop(){
    requestAnimationFrame(loop);
    const dt=Math.min(clock.getDelta(),.05);let any=false;
    for(const h of pool){
      if(!h.on)continue;
      h.life+=dt;
      if(h.life>=h.max){h.on=false;h.m.visible=false;continue}
      any=true;
      h.m.position.x+=(h.vx+Math.sin(h.life*h.sp+h.ph)*25)*dt;
      h.m.position.y+=h.vy*dt;
      h.m.rotation.y+=dt*2.2;h.m.rotation.z=Math.sin(h.life*2+h.ph)*.3;
      const k=h.life/h.max;
      h.m.material.opacity=Math.min(1,h.life*6)*(1-k*k);
      h.m.scale.setScalar(h.s*(1+k*.3));
    }
    if(any||true)r.render(sc,cam);
  })();
}else{addEventListener('scroll',onScroll,{passive:true})}
onScroll();

const eb=document.getElementById('copy-email');
eb.addEventListener('click',async()=>{
  const t=eb.dataset.email;
  try{await navigator.clipboard.writeText(t)}catch(e){
    const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();
  }
  eb.textContent='Email copied: '+t;
  setTimeout(()=>eb.textContent='Email me',2500);
});
