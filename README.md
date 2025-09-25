# Okra Cards

Okra Cards is an advanced flashcard application that implements spaced repetition algorithms similar to the popular Obsidian Spaced Repetition plugin. The app allows you to create and review flashcards from markdown files stored in a local folder, providing an efficient way to learn and retain information.

## Features

- **Local folder integration**: Select a folder containing your markdown (.md) or text (.txt) files to use as flashcard sources
- **Multiple flashcard formats**: Supports various flashcard formats including basic, reversed, and multi-line formats
- **Spaced Repetition System (SRS)**: Implements the SM-2 algorithm for optimal review scheduling
- **Multiple decks support**: Each deck is a separate markdown or text file in your selected folder
- **Auto-detection**: Automatically detects all cards in your selected folder
- **Cross-platform compatibility**: Works on all modern browsers with File System Access API support

## Installation

1. Clone or download the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser to the URL displayed in the terminal (typically `http://localhost:5173`)

## Flashcard Format

Okra Cards supports multiple flashcard formats in your markdown files:

### Basic Format
```
Front ;; Back
```

### Inverse Format (creates both directions)
```
Front ;;; Back
```

### Multi-line Format
```
? Question
Answer
```

### Multi-line Inverse Format
```
?? Question
Answer
```

## How to Use

1. Click on "Select Cards" in the navigation menu
2. Click "Select Flashcard Folder" to choose a directory containing your markdown/text files
3. The app will scan all `.md` and `.txt` files in the selected directory
4. Click "Review" in the navigation menu to start reviewing your flashcards
5. Click "Show Answer" to reveal the back of the card
6. Rate your recall using the "Hard", "Good", or "Easy" buttons

## Browser Compatibility

This application uses the File System Access API which is available in modern Chromium-based browsers (Chrome, Edge, etc.) version 86 and above. For other browsers, a fallback file selection method is provided.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files that can be served by any static web server.

## Technologies Used

- React with TypeScript
- React Bootstrap for UI components
- Vite as the build tool
- File System Access API for local file operations
- SM-2 algorithm for spaced repetition

## Contributing

We welcome contributions to Okra Cards! Please see our contributing guidelines for more information on how to get started.

## License

This project is open source and available under the MIT License.
