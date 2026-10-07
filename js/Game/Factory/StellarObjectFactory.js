// Satellites stay within this fraction of their parent's Hill sphere, see SolarSystemData.js
const HILL_FRACTION = 0.25;
// Mass, relative to the parent, of bodies without satellites (they barely matter, they only pull free objects)
const MASS_PER_VOLUME = 0.0001;

class StellarObjectFactory {
  // Sun, its satellites, the neighbouring stars and the galactic centre (data in SolarSystemData.js), in the order they must be
  // added to the loop: each satellite before its parent, so it is pulled towards where the parent was at
  // the start of the tick
  static createSolarSystem(option, context, x, y) {
    let bodies = this.createStar(option, context, SUN, x, y);
    NEIGHBOURING_STARS.forEach((star) => {
      bodies.push(...this.createStar(option, context, star, x + star.x, y + star.y));
    });
    bodies.push(
      ...this.createStar(option, context, GALACTIC_CENTER, x + GALACTIC_CENTER.x, y + GALACTIC_CENTER.y)
    );
    return bodies;
  }

  static createStar(option, context, data, x, y) {
    let mu = SUN_MU * data.mass;
    let star = this.createBody(option, context, data, mu, x, y, 0, 0, null);
    return [...this.createSatellites(option, context, data, star, mu), star];
  }

  static createSatellites(option, context, data, parent, parentMu) {
    let bodies = [];
    this.expandBelts(data.satellites || []).forEach((satelliteData) => {
      let mu = parentMu * (satelliteData.mass ?? this.getMassToHoldSatellites(satelliteData));
      let satellite = this.createOrbitingBody(option, context, satelliteData, mu, parent, parentMu);
      bodies.push(
        ...this.createSatellites(option, context, satelliteData, satellite, mu),
        satellite
      );
    });
    return bodies;
  }

  // Lightest mass (relative to the parent) keeping the satellites inside HILL_FRACTION of the Hill sphere
  static getMassToHoldSatellites(data) {
    let volumeMass = MASS_PER_VOLUME * Math.pow(data.radius, 3);
    if (!data.satellites) return volumeMass;
    let farthest = Math.max(
      ...data.satellites.map((s) => s.distance * (1 + (s.eccentricity || 0)))
    );
    let perihelion = data.distance * (1 - (data.eccentricity || 0));
    return Math.max(volumeMass, 3 * Math.pow(farthest / HILL_FRACTION / perihelion, 3));
  }

  // Replaces belts by rings of rocks. Rocks of a ring share the same orbit so they never meet,
  // rings are spaced so neighbours never touch, and the orbits of the named bodies are left free
  static expandBelts(satellites) {
    let named = satellites.filter((s) => !s.belt && !s.eccentricity);
    let expanded = [];
    satellites.forEach((data) => {
      if (!data.belt) return expanded.push(data);
      for (let distance = data.inner; distance <= data.outer; distance += data.step) {
        let isFree = named.every(
          (body) => Math.abs(body.distance - distance) > this.getSystemRadius(body) + data.step
        );
        if (!isFree) continue;
        let firstAngle = Math.random() * 2 * Math.PI;
        for (let i = 0; i < data.perRing; i++) {
          expanded.push({
            name: data.name,
            mass: data.mass,
            distance: distance,
            angle: firstAngle + (i * 2 * Math.PI) / data.perRing,
            radius: data.minRadius + Math.random() * (data.maxRadius - data.minRadius),
            color: data.colors[Math.floor(Math.random() * data.colors.length)],
          });
        }
      }
    });
    return expanded;
  }

  // Radius of a body including its satellites' orbits
  static getSystemRadius(data) {
    return Math.max(
      data.radius,
      ...(data.satellites || []).map(
        (s) => s.distance * (1 + (s.eccentricity || 0)) + this.getSystemRadius(s)
      )
    );
  }

  static createOrbitingBody(option, context, data, mu, parent, parentMu) {
    var angle = data.angle ?? Math.random() * 2 * Math.PI;
    var eccentricity = data.eccentricity || 0;
    // Starts at perihelion (or aphelion), where the speed is perpendicular to the parent's direction
    var distance = data.distance * (data.startAtAphelion ? 1 + eccentricity : 1 - eccentricity);
    var speed =
      Math.sqrt(parentMu * (2 / distance - 1 / data.distance)) * (data.retrograde ? -1 : 1);
    return this.createBody(
      option,
      context,
      data,
      mu,
      parent.x + Math.cos(angle) * distance,
      parent.y + Math.sin(angle) * distance,
      parent.xVector - Math.sin(angle) * speed,
      parent.yVector + Math.cos(angle) * speed,
      parent
    );
  }

  static createBody(option, context, data, mu, x, y, xVector, yVector, orbiting) {
    // Gravity gives an acceleration of G * strength * mass / (distance * 1000)², see Comet.getGravitationalForce
    var mass = (mu * 1000 * 1000) / (G * option.attractionStrength);
    var volume = (4 / 3) * Math.PI * Math.pow(data.radius, 3);
    let body = new Comet(
      x,
      y,
      data.radius,
      context,
      data.color,
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      mass / volume
    );
    body.name = data.name;
    body.orbiting = orbiting;
    // See BodyAppearances.js: unlisted bodies are rocks, or stars when they orbit nothing
    body.appearance = BODY_APPEARANCES[data.name] || (orbiting === null ? { type: "star" } : {});
    // Real values, to show real speeds and distances (see OrbitInfo.js)
    let isStar = body.appearance.type === "star" || body.appearance.type === "blackHole";
    body.real = {
      simDistance: data.distance,
      semiMajorAxis: data.km ?? (data.au === undefined ? undefined : data.au * AU_KM),
      // Star masses are real (in Suns), not planet ones (made heavier to hold their moons)
      gm: data.gm ?? (isStar ? (mu / SUN_MU) * SUN_GM : undefined),
    };
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
