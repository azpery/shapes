// Fills the window with the canvas and lets the user move around, with a mouse or fingers:
// zoom (wheel or pinch), pan (drag), reset (double click or double tap)
class Camera {
  // Low enough to see the whole galaxy
  minZoom = 0.000005;
  maxZoom = 60;
  // A press moving less than this (css px), released within tapDuration (ms), is a tap
  tapDistance = 8;
  tapDuration = 300;

  constructor(context, worldWidth, worldHeight) {
    this.context = context;
    this.canvas = context.canvas;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.listeners = [];
    this.tapListeners = [];
    // Pointers (mouse, fingers) currently pressed on the canvas, by id
    this.pointers = new Map();
    this.press = null;
    this.lastTap = null;

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
    this.canvas.addEventListener("pointerdown", (e) => this.pointerDown(e));
    this.canvas.addEventListener("pointermove", (e) => this.pointerMove(e));
    this.canvas.addEventListener("pointerup", (e) => this.pointerUp(e));
    this.canvas.addEventListener("pointercancel", (e) => this.pointerUp(e));
    this.canvas.style.cursor = "grab";
  }

  pointerDown(e) {
    // Keeps receiving the moves when the pointer leaves the canvas
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // A second finger makes it a pinch, not a tap
    this.press =
      this.pointers.size === 1 ? { x: e.clientX, y: e.clientY, time: performance.now() } : null;
    this.canvas.style.cursor = "grabbing";
  }

  pointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    let before = this.getPointersCenter();
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    let after = this.getPointersCenter();
    if (this.press && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > this.tapDistance) {
      this.press = null;
    }

    let scale = this.getCssScale();
    this.centerX -= ((after.x - before.x) * scale) / this.zoom;
    this.centerY -= ((after.y - before.y) * scale) / this.zoom;
    // Pinch: zoom by how much the fingers spread, around their middle
    if (this.pointers.size >= 2 && before.spread > 0) {
      this.zoomAt(after.x, after.y, after.spread / before.spread);
    } else {
      this.apply();
    }
  }

  pointerUp(e) {
    if (!this.pointers.delete(e.pointerId)) return;
    if (
      e.type === "pointerup" &&
      this.press &&
      performance.now() - this.press.time < this.tapDuration
    ) {
      this.tap(e.clientX, e.clientY);
    }
    this.press = null;
    if (this.pointers.size === 0) this.canvas.style.cursor = "grab";
  }

  // Double tap resets the view, a single one is passed to the tap listeners
  tap(clientX, clientY) {
    let now = performance.now();
    if (
      this.lastTap &&
      now - this.lastTap.time < this.tapDuration &&
      Math.hypot(clientX - this.lastTap.x, clientY - this.lastTap.y) < this.tapDistance * 3
    ) {
      this.lastTap = null;
      this.reset();
      return;
    }
    this.lastTap = { x: clientX, y: clientY, time: now };
    this.tapListeners.forEach((listener) => listener(clientX, clientY));
  }

  // Middle of the first two pointers and how far apart they are (0 with a single pointer)
  getPointersCenter() {
    let [first, second] = this.pointers.values();
    if (!second) return { x: first.x, y: first.y, spread: 0 };
    return {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
      spread: Math.hypot(first.x - second.x, first.y - second.y),
    };
  }

  // Called with the client coordinates of every single tap or click
  onTap(listener) {
    this.tapListeners.push(listener);
  }

  resize() {
    // One canvas pixel per device pixel (at most 2, phones go up to 3) for sharp drawings
    let ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * ratio;
    this.canvas.height = window.innerHeight * ratio;
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
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

  // The Renderer reads the view on every frame, only the listeners need to be told
  apply() {
    this.listeners.forEach((listener) => listener());
  }

  applyTransform(context) {
    context.setTransform(
      this.zoom,
      0,
      0,
      this.zoom,
      this.canvas.width / 2 - this.centerX * this.zoom,
      this.canvas.height / 2 - this.centerY * this.zoom
    );
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
