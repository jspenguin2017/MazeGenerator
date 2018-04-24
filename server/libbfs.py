"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Depth first search library

Based on code on eClass:
<redacted>

The following modifications were done:
- Made get_path to raise an exception when it fails to find the path
- Made get_path to return path in reverse as the direction does not matter
"""

from collections import deque


def breadth_first_search(graph, s):
    """
    Given a graph and a vertex s in the graph, will construct and return a
    search tree from s using a breadth-first search

    That is, a dictionary "reached" will be returned whose keys are all
    vertices reachable from s and where reached[v] is the predecessor of v in
    the search

    The exception is reached[s] == s

    User can use get_path(reached, s, t) to recover a path from s to t in the
    graph, after running this search
    """
    reached = {s: s}
    todo = deque([s])

    # Condition is true if and only if todo is not empty
    while todo:
        curr = todo.popleft()

        for nbr in graph.neighbours(curr):
            if nbr not in reached:
                reached[nbr] = curr
                todo.append(nbr)

    return reached


def get_path(reached, start, end):
    """
    Return a path from end to start, given a search tree

    reached: A dictionary representing a search tree of a search initiated from
             the vertex "start"
    start: The vertex that was the start of the search that constructed the
           search tree
    end: The desired endpoint of the search

    Returns a list of vertices starting at vertex end and ending at vertex
    start representing a path between these vertices (the path in the search
    tree)

    If the vertex "end" was not reached, an exception will be raised

    >>> reached = {3: 3, 1: 3, 4: 3, 2: 4}
    >>> get_path(reached, 3, 2)
    [2, 4, 3]
    >>> get_path(reached, 3, 3)
    [3]
    """
    if end not in reached:
        raise ValueError("Could not find path")

    path = [end]

    # Walk through the dictionary and collect path in reverse
    while end != start:
        end = reached[end]
        path.append(end)

    return path
