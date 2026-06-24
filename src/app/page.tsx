'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, ShoppingBag, History, Utensils, Settings as SettingsIcon, 
  LogOut, Sun, Moon, Plus, Minus, Search, Trash2, Printer, Download, 
  Edit, Check, X, Lock, User as UserIcon, Coins, IndianRupee,
  ShoppingCart, ChevronRight, PlusCircle, Menu as MenuIcon,
  MapPin, CreditCard, Activity, Star, Eye, EyeOff, Loader2
} from 'lucide-react';

import { supabase } from '@/utils/supabaseClient';
import { uploadImage } from '@/utils/cloudinary';
import { AppContext, useAppContext } from '@/contexts/AppContext';
import { I18nProvider, useI18n } from '@/contexts/I18nContext';

// ==========================================
// 1. TYPES & INTERFACES (imported from @/types)
// ==========================================
import type {
  MenuItem, CartItem, Order, Settings, User, Toast,
  OrderData, StatColor, Stat, ChartData, TopSeller, AppContextType
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
export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    hotelName: 'Grand Spice Restaurant',
    address: '124, Culinary Avenue, Metro City, IN',
    phone: '+91 9876543210',
    gstNumber: '33ABCDE1234F1Z5',
    gstPercentage: 5,
    footerMessage: 'Thank you for dining with us! Visit again.',
    printFormat: 'thermal',
    billCounter: 1003
  });
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [activeTab, _setActiveTab] = useState('pos');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);

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

  const addOrder = useCallback(async (orderData: OrderData) => {
      // Use settings.billCounter from Supabase (persisted across sessions)
      const currentCounter = settings.billCounter;
      const billNo = `POS-${currentCounter}`;
      const finalOrder: Omit<Order, 'id'> = { billNumber: billNo, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), ...orderData };
      
      const { data, error } = await supabase.from('orders').insert([finalOrder]).select();

      if (error) {
        showToast('Error creating order', 'error');
        console.error(error);
      } else if (data) {
        const newOrder = data[0] as Order;
        // Increment billCounter in Supabase atomically
        const newCounter = currentCounter + 1;
        await supabase.from('settings').update({ billCounter: newCounter }).eq('id', settings.id);
        setSettings(prev => ({ ...prev, billCounter: newCounter }));
        setOrders(p => [newOrder, ...p]); 
        setCart([]);
        setCurrentReceiptOrder(newOrder); 
        setIsReceiptOpen(true); 
        showToast(`Bill ${billNo} Generated`, 'success');
      }
  }, [settings, showToast]);

  const addToCart = useCallback((item: MenuItem) => {
      setCart(p => {
        const ext = p.find(i => i.id === item.id);
        return ext ? p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...p, { ...item, quantity: 1 }];
      });
  }, []);

  const removeFromCart = useCallback((id: string) => {
      setCart(p => {
        const ext = p.find(i => i.id === id);
        return (ext && ext.quantity > 1) ? p.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) : p.filter(i => i.id !== id);
      });
  }, []);

  const clearCart = useCallback(() => { 
      setCart([]); 
      showToast('Cart Cleared', 'warning'); 
  }, [showToast]);

  const setActiveTab = useCallback((t: string) => {
      _setActiveTab(t);
      setIsMobileMenuOpen(false);
  }, []);

  const value: AppContextType = useMemo(() => ({
    theme, toggleTheme,
    user, login, logout,
    settings, updateSettings,
    menu, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
    orders, addOrder,
    cart, addToCart, removeFromCart, clearCart,
    toasts, showToast, removeToast, activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen, 
    currentReceiptOrder, setCurrentReceiptOrder, 
    isReceiptOpen, setIsReceiptOpen,
  }), [
    theme, toggleTheme, user, login, logout, settings, updateSettings, menu, fetchMenu, addMenuItem, updateMenuItem, deleteMenuItem, 
    toggleAvailability, orders, addOrder, cart, addToCart, removeFromCart, clearCart, toasts, showToast, removeToast, activeTab, setActiveTab, 
    isMobileMenuOpen, currentReceiptOrder, isReceiptOpen
  ]);

  // Avoid hydration mismatch; show spinner while loading data from Supabase
  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="bg-linear-to-br from-violet-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
          <Activity size={32} />
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading SmartPOS…</p>
      </div>
    );
  }

  return (
    <I18nProvider>
      <AppContext.Provider value={value}>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
        {user ? (
          <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden print:block">
            <MobileHeader />
            <Sidebar />
            <main className="flex-1 overflow-y-auto print:overflow-visible custom-scroll pb-24 lg:pb-0">
              <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-full">
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
          <Activity size={22} /> <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">SmartPOS</span>
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
    { id: 'pos', label: t('nav.terminal'), icon: ShoppingBag },
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('nav.transactions'), icon: History },
    { id: 'menu', label: t('nav.menu'), icon: Utensils },
    { id: 'settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 hidden lg:flex items-center gap-3">
          <div className="bg-linear-to-br from-violet-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-md"><Activity size={24} /></div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800 dark:text-white leading-none tracking-tight">SmartPOS</h1>
            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-widest mt-1">Pro Edition</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 lg:py-2 space-y-1.5 overflow-y-auto">
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

        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
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
  const { menu, cart, addToCart, removeFromCart, clearCart, settings, addOrder, setActiveTab, showToast, addMenuItem } = context;

  const [search, setSearch] = useState(''); const [cat, setCat] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  
  const [cName, setCName] = useState(''); const [cPhone, setCPhone] = useState('');
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
    <div className="flex flex-col md:grid md:grid-cols-[1fr_400px] gap-6 h-full relative animate-pop-in">
      <div className="flex-1 flex flex-col min-w-0 md:overflow-y-auto md:custom-scroll">
        <div className="bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl z-40 sticky top-0 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pt-1">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Point of Sale</h2>
              <p className="text-sm font-medium text-slate-500 hidden sm:block">Tap items to build the ticket</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input type="text" placeholder="Search menu..." value={search} onChange={e=>{setSearch(e.target.value); if(e.target.value) setCat('All');}} onFocus={()=>setIsSearchFocused(true)} onBlur={()=>setIsSearchFocused(false)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all soft-shadow" />
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

        <div className="flex-1 pb-48 md:pb-4 pt-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 content-start pr-1">
          {filteredMenu.map((item: MenuItem) => {
            const qty = cart.find((c: CartItem) => c.id === item.id)?.quantity || 0;
            return (
              <div key={item.id} onClick={() => !qty && item.isAvailable && addToCart(item)} className={`relative p-5 rounded-3xl transition-all duration-200 flex flex-col justify-between h-44 select-none overflow-hidden ${!item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed' : qty > 0 ? 'bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-500 shadow-md shadow-violet-500/10' : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover-scale cursor-pointer soft-shadow'}`}>
                {item.imageUrl && <Image unoptimized src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" className="opacity-10 dark:opacity-20" />}
                <div className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${qty ? 'bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{item.category}</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'} ring-4 ${item.isVeg ? 'ring-emerald-500/10' : 'ring-rose-500/10'}`}></div>
                      {!item.isAvailable && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-lg font-bold uppercase tracking-tighter">Sold Out</span>}
                    </div>
                  </div>
                  <h4 className={`font-bold text-sm md:text-base leading-tight line-clamp-2 ${qty ? 'text-violet-900 dark:text-violet-100' : 'text-slate-800 dark:text-white'}`}>{item.name}</h4>
                </div>
                <div className="relative flex justify-between items-end">
                  <p className={`text-lg font-extrabold ${qty ? 'text-violet-700 dark:text-violet-400' : 'text-slate-800 dark:text-white'}`}>₹{item.price}</p>
                  {qty > 0 ? (
                    <div className="flex items-center bg-violet-600 text-white rounded-xl shadow-md overflow-hidden" onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>removeFromCart(item.id)} className="w-11 h-11 flex justify-center items-center hover:bg-violet-700 transition-colors"><Minus size={16} strokeWidth={3}/></button>
                      <span className="w-6 text-center font-bold text-sm">{qty}</span>
                      <button onClick={()=>addToCart(item)} className="w-11 h-11 flex justify-center items-center hover:bg-violet-700 transition-colors"><Plus size={16} strokeWidth={3}/></button>
                    </div>
                  ) : item.isAvailable && (
                    <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex justify-center items-center text-slate-400 hover:bg-violet-100 hover:text-violet-600 hover:border-violet-200 transition-colors"><Plus size={18} strokeWidth={3}/></div>
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

      {/* ===== MOBILE: Compact floating cart bar (visible when cart has items & ticket is collapsed) ===== */}
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
              <span className="font-bold text-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">₹{totals.tot.toFixed(0)}</span>
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </button>
        </div>
      )}

      {/* ===== MOBILE: Full ticket overlay (opens when user taps View Cart) ===== */}
      {isTicketOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setIsTicketOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3" />
            <div className="p-5 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center gap-2.5"><ShoppingCart className="text-violet-500"/> Ticket</h3>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && <button onClick={clearCart} className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Trash2 size={14}/> Clear</button>}
                  <button onClick={() => setIsTicketOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"><X size={18}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pr-1 min-h-0">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden soft-shadow">
                        <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-9 h-9 flex justify-center items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                      </div>
                      <div className="w-14 text-right font-bold text-slate-800 dark:text-white">₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
                <div className="flex justify-between text-sm font-medium text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.sub.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-medium text-slate-500"><span>Tax ({settings.gstPercentage}%)</span><span className="font-semibold text-slate-700 dark:text-slate-300">₹{totals.gst.toFixed(2)}</span></div>
                <div className="flex justify-between items-end pt-2"><span className="text-sm font-bold text-slate-500">Total Due</span><span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">₹{totals.tot.toFixed(0)}</span></div>
                
                <button 
                  onClick={() => { setIsTicketOpen(false); setIsCheckout(true); }}
                  className="w-full mt-3 font-bold text-lg py-4 rounded-2xl shadow-lg bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  Charge ₹{totals.tot.toFixed(0)} <ChevronRight strokeWidth={3}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DESKTOP/TABLET: Static side ticket panel ===== */}
      <div className="hidden md:flex md:flex-col bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-4xl soft-shadow h-full overflow-hidden">
        <div className="p-6 flex flex-col h-full overflow-y-auto custom-scroll">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center gap-2.5"><ShoppingCart className="text-violet-500"/> Ticket</h3>
            {cart.length > 0 && <button onClick={clearCart} className="text-slate-400 hover:text-rose-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Trash2 size={14}/> Clear</button>}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar min-h-37.5 pr-1">
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
              title={cart.length === 0 ? 'Add items to charge' : ''}
              className={`w-full mt-5 font-bold text-lg py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-[0.98] 
                ${cart.length === 0 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                  : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20'}`}
            >
              Charge ₹{totals.tot.toFixed(0)} <ChevronRight strokeWidth={3}/>
            </button>
            <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-3 hidden md:block">Press F4 to Checkout</p>
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
              <button 
                type="submit" 
                form="checkout" 
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-2 transform active:scale-[0.98] transition-all 
                  ${cart.length === 0 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 dark:bg-violet-600 text-white hover:bg-slate-800 dark:hover:bg-violet-700'}`}
              >
                <Printer size={20}/> Print & Complete
              </button>
            </div>
          </div>
        </div>
      )}
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
      { l: "Active Menu", v: menu.filter((m: MenuItem)=>m.isAvailable).length, i: Utensils, c: 'emerald', s: "Dishes listed" }
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
          <div className="relative flex-1 min-h-62.5 flex items-end justify-between px-2 mt-auto">
            {chartData.map((d: ChartData, i: number) => {
              const h = d.total > 0 ? Math.max((d.total/maxRevenue)*100, 3) : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl z-10 pointer-events-none">₹{d.total.toFixed(0)}</div>
                  <div className="w-full max-w-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl h-50 flex items-end overflow-hidden p-1.5 border border-slate-100 dark:border-slate-700">
                    {h > 0 && <div style={{height:`${h}%`, transitionDelay: `${i*50}ms`}} className={`w-full rounded-xl transition-all duration-300 shadow-sm ${d.isToday ? 'bg-linear-to-t from-violet-600 to-violet-400' : 'bg-linear-to-t from-violet-400/60 to-indigo-300/60 group-hover:from-violet-500'}`}></div>}
                  </div>
                  <span className={`text-xs font-semibold mt-4 ${d.isToday ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500'}`}>{d.day}</span>
                </div>
              );
            })}
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
        <button onClick={exportCSV} disabled={orders.length === 0} title={orders.length === 0 ? 'No data to export' : undefined} className={`w-full sm:w-auto border px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 soft-shadow transition-all ${orders.length === 0 ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'}`}><Download size={18}/> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2"><Search className="absolute left-4 top-3.5 text-slate-400" size={20}/><input type="text" placeholder="Search bills..." value={s} onChange={e=>setS(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/></div>
        <input type="date" value={d} onChange={e=>setD(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 soft-shadow transition-all"/>
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
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] font-semibold uppercase">{o.paymentType}</span>
              </div>
              <button onClick={()=>{setCurrentReceiptOrder(o);setIsReceiptOpen(true);}} className="ml-3 shrink-0 w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"><Printer size={16}/></button>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Menu Master</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your food catalog and availability</p>
        </div>
        <button onClick={()=>openModal()} className="bg-violet-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 flex items-center gap-2 hover:bg-violet-700 hover:-translate-y-0.5 transition-all active:scale-95"><PlusCircle size={20}/> Add New Dish</button>
      </div>

      {menu.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 animate-pop-in">
          <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-6">
            <Utensils size={40} className="text-violet-400" strokeWidth={1.5}/>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">No dishes yet</h3>
          <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs text-center">Start building your menu by adding your first dish to the catalog.</p>
          <button onClick={() => openModal()} className="bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
            <PlusCircle size={18}/> Add Your First Dish
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {menu.map((i: MenuItem) => (
          <div key={i.id} className={`bg-white dark:bg-slate-800 border ${i.isAvailable?'border-slate-200/60 dark:border-slate-700':'border-rose-100 dark:border-rose-900 opacity-70'} rounded-[2rem] overflow-hidden flex flex-col transition-all soft-shadow hover-scale group`}>
            <div className="relative h-40 bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
              {i.imageUrl ? (
                <Image unoptimized src={i.imageUrl} alt={i.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <Utensils size={48} strokeWidth={1} />
                </div>
              )}
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
              <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4 h-8">{i.description || 'No description provided.'}</p>
              
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

      {itemToDelete && (
        <div key="delete-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-pop-in border border-slate-100 dark:border-slate-800">
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
        </div>
      )}

      {isModalOpen && (
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
        </div>
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

function ReceiptPreviewModal() {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-8 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-transparent print:block">
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
