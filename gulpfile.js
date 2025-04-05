const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const { deleteAsync } = require('del');
const browserSync = require('browser-sync').create();

// Paths
const paths = {
    src: {
        scss: 'src/scss/**/*.scss',
        js: 'src/js/**/*.js',
        html: 'src/html/**/*.html',
        images: 'src/images/**/*',
        fonts: 'src/fonts/**/*',
        vendor: {
            js: [
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
                'node_modules/simplebar/dist/simplebar.min.js',
                'node_modules/feather-icons/dist/feather.min.js',
                'node_modules/datatables.net/js/jquery.dataTables.min.js',
                'node_modules/datatables.net-bs5/js/dataTables.bootstrap5.min.js',
                'node_modules/datatables.net-responsive/js/dataTables.responsive.min.js',
                'node_modules/apexcharts/dist/apexcharts.min.js',
                'node_modules/dropzone/dist/min/dropzone.min.js'
            ],
            css: [
                'node_modules/bootstrap/dist/css/bootstrap.min.css',
                'node_modules/datatables.net-bs5/css/dataTables.bootstrap5.min.css',
                'node_modules/datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css',
                'node_modules/dropzone/dist/min/dropzone.min.css'
            ]
        }
    },
    dist: {
        css: 'dist/css',
        js: 'dist/js',
        html: 'dist',
        images: 'dist/images',
        fonts: 'dist/fonts',
        vendor: {
            js: 'dist/js/vendor',
            css: 'dist/css'
        }
    }
};

// Clean dist directory
async function clean() {
    await deleteAsync(['dist']);
}

// Copy vendor JS files
function vendorJs() {
    return gulp.src(paths.src.vendor.js)
        .pipe(gulp.dest(paths.dist.vendor.js));
}

// Copy vendor CSS files
function vendorCss() {
    return gulp.src(paths.src.vendor.css)
        .pipe(gulp.dest(paths.dist.vendor.css));
}

// Compile SCSS to CSS
function styles() {
    return gulp.src(paths.src.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.stream());
}

// Bundle and minify JavaScript
function scripts() {
    return gulp.src(paths.src.js)
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
}

// Copy HTML files
function html() {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dist.html))
        .pipe(browserSync.stream());
}

// Optimize images
function images() {
    return gulp.src(paths.src.images)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.dist.images));
}

// Copy fonts
function fonts() {
    return gulp.src(paths.src.fonts)
        .pipe(gulp.dest(paths.dist.fonts));
}

// Watch for changes
function watch() {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch(paths.src.scss, styles);
    gulp.watch(paths.src.js, scripts);
    gulp.watch(paths.src.html, html);
    gulp.watch(paths.src.images, images);
    gulp.watch(paths.src.fonts, fonts);
}

// Build task
const build = gulp.series(
    clean,
    gulp.parallel(
        vendorJs,
        vendorCss,
        styles,
        scripts,
        html,
        images,
        fonts
    )
);

// Default task
exports.default = gulp.series(build, watch);
exports.build = build;
exports.watch = watch; 