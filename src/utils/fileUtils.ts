import type { FlashcardFile } from '../types/flashcard.types';

/**
 * Reads all markdown and text files from a given directory
 */
export const readFlashcardFiles = async (directoryPath: string): Promise<FlashcardFile[]> => {
  // In a real implementation, this would interact with the file system
  // For now, this is a placeholder that would be replaced with actual file reading logic
  console.log(`Reading files from directory: ${directoryPath}`);
  return [];
};

/**
 * Checks if a file is a valid flashcard file (.md or .txt)
 */
export const isValidFlashcardFile = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'md' || extension === 'txt';
};

/**
 * Extracts flashcards from a markdown file content
 */
interface FlashcardItem {
  front: string;
  back: string;
  type: string;
  context: string[];
}

export const extractFlashcardsFromContent = (content: string, separator: string = ';;', inverseSeparator: string = ';;;'): FlashcardItem[] => {
  const lines = content.split('\n');
  const flashcards: FlashcardItem[] = [];
  
  // Process different flashcard formats
 for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Single line format: Front ;; Back
    if (line.includes(separator)) {
      const [front, back] = line.split(separator).map(part => part.trim());
      flashcards.push({
        front,
        back,
        type: 'basic',
        context: []
      });
    }
    
    // Inverse format: Front ;;; Back (creates both directions)
    if (line.includes(inverseSeparator)) {
      const [front, back] = line.split(inverseSeparator).map(part => part.trim());
      flashcards.push({
        front,
        back,
        type: 'basic',
        context: []
      });
      flashcards.push({
        front: back,
        back: front,
        type: 'reversed',
        context: []
      });
    }
    
    // Multi-line format: ? Question \n Answer
    if (line.startsWith('?')) {
      const question = line.substring(1).trim();
      if (i + 1 < lines.length) {
        const answer = lines[i + 1].trim();
        flashcards.push({
          front: question,
          back: answer,
          type: 'multiLine',
          context: []
        });
        i++; // Skip the next line as it's part of this flashcard
      }
    }
    
    // Multi-line inverse format: ?? Question \n Answer
    if (line.startsWith('??')) {
      const question = line.substring(2).trim();
      if (i + 1 < lines.length) {
        const answer = lines[i + 1].trim();
        flashcards.push({
          front: question,
          back: answer,
          type: 'multiLine',
          context: []
        });
        flashcards.push({
          front: answer,
          back: question,
          type: 'reversed',
          context: []
        });
        i++; // Skip the next line as it's part of this flashcard
      }
    }
  }
  
  return flashcards;
};

/**
  * Updates file content with SRS metadata for flashcards
  */
 export const updateFileContentWithSrsData = (content: string, updatedCards: { front: string; back?: string; scheduleInfo: { interval: number; ease: number; dueDate: Date } }[], separator: string = ';;', inverseSeparator: string = ';;;'): string => {
  const lines = content.split('\n');
  const updatedLines = [...lines];

  // Create a copy of updatedCards to track which ones still need to be processed
  const remainingCards = [...updatedCards];

  // Process the file line by line to handle all cards
  for (let i = 0; i < updatedLines.length; i++) {
    const line = updatedLines[i].trim();
    
    // Check if this line contains a flashcard
    if (line.includes(separator) || line.includes(inverseSeparator) || line.startsWith('?') || line.startsWith('??')) {
      let cardFront = '';
      let cardBack = '';
      
      // Extract both front and back content for precise matching
      if (line.includes(separator)) {
        const [front, back] = line.split(separator).map(part => part.trim());
        cardFront = front;
        cardBack = back;
      } else if (line.includes(inverseSeparator)) {
        const [front, back] = line.split(inverseSeparator).map(part => part.trim());
        cardFront = front;
        cardBack = back;
      } else if (line.startsWith('?') || line.startsWith('??')) {
        const question = line.substring(line.startsWith('??') ? 2 : 1).trim();
        if (i + 1 < updatedLines.length) {
          const answer = updatedLines[i + 1].trim();
          cardFront = question;
          cardBack = answer;
        }
      }

      // Find a matching card using both front and back content for unique identification
      const cardIndex = remainingCards.findIndex(card => {
        // Match by front content, and if back is available, use it for additional precision
        const frontMatches = card.front === cardFront;
        if (card.back && cardBack) {
          return frontMatches && card.back === cardBack;
        }
        return frontMatches;
      });

      if (cardIndex !== -1) {
        const updatedCard = remainingCards[cardIndex];
        const srsMetadata = `<!-- SRS: interval=${updatedCard.scheduleInfo.interval}, ease=${updatedCard.scheduleInfo.ease}, due=${updatedCard.scheduleInfo.dueDate instanceof Date ? updatedCard.scheduleInfo.dueDate.toISOString() : new Date(updatedCard.scheduleInfo.dueDate).toISOString()} -->`;
        
        // Remove any existing SRS metadata for this card (look for next lines)
        // Find and remove all consecutive SRS metadata lines starting from the appropriate position
        let srsStartIndex = i + 1;
        
        // For multi-line cards, skip the answer line first
        if (line.startsWith('?') || line.startsWith('??')) {
          srsStartIndex = i + 2; // Skip both the question line (current) and answer line (i+1)
        }
        
        let srsCount = 0;
        while ((srsStartIndex + srsCount) < updatedLines.length &&
               updatedLines[srsStartIndex + srsCount].trim().startsWith('<!-- SRS:')) {
          srsCount++;
        }
        
        // Remove the SRS metadata lines if any exist
        if (srsCount > 0) {
          updatedLines.splice(srsStartIndex, srsCount);
        }

        // Add the new SRS metadata after the flashcard content
        const insertIndex = line.startsWith('?') || line.startsWith('??') ? i + 2 : i + 1;
        updatedLines.splice(insertIndex, 0, srsMetadata);
        
        // Remove this card from remaining cards
        remainingCards.splice(cardIndex, 1);
        
        // Adjust the loop counter to account for the inserted line
        i++; // Skip the inserted metadata line in the next iteration
      }
    }
  }

  // If there are still cards left that weren't found in the content, log them for debugging
  if (remainingCards.length > 0) {
    console.warn(`Could not find the following cards in the file to update:`, remainingCards.map(c => `Front: "${c.front}", Back: "${c.back || 'N/A'}"`));
  }

  return updatedLines.join('\n');
};
