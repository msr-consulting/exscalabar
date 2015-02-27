var tab_rows = 0;

/***
 * When the button is pressed on the front panel, the table will be converted to an
 * XML file that will contain all of the steps.
 */
$("#save_cal").click(function() {
	var url = getURL('Calibration/saveCalFile?file_name=' + $("#fileName").val());
	var step = '';
	var val = '';
	var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
	$("#cal-table tr:gt(0)").each(function() {
		step = $(this).find('td:eq(0)').html();
		val = $(this).find('td:eq(1)').html();
		xml += "\t<" + step + ">" + val + '<\\' + step + '>\r\n';
	});
	xml += "<\\OZONE>";
	$("#xml_out").val(xml);

	/* Post the data to the server */
	$.ajax({
		type : "POST",
		url : url,
		data : xml,
	});
});

/***
 * This function handles a double click event on the ozone steps table and
 * adds a row to the cal-table.
 */
$('.tclickable').dblclick(function() {
	var id = $(event.target).attr('id');
	var val = "";

	switch (id) {
	case "O3 Valve":
	case"O2 Valve":
	case"O3 Generator":
	case "Filter":
		val = 'FALSE';
		break;
	case "Wait":
	case "Speaker":
		val = 20;
		break;

	case "QO2":
		val = 100;
		break;
	default:
	}
	tab_rows++;
	$('#cal-table tbody').append("<tr><td class = 'ehead'>" + id + "</td><td id = '" + id + ":" + tab_rows + "' class = 'ecell' contenteditable >" + val + "</td></tr>");
});
/***
 * Handle all the things that need to be handled on startup.
 */
$(document).ready(function() {

	/***
	 * This function WILL be to validate the input.  Right now it does not seem to work.
	 */
	$(".ecell").focusout(function() {
		alert('change fired');
		/*var id = $(event.target).attr('id');
		 $(event).stopPropagation();

		 switch(id) {
		 case 'Wait_':
		 break;
		 case 'Filter_':
		 break;
		 default:

		 }*/
	});
	/* Determine what files are available on the server */
	var url = getURL('Calibration/getO3FolderContent');
	$.get(url, function(data) {
		$("#xml_out").val(data.replace(/,/gi, "\n"));
	}).fail(function() {
		alert('unable to get cals');
	});
	;

	/* Get the current calibration file on start up
	 * and populate the table as appropriate.
	 */
	$.get(getURL('Calibration/getDefaultO3Cal'), function(data) {
		alert(data).fail(function() {
			alert('unable to get cals');
		});
		;
	});

});
