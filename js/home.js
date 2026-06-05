/* ══════════════════════════════════════
   PARTICLE HERO SLIDER — 4 slides
══════════════════════════════════════ */
let currentSlide = 0;
const totalSlides = 4;
let slideTimer = null;
let isTransitioning = false;

const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const hero = document.getElementById("heroSection");
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.alpha = 1;
    this.radius = Math.random() * 3 + 1;
    this.color = color;
    this.life = 0;
    this.maxLife = 60 + Math.random() * 40;
  }
  update() {
    this.life++;
    this.x += this.vx * (1 - this.life / this.maxLife);
    this.y += this.vy * (1 - this.life / this.maxLife);
    this.vy += 0.08;
    this.alpha = 1 - this.life / this.maxLife;
    this.radius *= 0.985;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.1, this.radius), 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace("1)", this.alpha + ")");
    ctx.fill();
  }
}

let particles = [];
let animFrame = null;

function spawnParticles() {
  const w = canvas.width,
    h = canvas.height;
  const colors = [
    "rgba(230,57,70,1)",
    "rgba(255,107,107,1)",
    "rgba(255,255,255,1)",
    "rgba(59,130,246,1)",
    "rgba(245,158,11,1)",
  ];
  const count = Math.min(280, Math.floor((w * h) / 4500));
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle(
        Math.random() * w,
        Math.random() * h,
        colors[Math.floor(Math.random() * colors.length)],
      ),
    );
  }
}

function animateParticles(onDone) {
  canvas.style.opacity = 1;
  spawnParticles();
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    particles = particles.filter((p) => p.life < p.maxLife);
    if (particles.length > 0) {
      animFrame = requestAnimationFrame(loop);
    } else {
      canvas.style.opacity = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onDone) onDone();
    }
  }
  animFrame = requestAnimationFrame(loop);
}

function goToSlide(n) {
  if (isTransitioning || n === currentSlide) return;
  isTransitioning = true;
  clearSlideTimer();
  const prev = currentSlide;
  currentSlide = n;
  updateDots();
  const slides = document.querySelectorAll(".hero-slide");
  slides[prev].classList.add("exiting");
  animateParticles(() => {
    slides[prev].classList.remove("active", "exiting");
    slides[currentSlide].classList.add("active");
    isTransitioning = false;
    startSlideTimer();
  });
}

function nextSlide() {
  goToSlide((currentSlide + 1) % totalSlides);
}
function prevSlide() {
  goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
}
function updateDots() {
  document
    .querySelectorAll(".hero-dot")
    .forEach((d, i) => d.classList.toggle("active", i === currentSlide));
}
function startSlideTimer() {
  slideTimer = setTimeout(() => nextSlide(), 5500);
}
function clearSlideTimer() {
  clearTimeout(slideTimer);
}
startSlideTimer();

/* ══════════════════════════════════════
   ROUTER
══════════════════════════════════════ */
function switchPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const el = document.getElementById("page-" + id);
  if (el) {
    el.classList.add("active");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateNavLinks(id);
  closeDrawer();
}
function updateNavLinks(id) {
  document.querySelectorAll("[data-page]").forEach((a) => {
    a.classList.remove("active");
    if (a.dataset.page === id) a.classList.add("active");
  });
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-page]");
  if (el) {
    e.preventDefault();
    switchPage(el.dataset.page);
  }
});
function nav(path) {
  if (window.Router) {
    window.Router.go(path);
  } else {
    window.location.href = path;
  }
}

/* HEADER SCROLL */
let lastY = 0;
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    const h = document.getElementById("siteHeader");
    h.classList.toggle("scrolled", y > 10);
    h.classList.toggle("hide", y > lastY && y > 80);
    lastY = y;
  },
  { passive: true },
);

/* HAMBURGER */
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("drawer").classList.add("open");
  document.getElementById("drawerOverlay").classList.add("open");
});
function closeDrawer() {
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawerOverlay").classList.remove("open");
}
document.getElementById("drawerClose").addEventListener("click", closeDrawer);
document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);

/* TABS */
function switchTab(btn, panelId) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(panelId)?.classList.add("active");
}

/* TOAST */
function toast(msg, type = "info") {
  const wrap = document.getElementById("toast-wrap");
  const t = document.createElement("div");
  t.className = "toast " + type;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  t.innerHTML = "<span>" + icon + "</span> " + msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-20px)";
    t.style.transition = ".3s";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/* NEWSLETTER */
function submitNewsletter(e) {
  e.preventDefault();
  const form = e.target;
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  if (!firstName || !lastName || !email) {
    toast("Please fill in all fields", "error");
    return;
  }
  toast("🎉 Welcome " + firstName + "! You're subscribed.", "success");
  form.reset();
}

/* TRACKING */
function trackPackage() {
  const val = document.getElementById("trackInput").value.trim();
  if (!val) {
    toast("Please enter a tracking ID", "error");
    return;
  }
  toast("Searching for " + val + "…", "info");
  setTimeout(
    () => toast("Demo: showing live tracking for " + val, "success"),
    1200,
  );
}
function restartDemo() {
  toast("Demo restarted", "info");
}

/* CONTACT */
function submitContact() {
  const inputs = document.querySelectorAll("#page-contact .form-input");
  let valid = true;
  inputs.forEach((i) => {
    if (i.tagName !== "SELECT" && !i.value.trim()) {
      i.style.borderColor = "var(--danger)";
      valid = false;
    } else {
      i.style.borderColor = "";
    }
  });
  if (!valid) {
    toast("Please fill in all required fields", "error");
    return;
  }
  toast("Message sent! We'll be in touch soon.", "success");
  inputs.forEach((i) => {
    if (i.tagName !== "SELECT") i.value = "";
  });
}

/* AI SUPPORT */
const SR = {
  track:
    "To track your package, go to the Map Track page and enter your tracking ID (e.g. OSC-2024-0892). You can see your live delivery on the map. Need more help?",
  book: "Booking a delivery is easy! Sign up or sign in, click 'Book Delivery', enter pickup and drop-off addresses, choose your speed, and pay securely via Paystack.",
  payment:
    "OffScape accepts card, bank transfer, and USSD via Paystack. Your money is held in escrow until delivery is confirmed.",
  pickman:
    "Great choice! To become a Pickman, click 'Get Started' and select the pickman role. You'll need: NIN document, driver's licence, vehicle insurance, plate photo, and guarantor form. Verification takes under 24 hours.",
  cancel:
    "You can cancel within 5 minutes for a full refund. After a Pickman has departed, a 50% cancellation fee applies.",
  default:
    "Thanks for reaching out! You can also email support@cabinetoffscape.com or call (+234) 911-033-9553. What specific can I help you with right now?",
};
function getResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes("track") || m.includes("package") || m.includes("where"))
    return SR.track;
  if (m.includes("book") || m.includes("delivery") || m.includes("order"))
    return SR.book;
  if (
    m.includes("pay") ||
    m.includes("card") ||
    m.includes("wallet") ||
    m.includes("money")
  )
    return SR.payment;
  if (
    m.includes("pickman") ||
    m.includes("pickman") ||
    m.includes("join") ||
    m.includes("driver")
  )
    return SR.pickman;
  if (m.includes("cancel")) return SR.cancel;
  return SR.default;
}
function openSupport() {
  const p = document.getElementById("supportPanel");
  p.classList.toggle("open");
  document.getElementById("fabBtn").innerHTML = p.classList.contains("open")
    ? '<span class="fab-ping"></span><i class="fa-solid fa-xmark"></i>'
    : '<span class="fab-ping"></span><i class="fa-solid fa-comment"></i>';
  if (p.classList.contains("open"))
    document.getElementById("supportInput").focus();
}
document.getElementById("supportClose").addEventListener("click", () => {
  document.getElementById("supportPanel").classList.remove("open");
  document.getElementById("fabBtn").innerHTML =
    '<span class="fab-ping"></span><i class="fa-solid fa-comment"></i>';
});
function addMsg(text, type) {
  const msgs = document.getElementById("supportMessages");
  const b = document.createElement("div");
  b.className = "msg-bubble " + type;
  b.textContent = text;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
}
function sendSupport() {
  const input = document.getElementById("supportInput");
  const msg = input.value.trim();
  if (!msg) return;
  addMsg(msg, "user");
  input.value = "";
  const msgs = document.getElementById("supportMessages");
  const typing = document.createElement("div");
  typing.className = "support-typing";
  typing.innerHTML =
    '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(
    () => {
      typing.remove();
      addMsg(getResponse(msg), "bot");
    },
    900 + Math.random() * 500,
  );
}
function quickReply(msg) {
  document.getElementById("supportInput").value = msg;
  sendSupport();
}

/* INIT */

const routes = {
  "/signin": "signin",
  "/signup": "signup",
  "/verify-pending": "verify-pending",
  "/verify-email": "verify:email",
  "/kyc-pending": "kyc-pending",
  "/dashboard/customer": "dash:customer",
  "/dashboard/merchant": "dash:merchant",
  "/dashboard/rider": "dash:rider",
  "/dashboard/admin": "dash:admin",
  "/dashboard/support": "dash:support",
};

const key = location.pathname;
const notFound = {
  "/js/notFound.js": "notfound",
};

// if(key in routes){
//   switchPage(routes[key]);
// } else if(key === "/"){
//   switchPage('home');
// } else {
//   switchPage('notfound');
// }
