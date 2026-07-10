import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
];

export function GoogleTranslate() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Translate script is loaded
    const checkScript = setInterval(() => {
      if (window.google && window.google.translate) {
        setIsScriptLoaded(true);
        clearInterval(checkScript);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkScript), 10000);

    return () => clearInterval(checkScript);
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);

    if (!isScriptLoaded) {
      console.warn('Google Translate script not loaded yet');
      return;
    }

    // Trigger Google Translate
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change'));
    } else {
      // If widget doesn't exist, create a hidden one
      const div = document.createElement('div');
      div.id = 'google_translate_element_hidden';
      div.style.display = 'none';
      document.body.appendChild(div);

      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,te,kn,ml',
            autoDisplay: false,
          },
          div,
        );

        // Wait for widget to initialize, then trigger change
        setTimeout(() => {
          const hiddenSelect = div.querySelector('.goog-te-combo');
          if (hiddenSelect) {
            hiddenSelect.value = langCode;
            hiddenSelect.dispatchEvent(new Event('change'));
          }
        }, 500);
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    }
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="h-9 text-[--sidebar-fg] bg-white/5 border-white/15 hover:bg-white/10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
