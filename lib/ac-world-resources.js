import { verifiedWorldLinks } from './ac-verified-links.js';

export function safeResourceUrl(value) {
  let raw = String(value || '').trim();
  // Community listings sometimes omit the scheme. Accept domains, not arbitrary
  // text, protocol-relative URLs, credentials, or executable URL schemes.
  if (/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i.test(raw)) raw = 'https://' + raw;
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}


// Explicit test-only worlds in the community directory, not production worlds
// which happen to be offline or mention active development in their description.
export function isTestWorld(server) {
  return ['funkytest', 'gdle test'].includes(String(server.name || '').trim().toLowerCase());
}

export function worldResources(server) {
  const name = String(server.name || '').trim().toLowerCase();
  return verifiedWorldLinks.filter(link => {
    if (link.kind !== 'website') return false;
    if (link.world.toLowerCase() !== name) return false;
    if (!link.field) return true;
    const candidate = safeResourceUrl(server[link.field] || server[link.field + '_url']);
    return candidate === safeResourceUrl(link.url);
  }).map(link => ({
    label: link.label, url: safeResourceUrl(link.url), kind: link.kind,
    source: link.source, checkedAt: link.checkedAt, verification: 'checked',
    ...(link.guildName ? { community: link.guildName } : {})
  }));
}
