/* =========================================================
   NEXUS OS — WOW MODULE v1.1

   FULL VOICE
   NEXUS BROWSER
   NEXUS ARCADE
   PERSONALIZATION
   NEXUS LIVE DESKTOP

   Bez bibliotek zewnętrznych.
========================================================= */

"use strict";

(function () {

    if (
        window.NEXUS_WOW &&
        window.NEXUS_WOW.booted
    ) {
        return;
    }

    var N =
        window.NEXUS_WOW = {

            version: "1.1",

            booted: false,

            live:
                localStorage.getItem(
                    "nexus-wow-live"
                ) !== "0",

            wake:
                localStorage.getItem(
                    "nexus-wow-wake"
                ) !== "0",

            wakeWord:
                "hej nexus",

            theme:
                localStorage.getItem(
                    "nexus-wow-theme"
                ) || "obsidian",

            ambient:
                localStorage.getItem(
                    "nexus-wow-ambient"
                ) !== "0",

            activity: [],

            browser: {
                history: [],
                index: -1,
                current: ""
            },

            game: {
                name: "",
                raf: 0,
                timer: 0
            }
        };


    /* =====================================================
       TEMATY
    ===================================================== */

    var THEMES = {

        obsidian: {
            name: "Obsidian",
            accent: "#7c5cff",
            accent2: "#00d9ff",
            bg: "#07090d",
            wallpaper: "aurora"
        },

        cyber: {
            name: "Cyber",
            accent: "#00f0ff",
            accent2: "#00ff91",
            bg: "#020b0d",
            wallpaper: "grid"
        },

        aurora: {
            name: "Aurora",
            accent: "#9a7cff",
            accent2: "#ff6bd6",
            bg: "#080714",
            wallpaper: "aurora"
        },

        midnight: {
            name: "Midnight",
            accent: "#638cff",
            accent2: "#8da6ff",
            bg: "#050815",
            wallpaper: "stars"
        },

        matrix: {
            name: "Matrix",
            accent: "#30ff70",
            accent2: "#b7ff3c",
            bg: "#020604",
            wallpaper: "matrix"
        },

        ember: {
            name: "Ember",
            accent: "#ff7a59",
            accent2: "#ffd166",
            bg: "#100806",
            wallpaper: "ember"
        }
    };


    /* =====================================================
       NARZĘDZIA
    ===================================================== */

    function esc(v) {

        if (
            typeof window.escapeHTML ===
            "function"
        ) {
            return window.escapeHTML(v);
        }

        return String(v).replace(
            /[&<>\"']/g,
            function (c) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#039;"
                }[c];
            }
        );
    }


    function notify(
        title,
        message
    ) {

        if (
            typeof window.showNotification ===
            "function"
        ) {

            window.showNotification(
                title,
                message
            );
        }
    }


    function pulse(mult) {

        if (
            typeof window.pulseBoost ===
            "function"
        ) {

            window.pulseBoost(
                mult || 1.3
            );
        }
    }


    function beep(
        freq,
        dur
    ) {

        if (
            typeof window.playBeep ===
            "function"
        ) {

            window.playBeep(
                freq || 600,
                dur || 0.06
            );
        }
    }


    function emit(
        type,
        detail
    ) {

        var evt = {

            time:
                Date.now(),

            type:
                type,

            detail:
                String(
                    detail || ""
                )
        };


        N.activity.push(evt);


        if (
            N.activity.length > 20
        ) {

            N.activity.shift();
        }


        try {

            document.dispatchEvent(
                new CustomEvent(
                    "nexus:activity",
                    {
                        detail: evt
                    }
                )
            );

        } catch (e) {}


        pulse(
            type === "error"
                ? 2
                : 1.25
        );
    }


    window.nexusWowActivity =
        function (
            type,
            detail
        ) {

            emit(
                "activity",
                type +
                    (
                        detail
                            ? " — " +
                              detail
                            : ""
                    )
            );
        };


    window.nexusWowPulseBurst =
        function () {

            pulse(3);

            try {

                document.body.classList.add(
                    "nw-pulse-burst"
                );

                setTimeout(
                    function () {

                        document.body.classList.remove(
                            "nw-pulse-burst"
                        );

                    },
                    420
                );

            } catch (e) {}
        };


    /* =====================================================
       STYLE
    ===================================================== */

    function installStyle() {

        if (
            document.getElementById(
                "nexusWowStyle"
            )
        ) {
            return;
        }


        var s =
            document.createElement(
                "style"
            );

        s.id =
            "nexusWowStyle";


        s.textContent = `

/* ===============================
   LIVE DESKTOP
=============================== */

#nexusWowLive {

    position: fixed;

    left: 18px;
    bottom: 88px;

    width: 310px;

    z-index: 7800;

    pointer-events: none;
}


.nw-card {

    pointer-events: auto;

    background:
        rgba(
            8,
            10,
            16,
            .72
        );

    backdrop-filter:
        blur(25px);

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .10
        );

    border-radius:
        20px;

    padding:
        15px;

    box-shadow:
        0 18px 60px
        rgba(0,0,0,.35),

        0 0 55px
        var(
            --nw-glow,
            rgba(
                124,
                92,
                255,
                .15
            )
        );
}


.nw-head {

    display: flex;

    justify-content:
        space-between;

    align-items:
        center;

    font-size:
        11px;

    letter-spacing:
        1.2px;

    text-transform:
        uppercase;

    opacity:
        .76;
}


.nw-dot {

    width:
        7px;

    height:
        7px;

    border-radius:
        50%;

    display:
        inline-block;

    margin-right:
        7px;

    background:
        var(--nexus-success);

    box-shadow:
        0 0 12px
        var(--nexus-success);

    animation:
        nwBlink 1.5s infinite;
}


@keyframes nwBlink {

    50% {
        opacity:
            .3;
    }
}


.nw-clock {

    font-size:
        29px;

    font-weight:
        250;

    letter-spacing:
        -1px;

    margin-top:
        6px;
}


.nw-date {

    font-size:
        11px;

    opacity:
        .45;

    margin-bottom:
        12px;
}


.nw-grid {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        8px;
}


.nw-stat {

    padding:
        9px;

    border-radius:
        12px;

    background:
        rgba(
            255,
            255,
            255,
            .035
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .06
        );
}


.nw-stat b {

    display:
        block;

    font-size:
        10px;

    opacity:
        .48;

    text-transform:
        uppercase;
}


.nw-stat strong {

    display:
        block;

    margin-top:
        4px;

    font-size:
        13px;
}


.nw-bars {

    display:
        flex;

    gap:
        3px;

    height:
        16px;

    align-items:
        flex-end;

    margin-top:
        6px;
}


.nw-bars i {

    width:
        5px;

    border-radius:
        5px;

    background:
        linear-gradient(
            to top,
            var(--nexus-accent),
            var(--nexus-accent-2)
        );

    animation:
        nwBar
        1.05s
        ease-in-out
        infinite;
}


.nw-bars i:nth-child(2) {
    animation-delay:
        -.18s;
}


.nw-bars i:nth-child(3) {
    animation-delay:
        -.36s;
}


.nw-bars i:nth-child(4) {
    animation-delay:
        -.54s;
}


.nw-bars i:nth-child(5) {
    animation-delay:
        -.72s;
}


@keyframes nwBar {

    0%,100% {

        height:
            4px;

        opacity:
            .35;
    }

    50% {

        height:
            15px;

        opacity:
            1;
    }
}


.nw-last {

    margin-top:
        10px;

    padding-top:
        10px;

    border-top:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );

    font-size:
        11px;

    opacity:
        .62;

    white-space:
        nowrap;

    overflow:
        hidden;

    text-overflow:
        ellipsis;
}


.nw-actions {

    display:
        flex;

    gap:
        6px;

    margin-top:
        9px;
}


.nw-actions button {

    flex:
        1;

    padding:
        8px 7px;

    border-radius:
        10px;

    background:
        rgba(
            255,
            255,
            255,
            .055
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .06
        );

    font-size:
        10px;
}


.nw-actions button:hover {

    background:
        rgba(
            124,
            92,
            255,
            .18
        );
}


/* ===============================
   AMBIENT AURA
=============================== */

#nexusWowAura {

    position:
        fixed;

    inset:
        0;

    z-index:
        1;

    pointer-events:
        none;

    overflow:
        hidden;

    opacity:
        .55;
}


.nw-aura {

    position:
        absolute;

    border-radius:
        50%;

    filter:
        blur(75px);

    mix-blend-mode:
        screen;

    animation:
        nwFloat
        18s
        ease-in-out
        infinite;
}


.nw-aura.a {

    width:
        34vw;

    height:
        34vw;

    left:
        -10vw;

    top:
        12vh;

    background:
        var(--nw-aura-a);
}


.nw-aura.b {

    width:
        29vw;

    height:
        29vw;

    right:
        -8vw;

    top:
        10vh;

    background:
        var(--nw-aura-b);

    animation-delay:
        -7s;
}


.nw-aura.c {

    width:
        24vw;

    height:
        24vw;

    left:
        42vw;

    bottom:
        -9vw;

    background:
        var(--nw-aura-a);

    animation-delay:
        -12s;
}


@keyframes nwFloat {

    50% {

        transform:
            translate(
                4vw,
                -3vh
            )
            scale(
                1.15
            );

        opacity:
            .75;
    }
}


/* ===============================
   WALLPAPERS
=============================== */

body.nw-wall-grid #desktop {

    background-image:

        linear-gradient(
            rgba(
                124,
                92,
                255,
                .05
            )
            1px,
            transparent
            1px
        ),

        linear-gradient(
            90deg,
            rgba(
                0,
                217,
                255,
                .045
            )
            1px,
            transparent
            1px
        ),

        radial-gradient(
            circle at 50% 45%,
            var(--nw-glow),
            transparent 60%
        ),

        linear-gradient(
            135deg,
            #05060a,
            #070b12 55%,
            #02040a
        );

    background-size:
        42px 42px,
        42px 42px,
        100% 100%,
        100% 100%;
}


body.nw-wall-stars #desktop {

    background-image:

        radial-gradient(
            circle at 15% 25%,
            rgba(
                255,
                255,
                255,
                .7
            )
            0 1px,
            transparent
            1.8px
        ),

        radial-gradient(
            circle at 75% 30%,
            rgba(
                255,
                255,
                255,
                .5
            )
            0 1px,
            transparent
            1.8px
        ),

        radial-gradient(
            circle at 55% 78%,
            rgba(
                255,
                255,
                255,
                .45
            )
            0 1px,
            transparent
            1.8px
        ),

        linear-gradient(
            135deg,
            var(--nexus-bg),
            #050813
        );

    background-size:
        220px 180px,
        260px 220px,
        190px 180px,
        100% 100%;
}


body.nw-wall-matrix #desktop {

    background-image:

        repeating-linear-gradient(
            90deg,
            rgba(
                48,
                255,
                112,
                .028
            )
            0 1px,
            transparent
            1px 35px
        ),

        linear-gradient(
            180deg,
            rgba(
                0,
                0,
                0,
                .1
            ),
            rgba(
                0,
                20,
                8,
                .5
            )
        ),

        radial-gradient(
            circle at 60% 40%,
            var(--nw-glow),
            transparent 55%
        ),

        linear-gradient(
            135deg,
            #020604,
            #030a05
        );
}


body.nw-wall-ember #desktop {

    background-image:

        radial-gradient(
            circle at 25% 30%,
            rgba(
                255,
                122,
                89,
                .13
            ),
            transparent 30%
        ),

        radial-gradient(
            circle at 80% 70%,
            rgba(
                255,
                209,
                102,
                .1
            ),
            transparent 25%
        ),

        linear-gradient(
            135deg,
            #080504,
            #120906,
            #050303
        );
}


/* ===============================
   BROWSER
=============================== */

.nw-browser {

    height:
        100%;

    display:
        flex;

    flex-direction:
        column;

    min-height:
        0;
}


.nw-browser-bar {

    display:
        flex;

    gap:
        7px;

    margin-bottom:
        10px;
}


.nw-browser-bar button {

    width:
        36px;

    height:
        36px;

    border-radius:
        10px;

    background:
        rgba(
            255,
            255,
            255,
            .06
        );

    font-size:
        15px;
}


.nw-browser-bar input {

    flex:
        1;

    min-width:
        0;

    padding:
        10px 12px;

    border-radius:
        10px;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .09
        );

    background:
        rgba(
            0,
            0,
            0,
            .27
        );

    color:
        #fff;

    outline:
        none;

    user-select:
        text;
}


.nw-browser-body {

    flex:
        1;

    min-height:
        0;

    overflow:
        auto;

    border-radius:
        14px;

    background:
        rgba(
            0,
            0,
            0,
            .23
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .06
        );
}


.nw-home {

    min-height:
        100%;

    padding:
        28px;

    display:
        flex;

    flex-direction:
        column;

    align-items:
        center;

    justify-content:
        center;

    text-align:
        center;

    background:
        radial-gradient(
            circle at 50% 32%,
            var(--nw-glow),
            transparent 50%
        );
}


.nw-logo {

    width:
        76px;

    height:
        76px;

    border-radius:
        23px;

    display:
        grid;

    place-items:
        center;

    font-size:
        31px;

    font-weight:
        800;

    background:
        linear-gradient(
            135deg,
            var(--nexus-accent),
            var(--nexus-accent-2)
        );

    box-shadow:
        0 0 55px
        var(--nw-glow);
}


.nw-home h2 {

    margin-top:
        16px;

    font-size:
        30px;
}


.nw-home p {

    margin-top:
        7px;

    font-size:
        13px;

    opacity:
        .48;
}


.nw-favs {

    display:
        grid;

    grid-template-columns:
        repeat(
            4,
            minmax(
                100px,
                1fr
            )
        );

    gap:
        9px;

    width:
        min(
            650px,
            95%
        );

    margin-top:
        22px;
}


.nw-favs button {

    padding:
        13px;

    text-align:
        left;

    border-radius:
        12px;

    background:
        rgba(
            255,
            255,
            255,
            .045
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );
}


.nw-favs b {

    font-size:
        12px;
}


.nw-favs span {

    display:
        block;

    margin-top:
        4px;

    font-size:
        10px;

    opacity:
        .45;
}


.nw-result {

    padding:
        18px;
}


.nw-result h3 {

    font-size:
        18px;
}


.nw-result .row {

    display:
        flex;

    gap:
        8px;

    flex-wrap:
        wrap;

    margin:
        12px 0;
}


.nw-result button {

    padding:
        8px 11px;

    border-radius:
        9px;

    background:
        rgba(
            124,
            92,
            255,
            .18
        );

    border:
        1px solid
        rgba(
            124,
            92,
            255,
            .25
        );
}


.nw-url {

    font-size:
        11px;

    opacity:
        .42;

    word-break:
        break-all;
}


.nw-frame {

    width:
        100%;

    height:
        100%;

    border:
        0;

    background:
        #fff;

    display:
        block;
}


/* ===============================
   ARCADE
=============================== */

.nw-games {

    display:
        grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(
                155px,
                1fr
            )
        );

    gap:
        11px;
}


.nw-game-card {

    padding:
        15px;

    border-radius:
        16px;

    background:
        rgba(
            255,
            255,
            255,
            .04
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .08
        );

    text-align:
        left;

    transition:
        .18s transform,
        .18s background;
}


.nw-game-card:hover {

    transform:
        translateY(
            -4px
        );

    background:
        rgba(
            124,
            92,
            255,
            .12
        );
}


.nw-game-card .ico {

    font-size:
        30px;
}


.nw-game-card h3 {

    font-size:
        14px;

    margin-top:
        8px;
}


.nw-game-card p {

    font-size:
        10px;

    opacity:
        .46;

    margin-top:
        4px;
}


.nw-stage {

    height:
        100%;

    display:
        flex;

    flex-direction:
        column;

    min-height:
        0;
}


.nw-toolbar {

    display:
        flex;

    align-items:
        center;

    gap:
        8px;

    flex-wrap:
        wrap;

    margin-bottom:
        10px;
}


.nw-toolbar button {

    padding:
        8px 10px;

    border-radius:
        9px;

    background:
        rgba(
            255,
            255,
            255,
            .06
        );

    font-size:
        11px;
}


.nw-canvas-wrap {

    flex:
        1;

    min-height:
        280px;

    border-radius:
        14px;

    overflow:
        hidden;

    background:
        rgba(
            0,
            0,
            0,
            .26
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );
}


.nw-canvas {

    width:
        100%;

    height:
        100%;

    display:
        block;
}


.nw-help {

    font-size:
        11px;

    opacity:
        .43;

    margin-top:
        8px;
}


/* ===============================
   PERSONALIZACJA
=============================== */

.nw-themes {

    display:
        grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(
                145px,
                1fr
            )
        );

    gap:
        11px;
}


.nw-theme {

    padding:
        12px;

    border-radius:
        15px;

    background:
        rgba(
            255,
            255,
            255,
            .035
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .08
        );

    text-align:
        left;
}


.nw-theme.active {

    box-shadow:
        0 0 0 1px
        var(--nexus-accent),

        0 0 26px
        var(--nw-glow);
}


.nw-theme-preview {

    height:
        60px;

    border-radius:
        10px;

    margin-bottom:
        9px;

    position:
        relative;

    overflow:
        hidden;
}


.nw-theme-preview::after {

    content:
        "";

    position:
        absolute;

    inset:
        0;

    background:
        radial-gradient(
            circle at 30% 35%,
            rgba(
                255,
                255,
                255,
                .35
            ),
            transparent 13%
        );

    opacity:
        .5;
}


.nw-theme b {

    display:
        block;

    font-size:
        12px;
}


.nw-theme small {

    display:
        block;

    margin-top:
        4px;

    font-size:
        10px;

    opacity:
        .43;
}


.nw-personal-row {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        9px;

    margin-top:
        12px;
}


.nw-toggle {

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    padding:
        11px 12px;

    border-radius:
        12px;

    background:
        rgba(
            255,
            255,
            255,
            .035
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );

    font-size:
        11px;
}


.nw-toggle button {

    width:
        42px;

    height:
        23px;

    border-radius:
        999px;

    background:
        rgba(
            255,
            255,
            255,
            .1
        );

    position:
        relative;
}


.nw-toggle button::after {

    content:
        "";

    position:
        absolute;

    width:
        17px;

    height:
        17px;

    top:
        3px;

    left:
        3px;

    border-radius:
        50%;

    background:
        rgba(
            255,
            255,
            255,
            .75
        );

    transition:
        .18s;
}


.nw-toggle button.on {

    background:
        linear-gradient(
            90deg,
            var(--nexus-accent),
            var(--nexus-accent-2)
        );
}


.nw-toggle button.on::after {

    transform:
        translateX(
            19px
        );

    background:
        #fff;
}


/* ===============================
   PULSE EFFECT
=============================== */

.nw-pulse-burst #desktop {

    animation:
        nwDesktopPulse
        .42s
        ease-out;
}


@keyframes nwDesktopPulse {

    50% {

        transform:
            scale(
                1.008
            );

        filter:
            brightness(
                1.16
            );
    }
}


/* ===============================
   RESPONSIVE
=============================== */

@media (
    max-width: 700px
) {

    #nexusWowLive {

        left:
            10px;

        right:
            10px;

        width:
            auto;

        bottom:
            165px;
    }

    .nw-favs {

        grid-template-columns:
            1fr 1fr;
    }

    .nw-personal-row {

        grid-template-columns:
            1fr;
    }
}

        `;


        document.head.appendChild(s);
    }


    /* =====================================================
       LIVE AURA
    ===================================================== */

    function createAura() {

        if (
            document.getElementById(
                "nexusWowAura"
            )
        ) {
            return;
        }


        var aura =
            document.createElement(
                "div"
            );

        aura.id =
            "nexusWowAura";


        aura.innerHTML =

            '<div class="nw-aura a"></div>' +
            '<div class="nw-aura b"></div>' +
            '<div class="nw-aura c"></div>';


        document.body.appendChild(
            aura
        );
    }


    function applyTheme(
        name,
        silent
    ) {

        var theme =
            THEMES[name] ||
            THEMES.obsidian;


        N.theme =
            name;


        localStorage.setItem(
            "nexus-wow-theme",
            name
        );


        var root =
            document.documentElement;


        root.style.setProperty(
            "--nexus-accent",
            theme.accent
        );


        root.style.setProperty(
            "--nexus-accent-2",
            theme.accent2
        );


        root.style.setProperty(
            "--nexus-bg",
            theme.bg
        );


        root.style.setProperty(
            "--nw-glow",
            theme.accent
        );


        root.style.setProperty(
            "--nw-aura-a",
            theme.accent
        );


        root.style.setProperty(
            "--nw-aura-b",
            theme.accent2
        );


        if (
            window.NEXUS &&
            NEXUS.settings
        ) {

            NEXUS.settings.accent =
                theme.accent;

            NEXUS.settings.accent2 =
                theme.accent2;

            NEXUS.settings.theme =
                name;

            try {

                if (
                    typeof saveState ===
                    "function"
                ) {

                    saveState();
                }

            } catch (e) {}
        }


        document.body.classList.remove(
            "nw-wall-grid",
            "nw-wall-stars",
            "nw-wall-matrix",
            "nw-wall-ember"
        );


        if (
            theme.wallpaper ===
            "grid"
        ) {

            document.body.classList.add(
                "nw-wall-grid"
            );

        } else if (
            theme.wallpaper ===
            "stars"
        ) {

            document.body.classList.add(
                "nw-wall-stars"
            );

        } else if (
            theme.wallpaper ===
            "matrix"
        ) {

            document.body.classList.add(
                "nw-wall-matrix"
            );

        } else if (
            theme.wallpaper ===
            "ember"
        ) {

            document.body.classList.add(
                "nw-wall-ember"
            );
        }


        if (!silent) {

            notify(
                "Personalizacja",
                "Motyw: " +
                    theme.name
            );

            emit(
                "theme",
                theme.name
            );

            beep(
                720,
                .06
            );
        }


        renderPersonalization();
        renderLive();
    }


    function renderPersonalization() {

        var box =
            document.getElementById(
                "nwThemeGrid"
            );

        if (!box) return;


        var html = "";


        Object.keys(
            THEMES
        ).forEach(
            function (key) {

                var t =
                    THEMES[key];


                var selected =
                    N.theme === key
                        ? " active"
                        : "";


                html +=

                    '<button type="button" class="nw-theme' +
                    selected +
                    '" onclick="window.NEXUS_WOW.setTheme(\'' +
                    key +
                    '\')">' +

                    '<div class="nw-theme-preview" style="background:linear-gradient(135deg,' +
                    t.accent +
                    ',' +
                    t.accent2 +
                    ' 60%,' +
                    t.bg +
                    ')"></div>' +

                    "<b>" +
                    esc(t.name) +
                    "</b>" +

                    "<small>" +
                    esc(
                        t.accent +
                        " · " +
                        t.accent2
                    ) +
                    "</small>" +

                    "</button>";
            }
        );


        box.innerHTML =
            html;


        var liveBtn =
            document.getElementById(
                "nwLiveToggle"
            );

        var wakeBtn =
            document.getElementById(
                "nwWakeToggle"
            );

        var ambientBtn =
            document.getElementById(
                "nwAmbientToggle"
            );


        if (liveBtn) {

            liveBtn.classList.toggle(
                "on",
                N.live
            );
        }


        if (wakeBtn) {

            wakeBtn.classList.toggle(
                "on",
                N.wake
            );
        }


        if (ambientBtn) {

            ambientBtn.classList.toggle(
                "on",
                N.ambient
            );
        }
    }


    N.setTheme =
        function (name) {

            if (
                !THEMES[name]
            ) {
                return;
            }

            applyTheme(
                name,
                false
            );
        };


    N.toggleLive =
        function () {

            N.live =
                !N.live;

            localStorage.setItem(
                "nexus-wow-live",
                N.live
                    ? "1"
                    : "0"
            );

            renderLive();

            notify(
                "Live Desktop",
                N.live
                    ? "Włączony"
                    : "Wyłączony"
            );
        };


    N.toggleWake =
        function () {

            N.wake =
                !N.wake;

            localStorage.setItem(
                "nexus-wow-wake",
                N.wake
                    ? "1"
                    : "0"
            );

            notify(
                "NEXUS Voice",
                N.wake
                    ? "Wake word: Hej Nexus"
                    : "Wake word wyłączony"
            );
        };


    N.toggleAmbient =
        function () {

            N.ambient =
                !N.ambient;

            localStorage.setItem(
                "nexus-wow-ambient",
                N.ambient
                    ? "1"
                    : "0"
            );

            applyAmbient();

            notify(
                "NEXUS Live",
                N.ambient
                    ? "Ambient ON"
                    : "Ambient OFF"
            );
        };


    function applyAmbient() {

        var aura =
            document.getElementById(
                "nexusWowAura"
            );

        if (!aura) return;

        aura.style.display =
            N.ambient
                ? "block"
                : "none";
    }


    /* =====================================================
       LIVE DESKTOP
    ===================================================== */

    function createLive() {

        if (
            document.getElementById(
                "nexusWowLive"
            )
        ) {
            return;
        }


        var el =
            document.createElement(
                "div"
            );

        el.id =
            "nexusWowLive";


        el.innerHTML = `

            <div class="nw-card">

                <div class="nw-head">

                    <span>
                        <span class="nw-dot"></span>
                        NEXUS LIVE
                    </span>

                    <span id="nwLiveMode">
                        ONLINE
                    </span>

                </div>


                <div
                    class="nw-clock"
                    id="nwLiveClock"
                >
                    00:00:00
                </div>


                <div
                    class="nw-date"
                    id="nwLiveDate"
                >
                    ---
                </div>


                <div class="nw-grid">

                    <div class="nw-stat">

                        <b>Rdzeń</b>

                        <strong
                            id="nwCoreState"
                        >
                            ONLINE
                        </strong>

                    </div>


                    <div class="nw-stat">

                        <b>Aktywność</b>

                        <strong
                            id="nwActivityValue"
                        >
                            0%
                        </strong>

                    </div>


                    <div class="nw-stat">

                        <b>Motyw</b>

                        <strong
                            id="nwThemeValue"
                        >
                            Obsidian
                        </strong>

                    </div>


                    <div class="nw-stat">

                        <b>Moduł</b>

                        <strong
                            id="nwModuleValue"
                        >
                            GOTOWY
                        </strong>

                    </div>

                </div>


                <div
                    class="nw-bars"
                    id="nwBars"
                >
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                </div>


                <div
                    class="nw-last"
                    id="nwLastActivity"
                >
                    Brak ostatniej aktywności
                </div>


                <div class="nw-actions">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.toggleLive()"
                    >
                        Live
                    </button>

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openBrowser()"
                    >
                        Browser
                    </button>

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openArcade()"
                    >
                        Arcade
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            el
        );
    }


    function renderLive() {

        var box =
            document.getElementById(
                "nexusWowLive"
            );

        if (!box) return;


        box.style.display =
            N.live
                ? "block"
                : "none";


        var now =
            new Date();


        var time =
            now.toLocaleTimeString(
                "pl-PL",
                {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


        var date =
            now.toLocaleDateString(
                "pl-PL",
                {
                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long"
                }
            );


        var clock =
            document.getElementById(
                "nwLiveClock"
            );

        var dateEl =
            document.getElementById(
                "nwLiveDate"
            );


        if (clock) {
            clock.textContent =
                time;
        }


        if (dateEl) {
            dateEl.textContent =
                date;
        }


        var themeValue =
            document.getElementById(
                "nwThemeValue"
            );


        var theme =
            THEMES[N.theme] ||
            THEMES.obsidian;


        if (themeValue) {

            themeValue.textContent =
                theme.name;
        }


        var activityValue =
            document.getElementById(
                "nwActivityValue"
            );


        var activity =
            N.activity.length
                ? Math.min(
                    100,
                    N.activity.length *
                    6 +
                    Math.floor(
                        Math.random() * 12
                    )
                )
                : 8;


        if (
            typeof window.NEXUS_PULSE !==
            "undefined" &&
            window.NEXUS_PULSE.boost
        ) {

            activity =
                Math.max(
                    activity,
                    Math.min(
                        100,
                        Math.floor(
                            window.NEXUS_PULSE.boost *
                            24
                        )
                    )
                );
        }


        if (activityValue) {

            activityValue.textContent =
                activity +
                "%";
        }


        var moduleValue =
            document.getElementById(
                "nwModuleValue"
            );


        if (
            moduleValue
        ) {

            moduleValue.textContent =
                N.browser.current
                    ? "BROWSER"
                    : (
                        N.game.name
                            ? N.game.name.toUpperCase()
                            : "GOTOWY"
                    );
        }


        var last =
            document.getElementById(
                "nwLastActivity"
            );


        if (last) {

            if (
                N.activity.length
            ) {

                var a =
                    N.activity[
                        N.activity.length - 1
                    ];

                last.textContent =
                    a.detail || "Aktywność";

            } else {

                last.textContent =
                    "Brak ostatniej aktywności";
            }
        }
    }


    function record(
        text
    ) {

        emit(
            "live",
            text
        );

        renderLive();
    }


    document.addEventListener(
        "nexus:activity",
        function () {

            renderLive();

        }
    );


    /* =====================================================
       BROWSER
    ===================================================== */

    function ensureBrowserWindow() {

        var win =
            document.getElementById(
                "nexusWowBrowserWindow"
            );

        if (win) {
            return win;
        }


        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusWowBrowserWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "820px";

        win.style.height =
            "620px";


        win.innerHTML = `

            <div class="window-header">

                <div class="window-title">
                    ◉ NEXUS Browser
                </div>

                <div class="window-controls">

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusWowBrowserWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusWowBrowserWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexusWowBrowserWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>


            <div
                class="window-body"
                style="padding:12px;overflow:hidden"
            >

                <div class="nw-browser">

                    <div class="nw-browser-bar">

                        <button
                            type="button"
                            onclick="window.NEXUS_WOW.browserBack()"
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onclick="window.NEXUS_WOW.browserForward()"
                        >
                            →
                        </button>

                        <button
                            type="button"
                            onclick="window.NEXUS_WOW.browserHome()"
                        >
                            ⌂
                        </button>

                        <input
                            id="nwBrowserAddress"
                            type="text"
                            placeholder="Wpisz adres lub szukaj…"
                            onkeydown="window.NEXUS_WOW.browserKey(event)"
                        >

                        <button
                            type="button"
                            onclick="window.NEXUS_WOW.navigateBrowser()"
                        >
                            →
                        </button>

                    </div>


                    <div
                        id="nwBrowserBody"
                        class="nw-browser-body"
                    ></div>

                </div>

            </div>

        `;


        document
            .getElementById(
                "desktop"
            )
            .appendChild(
                win
            );


        return win;
    }


    function browserHomeHTML() {

        return `

            <div class="nw-home">

                <div class="nw-logo">
                    N
                </div>

                <h2>
                    NEXUS Browser
                </h2>

                <p>
                    Internet w przestrzeni NEXUS
                </p>


                <div class="nw-favs">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.searchWeb('Google')"
                    >
                        <b>Google</b>
                        <span>Wyszukiwarka</span>
                    </button>


                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.searchWeb('YouTube')"
                    >
                        <b>YouTube</b>
                        <span>Wideo</span>
                    </button>


                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.searchWeb('Wikipedia')"
                    >
                        <b>Wikipedia</b>
                        <span>Encyklopedia</span>
                    </button>


                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.searchWeb('GitHub')"
                    >
                        <b>GitHub</b>
                        <span>Kod</span>
                    </button>

                </div>

            </div>
        `;
    }


    function showBrowserHome() {

        var body =
            document.getElementById(
                "nwBrowserBody"
            );

        if (!body) return;

        body.innerHTML =
            browserHomeHTML();


        N.browser.current =
            "";


        var address =
            document.getElementById(
                "nwBrowserAddress"
            );


        if (address) {
            address.value = "";
        }


        renderLive();
    }


    function normalizeURL(
        value
    ) {

        var v =
            String(
                value || ""
            ).trim();


        if (!v) {
            return "";
        }


        if (
            /^https?:\\/\\//i.test(v)
        ) {

            return v;

        }


        if (
            /^[a-z0-9.-]+\\.[a-z]{2,}$/i.test(v)
        ) {

            return "https://" + v;
        }


        return (
            "https://www.google.com/search?q=" +
            encodeURIComponent(v)
        );
    }


    function navigateBrowser() {

        var input =
            document.getElementById(
                "nwBrowserAddress"
            );


        if (!input) return;


        var value =
            input.value.trim();


        if (!value) {
            browserHome();
            return;
        }


        var url =
            normalizeURL(
                value
            );


        N.browser.history =
            N.browser.history.slice(
                0,
                N.browser.index + 1
            );


        N.browser.history.push(
            url
        );


        N.browser.index =
            N.browser.history.length -
            1;

        N.browser.current =
            url;


        renderBrowserURL(
            url
        );


        record(
            "Browser → " +
            url
        );
    }


    function renderBrowserURL(
        url
    ) {

        var body =
            document.getElementById(
                "nwBrowserBody"
            );


        if (!body) return;


        var safe =
            esc(url);


        body.innerHTML = `

            <div
                class="nw-result"
                style="height:100%;display:flex;flex-direction:column"
            >

                <h3>
                    Otwieranie strony
                </h3>

                <div class="nw-url">
                    ${safe}
                </div>


                <div class="row">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openExternal('${esc(url).replace(/'/g, "\\'")}')"
                    >
                        Otwórz w nowej karcie
                    </button>


                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.browserReload()"
                    >
                        Odśwież
                    </button>

                </div>


                <div style="flex:1;min-height:0;border-radius:12px;overflow:hidden">

                    <iframe
                        id="nwBrowserFrame"
                        class="nw-frame"
                        src="${safe}"
                        referrerpolicy="no-referrer"
                        sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
                    ></iframe>

                </div>

            </div>

        `;


        var frame =
            document.getElementById(
                "nwBrowserFrame"
            );


        if (frame) {

            frame.addEventListener(
                "load",
                function () {

                    record(
                        "Browser załadował stronę"
                    );
                }
            );


            frame.addEventListener(
                "error",
                function () {

                    emit(
                        "error",
                        "Browser nie mógł załadować strony"
                    );
                }
            );
        }
    }


    function browserKey(
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            navigateBrowser();
        }
    }


    function browserBack() {

        if (
            N.browser.index <= 0
        ) {

            notify(
                "Browser",
                "Brak poprzedniej strony"
            );

            return;
        }


        N.browser.index--;

        var url =
            N.browser.history[
                N.browser.index
            ];


        N.browser.current =
            url;


        var input =
            document.getElementById(
                "nwBrowserAddress"
            );


        if (input) {
            input.value =
                url;
        }


        renderBrowserURL(
            url
        );

        record(
            "Browser ← Wstecz"
        );
    }


    function browserForward() {

        if (
            N.browser.index >=
            N.browser.history.length - 1
        ) {

            notify(
                "Browser",
                "Brak następnej strony"
            );

            return;
        }


        N.browser.index++;

        var url =
            N.browser.history[
                N.browser.index
            ];


        N.browser.current =
            url;


        var input =
            document.getElementById(
                "nwBrowserAddress"
            );


        if (input) {
            input.value =
                url;
        }


        renderBrowserURL(
            url
        );

        record(
            "Browser → Dalej"
        );
    }


    function browserReload() {

        var frame =
            document.getElementById(
                "nwBrowserFrame"
            );


        if (
            frame
        ) {

            try {

                frame.src =
                    frame.src;

            } catch (e) {}

            record(
                "Browser ↻ Odśwież"
            );

            return;
        }


        browserHome();
    }


    function browserHome() {

        ensureBrowserWindow();

        showBrowserHome();

        record(
            "Browser → Start"
        );
    }


    function openExternal(
        url
    ) {

        try {

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

            notify(
                "NEXUS Browser",
                "Otwarto w nowej karcie"
            );

        } catch (e) {

            emit(
                "error",
                "Nie udało się otworzyć strony"
            );
        }
    }


    function searchWeb(
        query
    ) {

        var input =
            document.getElementById(
                "nwBrowserAddress"
            );


        if (!input) {

            openBrowser();

            setTimeout(
                function () {

                    searchWeb(
                        query
                    );

                },
                150
            );

            return;
        }


        input.value =
            query;


        navigateBrowser();
    }


    N.openBrowser =
        function () {

            var win =
                ensureBrowserWindow();


            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexusWowBrowserWindow"
                );

            } else {

                win.style.display =
                    "flex";
            }


            setTimeout(
                function () {

                    if (
                        !N.browser.current
                    ) {
                        showBrowserHome();
                    }

                },
                100
            );


            record(
                "NEXUS Browser uruchomiony"
            );
        };


    N.browserBack =
        browserBack;

    N.browserForward =
        browserForward;

    N.browserHome =
        browserHome;

    N.browserReload =
        browserReload;

    N.browserKey =
        browserKey;

    N.navigateBrowser =
        navigateBrowser;

    N.openExternal =
        openExternal;

    N.searchWeb =
        searchWeb;


    /* =====================================================
       ARCADE
    ===================================================== */

    function ensureArcadeWindow() {

        var win =
            document.getElementById(
                "nexusArcadeWindow"
            );


        if (win) {
            return win;
        }


        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusArcadeWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "760px";

        win.style.height =
            "560px";


        win.innerHTML = `

            <div class="window-header">

                <div class="window-title">
                    🎮 NEXUS Arcade
                </div>

                <div class="window-controls">

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusArcadeWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusArcadeWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexusArcadeWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>


            <div
                class="window-body"
                id="nwArcadeBody"
            ></div>

        `;


        document
            .getElementById(
                "desktop"
            )
            .appendChild(
                win
            );


        renderArcadeHome();


        return win;
    }


    function renderArcadeHome() {

        var body =
            document.getElementById(
                "nwArcadeBody"
            );

        if (!body) return;


        body.innerHTML = `

            <div>

                <h2
                    style="
                        font-size:24px;
                        margin-bottom:6px
                    "
                >
                    NEXUS Arcade
                </h2>


                <p
                    style="
                        font-size:12px;
                        opacity:.5;
                        margin-bottom:18px
                    "
                >
                    Małe gry. Wielkie ego.
                </p>


                <div class="nw-games">

                    <button
                        type="button"
                        class="nw-game-card"
                        onclick="window.NEXUS_WOW.startGame('snake')"
                    >
                        <div class="ico">
                            🐍
                        </div>

                        <h3>
                            Snake
                        </h3>

                        <p>
                            Klasyczny wąż
                        </p>
                    </button>


                    <button
                        type="button"
                        class="nw-game-card"
                        onclick="window.NEXUS_WOW.startGame('reaction')"
                    >
                        <div class="ico">
                            ⚡
                        </div>

                        <h3>
                            Reaction
                        </h3>

                        <p>
                            Refleks
                        </p>
                    </button>


                    <button
                        type="button"
                        class="nw-game-card"
                        onclick="window.NEXUS_WOW.startGame('memory')"
                    >
                        <div class="ico">
                            🧠
                        </div>

                        <h3>
                            Memory
                        </h3>

                        <p>
                            Zapamiętaj pary
                        </p>
                    </button>


                    <button
                        type="button"
                        class="nw-game-card"
                        onclick="window.NEXUS_WOW.startGame('pong')"
                    >
                        <div class="ico">
                            🏓
                        </div>

                        <h3>
                            Pong
                        </h3>

                        <p>
                            Ty kontra rdzeń
                        </p>
                    </button>

                </div>

            </div>

        `;
    }


    function stopGame() {

        if (
            N.game.raf
        ) {

            cancelAnimationFrame(
                N.game.raf
            );

            N.game.raf =
                0;
        }


        if (
            N.game.timer
        ) {

            clearInterval(
                N.game.timer
            );

            N.game.timer =
                0;
        }


        N.game.name =
            "";
    }


    function openArcade() {

        var win =
            ensureArcadeWindow();


        if (
            typeof window.openWindow ===
            "function"
        ) {

            window.openWindow(
                "nexusArcadeWindow"
            );

        } else {

            win.style.display =
                "flex";
        }


        renderArcadeHome();


        record(
            "NEXUS Arcade uruchomiony"
        );
    }


    function startGame(
        name
    ) {

        ensureArcadeWindow();

        stopGame();

        N.game.name =
            name;


        var body =
            document.getElementById(
                "nwArcadeBody"
            );


        if (!body) return;


        if (name === "snake") {
            gameSnake(body);
        }

        if (name === "reaction") {
            gameReaction(body);
        }

        if (name === "memory") {
            gameMemory(body);
        }

        if (name === "pong") {
            gamePong(body);
        }


        pulse(1.8);

        record(
            "Arcade → " +
                name
        );
    }


    /* =====================================================
       SNAKE
    ===================================================== */

    function gameSnake(
        body
    ) {

        body.innerHTML = `

            <div class="nw-stage">

                <div class="nw-toolbar">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.stopGame();window.NEXUS_WOW.openArcade()"
                    >
                        ← Gry
                    </button>

                    <strong>
                        Snake
                    </strong>

                    <span
                        id="snakeScore"
                        style="margin-left:auto;opacity:.65;font-size:11px"
                    >
                        Wynik: 0
                    </span>

                </div>


                <div class="nw-canvas-wrap">

                    <canvas
                        id="snakeCanvas"
                        class="nw-canvas"
                    ></canvas>

                </div>


                <div class="nw-help">
                    Sterowanie: strzałki / WASD.
                </div>

            </div>

        `;


        var canvas =
            document.getElementById(
                "snakeCanvas"
            );


        if (!canvas) return;


        var ctx =
            canvas.getContext(
                "2d"
            );


        var size =
            20;


        var cols =
            30;


        var rows =
            18;


        var snake = [
            {
                x: 8,
                y: 8
            },
            {
                x: 7,
                y: 8
            },
            {
                x: 6,
                y: 8
            }
        ];


        var dir = {
            x: 1,
            y: 0
        };


        var nextDir = {
            x: 1,
            y: 0
        };


        var food = {
            x: 20,
            y: 8
        };


        var score =
            0;


        function resize() {

            var rect =
                canvas.getBoundingClientRect();

            canvas.width =
                rect.width;

            canvas.height =
                rect.height;

            size =
                Math.max(
                    10,
                    Math.floor(
                        Math.min(
                            rect.width / cols,
                            rect.height / rows
                        )
                    )
                );
        }


        resize();


        function spawnFood() {

            food = {

                x:
                    Math.floor(
                        Math.random() *
                        cols
                    ),

                y:
                    Math.floor(
                        Math.random() *
                        rows
                    )
            };
        }


        function draw() {

            var w =
                canvas.width;

            var h =
                canvas.height;


            ctx.clearRect(
                0,
                0,
                w,
                h
            );


            ctx.fillStyle =
                "rgba(4,8,13,.72)";

            ctx.fillRect(
                0,
                0,
                w,
                h
            );


            var sx =
                (w -
                    cols *
                    size) /
                2;


            var sy =
                (h -
                    rows *
                    size) /
                2;


            ctx.strokeStyle =
                "rgba(255,255,255,.035)";


            for (
                var x = 0;
                x <= cols;
                x++
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    sx + x * size,
                    sy
                );

                ctx.lineTo(
                    sx + x * size,
                    sy + rows * size
                );

                ctx.stroke();
            }


            for (
                var y = 0;
                y <= rows;
                y++
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    sx,
                    sy + y * size
                );

                ctx.lineTo(
                    sx + cols * size,
                    sy + y * size
                );

                ctx.stroke();
            }


            ctx.fillStyle =
                getComputedStyle(
                    document.documentElement
                )
                .getPropertyValue(
                    "--nexus-accent-2"
                )
                .trim() ||
                "#00d9ff";


            ctx.beginPath();

            ctx.arc(
                sx +
                    food.x * size +
                    size / 2,

                sy +
                    food.y * size +
                    size / 2,

                size * 0.34,

                0,
                Math.PI * 2
            );

            ctx.fill();


            snake.forEach(
                function (p, index) {

                    var accent =
                        getComputedStyle(
                            document.documentElement
                        )
                        .getPropertyValue(
                            "--nexus-accent"
                        )
                        .trim() ||
                        "#7c5cff";


                    ctx.fillStyle =
                        index === 0
                            ? "#ffffff"
                            : accent;


                    ctx.globalAlpha =
                        index === 0
                            ? 1
                            : Math.max(
                                .35,
                                1 -
                                index /
                                snake.length
                            );


                    ctx.fillRect(

                        sx +
                            p.x * size +
                            2,

                        sy +
                            p.y * size +
                            2,

                        size - 4,

                        size - 4
                    );

                    ctx.globalAlpha =
                        1;
                }
            );
        }


        function tick() {

            dir =
                nextDir;


            var head =
                {
                    x:
                        snake[0].x +
                        dir.x,

                    y:
                        snake[0].y +
                        dir.y
                };


            if (
                head.x < 0 ||
                head.y < 0 ||
                head.x >= cols ||
                head.y >= rows
            ) {

                gameOver();
                return;
            }


            for (
                var i = 0;
                i < snake.length;
                i++
            ) {

                if (
                    snake[i].x ===
                        head.x &&
                    snake[i].y ===
                        head.y
                ) {

                    gameOver();
                    return;
                }
            }


            snake.unshift(
                head
            );


            if (
                head.x ===
                    food.x &&
                head.y ===
                    food.y
            ) {

                score++;

                var scoreEl =
                    document.getElementById(
                        "snakeScore"
                    );

                if (scoreEl) {

                    scoreEl.textContent =
                        "Wynik: " +
                        score;
                }

                spawnFood();

                pulse(1.4);

            } else {

                snake.pop();
            }


            draw();
        }


        function gameOver() {

            stopGame();

            notify(
                "Snake",
                "Koniec gry. Wynik: " +
                    score
            );

            draw();


            var scoreEl =
                document.getElementById(
                    "snakeScore"
                );

            if (scoreEl) {

                scoreEl.textContent =
                    "Koniec · Wynik: " +
                    score;
            }
        }


        var keyHandler =
            function (e) {

                var k =
                    e.key.toLowerCase();


                if (
                    k === "arrowup" ||
                    k === "w"
                ) {

                    if (
                        dir.y === 0
                    ) {

                        nextDir = {
                            x: 0,
                            y: -1
                        };
                    }

                    e.preventDefault();
                }


                if (
                    k === "arrowdown" ||
                    k === "s"
                ) {

                    if (
                        dir.y === 0
                    ) {

                        nextDir = {
                            x: 0,
                            y: 1
                        };
                    }

                    e.preventDefault();
                }


                if (
                    k === "arrowleft" ||
                    k === "a"
                ) {

                    if (
                        dir.x === 0
                    ) {

                        nextDir = {
                            x: -1,
                            y: 0
                        };
                    }

                    e.preventDefault();
                }


                if (
                    k === "arrowright" ||
                    k === "d"
                ) {

                    if (
                        dir.x === 0
                    ) {

                        nextDir = {
                            x: 1,
                            y: 0
                        };
                    }

                    e.preventDefault();
                }
            };


        document.addEventListener(
            "keydown",
            keyHandler
        );


        N.game.timer =
            setInterval(
                tick,
                120
            );


        window.addEventListener(
            "resize",
            resize
        );


        draw();
    }


    /* =====================================================
       REACTION
    ===================================================== */

    function gameReaction(
        body
    ) {

        body.innerHTML = `

            <div class="nw-stage">

                <div class="nw-toolbar">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openArcade()"
                    >
                        ← Gry
                    </button>

                    <strong>
                        Reaction
                    </strong>

                </div>


                <div
                    style="
                        flex:1;
                        display:grid;
                        place-items:center
                    "
                >

                    <button
                        id="reactionButton"
                        type="button"
                        style="
                            width:min(
                                260px,
                                60%
                            );
                            aspect-ratio:1;
                            border-radius:50%;
                            background:
                                linear-gradient(
                                    135deg,
                                    rgba(
                                        124,
                                        92,
                                        255,
                                        .22
                                    ),
                                    rgba(
                                        0,
                                        217,
                                        255,
                                        .18
                                    )
                                );
                            border:
                                2px solid
                                rgba(
                                    255,
                                    255,
                                    255,
                                    .08
                                );
                            font-size:18px
                        "
                    >
                        Czekaj...
                    </button>

                </div>


                <div
                    id="reactionInfo"
                    class="nw-help"
                >
                    Po zmianie pola kliknij jak najszybciej.
                </div>

            </div>
        `;


        var btn =
            document.getElementById(
                "reactionButton"
            );

        var info =
            document.getElementById(
                "reactionInfo"
            );


        var ready =
            false;

        var start =
            0;

        var timeout =
            setTimeout(
                function () {

                    ready =
                        true;

                    start =
                        performance.now();

                    if (btn) {

                        btn.textContent =
                            "KLIKNIJ!";

                        btn.style.background =
                            "linear-gradient(135deg,#30ff70,#00d9ff)";
                    }

                },
                900 +
                    Math.random() *
                    2800
            );


        if (btn) {

            btn.onclick =
                function () {

                    if (!ready) {

                        clearTimeout(
                            timeout
                        );

                        info.textContent =
                            "Za wcześnie 😈 Spróbuj jeszcze raz.";

                        pulse(1.1);

                        return;
                    }


                    var ms =
                        Math.round(
                            performance.now() -
                            start
                        );


                    info.textContent =
                        "Twój czas: " +
                        ms +
                        " ms";


                    btn.textContent =
                        ms + " ms";


                    ready =
                        false;


                    pulse(
                        ms < 250
                            ? 2
                            : 1.2
                    );


                    setTimeout(
                        function () {

                            startGame(
                                "reaction"
                            );

                        },
                        1200
                    );
                };
        }
    }


    /* =====================================================
       MEMORY
    ===================================================== */

    function gameMemory(
        body
    ) {

        var symbols = [
            "✦",
            "◉",
            "◈",
            "⚡",
            "N",
            "∞",
            "☄",
            "◆"
        ];


        var cards =
            symbols
                .concat(symbols)
                .sort(
                    function () {
                        return Math.random() -
                            0.5;
                    }
                );


        body.innerHTML = `

            <div class="nw-stage">

                <div class="nw-toolbar">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openArcade()"
                    >
                        ← Gry
                    </button>

                    <strong>
                        Memory
                    </strong>

                    <span
                        id="memoryInfo"
                        style="
                            margin-left:auto;
                            font-size:11px;
                            opacity:.6
                        "
                    >
                        0 / 8
                    </span>

                </div>


                <div
                    style="
                        flex:1;
                        display:grid;
                        grid-template-columns:
                            repeat(
                                4,
                                1fr
                            );
                        gap:9px;
                        align-content:center
                    "
                >

                    ${
                        cards
                            .map(
                                function (
                                    s,
                                    i
                                ) {

                                    return `

                                    <button
                                        type="button"
                                        class="memory-card"
                                        data-index="${i}"
                                        style="
                                            aspect-ratio:1;
                                            border-radius:14px;
                                            background:
                                                rgba(
                                                    255,
                                                    255,
                                                    255,
                                                    .05
                                                );
                                            border:
                                                1px solid
                                                rgba(
                                                    255,
                                                    255,
                                                    255,
                                                    .08
                                                );
                                            font-size:28px
                                        "
                                    >
                                        ?
                                    </button>
                                    `;
                                }
                            )
                            .join("")
                    }

                </div>

            </div>
        `;


        var memoryCards =
            Array.from(
                document.querySelectorAll(
                    ".memory-card"
                )
            );


        var open = [];

        var locked =
            false;

        var found =
            0;


        memoryCards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        if (
                            locked ||
                            card.dataset.open ===
                                "1"
                        ) {
                            return;
                        }


                        var index =
                            Number(
                                card.dataset.index
                            );


                        card.dataset.open =
                            "1";

                        card.textContent =
                            cards[index];

                        open.push(
                            card
                        );


                        if (
                            open.length !==
                            2
                        ) {

                            return;
                        }


                        var a =
                            open[0];

                        var b =
                            open[1];


                        var ia =
                            Number(
                                a.dataset.index
                            );

                        var ib =
                            Number(
                                b.dataset.index
                            );


                        if (
                            cards[ia] ===
                            cards[ib]
                        ) {

                            found++;

                            open =
                                [];


                            var info =
                                document.getElementById(
                                    "memoryInfo"
                                );


                            if (info) {

                                info.textContent =
                                    found +
                                    " / 8";
                            }


                            pulse(
                                1.3
                            );


                            if (
                                found ===
                                8
                            ) {

                                notify(
                                    "Memory",
                                    "Wygrana!"
                                );

                                pulse(
                                    2.5
                                );
                            }

                        } else {

                            locked =
                                true;

                            setTimeout(
                                function () {

                                    a.dataset.open =
                                        "0";

                                    b.dataset.open =
                                        "0";

                                    a.textContent =
                                        "?";

                                    b.textContent =
                                        "?";

                                    open =
                                        [];

                                    locked =
                                        false;

                                },
                                600
                            );
                        }
                    }
                );
            }
        );
    }


    /* =====================================================
       PONG
    ===================================================== */

    function gamePong(
        body
    ) {

        body.innerHTML = `

            <div class="nw-stage">

                <div class="nw-toolbar">

                    <button
                        type="button"
                        onclick="window.NEXUS_WOW.openArcade()"
                    >
                        ← Gry
                    </button>

                    <strong>
                        Pong
                    </strong>

                    <span
                        id="pongScore"
                        style="
                            margin-left:auto;
                            opacity:.65;
                            font-size:11px
                        "
                    >
                        Ty 0 : 0 NEXUS
                    </span>

                </div>


                <div class="nw-canvas-wrap">

                    <canvas
                        id="pongCanvas"
                        class="nw-canvas"
                    ></canvas>

                </div>


                <div class="nw-help">
                    Poruszaj myszką lub dotykiem. NEXUS steruje drugą paletką.
                </div>

            </div>
        `;


        var canvas =
            document.getElementById(
                "pongCanvas"
            );


        if (!canvas) return;


        var ctx =
            canvas.getContext(
                "2d"
            );


        var player = {
            y: 0
        };


        var ai = {
            y: 0
        };


        var ball = {
            x: 0,
            y: 0,
            vx: 4,
            vy: 2.4
        };


        var scoreP =
            0;

        var scoreAI =
            0;


        function resize() {

            var rect =
                canvas.getBoundingClientRect();

            canvas.width =
                rect.width;

            canvas.height =
                rect.height;

            player.y =
                canvas.height / 2;

            ai.y =
                canvas.height / 2;

            ball.x =
                canvas.width / 2;

            ball.y =
                canvas.height / 2;
        }


        resize();


        function reset(
            direction
        ) {

            ball.x =
                canvas.width / 2;

            ball.y =
                canvas.height / 2;

            ball.vx =
                direction *
                4;

            ball.vy =
                (
                    Math.random() -
                    0.5
                ) *
                5;
        }


        function movePlayer(
            y
        ) {

            player.y =
                Math.max(
                    50,
                    Math.min(
                        canvas.height - 50,
                        y
                    )
                );
        }


        canvas.addEventListener(
            "mousemove",
            function (e) {

                var rect =
                    canvas.getBoundingClientRect();

                movePlayer(
                    e.clientY -
                        rect.top
                );
            }
        );


        canvas.addEventListener(
            "touchmove",
            function (e) {

                if (
                    !e.touches ||
                    !e.touches[0]
                ) {
                    return;
                }


                var rect =
                    canvas.getBoundingClientRect();


                movePlayer(
                    e.touches[0].clientY -
                        rect.top
                );


                e.preventDefault();
            },
            {
                passive: false
            }
        );


        function draw() {

            var w =
                canvas.width;

            var h =
                canvas.height;


            ctx.fillStyle =
                "rgba(3,5,8,.8)";

            ctx.fillRect(
                0,
                0,
                w,
                h
            );


            ctx.strokeStyle =
                "rgba(255,255,255,.06)";

            ctx.setLineDash([
                6,
                12
            ]);


            ctx.beginPath();

            ctx.moveTo(
                w / 2,
                0
            );

            ctx.lineTo(
                w / 2,
                h
            );

            ctx.stroke();

            ctx.setLineDash([]);


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


            ctx.fillStyle =
                accent;


            ctx.fillRect(
                18,
                player.y - 50,
                10,
                100
            );


            ctx.fillStyle =
                accent2;


            ctx.fillRect(
                w - 28,
                ai.y - 50,
                10,
                100
            );


            var grad =
                ctx.createRadialGradient(
                    ball.x,
                    ball.y,
                    0,
                    ball.x,
                    ball.y,
                    24
                );


            grad.addColorStop(
                0,
                "#fff"
            );

            grad.addColorStop(
                .35,
                accent2
            );

            grad.addColorStop(
                1,
                "transparent"
            );


            ctx.fillStyle =
                grad;


            ctx.beginPath();

            ctx.arc(
                ball.x,
                ball.y,
                24,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#fff";


            ctx.beginPath();

            ctx.arc(
                ball.x,
                ball.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }


        function step() {

            ball.x +=
                ball.vx;

            ball.y +=
                ball.vy;


            if (
                ball.y < 8 ||
                ball.y >
                    canvas.height - 8
            ) {

                ball.vy *=
                    -1;
            }


            ai.y +=
                (
                    ball.y -
                    ai.y
                ) *
                0.055;


            if (
                ball.x < 38 &&
                Math.abs(
                    ball.y -
                    player.y
                ) < 62 &&
                ball.vx < 0
            ) {

                ball.vx *=
                    -1.04;

                pulse(
                    1.25
                );
            }


            if (
                ball.x >
                    canvas.width - 38 &&
                Math.abs(
                    ball.y -
                    ai.y
                ) < 62 &&
                ball.vx > 0
            ) {

                ball.vx *=
                    -1.04;

                pulse(
                    1.25
                );
            }


            if (
                ball.x <
                -20
            ) {

                scoreAI++;

                updateScore();

                reset(1);
            }


            if (
                ball.x >
                canvas.width + 20
            ) {

                scoreP++;

                updateScore();

                reset(-1);
            }


            draw();


            N.game.raf =
                requestAnimationFrame(
                    step
                );
        }


        function updateScore() {

            var s =
                document.getElementById(
                    "pongScore"
                );

            if (s) {

                s.textContent =
                    "Ty " +
                    scoreP +
                    " : " +
                    scoreAI +
                    " NEXUS";
            }


            if (
                scoreP >= 5 ||
                scoreAI >= 5
            ) {

                var result =
                    scoreP >
                    scoreAI
                        ? "Wygrałeś!"
                        : "NEXUS wygrał!";


                notify(
                    "Pong",
                    result
                );


                stopGame();
            }
        }


        N.game.raf =
            requestAnimationFrame(
                step
            );
    }


    N.openArcade =
        openArcade;

    N.startGame =
        startGame;

    N.stopGame =
        stopGame;


    /* =====================================================
       PERSONALIZACJA OKNO
    ===================================================== */

    function ensurePersonalizationWindow() {

        var win =
            document.getElementById(
                "nexusPersonalizationWindow"
            );


        if (win) {

            renderPersonalization();

            return win;
        }


        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusPersonalizationWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "700px";

        win.style.height =
            "560px";


        win.innerHTML = `

            <div class="window-header">

                <div class="window-title">
                    ✺ Personalizacja NEXUS
                </div>

                <div class="window-controls">

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusPersonalizationWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusPersonalizationWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexusPersonalizationWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>


            <div class="window-body">

                <div>

                    <h2
                        style="
                            font-size:24px;
                            margin-bottom:6px
                        "
                    >
                        NEXUS Personalization
                    </h2>


                    <p
                        style="
                            font-size:12px;
                            opacity:.5;
                            margin-bottom:18px
                        "
                    >
                        Zmieniaj wygląd systemu.
                    </p>


                    <div
                        id="nwThemeGrid"
                        class="nw-themes"
                    ></div>


                    <div class="nw-personal-row">

                        <div class="nw-toggle">

                            <span>
                                NEXUS LIVE
                            </span>

                            <button
                                id="nwLiveToggle"
                                type="button"
                                onclick="window.NEXUS_WOW.toggleLive()"
                            ></button>

                        </div>


                        <div class="nw-toggle">

                            <span>
                                Ambient
                            </span>

                            <button
                                id="nwAmbientToggle"
                                type="button"
                                onclick="window.NEXUS_WOW.toggleAmbient()"
                            ></button>

                        </div>


                        <div class="nw-toggle">

                            <span>
                                „Hej Nexus”
                            </span>

                            <button
                                id="nwWakeToggle"
                                type="button"
                                onclick="window.NEXUS_WOW.toggleWake()"
                            ></button>

                        </div>

                    </div>


                    <div
                        style="
                            margin-top:14px;
                            padding:13px;
                            border-radius:13px;
                            background:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    .035
                                );
                            border:
                                1px solid
                                rgba(
                                    255,
                                    255,
                                    255,
                                    .07
                                );
                            font-size:11px;
                            line-height:1.55;
                            opacity:.65
                        "
                    >

                        <b>NEXUS Voice</b><br>

                        Powiedz:
                        „Hej Nexus, otwórz Browser”,
                        „Hej Nexus, uruchom Arcade”,
                        „Hej Nexus, ustaw Matrix”.

                    </div>

                </div>

            </div>

        `;


        document
            .getElementById(
                "desktop"
            )
            .appendChild(
                win
            );


        renderPersonalization();


        return win;
    }


    N.openPersonalization =
        function () {

            ensurePersonalizationWindow();


            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexusPersonalizationWindow"
                );
            }


            renderPersonalization();


            record(
                "Personalizacja otwarta"
            );
        };


    /* =====================================================
       VOICE
    ===================================================== */

    function initVoiceWow() {

        var SR =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SR) {

            return;
        }


        var existing =
            window.NEXUS_VOICE;


        if (
            existing &&
            existing.recognition
        ) {

            attachVoiceEnhancements(
                existing
            );

            return;
        }


        var rec =
            new SR();


        rec.lang =
            "pl-PL";

        rec.continuous =
            false;

        rec.interimResults =
            true;

        rec.maxAlternatives =
            1;


        var state =
            window.NEXUS_VOICE ||
            {};


        state.supported =
            true;

        state.recognition =
            rec;

        state.listening =
            false;

        state.continuous =
            false;


        window.NEXUS_VOICE =
            state;


        rec.onstart =
            function () {

                state.listening =
                    true;

                if (
                    typeof window.setVoiceUI ===
                    "function"
                ) {

                    window.setVoiceUI(
                        true
                    );
                }


                emit(
                    "voice",
                    "Mikrofon aktywny"
                );
            };


        rec.onend =
            function () {

                state.listening =
                    false;

                if (
                    typeof window.setVoiceUI ===
                    "function"
                ) {

                    window.setVoiceUI(
                        false
                    );
                }


                if (
                    state.continuous
                ) {

                    setTimeout(
                        function () {

                            try {

                                rec.start();

                            } catch (e) {}

                        },
                        350
                    );
                }
            };


        rec.onerror =
            function (e) {

                state.listening =
                    false;


                if (
                    typeof window.setVoiceUI ===
                    "function"
                ) {

                    window.setVoiceUI(
                        false
                    );
                }


                emit(
                    "error",
                    "Voice: " +
                        (
                            e &&
                            e.error
                                ? e.error
                                : "błąd"
                        )
                );
            };


        rec.onresult =
            function (event) {

                var interim =
                    "";

                var finalText =
                    "";


                for (
                    var i =
                        event.resultIndex;

                    i <
                        event.results.length;

                    i++
                ) {

                    var t =
                        event
                            .results[i][0]
                            .transcript;


                    if (
                        event.results[i]
                            .isFinal
                    ) {

                        finalText +=
                            t;

                    } else {

                        interim +=
                            t;
                    }
                }


                var live =
                    document.getElementById(
                        "voiceLive"
                    );


                if (live) {

                    live.textContent =
                        finalText ||
                        interim ||
                        "…";
                }


                if (!finalText) {

                    return;
                }


                var raw =
                    finalText.trim();


                state.lastTranscript =
                    raw;


                emit(
                    "voice",
                    raw
                );


                if (
                    N.wake
                ) {

                    var lower =
                        raw.toLowerCase();


                    var wakeIndex =
                        lower.indexOf(
                            N.wakeWord
                        );


                    if (
                        wakeIndex >= 0
                    ) {

                        var command =
                            raw
                                .slice(
                                    wakeIndex +
                                        N.wakeWord.length
                                )
                                .replace(
                                    /^[,.:;\\s-]+/,
                                    ""
                                )
                                .trim();


                        if (command) {

                            handleWowVoiceCommand(
                                command
                            );

                        } else {

                            speakWow(
                                "Słucham."
                            );
                        }

                    } else {

                        if (
                            state.continuous
                        ) {

                            return;
                        }

                        handleWowVoiceCommand(
                            raw
                        );
                    }

                } else {

                    handleWowVoiceCommand(
                        raw
                    );
                }
            };


        attachVoiceEnhancements(
            state
        );
    }


    function attachVoiceEnhancements(
        state
    ) {

        if (
            state.__wowEnhanced
        ) {
            return;
        }


        state.__wowEnhanced =
            true;


        var originalHandler =
            state.recognition &&
            state.recognition.onresult;


        if (
            !originalHandler
        ) {
            return;
        }
    }


    function speakWow(
        text
    ) {

        if (
            !window.speechSynthesis
        ) {
            return;
        }


        try {

            window.speechSynthesis.cancel();


            var u =
                new SpeechSynthesisUtterance(
                    String(text)
                );


            u.lang =
                "pl-PL";

            u.rate =
                1.02;

            u.pitch =
                1;


            var voices =
                window.speechSynthesis.getVoices();


            for (
                var i = 0;
                i < voices.length;
                i++
            ) {

                if (
                    voices[i].lang &&
                    voices[i].lang
                        .toLowerCase()
                        .indexOf("pl") === 0
                ) {

                    u.voice =
                        voices[i];

                    break;
                }
            }


            window.speechSynthesis.speak(
                u
            );


            pulse(1.15);

        } catch (e) {}
    }


    function handleWowVoiceCommand(
        raw
    ) {

        var t =
            String(
                raw || ""
            )
                .toLowerCase()
                .trim();


        if (!t) return;


        record(
            "Voice → " +
                raw
        );


        /* stop */

        if (
            /^(stop|cisza|wystarczy|anuluj)$/.test(
                t
            )
        ) {

            if (
                typeof window.stopVoice ===
                "function"
            ) {

                window.stopVoice();
            }

            speakWow(
                "OK."
            );

            return;
        }


        /* browser */

        if (
            /otw[oó]rz.*(browser|przegl[aą]dark)|uruchom.*browser/.test(
                t
            )
        ) {

            openBrowser();

            speakWow(
                "Otwieram Browser."
            );

            return;
        }


        /* arcade */

        if (
            /otw[oó]rz.*(arcade|gry)|uruchom.*(arcade|gry)/.test(
                t
            )
        ) {

            openArcade();

            speakWow(
                "Uruchamiam Arcade."
            );

            return;
        }


        /* personalizacja */

        if (
            /personaliz|motyw|wygl[aą]d/.test(
                t
            )
        ) {

            N.openPersonalization();

            speakWow(
                "Otwieram personalizację."
            );

            return;
        }


        /* themes */

        var themeMatch =
            t.match(
                /(?:ustaw|zmie[nń]|w[lł][aą]cz).*(obsidian|cyber|aurora|midnight|matrix|ember)/
            );


        if (themeMatch) {

            var theme =
                themeMatch[1];


            applyTheme(
                theme,
                false
            );


            speakWow(
                "Motyw " +
                    (
                        THEMES[theme] ||
                        {}
                    ).name +
                    " ustawiony."
            );

            return;
        }


        /* live */

        if (
            /live desktop|poka[zż].*live|uruchom.*live/.test(
                t
            )
        ) {

            N.live =
                true;

            localStorage.setItem(
                "nexus-wow-live",
                "1"
            );

            renderLive();

            speakWow(
                "Live Desktop aktywny."
            );

            return;
        }


        /* files */

        if (
            /otw[oó]rz.*(pliki|eksplorator|folder)/.test(
                t
            )
        ) {

            if (
                typeof openWindow ===
                "function"
            ) {

                openWindow(
                    "filesWindow"
                );
            }

            speakWow(
                "Otwieram pliki."
            );

            return;
        }


        /* terminal */

        if (
            /otw[oó]rz.*terminal|uruchom.*terminal/.test(
                t
            )
        ) {

            if (
                typeof openWindow ===
                "function"
            ) {

                openWindow(
                    "terminalWindow"
                );
            }

            speakWow(
                "Terminal uruchomiony."
            );

            return;
        }


        /* ai */

        if (
            /otw[oó]rz.*(ai|sztuczn[aą] inteligencj)|uruchom.*ai/.test(
                t
            )
        ) {

            if (
                typeof openWindow ===
                "function"
            ) {

                openWindow(
                    "aiWindow"
                );
            }

            speakWow(
                "NEXUS AI gotowy."
            );

            return;
        }


        /* notatnik */

        if (
            /otw[oó]rz.*notatnik/.test(
                t
            )
        ) {

            if (
                typeof openWindow ===
                "function"
            ) {

                openWindow(
                    "notepadWindow"
                );
            }

            speakWow(
                "Otwieram notatnik."
            );

            return;
        }


        /* lab */

        if (
            /otw[oó]rz.*(lab|laboratorium|neural)/.test(
                t
            )
        ) {

            if (
                typeof openWindow ===
                "function"
            ) {

                openWindow(
                    "labWindow"
                );
            }


            if (
                typeof window.startLab ===
                "function"
            ) {

                window.startLab();
            }


            speakWow(
                "Otwieram Nexus Lab."
            );

            return;
        }


        /* lock */

        if (
            /zablokuj|blokada ekranu/.test(
                t
            )
        ) {

            if (
                typeof window.lockScreen ===
                "function"
            ) {

                window.lockScreen();
            }

            speakWow(
                "Ekran zablokowany."
            );

            return;
        }


        /* help */

        if (
            /pomoc|co potrafisz|komendy/.test(
                t
            )
        ) {

            speakWow(
                "Mogę otwierać Browser, Arcade, Lab, pliki, terminal i AI oraz zmieniać motywy."
            );

            return;
        }


        /* search */

        var searchMatch =
            t.match(
                /(?:wyszukaj|szukaj|google)\s+(.+)/
            );


        if (searchMatch) {

            openBrowser();

            setTimeout(
                function () {

                    searchWeb(
                        searchMatch[1]
                    );

                },
                150
            );


            speakWow(
                "Szukam."
            );

            return;
        }


        /* fallback → stare NEXUS Voice / AI */

        if (
            typeof window.handleVoiceCommand ===
            "function"
        ) {

            try {

                window.handleVoiceCommand(
                    raw
                );

                return;

            } catch (e) {}
        }


        if (
            typeof window.openWindow ===
            "function"
        ) {

            window.openWindow(
                "aiWindow"
            );
        }


        setTimeout(
            function () {

                var input =
                    document.getElementById(
                        "aiChatInput"
                    );


                if (input) {

                    input.value =
                        raw;


                    if (
                        typeof window.sendAIMessage ===
                        "function"
                    ) {

                        window.sendAIMessage();
                    }
                }

            },
            200
        );


        speakWow(
            "Przekazuję do NEXUS AI."
        );
    }


    /* =====================================================
       BOOT
    ===================================================== */

    function bootstrap() {

        installStyle();

        createAura();

        createLive();

        applyAmbient();

        applyTheme(
            N.theme,
            true
        );


        initVoiceWow();


        var originalOpenWindow =
            window.openWindow;


        if (
            typeof originalOpenWindow ===
            "function" &&
            !originalOpenWindow.__wowWrapped
        ) {

            function wrappedOpenWindow(
                id
            ) {

                var result =
                    originalOpenWindow(
                        id
                    );


                try {

                    var title =
                        (
                            document.querySelector(
                                "#" +
                                    id +
                                    " .window-title"
                            ) ||
                            {}
                        )
                            .textContent ||
                        id;


                    record(
                        "Otwarto → " +
                            title.trim()
                    );

                } catch (e) {}


                return result;
            }


            wrappedOpenWindow.__wowWrapped =
                true;


            window.openWindow =
                wrappedOpenWindow;
        }


        var originalCloseWindow =
            window.closeWindow;


        if (
            typeof originalCloseWindow ===
            "function" &&
            !originalCloseWindow.__wowWrapped
        ) {

            function wrappedCloseWindow(
                id
            ) {

                var result =
                    originalCloseWindow(
                        id
                    );


                record(
                    "Zamknięto → " +
                        id
                );


                return result;
            }


            wrappedCloseWindow.__wowWrapped =
                true;


            window.closeWindow =
                wrappedCloseWindow;
        }


        setInterval(
            function () {

                if (N.live) {

                    renderLive();
                }

            },
            1000
        );


        setInterval(
            function () {

                if (N.live) {

                    var activity =
                        Math.floor(
                            10 +
                            Math.random() *
                            90
                        );


                    var bar =
                        document.getElementById(
                            "nwActivityValue"
                        );


                    if (bar) {

                        bar.textContent =
                            activity +
                            "%";
                    }
                }

            },
            1800
        );


        document.addEventListener(
            "keydown",
            function (e) {

                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                        "b"
                ) {

                    e.preventDefault();

                    openBrowser();
                }


                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                        "g"
                ) {

                    e.preventDefault();

                    openArcade();
                }


                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                        "j"
                ) {

                    e.preventDefault();

                    N.openPersonalization();
                }
            }
        );


        setTimeout(
            function () {

                var particles =
                    Number(
                        localStorage.getItem(
                            "nexus-wow-particles"
                        ) || 18
                    );


                if (
                    typeof window.nexusWowParticles ===
                    "function"
                ) {

                    window.nexusWowParticles(
                        particles
                    );
                }


                renderLive();


                emit(
                    "system",
                    "WOW online"
                );


                notify(
                    "NEXUS WOW",
                    "Voice + Browser + Arcade + Personalizacja + Live Desktop online"
                );

            },
            900
        );


        N.booted =
            true;
    }


    /* =====================================================
       PUBLICZNE SKRÓTY
    ===================================================== */

    window.NEXUS_WOW =
        N;


    setTimeout(
        bootstrap,
        0
    );


})();
