# MIT-Harvard Network Visualization - Session Context

## Project Overview
Interactive D3.js force-directed network visualization of MIT-Harvard research collaborations, designed for deployment on GitHub Pages.

## Current Status: BLOCKED ON GITHUB PUSH

### What's Done
1. **All visualization code is complete and working**
2. **Data export script created and run**
3. **Local testing works** (was running on localhost:8080)
4. **GitHub repo created**: https://github.com/NikhilSDesai/Research_Networks (currently empty)

### What's Blocking
The `harvard_extended.json` file is ~28MB which is causing git push to fail with HTTP 400 errors. Need to:
1. Reduce file size to ~24MB by removing researchers with lowest paper counts
2. Then push to GitHub
3. Enable GitHub Pages

---

## File Structure

```
/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/visualisation/network/
├── index.html                 # Main HTML page
├── css/
│   ├── main.css              # Core styles (dark theme)
│   └── components.css        # UI component styles
├── js/
│   ├── app.js                # Main orchestrator
│   ├── config.js             # Configuration constants
│   ├── data/
│   │   ├── loader.js         # JSON loading with caching
│   │   └── filter.js         # Filter logic
│   ├── viz/
│   │   ├── network.js        # D3 force simulation
│   │   ├── renderer.js       # Canvas rendering
│   │   └── zoom.js           # Zoom/pan behavior
│   └── ui/
│       ├── sidebar.js        # Filter panel
│       ├── search.js         # Search autocomplete
│       ├── detail.js         # Node detail panel
│       └── legend.js         # Category legend
├── data/
│   ├── harvard_core.json     # 2,796 nodes, 31,976 edges (~4.4 MB) ✓
│   ├── harvard_extended.json # 8,491 nodes, 230,140 edges (~28 MB) ← TOO BIG
│   ├── mit_core.json         # 1,224 nodes, 515 edges (~0.4 MB) ✓
│   └── mit_extended.json     # 4,728 nodes, 53,950 edges (~7 MB) ✓
└── scripts/
    └── export_json.py        # CSV to JSON converter
```

---

## IMMEDIATE NEXT STEPS

### Step 1: Reduce harvard_extended.json size

Run this Python script to reduce the file to ~24MB:

```bash
cd "/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/visualisation/network"

python3 << 'EOF'
import json, os

with open('data/harvard_extended.json', 'r') as f:
    data = json.load(f)

print(f"Original: {len(data['nodes'])} nodes, {len(data['edges'])} edges")

# Keep top 7000 nodes by paper count
nodes_sorted = sorted(data['nodes'], key=lambda x: x['paperCount'], reverse=True)[:7000]
node_ids = {n['id'] for n in nodes_sorted}

# Filter edges
edges = [e for e in data['edges'] if e['source'] in node_ids and e['target'] in node_ids]

# Update degrees
deg = {}
for e in edges:
    deg[e['source']] = deg.get(e['source'], 0) + 1
    deg[e['target']] = deg.get(e['target'], 0) + 1
for n in nodes_sorted:
    n['degree'] = deg.get(n['id'], 0)

data['nodes'] = nodes_sorted
data['edges'] = edges
data['metadata']['nodeCount'] = len(nodes_sorted)
data['metadata']['edgeCount'] = len(edges)

with open('data/harvard_extended.json', 'w') as f:
    json.dump(data, f)

print(f"New: {len(nodes_sorted)} nodes, {len(edges)} edges")
print(f"Size: {os.path.getsize('data/harvard_extended.json')/1024/1024:.1f} MB")
EOF
```

### Step 2: Push to GitHub

```bash
cd "/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/visualisation/network"

# Clean slate
rm -rf .git

# Initialize fresh repo
git init
git add .
git commit -m "MIT-Harvard network visualization"

# Push to existing repo
git remote add origin https://github.com/NikhilSDesai/Research_Networks.git
git branch -M main
git push -u origin main --force
```

### Step 3: Enable GitHub Pages

1. Go to: https://github.com/NikhilSDesai/Research_Networks/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Click **Save**

Site will be live at: **https://nikhilsdesai.github.io/Research_Networks/**

---

## Source Data

Original CSV files are in:
```
/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/data/2023_2026/min_10_papers/gephi_category/
```

Files:
- Harvard_Core_nodes.csv, Harvard_Core_edges.csv
- Harvard_Extended_nodes.csv, Harvard_Extended_edges.csv
- MIT_Core_nodes.csv (edges from 2000 dataset)
- MIT_Extended_nodes.csv (edges from 2000 dataset)

MIT edges are in:
```
/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/data/2000/min_10_papers/gephi_category/
```

---

## Features Implemented

- **Canvas-based rendering** for performance (handles 10K+ nodes)
- **D3 force simulation** with charge, link, center, and collision forces
- **Zoom/pan** with d3-zoom
- **Filter panel**: Categories, Schools, Campus, Paper count slider, Connection count slider
- **Search**: Autocomplete by researcher name
- **Detail panel**: Shows node info + top 10 collaborators (clickable)
- **Legend**: Category colors (clickable to toggle)
- **Hover tooltips**: Name, department, stats
- **Level-of-detail**: Hides small nodes when zoomed out

---

## Category Colors

```javascript
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
```

---

## Testing Locally

```bash
cd "/Users/nikhildesai/Documents/01_Aretian/00_Analysis/mit_harvard/visualisation/network"
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## GitHub Info

- **Username**: NikhilSDesai
- **Repo**: Research_Networks
- **URL**: https://github.com/NikhilSDesai/Research_Networks
- **Pages URL** (after deployment): https://nikhilsdesai.github.io/Research_Networks/

---

## Session Notes

- Bash commands stopped working mid-session (unknown reason)
- All file writes still work
- The visualization code is complete and tested
- Just need to reduce file size and push
