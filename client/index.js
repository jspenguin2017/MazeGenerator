/*******************************************************************************
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator renderer
*******************************************************************************/
"use strict";

// Game engine instance
const game = new GameEngine(document.querySelector("canvas"));

// Control buttons
const [btn_new, btn_solve, btn_player] = document.querySelectorAll("button");
const btn_controller = new BtnController(btn_new, btn_solve, btn_player);

// Keyboard
const keyboard = new KeyboardController(
    KeyCode.UP, KeyCode.DOWN,
    KeyCode.LEFT, KeyCode.RIGHT,
);

// Enumeration of game states
const game_states = {
    BEFORE_LOADING_MAP: 0x00,
    LOADING_MAP: 0x01,
    MAP_IDLE: 0x02,

    BEFORE_LOADING_SOLUTION: 0x10,
    LOADING_SOLUTION: 0x11,
    SOLUTION_IDLE: 0x12,

    PLAYER_START: 0x20,
    PLAYER_MODE: 0x21,
    PLAYER_END: 0x22,

    ERROR: 0x90,
};

// Current state
let current_game_state = game_states.BEFORE_LOADING_MAP;

// Buttons renderer
const update_buttons = () => {
    // New map button is only available if network is not busy
    if (
        current_game_state === game_states.LOADING_MAP ||
        current_game_state === game_states.LOADING_SOLUTION ||
        current_game_state === game_states.ERROR
    ) {
        btn_controller.set_enable(btn_new, false);
    } else {
        btn_controller.set_enable(btn_new, true);
    }

    // Solve and player start buttons are only available if the map is idle
    if (current_game_state === game_states.MAP_IDLE) {
        btn_controller.set_enable(btn_solve, true);
        btn_controller.set_enable(btn_player, true);
    } else {
        btn_controller.set_enable(btn_solve, false);
        btn_controller.set_enable(btn_player, false);
    }
};

// Bind button event handlers
btn_new.onclick = () => {
    current_game_state = game_states.BEFORE_LOADING_MAP;
};
btn_solve.onclick = () => {
    current_game_state = game_states.BEFORE_LOADING_SOLUTION;
};
btn_player.onclick = () => {
    current_game_state = game_states.PLAYER_START;
};

// Connection error handler
const abort = () => {
    game.wait_screen("Connection error, please refresh...");
    current_game_state = game_states.ERROR;
};

// Main renderer
const renderer = () => {
    // Process game state
    switch (current_game_state) {
        case game_states.BEFORE_LOADING_MAP:
            // Schedule the request
            xhr("generate_new_map", (res) => {
                // Make sure the state is still valid
                if (current_game_state !== game_states.LOADING_MAP) return;

                // Handle the response
                res = parse_response(res);
                if (res === null) {
                    abort();
                } else {
                    game.init_map();
                    game.draw_map(res);
                    current_game_state = game_states.MAP_IDLE;
                }
            }, abort);
            // Update screen and state
            game.wait_screen();
            current_game_state = game_states.LOADING_MAP;
            break;

        case game_states.LOADING_MAP:
            // Still waiting
            break;

        case game_states.MAP_IDLE:
            // Idling
            break;


        case game_states.BEFORE_LOADING_SOLUTION:
            // Schedule the request
            xhr("solve_current_map", (res) => {
                if (current_game_state !== game_states.LOADING_SOLUTION) return;

                res = parse_response(res);
                if (res === null) {
                    abort();
                } else {
                    game.draw_solution(res);
                    current_game_state = game_states.SOLUTION_IDLE;
                }
            }, abort);
            // Update state
            current_game_state = game_states.LOADING_SOLUTION;
            break;

        case game_states.LOADING_SOLUTION:
            // Still waiting
            break;

        case game_states.SOLUTION_IDLE:
            // Idling
            break;


        case game_states.PLAYER_START:
            // Prepare player mode
            game.prepare_player_mode();
            current_game_state = game_states.PLAYER_MODE;
            break;

        case game_states.PLAYER_MODE:
            // Update cooldown
            keyboard.update_cooldown();
            game.update_cooldown();
            // Process input
            if (keyboard.get_press(KeyCode.UP)) game.move_up();
            if (keyboard.get_press(KeyCode.DOWN)) game.move_down();
            if (keyboard.get_press(KeyCode.LEFT)) game.move_left();
            if (keyboard.get_press(KeyCode.RIGHT)) game.move_right();
            // Check win and lose
            if (game.check_win()) {
                game.wait_screen("You Won!");
                current_game_state = game_states.PLAYER_END;
            }
            if (game.check_lose()) {
                game.wait_screen("Game Over...");
                current_game_state = game_states.PLAYER_END;
            }
            break;

        case game_states.PLAYER_END:
            // Idling
            break;


        case game_states.ERROR:
            // Aborting, do not schedule next tick
            update_buttons();
            return;

        default:
            // Should not happen
            debugger;
    }

    // Update buttons and schedule next tick
    update_buttons();
    requestAnimationFrame(renderer);
};

// Start
requestAnimationFrame(renderer);
