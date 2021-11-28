class StickyCollider extends Collider {
  collide(object) {
    var didcollide = false;
    this.objects.forEach((obj) => {
      if (object && obj.id != object.id && obj.isColliding(object)) {
        didcollide = true;
        // var collidedObject = obj.collide(object);
        obj.xVector = 0;
        obj.yVector = 0;
        object.xVector = 0;
        object.yVector = 0;
        // collidedObject.stop();
        // ArrayTool.getInstance().removeObject(this.objects, collidedObject)
      }
    });
    return didcollide;
  }
}
