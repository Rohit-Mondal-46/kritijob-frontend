const memoryStore = {};

const safeStorage = {
  getItem: (key) => {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : memoryStore[key] || null;
    } catch (e) {
      return memoryStore[key] || null;
    }
  },
  setItem: (key, value) => {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = String(value);
      }
    } catch (e) {
      memoryStore[key] = String(value);
    }
  },
  removeItem: (key) => {
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete memoryStore[key];
      }
    } catch (e) {
      delete memoryStore[key];
    }
  }
};

export default safeStorage;
