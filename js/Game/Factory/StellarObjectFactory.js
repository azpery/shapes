// Compressed solar system fitting a 900px high canvas.
// distance & radius in px, mass relative to the Sun. Planets are heavier than in reality
// so their moons stay within a quarter of their Hill sphere (otherwise the Sun pulls them away).
const SOLAR_SYSTEM = [
  { name: "Mercury", distance: 45, radius: 1.6, mass: 0.00001, color: "#9E9E9E", moons: [] },
  { name: "Venus", distance: 70, radius: 2.6, mass: 0.0001, color: "#FFE0B2", moons: [] },
  {
    name: "Earth", distance: 100, radius: 2.6, mass: 0.0415, color: "#1E88E5",
    moons: [{ name: "Moon", distance: 6, radius: 0.7, color: "#E0E0E0" }],
  },
  {
    name: "Mars", distance: 130, radius: 1.8, mass: 0.0109, color: "#E64A19",
    moons: [
      { name: "Phobos", distance: 3.2, radius: 0.35, color: "#A1887F" },
      { name: "Deimos", distance: 5, radius: 0.35, color: "#BCAAA4" },
    ],
  },
  {
    name: "Jupiter", distance: 190, radius: 5, mass: 0.15, color: "#D7A86E",
    moons: [
      { name: "Io", distance: 7.5, radius: 0.9, color: "#FFEB3B" },
      { name: "Europa", distance: 10.7, radius: 0.8, color: "#FFF8E1" },
      { name: "Ganymede", distance: 13.9, radius: 1.2, color: "#BCAAA4" },
      { name: "Callisto", distance: 17.5, radius: 1.1, color: "#8D6E63" },
    ],
  },
  {
    name: "Saturn", distance: 265, radius: 4.5, mass: 0.1025, color: "#F0D58C",
    moons: [
      { name: "Mimas", distance: 6, radius: 0.4, color: "#CFD8DC" },
      { name: "Enceladus", distance: 7.9, radius: 0.45, color: "#FFFFFF" },
      { name: "Tethys", distance: 9.9, radius: 0.55, color: "#ECEFF1" },
      { name: "Dione", distance: 12.1, radius: 0.55, color: "#CFD8DC" },
      { name: "Rhea", distance: 14.4, radius: 0.65, color: "#B0BEC5" },
      { name: "Titan", distance: 17.5, radius: 1.1, color: "#FFB74D" },
      { name: "Iapetus", distance: 21.5, radius: 0.55, color: "#8D6E63" },
    ],
  },
  {
    name: "Uranus", distance: 340, radius: 3.5, mass: 0.0095, color: "#80DEEA",
    moons: [
      { name: "Miranda", distance: 5, radius: 0.4, color: "#CFD8DC" },
      { name: "Ariel", distance: 6.8, radius: 0.55, color: "#ECEFF1" },
      { name: "Umbriel", distance: 8.6, radius: 0.55, color: "#90A4AE" },
      { name: "Titania", distance: 10.5, radius: 0.65, color: "#D7CCC8" },
      { name: "Oberon", distance: 12.5, radius: 0.65, color: "#BCAAA4" },
    ],
  },
  {
    name: "Neptune", distance: 415, radius: 3.4, mass: 0.00058, color: "#3D5AFE",
    moons: [{ name: "Triton", distance: 6, radius: 0.7, color: "#F8BBD0", retrograde: true }],
  },
];

// Sun's gravitational parameter in px³/tick²: circular orbit speed is sqrt(mu / distance)
const SUN_MU = 30;
// Moon masses barely matter (moons only pull free objects): a fraction of their planet's, by volume
const MOON_MASS_PER_VOLUME = 0.0001;

class StellarObjectFactory {
  // Returns the bodies in the order they must be added to the loop:
  // each moon before its planet, so it is pulled towards where the planet was at the start of the tick
  static createSolarSystem(option, context, x, y) {
    let sun = this.createBody(option, context, "#FFB300", 22, SUN_MU, x, y, 0, 0, null);
    let bodies = [];
    SOLAR_SYSTEM.forEach((planetData) => {
      let planetMu = SUN_MU * planetData.mass;
      let planet = this.createOrbitingBody(option, context, planetData, planetMu, sun, SUN_MU);
      planetData.moons.forEach((moonData) => {
        let moonMu = planetMu * MOON_MASS_PER_VOLUME * Math.pow(moonData.radius, 3);
        bodies.push(this.createOrbitingBody(option, context, moonData, moonMu, planet, planetMu));
      });
      bodies.push(planet);
    });
    bodies.push(sun);
    return bodies;
  }

  static createOrbitingBody(option, context, data, mu, parent, parentMu) {
    var angle = Math.random() * 2 * Math.PI;
    var speed = Math.sqrt(parentMu / data.distance) * (data.retrograde ? -1 : 1);
    let body = this.createBody(
      option,
      context,
      data.color,
      data.radius,
      mu,
      parent.x + Math.cos(angle) * data.distance,
      parent.y + Math.sin(angle) * data.distance,
      parent.xVector - Math.sin(angle) * speed,
      parent.yVector + Math.cos(angle) * speed,
      parent
    );
    body.name = data.name;
    return body;
  }

  static createBody(option, context, color, radius, mu, x, y, xVector, yVector, orbiting) {
    // Gravity gives an acceleration of G * strength * mass / (distance * 1000)², see Comet.getGravitationalForce
    var mass = (mu * 1000 * 1000) / (G * option.attractionStrength);
    var volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    let body = new Comet(
      x,
      y,
      radius,
      context,
      color,
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      mass / volume
    );
    body.orbiting = orbiting;
    return body;
  }

  static createComet(option, context, colorPicker) {
    var x = parseInt(
      option.xRespawn ? option.xRespawn : new Random(0, option.width, 1).get()
    );
    var y = parseInt(
      option.yRespawn ? option.yRespawn : new Random(0, option.height, 1).get()
    );
    var xVector =
      option.xVector == undefined
        ? new Random(
            -1 * option.maxSpeedOfObject,
            2 * option.maxSpeedOfObject,
            1
          ).get()
        : option.xVector;
    var yVector =
      option.yVector == undefined
        ? new Random(
            -1 * option.maxSpeedOfObject,
            2 * option.maxSpeedOfObject,
            1
          ).get()
        : option.yVector;
    var radius =
      new Random(option.minSize, option.maxSize, 0.1).get() * option.zoom;
    var density =
      option.density == undefined
        ? new Random(option.minDensity, option.maxDensity, 1).get()
        : option.density / (option.zoom * option.zoom);
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }

  static createControledComet(option, context, colorPicker, comets) {
    var x = 800;
    var y = 500;
    var xVector = 0;
    var yVector = 0;
    var radius = 10;
    var density = option.density;
    let shape = new ControledComet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density,
      comets
    );
    return shape;
  }

  static createSun(option, context, colorPicker) {
    var x = 800;
    var y = 400;
    var xVector = 0;
    var yVector = 0;
    var radius = 20;
    var density = 70000;
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }

  static createEarth(option, context, colorPicker) {
    var x = 700;
    var y = 400;
    var xVector = 0;
    var yVector = 0.06;
    var radius = 2;
    var density = 70000;
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }

  static createMercury(option, context, colorPicker) {
    var x = 800;
    var y = 355;
    var xVector = 0.09;
    var yVector = 0;
    var radius = 2;
    var density = 70000;
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }

  static createMars(option, context, colorPicker) {
    var x = 700;
    var y = 600;
    var xVector = 0.065;
    var yVector = 0.04;
    var radius = 3;
    var density = 70000;
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }

  static createMoon(option, context, colorPicker) {
    var x = 700;
    var y = 590;
    var xVector = 0.2;
    var yVector = 0.04;
    var radius = 0.5;
    var density = 90000000;
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }
}
