// Draws stars, planets, moons, comets and black holes (looks in BodyAppearances.js):
// lit from their star, with spinning surface features, bands, polar caps, atmosphere and rings.
// Below DETAIL_RADIUS on screen, planets are plain discs.
class BodyPainter {
  // On-screen radius (canvas px) from which surfaces are detailed
  static DETAIL_RADIUS = 3;
  // Real-time seconds for one spin of a body with a 24 hour day
  static SECONDS_PER_DAY = 30;

  static paint(body, time) {
    let context = body.context;
    let look = body.appearance;
    let radius = body.getDrawnRadius();
    let detailed = body.radius * context.getTransform().a >= this.DETAIL_RADIUS;
    context.save();
    context.translate(body.x, body.y);
    if (look.type === "star") this.paintStar(context, body, look, radius, time, detailed);
    else if (look.type === "blackHole") this.paintBlackHole(context, radius);
    else if (look.type === "comet") this.paintComet(context, body, radius);
    else this.paintPlanet(context, body, look, radius, time, detailed);
    context.restore();
  }

  // How far the drawing goes from the centre (glow, rings, tail), in world units
  static getExtent(body) {
    let look = body.appearance;
    if (!look) return body.radius;
    if (look.type === "star") return body.radius * 2.4;
    if (look.type === "blackHole") return body.radius * 3.2;
    if (look.type === "comet") return body.radius * 80;
    if (look.rings) return body.radius * Math.max(...look.rings.bands.map((band) => band[1]));
    return body.radius * 1.15;
  }

  static paintPlanet(context, body, look, radius, time, detailed) {
    if (!detailed) {
      this.fillCircle(context, radius, body.color);
      return;
    }
    let surface = this.getSurface(body);
    let light = this.getLightDirection(body);

    if (look.rings) this.paintRings(context, radius, look.rings, true);
    if (look.atmosphere) {
      let halo = context.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.15);
      halo.addColorStop(0, this.rgba(look.atmosphere, 0.6));
      halo.addColorStop(1, this.rgba(look.atmosphere, 0));
      this.fillCircle(context, radius * 1.15, halo);
    }

    context.save();
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.clip();
    context.fillStyle = look.base || body.color;
    context.fillRect(-radius, -radius, 2 * radius, 2 * radius);

    // Bands follow the latitudes, so they get thinner towards the poles
    surface.bands.forEach((band) => {
      context.globalAlpha = band.alpha;
      context.fillStyle = band.color;
      let top = -radius * Math.sin(band.to);
      context.fillRect(-radius, top, 2 * radius, -radius * Math.sin(band.from) - top);
    });

    let rotation = this.getRotation(look, time);
    surface.layers.forEach((layer) => {
      layer.features.forEach((feature) =>
        this.paintFeature(context, radius, feature, rotation * layer.spin)
      );
    });

    if (look.caps) {
      context.globalAlpha = 0.95;
      context.fillStyle = look.caps.color;
      if (look.caps.north) this.fillEllipse(context, 0, -radius, radius * look.caps.north * 2.4, radius * look.caps.north);
      if (look.caps.south) this.fillEllipse(context, 0, radius, radius * look.caps.south * 2.4, radius * look.caps.south);
    }
    context.globalAlpha = 1;

    this.paintShading(context, radius, light);
    context.restore();

    if (look.rings) this.paintRings(context, radius, look.rings, false);
  }

  // Feature at a latitude / longitude of the spinning sphere, flattened towards the edge of the disc
  static paintFeature(context, radius, feature, rotation) {
    let longitude = feature.lon + rotation;
    let facing = Math.cos(longitude);
    if (facing < 0) return;
    let x = radius * Math.cos(feature.lat) * Math.sin(longitude);
    let y = -radius * Math.sin(feature.lat);
    context.globalAlpha = feature.alpha;
    context.fillStyle = feature.color;
    context.beginPath();
    context.ellipse(
      x,
      y,
      feature.size * feature.stretch * radius * Math.max(0.1, facing),
      feature.size * radius * Math.max(0.25, Math.cos(feature.lat)),
      feature.angle,
      0,
      2 * Math.PI
    );
    context.fill();
  }

  // Night side away from the star, a soft highlight on the day side and darker edges
  static paintShading(context, radius, light) {
    if (light) {
      let shade = context.createLinearGradient(
        light.x * radius,
        light.y * radius,
        -light.x * radius,
        -light.y * radius
      );
      shade.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      shade.addColorStop(0.4, "rgba(0, 0, 0, 0)");
      shade.addColorStop(0.55, "rgba(0, 0, 0, 0.6)");
      shade.addColorStop(0.7, "rgba(0, 0, 0, 0.88)");
      shade.addColorStop(1, "rgba(0, 0, 0, 0.92)");
      context.fillStyle = shade;
      context.fillRect(-radius, -radius, 2 * radius, 2 * radius);
    }
    let limb = context.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius);
    limb.addColorStop(0, "rgba(0, 0, 0, 0)");
    limb.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    context.fillStyle = limb;
    context.fillRect(-radius, -radius, 2 * radius, 2 * radius);
  }

  // Seen tilted: the back half is drawn before the planet, the front half after
  static paintRings(context, radius, rings, back) {
    context.save();
    context.rotate((rings.tilt * Math.PI) / 180);
    context.scale(1, rings.squash);
    let start = back ? Math.PI : 0;
    let end = back ? 2 * Math.PI : Math.PI;
    rings.bands.forEach(([inner, outer, color]) => {
      context.beginPath();
      context.arc(0, 0, outer * radius, start, end);
      context.arc(0, 0, inner * radius, end, start, true);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    });
    context.restore();
  }

  static paintStar(context, body, look, radius, time, detailed) {
    let glow = context.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 2.4);
    glow.addColorStop(0, this.rgba(body.color, 0.55));
    glow.addColorStop(0.3, this.rgba(body.color, 0.2));
    glow.addColorStop(1, this.rgba(body.color, 0));
    this.fillCircle(context, radius * 2.4, glow);

    // White-hot centre, darker edges
    let disc = context.createRadialGradient(-radius * 0.2, -radius * 0.2, 0, 0, 0, radius);
    disc.addColorStop(0, this.shade(body.color, 0.75));
    disc.addColorStop(0.6, body.color);
    disc.addColorStop(1, this.shade(body.color, -0.25));
    this.fillCircle(context, radius, disc);

    if (detailed) {
      context.save();
      context.beginPath();
      context.arc(0, 0, radius, 0, 2 * Math.PI);
      context.clip();
      let rotation = this.getRotation(look, time);
      this.getSurface(body).layers.forEach((layer) =>
        layer.features.forEach((feature) => this.paintFeature(context, radius, feature, rotation))
      );
      context.restore();
    }
  }

  static paintBlackHole(context, radius) {
    let disk = (back) => {
      context.save();
      context.rotate(-0.3);
      context.scale(1, 0.35);
      let gradient = context.createRadialGradient(0, 0, radius * 1.2, 0, 0, radius * 3.2);
      gradient.addColorStop(0, "rgba(255, 244, 214, 0.95)");
      gradient.addColorStop(0.35, "rgba(255, 167, 38, 0.75)");
      gradient.addColorStop(1, "rgba(191, 54, 12, 0)");
      context.beginPath();
      context.arc(0, 0, radius * 3.2, back ? Math.PI : 0, back ? 2 * Math.PI : Math.PI);
      context.arc(0, 0, radius * 1.2, back ? 2 * Math.PI : Math.PI, back ? Math.PI : 0, true);
      context.fillStyle = gradient;
      context.fill();
      context.restore();
    };
    disk(true);
    // Light bent around the hole
    let ring = context.createRadialGradient(0, 0, radius, 0, 0, radius * 1.35);
    ring.addColorStop(0, "rgba(255, 224, 178, 0.9)");
    ring.addColorStop(1, "rgba(255, 224, 178, 0)");
    this.fillCircle(context, radius * 1.35, ring);
    this.fillCircle(context, radius, "#000000");
    disk(false);
  }

  // Ion tail (blue, straight) and dust tail (white, wider), pointing away from the star,
  // longer when closer to it
  static paintComet(context, body, radius) {
    let light = this.getLightDirection(body);
    if (light) {
      let length = radius * Math.min(80, 6000 / light.distance);
      context.save();
      context.rotate(Math.atan2(-light.y, -light.x));
      this.paintTail(context, radius, length, 0.6, 1.6, "129, 212, 250", 0.7);
      context.rotate(0.12);
      this.paintTail(context, radius, length * 0.7, 0.9, 3, "255, 248, 225", 0.45);
      context.restore();
    }
    let coma = context.createRadialGradient(0, 0, 0, 0, 0, radius * 2.5);
    coma.addColorStop(0, "rgba(224, 247, 250, 0.9)");
    coma.addColorStop(1, "rgba(224, 247, 250, 0)");
    this.fillCircle(context, radius * 2.5, coma);
    this.fillCircle(context, radius * 0.6, body.color);
  }

  static paintTail(context, radius, length, startWidth, endWidth, rgb, alpha) {
    let gradient = context.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    context.beginPath();
    context.moveTo(0, -radius * startWidth);
    context.lineTo(length, -radius * endWidth);
    context.lineTo(length, radius * endWidth);
    context.lineTo(0, radius * startWidth);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
  }

  // Unit vector towards the star the body ultimately orbits, null if there is none
  static getLightDirection(body) {
    let star = body;
    while (star.orbiting) star = star.orbiting;
    if (star === body) return null;
    let dx = star.x - body.x;
    let dy = star.y - body.y;
    let distance = Math.hypot(dx, dy) || 1;
    return { x: dx / distance, y: dy / distance, distance: distance };
  }

  static getRotation(look, time) {
    let day = look.day || 48;
    return ((time / 1000) * 2 * Math.PI) / ((this.SECONDS_PER_DAY * day) / 24);
  }

  // Bands and features, generated once per body from its look
  static getSurface(body) {
    if (body.surface) return body.surface;
    let look = body.appearance;
    let random = this.createRandom(body.name + body.id);
    let base = look.base || body.color;
    let layers = look.layers;
    if (!layers && !look.bands && look.type !== "star") {
      // Default: a cratered rock
      layers = [{ count: 12, colors: [this.shade(base, -0.3)], size: [0.05, 0.16], alpha: 0.5 }];
    }
    body.surface = {
      bands: look.bands ? this.generateBands(look.bands, random) : [],
      layers: (layers || []).map((layer) => ({
        spin: layer.spin || 1,
        features: this.generateFeatures(layer, random),
      })),
    };
    return body.surface;
  }

  static generateBands(bands, random) {
    let heights = [];
    for (let i = 0; i < bands.count; i++) heights.push(0.5 + random());
    let total = heights.reduce((sum, height) => sum + height, 0);
    let latitude = -Math.PI / 2;
    return heights.map((height, i) => {
      let from = latitude;
      latitude += (height / total) * Math.PI;
      return {
        from: from,
        to: latitude,
        color: bands.colors[i % bands.colors.length],
        alpha: bands.alpha ?? 1,
      };
    });
  }

  // Either explicit spots (degrees), or count random features (clusters of blobs if clusters is set)
  static generateFeatures(layer, random) {
    let toRadians = (degrees) => (degrees * Math.PI) / 180;
    if (layer.spots) {
      return layer.spots.map((spot) => ({
        lat: toRadians(spot.lat),
        lon: toRadians(spot.lon),
        size: spot.size,
        stretch: spot.stretch || 1,
        angle: spot.angle || 0,
        color: spot.color,
        alpha: spot.alpha ?? 1,
      }));
    }
    let pick = (range, otherwise) =>
      Array.isArray(range) ? range[0] + random() * (range[1] - range[0]) : range ?? otherwise;
    let maxLatitude = toRadians(layer.latitude ?? 80);
    let spread = layer.spread || 0;
    let features = [];
    for (let i = 0; i < layer.count; i++) {
      let lat = (random() * 2 - 1) * maxLatitude;
      let lon = random() * 2 * Math.PI;
      for (let j = 0; j < (layer.clusters || 1); j++) {
        features.push({
          lat: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lat + (random() * 2 - 1) * spread)),
          lon: lon + (random() * 2 - 1) * spread * 1.5,
          size: pick(layer.size, 0.1),
          stretch: pick(layer.stretch, 1),
          angle: layer.angle ? random() * Math.PI : 0,
          color: layer.colors[Math.floor(random() * layer.colors.length)],
          alpha: layer.alpha ?? 1,
        });
      }
    }
    return features;
  }

  // Seeded random numbers (mulberry32): a body always gets the same surface
  static createRandom(text) {
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) | 0;
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  static fillCircle(context, radius, style) {
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.fillStyle = style;
    context.fill();
  }

  static fillEllipse(context, x, y, radiusX, radiusY) {
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.fill();
  }

  static rgba(hex, alpha) {
    let n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  // amount from -1 (black) to 1 (white)
  static shade(hex, amount) {
    let n = parseInt(hex.slice(1), 16);
    let channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((value) =>
      Math.round(amount < 0 ? value * (1 + amount) : value + (255 - value) * amount)
    );
    return `rgb(${channels.join(", ")})`;
  }
}
