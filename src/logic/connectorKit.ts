/**
 * Campus Connector Kit Logic
 * Pure functions for generating trackable, attribution-tagged distribution messages.
 */

export type ConnectorSourceType = 'class-rep' | 'coding-club' | 'placement-community' | 'peer';
export type MessageVariant = 'scope-hook' | 'build-first-hook';

export interface SourceTypeOption {
  id: ConnectorSourceType;
  label: string;
  defaultSource: string;
  description: string;
}

export const SOURCE_TYPES: SourceTypeOption[] = [
  {
    id: 'class-rep',
    label: 'Class Rep',
    defaultSource: 'class_rep',
    description: 'Section WhatsApp groups and official batch channels'
  },
  {
    id: 'coding-club',
    label: 'Coding Club',
    defaultSource: 'coding_club',
    description: 'Developer circles, hackathon teams, and tech societies'
  },
  {
    id: 'placement-community',
    label: 'Placement Community',
    defaultSource: 'placement_comm',
    description: 'Final-year prep groups and internship discussion forums'
  },
  {
    id: 'peer',
    label: 'Peer',
    defaultSource: 'peer',
    description: 'Direct 1:1 sharing between project partners and friends'
  }
];

export interface MessageVariantOption {
  id: MessageVariant;
  name: string;
  tag: string;
  hook: string;
  body: string;
}

export const MESSAGE_VARIANTS: Record<MessageVariant, MessageVariantOption> = {
  'scope-hook': {
    id: 'scope-hook',
    name: 'Variant A — Project Scope Hook',
    tag: 'Variant A',
    hook: 'Scope diagnosis angle',
    body: "Have an AI project idea but not sure what belongs in version one? ShipScope helps you cut the scope and find a practical first build. Try it before joining NxtWave's free 'Build Your First AI Project in 60 Minutes' workshop."
  },
  'build-first-hook': {
    id: 'build-first-hook',
    name: 'Variant B — Build-First Hook',
    tag: 'Variant B',
    hook: 'Action-first build angle',
    body: "Stop collecting AI project ideas. Pick one, cut what does not belong in version one, and see what you should build first with ShipScope."
  }
};

/**
 * Sanitizes an arbitrary campus or connector label into a safe URL slug.
 * Removes non-alphanumeric chars, converts spaces to hyphens, collapses duplicates.
 */
export function sanitizeSourceLabel(label?: string): string {
  if (!label) return '';
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Builds the tracked campaign URL for the connector kit.
 * Follows standard attribution structure:
 * utm_source: <sourcePrefix>_<sanitizedLabel> (or just sourcePrefix)
 * utm_medium: whatsapp
 * utm_campaign: shipscope-workshop
 * utm_content: <variantId>
 */
export function buildConnectorUrl(
  baseLocation: string,
  sourceType: ConnectorSourceType,
  sourceLabel?: string,
  variant: MessageVariant = 'scope-hook'
): string {
  try {
    const url = new URL(baseLocation, 'https://shipscope.local');
    url.hash = '';

    const sourceConfig = SOURCE_TYPES.find((s) => s.id === sourceType);
    const sourcePrefix = sourceConfig ? sourceConfig.defaultSource : 'connector';
    const sanitized = sanitizeSourceLabel(sourceLabel);
    const sourceVal = sanitized ? `${sourcePrefix}_${sanitized}` : sourcePrefix;

    url.searchParams.set('utm_source', sourceVal);
    url.searchParams.set('utm_medium', 'whatsapp');
    url.searchParams.set('utm_campaign', 'shipscope-workshop');
    url.searchParams.set('utm_content', variant);

    return url.toString();
  } catch {
    return baseLocation;
  }
}

/**
 * Builds the complete text message ready for clipboard or WhatsApp dispatch.
 */
export function buildConnectorMessage(
  variant: MessageVariant,
  campaignUrl: string
): string {
  const variantData = MESSAGE_VARIANTS[variant] || MESSAGE_VARIANTS['scope-hook'];
  return `${variantData.body}\n\nCheck your project scope:\n${campaignUrl}`;
}

/**
 * Creates the encoded wa.me deep link.
 */
export function buildConnectorWhatsAppUrl(
  variant: MessageVariant,
  campaignUrl: string
): string {
  const message = buildConnectorMessage(variant, campaignUrl);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
