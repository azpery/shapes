class SpacePlayGround extends PlayGround {
  constructor(
    width,
    height,
    context,
    gridSize,
    option = new PlayGroundOption()
  ) {
    option = {
      bounce: false,
      speed: 100,
      respawnSpeed: 1,
      keepTrails: false,
      destroyAfterDisapering: false,
      maxObjects: 5000,
      minSize: 0.01,
      width: 10000,
      height: 10000,
      // xVector: 0.5,
      // yVector: 0.5,
      maxSize: 2,
      maxCollidedSize: 3000,
      maxSpeedOfObject: 2,
      attractionRadius: 10000000,
      attractionStrength: 10000000,
      density: 700000,
      zoom: 10,
    };

    super(width * option.zoom, height * option.zoom, context, 0, gridSize);
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

    this.addObject(
      StellarObjectFactory.createSpaceCraft(
        this.option,
        this.context,
        colorPicker,
        this.physic.objects
      )
    );

    this.moveEngine = new DelayedFor(
      0,
      100000000000000,
      1,

      this.option.respawnSpeed
    );
    this.moveEngine.addHook(function () {
      if (me.physic.objects.length < me.option.maxObjects) {
        let shape = StellarObjectFactory.createComet(
          me.option,
          me.context,
          colorPicker
        );
        me.addObject(shape);
      }
    });
    this.moveEngine.go();
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
