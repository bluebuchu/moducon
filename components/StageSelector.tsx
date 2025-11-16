import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Icon, Lang, Difficulty } from '../types';
import { TRANSLATIONS } from '../constants';
import IconGrid from './IconGrid';

interface StageSelectorProps {
  allIcons: Icon[];
  selectedIcons: number[];
  currentStage: Difficulty;
  lang: Lang;
  onIconSelect: (iconId: number) => void;
  onBack: () => void;
  onNextStage: () => void;
  onStartGame: () => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({
  allIcons,
  selectedIcons,
  currentStage,
  lang,
  onIconSelect,
  onBack,
  onNextStage,
  onStartGame,
}) => {
  const t = TRANSLATIONS[lang];
  
  // Get icons for current stage
  const stageIcons = allIcons.filter(icon => icon.difficulty === currentStage);
  
  // Get selected icon for current stage
  const currentStageIcon = selectedIcons.find(id => {
    const icon = allIcons.find(i => i.id === id);
    return icon?.difficulty === currentStage;
  });

  const hasSelected = currentStageIcon !== undefined;
  const isLastStage = currentStage === 'hard';
  const canProceed = selectedIcons.length === 3;

  const stageOrder: Difficulty[] = ['easy', 'normal', 'hard'];
  const currentStageIndex = stageOrder.indexOf(currentStage);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 text-gray-800">
      {/* Header */}
      <header className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${difficultyColors[currentStage]} text-lg font-bold`}>
              <span>{difficultyEmojis[currentStage]}</span>
              <span>{t[currentStage]} Stage</span>
            </div>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-4 mb-6">
            {stageOrder.map((stage, index) => {
              const isCompleted = selectedIcons.some(id => {
                const icon = allIcons.find(i => i.id === id);
                return icon?.difficulty === stage;
              });
              const isCurrent = stage === currentStage;
              
              return (
                <div key={stage} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                      isCompleted 
                        ? 'bg-green-500 border-green-400 text-white scale-110' 
                        : isCurrent
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  
                  {index < stageOrder.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${isCompleted ? 'bg-green-400' : 'bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Select one logo from {t[currentStage]} stage
            </h2>
            <p className="text-gray-600 text-sm">
              Step {currentStageIndex + 1} of 3 - Choose carefully!
            </p>
          </div>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="px-4 pb-24">
        <IconGrid
          icons={stageIcons}
          selectedIcons={currentStageIcon ? [currentStageIcon] : []}
          onIconClick={onIconSelect}
          showSelection={true}
          disabled={false}
        />
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="max-w-md mx-auto space-y-2">
          {hasSelected && !isLastStage && (
            <button
              onClick={onNextStage}
              className="
                w-full flex items-center justify-center gap-3
                px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600
                rounded-xl font-bold text-lg shadow-2xl
                hover:from-indigo-500 hover:to-purple-500
                transform hover:scale-105 transition-all duration-200
              "
            >
              Next: {t[stageOrder[currentStageIndex + 1]]} Stage
              <ArrowRight size={20} />
            </button>
          )}
          
          {canProceed && (
            <button
              onClick={onStartGame}
              className="
                w-full flex items-center justify-center gap-3
                px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600
                rounded-xl font-bold text-lg shadow-2xl
                hover:from-green-500 hover:to-emerald-500
                transform hover:scale-105 transition-all duration-200
                animate-pulse-subtle
              "
            >
              🎯 Start Color Challenge!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageSelector;