// Redraws the whole frame on every animation frame, independently from the physics loop:
// clears the canvas, then draws the objects and the collision explosions.
class Renderer {
  // camera: optional, objects are drawn in world coordinates without it.
  // keepTrails: never clear the canvas, moving objects leave a trail.
  // loop: optional physics loop, to draw objects smoothly between its steps
  constructor(context, objects, camera = null, keepTrails = false, loop = null) {
    this.context = context;
    this.objects = objects;
    this.camera = camera;
    this.keepTrails = keepTrails;
    this.loop = loop;
    if (loop) {
      loop.onAdvance(() => {
        this.objects.forEach((object) => {
          object.previousX = object.x;
          object.previousY = object.y;
        });
      });
    }
    this.explosions = [];
    this.layers = [];
    this.overlays = [];
    this.updaters = [];
    // Positions of the objects drawn between two steps, while they are swapped
    this.physicsPositions = new Map();
    // How far between the previous and current positions the last frame was drawn
    this.progress = 1;

    document.addEventListener("objectsCollided", (e) => {
      this.explosions.push(new Explosion(e.detail.absorbed, e.detail.survivor));
    });

    let frame = (time) => {
      this.draw(time);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Extra drawing, under the objects (or above them), called with the context in world coordinates
  addLayer(draw, above = false) {
    (above ? this.overlays : this.layers).push(draw);
  }

  // Called on every frame before drawing, with the objects at their drawn positions
  addUpdater(update) {
    this.updaters.push(update);
  }

  draw(time) {
    // Physics steps are slower than frames (much slower below ×1): objects are drawn part of the way
    // between their previous and current positions. Their positions are swapped for the drawing and
    // restored right after, nothing else runs in between
    let progress = this.loop ? this.loop.getProgress(time) : 1;
    this.progress = progress;
    if (progress < 1) {
      this.objects.forEach((object) => {
        if (object.previousX === undefined) return;
        this.physicsPositions.set(object, { x: object.x, y: object.y });
        object.x = object.previousX + (object.x - object.previousX) * progress;
        object.y = object.previousY + (object.y - object.previousY) * progress;
      });
    }
    this.updaters.forEach((update) => update(time));
    this.drawFrame(time);
    this.physicsPositions.forEach((position, object) => {
      object.x = position.x;
      object.y = position.y;
    });
    this.physicsPositions.clear();
  }

  // Real position of an object, also while it is drawn between two steps
  getPhysicsPosition(object) {
    return this.physicsPositions.get(object) || { x: object.x, y: object.y };
  }

  // Where an object is in the last drawn frame, for things placed over it outside the drawing (labels)
  getDrawnPosition(object) {
    // During the drawing, its position is already the drawn one
    if (this.physicsPositions.has(object) || object.previousX === undefined || this.progress >= 1) {
      return { x: object.x, y: object.y };
    }
    return {
      x: object.previousX + (object.x - object.previousX) * this.progress,
      y: object.previousY + (object.y - object.previousY) * this.progress,
    };
  }

  drawFrame(time) {
    let context = this.context;
    let canvas = context.canvas;
    context.setTransform(1, 0, 0, 1, 0, 0);
    if (!this.keepTrails) context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.camera) this.camera.applyTransform(context);
    let zoom = context.getTransform().a;
    this.layers.forEach((layer) => layer(context, zoom));

    // Satellites are before their parent in the list (physics order): reversed, stars are drawn
    // first, then planets, then moons, so moons pass over the planets' rings
    for (let i = this.objects.length - 1; i >= 0; i--) {
      let object = this.objects[i];
      if (!object.stoped && this.isVisible(object, zoom)) object.draw(time);
    }

    this.explosions = this.explosions.filter((explosion) => !explosion.isOver(time));
    this.explosions.forEach((explosion) => explosion.draw(context, time));
    this.overlays.forEach((overlay) => overlay(context, zoom));
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
