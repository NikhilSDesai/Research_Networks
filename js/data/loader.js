/**
 * Data loading utilities
 */

const DataLoader = {
    cache: new Map(),

    /**
     * Load a dataset by name
     * @param {string} datasetName - Dataset key from CONFIG.DATASETS
     * @returns {Promise<Object>} - Loaded data with nodes, edges, metadata
     */
    async load(datasetName) {
        // Check cache first
        if (this.cache.has(datasetName)) {
            console.log(`Using cached data for ${datasetName}`);
            return this.cache.get(datasetName);
        }

        const filename = CONFIG.DATASETS[datasetName];
        if (!filename) {
            throw new Error(`Unknown dataset: ${datasetName}`);
        }

        const url = CONFIG.DATA_PATH + filename;
        console.log(`Loading data from ${url}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Loaded ${data.nodes.length} nodes, ${data.edges.length} edges`);

            // Process and index the data
            const processed = this.processData(data);

            // Cache it
            this.cache.set(datasetName, processed);

            return processed;
        } catch (error) {
            console.error(`Failed to load ${datasetName}:`, error);
            throw error;
        }
    },

    /**
     * Process raw data for visualization
     * @param {Object} data - Raw JSON data
     * @returns {Object} - Processed data with indices
     */
    processData(data) {
        // Create node map for quick lookup
        const nodeMap = new Map();
        data.nodes.forEach(node => {
            nodeMap.set(node.id, node);
        });

        // Create adjacency list for each node
        const adjacency = new Map();
        data.nodes.forEach(node => {
            adjacency.set(node.id, []);
        });

        // Process edges and build adjacency
        data.edges.forEach(edge => {
            const sourceAdj = adjacency.get(edge.source);
            const targetAdj = adjacency.get(edge.target);

            if (sourceAdj) {
                sourceAdj.push({
                    nodeId: edge.target,
                    weight: edge.weight,
                    normalizedWeight: edge.normalizedWeight,
                });
            }

            if (targetAdj) {
                targetAdj.push({
                    nodeId: edge.source,
                    weight: edge.weight,
                    normalizedWeight: edge.normalizedWeight,
                });
            }
        });

        // Sort adjacency lists by weight (descending)
        adjacency.forEach(neighbors => {
            neighbors.sort((a, b) => b.weight - a.weight);
        });

        // Compute paper count percentiles for sizing
        const paperCounts = data.nodes.map(n => n.paperCount).sort((a, b) => a - b);
        const paperCountPercentile = (count) => {
            const idx = paperCounts.findIndex(p => p >= count);
            return idx / paperCounts.length;
        };

        // Add computed properties to nodes
        data.nodes.forEach(node => {
            node.sizePercentile = paperCountPercentile(node.paperCount);
            // Initialize visibility
            node.visible = true;
            node.highlighted = false;
        });

        return {
            nodes: data.nodes,
            edges: data.edges,
            metadata: data.metadata,
            nodeMap,
            adjacency,
        };
    },

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    },

    /**
     * Get cached dataset names
     */
    getCachedDatasets() {
        return Array.from(this.cache.keys());
    },
};
