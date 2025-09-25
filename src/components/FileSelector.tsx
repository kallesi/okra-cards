import React from 'react';
import { ListGroup, Button, Alert } from 'react-bootstrap';
import { FileText, PlayCircle } from 'lucide-react';
import type { FlashcardItem } from '../types/flashcard.types';

interface FileSelectorProps {
    filesWithFlashcards: Record<string, FlashcardItem[]>;
    onSelectFile: (file: string) => void;
    onSelectAll: () => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({
    filesWithFlashcards,
    onSelectFile,
    onSelectAll
}) => {
    const fileEntries = Object.entries(filesWithFlashcards);

    return (
        <div className="py-4">
            <div className="text-center mb-4">
                <h2 className="mb-3"><FileText className="me-2" size={24} />Select Flashcard Set</h2>
                <p className="text-muted">
                    <span role="img" aria-label="choose">🗂️</span> Choose a file to review its flashcards, or review all
                </p>
            </div>

            <div className="d-flex justify-content-center mb-4">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onSelectAll}
                >
                    <PlayCircle className="me-2" size={20} />
                    Review All ({Object.values(filesWithFlashcards).flat().length} cards)
                </Button>
            </div>

            <ListGroup>
                {fileEntries.map(([fileName, flashcards]) => (
                    <ListGroup.Item
                        key={fileName}
                        action
                        onClick={() => onSelectFile(fileName)}
                        className="d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <FileText className="me-2" size={18} />
                            <strong>{fileName}</strong>
                            <div className="text-muted small">
                                {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <Button variant="outline-primary" size="sm">
                            <PlayCircle className="me-1" size={16} /> Review
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {fileEntries.length === 0 && (
                <Alert variant="info" className="mt-4">
                    No flashcard files found in the selected directory
                </Alert>
            )}
        </div>
    );
};

export default FileSelector;