'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Activity, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[100px] pointer-events-none"/>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"/>

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
            <Activity size={22} className="text-white" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">SmartPOS Pro</span>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} className="text-emerald-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Check your inbox</h1>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              If this account exists, you&apos;ll receive a password reset link shortly.<br/>
              Contact your system administrator if you need urgent access.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft size={16}/> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Forgot password?</h1>
            <p className="text-slate-400 text-sm font-medium mb-8">
              Contact your system administrator for access reset, or enter your registered email below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500 pointer-events-none" size={20} />
                <input
                  type="email"
                  placeholder="admin@yourhotel.com"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none text-white transition-all placeholder:font-normal placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-800/30 rounded-2xl">
              <p className="text-amber-400 text-xs font-semibold">
                For immediate access, contact your hotel&apos;s IT administrator or use the default credentials documented in the system README.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-violet-400 transition-colors"
              >
                <ArrowLeft size={15}/> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
