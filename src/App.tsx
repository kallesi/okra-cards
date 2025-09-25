import { useState } from 'react';
import Layout from './components/Layout';
import DirectorySelector from './components/DirectorySelector';
import FlashcardReview from './components/FlashcardReview';
import FileSelector from './components/FileSelector';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { CardType } from './types/flashcard.types';
import { FileSystemHandler } from './utils/fileSystemHandler';
import type { FlashcardItem, CardData } from './types/flashcard.types';


function App() {
    const [currentView, setCurrentView] = useState<'directory' | 'file-select' | 'review'>('directory');
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
    const [filesWithFlashcards, setFilesWithFlashcards] = useState<Record<string, FlashcardItem[]>>({});
    const [directoryHandle, setDirectoryHandle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (filesWithFlashcards: Record<string, FlashcardItem[]>, dirHandle: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Store all files with their flashcards
        setFilesWithFlashcards(filesWithFlashcards);

        // Set the directory handle
        setDirectoryHandle(dirHandle);

        // Set current flashcards to all flashcards from all files
        const allFlashcards = Object.values(filesWithFlashcards).flat();
        setFlashcards(allFlashcards);
        setCurrentView('file-select');
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setTimeout(() => setError(null), 500); // Clear error after 5 seconds
    };

    // Function to save progress after each card review
    const handleSaveProgress = async (updatedCard: CardData) => {
        try {
            // Save the updated card to the file
            const fileSystemHandler = new FileSystemHandler();
            await fileSystemHandler.saveSingleCardUpdate(directoryHandle, {
                filePath: updatedCard.filePath,
                front: updatedCard.front,
                back: updatedCard.back, // Include back content for unique identification
                scheduleInfo: {
                    interval: updatedCard.scheduleInfo.interval,
                    ease: updatedCard.scheduleInfo.ease,
                    dueDate: updatedCard.scheduleInfo.dueDate
                }
            });
            console.log('Updated card schedule saved successfully after review');
        } catch (error) {
            console.error('Error saving updated card schedule:', error);
        }
    };

    const handleReviewComplete = async (updatedCards: FlashcardItem[]) => {
        // Save the updated card schedules back to the files
        try {
            const fileSystemHandler = new FileSystemHandler();
            await fileSystemHandler.saveUpdatedFlashcards(directoryHandle, updatedCards.map(uc => ({
                filePath: uc.sourceFile,
                front: uc.front,
                back: uc.back, // Include back content for unique identification
                scheduleInfo: uc.scheduleInfo ? {
                    interval: uc.scheduleInfo.interval,
                    ease: uc.scheduleInfo.ease,
                    dueDate: uc.scheduleInfo.dueDate
                } : {
                    interval: 1, // Default if no schedule info
                    ease: 250,   // Default if no schedule info
                    dueDate: new Date() // Default if no schedule info
                }
            })));
            console.log('Updated card schedules saved successfully');
        } catch (error) {
            console.error('Error saving updated card schedules:', error);
        }
        setCurrentView('directory'); // Return to directory selection after review
    };


    return (
        <Layout>
            {error && (
                <div className="mt-3">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
            )}

            <Navbar bg="body" expand="lg" className="mb-4 border-bottom">
                <Container fluid="md">
                    <Navbar.Brand href="#home"></Navbar.Brand>
                    <Nav activeKey={currentView} onSelect={(key) => key && setCurrentView(key as 'directory' | 'file-select' | 'review')} className="me-auto">
                        <Nav.Item>
                            <Nav.Link eventKey="directory">Select Folder</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="file-select" disabled={Object.keys(filesWithFlashcards).length === 0}>
                                Select Set
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="review" disabled={flashcards.length === 0}>
                                Review ({flashcards.length} cards)
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>
            </Navbar>

            {currentView === 'directory' && (
                <DirectorySelector
                    onFilesSelected={handleFilesSelected}
                    onError={handleError}
                />
            )}

            {currentView === 'review' && (
                <FlashcardReview
                    cards={flashcards.map(fc => ({ // Convert FlashcardItem to CardData
                        id: `${fc.sourceFile}-${fc.front}`, // Create a stable ID based on file and front content
                        front: fc.front,
                        back: fc.back,
                        type: fc.type as CardType, // Convert string type to CardType
                        filePath: fc.sourceFile,
                        scheduleInfo: fc.scheduleInfo ? {
                            dueDate: fc.scheduleInfo.dueDate,
                            interval: fc.scheduleInfo.interval,
                            ease: fc.scheduleInfo.ease,
                            isDue: fc.scheduleInfo.isDue
                        } : {
                            dueDate: new Date(),
                            interval: 1,
                            ease: 250,
                            isDue: false
                        },
                        context: fc.context,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }))}
                    onReviewComplete={(updatedCards) => handleReviewComplete(updatedCards.map(uc => ({
                        front: uc.front,
                        back: uc.back,
                        type: uc.type,
                        context: uc.context,
                        sourceFile: uc.filePath, // Use the proper filePath from the card data
                        scheduleInfo: uc.scheduleInfo // Include schedule info
                    } as FlashcardItem)))}
                    onSaveProgress={handleSaveProgress} // Pass the save progress function
                />
            )}

            {currentView === 'file-select' && (
                <FileSelector
                    filesWithFlashcards={filesWithFlashcards}
                    onSelectFile={(fileName) => {
                        setFlashcards(filesWithFlashcards[fileName]);
                        setCurrentView('review');
                    }}
                    onSelectAll={() => {
                        setFlashcards(Object.values(filesWithFlashcards).flat());
                        setCurrentView('review');
                    }}
                />
            )}
        </Layout>
    );
}

export default App

