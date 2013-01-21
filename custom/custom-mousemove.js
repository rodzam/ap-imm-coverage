{
var mouseX; // creates a new variable for mouse movement on the horizontal axis
var mouseY; // creates a new variable for mouse movement on the vertical axis
$(document).mousemove( function(e) { // Uses jQuery and capture the mouse movement across the document
   mouseX = e.pageX; // Set mouseX to the cursor location on the horizontal axis
   mouseY = e.pageY; // Set mouseY to the cursor location on the vertical axis
});
}