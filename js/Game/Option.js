class PlayGroundOption{
    width = 1600;
    height = 1000;
    // Makes de balls bounce against the wall
    bounce = false;
    //Speed execution
    speed = 1;
    //Speed of respawns for balls and shapes
    respawnSpeed = 10;
    //If true, the trail of the balls are kept in frame
    keepTrails = false;
    //Maximum number of object in frame
    maxObjects = 20;
    //Defines a x coordinate for respawn, if null then it chooses a random x coordinate 
    xRespawn;
    //Defines a y coordinate for respawn, if null then it chooses a random y coordinate
    yRespawn;
    //Color of shape, ;
    colors = ["#3f51b5", "#00bcd4", "#ffeb3b", "#e64a19", "#f57c00", "#689f38"];
    //Max size of shape
    maxSize = 35;
    //Min size of shape
    minSize = 1;
    //Max size of collided object
    maxCollidedSize = 70;

    maxSpeedOfObject = 10;

    destroyAfterDisapering = true;

    attractionRadius = 50;

    attractionStrength = 6;
}