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
var sass = require('gulp-sass');
var ngdocs = require('gulp-ngdocs');
var bump = require('gulp-bump');

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

var watch_list = ["main/main.module.js",
    "network/network-service.js",
    "cvt/cvt-service.js",
    "main/main-config.js",
    "main/ex.readconfig.svc.js",
    "main/ex.main.ctl.js",
    "data/data-service.js",
    "msgs/ex.msg.svc.js",
    "msgs/ex.msg.directive.js",
    "msgs/ex.msg.ctl.js",
    "sidebar/sidebar-controller.js",
    "alicat/alicat.config.ctlr.js",
    "alicat/ex.flow.svc.js",
    "footer/ex.footer.ctl.js",
    "power/ex.power.ctl.js",
    "config/config.ctlr.js",
    "filter/ex.filter.ctl.js",
    "crd/ex.crd.svc.js",
    "crd/ex.crd.ctl.js",
    "crd/ex.crdplot.dir.js",
    "pas/ex.pas.ctl.js",
    "pas/ex.pas.svc.js",
    "pas/ex.passpk.ctl.js",
    "pas/ex.paslas.ctl.js",
    "pas/ex.pasplot.dir.js",
    "alicat/ex.flow.ctl.js",
    "alicat/ex.flowplot.dir.js",
    "ppt/ex.ppt.svc.js",
    "humidity/ex.humidity.ctl.js",
    "o3/startCal-ctl.js",
    "o3/o3-table-ctl.js",
    "o3/buildCal-service.js",
    "o3/saveProfile-service.js",
    "o3/saveData-ctrl.js",
    "o3/tableInput-ctlr.js",
    "sidebar/sidebar-directive.js",
    "nav/nav.service.js",
    "nav/nav-directive.js",
    "nav/nav.ctlr.js"];

// List of external assets required by the GUI
// These are not expected to change.
var assets = ["assets/jquery/jquery-2.1.4.js",
    "assets/angular.js",
    "assets/angular-route.js",
    "assets/ui-bootstrap-0.9.0.js",
    "assets/ui-bootstrap-tpls-0.9.0.js",
    "assets/cm/contextMenu.js",
    "assets/angular/angular-sanitize.js"];

// Angular Dygraph assets
var adJS = ["assets/ad/js/cirrus-dygraphs-dev.js",
    "assets/ad/js/angular-dygraph.js"];

// Cirrus GUI elements
var cuiJS = ["assets/cui/ibutton/ibutton.js",
    "assets/cui/inumeric/inumeric.js",
    "assets/cui/istring/istring.js"];

// Tested list of dygraph
var docList = [
//"assets/angular.js",
    //"assets/angular-route.js",
    "assets/ui-bootstrap-0.9.0.js",
    "assets/ui-bootstrap-tpls-0.9.0.js",
    "assets/cm/contextMenu.js",
    //"assets/angular/angular-sanitize.js",
    "main/main.module.js",
    "main/ex.readconfig.svc.js",
    "main/main-config.js",
    "main/ex.main.ctl.js",
    "data/data-service.js",
    "msgs/msg-directive.js",
    "network/network-service.js",
    "cvt/cvt-service.js",
    "nav/nav.ctlr.js",
    "alicat/ex.flow.svc.js",
    "alicat/ex.flow.ctl.js",
    "alicat/ex.flowplot.dir.js",
    "msgs/ex.msg.svc.js",
    "crd/ex.crd.svc.js",
    "pas/ex.pas.svc.js",
    "pas/ex.pasplot.dir.js"
];


/* Lint Task - check for errors in the js code... */
gulp.task('lint', function () {
    return gulp.src(watch_list)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src(watch_list)
        .pipe(concat('exscalabar.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('exscalabar.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(concat('ad.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('ad.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(concat('cui.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('cui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(concat('assets.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('assets.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

/* Handle SASS preprocessor files */
gulp.task('styles', function () {
    gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css/'));
});

gulp.task('ngdocs', function () {

    var options = {
        html5Mode: false,
        title: 'EXSCALABAR UI'
    }
    return gulp.src(docList)
        .pipe(ngdocs.process(options))
        .pipe(gulp.dest('./docs'));

});


/* Make a connection on port 8080. */
gulp.task('connect', function () {
    connect.server({
        livereload: true
    });
});

/* Make a connection on port 8080. */
gulp.task('connect2docs', function () {
    connect.server({
        root: 'docs',
        livereload: true,
        port: 8000
    });
    console.log('Server started on http://localhost:8000');
});

// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch(watch_list, ['lint', 'scripts', 'ngdocs']);
    //gulp.watch('sass/**/*.scss', ['styles']);
});

/* This will open the UI in the default browser. */
gulp.task('open', function () {
    gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:8080'
        }));
});

gulp.task('bump-major', function(){
    gulp.src('./*.json')
        .pipe(bump({type:'major'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function(){
    gulp.src('./*.json')
        .pipe(bump({type:'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-patch', function(){
    gulp.src('./*.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

/*gulp.task('minify', function() {
 return gulp.src('views/*.html')
 .pipe(htmlmin({collapseWhitespace: true}))
 .pipe(gulp.dest('dist'))
 });*/

// Default Task
gulp.task('default', ['lint', 'scripts', 'styles', 'ngdocs', 'connect', 'connect2docs', 'open', 'watch']);

gulp.task('no-browse', ['lint', 'scripts', 'styles', 'ngdocs', 'watch', 'connect2docs']);
// TODO: add different builds for distribution and development...