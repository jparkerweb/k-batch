# K-Batch Sentence Tester Web UI

A simple web interface for testing the `kBatchSentences` functionality from the k-batch library.

## Features

- Input text area for entering sentences to be processed
- Adjustable parameters via sliders:
  - MAX_BATCHES: Controls the maximum number of batches to create
  - MIN_SENTENCES_PER_BATCH: Sets the minimum number of sentences per batch
  - MIN_SENTENCES_REQUIRED: Minimum number of sentences required to split into batches
  - MAX_ITERATIONS: Maximum number of iterations for the k-means algorithm
- Real-time display of batch results
- Detailed analysis of each batch

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
cd webui
npm install
```

### Running the Web UI

Start the local development server:

```bash
npm start
```

This will open the web UI in your default browser.

## Project Structure

- `server.js` - Express server that serves the web UI and API endpoints
- `public/` - Directory containing all static assets:
  - `index.html` - Main HTML file
  - `styles.css` - CSS styles
  - `script.js` - JavaScript functionality
  - `favicon.png` - Application icon

## How to Use

1. Enter or paste your text in the text area
2. Adjust the parameters using the sliders as needed
3. Click the "Process Text" button
4. View the results in the right panel:
   - The top section shows the batches and their sentences
   - The bottom section displays analysis of each batch

## Notes

- The text is split into sentences using a combination of regex and rules
- The batching algorithm uses k-means clustering based on sentence length
- For best results, enter text with varied sentence lengths 