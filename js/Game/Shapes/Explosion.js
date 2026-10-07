class Explosion {
  constructor(from, to, life = 20) {
    this.to = to;
    this.context = to.context;
    this.life = life;
    this.age = 0;

    // Impact point on the surface of the bigger object, facing the absorbed one
    var direction = Math.atan2(from.y - to.y, from.x - to.x);
    var impactX = Math.cos(direction) * to.radius;
    var impactY = Math.sin(direction) * to.radius;

    var colors = [from.color, "#FFD54F", "#FF9800", "#FFFFFF"];
    var count = Math.min(6 + Math.round(from.radius * 4), 30);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      // Sprayed outward, in a half-circle facing away from the bigger object
      var angle = direction + (Math.random() - 0.5) * Math.PI;
      var speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x: impactX,
        y: impactY,
        xVector: Math.cos(angle) * speed,
        yVector: Math.sin(angle) * speed,
        radius: Math.max(0.5, from.radius * (0.2 + Math.random() * 0.3)),
        color: colors[i % colors.length],
      });
    }
  }

  start() {
    // Drawn before the comets so they stay on top of the debris
    loop.prependHook(this);
  }

  hook() {
    this.clear();
    if (this.age >= this.life) {
      loop.removeHook(this);
      return;
    }
    var fade = 1 - this.age / this.life;
    this.particles.forEach((particle) => {
      particle.x += particle.xVector;
      particle.y += particle.yVector;
      particle.xVector *= 0.9;
      particle.yVector *= 0.9;
      // Remember where it was drawn: the bigger object (or the camera) moves before the next clear
      particle.drawnX = this.to.x + particle.x;
      particle.drawnY = this.to.y + particle.y;
      particle.drawnRadius = particle.radius * fade;
      this.drawParticle(
        particle.drawnX,
        particle.drawnY,
        particle.drawnRadius,
        particle.color
      );
    });
    this.age++;
  }

  clear() {
    this.particles.forEach((particle) => {
      if (particle.drawnX === undefined) return;
      this.drawParticle(
        particle.drawnX,
        particle.drawnY,
        particle.drawnRadius + 1,
        "#263238"
      );
    });
  }

  drawParticle(x, y, radius, color) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = color;
    this.context.fill();
  }
}
