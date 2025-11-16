import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { Icon, Lang, RGB, PuzzleResult } from '../types';
import { TRANSLATIONS, ICONS, REQUIRED_ACCURACY } from '../constants';
import { hexToRgb, rgbToHex, calculateSimilarity, extractImageColors } from '../utils/color';
import ColorSlider from './ColorSlider';
import CountdownModal from './CountdownModal';

interface ColorSliderGameProps {
  selectedIcons: number[];
  currentLevel: number;
  lang: Lang;
  onLevelComplete: (result: PuzzleResult) => void;
  onAllLevelsComplete: () => void;
}

const ColorSliderGame: React.FC<ColorSliderGameProps> = ({
  selectedIcons,
  currentLevel,
  lang,
  onLevelComplete,
  onAllLevelsComplete,
}) => {
  const t = TRANSLATIONS[lang];
  const currentIconId = selectedIcons[currentLevel];
  const currentIcon = ICONS.find(i => i.id === currentIconId)!;
  
  // Pick a random color from the extracted colors for this level
  const [targetColorIndex] = useState(() => 0); // Will be set when colors are loaded
  const targetColor = extractedColors.length > 0 ? extractedColors[targetColorIndex % extractedColors.length] : '#666666';
  const totalColors = extractedColors.length;
  const targetRgb = hexToRgb(targetColor);
  
  // User's current color values
  const [userColor, setUserColor] = useState<RGB>({ r: 127, g: 127, b: 127 });
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [levelStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<PuzzleResult | null>(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(true);

  // Extract colors from icon image
  useEffect(() => {
    const loadColors = async () => {
      try {
        setIsLoadingColors(true);
        const colors = await extractImageColors(currentIcon.imagePath);
        setExtractedColors(colors);
      } catch (error) {
        console.error('Failed to extract colors:', error);
        // Fallback colors based on difficulty
        const fallbackColors = currentIcon.difficulty === 'easy' ? ['#666666'] : 
                              currentIcon.difficulty === 'normal' ? ['#666666', '#999999'] :
                              ['#666666', '#999999', '#cccccc'];
        setExtractedColors(fallbackColors);
      } finally {
        setIsLoadingColors(false);
      }
    };
    
    loadColors();
  }, [currentIcon]);

  useEffect(() => {
    // Update timer only when game has started
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - levelStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [levelStartTime, gameStarted]);

  useEffect(() => {
    // Calculate real-time accuracy
    const currentAccuracy = calculateSimilarity(targetRgb, userColor);
    setAccuracy(currentAccuracy);
  }, [userColor, targetRgb]);

  const handleColorChange = (channel: keyof RGB, value: number) => {
    if (isLevelComplete || !gameStarted) return;
    setUserColor(prev => ({ ...prev, [channel]: value }));
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGameStarted(true);
  };

  const handleSubmit = () => {
    if (isLevelComplete) return;

    const finalAccuracy = calculateSimilarity(targetRgb, userColor);
    const timeSpent = Math.floor((Date.now() - levelStartTime) / 1000);
    
    const result: PuzzleResult = {
      iconId: currentIconId,
      accuracy: finalAccuracy,
      timeSpent,
      isCorrect: finalAccuracy >= REQUIRED_ACCURACY,
      selectedColorIndex: 0, // Not applicable for slider game
      correctColorIndex: 0,  // Not applicable for slider game
    };

    setSubmittedResult(result);
    setIsLevelComplete(true);
  };

  const handleRetry = () => {
    setUserColor({ r: 127, g: 127, b: 127 });
    setIsLevelComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const userHex = rgbToHex(userColor);
  const isSuccess = accuracy >= REQUIRED_ACCURACY;
  const hasNextLevel = currentLevel < selectedIcons.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 text-gray-800">
      <CountdownModal 
        isVisible={showCountdown} 
        onComplete={handleCountdownComplete} 
      />
      {/* Header */}
      <header className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Level {currentLevel + 1} {t.of} {selectedIcons.length}
            </span>
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">{currentIcon.name}</h2>
          </div>
          
          <div className="flex items-center gap-2 text-orange-600">
            <Clock size={16} />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Icon Display */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center p-6 bg-white/90 rounded-3xl backdrop-blur-sm shadow-lg border border-gray-200">
            {/* Icon Image */}
            {currentIcon.imagePath && (
              <div className="w-16 h-16 md:w-20 md:h-20 mb-4">
                <img
                  src={currentIcon.imagePath}
                  alt={currentIcon.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Match this color:</h3>
            <p className="text-sm text-gray-600 mb-4">
              {totalColors === 1 ? 'Single Color' : 
               totalColors === 2 ? `Color ${targetColorIndex + 1} of 2` : 
               `Color ${targetColorIndex + 1} of ${totalColors}`}
            </p>
            
            {/* Icon's Color Palette */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Complete Palette:</p>
              <div className="flex justify-center gap-2 mb-4">
                {isLoadingColors ? (
                  <div className="text-sm text-gray-500">색상 추출 중...</div>
                ) : (
                  extractedColors.map((color, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        idx === targetColorIndex ? 'border-orange-500 ring-2 ring-orange-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Target Color */}
            <div className="mb-4">
              <div 
                className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-orange-500 mx-auto"
                style={{ backgroundColor: targetColor }}
              />
              <p className="text-sm text-gray-600 mt-2">{targetColor}</p>
            </div>
          </div>
        </div>

        {/* Color Comparison */}
        <div className="mb-8">
          <div className="flex gap-4 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Target</p>
              <div 
                className="w-24 h-24 rounded-xl border-2 border-gray-300"
                style={{ backgroundColor: targetColor }}
              />
            </div>
            
            <div className="text-2xl">→</div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your Color</p>
              <div 
                className="w-24 h-24 rounded-xl border-2 border-gray-300 transition-colors duration-200"
                style={{ backgroundColor: userHex }}
              />
              <p className="text-xs text-gray-500 mt-1">{userHex}</p>
            </div>
          </div>
        </div>

        {/* Color Sliders */}
        <div className="mb-8">
          <div className="bg-white/90 rounded-2xl p-6 backdrop-blur-sm shadow-lg border border-gray-200">
            <div className="space-y-4">
              <ColorSlider 
                label="R" 
                color="red" 
                value={userColor.r} 
                onChange={(v) => handleColorChange('r', v)} 
              />
              <ColorSlider 
                label="G" 
                color="green" 
                value={userColor.g} 
                onChange={(v) => handleColorChange('g', v)} 
              />
              <ColorSlider 
                label="B" 
                color="blue" 
                value={userColor.b} 
                onChange={(v) => handleColorChange('b', v)} 
              />
            </div>
          </div>
        </div>

        {/* Accuracy Display */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center p-4 bg-gray-100 rounded-xl border border-gray-300">
            <span className="text-gray-600 text-sm mb-1">{t.accuracy}</span>
            <span className={`text-4xl font-mono font-bold ${
              accuracy >= REQUIRED_ACCURACY ? 'text-green-600' : 
              accuracy >= 80 ? 'text-orange-500' : 'text-gray-600'
            }`}>
              {accuracy.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {t.minScore}: {REQUIRED_ACCURACY}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isLevelComplete ? (
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> {t.submit}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Result Message */}
              <div className={`text-center p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                isSuccess ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {isSuccess ? (
                  <>🎉 {t.excellent}</>
                ) : (
                  <>😅 {t.keepTrying}</>
                )}
                <span className="ml-2 font-mono">({accuracy.toFixed(1)}%)</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> {t.retry}
                </button>
                
                {hasNextLevel ? (
                  <button 
                    onClick={() => {
                      onLevelComplete({
                        iconId: currentIconId,
                        accuracy,
                        timeSpent: Math.floor((Date.now() - levelStartTime) / 1000),
                        isCorrect: accuracy >= REQUIRED_ACCURACY,
                        selectedColorIndex: 0,
                        correctColorIndex: 0,
                      });
                      
                      if (currentLevel === selectedIcons.length - 1) {
                        onAllLevelsComplete();
                      }
                    }}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                  >
                    {t.nextLevel} <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      onLevelComplete({
                        iconId: currentIconId,
                        accuracy,
                        timeSpent: Math.floor((Date.now() - levelStartTime) / 1000),
                        isCorrect: accuracy >= REQUIRED_ACCURACY,
                        selectedColorIndex: 0,
                        correctColorIndex: 0,
                      });
                      onAllLevelsComplete();
                    }}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                  >
                    Complete Game <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${((currentLevel + (isLevelComplete ? 1 : 0)) / selectedIcons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSliderGame;