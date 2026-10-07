// Shows the name of an object in an html label over the canvas: the one under the mouse,
// or the one tapped / clicked (followed until a tap on empty space, there is no hover on touch screens)
class ObjectTooltip {
  // Extra screen px around an object that still counts as pointing at it (moons are tiny)
  tolerance = 4;
  // Fingers are less precise
  tapTolerance = 14;

  constructor(camera, objects) {
    this.camera = camera;
    this.objects = objects;
    this.mouse = null;
    this.selected = null;

    this.element = document.createElement("div");
    this.element.className = "objectTooltip";
    document.body.append(this.element);

    let canvas = camera.canvas;
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") this.mouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerleave", () => (this.mouse = null));
    camera.onTap((x, y) => {
      this.selected = this.findObjectAt(x, y, this.tapTolerance);
    });

    // Refreshed every frame: objects move under a still pointer, and the label follows the view
    let frame = () => {
      this.update();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  update() {
    if (this.selected && this.selected.stoped) this.selected = null;
    let shown = (this.mouse && this.findObjectAt(this.mouse.x, this.mouse.y, this.tolerance)) || this.selected;
    if (!shown) {
      this.element.style.display = "none";
      return;
    }
    let corner = this.camera.worldToScreen(shown.x + shown.radius, shown.y - shown.radius);
    this.element.textContent = shown.name;
    this.element.style.display = "block";
    this.element.style.left = window.scrollX + corner.x + 6 + "px";
    this.element.style.top = window.scrollY + corner.y - 6 + "px";
  }

  // clientX, clientY: screen position; tolerance in screen px
  findObjectAt(clientX, clientY, tolerance) {
    let world = this.camera.screenToWorld(clientX, clientY);
    let worldTolerance = (tolerance * this.camera.getCssScale()) / this.camera.zoom;
    let closest = null;
    let closestDistance = Infinity;
    this.objects.forEach((obj) => {
      if (!obj.name || obj.stoped) return;
      // Distance to the object's edge
      let distance = Math.hypot(obj.x - world.x, obj.y - world.y) - obj.radius;
      if (distance < worldTolerance && distance < closestDistance) {
        closest = obj;
        closestDistance = distance;
      }
    });
    return closest;
  }
}
