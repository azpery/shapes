// Shows the name of an object in an html label over the canvas: the one under the mouse,
// or the one tapped / clicked (followed until a tap on empty space, there is no hover on touch screens)
class ObjectTooltip {
  // Extra screen px around an object that still counts as pointing at it (moons are tiny)
  tolerance = 4;
  // Fingers are less precise
  tapTolerance = 14;

  // renderer: optional, to stick to the objects where they are drawn (between two physics steps)
  constructor(camera, objects, renderer = null) {
    this.camera = camera;
    this.objects = objects;
    this.renderer = renderer;
    this.mouse = null;
    this.selected = null;
    this.selectListeners = [];
    // Object currently labelled: hovered, or else selected
    this.shown = null;
    this.details = [];

    this.element = document.createElement("div");
    this.element.className = "objectTooltip";
    document.body.append(this.element);

    let canvas = camera.canvas;
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") this.mouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerleave", () => (this.mouse = null));
    camera.onTap((x, y) => this.select(this.findObjectAt(x, y, this.tapTolerance)));

    // Refreshed every frame: objects move under a still pointer, and the label follows the view
    let frame = () => {
      this.update();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // Called with the selected object, or null when nothing is selected any more
  onSelect(listener) {
    this.selectListeners.push(listener);
  }

  // Extra line under the name: detail(object) returns a text, or null for none
  addDetail(detail) {
    this.details.push(detail);
  }

  select(object) {
    this.selected = object;
    this.selectListeners.forEach((listener) => listener(object));
  }

  update() {
    // Absorbed in a collision
    if (this.selected && this.selected.stoped) this.select(null);
    let shown = (this.mouse && this.findObjectAt(this.mouse.x, this.mouse.y, this.tolerance)) || this.selected;
    this.shown = shown;
    if (!shown) {
      this.element.style.display = "none";
      return;
    }
    let position = this.getPosition(shown);
    let corner = this.camera.worldToScreen(position.x + shown.radius, position.y - shown.radius);
    let text = [shown.name, ...this.details.map((detail) => detail(shown))]
      .filter((line) => line)
      .join("\n");
    if (this.element.textContent !== text) this.element.textContent = text;
    this.element.style.display = "block";
    this.element.style.left = window.scrollX + corner.x + 6 + "px";
    this.element.style.top = window.scrollY + corner.y - 6 + "px";
  }

  getPosition(object) {
    return this.renderer ? this.renderer.getDrawnPosition(object) : object;
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
      let position = this.getPosition(obj);
      let distance = Math.hypot(position.x - world.x, position.y - world.y) - obj.radius;
      if (distance < worldTolerance && distance < closestDistance) {
        closest = obj;
        closestDistance = distance;
      }
    });
    return closest;
  }
}
