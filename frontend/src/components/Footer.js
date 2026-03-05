import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Facebook, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LOGO_URL = "/oscars-pizzeria-logo.png";

export const Footer = () => {
  const { t, language } = useLanguage();

  const openingHours = [
    { day: t('monday'), hours: '13:00 - 22:00' },
    { day: t('tuesday'), hours: '13:00 - 22:00' },
    { day: t('wednesday'), hours: '13:00 - 22:00' },
    { day: t('thursday'), hours: '13:00 - 22:00' },
    { day: t('friday'), hours: '13:00 - 22:00' },
    { day: t('saturday'), hours: '12:00 - 22:00' },
    { day: t('sunday'), hours: '12:00 - 22:00' },
  ];

  return (
    <footer data-testid="footer" className="footer-section">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={LOGO_URL} alt="Oscars Pizzeria" className="h-20 w-auto" />
            </Link>
            <p className="text-gray-400 text-sm">Pizza & Grill</p>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4].map((i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 opacity-50" />
              </div>
              <span className="text-gray-400 text-sm">4.5 Google</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{t('contact')}</h3>
            <div className="space-y-3">
              <a href="https://www.google.com/maps/search/Tulipanvegen+1+2034+Holter" target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Tulipanvegen 1<br/>2034 Holter</span>
              </a>
              <a href="tel:+4747737347" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+47 47 73 73 47</span>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61567373073607" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Facebook className="w-5 h-5 flex-shrink-0" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('openingHours')}
            </h3>
            <div className="space-y-2">
              {openingHours.slice(0, 4).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.day}</span>
                  <span className="text-gray-300">{item.hours}</span>
                </div>
              ))}
              <div className="text-sm text-gray-400 pt-1">
                {language === 'no' ? 'Lør–søn 12:00–22:00, man–fre 13:00–22:00' : 'Sat–Sun 12:00–22:00, Mon–Fri 13:00–22:00'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{language === 'no' ? 'Sider' : 'Pages'}</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white text-sm transition-colors">{t('home')}</Link>
              <Link to="/menu" className="block text-gray-400 hover:text-white text-sm transition-colors">{t('menu')}</Link>
              <Link to="/about" className="block text-gray-400 hover:text-white text-sm transition-colors">{t('about')}</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white text-sm transition-colors">{t('contact')}</Link>
            </div>
            
            <a
              href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              {t('orderNow')}
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Oscars Pizzeria. {language === 'no' ? 'Utvikling og design levert av Side kraft AS' : 'Development and design by Side kraft AS'}
          </p>
        </div>
      </div>
    </footer>
  );
};
