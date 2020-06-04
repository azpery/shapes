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
    object1.minSize = 5 * this.option.zoom;
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

    document.addEventListener("click", function (event) {
      let radius = parseFloat(document.getElementById("radius").value)
      let xVector = parseFloat(document.getElementById("xVector").value)
      let yVector = parseFloat(document.getElementById("yVector").value)
      let density = parseFloat(document.getElementById("density").value)
      var object3 = Object.assign(me.option, {});
      object3.minSize = radius * me.option.zoom;
      object3.maxSize = 0;
      object3.maxSpeedOfObject = 2;
      object3.xRespawn = event.x;
      object3.yRespawn = event.y;
      object3.xVector = xVector;
      object3.yVector = yVector;
      object3.density = density;
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
