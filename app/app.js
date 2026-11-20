// Leonida Legend — tracker + guide logic. Plain ES module, no dependencies,
// no network beyond the app's own data file. Progress lives in localStorage.

const STORE_KEY = "leonida-legend-earned-v1";

const state = {
  trophies: [],
  earned: new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")),
  selectedId: null,
  view: "tracker",
};

const $ = (sel) => document.querySelector(sel);

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...state.earned]));
}

function isRevealed(t) {
  return !t.secret || $("#spoilers").checked || state.earned.has(t.id);
}

function shownName(t) {
  return isRevealed(t) ? t.name : "Hidden trophy";
}

function shownDesc(t) {
  return isRevealed(t)
    ? t.description
    : "A hidden trophy. Reveal spoilers or earn it to see what it asks.";
}

function tierChip(t) {
  return `<span class="tier tier-${t.tier}">${t.tier}</span>`;
}

function renderProgress() {
  const total = state.trophies.length;
  const got = state.earned.size;
  const totalPts = state.trophies.reduce((s, t) => s + t.points, 0);
  const gotPts = state.trophies
    .filter((t) => state.earned.has(t.id))
    .reduce((s, t) => s + t.points, 0);
  $("#stat-count").textContent = `${got} / ${total} trophies`;
  $("#stat-points").textContent = `${gotPts} / ${totalPts} points`;
  const pct = total ? Math.round((got / total) * 100) : 0;
  $("#stat-pct").textContent = `${pct}%`;
  $("#progress-fill").style.width = `${pct}%`;
}

function trophyRow(t) {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "trophy" + (state.earned.has(t.id) ? " earned" : "")
    + (state.selectedId === t.id ? " selected" : "");
  btn.innerHTML = `
    <input class="tick" type="checkbox" ${state.earned.has(t.id) ? "checked" : ""}
      aria-label="Mark ${t.name} as earned">
    <span>
      <span class="name">${shownName(t)}</span>
      <span class="desc">${shownDesc(t)}</span>
      <span class="kind">${t.kind}</span>
      ${t.watch ? `<span class="warn-flag"> · ⚠ watch-out</span>` : ""}
    </span>
    ${tierChip(t)}`;
  btn.querySelector(".tick").addEventListener("click", (ev) => {
    ev.stopPropagation();
    toggleEarned(t.id);
  });
  btn.addEventListener("click", () => selectTrophy(t.id, true));
  li.appendChild(btn);
  return li;
}

function currentFilters() {
  return {
    q: $("#search").value.trim().toLowerCase(),
    kind: $("#kind-filter").value,
    tier: $("#tier-filter").value,
    hideEarned: $("#hide-earned").checked,
  };
}

function renderList() {
  const f = currentFilters();
  const list = $("#trophy-list");
  list.innerHTML = "";
  for (const t of state.trophies) {
    if (f.kind && t.kind !== f.kind) continue;
    if (f.tier && t.tier !== f.tier) continue;
    if (f.hideEarned && state.earned.has(t.id)) continue;
    if (f.q && !(`${t.name} ${t.description} ${t.kind}`.toLowerCase().includes(f.q))) continue;
    list.appendChild(trophyRow(t));
  }
  if (!list.children.length) {
    list.innerHTML = `<li class="detail-hint">No trophies match those filters.</li>`;
  }
}

function renderWatch() {
  const list = $("#watch-list");
  list.innerHTML = "";
  const watched = state.trophies.filter((t) => t.watch);
  $("#watch-count").textContent = watched.length;
  for (const t of watched) list.appendChild(trophyRow(t));
}

function selectTrophy(id, pushHash) {
  state.selectedId = id;
  const t = state.trophies.find((x) => x.id === id);
  if (!t) return;
  if (pushHash) history.replaceState(null, "", `#trophy-${id}`);
  const d = $("#detail");
  if (!isRevealed(t)) {
    d.innerHTML = `
      <span class="tier tier-${t.tier}">${t.tier}</span> <span class="kind">${t.kind} · ${t.points} pts</span>
      <h3 class="hidden-name">Hidden trophy</h3>
      <p class="official">This trophy is hidden on PSN. Its name, description
      and guide stay masked until you reveal spoilers or earn it.</p>
      <div class="earn-row"><input type="checkbox" id="detail-earned" ${state.earned.has(t.id) ? "checked" : ""}>
      <label for="detail-earned">Earned</label></div>`;
  } else {
    d.innerHTML = `
      <span class="tier tier-${t.tier}">${t.tier}</span> <span class="kind">${t.kind} · ${t.points} pts</span>
      <h3>${t.name}</h3>
      <p class="official">“${t.description}”</p>
      <p class="guide">${t.guide}</p>
      ${t.watch ? `<p class="watch"><strong>Watch out:</strong> ${t.watch}</p>` : ""}
      <p class="sources">Source: ${t.sources}</p>
      <div class="earn-row"><input type="checkbox" id="detail-earned" ${state.earned.has(t.id) ? "checked" : ""}>
      <label for="detail-earned">Earned</label></div>`;
  }
  d.querySelector("#detail-earned").addEventListener("change", () => toggleEarned(id));
  renderList();
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned();
  renderProgress();
  renderList();
  renderWatch();
  if (state.selectedId === id) selectTrophy(id, false);
}

function setView(view) {
  state.view = view;
  for (const v of ["tracker", "roadmap", "watch"]) {
    $(`#view-${v}`).classList.toggle("active", v === view);
  }
  document.querySelectorAll(".tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view));
}

function applyHash() {
  const h = location.hash;
  if (h === "#roadmap") setView("roadmap");
  else if (h === "#watch") setView("watch");
  else if (h.startsWith("#trophy-")) {
    setView("tracker");
    selectTrophy(Number(h.slice("#trophy-".length)), false);
  } else setView("tracker");
}

function exportProgress() {
  const payload = {
    app: "leonida-legend",
    version: 1,
    earned: [...state.earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-legend-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  if (!file) return;
  file.text().then((text) => {
    try {
      const data = JSON.parse(text);
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      state.earned = new Set(ids.filter((id) => state.trophies.some((t) => t.id === id)));
      saveEarned();
      renderProgress();
      renderList();
      renderWatch();
      if (state.selectedId) selectTrophy(state.selectedId, false);
    } catch {
      alert("That file does not look like a Leonida Legend progress export.");
    }
  });
}

async function init() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  state.trophies = data.trophies;
  const kinds = [...new Set(state.trophies.map((t) => t.kind))].sort();
  const sel = $("#kind-filter");
  for (const k of kinds) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k[0].toUpperCase() + k.slice(1);
    sel.appendChild(opt);
  }
  for (const id of ["search", "kind-filter", "tier-filter", "hide-earned", "spoilers"]) {
    $("#" + id).addEventListener("input", () => { renderList(); renderWatch(); });
  }
  document.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => {
      location.hash = b.dataset.view === "tracker" ? "" : `#${b.dataset.view}`;
      setView(b.dataset.view);
    }));
  window.addEventListener("hashchange", applyHash);
  $("#export-btn").addEventListener("click", exportProgress);
  $("#import-file").addEventListener("change", (ev) => importProgress(ev.target.files[0]));
  renderProgress();
  renderList();
  renderWatch();
  applyHash();
}

init();
