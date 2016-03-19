var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    child_process = require('child_process'),
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
    try {
        fs.accessSync('.tmp/asciidoctor-reveal.js', fs.F_OK);
        // Do nothing
    } catch (e) {
        child_process.execSync('git clone https://github.com/asciidoctor/asciidoctor-reveal.js .tmp/asciidoctor-reveal.js', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
    }

    // execute asciidoctor
    child_process.execSync('asciidoctor -r asciidoctor-diagram -T .tmp/asciidoctor-reveal.js/templates/slim -D dist ./prez/slides/index.adoc', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });

    gulp.src("").pipe(connect.reload());
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
        livereload: true,
        root: 'dist',
        fallback: './dist/index.html'
    });
});

/**
 * Print as PDF file
 */
gulp.task('pdf', function () {

    connect.server({
        port: 8888,
        root: 'dist'
    });
    child_process.exec('./node_modules/phantomjs-prebuilt/bin/phantomjs print-pdf.js "http://localhost:8888/index.html?print-pdf" slides.pdf', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        connect.serverClose();
    });

});

/**
 * Gulp watch : on each change file.
 */
gulp.task('watch', function () {

    // watching all file for 'rebuild' & reload
    watch("./prez/slides/**/*.adoc", {read: false, verbose: true}, function () {
        gulp.start("asciidoctor");
    });
    // watching all file for 'rebuild' & reload
    watch("./prez/assets/**/*", {read: false, verbose: true}, function () {
        gulp.start("assets");
    });
    // watching all file for 'rebuild' & reload
    watch("./prez/less/**/*.less", {read: false, verbose: true}, function () {
        gulp.start("less");
    });

});

/**
 * Build the application.
 */
gulp.task('build', ['less', 'assets', 'asciidoctor']);

/**
 * The dev task => run a server with livereload
 */
gulp.task('default', ['build', 'webserver', 'watch']);
