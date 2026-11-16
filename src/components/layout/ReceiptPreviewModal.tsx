import React, { useState, useCallback, useMemo } from 'react';
import { Printer, Edit, Plus, Minus, Trash2, ShoppingCart, Check, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Settings, CartItem, Order } from '@/types';
import { format12HourTime } from '@/utils/constants';

export default function ReceiptPreviewModal() {
  const context = useAppContext();
  const { currentReceiptOrder: order, setIsReceiptOpen, settings, updateOrder, editOrderInPOS, menu, showToast } = context;

  const [format, setFormat] = useState(settings.printFormat);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Track order id for syncing without cascading renders
  const [prevOrderId, setPrevOrderId] = useState(order?.id);

  // Edit form states
  const [editedCustomerName, setEditedCustomerName] = useState(order?.customerName || '');
  const [editedCustomerPhone, setEditedCustomerPhone] = useState(order?.customerPhone || '');
  const [editedTableNumber, setEditedTableNumber] = useState<number | undefined>(order?.tableNumber);
  const [editedBillType, setEditedBillType] = useState<'Dine-In' | 'Parcel'>(order?.billType || 'Dine-In');
  const [editedPaymentType, setEditedPaymentType] = useState<'UPI' | 'Cash' | 'Card'>(order?.paymentType || 'UPI');
  const [editedItems, setEditedItems] = useState<CartItem[]>(order?.items ? [...order.items] : []);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [customEntryName, setCustomEntryName] = useState<string>('');
  const [customEntryPrice, setCustomEntryPrice] = useState<string>('');

  if (order && order.id !== prevOrderId) {
    setPrevOrderId(order.id);
    setEditedCustomerName(order.customerName || '');
    setEditedCustomerPhone(order.customerPhone || '');
    setEditedTableNumber(order.tableNumber);
    setEditedBillType(order.billType || 'Dine-In');
    setEditedPaymentType(order.paymentType || 'UPI');
    setEditedItems(order.items ? order.items.map(i => ({ ...i })) : []);
  }

  const editedSubtotal = useMemo(() => {
    return editedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [editedItems]);

  const editedGstAmount = useMemo(() => {
    return settings.gstPercentage > 0 ? (editedSubtotal * settings.gstPercentage) / 100 : 0;
  }, [editedSubtotal, settings.gstPercentage]);

  const editedTotal = useMemo(() => {
    return Math.round(editedSubtotal + editedGstAmount);
  }, [editedSubtotal, editedGstAmount]);

  const handleUpdateItemQty = (id: string, delta: number) => {
    setEditedItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (id: string) => {
    setEditedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItemFromMenu = () => {
    if (!selectedMenuItemId) return;
    const item = menu.find(m => m.id === selectedMenuItemId);
    if (!item) return;
    setEditedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSelectedMenuItemId('');
  };

  const handleSaveOrder = async () => {
    if (!order) return;
    if (editedItems.length === 0) {
      showToast('A bill must contain at least one item', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const updatedOrder: Order = {
        ...order,
        customerName: editedCustomerName.trim() || 'Walk-in',
        customerPhone: editedCustomerPhone.trim(),
        tableNumber: editedTableNumber,
        billType: editedBillType,
        paymentType: editedPaymentType,
        items: editedItems,
        subtotal: editedSubtotal,
        gstAmount: editedGstAmount,
        total: editedTotal,
      };
      await updateOrder(updatedOrder);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="fixed inset-0 z-200 flex items-center justify-center sm:p-6 bg-slate-950/70 backdrop-blur-md print:p-0 print:m-0 print:bg-transparent print:block print:static print:inset-auto print:h-auto print:w-full print:overflow-visible">
      <style>{`@media print { 
  @page { 
    size: auto; 
    margin: 0mm !important; 
  } 
  *, *:before, *:after {
    animation: none !important;
    transition: none !important;
    filter: none !important;
  }
  html, body { 
    margin: 0mm !important; 
    padding: 0mm !important; 
    background: #ffffff !important; 
    color: #000000 !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }
  body * {
    visibility: hidden !important;
  }
  #print-area,
  #print-area * {
    visibility: visible !important;
  }
  #print-area { 
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    margin: 0 !important; 
    padding: 0mm 1mm 2mm 1mm !important; 
    box-shadow: none !important; 
    border: none !important; 
    border-radius: 0 !important;
    background: #ffffff !important; 
    color: #000000 !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
    width: 100% !important; 
    max-width: 100% !important; 
    transform: none !important;
    float: none !important;
  } 
  #print-area > div:first-child,
  #print-area h1:first-child {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
}`}</style>

      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row h-full sm:h-[90vh] print:h-auto print:block print:border-none print:shadow-none animate-scale-up print:overflow-visible">
        
        {/* Preview / Edit Scrollable Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto print:p-0 custom-scroll bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          
          {/* Top Bar with Mode Switcher & Format Selector */}
          <div className="w-full max-w-xl flex justify-between items-center mb-5 print:hidden">
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
              <button 
                type="button"
                onClick={() => setIsEditing(false)} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isEditing 
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Receipt Preview
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(true)} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditing 
                    ? 'bg-violet-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Edit size={13}/> Edit Bill
              </button>
            </div>

            {!isEditing && (
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
            )}
          </div>
          
          {/* EDIT BILL MODE */}
          {isEditing ? (
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 animate-pop-in space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Edit className="text-violet-600" size={22}/> Edit Bill {order.billNumber}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Update dining table, customer details, add/remove items or adjust quantities.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-extrabold text-xs rounded-full">
                    Active Edit
                  </span>
                </div>
              </div>

              {/* Order Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Customer Name
                  </label>
                  <input 
                    type="text" 
                    value={editedCustomerName} 
                    onChange={e => setEditedCustomerName(e.target.value)}
                    placeholder="Walk-in / Customer name"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={editedCustomerPhone} 
                    onChange={e => setEditedCustomerPhone(e.target.value)}
                    placeholder="Optional phone number"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Table / Order Type
                  </label>
                  <select 
                    value={editedTableNumber !== undefined ? String(editedTableNumber) : 'takeaway'}
                    onChange={e => {
                      if (e.target.value === 'takeaway') {
                        setEditedTableNumber(undefined);
                        setEditedBillType('Parcel');
                      } else {
                        const tbl = parseInt(e.target.value, 10);
                        setEditedTableNumber(tbl);
                        setEditedBillType('Dine-In');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="takeaway">Takeaway / Parcel Counter</option>
                    <option value="1">Table 1 (Type A)</option>
                    <option value="2">Table 2 (Type B)</option>
                    <option value="3">Table 3 (Type C)</option>
                    <option value="4">Table 4 (Type D)</option>
                    <option value="5">Table 5 (Type E)</option>
                    <option value="6">Table 6 (Type F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Payment Method
                  </label>
                  <select 
                    value={editedPaymentType}
                    onChange={e => setEditedPaymentType(e.target.value as 'UPI' | 'Cash' | 'Card')}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              {/* Items List Header */}
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order Items ({editedItems.length})
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Qty &amp; Amount
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scroll pr-1">
                  {editedItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-400">₹</span>
                          <input 
                            type="number"
                            min="0"
                            step="any"
                            value={item.price}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setEditedItems(prev => prev.map(i => i.id === item.id ? { ...i, price: isNaN(val) ? 0 : val } : i));
                            }}
                            className="w-20 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:border-violet-500 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                            title="Edit manual price"
                          />
                          <span className="text-[10px] text-slate-400 font-medium">/ unit</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-0.5 shadow-xs">
                          <button 
                            type="button" 
                            onClick={() => handleUpdateItemQty(item.id, -1)} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold transition-colors cursor-pointer"
                          >
                            <Minus size={13}/>
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-white">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateItemQty(item.id, 1)} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold transition-colors cursor-pointer"
                          >
                            <Plus size={13}/>
                          </button>
                        </div>

                        <span className="font-black text-sm text-slate-900 dark:text-white w-16 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(item.id)} 
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove item from bill"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}

                  {editedItems.length === 0 && (
                    <div className="text-center py-6 text-sm text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40">
                      No items left in bill. Please add an item from menu below.
                    </div>
                  )}
                </div>

                {/* Add Item From Menu */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <select 
                    value={selectedMenuItemId}
                    onChange={e => setSelectedMenuItemId(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="">-- Add an item from menu --</option>
                    {menu.filter(m => m.isAvailable !== false).map(m => (
                      <option key={m.id} value={m.id}>{m.name} (₹{m.price})</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    disabled={!selectedMenuItemId}
                    onClick={handleAddItemFromMenu}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus size={15}/> Add to Bill
                  </button>
                </div>

                {/* Add Custom Manual Item Row */}
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <input 
                    type="text"
                    placeholder="Custom Item Name (e.g. Special Dish)"
                    value={customEntryName}
                    onChange={e => setCustomEntryName(e.target.value)}
                    className="flex-1 w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                      <span className="text-xs font-bold text-slate-400">₹</span>
                      <input 
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Price"
                        value={customEntryPrice}
                        onChange={e => setCustomEntryPrice(e.target.value)}
                        className="w-20 bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const p = parseFloat(customEntryPrice);
                        if (!isNaN(p) && p >= 0) {
                          setEditedItems(prev => [...prev, {
                            id: `custom-${Date.now()}`,
                            name: customEntryName.trim() || 'Custom Item',
                            price: p,
                            quantity: 1,
                            category: 'Custom',
                            isAvailable: true
                          }]);
                          setCustomEntryName('');
                          setCustomEntryPrice('');
                        } else {
                          showToast('Please enter a valid price', 'error');
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus size={13}/> Custom ₹
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Calculation Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{editedSubtotal.toFixed(2)}</span>
                </div>
                {settings.gstPercentage > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>GST ({settings.gstPercentage}%)</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{editedGstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">Updated Total</span>
                  <span className="text-2xl font-black text-violet-600 dark:text-violet-400">₹{editedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* THE RECEIPT CARD */
            <div 
              id="print-area" 
              className={`transition-all select-none print:select-auto ${
                format === 'thermal'
                  ? 'w-full max-w-105 sm:w-[100mm] p-6 sm:p-8 print:p-0 print:m-0 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
                  : format === 'kot'
                  ? 'w-full max-w-105 sm:w-[100mm] p-6 sm:p-8 print:p-0 print:m-0 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
                  : 'w-full max-w-[210mm] min-h-[297mm] p-10 print:p-4 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
              }`}
            >
            {/* THERMAL ROLL FORMAT — Crisp, High-Contrast Dark Text */}
            {format === 'thermal' && (
              <div className="pt-0 print:pt-0">
                {/* Brand Name in Single Line (No Logo) */}
                <div className="text-center pb-1 pt-0 print:pt-0">
                  <h1 className="text-2xl sm:text-[27px] font-black uppercase tracking-tight text-black leading-tight whitespace-nowrap mt-0 print:mt-0">
                    {settings.hotelName || 'VETRIVEL UNAVAGAM'}
                  </h1>
                  <p className="text-xs sm:text-[13px] text-stone-900 font-semibold leading-snug mt-1">
                    {settings.address || '87/92 VCV Road, RS Puram, Coimbatore - 641002'}
                  </p>
                  <p className="text-xs sm:text-[13px] font-bold text-black leading-snug mt-0.5">
                    Tel: {settings.phone || '+91 98429 99931'}
                  </p>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-black my-3.5"></div>

                {/* Bill Metadata Grid with High-Contrast Dark Text */}
                <div className="text-sm sm:text-[14.5px] leading-relaxed">
                  <div className="flex justify-between items-start gap-4 pr-6 sm:pr-8">
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-800 w-16">Bill No:</span>
                        <span className="font-bold text-black">{order.billNumber}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-800 w-16">Type:</span>
                        <span className="font-bold text-black">{order.billType}</span>
                      </div>
                    </div>

                    <div className="space-y-1 shrink-0 text-left">
                      <div className="flex gap-2">
                        <span className="font-bold text-stone-900 w-12">Date:</span>
                        <span className="font-extrabold text-black whitespace-nowrap">{order.date}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-stone-900 w-12">Time:</span>
                        <span className="font-extrabold text-black whitespace-nowrap">{format12HourTime(order.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashed Divider */}
                <div className="border-b border-dashed border-stone-500 my-3.5"></div>

                {/* Items Table with Crisp Dark Text */}
                <div className="pt-0.5">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-black border-b-2 border-black">
                        <th className="pb-2 font-black text-left">ITEM</th>
                        <th className="pb-2 font-black text-center w-12">QTY</th>
                        <th className="pb-2 font-black text-right w-20">PRICE</th>
                        <th className="pb-2 font-black text-right w-24">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {order.items.map((i: CartItem) => (
                        <tr key={i.id} className="text-black text-sm sm:text-[14.5px]">
                          <td className="py-2.5 pr-2 font-bold leading-snug text-black">{i.name}</td>
                          <td className="py-2.5 text-center font-bold text-stone-900">{i.quantity}</td>
                          <td className="py-2.5 text-right font-bold text-stone-900">{i.price.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-black text-black">₹{(i.price * i.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dashed Divider */}
                <div className="border-b border-dashed border-stone-500 my-3.5"></div>

                {/* Subtotal, GST & Total */}
                <div className="py-1 space-y-1">
                  <div className="flex justify-between text-sm sm:text-[14px]">
                    <span className="ml-auto pr-8 font-semibold text-stone-800">Subtotal</span>
                    <span className="w-28 text-right font-bold text-black">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  {settings.gstPercentage > 0 && order.gstAmount > 0 && (
                    <div className="flex justify-between text-sm sm:text-[14px]">
                      <span className="ml-auto pr-8 font-semibold text-stone-800">GST ({settings.gstPercentage}%)</span>
                      <span className="w-28 text-right font-bold text-black">₹{order.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-b-2 border-black my-2.5"></div>
                  <div className="flex justify-between items-baseline text-black pt-1">
                    <span className="ml-auto pr-8 text-lg sm:text-xl font-black tracking-tight text-black">TOTAL</span>
                    <span className="w-36 text-right text-2xl sm:text-[27px] font-black tracking-tight text-black">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-black my-3.5"></div>

                {/* Centered Footer Message (Darker, High Legibility) */}
                <p className="text-center text-xs sm:text-[12px] font-bold uppercase tracking-wider text-stone-900 mt-3 leading-normal">
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
                    <p className="font-bold text-stone-900">{order.date} &bull; {format12HourTime(order.time)}</p>
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
                    <span>{format12HourTime(order.time)}</span>
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
        )}
      </div>

        {/* Modal Controls Sidebar */}
        <div className="bg-white dark:bg-slate-900 p-6 w-full md:w-80 flex flex-col print:hidden border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="mb-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-violet-500' : 'bg-emerald-500'} animate-pulse`}></span>
              <h4 className="font-extrabold text-2xl text-slate-800 dark:text-white">
                {isEditing ? 'Edit Bill' : 'Print Receipt'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6">
              {isEditing 
                ? 'Update order items, customer, table type or payment method.' 
                : 'Vetrivel Unavagam authentic theme matched to your thermal printer paper.'}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Bill Number:</span>
                <span className="font-bold text-slate-800 dark:text-white">{order.billNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Table:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {(isEditing ? editedTableNumber : order.tableNumber) 
                    ? `Table ${isEditing ? editedTableNumber : order.tableNumber} (Type ${String.fromCharCode(64 + ((isEditing ? editedTableNumber : order.tableNumber) || 1))})` 
                    : 'Takeaway'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {isEditing ? editedPaymentType : order.paymentType}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                <span className="font-black text-slate-900 dark:text-white text-base">
                  ₹{(isEditing ? editedTotal : order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveOrder} 
                  disabled={isSaving} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-emerald-600/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
                >
                  <Check size={18}/> {isSaving ? 'Saving Changes...' : 'Save & Update Bill'}
                </button>
                <button 
                  onClick={() => editOrderInPOS(order)} 
                  className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-violet-500/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingCart size={16}/> Edit in Terminal
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 font-bold text-sm py-3 rounded-2xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <X size={16}/> Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handlePrint} 
                  disabled={isPrinting} 
                  className="w-full bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-stone-900/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={18}/> Print Slip
                </button>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-violet-500/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
                >
                  <Edit size={16}/> Edit Bill
                </button>
                <button 
                  onClick={() => editOrderInPOS(order)} 
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <ShoppingCart size={14}/> Re-open in Terminal
                </button>
                <button 
                  onClick={() => setIsReceiptOpen(false)} 
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 font-bold text-sm py-3 rounded-2xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
