class Physic {
  objects = [];
  interferences = [];

  constructor(width, height, option) {
    this.width = width;
    this.height = height;
    this.option = option;
    this.interferences.push(new Collider(this.objects));
  }

  addObject(object = new Shape()) {
    this.objects.push(object);
  }

  callInterferences(object){
      this.interferences.forEach(interference => {
          interference.update(object);
      })
  }

  move(object) {
    object.move(
      this.option.speed,
      function (x, y) {
        this.callInterferences(object);
        if (!object.stoped && (x > this.width || y > this.height || x < 0 || y < 0) ){
          if (this.option.bounce) {
            if (x > this.width || x < 0) object.xVector = -object.xVector;
            if (y > this.height || y < 0) object.yVector = -object.yVector;
          } else {
            object.stop();
            ArrayTool.getInstance().removeObject(this.objects, object)
          }
        }
      }.bind(this)
    );
  }
}
