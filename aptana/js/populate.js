function pop_nav(curr_level){ 
	var access_ctl = "ctl/";
	
	if (curr_level == undefined){
		curr_level = 0;
	}
	
	switch (curr_level){
		case 1: /*ctl*/
			access_ctl = "";
			break;
		default:
			break;
		
	}
	
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
					<a class="navbar-brand" href="index.html">EXSCALABAR</a>\
				</div>\
					\
				<!-- Collect the nav links, forms, and other content for toggling -->\
				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">\
					<ul class="nav navbar-nav">\
						<li class="dropdown">\
							<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">System Control<span class="caret"></span></a>\
							<ul class="dropdown-menu" role="menu">\
								<li>\
									<a href="ctl/crds.html">CRDS</a>\
								</li>\
								<li>\
									<a href="ctl/pas.html">PAS</a>\
								</li>\
								<li>\
									<a href="ctl/flow.html">Flow Control</a>\
								</li>\
							</ul>\
						</li>\
						<li>\
							<a href="#">Calibration <span class="sr-only">(current)</span></a>\
						</li>\
						<li>\
							<a href="#">Housekeeping</a>\
						</li>\
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
\
							</li>\
						</ul>\
					</nav>';
}

