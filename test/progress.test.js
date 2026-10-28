import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPractice,writePractice,songs} from '../src/data.js';
const store=()=>{const map=new Map();return {getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};};
test('phrase progress persists and is isolated by song',()=>{const s=store();assert.equal(writePractice(s,'song1',{current:2,practiced:[0,2]}),true);assert.deepEqual(readPractice(s,'song1',4),{current:2,practiced:[0,2]});assert.deepEqual(readPractice(s,'song2',4),{current:0,practiced:[]});});
test('ignores corrupt progress and invalid phrase indexes',()=>{for(const value of ['null','broken','42','{"current":900,"practiced":[-1,1,1,500,"2"]}']){const s=store();s.setItem('pronunsong.practice.s',value);const result=readPractice(s,'s',4);assert.equal(result.current,0);assert.deepEqual(result.practiced,value.includes('500')?[1]:[]);}});
test('unavailable storage reports failure',()=>{assert.equal(writePractice({setItem:()=>{throw Error('quota');}},'s',{}),false);});
test('built-in lessons all have written pronunciation',()=>{for(const s of songs)for(const l of s.lines)assert.ok(l.written.length>0);});
