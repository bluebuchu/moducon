import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Icon, Lang, Difficulty, ColorOption, PuzzleResult } from '../types';
import { TRANSLATIONS, ICONS } from '../constants';
import { generateColorVariations, hexToRgb, calculateSimilarity } from '../utils/color';

interface ColorMatchGameProps {
  selectedIcons: number[];
  currentPuzzle: number;
  difficulty: Difficulty;
  lang: Lang;
  onPuzzleComplete: (result: PuzzleResult) => void;
  onAllPuzzlesComplete: () => void;
}

const ColorMatchGame: React.FC<ColorMatchGameProps> = ({
  selectedIcons,
  currentPuzzle,
  difficulty,
  lang,
  onPuzzleComplete,
  onAllPuzzlesComplete,
}) => {
  const t = TRANSLATIONS[lang];
  const currentIconId = selectedIcons[currentPuzzle];
  const currentIcon = ICONS.find(i => i.id === currentIconId)!;
  
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Pick a random color from the icon's palette for this puzzle
  const [targetColorIndex] = useState(() => 
    Math.floor(Math.random() * currentIcon.colors.length)
  );
  const targetColor = currentIcon.colors[targetColorIndex];

  useEffect(() => {
    // Generate color variations when component mounts or puzzle changes
    setColorOptions(generateColorVariations(targetColor, difficulty));
    setSelectedOption(null);
    setShowResult(false);
    setPuzzleStartTime(Date.now());
  }, [currentPuzzle, targetColor, difficulty]);

  useEffect(() => {
    // Update timer
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - puzzleStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzleStartTime]);

  const handleColorSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);
    
    const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
    const isCorrect = colorOptions[index].isCorrect;
    
    // Calculate accuracy based on color similarity
    const selectedColor = colorOptions[index].color;
    const accuracy = calculateSimilarity(
      hexToRgb(targetColor),
      hexToRgb(selectedColor)
    );
    
    const result: PuzzleResult = {
      iconId: currentIconId,
      accuracy: isCorrect ? 100 : accuracy,
      timeSpent,
      isCorrect,
      selectedColorIndex: index,
      correctColorIndex: colorOptions.findIndex(opt => opt.isCorrect),
    };
    
    // Auto advance after delay
    setTimeout(() => {
      onPuzzleComplete(result);
      
      if (currentPuzzle === selectedIcons.length - 1) {
        onAllPuzzlesComplete();
      }
    }, isCorrect ? 1500 : 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Header */}
      <header className="p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {t.puzzle} {currentPuzzle + 1} {t.of} {selectedIcons.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-indigo-400">
            <Clock size={16} />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Icon Display */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center p-8 bg-slate-900/50 rounded-3xl backdrop-blur-sm">
            {/* Icon Image */}
            {currentIcon.imagePath ? (
              <div className="w-20 h-20 md:w-24 md:h-24 mb-4 animate-bounce-slow">
                <img
                  src={currentIcon.imagePath}
                  alt={currentIcon.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="hidden text-6xl md:text-8xl text-center animate-bounce-slow">
                  {currentIcon.emoji || '🏢'}
                </div>
              </div>
            ) : (
              <div className="text-6xl md:text-8xl mb-4 animate-bounce-slow">
                {currentIcon.emoji || '🏢'}
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentIcon.name}</h2>
            
            {/* Original Color Display */}
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Original Color:</p>
              <div 
                className="w-24 h-24 rounded-2xl shadow-2xl border-4 border-white/20"
                style={{ backgroundColor: targetColor }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl font-semibold text-center mb-6">
          {t.originalColor}
        </h3>

        {/* Color Options Grid */}
        <div className={`grid grid-cols-2 ${difficulty === 'hard' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4 max-w-2xl mx-auto`}>
          {colorOptions.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = option.isCorrect;
            const showCorrectness = showResult && (isSelected || isCorrect);
            
            return (
              <button
                key={index}
                onClick={() => handleColorSelect(index)}
                disabled={showResult}
                className={`
                  relative aspect-square rounded-2xl shadow-lg
                  transition-all duration-300 transform
                  ${showResult ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  ${isSelected && !showResult ? 'ring-4 ring-indigo-400' : ''}
                  ${showCorrectness && isCorrect ? 'ring-4 ring-green-500 scale-110' : ''}
                  ${showCorrectness && !isCorrect && isSelected ? 'ring-4 ring-red-500 scale-95 opacity-70' : ''}
                `}
                style={{ backgroundColor: option.color }}
              >
                {/* Result Indicator */}
                {showCorrectness && (
                  <div className={`absolute inset-0 flex items-center justify-center rounded-2xl ${isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                    <div className={`text-6xl ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                )}
                
                {/* Color Code (shown after selection) */}
                {showResult && (
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-mono bg-black/50 text-white px-2 py-1 rounded">
                    {option.color}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {showResult && (
          <div className="mt-8 text-center animate-fade-in">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg ${
              colorOptions[selectedOption!].isCorrect
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {colorOptions[selectedOption!].isCorrect ? (
                <>
                  <span>🎉</span> {t.correct}
                </>
              ) : (
                <>
                  <span>😅</span> {t.wrong}
                </>
              )}
            </div>
            
            {currentPuzzle < selectedIcons.length - 1 && (
              <div className="mt-4 text-sm text-slate-400 flex items-center justify-center gap-2">
                {t.nextPuzzle} <ArrowRight size={16} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentPuzzle + (showResult ? 1 : 0)) / selectedIcons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatchGame;