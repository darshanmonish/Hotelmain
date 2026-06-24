import React, { useMemo } from 'react';
import { Coins, ShoppingCart, DollarSign, Utensils, Star } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Order, MenuItem, CartItem, Stat, ChartData, TopSeller } from '@/types';
import { colorClasses, getPastDate } from '@/utils/constants';

export default function DashboardView() {
  const { orders, menu } = useAppContext();

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
  
  const maxRevenue = Math.max(...chartData.map(c=>c.total), 500);

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
      { l: "Avg Ticket", v: `₹${stats.avgTicket.toFixed(0)}`, i: DollarSign, c: 'amber', s: "Per order" },
      { l: "Active Menu", v: menu.filter((m: MenuItem)=>m.isAvailable).length, i: Utensils, c: 'emerald', s: "Dishes listed" }
  ];

  return (
    <div className="space-y-8 animate-pop-in">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Overview</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Live register analytics and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              const h = Math.max((d.total/maxRevenue)*100, 5);
              return (
                <div key={i} className="flex flex-col items-center flex-1 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl z-10 pointer-events-none">₹{d.total.toFixed(0)}</div>
                  <div className="w-full max-w-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl h-50 flex items-end overflow-hidden p-1.5 border border-slate-100 dark:border-slate-700">
                    <div style={{height:`${h}%`, transitionDelay: `${i*50}ms`}} className="w-full bg-linear-to-t from-violet-500 to-indigo-400 rounded-xl group-hover:from-violet-400 transition-all duration-300 shadow-sm"></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-4">{d.day}</span>
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
