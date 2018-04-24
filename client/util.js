/*******************************************************************************
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator utilities
*******************************************************************************/
"use strict";

// XMLHttpRequest helper
const xhr = (url, onload, onerror) => {
    // Open a request
    let request = new XMLHttpRequest();
    request.open("GET", url);

    // Bind event handler
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status !== 200 || !request.responseText) {
                onerror();
            } else {
                onload(request.responseText);
            }
        }
    };

    // Send the request, payload should be already encoded in URL
    request.send(null);
};

// Parse server response to an object
const parse_response = (data) => {
    data = data.replace(/\(|\{/g, "[").replace(/\)|\}/g, "]");
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};
