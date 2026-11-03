import React, { useEffect, useState } from 'react';
import apiClient from '../../services/client';
import Button from '../ui/Button';

export default function CoinRechargeHistory({ supplierId }) {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    apiClient.suppliers.getCoinRechargeHistory(supplierId, page)
      .then((data) => { if (current) setHistory(data); })
      .catch((err) => { if (current) setError(err.message || 'تعذر تحميل سجل الشحن.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [supplierId, page]);
  return <section className="space-y-3 rounded-2xl border border-gray-300 p-4 dark:border-gray-700" dir="rtl">
    <h3 className="font-bold">سجل شحن العملات</h3>
    <p className="text-xs text-gray-500">راجع السجل مع المورد قبل حل الطلب؛ ظهور عملية في السجل وحده لا يؤكد أنها تخص هذا الطلب.</p>
    {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
    {loading ? <p role="status">جاري التحميل...</p> : !error ? <div className="overflow-x-auto">
      <table className="w-full text-right text-sm"><thead><tr><th>المستخدم</th><th>العملات</th><th>التاريخ</th></tr></thead>
        <tbody>{(history?.rows || []).map((row, index) => <tr key={index}>
          <td className="py-2">{row.toNickName || row.toUserId}<span className="block text-xs" dir="ltr">{row.toUserId}</span></td>
          <td>{row.coins}</td><td>{String(row.createAt || '—')}</td>
        </tr>)}</tbody></table>
      {!history?.rows?.length ? <p className="py-3 text-sm">لا توجد عمليات في هذه الصفحة.</p> : null}
    </div> : null}
    <div className="flex items-center gap-3">
      <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>السابق</Button>
      <span>صفحة {page}</span>
      <Button variant="outline" disabled={loading || Boolean(error) || !history?.rows?.length || (history?.lastPage > 0 && page >= history.lastPage)} onClick={() => setPage((value) => value + 1)}>التالي</Button>
    </div>
  </section>;
}
