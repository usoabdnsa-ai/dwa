import type { StyleSpecification } from "maplibre-gl";

/*
 * Night map of Alger on OpenFreeMap vector tiles (OpenMapTiles schema).
 * Written by hand instead of recolouring a stock style so every colour comes
 * from the "night" contract in .tastemaker/style-lock.md.
 */
export const NIGHT = {
  land: "#0a1d22",
  sea: "#04111a",
  park: "#0c2529",
  roadMinor: "#15333a",
  roadMid: "#1d424b",
  roadMajor: "#2a5560",
  label: "#5f8a90",
  halo: "#061519",
};

export const mapStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "land", type: "background", paint: { "background-color": NIGHT.land } },
    { id: "sea", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": NIGHT.sea } },
    {
      id: "park",
      type: "fill",
      source: "omt",
      "source-layer": "landuse",
      filter: ["in", ["get", "class"], ["literal", ["park", "cemetery", "pitch", "stadium"]]],
      paint: { "fill-color": NIGHT.park },
    },
    {
      id: "road-minor",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": NIGHT.roadMinor,
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
        "line-color": NIGHT.roadMid,
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
        "line-color": NIGHT.roadMajor,
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
          "#10303a",
          30,
          "#1a4752",
          80,
          "#24606c",
        ],
        "fill-extrusion-height": ["max", ["coalesce", ["get", "render_height"], 0], 7],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.92,
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
      paint: { "text-color": NIGHT.label, "text-halo-color": NIGHT.halo, "text-halo-width": 1.2 },
    },
  ],
};
