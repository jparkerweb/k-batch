// DOM Elements
const form = document.getElementById('batch-form');
const textInput = document.getElementById('text-input');
const maxBatchesSlider = document.getElementById('max-batches');
const minSentencesSlider = document.getElementById('min-sentences');
const minRequiredSlider = document.getElementById('min-required');
const maxIterationsSlider = document.getElementById('max-iterations');
const maxBatchesValue = document.getElementById('max-batches-value');
const minSentencesValue = document.getElementById('min-sentences-value');
const minRequiredValue = document.getElementById('min-required-value');
const maxIterationsValue = document.getElementById('max-iterations-value');
const splitSentencesToggle = document.getElementById('split-sentences');
const batchResults = document.getElementById('batch-results');
const analysisResults = document.getElementById('analysis-results');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const pasteBtn = document.getElementById('paste-btn');

// Update slider value displays
function updateSliderValues() {
    maxBatchesValue.textContent = maxBatchesSlider.value;
    minSentencesValue.textContent = minSentencesSlider.value;
    minRequiredValue.textContent = minRequiredSlider.value;
    maxIterationsValue.textContent = maxIterationsSlider.value;
}

// Add event listeners to sliders
maxBatchesSlider.addEventListener('input', updateSliderValues);
minSentencesSlider.addEventListener('input', updateSliderValues);
minRequiredSlider.addEventListener('input', updateSliderValues);
maxIterationsSlider.addEventListener('input', updateSliderValues);

// Clear textarea button
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    textInput.focus();
});

// Clear and paste button
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        textInput.value = text;
        textInput.focus();
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('Unable to paste from clipboard. Please check your browser permissions.');
    }
});

// Function to split text by new lines
function splitByNewLines(text) {
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

// Display batch results
function displayBatchResults(batches) {
    batchResults.innerHTML = '';
    
    if (batches.length === 0) {
        batchResults.innerHTML = '<p class="placeholder">No batches were created.</p>';
        return;
    }
    
    batches.forEach((batch, index) => {
        const batchElement = document.createElement('div');
        batchElement.className = 'batch';
        
        const batchHeader = document.createElement('div');
        batchHeader.className = 'batch-header';
        batchHeader.textContent = `Batch ${index + 1} (${batch.length} sentences)`;
        batchElement.appendChild(batchHeader);
        
        batch.forEach(sentence => {
            const sentenceElement = document.createElement('div');
            sentenceElement.className = 'sentence';
            sentenceElement.textContent = sentence;
            batchElement.appendChild(sentenceElement);
        });
        
        batchResults.appendChild(batchElement);
    });
}

// Display analysis results
function displayAnalysisResults(analysisData) {
    analysisResults.innerHTML = '';
    
    // Create a container for the analysis
    const analysisContainer = document.createElement('div');
    analysisContainer.className = 'analysis-content';
    
    // Add number of batches
    const batchCountElement = document.createElement('div');
    batchCountElement.className = 'analysis-item';
    batchCountElement.innerHTML = `<strong>Number of batches:</strong> ${analysisData.totalBatches}`;
    analysisContainer.appendChild(batchCountElement);
    
    // Add batch details
    analysisData.batches.forEach(batch => {
        const batchElement = document.createElement('div');
        batchElement.className = 'batch';
        
        const batchHeader = document.createElement('div');
        batchHeader.className = 'batch-header';
        batchHeader.textContent = `Batch ${batch.batchNumber} Analysis`;
        batchElement.appendChild(batchHeader);
        
        // Create statistics elements using the analysis data
        const statsElement = document.createElement('div');
        statsElement.className = 'batch-stats';
        statsElement.innerHTML = `
            <div class="analysis-item">Number of sentences: ${batch.sentenceCount}</div>
            <div class="analysis-item">Longest sentence: ${batch.longestSentence} characters</div>
            <div class="analysis-item">Shortest sentence: ${batch.shortestSentence} characters</div>
            <div class="analysis-item">Average sentence length: ${batch.averageSentenceLength} characters</div>
            <div class="analysis-item">Standard deviation: ${batch.standardDeviation}</div>
        `;
        
        batchElement.appendChild(statsElement);
        analysisContainer.appendChild(batchElement);
    });
    
    analysisResults.appendChild(analysisContainer);
}

// API functions
async function fetchParseSentences(text) {
    const response = await fetch('/api/parse-sentences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse sentences');
    }
    
    const data = await response.json();
    return data.sentences;
}

async function fetchKBatchSentences(sentences, options) {
    const response = await fetch('/api/k-batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentences, options }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process k-batch');
    }
    
    const data = await response.json();
    return data.batches;
}

async function fetchAnalyzeKBatches(batches) {
    const response = await fetch('/api/analyze-batches', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batches }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze batches');
    }
    
    const data = await response.json();
    return data.analysis;
}

// Process form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing... <span class="loading"></span>';
    batchResults.innerHTML = '<p class="placeholder">Processing...</p>';
    analysisResults.innerHTML = '<p class="placeholder">Processing...</p>';
    
    try {
        // Get form values
        const text = textInput.value;
        const options = {
            maxBatches: parseInt(maxBatchesSlider.value),
            minSentencesPerBatch: parseInt(minSentencesSlider.value),
            minSentencesRequired: parseInt(minRequiredSlider.value),
            maxIterations: parseInt(maxIterationsSlider.value)
        };
        
        // Get sentences based on toggle state
        let sentences;
        if (splitSentencesToggle.checked) {
            // Use the sentence parser
            sentences = await fetchParseSentences(text);
        } else {
            // Split by new lines
            sentences = splitByNewLines(text);
        }
        
        if (sentences.length === 0) {
            batchResults.innerHTML = '<p class="placeholder">No sentences found in the input text.</p>';
            analysisResults.innerHTML = '<p class="placeholder">No analysis available.</p>';
            return;
        }
        
        // Process with kBatchSentences using API
        const batches = await fetchKBatchSentences(sentences, options);
        
        // Display batch results
        displayBatchResults(batches);
        
        // Call analyzeKBatches using API and display analysis
        const analysis = await fetchAnalyzeKBatches(batches);
        displayAnalysisResults(analysis);
        
        // Log to console for debugging
        console.log('Sentences:', sentences);
        console.log('Batches:', batches);
        console.log('Analysis:', analysis);
    } catch (error) {
        console.error('Error processing text:', error);
        batchResults.innerHTML = `<p class="placeholder error">Error: ${error.message}</p>`;
        analysisResults.innerHTML = '<p class="placeholder">No analysis available due to error.</p>';
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Process Text';
    }
}); 