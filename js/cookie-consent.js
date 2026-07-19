/* ═══════════════════════════════════════════════════════════════════
   cookie-consent.js
   ───────────────────────────────────────────────────────────────────
   Cookiebanner, cookievoorkeurenscherm en Google Consent Mode v2.

   Wat dit bestand doet:
   1. Leest een eerder opgeslagen keuze van de bezoeker uit localStorage.
   2. Zolang er geen (geldige) keuze bekend is: toont de cookiebanner.
      De banner verdwijnt pas nadat de bezoeker een keuze heeft gemaakt.
   3. Bouwt het voorkeurenscherm (modal) op met drie categorieën:
      noodzakelijk (altijd aan), analytisch en marketing.
   4. Slaat elke keuze op in localStorage, inclusief een versienummer
      (CONSENT_VERSION) — wordt dit nummer ooit verhoogd (bijvoorbeeld
      omdat er een categorie bijkomt), dan wordt de bestaande keuze
      als verlopen beschouwd en verschijnt de banner opnieuw.
   5. Werkt Google Consent Mode v2 bij via gtag('consent', 'update', …).
      De *default* (alles geweigerd, behalve security_storage) staat
      al vóór dit bestand in de <head> van elke pagina, zodat Google-
      tags nooit zonder consent-status kunnen laden.
   6. Zendt een 'consentUpdated' event uit zodat andere scripts
      (zoals js/analytics.js) hierop kunnen reageren.
   7. Koppelt alle knoppen met [data-cc-open-settings] (de vaste
      "Cookie-instellingen"-link in de footer) aan het voorkeurenscherm.

   Dit bestand heeft geen externe afhankelijkheden. Het verwacht wel
   dat window.gtag al bestaat (gedefinieerd in het inline consent-
   default-script in <head>, vóór dit script wordt geladen).
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Instellingen ──────────────────────────────────────────────── */
  var STORAGE_KEY = 'donkersadvies_cookie_consent';
  var CONSENT_VERSION = 1;

  /* ── Interne status ────────────────────────────────────────────── */
  var consentState = null;   // { version, timestamp, necessary, analytics, marketing }
  var bannerEl = null;
  var modalEl = null;
  var lastFocusedEl = null;  // element om focus naar terug te zetten na sluiten modal

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ── Helper: juiste relatieve pad, ook vanuit /blog/-submap ──────── */
  function relPath(file) {
    return window.location.pathname.indexOf('/blog/') !== -1 ? '../' + file : file;
  }

  /* ── Opslag lezen/schrijven ───────────────────────────────────────
     localStorage wordt hier gebruikt (in plaats van een cookie) om
     uitsluitend de eigen voorkeur van de bezoeker te onthouden. Dit
     is strikt noodzakelijk voor de werking van de banner zelf en
     vereist daarom geen toestemming. */
  function loadStoredConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONSENT_VERSION) return parsed;
      return null;
    } catch (e) {
      // localStorage niet beschikbaar (bv. privénavigatie met blokkade) → banner gewoon tonen
      return null;
    }
  }

  function persistConsent(analytics, marketing) {
    consentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consentState));
    } catch (e) {
      // Kan niet opslaan: de keuze geldt dan alleen voor dit paginabezoek.
    }
    applyConsentToGoogle();
  }

  /* ── Google Consent Mode v2 bijwerken ─────────────────────────────
     De 7 signalen die Google Consent Mode v2 kent, worden hier
     afgeleid van de 3 categorieën die de bezoeker daadwerkelijk kan
     kiezen:
       - necessary  → functionality_storage + security_storage (altijd 'granted')
       - analytics  → analytics_storage
       - marketing  → ad_storage, ad_user_data, ad_personalization,
                       personalization_storage
  */
  function applyConsentToGoogle() {
    if (!consentState || typeof window.gtag !== 'function') return;

    window.gtag('consent', 'update', {
      functionality_storage: 'granted',
      security_storage: 'granted',
      analytics_storage: consentState.analytics ? 'granted' : 'denied',
      ad_storage: consentState.marketing ? 'granted' : 'denied',
      ad_user_data: consentState.marketing ? 'granted' : 'denied',
      ad_personalization: consentState.marketing ? 'granted' : 'denied',
      personalization_storage: consentState.marketing ? 'granted' : 'denied'
    });

    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: consentState }));
  }

  /* ── Publieke API ──────────────────────────────────────────────────
     window.DonkersConsent wordt gebruikt door js/analytics.js (om de
     huidige stand te lezen) en door de "Cookie-instellingen"-knop. */
  window.DonkersConsent = {
    get: function () { return consentState; },
    openPreferences: function () { openModal(document.activeElement); }
  };

  /* ── Cookiebanner ──────────────────────────────────────────────── */
  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'cc-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookiemelding');

    el.innerHTML =
      '<div class="cc-banner-inner">' +
        '<div class="cc-text">' +
          '<p>Wij gebruiken cookies om de website goed te laten werken en, alleen met uw toestemming, om websitebezoek te analyseren. ' +
          'Meer informatie vindt u in onze <a href="' + relPath('cookies.html') + '">cookieverklaring</a>.</p>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-btn-accept" data-cc="accept">Alles accepteren</button>' +
          '<button type="button" class="cc-btn cc-btn-reject" data-cc="reject">Alles weigeren</button>' +
          '<button type="button" class="cc-btn cc-btn-prefs" data-cc="prefs">Voorkeuren aanpassen</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(el);

    el.querySelector('[data-cc="accept"]').addEventListener('click', function () {
      persistConsent(true, true);
      hideBanner();
    });
    el.querySelector('[data-cc="reject"]').addEventListener('click', function () {
      persistConsent(false, false);
      hideBanner();
    });
    el.querySelector('[data-cc="prefs"]').addEventListener('click', function (e) {
      openModal(e.currentTarget);
    });

    return el;
  }

  function showBanner() {
    if (!bannerEl) bannerEl = buildBanner();
    // requestAnimationFrame zorgt dat de transition ook echt animeert
    // in plaats van meteen in de eindstand te verschijnen.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bannerEl.classList.add('cc-visible'); });
    });
  }

  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('cc-visible');
  }

  /* ── Voorkeurenmodal ───────────────────────────────────────────── */
  function buildModal() {
    var el = document.createElement('div');
    el.className = 'cc-modal-overlay';

    el.innerHTML =
      '<div class="cc-modal" role="dialog" aria-modal="true" aria-labelledby="ccModalTitle">' +
        '<div class="cc-modal-head">' +
          '<h2 id="ccModalTitle">Cookievoorkeuren</h2>' +
          '<button type="button" class="cc-close" data-cc="close" aria-label="Voorkeuren sluiten">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +

        '<p class="cc-modal-intro">Kies per categorie of u toestemming geeft. Noodzakelijke cookies staan altijd aan, omdat de website daarzonder niet goed werkt. Een volledig overzicht staat in onze <a href="' + relPath('cookies.html') + '">cookieverklaring</a>.</p>' +

        '<div class="cc-category">' +
          '<div class="cc-category-head">' +
            '<span class="cc-category-title">Noodzakelijke cookies</span>' +
            '<span class="cc-locked-label">Altijd actief</span>' +
          '</div>' +
          '<p>Nodig om de website goed te laten functioneren, waaronder het onthouden van uw cookievoorkeur.</p>' +
        '</div>' +

        '<div class="cc-category">' +
          '<div class="cc-category-head">' +
            '<span class="cc-category-title" id="ccAnalyticsLabel">Analytische cookies</span>' +
            '<label class="cc-switch">' +
              '<input type="checkbox" id="ccAnalyticsToggle" aria-labelledby="ccAnalyticsLabel" />' +
              '<span class="cc-slider" aria-hidden="true"></span>' +
            '</label>' +
          '</div>' +
          '<p>Helpen ons begrijpen hoe bezoekers de website gebruiken (Google Analytics 4), zodat wij deze kunnen verbeteren.</p>' +
        '</div>' +

        '<div class="cc-category">' +
          '<div class="cc-category-head">' +
            '<span class="cc-category-title" id="ccMarketingLabel">Marketingcookies</span>' +
            '<label class="cc-switch">' +
              '<input type="checkbox" id="ccMarketingToggle" aria-labelledby="ccMarketingLabel" />' +
              '<span class="cc-slider" aria-hidden="true"></span>' +
            '</label>' +
          '</div>' +
          '<p>Worden gebruikt om, zodra Donkers Advies dit inzet, relevante advertenties te tonen via bijvoorbeeld Google Ads.</p>' +
        '</div>' +

        '<div class="cc-modal-footer">' +
          '<button type="button" class="cc-btn cc-btn-reject" data-cc="reject">Alles weigeren</button>' +
          '<button type="button" class="cc-btn cc-btn-reject" data-cc="accept-all">Alles accepteren</button>' +
          '<button type="button" class="cc-btn cc-btn-accept" data-cc="save">Voorkeuren opslaan</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(el);

    // Klik op de overlay (buiten de kaart) sluit de modal, net als Escape.
    el.addEventListener('click', function (e) {
      if (e.target === el) closeModal();
    });
    el.querySelector('[data-cc="close"]').addEventListener('click', closeModal);

    el.querySelector('[data-cc="accept-all"]').addEventListener('click', function () {
      persistConsent(true, true);
      syncToggles();
      hideBanner();
      closeModal();
    });
    el.querySelector('[data-cc="reject"]').addEventListener('click', function () {
      persistConsent(false, false);
      syncToggles();
      hideBanner();
      closeModal();
    });
    el.querySelector('[data-cc="save"]').addEventListener('click', function () {
      var analytics = el.querySelector('#ccAnalyticsToggle').checked;
      var marketing = el.querySelector('#ccMarketingToggle').checked;
      persistConsent(analytics, marketing);
      hideBanner();
      closeModal();
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') trapFocus(e, el.querySelector('.cc-modal'));
    });

    return el;
  }

  function syncToggles() {
    if (!modalEl) return;
    modalEl.querySelector('#ccAnalyticsToggle').checked = !!(consentState && consentState.analytics);
    modalEl.querySelector('#ccMarketingToggle').checked = !!(consentState && consentState.marketing);
  }

  // Houdt Tab/Shift+Tab binnen de modal (eenvoudige, robuuste focus-trap).
  function trapFocus(e, container) {
    var focusables = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE));
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function openModal(trigger) {
    lastFocusedEl = trigger || document.activeElement;
    if (!modalEl) modalEl = buildModal();
    syncToggles();
    modalEl.classList.add('cc-visible');
    document.body.style.overflow = 'hidden'; // voorkomt scrollen van de achterliggende pagina
    var firstFocusable = modalEl.querySelector('.cc-modal').querySelector(FOCUSABLE);
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('cc-visible');
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    // Is er nog steeds geen geldige keuze opgeslagen? Dan blijft de banner zichtbaar.
    if (!consentState) showBanner();
  }

  /* ── "Cookie-instellingen"-knop (footer, op elke pagina) ─────────── */
  function wireSettingsButtons() {
    var buttons = document.querySelectorAll('[data-cc-open-settings]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        e.preventDefault();
        openModal(e.currentTarget);
      });
    }
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    wireSettingsButtons();
    consentState = loadStoredConsent();
    if (consentState) {
      applyConsentToGoogle();
    } else {
      showBanner();
    }
  });
})();
