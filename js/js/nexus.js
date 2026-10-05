"use strict";

/* =========================================
   NEXUS OS — RDZEŃ SYSTEMU
   ========================================= */

window.NEXUS = {
    name: "NEXUS OS",
    version: "0.1",
    activeWindow: null,
    highestZIndex: 100,
    maximizedWindows: {},
    systemReady: false
};


/* =========================================
   ZEGAR
   ========================================= */

function updateClock() {
    const clock = document.getElementById("systemTime");

    if (!clock) return;

    const now = new Date();

    const hours = new Intl.DateTimeFormat("pl-PL", {
        timeZone: "Europe/Warsaw",
        hour: "2-digit",
        hour12: false
    }).format(now);

    const minutes = new Intl.DateTimeFormat("pl-PL", {
        timeZone: "Europe/Warsaw",
        minute: "2-digit",
        hour: "2-digit",
        hour12: false
    }).format(now);

    clock.textContent = `${hours}:${minutes.split(":").pop()}`;
}


/* =========================================
   STATUS SYSTEMU
   ========================================= */

function setSystemStatus(status) {
    const element = document.getElementById("systemStatus");

    if (!element) return;

    if (status === "booting") {
        element.innerHTML =
            '<span class="status-dot"></span> URUCHAMIANIE';
    }

    if (status === "online") {
        element.innerHTML =
            '<span class="status-dot"></span> SYSTEM GOTOWY';
    }

    if (status === "offline") {
        element.innerHTML =
            '<span class="status-dot"></span> OFFLINE';
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

    notification.className = "notification";

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
   ZABEZPIECZENIE HTML
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
   START SYSTEMU
   ========================================= */

function initializeNexus() {
    console.log("NEXUS OS — uruchamianie systemu...");

    setSystemStatus("booting");

    updateClock();

    setTimeout(() => {
        NEXUS.systemReady = true;

        setSystemStatus("online");

        console.log("NEXUS OS — system gotowy.");
    }, 700);
}


/* =========================================
   URUCHOMIENIE
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateClock();

    setInterval(updateClock, 1000);

    initializeNexus();
});
