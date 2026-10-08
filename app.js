const messagesEl = document.querySelector("#messages");
const input = document.querySelector("#input");
const send = document.querySelector("#send");
const mic = document.querySelector("#mic");
const reset = document.querySelector("#resetBtn");
const hero = document.querySelector("#heroSpeech");
const typing = document.querySelector("#typing");
const characterArea = document.querySelector("#characterArea");
const thinkingLabel = document.querySelector("#thinkingLabel");
const micStatus = document.querySelector("#micStatus");

let history = [];
let busy = false, recognition = null, listening = false;

/*
  GitHub Pages is a static host, so it cannot run server-side code.
  Leave this empty for demo mode.
  If you later deploy your own HTTPS backend, put its URL here, e.g.
  const AI_ENDPOINT = "https://example.com/api/chat";
*/
const AI_ENDPOINT = "";

const starter = "안녕! 오늘은 무슨 이야기 해볼까?";
addMessage("bot", starter);
hero.textContent = starter;

function addMessage(role, text){
  const el=document.createElement("div");
  el.className="msg "+role;
  el.innerHTML=`<div class="who">${role==="bot"?"하치와레":"나"}</div>${escapeHtml(text)}`;
  messagesEl.appendChild(el);
  messagesEl.scrollTop=messagesEl.scrollHeight;
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function resize(){
  input.style.height="auto";
  input.style.height=Math.min(input.scrollHeight,120)+"px";
}
input.addEventListener("input",resize);
input.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}
});

function demoReply(text){
  const t=text.toLowerCase();
  if(/안녕|하이|ㅎㅇ/.test(t)) return "안녕! 헤헤, 와줘서 고마워! 오늘은 어떤 이야기 해볼까?";
  if(/힘들|지쳐|피곤|우울|속상|슬퍼/.test(t)) return "에엣… 많이 힘들었구나. 괜찮아? 무슨 일이 있었는지 나한테 말해줘도 돼.";
  if(/학교|선생님|친구/.test(t)) return "학교에서 무슨 일이 있었어? 친구랑 있었던 일도 괜찮으면 들려줘!";
  if(/공부|시험|숙제/.test(t)) return "공부하고 있었구나! 너무 한꺼번에 하려고 하지 말고 하나씩 해보자. 내가 옆에서 같이 있어줄게!";
  if(/고마워|감사/.test(t)) return "헤헤, 나도 고마워! 그렇게 말해주니까 기분이 좋아!";
  if(/뭐해|뭐 하고/.test(t)) return "나는 지금 너랑 이야기하고 있지! 헤헤. 너는 지금 뭐 하고 있었어?";
  if(/잘자|굿나잇/.test(t)) return "응! 오늘도 고생 많았어. 푹 쉬고 좋은 꿈 꿔!";
  if(/좋아|좋다|최고/.test(t)) return "우와! 진짜? 나도 괜히 기분이 좋아졌어!";
  return "음… 그렇구나. 조금 더 이야기해줘! 나 듣고 있을게.";
}

async function requestReply(){
  if(!AI_ENDPOINT) return demoReply(history.at(-1).content);

  const res=await fetch(AI_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({messages:history.slice(-16)})
  });
  if(!res.ok) throw new Error("AI endpoint error");
  const data=await res.json();
  if(!data.reply) throw new Error("empty reply");
  return data.reply.trim();
}

async function sendMessage(){
  const text=input.value.trim();
  if(!text||busy)return;

  busy=true;
  send.disabled=true;
  addMessage("user",text);
  history.push({role:"user",content:text});
  input.value="";
  resize();

  typing.classList.remove("hidden");
  characterArea.classList.add("talking");
  hero.textContent="음… 잠깐만!";
  thinkingLabel.textContent=AI_ENDPOINT ? "생각 중..." : "데모 모드";

  try{
    const reply=await requestReply();
    history.push({role:"assistant",content:reply});
    addMessage("bot",reply);
    hero.textContent=reply;
    speak(reply);
  }catch(e){
    const fallback="앗… AI 연결에 문제가 생겼어. 잠시 후 다시 해볼까?";
    addMessage("bot",fallback);
    hero.textContent=fallback;
    speak(fallback);
    console.error(e);
  }finally{
    typing.classList.add("hidden");
    characterArea.classList.remove("talking");
    thinkingLabel.textContent=AI_ENDPOINT ? "온라인" : "데모 모드";
    busy=false;
    send.disabled=false;
    input.focus();
  }
}

function speak(text){
  if(!("speechSynthesis"in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="ko-KR";
  u.rate=1.02;
  u.pitch=1.12;
  u.volume=1;
  const v=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith("ko"));
  if(v)u.voice=v;
  characterArea.classList.add("talking");
  u.onend=()=>characterArea.classList.remove("talking");
  speechSynthesis.speak(u);
}

const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
  recognition=new SR();
  recognition.lang="ko-KR";
  recognition.continuous=false;
  recognition.interimResults=true;
  recognition.onstart=()=>{
    listening=true;
    mic.classList.add("recording");
    micStatus.textContent="🔴 듣고 있어… 말해줘!";
  };
  recognition.onresult=e=>{
    let finalText="",interim="";
    for(const r of e.results){
      if(r.isFinal)finalText+=r[0].transcript;
      else interim+=r[0].transcript;
    }
    input.value=finalText||interim;
    resize();
    if(finalText)sendMessage();
  };
  recognition.onerror=e=>{
    micStatus.textContent=e.error==="not-allowed"
      ?"🎙️ 마이크 권한을 허용해줘."
      :"🎙️ 음성인식을 다시 눌러봐.";
  };
  recognition.onend=()=>{
    listening=false;
    mic.classList.remove("recording");
    if(!micStatus.textContent.includes("권한"))
      micStatus.textContent="🎙️ 마이크로 말할 수도 있어";
  };
  mic.onclick=()=>{
    if(listening) recognition.stop();
    else { try{recognition.start()}catch(e){} }
  };
}else{
  mic.disabled=true;
  micStatus.textContent="🎙️ 이 브라우저는 음성인식을 지원하지 않아.";
}

reset.onclick=()=>{
  speechSynthesis?.cancel();
  history=[];
  messagesEl.innerHTML="";
  addMessage("bot",starter);
  hero.textContent=starter;
  input.value="";
  resize();
};
