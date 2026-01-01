import { Deck } from './Deck';
import { Participant, Player, Dealer, AI } from './Participant';
import { GamePhase, Result, ParticipantType } from '../types';
import confetti from 'canvas-confetti';

// Simple Event Emitter for State Updates
type Listener = () => void;

export class Game {
  public deck: Deck;
  public participants: Participant[] = [];
  public phase: GamePhase = GamePhase.Betting;
  public turnIndex: number = -1; // -1 means no one's turn
  
  private listeners: Listener[] = [];
  
  constructor() {
    this.deck = new Deck();
    this.setupTable();
  }

  private setupTable() {
    // Left AI, Player, Right AI, Dealer
    // Note: Dealer is usually index 3
    this.participants = [
      new AI('Sophia (AI)', 2000),
      new Player('You', 5000),
      new AI('Marcus (AI)', 2000),
      new Dealer()
    ];
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Actions ---

  public placeBet(amount: number) {
    const player = this.participants[1] as Player;
    if (player.money >= amount) {
      player.money -= amount;
      player.currentBet += amount;
      this.notify();
    }
  }

  public clearBet() {
    const player = this.participants[1] as Player;
    player.money += player.currentBet;
    player.currentBet = 0;
    this.notify();
  }

  public async startRound() {
    const player = this.participants[1];
    if (player.currentBet === 0) return;

    // Set AI Bets randomly for realism
    (this.participants[0] as AI).currentBet = 50 + Math.floor(Math.random() * 5) * 50;
    (this.participants[2] as AI).currentBet = 50 + Math.floor(Math.random() * 5) * 50;

    this.phase = GamePhase.Dealing;
    this.notify();

    // Reset Hands
    this.participants.forEach(p => p.resetHand());
    
    // Deal Initial Cards (2 each)
    // Sequence: AI1 -> Player -> AI2 -> Dealer -> AI1 -> Player -> AI2 -> Dealer
    for (let round = 0; round < 2; round++) {
      for (const p of this.participants) {
        await this.dealCardTo(p, (p.type === ParticipantType.Dealer && round === 1)); // Hide dealer 2nd card
      }
    }

    // Check for Instant Dealer Blackjack (if visible card is Ace/10 - logic simplified for demo)
    // Real casinos check peek. We will proceed to turns.
    
    this.phase = GamePhase.Playing;
    this.turnIndex = 0; // Start with Left AI
    this.notify();
    this.processTurn();
  }

  private async dealCardTo(participant: Participant, isHidden: boolean = false) {
    // Check if deck needs reshuffle
    if (this.deck.remaining < 20) {
      this.deck = new Deck(); 
      // In a real game we would notify "Reshuffling"
    }

    const card = this.deck.draw();
    if (card) {
      card.isHidden = isHidden;
      participant.receiveCard(card);
      this.notify();
      // Wait for animation duration (simulated logic pause)
      await new Promise(r => setTimeout(r, 600)); 
    }
  }

  // --- Turn Logic ---

  private async processTurn() {
    if (this.phase !== GamePhase.Playing) return;

    const currentActor = this.participants[this.turnIndex];

    if (!currentActor) {
      this.endRound();
      return;
    }

    // Is it Player?
    if (currentActor.type === ParticipantType.Player) {
      // Check for immediate Blackjack
      if (currentActor.isBlackjack) {
        this.advanceTurn();
      }
      // Otherwise wait for user input
      return; 
    }

    // Dealer Logic
    if (currentActor.type === ParticipantType.Dealer) {
        // Reveal hole card
        const holeCard = currentActor.hand.find(c => c.isHidden);
        if (holeCard) {
            holeCard.flip();
            this.notify();
            await new Promise(r => setTimeout(r, 600));
        }

        while (currentActor.score < 17) {
            await this.dealCardTo(currentActor);
        }
        await new Promise(r => setTimeout(r, 800)); // Dramatic pause
        this.advanceTurn();
        return;
    }

    // AI Logic
    if (currentActor.type === ParticipantType.AI) {
        // Simple delay for realism
        await new Promise(r => setTimeout(r, 1000));
        
        // Check blackjack
        if (currentActor.isBlackjack) {
             currentActor.message = "Blackjack!";
             this.notify();
             await new Promise(r => setTimeout(r, 1000));
             this.advanceTurn();
             return;
        }

        const dealerVisible = this.participants[3].hand[0].value;
        const ai = currentActor as AI;

        while (ai.shouldHit(dealerVisible)) {
            currentActor.message = "Hit";
            this.notify();
            await this.dealCardTo(ai);
            if (ai.isBusted) {
                currentActor.message = "Bust";
                this.notify();
                await new Promise(r => setTimeout(r, 800));
                break;
            }
        }
        
        if (!ai.isBusted) {
             currentActor.message = "Stand";
             this.notify();
             await new Promise(r => setTimeout(r, 800));
        }
        
        this.advanceTurn();
    }
  }

  public advanceTurn() {
    this.turnIndex++;
    if (this.turnIndex >= this.participants.length) {
       this.endRound();
    } else {
       this.notify();
       this.processTurn();
    }
  }

  // --- Player Actions ---

  public async playerHit() {
    if (this.turnIndex !== 1) return;
    const player = this.participants[1];
    
    await this.dealCardTo(player);
    
    if (player.isBusted) {
        player.message = "Bust!";
        this.notify();
        await new Promise(r => setTimeout(r, 1000));
        this.advanceTurn();
    }
  }

  public async playerStand() {
    if (this.turnIndex !== 1) return;
    const player = this.participants[1];
    player.message = "Stand";
    this.notify();
    this.advanceTurn();
  }

  public async playerDouble() {
      if (this.turnIndex !== 1) return;
      const player = this.participants[1];
      if (player.money >= player.currentBet) {
          player.money -= player.currentBet;
          player.currentBet *= 2;
          this.notify();
          await this.dealCardTo(player);
          // Double down is only one card
          if (player.isBusted) {
              player.message = "Bust!";
          } else {
              player.message = "Stand";
          }
          this.notify();
          await new Promise(r => setTimeout(r, 1000));
          this.advanceTurn();
      }
  }

  // --- Resolution ---

  private endRound() {
    this.phase = GamePhase.Resolving;
    const dealer = this.participants[3];
    const dealerScore = dealer.score;
    const dealerBusted = dealer.isBusted;
    const dealerBJ = dealer.isBlackjack;

    this.participants.forEach((p, index) => {
        if (p.type === ParticipantType.Dealer) return;

        if (p.isBusted) {
            p.result = Result.Loss;
            p.message = "Busted";
        } else if (dealerBJ) {
            if (p.isBlackjack) {
                p.result = Result.Push;
                p.money += p.currentBet;
                p.message = "Push";
            } else {
                p.result = Result.Loss;
                p.message = "Dealer has Blackjack";
            }
        } else if (p.isBlackjack) {
            p.result = Result.Blackjack;
            p.money += p.currentBet + (p.currentBet * 1.5);
            p.message = "Blackjack!";
            if (p.type === ParticipantType.Player) this.triggerWinEffect();
        } else if (dealerBusted) {
            p.result = Result.Win;
            p.money += p.currentBet * 2;
            p.message = "Dealer Busted";
            if (p.type === ParticipantType.Player) this.triggerWinEffect();
        } else if (p.score > dealerScore) {
            p.result = Result.Win;
            p.money += p.currentBet * 2;
            p.message = "Win";
            if (p.type === ParticipantType.Player) this.triggerWinEffect();
        } else if (p.score === dealerScore) {
            p.result = Result.Push;
            p.money += p.currentBet;
            p.message = "Push";
        } else {
            p.result = Result.Loss;
            p.message = "Lose";
        }
    });

    this.notify();

    // Auto restart countdown or manual? Let's do manual for now
    // But reset phase to betting after short delay so user can bet again
    setTimeout(() => {
        this.phase = GamePhase.Betting;
        this.turnIndex = -1;
        this.notify();
    }, 4000);
  }

  private triggerWinEffect() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFFFFF', '#C0C0C0']
    });
  }
}

export const gameInstance = new Game();