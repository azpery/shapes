// Rocket game: launch from Earth, land on other bodies to collect their resources, bring them back to Earth
// to sell them (and refuel), then upgrade the rocket in the workshop to go further. Balance in RocketGameData.js.
// Keys: left / right (or A / D) to turn, up (or W) to fire the engine. Touch screens get buttons.
class RocketGame {
  // gravityStrength: the simulation's (see Gravity), to know the pull of the bodies
  constructor(camera, renderer, objects, gravityStrength, speedControl, notifications) {
    this.camera = camera;
    this.renderer = renderer;
    this.objects = objects;
    this.strength = gravityStrength;
    this.speedControl = speedControl;
    this.notifications = notifications;

    this.active = false;
    this.started = false;
    this.credits = 0;
    this.levels = { tank: 0, engine: 0, cargo: 0, hull: 0 };
    // [{ resource, units, value }]
    this.cargo = [];
    // Units left on each body
    this.deposits = new Map();
    this.input = { left: false, right: false, thrust: false, turn: 0, targetAngle: null };
    // 0 to 1, rises while the engine is fired (see ROCKET_THROTTLE_UP_MS)
    this.throttle = 0;
    // Points the rocket against its motion when coming down on a body, see getAssistAngle
    this.assist = true;
    // Guiding a landing in the last frame
    this.assistEngaged = false;
    // Real ms since the player last flew by hand, see ROCKET_ASSIST_IDLE_MS
    this.handFlyingTime = 0;
    this.rocket = null;
    this.respawnTime = null;
    this.lastTime = null;

    // Bodies with satellites keep their simulated pull, see SURFACE_GRAVITY
    this.parents = new Set(objects.map((object) => object.orbiting).filter((parent) => parent));
    let earth = this.getEarth();
    this.earthGravity = this.getSimulatedMu(earth) / (earth.radius * earth.radius);

    this.world = {
      bodies: objects,
      getMu: (body) => this.getMu(body),
      canLand: (body) => this.canLand(body),
    };

    this.createHud();
    this.createTouchControls();
    this.listenToKeys();
    renderer.addUpdater((time) => this.update(time));
    renderer.addLayer((context, zoom) => this.draw(context, zoom), true);
    setInterval(() => this.updateHud(), 200);
  }

  // Starts the game, or follows the rocket again after looking elsewhere
  start() {
    if (!this.started) {
      this.started = true;
      this.respawn();
      this.notifications.message(
        "Fly to the Moon (↑ to fire, ← → to turn), land slowly to collect Helium-3, then bring it back to Earth. " +
          "Landing assist (L) turns the rocket to brake: when coming down, just hold ↑."
      );
    }
    if (!this.active) {
      // Close to the bodies, things go fast: slow time down (speed it up for long trips)
      this.speedControl.setSpeed(ROCKET_START_SPEED);
      this.active = true;
    }
    this.camera.zoom = ROCKET_START_ZOOM;
    this.camera.follow(() => this.rocket);
    this.hud.style.display = "block";
    this.touchControls.classList.add("active");
    this.updateHud();
  }

  stop() {
    this.active = false;
    this.camera.follow(null);
    this.hud.style.display = "none";
    this.touchControls.classList.remove("active");
  }

  getUpgrade(name) {
    return ROCKET_UPGRADES[name].levels[this.levels[name]].value;
  }

  getEarth() {
    return this.objects.find((object) => object.name === "Earth" && !object.stoped);
  }

  // Starts again on Earth, full tank, empty hold
  respawn() {
    this.rocket = new Rocket(this.getEarth(), -Math.PI / 2, this.getUpgrade("tank"));
    this.cargo = [];
    this.respawnTime = null;
  }

  update(time) {
    let elapsed = this.lastTime === null ? 0 : Math.min(100, time - this.lastTime);
    this.lastTime = time;
    if (!this.active || !this.rocket) return;
    if (this.respawnTime !== null) {
      if (time >= this.respawnTime) this.respawn();
      return;
    }
    // Same time as the simulation: real time in ticks, times its speed
    let ticks = (elapsed / loop.delay) * loop.speed;
    let assist = this.updateAssist(elapsed);
    this.throttle = this.input.thrust ? Math.min(1, this.throttle + elapsed / ROCKET_THROTTLE_UP_MS) : 0;
    // Coming down with the assist: the engine follows a safe descent instead of pushing at full power
    let power = assist && this.input.thrust ? this.getDescentPower(assist, ticks) : this.throttle;
    this.world.thrust = this.getUpgrade("engine") * power;
    this.world.safeSpeed = this.getUpgrade("hull");
    this.input.turn = (ROCKET_TURN_PER_SECOND * elapsed) / 1000;
    this.input.targetAngle = assist ? assist.angle : null;
    let contact = this.rocket.update(ticks, this.input, this.world);
    if (contact) {
      if (contact.landed) this.landed(contact.body);
      else this.crashed(contact.body, contact.speed);
    }
  }

  landed(body) {
    if (body.name === "Earth") {
      let units = this.cargo.reduce((sum, load) => sum + load.units, 0);
      if (units > 0) {
        let earned = this.cargo.reduce((sum, load) => sum + load.units * load.value, 0);
        this.credits += earned;
        this.notifications.message(`Sold ${this.describeCargo()} for ${earned} ¢. Upgrade your rocket in the workshop.`);
        this.cargo = [];
      }
      this.rocket.fuel = this.getUpgrade("tank");
      this.updateHud();
      return;
    }
    let found = BODY_RESOURCES[body.name];
    if (!found) {
      this.notifications.message(`Landed on ${body.name}: nothing to collect here.`);
      return;
    }
    if (!this.deposits.has(body)) this.deposits.set(body, found.deposit);
    let left = this.deposits.get(body);
    let space = this.getUpgrade("cargo") - this.cargo.reduce((sum, load) => sum + load.units, 0);
    let units = Math.min(left, space);
    if (units <= 0) {
      this.notifications.message(left <= 0 ? `${body.name} has been mined out.` : "Cargo hold full: go back to Earth.");
      return;
    }
    this.deposits.set(body, left - units);
    let load = this.cargo.find((item) => item.resource === found.resource && item.value === found.value);
    if (load) load.units += units;
    else this.cargo.push({ resource: found.resource, units: units, value: found.value });
    this.notifications.message(`Collected ${units} ${found.resource} on ${body.name} (${found.value} ¢ each).`);
    this.updateHud();
  }

  crashed(body, speed) {
    let reason = !this.canLand(body)
      ? `${body.name} has no surface to land on`
      : `too fast (${this.formatSpeed(speed)}, safe ${this.formatSpeed(this.getUpgrade("hull"))}) or not upright`;
    this.notifications.message(`Crashed on ${body.name}: ${reason}. Cargo lost.`);
    this.renderer.explosions.push(
      new Explosion({ x: this.rocket.x, y: this.rocket.y, radius: 0.3, color: "#FF7043" }, body, 0.05)
    );
    this.respawnTime = this.lastTime + 1500;
  }

  // Back to Earth, without the cargo
  abort() {
    if (!this.rocket || this.respawnTime !== null) return;
    this.notifications.message("Mission aborted: back on Earth, cargo lost.");
    this.respawn();
  }

  buy(name) {
    let upgrade = ROCKET_UPGRADES[name];
    let next = upgrade.levels[this.levels[name] + 1];
    if (!next || next.cost > this.credits || !this.isHome()) return;
    this.credits -= next.cost;
    this.levels[name]++;
    if (name === "tank") this.rocket.fuel = this.getUpgrade("tank");
    this.notifications.message(`${upgrade.name} upgraded to level ${this.levels[name] + 1}.`);
    this.updateHud();
  }

  isHome() {
    return this.rocket && this.rocket.landedOn && this.rocket.landedOn.name === "Earth";
  }

  canLand(body) {
    let type = body.appearance && body.appearance.type;
    return type !== "star" && type !== "blackHole" && !GAS_GIANTS.includes(body.name);
  }

  // Pull on the rocket (px³/tick²)
  getMu(body) {
    let type = body.appearance && body.appearance.type;
    if (type === "star" || type === "blackHole" || this.parents.has(body)) return this.getSimulatedMu(body);
    let gravity = SURFACE_GRAVITY[body.name] ?? DEFAULT_SURFACE_GRAVITY;
    return gravity * this.earthGravity * body.radius * body.radius;
  }

  // Same as Gravity: G * strength * mass / (distance * 1000)²
  getSimulatedMu(body) {
    return (G * this.strength * body.getMass()) / 1000000;
  }

  // Landing assist for this frame (see getAssist), or null when the player is flying: it stands by while
  // the engine is fired or the rocket turned by hand (launching, manoeuvring), until left alone for a moment.
  // Once guiding a landing, firing the engine is how the player lands, it then keeps going
  updateAssist(elapsed) {
    let byHand = this.input.left || this.input.right || (this.input.thrust && !this.assistEngaged);
    this.handFlyingTime = byHand ? 0 : this.handFlyingTime + elapsed;
    let ready = this.assist && (this.assistEngaged || this.handFlyingTime >= ROCKET_ASSIST_IDLE_MS);
    // Kept while the engine is held: letting go mid-landing would turn it into full manual thrust
    let keep = this.assistEngaged && this.input.thrust;
    let assist = ready && !(this.input.left || this.input.right) ? this.getAssist(keep) : null;
    this.assistEngaged = assist !== null;
    return assist;
  }

  // When about to hit a nearby body: { body, distance, speed, angle } with the angle to point the rocket
  // to, against the motion (firing brakes), or upright once slow. speed is negative when going up.
  // Null otherwise (taking off, in orbit, far away), unless keep
  getAssist(keep = false) {
    let rocket = this.rocket;
    if (rocket.landedOn) return null;
    let body = this.getNearestBody();
    let dx = rocket.x - body.x;
    let dy = rocket.y - body.y;
    let distance = Math.hypot(dx, dy);
    if (distance - body.radius > ROCKET_ASSIST_RANGE * body.radius) return null;
    let vx = rocket.vx - body.xVector;
    let vy = rocket.vy - body.yVector;
    let descending = vx * dx + vy * dy < 0;
    // Only when the path ends on its surface (not in orbit around it, nor passing by)
    if (!keep && (!descending || !rocket.predictPath(body, this.getMu(body)).impact)) return null;
    let speed = Math.hypot(vx, vy);
    let angle = !descending || speed < this.getUpgrade("hull") / 2 ? Math.atan2(dy, dx) : Math.atan2(-vy, -vx);
    return { body: body, distance: distance, speed: descending ? speed : -speed, angle: angle };
  }

  // Engine power (0 to 1) to come down at a safe speed: faster high up, slow near the surface
  // (ROCKET_DESCENT_SPEED). Nothing until the rocket points the right way, pushing sideways would not help
  getDescentPower(assist, ticks) {
    let rocket = this.rocket;
    let misaligned = Math.atan2(Math.sin(rocket.angle - assist.angle), Math.cos(rocket.angle - assist.angle));
    if (Math.abs(misaligned) > 0.5) return 0;
    let altitude = assist.distance - assist.body.radius;
    let target = ROCKET_DESCENT_SPEED.touchdown * this.getUpgrade("hull") + ROCKET_DESCENT_SPEED.perAltitude * altitude;
    let gravity = this.getMu(assist.body) / (assist.distance * assist.distance);
    // Slowing down to the target speed within this frame, while holding against gravity
    let needed = (assist.speed - target) / Math.max(ticks, 0.01) + gravity;
    return Math.max(0, Math.min(1, needed / this.getUpgrade("engine")));
  }

  toggleAssist() {
    this.assist = !this.assist;
    this.updateHud();
  }

  // Body pulling the rocket the most: its path is predicted around it
  getDominantBody() {
    let best = null;
    let bestPull = 0;
    this.objects.forEach((body) => {
      if (body.stoped) return;
      let distance = Math.hypot(body.x - this.rocket.x, body.y - this.rocket.y);
      let pull = this.getMu(body) / (distance * distance);
      if (pull > bestPull) {
        best = body;
        bestPull = pull;
      }
    });
    return best;
  }

  // The body whose surface is the closest, and the speed relative to it
  getNearestBody() {
    let nearest = null;
    let nearestDistance = Infinity;
    this.objects.forEach((body) => {
      if (body.stoped) return;
      let distance = Math.hypot(body.x - this.rocket.x, body.y - this.rocket.y) - body.radius;
      if (distance < nearestDistance) {
        nearest = body;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  draw(context, zoom) {
    if (!this.active || !this.rocket || this.respawnTime !== null) return;
    if (!this.rocket.landedOn) this.drawPrediction(context, zoom);
    this.rocket.draw(context, zoom);
  }

  drawPrediction(context, zoom) {
    let body = this.getDominantBody();
    if (!body) return;
    let path = this.rocket.predictPath(body, this.getMu(body));
    context.save();
    context.translate(body.x, body.y);
    context.beginPath();
    path.points.forEach(([x, y], i) => (i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
    context.setLineDash([5 / zoom, 5 / zoom]);
    context.strokeStyle = "rgba(128, 222, 234, 0.7)";
    context.lineWidth = 1.5 / zoom;
    context.stroke();
    if (path.impact) {
      // Where it would hit the surface
      let [x, y] = path.points[path.points.length - 1];
      let size = 6 / zoom;
      context.setLineDash([]);
      context.strokeStyle = "#FF5252";
      context.lineWidth = 2 / zoom;
      context.beginPath();
      context.moveTo(x - size, y - size);
      context.lineTo(x + size, y + size);
      context.moveTo(x + size, y - size);
      context.lineTo(x - size, y + size);
      context.stroke();
    }
    context.restore();
  }

  // Game speeds shown ×100, easier to read
  formatSpeed(speed) {
    return Math.round(speed * 100).toString();
  }

  describeCargo() {
    return this.cargo.map((load) => `${load.units} ${load.resource}`).join(", ") || "empty";
  }

  createHud() {
    this.hud = document.createElement("div");
    this.hud.className = "rocketHud";
    let line = (className) => {
      let element = document.createElement("div");
      if (className) element.className = className;
      this.hud.append(element);
      return element;
    };
    let header = line("rocketHudHeader");
    this.creditsElement = document.createElement("span");
    let exit = document.createElement("button");
    exit.textContent = "✕";
    exit.title = "Leave the rocket";
    exit.addEventListener("click", () => this.stop());
    header.append(this.creditsElement, exit);

    let fuel = line("rocketHudFuel");
    this.fuelBar = document.createElement("div");
    fuel.append(this.fuelBar);
    this.fuelText = line();
    this.cargoText = line();
    this.statusText = line("rocketHudStatus");

    this.workshop = line("rocketWorkshop");
    let title = document.createElement("div");
    title.className = "rocketWorkshopTitle";
    title.textContent = "Workshop";
    this.workshop.append(title);
    this.workshopRows = {};
    Object.keys(ROCKET_UPGRADES).forEach((name) => {
      let row = document.createElement("div");
      row.className = "rocketWorkshopRow";
      let label = document.createElement("span");
      let button = document.createElement("button");
      button.addEventListener("click", () => this.buy(name));
      row.append(label, button);
      this.workshop.append(row);
      this.workshopRows[name] = { label: label, button: button };
    });

    this.abortButton = document.createElement("button");
    this.abortButton.className = "rocketAbort";
    this.abortButton.textContent = "Return to Earth (lose cargo)";
    this.assistButton = document.createElement("button");
    this.assistButton.className = "rocketAssist";
    this.assistButton.title = "Turns the rocket to brake when coming down on a body (L)";
    this.assistButton.addEventListener("click", () => this.toggleAssist());
    this.hud.append(this.assistButton);
    this.abortButton.addEventListener("click", () => this.abort());
    this.hud.append(this.abortButton);
    document.body.append(this.hud);
  }

  updateHud() {
    if (!this.active || !this.rocket) return;
    let rocket = this.rocket;
    let tank = this.getUpgrade("tank");
    let used = this.cargo.reduce((sum, load) => sum + load.units, 0);
    this.creditsElement.textContent = `${this.credits.toLocaleString()} ¢`;
    this.fuelBar.style.width = (100 * rocket.fuel) / tank + "%";
    this.fuelBar.style.background = rocket.fuel / tank < 0.25 ? "#FF5252" : "#66BB6A";
    this.fuelText.textContent = `Fuel ${Math.round((100 * rocket.fuel) / tank)}%`;
    this.cargoText.textContent = `Cargo ${used}/${this.getUpgrade("cargo")}: ${this.describeCargo()}`;

    if (this.respawnTime !== null) {
      this.statusText.textContent = "Rocket destroyed…";
    } else if (rocket.landedOn) {
      let body = rocket.landedOn;
      let found = BODY_RESOURCES[body.name];
      let left = this.deposits.has(body) ? this.deposits.get(body) : found && found.deposit;
      this.statusText.textContent =
        body.name === "Earth"
          ? "On Earth: cargo sold, tank full. Fire the engine to launch."
          : `Landed on ${body.name}` + (found ? ` · ${found.resource}: ${left} left` : "");
    } else {
      let nearest = this.getNearestBody();
      let speed = Math.hypot(rocket.vx - nearest.xVector, rocket.vy - nearest.yVector);
      let safe = this.getUpgrade("hull");
      this.statusText.textContent = `Near ${nearest.name} · speed ${this.formatSpeed(speed)} (safe landing ≤ ${this.formatSpeed(safe)})`;
      this.statusText.style.color = speed <= safe ? "#A5D6A7" : speed <= 2 * safe ? "#FFCC80" : "#eceff1";
    }
    if (rocket.landedOn || this.respawnTime !== null) this.statusText.style.color = "";

    this.assistButton.textContent =
      "Landing assist: " +
      (!this.assist
        ? "off"
        : this.assistEngaged
        ? "landing"
        : this.handFlyingTime >= ROCKET_ASSIST_IDLE_MS
        ? "ready"
        : "standby");
    let home = this.isHome();
    this.workshop.style.display = home ? "block" : "none";
    this.abortButton.style.display = home || this.respawnTime !== null ? "none" : "block";
    Object.entries(this.workshopRows).forEach(([name, row]) => {
      let upgrade = ROCKET_UPGRADES[name];
      let level = this.levels[name];
      let next = upgrade.levels[level + 1];
      row.label.textContent = `${upgrade.name} ${level + 1}/${upgrade.levels.length}`;
      row.label.title = upgrade.description;
      row.button.textContent = next ? `Upgrade · ${next.cost} ¢` : "Max";
      row.button.disabled = !next || next.cost > this.credits;
    });
  }

  createTouchControls() {
    this.touchControls = document.createElement("div");
    this.touchControls.className = "rocketControls";
    [
      ["⟲", "left"],
      ["⟳", "right"],
      ["🔥", "thrust"],
    ].forEach(([label, key]) => {
      let button = document.createElement("button");
      button.textContent = label;
      button.className = "rocketControl-" + key;
      let set = (value) => (e) => {
        e.preventDefault();
        this.input[key] = value;
      };
      button.addEventListener("pointerdown", set(true));
      button.addEventListener("pointerup", set(false));
      button.addEventListener("pointercancel", set(false));
      button.addEventListener("pointerleave", set(false));
      this.touchControls.append(button);
    });
    document.body.append(this.touchControls);
  }

  listenToKeys() {
    let keys = {
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      ArrowUp: "thrust", w: "thrust", W: "thrust",
    };
    let set = (value) => (e) => {
      let key = keys[e.key];
      if (!key || !this.active) return;
      e.preventDefault();
      this.input[key] = value;
    };
    document.addEventListener("keydown", (e) => {
      if (this.active && (e.key === "l" || e.key === "L")) this.toggleAssist();
    });
    document.addEventListener("keydown", set(true));
    document.addEventListener("keyup", set(false));
    // Keys released while the window is not focused are never seen
    window.addEventListener("blur", () => {
      this.input.left = this.input.right = this.input.thrust = false;
    });
  }
}
