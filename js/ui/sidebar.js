/**
 * Sidebar filter panel UI
 */

const Sidebar = {
    elements: {},
    onFilterChange: null,

    /**
     * Initialize sidebar UI
     * @param {Function} onFilterChange - Callback when filters change
     */
    initialize(onFilterChange) {
        this.onFilterChange = onFilterChange;

        // Cache DOM elements
        this.elements = {
            categoryFilters: document.getElementById('category-filters'),
            schoolFilters: document.getElementById('school-filters'),
            campusFilters: document.getElementById('campus-filters'),
            paperCountSlider: document.getElementById('paper-count-slider'),
            paperCountValue: document.getElementById('paper-count-value'),
            connectionCountSlider: document.getElementById('connection-count-slider'),
            connectionCountValue: document.getElementById('connection-count-value'),
            resetFilters: document.getElementById('reset-filters'),
            toggleCategories: document.getElementById('toggle-categories'),
            toggleSchools: document.getElementById('toggle-schools'),
            toggleCampuses: document.getElementById('toggle-campuses'),
        };

        // Set up event listeners
        this.setupEventListeners();

        return this;
    },

    /**
     * Set up event listeners for filter controls
     */
    setupEventListeners() {
        // Reset button
        this.elements.resetFilters.addEventListener('click', () => {
            Filter.reset();
            this.render(Network.nodes);
            this.triggerFilterChange();
        });

        // Toggle all categories
        this.elements.toggleCategories.addEventListener('click', () => {
            const allSelected = Filter.state.categories.size === Filter.options.categories.length;
            Filter.setAllCategories(!allSelected);
            this.renderCategories(Network.nodes);
            this.triggerFilterChange();
        });

        // Toggle all schools
        this.elements.toggleSchools.addEventListener('click', () => {
            const allSelected = Filter.state.schools.size === Filter.options.schools.length;
            Filter.setAllSchools(!allSelected);
            this.renderSchools(Network.nodes);
            this.triggerFilterChange();
        });

        // Toggle all campuses
        this.elements.toggleCampuses.addEventListener('click', () => {
            const allSelected = Filter.state.campuses.size === Filter.options.campuses.length;
            Filter.setAllCampuses(!allSelected);
            this.renderCampuses(Network.nodes);
            this.triggerFilterChange();
        });

        // Paper count slider
        this.elements.paperCountSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.paperCountValue.textContent = value;
            Filter.setMinPaperCount(value);
            this.triggerFilterChange();
        });

        // Connection count slider
        this.elements.connectionCountSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.connectionCountValue.textContent = value;
            Filter.setMinConnections(value);
            this.triggerFilterChange();
        });
    },

    /**
     * Trigger filter change callback with debounce
     */
    triggerFilterChange: debounce(function() {
        if (this.onFilterChange) {
            this.onFilterChange();
        }
    }, CONFIG.PERFORMANCE.FILTER_DEBOUNCE),

    /**
     * Render all filter controls
     * @param {Array} nodes - All nodes
     */
    render(nodes) {
        this.renderCategories(nodes);
        this.renderSchools(nodes);
        this.renderCampuses(nodes);
        this.renderSliders();
    },

    /**
     * Render category checkboxes
     * @param {Array} nodes - All nodes
     */
    renderCategories(nodes) {
        const counts = Filter.getCategoryCounts(nodes);
        const container = this.elements.categoryFilters;
        container.innerHTML = '';

        Filter.options.categories.forEach(category => {
            const count = counts.get(category) || 0;
            const color = CONFIG.CATEGORY_COLORS[category] || '#A8A8A8';
            const checked = Filter.state.categories.has(category);

            const item = this.createCheckboxItem(
                category,
                category,
                color,
                count,
                checked,
                (isChecked) => {
                    Filter.setCategory(category, isChecked);
                    this.triggerFilterChange();
                }
            );

            container.appendChild(item);
        });

        // Update toggle button text
        const allSelected = Filter.state.categories.size === Filter.options.categories.length;
        this.elements.toggleCategories.textContent = allSelected ? 'None' : 'All';
    },

    /**
     * Render school checkboxes
     * @param {Array} nodes - All nodes
     */
    renderSchools(nodes) {
        const counts = Filter.getSchoolCounts(nodes);
        const container = this.elements.schoolFilters;
        container.innerHTML = '';

        Filter.options.schools.forEach(school => {
            const count = counts.get(school) || 0;
            const checked = Filter.state.schools.has(school);

            const item = this.createCheckboxItem(
                school,
                school,
                null,
                count,
                checked,
                (isChecked) => {
                    Filter.setSchool(school, isChecked);
                    this.triggerFilterChange();
                }
            );

            container.appendChild(item);
        });

        // Update toggle button text
        const allSelected = Filter.state.schools.size === Filter.options.schools.length;
        this.elements.toggleSchools.textContent = allSelected ? 'None' : 'All';
    },

    /**
     * Render campus checkboxes
     * @param {Array} nodes - All nodes
     */
    renderCampuses(nodes) {
        const counts = Filter.getCampusCounts(nodes);
        const container = this.elements.campusFilters;
        container.innerHTML = '';

        Filter.options.campuses.forEach(campus => {
            const count = counts.get(campus) || 0;
            const checked = Filter.state.campuses.has(campus);

            const item = this.createCheckboxItem(
                campus,
                campus,
                null,
                count,
                checked,
                (isChecked) => {
                    Filter.setCampus(campus, isChecked);
                    this.triggerFilterChange();
                }
            );

            container.appendChild(item);
        });

        // Update toggle button text
        const allSelected = Filter.state.campuses.size === Filter.options.campuses.length;
        this.elements.toggleCampuses.textContent = allSelected ? 'None' : 'All';
    },

    /**
     * Render slider controls
     */
    renderSliders() {
        // Paper count slider
        this.elements.paperCountSlider.max = Filter.options.maxPaperCount;
        this.elements.paperCountSlider.value = Filter.state.minPaperCount;
        this.elements.paperCountValue.textContent = Filter.state.minPaperCount;

        // Connection count slider
        this.elements.connectionCountSlider.max = Filter.options.maxConnections;
        this.elements.connectionCountSlider.value = Filter.state.minConnections;
        this.elements.connectionCountValue.textContent = Filter.state.minConnections;
    },

    /**
     * Create a checkbox item element
     * @param {string} id - Unique identifier
     * @param {string} label - Display label
     * @param {string|null} color - Color swatch (optional)
     * @param {number} count - Count to display
     * @param {boolean} checked - Initial checked state
     * @param {Function} onChange - Callback when changed
     * @returns {HTMLElement} - Checkbox item element
     */
    createCheckboxItem(id, label, color, count, checked, onChange) {
        const item = document.createElement('label');
        item.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.addEventListener('change', () => onChange(checkbox.checked));

        const box = document.createElement('span');
        box.className = 'checkbox-box';

        item.appendChild(checkbox);
        item.appendChild(box);

        if (color) {
            const colorSwatch = document.createElement('span');
            colorSwatch.className = 'checkbox-color';
            colorSwatch.style.backgroundColor = color;
            item.appendChild(colorSwatch);
        }

        const labelSpan = document.createElement('span');
        labelSpan.className = 'checkbox-label';
        labelSpan.textContent = label;
        labelSpan.title = label; // Tooltip for truncated text
        item.appendChild(labelSpan);

        const countSpan = document.createElement('span');
        countSpan.className = 'checkbox-count';
        countSpan.textContent = count.toLocaleString();
        item.appendChild(countSpan);

        return item;
    },
};

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
