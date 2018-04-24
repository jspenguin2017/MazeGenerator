"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator random maze generator
"""

import random

from server.libgraph import Graph
from server.libmst import kruskal


def generate_grid(width, height):
    """
    Makes an undirected graph with a specific number of rows and columns, with
    random costs for each edge
    """
    g = Graph()

    # Add vertices
    for x in range(width):
        for y in range(height):
            g.add_vertex((x, y))

    # Create horizontal edges
    for x in range(width - 1):
        for y in range(height):
            cost = random.randint(1, 500)
            g.add_edge(((x, y), (x + 1, y)), cost)

    # Create vertical edges
    for y in range(height - 1):
        for x in range(width):
            cost = random.randint(1, 500)
            g.add_edge(((x, y), (x, y + 1)), cost)

    return g


def generate(width=35, height=25):
    """
    Generate a new random maze

    The default size is 35 by 25
    """
    # Find minimum spanning tree
    full_map = generate_grid(width, height)
    min_map = kruskal(full_map.get_vertices(), full_map.costlist)

    # Update the map
    full_map.clear_edges()
    for edge in min_map:
        full_map.add_edge(edge, 0)

    return full_map
