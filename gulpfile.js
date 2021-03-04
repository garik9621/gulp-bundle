const {series, dest, src, watch, parallel} = require("gulp");
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const rigger = require('gulp-rigger');
const cleanPlugin = require('gulp-clean');

const paths = {
    src: {
        sass: './src/sass/**/*.scss',
        html: './src/html/**/*.html',
        js: './src/js/**/*.js'
    },
    build: {
        sass: './build/css',
        html: './build/html',
        js: './build/js'
    },
    clean: './build/**/*',
    watching: {
        sass: './src/sass/**/*.scss',
        html: './src/html/**/*.html',
        js: './src/js/**/*.js',
    },
    vendor: {
		js: [
			'./node_modules/vue/dist/vue.js',
		]
	},
}

function clean() {
    return src(paths.clean)
    .pipe(cleanPlugin())
}

function serverInit() {
    browserSync.init({
        server: {
            baseDir: [
                './',
                './build/html'
            ],
            logLevel: 'debug',
        },
        ghostMode: false
    })
}

function reload(cb) {

    browserSync.reload();

    cb();
}

function copyJs() {
    return src(paths.src.js)
    .pipe(dest(paths.build.js))
}

function copySideModules() {
	return src(paths.vendor.js)
		.pipe(dest(paths.build.js))
}

function buildCss() {

    return src(paths.src.sass)
    .pipe(sass())
    .pipe(dest(paths.build.sass))
    .pipe(browserSync.stream())
}

function buildHtml() {
    return src('./src/html/index.html')
    .pipe(dest('./build/html'))
}

function watcher(cb) {
    watch([paths.watching.sass], series(buildCss));
    watch([paths.watching.html], series(buildHtml, reload));
    watch([paths.watching.js], series(copyJs, reload));

    cb();
}

const build = series(
    clean,
    watcher,
    parallel(
        buildCss,
        buildHtml
    ),
    parallel(
        copyJs,
        copySideModules
    )
);

exports.build = build;
exports.serve = serverInit;
exports.buildCss = buildCss;
exports.buildHtml = buildHtml;
exports.copyJs = copyJs;
exports.watcher = watcher;
exports.default = series(build, series(serverInit, watcher))