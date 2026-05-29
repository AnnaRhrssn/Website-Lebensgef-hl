/**
 * LEBENSGEFÜHL – Cookie Consent & Google Consent Mode v2
 * DSGVO-konform | Consent Mode v2 | GTM-bedingt geladen
 *
 * GTM-ID hier eintragen, sobald vorhanden:
 * Ersetze GTM-XXXXXXX durch deine echte GTM-Container-ID
 */

(function () {
  'use strict';

  var GTM_ID = 'GTM-XXXXXXX'; // ← HIER deine GTM-ID eintragen
  var STORAGE_KEY = 'lg_cookie_consent';
  var CONSENT_VERSION = '1';

  /* ─── dataLayer & Consent Mode v2 Defaults (immer zuerst) ─── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // Consent Mode v2: Alles verweigert als Standard
  gtag('consent', 'default', {
    'ad_storage':             'denied',
    'ad_user_data':           'denied',
    'ad_personalization':     'denied',
    'analytics_storage':      'denied',
    'functionality_storage':  'denied',
    'personalization_storage':'denied',
    'security_storage':       'granted',
    'wait_for_update':        500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  /* ─── Gespeicherte Einwilligung prüfen ─── */
  function getSavedConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function saveConsent(consentObj) {
    try {
      consentObj.version = CONSENT_VERSION;
      consentObj.date = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentObj));
    } catch (e) {}
  }

  /* ─── GTM laden ─── */
  function loadGTM() {
    if (document.getElementById('gtm-script')) return;
    var s = document.createElement('script');
    s.id = 'gtm-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  /* ─── Consent aktualisieren ─── */
  function applyConsent(type) {
    if (type === 'all') {
      gtag('consent', 'update', {
        'ad_storage':             'granted',
        'ad_user_data':           'granted',
        'ad_personalization':     'granted',
        'analytics_storage':      'granted',
        'functionality_storage':  'granted',
        'personalization_storage':'granted',
        'security_storage':       'granted'
      });
      loadGTM();
    } else {
      // Nur notwendige – alles außer security bleibt denied
      gtag('consent', 'update', {
        'ad_storage':             'denied',
        'ad_user_data':           'denied',
        'ad_personalization':     'denied',
        'analytics_storage':      'denied',
        'functionality_storage':  'denied',
        'personalization_storage':'denied',
        'security_storage':       'granted'
      });
    }
  }

  /* ─── Banner entfernen ─── */
  function hideBanner() {
    var banner = document.getElementById('lg-cookie-banner');
    if (banner) {
      banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 320);
    }
  }

  /* ─── Einwilligung: Alle akzeptieren ─── */
  function acceptAll() {
    saveConsent({ type: 'all' });
    applyConsent('all');
    hideBanner();
  }

  /* ─── Einwilligung: Nur notwendige ─── */
  function acceptNecessary() {
    saveConsent({ type: 'necessary' });
    applyConsent('necessary');
    hideBanner();
  }

  /* ─── Banner HTML ─── */
  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'lg-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.setAttribute('aria-modal', 'false');

    banner.innerHTML = [
      '<div class="lg-cb-inner">',
        '<div class="lg-cb-text">',
          '<p class="lg-cb-title">Cookies &amp; Datenschutz</p>',
          '<p class="lg-cb-desc">',
            'Diese Website verwendet Cookies und ähnliche Technologien. ',
            'Einige sind notwendig, andere helfen dabei, die Website und unser Angebot zu verbessern ',
            'sowie relevante Werbung anzuzeigen. ',
            'Weitere Informationen findest du in unserer ',
            '<a href="/datenschutz.html" class="lg-cb-link">Datenschutzerklärung</a>.',
          '</p>',
        '</div>',
        '<div class="lg-cb-actions">',
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

  /* ─── Banner CSS ─── */
  function injectStyles() {
    if (document.getElementById('lg-cookie-styles')) return;
    var style = document.createElement('style');
    style.id = 'lg-cookie-styles';
    style.textContent = [
      '#lg-cookie-banner{',
        'position:fixed;',
        'bottom:0;left:0;right:0;',
        'z-index:99999;',
        'background:#3d2838;',
        'color:#fdf6fb;',
        'padding:20px 24px;',
        'box-shadow:0 -4px 24px rgba(61,40,56,0.25);',
        'border-top:1px solid rgba(255,207,86,0.2);',
        'font-family:"Inter",system-ui,sans-serif;',
        'font-size:14px;',
        'line-height:1.5;',
      '}',
      '.lg-cb-inner{',
        'max-width:1200px;',
        'margin:0 auto;',
        'display:flex;',
        'align-items:center;',
        'gap:24px;',
        'flex-wrap:wrap;',
      '}',
      '.lg-cb-text{flex:1;min-width:260px;}',
      '.lg-cb-title{',
        'font-family:"Cormorant Garamond","Georgia",serif;',
        'font-size:1.1rem;',
        'font-weight:500;',
        'color:#ffe99a;',
        'margin:0 0 6px;',
      '}',
      '.lg-cb-desc{margin:0;color:#e8dde5;font-size:0.8rem;}',
      '.lg-cb-link{color:#ffcf56;text-underline-offset:3px;}',
      '.lg-cb-link:hover{color:#ffe99a;}',
      '.lg-cb-actions{',
        'display:flex;',
        'gap:10px;',
        'align-items:center;',
        'flex-shrink:0;',
        'flex-wrap:wrap;',
      '}',
      '.lg-cb-btn{',
        'cursor:pointer;',
        'border:none;',
        'border-radius:4px;',
        'padding:10px 20px;',
        'font-family:"Inter",system-ui,sans-serif;',
        'font-size:0.82rem;',
        'font-weight:500;',
        'letter-spacing:0.02em;',
        'transition:background 0.2s,color 0.2s,border-color 0.2s;',
        'white-space:nowrap;',
      '}',
      '.lg-cb-btn--outline{',
        'background:transparent;',
        'border:1px solid rgba(255,207,86,0.4);',
        'color:#fdf6fb;',
      '}',
      '.lg-cb-btn--outline:hover{',
        'border-color:rgba(255,207,86,0.8);',
        'color:#ffe99a;',
      '}',
      '.lg-cb-btn--primary{',
        'background:#ffcf56;',
        'color:#3d2838;',
      '}',
      '.lg-cb-btn--primary:hover{background:#ffe99a;}',
      '@media(max-width:600px){',
        '.lg-cb-inner{flex-direction:column;align-items:flex-start;gap:16px;}',
        '.lg-cb-actions{width:100%;}',
        '.lg-cb-btn{flex:1;text-align:center;}',
      '}'
    ].join('');

    document.head.appendChild(style);
  }

  /* ─── Initialisierung ─── */
  function init() {
    var saved = getSavedConsent();

    if (saved && saved.version === CONSENT_VERSION) {
      // Gespeicherte Präferenz anwenden – kein Banner zeigen
      applyConsent(saved.type);
      return;
    }

    // Noch keine Einwilligung → Banner anzeigen
    injectStyles();

    function showBanner() {
      var banner = createBanner();
      document.body.appendChild(banner);

      document.getElementById('lg-cb-all').addEventListener('click', acceptAll);
      document.getElementById('lg-cb-necessary').addEventListener('click', acceptNecessary);

      // Keyboard-Zugänglichkeit: Fokus auf ersten Button setzen
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
