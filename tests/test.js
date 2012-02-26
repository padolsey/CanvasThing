
module('EventedInterface');

test('Can bind to and trigger event', function() {
  expect(2);
  var e = new CanvasThing.EventedInterface,
      handler = function(arg){ ok(arg === 123); };
  e.on('foo', handler);
  ok(e.events.foo[0] === handler);
  e.emit('foo', 123);
});

test('Can bind multiple to same event', function() {
  var e = new CanvasThing.EventedInterface;
  e.on('foo', function(){}).on('foo', function(){});
  equal(e.events.foo.length, 2);
});

test('Can trigger multiple', function() {
  expect(3);
  var e = new CanvasThing.EventedInterface,
      a = function() {ok(true);},
      b = function() {ok(true);},
      c = function() {ok(true);};
  e.on('abc', a).on('abc', b).on('abc', c);
  e.emit('abc');
});

test('Can unbind event', function() {
  var e = new CanvasThing.EventedInterface,
      handler = function() {};
  e.on('h', handler);
  ok(e.events.h[0] === handler);
  e.off('h', handler);
  ok(e.events.h[0] === undefined);
});

test('Can unbind all handlers of single event type', function() {
  var e = new CanvasThing.EventedInterface,
      handler = function() {};
  e.on('h', handler);
  e.on('h', handler);
  ok(e.events.h[0] === handler);
  ok(e.events.h[1] === handler);
  e.off('h');
  ok(e.events.h === undefined);
});

module('CanvasEventedInterface');

test('Construct', function() {
  var c = new CanvasThing.CanvasEventedInterface(100, 100);
  equal(c.width, 100);
  equal(c.height, 100);
  ok(!!c.canvas);
  ok(!!c.context);
  ok(!!c.eventCanvas);
  ok(!!c.eventContext);
});

test('findIDAtPoint', function() {
  var c = new CanvasThing.CanvasEventedInterface(100, 100),
      a = new CanvasThing.CanvasEventedInterface(10, 10);
  a.fillRect(0, 0, 10, 10);
  c.drawThing(a);
  document.body.appendChild(c.canvas);
  equal(c.findIDAtPoint(0, 0), a.id);
});

module('CanvasThing');

test('Basic events setup', function() {

  expect(1);

  var container = new CanvasThing(100, 100),
      square = new CanvasThing(10, 10, function() {
        this.set('fillStyle', 'red');
        this.fillRect(0, 0, 10, 10);
      });

  container.on('mousemove', function() { ok(true); });

  // Emit on square -- should bubble up to container.

  container.drawThing(square);
  square.emit('mousemove'); // don't fire

  container.drawThing(square, null, null, null, null, true);
  square.emit('mousemove'); // do fire

});

test('Basic states', function() {

  var a = new CanvasThing(100, 100, function(val) {

  }, 2);

  a.draw();
  a.on('mousemove', function(){});
  ok(!!a.states['']);
  equal(a.states[''].events.mousemove, undefined); // events have NOT been copied
  a.draw(1, 2, 3);
  ok(!!a.states['1,2,3']);
  a.draw('foo');
  ok(!!a.states['foo']);   // should exist
  ok(!!a.states['1,2,3']); // should exist
  ok(!a.states['']);       // should not exist (due to memory of 2!)

});

