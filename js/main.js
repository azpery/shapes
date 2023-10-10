var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");
const option = {
  bounce: false,
  speed: 100,
  respawnSpeed: 1,
  keepTrails: false,
  destroyAfterDisapering: true,
  maxObjects: 5000,
  minSize: 1,
  width: 4000,
  heigth: 4000,
  // xVector: 0.5,
  // yVector: 0.5,
  maxSize: 2,
  maxCollidedSize: 30,
  maxSpeedOfObject: 0.1,
  attractionRadius: 10000000,
  attractionStrength: 10000000,
  density: 70000,
  zoom: 1,
};
var playground = new SpacePlayGround(1800, 900, ctx, 50, option);
playground.play();

// let controlledComet = StellarObjectFactory.createControledComet(
//   option,
//   ctx,
//   new ColorPicker(["#c62828"])
// );
// playground.addObject(controlledComet);

// var playground = new TestPlayground(1664, 1000, ctx, 50, {
//   bounce: false,
//   speed: 37,
//   respawnSpeed: 10,
//   keepTrails: false,
//   maxObjects:30,
//   minSize: 1,
//   maxSize:2,
//   maxCollidedSize: 100,
//   colors:["#00897b", "#00695c", "#eeeeee", "#5d4037"]
// });
// playground.play();

// var c = document.getElementById("cnvs");
// var ctx = c.getContext("2d");
// var playground = new SpacePlayGround(1664, 1000, ctx, 50, {
//   bounce: false,
//   speed: 40,
//   respawnSpeed: 50,
//   keepTrails: false,
//   destroyAfterDisapering:true,
//   maxObjects: 50,
//   minSize: 1,
//   maxSize: 2,
//   maxCollidedSize: 30,
//   maxSpeedOfObject: 2,
//   attractionRadius: 24,
//   attractionStrength: 8,
//   minDensity:  300000,
//   maxDensity : 5000000,
//   colors: ["#00897b", "#00695c", "#eeeeee", "#5d4037"],
//   zoom: 2
// });
// playground.play();
