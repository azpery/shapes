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
  }

  move(speed = 1, willMove, didMoved) {
    var x = this.x;
    var y = this.y;
    var me = this;
    this.willMove = willMove;
    this.didMoved = didMoved;
    // this.moveEngine = new DelayedFor(
    //   0,
    //   100000000000000,
    //   1,
    //   function () {
    //     if (!me.stoped) {
    //       x += me.xVector;
    //       y += me.yVector;
    //       willMove(x, y);
    //       me.updatePosition(x, y);
    //       didMoved(x, y);
    //     }
    //   },
    //   40 / speed
    // );
    // this.moveEngine.go();

    loop.addHook(this);
  }

  hook() {
    if (!this.stoped) {
      var x = this.x;
      var y = this.y;
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
      loop.removeHook(this.hook);
    }
  }

  clearCurrentPosition() {
    if (!this.drawline) {
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius + 1, 0, 2 * Math.PI, false);
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
    this.draw();
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = this.color;
    this.context.fill();
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
    var dist = this.getDistanceFrom(obj) * 1000;
    return G * ((this.getMass() * obj.getMass()) / (dist * dist));
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
    // var distance = this.getDistanceFrom(shape);

    return true;
  }

  collide(object) {
    var from;
    var to;
    if (this.radius > object.radius) {
      to = this;
      from = object;
    } else {
      to = object;
      from = this;
    }

    var wantedRadius = Math.sqrt(
      (to.getSurface() + from.getSurface()) / Math.PI
    );
    to.radius =
      wantedRadius > this.maxCollidedSize ? this.maxCollidedSize : wantedRadius;

    var ratio = from.radius / to.radius;

    to.density = (from.density + to.density) / 2;
    // if (
    //   (to.xVector > 0 && from.xVector < 0) ||
    //   (to.xVector < 0 && from.xVector > 0)
    // )
    //   to.xVector += Math.floor(from.xVector * ratio);
    // if (
    //   (to.yVector > 0 && from.yVector < 0) ||
    //   (to.yVector < 0 && from.yVector > 0)
    // )
    //   to.yVector += Math.floor(from.yVector * ratio);

    return from;
  }
}
