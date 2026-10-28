// CMU ARPAbet -> aproximação de leitura para brasileiros, sem equivalência exata.
const sounds = {AA:'á',AE:'é',AH:'â',AO:'ó',AW:'au',AY:'ai',B:'b',CH:'tch',D:'d',DH:'dh',EH:'é',ER:'âr',EY:'ei',F:'f',G:'g',HH:'h',IH:'i',IY:'í',JH:'dj',K:'k',L:'l',M:'m',N:'n',NG:'ng',OW:'ou',OY:'ói',P:'p',R:'r',S:'s',SH:'sh',T:'t',TH:'th',UH:'u',UW:'ú',V:'v',W:'u',Y:'i',Z:'z',ZH:'j'};
export function approximate(phonemes) {
 return phonemes.map(p=>{const base=p.replace(/[012]$/,'');const value=sounds[base];if(!value)throw Error('Fonema não suportado: '+p);return p.endsWith('1')?value.toLocaleUpperCase('pt-BR'):value;}).join('');
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
