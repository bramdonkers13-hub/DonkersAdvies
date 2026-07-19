# Vercel Speed Insights Setup

This document explains how Vercel Speed Insights has been configured for the Donkers Advies website.

## What is Speed Insights?

Vercel Speed Insights is a real-time performance monitoring tool that tracks Web Vitals and other performance metrics for your website. It helps you understand and improve user experience by measuring:

- **LCP (Largest Contentful Paint)**: Page loading performance
- **FID (First Input Delay)**: Interactivity
- **CLS (Cumulative Layout Shift)**: Visual stability
- **FCP (First Contentful Paint)**: Initial render time
- **TTFB (Time to First Byte)**: Server response time

## Setup for Static HTML Sites

For static HTML websites deployed on Vercel, Speed Insights uses automatic script injection. No code changes are required in the HTML files.

### Step 1: Enable Speed Insights in Vercel Dashboard

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** > **Speed Insights**
3. Click **Enable Speed Insights**
4. Deploy your project (or wait for the next deployment)

### Step 2: Automatic Script Injection

Once enabled, Vercel automatically:
- Injects the Speed Insights tracking script into all HTML pages
- Collects Web Vitals data from real user visits
- Makes the data available in the Speed Insights dashboard

**No manual script tags are needed in your HTML files.**

### Step 3: View Metrics

After deployment and user visits:
1. Go to your project in the Vercel Dashboard
2. Click on **Speed Insights** in the navigation
3. View real-time performance metrics and Web Vitals scores

## Package Configuration

The `package.json` file includes `@vercel/speed-insights` as a dependency to document the integration and provide version tracking, even though the package isn't directly imported in the static HTML files.

## Verification

To verify Speed Insights is working:

1. Deploy the site to Vercel
2. Visit your website
3. Open browser DevTools > Network tab
4. Look for requests to `/_vercel/speed-insights/` endpoints
5. Check the Vercel Dashboard for incoming metrics (may take a few minutes)

## Additional Configuration (Optional)

If you need custom Speed Insights configuration in the future, you can:

1. Use the `speed-insights.js` file for custom event tracking
2. Add script references to specific pages that need enhanced tracking
3. Configure sampling rates and other options in the Vercel Dashboard

## Documentation

For more information, see:
- [Vercel Speed Insights Quickstart](https://vercel.com/docs/speed-insights/quickstart)
- [Speed Insights Overview](https://vercel.com/docs/speed-insights)
- [@vercel/speed-insights Package](https://vercel.com/docs/speed-insights/package)

## Support

If you encounter issues:
- Check the Vercel Dashboard for any configuration warnings
- Ensure the site is deployed (Speed Insights only works on deployed sites, not local development)
- Contact Vercel Support through the dashboard

---

**Setup completed on:** 2026-07-19  
**Configured for:** Static HTML website  
**Integration method:** Automatic script injection via Vercel Dashboard
