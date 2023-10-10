class Shape {
  constructor(x, y, width, height, context) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.context = context;
    this.id = new Random(0, 100000000000000000000000000000000000, 0.1).get();
  }

  draw() {
    this.context.rect(this.x, this.y, this.width, this.height);
    this.context.stroke();
  }
}
