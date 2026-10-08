"use strict";

/* =========================================================
   NEXUS OS — WOW 2.0

   ŻYWA TAPETA 3D
   NEXUS AUDIO REACTOR
   NEXUS VISION
   NEXUS MEMORY
   NEXUS 3D SYSTEM CORE
========================================================= */

(function () {

    if (
        window.NEXUS_WOW2 &&
        window.NEXUS_WOW2.booted
    ) {
        return;
    }

    var W =
        window.NEXUS_WOW2 = {

            booted:
                false,

            wallpaper:
                localStorage.getItem(
                    "nexus-wow2-wallpaper"
                ) !== "0",

            mouseX:
                0.5,

            mouseY:
                0.5,

            wallpaperRaf:
                0,

            memory:
                [],

            audio: {

                ctx:
                    null,

                analyser:
                    null,

                source:
                    null,

                data:
                    null,

                raf:
                    0,

                connectedElement:
                    null,

                running:
                    false
            },

            vision: {

                stream:
                    null,

                raf:
                    0,

                active:
                    false,

                previous:
                    null,

                motion:
                    0,

                offCanvas:
                    null,

                offCtx:
                    null
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
                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    "\"":
                        "&quot;",

                    "'":
                        "&#039;"
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


    function pulse(
        mult
    ) {

        if (
            typeof window.pulseBoost ===
            "function"
        ) {

            window.pulseBoost(
                mult || 1.3
            );
        }

        if (
            typeof window.nexusWowPulseBurst ===
            "function"
        ) {

            window.nexusWowPulseBurst(
                "wow2"
            );
        }
    }


    function beep(
        freq,
        duration
    ) {

        if (
            typeof window.playBeep ===
            "function"
        ) {

            window.playBeep(
                freq || 620,
                duration || 0.06
            );
        }
    }


    function activity(
        message
    ) {

        if (
            typeof window.nexusWowActivity ===
            "function"
        ) {

            window.nexusWowActivity(
                "WOW 2",
                message
            );
        }
    }


    /* =====================================================
       CSS
    ===================================================== */

    function installStyle() {

        if (
            document.getElementById(
                "nexusWow2Style"
            )
        ) {

            return;
        }

        var style =
            document.createElement(
                "style"
            );

        style.id =
            "nexusWow2Style";

        style.textContent = `

/* ==========================================
   3D WALLPAPER
========================================== */

#nexus3DWallpaper {

    position: fixed;
    inset: 0;

    z-index: 0;

    pointer-events: none;

    overflow: hidden;

    perspective: 900px;

    opacity: .9;
}

.n3d-space {

    position: absolute;

    inset: -12%;

    transform-style: preserve-3d;

    transform:
        rotateX(
            calc(
                58deg +
                var(--n3d-ry, 0deg)
            )
        )
        rotateZ(
            calc(
                -8deg +
                var(--n3d-rz, 0deg)
            )
        )
        translateZ(-70px);

    transition:
        transform .15s ease-out;
}

.n3d-grid {

    position: absolute;

    left: -20%;
    top: 32%;

    width: 140%;
    height: 85%;

    background-image:

        linear-gradient(
            rgba(
                255,
                255,
                255,
                .035
            )
            1px,
            transparent 1px
        ),

        linear-gradient(
            90deg,
            rgba(
                255,
                255,
                255,
                .035
            )
            1px,
            transparent 1px
        );

    background-size:
        42px 42px;

    mask-image:
        radial-gradient(
            ellipse at center,
            black 35%,
            transparent 78%
        );
}

.n3d-horizon {

    position: absolute;

    left: 20%;
    right: 20%;
    top: 42%;

    height: 2px;

    background:
        linear-gradient(
            90deg,
            transparent,
            var(--nexus-accent-2),
            var(--nexus-accent),
            transparent
        );

    box-shadow:
        0 0 24px
        var(--nexus-accent-2),

        0 0 60px
        var(--nexus-accent);

    opacity: .48;
}

.n3d-orb {

    position: absolute;

    width: 18px;
    height: 18px;

    border-radius: 50%;

    background:
        radial-gradient(
            circle at 35% 30%,
            #fff 0 8%,
            var(--nexus-accent-2) 25%,
            var(--nexus-accent) 58%,
            transparent 72%
        );

    box-shadow:
        0 0 18px
        var(--nexus-accent-2),

        0 0 55px
        var(--nexus-accent);

    animation:
        n3dFloat
        7s
        ease-in-out
        infinite;
}

.n3d-orb.a {

    left: 18%;
    top: 22%;

    transform:
        translateZ(210px)
        scale(1.5);
}

.n3d-orb.b {

    left: 71%;
    top: 18%;

    transform:
        translateZ(160px)
        scale(1.1);

    animation-delay:
        -2s;
}

.n3d-orb.c {

    left: 52%;
    top: 64%;

    transform:
        translateZ(120px)
        scale(.8);

    animation-delay:
        -4s;
}

.n3d-orb.d {

    left: 86%;
    top: 57%;

    transform:
        translateZ(240px)
        scale(.6);

    animation-delay:
        -5s;
}

@keyframes n3dFloat {

    0%,100% {

        margin-top:
            0;

        opacity:
            .45;
    }

    50% {

        margin-top:
            -24px;

        opacity:
            1;
    }
}

.n3d-line {

    position:
        absolute;

    height:
        1px;

    transform-origin:
        left center;

    background:
        linear-gradient(
            90deg,
            var(--nexus-accent),
            transparent
        );

    opacity:
        .18;
}

.n3d-line.l1 {

    width:
        35vw;

    left:
        12%;

    top:
        30%;

    transform:
        translateZ(80px)
        rotateZ(14deg);
}

.n3d-line.l2 {

    width:
        28vw;

    left:
        57%;

    top:
        31%;

    transform:
        translateZ(110px)
        rotateZ(-12deg);
}

.n3d-line.l3 {

    width:
        23vw;

    left:
        35%;

    top:
        67%;

    transform:
        translateZ(90px)
        rotateZ(7deg);
}

body.nw2-wallpaper-off
#nexus3DWallpaper {

    display:
        none;
}


/* ==========================================
   WSPÓLNE
========================================== */

.nw2-shell {

    height:
        100%;

    min-height:
        0;

    display:
        flex;

    flex-direction:
        column;

    gap:
        10px;
}

.nw2-title {

    font-size:
        24px;

    font-weight:
        700;
}

.nw2-sub {

    font-size:
        12px;

    opacity:
        .5;

    line-height:
        1.5;
}

.nw2-toolbar {

    display:
        flex;

    align-items:
        center;

    gap:
        8px;

    flex-wrap:
        wrap;
}

.nw2-btn {

    padding:
        9px 12px;

    border-radius:
        10px;

    background:
        rgba(
            255,
            255,
            255,
            .06
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .08
        );

    font-size:
        11px;
}

.nw2-btn:hover {

    background:
        rgba(
            124,
            92,
            255,
            .18
        );
}

.nw2-btn.primary {

    background:
        linear-gradient(
            135deg,
            var(--nexus-accent),
            var(--nexus-accent-2)
        );

    color:
        #fff;
}


/* ==========================================
   AUDIO
========================================== */

.nw2-audio-top {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        10px;
}

.nw2-metric {

    padding:
        12px;

    border-radius:
        13px;

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
}

.nw2-metric b {

    display:
        block;

    font-size:
        10px;

    opacity:
        .42;

    text-transform:
        uppercase;
}

.nw2-metric strong {

    display:
        block;

    margin-top:
        4px;

    font-size:
        16px;
}

#nw2AudioCanvas {

    flex:
        1;

    min-height:
        280px;

    width:
        100%;

    display:
        block;

    border-radius:
        16px;

    background:
        radial-gradient(
            circle at center,
            rgba(
                124,
                92,
                255,
                .10
            ),
            rgba(
                0,
                0,
                0,
                .25
            ) 60%,
            rgba(
                0,
                0,
                0,
                .45
            )
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

.nw2-upload {

    display:
        none;
}


/* ==========================================
   VISION
========================================== */

.nw2-vision-wrap {

    flex:
        1;

    min-height:
        300px;

    position:
        relative;

    overflow:
        hidden;

    border-radius:
        16px;

    background:
        #020406;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );
}

#nw2VisionVideo {

    width:
        100%;

    height:
        100%;

    display:
        block;

    object-fit:
        cover;

    transform:
        scaleX(-1);

    opacity:
        .86;
}

#nw2VisionCanvas {

    position:
        absolute;

    inset:
        0;

    width:
        100%;

    height:
        100%;

    pointer-events:
        none;
}

.nw2-vision-hud {

    position:
        absolute;

    inset:
        14px;

    pointer-events:
        none;

    font-family:
        ui-monospace,
        Consolas,
        monospace;

    font-size:
        10px;

    letter-spacing:
        .6px;

    color:
        var(--nexus-accent-2);

    text-shadow:
        0 0 10px
        rgba(
            0,
            217,
            255,
            .55
        );
}

.nw2-vision-hud .tl {

    position:
        absolute;

    left:
        0;

    top:
        0;
}

.nw2-vision-hud .tr {

    position:
        absolute;

    right:
        0;

    top:
        0;

    text-align:
        right;
}

.nw2-vision-hud .bl {

    position:
        absolute;

    left:
        0;

    bottom:
        0;
}

.nw2-vision-hud .br {

    position:
        absolute;

    right:
        0;

    bottom:
        0;

    text-align:
        right;
}

.nw2-vision-status {

    display:
        flex;

    align-items:
        center;

    gap:
        7px;

    font-size:
        11px;

    opacity:
        .75;
}

.nw2-status-dot {

    width:
        7px;

    height:
        7px;

    border-radius:
        50%;

    background:
        var(--nexus-danger);

    box-shadow:
        0 0 12px
        var(--nexus-danger);
}

.nw2-status-dot.on {

    background:
        var(--nexus-success);

    box-shadow:
        0 0 12px
        var(--nexus-success);
}


/* ==========================================
   MEMORY
========================================== */

.nw2-memory-input {

    display:
        flex;

    gap:
        8px;
}

.nw2-memory-input input,
.nw2-memory-search {

    flex:
        1;

    min-width:
        0;

    padding:
        11px 12px;

    border-radius:
        11px;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .08
        );

    background:
        rgba(
            0,
            0,
            0,
            .25
        );

    color:
        #fff;

    outline:
        none;

    user-select:
        text;
}

.nw2-memory-list {

    flex:
        1;

    min-height:
        240px;

    overflow:
        auto;

    display:
        flex;

    flex-direction:
        column;

    gap:
        8px;
}

.nw2-memory-item {

    padding:
        12px;

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

    display:
        grid;

    grid-template-columns:
        1fr auto;

    gap:
        10px;
}

.nw2-memory-item p {

    font-size:
        12px;

    line-height:
        1.5;

    word-break:
        break-word;
}

.nw2-memory-item small {

    display:
        block;

    margin-top:
        5px;

    font-size:
        9px;

    opacity:
        .4;
}

.nw2-memory-item button {

    width:
        28px;

    height:
        28px;

    border-radius:
        8px;

    background:
        rgba(
            255,
            85,
            119,
            .12
        );

    color:
        #ff8aa4;
}

.nw2-empty {

    height:
        100%;

    display:
        grid;

    place-items:
        center;

    text-align:
        center;

    opacity:
        .4;

    font-size:
        12px;
}


/* ==========================================
   3D SYSTEM CORE
========================================== */

.nw2-core-shell {

    height:
        100%;

    min-height:
        0;

    display:
        flex;

    flex-direction:
        column;
}

.nw2-core-stage {

    flex:
        1;

    min-height:
        380px;

    position:
        relative;

    overflow:
        hidden;

    perspective:
        1100px;

    display:
        grid;

    place-items:
        center;

    background:
        radial-gradient(
            circle at center,
            rgba(
                124,
                92,
                255,
                .12
            ),
            transparent 40%
        );

    border-radius:
        16px;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .07
        );
}

.nw2-core-scene {

    position:
        relative;

    width:
        270px;

    height:
        270px;

    transform-style:
        preserve-3d;

    transform:
        rotateX(
            var(
                --core-x,
                14deg
            )
        )
        rotateY(
            var(
                --core-y,
                18deg
            )
        );

    transition:
        transform .12s ease-out;
}

.nw2-core-cube {

    position:
        absolute;

    inset:
        0;

    transform-style:
        preserve-3d;

    transform:
        rotateX(20deg)
        rotateY(35deg);

    animation:
        nw2CubeSpin
        18s
        linear
        infinite;
}

@keyframes nw2CubeSpin {

    to {

        transform:
            rotateX(380deg)
            rotateY(395deg);
    }
}

.nw2-face {

    position:
        absolute;

    width:
        150px;

    height:
        150px;

    left:
        60px;

    top:
        60px;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .20
        );

    background:
        linear-gradient(
            135deg,
            rgba(
                124,
                92,
                255,
                .09
            ),
            rgba(
                0,
                217,
                255,
                .05
            )
        );

    box-shadow:
        inset 0 0 45px
        rgba(
            124,
            92,
            255,
            .09
        );
}

.nw2-face.f1 {

    transform:
        translateZ(75px);
}

.nw2-face.f2 {

    transform:
        rotateY(180deg)
        translateZ(75px);
}

.nw2-face.f3 {

    transform:
        rotateY(90deg)
        translateZ(75px);
}

.nw2-face.f4 {

    transform:
        rotateY(-90deg)
        translateZ(75px);
}

.nw2-face.f5 {

    transform:
        rotateX(90deg)
        translateZ(75px);
}

.nw2-face.f6 {

    transform:
        rotateX(-90deg)
        translateZ(75px);
}

.nw2-core-orb {

    position:
        absolute;

    left:
        50%;

    top:
        50%;

    width:
        96px;

    height:
        96px;

    transform:
        translate(-50%,-50%)
        translateZ(125px);

    border-radius:
        50%;

    display:
        grid;

    place-items:
        center;

    font-size:
        31px;

    font-weight:
        800;

    color:
        #fff;

    background:
        radial-gradient(
            circle at 35% 30%,
            #fff,
            transparent 8%
        ),

        radial-gradient(
            circle,
            var(--nexus-accent-2),
            var(--nexus-accent) 54%,
            #090611 76%
        );

    box-shadow:
        0 0 45px
        var(--nexus-accent-2),

        0 0 110px
        var(--nexus-accent);

    animation:
        nw2CorePulse
        2.4s
        ease-in-out
        infinite;
}

@keyframes nw2CorePulse {

    50% {

        transform:
            translate(-50%,-50%)
            translateZ(125px)
            scale(1.12);

        filter:
            brightness(1.18);
    }
}

.nw2-core-node {

    position:
        absolute;

    min-width:
        92px;

    padding:
        9px 11px;

    border-radius:
        12px;

    background:
        rgba(
            8,
            10,
            16,
            .84
        );

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            .12
        );

    color:
        #fff;

    font-size:
        10px;

    cursor:
        pointer;

    transform-style:
        preserve-3d;
}

.nw2-core-node:hover {

    background:
        rgba(
            124,
            92,
            255,
            .18
        );

    border-color:
        rgba(
            124,
            92,
            255,
            .4
        );

    transform:
        translateZ(
            10px
        )
        scale(1.06);
}

.nw2-core-node.ai {

    left:
        -115px;

    top:
        25px;

    transform:
        translateZ(160px);
}

.nw2-core-node.files {

    right:
        -115px;

    top:
        25px;

    transform:
        translateZ(150px);
}

.nw2-core-node.browser {

    left:
        -90px;

    bottom:
        20px;

    transform:
        translateZ(120px);
}

.nw2-core-node.audio {

    right:
        -95px;

    bottom:
        20px;

    transform:
        translateZ(115px);
}

.nw2-core-node.memory {

    left:
        82px;

    top:
        -78px;

    transform:
        translateZ(180px);
}

.nw2-core-node.vision {

    left:
        88px;

    bottom:
        -80px;

    transform:
        translateZ(150px);
}

.nw2-core-caption {

    position:
        absolute;

    left:
        50%;

    bottom:
        12px;

    transform:
        translateX(-50%);

    font-size:
        10px;

    letter-spacing:
        2px;

    opacity:
        .4;
}

@media (
    max-width: 700px
) {

    .nw2-audio-top {

        grid-template-columns:
            1fr;
    }

    .nw2-core-scene {

        transform:
            scale(.72);
    }

    .nw2-core-node.ai,
    .nw2-core-node.files,
    .nw2-core-node.browser,
    .nw2-core-node.audio,
    .nw2-core-node.memory,
    .nw2-core-node.vision {

        position:
            static;

        transform:
            none;
    }
}
`;

        document.head.appendChild(
            style
        );
    }


    /* =====================================================
       LIVE 3D WALLPAPER
    ===================================================== */

    function createWallpaper() {

        if (
            document.getElementById(
                "nexus3DWallpaper"
            )
        ) {
            return;
        }

        var box =
            document.createElement(
                "div"
            );

        box.id =
            "nexus3DWallpaper";

        box.innerHTML = `

            <div
                class="n3d-space"
                id="n3dSpace"
            >

                <div
                    class="n3d-grid"
                ></div>

                <div
                    class="n3d-horizon"
                ></div>

                <div
                    class="n3d-orb a"
                ></div>

                <div
                    class="n3d-orb b"
                ></div>

                <div
                    class="n3d-orb c"
                ></div>

                <div
                    class="n3d-orb d"
                ></div>

                <div
                    class="n3d-line l1"
                ></div>

                <div
                    class="n3d-line l2"
                ></div>

                <div
                    class="n3d-line l3"
                ></div>

            </div>
        `;

        document.body.appendChild(
            box
        );

        var desktop =
            document.getElementById(
                "desktop"
            );

        if (
            desktop &&
            !desktop.dataset.nexus3dMouse
        ) {

            desktop.dataset.nexus3dMouse =
                "1";

            desktop.addEventListener(
                "mousemove",
                function (e) {

                    W.mouseX =
                        e.clientX /
                        Math.max(
                            1,
                            window.innerWidth
                        );

                    W.mouseY =
                        e.clientY /
                        Math.max(
                            1,
                            window.innerHeight
                        );
                }
            );
        }

        W.wallpaperRaf =
            requestAnimationFrame(
                wallpaperFrame
            );
    }


    function wallpaperFrame(
        now
    ) {

        var space =
            document.getElementById(
                "n3dSpace"
            );

        if (
            !space ||
            !W.wallpaper
        ) {

            W.wallpaperRaf =
                0;

            return;
        }

        var x =
            (
                W.mouseX -
                0.5
            ) * 7;

        var y =
            (
                W.mouseY -
                0.5
            ) * -7;

        var pulseWave =
            Math.sin(
                now / 3200
            ) * 1.8;

        space.style.setProperty(
            "--n3d-ry",
            x.toFixed(2) +
            "deg"
        );

        space.style.setProperty(
            "--n3d-rz",
            (
                y +
                pulseWave
            ).toFixed(2) +
            "deg"
        );

        W.wallpaperRaf =
            requestAnimationFrame(
                wallpaperFrame
            );
    }


    W.toggleWallpaper =
        function () {

            W.wallpaper =
                !W.wallpaper;

            localStorage.setItem(
                "nexus-wow2-wallpaper",
                W.wallpaper
                    ? "1"
                    : "0"
            );

            document.body.classList.toggle(
                "nw2-wallpaper-off",
                !W.wallpaper
            );

            notify(
                "Żywa tapeta 3D",
                W.wallpaper
                    ? "Włączona"
                    : "Wyłączona"
            );

            activity(
                "Tapeta 3D → " +
                (
                    W.wallpaper
                        ? "ON"
                        : "OFF"
                )
            );

            pulse(1.4);

            if (
                W.wallpaper &&
                !W.wallpaperRaf
            ) {

                W.wallpaperRaf =
                    requestAnimationFrame(
                        wallpaperFrame
                    );
            }
        };


    /* =====================================================
       AUDIO REACTOR
    ===================================================== */

    function ensureAudioWindow() {

        var win =
            document.getElementById(
                "nexusAudioReactorWindow"
            );

        if (win) {
            return win;
        }

        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusAudioReactorWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "820px";

        win.style.height =
            "570px";

        win.innerHTML = `

            <div
                class="window-header"
            >

                <div
                    class="window-title"
                >
                    ♫ NEXUS Audio Reactor
                </div>

                <div
                    class="window-controls"
                >

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusAudioReactorWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusAudioReactorWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexusAudioReactorWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div
                class="window-body"
                style="padding:12px"
            >

                <div
                    class="nw2-shell"
                >

                    <div>

                        <div
                            class="nw2-title"
                        >
                            Audio Reactor
                        </div>

                        <div
                            class="nw2-sub"
                        >
                            Wizualizator reagujący
                            na muzykę.
                        </div>

                    </div>

                    <div
                        class="nw2-audio-top"
                    >

                        <div
                            class="nw2-metric"
                        >

                            <b>Źródło</b>

                            <strong
                                id="nw2AudioSource"
                            >
                                Brak
                            </strong>

                        </div>

                        <div
                            class="nw2-metric"
                        >

                            <b>Energia</b>

                            <strong
                                id="nw2AudioEnergy"
                            >
                                0%
                            </strong>

                        </div>

                    </div>

                    <div
                        class="nw2-toolbar"
                    >

                        <label
                            class="nw2-btn primary"
                            for="nw2AudioFile"
                        >
                            Wybierz muzykę
                        </label>

                        <input
                            id="nw2AudioFile"
                            class="nw2-upload"
                            type="file"
                            accept="audio/*"
                        >

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.connectMusicPlayer()"
                        >
                            Podepnij Muzykę
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.startAudio()"
                        >
                            Start Reactor
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.stopAudio()"
                        >
                            Stop
                        </button>

                    </div>

                    <canvas
                        id="nw2AudioCanvas"
                    ></canvas>

                </div>

            </div>
        `;

        document.getElementById(
            "desktop"
        ).appendChild(
            win
        );

        var input =
            document.getElementById(
                "nw2AudioFile"
            );

        if (input) {

            input.addEventListener(
                "change",
                handleAudioFile
            );
        }

        return win;
    }


    function createAudioPlayer(
        file
    ) {

        var old =
            document.getElementById(
                "nw2AudioPlayer"
            );

        if (old) {
            old.remove();
        }

        var audio =
            document.createElement(
                "audio"
            );

        audio.id =
            "nw2AudioPlayer";

        audio.controls =
            true;

        audio.style.width =
            "100%";

        audio.src =
            URL.createObjectURL(
                file
            );

        document.getElementById(
            "nexusAudioReactorWindow"
        )
        .querySelector(
            ".nw2-shell"
        )
        .insertBefore(
            audio,
            document.getElementById(
                "nw2AudioCanvas"
            )
        );

        return audio;
    }


    function handleAudioFile(
        event
    ) {

        var file =
            event.target.files &&
            event.target.files[0];

        if (!file) {
            return;
        }

        var audio =
            createAudioPlayer(
                file
            );

        var source =
            document.getElementById(
                "nw2AudioSource"
            );

        if (source) {

            source.textContent =
                file.name;
        }

        connectAudioElement(
            audio
        );

        activity(
            "Audio → " +
            file.name
        );

        pulse(1.4);
    }


    function connectAudioElement(
        audio
    ) {

        if (!audio) {
            return false;
        }

        try {

            if (
                W.audio.connectedElement ===
                    audio &&
                W.audio.analyser
            ) {

                return true;
            }

            if (W.audio.ctx) {

                try {
                    W.audio.ctx.close();
                } catch (e) {}
            }

            W.audio.ctx =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

            W.audio.analyser =
                W.audio.ctx.createAnalyser();

            W.audio.analyser.fftSize =
                256;

            W.audio.analyser.smoothingTimeConstant =
                0.82;

            W.audio.data =
                new Uint8Array(
                    W.audio.analyser
                        .frequencyBinCount
                );

            W.audio.source =
                W.audio.ctx
                    .createMediaElementSource(
                        audio
                    );

            W.audio.source.connect(
                W.audio.analyser
            );

            W.audio.analyser.connect(
                W.audio.ctx.destination
            );

            W.audio.connectedElement =
                audio;

            return true;

        } catch (e) {

            notify(
                "Audio Reactor",
                "Nie udało się podłączyć audio."
            );

            return false;
        }
    }


    function connectMusicPlayer() {

        var player =
            document.getElementById(
                "musicPlayer"
            );

        if (
            !player ||
            !player.src
        ) {

            notify(
                "Audio Reactor",
                "Najpierw wybierz muzykę w aplikacji Muzyka."
            );

            return;
        }

        if (
            connectAudioElement(
                player
            )
        ) {

            var source =
                document.getElementById(
                    "nw2AudioSource"
                );

            if (source) {

                source.textContent =
                    "Muzyka NEXUS";
            }

            startAudio();

            activity(
                "Audio → Muzyka NEXUS"
            );
        }
    }


    function startAudio() {

        if (
            !W.audio.analyser
        ) {

            var player =
                document.getElementById(
                    "nw2AudioPlayer"
                );

            if (player) {

                connectAudioElement(
                    player
                );
            }
        }

        if (
            !W.audio.ctx ||
            !W.audio.analyser
        ) {

            notify(
                "Audio Reactor",
                "Brak źródła audio."
            );

            return;
        }

        try {

            W.audio.ctx.resume();

        } catch (e) {}

        W.audio.running =
            true;

        drawAudio();

        var active =
            W.audio.connectedElement;

        if (
            active &&
            active.paused
        ) {

            active
                .play()
                .catch(
                    function () {}
                );
        }

        beep(
            740,
            0.07
        );

        pulse(1.5);
    }


    function stopAudio() {

        W.audio.running =
            false;

        if (
            W.audio.raf
        ) {

            cancelAnimationFrame(
                W.audio.raf
            );
        }

        W.audio.raf =
            0;
    }


    function drawAudio() {

        if (
            !W.audio.running
        ) {
            return;
        }

        var canvas =
            document.getElementById(
                "nw2AudioCanvas"
            );

        if (
            !canvas ||
            !W.audio.analyser
        ) {

            W.audio.running =
                false;

            return;
        }

        var rect =
            canvas.getBoundingClientRect();

        var dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        var width =
            Math.max(
                320,
                Math.floor(
                    rect.width
                )
            );

        var height =
            Math.max(
                280,
                Math.floor(
                    rect.height
                )
            );

        if (
            canvas.width !==
                width * dpr ||
            canvas.height !==
                height * dpr
        ) {

            canvas.width =
                width * dpr;

            canvas.height =
                height * dpr;
        }

        var ctx =
            canvas.getContext(
                "2d"
            );

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        W.audio.analyser
            .getByteFrequencyData(
                W.audio.data
            );

        var data =
            W.audio.data;

        var total =
            0;

        for (
            var i = 0;
            i < data.length;
            i++
        ) {

            total +=
                data[i];
        }

        var energy =
            data.length
                ? total /
                    (
                        data.length *
                        255
                    )
                : 0;

        var energyEl =
            document.getElementById(
                "nw2AudioEnergy"
            );

        if (energyEl) {

            energyEl.textContent =
                Math.round(
                    energy * 100
                ) +
                "%";
        }

        var cx =
            width / 2;

        var cy =
            height / 2;

        var radius =
            Math.min(
                width,
                height
            ) *
            0.15 +
            energy * 75;

        var glow =
            ctx.createRadialGradient(
                cx,
                cy,
                5,
                cx,
                cy,
                radius * 2.6
            );

        glow.addColorStop(
            0,
            "rgba(255,255,255,.95)"
        );

        glow.addColorStop(
            .18,
            "rgba(0,217,255,.8)"
        );

        glow.addColorStop(
            .45,
            "rgba(124,92,255,.38)"
        );

        glow.addColorStop(
            1,
            "rgba(124,92,255,0)"
        );

        ctx.fillStyle =
            glow;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            radius * 2.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        var bars =
            Math.min(
                64,
                data.length
            );

        var maxR =
            Math.min(
                width,
                height
            ) * .42;

        for (
            var b = 0;
            b < bars;
            b++
        ) {

            var value =
                data[b] / 255;

            var angle =
                (
                    b / bars
                ) *
                Math.PI *
                2;

            var inner =
                radius +
                10;

            var outer =
                inner +
                value *
                (
                    maxR -
                    inner
                ) *
                1.2;

            var x1 =
                cx +
                Math.cos(
                    angle
                ) *
                inner;

            var y1 =
                cy +
                Math.sin(
                    angle
                ) *
                inner;

            var x2 =
                cx +
                Math.cos(
                    angle
                ) *
                outer;

            var y2 =
                cy +
                Math.sin(
                    angle
                ) *
                outer;

            ctx.strokeStyle =
                b % 3 === 0
                    ? "#00d9ff"
                    : "#7c5cff";

            ctx.globalAlpha =
                .25 +
                value * .75;

            ctx.lineWidth =
                2 +
                value * 2.5;

            ctx.beginPath();

            ctx.moveTo(
                x1,
                y1
            );

            ctx.lineTo(
                x2,
                y2
            );

            ctx.stroke();
        }

        ctx.globalAlpha =
            1;

        ctx.strokeStyle =
            "rgba(255,255,255,.18)";

        ctx.lineWidth =
            1;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            radius + 10,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        W.audio.raf =
            requestAnimationFrame(
                drawAudio
            );
    }


    W.openAudio =
        function () {

            ensureAudioWindow();

            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexusAudioReactorWindow"
                );
            }

            activity(
                "Audio Reactor → otwarto"
            );
        };

    W.startAudio =
        startAudio;

    W.stopAudio =
        stopAudio;

    W.connectMusicPlayer =
        connectMusicPlayer;


    /* =====================================================
       NEXUS VISION
    ===================================================== */

    function ensureVisionWindow() {

        var win =
            document.getElementById(
                "nexusVisionWindow"
            );

        if (win) {
            return win;
        }

        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusVisionWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "820px";

        win.style.height =
            "600px";

        win.innerHTML = `

            <div
                class="window-header"
            >

                <div
                    class="window-title"
                >
                    👁 NEXUS Vision
                </div>

                <div
                    class="window-controls"
                >

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusVisionWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusVisionWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="window.NEXUS_WOW2.stopVision();closeWindow('nexusVisionWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div
                class="window-body"
                style="padding:12px"
            >

                <div
                    class="nw2-shell"
                >

                    <div
                        class="nw2-toolbar"
                    >

                        <div>

                            <div
                                class="nw2-title"
                            >
                                Vision Core
                            </div>

                            <div
                                class="nw2-sub"
                            >
                                Kamera i analiza
                                ruchu w czasie
                                rzeczywistym.
                            </div>

                        </div>

                        <div
                            class="nw2-vision-status"
                            style="margin-left:auto"
                        >

                            <span
                                id="nw2VisionDot"
                                class="nw2-status-dot"
                            ></span>

                            <span
                                id="nw2VisionState"
                            >
                                OFFLINE
                            </span>

                        </div>

                    </div>

                    <div
                        class="nw2-vision-wrap"
                    >

                        <video
                            id="nw2VisionVideo"
                            autoplay
                            muted
                            playsinline
                        ></video>

                        <canvas
                            id="nw2VisionCanvas"
                        ></canvas>

                        <div
                            class="nw2-vision-hud"
                        >

                            <div
                                class="tl"
                            >
                                NEXUS VISION
                                / OPTICAL CORE
                            </div>

                            <div
                                class="tr"
                            >
                                LOCAL PROCESSING
                            </div>

                            <div
                                class="bl"
                                id="nw2VisionMotion"
                            >
                                MOTION 0%
                            </div>

                            <div
                                class="br"
                            >
                                CAMERA LINK
                            </div>

                        </div>

                    </div>

                    <div
                        class="nw2-toolbar"
                    >

                        <button
                            type="button"
                            class="nw2-btn primary"
                            onclick="window.NEXUS_WOW2.startVision()"
                        >
                            Włącz kamerę
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.stopVision()"
                        >
                            Wyłącz
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.visionSnapshot()"
                        >
                            Zrzut
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.getElementById(
            "desktop"
        ).appendChild(
            win
        );

        return win;
    }


    async function startVision() {

        ensureVisionWindow();

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            notify(
                "NEXUS Vision",
                "Ta przeglądarka nie udostępnia kamery."
            );

            return;
        }

        stopVision();

        try {

            var stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            width: {
                                ideal: 1280
                            },
                            height: {
                                ideal: 720
                            },
                            facingMode:
                                "user"
                        },

                        audio:
                            false
                    }
                );

            W.vision.stream =
                stream;

            W.vision.active =
                true;

            W.vision.previous =
                null;

            var video =
                document.getElementById(
                    "nw2VisionVideo"
                );

            if (video) {

                video.srcObject =
                    stream;

                await video
                    .play()
                    .catch(
                        function () {}
                    );
            }

            var dot =
                document.getElementById(
                    "nw2VisionDot"
                );

            var state =
                document.getElementById(
                    "nw2VisionState"
                );

            if (dot) {
                dot.classList.add(
                    "on"
                );
            }

            if (state) {
                state.textContent =
                    "ONLINE";
            }

            activity(
                "Vision → kamera ON"
            );

            pulse(1.5);

            visionLoop();

        } catch (e) {

            notify(
                "NEXUS Vision",
                "Nie uzyskano dostępu do kamery."
            );
        }
    }


    function stopVision() {

        W.vision.active =
            false;

        if (
            W.vision.raf
        ) {

            cancelAnimationFrame(
                W.vision.raf
            );
        }

        W.vision.raf =
            0;

        if (
            W.vision.stream
        ) {

            W.vision.stream
                .getTracks()
                .forEach(
                    function (track) {

                        try {
                            track.stop();
                        } catch (e) {}
                    }
                );

            W.vision.stream =
                null;
        }

        var video =
            document.getElementById(
                "nw2VisionVideo"
            );

        if (video) {
            video.srcObject =
                null;
        }

        var dot =
            document.getElementById(
                "nw2VisionDot"
            );

        var state =
            document.getElementById(
                "nw2VisionState"
            );

        if (dot) {

            dot.classList.remove(
                "on"
            );
        }

        if (state) {

            state.textContent =
                "OFFLINE";
        }
    }


    function visionLoop() {

        if (
            !W.vision.active
        ) {
            return;
        }

        var video =
            document.getElementById(
                "nw2VisionVideo"
            );

        var canvas =
            document.getElementById(
                "nw2VisionCanvas"
            );

        if (
            !video ||
            !canvas ||
            video.readyState < 2
        ) {

            W.vision.raf =
                requestAnimationFrame(
                    visionLoop
                );

            return;
        }

        var rect =
            canvas.getBoundingClientRect();

        var dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        var width =
            Math.max(
                240,
                Math.floor(
                    rect.width
                )
            );

        var height =
            Math.max(
                180,
                Math.floor(
                    rect.height
                )
            );

        if (
            canvas.width !==
                width * dpr ||
            canvas.height !==
                height * dpr
        ) {

            canvas.width =
                width * dpr;

            canvas.height =
                height * dpr;
        }

        var ctx =
            canvas.getContext(
                "2d"
            );

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        if (
            !W.vision.offCanvas
        ) {

            W.vision.offCanvas =
                document.createElement(
                    "canvas"
                );

            W.vision.offCanvas.width =
                160;

            W.vision.offCanvas.height =
                90;

            W.vision.offCtx =
                W.vision.offCanvas
                    .getContext(
                        "2d",
                        {
                            willReadFrequently:
                                true
                        }
                    );
        }

        var off =
            W.vision.offCanvas;

        var octx =
            W.vision.offCtx;

        octx.drawImage(
            video,
            0,
            0,
            160,
            90
        );

        var img =
            octx.getImageData(
                0,
                0,
                160,
                90
            ).data;

        var motion =
            0;

        if (
            W.vision.previous
        ) {

            var prev =
                W.vision.previous;

            var samples =
                0;

            for (
                var i = 0;
                i < img.length;
                i += 24
            ) {

                var current =
                    (
                        img[i] +
                        img[i + 1] +
                        img[i + 2]
                    ) / 3;

                var old =
                    (
                        prev[i] +
                        prev[i + 1] +
                        prev[i + 2]
                    ) / 3;

                motion +=
                    Math.abs(
                        current -
                        old
                    );

                samples++;
            }

            motion =
                samples
                    ? Math.min(
                        1,
                        motion /
                        (
                            samples *
                            42
                        )
                    )
                    : 0;
        }

        W.vision.previous =
            img;

        W.vision.motion =
            W.vision.motion *
            .8 +
            motion *
            .2;

        var scanY =
            (
                performance.now() /
                7
            ) % height;

        var scan =
            ctx.createLinearGradient(
                0,
                scanY - 22,
                0,
                scanY + 22
            );

        scan.addColorStop(
            0,
            "rgba(0,217,255,0)"
        );

        scan.addColorStop(
            .5,
            "rgba(0,217,255,.12)"
        );

        scan.addColorStop(
            1,
            "rgba(0,217,255,0)"
        );

        ctx.fillStyle =
            scan;

        ctx.fillRect(
            0,
            scanY - 22,
            width,
            44
        );

        var boxW =
            width *
            (
                .22 +
                W.vision.motion *
                .08
            );

        var boxH =
            height *
            (
                .34 +
                W.vision.motion *
                .08
            );

        var bx =
            (
                width -
                boxW
            ) / 2;

        var by =
            (
                height -
                boxH
            ) / 2;

        ctx.strokeStyle =
            "rgba(0,217,255,.35)";

        ctx.lineWidth =
            1;

        ctx.strokeRect(
            bx,
            by,
            boxW,
            boxH
        );

        var c =
            18;

        ctx.strokeStyle =
            "rgba(255,255,255,.55)";

        ctx.beginPath();

        ctx.moveTo(
            bx,
            by + c
        );

        ctx.lineTo(
            bx,
            by
        );

        ctx.lineTo(
            bx + c,
            by
        );

        ctx.moveTo(
            bx + boxW - c,
            by
        );

        ctx.lineTo(
            bx + boxW,
            by
        );

        ctx.lineTo(
            bx + boxW,
            by + c
        );

        ctx.moveTo(
            bx,
            by + boxH - c
        );

        ctx.lineTo(
            bx,
            by + boxH
        );

        ctx.lineTo(
            bx + c,
            by + boxH
        );

        ctx.moveTo(
            bx + boxW - c,
            by + boxH
        );

        ctx.lineTo(
            bx + boxW,
            by + boxH
        );

        ctx.lineTo(
            bx + boxW,
            by + boxH - c
        );

        ctx.stroke();

        var motionEl =
            document.getElementById(
                "nw2VisionMotion"
            );

        if (motionEl) {

            motionEl.textContent =
                "MOTION " +
                Math.round(
                    W.vision.motion *
                    100
                ) +
                "%";
        }

        W.vision.raf =
            requestAnimationFrame(
                visionLoop
            );
    }


    function visionSnapshot() {

        var video =
            document.getElementById(
                "nw2VisionVideo"
            );

        if (
            !video ||
            video.readyState < 2
        ) {

            notify(
                "NEXUS Vision",
                "Kamera nie jest aktywna."
            );

            return;
        }

        var canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            video.videoWidth ||
            1280;

        canvas.height =
            video.videoHeight ||
            720;

        var ctx =
            canvas.getContext(
                "2d"
            );

        ctx.translate(
            canvas.width,
            0
        );

        ctx.scale(
            -1,
            1
        );

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        var link =
            document.createElement(
                "a"
            );

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.download =
            "nexus-vision-" +
            Date.now() +
            ".png";

        link.click();

        notify(
            "NEXUS Vision",
            "Zapisano zrzut obrazu."
        );

        activity(
            "Vision → snapshot"
        );

        pulse(1.4);
    }


    W.openVision =
        function () {

            ensureVisionWindow();

            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexusVisionWindow"
                );
            }

            activity(
                "Vision → otwarto"
            );
        };

    W.startVision =
        startVision;

    W.stopVision =
        stopVision;

    W.visionSnapshot =
        visionSnapshot;


    /* =====================================================
       MEMORY
    ===================================================== */

    function loadMemory() {

        try {

            W.memory =
                JSON.parse(
                    localStorage.getItem(
                        "nexus-wow2-memory"
                    ) ||
                    "[]"
                );

            if (
                !Array.isArray(
                    W.memory
                )
            ) {

                W.memory =
                    [];
            }

        } catch (e) {

            W.memory =
                [];
        }
    }


    function saveMemory() {

        try {

            localStorage.setItem(
                "nexus-wow2-memory",
                JSON.stringify(
                    W.memory.slice(
                        -200
                    )
                )
            );

        } catch (e) {}
    }


    function addMemory(
        text
    ) {

        var value =
            String(
                text ||
                ""
            ).trim();

        if (!value) {
            return;
        }

        W.memory.push({

            id:
                Date.now() +
                "-" +
                Math.floor(
                    Math.random() *
                    10000
                ),

            text:
                value,

            time:
                new Date()
                    .toISOString()
        });

        if (
            W.memory.length >
            200
        ) {

            W.memory.shift();
        }

        saveMemory();

        renderMemory();

        notify(
            "NEXUS Memory",
            "Zapamiętano."
        );

        activity(
            "Memory → zapisano"
        );

        pulse(1.25);
    }


    function deleteMemory(
        id
    ) {

        W.memory =
            W.memory.filter(
                function (m) {

                    return (
                        m.id !==
                        id
                    );
                }
            );

        saveMemory();

        renderMemory();

        notify(
            "NEXUS Memory",
            "Usunięto wpis."
        );
    }


    function clearMemory() {

        if (
            !W.memory.length
        ) {
            return;
        }

        if (
            !window.confirm(
                "Wyczyścić całą pamięć NEXUS?"
            )
        ) {
            return;
        }

        W.memory =
            [];

        saveMemory();

        renderMemory();

        notify(
            "NEXUS Memory",
            "Pamięć wyczyszczona."
        );
    }


    function renderMemory(
        filter
    ) {

        var list =
            document.getElementById(
                "nw2MemoryList"
            );

        if (!list) {
            return;
        }

        var q =
            String(
                filter ||
                ""
            )
            .toLowerCase()
            .trim();

        var rows =
            W.memory
                .filter(
                    function (m) {

                        return (
                            !q ||
                            String(
                                m.text
                            )
                            .toLowerCase()
                            .indexOf(q) >= 0
                        );
                    }
                )
                .slice()
                .reverse();

        if (
            !rows.length
        ) {

            list.innerHTML =
                `
                <div class="nw2-empty">
                    Brak zapisanych wspomnień.<br>
                    Dodaj pierwszą rzecz,
                    którą NEXUS ma pamiętać.
                </div>
                `;

            return;
        }

        list.innerHTML =
            rows
                .map(
                    function (m) {

                        var date =
                            new Date(
                                m.time
                            );

                        var label =
                            date.toLocaleString(
                                "pl-PL",
                                {
                                    day:
                                        "2-digit",

                                    month:
                                        "2-digit",

                                    year:
                                        "numeric",

                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit"
                                }
                            );

                        return `
                        <div
                            class="nw2-memory-item"
                        >

                            <div>

                                <p>
                                    ${esc(m.text)}
                                </p>

                                <small>
                                    ${esc(label)}
                                </small>

                            </div>

                            <button
                                type="button"
                                onclick="window.NEXUS_WOW2.deleteMemory('${String(m.id).replace(/'/g, "\\'")}')"
                            >
                                ×
                            </button>

                        </div>
                        `;
                    }
                )
                .join("");
    }


    function ensureMemoryWindow() {

        var win =
            document.getElementById(
                "nexusMemoryWindow"
            );

        if (win) {
            return win;
        }

        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexusMemoryWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "650px";

        win.style.height =
            "560px";

        win.innerHTML = `

            <div
                class="window-header"
            >

                <div
                    class="window-title"
                >
                    🧠 NEXUS Memory
                </div>

                <div
                    class="window-controls"
                >

                    <button
                        type="button"
                        onclick="minimizeWindow('nexusMemoryWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexusMemoryWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexusMemoryWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div
                class="window-body"
            >

                <div
                    class="nw2-shell"
                >

                    <div>

                        <div
                            class="nw2-title"
                        >
                            NEXUS Memory
                        </div>

                        <div
                            class="nw2-sub"
                        >
                            Lokalna pamięć NEXUS.
                            Dane są trzymane
                            w przeglądarce.
                        </div>

                    </div>

                    <div
                        class="nw2-memory-input"
                    >

                        <input
                            id="nw2MemoryInput"
                            type="text"
                            placeholder="Np. NEXUS ma używać Matrix…"
                        >

                        <button
                            type="button"
                            class="nw2-btn primary"
                            onclick="window.NEXUS_WOW2.saveMemoryFromUI()"
                        >
                            Zapamiętaj
                        </button>

                    </div>

                    <div
                        class="nw2-toolbar"
                    >

                        <input
                            id="nw2MemorySearch"
                            class="nw2-memory-search"
                            type="text"
                            placeholder="Szukaj w pamięci…"
                        >

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.clearMemory()"
                        >
                            Wyczyść
                        </button>

                    </div>

                    <div
                        id="nw2MemoryList"
                        class="nw2-memory-list"
                    ></div>

                </div>

            </div>
        `;

        document.getElementById(
            "desktop"
        ).appendChild(
            win
        );

        var input =
            document.getElementById(
                "nw2MemoryInput"
            );

        if (input) {

            input.addEventListener(
                "keydown",
                function (e) {

                    if (
                        e.key ===
                        "Enter"
                    ) {

                        e.preventDefault();

                        W.saveMemoryFromUI();
                    }
                }
            );
        }

        var search =
            document.getElementById(
                "nw2MemorySearch"
            );

        if (search) {

            search.addEventListener(
                "input",
                function () {

                    renderMemory(
                        search.value
                    );
                }
            );
        }

        renderMemory();

        return win;
    }


    W.saveMemoryFromUI =
        function () {

            var input =
                document.getElementById(
                    "nw2MemoryInput"
                );

            if (!input) {
                return;
            }

            var text =
                input.value.trim();

            if (!text) {
                return;
            }

            addMemory(
                text
            );

            input.value =
                "";

            input.focus();
        };


    W.deleteMemory =
        deleteMemory;

    W.clearMemory =
        clearMemory;


    W.openMemory =
        function () {

            ensureMemoryWindow();

            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexusMemoryWindow"
                );
            }

            renderMemory();

            activity(
                "Memory → otwarto"
            );
        };


    /* =====================================================
       3D SYSTEM CORE
    ===================================================== */

    function ensureCoreWindow() {

        var win =
            document.getElementById(
                "nexus3DCoreWindow"
            );

        if (win) {
            return win;
        }

        win =
            document.createElement(
                "section"
            );

        win.id =
            "nexus3DCoreWindow";

        win.className =
            "window";

        win.style.display =
            "none";

        win.style.width =
            "900px";

        win.style.height =
            "650px";

        win.innerHTML = `

            <div
                class="window-header"
            >

                <div
                    class="window-title"
                >
                    ◈ NEXUS 3D System Core
                </div>

                <div
                    class="window-controls"
                >

                    <button
                        type="button"
                        onclick="minimizeWindow('nexus3DCoreWindow')"
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onclick="maximizeWindow('nexus3DCoreWindow')"
                    >
                        □
                    </button>

                    <button
                        type="button"
                        class="close"
                        onclick="closeWindow('nexus3DCoreWindow')"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div
                class="window-body"
                style="padding:12px;overflow:hidden"
            >

                <div
                    class="nw2-core-shell"
                >

                    <div>

                        <div
                            class="nw2-title"
                        >
                            NEXUS 3D System Core
                        </div>

                        <div
                            class="nw2-sub"
                        >
                            Wnętrze systemu NEXUS.
                            Poruszaj myszką
                            i dotykaj modułów.
                        </div>

                    </div>

                    <div
                        class="nw2-core-stage"
                        id="nw2CoreStage"
                    >

                        <div
                            class="nw2-core-scene"
                            id="nw2CoreScene"
                        >

                            <div
                                class="nw2-core-cube"
                            >

                                <div
                                    class="nw2-face f1"
                                ></div>

                                <div
                                    class="nw2-face f2"
                                ></div>

                                <div
                                    class="nw2-face f3"
                                ></div>

                                <div
                                    class="nw2-face f4"
                                ></div>

                                <div
                                    class="nw2-face f5"
                                ></div>

                                <div
                                    class="nw2-face f6"
                                ></div>

                            </div>

                            <div
                                class="nw2-core-orb"
                            >
                                N
                            </div>

                            <button
                                type="button"
                                class="nw2-core-node ai"
                                onclick="window.NEXUS_WOW2.openExisting('aiWindow')"
                            >
                                ✦ AI CORE
                            </button>

                            <button
                                type="button"
                                class="nw2-core-node files"
                                onclick="window.NEXUS_WOW2.openExisting('filesWindow')"
                            >
                                📁 FILES
                            </button>

                            <button
                                type="button"
                                class="nw2-core-node browser"
                                onclick="window.NEXUS_WOW && window.NEXUS_WOW.openBrowser ? window.NEXUS_WOW.openBrowser() : window.NEXUS_WOW2.openExisting('browserWindow')"
                            >
                                ◉ BROWSER
                            </button>

                            <button
                                type="button"
                                class="nw2-core-node audio"
                                onclick="window.NEXUS_WOW2.openAudio()"
                            >
                                ♫ AUDIO
                            </button>

                            <button
                                type="button"
                                class="nw2-core-node memory"
                                onclick="window.NEXUS_WOW2.openMemory()"
                            >
                                🧠 MEMORY
                            </button>

                            <button
                                type="button"
                                class="nw2-core-node vision"
                                onclick="window.NEXUS_WOW2.openVision()"
                            >
                                👁 VISION
                            </button>

                        </div>

                        <div
                            class="nw2-core-caption"
                        >
                            NEURAL CORE /
                            SYSTEM MAP
                        </div>

                    </div>

                    <div
                        class="nw2-toolbar"
                        style="justify-content:center"
                    >

                        <button
                            type="button"
                            class="nw2-btn primary"
                            onclick="window.NEXUS_WOW2.pulseCore()"
                        >
                            ⚡ BOOST CORE
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.toggleWallpaper()"
                        >
                            🌌 Tapeta 3D
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.openAudio()"
                        >
                            ♫ Audio Reactor
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.openVision()"
                        >
                            👁 Vision
                        </button>

                        <button
                            type="button"
                            class="nw2-btn"
                            onclick="window.NEXUS_WOW2.openMemory()"
                        >
                            🧠 Memory
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.getElementById(
            "desktop"
        ).appendChild(
            win
        );

        var stage =
            document.getElementById(
                "nw2CoreStage"
            );

        var scene =
            document.getElementById(
                "nw2CoreScene"
            );

        if (
            stage &&
            scene
        ) {

            stage.addEventListener(
                "mousemove",
                function (e) {

                    var r =
                        stage.getBoundingClientRect();

                    var x =
                        (
                            (
                                e.clientX -
                                r.left
                            ) /
                            r.width -
                            .5
                        ) *
                        32;

                    var y =
                        (
                            (
                                e.clientY -
                                r.top
                            ) /
                            r.height -
                            .5
                        ) *
                        -24;

                    scene.style.setProperty(
                        "--core-y",
                        x.toFixed(2) +
                        "deg"
                    );

                    scene.style.setProperty(
                        "--core-x",
                        y.toFixed(2) +
                        "deg"
                    );
                }
            );

            stage.addEventListener(
                "mouseleave",
                function () {

                    scene.style.setProperty(
                        "--core-y",
                        "18deg"
                    );

                    scene.style.setProperty(
                        "--core-x",
                        "14deg"
                    );
                }
            );
        }

        return win;
    }


    function openExisting(
        id
    ) {

        if (
            typeof window.openWindow ===
            "function"
        ) {

            window.openWindow(
                id
            );
        }
    }


    function pulseCore() {

        pulse(
            3.3
        );

        beep(
            210,
            0.14
        );

        notify(
            "NEXUS Core",
            "NEURAL BOOST aktywny."
        );

        activity(
            "3D Core → BOOST"
        );
    }


    W.openCore =
        function () {

            ensureCoreWindow();

            if (
                typeof window.openWindow ===
                "function"
            ) {

                window.openWindow(
                    "nexus3DCoreWindow"
                );
            }

            activity(
                "3D Core → otwarto"
            );

            pulse(1.5);
        };


    W.openExisting =
        openExisting;

    W.pulseCore =
        pulseCore;


    /* =====================================================
       LAUNCHER
    ===================================================== */

    function extendLauncher() {

        var apps =
            document.querySelector(
                "#launcher .apps"
            );

        if (!apps) {
            return;
        }

        if (
            apps.querySelector(
                '[data-name="wow2-core"]'
            )
        ) {
            return;
        }

        apps.insertAdjacentHTML(
            "beforeend",
            `

            <button
                type="button"
                class="app launcher-app"
                data-name="wow2-core 3d core system core"
                onclick="window.NEXUS_WOW2.openCore()"
            >

                <div
                    class="app-icon"
                >
                    ◈
                </div>

                3D Core

            </button>

            <button
                type="button"
                class="app launcher-app"
                data-name="audio reactor audio muzyka"
                onclick="window.NEXUS_WOW2.openAudio()"
            >

                <div
                    class="app-icon"
                >
                    ♫
                </div>

                Audio Reactor

            </button>

            <button
                type="button"
                class="app launcher-app"
                data-name="vision kamera"
                onclick="window.NEXUS_WOW2.openVision()"
            >

                <div
                    class="app-icon"
                >
                    👁
                </div>

                Vision

            </button>

            <button
                type="button"
                class="app launcher-app"
                data-name="memory pamięć nexus"
                onclick="window.NEXUS_WOW2.openMemory()"
            >

                <div
                    class="app-icon"
                >
                    🧠
                </div>

                Memory

            </button>
            `
        );
    }


    /* =====================================================
       VOICE
    ===================================================== */

    function installVoiceCommands() {

        if (
            typeof window.handleVoiceCommand !==
            "function"
        ) {

            return;
        }

        if (
            window.handleVoiceCommand.__wow2Wrapped
        ) {

            return;
        }

        var original =
            window.handleVoiceCommand;

        function wrapped(
            raw
        ) {

            var text =
                String(
                    raw ||
                    ""
                )
                .toLowerCase()
                .trim();

            var memoryMatch =
                text.match(
                    /(?:zapami[eę]taj|zapamiętaj)\s+(.+)/
                );

            if (
                memoryMatch
            ) {

                addMemory(
                    memoryMatch[1]
                );

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Zapamiętam."
                    );
                }

                return;
            }

            if (
                /co pamiętasz|poka[zż] pamięć|otw[oó]rz pamięć|memory/.test(
                    text
                )
            ) {

                W.openMemory();

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Otwieram pamięć."
                    );
                }

                return;
            }

            if (
                /otw[oó]rz.*(audio reactor|audio|wizualizator)|uruchom.*audio/.test(
                    text
                )
            ) {

                W.openAudio();

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Uruchamiam Audio Reactor."
                    );
                }

                return;
            }

            if (
                /otw[oó]rz.*vision|uruchom.*vision|otw[oó]rz.*kamer/.test(
                    text
                )
            ) {

                W.openVision();

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Otwieram Vision."
                    );
                }

                return;
            }

            if (
                /otw[oó]rz.*3d.*core|otw[oó]rz.*rdze[nń]|system core|core 3d/.test(
                    text
                )
            ) {

                W.openCore();

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Otwieram rdzeń systemu."
                    );
                }

                return;
            }

            if (
                /w[lł][aą]cz.*(tapet|wallpaper).*3d|w[lł][aą]cz.*3d|tapeta 3d/.test(
                    text
                )
            ) {

                if (!W.wallpaper) {
                    W.toggleWallpaper();
                }

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Włączam żywą tapetę."
                    );
                }

                return;
            }

            if (
                /wy[lł][aą]cz.*(tapet|wallpaper).*3d/.test(
                    text
                )
            ) {

                if (W.wallpaper) {
                    W.toggleWallpaper();
                }

                if (
                    typeof window.speak ===
                    "function"
                ) {

                    window.speak(
                        "Wyłączam żywą tapetę."
                    );
                }

                return;
            }

            original(
                raw
            );
        }

        wrapped.__wow2Wrapped =
            true;

        window.handleVoiceCommand =
            wrapped;
    }


    /* =====================================================
       SKRÓTY
    ===================================================== */

    function bindShortcuts() {

        document.addEventListener(
            "keydown",
            function (e) {

                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                    "3"
                ) {

                    e.preventDefault();

                    W.openCore();
                }

                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                    "4"
                ) {

                    e.preventDefault();

                    W.openAudio();
                }

                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                    "5"
                ) {

                    e.preventDefault();

                    W.openVision();
                }

                if (
                    (
                        e.ctrlKey ||
                        e.metaKey
                    ) &&
                    e.key.toLowerCase() ===
                    "6"
                ) {

                    e.preventDefault();

                    W.openMemory();
                }

            }
        );
    }


    /* =====================================================
       BOOT
    ===================================================== */

    function bootstrap() {

        installStyle();

        createWallpaper();

        loadMemory();

        bindShortcuts();

        extendLauncher();

        installVoiceCommands();

        document.body.classList.toggle(
            "nw2-wallpaper-off",
            !W.wallpaper
        );

        setTimeout(
            function () {

                W.booted =
                    true;

                notify(
                    "NEXUS WOW 2",
                    "3D Wallpaper + Audio + Vision + Memory + 3D Core online"
                );

                activity(
                    "WOW 2 → ONLINE"
                );

            },
            900
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootstrap
        );

    } else {

        bootstrap();
    }

})();
