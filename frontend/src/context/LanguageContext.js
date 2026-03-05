import React, { createContext, useContext, useState } from 'react';

const translations = {
  no: {
    home: 'Hjem',
    menu: 'Meny',
    about: 'Om oss',
    contact: 'Kontakt',
    heroTitle: 'Oscars Pizzeria',
    heroSubtitle: 'Pizza og Grill',
    heroDescription: 'Opplev smaken av ekte italiensk pizza og deilig grillmat laget med kjærlighet og ferske ingredienser.',
    viewMenu: 'Se meny',
    orderNow: 'Bestill nå',
    aboutTitle: 'Om Oss',
    aboutSubtitle: 'Vår Historie',
    aboutText1: 'Oscars Pizzeria har servert den beste pizzaen, burgere og kebab siden vi åpnet dørene.',
    aboutText2: 'Vårt lidenskapelige team jobber hardt hver dag for å gi deg en uforglemmelig matopplevelse.',
    ourValues: 'Våre Verdier',
    quality: 'Kvalitet',
    qualityDesc: 'Kun de beste ingrediensene',
    fresh: 'Fersk',
    freshDesc: 'Laget fersk hver dag',
    local: 'Lokalt',
    localDesc: 'Stolt lokal bedrift',
    contactTitle: 'Kontakt Oss',
    contactSubtitle: 'Vi vil gjerne høre fra deg',
    yourName: 'Ditt navn',
    yourEmail: 'Din e-post',
    yourPhone: 'Ditt telefonnummer',
    yourMessage: 'Din melding',
    sendMessage: 'Send melding',
    messageSent: 'Melding sendt!',
    messageError: 'Noe gikk galt. Prøv igjen.',
    openingHours: 'Åpningstider',
    monday: 'Mandag',
    tuesday: 'Tirsdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lørdag',
    sunday: 'Søndag',
    address: 'Adresse',
    notFoundTitle: 'Siden finnes ikke',
    notFoundDescription: 'Adressen du prøvde å åpne eksisterer ikke.',
    notFoundGoHome: 'Til forsiden',
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    about: 'About',
    contact: 'Contact',
    heroTitle: 'Oscars Pizzeria',
    heroSubtitle: 'Pizza & Grill',
    heroDescription: 'Experience the taste of authentic Italian pizza and delicious grilled food made with love and fresh ingredients.',
    viewMenu: 'View Menu',
    orderNow: 'Order Now',
    aboutTitle: 'About Us',
    aboutSubtitle: 'Our Story',
    aboutText1: 'Oscars Pizzeria has been serving the best pizza, burgers, and kebab since we opened our doors.',
    aboutText2: 'Our passionate team works hard every day to give you an unforgettable dining experience.',
    ourValues: 'Our Values',
    quality: 'Quality',
    qualityDesc: 'Only the finest ingredients',
    fresh: 'Fresh',
    freshDesc: 'Made fresh every day',
    local: 'Local',
    localDesc: 'Proud local business',
    contactTitle: 'Contact Us',
    contactSubtitle: 'We would love to hear from you',
    yourName: 'Your name',
    yourEmail: 'Your email',
    yourPhone: 'Your phone',
    yourMessage: 'Your message',
    sendMessage: 'Send Message',
    messageSent: 'Message sent!',
    messageError: 'Something went wrong. Please try again.',
    openingHours: 'Opening Hours',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    address: 'Address',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The address you tried to open does not exist.',
    notFoundGoHome: 'Go to home page',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('no');
  const t = (key) => translations[language][key] || key;
  const toggleLanguage = () => setLanguage((prev) => (prev === 'no' ? 'en' : 'no'));

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
