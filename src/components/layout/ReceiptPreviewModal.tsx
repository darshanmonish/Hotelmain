import React, { useState, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Settings, CartItem } from '@/types';

export default function ReceiptPreviewModal() {
  console.log('ReceiptPreviewModal rendered');
  const { currentReceiptOrder: order, setIsReceiptOpen, settings } = useAppContext();

  const [format, setFormat] = useState(settings.printFormat);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as Settings['printFormat']);
  };

  const handlePrint = useCallback(() => {
    if (isPrinting) return;

    setIsPrinting(true);
    console.log('Print button clicked, initiating window.print()');
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 0);
  }, [isPrinting]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center sm:p-8 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-transparent print:block">
      <style>{`@media print { 
  @page { size: auto; margin: 0; } 
  body * { visibility: hidden !important; } 
  #print-area, #print-area * { visibility: visible !important; } 
  #print-area { 
    position: absolute !important;
    left: 0 !important; 
    right: 0 !important;
    top: 0 !important; 
    margin: 0 auto !important; 
    padding: 0 !important; 
    background: white !important; 
    color: black !important; 
    box-shadow:none !important; 
  } 
}`}</style>
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row h-full sm:h-[90vh] print:h-auto print:border-none print:shadow-none animate-scale-up">
        
        <div className="flex-1 p-6 md:p-10 overflow-y-auto print:p-0 custom-scroll bg-slate-50 dark:bg-slate-900">
          <div className="max-w-lg mx-auto flex justify-between items-center mb-6 print:hidden">
            <h3 className="font-extrabold text-slate-800 dark:text-white">Print Output</h3>
            <select value={format} onChange={handleSelectChange} className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none shadow-sm border border-slate-200 dark:border-slate-700"><option value="thermal">Thermal Roll</option><option value="a4">A4 Invoice</option><option value="kot">Kitchen Ticket</option></select>
          </div>
          
          <div id="print-area" className={`bg-white text-black shadow-lg mx-auto print:shadow-none rounded-sm border border-slate-200 print:border-none ${format==='thermal'||format==='kot' ? 'w-[80mm] p-6 text-[12px] font-mono' : 'w-[210mm] min-h-[297mm] p-10 font-sans'}`}>
            {format === 'thermal' && (
              <div>
                <div className="text-center pb-3 border-b border-dashed border-black">
                  <h2 className="text-lg font-black uppercase tracking-tight">{settings.hotelName}</h2><p className="text-[10px]">{settings.address}</p><p className="text-[10px] font-bold mt-1">Tel: {settings.phone}</p><p className="text-[10px]">GSTIN: {settings.gstNumber}</p>
                </div>
                <div className="py-3 border-b border-dashed border-black text-[11px] font-bold space-y-1">
                  <div className="flex justify-between"><span>Bill: {order.billNumber}</span><span>{order.date}</span></div>
                  <div className="flex justify-between"><span>{order.billType}</span><span>{order.time}</span></div>
                  <div className="mt-1">Client: {order.customerName}</div>
                </div>
                <table className="w-full text-left mt-3 border-b border-dashed border-black pb-3 block">
                  <thead><tr className="border-b border-black text-[10px] flex pb-1 w-full"><th className="flex-1 font-bold">Item</th><th className="w-10 text-center font-bold">Qty</th><th className="w-16 text-right font-bold">Amt</th></tr></thead>
                  <tbody className="flex flex-col mt-2 w-full gap-1.5">{order.items.map((i: CartItem) => (<tr key={i.id} className="flex text-[11px] items-center"><td className="flex-1 pr-2 font-bold">{i.name}</td><td className="w-10 text-center">{i.quantity}</td><td className="w-16 text-right font-bold">{(i.price*i.quantity).toFixed(0)}</td></tr>))}</tbody>
                </table>
                <div className="py-3 border-b border-dashed border-black space-y-1.5">
                  <div className="flex justify-between text-[11px]"><span>Subtotal</span><span>{order.subtotal.toFixed(2)}</span></div><div className="flex justify-between text-[11px]"><span>GST ({settings.gstPercentage}%)</span><span>{order.gstAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-base font-black mt-2 pt-2 border-t border-dashed border-black"><span>TOTAL</span><span>₹{order.total.toFixed(0)}</span></div>
                </div>
                <div className="text-center pt-4 text-[10px] font-bold"><p>{settings.footerMessage}</p><p className="mt-1 opacity-70">Paid via {order.paymentType}</p></div>
              </div>
            )}
            
            {format === 'a4' && (
              <div>
                <div className="flex justify-between border-b-4 border-slate-900 pb-6 mb-8">
                  <div><h1 className="text-4xl font-black uppercase text-slate-900">{settings.hotelName}</h1><p className="text-slate-600 mt-2 max-w-sm">{settings.address}</p><p className="font-bold text-slate-800 mt-1">{settings.phone}</p></div>
                  <div className="text-right"><h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-2">Invoice</h2><p className="font-bold text-slate-800">GSTIN: {settings.gstNumber}</p></div>
                </div>
                <div className="flex justify-between mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Billed To</p><p className="font-black text-lg">{order.customerName}</p><p className="text-slate-600">{order.customerPhone}</p><p className="font-bold mt-2 bg-white border border-slate-200 inline-block px-3 py-1 rounded-md text-xs">{order.billType}</p></div>
                  <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Invoice Details</p><p className="font-black text-lg">{order.billNumber}</p><p className="text-slate-600">{order.date} &bull; {order.time}</p><p className="font-bold mt-2 bg-white border border-slate-200 inline-block px-3 py-1 rounded-md text-xs">{order.paymentType}</p></div>
                </div>
                <table className="w-full text-left border-collapse mb-8">
                  <thead><tr className="bg-slate-900 text-white"><th className="p-4 font-bold rounded-tl-lg">Item</th><th className="p-4 font-bold text-center">Qty</th><th className="p-4 font-bold text-right">Price</th><th className="p-4 font-bold text-right rounded-tr-lg">Total</th></tr></thead>
                  <tbody>{order.items.map((i: CartItem,idx: number) => (<tr key={i.id} className="border-b border-slate-200"><td className="p-4 font-bold text-slate-800">{idx+1}. {i.name}</td><td className="p-4 text-center font-bold text-slate-600">{i.quantity}</td><td className="p-4 text-right text-slate-600">₹{i.price.toFixed(2)}</td><td className="p-4 text-right font-black text-slate-800">₹{(i.price*i.quantity).toFixed(2)}</td></tr>))}</tbody>
                </table>
                <div className="flex justify-end"><div className="w-80 bg-slate-50 p-6 rounded-xl border border-slate-200"><div className="flex justify-between py-2 text-slate-600 font-bold"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div><div className="flex justify-between py-2 text-slate-600 font-bold"><span>Tax ({settings.gstPercentage}%)</span><span>₹{order.gstAmount.toFixed(2)}</span></div><div className="flex justify-between py-4 mt-2 border-t-2 border-slate-300 text-xl font-black text-slate-900"><span>Grand Total</span><span>₹{order.total.toFixed(2)}</span></div></div></div>
                <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">{settings.footerMessage}</div>
              </div>
            )}

            {format === 'kot' && (
              <div>
                <div className="text-center pb-3 border-b-2 border-black"><h2 className="text-xl font-black uppercase">K.O.T</h2><p className="font-bold border-2 border-black inline-block px-3 py-1 mt-2 text-xs">{order.billType}</p></div>
                <div className="py-3 border-b-2 border-black text-[12px] font-bold"><div className="flex justify-between"><span>#{order.billNumber}</span><span>{order.time}</span></div><div className="mt-2 text-sm">Client: {order.customerName}</div></div>
                <table className="w-full text-left mt-3">
                  <thead><tr className="border-b-2 border-black text-[12px]"><th className="pb-2">ITEM</th><th className="pb-2 text-right">QTY</th></tr></thead>
                  <tbody className="divide-y divide-black/20">{order.items.map((i: CartItem) => (<tr key={i.id}><td className="py-3 font-black text-[14px] uppercase">{i.name}</td><td className="py-3 text-right font-black text-[18px]">x {i.quantity}</td></tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 w-full md:w-72 flex flex-col print:hidden border-t md:border-l border-slate-100 dark:border-slate-700">
          <div className="mb-auto">
            <h4 className="font-extrabold text-2xl text-slate-800 dark:text-white mb-2">Issue Bill</h4>
            <p className="text-sm text-slate-500 font-medium mb-6">Verify layout format before sending to printer.</p>
          </div>
          <div className="space-y-3">
            <button onClick={handlePrint} disabled={isPrinting} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-violet-500/20 flex justify-center items-center gap-2 transform active:scale-[0.98] transition-all"><Printer size={20}/> Print</button>
            <button onClick={()=>setIsReceiptOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm py-4 rounded-2xl transition-all">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
