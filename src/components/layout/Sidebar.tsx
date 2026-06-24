import React from 'react';
import { LayoutDashboard, ShoppingBag, History, Utensils, Settings as SettingsIcon, LogOut, Sun, Moon, Activity } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, logout, theme, toggleTheme, user, isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();
  
  const navs = [
    { id: 'pos', label: 'Terminal', icon: ShoppingBag },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Transactions', icon: History },
    { id: 'menu', label: 'Menu Master', icon: Utensils },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
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
          <div className="flex items-center justify-between mb-4 hidden lg:flex">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold border border-violet-200 dark:border-violet-800">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{user?.username}</p></div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 transition-all">
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
