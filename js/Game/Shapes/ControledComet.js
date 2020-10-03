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
  speedUp = this.getSpeedPlus();
  speedDown = this.getSpeedPlus();
  speedLeft = this.getSpeedPlus(); 
  speedRight = this.getSpeedPlus();

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
    if (this.movingUp){ this.yVector -= this.speedUp; this.speedUp += this.getSpeedPlus();this.speedDown -= this.speedDown > this.getSpeedPlus() ? this.getSpeedPlus():0;};
    if (this.movingDown){ this.yVector += this.speedDown; this.speedDown += this.getSpeedPlus();this.speedUp -= this.speedUp > this.getSpeedPlus() ? this.getSpeedPlus():0;}
    if (this.movingLeft){ this.xVector -= this.speedLeft; this.speedLeft += this.getSpeedPlus();this.speedRight -= this.speedRight > this.getSpeedPlus() ? this.getSpeedPlus():0;}
    if (this.movingRight) {this.xVector += this.speedRight; this.speedRight += this.getSpeedPlus();this.speedLeft -= this.speedLeft > this.getSpeedPlus() ? this.getSpeedPlus():0;}
  }

  getSpeedPlus() {
    return 0.0003;
  }

  didMove(x, y) {}
}
