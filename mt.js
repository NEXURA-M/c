/* ============================================================================
   LYRA GAME BUILDER — script.js
   Created by MUHAMMAD TAQI
   Contains: UI shell + 9 games embedded as full standalone HTML
   Hash format: #CODE+encodedUser+encodedGame   (A=1..Z=26, space=?)
   ========================================================================= */
(function () {
'use strict';

/* -------------------------- SHARED HELPERS ------------------------------ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id; st.textContent = css;
  document.head.appendChild(st);
}
function toast(msg) {
  let t = document.getElementById('lyra-toast');
  if (!t) { t = document.createElement('div'); t.id='lyra-toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('show'), 2200);
}
function encodeName(s) {
  return String(s).toUpperCase().split('').map(ch => {
    if (ch === ' ') return '?';
    const c = ch.charCodeAt(0);
    return (c >= 65 && c <= 90) ? (c - 64) : '?';
  }).join('.');
}
function decodeName(s) {
  if (!s) return '';
  return String(s).split('.').map(x => {
    if (x === '?') return ' ';
    const n = parseInt(x, 10);
    return (n >= 1 && n <= 26) ? String.fromCharCode(n + 64) : '';
  }).join('');
}
function sanitizeName(s) {
  return String(s||'').replace(/[^A-Za-z ]/g,'').replace(/\s+/g,' ').trim().toUpperCase().slice(0,20);
}

/* -------------------------- GLOBAL UI CSS ------------------------------- */
injectCSS('lyra-css', `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#05050c;color:#e8ecf8;min-height:100vh;overflow-x:hidden}
.bg{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(circle at 15% 20%,rgba(34,211,238,.16),transparent 55%),
  radial-gradient(circle at 85% 80%,rgba(168,85,247,.16),transparent 55%),
  radial-gradient(circle at 50% 50%,rgba(244,114,182,.08),transparent 60%),
  #05050c}
.blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35;animation:bf 22s ease-in-out infinite}
.blob.b1{width:420px;height:420px;background:#7c3aed;top:-120px;left:-120px}
.blob.b2{width:380px;height:380px;background:#0891b2;bottom:-100px;right:-100px;animation-delay:-7s}
.blob.b3{width:300px;height:300px;background:#db2777;top:45%;left:65%;animation-delay:-13s}
@keyframes bf{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(50px,-40px) scale(1.12)}66%{transform:translate(-40px,50px) scale(.92)}}
.screen{position:relative;z-index:1;min-height:100vh;display:none;flex-direction:column;align-items:center;justify-content:center;padding:18px}
.screen.active{display:flex;animation:fd .4s ease}
@keyframes fd{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.card{background:rgba(255,255,255,.055);backdrop-filter:blur(26px) saturate(1.5);-webkit-backdrop-filter:blur(26px) saturate(1.5);border:1px solid rgba(255,255,255,.12);border-radius:26px;padding:36px 26px;box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.09);max-width:520px;width:100%;text-align:center}
.logo{font-size:.72rem;letter-spacing:.5em;font-weight:800;color:#22d3ee;margin-bottom:6px;text-shadow:0 0 24px rgba(34,211,238,.6)}
.title{font-size:clamp(2.2rem,8vw,3.2rem);font-weight:900;line-height:1.02;letter-spacing:-1px;margin:4px 0 6px;background:linear-gradient(120deg,#22d3ee,#a78bfa,#f472b6,#22d3ee);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:sh 7s ease infinite}
@keyframes sh{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.sub{font-size:.85rem;letter-spacing:.35em;text-transform:uppercase;color:#94a3b8;margin-bottom:14px}
.creator{font-size:.9rem;color:#cbd5e1;margin-bottom:26px}
.creator b{color:#fbbf24;letter-spacing:.5px}
.cta{padding:15px 32px;border:none;border-radius:16px;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#03131a;cursor:pointer;background:linear-gradient(135deg,#22d3ee,#3b82f6,#a78bfa);background-size:200% 200%;box-shadow:0 12px 36px rgba(34,211,238,.35),0 0 0 1px rgba(255,255,255,.18) inset;transition:transform .2s,box-shadow .2s;animation:sh 6s ease infinite}
.cta:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 18px 48px rgba(34,211,238,.5)}
.cta:active{transform:scale(.97)}
.back{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);color:#e2e8f0;border-radius:12px;padding:8px 14px;cursor:pointer;font-size:.9rem;font-weight:700;transition:.2s;font-family:inherit}
.back:hover{background:rgba(255,255,255,.16)}
.head{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:22px;width:100%;max-width:820px;position:relative}
.head h2{font-size:1.45rem;font-weight:900;letter-spacing:.04em;background:linear-gradient(120deg,#22d3ee,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.head .back{position:absolute;left:0;top:50%;transform:translateY(-50%)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:13px;width:100%;max-width:820px}
.gcard{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:22px 12px;border-radius:22px;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;transition:.25s;backdrop-filter:blur(14px);font-family:inherit;text-align:center;overflow:hidden}
.gcard::before{content:"";position:absolute;inset:0;background:var(--g);opacity:0;transition:.3s;z-index:0}
.gcard:hover{transform:translateY(-5px);border-color:rgba(255,255,255,.3);box-shadow:0 18px 44px rgba(0,0,0,.5)}
.gcard:hover::before{opacity:.18}
.gcard:active{transform:scale(.97)}
.gcard .icon{font-size:2.4rem;position:relative;z-index:1;filter:drop-shadow(0 6px 16px rgba(0,0,0,.4))}
.gcard .name{font-weight:800;font-size:.92rem;position:relative;z-index:1}
.gcard .code{font-size:.66rem;color:#94a3b8;font-family:ui-monospace,monospace;letter-spacing:.14em;position:relative;z-index:1}
.pub-icon{font-size:3rem;margin-bottom:4px;filter:drop-shadow(0 10px 24px rgba(0,0,0,.5))}
.pub-title{font-size:1.3rem;font-weight:900;margin-bottom:18px}
.inp{width:100%;padding:14px 16px;margin-bottom:12px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:1rem;outline:none;transition:.2s;font-family:inherit}
.inp:focus{border-color:#22d3ee;box-shadow:0 0 0 3px rgba(34,211,238,.18);background:rgba(255,255,255,.09)}
.inp::placeholder{color:#64748b}
.pub-btn{width:100%;padding:15px;border:none;border-radius:14px;cursor:pointer;font-size:1rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#03131a;background:linear-gradient(135deg,#22d3ee,#3b82f6);box-shadow:0 12px 30px rgba(34,211,238,.35);transition:.2s;font-family:inherit}
.pub-btn:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(34,211,238,.5)}
.pub-btn:active{transform:scale(.97)}
.link-box{margin-top:18px;display:flex;flex-direction:column;gap:10px;animation:fd .4s ease}
.link-inp{width:100%;padding:12px 14px;border-radius:12px;border:1px dashed rgba(34,211,238,.5);background:rgba(34,211,238,.07);color:#a5f3fc;font-family:ui-monospace,monospace;font-size:.75rem;word-break:break-all;outline:none}
.link-row{display:flex;gap:10px}
.copy,.play-now{flex:1;padding:12px;border-radius:12px;border:none;cursor:pointer;font-weight:800;font-size:.9rem;transition:.2s;font-family:inherit}
.copy{background:rgba(255,255,255,.1);color:#e2e8f0;border:1px solid rgba(255,255,255,.15)}
.copy:hover{background:rgba(255,255,255,.2)}
.play-now{background:linear-gradient(135deg,#22c55e,#10b981);color:#031a0f;box-shadow:0 8px 22px rgba(34,197,94,.35)}
.play-now:hover{transform:translateY(-2px)}
.playbar{width:100%;max-width:900px;display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:12px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(16px)}
.playbar .back{position:static}
.playinfo{display:flex;flex-direction:column;line-height:1.2;overflow:hidden;flex:1}
.playname{font-weight:900;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.playuser{font-size:.72rem;color:#94a3b8;letter-spacing:.1em;text-transform:uppercase}
.stage{width:100%;max-width:900px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.stage iframe{width:100%;height:82vh;min-height:520px;border:none;border-radius:18px;background:#05050c;box-shadow:0 22px 64px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.08)}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:rgba(15,23,42,.95);color:#a5f3fc;padding:12px 22px;border-radius:14px;border:1px solid rgba(34,211,238,.4);font-weight:700;font-size:.85rem;box-shadow:0 12px 36px rgba(0,0,0,.6);opacity:0;pointer-events:none;transition:.3s;z-index:99999}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:520px){.card{padding:28px 18px;border-radius:22px}.grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}.gcard .icon{font-size:2rem}.gcard .name{font-size:.82rem}.stage iframe{height:78vh;min-height:480px}}
`);

/* ============================================================================
   GAME HTML — original code, embedded as escaped template strings
   Escape rules: backtick -> \`   ${ -> \${   (Tetris also: \ -> \\)
   ========================================================================= */
const GAME_HTML = {};

/* ------------------------------ FLAPPY BIRD ----------------------------- */
GAME_HTML.FB = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Flappy Bird</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;overflow:hidden}
.game-container{position:relative;display:flex;flex-direction:column;align-items:center;gap:15px}
.header{display:flex;justify-content:space-between;align-items:center;width:400px;padding:0 10px}
.score-display{color:#fff;font-size:2.5rem;font-weight:bold;text-shadow:0 0 20px rgba(255,255,255,0.5),0 4px 8px rgba(0,0,0,0.5);letter-spacing:2px}
.best-score{color:#ffd700;font-size:1.2rem;font-weight:bold;text-shadow:0 0 15px rgba(255,215,0,0.6);letter-spacing:1px}
canvas{border-radius:15px;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 40px rgba(79,172,254,0.3);cursor:pointer;display:block;border:3px solid rgba(255,255,255,0.2);transition:box-shadow .3s ease}
canvas:hover{box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px rgba(79,172,254,0.5)}
.controls{display:flex;gap:15px;color:rgba(255,255,255,0.8);font-size:.9rem}
.controls span{background:rgba(255,255,255,0.1);padding:8px 16px;border-radius:20px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2)}
.restart-btn{background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;border:none;padding:12px 30px;font-size:1.1rem;font-weight:bold;border-radius:30px;cursor:pointer;letter-spacing:1px;box-shadow:0 8px 25px rgba(238,90,36,0.4);text-transform:uppercase}
.restart-btn:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(238,90,36,0.6)}
@media(max-width:450px){canvas{width:100%;max-width:400px;height:auto}.header{width:100%;max-width:400px}.score-display{font-size:2rem}}
</style></head>
<body>
<div class="game-container">
<div class="header"><div class="score-display" id="scoreDisplay">0</div><div class="best-score" id="bestScoreDisplay">🏆 Best: 0</div></div>
<canvas id="gameCanvas" width="400" height="600"></canvas>
<div class="controls"><span>🖱️ Click/Tap</span><span>⌨️ Space</span><span>⬆️ Up</span></div>
<button class="restart-btn" id="restartBtn">🔄 Restart Game</button>
</div>
<script>
(function(){
const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
const scoreDisplay=document.getElementById('scoreDisplay'),bestScoreDisplay=document.getElementById('bestScoreDisplay'),restartBtn=document.getElementById('restartBtn');
const CW=400,CH=600,GRAVITY=.55,FLAP=-8.5,PW=65,PG=150,PS=2.8,PSI=85,BX=100,BR=18,GH=80;
let bird={x:BX,y:CH/2,velocity:0,radius:BR,rotation:0};
let pipes=[],particles=[],score=0,bestScore=parseInt(localStorage.getItem('flappyBestScore'))||0;
let gameState='ready',frameCount=0,pipeSpawnCounter=0,groundX=0,starField=[],clouds=[],flashEffect=0,screenShake=0;
function initStars(){starField=[];for(let i=0;i<50;i++)starField.push({x:Math.random()*CW,y:Math.random()*(CH-GH-50),size:Math.random()*2+.5,twinkle:Math.random()*Math.PI*2,twinkleSpeed:Math.random()*.05+.02});}
function initClouds(){clouds=[];for(let i=0;i<4;i++)clouds.push({x:Math.random()*CW,y:Math.random()*(CH*.5)+30,width:Math.random()*80+60,height:Math.random()*25+15,speed:Math.random()*.3+.1,opacity:Math.random()*.3+.2});}
function updateBestScoreDisplay(){bestScoreDisplay.textContent='🏆 Best: '+bestScore;}
function saveBestScore(){if(score>bestScore){bestScore=score;localStorage.setItem('flappyBestScore',bestScore);updateBestScoreDisplay();}}
function resetGame(){bird.y=CH/2;bird.velocity=0;bird.rotation=0;pipes=[];particles=[];score=0;frameCount=0;pipeSpawnCounter=0;groundX=0;screenShake=0;flashEffect=0;scoreDisplay.textContent='0';gameState='ready';}
function createPipe(){const gapY=Math.random()*(CH-GH-PG-80)+40+PG/2;pipes.push({x:CW+PW,gapY:gapY,gapSize:PG,width:PW,passed:false,topPipeHeight:gapY-PG/2,bottomPipeY:gapY+PG/2});}
function createParticles(x,y,count,color){for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2;const speed=Math.random()*4+1;particles.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-2,radius:Math.random()*4+2,color:color,life:Math.random()*30+20,maxLife:50,gravity:.15});}}
function createFlapParticles(){const colors=['#FFD700','#FFA500','#FF6347','#fff','#FFE4B5'];for(let i=0;i<5;i++)particles.push({x:bird.x-bird.radius*.5,y:bird.y+Math.random()*10-5,vx:-Math.random()*3-1,vy:Math.random()*4-2,radius:Math.random()*3+1,color:colors[Math.floor(Math.random()*colors.length)],life:Math.random()*15+10,maxLife:25,gravity:.05});}
function flap(){if(gameState==='playing'){bird.velocity=FLAP;bird.rotation=-.4;createFlapParticles();}else if(gameState==='ready'){gameState='playing';bird.velocity=FLAP;bird.rotation=-.4;createFlapParticles();}else if(gameState==='gameover'){resetGame();gameState='ready';}}
function checkCollision(){if(bird.y+bird.radius>=CH-GH)return true;if(bird.y-bird.radius<=0){bird.y=bird.radius;bird.velocity=0;}for(let pipe of pipes){if(bird.x+bird.radius>pipe.x&&bird.x-bird.radius<pipe.x+pipe.width){if(bird.y-bird.radius<pipe.topPipeHeight)return true;if(bird.y+bird.radius>pipe.bottomPipeY)return true;}}return false;}
function gameOver(){gameState='gameover';saveBestScore();createParticles(bird.x,bird.y,30,'#FF6B6B');createParticles(bird.x,bird.y,20,'#FFD700');screenShake=10;flashEffect=15;}
function update(){if(gameState==='playing'){frameCount++;bird.velocity+=GRAVITY;bird.y+=bird.velocity;if(bird.velocity<0)bird.rotation=Math.max(-.5,bird.rotation-.1);else bird.rotation=Math.min(Math.PI/3,bird.rotation+.08);pipeSpawnCounter++;if(pipeSpawnCounter>=PSI){createPipe();pipeSpawnCounter=0;}for(let i=pipes.length-1;i>=0;i--){pipes[i].x-=PS;if(!pipes[i].passed&&pipes[i].x+pipes[i].width<bird.x){pipes[i].passed=true;score++;scoreDisplay.textContent=score;createParticles(bird.x+bird.radius,bird.y,8,'#FFD700');}if(pipes[i].x+pipes[i].width<-20)pipes.splice(i,1);}groundX-=PS;if(groundX<=-20)groundX+=20;for(let cloud of clouds){cloud.x-=cloud.speed;if(cloud.x+cloud.width<-20){cloud.x=CW+20;cloud.y=Math.random()*(CH*.5)+30;}}for(let star of starField)star.twinkle+=star.twinkleSpeed;if(checkCollision())gameOver();for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.life--;if(p.life<=0)particles.splice(i,1);}if(screenShake>0){screenShake*=.9;if(screenShake<.1)screenShake=0;}if(flashEffect>0)flashEffect--;}else if(gameState==='ready'){bird.y=CH/2+Math.sin(frameCount*.05)*15;bird.rotation=Math.sin(frameCount*.03)*.1;frameCount++;for(let cloud of clouds){cloud.x-=cloud.speed*.5;if(cloud.x+cloud.width<-20){cloud.x=CW+20;cloud.y=Math.random()*(CH*.5)+30;}}for(let star of starField)star.twinkle+=star.twinkleSpeed;}else if(gameState==='gameover'){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.life--;if(p.life<=0)particles.splice(i,1);}if(screenShake>0){screenShake*=.9;if(screenShake<.1)screenShake=0;}if(flashEffect>0)flashEffect--;}}
function drawBackground(){const skyGradient=ctx.createLinearGradient(0,0,0,CH-GH);skyGradient.addColorStop(0,'#0a0a2e');skyGradient.addColorStop(.3,'#1a1a4e');skyGradient.addColorStop(.6,'#2d1b69');skyGradient.addColorStop(.85,'#e8a87c');skyGradient.addColorStop(1,'#f4d03f');ctx.fillStyle=skyGradient;ctx.fillRect(0,0,CW,CH-GH);for(let star of starField){const alpha=Math.sin(star.twinkle)*.5+.5;ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.beginPath();ctx.arc(star.x,star.y,star.size,0,Math.PI*2);ctx.fill();}for(let cloud of clouds){ctx.fillStyle='rgba(255,255,255,'+cloud.opacity+')';ctx.beginPath();ctx.ellipse(cloud.x,cloud.y,cloud.width/2,cloud.height/2,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cloud.x+cloud.width*.25,cloud.y-cloud.height*.4,cloud.width*.35,cloud.height*.6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cloud.x-cloud.width*.2,cloud.y-cloud.height*.25,cloud.width*.3,cloud.height*.55,0,0,Math.PI*2);ctx.fill();}const sunGradient=ctx.createRadialGradient(320,120,10,320,120,80);sunGradient.addColorStop(0,'rgba(255,200,100,0.8)');sunGradient.addColorStop(.3,'rgba(255,180,80,0.3)');sunGradient.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=sunGradient;ctx.fillRect(240,40,160,160);ctx.fillStyle='#FFE4A0';ctx.beginPath();ctx.arc(320,120,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,240,200,0.6)';ctx.beginPath();ctx.arc(320,120,20,0,Math.PI*2);ctx.fill();}
function drawGround(){const g=ctx.createLinearGradient(0,CH-GH,0,CH);g.addColorStop(0,'#5d8a3c');g.addColorStop(.3,'#4a7a2e');g.addColorStop(1,'#2d5016');ctx.fillStyle=g;ctx.fillRect(0,CH-GH,CW,GH);for(let i=-1;i<CW/20+2;i++){const x=i*20+groundX;ctx.fillStyle='#6b9e45';ctx.fillRect(x,CH-GH+15,10,10);ctx.fillRect(x+10,CH-GH+5,10,10);}ctx.fillStyle='#8bc34a';ctx.fillRect(0,CH-GH,CW,4);ctx.fillStyle='#c5e1a5';ctx.fillRect(0,CH-GH,CW,2);const sh=ctx.createLinearGradient(0,CH-GH,0,CH);sh.addColorStop(0,'rgba(0,0,0,0.4)');sh.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sh;ctx.fillRect(0,CH-GH,CW,15);}
function drawPipes(){for(let pipe of pipes){const pg=ctx.createLinearGradient(pipe.x,0,pipe.x+pipe.width,0);pg.addColorStop(0,'#2e7d32');pg.addColorStop(.3,'#4caf50');pg.addColorStop(.5,'#66bb6a');pg.addColorStop(.7,'#4caf50');pg.addColorStop(1,'#1b5e20');ctx.fillStyle=pg;ctx.fillRect(pipe.x,0,pipe.width,pipe.topPipeHeight);const cg=ctx.createLinearGradient(pipe.x,pipe.topPipeHeight-30,pipe.x+pipe.width,pipe.topPipeHeight);cg.addColorStop(0,'#1b5e20');cg.addColorStop(.5,'#388e3c');cg.addColorStop(1,'#1b5e20');ctx.fillStyle=cg;ctx.fillRect(pipe.x-5,pipe.topPipeHeight-30,pipe.width+10,30);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(pipe.x-5,pipe.topPipeHeight-30,pipe.width+10,5);ctx.fillStyle=pg;ctx.fillRect(pipe.x,pipe.bottomPipeY,pipe.width,CH-GH-pipe.bottomPipeY);ctx.fillStyle=cg;ctx.fillRect(pipe.x-5,pipe.bottomPipeY,pipe.width+10,30);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(pipe.x-5,pipe.bottomPipeY,pipe.width+10,5);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(pipe.x+pipe.width-8,0,8,pipe.topPipeHeight);ctx.fillRect(pipe.x+pipe.width-8,pipe.bottomPipeY,8,CH-GH-pipe.bottomPipeY);}}
function drawBird(){ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(bird.rotation);ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(2,22,bird.radius*.9,bird.radius*.5,0,0,Math.PI*2);ctx.fill();const bg=ctx.createRadialGradient(-5,-5,5,0,0,bird.radius+5);bg.addColorStop(0,'#FFE082');bg.addColorStop(.5,'#FFD54F');bg.addColorStop(1,'#FFB300');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,0,bird.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#E6A200';ctx.lineWidth=2;ctx.stroke();const wf=Math.sin(frameCount*.3)*(gameState==='playing'?.4:.2);ctx.save();ctx.translate(-8,2);ctx.rotate(wf+.3);const wg=ctx.createLinearGradient(0,-8,0,12);wg.addColorStop(0,'#FFA726');wg.addColorStop(.6,'#FF8F00');wg.addColorStop(1,'#E65100');ctx.fillStyle=wg;ctx.beginPath();ctx.ellipse(-5,2,12,8,-.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#D84315';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-6,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#555';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(8,-6,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-7.5,1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FF6D00';ctx.beginPath();ctx.moveTo(12,-2);ctx.lineTo(24,2);ctx.lineTo(12,5);ctx.closePath();ctx.fill();ctx.strokeStyle='#E65100';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#FF8F00';ctx.beginPath();ctx.moveTo(12,4);ctx.lineTo(22,6);ctx.lineTo(12,7);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,100,100,0.35)';ctx.beginPath();ctx.arc(3,1,5,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawParticles(){for(let p of particles){const a=p.life/p.maxLife;ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.radius*a,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
function drawReadyScreen(){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#fff';ctx.font='bold 40px "Segoe UI",Tahoma,sans-serif';ctx.textAlign='center';ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillText('🐦 Flappy Bird',CW/2,CH/2-40);ctx.font='24px "Segoe UI",Tahoma,sans-serif';ctx.fillStyle='#FFD700';ctx.fillText('Click or Press Space to Start',CW/2,CH/2+20);ctx.shadowBlur=0;ctx.textAlign='left';}
function drawGameOverScreen(){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,CW,CH);ctx.textAlign='center';ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=25;ctx.fillStyle='#FF4444';ctx.font='bold 48px "Segoe UI",Tahoma,sans-serif';ctx.fillText('💀 GAME OVER',CW/2,CH/2-50);ctx.fillStyle='#fff';ctx.font='bold 30px "Segoe UI",Tahoma,sans-serif';ctx.fillText('Score: '+score,CW/2,CH/2+15);ctx.fillStyle='#FFD700';ctx.font='bold 24px "Segoe UI",Tahoma,sans-serif';ctx.fillText('🏆 Best: '+bestScore,CW/2,CH/2+55);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='18px "Segoe UI",Tahoma,sans-serif';ctx.fillText('Click or Press Space to Restart',CW/2,CH/2+100);ctx.shadowBlur=0;ctx.textAlign='left';}
function drawFlashEffect(){if(flashEffect>0){ctx.fillStyle='rgba(255,255,255,'+(flashEffect/15*.5)+')';ctx.fillRect(0,0,CW,CH);}}
function render(){ctx.save();if(screenShake>0){const sx=(Math.random()-.5)*screenShake*2,sy=(Math.random()-.5)*screenShake*2;ctx.translate(sx,sy);}drawBackground();drawPipes();drawGround();drawParticles();drawBird();drawFlashEffect();ctx.restore();if(gameState==='ready')drawReadyScreen();else if(gameState==='gameover')drawGameOverScreen();}
function gameLoop(){update();render();requestAnimationFrame(gameLoop);}
function handleFlap(e){if(e)e.preventDefault();flap();}
canvas.addEventListener('click',handleFlap);
canvas.addEventListener('touchstart',function(e){e.preventDefault();handleFlap();});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();handleFlap();}});
restartBtn.addEventListener('click',function(){resetGame();gameState='ready';});
window.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp')e.preventDefault();},{passive:false});
initStars();initClouds();updateBestScoreDisplay();resetGame();gameLoop();
})();
</script></body></html>`;

/* ------------------------------ TIC TAC TOE ----------------------------- */
GAME_HTML.TTT = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Royal Cyberpunk AI Tic-Tac-Toe</title>
<style>
:root{--bg-color:#0a0e17;--gold:#d4af37;--glow:0 0 15px rgba(212,175,55,0.6);--glass:rgba(255,255,255,0.03)}
body{background-color:var(--bg-color);color:var(--gold);font-family:'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0}
h1{text-shadow:var(--glow);letter-spacing:2px}
.board{display:grid;grid-template-columns:repeat(3,100px);grid-template-rows:repeat(3,100px);gap:10px;padding:20px;background:var(--glass);border:2px solid var(--gold);border-radius:15px;box-shadow:var(--glow)}
.cell{width:100px;height:100px;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:2.5rem;cursor:pointer;transition:.3s}
.cell:hover{background:rgba(212,175,55,0.1)}
#status{margin-top:20px;font-size:1.5rem;color:var(--gold)}
button{margin-top:20px;padding:10px 25px;background:transparent;color:var(--gold);border:1px solid var(--gold);cursor:pointer;text-transform:uppercase;letter-spacing:1px}
</style></head><body>
<h1>PLAYER VS BOT</h1>
<div class="board" id="board">
<div class="cell" onclick="humanMove(0)"></div><div class="cell" onclick="humanMove(1)"></div><div class="cell" onclick="humanMove(2)"></div>
<div class="cell" onclick="humanMove(3)"></div><div class="cell" onclick="humanMove(4)"></div><div class="cell" onclick="humanMove(5)"></div>
<div class="cell" onclick="humanMove(6)"></div><div class="cell" onclick="humanMove(7)"></div><div class="cell" onclick="humanMove(8)"></div>
</div>
<div id="status">Your Turn (X)</div>
<button onclick="resetGame()">Restart Match</button>
<script>
let board=["","","","","","","","",""];let gameActive=true;
function humanMove(index){if(board[index]===""&&gameActive){updateBoard(index,"X");if(gameActive){document.getElementById("status").innerText="Bot is thinking...";setTimeout(botMove,500);}}}
function botMove(){if(!gameActive)return;let move=findBestMove("O")||findBestMove("X")||chooseStrategicMove();if(move!==null)updateBoard(move,"O");}
function findBestMove(player){const winPatterns=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(let pattern of winPatterns){const[a,b,c]=pattern;const line=[board[a],board[b],board[c]];const countPlayer=line.filter(v=>v===player).length;const countEmpty=line.filter(v=>v==="").length;if(countPlayer===2&&countEmpty===1){if(board[a]==="")return a;if(board[b]==="")return b;if(board[c]==="")return c;}}return null;}
function chooseStrategicMove(){const priorities=[4,0,2,6,8,1,3,5,7];for(let pos of priorities){if(board[pos]==="")return pos;}return null;}
function updateBoard(index,player){board[index]=player;document.getElementsByClassName("cell")[index].innerText=player;checkWinner();}
function checkWinner(){const winPatterns=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(let pattern of winPatterns){const[a,b,c]=pattern;if(board[a]&&board[a]===board[b]&&board[a]===board[c]){document.getElementById("status").innerText=(board[a]==='X'?'You':'Bot')+' Wins!';gameActive=false;return;}}if(!board.includes("")){document.getElementById("status").innerText="Draw!";gameActive=false;}else if(gameActive){document.getElementById("status").innerText="Your Turn (X)";}}
function resetGame(){board=["","","","","","","","",""];gameActive=true;document.querySelectorAll(".cell").forEach(c=>c.innerText="");document.getElementById("status").innerText="Your Turn (X)";}
</script></body></html>`;

/* --------------------------------- LUDO --------------------------------- */
GAME_HTML.L = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Super Ludo</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
:root{--red:#ef4444;--green:#22c55e;--yellow:#eab308;--blue:#3b82f6}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:manipulation;margin:0}
#ludo-board{display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);width:100%;max-width:600px;aspect-ratio:1/1;background:#fff;border:2px solid #000;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);margin:0 auto;border-radius:8px;position:relative}
.cell{border:0.5px solid rgba(0,0,0,.2);position:relative;display:flex;justify-content:center;align-items:center}
.base{grid-row:span 6;grid-column:span 6;border:2px solid #000;position:relative}
.base-red{background-color:var(--red);grid-row:1/span 6;grid-column:1/span 6}
.base-green{background-color:var(--green);grid-row:1/span 6;grid-column:10/span 6}
.base-blue{background-color:var(--blue);grid-row:10/span 6;grid-column:1/span 6}
.base-yellow{background-color:var(--yellow);grid-row:10/span 6;grid-column:10/span 6}
.inner-base{background:#fff;width:70%;height:70%;position:absolute;top:15%;left:15%;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;padding:10%;gap:10%}
.base-slot{background:#f1f5f9;border-radius:50%;width:100%;height:100%;position:relative;box-shadow:inset 0 2px 4px rgba(0,0,0,.1)}
.path-red{background-color:var(--red)}.path-green{background-color:var(--green)}.path-yellow{background-color:var(--yellow)}.path-blue{background-color:var(--blue)}
.safe-spot::after{content:'★';color:rgba(0,0,0,.2);font-size:1.5rem;position:absolute;z-index:0}
.center-goal{grid-column:7/span 3;grid-row:7/span 3;position:relative;background:conic-gradient(var(--green) 0deg 90deg,var(--yellow) 90deg 180deg,var(--blue) 180deg 270deg,var(--red) 270deg 360deg);border:2px solid #000}
.token{width:80%;height:80%;border-radius:50%;border:2px solid #fff;box-shadow:0 3px 6px rgba(0,0,0,.4);z-index:10;transition:all .3s cubic-bezier(.175,.885,.32,1.275);cursor:pointer;position:absolute}
.token.stacked{width:60%;height:60%}
.token-red{background:radial-gradient(circle at 30% 30%,#ff8888,var(--red))}
.token-green{background:radial-gradient(circle at 30% 30%,#88ff88,var(--green))}
.token-yellow{background:radial-gradient(circle at 30% 30%,#ffeb88,var(--yellow))}
.token-blue{background:radial-gradient(circle at 30% 30%,#88bbff,var(--blue))}
.token.highlight{animation:bounce 1s infinite;border:2px solid gold;box-shadow:0 0 10px gold;z-index:20}
@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
#dice{width:60px;height:60px;background:#fff;border-radius:10px;display:flex;justify-content:center;align-items:center;font-size:2rem;font-weight:bold;box-shadow:0 4px 8px rgba(0,0,0,.2);cursor:pointer;border:1px solid #ccc;user-select:none}
#dice.rolling{animation:roll .5s linear infinite}
@keyframes roll{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.player-card{transition:all .3s ease;opacity:.6;transform:scale(.95)}
.player-card.active{opacity:1;transform:scale(1.05);border:2px solid currentColor;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.modal{background:rgba(0,0,0,.7);position:fixed;top:0;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;z-index:100;opacity:0;pointer-events:none;transition:opacity .3s}
.modal.show{opacity:1;pointer-events:auto}
.start-button{transition:all .2s ease}
.start-button.selected{background-color:#4f46e5;color:#fff}
.homepage-card{background:rgba(255,255,255,.95);border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,.3);padding:30px;text-align:center;max-width:90%;width:400px}
.title{font-size:3rem;font-weight:900;background:linear-gradient(45deg,#ef4444,#f59e0b,#10b981,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
.creator{font-size:1rem;color:#4b5563;margin-bottom:1.5rem}
.creator a{color:#4f46e5;text-decoration:none;font-weight:600}
.btn-primary{background:linear-gradient(45deg,#4f46e5,#7c3aed);color:#fff;padding:12px 30px;border-radius:50px;font-weight:bold;font-size:1.2rem;box-shadow:0 5px 15px rgba(79,70,229,.4);border:none;cursor:pointer}
</style></head><body>
<div id="home-screen" class="modal show"><div class="homepage-card">
<h1 class="title">SUPER LUDO</h1>
<p class="creator">Created by <a href="https://taqi.oneapp.dev" target="_blank">Muhammad Taqi</a></p>
<div style="margin-bottom:1.5rem"><label style="display:block;font-size:.875rem;font-weight:600;margin-bottom:.75rem;color:#475569">Game Mode</label>
<div style="display:flex;justify-content:center;gap:.75rem">
<button id="mode-ai" onclick="selectMode('AI')" class="start-button px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 font-medium">Vs AI</button>
<button id="mode-human" onclick="selectMode('HUMAN')" class="start-button px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 font-medium">Multiplayer</button>
</div></div>
<div style="margin-bottom:2rem"><label style="display:block;font-size:.875rem;font-weight:600;margin-bottom:.75rem;color:#475569">Number of Players</label>
<div style="display:flex;justify-content:center;gap:.75rem">
<button id="players-2" onclick="selectPlayerCount(2)" class="start-button px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 font-medium">2</button>
<button id="players-3" onclick="selectPlayerCount(3)" class="start-button px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 font-medium">3</button>
<button id="players-4" onclick="selectPlayerCount(4)" class="start-button px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 font-medium">4</button>
</div></div>
<button onclick="startGame()" class="btn-primary">Start Game</button>
</div></div>
<div style="width:100%;max-width:42rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding:.5rem;background:rgba(255,255,255,.9);border-radius:.75rem">
<h1 style="font-size:1.25rem;font-weight:700;color:#1e293b">Super Ludo</h1>
<button onclick="resetGame()" style="font-size:.875rem;background:#e2e8f0;padding:.25rem .75rem;border-radius:.25rem;border:none;cursor:pointer">Reset</button>
</div>
<div style="display:flex;flex-direction:row;gap:1rem;align-items:center;justify-content:center;width:100%;max-width:56rem;flex-wrap:wrap">
<div style="display:flex;flex-direction:column;gap:1rem;width:8rem">
<div id="p0-card" class="player-card" style="background:#fee2e2;padding:1rem;border-radius:.75rem;text-align:center;color:#b91c1c"><div style="font-weight:700">Red</div><div style="font-size:.75rem;margin-top:.25rem" id="p0-status">Waiting</div></div>
<div id="p3-card" class="player-card" style="background:#dbeafe;padding:1rem;border-radius:.75rem;text-align:center;color:#1d4ed8"><div style="font-weight:700">Blue</div><div style="font-size:.75rem;margin-top:.25rem" id="p3-status">Waiting</div></div>
</div>
<div id="ludo-board">
<div class="base base-red"><div class="inner-base"><div class="base-slot" data-base="0" data-slot="0"></div><div class="base-slot" data-base="0" data-slot="1"></div><div class="base-slot" data-base="0" data-slot="2"></div><div class="base-slot" data-base="0" data-slot="3"></div></div></div>
<div class="base base-green"><div class="inner-base"><div class="base-slot" data-base="1" data-slot="0"></div><div class="base-slot" data-base="1" data-slot="1"></div><div class="base-slot" data-base="1" data-slot="2"></div><div class="base-slot" data-base="1" data-slot="3"></div></div></div>
<div class="base base-blue"><div class="inner-base"><div class="base-slot" data-base="3" data-slot="0"></div><div class="base-slot" data-base="3" data-slot="1"></div><div class="base-slot" data-base="3" data-slot="2"></div><div class="base-slot" data-base="3" data-slot="3"></div></div></div>
<div class="base base-yellow"><div class="inner-base"><div class="base-slot" data-base="2" data-slot="0"></div><div class="base-slot" data-base="2" data-slot="1"></div><div class="base-slot" data-base="2" data-slot="2"></div><div class="base-slot" data-base="2" data-slot="3"></div></div></div>
<div class="center-goal"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:100%;height:100%;position:relative"></div></div></div>
</div>
<div style="display:flex;flex-direction:column;gap:1rem;width:8rem">
<div id="p1-card" class="player-card" style="background:#dcfce7;padding:1rem;border-radius:.75rem;text-align:center;color:#15803d"><div style="font-weight:700">Green</div><div style="font-size:.75rem;margin-top:.25rem" id="p1-status">Waiting</div></div>
<div id="p2-card" class="player-card" style="background:#fef9c3;padding:1rem;border-radius:.75rem;text-align:center;color:#a16207"><div style="font-weight:700">Yellow</div><div style="font-size:.75rem;margin-top:.25rem" id="p2-status">Waiting</div></div>
</div>
</div>
<div style="margin-top:1.5rem;display:flex;flex-direction:column;align-items:center;gap:1rem">
<div style="font-size:1.125rem;font-weight:600;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.3)" id="instruction-text">Red's Turn: Roll Dice</div>
<div id="dice" onclick="handleDiceClick()"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><circle cx="12" cy="12" r="2" fill="currentColor"></circle><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-opacity=".2"></circle></svg></div>
</div>
<div id="winner-modal" class="modal"><div style="background:#fff;padding:2rem;border-radius:1rem;text-align:center;max-width:24rem;margin:0 1rem">
<h2 style="font-size:1.875rem;font-weight:700;margin-bottom:.5rem;color:#eab308">Winner!</h2>
<p id="winner-text" style="font-size:1.25rem;color:#334155;margin-bottom:1.5rem">Red wins the game!</p>
<button onclick="resetGame()" style="background:#4f46e5;color:#fff;padding:.5rem 1.5rem;border-radius:9999px;font-weight:700;border:none;cursor:pointer">Play Again</button>
</div></div>
<script>
const PLAYERS=[{id:0,name:'Red',color:'red',baseClass:'base-red',tokenClass:'token-red'},{id:1,name:'Green',color:'green',baseClass:'base-green',tokenClass:'token-green'},{id:2,name:'Yellow',color:'yellow',baseClass:'base-yellow',tokenClass:'token-yellow'},{id:3,name:'Blue',color:'blue',baseClass:'base-blue',tokenClass:'token-blue'}];
const GLOBAL_PATH=[{x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},{x:6,y:5},{x:6,y:4},{x:6,y:3},{x:6,y:2},{x:6,y:1},{x:6,y:0},{x:7,y:0},{x:8,y:0},{x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},{x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:13,y:6},{x:14,y:6},{x:14,y:7},{x:14,y:8},{x:13,y:8},{x:12,y:8},{x:11,y:8},{x:10,y:8},{x:9,y:8},{x:8,y:9},{x:8,y:10},{x:8,y:11},{x:8,y:12},{x:8,y:13},{x:8,y:14},{x:7,y:14},{x:6,y:14},{x:6,y:13},{x:6,y:12},{x:6,y:11},{x:6,y:10},{x:6,y:9},{x:5,y:8},{x:4,y:8},{x:3,y:8},{x:2,y:8},{x:1,y:8},{x:0,y:8},{x:0,y:7},{x:0,y:6}];
const SAFE_INDICES=[0,8,13,21,26,34,39,47];
const HOME_PATHS=[[{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7},{x:6,y:7}],[{x:7,y:1},{x:7,y:2},{x:7,y:3},{x:7,y:4},{x:7,y:5},{x:7,y:6}],[{x:13,y:7},{x:12,y:7},{x:11,y:7},{x:10,y:7},{x:9,y:7},{x:8,y:7}],[{x:7,y:13},{x:7,y:12},{x:7,y:11},{x:7,y:10},{x:7,y:9},{x:7,y:8}]];
let tokens=[],currentPlayerIndex=0,diceValue=0,gameState='WAIT_ROLL',consecutiveSixes=0;
let gameMode='AI',playerCount=2,activePlayers=[0,1],aiPlayers=[false,true];
function initGame(){const board=document.getElementById('ludo-board');for(let y=0;y<15;y++)for(let x=0;x<15;x++){if((x<6&&y<6)||(x>8&&y<6)||(x<6&&y>8)||(x>8&&y>8))continue;if(x>=6&&x<=8&&y>=6&&y<=8)continue;const cell=document.createElement('div');cell.className='cell';cell.style.gridColumn=x+1;cell.style.gridRow=y+1;cell.id='cell-'+x+'-'+y;if(y===7&&x>0&&x<6)cell.classList.add('path-red');if(x===7&&y>0&&y<6)cell.classList.add('path-green');if(y===7&&x>8&&x<14)cell.classList.add('path-yellow');if(x===7&&y>8&&y<14)cell.classList.add('path-blue');if(x===1&&y===6)cell.classList.add('path-red','safe-spot');if(x===8&&y===1)cell.classList.add('path-green','safe-spot');if(x===13&&y===8)cell.classList.add('path-yellow','safe-spot');if(x===6&&y===13)cell.classList.add('path-blue','safe-spot');if(x===6&&y===2)cell.classList.add('safe-spot');if(x===12&&y===6)cell.classList.add('safe-spot');if(x===8&&y===12)cell.classList.add('safe-spot');if(x===2&&y===8)cell.classList.add('safe-spot');board.appendChild(cell);}}
function resetGame(){document.getElementById('winner-modal').classList.remove('show');tokens=[];activePlayers.forEach(p=>{for(let t=0;t<4;t++)tokens.push({id:p*4+t,player:p,state:'BASE',position:-1,element:null});});currentPlayerIndex=activePlayers[0];diceValue=0;consecutiveSixes=0;gameState='WAIT_ROLL';renderTokens();updateUI();if(aiPlayers[currentPlayerIndex])triggerAI();}
function selectMode(m){gameMode=m;document.getElementById('mode-ai').className='start-button px-4 py-2 rounded-full '+(m==='AI'?'selected font-semibold':'bg-slate-200 hover:bg-slate-300 font-medium');document.getElementById('mode-human').className='start-button px-4 py-2 rounded-full '+(m==='HUMAN'?'selected font-semibold':'bg-slate-200 hover:bg-slate-300 font-medium');}
function selectPlayerCount(c){playerCount=c;document.getElementById('players-2').className='start-button px-4 py-2 rounded-full '+(c===2?'selected font-semibold':'bg-slate-200 hover:bg-slate-300 font-medium');document.getElementById('players-3').className='start-button px-4 py-2 rounded-full '+(c===3?'selected font-semibold':'bg-slate-200 hover:bg-slate-300 font-medium');document.getElementById('players-4').className='start-button px-4 py-2 rounded-full '+(c===4?'selected font-semibold':'bg-slate-200 hover:bg-slate-300 font-medium');}
function startGame(){if(gameMode==='AI'){activePlayers=[];for(let i=0;i<playerCount;i++)activePlayers.push(i);aiPlayers=activePlayers.map((p,idx)=>idx>0);}else{activePlayers=[];for(let i=0;i<playerCount;i++)activePlayers.push(i);aiPlayers=activePlayers.map(()=>false);}document.getElementById('home-screen').classList.remove('show');resetGame();}
function renderTokens(){document.querySelectorAll('.token').forEach(el=>el.remove());const cellMap={};tokens.forEach(token=>{if(token.state==='BASE'){const baseSlot=document.querySelector('.base-slot[data-base="'+token.player+'"][data-slot="'+(token.id%4)+'"]');createTokenElement(token,baseSlot);}else if(token.state==='FINISHED'){const center=document.querySelector('.center-goal');createTokenElement(token,center,true);}else{let coord;if(token.state==='PATH')coord=GLOBAL_PATH[token.position];else if(token.state==='HOME')coord=HOME_PATHS[token.player][token.position];const cellId='cell-'+coord.x+'-'+coord.y;if(!cellMap[cellId])cellMap[cellId]=[];cellMap[cellId].push(token);}});for(const[cellId,tokenList]of Object.entries(cellMap)){const cell=document.getElementById(cellId);tokenList.forEach((token,index)=>{const el=createTokenElement(token,cell);if(tokenList.length>1){el.classList.add('stacked');const offset=(index*5)-((tokenList.length-1)*2.5);el.style.transform='translate('+offset+'px,'+offset+'px)';}});}}
function createTokenElement(token,parent,isFinished){const el=document.createElement('div');el.className='token '+PLAYERS[token.player].tokenClass;el.id='token-'+token.id;if(isFinished){el.style.width='20px';el.style.height='20px';el.style.position='static';el.style.display='inline-block';el.style.margin='2px';}else{el.onclick=(e)=>{e.stopPropagation();handleTokenClick(token);};}token.element=el;parent.appendChild(el);return el;}
function updateUI(){for(let i=0;i<4;i++){const isActive=(i===currentPlayerIndex);const inGame=activePlayers.includes(i);const card=document.getElementById('p'+i+'-card');const status=document.getElementById('p'+i+'-status');if(!inGame){card.classList.add('hidden');card.style.display='none';}else{card.classList.remove('hidden');card.style.display='';if(isActive){card.classList.add('active');status.textContent=gameState==='WAIT_ROLL'?'Rolling...':'Moving...';}else{card.classList.remove('active');status.textContent='Waiting';}}}const pName=PLAYERS[currentPlayerIndex].name;const instruction=document.getElementById('instruction-text');if(gameState==='WAIT_ROLL')instruction.textContent=pName+"'s Turn: Tap Dice";else if(gameState==='WAIT_MOVE')instruction.textContent=pName+"'s Turn: Select Token";else if(gameState==='ANIMATING')instruction.textContent='...';document.querySelectorAll('.token').forEach(t=>t.classList.remove('highlight'));if(gameState==='WAIT_MOVE'){const movables=getMovableTokens(currentPlayerIndex,diceValue);movables.forEach(t=>{if(t.element)t.element.classList.add('highlight');});}}
function handleDiceClick(){if(aiPlayers[currentPlayerIndex])return;if(gameState!=='WAIT_ROLL')return;rollDice();}
function rollDice(){if(gameState!=='WAIT_ROLL')return;const dice=document.getElementById('dice');dice.classList.add('rolling');gameState='ANIMATING';setTimeout(()=>{dice.classList.remove('rolling');diceValue=Math.floor(Math.random()*6)+1;renderDice(diceValue);if(diceValue===6)consecutiveSixes++;else consecutiveSixes=0;if(consecutiveSixes===3){setTimeout(nextTurn,1000);return;}const moves=getMovableTokens(currentPlayerIndex,diceValue);if(moves.length===0){setTimeout(nextTurn,1000);}else{if(aiPlayers[currentPlayerIndex]){setTimeout(()=>aiMove(moves),800);}else{gameState='WAIT_MOVE';updateUI();}}},500);}
function aiMove(moves){if(gameState!=='ANIMATING')return;let chosen=null;for(let m of moves){if(m.state==='PATH'){const startIdx=m.player*13;let stepsTaken=0;if(m.position>=startIdx)stepsTaken=m.position-startIdx;else stepsTaken=(52-startIdx)+m.position;const target=(m.position+diceValue)%52;const isSafe=SAFE_INDICES.includes(target);if(!isSafe){const opponent=tokens.find(t=>t.player!==m.player&&t.state==='PATH'&&t.position===target);if(opponent){chosen=m;break;}}}}if(!chosen)chosen=moves[Math.floor(Math.random()*moves.length)];gameState='WAIT_MOVE';handleTokenClick(chosen);}
function renderDice(val){const dice=document.getElementById('dice');dice.innerHTML='';const pos={1:[[12,12]],2:[[6,6],[18,18]],3:[[6,6],[12,12],[18,18]],4:[[6,6],[18,6],[6,18],[18,18]],5:[[6,6],[18,6],[12,12],[6,18],[18,18]],6:[[6,6],[18,6],[6,12],[18,12],[6,18],[18,18]]};const dots=pos[val].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.5" fill="black"/>').join('');dice.innerHTML='<svg width="100%" height="100%" viewBox="0 0 24 24">'+dots+'</svg>';}
function getMovableTokens(pIndex,roll){return tokens.filter(t=>t.player===pIndex).filter(t=>{if(t.state==='FINISHED')return false;if(t.state==='BASE')return roll===6;if(t.state==='PATH'){const startIdx=pIndex*13;let stepsTaken=0;if(t.position>=startIdx)stepsTaken=t.position-startIdx;else stepsTaken=(52-startIdx)+t.position;if(stepsTaken+roll<=50)return true;if(stepsTaken+roll>56)return false;return true;}if(t.state==='HOME')return(t.position+roll)<=5;return false;});}
function handleTokenClick(token){if(gameState!=='WAIT_MOVE')return;if(token.player!==currentPlayerIndex)return;const movables=getMovableTokens(currentPlayerIndex,diceValue);if(!movables.includes(token))return;gameState='ANIMATING';if(token.state==='BASE'){const startIndices=[0,13,26,39];token.state='PATH';token.position=startIndices[currentPlayerIndex];}else{let stepsToMove=diceValue;if(token.state==='PATH'){const startIdx=token.player*13;let stepsTaken=0;if(token.position>=startIdx)stepsTaken=token.position-startIdx;else stepsTaken=(52-startIdx)+token.position;if(stepsTaken+stepsToMove>50){const movesOnPath=50-stepsTaken;const movesInHome=stepsToMove-movesOnPath-1;token.state='HOME';token.position=movesInHome;}else{token.position=(token.position+stepsToMove)%52;}}else if(token.state==='HOME'){token.position+=stepsToMove;if(token.position===5){token.state='FINISHED';checkWin();}}}let captured=false;if(token.state==='PATH'){const isSafe=SAFE_INDICES.includes(token.position);if(!isSafe){const opponents=tokens.filter(t=>t.player!==currentPlayerIndex&&t.state==='PATH'&&t.position===token.position);if(opponents.length===1){const victim=opponents[0];victim.state='BASE';victim.position=-1;captured=true;}}}renderTokens();updateUI();if(diceValue===6||captured){if(checkWinConditionForCurrentPlayer())return;gameState='WAIT_ROLL';updateUI();if(aiPlayers[currentPlayerIndex])triggerAI();}else{nextTurn();}}
function nextTurn(){const currentIdx=activePlayers.indexOf(currentPlayerIndex);const nextIdx=(currentIdx+1)%activePlayers.length;currentPlayerIndex=activePlayers[nextIdx];diceValue=0;consecutiveSixes=0;gameState='WAIT_ROLL';updateUI();if(aiPlayers[currentPlayerIndex])triggerAI();}
function triggerAI(){if(aiPlayers[currentPlayerIndex]&&gameState==='WAIT_ROLL'){setTimeout(()=>{if(gameState==='WAIT_ROLL')rollDice();},1000);}}
function checkWinConditionForCurrentPlayer(){const playerTokens=tokens.filter(t=>t.player===currentPlayerIndex);const finished=playerTokens.filter(t=>t.state==='FINISHED').length;if(finished===4){showWinner(currentPlayerIndex);return true;}return false;}
function checkWin(){checkWinConditionForCurrentPlayer();}
function showWinner(pIndex){gameState='GAME_OVER';const modal=document.getElementById('winner-modal');const text=document.getElementById('winner-text');text.textContent=PLAYERS[pIndex].name+' wins the game!';modal.classList.add('show');}
initGame();
</script></body></html>`;

/* -------------------------------- TETRIS -------------------------------- */
GAME_HTML.T = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Mobile-Friendly Tetris</title>
<style>
body{background:#111;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:Arial,sans-serif;color:#fff;flex-direction:column;user-select:none;touch-action:manipulation}
#playerInfo{margin-bottom:10px;font-size:18px;display:flex;gap:20px;align-items:center}
#playerInfo input{padding:5px 10px;font-size:16px;border-radius:5px;border:1px solid #555;background:#222;color:#fff}
#playerNameDisplay{margin-bottom:5px;font-size:20px;color:#0dc2ff}
#tetris{border:3px solid #444;background:#000;position:relative}
#scoreBox{margin-bottom:10px;font-size:24px}
#controls{margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
button{padding:10px 20px;background:#333;color:#fff;border:1px solid #555;border-radius:5px;font-size:16px;cursor:pointer}
button:hover{background:#555}
#gameOverOverlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);display:none;justify-content:center;align-items:center;color:#f00;font-size:32px;font-weight:bold;z-index:2;flex-direction:column}
#gameOverOverlay button{margin-top:15px;font-size:20px}
</style></head><body>
<div id="playerInfo">Player: <input type="text" id="playerName" placeholder="Enter your name"><span id="creatorName">Creator: MUHAMMAD TAQI</span></div>
<div id="playerNameDisplay"></div>
<div id="scoreBox">Score: <span id="score">0</span></div>
<div style="position:relative"><canvas id="tetris" width="240" height="400"></canvas>
<div id="gameOverOverlay">Game Over<button id="restartBtn">Restart</button></div></div>
<div id="controls"><button id="leftBtn">◀ Left</button><button id="rightBtn">Right ▶</button><button id="dropBtn">⬇ Drop</button><button id="rotateBtn">⬆ Rotate</button><button id="pauseBtn">⏸ Pause</button><button id="resumeBtn">▶ Resume</button></div>
<script>
const canvas=document.getElementById("tetris"),ctx=canvas.getContext("2d");ctx.scale(20,20);
let dropCounter=0,dropInterval=500,lastTime=0,paused=false,gameOver=false,moveInterval;
const colors=[null,"#FF0D72","#0DC2FF","#0DFF72","#F538FF","#FF8E0D","#FFE138","#3877FF"];
const arena=createMatrix(12,20);const player={pos:{x:0,y:0},matrix:null,score:0};
function arenaSweep(){let rowCount=1;outer:for(let y=arena.length-1;y>0;--y){for(let x=0;x<arena[y].length;++x){if(arena[y][x]===0)continue outer;}const row=arena.splice(y,1)[0].fill(0);arena.unshift(row);++y;player.score+=rowCount*10;rowCount*=2;}}
function collide(arena,player){const[m,o]=[player.matrix,player.pos];for(let y=0;y<m.length;++y)for(let x=0;x<m[y].length;++x)if(m[y][x]!==0&&(arena[y+o.y]&&arena[y+o.y][x+o.x])!==0)return true;return false;}
function createMatrix(w,h){const matrix=[];while(h--)matrix.push(new Array(w).fill(0));return matrix;}
function createPiece(type){const pieces={T:[[0,0,0],[1,1,1],[0,1,0]],O:[[2,2],[2,2]],L:[[0,3,0],[0,3,0],[0,3,3]],J:[[0,4,0],[0,4,0],[4,4,0]],I:[[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]],S:[[0,6,6],[6,6,0],[0,0,0]],Z:[[7,7,0],[0,7,7],[0,0,0]]};return pieces[type];}
function drawMatrix(matrix,offset){matrix.forEach((row,y)=>row.forEach((value,x)=>{if(value!==0){ctx.fillStyle=colors[value];ctx.fillRect(x+offset.x,y+offset.y,1,1);}}));}
function merge(arena,player){player.matrix.forEach((row,y)=>row.forEach((value,x)=>{if(value!==0)arena[y+player.pos.y][x+player.pos.x]=value;}));}
function rotate(matrix,dir){for(let y=0;y<matrix.length;++y)for(let x=0;x<y;++x)[matrix[x][y],matrix[y][x]]=[matrix[y][x],matrix[x][y]];if(dir>0)matrix.forEach(row=>row.reverse());else matrix.reverse();}
function playerDrop(){if(paused||gameOver)return;player.pos.y++;if(collide(arena,player)){player.pos.y--;merge(arena,player);playerReset();arenaSweep();updateScore();}dropCounter=0;}
function playerMove(dir){if(paused||gameOver)return;player.pos.x+=dir;if(collide(arena,player))player.pos.x-=dir;}
function playerReset(){const pieces="TJLOSZI";player.matrix=createPiece(pieces[(pieces.length*Math.random())|0]);player.pos.y=0;player.pos.x=(arena[0].length/2|0)-(player.matrix[0].length/2|0);if(collide(arena,player)){gameOver=true;document.getElementById("gameOverOverlay").style.display="flex";}}
function playerRotate(dir){if(paused||gameOver)return;const pos=player.pos.x;let offset=1;rotate(player.matrix,dir);while(collide(arena,player)){player.pos.x+=offset;offset=-(offset+(offset>0?1:-1));if(offset>player.matrix[0].length){rotate(player.matrix,-dir);player.pos.x=pos;return;}}}
function update(time=0){if(!paused&&!gameOver){const deltaTime=time-lastTime;lastTime=time;dropCounter+=deltaTime;if(dropCounter>dropInterval)playerDrop();draw();}requestAnimationFrame(update);}
function draw(){ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);drawMatrix(arena,{x:0,y:0});drawMatrix(player.matrix,player.pos);}
function updateScore(){const playerName=document.getElementById("playerName").value||"Player";document.getElementById("score").innerText=player.score;document.getElementById("playerNameDisplay").innerText="Player: "+playerName;}
document.addEventListener("keydown",event=>{if(event.key==="ArrowLeft")playerMove(-1);if(event.key==="ArrowRight")playerMove(1);if(event.key==="ArrowDown")playerDrop();if(event.key==="ArrowUp")playerRotate(1);});
function startMove(dir){playerMove(dir);moveInterval=setInterval(()=>playerMove(dir),150);}
function stopMove(){clearInterval(moveInterval);}
const leftBtn=document.getElementById("leftBtn");leftBtn.addEventListener("mousedown",()=>startMove(-1));leftBtn.addEventListener("mouseup",stopMove);leftBtn.addEventListener("mouseleave",stopMove);leftBtn.addEventListener("touchstart",e=>{e.preventDefault();startMove(-1);});leftBtn.addEventListener("touchend",stopMove);
const rightBtn=document.getElementById("rightBtn");rightBtn.addEventListener("mousedown",()=>startMove(1));rightBtn.addEventListener("mouseup",stopMove);rightBtn.addEventListener("mouseleave",stopMove);rightBtn.addEventListener("touchstart",e=>{e.preventDefault();startMove(1);});rightBtn.addEventListener("touchend",stopMove);
const dropBtn=document.getElementById("dropBtn");dropBtn.addEventListener("mousedown",playerDrop);dropBtn.addEventListener("touchstart",e=>{e.preventDefault();playerDrop();});
const rotateBtn=document.getElementById("rotateBtn");rotateBtn.addEventListener("click",()=>playerRotate(1));rotateBtn.addEventListener("touchstart",e=>{e.preventDefault();playerRotate(1);});
const pauseBtn=document.getElementById("pauseBtn");pauseBtn.addEventListener("click",()=>paused=true);
const resumeBtn=document.getElementById("resumeBtn");resumeBtn.addEventListener("click",()=>paused=false);
const restartBtn=document.getElementById("restartBtn");restartBtn.addEventListener("click",()=>{arena.forEach(row=>row.fill(0));player.score=0;updateScore();gameOver=false;paused=false;document.getElementById("gameOverOverlay").style.display="none";playerReset();});
playerReset();update();updateScore();
</script></body></html>`;

/* ------------------------ STONE PAPER SCISSORS -------------------------- */
GAME_HTML.SPS = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>STONE PAPER SEASOR</title>
<style>
:root{--bg-dark:#0f0e17;--bg-card:#1a1a2e;--bg-card2:#16213e;--accent:#e94560;--accent2:#4cc9f0;--accent3:#f72585;--gold:#ffd700;--stone:#8b7355;--paper:#e8e8e8;--scissors:#ff6b6b;--text:#fff;--text-muted:#b0b0b0;--shadow:0 8px 32px rgba(0,0,0,.4)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#0f0e17 0%,#1a1a2e 40%,#16213e 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;color:var(--text);overflow-x:hidden;padding:20px}
.container{position:relative;width:100%;max-width:600px;margin:0 auto}
.screen{display:none;opacity:0;transform:translateY(20px);transition:opacity .4s,transform .4s}
.screen.active{display:block;opacity:1;transform:translateY(0)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.card{background:rgba(26,26,46,.9);border-radius:24px;padding:40px 30px;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(10px);text-align:center}
.game-title{font-size:2.8rem;font-weight:900;letter-spacing:2px;line-height:1.15;margin-bottom:10px;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff6b6b,#4cc9f0,#f72585);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradientShift 6s ease infinite}
@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.game-subtitle{font-size:.9rem;color:var(--text-muted);letter-spacing:4px;text-transform:uppercase;margin-bottom:8px}
.creator-link{display:inline-block;font-size:.95rem;color:var(--gold);text-decoration:none;cursor:pointer;padding:8px 16px;border-radius:20px;transition:all .3s;border:1px solid rgba(255,215,0,.3);margin-bottom:20px;letter-spacing:1px;font-weight:600;background:rgba(255,215,0,.05)}
.creator-link:hover{background:rgba(255,215,0,.15);box-shadow:0 0 30px rgba(255,215,0,.6);transform:translateY(-2px);color:#fff}
.btn{display:inline-block;padding:16px 32px;border-radius:16px;border:none;cursor:pointer;font-size:1.1rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .3s;color:#fff;min-width:200px;line-height:1.4}
.btn-ai{background:linear-gradient(135deg,#4cc9f0,#2a9df4);box-shadow:0 4px 20px rgba(76,201,240,.3)}
.btn-ai:hover{transform:translateY(-3px);box-shadow:0 0 30px rgba(76,201,240,.6)}
.btn-team{background:linear-gradient(135deg,#f72585,#b5179e);box-shadow:0 4px 20px rgba(247,37,133,.3)}
.btn-team:hover{transform:translateY(-3px);box-shadow:0 0 30px rgba(247,37,133,.6)}
.btn-easy{background:linear-gradient(135deg,#2ecc71,#27ae60);box-shadow:0 4px 20px rgba(46,204,113,.3)}
.btn-normal{background:linear-gradient(135deg,#f39c12,#e67e22);box-shadow:0 4px 20px rgba(243,156,18,.3)}
.btn-hard{background:linear-gradient(135deg,#e74c3c,#c0392b);box-shadow:0 4px 20px rgba(231,76,60,.3)}
.btn-back{background:rgba(255,255,255,.1);font-size:.85rem;padding:10px 20px;min-width:auto;border:1px solid rgba(255,255,255,.2);margin-top:15px}
.btn-menu{background:rgba(255,255,255,.08);font-size:.8rem;padding:10px 18px;min-width:auto;border:1px solid rgba(255,255,255,.15);letter-spacing:.5px}
.btn-play-again{background:linear-gradient(135deg,#ffd700,#f9a825);color:#1a1a2e}
.btn-small{padding:10px 20px;font-size:.85rem;min-width:auto;border-radius:12px}
.choice-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:20px 0}
.choice-btn{width:90px;height:90px;border-radius:18px;border:3px solid rgba(255,255,255,.15);cursor:pointer;font-size:2.8rem;transition:all .3s;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);position:relative;flex-shrink:0}
.choice-btn:hover{transform:translateY(-5px) scale(1.05);border-color:rgba(255,255,255,.4);box-shadow:var(--shadow)}
.choice-btn.stone{border-color:rgba(139,115,85,.5);background:rgba(139,115,85,.15)}
.choice-btn.stone:hover{border-color:#8b7355}
.choice-btn.stone.selected{border-color:#8b7355;background:rgba(139,115,85,.35)}
.choice-btn.paper{border-color:rgba(232,232,232,.5);background:rgba(232,232,232,.12)}
.choice-btn.paper:hover{border-color:#e8e8e8}
.choice-btn.paper.selected{border-color:#e8e8e8;background:rgba(232,232,232,.3)}
.choice-btn.scissors{border-color:rgba(255,107,107,.5);background:rgba(255,107,107,.12)}
.choice-btn.scissors:hover{border-color:#ff6b6b}
.choice-btn.scissors.selected{border-color:#ff6b6b;background:rgba(255,107,107,.3)}
.choice-btn .choice-label{position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);white-space:nowrap}
.score-board{display:flex;justify-content:center;align-items:center;gap:20px;margin:15px 0 20px;flex-wrap:wrap}
.score-item{padding:12px 20px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);min-width:80px}
.score-item .score-label{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted)}
.score-item .score-value{font-size:1.8rem;font-weight:900;color:var(--gold)}
.score-item.player-score .score-value{color:#4cc9f0}
.score-item.ai-score .score-value{color:#ff6b6b}
.score-item.p1-score .score-value{color:#4cc9f0}
.score-item.p2-score .score-value{color:#f72585}
.score-item.tie-score .score-value{color:#ffd700}
.score-divider{font-size:1.5rem;color:var(--text-muted);font-weight:300}
.vs-indicator{font-size:1.4rem;font-weight:900;letter-spacing:3px;color:var(--accent);margin:10px 0}
.ai-thinking{font-size:2.5rem;display:flex;gap:8px;justify-content:center;align-items:center;padding:15px}
.result-area{margin-top:20px;padding:20px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.result-area.win{border-color:rgba(46,204,113,.5);background:rgba(46,204,113,.1)}
.result-area.lose{border-color:rgba(231,76,60,.5);background:rgba(231,76,60,.1)}
.result-area.tie{border-color:rgba(255,215,0,.5);background:rgba(255,215,0,.08)}
.result-area .result-text{font-size:1.4rem;font-weight:800;letter-spacing:1px;margin-bottom:6px}
.result-area.win .result-text{color:#2ecc71}
.result-area.lose .result-text{color:#e74c3c}
.result-area.tie .result-text{color:#ffd700}
.result-area .result-detail{font-size:.9rem;color:var(--text-muted)}
.result-choices-display{display:flex;align-items:center;gap:20px;margin:10px 0;flex-wrap:wrap;justify-content:center}
.result-choice{text-align:center;font-size:2.8rem;padding:10px;border-radius:14px;background:rgba(255,255,255,.06);min-width:80px;border:2px solid rgba(255,255,255,.1)}
.result-choice.winner{border-color:#ffd700;box-shadow:0 0 30px rgba(255,215,0,.6);background:rgba(255,215,0,.12)}
.result-choice .rc-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-top:4px}
.turn-indicator{font-size:1.3rem;font-weight:800;letter-spacing:1px;padding:12px 20px;border-radius:12px;background:rgba(76,201,240,.15);border:1px solid rgba(76,201,240,.3);margin:10px 0}
.turn-indicator.p2-turn{background:rgba(247,37,133,.15);border-color:rgba(247,37,133,.3)}
.difficulty-desc{font-size:.8rem;color:var(--text-muted);letter-spacing:.5px;display:block;font-weight:400;margin-top:4px;text-transform:none}
@media(max-width:480px){.card{padding:25px 18px;border-radius:18px}.game-title{font-size:2rem}.btn{padding:13px 20px;font-size:.9rem;min-width:160px}.choice-btn{width:70px;height:70px;font-size:2.2rem}.choice-btn .choice-label{bottom:-22px;font-size:.6rem}.score-item{padding:8px 14px;min-width:60px}.score-item .score-value{font-size:1.4rem}.score-board{gap:10px}.result-choice{font-size:2rem;min-width:60px}.choice-buttons{gap:10px;margin:15px 0 28px}}
</style></head><body>
<div class="container">
<div id="screen-main" class="screen active"><div class="card">
<div class="game-subtitle">★ THE CLASSIC GAME ★</div>
<h1 class="game-title">Stone<br>Paper<br>Seasor</h1>
<p style="font-size:.85rem;color:var(--text-muted);margin-bottom:18px;letter-spacing:1px">✊ &nbsp; ✋ &nbsp; ✌️</p>
<a href="https://taqi.oneapp.dev" target="_blank" class="creator-link">✨ Created by MUHAMMAD TAQI ✨</a>
<div style="display:flex;flex-direction:column;gap:14px;align-items:center;margin-top:10px">
<button class="btn btn-ai" onclick="showDifficulty()">🎮 PLAY GAME WITH AI</button>
<button class="btn btn-team" onclick="startTeamGame()">👥 PLAY WITH TEAM</button>
</div>
<p style="font-size:.7rem;color:var(--text-muted);margin-top:18px">Stone breaks Scissors • Scissors cut Paper • Paper covers Stone</p>
</div></div>
<div id="screen-difficulty" class="screen"><div class="card">
<div class="game-subtitle">🎮 AI MODE</div>
<h2 style="font-size:1.6rem;font-weight:800;letter-spacing:2px;margin-bottom:20px;text-transform:uppercase">Select Difficulty</h2>
<div style="display:flex;flex-direction:column;gap:14px;align-items:center">
<button class="btn btn-easy" onclick="startAIGame('easy')">🌱 EASY<span class="difficulty-desc">AI Genius Na Ho</span></button>
<button class="btn btn-normal" onclick="startAIGame('normal')">⚡ NORMAL<span class="difficulty-desc">AI Normal Ho</span></button>
<button class="btn btn-hard" onclick="startAIGame('hard')">🔥 HARD<span class="difficulty-desc">AI Genius Ho</span></button>
</div>
<button class="btn btn-back" onclick="showMainMenu()">← Back to Menu</button>
</div></div>
<div id="screen-ai-game" class="screen"><div class="card">
<div class="game-subtitle" id="ai-difficulty-label">🎮 AI MODE - EASY</div>
<div class="score-board">
<div class="score-item player-score"><div class="score-label">You</div><div class="score-value" id="ai-player-score">0</div></div>
<div class="score-divider">:</div>
<div class="score-item tie-score"><div class="score-label">Ties</div><div class="score-value" id="ai-tie-score">0</div></div>
<div class="score-divider">:</div>
<div class="score-item ai-score"><div class="score-label">AI</div><div class="score-value" id="ai-ai-score">0</div></div>
</div>
<div id="ai-choice-display" style="min-height:110px;display:flex;align-items:center;justify-content:center"><div style="font-size:1rem;color:var(--text-muted)">AI is ready...</div></div>
<div class="vs-indicator">⚡ VS ⚡</div>
<div id="player-choice-display" style="min-height:60px;display:flex;align-items:center;justify-content:center"><div style="font-size:1rem;color:var(--text-muted)">Select your move below</div></div>
<div class="choice-buttons" id="ai-choice-buttons">
<button class="choice-btn stone" onclick="playAIMove('stone')" title="Stone">✊<span class="choice-label">Stone</span></button>
<button class="choice-btn paper" onclick="playAIMove('paper')" title="Paper">✋<span class="choice-label">Paper</span></button>
<button class="choice-btn scissors" onclick="playAIMove('scissors')" title="Scissors">✌️<span class="choice-label">Scissors</span></button>
</div>
<div id="ai-result-area" class="result-area" style="display:none"><div class="result-text" id="ai-result-text"></div><div class="result-choices-display" id="ai-result-choices"></div><div class="result-detail" id="ai-result-detail"></div></div>
<button class="btn btn-menu" onclick="showMainMenu()" style="margin-top:18px">🏠 Menu</button>
</div></div>
<div id="screen-team-game" class="screen"><div class="card">
<div class="game-subtitle">👥 TEAM MODE</div>
<div class="score-board">
<div class="score-item p1-score"><div class="score-label">Player 1</div><div class="score-value" id="team-p1-score">0</div></div>
<div class="score-divider">:</div>
<div class="score-item tie-score"><div class="score-label">Ties</div><div class="score-value" id="team-tie-score">0</div></div>
<div class="score-divider">:</div>
<div class="score-item p2-score"><div class="score-label">Player 2</div><div class="score-value" id="team-p2-score">0</div></div>
</div>
<div id="team-turn-indicator" class="turn-indicator">🎮 Player 1's Turn</div>
<div class="choice-buttons" id="team-choice-buttons" style="margin-top:15px">
<button class="choice-btn stone" onclick="playTeamMove('stone')" title="Stone">✊<span class="choice-label">Stone</span></button>
<button class="choice-btn paper" onclick="playTeamMove('paper')" title="Paper">✋<span class="choice-label">Paper</span></button>
<button class="choice-btn scissors" onclick="playTeamMove('scissors')" title="Scissors">✌️<span class="choice-label">Scissors</span></button>
</div>
<div id="team-result-area" class="result-area" style="display:none"><div class="result-text" id="team-result-text"></div><div class="result-choices-display" id="team-result-choices"></div><div class="result-detail" id="team-result-detail"></div><button class="btn btn-play-again btn-small" onclick="resetTeamRound()" style="margin-top:14px">🔄 Next Round</button></div>
<button class="btn btn-menu" onclick="showMainMenu()" style="margin-top:18px">🏠 Menu</button>
</div></div>
</div>
<script>
const state={mode:null,difficulty:null,aiPlayerScore:0,aiScore:0,aiTies:0,teamP1Score:0,teamP2Score:0,teamTies:0,teamStep:'player1',teamP1Choice:null,teamP2Choice:null,aiPlayerChoice:null,aiChoice:null,aiButtonsLocked:false,moveHistory:[],transitionMatrix:[[0,0,0],[0,0,0],[0,0,0]],moveCounts:[0,0,0],lastUserMove:-1};
const MOVE_MAP={stone:0,paper:1,scissors:2};const MOVE_EMOJI=['✊','✋','✌️'];const MOVE_NAME=['Stone','Paper','Scissors'];
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));const screen=document.getElementById(id);if(screen)screen.classList.add('active');}
function showMainMenu(){state.mode=null;state.difficulty=null;state.aiPlayerChoice=null;state.aiChoice=null;state.aiButtonsLocked=false;state.teamStep='player1';state.teamP1Choice=null;state.teamP2Choice=null;document.getElementById('ai-result-area').style.display='none';document.getElementById('team-result-area').style.display='none';resetAIChoiceDisplay();resetPlayerChoiceDisplay();showScreen('screen-main');}
function showDifficulty(){showScreen('screen-difficulty');}
function startAIGame(d){state.mode='ai';state.difficulty=d;state.aiPlayerScore=0;state.aiScore=0;state.aiTies=0;state.aiPlayerChoice=null;state.aiChoice=null;state.aiButtonsLocked=false;state.moveHistory=[];state.transitionMatrix=[[0,0,0],[0,0,0],[0,0,0]];state.moveCounts=[0,0,0];state.lastUserMove=-1;const diffLabel=d==='easy'?'🌱 EASY':d==='normal'?'⚡ NORMAL':'🔥 HARD';document.getElementById('ai-difficulty-label').textContent='🎮 AI MODE - '+diffLabel;updateAIScores();resetAIChoiceDisplay();resetPlayerChoiceDisplay();document.getElementById('ai-result-area').style.display='none';enableAIButtons(true);showScreen('screen-ai-game');}
function updateAIScores(){document.getElementById('ai-player-score').textContent=state.aiPlayerScore;document.getElementById('ai-ai-score').textContent=state.aiScore;document.getElementById('ai-tie-score').textContent=state.aiTies;}
function resetAIChoiceDisplay(){document.getElementById('ai-choice-display').innerHTML='<div style="font-size:1rem;color:var(--text-muted)">AI is ready...</div>';}
function resetPlayerChoiceDisplay(){document.getElementById('player-choice-display').innerHTML='<div style="font-size:1rem;color:var(--text-muted)">Select your move below</div>';}
function enableAIButtons(enabled){const buttons=document.querySelectorAll('#ai-choice-buttons .choice-btn');buttons.forEach(btn=>{btn.disabled=!enabled;btn.style.opacity=enabled?'1':'0.5';btn.style.cursor=enabled?'pointer':'not-allowed';btn.classList.remove('selected');});state.aiButtonsLocked=!enabled;}
function showAIThinking(){document.getElementById('ai-choice-display').innerHTML='<div class="ai-thinking"><span>🤖</span><span style="font-size:.8rem;color:var(--text-muted)">thinking</span><span>.</span><span>.</span><span>.</span></div>';}
function playAIMove(playerMove){if(state.aiButtonsLocked)return;state.aiButtonsLocked=true;state.aiPlayerChoice=playerMove;document.querySelectorAll('#ai-choice-buttons .choice-btn').forEach(btn=>{btn.classList.remove('selected');if(btn.classList.contains(playerMove))btn.classList.add('selected');btn.disabled=true;btn.style.opacity='0.5';btn.style.cursor='not-allowed';});const playerIdx=MOVE_MAP[playerMove];document.getElementById('player-choice-display').innerHTML='<div style="text-align:center"><span style="font-size:3rem">'+MOVE_EMOJI[playerIdx]+'</span><div style="font-size:.8rem;color:var(--text-muted)">'+MOVE_NAME[playerIdx]+'</div></div>';showAIThinking();const delay=700+Math.random()*600;setTimeout(()=>{const aiMove=getAIChoice();state.aiChoice=aiMove;const aiIdx=MOVE_MAP[aiMove];document.getElementById('ai-choice-display').innerHTML='<div style="text-align:center"><span style="font-size:3rem">'+MOVE_EMOJI[aiIdx]+'</span><div style="font-size:.8rem;color:var(--text-muted)">AI chose '+MOVE_NAME[aiIdx]+'</div></div>';const result=determineWinner(playerMove,aiMove);showAIResult(result,playerMove,aiMove);updateAIModel(playerIdx);setTimeout(()=>{enableAIButtons(true);},1200);},delay);}
function getAIChoice(){switch(state.difficulty){case'easy':return getEasyAIChoice();case'normal':return getNormalAIChoice();case'hard':return getHardAIChoice();default:return getEasyAIChoice();}}
function getEasyAIChoice(){const r=Math.floor(Math.random()*3);return['stone','paper','scissors'][r];}
function getNormalAIChoice(){if(Math.random()<0.45&&state.lastUserMove!==-1){const counter=(state.lastUserMove+1)%3;return['stone','paper','scissors'][counter];}if(Math.random()<0.3&&state.moveCounts.some(c=>c>0)){const mostFreq=getMostFrequentMoveIndex();const counter=(mostFreq+1)%3;return['stone','paper','scissors'][counter];}const r=Math.floor(Math.random()*3);return['stone','paper','scissors'][r];}
function getHardAIChoice(){const predicted=predictUserMove();const counter=(predicted+1)%3;return['stone','paper','scissors'][counter];}
function predictUserMove(){if(state.lastUserMove===-1)return getMostFrequentMoveIndex();const row=state.transitionMatrix[state.lastUserMove];const total=row[0]+row[1]+row[2];if(total>=3){const maxVal=Math.max(row[0],row[1],row[2]);if(row[0]===maxVal)return 0;if(row[1]===maxVal)return 1;return 2;}return getMostFrequentMoveIndex();}
function getMostFrequentMoveIndex(){const maxVal=Math.max(state.moveCounts[0],state.moveCounts[1],state.moveCounts[2]);if(state.moveCounts[0]===maxVal)return 0;if(state.moveCounts[1]===maxVal)return 1;return 2;}
function updateAIModel(userMoveIdx){if(state.lastUserMove!==-1){state.transitionMatrix[state.lastUserMove][userMoveIdx]++;}state.moveCounts[userMoveIdx]++;state.lastUserMove=userMoveIdx;state.moveHistory.push(userMoveIdx);}
function determineWinner(m1,m2){const a=MOVE_MAP[m1],b=MOVE_MAP[m2];if(a===b)return'tie';if((a===0&&b===2)||(a===1&&b===0)||(a===2&&b===1))return'player1';return'player2';}
function getWinDetail(w,m1,m2){const a=MOVE_MAP[m1],b=MOVE_MAP[m2];if(a===0&&b===2)return'Stone breaks Scissors';if(a===1&&b===0)return'Paper covers Stone';if(a===2&&b===1)return'Scissors cut Paper';if(b===0&&a===2)return'Stone breaks Scissors';if(b===1&&a===0)return'Paper covers Stone';if(b===2&&a===1)return'Scissors cut Paper';return'';}
function showAIResult(result,playerMove,aiMove){const area=document.getElementById('ai-result-area');const textEl=document.getElementById('ai-result-text');const choicesEl=document.getElementById('ai-result-choices');const detailEl=document.getElementById('ai-result-detail');area.style.display='flex';area.classList.remove('win','lose','tie');const pIdx=MOVE_MAP[playerMove],aIdx=MOVE_MAP[aiMove];if(result==='player1'){area.classList.add('win');textEl.textContent='🎉 You Win!';state.aiPlayerScore++;}else if(result==='player2'){area.classList.add('lose');textEl.textContent='😔 AI Wins!';state.aiScore++;}else{area.classList.add('tie');textEl.textContent='🤝 Tie! Play Again!';state.aiTies++;}detailEl.textContent=result==='tie'?'Same move — go again!':getWinDetail(result,playerMove,aiMove);choicesEl.innerHTML='<div class="result-choice '+(result==='player1'?'winner':'')+'">'+MOVE_EMOJI[pIdx]+'<div class="rc-label">You ('+MOVE_NAME[pIdx]+')</div></div><span style="font-size:1.5rem;font-weight:900;color:var(--text-muted)">VS</span><div class="result-choice '+(result==='player2'?'winner':'')+'">'+MOVE_EMOJI[aIdx]+'<div class="rc-label">AI ('+MOVE_NAME[aIdx]+')</div></div>';updateAIScores();}
function startTeamGame(){state.mode='team';state.teamP1Score=0;state.teamP2Score=0;state.teamTies=0;state.teamStep='player1';state.teamP1Choice=null;state.teamP2Choice=null;updateTeamScores();document.getElementById('team-result-area').style.display='none';document.getElementById('team-turn-indicator').textContent='🎮 Player 1\'s Turn';document.getElementById('team-turn-indicator').classList.remove('p2-turn');enableTeamButtons(true);showScreen('screen-team-game');}
function updateTeamScores(){document.getElementById('team-p1-score').textContent=state.teamP1Score;document.getElementById('team-p2-score').textContent=state.teamP2Score;document.getElementById('team-tie-score').textContent=state.teamTies;}
function enableTeamButtons(enabled){const buttons=document.querySelectorAll('#team-choice-buttons .choice-btn');buttons.forEach(btn=>{btn.disabled=!enabled;btn.style.opacity=enabled?'1':'0.5';btn.style.cursor=enabled?'pointer':'not-allowed';btn.classList.remove('selected');});}
function playTeamMove(move){if(state.teamStep==='result')return;if(state.teamStep==='player1'){state.teamP1Choice=move;document.querySelectorAll('#team-choice-buttons .choice-btn').forEach(btn=>{btn.classList.remove('selected');if(btn.classList.contains(move))btn.classList.add('selected');btn.disabled=true;btn.style.opacity='0.5';});state.teamStep='player2';document.getElementById('team-turn-indicator').textContent='🎮 Player 2\'s Turn';document.getElementById('team-turn-indicator').classList.add('p2-turn');setTimeout(()=>{enableTeamButtons(true);},500);}else if(state.teamStep==='player2'){state.teamP2Choice=move;state.teamStep='result';document.getElementById('team-turn-indicator').textContent='⚡ Result';document.querySelectorAll('#team-choice-buttons .choice-btn').forEach(btn=>{btn.classList.remove('selected');if(btn.classList.contains(move))btn.classList.add('selected');btn.disabled=true;btn.style.opacity='0.5';});const result=determineWinner(state.teamP1Choice,state.teamP2Choice);showTeamResult(result);}}
function showTeamResult(result){const area=document.getElementById('team-result-area');const textEl=document.getElementById('team-result-text');const choicesEl=document.getElementById('team-result-choices');const detailEl=document.getElementById('team-result-detail');area.style.display='flex';area.classList.remove('win','lose','tie');const p1Idx=MOVE_MAP[state.teamP1Choice],p2Idx=MOVE_MAP[state.teamP2Choice];if(result==='player1'){area.classList.add('win');textEl.textContent='🏆 Player 1 Wins!';state.teamP1Score++;}else if(result==='player2'){area.classList.add('win');textEl.textContent='🏆 Player 2 Wins!';state.teamP2Score++;}else{area.classList.add('tie');textEl.textContent='🤝 Tie! Play Again!';state.teamTies++;}detailEl.textContent=result==='tie'?'Same move — go again!':getWinDetail(result,state.teamP1Choice,state.teamP2Choice);choicesEl.innerHTML='<div class="result-choice '+(result==='player1'?'winner':'')+'">'+MOVE_EMOJI[p1Idx]+'<div class="rc-label">P1 ('+MOVE_NAME[p1Idx]+')</div></div><span style="font-size:1.5rem;font-weight:900;color:var(--text-muted)">VS</span><div class="result-choice '+(result==='player2'?'winner':'')+'">'+MOVE_EMOJI[p2Idx]+'<div class="rc-label">P2 ('+MOVE_NAME[p2Idx]+')</div></div>';updateTeamScores();}
function resetTeamRound(){state.teamStep='player1';state.teamP1Choice=null;state.teamP2Choice=null;document.getElementById('team-result-area').style.display='none';document.getElementById('team-turn-indicator').textContent='🎮 Player 1\'s Turn';document.getElementById('team-turn-indicator').classList.remove('p2-turn');enableTeamButtons(true);}
showMainMenu();
</script></body></html>`;

/* --------------------------------- SNAKE -------------------------------- */
GAME_HTML.S = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><title>Neon Snake</title>
<style>
:root{--bg-primary:#0a0a14;--bg-card:rgba(255,255,255,.04);--border-glass:rgba(255,255,255,.1);--text-primary:#e8e8f0;--text-secondary:#a0a0b8;--text-muted:#606078;--neon-green:#00ff88;--neon-yellow:#ffcc00;--neon-red:#ff3355;--neon-cyan:#00ddff;--neon-purple:#aa44ff}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background-image:radial-gradient(ellipse at 20% 20%,rgba(0,255,136,.05) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(170,68,255,.05) 0%,transparent 50%)}
#app{width:100%;max-width:560px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:16px;max-height:100vh;overflow-y:auto}
.glass-panel{background:var(--bg-card);backdrop-filter:blur(20px);border:1px solid var(--border-glass);border-radius:24px;padding:24px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.screen{display:none;width:100%;flex-direction:column;align-items:center;gap:16px}
.screen.active{display:flex}
.game-title{font-size:clamp(2rem,6vw,3.2rem);font-weight:800;text-align:center;letter-spacing:-1px;background:linear-gradient(135deg,var(--neon-green),var(--neon-cyan),var(--neon-purple));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1}
.game-subtitle{font-size:clamp(.8rem,2vw,1rem);color:var(--text-secondary);text-align:center;letter-spacing:2px;text-transform:uppercase}
.difficulty-container{display:flex;flex-direction:column;gap:10px;width:100%;margin-top:8px}
.difficulty-btn{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-radius:16px;border:1px solid var(--border-glass);background:var(--bg-card);cursor:pointer;transition:.3s;color:var(--text-primary);font-size:1rem;font-weight:500;text-align:left;width:100%;font-family:inherit}
.difficulty-btn:hover{background:rgba(255,255,255,.08);transform:translateY(-2px)}
.diff-icon{font-size:1.6rem;margin-right:14px}
.diff-info{flex:1;display:flex;flex-direction:column;gap:2px}
.diff-name{font-weight:700;font-size:1.05rem}
.diff-desc{font-size:.8rem;color:var(--text-secondary)}
.diff-score-badge{font-size:.75rem;padding:4px 10px;border-radius:20px;font-weight:600}
.badge-easy{background:rgba(0,255,136,.15);color:var(--neon-green);border:1px solid rgba(0,255,136,.3)}
.badge-normal{background:rgba(255,204,0,.15);color:var(--neon-yellow);border:1px solid rgba(255,204,0,.3)}
.badge-hard{background:rgba(255,51,85,.15);color:var(--neon-red);border:1px solid rgba(255,51,85,.3)}
.high-scores{display:flex;gap:8px;width:100%;flex-wrap:wrap;justify-content:center}
.hs-chip{padding:6px 14px;border-radius:20px;font-size:.75rem;font-weight:500;background:var(--bg-card);border:1px solid var(--border-glass);color:var(--text-secondary)}
.hs-chip .hs-val{color:var(--text-primary);font-weight:700;font-family:monospace}
.hud{display:flex;align-items:center;justify-content:space-between;width:100%;gap:10px;flex-wrap:wrap}
.hud-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 16px;border-radius:10px;background:var(--bg-card);border:1px solid var(--border-glass);min-width:70px}
.hud-label{font-size:.65rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);font-weight:500}
.hud-value{font-size:1.3rem;font-weight:800;font-family:monospace;line-height:1}
.hud-value.score-val{color:var(--neon-green)}
.hud-value.best-val{color:var(--neon-yellow)}
.hud-value.level-val{color:var(--neon-cyan)}
.btn-icon{background:var(--bg-card);border:1px solid var(--border-glass);border-radius:10px;padding:8px 14px;cursor:pointer;font-size:1.2rem;color:var(--text-primary);font-family:inherit}
.btn-icon:hover{background:rgba(255,255,255,.08)}
.canvas-wrapper{position:relative;width:100%;aspect-ratio:1/1;border-radius:16px;overflow:hidden;border:2px solid var(--border-glass);box-shadow:0 8px 32px rgba(0,0,0,.5);background:#0d0d1a}
#gameCanvas{width:100%;height:100%;display:block;border-radius:14px;cursor:pointer;touch-action:none}
.dpad-container{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:4px}
.dpad-row{display:flex;gap:6px}
.dpad-btn{width:56px;height:56px;border-radius:10px;background:var(--bg-card);border:1px solid var(--border-glass);color:var(--text-primary);font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;touch-action:manipulation}
.dpad-btn:active{transform:scale(.9);background:rgba(255,255,255,.08);border-color:var(--neon-green)}
.dpad-btn.blank{visibility:hidden}
@media(max-width:380px){.dpad-btn{width:44px;height:44px;font-size:1.1rem}}
.overlay{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(10px)}
.overlay.active{display:flex}
.overlay-content{background:#12121f;border:1px solid var(--border-glass);border-radius:24px;padding:32px 28px;max-width:400px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.6)}
.overlay-title{font-size:2rem;font-weight:800;margin-bottom:8px}
.overlay-title.game-over-title{color:var(--neon-red)}
.overlay-title.paused-title{color:var(--neon-yellow)}
.overlay-score{font-size:3rem;font-weight:800;font-family:monospace;color:var(--neon-green);margin:12px 0}
.overlay-detail{font-size:.9rem;color:var(--text-secondary);margin-bottom:4px}
.overlay-buttons{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;justify-content:center}
.btn-primary{padding:12px 28px;border-radius:16px;border:none;background:linear-gradient(135deg,var(--neon-green),var(--neon-cyan));color:#000;font-weight:700;font-size:.95rem;cursor:pointer;text-transform:uppercase;font-family:inherit}
.btn-secondary{padding:12px 28px;border-radius:16px;border:1px solid var(--border-glass);background:var(--bg-card);color:var(--text-primary);font-weight:600;font-size:.95rem;cursor:pointer;text-transform:uppercase;font-family:inherit}
.new-record{display:inline-block;padding:6px 18px;border-radius:20px;background:linear-gradient(135deg,#ffcc00,#ff8833);color:#000;font-weight:700;font-size:.85rem;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
@media(max-width:480px){#app{padding:8px;gap:10px}.glass-panel{padding:16px}.hud-item{padding:6px 10px;min-width:56px}.hud-value{font-size:1rem}.overlay-content{padding:24px 18px}.overlay-score{font-size:2.4rem}}
</style></head><body>
<div id="app">
<div class="screen active" id="startScreen"><div class="glass-panel" style="text-align:center">
<div class="game-title">NEON SNAKE</div>
<div class="game-subtitle" style="margin-top:4px">⚡ Modern Arcade Edition ⚡</div>
<div style="margin-top:16px;font-size:.85rem;color:var(--text-secondary)">Choose your difficulty to begin</div>
<div class="difficulty-container" style="margin-top:16px">
<button class="difficulty-btn" data-difficulty="easy"><span class="diff-icon">🌱</span><span class="diff-info"><span class="diff-name">Easy</span><span class="diff-desc">Slow & relaxed · +5 pts per food</span></span><span class="diff-score-badge badge-easy">Relaxed</span></button>
<button class="difficulty-btn" data-difficulty="normal"><span class="diff-icon">🔥</span><span class="diff-info"><span class="diff-name">Normal</span><span class="diff-desc">Balanced pace · +10 pts per food</span></span><span class="diff-score-badge badge-normal">Classic</span></button>
<button class="difficulty-btn" data-difficulty="hard"><span class="diff-icon">💀</span><span class="diff-info"><span class="diff-name">Hard</span><span class="diff-desc">Blazing fast · +15 pts per food</span></span><span class="diff-score-badge badge-hard">Extreme</span></button>
</div>
<div style="margin-top:16px"><div style="font-size:.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--text-muted);margin-bottom:8px">🏆 Best Scores</div>
<div class="high-scores">
<span class="hs-chip">Easy: <span class="hs-val" id="hsEasy">0</span></span>
<span class="hs-chip">Normal: <span class="hs-val" id="hsNormal">0</span></span>
<span class="hs-chip">Hard: <span class="hs-val" id="hsHard">0</span></span>
</div></div>
<div style="margin-top:16px;font-size:.7rem;color:var(--text-muted)">⌨️ Arrow Keys/WASD · 📱 Swipe/D-Pad · ⏸ Space to Pause</div>
</div></div>
<div class="screen" id="gameScreen">
<div class="hud">
<div class="hud-item"><span class="hud-label">Score</span><span class="hud-value score-val" id="scoreDisplay">0</span></div>
<div class="hud-item"><span class="hud-label">Best</span><span class="hud-value best-val" id="bestDisplay">0</span></div>
<div class="hud-item"><span class="hud-label">Level</span><span class="hud-value level-val" id="levelDisplay">Normal</span></div>
<button class="btn-icon" id="pauseBtn">⏸</button>
</div>
<div class="canvas-wrapper"><canvas id="gameCanvas"></canvas></div>
<div class="dpad-container" id="dpadContainer">
<div class="dpad-row"><div class="dpad-btn blank"></div><button class="dpad-btn" data-dir="up">▲</button><div class="dpad-btn blank"></div></div>
<div class="dpad-row"><button class="dpad-btn" data-dir="left">◀</button><button class="dpad-btn" data-dir="down">▼</button><button class="dpad-btn" data-dir="right">▶</button></div>
</div>
</div>
</div>
<div class="overlay" id="pauseOverlay"><div class="overlay-content">
<div class="overlay-title paused-title">⏸ PAUSED</div>
<div class="overlay-detail">Take a breather. The snake waits.</div>
<div class="overlay-buttons"><button class="btn-primary" id="resumeBtn">▶ Resume</button><button class="btn-secondary" id="quitBtn">🏠 Menu</button></div>
</div></div>
<div class="overlay" id="gameOverOverlay"><div class="overlay-content">
<div class="overlay-title game-over-title">💥 GAME OVER</div>
<div id="newRecordBadge" class="new-record" style="display:none">🏆 NEW RECORD!</div>
<div class="overlay-detail">Your Score</div>
<div class="overlay-score" id="finalScore">0</div>
<div class="overlay-detail" id="finalDetail">Normal · 0 foods eaten</div>
<div class="overlay-buttons"><button class="btn-primary" id="playAgainBtn">🔄 Play Again</button><button class="btn-secondary" id="menuBtn">🏠 Menu</button></div>
</div></div>
<script>
(function(){
const GRID_SIZE=20;
const DIFFICULTIES={easy:{tickSpeed:180,pointsPerFood:5,label:'Easy',color:'#00ff88'},normal:{tickSpeed:110,pointsPerFood:10,label:'Normal',color:'#ffcc00'},hard:{tickSpeed:60,pointsPerFood:15,label:'Hard',color:'#ff3355'}};
const DIRECTIONS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const OPPOSITES={up:'down',down:'up',left:'right',right:'left'};
const startScreen=document.getElementById('startScreen'),gameScreen=document.getElementById('gameScreen'),pauseOverlay=document.getElementById('pauseOverlay'),gameOverOverlay=document.getElementById('gameOverOverlay'),canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d'),scoreDisplay=document.getElementById('scoreDisplay'),bestDisplay=document.getElementById('bestDisplay'),levelDisplay=document.getElementById('levelDisplay'),finalScore=document.getElementById('finalScore'),finalDetail=document.getElementById('finalDetail'),newRecordBadge=document.getElementById('newRecordBadge'),hsEasy=document.getElementById('hsEasy'),hsNormal=document.getElementById('hsNormal'),hsHard=document.getElementById('hsHard');
let difficulty='normal',snake=[],direction='right',nextDirection='right',food={x:10,y:10},score=0,foodsEaten=0,gameRunning=false,gamePaused=false,gameLoopInterval=null,animationFrame=null,particles=[],lastTickTime=0,cellSize=0;
let highScores={easy:parseInt(localStorage.getItem('snake_hs_easy')||'0'),normal:parseInt(localStorage.getItem('snake_hs_normal')||'0'),hard:parseInt(localStorage.getItem('snake_hs_hard')||'0')};
function updateHighScoreDisplay(){hsEasy.textContent=highScores.easy;hsNormal.textContent=highScores.normal;hsHard.textContent=highScores.hard;}
function saveHighScore(d,s){if(s>highScores[d]){highScores[d]=s;localStorage.setItem('snake_hs_'+d,String(s));updateHighScoreDisplay();return true;}return false;}
function resizeCanvas(){const wrapper=canvas.parentElement;const rect=wrapper.getBoundingClientRect();const size=Math.floor(rect.width);canvas.width=size;canvas.height=size;cellSize=size/GRID_SIZE;if(gameRunning&&!gamePaused)render();}
function spawnParticles(x,y,count=12){const cx=x*cellSize+cellSize/2,cy=y*cellSize+cellSize/2,color=DIFFICULTIES[difficulty].color;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=(Math.random()*3+2)*cellSize/20,l=.4+Math.random()*.6,sz=(Math.random()*4+2)*cellSize/20;particles.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:l,maxLife:l,size:sz,color:color});}}
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=.08*dt*60;p.life-=dt;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){const a=p.life/p.maxLife;ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=10*a;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;}
function initSnake(){const c=Math.floor(GRID_SIZE/2);snake=[{x:c,y:c},{x:c-1,y:c},{x:c-2,y:c}];direction='right';nextDirection='right';}
function spawnFood(){let nf,a=0;do{nf={x:Math.floor(Math.random()*GRID_SIZE),y:Math.floor(Math.random()*GRID_SIZE)};a++;}while(snake.some(s=>s.x===nf.x&&s.y===nf.y)&&a<500);food=nf;}
function moveSnake(){direction=nextDirection;const dir=DIRECTIONS[direction];const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.x>=GRID_SIZE||head.y<0||head.y>=GRID_SIZE)return false;const willEat=head.x===food.x&&head.y===food.y;const bodyToCheck=willEat?snake:snake.slice(0,-1);if(bodyToCheck.some(s=>s.x===head.x&&s.y===head.y))return false;snake.unshift(head);if(!willEat)snake.pop();return true;}
function handleEating(){const d=DIFFICULTIES[difficulty];score+=d.pointsPerFood;foodsEaten++;spawnParticles(food.x,food.y,14);spawnFood();updateHUD();}
function gameTick(){if(!gameRunning||gamePaused)return;if(!moveSnake()){endGame();return;}if(snake[0].x===food.x&&snake[0].y===food.y)handleEating();lastTickTime=performance.now();}
function startGameLoop(){const d=DIFFICULTIES[difficulty];if(gameLoopInterval)clearInterval(gameLoopInterval);gameLoopInterval=setInterval(gameTick,d.tickSpeed);lastTickTime=performance.now();}
function render(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#0d0d1a');bg.addColorStop(.5,'#111122');bg.addColorStop(1,'#0a0a14');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=.5;for(let i=0;i<=GRID_SIZE;i++){ctx.beginPath();ctx.moveTo(i*cellSize,0);ctx.lineTo(i*cellSize,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*cellSize);ctx.lineTo(w,i*cellSize);ctx.stroke();}drawFood();drawSnake();drawParticles();if(particles.length>0)updateParticles(.016);}
function drawFood(){const cx=food.x*cellSize+cellSize/2,cy=food.y*cellSize+cellSize/2,pulse=1+Math.sin(performance.now()/250)*.15,br=cellSize*.35*pulse;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,br*3);g.addColorStop(0,'rgba(255,68,68,0.5)');g.addColorStop(.5,'rgba(255,68,68,0.2)');g.addColorStop(1,'rgba(255,68,68,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,br*3,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ff4444';ctx.shadowBlur=15;const fg=ctx.createRadialGradient(cx-br*.3,cy-br*.3,0,cx,cy,br);fg.addColorStop(0,'#ff6666');fg.addColorStop(.6,'#ff3333');fg.addColorStop(1,'#cc0000');ctx.fillStyle=fg;ctx.beginPath();ctx.arc(cx,cy,br,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(cx-br*.25,cy-br*.3,br*.3,0,Math.PI*2);ctx.fill();}
function drawSnake(){const hc=DIFFICULTIES[difficulty].color,len=snake.length;for(let i=len-1;i>=0;i--){const seg=snake[i],x=seg.x*cellSize+cellSize/2,y=seg.y*cellSize+cellSize/2,t=len===1?1:i/(len-1),ss=cellSize*(.45-t*.12),hue=140+t*30,lightness=60-t*25;const color=i===0?hc:'hsl('+hue+',90%,'+lightness+'%)';if(i===0){ctx.shadowColor=hc;ctx.shadowBlur=18;}else if(i===1){ctx.shadowColor=hc;ctx.shadowBlur=8;}else ctx.shadowBlur=0;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,ss,0,Math.PI*2);ctx.fill();if(i===0){ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(x-ss*.25,y-ss*.3,ss*.35,0,Math.PI*2);ctx.fill();const eo=ss*.35,es=ss*.28,dir=DIRECTIONS[direction],px=-dir.y,py=dir.x;const ex1=x+dir.x*eo*.5+px*eo,ey1=y+dir.y*eo*.5+py*eo,ex2=x+dir.x*eo*.5-px*eo,ey2=y+dir.y*eo*.5-py*eo;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex1,ey1,es,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ex2,ey2,es,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(ex1+dir.x*es*.3,ey1+dir.y*es*.3,es*.55,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ex2+dir.x*es*.3,ey2+dir.y*es*.3,es*.55,0,Math.PI*2);ctx.fill();}}ctx.shadowBlur=0;}
function animate(){if(!gameRunning)return;render();animationFrame=requestAnimationFrame(animate);}
function startGame(d){difficulty=d;initSnake();spawnFood();score=0;foodsEaten=0;particles=[];gamePaused=false;gameRunning=true;direction='right';nextDirection='right';updateHUD();resizeCanvas();showScreen('gameScreen');startGameLoop();if(animationFrame)cancelAnimationFrame(animationFrame);animate();}
function endGame(){gameRunning=false;if(gameLoopInterval){clearInterval(gameLoopInterval);gameLoopInterval=null;}if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=null;}const d=DIFFICULTIES[difficulty];finalScore.textContent=score;finalDetail.textContent=d.label+' · '+foodsEaten+' food'+(foodsEaten!==1?'s':'')+' eaten';const isRec=saveHighScore(difficulty,score);newRecordBadge.style.display=isRec?'inline-block':'none';render();setTimeout(()=>{gameOverOverlay.classList.add('active');},400);}
function pauseGame(){if(!gameRunning||gamePaused)return;gamePaused=true;pauseOverlay.classList.add('active');if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=null;}}
function resumeGame(){if(!gameRunning||!gamePaused)return;gamePaused=false;pauseOverlay.classList.remove('active');lastTickTime=performance.now();animate();}
function quitToMenu(){gameRunning=false;gamePaused=false;if(gameLoopInterval){clearInterval(gameLoopInterval);gameLoopInterval=null;}if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=null;}pauseOverlay.classList.remove('active');gameOverOverlay.classList.remove('active');updateHighScoreDisplay();showScreen('startScreen');}
function showScreen(id){['startScreen','gameScreen'].forEach(s=>{const el=document.getElementById(s);if(s===id)el.classList.add('active');else el.classList.remove('active');});}
function updateHUD(){scoreDisplay.textContent=score;const best=highScores[difficulty]||0;bestDisplay.textContent=best>score?best:score;levelDisplay.textContent=DIFFICULTIES[difficulty].label;}
function handleDirectionChange(nd){if(!gameRunning||gamePaused)return;if(nd===OPPOSITES[direction])return;nextDirection=nd;}
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='arrowup'||k==='w'){e.preventDefault();handleDirectionChange('up');}else if(k==='arrowdown'||k==='s'){e.preventDefault();handleDirectionChange('down');}else if(k==='arrowleft'||k==='a'){e.preventDefault();handleDirectionChange('left');}else if(k==='arrowright'||k==='d'){e.preventDefault();handleDirectionChange('right');}else if(k===' '){e.preventDefault();if(gameRunning&&!gamePaused)pauseGame();else if(gameRunning&&gamePaused)resumeGame();}});
let touchStartX=0,touchStartY=0,touchActive=false;
canvas.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];touchStartX=t.clientX;touchStartY=t.clientY;touchActive=true;},{passive:false});
canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!touchActive)return;const t=e.touches[0],dx=t.clientX-touchStartX,dy=t.clientY-touchStartY,ms=20;if(Math.abs(dx)>ms||Math.abs(dy)>ms){if(Math.abs(dx)>Math.abs(dy))handleDirectionChange(dx>0?'right':'left');else handleDirectionChange(dy>0?'down':'up');touchStartX=t.clientX;touchStartY=t.clientY;}},{passive:false});
canvas.addEventListener('touchend',e=>{e.preventDefault();touchActive=false;},{passive:false});
document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn=>{btn.addEventListener('click',()=>handleDirectionChange(btn.dataset.dir));btn.addEventListener('touchstart',e=>{e.preventDefault();handleDirectionChange(btn.dataset.dir);},{passive:false});});
document.querySelectorAll('.difficulty-btn').forEach(btn=>{btn.addEventListener('click',()=>startGame(btn.dataset.difficulty));});
document.getElementById('pauseBtn').addEventListener('click',()=>{if(gameRunning&&!gamePaused)pauseGame();else if(gameRunning&&gamePaused)resumeGame();});
document.getElementById('resumeBtn').addEventListener('click',resumeGame);
document.getElementById('quitBtn').addEventListener('click',quitToMenu);
document.getElementById('playAgainBtn').addEventListener('click',()=>{gameOverOverlay.classList.remove('active');startGame(difficulty);});
document.getElementById('menuBtn').addEventListener('click',()=>{gameOverOverlay.classList.remove('active');quitToMenu();});
window.addEventListener('resize',()=>{if(gameRunning)resizeCanvas();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&gameRunning&&!gamePaused)pauseGame();});
updateHighScoreDisplay();resizeCanvas();
})();
</script></body></html>`;

/* -------------------------------- PUZZLE -------------------------------- */
GAME_HTML.P = `<html><head><style>
body{font-family:sans-serif;text-align:center;background:#f8fafc;display:flex;flex-direction:column;min-height:100vh;margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:10px;max-width:500px;margin:20px auto;padding:10px}
.card{height:80px;background:#2563eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2rem;color:transparent;transition:0.3s}
.flipped{background:white;color:initial;transform:rotateY(180deg);border:2px solid #2563eb}
footer{margin-top:auto;padding:20px;background:#1e293b;color:white;font-weight:bold}
.btn{padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer}
</style></head><body>
<h1>My Awesome Game</h1><p>Created by: <b>MT KING</b></p>
<div class="grid" id="board"></div>
<button class="btn" onclick="location.reload()">Restart</button>
<footer>MT KING</footer>
<script>
const symbols=["🍎","🍌","🍇","🍓","🥑","🍕","🍔","🍦","🍎","🍌","🍇","🍓","🥑","🍕","🍔","🍦"];
symbols.sort(()=>Math.random()-0.5);
const board=document.getElementById('board');let flipped=[];
symbols.forEach(s=>{const card=document.createElement('div');card.className='card';card.dataset.val=s;card.onclick=function(){if(flipped.length<2&&!this.classList.contains('flipped')){this.classList.add('flipped');this.innerHTML=this.dataset.val;flipped.push(this);if(flipped.length===2){if(flipped[0].dataset.val===flipped[1].dataset.val){flipped=[];}else{setTimeout(()=>{flipped.forEach(c=>{c.classList.remove('flipped');c.innerHTML='';});flipped=[];},800);}}}};board.appendChild(card);});
</script></body></html>`;

/* ---------------------------- MEMORY MATCH ------------------------------ */
GAME_HTML.MM = `<html><head><style>
body{font-family:sans-serif;text-align:center;background:#f8fafc;display:flex;flex-direction:column;min-height:100vh;margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:10px;max-width:500px;margin:20px auto;padding:10px}
.card{height:80px;background:#2563eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2rem;color:transparent;transition:0.3s}
.flipped{background:white;color:initial;transform:rotateY(180deg);border:2px solid #2563eb}
footer{margin-top:auto;padding:20px;background:#1e293b;color:white;font-weight:bold}
.btn{padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer}
</style></head><body>
<h1>My Awesome Game</h1><p>Created by: <b>MT KING</b></p>
<div class="grid" id="board"></div>
<button class="btn" onclick="location.reload()">Restart</button>
<footer>MT KING</footer>
<script>
const symbols=["🍎","🍌","🍇","🍓","🥑","🍕","🍔","🍦","🍎","🍌","🍇","🍓","🥑","🍕","🍔","🍦"];
symbols.sort(()=>Math.random()-0.5);
const board=document.getElementById('board');let flipped=[];
symbols.forEach(s=>{const card=document.createElement('div');card.className='card';card.dataset.val=s;card.onclick=function(){if(flipped.length<2&&!this.classList.contains('flipped')){this.classList.add('flipped');this.innerHTML=this.dataset.val;flipped.push(this);if(flipped.length===2){if(flipped[0].dataset.val===flipped[1].dataset.val){flipped=[];}else{setTimeout(()=>{flipped.forEach(c=>{c.classList.remove('flipped');c.innerHTML='';});flipped=[];},800);}}}};board.appendChild(card);});
</script></body></html>`;

/* ------------------------------ BREAKOUT -------------------------------- */
GAME_HTML.BB = `<html><head><title>BREAKOUT</title><style>
body{background:#111;color:#fff;text-align:center;font-family:sans-serif}
canvas{background:#000;border:4px solid #333}
button{width:100px;height:70px;background:#333;color:#fff;border:2px solid #00aaff;border-radius:15px;font-size:30px;margin:10px;cursor:pointer}
</style></head><body>
<h1>BREAKOUT</h1><p>By MT KING</p>
<canvas id="b" width="480" height="320"></canvas>
<div><button onclick="mL()">←</button><button onclick="mR()">→</button></div>
<script>
const cvs=document.getElementById("b"),ctx=cvs.getContext("2d");
let x=cvs.width/2,y=cvs.height-30,dx=2,dy=-2,r=8,ph=12,pw=90,px=(cvs.width-pw)/2;
let bc=5,br=5,bw=75,bh=20,bp=10,bt=30,bl=30,bricks=[];
for(let c=0;c<bc;c++){bricks[c]=[];for(let r=0;r<br;r++)bricks[c][r]={x:0,y:0,s:1};}
function mL(){if(px>0)px-=40}
function mR(){if(px<cvs.width-pw)px+=40}
function draw(){ctx.clearRect(0,0,cvs.width,cvs.height);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle="white";ctx.fill();ctx.closePath();ctx.fillStyle="#00aaff";ctx.fillRect(px,cvs.height-ph-5,pw,ph);for(let c=0;c<bc;c++){for(let r=0;r<br;r++){if(bricks[c][r].s==1){let bx=(c*(bw+bp))+bl,by=(r*(bh+bp))+bt;bricks[c][r].x=bx;bricks[c][r].y=by;ctx.fillStyle="#00aaff";ctx.fillRect(bx,by,bw,bh);if(x>bx&&x<bx+bw&&y>by&&y<by+bh){dy=-dy;bricks[c][r].s=0;}}}}if(x+dx>cvs.width-r||x+dx<r)dx=-dx;if(y+dy<r)dy=-dy;else if(y+dy>cvs.height-r-5){if(x>px&&x<px+pw)dy=-dy;else location.reload();}x+=dx;y+=dy;requestAnimationFrame(draw);}
draw();
</script></body></html>`;

/* ==================== GAME REGISTRY ==================== */
const GAMES = {
  L:   { name: 'Ludo',                 icon: '🎲', code: 'L',   gradient: 'linear-gradient(135deg,#ef4444,#f97316)' },
  FB:  { name: 'Flappy Bird',          icon: '🐦', code: 'FB',  gradient: 'linear-gradient(135deg,#facc15,#f59e0b)' },
  TTT: { name: 'Tic Tac Toe',          icon: '⭕', code: 'TTT', gradient: 'linear-gradient(135deg,#22d3ee,#3b82f6)' },
  T:   { name: 'Tetris',               icon: '🧱', code: 'T',   gradient: 'linear-gradient(135deg,#a855f7,#ec4899)' },
  SPS: { name: 'Stone Paper Scissors', icon: '✊', code: 'SPS', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  S:   { name: 'Snake',                icon: '🐍', code: 'S',   gradient: 'linear-gradient(135deg,#84cc16,#22c55e)' },
  P:   { name: 'Puzzle',               icon: '🧩', code: 'P',   gradient: 'linear-gradient(135deg,#f43f5e,#f97316)' },
  MM:  { name: 'Memory Match',         icon: '🃏', code: 'MM',  gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
  BB:  { name: 'Breakout',             icon: '🎯', code: 'BB',  gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }
};

/* ==================== ROOT & SCREENS ==================== */
const root = document.createElement('div');
root.id = 'lyra-root';
document.body.appendChild(root);

const bg = document.createElement('div');
bg.className = 'bg';
bg.innerHTML = '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>';
root.appendChild(bg);

function clearScreens() {
  root.querySelectorAll('.screen').forEach(s => s.remove());
}

function screenHome() {
  clearScreens();
  const s = document.createElement('div');
  s.className = 'screen active';
  s.innerHTML = `
    <div class="card">
      <div class="logo">LYRA</div>
      <h1 class="title">GAME BUILDER</h1>
      <p class="sub">Create · Publish · Play</p>
      <div class="creator">Created by <b>MUHAMMAD TAQI</b></div>
      <button class="cta" id="btn-create">✨ Create Your Own Game</button>
    </div>`;
  root.appendChild(s);
  $('#btn-create', s).addEventListener('click', () => { location.hash = '#games'; });
}

function screenGames() {
  clearScreens();
  const s = document.createElement('div');
  s.className = 'screen active';
  const cards = Object.keys(GAMES).map(k => {
    const g = GAMES[k];
    return `<button class="gcard" data-code="${k}" style="--g:${g.gradient}">
      <span class="icon">${g.icon}</span>
      <span class="name">${esc(g.name)}</span>
      <span class="code">#${g.code}</span>
    </button>`;
  }).join('');
  s.innerHTML = `
    <div class="head">
      <button class="back" id="btn-back">←</button>
      <h2>Choose a Game</h2>
    </div>
    <div class="grid">${cards}</div>`;
  root.appendChild(s);
  $('#btn-back', s).addEventListener('click', () => { location.hash = ''; });
  $$('.gcard', s).forEach(c => c.addEventListener('click', () => {
    location.hash = '#publish/' + c.dataset.code;
  }));
}

function screenPublish(code) {
  const game = GAMES[code];
  if (!game) { location.hash = '#games'; return; }
  clearScreens();
  const s = document.createElement('div');
  s.className = 'screen active';
  s.innerHTML = `
    <div class="card">
      <button class="back" id="btn-back" style="position:absolute;top:16px;left:16px">←</button>
      <div class="pub-icon">${game.icon}</div>
      <div class="pub-title">Publish ${esc(game.name)}</div>
      <input class="inp" id="inp-user" placeholder="Your name (A–Z)" maxlength="20" autocomplete="off">
      <input class="inp" id="inp-gname" placeholder="Game name (A–Z)" maxlength="20" autocomplete="off">
      <button class="pub-btn" id="btn-pub">🚀 Publish Game</button>
      <div class="link-box" id="link-box" style="display:none">
        <input class="link-inp" id="link-inp" readonly>
        <div class="link-row">
          <button class="copy" id="btn-copy">📋 Copy</button>
          <button class="play-now" id="btn-play">▶ Play Now</button>
        </div>
      </div>
    </div>`;
  root.appendChild(s);
  $('#btn-back', s).addEventListener('click', () => { location.hash = '#games'; });
  $('#btn-pub', s).addEventListener('click', () => {
    const u = sanitizeName($('#inp-user', s).value) || 'PLAYER';
    const g = sanitizeName($('#inp-gname', s).value) || 'MY GAME';
    const hash = game.code + '+' + encodeName(u) + '+' + encodeName(g);
    const url = location.origin + location.pathname + '#' + hash;
    const box = $('#link-box', s), linkInp = $('#link-inp', s);
    linkInp.value = url;
    box.style.display = 'flex';
    toast('✅ Game published!');
    $('#btn-play', s).onclick = () => { location.hash = hash; };
    $('#btn-copy', s).onclick = () => {
      linkInp.select(); linkInp.setSelectionRange(0, 99999);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => toast('📋 Link copied!')).catch(() => { try { document.execCommand('copy'); toast('📋 Link copied!'); } catch(e){} });
      } else { try { document.execCommand('copy'); toast('📋 Link copied!'); } catch(e){} }
    };
  });
}

function screenPlay(code, userEnc, gameEnc) {
  const game = GAMES[code];
  if (!game) { location.hash = ''; return; }
  const user = decodeName(userEnc);
  const gname = decodeName(gameEnc);
  clearScreens();
  const s = document.createElement('div');
  s.className = 'screen active';
  s.innerHTML = `
    <div class="playbar">
      <button class="back" id="btn-back">←</button>
      <div class="playinfo">
        <div class="playname">${esc(gname || game.name)}</div>
        <div class="playuser">${esc(game.name)} • by ${esc(user || 'PLAYER')}</div>
      </div>
    </div>
    <div class="stage" id="stage"></div>`;
  root.appendChild(s);
  $('#btn-back', s).addEventListener('click', () => { location.hash = '#games'; });
  const stage = $('#stage', s);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('allow', 'fullscreen; autoplay; gamepad');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals');
  iframe.srcdoc = GAME_HTML[code];
  stage.appendChild(iframe);
}

/* ==================== ROUTER ==================== */
function route() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) { screenHome(); return; }
  if (raw === 'games') { screenGames(); return; }
  if (raw.indexOf('publish/') === 0) {
    screenPublish(raw.slice('publish/'.length));
    return;
  }
  const parts = raw.split('+');
  if (parts.length >= 3 && GAMES[parts[0]]) {
    screenPlay(parts[0], parts[1], parts[2]);
    return;
  }
  screenHome();
}
window.addEventListener('hashchange', route);
route();

})();
