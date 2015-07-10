// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var alt_watch_list = ["app/shared/main.module.js",
"app/shared/network-service.js",
"app/shared/cvt-service.js",
"app/shared/main-config.js",
"app/shared/main-controller.js",
"app/shared/data-service.js",
"app/sidebar/sidebar-controller.js",
"views/view-ctl/crd.ctlr.js",
"views/view-ctl/mainPas.ctlr.js",
"views/view-ctl/pas-ctlr.js",
"views/view-ctl/pasGraph.ctl.js",
"views/cals/o3-table-ctl.js",
"views/cals/buildCal-service.js",
"views/cals/saveProfile-service.js",
"views/cals/saveData-ctrl.js",
"views/cals/tableInput-ctlr.js",
"app/msg/msg-directive.js",
"app/sidebar/sidebar-directive.js",
"app/navigation/nav-directive.js",
"assets/contextMenu.js"];

var watch_list = ['./app/**/*.js', './views/**/*.js'];

// Lint Task
gulp.task('lint', function() {
    return gulp.src(alt_watch_list)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(alt_watch_list)
        .pipe(concat('exscalabar.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('exscalabar.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(alt_watch_list, ['lint','scripts']);
    gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'watch']);