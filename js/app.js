/**
 * Main application entry point
 */

const App = {
    // State
    currentDataset: 'harvard_core',
    data: null,
    isLoading: false,

    // DOM elements
    elements: {},

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing MIT-Harvard Network Visualization...');

        // Cache DOM elements
        this.elements = {
            datasetSelect: document.getElementById('dataset-select'),
            nodeCount: document.getElementById('node-count'),
            edgeCount: document.getElementById('edge-count'),
            visibleNodeCount: document.getElementById('visible-node-count'),
            loadingOverlay: document.getElementById('loading-overlay'),
            canvas: document.getElementById('network-canvas'),
            tooltip: document.getElementById('tooltip'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            zoomReset: document.getElementById('zoom-reset'),
        };

        // Initialize renderer
        Renderer.initialize(this.elements.canvas);

        // Initialize zoom
        Zoom.initialize(this.elements.canvas, (transform) => {
            Renderer.setTransform(transform);
            this.requestRender();
        });

        // Initialize sidebar
        Sidebar.initialize(() => {
            this.applyFilters();
        });

        // Initialize detail panel
        Detail.initialize((node) => {
            this.selectNode(node);
        });

        // Initialize legend
        Legend.initialize(() => {
            Sidebar.renderCategories(Network.nodes);
            this.applyFilters();
        });

        // Set up event listeners
        this.setupEventListeners();

        // Load initial dataset
        await this.loadDataset(this.currentDataset);

        console.log('Initialization complete');
    },

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Dataset selector
        this.elements.datasetSelect.addEventListener('change', (e) => {
            this.loadDataset(e.target.value);
        });

        // Zoom buttons
        this.elements.zoomIn.addEventListener('click', () => Zoom.zoomIn());
        this.elements.zoomOut.addEventListener('click', () => Zoom.zoomOut());
        this.elements.zoomReset.addEventListener('click', () => Zoom.reset());

        // Canvas mouse events
        const canvas = this.elements.canvas;
        let lastHoverCheck = 0;

        canvas.addEventListener('mousemove', (e) => {
            // Throttle hover checks
            const now = Date.now();
            if (now - lastHoverCheck < CONFIG.PERFORMANCE.HOVER_THROTTLE) return;
            lastHoverCheck = now;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const node = Network.findNodeAtPoint(x, y, Zoom.getTransform());
            this.handleHover(node, e.clientX, e.clientY);
        });

        canvas.addEventListener('mouseleave', () => {
            this.handleHover(null);
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const node = Network.findNodeAtPoint(x, y, Zoom.getTransform());
            this.handleClick(node);
        });

        canvas.addEventListener('dblclick', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const node = Network.findNodeAtPoint(x, y, Zoom.getTransform());
            if (node) {
                const { width, height } = Renderer.getDimensions();
                Zoom.zoomToNode(node, width, height);
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            const { width, height } = Renderer.resize();
            Network.updateCenter(width, height);
            this.requestRender();
        });
    },

    /**
     * Load a dataset
     * @param {string} datasetName - Dataset key
     */
    async loadDataset(datasetName) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            // Load data
            this.data = await DataLoader.load(datasetName);
            this.currentDataset = datasetName;

            // Initialize filter
            Filter.initialize(this.data);

            // Initialize network
            const { width, height } = Renderer.getDimensions();
            const simulation = Network.initialize(this.data, width, height);

            // Update UI
            this.updateStats();
            Sidebar.render(Network.nodes);
            Legend.render();

            // Initialize search
            Search.initialize(Network.nodes, (node) => {
                this.selectNode(node);
                const { width, height } = Renderer.getDimensions();
                Zoom.zoomToNode(node, width, height);
            });

            // Clear any selection
            this.clearSelection();

            // Set up simulation tick handler
            simulation.on('tick', () => {
                this.requestRender();
            });

            // Apply initial filters
            this.applyFilters();

            // Reset zoom
            Zoom.reset(false);

        } catch (error) {
            console.error('Failed to load dataset:', error);
            alert(`Failed to load dataset: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    },

    /**
     * Apply current filters and re-render
     */
    applyFilters() {
        const stats = Filter.apply(Network.nodes);
        this.updateVisibleStats(stats.visible);
        Legend.update();
        this.requestRender();
    },

    /**
     * Update main stats display
     */
    updateStats() {
        this.elements.nodeCount.textContent = this.data.metadata.nodeCount.toLocaleString();
        this.elements.edgeCount.textContent = this.data.metadata.edgeCount.toLocaleString();
    },

    /**
     * Update visible node count
     * @param {number} count - Visible node count
     */
    updateVisibleStats(count) {
        this.elements.visibleNodeCount.textContent = count.toLocaleString();
    },

    /**
     * Handle node hover
     * @param {Object|null} node - Hovered node
     * @param {number} mouseX - Mouse X position
     * @param {number} mouseY - Mouse Y position
     */
    handleHover(node, mouseX, mouseY) {
        Renderer.setHoveredNode(node);

        if (node) {
            this.showTooltip(node, mouseX, mouseY);
            this.elements.canvas.style.cursor = 'pointer';
        } else {
            this.hideTooltip();
            this.elements.canvas.style.cursor = 'default';
        }

        this.requestRender();
    },

    /**
     * Handle node click
     * @param {Object|null} node - Clicked node
     */
    handleClick(node) {
        if (node) {
            this.selectNode(node);
        } else {
            this.clearSelection();
        }
    },

    /**
     * Select a node
     * @param {Object} node - Node to select
     */
    selectNode(node) {
        Renderer.setSelectedNode(node);
        Detail.show(node);
        this.requestRender();
    },

    /**
     * Clear current selection
     */
    clearSelection() {
        Renderer.setSelectedNode(null);
        Detail.hide();
        this.requestRender();
    },

    /**
     * Show tooltip for a node
     * @param {Object} node - Node to show tooltip for
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     */
    showTooltip(node, x, y) {
        const tooltip = this.elements.tooltip;

        tooltip.querySelector('.tooltip-name').textContent = node.label;
        tooltip.querySelector('.tooltip-department').textContent = node.department || node.school || '';
        tooltip.querySelector('.tooltip-stats').textContent =
            `${node.paperCount} papers · ${node.degree} collaborators`;

        // Position tooltip
        const rect = this.elements.canvas.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left = x + 15;
        let top = y + 15;

        // Keep tooltip within bounds
        if (left + tooltipRect.width > rect.right) {
            left = x - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > rect.bottom) {
            top = y - tooltipRect.height - 15;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('visible');
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.elements.tooltip.classList.remove('visible');
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        this.elements.loadingOverlay.classList.remove('hidden');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    },

    /**
     * Request a render frame
     */
    requestRender() {
        if (this._renderRequested) return;
        this._renderRequested = true;

        requestAnimationFrame(() => {
            this._renderRequested = false;
            this.render();
        });
    },

    /**
     * Render the visualization
     */
    render() {
        if (!this.data) return;
        Renderer.render(Network.nodes, Network.edges);
    },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
});
