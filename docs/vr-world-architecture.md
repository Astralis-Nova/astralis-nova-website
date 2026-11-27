# Astralis: desktop, mobile and immersive views

Research and implementation: November 26, 2026, America/Phoenix. Holodeck 031.0.

## Decision

Keep the existing responsive pages. Give a planet a scene adapter that reuses its
actual artwork, character assets and subject matter. Holodeck keeps one WebXR
session, one camera rig and one Nova while it mounts and removes these scenes.
The Astralis explorer and homepage boarding link remain the entrances. No VR
buttons were added to individual planet pages; Chess remains outside VR.

Opening a regular webpage in the Quest browser is useful, but does not turn its
layout into a walkable world. A site can provide both forms without replacing its
desktop/mobile experience.

| Method | What it produces | Astralis use |
| --- | --- | --- |
| DOM overlay or HTML rendered to a texture | A flat surface containing text and controls | Optional original-page reading view and UI |
| True panoramic photography or video | A surrounding image with a fixed capture point | Future backgrounds when an actual panoramic source exists |
| Source canvases on scene geometry | Original animation on a surface with spatial placement | Toon Planet's existing wildlife, wind and ocean layers |
| Native Three.js scene adapter | Separate objects, depth, occlusion, positional parallax and exploration | Primary world conversion approach |

A normal landscape image is not a panorama or a 3D model. Existing pictures remain
recognizable scenic artwork; they are not described as reconstructed geometry.
Bird and cricket artwork remains photographic sprites. Further model and material
work is required for photorealistic characters and environments.

## Research that affects implementation

- [W3C DOM Overlays](https://www.w3.org/TR/webxr-dom-overlays-1/)
  specifies an interactive 2D rectangle. An overlay does not infer scene depth.
- [Three.js HTMLMesh](https://threejs.org/docs/pages/HTMLMesh.html)
  draws a DOM element to a canvas used on a plane. It is useful for compatible
  interfaces, not automatic conversion of a complex webpage into a world.
- [Three.js CanvasTexture](https://threejs.org/docs/pages/CanvasTexture.html)
  provides a route for reusing the original canvas animation output.
- [W3C WebXR, frame scheduling](https://www.w3.org/TR/webxr/)
  warns that Window requestAnimationFrame callbacks may stop during immersive
  sessions, especially on standalone/mobile devices. Hidden source iframes must
  not be the independent clock for immersive animations.
- [Meta WebXR Layers](https://developers.meta.com/vr/documentation/web/webxr-layers/)
  describes sharper images/video and potential performance improvements. Layers
  remain a later optimization, with feature detection and a WebGL fallback; they
  do not supply missing scene geometry.
- [Meta performance guidance](https://developers.meta.com/vr/documentation/web/webxr-perf-bp/)
  recommends minimizing overdraw, expensive lighting and unnecessary animation
  updates. Actual Quest profiling is required to establish frame rate.

## Content mapping in 029.0

| Original page | Holodeck regions | Reused identity/content |
| --- | --- | --- |
| Toon Planet | Orbit, Cactus Forest Moonlight, Desert Burrows, Hidden Ocean | Original backgrounds and canvas animation scripts; surrounding geometry from 027.0 |
| Rainbow Promise | After the Flood, The Covenant Shore, Aboard the Ark | Original mountain landscape and timber ark artwork, raven/dove atlases; enclosed ark geometry, dark rippled water, bare banks and driftwood |
| Father's House | Garden of Welcome, Lazarus at Bethany | Original radiant garden and both Lazarus artworks; river, bridge, waterfall and stone setting |
| Wild Encounters | The Ocotillo Harvest, Jimmitty's Garden | Original field-log subjects, original Jimmitty cutout, illustrative ocotillo and enlarged leaf-carrying ant trail |

The Wild Encounters narration keeps the original uncertainty about ant species
and an underground fungus garden. Father's House retains the distinction between
an artistic reflection and a factual depiction of heaven. Original stories and
media remain accessible through Nova's optional **Original page · Reading view**.
Original desktop/mobile sound controls remain available. Their full environmental
audio has not yet been ported to these new native scenes.

Other planets, including Scripture Nexus, Faith Stories, Emerald Wisdom and
ACWorlds, still need dedicated scene adapters. They are not advertised as finished
immersive destinations. Adding them requires both a registry entry and a renderer
that uses their own content.

## Implementation contract

- `astralis-vr-worlds.js` lists available worlds, original paths, regions, aliases,
  narration, spawn positions and walkable boundaries.
- `astralis-vr-scenes.js` creates native adapters with `group`, `world`, `region`,
  `setRegion`, `update`, `canWalk` and `dispose`. It never opens a WebXR session or
  changes the page location. Native environments load on selection and dispose
  geometry, materials, textures and instance buffers when leaving.
- `holodeck.html` owns the existing session, Nova, controls and travel. Destination
  choices come from the registry. Region travel uses the selected world's region
  count. Negative thumbstick Y moves forward in every scene. The incorrect bridge-only inversion from 027.0 is removed.
- `astralis-vr-source.js` runs only in an explicitly requested, same-origin
  Holodeck source iframe. It is inert during normal desktop/mobile visits.
  Holodeck drives the original Toon scripts' animation callbacks and region
  intersection visibility. Source painting is capped near 30 Hz; canvas texture
  uploads remain near 15 Hz. The rendered world and native animations use the XR
  loop.
- `functions/_middleware.js` leaves decorative page scripts out of Holodeck and
  source iframes. Only Holodeck can request its same-origin microphone; user
  permission and browser speech-recognition support are still required.
- Text descriptions have a wrapped transcript inside Nova. Text commands cover all
  four destinations. This is local command handling and browser narration, not a
  conversational AI backend. No API key or new external AI service is introduced.

Native scenery uses instancing for repeated objects. Bird atlas texture clones
share their source, while keeping independent UV animation. The ark deck stays
stationary even while the water moves. Garden walking crosses the river at the
bridge; ark walking excludes the cabin and the deck edges.

## Validation and remaining headset checks

The regression suite exercises destination resolution, source asset existence,
spawn/boundary behavior, bridge access, frame scheduling/cancellation, observer
visibility, API restoration and the route-specific microphone policy. Release CI
also parses the inline Holodeck module before deployment.

A CPU runtime simulation using the same Three.js 0.170 release instantiated each
new region, advanced animations, checked finite geometry, exercised repeated world
travel and verified that these transitions did not end the simulated XR session.
This is not GPU rendering or a physical headset test.

The available preview browser could not create a WebGL context. Visual rendering,
shader output, controller orientation, comfort and frame rate therefore still
require a Quest test. Start with the ark deck, try next/previous region, visit the
garden bridge and Jimmitty, then return to the ship without exiting VR. Test Toon
wildlife animation in immersive mode and check for increasing memory usage after
repeated travel. Voice recognition remains browser-dependent; microphone policy
repair alone cannot guarantee it works on Quest.

## 029.0 fidelity pass

The desktop/main webpage is the visual reference. Its scene identity, composition,
source artwork, characters and media take precedence over generic environment
presets. Rainbow Promise's generic green shore and flower garden were removed;
its source scene depicts bare, eroded shores and receding water. The full ark is
visible from the initial overlook, and a separate region retains a stable deck.
Continuous roofing, ventilation gaps, structural timbers and a dark lower hull
follow the source ark. Original ark side artwork supplies shallow relief detail
on the outside view; this part is still image-based rather than a fully authored
surface reconstruction. The deck view uses the actual hull/cabin geometry.

The original mountain image is carried on estimated depth bands, preserving its
projection from the initial overlook and allowing limited positional parallax.
The depth is hand-authored, not measured or inferred by an AI model. It cannot
supply unseen surfaces. Water combines geometric waves, finer normal detail,
directional reflected light and an artistic distorted reflection using the
original ark image. These are previews requiring comparison in the headset.

[Three.js displacement mapping](https://threejs.org/docs/pages/MeshStandardMaterial.html)
explains the distinction between surface lighting detail and displaced geometry.
[glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
provides the separate mesh, material and texture data needed for full object
reconstruction. This release combines original projected art with manually rebuilt
objects. It does not claim an automatic, complete conversion of each flat image.

Toon Planet retains its original image and canvas layers. Ribbed cactus trunks,
curved arms and rounded tips now share three instanced draw batches, replacing
hundreds of separate cactus parts. The underwater foreground has moving light
patterns and bending kelp; burrow surfaces gain soil strata and grain. Regional
fog adds distance cues and is cleared when returning to the ship. The original
village and wildlife are still partly on image/canvas surfaces; fuller native
reconstruction remains work for a subsequent fidelity pass.

Space now uses the unchanged NASA VTAD Bennu and Eros GLB assets, including their
surface textures, rather than the old procedural rocks. Source details and limits
are in [NASA-SOURCES.md](../assets/deep-space/NASA-SOURCES.md). A separate volumetric
spiral turns against a fixed, varied star field. Celestial motion remains an
artistic visualization. Physical controller direction, rendering quality and Quest
frame rate still require the user's headset test.

## 030.0 dock Roadster and audit

The original red Roadster and Starman image from the homepage now floats outside
its starboard docking windows. It uses the exact `assets/starman-roadster.webp`
asset and its original aspect ratio, on a transparent sprite placed in scene
coordinates. The path stays beyond the maximum hull width and follows a gentle
three-axis drift. Nova's Docking Alcove action takes the viewer alongside it;
look starboard. It adds no floating navigation button or sign. The sprite is
original artwork, not a full 3D Tesla model; modeling its unseen sides is still
future work.

The post-change audit checks one-session travel and return, controller directions
at twelve headings, all registered native regions, NASA model/texture embedding,
scene asset URLs, source-clock cleanup, dock clearance and the versioned entrance.
Desktop/mobile pages retain their normal presentation.

Remaining fidelity work: more original scene objects, buildings and characters
need full native geometry; the projected art has limited parallax and cannot
reveal unseen surfaces. Original interactive media controls need richer VR
counterparts. Quest GPU/shader appearance, frame rate, comfort and microphone
recognition still require physical headset checks. Reliable conversational voice
still needs the secure backend described in the original mission passdown.

## 031.0 XR pose correction found during re-verification

The first direction simulation used the normal camera attached to the rig. A
closer review of Three.js r170 exposed a different XR behavior: its ArrayCamera
is detached, and world-position/quaternion getters can recompute that object's
matrix without the player's rig. Thus a correct thumbstick sign alone did not
verify motion after snap turns, room-scale movement or world travel.

The renderer now captures the canonical center-eye transform from
`XRFrame.getViewerPose(referenceSpace)` once inside the XR animation callback.
A separate view camera explicitly composes that tracking matrix with the current
rig matrix. Walking, Nova placement/following, reading views, dock/observation
travel and sprite raycasting use this same world pose. The renderer-owned XR
camera is read for projection only; its tracking matrices are never changed by
these helpers. World spawning compensates horizontal room-scale offsets while
preserving the user's actual seated or standing eye height.

`tests/vr-pose.test.mjs` uses the pinned, real Three.js 0.170 classes and a detached
ArrayCamera. It checks twelve rig headings, pose ownership, missing tracking,
room-scale spawn offsets and desktop behavior. `scripts/check-vr-runtime.mjs`
now commits the CPU integration audit to the repository: it parses the actual
NASA geometry, uses a separate XR camera and center-eye tracking frame, exercises
all native regions and travel, and checks forward/backward movement, snap-turn
eye stability and Nova's menu position. Texture pixels, shaders and actual Quest
performance are still outside this CPU audit.

The new development dependency matches the already pinned CDN renderer version.
CI installs it only for regression checks and removes `node_modules` before the
static deployment upload.
