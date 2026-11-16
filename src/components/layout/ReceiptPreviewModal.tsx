import React, { useState, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Settings, CartItem } from '@/types';

export function RestaurantSproutLogo({ className = "w-13 h-13" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-hidden="true"
    >
      {/* Bowl Rim */}
      <ellipse cx="50" cy="56" rx="34" ry="4.5" fill="#1c1917" />
      {/* Bowl Body */}
      <path 
        d="M20 56 C24 71, 76 71, 80 56 Z" 
        fill="#1c1917" 
      />
      {/* Bowl Base */}
      <path 
        d="M36 70 L64 70 C60 74, 40 74, 36 70 Z" 
        fill="#1c1917" 
      />
      {/* Stem */}
      <path 
        d="M50 54 C50 44, 49 33, 47 18" 
        stroke="#1c1917" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
      />
      {/* Left Leaf */}
      <path 
        d="M48 40 C36 41, 26 33, 24 23 C30 20, 42 24, 48 35 Z" 
        fill="#1c1917" 
      />
      {/* Right Leaf */}
      <path 
        d="M48 30 C54 16, 68 8, 77 10 C75 22, 65 31, 49 32 Z" 
        fill="#1c1917" 
      />
    </svg>
  );
}

export function BillQRCode({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 29 29" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-label="QR Code"
    >
      <rect width="29" height="29" fill="white" />
      {/* Top Left Finder */}
      <rect x="2" y="2" width="7" height="7" fill="#1c1917" />
      <rect x="3" y="3" width="5" height="5" fill="white" />
      <rect x="4" y="4" width="3" height="3" fill="#1c1917" />

      {/* Top Right Finder */}
      <rect x="20" y="2" width="7" height="7" fill="#1c1917" />
      <rect x="21" y="3" width="5" height="5" fill="white" />
      <rect x="22" y="4" width="3" height="3" fill="#1c1917" />

      {/* Bottom Left Finder */}
      <rect x="2" y="20" width="7" height="7" fill="#1c1917" />
      <rect x="3" y="21" width="5" height="5" fill="white" />
      <rect x="4" y="22" width="3" height="3" fill="#1c1917" />

      {/* Timing Patterns */}
      <rect x="10" y="4" width="1" height="1" fill="#1c1917" />
      <rect x="12" y="4" width="1" height="1" fill="#1c1917" />
      <rect x="14" y="4" width="1" height="1" fill="#1c1917" />
      <rect x="16" y="4" width="1" height="1" fill="#1c1917" />
      <rect x="18" y="4" width="1" height="1" fill="#1c1917" />

      <rect x="4" y="10" width="1" height="1" fill="#1c1917" />
      <rect x="4" y="12" width="1" height="1" fill="#1c1917" />
      <rect x="4" y="14" width="1" height="1" fill="#1c1917" />
      <rect x="4" y="16" width="1" height="1" fill="#1c1917" />
      <rect x="4" y="18" width="1" height="1" fill="#1c1917" />

      {/* Data Cells */}
      <rect x="10" y="2" width="2" height="1" fill="#1c1917" />
      <rect x="14" y="2" width="1" height="1" fill="#1c1917" />
      <rect x="17" y="2" width="2" height="1" fill="#1c1917" />
      
      <rect x="10" y="6" width="1" height="2" fill="#1c1917" />
      <rect x="13" y="7" width="2" height="1" fill="#1c1917" />
      <rect x="17" y="6" width="1" height="2" fill="#1c1917" />

      <rect x="10" y="10" width="3" height="3" fill="#1c1917" />
      <rect x="11" y="11" width="1" height="1" fill="white" />
      <rect x="14" y="10" width="2" height="1" fill="#1c1917" />
      <rect x="18" y="10" width="2" height="2" fill="#1c1917" />
      <rect x="22" y="10" width="1" height="2" fill="#1c1917" />
      <rect x="25" y="10" width="2" height="1" fill="#1c1917" />

      <rect x="10" y="14" width="2" height="2" fill="#1c1917" />
      <rect x="13" y="13" width="2" height="1" fill="#1c1917" />
      <rect x="17" y="14" width="1" height="2" fill="#1c1917" />
      <rect x="20" y="13" width="2" height="2" fill="#1c1917" />
      <rect x="24" y="13" width="1" height="1" fill="#1c1917" />
      <rect x="26" y="14" width="2" height="2" fill="#1c1917" />

      <rect x="10" y="18" width="1" height="2" fill="#1c1917" />
      <rect x="13" y="17" width="2" height="2" fill="#1c1917" />
      <rect x="16" y="18" width="3" height="1" fill="#1c1917" />
      <rect x="21" y="17" width="1" height="3" fill="#1c1917" />
      <rect x="24" y="18" width="2" height="1" fill="#1c1917" />

      <rect x="10" y="22" width="2" height="1" fill="#1c1917" />
      <rect x="14" y="21" width="1" height="2" fill="#1c1917" />
      <rect x="17" y="21" width="2" height="1" fill="#1c1917" />
      <rect x="20" y="22" width="3" height="1" fill="#1c1917" />
      <rect x="25" y="21" width="2" height="2" fill="#1c1917" />

      <rect x="10" y="25" width="3" height="2" fill="#1c1917" />
      <rect x="15" y="25" width="1" height="2" fill="#1c1917" />
      <rect x="18" y="24" width="2" height="3" fill="#1c1917" />
      <rect x="22" y="25" width="1" height="2" fill="#1c1917" />
      <rect x="25" y="25" width="2" height="2" fill="#1c1917" />
    </svg>
  );
}

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
    padding: 12px !important; 
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
          <div className="w-full max-w-md flex justify-between items-center mb-5 print:hidden">
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
          
          {/* THE RECEIPT CARD - Clean Crisp White Background */}
          <div 
            id="print-area" 
            className={`transition-all select-none print:select-auto ${
              format === 'thermal'
                ? 'w-full max-w-[340px] sm:w-[84mm] p-6 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
                : format === 'kot'
                ? 'w-full max-w-[340px] sm:w-[84mm] p-6 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
                : 'w-full max-w-[210mm] min-h-[297mm] p-10 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 text-stone-900 font-sans'
            }`}
          >
            {/* THERMAL ROLL FORMAT */}
            {format === 'thermal' && (
              <div>
                {/* Header with Botanical Logo and Hotel Details (No GST Number) */}
                <div className="flex items-center gap-3">
                  <RestaurantSproutLogo className="w-13 h-13 text-stone-900 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-[22px] font-black uppercase tracking-tight text-stone-900 leading-tight">
                      {settings.hotelName || 'VETRIVEL UNAVAGAM'}
                    </h1>
                    <p className="text-[10px] sm:text-[10.5px] text-stone-700 font-medium leading-snug mt-0.5">
                      {settings.address || '87/92 VCV Road, RS Puram, Coimbatore - 641002'}
                    </p>
                    <p className="text-[10px] sm:text-[10.5px] font-bold text-stone-800 leading-snug">
                      Tel: {settings.phone || '+91 98429 99931'}
                    </p>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="border-b border-stone-800 my-3"></div>

                {/* Bill Metadata Grid */}
                <div className="text-[11px] leading-relaxed">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-600 w-14">Bill No:</span>
                        <span className="font-bold text-stone-900">{order.billNumber}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-600 w-14">Type:</span>
                        <span className="font-bold text-stone-900">{order.billType}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-600 w-14">Table:</span>
                        <span className="font-bold text-stone-900">
                          {order.tableNumber
                            ? (order.customerName && order.customerName !== 'Walk-in'
                                ? `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)}) • ${order.customerName}`
                                : `Table ${order.tableNumber} (Type ${String.fromCharCode(64 + order.tableNumber)})`)
                            : (order.customerName || 'Takeaway')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <div className="flex justify-end gap-2">
                        <span className="font-semibold text-stone-600">Date:</span>
                        <span className="font-bold text-stone-900">{order.date}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <span className="font-semibold text-stone-600">Time:</span>
                        <span className="font-bold text-stone-900">{order.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashed Divider */}
                <div className="border-b border-dashed border-stone-400 my-3"></div>

                {/* Itemized Order Section */}
                <div className="pt-0.5">
                  <h2 className="text-xs font-black text-stone-900 tracking-tight uppercase mb-2">Itemized Order</h2>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300">
                        <th className="pb-1.5 font-bold text-left">ITEM</th>
                        <th className="pb-1.5 font-bold text-center w-10">QTY</th>
                        <th className="pb-1.5 font-bold text-right w-14">PRICE</th>
                        <th className="pb-1.5 font-bold text-right w-16">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60">
                      {order.items.map((i: CartItem) => (
                        <tr key={i.id} className="text-stone-900 text-[11px] sm:text-[11.5px]">
                          <td className="py-1.5 pr-2 font-medium leading-snug">{i.name}</td>
                          <td className="py-1.5 text-center font-medium text-stone-800">{i.quantity}</td>
                          <td className="py-1.5 text-right font-medium text-stone-800">{i.price.toFixed(2)}</td>
                          <td className="py-1.5 text-right font-bold text-stone-900">₹{(i.price * i.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dashed Divider */}
                <div className="border-b border-dashed border-stone-400 my-3"></div>

                {/* Subtotal, GST & Total */}
                <div className="py-1 space-y-1">
                  <div className="flex justify-between text-[11px] sm:text-[11.5px] font-medium text-stone-800">
                    <span className="ml-auto pr-6">Subtotal</span>
                    <span className="w-20 text-right font-semibold">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  {settings.gstPercentage > 0 && order.gstAmount > 0 && (
                    <div className="flex justify-between text-[11px] sm:text-[11.5px] font-medium text-stone-800">
                      <span className="ml-auto pr-6">GST ({settings.gstPercentage}%)</span>
                      <span className="w-20 text-right font-semibold">₹{order.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-b border-stone-800 my-2"></div>
                  <div className="flex justify-between items-baseline text-stone-900 pt-0.5">
                    <span className="ml-auto pr-6 text-sm font-black tracking-tight">TOTAL</span>
                    <span className="w-24 text-right text-lg sm:text-xl font-black tracking-tight">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-stone-900 my-3"></div>

                {/* Bottom Bar: Pill & QR */}
                <div className="flex items-center justify-between pt-1">
                  {/* Payment Pill */}
                  <div className="inline-flex items-center px-3.5 py-1 rounded-full border border-stone-800 text-[9.5px] font-black uppercase tracking-wider text-stone-900 bg-transparent">
                    PAID VIA {order.paymentType || 'UPI'}
                  </div>

                  {/* Feedback & Payment with QR */}
                  <div className="flex items-center gap-1.5">
                    <div className="text-right text-[8.5px] font-bold text-stone-700 leading-tight">
                      <div>Feedback</div>
                      <div>&amp; Payment</div>
                    </div>
                    <div className="w-9 h-9 p-0.5 bg-white border border-stone-300 rounded shadow-2xs shrink-0 flex items-center justify-center">
                      <BillQRCode className="w-full h-full text-stone-900" />
                    </div>
                  </div>
                </div>

                {/* Centered Footer Message */}
                <p className="text-center text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider text-stone-800 mt-4 leading-normal">
                  {settings.footerMessage || 'NO BRANCHES • THANK YOU FOR CHOOSING VETRIVEL UNAVAGAM'}
                </p>
              </div>
            )}
            
            {/* A4 INVOICE FORMAT */}
            {format === 'a4' && (
              <div>
                <div className="flex justify-between items-center border-b-2 border-stone-800 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <RestaurantSproutLogo className="w-16 h-16 text-stone-900 shrink-0" />
                    <div>
                      <h1 className="text-3xl font-black uppercase tracking-tight text-stone-900">{settings.hotelName || 'VETRIVEL UNAVAGAM'}</h1>
                      <p className="text-stone-700 text-sm mt-1">{settings.address}</p>
                      <p className="font-bold text-stone-800 text-sm mt-0.5">Tel: {settings.phone}</p>
                    </div>
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

                <div className="flex items-center justify-between border-t border-stone-300 pt-6">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-stone-800 text-xs font-black uppercase tracking-wider text-stone-900">
                    PAID VIA {order.paymentType || 'UPI'}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs font-bold text-stone-700 leading-tight">
                      <div>Scan to Pay</div>
                      <div>&amp; Give Feedback</div>
                    </div>
                    <div className="w-12 h-12 p-1 bg-white border border-stone-300 rounded">
                      <BillQRCode className="w-full h-full text-stone-900" />
                    </div>
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
                <span className="font-black text-slate-900 dark:text-white text-sm">₹{order.total.toFixed(2)}</span>
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
