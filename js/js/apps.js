"use strict";

/* NEXUS OS — apps.js v0.6.2 COMPLETE */

var aiMemory = [];
try { aiMemory = JSON.parse(localStorage.getItem("nexus-ai-memory") || "[]"); } catch (e) { aiMemory = []; }
var currentNotepadFile = null;
var currentNotepadPath = [];

function setAICommand(text) {
    var input = document.getElementById("aiCommand");
    if (!input) return;
    input.value = text;
    input.focus();
}

function runAICommand() {
    var input = document.getElementById("aiCommand");
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    if (typeof openWindow === "function") openWindow("aiWindow");
    setTimeout(function () {
        var c = document.getElementById("aiChatInput");
        if (c) {
            c.value = text;
            sendAIMessage();
        }
    }, 200);
}

function handleAIKey(event) {
    if (event && event.key === "Enter") {
        event.preventDefault();
        sendAIMessage();
    }
}

function sendAIMessage() {
    var input = document.getElementById("aiChatInput");
    var messages = document.getElementById("aiMessages");
    if (!input || !messages) return;
    var text = input.value.trim();
    if (!text) return;

    aiMemory.push({ role: "user", text: text });
    if (aiMemory.length > 50) aiMemory.shift();
    try { localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory)); } catch (e) {}

    var userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerHTML = '<div class="message-bubble"><strong>Ty</strong><p>' + escapeHTML(text) + "</p></div>";
    messages.appendChild(userMsg);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    var thinking = document.createElement("div");
    thinking.className = "message nexus";
    thinking.id = "thinkingMsg";
    thinking.innerHTML = '<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>Myślę...</p></div>';
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    var cfg = getAIConfig();
    if (cfg.apiKey && cfg.apiKey.length > 8) {
        callRealAI(text, cfg, messages);
    } else {
        setTimeout(function () {
            var el = document.getElementById("thinkingMsg");
            if (el) el.remove();
            var reply = smartAI(text);
            appendAI(messages, reply);
        }, 350);
    }
}

function appendAI(messages, html) {
    var bot = document.createElement("div");
    bot.className = "message nexus";
    bot.innerHTML = '<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>' + html + "</p></div>";
    messages.appendChild(bot);
    messages.scrollTop = messages.scrollHeight;
    aiMemory.push({ role: "ai", text: String(html).replace(/<[^>]+>/g, " ") });
    try { localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory)); } catch (e) {}
}

function getAIConfig() {
    var s = (window.NEXUS && NEXUS.settings) ? NEXUS.settings : {};
    return {
        apiKey: s.apiKey || localStorage.getItem("nexus-api-key") || "",
        provider: s.aiProvider || localStorage.getItem("nexus-ai-provider") || "openai",
        baseUrl: s.aiBaseUrl || localStorage.getItem("nexus-ai-base") || "",
        model: s.aiModel || localStorage.getItem("nexus-ai-model") || "gpt-4o-mini"
    };
}

function getAIEndpoint(cfg) {
    if (cfg.provider === "xai") return "https://api.x.ai/v1/chat/completions";
    if (cfg.provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
    if (cfg.provider === "custom" && cfg.baseUrl) return cfg.baseUrl.replace(/\/$/, "") + "/chat/completions";
    return "https://api.openai.com/v1/chat/completions";
}

function getAIModel(cfg) {
    if (cfg.model) return cfg.model;
    if (cfg.provider === "xai") return "grok-2-latest";
    if (cfg.provider === "openrouter") return "openai/gpt-4o-mini";
    return "gpt-4o-mini";
}

async function callRealAI(userText, cfg, messages) {
    try {
        var headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + cfg.apiKey
        };
        if (cfg.provider === "openrouter") {
            headers["HTTP-Referer"] = location.origin;
            headers["X-Title"] = "NEXUS OS";
        }

        var system = "Jesteś NEXUS AI w systemie NEXUS OS. Odpowiadaj po polsku, konkretnie. " +
            "Gdy użytkownik prosi o akcję systemową, na końcu dodaj jedną linię: [[CMD:...]] " +
            "CMD: open files|terminal|browser|notepad|settings, mkdir X, touch X, rm X, write X|treść, ls, cd X.";

        var msgs = [{ role: "system", content: system }];
        aiMemory.slice(-10).forEach(function (m) {
            msgs.push({ role: m.role === "ai" ? "assistant" : "user", content: m.text });
        });
        msgs.push({ role: "user", content: userText });

        var res = await fetch(getAIEndpoint(cfg), {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ model: getAIModel(cfg), messages: msgs, max_tokens: 600, temperature: 0.7 })
        });

        var el = document.getElementById("thinkingMsg");
        if (el) el.remove();

        if (!res.ok) throw new Error("HTTP " + res.status);
        var data = await res.json();
        var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "Brak odpowiedzi.";

        var cmds = reply.match(/\[\[CMD:([^\]]+)\]\]/g);
        if (cmds) {
            cmds.forEach(function (raw) {
                executeAICommand(raw.replace("[[CMD:", "").replace("]]", "").trim());
            });
            reply = reply.replace(/\[\[CMD:[^\]]+\]\]/g, "").trim();
        }
        appendAI(messages, escapeHTML(reply).replace(/\n/g, "<br>"));
    } catch (err) {
        var el2 = document.getElementById("thinkingMsg");
        if (el2) el2.remove();
        appendAI(messages, smartAI(userText) + "<br><small style='opacity:.6'>(API offline — tryb lokalny)</small>");
    }
}

function smartAI(text) {
    var t = text.toLowerCase().trim();

    if (/otw[oó]rz\s+plik|otw[oó]rz\s+folder|^pliki$/.test(t)) {
        openWindow("filesWindow"); renderFiles();
        return "Otworzyłem pliki.";
    }
    if (/otw[oó]rz\s+terminal|^terminal$/.test(t)) {
        openWindow("terminalWindow");
        return "Terminal gotowy. Wpisz help.";
    }
    if (/otw[oó]rz\s+(przeglądark|internet)/.test(t)) {
        openWindow("browserWindow");
        return "Przeglądarka otwarta.";
    }
    if (/otw[oó]rz\s+notatnik|^notatnik$/.test(t)) {
        openWindow("notepadWindow");
        return "Notatnik gotowy.";
    }
    if (/otw[oó]rz\s+ustawien/.test(t)) {
        openWindow("settingsWindow");
        return "Ustawienia.";
    }

    var m = t.match(/(?:utw[oó]rz|stw[oó]rz|zrób|nowy)\s+plik(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-\.ąćęłńóśźż]+)['"]?/i);
    if (m) {
        var name = m[1];
        if (name.indexOf(".") < 0) name += ".txt";
        if (fsCreateFile(name, "")) {
            openWindow("filesWindow"); renderFiles();
            return "Utworzyłem plik <b>" + escapeHTML(name) + "</b>.";
        }
        return "Nie udało się utworzyć pliku.";
    }

    m = t.match(/(?:utw[oó]rz|stw[oó]rz)\s+folder(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-ąćęłńóśźż]+)['"]?/i);
    if (m) {
        if (fsCreateFolder(m[1])) {
            openWindow("filesWindow"); renderFiles();
            return "Folder <b>" + escapeHTML(m[1]) + "</b> utworzony.";
        }
        return "Nie utworzono folderu.";
    }

    m = t.match(/(?:usu[nń]|skasuj|rm)\s+(?:plik\s+|folder\s+)?['"]?([a-z0-9_\-\.ąćęłńóśźż]+)['"]?/i);
    if (m) {
        if (fsDelete(m[1])) {
            openWindow("filesWindow"); renderFiles();
            return "Usunięto <b>" + escapeHTML(m[1]) + "</b>.";
        }
        return "Nie znaleziono.";
    }

    m = t.match(/(?:zapisz|napisz)\s+(?:do\s+)?(?:pliku\s+)?['"]?([a-z0-9_\-\.]+)['"]?\s*[:\-–]\s*(.+)/i);
    if (m) {
        var n = m[1];
        if (n.indexOf(".") < 0) n += ".txt";
        fsCreateFile(n, m[2]);
        openWindow("filesWindow"); renderFiles();
        return "Zapisano do <b>" + escapeHTML(n) + "</b>.";
    }

    if (/(cześć|hej|siema|witaj)/.test(t)) return "Siema! Mogę otwierać aplikacje, tworzyć/usuwać pliki. Z kluczem API w Ustawieniach działam jak pełne AI.";
    if (/(pomoc|help|co potrafisz)/.test(t)) {
        return "Przykłady:<br>• otwórz pliki / terminal / notatnik<br>• utwórz plik lista.txt<br>• utwórz folder Projekty<br>• usuń lista.txt<br>• zapisz do notes.txt: treść<br><br>W <b>Ustawieniach</b> wklej klucz OpenAI/OpenRouter/xAI — wtedy odpowiadam jak prawdziwe AI.";
    }
    if (/(wersja|system)/.test(t)) return "NEXUS OS <b>" + (NEXUS.version || "0.6") + "</b>";

    return "Bez klucza API działam lokalnie (komendy systemowe). " +
        "Napisz: <b>otwórz pliki</b>, <b>utwórz plik test.txt</b> albo dodaj klucz API w Ustawieniach, żebym odpowiadał inteligentnie na dowolne pytania.";
}

function executeAICommand(cmd) {
    var low = cmd.toLowerCase().trim();
    if (low.indexOf("open ") === 0) {
        var a = low.slice(5);
        if (a.indexOf("file") >= 0) { openWindow("filesWindow"); renderFiles(); }
        else if (a.indexOf("terminal") >= 0) openWindow("terminalWindow");
        else if (a.indexOf("browser") >= 0) openWindow("browserWindow");
        else if (a.indexOf("notepad") >= 0) openWindow("notepadWindow");
        else if (a.indexOf("setting") >= 0) openWindow("settingsWindow");
    } else if (low.indexOf("mkdir ") === 0) fsCreateFolder(cmd.slice(6).trim());
    else if (low.indexOf("touch ") === 0) {
        var n = cmd.slice(6).trim();
        if (n.indexOf(".") < 0) n += ".txt";
        fsCreateFile(n, "");
    } else if (low.indexOf("rm ") === 0) fsDelete(cmd.slice(3).trim());
    else if (low.indexOf("write ") === 0) {
        var rest = cmd.slice(6);
        var p = rest.indexOf("|");
        if (p > 0) {
            var fn = rest.slice(0, p).trim();
            if (fn.indexOf(".") < 0) fn += ".txt";
            fsCreateFile(fn, rest.slice(p + 1));
        }
    } else if (low === "ls") { openWindow("filesWindow"); renderFiles(); }
    if (typeof saveState === "function") saveState();
}

/* ===== FS ===== */
function getCurrentDir() {
    if (!NEXUS || !NEXUS.fs) return null;
    var dir = NEXUS.fs;
    var path = NEXUS.currentPath || [];
    for (var i = 0; i < path.length; i++) {
        if (dir[path[i]] && dir[path[i]].type === "folder") dir = dir[path[i]].children;
        else return null;
    }
    return dir;
}

function fsCreateFile(name, content) {
    var dir = getCurrentDir();
    if (!dir) return false;
    if (dir[name] && dir[name].type === "folder") return false;
    dir[name] = { type: "file", content: content || "" };
    if (typeof saveState === "function") saveState();
    return true;
}

function fsCreateFolder(name) {
    var dir = getCurrentDir();
    if (!dir || dir[name]) return false;
    dir[name] = { type: "folder", children: {} };
    if (typeof saveState === "function") saveState();
    return true;
}

function fsDelete(name) {
    var dir = getCurrentDir();
    if (!dir || !dir[name]) return false;
    delete dir[name];
    if (typeof saveState === "function") saveState();
    return true;
}

function renderFiles() {
    var grid = document.getElementById("fileGrid");
    var pathEl = document.getElementById("filesPath");
    if (!grid) return;
    var dir = getCurrentDir();
    if (!dir) {
        NEXUS.currentPath = [];
        dir = getCurrentDir();
    }
    if (!dir) return;
    if (pathEl) pathEl.textContent = "/" + ((NEXUS.currentPath || []).join("/") || "");
    grid.innerHTML = "";

    if (NEXUS.currentPath && NEXUS.currentPath.length > 0) {
        var back = document.createElement("div");
        back.className = "file";
        back.innerHTML = '<div class="file-icon">⬅</div><div class="file-name">..</div>';
        back.onclick = function () { NEXUS.currentPath.pop(); renderFiles(); };
        grid.appendChild(back);
    }

    Object.keys(dir).sort(function (a, b) {
        var fa = dir[a].type === "folder" ? 0 : 1;
        var fb = dir[b].type === "folder" ? 0 : 1;
        return fa !== fb ? fa - fb : a.localeCompare(b);
    }).forEach(function (name) {
        var item = dir[name];
        var el = document.createElement("div");
        el.className = "file";
        var safe = escapeHTML(name).replace(/'/g, "&#39;");
        el.innerHTML = '<div class="file-icon">' + (item.type === "folder" ? "📁" : "📄") + "</div>" +
            '<div class="file-name">' + escapeHTML(name) + "</div>" +
            '<div class="file-actions"><button type="button" class="file-del" onclick="event.stopPropagation();uiDeleteFile(\'' + safe + "')\">✕</button></div>";
        el.onclick = function () {
            if (item.type === "folder") {
                NEXUS.currentPath.push(name);
                renderFiles();
            } else openFileInNotepad(name, item.content || "");
        };
        grid.appendChild(el);
    });
}

function navigateToRoot() { NEXUS.currentPath = []; renderFiles(); }

function openFolderFromSidebar(name) {
    NEXUS.currentPath = [name];
    if (!NEXUS.fs[name]) NEXUS.fs[name] = { type: "folder", children: {} };
    if (typeof saveState === "function") saveState();
    renderFiles();
}

function uiNewFile() {
    var name = prompt("Nazwa pliku:", "nowy.txt");
    if (!name) return;
    name = name.trim();
    if (name.indexOf(".") < 0) name += ".txt";
    if (fsCreateFile(name, "")) {
        renderFiles();
        showNotification("Pliki", "Utworzono: " + name);
        openFileInNotepad(name, "");
    }
}

function uiNewFolder() {
    var name = prompt("Nazwa folderu:", "Nowy folder");
    if (!name) return;
    if (fsCreateFolder(name.trim())) {
        renderFiles();
        showNotification("Pliki", "Folder: " + name);
    }
}

function uiDeleteFile(name) {
    if (!confirm('Usunąć "' + name + '"?')) return;
    if (fsDelete(name)) {
        renderFiles();
        showNotification("Pliki", "Usunięto: " + name);
    }
}

function openFileInNotepad(name, content) {
    currentNotepadFile = name;
    currentNotepadPath = (NEXUS.currentPath || []).slice();
    var ta = document.getElementById("notepadContent");
    var fn = document.getElementById("notepadFilename");
    if (ta) ta.value = content || "";
    if (fn) fn.textContent = name;
    openWindow("notepadWindow");
}

function saveNotepad() {
    var ta = document.getElementById("notepadContent");
    if (!ta) return;
    var name = currentNotepadFile;
    if (!name) {
        name = prompt("Nazwa pliku:", "notatka.txt");
        if (!name) return;
        name = name.trim();
        if (name.indexOf(".") < 0) name += ".txt";
        currentNotepadFile = name;
        currentNotepadPath = (NEXUS.currentPath || []).slice();
    }
    var dir = NEXUS.fs;
    var path = currentNotepadPath || [];
    for (var i = 0; i < path.length; i++) {
        if (!dir[path[i]]) dir[path[i]] = { type: "folder", children: {} };
        dir = dir[path[i]].children;
    }
    dir[name] = { type: "file", content: ta.value };
    var fn = document.getElementById("notepadFilename");
    if (fn) fn.textContent = name;
    if (typeof saveState === "function") saveState();
    showNotification("Notatnik", "Zapisano: " + name);
    renderFiles();
}

function newNotepad() {
    currentNotepadFile = null;
    currentNotepadPath = (NEXUS.currentPath || []).slice();
    var ta = document.getElementById("notepadContent");
    var fn = document.getElementById("notepadFilename");
    if (ta) ta.value = "";
    if (fn) fn.textContent = "bez tytułu";
}

/* ===== BROWSER ===== */
function handleBrowserKey(event) {
    if (event && event.key === "Enter") {
        event.preventDefault();
        navigateBrowser();
    }
}

function navigateBrowser() {
    var input = document.getElementById("browserAddress");
    var content = document.getElementById("browserContent");
    if (!input || !content) return;
    var address = input.value.trim();
    if (!address) return;
    if (address.indexOf("http://") !== 0 && address.indexOf("https://") !== 0) {
        if (address.indexOf(".") >= 0 && address.indexOf(" ") < 0) address = "https://" + address;
        else address = "https://www.google.com/search?q=" + encodeURIComponent(address);
    }
    content.innerHTML = '<div class="browser-start"><div class="browser-logo">N</div><h1>Ładowanie...</h1><p>' + escapeHTML(address) + "</p></div>";
    setTimeout(function () {
        content.innerHTML =
            '<div style="display:flex;flex-direction:column;height:100%">' +
            '<div style="padding:8px;background:rgba(0,0,0,.3);display:flex;gap:8px;align-items:center">' +
            '<button type="button" onclick="openExternal(\'' + escapeHTML(address) + '\')" style="padding:6px 12px;border-radius:8px;background:var(--nexus-accent);border:0;color:#fff;cursor:pointer">Otwórz na zewnątrz</button>' +
            '<span style="font-size:12px;opacity:.7">' + escapeHTML(address) + "</span></div>" +
            '<iframe src="' + escapeHTML(address) + '" style="flex:1;width:100%;border:0;background:#fff" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe></div>';
    }, 250);
}

function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
    showNotification("Przeglądarka", "Nowa karta");
}
function browserBack() { showNotification("Przeglądarka", "Wstecz — wkrótce"); }
function browserForward() { showNotification("Przeglądarka", "Dalej — wkrótce"); }
function browserReload() {
    var iframe = document.querySelector("#browserContent iframe");
    if (iframe) iframe.src = iframe.src;
}

/* ===== TERMINAL ===== */
function handleTerminalKey(event) {
    var input = document.getElementById("terminalInput");
    if (!input || !event) return;

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!NEXUS.terminalHistory || !NEXUS.terminalHistory.length) return;
        if (NEXUS.terminalHistoryIndex < 0) NEXUS.terminalHistoryIndex = NEXUS.terminalHistory.length - 1;
        else if (NEXUS.terminalHistoryIndex > 0) NEXUS.terminalHistoryIndex--;
        input.value = NEXUS.terminalHistory[NEXUS.terminalHistoryIndex] || "";
        return;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (NEXUS.terminalHistoryIndex < 0) return;
        NEXUS.terminalHistoryIndex++;
        if (NEXUS.terminalHistoryIndex >= NEXUS.terminalHistory.length) {
            NEXUS.terminalHistoryIndex = -1;
            input.value = "";
        } else input.value = NEXUS.terminalHistory[NEXUS.terminalHistoryIndex] || "";
        return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();

    var command = input.value.trim();
    if (!command) return;
    if (!NEXUS.terminalHistory) NEXUS.terminalHistory = [];
    NEXUS.terminalHistory.push(command);
    if (NEXUS.terminalHistory.length > 80) NEXUS.terminalHistory.shift();
    NEXUS.terminalHistoryIndex = -1;

    var output = document.getElementById("terminalOutput");
    if (!output) return;
    var pathStr = (NEXUS.currentPath && NEXUS.currentPath.length) ? "/" + NEXUS.currentPath.join("/") : "~";
    var line = document.createElement("div");
    line.innerHTML = '<span style="color:var(--nexus-accent)">nexus@system:' + pathStr + "$</span> " + escapeHTML(command);
    output.appendChild(line);
    runTerminalCommand(command, output);
    input.value = "";
    output.scrollTop = output.scrollHeight;
    if (typeof saveState === "function") saveState();
}

function runTerminalCommand(command, output) {
    var parts = command.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ").trim();
    function print(html) {
        var d = document.createElement("div");
        d.innerHTML = html;
        output.appendChild(d);
    }

    if (cmd === "help") print("help clear time system pwd ls cd cat mkdir touch rm echo write open");
    else if (cmd === "clear") output.innerHTML = "";
    else if (cmd === "time") print(new Date().toLocaleTimeString("pl-PL"));
    else if (cmd === "system" || cmd === "neofetch") print("NEXUS OS " + (NEXUS.version || ""));
    else if (cmd === "pwd") print("/" + ((NEXUS.currentPath || []).join("/")));
    else if (cmd === "ls") {
        var dir = getCurrentDir();
        if (!dir) return print("Błąd");
        var names = Object.keys(dir);
        print(names.length ? names.map(function (n) { return dir[n].type === "folder" ? n + "/" : n; }).join("  ") : "(pusty)");
    }
    else if (cmd === "cd") {
        if (!arg || arg === "/") { NEXUS.currentPath = []; print("/"); return; }
        if (arg === "..") { NEXUS.currentPath.pop(); print("/" + NEXUS.currentPath.join("/")); return; }
        var d = getCurrentDir();
        if (d && d[arg] && d[arg].type === "folder") {
            NEXUS.currentPath.push(arg);
            print("/" + NEXUS.currentPath.join("/"));
        } else print("Brak katalogu");
    }
    else if (cmd === "cat") {
        var d2 = getCurrentDir();
        if (d2 && d2[arg] && d2[arg].type === "file") print("<pre style='margin:0;white-space:pre-wrap'>" + escapeHTML(d2[arg].content || "") + "</pre>");
        else print("Brak pliku");
    }
    else if (cmd === "mkdir") { print(arg && fsCreateFolder(arg) ? "OK" : "Błąd"); renderFiles(); }
    else if (cmd === "touch") {
        var tn = arg;
        if (tn && tn.indexOf(".") < 0) tn += ".txt";
        print(tn && fsCreateFile(tn, "") ? "OK" : "Błąd");
        renderFiles();
    }
    else if (cmd === "rm") { print(arg && fsDelete(arg) ? "Usunięto" : "Brak"); renderFiles(); }
    else if (cmd === "echo") print(escapeHTML(arg));
    else if (cmd === "write") {
        var sp = arg.indexOf(" ");
        if (sp < 0) return print("write plik.txt treść");
        var wn = arg.slice(0, sp);
        var wc = arg.slice(sp + 1);
        if (wn.indexOf(".") < 0) wn += ".txt";
        fsCreateFile(wn, wc);
        print("Zapisano");
        renderFiles();
    }
    else if (cmd === "open") {
        if (arg.indexOf("plik") >= 0) { openWindow("filesWindow"); renderFiles(); }
        else if (/browser|przeglądark|internet/.test(arg)) openWindow("browserWindow");
        else if (arg.indexOf("ai") >= 0) openWindow("aiWindow");
        else if (arg.indexOf("terminal") >= 0) openWindow("terminalWindow");
        else if (arg.indexOf("notat") >= 0) openWindow("notepadWindow");
        else if (arg.indexOf("ustaw") >= 0) openWindow("settingsWindow");
        else print("Nie znaleziono");
    }
    else print("Nieznane — help");
}

/* ===== SETTINGS ===== */
function changeAccent(color) {
    if (!NEXUS.settings) return;
    NEXUS.settings.accent = color;
    if (typeof applySettings === "function") applySettings();
    if (typeof saveState === "function") saveState();
    showNotification("Ustawienia", "Akcent OK");
}

function changeAccent2(color) {
    if (!NEXUS.settings) return;
    NEXUS.settings.accent2 = color;
    if (typeof applySettings === "function") applySettings();
    if (typeof saveState === "function") saveState();
    showNotification("Ustawienia", "Drugi akcent OK");
}

function saveApiKey() {
    var keyEl = document.getElementById("apiKeyInput");
    var provEl = document.getElementById("aiProvider");
    var modelEl = document.getElementById("aiModel");
    var baseEl = document.getElementById("aiBaseUrl");
    var key = keyEl ? keyEl.value.trim() : "";
    var provider = provEl ? provEl.value : "openai";
    var model = modelEl ? modelEl.value.trim() : "";
    var base = baseEl ? baseEl.value.trim() : "";
    if (!NEXUS.settings) NEXUS.settings = {};
    NEXUS.settings.apiKey = key;
    NEXUS.settings.aiProvider = provider;
    NEXUS.settings.aiModel = model;
    NEXUS.settings.aiBaseUrl = base;
    localStorage.setItem("nexus-api-key", key);
    localStorage.setItem("nexus-ai-provider", provider);
    localStorage.setItem("nexus-ai-model", model);
    localStorage.setItem("nexus-ai-base", base);
    if (typeof saveState === "function") saveState();
    showNotification("AI", key ? ("Online: " + provider) : "Tryb lokalny");
}

document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("aiCommand");
    if (input) {
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                runAICommand();
            }
        });
    }
});

// === END APPS.JS ===
