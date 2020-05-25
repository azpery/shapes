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

    // var object1 = Object.assign(new PlayGroundOption(), {});
    // object1.minSize = 10;
    // object1.maxSize = 15;
    // object1.maxSpeedOfObject = 0;
    // object1.xRespawn = 600;
    // object1.yRespawn = 400;
    // object1.destroyAfterDisapering = false;

    // let shape = StellarObjectFactory.createComet(
    //   object1,
    //   this.context,
    //   colorPicker
    // );
    // me.physic.addObject(shape);
    // me.physic.move(shape);

    // var object2 = Object.assign(new PlayGroundOption(), {});
    // object2.minSize = 10;
    // object2.maxSize = 15;
    // object2.maxSpeedOfObject = 0;
    // object2.xRespawn = 1400;
    // object2.yRespawn = 600;
    // object2.destroyAfterDisapering = false;

    // let shape2 = StellarObjectFactory.createComet(
    //   object2,
    //   this.context,
    //   colorPicker
    // );
    // me.physic.addObject(shape2);
    // me.physic.move(shape2);

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
