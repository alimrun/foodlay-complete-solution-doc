const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const state = {
  theme: "dark"
};

function applyTheme(next) {
  state.theme = next;
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("docs.theme", next);
  const icon = $("#theme-icon");
  if (icon) {
    icon.textContent = next === "dark" ? "🌙" : "☀️";
  }
}

function initTheme() {
  const saved = localStorage.getItem("docs.theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function initThemeToggle() {
  const btn = $("#theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });
}

function initActiveNav() {
  const url = new URL(window.location.href);
  const path = url.pathname.split("/").pop();
  const links = $$(".nav-links a");
  links.forEach(a => {
    const href = a.getAttribute("href");
    if ((path === "" || path === "/") && href === "index.html") {
      a.classList.add("active");
    } else if (href && href.endsWith(path)) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
}

function initMobileMenu() {
  const btn = $("#menu-toggle");
  const links = $(".nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.getAttribute("data-open") === "true";
    links.setAttribute("data-open", (!open).toString());
    links.style.display = open ? "" : "grid";
  });
}

function buildToc() {
  const toc = $("#toc");
  const content = $(".content");
  if (!toc || !content) return;
  const existing = $$("a", toc).length;
  if (existing) return;
  const headings = $$("h2, h3", content);
  headings.forEach(h => {
    if (!h.id) {
      h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    }
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    toc.appendChild(a);
  });
}

function initTocScrollspy() {
  const toc = $("#toc");
  const content = $(".content");
  if (!toc || !content) return;
  const links = $$("a", toc);
  const headings = links.map(a => {
    const id = a.getAttribute("href").slice(1);
    return $("#" + id);
  }).filter(Boolean);
  function activate() {
    const y = window.scrollY + 120;
    let current = null;
    for (const h of headings) {
      if (h.offsetTop <= y) current = h;
    }
    links.forEach(a => a.classList.remove("active"));
    if (current) {
      const target = $$("a", toc).find(a => a.getAttribute("href") === `#${current.id}`);
      if (target) target.classList.add("active");
    }
  }
  activate();
  document.addEventListener("scroll", activate, { passive: true });
}

function initSearch() {
  const input = $("#search");
  const toc = $("#toc");
  if (!input || !toc) return;
  input.addEventListener("keyup", () => {
    const q = input.value.trim().toLowerCase();
    const items = $$("a", toc);
    items.forEach(a => {
      const match = a.textContent.toLowerCase().includes(q);
      a.style.display = match ? "" : "none";
    });
  });
  window.addEventListener("keydown", e => {
    if (e.key === "/") {
      e.preventDefault();
      input.focus();
    }
  });
}

function init() {
  initTheme();
  initThemeToggle();
  initActiveNav();
  initMobileMenu();
  buildToc();
  initTocScrollspy();
  initSearch();
}

document.addEventListener("DOMContentLoaded", init);
