/**
 * Configuration constants for the network visualization
 */

const CONFIG = {
    // Data paths
    DATA_PATH: 'data/',
    DATASETS: {
        harvard_core: 'harvard_core.json',
        harvard_extended: 'harvard_extended.json',
        mit_core: 'mit_core.json',
        mit_extended: 'mit_extended.json',
    },

    // Category colors (matching create_gephi_files.py)
    CATEGORY_COLORS: {
        'AI and Computer Science': '#1E3A8A',
        'Advanced Manufacturing and Robotics': '#166534',
        'Pharmaceuticals': '#073B4C',
        'Medical, Dental and Public Health': '#B91C1C',
        'UrbanTech': '#0891B2',
        'Arts and Social Sciences': '#EA580C',
        'Public Admin and Law': '#F77F00',
        'Business and Finance': '#FBBF24',
        'Education': '#9B5DE5',
        'Genetics': '#7C3AED',
        'Other': '#EC4899',
    },

    // Node rendering
    NODE: {
        MIN_RADIUS: 3,
        MAX_RADIUS: 20,
        HOVER_SCALE: 1.3,
        SELECTED_SCALE: 1.5,
        OPACITY_DEFAULT: 0.85,
        OPACITY_DIM: 0.15,
        OPACITY_HIDDEN: 0,
    },

    // Edge rendering
    EDGE: {
        MIN_WIDTH: 0.3,
        MAX_WIDTH: 3,
        OPACITY_DEFAULT: 0.2,
        OPACITY_HIGHLIGHT: 0.8,
        OPACITY_DIM: 0.03,
        COLOR: '#475569',
        HIGHLIGHT_COLOR: '#94a3b8',
    },

    // Force simulation
    FORCE: {
        CHARGE_STRENGTH: -80,
        CHARGE_DISTANCE_MAX: 300,
        LINK_DISTANCE: 60,
        LINK_STRENGTH: 0.3,
        CENTER_STRENGTH: 0.05,
        COLLISION_RADIUS: 1.5,
        ALPHA_DECAY: 0.02,
        VELOCITY_DECAY: 0.4,
    },

    // Zoom
    ZOOM: {
        MIN: 0.1,
        MAX: 8,
        INITIAL: 1,
        DURATION: 500,
    },

    // Performance
    PERFORMANCE: {
        HOVER_THROTTLE: 16, // ~60fps
        FILTER_DEBOUNCE: 150,
        LOD_ZOOM_THRESHOLD: 0.5, // Below this zoom, hide small nodes
        LOD_MIN_RADIUS: 5, // Minimum node radius to show when zoomed out
        EDGE_DRAW_LIMIT: 50000, // Max edges to draw
        PROGRESSIVE_EDGE_CHUNK: 5000, // Draw edges in chunks
    },

    // UI
    UI: {
        SEARCH_MIN_CHARS: 2,
        SEARCH_MAX_RESULTS: 15,
        TOP_COLLABORATORS: 10,
    },
};

// Make CONFIG immutable
Object.freeze(CONFIG);
Object.keys(CONFIG).forEach(key => {
    if (typeof CONFIG[key] === 'object') {
        Object.freeze(CONFIG[key]);
    }
});
