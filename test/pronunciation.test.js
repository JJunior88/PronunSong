import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {approximate,writtenPronunciation} from '../src/pronunciation.js';
const dictionary=JSON.parse(readFileSync(new URL('../src/vendor/cmudict.json',import.meta.url)));
test('imported English gets written pronunciation from real dictionary',()=>{const result=writtenPronunciation('Hello, world! I love you.',dictionary);assert.equal(result.unknown.length,0);assert.notEqual(result.written,'Hello, world! I love you.');assert.ok(result.written.includes(', '));assert.ok(result.written.endsWith('.'));});
test('unknown names remain explicit and contractions are normalized',()=>{const result=writtenPronunciation('I can’t sing Zzquuxxyz',dictionary);assert.deepEqual(result.unknown,['Zzquuxxyz']);assert.ok(result.written.endsWith('[Zzquuxxyz]'));});
test('every bundled dictionary pronunciation uses supported phonemes',()=>{assert.ok(Object.keys(dictionary).length>120000);for(const phones of Object.values(dictionary))assert.ok(approximate(phones).length>0);});
