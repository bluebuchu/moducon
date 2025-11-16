import React from 'react';
import { Trophy, Clock, Target, RotateCcw, Home, ArrowRight } from 'lucide-react';
import { Lang, Difficulty, PuzzleResult, GameProgress } from '../types';
import { TRANSLATIONS, ICONS, REQUIRED_ACCURACY } from '../constants';
import { getAverageAccuracy } from '../utils/color';

interface ResultScreenProps {
  puzzleResults: PuzzleResult[];
  totalTime: number;
  difficulty: Difficulty;
  lang: Lang;
  progress: GameProgress;
  onRetry: () => void;
  onHome: () => void;
  onNextDifficulty: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  puzzleResults,
  totalTime,
  difficulty,
  lang,
  progress,
  onRetry,
  onHome,
  onNextDifficulty,
}) => {
  const t = TRANSLATIONS[lang];
  
  // Calculate statistics
  const accuracies = puzzleResults.map(r => r.accuracy);
  const averageAccuracy = getAverageAccuracy(accuracies);
  const correctCount = puzzleResults.filter(r => r.isCorrect).length;
  const isPassed = averageAccuracy >= REQUIRED_ACCURACY;
  
  // Check if next difficulty is available
  const canProgressToNext = isPassed && difficulty !== 'hard';
  const nextDifficulty = difficulty === 'easy' ? 'normal' : 'hard';
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStars = (accuracy: number) => {
    if (accuracy >= 95) return 3;
    if (accuracy >= 90) return 2;
    if (accuracy >= 80) return 1;
    return 0;
  };

  const stars = getStars(averageAccuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Result Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {isPassed ? (
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {t.excellent} 🎉
              </span>
            ) : averageAccuracy >= 70 ? (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {t.good} 👍
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                {t.keepTrying} 💪
              </span>
            )}
          </h1>
          
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`text-4xl transition-all duration-300 ${
                  star <= stars ? 'text-yellow-400 scale-110' : 'text-slate-700 scale-90'
                }`}
              >
                ⭐
              </div>
            ))}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Target className="mx-auto mb-2 text-indigo-400" size={24} />
            <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-slate-400">{t.averageAccuracy}</div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Clock className="mx-auto mb-2 text-purple-400" size={24} />
            <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
            <div className="text-sm text-slate-400">{t.totalTime}</div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Trophy className="mx-auto mb-2 text-yellow-400" size={24} />
            <div className="text-2xl font-bold">{correctCount}/{puzzleResults.length}</div>
            <div className="text-sm text-slate-400">{t.correct}</div>
          </div>
        </div>

        {/* Individual Puzzle Results */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">{t.puzzle} Details:</h3>
          {puzzleResults.map((result, index) => {
            const icon = ICONS.find(i => i.id === result.iconId)!;
            return (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Icon Image or Emoji */}
                  {icon.imagePath ? (
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={icon.imagePath}
                        alt={icon.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-xl">{icon.emoji || '🏢'}</div>
                    </div>
                  ) : (
                    <div className="text-2xl">{icon.emoji || '🏢'}</div>
                  )}
                  <div>
                    <div className="font-medium">{icon.name}</div>
                    <div className="text-sm text-slate-400">
                      {t.puzzle} {index + 1}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.accuracy.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatTime(result.timeSpent)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {canProgressToNext && (
            <>
              <button
                onClick={onNextDifficulty}
                className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3 animate-pulse-subtle"
              >
                {t.nextLevel} ({t[nextDifficulty]})
                <ArrowRight size={20} />
              </button>
              <div className="text-center text-sm text-green-400">
                {t.unlockNext}
              </div>
            </>
          )}
          
          <button
            onClick={onRetry}
            className="w-full p-4 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <RotateCcw size={20} />
            {t.retry}
          </button>
          
          <button
            onClick={onHome}
            className="w-full p-4 bg-slate-900 rounded-xl font-medium hover:bg-slate-800 transition flex items-center justify-center gap-3"
          >
            <Home size={20} />
            {t.backToMenu}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;