"use strict";

/* =========================================
   NEXUS OS — SYSTEM OKIEN
   ========================================= */

/* Otwieranie okna */
function openWindow(id) {
    const win = document.getElementById(id);

    if (!win) return;

    win.style.display = "flex";

    NEXUS.highestZIndex++;
    win.style.zIndex = NEXUS.highestZIndex;

    NEXUS.activeWindow = id;

    closeLauncher();

    /* Automatyczny fokus dla terminala */
    if (id === "terminalWindow") {
        setTimeout(() => {
            const input =
                document.getElementById("terminalInput");

            if (input) input.focus();
        }, 100);
    }

    /* Automatyczny fokus dla AI */
    if (id === "aiWindow") {
        setTimeout(() => {
            const input =
                document.getElementById("aiChatInput");

            if (input) input.focus();
        }, 100);
    }
}


/* Zamknięcie okna */
function closeWindow(id) {
    const win = document.getElementById(id);

    if (!win) return;

    win.style.display = "none";

    if (NEXUS.activeWindow === id) {
        NEXUS.activeWindow = null;
    }
}


/* Minimalizacja okna */
function minimizeWindow(id) {
    const win = document.getElementById(id);

    if (!win) return;

    win.style.display = "none";

    if (NEXUS.activeWindow === id) {
        NEXUS.activeWindow = null;
    }
}


/* Maksymalizacja / przywrócenie */
function maximizeWindow(id) {
    const win = document.getElementById(id);

    if (!win) return;

    if (!NEXUS.maximizedWindows[id]) {

        /* Zapamiętujemy poprzedni wygląd */
        win.dataset.previousStyle =
            win.getAttribute("style") || "";

        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100%";
        win.style.height = "calc(100% - 90px)";
        win.style.borderRadius = "0";

        NEXUS.maximizedWindows[id] = true;

    } else {

        /* Przywracamy poprzedni wygląd */
        win.setAttribute(
            "style",
            win.dataset.previousStyle || ""
        );

        win.style.display = "flex";

        NEXUS.maximizedWindows[id] = false;
    }

    focusWindow(id);
}


/* Ustawienie okna na pierwszym planie */
function focusWindow(id) {
    const win = document.getElementById(id);

    if (!win) return;

    NEXUS.highestZIndex++;

    win.style.zIndex =
        NEXUS.highestZIndex;

    NEXUS.activeWindow = id;
}


/* =========================================
   KLIKNIĘCIE W OKNO = PIERWSZY PLAN
   ========================================= */

document.addEventListener(
    "mousedown",
    function(event) {

        const win =
            event.target.closest(".window");

        if (!win) return;

        focusWindow(win.id);
    }
);


/* =========================================
   ESC = ZAMKNIĘCIE AKTYWNEGO OKNA
   ========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            NEXUS.activeWindow
        ) {
            closeWindow(
                NEXUS.activeWindow
            );
        }
    }
);
