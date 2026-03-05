import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SITE_URL = 'https://www.oscarspizzeria.com';

const KNOWN_PATHS = ['/', '/menu', '/about', '/contact'];

const PAGE_SEO = {
  '/': {
    no: { title: 'Oscars Pizzeria | Pizza & Grill - Bestill online', description: 'Pizza og grill i Holter. Bestill online for henting eller levering. Tulipanvegen 1, 2034 Holter. Åpent man-fre 13:00-22:00.' },
    en: { title: 'Oscars Pizzeria | Pizza & Grill - Order online', description: 'Pizza and grill in Holter. Order online for pickup or delivery. Tulipanvegen 1, 2034 Holter. Open Mon-Fri 13:00-22:00.' },
  },
  '/menu': {
    no: { title: 'Meny | Oscars Pizzeria - Pizza, Burger, Kebab', description: 'Utforsk vår meny med pizza, burger, kebab og mer. Bestill enkelt online.' },
    en: { title: 'Menu | Oscars Pizzeria - Pizza, Burgers, Kebab', description: 'Explore our menu with pizza, burgers, kebab and more. Order easily online.' },
  },
  '/about': {
    no: { title: 'Om oss | Oscars Pizzeria', description: 'Lær oss bedre kjent. Oscars Pizzeria - Pizza og grill med kvalitet og hjerte.' },
    en: { title: 'About us | Oscars Pizzeria', description: 'Get to know us. Oscars Pizzeria - Pizza and grill with quality and heart.' },
  },
  '/contact': {
    no: { title: 'Kontakt | Oscars Pizzeria - Adresse, telefon', description: 'Kontakt Oscars Pizzeria. Tulipanvegen 1, 2034 Holter. Ring 47 73 73 47.' },
    en: { title: 'Contact | Oscars Pizzeria - Address, phone', description: 'Contact Oscars Pizzeria. Tulipanvegen 1, 2034 Holter. Call 47 73 73 47.' },
  },
  '404': {
    no: { title: 'Siden finnes ikke | Oscars Pizzeria', description: 'Siden du leter etter finnes ikke. Gå tilbake til forsiden.' },
    en: { title: 'Page not found | Oscars Pizzeria', description: 'The page you are looking for does not exist. Go back to the home page.' },
  },
};

function getSEO(pathname, language) {
  const is404 = !KNOWN_PATHS.includes(pathname);
  const seo = is404 ? PAGE_SEO['404'] : (PAGE_SEO[pathname] || PAGE_SEO['/']);
  return seo[language] || seo.no;
}

export function SEO() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { title, description } = getSEO(pathname, language);

  useEffect(() => {
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${pathname}`);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${SITE_URL}${pathname}`);
  }, [pathname, language, title, description]);

  return null;
}
