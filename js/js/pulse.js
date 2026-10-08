"use strict";

/* =========================================
   NEXUS OS — NEURAL PULSE + LAB + WOW LOADER
========================================= */

window.NEXUS_PULSE = {
    particles: [],
    boost: 1,
    mouseX: 0.5,
    mouseY: 0.5,
    running: false,
    labRunning: false,
    labParticles: [],
    labMode: "orbit",
    raf: null,
    labRaf: null
};

function pulseBoost(mult) {
    NEXUS_PULSE.boost = Math.min(
        3.5,
        (NEXUS_PULSE.boost || 1) * (mult || 1.3)
    );
}

function initNeuralPulse() {
    var canvas = document.getElementById("neuralPulse");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    window.addEventListener("resize", resize);

    var count = Math.min(
        70,
        Math.floor(
            (window.innerWidth * window.innerHeight) / 18000
        )
    );

    NEXUS_PULSE.particles = [];

    for (var i = 0; i < count; i++) {
        NEXUS_PULSE.particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: 1 + Math.random() * 2.2,
            life: Math.random()
        });
    }

    var desktop = document.getElementById("desktop");

    if (desktop && !desktop.dataset.pulseMouseBound) {
        desktop.dataset.pulseMouseBound = "1";

        desktop.addEventListener("mousemove", function (e) {
            NEXUS_PULSE.mouseX =
                e.clientX / Math.max(1, window.innerWidth);

            NEXUS_PULSE.mouseY =
                e.clientY / Math.max(1, window.innerHeight);
        });
    }

    NEXUS_PULSE.running = true;

    function frame() {
        if (!NEXUS_PULSE.running) return;

        var w = window.innerWidth;
        var h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        var accent =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--nexus-accent")
                .trim() || "#7c5cff";

        var accent2 =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--nexus-accent-2")
                .trim() || "#00d9ff";

        var boost = NEXUS_PULSE.boost;

        NEXUS_PULSE.boost +=
            (1 - NEXUS_PULSE.boost) * 0.03;

        var mx = NEXUS_PULSE.mouseX * w;
        var my = NEXUS_PULSE.mouseY * h;

        var pts = NEXUS_PULSE.particles;

        for (var i = 0; i < pts.length; i++) {
            var p = pts[i];

            var dx = mx - p.x;
            var dy = my - p.y;

            var dist =
                Math.sqrt(dx * dx + dy * dy) + 0.01;

            p.vx +=
                (dx / dist) * 0.008 * boost;

            p.vy +=
                (dy / dist) * 0.008 * boost;

            p.vx *= 0.985;
            p.vy *= 0.985;

            p.x += p.vx * boost;
            p.y += p.vy * boost;

            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;

            p.life += 0.01;

            var alpha =
                0.15 +
                0.25 *
                Math.sin(p.life);

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.r * (0.8 + boost * 0.25),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                i % 3 === 0
                    ? accent2
                    : accent;

            ctx.globalAlpha =
                alpha * Math.min(1, boost);

            ctx.fill();
        }

        ctx.globalAlpha =
            0.08 * boost;

        ctx.strokeStyle =
            accent;

        ctx.lineWidth = 1;

        for (var a = 0; a < pts.length; a++) {
            for (var b = a + 1; b < pts.length; b++) {

                var ddx =
                    pts[a].x -
                    pts[b].x;

                var ddy =
                    pts[a].y -
                    pts[b].y;

                var dd =
                    ddx * ddx +
                    ddy * ddy;

                if (dd < 120 * 120) {

                    ctx.beginPath();

                    ctx.moveTo(
                        pts[a].x,
                        pts[a].y
                    );

                    ctx.lineTo(
                        pts[b].x,
                        pts[b].y
                    );

                    ctx.stroke();
                }
            }
        }

        ctx.globalAlpha = 1;

        NEXUS_PULSE.raf =
            requestAnimationFrame(frame);
    }

    frame();
}


/* =========================================
   NEXUS LAB
========================================= */

function startLab() {

    var canvas =
        document.getElementById("labCanvas");

    if (!canvas) return;

    var ctx =
        canvas.getContext("2d");

    var wrap =
        canvas.parentElement;

    if (!wrap) return;

    var dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    function resizeLab() {

        var rect =
            wrap.getBoundingClientRect();

        canvas.width =
            rect.width * dpr;

        canvas.height =
            Math.max(
                200,
                rect.height - 8
            ) * dpr;

        canvas.style.width =
            rect.width + "px";

        canvas.style.height =
            Math.max(
                200,
                rect.height - 8
            ) + "px";

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }

    resizeLab();

    if (
        !NEXUS_PULSE.labParticles.length
    ) {

        for (
            var i = 0;
            i < 90;
            i++
        ) {

            NEXUS_PULSE.labParticles.push({

                a:
                    Math.random() *
                    Math.PI *
                    2,

                r:
                    40 +
                    Math.random() *
                    140,

                s:
                    0.4 +
                    Math.random() *
                    1.2,

                size:
                    1.5 +
                    Math.random() *
                    3,

                hue:
                    Math.random()
            });
        }
    }

    NEXUS_PULSE.labRunning =
        true;

    if (NEXUS_PULSE.labRaf) {

        cancelAnimationFrame(
            NEXUS_PULSE.labRaf
        );
    }

    var t0 =
        performance.now();

    function labFrame(now) {

        if (
            !NEXUS_PULSE.labRunning
        ) {
            return;
        }

        var win =
            document.getElementById(
                "labWindow"
            );

        if (
            !win ||
            win.style.display === "none"
        ) {

            NEXUS_PULSE.labRunning =
                false;

            return;
        }

        resizeLab();

        var w =
            canvas.clientWidth;

        var h =
            canvas.clientHeight;

        ctx.fillStyle =
            "rgba(5,7,12,0.22)";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        var cx =
            w / 2;

        var cy =
            h / 2;

        var time =
            (now - t0) / 1000;

        var mode =
            NEXUS_PULSE.labMode;

        var accent =
            getComputedStyle(
                document.documentElement
            )
            .getPropertyValue(
                "--nexus-accent"
            )
            .trim() ||
            "#7c5cff";

        var accent2 =
            getComputedStyle(
                document.documentElement
            )
            .getPropertyValue(
                "--nexus-accent-2"
            )
            .trim() ||
            "#00d9ff";

        var boost =
            NEXUS_PULSE.boost;

        var coreR =
            18 +
            Math.sin(
                time * 2
            ) * 4 +
            boost * 6;

        var grd =
            ctx.createRadialGradient(
                cx,
                cy,
                0,
                cx,
                cy,
                coreR * 3
            );

        grd.addColorStop(
            0,
            accent2
        );

        grd.addColorStop(
            0.4,
            accent
        );

        grd.addColorStop(
            1,
            "transparent"
        );

        ctx.fillStyle =
            grd;

        ctx.globalAlpha =
            0.55;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            coreR * 3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha =
            1;

        var pts =
            NEXUS_PULSE.labParticles;

        for (
            var i = 0;
            i < pts.length;
            i++
        ) {

            var p =
                pts[i];

            p.a +=
                0.008 *
                p.s *
                boost;

            var x;
            var y;

            if (
                mode === "orbit"
            ) {

                x =
                    cx +
                    Math.cos(
                        p.a +
                        time * 0.3
                    ) *
                    p.r *
                    (
                        0.7 +
                        0.3 *
                        Math.sin(
                            time +
                            p.hue * 6
                        )
                    );

                y =
                    cy +
                    Math.sin(
                        p.a +
                        time * 0.3
                    ) *
                    p.r *
                    0.55;

            } else if (
                mode === "wave"
            ) {

                x =
                    (
                        i /
                        pts.length
                    ) *
                    w;

                y =
                    cy +
                    Math.sin(
                        time * 2 +
                        i * 0.25
                    ) *
                    (
                        40 +
                        p.r * 0.2
                    ) *
                    boost;

            } else if (
                mode === "burst"
            ) {

                var rr =
                    (
                        p.r +
                        time * 40 *
                        p.s
                    ) % 200;

                x =
                    cx +
                    Math.cos(
                        p.a
                    ) *
                    rr;

                y =
                    cy +
                    Math.sin(
                        p.a
                    ) *
                    rr;

            } else {

                x =
                    cx +
                    Math.cos(
                        p.a * 3 +
                        time
                    ) *
                    p.r *
                    Math.sin(
                        time * 0.7 +
                        p.hue
                    );

                y =
                    cy +
                    Math.sin(
                        p.a * 2 -
                        time * 0.5
                    ) *
                    p.r *
                    0.7;
            }

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                p.hue > 0.5
                    ? accent2
                    : accent;

            ctx.globalAlpha =
                0.55 +
                0.35 *
                Math.sin(
                    time +
                    p.hue * 10
                );

            ctx.fill();
        }

        ctx.globalAlpha =
            1;

        ctx.strokeStyle =
            accent;

        ctx.lineWidth =
            1;

        ctx.globalAlpha =
            0.12;

        for (
            var a = 0;
            a < 12;
            a++
        ) {

            var ang =
                (
                    a / 12
                ) *
                Math.PI *
                2 +
                time * 0.4;

            ctx.beginPath();

            ctx.moveTo(
                cx,
                cy
            );

            ctx.lineTo(
                cx +
                    Math.cos(
                        ang
                    ) *
                    90 *
                    boost,

                cy +
                    Math.sin(
                        ang
                    ) *
                    90 *
                    boost
            );

            ctx.stroke();
        }

        ctx.globalAlpha =
            1;

        NEXUS_PULSE.labRaf =
            requestAnimationFrame(
                labFrame
            );
    }

    NEXUS_PULSE.labRaf =
        requestAnimationFrame(
            labFrame
        );
}

function setLabMode(mode) {

    NEXUS_PULSE.labMode =
        mode;

    document
        .querySelectorAll(
            ".lab-mode"
        )
        .forEach(
            function (b) {

                b.classList.toggle(
                    "active",
                    b.dataset.mode === mode
                );
            }
        );

    pulseBoost(1.5);

    if (
        typeof playBeep ===
        "function"
    ) {

        playBeep(
            620,
            0.05
        );
    }

    if (
        typeof window.nexusWowActivity ===
        "function"
    ) {

        window.nexusWowActivity(
            "Lab",
            "Tryb: " + mode
        );
    }
}

function labShock() {

    pulseBoost(2.8);

    if (
        typeof playBeep ===
        "function"
    ) {

        playBeep(
            240,
            0.12
        );
    }

    if (
        typeof showNotification ===
        "function"
    ) {

        showNotification(
            "Lab",
            "Impuls neuralny"
        );
    }

    if (
        typeof window.nexusWowPulseBurst ===
        "function"
    ) {

        window.nexusWowPulseBurst(
            "lab"
        );
    }
}


/* =========================================
   START PULSE PO BOOT
========================================= */

var _oldAfterBoot =
    window.afterBoot;

window.afterBoot =
    function () {

        if (
            typeof _oldAfterBoot ===
            "function"
        ) {

            _oldAfterBoot();
        }

        try {

            initNeuralPulse();

        } catch (e) {

            console.error(
                "[NEXUS] Neural Pulse:",
                e
            );
        }
    };


/* =========================================
   ŁADOWANIE WOW + WOW2
========================================= */

(function loadWowModules() {

    if (
        window.__nexusWowLoaderV2
    ) {
        return;
    }

    window.__nexusWowLoaderV2 =
        true;

    function load(
        src,
        done
    ) {

        var s =
            document.createElement(
                "script"
            );

        s.src =
            src;

        s.async =
            false;

        s.onload =
            function () {

                if (
                    typeof done ===
                    "function"
                ) {

                    done();
                }
            };

        s.onerror =
            function () {

                console.warn(
                    "[NEXUS] Brak modułu:",
                    src
                );

                if (
                    typeof done ===
                    "function"
                ) {

                    done();
                }
            };

        document.head.appendChild(
            s
        );
    }

    load(
        "js/js/wow.js",
        function () {

            load(
                "js/js/wow2.js"
            );
        }
    );

})();

// === END PULSE.JS ===
