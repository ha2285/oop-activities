
/* ===================== CONTENT ===================== */
const SCOPE=['This class only','Same package only','Package + subclasses','Everywhere'];
const ACC=['public','protected','private','inaccessible'];

const PHASES={
  cpp:{
    name:'C++', tag:'cpp', accent:'#5b8cff',
    levels:[
      { step:'L1 · Filter', badge:'LEVEL 1', title:'The Inheritance-Mode Filter',
        lead:'Student inherits Person with <b>private</b> inheritance. What does each member become <em>inside Student</em> — and can main() reach it?',
        preamble:`<pre><span class="kw">class</span> <span class="ty">Person</span> {
  <span class="kw">private</span>:   <span class="ty">long</span>   SSN;
  <span class="kw">protected</span>: <span class="ty">int</span>    Age;
  <span class="kw">public</span>:    <span class="st">string</span> Name;
};
<span class="kw">class</span> <span class="ty">Student</span> : <span class="mod">private</span> <span class="ty">Person</span> { ... };</pre>`,
        type:'quiz',
        questions:[
          {prompt:'Base <em>private</em> <code>SSN</code> becomes ___ in Student',tag:['priv','private'],options:ACC,answer:3,
           why:'⛔ A base private member is inaccessible to the derived class in <em>any</em> mode (it still occupies memory though).'},
          {prompt:'Base <em>protected</em> <code>Age</code> becomes ___ in Student',tag:['prot','protected'],options:ACC,answer:2,
           why:'Private inheritance demotes protected → private.'},
          {prompt:'Base <em>public</em> <code>Name</code> becomes ___ in Student',tag:['pub','public'],options:ACC,answer:2,
           why:'Private inheritance demotes public → private.'},
          {prompt:'<code>main(): cout &lt;&lt; s.Name;</code> — does it compile?',options:['✅ Yes','⛔ No'],answer:1,
           why:'⛔ Name is now private in Student, so it is hidden from main().'},
        ]},
      { step:'L2 · Lightning', badge:'LEVEL 2', title:'⚡ Lightning Round',
        lead:'Five rapid calls — the C++ filter rules still apply.', type:'quiz',
        questions:[
          {prompt:'Under <b>public</b> inheritance, a <b>protected</b> base member becomes ___',options:ACC,answer:1,why:'public inheritance preserves protected.'},
          {prompt:'Under <b>protected</b> inheritance, a <b>public</b> base member becomes ___',options:ACC,answer:1,why:'protected inheritance caps public down to protected.'},
          {prompt:'Under <b>private</b> inheritance, a <b>public</b> base member becomes ___',options:ACC,answer:2,why:'private inheritance demotes everything visible to private.'},
          {prompt:'A <b>private</b> base member, under <em>any</em> mode, is ___ to the derived class',options:ACC,answer:3,why:'Always inaccessible — never reachable by the derived class.'},
          {prompt:'Does the inheritance mode change an object\'s physical <b>memory layout</b>?',options:['Yes','No'],answer:1,why:'No — it only relabels visibility; the bytes are unchanged.'},
        ]},
      { step:'L3 · Layout', badge:'LEVEL 3', title:'🧱 Sketch the Object in Memory',
        lead:'Click the members in <b>memory order</b> — lowest address (top) to highest. 1 pt per correct slot.',
        preamble:`<pre><span class="kw">class</span> <span class="ty">Person</span> {
  <span class="kw">private</span>:   <span class="ty">long</span> SSN;     <span class="cm">// 8 B</span>
  <span class="kw">protected</span>: <span class="ty">int</span>  Age;     <span class="cm">// 4 B</span>
  <span class="kw">public</span>:    <span class="ty">char</span> Name[16]; <span class="cm">// 16 B</span>
};
<span class="kw">class</span> <span class="ty">Student</span> : <span class="mod">private</span> <span class="ty">Person</span> {
  <span class="kw">private</span>: <span class="ty">int</span> studentID;   <span class="cm">// 4 B</span>
};</pre>`,
        type:'order',
        blocks:[
          {id:'SSN',label:'SSN',sub:'long · 8B · base/private',tag:'Person subobject',size:8},
          {id:'Age',label:'Age',sub:'int · 4B · base/protected',tag:'Person subobject',size:4},
          {id:'Name',label:'Name[16]',sub:'char[16] · 16B · base/public',tag:'Person subobject',size:16},
          {id:'ID',label:'studentID',sub:'int · 4B · Student/private',tag:"Student's own",size:4},
        ],
        order:['SSN','Age','Name','ID'], scramble:['ID','Name','SSN','Age'],
        why:'The base <code>Person</code> subobject is laid out <b>first</b>, members in declaration order: SSN → Age → Name → studentID. SSN sits at byte 0 — private, but physically present.'},
      { step:'L4 · Courtroom', badge:'LEVEL 4', title:'⚖️ The Compiler Courtroom',
        lead:'Each case shows a line and where it runs. Does it compile?', type:'quiz',
        questions:[
          {prompt:'Inside Student\'s own method (private inheritance):',code:'Age = 20;',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ A protected base member is usable inside the derived class.'},
          {prompt:'Inside Student\'s own method:',code:'SSN = 123456789;',options:['✅ Compiles','⛔ Error'],answer:1,why:'⛔ SSN is private to Person — the derived class can never touch it.'},
          {prompt:'In main(), private inheritance:',code:'Student s; s.Name = "Ann";',options:['✅ Compiles','⛔ Error'],answer:1,why:'⛔ Private inheritance made Name private in Student, hidden externally.'},
          {prompt:'In main(), <b>public</b> inheritance:',code:'Student s; cout << s.Name;',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ Public inheritance keeps Name public, so main() can read it.'},
          {prompt:'Inside Student\'s own method (private inheritance):',code:'cout << Name;',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ Name is private to Student, but Student\'s methods may use its own private members.'},
        ]},
    ],
    note:'Debrief: the SSN bytes existed all along — yet no inheritance mode ever let you <em>read</em> them. Visibility ≠ existence.'
  },

  java:{
    name:'Java', tag:'java', accent:'#ff8a3d',
    levels:[
      { step:'L1 · Modifiers', badge:'LEVEL 1', title:'🟠 The Access-Modifier Map',
        lead:'Java has <b>no inheritance modes</b> — <code>extends</code> keeps each member\'s own modifier. Match each member to how far it\'s visible.',
        preamble:`<pre><span class="cm">// package model;</span>
<span class="kw">class</span> <span class="ty">Person</span> {
  <span class="kw">private</span>   <span class="ty">long</span>   ssn;
  <span class="kw">protected</span> <span class="ty">int</span>    age;
  <span class="kw">public</span>    <span class="st">String</span> name;
            <span class="ty">String</span> city;   <span class="cm">// no keyword = package-private (default)</span>
}
<span class="kw">class</span> <span class="ty">Student</span> <span class="kw">extends</span> <span class="ty">Person</span> { ... }</pre>`,
        type:'quiz',
        questions:[
          {prompt:'<code>private long ssn</code> is visible…',tag:['priv','private'],options:SCOPE,answer:0,why:'private = the declaring class only. A subclass must use a getter.'},
          {prompt:'<code>String city</code> (no modifier) is visible…',tag:['def','default'],options:SCOPE,answer:1,why:'No keyword = package-private: same package only, NOT subclasses in other packages.'},
          {prompt:'<code>protected int age</code> is visible…',tag:['prot','protected'],options:SCOPE,answer:2,why:'protected = same package PLUS subclasses (even across packages).'},
          {prompt:'<code>public String name</code> is visible…',tag:['pub','public'],options:SCOPE,answer:3,why:'public = everywhere.'},
        ]},
      { step:'L2 · Lightning', badge:'LEVEL 2', title:'⚡ Lightning Round',
        lead:'Five rapid Java calls. Assume Student is in a <em>different package</em> than Person.', type:'quiz',
        questions:[
          {prompt:'How many inheritance <em>modes</em> (public/protected/private) does Java give you?',options:['Three, like C++','Just one: plain extends','Two','Zero — no inheritance'],answer:1,why:'Java has only plain extends — no public/protected/private inheritance.'},
          {prompt:'A subclass in another package — can it directly use a <b>protected</b> superclass field?',options:['Yes','No'],answer:0,why:'Yes — protected reaches subclasses across packages.'},
          {prompt:'That same subclass — can it use a <b>default</b> (package-private) superclass field?',options:['Yes','No'],answer:1,why:'No — package-private stays within the original package only.'},
          {prompt:'Can a subclass directly read a <b>private</b> superclass field?',options:['Yes','No — use a getter'],answer:1,why:'No — private is class-only; expose it via a public/protected accessor.'},
          {prompt:'<code>Student s = new Student();</code> — the variable <code>s</code> holds…',options:['the object itself','a reference to a heap object'],answer:1,why:'In Java every object variable is a reference; the object lives on the heap.'},
        ]},
      { step:'L3 · Heap', badge:'LEVEL 3', title:'🗃️ Stack or Heap?',
        lead:'Java doesn\'t lay objects out contiguously by value. Sort each item into where it lives at runtime. 1 pt each.',
        preamble:`<pre><span class="cm">// inside a method</span>
<span class="ty">Student</span> s = <span class="kw">new</span> <span class="ty">Student</span>();
<span class="ty">int</span> year = <span class="st">2026</span>;</pre>`,
        type:'quiz',
        questions:[
          {prompt:'Local reference variable <code>s</code>',options:['🧵 Stack frame','🗃️ Heap'],answer:0,why:'Local variables (including references) live in the method\'s stack frame.'},
          {prompt:'Local primitive <code>int year = 2026</code>',options:['🧵 Stack frame','🗃️ Heap'],answer:0,why:'A primitive local is stored directly in the stack frame.'},
          {prompt:'The object header (mark word + class pointer)',options:['🧵 Stack frame','🗃️ Heap'],answer:1,why:'Every Java object on the heap carries a header used by the JVM.'},
          {prompt:'Inherited field <code>ssn</code>',options:['🧵 Stack frame','🗃️ Heap'],answer:1,why:'All instance fields — inherited or not — live inside the heap object.'},
          {prompt:'Inherited field <code>name</code> (a String <em>reference</em>)',options:['🧵 Stack frame','🗃️ Heap'],answer:1,why:'The field sits in the object on the heap (and points to another heap object).'},
          {prompt:'Student\'s own field <code>studentId</code>',options:['🧵 Stack frame','🗃️ Heap'],answer:1,why:'Own instance fields are in the same heap object as the inherited ones.'},
        ]},
      { step:'L4 · Courtroom', badge:'LEVEL 4', title:'⚖️ The Compiler Courtroom',
        lead:'Student extends Person and lives in a <em>different package</em>. Does each line compile?', type:'quiz',
        questions:[
          {prompt:'Inside a Student method:',code:'age = 20;',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ protected reaches subclasses, even across packages.'},
          {prompt:'Inside a Student method:',code:'ssn = 123456789L;',options:['✅ Compiles','⛔ Error'],answer:1,why:'⛔ ssn is private to Person — invisible to the subclass.'},
          {prompt:'Inside a Student method (different package):',code:'city = "NYC";',options:['✅ Compiles','⛔ Error'],answer:1,why:'⛔ city is package-private; out-of-package subclasses can\'t see it.'},
          {prompt:'In main() of any class:',code:'Student s = new Student();\nSystem.out.println(s.name);',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ name is public — reachable everywhere.'},
          {prompt:'Inside a Student method, Person has <code>public long getSsn()</code>:',code:'System.out.println(getSsn());',options:['✅ Compiles','⛔ Error'],answer:0,why:'✅ The private field is reached through an inherited public getter — the standard workaround.'},
        ]},
    ],
    note:'Debrief: Java drops C++\'s inheritance modes — modifiers travel unchanged. And objects aren\'t value layouts: a reference on the stack points to a heap object whose field order the JVM decides.'
  }
};

/* ===================== ENGINE ===================== */
const TAGCLS={priv:'priv',prot:'prot',pub:'pub',def:'def'};
let phaseKey=null, lvlIdx=0, got=[], maxPts=0, locked=false;
let sel=[], placed=[], orderDone=false;
let startTime=null, timerInt=null, soundOn=true;
const done={cpp:false,java:false};
const lastScore={cpp:null,java:null};

const $=id=>document.getElementById(id);
function lvlPts(l){return l.type==='order'?l.blocks.length:l.questions.length;}
function phaseMax(p){return PHASES[p].levels.reduce((s,l)=>s+lvlPts(l),0);}

/* sound */
let actx=null;
function beep(f,d,t='sine',v=.06){if(!soundOn)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();
  const o=actx.createOscillator(),g=actx.createGain();o.type=t;o.frequency.value=f;o.connect(g);g.connect(actx.destination);
  g.gain.setValueAtTime(v,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);
  o.start();o.stop(actx.currentTime+d);}catch(e){}}
const sGood=()=>{beep(660,.12);setTimeout(()=>beep(990,.14),90)};
const sBad=()=>beep(160,.22,'sawtooth',.05);
const sClick=()=>beep(420,.05,'square',.03);
const sWin=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.2),i*120));
$('soundBtn').addEventListener('click',function(){soundOn=!soundOn;this.textContent=soundOn?'🔊':'🔇';if(soundOn)sClick();});

/* screens */
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('hidden',s.id!=='screen-'+id));window.scrollTo({top:0,behavior:'smooth'});}
function updHud(){$('scoreHud').textContent=got.reduce((a,b)=>a+b,0);$('maxHud').textContent=maxPts;}
function renderSteps(){
  const steps=$('steps');steps.classList.remove('hidden');steps.innerHTML='';
  PHASES[phaseKey].levels.forEach((l,i)=>{
    const d=document.createElement('div');d.className='step'+(i===lvlIdx?' active':'')+(i<lvlIdx?' done':'');
    d.textContent=l.step;steps.appendChild(d);});
  const r=document.createElement('div');r.className='step'+(lvlIdx>=PHASES[phaseKey].levels.length?' active':'');
  r.textContent='Result';steps.appendChild(r);
}

/* phase start */
document.querySelectorAll('.pcard').forEach(c=>c.addEventListener('click',()=>startPhase(c.dataset.phase)));
function startPhase(p){
  phaseKey=p;lvlIdx=0;got=[];maxPts=phaseMax(p);
  const tag=$('phaseTag');tag.className='phaseTag '+PHASES[p].tag;tag.textContent='Phase '+(p==='cpp'?'1 · C++':'2 · Java');tag.classList.remove('hidden');
  document.documentElement.style.setProperty('--acc',PHASES[p].accent);
  startTime=Date.now();clearInterval(timerInt);
  timerInt=setInterval(()=>{const s=Math.floor((Date.now()-startTime)/1000);$('timer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');},1000);
  sClick();renderLevel();
}

/* render a level */
function renderLevel(){
  locked=false;sel=[];placed=[];orderDone=false;
  const L=PHASES[phaseKey].levels[lvlIdx];
  renderSteps();updHud();
  $('lvlBadge').textContent=L.badge+' · '+lvlPts(L)+' pts';
  $('lvlTitle').textContent=L.title;
  $('lvlLead').innerHTML=L.lead;
  const fb=$('lvlFb');fb.className='fb';fb.innerHTML='';
  const body=$('lvlBody');body.innerHTML=L.preamble||'';
  const bar=$('lvlBar');bar.innerHTML='';

  if(L.type==='quiz'){
    sel=Array(L.questions.length).fill(null);
    L.questions.forEach((q,i)=>{
      const d=document.createElement('div');d.className='q';
      let tagHtml=q.tag?`<span class="mtag ${TAGCLS[q.tag[0]]}">${q.tag[1]}</span>`:'';
      d.innerHTML=`<div class="qt"><span class="num">${i+1}.</span>${q.prompt}${tagHtml}</div>`+
        (q.code?`<pre>${q.code}</pre>`:'')+
        `<div class="opts">${q.options.map((o,j)=>`<button class="opt" data-i="${i}" data-j="${j}">${o}</button>`).join('')}</div>`;
      body.appendChild(d);
    });
    body.onclick=e=>{const b=e.target.closest('.opt');if(!b||locked)return;
      const i=+b.dataset.i;sel[i]=+b.dataset.j;sClick();
      body.querySelectorAll(`[data-i="${i}"]`).forEach(x=>x.classList.toggle('sel',x===b));};
    const chk=mkBtn('Lock in answers',()=>checkQuiz(L));bar.appendChild(chk);
  } else { renderOrder(L,body,bar); }
}
function mkBtn(label,fn,cls=''){const b=document.createElement('button');b.className='btn '+cls;b.textContent=label;b.onclick=fn;return b;}

/* quiz scoring */
function checkQuiz(L){
  if(locked)return;locked=true;let c=0;
  L.questions.forEach((q,i)=>{
    const grp=$('lvlBody').querySelectorAll(`[data-i="${i}"]`);
    grp.forEach(btn=>{btn.disabled=true;
      if(+btn.dataset.j===q.answer)btn.classList.add('correct');
      else if(+btn.dataset.j===sel[i])btn.classList.add('wrong');});
    const wrap=grp[0].closest('.q');
    if(!wrap.querySelector('.note')){const n=document.createElement('div');n.className='note';n.innerHTML=q.why;wrap.appendChild(n);}
    if(sel[i]===q.answer)c++;
  });
  finishLevel(L,c);
}

/* order level */
function renderOrder(L,body,bar){
  const tray=document.createElement('div');tray.className='blocks';
  const stackWrap=document.createElement('div');stackWrap.className='stack';
  const trayLbl=document.createElement('p');trayLbl.className='lead';trayLbl.innerHTML='<b>Blocks (scrambled):</b>';
  const stackLbl=document.createElement('p');stackLbl.className='lead';stackLbl.innerHTML='<b>Memory layout</b> — low address at top:';
  body.appendChild(trayLbl);body.appendChild(tray);body.appendChild(stackLbl);body.appendChild(stackWrap);
  function drawTray(){tray.innerHTML='';L.scramble.forEach(id=>{const m=L.blocks.find(x=>x.id===id);
    const d=document.createElement('div');d.className='blk'+(placed.includes(id)?' placed':'');d.dataset.id=id;
    d.innerHTML=`${m.label}<small>${m.sub}</small>`;tray.appendChild(d);});}
  function drawStack(){if(!placed.length){stackWrap.innerHTML='<div class="slot">Click a block to place it…</div>';return;}
    stackWrap.innerHTML='';let addr=0;placed.forEach((id,i)=>{const m=L.blocks.find(x=>x.id===id);
      const row=document.createElement('div');row.className='row';if(orderDone)row.className+=L.order[i]===id?' ok':' no';
      row.innerHTML=`<span>+${addr} &nbsp; ${m.label} <span class="tag">${m.tag}</span></span><span class="addr">${m.size} B</span>`;
      stackWrap.appendChild(row);addr+=m.size;});}
  drawTray();drawStack();
  tray.onclick=e=>{const b=e.target.closest('.blk');if(!b||b.classList.contains('placed')||orderDone)return;placed.push(b.dataset.id);sClick();drawTray();drawStack();syncBtns();};
  const undo=mkBtn('Undo',()=>{if(orderDone)return;placed.pop();sClick();drawTray();drawStack();syncBtns();},'ghost');
  const reset=mkBtn('Reset',()=>{if(orderDone)return;placed=[];sClick();drawTray();drawStack();syncBtns();},'ghost');
  const chk=mkBtn('Score layout',()=>{if(orderDone)return;orderDone=true;locked=true;
    let c=0;placed.forEach((id,i)=>{if(L.order[i]===id)c++;});drawStack();finishLevel(L,c);},'');
  chk.style.display='none';
  bar.appendChild(undo);bar.appendChild(reset);bar.appendChild(chk);
  function syncBtns(){chk.style.display=placed.length===L.blocks.length?'':'none';}
}

/* finish a level */
function finishLevel(L,score){
  got[lvlIdx]=score;updHud();
  const pts=lvlPts(L);const ok=score>=Math.ceil(pts*0.8);
  const fb=$('lvlFb');fb.className='fb show '+(ok?'good':'partial');
  fb.innerHTML=(score===pts?'🎉 Perfect! ':`You scored ${score}/${pts}. `)+(L.why||'');
  ok?sGood():sBad();
  // disable check buttons, add Next
  const bar=$('lvlBar');bar.querySelectorAll('.btn').forEach(b=>b.disabled=true);
  const isLast=lvlIdx>=PHASES[phaseKey].levels.length-1;
  const next=mkBtn(isLast?'See results →':'Next level →',()=>{sClick();
    if(isLast){showResults();}else{lvlIdx++;renderLevel();}},'ghost');
  next.disabled=false;bar.appendChild(next);
  showScreen('level');
}

/* results */
function showResults(){
  clearInterval(timerInt);
  const total=got.reduce((a,b)=>a+b,0),pct=Math.round(total/maxPts*100);
  done[phaseKey]=true;lastScore[phaseKey]=pct;
  let emoji,rank,msg,win;
  if(pct>=90){emoji='🏆';rank='Master Architect';msg='Elite — you bent the rules to your will.';win=true;}
  else if(pct>=75){emoji='🥇';rank='Senior Architect';msg='Strong work; the rules answer to you now.';win=true;}
  else if(pct>=60){emoji='🛠️';rank='Architect — you win!';msg='You passed the trials and earned the badge.';win=true;}
  else{emoji='🧱';rank='Apprentice — not yet';msg='Close, but a few rules slipped. Run it back!';win=false;}
  $('resEmoji').textContent=emoji;
  const rr=$('resRank');rr.textContent=PHASES[phaseKey].name+': '+rank;rr.classList.toggle('win-glow',win);
  $('resMsg').textContent=msg;$('resTotal').textContent=`${total} / ${maxPts}  ·  ${pct}%`;
  $('resNote').innerHTML=PHASES[phaseKey].note;
  const sb=$('scorebars');sb.innerHTML='';
  PHASES[phaseKey].levels.forEach((l,i)=>{
    const pts=lvlPts(l),row=document.createElement('div');row.className='sbrow';
    row.innerHTML=`<span class="lbl">${l.step}</span><div class="track"><div class="fill" data-w="${(got[i]||0)/pts*100}"></div></div><span class="val">${got[i]||0}/${pts}</span>`;
    sb.appendChild(row);});
  const bar=$('resBar');bar.innerHTML='';
  bar.appendChild(mkBtn('Replay '+PHASES[phaseKey].name,()=>startPhase(phaseKey)));
  const other=phaseKey==='cpp'?'java':'cpp';
  bar.appendChild(mkBtn((done[other]?'Replay':'Try')+' Phase '+(other==='cpp'?'1 · C++':'2 · Java'),()=>startPhase(other),other==='java'?'java':'ghost'));
  bar.appendChild(mkBtn('Home',goHome,'ghost'));
  showScreen('results');
  setTimeout(()=>document.querySelectorAll('.fill').forEach(f=>f.style.width=f.dataset.w+'%'),120);
  if(win){sWin();confettiBurst();}else sBad();
}
function goHome(){
  clearInterval(timerInt);$('timer').textContent='0:00';$('steps').classList.add('hidden');$('phaseTag').classList.add('hidden');
  document.documentElement.style.setProperty('--acc','#5b8cff');
  ['cpp','java'].forEach(p=>{const el=document.querySelector(`[data-done="${p}"]`);
    if(done[p]){el.classList.remove('hidden');el.textContent='✓ Done · '+lastScore[p]+'%';}});
  showScreen('home');
}

/* confetti */
const cv=$('confetti'),cx=cv.getContext('2d');let parts=[],anim=null;
function sz(){cv.width=innerWidth;cv.height=innerHeight;}addEventListener('resize',sz);sz();
function confettiBurst(){const cols=['#5b8cff','#7c5bff','#2fd07a','#ffce4a','#ff5d6c','#ff8a3d','#5bd1ff'];
  parts=[];for(let i=0;i<170;i++)parts.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.4,r:4+Math.random()*6,
    c:cols[i%cols.length],vx:-2+Math.random()*4,vy:2+Math.random()*4,rot:Math.random()*6,vr:-.2+Math.random()*.4,life:0});
  if(anim)cancelAnimationFrame(anim);run();}
function run(){cx.clearRect(0,0,cv.width,cv.height);let alive=false;
  parts.forEach(p=>{p.vy+=.04;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life++;if(p.y<cv.height+30)alive=true;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillStyle=p.c;cx.globalAlpha=Math.max(0,1-p.life/260);
    cx.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6);cx.restore();});
  if(alive)anim=requestAnimationFrame(run);else cx.clearRect(0,0,cv.width,cv.height);}
