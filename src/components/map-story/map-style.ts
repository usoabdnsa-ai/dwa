import type { StyleSpecification } from "maplibre-gl";

/*
 * Map of Alger on OpenFreeMap vector tiles (OpenMapTiles schema), in two palettes:
 * NIGHT for the home story, DAY for the app pages. Same layers, same city.
 * Written by hand instead of recolouring a stock style so every colour comes
 * from the contracts in .tastemaker/style-lock.md.
 */
type Palette = {
  land: string;
  sea: string;
  park: string;
  roadMinor: string;
  roadMid: string;
  roadMajor: string;
  label: string;
  halo: string;
  buildings: [string, string, string];
};

export const NIGHT: Palette = {
  land: "#0a1d22",
  sea: "#04111a",
  park: "#0c2529",
  roadMinor: "#15333a",
  roadMid: "#1d424b",
  roadMajor: "#2a5560",
  label: "#5f8a90",
  halo: "#061519",
  buildings: ["#10303a", "#1a4752", "#24606c"],
};

export const DAY: Palette = {
  land: "#e8f0f0",
  sea: "#bfd9dd",
  park: "#d6eae2",
  roadMinor: "#ffffff",
  roadMid: "#ffffff",
  roadMajor: "#f7fbfb",
  label: "#4d666c",
  halo: "#f4f8f8",
  buildings: ["#dbe6e7", "#d2dfe1", "#c8d8da"],
};

const buildStyle = (c: Palette): StyleSpecification => ({
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "land", type: "background", paint: { "background-color": c.land } },
    { id: "sea", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": c.sea } },
    {
      id: "park",
      type: "fill",
      source: "omt",
      "source-layer": "landuse",
      filter: ["in", ["get", "class"], ["literal", ["park", "cemetery", "pitch", "stadium"]]],
      paint: { "fill-color": c.park },
    },
    {
      id: "road-minor",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": c.roadMinor,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.5, 16, 5],
      },
    },
    {
      id: "road-mid",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": c.roadMid,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 10, 0.6, 16, 8],
      },
    },
    {
      id: "road-major",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": c.roadMajor,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 9, 0.8, 16, 12],
      },
    },
    {
      id: "buildings",
      type: "fill-extrusion",
      source: "omt",
      "source-layer": "building",
      minzoom: 12.5,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "render_height"], 9],
          0,
          c.buildings[0],
          30,
          c.buildings[1],
          80,
          c.buildings[2],
        ],
        "fill-extrusion-height": ["max", ["coalesce", ["get", "render_height"], 0], 7],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        // Opaque extrusions draw in one pass; translucent ones need extra blending work every frame.
        "fill-extrusion-opacity": 1,
      },
    },
    {
      id: "places",
      type: "symbol",
      source: "omt",
      "source-layer": "place",
      minzoom: 10,
      filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter", "town", "city"]]],
      layout: {
        "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 15, 13],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.18,
        "text-max-width": 8,
      },
      paint: { "text-color": c.label, "text-halo-color": c.halo, "text-halo-width": 1.2 },
    },
  ],
});

export const mapStyle = buildStyle(NIGHT);
export const dayStyle = buildStyle(DAY);
