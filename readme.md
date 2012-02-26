CanvasThing is a low-level HTML5 Canvas API wrapper with graphical caching and mouse-event support.

A `CanvasThing` instance is essentially a new canvas 2D context that you can treat just like regular. 

```javascript
var c = new CanvasThing(200, 200);

document.body.appendChild(c.getElement());

c.set('fillStyle', 'red');
c.fillRect(0, 0, 100, 100);
```

You'll notice that instead of doing `c.fillStyle=...` we're doing `c.set('fillStyle', ...)`. This is the only major difference between a regular 2DContext and CanvasThing.

### Events

CanvasThing is quite special because each instance can listen for events in its populated pixels. So, we can bind a `click` listener to the red square we created like this:

```javascript
// Let's do some chaining too:

document.body.appendChild(

  new CanvasThing(200, 200)
    .set('fillStyle', 'red')
    .fillRect(0, 0, 100, 100)
    .on('click', function() {
      alert('You clicked on the red square');
    })
    .getElement() // append actual <canvas> to body

);
```

CanvasThing supports the following events:

 * click
 * mouseenter
 * mouseleave
 * mousedown
 * mouseup
 * mousemove

### Adding things to things

You can place one `CanvasThing` instance into another. A single CanvasThing instance of hierarchy-agnostic. It doesn't know where it is.

```javascript
var stage = new CanvasThing(500, 500);
var bigCircle = new CanvasThing(300, 300);
var smallCircle = new CanvasThing(100, 100);

bigCircle.beginPath();
bigCircle.arc(150, 150, 150, 0, Math.PI*2, false);
bigCircle.closePath();
bigCircle.set('fillStyle', 'blue');
bigCircle.fill();

smallCircle.beginPath();
smallCircle.arc(50, 50, 50, 0, Math.PI*2, false);
smallCircle.closePath();
smallCircle.set('fillStyle', 'yellow');
smallCircle.fill();

smallCircle.place(bigCircle, 100, 100);
bigCircle.place(stage);

document.body.appendChild(stage.getElement());
```

We've added `smallCircle` to `bigCircle` and `bigCircle` to `stage` and we've appended the stage's `<canvas>` to `<body>`.

Of course, we could have just added both circles directly to the stage. But, by adding `smallCircle` to `bigCircle` we've got a event-propagation tree, just like in the DOM. All supported events other than `mouseleave` and `mouseenter` will bubble.