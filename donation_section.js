/* ═══════════════════════════════════════════════════════════
   donation-section.js
   JS ใหม่สำหรับ Section Donation — ไม่แก้ไขไฟล์ JS เดิม
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Tab switching ─────────────────────────────────────── */
  window.dnSwitchTab = function (tabId) {
    document.querySelectorAll('.dn-tab-btn').forEach(function (btn) {
      btn.classList.remove('dn-tab-active');
      btn.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.dn-panel').forEach(function (panel) {
      panel.classList.remove('dn-panel-active');
    });
    var activeBtn   = document.getElementById('dn-tab-'   + tabId);
    var activePanel = document.getElementById('dn-panel-' + tabId);
    if (activeBtn) {
      activeBtn.classList.add('dn-tab-active');
      activeBtn.setAttribute('aria-selected', 'true');
    }
    if (activePanel) {
      activePanel.classList.add('dn-panel-active');
    }
  };

  /* ── Copy account number to clipboard ─────────────────── */
  window.dnCopyAccount = function (text) {
    var clean = text.replace(/\s/g, '');
    var toast = document.getElementById('dn-toast');

    function showToast() {
      if (!toast) return;
      toast.classList.add('dn-toast-show');
      setTimeout(function () { toast.classList.remove('dn-toast-show'); }, 2200);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(clean).then(showToast).catch(function () {
        dnFallbackCopy(clean);
        showToast();
      });
    } else {
      dnFallbackCopy(clean);
      showToast();
    }
  };

  function dnFallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* silent */ }
    document.body.removeChild(ta);
  }

  /* ── Draw QR placeholder on <canvas> ───────────────────── */
  function dnDrawQR(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx     = canvas.getContext('2d');
    var size    = 150;
    var modules = 21;
    var mod     = size / modules;

    /* white background */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    /* deterministic pseudo-random seed based on canvasId */
    var seed = 0;
    for (var i = 0; i < canvasId.length; i++) seed += canvasId.charCodeAt(i);
    function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    ctx.fillStyle = '#000000';

    /* finder patterns — 3 corners */
    function drawFinder(ox, oy) {
      ctx.fillStyle = '#000';
      ctx.fillRect(ox * mod,       oy * mod,       7 * mod, 7 * mod);
      ctx.fillStyle = '#fff';
      ctx.fillRect((ox+1) * mod,   (oy+1) * mod,   5 * mod, 5 * mod);
      ctx.fillStyle = '#000';
      ctx.fillRect((ox+2) * mod,   (oy+2) * mod,   3 * mod, 3 * mod);
    }
    drawFinder(0,  0);
    drawFinder(14, 0);
    drawFinder(0,  14);

    /* reserve finder + separator areas */
    var reserved = new Set();
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        reserved.add(r + ',' + c);
        reserved.add(r + ',' + (20 - c));
        reserved.add((20 - r) + ',' + c);
      }
    }

    /* random data modules */
    ctx.fillStyle = '#000';
    for (var row = 0; row < modules; row++) {
      for (var col = 0; col < modules; col++) {
        if (!reserved.has(row + ',' + col) && rand() > 0.5) {
          ctx.fillRect(col * mod, row * mod, mod, mod);
        }
      }
    }

    /* timing pattern */
    for (var t = 8; t < 13; t++) {
      if (t % 2 === 0) {
        ctx.fillRect(t * mod, 6 * mod, mod, mod);
        ctx.fillRect(6 * mod, t * mod, mod, mod);
      }
    }
  }

  /* ── Init on DOM ready ──────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    dnDrawQR('dn-bpf-qr');
    dnDrawQR('dn-phf-qr');
  });

})();