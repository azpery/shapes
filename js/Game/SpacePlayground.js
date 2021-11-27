class SpacePlayGround extends PlayGround {
  constructor(
    width,
    height,
    context,
    gridSize,
    option = new PlayGroundOption()
  ) {
    super(width, height, context, 0, gridSize);
    this.option = PlayGroundOption.assign(new PlayGroundOption(), option);
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

    // this.moveEngine = new DelayedFor(
    //   0,
    //   100000000000000,
    //   1,
    //   function () {
    //     if (me.physic.objects.length < me.option.maxObjects) {
    //       let shape = StellarObjectFactory.createComet(
    //         me.option,
    //         me.context,
    //         colorPicker
    //       );
    //       me.addObject(shape);
    //     }
    //   },
    //   this.option.respawnSpeed
    // );
    this.moveEngine.go();
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
