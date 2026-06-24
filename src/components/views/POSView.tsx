import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingCart, Trash2, ChevronRight, Utensils, MapPin, Coins, CreditCard, X, Printer } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { MenuItem, CartItem, Order } from '@/types';

export default function POSView() {
  const { menu, cart, addToCart, removeFromCart, clearCart, settings, addOrder } = useAppContext();

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [isCheckout, setIsCheckout] = useState(false);
  
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [bType, setBType] = useState<Order['billType']>('Dine-In'); 
  const [pType, setPType] = useState<Order['paymentType']>('UPI');

  const categories = useMemo(() => ['All', ...Array.from(new Set(menu.map((m: MenuItem) => m.category)))], [menu]);
  const filteredMenu = useMemo(() => menu.filter((m: MenuItem) => m.name.toLowerCase().includes(search.toLowerCase()) && (cat === 'All' || m.category === cat)), [menu, search, cat]);
  
  const totals = useMemo(() => {
    const sub = cart.reduce((s: number, i: CartItem) => s + (i.price * i.quantity), 0);
    const gst = (sub * (settings.gstPercentage || 0)) / 100;
    return { sub, gst, tot: sub + gst };
  }, [cart, settings]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { 
        if(e.key==='F2'){ e.preventDefault(); clearCart(); } 
        if(e.key==='F4'){ e.preventDefault(); if(cart.length>0) setIsCheckout(true); } 
    };
    window.addEventListener('keydown', handleKey); 
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart, clearCart]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault(); if(!cart.length) return;
    addOrder({ customerName: cName||'Walk-in', customerPhone: cPhone||'', billType: bType, paymentType: pType, items: cart, subtotal: totals.sub, gstAmount: totals.gst, total: totals.tot });
    setCName(''); setCPhone(''); setIsCheckout(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full relative animate-pop-in">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl z-10 sticky top-0 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pt-1">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Point of Sale</h2>
              <p className="text-sm font-medium text-slate-500 hidden sm:block">Tap items to build the ticket</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input type="text" placeholder="Search menu..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all soft-shadow" />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 pt-1">
            {categories.map((c: string) => (
              <button key={c} onClick={()=>setCat(c)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all select-none hover-scale ${cat === c ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 border-violet-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-48 lg:pb-0 pt-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 content-start pr-1">
          {filteredMenu.map((item: MenuItem) => {
            const qty = cart.find((c: CartItem) => c.id === item.id)?.quantity || 0;
            return (
              <div key={item.id} onClick={() => !qty && item.isAvailable && addToCart(item)} className={`relative p-5 rounded-3xl transition-all duration-200 flex flex-col justify-between h-44 select-none ${!item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed' : qty > 0 ? 'bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-500 shadow-md shadow-violet-500/10' : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover-scale cursor-pointer soft-shadow'}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${qty ? 'bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{item.category}</span>
                    {!item.isAvailable && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-lg font-bold">Sold Out</span>}
                  </div>
                  <h4 className={`font-bold text-sm md:text-base leading-tight line-clamp-2 ${qty ? 'text-violet-900 dark:text-violet-100' : 'text-slate-800 dark:text-white'}`}>{item.name}</h4>
                </div>
                <div className="flex justify-between items-end">
                  <p className={`text-lg font-extrabold ${qty ? 'text-violet-700 dark:text-violet-400' : 'text-slate-800 dark:text-white'}`}>₹{item.price}</p>
                  {qty > 0 ? (
                    <div className="flex items-center bg-violet-600 text-white rounded-xl shadow-md overflow-hidden" onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>removeFromCart(item.id)} className="w-10 h-10 flex justify-center items-center hover:bg-violet-700 transition-colors"><Minus size={16} strokeWidth={3}/></button>
                      <span className="w-6 text-center font-bold text-sm">{qty}</span>
                      <button onClick={()=>addToCart(item)} className="w-10 h-10 flex justify-center items-center hover:bg-violet-700 transition-colors"><Plus size={16} strokeWidth={3}/></button>
                    </div>
                  ) : item.isAvailable && (
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex justify-center items-center text-slate-400 hover:bg-violet-100 hover:text-violet-600 hover:border-violet-200 transition-colors"><Plus size={18} strokeWidth={3}/></div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredMenu.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 animate-pop-in">
               <Utensils className="mx-auto mb-4 text-violet-500/30" size={64}/>
               <p className="text-xl font-bold text-slate-800 dark:text-white">No dishes found</p>
               <p className="text-slate-500 mt-2 mb-8 max-w-xs mx-auto text-sm font-medium">Your menu is currently empty. Add dishes in Menu Master or load sample data to get started.</p>
               <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                 <button onClick={()=>{}} className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"><Plus size={18}/> Go to Menu Master</button>
                 <button onClick={async () => {
                   // This is a placeholder as addMenuItem is in context but we need to call it multiple times
                   alert('Demo seeding logic should be here');
                 }} className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20">Load Demo Dishes</button>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className={`fixed lg:static inset-x-0 bottom-0 z-30 lg:z-auto w-full lg:w-100 bg-white dark:bg-slate-800 border-t lg:border border-slate-200/60 dark:border-slate-700 lg:rounded-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:soft-shadow flex flex-col transition-transform duration-300 ${cart.length === 0 ? 'translate-y-full lg:translate-y-0' : 'translate-y-0'} max-h-[85vh] lg:h-[calc(100vh-6rem)]`}>
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 lg:hidden"></div>
        <div className="p-5 lg:p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center gap-2.5"><ShoppingCart className="text-violet-500"/> Ticket</h3>
            {cart.length > 0 && <button onClick={clearCart} className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Trash2 size={14}/> Clear</button>}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar min-h-[150px] pr-1">
            {cart.length===0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 opacity-60"><ShoppingCart size={48} className="mb-3 opacity-50"/><p className="font-medium">Cart is empty</p></div>
            ) : cart.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover-scale">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden soft-shadow">
                    <button onClick={()=>removeFromCart(item.id)} className="w-8 h-8 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={()=>addToCart(item)} className="w-8 h-8 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                  </div>
                  <div className="w-12 text-right font-bold text-slate-800 dark:text-white">₹{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex justify-between text-sm font-medium text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.sub.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-medium text-slate-500"><span>Tax ({settings.gstPercentage}%)</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.gst.toFixed(2)}</span></div>
            <div className="flex justify-between items-end pt-3"><span className="text-sm font-bold text-slate-500 mb-1">Total Due</span><span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">₹{totals.tot.toFixed(0)}</span></div>
            
            <button 
              onClick={()=>setIsCheckout(true)} 
              disabled={cart.length===0} 
              className={`w-full mt-5 font-bold text-lg py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-[0.98] 
                ${cart.length === 0 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                  : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20'}`}
            >
              Charge ₹{totals.tot.toFixed(0)} <ChevronRight strokeWidth={3}/>
            </button>
            <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-3 hidden lg:block">Press F4 to Checkout</p>
          </div>
        </div>
      </div>

      {isCheckout && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg sm:rounded-[2.5rem] rounded-t-4xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Checkout</h3>
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1">Amount Due: ₹{totals.tot.toFixed(2)}</p>
              </div>
              <button onClick={()=>setIsCheckout(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scroll">
              <form id="checkout" onSubmit={handleCheckout} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Customer Name</label><input type="text" placeholder="Walk-in" value={cName} onChange={e=>setCName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all soft-shadow"/></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label><input type="tel" placeholder="Optional" value={cPhone} onChange={e=>setCPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all soft-shadow"/></div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Order Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Dine-In', 'Parcel'] as const).map((t) => (
                      <div key={t} onClick={()=>setBType(t)} className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all font-bold ${bType === t ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>{t}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['UPI', 'Cash', 'Card'] as const).map((t) => (
                      <div key={t} onClick={()=>setPType(t)} className={`p-3 rounded-2xl border-2 text-center cursor-pointer flex flex-col items-center gap-2 font-bold text-sm transition-all ${pType === t ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                        {t==='UPI'&&<MapPin size={20}/>} {t==='Cash'&&<Coins size={20}/>} {t==='Card'&&<CreditCard size={20}/>}
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-[2.5rem]">
              <button type="submit" form="checkout" className="w-full bg-slate-900 dark:bg-violet-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-2 transform active:scale-[0.98] transition-transform hover:bg-slate-800 dark:hover:bg-violet-700">
                <Printer size={20}/> Print & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
