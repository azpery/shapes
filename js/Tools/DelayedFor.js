class DelayedFor {
  constructor(from, to, step, delay) {
    this.next = [];
    this.from = from;
    this.to = to;
    this.step = step;
    this.delay = delay;
    this.cursor = from;
    this.continue = true;
    // Steps per interval: 0 pauses, below 1 skips intervals, above 1 runs several steps in one
    this.speed = 1;
    this.pendingSteps = 0;
    this.advanceListeners = [];
    // When the last steps ran (performance.now())
    this.lastAdvance = 0;
  }

  // Called before each batch of steps
  onAdvance(listener) {
    this.advanceListeners.push(listener);
  }

  // From 0 (steps just ran) to 1 (next ones due): how far along to the next steps we are
  getProgress(time) {
    if (this.speed === 0) return 1;
    let period = this.delay / Math.min(1, this.speed);
    return Math.min(1, Math.max(0, (time - this.lastAdvance) / period));
  }

  go() {
    var me = this;
    this.timeout = setInterval(function () {
      me.pendingSteps += me.speed;
      if (me.pendingSteps >= 1) {
        me.advanceListeners.forEach((listener) => listener());
        me.lastAdvance = performance.now();
      }
      while (me.pendingSteps >= 1) {
        me.pendingSteps -= 1;
        if (!(me.cursor < me.to && me.continue)) {
          me.timeout = null;
          return;
        }
        me.next.slice().forEach((hook) => {
          if (typeof hook === "function") {
            hook();
          } else hook.hook();
        });
        me.cursor += me.step;
      }
    }, this.delay);
  }

  stop() {
    this.continue = false;
  }

  addHook(hook) {
    this.next.push(hook);
  }

  removeHook(hook) {
    let index = this.next.indexOf(hook);
    if (index >= 0) this.next.splice(index, 1);
  }
}

const loop = new DelayedFor(0, 100000000000000, 1, 30);

loop.go();
