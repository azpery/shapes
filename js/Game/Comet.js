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
    maxCollidedSize
  ) {
    super(x, y, radius, 0, context);
    this.color = color;
    this.radius = radius;
    this.xVector = xVector;
    this.yVector = yVector;
    this.drawline = drawline;
    this.stoped = false;
    this.maxCollidedSize = maxCollidedSize;
  }

  move(speed = 1, didMoved) {
    var x = this.x;
    var y = this.y;
    var me = this;
    this.moveEngine = new DelayedFor(
      0,
      100000000000000,
      1,
      function () {
        if (!me.stoped) {
          x += me.xVector;
          y += me.yVector;
          me.updatePosition(x, y);
          didMoved(x, y);
        }
      },
      37 / speed
    );
    this.moveEngine.go();
  }

  stop() {
    if (!this.stoped) {
      this.stoped = true;
      this.clearCurrentPosition();
      this.moveEngine.stop();
      delete this.moveEngine;
    }
  }

  clearCurrentPosition() {
    if (!this.drawline)
      this.context.clearRect(
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
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

  isColliding(shape) {
    var dx = this.x - shape.x;
    var dy = this.y - shape.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.radius + shape.radius;
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

    var wantedRadius = to.radius + from.radius;
    to.radius =
      wantedRadius > to.maxCollidedSize ? to.maxCollidedSize : wantedRadius;

    var ratio = from.radius / to.radius;
    if (
      (to.xVector > 0 && from.xVector < 0) ||
      (to.xVector < 0 && from.xVector > 0)
    )
      to.xVector += Math.floor(from.xVector * ratio);
    if (
      (to.yVector > 0 && from.yVector < 0) ||
      (to.yVector < 0 && from.yVector > 0)
    )
      to.yVector += Math.floor(from.yVector * ratio);

    return from;
  }
}
