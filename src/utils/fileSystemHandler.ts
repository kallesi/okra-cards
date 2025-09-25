// Define types outside of the class
type FileSystemHandle = {
 kind: 'file' | 'directory';
 name: string;
 getFile: () => Promise<File>;
};

type DirectoryHandle = {
 getFileHandle: (name: string, options?: { create: boolean }) => Promise<FileHandle>;
  values: () => AsyncIterableIterator<FileSystemHandle>;
};

type FileHandle = {
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
};

import type { FlashcardFile } from '../types/flashcard.types';
import { extractFlashcardsFromContent } from './fileUtils';

/**
 * Handles file operations for the flashcard application
 * In a browser environment, this works with the File API
 */
export class FileSystemHandler {
  /**
   * Opens a directory picker and reads markdown/text files
   */
  async selectAndReadDirectory(): Promise<{ files: FlashcardFile[], directoryHandle: any }> { // eslint-disable-line @typescript-eslint/no-explicit-any
    if ('showDirectoryPicker' in window) {
      // Use the File System Access API if available (Chrome 86+)
      try {
        // @ts-expect-error - showDirectoryPicker is not yet in TypeScript definitions
        const directoryHandle = await window.showDirectoryPicker();
        const files = await this.readDirectoryContents(directoryHandle);
        return { files, directoryHandle };
      } catch (error) {
        console.error('Error accessing directory:', error);
        throw error;
      }
    } else {
      // Fallback to file input method - no directory handle available in this case
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.md,.txt';
        input.style.display = 'none';
        
        input.onchange = async (event) => {
          try {
            const files = (event.target as HTMLInputElement).files;
            if (!files) {
              reject(new Error('No files selected'));
              return;
            }
            
            const flashcardFiles: FlashcardFile[] = [];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (this.isValidFlashcardFile(file.name)) {
                const content = await file.text();
                flashcardFiles.push({
                  path: file.name,
                  content,
                  lastModified: new Date(file.lastModified)
                });
              }
            }
            
            resolve({ files: flashcardFiles, directoryHandle: null });
          } catch (error) {
            reject(error);
          }
        };
        
        input.click();
      });
    }
  }

 /**
   * Reads contents of a directory using the File System Access API
   */
  private async readDirectoryContents(directoryHandle: DirectoryHandle): Promise<FlashcardFile[]> {
    const flashcardFiles: FlashcardFile[] = [];
    
    for await (const entry of directoryHandle.values()) {
      const typedEntry = entry as FileSystemHandle;
      if (typedEntry.kind === 'file' && this.isValidFlashcardFile(typedEntry.name)) {
        const file = await typedEntry.getFile();
        const content = await file.text();
        flashcardFiles.push({
          path: typedEntry.name,
          content,
          lastModified: new Date(file.lastModified)
        });
      }
    }
    
    return flashcardFiles;
  }

  /**
   * Checks if a file is a valid flashcard file (.md or .txt)
   */
  private isValidFlashcardFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'md' || extension === 'txt';
  }
 /**
  * Processes files and extracts flashcards
  */
 async processFlashcardFiles(files: FlashcardFile[], separator: string = ';;', inverseSeparator: string = ';;;') {
    const allFlashcards = [];
    
    for (const file of files) {
      const flashcards = extractFlashcardsFromContent(file.content, separator, inverseSeparator);
      allFlashcards.push(...flashcards.map(flashcard => ({
        ...flashcard,
        sourceFile: file.path
      })));
    }
    
    return allFlashcards;
  }

 /**
  * Saves updated flashcard data back to files with SRS metadata
 */
 async saveUpdatedFlashcards(directoryHandle: DirectoryHandle | null, updatedCards: { filePath: string; front: string; back?: string; scheduleInfo: { interval: number; ease: number; dueDate: Date } }[]) {
  if (!directoryHandle) return;

  // Group updated cards by source file
  const cardsByFile: Record<string, { filePath: string; front: string; scheduleInfo: { interval: number; ease: number; dueDate: Date } }[]> = {};
  updatedCards.forEach(card => {
    if (!cardsByFile[card.filePath]) {
      cardsByFile[card.filePath] = [];
    }
    cardsByFile[card.filePath].push(card);
 });

  // Update each file with the SRS metadata
  for (const [fileName, cards] of Object.entries(cardsByFile)) {
    try {
      // Get the original file handle
      const fileHandle = await directoryHandle.getFileHandle(fileName);
      const originalFile = await fileHandle.getFile();
      const originalContent = await originalFile.text();

      // Update content with SRS metadata
      const { updateFileContentWithSrsData } = await import('./fileUtils'); // Dynamic import to avoid circular dependency
      const updatedContent = updateFileContentWithSrsData(originalContent, cards);

      // Write the updated content back to the file
      const writable = await fileHandle.createWritable();
      await writable.write(updatedContent);
      await writable.close();
    } catch (error) {
      console.error(`Error saving updated flashcards to ${fileName}:`, error);
      throw error;
    }
  }
 }

  /**
   * Saves a single updated card while preserving other cards' metadata in the file
   */
  async saveSingleCardUpdate(directoryHandle: DirectoryHandle | null, updatedCard: { filePath: string; front: string; back?: string; scheduleInfo: { interval: number; ease: number; dueDate: Date } }) {
   if (!directoryHandle) return;

   try {
     // Get the original file handle
     const fileHandle = await directoryHandle.getFileHandle(updatedCard.filePath);
     const originalFile = await fileHandle.getFile();
     const originalContent = await originalFile.text();

     // Update content with SRS metadata for the single card
     const { updateFileContentWithSrsData } = await import('./fileUtils'); // Dynamic import to avoid circular dependency
     const updatedContent = updateFileContentWithSrsData(originalContent, [updatedCard]);

     // Write the updated content back to the file
     const writable = await fileHandle.createWritable();
     await writable.write(updatedContent);
     await writable.close();
   } catch (error) {
     console.error(`Error saving updated card to ${updatedCard.filePath}:`, error);
     throw error;
   }
  }
}