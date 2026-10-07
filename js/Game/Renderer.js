// Redraws the whole frame on every animation frame, independently from the physics loop:
// clears the canvas, then draws the objects and the collision explosions.
class Renderer {
  // camera: optional, objects are drawn in world coordinates without it.
  // keepTrails: never clear the canvas, moving objects leave a trail
  constructor(context, objects, camera = null, keepTrails = false) {
    this.context = context;
    this.objects = objects;
    this.camera = camera;
    this.keepTrails = keepTrails;
    this.explosions = [];

    document.addEventListener("objectsCollided", (e) => {
      this.explosions.push(new Explosion(e.detail.absorbed, e.detail.survivor));
    });

    let frame = (time) => {
      this.draw(time);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  draw(time) {
    let context = this.context;
    let canvas = context.canvas;
    context.setTransform(1, 0, 0, 1, 0, 0);
    if (!this.keepTrails) context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.camera) this.camera.applyTransform(context);
    let zoom = context.getTransform().a;

    // Satellites are before their parent in the list (physics order): reversed, stars are drawn
    // first, then planets, then moons, so moons pass over the planets' rings
    for (let i = this.objects.length - 1; i >= 0; i--) {
      let object = this.objects[i];
      if (!object.stoped && this.isVisible(object, zoom)) object.draw(time);
    }

    this.explosions = this.explosions.filter((explosion) => !explosion.isOver(time));
    this.explosions.forEach((explosion) => explosion.draw(context, time));
  }

  isVisible(object, zoom) {
    if (!this.camera) return true;
    let extent = BodyPainter.getExtent(object) * zoom + 2;
    let point = this.camera.worldToCanvas(object.x, object.y);
    let canvas = this.context.canvas;
    return (
      point.x > -extent &&
      point.y > -extent &&
      point.x < canvas.width + extent &&
      point.y < canvas.height + extent
    );
  }
}
