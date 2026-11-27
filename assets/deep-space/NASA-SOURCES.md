# Asteroids and stellar scenery · Holodeck 029.0

## Original asteroid assets

These NASA downloads are stored unchanged, including their embedded texture
images. Holodeck normalizes their scale and instantiates the geometry; it does
not replace them with procedurally deformed spheres.

| Asset | Source | Credit | Geometry |
| --- | --- | --- | --- |
| `nasa-bennu.glb` | [NASA Bennu 3D model](https://science.nasa.gov/resource/bennu-3d-model/) · [original GLB](https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/b/Bennu_1_1.glb) | NASA Visualization Technology Applications and Development (VTAD) | 1,419 vertices; 2,692 triangles |
| `nasa-eros.glb` | [NASA Eros 3D model](https://science.nasa.gov/resource/eros-3d-model/) · [original GLB](https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/e/Eros_1_10.glb) | NASA Visualization Technology Applications and Development (VTAD) | 839 vertices; 1,536 triangles |

The Bennu asset includes its color texture. Eros includes color and normal maps.
The rendered material uses zero metalness and high roughness. Ambient illumination
is restrained on these objects to preserve the directional shading and silhouette.
The original downloaded files are about 0.86 MB and 2.39 MB respectively, with all
geometry and images embedded, so the browser needs no third-party texture URLs.
The field uses 28 Bennu and 20 Eros instances in two draw batches. The two objects
retain their source shapes; repetition, scale, placement and motion are artistic.

For additional scientific background and higher-resolution data, see NASA SVS:
[Asteroid Bennu 3D Models](https://svs.gsfc.nasa.gov/5069/). Those much larger OLA
models are not the assets shipped in this release. Do not label the VTAD assets
as those high-resolution OLA datasets.

## Galaxy and stars

[NASA's Hubble description of M51](https://science.nasa.gov/asset/hubble/out-of-this-whirl-the-whirlpool-galaxy-m51-and-companion-galaxy/)
informs the warmer central stellar population, cooler arm clusters and spiral
structure. The visible galaxy is a procedural, dimensional artistic visualization,
not a reconstruction of M51 or a measured star catalogue. Its rotation is
deliberately accelerated for the experience.

The surrounding star field has different sizes, brightness and restrained stellar
colors. Point sprites have a round luminous center and soft edges. Distant stars
remain fixed while the separate galaxy turns, preserving a stable VR reference.
There is no atmospheric-style blinking or forced rotation of the viewer's sky.

## Movement reference

[W3C Gamepad API](https://www.w3.org/TR/gamepad/) defines negative up/forward and
positive down/backward. The previous bridge-only inversion was wrong for the
reported controller behavior. All worlds now use the same negative-Y forward
mapping, with locomotion tests across twelve headings and a bridge runtime check.
