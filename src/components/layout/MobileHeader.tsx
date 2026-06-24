import React from 'react';
import { Sun, Moon, X, Menu as MenuIcon, Activity } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function MobileHeader() {
  const { theme, toggleTheme, user, isMobileMenuOpen, setIsMobileMenuOpen } = useAppContext();
  
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Activity size={22} /> <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">Hotel Vetri Vel</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-sm border border-violet-200 dark:border-violet-800">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
