/**
 * Zoom and pan behavior for the canvas
 */

const Zoom = {
    zoom: null,
    svg: null, // D3 selection for zoom behavior
    transform: d3.zoomIdentity,
    onZoom: null,

    /**
     * Initialize zoom behavior
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Function} onZoom - Callback when zoom changes
     */
    initialize(canvas, onZoom) {
        this.onZoom = onZoom;

        // Create D3 selection for canvas
        this.svg = d3.select(canvas);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([CONFIG.ZOOM.MIN, CONFIG.ZOOM.MAX])
            .on('zoom', (event) => {
                this.transform = event.transform;
                if (this.onZoom) {
                    this.onZoom(this.transform);
                }
            });

        // Apply zoom behavior to canvas
        this.svg.call(this.zoom);

        // Set initial transform
        this.reset(false);

        return this;
    },

    /**
     * Get current transform
     * @returns {Object} - D3 zoom transform
     */
    getTransform() {
        return this.transform;
    },

    /**
     * Reset to initial view
     * @param {boolean} animate - Whether to animate the transition
     */
    reset(animate = true) {
        const duration = animate ? CONFIG.ZOOM.DURATION : 0;

        this.svg.transition()
            .duration(duration)
            .call(this.zoom.transform, d3.zoomIdentity);
    },

    /**
     * Zoom in by a step
     */
    zoomIn() {
        this.svg.transition()
            .duration(CONFIG.ZOOM.DURATION)
            .call(this.zoom.scaleBy, 1.5);
    },

    /**
     * Zoom out by a step
     */
    zoomOut() {
        this.svg.transition()
            .duration(CONFIG.ZOOM.DURATION)
            .call(this.zoom.scaleBy, 0.67);
    },

    /**
     * Zoom to fit a specific node in view
     * @param {Object} node - Node to zoom to
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} scale - Target zoom scale
     */
    zoomToNode(node, width, height, scale = 2) {
        const x = width / 2 - node.x * scale;
        const y = height / 2 - node.y * scale;

        const transform = d3.zoomIdentity
            .translate(x, y)
            .scale(scale);

        this.svg.transition()
            .duration(CONFIG.ZOOM.DURATION)
            .call(this.zoom.transform, transform);
    },

    /**
     * Zoom to fit all visible nodes
     * @param {Array} nodes - All nodes
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} padding - Padding around the network
     */
    zoomToFit(nodes, width, height, padding = 50) {
        const visibleNodes = nodes.filter(n => n.visible);
        if (visibleNodes.length === 0) {
            this.reset();
            return;
        }

        // Find bounding box
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        visibleNodes.forEach(node => {
            const r = Network.getNodeRadius(node);
            minX = Math.min(minX, node.x - r);
            maxX = Math.max(maxX, node.x + r);
            minY = Math.min(minY, node.y - r);
            maxY = Math.max(maxY, node.y + r);
        });

        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;

        if (boxWidth === 0 || boxHeight === 0) {
            this.reset();
            return;
        }

        // Calculate scale to fit
        const scale = Math.min(
            (width - padding * 2) / boxWidth,
            (height - padding * 2) / boxHeight,
            CONFIG.ZOOM.MAX
        );

        // Calculate translation to center
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const x = width / 2 - centerX * scale;
        const y = height / 2 - centerY * scale;

        const transform = d3.zoomIdentity
            .translate(x, y)
            .scale(scale);

        this.svg.transition()
            .duration(CONFIG.ZOOM.DURATION)
            .call(this.zoom.transform, transform);
    },

    /**
     * Disable zoom (for dragging nodes)
     */
    disable() {
        this.svg.on('.zoom', null);
    },

    /**
     * Re-enable zoom
     */
    enable() {
        this.svg.call(this.zoom);
    },
};
