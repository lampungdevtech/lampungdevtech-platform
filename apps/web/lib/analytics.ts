/**
 * Helper utilitas untuk melacak event kustom ke provider analytics aktif (Umami / Google Analytics)
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // 1. Umami Event Tracking
  if (window.umami && typeof window.umami.track === 'function') {
    try {
      window.umami.track(eventName, eventData);
    } catch (err) {
      console.warn('[Analytics:Umami] Gagal mengirim event:', err);
    }
  }

  // 2. Google Analytics (GA4) Event Tracking
  if (window.gtag && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, eventData);
    } catch (err) {
      console.warn('[Analytics:GA] Gagal mengirim event:', err);
    }
  }
}

/**
 * Mendapatkan konfigurasi provider analytics saat runtime di sisi klien
 */
export function getAnalyticsConfig() {
  const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '').toLowerCase().trim();
  const gaId = (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ||
    ''
  ).trim();
  const umamiWebsiteId = (process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '').trim();
  const umamiScriptUrl = (
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'
  ).trim();
  const umamiHostUrl = (process.env.NEXT_PUBLIC_UMAMI_HOST_URL || '').trim();

  const isUmami =
    (provider === 'umami' ||
      provider === 'both' ||
      provider === 'all' ||
      (provider === '' && !!umamiWebsiteId && !gaId)) &&
    !!umamiWebsiteId;

  const isGoogle =
    (['google', 'ga', 'google-analytics', 'google_analytics', 'both', 'all'].includes(provider) ||
      (provider === '' && !!gaId && !umamiWebsiteId)) &&
    !!gaId;

  return {
    provider,
    isUmami,
    isGoogle,
    gaId,
    umamiWebsiteId,
    umamiScriptUrl,
    umamiHostUrl,
  };
}
