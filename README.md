# TaskFlow Automation

A local Flask app for three common tasks: organizing JPG files, extracting email addresses from text, and retrieving a web page title.

## Requirements

- Python 3.10 or later
- Internet access for the web scraper

## Setup on Windows

Open PowerShell in this folder and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Then open <http://127.0.0.1:5000> in your browser. Stop the server with `Ctrl+C`.

## Project Structure

```text
Task Automation/
|-- app.py
|-- requirements.txt
|-- README.md
|-- templates/
|   `-- index.html
`-- static/
    |-- style.css
    `-- script.js
```

## Tasks

- **Move JPG Files:** Moves `.jpg` files from the selected source folder to the destination. It does not copy them; use a test folder first.
- **Email Extractor:** Finds and deduplicates email addresses in supplied text.
- **Web Scraper:** Fetches a URL and displays the page title. Some websites may block automated requests.

The app runs locally and stores no task history.