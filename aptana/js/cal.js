var tab_rows = 0;

function getURL(name) {
	var ip = "";
	var port = "";
	if (!( ip = localStorage.getItem('server'))) {
		ip = '192.168.24.73';
	}
	if (!( port = localStorage.getItem('port'))) {
		port = '8001';
	}

	return 'http://' + ip + ':' + port + '/xService/' + name;

}

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
		step = $(this).find('th').html();
		val = $(this).find('td').html();
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
	$('#cal-table tr:last').after('<tr><th>' + id + "</th><td contenteditable id = '" + id + ":" + tab_rows + "' class = 'ecell'>" + val + "</td></tr>");
});

/***
 * This function WILL be to validate the input.  Right now it does not seem to work.
 */
$(".ecell").focusout(function() {
	var id = $(event.target).attr('id');
	$(event).stopPropagation();

	switch(id) {
	case 'Wait_':
		break;
	case 'Filter_':
		break;
	default:

	}
});

$(document).ready(function() {
	var url = getURL('Calibration/getO3FolderContent');
	$.get(url, function(data) {
		$("#xml_out").val(data.replace(/,/gi,"\n"));
	});
	url = getURL('Calibration/getDefaultO3Cal');
	$.get(url,
		function(data){
			alert(data);
		});

});
