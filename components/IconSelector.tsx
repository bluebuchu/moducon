import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Icon, Lang, Difficulty } from '../types';
import { TRANSLATIONS } from '../constants';
import IconGrid from './IconGrid';

interface IconSelectorProps {
  icons: Icon[];
  selectedIcons: number[];
  currentSelectionStep: number;
  difficulty: Difficulty;
  lang: Lang;
  onIconSelect: (iconId: number) => void;
  onBack: () => void;
  onStartPuzzles: () => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  icons,
  selectedIcons,
  currentSelectionStep,
  difficulty,
  lang,
  onIconSelect,
  onBack,
  onStartPuzzles,
}) => {
  const t = TRANSLATIONS[lang];
  const maxSelections = 3;
  const isComplete = selectedIcons.length === maxSelections;

  const difficultyColors = {
    easy: 'from-green-600 to-emerald-600',
    normal: 'from-blue-600 to-cyan-600',
    hard: 'from-red-600 to-orange-600',
  };

  const difficultyEmojis = {
    easy: '🌱',
    normal: '⚡',
    hard: '🔥',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Header */}
      <header className="p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{t.iconSelection}</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full bg-gradient-to-r ${difficultyColors[difficulty]} text-sm`}>
              <span>{difficultyEmojis[difficulty]}</span>
              <span>{t[difficulty]}</span>
            </div>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              {t.selectIconPrompt} {currentSelectionStep + 1}
            </span>
            <span className="text-sm text-slate-400">
              {selectedIcons.length}/{maxSelections} {t.iconsSelected}
            </span>
          </div>
          
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(selectedIcons.length / maxSelections) * 100}%` }}
            />
          </div>
          
          {/* Selection Steps Indicator */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  step <= selectedIcons.length ? 'text-indigo-400' : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                    step <= selectedIcons.length
                      ? 'bg-indigo-500 border-indigo-400 text-white'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm hidden sm:inline">
                  {t.puzzle} {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="px-4 pb-24">
        <IconGrid
          icons={icons}
          selectedIcons={selectedIcons}
          onIconClick={onIconSelect}
          showSelection={true}
          disabled={isComplete}
        />
      </div>

      {/* Start Button */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
          <button
            onClick={onStartPuzzles}
            className="
              w-full max-w-md mx-auto flex items-center justify-center gap-3
              px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600
              rounded-full font-bold text-lg shadow-2xl
              hover:from-indigo-500 hover:to-purple-500
              transform hover:scale-105 transition-all duration-200
              animate-pulse-subtle
            "
          >
            {t.startPuzzles}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default IconSelector;