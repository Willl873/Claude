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
  observations: $("#observations"),
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
  // NOTE: the dropzone is a <label> wrapping #fileInput, so a tap opens the
  // picker natively on iOS/Android. We deliberately do NOT also call
  // fileInput.click() here — doing both double-fires the gesture and iOS then
  // opens nothing. Keyboard users still get a programmatic open via keydown.
  els.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.fileInput.click(); }
  });
  els.fileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
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
  // Some Android gallery pickers hand back a blank MIME type — accept by
  // extension too rather than rejecting a real photo.
  const looksImage = file && (
    (file.type && file.type.startsWith("image/")) ||
    /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name || "")
  );
  if (!looksImage) {
    alert("That doesn't look like an image. Try a JPG or PNG.");
    els.fileInput.value = "";
    return;
  }
  if (state.mode === "ai" && !els.apiKey.value.trim()) {
    alert("Paste your Anthropic API key to use Claude AI mode — or switch to On-device.");
    els.fileInput.value = "";
    return;
  }

  let dataUrl;
  try {
    dataUrl = await fileToDataUrl(file);
  } catch {
    alert("Couldn't read that file. Please try another photo.");
    els.fileInput.value = "";
    return;
  }

  // go to analyzing screen
  els.scanImg.src = dataUrl;
  show(els.analyzing);
  hide(els.intake);
  els.fileInput.value = ""; // reset so picking the same photo again still fires `change`

  let scores;
  try {
    if (state.mode === "ai") {
      cycleStatus(["Sending to Claude…", "Claude is studying the photo…", "Weighing each feature…", "Forming a verdict…"]);
      scores = await analyzeWithClaude(file, dataUrl);
    } else {
      cycleStatus(["Reading the pixels…", "Detecting skin tones…", "Tracing the silhouette…", "Scoring…"]);
      const bitmap = await decodeForAnalysis(file, dataUrl);
      await delay(700); // let the scan animation breathe
      scores = analyzeLocally(bitmap);
    }
  } catch (err) {
    stopStatus();
    let msg;
    if (err && err.notFeet) msg = err.message;
    else if (err && err.decode) {
      msg = "This photo couldn't be read in your browser — iPhone HEIC photos often need converting. " +
            "Try saving it as JPG/PNG, or use Claude AI mode.";
    } else {
      msg = "Couldn't analyse that one.\n\n" + (err && err.message ? err.message : err);
    }
    alert(msg);
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
/* Decode a file to a drawable image for analysis. Prefer createImageBitmap,
 * which is fast and applies EXIF orientation (phone photos are often rotated).
 * Falls back to <img>; throws {decode:true} if the browser can't read it
 * (e.g. HEIC in Chrome) so the caller can show a helpful message. */
async function decodeForAnalysis(file, dataUrl) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); }
    catch {
      try { return await createImageBitmap(file); } catch {}
    }
  }
  try { return await loadImage(dataUrl); }
  catch { const e = new Error("decode failed"); e.decode = true; throw e; }
}

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
  if (img.close) img.close(); // free the decoded bitmap

  const skin = new Uint8Array(w * h);
  const lum = new Float32Array(w * h);
  const cr = new Float32Array(w * h);
  const cb = new Float32Array(w * h);
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
        const idx = y * w + x;
        skin[idx] = 1;
        cr[idx] = Cr; cb[idx] = Cb;
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
  let gradSum = 0, gradN = 0, edgeCount = 0;
  const EDGE_T = 16; // luminance jump that reads as a wrinkle / vein / hair / blemish edge
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const idx = y * w + x;
      if (!skin[idx]) continue;
      if (skin[idx + 1]) { const d = Math.abs(lum[idx] - lum[idx + 1]); gradSum += d; gradN++; if (d > EDGE_T) edgeCount++; }
      if (skin[idx + w]) { const d = Math.abs(lum[idx] - lum[idx + w]); gradSum += d; gradN++; if (d > EDGE_T) edgeCount++; }
    }
  }
  const texture = gradN ? gradSum / gradN : 12;      // ~0 (glassy) .. ~25 (rough)
  const edgeFrac = gradN ? edgeCount / gradN : 0;    // share of skin that is hard edges

  // --- tone evenness: chroma std-dev over skin ---
  const meanCr = skinCount ? sumCr / skinCount : 150;
  const meanCb = skinCount ? sumCb / skinCount : 110;
  const stdCr = skinCount ? Math.sqrt(Math.max(0, sumCr2 / skinCount - meanCr * meanCr)) : 12;
  const stdCb = skinCount ? Math.sqrt(Math.max(0, sumCb2 / skinCount - meanCb * meanCb)) : 12;
  const toneSpread = (stdCr + stdCb) / 2; // ~3 (even) .. ~16 (blotchy)

  const meanL = skinCount ? sumL / skinCount : 128;
  const stdL = skinCount ? Math.sqrt(Math.max(0, sumL2 / skinCount - meanL * meanL)) : 40;

  // --- blemish / discoloration & redness: deviation from the foot's own tone.
  //     Spots, bruising, fungal/discoloured nails and dark patches read as a
  //     large chroma distance from the mean or as abnormally dark pixels;
  //     inflammation reads as strong red (high Cr). ---
  const chromaT = clamp(2.0 * Math.max(stdCr, stdCb), 11, 22);
  let blemCount = 0, redCount = 0;
  for (let y = minY; y <= maxY && skinCount; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * w + x;
      if (!skin[idx]) continue;
      const dCr = cr[idx] - meanCr, dCb = cb[idx] - meanCb;
      const chromaDist = Math.sqrt(dCr * dCr + dCb * dCb);
      if (chromaDist > chromaT || lum[idx] < meanL - 1.8 * stdL) blemCount++;
      if (cr[idx] > 162 && cr[idx] > meanCr + 9) redCount++;
    }
  }
  const blemishFrac = skinCount ? blemCount / skinCount : 0; // patchiness / spots / bruising
  const redFrac = skinCount ? redCount / skinCount : 0;      // inflammation / irritation

  // --- proportions: bounding box elongation + fill ---
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const elong = Math.max(bw, bh) / Math.min(bw, bh); // 1 (square) .. 4+
  const fill = skinCount / (bw * bh); // how solidly the box is filled

  // --- symmetry along the longer axis (downsampled mask) ---
  const sym = symmetryScore(skin, w, h, minX, minY, bw, bh, bw >= bh);

  // --- contour roughness: jaggedness of the silhouette edge. Bumps, swelling,
  //     crooked/overlapping toes and other irregularities raise this, so it
  //     acts as a deformity proxy. ~0.006 (smooth) .. ~0.06 (very irregular) ---
  const roughness = contourRoughness(skin, w, h, minX, maxX, minY, maxY);

  /* ---- positive sub-skills (0..10): each collapses toward 0 as its flaw worsens ---- */
  const smoothOutline = mapRange(roughness, 0.05, 0.008, 0, 10);  // clean silhouette
  const smooth    = mapRange(texture, 17, 3, 0, 10);              // smooth skin surface
  const cleanEdge = mapRange(edgeFrac, 0.42, 0.08, 0, 10);        // few wrinkles / veins / hair
  const cleanSkin = mapRange(blemishFrac, 0.22, 0.02, 0, 10);     // few spots / discoloration
  const evenTone  = mapRange(toneSpread, 14, 3, 0, 10);           // uniform colour
  const notRed    = mapRange(redFrac, 0.30, 0.03, 0, 10);         // not inflamed
  const symGood   = mapRange(sym, 0.5, 0.92, 0, 10);              // left/right symmetry
  const elongScore = elong <= 2.4
    ? mapRange(elong, 1.0, 2.4, 2.0, 9.6)
    : mapRange(elong, 2.4, 4.6, 9.6, 2.5);
  const fillScore = mapRange(fill, 0.26, 0.64, 2.5, 9.4);

  const proportions = clampScore(0.55 * elongScore + 0.25 * fillScore + 0.20 * smoothOutline);
  const shape       = clampScore(0.45 * symGood + 0.35 * smoothOutline + 0.20 * fillScore);
  const skinQuality = clampScore(0.42 * smooth + 0.30 * cleanSkin + 0.28 * cleanEdge);
  const skinColor   = clampScore(0.55 * evenTone + 0.30 * notRed + 0.15 * cleanSkin);
  const health      = clampScore(0.28 * cleanSkin + 0.22 * notRed + 0.20 * smooth + 0.16 * evenTone + 0.14 * smoothOutline);

  /* ---- overall, with compounding penalties so multiple visible problems crater it ---- */
  let overall = 0.15 * proportions + 0.15 * shape + 0.27 * skinQuality + 0.18 * skinColor + 0.25 * health;
  const flaws = [
    mapRange(texture, 9, 17, 0, 1),         // rough skin
    mapRange(toneSpread, 7, 13, 0, 1),      // blotchy colour
    mapRange(blemishFrac, 0.08, 0.24, 0, 1),// spots / discoloration
    mapRange(edgeFrac, 0.18, 0.42, 0, 1),   // wrinkles / veins / hair
    mapRange(redFrac, 0.10, 0.32, 0, 1),    // inflammation
    mapRange(roughness, 0.018, 0.05, 0, 1), // irregular / deformed outline
  ].map((v) => clamp(v, 0, 1));
  const flawLoad = flaws.reduce((a, b) => a + b, 0);          // 0 (flawless) .. 6 (severe)
  const severe = flaws.filter((v) => v > 0.6).length;          // number of serious problems
  overall -= 0.9 * Math.max(0, flawLoad - 1) + 0.8 * severe;   // forgive one minor flaw, then bite

  const scores = { proportions, shape, skinQuality, skinColor, health };
  scores.overall = clampScore(overall);
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

/* Roughness of the foot silhouette: for each row, take the left/right edge of
 * the skin region, then average the second difference (curvature) of those
 * edges down the rows. A clean foot edge is locally straight (small values);
 * lumps, bumps and irregular/deformed outlines spike it. Normalised by width. */
function contourRoughness(skin, w, h, minX, maxX, minY, maxY) {
  const bw = Math.max(1, maxX - minX);
  const left = [], right = [];
  for (let y = minY; y <= maxY; y++) {
    let l = -1, r = -1;
    for (let x = minX; x <= maxX; x++) {
      if (skin[y * w + x]) { if (l < 0) l = x; r = x; }
    }
    left.push(l); right.push(r);
  }
  let sum = 0, n = 0;
  for (let i = 1; i < left.length - 1; i++) {
    if (left[i - 1] >= 0 && left[i] >= 0 && left[i + 1] >= 0) {
      sum += Math.abs(left[i - 1] - 2 * left[i] + left[i + 1]); n++;
    }
    if (right[i - 1] >= 0 && right[i] >= 0 && right[i + 1] >= 0) {
      sum += Math.abs(right[i - 1] - 2 * right[i] + right[i + 1]); n++;
    }
  }
  return n ? (sum / n) / bw : 0.02;
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
      is_feet: { type: "boolean", description: "true only if the image clearly shows the bare foot/feet of an adult human" },
      observations: {
        type: "array",
        items: { type: "string" },
        description: "2 to 4 short, specific visual observations grounding the scores (toe alignment, nails, skin condition, proportions, and any deformities or blemishes)",
      },
      proportions: { type: "number", description: "0-10: toe-length gradient, foot-to-toe ratio, balance" },
      foot_shape: { type: "number", description: "0-10: arch, toe alignment/straightness, symmetry, absence of deformities" },
      skin_quality: { type: "number", description: "0-10: smoothness; penalize calluses, cracks, blisters, scars, dryness" },
      skin_color: { type: "number", description: "0-10: evenness and healthiness of tone" },
      health: { type: "number", description: "0-10: nail condition and vitality; penalize discoloration, swelling, fungal/ingrown nails" },
      overall: { type: "number", description: "0-10 holistic judgement, not a strict average" },
      verdict: { type: "string", description: "one vivid, honest sentence under 18 words; specific, never cruel" },
    },
    required: ["is_feet", "observations", "proportions", "foot_shape", "skin_quality", "skin_color", "health", "overall", "verdict"],
    additionalProperties: false,
  };

  const prompt =
    "You are Sole, an expert and discerning judge of feet for an entertainment app. " +
    "Examine the photo carefully before scoring. First record 2-4 concrete visual observations, then rate.\n\n" +
    "Score each criterion from 0 to 10 (one decimal) and judge each one INDEPENDENTLY:\n" +
    "• proportions — toe-length gradient, foot-to-toe ratio, overall balance.\n" +
    "• foot_shape — arch, toe alignment and straightness, left/right symmetry, and the ABSENCE of deformities " +
    "(bunions, hammertoe, overlapping or crooked toes, splayed or misshapen structure).\n" +
    "• skin_quality — smoothness; penalize calluses, corns, cracked heels, dryness, blisters, scars.\n" +
    "• skin_color — evenness and healthiness of tone; penalize blotchiness, bruising, heavy redness.\n" +
    "• health — nail condition and overall vitality; penalize discoloured/fungal/ingrown nails, swelling, inflammation.\n\n" +
    "CALIBRATION — use the FULL 0-10 range and spread your scores; do NOT cluster around 6-8:\n" +
    "  9-10 = exceptional, near-flawless · 7-8 = clearly above average · 5-6 = average/unremarkable · " +
    "3-4 = noticeable problems or mild deformity · 0-2 = severe deformity, injury, or poor condition.\n" +
    "Well-kept, attractive feet and deformed or neglected feet MUST receive clearly different scores — " +
    "if you would not rate them the same in real life, do not rate them the same here. " +
    "Be honest and precise even when the result is unflattering; accuracy matters more than politeness, " +
    "but never mock or demean the person. 'overall' is holistic and should drop noticeably when there is a serious flaw.\n\n" +
    "If the image does not clearly show the bare feet of an adult human, set is_feet=false, all numeric scores to 0, " +
    "observations to [], and explain gently in 'verdict'.";

  const body = {
    model: "claude-opus-4-8",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: { type: "json_schema", schema } },
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
    observations: Array.isArray(out.observations) ? out.observations.slice(0, 4) : [],
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

  // observations (Claude AI: the evidence behind the score)
  if (Array.isArray(s.observations) && s.observations.length) {
    els.observations.hidden = false;
    els.observations.innerHTML = s.observations.map((o) => `<li>${escapeHtml(o)}</li>`).join("");
  } else {
    els.observations.hidden = true;
    els.observations.innerHTML = "";
  }

  // confidence / honest caveat (on-device only)
  if (s.engine === "On-device") {
    els.confidenceLine.hidden = false;
    if (s.confidence !== undefined && s.confidence < 0.35)
      els.confidenceLine.textContent = "Hmm — not sure that's a foot. Scored anyway, but take it with a wink.";
    else if (s.confidence !== undefined && s.confidence < 0.7)
      els.confidenceLine.textContent = "Lighting or framing made this a little tricky — confidence is moderate.";
    else
      els.confidenceLine.textContent = "On-device estimate from image analysis. For a truly precise rating, switch to Claude AI mode.";
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
    observations: s.observations || [],
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
        observations: h.observations || [],
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
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
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
