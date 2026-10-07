// Shows the simulated date: one Earth orbit is one year, starting from today
class TimeDisplay {
  constructor(ticksPerYear) {
    this.ticksPerDay = ticksPerYear / 365.25;
    this.ticks = 0;
    this.start = new Date();

    this.element = document.createElement("div");
    this.element.className = "timeDisplay";
    document.body.append(this.element);

    // Counts loop ticks rather than real time, so it follows the simulation if the browser slows it down
    loop.addHook(() => {
      this.ticks++;
      this.update();
    });
    this.update();
  }

  getDateText() {
    let date = new Date(this.start);
    date.setDate(date.getDate() + Math.floor(this.ticks / this.ticksPerDay));
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  update() {
    let days = Math.floor(this.ticks / this.ticksPerDay);
    let years = Math.floor(days / 365.25);
    let remainingDays = Math.floor(days - years * 365.25);
    this.element.textContent =
      this.getDateText() +
      " · " +
      (years > 0 ? years + (years === 1 ? " year " : " years ") : "") +
      remainingDays +
      (remainingDays === 1 ? " day" : " days") +
      " elapsed";
  }
}
