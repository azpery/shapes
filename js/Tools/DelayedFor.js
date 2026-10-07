class DelayedFor {
  constructor(from, to, step, delay) {
    this.next = [];
    this.from = from;
    this.to = to;
    this.step = step;
    this.delay = delay;
    this.cursor = from;
    this.continue = true;
  }

  go() {
    var me = this;
    this.timeout = setInterval(function () {
      if (me.cursor < me.to && me.continue) {
        me.next.slice().forEach((hook) => {
          if (typeof hook === "function") {
            hook();
          } else hook.hook();
        });
        me.cursor += me.step;
      } else {
        me.timeout = null;
      }
    }, this.delay);
  }

  stop() {
    this.continue = false;
  }

  addHook(hook) {
    this.next.push(hook);
  }

  prependHook(hook) {
    this.next.unshift(hook);
  }

  removeHook(hook) {
    let index = this.next.indexOf(hook);
    if (index >= 0) this.next.splice(index, 1);
  }
}

const loop = new DelayedFor(0, 100000000000000, 1, 30);

loop.go();
