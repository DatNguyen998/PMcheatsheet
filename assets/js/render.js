/* =============================================================================
 * render.js — Pure(ish) rendering functions that turn PM_DATA + user state
 * into HTML. Kept free of event wiring; app.js owns interaction. Exposed as
 * `PM_RENDER`.
 * ========================================================================== */
(function (global) {
  "use strict";

  const D = global.PM_DATA;
  const S = global.PM_STORE;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  // Highlight a search term inside already-escaped text.
  function highlight(text, term) {
    const safe = escapeHtml(text);
    if (!term) return safe;
    const idx = safe.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return safe;
    return (
      safe.slice(0, idx) +
      "<mark>" + safe.slice(idx, idx + term.length) + "</mark>" +
      safe.slice(idx + term.length)
    );
  }

  const hue = (area) => (D.KNOWLEDGE_AREAS[area] ? D.KNOWLEDGE_AREAS[area].hue : 250);
  const matches = (text, term) => !term || text.toLowerCase().includes(term.toLowerCase());

  /* ---------- Process matrix ---------- */
  function renderMatrix(opts) {
    const { filter = "", area = "all", favoritesOnly = false } = opts || {};
    const groups = D.PROCESS_GROUPS;
    let total = 0;
    let rows = "";

    Object.keys(D.processData).forEach((ka) => {
      if (area !== "all" && area !== ka) return;
      const meta = D.KNOWLEDGE_AREAS[ka];
      let cells = "";

      groups.forEach((pg) => {
        const items = (D.processData[ka][pg] || []).filter((title) => {
          const id = `${ka}::${title}`;
          if (favoritesOnly && !S.isBookmarked(id)) return false;
          return matches(title, filter);
        });

        if (items.length === 0) {
          cells += '<td><span class="empty-cell">—</span></td>';
        } else {
          const chips = items
            .map((title) => {
              total++;
              const id = `${ka}::${title}`;
              const learned = S.isLearned(id) ? " is-learned" : "";
              const star = S.isBookmarked(id) ? '<i class="fas fa-star star-dot"></i>' : "";
              return `<span class="proc-item${learned}" role="button" tabindex="0" data-id="${escapeHtml(id)}">${highlight(title, filter)}${star}</span>`;
            })
            .join(" ");
          cells += `<td>${chips}</td>`;
        }
      });

      rows += `<tr style="--ka-hue:${meta.hue}">
        <td class="ka-cell"><span class="ka-cell__name"><i class="fas ${meta.icon}"></i>${escapeHtml(ka)}</span></td>
        ${cells}
      </tr>`;
    });

    if (!rows) {
      rows = `<tr><td colspan="6"><div class="no-results"><i class="fas fa-inbox"></i>No processes match your filters.</div></td></tr>`;
    }
    return { html: rows, count: total };
  }

  /* ---------- Definitions ---------- */
  function renderDefinitions(filter) {
    let count = 0;
    const cards = D.definitions
      .filter((def) => matches(def.title, filter) || matches(def.text, filter))
      .map((def) => {
        count++;
        return `<div class="def-card">
          <div class="def-card__title"><i class="fas ${def.icon}"></i>${highlight(def.title, filter)}</div>
          <div class="def-card__body">${highlight(def.text, filter)}</div>
        </div>`;
      })
      .join("");
    return {
      html: cards || `<div class="no-results"><i class="fas fa-search"></i>No matching definitions</div>`,
      count,
    };
  }

  /* ---------- Inputs / Tools / Outputs grid ---------- */
  function renderKaGrid(data, opts) {
    const { filter = "", area = "all" } = opts || {};
    let total = 0;
    const cards = Object.keys(data)
      .filter((ka) => area === "all" || area === ka)
      .map((ka) => {
        const meta = D.KNOWLEDGE_AREAS[ka];
        const items = (data[ka] || []).filter((it) => matches(it, filter));
        if (filter && items.length === 0) return "";
        total += items.length;
        const tags = items
          .map((it) => `<span class="tag" data-copy="${escapeHtml(it)}">${highlight(it, filter)}</span>`)
          .join("") || '<span class="tag empty-tag">(none)</span>';
        return `<div class="ka-card" style="--ka-hue:${meta.hue}">
          <div class="ka-card__head"><i class="fas ${meta.icon}"></i>${escapeHtml(ka)}<span class="ka-card__count">${items.length}</span></div>
          <div class="ka-card__items">${tags}</div>
        </div>`;
      })
      .join("");
    return {
      html: cards || `<div class="no-results"><i class="fas fa-search"></i>No matching items</div>`,
      count: total,
    };
  }

  /* ---------- Detail modal contents ---------- */
  function detailHtml(id) {
    const proc = D.allProcesses.find((p) => p.id === id);
    if (!proc) return null;
    const meta = D.KNOWLEDGE_AREAS[proc.area];
    const def = D.definitions.find((d) => d.title === proc.area + " Management");
    const list = (arr) =>
      (arr || []).slice(0, 6).map((x) => `<span class="badge-pill">${escapeHtml(x)}</span>`).join("") ||
      '<span class="badge-pill">—</span>';

    return {
      hue: meta.hue,
      title: proc.title,
      area: proc.area,
      group: proc.group,
      body: `
        <div class="modal__badges">
          <span class="badge-pill"><i class="fas ${meta.icon}"></i> ${escapeHtml(proc.area)} Knowledge Area</span>
          <span class="badge-pill"><i class="fas fa-diagram-project"></i> ${escapeHtml(proc.group)}</span>
        </div>
        ${def ? `<p class="def-card__body">${escapeHtml(def.text)}</p>` : ""}
        <div class="modal__section"><h4><i class="fas fa-arrow-right-to-bracket"></i> Common Inputs</h4><div class="modal__badges">${list(D.inputsData[proc.area])}</div></div>
        <div class="modal__section"><h4><i class="fas fa-screwdriver-wrench"></i> Tools &amp; Techniques</h4><div class="modal__badges">${list(D.toolsData[proc.area])}</div></div>
        <div class="modal__section"><h4><i class="fas fa-arrow-right-from-bracket"></i> Common Outputs</h4><div class="modal__badges">${list(D.outputsData[proc.area])}</div></div>
      `,
    };
  }

  global.PM_RENDER = { escapeHtml, highlight, renderMatrix, renderDefinitions, renderKaGrid, detailHtml };
})(window);
