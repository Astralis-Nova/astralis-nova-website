# Original AC dragon: depth flight update

The existing crimson emblem and six-pose `ac-dragon-flight-sheet.webp` remain
unchanged. No replacement creature or additional sprite sheet is used.

`ac-dragon-rig.js` supplies a continuous depth route with two close approaches
per patrol. Perspective changes its apparent size by more than 2.5 times, then
returns it to the original emblem. Positions and sizes stay within the viewport,
including narrow phones and landscape screens. Banking and foreshortening support
turns without the former zero-width mirror collapse.

The renderer interpolates all six existing full-body poses using additive
premultiplied colors, keeping the torso opaque between wing strokes. Common mouth
anchors stabilize the head. Power strokes alternate with short glides; continuous
neck compensation, chest breathing, body heave and delayed tail flex supplement
the original poses. A restrained warm sheen is clipped to the original artwork.
The original fire remains, emitted from the stabilized mouth anchor with bounded
particles. The artwork redraws at 30 fps while flight transforms remain smooth.

Pause and hidden-tab behavior preserve elapsed animation time. Reduced motion
parks the original emblem; explicit playback remains available. Page exit cancels
animation, clears particles and removes listeners. Asset failure retains the
original static emblem. Tests cover the full cycle, opacity, two close passes,
viewport bounds, route continuity, pause, reduced motion, failure and cleanup.

Validation uses Node VM controller tests and native Canvas renders of the actual
renderer at desktop and phone sizes. Browser automation is unavailable in the
managed workspace; these are renderer and behavior checks, not browser screenshots.
