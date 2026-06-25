import type { ElementType } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
  isVeg?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  billType: 'Dine-In' | 'Parcel';
  paymentType: 'UPI' | 'Cash' | 'Card';
  date: string;
  time: string;
  items: CartItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
}

export interface ReceiptConfig {
  showHotelName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showGst: boolean;
  alignHeader: 'left' | 'center' | 'right';
  showGreeting: boolean;
}

export interface Settings {
  id: number;
  hotelName: string;
  address: string;
  phone: string;
  gstNumber: string;
  gstPercentage: number;
  footerMessage: string;
  printFormat: 'thermal' | 'a4' | 'kot';
  billCounter: number;
  receiptConfig?: ReceiptConfig;
}

export interface User {
  username: string;
  role: 'Admin';
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type OrderData = Omit<Order, 'id' | 'billNumber' | 'date' | 'time'>;

export type StatColor = 'violet' | 'blue' | 'amber' | 'emerald';

export interface Stat {
  l: string;
  v: string | number;
  i: ElementType;
  c: StatColor;
  s: string;
}

export interface ChartData {
  day: string;
  total: number;
  isToday: boolean;
}

export interface TopSeller {
  id: string;
  qty: number;
  name: string;
  category: string;
}

export interface AppContextType {
  theme: string;
  toggleTheme: () => void;
  user: User | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  settings: Settings;
  updateSettings: (ns: Settings) => void;
  menu: MenuItem[];
  fetchMenu: () => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => void;
  orders: Order[];
  addOrder: (orderData: OrderData) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  currentReceiptOrder: Order | null;
  setCurrentReceiptOrder: (o: Order | null) => void;
  isReceiptOpen: boolean;
  setIsReceiptOpen: (v: boolean) => void;
}
