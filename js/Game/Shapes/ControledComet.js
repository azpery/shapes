class ControledComet extends Comet {
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
    super(
      x,
      y,
      radius,
      context,
      color,
      xVector,
      yVector,
      drawline,
      maxCollidedSize,
      density
    );
    this.control();
  }

  LEFT = 37;
  UP = 38;
  RIGHT = 39;
  DOWN = 40;
  movingUp = false;
  movingDown = false;
  movingLeft = false;
  movingRight = false;

  control() {
    document.onkeydown = (e) => {
      let keyCode = e.keyCode;
      this.movingUp = keyCode == this.UP;
      this.movingDown = keyCode == this.DOWN;
      this.movingLeft = keyCode == this.LEFT;
      this.movingRight = keyCode == this.RIGHT;
    };
    document.onkeyup = (e) => {
      let keyCode = e.keyCode;
      this.movingUp = keyCode == this.UP ? false : this.movingUp;
      this.movingDown = keyCode == this.DOWN ? false : this.movingDown;
      this.movingLeft = keyCode == this.LEFT ? false : this.movingLeft;
      this.movingRight = keyCode == this.RIGHT ? false : this.movingRight;
    };
  }

  move(speed, willMove, didMove) {
    super.move(
      0,
      ((x, y) => {
        willMove(x, y);
        this.willMove(x, y);
      }).bind(this),
      didMove
    );
  }

  willMove(x, y) {
    let speed = 0.01;
    if (this.movingUp) this.yVector -= speed;
    if (this.movingDown) this.yVector += speed;
    if (this.movingLeft) this.xVector -= speed;
    if (this.movingRight) this.xVector += speed;
  }

  didMove(x, y) {}
}
