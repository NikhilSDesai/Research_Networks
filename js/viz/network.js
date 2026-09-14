/**
 * D3 Force Simulation for network layout
 */

const Network = {
    simulation: null,
    nodes: [],
    edges: [],
    nodeMap: null,
    adjacency: null,

    /**
     * Initialize the force simulation
     * @param {Object} data - Processed dataset
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    initialize(data, width, height) {
        this.nodes = data.nodes;
        this.edges = data.edges;
        this.nodeMap = data.nodeMap;
        this.adjacency = data.adjacency;

        // Stop any existing simulation
        if (this.simulation) {
            this.simulation.stop();
        }

        // Initialize node positions randomly in a circle
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            const r = radius * (0.5 + Math.random() * 0.5);
            node.x = centerX + r * Math.cos(angle);
            node.y = centerY + r * Math.sin(angle);
            node.vx = 0;
            node.vy = 0;
        });

        // Create D3 force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('charge', d3.forceManyBody()
                .strength(CONFIG.FORCE.CHARGE_STRENGTH)
                .distanceMax(CONFIG.FORCE.CHARGE_DISTANCE_MAX))
            .force('link', d3.forceLink(this.edges)
                .id(d => d.id)
                .distance(CONFIG.FORCE.LINK_DISTANCE)
                .strength(d => CONFIG.FORCE.LINK_STRENGTH * d.normalizedWeight))
            .force('center', d3.forceCenter(centerX, centerY)
                .strength(CONFIG.FORCE.CENTER_STRENGTH))
            .force('collision', d3.forceCollide()
                .radius(d => this.getNodeRadius(d) * CONFIG.FORCE.COLLISION_RADIUS))
            .alphaDecay(CONFIG.FORCE.ALPHA_DECAY)
            .velocityDecay(CONFIG.FORCE.VELOCITY_DECAY);

        return this.simulation;
    },

    /**
     * Get node radius based on paper count
     * @param {Object} node - Node object
     * @returns {number} - Radius in pixels
     */
    getNodeRadius(node) {
        const t = node.sizePercentile;
        // Use easeInQuad for more spread at the top
        const eased = t * t;
        return CONFIG.NODE.MIN_RADIUS + eased * (CONFIG.NODE.MAX_RADIUS - CONFIG.NODE.MIN_RADIUS);
    },

    /**
     * Get edge width based on weight
     * @param {Object} edge - Edge object
     * @returns {number} - Width in pixels
     */
    getEdgeWidth(edge) {
        const t = edge.normalizedWeight;
        return CONFIG.EDGE.MIN_WIDTH + t * (CONFIG.EDGE.MAX_WIDTH - CONFIG.EDGE.MIN_WIDTH);
    },

    /**
     * Update simulation center when canvas resizes
     * @param {number} width - New width
     * @param {number} height - New height
     */
    updateCenter(width, height) {
        if (this.simulation) {
            this.simulation
                .force('center', d3.forceCenter(width / 2, height / 2))
                .alpha(0.3)
                .restart();
        }
    },

    /**
     * Reheat the simulation
     * @param {number} alpha - Alpha value (0-1)
     */
    reheat(alpha = 0.3) {
        if (this.simulation) {
            this.simulation.alpha(alpha).restart();
        }
    },

    /**
     * Stop the simulation
     */
    stop() {
        if (this.simulation) {
            this.simulation.stop();
        }
    },

    /**
     * Find node at a given point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} transform - Current zoom transform
     * @returns {Object|null} - Node at point or null
     */
    findNodeAtPoint(x, y, transform) {
        // Transform point to data coordinates
        const [dataX, dataY] = transform.invert([x, y]);

        // Check nodes in reverse order (top nodes first)
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (!node.visible) continue;

            const radius = this.getNodeRadius(node);
            const dx = node.x - dataX;
            const dy = node.y - dataY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Scale radius by zoom level for accurate hit detection
            if (dist <= radius) {
                return node;
            }
        }

        return null;
    },

    /**
     * Get neighbors of a node
     * @param {Object} node - Node object
     * @returns {Array} - Array of {node, weight} objects
     */
    getNeighbors(node) {
        const neighbors = this.adjacency.get(node.id) || [];
        return neighbors.map(n => ({
            node: this.nodeMap.get(n.nodeId),
            weight: n.weight,
            normalizedWeight: n.normalizedWeight,
        })).filter(n => n.node);
    },

    /**
     * Get edges connected to a node
     * @param {string} nodeId - Node ID
     * @returns {Array} - Connected edges
     */
    getConnectedEdges(nodeId) {
        return this.edges.filter(e => e.source.id === nodeId || e.target.id === nodeId);
    },

    /**
     * Get set of connected node IDs for a node
     * @param {string} nodeId - Node ID
     * @returns {Set} - Set of connected node IDs
     */
    getConnectedNodeIds(nodeId) {
        const connected = new Set();
        const neighbors = this.adjacency.get(nodeId) || [];
        neighbors.forEach(n => connected.add(n.nodeId));
        return connected;
    },

    /**
     * Drag handlers for nodes
     */
    dragStarted(event, node) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    },

    dragged(event, node, transform) {
        const [x, y] = transform.invert([event.x, event.y]);
        node.fx = x;
        node.fy = y;
    },

    dragEnded(event, node) {
        if (!event.active) this.simulation.alphaTarget(0);
        node.fx = null;
        node.fy = null;
    },
};
