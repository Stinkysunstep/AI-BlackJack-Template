export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠'
}

export enum Rank {
  Two = '2', Three = '3', Four = '4', Five = '5', Six = '6',
  Seven = '7', Eight = '8', Nine = '9', Ten = '10',
  Jack = 'J', Queen = 'Q', King = 'K', Ace = 'A'
}

export enum GamePhase {
  Betting = 'BETTING',
  Dealing = 'DEALING',
  Playing = 'PLAYING', // Sub-phases handled by turn index
  Resolving = 'RESOLVING',
  GameOver = 'GAME_OVER'
}

export enum ParticipantType {
  Player = 'PLAYER',
  Dealer = 'DEALER',
  AI = 'AI'
}

export enum Result {
  None = 'NONE',
  Win = 'WIN',
  Loss = 'LOSS',
  Push = 'PUSH',
  Blackjack = 'BLACKJACK',
  Bust = 'BUST'
}

export interface ICard {
  suit: Suit;
  rank: Rank;
  id: string; // Unique ID for keying and animation
  isHidden: boolean;
}

export interface IParticipantState {
  id: string;
  type: ParticipantType;
  name: string;
  hand: ICard[];
  score: number;
  money: number;
  currentBet: number;
  isTurn: boolean;
  result: Result;
  message: string | null;
}

export interface IGameState {
  phase: GamePhase;
  deckCount: number;
  pot: number;
  turnIndex: number; // 0: AI1, 1: Player, 2: AI2, 3: Dealer
}