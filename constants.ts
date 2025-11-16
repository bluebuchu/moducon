import { Icon } from './types';

export const ICONS: Icon[] = [
  // Easy Stage - 1색 로고
  { 
    id: 1, 
    name: '모두의 연구소', 
    category: 'education',
    difficulty: 'easy',
    colors: ['#D86762'], // 코랄 레드
    imagePath: '/icons/모두의 연구소.png'
  },
  { 
    id: 2, 
    name: '텐스토렌트', 
    category: 'tech',
    difficulty: 'easy', 
    colors: ['#8A78FF'], // 퍼플
    imagePath: '/icons/텐스토렌트.png'
  },
  { 
    id: 3, 
    name: '이화여대 창업지원단', 
    category: 'education',
    difficulty: 'easy',
    colors: ['#2F6543'], // 딥 그린
    imagePath: '/icons/이화여자대학교.png'
  },
  { 
    id: 4, 
    name: '요즘IT', 
    category: 'tech',
    difficulty: 'easy',
    colors: ['#A55AFE'], // 퍼플 그라데이션
    imagePath: '/icons/요즘it.png'
  },
  
  // Normal Stage - 2색 로고
  { 
    id: 5, 
    name: 'AiFrenz', 
    category: 'tech',
    difficulty: 'normal',
    colors: ['#444444', '#C47A40'], // 다크 그레이, 오렌지 브라운
    imagePath: '/icons/ai프렌즈.png'
  },
  { 
    id: 6, 
    name: '카카오임팩트', 
    category: 'company',
    difficulty: 'normal',
    colors: ['#E8C44A', '#000000'], // 카카오 얐로우, 블랙
    imagePath: '/icons/카카오임팩트.png'
  },
  { 
    id: 7, 
    name: '제이펍', 
    category: 'company',
    difficulty: 'normal',
    colors: ['#9DC44A', '#000000'], // 라임그린, 블랙
    imagePath: '/icons/제이펍.png'
  },
  { 
    id: 8, 
    name: '고용노동부', 
    category: 'government',
    difficulty: 'normal',
    colors: ['#0F2A4A', '#C6342D'], // 네이비, 레드
    imagePath: '/icons/고용노동부.png'
  },
  
  // Hard Stage - 3색 로고
  { 
    id: 9, 
    name: '한국산업인력공단(HRDK)', 
    category: 'government',
    difficulty: 'hard',
    colors: ['#7EC7F7', '#4A84D9', '#234A89'], // 라이트 블루, 미디엄 블루, 네이비
    imagePath: '/icons/한국산업인력공단.png'
  },
  { 
    id: 10, 
    name: 'K-하이테크 플랫폼', 
    category: 'tech',
    difficulty: 'hard',
    colors: ['#5BA7E1', '#9CC56A', '#D48A45'], // 블루, 그린, 오렌지
    imagePath: '/icons/K하이테크 플랫폼.png'
  },
  { 
    id: 11, 
    name: '동그라미재단', 
    category: 'education',
    difficulty: 'hard',
    colors: ['#6A9D91', '#99ACA9', '#CFDCDC'], // 메인 그린, 라이트 그린/민트, 민트 그레이
    imagePath: '/icons/동그라미재단.png'
  },
  
  // Extreme Stage - 5색 로고 (고정)
  { 
    id: 12, 
    name: 'ClaBi', 
    category: 'company',
    difficulty: 'extreme',
    colors: ['#5DA2E6', '#E58A3A', '#F0C44A', '#65A857', '#0E0E0E'], // 블루, 오렌지, 얐로우, 그린, 블랙
    imagePath: '/icons/클라비.png'
  },
];

export const REQUIRED_ACCURACY = 90;

export const DIFFICULTY_SETTINGS = {
  easy: {
    colorVariations: 4,
    maxTimeSec: 60,
    label: 'Easy',
  },
  normal: {
    colorVariations: 5,
    maxTimeSec: 75,
    label: 'Normal',
  },
  hard: {
    colorVariations: 6,
    maxTimeSec: 90,
    label: 'Hard',
  },
  extreme: {
    colorVariations: 8,
    maxTimeSec: 120,
    label: 'Extreme',
  },
};

export const STORAGE_KEY_RECORDS = 'color-logo-game-records-v1';

export const TRANSLATIONS = {
  EN: {
    title: 'Color Level Game',
    subtitle: '로고 색상 난이도 4단계 · 총 소요 시간으로 승부 보는 게임',
    startGame: 'Start Game',
    selectDifficulty: 'Select Difficulty',
    easy: 'Easy (1 Color)',
    normal: 'Normal (2 Colors)',
    hard: 'Hard (3+ Colors)',
    selectIcon: 'Select Icon',
    of: 'of',
    originalColor: 'Which one is the original color?',
    correct: 'Correct!',
    wrong: 'Wrong!',
    nextPuzzle: 'Next Puzzle',
    stageComplete: 'Stage Complete!',
    tryAgain: 'Try Again',
    yourScore: 'Your Score',
    time: 'Time',
    accuracy: 'Accuracy',
    nextLevel: 'Next Level',
    retry: 'Retry',
    backToMenu: 'Back to Menu',
    puzzle: 'Puzzle',
    selectIconPrompt: 'Select an icon for puzzle',
    iconsSelected: 'icons selected',
    startPuzzles: 'Start Puzzles',
    averageAccuracy: 'Average Accuracy',
    totalTime: 'Total Time',
    resultTitle: 'Results',
    excellent: 'Excellent!',
    good: 'Good Job!',
    keepTrying: 'Keep Trying!',
    unlockNext: 'Next difficulty unlocked!',
    iconSelection: 'Icon Selection',
  },
  ES: {
    title: 'Coincidencia de Color K-Brand',
    subtitle: '¡Prueba tu memoria de colores con marcas coreanas!',
    startGame: 'Iniciar Juego',
    selectDifficulty: 'Seleccionar Dificultad',
    easy: 'Fácil (1 Color)',
    normal: 'Normal (2 Colores)',
    hard: 'Difícil (3+ Colores)',
    selectIcon: 'Seleccionar Icono',
    of: 'de',
    originalColor: '¿Cuál es el color original?',
    correct: '¡Correcto!',
    wrong: '¡Incorrecto!',
    nextPuzzle: 'Siguiente Puzzle',
    stageComplete: '¡Etapa Completa!',
    tryAgain: 'Intentar de Nuevo',
    yourScore: 'Tu Puntuación',
    time: 'Tiempo',
    accuracy: 'Precisión',
    nextLevel: 'Siguiente Nivel',
    retry: 'Reintentar',
    backToMenu: 'Volver al Menú',
    puzzle: 'Puzzle',
    selectIconPrompt: 'Selecciona un icono para el puzzle',
    iconsSelected: 'iconos seleccionados',
    startPuzzles: 'Iniciar Puzzles',
    averageAccuracy: 'Precisión Promedio',
    totalTime: 'Tiempo Total',
    resultTitle: 'Resultados',
    excellent: '¡Excelente!',
    good: '¡Buen Trabajo!',
    keepTrying: '¡Sigue Intentando!',
    unlockNext: '¡Siguiente dificultad desbloqueada!',
    iconSelection: 'Selección de Iconos',
  },
};

export const STORAGE_KEY_PROGRESS = 'k_brand_color_match_progress';
export const STORAGE_KEY_LANG = 'k_brand_color_match_lang';