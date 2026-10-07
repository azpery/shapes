// Burst of debris at the impact point of a collision, drawn by the Renderer
class Explosion {
  // ms
  duration = 600;

  constructor(from, to) {
    this.to = to;
    this.start = performance.now();

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
      var distance = 5 + Math.random() * 15;
      this.particles.push({
        x: impactX,
        y: impactY,
        xTravel: Math.cos(angle) * distance,
        yTravel: Math.sin(angle) * distance,
        radius: Math.max(0.5, from.radius * (0.2 + Math.random() * 0.3)),
        color: colors[i % colors.length],
      });
    }
  }

  isOver(time) {
    return time - this.start > this.duration;
  }

  draw(context, time) {
    var progress = Math.min(1, Math.max(0, (time - this.start) / this.duration));
    // Fast at first, then slowing down
    var travelled = 1 - Math.pow(1 - progress, 3);
    var fade = 1 - progress;
    this.particles.forEach((particle) => {
      // Relative to the bigger object, so the burst follows it
      context.beginPath();
      context.arc(
        this.to.x + particle.x + particle.xTravel * travelled,
        this.to.y + particle.y + particle.yTravel * travelled,
        particle.radius * fade,
        0,
        2 * Math.PI,
        false
      );
      context.fillStyle = particle.color;
      context.fill();
    });
  }
}
