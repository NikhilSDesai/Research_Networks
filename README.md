# MIT-Harvard Research Network Visualization

Interactive web-based network visualization of research collaborations between MIT and Harvard faculty.

**Interactive App:** https://nikhilsdesai.github.io/Research_Networks/

## Overview

This visualization displays co-authorship networks of researchers at MIT and Harvard. Nodes represent researchers, sized by publication count and colored by research category. Edges represent collaborations, weighted by number of co-authored papers.

## Features

- **Canvas-based rendering** for smooth performance with 10,000+ nodes
- **Real-time force simulation** using D3.js force-directed layout
- **Interactive filtering** by research category, school, campus, paper count, and connection count
- **Search** with autocomplete to find researchers by name
- **Node details panel** showing researcher info and top collaborators
- **Zoom and pan** navigation with mouse wheel and drag
- **Dark theme** with black network background and white sidebar borders

## Tech Stack

- **D3.js v7** for force simulation and zoom/pan behavior
- **HTML5 Canvas** for high-performance rendering
- **Vanilla JavaScript** (no framework dependencies)
- **CSS3** with CSS variables for theming
- **GitHub Pages** for hosting

## Project Structure

```
network/
├── index.html              # Main HTML page
├── css/
│   ├── main.css            # Core styles and layout
│   └── components.css      # UI component styles
├── js/
│   ├── app.js              # Main application orchestrator
│   ├── config.js           # Configuration constants
│   ├── data/
│   │   ├── loader.js       # JSON data loading with caching
│   │   └── filter.js       # Filter logic for nodes/edges
│   ├── viz/
│   │   ├── network.js      # D3 force simulation setup
│   │   ├── renderer.js     # Canvas rendering engine
│   │   └── zoom.js         # Zoom and pan behavior
│   └── ui/
│       ├── sidebar.js      # Filter panel controls
│       ├── search.js       # Search with autocomplete
│       ├── detail.js       # Node detail panel
│       └── legend.js       # Category legend (currently hidden)
├── data/
│   ├── harvard_core.json       # 2,796 nodes, 31,976 edges (~4.5 MB)
│   ├── harvard_extended.json   # 5,000 nodes, 170,397 edges (~21 MB)
│   ├── mit_core.json           # 1,224 nodes, 515 edges (~0.4 MB)
│   └── mit_extended.json       # 4,728 nodes, 53,950 edges (~7 MB)
├── images/
│   └── harvard_network.png # Screenshot for README
└── scripts/
    └── export_json.py      # CSV to JSON converter
```

## Data Source

Original CSV files are located at:
```
/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/data/2023_2026/min_10_papers/gephi_category/
```

Files:
- Harvard_Core_nodes.csv, Harvard_Core_edges.csv
- Harvard_Extended_nodes.csv, Harvard_Extended_edges.csv
- MIT_Core_nodes.csv, MIT_Extended_nodes.csv

MIT edges come from:
```
/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/data/2000/min_10_papers/gephi_category/
```

## Data Format

Each JSON dataset contains:

```json
{
  "metadata": {
    "name": "Dataset Name",
    "nodeCount": 1000,
    "edgeCount": 5000
  },
  "nodes": [
    {
      "id": "unique_id",
      "label": "Researcher Name",
      "category": "AI and Computer Science",
      "school": "School of Engineering",
      "campus": "Harvard",
      "paperCount": 42,
      "degree": 15
    }
  ],
  "edges": [
    {
      "source": "node_id_1",
      "target": "node_id_2",
      "weight": 5
    }
  ]
}
```

## Research Categories

- AI and Computer Science (#1E3A8A)
- Advanced Manufacturing and Robotics (#166534)
- Pharmaceuticals (#073B4C)
- Medical, Dental and Public Health (#B91C1C)
- UrbanTech (#0891B2)
- Arts and Social Sciences (#EA580C)
- Public Admin and Law (#F77F00)
- Business and Finance (#FBBF24)
- Education (#9B5DE5)
- Genetics (#7C3AED)
- Other (#EC4899)

## Configuration

Edit `js/config.js` to customize:

- **CATEGORY_COLORS**: Color mapping for research categories
- **NODE**: Min/max radius, opacity, hover/selected scaling
- **EDGE**: Width range, opacity, colors
- **FORCE**: Charge strength (-80), link distance (60), collision radius (1.5), alpha/velocity decay
- **ZOOM**: Min (0.1), max (8), initial (1)
- **PERFORMANCE**: LOD thresholds, edge draw limits

## UI Notes

- **Left sidebar**: Scrollable filter panel with categories, schools, campus, sliders
- **Right sidebar**: Detail panel appears when clicking a node
- **Bottom legend**: Hidden (was not usable at small sizes)
- **Borders**: White borders between sidebar and network panel
- **Background**: Pure black (#000000) for network canvas

## Running Locally

```bash
# Clone the repository
git clone https://github.com/NikhilSDesai/Research_Networks.git
cd Research_Networks

# Start a local server (port 8080 may be in use, try another)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## GitHub Info

- **Username**: NikhilSDesai
- **Repo**: Research_Networks
- **URL**: https://github.com/NikhilSDesai/Research_Networks
- **Pages URL**: https://nikhilsdesai.github.io/Research_Networks/

## Development Notes

- The `harvard_extended.json` was reduced from 8,491 to 5,000 nodes to keep file size under GitHub's limits (~24 MB)
- Attempted ForceAtlas2/OpenOrd pre-computed layouts but reverted to D3 force simulation
- A Python script for computing layouts exists in `scripts/compute_layout.py` (requires fa2, networkx, scipy in a venv)
- The `.venv/` folder is gitignored

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License
