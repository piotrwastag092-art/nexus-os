/* =========================================
   NEXUS OS — CORE SYSTEM
   nexus.js
========================================= */

"use strict";


window.NEXUS = {

    name: "NEXUS OS",

    version: "0.1",

    activeWindow: null,

    highestZIndex: 100,

    maximizedWindows: {},

    systemReady: false

};


/* =========================================
   ZEGAR — CZAS WARSZAWSKI
========================================= */

function updateClock() {

    const clock =
        document.getElementById("systemTime");

    if (!clock) return;


    const now = new Date();


    const time =
        new Intl.DateTimeFormat(
            "pl-PL",
            {
                timeZone: "Europe/Warsaw",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        ).format(now);


    clock.textContent = time;
}


updateClock();

setInterval(updateClock, 1000);


/* =========================================
   STATUS SYSTEMU
========================================= */

function setSystemStatus(status) {

    const element =
        document.getElementById(
            "networkStatus"
        );

    if (!element) return;


    if (status === "online") {

        element.textContent =
            "● Połączono";

    } else {

        element.textContent =
            "● Offline";

    }
}


/* =========================================
   POWIADOMIENIA
========================================= */

function showNotification(
    title,
    message
) {

    const container =
        document.getElementById(
            "notifications"
        );

    if (!container) return;


    const notification =
        document.createElement("div");


    notification.className =
        "notification";


    notification.innerHTML = `
        <strong>
            ${escapeHTML(title)}
        </strong>

        <span>
            ${escapeHTML(message)}
        </span>
    `;


    container.appendChild(
        notification
    );


    setTimeout(() => {

        notification.remove();

    }, 4500);
}


/* =========================================
   BEZPIECZNY TEKST
========================================= */

function escapeHTML(text) {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   INFORMACJE O SYSTEMIE
========================================= */

function getSystemInfo() {

    return {

        name: NEXUS.name,

        version: NEXUS.version,

        platform: "NEXUS Web Shell",

        language: "pl-PL",

        status:
            NEXUS.systemReady
                ? "gotowy"
                : "uruchamianie"

    };
}


/* =========================================
   START SYSTEMU
========================================= */

function initializeNexus() {

    console.log(
        "NEXUS OS — uruchamianie systemu..."
    );


    setSystemStatus(
        "online"
    );


    setTimeout(() => {

        NEXUS.systemReady =
            true;


        console.log(
            "NEXUS OS — system gotowy."
        );


    }, 500);
}


document.addEventListener(
    "DOMContentLoaded",
    initializeNexus
);
