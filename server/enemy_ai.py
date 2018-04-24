"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator enemy artificial intelligence
"""

import math
import random

import server.libbfs as libbfs
import server.maze_solver as maze_solver


def distance_between(graph, point1, point2):
    """
    Given a graph representing a maze and two points in the maze, returns an
    integer representing the number of moves required to get from the one point
    to the other
    """
    # Get the path from the first point to the second
    path = maze_solver.solve(graph, point1, point2)

    # Return the number of moves required to get from the first point to the
    # second
    return len(path)


def ai_accuracy(distance):
    """
    Given the distance separating the enemy and player, returns a randomly
    generated accuracy factor which decreases the accuracy of the path to the
    player

    An accuracy factor of 0 is 100% accurate and indicates a perfect path
    directly to the player

    An accuracy factor of 20 is quite inaccurate, and means that the path found
    by the artificial intelligence is 20 random moves from the player's
    location, this could still end up at the player's location if the random
    moves happened to go back and forth, but could also lead the artificial
    intelligence to travel to the other side of the maze
    """
    return math.ceil(distance)


def new_dest(graph, player, accuracy):
    """
    Given a graph representing a maze, the player's location, and the accuracy
    factor of the artificial intelligence, finds the location the artificial
    intelligence will think the player is at by making 'accuracy' number of
    random moves from the player's location
    """
    # Do not need to copy it as it is completely replaced
    new_player = player

    # Moving 'accuracy' number of times
    for i in range(accuracy):
        # Get a list of possible moves from player location
        neighbours = graph.neighbours(new_player)
        neighbour_list = []
        for item in neighbours:
            neighbour_list.append(item)

        # Get selection randomly
        options = len(neighbour_list)
        move_choice = random.randint(0, options-1)

        # Store the new position
        new_player = neighbour_list[move_choice]

    # Return the new position of the player, which is somewhat randomized
    return new_player


def get_path(graph, enemy, player):
    """
    Given a graph representing a maze, the current enemy position and the
    current player position, return a path leading towards the player, but not
    directly to the player's location as that would make the game pretty
    unplayable

    Enemies that are further away from the player will find paths that are
    further from the player's exact location, and enemies that are closer will
    be find paths leading closer to the player

    This allows the player to hide from the enemies but also allow enemies to
    close in on the player
    """
    # Get the distance between the enemy and the player
    distance = distance_between(graph, enemy, player)

    # Get the ai's accuracy
    acc = ai_accuracy(distance)

    # Find location ai will travel to
    ai_dest = new_dest(graph, player, acc)

    # Return the path from enemy to location enemy thinks the player is
    return maze_solver.solve(graph, enemy, ai_dest)
