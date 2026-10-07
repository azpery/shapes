// How each body looks up close, drawn by BodyPainter. Bodies not listed are cratered rocks (or stars, for
// bodies orbiting nothing).
// - type: "star", "comet", "blackHole", or planet when omitted
// - day: spin period in hours (negative: spins backwards), base: surface colour
// - bands: { count, colors, alpha } latitude bands
// - layers: surface features, each either { spots: [{ lat, lon (degrees), size (fraction of the radius),
//   stretch, color, alpha }] } or generated { count, colors, size: [min, max], stretch, latitude (max),
//   alpha, clusters / spread (groups of blobs, e.g. continents), angle (random tilt), spin (relative speed) }
// - caps: polar caps { color, north, south }, atmosphere: halo colour
// - rings: { tilt (degrees), squash, bands: [[inner, outer (radii), color]] }

const craters = (count, color, alpha = 0.45) => ({
  count, colors: [color], size: [0.04, 0.16], latitude: 80, alpha,
});

const BODY_APPEARANCES = {
  "Sun": {
    type: "star", day: 609,
    layers: [{ count: 7, colors: ["#8D3B00", "#A64B00"], size: [0.03, 0.07], latitude: 35, alpha: 0.7 }],
  },
  "Alpha Centauri B": { type: "star" },
  "Proxima Centauri": { type: "star" },
  "Sirius B": { type: "star" },
  "Sagittarius A*": { type: "blackHole" },

  "Halley's Comet": { type: "comet" },
  "Comet Encke": { type: "comet" },
  "Comet Swift–Tuttle": { type: "comet" },
  "Comet Hale–Bopp": { type: "comet" },

  "Mercury": { day: 1408, base: "#9E9E9E", layers: [craters(30, "#6E6E6E")] },
  "Venus": {
    day: -5832, base: "#E8C88A", atmosphere: "#FFE0B2",
    bands: { count: 9, colors: ["#E8C88A", "#F1D9A6", "#D9B26F"], alpha: 0.6 },
    layers: [{ count: 14, colors: ["#F6E3B8"], size: [0.1, 0.3], stretch: 3, latitude: 60, alpha: 0.35 }],
  },
  "Earth": {
    day: 24, base: "#1A4F9C", atmosphere: "#64B5F6",
    layers: [
      // Continents
      { count: 7, clusters: 8, spread: 0.3, colors: ["#3E8E41", "#5B8C2A", "#8D6E63", "#C8B273"], size: [0.08, 0.18], latitude: 60 },
      // Clouds, drifting a bit faster than the ground
      { count: 26, colors: ["#FFFFFF"], size: [0.06, 0.16], stretch: [1.5, 3.5], latitude: 75, alpha: 0.6, spin: 1.15 },
    ],
    caps: { color: "#F5F9FF", north: 0.22, south: 0.3 },
  },
  "Moon": {
    day: 655, base: "#BDBDBD",
    layers: [
      { count: 6, colors: ["#757575"], size: [0.15, 0.3], latitude: 50, alpha: 0.6 },
      craters(25, "#8A8A8A"),
    ],
  },
  "Mars": {
    day: 24.6, base: "#C1440E", atmosphere: "#FFAB91",
    layers: [
      { count: 14, colors: ["#7B3F1E", "#8E4A26"], size: [0.1, 0.25], stretch: [1, 2], latitude: 55, alpha: 0.7 },
      { count: 10, colors: ["#E07B49"], size: [0.08, 0.2], latitude: 60, alpha: 0.5 },
      craters(12, "#8E3A12", 0.3),
    ],
    caps: { color: "#F5F5F5", north: 0.15, south: 0.12 },
  },

  "Ceres": {
    base: "#8A8A8A",
    layers: [
      craters(15, "#6E6E6E"),
      // Bright salt deposits of the Occator crater
      { spots: [{ lat: 20, lon: 0, size: 0.06, color: "#FFFFFF" }, { lat: 22, lon: 6, size: 0.03, color: "#FFFFFF" }] },
    ],
  },
  "Vesta": { base: "#A89F94", layers: [craters(12, "#7D756C")], caps: { color: "#7D756C", south: 0.4 } },

  "Jupiter": {
    day: 9.9, base: "#D9B88F",
    bands: { count: 14, colors: ["#F1E3C8", "#C49A6C", "#E8D3B0", "#A8754C", "#F3E9D2", "#B98A5E"] },
    layers: [
      { spots: [{ lat: -22, lon: 0, size: 0.16, stretch: 1.6, color: "#C1583A", alpha: 0.9 }] }, // Great Red Spot
      { count: 18, colors: ["#FFFFFF", "#8D5B3A"], size: [0.03, 0.07], stretch: [2, 4], latitude: 60, alpha: 0.4 },
    ],
  },
  "Io": {
    day: 42.5, base: "#E8D44D",
    layers: [{ count: 20, colors: ["#C0582B", "#3E2F1C", "#F5F0C8", "#D98C2B"], size: [0.04, 0.12], latitude: 70, alpha: 0.85 }],
  },
  "Europa": {
    day: 85, base: "#EDE6D6",
    // Cracks in the ice
    layers: [{ count: 25, colors: ["#A0522D", "#B97A56"], size: [0.015, 0.03], stretch: [8, 16], angle: true, latitude: 70, alpha: 0.6 }],
  },
  "Ganymede": {
    day: 172, base: "#9E8E7E",
    layers: [{ count: 10, colors: ["#C8BBAA"], size: [0.12, 0.3], latitude: 60, alpha: 0.6 }, craters(15, "#6D5F52")],
  },
  "Callisto": {
    day: 400, base: "#5D4E42",
    layers: [{ count: 40, colors: ["#D7CCC8"], size: [0.02, 0.06], latitude: 80, alpha: 0.7 }],
  },

  "Saturn": {
    day: 10.7, base: "#E3CC8F",
    bands: { count: 12, colors: ["#F2E6C4", "#D8C08A", "#EAD9A8", "#CDB27A"] },
    rings: {
      tilt: -12, squash: 0.32,
      bands: [
        [1.25, 1.52, "rgba(190, 170, 130, 0.35)"],
        [1.53, 1.95, "rgba(232, 214, 170, 0.85)"],
        // Cassini division between them
        [2.0, 2.25, "rgba(215, 195, 150, 0.65)"],
      ],
    },
  },
  "Enceladus": {
    base: "#FAFAFA",
    // Tiger stripes near the south pole
    layers: [{ spots: [-30, -10, 10, 30].map((lon) => ({ lat: -70, lon, size: 0.03, stretch: 6, color: "#81D4FA", alpha: 0.8 })) }],
  },
  "Titan": {
    day: 382, base: "#E0A64B", atmosphere: "#F4C27A",
    bands: { count: 5, colors: ["#E0A64B", "#D19440", "#E8B460"], alpha: 0.5 },
  },
  "Iapetus": {
    base: "#E0E0E0",
    // One dark and one bright hemisphere
    layers: [{ spots: [{ lat: 0, lon: 0, size: 0.7, color: "#3E2723", alpha: 0.85 }] }, craters(10, "#9E9E9E")],
  },

  "Uranus": {
    day: -17.2, base: "#9FE3EA", atmosphere: "#B2EBF2",
    bands: { count: 6, colors: ["#9FE3EA", "#B5EEF2", "#8CD5DE"], alpha: 0.5 },
    // Uranus is tipped on its side, so are its thin rings
    rings: { tilt: 82, squash: 0.25, bands: [[1.6, 1.65, "rgba(200, 230, 240, 0.35)"], [1.9, 1.98, "rgba(220, 240, 250, 0.5)"]] },
  },

  "Neptune": {
    day: 16.1, base: "#3E5FD8", atmosphere: "#82B1FF",
    bands: { count: 8, colors: ["#3E5FD8", "#5577E8", "#2F4CB8"], alpha: 0.6 },
    layers: [
      {
        spots: [
          { lat: -20, lon: 0, size: 0.14, stretch: 1.7, color: "#1F2F7A", alpha: 0.9 }, // Great Dark Spot
          { lat: -28, lon: 12, size: 0.05, stretch: 3, color: "#E3F2FD", alpha: 0.8 },
        ],
      },
      { count: 8, colors: ["#E3F2FD"], size: [0.02, 0.05], stretch: [3, 6], latitude: 50, alpha: 0.6 },
    ],
  },
  "Triton": { base: "#E8C4C4", layers: [craters(10, "#B08F8F", 0.3)], caps: { color: "#F8BBD0", south: 0.35 } },

  "Pluto": {
    day: -153, base: "#C9B79C",
    layers: [
      {
        spots: [
          // Tombaugh Regio, the "heart", and the dark Cthulhu region
          { lat: 10, lon: 0, size: 0.28, color: "#F2E8DC", alpha: 0.95 },
          { lat: 0, lon: -25, size: 0.22, color: "#F2E8DC", alpha: 0.95 },
          { lat: -15, lon: -70, size: 0.35, stretch: 1.8, color: "#5D4037", alpha: 0.85 },
        ],
      },
      craters(8, "#9C8B73", 0.3),
    ],
  },
  "Charon": { base: "#9E9E9E", layers: [craters(10, "#757575")], caps: { color: "#8D4E3A", north: 0.3 } },
  "Haumea": { day: 3.9, base: "#F0F0F0", layers: [{ spots: [{ lat: 0, lon: 30, size: 0.3, color: "#B71C1C", alpha: 0.35 }] }, craters(8, "#BDBDBD")] },
  "Makemake": { base: "#D9967A", layers: [craters(10, "#A86B52")] },
  "Eris": { base: "#F5F5F5", layers: [craters(10, "#BDBDBD")] },
};
