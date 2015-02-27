function pop_nav(loc){ 

	var sub_drop = "ctl/"
	var cals = "cals/";
	var index = '';
	switch (loc){
		case "crds.html":
		case "pas.html":
		case "flow.html":
			sub_drop = "";
			index = "../";
			cals = "../cals/";
			break;
		case "ozone.html":
			sub_drop = "../ctl/";
			index = "../";
			cals = "";
		default:
			break;
	}
	var d_sel = {crds: "CRDS", pas: "PAS", flow: "Flow Control"};
	
	var dropdown = "";
	
	for (var i in d_sel){
		dropdown += "<li>\<a href='" + sub_drop + i + ".html'>" + d_sel[i] + "</a></li>";
	}
	var cal_path = "<li><a href='" + cals + "ozone.html'>Calibration<span class='sr-only'>(current)</span></a></li>";
	
	
	document.getElementById("xnav").innerHTML ='<nav class="navbar navbar-default">\
			<div class="container-fluid">\
				<!-- Brand and toggle get grouped for better mobile display -->\
				<div class="navbar-header">\
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">\
						<span class="sr-only">Toggle navigation</span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
					</button>\
					<a class="navbar-brand" href="' + index + 'index.html">EXSCALABAR</a>\
				</div>\
					\
				<!-- Collect the nav links, forms, and other content for toggling -->\
				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">\
					<ul class="nav navbar-nav">\
						<li class="dropdown">\
							<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">System Control<span class="caret"></span></a>\
							<ul class="dropdown-menu" role="menu">' + dropdown + '</ul></li>'+ cal_path + '<li><a href="#">Housekeeping</a></li>\
					</ul>\
							\
				</div><!-- /.navbar-collapse -->\
			</div><!-- /.container-fluid -->\
		</nav>';
		
		document.getElementById("snav").innerHTML ='<nav class="bs-docs-sidebar hidden-print affix-top">\
						<ul class="nav bs-docs-sidenav">\
							<li class>\
								<button class="btn btn-default" type="button">\
									Save\
								</button>\
								<button class="btn btn-default">\
									Filter\
								</button>\
							</li>\
							<li class>\
										<div class="form-group" id="address">	\
										<label class = "ctl-label" for="ip">IP</label>	\
										<input type="text" id="ip" data-toggle="tooltip" data-placement="right" title="Blue laser repetition rate (in Hz)."/>	<br>\
										<label class = "ctl-label" for="port">Port</label>\
										<input type="text" id="port" class="ctl-input" />\
									</div>\
							</li>\
							<li class>\
								<div id = "connection"></div>\
								</li>\
						</ul>\
					</nav>';
}

