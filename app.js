const nav = document.getElementById("siteNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const heroCenter = document.getElementById("heroCenter");
const heroTerminal = document.querySelector(".hero-terminal");
const heroLayout = document.getElementById("heroLayout");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

if (heroLayout) {
  heroLayout.classList.add("ready");
}

window.addEventListener("scroll", () => {
  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  if (!heroCenter || prefersReducedMotion) {
    return;
  }
  const depth = Math.min(window.scrollY / 420, 1);
  heroCenter.style.transform = `translateY(${depth * 42}px)`;
  heroCenter.style.opacity = String(1 - depth * 0.55);
});

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    document.body.classList.toggle("nav-open", navLinks.classList.contains("open"));
  });
}

if (navLinks) {
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
    });
  });
}

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el, i) => {
    if (!prefersReducedMotion) {
      el.style.transitionDelay = `${Math.min(i * 65, 260)}ms`;
    }
    revealObserver.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

document.querySelectorAll(".card").forEach((card) => {
  if (isCoarsePointer || prefersReducedMotion) {
    return;
  }
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
  });
});

if (heroTerminal && !isCoarsePointer && !prefersReducedMotion) {
  heroTerminal.addEventListener("mousemove", (event) => {
    const rect = heroTerminal.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    heroTerminal.style.transform = `perspective(1200px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.8).toFixed(2)}deg)`;
  });

  heroTerminal.addEventListener("mouseleave", () => {
    heroTerminal.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}

const logs = [
  { cls: "", txt: "$ boot --session red-team.ops" },
  { cls: "", txt: "$ init profile --user sooraj" },
  { cls: "log-good", txt: "Admin : Sooraj Balasubramaniyan", dock: true, pause: 640 },
  { cls: "", txt: "$ sync tradecraft --target web,linux" },
  { cls: "log-good", txt: "[+] Recon sweep complete: 6 hosts mapped" },
  { cls: "", txt: "[*] Nmap top-1000 with service probes initiated" },
  { cls: "log-warn", txt: "[!] Legacy TLS endpoint observed on staging node" },
  { cls: "", txt: "[*] Enumerating exposed paths: /.git /backup /debug" },
  { cls: "log-good", txt: "[+] Subdomain takeover checks: no dangling CNAME" },
  { cls: "", txt: "[*] Burp active scan profile: low-noise mode" },
  { cls: "log-hot", txt: "[!] IDOR candidate flagged in /api/v2/user/export" },
  { cls: "", txt: "[*] Preparing report artifacts and reproduction notes" },
  { cls: "log-good", txt: "[+] Defensive recommendation set generated" }
];

const terminalStream = document.getElementById("terminalStream");
let index = 0;

function hhmmss(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function setDockedState() {
  if (!heroLayout || heroLayout.classList.contains("docked")) {
    return;
  }
  heroLayout.classList.remove("boot");
  heroLayout.classList.add("docked");
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function pushLog(typed) {
  if (!terminalStream) {
    return;
  }
  const item = logs[index % logs.length];
  index += 1;

  const line = document.createElement("div");
  line.className = `log-line ${item.cls}`.trim();

  const time = document.createElement("span");
  time.className = "log-time";
  time.textContent = `[${hhmmss(new Date())}]`;

  const text = document.createElement("span");
  if (!typed) {
    text.textContent = item.txt;
  }

  line.appendChild(time);
  line.appendChild(text);
  terminalStream.appendChild(line);

  if (typed) {
    for (let i = 0; i < item.txt.length; i += 1) {
      text.textContent += item.txt[i];
      await wait(14);
    }
  }

  if (item.dock) {
    setDockedState();
  }

  while (terminalStream.children.length > 12) {
    terminalStream.removeChild(terminalStream.firstChild);
  }

  await wait(item.pause || 280);
}

async function streamLoop() {
  const typedBootLines = prefersReducedMotion ? 0 : 4;

  for (let i = 0; i < typedBootLines; i += 1) {
    await pushLog(true);
  }

  if (typedBootLines === 0 && heroLayout && heroLayout.classList.contains("boot")) {
    setDockedState();
  }

  while (true) {
    await pushLog(false);
    const nextDelay = 880 + Math.floor(Math.random() * 900);
    await wait(nextDelay);
  }
}

streamLoop();
