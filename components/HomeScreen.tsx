import React, { useState } from 'react';
import { Globe, Play } from 'lucide-react';
import { Lang, Difficulty } from '../types';
import { ICONS, TRANSLATIONS } from '../constants';
import IconGrid from './IconGrid';

interface HomeScreenProps {
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
  onStartGame: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ lang, onLanguageChange, onStartGame }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 text-gray-800">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-3xl">🎨</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>
        <button
          onClick={() => onLanguageChange(lang === 'EN' ? 'ES' : 'EN')}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition shadow-sm"
        >
          <Globe size={16} />
          {lang}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 pb-8">
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8 text-center">
          {t.subtitle}
        </p>

        {/* Icon Grid Preview */}
        <div className="mb-8 opacity-90 scale-90">
          <IconGrid 
            icons={ICONS} 
            selectedIcons={[]} 
            disabled={true}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="
            px-12 py-4 bg-gradient-to-r from-orange-600 to-amber-600
            rounded-full font-bold text-lg shadow-2xl text-white
            hover:from-orange-500 hover:to-amber-500
            transform hover:scale-105 transition-all duration-200
            flex items-center gap-3
          "
        >
          <Play size={24} />
          {t.startGame}
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;