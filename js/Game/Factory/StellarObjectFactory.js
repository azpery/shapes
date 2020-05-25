class StellarObjectFactory {
  static createComet(option, context, colorPicker) {
    var x = option.xRespawn
      ? option.xRespawn
      : new Random(0, option.width, 1).get();
    var y = option.yRespawn
      ? option.yRespawn
      : new Random(0, option.height, 1).get();
    var xVector = new Random(-1 * option.maxSpeedOfObject, 2 * option.maxSpeedOfObject, 1).get();
    var yVector = new Random(-1 * option.maxSpeedOfObject, 2 * option.maxSpeedOfObject, 1).get();
    var radius = new Random(option.minSize, option.maxSize, 1).get();
    let shape = new Comet(
      x,
      y,
      radius,
      context,
      colorPicker.pick(),
      xVector,
      yVector,
      option.keepTrails,
      option.maxCollidedSize
    );
    return shape;
  }
}
