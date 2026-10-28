export const MAX_AUDIO = 50 * 1024 * 1024;
export const MAX_LYRICS = 200 * 1024;
export function validateAudio(file) {
 if (!file || !(/\.mp3$/i.test(file.name) || file.type === 'audio/mpeg')) throw new Error('Escolha um arquivo MP3.');
 if (!file.size || file.size > MAX_AUDIO) throw new Error('O MP3 deve ter conteúdo e no máximo 50 MB.');
}
export function parseLyrics(text) {
 if (!text.trim()) throw new Error('Cole a letra ou importe um arquivo TXT ou LRC.');
 if (text.length > MAX_LYRICS) throw new Error('A letra deve ter no máximo 200 mil caracteres.');
 const lines = [];
 for (const raw of text.replace(/\r/g, '').split('\n')) {
  if (/^\s*\[(?:ar|ti|al|by|offset|length|re|ve):/i.test(raw)) continue;
  const stamps = [...raw.matchAll(/\[(\d{1,3}):([0-5]\d)(?:[.:](\d{1,3}))?\]/g)];
  const value = raw.replace(/\[\d{1,3}:[0-5]\d(?:[.:]\d{1,3})?\]/g, '').trim();
  if (!value) continue;
  if (stamps.length) for (const stamp of stamps) lines.push({text:value, time:Number(stamp[1])*60+Number(stamp[2])+Number('0.'+(stamp[3]||'0'))});
  else lines.push({text:value, time:null});
 }
 if (!lines.length) throw new Error('Nenhum trecho encontrado na letra.');
 if (lines.length > 500) throw new Error('Use uma letra com até 500 trechos.');
 if (lines.every(l => l.time !== null)) lines.sort((a,b)=>a.time-b.time);
 return lines.map(l=>({...l,translation:'Letra importada por você · tradução não disponível',tip:l.time===null?'Ouça o MP3, pause no trecho e repita. A letra sem horários tem navegação manual.':'Use “Ouvir no MP3” para começar no horário indicado na letra LRC.'}));
}
