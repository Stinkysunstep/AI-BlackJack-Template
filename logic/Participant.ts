import { Card } from './Card';
import { ParticipantType, Result, IParticipantState } from '../types';

export class Participant {
  public id: string;
  public hand: Card[] = [];
  public money: number;
  public currentBet: number = 0;
  public result: Result = Result.None;
  public message: string | null = null;

  constructor(
    public name: string,
    public type: ParticipantType,
    startMoney: number = 1000
  ) {
    this.id = `p-${Math.random().toString(36).substr(2, 5)}`;
    this.money = startMoney;
  }

  public resetHand() {
    this.hand = [];
    this.currentBet = 0;
    this.result = Result.None;
    this.message = null;
  }

  public receiveCard(card: Card) {
    this.hand.push(card);
  }

  public get score(): number {
    let score = 0;
    let aces = 0;

    for (const card of this.hand) {
      if (card.isHidden) continue; 
      score += card.value;
      if (card.rank === 'A') aces += 1;
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  }

  public get isBusted(): boolean {
    return this.score > 21;
  }

  public get isBlackjack(): boolean {
    return this.hand.length === 2 && this.score === 21;
  }

  public toState(isTurn: boolean): IParticipantState {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      hand: [...this.hand], // Shallow copy for React
      score: this.score,
      money: this.money,
      currentBet: this.currentBet,
      result: this.result,
      message: this.message,
      isTurn
    };
  }
}

export class Player extends Participant {
  constructor(name: string, money: number) {
    super(name, ParticipantType.Player, money);
  }
}

export class Dealer extends Participant {
  constructor() {
    super('Dealer', ParticipantType.Dealer, 0);
  }
}

export class AI extends Participant {
  constructor(name: string, money: number) {
    super(name, ParticipantType.AI, money);
  }

  // Basic AI Decision Logic
  public shouldHit(dealerUpCardValue: number): boolean {
    const s = this.score;
    if (s < 12) return true;
    if (s >= 17) return false;
    
    // Basic strategy simplified
    if (s >= 12 && s <= 16) {
      return dealerUpCardValue >= 7; // Hit if dealer shows 7 or higher
    }
    return false;
  }
}