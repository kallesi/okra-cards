import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, ProgressBar } from 'react-bootstrap';
import { Eye, EyeOff, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { ReviewResponse } from '../types/flashcard.types';
import type { CardData } from '../types/flashcard.types';
import { ReviewSequencer } from '../utils/srsAlgorithm';

interface FlashcardReviewProps {
    cards: CardData[];
    onReviewComplete: (updatedCards: CardData[]) => void;
    onSaveProgress?: (updatedCard: CardData) => void; // New prop to save progress after each card
}

const FlashcardReview: React.FC<FlashcardReviewProps> = ({ cards, onReviewComplete, onSaveProgress }) => {
    const [sequencer, setSequencer] = useState<ReviewSequencer | null>(null);
    const [currentCard, setCurrentCard] = useState<CardData | null>(null);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });

    // Initialize the sequencer when cards are provided
    useEffect(() => {
        if (cards.length > 0) {
            // Use default settings
            const reviewSettings = {
                hardFactor: 1.2,
                easyBonus: 1.3,
                maximumInterval: 36525,
                lapsesIntervalChange: 0.5,
                baseEase: 250,
                maxLinkFactor: 0.3
            };

            const newSequencer = new ReviewSequencer(cards, reviewSettings);
            setSequencer(newSequencer);

            // Get the first card
            const firstCard = newSequencer.getCurrentCard();
            setCurrentCard(firstCard);
            setProgress(newSequencer.getProgress());
        }
    }, [cards]);

    const handleShowAnswer = () => {
        setIsAnswerVisible(true);
    };

    const handleResponse = async (response: ReviewResponse) => {
        if (sequencer) {
            // Save the current card before updating to the next one
            const cardToSave = currentCard;
            const nextCard = sequencer.nextCard(response);
            setCurrentCard(nextCard);
            setProgress(sequencer.getProgress());
            setIsAnswerVisible(false);

            // Save the updated card schedule after each response
            if (onSaveProgress && cardToSave) {
                const updatedCard = sequencer.getCardsWithUpdatedSchedules().find(c => c.id === cardToSave.id);
                if (updatedCard) {
                    await onSaveProgress(updatedCard);
                }
            }

            // If no more cards, complete the review session
            if (!sequencer.hasMoreCards()) {
                onReviewComplete(sequencer.getCardsWithUpdatedSchedules()); // Return cards with updated schedule info
            }
        }
    };

    if (!currentCard) {
        return (
            <div className="text-center py-5">
                <h3>No cards to review</h3>
                <p>Select a folder with flashcard files to get started.</p>
            </div>
        );
    }

    return (
        <div className="py-4">
            <Row className="mb-4">
                <Col>
                    <ProgressBar
                        now={progress.percentage}
                        label={`${progress.current} of ${progress.total}`}
                        variant="success"
                        style={{ height: '20px' }}
                    />
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <Card.Text className="lead">
                                {isAnswerVisible ? (
                                    <div>
                                        <div>{currentCard.front}</div>
                                        <hr className="my-3" />
                                        <div>{currentCard.back}</div>
                                    </div>
                                ) : (
                                    <span><EyeOff className="me-2" size={20} />{currentCard.front}</span>
                                )}
                            </Card.Text>
                        </Card.Body>

                        <Card.Footer className="d-flex justify-content-between">
                            {!isAnswerVisible ? (
                                <Button variant="primary" onClick={handleShowAnswer}>
                                    <Eye className="me-2" size={18} /> Show Answer
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleResponse(ReviewResponse.Hard)}
                                        size="sm"
                                    >
                                        <ThumbsDown className="me-2" size={16} /> Hard
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleResponse(ReviewResponse.Good)}
                                        size="sm"
                                    >
                                        <CheckCircle2 className="me-2" size={16} /> Good
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => handleResponse(ReviewResponse.Easy)}
                                        size="sm"
                                    >
                                        <ThumbsUp className="me-2" size={16} /> Easy
                                    </Button>
                                </>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default FlashcardReview;