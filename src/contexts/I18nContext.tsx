import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'ta';

type Dictionary = {
  [key in Language]: {
    [key: string]: string;
  };
};

const dictionary: Dictionary = {
  en: {
    'login.title': 'Hotel Vetri Vel',
    'login.subtitle': 'Sign in to open your register',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.signin': 'Sign In',
    'login.signingin': 'Signing in...',
    'login.forgot': 'Forgot password?',
    'nav.terminal': 'Terminal',
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.menu': 'Menu Master',
    'nav.settings': 'Settings',
    'header.signedin': 'Logged in as',
    'header.signout': 'Sign Out',
    'pos.title': 'Point of Sale',
    'pos.subtitle': 'Tap items to build the ticket',
    'pos.search': 'Search menu...',
    'pos.current_order': 'Current Order',
    'pos.clear': 'Clear Ticket',
    'pos.subtotal': 'Subtotal',
    'pos.tax': 'Tax',
    'pos.total': 'Total',
    'pos.checkout': 'Checkout',
  },
  es: {
    'login.title': 'Hotel Vetri Vel',
    'login.subtitle': 'Inicie sesión para abrir su caja',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.signin': 'Iniciar Sesión',
    'login.signingin': 'Iniciando sesión...',
    'login.forgot': '¿Olvidó su contraseña?',
    'nav.terminal': 'Terminal',
    'nav.dashboard': 'Panel',
    'nav.transactions': 'Transacciones',
    'nav.menu': 'Menú',
    'nav.settings': 'Ajustes',
    'header.signedin': 'Conectado como',
    'header.signout': 'Cerrar Sesión',
    'pos.title': 'Punto de Venta',
    'pos.subtitle': 'Toque los elementos para armar el ticket',
    'pos.search': 'Buscar menú...',
    'pos.current_order': 'Orden Actual',
    'pos.clear': 'Borrar Ticket',
    'pos.subtotal': 'Subtotal',
    'pos.tax': 'Impuesto',
    'pos.total': 'Total',
    'pos.checkout': 'Cobrar',
  },
  fr: {
    'login.title': 'Hotel Vetri Vel',
    'login.subtitle': 'Connectez-vous pour ouvrir la caisse',
    'login.username': 'Nom d\'utilisateur',
    'login.password': 'Mot de passe',
    'login.signin': 'Se Connecter',
    'login.signingin': 'Connexion...',
    'login.forgot': 'Mot de passe oublié?',
    'nav.terminal': 'Terminal',
    'nav.dashboard': 'Tableau de bord',
    'nav.transactions': 'Transactions',
    'nav.menu': 'Menu Principal',
    'nav.settings': 'Paramètres',
    'header.signedin': 'Connecté en tant que',
    'header.signout': 'Se Déconnecter',
    'pos.title': 'Point de Vente',
    'pos.subtitle': 'Touchez les éléments pour créer le ticket',
    'pos.search': 'Rechercher...',
    'pos.current_order': 'Commande Actuelle',
    'pos.clear': 'Effacer',
    'pos.subtotal': 'Sous-total',
    'pos.tax': 'Taxe',
    'pos.total': 'Total',
    'pos.checkout': 'Payer',
  },
  ta: {
    'login.title': 'Hotel Vetri Vel',
    'login.subtitle': 'உங்கள் கணக்கைத் திறக்க உள்நுழையவும்',
    'login.username': 'பயனர்பெயர்',
    'login.password': 'கடவுச்சொல்',
    'login.signin': 'உள்நுழைக',
    'login.signingin': 'உள்நுழைகிறது...',
    'login.forgot': 'கடவுச்சொல் மறந்துவிட்டதா?',
    'nav.terminal': 'பணவீடு',
    'nav.dashboard': 'முகப்பு',
    'nav.transactions': 'பரிவர்த்தனைகள்',
    'nav.menu': 'மெனு மாஸ்டர்',
    'nav.settings': 'அமைப்புகள்',
    'header.signedin': 'உள்நுழைந்துள்ளவர்',
    'header.signout': 'வெளியேறு',
    'pos.title': 'விற்பனை மையம்',
    'pos.subtitle': 'பட்டியலை உருவாக்க பொருட்களைத் தேர்ந்தெடுக்கவும்',
    'pos.search': 'தேடுக...',
    'pos.current_order': 'தற்போதைய ஆணை',
    'pos.clear': 'பட்டியலை அழி',
    'pos.subtotal': 'கூடுதல்',
    'pos.tax': 'வரி',
    'pos.total': 'மொத்தம்',
    'pos.checkout': 'பணம் செலுத்து',
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('shbs_lang') as Language;
    if (saved && Object.keys(dictionary).includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('shbs_lang', lang);
  };

  const t = (key: string): string => {
    return dictionary[language]?.[key] || dictionary['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
