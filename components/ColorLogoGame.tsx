import React, { useEffect, useState } from "react";
import { Difficulty, RGB } from '../types';
import { ICONS, DIFFICULTY_SETTINGS, STORAGE_KEY_RECORDS } from '../constants';
import { hexToRgb, rgbToHex, calculateSimilarity } from '../utils/color';
import ColorSlider from './ColorSlider';
import StageCountdown from './StageCountdown';
import NicknameModal from './NicknameModal';
import Leaderboard, { addLeaderboardEntry } from './Leaderboard';

interface LogoColor {
  hex: string;
  label: string;
}

interface LogoData {
  id: string;
  name: string;
  difficulty: Difficulty;
  colors: LogoColor[];
}

interface StageConfig {
  key: Difficulty;
  label: string;
  maxTimeSec: number;
}

const STAGES: StageConfig[] = [
  { key: "easy", label: "Easy", maxTimeSec: 60 },
  { key: "normal", label: "Normal", maxTimeSec: 75 },
  { key: "hard", label: "Hard", maxTimeSec: 90 },
  { key: "extreme", label: "Extreme", maxTimeSec: 120 },
];

const STAGE_ORDER: Difficulty[] = ['easy', 'normal', 'hard', 'extreme'];

// Convert ICONS to LogoData format
const LOGOS: LogoData[] = ICONS.map(icon => ({
  id: icon.id.toString(),
  name: icon.name,
  difficulty: icon.difficulty,
  colors: icon.colors.map((color, index) => ({
    hex: color,
    label: `Color ${index + 1}`
  }))
}));

interface RecordItem {
  id: string;
  totalTime: number; // 초
  date: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const ColorLogoGame: React.FC = () => {
  const [phase, setPhase] = useState<"logo_selection" | "countdown" | "playing" | "finished">("logo_selection");

  // 각 단계별로 선택된 로고 ID 저장
  const [selectedLogos, setSelectedLogos] = useState<{
    easy: string | null;
    normal: string | null;
    hard: string | null;
    extreme: string | null;
  }>({ easy: null, normal: null, hard: null, extreme: null });
  
  // 현재 로고 선택 중인 단계
  const [currentSelectionStage, setCurrentSelectionStage] = useState<Difficulty>("easy");

  // 진행 중 스테이지 (0: easy, 1: normal, 2: hard, 3: extreme)
  const [stageIndex, setStageIndex] = useState(0);
  const [currentStageKey, setCurrentStageKey] = useState<Difficulty | null>(null);

  const [remainingTime, setRemainingTime] = useState(0);
  const [stageElapsed, setStageElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const [timerRunning, setTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const [records, setRecords] = useState<RecordItem[]>([]);
  
  // 닉네임 모달 및 리더보드 상태
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameResult, setGameResult] = useState<{
    time: number;
    accuracy: number;
    stage: number;
  } | null>(null);

  // 색상 게임 상태
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [userColor, setUserColor] = useState<RGB>({ r: 127, g: 127, b: 127 });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [stageCompleted, setStageCompleted] = useState(false);

  // 로컬 기록 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (raw) {
        const parsed: RecordItem[] = JSON.parse(raw);
        setRecords(parsed.sort((a, b) => a.totalTime - b.totalTime).slice(0, 10));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 타이머
  useEffect(() => {
    if (!timerRunning) return;

    const id = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // 시간 초과 처리: 자동으로 단계 종료
          handleStageComplete(true);
          return 0;
        }
        return prev - 1;
      });
      setStageElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  const getStageConfig = (key: Difficulty) => STAGES.find((s) => s.key === key)!;

  // Delta E 색상 차이 계산 함수
  const calculateDeltaE = (color1: any, color2: any) => {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // 현재 단계의 정확도 계산 함수
  const calculateCurrentAccuracy = () => {
    if (!currentLogo || !currentStageKey) return 85.0; // 기본값
    
    const targetColor = currentLogo.colors[currentColorIndex];
    const deltaE = calculateDeltaE(userColor, targetColor);
    
    // Delta E를 백분율로 변환 (0-100%)
    const maxDeltaE = 150; // 최대 Delta E 값 (RGB 색공간에서)
    const accuracy = Math.max(0, Math.min(100, 100 - (deltaE / maxDeltaE) * 100));
    
    return Math.round(accuracy * 10) / 10; // 소수점 첫째 자리까지
  };

  const getCurrentLogo = () => {
    if (currentStageKey) {
      // 해당 단계에서 선택된 로고 반환
      const selectedId = selectedLogos[currentStageKey];
      return LOGOS.find((logo) => logo.id === selectedId) || null;
    }
    return null;
  };

  const handleColorChange = (channel: keyof RGB, value: number) => {
    if (showResult) return;
    setUserColor(prev => ({ ...prev, [channel]: value }));
  };

  // 실시간 정확도 계산
  useEffect(() => {
    const logo = getCurrentLogo();
    if (logo && logo.colors[currentColorIndex]) {
      const targetRgb = hexToRgb(logo.colors[currentColorIndex].hex);
      const currentAccuracy = calculateSimilarity(targetRgb, userColor);
      setAccuracy(currentAccuracy);
    }
  }, [userColor, currentColorIndex, getCurrentLogo]);

  const startColorGame = () => {
    const logo = getCurrentLogo();
    if (!logo || logo.colors.length === 0) return;

    setCurrentColorIndex(0);
    setUserColor({ r: 127, g: 127, b: 127 });
    setShowResult(false);
    setAccuracy(0);
    setIsCorrect(false);
  };

  const handleSubmitColor = () => {
    if (showResult) return;

    const logo = getCurrentLogo();
    if (!logo) return;

    const targetRgb = hexToRgb(logo.colors[currentColorIndex].hex);
    const finalAccuracy = calculateSimilarity(targetRgb, userColor);
    const correct = finalAccuracy >= 85; // 85% 이상이면 성공

    setIsCorrect(correct);
    setShowResult(true);

    // 2초 후 다음 색상 또는 단계 완료
    setTimeout(() => {
      if (currentColorIndex < logo.colors.length - 1) {
        // 다음 색상으로 이동
        setCurrentColorIndex(prev => prev + 1);
        setUserColor({ r: 127, g: 127, b: 127 });
        setShowResult(false);
        setAccuracy(0);
      } else {
        // 이 단계의 모든 색상 완료 - 단계 완료
        setStageCompleted(true);
        handleStageComplete(false);
      }
    }, 2000);
  };

  const handleStartGame = () => {
    // 모든 로고가 선택되었는지 확인
    if (!selectedLogos.easy || !selectedLogos.normal || !selectedLogos.hard) return;
    
    // Extreme는 자동으로 ClaBi 선택
    setSelectedLogos(prev => ({ ...prev, extreme: "12" })); // ClaBi ID
    
    console.log('Game starting with logos:', selectedLogos);
    
    // 첫 스테이지는 항상 Easy부터 시작 (인덱스 0)
    setStageIndex(0);
    setTotalElapsed(0);
    startNextStage(0);
  };

  const startNextStage = (explicitStageIndex?: number) => {
    const targetIndex = explicitStageIndex !== undefined ? explicitStageIndex : stageIndex;
    const nextStageKey = STAGE_ORDER[targetIndex];
    const cfg = getStageConfig(nextStageKey);

    console.log(`Starting stage ${targetIndex}: ${nextStageKey}`);
    
    setCurrentStageKey(nextStageKey);
    setRemainingTime(cfg.maxTimeSec);
    setStageElapsed(0);
    setStageCompleted(false);
    
    // 카운트다운 표시
    setShowCountdown(true);
    setPhase("countdown");
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setPhase("playing");
    setTimerRunning(true);
    startColorGame();
  };

  const handleStageComplete = (autoTimeout = false) => {
    setTimerRunning(false);

    // 시간 초과든 자발적 완료든, 그동안 경과된 시간 더하기
    setTotalElapsed((prev) => prev + stageElapsed);

    console.log(`Stage ${stageIndex} (${STAGE_ORDER[stageIndex]}) completed`);

    // 3초 후 다음 스테이지 또는 종료
    setTimeout(() => {
      const nextIndex = stageIndex + 1;
      console.log(`Next index will be: ${nextIndex}, Max: ${STAGE_ORDER.length - 1}`);
      
      if (nextIndex < STAGE_ORDER.length) {
        // 다음 스테이지로
        setStageIndex(nextIndex);
        startNextStage(nextIndex);
      } else {
        // 모든 스테이지 완료 - 게임 종료
        console.log('All stages completed!');
        const finalTotal = totalElapsed + stageElapsed;

        // 기존 기록 시스템 유지
        const newRecord: RecordItem = {
          id: `${Date.now()}`,
          totalTime: finalTotal,
          date: new Date().toISOString(),
        };
        const updated = [...records, newRecord].sort((a, b) => a.totalTime - b.totalTime);
        setRecords(updated.slice(0, 10));
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
        
        // 새로운 개별화된 랭킹 시스템
        setGameResult({
          time: finalTotal,
          accuracy: 100, // 전체 단계 완료이므로 100%
          stage: 4 // 4단계 모두 완료
        });
        setShowNicknameModal(true);
        setPhase("finished");
      }
    }, 3000);
  };

  const handleReset = () => {
    setPhase("logo_selection");
    setSelectedLogos({ easy: null, normal: null, hard: null, extreme: null });
    setCurrentSelectionStage("easy");
    setStageIndex(0);
    setCurrentStageKey(null);
    setRemainingTime(0);
    setStageElapsed(0);
    setTotalElapsed(0);
    setTimerRunning(false);
    setShowCountdown(false);
    setCurrentColorIndex(0);
    setUserColor({ r: 127, g: 127, b: 127 });
    setShowResult(false);
    setAccuracy(0);
    setStageCompleted(false);
    setShowNicknameModal(false);
    setShowLeaderboard(false);
    setGameResult(null);
  };

  // 닉네임 제출 핸들러
  const handleNicknameSubmit = async (nickname: string) => {
    console.log('🎮 [Game] 닉네임 제출 시작:', { nickname: nickname.trim(), gameResult });
    
    if (gameResult && nickname.trim()) {
      const entryData = {
        nickname: nickname.trim(),
        stage: gameResult.stage,
        time: gameResult.time,
        accuracy: gameResult.accuracy
      };
      
      console.log('📝 [Game] 리더보드 엔트리 저장 중:', entryData);
      
      try {
        await addLeaderboardEntry(entryData);
        console.log('✅ [Game] 리더보드 엔트리 저장 완료');
      } catch (error) {
        console.error('❌ [Game] 리더보드 엔트리 저장 실패:', error);
      }
    } else {
      console.warn('⚠️ [Game] 닉네임 제출 조건 미충족:', { 
        hasGameResult: !!gameResult, 
        hasNickname: !!nickname.trim() 
      });
    }
    
    setShowNicknameModal(false);
    
    // 닉네임 제출 후 게임 결과 초기화
    setGameResult(null);
  };

  // 리더보드 열기/닫기
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  // 현재 선택 단계에 해당하는 로고들
  const getLogosForCurrentStage = () => {
    if (currentSelectionStage === 'extreme') {
      // Extreme은 ClaBi 고정
      return LOGOS.filter(logo => logo.difficulty === 'extreme');
    }
    return LOGOS.filter(logo => logo.difficulty === currentSelectionStage);
  };

  // 다음 단계로 이동
  const handleNextSelectionStage = () => {
    if (currentSelectionStage === "easy") {
      setCurrentSelectionStage("normal");
    } else if (currentSelectionStage === "normal") {
      setCurrentSelectionStage("hard");
    } else if (currentSelectionStage === "hard") {
      setCurrentSelectionStage("extreme");
      // Extreme은 자동으로 ClaBi 선택
      setSelectedLogos(prev => ({ ...prev, extreme: "12" }));
    }
  };

  // 로고 선택 처리
  const handleLogoSelect = (logoId: string) => {
    setSelectedLogos(prev => ({ ...prev, [currentSelectionStage]: logoId }));
  };

  // 모든 로고가 선택되었는지 확인
  const allLogosSelected = selectedLogos.easy && selectedLogos.normal && selectedLogos.hard && selectedLogos.extreme;

  const currentStageConfig = currentStageKey && getStageConfig(currentStageKey);
  const currentLogo = getCurrentLogo();

  const difficultyLabelMap: Record<Difficulty, string> = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    extreme: "Extreme",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* 헤더 */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Color Level Game
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              로고 색상 난이도 4단계 · 총 소요 시간으로 승부 보는 게임
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={toggleLeaderboard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg text-sm font-semibold"
            >
              🏆 리더보드
            </button>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Easy: 1색
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                Normal: 2색
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Hard: 3색
              </span>
              <span className="px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                Extreme: 5색 고정(ClaBi)
              </span>
            </div>
          </div>
        </header>

        {/* 메인 카드 */}
        {/* 카운트다운 오버레이 */}
        <StageCountdown 
          isVisible={showCountdown} 
          stageName={currentStageKey ? `${difficultyLabelMap[currentStageKey]} Stage` : ''}
          onComplete={handleCountdownComplete} 
        />

        <div className="grid lg:grid-cols-[2fr,1.1fr] gap-6">
          {/* 왼쪽: 게임 영역 */}
          <div className="bg-white/70 border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            {phase === "logo_selection" && (
              <div className="space-y-6">
                {/* 단계 인디케이터 */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentSelectionStage === "easy" && "1단계: Easy 로고 선택"}
                    {currentSelectionStage === "normal" && "2단계: Normal 로고 선택"}
                    {currentSelectionStage === "hard" && "3단계: Hard 로고 선택"}
                    {currentSelectionStage === "extreme" && "4단계: Extreme (자동 선택)"}
                  </h2>
                  
                  {/* 진행 상황 */}
                  <div className="flex gap-2">
                    {["easy", "normal", "hard", "extreme"].map((stage, index) => {
                      const isCompleted = selectedLogos[stage as Difficulty];
                      const isCurrent = currentSelectionStage === stage;
                      return (
                        <div
                          key={stage}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {currentSelectionStage !== "extreme" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {currentSelectionStage === "easy" && "하나의 Easy 로고를 선택하세요. (1색 로고)"}
                      {currentSelectionStage === "normal" && "하나의 Normal 로고를 선택하세요. (2색 로고)"}
                      {currentSelectionStage === "hard" && "하나의 Hard 로고를 선택하세요. (3색 로고)"}
                    </p>

                    {/* 로고 선택 */}
                    <div className="grid gap-3">
                      {getLogosForCurrentStage().map((logo) => {
                        const isSelected = selectedLogos[currentSelectionStage] === logo.id;
                        const originalIcon = ICONS.find(icon => icon.id.toString() === logo.id);
                        return (
                          <button
                            key={logo.id}
                            onClick={() => handleLogoSelect(logo.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                              isSelected
                                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-2xl ring-4 ring-blue-200 scale-105"
                                : "border-gray-300 bg-white/60 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* 로고 이미지 */}
                              {originalIcon?.imagePath && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={originalIcon.imagePath}
                                    alt={logo.name}
                                    className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-gray-200"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {logo.name}
                                  {isSelected && <span className="ml-2 text-blue-600">✓</span>}
                                </div>
                                <div className={`text-xs mb-2 ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                                  {logo.difficulty === 'easy' && '1색 로고'}
                                  {logo.difficulty === 'normal' && '2색 로고'}
                                  {logo.difficulty === 'hard' && '3색 로고'}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {logo.colors.slice(0, 3).map((c) => (
                                    <span
                                      key={c.hex}
                                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700"
                                    >
                                      <span
                                        className="h-3 w-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: c.hex }}
                                      />
                                      {c.hex}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 다음 버튼 */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextSelectionStage}
                        disabled={!selectedLogos[currentSelectionStage]}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all"
                      >
                        다음 단계
                        <span className="text-[11px] uppercase tracking-wide">Next</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Extreme 단계 - ClaBi 자동 선택 */
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Extreme 단계는 ClaBi 로고로 고정됩니다. (5색 로고)
                    </p>
                    
                    <div className="rounded-2xl border border-fuchsia-300 bg-fuchsia-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ICONS.find(icon => icon.id === 12)?.imagePath && (
                          <div className="flex-shrink-0">
                            <img
                              src={ICONS.find(icon => icon.id === 12)!.imagePath}
                              alt="ClaBi"
                              className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-gray-200"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-fuchsia-900">ClaBi ✓</div>
                          <div className="text-xs text-fuchsia-700 font-medium mb-2">5색 로고 (자동 선택)</div>
                          <div className="flex flex-wrap gap-1.5">
                            {['#5DA2E6', '#E58A3A', '#F0C44A', '#65A857', '#0E0E0E'].map((color) => (
                              <span
                                key={color}
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700"
                              >
                                <span
                                  className="h-3 w-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                />
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 게임 시작 버튼 */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleStartGame}
                        disabled={!allLogosSelected}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all"
                      >
                        4단계 게임 시작
                        <span className="text-[11px] uppercase tracking-wide">Start Game</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 선택된 로고 요약 */}
                {(selectedLogos.easy || selectedLogos.normal || selectedLogos.hard) && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900 mb-2">선택된 로고:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedLogos.easy && (
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                          <span>Easy: {LOGOS.find(l => l.id === selectedLogos.easy)?.name}</span>
                        </div>
                      )}
                      {selectedLogos.normal && (
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-sky-400 rounded-full"></span>
                          <span>Normal: {LOGOS.find(l => l.id === selectedLogos.normal)?.name}</span>
                        </div>
                      )}
                      {selectedLogos.hard && (
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                          <span>Hard: {LOGOS.find(l => l.id === selectedLogos.hard)?.name}</span>
                        </div>
                      )}
                      {selectedLogos.extreme && (
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-fuchsia-400 rounded-full"></span>
                          <span>Extreme: ClaBi</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase === "playing" && currentStageConfig && currentLogo && (
              <div className="space-y-5">
                {/* 상단 정보 */}
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase text-gray-500 tracking-wide">
                      Stage {stageIndex + 1} / 4
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {currentStageConfig.label} 단계
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                        {currentLogo.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="text-gray-600">
                      누적 시간:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatTime(totalElapsed + stageElapsed)}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      현재 스테이지 제한시간: {currentStageConfig.maxTimeSec}초
                    </span>
                  </div>
                </div>

                {/* 타이머 영역 */}
                <div className="rounded-2xl border border-gray-300 bg-white/80 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Stage Countdown</span>
                      <span>남은 시간 기준 · 0이 되면 자동 종료</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 transition-[width]"
                        style={{
                          width: `${
                            ((remainingTime || currentStageConfig.maxTimeSec) /
                              currentStageConfig.maxTimeSec) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        경과 시간:{" "}
                        <span className="text-gray-900 font-semibold">
                          {formatTime(stageElapsed)}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        남은 시간:{" "}
                        <span
                          className={`font-semibold ${
                            remainingTime <= 10 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {formatTime(remainingTime)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="w-px h-16 bg-gray-300 hidden md:block" />

                  {/* 중앙 큰 타이머 숫자 */}
                  <div className="flex flex-col items-center justify-center min-w-[140px]">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                      Remaining
                    </div>
                    <div className="text-3xl sm:text-4xl font-semibold tabular-nums text-gray-900">
                      {formatTime(remainingTime)}
                    </div>
                    <button
                      onClick={() => handleStageComplete(false)}
                      className="mt-3 text-xs rounded-full px-4 py-1.5 border border-gray-400 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-all"
                    >
                      스테이지 완료하기
                    </button>
                  </div>
                </div>

                {/* 색상 매칭 게임 */}
                <div className="space-y-5">
                  {/* 현재 로고 이미지와 타겟 색상 */}
                  <div className="text-center">
                    <div className="inline-flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                      {ICONS.find(icon => icon.id.toString() === currentLogo.id)?.imagePath && (
                        <div className="w-16 h-16 mb-4">
                          <img
                            src={ICONS.find(icon => icon.id.toString() === currentLogo.id)!.imagePath}
                            alt={currentLogo.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {currentLogo.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        색상 {currentColorIndex + 1} / {currentLogo.colors.length}
                      </p>
                      
                      {/* 타겟 색상 */}
                      <div className="mb-4">
                        <div 
                          className="w-24 h-24 rounded-2xl shadow-lg border-4 border-orange-400 mx-auto"
                          style={{ backgroundColor: currentLogo.colors[currentColorIndex].hex }}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          {currentLogo.colors[currentColorIndex].hex}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 사용자 색상 비교 */}
                  <div className="flex gap-4 items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">타겟</p>
                      <div 
                        className="w-20 h-20 rounded-xl border-2 border-gray-300"
                        style={{ backgroundColor: currentLogo.colors[currentColorIndex].hex }}
                      />
                    </div>
                    
                    <div className="text-2xl">→</div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">내 색상</p>
                      <div 
                        className="w-20 h-20 rounded-xl border-2 border-gray-300 transition-colors duration-200"
                        style={{ backgroundColor: rgbToHex(userColor) }}
                      />
                      <p className="text-xs text-gray-500 mt-1">{rgbToHex(userColor)}</p>
                    </div>
                  </div>

                  {/* RGB 슬라이더 */}
                  <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-gray-200">
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

                  {/* 정확도 표시 */}
                  <div className="text-center">
                    <div className="inline-flex flex-col items-center p-4 bg-gray-100 rounded-xl border border-gray-300">
                      <span className="text-gray-600 text-sm mb-1">정확도</span>
                      <span className={`text-3xl font-mono font-bold ${
                        accuracy >= 85 ? 'text-green-600' : 
                        accuracy >= 70 ? 'text-orange-500' : 'text-gray-600'
                      }`}>
                        {accuracy.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        85% 이상이면 성공!
                      </span>
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  {!showResult && !stageCompleted ? (
                    <button 
                      onClick={handleSubmitColor}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
                    >
                      색상 제출
                    </button>
                  ) : showResult && !stageCompleted ? (
                    <div className={`text-center p-4 rounded-xl font-bold text-lg ${
                      isCorrect 
                        ? "bg-green-100 text-green-800 border border-green-300" 
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                      {isCorrect ? "🎉 성공! 정확도 85% 이상!" : "😅 아쉽다! 다시 도전!"}
                      <div className="text-sm mt-1">정확도: {accuracy.toFixed(1)}%</div>
                    </div>
                  ) : stageCompleted ? (
                    <div className="text-center p-4 bg-blue-100 text-blue-800 rounded-xl border border-blue-300">
                      <div className="font-bold text-lg">🎆 {currentStageConfig.label} 단계 완료!</div>
                      <div className="text-sm mt-1">
                        {stageIndex < STAGE_ORDER.length - 1 ? 
                          `3초 후 ${difficultyLabelMap[STAGE_ORDER[stageIndex + 1]]} 단계가 시작됩니다...` : 
                          '게임 완료! 결과를 확인하세요...'
                        }
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {phase === "finished" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  🏆 4단계 모두 완료! 🎉
                </h2>
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                  <div className="text-center mb-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-700 mb-1">
                      Total Time
                    </div>
                    <div className="text-4xl font-semibold text-emerald-800">
                      {formatTime(totalElapsed)}
                    </div>
                    <div className="text-sm text-emerald-600 mt-2">
                      Easy → Normal → Hard → Extreme 모든 단계 클리어!
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={toggleLeaderboard}
                      className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-400 transition-colors font-semibold"
                    >
                      🏆 리더보드 보기
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors font-semibold"
                    >
                      다시 도전하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 기록 */}
          <div className="bg-white/70 border border-gray-200 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">🏆 베스트 기록</h3>
            <div className="space-y-2">
              {records.length === 0 ? (
                <div className="text-sm text-gray-500 italic">아직 기록이 없습니다</div>
              ) : (
                records.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-mono text-gray-900">
                        {formatTime(record.totalTime)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* 닉네임 모달 */}
        {gameResult && (
          <NicknameModal
            isOpen={showNicknameModal}
            onSubmit={handleNicknameSubmit}
            time={gameResult.time}
            accuracy={gameResult.accuracy}
            stage={gameResult.stage}
            lang="EN"
          />
        )}
        
        {/* 리더보드 */}
        <Leaderboard
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentStage={4}
          lang="EN"
        />
      </div>
    </div>
  );
};

export default ColorLogoGame;