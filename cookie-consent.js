/**
 * LEBENSGEFÜHL – Cookie Consent & Google Consent Mode v2
 * DSGVO-konform | Granulare Kategorien | Persistenter Settings-Button
 *
 * GTM wird via Standard-Snippet im <head> jeder Seite geladen (GTM-M94NZDKB).
 * Consent Mode v2: alle Tags blockiert bis Marketing-Einwilligung.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'lg_cookie_consent';
  var CONSENT_VER = '2';

  /* ─── dataLayer & Consent Mode v2 Defaults ─── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    'ad_storage':              'denied',
    'ad_user_data':            'denied',
    'ad_personalization':      'denied',
    'analytics_storage':       'denied',
    'functionality_storage':   'denied',
    'personalization_storage': 'denied',
    'security_storage':        'granted',
    'wait_for_update':         500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  /* ─── Einwilligung lesen / schreiben ─── */
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch (e) { return null; }
  }
  function save(obj) {
    obj.version = CONSENT_VER;
    obj.date    = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  /* ─── Elfsight dynamisch laden (nur nach Marketing-Einwilligung) ─── */
  function loadElfsight() {
    if (document.getElementById('elfsight-platform-js')) return; // bereits geladen
    if (!document.querySelector('[class*="elfsight-app-"]')) return; // kein Widget auf dieser Seite
    var s    = document.createElement('script');
    s.id     = 'elfsight-platform-js';
    s.src    = 'https://elfsightcdn.com/platform.js';
    s.async  = true;
    document.head.appendChild(s);
  }

  /* ─── Consent-Signale setzen ─── */
  function applyConsent(prefs) {
    var mkt = prefs.marketing === true;
    gtag('consent', 'update', {
      'ad_storage':              mkt ? 'granted' : 'denied',
      'ad_user_data':            mkt ? 'granted' : 'denied',
      'ad_personalization':      mkt ? 'granted' : 'denied',
      'analytics_storage':       mkt ? 'granted' : 'denied',
      'functionality_storage':   'granted',
      'personalization_storage': 'denied',
      'security_storage':        'granted'
    });
    if (mkt) loadElfsight();
  }

  /* ─── Banner + Modal schließen ─── */
  function removeAll() {
    ['lg-cookie-banner', 'lg-cookie-modal', 'lg-cookie-overlay'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.transition = 'opacity 0.25s ease';
        el.style.opacity    = '0';
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      }
    });
  }

  /* ─── Entscheidungen ─── */
  function acceptAll() {
    save({ marketing: true });
    applyConsent({ marketing: true });
    removeAll();
  }
  function acceptNecessary() {
    save({ marketing: false });
    applyConsent({ marketing: false });
    removeAll();
  }
  function saveCustom() {
    var toggle = document.getElementById('lg-toggle-marketing');
    var prefs  = { marketing: toggle ? toggle.checked : false };
    save(prefs);
    applyConsent(prefs);
    removeAll();
  }

  /* ─── Einstellungs-Modal ─── */
  function openModal() {
    if (document.getElementById('lg-cookie-modal')) return;

    var saved     = getSaved();
    var mktActive = saved ? saved.marketing : false;

    var overlay = document.createElement('div');
    overlay.id  = 'lg-cookie-overlay';

    var modal = document.createElement('div');
    modal.id  = 'lg-cookie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cookie-Einstellungen');

    modal.innerHTML = [
      '<div class="lg-modal-header">',
        '<h2 class="lg-modal-title">Cookie-Einstellungen</h2>',
        '<button class="lg-modal-close" id="lg-modal-close" aria-label="Schließen">',
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">',
            '<path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
          '</svg>',
        '</button>',
      '</div>',
      '<div class="lg-modal-body">',
        '<p class="lg-modal-intro">',
          'Hier kannst du auswählen, welche Cookies du erlaubst. ',
          'Notwendige Cookies sind für den Betrieb der Website erforderlich. ',
          'Weitere Informationen in unserer ',
          '<a href="datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
        '</p>',
        /* Notwendige */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Notwendige Cookies</span>',
              '<span class="lg-category-desc">',
                'Technisch erforderlich (z.&nbsp;B. Speichern dieser Einstellung). Keine Übertragung an Dritte.',
              '</span>',
            '</div>',
            '<div class="lg-toggle-wrap">',
              '<input type="checkbox" id="lg-toggle-necessary" class="lg-toggle-input" checked disabled>',
              '<label for="lg-toggle-necessary" class="lg-toggle-label lg-toggle-label--disabled">',
                '<span class="lg-toggle-track"></span>',
              '</label>',
              '<span class="lg-toggle-status">Immer aktiv</span>',
            '</div>',
          '</div>',
        '</div>',
        /* Marketing */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Marketing-Cookies</span>',
              '<span class="lg-category-desc">',
                '<strong>Google Ads</strong> – Personalisierung und Erfolgsmessung von Werbeanzeigen (Google Ireland Limited). ',
                '<strong>Elfsight Google Reviews</strong> – Eingebettetes Bewertungs-Widget (Elfsight UAB, Litauen; CDN ggf. USA). ',
                'Daten ggf. in die USA übertragen.',
              '</span>',
            '</div>',
            '<div class="lg-toggle-wrap">',
              '<input type="checkbox" id="lg-toggle-marketing" class="lg-toggle-input"' + (mktActive ? ' checked' : '') + '>',
              '<label for="lg-toggle-marketing" class="lg-toggle-label">',
                '<span class="lg-toggle-track"></span>',
              '</label>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
      '<div class="lg-modal-footer">',
        '<button id="lg-save-custom" class="lg-cb-btn lg-cb-btn--outline-dark" type="button">Auswahl speichern</button>',
        '<button id="lg-modal-accept-all" class="lg-cb-btn lg-cb-btn--primary" type="button">Alle akzeptieren</button>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('lg-modal-close').addEventListener('click', function () {
      modal.remove(); overlay.remove();
    });
    overlay.addEventListener('click', function () {
      modal.remove(); overlay.remove();
    });
    document.getElementById('lg-save-custom').addEventListener('click', saveCustom);
    document.getElementById('lg-modal-accept-all').addEventListener('click', acceptAll);

    setTimeout(function () {
      var el = document.getElementById('lg-modal-close');
      if (el) el.focus();
    }, 50);
  }

  /* ─── Persistenter Floating-Button (immer sichtbar) ─── */
  function createFloatingBtn() {
    if (document.getElementById('lg-cookie-fab')) return;

    var btn = document.createElement('button');
    btn.id   = 'lg-cookie-fab';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');
    btn.title = 'Cookie-Einstellungen';
    btn.innerHTML = [
      /* Cookie-Symbol SVG */
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
        '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>',
        '<circle cx="9" cy="9.5" r="1.2" fill="currentColor"/>',
        '<circle cx="14.5" cy="8" r="1" fill="currentColor"/>',
        '<circle cx="8" cy="14" r="1" fill="currentColor"/>',
        '<circle cx="13" cy="14.5" r="1.4" fill="currentColor"/>',
        '<circle cx="16" cy="12" r="0.9" fill="currentColor"/>',
      '</svg>',
      '<span>Cookies</span>'
    ].join('');

    btn.addEventListener('click', function () {
      injectStyles();
      openModal();
    });

    document.body.appendChild(btn);
  }

  /* ─── Banner HTML ─── */
  function createBanner() {
    var banner = document.createElement('div');
    banner.id  = 'lg-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einwilligung');

    banner.innerHTML = [
      '<div class="lg-cb-inner">',
        '<div class="lg-cb-text">',
          '<p class="lg-cb-title">Cookies &amp; Datenschutz</p>',
          '<p class="lg-cb-desc">',
            'Wir nutzen Cookies – darunter <strong>Marketing-Cookies für Google Ads</strong> und das ',
            '<strong>Elfsight Google-Bewertungs-Widget</strong>. ',
            'Mehr in unserer <a href="datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
          '</p>',
        '</div>',
        '<div class="lg-cb-actions">',
          '<button id="lg-cb-settings" class="lg-cb-btn lg-cb-btn--outline" type="button">Einstellungen</button>',
          '<button id="lg-cb-necessary" class="lg-cb-btn lg-cb-btn--outline" type="button">Ablehnen</button>',
          '<button id="lg-cb-all" class="lg-cb-btn lg-cb-btn--primary" type="button">Alle akzeptieren</button>',
        '</div>',
      '</div>'
    ].join('');

    return banner;
  }

  /* ─── CSS ─── */
  function injectStyles() {
    if (document.getElementById('lg-cookie-styles')) return;
    var style = document.createElement('style');
    style.id  = 'lg-cookie-styles';
    style.textContent = [

      /* ── Floating Button ── */
      '#lg-cookie-fab{',
        'position:fixed;bottom:80px;left:16px;z-index:99990;',
        'display:inline-flex;align-items:center;gap:6px;',
        'background:rgba(61,40,56,0.9);color:#fdf6fb;',
        'border:1px solid rgba(255,207,86,0.3);border-radius:20px;',
        'padding:7px 12px 7px 10px;',
        'font-family:"Inter",system-ui,sans-serif;font-size:0.72rem;font-weight:500;',
        'letter-spacing:0.03em;cursor:pointer;',
        'box-shadow:0 2px 12px rgba(61,40,56,0.25);',
        'transition:background 0.2s,border-color 0.2s,transform 0.15s;',
        'backdrop-filter:blur(4px);',
      '}',
      '#lg-cookie-fab:hover{',
        'background:rgba(61,40,56,1);border-color:rgba(255,207,86,0.7);',
        'transform:translateY(-1px);',
      '}',

      /* ── Banner ── */
      '#lg-cookie-banner{',
        'position:fixed;bottom:0;left:0;right:0;z-index:99998;',
        'background:#3d2838;color:#fdf6fb;padding:18px 24px;',
        'box-shadow:0 -4px 28px rgba(61,40,56,0.3);',
        'border-top:1px solid rgba(255,207,86,0.2);',
        'font-family:"Inter",system-ui,sans-serif;font-size:14px;line-height:1.5;',
      '}',
      '.lg-cb-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}',
      '.lg-cb-text{flex:1;min-width:220px;}',
      '.lg-cb-title{font-family:"Cormorant Garamond","Georgia",serif;font-size:1.05rem;font-weight:500;color:#ffe99a;margin:0 0 4px;}',
      '.lg-cb-desc{margin:0;color:#e0d5dd;font-size:0.78rem;}',
      '.lg-cb-link{color:#ffcf56;text-underline-offset:3px;}',
      '.lg-cb-link:hover{color:#ffe99a;}',
      '.lg-cb-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;}',

      /* ── Buttons ── */
      '.lg-cb-btn{cursor:pointer;border-radius:6px;',
        'font-family:"Inter",system-ui,sans-serif;font-weight:500;',
        'letter-spacing:0.02em;transition:background 0.2s,color 0.2s,border-color 0.2s,box-shadow 0.2s;white-space:nowrap;border:none;}',

      /* Primär – "Alle akzeptieren": groß, gold, auffällig */
      '.lg-cb-btn--primary{',
        'background:#ffcf56;color:#3d2838;',
        'padding:11px 24px;font-size:0.85rem;',
        'box-shadow:0 2px 12px rgba(255,207,86,0.35);',
      '}',
      '.lg-cb-btn--primary:hover{background:#ffe99a;box-shadow:0 4px 18px rgba(255,207,86,0.5);}',

      /* Sekundär – "Ablehnen" / "Einstellungen": gleichwertig sichtbar (DSK-Anforderung) */
      '.lg-cb-btn--outline{',
        'background:transparent;',
        'border:1px solid rgba(253,246,251,0.55);',
        'color:rgba(253,246,251,0.9);',
        'padding:10px 16px;font-size:0.82rem;border-radius:6px;',
        'outline:none;',
      '}',
      '.lg-cb-btn--outline:hover{border-color:rgba(253,246,251,0.9);color:#fdf6fb;background:rgba(255,255,255,0.08);}',
      '.lg-cb-btn--outline:focus-visible{box-shadow:0 0 0 2px rgba(255,207,86,0.6);}',

      /* Für Modal – "Auswahl speichern" */
      '.lg-cb-btn--outline-dark{background:transparent;border:1px solid rgba(61,40,56,0.3);color:#3d2838;padding:9px 16px;font-size:0.8rem;}',
      '.lg-cb-btn--outline-dark:hover{border-color:rgba(61,40,56,0.6);background:rgba(61,40,56,0.05);}',

      /* ── Overlay ── */
      '#lg-cookie-overlay{position:fixed;inset:0;background:rgba(20,10,18,0.55);z-index:99999;backdrop-filter:blur(2px);}',

      /* ── Modal ── */
      '#lg-cookie-modal{',
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;',
        'background:#fdf6fb;color:#2d1f2b;border-radius:12px;',
        'width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow-y:auto;',
        'box-shadow:0 20px 60px rgba(61,40,56,0.25);',
        'font-family:"Inter",system-ui,sans-serif;font-size:14px;',
      '}',
      '.lg-modal-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px 16px;border-bottom:1px solid rgba(148,119,139,0.15);}',
      '.lg-modal-title{font-family:"Cormorant Garamond","Georgia",serif;font-size:1.3rem;font-weight:500;margin:0;color:#3d2838;}',
      '.lg-modal-close{background:none;border:none;cursor:pointer;color:#9e8a98;padding:4px;border-radius:4px;display:flex;align-items:center;}',
      '.lg-modal-close:hover{color:#3d2838;background:rgba(148,119,139,0.1);}',
      '.lg-modal-body{padding:20px 24px;}',
      '.lg-modal-intro{margin:0 0 20px;color:#6b5462;font-size:0.82rem;line-height:1.6;}',

      /* ── Kategorien ── */
      '.lg-category{border:1px solid rgba(148,119,139,0.2);border-radius:8px;margin-bottom:12px;}',
      '.lg-category-header{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px;gap:16px;}',
      '.lg-category-info{flex:1;}',
      '.lg-category-name{display:block;font-weight:600;font-size:0.88rem;color:#2d1f2b;margin-bottom:4px;}',
      '.lg-category-desc{display:block;font-size:0.76rem;color:#6b5462;line-height:1.5;}',

      /* ── Toggle ── */
      '.lg-toggle-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}',
      '.lg-toggle-input{position:absolute;opacity:0;width:0;height:0;}',
      '.lg-toggle-label{display:inline-flex;cursor:pointer;}',
      '.lg-toggle-label--disabled{cursor:default;opacity:0.55;}',
      '.lg-toggle-track{display:block;width:40px;height:22px;border-radius:11px;background:#d1c4cd;transition:background 0.2s;position:relative;}',
      '.lg-toggle-track::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.15);}',
      '.lg-toggle-input:checked+.lg-toggle-label .lg-toggle-track{background:#82d4bb;}',
      '.lg-toggle-input:checked+.lg-toggle-label .lg-toggle-track::after{transform:translateX(18px);}',
      '.lg-toggle-status{font-size:0.68rem;color:#9e8a98;white-space:nowrap;}',

      /* ── Modal Footer ── */
      '.lg-modal-footer{display:flex;gap:10px;justify-content:flex-end;padding:16px 24px;border-top:1px solid rgba(148,119,139,0.15);background:#fdf6fb;position:sticky;bottom:0;}',

      /* ── Responsive ── */
      '@media(max-width:600px){',
        '.lg-cb-inner{flex-direction:column;align-items:flex-start;gap:14px;}',
        '.lg-cb-actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
        '.lg-cb-btn--primary{grid-column:1/-1;}',
        '.lg-modal-footer{flex-direction:column-reverse;}',
        '.lg-modal-footer .lg-cb-btn{width:100%;text-align:center;}',
        /* FAB etwas nach oben, damit nicht von der Browserleiste verdeckt */
        '#lg-cookie-fab{bottom:72px;}',
      '}'
    ].join('');

    document.head.appendChild(style);
  }

  /* ─── Global API ─── */
  window.lgCookieSettings = function () {
    injectStyles();
    openModal();
  };

  /* ─── Initialisierung ─── */
  function init() {
    injectStyles(); // Styles immer laden (für FAB)

    function setup() {
      createFloatingBtn(); // Floating-Button immer zeigen

      var saved = getSaved();
      if (saved && saved.version === CONSENT_VER) {
        applyConsent(saved);
        return; // Kein Banner – Einwilligung bereits gespeichert
      }

      // Kein gespeicherter Consent → Banner zeigen
      var banner = createBanner();
      document.body.appendChild(banner);

      // FAB ausblenden solange Banner sichtbar
      var fab = document.getElementById('lg-cookie-fab');
      if (fab) fab.style.display = 'none';
      function restoreFab() { var f = document.getElementById('lg-cookie-fab'); if (f) f.style.display = ''; }

      document.getElementById('lg-cb-all').addEventListener('click', function () { restoreFab(); acceptAll(); });
      document.getElementById('lg-cb-necessary').addEventListener('click', function () { restoreFab(); acceptNecessary(); });
      document.getElementById('lg-cb-settings').addEventListener('click', function () {
        openModal();
        /*
         * Der Overlay (z-index 99999) liegt über dem Banner (z-index 99998).
         * Banner-Buttons sind bei geöffnetem Modal nicht klickbar.
         */
      });

      setTimeout(function () {
        var btn = document.getElementById('lg-cb-necessary');
        if (btn) btn.focus();
      }, 100);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  init();

})();
