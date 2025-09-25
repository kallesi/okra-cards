export interface CardData {
  id: string;
  front: string;
  back: string;
  type: CardType;
  filePath: string; // Track which file the card came from
  scheduleInfo: {
    dueDate: Date;
    interval: number;
    ease: number;
    isDue: boolean;
  };
  context: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteData {
  id: string;
  title: string;
 content: string;
  tags: string[];
  cards: CardData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SrsSettings {
  hardFactor: number;
  easyBonus: number;
  maximumInterval: number;
  lapsesIntervalChange: number;
  baseEase: number;
  maxLinkFactor: number;
}

export const CardType = {
  Basic: 'basic',
  Reversed: 'reversed',
  Cloze: 'cloze',
  SingleLineBasic: 'singleLineBasic',
  SingleLineReversed: 'singleLineReversed',
  MultiLineBasic: 'multiLineBasic',
  MultiLineReversed: 'multiLineReversed',
} as const;

export type CardType = typeof CardType[keyof typeof CardType];

export const ReviewResponse = {
  Hard: 'hard',
  Good: 'good',
  Easy: 'easy',
} as const;

export type ReviewResponse = typeof ReviewResponse[keyof typeof ReviewResponse];

export interface FlashcardItem {
    front: string;
    back: string;
    type: string;
    context: string[];
    sourceFile: string;
    scheduleInfo?: {
        interval: number;
        ease: number;
        dueDate: Date;
        isDue: boolean;
    };
}

export interface FlashcardFile {
  path: string;
  content: string;
  lastModified: Date;
}