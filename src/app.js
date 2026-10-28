import { songs, progress, loadCompleted } from './data.js';
const $ = id => document.getElementById(id);
let storage; try { storage = localStorage; } catch { storage = { getItem: () => null, setItem: () => {} }; }
const completed = loadCompleted(storage);
let selected = songs[0], line = 0, filter = 'Todos', recorder, stream, recordingUrl, busy = false, pending = false, timer;
function library() {
 $('songs').replaceChildren(...songs.filter(s => filter === 'Todos' || s.level === filter).map(song => {
 const card = document.createElement('article'); card.className = 'song-card';
 card.innerHTML = `<div class="cover ${song.color}"><span>PRONUNSONG SESSIONS<br>THE CLASSICS COLLECTION</span><b>${song.icon}</b><small>VOL. 0${songs.indexOf(song)+1} · FIND YOUR VOICE</small></div><div class="card-body"><div class="card-meta"><span class="badge">${song.level}</span><span>${completed.has(song.id) ? '✓ Praticada' : '4 trechos'}</span></div><h3>${song.title}</h3><p>${song.artist}</p><div class="card-footer"><span>${song.focus}</span><button aria-label="Praticar ${song.title}">↗</button></div></div>`;
 card.querySelector('button').onclick = () => { if (!busy && !pending) { selected=song; line=0; clearAudio(); practice(); } else $('status').textContent='Finalize a gravação antes de trocar de música.'; $('practice').scrollIntoView({behavior:'smooth'}); }; return card;
 }));
 $('completed-count').textContent=`${completed.size} músicas praticadas`; $('progress-percent').textContent=`${progress(completed.size,songs.length)}% do repertório`;
}
function clearAudio() { $('playback').pause(); if(recordingUrl) URL.revokeObjectURL(recordingUrl); recordingUrl=undefined; $('playback').removeAttribute('src'); $('playback').hidden=true; $('status').textContent=''; }
function practice() {
 window.speechSynthesis?.cancel(); const phrase=selected.lines[line];
 $('practice-title').textContent=selected.title; $('lyric').textContent=phrase.text; $('translation').textContent=phrase.translation; $('tip').textContent=phrase.tip;
 $('line-count').textContent=`Trecho ${line+1} de ${selected.lines.length}`;
 $('previous').disabled=line===0||busy||pending; $('next').disabled=line===selected.lines.length-1||busy||pending;
 $('complete').textContent=completed.has(selected.id)?'✓ Música praticada · desfazer':'✓ Marcar música como praticada';
}
for(const b of document.querySelectorAll('[data-filter]')) b.onclick=()=>{filter=b.dataset.filter; document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));}); library();};
for(const [id,delta] of [['previous',-1],['next',1]]) $(id).onclick=()=>{if(!busy&&!pending&&line+delta>=0&&line+delta<selected.lines.length){line+=delta;clearAudio();practice();}};
$('listen').onclick=()=>{
 if(window.PronunSongAndroid){window.PronunSongAndroid.speak(selected.lines[line].text,Number($('speed').value));return;}
 if(!window.speechSynthesis){$('status').textContent='Síntese de voz indisponível neste navegador.';return;}
 window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(selected.lines[line].text);u.lang='en-US';u.rate=Number($('speed').value);
 const voice=window.speechSynthesis.getVoices().find(v=>v.lang==='en-US');if(voice)u.voice=voice;
 u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))$('status').textContent='Não foi possível reproduzir. Verifique as vozes instaladas no navegador.';}; window.speechSynthesis.speak(u);
};
function release(){clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=undefined;}
function stop(){if(recorder?.state==='recording')recorder.stop();release();}
$('record').onclick=async()=>{
 if(busy){stop();return;}if(pending)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){$('status').textContent='Use um navegador compatível em HTTPS ou localhost para gravar.';return;}
 pending=true;$('record').disabled=true;practice();
 try{
 window.speechSynthesis?.cancel();stream=await navigator.mediaDevices.getUserMedia({audio:true});clearAudio();const chunks=[];recorder=new MediaRecorder(stream);
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{busy=false;release();if(chunks.length){recordingUrl=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));$('playback').src=recordingUrl;$('playback').hidden=false;$('status').textContent='Gravação pronta. Ouça e compare com a frase de referência.';}$('record').textContent='● Gravar novamente';$('listen').disabled=false;practice();};
 recorder.onerror=()=>{stop();$('status').textContent='A gravação foi interrompida. Tente novamente.';};
 recorder.start();busy=true;$('record').textContent='■ Encerrar gravação';$('listen').disabled=true;$('status').textContent='Gravando… Limite de 30 segundos.';timer=setTimeout(stop,30000);
 }catch(e){release();$('status').textContent=e.name==='NotAllowedError'?'Permita o microfone nas configurações do navegador e tente novamente.':'Microfone indisponível. Verifique a conexão e tente novamente.';}
 finally{pending=false;$('record').disabled=false;practice();}
};
$('complete').onclick=()=>{completed.has(selected.id)?completed.delete(selected.id):completed.add(selected.id);try{storage.setItem('pronunsong.completed',JSON.stringify([...completed]));}catch{$('status').textContent='Progresso atualizado apenas nesta sessão: armazenamento indisponível.';}library();practice();};
window.addEventListener('pagehide',()=>{stop();if(recordingUrl)URL.revokeObjectURL(recordingUrl);window.speechSynthesis?.cancel();});
library();practice();

window.addEventListener('pronunsong-pause',stop);
