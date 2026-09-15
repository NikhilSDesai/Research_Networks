# MIT-Harvard Research Network Visualization

Interactive web-based network visualization of research collaborations between MIT and Harvard faculty.

**Live demo:** https://nikhilsdesai.github.io/Research_Networks/

## Features

- **Canvas-based rendering** for smooth performance with 10,000+ nodes
- **Real-time force simulation** using D3.js force-directed layout
- **Interactive filtering** by research category, school, campus, paper count, and connection count
- **Search** with autocomplete to find researchers by name
- **Node details panel** showing researcher info and top collaborators
- **Zoom and pan** navigation with mouse wheel and drag
- **Responsive design** that works on desktop and tablet

## Tech Stack

- **D3.js v7** for force simulation and zoom/pan behavior
- **HTML5 Canvas** for high-performance rendering
- **Vanilla JavaScript** (no framework dependencies)
- **CSS3** with CSS variables for theming

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
│       └── legend.js       # Category legend
├── data/
│   ├── harvard_core.json       # 2,796 nodes, 31,976 edges
│   ├── harvard_extended.json   # 5,000 nodes, 170,397 edges
│   ├── mit_core.json           # 1,224 nodes, 515 edges
│   └── mit_extended.json       # 4,728 nodes, 53,950 edges
└── scripts/
    └── export_json.py      # CSV to JSON converter
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

## Running Locally

```bash
# Clone the repository
git clone https://github.com/NikhilSDesai/Research_Networks.git
cd Research_Networks

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Configuration

Edit `js/config.js` to customize:

- **Colors**: Category color mapping
- **Node sizing**: Min/max radius based on paper count
- **Edge styling**: Width, opacity, colors
- **Force simulation**: Charge strength, link distance, collision radius
- **Performance**: Level-of-detail thresholds, edge drawing limits

## Research Categories

- AI and Computer Science
- Advanced Manufacturing and Robotics
- Pharmaceuticals
- Medical, Dental and Public Health
- UrbanTech
- Arts and Social Sciences
- Public Admin and Law
- Business and Finance
- Education
- Genetics

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License
