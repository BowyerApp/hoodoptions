/**
 * Renders official brand assets (X avatar + banner) from the canonical
 * LogoMark geometry. Same engine as the site's OG card, same fonts,
 * same palette — run `node scripts/brand-assets.mjs` after brand changes.
 */
import { ImageResponse } from "next/og.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createElement as h } from "react";

const BG = "#090a0d";
const TEXT = "#f1f3f5";
const MUTED = "rgba(221, 226, 234, 0.54)";
const COPPER = "#a98a5b";

const MARK_PRIMARY = "M3 5H13V8H3V5ZM3 12.5H16V15.5H3V12.5ZM3 20H11V23H3V20Z";
const MARK_SECONDARY =
  "M16 5H25V8H16V5ZM13 12.5H25V15.5H13V12.5ZM18 20H25V23H18V20Z";

// Same deterministic walk as HeroVisual.tsx
const WALK = [
  186, 182, 184, 177, 179, 172, 175, 167, 170, 161, 165, 156, 160, 151, 155,
  158, 148, 142, 146, 137, 141, 131, 136, 126, 131, 121, 126, 115, 120, 109,
  114, 103, 108, 97, 102, 91, 96, 84, 89, 77, 82, 70, 75, 63, 68, 56, 61, 49,
];
const CW = 640;
const CH = 240;

// Banner stretches the chart wide, so use every other point for a calmer line.
const SMOOTH = WALK.filter((_, i) => i % 2 === 0 || i === WALK.length - 1);
const STEP = CW / (SMOOTH.length - 1);
const linePath = SMOOTH.map(
  (y, i) => `${i === 0 ? "M" : "L"}${(i * STEP).toFixed(1)},${y}`
).join(" ");
const areaPath = `${linePath} L${CW},${CH} L0,${CH} Z`;
const endY = SMOOTH[SMOOTH.length - 1];

const font = (file) =>
  readFile(new URL(`../node_modules/${file}`, import.meta.url));

const fonts = [
  {
    name: "Manrope",
    data: await font("@fontsource/manrope/files/manrope-latin-500-normal.woff"),
    weight: 500,
    style: "normal",
  },
  {
    name: "Manrope",
    data: await font("@fontsource/manrope/files/manrope-latin-800-normal.woff"),
    weight: 800,
    style: "normal",
  },
  {
    name: "IBM Plex Mono",
    data: await font(
      "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff"
    ),
    weight: 500,
    style: "normal",
  },
];

function mark(size, color = TEXT) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 28 28", fill: "none" },
    h("path", { d: MARK_PRIMARY, fill: color }),
    h("path", { d: MARK_SECONDARY, fill: color, fillOpacity: 0.42 })
  );
}

function chart(width, height) {
  return h(
    "svg",
    { width, height, viewBox: `0 0 ${CW} ${CH}`, fill: "none" },
    h("path", { d: areaPath, fill: COPPER, fillOpacity: 0.06 }),
    h("path", {
      d: linePath,
      stroke: COPPER,
      strokeOpacity: 0.8,
      strokeWidth: 2,
    }),
    h("line", {
      x1: 0,
      x2: CW,
      y1: endY,
      y2: endY,
      stroke: COPPER,
      strokeOpacity: 0.22,
      strokeWidth: 1,
      strokeDasharray: "3 6",
    }),
    h("circle", { cx: CW - 6, cy: endY, r: 5, fill: COPPER })
  );
}

async function save(response, path) {
  const buf = Buffer.from(await response.arrayBuffer());
  await writeFile(path, buf);
  console.log(`wrote ${path} (${(buf.length / 1024).toFixed(0)} KB)`);
}

await mkdir("public/brand", { recursive: true });

// ---- X avatar: mark centered, circle-crop safe -------------------------
await save(
  new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
        },
      },
      mark(1060)
    ),
    { width: 2000, height: 2000, fonts }
  ),
  "public/brand/logo.png"
);

// ---- Transparent mark for placements on other surfaces -----------------
await save(
  new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      mark(1600)
    ),
    { width: 2000, height: 2000, fonts }
  ),
  "public/brand/logo-transparent.png"
);

// ---- X banner 1500x500 --------------------------------------------------
const hairlines = Array.from({ length: 9 }).map((_, i) =>
  h("div", {
    key: `v${i}`,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 120 + i * 160,
      width: 1,
      backgroundColor: "rgba(241, 243, 245, 0.03)",
    },
  })
);

await save(
  new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: BG,
          fontFamily: "Manrope",
        },
      },
      ...hairlines,
      h(
        "div",
        {
          style: {
            position: "absolute",
            right: 0,
            top: 96,
            display: "flex",
          },
        },
        chart(760, 285)
      ),
      // fade the chart's left edge so the lockup zone stays clean
      h("div", {
        style: {
          position: "absolute",
          left: 720,
          top: 0,
          bottom: 0,
          width: 320,
          background: `linear-gradient(to right, ${BG}, rgba(9, 10, 13, 0))`,
        },
      }),
      h(
        "div",
        {
          style: {
            position: "absolute",
            left: 130,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center" } },
          mark(72),
          h(
            "div",
            {
              style: {
                marginLeft: 28,
                fontSize: 58,
                fontWeight: 800,
                letterSpacing: "0.13em",
                color: TEXT,
              },
            },
            "HOODOPTIONS"
          )
        ),
        h(
          "div",
          {
            style: {
              marginTop: 24,
              fontSize: 25,
              fontWeight: 500,
              color: MUTED,
            },
          },
          "Liquidation-free options on Robinhood stock tokens."
        ),
        h(
          "div",
          {
            style: {
              marginTop: 26,
              fontFamily: "IBM Plex Mono",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.24em",
              color: COPPER,
            },
          },
          "MAX LOSS = PREMIUM · USDG SETTLED · ROBINHOOD CHAIN"
        )
      ),
      h(
        "div",
        {
          style: {
            position: "absolute",
            right: 56,
            bottom: 36,
            fontFamily: "IBM Plex Mono",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.14em",
            color: "rgba(241, 243, 245, 0.45)",
          },
        },
        "HOODOPTIONS.XYZ"
      )
    ),
    { width: 1500, height: 500, fonts }
  ),
  "public/brand/banner.png"
);

console.log("done");
