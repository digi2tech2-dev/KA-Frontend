import React, { useEffect, useRef, useState } from 'react';
import { Search, PackageSearch, X } from 'lucide-react';
import apiClient from '../../services/client';
import { useLanguage } from '../../context/LanguageContext';

const input = 'w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)]';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold disabled:opacity-50';

export default function ProductRecovery() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [providers, setProviders] = useState([]);
  const [query, setQuery] = useState({ search:'', providerId:'', availability:'all', sort:'asc', minPrice:'', maxPrice:'' });
  const [results, setResults] = useState({ items:[], total:0, failures:[] });
  const [selected, setSelected] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const pendingSearchTimer = useRef(null);
  useEffect(() => { apiClient.productRecovery.providers().then((data) => setProviders(data?.providers || [])).catch(() => setError(ar ? 'تعذر تحميل الموردين.' : 'Could not load providers.')); }, [ar]);
  const search = async (nextPage = 1) => {
    const id = ++requestId.current;
    setLoading(true); setError('');
    try {
      const data = await apiClient.productRecovery.search({ ...query, page:nextPage, limit:24 });
      if (!data || !Array.isArray(data.items)) throw new Error('Invalid response');
      if (requestId.current === id) { setResults(data); setPage(nextPage); }
    } catch { if (requestId.current === id) setError(ar ? 'تعذر البحث في الموردين. حاول مرة أخرى.' : 'Could not search providers.'); }
    finally { if (requestId.current === id) setLoading(false); }
  };
  useEffect(() => {
    if (!query.search.trim()) {
      requestId.current += 1;
      setLoading(false);
      setResults({ items: [], total: 0, failures: [] });
      setPage(1);
      return undefined;
    }
    pendingSearchTimer.current = setTimeout(() => { pendingSearchTimer.current = null; void search(1); }, 550);
    return () => { clearTimeout(pendingSearchTimer.current); pendingSearchTimer.current = null; };
  // Search is intentionally tied to input/filter changes, not response state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ar]);
  const chosen = Object.values(selected);
  const toggle = (item) => setSelected((old) => {
    if (old[item.key]) { const next = { ...old }; delete next[item.key]; return next; }
    if (Object.keys(old).length >= 50) return old;
    return { ...old, [item.key]:item };
  });
  return <main dir={ar ? 'rtl' : 'ltr'} className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:px-6">
    <header className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950 p-5 text-white"><PackageSearch className="mb-3 h-8 w-8 text-cyan-300" /><h1 className="text-2xl font-black">{ar ? 'استرداد المنتجات' : 'Product recovery'}</h1><p className="mt-2 text-sm text-slate-300">{ar ? 'ابحث مباشرةً في الموردين النشطين وقارن الأسعار المؤكدة.' : 'Search active suppliers and compare confirmed prices.'}</p></header>
    <form onSubmit={(event) => { event.preventDefault(); clearTimeout(pendingSearchTimer.current); pendingSearchTimer.current = null; void search(1); }} className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2"><span className="mb-1 block text-xs font-bold">{ar ? 'اسم المنتج' : 'Product name'}</span><input className={input} value={query.search} onChange={(e) => setQuery({ ...query, search:e.target.value })} maxLength={120} /></label>
      <label><span className="mb-1 block text-xs font-bold">{ar ? 'المورد' : 'Supplier'}</span><select className={input} value={query.providerId} onChange={(e) => setQuery({ ...query, providerId:e.target.value })}><option value="">{ar ? 'كل الموردين' : 'All suppliers'}</option>{providers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
      <label><span className="mb-1 block text-xs font-bold">{ar ? 'التوفر' : 'Availability'}</span><select className={input} value={query.availability} onChange={(e) => setQuery({ ...query, availability:e.target.value })}><option value="all">{ar ? 'الكل' : 'All'}</option><option value="available">{ar ? 'متاح' : 'Available'}</option><option value="unavailable">{ar ? 'غير متاح' : 'Unavailable'}</option></select></label>
      <label><span className="mb-1 block text-xs font-bold">{ar ? 'أقل سعر بالدولار' : 'Minimum USD'}</span><input className={input} type="number" min="0" step="any" value={query.minPrice} onChange={(e) => setQuery({ ...query, minPrice:e.target.value })} /></label>
      <label><span className="mb-1 block text-xs font-bold">{ar ? 'أعلى سعر بالدولار' : 'Maximum USD'}</span><input className={input} type="number" min="0" step="any" value={query.maxPrice} onChange={(e) => setQuery({ ...query, maxPrice:e.target.value })} /></label>
      <label><span className="mb-1 block text-xs font-bold">{ar ? 'الترتيب' : 'Sort'}</span><select className={input} value={query.sort} onChange={(e) => setQuery({ ...query, sort:e.target.value })}><option value="asc">{ar ? 'الأقل سعرًا' : 'Lowest price'}</option><option value="desc">{ar ? 'الأعلى سعرًا' : 'Highest price'}</option></select></label>
      <button className={`${button} self-end bg-[var(--color-primary)] text-white`} disabled={loading}><Search className="h-4 w-4" />{loading ? (ar ? 'جارٍ البحث...' : 'Searching...') : (ar ? 'بحث' : 'Search')}</button>
    </form>
    {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
    {results.failures?.length > 0 && <div role="status" className="rounded-xl bg-amber-500/10 p-3 text-sm">{ar ? 'تعذر الوصول إلى بعض الموردين:' : 'Some suppliers could not be reached:'} {results.failures.map((f) => f.providerName).join('، ')}</div>}
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><section className="space-y-3"><div className="flex justify-between text-sm font-bold"><span>{ar ? 'النتائج' : 'Results'}: {results.total}</span><span>{ar ? 'صفحة' : 'Page'} {page}</span></div>
      {results.items.map((item) => <article key={item.key} className="flex min-w-0 gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"><input type="checkbox" className="h-5 w-5 shrink-0" aria-label={`${ar ? 'تحديد' : 'Select'} ${item.name} ${item.providerName}`} checked={Boolean(selected[item.key])} disabled={!selected[item.key] && chosen.length >= 50} onChange={() => toggle(item)} />{item.image && <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" referrerPolicy="no-referrer" />}<div className="min-w-0 flex-1"><h2 className="break-words font-black">{item.name}</h2><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{ar ? 'المورد:' : 'Supplier:'} {item.providerName} · {item.available === null ? (ar ? 'التوفر غير مؤكد' : 'Availability unconfirmed') : item.available ? (ar ? 'متاح' : 'Available') : (ar ? 'غير متاح' : 'Unavailable')}</p><p className="mt-1 text-sm font-bold">{item.price != null ? `${item.price} ${item.currency}` : (ar ? 'السعر أو العملة غير مؤكدين' : 'Price or currency unconfirmed')}</p><p className="text-xs text-[var(--color-text-secondary)]">{item.limitsVerified ? `${item.minQty} – ${item.maxQty}` : (ar ? 'الحدود تحتاج مراجعة' : 'Limits need review')}</p>{item.description && <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{item.description}</p>}</div></article>)}
      <div className="flex gap-2"><button type="button" className={button} disabled={loading || page <= 1} onClick={() => search(page - 1)}>{ar ? 'السابق' : 'Previous'}</button><button type="button" className={button} disabled={loading || page * 24 >= results.total} onClick={() => search(page + 1)}>{ar ? 'التالي' : 'Next'}</button></div>
    </section><aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"><h2 className="font-black">{ar ? 'المنتجات المختارة' : 'Selected products'} ({chosen.length}/50)</h2><div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{chosen.map((item) => <div key={item.key} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-surface)] p-2 text-sm"><span className="min-w-0 break-words">{item.name} · {item.providerName}</span><button type="button" aria-label={ar ? 'إزالة' : 'Remove'} onClick={() => toggle(item)}><X className="h-4 w-4" /></button></div>)}</div><p className="mt-4 text-xs leading-6 text-amber-600">{ar ? 'البحث متاح للمراجعة. النشر غير متاح حتى اكتمال التحقق من بيانات المورد والصورة ومنع التكرار.' : 'Search is available for review. Publishing awaits supplier, image and duplicate checks.'}</p></aside></div>
  </main>;
}
