"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Minimum spanning tree library

Based on code on eClass:
<redacted>

The following modifications were done:
- Combined two files to one
- Implemented the missing find and union function based pseudocode on the
  slides:
  <redacted>
- Changed the return value of kruskal to be just the tree
"""


class UnionFind:
    """Implementation of the union-find data structure"""

    def __init__(self, S):
        """
        Creates a new instance of the union-find data structure, initially
        being the partition of S where each item lies in a set of its own

        S should be an iterable, like a set

        If S contains copies of items, only one will appear in this union-find
        instance
        """
        self.parent = {x: x for x in S}
        self.rank = {x: 0 for x in S}

    def find(self, x):
        """
        Returns the representative for the set (the root of the set) in the
        partition that contains x

        Assumes x is in the original set S that this instance was initialized
        with

        Hard to test this one individually, but it can be tested in conjunction
        with union()
        """
        # Find root and update the chain on the way
        if x != self.parent[x]:
            self.parent[x] = self.find(self.parent[x])

        return self.parent[x]

    def union(self, x, y):
        """
        Merges the two sets containing x and y

        Does nothing if they were already in the set

        Assumes both are in the original set S that this instance was
        initialized with

        >>> uf = UnionFind({1, 2, 3, 4, 5})
        >>> uf.find(1)
        1
        >>> uf.find(2)
        2
        >>> uf.union(1, 2)
        True
        >>> uf.find(1) in {1, 2}
        True
        >>> uf.union(3, 4)
        True
        >>> uf.union(1, 4)
        True
        >>> uf.find(2) == uf.find(3)
        True
        """
        # Find roots
        rootx = self.find(x)
        rooty = self.find(y)

        # Check if already unioned
        if rootx == rooty:
            return False

        # Union the way that yeilds a shortest tree
        if self.rank[rootx] > self.rank[rooty]:
            [rootx, rooty] = [rooty, rootx]

        self.parent[rootx] = rooty

        # Update rank values
        if self.rank[rootx] == self.rank[rooty]:
            self.rank[rooty] = self.rank[rooty] + 1

        return True


def kruskal(vertices, edges):
    """
    Implementation of Kruskal's algorithm for computing a minimum spanning tree

    vertices: Set of vertices of the graph
    edges: Dictionary mapping undireced edges represented as pairs to their
           cost
           Example: {(1, 3): 2, (1, 2): 5}
           The edge (1, 3) has cost 2 and the edge (1, 2) has cost 5

    Returns the set of set of edges forming the spanning tree:

    >>> vertices = {1, 2, 3}
    >>> edges = {(1, 2):1, (1, 3):3, (2, 3):2}
    >>> tree = kruskal(vertices, edges)
    >>> tree == {(1,2), (2,3)}
    True
    """
    # Initialize data structures
    uf = UnionFind(vertices)
    tree = set()

    # Get a list of edges sorted by cost
    sorted_edges = list(edges.items())
    sorted_edges.sort(key=lambda x: x[1])

    # For each edge in sorted order
    for (u, v), c in sorted_edges:

        # If the endpoints are not yet connected
        if uf.find(u) != uf.find(v):

            # Keep the edge
            uf.union(u, v)
            tree.add((u, v))

    return tree
