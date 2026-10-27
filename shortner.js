/* ============================================================================
   LYRA LINK SHORTENER — shortner.js
   Created by MUHAMMAD TAQI

   USAGE:
   1. Just include this file: <script src="shortner.js"></script>
   2. Open the compressor page via any of:
      - https://yoursite.com/?compress
      - https://yoursite.com/?shorten
      - https://yoursite.com/#compress
   3. Paste a long link → get compressed link → copy / open
   4. Compressed links work automatically on your main site
      (requires script.js with decodeAny support)
   ========================================================================= */
(function () {
  'use strict';

  /* ======================= CIPHER CONSTANTS ========================== */
  // A→k  B→r  C→x  D→p  E→v  F→h  G→z  H→q  I→c  J→b  K→y  L→f  M→n
  // N→a  O→t  P→m  Q→s  R→j  S→w  T→e  U→g  V→i  W→l  X→u  Y→o  Z→d
  const SUBST = 'krxpvhzqcbyfnatmsjwegiluod';
  const SUBST_MAP = {};
  const REVERSE_MAP = {};
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);   // A..Z
    SUBST_MAP[letter] = SUBST[i];
    REVERSE_MAP[SUBST[i]] = letter;
  }

  /* ======================= ENCODE / DECODE =========================== */
  function encodeCompact(str) {
    const s = String(str || '').toUpperCase();
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c === 32) { out += '_'; continue; }            // space → _
      if (c >= 65 && c <= 90) out += SUBST_MAP[String.fromCharCode(c)];
    }
    return out;
  }

  function decodeCompact(str) {
    let out = '';
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '_') { out += ' '; continue; }
      const up = ch.toUpperCase();
      if (REVERSE_MAP[up]) out += REVERSE_MAP[up];
    }
    return out;
  }

  function decodeOld(str) {
    if (!str) return '';
    return String(str).split('.').map(x => {
      if (x === '?') return ' ';
      const n = parseInt(x, 10);
      return (n >= 1 && n <= 26) ? String.fromCharCode(n + 64) : '';
    }).join('');
  }

  function decodeAny(str) {
    if (!str) return '';
    if (/[.?]/.test(str)) return decodeOld(str);
    return decodeCompact(str);
  }

  function isLongFormat(str) { return /[.?]/.test(String(str || '')); }

  /* ======================= HASH PARSING ============================== */
  function parseHash(hash) {
    const raw = String(hash || '').replace(/^#/, '');
    const parts = raw.split('+');
    if (parts.length < 3) return null;
    return { code: parts[0], user: parts[1], game: parts[2] };
  }

  function compressHash(hash) {
    const p = parseHash(hash);
    if (!p) return null;
    // Already compressed?
    if (!isLongFormat(p.user) && !isLongFormat(p.game)) {
      return '#' + p.code + '+' + p.user + '+' + p.game;
    }
    const u = decodeAny(p.user);
    const g = decodeAny(p.game);
    return '#' + p.code + '+' + encodeCompact(u) + '+' + encodeCompact(g);
  }

  /* ======================= GLOBAL API ================================ */
  window.LYRA_SHORT = {
    encode: encodeCompact,
    decode: decodeCompact,
    decodeAny: decodeAny,
    isLongFormat: isLongFormat,
    parseHash: parseHash,
    compressHash: compressHash,
    show: showCompressor,
    hide: hideCompressor
  };

  /* ======================= AUTO-BOOT ================================= */
  function shouldBoot() {
    const params = new URLSearchParams(location.search);
    const hash = location.hash.replace(/^#/, '');
    if (params.has('compress') || params.has('short') || params.has('shorten')) return true;
    if (hash === 'compress' || hash === 'short' || hash === 'shorten') return true;
    return false;
  }

  if (shouldBoot()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(showCompressor, 60);
      });
    } else {
      setTimeout(showCompressor, 60);
    }
  }

  /* ======================= HIDE ====================================== */
  function hideCompressor() {
    const el = document.getElementById('lyra-shortener');
    if (el) el.remove();
    // Clean URL
    const params = new URLSearchParams(location.search);
    if (params.has('compress') || params.has('short') || params.has('shorten')) {
      params.delete('compress'); params.delete('short'); params.delete('shorten');
      const q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    }
    const hash = location.hash.replace(/^#/, '');
    if (hash === 'compress' || hash === 'short' || hash === 'shorten') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  /* ======================= COMPRESSOR UI ============================= */
  function showCompressor() {
    if (document.getElementById('lyra-shortener')) return;

    /* -------- inject CSS once -------- */
    if (!document.getElementById('lyra-shortener-css')) {
      const style = document.createElement('style');
      style.id = 'lyra-shortener-css';
      style.textContent = `
        #lyra-shortener {
          position: fixed; inset: 0;
          z-index: 2147483645;
          background:
            radial-gradient(circle at 20% 15%, rgba(34,211,238,.18), transparent 55%),
            radial-gradient(circle at 80% 85%, rgba(168,85,247,.18), transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(244,114,182,.08), transparent 60%),
            #05050c;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          overflow-y: auto;
          animation: sh-fadein .35s ease;
        }
        @keyframes sh-fadein { from { opacity: 0; } to { opacity: 1; } }
        #lyra-shortener .sh-card {
          background: rgba(255,255,255,.055);
          backdrop-filter: blur(26px) saturate(1.5);
          -webkit-backdrop-filter: blur(26px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 26px;
          padding: 34px 26px;
          max-width: 540px; width: 100%;
          box-shadow: 0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.09);
          color: #e8ecf8; text-align: center;
          position: relative;
          animation: sh-pop .4s cubic-bezier(.4,0,.2,1);
        }
        @keyframes sh-pop { from { transform: scale(.94) translateY(14px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        #lyra-shortener .sh-close {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          color: #fff; cursor: pointer;
          font-size: 20px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: .2s; font-family: inherit; padding: 0;
        }
        #lyra-shortener .sh-close:hover { background: rgba(255,50,50,.75); transform: rotate(90deg); }
        #lyra-shortener .sh-logo {
          font-size: .72rem; letter-spacing: .5em;
          font-weight: 800; color: #22d3ee;
          margin-bottom: 4px;
          text-shadow: 0 0 24px rgba(34,211,238,.6);
        }
        #lyra-shortener .sh-title {
          font-size: clamp(1.7rem, 6vw, 2.1rem);
          font-weight: 900; letter-spacing: -0.5px;
          background: linear-gradient(120deg, #22d3ee, #a78bfa, #f472b6, #22d3ee);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 4px 0 6px;
          animation: sh-grad 7s ease infinite;
        }
        @keyframes sh-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        #lyra-shortener .sh-sub {
          font-size: .85rem; color: #94a3b8;
          letter-spacing: .04em; margin-bottom: 22px;
        }
        #lyra-shortener .sh-label {
          font-size: .68rem; letter-spacing: .18em;
          text-transform: uppercase; color: #94a3b8;
          display: block; text-align: left;
          margin-bottom: 8px; font-weight: 800;
        }
        #lyra-shortener .sh-inp {
          width: 100%; padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.06);
          color: #fff; font-size: .88rem;
          outline: none; font-family: ui-monospace, monospace;
          margin-bottom: 12px; transition: .2s;
        }
        #lyra-shortener .sh-inp:focus {
          border-color: #22d3ee;
          box-shadow: 0 0 0 3px rgba(34,211,238,.18);
          background: rgba(255,255,255,.09);
        }
        #lyra-shortener .sh-inp::placeholder { color: #64748b; }
        #lyra-shortener .sh-btn {
          width: 100%; padding: 15px;
          border: none; border-radius: 14px;
          cursor: pointer; font-size: 1rem;
          font-weight: 900; letter-spacing: .06em;
          text-transform: uppercase; color: #03131a;
          background: linear-gradient(135deg, #22d3ee, #3b82f6);
          box-shadow: 0 12px 30px rgba(34,211,238,.35);
          transition: .2s; font-family: inherit;
        }
        #lyra-shortener .sh-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(34,211,238,.5); }
        #lyra-shortener .sh-btn:active { transform: scale(.97); }

        #lyra-shortener .sh-result {
          margin-top: 20px; padding: 18px;
          border-radius: 16px;
          background: rgba(34,211,238,.06);
          border: 1px solid rgba(34,211,238,.3);
          display: none; text-align: left;
        }
        #lyra-shortener .sh-result.show { display: block; animation: sh-slide .4s ease; }
        @keyframes sh-slide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        #lyra-shortener .sh-res-label {
          font-size: .65rem; letter-spacing: .16em;
          text-transform: uppercase; color: #22d3ee;
          font-weight: 800; margin-bottom: 6px;
        }
        #lyra-shortener .sh-res-link {
          width: 100%; padding: 12px 14px;
          border-radius: 10px;
          border: 1px dashed rgba(34,211,238,.5);
          background: rgba(0,0,0,.3);
          color: #a5f3fc;
          font-family: ui-monospace, monospace;
          font-size: .78rem; word-break: break-all;
          outline: none; margin-bottom: 10px;
        }
        #lyra-shortener .sh-res-stats {
          font-size: .72rem; color: #94a3b8;
          margin-bottom: 10px; font-weight: 500;
        }
        #lyra-shortener .sh-res-stats b { color: #10b981; font-weight: 800; }
        #lyra-shortener .sh-res-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        #lyra-shortener .sh-res-btns button {
          flex: 1; min-width: 100px; padding: 11px;
          border-radius: 10px; border: none; cursor: pointer;
          font-weight: 800; font-size: .82rem;
          font-family: inherit; transition: .2s;
          letter-spacing: .02em;
        }
        #lyra-shortener .sh-copy {
          background: rgba(255,255,255,.12); color: #e2e8f0;
          border: 1px solid rgba(255,255,255,.15) !important;
        }
        #lyra-shortener .sh-copy:hover { background: rgba(255,255,255,.22); }
        #lyra-shortener .sh-open {
          background: linear-gradient(135deg, #22c55e, #10b981);
          color: #031a0f;
          box-shadow: 0 6px 20px rgba(34,197,94,.35);
        }
        #lyra-shortener .sh-open:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(34,197,94,.5); }
        #lyra-shortener .sh-preview {
          margin-top: 12px; padding: 10px 12px;
          border-radius: 10px;
          background: rgba(0,0,0,.22);
          font-size: .72rem; color: #94a3b8;
          font-family: ui-monospace, monospace;
          word-break: break-all; line-height: 1.6;
        }
        #lyra-shortener .sh-preview b { color: #fbbf24; font-weight: 800; }
        #lyra-shortener .sh-error {
          margin-top: 12px; padding: 12px;
          border-radius: 10px;
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.4);
          color: #fca5a5; font-size: .82rem;
          display: none; text-align: left;
        }
        #lyra-shortener .sh-error.show { display: block; animation: sh-slide .3s ease; }
        @media (max-width: 480px) {
          #lyra-shortener { padding: 10px; }
          #lyra-shortener .sh-card { padding: 26px 16px; border-radius: 20px; }
          #lyra-shortener .sh-res-btns button { min-width: 80px; font-size: .75rem; }
        }
      `;
      document.head.appendChild(style);
    }

    /* -------- build DOM -------- */
    const overlay = document.createElement('div');
    overlay.id = 'lyra-shortener';
    overlay.innerHTML = `
      <div class="sh-card">
        <button class="sh-close" id="sh-close" title="Close">×</button>
        <div class="sh-logo">LYRA</div>
        <div class="sh-title">LINK SHORTENER</div>
        <div class="sh-sub">Paste a long game link → get a short one</div>

        <label class="sh-label" for="sh-input">Long Link</label>
        <input class="sh-inp" id="sh-input" type="text"
               placeholder="https://yoursite.com/#L+13.21.8.1.13.13.1.4+20.1.17.9"
               autocomplete="off" spellcheck="false">

        <button class="sh-btn" id="sh-compress">🚀 Compress Link</button>

        <div class="sh-error" id="sh-error"></div>

        <div class="sh-result" id="sh-result">
          <div class="sh-res-label">✅ Short Link</div>
          <input class="sh-res-link" id="sh-res-link" readonly>
          <div class="sh-res-stats" id="sh-res-stats"></div>
          <div class="sh-res-btns">
            <button class="sh-copy" id="sh-copy">📋 Copy</button>
            <button class="sh-open" id="sh-open">▶ Open</button>
          </div>
          <div class="sh-preview" id="sh-preview"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    /* -------- refs -------- */
    const input      = document.getElementById('sh-input');
    const compressBtn= document.getElementById('sh-compress');
    const closeBtn   = document.getElementById('sh-close');
    const resultBox  = document.getElementById('sh-result');
    const resLink    = document.getElementById('sh-res-link');
    const resStats   = document.getElementById('sh-res-stats');
    const resPreview = document.getElementById('sh-preview');
    const errorBox   = document.getElementById('sh-error');
    const copyBtn    = document.getElementById('sh-copy');
    const openBtn    = document.getElementById('sh-open');

    /* -------- helpers -------- */
    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.add('show');
      resultBox.classList.remove('show');
    }
    function clearError() { errorBox.classList.remove('show'); }

    /* -------- normalize user input -------- */
    function normalizeInput(raw) {
      raw = String(raw || '').trim();
      if (!raw) return null;

      // 1) Full URL with #hash
      if (raw.indexOf('#') !== -1) {
        const idx = raw.indexOf('#');
        return {
          base: raw.slice(0, idx) || (location.origin + location.pathname),
          hash: '#' + raw.slice(idx + 1)
        };
      }

      // 2) Just #hash
      if (raw[0] === '#') {
        return { base: location.origin + location.pathname, hash: raw };
      }

      // 3) Just params: CODE+...
      if (/^[A-Z]{1,3}\+/.test(raw)) {
        return { base: location.origin + location.pathname, hash: '#' + raw };
      }

      return null;
    }

    /* -------- compress action -------- */
    function doCompress() {
      clearError();
      const norm = normalizeInput(input.value);
      if (!norm) {
        showError('Invalid link. Paste a full URL, hash, or CODE+... string.');
        return;
      }

      const p = parseHash(norm.hash);
      if (!p) {
        showError('Hash must be in format #CODE+user+game (3 parts).');
        return;
      }

      const compressed = compressHash(norm.hash);
      if (!compressed) {
        showError('Could not compress this link.');
        return;
      }

      const shortUrl = norm.base + compressed;

      // Show result
      resLink.value = shortUrl;
      resultBox.classList.add('show');

      const oldLen = (norm.base + norm.hash).length;
      const newLen = shortUrl.length;
      const saved  = oldLen - newLen;
      const pct    = oldLen > 0 ? Math.round((saved / oldLen) * 100) : 0;

      if (saved > 0) {
        resStats.innerHTML =
          'Saved <b>' + saved + '</b> characters (<b>' + pct + '%</b>) · ' +
          oldLen + ' → ' + newLen + ' chars';
      } else {
        resStats.innerHTML = 'Length: ' + newLen + ' chars (already compact)';
      }

      // Preview
      const u = decodeAny(p.user);
      const g = decodeAny(p.game);
      resPreview.innerHTML =
        'Preview: <b>' + (g || '—') + '</b> by <b>' + (u || '—') + '</b>' +
        ' · Game code: <b>' + p.code + '</b>';

      // Scroll result into view on small screens
      try { resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }

    /* -------- wire up -------- */
    compressBtn.addEventListener('click', doCompress);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); doCompress(); }
    });

    closeBtn.addEventListener('click', hideCompressor);

    copyBtn.addEventListener('click', function () {
      resLink.select();
      resLink.setSelectionRange(0, 99999);
      const txt = resLink.value;
      const done = function () {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(function () {
          try { document.execCommand('copy'); done(); } catch (e) {}
        });
      } else {
        try { document.execCommand('copy'); done(); } catch (e) {}
      }
    });

    openBtn.addEventListener('click', function () {
      window.open(resLink.value, '_blank');
    });

    // Escape closes
    const escHandler = function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        document.removeEventListener('keydown', escHandler);
        hideCompressor();
      }
    };
    document.addEventListener('keydown', escHandler);

    // Focus the input
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 120);
  }

})();
