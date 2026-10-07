// Stacks a short notification for each collision (see the "objectsCollided" event sent by Collider)
class CollisionNotifications {
  maxVisible = 5;
  duration = 5000;

  // time: optional TimeDisplay, to show the simulated date of the collision
  constructor(time = null) {
    this.time = time;
    this.container = document.createElement("div");
    this.container.className = "collisionNotifications";
    document.body.append(this.container);

    document.addEventListener("objectsCollided", (e) => {
      this.notify(e.detail.absorbed, e.detail.survivor);
    });
  }

  notify(absorbed, survivor) {
    this.show([this.createName(absorbed), " crashed into ", this.createName(survivor)]);
  }

  // Any other news (e.g. from the rocket game)
  message(text) {
    this.show([text]);
  }

  // parts: texts and elements of the first line
  show(parts) {
    let notification = document.createElement("div");
    notification.className = "collisionNotification";

    let title = document.createElement("div");
    title.append(...parts);
    notification.append(title);
    if (this.time) {
      let date = document.createElement("div");
      date.className = "collisionNotificationDate";
      date.textContent = this.time.getDateText();
      notification.append(date);
    }

    this.container.prepend(notification);
    while (this.container.children.length > this.maxVisible) {
      this.container.lastChild.remove();
    }

    setTimeout(() => {
      notification.classList.add("hidden");
      setTimeout(() => notification.remove(), 500);
    }, this.duration);
  }

  createName(object) {
    let name = document.createElement("strong");
    name.textContent = object.name || "an object";
    name.style.color = object.color;
    return name;
  }
}
