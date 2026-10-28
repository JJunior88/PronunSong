export function guideWords(text) { return text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]; }
export const GUIDE_RATES=[0.25,0.4,0.6,0.85,1];
export function guideRate(value){const n=Number(value);return GUIDE_RATES.includes(n)?n:0.4;}
