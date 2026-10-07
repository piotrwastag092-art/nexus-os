"use strict";

/* =========================================
   NEXUS OS — APPS v0.5  (SERIO DZIAŁA)
   ========================================= */

let aiMemory = JSON.parse(localStorage.getItem("nexus-ai-memory") || "[]");
let currentNotepadFile = null;
let currentNotepadPath = []; // ścieżka folderu pliku

/* ========== AI — PULPIT ========== */
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

    openWindow("aiWindow");
    setTimeout(() => {
        const c = document.getElementById("aiChatInput");
        if (c) {
            c.value = original;
            sendAIMessage();
        }
    }, 180);
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

/* ========== AI CZAT + INTELIGENCJA ========== */
function handleAIKey(e) {
    if (e.key === "Enter") {
        e.preventDefault();
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
    if (aiMemory.length > 60) aiMemory.shift();
    localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory));

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerHTML = `<div class="message-bubble"><strong>Ty</strong><p>${escapeHTML(text)}</p></div>`;
    messages.appendChild(userMsg);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    const thinking = document.createElement("div");
    thinking.className = "message nexus";
    thinking.id = "thinkingMsg";
    thinking.innerHTML = `<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>Myślę i wykonuję...</p></div>`;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    // spróbuj prawdziwego API jeśli jest klucz
    const apiKey = (NEXUS.settings && NEXUS.settings.apiKey) || localStorage.getItem("nexus-api-key") || "";

    if (apiKey && apiKey.length > 10) {
        callRealAI(text, apiKey, messages);
    } else {
        setTimeout(() => {
            const el = document.getElementById("thinkingMsg");
            if (el) el.remove();
            const reply = smartAI(text);
            appendAIMessage(messages, reply);
        }, 400 + Math.random() * 350);
    }
}

function appendAIMessage(messages, reply) {
    const bot = document.createElement("div");
    bot.className = "message nexus";
    bot.innerHTML = `<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>${reply}</p></div>`;
    messages.appendChild(bot);
    messages.scrollTop = messages.scrollHeight;
    aiMemory.push({ role: "ai", text: reply, time: Date.now() });
    localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory));
}

/* Prawdziwe AI przez API (opcjonalnie) — OpenAI-compatible */
async function callRealAI(userText, apiKey, messages) {
    try {
        const systemPrompt = `Jesteś NEXUS AI — asystentem systemu NEXUS OS.
Możesz sterować systemem. Gdy użytkownik prosi o akcję, na KOŃCU odpowiedzi dodaj dokładnie jedną linię w formacie:
[[CMD:polecenie]]
Dostępne polecenia:
[[CMD:open files]] [[CMD:open terminal]] [[CMD:open browser]] [[CMD:open notepad]] [[CMD:open settings]] [[CMD:open ai]]
[[CMD:mkdir NAZWA]] [[CMD:touch NAZWA]] [[CMD:rm NAZWA]] [[CMD:write NAZWA|TREŚĆ]]
[[CMD:ls]] [[CMD:cd NAZWA]]
Odpowiadaj po polsku, krótko i konkretnie.`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...aiMemory.slice(-10).map(m => ({
                        role: m.role === "ai" ? "assistant" : "user",
                        content: m.text
                    })),
                    { role: "user", content: userText }
                ],
                max_tokens: 400,
                temperature: 0.7
            })
        });

        const el = document.getElementById("thinkingMsg");
        if (el) el.remove();

        if (!res.ok) throw new Error("API " + res.status);

        const data = await res.json();
        let reply = (data.choices && data.choices[0] && data.choices[0].message.content) || "Brak odpowiedzi.";

        // wykonaj komendy z odpowiedzi
        const cmdMatch = reply.match(/\[\[CMD:([^\]]+)\]\]/g);
        if (cmdMatch) {
            cmdMatch.forEach(raw => {
                const inner = raw.replace("[[CMD:", "").replace("]]", "").trim();
                executeAICommand(inner);
            });
            reply = reply.replace(/\[\[CMD:[^\]]+\]\]/g, "").trim();
        }

        appendAIMessage(messages, escapeHTML(reply).replace(/\n/g, "<br>"));
    } catch (err) {
        const el = document.getElementById("thinkingMsg");
        if (el) el.remove();
        // fallback na lokalne AI
        const reply = smartAI(userText);
        appendAIMessage(messages, reply + "<br><br><small style='opacity:0.6'>(API niedostępne — tryb lokalny)</small>");
    }
}

/* Lokalne inteligentne AI — naprawdę wykonuje akcje */
function smartAI(text) {
    const t = text.toLowerCase().trim();

    // --- OTWIERANIE ---
    if (/otw[oó]rz\s+(pliki|folder|eksplorator)/.test(t) || t === "pliki") {
        openWindow("filesWindow");
        renderFiles();
        return "Otworzyłem menedżer plików.";
    }
    if (/otw[oó]rz\s+terminal/.test(t) || t === "terminal") {
        openWindow("terminalWindow");
        return "Terminal gotowy. Wpisz <b>help</b>.";
    }
    if (/otw[oó]rz\s+(przeglądark|internet|browser)/.test(t)) {
        openWindow("browserWindow");
        return "Przeglądarka otwarta.";
    }
    if (/otw[oó]rz\s+notatnik/.test(t) || t === "notatnik") {
        openWindow("notepadWindow");
        return "Notatnik gotowy.";
    }
    if (/otw[oó]rz\s+ustawien/.test(t)) {
        openWindow("settingsWindow");
        return "Ustawienia systemu.";
    }

    // --- TWORZENIE PLIKU ---
    let m = t.match(/(?:utw[oó]rz|stw[oó]rz|zrób|nowy)\s+plik(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-\.]+)['"]?/i)
        || t.match(/touch\s+([a-z0-9_\-\.]+)/i);
    if (m) {
        let name = m[1];
        if (!name.includes(".")) name += ".txt";
        const ok = fsCreateFile(name, "");
        if (ok) {
            openWindow("filesWindow");
            renderFiles();
            return `Utworzyłem plik <b>${escapeHTML(name)}</b> w bieżącym katalogu.`;
        }
        return "Nie udało się utworzyć pliku (może już istnieje).";
    }

    // --- TWORZENIE FOLDERU ---
    m = t.match(/(?:utw[oó]rz|stw[oó]rz|zrób)\s+folder(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-]+)['"]?/i)
        || t.match(/mkdir\s+([a-z0-9_\-]+)/i);
    if (m) {
        const name = m[1];
        const ok = fsCreateFolder(name);
        if (ok) {
            openWindow("filesWindow");
            renderFiles();
            return `Utworzyłem folder <b>${escapeHTML(name)}</b>.`;
        }
        return "Folder już istnieje albo błąd.";
    }

    // --- USUWANIE ---
    m = t.match(/(?:usu[nń]|skasuj|delete|rm)\s+(?:plik\s+|folder\s+)?['"]?([a-z0-9_\-\.]+)['"]?/i);
    if (m) {
        const name = m[1];
        const ok = fsDelete(name);
        if (ok) {
            openWindow("filesWindow");
            renderFiles();
            return `Usunąłem <b>${escapeHTML(name)}</b>.`;
        }
        return `Nie znalazłem <b>${escapeHTML(name)}</b> w bieżącym katalogu.`;
    }

    // --- ZAPIS TREŚCI DO PLIKU ---
    m = t.match(/(?:zapisz|napisz|wpisz)\s+(?:do\s+)?(?:pliku\s+)?['"]?([a-z0-9_\-\.]+)['"]?\s*[:\-–]\s*(.+)/i)
        || t.match(/write\s+([a-z0-9_\-\.]+)\s+(.+)/i);
    if (m) {
        let name = m[1];
        const content = m[2];
        if (!name.includes(".")) name += ".txt";
        fsCreateFile(name, content);
        openWindow("filesWindow");
        renderFiles();
        return `Zapisałem treść do <b>${escapeHTML(name)}</b>.`;
    }

    // --- LISTA PLIKÓW ---
    if (/^(ls|list|pokaż pliki|co jest w folderze|katalog)/.test(t)) {
        const dir = getCurrentDir();
        const names = dir ? Object.keys(dir) : [];
        openWindow("filesWindow");
        renderFiles();
        if (!names.length) return "Katalog jest pusty.";
        return "Zawartość:<br>" + names.map(n => {
            const it = dir[n];
            return (it.type === "folder" ? "📁 " : "📄 ") + escapeHTML(n);
        }).join("<br>");
    }

    // --- CZYTAJ PLIK ---
    m = t.match(/(?:przeczytaj|otwórz|pokaż|cat)\s+(?:plik\s+)?['"]?([a-z0-9_\-\.]+)['"]?/i);
    if (m) {
        const name = m[1];
        const dir = getCurrentDir();
        if (dir && dir[name] && dir[name].type === "file") {
            openFileInNotepad(name, dir[name].content || "");
            return `Otworzyłem <b>${escapeHTML(name)}</b> w notatniku.`;
        }
        return `Nie ma pliku <b>${escapeHTML(name)}</b>.`;
    }

    // --- ROZMOWA ---
    if (/(cześć|hej|siema|witaj)/.test(t)) return "Siema. Mogę tworzyć pliki, foldery, usuwać, otwierać aplikacje. Po prostu mów co zrobić.";
    if (/(pomoc|help|co potrafisz)/.test(t)) {
        return `Potrafisz pisać naturalnie, np.:<br>
• „utwórz plik notatka.txt”<br>
• „utwórz folder Projekty”<br>
• „usuń plik test.txt”<br>
• „zapisz do todo.txt: kup mleko”<br>
• „przeczytaj Witaj.txt”<br>
• „otwórz terminal” / „pokaż pliki”<br><br>
W ustawieniach możesz wkleić klucz OpenAI — wtedy działam jak prawdziwe AI.`;
    }
    if (/(wersja|system)/.test(t)) return `NEXUS OS <b>${NEXUS.version}</b> — Web Shell z wirtualnym dyskiem i AI.`;
    if (/(kurwa|chuj|jebać|pierdol)/.test(t)) return "Spoko. Mów konkretnie co mam zrobić w systemie.";
    if (/(dzięki|thx)/.test(t)) return "Nie ma sprawy.";

    // domyślnie — spróbuj wykonać jako komendę terminala-like
    if (/^(mkdir|touch|rm|ls|cd|cat|open)\s*/.test(t)) {
        const fakeOut = document.createElement("div");
        runTerminalCommand(text, fakeOut);
        const result = fakeOut.innerText || fakeOut.textContent || "Wykonano.";
        renderFiles();
        return escapeHTML(result).replace(/\n/g, "<br>");
    }

    return "Zrozumiałem. Możesz powiedzieć np. <b>utwórz plik xyz.txt</b>, <b>usuń coś</b>, <b>otwórz pliki</b> albo wkleić klucz API w ustawieniach żeby być jeszcze mądrzejszym.";
}

function executeAICommand(cmd) {
    const c = cmd.toLowerCase().trim();
    if (c === "open files") { openWindow("filesWindow"); renderFiles(); }
    else if (c === "open terminal") openWindow("terminalWindow");
    else if (c === "open browser") openWindow("browserWindow");
    else if (c === "open notepad") openWindow("notepadWindow");
    else if (c === "open settings") openWindow("settingsWindow");
    else if (c === "open ai") openWindow("aiWindow");
    else if (c.startsWith("mkdir ")) fsCreateFolder(cmd.slice(6).trim());
    else if (c.startsWith("touch ")) {
        let n = cmd.slice(6).trim();
        if (!n.includes(".")) n += ".txt";
        fsCreateFile(n, "");
    }
    else if (c.startsWith("rm ")) fsDelete(cmd.slice(3).trim());
    else if (c.startsWith("write ")) {
        const rest = cmd.slice(6);
        const pipe = rest.indexOf("|");
        if (pipe > 0) {
            let n = rest.slice(0, pipe).trim();
            const content = rest.slice(pipe + 1);
            if (!n.includes(".")) n += ".txt";
            fsCreateFile(n, content);
        }
    }
    else if (c === "ls") { openWindow("filesWindow"); renderFiles(); }
    else if (c.startsWith("cd ")) {
        const name = cmd.slice(3).trim();
        if (name === "/" || name === "") NEXUS.currentPath = [];
        else if (name === "..") NEXUS.currentPath.pop();
        else {
            const dir = getCurrentDir();
            if (dir && dir[name] && dir[name].type === "folder") NEXUS.currentPath.push(name);
        }
        renderFiles();
    }
    saveState();
}

/* ========== WIRTUALNY DYSK — SERIO ========== */
function getCurrentDir() {
    let dir = NEXUS.fs;
    for (let i = 0; i < NEXUS.currentPath.length; i++) {
        const p = NEXUS.currentPath[i];
        if (dir[p] && dir[p].type === "folder") dir = dir[p].children;
        else return null;
    }
    return dir;
}

function fsCreateFile(name, content) {
    const dir = getCurrentDir();
    if (!dir) return false;
    if (dir[name] && dir[name].type === "folder") return false;
    dir[name] = { type: "file", content: content || "" };
    saveState();
    return true;
}

function fsCreateFolder(name) {
    const dir = getCurrentDir();
    if (!dir) return false;
    if (dir[name]) return false;
    dir[name] = { type: "folder", children: {} };
    saveState();
    return true;
}

function fsDelete(name) {
    const dir = getCurrentDir();
    if (!dir || !dir[name]) return false;
    delete dir[name];
    saveState();
    return true;
}

function renderFiles() {
    const grid = document.getElementById("fileGrid");
    const pathEl = document.getElementById("filesPath");
    if (!grid) return;

    const dir = getCurrentDir();
    if (!dir) {
        NEXUS.currentPath = [];
        return renderFiles();
    }

    if (pathEl) pathEl.textContent = "/" + (NEXUS.currentPath.join("/") || "");

    grid.innerHTML = "";

    // przyciski akcji
    const toolbar = document.getElementById("filesToolbar");
    if (toolbar) {
        // już jest w HTML
    }

    if (NEXUS.currentPath.length > 0) {
        const back = document.createElement("div");
        back.className = "file";
        back.innerHTML = `<div class="file-icon">⬅</div><div class="file-name">..</div>`;
        back.onclick = () => { NEXUS.currentPath.pop(); renderFiles(); };
        grid.appendChild(back);
    }

    const names = Object.keys(dir).sort((a, b) => {
        const fa = dir[a].type === "folder" ? 0 : 1;
        const fb = dir[b].type === "folder" ? 0 : 1;
        if (fa !== fb) return fa - fb;
        return a.localeCompare(b);
    });

    if (names.length === 0 && NEXUS.currentPath.length === 0) {
        // ok
    }

    names.forEach(name => {
        const item = dir[name];
        const el = document.createElement("div");
        el.className = "file";
        el.innerHTML = `
            <div class="file-icon">${item.type === "folder" ? "📁" : "📄"}</div>
            <div class="file-name">${escapeHTML(name)}</div>
            <div class="file-actions">
                <button type="button" class="file-del" title="Usuń" onclick="event.stopPropagation(); uiDeleteFile('${escapeHTML(name)}')">✕</button>
            </div>`;
        el.onclick = () => {
            if (item.type === "folder") {
                NEXUS.currentPath.push(name);
                renderFiles();
            } else {
                openFileInNotepad(name, item.content || "");
            }
        };
        grid.appendChild(el);
    });
}

function navigateToRoot() {
    NEXUS.currentPath = [];
    renderFiles();
}

function openFolderFromSidebar(name) {
    NEXUS.currentPath = [name];
    if (!NEXUS.fs[name]) {
        NEXUS.fs[name] = { type: "folder", children: {} };
        saveState();
    }
    renderFiles();
}

function uiNewFile() {
    let name = prompt("Nazwa pliku:", "nowy.txt");
    if (!name) return;
    name = name.trim();
    if (!name.includes(".")) name += ".txt";
    if (fsCreateFile(name, "")) {
        renderFiles();
        showNotification("Pliki", "Utworzono: " + name);
        openFileInNotepad(name, "");
    } else {
        showNotification("Pliki", "Nie można utworzyć (może istnieje)");
    }
}

function uiNewFolder() {
    let name = prompt("Nazwa folderu:", "Nowy folder");
    if (!name) return;
    name = name.trim();
    if (fsCreateFolder(name)) {
        renderFiles();
        showNotification("Pliki", "Utworzono folder: " + name);
    } else {
        showNotification("Pliki", "Folder już istnieje");
    }
}

function uiDeleteFile(name) {
    if (!confirm("Usunąć \"" + name + "\"?")) return;
    if (fsDelete(name)) {
        renderFiles();
        showNotification("Pliki", "Usunięto: " + name);
    }
}

/* ========== NOTATNIK ========== */
function openFileInNotepad(name, content) {
    currentNotepadFile = name;
    currentNotepadPath = NEXUS.currentPath.slice();
    const ta = document.getElementById("notepadContent");
    const fn = document.getElementById("notepadFilename");
    if (ta) ta.value = content || "";
    if (fn) fn.textContent = name;
    openWindow("notepadWindow");
}

function saveNotepad() {
    const ta = document.getElementById("notepadContent");
    if (!ta) return;

    let name = currentNotepadFile;
    if (!name) {
        name = prompt("Nazwa pliku:", "notatka.txt");
        if (!name) return;
        name = name.trim();
        if (!name.includes(".")) name += ".txt";
        currentNotepadFile = name;
        currentNotepadPath = NEXUS.currentPath.slice();
    }

    // zapisz w ścieżce z której otwarto / bieżącej
    const savedPath = currentNotepadPath.slice();
    let dir = NEXUS.fs;
    for (let i = 0; i < savedPath.length; i++) {
        const p = savedPath[i];
        if (!dir[p]) dir[p] = { type: "folder", children: {} };
        dir = dir[p].children;
    }
    dir[name] = { type: "file", content: ta.value };

    const fn = document.getElementById("notepadFilename");
    if (fn) fn.textContent = name;
    saveState();
    showNotification("Notatnik", "Zapisano: " + name);
    renderFiles();
}

function newNotepad() {
    currentNotepadFile = null;
    currentNotepadPath = NEXUS.currentPath.slice();
    const ta = document.getElementById("notepadContent");
    const fn = document.getElementById("notepadFilename");
    if (ta) ta.value = "";
    if (fn) fn.textContent = "bez tytułu";
}

/* ========== PRZEGLĄDARKA ========== */
function handleBrowserKey(e) {
    if (e.key === "Enter") {
        e.preventDefault();
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
        if (address.includes(".") && !address.includes(" ")) address = "https://" + address;
        else address = "https://www.google.com/search?q=" + encodeURIComponent(address);
    }

    content.innerHTML = `<div class="browser-start"><div class="browser-logo">N</div><h1>Ładowanie...</h1><p>${escapeHTML(address)}</p></div>`;
    setTimeout(() => {
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%">
                <div style="padding:8px;background:rgba(0,0,0,0.3);display:flex;gap:8px;align-items:center">
                    <button type="button" onclick="openExternal('${escapeHTML(address)}')" style="padding:6px 12px;border-radius:8px;background:var(--nexus-accent);border:0;color:#fff;cursor:pointer">Otwórz na zewnątrz</button>
                    <span style="font-size:12px;opacity:0.7;overflow:hidden;text-overflow:ellipsis">${escapeHTML(address)}</span>
                </div>
                <iframe src="${escapeHTML(address)}" style="flex:1;width:100%;border:0;background:#fff" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
            </div>`;
    }, 300);
}

function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
    showNotification("Przeglądarka", "Otworzono w nowej karcie");
}
function browserBack() { showNotification("Przeglądarka", "Historia — wkrótce"); }
function browserForward() { showNotification("Przeglądarka", "Historia — wkrótce"); }
function browserReload() {
    const iframe = document.querySelector("#browserContent iframe");
    if (iframe) iframe.src = iframe.src;
    else showNotification("Przeglądarka", "Nic nie załadowane");
}

/* ========== TERMINAL 2.0 ========== */
function handleTerminalKey(e) {
    const input = document.getElementById("terminalInput");
    if (!input) return;

    if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!NEXUS.terminalHistory.length) return;
        if (NEXUS.terminalHistoryIndex < 0) NEXUS.terminalHistoryIndex = NEXUS.terminalHistory.length - 1;
        else if (NEXUS.terminalHistoryIndex > 0) NEXUS.terminalHistoryIndex--;
        input.value = NEXUS.terminalHistory[NEXUS.terminalHistoryIndex] || "";
        return;
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (NEXUS.terminalHistoryIndex < 0) return;
        NEXUS.terminalHistoryIndex++;
        if (NEXUS.terminalHistoryIndex >= NEXUS.terminalHistory.length) {
            NEXUS.terminalHistoryIndex = -1;
            input.value = "";
        } else input.value = NEXUS.terminalHistory[NEXUS.terminalHistoryIndex] || "";
        return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();

    const command = input.value.trim();
    if (!command) return;

    NEXUS.terminalHistory.push(command);
    if (NEXUS.terminalHistory.length > 80) NEXUS.terminalHistory.shift();
    NEXUS.terminalHistoryIndex = -1;

    const output = document.getElementById("terminalOutput");
    const line = document.createElement("div");
    line.innerHTML = `<span style="color:var(--nexus-accent)">nexus@system:${NEXUS.currentPath.length ? "/" + NEXUS.currentPath.join("/") : "~"}$</span> ${escapeHTML(command)}`;
    output.appendChild(line);

    runTerminalCommand(command, output);
    input.value = "";
    output.scrollTop = output.scrollHeight;
    saveState();
}

function runTerminalCommand(command, output) {
    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim();

    const print = (html) => {
        const d = document.createElement("div");
        d.innerHTML = html;
        output.appendChild(d);
    };

    if (cmd === "help") {
        print(`<b>Komendy:</b> help, clear, time, system, neofetch, pwd<br>
ls, cd, cat, mkdir, touch, rm, echo<br>
open [app], write [plik] [treść]`);
    }
    else if (cmd === "clear") { output.innerHTML = ""; return; }
    else if (cmd === "time") {
        print(new Intl.DateTimeFormat("pl-PL", {
            timeZone: "Europe/Warsaw", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).format(new Date()));
    }
    else if (cmd === "system" || cmd === "neofetch") {
        print(`<pre style="margin:0">NEXUS OS ${NEXUS.version}
Platforma: Web Shell
Dysk: wirtualny (localStorage)
AI: lokalne + opcjonalne API
Status: ${NEXUS.systemReady ? "gotowy" : "boot"}</pre>`);
    }
    else if (cmd === "pwd") print("/" + NEXUS.currentPath.join("/"));
    else if (cmd === "ls") {
        const dir = getCurrentDir();
        if (!dir) { print("Błąd ścieżki"); return; }
        const names = Object.keys(dir);
        print(names.length
            ? names.map(n => dir[n].type === "folder" ? n + "/" : n).join("  ")
            : "(pusty)");
    }
    else if (cmd === "cd") {
        if (!arg || arg === "/") { NEXUS.currentPath = []; print("/"); return; }
        if (arg === "..") { NEXUS.currentPath.pop(); print("/" + NEXUS.currentPath.join("/")); return; }
        const dir = getCurrentDir();
        if (dir && dir[arg] && dir[arg].type === "folder") {
            NEXUS.currentPath.push(arg);
            print("/" + NEXUS.currentPath.join("/"));
        } else print("Brak katalogu: " + escapeHTML(arg));
    }
    else if (cmd === "cat") {
        const dir = getCurrentDir();
        if (dir && dir[arg] && dir[arg].type === "file") {
            print("<pre style='margin:0;white-space:pre-wrap'>" + escapeHTML(dir[arg].content || "") + "</pre>");
        } else print("Brak pliku");
    }
    else if (cmd === "mkdir") {
        if (!arg) { print("Podaj nazwę"); return; }
        print(fsCreateFolder(arg) ? "OK: " + escapeHTML(arg) : "Błąd / już istnieje");
        renderFiles();
    }
    else if (cmd === "touch") {
        if (!arg) { print("Podaj nazwę"); return; }
        let n = arg;
        if (!n.includes(".")) n += ".txt";
        print(fsCreateFile(n, "") ? "OK: " + escapeHTML(n) : "Błąd");
        renderFiles();
    }
    else if (cmd === "rm") {
        if (!arg) { print("Podaj nazwę"); return; }
        print(fsDelete(arg) ? "Usunięto: " + escapeHTML(arg) : "Nie znaleziono");
        renderFiles();
    }
    else if (cmd === "echo") print(escapeHTML(arg));
    else if (cmd === "write") {
        const sp = arg.indexOf(" ");
        if (sp < 0) { print("Użycie: write plik.txt treść"); return; }
        let n = arg.slice(0, sp);
        const content = arg.slice(sp + 1);
        if (!n.includes(".")) n += ".txt";
        fsCreateFile(n, content);
        print("Zapisano: " + escapeHTML(n));
        renderFiles();
    }
    else if (cmd === "open") {
        if (arg.includes("plik")) { openWindow("filesWindow"); renderFiles(); }
        else if (/browser|przeglądark|internet/.test(arg)) openWindow("browserWindow");
        else if (arg.includes("ai")) openWindow("aiWindow");
        else if (arg.includes("terminal")) openWindow("terminalWindow");
        else if (arg.includes("notat")) openWindow("notepadWindow");
        else if (arg.includes("ustaw")) openWindow("settingsWindow");
        else print("Nie znaleziono aplikacji");
    }
    else print("Nieznane: " + escapeHTML(cmd) + " — wpisz help");
}

/* ========== USTAWIENIA ========== */
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

function saveApiKey() {
    const input = document.getElementById("apiKeyInput");
    if (!input) return;
    const key = input.value.trim();
    NEXUS.settings.apiKey = key;
    localStorage.setItem("nexus-api-key", key);
    saveState();
    showNotification("AI", key ? "Klucz API zapisany — AI w trybie online" : "Klucz usunięty — tryb lokalny");
}
