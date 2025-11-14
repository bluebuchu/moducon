import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Trophy, Lock, ChevronRight, RotateCcw, Globe, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { Lang, ViewState, GameProgress, LevelData, RGB } from './types';
import { LEVELS, TRANSLATIONS, REQUIRED_ACCURACY } from './constants';
import { hexToRgb, rgbToHex, calculateSimilarity, getAverageAccuracy } from './utils/color';
import ColorSlider from './components/ColorSlider';
import Leaderboard, { addLeaderboardEntry } from './components/Leaderboard';
import NicknameModal from './components/NicknameModal';

// --- Local Storage Keys ---
const STORAGE_KEY_PROGRESS = 'cdc_progress_v1';
const STORAGE_KEY_LANG = 'cdc_lang_v1';

function App() {
  // --- State ---
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(STORAGE_KEY_LANG) as Lang) || 'EN');
  const [view, setView] = useState<ViewState>('MENU');
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  
  const [progress, setProgress] = useState<GameProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize level 1 as unlocked
    return { 1: { unlocked: true, completed: false, bestAccuracy: 0 } };
  });

  // Game Play State
  const [userColors, setUserColors] = useState<RGB[]>([]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [levelResult, setLevelResult] = useState<{ success: boolean; accuracies: number[]; avgAccuracy: number } | null>(null);
  
  // Timer state - track per stage
  const [stageTimers, setStageTimers] = useState<Record<number, { start: number | null; end: number | null; isValid: boolean }>>({
    1: { start: null, end: null, isValid: false },
    2: { start: null, end: null, isValid: false },
    3: { start: null, end: null, isValid: false }
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStageTimer, setCurrentStageTimer] = useState<number | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [completedStageData, setCompletedStageData] = useState<{ stage: number; time: number; accuracy: number } | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  }, [progress]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStageTimer && stageTimers[currentStageTimer]?.start && !stageTimers[currentStageTimer]?.end) {
      interval = setInterval(() => {
        const start = stageTimers[currentStageTimer].start;
        if (start) {
          setElapsedTime(Math.floor((Date.now() - start) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStageTimer, stageTimers]);

  // --- Helpers ---
  const t = TRANSLATIONS[lang];
  const currentLevel = useMemo(() => LEVELS.find(l => l.id === currentLevelId), [currentLevelId]);

  const startLevel = (levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    // Set current stage timer
    setCurrentStageTimer(level.stage);
    
    // Check if this is the first level of the stage
    const stageFirstLevels = { 1: 1, 2: 21, 3: 41 };
    const isFirstLevel = levelId === stageFirstLevels[level.stage as keyof typeof stageFirstLevels];
    
    if (isFirstLevel) {
      // Start official timer for speedrun
      const now = Date.now();
      console.log('Starting official speedrun timer for stage', level.stage, 'at:', now);
      setStageTimers(prev => ({
        ...prev,
        [level.stage]: { start: now, end: null, isValid: true }
      }));
      setElapsedTime(0);
      setIsPracticeMode(false);
    } else if (stageTimers[level.stage].start && stageTimers[level.stage].isValid && !stageTimers[level.stage].end) {
      // Continue official timer from previous level
      const elapsed = Math.floor((Date.now() - stageTimers[level.stage].start!) / 1000);
      setElapsedTime(elapsed);
      setIsPracticeMode(false);
    } else {
      // Practice mode - no official timer
      setIsPracticeMode(true);
      setElapsedTime(0);
    }
    
    // Initialize user colors with a default gray for each target
    setUserColors(level.targets.map(() => ({ r: 127, g: 127, b: 127 })));
    setCurrentLevelId(levelId);
    setIsLevelComplete(false);
    setLevelResult(null);
    setView('GAME');
  };

  const handleColorChange = (index: number, channel: keyof RGB, value: number) => {
    if (isLevelComplete) return;
    setUserColors(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [channel]: value };
      return next;
    });
  };

  const submitLevel = () => {
    if (!currentLevel || isLevelComplete) return;

    const accuracies = currentLevel.targets.map((targetHex, idx) => {
      return calculateSimilarity(hexToRgb(targetHex), userColors[idx]);
    });

    const avgAccuracy = getAverageAccuracy(accuracies);
    const success = avgAccuracy >= REQUIRED_ACCURACY;

    setIsLevelComplete(true);
    setLevelResult({ success, accuracies, avgAccuracy });

    if (success) {
      // Check if this is the last level of the stage
      const stageLevels = LEVELS.filter(l => l.stage === currentLevel.stage);
      const isLastOfStage = stageLevels[stageLevels.length - 1].id === currentLevel.id;
      
      console.log('Stage completion check:', {
        currentLevelId: currentLevel.id,
        currentStage: currentLevel.stage,
        stageLevelsCount: stageLevels.length,
        lastLevelId: stageLevels[stageLevels.length - 1].id,
        isLastOfStage,
        stageTimer: stageTimers[currentLevel.stage]
      });
      
      // If last level of stage and timer is valid (started from first level), show nickname modal
      if (isLastOfStage && stageTimers[currentLevel.stage].start && stageTimers[currentLevel.stage].isValid) {
        const endTime = Date.now();
        const startTime = stageTimers[currentLevel.stage].start!;
        const totalTime = Math.floor((endTime - startTime) / 1000);
        
        // Update stage timer with end time
        setStageTimers(prev => ({
          ...prev,
          [currentLevel.stage]: { ...prev[currentLevel.stage], end: endTime }
        }));
        
        // Calculate average accuracy for the entire stage
        const stageProgress = stageLevels.map(l => progress[l.id]?.bestAccuracy || 0);
        const stageAvgAccuracy = stageProgress.reduce((a, b) => a + b, 0) / stageLevels.length;
        
        setCompletedStageData({
          stage: currentLevel.stage,
          time: totalTime,
          accuracy: Math.max(stageAvgAccuracy, avgAccuracy)
        });
        setShowNicknameModal(true);
      } else if (isLastOfStage && !stageTimers[currentLevel.stage].isValid) {
        // Completed stage but not eligible for leaderboard (didn't start from first level)
        console.log('Stage completed in practice mode - no leaderboard entry');
      }
      
      setProgress(prev => {
        const next = { ...prev };
        // Update current level
        next[currentLevel.id] = {
          unlocked: true,
          completed: true,
          bestAccuracy: Math.max(prev[currentLevel.id]?.bestAccuracy || 0, avgAccuracy)
        };
        // Unlock next level if it exists
        const nextLevelId = currentLevel.id + 1;
        if (LEVELS.some(l => l.id === nextLevelId)) {
           // Safely get existing progress or create default to avoid type errors on 'unknown'
           const existing = next[nextLevelId] || { bestAccuracy: 0, completed: false, unlocked: false };
           next[nextLevelId] = {
             ...existing,
             unlocked: true
           };
        }
        return next;
      });
    }
  };

  const resetProgress = () => {
      if (confirm(lang === 'EN' ? 'Are you sure you want to reset all progress?' : '¿Estás seguro de que quieres reiniciar todo el progreso?')) {
          setProgress({ 1: { unlocked: true, completed: false, bestAccuracy: 0 } });
          setView('MENU');
      }
  }
  
  const handleNicknameSubmit = (nickname: string) => {
    if (nickname && completedStageData) {
      addLeaderboardEntry({
        nickname,
        stage: completedStageData.stage,
        time: completedStageData.time,
        accuracy: completedStageData.accuracy
      });
    }
    setShowNicknameModal(false);
    setCompletedStageData(null);
  };

  // --- Renderers ---

  const renderHeader = () => (
    <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" 
        onClick={() => setView('MENU')}
      >
        <Palette className="text-indigo-500" size={24} />
        <h1 className="font-bold text-lg hidden sm:block">{t.title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-full text-xs font-medium hover:bg-slate-700 transition"
        >
          <Trophy size={14} />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>
        {view === 'GAME' && (
          <button onClick={() => setView('STAGE_SELECT')} className="text-sm text-slate-400 hover:text-white">
            {t.menu}
          </button>
        )}
        <button 
          onClick={() => setLang(l => l === 'EN' ? 'ES' : 'EN')}
          className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-full text-xs font-medium hover:bg-slate-700 transition"
        >
          <Globe size={14} />
          {lang}
        </button>
      </div>
    </header>
  );

  const renderMenu = () => {
    // Calculate total stats
    const totalCompleted = Object.values(progress).filter(p => p.completed).length;
    const totalLevels = LEVELS.length;
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center mb-12">
          <Palette className="mx-auto text-indigo-500 mb-4" size={64} />
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-slate-400">{t.minScore}</p>
        </div>

        <div className="grid gap-4 w-full max-w-md">
          {[1, 2, 3].map(stageNum => {
            const stageLevels = LEVELS.filter(l => l.stage === stageNum);
            const firstLevelOfStage = stageLevels[0];
            const isUnlocked = progress[firstLevelOfStage.id]?.unlocked;
            const completedInStage = stageLevels.filter(l => progress[l.id]?.completed).length;

            return (
              <button
                key={stageNum}
                disabled={!isUnlocked}
                onClick={() => { setCurrentStage(stageNum as 1|2|3); setView('STAGE_SELECT'); }}
                className={`p-6 rounded-xl border flex items-center justify-between transition-all
                  ${isUnlocked 
                    ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 cursor-pointer' 
                    : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'}`}
              >
                <div>
                  <h3 className="text-xl font-bold mb-1">{t.stage} {stageNum}</h3>
                  <p className="text-sm text-slate-400">
                    {stageNum === 1 ? t.stage1Title : stageNum === 2 ? t.stage2Title : t.stage3Title}
                  </p>
                </div>
                <div className="text-right">
                  {isUnlocked ? (
                    <span className="text-indigo-400 font-mono">{completedInStage}/{stageLevels.length}</span>
                  ) : (
                    <Lock className="text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-slate-500 text-sm">
          {t.completed}: {totalCompleted} / {totalLevels}
        </div>
        <button onClick={resetProgress} className="mt-4 text-xs text-red-900 hover:text-red-500 transition">
            {t.reset}
        </button>
      </div>
    );
  };

  const renderStageSelect = () => {
    const stageLevels = LEVELS.filter(l => l.stage === currentStage);
    
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
             <button onClick={() => setView('MENU')} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
                 <RotateCcw size={16} />
             </button>
             <h2 className="text-2xl font-bold">{t.stage} {currentStage}</h2>
          </div>
          
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-400 text-center">
              🏁 For official speedrun records, start from the first level of each stage!
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stageLevels.map(level => {
              const levelProgress = progress[level.id];
              const isUnlocked = levelProgress?.unlocked;
              const isCompleted = levelProgress?.completed;
              const stageFirstLevels = { 1: 1, 2: 21, 3: 41 };
              const isFirstLevel = level.id === stageFirstLevels[currentStage as keyof typeof stageFirstLevels];

              return (
                <button
                  key={level.id}
                  disabled={!isUnlocked}
                  onClick={() => startLevel(level.id)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-4 border transition-all relative overflow-hidden
                    ${isUnlocked 
                      ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 cursor-pointer' 
                      : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'}
                    ${isCompleted ? 'border-green-900/50' : ''}
                    ${isFirstLevel ? 'ring-2 ring-green-500/30' : ''}
                  `}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-1 bg-green-500/20 rounded-bl-lg">
                        <Trophy size={12} className="text-green-400" />
                    </div>
                  )}
                  
                  {!isUnlocked ? (
                    <Lock className="text-slate-600 mb-2" />
                  ) : (
                    <>
                      <span className="text-2xl font-bold mb-1 text-slate-300">{level.id}</span>
                      {isFirstLevel && (
                        <div className="absolute top-1 left-1 text-xs bg-green-600 text-white px-1 py-0.5 rounded">
                          START
                        </div>
                      )}
                    </>
                  )}
                  
                  <span className="text-xs text-slate-400 text-center truncate w-full">
                    {level.brand}
                  </span>
                  
                  {isUnlocked && levelProgress.bestAccuracy > 0 && (
                    <span className={`text-xs mt-2 font-mono ${levelProgress.bestAccuracy >= REQUIRED_ACCURACY ? 'text-green-400' : 'text-yellow-500'}`}>
                      {levelProgress.bestAccuracy.toFixed(0)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!currentLevel) return null;

    const hasNextLevel = LEVELS.some(l => l.id === currentLevel.id + 1);
    
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 sm:p-6 overflow-y-auto">
        <div className="mb-6 flex justify-between items-center">
           <div>
              <h2 className="text-xl font-bold text-indigo-300">{t.level} {currentLevel.id}</h2>
              <h3 className="text-3xl font-bold">{currentLevel.brand}</h3>
           </div>
           <div className="text-right">
               {isPracticeMode ? (
                 <div className="text-xs text-amber-400 mb-1 font-medium">
                   Practice Mode
                 </div>
               ) : currentStageTimer && stageTimers[currentStageTimer]?.start && !stageTimers[currentStageTimer]?.end && (
                 <div className="flex items-center gap-1 text-sm text-green-400 mb-1">
                   <Clock size={14} />
                   <span className="font-mono">{formatTime(elapsedTime)}</span>
                   <span className="text-xs">SPEEDRUN</span>
                 </div>
               )}
               <div className="text-sm text-slate-400">{t.minScore}</div>
               <div className="text-2xl font-mono font-bold text-slate-200">{REQUIRED_ACCURACY}%</div>
           </div>
        </div>

        {/* Color Work Area */}
        <div className="flex-1 flex flex-col gap-8">
          {currentLevel.targets.map((targetHex, index) => {
            const userRgb = userColors[index];
            const userHex = rgbToHex(userRgb);
            const currentSimilarity = calculateSimilarity(hexToRgb(targetHex), userRgb);
            const targetAccuracy = levelResult?.accuracies[index] ?? currentSimilarity;

            return (
              <div key={index} className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-800">
                 {/* Comparison View */}
                 <div className="flex gap-4 mb-6 h-32 sm:h-40">
                    <div className="flex-1 flex flex-col">
                      <span className="text-xs text-slate-500 mb-2 uppercase tracking-wider">{t.target}</span>
                      <div 
                        className="flex-1 rounded-xl shadow-inner w-full" 
                        style={{ backgroundColor: targetHex }} 
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-xs text-slate-500 mb-2 uppercase tracking-wider">{t.yourColor}</span>
                      <div 
                        className="flex-1 rounded-xl shadow-inner w-full transition-colors duration-100" 
                        style={{ backgroundColor: userHex }} 
                      />
                    </div>
                 </div>

                 {/* Controls & Stats */}
                 <div className="flex flex-col sm:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-3">
                        <ColorSlider label="R" color="red" value={userRgb.r} onChange={(v) => handleColorChange(index, 'r', v)} />
                        <ColorSlider label="G" color="green" value={userRgb.g} onChange={(v) => handleColorChange(index, 'g', v)} />
                        <ColorSlider label="B" color="blue" value={userRgb.b} onChange={(v) => handleColorChange(index, 'b', v)} />
                    </div>
                    
                    {/* Realtime Accuracy for this specific color pair */}
                    <div className="sm:w-32 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800">
                        <span className="text-slate-500 text-xs mb-1">{t.accuracy}</span>
                        <span className={`text-3xl font-mono font-bold ${targetAccuracy >= REQUIRED_ACCURACY ? 'text-green-400' : targetAccuracy >= 80 ? 'text-yellow-400' : 'text-slate-300'}`}>
                            {targetAccuracy.toFixed(1)}%
                        </span>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="mt-8 sticky bottom-4 bg-slate-950/80 backdrop-blur p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-2xl">
           {!isLevelComplete ? (
               <button 
                onClick={submitLevel}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
               >
                   <CheckCircle /> {t.submit}
               </button>
           ) : (
               <div className="w-full flex flex-col gap-4">
                   <div className={`text-center p-2 rounded-lg font-bold flex items-center justify-center gap-2
                       ${levelResult?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                       {levelResult?.success ? <Trophy size={20}/> : <XCircle size={20}/>}
                       <span>{levelResult?.success ? t.success : t.failure}</span>
                       <span className="ml-2 font-mono">({levelResult?.avgAccuracy.toFixed(1)}%)</span>
                   </div>
                   
                   <div className="flex gap-3">
                        <button 
                            onClick={() => startLevel(currentLevel.id)} 
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} /> {t.retry}
                        </button>
                        {levelResult?.success && hasNextLevel && (
                            <button 
                                onClick={() => startLevel(currentLevel.id + 1)}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 animate-pulse-subtle"
                            >
                                {t.nextLevel} <ChevronRight size={18} />
                            </button>
                        )}
                        {levelResult?.success && !hasNextLevel && (
                             <button 
                                onClick={() => setView('MENU')}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
                            >
                                {t.menu}
                            </button>
                        )}
                   </div>
               </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {renderHeader()}
      <main className="flex-1 flex overflow-hidden">
        {view === 'MENU' && renderMenu()}
        {view === 'STAGE_SELECT' && renderStageSelect()}
        {view === 'GAME' && renderGame()}
      </main>
      
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentStage={currentStage}
        lang={lang}
      />
      
      {completedStageData && (
        <NicknameModal
          isOpen={showNicknameModal}
          onSubmit={handleNicknameSubmit}
          time={completedStageData.time}
          accuracy={completedStageData.accuracy}
          stage={completedStageData.stage}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;