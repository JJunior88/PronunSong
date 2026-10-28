// CMU ARPAbet -> aproximação de leitura para brasileiros, sem equivalência exata.
const sounds = {AA:'á',AE:'é',AH:'â',AO:'ó',AW:'au',AY:'ai',B:'b',CH:'tch',D:'d',DH:'d',EH:'é',ER:'âr',EY:'ei',F:'f',G:'g',HH:'rr',IH:'i',IY:'í',JH:'dj',K:'k',L:'l',M:'m',N:'n',NG:'ng',OW:'ou',OY:'ói',P:'p',R:'r',S:'s',SH:'x',T:'t',TH:'f',UH:'u',UW:'ú',V:'v',W:'u',Y:'i',Z:'z',ZH:'j'};
export function approximate(phonemes) {
 return phonemes.map((p,i)=>{
  const base=p.replace(/[012]$/,'');const next=phonemes[i+1]?.replace(/[012]$/,'');let value=sounds[base];
  if(!value)throw Error('Fonema não suportado: '+p);
  if(base==='K'&&['EH','EY','IH','IY'].includes(next))value='qu';
  if(base==='G'&&['EH','EY','IH','IY'].includes(next))value='gu';
  if(base==='S'&&i>0&&/[012]$/.test(phonemes[i-1])&&/[012]$/.test(phonemes[i+1]||''))value='ss';
  if(base==='AH'&&next==='N')value='ã';
  return p.endsWith('1')?value.toLocaleUpperCase('pt-BR'):value;
 }).join('');
}
export function writtenPronunciation(text,dictionary) {
 const unknown=[];
 const written=text.replace(/[A-Za-z]+(?:['’][A-Za-z]+)*/g,word=>{
  const normalized=word.toLowerCase().replaceAll('’',"'");
  const phonemes=dictionary[normalized];
  if(!Array.isArray(phonemes)){unknown.push(word);return '['+word+']';}
  return approximate(phonemes);
 });
 return {written,unknown:[...new Set(unknown)]};
}
let loading;
export async function loadDictionary() {
 if(!loading)loading=fetch(new URL('./vendor/cmudict.json',import.meta.url)).then(response=>{if(!response.ok)throw Error('Não foi possível carregar o dicionário de pronúncia. Tente importar novamente.');return response.json();}).catch(error=>{loading=undefined;throw error;});
 return loading;
}
