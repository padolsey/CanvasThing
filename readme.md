
CanvasThing is a low-level HTML5 Canvas API wrapper with graphical buffering and event support.

You work with the same canvas API that you know and love, with only one difference: before, you would do:

```javascript
context.fillStyle = 'red';
```

With CanvasThing you have to do:

```javascript
canvasThingInstance.set('fillStyle', 'red');
```

This is for all settable properties that you'd usually find on a 2D context.



What does this mean?

It means you can do stuff like:

var myCanvas = new CanvasThing(700, 700);

var myCircle = new CanvasThing(100, 100, function(color) {
	this.beginPath();
	this.arc(50, 50, 50, 0, Math.PI*2, false);
	this.closePath();
	this.set('fillStyle', color);
	this.fill();
});

myCircle
	.draw('red')
	.place(myCanvas, 350, 350);
	.on('mouseenter', function() {
		myCircle.draw('blue');
	})
	.on('mouseleave', function() {
		myCircle.draw('red');
	})