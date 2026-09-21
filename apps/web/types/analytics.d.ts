export {};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    umami?: {
      track: {
        (eventName: string, eventData?: Record<string, any>): void;
        (customPayload: Record<string, any>): void;
      };
      identify?: (userId: string, userProperties?: Record<string, any>) => void;
    };
  }
}
