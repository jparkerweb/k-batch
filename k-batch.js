const MAX_BATCHES = 5; // Limit total batches
const MIN_SENTENCES_PER_BATCH = 4; // Minimum sentences per batch
const MIN_SENTENCES_REQUIRED = 10; // Only split if we have enough sentences
const MAX_ITERATIONS = 100; // To prevent infinite loops

// ------------------------
// -- Euclidean distance --
// ------------------------
function distance(a, b) {
    return Math.abs(a - b);
}

// -----------------------
// -- Compute centroids --
// -----------------------
function computeCentroids(clusters, lengths) {
    return clusters.map(cluster => {
        if (cluster.length === 0) return lengths[Math.floor(Math.random() * lengths.length)]; // Avoid empty cluster
        return cluster.reduce((sum, idx) => sum + lengths[idx], 0) / cluster.length;
    });
}

// ----------------------------
// -- K-Means implementation --
// ----------------------------
function kMeans(sentences, k, maxIterations) {
    const lengths = sentences.map(s => s.length);
    
    // Create an array of indices sorted by sentence length
    const sortedIndices = lengths.map((length, index) => ({ length, index }))
                                .sort((a, b) => a.length - b.length)
                                .map(item => item.index);
    
    // Select evenly spaced indices from the sorted array for initial centroids
    const step = Math.max(1, Math.floor(sortedIndices.length / k));
    let initialCentroidIndices = [];
    for (let i = 0; i < k; i++) {
        const idx = Math.min(i * step, sortedIndices.length - 1);
        initialCentroidIndices.push(sortedIndices[idx]);
    }
    
    // Use the lengths at these indices as initial centroids
    let centroids = initialCentroidIndices.map(idx => lengths[idx]);
    let clusters = new Array(k).fill(null).map(() => []);
    
    let prevCentroids = [];
    let iterations = 0;
    
    while (iterations < maxIterations && JSON.stringify(centroids) !== JSON.stringify(prevCentroids)) {
        clusters = new Array(k).fill(null).map(() => []);

        // Assign each sentence to the closest centroid
        lengths.forEach((length, i) => {
            let closest = centroids.reduce((best, c, ci) =>
                distance(length, c) < distance(length, centroids[best]) ? ci : best, 0);
            clusters[closest].push(i);
        });

        prevCentroids = [...centroids];
        centroids = computeCentroids(clusters, lengths);
        iterations++;
    }

    console.log(`iterations: ${iterations}`);

    return clusters;
}

// ------------------------------------
// -- Enforce batch size constraints --
// ------------------------------------
function enforceBatchSizeConstraints(batches, minSentencesPerBatch) {
    // Filter out empty batches
    let validBatches = batches.filter(batch => batch.length > 0);
    
    // If we have no valid batches, return the original input
    if (validBatches.length === 0) return batches;
    
    // Continue merging until all batches meet the minimum size or we can't merge anymore
    let mergeOccurred = true;
    while (mergeOccurred) {
        mergeOccurred = false;
        
        // Find the smallest batch
        let smallestBatchIndex = -1;
        let smallestBatchSize = Infinity;
        
        for (let i = 0; i < validBatches.length; i++) {
            if (validBatches[i].length < smallestBatchSize) {
                smallestBatchSize = validBatches[i].length;
                smallestBatchIndex = i;
            }
        }
        
        // If the smallest batch is already at or above the minimum size, we're done
        if (smallestBatchSize >= minSentencesPerBatch || validBatches.length <= 1) {
            break;
        }
        
        // Find the next smallest batch to merge with
        let nextSmallestIndex = -1;
        let nextSmallestSize = Infinity;
        
        for (let i = 0; i < validBatches.length; i++) {
            if (i !== smallestBatchIndex && validBatches[i].length < nextSmallestSize) {
                nextSmallestSize = validBatches[i].length;
                nextSmallestIndex = i;
            }
        }
        
        // Merge the smallest batch into the next smallest
        if (nextSmallestIndex !== -1) {
            validBatches[nextSmallestIndex] = [...validBatches[nextSmallestIndex], ...validBatches[smallestBatchIndex]];
            validBatches.splice(smallestBatchIndex, 1);
            mergeOccurred = true;
        }
    }
    
    return validBatches;
}


// ----------------------------
// -- Main batching function --
// ----------------------------
export async function kBatchSentences(sentences, options = {}) {
    // Apply default options or use provided options
    const config = {
        maxBatches: options.maxBatches || MAX_BATCHES,
        minSentencesPerBatch: options.minSentencesPerBatch || MIN_SENTENCES_PER_BATCH,
        minSentencesRequired: options.minSentencesRequired || MIN_SENTENCES_REQUIRED,
        maxIterations: options.maxIterations || MAX_ITERATIONS
    };

    if (sentences.length < config.minSentencesRequired) return [sentences];

    const numClusters = Math.min(config.maxBatches, Math.max(1, Math.floor(sentences.length / config.minSentencesPerBatch)));
    
    // Pass the config to kMeans
    const clusters = kMeans(sentences, numClusters, config.maxIterations);

    // Convert cluster indices to actual sentence batches
    let batches = clusters.map(cluster => cluster.map(i => sentences[i]));
    
    // Sort each batch internally from longest to shortest
    batches.forEach(batch => batch.sort((a, b) => b.length - a.length));

    // Enforce MIN_SENTENCES_PER_BATCH by merging small batches
    batches = enforceBatchSizeConstraints(batches, config.minSentencesPerBatch);

    return batches;
}


// ----------------------------
// -- Analyze batch function --
// ----------------------------
export async function analyzeKBatches(batches) {
    const analysis = {
        totalBatches: batches.length,
        batches: batches.map((batch, index) => {
            const sentenceLengths = batch.map(sentence => sentence.length);
            const longest = Math.max(...sentenceLengths);
            const shortest = Math.min(...sentenceLengths);
            const average = Math.round((sentenceLengths.reduce((sum, length) => sum + length, 0) / batch.length) * 100) / 100;
            const standardDeviation = parseFloat(Math.sqrt(sentenceLengths.reduce((sum, length) => 
                sum + Math.pow(length - average, 2), 0) / batch.length).toFixed(2));
            
            return {
                batchNumber: index + 1,
                sentenceCount: batch.length,
                longestSentence: longest,
                shortestSentence: shortest,
                averageSentenceLength: average,
                standardDeviation: standardDeviation
            };
        })
    };
    
    return analysis;
}
