class Collider {
  objects = [];

  constructor(objects) {
    this.objects = objects;
  }

  collide(object) {
    var didcollide = false;
    this.objects.forEach((obj) => {
      if (object && obj.id != object.id && obj.isColliding(object)) {
        didcollide = true;
        var collidedObject = obj.collide(object);
        if (collidedObject !== undefined) {
          collidedObject.stop();
          ArrayTool.getInstance().removeObject(this.objects, collidedObject);
        }
      }
    });
    return didcollide;
  }

  update(object) {
    this.collide(object);
  }
}
