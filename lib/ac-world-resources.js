// Supplemental links belong only to the named world. Never infer a server
// affiliation from a shared Discord, emulator, or a similar world name.
// Sources reviewed 2026-09-01; this is not a live availability check.
const extras = {
  conquest: [
    { label: 'Custom-content wiki', url: 'https://conquestac.fandom.com/wiki/Conquest_Custom_Content', source: 'Existing Conquest catalog' },
    { label: 'New player guide', url: 'https://conquestac.fandom.com/wiki/New_Player_Guide', source: 'Existing Conquest catalog' }
  ],
  dragonmoon: [
    { label: 'World wiki', url: 'https://dragonmoonac.com/index.php/Main_Page', source: 'DragonMoon wiki' }
  ],
  infiniteleaftide: [
    { label: 'World wiki & guides', url: 'https://www.leaftidewiki.com/', source: 'Infinite Leaftide Community Wiki' }
  ]
};

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

function websiteLabel(url) {
  const host = new URL(url).hostname.toLowerCase();
  if (['discord.gg', 'discord.com', 'dsc.gg'].includes(host)) return 'Community link';
  if (host === 'gdleac.com' || host === 'www.gdleac.com') return 'GDLE website';
  if (/wiki|fandom/.test(host)) return 'World wiki';
  if (host.startsWith('forum.')) return 'World forum';
  return 'Website';
}

export function worldResources(server) {
  const resources = [], seen = new Set();
  const add = resource => {
    const url = safeResourceUrl(resource.url);
    if (!url) return;
    const identity = url.replace(/\/$/, '');
    if (seen.has(identity)) return;
    seen.add(identity);
    resources.push({ ...resource, url });
  };
  add({ label: 'Discord', url: server.discord || server.discord_url, source: 'Community server directory' });
  const website = safeResourceUrl(server.website || server.website_url);
  if (website) add({ label: websiteLabel(website), url: website, source: 'Community server directory' });
  const name = String(server.name || '').trim().toLowerCase();
  for (const resource of Object.hasOwn(extras, name) ? extras[name] : []) add(resource);
  return resources;
}
