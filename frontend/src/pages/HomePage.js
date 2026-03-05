import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { API } from '../config/api';

const LOGO_URL = "/oscars-pizzeria-logo.png";
const HERO_BG = "/hero-food-bg.png";
const BURGER_IMG = "/category-burger.png";
const PIZZA_IMG = "/category-pizza.png";
const KEBAB_IMG = "/category-kebab.png";

const categories = [
  { name: 'Burger', name_en: 'Burger', image: BURGER_IMG },
  { name: 'Pizza', name_en: 'Pizza', image: PIZZA_IMG },
  { name: 'Kebab', name_en: 'Kebab', image: KEBAB_IMG },
];

export const HomePage = () => {
  const { t, language } = useLanguage();
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API}/menu`);
        const data = response?.data;
        setMenu(Array.isArray(data) ? data : []);
      } catch {
        setMenu([]);
      }
    };
    fetchMenu();
  }, []);

  const menuArray = Array.isArray(menu) ? menu : [];
  const popularItems = menuArray.length > 0
    ? [
        menuArray.find(c => c.name === 'Pizza')?.items?.[0],
        menuArray.find(c => c.name === 'Burger')?.items?.[0],
        menuArray.find(c => c.name === 'Calzone')?.items?.[0],
      ].filter(Boolean)
    : [];

  return (
    <div data-testid="home-page" className="min-h-screen bg-[#FAFAF8]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Pizza" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-8 py-32">
          <div className="max-w-2xl">
            {/* Logo in Hero */}
            <div className="mb-8 opacity-0 animate-fade-in">
              <img src={LOGO_URL} alt="Oscars Pizzeria" className="h-24 md:h-32 w-auto" />
            </div>

            <div className="flex items-center gap-2 mb-4 opacity-0 animate-fade-in animation-delay-100">
              <div className="flex">
                {[1,2,3,4].map((i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 opacity-50" />
              </div>
              <span className="text-white/80 text-sm font-medium">4.5 Google Rating</span>
            </div>
            
            <p className="text-white/70 text-lg mb-8 max-w-md opacity-0 animate-fade-in animation-delay-200">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in animation-delay-300">
              <a
                href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-order-btn"
                className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-[#ff3131] hover:text-white transition-colors inline-flex items-center justify-center gap-2"
              >
                {t('orderNow')}
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/menu"
                data-testid="hero-view-menu-btn"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all text-center"
              >
                {t('viewMenu')}
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-12 opacity-0 animate-fade-in animation-delay-300">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Holter, Jessheim</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>{language === 'no' ? 'Man–Fre 13:00–22:00' : 'Mon–Fri 13:00–22:00'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Phone className="w-4 h-4" />
                <span>47 73 73 47</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-3">
              {language === 'no' ? 'Utforsk Menyen' : 'Explore Menu'}
            </h2>
            <p className="text-gray-500">{language === 'no' ? 'Noe for enhver smak' : 'Something for everyone'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <Link
                key={index}
                to="/menu"
                data-testid={`category-card-${index}`}
                className="group relative h-80 rounded-2xl overflow-hidden card-hover"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                  <span className="text-white/80 flex items-center gap-1 text-sm">
                    {t('viewMenu')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section className="py-20 bg-[#FAFAF8]">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-3">
                {language === 'no' ? 'Populære Retter' : 'Popular Dishes'}
              </h2>
              <p className="text-gray-500">{language === 'no' ? 'Våre mest bestilte' : 'Our most ordered'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularItems.map((item, index) => (
                <div key={index} data-testid={`popular-item-${index}`} className="bg-white rounded-2xl p-6 card-shadow card-hover">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-heading text-xl text-gray-900">{item.name}</h3>
                    <span className="price-tag text-lg">{item.sizes ? `fra ${Math.min(...item.sizes.map(s => s.price))}` : item.price} kr</span>
                  </div>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link to="/menu" data-testid="see-full-menu-btn" className="btn-outline inline-flex items-center gap-2">
                {language === 'no' ? 'Se hele menyen' : 'See full menu'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-5xl text-white mb-4">
            {language === 'no' ? 'Sulten?' : 'Hungry?'}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
            {language === 'no' ? 'Bestill nå for henting eller levering' : 'Order now for pickup or delivery'}
          </p>
          <a
            href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="cta-order-btn"
            className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-[#ff3131] hover:text-white transition-colors"
          >
            {t('orderNow')}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
};
