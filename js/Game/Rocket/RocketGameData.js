// Rocket game balance. Speeds in px per tick, like the simulation (Earth's orbital speed is ~0.55,
// escaping Earth from its surface takes ~1).

// Camera zoom and simulation speed when getting in the rocket
const ROCKET_START_ZOOM = 120;
const ROCKET_START_SPEED = 0.05;

// Turning speed, in real time (the same whatever the simulation speed)
const ROCKET_TURN_PER_SECOND = 3;
// Real time for the engine to go from off to full power: short taps give small pushes
const ROCKET_THROTTLE_UP_MS = 400;
// Landing assist works up to this many radii from the surface
const ROCKET_ASSIST_RANGE = 6;
// The assist only takes over after this long (real ms) without firing the engine or turning by hand
const ROCKET_ASSIST_IDLE_MS = 500;
// Speed the landing assist comes down at when the engine is fired: touchdown × the hull's safe landing
// speed, plus perAltitude × the height above the surface
const ROCKET_DESCENT_SPEED = { touchdown: 0.6, perAltitude: 0.1 };

// Upgrades bought in the workshop on Earth: each level's value, and its price
const ROCKET_UPGRADES = {
  tank: {
    name: "Fuel tank",
    description: "go further",
    // Total speed change the full tank gives
    levels: [{ value: 4, cost: 0 }, { value: 5.5, cost: 150 }, { value: 7.5, cost: 400 }, { value: 10, cost: 1000 }, { value: 14, cost: 2500 }],
  },
  engine: {
    name: "Engine",
    description: "lift off from heavier bodies, waste less fuel",
    // Acceleration per tick (Earth's surface gravity is ~0.18)
    levels: [{ value: 0.4, cost: 0 }, { value: 0.55, cost: 200 }, { value: 0.75, cost: 500 }, { value: 1, cost: 1200 }],
  },
  cargo: {
    name: "Cargo hold",
    description: "carry more",
    levels: [{ value: 5, cost: 0 }, { value: 10, cost: 100 }, { value: 20, cost: 300 }, { value: 40, cost: 800 }],
  },
  hull: {
    name: "Hull",
    description: "land faster without breaking",
    // Safe landing speed
    levels: [{ value: 0.2, cost: 0 }, { value: 0.3, cost: 120 }, { value: 0.45, cost: 350 }, { value: 0.65, cost: 900 }],
  },
};

// What can be found where: value per unit in credits, units available. Further = more valuable
const BODY_RESOURCES = {
  "Moon": { resource: "Helium-3", value: 10, deposit: 30 },
  "Mercury": { resource: "Metals", value: 25, deposit: 30 },
  "Venus": { resource: "Sulfur", value: 20, deposit: 30 },
  "Mars": { resource: "Iron", value: 15, deposit: 40 },
  "Phobos": { resource: "Water ice", value: 12, deposit: 15 },
  "Deimos": { resource: "Water ice", value: 12, deposit: 15 },
  "Ceres": { resource: "Water ice", value: 30, deposit: 30 },
  "Vesta": { resource: "Nickel", value: 35, deposit: 25 },
  "Pallas": { resource: "Platinum", value: 40, deposit: 20 },
  "Asteroid": { resource: "Platinum", value: 40, deposit: 3 },
  "Io": { resource: "Sulfur", value: 45, deposit: 40 },
  "Europa": { resource: "Water", value: 50, deposit: 40 },
  "Ganymede": { resource: "Titanium", value: 55, deposit: 40 },
  "Callisto": { resource: "Water ice", value: 45, deposit: 40 },
  "Mimas": { resource: "Water ice", value: 60, deposit: 20 },
  "Enceladus": { resource: "Water", value: 65, deposit: 25 },
  "Tethys": { resource: "Water ice", value: 60, deposit: 25 },
  "Dione": { resource: "Water ice", value: 60, deposit: 25 },
  "Rhea": { resource: "Water ice", value: 60, deposit: 30 },
  "Titan": { resource: "Methane", value: 70, deposit: 50 },
  "Iapetus": { resource: "Carbon", value: 60, deposit: 25 },
  "Miranda": { resource: "Water ice", value: 80, deposit: 20 },
  "Ariel": { resource: "Water ice", value: 80, deposit: 25 },
  "Umbriel": { resource: "Carbon", value: 80, deposit: 25 },
  "Titania": { resource: "Water ice", value: 80, deposit: 30 },
  "Oberon": { resource: "Water ice", value: 80, deposit: 30 },
  "Triton": { resource: "Nitrogen ice", value: 100, deposit: 30 },
  "Pluto": { resource: "Nitrogen ice", value: 120, deposit: 40 },
  "Charon": { resource: "Water ice", value: 110, deposit: 30 },
  "Haumea": { resource: "Exotic ices", value: 150, deposit: 30 },
  "Namaka": { resource: "Exotic ices", value: 150, deposit: 10 },
  "Hiʻiaka": { resource: "Exotic ices", value: 150, deposit: 10 },
  "Makemake": { resource: "Exotic ices", value: 150, deposit: 30 },
  "Eris": { resource: "Exotic ices", value: 180, deposit: 40 },
  "Dysnomia": { resource: "Exotic ices", value: 180, deposit: 10 },
  "Kuiper belt object": { resource: "Exotic ices", value: 130, deposit: 3 },
  "Halley's Comet": { resource: "Comet ice", value: 90, deposit: 15 },
  "Comet Encke": { resource: "Comet ice", value: 90, deposit: 15 },
  "Comet Swift–Tuttle": { resource: "Comet ice", value: 90, deposit: 15 },
  "Comet Hale–Bopp": { resource: "Comet ice", value: 90, deposit: 15 },
  "Proxima b": { resource: "Alien minerals", value: 1000, deposit: 50 },
};

// No surface to land on: touching them destroys the rocket (stars too)
const GAS_GIANTS = ["Jupiter", "Saturn", "Uranus", "Neptune"];

// Real surface gravity relative to Earth, for the rocket. Bodies with satellites keep the pull they have
// in the simulation (so their moons and the rocket move consistently)
const SURFACE_GRAVITY = {
  "Mercury": 0.38, "Venus": 0.9, "Moon": 0.165, "Phobos": 0.002, "Deimos": 0.002,
  "Io": 0.18, "Europa": 0.13, "Ganymede": 0.15, "Callisto": 0.13,
  "Mimas": 0.006, "Enceladus": 0.011, "Tethys": 0.015, "Dione": 0.023, "Rhea": 0.027, "Titan": 0.14, "Iapetus": 0.023,
  "Miranda": 0.008, "Ariel": 0.025, "Umbriel": 0.023, "Titania": 0.039, "Oberon": 0.036, "Triton": 0.08,
  "Charon": 0.03, "Ceres": 0.029, "Vesta": 0.025, "Pallas": 0.02, "Makemake": 0.05,
  "Namaka": 0.005, "Hiʻiaka": 0.006, "Dysnomia": 0.005, "Proxima b": 1.1,
};
// Asteroids, comets and other small rocks
const DEFAULT_SURFACE_GRAVITY = 0.002;
