function runBootSequence() {
    const boot = document.getElementById("bootScreen");
    if (!boot) { finishBoot(); return; }

    // cząsteczki boota
    const holder = document.getElementById("bootParticles");
    if (holder) {
        for (let i = 0; i < 40; i++) {
            const p = document.createElement("div");
            p.className = "boot-particle";
            p.style.left = "50%";
            p.style.top = "50%";
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 220;
            p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
            p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
            p.style.animationDuration = (0.8 + Math.random() * 1.4) + "s";
            p.style.animationDelay = (Math.random() * 0.6) + "s";
            holder.appendChild(p);
        }
    }

    const statuses = [
        "Inicjalizacja rdzenia...",
        "Ładowanie modułów...",
        "Uruchamianie AI...",
        "Montowanie wirtualnego dysku...",
        "System gotowy."
    ];
    const statusEl = document.getElementById("bootStatus");
    const bar = document.getElementById("bootBar");
    let i = 0;

    const tick = setInterval(() => {
        if (statusEl) statusEl.textContent = statuses[i] || "";
        if (bar) bar.style.width = ((i + 1) / statuses.length * 100) + "%";
        i++;
        if (i >= statuses.length) {
            clearInterval(tick);
            setTimeout(() => {
                boot.classList.add("boot-out");
                setTimeout(() => {
                    boot.style.display = "none";
                    finishBoot();
                }, 800);
            }, 400);
        }
    }, 380);
}
