'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Seçilen dili <html lang> etiketine yazar. Büyük harf dönüşümü dile göre yapılır:
 * Türkçede i → İ, İngilizcede i → I. Böylece "FİLMS" gibi hatalar oluşmaz.
 */
export default function HtmlLang() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return null;
}
