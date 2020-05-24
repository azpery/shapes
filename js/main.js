var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");

var playground = new SpacePlayGround(1664, 1000, ctx, 50, {
  bounce: false,
  speed: 100,
  respawnSpeed: 10,
  keepTrails: false,
  maxObjects:20,
  colors: ["#000000"],
  minSize: 3,
  maxSize:6
});
playground.play();
