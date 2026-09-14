#!/usr/bin/env python3
"""
Convert Gephi CSV files to optimized JSON for the network visualization.

Creates JSON files with nodes, edges, and metadata for each network variant.
"""

import csv
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict


def title_case_name(name):
    """Convert lowercase name to title case for display."""
    # Handle special cases like "j.v." or "mcmurray"
    parts = name.split()
    result = []
    for part in parts:
        # Handle periods (e.g., "j.v." -> "J.V.")
        if '.' in part:
            result.append('.'.join(p.capitalize() for p in part.split('.')))
        # Handle hyphens (e.g., "el-jawahri" -> "El-Jawahri")
        elif '-' in part or '‐' in part:  # Regular hyphen and Unicode hyphen
            sep = '‐' if '‐' in part else '-'
            result.append(sep.join(p.capitalize() for p in part.split(sep)))
        else:
            result.append(part.capitalize())
    return ' '.join(result)


def load_nodes(filepath):
    """Load nodes from CSV file."""
    nodes = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            node_id = row['Id'].strip().lower()
            nodes[node_id] = {
                'id': node_id,
                'label': title_case_name(row.get('Label', node_id)),
                'department': row.get('Department', '').strip(),
                'school': row.get('School', '').strip(),
                'category': row.get('Category', 'Other').strip(),
                'paperCount': int(row.get('PaperCount', 0)),
                'color': row.get('colour', row.get('Colour', '#A8A8A8')).strip(),
                'lat': float(row['lat']) if row.get('lat') else None,
                'lon': float(row['lon']) if row.get('lon') else None,
                'campus': row.get('campus', '').strip(),
            }
    return nodes


def load_edges(filepath, nodes):
    """Load edges from CSV file and compute degrees."""
    edges = []
    max_weight = 0
    degree_count = defaultdict(int)

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            source = row['Source'].strip().lower()
            target = row['Target'].strip().lower()

            # Skip edges where one endpoint is missing from nodes
            if source not in nodes or target not in nodes:
                continue

            # Parse weight (could be integer or already normalized float)
            weight_str = row.get('Weight', '1')
            weight = float(weight_str)

            # Track max for normalization if weights are > 1
            if weight > max_weight:
                max_weight = weight

            edges.append({
                'source': source,
                'target': target,
                'weight': weight,
            })

            # Track degree
            degree_count[source] += 1
            degree_count[target] += 1

    # Normalize weights to 0-1 range if needed
    if max_weight > 1:
        for edge in edges:
            edge['normalizedWeight'] = edge['weight'] / max_weight
    else:
        # Already normalized
        for edge in edges:
            edge['normalizedWeight'] = edge['weight']

    # Add degree to nodes
    for node_id in nodes:
        nodes[node_id]['degree'] = degree_count.get(node_id, 0)

    return edges, max_weight


def export_network(nodes_file, edges_file, output_file, name):
    """Export a network to JSON format."""
    print(f"\nProcessing {name}...")
    print(f"  Nodes file: {nodes_file}")
    print(f"  Edges file: {edges_file}")

    # Load data
    nodes = load_nodes(nodes_file)
    print(f"  Loaded {len(nodes):,} nodes")

    edges, max_weight = load_edges(edges_file, nodes)
    print(f"  Loaded {len(edges):,} edges (max weight: {max_weight:.2f})")

    # Compute metadata
    max_paper_count = max((n['paperCount'] for n in nodes.values()), default=0)
    max_degree = max((n['degree'] for n in nodes.values()), default=0)

    # Get unique categories, schools, campuses
    categories = sorted(set(n['category'] for n in nodes.values()))
    schools = sorted(set(n['school'] for n in nodes.values() if n['school']))
    campuses = sorted(set(n['campus'] for n in nodes.values() if n['campus']))

    # Build output structure
    output = {
        'nodes': list(nodes.values()),
        'edges': edges,
        'metadata': {
            'name': name,
            'nodeCount': len(nodes),
            'edgeCount': len(edges),
            'maxPaperCount': max_paper_count,
            'maxDegree': max_degree,
            'maxWeight': max_weight,
            'categories': categories,
            'schools': schools,
            'campuses': campuses,
            'generated': datetime.now().isoformat(),
        }
    }

    # Write JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False)

    # Also write pretty version for debugging
    pretty_file = output_file.with_suffix('.pretty.json')
    with open(pretty_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    file_size = output_file.stat().st_size / 1024 / 1024
    print(f"  Output: {output_file.name} ({file_size:.2f} MB)")

    return output['metadata']


def main():
    base_dir = Path(__file__).parent.parent.parent.parent

    # Data directories
    data_2023 = base_dir / 'data' / '2023_2026' / 'min_10_papers' / 'gephi_category'
    data_2000 = base_dir / 'data' / '2000' / 'min_10_papers' / 'gephi_category'

    # Output directory
    output_dir = Path(__file__).parent.parent / 'data'
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("Network Data Export")
    print("=" * 70)

    # Define networks and their source files
    networks = [
        {
            'name': 'Harvard Core',
            'output': 'harvard_core.json',
            'nodes': data_2023 / 'Harvard_Core_nodes.csv',
            'edges': data_2023 / 'Harvard_Core_edges.csv',
        },
        {
            'name': 'Harvard Extended',
            'output': 'harvard_extended.json',
            'nodes': data_2023 / 'Harvard_Extended_nodes.csv',
            'edges': data_2023 / 'Harvard_Extended_edges.csv',
        },
        {
            'name': 'MIT Core',
            'output': 'mit_core.json',
            'nodes': data_2023 / 'MIT_Core_nodes.csv',
            'edges': data_2000 / 'MIT_Core_edges.csv',  # Edges from 2000 dataset
        },
        {
            'name': 'MIT Extended',
            'output': 'mit_extended.json',
            'nodes': data_2023 / 'MIT_Extended_nodes.csv',
            'edges': data_2000 / 'MIT_Extended_edges.csv',  # Edges from 2000 dataset
        },
    ]

    results = []
    for network in networks:
        if not network['nodes'].exists():
            print(f"\nSkipping {network['name']}: nodes file not found")
            continue
        if not network['edges'].exists():
            print(f"\nSkipping {network['name']}: edges file not found")
            continue

        metadata = export_network(
            network['nodes'],
            network['edges'],
            output_dir / network['output'],
            network['name']
        )
        results.append((network['name'], metadata))

    # Print summary
    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)
    print(f"{'Network':<20} {'Nodes':>10} {'Edges':>12} {'Categories':>12}")
    print("-" * 56)
    for name, meta in results:
        print(f"{name:<20} {meta['nodeCount']:>10,} {meta['edgeCount']:>12,} {len(meta['categories']):>12}")

    print(f"\nFiles saved to: {output_dir}")


if __name__ == '__main__':
    main()
