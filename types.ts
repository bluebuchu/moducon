export type Lang = 'EN' | 'ES';
export type ViewState = 'HOME' | 'STAGE_SELECT' | 'GAME' | 'RESULTS';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Icon {
  id: number;
  name: string;
  category: string;
  difficulty: Difficulty; // Which difficulty stage this icon belongs to
  colors: string[]; // Hex colors for the brand
  emoji?: string; // Emoji representation for simplicity
  imagePath?: string; // Path to the icon image
}

export interface PuzzleResult {
  iconId: number;
  accuracy: number;
  timeSpent: number;
  isCorrect: boolean;
  selectedColorIndex: number;
  correctColorIndex: number;
}

export interface GameState {
  currentStage: Difficulty; // Current stage being selected from
  selectedIcons: number[]; // IDs of selected icons (3 total, one from each difficulty)
  currentLevel: number; // 0, 1, or 2 for game play
  levelResults: PuzzleResult[];
  startTime: number | null;
  totalTime: number;
}

export interface ColorOption {
  color: string;
  isCorrect: boolean;
}

export interface GameProgress {
  easy: {
    completed: boolean;
    bestTime: number;
    bestAccuracy: number;
    attempts: number;
  };
  normal: {
    completed: boolean;
    bestTime: number;
    bestAccuracy: number;
    attempts: number;
  };
  hard: {
    completed: boolean;
    bestTime: number;
    bestAccuracy: number;
    attempts: number;
  };
}