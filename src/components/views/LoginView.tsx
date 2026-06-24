import React, { useState } from 'react';
import { Lock, User as UserIcon, Activity, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export default function LoginView() {
  const { login } = useAppContext();

  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(u, p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/50 dark:bg-violet-900/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-4xl soft-shadow p-8 md:p-10 border border-white/50 dark:border-slate-800 relative z-10 animate-pop-in">
        <div className="text-center mb-8">
          <div className="inline-flex bg-linear-to-br from-violet-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-violet-500/30 mb-5"><Activity size={32} /></div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">SmartPOS Pro</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Sign in to open your register</p>
        </div>
        <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-2xl text-violet-800 dark:text-violet-300 text-sm">
          <p className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Lock size={12}/> Demo Credentials</p>
          <p>User: <strong className="font-mono bg-white/50 dark:bg-black/20 px-1 rounded">admin</strong> &bull; Pass: <strong className="font-mono bg-white/50 dark:bg-black/20 px-1 rounded">admin123</strong></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input type="text" required value={u} onChange={(e) => setU(e.target.value)} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none text-slate-800 dark:text-white transition-all shadow-sm" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input type="password" required value={p} onChange={(e) => setP(e.target.value)} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none text-slate-800 dark:text-white transition-all shadow-sm" />
          </div>
          <button type="submit" className="w-full mt-6 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
            Open Terminal <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
