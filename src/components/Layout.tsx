import React from 'react';
import { Container, Dropdown } from 'react-bootstrap';
import { Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { theme, setTheme } = useTheme();



    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun size={18} />;
            case 'dark': return <Moon size={18} />;
            default: return <Monitor size={18} />;
        }
    };

    return (
        <div className="app-container">
            <div className="d-flex flex-column min-vh-100">
                <header className="bg-primary text-white p-3">
                    <div className="container d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <img src="/okra.svg" alt="Okra Cards" width={32} height={32} className="me-2 okra-icon" />
                            <h1 className="h3 mb-0">Okra Cards</h1>
                        </div>
                        <div>
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="light" size="sm" className="d-flex align-items-center">
                                    {getThemeIcon()}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setTheme('light')} active={theme === 'light'}>
                                        <Sun size={16} className="me-2" /> Light
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setTheme('dark')} active={theme === 'dark'}>
                                        <Moon size={16} className="me-2" /> Dark
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setTheme('auto')} active={theme === 'auto'}>
                                        <Monitor size={16} className="me-2" /> Auto
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
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