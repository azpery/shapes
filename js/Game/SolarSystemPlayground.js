class SolarSystemPlayground extends PlayGround {
  constructor(
    width,
    height,
    context,
    gridSize,
    option = new PlayGroundOption()
  ) {
    super(width, height, context, 0, gridSize);
    this.option = PlayGroundOption.assign(new PlayGroundOption(), {
      bounce: true,
      speed: 100,
      respawnSpeed: 50,
      keepTrails: false,
      destroyAfterDisapering: true,
      maxObjects: 10,
      minSize: 1,
      maxSize: 2,
      maxCollidedSize: 50,
      maxSpeedOfObject: 0,
      attractionRadius: 24,
      attractionStrength: 8,
      density: 6000000,
      colors: ["#00897b", "#00695c", "#eeeeee", "#5d4037"],
      zoom: 2,
    });
    this.physic = new Physic(width, height, this.option);
    this.option.buildToolBar();

    document.addEventListener(
      "optionUpdated",
      function (e) {
        this.option[e.detail.name] = e.detail.value;
        console.log("updated", e.detail.name, "with", e.detail.value); // Prints "Example of an event"
      }.bind(this)
    );
  }

  play() {
    var widths = this.width / this.gridSize;
    var heights = this.height / this.gridSize;

    var colorPicker = new ColorPicker(this.option.colors);

    var me = this;

    let sun = StellarObjectFactory.createSun(
      this.option,
      this.context,
      new ColorPicker(["#FF6F00"])
    );
    let earth = StellarObjectFactory.createEarth(
      this.option,
      this.context,
      new ColorPicker(["#0091EA"])
    );
    let mercury = StellarObjectFactory.createMercury(
      this.option,
      this.context,
      new ColorPicker(["#E53935"])
    );
    let mars = StellarObjectFactory.createMars(
      this.option,
      this.context,
      new ColorPicker(["#D50000"])
    );
    let moonmars = StellarObjectFactory.createMoon(
      this.option,
      this.context,
      new ColorPicker(["#fff"])
    );
    this.addObject(sun);
    this.addObject(mercury);
    this.addObject(earth);
    this.addObject(mars);
    this.addObject(moonmars);
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
