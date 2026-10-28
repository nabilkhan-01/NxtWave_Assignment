/**
 * Attribution & Share Link Utilities for ShipScope
 * Handles UTM query parameter parsing and outgoing link generation.
 */

export interface AttributionParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Parses UTM attribution parameters from a window.location.search or query string.
 */
export function parseAttribution(search: string): AttributionParams {
  if (!search) return {};

  const cleanSearch = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(cleanSearch);
  const attribution: AttributionParams = {};

  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');

  if (source) attribution.utm_source = source.trim();
  if (medium) attribution.utm_medium = medium.trim();
  if (campaign) attribution.utm_campaign = campaign.trim();

  return attribution;
}

/**
 * Builds a clean sharing URL with appropriate peer attribution.
 * Never includes user project descriptions or private information.
 */
export function buildShareUrl(
  baseLocation: string,
  incomingAttribution: AttributionParams = {},
  channel: 'whatsapp' | 'copy' = 'copy'
): string {
  try {
    const url = new URL(baseLocation, 'https://shipscope.local');

    // Remove hash and any previous specific project params to avoid leaks
    url.hash = '';

    // Set peer attribution parameters
    // Preserve incoming campaign if present, default to 'shipscope-workshop'
    const campaign = incomingAttribution.utm_campaign || 'shipscope-workshop';

    url.searchParams.set('utm_source', 'peer');
    url.searchParams.set('utm_medium', channel === 'whatsapp' ? 'whatsapp' : 'clipboard');
    url.searchParams.set('utm_campaign', campaign);

    return url.toString();
  } catch {
    // Fallback if URL constructor fails
    return baseLocation;
  }
}

/**
 * Generates the clean, honest WhatsApp sharing text.
 * Strictly avoids user descriptions or private data.
 */
export function buildWhatsAppMessage(shareUrl: string, presetTitle?: string): string {
  const intro = presetTitle
    ? `I'm scoping a "${presetTitle}" idea with ShipScope. It helped me trim the first version down to something buildable.`
    : "I'm scoping an AI capstone idea with ShipScope. It helped me cut the first version down to something buildable.";

  return `${intro}\n\nTry your own capstone idea here:\n${shareUrl}`;
}

/**
 * Creates the fully encoded wa.me URL for one-click mobile/web sharing.
 */
export function buildWhatsAppUrl(shareUrl: string, presetTitle?: string): string {
  const message = buildWhatsAppMessage(shareUrl, presetTitle);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
