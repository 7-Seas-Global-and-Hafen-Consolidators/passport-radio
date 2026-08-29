import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data" / "radio-territories.json"


def load_territories():
    try:
        payload = json.loads(REGISTRY.read_text(encoding="utf-8"))
        return payload.get("territories", [])
    except (OSError, json.JSONDecodeError):
        return []


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/") or "/"
        territories = load_territories()

        if path in ("/", "/health"):
            self.send_json(200, {
                "service": "Passport Engine",
                "status": "online",
                "mode": "render-poc",
                "territories": len(territories),
            })
            return

        if path == "/territories":
            self.send_json(200, {"territories": territories})
            return

        if path.startswith("/territories/"):
            territory_id = path.split("/", 2)[2]
            item = next((x for x in territories if x.get("id") == territory_id), None)
            if item:
                self.send_json(200, item)
            else:
                self.send_json(404, {"error": "territory_not_found"})
            return

        self.send_json(404, {"error": "not_found"})

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Passport Engine listening on 0.0.0.0:{port}")
    server.serve_forever()
