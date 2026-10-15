from flask import Flask, jsonify, request
from flask_cors import CORS
import os, json, random, uuid
from datetime import datetime, timezone

APP = Flask(__name__)
CORS(APP)

# Use /data for Docker, fallback to local ./data for dev
_default_data = "/data/notes.json" if os.path.exists("/data") else "./data/notes.json"
DATA_PATH = os.environ.get("DATA_PATH", _default_data)
os.makedirs(os.path.dirname(DATA_PATH) or ".", exist_ok=True)

QUOTES = [
    {"text": "Simplicity is the ultimate sophistication.", "author": "Leonardo da Vinci"},
    {"text": "Code is like humor. When you have to explain it, it's bad.", "author": "Cory House"},
    {"text": "First, solve the problem. Then, write the code.", "author": "John Johnson"},
    {"text": "Make it work, make it right, make it fast.", "author": "Kent Beck"},
    {"text": "Docker: build once, run anywhere.", "author": "Docker community"},
    {"text": "The best error message is the one that never shows up.", "author": "Thomas Fuchs"},
    {"text": "Learning never exhausts the mind.", "author": "Leonardo da Vinci"},
]

def load_notes():
    try:
        with open(DATA_PATH) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_notes(notes):
    with open(DATA_PATH, "w") as f:
        json.dump(notes, f, indent=2)

@APP.get("/api/health")
def health():
    return jsonify({"status": "ok", "notes": len(load_notes())})

@APP.get("/api/quote")
def quote():
    return jsonify(random.choice(QUOTES))

@APP.get("/api/notes")
def list_notes():
    notes = load_notes()
    return jsonify(sorted(notes, key=lambda n: n["created"], reverse=True))

@APP.post("/api/notes")
def add_note():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "title and content required"}), 400
    notes = load_notes()
    note = {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "content": content,
        "color": random.choice(["#fef3c7", "#cffafe", "#fce7f3", "#d1fae5", "#e0e7ff", "#fde68a"]),
        "created": datetime.now(timezone.utc).isoformat(),
    }
    notes.append(note)
    save_notes(notes)
    return jsonify(note), 201

@APP.delete("/api/notes/<nid>")
def delete_note(nid):
    notes = [n for n in load_notes() if n["id"] != nid]
    save_notes(notes)
    return ("", 204)

@APP.get("/api/stats")
def stats():
    notes = load_notes()
    today = datetime.now(timezone.utc).date().isoformat()
    today_count = sum(1 for n in notes if n["created"][:10] == today)
    return jsonify({"total": len(notes), "today": today_count})

if __name__ == "__main__":
    APP.run(host="0.0.0.0", port=5000)