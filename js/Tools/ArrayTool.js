class ArrayTool {
  removeObject(objects, object) {
    for (var i = 0; i < objects.length; i++) {
      if (objects[i].id === object.id) {
        objects.splice(i, 1);
      }
    }
  }

  static getInstance() {
    return instance;
  }
}

const instance = new ArrayTool();
