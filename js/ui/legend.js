/**
 * Category legend component
 */

const Legend = {
    element: null,
    onCategoryClick: null,

    /**
     * Initialize legend
     * @param {Function} onCategoryClick - Callback when category is clicked
     */
    initialize(onCategoryClick) {
        this.element = document.getElementById('legend');
        this.onCategoryClick = onCategoryClick;

        return this;
    },

    /**
     * Render legend with categories from current filter options
     */
    render() {
        this.element.innerHTML = '';

        Filter.options.categories.forEach(category => {
            const color = CONFIG.CATEGORY_COLORS[category] || '#A8A8A8';
            const isEnabled = Filter.state.categories.has(category);

            const item = document.createElement('div');
            item.className = 'legend-item';
            if (!isEnabled) {
                item.classList.add('disabled');
            }
            item.dataset.category = category;

            const colorDot = document.createElement('span');
            colorDot.className = 'legend-color';
            colorDot.style.backgroundColor = color;

            const label = document.createElement('span');
            label.className = 'legend-label';
            label.textContent = category;

            item.appendChild(colorDot);
            item.appendChild(label);

            item.addEventListener('click', () => {
                this.toggleCategory(category);
            });

            this.element.appendChild(item);
        });
    },

    /**
     * Toggle a category on/off
     * @param {string} category - Category to toggle
     */
    toggleCategory(category) {
        const isEnabled = Filter.state.categories.has(category);
        Filter.setCategory(category, !isEnabled);

        // Update legend item
        const item = this.element.querySelector(`[data-category="${category}"]`);
        if (item) {
            item.classList.toggle('disabled', isEnabled);
        }

        // Trigger callback
        if (this.onCategoryClick) {
            this.onCategoryClick(category);
        }
    },

    /**
     * Update legend to reflect current filter state
     */
    update() {
        const items = this.element.querySelectorAll('.legend-item');
        items.forEach(item => {
            const category = item.dataset.category;
            const isEnabled = Filter.state.categories.has(category);
            item.classList.toggle('disabled', !isEnabled);
        });
    },
};
