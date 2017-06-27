import { JSDOM } from 'jsdom';

let actualDOM;
let documentRef;
const exposedProperties = ['window', 'navigator', 'document'];

const create = (domString, opts = {}) => {
  actualDOM = domString || '';
  global.window = new JSDOM(actualDOM, opts || {}).window;
  global.document = global.window.document;
  Object.keys(global.document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
      exposedProperties.push(property);
      global[property] = global.document.defaultView[property];
    }
  });

  global.navigator = {
    userAgent: 'node.js'
  };

  documentRef = global.document;
};

const destroy = (clearRequireCache) => {
  const clearCache = typeof clearRequireCache === 'undefined'
    ? true
    : clearRequireCache;

  if (typeof global.window !== 'undefined') {
    global.window.close();
  }
  documentRef = undefined;
  exposedProperties.forEach((property) => {
    delete global[property];
  });

  if (clearCache) {
    Object.keys(require.cache).forEach((key) => {
      if (key.indexOf('require') !== -1) {
        delete require.cache[key];
      }
    });
  }
};

const clear = (opts) => {
  destroy();
  create(actualDOM, opts);
};

const getDocument = () => {
  if (typeof documentRef === 'undefined') {
    throw new Error(`document is undefined\nTry calling jsdomify.create() before requesting it\n`);
  }

  return documentRef;
};


export default {
  create,
  clear,
  destroy,
  getDocument
};
