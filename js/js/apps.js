"use strict";

/* =========================================
   NEXUS OS — APPS v0.3
   ========================================= */

let aiMemory = JSON.parse(localStorage.getItem("nexus-ai-memory") || "[]");

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
        openWindow("aiWindow");
        setTimeout(() => {
            const chatInput = document.getElementById("aiChatInput");
            if (chatInput) {
                chatInput.value = original;
                sendAIMessage();
            }
        }, 180);
    }

    input.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("aiCommand");
    if (input) {
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                runAICommand();
            }
        });
    }
});

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

    aiMemory.push({ role: "user", text, time: Date.now() });
    if (aiMemory.length > 40) aiMemory.shift();
    localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory));

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

    const thinking = document.createElement("div");
    thinking.className = "message nexus";
    thinking.id = "thinkingMsg";
    thinking.innerHTML = `
        <div class="message-avatar">N</div>
        <div class="message-bubble">
            <strong>NEXUS AI</strong>
            <p>Myślę...</p>
        </div>
    `;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        const reply = generateAIReply(text);
        const thinkingEl = document.getElementById("thinkingMsg");
        if (thinkingEl) thinkingEl.remove();

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

        aiMemory.push({ role: "ai", text: reply, time: Date.now() });
        localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory));
    }, 600 + Math.random() * 400);
}

function generateAIReply(text) {
    const t = text.toLowerCase().trim();

    if (t.includes("otwórz pliki") || t === "pliki") {
        openWindow("filesWindow");
        return "Otworzyłem menedżer plików.";
    }
    if (t.includes("otwórz terminal") || t === "terminal") {
        openWindow("terminalWindow");
        return "Terminal gotowy.";
    }
    if (t.includes("otwórz przeglądark") || t.includes("internet")) {
        openWindow("browserWindow");
        return "Przeglądarka otwarta.";
    }
    if (t.includes("ustawienia")) {
        openWindow("settingsWindow");
        return "Ustawienia systemu.";
    }

    if (/(cześć|hej|siema|witaj|dzień dobry)/.test(t)) {
        return "Siema. Jestem NEXUS AI. Co robimy?";
    }
    if (/(jak się masz|co u ciebie|jak leci)/.test(t)) {
        return "Działam, uczę się na Twoich komendach i pamiętam ostatnie rozmowy. Gotowy do roboty.";
    }
    if (/(pomoc|help|co potrafisz)/.test(t)) {
        return "Mogę otwierać aplikacje, odpalać terminal, odpowiadać na pytania i zapamiętywać nasze rozmowy. Napisz konkretnie czego potrzebujesz.";
    }
    if (/(wersja|jaki system|co to za system)/.test(t)) {
        return `To NEXUS OS ${NEXUS.version}. Webowy shell, który się rozwija.`;
    }
    if (/(kurwa|chuj|jebać|pierdol|huj)/.test(t)) {
        return "Rozumiem frustrację. Mów wprost co mam zrobić – załatwimy.";
    }
    if (/(dzięki|thx|dziękuję)/.test(t)) {
        return "Nie ma sprawy. Jestem tu po to.";
    }
    if (/(kim jesteś|co jesteś)/.test(t)) {
        return "NEXUS AI – lokalny asystent systemu. Póki co działam offline, ale pamiętam co do mnie piszesz.";
    }

    const answers = [
        "Zrozumiałem. Co dalej?",
        "Jasne. Mogę w tym pomóc – daj więcej szczegółów.",
        "Notuję. Jak chcesz coś konkretnego zrobić w systemie, to mów.",
        "Dobra, jestem z Tobą. Co robimy?",
        "Przetworzyłem. Napisz dokładniej albo otwórz terminal i wpisz help."
    ];
    return answers[Math.floor(Math.random() * answers.length)];
}

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
        if (address.includes(".") && !address.includes(" ")) {
            address = "https://" + address;
        } else {
            address = `https://www.google.com/search?q=${encodeURIComponent(address)}`;
        }
    }

    content.innerHTML = `
        <div class="browser-start">
            <div class="browser-logo">N</div>
            <h1>Ładowanie...</h1>
            <p>${escapeHTML(address)}</p>
            <p style="margin-top:12px;font-size:13px;opacity:0.7">
                Jeśli strona się nie załaduje – wiele serwisów blokuje iframe.<br>
                Użyj przycisku „Otwórz na zewnątrz”.
            </p>
        </div>
    `;

    setTimeout(() => {
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div style="padding:8px 12px;background:rgba(0,0,0,0.3);display:flex;gap:8px;align-items:center;">
                    <button onclick="openExternal('${escapeHTML(address)}')" style="padding:6px 12px;border-radius:8px;background:var(--nexus-accent);cursor:pointer;border:0;color:white;">
                        Otwórz na zewnątrz
                    </button>
                    <span style="font-size:12px;opacity:0.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${escapeHTML(address)}
                    </span>
                </div>
                <iframe
                    src="${escapeHTML(address)}"
                    title="NEXUS Browser"
                    style="flex:1;width:100%;border:0;background:#fff;"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                ></iframe>
            </div>
        `;
    }, 400);
}

function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
    showNotification("Przeglądarka", "Otworzono w nowej karcie");
}

function browserBack() {
    showNotification("Przeglądarka", "Historia wstecz – w przygotowaniu");
}

function browserForward() {
    showNotification("Przeglądarka", "Historia w przód – w przygotowaniu");
}

function browserReload() {
    const iframe = document.querySelector("#browserContent iframe");
    if (iframe) {
        iframe.src = iframe.src;
        showNotification("Przeglądarka", "Odświeżono");
    } else {
        showNotification("Przeglądarka", "Nic nie jest załadowane");
    }
}

function openFile(name) {
    showNotification("Pliki", `Plik: ${name}`);
}

function openFolder(name) {
    showNotification("Pliki", `Folder: ${name}`);
}

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
            help, clear, time, system, neofetch<br>
            open [app], echo [tekst]
        `;
        output.appendChild(help);
    } else if (lower === "clear") {
        output.innerHTML = "";
        input.value = "";
        return;
    } else if (lower === "time") {
        const time = new Intl.DateTimeFormat("pl-PL", {
            timeZone: "Europe/Warsaw",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).format(new Date());
        const res = document.createElement("div");
        res.textContent = time;
        output.appendChild(res);
    } else if (lower === "system" || lower === "neofetch") {
        const res = document.createElement("div");
        res.innerHTML = `
            <pre style="margin:0;line-height:1.4">
NEXUS OS ${NEXUS.version}
Platforma: NEXUS Web Shell
Status:    ${NEXUS.systemReady ? "gotowy" : "uruchamianie"}
AI:        aktywne (pamięć lokalna)
            </pre>
        `;
        output.appendChild(res);
    } else if (lower.startsWith("echo ")) {
        const res = document.createElement("div");
        res.textContent = command.slice(5);
        output.appendChild(res);
    } else if (lower.startsWith("open ")) {
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
    } else {
        const res = document.createElement("div");
        res.textContent = `Nieznane polecenie. Wpisz help.`;
        output.appendChild(res);
    }

    input.value = "";
    output.scrollTop = output.scrollHeight;
}

function changeAccent(color) {
    if (!NEXUS.settings) return;
    NEXUS.settings.accent = color;
    applySettings();
    saveState();
    showNotification("Ustawienia", "Zmieniono kolor akcentu");
}

function changeAccent2(color) {
    if (!NEXUS.settings) return;
    NEXUS.settings.accent2 = color;
    applySettings();
    saveState();
    showNotification("Ustawienia", "Zmieniono drugi akcent");
}
