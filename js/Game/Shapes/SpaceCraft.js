class SpaceCraft extends ControledComet {
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
    density = 1,
    option,
    comets
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
      option.density,
      option,
      comets
    );
    this.w = 20;
    this.h = 30;
    this.angleInDeg = 0;
  }

  clearCurrentPosition() {
    if (!this.drawline) {
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.h + 1, 0, 2 * Math.PI, false);
      this.context.fillStyle = "#263238";
      this.context.fill();
    }
  }

  draw() {
    // this.context.rect(this.x, this.y, this.width, this.height);
    // this.context.stroke();
    var img = new Image();
    var me = this;
    // img.onload = function () {
    //   me.context.drawImage(img, 0, 0, 776, 994, me.x, me.y, me.w, me.h);
    // };

    img.src = "./assets/spacecraft.png";

    this.rotateAndPaintImage(img);
  }

  rotateAndPaintImage(image, axisX, axisY) {
    var TO_RADIANS = Math.PI / 180;
    const angleInRad = this.angleInDeg * TO_RADIANS;
    this.context.translate(this.x, this.y);
    this.context.rotate(angleInRad);
    this.context.drawImage(image, -this.w / 2, -this.h / 2, this.w, this.h);

    this.context.rotate(-angleInRad);
    this.context.translate(-this.x, -this.y);
  }

  getDistanceFrom(obj) {
    if (this.y - obj.y < 0 && this.x - obj.x < 0) {
      var a = Math.abs(obj.y - this.y);
      var b = Math.abs(obj.x - this.x);
    } else if (this.y - obj.y < 0 && this.x - obj.x > 0) {
      var a = Math.abs(obj.y - this.y);
      var b = Math.abs(obj.x - (this.x + this.w));
    } else if (this.y - obj.y > 0 && this.x - obj.x < 0) {
      var a = Math.abs(obj.y - (this.y + this.h));
      var b = Math.abs(obj.x - this.x);
    } else if (this.y - obj.y > 0 && this.x - obj.x > 0) {
      var a = Math.abs(obj.y - (this.y + this.h));
      var b = Math.abs(obj.x - (this.x + this.w));
    }
    return Math.sqrt(a * a + b * b);
  }

  isColliding(shape) {
    var distance = this.getDistanceFrom(shape);

    return distance < this.h + shape.radius;
  }

  willMoveComet(x, y) {
    let speed = 0.1;
    if (this.movingUp) {
      var TO_RADIANS = Math.PI / 180;
      this.yVector -= Math.sin((this.angleInDeg + 90) * TO_RADIANS) * speed;
      this.xVector -= Math.cos((this.angleInDeg + 90) * TO_RADIANS) * speed;
    }
    if (this.movingDown) {
      var TO_RADIANS = Math.PI / 180;
      this.yVector += Math.sin((this.angleInDeg + 90) * TO_RADIANS) * speed;
      this.xVector += Math.cos((this.angleInDeg + 90) * TO_RADIANS) * speed;
    }
    if (this.movingLeft) this.angleInDeg -= 5;
    if (this.movingRight) this.angleInDeg += 5;
    this.option.updateFrame(
      x - this.option.rects.w / 2,
      y - this.option.rects.h / 2
    );
    this.comets.forEach((comet) => {
      comet.nextx -= this.xVector;
      comet.nexty -= this.yVector;
    });
  }
}
