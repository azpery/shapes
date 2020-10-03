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
            var gravitationalForce = obj.getGravitationalForce(object);
            var direction = Math.atan2(obj.x - object.x, obj.y - object.y);
            var attractionX = Math.sin(direction) * gravitationalForce;
            var attractionY = Math.cos(direction) * gravitationalForce;
            object.xVector += Math.abs(attractionX) < 100 ? attractionX : 0;
            object.yVector += Math.abs(attractionY) < 100 ? attractionY : 0;
            // if(object.x > obj.x){
            //     // object.x -= 1 ;
            //     //if(Math.abs(object.xVector) < 10)
            //     object.xVector -= gravitationalForce
            // }else if(object.x < obj.x){
            //     // object.x += 1;
            //     //if(Math.abs(object.xVector) < 2)
            //     object.xVector += gravitationalForce
            // }

            // if(object.y > obj.y){
            //     // object.y -= 1;
            //     //if(Math.abs(object.yVector) < 10)
            //     object.yVector -= gravitationalForce
            // }else if(object.x < obj.x){
            //     // object.y += 1;
            //     //if(Math.abs(object.yVector) < 10)
            //     object.yVector += gravitationalForce
            // }
        }
      });
  }
}
