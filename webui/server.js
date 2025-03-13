import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseSentences } from 'sentence-parse';
import { kBatchSentences, analyzeKBatches } from 'k-batch';

dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for parsing sentences
app.post('/api/parse-sentences', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const sentences = await parseSentences(text);
    res.json({ sentences });
  } catch (error) {
    console.error('Error parsing sentences:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for k-batch processing
app.post('/api/k-batch', async (req, res) => {
  try {
    const { sentences, options } = req.body;
    if (!sentences || !Array.isArray(sentences)) {
      return res.status(400).json({ error: 'Valid sentences array is required' });
    }
    
    const batches = await kBatchSentences(sentences, options);
    res.json({ batches });
  } catch (error) {
    console.error('Error processing k-batch:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for analyzing k-batches
app.post('/api/analyze-batches', async (req, res) => {
  try {
    const { batches } = req.body;
    if (!batches || !Array.isArray(batches)) {
      return res.status(400).json({ error: 'Valid batches array is required' });
    }
    
    const analysis = await analyzeKBatches(batches);
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing batches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to view the application`);
}); 