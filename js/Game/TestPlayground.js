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
    var object1 = Object.assign(this.option, {});
    object1.minSize = 5;
    object1.maxSize = 0;
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


    var object2 = Object.assign(this.option, {});
    object2.minSize = 2;
    object2.maxSize = 0;
    object2.maxSpeedOfObject = 2;
    object2.xRespawn = 620;
    object2.yRespawn = 500;
    object2.xVector = 0;
    object2.yVector = -2;
    object2.destroyAfterDisapering = false;

    let shape2 = StellarObjectFactory.createComet(
      object2,
      this.context,
      colorPicker
    );
    me.physic.addObject(shape2);
    me.physic.move(shape2);

    var object3 = Object.assign(this.option, {});
    object3.minSize = 2;
    object3.maxSize = 0;
    object3.maxSpeedOfObject = 2;
    object3.xRespawn = 1200;
    object3.yRespawn = 500;
    object3.xVector = 0;
    object3.yVector = -1;
    object3.destroyAfterDisapering = false;

    let shape3 = StellarObjectFactory.createComet(
      object3,
      this.context,
      colorPicker
    );
    me.physic.addObject(shape3);
    me.physic.move(shape3);

    document.addEventListener("click", function (event) {
      var object3 = Object.assign(me.option, {});
      object3.minSize = 0.5;
      object3.maxSize = 0;
      object3.maxSpeedOfObject = 2;
      object3.xRespawn = event.x;
      object3.yRespawn = event.y;
      object3.xVector = 0;
      object3.yVector = -1;
      object3.destroyAfterDisapering = true;

      let shape3 = StellarObjectFactory.createComet(
        object3,
        me.context,
        colorPicker
      );
      me.physic.addObject(shape3);
      me.physic.move(shape3);
    });

  }
}
