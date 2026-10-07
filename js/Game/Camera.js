// Fills the window with the canvas and lets the user zoom (wheel), pan (drag) and reset (double click)
class Camera {
  // Low enough to see the whole galaxy
  minZoom = 0.000005;
  maxZoom = 60;

  // objects: redrawn right away when the view changes
  constructor(context, worldWidth, worldHeight, objects = []) {
    this.context = context;
    this.objects = objects;
    this.canvas = context.canvas;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.dragging = null;
    this.listeners = [];

    this.resize();
    this.reset();

    window.addEventListener("resize", () => {
      this.resize();
      this.apply();
    });
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
      },
      { passive: false }
    );
    this.canvas.addEventListener("mousedown", (e) => {
      this.dragging = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.dragging) return;
      let scale = this.getCssScale();
      this.centerX -= (e.clientX - this.dragging.x) * scale / this.zoom;
      this.centerY -= (e.clientY - this.dragging.y) * scale / this.zoom;
      this.dragging = { x: e.clientX, y: e.clientY };
      this.apply();
    });
    window.addEventListener("mouseup", () => {
      this.dragging = null;
      this.canvas.style.cursor = "grab";
    });
    this.canvas.addEventListener("dblclick", () => this.reset());
    this.canvas.style.cursor = "grab";
  }

  resize() {
    // Resizing a canvas resets its transform, apply() must be called after
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Fits the whole world in the window
  reset() {
    this.fitArea(0, 0, this.worldWidth, this.worldHeight);
  }

  fitArea(x, y, width, height) {
    this.zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, Math.min(this.canvas.width / width, this.canvas.height / height))
    );
    this.centerX = x + width / 2;
    this.centerY = y + height / 2;
    this.apply();
  }

  // Called after every view change
  onChange(listener) {
    this.listeners.push(listener);
  }

  zoomAt(clientX, clientY, factor) {
    // Keep the world point under the cursor in place
    let before = this.screenToWorld(clientX, clientY);
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor));
    let after = this.screenToWorld(clientX, clientY);
    this.centerX += before.x - after.x;
    this.centerY += before.y - after.y;
    this.apply();
  }

  apply() {
    // Objects only erase their own previous position, so the whole frame is wiped
    // when the view changes and redrawn right away (waiting for the next tick blinks)
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.setTransform(
      this.zoom,
      0,
      0,
      this.zoom,
      this.canvas.width / 2 - this.centerX * this.zoom,
      this.canvas.height / 2 - this.centerY * this.zoom
    );
    this.objects.forEach((object) => {
      if (!object.stoped) object.draw();
    });
    this.listeners.forEach((listener) => listener());
  }

  // Canvas px per css px (the canvas can be scaled by css)
  getCssScale() {
    return this.canvas.width / this.canvas.getBoundingClientRect().width;
  }

  screenToWorld(clientX, clientY) {
    let rect = this.canvas.getBoundingClientRect();
    let scale = this.getCssScale();
    return {
      x: ((clientX - rect.left) * scale - this.canvas.width / 2) / this.zoom + this.centerX,
      y: ((clientY - rect.top) * scale - this.canvas.height / 2) / this.zoom + this.centerY,
    };
  }

  worldToScreen(x, y) {
    let rect = this.canvas.getBoundingClientRect();
    let scale = this.getCssScale();
    let point = this.worldToCanvas(x, y);
    return { x: rect.left + point.x / scale, y: rect.top + point.y / scale };
  }

  // In canvas pixels
  worldToCanvas(x, y) {
    return {
      x: (x - this.centerX) * this.zoom + this.canvas.width / 2,
      y: (y - this.centerY) * this.zoom + this.canvas.height / 2,
    };
  }
}
