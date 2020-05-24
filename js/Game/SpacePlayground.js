class SpacePlayGround extends PlayGround {
  constructor(width, height, context, gridSize, option = new PlayGroundOption()) {
    super(width, height, context, 0, gridSize);
    this.option = Object.assign(new PlayGroundOption(), option);
  }

  play() {
    var widths = this.width / this.gridSize;
    var heights = this.height / this.gridSize;

    var colorPicker = new ColorPicker(this.option.colors);

    var me = this;

    var i = 0;
    this.moveEngine = new DelayedFor(
      0,
      100000000000000,
      1,
      function () {
        if (i < me.option.maxObjects) {
          i++;
          var x = me.option.xRespawn ? me.option.xRespawn : new Random(0, me.width, 1).get();
          var y = me.option.yRespawn ? me.option.yRespawn : new Random(0, me.height, 1).get();
          var xVector = new Random(-10, 20, 1).get();
          var yVector = new Random(-10, 20, 1).get();
          var radius = new Random(me.option.minSize, me.option.maxSize, 1).get();
          let shape = new Comet(
            x,
            y,
            radius,
            me.context,
            colorPicker.pick(),
            xVector,
            yVector,
            me.option.keepTrails
          );
          shape.move(me.option.speed, function (x, y) {
            if (x > me.width || y > me.height || x < 0 || y < 0) {
              if (me.option.bounce) {
                if (x > me.width || x < 0) shape.xVector = -shape.xVector;
                if (y > me.height || y < 0) shape.yVector = -shape.yVector;
              } else {
                i--;
                shape.stop();
                y = null;

                xVector = null;
                yVector = null;
                radius = null;
              }
            }
          });
        }
      },
      this.option.respawnSpeed
    );
    this.moveEngine.go();
  }
}
