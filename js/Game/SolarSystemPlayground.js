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
      attractionStrength: 2350000,
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
    StellarObjectFactory.createSolarSystem(
      this.option,
      this.context,
      this.width / 2,
      this.height / 2
    ).forEach((body) => this.addObject(body));
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
