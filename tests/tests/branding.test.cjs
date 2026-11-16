/* BELIMON — branding tests that must preserve historical save compatibility. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('js/game.js','utf8');
const audio=fs.readFileSync('js/audio.js','utf8');
const readme=fs.readFileSync('README.md','utf8');

assert.match(html,/<title>BELIMON · V16\.2<\/title>/);
assert.match(html,/<h1>BELIMON<\/h1>/);
assert.match(html,/ENCYCLOPÉDIE DE BELIMON/);
assert.match(html,/PERSONNALISATION DE BELIMON/);
assert.doesNotMatch(html,/BELLYMON/,'No old branding in the player UI');
assert.doesNotMatch(game,/BELLYMON/,'No old visible branding in game strings');
assert.doesNotMatch(audio,/BELLYMON/,'No old branding in audio warnings');
assert.match(game,/BELIMON_partie_\$\{slot\.id\.slice\(0,8\)\}\.json/);
assert.match(game,/BELIMON_TOUTES_PARTIES_/);
assert.match(game,/const ARCHIVE_FORMAT = 'bellymon-v11-archive'/,'Old exports must stay importable');
assert.match(game,/const TOMBSTONE_KEY = 'bellymon_v11_deleted_slot_ids'/);
assert.match(game,/const LOCAL_PREFIX = 'tour_des_waifus_v1_slot_'/);
assert.match(game,/window\.BellymonGuide/,'JS API names must stay compatible');
assert.match(audio,/const KEY='bellymon_audio_preferences_v1'/,'Audio settings must persist');
assert.match(audio,/window\.BellymonAudio/);
assert.match(audio,/const FADE_OUT_MS=750/);
assert.match(audio,/const FADE_IN_MS=750/);
assert.match(readme,/^# BELIMON/);
console.log('PASS: BELIMON branding and backward-compatible saves, exports, audio settings and APIs.');
