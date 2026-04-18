// main.js — Simplified, reliable first-person engine
import * as THREE from 'three';
import { buildWorld } from './world.js';
import { nodes } from './nodes.js';
import './style.css';

// ── Inventory ──────────────────────────────────────────────────────────────
const inv = { hasSilverKey:false, hasCarKey:false, hasLocation:false, hasJournal:false, hasFlower:false, hasMusic:false, hasCafe:false, hasUni:false };
const HUD_NAMES = { hasSilverKey:'مفتاح فضي', hasCarKey:'مفتاح سيارة', hasLocation:'إحداثيات', hasJournal:'مذكرات', hasFlower:'تباع الشمس', hasMusic:'الذوق الموسيقي', hasCafe:'طلب المقهى', hasUni:'سجل أكاديمي' };
function updateHUD() {
  const el = document.getElementById('hud-items');
  el.innerHTML = Object.entries(HUD_NAMES).filter(([k]) => inv[k]).map(([,v]) => `<span class="hud-pill">${v}</span>`).join('') || '<span style="color:#776040">—</span>';
}

// ── Renderer ───────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const W = () => window.innerWidth, H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x90caf9, 50, 180);

// ── Sky sphere ─────────────────────────────────────────────────────────────
const skyUniforms = {
  topColor:    { value: new THREE.Color(0x1a74d4) },
  bottomColor: { value: new THREE.Color(0x90caf9) },
};
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(380, 16, 16),
  new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader:  `varying float vY; void main(){ vY=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`uniform vec3 topColor,bottomColor; varying float vY; void main(){ float t=clamp((vY+0.1)/1.1,0.0,1.0); gl_FragColor=vec4(mix(bottomColor,topColor,t),1.0); }`,
    side: THREE.BackSide,
  })
));

// ── Lights ─────────────────────────────────────────────────────────────────
const ambLight = new THREE.AmbientLight(0xfff5e0, 0.7);
scene.add(ambLight);
const sunLight = new THREE.DirectionalLight(0xfffde7, 1.4);
sunLight.position.set(60, 80, 40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near   = 0.5; sunLight.shadow.camera.far = 250;
sunLight.shadow.camera.left   = -80; sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top    =  80; sunLight.shadow.camera.bottom = -80;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x5a8c30, 0.5));

// Sun & Moon
const sunMesh  = new THREE.Mesh(new THREE.SphereGeometry(3,10,10), new THREE.MeshBasicMaterial({color:0xfffde0}));
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(2,10,10), new THREE.MeshBasicMaterial({color:0xdde4f0}));
scene.add(sunMesh); scene.add(moonMesh);

// Stars
const starPositions = [];
for(let i=0;i<1200;i++){const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=370;starPositions.push(r*Math.sin(ph)*Math.cos(th),r*Math.sin(ph)*Math.sin(th),r*Math.cos(ph));}
const starMesh = new THREE.Points(
  new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3)),
  new THREE.PointsMaterial({color:0xffffff,size:1.5,sizeAttenuation:false,transparent:true,opacity:0})
);
scene.add(starMesh);

// Clouds
const cloudMat = new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.9});
const clouds = [];
function makeCloud(x,y,z){ const g=new THREE.Group(); [[0,0,0,3.5,1.4,3.5],[3,0,0.5,3,1.2,2.8],[-2.5,0,0.5,2.8,1.1,2.4],[1,0,-2.5,2.5,1,2.4]].forEach(([bx,by,bz,w,h,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),cloudMat);m.position.set(bx,by,bz);g.add(m);}); g.position.set(x,y,z); g.userData.speedX=0.3+Math.random()*0.5; scene.add(g); clouds.push(g); }
for(let i=0;i<14;i++) makeCloud((Math.random()-0.5)*220, 50+Math.random()*20, (Math.random()-0.5)*220);

// ── Day/Night ──────────────────────────────────────────────────────────────
const SKEYS=[{t:0,top:0x040814,bot:0x0a1a3a,fog:0x061020,sun:0,amb:0.05},{t:0.22,top:0x1a3a6a,bot:0x1a3a6a,fog:0x1a2a4a,sun:0.1,amb:0.1},{t:0.28,top:0xe87040,bot:0xf0a850,fog:0xf09050,sun:0.6,amb:0.5},{t:0.40,top:0x1a74d4,bot:0x90caf9,fog:0x90caf9,sun:1.4,amb:0.7},{t:0.55,top:0x1a74d4,bot:0x90caf9,fog:0x90caf9,sun:1.4,amb:0.7},{t:0.68,top:0xe05020,bot:0xf08030,fog:0xe07028,sun:0.6,amb:0.4},{t:0.78,top:0x0a0820,bot:0x1a1030,fog:0x0a0820,sun:0,amb:0.07},{t:1,top:0x040814,bot:0x0a1a3a,fog:0x061020,sun:0,amb:0.05}];
function sampleSky(t){let a=SKEYS[0],b=SKEYS[SKEYS.length-1];for(let i=0;i<SKEYS.length-1;i++){if(t>=SKEYS[i].t&&t<=SKEYS[i+1].t){a=SKEYS[i];b=SKEYS[i+1];break;}}const f=a.t===b.t?0:(t-a.t)/(b.t-a.t);return{top:new THREE.Color(a.top).lerp(new THREE.Color(b.top),f),bot:new THREE.Color(a.bot).lerp(new THREE.Color(b.bot),f),fog:new THREE.Color(a.fog).lerp(new THREE.Color(b.fog),f),sun:a.sun+(b.sun-a.sun)*f,amb:a.amb+(b.amb-a.amb)*f};}
let dayTime=0.42;
function updateDayNight(dt){
  dayTime=(dayTime+dt/600)%1;
  const s=sampleSky(dayTime);
  skyUniforms.topColor.value.copy(s.top);
  skyUniforms.bottomColor.value.copy(s.bot);
  scene.fog.color.copy(s.fog);
  scene.background.copy(s.fog);
  const ang=dayTime*Math.PI*2-Math.PI/2;
  sunLight.position.set(Math.cos(ang)*200,Math.sin(ang)*200,60);
  sunMesh.position.copy(sunLight.position).normalize().multiplyScalar(180);
  moonMesh.position.copy(sunLight.position).negate().normalize().multiplyScalar(160);
  sunLight.intensity=s.sun; ambLight.intensity=s.amb;
  const night=dayTime<0.22?1:dayTime>0.78?1:dayTime<0.28?1-(dayTime-0.22)/0.06:dayTime>0.72?(dayTime-0.72)/0.06:0;
  starMesh.material.opacity=night; moonMesh.visible=night>0.1;
  cloudMat.opacity=0.9-night*0.55;
  renderer.toneMappingExposure=0.5+s.sun*0.45;
}

// ── Camera (direct, no hierarchy) ──────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(75, W()/H(), 0.1, 500);
camera.rotation.order = 'YXZ';
scene.add(camera);

let camYaw=0, camPitch=0;
let isLocked=false;

function lockPointer(){ canvas.requestPointerLock(); }
function unlockPointer(){ if(document.pointerLockElement) document.exitPointerLock(); }

document.addEventListener('pointerlockchange', () => {
  isLocked = document.pointerLockElement === canvas;
});
document.addEventListener('mousemove', e => {
  if(!isLocked || isPaused) return;
  camYaw   -= e.movementX * 0.002;
  camPitch -= e.movementY * 0.002;
  camPitch  = Math.max(-Math.PI/2.4, Math.min(Math.PI/2.4, camPitch));
  camera.rotation.set(camPitch, camYaw, 0, 'YXZ');
});

// ── World ──────────────────────────────────────────────────────────────────
const { walls, objects, spawnX, spawnZ } = buildWorld(scene);
const EYE_H = 1.75;
camera.position.set(spawnX, EYE_H, spawnZ);

// ── Physics ────────────────────────────────────────────────────────────────
const SPEED=8, GRAVITY=22, JUMP_V=7.5, PLAYER_R=0.45;
const keys={};
window.addEventListener('keydown', e => keys[e.code]=true);
window.addEventListener('keyup',   e => keys[e.code]=false);
let vy=0, canJump=true, bobT=0, stepTimer=0;
const velXZ = new THREE.Vector2();

function collision(x,z){ return walls.some(w=>x+PLAYER_R>w.minX&&x-PLAYER_R<w.maxX&&z+PLAYER_R>w.minZ&&z-PLAYER_R<w.maxZ); }

// ── Audio ──────────────────────────────────────────────────────────────────
let audioCtx=null;
function initAudio(){
  if(audioCtx) return;
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  const master=audioCtx.createGain(); master.gain.value=0.2; master.connect(audioCtx.destination);
  const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*3,audioCtx.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const wind=audioCtx.createBufferSource(); wind.buffer=buf; wind.loop=true;
  const flt=audioCtx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=350; flt.Q.value=0.25;
  const wg=audioCtx.createGain(); wg.gain.value=0.1;
  wind.connect(flt); flt.connect(wg); wg.connect(master); wind.start();
  const hum=audioCtx.createOscillator(); hum.type='sine'; hum.frequency.value=55;
  const hg=audioCtx.createGain(); hg.gain.value=0.03;
  hum.connect(hg); hg.connect(master); hum.start();
  scheduleBirds(master);
}
function scheduleBirds(dest){
  if(!audioCtx) return;
  setTimeout(()=>{
    const chirps=2+Math.floor(Math.random()*4);
    for(let c=0;c<chirps;c++){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),f=900+Math.random()*1200,t=audioCtx.currentTime+c*0.15;o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.4,t+0.06);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.16,t+0.02);g.gain.exponentialRampToValueAtTime(0.001,t+0.1);o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.12);}
    scheduleBirds(dest);
  },(4+Math.random()*9)*1000);
}
function playStep(){
  if(!audioCtx) return;
  const buf=audioCtx.createBuffer(1,(audioCtx.sampleRate*0.06)|0,audioCtx.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
  const src=audioCtx.createBufferSource(); src.buffer=buf;
  const f=audioCtx.createBiquadFilter(); f.type='highpass'; f.frequency.value=200;
  const g=audioCtx.createGain(); g.gain.value=0.18;
  src.connect(f); f.connect(g); g.connect(audioCtx.destination); src.start();
}

// ── Dialog ─────────────────────────────────────────────────────────────────
const overlay=document.getElementById('dialog-overlay');
const dText=document.getElementById('dialog-text');
const dChoices=document.getElementById('dialog-choices');
const dFeedback=document.getElementById('dialog-feedback');
const dIcon=document.getElementById('dialog-icon');
let isPaused=false, typingTimer=null;
window._closeDialog=closeDialog;

function openDialog(nodeId){ unlockPointer(); isPaused=true; overlay.classList.add('open'); renderNode(nodeId); }
function closeDialog(reset=false){
  if(reset){ Object.keys(inv).forEach(k=>inv[k]=false); updateHUD(); const f=objects.find(o=>o.userData.key==='F'); if(f)f.userData.group.visible=true; camera.position.set(spawnX,EYE_H,spawnZ); camYaw=0; camPitch=0; camera.rotation.set(0,0,0,'YXZ'); }
  isPaused=false; overlay.classList.remove('open'); lockPointer();
}
function renderNode(nodeId){
  if(nodeId===23){showFinalLetter();return;}
  const node=nodes[nodeId];
  dIcon.textContent=node.icon||''; dFeedback.textContent=''; dChoices.innerHTML='';
  clearTimeout(typingTimer);
  typewrite(node.text,()=>{
    node.choices.forEach((ch,i)=>{
      if(ch.condition&&!ch.condition(inv)) return;
      const btn=document.createElement('button');
      btn.className='choice-btn'; btn.style.animationDelay=`${i*0.12}s`; btn.textContent=ch.text;
      btn.onclick=()=>{ if(ch.action){ch.action(inv); updateHUD();} if(ch.reset){closeDialog(true);return;} if(ch.close){closeDialog();return;} updateHUD(); if(ch.next===99){dFeedback.textContent='✗  عدم تطابق — حاول مجدداً';btn.style.color='#ff7070';setTimeout(()=>renderNode(99),1400);}else if(ch.next)renderNode(ch.next); };
      dChoices.appendChild(btn);
    });
  });
}
function typewrite(text,done){ dText.innerHTML=''; let i=0; const tick=()=>{ dText.innerHTML=text.slice(0,i)+(i<text.length?'<span class="cursor-blink"></span>':''); if(i++<text.length) typingTimer=setTimeout(tick,13); else if(done) done(); }; tick(); }
function showFinalLetter(){ overlay.classList.remove('open'); document.getElementById('final-screen').classList.add('visible'); document.getElementById('letter-text').innerHTML=`
<p>اهلًا حبيبي</p>
<p>لو وصلت لهذي الرسالة<br>فأنت فعلًا تعرفني<br>
<span dir="ltr" style="display:inline-block">and i like to believe that<br>to be loved is to be known</span></p>
<p dir="ltr">i found a best friend in you, a husband, and a lifelong partner.</p>
<p dir="ltr">i truly cannot imagine my life without you</p>
<p>كل مره احاول افاجئك بأي شي<br>سواء رسمة او موقع او اي شي<br>تقفطني</p>
<p>لذلك حاولت اسوي شي خارج توقعاتك</p>
<p>وممكن تبان اللعبة هذي نرجسية شوي دامني قاعدة اختبر معرفتك فيني<br>لكن 🌚<br>ما عندي تبرير صراحة</p>
<p>احبك<br>جدًا احبك</p>
<p>احب عقلك<br>احب تفكيرك<br>احب ذكائك ومنطقك<br>احب اخلاقك وولائك ووفائك وامانتك<br>احب صدقك وصراحتك وحبك لي<br>احب ضحكتك<br>احب صوت ضحكتك<br>احب ابتسامتك<br>احب نبرة صوتك النعسانة<br>احب فواز السركاستك<br>احب فواز السعيد<br>احب اشوفك فرحان<br>احب حماسك اتجاه اي شي (بقرات)<br>احب لما تحس بموجة حب قوية لي وتتعمد تخليني استحي<br>
<span dir="ltr" style="display:inline-block">احب الkissy voicnotes<br>meowwwww ones too</span><br>
احب كل مره يظهرون سكلي وهيتشكوك بالشاشة اتحمس لأنهم يضحكونك<br>كل ما شفتهم انبسط لأني بسمعك تضحك</p>
<p>احب حبك لأمك وخوفك واهتمامك بها جدًا</p>
<p>احب خوفك علي ورغبتك تكون اماني (you are)<br>احب لما تعصب علي لمصلحتي<br>احب لما تغصبني اخذ فلوسك وتاخذ مني عشان ما يأنبني ضميري<br>اااااااحب اخذ لك لو بنص ريال موية</p>
<p dir="ltr">you make me feel like a princess. i’ve never even dared to dream about a man like you</p>
<p dir="ltr">you’re unreal it makes me question if i deserve you</p>
<p dir="ltr">i love you i wish i could whisper it with each kiss i place on your face.</p>
`; }

// ── Start & UI Events ──────────────────────────────────────────────────────
const startScreen=document.getElementById('start-screen');
document.getElementById('start-btn').addEventListener('click',()=>{ initAudio(); startScreen.classList.add('hidden'); setTimeout(()=>startScreen.style.display='none',700); lockPointer(); });
canvas.addEventListener('click',()=>{ if(isPaused) return; if(!isLocked&&startScreen.style.display==='none') lockPointer(); else if(isLocked&&hoveredObj) openDialog(hoveredObj.userData.nodeId); });
window.addEventListener('resize',()=>{ camera.aspect=W()/H(); camera.updateProjectionMatrix(); renderer.setSize(W(),H()); });

// ── Raycaster ──────────────────────────────────────────────────────────────
const raycaster=new THREE.Raycaster();
const screen0=new THREE.Vector2(0,0);
let hoveredObj=null;
const crosshair=document.getElementById('crosshair');
const hintBar=document.getElementById('hint-bar');

// ── Main loop ──────────────────────────────────────────────────────────────
let last=performance.now();

function animate(){
  requestAnimationFrame(animate);
  const now=performance.now(), dt=Math.min((now-last)/1000,0.05); last=now;
  const t=now/1000;

  updateDayNight(dt);
  clouds.forEach(c=>{ c.position.x+=c.userData.speedX*dt; if(c.position.x>160)c.position.x=-160; });

  if(isLocked && !isPaused){
    const fwd=Number(keys['KeyW']||keys['ArrowUp']||0);
    const bwd=Number(keys['KeyS']||keys['ArrowDown']||0);
    const lft=Number(keys['KeyA']||keys['ArrowLeft']||0);
    const rgt=Number(keys['KeyD']||keys['ArrowRight']||0);

    // Move relative to camera yaw
    const sinY=Math.sin(camYaw), cosY=Math.cos(camYaw);
    const mx=(fwd-bwd)*(-sinY)+(rgt-lft)*cosY;
    const mz=(fwd-bwd)*(-cosY)+(rgt-lft)*(-sinY);

    velXZ.x += mx*SPEED*10*dt;
    velXZ.y += mz*SPEED*10*dt;
    velXZ.x *= Math.pow(0.001,dt);
    velXZ.y *= Math.pow(0.001,dt);

    const px=camera.position.x+velXZ.x*dt;
    if(!collision(px,camera.position.z)) camera.position.x=px; else velXZ.x=0;
    const pz=camera.position.z+velXZ.y*dt;
    if(!collision(camera.position.x,pz)) camera.position.z=pz; else velXZ.y=0;

    vy-=GRAVITY*dt; camera.position.y+=vy*dt;
    if(camera.position.y<EYE_H){camera.position.y=EYE_H;vy=0;canJump=true;}
    if(keys['Space']&&canJump){vy=JUMP_V;canJump=false;}

    const moving=fwd||bwd||lft||rgt;
    if(moving){ bobT+=8*dt; camera.position.y+=Math.sin(bobT)*0.04; stepTimer+=dt; if(stepTimer>0.52){stepTimer=0;playStep();} }
    else{ stepTimer=0; }

    raycaster.setFromCamera(screen0,camera);
    const hits=raycaster.intersectObjects(objects.filter(o=>o.userData.group.visible));
    if(hits.length>0&&hits[0].distance<8){ hoveredObj=hits[0].object; crosshair.classList.add('active'); hintBar.classList.add('visible'); }
    else{ hoveredObj=null; crosshair.classList.remove('active'); hintBar.classList.remove('visible'); }
  }

  objects.forEach((o,i)=>{ if(o.userData.group.visible) o.userData.group.position.y=Math.sin(t*0.8+i*0.9)*0.07; });
  renderer.render(scene,camera);
}

updateHUD();
animate();
