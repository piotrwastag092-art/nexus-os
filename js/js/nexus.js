"use strict";

window.NEXUS = {
    name: "NEXUS OS",
    version: "0.7",
    activeWindow: null,
    highestZIndex: 100,
    maximizedWindows: {},
    systemReady: false,
    settings: {
        accent: "#7c5cff",
        accent2: "#00d9ff",
        theme: "default",
        lockPass: ""
    },
    fs: {
        "Dokumenty": {
            type: "folder",
            children: {
                "Witaj.txt": {
                    type: "file",
                    content: "Witaj w NEXUS OS 0.7!\nCtrl+K = palette\nAlt+Tab = okna\nMeta+L = blokada"
                }
            }
        },
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
    var t = new Intl.DateTimeFormat("pl-PL", {
        timeZone: "Europe/Warsaw",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(now);
    var d = new Intl.DateTimeFormat("pl-PL", {
        timeZone: "Europe/Warsaw",
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(now);

    var clock = document.getElementById("systemTime");
    if (clock) clock.textContent = t;

    var wc = document.getElementById("widgetClock");
    if (wc) wc.textContent = t;

    var wd = document.getElementById("widgetDate");
    if (wd) wd.textContent = d;

    var lt = document.getElementById("lockTime");
    if (lt) lt.textContent = t;

    var ld = document.getElementById("lockDate");
    if (ld) ld.textContent = d;
}

function setSystemStatus(status) {
    var el = document.getElementById("systemStatus");
    if (!el) return;
    if (status === "booting") el.innerHTML = '<span class="status-dot"></span> URUCHAMIANIE';
    if (status === "online") el.innerHTML = '<span class="status-dot"></span> SYSTEM GOTOWY';
}

function showNotification(title, message) {
    var container = document.getElementById("notifications");
    if (!container) return;
    var n = document.createElement("div");
    n.className = "notification";
    n.innerHTML = "<strong>" + escapeHTML(title) + "</strong><span>" + escapeHTML(message) + "</span>";
    container.appendChild(n);
    setTimeout(function () { n.remove(); }, 4000);
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function playBeep(freq, dur) {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq || 520;
        g.gain.value = 0.03;
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
        o.stop(ctx.currentTime + (dur || 0.1));
    } catch (e) {}
}

/* Dźwięk startu NEXUS — ciemny whoosh + jasne cyber chime */
function playBootSound() {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var t0 = ctx.currentTime;

        // 1) głęboki whoosh (szum filtrowany)
        var bufferSize = Math.floor(ctx.sampleRate * 1.2);
        var noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = noiseBuf.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        var noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        var noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(400, t0);
        noiseFilter.frequency.exponentialRampToValueAtTime(1200, t0 + 0.5);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, t0 + 1.1);
        var noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.15);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.15);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t0);
        noise.stop(t0 + 1.2);

        // 2) tony
        function tone(freq, start, len, vol, type) {
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.type = type || "sine";
            o.frequency.setValueAtTime(freq, t0 + start);
            g.gain.setValueAtTime(0.001, t0 + start);
            g.gain.exponentialRampToValueAtTime(vol, t0 + start + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + start + len);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(t0 + start);
            o.stop(t0 + start + len + 0.02);
        }

        tone(110, 0.05, 0.8, 0.08, "sine");
        tone(220, 0.25, 0.5, 0.05, "triangle");
        tone(523.25, 0.45, 0.35, 0.06, "sine");
        tone(659.25, 0.55, 0.4, 0.055, "sine");
        tone(783.99, 0.68, 0.55, 0.05, "sine");
        tone(1046.5, 0.85, 0.45, 0.035, "sine");
        tone(880, 1.05, 0.08, 0.03, "square");
    } catch (e) {
        playBeep(520, 0.15);
    }
}

function saveState() {
    var state = {
        maximized: NEXUS.maximizedWindows,
        settings: NEXUS.settings,
        fs: NEXUS.fs,
        trash: NEXUS.trash,
        terminalHistory: (NEXUS.terminalHistory || []).slice(-50),
        windows: {},
        widgetNote: (document.getElementById("widgetNote") || {}).value || ""
    };
    document.querySelectorAll(".window").forEach(function (win) {
        if (win.style.display === "none") return;
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
            setTheme(NEXUS.settings.theme || "default");
        }
        if (state.fs) NEXUS.fs = state.fs;
        if (state.trash) NEXUS.trash = state.trash;
        if (state.terminalHistory) NEXUS.terminalHistory = state.terminalHistory;
        if (state.widgetNote) {
            var wn = document.getElementById("widgetNote");
            if (wn) wn.value = state.widgetNote;
        }
        if (state.windows) {
            Object.keys(state.windows).forEach(function (id) {
                var win = document.getElementById(id);
                if (!win) return;
                var s = state.windows[id];
                if (s.left) win.style.left = s.left;
                if (s.top) win.style.top = s.top;
                if (s.width) win.style.width = s.width;
                if (s.height) win.style.height = s.height;
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
    var sel = document.getElementById("themeSelect");
    if (sel) sel.value = name;
    saveState();
}

function createParticles() {
    var desktop = document.getElementById("desktop");
    if (!desktop) return;
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
    var desktop = document.getElementById("desktop");
    if (!desktop) return;
    desktop.addEventListener("mousemove", function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 10;
        var y = (e.clientY / window.innerHeight - 0.5) * 10;
        desktop.style.setProperty("--parallax-x", x + "px");
        desktop.style.setProperty("--parallax-y", y + "px");
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
    if (need && pass !== need) {
        showNotification("Blokada", "Złe hasło");
        return;
    }
    var lock = document.getElementById("lockScreen");
    if (lock) lock.classList.remove("show");
    var inp = document.getElementById("lockPass");
    if (inp) inp.value = "";
    playBeep(660, 0.1);
}

function saveLockPass() {
    var v = (document.getElementById("lockPassSet") || {}).value || "";
    NEXUS.settings.lockPass = v;
    localStorage.setItem("nexus-lock-pass", v);
    saveState();
    showNotification("Blokada", v ? "Hasło ustawione" : "Hasło usunięte");
}

function saveWidgetNote() {
    saveState();
}

function loadWeather() {
    var el = document.getElementById("widgetWeather");
    if (!el) return;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m,weather_code")
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.current) {
                el.textContent = Math.round(data.current.temperature_2m) + "°C · Warszawa";
            } else {
                el.textContent = "Brak danych";
            }
        })
        .catch(function () {
            el.textContent = "Offline";
        });
}

function renderDesktopIcons() {
    var box = document.getElementById("desktopIcons");
    if (!box) return;
    var icons = [
        { ico: "📁", name: "Pliki", fn: "openWindow('filesWindow')" },
        { ico: "✦", name: "AI", fn: "openWindow('aiWindow')" },
        { ico: "📝", name: "Notatnik", fn: "openWindow('notepadWindow')" },
        { ico: "🗑", name: "Kosz", fn: "openTrash()" }
    ];
    box.innerHTML = icons.map(function (i) {
        return '<div class="desk-icon" ondblclick="' + i.fn + '"><div class="ico">' + i.ico + "</div>" + i.name + "</div>";
    }).join("");
}

function logAIAction(text) {
    var el = document.getElementById("aiLog");
    if (!el) return;
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
    playBootSound();
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
            if (p && p.classList.contains("show")) {
                if (typeof closePalette === "function") closePalette();
            }
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
