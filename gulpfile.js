// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var open = require('gulp-open');
var htmlmin = require('gulp-htmlmin');

/* Since order matters, we can't just glob everything, but we must
* make sure that the files are in the correct order. Since we have
* to alter this list and we don't watch everything, make sure to
* restart gulp if this file is changed.
*/
/* One thing that we have to be sure of is that the AngularJS dependencies
* in each of the scripts are properly resolved and annotated before minification.
* We can do this explicitly with the notation ['dependency', function(dependency){...}]
* or we can drop this notation and use the gulp-ng-annotate.  I am trying to
* keep the dependencies explicity, but look out for problems where these are
* not properly called out (maybe do to a missed capital letter or a misspelling).
*/
//var ngannotate = require('gulp-ng-annotate');

var watch_list = ["app/shared/main.module.js",
"app/shared/network-service.js",
"app/shared/cvt-service.js",
"app/shared/main-config.js",
"app/shared/main-controller.js",
"app/shared/data-service.js",
"app/Messages/msg-directive.js",
"app/Messages/msg-controller.js",
"app/sidebar/sidebar-controller.js",
"views/view-ctl/config.ctlr.js",
"views/cals/startCal-ctl.js",
"views/cals/buildCal-service.js",
"views/cals/o3-table-ctl.js",
"views/cals/saveProfile-service.js",
"views/cals/saveData-ctrl.js",
"views/cals/tableInput-ctlr.js",
"views/view-ctl/filter-ctlr.js",
"views/view-ctl/power-ctlr.js",
"views/view-ctl/crd.ctlr.js",
"views/view-ctl/pas-ctlr.js",
"views/view-ctl/pas-spk-ctlr.js",
"views/view-ctl/pas-las-ctlr.js",
"views/view-ctl/flow.ctlr.js",
"views/view-ctl/humidifier-ctlr.js",
"app/msg/msg-directive.js",
"app/sidebar/sidebar-directive.js",
"app/navigation/nav.service.js",
"app/navigation/nav-directive.js",
"app/navigation/nav.ctlr.js",
"assets/contextMenu.js"];


/* Lint Task - check for errors in the js code... */
gulp.task('lint', function() {
	return gulp.src(watch_list)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src(watch_list)
	.pipe(concat('exscalabar.js'))
	.pipe(gulp.dest('assets'))
	.pipe(rename('exscalabar.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('assets'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch(watch_list, ['lint', 'scripts']);
});

/* Make a connection on port 8080. */
gulp.task('connect', function(){
	connect.server({
		livereload:true
	});
});

/* This will open the UI in the default browser. */
gulp.task('open', function(){
	gulp.src(__filename)
	.pipe(open({uri: 'http://localhost:8080'}));
});

/*gulp.task('minify', function() {
  return gulp.src('views/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});*/

// Default Task
gulp.task('default', ['lint', 'scripts', 'connect', 'open', 'watch']);

// TODO: add different builds for distribution and development...
