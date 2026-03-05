import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ORDER_LINKS } from '../config/orderLinks';
import menuData from '../data/menu.json';

export const MenuPage = () => {
  const { t, language } = useLanguage();
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setMenu(Array.isArray(menuData) ? menuData : []);
  }, []);

  const menuArray = Array.isArray(menu) ? menu : [];
  const categories = menuArray.map((c) => ({
    name: language === 'no' ? c.name : (c.name_en || c.name),
    key: c.name,
  }));

  // Fjernet gammel filtrering slik at kunden alltid ser *hele* menyen!
  const filteredMenu = menuArray;

  return (
    <div data-testid="menu-page" className="min-h-screen bg-[#FAFAF8] pt-24 pb-20 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-gray-900 mb-3">
            {language === 'no' ? 'Vår Meny' : 'Our Menu'}
          </h1>
          <p className="text-gray-500">{language === 'no' ? 'Utforsk vårt utvalg' : 'Explore our selection'}</p>
        </div>

        {menuArray.length > 0 && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12 scrollbar-hide overflow-x-auto pb-2">
            <button
              onClick={() => {
                setActiveCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            >
              {t('menu')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  const el = document.getElementById(`category-${cat.key}`);
                  if (el) {
                    const yOffset = -120;
                    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {menuArray.length === 0 ? (
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
            {filteredMenu?.map((category) => (
              <section key={category.name} id={`category-${category.name}`} className="bg-white rounded-2xl card-shadow p-6 md:p-8">
                {category.image && (
                  <img src={category.image} alt={category.name} className="w-full h-48 md:h-64 object-cover rounded-xl mb-6 shadow-sm" />
                )}
                <h2 className="font-heading text-2xl md:text-3xl text-gray-900 mb-6">
                  {language === 'no' ? category.name : (category.name_en || category.name)}
                </h2>
                <div className="space-y-2">
                  {(category.items || []).map((item, i) => (
                    <div
                      key={i}
                      className={`menu-card flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-4 last:border-0 p-2 md:p-4 rounded-xl transition-all duration-200 ${item.sizes ? 'cursor-pointer hover:bg-orange-50/50 hover:shadow-sm group' : ''}`}
                      onClick={() => item.sizes ? setSelectedItem(item) : null}
                    >
                      <div className="flex gap-4 md:gap-6 items-start w-full">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl flex-shrink-0 shadow-sm" />
                        )}
                        <div className="flex-1 pr-4">
                          <h3 className={`font-semibold text-gray-900 ${item.sizes ? 'group-hover:text-orange-600 transition-colors' : ''}`}>
                            {item.name}
                          </h3>
                          {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}

                          {item.sizes && (
                            <span className="inline-block mt-2 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                              Flere størrelser tilgjengelig
                            </span>
                          )}
                        </div>
                        <span className="price-tag text-lg font-bold text-gray-900 whitespace-nowrap mt-1 self-start">
                          {item.sizes ? `fra ${Math.min(...item.sizes.map((s) => s.price))} kr` : `${item.price} kr`}
                        </span>
                      </div>
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

      {/* STØRRELSES-MODAL (Vindu) */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-heading text-2xl text-gray-900">{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Lukk"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {selectedItem.description && (
                <p className="text-gray-600 mb-6 italic">{selectedItem.description}</p>
              )}

              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Velg størrelse:</h4>

              <div className="space-y-3">
                {selectedItem.sizes?.map((size, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-xl hover:border-orange-500 hover:bg-orange-50/20 transition-all cursor-pointer group"
                    onClick={() => {
                      window.open(ORDER_LINKS.ninito, '_blank');
                    }}
                  >
                    <span className="font-medium text-gray-800 group-hover:text-orange-700">{size.name}</span>
                    <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">{size.price} kr</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 text-gray-500 hover:text-gray-800 font-medium transition-colors"
                >
                  Lukk vindu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
