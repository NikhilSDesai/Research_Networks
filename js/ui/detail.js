/**
 * Detail panel for showing node information
 */

const Detail = {
    elements: {},
    currentNode: null,
    onCollaboratorClick: null,

    /**
     * Initialize detail panel
     * @param {Function} onCollaboratorClick - Callback when collaborator is clicked
     */
    initialize(onCollaboratorClick) {
        this.onCollaboratorClick = onCollaboratorClick;

        this.elements = {
            sidebar: document.getElementById('detail-sidebar'),
            content: document.getElementById('detail-content'),
            closeBtn: document.getElementById('close-detail'),
        };

        // Close button handler
        this.elements.closeBtn.addEventListener('click', () => {
            this.hide();
        });

        return this;
    },

    /**
     * Show detail panel for a node
     * @param {Object} node - Node to display
     */
    show(node) {
        this.currentNode = node;
        this.render(node);
        this.elements.sidebar.classList.add('open');
    },

    /**
     * Hide detail panel
     */
    hide() {
        this.currentNode = null;
        this.elements.sidebar.classList.remove('open');
        this.renderEmpty();
    },

    /**
     * Get current node
     * @returns {Object|null}
     */
    getNode() {
        return this.currentNode;
    },

    /**
     * Render empty state
     */
    renderEmpty() {
        this.elements.content.innerHTML = `
            <div class="detail-empty">
                Click on a node to see details
            </div>
        `;
    },

    /**
     * Render node details
     * @param {Object} node - Node to display
     */
    render(node) {
        const color = node.color || CONFIG.CATEGORY_COLORS[node.category] || '#A8A8A8';
        const neighbors = Network.getNeighbors(node);
        const topCollaborators = neighbors.slice(0, CONFIG.UI.TOP_COLLABORATORS);

        let html = `
            <div class="detail-header">
                <div class="detail-name">${this.escapeHtml(node.label)}</div>
                <span class="detail-badge" style="background-color: ${color}20; color: ${color}">
                    <span class="detail-badge-color" style="background-color: ${color}"></span>
                    ${this.escapeHtml(node.category)}
                </span>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Affiliation</div>
                <div class="detail-info">
                    ${node.department ? `<div><strong>Department:</strong> ${this.escapeHtml(node.department)}</div>` : ''}
                    ${node.school ? `<div><strong>School:</strong> ${this.escapeHtml(node.school)}</div>` : ''}
                    ${node.campus ? `<div><strong>Campus:</strong> ${this.escapeHtml(node.campus)}</div>` : ''}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Statistics</div>
                <div class="detail-stats">
                    <div class="detail-stat">
                        <div class="detail-stat-value">${node.paperCount.toLocaleString()}</div>
                        <div class="detail-stat-label">Papers</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${node.degree.toLocaleString()}</div>
                        <div class="detail-stat-label">Collaborators</div>
                    </div>
                </div>
            </div>
        `;

        if (topCollaborators.length > 0) {
            html += `
                <div class="detail-section">
                    <div class="detail-section-title">Top Collaborators</div>
                    <div class="collaborator-list" id="collaborator-list">
                        ${topCollaborators.map(collab => `
                            <div class="collaborator-item" data-id="${this.escapeHtml(collab.node.id)}">
                                <span class="collaborator-name">${this.escapeHtml(collab.node.label)}</span>
                                <span class="collaborator-weight">${Math.round(collab.weight)} papers</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        this.elements.content.innerHTML = html;

        // Add click handlers to collaborators
        const collaboratorItems = this.elements.content.querySelectorAll('.collaborator-item');
        collaboratorItems.forEach(item => {
            item.addEventListener('click', () => {
                const nodeId = item.dataset.id;
                const node = Network.nodeMap.get(nodeId);
                if (node && this.onCollaboratorClick) {
                    this.onCollaboratorClick(node);
                }
            });
        });
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};
