import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { API } from '../config/api';
import { ORDER_LINKS } from '../config/orderLinks';

export const MenuPage = () => {
  const { t, language } = useLanguage();
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API}/menu`);
        setMenu(response.data || []);
      } catch {
        setMenu([]);
      }
    };
    fetchMenu();
  }, []);

  const categories = menu.map((c) => ({
    name: language === 'no' ? c.name : (c.name_en || c.name),
    key: c.name,
  }));

  const filteredMenu = activeCategory === 'all' ? menu : menu.filter((c) => c.name === activeCategory);

  return (
    <div data-testid="menu-page" className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-gray-900 mb-3">
            {language === 'no' ? 'Vår Meny' : 'Our Menu'}
          </h1>
          <p className="text-gray-500">{language === 'no' ? 'Utforsk vårt utvalg' : 'Explore our selection'}</p>
        </div>

        {menu.length > 0 && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12 scrollbar-hide overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            >
              {t('menu')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {menu.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl card-shadow">
            <p className="text-gray-500 mb-6">
              {language === 'no' ? 'Menyen lastes fra bestillingstjenesten.' : 'Menu loads from ordering service.'}
            </p>
            <a
              href={ORDER_LINKS.ninito}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              {t('orderNow')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredMenu.map((category) => (
              <section key={category.name} className="bg-white rounded-2xl card-shadow p-6 md:p-8">
                <h2 className="font-heading text-2xl md:text-3xl text-gray-900 mb-6">
                  {language === 'no' ? category.name : (category.name_en || category.name)}
                </h2>
                <div className="space-y-4">
                  {(category.items || []).map((item, i) => (
                    <div key={i} className="menu-card flex justify-between items-start border-b border-gray-100 pb-4 last:border-0">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                      </div>
                      <span className="price-tag text-lg ml-4">
                        {item.sizes ? `fra ${Math.min(...item.sizes.map((s) => s.price))}` : item.price} kr
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href={ORDER_LINKS.ninito}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            {t('orderNow')}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};
