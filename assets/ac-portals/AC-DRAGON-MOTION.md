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
