# Original AC dragon: Promise-style forward flight

The original crimson emblem and `ac-dragon-flight-sheet.webp` remain unchanged.
`ac-dragon-toward-cycle.webp` adds six complementary forward three-quarter poses
for the same slender crimson design. The original side cycle remains in takeoff,
return and the fallback if the new angle cannot load. A short opacity blend joins
the views; this is not a replacement of the parked emblem.

## Reference comparison

The active Rainbow Promise bird renderer was executed with its actual raven
atlas to inspect its approach and retreat frames. Its camera keeps the body
nearly level while approaching, increases scale with depth, and banks only during
the distant return. The dragon's former 20-degree tangent tilt and CSS 3D card
rotation have been removed. Its flight uses the same normalized position loop,
28-second period, .04 start offset, perspective relation, light lift, retreat-only
banking and opacity. Dragon-sized art uses its own base width.

Tests execute the current `renderBirds` function from
`rainbow-promise-cinematic.js` and compare the dragon's camera state with the
reference. They check position, scale, opacity and bank over a complete loop.
They also enforce a level approach and the forward-view asset selection.

## Articulation and rendering

`ac-dragon-puppet.js` has separate skin weights for profile and forward views.
Chest lift follows the wingbeat; the neck steadies the head; feet tuck; a delayed
wave travels down the tail. The six full poses supply the main wing stroke with
opaque additive transitions. Fire follows the selected view's deformed mouth.

Each view can use a WebGL mesh with the retained atlas and up to three
premultiplied pose samples. Shader/context failure uses the articulated Canvas
mesh. Independent asset failure retains the original working side cycle. GPU
resources and listeners are released on page exit. Hidden tabs pause; reduced
motion retains the parked emblem and explicit play control.

## New angle asset provenance

Created with the built-in image generation tool from the existing AC flight
sheet and emblem, then format-converted to a 1536x1024 WebP with alpha.
No cyan accents, armor or replacement creature design were introduced.

Generation prompt:

> Use case: identity-preserve. Complementary animation artwork for the exact
> existing Asheron's Call crimson dragon in the two reference images. Preserve
> its slender serpentine body, long narrow curved neck, elongated angular snout,
> small swept-back red horns, cheek spikes, small dark eyes, layered pointed
> crimson scales, curling whip tail, four lean clawed limbs and red Gothic bat
> wings. Match the original monochrome scarlet/crimson and black fantasy game
> rendering. No cyan, glowing veins, armor, metallic robot, bulky chest or new
> monster identity. Front three-quarter view flying toward the viewer, with
> the front of the narrow chest and snout visible, slight 15-degree yaw, wings
> either side, claws tucked and tail trailing behind. Six consistent phases:
> upstroke, half opening, horizontal, downstroke, low recovery and rising.
> Equal three-column/two-row 1536x1024 atlas; each full creature inside its own
> 512x512 cell with transparent padding and consistent head/body anchors.
> Genuine alpha outside the creature; no background, aura, fire, text or grid.

## Validation limits

Native Canvas renders of the actual dragon fallback and the actual Promise
raven renderer were inspected at desktop and phone sizes. Tests cover complete
patrols, reference camera equivalence, both skin meshes, opacity, pause, reduced
motion, independent asset failures, GPU contracts and cleanup. Browser GPU
rendering is not available for visual inspection in this managed workspace.

## October 15: flight joints and facial motion

The approved Promise camera loop, crimson artwork and forward view are retained.
Four soft limb chains now give knees, ankles and claw tips distinct motions.
Occasional slower tuck/reach adjustments and different limb phases keep them
from pedalling in lockstep. Claw curl is localized at the toes, with negligible
pull on the chest, hips or wings. Additional skin vertices around the joints
support those small bends without separating the texture.

The forward atlas's eye landmarks are aligned between all six poses. This
steadies the face while the chest and wings move, and avoids two displaced eyes
in blended frames. A clipped upper eyelid closes over the tracked eye and
reopens, with occasional double blinks, restrained pupil tracking and a small
warm glint. Facial overlays use the same deformed coordinates as the skin in
both GPU and Canvas rendering. No extra eye is painted onto the old profile.
Fire now follows the stabilized forward snout. Local chest breathing and an
additional tail-curl response supplement the existing wing/body motion.

New tests isolate knee, ankle and claw effects, verify joint locality and limb
phase differences, and check eye closure, reopening and attachment in every
pose. Both skin meshes retain positive triangle areas through their motions.
Native desktop/phone renders and enlarged eye/foot samples were inspected,
including fully open, closed and reopened eyelids. No image assets changed.


## October 15: nose-first departure and anatomical claw axes

Takeoff previously kept the default right-facing profile while moving left
from the emblem. The animated body now faces its actual departure tangent
while awakening, before translation starts. Docking also uses its own travel
heading. The approved Promise patrol camera is unchanged.

The forward limb chains now follow measured positions in each head-stabilized
atlas cell, blended with the same weights as the artwork. Left and right joints
use mirrored anatomical axes, with sequential elbow/wrist rotations rather than
independent offsets. Stronger asynchronous tuck/reach, wrist counter-flex and
localized toe splay/curl make the motion visible without rotating the torso.
The Canvas fallback has more vertices at the feet. Small independent head
turns and stronger chest motion accompany the existing neck/tail response.
The tracked eye has a longer blink and clearer pupil movement; its size and
position remain attached to the original eye.

Regression tests check actual center travel against facing from the opening
moving frame on four viewport sizes, mirrored foreclaw bend directions, limb
excursion across time, all six landmark sets, and positive triangles in both
meshes with animated landmarks. Native Canvas desktop/phone flybys, opening
frames, and enlarged eyes/claws were inspected. Browser GPU visual inspection
remains unavailable; GPU draw/resource contracts are covered by tests.


## October 15: wingtip and foot follow-through

A separate delayed flex now moves the outer wing membranes during flaps and
glides. Its weights fade out before the shoulder, face and claws, with a small
left/right phase difference. Feet have a delayed vertical response to the wing
power stroke as well as their existing independent bends. Toe curl/splay is
slightly more visible; mirrored joint axes and per-pose anchors are retained.

The eyelid holds full closure for 70ms before reopening. A 20fps rendering
clock can now catch a closed eye regardless of its phase relative to the blink.
Tests exercise ten paint-clock offsets, localize wing flex away from attached
body parts, and check movement during glides. Existing path, takeoff, mesh,
loading-failure, reduced-motion and lifecycle checks remain in place. Native
Canvas eye/foot close-ups and desktop/phone flybys were inspected; browser GPU
visual review remains unavailable in this workspace. No art assets or camera
path were changed.


## October 15 evening: visible tail and active close wingbeats

The previous forward-tail weight reached its strongest point near y=470,
below the visible curl. It now bends progressively from y=340 through y=425,
using the actual tail sweep signal. The root stays attached while the visible
curl moves through a broad lateral arc, with a smaller delayed vertical curl.
The profile view also uses the shared tail signal.

Multi-second held glides are replaced by short coasts. The close approach
retains active wingbeats through those coasts on both the approaching and
retreating halves of a close pass. Proximity and approach are passed separately
so approaching/retreating state cannot freeze a nearby dragon. The full
six-pose stroke runs at
1.3 cycles per second, with a faster launch. Chest and body lift follow that
stroke more strongly. Knees, wrists and feet have larger excursions, with
broader, separately tuned skin falloff to avoid folding at overlapping limbs.
The existing crimson artwork, Promise camera loop and nose-first takeoff stay.

Validation measures opaque landmarks in the head-aligned forward atlas:
frame 1 tail curl at (192,433), foreclaws at (246,351) and (300,333).
Tests interpolate their positions through both actual rendering meshes at
phone scale while holding the source pose, so changing atlas poses or moving
the camera cannot make a false movement result. The visible curl must sweep
more than 35 screen pixels; both foreclaws must move independently. Further
checks prevent multi-second glide holds and require all six wing poses during
close flight. Native before/after renders with a held source pose show the
stronger tail bend and feet; complete desktop/phone flybys were inspected.
Both skin meshes were checked for positive triangle areas with the larger
motions. Browser GPU visual inspection remains unavailable in this workspace.


## October 15 evening: motion from the uploaded flight reference

The user supplied a 12.53-second, 1920x1080 screen recording of the linked
10-second YouTube dragon flight. Frames and a denser early-stroke sequence were
inspected locally. This is a qualitative movement study, not a motion-capture
retarget or a copy of that dragon, its rider, or its scenery. No image assets
were changed.

Observed cues applied to the existing crimson rig: a substantial, slower wing
push; a longer recovery; chest lift following the push; feet suspended below
the chest with delayed wrists; a steadier head; and trailing tail response.
The stroke now runs on one continuous 0.72Hz clock through launch and patrol.
Two Hermite time segments put the downstroke in 44% of the cycle and recovery
in 56%, sharing velocity at the join and cycle seam. Limb suspension, wrist
flex, grip, wingtip flex and tail response follow phase-delayed signals from
that clock, with restrained slower adjustments.

The normalized Promise orbit, depth growth, opacity and retreat-only banking
are retained. Its former 2.45Hz raven lift has been replaced by lift from the
dragon's own wingbeat. The controller passes the same absolute clock to the
camera and articulated body, including launch/return joins. Neck compensation
keeps the tracked eye steady while the chest rises. Additional tail rows in
both skin meshes carry movement through the actual curl instead of softening
it between distant vertices.

Regression coverage compares the retained orbit against the actual Promise
renderer after subtracting each creature's own lift. New checks cover monotone,
continuous stroke timing, phase continuity at takeoff, actual controller/camera
clock alignment, and head stabilization relative to the chest. Existing opaque
landmark displacement, pose weights, mesh connectivity, nose-first takeoff,
reduced-motion, loading-failure and lifecycle checks remain. Native before/after
held-pose motion and complete phone/desktop flybys were inspected. Browser GPU
visual inspection remains unavailable in this workspace.


## October 15 late evening: distinct joint poses instead of static fists

The user confirmed that the dragon was flying, but its body still looked
stiff. Live HTML and all three versioned animation scripts were fetched and
matched the current repository byte-for-byte. This was not a missed deployment.
The original forward atlas kept almost the same clenched claws in every pose;
local skin bends could not provide an actual finger-opening silhouette.

`ac-dragon-joints-cycle.webp` is a new sibling asset generated with the built-in
image tool using the existing forward atlas and original emblem as references.
It supplies six distinct lower-body poses: extended legs with separated talons,
bending knees, curled grips, power-stroke follow-through, wrist flex and recovery.
The tail also changes between loose C and S curves. The original image assets
remain unchanged.

At load time `composeJointAtlas` uses only clipped lower-body pixels from the
new asset, aligned at the hips and joined with a short alpha fade. The actual
rendered head, neck and wing poses still come from the original forward atlas.
Native pixel comparison across all six head-aligned cells found zero changed
channels above y=285. The composed atlas is uploaded to the same GPU renderer
or used by the Canvas fallback. Source-pose movement replaces the old overlapping
limb skin bends in this view; tail skin follow-through is restrained to supplement
the new silhouettes. Side takeoff, nose-first facing, the approved orbit, eye
tracking and reduced-motion behavior remain.

The new asset preloads with the page. Its load can complete before or after the
forward atlas; either order rebuilds the forward texture once it is available.
A missing, malformed, or failed composition retains the original articulated
forward view. Late loads refresh the texture without restarting the flight.
All three image handlers and GPU resources are released on page exit.

Validation: 25 tests passed, including actual renderer selection, late-loading
joints, independent asset failures, composition dimensions, original anchor use,
both skin meshes and cleanup. A native render of the full controller was
inspected on desktop and phone. A short fixed-camera close-up video was rendered
from that controller to make the new leg, claw and tail silhouettes reviewable.
Browser GPU visual inspection remains unavailable in this workspace.

Built-in image-generation prompt (edit target: existing forward atlas;
supporting identity reference: original crimson emblem):

> Use case: precise-object-edit / identity-preserve. Edit target: FIRST image,
> the existing six-frame crimson dragon flight atlas. Supporting identity
> reference: SECOND image original Asheron's Call crimson dragon emblem. This
> is animation artwork for the SAME existing slender crimson dragon, not a new
> dragon design. Preserve the first atlas's exact 3-column by 2-row layout,
> equal 512x512 cells in a 1536x1024 transparent atlas, same head and shoulder
> positions and six wing poses, exact long narrow curved neck, small angular
> snout, red horns, fine crimson scales, thin whip tail, Gothic bat wings,
> lighting and scarlet/black style. CHANGE ONLY THE FOUR LEGS/CLAWS BELOW THE
> HIPS AND THE TAIL BELOW THE HIPS so their animation silhouettes genuinely
> change instead of static fists and a fixed C curl. Keep face, neck, upper
> chest, wing shape, wing pose and body proportions unchanged. Six successive
> lower-body motion phases, reading left-to-right then next row: 0 forelegs
> gently extended down with clearly separated long red talons and rear feet
> trailing, tail loosely S-curved; 1 elbows bending, claws half curling, tail
> bends to the left; 2 legs tucked nearer belly, claws flexed loosely, tail tip
> crossing center; 3 power-stroke follow-through with feet hanging lower and
> fingers open, tail flowing behind to the right; 4 wrists/ankles flexing back
> and fingers beginning to close, tail curve easing back; 5 recovery with legs
> partly tucked and claws loosely flexing, tail returning toward the first S
> curve. Forelimbs and rear limbs must have distinct readable knees, ankles,
> wrists, and separated talons rather than human hands or clenched fists.
> Enough change in knee angle, leg extension, finger curl and tail curvature
> to be obvious when animated at small screen size, but anatomically plausible,
> connected limbs and consistent limb lengths. All six are the exact same
> character and scale. Keep every full wing and tail inside its own cell, with
> transparent padding. TRUE ALPHA outside dragon, no black or colored
> background, no glow, no rectangles, no grid, no labels, no rider, no armor,
> no cyan, no extra characters, no text. Do not imitate the video dragon.
> Preserve our referenced crimson dragon.
