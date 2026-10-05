"use strict";

/* =========================================
   NEXUS OS
   WINDOW MANAGER
   ========================================= */

window.NEXUS_WINDOWS = {
    dragging: false,
    resizing: false,
    active: null,

    dragOffsetX: 0,
    dragOffsetY: 0,

    resizeStartX: 0,
    resizeStartY: 0,
    resizeStartWidth: 0,
    resizeStartHeight: 0,

    currentResizeWindow: null
};


/* =========================================
   OTWIERANIE OKNA
   ========================================= */

function openWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    /* Pokaż */

    win.style.display = "flex";


    /* Jeżeli okno było poza ekranem,
       przywróć bezpieczną pozycję */

    const rect =
        win.getBoundingClientRect();

    if (
        rect.left < 0 ||
        rect.top < 0 ||
        rect.left > window.innerWidth - 100 ||
        rect.top > window.innerHeight - 100
    ) {
        win.style.left = "120px";
        win.style.top = "100px";
    }


    /* Pierwszy plan */

    focusWindow(id);


    /* Zamknij launcher */

    if (typeof closeLauncher === "function") {
        closeLauncher();
    }


    /* Fokus pól */

    setTimeout(() => {

        if (id === "terminalWindow") {

            const input =
                document.getElementById(
                    "terminalInput"
                );

            if (input) input.focus();
        }


        if (id === "aiWindow") {

            const input =
                document.getElementById(
                    "aiChatInput"
                );

            if (input) input.focus();
        }

    }, 100);
}


/* =========================================
   ZAMYKANIE
   ========================================= */

function closeWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    win.style.display = "none";


    if (
        NEXUS.activeWindow === id
    ) {
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


    win.dataset.minimized = "true";


    if (
        NEXUS.activeWindow === id
    ) {
        NEXUS.activeWindow = null;
    }
}


/* =========================================
   MAKSYMALIZOWANIE
   ========================================= */

function maximizeWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    if (
        !NEXUS.maximizedWindows[id]
    ) {

        /* Zapamiętaj poprzedni stan */

        win.dataset.previousLeft =
            win.style.left;

        win.dataset.previousTop =
            win.style.top;

        win.dataset.previousWidth =
            win.style.width;

        win.dataset.previousHeight =
            win.style.height;

        win.dataset.previousRadius =
            win.style.borderRadius;


        /* Maksymalizacja */

        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100%";
        win.style.height =
            "calc(100% - 90px)";
        win.style.borderRadius = "0";


        NEXUS.maximizedWindows[id] =
            true;

    } else {

        /* Przywrócenie */

        win.style.left =
            win.dataset.previousLeft ||
            "";

        win.style.top =
            win.dataset.previousTop ||
            "";

        win.style.width =
            win.dataset.previousWidth ||
            "";

        win.style.height =
            win.dataset.previousHeight ||
            "";

        win.style.borderRadius =
            win.dataset.previousRadius ||
            "";


        NEXUS.maximizedWindows[id] =
            false;
    }


    focusWindow(id);
}


/* =========================================
   FOCUS
   ========================================= */

function focusWindow(id) {

    const win =
        document.getElementById(id);

    if (!win) return;


    NEXUS.highestZIndex++;


    win.style.zIndex =
        NEXUS.highestZIndex;


    NEXUS.activeWindow =
        id;


    NEXUS_WINDOWS.active =
        id;
}


/* =========================================
   DRAGOWANIE OKIEN
   ========================================= */

function startWindowDrag(event) {

    const header =
        event.target.closest(
            ".window-header"
        );

    if (!header) return;


    const win =
        header.closest(".window");

    if (!win) return;


    /* Nie przeciągaj po przyciskach */

    if (
        event.target.closest(
            ".window-controls"
        )
    ) {
        return;
    }


    /* Nie przeciągaj zmaksymalizowanego */

    if (
        NEXUS.maximizedWindows[
            win.id
        ]
    ) {
        return;
    }


    focusWindow(win.id);


    const rect =
        win.getBoundingClientRect();


    NEXUS_WINDOWS.dragging =
        true;


    NEXUS_WINDOWS.active =
        win.id;


    NEXUS_WINDOWS.dragOffsetX =
        event.clientX - rect.left;


    NEXUS_WINDOWS.dragOffsetY =
        event.clientY - rect.top;


    event.preventDefault();
}


/* =========================================
   RUCH MYSZY
   ========================================= */

function handleWindowMouseMove(event) {

    if (
        !NEXUS_WINDOWS.dragging
    ) {
        return;
    }


    const id =
        NEXUS_WINDOWS.active;


    const win =
        document.getElementById(id);

    if (!win) return;


    let x =
        event.clientX -
        NEXUS_WINDOWS.dragOffsetX;


    let y =
        event.clientY -
        NEXUS_WINDOWS.dragOffsetY;


    /* Ograniczenie do ekranu */

    const maxX =
        window.innerWidth -
        win.offsetWidth;


    const maxY =
        window.innerHeight -
        win.offsetHeight -
        80;


    x =
        Math.max(
            0,
            Math.min(x, maxX)
        );


    y =
        Math.max(
            0,
            Math.min(y, maxY)
        );


    win.style.left =
        `${x}px`;

    win.style.top =
        `${y}px`;
}


/* =========================================
   KONIEC PRZECIĄGANIA
   ========================================= */

function stopWindowDrag() {

    NEXUS_WINDOWS.dragging =
        false;

    NEXUS_WINDOWS.active =
        null;
}


/* =========================================
   PODWÓJNE KLIKNIĘCIE
   ========================================= */

function handleWindowDoubleClick(event) {

    const header =
        event.target.closest(
            ".window-header"
        );

    if (!header) return;


    if (
        event.target.closest(
            ".window-controls"
        )
    ) {
        return;
    }


    const win =
        header.closest(".window");

    if (!win) return;


    maximizeWindow(win.id);
}


/* =========================================
   KLIKNIĘCIE W OKNO
   ========================================= */

document.addEventListener(
    "mousedown",
    function(event) {

        const win =
            event.target.closest(
                ".window"
            );

        if (!win) return;


        focusWindow(win.id);
    }
);


/* =========================================
   DRAG
   ========================================= */

document.addEventListener(
    "mousedown",
    startWindowDrag
);


document.addEventListener(
    "mousemove",
    handleWindowMouseMove
);


document.addEventListener(
    "mouseup",
    stopWindowDrag
);


/* =========================================
   DOUBLE CLICK
   ========================================= */

document.addEventListener(
    "dblclick",
    handleWindowDoubleClick
);


/* =========================================
   ESC
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
