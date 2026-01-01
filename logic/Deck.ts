import { Card } from './Card';
import { Suit, Rank } from '../types';

export class Deck {
  private cards: Card[] = [];

  constructor(numberOfDecks: number = 6) {
    this.initialize(numberOfDecks);
  }

  private initialize(numberOfDecks: number) {
    this.cards = [];
    for (let i = 0; i < numberOfDecks; i++) {
      for (const suit of Object.values(Suit)) {
        for (const rank of Object.values(Rank)) {
          this.cards.push(new Card(suit, rank));
        }
      }
    }
    this.shuffle();
  }

  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): Card | undefined {
    return this.cards.pop();
  }

  public get remaining(): number {
    return this.cards.length;
  }
}