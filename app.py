from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import re
import shutil
import requests
from urllib.parse import urlparse

app = Flask(__name__)
DOWNLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


def get_request_data():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


# -----------------------------
# HOME
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# MOVE JPG FILES
# -----------------------------
@app.route("/api/move-jpgs", methods=["POST"])
def move_jpgs():

    data = get_request_data()

    source = data.get("source", "")
    destination = data.get("destination", "")

    if not isinstance(source, str) or not source.strip() or not isinstance(destination, str) or not destination.strip():
        return jsonify({
            "success": False,
            "message": "Source and destination are required."
        }), 400

    source = source.strip()
    destination = destination.strip()

    if not os.path.isdir(source):
        return jsonify({
            "success": False,
            "message": "Source folder does not exist."
        }), 404

    if os.path.abspath(source) == os.path.abspath(destination):
        return jsonify({
            "success": False,
            "message": "Source and destination folders must be different."
        }), 400

    os.makedirs(destination, exist_ok=True)

    moved = []

    for filename in os.listdir(source):

        if filename.lower().endswith(".jpg"):

            old_path = os.path.join(source, filename)
            new_path = os.path.join(destination, filename)

            try:
                shutil.move(old_path, new_path)
                moved.append(filename)

            except Exception as e:
                return jsonify({
                    "success": False,
                    "message": str(e)
                })

    return jsonify({
        "success": True,
        "count": len(moved),
        "files": moved,
        "message": f"{len(moved)} JPG file(s) moved successfully."
    })


# -----------------------------
# EXTRACT EMAILS
# -----------------------------
@app.route("/api/extract-emails", methods=["POST"])
def extract_emails():

    data = get_request_data()

    text = data.get("text", "")

    if not isinstance(text, str) or not text.strip():
        return jsonify({
            "success": False,
            "message": "Please enter some text."
        }), 400

    pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

    emails = re.findall(pattern, text)

    # Remove duplicates
    emails = list(dict.fromkeys(emails))

    return jsonify({
        "success": True,
        "count": len(emails),
        "emails": emails,
        "message": f"{len(emails)} email(s) found."
    })


# -----------------------------
# SCRAPE PAGE TITLE
# -----------------------------
@app.route("/api/scrape-title", methods=["POST"])
def scrape_title():

    data = get_request_data()

    url = data.get("url", "")
    if not isinstance(url, str):
        url = ""
    url = url.strip()

    if not url:
        return jsonify({
            "success": False,
            "message": "Please enter a URL."
        }), 400

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed_url = urlparse(url)
    if parsed_url.scheme not in ("http", "https") or not parsed_url.netloc:
        return jsonify({
            "success": False,
            "message": "Please enter a valid website URL."
        }), 400

    try:

        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        response.raise_for_status()

        html = response.text

        match = re.search(
            r"<title[^>]*>(.*?)</title>",
            html,
            re.IGNORECASE | re.DOTALL
        )

        if match:

            title = re.sub(
                r"\s+",
                " ",
                match.group(1)
            ).strip()

        else:
            title = "No title found"

        return jsonify({
            "success": True,
            "url": url,
            "title": title,
            "status_code": response.status_code,
            "message": "Page title extracted successfully."
        })

    except requests.exceptions.RequestException as e:

        return jsonify({
            "success": False,
            "message": f"Request failed: {str(e)}"
        })


# -----------------------------
# DOWNLOAD GENERATED FILE
# -----------------------------
@app.route("/download/<filename>")
def download_file(filename):

    return send_from_directory(DOWNLOAD_FOLDER, filename, as_attachment=True)


# -----------------------------
# STATUS
# -----------------------------
@app.route("/api/status")
def status():

    return jsonify({
        "status": "online",
        "server": "Flask",
        "tasks": 3
    })


# -----------------------------
# START SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )