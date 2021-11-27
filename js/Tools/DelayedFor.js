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
        me.next.forEach((hook) => {
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

  removeHook(hook) {
    this.next.splice(this.next.indexOf(hook), 1);
  }
}

const loop = new DelayedFor(0, 100000000000000, 1, 1);

loop.go();
