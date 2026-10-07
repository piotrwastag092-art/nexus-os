"use strict";

/* =========================================
   NEXUS OS — APPS (ulepszone)
   ========================================= */

function setAICommand(text) {
    const input = document.getElementById("aiCommand");
    if (!input) return;
    input.value = text;
    input.focus();
}

function runAICommand() {
    const input = document.getElementById("aiCommand");
    if (!input) return;

    const original = input.value.trim();
    if (!original) return;

    const cmd = original.toLowerCase();

    if (cmd.includes("plik") || cmd.includes("folder")) {
        openWindow("filesWindow");
    } else if (cmd.includes("przeglądark") || cmd.includes("internet") || cmd.includes("stron")) {
        openWindow("browserWindow");
    } else if (cmd.includes("terminal") || cmd.includes("konsol")) {
        openWindow("terminalWindow");
    } else if (cmd.includes("ustawien")) {
        openWindow("settingsWindow");
    } else if (cmd.includes("ai") || cmd.includes("asystent")) {
        openWindow("aiWindow");
    } else {
        showNotification("NEXUS AI", `Odebrałem: „${original}”.`);
        openWindow("aiWindow");
        setTimeout(() => {
            const chatInput = document.getElementById("aiChatInput");
            if (chatInput) {
                chatInput.value = original;
                sendAIMessage();
            }
        }, 200);
    }

    input.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("aiCommand");
    if (!input) return;
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            runAICommand();
        }
    });
});

/* ===== AI CZAT ===== */

function handleAIKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendAIMessage();
    }
}

function sendAIMessage() {
    const input = document.getElementById("aiChatInput");
    const messages = document.getElementById("aiMessages");
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerHTML = `
        <div class="message-bubble">
            <strong>Ty</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;
    messages.appendChild(userMsg);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        const reply = generateAIReply(text);
        const bot = document.createElement("div");
        bot.className = "message nexus";
        bot.innerHTML = `
            <div class="message-avatar">N</div>
            <div class="message-bubble">
                <strong>NEXUS AI</strong>
                <p>${reply}</p>
            </div>
        `;
        messages.appendChild(bot);
        messages.scrollTop = messages.scrollHeight;
    }, 450);
}

function generateAIReply(text) {
    const t = text.toLowerCase();

    if (t.includes("cześć") || t.includes("hej") || t.includes("siema")) {
        return "Siema. Jestem NEXUS AI. Co chcesz zrobić?";
    }
    if (t.includes("pomoc") || t.includes("help")) {
        return "Mogę otworzyć okna, odpalać terminal, pliki, przeglądarkę. Napisz co potrzebujesz.";
    }
    if (t.includes("wersja") || t.includes("system")) {
        return `Aktualnie działam na NEXUS OS ${NEXUS.version}. Web Shell.`;
    }
    if (t.includes("kurwa") || t.includes("chuj") || t.includes("jebać")) {
        return "Spokojnie, też lubię ostre słownictwo. Co konkretnie mam zrobić?";
    }
    if (t.includes("otwórz") || t.includes("odpal")) {
        return "Dobra, sprawdzam... Jeśli napiszesz konkretną aplikację, to ją otworzę.";
    }

    return "Zrozumiałem. Rdzeń AI jeszcze się uczy, ale już działam. Napisz konkretniej albo otwórz terminal i wpisz help.";
}

/* ===== PRZEGLĄDARKA ===== */

function handleBrowserKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        navigateBrowser();
    }
}

function navigateBrowser() {
    const input = document.getElementById("browserAddress");
    const content = document.getElementById("browserContent");
    if (!input || !content) return;

    let address = input.value.trim();
    if (!address) return;

    if (!address.startsWith("http://") && !address.startsWith("https://")) {
        address = `https://www.google.com/search?q=${encodeURIComponent(address)}`;
    }

    content.innerHTML = `
        <div class="browser-start">
            <div class="browser-logo">N</div>
            <h1>Ładowanie...</h1>
            <p>NEXUS Browser łączy się.</p>
        </div>
    `;

    setTimeout(() => {
        content.innerHTML = `
            <iframe
                src="${escapeHTML(address)}"
                title="NEXUS Browser"
                style="width:100%;height:100%;border:0;background:#fff;"
            ></iframe>
        `;
    }, 280);
}

function browserBack() {
    showNotification("Przeglądarka", "Historia wstecz jeszcze nie zaimplementowana.");
}

function browserForward() {
    showNotification("Przeglądarka", "Historia w przód jeszcze nie zaimplementowana.");
}

function browserReload() {
    const iframe = document.querySelector("#browserContent iframe");
    if (iframe) {
        iframe.src = iframe.src;
    } else {
        showNotification("Przeglądarka", "Nic nie jest załadowane.");
    }
}

/* ===== PLIKI ===== */

function openFile(name) {
    showNotification("Pliki", `Plik: ${name}`);
}

function openFolder(name) {
    showNotification("Pliki", `Folder: ${name}`);
}

/* ===== TERMINAL ===== */

function handleTerminalKey(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const input = document.getElementById("terminalInput");
    const output = document.getElementById("terminalOutput");
    if (!input || !output) return;

    const command = input.value.trim();
    if (!command) return;

    const line = document.createElement("div");
    line.innerHTML = `<span style="color:#7c5cff">nexus@system:~$</span> ${escapeHTML(command)}`;
    output.appendChild(line);

    const lower = command.toLowerCase();

    if (lower === "help") {
        const help = document.createElement("div");
        help.innerHTML = `
            <strong>Dostępne komendy:</strong><br>
            help &nbsp;&nbsp;&nbsp;&nbsp; — lista komend<br>
            clear &nbsp;&nbsp;&nbsp; — czyści terminal<br>
            time &nbsp;&nbsp;&nbsp;&nbsp; — aktualny czas<br>
            system &nbsp;&nbsp; — info o systemie<br>
            open [app] — otwiera aplikację (pliki, browser, ai, terminal, ustawienia)<br>
            neofetch &nbsp; — info o systemie (ładniejsze)<br>
            echo [tekst] — wypisuje tekst
        `;
        output.appendChild(help);
    }
    else if (lower === "clear") {
        output.innerHTML = "";
        input.value = "";
        return;
    }
    else if (lower === "time") {
        const now = new Date();
        const time = new Intl.DateTimeFormat("pl-PL", {
            timeZone: "Europe/Warsaw",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);
        const res = document.createElement("div");
        res.textContent = time;
        output.appendChild(res);
    }
    else if (lower === "system" || lower === "neofetch") {
        const res = document.createElement("div");
        res.innerHTML = `
            <pre style="margin:0;line-height:1.4">
NEXUS OS
Wersja:    ${NEXUS.version}
Platforma: NEXUS Web Shell
Język:     polski
Status:    ${NEXUS.systemReady ? "gotowy" : "uruchamianie"}
Uptime:    od załadowania strony
            </pre>
        `;
        output.appendChild(res);
    }
    else if (lower.startsWith("echo ")) {
        const res = document.createElement("div");
        res.textContent = command.slice(5);
        output.appendChild(res);
    }
    else if (lower.startsWith("open ")) {
        const app = lower.replace("open ", "").trim();

        if (app.includes("plik")) openWindow("filesWindow");
        else if (app.includes("browser") || app.includes("przeglądark") || app.includes("internet")) openWindow("browserWindow");
        else if (app.includes("ai")) openWindow("aiWindow");
        else if (app.includes("terminal")) openWindow("terminalWindow");
        else if (app.includes("ustaw")) openWindow("settingsWindow");
        else {
            const res = document.createElement("div");
            res.textContent = "Nie znaleziono aplikacji.";
            output.appendChild(res);
        }
    }
    else {
        const res = document.createElement("div");
        res.textContent = `Polecenie „${command}” nieznane. Wpisz help.`;
        output.appendChild(res);
    }

    input.value = "";
    output.scrollTop = output.scrollHeight;
}
