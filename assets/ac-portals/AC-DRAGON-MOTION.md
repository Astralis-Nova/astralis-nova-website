# Original AC dragon: articulated flight

The existing crimson emblem and six-pose `ac-dragon-flight-sheet.webp` remain
unchanged. No replacement creature or additional sprite sheet is used.

## Camera approach

The depth orbit now follows the Rainbow Promise birds' accelerating perspective
relation: the dragon travels from depth 19 to about 1, with one sustained side-forward pass per
patrol. Its apparent width grows roughly tenfold as it approaches the viewer,
then recedes continuously. Near passes centre the creature in world space and
may briefly crop outer wings; they no longer shrink and slide the whole flight
into an inset bounding box. A restrained atmospheric fade reinforces distance. The lateral route now follows
the Promise birds' actual control points: distant left entry, diagonal approach,
rightward close pass and distant return. All near flight continues nose-first;
direction reversal occurs only after the dragon has receded. Body pitch follows
the projected flight tangent instead of remaining level during the diagonal pass.

## Articulation

`ac-dragon-puppet.js` replaces the former full-column bend and whole-image
breathing scale. A continuous skin mesh gives the chest, neck, feet, tail and
wrists separate motion. Chest lift follows the wingbeat; neck compensation
steadies the head; the legs tuck; a delayed wave travels down the tail. The
original six poses still supply the main wing stroke, with opaque additive
transitions and a spread-wing glide. Turning foreshortening is restrained so the
creature does not visibly squash like a rotating card. Fire follows the deformed
mouth and retains its bounded particle count.

A WebGL mesh handles skinning in one indexed draw when supported. It uses the
original atlas and at most three premultiplied pose samples. Shader/context failure
uses an articulated Canvas triangle mesh. Artwork refreshes at up to 40 fps with
GPU skinning and 20 fps for the Canvas fallback; flight transforms remain smooth.
GPU resources and event listeners are released on page exit. Hidden tabs pause;
reduced motion retains the parked original emblem and explicit play control.

## Validation

Node tests cover complete patrols, depth growth and continuous return, independent
joints, positive mesh triangle areas, pose opacity, pause, reduced motion, asset
failure, GPU draw/resource contracts, context loss and cleanup. Native Canvas
renders of the actual fallback were inspected at 1440x900 and 390x844, including
close passes and a wing/body cycle. Browser automation is unavailable in the
managed workspace; browser GPU rendering was not visually inspected here.
