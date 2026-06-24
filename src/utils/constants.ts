import type { Settings, MenuItem, Order, StatColor } from '@/types';

export const colorClasses: Record<StatColor, { bg: string, darkBg: string, text: string, darkText: string, bg100: string, darkBg900: string }> = {
    violet: {
      bg: 'bg-violet-50',
      darkBg: 'dark:bg-violet-900/20',
      text: 'text-violet-600',
      darkText: 'dark:text-violet-400',
      bg100: 'bg-violet-100',
      darkBg900: 'dark:bg-violet-900/50'
    },
    blue: {
      bg: 'bg-blue-50',
      darkBg: 'dark:bg-blue-900/20',
      text: 'text-blue-600',
      darkText: 'dark:text-blue-400',
      bg100: 'bg-blue-100',
      darkBg900: 'dark:bg-blue-900/50'
    },
    amber: {
      bg: 'bg-amber-50',
      darkBg: 'dark:bg-amber-900/20',
      text: 'text-amber-600',
      darkText: 'dark:text-amber-400',
      bg100: 'bg-amber-100',
      darkBg900: 'dark:bg-amber-900/50'
    },
    emerald: {
      bg: 'bg-emerald-50',
      darkBg: 'dark:bg-emerald-900/20',
      text: 'text-emerald-600',
      darkText: 'dark:text-emerald-400',
      bg100: 'bg-emerald-100',
      darkBg900: 'dark:bg-emerald-900/50'
    },
};

export const defaultSettings: Settings = {
  id: 1,
  hotelName: 'Hotel Vetri Vel',
  address: 'No.87/92, VCV Road, R.S.Puram, Coimbatore - 641002',
  phone: '9842999931, 9843999931',
  gstNumber: '33ABCDE1234F1Z5',
  gstPercentage: 5,
  footerMessage: 'Thank you for dining with us! Visit again.',
  printFormat: 'thermal',
  billCounter: 1003,
};

export const defaultMenu: MenuItem[] = [
  { id: 'm1', name: 'Butter Chicken', price: 280, category: 'Main Course', isAvailable: true, isVeg: false, imageUrl: '', description: 'Tender chicken in a rich creamy tomato gravy.' },
  { id: 'm2', name: 'Paneer Tikka Masala', price: 240, category: 'Main Course', isAvailable: true, isVeg: true, imageUrl: '', description: 'Grilled paneer in a spiced tomato-onion masala.' },
  { id: 'm3', name: 'Garlic Naan', price: 50, category: 'Breads', isAvailable: true, isVeg: true, imageUrl: '', description: 'Soft leavened flatbread with garlic butter.' },
  { id: 'm4', name: 'Tandoori Roti', price: 30, category: 'Breads', isAvailable: true, isVeg: true, imageUrl: '', description: 'Whole-wheat bread baked in a tandoor oven.' },
  { id: 'm5', name: 'Chicken Biryani', price: 250, category: 'Rice', isAvailable: true, isVeg: false, imageUrl: '', description: 'Fragrant basmati rice layered with spiced chicken.' },
  { id: 'm6', name: 'Veg Pulao', price: 180, category: 'Rice', isAvailable: true, isVeg: true, imageUrl: '', description: 'Light basmati rice cooked with seasonal vegetables.' },
  { id: 'm7', name: 'Crispy Corn', price: 150, category: 'Starters', isAvailable: true, isVeg: true, imageUrl: '', description: 'Sweet corn kernels fried with Indo-Chinese spices.' },
  { id: 'm8', name: 'Chicken 65', price: 220, category: 'Starters', isAvailable: true, isVeg: false, imageUrl: '', description: 'Deep-fried chicken marinated in South Indian spices.' },
  { id: 'm9', name: 'Fresh Lime Soda', price: 60, category: 'Beverages', isAvailable: true, isVeg: true, imageUrl: '', description: 'Chilled lime soda, sweet or salted.' },
  { id: 'm10', name: 'Mango Lassi', price: 80, category: 'Beverages', isAvailable: true, isVeg: true, imageUrl: '', description: 'Thick mango yogurt drink, chilled and sweet.' },
  { id: 'm11', name: 'Gulab Jamun (2pcs)', price: 70, category: 'Desserts', isAvailable: true, isVeg: true, imageUrl: '', description: 'Soft milk dumplings soaked in rose-flavoured syrup.' },
];

export const getPastDate = (daysAgo: number) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split('T')[0];
};

export const seedOrders: Order[] = [
  { id: 'T-1', billNumber: 'POS-1001', customerName: 'Rahul', customerPhone: '9845123456', billType: 'Dine-In', paymentType: 'UPI', date: getPastDate(1), time: '12:30 PM', items: [{ id: 'm5', name: 'Chicken Biryani', price: 250, quantity: 2, category: 'Rice', isAvailable: true }], subtotal: 500, gstAmount: 25, total: 525 },
  { id: 'T-2', billNumber: 'POS-1002', customerName: 'Sneha', customerPhone: '9876501234', billType: 'Parcel', paymentType: 'Cash', date: getPastDate(0), time: '08:15 PM', items: [{ id: 'm1', name: 'Butter Chicken', price: 280, quantity: 1, category: 'Main Course', isAvailable: true }, { id: 'm3', name: 'Garlic Naan', price: 50, quantity: 3, category: 'Breads', isAvailable: true }], subtotal: 430, gstAmount: 21.5, total: 451.5 },
];
