import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
let handler;
let calls = [];
let fail = false;
const source = ts.transpileModule(readFileSync('leaderboard-edge.ts','utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const policy = {};
new Function('exports', ts.transpileModule(readFileSync('src/lib/game/nickname.ts','utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText)(policy);
new Function('Deno','fetch','require','exports', source)(
  { env: { get: key => ({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-server-secret', SUPABASE_PUBLISHABLE_KEYS: '{"default":"test-public-key"}' })[key] }, serve: fn => { handler = fn; } },
  async (url, opts) => { calls.push({url, ...opts}); return new Response(JSON.stringify(fail ? {code:'P0001', message:'Too many starts. Wait a minute and try again.'} : url.includes('tris_scores?') ? [{id:'test', nickname:'Leo', score:100, lines:0, level:1, time_ms:1000, player_hash:await (async () => { const data = new TextEncoder().encode('test-server-secret:'+'a'.repeat(64)); return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join(''); })()}] : {ok:true}), { status: fail ? 400 : 200 }); },
  () => policy, {}
);
const publicKey = readFileSync('src/lib/game/leaderboard-config.ts','utf8').match(/LEADERBOARD_KEY = "([^"]+)"/)[1];
const headers = { apikey: publicKey, 'content-type':'application/json' };
const run = { action:'start', mode:'endless', runId:'a1b2c3d4-1234-4123-8123-a1b2c3d4e5f6', playerToken:'a'.repeat(64) };
const send = body => handler(new Request('https://example.test/functions/v1/tris-leaderboard', {method:'POST', headers, body:JSON.stringify(body)}));
assert.equal((await handler(new Request('https://example.test?mode=endless'))).status, 401);
assert.equal(calls.length, 0);
assert.equal((await handler(new Request('https://example.test?mode=invalid',{headers}))).status, 400);
for (const mode of ['endless','sprint']) {
  const response = await handler(new Request(`https://example.test?mode=${mode}`,{headers}));
  assert.equal(response.status,200);
  const url = new URL(calls.at(-1).url);
  assert.equal(url.searchParams.get('limit'),'10');
  assert.equal(url.searchParams.get('order'),`${mode === 'endless' ? 'score.desc' : 'time_ms.asc'},created_at.asc,id.asc`);
  const publicData = await response.json();
  assert.equal('player_hash' in publicData.entries[0],false);
  assert.equal(publicData.entries[0].isPlayer,false);
}
assert.equal((await send(run)).status,200);
const start = JSON.parse(calls.at(-1).body);
assert.match(start.p_player,/^[a-f0-9]{64}$/);
assert.notEqual(start.p_player,run.playerToken);
assert.notEqual(start.p_ip,'unknown');
assert.equal((await send({...run,playerToken:'bad'})).status,400);
assert.equal((await send({...run,action:'submit',nickname:'<script>'})).status,400);
const submission = {...run,action:'submit',nickname:'Player 1',score:100,lines:0,level:1,timeMs:1000,pieces:2,completed:false};
assert.equal((await send({...submission,score:'100'})).status,400);
assert.equal((await send(submission)).status,200);
assert.equal(JSON.parse(calls.at(-1).body).p_name,'Player 1');
fail=true;
assert.equal((await send(run)).status,429);
console.log('Passed: leaderboard API authentication, mode sorting, top-10 limit, private field protection, input validation and rate-limit errors.');

for (const nickname of ['fuck', 'F_U_C_K', 'f4gg0t', 'sh1t', 'Nazi123', 'biiiitch', 'sex', '---']) {
  const before = calls.length;
  assert.equal((await send({...submission,nickname})).status,400,nickname);
  assert.equal(calls.length,before,'Rejected names must not reach the database');
}
for (const nickname of ['Leo', 'Cassie', 'Scunthorpe', 'Classic', 'Titus', 'Player 1']) assert.equal(policy.nicknameError(nickname),null,nickname);
console.log('Passed: name moderation, separator/leet/repeated-letter evasions and innocent-name regressions.');

fail=false;
const own = await handler(new Request('https://example.test?mode=endless',{headers:{...headers,'x-player-token':'a'.repeat(64)}}));
// Restore the stub after rate-limit test.
const ownData=await own.json();
assert.equal(ownData.entries[0].isPlayer,true);
assert.equal('player_hash' in ownData.entries[0],false);
const stranger=await handler(new Request('https://example.test?mode=endless',{headers:{...headers,'x-player-token':'b'.repeat(64)}}));
assert.equal((await stranger.json()).entries[0].isPlayer,false);
console.log('Passed: private player highlighting without exposing stored identities.');
