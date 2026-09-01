const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'ac-worlds.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'ac-adventure.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
for (const id of ['quests','questSearch','questServer','questType','questResults','questCount','databaseSearch','databaseTarget','itemReferences','sourceQuery','directory','worldGrid','search','sort','emulator','refresh','decal-plugins','pluginSearch','pluginSelect','pluginDetails','pluginCatalog','pluginCatalogLink','new-player','downloads','backgroundChoice','backgroundGallery','resetBackground','portalSpaceImage','portalSpaceToggle','about']) {
  assert(ids.includes(id), 'Missing existing control: ' + id);
}
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.includes(match[1]), 'Broken in-page link: ' + match[1]);
}
for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:\?[^"#]*)?"/g)) {
  if (/\.(css|js|webp|jpg|png|ttf)$/.test(match[1])) {
    assert(fs.existsSync(path.join(root, match[1])), 'Missing local asset: ' + match[1]);
  }
}
const cards = [...html.matchAll(/class="adventure-path" href="#([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(cards, ['quests', 'directory', 'decal-plugins', 'new-player']);
assert(html.indexOf('id="quests"') < html.indexOf('id="directory"'));
assert(html.indexOf('id="directory"') < html.indexOf('id="new-player"'));
assert(html.includes('<details class="lore-fold install-walkthrough">'));
assert(html.includes('<details class="source-console source-archives">'));
assert(html.includes('<details class="lore-fold" id="about">'));
assert(html.includes('mask-image:radial-gradient'), 'Keep the blended portal');
assert(html.includes("font-family:'UnifrakturMaguntia'"), 'Keep the Old English title');
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes(':focus-visible'));
assert(css.includes('@media(max-width:440px)'));
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  new vm.Script(match[1]);
}
for (const file of ['ac-portal-space.js', 'ac-background-gallery.js']) {
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'));
}
console.log('PASS: navigation, existing control IDs, local assets, section order, folds, scripts, and accessibility hooks');
