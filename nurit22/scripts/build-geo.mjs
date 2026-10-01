// One-off: builds dotted land grids from Natural Earth (world-atlas, public domain) → src/geo/land.json
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { root } from "./common.mjs";

const require = createRequire(import.meta.url);
const topo = require("world-atlas/land-50m.json");
const land = feature(topo, topo.objects.land);
const polys = land.features.flatMap((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates));

const inRing = (x, y, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
// bounding boxes for speed
const boxes = polys.map((p) => {
  const xs = p[0].map((c) => c[0]);
  const ys = p[0].map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
});
const isLand = (lon, lat) =>
  polys.some((p, i) => {
    const b = boxes[i];
    if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) return false;
    return inRing(lon, lat, p[0]) && !p.slice(1).some((h) => inRing(lon, lat, h));
  });

const grid = (step, equalArea) => {
  const out = [];
  for (let lat = 83; lat >= -57; lat -= step) {
    const lonStep = equalArea ? step / Math.max(0.2, Math.cos((lat * Math.PI) / 180)) : step;
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (isLand(lon, lat)) out.push(+lon.toFixed(2), +lat.toFixed(2));
    }
  }
  return out;
};

const dots3d = grid(0.75, true);
const dots2d = grid(1.6, false);
fs.writeFileSync(path.join(root, "src/geo/land.json"), JSON.stringify({ dots3d, dots2d }));
console.log(`3d dots: ${dots3d.length / 2}, 2d dots: ${dots2d.length / 2}`);
