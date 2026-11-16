'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, ShoppingBag, History, Utensils, Settings as SettingsIcon, 
  LogOut, Sun, Moon, Plus, Minus, Search, Trash2, Printer, Download, 
  Edit, Check, X, Lock, User as UserIcon, Coins, IndianRupee,
  ShoppingCart, ChevronRight, PlusCircle, Menu as MenuIcon,
  MapPin, CreditCard, Activity, Star, Eye, EyeOff, Loader2, LayoutGrid
} from 'lucide-react';

import { supabase } from '@/utils/supabaseClient';
import { uploadImage } from '@/utils/cloudinary';
import { createPortal } from 'react-dom';
import { AppContext, useAppContext } from '@/contexts/AppContext';
import { I18nProvider, useI18n } from '@/contexts/I18nContext';

// ==========================================
// 1. TYPES & INTERFACES (imported from @/types)
// ==========================================
import type {
  MenuItem, CartItem, Order, Settings, User, Toast,
  OrderData, StatColor, Stat, ChartData, TopSeller, AppContextType,
  TableSession
} from '@/types';

import { colorClasses } from '@/utils/constants';

// ==========================================
// 2. CONTEXT & INITIAL DATA
// ==========================================
const getPastDate = (daysAgo: number) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split('T')[0];
};

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
const TABLES = [1, 2, 3, 4, 5, 6] as const;

const makeInitialSessions = (): Record<number, TableSession> =>
  Object.fromEntries([0, ...TABLES].map(n => [n, { tableNumber: n, cart: [], status: 'empty' as const }]));

const getCategoryGradient = (cat: string) => {
  const hash = cat.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-rose-400 to-orange-300',
    'from-blue-400 to-emerald-300',
    'from-amber-300 to-orange-400',
    'from-violet-400 to-fuchsia-300',
    'from-cyan-400 to-blue-400',
    'from-pink-400 to-rose-400'
  ];
  return gradients[hash % gradients.length];
};

function SafeMenuImage({ 
  src, 
  alt, 
  category, 
  isBackground = false 
}: { 
  src?: string; 
  alt: string; 
  category: string; 
  isBackground?: boolean; 
}) {
  const [hasError, setHasError] = useState(false);
  const isValidUrl = Boolean(src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')));

  if (!isValidUrl || hasError) {
    if (isBackground) {
      return <div className={`absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-10 bg-linear-to-br ${getCategoryGradient(category)}`} />;
    }
    return (
      <div className={`w-full h-full pointer-events-none bg-linear-to-br ${getCategoryGradient(category)} flex items-center justify-center`}>
        <span className="font-black text-4xl text-white/50 tracking-tighter uppercase mix-blend-overlay">
          {alt.substring(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <Image
      unoptimized
      src={src!}
      alt={alt}
      fill
      style={{ objectFit: 'cover' }}
      className={isBackground ? "pointer-events-none opacity-10 dark:opacity-20" : "pointer-events-none object-cover group-hover:scale-110 transition-transform duration-500"}
      onError={() => setHasError(true)}
    />
  );
}

function TableLogo({ 
  status = 'empty', 
  tableNumber, 
  size = 'md' 
}: { 
  status?: 'empty' | 'occupied' | 'ready-to-bill'; 
  tableNumber: number; 
  size?: 'sm' | 'md' | 'lg'; 
}) {
  const isOccupied = status === 'occupied' || status === 'ready-to-bill';
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-13 h-13',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeMap[size]} shrink-0 flex items-center justify-center rounded-2xl transition-all ${
      isOccupied 
        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700/80 shadow-md shadow-amber-500/10' 
        : 'bg-violet-50 dark:bg-slate-800 text-violet-600 dark:text-violet-400 border-2 border-violet-100 dark:border-slate-700'
    }`}>
      <svg viewBox="0 0 48 48" className="w-[82%] h-[82%]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Top chair */}
        <rect x="18" y="4" width="12" height="5" rx="2" strokeWidth="2.5" fill={isOccupied ? "currentColor" : "none"} opacity={isOccupied ? "0.35" : "0.9"} />
        {/* Bottom chair */}
        <rect x="18" y="39" width="12" height="5" rx="2" strokeWidth="2.5" fill={isOccupied ? "currentColor" : "none"} opacity={isOccupied ? "0.35" : "0.9"} />
        {/* Left chair */}
        <rect x="4" y="18" width="5" height="12" rx="2" strokeWidth="2.5" fill={isOccupied ? "currentColor" : "none"} opacity={isOccupied ? "0.35" : "0.9"} />
        {/* Right chair */}
        <rect x="39" y="18" width="5" height="12" rx="2" strokeWidth="2.5" fill={isOccupied ? "currentColor" : "none"} opacity={isOccupied ? "0.35" : "0.9"} />
        {/* Dining table surface */}
        <rect x="12" y="12" width="24" height="24" rx="6" strokeWidth="2.5" fill={isOccupied ? "currentColor" : "none"} opacity={isOccupied ? "0.15" : "0.9"} />
        {/* Center table place plate */}
        <circle cx="24" cy="24" r="5" strokeWidth="2" fill="currentColor" opacity={isOccupied ? "0.9" : "0.2"} />
      </svg>
      {/* Table number inside table badge */}
      <span className={`absolute font-black leading-none ${size === 'sm' ? 'text-[9px]' : 'text-xs'} ${isOccupied ? 'text-white' : 'text-violet-700 dark:text-violet-300'}`}>
        {tableNumber}
      </span>
    </div>
  );
}

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    hotelName: 'VETRIVEL UNAVAGAM',
    address: '87/92 VCV Road, RS Puram, Coimbatore - 641002',
    phone: '+91 98429 99931',
    gstNumber: '33AAAAA1111A1Z1',
    gstPercentage: 5,
    footerMessage: 'NO BRANCHES • THANK YOU FOR CHOOSING VETRIVEL UNAVAGAM',
    printFormat: 'thermal',
    billCounter: 1004,
  });
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'demo-pos-004',
      billNumber: 'POS-004',
      customerName: 'Walk-in',
      customerPhone: '+91 98429 99931',
      billType: 'Dine-In',
      paymentType: 'UPI',
      tableNumber: 1,
      date: '2026-10-13',
      time: '09:46 PM',
      items: [
        { id: 'item-1', name: 'Kothu Chapathi', price: 70, quantity: 1, category: 'Dinner', isAvailable: true },
        { id: 'item-2', name: 'Paneer Butter Masala', price: 120, quantity: 1, category: 'Gravy', isAvailable: true },
        { id: 'item-3', name: 'Malabar Parotta', price: 25, quantity: 2, category: 'Dinner', isAvailable: true },
        { id: 'item-4', name: 'Sweet Lassi', price: 40, quantity: 1, category: 'Beverages', isAvailable: true },
      ],
      subtotal: 280,
      gstAmount: 14,
      total: 294,
    }
  ]);
  const [tableSessions, setTableSessions] = useState<Record<number, TableSession>>(makeInitialSessions);
  const [activeTable, _setActiveTable] = useState<number | null>(null);

  // Derived: the active cart is whichever table is selected (or table 0 for Takeaway/Counter)
  const cart = tableSessions[activeTable ?? 0]?.cart ?? [];

  const [activeTab, _setActiveTab] = useState('tables');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);

  const setActiveTable = useCallback((n: number | null) => {
    _setActiveTable(n);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    const savedTheme = localStorage.getItem('shbs_theme');
    if (savedTheme) setTheme(savedTheme);
    
    try {
        const savedUser = localStorage.getItem('shbs_user');
        if (savedUser) setUser(JSON.parse(savedUser));
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          { data: menuData, error: menuError },
          { data: ordersData, error: ordersError },
          { data: settingsData, error: settingsError },
        ] = await Promise.all([
          supabase.from('menu').select('*'),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('settings').select('*').single(),
        ]);

        if (menuError) {
          console.error('Error fetching menu:', menuError);
          showToast('Could not load menu from database', 'error');
        } else {
          setMenu(menuData as MenuItem[]);
        }

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          showToast('Could not load orders from database', 'error');
        } else {
          setOrders(ordersData as Order[]);
        }

        if (settingsError) {
          console.error('Error fetching settings:', settingsError);
          showToast('Could not load settings — using defaults', 'warning');
        } else if (settingsData) {
          setSettings(settingsData as Settings);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [showToast]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persistence Effects
  useEffect(() => { 
    if (!isMounted) return;
    localStorage.setItem('shbs_theme', theme); 
    document.documentElement.classList.toggle('dark', theme === 'dark'); 
  }, [theme, isMounted]);

  useEffect(() => { 
    if (!isMounted) return;
    if (user) {
      localStorage.setItem('shbs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shbs_user');
    }
  }, [user, isMounted]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), []);

  const login = useCallback((u: string, p: string) => {
      if (u === 'admin' && p === 'admin123') { 
          setUser({ username: u, role: 'Admin' }); 
          showToast('Welcome back, Admin!', 'success'); 
          return true; 
      }
      showToast('Invalid username or password. Please try again.', 'error'); 
      return false;
  }, [showToast]);

  const logout = useCallback(() => { 
      setUser(null); 
      showToast('Logged out successfully', 'info'); 
  }, [showToast]);

  const updateSettings = useCallback(async (ns: Settings) => {
    // Exclude id and billCounter from the update payload to avoid PK conflicts
    const { id, billCounter: _bc, ...updatePayload } = ns;
    const { error } = await supabase.from('settings').update(updatePayload).eq('id', id);
    if (error) {
      showToast('Error updating settings', 'error');
      console.error(error);
    } else {
      setSettings(ns);
      showToast('Settings saved successfully', 'success');
    }
  }, [showToast]);

  // Bug #10: fetchMenu for re-fetch after CRUD
  const fetchMenu = useCallback(async () => {
    const { data, error } = await supabase.from('menu').select('*');
    if (!error && data) setMenu(data as MenuItem[]);
  }, []);

  // Bug #3: No internal showToast — throws on error so callers (UI) control toasts
  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    const { data, error } = await supabase.from('menu').insert([item]).select();
    if (error) { console.error(error); throw new Error(error.message); }
    if (data) setMenu(p => [...p, data[0] as MenuItem]);
  }, []);

  const updateMenuItem = useCallback(async (item: MenuItem) => {
    const { error } = await supabase.from('menu').update(item).eq('id', item.id);
    if (error) { console.error(error); throw new Error(error.message); }
    setMenu(p => p.map(i => i.id === item.id ? item : i));
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('menu').delete().eq('id', id);
    if (error) { console.error(error); throw new Error(error.message); }
    setMenu(p => p.filter(i => i.id !== id));
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const newStatus = !item.isAvailable;
    const { error } = await supabase.from('menu').update({ isAvailable: newStatus }).eq('id', id);
    if (error) {
      showToast('Error updating availability', 'error');
    } else {
      setMenu(p => p.map(i => i.id === id ? { ...i, isAvailable: newStatus } : i));
    }
  }, [menu, showToast]);

  const addOrder = useCallback(async (orderData: OrderData, skipPrint = false) => {
      const today = new Date().toISOString().split('T')[0];
      let currentCounter = settings.billCounter;

      // Reset bill counter to 1 if it is a new day
      if (orders.length > 0 && orders[0].date !== today) {
        currentCounter = 1;
      } else if (orders.length === 0) {
        currentCounter = 1;
      }

      const billNo = `POS-${currentCounter}`;
      const finalOrder: Omit<Order, 'id'> = { billNumber: billNo, date: today, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), ...orderData };
      
      // Clean insert payload so undefined keys are never sent in PostgREST query
      const insertPayload: Record<string, any> = {};
      for (const [key, val] of Object.entries(finalOrder)) {
        if (val !== undefined && val !== null) {
          insertPayload[key] = val;
        }
      }

      let { data, error } = await supabase.from('orders').insert([insertPayload]).select();

      // If Supabase returned error 400 (e.g. column 'tableNumber' does not exist in Postgres DB table 'orders'):
      if (error && insertPayload.tableNumber !== undefined) {
        console.warn('Orders table missing tableNumber column in Supabase, retrying without it:', error);
        const { tableNumber: _ignored, ...payloadWithoutTable } = insertPayload;
        
        // Append table number to customerName if it was a table order so cashier doesn't lose the table reference:
        if (orderData.tableNumber && !payloadWithoutTable.customerName?.includes('Table')) {
          payloadWithoutTable.customerName = `${payloadWithoutTable.customerName || 'Walk-in'} (Table ${orderData.tableNumber})`;
        }
        
        const retry = await supabase.from('orders').insert([payloadWithoutTable]).select();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        showToast('Error creating order: ' + (error.message || 'Database error'), 'error');
        console.error('Order creation error:', error);
      } else if (data) {
        const newOrder = { ...(data[0] as Order), tableNumber: orderData.tableNumber };
        const newCounter = currentCounter + 1;
        await supabase.from('settings').update({ billCounter: newCounter }).eq('id', settings.id);
        setSettings(prev => ({ ...prev, billCounter: newCounter }));
        setOrders(p => [newOrder, ...p]);
        
        // Reset the table session or counter session
        const billedTable = orderData.tableNumber ?? 0;
        setTableSessions(prev => ({
          ...prev,
          [billedTable]: { tableNumber: billedTable, cart: [], status: 'empty' },
        }));
        if (activeTable === orderData.tableNumber) {
          _setActiveTable(null);
        }

        if (!skipPrint) {
          setCurrentReceiptOrder(newOrder); 
          setIsReceiptOpen(true); 
        }
        showToast(`Bill ${billNo} Generated`, 'success');
      }
  }, [settings, showToast, orders, activeTable]);

  const updateOrder = useCallback(async (updatedOrder: Order) => {
    const { id, ...orderData } = updatedOrder;
    const updatePayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(orderData)) {
      if (val !== undefined && val !== null) {
        updatePayload[key] = val;
      }
    }

    let { error } = await supabase.from('orders').update(updatePayload).eq('id', id);
    if (error && updatePayload.tableNumber !== undefined) {
      const { tableNumber: _ignored, ...payloadWithoutTable } = updatePayload;
      const retry = await supabase.from('orders').update(payloadWithoutTable).eq('id', id);
      error = retry.error;
    }

    if (error) {
      showToast('Error updating bill: ' + (error.message || 'Database error'), 'error');
      console.error('Order update error:', error);
    } else {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setCurrentReceiptOrder(prev => (prev && prev.id === updatedOrder.id ? updatedOrder : prev));
      showToast(`Bill ${updatedOrder.billNumber} Updated Successfully`, 'success');
    }
  }, [showToast]);

  const editOrderInPOS = useCallback((orderToEdit: Order) => {
    const targetTable = orderToEdit.tableNumber ?? 0;
    _setActiveTable(orderToEdit.tableNumber ?? null);
    setTableSessions(prev => ({
      ...prev,
      [targetTable]: {
        tableNumber: targetTable,
        cart: orderToEdit.items.map(item => ({ ...item })),
        status: 'occupied',
        openedAt: new Date().toISOString(),
      }
    }));
    setIsReceiptOpen(false);
    _setActiveTab('pos');
    showToast(`Order ${orderToEdit.billNumber} loaded in Terminal for editing`, 'info');
  }, [showToast]);

  // ---- Table-aware cart helpers ----
  const updateTableCart = useCallback((updater: (cart: CartItem[]) => CartItem[]) => {
    setTableSessions(sessions => {
      const targetTable = activeTable ?? 0;
      const session = sessions[targetTable] || { tableNumber: targetTable, cart: [], status: 'empty' as const };
      const newCart = updater(session.cart);
      const status = newCart.length > 0 ? 'occupied' : 'empty';
      const openedAt = (status === 'occupied' && !session.openedAt)
        ? new Date().toISOString()
        : (status === 'empty' ? undefined : session.openedAt);
      return { ...sessions, [targetTable]: { ...session, cart: newCart, status, openedAt } };
    });
  }, [activeTable]);

  const lastAddRef = useRef<{ id: string; time: number } | null>(null);
  const addToCart = useCallback((item: MenuItem) => {
    const now = Date.now();
    if (lastAddRef.current && lastAddRef.current.id === item.id && (now - lastAddRef.current.time) < 280) {
      return;
    }
    lastAddRef.current = { id: item.id, time: now };
    updateTableCart(p => {
      const ext = p.find(i => i.id === item.id);
      return ext ? p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...p, { ...item, quantity: 1 }];
    });
  }, [updateTableCart]);

  const removeFromCart = useCallback((id: string) => {
    updateTableCart(p => {
      const ext = p.find(i => i.id === id);
      return (ext && ext.quantity > 1) ? p.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) : p.filter(i => i.id !== id);
    });
  }, [updateTableCart]);

  const clearCart = useCallback(() => { 
    if (window.confirm("Are you sure you want to clear this order?")) {
      updateTableCart(() => []);
      showToast('Order Cleared', 'warning'); 
    }
  }, [showToast, updateTableCart]);

  const updateCartItemPrice = useCallback((id: string, newPrice: number) => {
    updateTableCart(p => p.map(i => i.id === id ? { ...i, price: Math.max(0, newPrice) } : i));
  }, [updateTableCart]);

  const addCustomCartItem = useCallback((name: string, price: number) => {
    const customItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Custom Item',
      price: Math.max(0, price),
      category: 'Custom',
      isAvailable: true,
    };
    addToCart(customItem);
  }, [addToCart]);

  const setActiveTab = useCallback((t: string) => {
      _setActiveTab(t);
      setIsMobileMenuOpen(false);
  }, []);

  const value: AppContextType = useMemo(() => ({
    theme, toggleTheme,
    user, login, logout,
    settings, updateSettings,
    menu, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
    orders, addOrder, updateOrder, editOrderInPOS,
    cart, addToCart, removeFromCart, clearCart, updateCartItemPrice, addCustomCartItem,
    toasts, showToast, removeToast, activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen, 
    currentReceiptOrder, setCurrentReceiptOrder, 
    isReceiptOpen, setIsReceiptOpen,
    tableSessions, activeTable, setActiveTable,
  }), [
    theme, toggleTheme, user, login, logout, settings, updateSettings, menu, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, 
    toggleAvailability, orders, addOrder, updateOrder, editOrderInPOS, cart, addToCart, removeFromCart, clearCart, updateCartItemPrice, addCustomCartItem, toasts, showToast, removeToast, activeTab, setActiveTab, 
    isMobileMenuOpen, currentReceiptOrder, isReceiptOpen, tableSessions, activeTable, setActiveTable
  ]);

  // Avoid hydration mismatch; show spinner while loading data from Supabase
  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="bg-linear-to-br from-violet-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
          <Activity size={32} />
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading Hotel Vetri Vel…</p>
      </div>
    );
  }

  return (
    <I18nProvider>
      <AppContext.Provider value={value}>
      <div className={`h-screen max-h-screen overflow-hidden flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
        {user ? (
          <div className="flex-1 flex flex-col lg:flex-row h-full max-h-screen min-h-0 overflow-hidden print:hidden">
            <MobileHeader />
            <Sidebar />
            <main className="flex-1 print:overflow-visible custom-scroll h-full max-h-screen overflow-hidden flex flex-col min-h-0">
              <div className={`p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto ${activeTab === 'pos' ? 'flex-1 min-h-0 flex flex-col h-full overflow-hidden' : 'flex-1 min-h-0 overflow-y-auto custom-scroll pb-24 lg:pb-8'}`}>
                {activeTab === 'tables' && <TablesView />}
                {activeTab === 'pos' && <POSView />}
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'orders' && <OrdersView />}
                {activeTab === 'menu' && <MenuView />}
                {activeTab === 'settings' && <SettingsView />}
              </div>
            </main>
          </div>
        ) : <LoginView />}
        
        <ToastContainer />
        {isReceiptOpen && <ReceiptPreviewModal />}
      </div>
      </AppContext.Provider>
    </I18nProvider>
  );
}

// ==========================================
// 4. LAYOUT COMPONENTS
// ==========================================
function MobileHeader() {
  const { theme, toggleTheme, user, logout, isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();
  const { language, setLanguage, t } = useI18n();
  const [avatarOpen, setAvatarOpen] = useState(false);
  
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-40">
      {avatarOpen && <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)}/>}
      <div className="flex items-center gap-3">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Activity size={22} /> <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">Hotel Vetri Vel</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:text-violet-600 dark:hover:text-violet-400">
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="fr">FR</option>
          <option value="ta">TA</option>
        </select>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative z-50">
          <button onClick={() => setAvatarOpen(v => !v)} className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-sm border border-violet-200 dark:border-violet-800">
            {user?.username?.charAt(0).toUpperCase()}
          </button>
          {avatarOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2">
              <p className="px-4 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('header.signedin')}</p>
              <p className="px-4 pb-3 text-sm font-bold text-slate-800 dark:text-white capitalize">{user?.username}</p>
              <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2"/>
              <button onClick={() => { logout(); setAvatarOpen(false); }} className="w-full text-left px-4 py-2.5 mt-1 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2">
                <LogOut size={14}/> {t('header.signout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const context = useAppContext();
  const { activeTab, setActiveTab, logout, theme, toggleTheme, user, isMobileMenuOpen, setIsMobileMenuOpen } = context;
  const { language, setLanguage, t } = useI18n();
  
  const navs = [
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    { id: 'pos', label: t('nav.terminal'), icon: ShoppingBag },
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('nav.transactions'), icon: History },
    { id: 'menu', label: t('nav.menu'), icon: Utensils },
    { id: 'settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 h-full max-h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out print:hidden overflow-hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 hidden lg:flex items-center gap-3 shrink-0">
          <div className="bg-linear-to-br from-violet-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-md"><Activity size={24} /></div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800 dark:text-white leading-none tracking-tight">Hotel Vetri Vel</h1>
            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-widest mt-1">Pro Edition</p>
          </div>
        </div>

        <nav className="flex-1 min-h-0 px-4 py-4 lg:py-2 space-y-1.5 overflow-y-auto custom-scroll">
          {navs.map((item) => {
            const Icon = item.icon; const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${isActive ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-100/50 dark:border-violet-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'}`}>
                <Icon size={20} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'opacity-70'} /> <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shrink-0">
          <div className="items-center justify-between mb-4 hidden lg:flex">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold border border-violet-200 dark:border-violet-800">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{user?.username}</p></div>
            </div>
            
            <div className="flex gap-1.5 ml-2 mt-2 lg:mt-0">
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-transparent text-sm font-bold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 outline-none cursor-pointer px-1">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="ta">TA</option>
              </select>
              <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 transition-all hover:-translate-y-0.5 hover:shadow-sm">
            <LogOut size={16} /> <span>{t('header.signout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  const getToastInfo = (type: Toast['type']) => {
    switch (type) {
        case 'success': return { icon: <Check size={16} />, className: 'border-emerald-200 dark:border-emerald-800/50 border-l-4 border-l-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
        case 'warning': return { icon: <Trash2 size={16} />, className: 'border-amber-200 dark:border-amber-800/50 border-l-4 border-l-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
        case 'error': return { icon: <X size={16} />, className: 'border-rose-200 dark:border-rose-800/50 border-l-4 border-l-rose-500', iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' };
        default: return { icon: <Check size={16} />, className: 'border-slate-200 dark:border-slate-700', iconBg: 'bg-slate-100 dark:bg-slate-700' };
    }
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 md:px-0">
      {toasts.map((t: Toast) => {
        const { icon, className, iconBg } = getToastInfo(t.type);
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl soft-shadow animate-slide-up pointer-events-auto backdrop-blur-md text-sm font-semibold border bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white ${className}`}>
            <div className={`p-1 rounded-full shrink-0 ${iconBg}`}>{icon}</div>
            <div className="flex-1 text-sm">{t.message}</div>
            <button onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Dismiss"><X size={13}/></button>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 5. VIEWS
// ==========================================
function LoginView() {
  const { login } = useAppContext();
  const { t } = useI18n();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{u?: string; p?: string}>({});

  const validate = () => {
    const e: {u?: string; p?: string} = {};
    if (!u.trim()) e.u = 'Required';
    if (!p.trim()) e.p = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await login(u, p);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-violet-400/30 dark:bg-violet-900/30 rounded-full blur-[120px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/30 dark:bg-indigo-900/30 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      
      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 md:p-12 border border-white/60 dark:border-slate-700/50 relative z-10 animate-pop-in">
        
        {/* Header Section */}
        <div className="text-center mb-10 transform transition-all duration-500 hover:scale-105">
          <div className="inline-flex bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-4 rounded-[1.25rem] shadow-xl shadow-violet-500/30 mb-6 relative">
            <div className="absolute inset-0 bg-white/20 rounded-[1.25rem] animate-ping opacity-20"></div>
            <Activity size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('login.title')}</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2 tracking-wide uppercase">{t('login.subtitle')}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username Input */}
          <div className="group">
            <div className="relative transform transition-all duration-300 hover:-translate-y-1">
              <UserIcon className="absolute left-4 top-[18px] text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" size={20} />
              <input
                id="login-username"
                type="text"
                placeholder={t('login.username')}
                autoComplete="username"
                value={u}
                onChange={e => { setU(e.target.value); setErrors(prev => ({...prev, u: undefined})); }}
                className={`w-full bg-white/90 dark:bg-slate-800/80 border ${errors.u ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200/80 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/20'} focus:ring-4 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-semibold outline-none text-slate-800 dark:text-white transition-all shadow-sm placeholder:font-medium placeholder:text-slate-400`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="group">
            <div className="relative transform transition-all duration-300 hover:-translate-y-1">
              <Lock className="absolute left-4 top-[18px] text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" size={20} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder={t('login.password')}
                autoComplete="current-password"
                value={p}
                onChange={e => { setP(e.target.value); setErrors(prev => ({...prev, p: undefined})); }}
                className={`w-full bg-white/90 dark:bg-slate-800/80 border ${errors.p ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200/80 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/20'} focus:ring-4 rounded-2xl py-4 pl-12 pr-12 text-[15px] font-semibold outline-none text-slate-800 dark:text-white transition-all shadow-sm placeholder:font-medium placeholder:text-slate-400`}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-[18px] text-slate-400 hover:text-violet-500 transition-colors">
                {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className={`w-full mt-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[15px] py-4.5 rounded-2xl shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.97] hover:-translate-y-1 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'animate-pulse-glow'}`}
          >
            {isLoading
              ? <><Loader2 size={20} className="animate-spin"/> {t('login.signingin')}</>
              : <>{t('login.signin')} <ChevronRight size={20} className="ml-1" /></>}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a href="/forgot-password" className="text-sm font-semibold text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all hover:underline underline-offset-4">
            {t('login.forgot')}
          </a>
        </div>
      </div>
    </div>
  );
}

function POSView() {
  const context = useAppContext();
  const { menu, cart, addToCart, removeFromCart, clearCart, updateCartItemPrice, addCustomCartItem, settings, addOrder, setActiveTab, showToast, addMenuItem, activeTable, setActiveTable, tableSessions } = context;
  const { t } = useI18n();

  const [search, setSearch] = useState(''); const [cat, setCat] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  
  // Custom manual price editing in terminal
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const [cName, setCName] = useState(''); const [cPhone, setCPhone] = useState('');
  const [bType, setBType] = useState<Order['billType']>('Dine-In'); 
  const [pType, setPType] = useState<Order['paymentType']>('UPI');

  const activeMenu = useMemo(() => menu.filter((m: MenuItem) => !m.isDeleted), [menu]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(activeMenu.map((m: MenuItem) => m.category)))], [activeMenu]);
  const filteredMenu = useMemo(() => activeMenu.filter((m: MenuItem) => m.name.toLowerCase().includes(search.toLowerCase()) && (cat === 'All' || m.category === cat)), [activeMenu, search, cat]);
  
  const totals = useMemo(() => {
    const sub = cart.reduce((s: number, i: CartItem) => s + (i.price * i.quantity), 0);
    const gst = 0;
    return { sub, gst, tot: sub };
  }, [cart, settings]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { 
        if(e.key==='F2'){ e.preventDefault(); clearCart(); } 
        if(e.key==='F4'){ e.preventDefault(); if(cart.length>0) setIsCheckout(true); } 
    };
    window.addEventListener('keydown', handleKey); 
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart, clearCart]);

  const handleCheckout = (e: React.FormEvent, skipPrint = false) => {
    e.preventDefault(); if(!cart.length) return;
    addOrder({ customerName: cName||'Walk-in', customerPhone: cPhone||'', billType: bType, paymentType: pType, tableNumber: activeTable ?? undefined, items: cart, subtotal: totals.sub, gstAmount: totals.gst, total: totals.tot }, skipPrint);
    setCName(''); setCPhone(''); setIsCheckout(false);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[1fr_330px] lg:grid-cols-[1fr_360px] gap-6 flex-1 min-h-0 h-full relative animate-pop-in">
      {/* Left Column: Menu Catalog */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
        <div className="bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl z-20 shrink-0 pb-3">
          <div className="flex flex-col xl:flex-row justify-between gap-3 mb-3 pt-1">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('pos.title')}</h2>
                {/* Table Quick Switcher Bar */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700 overflow-x-auto hide-scrollbar max-w-full">
                  <button 
                    type="button"
                    onClick={() => setActiveTable(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      activeTable === null 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    <ShoppingBag size={13} />
                    <span>Takeaway</span>
                    {tableSessions[0]?.cart.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                  {TABLES.map(tNo => {
                    const s = tableSessions[tNo];
                    const count = s?.cart.reduce((a, b) => a + b.quantity, 0) || 0;
                    return (
                      <button
                        key={tNo}
                        type="button"
                        onClick={() => setActiveTable(tNo)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                          activeTable === tNo
                            ? 'bg-violet-600 text-white shadow-sm'
                            : count > 0
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>T{tNo} ({String.fromCharCode(64 + tNo)})</span>
                        {count > 0 && (
                          <span className={`text-[10px] px-1 rounded-md ${activeTable === tNo ? 'bg-white/20 text-white' : 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('tables')}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1 ml-0.5"
                    title="View Floor Plan"
                  >
                    <LayoutGrid size={13} />
                    <span>Tables</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative w-full xl:w-72 shrink-0">
              <Search className="absolute left-4 top-3 text-slate-400" size={18} />
              <input type="text" placeholder={t('pos.search')} value={search} onChange={e=>{setSearch(e.target.value); if(e.target.value) setCat('All');}} onFocus={()=>setIsSearchFocused(true)} onBlur={()=>setIsSearchFocused(false)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all soft-shadow" />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((c: string) => (
              <button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all select-none hover-scale ${cat === c ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 border-violet-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pr-1 pb-24 md:pb-4 pt-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 md:gap-4 content-start">
          {filteredMenu.map((item: MenuItem) => {
            const qty = cart.find((c: CartItem) => c.id === item.id)?.quantity || 0;
            return (
              <div 
                key={item.id} 
                onClick={() => {
                  if (qty === 0 && item.isAvailable) {
                    addToCart(item);
                  }
                }} 
                className={`relative p-4 rounded-3xl transition-all duration-200 flex flex-col justify-between h-40 select-none overflow-hidden ${
                  !item.isAvailable 
                    ? 'opacity-50 grayscale cursor-not-allowed' 
                    : qty > 0 
                      ? 'bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-500 shadow-md shadow-violet-500/10' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover-scale cursor-pointer soft-shadow'
                }`}
              >
                <SafeMenuImage src={item.imageUrl} alt={item.name} category={item.category} isBackground />
                <div className="relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${qty ? 'bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{item.category}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'} ring-4 ${item.isVeg ? 'ring-emerald-500/10' : 'ring-rose-500/10'}`}></div>
                      {!item.isAvailable && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-lg font-bold uppercase tracking-tighter">Sold Out</span>}
                    </div>
                  </div>
                  <h4 className={`font-bold text-sm md:text-base leading-snug line-clamp-2 ${qty ? 'text-violet-900 dark:text-violet-100' : 'text-slate-800 dark:text-white'}`}>{item.name}</h4>
                </div>
                <div className="relative flex justify-between items-end mt-1">
                  <p className={`text-base md:text-lg font-black ${qty ? 'text-violet-700 dark:text-violet-400' : 'text-slate-800 dark:text-white'}`}>₹{item.price}</p>
                  {qty > 0 ? (
                    <div className="flex items-center bg-violet-600 text-white rounded-xl shadow-md overflow-hidden" onClick={e=>e.stopPropagation()}>
                      <button type="button" onClick={(e)=>{e.stopPropagation(); removeFromCart(item.id);}} className="w-9 h-9 flex justify-center items-center hover:bg-violet-700 active:bg-violet-800 transition-colors"><Minus size={15} strokeWidth={3}/></button>
                      <span className="w-6 text-center font-bold text-sm select-none">{qty}</span>
                      <button type="button" onClick={(e)=>{e.stopPropagation(); addToCart(item);}} className="w-9 h-9 flex justify-center items-center hover:bg-violet-700 active:bg-violet-800 transition-colors"><Plus size={15} strokeWidth={3}/></button>
                    </div>
                  ) : item.isAvailable && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex justify-center items-center text-slate-500 dark:text-slate-300 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3}/>
                    </button>
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
                 <button onClick={()=>setActiveTab('menu')} className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"><Plus size={18}/> Go to Menu Master</button>
                 <button onClick={async () => {
                   const demoItems = [
                     { name: 'Butter Chicken', price: 350, category: 'Main Course', isAvailable: true, isVeg: false, imageUrl: '', description: 'Tender chicken in creamy tomato gravy' },
                     { name: 'Paneer Tikka', price: 280, category: 'Starters', isAvailable: true, isVeg: true, imageUrl: '', description: 'Grilled cottage cheese with spices' },
                     { name: 'Garlic Naan', price: 60, category: 'Breads', isAvailable: true, isVeg: true, imageUrl: '', description: 'Soft bread with garlic butter' },
                     { name: 'Jeera Rice', price: 180, category: 'Rice', isAvailable: true, isVeg: true, imageUrl: '', description: 'Basmati rice with cumin' },
                     { name: 'Mango Lassi', price: 120, category: 'Beverages', isAvailable: true, isVeg: true, imageUrl: '', description: 'Chilled mango yogurt drink' },
                     { name: 'Gulab Jamun', price: 90, category: 'Desserts', isAvailable: true, isVeg: true, imageUrl: '', description: 'Soft milk solids in sugar syrup' },
                   ];
                   showToast('Seeding demo data...', 'info');
                   let successCount = 0;
                   for (const item of demoItems) {
                     try { await addMenuItem(item); successCount++; } catch { /* continue */ }
                   }
                   if (successCount > 0) {
                     showToast(`${successCount} demo dishes loaded!`, 'success');
                   } else {
                     showToast('Could not load demo dishes. Check Supabase connection.', 'error');
                   }
                 }} className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20">Load Demo Dishes</button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE: Compact floating cart bar ===== */}
      {cart.length > 0 && !isTicketOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 md:hidden p-3 animate-slide-up">
          <button
            onClick={() => setIsTicketOpen(true)}
            className="w-full flex items-center justify-between bg-violet-600 hover:bg-violet-700 text-white px-5 py-4 rounded-2xl shadow-xl shadow-violet-500/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-violet-600 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {cart.reduce((s: number, i: CartItem) => s + i.quantity, 0)}
                </span>
              </div>
              <span className="font-bold text-sm">{activeTable ? `Table ${activeTable}` : 'Takeaway'} Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">₹{totals.tot.toFixed(0)}</span>
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </button>
        </div>
      )}

      {/* ===== MOBILE: Full ticket overlay ===== */}
      {isTicketOpen && createPortal(
        <div className="fixed inset-0 z-[150] md:hidden" onClick={() => setIsTicketOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3" />
            <div className="p-5 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center gap-2.5">
                  <ShoppingCart className="text-violet-500"/> {activeTable ? `Table ${activeTable} Order` : t('pos.current_order')}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowCustomModal(true)} 
                    className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Add custom item with manual specific price"
                  >
                    <PlusCircle size={13}/> Custom ₹
                  </button>
                  {cart.length > 0 && <button onClick={clearCart} className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Trash2 size={14}/> {t('pos.clear')}</button>}
                  <button onClick={() => setIsTicketOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><X size={18}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pr-1 min-h-0">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                      {editingPriceItemId === item.id ? (
                        <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                          <span className="text-xs font-bold text-slate-400">₹</span>
                          <input 
                            type="number"
                            min="0"
                            step="any"
                            autoFocus
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseFloat(tempPrice);
                                if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                                setEditingPriceItemId(null);
                              } else if (e.key === 'Escape') {
                                setEditingPriceItemId(null);
                              }
                            }}
                            onBlur={() => {
                              const val = parseFloat(tempPrice);
                              if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                              setEditingPriceItemId(null);
                            }}
                            className="w-16 bg-white dark:bg-slate-700 border-2 border-violet-500 rounded-lg px-1.5 py-0.5 text-xs font-black text-slate-900 dark:text-white outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const val = parseFloat(tempPrice);
                              if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                              setEditingPriceItemId(null);
                            }}
                            className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check size={11}/>
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingPriceItemId(item.id);
                            setTempPrice(String(item.price));
                          }}
                          title="Click to edit manual price"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:hover:bg-violet-900/60 px-1.5 py-0.5 rounded-md mt-1 transition-colors cursor-pointer group"
                        >
                          <span>₹{item.price}</span>
                          <Edit size={10} className="opacity-60 group-hover:opacity-100"/>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden soft-shadow">
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="w-9 h-9 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                        <span className="w-6 text-center font-bold text-sm select-none">{item.quantity}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="w-9 h-9 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                      </div>
                      <div className="w-14 text-right font-bold text-slate-800 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
                <div className="flex justify-between text-sm font-medium text-slate-500"><span>{t('pos.subtotal')}</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.sub.toFixed(2)}</span></div>

                <div className="flex justify-between items-end pt-2"><span className="text-sm font-bold text-slate-500">{t('pos.total')}</span><span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">₹{totals.tot.toFixed(0)}</span></div>
                
                <button 
                  onClick={() => { setIsTicketOpen(false); setIsCheckout(true); }}
                  className="w-full mt-3 font-bold text-lg py-4 rounded-2xl shadow-lg bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  {t('pos.checkout')} ₹{totals.tot.toFixed(0)} <ChevronRight strokeWidth={3}/>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== DESKTOP: Fixed ticket panel - Always visible, never stretches or scrolls away ===== */}
      <div className="hidden md:flex md:flex-col bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-4xl soft-shadow h-full min-h-0 overflow-hidden">
        <div className="p-5 pb-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <ShoppingCart className="text-violet-500" size={20}/> {t('pos.current_order')}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {activeTable ? `Table ${activeTable} Ticket` : 'Takeaway / Counter Ticket'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={() => setShowCustomModal(true)} 
              className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 flex items-center gap-1 bg-violet-50/70 dark:bg-violet-900/20 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Add custom item with manual specific price"
            >
              <PlusCircle size={13}/> Custom ₹
            </button>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                <Trash2 size={13}/> {t('pos.clear')}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-400 opacity-60">
              <ShoppingCart size={44} className="mb-2 opacity-50"/>
              <p className="font-medium text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover-scale">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                  {editingPriceItemId === item.id ? (
                    <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                      <span className="text-xs font-bold text-slate-400">₹</span>
                      <input 
                        type="number"
                        min="0"
                        step="any"
                        autoFocus
                        value={tempPrice}
                        onChange={e => setTempPrice(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(tempPrice);
                            if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                            setEditingPriceItemId(null);
                          } else if (e.key === 'Escape') {
                            setEditingPriceItemId(null);
                          }
                        }}
                        onBlur={() => {
                          const val = parseFloat(tempPrice);
                          if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                          setEditingPriceItemId(null);
                        }}
                        className="w-16 bg-white dark:bg-slate-700 border-2 border-violet-500 rounded-lg px-1.5 py-0.5 text-xs font-black text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const val = parseFloat(tempPrice);
                          if (!isNaN(val) && val >= 0) updateCartItemPrice(item.id, val);
                          setEditingPriceItemId(null);
                        }}
                        className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check size={11}/>
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingPriceItemId(item.id);
                        setTempPrice(String(item.price));
                      }}
                      title="Click to edit manual price"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:hover:bg-violet-900/60 px-1.5 py-0.5 rounded-md mt-1 transition-colors cursor-pointer group"
                    >
                      <span>₹{item.price}</span>
                      <Edit size={10} className="opacity-60 group-hover:opacity-100"/>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden soft-shadow">
                    <button type="button" onClick={(e)=>{e.stopPropagation(); removeFromCart(item.id);}} className="w-8 h-8 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                    <span className="w-6 text-center font-bold text-xs select-none">{item.quantity}</span>
                    <button type="button" onClick={(e)=>{e.stopPropagation(); addToCart(item);}} className="w-8 h-8 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                  </div>
                  <div className="w-14 text-right font-bold text-slate-800 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>{t('pos.subtotal')}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-1">
            <span className="text-xs font-bold text-slate-500 mb-0.5">{t('pos.total')}</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">₹{totals.tot.toFixed(0)}</span>
          </div>
          
          <button 
            onClick={()=>setIsCheckout(true)} 
            disabled={cart.length===0}
            title={cart.length === 0 ? 'Add items to charge' : ''}
            className={`w-full mt-3 font-bold text-base py-3.5 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-[0.98] 
              ${cart.length === 0 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20'}`}
          >
            {t('pos.checkout')} ₹{totals.tot.toFixed(0)} <ChevronRight size={18} strokeWidth={3}/>
          </button>
          <p className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-2 hidden md:block">Press F4 to Checkout</p>
        </div>
      </div>

      {isCheckout && createPortal(
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
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
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-[2.5rem] flex gap-4">
              <button 
                type="button" 
                onClick={(e) => handleCheckout(e as any, true)}
                disabled={cart.length === 0}
                className={`w-1/3 py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-2 transform active:scale-[0.98] transition-all 
                  ${cart.length === 0 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                    : 'bg-white dark:bg-slate-800 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700'}`}
              >
                Save Only
              </button>
              <button 
                type="submit" 
                form="checkout" 
                disabled={cart.length === 0}
                className={`w-2/3 py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-2 transform active:scale-[0.98] transition-all 
                  ${cart.length === 0 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 dark:bg-violet-600 text-white hover:bg-slate-800 dark:hover:bg-violet-700'}`}
              >
                <Printer size={20}/> Print & Complete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Item / Manual Price Modal */}
      {showCustomModal && createPortal(
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" onClick={() => setShowCustomModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Coins size={18} className="text-violet-500"/> Custom Manual Item
              </h4>
              <button onClick={() => setShowCustomModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer">
                <X size={18}/>
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Item Name</label>
              <input 
                type="text"
                placeholder="e.g. Special Dish / Extra Gravy"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Specific Custom Price (₹)</label>
              <input 
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 150"
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => {
                  const priceVal = parseFloat(customPrice);
                  if (!isNaN(priceVal) && priceVal >= 0) {
                    addCustomCartItem(customName || 'Custom Item', priceVal);
                    setCustomName('');
                    setCustomPrice('');
                    setShowCustomModal(false);
                  } else {
                    showToast('Please enter a valid price', 'error');
                  }
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-500/25"
              >
                <Plus size={16}/> Add to Ticket
              </button>
              <button 
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function TablesView() {
  const { tableSessions, setActiveTable, setActiveTab, showToast } = useAppContext();
  const now = Date.now();

  const openTable = (n: number | null) => {
    setActiveTable(n);
    setActiveTab('pos');
  };

  const occupiedDineIn = TABLES.filter(n => tableSessions[n]?.status !== 'empty');
  const totalActiveRevenue = Object.values(tableSessions).reduce(
    (sum, s) => sum + s.cart.reduce((cs, item) => cs + item.price * item.quantity, 0),
    0
  );

  const takeawaySession = tableSessions[0] || { tableNumber: 0, cart: [], status: 'empty' as const };
  const takeawayTotal = takeawaySession.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const takeawayCount = takeawaySession.cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 animate-pop-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Table Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Live overview of dining tables and takeaway counter</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl px-4 py-2.5 soft-shadow flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupied</p>
              <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{occupiedDineIn.length} / 6</p>
            </div>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-700" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Total</p>
              <p className="text-lg font-black text-violet-600 dark:text-violet-400 leading-tight">₹{totalActiveRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Takeaway / Counter Card */}
      <div className="bg-linear-to-r from-violet-600/10 via-indigo-600/5 to-transparent dark:from-violet-950/40 dark:via-slate-900/40 border border-violet-200/70 dark:border-violet-800/40 rounded-3xl p-5 md:p-6 soft-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-violet-500/20 shrink-0">
            <ShoppingBag size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Takeaway / Parcel Counter</h3>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${takeawaySession.cart.length > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {takeawaySession.cart.length > 0 ? `${takeawayCount} items active` : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {takeawaySession.cart.length > 0 ? `Current ticket total: ₹${takeawayTotal.toFixed(0)}` : 'Direct billing for parcel & walk-in counter customers'}
            </p>
          </div>
        </div>
        <button
          onClick={() => openTable(null)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 transition-all active:scale-95 shrink-0"
        >
          {takeawaySession.cart.length > 0 ? 'Resume Takeaway' : 'Takeaway Order'}
        </button>
      </div>

      {/* 6 Dine-In Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
        {TABLES.map(n => {
          const session = tableSessions[n] || { tableNumber: n, cart: [], status: 'empty' as const };
          const { cart, status, openedAt } = session;
          const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
          const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
          const elapsedMin = openedAt ? Math.floor((now - new Date(openedAt).getTime()) / 60000) : 0;

          const statusConfig = {
            empty: {
              badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
              dot: 'bg-slate-400',
              label: 'Empty',
              card: 'border-slate-200/60 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700',
              cta: 'Open Table',
              ctaClass: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20',
            },
            occupied: {
              badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
              dot: 'bg-amber-500',
              label: 'Occupied',
              card: 'border-amber-300/60 dark:border-amber-700/50 bg-amber-50/20 dark:bg-amber-900/10',
              cta: 'Resume Ticket',
              ctaClass: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20',
            },
            'ready-to-bill': {
              badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
              dot: 'bg-emerald-500',
              label: 'Ready to Bill',
              card: 'border-emerald-300/60 dark:border-emerald-700/50 bg-emerald-50/20 dark:bg-emerald-900/10',
              cta: 'Bill Now',
              ctaClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
            },
          } as const;

          const cfg = statusConfig[status];

          return (
            <div
              key={n}
              className={`bg-white dark:bg-slate-800 border-2 ${cfg.card} rounded-[2rem] p-5 md:p-6 flex flex-col justify-between soft-shadow hover-scale transition-all duration-200`}
            >
              {/* Header with Table Logo */}
              <div className="flex items-center gap-3.5 mb-4">
                <TableLogo status={status} tableNumber={n} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white truncate">
                      Table {n} <span className="text-sm font-bold text-violet-600 dark:text-violet-400 font-sans">(Type {String.fromCharCode(64 + n)})</span>
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${cfg.badge} shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Dine-In • 4 Seats • Type {String.fromCharCode(64 + n)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 mb-5">
                {status === 'empty' ? (
                  <div className="h-24 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                    <p className="text-xs font-bold text-slate-500">Available for Seating</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tap below to open table</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Active Dishes</span>
                      <span className="font-bold text-slate-800 dark:text-white">{itemCount} items ({cart.length} dishes)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Running Total</span>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">₹{total.toFixed(0)}</span>
                    </div>
                    {openedAt && (
                      <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="font-medium text-slate-400">Elapsed Time</span>
                        <span className="font-bold text-slate-500">{elapsedMin} min</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => openTable(n)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${cfg.ctaClass}`}
              >
                {cfg.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardView() {
  const context = useAppContext();
  const { orders, menu } = context;

  const stats = useMemo(() => {
    const today = getPastDate(0); 
    const todaysOrders = orders.filter((o: Order) => o.date === today);
    const revenue = todaysOrders.reduce((s: number, o: Order) => s + o.total, 0); 
    const avgTicket = orders.length > 0 ? orders.reduce((s: number, o: Order) => s + o.total, 0) / orders.length : 0;
    
    return { 
        revenue, 
        ticketCount: todaysOrders.length, 
        totalTicketCount: orders.length, 
        avgTicket 
    };
  }, [orders]);

  const chartData: ChartData[] = useMemo(() => Array.from({length:7}).map((_,i) => {
    const d = getPastDate(6-i); 
    const total = orders.filter((o: Order)=>o.date===d).reduce((s: number,o: Order)=>s+o.total,0);
    const isToday = i === 6;
    return { day: new Date(d + 'T12:00:00').toLocaleDateString('en-US', {weekday:'short'}), total, isToday };
  }), [orders]);
  
  const maxRevenue = Math.max(...chartData.map(c=>c.total), 1);

  const topItems: TopSeller[] = useMemo(() => {
    const counts: Record<string, number> = {}; 
    orders.forEach((o: Order) => o.items.forEach((i: CartItem) => counts[i.id] = (counts[i.id]||0)+i.quantity));
    
    return Object.entries(counts).map(([id, qty]) => {
      const item = menu.find((m: MenuItem) => m.id === id);
      return { 
        id, 
        qty, 
        name: item?.name || 'Deleted Dish', 
        category: item?.category || 'Unknown' 
      };
    }).sort((a,b)=>b.qty-a.qty).slice(0,5);
  }, [orders, menu]);

  const statCards: Stat[] = [
      { l: "Today's Gross", v: `₹${stats.revenue.toFixed(0)}`, i: Coins, c: 'violet', s: `${stats.ticketCount} tickets` },
      { l: "Total Tickets", v: stats.totalTicketCount, i: ShoppingCart, c: 'blue', s: "Lifetime" },
      { l: "Avg Ticket", v: `₹${stats.avgTicket.toFixed(0)}`, i: IndianRupee, c: 'amber', s: "Per order" },
      { l: "Active Menu", v: menu.filter((m: MenuItem)=>m.isAvailable && !m.isDeleted).length, i: Utensils, c: 'emerald', s: "Dishes listed" }
  ];

  return (
    <div className="space-y-8 animate-pop-in">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Overview</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Live register analytics and performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((s: Stat, i) => {
            const colors = colorClasses[s.c];
            return (
                <div key={i} className={`bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-200/60 dark:border-slate-700 soft-shadow relative overflow-hidden hover-scale cursor-default`}>
                    <div className={`absolute -right-6 -top-6 w-24 h-24 ${colors.bg} ${colors.darkBg} rounded-full opacity-50`}></div>
                    <div className={`w-12 h-12 ${colors.bg100} ${colors.darkBg900} ${colors.text} ${colors.darkText} rounded-2xl flex items-center justify-center mb-4 relative z-10`}><s.i size={24} strokeWidth={2.5}/></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">{s.l}</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1 relative z-10">{s.v}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-2 relative z-10">{s.s}</p>
                </div>
            )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700 soft-shadow lg:col-span-2 flex flex-col">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white tracking-tight mb-8">7-Day Revenue Pulse</h3>
          <div className="relative flex-1 flex mt-auto min-h-[280px]">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-10 pt-8 pr-4 border-r border-slate-100 dark:border-slate-700">
               <span>₹{maxRevenue.toLocaleString('en-IN')}</span>
               <span>₹{(maxRevenue / 2).toLocaleString('en-IN')}</span>
               <span>₹0</span>
            </div>
            
            {/* Bars */}
            <div className="flex-1 flex items-end justify-between pl-2 sm:pl-4">
              {chartData.map((d: ChartData, i: number) => {
                const h = d.total > 0 ? Math.max((d.total/maxRevenue)*100, 3) : 0;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group relative">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none">Exact: ₹{d.total.toLocaleString('en-IN')}</div>
                    
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 mb-2">₹{d.total >= 1000 ? (d.total/1000).toFixed(1)+'k' : d.total}</span>
                    
                    <div className="w-full max-w-10 sm:max-w-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl h-50 flex items-end overflow-hidden p-1 sm:p-1.5 border border-slate-100 dark:border-slate-700">
                      {h > 0 && <div style={{height:`${h}%`, transitionDelay: `${i*50}ms`}} className={`w-full rounded-xl transition-all duration-300 shadow-sm ${d.isToday ? 'bg-linear-to-t from-violet-600 to-violet-400' : 'bg-linear-to-t from-violet-400/60 to-indigo-300/60 group-hover:from-violet-500'}`}></div>}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-4 ${d.isToday ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500'}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700 soft-shadow">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white tracking-tight mb-6 flex items-center gap-2"><Star className="text-amber-500" fill="currentColor"/> Top Sellers</h3>
          <div className="space-y-4">
            {topItems.length===0 ? <p className="text-center text-slate-400 font-medium py-10">No data</p> : topItems.map((item: TopSeller, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex justify-center items-center font-bold text-violet-600 dark:text-violet-400">{i+1}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-slate-800 dark:text-white truncate text-sm">{item.name}</p><p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">{item.category}</p></div>
                <div className="text-right bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl"><p className="text-sm font-bold text-emerald-600">{item.qty}</p><p className="text-[9px] font-semibold text-emerald-600/70 uppercase">Sold</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const context = useAppContext();
  const { orders, setCurrentReceiptOrder, setIsReceiptOpen } = context;

  const [s, setS] = useState(''); const [d, setD] = useState('');
  const filtered = useMemo(() => orders.filter((o: Order) => (o.billNumber.toLowerCase().includes(s.toLowerCase()) || o.customerName.toLowerCase().includes(s.toLowerCase())) && (!d || o.date === d)), [orders, s, d]);

  const exportCSV = () => {
    const csvHeader = 'Bill,Date,Name,Type,Table,Payment,Total\n';
    const csvRows = filtered.map((o: Order) => `"${o.billNumber}","${o.date}","${o.customerName}","${o.billType}","${o.tableNumber ? 'Table ' + o.tableNumber : 'Parcel'}","${o.paymentType}",${o.total}`).join('\n');
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
        <button onClick={exportCSV} disabled={orders.length === 0} title={orders.length === 0 ? 'No data to export' : undefined} className={`w-full sm:w-auto border px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 soft-shadow transition-all ${orders.length === 0 ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'}`}><Download size={18}/> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2"><Search className="absolute left-4 top-3.5 text-slate-400" size={20}/><input type="text" placeholder="Search bills..." value={s} onChange={e=>setS(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/></div>
        <div className="relative flex items-center">
          <input type="date" value={d} onChange={e=>setD(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/>
          {d && <button onClick={()=>setD('')} className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={16}/></button>}
        </div>
      </div>
      {/* Mobile card layout */}
      <div className="sm:hidden space-y-3">
        {filtered.map((o: Order) => (
          <div key={o.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-4 soft-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-violet-600 dark:text-violet-400">{o.billNumber}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{o.date} &bull; {o.time}</p>
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-white">₹{o.total.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{o.customerName}</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] font-semibold uppercase">{o.billType}</span>
                {o.tableNumber && (
                  <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-md text-[10px] font-bold">
                    Table {o.tableNumber}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] font-semibold uppercase">{o.paymentType}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={()=>{setCurrentReceiptOrder(o);setIsReceiptOpen(true);}} 
                  className="px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit size={14}/> Edit
                </button>
                <button 
                  onClick={()=>{setCurrentReceiptOrder(o);setIsReceiptOpen(true);}} 
                  className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <Printer size={16}/>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-400 font-medium">No orders found matching your criteria.</div>}
      </div>

      {/* Desktop/Tablet table layout */}
      <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-4xl border border-slate-200/60 dark:border-slate-700 overflow-hidden soft-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <tr><th className="p-5">Bill</th><th className="p-5">Client</th><th className="p-5">Details</th><th className="p-5 text-right">Total</th><th className="p-5 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((o: Order) => (
                <tr 
                  key={o.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer group"
                  onClick={()=>{setCurrentReceiptOrder(o);setIsReceiptOpen(true);}}
                  onKeyDown={(e)=>{if(e.key==='Enter'){setCurrentReceiptOrder(o);setIsReceiptOpen(true);}}}
                  tabIndex={0}
                >
                  <td className="p-5"><p className="font-bold text-violet-600 dark:text-violet-400">{o.billNumber}</p><p className="text-[11px] font-medium text-slate-500 mt-1">{o.date} &bull; {o.time}</p></td>
                  <td className="p-5 font-semibold text-slate-800 dark:text-white">{o.customerName}</td>
                  <td className="p-5"><div className="flex gap-2"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-semibold uppercase">{o.billType}</span>{o.tableNumber && (<span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-lg text-[10px] font-bold">Table {o.tableNumber}</span>)}<span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-semibold uppercase">{o.paymentType}</span></div></td>
                  <td className="p-5 text-right font-bold text-lg text-slate-800 dark:text-white">₹{o.total.toFixed(0)}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={(e)=>{e.stopPropagation(); setCurrentReceiptOrder(o); setIsReceiptOpen(true);}} 
                        className="bg-violet-50 border border-violet-200 dark:bg-violet-900/30 dark:border-violet-800/80 px-3 py-1.5 rounded-xl font-bold text-xs text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit size={14}/> Edit
                      </button>
                      <button 
                        onClick={(e)=>{e.stopPropagation(); setCurrentReceiptOrder(o); setIsReceiptOpen(true);}} 
                        className="bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 px-3 py-1.5 rounded-xl font-semibold text-xs text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 group-hover:bg-slate-100 dark:group-hover:bg-slate-600"
                      >
                        <Printer size={14}/> Print
                      </button>
                    </div>
                  </td>
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

function MenuView() {
  const context = useAppContext();
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, showToast } = context;

  type MenuFormState = Omit<MenuItem, 'id' | 'price' | 'imageUrl' | 'description' | 'isVeg'> & { 
    price: string, 
    imageUrl: string,
    description: string,
    isVeg: boolean
  };

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [formState, setFormState] = useState<MenuFormState>({
    name: '', 
    price: '', 
    category: 'Main Course', 
    isAvailable: true, 
    imageUrl: '',
    description: '',
    isVeg: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const activeMenu = useMemo(() => menu.filter((m: MenuItem) => !m.isDeleted), [menu]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(activeMenu.map((m: MenuItem) => m.category)))], [activeMenu]);
  const filteredMenu = useMemo(() => activeMenu.filter((m: MenuItem) => m.name.toLowerCase().includes(search.toLowerCase()) && (cat === 'All' || m.category === cat)), [activeMenu, search, cat]);

  const openModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormState({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl || '',
        description: item.description || '',
        isVeg: item.isVeg !== undefined ? item.isVeg : true
      });
      setPreviewUrl(item.imageUrl || null);
    } else {
      setEditingItem(null);
      setFormState({
        name: '',
        price: '',
        category: 'Main Course',
        isAvailable: true,
        imageUrl: '',
        description: '',
        isVeg: true
      });
      setPreviewUrl(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const executeDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMenuItem(itemToDelete.id);
        showToast('Dish removed from menu', 'warning');
      } catch {
        showToast('Error deleting dish. Please try again.', 'error');
      }
      setItemToDelete(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      showToast('Please enter a dish name', 'error');
      return;
    }
    if (!formState.price || parseFloat(formState.price) <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    let imageUrl = editingItem?.imageUrl || '';

    if (imageFile) {
      showToast('Uploading image...', 'info');
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        showToast('Image upload failed. You can save without image if needed.', 'warning');
      }
    }

    const payload = {
      ...formState, 
      price: parseFloat(formState.price) || 0, 
      imageUrl,
      description: formState.description.trim(),
      isVeg: formState.isVeg
    };

    try {
      if (editingItem) {
          await updateMenuItem({...editingItem, ...payload});
          showToast('Dish updated successfully', 'success');
      } else {
          await addMenuItem(payload);
          showToast('New dish added to menu', 'success');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Failed to save dish. Check your Supabase connection.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6 animate-pop-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Menu Master</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your food catalog and availability</p>
        </div>
        <button onClick={()=>openModal()} className="bg-violet-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 hover:bg-violet-700 hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"><PlusCircle size={20}/> Add New Dish</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-3xl border border-slate-200/60 dark:border-slate-700 soft-shadow">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input type="text" placeholder="Search dishes..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
        </div>
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 px-2 pb-2 sm:pb-0">
          <select value={cat} onChange={e=>setCat(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="text-xs font-bold text-slate-400 whitespace-nowrap">Showing {filteredMenu.length} dishes</div>
        </div>
      </div>

      {filteredMenu.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 animate-pop-in">
          <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-6">
            <Utensils size={40} className="text-violet-400" strokeWidth={1.5}/>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">{activeMenu.length === 0 ? 'No dishes yet' : 'No dishes found'}</h3>
          <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs text-center">{activeMenu.length === 0 ? 'Start building your menu by adding your first dish to the catalog.' : 'Try adjusting your search or category filter.'}</p>
          {activeMenu.length === 0 && (
            <button onClick={() => openModal()} className="bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
              <PlusCircle size={18}/> Add Your First Dish
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredMenu.map((i: MenuItem) => (
          <div key={i.id} className={`bg-white dark:bg-slate-800 border ${i.isAvailable?'border-slate-200/60 dark:border-slate-700':'border-rose-100 dark:border-rose-900 opacity-70'} rounded-[2rem] overflow-hidden flex flex-col transition-all soft-shadow hover-scale group`}>
            <div className="relative h-40 bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
              <SafeMenuImage src={i.imageUrl} alt={i.name} category={i.category} />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-slate-700 dark:text-slate-200 shadow-sm border border-white/20">{i.category}</span>
                <button onClick={(e)=>{e.stopPropagation(); toggleAvailability(i.id);}} className={`text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm transition-all active:scale-90 ${i.isAvailable?'bg-emerald-500/90 text-white hover:bg-emerald-600':'bg-rose-500/90 text-white hover:bg-rose-600'}`}>{i.isAvailable?'In Stock':'Sold Out'}</button>
              </div>
              <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/20">
                <div className={`h-2.5 w-2.5 rounded-full ${i.isVeg ? 'bg-emerald-500' : 'bg-rose-500'} ring-4 ring-emerald-500/20`} title={i.isVeg?'Vegetarian':'Non-Vegetarian'}></div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight line-clamp-1 mb-1">{i.name}</h4>
              <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4 h-8">{i.description || ''}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">₹{i.price}</p>
                <div className="flex gap-2">
                  <button onClick={()=>openModal(i)} className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex justify-center items-center hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 transition-all text-slate-500"><Edit size={16}/></button>
                  <button onClick={()=>confirmDelete(i)} className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex justify-center items-center hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm"><Trash2 size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {itemToDelete && createPortal(
        <div key="delete-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-pop-in border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mb-6 mx-auto ring-8 ring-rose-50 dark:ring-rose-900/10">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white text-center mb-2">Delete Dish?</h3>
            <p className="text-slate-500 text-center mb-8 text-sm font-medium leading-relaxed px-4">Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">&quot;{itemToDelete.name}&quot;</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setItemToDelete(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all active:scale-95">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isModalOpen && createPortal(
        <div key="add-modal" className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col border border-slate-100 dark:border-slate-800 animate-pop-in" style={{maxHeight: '92vh'}}>
            <div className="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white tracking-tight">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Configure dish details and presentation</p>
              </div>
              <button onClick={()=>setIsModalOpen(false)} className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400 active:scale-90"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
              <form id="dish-form" onSubmit={handleSubmit} className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  {/* Left Column: Image Section */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dish Presentation</label>
                      <div className="relative aspect-video lg:aspect-square rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden group cursor-pointer shadow-inner">
                        {previewUrl ? (
                          <Image unoptimized src={previewUrl} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <PlusCircle size={44} className="text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-xs font-bold text-slate-400">Click to upload photo</p>
                          </div>
                        )}
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        {previewUrl && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-xs shadow-lg">Change Image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-4 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm">
                        <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${formState.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formState.isVeg ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={formState.isVeg} onChange={e=>setFormState({...formState, isVeg: e.target.checked})} />
                        <div className="flex-1">
                          <p className="font-bold text-xs text-slate-800 dark:text-white">{formState.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">Classification</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-4 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm">
                        <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${formState.isAvailable ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formState.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={formState.isAvailable} onChange={e=>setFormState({...formState, isAvailable: e.target.checked})} />
                        <div className="flex-1">
                          <p className="font-bold text-xs text-slate-800 dark:text-white">Active in POS</p>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">Availability Status</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Text Inputs */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dish Name <span className="text-rose-500">*</span></label>
                      <input type="text" placeholder="e.g. Signature Butter Chicken" required value={formState.name} onChange={e=>setFormState({...formState,name:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all dark:text-white placeholder:text-slate-400 shadow-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                        <select value={formState.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setFormState({...formState,category:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all dark:text-white appearance-none cursor-pointer shadow-sm">
                          <option>Main Course</option><option>Starters</option><option>Breads</option><option>Rice</option><option>Beverages</option><option>Desserts</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (₹) <span className="text-rose-500">*</span></label>
                        <input type="number" placeholder="0.00" required value={formState.price} onChange={e=>setFormState({...formState,price:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all dark:text-white placeholder:text-slate-400 shadow-sm" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                      <textarea rows={4} placeholder="Brief details about ingredients, spice levels, or preparation..." value={formState.description} onChange={e=>setFormState({...formState,description:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all dark:text-white placeholder:text-slate-400 resize-none shadow-sm"></textarea>
                    </div>
                  </div>
                </form>
            </div>

            <div className="p-5 sm:p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <button onClick={()=>setIsModalOpen(false)} className="flex-1 py-4 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm text-sm sm:text-base">Cancel</button>
              <button type="submit" form="dish-form" className="flex-[2] py-4 px-6 bg-slate-900 dark:bg-violet-600 text-white font-extrabold rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-violet-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base tracking-tight">
                {editingItem ? <Edit size={20}/> : <PlusCircle size={20}/>}
                <span>{editingItem ? 'Update Dish Record' : 'Create New Dish'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function SettingsView() {
  const context = useAppContext();
  const { settings, updateSettings } = context;

  const [formState, setFormState] = useState(settings);
  
  // Bug #22: Sync form inputs when settings load from Supabase
  useEffect(() => { setFormState(settings); }, [settings]);

  const handleSubmit = (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (formState.gstNumber) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(formState.gstNumber)) {
          context.showToast('Invalid GSTIN format', 'error');
          return;
        }
      }
      updateSettings({...formState, gstPercentage:Number(formState.gstPercentage) || 0}); 
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState({ ...formState, printFormat: e.target.value as Settings['printFormat'] });
  };

  return (
    <div className="space-y-6 animate-pop-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-8">System Configurations</h2>
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] soft-shadow border border-slate-200/60 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hotel Name</label><input type="text" value={formState.hotelName} onChange={e=>setFormState({...formState,hotelName:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"/></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label><input type="text" value={formState.phone} onChange={e=>setFormState({...formState,phone:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"/></div>
            <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label><input type="text" value={formState.address} onChange={e=>setFormState({...formState,address:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"/></div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-700 mb-8 w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">GSTIN</label><input type="text" value={formState.gstNumber} onChange={e=>setFormState({...formState,gstNumber:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none font-mono focus:ring-2 focus:ring-violet-500 transition-all"/></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tax (%)</label><input type="number" step="0.1" value={formState.gstPercentage} onChange={e=>setFormState({...formState,gstPercentage:Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"/></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Print Layout</label><select value={formState.printFormat} onChange={handleSelectChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"><option value="thermal">Thermal (80mm)</option><option value="a4">Corporate (A4)</option><option value="kot">Kitchen Ticket</option></select></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Footer Message</label><input type="text" value={formState.footerMessage} onChange={e=>setFormState({...formState,footerMessage:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all"/></div>
          </div>
          <button type="submit" className="w-full md:w-auto bg-slate-900 dark:bg-violet-600 text-white px-10 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-slate-800 dark:hover:bg-violet-700 transition-all active:scale-[0.98]">Save Parameters</button>
        </form>
      </div>
    </div>
  );
}

function RestaurantSproutLogo({ className = "w-13 h-13" }: { className?: string }) {
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

function BillQRCode({ className = "w-9 h-9" }: { className?: string }) {
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

function ReceiptPreviewModal() {
  const context = useAppContext();
  const { currentReceiptOrder: order, setIsReceiptOpen, settings, updateOrder, editOrderInPOS, menu, showToast } = context;

  const [format, setFormat] = useState(settings.printFormat);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (order) {
      setEditedCustomerName(order.customerName || '');
      setEditedCustomerPhone(order.customerPhone || '');
      setEditedTableNumber(order.tableNumber);
      setEditedBillType(order.billType || 'Dine-In');
      setEditedPaymentType(order.paymentType || 'UPI');
      setEditedItems(order.items ? order.items.map(i => ({ ...i })) : []);
    }
  }, [order]);

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
            /* THE RECEIPT CARD - Clean Crisp White Background with Large Readable Typography */
            <div 
              id="print-area" 
              className={`transition-all select-none print:select-auto ${
                format === 'thermal'
                  ? 'w-full max-w-[420px] sm:w-[100mm] p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
                  : format === 'kot'
                  ? 'w-full max-w-[420px] sm:w-[100mm] p-6 sm:p-8 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
                  : 'w-full max-w-[210mm] min-h-[297mm] p-10 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-300 text-black font-sans'
              }`}
            >
            {/* THERMAL ROLL FORMAT — Crisp, High-Contrast Dark Text */}
            {format === 'thermal' && (
              <div>
                {/* Brand Name in Single Line (No Logo) */}
                <div className="text-center pb-1">
                  <h1 className="text-2xl sm:text-[27px] font-black uppercase tracking-tight text-black leading-tight whitespace-nowrap">
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
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-800 w-16">Bill No:</span>
                        <span className="font-bold text-black">{order.billNumber}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-800 w-16">Type:</span>
                        <span className="font-bold text-black">{order.billType}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-stone-800 w-16">Table:</span>
                        <span className="font-bold text-black">
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
                        <span className="font-semibold text-stone-800">Date:</span>
                        <span className="font-bold text-black">{order.date}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <span className="font-semibold text-stone-800">Time:</span>
                        <span className="font-bold text-black">{order.time}</span>
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

                {/* Bottom Bar: Centered Payment Pill (Bold Dark) */}
                <div className="flex items-center justify-center pt-1">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full border-2 border-black text-xs sm:text-[12.5px] font-black uppercase tracking-wider text-black bg-transparent">
                    PAID VIA {order.paymentType || 'UPI'}
                  </div>
                </div>

                {/* Centered Footer Message (Darker, High Legibility) */}
                <p className="text-center text-xs sm:text-[12px] font-bold uppercase tracking-wider text-stone-900 mt-4 leading-normal">
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
                    <div className="flex justify-between text-stone-700 font-semibold text-sm">
                      <span>GST ({settings.gstPercentage}%)</span>
                      <span>₹{order.gstAmount.toFixed(2)}</span>
                    </div>
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
