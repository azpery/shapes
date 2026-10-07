// The Milky Way, drawn on its own canvas behind the objects (thousands of stars are too many for the physics).
// Barred spiral: a bar-shaped bulge, four logarithmic arms, the Orion Spur through the Sun and a faint disc.
// Redrawn only when the camera changes; stars keep a fixed screen size and glow where they pile up.
class Galaxy {
  radius = 50000 * LIGHT_YEAR;
  // Arms are logarithmic spirals r = start * e^(pitch * angle), pitch ~12° like the Milky Way's
  armPitch = Math.tan((12 * Math.PI) / 180);
  armStart = 10000 * LIGHT_YEAR;

  constructor(camera, centerX, centerY, sunX, sunY) {
    this.camera = camera;
    this.centerX = centerX;
    this.centerY = centerY;
    this.sunAngle = Math.atan2(sunY - centerY, sunX - centerX);
    this.sunDistance = Math.hypot(sunX - centerX, sunY - centerY);

    this.canvas = document.createElement("canvas");
    this.canvas.className = "galaxy";
    this.context = this.canvas.getContext("2d");
    camera.canvas.before(this.canvas);

    this.stars = [];
    this.createBar(3000);
    this.createArms(4, 3000, 1300);
    this.createOrionSpur(500);
    this.createDisc(1500);

    camera.onChange(() => this.draw());
    this.draw();
  }

  createBar(count) {
    // Tilted ~27° from the Sun - centre line
    let tilt = this.sunAngle + (27 * Math.PI) / 180;
    for (let i = 0; i < count; i++) {
      let along = this.gaussian() * 8000 * LIGHT_YEAR;
      let across = this.gaussian() * 2000 * LIGHT_YEAR;
      this.addStar(
        Math.cos(tilt) * along - Math.sin(tilt) * across,
        Math.sin(tilt) * along + Math.cos(tilt) * across,
        ["#FFE0B2", "#FFCC80", "#FFF3E0"],
        0.5
      );
    }
  }

  // Major arms (Perseus, Scutum-Centaurus) alternate with minor ones (Sagittarius, Norma)
  createArms(armCount, starsPerMajorArm, starsPerMinorArm) {
    // One arm passes 22,000 ly from the centre on the Sun's side (Sagittarius arm),
    // the next one ~30,000 ly (Perseus arm): the Sun sits between them
    let firstArmAngle =
      this.sunAngle - Math.log((22000 * LIGHT_YEAR) / this.armStart) / this.armPitch;
    let maxAngle = Math.log(this.radius / this.armStart) / this.armPitch;
    for (let arm = 0; arm < armCount; arm++) {
      let armAngle = firstArmAngle + (arm * 2 * Math.PI) / armCount;
      let starCount = arm % 2 ? starsPerMajorArm : starsPerMinorArm;
      for (let i = 0; i < starCount; i++) {
        let angle = Math.random() * maxAngle;
        let distance = this.armStart * Math.exp(this.armPitch * angle);
        let spread = 500 * LIGHT_YEAR + distance * 0.025;
        this.addStar(
          Math.cos(armAngle + angle) * distance + this.gaussian() * spread,
          Math.sin(armAngle + angle) * distance + this.gaussian() * spread,
          ["#E3F2FD", "#BBDEFB", "#FFFFFF", "#F8BBD0"],
          0.7
        );
      }
    }
  }

  // Small arm segment the Sun is in
  createOrionSpur(count) {
    for (let i = 0; i < count; i++) {
      let angle = this.sunAngle + (Math.random() - 0.5) * 0.5;
      let distance = this.sunDistance + this.gaussian() * 800 * LIGHT_YEAR + (angle - this.sunAngle) * 6000 * LIGHT_YEAR;
      this.addStar(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        ["#E3F2FD", "#FFFFFF"],
        0.35
      );
    }
  }

  createDisc(count) {
    for (let i = 0; i < count; i++) {
      // Exponential disc: denser towards the centre
      let distance = Math.min(-Math.log(1 - Math.random()) * 12000 * LIGHT_YEAR, this.radius);
      let angle = Math.random() * 2 * Math.PI;
      this.addStar(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        ["#CFD8DC", "#FFFFFF", "#FFE0B2"],
        0.2
      );
    }
  }

  addStar(x, y, colors, alpha) {
    this.stars.push({
      x: this.centerX + x,
      y: this.centerY + y,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: alpha * (0.5 + Math.random() * 0.5),
      size: Math.random() < 0.9 ? 1 : 2,
    });
  }

  // Standard normal distribution (Box-Muller)
  gaussian() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  }

  draw() {
    let width = this.camera.canvas.width;
    let height = this.camera.canvas.height;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.context.globalCompositeOperation = "source-over";
    this.context.globalAlpha = 1;
    this.context.fillStyle = "#263238";
    this.context.fillRect(0, 0, width, height);

    // Overlapping stars add up their light: the bulge and arms glow
    this.context.globalCompositeOperation = "lighter";
    this.stars.forEach((star) => {
      // Converted here (in double precision) rather than through a canvas transform: coordinates are huge
      let point = this.camera.worldToCanvas(star.x, star.y);
      if (point.x < -2 || point.y < -2 || point.x > width || point.y > height) return;
      this.context.globalAlpha = star.alpha;
      this.context.fillStyle = star.color;
      this.context.fillRect(point.x, point.y, star.size, star.size);
    });
  }

  // World area containing the whole galaxy, for Camera.fitArea
  getArea() {
    return {
      x: this.centerX - this.radius,
      y: this.centerY - this.radius,
      width: 2 * this.radius,
      height: 2 * this.radius,
    };
  }
}
