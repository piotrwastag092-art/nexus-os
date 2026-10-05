/* =========================================
   NEXUS OS — APPLICATIONS
   apps.js
========================================= */

"use strict";


/* =========================================
   NEXUS AI — GŁÓWNE POLECENIE
========================================= */

function setAICommand(text) {

    const input =
        document.getElementById("aiCommand");

    if (!input) return;

    input.value = text;

    input.focus();
}


function runAICommand() {

    const input =
        document.getElementById("aiCommand");

    if (!input) return;

    const command =
        input.value.toLowerCase().trim();

    if (!command) return;


    if (
        command.includes("pliki") ||
        command.includes("plik")
    ) {

        openWindow("filesWindow");

    } else if (
        command.includes("przeglądark") ||
        command.includes("internet")
    ) {

        openWindow("browserWindow");

    } else if (
        command.includes("ustaw")
    ) {

        openWindow("settingsWindow");

    } else if (
        command.includes("terminal")
    ) {

        openWindow("terminalWindow");

    } else if (
        command.includes("ai") ||
        command.includes("asystent")
    ) {

        openWindow("aiWindow");

    } else {

        showNotification(
            "NEXUS AI",
            "Odebrałem polecenie: „" +
            input.value +
            "”. Funkcja AI zostanie rozbudowana."
        );

    }

    input.value = "";
}


document
    .getElementById("aiCommand")
    ?.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                runAICommand();

            }

        }
    );


/* =========================================
   CZAT NEXUS AI
========================================= */

function handleAIKey(event) {

    if (event.key === "Enter") {

        sendAIMessage();

    }
}


function sendAIMessage() {

    const input =
        document.getElementById(
            "aiChatInput"
        );

    const messages =
        document.getElementById(
            "aiMessages"
        );

    if (!input || !messages) return;


    const text =
        input.value.trim();


    if (!text) return;


    const userMessage =
        document.createElement("div");

    userMessage.className =
        "ai-message user";


    userMessage.innerHTML = `
        <div class="ai-bubble">
            <strong>Ty</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;


    messages.appendChild(
        userMessage
    );


    input.value = "";


    messages.scrollTop =
        messages.scrollHeight;


    setTimeout(() => {

        const response =
            document.createElement("div");


        response.className =
            "ai-message";


        response.innerHTML = `
            <div class="ai-avatar">N</div>

            <div class="ai-bubble">

                <strong>NEXUS AI</strong>

                <p>
                    Przyjąłem polecenie.
                    Prawdziwy silnik NEXUS AI
                    zostanie podłączony do systemu
                    w kolejnych etapach projektu.
                </p>

            </div>
        `;


        messages.appendChild(
            response
        );


        messages.scrollTop =
            messages.scrollHeight;


    }, 500);
}


/* =========================================
   PRZEGLĄDARKA
========================================= */

function handleBrowserKey(event) {

    if (event.key === "Enter") {

        navigateBrowser();

    }
}


function navigateBrowser() {

    const input =
        document.getElementById(
            "browserAddress"
        );

    if (!input) return;


    const address =
        input.value.trim();


    if (!address) return;


    const content =
        document.getElementById(
            "browserContent"
        );


    if (!content) return;


    content.innerHTML = `

        <div class="browser-start">

            <div class="browser-logo">
                N
            </div>

            <h1>
                ${escapeHTML(address)}
            </h1>

            <p>
                NEXUS Browser jest obecnie
                w wersji demonstracyjnej.
            </p>

        </div>

    `;
}


function browserSearch() {

    const input =
        document.getElementById(
            "browserSearch"
        );

    if (!input) return;


    const query =
        input.value.trim();


    if (!query) return;


    const address =
        document.getElementById(
            "browserAddress"
        );


    if (address) {

        address.value = query;

    }


    navigateBrowser();
}


function handleSearchKey(event) {

    if (event.key === "Enter") {

        browserSearch();

    }
}


function browserBack() {

    showNotification(
        "Przeglądarka",
        "Brak poprzedniej strony."
    );
}


function browserForward() {

    showNotification(
        "Przeglądarka",
        "Brak następnej strony."
    );
}


function browserReload() {

    showNotification(
        "Przeglądarka",
        "Strona została odświeżona."
    );
}


/* =========================================
   TERMINAL
========================================= */

function handleTerminalKey(event) {

    if (event.key !== "Enter") return;


    const input =
        document.getElementById(
            "terminalInput"
        );


    const output =
        document.getElementById(
            "terminalOutput"
        );


    if (!input || !output) return;


    const command =
        input.value.trim();


    if (!command) return;


    const line =
        document.createElement("div");


    line.innerHTML =
        `<span>nexus@system:~$</span> ${
            escapeHTML(command)
        }`;


    output.appendChild(line);


    const result =
        document.createElement("div");


    const lower =
        command.toLowerCase();


    if (lower === "help") {

        result.innerHTML = `

            Dostępne polecenia:
            <br>

            <strong>help</strong>
            — pomoc

            <br>

            <strong>clear</strong>
            — wyczyść ekran

            <br>

            <strong>time</strong>
            — aktualny czas

            <br>

            <strong>system</strong>
            — informacje o systemie

            <br>

            <strong>open</strong>
            — otwórz aplikację

        `;


    } else if (lower === "clear") {

        output.innerHTML = "";

        input.value = "";

        return;


    } else if (lower === "time") {

        result.textContent =
            new Date().toLocaleString(
                "pl-PL"
            );


    } else if (lower === "system") {

        result.innerHTML = `

            NEXUS OS
            <br>

            Wersja: 0.1
            <br>

            Tryb: demonstracyjny
            <br>

            Status: aktywny

        `;


    } else if (
        lower.startsWith("open ")
    ) {

        const app =
            lower
                .replace("open ", "")
                .trim();


        if (
            app.includes("pliki")
        ) {

            openWindow(
                "filesWindow"
            );


        } else if (
            app.includes("browser") ||
            app.includes("przeglądark")
        ) {

            openWindow(
                "browserWindow"
            );


        } else if (
            app.includes("ai")
        ) {

            openWindow(
                "aiWindow"
            );


        } else if (
            app.includes("ustaw")
        ) {

            openWindow(
                "settingsWindow"
            );


        } else {

            result.textContent =
                "Nie znaleziono aplikacji.";

        }


    } else {

        result.textContent =
            "Polecenie nie zostało rozpoznane. Wpisz „help”.";

    }


    output.appendChild(
        result
    );


    input.value = "";


    output.scrollTop =
        output.scrollHeight;
}


/* =========================================
   KONIEC MODUŁU APLIKACJI
========================================= */
