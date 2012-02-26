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

