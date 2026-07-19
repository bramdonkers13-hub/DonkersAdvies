/**
 * Vercel Speed Insights initialization
 * This script initializes the Speed Insights tracking for the website.
 * 
 * Documentation: https://vercel.com/docs/speed-insights/quickstart
 */

// Initialize the Speed Insights queue
window.si = window.si || function () { 
  (window.siq = window.siq || []).push(arguments); 
};
