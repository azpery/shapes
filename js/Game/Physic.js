class Physic {
  objects = [];

  constructor(width, height, option) {
    this.width = width;
    this.height = height;
    this.option = option;
  }

  addObject(object = new Shape()) {
    this.objects.push(object);
  }

  removeObject(object) {
    this.objects = this.objects.filter((obj) => {
      return object.id != obj.id;
    });
  }

  collide(object) {
    var didcollide = false
    this.objects.forEach((obj) => {
      if (object && obj.id != object.id && obj.isColliding(object)) {
        didcollide = true
        var collidedObject = obj.collide(object);
        collidedObject.stop();
        this.removeObject(collidedObject);
      }
    });
    return didcollide
  }

  move(object) {
    object.move(
      this.option.speed,
      function (x, y) {
        var collided = this.collide(object);
        if (!collided && (x > this.width || y > this.height || x < 0 || y < 0) ){
          if (this.option.bounce) {
            if (x > this.width || x < 0) object.xVector = -object.xVector;
            if (y > this.height || y < 0) object.yVector = -object.yVector;
          } else {
            object.stop();
            this.removeObject(object);
          }
        }
      }.bind(this)
    );
  }
}
