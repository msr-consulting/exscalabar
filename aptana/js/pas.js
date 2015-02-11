var server = "http://exscalabar.io";
var sPort = ":8000";
var webService = "/xService";
/*** SPEAKER FUNCTIONS ***/


/* Handle speaker change */
$('#spk_on').on('click', function() {
	var spk_val = 0;
	if ($(this).text() == 'Laser') {
		$(this).text('Speaker');
		spk_val = 1;
	} else {
		$(this).text('Laser');
	}
})
/* Handle change in speaker range */
$('#svrange').on('change', function() {
	var range = $(this).val();
})
/* Handle change in speaker offset */
$('#svoffset').on('change', function() {
	var offset = $(this).val();
})
/* Handle change in speaker offset */
$('#df').on('change', function() {
	var df = $(this).val();
})
/* Handle change in speaker offset */
$('#fcenter').on('change', function() {
	var fcenter = $(this).val();
})
/* Handle speaker change */
$('#cycle_on').on('click', function() {
	var spk_val = 0;
	if ($(this).text() == 'Man') {
		$(this).text('Auto');
		spk_val = 1;
	} else {
		$(this).text('Man');
	}
})

function getPASData(){
	$.ajax(
		{
			url:"http://exscalabar.io:8000/xService/General/Data", 
			crossDomain:true, 
			dataType:"json",
			type:"GET"
			
		}
	)
	.done(function(data){;});
}
