/**
 * Search functionality for finding nodes
 */

const Search = {
    elements: {},
    nodes: [],
    onSelect: null,

    /**
     * Initialize search
     * @param {Array} nodes - All nodes
     * @param {Function} onSelect - Callback when node is selected
     */
    initialize(nodes, onSelect) {
        this.nodes = nodes;
        this.onSelect = onSelect;

        this.elements = {
            input: document.getElementById('search-input'),
            results: document.getElementById('search-results'),
        };

        this.setupEventListeners();

        return this;
    },

    /**
     * Update nodes reference
     * @param {Array} nodes - New nodes array
     */
    updateNodes(nodes) {
        this.nodes = nodes;
        this.clearResults();
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const input = this.elements.input;
        const results = this.elements.results;

        // Input handler
        input.addEventListener('input', () => {
            const query = input.value.trim();
            if (query.length >= CONFIG.UI.SEARCH_MIN_CHARS) {
                this.search(query);
            } else {
                this.clearResults();
            }
        });

        // Focus/blur handlers
        input.addEventListener('focus', () => {
            const query = input.value.trim();
            if (query.length >= CONFIG.UI.SEARCH_MIN_CHARS) {
                this.search(query);
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !results.contains(e.target)) {
                this.clearResults();
            }
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearResults();
                input.blur();
            } else if (e.key === 'Enter') {
                const firstResult = results.querySelector('.search-result');
                if (firstResult) {
                    firstResult.click();
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    },

    /**
     * Perform search
     * @param {string} query - Search query
     */
    search(query) {
        const queryLower = query.toLowerCase();
        const results = [];

        for (const node of this.nodes) {
            // Search in label (name)
            const nameMatch = node.label.toLowerCase().includes(queryLower);
            const deptMatch = node.department.toLowerCase().includes(queryLower);

            if (nameMatch || deptMatch) {
                // Calculate match score (prefer name matches)
                let score = 0;
                if (nameMatch) {
                    if (node.label.toLowerCase().startsWith(queryLower)) {
                        score = 100;
                    } else {
                        score = 50;
                    }
                } else {
                    score = 25;
                }

                // Boost by paper count
                score += node.paperCount / 100;

                results.push({ node, score });
            }

            if (results.length >= CONFIG.UI.SEARCH_MAX_RESULTS * 2) {
                break; // Early exit for performance
            }
        }

        // Sort by score and take top results
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, CONFIG.UI.SEARCH_MAX_RESULTS);

        this.renderResults(topResults.map(r => r.node));
    },

    /**
     * Render search results
     * @param {Array} nodes - Matching nodes
     */
    renderResults(nodes) {
        const results = this.elements.results;
        results.innerHTML = '';

        if (nodes.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No researchers found';
            results.appendChild(noResults);
        } else {
            nodes.forEach((node, index) => {
                const item = document.createElement('div');
                item.className = 'search-result';
                item.dataset.index = index;

                const name = document.createElement('div');
                name.className = 'search-result-name';
                name.textContent = node.label;
                item.appendChild(name);

                if (node.department) {
                    const dept = document.createElement('div');
                    dept.className = 'search-result-dept';
                    dept.textContent = node.department;
                    item.appendChild(dept);
                }

                item.addEventListener('click', () => {
                    this.selectNode(node);
                });

                results.appendChild(item);
            });
        }

        results.classList.add('visible');
    },

    /**
     * Clear search results
     */
    clearResults() {
        this.elements.results.innerHTML = '';
        this.elements.results.classList.remove('visible');
    },

    /**
     * Clear search input
     */
    clear() {
        this.elements.input.value = '';
        this.clearResults();
    },

    /**
     * Navigate through results with keyboard
     * @param {number} direction - 1 for down, -1 for up
     */
    navigateResults(direction) {
        const results = this.elements.results;
        const items = results.querySelectorAll('.search-result');
        if (items.length === 0) return;

        const current = results.querySelector('.search-result.active');
        let nextIndex = 0;

        if (current) {
            current.classList.remove('active');
            const currentIndex = parseInt(current.dataset.index);
            nextIndex = currentIndex + direction;
            if (nextIndex < 0) nextIndex = items.length - 1;
            if (nextIndex >= items.length) nextIndex = 0;
        }

        items[nextIndex].classList.add('active');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
    },

    /**
     * Select a node from search results
     * @param {Object} node - Selected node
     */
    selectNode(node) {
        this.clear();
        if (this.onSelect) {
            this.onSelect(node);
        }
    },
};
