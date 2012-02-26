(function() {

window.CanvasThing = Thing;
Thing.EventedInterface = EventedInterface;
Thing.CanvasEventedInterface = CanvasEventedInterface;

var undef,
    hasOwn = {}.hasOwnProperty;

function getStyle(el, prop) {
  if (el.currentStyle) {
    return el.currentStyle[prop];
  } else if (window.getComputedStyle) {
    return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
  }
}

function offset(element) {

  var left = 0,
      top = 0,
      offsetParent = element;

  top += parseFloat(getStyle(element, 'border-top-width')) || 0;
  top += parseFloat(getStyle(element, 'margin-top')) || 0;
  left += parseFloat(getStyle(element, 'border-left-width')) || 0;
  left += parseFloat(getStyle(element, 'margin-left')) || 0;

  do {
    left += offsetParent.offsetLeft;
    top += offsetParent.offsetTop;
  } while (offsetParent = offsetParent.offsetParent);

  return {
    left: left,
    top: top
  };
}

var getRGBOfID = CanvasEventedInterface.getRGBOfID = function(id) {
  return 'rgb(' + [
    id >> 0 & 0xff,
    id >> 8 & 0xff,
    id >> 16 & 0xff
  ].join(',') + ')';
};

var getIDOfRGB = CanvasEventedInterface.getIDOfRGB = function(r, g, b) {
  return (r & 0xff) << 0 | (g & 0xff) << 8 | (b & 0xff) << 16;
};

CanvasEventedInterface.UID = 0;

var Event = CanvasEventedInterface.Event = function(type, mixin) {
  this.type = type;
  for (var i in mixin)
    this[i] = mixin[i];
};

function EventedInterface() {
  this.events = {};
}

EventedInterface.prototype = {
  /** Events **/
  on: function(event, fn) {
    (this.events[event] = this.events[event] || []).push(fn);
    return this;
  },
  off: function(event, fn) {
    if (null == fn) {
      // Delete all handlers of this event
      delete this.events[event];
    } else {
      // Delete specified handler
      for (var i = 0, fns = this.events[event], l = fns.length; i < l; ++i) {
        fns.splice(i, 1);
      }
    }
    return this;
  },
  emit: function(event, data) {
    var me = this;
    if (event in this.events) {
      this.events[event].forEach(function(fn) {
        fn.call(me, data);
      });
    }
  }
  ///////
  ///////
};

var eventRegistry = Thing.events = new EventedInterface();

function CanvasEventedInterface(width, height) {
  EventedInterface.call(this);
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.width = width;
  this.canvas.height = this.height = height;
  this.context = this.canvas.getContext('2d');
  this.eventCanvas = this.canvas.cloneNode(false);
  this.eventContext = this.eventCanvas.getContext('2d');
  this.drawn = {};
  this.bindToCoreEvents();
  // Set the default drawing ID (to itself):
  this.id = this.getNextID();
  this.drawToID(this.id);
}
CanvasEventedInterface.prototype = new EventedInterface;
CanvasEventedInterface.prototype.bindToCoreEvents = function() {

  var main = this.canvas,
      me = this;

  main.onclick = function(e) {
    var d = offset(main);
    me.click(e.pageX - d.left, e.pageY - d.top);
  };

  main.onmousedown = function(e) {
    var d = offset(main);
    me.mousedown(e.pageX - d.left, e.pageY - d.top);
  };

  main.onmouseup = function(e) {
    var d = offset(main);
    me.mouseup(e.pageX - d.left, e.pageY - d.top);
  };

  main.onmousemove = function(e) {
    var d = offset(main);
    me.mousemove(e.pageX - d.left, e.pageY - d.top);
  };

};

CanvasEventedInterface.prototype.getElement = function() {
  return this.canvas;
};

CanvasEventedInterface.prototype.getNextID = function(fn) {
  return ++CanvasEventedInterface.UID;
};
CanvasEventedInterface.prototype.drawToID = function(id) {
  this.eventContext.fillStyle = this.eventContext.lineStyle = CanvasEventedInterface.getRGBOfID(id);
};

CanvasEventedInterface.prototype.set = function(prop, to) {
  if (!/fill|stroke|shadow/i.test(prop))
    this.eventContext[prop] = to;
  this.context[prop] = to;
  return this;
};

CanvasEventedInterface.prototype.get = function(prop) {
  return this.context[prop];
};

CanvasEventedInterface.prototype.findIDAtPoint = function(x, y) {

  var d = this.eventContext.getImageData(x - 2, y - 2, 5, 5).data,
      ids = {},
      id,
      mostCommonN = 0,
      mostCommonID,
      pixelIndex,
      miss = {0:1,4:1,20:1,24:1}; // corners

  // 5 pixels. Central + surrounding.
  for (var i = 0, l = d.length; i < l; i += 4) {

    pixelIndex = 0 | i / 4;

    if (!(pixelIndex in miss)) {
      
      id = getIDOfRGB(d[i], d[i + 1], d[i + 2]);
      ids[id] = ids[id] ? ids[id] + 1 : 1;
      if (ids[id] > mostCommonN) {
        mostCommonN = ids[id];
        mostCommonID = id;
      }

    }

  }

  return mostCommonID;
};

CanvasEventedInterface.prototype.emitMouseEvent = function(id, type, x, y) {
  id = id || this.findIDAtPoint(x, y);
  var event = new Event(type, {
    x: x, 
    y: y,
    target: id
  });
  eventRegistry.emit(id + ':' + type, event);
  this.emit(id + ':' + type, event);
  // Emit for unoccupied pixels:
  this.emit('*:' + type, event);
};

CanvasEventedInterface.prototype.on = function(id, event, handler) {
  if (!handler) {
    handler = event;
    event = id;
  } else {
    event = id + ':' + event;
  }
  return EventedInterface.prototype.on.call(this, event, handler);
};

CanvasEventedInterface.prototype.click = function(x, y) {
  return this.emitMouseEvent(null, 'click', x, y);
};
CanvasEventedInterface.prototype.mousedown = function(x, y) {
  return this.emitMouseEvent(null, 'mousedown', x, y);
};
CanvasEventedInterface.prototype.mouseup = function(x, y) {
  return this.emitMouseEvent(null, 'mouseup', x, y);
};
CanvasEventedInterface.prototype.mousemove = function(x, y) {

  x = x || this.prevMouseMoveX;
  y = y || this.prevMouseMoveY;

  this.prevMouseMoveX = x;
  this.prevMouseMoveY = y;

  if (isNaN(x)) {
    return;
  }

  var eID = this.findIDAtPoint(x, y);

  if (this._curMouseOver !== eID) {
    this.emitMouseEvent(this._curMouseOver, 'mouseleave', x, y);
    this.emitMouseEvent(eID, 'mouseenter', x, y);
    this._curMouseOver = eID;
  }

  return this.emitMouseEvent(null, 'mousemove', x, y);

};

CanvasEventedInterface.prototype.drawThing = function(thing, x, y, width, height, doBindEvents) {

  var me = this;

  x = x || 0;
  y = y || 0;

  width = width || thing.width;
  height = height || thing.height;

  thing.x = x;
  thing.y = y;

  this.context.drawImage(thing.canvas, x, y, width, height);
  this.eventContext.drawImage(thing.eventCanvas, x, y, width, height);

  if (doBindEvents && !(thing.id in this.drawn)) {
    thing.on('mousedown', function(e) { this.id in me.drawn && me.emit('mousedown', e); });
    thing.on('mousemove', function(e) { this.id in me.drawn && me.emit('mousemove', e); });
    thing.on('mouseup', function(e) { this.id in me.drawn && me.emit('mouseup', e); });
    thing.on('click', function(e) { this.id in me.drawn && me.emit('click', e); });
    thing.on('mouseenter', function(e) { this.id in me.drawn && me.emit('mouseenter', e); });
    thing.on('mouseleave', function(e) { this.id in me.drawn && me.emit('mouseleave', e); });
    this.drawn[thing.id] = true;
  }

  return this;

};

CanvasEventedInterface.prototype.clear = function() {
  this.clearRect(0, 0, this.width, this.height);
  return this;
};

CanvasEventedInterface.prototype.clearCompositeEffects = function() {
  this.compositeEffectsCache = {
    shadowBlur: this.get('shadowBlur')
  };
  this.set('shadowBlur', 0);
  return this;
};

CanvasEventedInterface.prototype.restoreCompositeEffects = function() {
  for (var i in this.compositeEffectsCache) {
    this.set(i, this.compositeEffectsCache[i]);
  }
  return this;
};

var c = document.createElement('canvas').getContext('2d');
for (var i in c) {
  if (typeof c[i] == 'function') {
    CanvasEventedInterface.prototype[i] = (function(name) {
      return function() {
        var ret = this.context[name].apply(this.context, arguments);
        this.eventContext[name].apply(this.eventContext, arguments);
        return ret === undef ? this : ret;
      };
    }(i));
  }
}

CanvasEventedInterface.prototype.drawImage = function(img, dx, dy, w, h) {
  this.e_.fillRect(dx, dy, w, h);
  console.log('drawImage', arguments);
  return this.m_.drawImage.apply(this.m_, arguments);
};


/**
 * Construct a new CanvasThing
 * @param width The width of the canvas/thing
 * @param height The height of the canvas/thing
 * @param [draw=clearFunction] The main drawing function
 * @param [stateMemory=10] How many states do you want it to remember
 */
function Thing(width, height, draw, stateMemory) {

  var me = this;

  CanvasEventedInterface.call(this, width, height);

  this._drawFn = draw || function(){
    this.clear();
  };

  this.prevArgs = [];
  this.states = {};
  this.stateKeys = [];

  this.stateMemory = stateMemory == null ? 10 : stateMemory;

  eventRegistry.on(this.id + ':mousemove', function(e) { me.emit('mousemove', e); });
  eventRegistry.on(this.id + ':mousedown', function(e) { me.emit('mousedown', e); });
  eventRegistry.on(this.id + ':mouseup', function(e) { me.emit('mouseup', e); });
  eventRegistry.on(this.id + ':mouseenter', function(e) { me.emit('mouseenter', e); });
  eventRegistry.on(this.id + ':mouseleave', function(e) { me.emit('mouseleave', e); });
  eventRegistry.on(this.id + ':click', function(e) { me.emit('click', e); });

}

Thing.prototype = Object.create(CanvasEventedInterface.prototype);

Thing.prototype.draw = function() {

  var args = [].slice.call(arguments),
      signature = String(args);

  if (signature in this.states) {
    // We have it saved, run the methods:
    this.clear();
    this.clearCompositeEffects();
    this.drawThing(this.states[signature]);
    this.restoreCompositeEffects();
    if (!this.states[signature].canvas.parentNode)
        document.body.appendChild(this.states[signature].canvas);
  } else {
    // Run for the first time with these args:
    this._drawFn.apply(this, args);
    if (this.stateMemory) {
      this.states[signature] = this.clone();
      this.stateKeys.push(signature);
      if (this.stateKeys.length > this.stateMemory) {
        delete this.states[this.stateKeys.shift()];
      }
    }
  }

  return this;

};

/**
 * Primative clone of the Thing Object
 * @param [doCopyEvents] Boolean indicating whether to copy events across
 */
Thing.prototype.clone = function(doCopyEvents) {

  var clone = new Thing(this.width, this.height, this._drawFn);
  if (doCopyEvents) {
    for (var i in this.events) {
      if (hasOwn.call(this.events, i)) {
        clone.events[i] = this.events[i].slice();
      }
    }
  }

  clone.clearCompositeEffects();
  clone.drawThing(this, 0, 0, this.width, this.height, !!doCopyEvents);
  this.restoreCompositeEffects();

  return clone;

};

/**
 * Places the Thing into another Thing, binding to events in the process
 * @param targetThing An instance of Thing that this thing will be placed in
 * @param x The x position of the newly placed thing
 * @param y The y position of the newly placed thing
 * @param [w] The width of the newly placed thing
 * @param [h] The height of the newly placed thing
 */
Thing.prototype.place = function(targetThing, x, y, w, h) {

  var me = this;

  targetThing.drawThing(this, x, y, w, h, true);
  return this;

};

}());
