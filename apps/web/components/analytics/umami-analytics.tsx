import Script from 'next/script';

interface UmamiAnalyticsProps {
  websiteId: string;
  scriptUrl?: string;
  hostUrl?: string;
  domains?: string;
}

export function UmamiAnalytics({
  websiteId,
  scriptUrl = 'https://cloud.umami.is/script.js',
  hostUrl,
  domains,
}: UmamiAnalyticsProps) {
  if (!websiteId) return null;

  const validScriptUrl =
    scriptUrl && scriptUrl.trim() !== ''
      ? scriptUrl.trim()
      : 'https://cloud.umami.is/script.js';

  return (
    <Script
      strategy="afterInteractive"
      src={validScriptUrl}
      data-website-id={websiteId}
      {...(hostUrl ? { 'data-host-url': hostUrl } : {})}
      {...(domains ? { 'data-domains': domains } : {})}
    />
  );
}
