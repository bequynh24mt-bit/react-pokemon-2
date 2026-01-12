
export interface Move {
  name: string;
  pwr: number;
  type: string;
}

export interface PokemonTemplate {
  id: number;
  name: string;
  type: string;
  maxHp: number;
  atk: number;
  img: string;
  moves: Move[];
  isLegendary?: boolean;
}

export interface PokemonInstance extends PokemonTemplate {
  level: number;
  currentHp: number;
  baseAtk: number;
  exp: number;
  uid: number;
}

export type GameState = 'start' | 'lobby' | 'battle' | 'vs';

export interface LogEntry {
  msg: string;
  type: 'normal' | 'player' | 'enemy' | 'system';
  id: number;
}
