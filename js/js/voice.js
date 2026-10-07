"use strict";

/* =========================================
   NEXUS OS — VOICE CORE v1.0
   Web Speech API (PL) — rozpoznawanie + synteza
   Działa w Chrome / Edge (HTTPS lub localhost)
========================================= */

window.NEXUS_VOICE = {
    listening: false,
    supported: false,
    recognition: null,
    lastTranscript: "",
    continuous: false
};

(function initVoiceSupport() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        NEXUS_VOICE.supported = false;
        return;
    }
    NEXUS_VOICE.supported = true;
    var rec = new SR();
    rec.lang = "pl-PL";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = function () {
        NEXUS_VOICE.listening = true;
        setVoiceUI(true);
        if (typeof playBeep === "function") playBeep(880, 0.06);
        if (typeof logAIAction === "function") logAIAction("Głos: słucham…");
        if (typeof pulseBoost === "function") pulseBoost(1.4);
    };

    rec.onend = function () {
        NEXUS_VOICE.listening = false;
        setVoiceUI(false);
        if (NEXUS_VOICE.continuous) {
            setTimeout(function () {
                if (NEXUS_VOICE.continuous) startVoice();
            }, 400);
        }
    };

    rec.onerror = function (e) {
        NEXUS_VOICE.listening = false;
        setVoiceUI(false);
        if (e.error === "not-allowed") {
            showNotification("Głos", "Brak uprawnień do mikrofonu");
        } else if (e.error !== "aborted" && e.error !== "no-speech") {
            showNotification("Głos", "Błąd: " + e.error);
        }
    };

    rec.onresult = function (event) {
        var interim = "";
        var final = "";
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var t = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += t;
            else interim += t;
        }
        var live = document.getElementById("voiceLive");
        if (live) live.textContent = final || interim || "…";
        if (final) {
            NEXUS_VOICE.lastTranscript = final.trim();
            handleVoiceCommand(NEXUS_VOICE.lastTranscript);
        }
    };

    NEXUS_VOICE.recognition = rec;
})();

function setVoiceUI(on) {
    var btn = document.getElementById("voiceBtn");
    var ring = document.getElementById("voiceRing");
    var badge = document.getElementById("voiceBadge");
    if (btn) btn.classList.toggle("listening", on);
    if (ring) ring.classList.toggle("active", on);
    if (badge) badge.textContent = on ? "SŁUCHAM" : "GŁOS";
    var live = document.getElementById("voiceLive");
    if (live && !on) live.textContent = "";
}

function toggleVoice() {
    if (!NEXUS_VOICE.supported) {
        showNotification("Głos", "Przeglądarka nie obsługuje Web Speech API (użyj Chrome/Edge)");
        return;
    }
    if (NEXUS_VOICE.listening) {
        stopVoice();
    } else {
        startVoice();
    }
}

function startVoice() {
    if (!NEXUS_VOICE.supported || !NEXUS_VOICE.recognition) return;
    try {
        NEXUS_VOICE.recognition.start();
    } catch (e) {
        /* already started */
    }
}

function stopVoice() {
    NEXUS_VOICE.continuous = false;
    if (NEXUS_VOICE.recognition) {
        try { NEXUS_VOICE.recognition.stop(); } catch (e) {}
    }
    setVoiceUI(false);
}

function toggleVoiceContinuous() {
    NEXUS_VOICE.continuous = !NEXUS_VOICE.continuous;
    var cbtn = document.getElementById("voiceContBtn");
    if (cbtn) cbtn.classList.toggle("active", NEXUS_VOICE.continuous);
    showNotification("Głos", NEXUS_VOICE.continuous ? "Tryb ciągły ON" : "Tryb ciągły OFF");
    if (NEXUS_VOICE.continuous) startVoice();
    else stopVoice();
}

function speak(text, rate) {
    if (!window.speechSynthesis) return;
    try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, " "));
        u.lang = "pl-PL";
        u.rate = rate || 1.05;
        u.pitch = 1.0;
        var voices = window.speechSynthesis.getVoices();
        for (var i = 0; i < voices.length; i++) {
            if (voices[i].lang && voices[i].lang.toLowerCase().indexOf("pl") === 0) {
                u.voice = voices[i];
                break;
            }
        }
        window.speechSynthesis.speak(u);
        if (typeof pulseBoost === "function") pulseBoost(1.2);
    } catch (e) {}
}

/* ===== PARSER KOMEND GŁOSOWYCH ===== */
function handleVoiceCommand(raw) {
    var t = raw.toLowerCase().trim();
    if (typeof logAIAction === "function") logAIAction("Głos: " + raw);
    if (typeof pulseBoost === "function") pulseBoost(1.8);

    /* wake / stop */
    if (/^(stop|stopnij|wystarczy|cisza|zamknij głos)/.test(t)) {
        stopVoice();
        speak("OK");
        return;
    }

    /* otwieranie okien */
    if (/otw[oó]rz\s+(plik|folder|eksplorator)/.test(t) || /^pliki$/.test(t)) {
        openWindow("filesWindow");
        if (typeof renderFiles === "function") renderFiles();
        speak("Pliki otwarte");
        return;
    }
    if (/otw[oó]rz\s+terminal|^terminal$/.test(t)) {
        openWindow("terminalWindow");
        speak("Terminal");
        return;
    }
    if (/otw[oó]rz\s+(przeglądark|internet|browser)/.test(t)) {
        openWindow("browserWindow");
        speak("Przeglądarka");
        return;
    }
    if (/otw[oó]rz\s+(ai|asystent|nexus ai)/.test(t) || /^ai$/.test(t)) {
        openWindow("aiWindow");
        speak("Nexus AI");
        return;
    }
    if (/otw[oó]rz\s+notatnik|^notatnik$/.test(t)) {
        openWindow("notepadWindow");
        speak("Notatnik");
        return;
    }
    if (/otw[oó]rz\s+muzyk/.test(t)) {
        openWindow("musicWindow");
        speak("Muzyka");
        return;
    }
    if (/otw[oó]rz\s+ustawien/.test(t)) {
        openWindow("settingsWindow");
        speak("Ustawienia");
        return;
    }
    if (/otw[oó]rz\s+(lab|laboratorium|pulse|neural)/.test(t) || /^lab$/.test(t)) {
        openWindow("labWindow");
        if (typeof startLab === "function") startLab();
        speak("Nexus Lab");
        return;
    }

    /* lock */
    if (/zablokuj|lock|ekran blokady/.test(t)) {
        if (typeof lockScreen === "function") lockScreen();
        speak("Zablokowano");
        return;
    }

    /* tworzenie pliku */
    var m = t.match(/(?:utw[oó]rz|stw[oó]rz|zrób)\s+plik(?:\s+o nazwie)?\s+([a-z0-9_\-\.ąćęłńóśźż]+)/i);
    if (m) {
        var name = m[1];
        if (name.indexOf(".") < 0) name += ".txt";
        if (typeof fsCreateFile === "function" && fsCreateFile(name, "")) {
            openWindow("filesWindow");
            if (typeof renderFiles === "function") renderFiles();
            speak("Utworzyłem plik " + name);
        } else speak("Nie udało się");
        return;
    }

    /* folder */
    m = t.match(/(?:utw[oó]rz|stw[oó]rz)\s+folder(?:\s+o nazwie)?\s+([a-z0-9_\-ąćęłńóśźż]+)/i);
    if (m) {
        if (typeof fsCreateFolder === "function" && fsCreateFolder(m[1])) {
            openWindow("filesWindow");
            if (typeof renderFiles === "function") renderFiles();
            speak("Folder " + m[1] + " gotowy");
        } else speak("Nie utworzono");
        return;
    }

    /* usuń */
    m = t.match(/(?:usu[nń]|skasuj)\s+(?:plik\s+|folder\s+)?([a-z0-9_\-\.ąćęłńóśźż]+)/i);
    if (m) {
        if (typeof fsDelete === "function" && fsDelete(m[1])) {
            if (typeof renderFiles === "function") renderFiles();
            speak("Usunięto " + m[1]);
        } else speak("Nie znaleziono");
        return;
    }

    /* godzina */
    if (/która godzina|jaka godzina|godzina/.test(t)) {
        var now = new Date();
        var hh = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", hour12: false });
        speak("Jest " + hh);
        return;
    }

    /* wersja */
    if (/wersja|jaki system/.test(t)) {
        speak("Nexus OS wersja " + (window.NEXUS && NEXUS.version ? NEXUS.version : "0.8"));
        return;
    }

    /* pomoc */
    if (/pomoc|co potrafisz|help|komendy/.test(t)) {
        speak("Mogę otwierać aplikacje, tworzyć pliki i foldery, blokować ekran. Powiedz na przykład: otwórz terminal, utwórz plik notatka, otwórz lab.");
        openWindow("aiWindow");
        return;
    }

    /* fallback → AI chat */
    openWindow("aiWindow");
    setTimeout(function () {
        var input = document.getElementById("aiChatInput");
        if (input) {
            input.value = raw;
            if (typeof sendAIMessage === "function") sendAIMessage();
        }
    }, 250);
    speak("Przekazuję do AI");
}

/* przycisk w docku / HUD */
document.addEventListener("DOMContentLoaded", function () {
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = function () {
            window.speechSynthesis.getVoices();
        };
    }
});

// === END VOICE.JS ===
