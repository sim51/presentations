var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    execSync = require('exec-sync'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    connect = require('gulp-connect'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs');

application = {
    name: "prez-generator",
    less: {
        src: ['prez/less/main.less'],
        dest: "dist/css/"
    },
    js: {
        src: ["prez/js/**/*.js"],
        deps: [],
        dest: "dist/js/"
    },
    assets: {
        src: ["prez/assets/**/*.*", "node_modules/@(reveal.js)/**/*.*"],
        dest: "dist/assets"
    }
};


/**
 * LESS compilation.
 */
gulp.task('less', function () {
    var stream = gulp.src('./prez/less/main.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('main.css'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(application.less.dest))
        .pipe(connect.reload());
    return stream;
});

/**
 * Concat & minify JS application files.
 */
gulp.task('js', function () {
    // Make only one concat / minify JS file
    var src = application.js.deps;
    src = src.concat(application.js.src);

    var stream = gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(application.js.dest))
        .pipe(connect.reload());
    return stream;
});

/**
 *  Copy assets to dist directory
 */
gulp.task('assets', function () {
    var stream = gulp.src(application.assets.src)
        .pipe(gulp.dest(application.assets.dest))
        .pipe(connect.reload());
    return stream;
});

/**
 *  Generate asciidoctor
 */
gulp.task('asciidoctor', function () {

    // checkout asciidoctor reveal backend
    if (!fs.existsSync('.tmp/asciidoctor-revealjs')) {
        execSync('git clone git@github.com:sim51/asciidoctor-reveal.js.git .tmp/asciidoctor-reveal.js', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
    }

    // execute asciidoctor
    execSync('asciidoctor -T .tmp/asciidoctor-reveal.js/templates/slim -D dist ./prez/slides/main.adoc', function (err, stdout, stderr) {
        console.log(stderr);
    });
    connect.reload()
});

/**
 * Clean task
 */
gulp.task('clean', function () {
    var stream = gulp.src(['./.tmp', './dist'], {read: false}).pipe(clean());
    return stream;
});

/**
 * Server task
 */
gulp.task('webserver', function () {
    connect.server({
        port: 8001,
        root: 'dist',
        livereload: true
    });
});

/**
 * Gulp watch : on each change file.
 */
gulp.task('watch', function () {

    // watching all file for 'rebuild' & reload
    watch("./prez/**/*.*", {read: false, verbose: true}, function () {
        gulp.start("build");
    });

});

/**
 * Build the application.
 */
gulp.task('build', ['js', 'less', 'assets', 'asciidoctor']);

/**
 * The dev task => run a server with livereload, jshint report, ...
 */
gulp.task('default', ['build', 'webserver', 'watch']);
