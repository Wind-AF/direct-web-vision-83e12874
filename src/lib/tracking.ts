import { supabase } from "@/integrations/supabase/client";
import { trackTikTok, type TikTokEvent } from "@/lib/tiktok";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function getTtclid(): string | undefined {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("ttclid");
  if (fromUrl) {
    try {
      sessionStorage.setItem("ttclid", fromUrl);
    } catch {/* noop */}
    return fromUrl;
  }
  try {
    return sessionStorage.getItem("ttclid") || undefined;
  } catch {
    return undefined;
  }
}

interface TrackArgs {
  event: TikTokEvent;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  external_id?: string;
  contents?: Array<{ content_id?: string; content_name?: string; quantity?: number; price?: number }>;
}

export async function trackEvent({ event, value, currency = "BRL", email, phone, external_id, contents }: TrackArgs) {
  const eventId = trackTikTok(event, { value, currency, contents });

  // Google Ads — conversion tracking
  if (typeof window !== "undefined" && (window as any).gtag) {
    const gtag = (window as any).gtag as (...args: any[]) => void;
    gtag("event", "conversion", {
      send_to: "AW-18188921340",
      event_callback: () => {},
    });
    // Também dispara o evento genérico para remarketing
    gtag("event", event, {
      send_to: "AW-18188921340",
      value: value ?? undefined,
      currency: currency ?? undefined,
    });
  }

  // Server-side (Events API) — dedup pelo mesmo event_id
  try {
    await supabase.functions.invoke("tiktok-event", {
      body: {
        event,
        event_id: eventId,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        email,
        phone,
        external_id,
        ttclid: getTtclid(),
        ttp: getCookie("_ttp"),
        value,
        currency,
        contents,
      },
    });
  } catch (e) {
    console.warn("tiktok-event invoke failed", e);
  }

  return eventId;
}
