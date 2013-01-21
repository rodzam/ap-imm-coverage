{$(document).ready(function() { // waits for the DOM to be ready before executing
	$('.tooltip').tooltipster({ // call tooltipster for each element with a class "tooltip"
		tooltipTheme: '.simpleclear', // uses a custom theme ("simpleclear") from the tooltipser css; see that file for settings
		speed: 250, // sets the speed for the transitions (fade in and out)
		delay: 100 // sets the delay for how long the cursor must be atop an element before the tooltip shows
	});
});
}