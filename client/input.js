/*******************************************************************************
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator mouse and keyboard handler
*******************************************************************************/
"use strict";

// Button state controller
const BtnController = class {
    // Constructor, create a weak map for saving current state
    constructor() {
        this._state = new WeakMap();
    }

    // Update enabled state
    set_enable(btn, new_state) {
        // See if the state have changed
        const current_state = this._state.get(btn);
        if (current_state === new_state) return;

        // Update and store state
        if (new_state) {
            btn.removeAttribute("disabled");
        } else {
            btn.setAttribute("disabled", "");
        }
        this._state.set(btn, new_state);
    };
};

// Common keys
const KeyCode = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
};

// Keyboard input controller
const KeyboardController = class {
    // Constructor, takes in keys to listen
    constructor(...keys) {
        this._state = new Map();
        for (let key of keys) {
            this._state.set(key, {
                pressed: false,
                cooldown: 0,
            });
        }

        // Event handlers
        this._onkeydown = (e) => {
            const key = e.code;
            if (this._state.has(key)) {
                this._state.get(key).pressed = true;
            }
        };
        this._onkeyup = (e) => {
            const key = e.code;
            if (this._state.has(key)) {
                const state = this._state.get(key);
                state.pressed = false;
                state.cooldown = 0;
            }
        };

        // Bind event handlers
        document.addEventListener("keydown", this._onkeydown);
        document.addEventListener("keyup", this._onkeyup);
    }

    // Destruct this instance, must be called explicitly
    destruct() {
        document.removeEventListener("keydown", this._onkeydown);
        document.removeEventListener("keyup", this._onkeyup);
    }

    // Get key press
    get_press(key) {
        if (!this._state.has(key)) return false;
        const state = this._state.get(key);
        if (state.pressed && state.cooldown == 0) {
            // The player will continuously move if the button is held down,
            // this is the cooldown between two ticks in frames
            state.cooldown = 10;
            return true;
        }
        return false;
    }

    // Update cooldown values
    update_cooldown() {
        for (let data of this._state) {
            if (data[1].cooldown > 0) {
                data[1].cooldown--;
            }
        }
    }
};
