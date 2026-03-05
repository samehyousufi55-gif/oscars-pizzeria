import React, { useState } from 'react';
import { MapPin, Phone, Clock, Send, Star, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../config/api';

export const ContactPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) { }

      if (!response.ok) {
        throw new Error(data.error || t('messageError'));
      }

      toast.success(t('messageSent'));
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.message || t('messageError'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div data-testid="contact-page" className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 data-testid="contact-title" className="font-heading text-4xl md:text-5xl text-gray-900 mb-3">
            {t('contactTitle')}
          </h1>
          <p className="text-gray-500">{t('contactSubtitle')}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1, 2, 3, 4].map((i) => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 opacity-50" />
            </div>
            <span className="font-bold text-gray-900">4.5</span>
            <span className="text-gray-500">Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourName')} *</label>
                <Input type="text" name="name" value={formData.name} onChange={handleChange} required
                  data-testid="contact-name-input"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800"
                  placeholder={t('yourName')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourEmail')} *</label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} required
                  data-testid="contact-email-input"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800"
                  placeholder="epost@eksempel.no" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourPhone')} *</label>
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  data-testid="contact-phone-input"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800"
                  placeholder="+47 XXX XX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourMessage')} *</label>
                <Textarea name="message" value={formData.message} onChange={handleChange} required rows={4}
                  data-testid="contact-message-input"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 resize-none"
                  placeholder={t('yourMessage')} />
              </div>
              <button type="submit" disabled={isSubmitting} data-testid="contact-submit-btn"
                className="btn-primary w-full flex items-center justify-center gap-2">
                {isSubmitting ? <span className="animate-pulse">{language === 'no' ? 'Sender...' : 'Sending...'}</span>
                  : <><Send className="w-5 h-5" />{t('sendMessage')}</>}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="https://www.google.com/maps/search/Tulipanvegen+1+2034+Holter" target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 card-shadow card-hover">
                <MapPin className="w-8 h-8 text-gray-800 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{t('address')}</h3>
                <p className="text-gray-500 text-sm">Tulipanvegen 1<br />2034 Holter</p>
              </a>
              <a href="tel:+4747737347" className="bg-white rounded-2xl p-6 card-shadow card-hover">
                <Phone className="w-8 h-8 text-gray-800 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{language === 'no' ? 'Telefon' : 'Phone'}</h3>
                <p className="text-gray-500 text-sm">+47 47 73 73 47</p>
              </a>
              <a href="https://www.facebook.com/oscarspizzeria.no" target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 card-shadow card-hover">
                <Facebook className="w-8 h-8 text-gray-800 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Facebook</h3>
                <p className="text-gray-500 text-sm">{language === 'no' ? 'Følg oss' : 'Follow us'}</p>
              </a>
              <a href="https://www.instagram.com/oscarspizzeria" target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 card-shadow card-hover">
                <Instagram className="w-8 h-8 text-gray-800 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Instagram</h3>
                <p className="text-gray-500 text-sm">{language === 'no' ? 'Følg oss' : 'Follow us'}</p>
              </a>
              <a href="https://www.tiktok.com/@oscars.pizzeria" target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 card-shadow card-hover">
                <span className="text-3xl">♪</span>
                <h3 className="font-semibold text-gray-900 mb-1">TikTok</h3>
                <p className="text-gray-500 text-sm">{language === 'no' ? 'Følg oss' : 'Follow us'}</p>
              </a>
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <Clock className="w-8 h-8 text-gray-800 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{t('openingHours')}</h3>
                <p className="text-gray-500 text-sm">{language === 'no' ? 'Man–fre 13:00–22:00, lør–søn 12:00–22:00' : 'Mon–Fri 13:00–22:00, Sat–Sun 12:00–22:00'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-800" /> {t('openingHours')}
              </h3>
              <div className="space-y-2">
                {openingHours.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.day}</span>
                    <span className="font-medium text-gray-900">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg h-64">
              <iframe
                src="https://www.google.com/maps?q=Tulipanvegen+1,+2034+Holter,+Norway&z=17&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Location" data-testid="google-map-embed"
              />
            </div>

            <div className="bg-black rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{language === 'no' ? 'Bestill Online' : 'Order Online'}</h3>
              <p className="text-white/70 text-sm mb-4">{language === 'no' ? 'Rask og enkel bestilling' : 'Quick and easy ordering'}</p>
              <a
                href="https://order.ninito.com/no/group/oscars-pizzeria/holter"
                target="_blank" rel="noopener noreferrer" data-testid="contact-order-btn"
                className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                {t('orderNow')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
