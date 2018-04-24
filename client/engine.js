/*******************************************************************************
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator game engine
*******************************************************************************/
"use strict";

// Basic canvas engine
const CanvasEngine = class {
    // Constructor, takes in canvas element
    constructor(e) {
        this.h = e.height;
        this.w = e.width;

        this._ctx = e.getContext("2d");
    }

    // Update properties of the context
    _update_context(options = {}) {
        this._ctx.fillStyle = options.fillStyle || "#000000";
        this._ctx.font = options.font || "10px sans-serif";
        this._ctx.lineWidth = options.lineWidth || 1;
        this._ctx.strokeStyle = options.strokeStyle || "#000000";
        this._ctx.textAlign = options.textAlign || "start";
        this._ctx.textBaseline = options.textBaseline || "alphabetic";
    }

    // Draw a rectangle
    draw_rect(x, y, w, h, color = null) {
        this._update_context({
            fillStyle: color,
        });
        this._ctx.fillRect(x, y, w, h);
    }

    // Fill the screen with a color
    fill_screen(color = null) {
        this.draw_rect(0, 0, this.w, this.h, color);
    }

    // Draw a line of text to a specific position
    draw_text(
        x, y, text,
        color = null, font = null,
        alignx = null, aligny = null,
    ) {
        this._update_context({
            fillStyle: color,
            font: font,
            textAlign: alignx,
            textBaseline: aligny,
        });
        this._ctx.fillText(text, x, y);
    }

    // Draw a line
    draw_line(x1, y1, x2, y2, color = null, width = null) {
        this._update_context({
            strokeStyle: color,
            lineWidth: width,
        });
        this._ctx.beginPath();
        this._ctx.moveTo(x1, y1);
        this._ctx.lineTo(x2, y2);
        this._ctx.stroke();
    }
};

// Game graph engine
const GameGraph = class {
    // Constructor, set data to empty
    constructor() {
        this._data = new Map();
    }

    // Convert tuples to strings
    _to_string(...args) {
        return args.map((x) => x.join());
    }

    // Clear the graph
    reset() {
        this._data = new Map();
    }

    // Add a directed edge, the server should send both directions
    add_edge(a, b) {
        [a, b] = this._to_string(a, b);
        if (!this._data.has(a)) this._data.set(a, new Set());
        this._data.get(a).add(b);
    }

    // Check if a directed edge exists
    is_edge(a, b) {
        [a, b] = this._to_string(a, b);
        return this._data.has(a) && this._data.get(a).has(b);
    }
};

// Game enemy controller
const GameEnemy = class {
    // Constructor, store initial state
    constructor(start_point) {
        this._start_point = start_point;
        this.reset();
    }

    // Get next path
    _get_next_path(enemy, player) {
        xhr("get_enemy_path?" + player.join() + "&" + enemy.join(), (res) => {
            res = parse_response(res);
            if (res === null) {
                abort();
            } else {
                // This will cut off path further than 30 steps, as the player
                // moves, enemies should look for the player's new position
                // once in a while
                this._path = res.slice(res.length - 30);
                this._cooldown = 0;
            }
        }, abort);
    }

    // Reset the enemy
    reset() {
        this._current_pos = this._start_point.slice();
        this._path = [this._start_point];
        this._cooldown = 5;
    }

    // Prepare for player mode
    prepare_player_mode(game_engine) {
        game_engine.draw_box(...this._current_pos, "red");
    }

    // Update enemy cooldown
    update_cooldown(game_engine, player_pos) {
        // Waiting for server response
        if (this._cooldown === -1) return;

        if (this._cooldown > 0) {
            this._cooldown--;
        } else {
            // Move enemy
            game_engine.draw_box(...this._current_pos, "white");
            this._current_pos = this._path.pop();
            game_engine.draw_box(...this._current_pos, "red");

            // Check if we need to load next path
            if (this._path.length === 0) {
                this._cooldown = -1;
                this._get_next_path(this._current_pos, player_pos);
            } else {
                // This is the cooldown, in frames, between two enemy moves
                this._cooldown = 30;
            }
        }
    }

    // Check whether the player lose
    check_lose(player_pos) {
        return (
            this._current_pos[0] === player_pos[0] &&
            this._current_pos[1] === player_pos[1]
        );
    }
};

// Game engine
const GameEngine = class extends CanvasEngine {
    // Constructor, initialize variables
    constructor(e) {
        super(e);

        // Map grid size constants
        this._grid_size = 20;
        this._padding = 3;
        this._inner_size = this._grid_size - this._padding * 2;

        // Map grid count constants
        this._horz_count = this.w / this._grid_size;
        this._vert_count = this.h / this._grid_size;

        // Other constants
        this._start_point = [0, 0];
        this._end_point = [this._horz_count - 1, this._vert_count - 1];

        // Active game state
        this._map = new GameGraph();
        this._player = this._start_point.slice();
        this._player_last = this._player.slice();
        this._enemies = [new GameEnemy([0, 24]), new GameEnemy([34, 0])];
    }

    // Erase a wall between two white boxes
    _draw_edge(point1, point2, color) {
        // Check if we already draw the other way
        if (this._map.is_edge(point2, point1)) return;

        // Draw the appropriate line
        const [x1, y1] = point1;
        const [x2, y2] = point2;
        this.draw_line(
            x1 * this._grid_size + this._grid_size / 2,
            y1 * this._grid_size + this._grid_size / 2,
            x2 * this._grid_size + this._grid_size / 2,
            y2 * this._grid_size + this._grid_size / 2,
            color,
            this._inner_size,
        );
    }

    // Move the player
    _move_player(deltax, deltay) {
        // Caluclate new postion
        let [new_x, new_y] = this._player;
        new_x += deltax;
        new_y += deltay;
        if (new_x < 0 || new_x > 34) return;
        if (new_y < 0 || new_y > 24) return;

        // Check the player can move that way
        if (this._map.is_edge([new_x, new_y], this._player)) {
            this.draw_box(...this._player, "white");
            this._player = [new_x, new_y];
            this.draw_box(...this._player, "orange");
        }
    }

    // Draw a box
    draw_box(x, y, color) {
        this.draw_rect(
            x * this._grid_size + this._padding,
            y * this._grid_size + this._padding,
            this._inner_size, this._inner_size,
            color,
        );
    }

    // Draw wait screen
    wait_screen(msg = "Loading...") {
        this.fill_screen("white");
        this.draw_text(
            this.w / 2, 75, msg,
            "black", "40px sans-serif",
            "center",
        );
    }

    // Initialize map, draw white boxes on a dark blue background
    // The walls between white boxes will be erased according to the map sent
    // from the server
    init_map() {
        // Reset state
        this._map.reset();
        this._player = this._start_point.slice();
        this._player_last = this._player.slice();
        this._enemies.forEach((e) => e.reset());

        // Update screen
        this.fill_screen("darkblue");
        for (let i = 0; i < this._horz_count; i++) {
            for (let j = 0; j < this._vert_count; j++) {
                this.draw_box(i, j, "white");
            }
        }
    }

    // Finish drawing map
    draw_map(data) {
        // Erase appropriate edges
        for (let edge of data) {
            this._draw_edge(...edge, "white");
            this._map.add_edge(...edge);
        }

        // Draw position of player and goal
        this.draw_box(...this._player, "orange");
        this.draw_box(...this._end_point, "green");
    }

    // Draw the solution
    draw_solution(data) {
        // We do not need this anymore
        this._map.reset();

        // Draw the solution path
        for (let i = 0; i < data.length - 1; i++) {
            this.draw_box(...data[i], "lightgreen");
            this._draw_edge(data[i], data[i + 1], "lightgreen");
        }
        this.draw_box(...data[data.length - 1], "lightgreen");
    }

    // Prepare for player mode
    prepare_player_mode() {
        this._enemies.forEach((e) => e.prepare_player_mode(this));
    }

    // Update cooldowns
    update_cooldown() {
        this._enemies.forEach((e) => e.update_cooldown(this, this._player));
    }

    // Move the player
    move_up() {
        this._move_player(0, -1);
    }
    move_down() {
        this._move_player(0, 1);
    }
    move_left() {
        this._move_player(-1, 0);
    }
    move_right() {
        this._move_player(1, 0);
    }

    // Check whether the player won
    check_win() {
        return (
            this._player[0] === this._end_point[0] &&
            this._player[1] === this._end_point[1]
        );
    }

    // Check whether the player lose
    check_lose() {
        return this._enemies.some((e) => e.check_lose(this._player));
    }
};
