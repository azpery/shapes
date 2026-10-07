// Pause / slower / faster buttons for a DelayedFor loop (keys: space, - and +)
class SpeedControl {
  // Above 20 the collision checks can't keep up
  speeds = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20];

  constructor(loop) {
    this.loop = loop;
    this.index = this.speeds.indexOf(1);
    this.paused = false;

    this.element = document.createElement("div");
    this.element.className = "speedControl";
    this.pauseButton = this.createButton("Pause (space)", () => this.togglePause());
    let slower = this.createButton("Slower (-)", () => this.change(-1));
    slower.textContent = "−";
    this.label = document.createElement("span");
    this.label.className = "speedLabel";
    let faster = this.createButton("Faster (+)", () => this.change(1));
    faster.textContent = "+";
    this.element.append(this.pauseButton, slower, this.label, faster);
    document.body.append(this.element);

    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        this.togglePause();
      }
      if (e.key === "-") this.change(-1);
      if (e.key === "+" || e.key === "=") this.change(1);
    });
    this.update();
  }

  createButton(title, action) {
    let button = document.createElement("button");
    button.title = title;
    button.addEventListener("click", action);
    return button;
  }

  // Closest available speed
  setSpeed(speed) {
    let distances = this.speeds.map((value) => Math.abs(Math.log(value / speed)));
    this.index = distances.indexOf(Math.min(...distances));
    this.paused = false;
    this.update();
  }

  togglePause() {
    this.paused = !this.paused;
    this.update();
  }

  change(direction) {
    this.index = Math.max(0, Math.min(this.speeds.length - 1, this.index + direction));
    this.paused = false;
    this.update();
  }

  update() {
    let speed = this.speeds[this.index];
    this.loop.speed = this.paused ? 0 : speed;
    this.pauseButton.textContent = this.paused ? "▶" : "❚❚";
    this.label.textContent = this.paused ? "Paused" : "×" + speed;
  }
}
