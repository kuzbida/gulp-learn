var gulp = require('gulp'),
    args = require('yargs').argv,
    config = require('./gulp.config')();

var $ = require('gulp-load-plugins')({lazy: true}),
    del = require('del');


gulp.task('validateJs', function () {
    log('Analyze js source with JSHint and JSCS');

    return gulp.src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));

});

gulp.task('styles', ['clean-styles'], function () {
    log('Compile less ---> css');

    return gulp.src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '>5%']}))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function (cb) {
    var files = config.temp + '**/*.css';
    return clean(files, cb);
});

gulp.task('less-watchers', function () {
    gulp.watch(config.less, ['styles']);
});

///////////////////

function clean(path, cb){
    log('Cleaning ' + path);
    return del(path, cb);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
