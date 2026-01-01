import { Suit, Rank, ICard } from '../types';

export class Card implements ICard {
  public readonly id: string;
  
  constructor(
    public readonly suit: Suit,
    public readonly rank: Rank,
    public isHidden: boolean = false
  ) {
    this.id = `${rank}${suit}-${Math.random().toString(36).substr(2, 9)}`;
  }

  get value(): number {
    if (['J', 'Q', 'K'].includes(this.rank)) return 10;
    if (this.rank === 'A') return 11;
    return parseInt(this.rank);
  }

  get color(): string {
    return (this.suit === Suit.Hearts || this.suit === Suit.Diamonds) ? 'red' : 'black';
  }

  flip() {
    this.isHidden = !this.isHidden;
  }
}