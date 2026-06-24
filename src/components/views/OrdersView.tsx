import React, { useState, useMemo } from 'react';
import { Search, Download, Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Order } from '@/types';

export default function OrdersView() {
  const { orders, setCurrentReceiptOrder, setIsReceiptOpen } = useAppContext();

  const [s, setS] = useState('');
  const [d, setD] = useState('');
  const filtered = useMemo(() => orders.filter((o: Order) => (o.billNumber.toLowerCase().includes(s.toLowerCase()) || o.customerName.toLowerCase().includes(s.toLowerCase())) && (!d || o.date === d)), [orders, s, d]);

  const exportCSV = () => {
    const csvHeader = 'Bill,Date,Name,Type,Payment,Total\n';
    const csvRows = filtered.map((o: Order) => `"${o.billNumber}","${o.date}","${o.customerName}","${o.billType}","${o.paymentType}",${o.total}`).join('\n');
    const csv = csvHeader + csvRows;
    const l = document.createElement('a'); 
    l.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); 
    l.download = 'order-export.csv'; 
    l.click();
    URL.revokeObjectURL(l.href);
  };

  return (
    <div className="space-y-6 animate-pop-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div><h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Order Logs</h2></div>
        <button onClick={exportCSV} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 soft-shadow transition-colors"><Download size={18}/> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2"><Search className="absolute left-4 top-3.5 text-slate-400" size={20}/><input type="text" placeholder="Search bills..." value={s} onChange={e=>setS(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/></div>
        <input type="date" value={d} onChange={e=>setD(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200/60 dark:border-slate-700 overflow-hidden soft-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <tr><th className="p-5">Bill</th><th className="p-5">Client</th><th className="p-5">Details</th><th className="p-5 text-right">Total</th><th className="p-5 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((o: Order) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="p-5"><p className="font-bold text-violet-600 dark:text-violet-400">{o.billNumber}</p><p className="text-[11px] font-medium text-slate-500 mt-1">{o.date} &bull; {o.time}</p></td>
                  <td className="p-5 font-semibold text-slate-800 dark:text-white">{o.customerName}</td>
                  <td className="p-5"><div className="flex gap-2"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-semibold uppercase">{o.billType}</span><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-semibold uppercase">{o.paymentType}</span></div></td>
                  <td className="p-5 text-right font-bold text-lg text-slate-800 dark:text-white">₹{o.total.toFixed(0)}</td>
                  <td className="p-5 text-center"><button onClick={()=>{setCurrentReceiptOrder(o);setIsReceiptOpen(true);}} className="bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 px-4 py-2 rounded-xl font-semibold text-sm text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-2 mx-auto"><Printer size={16}/> Print</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-slate-400 font-medium">No orders found matching your criteria.</div>}
        </div>
      </div>
    </div>
  );
}
