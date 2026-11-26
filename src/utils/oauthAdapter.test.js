import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../services/realApi.js',import.meta.url),'utf8');
const from=source.indexOf('    loginWithGoogle: async (');
const to=source.indexOf('\n    },',from)+7;
const fn=source.slice(from+'    loginWithGoogle: '.length,to).trim().replace(/,$/,'');
const parameters=['window','http','unwrap','normaliseUser','setStoredAuthTokens','exchangeOAuthProof','createOAuthProof','isAndroidNativeApp','isNativeGoogleAuthAvailable','signInWithNativeGoogle','readReferralCodeFromSearch','readReferralBridge','normalizeAccountStatus','getAccountAccessRoute','API_BASE'];
const load=Function(...parameters,`return (${fn});`);
const setup=(data,native=false)=>{
  const stored=[];
  const window={location:{search:native?'':'?status=OAUTH_HANDOFF&code=verified-code',pathname:'/auth',assign:()=>{}},history:{replaceState:()=>{}},sessionStorage:{getItem:()=>null}};
  const http={post:async()=>({data})};
  const login=load(window,http,r=>r.data,u=>u,(...v)=>stored.push(v),async(_code,post)=>post({code:'verified-code',verifier:'tab-proof'}),async()=>'challenge',()=>native,()=>native,async()=>({idToken:'google-id-proof'}),()=>'',()=>'',v=>v,()=>'/pending','http://127.0.0.1/api');
  return {login,stored};
};
test('Google MFA result cannot populate a full session in the API adapter',async()=>{
  const {login,stored}=setup({requires2FA:true,tempToken:'temporary'});
  assert.equal((await login()).requires2FA,true);assert.equal(stored.length,0);
});
test('Google profile completion result stays unauthenticated',async()=>{
  const {login,stored}=setup({status:'PROFILE_COMPLETION_REQUIRED',completionToken:'completion'});
  assert.equal((await login()).status,'profile_completion_required');assert.equal(stored.length,0);
});
test('a completed Google session is saved only after a successful proof exchange',async()=>{
  const {login,stored}=setup({token:'access',user:{name:'Owner'}});
  assert.equal((await login()).token,'access');assert.equal(stored.length,1);
});
test('native Google MFA follows the same unauthenticated outcome',{skip:!fn.includes('isAndroidNativeApp')},async()=>{
  const {login,stored}=setup({requires2FA:true,tempToken:'temporary'},true);
  assert.equal((await login()).requires2FA,true);assert.equal(stored.length,0);
});
