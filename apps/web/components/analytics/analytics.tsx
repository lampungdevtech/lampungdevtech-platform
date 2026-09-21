import { GoogleAnalytics } from './google-analytics';
import { UmamiAnalytics } from './umami-analytics';

export function Analytics() {
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
  const umamiDomains = (process.env.NEXT_PUBLIC_UMAMI_DOMAINS || '').trim();

  // Mode Umami aktif bila provider='umami' atau auto-detect bila website_id terisi
  const isUmamiActive =
    (provider === 'umami' ||
      provider === 'both' ||
      provider === 'all' ||
      (provider === '' && !!umamiWebsiteId && !gaId)) &&
    !!umamiWebsiteId;

  // Mode Google Analytics aktif bila provider='google'/'ga' atau auto-detect bila GA ID terisi
  const isGoogleActive =
    (['google', 'ga', 'google-analytics', 'google_analytics', 'both', 'all'].includes(provider) ||
      (provider === '' && !!gaId && !umamiWebsiteId)) &&
    !!gaId;

  return (
    <>
      {isUmamiActive && (
        <UmamiAnalytics
          websiteId={umamiWebsiteId}
          scriptUrl={umamiScriptUrl}
          hostUrl={umamiHostUrl || undefined}
          domains={umamiDomains || undefined}
        />
      )}
      {isGoogleActive && <GoogleAnalytics measurementId={gaId} />}
    </>
  );
}
