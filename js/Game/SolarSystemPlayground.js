class SolarSystemPlayground extends PlayGround {
  constructor(
    width,
    height,
    context,
    gridSize,
    option = new PlayGroundOption()
  ) {
    super(width, height, context, 0, gridSize);
    this.option = PlayGroundOption.assign(new PlayGroundOption(), {
      // The neighbouring stars are far outside the world bounds
      bounce: false,
      speed: 100,
      respawnSpeed: 50,
      keepTrails: false,
      destroyAfterDisapering: false,
      maxObjects: 10,
      minSize: 1,
      maxSize: 2,
      maxCollidedSize: 50,
      maxSpeedOfObject: 0,
      attractionRadius: 24,
      attractionStrength: 2350000,
      density: 6000000,
      colors: ["#00897b", "#00695c", "#eeeeee", "#5d4037"],
      zoom: 2,
    });
    this.physic = new Physic(width, height, this.option);
    this.camera = new Camera(context, width, height);
    this.renderer = new Renderer(context, this.physic.objects, this.camera, this.option.keepTrails, loop);
    this.tooltip = new ObjectTooltip(this.camera, this.physic.objects, this.renderer);
    this.orbitInfo = new OrbitInfo(
      this.tooltip,
      this.renderer,
      this.physic.objects,
      this.option.attractionStrength
    );
    let earth = SUN.satellites.find((body) => body.name === "Earth");
    this.time = new TimeDisplay(2 * Math.PI * Math.sqrt(Math.pow(earth.distance, 3) / SUN_MU));
    this.notifications = new CollisionNotifications(this.time);
    this.speedControl = new SpeedControl(loop);
    // The Sun is at the centre of the world
    this.galaxy = new Galaxy(
      this.camera,
      width / 2 + GALACTIC_CENTER.x,
      height / 2 + GALACTIC_CENTER.y,
      width / 2,
      height / 2
    );
    // Buttons for touch screens, keys g and s on a keyboard
    this.createViewButtons([
      ["Solar system", "s", () => this.camera.reset()],
      ["Galaxy", "g", () => this.showGalaxy()],
      ["Rocket", "r", () => this.rocketGame.start()],
    ]);
    this.option.buildToolBar();

    document.addEventListener(
      "optionUpdated",
      function (e) {
        this.option[e.detail.name] = e.detail.value;
        console.log("updated", e.detail.name, "with", e.detail.value); // Prints "Example of an event"
      }.bind(this)
    );
  }

  showGalaxy() {
    let area = this.galaxy.getArea();
    this.camera.fitArea(area.x, area.y, area.width, area.height);
  }

  // views: [label, key, action]
  createViewButtons(views) {
    let bar = document.createElement("div");
    bar.className = "viewButtons";
    views.forEach(([label, key, action]) => {
      let button = document.createElement("button");
      button.textContent = label;
      button.title = label + " (" + key + ")";
      button.addEventListener("click", action);
      bar.append(button);
    });
    document.body.append(bar);
    document.addEventListener("keydown", (e) => {
      let view = views.find(([, key]) => key === e.key);
      if (view) view[2]();
    });
  }

  play() {
    StellarObjectFactory.createSolarSystem(
      this.option,
      this.context,
      this.width / 2,
      this.height / 2
    ).forEach((body) => this.addObject(body));
    // Needs the bodies
    this.rocketGame = new RocketGame(
      this.camera,
      this.renderer,
      this.physic.objects,
      this.option.attractionStrength,
      this.speedControl,
      this.notifications
    );
  }

  addObject(object) {
    this.physic.addObject(object);
    this.physic.move(object);
  }
}
