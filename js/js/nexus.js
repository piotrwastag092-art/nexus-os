"use strict";

window.NEXUS = {
    name: "NEXUS OS",
    version: "0.8",
    activeWindow: null,
    highestZIndex: 100,
    maximizedWindows: {},
    systemReady: false,
    settings: { accent: "#7c5cff", accent2: "#00d9ff", theme: "default", lockPass: "" },
    fs: {
        "Dokumenty": { type: "folder", children: { "Witaj.txt": { type: "file", content: "Witaj w NEXUS OS 0.7!" } } },
        "Obrazy": { type: "folder", children: {} },
        "Muzyka": { type: "folder", children: {} },
        "Pobrane": { type: "folder", children: {} }
    },
    trash: [],
    currentPath: [],
    terminalHistory: [],
    terminalHistoryIndex: -1,
    viewingTrash: false
};

function updateClock() {
    var now = new Date();
    var t = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
    var d = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", weekday: "long", day: "numeric", month: "long" }).format(now);
    var a = ["systemTime", "widgetClock", "lockTime"];
    for (var i = 0; i < a.length; i++) { var el = document.getElementById(a[i]); if (el) el.textContent = t; }
    var wd = document.getElementById("widgetDate"); if (wd) wd.textContent = d;
    var ld = document.getElementById("lockDate"); if (ld) ld.textContent = d;
}

function setSystemStatus(status) {
    var el = document.getElementById("systemStatus");
    if (!el) return;
    if (status === "booting") el.innerHTML = '<span class="status-dot"></span> URUCHAMIANIE';
    if (status === "online") el.innerHTML = '<span class="status-dot"></span> SYSTEM GOTOWY';
}

function showNotification(title, message) {
    var c = document.getElementById("notifications");
    if (!c) return;
    var n = document.createElement("div");
    n.className = "notification";
    n.innerHTML = "<strong>" + escapeHTML(title) + "</strong><span>" + escapeHTML(message) + "</span>";
    c.appendChild(n);
    setTimeout(function () { n.remove(); }, 4000);
}

function escapeHTML(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function playBeep(freq, dur) {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq || 520;
        g.gain.value = 0.03;
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
        o.stop(ctx.currentTime + (dur || 0.1));
    } catch (e) {}
}

function playBootSound() {
    /* główny dźwięk startu jest w inline boot w index.html */
    playBeep(700, 0.08);
}

function saveState() {
    var state = {
        maximized: NEXUS.maximizedWindows, settings: NEXUS.settings, fs: NEXUS.fs, trash: NEXUS.trash,
        terminalHistory: (NEXUS.terminalHistory || []).slice(-50), windows: {},
        widgetNote: (document.getElementById("widgetNote") || {}).value || ""
    };
    document.querySelectorAll(".window").forEach(function (win) {
        if (win.style.display === "none") return;
        state.windows[win.id] = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height, zIndex: win.style.zIndex };
    });
    try { localStorage.setItem("nexus-os-state", JSON.stringify(state)); } catch (e) {}
}

function loadState() {
    try {
        var raw = localStorage.getItem("nexus-os-state");
        if (!raw) return;
        var state = JSON.parse(raw);
        if (state.settings) { NEXUS.settings = Object.assign({}, NEXUS.settings, state.settings); applySettings(); setTheme(NEXUS.settings.theme || "default"); }
        if (state.fs) NEXUS.fs = state.fs;
        if (state.trash) NEXUS.trash = state.trash;
        if (state.terminalHistory) NEXUS.terminalHistory = state.terminalHistory;
        if (state.widgetNote) { var wn = document.getElementById("widgetNote"); if (wn) wn.value = state.widgetNote; }
        if (state.windows) {
            Object.keys(state.windows).forEach(function (id) {
                var win = document.getElementById(id); if (!win) return;
                var s = state.windows[id];
                if (s.left) win.style.left = s.left; if (s.top) win.style.top = s.top;
                if (s.width) win.style.width = s.width; if (s.height) win.style.height = s.height;
            });
        }
    } catch (e) {}
}

function applySettings() {
    document.documentElement.style.setProperty("--nexus-accent", NEXUS.settings.accent);
    document.documentElement.style.setProperty("--nexus-accent-2", NEXUS.settings.accent2);
}

function setTheme(name) {
    NEXUS.settings.theme = name;
    document.body.classList.remove("theme-cyber", "theme-glass");
    if (name === "cyber") document.body.classList.add("theme-cyber");
    if (name === "glass") document.body.classList.add("theme-glass");
    var sel = document.getElementById("themeSelect"); if (sel) sel.value = name;
    saveState();
}

function createParticles() {
    var desktop = document.getElementById("desktop"); if (!desktop) return;
    desktop.querySelectorAll(".particle").forEach(function (p) { p.remove(); });
    for (var i = 0; i < 18; i++) {
        var p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        p.style.animationDuration = (12 + Math.random() * 18) + "s";
        p.style.animationDelay = Math.random() * 10 + "s";
        desktop.appendChild(p);
    }
}

function initParallax() {
    var desktop = document.getElementById("desktop"); if (!desktop) return;
    desktop.addEventListener("mousemove", function (e) {
        desktop.style.setProperty("--parallax-x", ((e.clientX / window.innerWidth - 0.5) * 10) + "px");
        desktop.style.setProperty("--parallax-y", ((e.clientY / window.innerHeight - 0.5) * 10) + "px");
    });
}

function lockScreen() {
    var lock = document.getElementById("lockScreen");
    if (lock) lock.classList.add("show");
    playBeep(320, 0.1);
}

function unlockScreen() {
    var pass = (document.getElementById("lockPass") || {}).value || "";
    var need = NEXUS.settings.lockPass || localStorage.getItem("nexus-lock-pass") || "";
    if (need && pass !== need) { showNotification("Blokada", "Złe hasło"); return; }
    var lock = document.getElementById("lockScreen");
    if (lock) lock.classList.remove("show");
    var inp = document.getElementById("lockPass"); if (inp) inp.value = "";
    playBeep(660, 0.1);
}

function saveLockPass() {
    var v = (document.getElementById("lockPassSet") || {}).value || "";
    NEXUS.settings.lockPass = v;
    localStorage.setItem("nexus-lock-pass", v);
    saveState();
    showNotification("Blokada", v ? "Hasło ustawione" : "Hasło usunięte");
}

function saveWidgetNote() { saveState(); }

function loadWeather() {
    var el = document.getElementById("widgetWeather"); if (!el) return;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m")
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.current) el.textContent = Math.round(data.current.temperature_2m) + "°C · Warszawa";
            else el.textContent = "Brak danych";
        })
        .catch(function () { el.textContent = "Offline"; });
}

function renderDesktopIcons() {
    var box = document.getElementById("desktopIcons"); if (!box) return;
    box.innerHTML =
        '<div class="desk-icon" ondblclick="openWindow(\'filesWindow\')"><div class="ico">📁</div>Pliki</div>' +
        '<div class="desk-icon" ondblclick="openWindow(\'aiWindow\')"><div class="ico">✦</div>AI</div>' +
        '<div class="desk-icon" ondblclick="openWindow(\'notepadWindow\')"><div class="ico">📝</div>Notatnik</div>' +
        '<div class="desk-icon" ondblclick="openWindow(\'labWindow\');setTimeout(startLab,200)"><div class="ico">◈</div>Lab</div>' +
        '<div class="desk-icon" ondblclick="openTrash()"><div class="ico">🗑</div>Kosz</div>';
}

function logAIAction(text) {
    var el = document.getElementById("aiLog"); if (!el) return;
    var line = document.createElement("div");
    line.textContent = "• " + text;
    el.appendChild(line);
    while (el.children.length > 8) el.removeChild(el.firstChild);
}

function finishOnboard() {
    localStorage.setItem("nexus-onboarded", "1");
    var o = document.getElementById("onboard");
    if (o) o.classList.remove("show");
    playBeep(700, 0.12);
}

window.afterBoot = function () {
    NEXUS.systemReady = true;
    setSystemStatus("online");
    try { loadState(); } catch (e) {}
    try { applySettings(); } catch (e) {}
    try { initParallax(); } catch (e) {}
    try { createParticles(); } catch (e) {}
    try { renderDesktopIcons(); } catch (e) {}
    try { loadWeather(); } catch (e) {}
    if (!localStorage.getItem("nexus-onboarded")) {
        var o = document.getElementById("onboard");
        if (o) o.classList.add("show");
    }
    showNotification("NEXUS OS", "v" + NEXUS.version + " gotowy");
};

document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(saveState, 5000);
    window.addEventListener("beforeunload", saveState);
    document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (typeof openPalette === "function") openPalette();
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
            e.preventDefault();
            lockScreen();
        }
        if (e.key === "Escape") {
            var p = document.getElementById("commandPalette");
            if (p && p.classList.contains("show") && typeof closePalette === "function") closePalette();
        }
    });
    var desktop = document.getElementById("desktop");
    if (desktop) {
        desktop.addEventListener("dragover", function (e) { e.preventDefault(); });
        desktop.addEventListener("drop", function (e) {
            e.preventDefault();
            if (typeof handleExternalDrop === "function") handleExternalDrop(e);
        });
    }
});

// === END NEXUS.JS ===
