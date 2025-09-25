import React from 'react';
import { Container } from 'react-bootstrap';
import { Sparkles } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-container">
            <div className="d-flex flex-column min-vh-100">
                <header className="bg-primary text-white p-3">
                    <div className="container d-flex align-items-center gap-2">
                        <img src="/okra.svg" alt="Okra Cards" width={32} height={32} className="me-2" />
                        <h1 className="h3 mb-0">Okra Cards</h1>
                    </div>
                </header>

                <main className="flex-grow-1 py-4">
                    <Container className="main-content">
                        {children}
                    </Container>
                </main>

                <footer className="bg-light p-3 mt-auto">
                    <div className="container text-center text-muted">
                        <small><Sparkles size={16} className="me-1" />Okra Cards - Spaced Repetition Flashcards <span role="img" aria-label="sparkle">✨</span></small>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Layout;