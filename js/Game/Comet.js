class Comet extends Shape {
  constructor(
    x,
    y,
    radius,
    context,
    color,
    xVector,
    yVector,
    drawline = false
  ) {
    super(x, y, radius, 0, context);
    this.color = color;
    this.radius = radius;
    this.xVector = xVector;
    this.yVector = yVector;
    this.drawline = drawline;
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
        x += me.xVector;
        y += me.yVector;
        me.updatePosition(x, y);
        didMoved(x, y);
      },
      37 / speed
    );
    this.moveEngine.go();
  }

  stop(){
      this.clearCurrentPosition();
      this.moveEngine.stop();
      delete this.moveEngine
  }

  clearCurrentPosition() {
    if (!this.drawline)
      this.context.clearRect(
        this.x - this.radius,
        this.y - this.radius,
        this.width * 2,
        this.width * 2
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
    this.context.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
    this.context.fillStyle = this.color;
    this.context.fill();
  }
}
