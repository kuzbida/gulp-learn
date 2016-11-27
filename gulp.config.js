module.exports = function () {
    var client = './src/client/',
        server = './src/server/',
        clientApp = client + 'app/',
        temp = './.tmp/',
        root = './',
        report = './report/',
        wiredep = require('wiredep'),
        bowerFiles = wiredep({devDependencies: true})['js'];

    var config = {
        root: root,
        temp: temp,
        build: './build/',
        client: client,
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js' /*TO EXCLUDE SOME FILES*/
        ],
        alljs: [
            client + '**/*.js',
            '*.js'
        ],
        html: clientApp + '**/*.html',
        htmltemplates: client + '**/*.html',
        css: temp + 'styles.css',
        less: client + 'styles/styles.less',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        images: client + 'images/**/*.*',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },

        packages: [
            './package.json',
            './bower.json'
        ],
        getWiredepDefaultOptions: getWiredepDefaultOptions,

        /*
        * Optimized files
        * */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /*Node settings*/
        server: server,
        defaultPort: 7203,
        nodeServer: './src/server/app.js',
        browserReloadDelay: 1000

        /*Template cache settings*/
        ,
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }

        },

        /*KARMA CONFIGS*/
        report: report,
        serverIntegrationSpec: [client + 'tests/server-integration/**/*.spec.js'],
        karma: getKarmaOptions()
    };

    return config;

    function getWiredepDefaultOptions() {
        return {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        }
    }

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpec
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];

        return options;

    }
};
