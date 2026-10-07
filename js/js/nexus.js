"use strict";

window.NEXUS = {
    name: "NEXUS OS",
    version: "0.6",
    activeWindow: null,
    highestZIndex: 100,
    maximizedWindows: {},
    systemReady: false,
    settings: {
        accent: "#7c5cff",
        accent2: "#00d9ff",
        wallpaper: "default"
    },
    fs: {
        "Dokumenty": {
            type: "folder",
            children: {
                "Witaj.txt": {
                    type: "file",
                    content: "Witaj w NEXUS OS!\nTo Twój wirtualny dysk.\nMożesz tworzyć i edytować pliki."
                }
            }
        },
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
    var clock = document.getElementById("systemTime");
    if (!clock) return;
    var now = new Date();
    var h = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", hour: "2-digit", hour12: false }).format(now);
    var m = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", minute: "2-digit", hour: "2-digit", hour12: false }).format(now);
    clock.textContent = h + ":" + m.split(":").pop();
}

function setSystemStatus(status) {
    var el = document.getElementById("systemStatus");
    if (!el) return;
    if (status === "booting") el.innerHTML = '<span class="status-dot"></span> URUCHAMIANIE';
    if (status === "online") el.innerHTML = '<span class="status-dot"></span> SYSTEM GOTOWY';
    if (status === "offline") el.innerHTML = '<span class="status-dot"></span> OFFLINE';
}

function showNotification(title, message) {
    var container = document.getElementById("notifications");
    if (!container) return;
    var n = document.createElement("div");
    n.className = "notification";
    n.innerHTML = "<strong>" + escapeHTML(title) + "</strong><span>" + escapeHTML(message) + "</span>";
    container.appendChild(n);
    setTimeout(function () { n.remove(); }, 4200);
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function saveState() {
    var state = {
        maximized: NEXUS.maximizedWindows,
        settings: NEXUS.settings,
        fs: NEXUS.fs,
        terminalHistory: (NEXUS.terminalHistory || []).slice(-50),
        windows: {}
    };
    document.querySelectorAll(".window").forEach(function (win) {
        if (win.style.display === "none" || win.classList.contains("window-closing")) return;
        state.windows[win.id] = {
            left: win.style.left,
            top: win.style.top,
            width: win.style.width,
            height: win.style.height,
            zIndex: win.style.zIndex
        };
    });
    try { localStorage.setItem("nexus-os-state", JSON.stringify(state)); } catch (e) {}
}

function loadState() {
    try {
        var raw = localStorage.getItem("nexus-os-state");
        if (!raw) return;
        var state = JSON.parse(raw);
        if (state.settings) {
            NEXUS.settings = Object.assign({}, NEXUS.settings, state.settings);
            applySettings();
        }
        if (state.maximized) NEXUS.maximizedWindows = state.maximized;
        if (state.fs) NEXUS.fs = state.fs;
        if (state.terminalHistory) NEXUS.terminalHistory = state.terminalHistory;
        if (state.windows) {
            Object.keys(state.windows).forEach(function (id) {
                var win = document.getElementById(id);
                if (!win) return;
                var s = state.windows[id];
                win.style.left = s.left || "120px";
                win.style.top = s.top || "100px";
                win.style.width = s.width || "720px";
                win.style.height = s.height || "480px";
                if (s.zIndex) win.style.zIndex = s.zIndex;
            });
        }
    } catch (e) {}
}

function applySettings() {
    document.documentElement.style.setProperty("--nexus-accent", NEXUS.settings.accent);
    document.documentElement.style.setProperty("--nexus-accent-2", NEXUS.settings.accent2);
}

function createParticles() {
    var desktop = document.getElementById("desktop");
    if (!desktop) return;
    desktop.querySelectorAll(".particle").forEach(function (p) { p.remove(); });
    for (var i = 0; i < 24; i++) {
        var p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        p.style.animationDuration = (10 + Math.random() * 20) + "s";
        p.style.animationDelay = (Math.random() * 12) + "s";
        p.style.width = (2 + Math.random() * 3) + "px";
        p.style.height = p.style.width;
        desktop.appendChild(p);
    }
}

function initParallax() {
    var desktop = document.getElementById("desktop");
    if (!desktop) return;
    desktop.addEventListener("mousemove", function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 12;
        var y = (e.clientY / window.innerHeight - 0.5) * 12;
        desktop.style.setProperty("--parallax-x", x + "px");
        desktop.style.setProperty("--parallax-y", y + "px");
    });
}

function hideBootScreen() {
    var boot = document.getElementById("bootScreen");
    if (!boot) return;
    boot.classList.add("boot-hidden");
    // MUSI być !important — CSS ma display:flex !important
    boot.style.setProperty("display", "none", "important");
    boot.style.setProperty("opacity", "0", "important");
    boot.style.setProperty("visibility", "hidden", "important");
    boot.style.setProperty("pointer-events", "none", "important");
}

function spawnBootSparks() {
    var boot = document.getElementById("bootScreen");
    if (!boot) return;
    for (var i = 0; i < 12; i++) {
        var s = document.createElement("div");
        s.className = "boot-spark";
        s.style.left = "50%";
        s.style.top = "42%";
        var angle = Math.random() * Math.PI * 2;
        var dist = 60 + Math.random() * 160;
        s.style.setProperty("--sx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--sy", Math.sin(angle) * dist + "px");
        s.style.animationDelay = (Math.random() * 0.4) + "s";
        boot.appendChild(s);
        (function (el) {
            setTimeout(function () { if (el && el.parentNode) el.remove(); }, 1400);
        })(s);
    }
}

function runBootSequence() {
    var boot = document.getElementById("bootScreen");
    var statusEl = document.getElementById("bootStatus");
    var bar = document.getElementById("bootBar");

    // awaryjny timeout — ZAWSZE schowa boot max po 5s
    var safety = setTimeout(function () {
        hideBootScreen();
        finishBoot();
    }, 5000);

    if (!boot) {
        clearTimeout(safety);
        finishBoot();
        return;
    }

    boot.classList.remove("boot-hidden");
    boot.style.setProperty("display", "flex", "important");
    boot.style.setProperty("opacity", "1", "important");
    boot.style.setProperty("visibility", "visible", "important");

    var steps = [
        { text: "Inicjalizacja rdzenia...", pct: 15 },
        { text: "Ładowanie modułów systemu...", pct: 35 },
        { text: "Uruchamianie NEXUS AI...", pct: 55 },
        { text: "Montowanie wirtualnego dysku...", pct: 75 },
        { text: "Przygotowanie interfejsu...", pct: 90 },
        { text: "System gotowy.", pct: 100 }
    ];

    var i = 0;
    try { spawnBootSparks(); } catch (e) {}

    var tick = setInterval(function () {
        try {
            if (i >= steps.length) {
                clearInterval(tick);
                try { spawnBootSparks(); } catch (e2) {}
                setTimeout(function () {
                    hideBootScreen();
                    clearTimeout(safety);
                    finishBoot();
                }, 450);
                return;
            }
            var step = steps[i];
            if (statusEl) statusEl.textContent = step.text;
            if (bar) bar.style.width = step.pct + "%";
            if (i === 2 || i === 4) {
                try { spawnBootSparks(); } catch (e3) {}
            }
            i++;
        } catch (err) {
            clearInterval(tick);
            clearTimeout(safety);
            hideBootScreen();
            finishBoot();
        }
    }, 400);
}

function finishBoot() {
    if (NEXUS.systemReady) return;
    NEXUS.systemReady = true;
    setSystemStatus("online");
    try { showNotification("NEXUS OS", "System gotowy. Wersja " + NEXUS.version); } catch (e) {}
    try { createParticles(); } catch (e) {}
}

function initializeNexus() {
    console.log("NEXUS OS — boot");
    setSystemStatus("booting");
    updateClock();
    runBootSequence();
    setTimeout(function () {
        try { loadState(); } catch (e) {}
        try { applySettings(); } catch (e) {}
        try { initParallax(); } catch (e) {}
    }, 300);
    setInterval(saveState, 5000);
    window.addEventListener("beforeunload", saveState);
}

document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    setInterval(updateClock, 1000);
    initializeNexus();
});
