/* =========================================
   NEXUS OS — APPLICATION LAUNCHER
   launcher.js
========================================= */

"use strict";


/* =========================================
   OTWIERANIE / ZAMYKANIE LAUNCHERA
========================================= */

function toggleLauncher() {

    const launcher =
        document.getElementById("launcher");

    if (!launcher) return;


    if (
        launcher.style.display === "none" ||
        launcher.style.display === ""
    ) {

        launcher.style.display = "block";


        const input =
            document.getElementById(
                "launcherSearch"
            );


        if (input) {

            setTimeout(() => {

                input.focus();

            }, 100);

        }

    } else {

        closeLauncher();

    }
}


/* =========================================
   ZAMKNIĘCIE LAUNCHERA
========================================= */

function closeLauncher() {

    const launcher =
        document.getElementById("launcher");

    if (!launcher) return;

    launcher.style.display = "none";
}


/* =========================================
   URUCHAMIANIE APLIKACJI
========================================= */

function launchApp(id) {

    closeLauncher();

    openWindow(id);
}


/* =========================================
   WYSZUKIWANIE APLIKACJI
========================================= */

function filterLauncher() {

    const input =
        document.getElementById(
            "launcherSearch"
        );

    if (!input) return;


    const query =
        input.value
            .toLowerCase()
            .trim();


    const applications =
        document.querySelectorAll(
            ".launcher-app"
        );


    applications.forEach(app => {

        const name =
            (
                app.dataset.name || ""
            ).toLowerCase();


        if (
            name.includes(query)
        ) {

            app.style.display = "flex";

        } else {

            app.style.display = "none";

        }

    });
}


/* =========================================
   KLAWIATURA
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /*
         * Klawisz Windows / Meta
         * otwiera launcher.
         */

        if (
            event.key === "Meta"
        ) {

            event.preventDefault();

            toggleLauncher();

        }


        /*
         * ESC zamyka launcher,
         * jeśli jest otwarty.
         */

        if (
            event.key === "Escape"
        ) {

            const launcher =
                document.getElementById(
                    "launcher"
                );


            if (
                launcher &&
                launcher.style.display !== "none"
            ) {

                closeLauncher();

            }

        }

    }
);
