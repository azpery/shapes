class TestPlayground extends PlayGround {
  constructor(
    width,
    height,
    context,
    gridSize,
    option = new PlayGroundOption()
  ) {
    super(width, height, context, 0, gridSize);
    this.option = Object.assign(new PlayGroundOption(), option);
    this.physic = new Physic(width, height, option);
  }

  play() {
    var colorPicker = new ColorPicker(this.option.colors);

    var me = this;
    var object1 = Object.assign(new PlayGroundOption(), {});
    object1.minSize = 10;
    object1.maxSize = 15;
    object1.maxSpeedOfObject = 0;
    object1.xRespawn = 800;
    object1.yRespawn = 500;
    object1.destroyAfterDisapering = false;

    let shape = StellarObjectFactory.createComet(
      object1,
      this.context,
      colorPicker
    );
    me.physic.addObject(shape);
    me.physic.move(shape);


    var object2 = Object.assign(new PlayGroundOption(), {});
    object2.minSize = 5;
    object2.maxSize = 6;
    object2.maxSpeedOfObject = 2;
    object2.xRespawn = 1239;
    object2.yRespawn = 700;
    object2.destroyAfterDisapering = false;

    let shape2 = StellarObjectFactory.createComet(
      object2,
      this.context,
      colorPicker
    );
    me.physic.addObject(shape2);
    me.physic.move(shape2);
  }
}
