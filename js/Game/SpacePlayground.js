class SpacePlayGround extends PlayGround {
  constructor(width, height, context, gridSize, option = new PlayGroundOption()) {
    super(width, height, context, 0, gridSize);
    this.option = Object.assign(new PlayGroundOption(), option);
    this.physic = new Physic(width, height, option);
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
          var x = me.option.xRespawn ? me.option.xRespawn : new Random(0, me.width, 1).get();
          var y = me.option.yRespawn ? me.option.yRespawn : new Random(0, me.height, 1).get();
          var xVector = new Random(-20, 30, 1).get();
          var yVector = new Random(-20, 30, 1).get();
          var radius = new Random(me.option.minSize, me.option.maxSize, 1).get();
          let shape = new Comet(
            x,
            y,
            radius,
            me.context,
            colorPicker.pick(),
            xVector,
            yVector,
            me.option.keepTrails,
            me.option.maxCollidedSize
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
