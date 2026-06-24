'use client';

import Link from 'next/link';
import { Activity, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none"/>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"/>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-violet-500/30">
            <Activity size={28} className="text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">SmartPOS Pro</span>
        </div>

        {/* Error code */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <p className="text-[9rem] font-black text-white/5 leading-none select-none">404</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle size={64} className="text-violet-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.<br />
          Head back to your POS terminal to continue.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft size={18} />
          Go to Terminal
        </Link>
      </div>
    </div>
  );
}
