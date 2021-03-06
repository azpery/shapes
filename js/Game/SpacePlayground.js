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

    this.moveEngine = new DelayedFor(
      0,
      100000000000000,
      1,
      function () {
        if (me.physic.objects.length < me.option.maxObjects) {
          let shape = StellarObjectFactory.createComet(
            me.option,
            me.context,
            colorPicker
          );
          me.addObject(shape);
        }
      },
      this.option.respawnSpeed
    );
    this.moveEngine.go();
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
