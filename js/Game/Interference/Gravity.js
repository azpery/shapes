class Gravity {
  objects = [];
  strength = 6

  constructor(objects,strength, radius) {
    this.objects = objects;
    this.strength = strength;
    this.radius = radius
  }

  update(object){
    this.objects.forEach((obj) => {
        if (object && obj.id != object.id && obj.isAttracting(object, this.radius) && obj.radius > object.radius) {
            var distance = obj.getDistanceFrom(object);
            if(object.x > obj.x){
                // object.x -= 1 ;
                //if(Math.abs(object.xVector) < 10)
                object.xVector -= this.strength / distance
            }else if(object.x < obj.x){
                // object.x += 1;
                //if(Math.abs(object.xVector) < 2)
                object.xVector += this.strength / distance
            }

            if(object.y > obj.y){
                // object.y -= 1;
                //if(Math.abs(object.yVector) < 10)
                object.yVector -= this.strength / distance
            }else if(object.x < obj.x){
                // object.y += 1;
                //if(Math.abs(object.yVector) < 10)
                object.yVector += this.strength / distance
            }
        }
      });
  }
}
