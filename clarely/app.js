/* ===========================================================
   Clarely — interactions
   Sticky nav · mobile menu · FAQ accordion · reveals · CTA form
   =========================================================== */
(function () {
  'use strict';

  /* ---- current year in footer ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- sticky nav shadow ---- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    var toggleMenu = function (open) {
      var isOpen = open !== undefined ? open : !navLinks.classList.contains('is-open');
      navLinks.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    };
    burger.addEventListener('click', function () { toggleMenu(); });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggleMenu(false);
    });
  }

  /* ---- FAQ accordion ---- */
  var accordion = document.getElementById('accordion');
  if (accordion) {
    accordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc__q');
      if (!btn) return;
      var item = btn.parentElement;
      var answer = item.querySelector('.acc__a');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      answer.style.maxHeight = open ? answer.scrollHeight + 'px' : null;

      // close siblings for a tidy single-open accordion
      Array.prototype.forEach.call(accordion.querySelectorAll('.acc'), function (sib) {
        if (sib !== item && sib.classList.contains('is-open')) {
          sib.classList.remove('is-open');
          sib.querySelector('.acc__q').setAttribute('aria-expanded', 'false');
          sib.querySelector('.acc__a').style.maxHeight = null;
        }
      });
    });
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- "Start visit" buttons scroll to CTA & focus email ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.js-start'), function (btn) {
    btn.addEventListener('click', function (e) {
      var target = document.getElementById('start');
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var email = document.getElementById('startEmail');
      if (email) setTimeout(function () { email.focus({ preventScroll: true }); }, 450);
    });
  });

  /* ---- CTA email form (demo only) ---- */
  var form = document.getElementById('startForm');
  var msg = document.getElementById('startMsg');
  if (form && msg) {
    var defaultMsg = msg.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('startEmail');
      var valid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!valid) {
        msg.textContent = 'Please enter a valid email so we can save your progress.';
        msg.classList.remove('is-ok');
        if (email) email.focus();
        return;
      }
      msg.textContent = '✓ Thanks! Your free assessment is ready — check your inbox to continue.';
      msg.classList.add('is-ok');
      form.reset();
      setTimeout(function () {
        msg.textContent = defaultMsg;
        msg.classList.remove('is-ok');
      }, 6000);
    });
  }
})();
