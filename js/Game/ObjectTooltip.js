// Shows the name of the object under the mouse, in an html label over the canvas
class ObjectTooltip {
  // Extra screen px around an object that still counts as hovering it (moons are tiny)
  tolerance = 4;

  constructor(camera, objects) {
    this.camera = camera;
    this.objects = objects;
    this.mouse = null;

    this.element = document.createElement("div");
    this.element.className = "objectTooltip";
    document.body.append(this.element);

    let canvas = camera.canvas;
    canvas.addEventListener("mousemove", (e) => {
      this.mouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("mouseleave", () => (this.mouse = null));

    // Refreshed every tick, objects move under a still mouse
    loop.addHook(() => this.update());
  }

  update() {
    let hovered = null;
    if (this.mouse) {
      let world = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
      hovered = this.findObjectAt(world.x, world.y);
    }
    if (!hovered) {
      this.element.style.display = "none";
      return;
    }
    let corner = this.camera.worldToScreen(
      hovered.x + hovered.radius,
      hovered.y - hovered.radius
    );
    this.element.textContent = hovered.name;
    this.element.style.display = "block";
    this.element.style.left = window.scrollX + corner.x + 6 + "px";
    this.element.style.top = window.scrollY + corner.y - 6 + "px";
  }

  findObjectAt(x, y) {
    let tolerance = this.tolerance / this.camera.zoom;
    let closest = null;
    let closestDistance = Infinity;
    this.objects.forEach((obj) => {
      if (!obj.name || obj.stoped) return;
      // Distance to the object's edge
      let distance = Math.hypot(obj.x - x, obj.y - y) - obj.radius;
      if (distance < tolerance && distance < closestDistance) {
        closest = obj;
        closestDistance = distance;
      }
    });
    return closest;
  }
}
