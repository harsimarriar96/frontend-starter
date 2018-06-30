var gulp = require('gulp');

var babel = require('gulp-babel');
var watch = require('gulp-watch');

var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

// var notify = require('gulp-notify'); //To be used in future updates

var rename = require('gulp-rename');
var clean = require('gulp-clean');
var concat = require('gulp-concat');

var autoPrefixer = require('gulp-autoprefixer');
var inject = require('gulp-inject');

var imageMinify = require('gulp-imagemin');
var svgMinify = require('gulp-svgmin');
var htmlMinify = require('gulp-htmlmin');
var cssMinify = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var esLint = require('gulp-eslint');

//var iconFont = require('gulp-iconfont'); //To be used in future updates.

var sass = require('gulp-sass');
var stylus = require('gulp-stylus');
var less = require('gulp-less');

var jade = require('gulp-jade');

var mainBowerFiles = require('main-bower-files');

var browserVersions = ['last 4 versions'];

// Compression

gulp.task('compress:images', function() {
    gulp.src('app/tmp/assets/images/**/*')
        .pipe(imageMinify())
        .pipe(gulp.dest('app/dist/assets/images'))
});

gulp.task('compress:css', function() {
    return gulp.src('app/tmp/assets/css/*.css')
        .pipe(clean())
        .pipe(concat('styles.min.css'))
        .pipe(cssMinify())
        .pipe(gulp.dest('app/tmp/assets/css'))
});

gulp.task('compress:js', function() {
    gulp.src('app/tmp/assets/js/**/*.js')
        .pipe(concat('scripts.min.js'))
        .pipe(babel({
            presets: ['es2015', 'stage-2', 'es2016']
          }))
        .pipe(uglify())
        .pipe(gulp.dest('app/dist/assets/js'))
});

gulp.task('compress:html', function() {
    gulp.src('app/src/*.html')
        .pipe(htmlMinify({ 
            collapseWhitespace: true, 
            removeComments: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true }))
        .pipe(gulp.dest('app/dist'))
});

gulp.task('compress:svg', function() {
    gulp.src('app/src/assets/images/**/*.svg')
        .pipe(svgMinify())
        .pipe(gulp.dest('app/tmp/assets/images'))
});

gulp.task('compress', ['compress:html', 'compress:css', 'compress:js', 'compress:images', 'compress:svg']);

//Add / Inject

gulp.task('add:bower:css', function() {
    return gulp.src(mainBowerFiles('**/*.css'))
    .pipe(gulp.dest('app/tmp/assets/components'));
});

gulp.task('add:bower:js', function() {
    return gulp.src(mainBowerFiles('**/*.js'))
    .pipe(gulp.dest('app/tmp/assets/components'));
});

gulp.task('add:components:css', function() {
    return gulp.src('components/*.{css,min.css}')
    .pipe(gulp.dest('app/tmp/assets/components'));
});

gulp.task('add:components:js', function() {
    return gulp.src('components/*.{js,min.js}')
    .pipe(gulp.dest('app/tmp/assets/components'));
});

gulp.task('add:dependencies', function(callback) {
    runSequence('add:bower:css', 'add:bower:js', 'add:components:css', 'add:components:js', callback);
});
gulp.task('inject:dependencies', function() {
    return gulp.src('app/tmp/**/*.html')
        .pipe(inject(gulp.src('app/tmp/assets/components/*.css', { read: false }), { relative: true, name: 'components' }))
        .pipe(inject(gulp.src('app/tmp/assets/components/*.js', { read: false }), { relative: true, name: 'components'}))
        .pipe(gulp.dest('app/tmp'));
});


// Compile

gulp.task('compile:sass', function() {
    gulp.src('app/src/assets/css/**/*.{sass,scss}')
        .pipe(plumber())
        .pipe(sass({errLogToConsole: true}))
        .pipe(autoPrefixer({
            browsers: browserVersions,
            cascade: false
        }))
        .pipe(concat('sass.css'))
        .pipe(gulp.dest('app/tmp/assets/css'));
});

gulp.task('compile:stylus', function() {
    gulp.src('app/src/assets/css/**/*.styl')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(autoPrefixer({
            browsers: browserVersions,
            cascade: false
        }))
        .pipe(concat('stylus.css'))
        .pipe(gulp.dest('app/tmp/assets/css'));
});

gulp.task('compile:less', function() {
    gulp.src('app/src/assets/css/**/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(autoPrefixer({
        browsers: browserVersions,
        cascade: false
    }))
    .pipe(concat('less.css'))
    .pipe(gulp.dest('app/tmp/assets/css')); 
});

gulp.task('compile:jade', function() {
    gulp.src('app/src/**/*.jade')
        .pipe(plumber())
        .pipe(jade())
        .pipe(gulp.dest('app/tmp'));
});

gulp.task('compile', function(callback) {
    return runSequence('compile:sass', 'compile:stylus', 'compile:less', 'compile:jade', callback);
});


//Copy Files

gulp.task('copy:js', function() {
    return gulp.src('app/src/assets/js/**/*.js')
        .pipe(esLint({
            "extends": ['google'],
            "useEslintrc": false
        }))
        .pipe(concat('scripts.min.js'))
        .pipe(babel({
            presets: ['es2015', 'stage-2', 'es2016']
          }))
        .pipe(uglify())
        .pipe(gulp.dest('app/tmp/assets/js'));
});

gulp.task('copy:css', function() {
    return gulp.src('app/src/assets/css/**/*.css')
        .pipe(autoPrefixer({
            browsers: browserVersions,
            cascade: false
        }))
        .pipe(concat('raw-styles.css'))
        .pipe(gulp.dest('app/tmp/assets/css'));
});

gulp.task('copy:html', function() {
    return gulp.src('app/src/**/*.html').pipe(gulp.dest('app/tmp'));
});

gulp.task('copy:images', function() {
    return gulp.src('app/src/assets/images/**/*.{jpg,jpeg,svg,png,gif,webp}').pipe(gulp.dest('app/tmp/assets/images'));
});

gulp.task('copy', function(callback) {
    return runSequence('copy:html', 'copy:css', 'copy:js', 'copy:images', callback);
});

//Main
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "app/tmp",
            routes: {
                "/bower_components" : "bower_components",
                "/compoenents" : "components"
            }

            
        }
    });
    watch('app/src/assets/css/**/*.{scss,sass}', function() {
        runSequence('compile:sass', 'compress:css');
    });
    watch('app/src/assets/css/**/*.styl', function() {
        runSequence('compile:stylus', 'compress:css');
    });
    watch('app/src/assets/css/**/*.less', function() {
        runSequence('compile:less', 'compress:css');
    });
    watch('app/src/**/*.jade', function() {
        gulp.start('compile:jade');
        gulp.start('inject:dependencies');
    });
    watch('app/src/assets/images', function() {
        gulp.start('copy:images');
    });
    watch('app/src/assets/css/**/*.css', function() {
        runSequence('copy:css', 'compress:css');
    });
    watch('app/src/assets/js/**/*.js', function() {
        gulp.start('copy:js');
    });
    watch('app/src/**/*.html', function() {
        runSequence('copy:html', 'inject:dependencies');
    });
});

gulp.task('test', function(callback) {
    return runSequence('clean', 'compile', 'copy', 'compress:css', 'add:dependencies', 'inject:dependencies', 'serve', callback);
});

//Clean

gulp.task('clean:tmp', function() {
    return gulp.src('app/tmp', {read: false}).pipe(clean());
});

gulp.task('clean:dist', function() {
    return gulp.src('app/dist/').pipe(clean());
});

gulp.task('clean', function(callback) {
    return runSequence('clean:dist', 'clean:tmp', callback);
});


// Build

gulp.task('build:js-bower', function() {
    return gulp.src(mainBowerFiles(['**/*.js']))
    .pipe(babel({
        presets: ['es2015', 'stage-2', 'es2016']
      }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/dist/assets/js'));
});

gulp.task('build:css-bower', function() {
    return gulp.src(mainBowerFiles(['**/*.css']))
    .pipe(cssMinify())
    .pipe(rename({ suffix: '.min'}))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:js-components', function() {
    return gulp.src(['components/**/*.js', '!components/**/*.min.js'])
    .pipe(babel({
        presets: ['es2015', 'stage-2', 'es2016']
      }))
    .pipe(uglify())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('app/dist/assets/js'));
});

gulp.task('build:js-components-minified', function() {
    return gulp.src('components/**/*.min.js').pipe(gulp.dest('app/dist/assets/js'));
});

gulp.task('build:css-components', function() {
    return gulp.src(['components/**/*.css', '!components/**/*.min.css'])
    .pipe(cssMinify())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:css-components-minified', function() {
    return gulp.src('components/**/*.min.css').pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:components', function(callback) {
    runSequence('build:js-bower', 'build:css-bower', 'build:js-components', 'build:js-components-minified', 'build:css-components', 'build:css-components-minified', callback);
});

gulp.task('build:images', function() {
    gulp.src('app/src/assets/images/**/*.{jpg,jpeg,svg,png,gif,webp}')
        .pipe(imageMinify())
        .pipe(gulp.dest('app/dist/assets/images'))

    gulp.src('app/src/assets/images/**/*.svg')
        .pipe(imageMinify())
        .pipe(gulp.dest('app/dist/assets/images'))
});

gulp.task('build:js', function() {
    gulp.src('app/src/assets/js/**/*.js')
        .pipe(concat('scripts.min.js'))
        .pipe(babel({
            presets: ['es2015', 'stage-2', 'es2016']
          }))
        .pipe(uglify())
        .pipe(gulp.dest('app/dist/assets/js'));
});

gulp.task('build:raw-css', function() {
    return gulp.src('app/src/assets/css/**/*.css')
    .pipe(autoPrefixer({
        browsers: browserVersions,
        cascade: false
    }))
    .pipe(cssMinify())
    .pipe(concat('raw-styles.css'))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:sass-css', function() {
    return gulp.src('app/src/assets/css/**/*.{sass,scss}')
    .pipe(autoPrefixer({
        browsers: browserVersions,
        cascade: false
    }))
    .pipe(cssMinify())
    .pipe(concat('sass-styles.css'))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:stylus-css', function() {
    return gulp.src('app/src/assets/css/**/*.styl')
    .pipe(autoPrefixer({
        browsers: browserVersions,
        cascade: false
    }))
    .pipe(cssMinify())
    .pipe(concat('stylus-styles.css'))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:less-css', function() {
    return gulp.src('app/src/assets/css/**/*.less')
    .pipe(autoPrefixer({
        browsers: browserVersions,
        cascade: false
    }))
    .pipe(cssMinify())
    .pipe(concat('less-styles.css'))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:final-css', function() {
    return gulp.src('app/dist/assets/css/*.css')
    .pipe(clean())
    .pipe(cssMinify())
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('app/dist/assets/css'));
});

gulp.task('build:css', function(callback) {
    runSequence('build:raw-css', 'build:sass-css', 'build:stylus-css', 'build:less-css', 'build:final-css', callback);
});

gulp.task('build:html', function() {
    gulp.src('app/src/**/*.html')
    .pipe(inject(gulp.src(['app/dist/assets/css/**/*.min.css', '!app/dist/assets/css/styles.min.css'], { read: false }), { relative: true }))
    .pipe(inject(gulp.src(['app/dist/assets/js/**/*.min.js', '!app/dist/assets/js/scripts.min.js'], { read: false }), { relative: true }))
    .pipe(htmlMinify({ 
        collapseWhitespace: true, 
        removeComments: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true,
        minifyCSS: true,
        minifyJS: true }))
    .pipe(gulp.dest('app/dist'));
    
    gulp.src('app/src/**/*.jade')
    .pipe(jade())
    .pipe(inject(gulp.src(['app/dist/assets/css/**/*.min.css', '!app/dist/assets/css/styles.min.css'], { read: false }), { relative: true }))
    .pipe(inject(gulp.src(['app/dist/assets/js/**/*.min.js', '!app/dist/assets/js/scripts.min.js'], { read: false }), { relative: true }))
    .pipe(htmlMinify({ 
        collapseWhitespace: true, 
        removeComments: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true,
        minifyCSS: true,
        minifyJS: true }))
    .pipe(gulp.dest('app/dist'));
});
gulp.task('deploy', function(callback) {
    return runSequence('clean', 'build:css', 'build:js', 'build:images', 'build:components', 'build:html');
});