"use strict";

/* =========================================
   NEXUS OS — RDZEŃ v0.4  (FULL POWER)
   ========================================= */

window.NEXUS = {
    name: "NEXUS OS",
    version: "0.4",
    activeWindow: null,
    highestZIndex: 100,
    maximizedWindows: {},
    systemReady: false,
    settings: {
        accent: "#7c5cff",
        accent2: "#00d9ff",
        wallpaper: "default"
    },
    // wirtualny dysk
    fs: {
        "Dokumenty": { type: "folder", children: {
            "Witaj.txt": { type: "file", content: "Witaj w NEXUS OS!\nTo Twój wirtualny dysk.\nMożesz tworzyć i edytować pliki." }
        }},
        "Obrazy": { type: "folder", children: {} },
        "Muzyka": { type: "folder", children: {} },
        "Wideo": { type: "folder", children: {} },
        "Pobrane": { type: "folder", children: {} }
    },
    currentPath: [],
    terminalHistory: [],
    terminalHistoryIndex: -1
};


function updateClock() {
    const clock = document.getElementById("systemTime");
    if (!clock) return;
    const now = new Date();
    const h = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", hour: "2-digit", hour12: false }).format(now);
    const m = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", minute: "2-digit", hour: "2-digit", hour12: false }).format(now);
    clock.textContent = `${h}:${m.split(":").pop()}`;
}


function setSystemStatus(status) {
    const el = document.getElementById("systemStatus");
    if (!el) return;
    if (status === "booting") el.innerHTML = '<span class="status-dot"></span> URUCHAMIANIE';
    if (status === "online")  el.innerHTML = '<span class="status-dot"></span> SYSTEM GOTOWY';
    if (status === "offline") el.innerHTML = '<span class="status-dot"></span> OFFLINE';
}


function showNotification(title, message) {
    const container = document.getElementById("notifications");
    if (!container) return;
    const n = document.createElement("div");
    n.className = "notification";
    n.innerHTML = `<strong>${escapeHTML(title)}</strong><span>${escapeHTML(message)}</span>`;
    container.appendChild(n);
    setTimeout(() => n.remove(), 4200);
}


function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ===== STAN ===== */
function saveState() {
    const state = {
        maximized: NEXUS.maximizedWindows,
        settings: NEXUS.settings,
        fs: NEXUS.fs,
        terminalHistory: NEXUS.terminalHistory.slice(-50),
        windows: {}
    };
    document.querySelectorAll(".window").forEach(win => {
        if (win.style.display === "none" || win.classList.contains("window-closing")) return;
        state.windows[win.id] = {
            left: win.style.left, top: win.style.top,
            width: win.style.width, height: win.style.height,
            zIndex: win.style.zIndex
        };
    });
    try { localStorage.setItem("nexus-os-state", JSON.stringify(state)); } catch (e) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem("nexus-os-state");
        if (!raw) return;
        const state = JSON.parse(raw);
        if (state.settings) { NEXUS.settings = { ...NEXUS.settings, ...state.settings }; applySettings(); }
        if (state.maximized) NEXUS.maximizedWindows = state.maximized;
        if (state.fs) NEXUS.fs = state.fs;
        if (state.terminalHistory) NEXUS.terminalHistory = state.terminalHistory;
        if (state.windows) {
            Object.keys(state.windows).forEach(id => {
                const win = document.getElementById(id);
                if (!win) return;
                const s = state.windows[id];
                win.style.left = s.left 
