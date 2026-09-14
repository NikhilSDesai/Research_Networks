/**
 * Filter logic for network nodes
 */

const Filter = {
    // Current filter state
    state: {
        categories: new Set(),      // Selected categories (empty = all)
        schools: new Set(),         // Selected schools (empty = all)
        campuses: new Set(),        // Selected campuses (empty = all)
        minPaperCount: 0,
        minConnections: 0,
        searchQuery: '',
    },

    // Available options from current dataset
    options: {
        categories: [],
        schools: [],
        campuses: [],
        maxPaperCount: 0,
        maxConnections: 0,
    },

    /**
     * Initialize filter options from dataset metadata
     * @param {Object} data - Processed dataset
     */
    initialize(data) {
        this.options.categories = data.metadata.categories || [];
        this.options.schools = data.metadata.schools || [];
        this.options.campuses = data.metadata.campuses || [];
        this.options.maxPaperCount = data.metadata.maxPaperCount || 100;
        this.options.maxConnections = data.metadata.maxDegree || 100;

        // Reset state to include all
        this.state.categories.clear();
        this.state.schools.clear();
        this.state.campuses.clear();
        this.state.minPaperCount = 0;
        this.state.minConnections = 0;
        this.state.searchQuery = '';

        // Initially select all categories
        this.options.categories.forEach(cat => this.state.categories.add(cat));
        this.options.schools.forEach(school => this.state.schools.add(school));
        this.options.campuses.forEach(campus => this.state.campuses.add(campus));
    },

    /**
     * Check if a node passes current filters
     * @param {Object} node - Node to check
     * @returns {boolean} - Whether node is visible
     */
    isNodeVisible(node) {
        // Category filter
        if (this.state.categories.size > 0 && !this.state.categories.has(node.category)) {
            return false;
        }

        // School filter
        if (this.state.schools.size > 0 && node.school && !this.state.schools.has(node.school)) {
            return false;
        }

        // Campus filter
        if (this.state.campuses.size > 0 && node.campus && !this.state.campuses.has(node.campus)) {
            return false;
        }

        // Paper count filter
        if (node.paperCount < this.state.minPaperCount) {
            return false;
        }

        // Connection count filter
        if (node.degree < this.state.minConnections) {
            return false;
        }

        return true;
    },

    /**
     * Apply filters to all nodes
     * @param {Array} nodes - All nodes
     * @returns {Object} - Filter stats
     */
    apply(nodes) {
        let visibleCount = 0;

        nodes.forEach(node => {
            node.visible = this.isNodeVisible(node);
            if (node.visible) visibleCount++;
        });

        return {
            total: nodes.length,
            visible: visibleCount,
            filtered: nodes.length - visibleCount,
        };
    },

    /**
     * Toggle a category
     * @param {string} category - Category name
     * @param {boolean} enabled - Whether to enable
     */
    setCategory(category, enabled) {
        if (enabled) {
            this.state.categories.add(category);
        } else {
            this.state.categories.delete(category);
        }
    },

    /**
     * Toggle a school
     * @param {string} school - School name
     * @param {boolean} enabled - Whether to enable
     */
    setSchool(school, enabled) {
        if (enabled) {
            this.state.schools.add(school);
        } else {
            this.state.schools.delete(school);
        }
    },

    /**
     * Toggle a campus
     * @param {string} campus - Campus name
     * @param {boolean} enabled - Whether to enable
     */
    setCampus(campus, enabled) {
        if (enabled) {
            this.state.campuses.add(campus);
        } else {
            this.state.campuses.delete(campus);
        }
    },

    /**
     * Set minimum paper count
     * @param {number} count - Minimum paper count
     */
    setMinPaperCount(count) {
        this.state.minPaperCount = count;
    },

    /**
     * Set minimum connection count
     * @param {number} count - Minimum connections
     */
    setMinConnections(count) {
        this.state.minConnections = count;
    },

    /**
     * Set all categories enabled/disabled
     * @param {boolean} enabled - Whether to enable all
     */
    setAllCategories(enabled) {
        if (enabled) {
            this.options.categories.forEach(cat => this.state.categories.add(cat));
        } else {
            this.state.categories.clear();
        }
    },

    /**
     * Set all schools enabled/disabled
     * @param {boolean} enabled - Whether to enable all
     */
    setAllSchools(enabled) {
        if (enabled) {
            this.options.schools.forEach(school => this.state.schools.add(school));
        } else {
            this.state.schools.clear();
        }
    },

    /**
     * Set all campuses enabled/disabled
     * @param {boolean} enabled - Whether to enable all
     */
    setAllCampuses(enabled) {
        if (enabled) {
            this.options.campuses.forEach(campus => this.state.campuses.add(campus));
        } else {
            this.state.campuses.clear();
        }
    },

    /**
     * Reset all filters to default
     */
    reset() {
        this.setAllCategories(true);
        this.setAllSchools(true);
        this.setAllCampuses(true);
        this.state.minPaperCount = 0;
        this.state.minConnections = 0;
        this.state.searchQuery = '';
    },

    /**
     * Get category counts
     * @param {Array} nodes - All nodes
     * @returns {Map} - Category -> count
     */
    getCategoryCounts(nodes) {
        const counts = new Map();
        nodes.forEach(node => {
            counts.set(node.category, (counts.get(node.category) || 0) + 1);
        });
        return counts;
    },

    /**
     * Get school counts
     * @param {Array} nodes - All nodes
     * @returns {Map} - School -> count
     */
    getSchoolCounts(nodes) {
        const counts = new Map();
        nodes.forEach(node => {
            if (node.school) {
                counts.set(node.school, (counts.get(node.school) || 0) + 1);
            }
        });
        return counts;
    },

    /**
     * Get campus counts
     * @param {Array} nodes - All nodes
     * @returns {Map} - Campus -> count
     */
    getCampusCounts(nodes) {
        const counts = new Map();
        nodes.forEach(node => {
            if (node.campus) {
                counts.set(node.campus, (counts.get(node.campus) || 0) + 1);
            }
        });
        return counts;
    },
};
