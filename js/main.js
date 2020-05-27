var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");
var zoom = 1
var playground = new TestPlayground(1664, 1000, ctx, 50, {
  bounce: false,
  speed: 1000,
  respawnSpeed: 50,
  keepTrails: true,
  destroyAfterDisapering:true,
  maxObjects: 50,
  minSize: 1,
  maxSize: 2,
  maxCollidedSize: 100,
  maxSpeedOfObject: 2,
  attractionRadius: 24,
  attractionStrength: 8,
  density: 60000000,
  colors: ["#00897b", "#00695c", "#eeeeee", "#5d4037"],
});
playground.play();

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
