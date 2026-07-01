/* =============================================================================
 * app.js — Application shell: state, tab routing, search, filters, theme,
 * progress, the detail modal, toasts and keyboard shortcuts. Runs last, after
 * data / store / render / quiz have registered their globals.
 * ========================================================================== */
(function (global) {
  "use strict";

  const D = global.PM_DATA;
  const S = global.PM_STORE;
  const R = global.PM_RENDER;
  const Q = global.PM_QUIZ;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---- App state ----
  const state = { tab: "processes", filter: "", area: "all", favoritesOnly: false };

  /* =========================================================================
   * Toasts
   * ====================================================================== */
  function toast(msg, icon = "fa-circle-check") {
    const stack = $("#toastStack");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<i class="fas ${icon}"></i>${R.escapeHtml(msg)}`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 250);
    }, 2200);
  }

  /* =========================================================================
   * Theme
   * ====================================================================== */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("#themeToggle");
    const dark = theme === "dark";
    btn.innerHTML = `<i class="fas ${dark ? "fa-sun" : "fa-moon"}"></i>`;
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  function initTheme() {
    const saved = S.getTheme();
    const prefersDark = global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    S.setTheme(next);
    applyTheme(next);
    toast(next === "dark" ? "Dark mode on" : "Light mode on", next === "dark" ? "fa-moon" : "fa-sun");
  }

  /* =========================================================================
   * Progress ring + bar
   * ====================================================================== */
  function updateProgress() {
    const done = S.learnedCount();
    const total = D.totalProcesses;
    const pct = total ? Math.round((done / total) * 100) : 0;

    $("#progressValue").textContent = `${done} / ${total} processes learned`;
    $("#progressFill").style.width = pct + "%";

    const ring = $("#progressRingFill");
    const r = ring.r.baseVal.value;
    const circ = 2 * Math.PI * r;
    ring.style.strokeDasharray = String(circ);
    ring.style.strokeDashoffset = String(circ * (1 - pct / 100));
    $("#progressPct").textContent = pct + "%";
  }

  /* =========================================================================
   * Filter chips (knowledge-area selector, shared across panels)
   * ====================================================================== */
  function buildAreaFilters() {
    const areas = ["all", ...Object.keys(D.KNOWLEDGE_AREAS)];
    $$('[data-role="kaFilter"]').forEach((container) => {
      container.innerHTML = areas
        .map((a) => {
          const label = a === "all" ? "All areas" : a;
          const on = a === state.area ? " active" : "";
          return `<button class="filter-chip${on}" data-area="${a}">${label}</button>`;
        })
        .join("");
      container.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          state.area = chip.dataset.area;
          syncAreaChips();
          renderActive();
        });
      });
    });
  }
  function syncAreaChips() {
    $$('[data-role="kaFilter"] .filter-chip').forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.area === state.area);
    });
  }

  /* =========================================================================
   * Rendering dispatch
   * ====================================================================== */
  function renderCounts() {
    $("#countDefinitions").textContent = D.definitions.length;
    $("#countInputs").textContent = sum(D.inputsData);
    $("#countTools").textContent = sum(D.toolsData);
    $("#countOutputs").textContent = sum(D.outputsData);
  }
  const sum = (obj) => Object.values(obj).reduce((n, arr) => n + arr.length, 0);

  function renderActive() {
    const f = state.filter;
    if (state.tab === "processes") {
      const res = R.renderMatrix({ filter: f, area: state.area, favoritesOnly: state.favoritesOnly });
      $("#matrixBody").innerHTML = res.html;
      $("#countProcesses").textContent = res.count;
      wireProcessChips();
    } else if (state.tab === "definitions") {
      const res = R.renderDefinitions(f);
      $("#definitionsGrid").innerHTML = res.html;
      $("#countDefinitions").textContent = res.count;
    } else if (state.tab === "inputs") {
      paintGrid(D.inputsData, "#inputsContainer", "#countInputs");
    } else if (state.tab === "tools") {
      paintGrid(D.toolsData, "#toolsContainer", "#countTools");
    } else if (state.tab === "outputs") {
      paintGrid(D.outputsData, "#outputsContainer", "#countOutputs");
    } else if (state.tab === "quiz") {
      Q.render($("#quizMount"), (right) => {
        if (right) toast("Correct!", "fa-circle-check");
      });
    }
  }
  function paintGrid(data, containerSel, countSel) {
    const res = R.renderKaGrid(data, { filter: state.filter, area: state.area });
    $(containerSel).innerHTML = res.html;
    $(countSel).textContent = res.count;
    wireCopyTags($(containerSel));
  }

  /* =========================================================================
   * Interaction wiring for freshly-rendered content
   * ====================================================================== */
  function wireProcessChips() {
    $$("#matrixBody .proc-item").forEach((chip) => {
      const open = () => openDetail(chip.dataset.id);
      chip.addEventListener("click", open);
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  }
  function wireCopyTags(root) {
    $$(".tag[data-copy]", root).forEach((tag) => {
      tag.addEventListener("click", () => copy(tag.dataset.copy));
    });
  }
  function copy(text) {
    const done = () => toast(`Copied “${text}”`, "fa-copy");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (_e) {}
    ta.remove();
  }

  /* =========================================================================
   * Detail modal
   * ====================================================================== */
  function openModal(innerHtml) {
    const overlay = $("#overlay");
    $("#overlayContent").innerHTML = innerHtml;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("#overlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  function openDetail(id) {
    const d = R.detailHtml(id);
    if (!d) return;
    const learned = S.isLearned(id);
    const marked = S.isBookmarked(id);
    openModal(`
      <div class="modal" style="--ka-hue:${d.hue}" role="dialog" aria-modal="true" aria-label="${R.escapeHtml(d.title)}">
        <div class="modal__head">
          <div class="modal__eyebrow">${R.escapeHtml(d.area)} · ${R.escapeHtml(d.group)}</div>
          <div class="modal__title">${R.escapeHtml(d.title)}</div>
          <button class="modal__close" data-close aria-label="Close"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal__body">
          ${d.body}
          <div class="modal__actions">
            <button class="btn btn--primary btn--block ${learned ? "is-on" : ""}" id="mLearn">
              <i class="fas ${learned ? "fa-circle-check" : "fa-circle"}"></i> ${learned ? "Learned" : "Mark as learned"}
            </button>
            <button class="btn btn--star ${marked ? "is-on" : ""}" id="mStar">
              <i class="fa-star ${marked ? "fas" : "far"}"></i> ${marked ? "Saved" : "Save"}
            </button>
            <button class="btn" id="mCopy"><i class="fas fa-copy"></i> Copy</button>
          </div>
        </div>
      </div>`);

    $("#mLearn").addEventListener("click", () => {
      const on = S.toggleLearned(id);
      toast(on ? "Marked as learned" : "Unmarked", on ? "fa-graduation-cap" : "fa-circle");
      updateProgress();
      renderActive();
      openDetail(id); // refresh modal button states
    });
    $("#mStar").addEventListener("click", () => {
      const on = S.toggleBookmark(id);
      toast(on ? "Saved to favorites" : "Removed from favorites", on ? "fa-star" : "fa-star");
      updateFavCount();
      renderActive();
      openDetail(id);
    });
    $("#mCopy").addEventListener("click", () => copy(d.title));
  }

  function openHelp() {
    const rows = [
      ["Focus search", "/"],
      ["Switch tabs", "1 – 6"],
      ["Toggle dark mode", "T"],
      ["Start quiz", "Q"],
      ["Close dialog", "Esc"],
    ];
    openModal(`
      <div class="modal" style="--ka-hue:250" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div class="modal__head">
          <div class="modal__eyebrow">Power user</div>
          <div class="modal__title">Keyboard Shortcuts</div>
          <button class="modal__close" data-close aria-label="Close"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal__body">
          <div class="shortcuts">
            ${rows.map((r) => `<div class="shortcuts__row"><span>${r[0]}</span><kbd>${r[1]}</kbd></div>`).join("")}
          </div>
        </div>
      </div>`);
  }

  /* =========================================================================
   * Tabs, favorites, search
   * ====================================================================== */
  function switchTab(tab) {
    state.tab = tab;
    $$("#tabNav .tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.dataset.tab === tab));
    renderActive();
  }
  function updateFavCount() {
    $("#favCount").textContent = S.bookmarkCount();
    const btn = $("#favToggle");
    btn.classList.toggle("active", state.favoritesOnly);
  }

  /* =========================================================================
   * Wire static controls once
   * ====================================================================== */
  function wireControls() {
    // Tabs
    $$("#tabNav .tab").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

    // Search
    const search = $("#globalSearch");
    const clear = $("#clearSearch");
    search.addEventListener("input", () => {
      state.filter = search.value.trim();
      clear.classList.toggle("visible", state.filter.length > 0);
      renderActive();
    });
    clear.addEventListener("click", () => {
      search.value = ""; state.filter = "";
      clear.classList.remove("visible");
      renderActive(); search.focus();
    });

    // Favorites-only toggle (processes panel)
    $("#favToggle").addEventListener("click", () => {
      state.favoritesOnly = !state.favoritesOnly;
      updateFavCount();
      if (state.tab !== "processes") switchTab("processes");
      else renderActive();
    });

    // Header actions
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#helpBtn").addEventListener("click", openHelp);
    $("#printBtn").addEventListener("click", () => global.print());
    $("#resetBtn").addEventListener("click", () => {
      if (confirm("Reset all learning progress? This cannot be undone.")) {
        S.resetProgress();
        updateProgress();
        renderActive();
        toast("Progress reset", "fa-rotate-left");
      }
    });

    // Modal close (backdrop + close buttons)
    $("#overlay").addEventListener("click", (e) => {
      if (e.target.id === "overlay" || e.target.closest("[data-close]")) closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") return closeModal();
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); $("#globalSearch").focus(); return; }
      if (e.key.toLowerCase() === "t") return toggleTheme();
      if (e.key.toLowerCase() === "q") return switchTab("quiz");
      const tabs = ["processes", "definitions", "inputs", "tools", "outputs", "quiz"];
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= tabs.length) switchTab(tabs[n - 1]);
    });
  }

  /* =========================================================================
   * Boot
   * ====================================================================== */
  function init() {
    initTheme();
    buildAreaFilters();
    renderCounts();
    updateProgress();
    updateFavCount();
    wireControls();
    renderActive();
    console.log("✅ PMP Cheatsheet — Modern Knowledge Dashboard ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
