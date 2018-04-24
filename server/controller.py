"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator game flow controller
"""

import re

import server.maze_generator as maze_generator
import server.maze_solver as maze_solver
import server.enemy_ai as enemy_ai

active_maze = None


def new_maze():
    """
    Generate a maze and return a string representation of it

    It will also be marked as active and stored as a global variable
    """
    # Make sure we are writting into the global variable
    global active_maze
    active_maze = maze_generator.generate()

    return str(active_maze.get_edges())


def solve_current_maze():
    """
    Solve the current maze and return a string representation of the solution
    """
    if active_maze is None:
        return "ERROR: No active maze"

    return str(maze_solver.solve(active_maze))


def get_enemy_path(query):
    """
    Given the query sent from the client, returns the path that the enemy
    should take

    The query should look like this:
        /get_enemy_path?0,0&5,5
    Here, the position of player is (0, 0) and the position of enemy is (5, 5)
    """
    if active_maze is None:
        return "ERROR: No active maze"

    # Parse the query
    match = re.search("\?(\d+),(\d+)&(\d+),(\d+)$", query)
    if match is None:
        return "ERROR: Could not parse query"

    # Extract positions
    data = list(map(int, match.groups()))
    player = (data[0], data[1])
    enemy = (data[2], data[3])

    return str(enemy_ai.get_path(active_maze, enemy, player))
