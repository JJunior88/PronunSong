import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guideWords,guideRate} from '../src/guide.js';
import {approximate} from '../src/pronunciation.js';
test('word guide keeps contractions and ignores punctuation',()=>{assert.deepEqual(guideWords("Hello, I can’t sing!"),['Hello','I','can’t','sing']);assert.deepEqual(guideWords('...'),[]);});
test('very slow guide rates remain selectable',()=>{assert.equal(guideRate('0.25'),0.25);assert.equal(guideRate('0.4'),0.4);assert.equal(guideRate('bad'),0.4);});
test('Portuguese reading preserves hard g and k before i and e',()=>{assert.equal(approximate(['K','IY1']),'quÍ');assert.equal(approximate(['G','IH1','V']),'guIv');assert.equal(approximate(['SH','IY1']),'xÍ');assert.equal(approximate(['HH','AY1']),'rrAI');});
