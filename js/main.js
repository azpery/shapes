
var c = document.getElementById("cnvs");
var ctx = c.getContext("2d");

var playground = new RandomPlayGround(1664, 1000, ctx, 100, 50);
playground.play()