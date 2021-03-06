var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'postcss-*', 'ydcss-*'],
        rename: {
            'ydcss-rem2px': 'rem2px',
            'postcss-px2rem': 'px2rem'
        }
    });

var pkg = require('./package.json');

//淘宝flexible配置
var flexible = {
    url: 'http://g.tbcdn.cn/mtb/lib-flexible/0.3.4/flexible.js',
    isUse: false//是否使用淘宝的flexible
};

//注释信息
var banner = [
    '/*! <%= pkg.title %> v<%= pkg.version %>',
    'by YDCSS',
    '(c) ' + $.util.date(Date.now(), 'UTC:yyyy'),
    'Licensed <%= pkg.license %>',
    $.util.date(Date.now(), 'isoDateTime') + ' */ \n'
].join(' ');

gulp.task('less', function () {
    var _stream = gulp.src(['src/less/{ydui,example}.less']);
    if (flexible.isUse) {
        return _stream.pipe($.less())
            .pipe($.rem2px())//将已存在rem转成px
            .pipe($.postcss([$.px2rem({remUnit: 75})]))//将px转成flexible rem
            .pipe($.autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'], cascade: false, remove: true
            }))
            .pipe(gulp.dest('src/css'))
            .pipe($.livereload());
    } else {
        return _stream.pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
            .pipe($.less())
            .pipe($.autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'], cascade: false, remove: true
            }))
            .pipe(gulp.dest('src/css'))
            .pipe($.livereload());
    }
});

gulp.task('watch', function () {
    $.livereload.listen();
    gulp.watch('src/less/**', ['less']);
});

gulp.task('build:cssmin', ['less'], function () {
    gulp.src('src/css/ydui.css')
        .pipe($.cleanCss())
        .pipe($.header(banner, {pkg: pkg}))
        .pipe(gulp.dest('dist/build/css'));
});

gulp.task('build:uglify', function () {
    gulp.src(['src/js/{util.js,yd_flexible.js}'])
        .pipe($.uglify())
        .pipe($.header(banner, {pkg: pkg}))
        .pipe(gulp.dest('dist/build/js'));
});

gulp.task('example:css', function () {
    var _stream = gulp.src(['src/less/{ydui,example}.less']);
    if (flexible.isUse) {
        _stream.pipe($.less())
            .pipe($.rem2px())//将已存在rem转成px
            .pipe($.postcss([$.px2rem({remUnit: 75})]))//将px转成flexible rem
            .pipe($.autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'], cascade: false, remove: true
            }))
            .pipe(gulp.dest('dist/example/css'));
    } else {
        _stream.pipe($.sourcemaps.init())
            .pipe($.less())
            .pipe($.autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'], cascade: false, remove: true
            }))
            .pipe($.sourcemaps.write('./'))
            .pipe(gulp.dest('dist/example/css'));
    }
});

gulp.task('example:html', function () {
    var _stream = gulp.src(['src/html/*.html', 'src/index.html', 'src/libs/**/*.html'], {base: 'src'});
    if (flexible.isUse) {
        _stream.pipe($.htmlReplace({
            'tb_flexible': flexible.url
        })).pipe(gulp.dest('dist/example'));
    } else {
        _stream.pipe(gulp.dest('dist/example'));
    }
});

gulp.task('example:uglify', function () {
    gulp.src(['src/js/*.js'])
        .pipe($.uglify())
        .pipe(gulp.dest('dist/example/js'));
});

gulp.task('example:libs', function () {
    gulp.src(['src/libs/**/*.js'])
        .pipe($.uglify())
        .pipe(gulp.dest('dist/example/libs'));
});

gulp.task('example', ['example:css', 'example:uglify', 'example:html', 'example:libs']);

gulp.task('default', ['build:cssmin', 'build:uglify']);