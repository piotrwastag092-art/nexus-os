"use strict";

/* =========================================
   NEXUS OS — APPS v0.5  (SERIO DZIAŁA)
   ========================================= */

let aiMemory = JSON.parse(localStorage.getItem("nexus-ai-memory") || "[]");
let currentNotepadFile = null;
let currentNotepadPath = [];

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

/* ========== AI CZAT ========== */
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
        const reply = smartAI(userText);
        appendAIMessage(messages, reply + "<br><br><small style='opacity:0.6'>(API niedostępne — tryb lokalny)</small>");
    }
}

function smartAI(text) {
    const t = text.toLowerCase().trim();

    if (/otw[oó]rz\s+(pliki|folder|eksplorator)/.test(t) || t === "pliki") {
        openWindow("filesWindow");
        renderFiles();
        return "Otworzyłem menedżer 
