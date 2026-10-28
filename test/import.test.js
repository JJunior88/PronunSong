import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLyrics,validateAudio,MAX_AUDIO} from '../src/import.js';
test('plain lyrics ignore blank lines and preserve text safely',()=>{const lines=parseLyrics(' First line\r\n\n<img src=x>');assert.equal(lines.length,2);assert.equal(lines[1].text,'<img src=x>');assert.equal(lines[0].time,null);});
test('LRC supports metadata, repeated timestamps, fractions and ordering',()=>{const lines=parseLyrics('[ar:Artist]\n[00:12.50][01:01.125]Hello\n[00:02]First');assert.deepEqual(lines.map(l=>l.time),[2,12.5,61.125]);assert.equal(lines[1].text,'Hello');});
test('rejects empty or excessively large lyrics',()=>{for(const text of ['  ','[ar:Artist]','x'.repeat(200*1024+1),Array(502).fill('a').join('\n')])assert.throws(()=>parseLyrics(text));});
test('MP3 import checks size and type',()=>{validateAudio({name:'song.MP3',type:'',size:100});for(const file of [null,{name:'a.txt',type:'text/plain',size:2},{name:'a.mp3',size:0},{name:'a.mp3',size:MAX_AUDIO+1}])assert.throws(()=>validateAudio(file));});
