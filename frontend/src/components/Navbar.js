import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LOGO_URL = "/oscars-pizzeria-logo.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/menu', label: t('menu') },
    { path: '/about', label: t('about') },
    { path: '/contact', label: t('contact') },
  ];

  const isActive = (path) => location.pathname === path;

  const isHome = location.pathname === '/';
  const forceDarkText = !isHome;
  const navbarBgClass = scrolled || forceDarkText ? 'navbar-glass shadow-sm bg-white' : 'bg-transparent';

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBgClass}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" data-testid="logo-link" className="flex items-center">
            <img
              src={LOGO_URL}
              alt="Oscars Pizzeria"
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden sm:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${isActive(link.path)
                    ? (scrolled || forceDarkText) ? 'text-black' : 'text-white'
                    : (scrolled || forceDarkText) ? 'text-gray-600 hover:text-black' : 'text-white/80 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <a
              href="tel:+4747737347"
              className={`flex items-center gap-2 text-sm font-medium ${(scrolled || forceDarkText) ? 'text-gray-700' : 'text-white'}`}
            >
              <Phone className="w-4 h-4" />
              47 73 73 47
            </a>

            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${(scrolled || forceDarkText)
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              <Globe className="w-4 h-4" />
              {language.toUpperCase()}
            </button>

            <a
              href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-3 px-6"
            >
              {t('orderNow')}
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-button"
            className={`sm:hidden p-2 ${(scrolled || forceDarkText) ? 'text-gray-700' : 'text-white'}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div data-testid="mobile-menu" className="sm:hidden absolute top-full left-0 right-0 z-50 bg-white shadow-xl border-t">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                  className={`py-3 px-4 rounded-xl text-lg font-medium ${isActive(link.path) ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  {language.toUpperCase()}
                </button>

                <a
                  href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center text-sm py-3"
                >
                  {t('orderNow')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
