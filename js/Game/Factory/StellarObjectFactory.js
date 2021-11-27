class StellarObjectFactory {
  static createComet(option, context, colorPicker) {
    var x = parseInt(
      option.xRespawn ? option.xRespawn : new Random(0, option.width, 1).get()
    );
    var y = parseInt(
      option.yRespawn ? option.yRespawn : new Random(0, option.height, 1).get()
    );
    var xVector =
      option.xVector == undefined
        ? new Random(
            -1 * option.maxSpeedOfObject,
            2 * option.maxSpeedOfObject,
            1
          ).get()
        : option.xVector;
    var yVector =
      option.yVector == undefined
        ? new Random(
            -1 * option.maxSpeedOfObject,
            2 * option.maxSpeedOfObject,
            1
          ).get()
        : option.yVector;
    var radius =
      new Random(option.minSize, option.maxSize, 1).get() * option.zoom;
    var density =
      option.density == undefined
        ? new Random(option.minDensity, option.maxDensity, 1).get()
        : option.density / (option.zoom * option.zoom);
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

  static createControledComet(option, context, colorPicker) {
    var x = 800;
    var y = 500;
    var xVector = 0;
    var yVector = 0;
    var radius = 1;
    var density = option.density;
    let shape = new ControledComet(
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

  static createSun(option, context, colorPicker) {
    var x = 800;
    var y = 400;
    var xVector = 0;
    var yVector = 0;
    var radius = 20;
    var density = 70000;
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

  static createEarth(option, context, colorPicker) {
    var x = 700;
    var y = 400;
    var xVector = 0;
    var yVector = 0.06;
    var radius = 2;
    var density = 70000;
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

  static createMercury(option, context, colorPicker) {
    var x = 800;
    var y = 355;
    var xVector = 0.09;
    var yVector = 0;
    var radius = 2;
    var density = 70000;
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

  static createMars(option, context, colorPicker) {
    var x = 700;
    var y = 600;
    var xVector = 0.065;
    var yVector = 0.04;
    var radius = 3;
    var density = 70000;
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

  static createMoon(option, context, colorPicker) {
    var x = 700;
    var y = 590;
    var xVector = 0.2;
    var yVector = 0.04;
    var radius = 0.5;
    var density = 90000000;
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
