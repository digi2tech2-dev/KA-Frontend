import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createOAuthProof, exchangeOAuthProof } from './oauthProof.js';
test('OAuth proof stays in the initiating tab; concurrent callers exchange once',async()=>{
  const data=new Map();let historyCalls=0;
  globalThis.window={sessionStorage:{setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k),removeItem:k=>data.delete(k)},location:{pathname:'/auth'},history:{replaceState:()=>historyCalls++}};
  const challenge=await createOAuthProof();const verifier=[...data.values()][0];
  assert.equal(challenge,createHash('sha256').update(verifier).digest('base64url'));
  let requests=0;
  const post=async body=>{requests++;assert.equal(body.verifier,verifier);return {requires2FA:true};};
  const results=await Promise.all([exchangeOAuthProof('single-use-code',post),exchangeOAuthProof('single-use-code',post)]);
  assert.equal(requests,1);assert.equal(historyCalls,1);assert.equal(data.size,0);assert.equal(results[0].requires2FA,true);
  await assert.rejects(exchangeOAuthProof('stolen-code',post));
});
