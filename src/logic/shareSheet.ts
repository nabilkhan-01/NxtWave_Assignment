/**
 * Unified Share Sheet Logic
 * Pure functions for multi-channel share URL generation, message formatting,
 * and capability-aware payload construction.
 */

import { AttributionParams } from './attribution';
import { ConnectorSourceType, MessageVariant, SOURCE_TYPES, MESSAGE_VARIANTS, sanitizeSourceLabel } from './connectorKit';

export type ShareChannel =
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'instagram'
  | 'native'
  | 'clipboard';

export interface ShareContextConfig {
  context: 'peer' | 'connector';
  baseLocation: string;
  presetTitle?: string;
  // For peer sharing
  incomingAttribution?: AttributionParams;
  // For connector sharing
  sourceType?: ConnectorSourceType;
  sourceLabel?: string;
  variant?: MessageVariant;
}

export interface SharePayload {
  channel: ShareChannel;
  title: string;
  subject: string;
  messageText: string;
  callToAction: string;
  trackedUrl: string;
  actionUrl?: string;
}

/**
 * Maps share channels to their designated utm_medium values.
 */
export const CHANNEL_UTM_MEDIUM: Record<ShareChannel, string> = {
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  email: 'email',
  native: 'native-share',
  instagram: 'instagram',
  clipboard: 'clipboard'
};

/**
 * Builds a clean, tracked URL specific to the channel and sharing context.
 * Strictly avoids leaking any private project drafts or user text.
 */
export function buildTrackedShareUrl(
  config: ShareContextConfig,
  channel: ShareChannel
): string {
  try {
    const url = new URL(config.baseLocation, 'https://shipscope.local');
    url.hash = '';

    // Remove any user draft parameters that might leak private text
    url.searchParams.delete('draft');
    url.searchParams.delete('description');
    url.searchParams.delete('project');
    url.searchParams.delete('custom');

    const utmMedium = CHANNEL_UTM_MEDIUM[channel] || 'referral';

    if (config.context === 'connector') {
      const sourceConfig = SOURCE_TYPES.find((s) => s.id === config.sourceType);
      const sourcePrefix = sourceConfig ? sourceConfig.defaultSource : 'connector';
      const sanitized = sanitizeSourceLabel(config.sourceLabel);
      const sourceVal = sanitized ? `${sourcePrefix}_${sanitized}` : sourcePrefix;
      const variantKey = config.variant || 'scope-hook';

      url.searchParams.set('utm_source', sourceVal);
      url.searchParams.set('utm_medium', utmMedium);
      url.searchParams.set('utm_campaign', 'shipscope-workshop');
      url.searchParams.set('utm_content', variantKey);
    } else {
      // Peer context
      const campaign = config.incomingAttribution?.utm_campaign || 'shipscope-workshop';
      url.searchParams.set('utm_source', 'peer');
      url.searchParams.set('utm_medium', utmMedium);
      url.searchParams.set('utm_campaign', campaign);
    }

    return url.toString();
  } catch {
    return config.baseLocation;
  }
}

/**
 * Formats the natural text message body depending on context.
 */
export function buildShareMessageText(config: ShareContextConfig): {
  title: string;
  subject: string;
  messageText: string;
  callToAction: string;
} {
  if (config.context === 'connector') {
    const variantKey = config.variant || 'scope-hook';
    const variantData = MESSAGE_VARIANTS[variantKey] || MESSAGE_VARIANTS['scope-hook'];

    return {
      title: 'ShipScope — Campus Project Scope Diagnostic',
      subject: 'Build Your First AI Project — ShipScope Scope Diagnostic',
      messageText: variantData.body,
      callToAction: 'Check your project scope'
    };
  }

  // Peer context
  const intro = config.presetTitle
    ? `I'm scoping a "${config.presetTitle}" idea with ShipScope. It helped me trim the first version down to something buildable.`
    : "I'm scoping an AI capstone idea with ShipScope. It helped me cut the first version down to something buildable.";

  return {
    title: 'ShipScope — AI Capstone Scope Diagnostic',
    subject: 'Try ShipScope — scope your AI project',
    messageText: intro,
    callToAction: 'Try your own capstone idea here'
  };
}

/**
 * Builds the complete share payload including action URLs for web/app protocols.
 */
export function buildSharePayload(
  config: ShareContextConfig,
  channel: ShareChannel
): SharePayload {
  const trackedUrl = buildTrackedShareUrl(config, channel);
  const { title, subject, messageText, callToAction } = buildShareMessageText(config);
  const fullTextWithUrl = `${messageText}\n\n${callToAction}:\n${trackedUrl}`;

  let actionUrl: string | undefined;

  switch (channel) {
    case 'whatsapp':
      actionUrl = `https://wa.me/?text=${encodeURIComponent(fullTextWithUrl)}`;
      break;

    case 'telegram':
      // Telegram official share format: url param + text param
      actionUrl = `https://t.me/share/url?url=${encodeURIComponent(trackedUrl)}&text=${encodeURIComponent(messageText)}`;
      break;

    case 'email':
      // mailto: URL with encoded subject and body
      actionUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullTextWithUrl)}`;
      break;

    case 'instagram':
      // Instagram does not support prefilling text/link via web URL.
      // Used as safe destination fallback after copying link to clipboard.
      actionUrl = 'https://www.instagram.com/';
      break;

    case 'native':
    case 'clipboard':
    default:
      actionUrl = undefined;
      break;
  }

  return {
    channel,
    title,
    subject,
    messageText,
    callToAction,
    trackedUrl,
    actionUrl
  };
}

/**
 * Dedicated helper to generate WhatsApp URL.
 */
export function buildWhatsAppUrl(config: ShareContextConfig): string {
  return buildSharePayload(config, 'whatsapp').actionUrl || '';
}

/**
 * Dedicated helper to generate Telegram URL.
 */
export function buildTelegramUrl(config: ShareContextConfig): string {
  return buildSharePayload(config, 'telegram').actionUrl || '';
}

/**
 * Dedicated helper to generate Email mailto URL.
 */
export function buildEmailUrl(config: ShareContextConfig): string {
  return buildSharePayload(config, 'email').actionUrl || '';
}

/**
 * Helper to construct Web Share API payload.
 */
export function buildNativeShareData(config: ShareContextConfig): {
  title: string;
  text: string;
  url: string;
} {
  const payload = buildSharePayload(config, 'native');
  return {
    title: payload.title,
    text: `${payload.messageText}\n\n${payload.callToAction}:`,
    url: payload.trackedUrl
  };
}

/**
 * Capability check for Web Share API.
 */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}
