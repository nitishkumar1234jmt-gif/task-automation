// =====================================
// TASK SWITCHING
// =====================================

function selectTask(task) {

    const panels = document.querySelectorAll(".task-panel");

    panels.forEach(panel => {
        panel.classList.remove("active-panel");
    });


    const buttons = document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {
        button.classList.remove("active");
    });


    if (task === "move") {

        document
            .getElementById("movePanel")
            .classList.add("active-panel");

        document
            .getElementById("moveNav")
            .classList.add("active");

        document.getElementById("pageTitle").innerText =
            "Move JPG Files";

        document.getElementById("pageDescription").innerText =
            "Automatically organize JPG images between folders.";

    }


    if (task === "email") {

        document
            .getElementById("emailPanel")
            .classList.add("active-panel");

        document
            .getElementById("emailNav")
            .classList.add("active");

        document.getElementById("pageTitle").innerText =
            "Email Extractor";

        document.getElementById("pageDescription").innerText =
            "Find email addresses from any text.";

    }


    if (task === "scrape") {

        document
            .getElementById("scrapePanel")
            .classList.add("active-panel");

        document
            .getElementById("scrapeNav")
            .classList.add("active");

        document.getElementById("pageTitle").innerText =
            "Web Scraper";

        document.getElementById("pageDescription").innerText =
            "Fetch a webpage and extract its title.";

    }


    addConsole(
        "TASK",
        "Selected " + task + " automation."
    );
}


// =====================================
// CONSOLE
// =====================================

function addConsole(type, message) {

    const consoleBox =
        document.getElementById("console");

    const line =
        document.createElement("div");

    line.className = "console-line";

    line.innerHTML =
        `<span>[${type}]</span> ${escapeHtml(message)}`;

    consoleBox.appendChild(line);

    consoleBox.scrollTop =
        consoleBox.scrollHeight;

}


function clearConsole() {

    document.getElementById("console").innerHTML = "";

    addConsole(
        "SYSTEM",
        "Console cleared."
    );

}


// =====================================
// MOVE JPG FILES
// =====================================

async function moveJpgs() {

    const source =
        document.getElementById("sourceFolder").value.trim();

    const destination =
        document.getElementById("destinationFolder").value.trim();


    if (!source || !destination) {

        addConsole(
            "ERROR",
            "Please enter both folders."
        );

        return;
    }


    addConsole(
        "RUN",
        "Searching for JPG files..."
    );


    try {

        const response =
            await fetch("/api/move-jpgs", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    source: source,
                    destination: destination
                })

            });


        const data =
            await response.json();


        if (data.success) {

            addConsole(
                "SUCCESS",
                data.message
            );

            showResult(
                data.count,
                data.files
            );

        } else {

            addConsole(
                "ERROR",
                data.message
            );

        }

    }

    catch (error) {

        addConsole(
            "ERROR",
            error.message
        );

    }

}


// =====================================
// EMAIL EXTRACTION
// =====================================

async function extractEmails() {

    const text =
        document.getElementById("emailText").value.trim();


    if (!text) {

        addConsole(
            "ERROR",
            "Please enter text first."
        );

        return;

    }


    addConsole(
        "RUN",
        "Scanning text for email addresses..."
    );


    try {

        const response =
            await fetch("/api/extract-emails", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text
                })

            });


        const data =
            await response.json();


        if (data.success) {

            addConsole(
                "SUCCESS",
                data.message
            );

            showEmailResults(
                data.emails
            );

        }

        else {

            addConsole(
                "ERROR",
                data.message
            );

        }

    }

    catch (error) {

        addConsole(
            "ERROR",
            error.message
        );

    }

}


// =====================================
// WEB SCRAPER
// =====================================

async function scrapeTitle() {

    const url =
        document.getElementById("websiteUrl").value.trim();


    if (!url) {

        addConsole(
            "ERROR",
            "Please enter a website URL."
        );

        return;

    }


    addConsole(
        "RUN",
        "Fetching website..."
    );


    try {

        const response =
            await fetch("/api/scrape-title", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: url
                })

            });


        const data =
            await response.json();


        if (data.success) {

            addConsole(
                "SUCCESS",
                "Page title extracted."
            );


            showResult(
                1,
                [
                    "URL: " + data.url,
                    "TITLE: " + data.title,
                    "STATUS: " + data.status_code
                ]
            );

        }

        else {

            addConsole(
                "ERROR",
                data.message
            );

        }

    }

    catch (error) {

        addConsole(
            "ERROR",
            error.message
        );

    }

}


// =====================================
// SHOW RESULTS
// =====================================

function showResult(count, items) {

    const card =
        document.getElementById("resultCard");

    const countBox =
        document.getElementById("resultCount");

    const content =
        document.getElementById("resultContent");


    card.style.display = "block";

    countBox.innerText =
        count + " item(s)";


    content.innerHTML = "";


    if (!items || items.length === 0) {

        content.innerText =
            "No matching files found.";

        return;

    }


    items.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "result-email";

        div.innerText =
            item;

        content.appendChild(div);

    });

}


// =====================================
// EMAIL RESULTS
// =====================================

function showEmailResults(emails) {

    const card =
        document.getElementById("resultCard");

    const countBox =
        document.getElementById("resultCount");

    const content =
        document.getElementById("resultContent");


    card.style.display = "block";


    countBox.innerText =
        emails.length + " email(s)";


    content.innerHTML = "";


    if (emails.length === 0) {

        content.innerText =
            "No email addresses found.";

        return;

    }


    emails.forEach(email => {

        const div =
            document.createElement("div");

        div.className =
            "result-email";

        div.innerText =
            "✉ " + email;

        content.appendChild(div);

    });

}


// =====================================
// SECURITY
// =====================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.innerText =
        text;

    return div.innerHTML;

}


// =====================================
// SERVER STATUS
// =====================================

async function checkServer() {

    try {

        const response =
            await fetch("/api/status");

        const data =
            await response.json();


        if (data.status === "online") {

            addConsole(
                "SERVER",
                "Flask server connected successfully."
            );

        }

    }

    catch (error) {

        addConsole(
            "ERROR",
            "Unable to connect to Flask server."
        );

    }

}


window.addEventListener(
    "load",
    checkServer
);