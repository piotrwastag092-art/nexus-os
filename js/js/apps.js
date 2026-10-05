"use strict";


/* =========================================
   NEXUS AI — POLECENIA Z PULPITU
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

    const originalCommand =
        input.value.trim();

    if (!originalCommand) return;

    const command =
        originalCommand.toLowerCase();

    if (
        command.includes("plik") ||
        command.includes("folder")
    ) {
        openWindow("filesWindow");

    } else if (
        command.includes("przeglądark") ||
        command.includes("internet") ||
        command.includes("stron")
    ) {
        openWindow("browserWindow");

    } else if (
        command.includes("terminal") ||
        command.includes("konsol")
    ) {
        openWindow("terminalWindow");

    } else if (
        command.includes("ustawien")
    ) {
        openWindow("settingsWindow");

    } else if (
        command.includes("ai") ||
        command.includes("asystent")
    ) {
        openWindow("aiWindow");

    } else {

        showNotification(
            "NEXUS AI",
            `Odebrałem polecenie: „${originalCommand}”.`
        );
    }

    input.value = "";
}


/* =========================================
   ENTER W POLU AI NA PULPICIE
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const input =
        document.getElementById("aiCommand");

    if (!input) return;

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();
            runAICommand();
        }

    });
});


/* =========================================
   NEXUS AI — CZAT
   ========================================= */

function handleAIKey(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        sendAIMessage();
    }
}


function sendAIMessage() {

    const input =
        document.getElementById("aiChatInput");

    const messages =
        document.getElementById("aiMessages");

    if (!input || !messages) return;

    const text =
        input.value.trim();

    if (!text) return;


    /* Wiadomość użytkownika */

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "message user";

    userMessage.innerHTML = `
        <div class="message-bubble">
            <strong>Ty</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    messages.appendChild(userMessage);

    input.value = "";

    messages.scrollTop =
        messages.scrollHeight;


    /* Odpowiedź NEXUS */

    setTimeout(() => {

        const response =
            document.createElement("div");

        response.className =
            "message nexus";

        response.innerHTML = `
            <div class="message-avatar">N</div>

            <div class="message-bubble">
                <strong>NEXUS AI</strong>
                <p>
                    Polecenie zostało odebrane.
                    Rdzeń sztucznej inteligencji
                    NEXUS będzie rozwijany
                    w kolejnych etapach systemu.
                </p>
            </div>
        `;

        messages.appendChild(response);

        messages.scrollTop =
            messages.scrollHeight;

    }, 500);
}


/* =========================================
   PRZEGLĄDARKA
   ========================================= */

function handleBrowserKey(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        navigateBrowser();
    }
}


function navigateBrowser() {

    const input =
        document.getElementById("browserAddress");

    const content =
        document.getElementById("browserContent");

    if (!input || !content) return;

    let address =
        input.value.trim();

    if (!address) return;


    /* Jeśli użytkownik wpisał zwykły tekst,
       traktujemy go jako wyszukiwanie */

    if (
        !address.startsWith("http://") &&
        !address.startsWith("https://")
    ) {

        const query =
            encodeURIComponent(address);

        address =
            `https://www.google.com/search?q=${query}`;
    }


    content.innerHTML = `
        <div class="browser-start">

            <div class="browser-logo">N</div>

            <h1>Ładowanie strony…</h1>

            <p>
                NEXUS Browser przygotowuje połączenie.
            </p>

        </div>
    `;


    /*
       Próba otwarcia strony.
       Nie każda strona pozwala na osadzenie
       w iframe — to normalne zabezpieczenie WWW.
    */

    setTimeout(() => {

        content.innerHTML = `
            <iframe
                src="${escapeHTML(address)}"
                title="NEXUS Browser"
                style="
                    width:100%;
                    height:100%;
                    border:0;
                    background:#ffffff;
                "
            ></iframe>
        `;

    }, 300);
}


/* =========================================
   PRZYCISKI PRZEGLĄDARKI
   ========================================= */

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

    const iframe =
        document.querySelector(
            "#browserContent iframe"
        );

    if (iframe) {
        iframe.src = iframe.src;
        return;
    }

    showNotification(
        "Przeglądarka",
        "Brak aktywnej strony."
    );
}


/* =========================================
   PLIKI — OTWIERANIE ELEMENTÓW
   ========================================= */

function openFile(name) {

    showNotification(
        "Pliki",
        `Wybrano: ${name}`
    );
}


function openFolder(name) {

    showNotification(
        "Pliki",
        `Otwieranie folderu: ${name}`
    );
}


/* =========================================
   TERMINAL
   ========================================= */

function handleTerminalKey(event) {

    if (event.key !== "Enter") return;

    event.preventDefault();

    const input =
        document.getElementById("terminalInput");

    const output =
        document.getElementById("terminalOutput");

    if (!input || !output) return;

    const command =
        input.value.trim();

    if (!command) return;


    /* Wpisana komenda */

    const line =
        document.createElement("div");

    line.innerHTML = `
        <span>nexus@system:~$</span>
        ${escapeHTML(command)}
    `;

    output.appendChild(line);


    const lower =
        command.toLowerCase();


    /* HELP */

    if (lower === "help") {

        const result =
            document.createElement("div");

        result.innerHTML = `
            Dostępne polecenia:
            <br><br>

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

            <strong>open pliki</strong>
            — otwórz pliki
            <br>

            <strong>open browser</strong>
            — otwórz przeglądarkę
            <br>

            <strong>open ai</strong>
            — otwórz NEXUS AI
        `;

        output.appendChild(result);
    }


    /* CLEAR */

    else if (lower === "clear") {

        output.innerHTML = "";

        input.value = "";

        return;
    }


    /* TIME */

    else if (lower === "time") {

        const now =
            new Date();

        const time =
            new Intl.DateTimeFormat(
                "pl-PL",
                {
                    timeZone: "Europe/Warsaw",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            ).format(now);

        const result =
            document.createElement("div");

        result.textContent =
            time;

        output.appendChild(result);
    }


    /* SYSTEM */

    else if (lower === "system") {

        const result =
            document.createElement("div");

        result.innerHTML = `
            NEXUS OS
            <br>
            Wersja: ${NEXUS.version}
            <br>
            Platforma: NEXUS Web Shell
            <br>
            Język: polski
            <br>
            Status:
            ${NEXUS.systemReady
                ? "gotowy"
                : "uruchamianie"}
        `;

        output.appendChild(result);
    }


    /* OPEN */

    else if (lower.startsWith("open ")) {

        const app =
            lower
                .replace("open ", "")
                .trim();


        if (
            app.includes("plik")
        ) {
            openWindow("filesWindow");

        } else if (
            app.includes("browser") ||
            app.includes("przeglądark")
        ) {
            openWindow("browserWindow");

        } else if (
            app.includes("ai")
        ) {
            openWindow("aiWindow");

        } else if (
            app.includes("terminal")
        ) {
            openWindow("terminalWindow");

        } else if (
            app.includes("ustaw")
        ) {
            openWindow("settingsWindow");

        } else {

            const result =
                document.createElement("div");

            result.textContent =
                "Nie znaleziono aplikacji.";

            output.appendChild(result);
        }
    }


    /* NIEZNANA KOMENDA */

    else {

        const result =
            document.createElement("div");

        result.textContent =
            "Polecenie nie zostało rozpoznane. Wpisz „help”.";

        output.appendChild(result);
    }


    input.value = "";

    output.scrollTop =
        output.scrollHeight;
}
