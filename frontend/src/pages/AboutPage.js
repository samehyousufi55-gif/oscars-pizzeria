import React from 'react';
import { Star, Award, Heart, MapPin, Phone, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LOGO_URL = "/oscars-pizzeria-logo.png";
const ABOUT_BG = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80";
const KITCHEN_IMG = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80";

export const AboutPage = () => {
  const { t, language } = useLanguage();

  const values = [
    { icon: Award, title: t('quality'), description: t('qualityDesc'), color: 'bg-gray-100 text-gray-800' },
    { icon: Star, title: t('fresh'), description: t('freshDesc'), color: 'bg-gray-100 text-gray-800' },
    { icon: Heart, title: t('local'), description: t('localDesc'), color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div data-testid="about-page" className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={ABOUT_BG} alt="Restaurant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 text-center">
          <img src={LOGO_URL} alt="Oscars Pizzeria" className="h-24 w-auto mx-auto mb-6 logo-transparent" />
          <h1 data-testid="about-title" className="font-heading text-4xl md:text-6xl text-white mb-4">
            {t('aboutTitle')}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1,2,3,4].map((i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 opacity-50" />
            </div>
            <span className="text-white/80">4.5 Google</span>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img src={KITCHEN_IMG} alt="Kitchen" className="rounded-2xl shadow-xl w-full" />
              <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 rounded-2xl shadow-lg hidden lg:block">
                <div className="text-3xl font-bold">4.5</div>
                <div className="text-sm opacity-80">Google Rating</div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900">{t('aboutSubtitle')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('aboutText1')}</p>
              <p className="text-gray-600 leading-relaxed">{t('aboutText2')}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('address')}</div>
                    <div className="font-medium text-gray-900">Holter, Jessheim</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{language === 'no' ? 'Telefon' : 'Phone'}</div>
                    <div className="font-medium text-gray-900">47 73 73 47</div>
                  </div>
                </div>
              </div>

              <a
                href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
                target="_blank" rel="noopener noreferrer" data-testid="about-order-btn"
                className="btn-primary inline-block mt-4"
              >
                {t('orderNow')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 md:px-8">
          <h2 data-testid="values-title" className="font-heading text-3xl text-gray-900 text-center mb-12">{t('ourValues')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} data-testid={`value-card-${index}`} className="bg-white rounded-2xl p-8 text-center card-shadow card-hover">
                <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-6`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl text-gray-900 mb-3">{language === 'no' ? 'Finn Oss' : 'Find Us'}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{language === 'no' ? 'Man–fre 13:00–22:00, lør–søn 12:00–22:00' : 'Mon–Fri 13:00–22:00, Sat–Sun 12:00–22:00'}</span>
            </div>
          </div>
          
          <div data-testid="map-embed" className="rounded-2xl overflow-hidden shadow-lg h-80">
            <iframe
              src="https://www.google.com/maps?q=Tulipanvegen+1,+2034+Holter,+Norway&z=17&output=embed"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Oscars Pizzeria - Tulipanvegen 1, 2034 Holter"
            />
          </div>
          <a href="https://www.google.com/maps/search/Tulipanvegen+1+2034+Holter" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-gray-600 hover:text-gray-900">
            <MapPin className="w-4 h-4" />
            <span>Tulipanvegen 1, 2034 Holter</span>
          </a>
        </div>
      </section>
    </div>
  );
};
