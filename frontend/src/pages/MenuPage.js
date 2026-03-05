import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRight,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUp
} from 'lucide-react';
import { ORDER_LINKS } from '../config/orderLinks';
import menuData from '../data/menu.json';

const CATEGORY_IMAGES = {
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200',
  'Calzone': 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&q=80&w=200',
  'Kebab Tallerken': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=80&w=200',
  'Kebab Pita': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200',
  'Kebab Rull': 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=200',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200',
  'Burgermeny': 'https://images.unsplash.com/photo-1594212691516-436fba2ba008?auto=format&fit=crop&q=80&w=200',
  'Pommes frites': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=200',
  'Salat': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200',
  'Dipper': 'https://images.unsplash.com/photo-1472476449509-f9f30b2c1240?auto=format&fit=crop&q=80&w=200',
  'Barnemeny': 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&q=80&w=200',
  'Drikke 0,5 l': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=200',
  'Drikke 1,5 L': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200',
  'Energidrikker': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=200',
  'default': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=200'
};

const getCategoryImg = (catName) => {
  return CATEGORY_IMAGES[catName] || CATEGORY_IMAGES['default'];
};

export const MenuPage = () => {
  const { t, language } = useLanguage();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Simulere en kort loading for visuell effekt av spinneren
    const timer = setTimeout(() => {
      setMenu(Array.isArray(menuData) ? menuData : []);
      setLoading(false);
    }, 400);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuArray = Array.isArray(menu) ? menu : [];
  const categories = menuArray.map((c) => ({
    name: language === 'no' ? c.name : (c.name_en || c.name),
    key: c.name,
  }));

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  // 1. Filtrer menyen basert på søk
  const searchProcessedMenu = menuArray.map(c => {
    if (!searchQuery) return c;
    const filteredItems = c.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...c, items: filteredItems };
  }).filter(c => c.items.length > 0);

  // 2. Filtrer menyen basert på valgt kategori fra meny-pillene
  const finalMenu = activeCategory === 'all'
    ? searchProcessedMenu
    : searchProcessedMenu.filter(c => c.name === activeCategory);

  return (
    <div data-testid="menu-page" className="min-h-screen bg-[#FAFAF8] pt-28 pb-24 relative font-sans text-gray-900">

      {/* 1. Header Seksjon */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            {language === 'no' ? 'Vår Meny' : 'Our Menu'}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            {language === 'no'
              ? 'Utforsk vårt store utvalg av ferske, nylagede retter.'
              : 'Explore our wide selection of fresh, made-to-order dishes.'}
          </p>
        </div>

        {/* 2. Søkefelt */}
        <div className="max-w-md mx-auto mb-10 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent transition-all"
            placeholder={language === 'no' ? 'Søk etter retter eller ingredienser...' : 'Search for dishes or ingredients...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* 3. Kategorifilter */}
            {menuArray.length > 0 && categories.length > 1 && (
              <div className="sticky top-[80px] z-40 bg-[#FAFAF8]/95 backdrop-blur-md pb-4 pt-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100">
                <div className="relative flex items-center max-w-full">
                  <button
                    onClick={scrollLeft}
                    className="hidden md:flex absolute -left-4 z-10 w-10 h-10 bg-white rounded-full shadow-md items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto scrollbar-hide py-2 px-1 gap-3 mx-auto w-full snap-x"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors border snap-start shrink-0 ${activeCategory === 'all'
                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                        }`}
                    >
                      {t('menu')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors border snap-start shrink-0 ${activeCategory === cat.key
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={scrollRight}
                    className="hidden md:flex absolute -right-4 z-10 w-10 h-10 bg-white rounded-full shadow-md items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Innhold / Meny Seksjoner */}
            {finalMenu.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-6 text-lg">
                  {searchQuery
                    ? (language === 'no' ? 'Ingen treff for søket ditt.' : 'No results found for your search.')
                    : (language === 'no' ? 'Menyen lastes fra bestillingstjenesten.' : 'Menu loads from ordering service.')}
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                {finalMenu.map((category) => (
                  <section key={category.name} id={`category-${category.name}`} className="scroll-mt-32">

                    {/* 4. Kategori-header */}
                    <div className="flex items-center gap-5 mb-8">
                      <img
                        src={getCategoryImg(category.name)}
                        alt={category.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm bg-gray-100"
                      />
                      <div>
                        <h2 className="font-heading text-2xl md:text-3xl text-gray-900 leading-tight">
                          {language === 'no' ? category.name : (category.name_en || category.name)}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{category.items.length} {language === 'no' ? 'retter' : 'dishes'}</p>
                      </div>
                    </div>

                    {/* Retter i Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {category.items.map((item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between group cursor-pointer border border-gray-50"
                          onClick={() => setSelectedItem(item)}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2 gap-4">
                              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#1a1a1a] transition-colors leading-tight">
                                {item.name}
                              </h3>
                              <span className="font-semibold text-gray-900 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg text-base">
                                {item.sizes ? `fra ${Math.min(...item.sizes.map((s) => s.price))} kr` : `${item.price} kr`}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-3">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {item.sizes && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                                Flere størrelser
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* 6. Bestill-CTA nederst */}
            {finalMenu.length > 0 && (
              <div className="mt-20 flex justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full text-center shadow-lg border border-gray-50">
                  <h3 className="font-heading text-2xl text-gray-900 mb-3">Sulten?</h3>
                  <p className="text-gray-500 mb-6">Bestill direkte via Ninito for den raskeste og beste opplevelsen.</p>
                  <a
                    href={ORDER_LINKS.ninito}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full font-medium hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg"
                  >
                    {t('orderNow')}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 7. Dialog / Modal for rettdetaljer */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white sticky top-0 z-10">
              <div className="pr-4">
                <h3 className="font-heading text-2xl text-[#1a1a1a] leading-tight mb-2">{selectedItem.name}</h3>
                {!selectedItem.sizes && (
                  <span className="font-semibold text-gray-900 text-lg">{selectedItem.price} kr</span>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                aria-label="Lukk"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              {selectedItem.description && (
                <p className="text-gray-600 mb-8 leading-relaxed">{selectedItem.description}</p>
              )}

              {selectedItem.sizes && selectedItem.sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Velg størrelse</h4>
                  <div className="space-y-3">
                    {selectedItem.sizes.map((size, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-[#1a1a1a] hover:bg-gray-50 transition-all cursor-pointer group"
                        onClick={() => window.open(ORDER_LINKS.ninito, '_blank')}
                      >
                        <span className="font-medium text-gray-800 group-hover:text-black">{size.name}</span>
                        <span className="font-semibold text-gray-900 bg-white border border-gray-100 px-3 py-1 rounded-lg">
                          {size.price} kr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Call to action */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
              <button
                onClick={() => window.open(ORDER_LINKS.ninito, '_blank')}
                className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-xl font-medium hover:bg-black transition-colors flex justify-center items-center gap-2 text-lg"
              >
                Gå til bestilling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Scroll til topp knapp */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] p-4 bg-[#1a1a1a] text-white rounded-full shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
          }`}
        aria-label="Scroll til topp"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

    </div>
  );
};
