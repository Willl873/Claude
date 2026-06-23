/* ===== Sole — feet rater =====
 * Two engines:
 *   1. On-device: real pixel analysis (skin detection -> smoothness, tone
 *      evenness, proportions, symmetry, health). Nothing leaves the browser.
 *   2. Claude AI: sends the photo to Claude Opus 4.8 vision with the user's own
 *      API key, directly from the browser.
 * Everything is deterministic per image, animated, and saved to a local gallery.
 */

const $ = (sel) => document.querySelector(sel);
const CIRC = 2 * Math.PI * 60; // gauge circumference (r=60)

const els = {
  intake: $("#intakeCard"),
  analyzing: $("#analyzingCard"),
  result: $("#resultCard"),
  history: $("#historySection"),
  dropzone: $("#dropzone"),
  fileInput: $("#fileInput"),
  modeBtns: document.querySelectorAll(".seg__btn[data-mode]"),
  aiPanel: $("#aiPanel"),
  apiKey: $("#apiKey"),
  forgetKey: $("#forgetKey"),
  scanImg: $("#scanImg"),
  analyzingStatus: $("#analyzingStatus"),
  resultImg: $("#resultImg"),
  engineBadge: $("#engineBadge"),
  gaugeFill: $("#gaugeFill"),
  overallScore: $("#overallScore"),
  verdict: $("#verdict"),
  gradeLine: $("#gradeLine"),
  bars: $("#bars"),
  confidenceLine: $("#confidenceLine"),
  againBtn: $("#againBtn"),
  shareBtn: $("#shareBtn"),
  historyStrip: $("#historyStrip"),
  clearHistory: $("#clearHistory"),
  streakNum: $("#streakNum"),
  bestNum: $("#bestNum"),
  consentModal: $("#consentModal"),
  consentAccept: $("#consentAccept"),
  shareCanvas: $("#shareCanvas"),
};

const CRITERIA = [
  { key: "proportions", name: "Proportions", hint: "balance & elongation" },
  { key: "shape", name: "Foot shape", hint: "arch & symmetry" },
  { key: "skinQuality", name: "Skin quality", hint: "smoothness" },
  { key: "skinColor", name: "Skin tone", hint: "evenness" },
  { key: "health", name: "Health", hint: "vitality" },
];

const state = { mode: "local", current: null };

/* ---------- storage ---------- */
const LS = {
  consent: "sole.consent.v1",
  history: "sole.history.v1",
  streak: "sole.streak.v1",
  key: "sole.apikey.v1",
};
const loadJSON = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; }
};
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ===================================================================== */
/* Boot                                                                  */
/* ===================================================================== */
function boot() {
  if (!localStorage.getItem(LS.consent)) {
    els.consentModal.hidden = false;
  }
  els.consentAccept.addEventListener("click", () => {
    localStorage.setItem(LS.consent, "1");
    els.consentModal.hidden = true;
  });

  // mode toggle
  els.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // saved key
  const savedKey = localStorage.getItem(LS.key);
  if (savedKey) els.apiKey.value = savedKey;
  els.apiKey.addEventListener("change", () => {
    const v = els.apiKey.value.trim();
    if (v) localStorage.setItem(LS.key, v); else localStorage.removeItem(LS.key);
  });
  els.forgetKey.addEventListener("click", () => {
    els.apiKey.value = "";
    localStorage.removeItem(LS.key);
  });

  // intake interactions
  els.dropzone.addEventListener("click", () => els.fileInput.click());
  els.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.fileInput.click(); }
  });
  els.fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });
  ["dragenter", "dragover"].forEach((ev) =>
    els.dropzone.addEventListener(ev, (e) => { e.preventDefault(); els.dropzone.classList.add("is-drag"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    els.dropzone.addEventListener(ev, (e) => { e.preventDefault(); els.dropzone.classList.remove("is-drag"); })
  );
  els.dropzone.addEventListener("drop", (e) => {
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) handleFile(item.getAsFile());
  });

  els.againBtn.addEventListener("click", reset);
  els.shareBtn.addEventListener("click", shareCard);
  els.clearHistory.addEventListener("click", () => {
    if (confirm("Clear your whole gallery?")) { saveJSON(LS.history, []); renderHistory(); }
  });

  renderStats();
  renderHistory();
}

function setMode(mode) {
  state.mode = mode;
  els.modeBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  els.aiPanel.hidden = mode !== "ai";
}

/* ===================================================================== */
/* Intake -> analyze                                                     */
/* ===================================================================== */
async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("That doesn't look like an image. Try a JPG or PNG.");
    return;
  }
  if (state.mode === "ai" && !els.apiKey.value.trim()) {
    alert("Paste your Anthropic API key to use Claude AI mode — or switch to On-device.");
    return;
  }

  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  // go to analyzing screen
  els.scanImg.src = dataUrl;
  show(els.analyzing);
  hide(els.intake);

  let scores;
  try {
    if (state.mode === "ai") {
      cycleStatus(["Sending to Claude…", "Claude is looking closely…", "Forming a verdict…"]);
      scores = await analyzeWithClaude(file, dataUrl);
    } else {
      cycleStatus(["Reading the pixels…", "Detecting skin tones…", "Measuring proportions…", "Scoring…"]);
      await delay(900); // let the scan animation breathe
      scores = analyzeLocally(img);
    }
  } catch (err) {
    stopStatus();
    alert("Couldn't analyse that one.\n\n" + (err?.message || err));
    reset();
    return;
  }
  stopStatus();

  scores.image = dataUrl;
  scores.engine = state.mode === "ai" ? "Claude AI" : "On-device";
  scores.ts = Date.now();
  state.current = scores;

  revealResult(scores);
  if (scores.confidence === undefined || scores.confidence >= 0.35) {
    pushHistory(scores);
    bumpStreak();
  }
}

/* status text cycling during analysis */
let statusTimer = null;
function cycleStatus(list) {
  let i = 0;
  els.analyzingStatus.textContent = list[0];
  stopStatus();
  statusTimer = setInterval(() => {
    i = (i + 1) % list.length;
    els.analyzingStatus.textContent = list[i];
  }, 1100);
}
function stopStatus() { if (statusTimer) clearInterval(statusTimer); statusTimer = null; }

/* ===================================================================== */
/* On-device analysis                                                    */
/* ===================================================================== */
function analyzeLocally(img) {
  const MAX = 224;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const skin = new Uint8Array(w * h);
  const lum = new Float32Array(w * h);
  let skinCount = 0;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  let sumCr = 0, sumCb = 0, sumCr2 = 0, sumCb2 = 0;
  let sumL = 0, sumL2 = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const r = data[p], g = data[p + 1], b = data[p + 2];
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      lum[y * w + x] = Y;
      const isSkin =
        Cb >= 77 && Cb <= 130 && Cr >= 133 && Cr <= 175 &&
        r > 50 && g > 30 && b > 15 && r >= g - 8 && g >= b - 8;
      if (isSkin) {
        skin[y * w + x] = 1;
        skinCount++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        sumCr += Cr; sumCb += Cb; sumCr2 += Cr * Cr; sumCb2 += Cb * Cb;
        sumL += Y; sumL2 += Y * Y;
      }
    }
  }

  const total = w * h;
  const skinFrac = skinCount / total;
  const confidence = clamp(mapRange(skinFrac, 0.015, 0.10, 0, 1), 0, 1) *
                     clamp(mapRange(skinFrac, 0.85, 0.55, 0, 1), 0, 1);

  // --- texture / smoothness over skin: mean neighbour luminance gradient ---
  let gradSum = 0, gradN = 0;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const idx = y * w + x;
      if (!skin[idx]) continue;
      if (skin[idx + 1]) { gradSum += Math.abs(lum[idx] - lum[idx + 1]); gradN++; }
      if (skin[idx + w]) { gradSum += Math.abs(lum[idx] - lum[idx + w]); gradN++; }
    }
  }
  const texture = gradN ? gradSum / gradN : 12; // ~0 (glassy) .. ~25 (rough)

  // --- tone evenness: chroma std-dev over skin ---
  const meanCr = skinCount ? sumCr / skinCount : 150;
  const meanCb = skinCount ? sumCb / skinCount : 110;
  const stdCr = skinCount ? Math.sqrt(Math.max(0, sumCr2 / skinCount - meanCr * meanCr)) : 12;
  const stdCb = skinCount ? Math.sqrt(Math.max(0, sumCb2 / skinCount - meanCb * meanCb)) : 12;
  const toneSpread = (stdCr + stdCb) / 2; // ~3 (even) .. ~16 (blotchy)

  const meanL = skinCount ? sumL / skinCount : 128;
  const stdL = skinCount ? Math.sqrt(Math.max(0, sumL2 / skinCount - meanL * meanL)) : 40;

  // --- proportions: bounding box elongation + fill ---
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const elong = Math.max(bw, bh) / Math.min(bw, bh); // 1 (square) .. 4+
  const fill = skinCount / (bw * bh); // how solidly the box is filled

  // --- symmetry along the longer axis (downsampled mask) ---
  const sym = symmetryScore(skin, w, h, minX, minY, bw, bh, bw >= bh);

  /* ---- map raw metrics to 0..10 ---- */
  // proportions: ideal elongation ~2.0-2.7, decent fill
  const elongScore = elong <= 2.4
    ? mapRange(elong, 1.0, 2.4, 5.4, 9.6)
    : mapRange(elong, 2.4, 4.2, 9.6, 6.0);
  const fillScore = mapRange(fill, 0.32, 0.62, 6.0, 9.4);
  const proportions = clampScore(0.62 * elongScore + 0.38 * fillScore);

  // shape: symmetry-led, lifted by clean fill
  const shape = clampScore(0.7 * mapRange(sym, 0.45, 0.9, 5.0, 9.8) + 0.3 * fillScore);

  // skin quality: smoother => higher
  const skinQuality = clampScore(mapRange(texture, 16, 3.5, 5.0, 9.8));

  // skin tone: more even => higher; light penalty for extreme exposure spread
  const tone = mapRange(toneSpread, 14, 3.5, 5.2, 9.7);
  const exposurePenalty = mapRange(stdL, 78, 38, -1.2, 0);
  const skinColor = clampScore(tone + exposurePenalty);

  // health: evenness + smoothness + healthy warmth (Cr not too high) + good light
  const warmth = mapRange(Math.abs(meanCr - 150), 26, 4, 6.0, 9.4); // closeness to healthy red-chroma
  const brightness = meanL >= 90 && meanL <= 200
    ? mapRange(Math.abs(meanL - 150), 60, 0, 7.0, 9.6)
    : mapRange(Math.min(Math.abs(meanL - 90), Math.abs(meanL - 200)), 0, 50, 7.0, 4.8);
  const health = clampScore(0.34 * skinQuality + 0.26 * skinColor + 0.22 * warmth + 0.18 * brightness);

  const scores = { proportions, shape, skinQuality, skinColor, health };
  scores.overall = clampScore(
    0.20 * proportions + 0.20 * shape + 0.25 * skinQuality + 0.15 * skinColor + 0.20 * health
  );
  scores.confidence = confidence;
  scores.verdict = pickVerdict(scores.overall, scores, confidence);
  return scores;
}

/* downsample skin mask to a grid and measure mirror overlap (IoU) */
function symmetryScore(skin, w, h, minX, minY, bw, bh, horizontalAxis) {
  const G = 28;
  const grid = new Float32Array(G * G);
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      const sx = minX + Math.floor((gx / G) * bw);
      const sy = minY + Math.floor((gy / G) * bh);
      grid[gy * G + gx] = skin[sy * w + sx] ? 1 : 0;
    }
  }
  let inter = 0, uni = 0;
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      const a = grid[gy * G + gx];
      const b = horizontalAxis
        ? grid[gy * G + (G - 1 - gx)]      // mirror across vertical centre line
        : grid[(G - 1 - gy) * G + gx];     // mirror across horizontal centre line
      if (a || b) uni++;
      if (a && b) inter++;
    }
  }
  return uni ? inter / uni : 0.6;
}

/* ===================================================================== */
/* Claude AI analysis                                                    */
/* ===================================================================== */
async function analyzeWithClaude(file, dataUrl) {
  const key = els.apiKey.value.trim();
  const base64 = dataUrl.split(",")[1];
  const mediaType = (dataUrl.match(/^data:(.*?);/) || [])[1] || file.type || "image/jpeg";

  const schema = {
    type: "object",
    properties: {
      is_feet: { type: "boolean", description: "true only if the image clearly shows human foot/feet of an adult" },
      proportions: { type: "number" },
      foot_shape: { type: "number" },
      skin_quality: { type: "number" },
      skin_color: { type: "number" },
      health: { type: "number" },
      overall: { type: "number" },
      verdict: { type: "string", description: "one witty but kind sentence, under 18 words" },
    },
    required: ["is_feet", "proportions", "foot_shape", "skin_quality", "skin_color", "health", "overall", "verdict"],
    additionalProperties: false,
  };

  const prompt =
    "You are Sole, a playful but fair judge of feet for an entertainment app. " +
    "Rate the foot in this photo from 0 to 10 (one decimal place) on five criteria: " +
    "proportions, foot_shape, skin_quality, skin_color (evenness/healthiness of tone), and health. " +
    "Give an 'overall' that reflects the blend. Keep the verdict light, specific, and never cruel. " +
    "If the image does not clearly show the feet of an adult, set is_feet=false, all scores to 0, " +
    "and put a gentle note in 'verdict'.";

  const body = {
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: { format: { type: "json_schema", schema } },
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: prompt },
      ],
    }],
  };

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    let msg = `HTTP ${resp.status}`;
    try { const e = await resp.json(); msg = e?.error?.message || msg; } catch {}
    if (resp.status === 401) msg = "That API key was rejected. Check it and try again.";
    throw new Error(msg);
  }

  const json = await resp.json();
  if (json.stop_reason === "refusal") {
    throw new Error("Claude declined to rate this image.");
  }
  const textBlock = (json.content || []).find((b) => b.type === "text");
  if (!textBlock) throw new Error("No rating came back.");
  const out = JSON.parse(textBlock.text);

  if (out.is_feet === false) {
    const e = new Error(out.verdict || "Claude didn't find adult feet in that photo.");
    e.notFeet = true;
    throw e;
  }

  const scores = {
    proportions: clampScore(out.proportions),
    shape: clampScore(out.foot_shape),
    skinQuality: clampScore(out.skin_quality),
    skinColor: clampScore(out.skin_color),
    health: clampScore(out.health),
    overall: clampScore(out.overall),
    verdict: out.verdict || pickVerdict(clampScore(out.overall), {}, 1),
  };
  return scores;
}

/* ===================================================================== */
/* Reveal                                                                */
/* ===================================================================== */
function revealResult(s) {
  show(els.result);
  hide(els.analyzing);

  els.resultImg.src = s.image;
  els.engineBadge.textContent = s.engine;
  els.verdict.textContent = s.verdict;
  els.gradeLine.textContent = gradeFor(s.overall);

  // confidence (on-device only)
  if (s.engine === "On-device" && s.confidence !== undefined && s.confidence < 0.7) {
    els.confidenceLine.hidden = false;
    els.confidenceLine.textContent = s.confidence < 0.35
      ? "Hmm — not sure that's a foot. Scored anyway, but take it with a wink."
      : "Lighting or framing made this a little tricky — confidence is moderate.";
  } else {
    els.confidenceLine.hidden = true;
  }

  // gauge
  const color = scoreColor(s.overall);
  els.gaugeFill.style.stroke = color;
  els.gaugeFill.style.strokeDashoffset = CIRC;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    els.gaugeFill.style.strokeDashoffset = CIRC * (1 - s.overall / 10);
  }));
  countUp(els.overallScore, s.overall);
  els.result.classList.toggle("is-celebrating", s.overall >= 8.5);

  // bars
  els.bars.innerHTML = "";
  CRITERIA.forEach((c, i) => {
    const v = s[c.key];
    const li = document.createElement("li");
    li.className = "bar__row";
    li.innerHTML = `
      <div class="bar__meta">
        <span class="bar__name">${c.name} <span class="bar__hint">· ${c.hint}</span></span>
        <span class="bar__val">${v.toFixed(1)}</span>
      </div>
      <div class="bar__track"><div class="bar__fill"></div></div>`;
    els.bars.appendChild(li);
    const fill = li.querySelector(".bar__fill");
    setTimeout(() => { fill.style.width = (v * 10) + "%"; }, 120 + i * 90);
  });
}

function countUp(el, target) {
  const dur = 950, start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(1);
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = target.toFixed(1);
  }
  requestAnimationFrame(frame);
}

/* ===================================================================== */
/* History + streak + stats                                              */
/* ===================================================================== */
function pushHistory(s) {
  const hist = loadJSON(LS.history, []);
  hist.unshift({
    image: s.image, overall: s.overall, engine: s.engine, ts: s.ts,
    verdict: s.verdict,
    proportions: s.proportions, shape: s.shape, skinQuality: s.skinQuality,
    skinColor: s.skinColor, health: s.health,
  });
  saveJSON(LS.history, hist.slice(0, 24));
  renderHistory();
  renderStats();
}

function renderHistory() {
  const hist = loadJSON(LS.history, []);
  els.historyStrip.innerHTML = "";
  if (!hist.length) { els.history.hidden = true; return; }
  els.history.hidden = false;
  const best = Math.max(...hist.map((h) => h.overall));
  hist.forEach((h) => {
    const btn = document.createElement("button");
    btn.className = "hist" + (h.overall === best ? " is-best" : "");
    btn.type = "button";
    btn.title = `${h.overall.toFixed(1)} · ${h.engine} · ${new Date(h.ts).toLocaleDateString()}`;
    btn.innerHTML = `
      <div class="hist__imgwrap">
        ${h.overall === best ? '<span class="hist__crown" aria-hidden="true">👑</span>' : ""}
        <img class="hist__img" src="${h.image}" alt="Rated ${h.overall.toFixed(1)}" />
        <span class="hist__score">${h.overall.toFixed(1)}</span>
      </div>`;
    btn.addEventListener("click", () => {
      const view = {
        image: h.image, engine: h.engine, overall: h.overall, confidence: 1,
        verdict: h.verdict || pickVerdict(h.overall, {}, 1),
        proportions: h.proportions ?? h.overall,
        shape: h.shape ?? h.overall,
        skinQuality: h.skinQuality ?? h.overall,
        skinColor: h.skinColor ?? h.overall,
        health: h.health ?? h.overall,
      };
      state.current = view;
      revealResult(view);
      hide(els.intake);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    els.historyStrip.appendChild(btn);
  });
}

function bumpStreak() {
  const today = new Date().toDateString();
  const st = loadJSON(LS.streak, { count: 0, last: null });
  if (st.last === today) { /* already counted today */ }
  else {
    const y = new Date(); y.setDate(y.getDate() - 1);
    st.count = st.last === y.toDateString() ? st.count + 1 : 1;
    st.last = today;
    saveJSON(LS.streak, st);
  }
  renderStats();
}

function renderStats() {
  const st = loadJSON(LS.streak, { count: 0, last: null });
  els.streakNum.textContent = st.count || 0;
  const hist = loadJSON(LS.history, []);
  els.bestNum.textContent = hist.length ? Math.max(...hist.map((h) => h.overall)).toFixed(1) : "—";
}

/* ===================================================================== */
/* Share card                                                            */
/* ===================================================================== */
async function shareCard() {
  const s = state.current;
  if (!s) return;
  const cv = els.shareCanvas, ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1c1016"); bg.addColorStop(1, "#0f0a0d");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.34, 40, W * 0.5, H * 0.34, 620);
  glow.addColorStop(0, "rgba(255,150,110,0.32)"); glow.addColorStop(1, "rgba(255,150,110,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // photo (rounded square)
  try {
    const img = await loadImage(s.image);
    const ps = 560, px = (W - ps) / 2, py = 150;
    roundRect(ctx, px, py, ps, ps, 36); ctx.save(); ctx.clip();
    const r = Math.max(ps / img.width, ps / img.height);
    const dw = img.width * r, dh = img.height * r;
    ctx.drawImage(img, px + (ps - dw) / 2, py + (ps - dh) / 2, dw, dh);
    ctx.restore();
  } catch {}

  // brand
  ctx.fillStyle = "#ffb27a";
  ctx.font = "700 46px Segoe UI, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🦶 Sole", W / 2, 96);

  // big score
  ctx.fillStyle = scoreColor(s.overall);
  ctx.font = "800 220px Segoe UI, system-ui, sans-serif";
  ctx.fillText(s.overall.toFixed(1), W / 2, 940);
  ctx.fillStyle = "#b9a6a3";
  ctx.font = "600 40px Segoe UI, system-ui, sans-serif";
  ctx.fillText("out of 10  ·  " + gradeFor(s.overall), W / 2, 1000);

  // verdict (wrapped)
  ctx.fillStyle = "#f6ece9";
  ctx.font = "600 38px Segoe UI, system-ui, sans-serif";
  wrapText(ctx, s.verdict, W / 2, 1080, W - 200, 50);

  // footer
  ctx.fillStyle = "#8c7a78";
  ctx.font = "500 28px Segoe UI, system-ui, sans-serif";
  ctx.fillText("rated with " + (s.engine || "Sole"), W / 2, H - 60);

  cv.toBlob(async (blob) => {
    const file = new File([blob], "sole-score.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "My Sole score", text: `My feet scored ${s.overall.toFixed(1)}/10 on Sole 🦶` }); return; }
      catch { /* fall through to download */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sole-score.png"; a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/* ===================================================================== */
/* Verdicts & grading                                                    */
/* ===================================================================== */
const VERDICTS = {
  low: [
    "Character over convention — these feet have stories to tell.",
    "Not the podium today, but every sole deserves love.",
    "Rugged, lived-in, gloriously unbothered by the scoreboard.",
  ],
  mid: [
    "Solid, dependable, quietly handsome feet.",
    "A respectable showing — comfortable in their own skin.",
    "Good bones and a fair complexion. Nothing to hide here.",
  ],
  high: [
    "Genuinely lovely — proportioned like they planned it.",
    "Smooth, even, and well-balanced. A pleasure to score.",
    "These could moonlight in a moisturiser advert.",
  ],
  elite: [
    "Statuesque. Museums would clear a plinth for these.",
    "Near-flawless — symmetry, tone, the whole arch.",
    "Top-shelf tootsies. The judges are on their feet.",
  ],
};
function pickVerdict(overall, scores, confidence) {
  if (confidence !== undefined && confidence < 0.35) {
    return "We weren't totally sure that was a foot — here's a playful guess.";
  }
  const band = overall >= 9 ? "elite" : overall >= 7.5 ? "high" : overall >= 5.5 ? "mid" : "low";
  const arr = VERDICTS[band];
  // deterministic pick from the score so the same image keeps its line
  const seed = Math.round(overall * 73 + (scores?.skinQuality || 0) * 31 + (scores?.shape || 0) * 17);
  return arr[seed % arr.length];
}
function gradeFor(v) {
  if (v >= 9.3) return "Sole of the year";
  if (v >= 8.5) return "Exceptional";
  if (v >= 7.5) return "Very good";
  if (v >= 6.5) return "Good";
  if (v >= 5.5) return "Fair";
  if (v >= 4) return "Rough around the edges";
  return "Brave of you to ask";
}
function scoreColor(v) {
  if (v >= 8.5) return "#7be0a4";
  if (v >= 7) return "#ffd27a";
  if (v >= 5.5) return "#ffb27a";
  return "#ff7e9d";
}

/* ===================================================================== */
/* Helpers                                                               */
/* ===================================================================== */
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }
function reset() {
  state.current = null;
  hide(els.result);
  hide(els.analyzing);
  show(els.intake);
  els.fileInput.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clampScore = (v) => Math.round(clamp(Number(v) || 0, 0, 10) * 10) / 10;
function mapRange(v, inA, inB, outA, outB) {
  const t = (v - inA) / (inB - inA);
  return outA + clamp(t, 0, 1) * (outB - outA);
}
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(ctx, text, cx, y, maxW, lh) {
  const words = (text || "").split(" ");
  let line = "", lines = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
}

boot();
