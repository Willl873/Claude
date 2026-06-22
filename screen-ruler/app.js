/* Actual Size Ruler
 * A calibrated on-screen ruler. All measurement math runs in millimetres
 * internally; pxPerMM is the single source of truth and is set by calibration.
 */
(() => {
  "use strict";

  const MM_PER_INCH = 25.4;
  const DEFAULT_PPI = 96; // CSS reference: 96 px === 1 inch before calibration
  const STORE = {
    ppi: "ruler.ppi",
    unit: "ruler.unit",
    orient: "ruler.orient",
    theme: "ruler.theme",
    snap: "ruler.snap",
    seen: "ruler.calibrated",
  };

  // ---- State -------------------------------------------------------------
  const state = {
    ppi: clampPpi(Number(localStorage.getItem(STORE.ppi)) || DEFAULT_PPI),
    unit: localStorage.getItem(STORE.unit) === "inch" ? "inch" : "cm",
    orient: localStorage.getItem(STORE.orient) === "vertical" ? "vertical" : "horizontal",
    snap: localStorage.getItem(STORE.snap) === "1",
    // marker positions stored in millimetres from the ruler origin
    aMM: 10,
    bMM: 60,
  };

  const get = (id) => document.getElementById(id);
  const els = {
    wrap: get("rulerWrap"),
    canvas: get("ruler"),
    markerA: get("markerA"),
    markerB: get("markerB"),
    distValue: get("distValue"),
    distUnit: get("distUnit"),
    posA: get("posA"),
    posB: get("posB"),
    footPpi: get("footPpi"),
    notice: get("calibNotice"),
  };
  const ctx = els.canvas.getContext("2d");

  // ---- Helpers -----------------------------------------------------------
  function clampPpi(v) {
    if (!isFinite(v) || v <= 0) return DEFAULT_PPI;
    return Math.min(1200, Math.max(30, v));
  }
  const pxPerMM = () => state.ppi / MM_PER_INCH;
  const axisPx = () =>
    state.orient === "horizontal" ? els.wrap.clientWidth : els.wrap.clientHeight;
  const maxMM = () => axisPx() / pxPerMM();

  function formatLength(mm) {
    if (state.unit === "cm") return (mm / 10).toFixed(2);
    return (mm / MM_PER_INCH).toFixed(3);
  }
  const unitLabel = () => (state.unit === "cm" ? "cm" : "in");

  function save() {
    localStorage.setItem(STORE.ppi, String(state.ppi));
    localStorage.setItem(STORE.unit, state.unit);
    localStorage.setItem(STORE.orient, state.orient);
    localStorage.setItem(STORE.snap, state.snap ? "1" : "0");
  }

  // ---- Canvas ruler rendering -------------------------------------------
  function drawRuler() {
    const wrap = els.wrap;
    const cssW = wrap.clientWidth;
    const cssH = wrap.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    els.canvas.width = Math.round(cssW * dpr);
    els.canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const horizontal = state.orient === "horizontal";
    const length = horizontal ? cssW : cssH; // along measurement axis
    const ppmm = pxPerMM();

    const styles = getComputedStyle(document.documentElement);
    const tickColor = styles.getPropertyValue("--tick").trim() || "#222";
    const tickSoft = styles.getPropertyValue("--tick-soft").trim() || "#888";
    const inkColor = styles.getPropertyValue("--ink").trim() || "#222";

    ctx.lineWidth = 1;
    ctx.font = "600 12px Inter, system-ui, sans-serif";
    ctx.textBaseline = "top";

    // Maps a position along the axis + a tick depth to canvas x/y, and draws.
    const drawTick = (pos, depth, color) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      if (horizontal) {
        const x = Math.round(pos) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, depth);
      } else {
        const y = Math.round(pos) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(depth, y);
      }
      ctx.stroke();
    };

    const drawLabel = (pos, depth, text) => {
      ctx.fillStyle = inkColor;
      if (horizontal) {
        ctx.textAlign = "left";
        ctx.fillText(text, Math.round(pos) + 4, depth + 2);
      } else {
        ctx.save();
        ctx.translate(depth + 2, Math.round(pos) + 4);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    };

    if (state.unit === "cm") {
      const totalMM = Math.floor(length / ppmm);
      for (let mm = 0; mm <= totalMM; mm++) {
        const pos = mm * ppmm;
        let depth, color;
        if (mm % 10 === 0) { depth = 46; color = tickColor; }
        else if (mm % 5 === 0) { depth = 30; color = tickColor; }
        else { depth = 18; color = tickSoft; }
        drawTick(pos, depth, color);
        if (mm % 10 === 0) drawLabel(pos, depth, String(mm / 10));
      }
    } else {
      // sixteenths of an inch
      const ppin = ppmm * MM_PER_INCH;
      const totalSx = Math.floor((length / ppin) * 16);
      for (let s = 0; s <= totalSx; s++) {
        const pos = (s / 16) * ppin;
        let depth, color;
        if (s % 16 === 0) { depth = 48; color = tickColor; }
        else if (s % 8 === 0) { depth = 36; color = tickColor; }   // 1/2"
        else if (s % 4 === 0) { depth = 28; color = tickColor; }   // 1/4"
        else if (s % 2 === 0) { depth = 20; color = tickSoft; }    // 1/8"
        else { depth = 13; color = tickSoft; }                     // 1/16"
        drawTick(pos, depth, color);
        if (s % 16 === 0) drawLabel(pos, depth, String(s / 16));
      }
    }
  }

  // ---- Markers -----------------------------------------------------------
  function clampMM(mm) {
    return Math.min(maxMM(), Math.max(0, mm));
  }

  function applySnap(mm) {
    return state.snap ? Math.round(mm) : mm;
  }

  function positionMarker(el, mm) {
    const px = mm * pxPerMM();
    if (state.orient === "horizontal") {
      el.style.left = px + "px";
      el.style.top = "";
    } else {
      el.style.top = px + "px";
      el.style.left = "";
    }
    el.setAttribute("aria-valuenow", formatLength(mm));
    el.setAttribute("aria-valuetext", `${formatLength(mm)} ${unitLabel()}`);
  }

  function renderMarkers() {
    state.aMM = clampMM(state.aMM);
    state.bMM = clampMM(state.bMM);
    positionMarker(els.markerA, state.aMM);
    positionMarker(els.markerB, state.bMM);
    els.markerA.setAttribute("aria-valuemax", maxMM().toFixed(0));
    els.markerB.setAttribute("aria-valuemax", maxMM().toFixed(0));
    updateReadout();
  }

  function updateReadout() {
    const dist = Math.abs(state.bMM - state.aMM);
    els.distValue.textContent = formatLength(dist);
    els.distUnit.textContent = unitLabel();
    els.posA.textContent = formatLength(state.aMM);
    els.posB.textContent = formatLength(state.bMM);
  }

  function eventPosToMM(clientX, clientY) {
    const rect = els.wrap.getBoundingClientRect();
    const px = state.orient === "horizontal" ? clientX - rect.left : clientY - rect.top;
    return clampMM(applySnap(px / pxPerMM()));
  }

  // Pointer dragging for a marker element bound to a state key.
  function makeDraggable(el, key) {
    el.addEventListener("pointerdown", (e) => {
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      const move = (ev) => {
        state[key] = eventPosToMM(ev.clientX, ev.clientY);
        renderMarkers();
      };
      const up = (ev) => {
        el.releasePointerCapture(e.pointerId);
        el.style.cursor = "";
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      e.preventDefault();
    });

    // Keyboard control
    el.addEventListener("keydown", (e) => {
      const big = e.shiftKey;
      let step = 0;
      const dec = state.unit === "cm" ? 1 : MM_PER_INCH / 16; // 1mm or 1/16"
      const fwd = ["ArrowRight", "ArrowDown"];
      const back = ["ArrowLeft", "ArrowUp"];
      if (fwd.includes(e.key)) step = (big ? dec * 10 : dec);
      else if (back.includes(e.key)) step = -(big ? dec * 10 : dec);
      else if (e.key === "Home") { state[key] = 0; renderMarkers(); e.preventDefault(); return; }
      else if (e.key === "End") { state[key] = maxMM(); renderMarkers(); e.preventDefault(); return; }
      else return;
      state[key] = clampMM(state[key] + step);
      renderMarkers();
      e.preventDefault();
    });
  }

  // Click on the ruler moves the nearest marker.
  els.wrap.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".marker")) return; // marker handles its own drag
    const mm = eventPosToMM(e.clientX, e.clientY);
    const nearest = Math.abs(mm - state.aMM) <= Math.abs(mm - state.bMM) ? "aMM" : "bMM";
    state[nearest] = mm;
    renderMarkers();
  });

  // ---- UI wiring ---------------------------------------------------------
  function setActive(selector, attr, value) {
    document.querySelectorAll(selector).forEach((b) => {
      b.classList.toggle("is-active", b.dataset[attr] === value);
    });
  }

  function applyOrientation() {
    els.wrap.dataset.orient = state.orient;
    setActive("[data-orient]", "orient", state.orient);
    drawRuler();
    renderMarkers();
  }

  function applyUnit() {
    setActive("[data-unit]", "unit", state.unit);
    drawRuler();
    renderMarkers();
  }

  document.querySelectorAll("[data-unit]").forEach((b) =>
    b.addEventListener("click", () => { state.unit = b.dataset.unit; save(); applyUnit(); })
  );
  document.querySelectorAll("[data-orient]").forEach((b) =>
    b.addEventListener("click", () => { state.orient = b.dataset.orient; save(); applyOrientation(); })
  );

  get("snapToggle").checked = state.snap;
  get("snapToggle").addEventListener("change", (e) => {
    state.snap = e.target.checked;
    save();
    if (state.snap) { state.aMM = Math.round(state.aMM); state.bMM = Math.round(state.bMM); }
    renderMarkers();
  });

  get("resetMarkers").addEventListener("click", () => {
    state.aMM = clampMM(10);
    state.bMM = clampMM(Math.min(60, maxMM() - 5));
    renderMarkers();
  });

  // ---- Theme -------------------------------------------------------------
  function applyTheme(theme) {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else if (theme === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    get("themeBtn").textContent = isDark() ? "☀️" : "🌙";
    drawRuler();
  }
  function isDark() {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme(localStorage.getItem(STORE.theme) || "auto");
  get("themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    localStorage.setItem(STORE.theme, next);
    applyTheme(next);
  });

  // ---- Fullscreen --------------------------------------------------------
  get("fullscreenBtn").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  // ---- Modals ------------------------------------------------------------
  function openModal(id) { get(id).hidden = false; }
  function closeModal(id) { get(id).hidden = true; }
  document.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", () => el.closest(".modal").hidden = true)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
  });

  get("helpBtn").addEventListener("click", () => openModal("helpModal"));

  // ---- Calibration -------------------------------------------------------
  const calib = {
    modal: get("calibModal"),
    card: get("calibCard"),
    slider: get("calibSlider"),
    ppiLabel: get("calibPpi"),
    widthLabel: get("calibWidthLabel"),
    refSelect: get("refSelect"),
    ppiInput: get("ppiInput"),
    // working PPI while the dialog is open
    workingPpi: state.ppi,
  };

  function refWidthMM() { return Number(calib.refSelect.value); }

  // Render the calibration card from the working PPI.
  function renderCalib() {
    const ppmm = clampPpi(calib.workingPpi) / MM_PER_INCH;
    const cardPx = refWidthMM() * ppmm;
    calib.card.style.setProperty("--card-w", cardPx + "px");
    calib.slider.value = String(cardPx);
    calib.ppiLabel.textContent = Math.round(calib.workingPpi);
    calib.ppiInput.value = calib.workingPpi.toFixed(1);
    const mm = refWidthMM();
    calib.widthLabel.textContent = `${(mm / 10).toFixed(2)} cm wide`;
  }

  // Slider sets card pixel width -> derive PPI for the chosen reference.
  calib.slider.addEventListener("input", () => {
    const cardPx = Number(calib.slider.value);
    const ppmm = cardPx / refWidthMM();
    calib.workingPpi = clampPpi(ppmm * MM_PER_INCH);
    renderCalib();
  });
  calib.refSelect.addEventListener("change", () => { syncSliderBounds(); renderCalib(); });
  calib.ppiInput.addEventListener("input", () => {
    const v = Number(calib.ppiInput.value);
    if (isFinite(v) && v > 0) { calib.workingPpi = clampPpi(v); renderCalib(); }
  });
  get("calibReset").addEventListener("click", () => {
    calib.workingPpi = DEFAULT_PPI;
    renderCalib();
  });

  // Slider drives card pixel width; bounds depend on the reference width.
  function syncSliderBounds() {
    const ppmmMax = 1200 / MM_PER_INCH;
    const ppmmMin = 30 / MM_PER_INCH;
    calib.slider.min = String(refWidthMM() * ppmmMin);
    calib.slider.max = String(refWidthMM() * ppmmMax);
  }

  function openCalibration() {
    calib.workingPpi = state.ppi;
    syncSliderBounds();
    renderCalib();
    openModal("calibModal");
  }
  get("calibrateBtn").addEventListener("click", openCalibration);
  get("noticeCalibBtn").addEventListener("click", openCalibration);

  get("calibSave").addEventListener("click", () => {
    state.ppi = clampPpi(calib.workingPpi);
    localStorage.setItem(STORE.seen, "1");
    save();
    closeModal("calibModal");
    els.notice.hidden = true;
    updatePpiLabels();
    drawRuler();
    renderMarkers();
  });

  // ---- Notice / labels ---------------------------------------------------
  function updatePpiLabels() {
    const txt = `${Math.round(state.ppi)} PPI`;
    els.footPpi.textContent = txt;
  }
  get("noticeClose").addEventListener("click", () => (els.notice.hidden = true));
  if (!localStorage.getItem(STORE.seen)) els.notice.hidden = false;

  // ---- Resize ------------------------------------------------------------
  let resizeRAF = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => { drawRuler(); renderMarkers(); });
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  document.addEventListener("fullscreenchange", onResize);
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      get("themeBtn").textContent = isDark() ? "☀️" : "🌙";
      drawRuler();
    });
  }

  // ---- Init --------------------------------------------------------------
  makeDraggable(els.markerA, "aMM");
  makeDraggable(els.markerB, "bMM");
  setActive("[data-unit]", "unit", state.unit);
  els.wrap.dataset.orient = state.orient;
  setActive("[data-orient]", "orient", state.orient);
  updatePpiLabels();
  // Defer first draw until layout settles.
  requestAnimationFrame(() => {
    drawRuler();
    state.bMM = clampMM(Math.min(state.bMM, maxMM() - 5));
    renderMarkers();
  });
})();
