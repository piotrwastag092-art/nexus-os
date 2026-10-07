"use strict";

window.NEXUS_WINDOWS = {
    dragging: false, resizing: false, active: null,
    dragOffsetX: 0, dragOffsetY: 0, resizeDir: null,
    resizeStartX: 0, resizeStartY: 0,
    resizeStartWidth: 0, resizeStartHeight: 0,
    resizeStartLeft: 0, resizeStartTop: 0
};

var altTabIndex = 0;
var altTabActive = false;

function openWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    win.classList.remove("window-closing");
    win.style.display = "flex";
    win.classList.add("window-opening");
    if (!win.style.left) win.style.left = 80 + Math.random() * 80 + "px";
    if (!win.style.top) win.style.top = 70 + Math.random() * 40 + "px";
    focusWindow(id);
    if (typeof closeLauncher === "function") closeLauncher();
    if (typeof updateDock === "function") updateDock();
    if (typeof playBeep === "function") playBeep(600, 0.06);

    setTimeout(function () {
        win.classList.remove("window-opening");
        if (id === "terminalWindow") {
            var t = document.getElementById("terminalInput");
            if (t) t.focus();
        }
        if (id === "aiWindow") {
            var a = document.getElementById("aiChatInput");
            if (a) a.focus();
        }
        if (id === "filesWindow" && typeof renderFiles === "function") renderFiles();
        if (id === "notepadWindow") {
            var n = document.getElementById("notepadContent");
            if (n) n.focus();
        }
    }, 250);
    if (typeof saveState === "function") saveState();
}

function closeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    win.classList.add("window-closing");
    setTimeout(function () {
        win.style.display = "none";
        win.classList.remove("window-closing");
        if (NEXUS.activeWindow === id) NEXUS.activeWindow = null;
        if (typeof updateDock === "function") updateDock();
        if (typeof saveState === "function") saveState();
    }, 180);
}

function minimizeWindow(id) {
    closeWindow(id);
}

function maximizeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    if (!NEXUS.maximizedWindows[id]) {
        win.dataset.prevL = win.style.left;
        win.dataset.prevT = win.style.top;
        win.dataset.prevW = win.style.width;
        win.dataset.prevH = win.style.height;
        win.style.left = "0";
        win.style.top = "58px";
        win.style.width = "100%";
        win.style.height = "calc(100% - 140px)";
        win.style.borderRadius = "0";
        NEXUS.maximizedWindows[id] = true;
    } else {
        win.style.left = win.dataset.prevL || "120px";
        win.style.top = win.dataset.prevT || "100px";
        win.style.width = win.dataset.prevW || "720px";
        win.style.height = win.dataset.prevH || "480px";
        win.style.borderRadius = "16px";
        NEXUS.maximizedWindows[id] = false;
    }
    focusWindow(id);
    if (typeof saveState === "function") saveState();
}

function focusWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    NEXUS.highestZIndex++;
    win.style.zIndex = NEXUS.highestZIndex;
    NEXUS.activeWindow = id;
    document.querySelectorAll(".window").forEach(function (w) {
        w.classList.toggle("window-focused", w.id === id);
    });
    if (typeof updateDock === "function") updateDock();
}

function updateDock() {
    document.querySelectorAll(".dock-item").forEach(function (btn) {
        var oc = btn.getAttribute("onclick") || "";
        var m = oc.match(/'([^']+)'/);
        if (!m) return;
        var win = document.getElementById(m[1]);
        if (win && win.style.display !== "none") btn.classList.add("dock-active");
        else btn.classList.remove("dock-active");
    });
}

function getOpenWindows() {
    var list = [];
    document.querySelectorAll(".window").forEach(function (w) {
        if (w.style.display !== "none") list.push(w.id);
    });
    return list;
}

function showAltTab() {
    var list = getOpenWindows();
    if (!list.length) return;
    altTabActive = true;
    var wrap = document.getElementById("altTab");
    var inner = document.getElementById("altTabInner");
    if (!wrap || !inner) return;
    if (altTabIndex >= list.length) altTabIndex = 0;
    inner.innerHTML = list.map(function (id, i) {
        var title = (document.querySelector("#" + id + " .window-title") || {}).textContent || id;
        return '<div class="alt-card' + (i === altTabIndex ? " active" : "") + '"><div>' + title + "</div></div>";
    }).join("");
    wrap.classList.add("show");
}

function hideAltTab() {
    if (!altTabActive) return;
    altTabActive = false;
    var wrap = document.getElementById("altTab");
    if (wrap) wrap.classList.remove("show");
    var list = getOpenWindows();
    if (list[altTabIndex]) {
        openWindow(list[altTabIndex]);
        focusWindow(list[altTabIndex]);
    }
}

function startWindowDrag(event) {
    var header = event.target.closest(".window-header");
    if (!header || event.target.closest(".window-controls")) return;
    var win = header.closest(".window");
    if (!win || NEXUS.maximizedWindows[win.id]) return;
    focusWindow(win.id);
    var rect = win.getBoundingClientRect();
    NEXUS_WINDOWS.dragging = true;
    NEXUS_WINDOWS.active = win.id;
    NEXUS_WINDOWS.dragOffsetX = event.clientX - rect.left;
    NEXUS_WINDOWS.dragOffsetY = event.clientY - rect.top;
    event.preventDefault();
}

function handleWindowMouseMove(event) {
    if (NEXUS_WINDOWS.dragging) {
        var win = document.getElementById(NEXUS_WINDOWS.active);
        if (!win) return;
        var x = event.clientX - NEXUS_WINDOWS.dragOffsetX;
        var y = event.clientY - NEXUS_WINDOWS.dragOffsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - 100));
        y = Math.max(0, Math.min(y, window.innerHeight - 80));
        win.style.left = x + "px";
        win.style.top = y + "px";
        // snap preview edges
        win.classList.toggle("snap-left", event.clientX < 30);
        win.classList.toggle("snap-right", event.clientX > window.innerWidth - 30);
        return;
    }
    if (NEXUS_WINDOWS.resizing) {
        var win2 = document.getElementById(NEXUS_WINDOWS.active);
        if (!win2) return;
        var dir = NEXUS_WINDOWS.resizeDir;
        var dx = event.clientX - NEXUS_WINDOWS.resizeStartX;
        var dy = event.clientY - NEXUS_WINDOWS.resizeStartY;
        var newW = NEXUS_WINDOWS.resizeStartWidth;
        var newH = NEXUS_WINDOWS.resizeStartHeight;
        var newL = NEXUS_WINDOWS.resizeStartLeft;
        var newT = NEXUS_WINDOWS.resizeStartTop;
        if (dir.indexOf("e") >= 0) newW = Math.max(320, NEXUS_WINDOWS.resizeStartWidth + dx);
        if (dir.indexOf("s") >= 0) newH = Math.max(220, NEXUS_WINDOWS.resizeStartHeight + dy);
        if (dir.indexOf("w") >= 0) {
            newW = Math.max(320, NEXUS_WINDOWS.resizeStartWidth - dx);
            newL = NEXUS_WINDOWS.resizeStartLeft + dx;
        }
        if (dir.indexOf("n") >= 0) {
            newH = Math.max(220, NEXUS_WINDOWS.resizeStartHeight - dy);
            newT = NEXUS_WINDOWS.resizeStartTop + dy;
        }
        win2.style.width = newW + "px";
        win2.style.height = newH + "px";
        win2.style.left = newL + "px";
        win2.style.top = newT + "px";
    }
}

function stopWindowDrag(event) {
    if (NEXUS_WINDOWS.dragging && event) {
        var win = document.getElementById(NEXUS_WINDOWS.active);
        if (win) {
            win.classList.remove("snap-left", "snap-right");
            // SNAP
            if (event.clientX < 30) {
                win.style.left = "0";
                win.style.top = "58px";
                win.style.width = "50%";
                win.style.height = "calc(100% - 140px)";
                NEXUS.maximizedWindows[win.id] = false;
            } else if (event.clientX > window.innerWidth - 30) {
                win.style.left = "50%";
                win.style.top = "58px";
                win.style.width = "50%";
                win.style.height = "calc(100% - 140px)";
                NEXUS.maximizedWindows[win.id] = false;
            } else if (event.clientY < 40) {
                maximizeWindow(win.id);
            }
        }
    }
    NEXUS_WINDOWS.dragging = false;
    NEXUS_WINDOWS.resizing = false;
    NEXUS_WINDOWS.active = null;
    if (typeof saveState === "function") saveState();
}

function startResize(event, dir) {
    var win = event.target.closest(".window");
    if (!win || NEXUS.maximizedWindows[win.id]) return;
    focusWindow(win.id);
    var rect = win.getBoundingClientRect();
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

document.addEventListener("mousedown", function (e) {
    var win = e.target.closest(".window");
    if (win) focusWindow(win.id);
});
document.addEventListener("mousedown", startWindowDrag);
document.addEventListener("mousemove", handleWindowMouseMove);
document.addEventListener("mouseup", stopWindowDrag);
document.addEventListener("dblclick", function (e) {
    var header = e.target.closest(".window-header");
    if (!header || e.target.closest(".window-controls")) return;
    var win = header.closest(".window");
    if (win) maximizeWindow(win.id);
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && NEXUS.activeWindow) {
        var p = document.getElementById("commandPalette");
        if (p && p.classList.contains("show")) return;
        closeWindow(NEXUS.activeWindow);
    }
    // Alt+Tab
    if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        var list = getOpenWindows();
        if (!list.length) return;
        if (!altTabActive) {
            altTabIndex = 0;
            showAltTab();
        } else {
            altTabIndex = (altTabIndex + 1) % list.length;
            showAltTab();
        }
    }
});
document.addEventListener("keyup", function (e) {
    if (e.key === "Alt" && altTabActive) hideAltTab();
});
