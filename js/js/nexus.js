/* =========================================
   NEXUS OS — CORE SYSTEM
   nexus.js
========================================= */

"use strict";


/* =========================================
   ZMIENNE SYSTEMOWE
========================================= */

window.NEXUS = {

    version: "0.1",

    name: "NEXUS OS",

    activeWindow: null,

    highestZIndex: 100,

    maximizedWindows: {},

    systemReady: false

};


/* =========================================
   ZEGAR SYSTEMOWY
========================================= */

function updateClock() {

    const clock =
        document.getElementById("systemTime");

    if (!clock) return;

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit"
        });
}


updateClock();

setInterval(updateClock, 1000);


/* =========================================
   SYSTEM — STATUS
========================================= */

function setSystemStatus(status) {

    const element =
        document.getElementById("networkStatus");

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

function showNotification(title, message) {

    const container =
        document.getElementById("notifications");

    if (!container) return;


    const notification =
        document.createElement("div");

    notification.className =
        "notification";


    notification.innerHTML = `
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(message)}</span>
    `;


    container.appendChild(notification);


    setTimeout(() => {

        notification.remove();

    }, 4500);
}


/* =========================================
   BEZPIECZNE WSTAWIANIE TEKSTU
========================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

        status: NEXUS.systemReady
            ? "gotowy"
            : "uruchamianie"

    };
}


/* =========================================
   INICJALIZACJA NEXUS OS
========================================= */

function initializeNexus() {

    console.log(
        "NEXUS OS — uruchamianie systemu..."
    );


    setSystemStatus("online");


    setTimeout(() => {

        NEXUS.systemReady = true;


        console.log(
            "NEXUS OS — system gotowy."
        );


    }, 500);
}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeNexus
);
