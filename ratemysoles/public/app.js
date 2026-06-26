'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { sort: 'new', page: 1, hasMore: false, loading: false, current: null };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function api(path, opts = {}) {
  const res = await fetch(path, { credentials: 'same-origin', ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

let toastTimer;
function toast(msg, isErr = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', isErr);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

function openOverlay(el) { el.hidden = false; document.body.style.overflow = 'hidden'; }
function closeOverlay(el) { el.hidden = true; document.body.style.overflow = ''; }

function tileMarkup(p) {
  const score = p.average == null
    ? `<span class="badge unrated">unrated</span>`
    : `<span class="badge">★ ${p.average.toFixed(1)}</span>`;
  const title = p.title ? p.title.replace(/[<>&"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])) : 'Untitled';
  return `
    <article class="tile" data-id="${p.id}">
      <img class="thumb" loading="lazy" src="${p.thumbUrl}" alt="${title}" />
      <div class="meta">
        <span class="t-title">${title}</span>
        ${score}
      </div>
    </article>`;
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------
async function loadFeed(reset = false) {
  if (state.loading) return;
  state.loading = true;
  if (reset) { state.page = 1; $('#gallery').innerHTML = ''; }
  try {
    const data = await api(`/api/feed?sort=${state.sort}&page=${state.page}`);
    state.hasMore = data.hasMore;
    const html = data.photos.map(tileMarkup).join('');
    $('#gallery').insertAdjacentHTML('beforeend', html);
    $('#empty').hidden = data.total !== 0;
    $('#load-more').hidden = !data.hasMore;
  } catch (e) {
    toast(e.message, true);
  } finally {
    state.loading = false;
  }
}

// ---------------------------------------------------------------------------
// Photo detail + rating
// ---------------------------------------------------------------------------
function renderRater(p) {
  const rater = $('#rater');
  rater.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const b = document.createElement('button');
    b.textContent = i;
    if (p.myVote && i <= p.myVote) b.classList.add('lit');
    if (p.myVote === i) b.classList.add('mine');
    b.addEventListener('mouseenter', () => paintHover(i));
    b.addEventListener('mouseleave', () => paintHover(0));
    b.addEventListener('click', () => castVote(p.id, i));
    rater.appendChild(b);
  }
}
function paintHover(n) {
  $$('#rater button').forEach((b, idx) => b.style.opacity = n && idx + 1 > n ? '.4' : '1');
}

function fillDetail(p) {
  state.current = p;
  $('#big-img').src = p.url;
  $('#big-img').alt = p.title || 'Submitted feet photo';
  $('#big-title').textContent = p.title || 'Untitled';
  $('#big-avg').textContent = p.average == null ? '–' : p.average.toFixed(1);
  $('#big-count').textContent = p.votes
    ? `${p.votes} vote${p.votes === 1 ? '' : 's'}`
    : 'No votes yet — be the first';
  $('#your-vote').textContent = p.myVote ? `You rated this ${p.myVote}/10. Click to change.` : '';
  renderRater(p);
  // reflect this photo's score in its tile, if visible
  const tile = $(`.tile[data-id="${p.id}"] .badge`);
  if (tile) {
    if (p.average == null) { tile.textContent = 'unrated'; tile.classList.add('unrated'); }
    else { tile.textContent = `★ ${p.average.toFixed(1)}`; tile.classList.remove('unrated'); }
  }
}

async function openPhoto(id) {
  try {
    const p = await api(`/api/photo/${id}`);
    fillDetail(p);
    openOverlay($('#photo-modal'));
  } catch (e) {
    toast(e.message, true);
  }
}

async function castVote(id, score) {
  try {
    const p = await api(`/api/photo/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });
    fillDetail(p);
    toast(`Rated ${score}/10`);
  } catch (e) {
    toast(e.message, true);
  }
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------
function setupUpload() {
  const fileInput = $('#file');
  const preview = $('#preview');
  const dropInner = $('#drop-inner');
  const drop = $('#drop');
  const consent = $('#consent');
  const btn = $('#upload-btn');
  let picked = null;

  const refresh = () => (btn.disabled = !(picked && consent.checked));

  function showFile(file) {
    if (!file) return;
    picked = file;
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.hidden = false;
      dropInner.hidden = true;
    };
    reader.readAsDataURL(file);
    refresh();
  }

  fileInput.addEventListener('change', () => showFile(fileInput.files[0]));
  consent.addEventListener('change', refresh);

  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', (e) => {
    const f = e.dataTransfer.files[0];
    if (f) { fileInput.files = e.dataTransfer.files; showFile(f); }
  });

  $('#upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#upload-msg');
    msg.hidden = true;
    if (!picked) return;
    const fd = new FormData();
    fd.append('image', picked);
    fd.append('title', $('#title').value);
    fd.append('consent', consent.checked ? 'true' : 'false');

    btn.disabled = true;
    btn.textContent = 'Uploading…';
    try {
      await api('/api/upload', { method: 'POST', body: fd });
      closeOverlay($('#upload-modal'));
      resetUpload();
      toast('Posted! Your soles are live.');
      state.sort = 'new';
      $$('#tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.sort === 'new'));
      loadFeed(true);
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.remove('ok');
      msg.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Post for rating';
      refresh();
    }
  });

  function resetUpload() {
    picked = null;
    fileInput.value = '';
    $('#title').value = '';
    consent.checked = false;
    preview.hidden = true;
    preview.src = '';
    dropInner.hidden = false;
    refresh();
  }
  window.__resetUpload = resetUpload;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
async function reportCurrent() {
  if (!state.current) return;
  const reason = prompt('Why are you reporting this photo? (optional)') ?? null;
  if (reason === null) return; // cancelled
  try {
    await api(`/api/photo/${state.current.id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    toast('Thanks — this photo has been reported for review.');
  } catch (e) {
    toast(e.message, true);
  }
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
function init() {
  // Age gate
  if (localStorage.getItem('rms_adult') !== '1') openOverlay($('#age-gate'));
  $('#age-yes').addEventListener('click', () => {
    localStorage.setItem('rms_adult', '1');
    closeOverlay($('#age-gate'));
  });

  // Sort tabs
  $$('#tabs .tab').forEach((tab) =>
    tab.addEventListener('click', () => {
      $$('#tabs .tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.sort = tab.dataset.sort;
      loadFeed(true);
    }));

  // Gallery click (delegated)
  $('#gallery').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (tile) openPhoto(tile.dataset.id);
  });

  $('#load-more').addEventListener('click', () => { state.page++; loadFeed(); });
  $('#open-upload').addEventListener('click', () => openOverlay($('#upload-modal')));
  $('#report-btn').addEventListener('click', reportCurrent);

  // Open rules links
  $$('[data-open="rules"]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#rules-modal')); }));

  // Close buttons + backdrop + Esc
  $$('[data-close]').forEach((b) =>
    b.addEventListener('click', () => closeOverlay(b.closest('.overlay'))));
  $$('.overlay').forEach((ov) =>
    ov.addEventListener('click', (e) => {
      if (e.target === ov && ov.id !== 'age-gate') closeOverlay(ov);
    }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.overlay:not([hidden])').forEach((ov) => {
      if (ov.id !== 'age-gate') closeOverlay(ov);
    });
  });

  setupUpload();
  loadFeed(true);
}

document.addEventListener('DOMContentLoaded', init);
