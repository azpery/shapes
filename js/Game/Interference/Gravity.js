class Gravity {
  objects = [];
  strength = 6

  constructor(objects,strength, radius) {
    this.objects = objects;
    this.strength = strength;
    this.radius = radius
  }

  update(object){
    if (!object || object.stoped) return;
    // Orbiting bodies are only pulled by what they orbit (see Comet.isAttracting), no need to go through every object
    let attractors = object.orbiting === undefined ? this.objects : object.getOrbitedBodies();
    attractors.forEach((obj) => {
        if (obj.id != object.id && !obj.stoped && obj.isAttracting(object, this.radius)) {
            // The pull only depends on the attractor's mass
            var acceleration = obj.getGravitationalAcceleration(object) * this.strength;
            var direction = Math.atan2(obj.x - object.x, obj.y - object.y);
            object.xVector += Math.sin(direction) * acceleration;
            object.yVector += Math.cos(direction) * acceleration;
        }
      });
  }
}
