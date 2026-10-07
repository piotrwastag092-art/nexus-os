"use strict";

/* =========================================
   NEXUS OS — WINDOW MANAGER v0.4
   ========================================= */

window.NEXUS_WINDOWS = {
    dragging: false, resizing: false, active: null,
    dragOffsetX: 0, dragOffsetY: 0, resizeDir: null,
    resizeStartX: 0, resizeStartY: 0,
    resizeStartWidth: 0, resizeStartHeight: 0,
    resizeStartLeft: 0, resizeStartTop: 0
};

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.classList.remove("window-closing");
    win.style.display = "flex";
    win.classList.add("window-opening");

    const rect = win.getBoundingClientRect();
    if (rect.left < 0 || rect.top < 0 || rect.left > window.innerWidth - 100 || rect.top > window.innerHeight - 100) {
        win.style.left = "120px";
        win.style.top = "100px";
    }

    focusWindow(id);
    if (typeof closeLauncher === "function") closeLauncher();
    updateDock();

    setTimeout(() => {
        win.classList.remove("window-opening");
        if (id === "terminalWindow") {
            const input = document.getElementById("terminalInput");
            if (input) input.focus();
        }
        if (id === "aiWindow") {
            const input = document.getElementById("aiChatInput");
            if (input) input.focus();
        }
        if (id === "notepadWindow") {
            const input = document.getElementById("notepadContent");
            if (input) input.focus();
        }
        if (id === "filesWindow") {
            if (typeof renderFiles === "function") renderFiles();
        }
    }, 280);

    if (typeof saveState === "function") saveState();
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.classList.add("window-closing");
    setTimeout(() => {
        win.style.display = "none";
        win.classList.remove("window-closing");
        if (NEXUS.activeWindow === id) NEXUS.activeWindow = null;
        updateDock();
        if (typeof saveState === "function") saveState();
    }, 220);
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.add("window-closing");
    setTimeout(() => {
        win.style.display = "none";
        win.classList.remove("window-closing");
        win.dataset.minimized = "true";
        if (NEXUS.activeWindow === id) NEXUS.activeWindow = null;
        updateDock();
        if (typeof saveState === "function") saveState();
    }, 220);
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (!NEXUS.maximizedWindows[id]) {
        win.dataset.previousLeft = win.style.left;
        win.dataset.previousTop = win.style.top;
        win.dataset.previousWidth = win.style.width;
        win.dataset.previousHeight = win.style.height;
        win.dataset.previousRadius = win.style.borderRadius;
        win.style.left = "0";
        win.style.top = "58px";
        win.style.width = "100%";
        win.style.height = "calc(100% - 148px)";
        win.style.borderRadius = "0";
        NEXUS.maximizedWindows[id] = true;
    } else {
        win.style.left = win.dataset.previousLeft || "120px";
        win.style.top = win.dataset.previousTop || "100px";
        win.style.width = win.dataset.previousWidth || "720px";
        win.style.height = win.dataset.previousHeight || "480px";
        win.style.borderRadius = win.dataset.previousRadius || "16px";
        NEXUS.maximizedWindows[id] = false;
    }
    focusWindow(id);
    if (typeof saveState === "function") saveState();
}

function focusWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    NEXUS.highestZIndex++;
    win.style.zIndex = NEXUS.highestZIndex;
    NEXUS.activeWindow = id;
    NEXUS_WINDOWS.active = id;
    updateDock();
}

function updateDock() {
    document.querySelectorAll(".dock-item").forEach(btn => {
        const target = btn.getAttribute("onclick") || "";
        const match = target.match(/'([^']+)'/);
        if (!match) return;
        const id = match[1];
        const win = document.getElementById(id);
        if (win && win.style.display !== "none" && !win.classList.contains("window-closing")) {
            btn.classList.add("dock-active");
        } else {
            btn.classList.remove("dock-active");
        }
    });
}

function startWindowDrag(event) {
    const header = event.target.closest(".window-header");
    if (!header) return;
    const win = header.closest(".window");
    if (!win) return;
    if (event.target.closest(".window-controls")) return;
    if (NEXUS.maximizedWindows[win.id]) return;

    focusWindow(win.id);
    const rect = win.getBoundingClientRect();
    NEXUS_WINDOWS.dragging = true;
    NEXUS_WINDOWS.active = win.id;
    NEXUS_WINDOWS.dragOffsetX = event.clientX - rect.left;
    NEXUS_WINDOWS.dragOffsetY = event.clientY - rect.top;
    event.preventDefault();
}

function handleWindowMouseMove(event) {
    if (NEXUS_WINDOWS.dragging) {
        const win = document.getElementById(NEXUS_WINDOWS.active);
        if (!win) return;
        let x = event.clientX - NEXUS_WINDOWS.dragOffsetX;
        let y = event.clientY - NEXUS_WINDOWS.dragOffsetY;
        const maxX = window.innerWidth - win.offsetWidth;
        const maxY = window.innerHeight - win.offsetHeight - 80;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        win.style.left = x + "px";
        win.style.top = y + "px";
        return;
    }
    if (NEXUS_WINDOWS.resizing) {
        const win = document.getElementById(NEXUS_WINDOWS.active);
        if (!win) return;
        const dir = NEXUS_WINDOWS.resizeDir;
        const dx = event.clientX - NEXUS_WINDOWS.resizeStartX;
        const dy = event.clientY - NEXUS_WINDOWS.resizeStartY;
        let newWidth = NEXUS_WINDOWS.resizeStartWidth;
        let newHeight = NEXUS_WINDOWS.resizeStartHeight;
        let newLeft = NEXUS_WINDOWS.resizeStartLeft;
        let newTop = NEXUS_WINDOWS.resizeStartTop;
        if (dir.includes("e")) newWidth = Math.max(320, NEXUS_WINDOWS.resizeStartWidth + dx);
        if (dir.includes("s")) newHeight = Math.max(220, NEXUS_WINDOWS.resizeStartHeight + dy);
        if (dir.includes("w")) {
            newWidth = Math.max(320, NEXUS_WINDOWS.resizeStartWidth - dx);
            newLeft = NEXUS_WINDOWS.resizeStartLeft + dx;
        }
        if (dir.includes("n")) {
            newHeight = Math.max(220, NEXUS_WINDOWS.resizeStartHeight - dy);
            newTop = NEXUS_WINDOWS.resizeStartTop + dy;
        }
        win.style.width = newWidth + "px";
        win.style.height = newHeight + "px";
        win.style.left = newLeft + "px";
        win.style.top = newTop + "px";
    }
}

function stopWindowDrag() {
    NEXUS_WINDOWS.dragging = false;
    NEXUS_WINDOWS.resizing = false;
    NEXUS_WINDOWS.active = null;
    NEXUS_WINDOWS.resizeDir = null;
    if (typeof saveState === "function") saveState();
}

function startResize(event, dir) {
    const win = event.target.closest(".window");
    if (!win || NEXUS.maximizedWindows[win.id]) return;
    focusWindow(win.id);
    const rect = win.getBoundingClientRect();
    NEXUS_WINDOWS.resizing = true;
    NEXUS_WINDOWS.active = win.id;
    NEXUS_WINDOWS.resizeDir = dir;
    NEXUS_WINDOWS.resizeStartX = event.clientX;
    NEXUS_WINDOWS.resizeStartY = event.clientY;
    NEXUS_WINDOWS.resizeStartWidth = rect.width;
    NEXUS_WINDOWS.resizeStartHeight = rect.height;
    NEXUS_WINDOWS.resizeStartLeft = rect.left;
    NEXUS_WINDOWS.resizeStartTop = rect.top;
    event.preventDefault();
    event.stopPropagation();
}

function handleWindowDoubleClick(event) {
    const header = event.target.closest(".window-header");
    if (!header || event.target.closest(".window-controls")) return;
    const win = header.closest(".window");
    if (win) maximizeWindow(win.id);
}

document.addEventListener("mousedown", e => {
    const win = e.target.closest(".window");
    if (win) focusWindow(win.id);
});
document.addEventListener("mousedown", startWindowDrag);
document.addEventListener("mousemove", handleWindowMouseMove);
document.addEventListener("mouseup", stopWindowDrag);
document.addEventListener("dblclick", handleWindowDoubleClick);
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && NEXUS.activeWindow) closeWindow(NEXUS.activeWindow);
});
