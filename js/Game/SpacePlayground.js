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
      maxObjects: 500,
      minSize: 1,
      width: 4000,
      height: 4000,
      // xVector: 0.5,
      // yVector: 0.5,
      maxSize: 2,
      maxCollidedSize: 30,
      maxSpeedOfObject: 0.1,
      attractionRadius: 10000000,
      attractionStrength: 230000000,
      density: 7000000,
      zoom: 1,
    };

    super(width, height, context, 0, gridSize);
    this.option = PlayGroundOption.assign(new PlayGroundOption(), option);
    this.physic = new Physic(width, height, this.option);
    this.camera = new Camera(context, width, height);
    this.renderer = new Renderer(context, this.physic.objects, this.camera, this.option.keepTrails);
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
      StellarObjectFactory.createControledComet(
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
