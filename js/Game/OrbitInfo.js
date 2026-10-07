// For the hovered (or else selected) object: draws its orbit and a line to Earth with the distance,
// and adds its speed to the label. The selected one also gets a panel with what it orbits, its speed and
// its distance to Earth. The simulation is compressed, so values are converted to real ones (see getRealDistance)
class OrbitInfo {
  // gravityStrength: the same multiplier as Gravity's, to know the simulated pull of the parents
  constructor(tooltip, renderer, objects, gravityStrength) {
    this.tooltip = tooltip;
    this.renderer = renderer;
    this.objects = objects;
    this.strength = gravityStrength;
    this.selected = null;
    this.sunScale = this.createSunScale();

    this.panel = document.createElement("div");
    this.panel.className = "objectInfo";
    document.body.append(this.panel);

    tooltip.onSelect((object) => {
      this.selected = object;
      this.updatePanel();
    });
    tooltip.addDetail((body) => {
      let speed = this.getRealSpeed(body);
      return speed === null ? null : this.formatSpeed(speed);
    });
    renderer.addLayer((context, zoom) => {
      let body = this.tooltip.shown;
      if (!body) return;
      this.drawOrbit(context, zoom, body);
      this.drawEarthLine(context, zoom, body);
    });
    // Readable rather than every frame
    setInterval(() => this.updatePanel(), 250);
  }

  // Two-body orbit around the parent, from the current relative position and velocity (simulation units).
  // Real positions, not the ones drawn between two steps: they would not match the velocities
  getOrbit(body) {
    let parent = body.orbiting;
    if (!parent) return null;
    let position = this.renderer.getPhysicsPosition(body);
    let parentPosition = this.renderer.getPhysicsPosition(parent);
    let x = position.x - parentPosition.x;
    let y = position.y - parentPosition.y;
    let vx = body.xVector - parent.xVector;
    let vy = body.yVector - parent.yVector;
    // Same pull as Gravity: G * strength * mass / (distance * 1000)²
    let mu = (G * this.strength * parent.getMass()) / 1000000;
    let r = Math.hypot(x, y);
    let speed2 = vx * vx + vy * vy;
    let radialSpeed = x * vx + y * vy;
    return {
      parent: parent,
      mu: mu,
      distance: r,
      speed: Math.sqrt(speed2),
      // Eccentricity vector: points to the closest point of the orbit
      ex: ((speed2 - mu / r) * x - radialSpeed * vx) / mu,
      ey: ((speed2 - mu / r) * y - radialSpeed * vy) / mu,
      semiMajorAxis: 1 / (2 / r - speed2 / mu),
    };
  }

  drawOrbit(context, zoom, body) {
    let orbit = this.getOrbit(body);
    if (!orbit) return;
    let eccentricity = Math.hypot(orbit.ex, orbit.ey);
    // Escaping (no closed orbit)
    if (orbit.semiMajorAxis <= 0 || eccentricity >= 1) return;
    let a = orbit.semiMajorAxis;
    context.beginPath();
    // The parent (at its drawn position) is at a focus: the centre is a * e away from it, opposite to
    // the closest point
    context.ellipse(
      orbit.parent.x - orbit.ex * a,
      orbit.parent.y - orbit.ey * a,
      a,
      a * Math.sqrt(1 - eccentricity * eccentricity),
      Math.atan2(orbit.ey, orbit.ex),
      0,
      2 * Math.PI
    );
    context.strokeStyle = BodyPainter.rgba(body.color, 0.6);
    context.lineWidth = 1.5 / zoom;
    context.stroke();
  }

  // Dashed line to Earth, with the real distance in its middle
  drawEarthLine(context, zoom, body) {
    let earth = this.getEarth();
    if (!earth || earth === body) return;
    context.save();
    context.beginPath();
    context.moveTo(body.x, body.y);
    context.lineTo(earth.x, earth.y);
    context.setLineDash([6 / zoom, 4 / zoom]);
    context.strokeStyle = "rgba(236, 239, 241, 0.5)";
    context.lineWidth = 1 / zoom;
    context.stroke();

    let distance = this.getRealDistanceBetween(body, earth);
    if (distance !== null) {
      // The text is drawn in canvas pixels, at the same size whatever the zoom
      let middle = context
        .getTransform()
        .transformPoint(new DOMPoint((body.x + earth.x) / 2, (body.y + earth.y) / 2));
      let ratio = context.canvas.width / context.canvas.clientWidth;
      let text = this.formatDistance(distance);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.font = 12 * ratio + "px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      let width = context.measureText(text).width + 12 * ratio;
      let height = 20 * ratio;
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      context.fillRect(middle.x - width / 2, middle.y - height / 2, width, height);
      context.fillStyle = "#eceff1";
      context.fillText(text, middle.x, middle.y);
    }
    context.restore();
  }

  getEarth() {
    return this.objects.find((object) => object.name === "Earth" && !object.stoped);
  }

  updatePanel() {
    let body = this.selected;
    if (!body) {
      this.panel.style.display = "none";
      return;
    }
    let earth = this.getEarth();
    let orbit = this.getOrbit(body);
    let speed = this.getRealSpeed(body);
    let distance = earth && earth !== body ? this.getRealDistanceBetween(body, earth) : null;

    let title = document.createElement("div");
    title.className = "objectInfoTitle";
    title.textContent = body.name;
    title.style.color = body.color === "#000000" ? "#eceff1" : body.color;
    let rows = document.createElement("div");
    rows.className = "objectInfoRows";
    [
      ["Orbits", orbit ? orbit.parent.name : "—"],
      ["Speed", speed === null ? "—" : this.formatSpeed(speed)],
      ["Distance to Earth", distance === null ? "—" : this.formatDistance(distance)],
    ].forEach(([label, value]) => {
      let labelElement = document.createElement("span");
      labelElement.className = "objectInfoLabel";
      labelElement.textContent = label;
      let valueElement = document.createElement("span");
      valueElement.textContent = value;
      rows.append(labelElement, valueElement);
    });
    this.panel.replaceChildren(title, rows);
    this.panel.style.display = "block";
  }

  // Real distance (km) between a body and its parent, from the simulated one:
  // - around the Sun, the planets' real distances are interpolated (the compression changes with the distance)
  // - otherwise scaled by the body's real / simulated semi-major axis
  getRealDistance(body, simulatedDistance) {
    if (body.orbiting.name === "Sun") return this.toAstronomicalUnits(simulatedDistance) * AU_KM;
    let real = body.real || {};
    if (!real.semiMajorAxis || !real.simDistance) return null;
    return (simulatedDistance * real.semiMajorAxis) / real.simDistance;
  }

  // Real position (km) relative to the Sun. Stars are already at their real scale (LIGHT_YEAR)
  getRealPosition(body) {
    if (!body.orbiting) {
      let sun = this.objects.find((object) => object.name === "Sun");
      if (!sun) return null;
      return {
        x: ((body.x - sun.x) / LIGHT_YEAR) * LIGHT_YEAR_KM,
        y: ((body.y - sun.y) / LIGHT_YEAR) * LIGHT_YEAR_KM,
      };
    }
    let parentPosition = this.getRealPosition(body.orbiting);
    let x = body.x - body.orbiting.x;
    let y = body.y - body.orbiting.y;
    let distance = Math.hypot(x, y) || 1;
    let realDistance = this.getRealDistance(body, distance);
    if (!parentPosition || realDistance === null) return null;
    return {
      x: parentPosition.x + (x / distance) * realDistance,
      y: parentPosition.y + (y / distance) * realDistance,
    };
  }

  getRealDistanceBetween(first, second) {
    let a = this.getRealPosition(first);
    let b = this.getRealPosition(second);
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : null;
  }

  // Speed relative to the parent (km/s): how much faster or slower than a circular orbit at that distance
  // the body goes in the simulation, applied to the real circular speed
  getRealSpeed(body) {
    let orbit = this.getOrbit(body);
    let gm = orbit && orbit.parent.real && orbit.parent.real.gm;
    if (!gm) return null;
    let realDistance = this.getRealDistance(body, orbit.distance);
    if (!realDistance) return null;
    let simulatedCircularSpeed = Math.sqrt(orbit.mu / orbit.distance);
    return (orbit.speed / simulatedCircularSpeed) * Math.sqrt(gm / realDistance);
  }

  // [simulated distance, real AU] of the bodies on circular orbits around the Sun, from the Sun outward
  createSunScale() {
    let points = SUN.satellites
      .filter((body) => body.au !== undefined && !body.eccentricity)
      .map((body) => [body.distance, body.au]);
    return [[0, 0], ...points].sort((a, b) => a[0] - b[0]);
  }

  // Linear between the known bodies, extended past the last ones
  toAstronomicalUnits(simulatedDistance) {
    let points = this.sunScale;
    let i = 1;
    while (i < points.length - 1 && points[i][0] < simulatedDistance) i++;
    let [x0, y0] = points[i - 1];
    let [x1, y1] = points[i];
    return y0 + ((simulatedDistance - x0) * (y1 - y0)) / (x1 - x0);
  }

  formatDistance(km) {
    return Math.round(km).toLocaleString() + " km";
  }

  formatSpeed(kmPerSecond) {
    if (kmPerSecond < 1) return Math.round(kmPerSecond * 1000) + " m/s";
    return kmPerSecond.toFixed(1) + " km/s";
  }
}
