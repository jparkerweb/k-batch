# K-Batch

K-Batch is an intelligent text batching library that uses k-means clustering to group sentences by length for optimal processing. It's particularly useful for NLP tasks, machine learning batch processing, and any scenario where processing similar-length texts together improves efficiency.

![k-batch](https://raw.githubusercontent.com/jparkerweb/k-batch/refs/heads/main/.readme/k-batch.jpg)

## Why K-Batch?

When processing text in batches (especially for machine learning or NLP tasks), grouping sentences of similar length together can:

- Reduce padding waste
- Improve computational efficiency
- Optimize memory usage
- Enhance model training performance

K-Batch uses k-means clustering to automatically group your sentences into optimal batches based on length, while ensuring each batch meets minimum size requirements.

## Installation

```bash
npm install k-batch
```

## Quick Start

```javascript
const { kBatchSentences } = require('k-batch');

const sentences = [
  "This is a short sentence.",
  "A significantly longer sentence that should be in a different batch.",
  "Tiny.",
  "Here is another medium-length sentence.",
  // ... more sentences
];

// Get optimally batched sentences
const batches = kBatchSentences(sentences);

// Use your batches
batches.forEach((batch, index) => {
  console.log(`Batch ${index + 1}: ${batch.length} sentences`);
  // Process each batch...
});
```

## API Reference

### kBatchSentences(sentences, options)

The main function that batches sentences using k-means clustering.

#### Parameters

- `sentences` (Array): Array of strings to be batched
- `options` (Object, optional): Configuration options
  - `maxBatches` (Number): Maximum number of batches to create (default: 5)
  - `minSentencesPerBatch` (Number): Minimum sentences per batch (default: 4)
  - `minSentencesRequired` (Number): Minimum number of sentences required to perform splitting (default: 10)
  - `maxIterations` (Number): Maximum k-means iterations (default: 100)

#### Returns

- Array of arrays, where each inner array contains batched sentences

## Advanced Usage

### Custom Configuration

```javascript
const { kBatchSentences } = require('k-batch');

const sentences = [/* your sentences */];

const batches = kBatchSentences(sentences, {
  maxBatches: 3,
  minSentencesPerBatch: 5,
  minSentencesRequired: 15,
  maxIterations: 50
});
```

### Analyzing Batch Statistics

```javascript
const { kBatchSentences, analyzeKBatches } = require('k-batch');

const sentences = [/* your sentences */];
const batches = kBatchSentences(sentences);

// Get detailed statistics about your batches
const stats = analyzeKBatches(batches);
console.log(stats);
/* Output:
[
  {
    count: 11,
    longestLength: 39,
    shortestLength: 5,
    averageLength: 24.09,
    standardDeviation: 9.87
  },
  // ... stats for other batches
]
*/
```

## How It Works

K-Batch uses a modified k-means clustering algorithm to group sentences by length:

1. **Initial Clustering**: Sentences are clustered based on their character length using k-means
2. **Batch Enforcement**: Small clusters are merged to ensure each batch meets the minimum size requirement
3. **Sorting**: Within each batch, sentences are sorted from longest to shortest for optimal processing

The algorithm automatically determines the optimal number of clusters based on your data and constraints.

## Use Cases

- **NLP Processing**: Group similar-length texts for more efficient tokenization and embedding
- **Machine Learning**: Create optimized batches for training language models
- **API Requests**: Batch similar-length texts together when making API calls to language models
- **Text Generation**: Process prompts of similar lengths together for better throughput

## Performance Considerations

- K-Batch is optimized for datasets with varying sentence lengths
- For very large datasets (>10,000 sentences), consider processing in chunks
- The algorithm's time complexity is O(n * k * i), where:
  - n = number of sentences
  - k = number of clusters
  - i = number of iterations

## Web UI

K-Batch includes a simple web interface to help you visualize and experiment with the batching algorithm. The Web UI allows you to:

- Input your own text and see how it gets batched in real-time
- Adjust parameters using interactive sliders
- View detailed statistics for each batch
- Experiment with different text patterns to understand the clustering behavior

To use the Web UI:

```bash
cd webui
npm install
npm start
```

This will start a local server and open the interface in your browser. For more details, see the [Web UI README](webui/README.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need for efficient text processing in NLP tasks
- Uses a modified k-means algorithm optimized for text length clustering

---

Made with ❤️ for the NLP and ML community
