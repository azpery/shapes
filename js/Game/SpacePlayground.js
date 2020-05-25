class SpacePlayGround extends PlayGround {
  constructor(width, height, context, gridSize, option = new PlayGroundOption()) {
    super(width, height, context, 0, gridSize);
    this.option = Object.assign(new PlayGroundOption(), option);
    this.physic = new Physic(width, height, this.option);
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
          me.physic.addObject(shape);
          me.physic.move(shape)
        }
      },
      this.option.respawnSpeed
    );
    this.moveEngine.go();
  }
}
