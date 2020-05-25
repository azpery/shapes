var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");

var playground = new SpacePlayGround(1664, 1000, ctx, 50, {
  bounce: false,
  speed: 37,
  respawnSpeed: 10,
  keepTrails: false,
  maxObjects: 30,
  minSize: 1,
  maxSize: 10,
  maxCollidedSize: 100,
  maxSpeedOfObject: 2,
  attractionRadius: 50,
  attractionStrength: 6,
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
