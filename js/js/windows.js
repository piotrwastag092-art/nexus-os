/* =========================================
   NEXUS OS — WINDOW MANAGER
   windows.js
========================================= */

"use strict";


/* =========================================
   OTWIERANIE OKNA
========================================= */

function openWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    win.style.display = "flex";


    NEXUS.highestZIndex++;

    win.style.zIndex =
        NEXUS.highestZIndex;


    NEXUS.activeWindow = id;


    closeLauncher();


    /* Automatyczne ustawienie fokusu */

    if (id === "terminalWindow") {

        setTimeout(() => {

            const input =
                document.getElementById(
                    "terminalInput"
                );

            if (input) {
                input.focus();
            }

        }, 100);
    }


    if (id === "aiWindow") {

        setTimeout(() => {

            const input =
                document.getElementById(
                    "aiChatInput"
                );

            if (input) {
                input.focus();
            }

        }, 100);
    }
}


/* =========================================
   ZAMYKANIE OKNA
========================================= */

function closeWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    win.style.display = "none";


    if (NEXUS.activeWindow === id) {

        NEXUS.activeWindow = null;

    }
}


/* =========================================
   MINIMALIZOWANIE
========================================= */

function minimizeWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    win.style.display = "none";
}


/* =========================================
   MAKSYMALIZOWANIE
========================================= */

function maximizeWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    if (!NEXUS.maximizedWindows[id]) {

        /*
         * Zapamiętujemy poprzedni wygląd
         */

        win.dataset.previousStyle =
            win.getAttribute("style") || "";


        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100%";
        win.style.height =
            "calc(100% - 90px)";

        win.style.borderRadius = "0";


        NEXUS.maximizedWindows[id] =
            true;

    } else {

        /*
         * Przywracamy poprzedni wygląd
         */

        win.setAttribute(
            "style",
            win.dataset.previousStyle ||
            "display:flex;"
        );


        win.style.display = "flex";


        NEXUS.maximizedWindows[id] =
            false;
    }
}


/* =========================================
   USTAWIANIE AKTYWNEGO OKNA
========================================= */

function focusWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    NEXUS.highestZIndex++;


    win.style.zIndex =
        NEXUS.highestZIndex;


    NEXUS.activeWindow = id;
}


/* =========================================
   KLIKNIĘCIE W OKNO
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
   PODSTAWOWE ZARZĄDZANIE KLAWIATURĄ
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /*
         * ESC zamyka aktywne okno
         */

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
