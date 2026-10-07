"use strict";

/* =========================================
   NEXUS OS — APPS v0.6
   Real AI + Internet + FS + Ewolucja lokalna
   ========================================= */

let aiMemory = JSON.parse(localStorage.getItem("nexus-ai-memory") || "[]");
let aiKnowledge = JSON.parse(localStorage.getItem("nexus-ai-knowledge") || "[]");
let currentNotepadFile = null;
let currentNotepadPath = [];

function getAIConfig() {
    const s = NEXUS.settings || {};
    return {
        apiKey: s.apiKey || localStorage.getItem("nexus-api-key") || "",
        provider: s.aiProvider || localStorage.getItem("nexus-ai-provider") || "openai",
        // openai | openrouter | xai | custom
        baseUrl: s.aiBaseUrl || localStorage.getItem("nexus-ai-base") || "",
        model: s.aiModel || localStorage.getItem("nexus-ai-model") || "gpt-4o-mini"
    };
}

function resolveAIEndpoint(cfg) {
    if (cfg.provider === "xai") return "https://api.x.ai/v1/chat/completions";
    if (cfg.provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
    if (cfg.provider === "custom" && cfg.baseUrl) return cfg.baseUrl.replace(/\/$/, "") + "/chat/completions";
    return "https://api.openai.com/v1/chat/completions";
}

function resolveModel(cfg) {
    if (cfg.model) return cfg.model;
    if (cfg.provider === "xai") return "grok-2-latest";
    if (cfg.provider === "openrouter") return "openai/gpt-4o-mini";
    return "gpt-4o-mini";
}

/* ========== AI PULPIT ========== */
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
    }, 160);
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
    // wczytaj pola AI w ustawieniach jeśli są
    setTimeout(loadAISettingsUI, 500);
});

function loadAISettingsUI() {
    const cfg = getAIConfig();
    const key = document.getElementById("apiKeyInput");
    const prov = document.getElementById("aiProvider");
    const model = document.getElementById("aiModel");
    const base = document.getElementById("aiBaseUrl");
    if (key && cfg.apiKey) key.value = cfg.apiKey;
    if (prov) prov.value = cfg.provider;
    if (model && cfg.model) model.value = cfg.model;
    if (base && cfg.baseUrl) base.value = cfg.baseUrl;
}

/* ========== CZAT ========== */
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
    if (aiMemory.length > 80) aiMemory.shift();
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
    thinking.innerHTML = `<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>Łączę z siecią / myślę...</p></div>`;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    processAI(text, messages);
}

function appendAIMessage(messages, replyHtml) {
    const bot = document.createElement("div");
    bot.className = "message nexus";
    bot.innerHTML = `<div class="message-avatar">N</div><div class="message-bubble"><strong>NEXUS AI</strong><p>${replyHtml}</p></div>`;
    messages.appendChild(bot);
    messages.scrollTop = messages.scrollHeight;
    aiMemory.push({ role: "ai", text: replyHtml.replace(/<[^>]+>/g, " "), time: Date.now() });
    localStorage.setItem("nexus-ai-memory", JSON.stringify(aiMemory));
}

async function processAI(userText, messages) {
    const cfg = getAIConfig();

    // 1) najpierw lokalne komendy systemowe (zawsze działają)
    const local = tryLocalSystemCommands(userText);
    if (local.handled && !cfg.apiKey) {
        const el = document.getElementById("thinkingMsg");
        if (el) el.remove();
        appendAIMessage(messages, local.reply);
        return;
    }

    // 2) jeśli jest klucz → prawdziwe AI + narzędzia internetowe
    if (cfg.apiKey && cfg.apiKey.length > 8) {
        try {
            // wzbogacenie kontekstem z netu jeśli wygląda na pytanie o świat
            let netContext = "";
            if (shouldSearchWeb(userText)) {
                netContext = await webSearch(userText);
            }
            const urlMatch = userText.match(/https?:\/\/[^\s]+/i);
            if (urlMatch) {
                const page = await fetchPageText(urlMatch[0]);
                if (page) netContext += "\n\nTREŚĆ STRONY:\n" + page.slice(0, 4000);
            }

            const reply = await callRealAI(userText, cfg, netContext);
            const el = document.getElementById("thinkingMsg");
            if (el) el.remove();
            appendAIMessage(messages, reply);
            return;
        } catch (err) {
            console.warn(err);
            const el = document.getElementById("thinkingMsg");
            if (el) el.remove();
            const fallback = local.handled ? local.reply : smartAI(userText);
            appendAIMessage(messages, fallback + "<br><br><small style='opacity:.65'>API błąd — tryb lokalny. (" + escapeHTML(String(err.message || err)) + ")</small>");
            return;
        }
    }

    // 3) bez klucza — lokalny smart + próba lekkiego netu (DDG)
    try {
        let extra = "";
        if (shouldSearchWeb(userText)) {
            extra = await webSearch(userText);
        }
        const el = document.getElementById("thinkingMsg");
        if (el) el.remove();
        let reply = local.handled ? local.reply : smartAI(userText);
        if (extra) {
            reply += "<br><br><b>Z sieci (skrót):</b><br>" + escapeHTML(extra).slice(0, 1200).replace(/\n/g, "<br>");
            learnFromText(userText, extra);
        }
        appendAIMessage(messages, reply);
    } catch (e) {
        const el = document.getElementById("thinkingMsg");
        if (el) el.remove();
        appendAIMessage(messages, local.handled ? local.reply : smartAI(userText));
    }
}

function shouldSearchWeb(text) {
    const t = text.toLowerCase();
    if (/utwórz|usuń|otwórz|mkdir|touch|plik|folder|terminal|notatnik/.test(t) && !/co to|kim jest|pogoda|news|wiadomości|kiedy|dlaczego|how|what|who/.test(t)) {
        return false;
    }
    return /co to|kim jest|pogoda|news|wiadomości|aktualn|kiedy|dlaczego|ile|where|what|who|http|www\.|szukaj|search|opowiedz o/.test(t);
}

/* ========== INTERNET ========== */
async function webSearch(query) {
    // DuckDuckGo Instant Answer (bez klucza, CORS OK)
    try {
        const url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(query) + "&format=json&no_html=1&skip_disambig=1";
        const res = await fetch(url);
        if (!res.ok) throw new Error("DDG " + res.status);
        const data = await res.json();
        const parts = [];
        if (data.AbstractText) parts.push(data.AbstractText);
        if (data.Heading) parts.push("Temat: " + data.Heading);
        if (data.RelatedTopics && data.RelatedTopics.length) {
            data.RelatedTopics.slice(0, 5).forEach(t => {
                if (t.Text) parts.push("• " + t.Text);
                else if (t.Topics) t.Topics.slice(0, 2).forEach(x => { if (x.Text) parts.push("• " + x.Text); });
            });
        }
        if (data.Answer) parts.push(data.Answer);
        const out = parts.join("\n").trim();
        return out || "Brak skróconej odpowiedzi z DDG — spróbuj z kluczem API (lepsze wyszukiwanie przez model).";
    } catch (e) {
        return "";
    }
}

async function fetchPageText(pageUrl) {
    // publiczny proxy CORS — może być niestabilny, ale działa bez backendu
    try {
        const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(pageUrl);
        const res = await fetch(proxy);
        if (!res.ok) return "";
        let text = await res.text();
        text = text.replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return text.slice(0, 6000);
    } catch (e) {
        return "";
    }
}

function learnFromText(topic, content) {
    if (!content || content.length < 40) return;
    aiKnowledge.push({
        topic: String(topic).slice(0, 120),
        content: String(content).slice(0, 1500),
        time: Date.now()
    });
    if (aiKnowledge.length > 40) aiKnowledge = aiKnowledge.slice(-40);
    localStorage.setItem("nexus-ai-knowledge", JSON.stringify(aiKnowledge));
}

/* ========== PRAWDZIWE AI ========== */
async function callRealAI(userText, cfg, netContext) {
    const endpoint = resolveAIEndpoint(cfg);
    const model = resolveModel(cfg);

    const knowledgeBlock = aiKnowledge.slice(-8).map(k =>
        `- ${k.topic}: ${k.content.slice(0, 300)}`
    ).join("\n");

    const systemPrompt = `Jesteś NEXUS AI — rdzeniem systemu NEXUS OS (webowy OS w przeglądarce).
Masz dostęp do narzędzi systemowych. Gdy wykonujesz akcję, dodaj na końcu linie:
[[CMD:polecenie]]

Dostępne CMD:
[[CMD:open files|terminal|browser|notepad|settings|ai]]
[[CMD:mkdir NAZWA]]
[[CMD:touch NAZWA]]
[[CMD:rm NAZWA]]
[[CMD:write NAZWA|TREŚĆ]]
[[CMD:ls]]
[[CMD:cd NAZWA]]
[[CMD:evolve KLUCZ=WARTOŚĆ]]  (np. accent=#ff00aa)

Zasady:
- Odpowiadaj po polsku, konkretnie.
- Używaj kontekstu z internetu jeśli podany.
- Możesz proponować rozwój systemu; ewolucja lokalna przez [[CMD:evolve ...]].
- Nie udawaj że masz dostęp root do GitHub użytkownika bez tokena.

WIEDZA LOKALNA (z poprzednich sesji):
${knowledgeBlock || "(pusto)"}

KONTEKST Z INTERNETU:
${netContext || "(brak)"}
`;

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cfg.apiKey
    };
    if (cfg.provider === "openrouter") {
        headers["HTTP-Referer"] = location.origin;
        headers["X-Title"] = "NEXUS OS";
    }

    const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                ...aiMemory.slice(-12).map(m => ({
                    role: m.role === "ai" ? "assistant" : "user",
                    content: m.text
                })),
                { role: "user", content: userText }
            ],
            temperature: 0.7,
            max_tokens: 700
        })
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error("HTTP " + res.status + " " + t.slice(0, 120));
    }

    const data = await res.json();
    let reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "Brak odpowiedzi.";

    const cmdMatch = reply.match(/\[\[CMD:([^\]]+)\]\]/g);
    if (cmdMatch) {
        cmdMatch.forEach(raw => {
            const inner = raw.replace("[[CMD:", "").replace("]]", "").trim();
            executeAICommand(inner);
        });
        reply = reply.replace(/\[\[CMD:[^\]]+\]\]/g, "").trim();
    }

    learnFromText(userText, reply);
    return escapeHTML(reply).replace(/\n/g, "<br>");
}

/* ========== LOKALNE KOMENDY ========== */
function tryLocalSystemCommands(text) {
    const t = text.toLowerCase().trim();
    if (/otw[oó]rz\s+(pliki|folder)/.test(t) || t === "pliki") {
        openWindow("filesWindow"); renderFiles();
        return { handled: true, reply: "Otworzyłem pliki." };
    }
    if (/otw[oó]rz\s+terminal/.test(t)) {
        openWindow("terminalWindow");
        return { handled: true, reply: "Terminal gotowy." };
    }
    if (/otw[oó]rz\s+(przeglądark|internet)/.test(t)) {
        openWindow("browserWindow");
        return { handled: true, reply: "Przeglądarka otwarta." };
    }
    if (/otw[oó]rz\s+notatnik/.test(t)) {
        openWindow("notepadWindow");
        return { handled: true, reply: "Notatnik gotowy." };
    }
    if (/otw[oó]rz\s+ustawien/.test(t)) {
        openWindow("settingsWindow");
        return { handled: true, reply: "Ustawienia." };
    }

    let m = t.match(/(?:utw[oó]rz|stw[oó]rz|zrób|nowy)\s+plik(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-\.ąćęłńóśźż]+)['"]?/i);
    if (m) {
        let name = m[1];
        if (!name.includes(".")) name += ".txt";
        if (fsCreateFile(name, "")) {
            openWindow("filesWindow"); renderFiles();
            return { handled: true, reply: "Utworzyłem plik <b>" + escapeHTML(name) + "</b>." };
        }
        return { handled: true, reply: "Nie utworzono pliku." };
    }

    m = t.match(/(?:utw[oó]rz|stw[oó]rz)\s+folder(?:\s+o nazwie)?\s+['"]?([a-z0-9_\-ąćęłńóśźż]+)['"]?/i);
    if (m) {
        if (fsCreateFolder(m[1])) {
            openWindow("filesWindow"); renderFiles();
            return { handled: true, reply: "Folder <b>" + escapeHTML(m[1]) + "</b> utworzony." };
        }
        return { handled: true, reply: "Nie utworzono folderu." };
    }

    m = t.match(/(?:usu[nń]|skasuj|rm)\s+(?:plik\s+|folder\s+)?['"]?([a-z0-9_\-\.ąćęłńóśźż]+)['"]?/i);
    if (m) {
        if (fsDelete(m[1])) {
            openWindow("filesWindow"); renderFiles();
            return { handled: true, reply: "Usunięto <b>" + escapeHTML(m[1]) + "</b>." };
        }
        return { handled: true, reply: "Nie znaleziono." };
    }

    m = t.match(/(?:zapisz|napisz)\s+(?:do\s+)?(?:pliku\s+)?['"]?([a-z0-9_\-\.]+)['"]?\s*[:\-–]\s*(.+)/i);
    if (m) {
        let name = m[1];
        if (!name.includes(".")) name += ".txt";
        fsCreateFile(name, m[2]);
        openWindow("filesWindow"); renderFiles();
        return { handled: true, reply: "Zapisano do <b>" + escapeHTML(name) + "</b>." };
    }

    return { handled: false, reply: "" };
}

function smartAI(text) {
    const t = text.toLowerCase().trim();
    if (/(cześć|hej|siema)/.test(t)) return "Siema. Bez klucza API działam lokalnie + lekkie wyszukiwanie. Wklej klucz w Ustawieniach (OpenAI / OpenRouter / xAI) żeby było jak prawdziwe AI.";
    if (/(pomoc|help|co potrafisz)/.test(t)) {
        return "Steruję systemem: pliki, foldery, terminal, notatnik.<br>Szukam w sieci (DDG).<br>Z kluczem API myślę jak pełne LLM i wykonuję komendy [[CMD]].<br>Przykład: „utwórz plik plan.txt” albo „co to jest WebAssembly?”";
    }
    if (/(wersja|system)/.test(t)) return "NEXUS OS <b>" + NEXUS.version + "</b> — lokalny dysk + AI + net.";
    if (/(uczysz|ewolu|rozwij)/.test(t)) {
        return "Zapisuję wiedzę lokalnie (localStorage) i używam jej w kolejnych rozmowach. Żeby realnie „myśleć jak duże AI”, potrzebny jest klucz API. Samodzielnego pusha na GitHub nie zrobię bez Twojego tokena.";
    }
    const local = tryLocalSystemCommands(text);
    if (local.handled) return local.reply;
    return "Napisz konkretnie co zrobić w systemie albo włącz AI online w ustawieniach. Mogę też szukać w internecie — zapytaj „co to jest X”.";
}

function executeAICommand(cmd) {
    const c = cmd.trim();
    const low = c.toLowerCase();
    if (low.startsWith("open ")) {
        const app = low.slice(5).trim();
        if (app.includes("file")) { openWindow("filesWindow"); renderFiles(); }
        else if (app.includes("terminal")) openWindow("terminalWindow");
        else if (app.includes("browser")) openWindow("browserWindow");
        else if (app.includes("notepad")) openWindow("notepadWindow");
        else if (app.includes("setting")) openWindow("settingsWindow");
        else if (app.includes("ai")) openWindow("aiWindow");
    } else if (low.startsWith("mkdir ")) fsCreateFolder(c.slice(6).trim());
    else if (low.startsWith("touch ")) {
        let n = c.slice(6).trim();
        if (!n.includes(".")) n += ".txt";
        fsCreateFile(n, "");
    } else if (low.startsWith("rm ")) fsDelete(c.slice(3).trim());
    else if (low.startsWith("write ")) {
        const rest = c.slice(6);
        const pipe = rest.indexOf("|");
        if (pipe > 0) {
            let n = rest.slice(0, pipe).trim();
            const content = rest.slice(pipe + 1);
            if (!n.includes(".")) n += ".txt";
            fsCreateFile(n, content);
        }
    } else if (low === "ls") { openWindow("filesWindow"); renderFiles(); }
    else if (low.startsWith("cd ")) {
        const name = c.slice(3).trim();
        if (name === "/" || name === "") NEXUS.currentPath = [];
        else if (name === "..") NEXUS.currentPath.pop();
        else {
            const dir = getCurrentDir();
            if (dir && dir[name] && dir[name].type === "folder") NEXUS.currentPath.push(name);
        }
        renderFiles();
    } else if (low.startsWith("evolve ")) {
        // lokalna ewolucja ustawień
        const body = c.slice(7).trim();
        const eq = body.indexOf("=");
        if (eq > 0) {
            const key = body.slice(0, eq).trim();
            const val = body.slice(eq + 1).trim();
            if (key === "accent") { NEXUS.settings.accent = val; applySettings(); }
            if (key === "accent2") { NEXUS.settings.accent2 = val; applySettings(); }
            if (key === "model") { NEXUS.settings.aiModel = val; localStorage.setItem("nexus-ai-model", val); }
            showNotification("Ewolucja", key + " → " + val);
        }
    }
    if (typeof saveState === "function") saveState();
}

/* ========== FS ========== */
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
    if (typeof saveState === "function") saveState();
    return true;
}
function fsCreateFolder(name) {
    const dir = getCurrentDir();
    if (!dir || dir[name]) return false;
    dir[name] = { type: "folder", children: {} };
    if (typeof saveState === "function") saveState();
    return true;
}
function fsDelete(name) {
    const dir = getCurrentDir();
    if (!dir || !dir[name]) return false;
    delete dir[name];
    if (typeof saveState === "function") saveState();
    return true;
}

function renderFiles() {
    const grid = document.getElementById("fileGrid");
    const pathEl = document.getElementById("filesPath");
    if (!grid) return;
    let dir = getCurrentDir();
    if (!dir) { NEXUS.currentPath = []; dir = getCurrentDir(); }
    if (pathEl) pathEl.textContent = "/" + (NEXUS.currentPath.join("/") || "");
    grid.innerHTML = "";

    if (NEXUS.currentPath.length > 0) {
        const back = document.createElement("div");
        back.className = "file";
        back.innerHTML = '<div class="file-icon">⬅</div><div class="file-name">..</div>';
        back.onclick = () => { NEXUS.currentPath.pop(); renderFiles(); };
        grid.appendChild(back);
    }

    Object.keys(dir).sort((a, b) => {
