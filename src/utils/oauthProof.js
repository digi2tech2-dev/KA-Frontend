const KEY = 'oauth:pkce:v2';
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
export const createOAuthProof = async () => {
  const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  window.sessionStorage.setItem(KEY,verifier);
  return challenge;
};
let pending;
export const exchangeOAuthProof = (code, post) => {
  if (pending?.code === code) return pending.promise;
  const verifier = window.sessionStorage.getItem(KEY);
  if (!verifier || !code) return Promise.reject(new Error('Google login must be started in this browser tab.'));
  window.history.replaceState({},'',window.location.pathname);
  const promise = Promise.resolve().then(() => post({code,verifier})).finally(() => window.sessionStorage.removeItem(KEY));
  pending = {code,promise};
  return promise;
};
