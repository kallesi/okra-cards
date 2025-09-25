import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FolderOpen, Loader2 } from 'lucide-react';
import { FileSystemHandler } from '../utils/fileSystemHandler';
import { extractFlashcardsFromContent } from '../utils/fileUtils';
import type { FlashcardItem } from '../types/flashcard.types';


interface DirectorySelectorProps {
    onFilesSelected: (filesWithFlashcards: Record<string, FlashcardItem[]>, directoryHandle: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    onError: (error: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({ onFilesSelected, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleSelectDirectory = async () => {
        setIsLoading(true);
        setStatusMessage('Selecting directory...');

        try {
            const fileSystemHandler = new FileSystemHandler();
            const { files, directoryHandle } = await fileSystemHandler.selectAndReadDirectory();

            // Process the files to extract flashcards and group them by file
            const filesWithFlashcards: Record<string, FlashcardItem[]> = {};
            for (const file of files) {
                const flashcards = extractFlashcardsFromContent(
                    file.content,
                    ';;', // default separator
                    ';;;'  // default inverse separator
                );

                // Add source file info to each flashcard
                const flashcardsWithSource = flashcards.map(flashcard => ({
                    ...flashcard,
                    sourceFile: file.path
                }));

                filesWithFlashcards[file.path] = flashcardsWithSource;
            }

            const totalFlashcards = Object.values(filesWithFlashcards).flat().length;
            setStatusMessage(`Loaded ${totalFlashcards} flashcards from ${files.length} files`);
            onFilesSelected(filesWithFlashcards, directoryHandle);
        } catch (error) {
            console.error('Error selecting directory:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            onError(errorMessage);
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-5 text-center">
            <h2 className="mb-4"><span role="img" aria-label="wave">👋</span> Welcome to Okra Cards</h2>
            <p className="lead mb-4">
                <FolderOpen className="me-2 mb-1" size={20} />
                Select a folder containing your markdown (.md) or text (.txt) files with flashcards
            </p>

            <div className="mb-4">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSelectDirectory}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="me-2 spin" size={18} /> : <FolderOpen className="me-2" size={18} />}
                    {isLoading ? 'Loading...' : 'Select Flashcard Folder'}
                </Button>
            </div>

            {statusMessage && (
                <Alert variant={statusMessage.includes('error') ? 'danger' : 'info'}>
                    {statusMessage}
                </Alert>
            )}

            <div className="mt-4 text-start">
                <h5><span role="img" aria-label="info">ℹ️</span> Flashcard Format:</h5>
                <ul>
                    <li>📝 Basic: <code>Front ;; Back</code></li>
                    <li>🔄 Inverse: <code>Front ;;; Back</code> (creates both directions)</li>
                    <li>❓ Multi-line: <code>? Question</code> on one line, answer on the next</li>
                    <li>🔁 Multi-line inverse: <code>?? Question</code> on one line, answer on the next</li>
                </ul>
            </div>
        </div>
    );
};

export default DirectorySelector;