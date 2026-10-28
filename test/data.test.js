import { test } from 'node:test';
import assert from 'node:assert/strict';
import { songs, progress, loadCompleted } from '../src/data.js';
test('lessons include translations and pronunciation tips',()=>{assert.equal(new Set(songs.map(s=>s.id)).size,songs.length);for(const s of songs){assert.ok(s.lines.length>0);for(const l of s.lines)for(const key of ['text','translation','tip'])assert.ok(l[key]?.trim());}});
test('progress handles empty and complete libraries',()=>{assert.equal(progress(0,0),0);assert.equal(progress(1,3),33);assert.equal(progress(3,3),100);});
test('stored progress rejects corrupt data and unknown songs',()=>{for(const raw of ['broken','null','{}','42'])assert.equal(loadCompleted({getItem:()=>raw}).size,0);assert.deepEqual([...loadCompleted({getItem:()=>'["star","star","unknown"]'})],['star']);assert.equal(loadCompleted({getItem:()=>{throw Error('blocked');}}).size,0);});
