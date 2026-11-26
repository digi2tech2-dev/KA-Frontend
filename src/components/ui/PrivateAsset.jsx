import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';

const origin = new URL(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', window.location.origin).origin;
const privateUrl = raw => {
  try {
    const url = new URL(String(raw || ''), `${origin}/`);
    return url.origin === origin && /^\/(?:api\/)?uploads\/(deposits|targets|order-fields|sub-agent-proofs|referral-payout-receipts)\/[a-zA-Z0-9._-]+$/.test(url.pathname) ? url.href : '';
  } catch { return ''; }
};
const fetchAsset = async (url, token, signal) => {
  if (!token) throw new Error('Authentication required');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal, credentials: 'omit', redirect: 'error', cache: 'no-store' });
  if (!response.ok) throw new Error('Private file access denied');
  const blob = await response.blob();
  if (!/^(image\/(png|jpeg|webp|gif|bmp)|application\/pdf)(;|$)/i.test(blob.type)) throw new Error('Unsupported private file');
  return blob;
};
export const PrivateImage = ({ src, alt = '', ...props }) => {
  const token = useAuthStore(state => state.token);
  const secured = privateUrl(src);
  const [asset, setAsset] = useState(null);
  useEffect(() => {
    if (!secured) return undefined;
    const controller = new AbortController();
    let blobUrl;
    fetchAsset(secured, token, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      blobUrl = URL.createObjectURL(blob);
      setAsset({ src: blobUrl, token, url: secured });
    }).catch(() => { if (!controller.signal.aborted) setAsset(null); });
    return () => { controller.abort(); if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [secured, token]);
  if (!secured) return <img src={src} alt={alt} {...props} />;
  if (asset?.token !== token || asset?.url !== secured) return <span role="status">…</span>;
  return <img src={asset.src} alt={alt} {...props} />;
};
export const PrivateAssetLink = ({ href, children, onClick, ...props }) => {
  const secured = privateUrl(href);
  const open = async event => {
    if (!secured) { onClick?.(event); return; }
    event.preventDefault();
    const token = useAuthStore.getState().token;
    try {
      const blob = await fetchAsset(secured, token);
      if (useAuthStore.getState().token !== token) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = new URL(secured).pathname.split('/').pop();
      anchor.rel = 'noopener noreferrer'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch { /* Keep denied financial evidence private. */ }
  };
  return <a {...props} href={secured ? '#' : href} onClick={open} rel="noopener noreferrer">{children}</a>;
};
