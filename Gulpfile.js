var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    args = require('yargs').argv,
    config = require('./gulp.config')(),
    port = config.defaultPort;

var $ = require('gulp-load-plugins')({lazy: true}),
    del = require('del');

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('fonts', ['clean-fonts'], function () {
    log('Copying fonts____');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'))
});

gulp.task('images', ['clean-images'], function () {
    log('Copying and compressing images____');

    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'))
});


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

gulp.task('clean', function (cb) {
    var delConfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.red(delConfig));
    return del(delConfig, cb)
});

gulp.task('clean-styles', function (cb) {
    return clean(config.temp + '**/*.css', cb);
});

gulp.task('clean-fonts', function (cb) {
    return clean(config.build + 'fonts/**/*.*', cb);
});

gulp.task('clean-images', function (cb) {
    return clean(config.build + 'images/**/*.*', cb);
});

gulp.task('clean-code', function (cb) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    return clean(files, cb);
});

gulp.task('less-watchers', function () {
    gulp.watch(config.less, ['styles']);
});

gulp.task('wiredep', function () {
    log('Inject bower css&js and app js');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    log('Inject app css');

    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('templatecache', ['clean-code'], function () {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('optimize', ['inject'], function () {
    log('Optimizing the js, css, html');

    var templateCache = config.temp + config.templateCache.file,
        assets = $.useref.assets({searchPath: './'}),
        cssFilter = $.filter('**/*.css', { restore: true }),
        jsLibFilter = $.filter('**/lib.js', { restore: true }),
        jsAppFilter = $.filter('**/app.js', { restore: true });

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- templates:js -->'
        }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore)
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore)
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsAppFilter.restore)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.build));
});

gulp.task('serve-dev', ['inject'], function () {
    serve(true);
});

gulp.task('serve-build', ['optimize'], function () {
    serve(false);
});
///////////////////
function serve(isDev) {

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart: \n' + ev);
            setTimeout(function () {
                browserSync.notify('reloading now....');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay)
        })
        .on('start', function () {
            log('*** nodemon started');
            startBrowserSync();
        })
        .on('crash', function () {
            log('*** nodemon crashed');
        })
        .on('exit', function () {
            log('*** nodemon exit');
        });
}


function changeEvent(ev) {
    var scrPattern = new RegExp('/.*(?=/' + config.client + ')/');
    log('File ' + ev.path.replace(scrPattern, '') + ' ' + ev.type);
}

function startBrowserSync(isDev) {

    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port' + port);

    if(isDev){
        gulp.watch([config.less], ['styles'])
            .on('change', function (ev) {
                changeEvent(ev);
            });
    } else {
        gulp.watch([config.less], ['styles'])
            .on('change', function (ev) {
                changeEvent(ev);
            });
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function (ev) {
                changeEvent(ev);
            });

    }


    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

    browserSync(options);
}

function clean(path, cb) {
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
