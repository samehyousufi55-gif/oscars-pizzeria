import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-heading text-6xl text-gray-900 mb-4">404</h1>
        <h2 className="text-xl text-gray-700 mb-4">{t('notFoundTitle')}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('notFoundDescription')}</p>
        <Link to="/" className="btn-primary inline-block">
          {t('notFoundGoHome')}
        </Link>
      </div>
    </div>
  );
};
