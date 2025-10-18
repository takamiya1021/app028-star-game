#!/usr/bin/env node
/**
 * Hipparcos main catalogue -> stars.json converter
 *
 * - Filters stars with Johnson V magnitude <= 8.0
 * - Extracts essential fields (HIP id, position, magnitude, spectral type)
 * - Computes approximate RGB colour from B-V index (or spectral type fallback)
 * - Derives distance in light years from parallax when available
 *
 * Source data: ESA Hipparcos main catalogue (I/239/hip_main.dat)
 */

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const MAGNITUDE_LIMIT = 8.0;
const INPUT_PATH = path.join(process.cwd(), "data", "raw", "hip_main.dat");
const OUTPUT_PATH = path.join(process.cwd(), "public", "data", "stars.json");

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`Hipparcos catalogue not found at ${INPUT_PATH}`);
  process.exit(1);
}

const stats = {
  total: 0,
  withoutMagnitude: 0,
  faintRejected: 0,
  written: 0,
  withoutColor: 0,
  withoutParallax: 0,
};

/** Clamp helper */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Convert Johnson B-V colour index to linear RGB (gamma-corrected) and hex.
 * Implementation based on the widely used approximation from
 * http://www.vendian.org/mncharity/dir3/starcolor/ (Mncharity, 2001).
 */
function bvToHex(bv) {
  const bMinusV = clamp(bv, -0.4, 2.0);
  let r = 0;
  let g = 0;
  let b = 0;

  if (bMinusV < 0.0) {
    const t = (bMinusV + 0.40) / 0.40;
    r = 0.61 + 0.11 * t + 0.1 * t * t;
    g = 0.70 + 0.07 * t + 0.1 * t * t;
    b = 1.00;
  } else if (bMinusV < 0.40) {
    const t = (bMinusV - 0.0) / 0.40;
    r = 0.83 + 0.17 * t;
    g = 0.87 + 0.11 * t;
    b = 1.00;
  } else if (bMinusV < 1.50) {
    const t = (bMinusV - 0.40) / 1.10;
    r = 1.00;
    g = 0.98 - 0.16 * t;
    b = 1.00 - 0.47 * t + 0.1 * t * t;
  } else {
    const t = (bMinusV - 1.50) / 0.50;
    r = 1.00;
    g = 0.82 - 0.5 * t * t;
    b = 0.63 - 0.6 * t * t;
  }

  // Gamma correction to approximate monitor response
  const gamma = 0.8;
  r = Math.pow(clamp(r, 0, 1), gamma);
  g = Math.pow(clamp(g, 0, 1), gamma);
  b = Math.pow(clamp(b, 0, 1), gamma);

  const toHex = (channel) =>
    channel.toString(16).padStart(2, "0");

  return `#${toHex(Math.round(r * 255))}${toHex(Math.round(g * 255))}${toHex(
    Math.round(b * 255)
  )}`;
}

const spectralAnchors = [
  { class: "O", bv: -0.33 },
  { class: "B", bv: -0.17 },
  { class: "A", bv: 0.00 },
  { class: "F", bv: 0.30 },
  { class: "G", bv: 0.58 },
  { class: "K", bv: 0.81 },
  { class: "M", bv: 1.40 },
];

function spectralTypeToApproxBv(spectralType) {
  if (!spectralType) return null;
  const match = spectralType.match(/([OBAFGKM])\s*([0-9]?)/i);
  if (!match) return null;
  const cls = match[1].toUpperCase();
  const subclassStr = match[2];
  const anchorIndex = spectralAnchors.findIndex((entry) => entry.class === cls);
  if (anchorIndex === -1) return null;
  const anchor = spectralAnchors[anchorIndex];
  let nextAnchor = spectralAnchors[Math.min(anchorIndex + 1, spectralAnchors.length - 1)];
  if (anchor.class === "M") {
    nextAnchor = anchor;
  }

  const subclass = subclassStr ? Number(subclassStr) : 5;
  const fraction = clamp(subclass / 10, 0, 1);
  return anchor.bv + (nextAnchor.bv - anchor.bv) * fraction;
}

function buildStarRecord(line) {
  const hip = Number.parseInt(line.slice(8, 14), 10);
  const vmagStr = line.slice(41, 46).trim();
  if (!vmagStr) {
    stats.withoutMagnitude += 1;
    return null;
  }
  const magnitude = Number.parseFloat(vmagStr);
  if (Number.isNaN(magnitude)) {
    stats.withoutMagnitude += 1;
    return null;
  }
  if (magnitude > MAGNITUDE_LIMIT) {
    stats.faintRejected += 1;
    return null;
  }

  const ra = Number.parseFloat(line.slice(51, 63));
  const dec = Number.parseFloat(line.slice(64, 76));
  const parallaxMas = Number.parseFloat(line.slice(79, 86));
  let distance = null;
  if (!Number.isNaN(parallaxMas) && parallaxMas > 0) {
    const parsec = 1000 / parallaxMas;
    distance = Number.parseFloat((parsec * 3.26156).toFixed(2));
  } else {
    stats.withoutParallax += 1;
  }

  const bvStr = line.slice(245, 251).trim();
  const spectralType = line.slice(435, 447).trim() || undefined;

  let colorHex;
  if (bvStr) {
    const bv = Number.parseFloat(bvStr);
    if (!Number.isNaN(bv)) {
      colorHex = bvToHex(bv);
    }
  }
  if (!colorHex && spectralType) {
    const approxBv = spectralTypeToApproxBv(spectralType);
    if (approxBv !== null) {
      colorHex = bvToHex(approxBv);
    }
  }
  if (!colorHex) {
    stats.withoutColor += 1;
    colorHex = "#ffffff";
  }

  const record = {
    id: hip,
    ra,
    dec,
    magnitude: Number.parseFloat(magnitude.toFixed(2)),
    color: colorHex,
  };

  if (spectralType) {
    record.spectralType = spectralType;
  }
  if (distance !== null) {
    record.distance = distance;
  }

  return record;
}

async function main() {
  const stars = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT_PATH, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    stats.total += 1;
    const record = buildStarRecord(line);
    if (record) {
      stars.push(record);
    }
  }

  stars.sort((a, b) => a.magnitude - b.magnitude || a.id - b.id);

  const json = JSON.stringify(stars, null, 2);
  fs.writeFileSync(OUTPUT_PATH, json);
  stats.written = stars.length;

  console.log(`Hipparcos records processed : ${stats.total}`);
  console.log(`Missing magnitude records  : ${stats.withoutMagnitude}`);
  console.log(`Rejected by magnitude (>${MAGNITUDE_LIMIT}) : ${stats.faintRejected}`);
  console.log(`Records written            : ${stats.written}`);
  console.log(`Records without parallax   : ${stats.withoutParallax}`);
  console.log(`Colour fallbacks used      : ${stats.withoutColor}`);
  console.log(`Output file                : ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Failed to generate stars dataset:", error);
  process.exit(1);
});
