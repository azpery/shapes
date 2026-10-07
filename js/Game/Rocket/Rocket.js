// The player's rocket: pulled by every body, steered and pushed by its engine, lands on (or crashes into)
// what it touches. Moved every animation frame (see RocketGame), in many small steps for precision.
class Rocket {
  // World units (Earth's radius is 2.6)
  static LENGTH = 0.35;
  static RADIUS = 0.12;
  // Steeper than this when touching down is a crash
  static MAX_TILT = (70 * Math.PI) / 180;

  constructor(body, surfaceAngle, fuel) {
    this.fuel = fuel;
    this.angle = surfaceAngle;
    this.thrusting = false;
    this.landOn(body, surfaceAngle);
  }

  landOn(body, surfaceAngle) {
    this.landedOn = body;
    this.surfaceAngle = surfaceAngle;
    this.thrusting = false;
    this.placeOnSurface();
  }

  // Standing on the body, pointing up, moving with it
  placeOnSurface() {
    let body = this.landedOn;
    let distance = body.radius + Rocket.LENGTH / 2;
    this.x = body.x + Math.cos(this.surfaceAngle) * distance;
    this.y = body.y + Math.sin(this.surfaceAngle) * distance;
    this.vx = body.xVector;
    this.vy = body.yVector;
    this.angle = this.surfaceAngle;
  }

  // ticks: simulated time to move by.
  // input: { left, right, thrust, turn (radians it may turn in this update), targetAngle (turned to when
  // neither left nor right is pressed, null for none) }.
  // world: { bodies, getMu(body), thrust, safeSpeed, canLand(body) }.
  // Returns { body, landed, speed } when it touches a body, null otherwise
  update(ticks, input, world) {
    if (ticks <= 0) return null;
    if (this.landedOn) {
      if (this.landedOn.stoped) {
        // The body was absorbed in a collision
        this.landedOn = null;
      } else {
        this.placeOnSurface();
        let body = this.landedOn;
        let gravity = world.getMu(body) / (body.radius * body.radius);
        this.thrusting = false;
        if (!input.thrust || this.fuel <= 0 || world.thrust <= gravity) return null;
        // Lift off
        this.landedOn = null;
      }
    }

    let steps = Math.min(400, Math.ceil(ticks / 0.05));
    let step = ticks / steps;
    for (let i = 1; i <= steps; i++) {
      // Bodies are where they are at the end of the frame: moved back along their path for earlier steps
      let back = ticks * (1 - i / steps);
      let turn = input.turn / steps;
      if (input.left || input.right) {
        this.angle += (input.right - input.left) * turn;
      } else if (input.targetAngle !== null) {
        let difference = Math.atan2(
          Math.sin(input.targetAngle - this.angle),
          Math.cos(input.targetAngle - this.angle)
        );
        this.angle += Math.max(-turn, Math.min(turn, difference));
      }

      let ax = 0;
      let ay = 0;
      world.bodies.forEach((body) => {
        if (body.stoped) return;
        let mu = world.getMu(body);
        if (!mu) return;
        let dx = body.x - body.xVector * back - this.x;
        let dy = body.y - body.yVector * back - this.y;
        let distance = Math.hypot(dx, dy) || 1e-9;
        // Not stronger than at the surface
        let softened = Math.max(distance, body.radius);
        ax += (mu * dx) / (distance * softened * softened);
        ay += (mu * dy) / (distance * softened * softened);
      });

      this.thrusting = input.thrust && this.fuel > 0;
      if (this.thrusting) {
        ax += Math.cos(this.angle) * world.thrust;
        ay += Math.sin(this.angle) * world.thrust;
        this.fuel = Math.max(0, this.fuel - world.thrust * step);
      }

      // Velocity first, then position (stable orbits, see Comet.hook)
      this.vx += ax * step;
      this.vy += ay * step;
      this.x += this.vx * step;
      this.y += this.vy * step;

      let contact = this.findContact(world, back);
      if (contact) return contact;
    }
    return null;
  }

  findContact(world, back) {
    for (let body of world.bodies) {
      if (body.stoped) continue;
      let dx = this.x - (body.x - body.xVector * back);
      let dy = this.y - (body.y - body.yVector * back);
      let distance = Math.hypot(dx, dy);
      if (distance >= body.radius + Rocket.RADIUS) continue;
      let normalX = dx / distance;
      let normalY = dy / distance;
      let relativeX = this.vx - body.xVector;
      let relativeY = this.vy - body.yVector;
      // Moving away from the surface (taking off)
      if (relativeX * normalX + relativeY * normalY >= 0) continue;

      let speed = Math.hypot(relativeX, relativeY);
      let surfaceAngle = Math.atan2(normalY, normalX);
      let tilt = Math.atan2(Math.sin(this.angle - surfaceAngle), Math.cos(this.angle - surfaceAngle));
      let landed = world.canLand(body) && speed <= world.safeSpeed && Math.abs(tilt) <= Rocket.MAX_TILT;
      if (landed) this.landOn(body, surfaceAngle);
      return { body: body, landed: landed, speed: speed };
    }
    return null;
  }

  // Path around a body if only it pulled (relative to it): points, and whether it ends on its surface.
  // Stops after one turn
  predictPath(body, mu, maxSteps = 1500) {
    let x = this.x - body.x;
    let y = this.y - body.y;
    let vx = this.vx - body.xVector;
    let vy = this.vy - body.yVector;
    let points = [[x, y]];
    let turned = 0;
    let previousAngle = Math.atan2(y, x);
    for (let i = 0; i < maxSteps; i++) {
      let distance = Math.hypot(x, y);
      // About 2° of the orbit per step
      let step = Math.min(20, Math.max(0.05, (0.03 * distance) / (Math.hypot(vx, vy) + 1e-9)));
      let pull = -mu / (distance * distance * distance);
      vx += pull * x * step;
      vy += pull * y * step;
      x += vx * step;
      y += vy * step;
      points.push([x, y]);
      if (Math.hypot(x, y) < body.radius) return { points: points, impact: true };
      let angle = Math.atan2(y, x);
      turned += Math.atan2(Math.sin(angle - previousAngle), Math.cos(angle - previousAngle));
      previousAngle = angle;
      if (Math.abs(turned) > 2 * Math.PI) break;
    }
    return { points: points, impact: false };
  }

  draw(context, zoom) {
    // Never smaller than ~24 canvas px, to stay visible when zoomed out
    let length = Math.max(Rocket.LENGTH, 24 / zoom);
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.scale(length, length);

    // Drawn pointing to +x, 1 unit long
    if (this.thrusting) {
      let flameLength = 0.35 + Math.random() * 0.2;
      let flame = context.createLinearGradient(-0.4, 0, -0.4 - flameLength, 0);
      flame.addColorStop(0, "rgba(255, 241, 118, 1)");
      flame.addColorStop(0.4, "rgba(255, 152, 0, 0.9)");
      flame.addColorStop(1, "rgba(255, 87, 34, 0)");
      context.beginPath();
      context.moveTo(-0.4, -0.09);
      context.lineTo(-0.4 - flameLength, 0);
      context.lineTo(-0.4, 0.09);
      context.closePath();
      context.fillStyle = flame;
      context.fill();
    }
    // Fins
    context.fillStyle = "#E53935";
    context.beginPath();
    context.moveTo(-0.4, 0.1);
    context.lineTo(-0.55, 0.26);
    context.lineTo(-0.2, 0.1);
    context.moveTo(-0.4, -0.1);
    context.lineTo(-0.55, -0.26);
    context.lineTo(-0.2, -0.1);
    context.fill();
    // Body
    context.fillStyle = "#ECEFF1";
    context.beginPath();
    context.moveTo(0.25, 0.12);
    context.lineTo(-0.4, 0.12);
    context.lineTo(-0.4, -0.12);
    context.lineTo(0.25, -0.12);
    context.closePath();
    context.fill();
    // Nose
    context.fillStyle = "#E53935";
    context.beginPath();
    context.moveTo(0.5, 0);
    context.lineTo(0.25, 0.12);
    context.lineTo(0.25, -0.12);
    context.closePath();
    context.fill();
    // Window
    context.fillStyle = "#4FC3F7";
    context.beginPath();
    context.arc(0.08, 0, 0.06, 0, 2 * Math.PI);
    context.fill();
    context.restore();
  }
}
