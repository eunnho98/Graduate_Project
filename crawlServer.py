from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from crawlAll import main
import json, ssl, argparse


class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/get_results":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            result = main()

            fashion, food, cosmetic, sports, living, appliance = [
                result.copy()[i] for i in range(6)
            ]

            response = {
                "fashion": fashion,
                "food": food,
                "cosmetic": cosmetic,
                "sports": sports,
                "living": living,
                "appliance": appliance,
            }

            self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"Not Found")


class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass


def argparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--https", required=True)
    config = parser.parse_args()
    return config


def run(config, server_class=ThreadingSimpleServer, handler_class=MyHandler):
    port = 8080 if config.https == "True" else 8081
    server_address = ("", port)

    if config.https == "True":
        print("https True")
        key_file = "./crawlServerKey/server.key"
        cert_file = "./crawlServerKey/server.crt"
        httpd = server_class(server_address, handler_class)
        httpd.socket = ssl.wrap_socket(
            httpd.socket,
            keyfile=key_file,
            certfile=cert_file,
            server_side=True,
            ssl_version=ssl.PROTOCOL_TLS,
        )
    else:
        print("https False")
        httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}")
    httpd.serve_forever()


# python crawlServer.py --https True/False
if __name__ == "__main__":
    config = argparser()
    print("https is", config.https)
    print("type", type(config.https))
    run(config)
