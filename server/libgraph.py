"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Undirected graph library

Based on code on eClass:
<redacted>

The following modifications were done:
- Changed to undirected graph
- Changed vetices to 2 dimentional, holding an x and y coordinate
- Added a cost to each edge, they are saved to costlist
- Made get_edges to return more usable values
- Added clear edges functionality
"""


class Graph:
    def __init__(self):
        """
        Initialize the graph class, create two empty dictionaries for holding
        edges and their costs

        Efficiency: O(1)

        >>> g = Graph()
        >>> g.add_vertex(1)
        >>> g.add_vertex(2)
        >>> g.add_edge((1, 2), 5)
        >>> g.costlist == {(1, 2): 5, (2, 1): 5}
        True
        """
        self.alist = dict()  # Vertex to its neighbors
        self.costlist = dict()  # Edge to its cost

    def get_vertices(self):
        """
        Returns the set of vertices in the graph

        Efficiency: O(# vertices)
        """
        return set(self.alist.keys())

    def get_edges(self):
        """
        Returns a list of all edges in the graph

        Each edge appears up to once

        Efficiency: O(# edges)
        """
        edges = set()

        # Collect all the edges
        for v, l in self.alist.items():
            for e in l:
                edges.add((v, e))

        return edges

    def add_vertex(self, v):
        """
        Add a vertex v to the graph

        If v exists in the graph, do nothing

        Efficiency: O(1)
        """
        if v not in self.alist:
            self.alist[v] = set()

    def add_edge(self, e, cost):
        """
        Add edge e to the graph and save its cost

        The edge will be added both ways to make the graph undirected

        Raise an exception if either of the endpoints of e are not in the graph

        Efficiency: O(1)
        """
        if not self.is_vertex(e[0]) or not self.is_vertex(e[1]):
            raise ValueError("A vertex is not in the graph")

        # Add both ways to make it undirected
        self.alist[e[0]].add(e[1])
        self.alist[e[1]].add(e[0])

        # Save cost
        self.costlist[(e[0], e[1])] = cost
        self.costlist[(e[1], e[0])] = cost

    def is_vertex(self, v):
        """
        Check if vertex v is in the graph

        Return True if it is, False if it is not

        Efficiency: O(1)
        """
        return v in self.alist

    def is_edge(self, e):
        """
        Check if edge e is in the graph

        Return True if it is, False if it is not

        Efficiency: O(# neighbours of e[0])
        """
        if e[0] not in self.alist:
            return False

        return e[1] in self.alist[e[0]]

    def neighbours(self, v):
        """
        Return a list of neighbours of v

        A vertex u appears in this list only once regardless how many times the
        (v, u) edge is added to the graph

        If v is not in the graph, then raise a ValueError exception

        Efficiency: O(# edges)
        """
        if not self.is_vertex(v):
            raise ValueError("The vertex not in the graph")

        return self.alist[v]

    def clear_edges(self):
        """
        Clear all edges

        Efficiency: O(# vertices)
        """
        vertices = self.get_vertices()

        for vertex in vertices:
            self.alist[vertex] = set()

        self.costlist = dict()
