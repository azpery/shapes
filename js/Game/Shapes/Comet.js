class Comet extends Shape {
  constructor(
    x,
    y,
    radius,
    context,
    color,
    xVector,
    yVector,
    drawline = false,
    maxCollidedSize,
    density = 1
  ) {
    super(x, y, radius, 0, context);
    this.color = color;
    this.radius = radius;
    this.xVector = xVector;
    this.yVector = yVector;
    this.drawline = drawline;
    this.stoped = false;
    this.maxCollidedSize = maxCollidedSize;
    this.density = density;
    this.nextx = x;
    this.nexty = y;
    this.canBeAbsorbed = true;
    // Body this one is on a fixed orbit around (null for the root, e.g. the Sun), see isAttracting
    this.orbiting = undefined;
  }

  move(speed = 1, willMove, didMoved) {
    var x = this.x;
    var y = this.y;
    var me = this;
    this.willMove = willMove;
    this.didMoved = didMoved;

    loop.addHook(this);
  }

  hook() {
    if (!this.stoped) {
      this.clearCurrentPosition();
      var x = this.nextx;
      var y = this.nexty;
      x += this.xVector;
      y += this.yVector;
      this.willMove(x, y);
      this.updatePosition(x, y);
      this.didMoved(x, y);
    }
  }

  stop() {
    if (!this.stoped) {
      this.stoped = true;
      this.clearCurrentPosition();
      // this.moveEngine.stop();
      // delete this.moveEngine;
      loop.removeHook(this);
    }
  }

  clearCurrentPosition() {
    if (!this.drawline) {
      this.context.beginPath();
      this.context.arc(
        this.x,
        this.y,
        this.getDrawnRadius() + this.getPixelSize(),
        0,
        2 * Math.PI,
        false
      );
      this.context.fillStyle = "#263238";
      this.context.fill();
    }
    // this.context.clearRect(
    //   Math.ceil(this.x) - Math.ceil(this.radius) - 1,
    //   Math.ceil(this.y) - Math.ceil(this.radius) - 1,
    //   Math.ceil(this.radius) * 2 + 2,
    //   Math.ceil(this.radius) * 2 + 2
    // );
  }

  updatePosition(x, y) {
    this.clearCurrentPosition();
    this.x = x;
    this.y = y;
    this.nextx = x;
    this.nexty = y;
    this.draw();
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.getDrawnRadius(), 0, 2 * Math.PI, false);
    this.context.fillStyle = this.color;
    this.context.fill();
  }

  // Size of one screen pixel in world units, depends on the camera zoom
  getPixelSize() {
    return 1 / this.context.getTransform().a;
  }

  // Never smaller than a pixel, so tiny moons stay visible when zoomed out
  getDrawnRadius() {
    return Math.max(this.radius, this.getPixelSize());
  }

  getSurface() {
    return Math.PI * (this.radius * this.radius);
  }

  getVolume() {
    return (4 / 3) * Math.PI * (this.radius * this.radius * this.radius);
  }

  getMass() {
    return this.getVolume() * this.density;
    // return 10000000 /3
  }

  getDistanceFrom(obj) {
    var a = Math.abs(obj.y - this.y);
    var b = Math.abs(obj.x - this.x);
    return Math.sqrt(a * a + b * b);
  }

  getGravitationalForce(obj) {
    // Never closer than touching, otherwise overlapping objects get slingshot away
    var dist =
      Math.max(this.getDistanceFrom(obj), this.radius + obj.radius) * 1000;
    return G * ((this.getMass() * obj.getMass()) / (dist * dist));
  }

  getGravitationalAcceleration(obj) {
    return this.getGravitationalForce(obj) / obj.getMass();
  }

  isColliding(shape) {
    var distance = this.getDistanceFrom(shape);

    return distance < this.radius + shape.radius;
  }

  // getDistanceFrom(shape) {
  //   var dx = this.x - shape.x;
  //   var dy = this.y - shape.y;
  //   var distance = Math.sqrt(dx * dx + dy * dy);
  //   return distance;
  // }

  isAttracting(shape, radius) {
    // Free objects are pulled by everything
    if (shape.orbiting === undefined) return true;
    // Orbiting bodies are only pulled by what they orbit (moon -> planet -> sun), which keeps the system stable
    for (let body = shape.orbiting; body; body = body.orbiting) {
      if (body === this) return true;
    }
    return false;
  }

  collide(object) {
    var from;
    var to;
    if (
      !object.canBeAbsorbed ||
      (this.canBeAbsorbed && object.getMass() > this.getMass())
    ) {
      to = object;
      from = this;
    } else {
      to = this;
      from = object;
    }

    // Inelastic merge: mass and momentum are conserved
    var toMass = to.getMass();
    var fromMass = from.getMass();
    var mass = toMass + fromMass;
    to.xVector = (to.xVector * toMass + from.xVector * fromMass) / mass;
    to.yVector = (to.yVector * toMass + from.yVector * fromMass) / mass;

    var wantedRadius = Math.cbrt(
      ((to.getVolume() + from.getVolume()) * 3) / (4 * Math.PI)
    );
    to.radius = Math.min(wantedRadius, to.maxCollidedSize || wantedRadius);
    to.density = mass / to.getVolume();

    return from;
  }
}
