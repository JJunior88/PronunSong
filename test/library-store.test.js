import {test} from 'node:test';
import assert from 'node:assert/strict';
import {indexedDB} from 'fake-indexeddb';
import {libraryOperation} from '../src/library-store.js';
test('MP3 and lyrics survive closing and reopening database',async()=>{
 const name='library-roundtrip';
 const song={id:'one',title:'My song',lines:[{text:'Hello',time:0}],audio:new Blob(['mp3-test'],{type:'audio/mpeg'})};
 await libraryOperation('save',song,indexedDB,name);
 const restored=await libraryOperation('list',null,indexedDB,name);
 assert.equal(restored[0].title,song.title);assert.deepEqual(restored[0].lines,song.lines);assert.equal(await restored[0].audio.text(),'mp3-test');
 await libraryOperation('save',{...song,title:'Updated'},indexedDB,name);
 await libraryOperation('save',{...song,id:'two'},indexedDB,name);
 assert.equal((await libraryOperation('list',null,indexedDB,name)).length,2);
 await libraryOperation('delete','one',indexedDB,name);
 assert.deepEqual((await libraryOperation('list',null,indexedDB,name)).map(s=>s.id),['two']);
});
test('missing persistent storage rejects rather than claiming saved',async()=>{await assert.rejects(libraryOperation('save',{},null));});
