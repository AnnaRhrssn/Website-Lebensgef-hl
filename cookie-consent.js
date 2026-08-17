/**
 * LEBENSGEFÜHL – Cookie Consent & Google Consent Mode v2
 * DSGVO-konform | Granulare Kategorien | Persistenter Settings-Button
 *
 * GTM wird via Standard-Snippet im <head> jeder Seite geladen (GTM-M94NZDKB).
 * Consent Mode v2: alle Tags blockiert bis Marketing-Einwilligung.
 *
 * HINWEIS: Die Consent-Mode-v2-Defaults (gtag consent default) stehen als
 * winziges Inline-Script direkt im <head> VOR GTM – diese Datei wird mit
 * defer geladen und blockiert damit nicht mehr den Hauptthread (INP-Fix).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'lg_cookie_consent';
  var CONSENT_VER = '3';

  /* gtag ist global via Inline-Script im <head> definiert */
  function gtag() { window.dataLayer.push(arguments); }

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

  /* ─── Elfsight Platzhalter anzeigen / entfernen ─── */
  function showElfsightPlaceholders() {
    document.querySelectorAll('[class*="elfsight-app-"]').forEach(function (widget) {
      if (widget.previousElementSibling && widget.previousElementSibling.classList.contains('elfsight-placeholder')) return;
      var ph = document.createElement('div');
      ph.className = 'elfsight-placeholder';
      ph.innerHTML = [
        '<div class="elfsight-ph-inner">',
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="26" height="26">',
            '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
          '</svg>',
          '<p class="elfsight-ph-title">Google Bewertungen</p>',
          '<p class="elfsight-ph-text">Damit du die Bewertungen sehen kannst, brauchen wir kurz dein Einverständnis.</p>',
          '<button class="elfsight-ph-btn" type="button">Cookie-Einstellungen öffnen</button>',
        '</div>'
      ].join('');
      ph.querySelector('.elfsight-ph-btn').addEventListener('click', function () {
        injectStyles();
        openModal();
      });
      widget.parentNode.insertBefore(ph, widget);
    });
  }

  function removeElfsightPlaceholders() {
    document.querySelectorAll('.elfsight-placeholder').forEach(function (el) { el.remove(); });
  }

  /* ─── Elfsight dynamisch laden (nur nach Marketing-Einwilligung) ─── */
  function loadElfsight() {
    removeElfsightPlaceholders();
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
    var ads     = prefs.ads === true;
    var reviews = prefs.reviews === true;
    gtag('consent', 'update', {
      'ad_storage':              ads ? 'granted' : 'denied',
      'ad_user_data':            ads ? 'granted' : 'denied',
      'ad_personalization':      ads ? 'granted' : 'denied',
      'analytics_storage':       ads ? 'granted' : 'denied',
      'functionality_storage':   'granted',
      'personalization_storage': 'denied',
      'security_storage':        'granted'
    });
    if (reviews) loadElfsight();
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
    var prefs = { ads: true, reviews: true };
    save(prefs);
    applyConsent(prefs);
    removeAll();
  }
  function acceptNecessary() {
    var prefs = { ads: false, reviews: false };
    save(prefs);
    applyConsent(prefs);
    removeAll();
  }
  function saveCustom() {
    var adsToggle     = document.getElementById('lg-toggle-ads');
    var reviewsToggle = document.getElementById('lg-toggle-reviews');
    var prefs = {
      ads:     adsToggle ? adsToggle.checked : false,
      reviews: reviewsToggle ? reviewsToggle.checked : false
    };
    save(prefs);
    applyConsent(prefs);
    removeAll();
  }

  /* ─── Einstellungs-Modal ─── */
  function openModal() {
    if (document.getElementById('lg-cookie-modal')) return;

    var saved         = getSaved();
    var adsActive     = saved ? saved.ads     : false;
    var reviewsActive = saved ? saved.reviews : false;

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
          'Hier entscheidest du, welche Cookies du erlauben möchtest. ',
          'Notwendige Cookies sorgen dafür, dass die Website funktioniert. ',
          'Mehr dazu in unserer ',
          '<a href="datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
        '</p>',
        /* Notwendige */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Notwendige Cookies</span>',
              '<span class="lg-category-desc">',
                'Sorgen dafür, dass die Website funktioniert, und speichern zum Beispiel deine Cookie-Einstellung. Keine Weitergabe an Dritte.',
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
        /* Google Ads */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Werbeanzeigen</span>',
              '<span class="lg-category-desc">',
                'Damit wir sehen, welche Anzeigen bei dir gut ankommen, und dir passendere Werbung zeigen können.',
              '</span>',
              '<details class="lg-more">',
                '<summary>Mehr erfahren</summary>',
                '<p>Anbieter: Google Ireland Limited. Dient der Erfolgsmessung und Personalisierung von Werbeanzeigen. Dabei können Daten in die USA übertragen werden.</p>',
              '</details>',
            '</div>',
            '<div class="lg-toggle-wrap">',
              '<input type="checkbox" id="lg-toggle-ads" class="lg-toggle-input"' + (adsActive ? ' checked' : '') + '>',
              '<label for="lg-toggle-ads" class="lg-toggle-label">',
                '<span class="lg-toggle-track"></span>',
              '</label>',
            '</div>',
          '</div>',
        '</div>',
        /* Elfsight Google-Bewertungen */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Kundenbewertungen</span>',
              '<span class="lg-category-desc">',
                'Damit du echte Erfahrungsberichte meiner Klient:innen auf der Website sehen kannst.',
              '</span>',
              '<details class="lg-more">',
                '<summary>Mehr erfahren</summary>',
                '<p>Anbieter: Elfsight UAB, Litauen. Bindet das Bewertungs-Widget über ein CDN ein, wobei Daten unter Umständen in die USA übertragen werden.</p>',
              '</details>',
            '</div>',
            '<div class="lg-toggle-wrap">',
              '<input type="checkbox" id="lg-toggle-reviews" class="lg-toggle-input"' + (reviewsActive ? ' checked' : '') + '>',
              '<label for="lg-toggle-reviews" class="lg-toggle-label">',
                '<span class="lg-toggle-track"></span>',
              '</label>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
      '<div class="lg-modal-footer">',
        '<button id="lg-modal-necessary" class="lg-cb-btn lg-cb-btn--outline-dark" type="button">Nur Notwendige</button>',
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
    document.getElementById('lg-modal-necessary').addEventListener('click', acceptNecessary);
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
          '<p class="lg-cb-title">Deine Cookie-Einstellungen</p>',
          '<p class="lg-cb-desc">',
            'Wir verwenden Cookies, damit diese Website gut funktioniert und du sehen kannst, was andere Klient:innen sagen. ',
            'Du entscheidest, was du erlaubst. Mehr in unserer <a href="datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a> ',
            'oder <button id="lg-cb-settings" type="button" class="lg-cb-link lg-cb-link-btn">Einstellungen anpassen</button>.',
          '</p>',
        '</div>',
        '<div class="lg-cb-actions">',
          '<button id="lg-cb-necessary" class="lg-cb-btn lg-cb-btn--outline" type="button">Nur Notwendige</button>',
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
        'position:fixed;bottom:80px;left:16px;right:auto;z-index:99990;',
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
      '.lg-cb-link-btn{background:none;border:none;padding:0;margin:0;font:inherit;cursor:pointer;text-decoration:underline;}',
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

      /* ── "Mehr erfahren" Details ── */
      '.lg-more{margin-top:6px;}',
      '.lg-more summary{',
        'cursor:pointer;font-size:0.72rem;color:#94778b;font-weight:500;',
        'list-style:none;display:inline-block;',
        'text-underline-offset:3px;text-decoration:underline;',
      '}',
      '.lg-more summary::-webkit-details-marker{display:none;}',
      '.lg-more summary:hover{color:#3d2838;}',
      '.lg-more[open] summary{color:#3d2838;margin-bottom:4px;}',
      '.lg-more p{margin:4px 0 0;font-size:0.74rem;color:#9e8a98;line-height:1.55;}',

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
        '.lg-cb-actions{width:100%;display:flex;flex-direction:column-reverse;gap:8px;}',
        '.lg-cb-actions .lg-cb-btn{width:100%;text-align:center;}',
        '.lg-modal-footer{flex-direction:column-reverse;}',
        '.lg-modal-footer .lg-cb-btn{width:100%;text-align:center;}',
        /* FAB auf Mobile: links, etwas nach oben */
        '#lg-cookie-fab{bottom:24px;left:16px;right:auto;}',
      '}',

      /* ── Elfsight Platzhalter ── */
      '.elfsight-placeholder{',
        'background:rgba(130,212,187,0.08);',
        'border:1px solid rgba(130,212,187,0.35);',
        'border-radius:12px;',
        'padding:2.5rem 2rem;',
        'text-align:center;',
        'margin-top:2rem;',
      '}',
      '.elfsight-ph-inner{display:flex;flex-direction:column;align-items:center;max-width:380px;margin:0 auto;}',
      '.elfsight-ph-inner svg{color:#82d4bb;margin-bottom:0.9rem;opacity:0.8;}',
      '.elfsight-ph-title{',
        'font-family:"Cormorant Garamond",Georgia,serif;',
        'font-size:1.25rem;font-weight:400;',
        'color:#3d2838;margin:0 0 0.5rem;',
      '}',
      '.elfsight-ph-text{',
        'font-size:0.82rem;color:#6b5462;line-height:1.6;margin:0 0 1.25rem;',
      '}',
      '.elfsight-ph-btn{',
        'cursor:pointer;background:#ffcf56;color:#3d2838;',
        'border:none;border-radius:6px;',
        'padding:10px 22px;font-size:0.82rem;font-weight:500;',
        'font-family:"Inter",system-ui,sans-serif;letter-spacing:0.02em;',
        'transition:background 0.2s;',
      '}',
      '.elfsight-ph-btn:hover{background:#ffe99a;}'
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
        if (saved.reviews !== true) showElfsightPlaceholders();
        return; // Kein Banner, Einwilligung bereits gespeichert
      }

      // Kein gespeicherter Consent → Platzhalter und Banner zeigen
      showElfsightPlaceholders();
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
