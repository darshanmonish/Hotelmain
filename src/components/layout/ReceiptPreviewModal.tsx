import React, { useState, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Settings, CartItem } from '@/types';

export default function ReceiptPreviewModal() {
  const context = useAppContext();
  const { currentReceiptOrder: order, setIsReceiptOpen, settings } = context;

  const [format, setFormat] = useState(settings.printFormat);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as Settings['printFormat']);
  };

  const handlePrint = useCallback(() => {
    if (isPrinting) return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 0);
  }, [isPrinting]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-6 bg-slate-950/70 backdrop-blur-md print:p-0 print:bg-transparent print:block print:static print:inset-auto print:h-auto print:w-full print:overflow-visible">
      <style>{`@media print { 
  @page { size: auto; margin: 4mm; } 
  body { 
    background: white !important; 
    color: #1c1917 !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }
  #print-area { 
    margin: 0 auto !important; 
    padding: 16px !important; 
    box-shadow: none !important; 
    border: none !important; 
    background: white !important; 
    color: #1c1917 !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  } 
}`}</style>

      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row h-full sm:h-[90vh] print:h-auto print:block print:border-none print:shadow-none animate-scale-up print:overflow-visible">
        
        {/* Preview Scrollable Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto print:p-0 custom-scroll bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          <div className="w-full max-w-lg flex justify-between items-center mb-5 print:hidden">
            <span className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Receipt Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Format:</span>
              <select 
                value={format} 
                onChange={handleSelectChange} 
                className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white outline-none shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <option value="thermal">Thermal Roll (80mm)</option>
                <option value="a4">A4 Invoice</option>
                <option value="kot">Kitchen Ticket (KOT)</option>
              </select>
            </div>
          </div>
          
          {/* THE RECEIPT CARD */}
          <div 
            id="print-area" 
            className={`transition-all select-none print:select-auto ${
              format === 'thermal'
                ? 'w-full max-w-[420px] sm:w-[100mm] p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
                : format === 'kot'
                ? 'w-full max-w-[420px] sm:w-[100mm] p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
                : 'w-full max-w-[210mm] min-h-[297mm] p-10 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
            }`}
          >
            {/* THERMAL ROLL FORMAT — Single-Line Brand Name, Large Easy-to-Read Fonts, No Logo/Feedback/QR */}
            {format === 'thermal' && (
              <div>
                {/* Brand Name in Single Line (No Logo) */}
                <div className="text-center pb-1">
                  <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-black uppercase tracking-tight text-stone-900 leading-tight whitespace-nowrap">
                    {settings.hotelName || 'VETRIVEL UNAVAGAM'}
                  </h1>
                  <p className="text-xs sm:text-[14px] text-stone-700 font-medium leading-snug mt-1.5">
                    {settings.address || '87/92 VCV Road, RS Puram, Coimbatore - 641002'}
                  </p>
                  <p className="text-xs sm:text-[14px] font-bold text-stone-800 leading-snug mt-0.5">
                    Tel: {settings.phone || '+91 98429 99931'}
                  </p>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-stone-800 my-4"></div>

                {/* Bill Metadata Grid with Larger Readable Font */}
                <div className="text-[14.5px] sm:text-[15.5px] leading-relaxed">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex gap-2.5">
                        <span className="font-bold text-stone-600 w-18">Bill No:</span>
                        <span className="font-black text-stone-900">{order.billNumber}</span>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="font-bold text-stone-600 w-18">Type:</span>
                        <span className="font-black text-stone-900">{order.billType}</span>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="font-bold text-stone-600 w-18">Table:</span>
                        <span className="font-black text-stone-900">
                          {order.tableNumber
                            ? (order.customerName && order.customerName !== 'Walk-in'
                                ? `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)}) • ${order.customerName}`
                                : `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})`)
                            : (order.customerName || 'Takeaway')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex justify-end gap-2">
                        <span className="font-bold text-stone-600">Date:</span>
                        <span className="font-black text-stone-900">{order.date}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <span className="font-bold text-stone-600">Time:</span>
                        <span className="font-black text-stone-900">{order.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashed Divider */}
                <div className="border-b-2 border-dashed border-stone-400 my-4"></div>

                {/* Items Table (Itemized Order Heading Removed) */}
                <div className="pt-0.5">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs sm:text-[14px] font-black uppercase tracking-wider text-stone-900 border-b-2 border-stone-300">
                        <th className="pb-2 font-black text-left">ITEM</th>
                        <th className="pb-2 font-black text-center w-12">QTY</th>
                        <th className="pb-2 font-black text-right w-20">PRICE</th>
                        <th className="pb-2 font-black text-right w-24">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {order.items.map((i: CartItem) => (
                        <tr key={i.id} className="text-stone-900 text-[14.5px] sm:text-base">
                          <td className="py-2.5 pr-2 font-bold leading-snug">{i.name}</td>
                          <td className="py-2.5 text-center font-black text-stone-900">{i.quantity}</td>
                          <td className="py-2.5 text-right font-medium text-stone-700">{i.price.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-black text-stone-900">₹{(i.price * i.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dashed Divider */}
                <div className="border-b-2 border-dashed border-stone-400 my-4"></div>

                {/* Subtotal, GST & Total */}
                <div className="py-1 space-y-1.5">
                  <div className="flex justify-between text-[15px] sm:text-base font-bold text-stone-800">
                    <span className="ml-auto pr-8">Subtotal</span>
                    <span className="w-28 text-right font-black">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  {settings.gstPercentage > 0 && order.gstAmount > 0 && (
                    <div className="flex justify-between text-[15px] sm:text-base font-bold text-stone-800">
                      <span className="ml-auto pr-8">GST ({settings.gstPercentage}%)</span>
                      <span className="w-28 text-right font-black">₹{order.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-b-2 border-stone-900 my-3"></div>
                  <div className="flex justify-between items-baseline text-stone-900 pt-1">
                    <span className="ml-auto pr-8 text-xl sm:text-2xl font-black tracking-tight">TOTAL</span>
                    <span className="w-36 text-right text-2xl sm:text-3xl font-black tracking-tight">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-stone-900 my-4"></div>

                {/* Bottom Bar: Centered Payment Pill (Feedback & Scanner Removed) */}
                <div className="flex items-center justify-center pt-1">
                  <div className="inline-flex items-center px-5 py-2 rounded-full border-2 border-stone-900 text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 bg-transparent">
                    PAID VIA {order.paymentType || 'UPI'}
                  </div>
                </div>

                {/* Centered Footer Message */}
                <p className="text-center text-xs sm:text-[13px] font-bold uppercase tracking-wider text-stone-800 mt-5 leading-normal">
                  {settings.footerMessage || 'NO BRANCHES • THANK YOU FOR CHOOSING VETRIVEL UNAVAGAM'}
                </p>
              </div>
            )}
            
            {/* A4 INVOICE FORMAT */}
            {format === 'a4' && (
              <div>
                <div className="flex justify-between items-center border-b-2 border-stone-800 pb-6 mb-8">
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-stone-900">{settings.hotelName || 'VETRIVEL UNAVAGAM'}</h1>
                    <p className="text-stone-700 text-sm mt-1">{settings.address}</p>
                    <p className="font-bold text-stone-800 text-sm mt-0.5">Tel: {settings.phone}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-black text-stone-400 uppercase tracking-widest mb-1">Invoice</h2>
                    <p className="text-sm font-bold text-stone-800">Bill #: {order.billNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Billed To</p>
                    <p className="font-black text-lg text-stone-900">{order.customerName}</p>
                    <p className="text-stone-700 text-sm">{order.customerPhone}</p>
                    <p className="font-bold mt-2 bg-white border border-stone-300 inline-block px-3 py-1 rounded-md text-xs">
                      {order.billType}{order.tableNumber ? ` - Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Invoice Details</p>
                    <p className="font-bold text-stone-900">{order.date} &bull; {order.time}</p>
                    <p className="font-bold mt-2 bg-white border border-stone-300 inline-block px-3 py-1 rounded-md text-xs">
                      PAID VIA {order.paymentType}
                    </p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse mb-8">
                  <thead>
                    <tr className="bg-stone-900 text-white">
                      <th className="p-4 font-bold rounded-tl-lg">Item</th>
                      <th className="p-4 font-bold text-center">Qty</th>
                      <th className="p-4 font-bold text-right">Price</th>
                      <th className="p-4 font-bold text-right rounded-tr-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {order.items.map((i: CartItem, idx: number) => (
                      <tr key={i.id}>
                        <td className="p-4 font-semibold text-stone-900">{idx + 1}. {i.name}</td>
                        <td className="p-4 text-center font-medium text-stone-700">{i.quantity}</td>
                        <td className="p-4 text-right font-medium text-stone-700">₹{i.price.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-stone-900">₹{(i.price * i.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-8">
                  <div className="w-80 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-stone-700 font-semibold text-sm">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    {settings.gstPercentage > 0 && order.gstAmount > 0 && (
                      <div className="flex justify-between text-stone-700 font-semibold text-sm">
                        <span>GST ({settings.gstPercentage}%)</span>
                        <span>₹{order.gstAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-300 pt-3 flex justify-between items-baseline">
                      <span className="text-lg font-black text-stone-900">Total</span>
                      <span className="text-2xl font-black text-stone-900">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center border-t border-stone-300 pt-6">
                  <div className="inline-flex items-center px-5 py-2 rounded-full border border-stone-800 text-xs font-black uppercase tracking-wider text-stone-900">
                    PAID VIA {order.paymentType || 'UPI'}
                  </div>
                </div>

                <div className="mt-8 text-center text-stone-600 font-bold text-xs uppercase tracking-widest">
                  {settings.footerMessage || 'NO BRANCHES • THANK YOU FOR CHOOSING VETRIVEL UNAVAGAM'}
                </div>
              </div>
            )}

            {/* KOT (KITCHEN ORDER TICKET) */}
            {format === 'kot' && (
              <div>
                <div className="text-center pb-3 border-b-2 border-stone-900">
                  <h2 className="text-2xl font-black uppercase tracking-widest">K.O.T</h2>
                  <p className="text-xs font-black tracking-wider text-stone-600 uppercase mt-0.5">Kitchen Order Ticket</p>
                  <p className="font-black border-2 border-stone-900 inline-block px-4 py-1 mt-2 text-sm uppercase rounded-lg">
                    {order.billType}{order.tableNumber ? ` - Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})` : ' - Takeaway'}
                  </p>
                </div>
                <div className="py-3 border-b-2 border-stone-900 text-xs font-bold">
                  <div className="flex justify-between">
                    <span>Order: #{order.billNumber}</span>
                    <span>{order.time}</span>
                  </div>
                  <div className="mt-1 text-sm font-black">
                    Table: {order.tableNumber ? `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})` : 'Counter'}
                  </div>
                </div>
                <table className="w-full text-left mt-3">
                  <thead>
                    <tr className="border-b-2 border-stone-900 text-xs font-black">
                      <th className="pb-2">ITEM</th>
                      <th className="pb-2 text-right">QTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {order.items.map((i: CartItem) => (
                      <tr key={i.id}>
                        <td className="py-2.5 font-black text-sm uppercase text-stone-900">{i.name}</td>
                        <td className="py-2.5 text-right font-black text-lg text-stone-900">x {i.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Controls Sidebar */}
        <div className="bg-white dark:bg-slate-900 p-6 w-full md:w-80 flex flex-col print:hidden border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="mb-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-extrabold text-2xl text-slate-800 dark:text-white">Print Receipt</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Vetrivel Unavagam authentic theme matched to your thermal printer paper.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Bill Number:</span>
                <span className="font-bold text-slate-800 dark:text-white">{order.billNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Table:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {order.tableNumber ? `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})` : 'Takeaway'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.paymentType}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                <span className="font-black text-slate-900 dark:text-white text-base">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handlePrint} 
              disabled={isPrinting} 
              className="w-full bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-stone-900/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
            >
              <Printer size={18}/> Print Slip
            </button>
            <button 
              onClick={()=>setIsReceiptOpen(false)} 
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 font-bold text-sm py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
