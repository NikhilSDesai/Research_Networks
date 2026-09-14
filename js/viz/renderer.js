/**
 * Canvas renderer for the network visualization
 */

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1, // Device pixel ratio
    transform: d3.zoomIdentity,

    // State
    hoveredNode: null,
    selectedNode: null,
    connectedNodes: new Set(),

    /**
     * Initialize the renderer
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    initialize(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        this.resize();

        // Handle window resize
        window.addEventListener('resize', () => this.resize());

        return this;
    },

    /**
     * Resize canvas to fit container
     */
    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.width = rect.width;
        this.height = rect.height;

        // Set canvas size accounting for device pixel ratio
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        // Scale context for retina displays
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        return { width: this.width, height: this.height };
    },

    /**
     * Set the current transform (from zoom)
     * @param {Object} transform - D3 zoom transform
     */
    setTransform(transform) {
        this.transform = transform;
    },

    /**
     * Set hovered node
     * @param {Object|null} node - Hovered node or null
     */
    setHoveredNode(node) {
        this.hoveredNode = node;
        if (node) {
            this.connectedNodes = Network.getConnectedNodeIds(node.id);
        } else if (!this.selectedNode) {
            this.connectedNodes.clear();
        }
    },

    /**
     * Set selected node
     * @param {Object|null} node - Selected node or null
     */
    setSelectedNode(node) {
        this.selectedNode = node;
        if (node) {
            this.connectedNodes = Network.getConnectedNodeIds(node.id);
        } else {
            this.connectedNodes.clear();
        }
    },

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.save();
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.fillStyle = '#0f172a'; // bg-primary
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    },

    /**
     * Render the full network
     * @param {Array} nodes - All nodes
     * @param {Array} edges - All edges
     */
    render(nodes, edges) {
        this.clear();

        const ctx = this.ctx;
        const transform = this.transform;
        const hasHighlight = this.hoveredNode || this.selectedNode;
        const highlightNode = this.hoveredNode || this.selectedNode;

        // Apply transform
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // Draw edges first (below nodes)
        this.renderEdges(ctx, edges, hasHighlight, highlightNode);

        // Draw nodes
        this.renderNodes(ctx, nodes, hasHighlight);

        ctx.restore();
    },

    /**
     * Render all edges
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} edges - All edges
     * @param {boolean} hasHighlight - Whether there's a highlighted node
     * @param {Object|null} highlightNode - The highlighted node
     */
    renderEdges(ctx, edges, hasHighlight, highlightNode) {
        const zoom = this.transform.k;

        // Sort edges: highlighted last (on top)
        const sortedEdges = hasHighlight
            ? edges.slice().sort((a, b) => {
                const aHighlight = this.isEdgeHighlighted(a, highlightNode);
                const bHighlight = this.isEdgeHighlighted(b, highlightNode);
                return aHighlight - bHighlight;
            })
            : edges;

        // Limit edges for performance at low zoom
        const edgesToDraw = zoom < 0.3
            ? sortedEdges.filter(e => e.normalizedWeight > 0.1)
            : sortedEdges;

        for (const edge of edgesToDraw) {
            const source = edge.source;
            const target = edge.target;

            // Skip if either endpoint is hidden
            if (!source.visible || !target.visible) continue;

            const isHighlighted = hasHighlight && this.isEdgeHighlighted(edge, highlightNode);

            let opacity = CONFIG.EDGE.OPACITY_DEFAULT;
            let color = CONFIG.EDGE.COLOR;

            if (hasHighlight) {
                if (isHighlighted) {
                    opacity = CONFIG.EDGE.OPACITY_HIGHLIGHT;
                    color = CONFIG.EDGE.HIGHLIGHT_COLOR;
                } else {
                    opacity = CONFIG.EDGE.OPACITY_DIM;
                }
            }

            const width = Network.getEdgeWidth(edge) / zoom;

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = Math.max(0.5 / zoom, width);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    },

    /**
     * Check if edge is connected to highlight node
     * @param {Object} edge - Edge to check
     * @param {Object} highlightNode - Highlighted node
     * @returns {boolean}
     */
    isEdgeHighlighted(edge, highlightNode) {
        if (!highlightNode) return false;
        return edge.source.id === highlightNode.id || edge.target.id === highlightNode.id;
    },

    /**
     * Render all nodes
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} nodes - All nodes
     * @param {boolean} hasHighlight - Whether there's a highlighted node
     */
    renderNodes(ctx, nodes, hasHighlight) {
        const zoom = this.transform.k;

        // Level of detail: hide small nodes when zoomed out
        const minRadius = zoom < CONFIG.PERFORMANCE.LOD_ZOOM_THRESHOLD
            ? CONFIG.PERFORMANCE.LOD_MIN_RADIUS
            : 0;

        for (const node of nodes) {
            if (!node.visible) continue;

            const radius = Network.getNodeRadius(node);

            // Skip small nodes at low zoom
            if (radius < minRadius) continue;

            const isHovered = node === this.hoveredNode;
            const isSelected = node === this.selectedNode;
            const isConnected = this.connectedNodes.has(node.id);

            let opacity = CONFIG.NODE.OPACITY_DEFAULT;
            let scale = 1;

            if (hasHighlight) {
                if (isHovered || isSelected || isConnected) {
                    opacity = 1;
                    if (isHovered) scale = CONFIG.NODE.HOVER_SCALE;
                    if (isSelected) scale = CONFIG.NODE.SELECTED_SCALE;
                } else {
                    opacity = CONFIG.NODE.OPACITY_DIM;
                }
            } else if (isHovered) {
                scale = CONFIG.NODE.HOVER_SCALE;
            }

            const finalRadius = radius * scale;

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, finalRadius, 0, 2 * Math.PI);
            ctx.fillStyle = node.color || CONFIG.CATEGORY_COLORS[node.category] || '#A8A8A8';
            ctx.globalAlpha = opacity;
            ctx.fill();

            // Draw selection ring
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, finalRadius + 3 / zoom, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 / zoom;
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;
    },

    /**
     * Get canvas dimensions
     * @returns {Object} - {width, height}
     */
    getDimensions() {
        return { width: this.width, height: this.height };
    },
};
