
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { TranslationDict, getTranslation, Language } from '../../pages/Settings/LanguageSettings';

interface OutreachHeaderProps {
  language: Language;
}

export const OutreachHeader: React.FC<OutreachHeaderProps> = ({ language }) => {
  // Function to translate based on current language
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  return (
    <div className="text-center mb-12">
      <div className="inline-block mb-4">
        <div className="relative inline-flex items-center justify-center p-3 bg-primary/10 rounded-full animate-pulse">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 animate-fade-in">
        {t('comingSoon')}
      </h1>
      
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="h-px w-8 bg-primary/40"></span>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90 inline-flex items-center">
          {t('outreachFeature')} <Bot className="ml-2 w-6 h-6 text-primary animate-bounce" />
        </h2>
        <span className="h-px w-8 bg-primary/40"></span>
      </div>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
        {t('description')}
      </p>
    </div>
  );
};
