class StellarObjectFactory {
  static createComet(option, context, colorPicker) {
    var x = parseInt(option.xRespawn
      ? option.xRespawn
      : new Random(0, option.width, 1).get());
    var y = parseInt(option.yRespawn
      ? option.yRespawn
      : new Random(0, option.height, 1).get());
    var xVector = option.xVector == undefined ? new Random(-1 * option.maxSpeedOfObject, 2 * option.maxSpeedOfObject, 1).get() : option.xVector;
    var yVector = option.yVector == undefined ? new Random(-1 * option.maxSpeedOfObject, 2 * option.maxSpeedOfObject, 1).get() : option.yVector;
    var radius = new Random(option.minSize, option.maxSize, 1).get() * option.zoom;
    var density = option.density == undefined ? new Random(option.minDensity, option.maxDensity, 1).get() : (option.density / (option.zoom * option.zoom));
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize,
      density
    );
    return shape;
  }
}
