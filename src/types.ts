export interface TeamData {
  name: string;
  answers: Record<number, string | string[]>; // Can be single string or array for multi-part
  timestamp: number;
}

export interface Scores {
  [teamName: string]: Record<number, number | number[]>; // Can be single number or array for multi-part scoring
}

export interface GameState {
  currentRound: number;
  hasStarted: boolean;
}