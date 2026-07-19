/**
 * Vercel Speed Insights Integration
 * 
 * This script initializes Vercel Speed Insights for the static website.
 * Speed Insights will automatically track Web Vitals and performance metrics.
 * 
 * For static HTML sites deployed on Vercel, the Speed Insights script is
 * automatically injected when enabled in the Vercel Dashboard under:
 * Project Settings > Analytics > Speed Insights
 * 
 * This file serves as a reference and placeholder for any custom Speed Insights
 * configuration that may be needed in the future.
 */

(function() {
  'use strict';
  
  // Speed Insights initialization
  // The actual tracking script is automatically injected by Vercel
  // when Speed Insights is enabled in the project settings
  
  window.si = window.si || function () {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // You can add custom Speed Insights events here if needed
  // Example: window.si('event', { name: 'custom-event' });
  
})();
