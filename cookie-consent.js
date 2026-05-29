/**
 * LEBENSGEFÜHL – Cookie Consent & Google Consent Mode v2
 * DSGVO-konform | Granulare Kategorien | Consent Mode v2
 *
 * GTM-ID hier eintragen:
 * Ersetze GTM-XXXXXXX durch deine echte GTM-Container-ID
 */

(function () {
  'use strict';

  var GTM_ID      = 'GTM-XXXXXXX'; // ← HIER deine GTM-ID eintragen
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

  /* ─── Gespeicherte Einwilligung lesen / schreiben ─── */
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch (e) { return null; }
  }
  function save(obj) {
    obj.version = CONSENT_VER;
    obj.date    = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  /* ─── GTM dynamisch laden ─── */
  function loadGTM() {
    if (document.getElementById('gtm-script')) return;
    var s  = document.createElement('script');
    s.id   = 'gtm-script';
    s.async = true;
    s.src  = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  /* ─── Consent-Signale setzen ─── */
  function applyConsent(prefs) {
    var marketing = prefs.marketing === true;
    gtag('consent', 'update', {
      'ad_storage':              marketing ? 'granted' : 'denied',
      'ad_user_data':            marketing ? 'granted' : 'denied',
      'ad_personalization':      marketing ? 'granted' : 'denied',
      'analytics_storage':       marketing ? 'granted' : 'denied',
      'functionality_storage':   'granted',
      'personalization_storage': 'denied',
      'security_storage':        'granted'
    });
    if (marketing) loadGTM();
  }

  /* ─── Banner / Modal entfernen ─── */
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
    var prefs = { marketing: true };
    save(prefs);
    applyConsent(prefs);
    removeAll();
  }
  function acceptNecessary() {
    var prefs = { marketing: false };
    save(prefs);
    applyConsent(prefs);
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

    var modal    = document.createElement('div');
    modal.id     = 'lg-cookie-modal';
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
          'Notwendige Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden. ',
          'Weitere Informationen findest du in unserer ',
          '<a href="/datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
        '</p>',

        /* Notwendige */
        '<div class="lg-category">',
          '<div class="lg-category-header">',
            '<div class="lg-category-info">',
              '<span class="lg-category-name">Notwendige Cookies</span>',
              '<span class="lg-category-desc">',
                'Technisch erforderlich für den Betrieb der Website (z.&nbsp;B. Cookie-Einstellungen speichern). ',
                'Keine Übertragung an Dritte.',
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
                'Werden verwendet, um Werbeanzeigen (Google Ads) zu personalisieren und deren Wirksamkeit zu messen. ',
                'Anbieter: <strong>Google Ireland Limited</strong>. ',
                'Daten können in die USA übertragen werden.',
              '</span>',
            '</div>',
            '<div class="lg-toggle-wrap">',
              '<input type="checkbox" id="lg-toggle-marketing" class="lg-toggle-input"',
              (mktActive ? ' checked' : '') + '>',
              '<label for="lg-toggle-marketing" class="lg-toggle-label">',
                '<span class="lg-toggle-track"></span>',
              '</label>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',

      '<div class="lg-modal-footer">',
        '<button id="lg-save-custom" class="lg-cb-btn lg-cb-btn--outline" type="button">',
          'Auswahl speichern',
        '</button>',
        '<button id="lg-modal-accept-all" class="lg-cb-btn lg-cb-btn--primary" type="button">',
          'Alle akzeptieren',
        '</button>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('lg-modal-close').addEventListener('click', function () {
      document.getElementById('lg-cookie-modal').remove();
      document.getElementById('lg-cookie-overlay').remove();
    });
    overlay.addEventListener('click', function () {
      modal.remove();
      overlay.remove();
    });
    document.getElementById('lg-save-custom').addEventListener('click', saveCustom);
    document.getElementById('lg-modal-accept-all').addEventListener('click', acceptAll);

    // Fokus setzen
    setTimeout(function () {
      var close = document.getElementById('lg-modal-close');
      if (close) close.focus();
    }, 50);
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
            'Wir nutzen Cookies – darunter Marketing-Cookies für <strong>Google Ads</strong> – ',
            'um unsere Website zu verbessern und relevante Anzeigen zu schalten. ',
            'Du kannst deine Auswahl jederzeit anpassen. ',
            'Mehr dazu in unserer <a href="/datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
          '</p>',
        '</div>',
        '<div class="lg-cb-actions">',
          '<button id="lg-cb-settings" class="lg-cb-btn lg-cb-btn--text" type="button">',
            'Einstellungen',
          '</button>',
          '<button id="lg-cb-necessary" class="lg-cb-btn lg-cb-btn--outline" type="button">',
            'Nur notwendige',
          '</button>',
          '<button id="lg-cb-all" class="lg-cb-btn lg-cb-btn--primary" type="button">',
            'Alle akzeptieren',
          '</button>',
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
      /* ── Banner ── */
      '#lg-cookie-banner{',
        'position:fixed;bottom:0;left:0;right:0;z-index:99998;',
        'background:#3d2838;color:#fdf6fb;',
        'padding:18px 24px;',
        'box-shadow:0 -4px 28px rgba(61,40,56,0.3);',
        'border-top:1px solid rgba(255,207,86,0.2);',
        'font-family:"Inter",system-ui,sans-serif;font-size:14px;line-height:1.5;',
      '}',
      '.lg-cb-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;}',
      '.lg-cb-text{flex:1;min-width:260px;}',
      '.lg-cb-title{font-family:"Cormorant Garamond","Georgia",serif;font-size:1.05rem;font-weight:500;color:#ffe99a;margin:0 0 5px;}',
      '.lg-cb-desc{margin:0;color:#e0d5dd;font-size:0.78rem;}',
      '.lg-cb-link{color:#ffcf56;text-underline-offset:3px;}',
      '.lg-cb-link:hover{color:#ffe99a;}',
      '.lg-cb-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;}',

      /* ── Buttons ── */
      '.lg-cb-btn{cursor:pointer;border-radius:4px;padding:9px 18px;',
        'font-family:"Inter",system-ui,sans-serif;font-size:0.8rem;font-weight:500;',
        'letter-spacing:0.02em;transition:background 0.2s,color 0.2s,border-color 0.2s;white-space:nowrap;border:none;}',
      '.lg-cb-btn--text{background:transparent;color:#c8b8c4;padding-left:4px;padding-right:4px;}',
      '.lg-cb-btn--text:hover{color:#ffe99a;}',
      '.lg-cb-btn--outline{background:transparent;border:1px solid rgba(255,207,86,0.35);color:#fdf6fb;}',
      '.lg-cb-btn--outline:hover{border-color:rgba(255,207,86,0.75);color:#ffe99a;}',
      '.lg-cb-btn--primary{background:#ffcf56;color:#3d2838;}',
      '.lg-cb-btn--primary:hover{background:#ffe99a;}',

      /* ── Overlay ── */
      '#lg-cookie-overlay{position:fixed;inset:0;background:rgba(20,10,18,0.55);z-index:99999;backdrop-filter:blur(2px);}',

      /* ── Modal ── */
      '#lg-cookie-modal{',
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);',
        'z-index:100000;',
        'background:#fdf6fb;color:#2d1f2b;',
        'border-radius:12px;',
        'width:min(560px,calc(100vw - 32px));',
        'max-height:calc(100vh - 48px);',
        'overflow-y:auto;',
        'box-shadow:0 20px 60px rgba(61,40,56,0.25);',
        'font-family:"Inter",system-ui,sans-serif;font-size:14px;',
      '}',
      '.lg-modal-header{',
        'display:flex;justify-content:space-between;align-items:center;',
        'padding:20px 24px 16px;border-bottom:1px solid rgba(148,119,139,0.15);',
      '}',
      '.lg-modal-title{font-family:"Cormorant Garamond","Georgia",serif;font-size:1.3rem;font-weight:500;margin:0;color:#3d2838;}',
      '.lg-modal-close{background:none;border:none;cursor:pointer;color:#9e8a98;padding:4px;border-radius:4px;display:flex;align-items:center;justify-content:center;}',
      '.lg-modal-close:hover{color:#3d2838;background:rgba(148,119,139,0.1);}',
      '.lg-modal-body{padding:20px 24px;}',
      '.lg-modal-intro{margin:0 0 20px;color:#6b5462;font-size:0.82rem;line-height:1.6;}',

      /* ── Kategorien ── */
      '.lg-category{border:1px solid rgba(148,119,139,0.2);border-radius:8px;margin-bottom:12px;overflow:hidden;}',
      '.lg-category-header{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px;gap:16px;}',
      '.lg-category-info{flex:1;}',
      '.lg-category-name{display:block;font-weight:600;font-size:0.88rem;color:#2d1f2b;margin-bottom:4px;}',
      '.lg-category-desc{display:block;font-size:0.76rem;color:#6b5462;line-height:1.5;}',

      /* ── Toggle ── */
      '.lg-toggle-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}',
      '.lg-toggle-input{position:absolute;opacity:0;width:0;height:0;}',
      '.lg-toggle-label{display:inline-flex;cursor:pointer;}',
      '.lg-toggle-label--disabled{cursor:default;opacity:0.6;}',
      '.lg-toggle-track{',
        'display:block;width:40px;height:22px;border-radius:11px;',
        'background:#d1c4cd;transition:background 0.2s;position:relative;',
      '}',
      '.lg-toggle-track::after{',
        'content:"";position:absolute;top:3px;left:3px;',
        'width:16px;height:16px;border-radius:50%;',
        'background:#fff;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.15);',
      '}',
      '.lg-toggle-input:checked+.lg-toggle-label .lg-toggle-track{background:#82d4bb;}',
      '.lg-toggle-input:checked+.lg-toggle-label .lg-toggle-track::after{transform:translateX(18px);}',
      '.lg-toggle-status{font-size:0.68rem;color:#9e8a98;white-space:nowrap;}',

      /* ── Modal Footer ── */
      '.lg-modal-footer{',
        'display:flex;gap:10px;justify-content:flex-end;',
        'padding:16px 24px;border-top:1px solid rgba(148,119,139,0.15);',
        'background:#fdf6fb;position:sticky;bottom:0;',
      '}',
      '.lg-modal-footer .lg-cb-btn--outline{border-color:rgba(61,40,56,0.3);color:#3d2838;}',
      '.lg-modal-footer .lg-cb-btn--outline:hover{border-color:rgba(61,40,56,0.6);background:rgba(61,40,56,0.05);}',

      /* ── Responsive ── */
      '@media(max-width:600px){',
        '.lg-cb-inner{flex-direction:column;align-items:flex-start;gap:14px;}',
        '.lg-cb-actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
        '.lg-cb-btn--text{grid-column:1/-1;text-align:center;}',
        '.lg-cb-btn--primary{grid-column:1/-1;}',
        '.lg-modal-footer{flex-direction:column;}',
        '.lg-modal-footer .lg-cb-btn{width:100%;text-align:center;}',
      '}'
    ].join('');

    document.head.appendChild(style);
  }

  /* ─── "Cookie-Einstellungen"-Link in Footer einfügen ─── */
  function injectFooterLink() {
    // Sucht .footer-legal (Hauptseiten) oder footer p (Rechtsseiten)
    var target = document.querySelector('.footer-legal');
    if (!target) {
      // Fallback: letzter <p> im <footer>
      var footer = document.querySelector('footer');
      if (footer) target = footer.querySelector('p');
    }
    if (!target) return;
    if (target.querySelector('.lg-footer-link')) return; // schon vorhanden

    var sep  = document.createTextNode(' · ');
    var link = document.createElement('a');
    link.className   = 'lg-footer-link';
    link.href        = '#';
    link.textContent = 'Cookie-Einstellungen';
    link.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      injectStyles();
      openModal();
    });

    // Stil: passt sich dem Footer an
    var style = document.createElement('style');
    style.textContent = '.lg-footer-link{color:inherit;opacity:0.7;text-decoration:none;}.lg-footer-link:hover{opacity:1;}';
    if (!document.getElementById('lg-footer-link-style')) {
      style.id = 'lg-footer-link-style';
      document.head.appendChild(style);
    }

    target.appendChild(sep);
    target.appendChild(link);
  }

  /* ─── Global API – ermöglicht z.B. eigenen Button im Footer ─── */
  window.lgCookieSettings = function () {
    injectStyles();
    openModal();
  };

  /* ─── Initialisierung ─── */
  function init() {
    var saved = getSaved();

    // Footer-Link immer einfügen (auch bei bereits gespeicherter Einwilligung)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectFooterLink);
    } else {
      injectFooterLink();
    }

    if (saved && saved.version === CONSENT_VER) {
      // Gespeicherte Einwilligung anwenden – kein Banner
      applyConsent(saved);
      return;
    }

    // Noch keine Einwilligung → Banner zeigen
    injectStyles();

    function showBanner() {
      var banner = createBanner();
      document.body.appendChild(banner);

      document.getElementById('lg-cb-all').addEventListener('click', acceptAll);
      document.getElementById('lg-cb-necessary').addEventListener('click', acceptNecessary);
      document.getElementById('lg-cb-settings').addEventListener('click', function () {
        injectStyles();
        openModal();
        /*
         * HINWEIS: Der Overlay (z-index 99999) liegt über dem Banner (z-index 99998).
         * Solange das Modal offen ist, sind die Banner-Buttons "Nur notwendige" und
         * "Alle akzeptieren" NICHT klickbar – der Overlay blockiert sie.
         * Eine unbeabsichtigte Überschreibung der Modal-Einstellungen durch die
         * Banner-Buttons ist daher technisch ausgeschlossen.
         */
      });

      setTimeout(function () {
        var btn = document.getElementById('lg-cb-necessary');
        if (btn) btn.focus();
      }, 100);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();

})();
