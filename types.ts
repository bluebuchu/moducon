export type Lang = 'EN' | 'ES';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LevelData {
  id: number;
  stage: 1 | 2 | 3;
  brand: string;
  targets: string[]; // Hex codes
}

export interface LevelProgress {
  bestAccuracy: number;
  unlocked: boolean;
  completed: boolean;
}

export type GameProgress = Record<number, LevelProgress>;

export type ViewState = 'MENU' | 'STAGE_SELECT' | 'GAME';
