export const songs = [
  { id: 'star', title: 'Twinkle, Twinkle, Little Star', artist: 'Tradicional · Jane Taylor', icon: '✦', color: 'gold', level: 'Iniciante', focus: 'Sons de /w/ e /t/', lines: [
    { text: 'Twinkle, twinkle, little star', translation: 'Brilha, brilha, estrelinha', tip: 'Em “twinkle”, arredonde os lábios no /w/. Em “star”, termine com o /r/ suave do inglês americano.' },
    { text: 'How I wonder what you are', translation: 'Como me pergunto o que você é', tip: 'Una “what you” suavemente. Em “wonder”, comece com os lábios arredondados, sem som de /v/.' },
    { text: 'Up above the world so high', translation: 'Lá em cima do mundo, tão alto', tip: 'Em “the”, encoste a ponta da língua entre os dentes e faça o som com a voz.' },
    { text: 'Like a diamond in the sky', translation: 'Como um diamante no céu', tip: 'Em “sky”, passe do /s/ direto para /k/, sem acrescentar um “i” no começo.' }
  ] },
  { id: 'row', title: 'Row, Row, Row Your Boat', artist: 'Canção tradicional', icon: '≈', color: 'blue', level: 'Iniciante', focus: 'Ritmo e vogais', lines: [
    { text: 'Row, row, row your boat', translation: 'Reme, reme, reme seu barco', tip: 'Em “row” e “boat”, deslize a vogal até um /u/ breve. O /r/ inglês não vibra como o português.' },
    { text: 'Gently down the stream', translation: 'Suavemente pela correnteza', tip: 'Marque “gently”, “down” e “stream”. Evite acrescentar uma vogal antes de “stream”.' },
    { text: 'Merrily, merrily, merrily, merrily', translation: 'Alegremente, alegremente, alegremente, alegremente', tip: 'Dê destaque à primeira sílaba de “merrily” e mantenha as outras duas leves.' },
    { text: 'Life is but a dream', translation: 'A vida é apenas um sonho', tip: 'Ligue “life is” em uma sequência contínua. Termine “dream” com os lábios fechados no /m/.' }
  ] },
  { id: 'grace', title: 'Amazing Grace', artist: 'Tradicional · John Newton', icon: '♫', color: 'pink', level: 'Intermediário', focus: 'Encontros consonantais', lines: [
    { text: 'Amazing grace, how sweet the sound', translation: 'Graça maravilhosa, quão doce é o som', tip: 'Destaque a segunda sílaba de “amazing”. Em “sweet”, mantenha /s/ e /w/ juntos.' },
    { text: 'That saved a wretch like me', translation: 'Que salvou um miserável como eu', tip: 'O “w” de “wretch” é silencioso. Em “saved”, o final tem som de /vd/.' },
    { text: 'I once was lost, but now am found', translation: 'Eu estava perdido, mas agora fui encontrado', tip: 'Faça uma pequena pausa depois de “lost”. Em “found”, deslize de /a/ para /u/.' },
    { text: 'Was blind, but now I see', translation: 'Era cego, mas agora vejo', tip: 'Ligue “now I”. Em “see”, alongue o /i/ sem transformá-lo em outra vogal.' }
  ] }
];
export function progress(completed, total) { return total ? Math.round(completed / total * 100) : 0; }
export function loadCompleted(storage) {
  try { const value = JSON.parse(storage.getItem('pronunsong.completed') || '[]'); return new Set(Array.isArray(value) ? value.filter(id => songs.some(s => s.id === id)) : []); }
  catch { return new Set(); }
}
