/**
 * @author Matt
 */

/* Handle speaker change */
$('#renable').on('click', function() {
	if ($(this).text() == 'Red Enabled') {
		$(this).text('Red Disabled');
	} else {
		$(this).text('Red Enabled');
	}
});

/* Handle speaker change */
$('#benable').on('click', function() {
	if ($(this).text() == 'Blue Enabled') {
		$(this).text('Blue Disabled');
	} else {
		$(this).text('Blue Enabled');
	}
});
/* Handle speaker change */
$('#tau').on('click', function() {
	d3.select("#chart svg").yaxis.axislabel('Tau (Mm-1)');
});