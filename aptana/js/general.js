/**
 * @author Matt
 */
var timer;
/** Store the maximum number of points to be recorded in a
 * a data plot.  The maximum number of points is placed in the
 * localStorage object under the key maxSize.
 * @param {Integer} num - number of points to save for plot display
 */
function setMaxStore(num) {
	localStorage.maxSize = String(num);
}

/**
 *
 * @param {String} key
 * @param {Numeric} newVal
 */
function storeData(key, newVal) {
	var storedData = JSON.parse(localStorage[key]);

	if (storedData.length < localStorage.maxSize) {
		storedData.unshift(newVal);
	} else {
		storedData.pop();
		storedData.unshift(newVal);
	}

	localStorage[key] = JSON.stringify(storedData);

}

/***
 * Get the URL based on the current ip and port
 * for the server.
 * @param name: name of the web service to be called.
 * @return	  : string containing the http address
 * 				of the web service.
 */
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
 * Use this function to get data.
 * The data coming off of the server is being served
 * as JSON data.
 */
function getData() {
	$.getJSON(getURL('General/Data'), function(data) {
		alert(data);
		$("#connection").html("<div  class='alert alert-success connect' role='alert'>Connected</div>");
		
	}).fail(function() {
		$("#connection").html("<div  class='alert alert-danger connect' role='alert'><b>No Connection</b></div>");
		clearInterval(timer);
	});

}

function checkAddress() {
	var ip,
	    port;
	if (!( ip = localStorage.getItem('server'))) {
		ip = '192.168.24.73';
		localStorage.setItem('server', ip);
	}
	if (!( port = localStorage.getItem('port'))) {
		port = '8001';
		localStorage.setItem('port', port);
	}
	$("#ip").val(ip);
	$("#port").val(port);

}


$(document).ready(function() {

	var loc = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
	pop_nav(loc);
	checkAddress();
	
	$("#connection").html("<div class='alert alert-warning connect' role='alert'>Wait on Connect</div>");
	
	/* Set the global time out to 500 ms for AJAX requests */
	$.ajaxSetup({timeout:500});

	$("#ip").on('change', function() {
		localStorage.setItem('server', $(this).val());
	});
	$("#port").on('change', function() {
		localStorage.setItem('port', $(this).val());
	});

	/* Call getData at regular intervals to retrieve the data as necessary */
	timer = setInterval(getData, 1000);
});
