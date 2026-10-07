// Compressed solar system and neighbourhood (nothing is to scale, it has to fit on screen).
// Each body orbits its parent:
// - distance: semi-major axis in px, eccentricity: 0 (circle) to <1, starts at perihelion unless startAtAphelion
// - radius in px
// - mass relative to its parent (stars: relative to the Sun). When omitted it is the lightest mass
//   that keeps its satellites within a quarter of its Hill sphere (otherwise the parent pulls them away)
// - belt: generates rings of small rocks, skipping the orbits of the named bodies next to it
// - real values, to show real speeds and distances (see OrbitInfo.js): au / km: real semi-major axis,
//   gm: real gravitational parameter in km³/s² (bodies with satellites; computed from the mass for stars)

// Sun's gravitational parameter in px³/tick²: circular orbit speed is sqrt(mu / distance)
const SUN_MU = 30;

const SUN = {
  name: "Sun", radius: 22, mass: 1, color: "#FFB300",
  satellites: [
    { name: "Mercury", au: 0.387, distance: 45, radius: 1.6, mass: 0.00001, color: "#9E9E9E" },
    { name: "Venus", au: 0.723, distance: 70, radius: 2.6, mass: 0.0001, color: "#FFE0B2" },
    {
      name: "Earth", au: 1, gm: 398600, distance: 100, radius: 2.6, color: "#1E88E5",
      satellites: [{ name: "Moon", km: 384400, distance: 6, radius: 0.7, color: "#E0E0E0" }],
    },
    {
      name: "Mars", au: 1.524, gm: 42828, distance: 130, radius: 1.8, color: "#E64A19",
      satellites: [
        { name: "Phobos", km: 9376, distance: 3.2, radius: 0.35, color: "#A1887F" },
        { name: "Deimos", km: 23463, distance: 5, radius: 0.35, color: "#BCAAA4" },
      ],
    },

    { name: "Vesta", au: 2.362, distance: 148, radius: 0.45, color: "#BDBDBD" },
    { name: "Ceres", au: 2.767, distance: 155, radius: 0.6, color: "#9E9E9E" },
    { name: "Pallas", au: 2.773, distance: 162, radius: 0.4, color: "#A1887F" },
    {
      belt: true, name: "Asteroid", mass: 1e-10, inner: 141, outer: 168, step: 1.3, perRing: 6,
      minRadius: 0.2, maxRadius: 0.35, colors: ["#8D6E63", "#A1887F", "#9E9E9E", "#757575"],
    },

    {
      name: "Jupiter", au: 5.203, gm: 126686534, distance: 190, radius: 5, color: "#D7A86E",
      satellites: [
        { name: "Io", km: 421700, distance: 7.5, radius: 0.9, color: "#FFEB3B" },
        { name: "Europa", km: 671034, distance: 10.7, radius: 0.8, color: "#FFF8E1" },
        { name: "Ganymede", km: 1070412, distance: 13.9, radius: 1.2, color: "#BCAAA4" },
        { name: "Callisto", km: 1882709, distance: 17.5, radius: 1.1, color: "#8D6E63" },
      ],
    },
    {
      name: "Saturn", au: 9.537, gm: 37931187, distance: 265, radius: 4.5, color: "#F0D58C",
      satellites: [
        { name: "Mimas", km: 185539, distance: 6, radius: 0.4, color: "#CFD8DC" },
        { name: "Enceladus", km: 237948, distance: 7.9, radius: 0.45, color: "#FFFFFF" },
        { name: "Tethys", km: 294619, distance: 9.9, radius: 0.55, color: "#ECEFF1" },
        { name: "Dione", km: 377396, distance: 12.1, radius: 0.55, color: "#CFD8DC" },
        { name: "Rhea", km: 527108, distance: 14.4, radius: 0.65, color: "#B0BEC5" },
        { name: "Titan", km: 1221870, distance: 17.5, radius: 1.1, color: "#FFB74D" },
        { name: "Iapetus", km: 3560820, distance: 21.5, radius: 0.55, color: "#8D6E63" },
      ],
    },
    {
      name: "Uranus", au: 19.19, gm: 5793939, distance: 340, radius: 3.5, color: "#80DEEA",
      satellites: [
        { name: "Miranda", km: 129390, distance: 5, radius: 0.4, color: "#CFD8DC" },
        { name: "Ariel", km: 191020, distance: 6.8, radius: 0.55, color: "#ECEFF1" },
        { name: "Umbriel", km: 266000, distance: 8.6, radius: 0.55, color: "#90A4AE" },
        { name: "Titania", km: 435910, distance: 10.5, radius: 0.65, color: "#D7CCC8" },
        { name: "Oberon", km: 583520, distance: 12.5, radius: 0.65, color: "#BCAAA4" },
      ],
    },
    {
      name: "Neptune", au: 30.07, gm: 6836529, distance: 415, radius: 3.4, color: "#3D5AFE",
      satellites: [
        { name: "Triton", km: 354759, distance: 6, radius: 0.7, color: "#F8BBD0", retrograde: true },
      ],
    },

    {
      name: "Pluto", au: 39.48, gm: 975.5, distance: 545, radius: 1.2, color: "#D7CCC8",
      satellites: [{ name: "Charon", km: 19591, distance: 3.5, radius: 0.6, color: "#9E9E9E" }],
    },
    {
      name: "Haumea", au: 43.1, gm: 267, distance: 595, radius: 1, color: "#ECEFF1",
      satellites: [
        { name: "Namaka", km: 25657, distance: 2.6, radius: 0.25, color: "#BDBDBD" },
        { name: "Hiʻiaka", km: 49880, distance: 3.6, radius: 0.3, color: "#E0E0E0" },
      ],
    },
    { name: "Makemake", au: 45.8, distance: 632, radius: 1, color: "#FFAB91" },
    {
      belt: true, name: "Kuiper belt object", mass: 1e-10, inner: 440, outer: 700, step: 1.5, perRing: 1,
      minRadius: 0.25, maxRadius: 0.45, colors: ["#90A4AE", "#B0BEC5", "#A1887F", "#CFD8DC"],
    },
    {
      name: "Eris", au: 67.9, gm: 1108, distance: 936, eccentricity: 0.2, radius: 1.2, color: "#F5F5F5",
      satellites: [{ name: "Dysnomia", km: 37300, distance: 3.5, radius: 0.35, color: "#9E9E9E" }],
    },

    // Comets: very elongated orbits crossing the planets'. Light: they eat belt rocks, moons and planets eat them
    { name: "Halley's Comet", mass: 1e-9, distance: 275, eccentricity: 0.818, radius: 0.5, color: "#B2EBF2", retrograde: true, startAtAphelion: true },
    { name: "Comet Encke", mass: 1e-9, distance: 127.5, eccentricity: 0.569, radius: 0.4, color: "#B2EBF2", startAtAphelion: true },
    { name: "Comet Swift–Tuttle", mass: 1e-9, distance: 400, eccentricity: 0.75, radius: 0.6, color: "#B2EBF2", retrograde: true, startAtAphelion: true },
    { name: "Comet Hale–Bopp", mass: 1e-9, distance: 747.5, eccentricity: 0.873, radius: 0.7, color: "#E0F7FA", startAtAphelion: true },
  ],
};

// Scale of the stars and the galaxy (the solar system itself is far bigger than this scale)
const LIGHT_YEAR = 1000; // px

// Real world
const AU_KM = 149597870.7;
const LIGHT_YEAR_KM = 9.4607e12;
const SUN_GM = 1.32712e11; // km³/s²

// x, y: position relative to the Sun
const NEIGHBOURING_STARS = [
  {
    name: "Alpha Centauri A", x: -3800, y: 2150, radius: 27, mass: 1.1, color: "#FFF176",
    satellites: [
      { name: "Alpha Centauri B", au: 23.4, distance: 110, eccentricity: 0.52, radius: 19, mass: 0.82, color: "#FFB74D" },
      {
        name: "Proxima Centauri", au: 8700, distance: 300, radius: 4, mass: 0.11, color: "#E53935",
        satellites: [{ name: "Proxima b", au: 0.0485, distance: 6, radius: 0.6, color: "#8D6E63" }],
      },
    ],
  },
  { name: "Barnard's Star", x: 5300, y: -2700, radius: 4, mass: 0.14, color: "#EF5350" },
  {
    name: "Sirius A", x: -8300, y: -2250, radius: 38, mass: 2.06, color: "#E3F2FD",
    satellites: [
      { name: "Sirius B", au: 19.8, distance: 120, eccentricity: 0.59, radius: 1, mass: 0.5, color: "#FFFFFF" },
    ],
  },
];

// Supermassive black hole at the centre of the Milky Way, 26,000 light-years from the Sun.
// The galaxy itself is drawn by Galaxy.js around it
const GALACTIC_CENTER = {
  name: "Sagittarius A*", x: 26000 * LIGHT_YEAR, y: 0, radius: 40, mass: 4000000, color: "#000000",
};
