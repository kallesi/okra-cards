import { ReviewResponse, type SrsSettings, type CardData } from '../types/flashcard.types';

export interface ScheduleInfo {
  interval: number;
  ease: number;
  dueDate: Date;
}

export class SrsCalculator {
  private settings: SrsSettings;

  constructor(settings: SrsSettings) {
    this.settings = settings;
  }

  /**
   * Calculates the new schedule based on the user's response
   */
  calculateSchedule(
    response: ReviewResponse,
    currentInterval: number,
    currentEase: number
  ): ScheduleInfo {
    let newInterval: number;
    let newEase: number = currentEase;

    switch (response) {
      case ReviewResponse.Hard:
        newInterval = Math.max(1, Math.round(currentInterval * this.settings.hardFactor));
        newEase = Math.max(130, currentEase - 20);
        break;
      case ReviewResponse.Good:
        newInterval = Math.round(currentInterval * currentEase / 100);
        break;
      case ReviewResponse.Easy:
        newInterval = Math.round(currentInterval * currentEase / 100 * this.settings.easyBonus);
        newEase = Math.round(currentEase + 15);
        break;
      default:
        throw new Error(`Invalid response: ${response}`);
    }

    // Apply maximum interval
    newInterval = Math.min(newInterval, this.settings.maximumInterval);

    return {
      interval: newInterval,
      ease: newEase,
      dueDate: this.calculateNextDueDate(newInterval)
    };
  }

  /**
   * Calculates the next due date based on the interval
   */
  private calculateNextDueDate(interval: number): Date {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + interval);
    return nextDueDate;
  }

  /**
   * Calculates initial schedule for a new card
   */
  calculateInitialSchedule(response: ReviewResponse): ScheduleInfo {
    // Initial interval is 1 day for new cards
    const initialInterval = 1;
    const initialEase = this.settings.baseEase;

    return this.calculateSchedule(response, initialInterval, initialEase);
  }
}

export class ReviewSequencer {
  private cards: CardData[];
  private currentIndex: number = 0;
  private currentCard: CardData | null = null;
  private srsCalculator: SrsCalculator;

  constructor(cards: CardData[], settings: SrsSettings) {
    this.cards = this.orderCards(cards);
    this.srsCalculator = new SrsCalculator(settings);
  }

  /**
   * Orders cards by due date, with new cards first
   */
  private orderCards(cards: CardData[]): CardData[] {
    return cards.sort((a, b) => {
      // If both are due or both are not due, sort by due date
      if (a.scheduleInfo.isDue && b.scheduleInfo.isDue) {
        return a.scheduleInfo.dueDate.getTime() - b.scheduleInfo.dueDate.getTime();
      }
      
      // Due cards come first
      if (a.scheduleInfo.isDue && !b.scheduleInfo.isDue) return -1;
      if (!a.scheduleInfo.isDue && b.scheduleInfo.isDue) return 1;
      
      // New cards come next
      if (!a.scheduleInfo.isDue && !b.scheduleInfo.isDue) {
        return a.scheduleInfo.dueDate.getTime() - b.scheduleInfo.dueDate.getTime();
      }
      
      return 0;
    });
  }

  /**
   * Gets the current card
   */
  getCurrentCard(): CardData | null {
    if (this.currentIndex < this.cards.length) {
      this.currentCard = this.cards[this.currentIndex];
      return this.currentCard;
    }
    return null;
  }

  /**
   * Processes the user's response and moves to the next card
   */
  nextCard(response: ReviewResponse): CardData | null {
    // Update current card schedule based on response
    if (this.currentCard) {
      const newSchedule = this.srsCalculator.calculateSchedule(
        response,
        this.currentCard.scheduleInfo.interval,
        this.currentCard.scheduleInfo.ease
      );

      this.currentCard.scheduleInfo = {
        ...this.currentCard.scheduleInfo,
        ...newSchedule
      };
    }

    this.currentIndex++;
    return this.getCurrentCard();
  }

  /**
   * Updates a specific card's schedule and returns the updated card
   */
  updateCardSchedule(cardId: string, response: ReviewResponse): CardData | null {
    const cardIndex = this.cards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const card = this.cards[cardIndex];
      const newSchedule = this.srsCalculator.calculateSchedule(
        response,
        card.scheduleInfo.interval,
        card.scheduleInfo.ease
      );

      this.cards[cardIndex] = {
        ...card,
        scheduleInfo: {
          ...card.scheduleInfo,
          ...newSchedule
        }
      };

      // If this is the current card, update the reference
      if (this.currentCard && this.currentCard.id === cardId) {
        this.currentCard = this.cards[cardIndex];
      }

      return this.cards[cardIndex];
    }
    return null;
  }

  /**
   * Checks if there are more cards to review
   */
  hasMoreCards(): boolean {
    return this.currentIndex < this.cards.length;
  }

  /**
   * Gets the progress of the current review session
   */
  getProgress(): { current: number; total: number; percentage: number } {
    const total = this.cards.length;
    const current = Math.min(this.currentIndex, total);
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return {
      current,
      total,
      percentage
    };
  }

  /**
   * Gets all cards with their updated schedules after review
   */
  getCardsWithUpdatedSchedules(): CardData[] {
    return [...this.cards];
  }
}