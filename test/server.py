import http.server
import socketserver

# This is a simple server that runs on the localhost for
# serving the pages associated with this project. This is
# simply the code found at
# https://docs.python.org/3/library/http.server.html and
# uses Python 3.  To run this, simply type
#
# python -m server
#
# This appears to work...

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()
