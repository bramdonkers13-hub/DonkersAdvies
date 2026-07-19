/* ═══════════════════════════════════════════════════════════════════
   analytics.js
   ───────────────────────────────────────────────────────────────────
   Google Analytics 4 — laadt alleen na toestemming.

   ▸ HET ENIGE DAT AANGEPAST MOET WORDEN, IS GA_MEASUREMENT_ID HIERONDER.
     Zodra dat is ingevuld, hoeft er verder niets in dit bestand te
     veranderen.

   Werking:
   - Dit script laadt de Google-tag (gtag.js) pas op het moment dat de
     bezoeker daadwerkelijk toestemming heeft gegeven voor analytische
     cookies (categorie "analytics" in cookie-consent.js). Vóór die
     toestemming wordt er dus geen enkel verzoek naar Google verstuurd.
   - Zodra toestemming eenmaal is gegeven, blijft GA4 geladen; trekt de
     bezoeker de toestemming later weer in via het voorkeurenscherm,
     dan zorgt Google Consent Mode (via cookie-consent.js) ervoor dat
     GA4 stopt met het zetten/lezen van cookies.
   - GA4 registreert automatisch paginaweergaven (Enhanced Measurement),
     dus er is geen handmatige page_view-configuratie nodig op deze
     statische, meerdere-pagina's-website.
   ═══════════════════════════════════════════════════════════════════ */

// ─── ↓ Alleen deze regel aanpassen ↓ ─────────────────────────────────
const GA_MEASUREMENT_ID = "G-CG8MNK1BF3";
// ─── ↑ Alleen deze regel aanpassen ↑ ─────────────────────────────────

(function () {
  'use strict';

  var isPlaceholder = !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('XXXX') !== -1;
  var isLoaded = false;

  function loadGoogleAnalytics() {
    if (isLoaded || isPlaceholder) return;
    isLoaded = true;

    // Laadt de officiële Google-tag asynchroon.
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    // gtag() en dataLayer bestaan al (uit het consent-default-script in
    // <head>); we hergebruiken dezelfde dataLayer zodat de eerder
    // ingestelde consent-status behouden blijft.
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function checkConsentAndLoad() {
    var consent = window.DonkersConsent && window.DonkersConsent.get();
    if (consent && consent.analytics) loadGoogleAnalytics();
  }

  // Reageer op een live keuze (banner/voorkeurenscherm) …
  window.addEventListener('consentUpdated', checkConsentAndLoad);
  // … én op een eerder al opgeslagen keuze bij het laden van de pagina.
  document.addEventListener('DOMContentLoaded', checkConsentAndLoad);
})();
