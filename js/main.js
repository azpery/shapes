var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");

var playground = new SpacePlayGround(1664, 1000, ctx, 50, {
  bounce: true,
  speed: 37,
  respawnSpeed: 10,
  keepTrails: true,
  maxObjects:10,
  xRespawn: 800,
  yRespawn: 500,
  colors: ["#000000"],
  maxSize:2
});
playground.play();
