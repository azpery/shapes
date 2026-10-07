class Collider {
  objects = [];

  constructor(objects) {
    this.objects = objects;
  }

  collide(object) {
    var didcollide = false;
    // Iterate over a copy: absorbed objects are removed from the list
    this.objects.slice().forEach((obj) => {
      if (
        object &&
        !object.stoped &&
        !obj.stoped &&
        obj.id != object.id &&
        obj.isColliding(object)
      ) {
        didcollide = true;
        var collidedObject = obj.collide(object);
        collidedObject.stop();
        ArrayTool.getInstance().removeObject(this.objects, collidedObject);
      }
    });
    return didcollide;
  }

  update(object) {
    this.collide(object);
  }
}
