# MIT-Harvard Research Network Visualization

Interactive D3.js force-directed network visualization of research collaborations between MIT and Harvard faculty.

**Live demo:** https://nikhilsdesai.github.io/Research_Networks/

## Features

- Canvas-based rendering for 10K+ nodes
- Filter by research category, school, campus, paper count, and connections
- Search researchers by name
- Click nodes to view details and top collaborators
- Zoom and pan navigation

## Datasets

| Dataset | Nodes | Edges |
|---------|-------|-------|
| Harvard Extended | 5,000 | 170,397 |
| Harvard Core | 2,796 | 31,976 |
| MIT Extended | 4,728 | 53,950 |
| MIT Core | 1,224 | 515 |

## Running Locally

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```
