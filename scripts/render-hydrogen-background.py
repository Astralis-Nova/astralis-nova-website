"""Render a hydrogen 1s probability-density slice, not a photograph.

psi_1s = exp(-r/a0) / sqrt(pi * a0**3).
This central plane plots density relative to its maximum, exp(-2*r/a0),
on a logarithmic color scale from 1e-5 to 1. The nucleus is unresolved.
Coordinates are measured in Bohr radii (a0); no physical glow is implied.
Reference: MIT 8.04 (Spring 2016), problem set 4, problem 4(b).
"""
from pathlib import Path
import numpy as np
from matplotlib.colors import LinearSegmentedColormap, LogNorm
from PIL import Image

out = Path(__file__).resolve().parents[1] / 'assets/our-new-star/scales-atoms.webp'
x = np.linspace(-7.8, 4.2, 1600)
z = np.linspace(-3.75, 3.75, 1000)
r = np.hypot(x[None, :], z[:, None])
density = np.exp(-2 * r)
palette = LinearSegmentedColormap.from_list('probability', [
    '#020610', '#08142b', '#122d50', '#135880', '#309db2', '#a6e0e6', '#f5fcff'
])
colors = palette(LogNorm(vmin=1e-5, vmax=1, clip=True)(density))
image = Image.fromarray(np.round(colors[:, :, :3] * 255).astype('uint8'), 'RGB')
image.save(out, 'WEBP', quality=94, method=6)
print(out.name, image.size, out.stat().st_size)
