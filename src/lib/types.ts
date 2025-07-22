export type CardColor = "Red" | "Green" | "Blue" | "Yellow" | "Wild";
export type CardValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Skip"
  | "Reverse"
  | "Draw Two"
  | "Wild"
  | "Draw Four";

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Player {
  id:string;
  name: string;
  hand: Card[];
  isAI: boolean;
}

export type GameDirection = "clockwise" | "counterclockwise";

export interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  gameDirection: GameDirection;
  isGameOver: boolean;
  winner: Player | null;
  chosenColor: CardColor | null;
  turnMessage: string;
}
