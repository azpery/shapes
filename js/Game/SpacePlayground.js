class SpacePlayGround extends PlayGround {
  play() {
    var widths = this.width / this.gridSize;
    var heights = this.height / this.gridSize;

    var colorPicker = new ColorPicker();

    var me = this;

    this.moveEngine = new DelayedFor(
      0,
      100000000000000,
      1,
      function () {
        var x = new Random(0, me.width, 1).get();
        var y = new Random(0, me.height, 1).get();
        var xVector = new Random(-10, 20, 1).get();
        var yVector = new Random(-10, 20, 1).get();
        var radius = new Random(1, 10, 1).get();
        let shape = new Comet(
          x,
          y,
          radius,
          me.context,
          colorPicker.pick(),
          xVector,
          yVector
        );
        shape.move(me.speed, function (x, y) {
          if (x > me.width || y > me.height) {
            shape.stop();
            shape = null;
          }
        });
      },
      this.speed
    );
    this.moveEngine.go();
  }
}
