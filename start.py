"""
Author: John Beckingham
Student ID: <redacted>
Author: Hai Yang Xu
Student ID: <redacted>

Maze Generator startup script

Based on code for assignment 2:
<redacted>
"""

import http.server
import os.path

import server.controller as controller


class WebServer(http.server.SimpleHTTPRequestHandler):
    """A simple web server, just enough for this project"""

    def _write_headers(self, response_code, content_type):
        """Write response code and basic headers"""
        self.send_response(response_code)

        # Make sure the user agent does not cache the file
        self.send_header("Cache-Control",
                         "no-cache, no-store, must-revalidate")
        self.send_header("Content-Type", content_type)

        self.end_headers()

    def _respond(self, path, header_only=False):
        """
        A simple request handler, serves static files and pass API calls to
        the appropriate function
        """
        if path == "/" or path == "/index.html":
            # The main HTML file
            with open("./client/index.html", "rb") as f:
                self._write_headers(200, "text/html; charset=utf-8")

                if not header_only:
                    self.wfile.write(f.read())

        elif (path == "/index.js" or path == "/engine.js" or
              path == "/util.js" or path == "/input.js"):
            # Script files
            with open("./client{}".format(path), "rb") as f:
                self._write_headers(200, "text/html; charset=utf-8")

                if not header_only:
                    self.wfile.write(f.read())

        elif path == "/generate_new_map":
            # Generate new maze map and mark the new map as active
            data = controller.new_maze()

            self._write_headers(200, "text/plain; charset=utf-8")
            self.wfile.write(data.encode("utf-8"))

        elif path == "/solve_current_map":
            # Solve the current maze
            data = controller.solve_current_maze()

            self._write_headers(200, "text/plain; charset=utf-8")
            self.wfile.write(data.encode("utf-8"))

        elif path.startswith("/get_enemy_path?"):
            # Get a path that an enemy should take
            data = controller.get_enemy_path(path)

            self._write_headers(200, "text/plain; charset=utf-8")
            self.wfile.write(data.encode("utf-8"))

        else:
            self.send_error(404, "Not Found")

    def do_GET(self):
        """GET request handler"""
        self._respond(self.path, header_only=False)

    def do_HEAD(self):
        """HEAD request handler"""
        self._respond(self.path, header_only=True)


# Start server
port = 8000
httpd = http.server.HTTPServer(("", port), WebServer)
print("Server started on http://localhost:{}/".format(port))
httpd.serve_forever()
