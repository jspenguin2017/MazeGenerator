"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator maze solver
"""

import server.libbfs as libbfs


def solve(graph, start=(0, 0), end=(34, 24)):
    """
    Given a graph representing a maze with unique solution, find that solution

    The default player position is (0, 0) and the default goal is (34, 24)
    """
    tree = libbfs.breadth_first_search(graph, start)

    return libbfs.get_path(tree, start, end)
