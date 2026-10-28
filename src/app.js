import { songs, progress, loadCompleted, readPractice, writePractice } from './data.js';
import { parseLyrics, validateAudio, MAX_LYRICS } from './import.js';
let importedSong, musicUrl;
const $ = id => document.getElementById(id);
let storage; try { storage = localStorage; } catch { storage = { getItem: () => null, setItem: () => {} }; }
const completed = loadCompleted(storage);
let selected = songs[0], line = 0, filter = 'Todos', recorder, stream, recordingUrl, busy = false, pending = false, timer;
function library() {
 $('songs').replaceChildren(...[...songs, ...(importedSong ? [importedSong] : [])].filter(s => filter === 'Todos' || s.level === filter).map(song => {
 const card = document.createElement('article'); card.className = 'song-card';
 card.innerHTML = `<div class="cover ${song.color}"><span>PRONUNSONG SESSIONS<br>THE CLASSICS COLLECTION</span><b>${song.icon}</b><small>VOL. 0${songs.indexOf(song)+1} · FIND YOUR VOICE</small></div><div class="card-body"><div class="card-meta"><span class="badge">${song.level}</span><span>${completed.has(song.id) ? '✓ Praticada' : `${song.lines.length} trechos`}</span></div><h3>${song.custom ? "Sua música" : song.title}</h3><p>${song.custom ? "Importada por você" : song.artist}</p><div class="card-footer"><span>${song.focus}</span><button aria-label="Praticar ${song.custom ? "Sua música" : song.title}">↗</button></div></div>`;
 card.querySelector('h3').textContent = song.title;
 card.querySelector('button').setAttribute('aria-label', 'Praticar ' + song.title);
 card.querySelector('button').onclick = () => { if (!busy && !pending) { selected=song; line=readPractice(storage,song.id,song.lines.length).current; clearAudio(); $('music-audio').pause(); practice(); } else $('status').textContent='Finalize a gravação antes de trocar de música.'; $('practice').scrollIntoView({behavior:'smooth'}); }; return card;
 }));
 $('completed-count').textContent=`${completed.size} músicas praticadas`; $('progress-percent').textContent=`${progress(completed.size,songs.length)}% do repertório`;
}
function clearAudio() { $('playback').pause(); if(recordingUrl) URL.revokeObjectURL(recordingUrl); recordingUrl=undefined; $('playback').removeAttribute('src'); $('playback').hidden=true; $('status').textContent=''; }
function practice() {
 window.PronunSongAndroid?.stopSpeech(); window.speechSynthesis?.cancel(); const phrase=selected.lines[line];
 $('music-player').hidden=!selected.custom;
 $('seek-line').disabled=busy||pending||selected.lines[line].time==null;
 $('complete').hidden=!!selected.custom;
 const saved=readPractice(storage,selected.id,selected.lines.length);
 const persisted=writePractice(storage,selected.id,{...saved,current:line});
 $('mark-line').textContent=saved.practiced.includes(line)?'✓ Trecho praticado · desfazer':'✓ Pratiquei este trecho';
 $('mark-line').disabled=busy||pending;
 $('phrase-progress').textContent=`${saved.practiced.length} de ${selected.lines.length} trechos praticados`+(persisted?' · salvo neste aparelho':' · armazenamento indisponível');
 $('written').textContent=phrase.written||'A pronúncia escrita ainda não está disponível para letras importadas. Ouça a referência falada e pratique frase por frase.';
 $('line-picker').replaceChildren(...selected.lines.map((phrase,index)=>{const b=document.createElement('button');b.type='button';b.textContent=String(index+1)+(saved.practiced.includes(index)?' ✓':'');b.setAttribute('aria-label',`Trecho ${index+1}: ${phrase.text}`);b.setAttribute('aria-pressed',String(index===line));b.className=index===line?'selected':'';b.disabled=busy||pending;b.onclick=()=>{line=index;clearAudio();practice();};return b;}));
 $('practice-title').textContent=selected.title; $('lyric').textContent=phrase.text; $('translation').textContent=phrase.translation; $('tip').textContent=phrase.tip;
 $('line-count').textContent=`Trecho ${line+1} de ${selected.lines.length}`;
 $('previous').disabled=line===0||busy||pending; $('next').disabled=line===selected.lines.length-1||busy||pending;
 $('complete').textContent=completed.has(selected.id)?'✓ Música praticada · desfazer':'✓ Marcar música como praticada';
}
for(const b of document.querySelectorAll('[data-filter]')) b.onclick=()=>{filter=b.dataset.filter; document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));}); library();};
for(const [id,delta] of [['previous',-1],['next',1]]) $(id).onclick=()=>{if(!busy&&!pending&&line+delta>=0&&line+delta<selected.lines.length){line+=delta;clearAudio();practice();}};
$('listen').onclick=()=>{
 $('music-audio').pause();
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
 $('music-audio').pause();window.PronunSongAndroid?.stopSpeech(); window.speechSynthesis?.cancel();stream=await navigator.mediaDevices.getUserMedia({audio:true});clearAudio();const chunks=[];recorder=new MediaRecorder(stream);
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{busy=false;release();if(chunks.length){recordingUrl=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));$('playback').src=recordingUrl;$('playback').hidden=false;$('status').textContent='Gravação pronta. Ouça e compare com a frase de referência.';}$('record').textContent='● Gravar novamente';$('listen').disabled=false;practice();};
 recorder.onerror=()=>{stop();$('status').textContent='A gravação foi interrompida. Tente novamente.';};
 recorder.start();busy=true;$('record').textContent='■ Encerrar gravação';$('listen').disabled=true;$('status').textContent='Gravando… Limite de 30 segundos.';timer=setTimeout(stop,30000);
 }catch(e){release();$('status').textContent=e.name==='NotAllowedError'?'Permita o microfone nas configurações do navegador e tente novamente.':'Microfone indisponível. Verifique a conexão e tente novamente.';}
 finally{pending=false;$('record').disabled=false;practice();}
};
$('complete').onclick=()=>{completed.has(selected.id)?completed.delete(selected.id):completed.add(selected.id);try{storage.setItem('pronunsong.completed',JSON.stringify([...completed]));}catch{$('status').textContent='Progresso atualizado apenas nesta sessão: armazenamento indisponível.';}library();practice();};
window.addEventListener('pagehide',()=>{stop();if(recordingUrl)URL.revokeObjectURL(recordingUrl);window.PronunSongAndroid?.stopSpeech(); window.speechSynthesis?.cancel();});
library();practice();

window.addEventListener('pronunsong-pause',stop);

$('lyrics-file').onchange=async()=>{
 const file=$('lyrics-file').files[0];if(!file)return;
 try { if(!/\.(txt|lrc)$/i.test(file.name)||file.size>MAX_LYRICS)throw Error('Use uma letra TXT ou LRC de até 200 KB.'); $('lyrics-text').value=await file.text();$('import-status').textContent='Letra carregada. Confira os trechos antes de abrir.'; }
 catch(e){$('import-status').textContent=e.message;}
};
$('audio-file').onchange=()=>{const file=$('audio-file').files[0];if(file&&!$('song-title').value)$('song-title').value=file.name.replace(/\.mp3$/i,'').slice(0,100);};
$('import-form').onsubmit=async e=>{
 e.preventDefault();
 if(busy||pending){$('import-status').textContent='Finalize a gravação antes de importar.';return;}
 try{
 const file=$('audio-file').files[0];validateAudio(file);const lines=parseLyrics($('lyrics-text').value);
 const fingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(lines.map(l=>[l.text,l.time]))));
 const customId='custom-'+Array.from(new Uint8Array(fingerprint),b=>b.toString(16).padStart(2,'0')).join('');
 const title=$('song-title').value.trim();if(!title)throw Error('Informe o nome da música.');
 $('music-audio').pause();if(musicUrl)URL.revokeObjectURL(musicUrl);musicUrl=URL.createObjectURL(file);
 $('music-audio').src=musicUrl;$('music-audio').playbackRate=Number($('music-speed').value);
 importedSong={id:customId,title,artist:'Importada por você',icon:'♫',color:'blue',level:'Pessoal',focus:'MP3 + sua letra',lines,custom:true};
 selected=importedSong;line=readPractice(storage,selected.id,lines.length).current;clearAudio();library();practice();$('import-status').textContent=`Música aberta com ${lines.length} trechos. Seu progresso fica salvo neste aparelho. Reimporte o MP3 e a mesma letra para retomar após fechar.`;
 $('music-status').textContent=lines.some(l=>l.time!==null)?'Letra com horários: selecione um trecho e toque em “Ouvir no MP3”.':'Letra sem horários: controle o áudio e avance pelos trechos manualmente.';
 $('practice').scrollIntoView({behavior:'smooth'});
 }catch(error){$('import-status').textContent=error.message;}
};
$('music-speed').onchange=()=>{$('music-audio').playbackRate=Number($('music-speed').value);};
$('seek-line').onclick=async()=>{const time=selected.lines[line].time;if(!selected.custom||time==null||busy||pending)return;try{if(!Number.isFinite($('music-audio').duration))throw Error('Aguarde o carregamento do áudio.');if(time>=$('music-audio').duration)throw Error('O horário deste trecho ultrapassa a duração do MP3.');$('music-audio').currentTime=time;await $('music-audio').play();}catch(e){$('music-status').textContent=e.message;}};
$('music-audio').onerror=()=>{$('music-status').textContent='Não foi possível reproduzir este arquivo. Escolha um MP3 válido e compatível.';};
window.addEventListener('pronunsong-pause',()=>{$('music-audio').pause();});
window.addEventListener('pagehide',()=>{if(musicUrl)URL.revokeObjectURL(musicUrl);});

$('mark-line').onclick=()=>{const saved=readPractice(storage,selected.id,selected.lines.length);saved.practiced=saved.practiced.includes(line)?saved.practiced.filter(n=>n!==line):[...saved.practiced,line];writePractice(storage,selected.id,{...saved,current:line});practice();};
